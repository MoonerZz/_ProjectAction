import { test, expect } from "@playwright/test";
test("mock registration, private participation and profile flow", async ({
  page,
}) => {
  await page.goto("/app");
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/signup");
  await page
    .getByLabel("Email address", { exact: false })
    .fill("neighbour@example.com");
  await page
    .getByLabel("Public nickname", { exact: false })
    .fill("RiverNeighbour");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Continue in mock mode" }).click();
  await expect(
    page.getByText("No email has been sent.", { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Developer: simulate sign-in" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Hello, RiverNeighbour." }),
  ).toBeVisible();
  await expect(page.getByText("neighbour@example.com")).toHaveCount(0);
  await page.screenshot({
    path: "test-results/dashboard-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/dashboard-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole("link", { name: "Actions", exact: true }).click();
  await page.getByLabel("Action status").selectOption("completed");
  await page
    .getByRole("link", { name: "Better access to Willow Park", exact: true })
    .click();
  await expect(page.getByText("This action is complete.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Join action", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Actions", exact: true }).click();
  await page.getByLabel("Search actions").fill("no-such-campaign");
  await expect(
    page.getByRole("heading", { name: "No actions match your search." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "clear your filters" }).click();
  await page.getByLabel("Search actions").fill("clear prices");
  await expect(
    page.getByRole("heading", { name: "Clear prices. In every aisle." }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Clear prices. In every aisle." })
    .click();
  await page.getByRole("button", { name: "Join action", exact: true }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Confirm participation" }).click();
  await expect(
    page.getByRole("heading", { name: "You’re part of this action." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Profile", exact: true }).click();
  await page.getByRole("button", { name: "Request account deletion" }).click();
  await page
    .getByRole("button", { name: "Confirm placeholder request" })
    .click();
  await expect(
    page.getByText("Preview complete.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByText("neighbour@example.com", { exact: false }),
  ).toBeVisible();
  await page
    .getByLabel("Public nickname", { exact: false })
    .fill("NewNeighbour");
  await page.getByRole("button", { name: "Save nickname" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "updated" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Home", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Hello, NewNeighbour." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Profile", exact: true }).click();
  await page
    .getByRole("link", { name: "Clear prices. In every aisle.", exact: false })
    .click();
  await page.getByRole("button", { name: "Leave action", exact: true }).click();
  await page.getByRole("button", { name: "Confirm leave" }).click();
  await expect(
    page.getByRole("button", { name: "Join action", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/app/profile");
  await expect(page).toHaveURL(/\/login/);
});
test("invalid callback and mobile layout", async ({ page }) => {
  await page.goto("/auth/callback?code=invalid");
  await expect(
    page.getByRole("alert").filter({ hasText: "invalid or has expired" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/landing-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "test-results/landing-desktop.png",
    fullPage: true,
  });
});
test("public offline shell is available without retaining private pages", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await page.goto("/app");
  await expect(
    page.getByRole("heading", {
      name: "Your civic space will be here when you reconnect.",
    }),
  ).toBeVisible();
  await context.setOffline(false);
  const cached = await page.evaluate(async () => {
    const keys = await caches.keys();
    return (
      await Promise.all(
        keys.map(async (key) =>
          (await (await caches.open(key)).keys()).map(
            (r) => new URL(r.url).pathname,
          ),
        ),
      )
    ).flat();
  });
  expect(cached).not.toContain("/app");
  expect(cached).toContain("/offline.html");
});
