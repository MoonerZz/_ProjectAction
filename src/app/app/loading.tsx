export default function Loading() {
  return (
    <section className="panel" role="status" aria-live="polite">
      <h2>Loading your civic space…</h2>
      <p>Gathering your private account and demonstration records.</p>
      <div className="loading-bar" />
    </section>
  );
}
