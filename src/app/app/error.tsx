"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="panel" role="alert">
      <h1>We couldn’t load this page.</h1>
      <p>
        Check your connection and try again. Your participation won’t change
        unless an update succeeds.
      </p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
