import { describe, expect, it } from "vitest";
import { designExercises, getLesson, getQuestion, lessonRef, lessons, outputQuestions, questions, resolveRef, tracks } from "@/content";
import type { Block } from "@/content/types";
import { VIZ_META } from "@/components/viz/meta";

const allBlocks = (): Block[] => [
  ...lessons.flatMap((l) => l.sections.flatMap((s) => s.blocks)),
  ...questions.flatMap((q) => q.deep),
  ...designExercises.flatMap((e) => [...e.estimation, ...e.api, ...e.dataModel, ...e.architecture.notes]),
];

describe("tracks and lessons", () => {
  it("has all 15 learning paths", () => {
    expect(tracks.map((t) => t.slug)).toHaveLength(15);
    for (const t of tracks) expect(t.modules.length, `${t.slug} has modules`).toBeGreaterThan(0);
  });

  it("every module lesson exists and every lesson belongs to a module", () => {
    for (const t of tracks) {
      const inModules = t.modules.flatMap((m) => m.lessons);
      expect(new Set(inModules).size, `${t.slug}: duplicate slugs in modules`).toBe(inModules.length);
      for (const s of inModules) expect(getLesson(`${t.slug}/${s}`), `${t.slug}/${s} missing`).toBeDefined();
      for (const l of lessons.filter((x) => x.track === t.slug)) expect(inModules, `${lessonRef(l)} not in any module`).toContain(l.slug);
    }
  });

  it("lesson refs are unique", () => {
    const refs = lessons.map(lessonRef);
    expect(new Set(refs).size).toBe(refs.length);
  });

  it("prerequisites and related refs resolve", () => {
    const broken: string[] = [];
    for (const l of lessons) for (const r of [...l.prerequisites, ...l.related]) if (!resolveRef(r)) broken.push(`${lessonRef(l)} → ${r}`);
    expect(broken).toEqual([]);
  });

  it("milestone exercises resolve", () => {
    const broken = tracks.flatMap((t) => t.milestones.flatMap((m) => m.exercises.filter((e) => !resolveRef(e)).map((e) => `${t.slug}:${m.id} → ${e}`)));
    expect(broken).toEqual([]);
  });

  it("authored lessons are substantial; outlines say what they will cover", () => {
    for (const l of lessons) {
      if (l.status === "authored") expect(l.sections.length, `${lessonRef(l)} sections`).toBeGreaterThanOrEqual(4);
      else expect(l.sections.some((s) => s.id === "objectives"), `${lessonRef(l)} outline objectives`).toBe(true);
      expect(l.summary.length, `${lessonRef(l)} summary`).toBeGreaterThan(20);
      expect(l.minutes).toBeGreaterThan(0);
    }
  });

  it("quiz answers point at an option", () => {
    for (const l of lessons) for (const q of l.quiz ?? []) expect(q.answer, `${lessonRef(l)}:${q.id}`).toBeLessThan(q.options.length);
  });

  it("no cycles in prerequisites", () => {
    const state = new Map<string, number>();
    const cycles: string[] = [];
    const visit = (ref: string, path: string[]) => {
      if (state.get(ref) === 2) return;
      if (state.get(ref) === 1) { cycles.push([...path, ref].join(" → ")); return; }
      state.set(ref, 1);
      for (const p of getLesson(ref)?.prerequisites ?? []) visit(p, [...path, ref]);
      state.set(ref, 2);
    };
    for (const l of lessons) visit(lessonRef(l), []);
    expect(cycles).toEqual([]);
  });

  it("covers the Go curriculum and the 40-topic system design checklist", () => {
    const sd = tracks.find((t) => t.slug === "system-design")!;
    const topics = sd.modules.flatMap((m) => m.lessons).filter((s) => s !== "interview-framework");
    expect(topics).toHaveLength(40);
    expect(getLesson("go/why-go")).toBeDefined();
    expect(getLesson("go/gmp-scheduler")?.status).toBe("authored");
  });
});

describe("interview banks", () => {
  it("keeps all 52 JavaScript questions in their original order", () => {
    const js = questions.filter((q) => q.track === "javascript").sort((a, b) => a.number - b.number);
    expect(js.map((q) => q.number)).toEqual(Array.from({ length: 52 }, (_, i) => i + 1));
    expect(js.map((q) => q.id)).toEqual(Array.from({ length: 52 }, (_, i) => `js-${String(i + 1).padStart(2, "0")}`));
  });

  it("question ids are unique and cross-links resolve", () => {
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    const broken: string[] = [];
    for (const q of questions) {
      for (const r of q.relatedQuestions) if (!getQuestion(r)) broken.push(`${q.id} → ${r}`);
      for (const r of q.relatedLessons) if (!getLesson(r)) broken.push(`${q.id} → ${r}`);
    }
    expect(broken).toEqual([]);
  });

  it("every question has an answer, follow-ups and a glossary", () => {
    for (const q of questions) {
      expect(q.shortAnswer.length, q.id).toBeGreaterThan(80);
      expect(q.deep.length, q.id).toBeGreaterThan(0);
      expect(q.followUps.length, q.id).toBeGreaterThan(0);
    }
  });

  it("imports all 155 output-prediction questions with valid answers and attribution", () => {
    expect(outputQuestions).toHaveLength(155);
    for (const o of outputQuestions) {
      expect(o.answer).toBeLessThan(o.options.length);
      expect(o.source.url).toContain("lydiahallie");
    }
  });
});

describe("design exercises", () => {
  it("has 12 exercises whose diagrams are well formed", () => {
    expect(designExercises).toHaveLength(12);
    for (const e of designExercises) {
      const ids = new Set(e.architecture.nodes.map((n) => n.id));
      for (const edge of e.architecture.edges) {
        expect(ids.has(edge.from), `${e.slug}: ${edge.from}`).toBe(true);
        expect(ids.has(edge.to), `${e.slug}: ${edge.to}`).toBe(true);
      }
      expect(e.walkthrough.length).toBeGreaterThanOrEqual(8);
      for (const r of e.related) expect(resolveRef(r), `${e.slug} → ${r}`).toBeDefined();
    }
  });
});

describe("blocks", () => {
  it("every embedded visualization exists", () => {
    const ids = allBlocks().filter((b): b is Extract<Block, { type: "viz" }> => b.type === "viz").map((b) => b.id);
    for (const id of ids) expect(VIZ_META[id], id).toBeDefined();
  });

  it("internal links point at real routes", () => {
    const text = JSON.stringify([lessons, questions, designExercises]);
    const links = [...text.matchAll(/\]\((\/[^)\s]+)\)/g)].map((m) => m[1].split("#")[0]);
    const bad = links.filter((h) => {
      const m = h.match(/^\/paths\/([^/]+)\/([^/]+)$/);
      if (m) return !getLesson(`${m[1]}/${m[2]}`);
      return !/^\/(paths|interview|lab|design|planner|calendar|revision|notes|search|settings|explore|projects)(\/|$)/.test(h);
    });
    expect([...new Set(bad)]).toEqual([]);
  });
});
