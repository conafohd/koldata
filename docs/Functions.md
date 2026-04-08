# Edge Functions
## send-editor-email
Path `supabase/functions/send-editor-email/index.ts`

This function is called by a WebHook. It neeeds :
- `x-supabase-functions` HTTP header in WebHook
- the user

It sends an email to the NGO editor for new user validation, and an email to the user to explain the process.
To execute the function in a local mode :
```
cd supabase
supabase functions serve send-editor-email --no-verify-jwt --debug --env-file ../.env.local
```
