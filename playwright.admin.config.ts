import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "admin.spec.ts",
  outputDir: "test-results/admin",
  workers: 1,
  use: { baseURL: "http://localhost:3101", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node node_modules/tsx/dist/cli.mjs tests/fixtures/admin-api.ts",
      url: "http://127.0.0.1:3102/health",
      reuseExistingServer: false,
    },
    {
      command: "node node_modules/next/dist/bin/next start -p 3101",
      url: "http://localhost:3101/login",
      reuseExistingServer: false,
      env: {
        AUTH_MODE: "supabase",
        ALLOW_MOCK_AUTH: "false",
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:3102",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "local-fixture-only",
        APP_URL: "http://localhost:3101",
      },
    },
  ],
});
