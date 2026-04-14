create or replace function public.get_verified_admin_members()
returns table (
  id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  first_name text,
  last_name text,
  role public.user_roles,
  edit_association_id uuid,
  email character varying
)
language sql
security definer
set search_path = public, auth
as $function$
  select
    up.id,
    up.created_at,
    up.updated_at,
    up.first_name,
    up.last_name,
    up.role,
    up.edit_association_id,
    up.email
  from public.user_profiles up
  inner join auth.users au on au.id = up.id
  where public.is_admin()
    and up.role <> 'admin'::public.user_roles
    and au.email_confirmed_at is not null;
$function$;
