-- Synthetic accounts only. Every change is rolled back, including on failure.
begin;
select set_config('civic.delete_a', gen_random_uuid()::text, true);
select set_config('civic.delete_b', gen_random_uuid()::text, true);
select set_config('civic.count_before', participant_count::text, true)
from public.actions where id = 'clearer-prices';
insert into auth.users(id,email,raw_user_meta_data) values
(current_setting('civic.delete_a')::uuid, 'delete-a@example.invalid', jsonb_build_object('nickname','Delete A','terms_accepted_at',now())),
(current_setting('civic.delete_b')::uuid, 'delete-b@example.invalid', jsonb_build_object('nickname','Keep B','terms_accepted_at',now()));
insert into public.action_participation(action_id,profile_id) values
('clearer-prices',current_setting('civic.delete_a')::uuid),
('clearer-prices',current_setting('civic.delete_b')::uuid);
set local role anon;
do $$ begin
  begin
    perform public.delete_own_account();
    raise exception 'FAIL: anonymous deletion allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{}', true);
do $$ begin
  begin
    perform public.delete_own_account();
    raise exception 'FAIL: missing identity allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
select set_config('request.jwt.claims', json_build_object('sub',current_setting('civic.delete_a'),'role','authenticated')::text, true);
select public.delete_own_account();
do $$ begin
  if exists(select 1 from public.profiles) or exists(select 1 from public.action_participation) or exists(select 1 from public.actions) then
    raise exception 'FAIL: deleted identity retains data access';
  end if;
  begin
    perform public.delete_own_account();
    raise exception 'FAIL: replay accepted';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
do $$ begin
  if exists(select 1 from auth.users where id=current_setting('civic.delete_a')::uuid)
    or exists(select 1 from public.profiles where id=current_setting('civic.delete_a')::uuid)
    or exists(select 1 from public.action_participation where profile_id=current_setting('civic.delete_a')::uuid) then
    raise exception 'FAIL: account cascade incomplete';
  end if;
  if not exists(select 1 from auth.users where id=current_setting('civic.delete_b')::uuid)
    or not exists(select 1 from public.profiles where id=current_setting('civic.delete_b')::uuid)
    or not exists(select 1 from public.action_participation where profile_id=current_setting('civic.delete_b')::uuid) then
    raise exception 'FAIL: other account changed';
  end if;
  if (select participant_count from public.actions where id='clearer-prices') <> current_setting('civic.count_before')::int+1 then
    raise exception 'FAIL: aggregate count';
  end if;
end $$;
rollback;
select 'PASS: own-account cascade, other-account isolation, counts, anonymous denial and stale-token denial. All test data rolled back.' as result;
