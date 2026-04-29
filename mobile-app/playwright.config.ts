import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 1,
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry"
  },
  webServer: {
    command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
    timeout: 120000
  },
  projects: [
    {
      name: "mobile-360-firefox",
      use: {
        browserName: "firefox",
        viewport: { width: 360, height: 800 }
      }
    },
    {
      name: "mobile-430-firefox",
      use: {
        browserName: "firefox",
        viewport: { width: 430, height: 932 }
      }
    }
  ]
});
