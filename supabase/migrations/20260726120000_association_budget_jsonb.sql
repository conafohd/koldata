-- Replace the fixed budget_YYYY columns on the association tables with a single
-- dynamic `budget` jsonb column.
--
-- Shape: { "2024": 1200, "2023": 900 } — year-string keys -> integer USD values.
-- Years with no value are simply absent from the object.

-- 1. Add the jsonb column to the public table and both staging tables. -----------
alter table public.associations     add column if not exists budget jsonb default '{}'::jsonb;
alter table public.associations_maj  add column if not exists budget jsonb default '{}'::jsonb;
alter table public.associations_new  add column if not exists budget jsonb default '{}'::jsonb;

-- 2. Backfill from the per-year integer columns. jsonb_strip_nulls drops any
--    year whose column is null, so empty budgets collapse to '{}'. --------------
update public.associations
set budget = coalesce(
  jsonb_strip_nulls(jsonb_build_object(
    '2022', budget_2022,
    '2023', budget_2023,
    '2024', budget_2024,
    '2025', budget_2025,
    '2026', budget_2026
  )),
  '{}'::jsonb
);

update public.associations_maj
set budget = coalesce(
  jsonb_strip_nulls(jsonb_build_object(
    '2022', budget_2022,
    '2023', budget_2023,
    '2024', budget_2024,
    '2025', budget_2025,
    '2026', budget_2026
  )),
  '{}'::jsonb
);

update public.associations_new
set budget = coalesce(
  jsonb_strip_nulls(jsonb_build_object(
    '2022', budget_2022,
    '2023', budget_2023,
    '2024', budget_2024,
    '2025', budget_2025,
    '2026', budget_2026
  )),
  '{}'::jsonb
);

-- 3. Recreate submit_association_update with a single `budget jsonb` parameter.
--    The old overload must be dropped explicitly because its argument list
--    (five integer budget params) differs from the new one. --------------------
drop function if exists public.submit_association_update(
  uuid, text, text, text, text, text, smallint, text[], text, text, text, text,
  text, text, double precision, double precision, double precision, double precision,
  integer, integer, integer, integer, integer, smallint, smallint, text, text, text,
  text, text, text, text, text, text, text, text, text, text, text
);

create or replace function public.submit_association_update(
  association_id uuid,
  nom text,
  acronyme text,
  "desc" text,
  type_org text,
  type_org_autre text,
  annee_creation smallint,
  secteurs_interv text[],
  secteurs_interv_autre text,
  province text,
  territoire text,
  zone_sante text,
  aire_sante text,
  localite text,
  latitude double precision,
  longitude double precision,
  altitude double precision,
  "precision" double precision,
  budget jsonb,
  nb_salaries smallint,
  nb_benevoles smallint,
  nom_resp_edition text,
  email_resp_edition text,
  email_org text,
  nom_contact text,
  tel_contact text,
  email_contact text,
  website text,
  facebook text,
  twitter text,
  instagram text,
  linkedin text,
  tiktok text,
  autre_social_media text,
  logo_url text
)
returns bigint
language plpgsql
security definer
as $function$
declare
  v_user_profile public.user_profiles%rowtype;
  v_modification_id bigint;
  v_association_id uuid := submit_association_update.association_id;
  v_nom text := submit_association_update.nom;
  v_acronyme text := submit_association_update.acronyme;
  v_desc text := submit_association_update."desc";
  v_type_org text := submit_association_update.type_org;
  v_type_org_autre text := submit_association_update.type_org_autre;
  v_annee_creation smallint := submit_association_update.annee_creation;
  v_secteurs_interv text[] := submit_association_update.secteurs_interv;
  v_secteurs_interv_autre text := submit_association_update.secteurs_interv_autre;
  v_province text := submit_association_update.province;
  v_territoire text := submit_association_update.territoire;
  v_zone_sante text := submit_association_update.zone_sante;
  v_aire_sante text := submit_association_update.aire_sante;
  v_localite text := submit_association_update.localite;
  v_latitude double precision := submit_association_update.latitude;
  v_longitude double precision := submit_association_update.longitude;
  v_altitude double precision := submit_association_update.altitude;
  v_precision double precision := submit_association_update."precision";
  v_budget jsonb := coalesce(submit_association_update.budget, '{}'::jsonb);
  v_nb_salaries smallint := submit_association_update.nb_salaries;
  v_nb_benevoles smallint := submit_association_update.nb_benevoles;
  v_nom_resp_edition text := submit_association_update.nom_resp_edition;
  v_email_resp_edition text := submit_association_update.email_resp_edition;
  v_email_org text := submit_association_update.email_org;
  v_nom_contact text := submit_association_update.nom_contact;
  v_tel_contact text := submit_association_update.tel_contact;
  v_email_contact text := submit_association_update.email_contact;
  v_website text := submit_association_update.website;
  v_facebook text := submit_association_update.facebook;
  v_twitter text := submit_association_update.twitter;
  v_instagram text := submit_association_update.instagram;
  v_linkedin text := submit_association_update.linkedin;
  v_tiktok text := submit_association_update.tiktok;
  v_autre_social_media text := submit_association_update.autre_social_media;
  v_logo_url text := submit_association_update.logo_url;
begin
  select *
  into v_user_profile
  from public.user_profiles up
  where up.id = auth.uid()
    and (
      up.role = 'admin'
      or (up.role = 'editor' and up.edit_association_id = v_association_id)
    );

  if not found then
    raise exception '403: Forbidden';
  end if;

  delete from public.associations_maj am
  where am.association_id = v_association_id
    and am.user_id = auth.uid();

  insert into public.associations_maj (
    association_id,
    user_id,
    nom,
    acronyme,
    "desc",
    type_org,
    type_org_autre,
    annee_creation,
    secteurs_interv,
    secteurs_interv_autre,
    province,
    territoire,
    zone_sante,
    aire_sante,
    localite,
    latitude,
    longitude,
    altitude,
    "precision",
    budget,
    nb_salaries,
    nb_benevoles,
    nom_resp_edition,
    email_resp_edition,
    email_org,
    nom_contact,
    tel_contact,
    email_contact,
    website,
    facebook,
    twitter,
    instagram,
    linkedin,
    tiktok,
    autre_social_media,
    logo_url
  ) values (
    v_association_id,
    auth.uid(),
    v_nom,
    v_acronyme,
    v_desc,
    v_type_org,
    v_type_org_autre,
    v_annee_creation,
    v_secteurs_interv,
    v_secteurs_interv_autre,
    v_province,
    v_territoire,
    v_zone_sante,
    v_aire_sante,
    v_localite,
    v_latitude,
    v_longitude,
    v_altitude,
    v_precision,
    v_budget,
    v_nb_salaries,
    v_nb_benevoles,
    v_nom_resp_edition,
    v_email_resp_edition,
    v_email_org,
    v_nom_contact,
    v_tel_contact,
    v_email_contact,
    v_website,
    v_facebook,
    v_twitter,
    v_instagram,
    v_linkedin,
    v_tiktok,
    v_autre_social_media,
    v_logo_url
  ) returning id into v_modification_id;

  return v_modification_id;
end;
$function$;

-- NOTE: the redundant per-year columns are intentionally NOT dropped here. They
-- are kept alongside the new `budget` jsonb so the backfill can be compared
-- against the source data. A follow-up migration
-- (20260726130000_association_budget_drop_year_columns.sql) drops them once
-- verified.

-- 4. Rebuild the CSV export to read budget from the new jsonb column. The old
--    per-year columns still exist but are no longer referenced here. -----------
CREATE OR REPLACE FUNCTION export_associations_csv()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    csv_output TEXT := '';
    csv_header TEXT;
    csv_rows TEXT;
BEGIN
    -- Check if user has admin role
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied. Only administrators can export associations data.';
    END IF;

    -- Build CSV header (using semicolon for European Excel compatibility)
    csv_header := 'ID;Name;Acronym;Description;Organization Type;Other Org Type;Year Created;Intervention Sectors;Other Sectors;Province;Territory;Health Zone;Health Area;Locality;Latitude;Longitude;Altitude;Precision;Budget (JSON);Employees;Volunteers;Profile Manager Name;Profile Manager Email;Organization Email;Contact Name;Contact Phone;Contact Email;Website;Facebook;Twitter;Instagram;LinkedIn;TikTok;Other Social Media;Logo URL;Created At;Updated At';

    -- Build CSV data rows
    SELECT string_agg(csv_row, E'\n')
    INTO csv_rows
    FROM (
        SELECT
            CONCAT_WS(';',
                clean_csv_field(id::TEXT),
                clean_csv_field(nom),
                clean_csv_field(acronyme),
                clean_csv_field("desc"),
                clean_csv_field(type_org),
                clean_csv_field(type_org_autre),
                clean_csv_field(annee_creation::TEXT),
                clean_csv_field(array_to_string(secteurs_interv, '; ')),
                clean_csv_field(secteurs_interv_autre),
                clean_csv_field(province),
                clean_csv_field(territoire),
                clean_csv_field(zone_sante),
                clean_csv_field(aire_sante),
                clean_csv_field(localite),
                clean_csv_field(latitude::TEXT),
                clean_csv_field(longitude::TEXT),
                clean_csv_field(altitude::TEXT),
                clean_csv_field(precision::TEXT),
                clean_csv_field(budget::TEXT),
                clean_csv_field(nb_salaries::TEXT),
                clean_csv_field(nb_benevoles::TEXT),
                clean_csv_field(nom_resp_edition),
                clean_csv_field(email_resp_edition),
                clean_csv_field(email_org),
                clean_csv_field(nom_contact),
                clean_csv_field(tel_contact),
                clean_csv_field(email_contact),
                clean_csv_field(website),
                clean_csv_field(facebook),
                clean_csv_field(twitter),
                clean_csv_field(instagram),
                clean_csv_field(linkedin),
                clean_csv_field(tiktok),
                clean_csv_field(autre_social_media),
                clean_csv_field(logo_url),
                clean_csv_field(created_at::TEXT),
                clean_csv_field(updated_at::TEXT)
            ) AS csv_row
        FROM public.associations
        ORDER BY nom
    ) AS rows;

    -- Combine header and rows with UTF-8 BOM for Excel compatibility
    csv_output := E'\uFEFF' || csv_header || E'\n' || COALESCE(csv_rows, '');

    RETURN csv_output;
END;
$$;
