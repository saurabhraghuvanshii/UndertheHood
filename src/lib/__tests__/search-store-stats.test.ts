import { describe, expect, it, beforeEach } from "vitest";
import { search, tokenize, excerpt, type SearchDoc } from "../search";
import { actions, getState, migrate, STORAGE_KEY, EMPTY_STATE } from "../store";
import { streak, recommend } from "../stats";
import { lessonKey } from "../progress";
import { today, addDays } from "../dates";

describe("search", () => {
  const docs: SearchDoc[] = [
    { id: "1", kind: "lesson", title: "Closures", href: "/a", text: "A closure retains its lexical environment" },
    { id: "2", kind: "question", title: "What is the event loop?", href: "/b", text: "microtasks run before tasks; closures not involved" },
    { id: "3", kind: "glossary", title: "Lexical environment", href: "/c", text: "a record of bindings" },
  ];
  it("matches word prefixes and ranks title hits first", () => {
    const hits = search(docs, "clos");
    expect(hits[0].doc.id).toBe("1");
    expect(hits.map((h) => h.doc.id)).toContain("2");
  });
  it("requires every term to match", () => {
    expect(search(docs, "lexical bindings").map((h) => h.doc.id)).toEqual(["3"]);
  });
  it("filters by kind", () => {
    expect(search(docs, "closures", 10, ["question"]).map((h) => h.doc.id)).toEqual(["2"]);
  });
  it("tokenizes and excerpts", () => {
    expect(tokenize("Promise.all() & async/await")).toEqual(["promise.all", "async", "await"]);
    expect(excerpt("x".repeat(300) + " closure here", "closure")).toContain("closure");
  });
});

describe("store", () => {
  beforeEach(() => actions.reset());
  it("persists to localStorage and survives a reload (migrate)", () => {
    actions.setUnderstood(lessonKey("javascript/closures"), true);
    actions.toggleBookmark("question:js-01");
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    const reloaded = migrate(raw);
    expect(reloaded.progress[lessonKey("javascript/closures")].understoodAt).toBe(today());
    expect(reloaded.progress[lessonKey("javascript/closures")].revision).toBeDefined();
    expect(reloaded.bookmarks["question:js-01"]).toBeDefined();
  });
  it("migrate repairs corrupted data", () => {
    expect(migrate(null)).toEqual(EMPTY_STATE);
    const m = migrate({ notes: "nope", settings: { theme: "dark" } });
    expect(m.notes).toEqual([]);
    expect(m.settings.theme).toBe("dark");
    expect(m.settings.srs.firstIntervals).toEqual([1, 3]);
  });
  it("records quiz attempts keeping the best score", () => {
    actions.recordQuiz("lesson:x", 40);
    actions.recordQuiz("lesson:x", 90);
    actions.recordQuiz("lesson:x", 60);
    expect(getState().progress["lesson:x"].quiz).toMatchObject({ attempts: 3, best: 90, last: 60 });
  });
  it("completing a task logs study minutes; undoing removes them", () => {
    actions.addTask({ date: today(), kind: "custom", title: "Read", estMin: 25, done: false });
    const id = getState().tasks[0].id;
    actions.toggleTask(id);
    expect(getState().activity[today()]).toBe(25);
    actions.toggleTask(id);
    expect(getState().activity[today()]).toBe(0);
  });
  it("notes can be created, edited and deleted", () => {
    actions.saveNote({ title: "t", body: "b", kind: "note", tags: [], flagged: false });
    const n = getState().notes[0];
    actions.saveNote({ ...n, body: "edited" });
    expect(getState().notes).toHaveLength(1);
    expect(getState().notes[0].body).toBe("edited");
    actions.deleteNote(n.id);
    expect(getState().notes).toHaveLength(0);
  });
  it("deleting a plan keeps completed history", () => {
    actions.savePlan({ id: "p1", goal: "g", createdAt: today(), start: today(), target: today(), minutesPerDay: 30, daysOff: [], learnerLevel: "beginner", topics: [] }, [
      { id: "t1", date: today(), kind: "lesson", title: "a", estMin: 10, done: true, planId: "p1" },
      { id: "t2", date: today(), kind: "lesson", title: "b", estMin: 10, done: false, planId: "p1" },
    ]);
    actions.deletePlan("p1");
    expect(getState().tasks.map((t) => t.id)).toEqual(["t1"]);
  });
});

describe("stats", () => {
  const t = "2026-10-05";
  it("streak counts back from today or yesterday", () => {
    expect(streak({ [t]: 10, [addDays(t, -1)]: 5, [addDays(t, -3)]: 5 }, new Set(), t)).toBe(2);
    expect(streak({ [addDays(t, -1)]: 5, [addDays(t, -2)]: 5 }, new Set(), t)).toBe(2);
    expect(streak({}, new Set([t]), t)).toBe(1);
    expect(streak({ [addDays(t, -2)]: 5 }, new Set(), t)).toBe(0);
  });
  it("recommends lessons whose prerequisites are done", () => {
    const rows = [
      { ref: "j/a", prerequisites: [], hasQuiz: false, status: "authored" as const, order: 0, track: "j" },
      { ref: "j/b", prerequisites: ["j/a"], hasQuiz: false, status: "authored" as const, order: 1, track: "j" },
    ];
    expect(recommend(rows, { progress: {} }, t).map((r) => r.ref)).toEqual(["j/a"]);
    expect(recommend(rows, { progress: { "lesson:j/a": { minutes: 0, understoodAt: t } } }, t).map((r) => r.ref)).toEqual(["j/b"]);
  });
});
