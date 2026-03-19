alter table "public"."user_profiles" drop constraint "user_profiles_edit_association_id_key";

drop index if exists "public"."user_profiles_edit_association_id_key";

alter type public.user_roles add value if not exists 'pending';

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$DECLARE
  matching_association_id UUID;
  v_role text;
  v_edit_association_id text;
BEGIN
  v_role := NEW.raw_user_meta_data ->> 'role';
  v_edit_association_id := NEW.raw_user_meta_data ->> 'edit_association_id';

  IF v_role IS NULL OR v_role = '' THEN
    RAISE EXCEPTION 'Missing role in raw_user_meta_data';
  END IF;

  IF v_edit_association_id IS NULL OR v_edit_association_id = '' THEN
    RAISE EXCEPTION 'Missing edit_association_id in raw_user_meta_data';
  END IF;

  SELECT id
    INTO matching_association_id
  FROM public.associations
  WHERE LOWER(email_resp_edition) = LOWER(NEW.email);

  INSERT INTO public.user_profiles (
    id,
    email,
    first_name,
    last_name,
    edit_association_id,
    role
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    v_edit_association_id::uuid,
    v_role::public.user_roles
  );

  RETURN NEW;
END;$function$
;


