import Link from "next/link";
import { PageTitle } from "@/components/ui";
import { adminAction } from "@/features/admin/service";
import { ActionEditor } from "@/features/admin/action-editor";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const action = await adminAction((await params).id);
  const { saved } = await searchParams;
  return (
    <>
      <Link className="back-link" href="/app/admin">
        ← Manage actions
      </Link>
      <PageTitle
        eyebrow={action.published_at ? "Published action" : "Private draft"}
        title="Edit action"
      >
        {action.title}
      </PageTitle>
      {saved && (
        <p className="success-message" role="status">
          Action saved.{" "}
          {action.published_at
            ? "Members can see it now."
            : "Only admins can see this draft."}
        </p>
      )}
      {action.published_at && (
        <p>
          <Link className="text-link" href={`/app/actions/${action.id}`}>
            View member page →
          </Link>
        </p>
      )}
      <section className="panel">
        <ActionEditor key={action.revision} action={action} />
      </section>
    </>
  );
}
