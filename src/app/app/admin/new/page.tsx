import Link from "next/link";
import { PageTitle } from "@/components/ui";
import { requireAdmin } from "@/features/admin/service";
import { ActionEditor } from "@/features/admin/action-editor";
export default async function Page() {
  await requireAdmin();
  return (
    <>
      <Link className="back-link" href="/app/admin">
        ← Manage actions
      </Link>
      <PageTitle eyebrow="Admin" title="Create an action">
        Start with a clear request and safe ways to take part.
      </PageTitle>
      <section className="panel">
        <ActionEditor />
      </section>
    </>
  );
}
