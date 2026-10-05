import { addDays, type ISODate } from "./dates";
import type { LearnerState } from "./store";
import { effectiveStatus, isComplete, lessonKey } from "./progress";

/** Consecutive days (ending today, or yesterday if today has nothing yet) with study activity. */
export function streak(activity: Record<ISODate, number>, doneDates: Set<ISODate>, today: ISODate): number {
  const active = (d: ISODate) => (activity[d] ?? 0) > 0 || doneDates.has(d);
  let d = active(today) ? today : addDays(today, -1);
  let n = 0;
  while (active(d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

/** Minutes per day for the last `days` days (oldest first). */
export function recentMinutes(activity: Record<ISODate, number>, today: ISODate, days = 7) {
  return Array.from({ length: days }, (_, i) => {
    const d = addDays(today, i - days + 1);
    return { date: d, minutes: activity[d] ?? 0 };
  });
}

export interface RecRow { ref: string; prerequisites: string[]; hasQuiz: boolean; status: "authored" | "outline"; order: number; track: string }

/**
 * Next lessons: not yet completed, all prerequisites completed (or unknown), preferring
 * tracks the learner has already started, authored lessons, then curriculum order.
 */
export function recommend(rows: RecRow[], s: Pick<LearnerState, "progress">, today: ISODate, n = 4) {
  const done = new Set(rows.filter((r) => isComplete(effectiveStatus(s.progress[lessonKey(r.ref)], today, { hasQuiz: r.hasQuiz }))).map((r) => r.ref));
  const known = new Set(rows.map((r) => r.ref));
  const activeTracks = new Set(rows.filter((r) => s.progress[lessonKey(r.ref)]).map((r) => r.track));
  return rows
    .filter((r) => !done.has(r.ref) && r.prerequisites.every((p) => done.has(p) || !known.has(p)))
    .sort((a, b) =>
      Number(activeTracks.has(b.track)) - Number(activeTracks.has(a.track)) ||
      Number(b.status === "authored") - Number(a.status === "authored") ||
      a.order - b.order,
    )
    .slice(0, n);
}

/** Weak spots: low quiz scores, low confidence, or recently forgotten reviews. */
export function weakItems(s: Pick<LearnerState, "progress">) {
  return Object.entries(s.progress)
    .map(([key, p]) => {
      const reasons: string[] = [];
      if (p.quiz && p.quiz.best < 70) reasons.push(`quiz best ${p.quiz.best}%`);
      if (p.confidence && p.confidence <= 2) reasons.push(`confidence ${p.confidence}/5`);
      const last = p.revision?.history.at(-1);
      if (last && (last.grade === "again" || last.grade === "hard")) reasons.push(`last review: ${last.grade}`);
      return { key, reasons };
    })
    .filter((x) => x.reasons.length > 0);
}
