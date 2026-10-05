import { test } from "@playwright/test";

// Screenshot tour used for visual review: SHOTS=1 pnpm exec playwright test shoot
test.skip(!process.env.SHOTS, "visual tour only when SHOTS=1");
const pages = ["/", "/paths/javascript", "/paths/javascript/closures", "/interview/javascript/js-01", "/lab/js-event-loop", "/lab/go-slices", "/lab/go-scheduler", "/design/url-shortener", "/planner/new", "/calendar"];
for (const theme of ["light", "dark"]) {
  for (const p of pages) {
    test(`${theme} ${p}`, async ({ page }, info) => {
      await page.addInitScript((t) => localStorage.setItem("under-the-hood:v1", JSON.stringify({ settings: { theme: t } })), theme);
      await page.goto(p);
      await page.waitForTimeout(1200);
      await page.screenshot({ path: `test-results/shots/${info.project.name}-${theme}${p.replace(/\//g, "_") || "_home"}.png`, fullPage: false });
    });
  }
}
