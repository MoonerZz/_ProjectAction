begin;

-- Membership is provisioned by the project owner, never by user metadata.
create table public.admin_memberships (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_memberships enable row level security;
revoke all on public.admin_memberships from public, anon, authenticated;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.admin_memberships where profile_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Preserve the eight existing demonstration campaigns. New actions start private.
alter table public.actions add column published_at timestamptz default now();
alter table public.actions alter column published_at drop default;
alter table public.actions add column is_demo boolean not null default true;
alter table public.actions alter column is_demo set default false;
alter table public.actions add column revision integer not null default 1;

alter policy action_read on public.actions using (
  exists(select 1 from public.profiles where id = (select auth.uid()))
  and (published_at is not null or (select public.is_admin()))
);
create policy admin_action_insert on public.actions for insert to authenticated
  with check ((select public.is_admin()) and participant_count = 0 and revision = 1);
create policy admin_action_update on public.actions for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
grant insert(id,title,summary,target,demand,action_type,status,starts_at,ends_at,
  participation_threshold,safety_notes,alternatives,sources,published_at,is_demo)
  on public.actions to authenticated;
grant update(title,summary,target,demand,action_type,status,starts_at,ends_at,
  participation_threshold,safety_notes,alternatives,sources,published_at)
  on public.actions to authenticated;
alter policy own_participation_insert on public.action_participation with check (
  (select auth.uid()) = profile_id and exists (
    select 1 from public.actions a where a.id = action_id
    and a.published_at is not null and a.status in ('active','scheduled')
  )
);

-- Optimistic concurrency also catches a participation change while an editor is open.
create function public.bump_action_revision() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.revision := old.revision + 1;
  new.updated_at := clock_timestamp();
  return new;
end; $$;
create trigger action_revision before update on public.actions
for each row execute function public.bump_action_revision();
revoke all on function public.bump_action_revision() from public, anon, authenticated;
commit;
