import { AuthPage } from "@/features/auth/auth-page";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return <AuthPage signup={false} error={(await searchParams).error} />;
}
