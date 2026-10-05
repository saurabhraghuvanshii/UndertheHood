import { defineConfig } from "@playwright/test";

/**
 * End-to-end tests against a production build (`pnpm build` first).
 * Uses the locally installed Google Chrome (channel "chrome"); run `pnpm exec playwright install chromium`
 * and drop `channel` if you don't have Chrome.
 */
export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  use: { baseURL: "http://localhost:3123", channel: "chrome", headless: true },
  webServer: { command: "pnpm start -p 3123", url: "http://localhost:3123", reuseExistingServer: true, timeout: 60_000 },
  projects: [
    { name: "desktop", use: { viewport: { width: 1360, height: 900 } } },
    { name: "mobile", use: { viewport: { width: 375, height: 800 }, isMobile: true, hasTouch: true } },
  ],
});
