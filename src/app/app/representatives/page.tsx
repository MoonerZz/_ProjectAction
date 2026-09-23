import { Landmark, ExternalLink } from "lucide-react";
import { PageTitle, money, date } from "@/components/ui";
import { representativesRepository } from "@/lib/data/repositories";
import { PostcodePlaceholder } from "@/features/representatives/postcode-placeholder";
function Source() {
  return (
    <a
      className="text-link"
      href="https://www.parliament.uk/"
      target="_blank"
      rel="noreferrer"
    >
      View official source <ExternalLink size={14} />
      <span className="field-help">(Parliament homepage; record pending)</span>
    </a>
  );
}
export default async function Page() {
  const mp = await representativesRepository.getPreview();
  const total = Object.values(mp.costs).reduce((a, b) => a + b, 0);
  return (
    <>
      <PageTitle
        eyebrow="Public records. Clearer context."
        title="Understand your representatives."
      >
        An example of how official records could be brought together, without
        losing the detail.
      </PageTitle>
      <PostcodePlaceholder />
      <section className="panel rep-header">
        <div
          className="rep-placeholder large"
          aria-label="MP photograph placeholder"
        >
          <Landmark size={42} />
        </div>
        <div>
          <span className="tiny-label">FICTIONAL REPRESENTATIVE</span>
          <h2>{mp.name}</h2>
          <p>
            {mp.constituency} · {mp.party}
          </p>
          <p className="field-help">{mp.roles.join(" · ")}</p>
          <span className="source-placeholder">
            Contact links will appear here when official records are connected.
          </span>
        </div>
      </section>
      <div className="grid two">
        <section className="panel" id="votes">
          <div className="section-heading">
            <h2>Recent votes</h2>
            <span className="tiny-label">DEMO</span>
          </div>
          {mp.votes.map((vote) => (
            <div className="vote-record" key={vote.title}>
              <div>
                <h3>{vote.title}</h3>
                <span className="field-help">{date(vote.date)}</span>
              </div>
              <span className="status">{vote.position}</span>
            </div>
          ))}
          <p>
            <strong>
              {mp.participation.recorded} of {mp.participation.total}
            </strong>{" "}
            example divisions have a recorded vote.
          </p>
          <p className="field-help">
            “No recorded vote” does not establish why no vote was recorded and
            is not automatically an abstention.
          </p>
          <Source />
        </section>
        <section className="panel" id="costs">
          <div className="section-heading">
            <h2>Business costs</h2>
            <span className="tiny-label">2025–26 · DEMO</span>
          </div>
          <div className="expense-number">{money(total)}</div>
          <p>
            Publicly funded costs of carrying out parliamentary duties. These
            are not personal income.
          </p>
          {Object.entries(mp.costs).map(([label, value]) => (
            <div className="cost-row" key={label}>
              <div>
                <span>{label}</span>
                <strong>{money(value)}</strong>
              </div>
              <progress
                value={value}
                max={total}
                aria-label={`${label} share of business costs`}
              />
            </div>
          ))}
          <a
            className="text-link"
            href="https://www.theipsa.org.uk/"
            target="_blank"
            rel="noreferrer"
          >
            View official source <ExternalLink size={14} />
          </a>
          <p className="field-help">
            IPSA homepage placeholder, not a source for these fictional figures.
          </p>
        </section>
      </div>
      <section className="panel interests">
        <h2>Registered financial interests</h2>
        <p>
          Fictional examples of published interests, separate from publicly
          funded business costs.
        </p>
        <ul className="readable-list">
          {mp.interests.map((interest) => (
            <li key={interest}>{interest}</li>
          ))}
        </ul>
        <Source />
      </section>
      <div className="notice">
        Future live information will come from official UK Parliament and IPSA
        sources. Always consult the original record for context, reporting
        periods and corrections.
      </div>
    </>
  );
}
