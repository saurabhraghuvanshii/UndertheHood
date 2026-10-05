/**
 * Learner progress model and the transparent mastery rules.
 *
 * Opening a page never counts as learning. Status advances only from explicit
 * learner actions — marking the explanation understood, quiz results, practice,
 * confidence ratings and successful spaced reviews. The learner can override any
 * suggested status; overrides are remembered and shown as such.
 */
import type { ISODate } from "./dates";
import type { RevisionState } from "./srs";

export const STATUSES = [
  "not-started", "in-progress", "learned", "practised", "needs-revision", "interview-ready", "mastered",
] as const;
export type ProgressStatus = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<ProgressStatus, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  learned: "Learned once",
  practised: "Practised",
  "needs-revision": "Needs revision",
  "interview-ready": "Interview-ready",
  mastered: "Mastered",
};

/** Short glyphs so status is never conveyed by colour alone. */
export const STATUS_GLYPH: Record<ProgressStatus, string> = {
  "not-started": "○",
  "in-progress": "◔",
  learned: "◑",
  practised: "◕",
  "needs-revision": "↻",
  "interview-ready": "●",
  mastered: "★",
};

export interface QuizRecord { attempts: number; best: number; last: number; lastAt: ISODate }

export interface ItemProgress {
  /** learner override; when absent the suggested status is used */
  override?: ProgressStatus;
  startedAt?: ISODate;
  /** learner confirmed they understood the explanation */
  understoodAt?: ISODate;
  quiz?: QuizRecord;
  practiceDoneAt?: ISODate;
  confidence?: 1 | 2 | 3 | 4 | 5;
  lastStudied?: ISODate;
  /** minutes actively spent on the page (visible tab, capped per session) */
  minutes: number;
  revision?: RevisionState;
}

/** Keys: "lesson:javascript/closures", "question:js-01", "output:lydia-001", "design:url-shortener". */
export type ItemKey = string;
export const lessonKey = (ref: string) => `lesson:${ref}`;
export const questionKey = (id: string) => `question:${id}`;
export const outputKey = (id: string) => `output:${id}`;
export const designKey = (slug: string) => `design:${slug}`;

export const QUIZ_PASS = 70;

export interface MasteryCheck { label: string; met: boolean }

/**
 * Suggested status + the checklist that produced it, so the UI can show the learner
 * exactly why a status was suggested and what is missing for the next one.
 */
export function suggestStatus(p: ItemProgress | undefined, today: ISODate, opts: { hasQuiz: boolean }): { status: ProgressStatus; checks: MasteryCheck[] } {
  const quizOk = !opts.hasQuiz || (p?.quiz?.best ?? 0) >= QUIZ_PASS;
  const reviews = p?.revision?.history.filter((h) => h.grade === "good" || h.grade === "easy").length ?? 0;
  const checks: MasteryCheck[] = [
    { label: "Understood the explanation", met: !!p?.understoodAt },
    ...(opts.hasQuiz ? [{ label: `Scored ≥ ${QUIZ_PASS}% on the review quiz`, met: quizOk && !!p?.quiz }] : []),
    { label: "Completed a practice exercise", met: !!p?.practiceDoneAt },
    { label: "Confidence 4/5 or higher", met: (p?.confidence ?? 0) >= 4 },
    { label: "1 successful spaced review", met: reviews >= 1 },
    { label: "3 successful spaced reviews, interval ≥ 21 days", met: reviews >= 3 && (p?.revision?.interval ?? 0) >= 21 },
  ];
  if (!p) return { status: "not-started", checks };

  let status: ProgressStatus = p.startedAt || p.minutes > 0 || p.quiz ? "in-progress" : "not-started";
  if (p.understoodAt) status = "learned";
  if (p.understoodAt && quizOk && p.practiceDoneAt) status = "practised";
  if (status === "practised" && (p.confidence ?? 0) >= 4 && reviews >= 1) status = "interview-ready";
  if (status === "interview-ready" && reviews >= 3 && (p.revision?.interval ?? 0) >= 21) status = "mastered";
  // an overdue review demotes anything past "learned" until it's revised
  if (p.revision && p.revision.due < today && (status === "practised" || status === "interview-ready" || status === "learned" || status === "mastered")) {
    status = "needs-revision";
  }
  return { status, checks };
}

export function effectiveStatus(p: ItemProgress | undefined, today: ISODate, opts: { hasQuiz: boolean }): ProgressStatus {
  return p?.override ?? suggestStatus(p, today, opts).status;
}

export function isComplete(s: ProgressStatus) {
  return s === "learned" || s === "practised" || s === "interview-ready" || s === "mastered" || s === "needs-revision";
}
