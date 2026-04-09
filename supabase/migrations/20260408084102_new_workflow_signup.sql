create extension if not exists "pg_net" with schema "public";

alter table "public"."user_profiles" drop constraint "user_profiles_edit_association_id_key";

drop index if exists "public"."user_profiles_edit_association_id_key";

alter type "public"."user_roles" add value if not exists 'pending';


  create table "public"."v_email" (
    "email" character varying
      );

CREATE UNIQUE INDEX unique_editor_per_association ON public.user_profiles USING btree (edit_association_id) WHERE (role = 'editor'::public.user_roles);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_association_editor_email(p_association_id uuid)
 RETURNS text
 LANGUAGE plpgsql
AS $function$DECLARE
  v_email text;
BEGIN
  select up.email
  into v_email
  from public.user_profiles up
  where up.edit_association_id = p_association_id
    and up.role = 'editor'::public.user_roles
  limit 1;

  return v_email;
END;$function$
;

CREATE OR REPLACE FUNCTION public.is_editor_of_association(target_association_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.user_profiles me
    where me.id = auth.uid()
      and me.role = 'editor'
      and me.edit_association_id = target_association_id
  );
$function$
;

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

CREATE OR REPLACE FUNCTION public.notify_send_editor_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'vault'
AS $function$
DECLARE
  v_webhook_secret text;
BEGIN
  SELECT decrypted_secret
    INTO v_webhook_secret
  FROM vault.decrypted_secrets
  WHERE name = 'send_editor_email_webhook_secret'
  ORDER BY created_at DESC
  LIMIT 1;

  IF coalesce(v_webhook_secret, '') = '' THEN
    RAISE EXCEPTION 'Missing vault secret: send_editor_email_webhook_secret';
  END IF;

  PERFORM net.http_post(
    url := 'http://host.docker.internal:54331/functions/v1/send-editor-email',
    body := jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'schema', TG_TABLE_SCHEMA,
      'record', to_jsonb(NEW)
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-supabase-functions', v_webhook_secret
    ),
    timeout_milliseconds := 5000
  );

  RETURN NEW;
END;
$function$
;

grant delete on table "public"."v_email" to "anon";

grant insert on table "public"."v_email" to "anon";

grant references on table "public"."v_email" to "anon";

grant select on table "public"."v_email" to "anon";

grant trigger on table "public"."v_email" to "anon";

grant truncate on table "public"."v_email" to "anon";

grant update on table "public"."v_email" to "anon";

grant delete on table "public"."v_email" to "authenticated";

grant insert on table "public"."v_email" to "authenticated";

grant references on table "public"."v_email" to "authenticated";

grant select on table "public"."v_email" to "authenticated";

grant trigger on table "public"."v_email" to "authenticated";

grant truncate on table "public"."v_email" to "authenticated";

grant update on table "public"."v_email" to "authenticated";

grant delete on table "public"."v_email" to "postgres";

grant insert on table "public"."v_email" to "postgres";

grant references on table "public"."v_email" to "postgres";

grant select on table "public"."v_email" to "postgres";

grant trigger on table "public"."v_email" to "postgres";

grant truncate on table "public"."v_email" to "postgres";

grant update on table "public"."v_email" to "postgres";

grant delete on table "public"."v_email" to "service_role";

grant insert on table "public"."v_email" to "service_role";

grant references on table "public"."v_email" to "service_role";

grant select on table "public"."v_email" to "service_role";

grant trigger on table "public"."v_email" to "service_role";

grant truncate on table "public"."v_email" to "service_role";

grant update on table "public"."v_email" to "service_role";


  create policy "Editor can read profiles from same association"
  on "public"."user_profiles"
  as permissive
  for select
  to authenticated
using (public.is_editor_of_association(edit_association_id));


CREATE TRIGGER "Email validation new user" AFTER INSERT ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.notify_send_editor_email();
