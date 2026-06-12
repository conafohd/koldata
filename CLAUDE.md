# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 3000
npm run build        # Type-check + build
npm run type-check   # Run vue-tsc only
npm run lint         # ESLint with auto-fix
npm run format       # Prettier over src/
```

Deploy a branch to the dev server (requires `.env.deploy`):

```bash
./scripts/deploy-branch-dev.sh <branch-name>
```

Deploy Supabase Edge Functions:

```bash
supabase functions deploy send-editor-email manage-association-members manage-admin-members
```

## Environment setup

Create `.env.local` with:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Architecture

**Stack:** Vue 3 (Composition API + TypeScript), Pinia, Vuetify 3, Vue I18n, Vee-validate/Zod, Supabase JS SDK, MapLibre GL.

### Frontend data flow

```
Views ↔ Stores ↔ *DbService classes ↔ Supabase API
Views/Components ↔ *FormService / *MapService (data processing, no API calls)
```

- **Stores** (`src/stores/`) hold reactive state and call `*DbService` classes for all API interactions.
- **`*DbService` classes** (`src/services/*/`) are static-method classes that issue Supabase queries, call RPCs, and fire notifications on error/success.
- **`*FormService` / utility services** (`src/services/forms/`, `src/services/utils/`) do pure data transformation with no Supabase calls.
- **Views** (`src/views/`) are organized by feature; each view folder may contain a `components/` subfolder for sub-components used only by that view.
- **`src/components/`** holds globally reusable components (auth dialogs, form fields).

### Enum-based references

All Supabase table names and RPC function names are accessed through enums — never hardcoded as strings:

- `src/models/enums/TablesList.ts` — every database table
- `src/models/enums/DBFunction.ts` — every RPC function called via `supabase.rpc()`
- `src/models/enums/UserRole.ts` — user roles: `admin`, `editor`, `reader`, `creator`, `pending`

### User roles and staging workflow

Public tables (`associations`, `projets`) are write-protected by RLS; only admins write directly.

Editors submit to staging tables (`associations_maj`, `projets_maj` for updates; `associations_new`, `projets_new` for new entries) → admin reviews and validates → data merged to public tables → staging entry deleted.

`creator` role is for users whose association isn't in the system yet; they submit new associations via `associations_new`.

### Supabase backend

- **Edge Functions** (`supabase/functions/`): `send-editor-email` (triggered by Postgres webhook on signup), `manage-association-members` (approve/delete member), `manage-admin-members` (admin-only creator deletion). All three use `verify_jwt = false` in `config.toml` and implement their own auth checks in code.
- **Migrations** live in `supabase/migrations/` and must be pushed before deploying edge functions on a new environment.
- Two separate secret systems: Supabase Vault (for SQL/triggers, set via SQL `vault.create_secret`) and Edge Function secrets (for Deno, set via `supabase secrets set`). See `docs/SupabaseSecrets.md` for the full reference.

### i18n

Default locale is French (`fr`). Translation files live in `src/assets/translations/{fr,en}/` split by feature. The `i18n` export from `src/plugins/i18n.ts` is the `global` instance used outside components (e.g. in services and stores).

### SCSS

Global SCSS variables from `src/assets/styles/_variables.scss` are auto-injected into every component via `vite.config.ts`. Vuetify styles are loaded as SASS source (not pre-compiled CSS).

### Path alias

`@` resolves to `src/`.
