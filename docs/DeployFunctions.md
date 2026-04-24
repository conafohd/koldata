# Deploy Edge Functions

This document explains how to deploy the Supabase Edge Functions used by the signup and member management workflows:

- `send-editor-email`
- `manage-association-members`
- `manage-admin-members`

## Functions covered

### `send-editor-email`

Role:
- called by a SQL trigger after a new `user_profiles` row is created
- notifies the association editor
- notifies the newly registered user
- notifies admin users when a new `creator` signs up

Notes:
- `verify_jwt = false` in `supabase/config.toml`
- access is protected with the `x-supabase-functions` header and `WEBHOOK_SECRET`
- the SQL trigger reads `send_editor_email_webhook_secret` from Supabase Vault
- the Edge Function runtime reads `WEBHOOK_SECRET` from `supabase secrets set`
- both values must be identical

### `manage-association-members`

Role:
- approves a pending member
- deletes a member
- optionally sends the approval email

Notes:
- `verify_jwt = false` in `supabase/config.toml`
- access is protected in the function code by validating the bearer token with `auth.getUser(accessToken)`
- the function then checks the user's role and association in the database

### `manage-admin-members`

Role:
- deletes a `creator` user
- only allows admins to perform the action

Notes:
- `verify_jwt = false` in `supabase/config.toml`
- access is protected in the function code by validating the bearer token with `auth.getUser(accessToken)`
- the function then checks that the caller is an `admin`
- the function deletes the target user through `auth.admin.deleteUser(memberId)`

## Prerequisites

Before deploying, make sure:

- the repo is clean enough for deployment
- the project is linked with Supabase CLI
- required secrets are present
- the database migrations used by the workflow are already pushed

Useful checks:

```bash
git status --short
supabase --version
supabase secrets list
```

## Required secrets

See [SupabaseSecrets.md](./SupabaseSecrets.md) for the full reference.

Minimum expected values:

Vault SQL:
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
- `WEBHOOK_SECRET` must match `send_editor_email_webhook_secret`
- `send_editor_email_function_url` must point to the current project's `send-editor-email` URL

## Deploy commands

Deploy all functions:

```bash
supabase functions deploy send-editor-email manage-association-members manage-admin-members
```

Deploy one function only:

```bash
supabase functions deploy send-editor-email
supabase functions deploy manage-association-members
supabase functions deploy manage-admin-members
```

## Config related to deployment

Current function config is defined in `supabase/config.toml`:

```toml
[functions.send-editor-email]
verify_jwt = false

[functions.manage-association-members]
verify_jwt = false

[functions.manage-admin-members]
verify_jwt = false
```

This is intentional:

- `send-editor-email` is called by Postgres, not by a logged-in browser user
- `manage-association-members` validates the bearer token itself in code
- `manage-admin-members` validates the bearer token itself in code

## Typical deployment order

When deploying this workflow on a new environment:

1. Push database migrations.
2. Create Vault secrets in SQL.
3. Set Edge Function secrets with `supabase secrets set`.
4. Deploy `send-editor-email`, `manage-association-members`, and `manage-admin-members`.
5. Test signup.
6. Test pending member approval.
7. Test creator deletion from the admin workflow.

## Post-deployment checks

### Check function deployment

```bash
supabase functions list
```

### Check secrets

```bash
supabase secrets list
```

### Test signup flow

Expected behavior:

- user signup succeeds
- the SQL trigger calls `send-editor-email`
- if the user is `pending`, the editor and the user receive emails
- if the user is `creator`, verified admins receive an email
- if SMTP is configured, emails are sent
- if SMTP is not configured, the function logs a skip instead of blocking signup

### Test member approval flow

Expected behavior:

- authenticated editor or admin can call `manage-association-members`
- pending member becomes `reader`
- if SMTP is configured, an approval email is sent

### Test admin member management flow

Expected behavior:

- authenticated admin can call `manage-admin-members`
- the function accepts `action = delete_creator`
- the target user must exist and have role `creator`
- the target auth user is deleted successfully

## Troubleshooting

### `send-editor-email` returns `Unauthorized`

Check:
- `WEBHOOK_SECRET` in Edge Function secrets
- `send_editor_email_webhook_secret` in Vault
- both values must be identical

### Signup fails because trigger cannot call function

Check:
- `send_editor_email_function_url` exists in Vault
- it points to the correct project function URL
- the SQL function `notify_send_editor_email()` is using that Vault secret

### Logs show `SMTP_HOST is not configured, skipping ...`

Meaning:
- the function was called successfully
- SMTP is not configured in Edge Function secrets
- email sending was skipped intentionally

### Logs show SMTP socket errors

Check:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER` and `SMTP_PASS` if your SMTP requires auth
- network accessibility of the SMTP server from Supabase Cloud

### `manage-association-members` returns `401`

Check:
- the client is authenticated
- the request includes a valid bearer token
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are available in the function runtime

### `manage-association-members` returns `403`

Check:
- the caller is `admin`
- or the caller is `editor` of the targeted association
- the target member belongs to the same association

### `manage-admin-members` returns `401`

Check:
- the client is authenticated
- the request includes a valid bearer token
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are available in the function runtime

### `manage-admin-members` returns `403`

Check:
- the caller is `admin`

### `manage-admin-members` returns `400`

Check:
- `action` is exactly `delete_creator`
- `memberId` is present
- the target user has role `creator`

### `manage-admin-members` returns `404`

Check:
- the target user exists in `user_profiles`

## Local development

Run locally:

```bash
cd supabase
supabase functions serve send-editor-email --no-verify-jwt --debug --env-file ../.env.local
supabase functions serve manage-association-members --no-verify-jwt --debug --env-file ../.env.local
supabase functions serve manage-admin-members --no-verify-jwt --debug --env-file ../.env.local
```

For local email testing, Mailpit or another local SMTP server can be used.
