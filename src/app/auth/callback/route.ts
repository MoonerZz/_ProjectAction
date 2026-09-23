import { NextResponse, type NextRequest } from "next/server";
import { supabase } from "@/lib/auth/supabase";
import { authMode } from "@/lib/auth/config";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code && authMode() === "supabase") {
    const { error } = await (
      await supabase()
    ).auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/app", request.url));
  }
  return NextResponse.redirect(new URL("/login?error=expired", request.url));
}
