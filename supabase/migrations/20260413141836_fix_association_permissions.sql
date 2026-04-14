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
  budget_2022 integer,
  budget_2023 integer,
  budget_2024 integer,
  budget_2025 integer,
  budget_2026 integer,
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
  v_budget_2022 integer := submit_association_update.budget_2022;
  v_budget_2023 integer := submit_association_update.budget_2023;
  v_budget_2024 integer := submit_association_update.budget_2024;
  v_budget_2025 integer := submit_association_update.budget_2025;
  v_budget_2026 integer := submit_association_update.budget_2026;
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
    budget_2022,
    budget_2023,
    budget_2024,
    budget_2025,
    budget_2026,
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
    v_budget_2022,
    v_budget_2023,
    v_budget_2024,
    v_budget_2025,
    v_budget_2026,
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

create or replace function public.submit_projet_update(
  association_id uuid,
  projet_id uuid,
  intitule_projet text,
  partenaire_financier_technique text,
  noms_bailleurs_fonds text[],
  autre_bailleur_fonds text,
  secteurs_intervention text[],
  autre_secteur_intervention text,
  date_debut_projet date,
  date_fin_projet date,
  statut_projet text,
  province text[],
  territoire text[],
  aire_sante text,
  zone_sante text[],
  localite_village_quartier text,
  budget_projet numeric,
  consortium boolean,
  partenaires_consortium text,
  types_services_fournis text[],
  autre_type_services_fournis text,
  types_beneficiaires_populations_cibles text[],
  autre_types_beneficiaires_populations_cibles text,
  nombre_total_personnes_cibles integer,
  nombre_hommes integer,
  nombre_femmes integer,
  nombre_filles integer,
  nombre_garcons integer,
  nombre_personnes_atteintes integer,
  nombre_personnes_handicapees integer,
  nombre_hommes_agees integer,
  nombre_femmes_agees integer
)
returns bigint
language plpgsql
security definer
as $function$
declare
  v_user_profile public.user_profiles%rowtype;
  v_modification_id bigint;
  v_association_id uuid := submit_projet_update.association_id;
  v_projet_id uuid := submit_projet_update.projet_id;
  v_intitule_projet text := submit_projet_update.intitule_projet;
  v_partenaire_financier_technique text := submit_projet_update.partenaire_financier_technique;
  v_noms_bailleurs_fonds text[] := submit_projet_update.noms_bailleurs_fonds;
  v_autre_bailleur_fonds text := submit_projet_update.autre_bailleur_fonds;
  v_secteurs_intervention text[] := submit_projet_update.secteurs_intervention;
  v_autre_secteur_intervention text := submit_projet_update.autre_secteur_intervention;
  v_date_debut_projet date := submit_projet_update.date_debut_projet;
  v_date_fin_projet date := submit_projet_update.date_fin_projet;
  v_statut_projet text := submit_projet_update.statut_projet;
  v_province text[] := submit_projet_update.province;
  v_territoire text[] := submit_projet_update.territoire;
  v_aire_sante text := submit_projet_update.aire_sante;
  v_zone_sante text[] := submit_projet_update.zone_sante;
  v_localite_village_quartier text := submit_projet_update.localite_village_quartier;
  v_budget_projet numeric := submit_projet_update.budget_projet;
  v_consortium boolean := submit_projet_update.consortium;
  v_partenaires_consortium text := submit_projet_update.partenaires_consortium;
  v_types_services_fournis text[] := submit_projet_update.types_services_fournis;
  v_autre_type_services_fournis text := submit_projet_update.autre_type_services_fournis;
  v_types_beneficiaires_populations_cibles text[] := submit_projet_update.types_beneficiaires_populations_cibles;
  v_autre_types_beneficiaires_populations_cibles text := submit_projet_update.autre_types_beneficiaires_populations_cibles;
  v_nombre_total_personnes_cibles integer := submit_projet_update.nombre_total_personnes_cibles;
  v_nombre_hommes integer := submit_projet_update.nombre_hommes;
  v_nombre_femmes integer := submit_projet_update.nombre_femmes;
  v_nombre_filles integer := submit_projet_update.nombre_filles;
  v_nombre_garcons integer := submit_projet_update.nombre_garcons;
  v_nombre_personnes_atteintes integer := submit_projet_update.nombre_personnes_atteintes;
  v_nombre_personnes_handicapees integer := submit_projet_update.nombre_personnes_handicapees;
  v_nombre_hommes_agees integer := submit_projet_update.nombre_hommes_agees;
  v_nombre_femmes_agees integer := submit_projet_update.nombre_femmes_agees;
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

  delete from public.projets_maj pm
  where pm.projet_id = v_projet_id;

  insert into public.projets_maj (
    association_id,
    projet_id,
    intitule_projet,
    partenaire_financier_technique,
    noms_bailleurs_fonds,
    autre_bailleur_fonds,
    secteurs_intervention,
    autre_secteur_intervention,
    date_debut_projet,
    date_fin_projet,
    statut_projet,
    province,
    territoire,
    aire_sante,
    zone_sante,
    localite_village_quartier,
    budget_projet,
    consortium,
    partenaires_consortium,
    types_services_fournis,
    autre_type_services_fournis,
    types_beneficiaires_populations_cibles,
    autre_types_beneficiaires_populations_cibles,
    nombre_total_personnes_cibles,
    nombre_hommes,
    nombre_femmes,
    nombre_filles,
    nombre_garcons,
    nombre_personnes_atteintes,
    nombre_personnes_handicapees,
    nombre_hommes_agees,
    nombre_femmes_agees
  ) values (
    v_association_id,
    v_projet_id,
    v_intitule_projet,
    v_partenaire_financier_technique,
    v_noms_bailleurs_fonds,
    v_autre_bailleur_fonds,
    v_secteurs_intervention,
    v_autre_secteur_intervention,
    v_date_debut_projet,
    v_date_fin_projet,
    v_statut_projet,
    v_province,
    v_territoire,
    v_aire_sante,
    v_zone_sante,
    v_localite_village_quartier,
    v_budget_projet,
    v_consortium,
    v_partenaires_consortium,
    v_types_services_fournis,
    v_autre_type_services_fournis,
    v_types_beneficiaires_populations_cibles,
    v_autre_types_beneficiaires_populations_cibles,
    v_nombre_total_personnes_cibles,
    v_nombre_hommes,
    v_nombre_femmes,
    v_nombre_filles,
    v_nombre_garcons,
    v_nombre_personnes_atteintes,
    v_nombre_personnes_handicapees,
    v_nombre_hommes_agees,
    v_nombre_femmes_agees
  ) returning id into v_modification_id;

  return v_modification_id;
end;
$function$;

create or replace function public.submit_projet_update(
  association_id uuid,
  projet_id uuid,
  intitule_projet text,
  partenaire_financier_technique text,
  noms_bailleurs_fonds text[],
  autre_bailleur_fonds text,
  secteurs_intervention text[],
  autre_secteur_intervention text,
  date_debut_projet date,
  date_fin_projet date,
  statut_projet text,
  province text[],
  territoire text[],
  aire_sante text,
  zone_sante text[],
  localite_village_quartier text,
  budget_projet numeric,
  consortium boolean,
  partenaires_consortium text,
  types_services_fournis text[],
  autre_type_services_fournis text,
  types_beneficiaires_populations_cibles text[],
  autre_types_beneficiaires_populations_cibles text,
  nombre_total_personnes_cibles integer,
  nombre_hommes integer,
  nombre_femmes integer,
  nombre_filles integer,
  nombre_garcons integer,
  nombre_personnes_atteintes integer,
  nombre_personnes_handicapees integer,
  nombre_personnes_agees integer
)
returns bigint
language plpgsql
security definer
as $function$
declare
  v_user_profile public.user_profiles%rowtype;
  v_modification_id bigint;
  v_association_id uuid := submit_projet_update.association_id;
  v_projet_id uuid := submit_projet_update.projet_id;
  v_intitule_projet text := submit_projet_update.intitule_projet;
  v_partenaire_financier_technique text := submit_projet_update.partenaire_financier_technique;
  v_noms_bailleurs_fonds text[] := submit_projet_update.noms_bailleurs_fonds;
  v_autre_bailleur_fonds text := submit_projet_update.autre_bailleur_fonds;
  v_secteurs_intervention text[] := submit_projet_update.secteurs_intervention;
  v_autre_secteur_intervention text := submit_projet_update.autre_secteur_intervention;
  v_date_debut_projet date := submit_projet_update.date_debut_projet;
  v_date_fin_projet date := submit_projet_update.date_fin_projet;
  v_statut_projet text := submit_projet_update.statut_projet;
  v_province text[] := submit_projet_update.province;
  v_territoire text[] := submit_projet_update.territoire;
  v_aire_sante text := submit_projet_update.aire_sante;
  v_zone_sante text[] := submit_projet_update.zone_sante;
  v_localite_village_quartier text := submit_projet_update.localite_village_quartier;
  v_budget_projet numeric := submit_projet_update.budget_projet;
  v_consortium boolean := submit_projet_update.consortium;
  v_partenaires_consortium text := submit_projet_update.partenaires_consortium;
  v_types_services_fournis text[] := submit_projet_update.types_services_fournis;
  v_autre_type_services_fournis text := submit_projet_update.autre_type_services_fournis;
  v_types_beneficiaires_populations_cibles text[] := submit_projet_update.types_beneficiaires_populations_cibles;
  v_autre_types_beneficiaires_populations_cibles text := submit_projet_update.autre_types_beneficiaires_populations_cibles;
  v_nombre_total_personnes_cibles integer := submit_projet_update.nombre_total_personnes_cibles;
  v_nombre_hommes integer := submit_projet_update.nombre_hommes;
  v_nombre_femmes integer := submit_projet_update.nombre_femmes;
  v_nombre_filles integer := submit_projet_update.nombre_filles;
  v_nombre_garcons integer := submit_projet_update.nombre_garcons;
  v_nombre_personnes_atteintes integer := submit_projet_update.nombre_personnes_atteintes;
  v_nombre_personnes_handicapees integer := submit_projet_update.nombre_personnes_handicapees;
  v_nombre_personnes_agees integer := submit_projet_update.nombre_personnes_agees;
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

  delete from public.projets_maj pm
  where pm.projet_id = v_projet_id;

  insert into public.projets_maj (
    association_id,
    projet_id,
    intitule_projet,
    partenaire_financier_technique,
    noms_bailleurs_fonds,
    autre_bailleur_fonds,
    secteurs_intervention,
    autre_secteur_intervention,
    date_debut_projet,
    date_fin_projet,
    statut_projet,
    province,
    territoire,
    aire_sante,
    zone_sante,
    localite_village_quartier,
    budget_projet,
    consortium,
    partenaires_consortium,
    types_services_fournis,
    autre_type_services_fournis,
    types_beneficiaires_populations_cibles,
    autre_types_beneficiaires_populations_cibles,
    nombre_total_personnes_cibles,
    nombre_hommes,
    nombre_femmes,
    nombre_filles,
    nombre_garcons,
    nombre_personnes_atteintes,
    nombre_personnes_handicapees,
    nombre_personnes_agees
  ) values (
    v_association_id,
    v_projet_id,
    v_intitule_projet,
    v_partenaire_financier_technique,
    v_noms_bailleurs_fonds,
    v_autre_bailleur_fonds,
    v_secteurs_intervention,
    v_autre_secteur_intervention,
    v_date_debut_projet,
    v_date_fin_projet,
    v_statut_projet,
    v_province,
    v_territoire,
    v_aire_sante,
    v_zone_sante,
    v_localite_village_quartier,
    v_budget_projet,
    v_consortium,
    v_partenaires_consortium,
    v_types_services_fournis,
    v_autre_type_services_fournis,
    v_types_beneficiaires_populations_cibles,
    v_autre_types_beneficiaires_populations_cibles,
    v_nombre_total_personnes_cibles,
    v_nombre_hommes,
    v_nombre_femmes,
    v_nombre_filles,
    v_nombre_garcons,
    v_nombre_personnes_atteintes,
    v_nombre_personnes_handicapees,
    v_nombre_personnes_agees
  ) returning id into v_modification_id;

  return v_modification_id;
end;
$function$;

drop policy if exists "Update profiles policy" on public.user_profiles;

create policy "Admins can update profiles"
on public.user_profiles
as permissive
for update
to public
using (public.is_admin())
with check (public.is_admin());
