import { describe, expect, it } from "vitest";
import { newRevision, review, DEFAULT_SRS, MIN_EASE } from "../srs";
import { suggestStatus, effectiveStatus, type ItemProgress } from "../progress";

describe("spaced repetition", () => {
  const t0 = "2026-10-05";
  it("uses the configured first intervals and then grows by ease", () => {
    let r = newRevision(t0);
    expect(r.due).toBe("2026-10-06");
    r = review(r, "good", t0);
    expect(r.interval).toBe(1);
    r = review(r, "good", t0);
    expect(r.interval).toBe(3);
    r = review(r, "good", t0);
    expect(r.interval).toBe(8); // 3 * 2.5 = 7.5 → 8
  });
  it("resets on 'again' and never lets ease fall below the minimum", () => {
    let r = newRevision(t0);
    for (let i = 0; i < 20; i++) r = review(r, "again", t0);
    expect(r.interval).toBe(1);
    expect(r.reps).toBe(0);
    expect(r.ease).toBeGreaterThanOrEqual(MIN_EASE);
  });
  it("honours intensity", () => {
    const relaxed = review(review(review(newRevision(t0), "good", t0), "good", t0), "good", t0, { ...DEFAULT_SRS, intensity: 2 });
    expect(relaxed.interval).toBeGreaterThan(8);
  });
});

describe("mastery model", () => {
  const t = "2026-10-05";
  const p = (x: Partial<ItemProgress>): ItemProgress => ({ minutes: 0, ...x });
  it("opening a page is not learning", () => {
    expect(suggestStatus(undefined, t, { hasQuiz: true }).status).toBe("not-started");
    expect(suggestStatus(p({ minutes: 12, startedAt: t }), t, { hasQuiz: true }).status).toBe("in-progress");
  });
  it("requires understanding + quiz + practice for 'practised'", () => {
    expect(suggestStatus(p({ understoodAt: t }), t, { hasQuiz: true }).status).toBe("learned");
    expect(suggestStatus(p({ understoodAt: t, practiceDoneAt: t, quiz: { attempts: 1, best: 50, last: 50, lastAt: t } }), t, { hasQuiz: true }).status).toBe("learned");
    expect(suggestStatus(p({ understoodAt: t, practiceDoneAt: t, quiz: { attempts: 1, best: 80, last: 80, lastAt: t } }), t, { hasQuiz: true }).status).toBe("practised");
  });
  it("needs confidence and a good review for interview-ready; three for mastered", () => {
    const rev = (n: number, interval: number) => ({ interval, ease: 2.5, reps: n, due: "2026-12-01", history: Array.from({ length: n }, () => ({ date: t, grade: "good" as const })) });
    const base = { understoodAt: t, practiceDoneAt: t, confidence: 4 as const };
    expect(suggestStatus(p({ ...base, revision: rev(1, 3) }), t, { hasQuiz: false }).status).toBe("interview-ready");
    expect(suggestStatus(p({ ...base, revision: rev(3, 8) }), t, { hasQuiz: false }).status).toBe("interview-ready");
    expect(suggestStatus(p({ ...base, revision: rev(3, 21) }), t, { hasQuiz: false }).status).toBe("mastered");
  });
  it("an overdue review means needs-revision", () => {
    expect(suggestStatus(p({ understoodAt: "2026-09-01", revision: { interval: 3, ease: 2.5, reps: 1, due: "2026-09-10", history: [] } }), t, { hasQuiz: false }).status).toBe("needs-revision");
  });
  it("learner overrides win", () => {
    expect(effectiveStatus(p({ override: "mastered" }), t, { hasQuiz: true })).toBe("mastered");
  });
});
