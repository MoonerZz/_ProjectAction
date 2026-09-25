-- Run in the Supabase SQL editor after the migration and demo seed.
-- Two synthetic users exist only inside this transaction; no email is sent.
begin;
select set_config('civic.test_user_a', gen_random_uuid()::text, true);
select set_config('civic.test_user_b', gen_random_uuid()::text, true);
select set_config('civic.original_count', participant_count::text, true)
from public.actions where id = 'clearer-prices';
insert into auth.users (id, email, raw_user_meta_data)
values
 (current_setting('civic.test_user_a')::uuid, 'civic-rls-a@example.invalid', jsonb_build_object('nickname','Test A','terms_accepted_at',now())),
 (current_setting('civic.test_user_b')::uuid, 'civic-rls-b@example.invalid', jsonb_build_object('nickname','Test B','terms_accepted_at',now()));
insert into public.action_participation(action_id,profile_id)
values ('subscription-choice',current_setting('civic.test_user_b')::uuid);
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',current_setting('civic.test_user_a'),'role','authenticated')::text, true);
do $$
begin
 if (select count(*) from public.profiles) <> 1 then raise exception 'FAIL: profile isolation'; end if;
 if (select count(*) from public.action_participation) <> 0 then raise exception 'FAIL: participation isolation'; end if;
 update public.profiles set nickname='Updated test A' where id=auth.uid();
 if not found then raise exception 'FAIL: own nickname update'; end if;
 update public.profiles set nickname='Not permitted' where id=current_setting('civic.test_user_b')::uuid;
 if found then raise exception 'FAIL: cross-account profile update'; end if;
 begin
  update public.profiles set email='changed@example.invalid' where id=auth.uid();
  raise exception 'FAIL: client email update allowed';
 exception when insufficient_privilege then null;
 end;
 insert into public.action_participation(action_id,profile_id) values('clearer-prices',auth.uid());
 if (select count(*) from public.action_participation) <> 1 then raise exception 'FAIL: own participation visibility'; end if;
 if (select participant_count from public.actions where id='clearer-prices') <> current_setting('civic.original_count')::int+1 then raise exception 'FAIL: aggregate increment'; end if;
 begin
  insert into public.action_participation(action_id,profile_id) values('clearer-prices',auth.uid());
  raise exception 'FAIL: duplicate participation allowed';
 exception when unique_violation then null;
 end;
 begin
  insert into public.action_participation(action_id,profile_id) values('clearer-prices',current_setting('civic.test_user_b')::uuid);
  raise exception 'FAIL: cross-account participation allowed';
 exception when insufficient_privilege then null;
 end;
 begin
  insert into public.action_participation(action_id,profile_id) values('park-access',auth.uid());
  raise exception 'FAIL: completed campaign join allowed';
 exception when insufficient_privilege then null;
 end;
 delete from public.action_participation where profile_id=current_setting('civic.test_user_b')::uuid;
 if found then raise exception 'FAIL: cross-account leave allowed'; end if;
 delete from public.action_participation where action_id='clearer-prices' and profile_id=auth.uid();
 if not found then raise exception 'FAIL: own leave'; end if;
 if (select participant_count from public.actions where id='clearer-prices') <> current_setting('civic.original_count')::int then raise exception 'FAIL: aggregate decrement'; end if;
end; $$;
reset role;
rollback;
select 'PASS: ownership, column grants, join/leave, closed states, uniqueness and counts. Synthetic data rolled back.' as result;
