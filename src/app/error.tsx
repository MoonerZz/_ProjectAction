"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="auth-wrap">
      <section className="auth-card">
        <h1>Something needs attention.</h1>
        <p>
          Try again shortly. For local setup, check the authentication
          environment variables in the README.
        </p>
        <button className="button" onClick={reset}>
          Try again
        </button>
      </section>
    </main>
  );
}
