import Link from "next/link";
import { ArrowUpRight, CalendarDays, Users } from "lucide-react";
import type { CivicAction } from "@/types";
import { progress } from "./participation";
import { date } from "@/components/ui";
export function ActionProgress({ action }: { action: CivicAction }) {
  return (
    <div className="participation">
      <div>
        <span>
          <strong>{action.participant_count.toLocaleString("en-GB")}</strong>{" "}
          approximate participants
        </span>
        <span>
          {action.participation_threshold.toLocaleString("en-GB")} goal
        </span>
      </div>
      <progress
        value={progress(
          action.participant_count,
          action.participation_threshold,
        )}
        max={100}
        aria-label="Participants against activation threshold"
      />
    </div>
  );
}
export function ActionCard({
  action,
  featured = false,
}: {
  action: CivicAction;
  featured?: boolean;
}) {
  return (
    <article className={`action-card ${featured ? "featured" : ""}`}>
      <div className="card-top">
        <span className="category">
          <Users size={15} />
          {action.action_type}
        </span>
        <span className={`status ${action.status}`}>{action.status}</span>
      </div>
      <h3>
        <Link href={`/app/actions/${action.id}`}>{action.title}</Link>
      </h3>
      {action.is_demo !== false && (
        <span className="eyebrow">Demo campaign</span>
      )}
      <p>{action.summary}</p>
      <ActionProgress action={action} />
      <div className="card-bottom">
        <span>
          <CalendarDays size={15} />
          {date(action.starts_at)}
        </span>
        <Link href={`/app/actions/${action.id}`}>
          {action.joined ? "Joined · View action" : "Explore action"}
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </article>
  );
}
