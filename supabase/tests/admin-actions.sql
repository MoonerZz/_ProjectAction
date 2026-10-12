-- Run after 0003. Synthetic users and actions are rolled back, with no emails.
begin;
select set_config('civic.test_admin', gen_random_uuid()::text, true);
select set_config('civic.test_member', gen_random_uuid()::text, true);
insert into auth.users(id,email,raw_user_meta_data) values
 (current_setting('civic.test_admin')::uuid,'admin-test@example.invalid',jsonb_build_object('nickname','Admin Test','terms_accepted_at',now())),
 (current_setting('civic.test_member')::uuid,'member-test@example.invalid',jsonb_build_object('nickname','Member Test','terms_accepted_at',now()));
insert into public.admin_memberships(profile_id) values(current_setting('civic.test_admin')::uuid);
set local role authenticated;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('civic.test_admin'),'role','authenticated')::text,true);
do $$
begin
 if not public.is_admin() then raise exception 'FAIL: admin recognition'; end if;
 insert into public.actions(id,title,summary,target,demand,action_type,status,starts_at,ends_at,participation_threshold)
 values('admin-rls-test-draft','Draft test','Synthetic test only','Test target','Test demand','Consumer action','active',now(),now()+interval '1 day',10);
 if not exists(select 1 from public.actions where id='admin-rls-test-draft' and published_at is null and not is_demo) then raise exception 'FAIL: private real draft defaults'; end if;
 begin
  update public.actions set participant_count=999 where id='admin-rls-test-draft';
  raise exception 'FAIL: admin can forge counts';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.admin_memberships(profile_id) values(current_setting('civic.test_member')::uuid);
  raise exception 'FAIL: admin can grant roles';
 exception when insufficient_privilege then null; end;
end; $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('civic.test_member'),'role','authenticated','user_metadata',json_build_object('is_admin',true))::text,true);
do $$
begin
 if public.is_admin() then raise exception 'FAIL: metadata self promotion'; end if;
 if exists(select 1 from public.actions where id='admin-rls-test-draft') then raise exception 'FAIL: draft visible to member'; end if;
 begin
  insert into public.actions(id,title,summary,target,demand,action_type,status,starts_at,ends_at,participation_threshold)
  values('member-illegal-action','Illegal test','Synthetic test','Test','Test demand','Consumer action','active',now(),now()+interval '1 day',10);
  raise exception 'FAIL: member can insert';
 exception when insufficient_privilege then null; end;
 update public.actions set title='Member tamper' where id='clearer-prices';
 if found then raise exception 'FAIL: member can edit'; end if;
 begin
  insert into public.action_participation(action_id,profile_id) values('admin-rls-test-draft',auth.uid());
  raise exception 'FAIL: member can join draft';
 exception when insufficient_privilege then null; end;
end; $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('civic.test_admin'),'role','authenticated')::text,true);
update public.actions set published_at=now() where id='admin-rls-test-draft' and revision=1;
do $$ begin
 if not exists(select 1 from public.actions where id='admin-rls-test-draft' and revision=2) then raise exception 'FAIL: publish and revision'; end if;
 update public.actions set title='Stale edit' where id='admin-rls-test-draft' and revision=1;
 if found then raise exception 'FAIL: stale revision accepted'; end if;
end; $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('civic.test_member'),'role','authenticated')::text,true);
do $$ begin
 if not exists(select 1 from public.actions where id='admin-rls-test-draft') then raise exception 'FAIL: published action hidden'; end if;
 insert into public.action_participation(action_id,profile_id) values('admin-rls-test-draft',auth.uid());
 if (select participant_count from public.actions where id='admin-rls-test-draft') <> 1 then raise exception 'FAIL: participation count'; end if;
end; $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('civic.test_admin'),'role','authenticated')::text,true);
update public.actions set published_at=null where id='admin-rls-test-draft';
select set_config('request.jwt.claims',json_build_object('sub',current_setting('civic.test_member'),'role','authenticated')::text,true);
do $$ begin
 if exists(select 1 from public.actions where id='admin-rls-test-draft') then raise exception 'FAIL: unpublish did not hide'; end if;
 delete from public.action_participation where action_id='admin-rls-test-draft' and profile_id=auth.uid();
 if not found then raise exception 'FAIL: cannot leave unpublished action'; end if;
end; $$;
set local role anon;
do $$ begin
 begin
  perform public.is_admin();
  raise exception 'FAIL: anonymous admin RPC';
 exception when insufficient_privilege then null; end;
 begin
  perform id from public.actions;
  raise exception 'FAIL: anonymous actions';
 exception when insufficient_privilege then null; end;
end; $$;
reset role;
rollback;
select 'PASS: admin permissions, private drafts, publish/unpublish, protected counts, revision conflicts, joins and anonymous denial. Synthetic data rolled back.' as result;
