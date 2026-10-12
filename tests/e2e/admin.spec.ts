import { test, expect, type BrowserContext } from "@playwright/test";
async function session(context: BrowserContext, admin: boolean) {
  const user = {
    id: admin
      ? "00000000-0000-0000-0000-000000000001"
      : "00000000-0000-0000-0000-000000000002",
    email: "test@example.invalid",
  };
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      exp: Math.floor(Date.now() / 1000) + 3600,
      role: "authenticated",
    }),
  ).toString("base64url");
  const value =
    "base64-" +
    Buffer.from(
      JSON.stringify({
        access_token: `eyJhbGciOiJIUzI1NiJ9.${payload}.fixture`,
        refresh_token: "local-only",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        expires_in: 3600,
        token_type: "bearer",
        user,
      }),
    ).toString("base64url");
  await context.addCookies([
    {
      name: "sb-127-auth-token",
      value,
      url: "http://localhost:3101",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}
test("admin draft, publish, edit conflict and unpublish work on mobile", async ({
  page,
  context,
  request,
  browser,
}) => {
  await request.post("http://127.0.0.1:3102/reset");
  await session(context, true);
  await page.goto("/app/admin/new");
  await expect(
    page.getByRole("heading", { name: "Create an action" }),
  ).toBeVisible();
  await page.getByLabel("Title", { exact: true }).fill("Better local access");
  await page
    .getByLabel("Summary", { exact: true })
    .fill("Improve access to local services.");
  await page.getByLabel("Who is this directed to?").fill("Local council");
  await page
    .getByLabel("What change are we asking for?")
    .fill("Publish an accessible local services plan.");
  await page.getByLabel("Start date").fill("2026-11-01");
  await page.getByLabel("End date").fill("2026-11-10");
  await page
    .getByLabel("Safety and legality guidance")
    .fill("Participate peacefully and lawfully.");
  await page
    .getByLabel("Other ways to participate")
    .fill("Write to your representative.");
  await page
    .getByLabel("Evidence and sources")
    .fill("Council records | https://example.org/records");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/admin-editor-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Only admins");
  const editUrl = page.url();
  const actionId = new URL(editUrl).pathname.split("/").at(-1);
  const members = await browser.newContext();
  await session(members, false);
  const memberPage = await members.newPage();
  await memberPage.goto("/app/actions");
  await expect(
    memberPage.getByRole("link", { name: "Better local access", exact: true }),
  ).toHaveCount(0);
  await memberPage.goto(`/app/actions/${actionId}`);
  await expect(
    memberPage.getByRole("heading", { name: "This page isn’t here." }),
  ).toBeVisible();
  await memberPage.goto("/app/admin");
  await expect(
    memberPage.getByRole("heading", { name: "This page isn’t here." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Publish action", exact: true })
    .click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Confirm that you have reviewed" }),
  ).toBeVisible();
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Publish action", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Members can see");
  await memberPage.goto(`/app/actions/${actionId}`);
  await expect(
    memberPage.getByRole("heading", {
      name: "Better local access",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    memberPage.getByRole("link", { name: "Council records" }),
  ).toHaveAttribute("href", "https://example.org/records");
  await expect(
    memberPage.getByText("This is a fictional campaign", { exact: false }),
  ).toHaveCount(0);
  await request.post("http://127.0.0.1:3102/conflict");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Save published changes" }).click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "changed while you were editing" }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: "Unpublish action", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Only admins");
  await memberPage.goto(`/app/actions/${actionId}`);
  await expect(
    memberPage.getByRole("heading", { name: "This page isn’t here." }),
  ).toBeVisible();
  await members.close();
});
