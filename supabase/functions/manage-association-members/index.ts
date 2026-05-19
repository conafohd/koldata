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

type ApprovalEmailResult =
  | {
    status: 'sent'
  }
  | {
    status: 'skipped'
    reason: 'smtp_not_configured'
  }
  | {
    status: 'failed'
  }

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization header' }, 401)
    }

    const accessToken = authHeader.replace(/^Bearer\s+/i, '').trim()
    if (!accessToken) {
      return jsonResponse({ error: 'Missing bearer token' }, 401)
    }

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser(accessToken)

    if (authError || !user) {
      console.error('manage-association-members auth failed', {
        message: authError?.message ?? null,
        status: authError?.status ?? null,
        hasUser: Boolean(user),
      })
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }

    const { action, memberId, associationId } = await req.json() as {
      action?: Action
      memberId?: string
      associationId?: string
    }

    if (!action || !memberId || !associationId) {
      console.warn('[manage-association-members] bad request: missing required fields', {
        hasAction: Boolean(action),
        hasMemberId: Boolean(memberId),
        hasAssociationId: Boolean(associationId),
      })
      return jsonResponse({ error: 'Missing required fields' }, 400)
    }

    if (!['approve', 'delete'].includes(action)) {
      console.warn('[manage-association-members] bad request: unsupported action', {
        action,
        memberId,
        associationId,
      })
      return jsonResponse({ error: 'Unsupported action' }, 400)
    }

    const { data: actorProfile, error: actorError } = await adminClient
      .from('user_profiles')
      .select('id, role, edit_association_id')
      .eq('id', user.id)
      .single()

    if (actorError || !actorProfile) {
      return jsonResponse({ error: 'Unable to load actor profile' }, 403)
    }

    const canManageAssociation =
      actorProfile.role === 'admin'
      || (actorProfile.role === 'editor' && actorProfile.edit_association_id === associationId)

    if (!canManageAssociation) {
      return jsonResponse({ error: 'Forbidden' }, 403)
    }

    const { data: targetProfileData, error: targetError } = await adminClient
      .from('user_profiles')
      .select('id, email, first_name, last_name, role, edit_association_id')
      .eq('id', memberId)
      .single()

    const targetProfile = targetProfileData as UserProfile | null

    if (targetError || !targetProfile) {
      return jsonResponse({ error: 'User not found' }, 404)
    }

    if (targetProfile.edit_association_id !== associationId) {
      return jsonResponse({ error: 'User not linked to this association' }, 403)
    }

    if (!['pending', 'reader'].includes(targetProfile.role)) {
      console.warn('[manage-association-members] bad request: unsupported target role', {
        action,
        memberId,
        associationId,
        targetRole: targetProfile.role,
      })
      return jsonResponse({ error: 'Unsupported target role' }, 400)
    }

    let approvalEmailResult: ApprovalEmailResult | null = null

    if (action === 'approve') {
      if (targetProfile.role !== 'pending') {
        console.warn('[manage-association-members] bad request: approving non-pending user', {
          memberId,
          associationId,
          targetRole: targetProfile.role,
        })
        return jsonResponse({ error: 'Only pending users can be approved' }, 400)
      }

      const { error: updateError } = await adminClient
        .from('user_profiles')
        .update({ role: 'reader' })
        .eq('id', memberId)

      if (updateError) {
        throw updateError
      }

      try {
        approvalEmailResult = await sendApprovalEmail(
          targetProfile.email,
          `${targetProfile.first_name} ${targetProfile.last_name}`.trim(),
        )
      } catch (emailError) {
        approvalEmailResult = { status: 'failed' }
        console.error('Approval email notification failed', {
          memberId,
          message: emailError instanceof Error ? emailError.message : 'Unknown error',
        })
      }
    }

    if (action === 'delete') {
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(memberId)

      if (deleteError) {
        throw deleteError
      }
    }

    return jsonResponse({ success: true, email: approvalEmailResult }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    return jsonResponse({ error: message }, 500)
  }
})

async function sendApprovalEmail(email: string, fullName: string) {
  const transporter = createMailerTransport()
  if (!transporter) {
    console.warn('SMTP_HOST is not configured, skipping approval email notification')
    return {
      status: 'skipped',
      reason: 'smtp_not_configured',
    } satisfies ApprovalEmailResult
  }

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

  return { status: 'sent' } satisfies ApprovalEmailResult
}

function createMailerTransport() {
  const mailMode = Deno.env.get('MAIL_MODE')?.trim().toLowerCase()
  const configuredHost = Deno.env.get('SMTP_HOST')?.trim()
  const isCaptureMode = mailMode === 'mailpit' || mailMode === 'inbucket'
  const host = configuredHost || (isCaptureMode ? 'inbucket' : undefined)
  if (!host) {
    return null
  }

  const user = Deno.env.get('SMTP_USER')?.trim()
  const pass = Deno.env.get('SMTP_PASS')
  const defaultPort = mailMode === 'mailpit' ? '1025' : mailMode === 'inbucket' ? '54325' : '587'
  const port = Number(Deno.env.get('SMTP_PORT') || defaultPort)
  const isLocalCaptureHost = ['inbucket', 'mailpit', 'localhost', '127.0.0.1'].includes(host)
  const secure = !isLocalCaptureHost
    && (Deno.env.get('SMTP_SECURE')?.trim().toLowerCase() === 'true' || port === 465)

  const transportConfig = {
    host,
    port,
    secure,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: !isLocalCaptureHost && user && pass ? { user, pass } : undefined,
  }

  return nodemailer.createTransport(transportConfig)
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
