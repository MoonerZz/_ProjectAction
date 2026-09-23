import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { Profile } from "@/types";
import { authMode } from "./config";
const runtime = globalThis as typeof globalThis & { civicMockSecret?: string };
const secret =
  process.env.MOCK_SESSION_SECRET ||
  (runtime.civicMockSecret ??= randomBytes(32).toString("hex"));
const cookie = "civic_mock";
export interface MockSession {
  profile: Profile;
  joined: string[];
  expires: number;
}
export async function readMock(): Promise<MockSession | null> {
  if (authMode() !== "mock") return null;
  const raw = (await cookies()).get(cookie)?.value;
  if (!raw) return null;
  try {
    const [body, signature] = raw.split(".");
    const expected = createHmac("sha256", secret)
      .update(body)
      .digest("base64url");
    if (
      !signature ||
      signature.length !== expected.length ||
      !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    )
      return null;
    const session = JSON.parse(
      Buffer.from(body, "base64url").toString(),
    ) as MockSession;
    return session.expires > Date.now() ? session : null;
  } catch {
    return null;
  }
}
export async function writeMock(session: MockSession) {
  if (authMode() !== "mock")
    throw new Error("Mock authentication is disabled.");
  const body = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = createHmac("sha256", secret)
    .update(body)
    .digest("base64url");
  (await cookies()).set(cookie, `${body}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure:
      new URL(process.env.APP_URL || "http://localhost:3000").protocol ===
      "https:",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}
export async function clearMock() {
  (await cookies()).delete(cookie);
}
