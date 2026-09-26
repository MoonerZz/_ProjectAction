"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { authMode } from "@/lib/auth/config";
import { authService, requireProfile } from "@/lib/auth/service";
import { writeMock } from "@/lib/auth/mock-session";
import {
  emailError,
  nicknameError,
  validateRegistration,
} from "@/lib/validation";
import { revalidatePath } from "next/cache";
export type FormState = { error?: string; success?: string };
export async function deleteAccount(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  await requireProfile();
  if (form.get("confirmation") !== "DELETE") {
    return { error: "Type DELETE to confirm permanent account deletion." };
  }
  try {
    await authService().deleteAccount();
  } catch {
    return { error: "Your account could not be deleted. Please try again." };
  }
  (await cookies()).delete("civic_pending");
  revalidatePath("/app", "layout");
  redirect("/account-deleted");
}
export async function requestLink(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const email = String(form.get("email") || "")
    .trim()
    .toLowerCase();
  const signup = form.get("intent") === "signup";
  const nickname = String(form.get("nickname") || "").trim();
  const error = signup
    ? validateRegistration(email, nickname, form.get("terms") === "on")
    : emailError(email);
  if (error) return { error };
  try {
    await authService().requestLink(email, signup ? nickname : undefined);
    if (authMode() === "mock") {
      (await cookies()).set(
        "civic_pending",
        JSON.stringify({
          email,
          nickname: signup ? nickname : "Civic neighbour",
        }),
        {
          httpOnly: true,
          sameSite: "strict",
          secure:
            new URL(process.env.APP_URL || "http://localhost:3000").protocol ===
            "https:",
          path: "/",
          maxAge: 600,
        },
      );
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Please try again.",
    };
  }
  redirect("/auth/check-email");
}
export async function simulateAuth() {
  if (authMode() !== "mock")
    throw new Error("Developer sign-in is unavailable.");
  const jar = await cookies();
  const pending = jar.get("civic_pending");
  if (!pending) redirect("/login?error=expired");
  let values: { email: string; nickname: string };
  try {
    values = JSON.parse(pending.value);
  } catch {
    redirect("/login?error=expired");
  }
  if (
    !values ||
    typeof values.email !== "string" ||
    typeof values.nickname !== "string" ||
    validateRegistration(values.email, values.nickname, true)
  )
    redirect("/signup");
  const now = new Date().toISOString();
  await writeMock({
    profile: {
      id: randomUUID(),
      email: values.email,
      nickname: values.nickname,
      created_at: now,
      updated_at: now,
      terms_accepted_at: now,
    },
    joined: [],
    expires: Date.now() + 8 * 60 * 60 * 1000,
  });
  jar.delete("civic_pending");
  redirect("/app");
}
export async function signOut() {
  await authService().signOut();
  (await cookies()).delete("civic_pending");
  redirect("/login");
}
export async function updateNickname(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  await requireProfile();
  const nickname = String(form.get("nickname") || "").trim();
  const error = nicknameError(nickname);
  if (error) return { error };
  try {
    await authService().updateNickname(nickname);
    revalidatePath("/app", "layout");
    return { success: "Your public nickname has been updated." };
  } catch {
    return { error: "Your changes could not be saved. Try again." };
  }
}
