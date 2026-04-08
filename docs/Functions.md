# Edge Functions
## send-editor-email
Path `supabase/functions/send-editor-email/index.ts`

This function is called by a WebHook. It neeeds :
- `x-supabase-functions` HTTP header in WebHook
- the user

The SECRET `x-supabase-functions` is stored in the Supabase vault. 

To integrate it in supabase distant, run supabase `secrets set send_editor_email_webhook_secret=SUPER_SECRET_TO_CHANGE`

To integrate it in local cli supabase, run the following SQL command :
`
select vault.create_secret(
  'SUPER_SECRET_TO_CHANGE',
  'send_editor_email_webhook_secret',
  'Web hook secret'
);
`

It sends an email to the NGO editor for new user validation, and an email to the user to explain the process.
To execute the function in a local mode :
```
cd supabase
supabase functions serve send-editor-email --no-verify-jwt --debug --env-file ../.env.local
```
