import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Landmark,
  ReceiptText,
  Users,
  ShieldCheck,
  Check,
} from "lucide-react";
import { PublicHeader, Footer } from "@/components/ui";
export default function Landing() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="landing">
        <section className="hero">
          <div>
            <span className="eyebrow">A clearer way to take part</span>
            <h1>
              Public decisions.
              <br />
              Collective action.
              <br />
              <em>Your choice.</em>
            </h1>
            <p>
              Understand how your representatives vote, see how public money is
              used, and discover peaceful, lawful ways to make a difference.
            </p>
            <div className="hero-buttons">
              <Link className="button" href="/signup">
                Create an account <ArrowUpRight size={19} />
              </Link>
              <Link className="text-link" href="/login">
                Already a member? Sign in <ArrowRight size={16} />
              </Link>
            </div>
            <div className="privacy-line">
              <ShieldCheck size={18} /> Your voice matters. Your personal life
              stays yours.
            </div>
          </div>
          <div className="hero-preview">
            <div className="preview-top">
              <span className="eyebrow">A little clarity goes a long way</span>
              <Landmark size={27} />
            </div>
            <div className="preview-head">
              From information
              <br />
              to participation.
            </div>
            <div className="preview-row">
              <span className="step">01</span>
              <div>
                <strong>Understand the record</strong>
                <p>Votes, interests and public business costs.</p>
              </div>
              <Check size={18} />
            </div>
            <div className="preview-row">
              <span className="step">02</span>
              <div>
                <strong>Explore the options</strong>
                <p>Clear demands. Evidence. Lawful choices.</p>
              </div>
              <Check size={18} />
            </div>
            <div className="preview-row">
              <span className="step">03</span>
              <div>
                <strong>Take part on your terms</strong>
                <p>No public participant lists. No pressure.</p>
              </div>
              <Check size={18} />
            </div>
            <div className="preview-bottom">
              INDEPENDENT BY DESIGN <span>OPEN TO EVERY PERSPECTIVE</span>
            </div>
          </div>
        </section>
        <section className="feature-section">
          <div className="section-heading">
            <h2>A more informed kind of participation.</h2>
            <span>Less noise. More context.</span>
          </div>
          <div className="grid three">
            {[
              {
                Icon: Landmark,
                title: "Understand your representatives.",
                text: "Explore voting records and registered interests, with the context to understand them.",
              },
              {
                Icon: ReceiptText,
                title: "See where public money goes.",
                text: "Understand published business costs, clearly separated from personal income.",
              },
              {
                Icon: Users,
                title: "Take lawful collective action.",
                text: "Find peaceful campaigns with specific goals and decide what feels right for you.",
              },
            ].map(({ Icon, title, text }, i) => (
              <article className="feature" key={title}>
                <div className="feature-top">
                  <Icon size={25} />
                  <span>0{i + 1}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="privacy-banner">
          <ShieldCheck size={30} />
          <div>
            <h2>Participation shouldn’t cost your privacy.</h2>
            <p>
              Register with an email and a nickname. No real name, ID, phone
              number or address required. Your email and joined actions stay
              private.
            </p>
          </div>
          <Link className="text-link" href="/privacy">
            Our privacy approach <ArrowUpRight size={18} />
          </Link>
        </section>
        <p className="landing-demo">
          An early working prototype. Campaigns are fictional demonstration
          data. Representative searches use official UK Parliament records.
        </p>
      </main>
      <Footer />
    </>
  );
}
