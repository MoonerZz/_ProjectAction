import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Landmark,
  CalendarDays,
  Users,
} from "lucide-react";
import { requireProfile } from "@/lib/auth/service";
import { actionsRepository } from "@/lib/data/repositories";
import { PageTitle, date } from "@/components/ui";
import { ActionCard } from "@/features/actions/action-card";
export default async function Dashboard() {
  const profile = await requireProfile();
  const actions = await actionsRepository().list();
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
            <span className="tiny-label">OFFICIAL RECORDS</span>
          </div>
          <article className="panel representative-preview">
            <div className="rep-placeholder">
              <Landmark size={35} />
            </div>
            <h3>Find your MP</h3>
            <p>
              Look up a postcode or constituency to see official Parliament
              records, recent votes and registered interests.
            </p>
            <p className="field-help">
              Your search is not saved to your account.
            </p>
            <Link className="button secondary full" href="/app/representatives">
              Find your representative <ArrowUpRight size={16} />
            </Link>
          </article>
        </section>
      </div>
    </>
  );
}
