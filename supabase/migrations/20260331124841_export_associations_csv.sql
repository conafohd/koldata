-- Helper function to clean and escape CSV field values
CREATE OR REPLACE FUNCTION clean_csv_field(field_value TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    IF field_value IS NULL THEN
        RETURN '""';
    END IF;
    
    -- Remove newlines and carriage returns, then escape quotes
    RETURN '"' || REPLACE(REPLACE(REPLACE(field_value, E'\n', ' '), E'\r', ''), '"', '""') || '"';
END;
$$;

-- Function to export associations data as CSV
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
    csv_header := 'ID;Name;Acronym;Description;Organization Type;Other Org Type;Year Created;Intervention Sectors;Other Sectors;Province;Territory;Health Zone;Health Area;Locality;Latitude;Longitude;Altitude;Precision;Budget 2022;Budget 2023;Budget 2024;Budget 2025;Budget 2026;Employees;Volunteers;Profile Manager Name;Profile Manager Email;Organization Email;Contact Name;Contact Phone;Contact Email;Website;Facebook;Twitter;Instagram;LinkedIn;TikTok;Other Social Media;Logo URL;Created At;Updated At';
    
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
                clean_csv_field(budget_2022::TEXT),
                clean_csv_field(budget_2023::TEXT),
                clean_csv_field(budget_2024::TEXT),
                clean_csv_field(budget_2025::TEXT),
                clean_csv_field(budget_2026::TEXT),
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION export_associations_csv() TO authenticated;

COMMENT ON FUNCTION export_associations_csv() IS 'Exports all associations data as CSV format';

-- Test the function (this will verify the SQL syntax is correct)
-- Uncomment the line below to test manually:
-- SELECT export_associations_csv();
