import type { ActionStatus, ActionType } from "@/types";
export const actionTypes: ActionType[] = [
  "Consumer action",
  "National civic action",
  "Local council action",
];
export const actionStatuses: ActionStatus[] = [
  "proposed",
  "voting",
  "scheduled",
  "active",
  "completed",
  "cancelled",
];
export function actionInput(form: FormData) {
  const text = (name: string, min: number, max: number) => {
    const value = String(form.get(name) || "").trim();
    if (value.length < min || value.length > max)
      throw new Error(
        `${name.replaceAll("_", " ")} must be ${min}–${max} characters.`,
      );
    return value;
  };
  const title = text("title", 5, 120),
    summary = text("summary", 10, 500);
  const target = text("target", 2, 150),
    demand = text("demand", 10, 3000);
  const action_type = text("action_type", 1, 50) as ActionType;
  const status = text("status", 1, 30) as ActionStatus;
  if (!actionTypes.includes(action_type) || !actionStatuses.includes(status))
    throw new Error("Choose a valid action type and status.");
  const date = (name: string) => {
    const value = text(name, 10, 10);
    const parsed = new Date(value + "T00:00:00.000Z");
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      !Number.isFinite(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== value
    )
      throw new Error("Enter valid start and end dates.");
    return parsed.toISOString();
  };
  const starts_at = date("starts_at"),
    ends_at = date("ends_at");
  if (ends_at < starts_at)
    throw new Error("End date must be on or after the start date.");
  const participation_threshold = Number(form.get("participation_threshold"));
  if (
    !Number.isSafeInteger(participation_threshold) ||
    participation_threshold < 1 ||
    participation_threshold > 10000000
  )
    throw new Error(
      "Participation goal must be a whole number from 1 to 10,000,000.",
    );
  const lines = (name: string) => {
    const values = text(name, 5, 5000)
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);
    if (values.length > 10 || values.some((v) => v.length > 500))
      throw new Error(
        "Use up to ten lines, with at most 500 characters per line.",
      );
    return values;
  };
  const safety_notes = lines("safety_notes"),
    alternatives = lines("alternatives");
  const sources = text("sources", 0, 5000)
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf("|");
      if (separator < 1)
        throw new Error(
          "Enter each source as a label followed by | and an HTTPS URL.",
        );
      const label = line.slice(0, separator).trim(),
        url = line.slice(separator + 1).trim();
      let parsed: URL;
      try {
        parsed = new URL(url);
      } catch {
        throw new Error("Each source needs a valid HTTPS URL.");
      }
      if (
        !label ||
        label.length > 150 ||
        url.length > 1000 ||
        parsed.protocol !== "https:" ||
        parsed.username ||
        parsed.password
      )
        throw new Error(
          "Sources need a short label and an HTTPS URL without credentials.",
        );
      return { label, url };
    });
  if (sources.length > 10) throw new Error("Use up to ten sources.");
  return {
    title,
    summary,
    target,
    demand,
    action_type,
    status,
    starts_at,
    ends_at,
    participation_threshold,
    safety_notes,
    alternatives,
    sources,
  };
}
