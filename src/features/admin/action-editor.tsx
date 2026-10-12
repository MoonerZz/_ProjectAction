"use client";
import { useActionState } from "react";
import { saveAction } from "./server-actions";
import { actionStatuses, actionTypes } from "./validation";
import type { AdminAction } from "./service";
export function ActionEditor({ action }: { action?: AdminAction }) {
  const [state, submit, pending] = useActionState(saveAction, {});
  const published = !!action?.published_at;
  return (
    <form action={submit} className="form admin-editor">
      <input type="hidden" name="id" value={action?.id || ""} />
      <input type="hidden" name="revision" value={action?.revision || 1} />
      <label>
        Title
        <input
          name="title"
          required
          minLength={5}
          maxLength={120}
          defaultValue={action?.title}
        />
      </label>
      <label>
        Summary
        <textarea
          name="summary"
          required
          minLength={10}
          maxLength={500}
          rows={3}
          defaultValue={action?.summary}
        />
      </label>
      <label>
        Who is this directed to?
        <input
          name="target"
          required
          minLength={2}
          maxLength={150}
          defaultValue={action?.target}
        />
      </label>
      <label>
        What change are we asking for?
        <textarea
          name="demand"
          required
          minLength={10}
          maxLength={3000}
          rows={5}
          defaultValue={action?.demand}
        />
      </label>
      <div className="admin-columns">
        <label>
          Action type
          <select
            name="action_type"
            defaultValue={action?.action_type || actionTypes[0]}
          >
            {actionTypes.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          Action status
          <select name="status" defaultValue={action?.status || "proposed"}>
            {actionStatuses.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          Start date
          <input
            type="date"
            name="starts_at"
            required
            defaultValue={action?.starts_at.slice(0, 10)}
          />
        </label>
        <label>
          End date
          <input
            type="date"
            name="ends_at"
            required
            defaultValue={action?.ends_at.slice(0, 10)}
          />
        </label>
      </div>
      <label>
        Participation goal
        <input
          type="number"
          name="participation_threshold"
          required
          min={1}
          max={10000000}
          step={1}
          defaultValue={action?.participation_threshold || 100}
        />
      </label>
      <label>
        Safety and legality guidance
        <textarea
          name="safety_notes"
          required
          minLength={5}
          maxLength={5000}
          rows={4}
          defaultValue={action?.safety_notes.join("\n")}
        />
        <span className="field-help">
          One point per line. Include peaceful, lawful ways to participate.
        </span>
      </label>
      <label>
        Other ways to participate
        <textarea
          name="alternatives"
          required
          minLength={5}
          maxLength={5000}
          rows={3}
          defaultValue={action?.alternatives.join("\n")}
        />
        <span className="field-help">One accessible alternative per line.</span>
      </label>
      <label>
        Evidence and sources
        <textarea
          name="sources"
          maxLength={5000}
          rows={4}
          placeholder="Source title | https://example.org/evidence"
          defaultValue={action?.sources
            .filter((v) => v.url)
            .map((v) => `${v.label} | ${v.url}`)
            .join("\n")}
        />
        <span className="field-help">
          One source per line: label | HTTPS URL. Up to ten sources.
        </span>
      </label>
      <label className="checkbox">
        <input type="checkbox" name="reviewed" />
        <span>
          I have checked the evidence, dates and safety guidance. This action is
          suitable to publish.
        </span>
      </label>
      {state.error && (
        <p className="error-message" role="alert">
          {state.error}
        </p>
      )}
      <div className="admin-buttons">
        <button
          className="button"
          name="intent"
          value={published ? "publish" : "save"}
          disabled={pending}
        >
          {pending
            ? "Saving…"
            : published
              ? "Save published changes"
              : "Save draft"}
        </button>
        {!published && (
          <button
            className="button secondary"
            name="intent"
            value="publish"
            disabled={pending}
          >
            Publish action
          </button>
        )}
        {published && (
          <button
            className="button secondary"
            name="intent"
            value="unpublish"
            disabled={pending}
          >
            Unpublish action
          </button>
        )}
      </div>
      <p className="field-help">
        {published
          ? "Published changes are visible to members immediately. Unpublishing hides this action but preserves its participation records."
          : "Drafts are visible only to admins. Publishing makes this action visible to signed-in members."}
      </p>
    </form>
  );
}
