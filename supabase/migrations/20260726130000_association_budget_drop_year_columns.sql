-- Follow-up to 20260726120000_association_budget_jsonb.sql.
--
-- Run this ONLY after verifying the backfilled `budget` jsonb column matches the
-- legacy per-year columns, e.g.:
--
--   select nom, budget, budget_2022, budget_2023, budget_2024, budget_2025, budget_2026
--   from public.associations
--   where budget <> coalesce(jsonb_strip_nulls(jsonb_build_object(
--           '2022', budget_2022, '2023', budget_2023, '2024', budget_2024,
--           '2025', budget_2025, '2026', budget_2026)), '{}'::jsonb);
--
-- (an empty result means every row's jsonb matches its source columns).
--
-- This migration is destructive: it removes the legacy columns for good.

alter table public.associations
  drop column if exists budget_2022,
  drop column if exists budget_2023,
  drop column if exists budget_2024,
  drop column if exists budget_2025,
  drop column if exists budget_2026,
  drop column if exists budget_2027;

alter table public.associations_maj
  drop column if exists budget_2022,
  drop column if exists budget_2023,
  drop column if exists budget_2024,
  drop column if exists budget_2025,
  drop column if exists budget_2026,
  drop column if exists budget_2027;

alter table public.associations_new
  drop column if exists budget_2022,
  drop column if exists budget_2023,
  drop column if exists budget_2024,
  drop column if exists budget_2025,
  drop column if exists budget_2026,
  drop column if exists budget_2027;
