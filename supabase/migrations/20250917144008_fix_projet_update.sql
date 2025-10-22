
CREATE OR REPLACE FUNCTION "public"."submit_projet_update"("association_id" "uuid", "projet_id" "uuid", "intitule_projet" "text", "partenaire_financier_technique" "text", "noms_bailleurs_fonds" "text"[], "autre_bailleur_fonds" "text", "secteurs_intervention" "text"[], "autre_secteur_intervention" "text", "date_debut_projet" "date", "date_fin_projet" "date", "statut_projet" "text", "province" "text"[], "territoire" "text"[], "aire_sante" "text", "zone_sante" "text"[], "localite_village_quartier" "text", "budget_projet" numeric, "consortium" boolean, "partenaires_consortium" "text", "types_services_fournis" "text"[], "autre_type_services_fournis" "text", "types_beneficiaires_populations_cibles" "text"[], "autre_types_beneficiaires_populations_cibles" "text", "nombre_total_personnes_cibles" integer, "nombre_hommes" integer, "nombre_femmes" integer, "nombre_filles" integer, "nombre_garcons" integer, "nombre_personnes_atteintes" integer, "nombre_personnes_handicapees" integer, "nombre_hommes_agees" integer, "nombre_femmes_agees" integer) RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_user_profile RECORD;
  v_modification_id BIGINT;
  -- Déclarer des variables locales pour éviter l'ambiguïté
  v_association_id UUID := submit_projet_update.association_id;
  v_projet_id UUID := submit_projet_update.projet_id;
  v_intitule_projet TEXT := submit_projet_update.intitule_projet;
  v_partenaire_financier_technique TEXT := submit_projet_update.partenaire_financier_technique;
  v_noms_bailleurs_fonds TEXT[] := submit_projet_update.noms_bailleurs_fonds;
  v_autre_bailleur_fonds TEXT := submit_projet_update.autre_bailleur_fonds;
  v_secteurs_intervention TEXT[] := submit_projet_update.secteurs_intervention;
  v_autre_secteur_intervention TEXT := submit_projet_update.autre_secteur_intervention;
  v_date_debut_projet DATE := submit_projet_update.date_debut_projet;
  v_date_fin_projet DATE := submit_projet_update.date_fin_projet;
  v_statut_projet TEXT := submit_projet_update.statut_projet;
  v_province TEXT[] := submit_projet_update.province;
  v_territoire TEXT[] := submit_projet_update.territoire;
  v_aire_sante TEXT := submit_projet_update.aire_sante;
  v_zone_sante TEXT[] := submit_projet_update.zone_sante;
  v_localite_village_quartier TEXT := submit_projet_update.localite_village_quartier;
  v_budget_projet NUMERIC(15, 2) := submit_projet_update.budget_projet;
  v_consortium BOOLEAN := submit_projet_update.consortium;
  v_partenaires_consortium TEXT := submit_projet_update.partenaires_consortium;
  v_types_services_fournis TEXT[] := submit_projet_update.types_services_fournis;
  v_autre_type_services_fournis TEXT := submit_projet_update.autre_type_services_fournis;
  v_types_beneficiaires_populations_cibles TEXT[] := submit_projet_update.types_beneficiaires_populations_cibles;
  v_autre_types_beneficiaires_populations_cibles TEXT := submit_projet_update.autre_types_beneficiaires_populations_cibles;
  v_nombre_total_personnes_cibles INTEGER := submit_projet_update.nombre_total_personnes_cibles;
  v_nombre_hommes INTEGER := submit_projet_update.nombre_hommes;
  v_nombre_femmes INTEGER := submit_projet_update.nombre_femmes;
  v_nombre_filles INTEGER := submit_projet_update.nombre_filles;
  v_nombre_garcons INTEGER := submit_projet_update.nombre_garcons;
  v_nombre_personnes_atteintes INTEGER := submit_projet_update.nombre_personnes_atteintes;
  v_nombre_personnes_handicapees INTEGER := submit_projet_update.nombre_personnes_handicapees;
  v_nombre_hommes_agees INTEGER := submit_projet_update.nombre_hommes_agees;
  v_nombre_femmes_agees INTEGER := submit_projet_update.nombre_femmes_agees;
BEGIN
  -- Check user rights
  SELECT * INTO v_user_profile
  FROM public.user_profiles up
  WHERE up.id = auth.uid() AND up.edit_association_id = v_association_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION '403: Forbidden';
  END IF;

  -- Delete previous registered modifications
  DELETE FROM public.projets_maj pm
  WHERE pm.projet_id = v_projet_id;

  -- Insert new modification
  INSERT INTO public.projets_maj (
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
  ) VALUES (
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
  ) RETURNING id INTO v_modification_id;

  RETURN v_modification_id;
END;
$$;

ALTER FUNCTION "public"."submit_projet_update"("association_id" "uuid", "projet_id" "uuid", "intitule_projet" "text", "partenaire_financier_technique" "text", "noms_bailleurs_fonds" "text"[], "autre_bailleur_fonds" "text", "secteurs_intervention" "text"[], "autre_secteur_intervention" "text", "date_debut_projet" "date", "date_fin_projet" "date", "statut_projet" "text", "province" "text"[], "territoire" "text"[], "aire_sante" "text", "zone_sante" "text"[], "localite_village_quartier" "text", "budget_projet" numeric, "consortium" boolean, "partenaires_consortium" "text", "types_services_fournis" "text"[], "autre_type_services_fournis" "text", "types_beneficiaires_populations_cibles" "text"[], "autre_types_beneficiaires_populations_cibles" "text", "nombre_total_personnes_cibles" integer, "nombre_hommes" integer, "nombre_femmes" integer, "nombre_filles" integer, "nombre_garcons" integer, "nombre_personnes_atteintes" integer, "nombre_personnes_handicapees" integer, "nombre_hommes_agees" integer, "nombre_femmes_agees" integer) OWNER TO "postgres";
