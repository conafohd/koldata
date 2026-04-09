import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import nodemailer from 'npm:nodemailer'
import { createClient } from 'npm:@supabase/supabase-js@2'

serve(async (req) => {

    const authHeader = req.headers.get('x-supabase-functions')

    console.log('authHeader raw:', JSON.stringify(authHeader))
    console.log('expected raw:', JSON.stringify(`${Deno.env.get('WEBHOOK_SECRET')}`))


    if (authHeader !== `${Deno.env.get('WEBHOOK_SECRET')}`) {
      console.log('fucking WEBHOOK_SECRET')
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const record = body.record

    const associationId = record.edit_association_id
    const role = record.role
    const associationMembersUrl = getAssociationMembersUrl(associationId)

    console.log(associationId);
    if (role !== 'pending') {
      return new Response(JSON.stringify({ skip: true }), { status: 200 })
    }
    console.log('pending');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    if (!associationId) {
      return new Response(JSON.stringify({
        error: 'associationId required'
      }), { status: 400 })
    }

    const { data: email, error } = await supabase.rpc(
      'get_association_editor_email',
      { p_association_id: associationId }
    )

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    if (!email) {
      return new Response(JSON.stringify({ error: 'No editor found' }), { status: 404 })
    }


    const transporter = nodemailer.createTransport({
        host: Deno.env.get('SMTP_HOST') ?? 'inbucket',
        port: Number(Deno.env.get('SMTP_PORT') ?? '1025'),
        secure: false,
      })

      await transporter.sendMail({
  from: Deno.env.get('MAIL_FROM') ?? 'dev@local.test',
  to: email,
  subject: 'KolData - Registration pending approval / Inscription à valider',
  text: `Hello,

A new registration request for your association is waiting for approval on KolData.

You can review and process it here:
${associationMembersUrl}

Best regards,
The KolData team

---

Bonjour,

Une nouvelle demande d'inscription à votre association est en attente de validation sur KolData.

Vous pouvez la consulter et la traiter ici :
${associationMembersUrl}

Cordialement,
L'équipe KolData`,
  html: `
    <div style="margin:0;padding:0;background-color:#f6f7fb;font-family:Arial,sans-serif;color:#1f2937;">
      <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
        <div style="background:#ffffff;border-radius:12px;padding:40px 32px;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
          <h1 style="margin:0 0 24px;font-size:24px;line-height:1.3;color:#111827;">
            Registration pending approval / Inscription à valider
          </h1>

          <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
            Hello,
          </p>

          <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
            A new registration request for your association is waiting for approval on <strong>KolData</strong>.
          </p>

          <p style="margin:0 0 24px;font-size:16px;line-height:1.7;">
            You can review and process it from the user management page.
          </p>

          <div style="margin:24px 0 32px;">
            <a
              href="${associationMembersUrl}"
              style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:10px;font-size:16px;font-weight:600;"
            >
              Open user management
            </a>
          </div>

          <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#6b7280;">
            If the button does not work, copy and paste this link into your browser:<br />
            <a href="${associationMembersUrl}" style="color:#2563eb;word-break:break-all;">${associationMembersUrl}</a>
          </p>

          <div style="margin:32px 0;padding-top:24px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:15px;line-height:1.6;color:#4b5563;">
              Best regards,<br />
              <strong>The KolData team</strong>
            </p>
          </div>

          <div style="padding-top:24px;border-top:1px solid #e5e7eb;">
            <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
              Bonjour,
            </p>

            <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
              Une nouvelle demande d'inscription à votre association est en attente de validation sur <strong>KolData</strong>.
            </p>

            <p style="margin:0 0 24px;font-size:16px;line-height:1.7;">
              Vous pouvez la consulter et la traiter depuis la page de gestion des utilisateurs.
            </p>

            <div style="margin:24px 0 32px;">
              <a
                href="${associationMembersUrl}"
                style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:10px;font-size:16px;font-weight:600;"
              >
                Ouvrir la gestion des utilisateurs
              </a>
            </div>

            <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#6b7280;">
              Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br />
              <a href="${associationMembersUrl}" style="color:#2563eb;word-break:break-all;">${associationMembersUrl}</a>
            </p>

            <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#4b5563;">
                Cordialement,<br />
                <strong>L'équipe KolData</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})

     await transporter.sendMail({
  from: Deno.env.get('MAIL_FROM') ?? 'dev@local.test',
  to: record.email,
  subject: 'KolData - Registration received / Confirmation de votre inscription',
  text: `Hello,

Thank you for registering on KolData.

Your request has been received. The focal point of your association will now review and validate your registration.

Once your account has been approved, you will receive another email confirming that you can access the platform.

If you did not initiate this request, you can ignore this message.

Best regards,
The KolData team

---

Bonjour,

Merci de votre inscription à KolData.

Votre demande a bien été prise en compte. Le point focal de votre association va maintenant examiner et valider votre inscription.

Une fois votre compte validé, vous recevrez un nouvel e-mail vous confirmant que vous pouvez accéder à la plateforme.

Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message.

Cordialement,
L'équipe KolData`,
  html: `
    <div style="margin:0;padding:0;background-color:#f6f7fb;font-family:Arial,sans-serif;color:#1f2937;">
      <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
        <div style="background:#ffffff;border-radius:12px;padding:40px 32px;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
          <h1 style="margin:0 0 24px;font-size:24px;line-height:1.3;color:#111827;">
            Registration received / Confirmation de votre inscription à KolData
          </h1>

          <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
            Hello,
          </p>

          <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
            Thank you for registering on <strong>KolData</strong>.
          </p>

          <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
            Your request has been received. The focal point of your association will now review and validate your registration.
          </p>

          <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
            Once your account has been approved, you will receive another email confirming that you can access the platform.
          </p>

          <p style="margin:0 0 24px;font-size:16px;line-height:1.7;">
            If you did not initiate this request, you can ignore this message.
          </p>

          <div style="margin:32px 0;padding-top:24px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:15px;line-height:1.6;color:#4b5563;">
              Best regards,<br />
              <strong>The KolData team</strong>
            </p>
          </div>

          <div style="padding-top:24px;border-top:1px solid #e5e7eb;">
            <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
              Bonjour,
            </p>

            <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
              Merci de votre inscription à <strong>KolData</strong>.
            </p>

            <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
              Votre demande a bien été prise en compte. Le point focal de votre association va maintenant examiner et valider votre inscription.
            </p>

            <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
              Une fois votre compte validé, vous recevrez un nouvel e-mail vous confirmant que vous pouvez accéder à la plateforme.
            </p>

            <p style="margin:0 0 24px;font-size:16px;line-height:1.7;">
              Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message.
            </p>

            <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#4b5563;">
                Cordialement,<br />
                <strong>L'équipe KolData</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})

      return new Response(JSON.stringify({
        success: true,
        mode: 'mailpit',
        sentTo: email
      }), { status: 200 })
})

function getAssociationMembersUrl(associationId: string | null) {
  const appUrl = (
    Deno.env.get('APP_URL')
    ?? Deno.env.get('SITE_URL')
    ?? Deno.env.get('PUBLIC_APP_URL')
    ?? Deno.env.get('FRONTEND_URL')
    ?? 'http://localhost:8001'
  ).replace(/\/+$/, '')

  const basePath = (Deno.env.get('APP_BASE_PATH') ?? Deno.env.get('VITE_BASE_PATH') ?? '/')
    .replace(/\/?$/, '/')

  if (!associationId) {
    return `${appUrl}${basePath}associations`
  }

  return `${appUrl}${basePath}associations/${associationId}?tab=members`
}
