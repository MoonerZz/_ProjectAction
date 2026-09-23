"use client";
import { useState } from "react";
export function PostcodePlaceholder() {
  const [message, setMessage] = useState("");
  return (
    <form
      className="postcode"
      onSubmit={(e) => {
        e.preventDefault();
        setMessage(
          "Lookup is not connected yet. The fictional representative below is the same for everyone.",
        );
      }}
    >
      <label htmlFor="postcode">Find your constituency</label>
      <div>
        <input
          id="postcode"
          placeholder="Enter a postcode"
          maxLength={10}
          autoComplete="off"
          aria-describedby="postcode-help"
        />
        <button className="button secondary" type="submit">
          Preview lookup
        </button>
      </div>
      <p id="postcode-help" className="field-help">
        Placeholder only. A future version will use a postcode to find your
        constituency. What you type here is not saved or transmitted.
      </p>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
