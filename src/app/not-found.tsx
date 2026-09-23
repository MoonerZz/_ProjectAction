import Link from "next/link";
export default function NotFound() {
  return (
    <div className="auth-wrap">
      <section className="auth-card">
        <h1>This page isn’t here.</h1>
        <p>
          The link may be incorrect or the action may no longer be available.
        </p>
        <Link className="button" href="/app">
          Go to your dashboard
        </Link>
      </section>
    </div>
  );
}
