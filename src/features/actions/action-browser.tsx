"use client";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { CivicAction } from "@/types";
import { ActionCard } from "./action-card";
import { Empty } from "@/components/ui";
export function ActionBrowser({ actions }: { actions: CivicAction[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const filtered = actions.filter(
    (a) =>
      (!type || a.action_type === type) &&
      (!status || a.status === status) &&
      `${a.title} ${a.summary} ${a.target}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="filters">
        <label className="search">
          <Search size={19} />
          <span className="sr-only">Search actions</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search actions or organisations"
          />
        </label>
        <label>
          <span className="sr-only">Action type</span>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All action types</option>
            {[
              "Consumer action",
              "National civic action",
              "Local council action",
            ].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Action status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {[
              "proposed",
              "voting",
              "scheduled",
              "active",
              "completed",
              "cancelled",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <SlidersHorizontal size={20} />
      </div>
      <p className="field-help" role="status">
        {filtered.length} actions · All campaigns and organisations are
        fictional
      </p>
      {filtered.length ? (
        <div className="grid two">
          {filtered.map((action) => (
            <ActionCard key={action.id} action={action} />
          ))}
        </div>
      ) : (
        <Empty title="No actions match your search.">
          Try another keyword, or{" "}
          <button
            className="text-link"
            onClick={() => {
              setQuery("");
              setType("");
              setStatus("");
            }}
          >
            clear your filters
          </button>
          .
        </Empty>
      )}
    </>
  );
}
