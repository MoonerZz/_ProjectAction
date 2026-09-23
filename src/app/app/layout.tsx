import { Bell, LogOut, ShieldCheck } from "lucide-react";
import { requireProfile } from "@/lib/auth/service";
import { authMode } from "@/lib/auth/config";
import { signOut } from "@/features/auth/server-actions";
import { Logo, DemoNotice } from "@/components/ui";
import { AppNav } from "@/components/app-nav";
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();
  return (
    <div className="app-shell">
      <header className="app-header">
        <Logo />
        <div className="header-account">
          {authMode() === "mock" && (
            <span className="mock-tag">LOCAL MOCK MODE</span>
          )}
          <span
            className="notification"
            title="Notifications are not available in this prototype"
            aria-label="Notifications: coming later"
          >
            <Bell size={20} />
          </span>
          <span className="avatar">
            {profile.nickname.slice(0, 1).toUpperCase()}
          </span>
        </div>
      </header>
      <aside className="sidebar">
        <span className="nav-caption">YOUR CIVIC SPACE</span>
        <AppNav />
        <div className="sidebar-bottom">
          <ShieldCheck size={22} />
          <strong>Your participation is private.</strong>
          <p>Your joined actions are never displayed publicly.</p>
          <form action={signOut}>
            <button className="sign-out">
              <LogOut size={18} />
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main id="main" className="app-main">
        <DemoNotice />
        {children}
        <div className="app-footnote">
          Independent information. Peaceful participation. Your choice.
        </div>
      </main>
    </div>
  );
}
