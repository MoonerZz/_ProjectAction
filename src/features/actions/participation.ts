import type { ActionStatus } from "@/types";
export function canJoin(status: ActionStatus) {
  return status === "active" || status === "scheduled";
}
export function setParticipation(
  ids: string[],
  id: string,
  join: boolean,
  status: ActionStatus,
): string[] {
  if (join && !canJoin(status))
    throw new Error("This action is not open for participation.");
  return join
    ? [...new Set([...ids, id])]
    : ids.filter((value) => value !== id);
}
export function progress(count: number, threshold: number) {
  return threshold > 0
    ? Math.max(0, Math.min(100, Math.round((count / threshold) * 100)))
    : 0;
}
