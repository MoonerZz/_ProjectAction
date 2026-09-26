import Link from "next/link";
import { PublicHeader, Footer, PageTitle } from "@/components/ui";
export default function Page() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="legal">
        <PageTitle
          eyebrow="Account deleted"
          title="Your account has been deleted."
        >
          Your sign-in account, profile and private participation records have
          been removed from the live service. You are signed out.
        </PageTitle>
        <p>
          Campaign totals have been updated. Provider backups and technical logs
          may remain until their retention periods end.
        </p>
        <Link className="button" href="/">
          Return home
        </Link>
      </main>
      <Footer />
    </>
  );
}
