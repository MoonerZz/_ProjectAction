# Project Civic

A privacy-first, politically neutral UK civic participation PWA foundation. Built with Next.js 16 App Router, strict TypeScript, Tailwind CSS and Supabase-ready services. The working name, description and theme values live in `src/lib/brand.ts`.

## Scope

This version includes a public landing page, magic-link registration and login, protected dashboard, eight fictional campaigns, search and filters, private join/leave participation, representative transparency previews and account settings. It includes installable PWA metadata, PNG icons and a public offline shell. No Parliament or IPSA API is connected.

Voting on proposals, notifications, campaign submissions, comments and account deletion are **not implemented**. Their placeholders are explicitly labelled. The postcode field is an unsaved, untransmitted UI placeholder. All organisations, representatives, constituencies, figures and evidence summaries are fictional. Seed dates are fixed demonstration dates, not a live schedule.

## Local setup

Use Node.js 22.18 or newer and pnpm 11.25.0. From this directory:

```sh
pnpm install
cp .env.example .env.local
pnpm dev
```

On PowerShell, use `Copy-Item .env.example .env.local` instead of `cp`. Open http://localhost:3000. No Supabase credentials are required for development. Choose **Create an account**, enter a test email and nickname, accept the draft terms, then use **Developer: simulate sign-in**. No email is sent.

### Environment

| Variable                               | Purpose                                                                                                     |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `AUTH_MODE`                            | `mock` for local simulation; `supabase` for real authentication                                             |
| `ALLOW_MOCK_AUTH`                      | Must explicitly be `true` to use mock authentication with the production server; leave false for deployment |
| `MOCK_SESSION_SECRET`                  | Random value of at least 32 characters for stable signed mock sessions; never commit it                     |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL                                                                                        |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key; never use a service-role secret here                                              |
| `APP_URL`                              | Exact application origin, e.g. `http://localhost:3000`; use HTTPS when hosted                               |

Without configured credentials, development defaults to mock mode. A production build does not require credentials, but running protected production routes requires either configured Supabase or an explicit mock preview opt-in. For a local production/PWA preview, set `AUTH_MODE=mock`, `ALLOW_MOCK_AUTH=true` and a stable `MOCK_SESSION_SECRET` in `.env.local`, then run `pnpm build` and `pnpm start`.

### Mock authentication

The server validates registration, then stores pending values in a short-lived HTTP-only cookie. The clearly labelled developer button creates a signed mock session with a random profile ID. The session contains the profile and private joined-action IDs, expires after eight hours and is cleared on sign-out. Pending sign-in expires after ten minutes. Cookies use SameSite restrictions and use Secure when `APP_URL` is HTTPS.

Mock sessions are signed, not encrypted. Do not use sensitive details. No email or persistent mock account is created. Returning-user mock login creates a new demonstration session with a default nickname. Signing out clears participation; this intentionally does not simulate a durable account database. Without a configured secret, the development process generates one and sessions may reset after a restart. A fixed secret is required across processes for stable sessions. Mock mode must never be used as real identity verification.

## Supabase setup

1. Create a development Supabase project. Run `supabase/migrations/0001_foundation.sql` through the SQL editor or your Supabase migration workflow.
2. Optionally run `supabase/seed.sql` to load fictional campaigns. It is idempotent and will not overwrite existing records. Regenerate it from TypeScript with `pnpm exec tsx scripts/seed-sql.ts` if seed content changes.
3. Set `AUTH_MODE=supabase`, your project URL, publishable key and `APP_URL` in `.env.local`. Do not commit that file. Disable production mock opt-in.
4. Enable email authentication and email confirmation. Configure the Supabase Site URL and allow the exact `APP_URL/auth/callback` redirect. Use the normal confirmation URL in the magic-link template so the SSR PKCE flow can return a code. Configure a production SMTP provider before any public launch.
5. Restart the app. Registration uses `signInWithOtp` with signup enabled, nickname and terms-acceptance metadata. Returning-user login sets `shouldCreateUser: false`. Open the email link in the browser that requested it. The callback exchanges its code for a session. The database trigger creates the private profile; the dashboard then loads it. Invalid or expired links return to login with a useful message.

The SSR proxy refreshes Supabase cookies; authorization uses `auth.getUser()` on the server. Profile reads and all mutations require authentication. Row Level Security lets users read and update only their own profile and read/insert/delete only their own participation. Column grants allow nickname changes but not client email, ID or agreement changes. Campaigns are read-only to members. Participation uniqueness prevents duplicate joins; database triggers maintain aggregate counts without exposing participant identities. There is deliberately no public profile endpoint or email-bearing join query.

The migration is for a fresh project. Existing auth users need a deliberate profile backfill before using this app. The schema and demo seed were applied to the development Supabase project on 23 September 2026. Live SQL tests passed for two-user isolation, profile column permissions, join/leave, closed campaigns, uniqueness and participant counts; all synthetic test records were rolled back. The repeatable test is `supabase/tests/rls-smoke.sql`. Anonymous REST reads of profiles, participation and campaigns were also rejected. Real email delivery and the browser callback still require end-to-end verification. The deletion flow is only a preview and must be replaced with a working authenticated deletion service before accepting real public accounts.

## Structure

```text
src/app/                    Routes, layouts, metadata and callback
src/components/             Shared shell, navigation and UI
src/features/auth/          Auth forms, profile controls and server actions
src/features/actions/       Browsing, cards, confirmation and participation rules
src/features/representatives/ Postcode placeholder
src/lib/auth/               AuthService, mock session and Supabase SSR adapter
src/lib/data/               ActionsRepository and RepresentativesRepository adapters
src/lib/validation/         Shared input validation
src/mock-data/              Clearly fictional typed seed records
src/types/                  Domain models
supabase/                   Migration, RLS policies and optional demo seed
public/                     Service worker, offline page and install icons
tests/                      Unit and production-browser smoke tests
```

`AuthService` separates account UI from identity providers. `ActionsRepository` separates campaign UI from data and private participation. `RepresentativesRepository` currently has only a mock implementation; there is intentionally no permanent representative database schema. React escapes user-visible text, server actions validate inputs independently of browser constraints, and Supabase uses parameterised client operations.

## Checks

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

The browser tests start a separate production server on port 3100 with explicit mock mode and an isolated test secret. Run the production build first. Tests cover registration, protected routing, join/leave, nickname edits, private email display, sign-out, invalid callbacks, responsive overflow and the offline cache. Test screenshots appear in the ignored `test-results/` directory. The unit tests cover input constraints, consent, idempotent participation, closed states and threshold boundaries. `pnpm format` formats source files.

## PWA and privacy

The production service worker precaches only the static public offline page and install icons. It does not cache RSC responses, authentication callbacks, private account pages or participation data. Offline navigation displays principles and reconnection links; private data and mutations require connectivity. There is no offline mutation queue. Service workers require HTTPS or localhost. Install prompts depend on browser support; where no prompt exists, use the browser’s install/Add to Home Screen menu. Manifest and icon changes require a new service-worker cache version where appropriate.

There are no analytics or third-party fonts. Focus styles, native form labels, status announcements, mobile navigation, reduced-motion rules and text labels alongside status colours are included. This is WCAG-conscious implementation, not a completed accessibility certification.

## Future official data integrations

- **UK Parliament Members:** resolve official member and constituency identifiers behind a representative repository; add explicit record URLs and retrieval timestamps.
- **Commons Votes:** map divisions and recorded member votes, preserving “No recorded vote” without inferring abstention or motive.
- **Register of Interests:** preserve the original categories, reporting dates, descriptions and source links rather than deriving unsupported financial conclusions.
- **IPSA:** show reporting periods, corrections and categories of publicly funded business costs. Keep these separate from personal income.

Review official API fields and licences before designing permanent representative tables. Use server-side adapters with provenance, bounded caching, retries and explicit stale/error states. Do not log postcode values; any future lookup needs a documented purpose and privacy review. Required future attribution:

> Contains Parliamentary information licensed under the Open Parliament Licence v3.0.

Implementation references: [Next.js App Router](https://nextjs.org/docs/app), [Supabase server-side authentication](https://supabase.com/docs/guides/auth/server-side), and [PKCE flow](https://supabase.com/docs/guides/auth/sessions/pkce-flow).

## Principles and launch limitations

Only peaceful, lawful, voluntary and non-destructive civic or consumer action is supported. No harassment, threats, targeting employees, trespass, vandalism, obstruction, withholding legal payments, fake reviews, bogus reports, automated message flooding, denial of service, disruption of essential services or doxxing. Joining never sends messages, cancels subscriptions or takes external action automatically.

The service is independent of Parliament, GOV.UK, IPSA and every political party. Draft privacy and terms pages require operator details, retention rules, lawful-basis review, processor disclosures and functioning rights/deletion processes before launch. Production also needs real email configuration, abuse protection/rate-limit configuration, monitoring that avoids sensitive data, and independent security/accessibility review. No live official-data accuracy claims are made.
