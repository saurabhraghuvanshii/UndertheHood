"use client";
/**
 * Local-first learner store.
 *
 * All learner data (progress, notes, bookmarks, plans, calendar) lives in this
 * browser's localStorage under one versioned key. That means:
 *   - it survives refreshes and restarts of this browser profile;
 *   - it does NOT sync across devices or browsers, and clearing site data erases it;
 *   - Settings → Export/Import moves it between browsers manually.
 *
 * The store is a tiny external store consumed with useSyncExternalStore. During
 * server rendering and the first hydration pass components see EMPTY_STATE, then
 * re-render with the real data (`useHydrated()` lets UI avoid flashing zeros).
 */
import { useSyncExternalStore } from "react";
import { today, type ISODate } from "./dates";
import type { ItemKey, ItemProgress, ProgressStatus, QuizRecord } from "./progress";
import { DEFAULT_SRS, newRevision, review, type Grade, type SrsSettings } from "./srs";
import type { PlanTask } from "./planner";
import type { Level } from "@/content/types";

export const STORAGE_KEY = "under-the-hood:v1";
export const SCHEMA_VERSION = 1;

export interface Note {
  id: string;
  /** item the note is attached to (lesson/question key) — optional for free notes */
  itemKey?: ItemKey;
  kind: "note" | "answer" | "snippet";
  title: string;
  body: string;
  tags: string[];
  /** flagged for revision */
  flagged: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudyPlan {
  id: string;
  goal: string;
  createdAt: ISODate;
  start: ISODate;
  target: ISODate;
  minutesPerDay: number;
  daysOff: number[];
  learnerLevel: Level;
  topics: string[];
}

export interface Settings {
  theme: "system" | "light" | "dark";
  motion: "system" | "reduce" | "full";
  srs: SrsSettings;
}

export interface LearnerState {
  version: number;
  progress: Record<ItemKey, ItemProgress>;
  bookmarks: Record<ItemKey, { createdAt: string }>;
  notes: Note[];
  plans: StudyPlan[];
  activePlanId?: string;
  tasks: PlanTask[];
  reflections: Record<ISODate, string>;
  /** minutes studied per day — drives streaks and weekly progress */
  activity: Record<ISODate, number>;
  lastVisited?: { key: ItemKey; href: string; title: string; at: string };
  settings: Settings;
}

export const EMPTY_STATE: LearnerState = {
  version: SCHEMA_VERSION,
  progress: {},
  bookmarks: {},
  notes: [],
  plans: [],
  tasks: [],
  reflections: {},
  activity: {},
  settings: { theme: "system", motion: "system", srs: DEFAULT_SRS },
};

/** Accepts anything (old versions, partial or corrupted data) and returns a valid state. */
export function migrate(raw: unknown): LearnerState {
  if (!raw || typeof raw !== "object") return EMPTY_STATE;
  const r = raw as Partial<LearnerState>;
  return {
    ...EMPTY_STATE,
    ...r,
    version: SCHEMA_VERSION,
    progress: r.progress && typeof r.progress === "object" ? r.progress : {},
    bookmarks: r.bookmarks && typeof r.bookmarks === "object" ? r.bookmarks : {},
    notes: Array.isArray(r.notes) ? r.notes : [],
    plans: Array.isArray(r.plans) ? r.plans : [],
    tasks: Array.isArray(r.tasks) ? r.tasks : [],
    reflections: r.reflections ?? {},
    activity: r.activity ?? {},
    settings: { ...EMPTY_STATE.settings, ...(r.settings ?? {}), srs: { ...DEFAULT_SRS, ...(r.settings?.srs ?? {}) } },
  };
}

let state: LearnerState = EMPTY_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    state = raw ? migrate(JSON.parse(raw)) : EMPTY_STATE;
  } catch {
    state = EMPTY_STATE;
  }
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    try {
      state = e.newValue ? migrate(JSON.parse(e.newValue)) : EMPTY_STATE;
    } catch {
      return;
    }
    listeners.forEach((l) => l());
  });
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or blocked (private mode): keep working in memory
  }
}

export function getState() {
  load();
  return state;
}

export function setState(update: (s: LearnerState) => LearnerState) {
  load();
  state = update(state);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  load();
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useLearner<T>(select: (s: LearnerState) => T): T {
  return useSyncExternalStore(subscribe, () => select(getState()), () => select(EMPTY_STATE));
}

const subscribeNoop = () => () => {};
/** false during SSR and the hydration pass, true afterwards. */
export function useHydrated() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

/* ------------------------------------------------------------------ actions */

const blank = (): ItemProgress => ({ minutes: 0 });

function patchItem(key: ItemKey, f: (p: ItemProgress) => ItemProgress) {
  setState((s) => ({ ...s, progress: { ...s.progress, [key]: f(s.progress[key] ?? blank()) } }));
}

export const actions = {
  markStarted(key: ItemKey) {
    const p = getState().progress[key];
    if (p?.startedAt) return;
    patchItem(key, (p) => ({ ...p, startedAt: today(), lastStudied: today() }));
  },
  setUnderstood(key: ItemKey, value: boolean) {
    patchItem(key, (p) => ({
      ...p,
      startedAt: p.startedAt ?? today(),
      understoodAt: value ? today() : undefined,
      lastStudied: today(),
      // first time something is understood it enters the revision queue
      revision: value && !p.revision ? newRevision(today(), getState().settings.srs) : p.revision,
    }));
  },
  recordQuiz(key: ItemKey, scorePct: number) {
    patchItem(key, (p) => {
      const q: QuizRecord = p.quiz
        ? { attempts: p.quiz.attempts + 1, best: Math.max(p.quiz.best, scorePct), last: scorePct, lastAt: today() }
        : { attempts: 1, best: scorePct, last: scorePct, lastAt: today() };
      return { ...p, startedAt: p.startedAt ?? today(), quiz: q, lastStudied: today() };
    });
  },
  setPracticeDone(key: ItemKey, value: boolean) {
    patchItem(key, (p) => ({ ...p, practiceDoneAt: value ? today() : undefined, lastStudied: today() }));
  },
  setConfidence(key: ItemKey, c: ItemProgress["confidence"]) {
    patchItem(key, (p) => ({ ...p, confidence: c }));
  },
  setOverride(key: ItemKey, status: ProgressStatus | undefined) {
    patchItem(key, (p) => ({ ...p, override: status, startedAt: p.startedAt ?? (status && status !== "not-started" ? today() : undefined) }));
  },
  addToRevision(key: ItemKey) {
    patchItem(key, (p) => ({ ...p, revision: p.revision ?? newRevision(today(), getState().settings.srs) }));
  },
  removeFromRevision(key: ItemKey) {
    patchItem(key, (p) => ({ ...p, revision: undefined }));
  },
  reviewItem(key: ItemKey, grade: Grade) {
    patchItem(key, (p) => ({
      ...p,
      lastStudied: today(),
      revision: review(p.revision ?? newRevision(today(), getState().settings.srs), grade, today(), getState().settings.srs),
    }));
    actions.logMinutes(key, 0);
  },
  setRevisionDue(key: ItemKey, due: ISODate) {
    patchItem(key, (p) => (p.revision ? { ...p, revision: { ...p.revision, due } } : p));
  },
  /** adds active study minutes to the item and to today's activity */
  logMinutes(key: ItemKey | undefined, minutes: number) {
    const d = today();
    setState((s) => ({
      ...s,
      activity: { ...s.activity, [d]: (s.activity[d] ?? 0) + minutes },
      progress: key ? { ...s.progress, [key]: { ...(s.progress[key] ?? blank()), minutes: (s.progress[key]?.minutes ?? 0) + minutes, lastStudied: d } } : s.progress,
    }));
  },
  visit(key: ItemKey, href: string, title: string) {
    setState((s) => ({ ...s, lastVisited: { key, href, title, at: new Date().toISOString() } }));
  },
  toggleBookmark(key: ItemKey) {
    setState((s) => {
      const b = { ...s.bookmarks };
      if (b[key]) delete b[key];
      else b[key] = { createdAt: new Date().toISOString() };
      return { ...s, bookmarks: b };
    });
  },
  saveNote(note: Omit<Note, "id" | "createdAt" | "updatedAt"> & { id?: string }) {
    const now = new Date().toISOString();
    setState((s) => {
      if (note.id && s.notes.some((n) => n.id === note.id)) {
        return { ...s, notes: s.notes.map((n) => (n.id === note.id ? { ...n, ...note, id: n.id, updatedAt: now } : n)) };
      }
      return { ...s, notes: [{ ...note, id: note.id ?? uid(), createdAt: now, updatedAt: now }, ...s.notes] };
    });
  },
  deleteNote(id: string) {
    setState((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) }));
  },
  savePlan(plan: StudyPlan, tasks: PlanTask[]) {
    setState((s) => ({
      ...s,
      plans: [...s.plans.filter((p) => p.id !== plan.id), plan],
      activePlanId: plan.id,
      // replace this plan's future unfinished tasks; keep history and other tasks
      tasks: [...s.tasks.filter((t) => t.planId !== plan.id || t.done), ...tasks],
    }));
  },
  deletePlan(id: string) {
    setState((s) => ({
      ...s,
      plans: s.plans.filter((p) => p.id !== id),
      activePlanId: s.activePlanId === id ? undefined : s.activePlanId,
      tasks: s.tasks.filter((t) => t.planId !== id || t.done),
    }));
  },
  addTask(t: Omit<PlanTask, "id">) {
    setState((s) => ({ ...s, tasks: [...s.tasks, { ...t, id: uid() }] }));
  },
  updateTask(id: string, patch: Partial<PlanTask>) {
    setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
  },
  setTasks(tasks: PlanTask[]) {
    setState((s) => ({ ...s, tasks }));
  },
  toggleTask(id: string) {
    const t = getState().tasks.find((x) => x.id === id);
    if (!t) return;
    const done = !t.done;
    actions.updateTask(id, { done, doneAt: done ? today() : undefined, actualMin: done ? (t.actualMin ?? t.estMin) : t.actualMin });
    // completing a task counts as study time for the day (undo removes it)
    const mins = t.actualMin ?? t.estMin;
    setState((s) => ({ ...s, activity: { ...s.activity, [today()]: Math.max(0, (s.activity[today()] ?? 0) + (done ? mins : -mins)) } }));
  },
  deleteTask(id: string) {
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
  },
  setReflection(date: ISODate, text: string) {
    setState((s) => ({ ...s, reflections: { ...s.reflections, [date]: text } }));
  },
  updateSettings(patch: Partial<Settings>) {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  },
  importState(json: string) {
    const parsed = migrate(JSON.parse(json));
    setState(() => parsed);
  },
  reset() {
    setState(() => EMPTY_STATE);
  },
};

export function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}
