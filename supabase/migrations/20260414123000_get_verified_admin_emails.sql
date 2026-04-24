create or replace function public.get_verified_admin_emails()
returns table (
  email character varying
)
language sql
security definer
set search_path = public, auth
as $function$
  select distinct up.email
  from public.user_profiles up
  inner join auth.users au on au.id = up.id
  where up.role = 'admin'::public.user_roles
    and au.email_confirmed_at is not null
    and coalesce(up.email, '') <> '';
$function$;
