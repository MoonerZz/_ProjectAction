import "server-only";
import type { CivicAction, Representative } from "@/types";
import { seedActions } from "@/mock-data/actions";
import { representative } from "@/mock-data/representatives";
import { authMode } from "@/lib/auth/config";
import { readMock, writeMock } from "@/lib/auth/mock-session";
import { requireProfile } from "@/lib/auth/service";
import { supabase } from "@/lib/auth/supabase";
import { canJoin, setParticipation } from "@/features/actions/participation";
export interface ActionsRepository {
  list(): Promise<CivicAction[]>;
  get(id: string): Promise<CivicAction | undefined>;
  participate(id: string, join: boolean): Promise<void>;
}
export interface RepresentativesRepository {
  getPreview(): Promise<Representative>;
}
export class MockRepresentativesRepository implements RepresentativesRepository {
  async getPreview() {
    return representative;
  }
}
export class MockActionsRepository implements ActionsRepository {
  async list() {
    const session = await readMock();
    return seedActions.map((action) => ({
      ...action,
      joined: session?.joined.includes(action.id) || false,
      participant_count:
        action.participant_count +
        (session?.joined.includes(action.id) ? 1 : 0),
    }));
  }
  async get(id: string) {
    return (await this.list()).find((action) => action.id === id);
  }
  async participate(id: string, join: boolean) {
    const session = await readMock();
    const action = seedActions.find((action) => action.id === id);
    if (!session || !action) throw new Error("Action or session unavailable.");
    session.joined = setParticipation(session.joined, id, join, action.status);
    await writeMock(session);
  }
}
export class SupabaseActionsRepository implements ActionsRepository {
  async list() {
    const profile = await requireProfile();
    const client = await supabase();
    const [{ data, error }, { data: participation, error: joinError }] =
      await Promise.all([
        client.from("actions").select("*").order("created_at"),
        client
          .from("action_participation")
          .select("action_id")
          .eq("profile_id", profile.id),
      ]);
    if (error || joinError) throw new Error("Actions could not be loaded.");
    return (data || []).map((action) => ({
      ...action,
      joined:
        participation?.some((row) => row.action_id === action.id) || false,
    })) as CivicAction[];
  }
  async get(id: string) {
    return (await this.list()).find((action) => action.id === id);
  }
  async participate(id: string, join: boolean) {
    const profile = await requireProfile();
    const action = await this.get(id);
    if (!action || (join && !canJoin(action.status)))
      throw new Error("This action is not open for participation.");
    const client = await supabase();
    const { error } = join
      ? await client
          .from("action_participation")
          .upsert(
            { action_id: id, profile_id: profile.id },
            { onConflict: "action_id,profile_id", ignoreDuplicates: true },
          )
      : await client
          .from("action_participation")
          .delete()
          .eq("action_id", id)
          .eq("profile_id", profile.id);
    if (error) throw new Error("Your participation could not be updated.");
  }
}
export function actionsRepository(): ActionsRepository {
  return authMode() === "mock"
    ? new MockActionsRepository()
    : new SupabaseActionsRepository();
}
export const representativesRepository: RepresentativesRepository =
  new MockRepresentativesRepository();
