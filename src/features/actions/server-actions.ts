"use server";
import { requireProfile } from "@/lib/auth/service";
import { actionsRepository } from "@/lib/data/repositories";
import { revalidatePath } from "next/cache";
export async function participate(
  _: { error?: string; success?: string },
  form: FormData,
): Promise<{ error?: string; success?: string }> {
  await requireProfile();
  const id = String(form.get("id") || "");
  const join = form.get("join") === "true";
  if (join && form.get("confirm") !== "on")
    return { error: "Confirm that you understand the participation notes." };
  try {
    await actionsRepository().participate(id, join);
    revalidatePath("/app", "layout");
    return {
      success: join
        ? "You have joined this action."
        : "You have left this action.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Please try again.",
    };
  }
}
