-- Applied to cwtpeabebkoveachrclo on 2026-09-25.
-- Each user record is scoped to a property; owner may read and admins may write.
create table if not exists public.shared_records (
  collection text not null,
  property_id text not null references public.properties(id) on delete cascade,
  id text not null,
  payload jsonb not null,
  created_by uuid not null references public.profiles(id),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (collection, property_id, id),
  constraint shared_records_collection check (collection in (
    'expenses','contracts','contractPayments','ownerPayouts','extraRevenue','ical',
    'featuresContracts','featuresExtraRevenue','icalConnections','recurringExpenses',
    'contractDetails','guestDetails','extraAttachments','audit'
  )),
  constraint shared_records_payload check (jsonb_typeof(payload) = 'object')
);
alter table public.shared_records enable row level security;
revoke all on public.shared_records from anon;
grant select, insert, update on public.shared_records to authenticated;
create policy shared_records_read on public.shared_records for select to authenticated
  using (private.is_super_admin() or exists (
    select 1 from public.property_access pa
    where pa.property_id = shared_records.property_id and pa.user_id = (select auth.uid())
  ));
create policy shared_records_insert on public.shared_records for insert to authenticated
  with check (created_by = (select auth.uid()) and (private.is_super_admin() or exists (
    select 1 from public.properties p
    where p.id = property_id and p.administrator_id = (select auth.uid())
  )));
create policy shared_records_update on public.shared_records for update to authenticated
  using (private.is_super_admin() or exists (
    select 1 from public.properties p
    where p.id = property_id and p.administrator_id = (select auth.uid())
  ))
  with check (private.is_super_admin() or exists (
    select 1 from public.properties p
    where p.id = property_id and p.administrator_id = (select auth.uid())
  ));
