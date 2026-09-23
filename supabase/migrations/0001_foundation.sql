-- Private accounts. No public profile or participation queries are permitted.
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 email text not null,
 nickname text not null check(char_length(trim(nickname)) between 2 and 32),
 terms_accepted_at timestamptz not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table public.actions (
 id text primary key,
 title text not null,
 summary text not null,
 target text not null,
 demand text not null,
 action_type text not null check(action_type in ('Consumer action','National civic action','Local council action')),
 status text not null check(status in ('proposed','voting','scheduled','active','completed','cancelled')),
 starts_at timestamptz not null,
 ends_at timestamptz not null check(ends_at >= starts_at),
 participation_threshold integer not null check(participation_threshold > 0),
 participant_count integer not null default 0 check(participant_count >= 0),
 safety_notes text[] not null default '{}',
 alternatives text[] not null default '{}',
 sources jsonb not null default '[]',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table public.action_participation (
 id uuid primary key default gen_random_uuid(),
 action_id text not null references public.actions(id) on delete cascade,
 profile_id uuid not null references public.profiles(id) on delete cascade,
 joined_at timestamptz not null default now(),
 unique(action_id,profile_id)
);
create index action_participation_profile_idx on public.action_participation(profile_id);
alter table public.profiles enable row level security;
alter table public.actions enable row level security;
alter table public.action_participation enable row level security;
revoke all on public.profiles, public.actions, public.action_participation from anon, authenticated;
grant select on public.profiles to authenticated;
grant update(nickname,updated_at) on public.profiles to authenticated;
grant select on public.actions to authenticated;
grant select,insert,delete on public.action_participation to authenticated;
create policy own_profile_read on public.profiles for select to authenticated using ((select auth.uid())=id);
create policy own_profile_update on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
create policy action_read on public.actions for select to authenticated using (true);
create policy own_participation_read on public.action_participation for select to authenticated using ((select auth.uid())=profile_id);
create policy own_participation_insert on public.action_participation for insert to authenticated with check ((select auth.uid())=profile_id and exists(select 1 from public.actions a where a.id=action_id and a.status in ('active','scheduled')));
create policy own_participation_delete on public.action_participation for delete to authenticated using ((select auth.uid())=profile_id);
-- Profile creation is tied to the authenticated identity, never an ID supplied by the client.
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.raw_user_meta_data->>'nickname' is null or new.raw_user_meta_data->>'terms_accepted_at' is null then
  raise exception 'Nickname and agreement to terms are required';
 end if;
 insert into public.profiles(id,email,nickname,terms_accepted_at)
 values(new.id,new.email,trim(new.raw_user_meta_data->>'nickname'),(new.raw_user_meta_data->>'terms_accepted_at')::timestamptz);
 return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
-- Atomic aggregate updates; participant identities never leave their private table.
create function public.update_participant_count() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='INSERT' then
  update public.actions set participant_count=participant_count+1 where id=new.action_id;
  return new;
 else
  update public.actions set participant_count=greatest(0,participant_count-1) where id=old.action_id;
  return old;
 end if;
end; $$;
create trigger participation_count after insert or delete on public.action_participation for each row execute function public.update_participant_count();
revoke all on function public.handle_new_user(), public.update_participant_count() from public,anon,authenticated;
