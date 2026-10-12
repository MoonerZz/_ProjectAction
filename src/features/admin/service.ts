import "server-only";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth/service";
import { authMode } from "@/lib/auth/config";
import { supabase } from "@/lib/auth/supabase";
import type { CivicAction } from "@/types";
export type AdminAction = CivicAction & {
  published_at: string | null;
  revision: number;
  is_demo: boolean;
};
export async function isAdmin() {
  if (authMode() !== "supabase") return false;
  const { data, error } = await (await supabase()).rpc("is_admin");
  return !error && data === true;
}
export async function requireAdmin() {
  await requireProfile();
  if (!(await isAdmin())) notFound();
}
export async function adminActions() {
  await requireAdmin();
  const { data, error } = await (
    await supabase()
  )
    .from("actions")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error("Actions could not be loaded.");
  return data as AdminAction[];
}
export async function adminAction(id: string) {
  await requireAdmin();
  const { data, error } = await (
    await supabase()
  )
    .from("actions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("This action could not be loaded.");
  if (!data) notFound();
  return data as AdminAction;
}
