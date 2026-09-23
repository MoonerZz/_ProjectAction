import Link from "next/link";
import { PublicHeader, Footer } from "@/components/ui";
import { authMode } from "@/lib/auth/config";
import { AuthForm } from "./auth-form";
import { brand } from "@/lib/brand";
export function AuthPage({
  signup,
  error,
}: {
  signup: boolean;
  error?: string;
}) {
  return (
    <>
      <PublicHeader />
      <main id="main" className="auth-wrap">
        <section className="auth-card">
          <span className="eyebrow">Participation, on your terms</span>
          <h1>{signup ? "A voice. Not a data trail." : "Welcome back."}</h1>
          <p>
            {signup
              ? "Just an email and a nickname to get started."
              : "Sign in with a private link sent to your email."}
          </p>
          {authMode() === "mock" && (
            <div className="demo-notice">Local development / mock mode</div>
          )}
          {error && (
            <p className="error-message" role="alert">
              This link is invalid or has expired. Request a new sign-in link
              below.
            </p>
          )}
          <AuthForm signup={signup} mock={authMode() === "mock"} />
          <p className="auth-switch">
            {signup ? "Already have an account?" : `New to ${brand.name}?`}{" "}
            <Link href={signup ? "/login" : "/signup"}>
              {signup ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </section>
        <p className="auth-caption">
          No real name. No ID. No phone number. No address.
        </p>
      </main>
      <Footer />
    </>
  );
}
