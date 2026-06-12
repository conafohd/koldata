create table assessments (
  id             uuid        primary key default gen_random_uuid(),
  association_id uuid        not null references associations(id) on delete cascade,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  finalized_at   timestamptz,
  fields         jsonb       not null default '{}'
);

alter table assessments enable row level security;

create policy "Admin full access on assessments"
  on assessments for all
  using (is_admin());

create policy "Editor read own association assessments"
  on assessments for select
  using (
    association_id = (
      select edit_association_id from public.user_profiles where id = auth.uid()
    )
  );

create policy "Editor insert own association assessments"
  on assessments for insert
  with check (
    check_user_has_edit_association()
    and association_id = (
      select edit_association_id from public.user_profiles where id = auth.uid()
    )
  );

create policy "Editor update own association assessments"
  on assessments for update
  using (
    association_id = (
      select edit_association_id from public.user_profiles where id = auth.uid()
    )
  )
  with check (
    association_id = (
      select edit_association_id from public.user_profiles where id = auth.uid()
    )
  );

create policy "Editor delete own association assessments"
  on assessments for delete
  using (
    association_id = (
      select edit_association_id from public.user_profiles where id = auth.uid()
    )
  );
