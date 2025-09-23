CREATE OR REPLACE FUNCTION "public"."get_db_stats"("p_asso" "uuid" DEFAULT NULL::"uuid", "p_province" "text"[] DEFAULT NULL::"text"[], "p_territory" "text"[] DEFAULT NULL::"text"[], "p_healthzone" "text"[] DEFAULT NULL::"text"[], "p_year" integer[] DEFAULT NULL::integer[], "p_intervention_sector" "text"[] DEFAULT NULL::"text"[]) RETURNS json
    LANGUAGE "plpgsql"
    AS $$DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'ngos_count', (
      SELECT COUNT(*)
      FROM associations a
      WHERE (p_asso IS NULL OR a.id = p_asso)
        AND (p_province IS NULL OR a.province = ANY(p_province))
        AND (p_territory IS NULL OR a.territoire = ANY(p_territory))
        AND (p_healthzone IS NULL OR a.zone_sante = ANY(p_healthzone))
        AND (p_intervention_sector IS NULL OR a.secteurs_interv && p_intervention_sector::varchar[])
    ),
    
    'projects_count', (
      SELECT COUNT(*)
      FROM projets p
      WHERE (p_asso IS NULL OR p.association_id = p_asso)
        AND (p_province IS NULL OR (p.province IS NOT NULL AND p.province && p_province))
        AND (p_territory IS NULL OR (p.territoire IS NOT NULL AND p.territoire && p_territory))
        AND (p_healthzone IS NULL OR (p.zone_sante IS NOT NULL AND p.zone_sante && p_healthzone))
        AND (p_year IS NULL OR (
             p.date_debut_projet IS NOT NULL AND EXTRACT(YEAR FROM p.date_debut_projet) = ANY(p_year)
             OR p.date_fin_projet IS NOT NULL AND EXTRACT(YEAR FROM p.date_fin_projet) = ANY(p_year)
        ))
        AND (p_intervention_sector IS NULL OR p.secteurs_intervention && p_intervention_sector)
    ),
    
    'budget_count', COALESCE((
      SELECT SUM(p.budget_projet)
      FROM projets p
      WHERE (p_asso IS NULL OR p.association_id = p_asso)
        AND (p_province IS NULL OR (p.province IS NOT NULL AND p.province && p_province))
        AND (p_territory IS NULL OR (p.territoire IS NOT NULL AND p.territoire && p_territory))
        AND (p_healthzone IS NULL OR (p.zone_sante IS NOT NULL AND p.zone_sante && p_healthzone))
        AND (p_year IS NULL OR (
             p.date_debut_projet IS NOT NULL AND EXTRACT(YEAR FROM p.date_debut_projet) = ANY(p_year)
             OR p.date_fin_projet IS NOT NULL AND EXTRACT(YEAR FROM p.date_fin_projet) = ANY(p_year)
        ))
        AND (p_intervention_sector IS NULL OR p.secteurs_intervention && p_intervention_sector)
    ), 0),
    
    'territories_count', (
      SELECT COUNT(DISTINCT t.territory)
      FROM projets p
      CROSS JOIN LATERAL unnest(p.territoire) AS t(territory)
      WHERE p.territoire IS NOT NULL
        AND (p_asso IS NULL OR p.association_id = p_asso)
        AND (p_province IS NULL OR (p.province IS NOT NULL AND p.province && p_province))
        AND (p_territory IS NULL OR (p.territoire && p_territory))
        AND (p_healthzone IS NULL OR (p.zone_sante IS NOT NULL AND p.zone_sante && p_healthzone))
        AND (p_year IS NULL OR (
             p.date_debut_projet IS NOT NULL AND EXTRACT(YEAR FROM p.date_debut_projet) = ANY(p_year)
             OR p.date_fin_projet IS NOT NULL AND EXTRACT(YEAR FROM p.date_fin_projet) = ANY(p_year)
        ))
        AND (p_intervention_sector IS NULL OR p.secteurs_intervention && p_intervention_sector)
    ),
    
    'interventions_fields_count', (
      SELECT COUNT(DISTINCT s.secteur)
      FROM projets p
      CROSS JOIN LATERAL unnest(p.secteurs_intervention) AS s(secteur)
      WHERE p.secteurs_intervention IS NOT NULL
        AND (p_asso IS NULL OR p.association_id = p_asso)
        AND (p_province IS NULL OR (p.province IS NOT NULL AND p.province && p_province))
        AND (p_territory IS NULL OR (p.territoire IS NOT NULL AND p.territoire && p_territory))
        AND (p_healthzone IS NULL OR (p.zone_sante IS NOT NULL AND p.zone_sante && p_healthzone))
        AND (p_year IS NULL OR (
             p.date_debut_projet IS NOT NULL AND EXTRACT(YEAR FROM p.date_debut_projet) = ANY(p_year)
             OR p.date_fin_projet IS NOT NULL AND EXTRACT(YEAR FROM p.date_fin_projet) = ANY(p_year)
        ))
        AND (p_intervention_sector IS NULL OR p.secteurs_intervention && p_intervention_sector)
    ),
    
    'interventions_fields_details', COALESCE((
      SELECT json_agg(
               json_build_object(
                 'secteur', x.secteur,
                 'occurrences', x.occurrences
               )
               ORDER BY x.occurrences DESC
             )
      FROM (
        SELECT s.secteur, COUNT(*) AS occurrences
        FROM projets p
        CROSS JOIN LATERAL unnest(p.secteurs_intervention) AS s(secteur)
        WHERE p.secteurs_intervention IS NOT NULL
          AND (p_asso IS NULL OR p.association_id = p_asso)
          AND (p_province IS NULL OR (p.province IS NOT NULL AND p.province && p_province))
          AND (p_territory IS NULL OR (p.territoire IS NOT NULL AND p.territoire && p_territory))
          AND (p_healthzone IS NULL OR (p.zone_sante IS NOT NULL AND p.zone_sante && p_healthzone))
          AND (p_year IS NULL OR (
               p.date_debut_projet IS NOT NULL AND EXTRACT(YEAR FROM p.date_debut_projet) = ANY(p_year)
               OR p.date_fin_projet IS NOT NULL AND EXTRACT(YEAR FROM p.date_fin_projet) = ANY(p_year)
          ))
          AND (p_intervention_sector IS NULL OR p.secteurs_intervention && p_intervention_sector)
        GROUP BY s.secteur
      ) AS x
    ), '[]'::json),
    
    'beneficiaries_types_details', COALESCE((
      SELECT json_agg(
               json_build_object(
                 'type', x.type,
                 'occurrences', x.occurrences,
                 'percentage', ROUND(100.0 * x.occurrences / total.total_count, 2)
               )
               ORDER BY x.occurrences DESC
             )
      FROM (
        SELECT unnest(p.types_beneficiaires_populations_cibles) AS type, COUNT(*) AS occurrences
        FROM projets p
        WHERE p.types_beneficiaires_populations_cibles IS NOT NULL
          AND (p_asso IS NULL OR p.association_id = p_asso)
          AND (p_province IS NULL OR (p.province IS NOT NULL AND p.province && p_province))
          AND (p_territory IS NULL OR (p.territoire IS NOT NULL AND p.territoire && p_territory))
          AND (p_healthzone IS NULL OR (p.zone_sante IS NOT NULL AND p.zone_sante && p_healthzone))
          AND (p_year IS NULL OR (
               p.date_debut_projet IS NOT NULL AND EXTRACT(YEAR FROM p.date_debut_projet) = ANY(p_year)
               OR p.date_fin_projet IS NOT NULL AND EXTRACT(YEAR FROM p.date_fin_projet) = ANY(p_year)
          ))
          AND (p_intervention_sector IS NULL OR p.secteurs_intervention && p_intervention_sector)
        GROUP BY type
      ) x
      CROSS JOIN (
        SELECT COUNT(*) AS total_count
        FROM projets p,
        unnest(p.types_beneficiaires_populations_cibles)
        WHERE p.types_beneficiaires_populations_cibles IS NOT NULL
          AND (p_asso IS NULL OR p.association_id = p_asso)
          AND (p_province IS NULL OR (p.province IS NOT NULL AND p.province && p_province))
          AND (p_territory IS NULL OR (p.territoire IS NOT NULL AND p.territoire && p_territory))
          AND (p_healthzone IS NULL OR (p.zone_sante IS NOT NULL AND p.zone_sante && p_healthzone))
          AND (p_year IS NULL OR (
               p.date_debut_projet IS NOT NULL AND EXTRACT(YEAR FROM p.date_debut_projet) = ANY(p_year)
               OR p.date_fin_projet IS NOT NULL AND EXTRACT(YEAR FROM p.date_fin_projet) = ANY(p_year)
          ))
          AND (p_intervention_sector IS NULL OR p.secteurs_intervention && p_intervention_sector)
      ) total
    ), '[]'::json),
    
    'beneficiaries_count', COALESCE((
      SELECT json_build_object(
        'target', SUM(p.nombre_total_personnes_cibles),
        'beneficiaries', SUM(p.nombre_personnes_atteintes)
      )
      FROM projets p
      WHERE (p_asso IS NULL OR p.association_id = p_asso)
        AND (p_province IS NULL OR (p.province IS NOT NULL AND p.province && p_province))
        AND (p_territory IS NULL OR (p.territoire IS NOT NULL AND p.territoire && p_territory))
        AND (p_healthzone IS NULL OR (p.zone_sante IS NOT NULL AND p.zone_sante && p_healthzone))
        AND (p_year IS NULL OR (
             p.date_debut_projet IS NOT NULL AND EXTRACT(YEAR FROM p.date_debut_projet) = ANY(p_year)
             OR p.date_fin_projet IS NOT NULL AND EXTRACT(YEAR FROM p.date_fin_projet) = ANY(p_year)
        ))
        AND (p_intervention_sector IS NULL OR p.secteurs_intervention && p_intervention_sector)
    ), json_build_object('target', 0, 'beneficiaries', 0)),
    
    'beneficiaries_profile_details', COALESCE((
      SELECT json_build_object(
        'nb_men', COALESCE(SUM(p.nombre_hommes), 0),
        'nb_women', COALESCE(SUM(p.nombre_femmes), 0),
        'nb_girls', COALESCE(SUM(p.nombre_filles), 0),
        'nb_boys', COALESCE(SUM(p.nombre_garcons), 0),
        'nb_disabled', COALESCE(SUM(p.nombre_personnes_handicapees), 0),
        'nb_old_men', COALESCE(SUM(p.nombre_hommes_agees), 0),
        'nb_old_women', COALESCE(SUM(p.nombre_femmes_agees), 0),
        'total_population', COALESCE(
          COALESCE(SUM(p.nombre_hommes), 0) + 
          COALESCE(SUM(p.nombre_femmes), 0) + 
          COALESCE(SUM(p.nombre_filles), 0) + 
          COALESCE(SUM(p.nombre_garcons), 0) + 
          COALESCE(SUM(p.nombre_hommes_agees), 0) + 
          COALESCE(SUM(p.nombre_femmes_agees), 0), 0
        )
      )
      FROM projets p
      WHERE (p_asso IS NULL OR p.association_id = p_asso)
        AND (p_province IS NULL OR (p.province IS NOT NULL AND p.province && p_province))
        AND (p_territory IS NULL OR (p.territoire IS NOT NULL AND p.territoire && p_territory))
        AND (p_healthzone IS NULL OR (p.zone_sante IS NOT NULL AND p.zone_sante && p_healthzone))
        AND (p_year IS NULL OR (
             p.date_debut_projet IS NOT NULL AND EXTRACT(YEAR FROM p.date_debut_projet) = ANY(p_year)
             OR p.date_fin_projet IS NOT NULL AND EXTRACT(YEAR FROM p.date_fin_projet) = ANY(p_year)
        ))
        AND (p_intervention_sector IS NULL OR p.secteurs_intervention && p_intervention_sector)
    ), json_build_object('nb_men', 0, 'nb_women', 0, 'nb_girls', 0, 'nb_boys', 0, 'nb_disabled', 0, 'nb_old_men', 0, 'nb_old_women', 0, 'total_population', 0))
  )
  INTO result;

  RETURN result;
END;$$;


ALTER FUNCTION "public"."get_db_stats"("p_asso" "uuid", "p_province" "text"[], "p_territory" "text"[], "p_healthzone" "text"[], "p_year" integer[], "p_intervention_sector" "text"[]) OWNER TO "postgres";

DROP FUNCTION IF EXISTS "public"."get_db_stats"("p_asso" "uuid", "p_province" "text"[], "p_territory" "text"[], "p_healthzone" "text"[], "p_year" integer[]);
