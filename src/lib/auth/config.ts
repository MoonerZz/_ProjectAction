import "server-only";
export function authMode() {
  const configured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
  const mock =
    process.env.AUTH_MODE === "mock" ||
    (!process.env.AUTH_MODE &&
      !configured &&
      process.env.NODE_ENV !== "production");
  if (
    mock &&
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_MOCK_AUTH !== "true"
  )
    throw new Error(
      "Mock authentication is disabled in production. Configure Supabase or explicitly set ALLOW_MOCK_AUTH=true for a local preview.",
    );
  if (!mock && !configured)
    throw new Error("Configure Supabase or enable local mock mode.");
  if (
    mock &&
    process.env.NODE_ENV === "production" &&
    (process.env.MOCK_SESSION_SECRET?.length || 0) < 32
  )
    throw new Error(
      "Set MOCK_SESSION_SECRET to at least 32 random characters for a stable local production preview.",
    );
  return mock ? "mock" : "supabase";
}
