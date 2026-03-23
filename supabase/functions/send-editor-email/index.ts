import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import nodemailer from 'npm:nodemailer'
import { createClient } from 'npm:@supabase/supabase-js@2'

serve(async (req) => {

    const authHeader = req.headers.get('Authorization')

    if (authHeader !== `Bearer ${Deno.env.get('WEBHOOK_SECRET')}`) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const record = body.record

    const associationId = record.edit_association_id
    const role = record.role

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
        subject: 'subject',
        text: 'message',
      })

      return new Response(JSON.stringify({
        success: true,
        mode: 'mailpit',
        sentTo: email
      }), { status: 200 })
})