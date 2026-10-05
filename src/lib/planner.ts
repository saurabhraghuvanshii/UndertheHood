/**
 * Study-plan generation and rescheduling. Pure functions — no React, no storage —
 * so the scheduling rules are unit-tested and easy to reason about.
 *
 * Rules:
 * 1. Selected topics are expanded with their missing prerequisites (unless already
 *    completed) and ordered so prerequisites come first, otherwise keeping the
 *    learner's chosen order.
 * 2. Estimated time = authored lesson time × a difficulty multiplier that depends on
 *    the learner's self-assessed level vs the lesson level.
 * 3. Each study day is filled up to the learner's available minutes. A lesson larger
 *    than a day is split into parts across consecutive study days.
 * 4. After each lesson a short practice task is added, plus spaced revision sessions
 *    at +1, +3 and +7 study-calendar days (revisions are scheduled first on a day).
 * 5. A weekly review closes every 7th calendar day that has study time.
 * 6. Nothing is silently dropped: if the work doesn't fit before the target date the
 *    plan says so and reports the date it would actually finish.
 */
import { addDays, diffDays, weekday, type ISODate } from "./dates";
import type { Level } from "@/content/types";

export interface PlanTopic {
  ref: string;
  title: string;
  minutes: number;
  level: Level;
  prerequisites: string[];
  /** interview questions to practise alongside (ids) */
  questions?: { id: string; title: string }[];
}

export type TaskKind = "lesson" | "practice" | "question" | "revision" | "review" | "custom";

export interface PlanTask {
  id: string;
  date: ISODate;
  kind: TaskKind;
  title: string;
  ref?: string;
  estMin: number;
  actualMin?: number;
  done: boolean;
  doneAt?: ISODate;
  planId?: string;
  /** part i of n for split lessons */
  part?: [number, number];
}

export interface PlanInput {
  planId: string;
  topics: string[];
  start: ISODate;
  target: ISODate;
  minutesPerDay: number;
  /** weekdays with no study, 0 = Sunday */
  daysOff: number[];
  learnerLevel: Level;
  /** refs the learner already completed (prereqs not re-added) */
  completed?: Set<string>;
  includeQuestions?: boolean;
  includeRevision?: boolean;
}

export interface PlanResult {
  tasks: PlanTask[];
  orderedTopics: string[];
  addedPrerequisites: string[];
  totalMinutes: number;
  studyDays: number;
  finishDate: ISODate;
  fitsTarget: boolean;
  warnings: string[];
}

const LEVELS: Level[] = ["beginner", "intermediate", "advanced", "expert"];

/** How much longer a lesson takes when it's above (or below) the learner's level. */
export function difficultyMultiplier(learner: Level, lesson: Level): number {
  const gap = LEVELS.indexOf(lesson) - LEVELS.indexOf(learner);
  return [0.75, 0.85, 1, 1.3, 1.6, 2][Math.max(-2, Math.min(3, gap)) + 2];
}

export const PRACTICE_MIN = 15;
export const QUESTION_MIN = 10;
export const REVISION_MIN = 10;
export const REVIEW_MIN = 20;
const MAX_QUESTIONS_PER_TOPIC = 2;
const REVISION_OFFSETS = [1, 3, 7];

/** Prerequisite-respecting order (stable w.r.t. the learner's order); expands missing prereqs. */
export function orderTopics(selected: string[], lookup: (ref: string) => PlanTopic | undefined, completed = new Set<string>()) {
  const added: string[] = [];
  const included = new Set<string>();
  const visiting = new Set<string>();
  const order: string[] = [];
  const visit = (ref: string, explicit: boolean) => {
    if (included.has(ref) || visiting.has(ref)) return; // visiting => cycle; break it
    const t = lookup(ref);
    if (!t) return;
    if (!explicit && completed.has(ref)) return;
    visiting.add(ref);
    for (const p of t.prerequisites) visit(p, false);
    visiting.delete(ref);
    included.add(ref);
    order.push(ref);
    if (!explicit && !selected.includes(ref)) added.push(ref);
  };
  for (const ref of selected) visit(ref, true);
  return { order, added };
}

export function generatePlan(input: PlanInput, lookup: (ref: string) => PlanTopic | undefined): PlanResult {
  const warnings: string[] = [];
  const cap = Math.max(15, Math.round(input.minutesPerDay));
  if (input.daysOff.length >= 7) {
    return { tasks: [], orderedTopics: [], addedPrerequisites: [], totalMinutes: 0, studyDays: 0, finishDate: input.start, fitsTarget: false, warnings: ["Every weekday is marked as a day off — choose at least one study day."] };
  }
  const { order, added } = orderTopics(input.topics, lookup, input.completed);
  if (added.length) warnings.push(`Added ${added.length} prerequisite topic${added.length > 1 ? "s" : ""} you haven't completed yet.`);

  // Work queue: ordered units of work; revisions are injected by date as lessons complete.
  type Unit = Omit<PlanTask, "id" | "date" | "done">;
  const queue: Unit[] = [];
  for (const ref of order) {
    const t = lookup(ref)!;
    const est = Math.max(10, Math.round((t.minutes * difficultyMultiplier(input.learnerLevel, t.level)) / 5) * 5);
    const parts = Math.ceil(est / cap);
    for (let i = 0; i < parts; i++) {
      const m = i === parts - 1 ? est - cap * (parts - 1) : cap;
      queue.push({ kind: "lesson", ref, title: parts > 1 ? `${t.title} (part ${i + 1}/${parts})` : t.title, estMin: m, part: parts > 1 ? [i + 1, parts] : undefined, planId: input.planId });
    }
    queue.push({ kind: "practice", ref, title: `Practice: ${t.title}`, estMin: PRACTICE_MIN, planId: input.planId });
    if (input.includeQuestions !== false) {
      for (const q of (t.questions ?? []).slice(0, MAX_QUESTIONS_PER_TOPIC)) {
        queue.push({ kind: "question", ref: `question:${q.id}`, title: q.title, estMin: QUESTION_MIN, planId: input.planId });
      }
    }
  }

  const tasks: PlanTask[] = [];
  const pendingRevisions = new Map<ISODate, Unit[]>();
  let n = 0;
  const id = () => `${input.planId}-${++n}`;
  let day = input.start;
  let studyDays = 0;
  let lastStudyDay = input.start;
  let daysSinceReview = 0;
  const hardStop = addDays(input.start, 3 * 365);

  while ((queue.length || pendingRevisions.size) && day <= hardStop) {
    if (input.daysOff.includes(weekday(day))) {
      // revisions due on a day off roll forward to the next study day
      const due = pendingRevisions.get(day);
      if (due) {
        pendingRevisions.delete(day);
        const nextDay = addDays(day, 1);
        pendingRevisions.set(nextDay, [...due, ...(pendingRevisions.get(nextDay) ?? [])]);
      }
      day = addDays(day, 1);
      continue;
    }
    let left = cap;
    let used = false;
    const revs = pendingRevisions.get(day) ?? [];
    pendingRevisions.delete(day);
    for (const r of revs) {
      if (left - r.estMin < 0 && used) {
        // overflow: push to tomorrow
        const nextDay = addDays(day, 1);
        pendingRevisions.set(nextDay, [...(pendingRevisions.get(nextDay) ?? []), r]);
        continue;
      }
      tasks.push({ ...r, id: id(), date: day, done: false });
      left -= r.estMin;
      used = true;
    }
    while (queue.length && (queue[0].estMin <= left || !used)) {
      const u = queue.shift()!;
      tasks.push({ ...u, id: id(), date: day, done: false });
      left -= u.estMin;
      used = true;
      const lessonDone = u.kind === "lesson" && (!u.part || u.part[0] === u.part[1]);
      if (lessonDone && input.includeRevision !== false) {
        for (const off of REVISION_OFFSETS) {
          const d = addDays(day, off);
          const title = lookup(u.ref!)!.title;
          pendingRevisions.set(d, [...(pendingRevisions.get(d) ?? []), { kind: "revision", ref: u.ref, title: `Revise: ${title}`, estMin: REVISION_MIN, planId: input.planId }]);
        }
      }
    }
    if (used) {
      studyDays++;
      lastStudyDay = day;
      daysSinceReview++;
      if (daysSinceReview >= 6 && left >= REVIEW_MIN) {
        tasks.push({ id: id(), date: day, kind: "review", title: "Weekly review: revisit notes, redo missed quiz questions", estMin: REVIEW_MIN, done: false, planId: input.planId });
        daysSinceReview = 0;
      }
    }
    day = addDays(day, 1);
  }

  const totalMinutes = tasks.reduce((s, t) => s + t.estMin, 0);
  // finish date = day the last *lesson/practice/question* lands (trailing revisions are a bonus)
  const coreTasks = tasks.filter((t) => t.kind !== "revision" && t.kind !== "review");
  const finishDate = coreTasks.length ? coreTasks[coreTasks.length - 1].date : lastStudyDay;
  const fitsTarget = finishDate <= input.target;
  if (!fitsTarget) {
    warnings.push(
      `At ${cap} min/day this plan finishes on ${finishDate}, ${diffDays(finishDate, input.target)} days after your target. Increase daily time, add study days, push the target date, or remove topics.`,
    );
  }
  if (!order.length) warnings.push("No topics selected.");
  return { tasks, orderedTopics: order, addedPrerequisites: added, totalMinutes, studyDays, finishDate, fitsTarget, warnings };
}

/**
 * Move unfinished tasks dated before `today` onto the next study days, keeping their
 * order and respecting the daily budget (tasks already on those days stay put).
 */
export function rescheduleMissed(tasks: PlanTask[], today: ISODate, minutesPerDay: number, daysOff: number[]): { tasks: PlanTask[]; moved: number } {
  const missed = tasks.filter((t) => !t.done && t.date < today).sort((a, b) => a.date.localeCompare(b.date));
  if (!missed.length || daysOff.length >= 7) return { tasks, moved: 0 };
  const load = new Map<ISODate, number>();
  for (const t of tasks) if (!t.done && t.date >= today) load.set(t.date, (load.get(t.date) ?? 0) + t.estMin);
  const moved = new Map<string, ISODate>();
  let day = today;
  for (const t of missed) {
    for (;;) {
      if (!daysOff.includes(weekday(day))) {
        const l = load.get(day) ?? 0;
        if (l + t.estMin <= minutesPerDay || l === 0) {
          load.set(day, l + t.estMin);
          moved.set(t.id, day);
          break;
        }
      }
      day = addDays(day, 1);
    }
  }
  return { tasks: tasks.map((t) => (moved.has(t.id) ? { ...t, date: moved.get(t.id)! } : t)), moved: moved.size };
}

export function minutesOn(tasks: PlanTask[], date: ISODate) {
  return tasks.filter((t) => t.date === date).reduce((s, t) => s + t.estMin, 0);
}
