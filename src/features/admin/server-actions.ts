"use server";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/auth/supabase";
import { requireAdmin } from "./service";
import { actionInput } from "./validation";
export type AdminState = { error?: string };
export async function saveAction(
  _: AdminState,
  form: FormData,
): Promise<AdminState> {
  await requireAdmin();
  let values: ReturnType<typeof actionInput>;
  try {
    values = actionInput(form);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Check the action details.",
    };
  }
  const intent = form.get("intent");
  if (!["save", "publish", "unpublish"].includes(String(intent)))
    return { error: "Choose how to save this action." };
  if (intent === "publish" && form.get("reviewed") !== "on")
    return {
      error:
        "Confirm that you have reviewed the evidence and safety guidance before publishing.",
    };
  const client = await supabase();
  const id = String(form.get("id") || "");
  let targetId = id;
  if (id) {
    const revision = Number(form.get("revision"));
    if (!Number.isSafeInteger(revision) || revision < 1 || id.length > 150)
      return { error: "Reload this action before saving." };
    const { data, error } = await client
      .from("actions")
      .update({
        ...values,
        ...(intent === "publish"
          ? { published_at: new Date().toISOString() }
          : {}),
        ...(intent === "unpublish" ? { published_at: null } : {}),
      })
      .eq("id", id)
      .eq("revision", revision)
      .select("id")
      .maybeSingle();
    if (error)
      return { error: "The action could not be saved. Please try again." };
    if (!data)
      return {
        error:
          "This action changed while you were editing. Copy your changes, then reload before saving.",
      };
  } else {
    if (intent === "unpublish") return { error: "Save a draft first." };
    targetId = randomUUID();
    const { error } = await client.from("actions").insert({
      ...values,
      id: targetId,
      is_demo: false,
      published_at: intent === "publish" ? new Date().toISOString() : null,
    });
    if (error)
      return { error: "The action could not be created. Please try again." };
  }
  revalidatePath("/app", "layout");
  redirect(`/app/admin/${targetId}?saved=1`);
}
