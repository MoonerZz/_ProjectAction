import Link from "next/link";
import { Mail } from "lucide-react";
import { PublicHeader, Footer } from "@/components/ui";
import { authMode } from "@/lib/auth/config";
import { simulateAuth } from "@/features/auth/server-actions";
export const dynamic = "force-dynamic";
export default function Page() {
  const mock = authMode() === "mock";
  return (
    <>
      <PublicHeader />
      <main id="main" className="auth-wrap">
        <section className="auth-card">
          <Mail size={32} />
          <h1>{mock ? "Try the local experience." : "Check your email."}</h1>
          <p>
            {mock
              ? "No email has been sent. Use the developer button below to simulate successful authentication."
              : "If this address can sign in, a magic link will arrive shortly. Open it in this browser to continue. Check your spam folder too."}
          </p>
          {mock && (
            <form action={simulateAuth}>
              <button className="button">Developer: simulate sign-in</button>
            </form>
          )}
          <p className="field-help">
            {mock
              ? "This session is stored in a signed, private browser cookie and expires after 8 hours."
              : "Links expire and can only be used once. Never forward your link to anyone."}
          </p>
          <Link href="/login" className="text-link">
            Use a different email or request a new link
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
