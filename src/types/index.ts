export type ActionType =
  "Consumer action" | "National civic action" | "Local council action";
export type ActionStatus =
  "proposed" | "voting" | "scheduled" | "active" | "completed" | "cancelled";
export interface Profile {
  id: string;
  email: string;
  nickname: string;
  created_at: string;
  updated_at: string;
  terms_accepted_at: string;
}
export interface CivicAction {
  id: string;
  title: string;
  summary: string;
  target: string;
  demand: string;
  action_type: ActionType;
  status: ActionStatus;
  starts_at: string;
  ends_at: string;
  participation_threshold: number;
  participant_count: number;
  safety_notes: string[];
  alternatives: string[];
  sources: { label: string; url: string | null }[];
  created_at: string;
  updated_at: string;
  joined: boolean;
}
export interface ActionParticipation {
  id: string;
  action_id: string;
  profile_id: string;
  joined_at: string;
}
export interface Representative {
  id: string;
  name: string;
  party: string;
  constituency: string;
  roles: string[];
  participation: { recorded: number; total: number };
  votes: {
    title: string;
    date: string;
    position: "For" | "Against" | "No recorded vote";
  }[];
  costs: {
    staffing: number;
    office: number;
    travel: number;
    accommodation: number;
  };
  interests: string[];
}
