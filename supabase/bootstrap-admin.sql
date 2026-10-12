-- Apply migration 0003 and its rollback-only test first.
-- Set civic.bootstrap_email to the existing account email before running.
-- This allows the initial grant without committing a personal email address.
begin;
do $$
declare target uuid;
begin
 if nullif(current_setting('civic.bootstrap_email',true),'') is null then
   raise exception 'Set civic.bootstrap_email to the designated account email first.';
 end if;
 select id into target from public.profiles where lower(email) = lower(current_setting('civic.bootstrap_email'));
 if target is null then raise exception 'The designated account must register before granting admin access.'; end if;
 if exists(select 1 from public.admin_memberships where profile_id <> target) then
   raise exception 'Other admins already exist; inspect memberships before proceeding.';
 end if;
 insert into public.admin_memberships(profile_id) values(target) on conflict do nothing;
end; $$;
commit;
select p.email, m.created_at from public.admin_memberships m join public.profiles p on p.id=m.profile_id;
