import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { buildAdminSetup } from "../scripts/prepare-admin-setup.mjs";
const schema = `
create role anon nologin;
create role authenticated nologin;
create schema auth;
create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb);
create function auth.uid() returns uuid language sql stable as $$
select (nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid
$$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
`;
const read = (file) =>
  readFile(new URL("../supabase/" + file, import.meta.url), "utf8");
test("admin setup and PostgreSQL privacy rules pass without external services", async () => {
  const db = new PGlite();
  try {
    await db.exec(schema);
    for (const file of [
      "migrations/0001_foundation.sql",
      "migrations/0002_account_deletion.sql",
      "seed.sql",
    ])
      await db.exec(await read(file));
    await db.exec(
      `insert into auth.users(id,email,raw_user_meta_data) values('00000000-0000-0000-0000-000000000001','owner@example.invalid',jsonb_build_object('nickname','Owner Test','terms_accepted_at',now()));`,
    );
    await db.exec(await buildAdminSetup("owner@example.invalid"));
    const admins = await db.query(
      "select count(*)::int as total from public.admin_memberships",
    );
    assert.equal(admins.rows[0].total, 1);
    for (const file of [
      "tests/rls-smoke.sql",
      "tests/account-deletion.sql",
      "tests/admin-actions.sql",
    ]) {
      const results = await db.exec(await read(file));
      assert.match(results.at(-1).rows[0].result, /^PASS:/);
    }
    // The setup is deliberately one-time. An accidental rerun cannot alter data.
    await assert.rejects(
      db.exec(await buildAdminSetup("owner@example.invalid")),
    );
    await db.exec("rollback;");
    const remaining = await db.query(
      "select count(*)::int as total from public.admin_memberships",
    );
    assert.equal(remaining.rows[0].total, 1);
  } finally {
    await db.close();
  }
});
