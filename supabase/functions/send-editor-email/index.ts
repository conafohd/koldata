import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import nodemailer from 'npm:nodemailer'
import { createClient } from 'npm:@supabase/supabase-js@2'

type SignupRecord = {
  edit_association_id?: string | null
  email?: string | null
  first_name?: string | null
  last_name?: string | null
  role?: string | null
}

serve(async (req) => {
  try {
    const authHeader = req.headers.get('x-supabase-functions')
    const expectedSecret = `${Deno.env.get('WEBHOOK_SECRET')}`

    console.log('[send-editor-email] request received', {
      method: req.method,
      hasAuthHeader: Boolean(authHeader),
      authHeaderLength: authHeader?.length ?? 0,
      expectedSecretLength: expectedSecret.length,
    })

    if (authHeader !== expectedSecret) {
      console.warn('[send-editor-email] unauthorized request', {
        authHeaderPreview: authHeader?.slice(0, 6) ?? null,
        expectedPreview: expectedSecret.slice(0, 6),
      })
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const record = (body.record ?? {}) as SignupRecord

    console.log('[send-editor-email] payload parsed', {
      type: body.type ?? null,
      table: body.table ?? null,
      schema: body.schema ?? null,
      role: record.role ?? null,
      email: record.email ?? null,
      editAssociationId: record.edit_association_id ?? null,
      firstName: record.first_name ?? null,
      lastName: record.last_name ?? null,
    })

    const transporter = createMailerTransport()
    if (!transporter) {
      console.warn('[send-editor-email] SMTP transport unavailable, skipping notifications', {
        smtpHost: Deno.env.get('SMTP_HOST') ?? null,
        smtpPort: Deno.env.get('SMTP_PORT') ?? null,
        mailFrom: Deno.env.get('MAIL_FROM') ?? null,
      })
      return new Response(JSON.stringify({
        success: true,
        mode: 'skipped',
        reason: 'smtp_not_configured',
      }), { status: 200 })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    console.log('[send-editor-email] creating supabase client', {
      supabaseUrl,
      hasServiceRoleKey: Boolean(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')),
    })

    const supabase = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    if (record.role === 'pending') {
      console.log('[send-editor-email] handling pending signup')
      return await handlePendingSignup(record, supabase, transporter)
    }

    if (record.role === 'creator') {
      console.log('[send-editor-email] handling creator signup')
      return await handleCreatorSignup(record, supabase, transporter)
    }

    console.log('[send-editor-email] skipping unsupported role', {
      role: record.role ?? null,
    })

    return new Response(JSON.stringify({
      skip: true,
      reason: 'unsupported_role',
    }), { status: 200 })
  } catch (error) {
    console.error('[send-editor-email] unhandled error', serializeError(error))
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { status: 500 })
  }
})

async function handlePendingSignup(
  record: SignupRecord,
  supabase: ReturnType<typeof createClient>,
  transporter: nodemailer.Transporter,
) {
  const associationId = record.edit_association_id
  console.log('[send-editor-email] pending signup start', {
    associationId,
    userEmail: record.email ?? null,
  })

  if (!associationId) {
    console.error('[send-editor-email] missing associationId for pending signup')
    return new Response(JSON.stringify({
      error: 'associationId required',
    }), { status: 400 })
  }

  const associationMembersUrl = getAssociationMembersUrl(associationId)
  console.log('[send-editor-email] association members url built', {
    associationMembersUrl,
  })

  const { data: email, error } = await supabase.rpc(
    'get_association_editor_email',
    { p_association_id: associationId },
  )

  if (error) {
    console.error('[send-editor-email] get_association_editor_email failed', {
      associationId,
      error: error.message,
      details: 'details' in error ? error.details : null,
      hint: 'hint' in error ? error.hint : null,
    })
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  console.log('[send-editor-email] editor email lookup result', {
    associationId,
    editorEmail: email ?? null,
  })

  if (!email) {
    console.error('[send-editor-email] no editor found for association', {
      associationId,
    })
    return new Response(JSON.stringify({ error: 'No editor found' }), { status: 404 })
  }

  console.log('[send-editor-email] sending editor notification', {
    to: email,
    subject: 'KolData - Registration pending approval / Inscription à valider',
  })

  const editorMailInfo = await transporter.sendMail({
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

            <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Hello,</p>

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
              <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Bonjour,</p>

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

  console.log('[send-editor-email] editor notification sent', {
    messageId: editorMailInfo.messageId ?? null,
    accepted: editorMailInfo.accepted ?? [],
    rejected: editorMailInfo.rejected ?? [],
    response: editorMailInfo.response ?? null,
  })

  console.log('[send-editor-email] sending user confirmation', {
    to: record.email ?? null,
    subject: 'KolData - Registration received / Confirmation de votre inscription',
  })

  const userMailInfo = await transporter.sendMail({
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

            <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Hello,</p>

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
              <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Bonjour,</p>

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

  console.log('[send-editor-email] user confirmation sent', {
    messageId: userMailInfo.messageId ?? null,
    accepted: userMailInfo.accepted ?? [],
    rejected: userMailInfo.rejected ?? [],
    response: userMailInfo.response ?? null,
  })

  return new Response(JSON.stringify({
    success: true,
    mode: 'pending',
    sentTo: email,
  }), { status: 200 })
}

async function handleCreatorSignup(
  record: SignupRecord,
  supabase: ReturnType<typeof createClient>,
  transporter: nodemailer.Transporter,
) {
  const creatorName = formatFullName(record.first_name, record.last_name)
  console.log('[send-editor-email] creator signup start', {
    creatorName,
    userEmail: record.email ?? null,
  })

  const { data: adminEmails, error } = await supabase.rpc('get_verified_admin_emails')

  if (error) {
    console.error('[send-editor-email] get_verified_admin_emails failed', {
      error: error.message,
      details: 'details' in error ? error.details : null,
      hint: 'hint' in error ? error.hint : null,
    })
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  console.log('[send-editor-email] verified admin emails lookup result', {
    count: adminEmails?.length ?? 0,
    adminEmails,
  })

  const recipients = (adminEmails ?? [])
    .map((entry: { email: string | null }) => entry.email?.trim())
    .filter((email): email is string => Boolean(email))

  if (recipients.length === 0) {
    console.error('[send-editor-email] no verified admins found')
    return new Response(JSON.stringify({ error: 'No verified admins found' }), { status: 404 })
  }

  console.log('[send-editor-email] sending creator signup notification', {
    to: recipients,
    subject: 'KolData - New creator signup / Nouvelle inscription creator',
  })

  const creatorMailInfo = await transporter.sendMail({
    from: Deno.env.get('MAIL_FROM') ?? 'dev@local.test',
    to: recipients,
    subject: 'KolData - New creator signup / Nouvelle inscription creator',
    text: `Hello,

A new creator account has just been created on KolData.

User details:
- Name: ${creatorName}
- Email: ${record.email ?? 'Unknown'}

Best regards,
The KolData team

---

Bonjour,

Un nouveau compte creator vient d'etre cree sur KolData.

Informations utilisateur :
- Nom : ${creatorName}
- Email : ${record.email ?? 'Inconnu'}

Cordialement,
L'equipe KolData`,
    html: `
      <div style="margin:0;padding:0;background-color:#f6f7fb;font-family:Arial,sans-serif;color:#1f2937;">
        <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
          <div style="background:#ffffff;border-radius:12px;padding:40px 32px;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
            <h1 style="margin:0 0 24px;font-size:24px;line-height:1.3;color:#111827;">
              New creator signup / Nouvelle inscription creator
            </h1>

            <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Hello,</p>

            <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
              A new creator account has just been created on <strong>KolData</strong>.
            </p>

            <p style="margin:0 0 8px;font-size:16px;line-height:1.7;">User details:</p>

            <ul style="margin:0 0 24px 20px;padding:0;font-size:16px;line-height:1.8;">
              <li><strong>Name:</strong> ${escapeHtml(creatorName)}</li>
              <li><strong>Email:</strong> ${escapeHtml(record.email ?? '')}</li>
            </ul>

            <div style="margin:32px 0;padding-top:24px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#4b5563;">
                Best regards,<br />
                <strong>The KolData team</strong>
              </p>
            </div>

            <div style="padding-top:24px;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Bonjour,</p>

              <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
                Un nouveau compte creator vient d'etre cree sur <strong>KolData</strong>.
              </p>

              <p style="margin:0 0 8px;font-size:16px;line-height:1.7;">Informations utilisateur :</p>

              <ul style="margin:0 0 24px 20px;padding:0;font-size:16px;line-height:1.8;">
                <li><strong>Nom :</strong> ${escapeHtml(creatorName)}</li>
                <li><strong>Email :</strong> ${escapeHtml(record.email ?? '')}</li>
              </ul>

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

  console.log('[send-editor-email] creator signup notification sent', {
    messageId: creatorMailInfo.messageId ?? null,
    accepted: creatorMailInfo.accepted ?? [],
    rejected: creatorMailInfo.rejected ?? [],
    response: creatorMailInfo.response ?? null,
  })

  return new Response(JSON.stringify({
    success: true,
    mode: 'creator',
    sentTo: recipients,
  }), { status: 200 })
}

function createMailerTransport() {
  const host = Deno.env.get('SMTP_HOST')?.trim()
  if (!host) {
    return null
  }

  const user = Deno.env.get('SMTP_USER')?.trim()
  const pass = Deno.env.get('SMTP_PASS')

  const transportConfig = {
    host,
    port: Number(Deno.env.get('SMTP_PORT') ?? '587'),
    secure: false,
    connectionTimeout: 3000,
    greetingTimeout: 3000,
    socketTimeout: 5000,
    auth: user && pass ? { user, pass } : undefined,
  }

  console.log('[send-editor-email] creating SMTP transport', {
    host: transportConfig.host,
    port: transportConfig.port,
    secure: transportConfig.secure,
    hasAuth: Boolean(transportConfig.auth),
    mailFrom: Deno.env.get('MAIL_FROM') ?? null,
  })

  return nodemailer.createTransport(transportConfig)
}

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

function formatFullName(firstName?: string | null, lastName?: string | null) {
  const parts = [firstName?.trim(), lastName?.trim()].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : 'Unknown'
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack ?? null,
    }
  }

  return {
    message: String(error),
  }
}
