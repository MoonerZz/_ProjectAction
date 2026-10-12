import Link from "next/link";
import { Landmark, ArrowUpRight, ShieldCheck } from "lucide-react";
import { brand } from "@/lib/brand";
import type { ReactNode } from "react";
export function Logo() {
  return (
    <Link className="logo" href="/">
      <span className="logo-mark">
        <Landmark size={23} />
      </span>
      {brand.name}
      <span className="beta">EARLY ACCESS</span>
    </Link>
  );
}
export function PublicHeader() {
  return (
    <header className="public-header">
      <Logo />
      <nav aria-label="Account">
        <Link href="/login">Sign in</Link>
        <Link className="button small" href="/signup">
          Create an account <ArrowUpRight size={16} />
        </Link>
      </nav>
    </header>
  );
}
export function Footer() {
  return (
    <footer>
      <span>Independent. Non-partisan. Built for participation.</span>
      <div>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms & acceptable use</Link>
      </div>
      <p>
        Not affiliated with Parliament, GOV.UK, IPSA or any political party.
      </p>
    </footer>
  );
}
export function DemoNotice() {
  return (
    <div className="demo-notice">
      <ShieldCheck size={17} />
      <span>
        <strong>Prototype.</strong> Sample campaigns are labelled as demos.
        Representative searches use official UK Parliament records.
      </span>
    </div>
  );
}
export function PageTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-title">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </div>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
export const money = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
export const date = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/London",
  }).format(new Date(value));
