-- Applied to project cwtpeabebkoveachrclo on 2026-09-25.
-- New reservations belong to one property and can be written only by its administrator.
create table if not exists public.reservation_records (
  id text primary key,
  property_id text not null references public.properties(id) on delete cascade,
  payload jsonb not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservation_payload_object check (jsonb_typeof(payload) = 'object'),
  constraint reservation_payload_dates check (
    (payload->>'checkIn') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' and
    (payload->>'checkOut') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
  )
);
alter table public.reservation_records enable row level security;
revoke all on public.reservation_records from anon;
grant select, insert, update, delete on public.reservation_records to authenticated;

create policy reservation_records_read on public.reservation_records for select to authenticated
  using (private.is_super_admin() or exists (
    select 1 from public.property_access pa
    where pa.property_id = reservation_records.property_id and pa.user_id = (select auth.uid())
  ));
create policy reservation_records_insert on public.reservation_records for insert to authenticated
  with check (created_by = (select auth.uid()) and (private.is_super_admin() or (private.is_admin() and exists (
    select 1 from public.property_access pa
    where pa.property_id = reservation_records.property_id and pa.user_id = (select auth.uid())
  ))));
create policy reservation_records_update on public.reservation_records for update to authenticated
  using (private.is_super_admin() or (private.is_admin() and exists (
    select 1 from public.property_access pa
    where pa.property_id = reservation_records.property_id and pa.user_id = (select auth.uid())
  )))
  with check (private.is_super_admin() or (private.is_admin() and exists (
    select 1 from public.property_access pa
    where pa.property_id = reservation_records.property_id and pa.user_id = (select auth.uid())
  )));
create policy reservation_records_delete on public.reservation_records for delete to authenticated
  using (private.is_super_admin() or (private.is_admin() and exists (
    select 1 from public.property_access pa
    where pa.property_id = reservation_records.property_id and pa.user_id = (select auth.uid())
  )));
