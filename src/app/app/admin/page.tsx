import Link from "next/link";
import { PageTitle } from "@/components/ui";
import { adminActions } from "@/features/admin/service";
export default async function Page() {
  const actions = await adminActions();
  return (
    <>
      <PageTitle eyebrow="Admin" title="Manage actions">
        Prepare a draft, review the details, then publish it for members.
      </PageTitle>
      <Link href="/app/admin/new" className="button">
        Create action
      </Link>
      <div className="admin-list">
        {actions.length === 0 && (
          <p>No actions yet. Create your first draft.</p>
        )}
        {actions.map((action) => (
          <article className="panel admin-row" key={action.id}>
            <div>
              <span className="eyebrow">
                {action.published_at ? "Published" : "Draft"}
                {action.is_demo ? " · Demo" : ""}
              </span>
              <h2>
                <Link href={`/app/admin/${action.id}`}>{action.title}</Link>
              </h2>
              <p>
                {action.status} ·{" "}
                {action.participant_count.toLocaleString("en-GB")} participants
              </p>
            </div>
            <Link className="text-link" href={`/app/admin/${action.id}`}>
              Edit action
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}
