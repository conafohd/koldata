# Supabase Secrets

This document lists the secrets used by the Supabase database triggers and Edge Functions in this project, and how to set each one.

## Two secret systems

There are two different places to store secrets:

- `Supabase Vault` in Postgres
  Use this for values read directly by SQL functions, triggers, or migrations.
  Set them with SQL:
  ```sql
  select vault.create_secret(
    'VALUE',
    'secret_name',
    'Description'
  );
  ```

- `Supabase Edge Function secrets`
  Use this for values read in TypeScript via `Deno.env.get(...)`.
  Set them with the CLI:
  ```bash
  supabase secrets set SECRET_NAME='VALUE'
  ```

Important:
- a Vault secret is not available through `Deno.env.get(...)`
- a `supabase secrets set ...` secret is not available in SQL

## Vault secrets

These secrets are used by the SQL trigger `public.notify_send_editor_email()`.

### `send_editor_email_webhook_secret`

Used for:
- the `x-supabase-functions` header sent by the database trigger

Read from:
- `supabase/migrations/20260408084102_new_workflow_signup.sql`
- `supabase/migrations/20260409144858_fix_signup_webhook_url.sql`

Set it with SQL:

```sql
select vault.create_secret(
  'SUPER_SECRET_TO_CHANGE',
  'send_editor_email_webhook_secret',
  'Web hook secret'
);
```

### `send_editor_email_function_url`

Used for:
- the URL called by the database trigger to invoke `send-editor-email`

Read from:
- `supabase/migrations/20260409144858_fix_signup_webhook_url.sql`

Set it with SQL:

```sql
select vault.create_secret(
  'https://your-project-ref.supabase.co/functions/v1/send-editor-email',
  'send_editor_email_function_url',
  'Edge Function URL for send-editor-email'
);
```

## Edge Function secrets

These secrets are read via `Deno.env.get(...)` by the Edge Functions.

### `WEBHOOK_SECRET`

Used by:
- `supabase/functions/send-editor-email/index.ts`

Purpose:
- must match `send_editor_email_webhook_secret`
- used to verify that the HTTP call really comes from the SQL trigger

Set it with CLI:

```bash
supabase secrets set WEBHOOK_SECRET='SUPER_SECRET_TO_CHANGE'
```

### `APP_URL`

Used by:
- `supabase/functions/send-editor-email/index.ts`

Purpose:
- base URL used to build links in emails

Example:

```bash
supabase secrets set APP_URL='https://dev.koldata.cartong.org/signup-workflow'
```

### `MAIL_FROM`

Used by:
- `supabase/functions/send-editor-email/index.ts`
- `supabase/functions/manage-association-members/index.ts`

Purpose:
- sender address for outgoing emails

Example:

```bash
supabase secrets set MAIL_FROM='KolData <noreply@example.org>'
```

### `SMTP_HOST`

Used by:
- `supabase/functions/send-editor-email/index.ts`
- `supabase/functions/manage-association-members/index.ts`

Purpose:
- SMTP server host

Example:

```bash
supabase secrets set SMTP_HOST='mail.example.org'
```

### `SMTP_PORT`

Used by:
- `supabase/functions/send-editor-email/index.ts`
- `supabase/functions/manage-association-members/index.ts`

Purpose:
- SMTP port

Example:

```bash
supabase secrets set SMTP_PORT='2525'
```

### `SMTP_USER`

Optional.

Used by:
- `supabase/functions/send-editor-email/index.ts`
- `supabase/functions/manage-association-members/index.ts`

Purpose:
- SMTP username when the server requires authentication

Example:

```bash
supabase secrets set SMTP_USER='smtp-user'
```

### `SMTP_PASS`

Optional.

Used by:
- `supabase/functions/send-editor-email/index.ts`
- `supabase/functions/manage-association-members/index.ts`

Purpose:
- SMTP password when the server requires authentication

Example:

```bash
supabase secrets set SMTP_PASS='smtp-password'
```

## Runtime Supabase secrets

These values are also read by the Edge Functions:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

They are used by:
- `supabase/functions/send-editor-email/index.ts`
- `supabase/functions/manage-association-members/index.ts`

On Supabase Cloud, these are usually available in the function runtime already. If needed, verify them with:

```bash
supabase secrets list
```

## Minimum setup for signup workflow

For the signup workflow to work end-to-end, make sure these are present:

Vault:
- `send_editor_email_webhook_secret`
- `send_editor_email_function_url`

Edge Function secrets:
- `WEBHOOK_SECRET`
- `APP_URL`
- `MAIL_FROM`
- `SMTP_HOST`
- `SMTP_PORT`
- optionally `SMTP_USER`
- optionally `SMTP_PASS`

Important:
- `WEBHOOK_SECRET` must contain the same value as `send_editor_email_webhook_secret`
- `send_editor_email_function_url` must point to the current project's `send-editor-email` function

## Quick setup examples

### SQL / Vault

```sql
select vault.create_secret(
  'SUPER_SECRET_TO_CHANGE',
  'send_editor_email_webhook_secret',
  'Web hook secret'
);

select vault.create_secret(
  'https://your-project-ref.supabase.co/functions/v1/send-editor-email',
  'send_editor_email_function_url',
  'Edge Function URL for send-editor-email'
);
```

### CLI / Edge Functions

```bash
supabase secrets set \
  WEBHOOK_SECRET='SUPER_SECRET_TO_CHANGE' \
  APP_URL='https://dev.koldata.cartong.org/signup-workflow' \
  MAIL_FROM='KolData <noreply@example.org>' \
  SMTP_HOST='mail.example.org' \
  SMTP_PORT='2525'
```
