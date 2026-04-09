import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import nodemailer from 'npm:nodemailer'
import { createClient } from 'npm:@supabase/supabase-js@2'

type Action = 'approve' | 'delete'

type UserProfile = {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'admin' | 'editor' | 'reader' | 'creator' | 'pending'
  edit_association_id: string | null
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      },
    )

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { action, memberId, associationId } = await req.json() as {
      action?: Action
      memberId?: string
      associationId?: string
    }

    if (!action || !memberId || !associationId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: actorProfile, error: actorError } = await adminClient
      .from('user_profiles')
      .select('id, role, edit_association_id')
      .eq('id', user.id)
      .single()

    if (actorError || !actorProfile) {
      return new Response(JSON.stringify({ error: 'Unable to load actor profile' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const canManageAssociation =
      actorProfile.role === 'admin'
      || (actorProfile.role === 'editor' && actorProfile.edit_association_id === associationId)

    if (!canManageAssociation) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: targetProfileData, error: targetError } = await adminClient
      .from('user_profiles')
      .select('id, email, first_name, last_name, role, edit_association_id')
      .eq('id', memberId)
      .single()

    const targetProfile = targetProfileData as UserProfile | null

    if (targetError || !targetProfile) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (targetProfile.edit_association_id !== associationId) {
      return new Response(JSON.stringify({ error: 'User not linked to this association' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!['pending', 'reader'].includes(targetProfile.role)) {
      return new Response(JSON.stringify({ error: 'Unsupported target role' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'approve') {
      if (targetProfile.role !== 'pending') {
        return new Response(JSON.stringify({ error: 'Only pending users can be approved' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error: updateError } = await adminClient
        .from('user_profiles')
        .update({ role: 'reader' })
        .eq('id', memberId)

      if (updateError) {
        throw updateError
      }

      await sendApprovalEmail(targetProfile.email, `${targetProfile.first_name} ${targetProfile.last_name}`.trim())
    }

    if (action === 'delete') {
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(memberId)

      if (deleteError) {
        throw deleteError
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function sendApprovalEmail(email: string, fullName: string) {
  const transporter = nodemailer.createTransport({
    host: Deno.env.get('SMTP_HOST') ?? 'inbucket',
    port: Number(Deno.env.get('SMTP_PORT') ?? '1025'),
    secure: false,
  })

  await transporter.sendMail({
    from: Deno.env.get('MAIL_FROM') ?? 'dev@local.test',
    to: email,
    subject: 'KolData - Account approved / Compte valide',
    text: `Hello ${fullName || ''},

Your registration on KolData has been approved by the focal point of your association.

You can now sign in to the platform and access your NGO information.

Best regards,
The KolData team

---

Bonjour ${fullName || ''},

Votre inscription a KolData a ete acceptee par le point focal de votre association.

Vous pouvez maintenant vous connecter a la plateforme et consulter les informations de votre ONG.

Cordialement,
L'equipe KolData`,
    html: `
      <div style="margin:0;padding:0;background-color:#f6f7fb;font-family:Arial,sans-serif;color:#1f2937;">
        <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
          <div style="background:#ffffff;border-radius:12px;padding:40px 32px;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
            <h1 style="margin:0 0 24px;font-size:24px;line-height:1.3;color:#111827;">
              Account approved / Compte valide
            </h1>
            <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
              Hello ${escapeHtml(fullName || '')},
            </p>
            <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
              Your registration on <strong>KolData</strong> has been approved by the focal point of your association.
            </p>
            <p style="margin:0 0 24px;font-size:16px;line-height:1.7;">
              You can now sign in to the platform and access your NGO information.
            </p>
            <div style="margin:32px 0;padding-top:24px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#4b5563;">
                Best regards,<br />
                <strong>The KolData team</strong>
              </p>
            </div>
            <div style="padding-top:24px;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
                Bonjour ${escapeHtml(fullName || '')},
              </p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
                Votre inscription a <strong>KolData</strong> a ete acceptee par le point focal de votre association.
              </p>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.7;">
                Vous pouvez maintenant vous connecter a la plateforme et consulter les informations de votre ONG.
              </p>
              <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;">
                <p style="margin:0;font-size:15px;line-height:1.6;color:#4b5563;">
                  Cordialement,<br />
                  <strong>L'equipe KolData</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  })
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
