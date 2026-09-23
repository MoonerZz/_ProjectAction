"use client";
import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { requestLink } from "./server-actions";
export function AuthForm({ signup, mock }: { signup: boolean; mock: boolean }) {
  const [state, action, pending] = useActionState(requestLink, {});
  return (
    <form action={action} className="form">
      <input type="hidden" name="intent" value={signup ? "signup" : "login"} />
      <label>
        Email address
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          placeholder="you@example.com"
        />
        <span className="field-help">
          Private. Never displayed to other members.
        </span>
      </label>
      {signup && (
        <label>
          Public nickname
          <input
            name="nickname"
            autoComplete="nickname"
            required
            minLength={2}
            maxLength={32}
            pattern="[\p{L}\p{N} _\-]{2,32}"
            placeholder="How you’d like to be known"
          />
          <span className="field-help">
            2–32 letters, numbers, spaces, hyphens or underscores.
          </span>
        </label>
      )}
      {signup && (
        <label className="checkbox">
          <input name="terms" type="checkbox" required />
          <span>
            I agree to the{" "}
            <Link href="/terms">terms and acceptable-use rules</Link> and have
            read the <Link href="/privacy">privacy notice</Link>.
          </span>
        </label>
      )}
      {state.error && (
        <p role="alert" className="error-message">
          {state.error}
        </p>
      )}
      <button className="button" disabled={pending}>
        {pending
          ? "Please wait…"
          : mock
            ? "Continue in mock mode"
            : "Send me a sign-in link"}
        <ArrowRight size={18} />
      </button>
      <p className="field-help">
        <LockKeyhole size={14} /> No password to remember.{" "}
        {mock
          ? "Mock mode does not send emails."
          : "Your sign-in link is private and expires."}
      </p>
    </form>
  );
}
