import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

const store = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("under-the-hood:v1") ?? "{}"));

test.describe("desktop workflows", () => {
  test.skip(({ isMobile }) => isMobile, "desktop only");

  test("navigation, deep links and lesson-to-lesson movement", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Learning paths" }).click();
    await expect(page).toHaveURL(/\/paths$/);
    await page.getByRole("link", { name: /^01\s*JavaScript/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "JavaScript" })).toBeVisible();
    await page.goto("/paths/javascript/closures");
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "Closures" })).toBeVisible();
    await page.getByRole("navigation", { name: "Lesson navigation" }).getByRole("link", { name: /Next/ }).click();
    await expect(page).not.toHaveURL(/closures$/);
    await page.goBack();
    await expect(page).toHaveURL(/closures$/);
    await page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "JavaScript" }).click();
    await expect(page).toHaveURL(/\/paths\/javascript$/);
  });

  test("marking a lesson understood persists and enters the revision queue", async ({ page }) => {
    await page.goto("/paths/javascript/closures");
    await page.getByRole("button", { name: "I understood the explanation" }).click();
    await page.getByRole("button", { name: "4", exact: true }).click();
    await page.reload();
    await expect(page.getByRole("button", { name: "I understood the explanation" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("Learned once").first()).toBeVisible();
    await page.goto("/revision");
    await expect(page.getByRole("link", { name: "Closures" })).toBeVisible();
  });

  test("lesson quiz records a score", async ({ page }) => {
    await page.goto("/paths/javascript/closures#quiz");
    const quiz = page.locator("#quiz");
    const sets = quiz.locator("fieldset");
    const n = await sets.count();
    for (let i = 0; i < n; i++) await sets.nth(i).locator("input[type=radio]").first().check();
    await quiz.getByRole("button", { name: "Check answers" }).click();
    await expect(quiz.getByRole("status")).toContainText("You scored");
    const s = await store(page);
    expect(s.progress["lesson:javascript/closures"].quiz.attempts).toBe(1);
  });

  test("notes and bookmarks are saved and searchable", async ({ page }) => {
    await page.goto("/interview/javascript/js-01");
    await page.getByRole("button", { name: "Bookmark" }).click();
    await page.getByRole("button", { name: "Add note" }).click();
    await page.getByLabel("Title").fill("My event loop pitch");
    await page.getByLabel("Note body").fill("Stack empties, then microtasks drain, then one task.");
    await page.getByRole("button", { name: "Save" }).click();
    await page.goto("/notes");
    await expect(page.getByText("My event loop pitch")).toBeVisible();
    await page.getByRole("tab", { name: /bookmarks/ }).click();
    await expect(page.getByRole("link", { name: /event loop/i })).toBeVisible();
    await page.goto("/search?q=microtasks%20drain");
    await expect(page.getByRole("link", { name: /My event loop pitch/ })).toBeVisible();
  });

  test("study plan → today's tasks → completion → calendar", async ({ page }) => {
    await page.goto("/planner/new?track=javascript");
    await page.getByRole("button", { name: "Save plan to my calendar" }).click();
    await expect(page).toHaveURL(/\/planner$/);
    const firstTask = page.getByRole("checkbox", { name: /Mark “.*” done/ }).first();
    await expect(firstTask).toBeVisible();
    await firstTask.check();
    await page.reload();
    await expect(page.getByRole("checkbox", { name: /Mark “.*” not done/ }).first()).toBeChecked();
    await page.goto("/calendar");
    await expect(page.locator("[title*='drag to move']").first()).toBeVisible();
    await page.goto("/");
    await expect(page.getByText("day streak")).toBeVisible();
    await expect(page.getByText(/1 day streak|^1$/).first()).toBeVisible();
  });

  test("an impossible plan says so instead of pretending", async ({ page }) => {
    await page.goto("/planner/new?track=go");
    const today = new Date();
    const target = new Date(today.getTime() + 2 * 86400000).toISOString().slice(0, 10);
    await page.getByLabel("Target completion date").fill(target);
    await expect(page.getByText(/days after your target/)).toBeVisible();
  });

  test("the JavaScript playground really executes code", async ({ page }) => {
    await page.goto("/lab/playground");
    await page.getByRole("button", { name: "Run" }).click();
    const log = page.getByRole("log");
    await expect(log).toContainText("B (task)", { timeout: 5000 });
    const lines = (await log.innerText()).split("\n").map((l) => l.replace(/^\d+ms\s*/, "").trim()).filter(Boolean);
    expect(lines).toEqual(["A", "E", "G", "C (microtask)", "D (microtask)", "F (after await)", "B (task)"]);
  });

  test("runnable lesson snippet matches its expected output", async ({ page }) => {
    await page.goto("/interview/javascript/js-01");
    const run = page.getByRole("button", { name: "Run" }).first();
    await run.click();
    await expect(page.getByText("✓ matches expected").first()).toBeVisible({ timeout: 5000 });
  });

  test("event-loop trace steps forward and back", async ({ page }) => {
    await page.goto("/lab/js-event-loop");
    await expect(page.getByText("step 1/17")).toBeVisible();
    await page.getByRole("button", { name: "Next step" }).click();
    await page.getByRole("button", { name: "Next step" }).click();
    await expect(page.getByText("step 3/17")).toBeVisible();
    await page.getByRole("button", { name: "Previous step" }).click();
    await expect(page.getByText("step 2/17")).toBeVisible();
  });

  test("output question answer schedules a revision", async ({ page }) => {
    await page.goto("/interview/output/lydia-001");
    await page.getByRole("button", { name: /^D/ }).click();
    await expect(page.getByText("Correct.")).toBeVisible();
    const s = await store(page);
    expect(s.progress["output:lydia-001"].revision).toBeTruthy();
  });

  test("command palette search navigates", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+k");
    await page.getByRole("combobox").fill("goroutine scheduler");
    await expect(page.getByRole("option").first()).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).not.toHaveURL(/\/$/);
  });

  test("theme preference persists across reloads", async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("radio", { name: "Dark" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("mock interview grades feed revision", async ({ page }) => {
    await page.goto("/interview/mock?track=go");
    await page.getByRole("button", { name: "Start" }).click();
    await page.getByRole("button", { name: "Reveal model answer" }).click();
    await page.getByRole("button", { name: /Solid/ }).click();
    const s = await store(page);
    expect(Object.keys(s.progress).some((k) => k.startsWith("question:go-") && s.progress[k].revision)).toBe(true);
  });
});

test.describe("mobile layout", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile only");
  for (const path of ["/", "/paths/javascript/closures", "/interview/javascript/js-01", "/lab/js-closure", "/lab/go-channels", "/lab/sys-request-flow", "/design/chat-application", "/planner/new", "/calendar", "/explore"]) {
    test(`no horizontal page scroll on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForTimeout(800);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
  test("drawer navigation works", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("dialog", { name: "Navigation" }).getByRole("link", { name: "Runtime lab" }).click();
    await expect(page).toHaveURL(/\/lab$/);
  });
});
