import { PublicHeader, Footer, PageTitle } from "@/components/ui";
export default function Page() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="legal">
        <PageTitle
          eyebrow="Draft · prototype notice"
          title="Privacy comes first."
        >
          This placeholder notice must be reviewed and completed before public
          launch.
        </PageTitle>
        <h2>Minimal account information</h2>
        <p>
          We use an email address for authentication, a public nickname,
          agreement timestamps and private action participation. Your email and
          joined actions are never displayed publicly.
        </p>
        <h2>Information we do not request</h2>
        <p>
          We do not request a real name, date of birth, phone number, home
          address, photo or government ID, precise location or political
          affiliation. Representative searches send your postcode or
          constituency name through our hosting provider to UK Parliament. We do
          not save searches to your profile or database, cache postcode queries,
          or deliberately include them in application logs. Parliament and
          hosting providers may process technical request data. Public MP
          records are cached separately by MP ID.
        </p>
        <h2>Local mock mode</h2>
        <p>
          A signed, HTTP-only browser cookie holds the mock profile and joined
          actions for up to eight hours. It is signed, not encrypted. A pending
          sign-in cookie expires after ten minutes. Signing out clears both.
          There is no email delivery or permanent mock account. Do not use
          sensitive information in this prototype.
        </p>
        <h2>When Supabase is configured</h2>
        <p>
          Authentication and private profiles are stored in the configured
          Supabase project. Access policies restrict profiles and participation
          to their owner. Necessary session cookies support sign-in. No
          analytics or advertising trackers are included. Hosting and
          authentication providers may process technical connection data.
        </p>
        <h2>Offline use</h2>
        <p>
          The service worker caches only a public offline page and icons. It
          does not cache your account, email or participation pages.
        </p>
        <h2>Before launch</h2>
        <p>
          The operator must publish their identity, contact details, lawful
          bases, retention periods, processor and transfer information, and
          procedures for access, correction, deletion and complaints. You can
          permanently delete your account, profile and private participation
          from your profile page. Campaign totals are updated. Provider backups
          and technical logs may remain until their retention periods end.
        </p>
      </main>
      <Footer />
    </>
  );
}
