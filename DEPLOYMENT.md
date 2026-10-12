# Prototype deployment

Repository: https://github.com/MoonerZz/_ProjectAction

Supabase project: `hqrhkhtzrmolbyhqgnwv`

The repository is public. Never commit `.env.local`, database passwords, SMTP credentials, Supabase secret/service-role keys or hosting access tokens. Local environment files and Vercel CLI metadata are ignored by Git.

## Database

Already applied to this project on 23 September 2026: the foundation migration and eight fictional campaigns. The rollback-only checks in `supabase/tests/rls-smoke.sql` passed against the live database. Do not apply the initial migration again.

In the Supabase SQL editor, apply `supabase/migrations/0001_foundation.sql` to the fresh project, then `supabase/seed.sql`. The migration creates private profiles, private participation, read-only campaigns, ownership policies and aggregate-count triggers. The seed adds eight fictional campaigns.

Do not rerun the initial migration over existing tables. Inspect the schema first. The seed uses `on conflict do nothing` and can be rerun without overwriting rows.

## Vercel

Import the repository using the Next.js framework preset and the repository root. Keep the lockfile and use the package manager specified in `package.json`.

Configure the following environment variables for the deployment:

| Variable                               | Value                                                                   |
| -------------------------------------- | ----------------------------------------------------------------------- |
| `AUTH_MODE`                            | `supabase`                                                              |
| `ALLOW_MOCK_AUTH`                      | `false`                                                                 |
| `NEXT_PUBLIC_SUPABASE_URL`             | `https://hqrhkhtzrmolbyhqgnwv.supabase.co`                              |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | The project's publishable key, entered directly in environment settings |
| `APP_URL`                              | The final HTTPS production origin, with no trailing slash               |

No database password, service-role key or mock-session secret is needed by this deployment. Redeploy after environment changes. Use a development Supabase project for unrelated preview branches rather than changing the production callback to arbitrary preview URLs.

## Authentication

In Supabase Authentication URL Configuration:

- Set Site URL to the same production origin as `APP_URL`.
- Allow the exact production `/auth/callback` URL.
- For local development, also allow `http://localhost:3000/auth/callback`.

Keep email confirmation enabled. The normal Supabase confirmation URL in its email template supports the application's PKCE callback. Sign-in links should be opened in the same browser that requested them.

Supabase's built-in sender is limited to project team email addresses. Configure an SMTP provider and verified sending domain before inviting other testers. Do not switch to mock authentication to bypass email-delivery setup on the public deployment.

## Verify before sharing

Check protected routes while signed out, then perform a real email sign-in. Verify profile creation, join/leave persistence, nickname updates and sign-out. Check isolation with two separate accounts and test on a real phone. Notifications and proposal voting remain explicitly labelled placeholders. Campaign content is fictional; representative lookup uses official Parliament records.

The SQL migration and email-delivery configuration require authenticated Supabase dashboard access; the publishable key alone cannot administer them.

## Account deletion update — 26 September 2026

Migration `0002_account_deletion.sql` is applied. The rollback-only test `supabase/tests/account-deletion.sql` passed for caller-only deletion, profile/participation cascades, aggregate counts, anonymous and missing-identity denial, replay denial and stale-token data denial. No existing accounts were deleted. No extra environment variable or administrator key is needed.

## Parliament lookup — 26 September 2026

No additional environment variables or database changes. Outbound HTTPS to `members-api.parliament.uk` is required. Public MP data uses hourly revalidation; postcode/constituency queries are not cached. Eight unit tests and five browser tests passed, including a real Parliament lookup and mobile layout check.

## Admin actions — 12 October 2026

Generate the one-time setup with `node scripts/prepare-admin-setup.mjs EXISTING_ADMIN_EMAIL OUTPUT.sql`, then run that output once in the Supabase SQL editor. It combines migration 0003, rollback-only permission checks and the initial admin grant in a single transaction. The bootstrap refuses to proceed if a different admin already exists. Keep generated scripts containing the owner's email outside the repository. No admin role can be granted from the app or from user-editable metadata.

Deploy the admin commit after migration and bootstrap succeed. The Admin navigation item appears only for a current database admin. Admins can create and edit drafts, publish after reviewing evidence and safety, and unpublish without deleting participation. Members see only published actions. Participation counts and membership grants cannot be changed through the app. Revisions reject concurrent edits. Existing campaigns remain published and are labelled as demos; newly created actions start as real, private drafts.

No new Vercel variables or service-role key are needed. Email-code login and session changes are on hold pending custom SMTP.

Validate with `pnpm test`, `pnpm test:db`, `pnpm lint`, `pnpm build`, `pnpm test:e2e` and `pnpm test:e2e:admin`. The admin browser suite uses a localhost-only Supabase protocol fixture; the SQL suite uses an isolated PGlite PostgreSQL instance and separately verifies row-level security with a minimal Auth schema fixture. Live database setup and a production admin sign-in remain separate release checks.
