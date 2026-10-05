/**
 * Spaced repetition — a deliberately simple, transparent SM-2 variant.
 *
 * After each review the learner grades their recall. The next interval grows
 * multiplicatively with an "ease" factor that rises on easy recalls and falls on
 * hard ones. The first two intervals come from settings so the learner can make
 * the schedule more or less aggressive. Learners can always override the due date.
 */
import { addDays, type ISODate } from "./dates";

export type Grade = "again" | "hard" | "good" | "easy";

export interface RevisionState {
  /** days until the next review after the last one */
  interval: number;
  ease: number;
  /** successful reviews in a row */
  reps: number;
  due: ISODate;
  history: { date: ISODate; grade: Grade }[];
}

export interface SrsSettings {
  /** first and second successful intervals in days, e.g. [1, 3] */
  firstIntervals: [number, number];
  /** multiplies every computed interval (0.5 = twice as often) */
  intensity: number;
  maxInterval: number;
}

export const DEFAULT_SRS: SrsSettings = { firstIntervals: [1, 3], intensity: 1, maxInterval: 180 };
export const MIN_EASE = 1.3;
export const START_EASE = 2.5;

export function newRevision(today: ISODate, s: SrsSettings = DEFAULT_SRS): RevisionState {
  return { interval: 0, ease: START_EASE, reps: 0, due: addDays(today, Math.max(1, Math.round(s.firstIntervals[0] * s.intensity))), history: [] };
}

export function review(state: RevisionState, grade: Grade, today: ISODate, s: SrsSettings = DEFAULT_SRS): RevisionState {
  let { ease, reps, interval } = state;
  if (grade === "again") {
    reps = 0;
    ease = Math.max(MIN_EASE, ease - 0.2);
    interval = 1;
  } else {
    if (grade === "hard") ease = Math.max(MIN_EASE, ease - 0.15);
    if (grade === "easy") ease = ease + 0.15;
    if (reps === 0) interval = s.firstIntervals[0];
    else if (reps === 1) interval = s.firstIntervals[1];
    else interval = interval * (grade === "hard" ? 1.2 : ease);
    if (grade === "easy") interval *= 1.3;
    reps += 1;
    interval = Math.max(1, Math.min(s.maxInterval, Math.round(interval * s.intensity)));
  }
  return { interval, ease: Math.round(ease * 100) / 100, reps, due: addDays(today, interval), history: [...state.history, { date: today, grade }] };
}

export function isDue(state: RevisionState | undefined, today: ISODate) {
  return !!state && state.due <= today;
}
