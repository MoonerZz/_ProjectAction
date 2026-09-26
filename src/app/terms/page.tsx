import { PublicHeader, Footer, PageTitle } from "@/components/ui";
export default function Page() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="legal">
        <PageTitle
          eyebrow="Draft · acceptable use"
          title="Peaceful. Lawful. Voluntary."
        >
          These placeholder terms need review before public launch.
        </PageTitle>
        <h2>Choose freely and check the facts</h2>
        <p>
          Participation is optional. Read original sources and your contractual
          obligations before acting. Campaigns are fictional examples.
          Representative searches show official Parliament records, which may be
          delayed or incomplete; consult the original source. This independent
          service is not affiliated with Parliament, GOV.UK, IPSA or a political
          party.
        </p>
        <h2>What this service supports</h2>
        <p>
          Peaceful consumer choices, individual factual enquiries, legitimate
          consultation responses and attendance at public meetings under the
          organiser’s rules.
        </p>
        <h2>What is not permitted</h2>
        <ul className="readable-list">
          <li>
            Harassment, threats, intimidation or targeting individual employees.
          </li>
          <li>Vandalism, trespass, obstruction or property damage.</li>
          <li>
            Withholding taxes, council tax, fines or other legal obligations.
          </li>
          <li>Fake reviews, bogus complaints or false reports.</li>
          <li>Automated message flooding or denial-of-service behaviour.</li>
          <li>
            Disruption of emergency services or essential public services.
          </li>
          <li>Doxxing or publishing private personal information.</li>
        </ul>
        <h2>Prototype limitations</h2>
        <p>
          There are no user-submitted campaigns or public comments. Joining
          records an intention only; it does not contact anyone, cancel a
          contract or take action on your behalf. Proposal voting is planned for
          a later version.
        </p>
        <h2>Future official data</h2>
        <p>
          When Parliamentary data is integrated: “Contains Parliamentary
          information licensed under the Open Parliament Licence v3.0.” No live
          official data is included in this prototype.
        </p>
      </main>
      <Footer />
    </>
  );
}
