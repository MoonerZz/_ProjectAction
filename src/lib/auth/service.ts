import "server-only";
import { redirect } from "next/navigation";
import type { Profile } from "@/types";
import { authMode } from "./config";
import { clearMock, readMock, writeMock } from "./mock-session";
import { supabase } from "./supabase";
export interface AuthService {
  getProfile(): Promise<Profile | null>;
  requestLink(email: string, nickname?: string): Promise<void>;
  updateNickname(nickname: string): Promise<void>;
  signOut(): Promise<void>;
}
class MockAuthService implements AuthService {
  async getProfile() {
    return (await readMock())?.profile || null;
  }
  async requestLink() {
    /* Deliberately does not send email. */
  }
  async updateNickname(nickname: string) {
    const session = await readMock();
    if (!session) throw new Error("Sign in again.");
    session.profile.nickname = nickname;
    session.profile.updated_at = new Date().toISOString();
    await writeMock(session);
  }
  async signOut() {
    await clearMock();
  }
}
class SupabaseAuthService implements AuthService {
  async getProfile() {
    const client = await supabase();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return null;
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (error)
      throw new Error(
        "Your profile could not be loaded. Please try signing in again.",
      );
    return data as Profile;
  }
  async requestLink(email: string, nickname?: string) {
    const client = await supabase();
    const { error } = await client.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: !!nickname,
        emailRedirectTo: `${process.env.APP_URL || "http://localhost:3000"}/auth/callback`,
        ...(nickname
          ? { data: { nickname, terms_accepted_at: new Date().toISOString() } }
          : {}),
      },
    });
    if (error)
      throw new Error(
        "We could not process this request. Please wait a moment and try again.",
      );
  }
  async updateNickname(nickname: string) {
    const profile = await this.getProfile();
    if (!profile) throw new Error("Sign in again.");
    const client = await supabase();
    const { error } = await client
      .from("profiles")
      .update({ nickname, updated_at: new Date().toISOString() })
      .eq("id", profile.id);
    if (error) throw new Error("Your nickname could not be saved.");
  }
  async signOut() {
    const { error } = await (await supabase()).auth.signOut();
    if (error) throw new Error("Sign-out failed. Please try again.");
  }
}
export function authService(): AuthService {
  return authMode() === "mock"
    ? new MockAuthService()
    : new SupabaseAuthService();
}
export async function requireProfile() {
  const profile = await authService().getProfile();
  if (!profile) redirect("/login");
  return profile;
}
