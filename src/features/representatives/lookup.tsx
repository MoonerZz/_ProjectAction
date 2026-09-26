"use client";
import { useActionState } from "react";
import { lookupRepresentative } from "./server-actions";
export function RepresentativeLookup() {
  const [state, action, pending] = useActionState(lookupRepresentative, {});
  const details = state.details;
  const source = details
    ? `https://members.parliament.uk/member/${details.member.id}`
    : "";
  return (
    <>
      <form action={action} className="postcode">
        <label htmlFor="location">Postcode or constituency name</label>
        <div>
          <input
            id="location"
            name="location"
            required
            minLength={2}
            maxLength={100}
            autoComplete="off"
            aria-describedby="lookup-help"
            placeholder="For example, SW1A 0AA or Westminster"
          />
          <button className="button secondary" disabled={pending}>
            {pending ? "Looking up…" : "Find MP"}
          </button>
        </div>
        <p id="lookup-help" className="field-help">
          Sent through our server to UK Parliament when you search. We don’t
          save it to your account or our database. You can use a constituency
          name instead of a postcode.
        </p>
      </form>
      <div aria-live="polite" aria-busy={pending}>
        {state.error && (
          <p className="error-message" role="alert">
            {state.error}
          </p>
        )}
        {!pending && state.searched && state.members?.length === 0 && (
          <p className="notice">
            No current MP matched. Check the full postcode or try a constituency
            name. A vacant seat may not return an MP.
          </p>
        )}
        {!pending && !details && !!state.members?.length && (
          <section className="panel">
            <h2>Choose a constituency</h2>
            <p>More than one MP matched. Select the constituency you want.</p>
            {state.more && (
              <p>
                Showing up to 20 results. Use a more specific name or full
                postcode to narrow your search.
              </p>
            )}
            <form action={action} className="form">
              {state.members.map((member) => (
                <button
                  className="button secondary"
                  key={member.id}
                  name="memberId"
                  value={member.id}
                  disabled={pending}
                >
                  {member.constituency} — {member.name}
                </button>
              ))}
            </form>
          </section>
        )}
      </div>
      {!pending && details && (
        <>
          <section className="panel rep-header">
            <div>
              <span className="tiny-label">UK PARLIAMENT RECORD</span>
              <h2>{details.member.name}</h2>
              <p>
                {details.member.constituency} · {details.member.party}
              </p>
              <a
                className="text-link"
                href={`${source}/contact`}
                target="_blank"
                rel="noreferrer"
              >
                Official profile and contact details ↗
              </a>
              <p className="field-help">
                Retrieved{" "}
                {new Date(details.checkedAt).toLocaleString("en-GB", {
                  timeZone: "Europe/London",
                })}{" "}
                (UK time). Public records are refreshed hourly and may be older
                during an upstream outage.
              </p>
            </div>
          </section>
          <section className="panel interests" id="votes">
            <h2>Recent recorded votes</h2>
            {details.votes === null ? (
              <p>
                Voting records are temporarily unavailable. Use the official
                record below or search again.
              </p>
            ) : details.votes.length === 0 ? (
              <p>No voting records were returned.</p>
            ) : (
              details.votes.map((vote) => (
                <div className="vote-record" key={vote.id}>
                  <div>
                    <h3>
                      <a
                        href={`https://votes.parliament.uk/Votes/Commons/Division/${vote.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {vote.title} ↗
                      </a>
                    </h3>
                    <span className="field-help">
                      {new Date(vote.date).toLocaleDateString("en-GB", {
                        timeZone: "Europe/London",
                      })}
                    </span>
                  </div>
                  <span className="status">{vote.position}</span>
                </div>
              ))
            )}
            <p className="field-help">
              Up to ten recent records. Aye and No refer to the specific motion,
              which may be an amendment rather than a whole bill. This is not an
              attendance score; missing votes do not establish abstention.
            </p>
            <a
              className="text-link"
              href={`${source}/voting`}
              target="_blank"
              rel="noreferrer"
            >
              Full official voting record ↗
            </a>
          </section>
          <section className="panel interests">
            <h2>Registered financial interests</h2>
            <p>
              Published register entries, separate from parliamentary business
              costs. Read the full register for dates, corrections and context.
            </p>
            {details.interests === null ? (
              <p>
                Interest records are temporarily unavailable. Use the official
                register below or search again.
              </p>
            ) : details.interests.length === 0 ? (
              <p>
                No current entries were returned by this API. Check the official
                register before drawing conclusions.
              </p>
            ) : (
              details.interests.map((interest) => (
                <div className="interest-record" key={interest.id}>
                  <h3>{interest.category}</h3>
                  <p
                    style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                  >
                    {interest.text}
                  </p>
                </div>
              ))
            )}
            <a
              className="text-link"
              href={`${source}/registeredinterests`}
              target="_blank"
              rel="noreferrer"
            >
              Full official register ↗
            </a>
          </section>
          <section className="panel interests" id="costs">
            <h2>Parliamentary business costs</h2>
            <p>
              IPSA business-cost data is not connected yet. These costs fund
              parliamentary duties and are not personal income.
            </p>
          </section>
        </>
      )}
      <p className="field-help">
        Source: UK Parliament. Contains Parliamentary information licensed under
        the{" "}
        <a
          href="https://www.parliament.uk/site-information/copyright-parliament/open-parliament-licence/"
          target="_blank"
          rel="noreferrer"
        >
          Open Parliament Licence v3.0
        </a>
        . This independent service is not endorsed by Parliament.
      </p>
    </>
  );
}
