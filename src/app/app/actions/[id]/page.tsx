import Link from "next/link";
import { notFound } from "next/navigation";
import { actionsRepository } from "@/lib/data/repositories";
import { PageTitle, date } from "@/components/ui";
import { ActionProgress } from "@/features/actions/action-card";
import { JoinForm } from "@/features/actions/join-form";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const action = await actionsRepository().get((await params).id);
  if (!action) notFound();
  return (
    <>
      <Link className="back-link" href="/app/actions">
        ← All actions
      </Link>
      <PageTitle eyebrow={action.action_type} title={action.title}>
        {action.summary}
      </PageTitle>
      <div className="detail-grid">
        <section className="panel">
          <span className={`status ${action.status}`}>{action.status}</span>
          <h2>A clear, specific request</h2>
          <p className="field-help">Directed to {action.target}</p>
          <p className="demand">{action.demand}</p>
          <dl className="dates">
            <div>
              <dt>Starts</dt>
              <dd>{date(action.starts_at)}</dd>
            </div>
            <div>
              <dt>Ends</dt>
              <dd>{date(action.ends_at)}</dd>
            </div>
          </dl>
          <h3>Safety & legality</h3>
          <ul className="readable-list">
            {action.safety_notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <h3>Other ways to participate</h3>
          <ul className="readable-list">
            {action.alternatives.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <h3>Evidence & sources</h3>
          {action.sources.map((source, index) => (
            <p className="source-placeholder" key={index}>
              {source.url?.startsWith("https://") ? (
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.label} ↗
                </a>
              ) : (
                <>{source.label} · Placeholder, no live evidence available</>
              )}
            </p>
          ))}
          {action.is_demo !== false && (
            <p className="field-help">
              This is a fictional campaign for demonstrating the interface, not
              a verified real-world allegation.
            </p>
          )}
        </section>
        <aside>
          <section className="panel">
            <h2>Shared participation</h2>
            <ActionProgress action={action} />
            <p className="field-help">
              {action.is_demo !== false ? "Demonstration counts. " : ""}The
              threshold illustrates interest; it does not automatically trigger
              any action.
            </p>
            <hr />
            <JoinForm key={String(action.joined)} action={action} />
          </section>
        </aside>
      </div>
    </>
  );
}
