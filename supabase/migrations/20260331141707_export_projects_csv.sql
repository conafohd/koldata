-- Function to export projects data as CSV
CREATE OR REPLACE FUNCTION export_projects_csv()
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
        RAISE EXCEPTION 'Access denied. Only administrators can export projects data.';
    END IF;
    
    -- Build CSV header (using semicolon for European Excel compatibility)
    csv_header := 'ID;Project Title;Financial/Technical Partner;Donors;Other Donor;Intervention Sectors;Other Sector;Start Date;End Date;Status;Province;Territory;Health Zone;Health Area;Locality;Budget;Services Provided;Other Services;Beneficiary Types;Other Beneficiary Types;Total Target People;Men;Women;Girls;Boys;People Reached;Disabled People;Elderly Men;Elderly Women;Association ID;Consortium;Consortium Partners;Created At;Updated At';
    
    -- Build CSV data rows
    SELECT string_agg(csv_row, E'\n')
    INTO csv_rows
    FROM (
        SELECT 
            CONCAT_WS(';',
                clean_csv_field(id::TEXT),
                clean_csv_field(intitule_projet),
                clean_csv_field(partenaire_financier_technique),
                clean_csv_field(array_to_string(noms_bailleurs_fonds, '; ')),
                clean_csv_field(autre_bailleur_fonds),
                clean_csv_field(array_to_string(secteurs_intervention, '; ')),
                clean_csv_field(autre_secteur_intervention),
                clean_csv_field(date_debut_projet::TEXT),
                clean_csv_field(date_fin_projet::TEXT),
                clean_csv_field(statut_projet),
                clean_csv_field(array_to_string(province, '; ')),
                clean_csv_field(array_to_string(territoire, '; ')),
                clean_csv_field(array_to_string(zone_sante, '; ')),
                clean_csv_field(aire_sante),
                clean_csv_field(localite_village_quartier),
                clean_csv_field(budget_projet::TEXT),
                clean_csv_field(array_to_string(types_services_fournis, '; ')),
                clean_csv_field(autre_type_services_fournis),
                clean_csv_field(array_to_string(types_beneficiaires_populations_cibles, '; ')),
                clean_csv_field(autre_types_beneficiaires_populations_cibles),
                clean_csv_field(nombre_total_personnes_cibles::TEXT),
                clean_csv_field(nombre_hommes::TEXT),
                clean_csv_field(nombre_femmes::TEXT),
                clean_csv_field(nombre_filles::TEXT),
                clean_csv_field(nombre_garcons::TEXT),
                clean_csv_field(nombre_personnes_atteintes::TEXT),
                clean_csv_field(nombre_personnes_handicapees::TEXT),
                clean_csv_field(nombre_hommes_agees::TEXT),
                clean_csv_field(nombre_femmes_agees::TEXT),
                clean_csv_field(association_id::TEXT),
                clean_csv_field(consortium::TEXT),
                clean_csv_field(partenaires_consortium),
                clean_csv_field(created_at::TEXT),
                clean_csv_field(updated_at::TEXT)
            ) AS csv_row
        FROM public.projets
        ORDER BY intitule_projet
    ) AS rows;
    
    -- Combine header and rows with UTF-8 BOM for Excel compatibility
    csv_output := E'\uFEFF' || csv_header || E'\n' || COALESCE(csv_rows, '');
    
    RETURN csv_output;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION export_projects_csv() TO authenticated;

COMMENT ON FUNCTION export_projects_csv() IS 'Exports all projects data as CSV format';
