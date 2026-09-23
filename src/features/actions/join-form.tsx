"use client";
import { useActionState, useState } from "react";
import type { CivicAction } from "@/types";
import { participate } from "./server-actions";
import { canJoin } from "./participation";
export function JoinForm({ action }: { action: CivicAction }) {
  const [confirm, setConfirm] = useState(false);
  const [state, formAction, pending] = useActionState(participate, {});
  if (!action.joined && !canJoin(action.status))
    return (
      <div className="notice">
        <strong>
          {action.status === "completed"
            ? "This action is complete."
            : action.status === "cancelled"
              ? "This action was cancelled."
              : action.status === "voting"
                ? "Proposal voting is planned for a later version."
                : "This proposal is not yet open."}
        </strong>
        <p>Participation is unavailable for this action.</p>
      </div>
    );
  return (
    <div className="join-panel">
      {action.joined ? (
        <h3>You’re part of this action.</h3>
      ) : (
        <h3>A choice, never an obligation.</h3>
      )}
      <p>Your participation is private. You can leave at any time.</p>
      {!confirm ? (
        <button className="button" onClick={() => setConfirm(true)}>
          {action.joined ? "Leave action" : "Join action"}
        </button>
      ) : (
        <form action={formAction} className="form">
          <input type="hidden" name="id" value={action.id} />
          <input type="hidden" name="join" value={String(!action.joined)} />
          <strong>
            {action.joined ? "Confirm leaving this action" : "Before you join"}
          </strong>
          <p>
            {action.joined
              ? "This removes the action from your private joined list."
              : "You are expressing an intention to take the specific action described above during its scheduled dates. This does not send messages, cancel subscriptions or make payments for you."}
          </p>
          {!action.joined && (
            <label className="checkbox">
              <input name="confirm" type="checkbox" required />
              <span>
                I have read the safety notes and understand that participation
                is voluntary, peaceful and lawful.
              </span>
            </label>
          )}
          <div className="button-row">
            <button className="button" disabled={pending}>
              {pending
                ? "Saving…"
                : action.joined
                  ? "Confirm leave"
                  : "Confirm participation"}
            </button>
            <button
              type="button"
              className="button secondary"
              onClick={() => setConfirm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {state.error && (
        <p role="alert" className="error-message">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="success-message">
          {state.success}
        </p>
      )}
    </div>
  );
}
