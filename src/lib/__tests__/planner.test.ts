import { describe, expect, it } from "vitest";
import { difficultyMultiplier, generatePlan, orderTopics, rescheduleMissed, type PlanTopic, type PlanTask } from "../planner";
import { weekday } from "../dates";

const T: Record<string, PlanTopic> = {
  "js/scope": { ref: "js/scope", title: "Scope", minutes: 30, level: "beginner", prerequisites: [] },
  "js/exec": { ref: "js/exec", title: "Execution context", minutes: 40, level: "intermediate", prerequisites: ["js/scope"] },
  "js/closures": { ref: "js/closures", title: "Closures", minutes: 50, level: "intermediate", prerequisites: ["js/exec", "js/scope"], questions: [{ id: "js-02", title: "Closures?" }] },
  "js/huge": { ref: "js/huge", title: "Huge topic", minutes: 200, level: "beginner", prerequisites: [] },
  "a": { ref: "a", title: "A", minutes: 20, level: "beginner", prerequisites: ["b"] },
  "b": { ref: "b", title: "B", minutes: 20, level: "beginner", prerequisites: ["a"] },
};
const lookup = (r: string) => T[r];
const base = { planId: "p", start: "2026-10-05", target: "2026-12-31", minutesPerDay: 60, daysOff: [] as number[], learnerLevel: "intermediate" as const };

describe("orderTopics", () => {
  it("puts prerequisites first and adds missing ones", () => {
    const { order, added } = orderTopics(["js/closures"], lookup);
    expect(order).toEqual(["js/scope", "js/exec", "js/closures"]);
    expect(added).toEqual(["js/scope", "js/exec"]);
  });
  it("does not re-add completed prerequisites", () => {
    expect(orderTopics(["js/closures"], lookup, new Set(["js/scope"])).order).toEqual(["js/exec", "js/closures"]);
  });
  it("survives prerequisite cycles", () => {
    expect(orderTopics(["a"], lookup).order.sort()).toEqual(["a", "b"]);
  });
});

describe("generatePlan", () => {
  it("never exceeds the daily budget except to fit a single unit", () => {
    const r = generatePlan({ ...base, topics: ["js/closures"] }, lookup);
    const byDay = new Map<string, number>();
    for (const t of r.tasks) byDay.set(t.date, (byDay.get(t.date) ?? 0) + t.estMin);
    for (const [, m] of byDay) expect(m).toBeLessThanOrEqual(60 + 20);
    expect(r.fitsTarget).toBe(true);
  });
  it("splits lessons larger than a day into parts", () => {
    const r = generatePlan({ ...base, topics: ["js/huge"], learnerLevel: "beginner" }, lookup);
    const parts = r.tasks.filter((t) => t.kind === "lesson");
    expect(parts.length).toBe(4);
    expect(parts[0].part).toEqual([1, 4]);
    expect(new Set(parts.map((p) => p.date)).size).toBe(4);
  });
  it("skips days off", () => {
    const r = generatePlan({ ...base, topics: ["js/closures", "js/huge"], daysOff: [0, 6] }, lookup);
    for (const t of r.tasks) expect([0, 6]).not.toContain(weekday(t.date));
  });
  it("schedules revisions after the lesson and practice right after it", () => {
    const r = generatePlan({ ...base, topics: ["js/scope"] }, lookup);
    const lesson = r.tasks.find((t) => t.kind === "lesson")!;
    const revs = r.tasks.filter((t) => t.kind === "revision");
    expect(revs.length).toBe(3);
    for (const v of revs) expect(v.date > lesson.date).toBe(true);
    expect(r.tasks.find((t) => t.kind === "practice")).toBeDefined();
  });
  it("adds interview questions for topics that have them", () => {
    const r = generatePlan({ ...base, topics: ["js/closures"] }, lookup);
    expect(r.tasks.some((t) => t.kind === "question" && t.ref === "question:js-02")).toBe(true);
  });
  it("reports honestly when the plan cannot meet the target", () => {
    const r = generatePlan({ ...base, topics: ["js/huge", "js/closures"], target: "2026-10-06", minutesPerDay: 30 }, lookup);
    expect(r.fitsTarget).toBe(false);
    expect(r.finishDate > "2026-10-06").toBe(true);
    expect(r.warnings.some((w) => w.includes("after your target"))).toBe(true);
  });
  it("harder lessons take longer for beginners", () => {
    expect(difficultyMultiplier("beginner", "advanced")).toBeGreaterThan(difficultyMultiplier("advanced", "advanced"));
    expect(difficultyMultiplier("advanced", "beginner")).toBeLessThan(1);
  });
  it("refuses a schedule with no study days", () => {
    expect(generatePlan({ ...base, topics: ["js/scope"], daysOff: [0, 1, 2, 3, 4, 5, 6] }, lookup).tasks).toEqual([]);
  });
});

describe("rescheduleMissed", () => {
  const task = (id: string, date: string, est = 30, done = false): PlanTask => ({ id, date, kind: "lesson", title: id, estMin: est, done });
  it("moves unfinished past tasks forward without overfilling days", () => {
    const tasks = [task("a", "2026-10-01"), task("b", "2026-10-02"), task("c", "2026-10-03", 30, true), task("d", "2026-10-05", 40)];
    const { tasks: out, moved } = rescheduleMissed(tasks, "2026-10-05", 60, []);
    expect(moved).toBe(2);
    const get = (id: string) => out.find((t) => t.id === id)!;
    expect(get("c").date).toBe("2026-10-03"); // done tasks stay as history
    expect(get("a").date).toBe("2026-10-06"); // today already has 40 of 60 min
    expect(get("b").date).toBe("2026-10-06");
  });
});
