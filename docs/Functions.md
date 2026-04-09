# Edge Functions

## send-editor-email

Path `supabase/functions/send-editor-email/index.ts`

This function is called by a database webhook and expects:

- the `x-supabase-functions` header
- a valid user payload

Important:

- the SQL trigger reads `send_editor_email_webhook_secret` from Supabase Vault
- the Edge Function runtime reads `WEBHOOK_SECRET` from `supabase secrets set`
- both values must be identical

To run locally:

```bash
cd supabase
supabase functions serve send-editor-email --no-verify-jwt --debug --env-file ../.env.local
```

For the full list of required secrets and how to set them, see [SupabaseSecrets.md](./SupabaseSecrets.md).
