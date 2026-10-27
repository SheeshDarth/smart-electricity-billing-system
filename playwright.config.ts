import { defineConfig, devices } from "@playwright/test";

const previewPort = Number(process.env.PLAYWRIGHT_PREVIEW_PORT ?? 4173);

if (!Number.isInteger(previewPort) || previewPort < 1024 || previewPort > 65535) {
  throw new Error("PLAYWRIGHT_PREVIEW_PORT must be an integer between 1024 and 65535");
}

const previewUrl = `http://127.0.0.1:${previewPort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: previewUrl,
    acceptDownloads: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: `node ./node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port ${previewPort} --strictPort`,
    url: previewUrl,
    reuseExistingServer: !process.env.CI,
    gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
    timeout: 30_000,
  },
});
