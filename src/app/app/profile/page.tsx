import Link from "next/link";
import { PageTitle, Empty } from "@/components/ui";
import { requireProfile } from "@/lib/auth/service";
import { actionsRepository } from "@/lib/data/repositories";
import {
  ProfileControls,
  AccountDeletion,
} from "@/features/auth/profile-controls";
import { signOut } from "@/features/auth/server-actions";
export default async function Page() {
  const profile = await requireProfile();
  const joined = (await actionsRepository().list()).filter((a) => a.joined);
  return (
    <>
      <PageTitle eyebrow="Private by default" title="Your profile.">
        A nickname for participation. An email for signing in. Nothing extra.
      </PageTitle>
      <div className="grid two">
        <section className="panel">
          <h2>Account details</h2>
          <p className="private-email">
            <span className="field-help">
              Private email address · visible only to you
            </span>
            <br />
            {profile.email}
          </p>
          <ProfileControls nickname={profile.nickname} />
          <form action={signOut}>
            <button className="text-link sign-out">
              Sign out of this account
            </button>
          </form>
        </section>
        <section className="panel">
          <h2>What’s stored</h2>
          <ul className="readable-list">
            <li>Your email address and public nickname.</li>
            <li>Account timestamps and agreement to the terms.</li>
            <li>The actions you choose to join, privately.</li>
          </ul>
          <h3>What we don’t ask for</h3>
          <p>
            Your real name, date of birth, phone number, home address, ID,
            precise location or political affiliation.
          </p>
          <Link className="text-link" href="/privacy">
            Read the privacy notice →
          </Link>
        </section>
      </div>
      <section className="panel interests">
        <div className="section-heading">
          <h2>Your joined actions</h2>
          <span className="tiny-label">ONLY VISIBLE TO YOU</span>
        </div>
        {joined.length ? (
          joined.map((a) => (
            <div className="joined-row" key={a.id}>
              <Link href={`/app/actions/${a.id}`}>{a.title} →</Link>
              <span className="status">{a.status}</span>
            </div>
          ))
        ) : (
          <Empty title="Your list starts here.">
            You haven’t joined any actions.{" "}
            <Link href="/app/actions">Explore the available actions.</Link>
          </Empty>
        )}
      </section>
      <AccountDeletion />
    </>
  );
}
