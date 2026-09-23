import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Landmark,
  CalendarDays,
  Users,
} from "lucide-react";
import { requireProfile } from "@/lib/auth/service";
import {
  actionsRepository,
  representativesRepository,
} from "@/lib/data/repositories";
import { PageTitle, money, date } from "@/components/ui";
import { ActionCard } from "@/features/actions/action-card";
export default async function Dashboard() {
  const profile = await requireProfile();
  const actions = await actionsRepository().list();
  const mp = await representativesRepository.getPreview();
  const featured = actions.find((a) => a.status === "active");
  const upcoming = actions.find((a) => a.status === "scheduled");
  const joined = actions.filter((a) => a.joined).length;
  return (
    <>
      <PageTitle
        eyebrow="Your civic overview"
        title={`Hello, ${profile.nickname}.`}
      >
        A little more informed. A little more involved. Always on your terms.
      </PageTitle>
      <div className="dashboard-grid">
        <section>
          <div className="section-heading">
            <h2>Make your next move</h2>
            <Link href="/app/actions">
              All actions <ArrowRight size={16} />
            </Link>
          </div>
          {featured ? (
            <ActionCard action={featured} featured />
          ) : (
            <p>No active actions right now.</p>
          )}
          <div className="grid two compact">
            <article className="panel upcoming">
              <span className="eyebrow">
                <CalendarDays size={16} />
                Coming up
              </span>
              <h3>{upcoming?.title || "Nothing scheduled yet"}</h3>
              {upcoming && (
                <>
                  <p>{date(upcoming.starts_at)} · Optional participation</p>
                  <Link
                    className="text-link"
                    href={`/app/actions/${upcoming.id}`}
                  >
                    See what’s planned <ArrowUpRight size={16} />
                  </Link>
                </>
              )}
            </article>
            <article className="panel joined-stat">
              <Users size={23} />
              <span className="big-number">
                {joined.toString().padStart(2, "0")}
              </span>
              <strong>Actions you’ve joined</strong>
              <Link href="/app/profile">
                Your private participation <ArrowRight size={15} />
              </Link>
            </article>
          </div>
        </section>
        <section>
          <div className="section-heading">
            <h2>Your representative</h2>
            <span className="tiny-label">DEMO</span>
          </div>
          <article className="panel representative-preview">
            <div className="rep-placeholder">
              <Landmark size={35} />
            </div>
            <h3>{mp.name}</h3>
            <p>{mp.constituency}</p>
            <span className="field-help">{mp.party}</span>
            <hr />
            <div className="metric-line">
              <span>Recorded voting participation</span>
              <strong>
                {Math.round(
                  (mp.participation.recorded / mp.participation.total) * 100,
                )}
                %
              </strong>
            </div>
            <p className="field-help">
              {mp.participation.recorded} of {mp.participation.total} example
              divisions
            </p>
            <Link className="button secondary full" href="/app/representatives">
              Meet your representative <ArrowUpRight size={16} />
            </Link>
          </article>
        </section>
      </div>
      <div className="grid two">
        <article className="panel">
          <div className="section-heading">
            <h2>In the voting record</h2>
            <Landmark size={20} />
          </div>
          <span className="field-help">
            Latest fictional division · {date(mp.votes[0].date)}
          </span>
          <h3>{mp.votes[0].title}</h3>
          <div className="vote-line">
            <span>{mp.name}</span>
            <span className="status active">
              Voted {mp.votes[0].position.toLowerCase()}
            </span>
          </div>
          <Link className="text-link" href="/app/representatives#votes">
            Explore recent votes <ArrowUpRight size={16} />
          </Link>
        </article>
        <article className="panel">
          <div className="section-heading">
            <h2>Public money, in context</h2>
            <span className="tiny-label">2025–26 · DEMO</span>
          </div>
          <div className="expense-number">
            {money(Object.values(mp.costs).reduce((a, b) => a + b, 0))}
          </div>
          <p>
            Example publicly funded business costs. These support an MP’s work
            and are not personal income.
          </p>
          <Link className="text-link" href="/app/representatives#costs">
            See the breakdown <ArrowUpRight size={16} />
          </Link>
        </article>
      </div>
    </>
  );
}
