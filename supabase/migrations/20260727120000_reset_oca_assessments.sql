-- The OCA assessment questionnaire was rebuilt from scratch: new sections, new
-- question IDs, and a 0–3 maturity scale replacing the yes/no model. Existing
-- assessment rows reference the old question IDs and can no longer be scored or
-- displayed correctly, so they are cleared out.

delete from public.assessments;
