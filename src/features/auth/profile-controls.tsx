"use client";
import { useActionState, useState } from "react";
import { deleteAccount, updateNickname } from "./server-actions";
export function ProfileControls({ nickname }: { nickname: string }) {
  const [state, action, pending] = useActionState(updateNickname, {});
  return (
    <form action={action} className="form">
      <label>
        Public nickname
        <input
          name="nickname"
          defaultValue={nickname}
          required
          minLength={2}
          maxLength={32}
        />
        <span className="field-help">
          Your email address is never used as your public name.
        </span>
      </label>
      <button className="button" disabled={pending}>
        {pending ? "Saving…" : "Save nickname"}
      </button>
      {state.error && (
        <p className="error-message" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="success-message" role="status">
          {state.success}
        </p>
      )}
    </form>
  );
}
export function AccountDeletion() {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(deleteAccount, {});
  return (
    <section className="panel deletion">
      <h2>Your account, your choice</h2>
      <p>
        Delete your sign-in account, profile and private participation records.
        Campaign totals will be updated. This cannot be undone.
      </p>
      <p>
        Provider backups and technical logs may remain until their retention
        periods end.
      </p>
      {!confirming ? (
        <button
          className="button secondary"
          onClick={() => setConfirming(true)}
        >
          Delete account
        </button>
      ) : (
        <form action={action} className="form">
          <h3>Permanently delete your account?</h3>
          <label>
            Type DELETE to confirm
            <input
              name="confirmation"
              required
              pattern="DELETE"
              autoComplete="off"
              spellCheck={false}
              disabled={pending}
            />
          </label>
          <div className="button-row">
            <button className="button" disabled={pending}>
              {pending ? "Deleting…" : "Permanently delete my account"}
            </button>
            <button
              type="button"
              className="button secondary"
              disabled={pending}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </button>
          </div>
          {state.error && (
            <p className="error-message" role="alert">
              {state.error}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
