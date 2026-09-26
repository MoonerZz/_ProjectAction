begin;
-- No caller-supplied target ID, dynamic SQL or administrator key is required.
create function public.delete_own_account() returns void
language plpgsql security definer set search_path = '' as $$
declare
  caller uuid := auth.uid();
begin
  if caller is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  delete from auth.users where id = caller;
  if not found then
    raise exception 'Account unavailable' using errcode = '42501';
  end if;
end;
$$;
revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
-- A previously issued JWT must not retain campaign access after deletion.
alter policy action_read on public.actions
using (exists (select 1 from public.profiles where id = (select auth.uid())));
commit;
