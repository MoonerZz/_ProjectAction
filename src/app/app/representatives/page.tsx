import { PageTitle } from "@/components/ui";
import { RepresentativeLookup } from "@/features/representatives/lookup";
export default function Page() {
  return (
    <>
      <PageTitle
        eyebrow="Public records. Clearer context."
        title="Understand your representatives."
      >
        Find a current MP and explore their official voting and
        financial-interest records.
      </PageTitle>
      <RepresentativeLookup />
    </>
  );
}
