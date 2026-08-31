-- The `association-logos` storage bucket has never had RLS policies defined
-- on storage.objects, so every insert/update/delete is rejected by the
-- default-deny policy, even for admins and the association's own editor.
-- Files are stored as `logos/{association_id}-{uuid}.{ext}`, so we key
-- write access off that association_id prefix.

create policy "Public read access to association logos"
on storage.objects for select
to public
using (bucket_id = 'association-logos');

create policy "Admins manage all association logos"
on storage.objects for all
to authenticated
using (bucket_id = 'association-logos' and public.is_admin())
with check (bucket_id = 'association-logos' and public.is_admin());

create policy "Editors manage their association logo"
on storage.objects for all
to authenticated
using (
  bucket_id = 'association-logos'
  and exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid()
      and up.role = 'editor'
      and up.edit_association_id is not null
      and name like 'logos/' || up.edit_association_id::text || '-%'
  )
)
with check (
  bucket_id = 'association-logos'
  and exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid()
      and up.role = 'editor'
      and up.edit_association_id is not null
      and name like 'logos/' || up.edit_association_id::text || '-%'
  )
);

create policy "Creators manage their draft association logo"
on storage.objects for all
to authenticated
using (
  bucket_id = 'association-logos'
  and exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid()
      and up.role = 'creator'
  )
  and name like 'logos/temp-%'
)
with check (
  bucket_id = 'association-logos'
  and exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid()
      and up.role = 'creator'
  )
  and name like 'logos/temp-%'
);
