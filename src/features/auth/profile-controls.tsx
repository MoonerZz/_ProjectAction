"use client";
import { useActionState, useState } from "react";
import { updateNickname } from "./server-actions";
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
export function DeletionPlaceholder() {
  const [stage, setStage] = useState(0);
  return (
    <section className="panel deletion">
      <h2>Your account, your choice</h2>
      <p>
        Account deletion is a placeholder in this prototype. This flow does not
        submit a request or delete data.
      </p>
      {stage === 0 ? (
        <button className="button secondary" onClick={() => setStage(1)}>
          Request account deletion
        </button>
      ) : stage === 1 ? (
        <div>
          <h3>Preview account deletion?</h3>
          <p>
            A future deletion service will remove your profile and private
            participation history. No request will be sent in this preview.
          </p>
          <div className="button-row">
            <button className="button" onClick={() => setStage(2)}>
              Confirm placeholder request
            </button>
            <button className="button secondary" onClick={() => setStage(0)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p role="status" className="notice">
          Preview complete. Nothing was submitted or deleted. In mock mode,
          signing out removes the current mock session and participation.
        </p>
      )}
    </section>
  );
}
