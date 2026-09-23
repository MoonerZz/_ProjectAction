import { PageTitle } from "@/components/ui";
import { actionsRepository } from "@/lib/data/repositories";
import { ActionBrowser } from "@/features/actions/action-browser";
export default async function Page() {
  return (
    <>
      <PageTitle
        eyebrow="Small choices. Shared purpose."
        title="Find your way to take part."
      >
        Explore peaceful, lawful campaigns. Read the context and choose for
        yourself.
      </PageTitle>
      <ActionBrowser actions={await actionsRepository().list()} />
    </>
  );
}
