"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Users, Landmark, UserRound } from "lucide-react";
const links = [
  { href: "/app", label: "Home", Icon: House },
  { href: "/app/actions", label: "Actions", Icon: Users },
  { href: "/app/representatives", label: "Representatives", Icon: Landmark },
  { href: "/app/profile", label: "Profile", Icon: UserRound },
];
export function AppNav() {
  const path = usePathname();
  return (
    <nav className="app-nav" aria-label="Main navigation">
      {links.map(({ href, label, Icon }) => {
        const active = href === "/app" ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={active ? "active" : ""}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={21} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
