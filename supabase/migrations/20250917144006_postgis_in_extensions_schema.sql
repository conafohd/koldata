-- Drop extension and everything depending on it
-- DROP EXTENSION postgis CASCADE;
-- CREATE EXTENSION postgis SCHEMA extensions;


DROP EXTENSION postgis CASCADE;

create extension if not exists "postgis" with schema "extensions";
ALTER TABLE "public"."provinces" DROP COLUMN IF EXISTS centroid;
ALTER TABLE "public"."provinces" ADD COLUMN IF NOT EXISTS centroid extensions.geometry;
  
ALTER TABLE "public"."territoires" DROP COLUMN IF EXISTS centroid;
ALTER TABLE "public"."territoires" ADD COLUMN IF NOT EXISTS centroid extensions.geometry;
  

ALTER TABLE "public"."zones_sante" DROP COLUMN IF EXISTS centroid;
ALTER TABLE "public"."zones_sante" ADD COLUMN IF NOT EXISTS centroid extensions.geometry;
  
DO $$
BEGIN
  IF to_regclass('public.spatial_ref_sys') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL PRIVILEGES ON TABLE "public"."spatial_ref_sys" FROM "anon", "authenticated", "postgres", "service_role"';
  END IF;

  IF to_regclass('extensions.spatial_ref_sys') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL PRIVILEGES ON TABLE "extensions"."spatial_ref_sys" FROM "anon", "authenticated", "postgres", "service_role"';
  END IF;
END $$;

drop type if exists "public"."geometry_dump";

drop type if exists "public"."valid_detail";
