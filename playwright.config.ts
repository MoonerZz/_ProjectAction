import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "smoke.spec.ts",
  outputDir: "test-results/smoke",
  fullyParallel: false,
  workers: 1,
  use: { baseURL: "http://localhost:3100", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node node_modules/next/dist/bin/next start -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    env: {
      AUTH_MODE: "mock",
      ALLOW_MOCK_AUTH: "true",
      MOCK_SESSION_SECRET: "local-test-secret-not-for-production-123456789",
      APP_URL: "http://localhost:3100",
    },
  },
});
