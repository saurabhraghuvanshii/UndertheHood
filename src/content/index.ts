/**
 * Content registry: the single place that knows which content files exist.
 * Everything else asks this module for tracks, lessons and questions.
 */
import type { DesignExercise, InterviewQuestion, Lesson, OutputQuestion, Track, TrackSlug } from "./types";

import * as javascript from "./tracks/javascript";
import * as nodejs from "./tracks/nodejs";
import * as go from "./tracks/go";
import * as goFundamentals from "./tracks/go-fundamentals";
import * as goConcurrency from "./tracks/go-concurrency";
import * as typescript from "./tracks/typescript";
import * as react from "./tracks/react";
import * as dsa from "./tracks/dsa";
import * as networks from "./tracks/networks";
import * as os from "./tracks/os";
import * as databases from "./tracks/databases";
import * as backend from "./tracks/backend";
import * as distributed from "./tracks/distributed";
import * as systemDesign from "./tracks/system-design";
import * as systemDesignA from "./tracks/system-design-a";
import * as systemDesignB from "./tracks/system-design-b";
import * as cloud from "./tracks/cloud";
import * as production from "./tracks/production";
import * as ai from "./tracks/ai";

import * as jsA from "./interview/javascript-a";
import * as jsB from "./interview/javascript-b";
import * as goQ from "./interview/go";
import * as frontendQ from "./interview/frontend-runtime";
import * as backendQ from "./interview/backend-infra";

import { exercises } from "./design/exercises";
import lydia from "./imported/lydia-questions.json";

/** Display order of learning paths (matches the curriculum order in the product brief). */
export const tracks: Track[] = [
  javascript.track, nodejs.track, go.track, typescript.track, react.track, dsa.track,
  networks.track, os.track, databases.track, backend.track, distributed.track,
  systemDesign.track, cloud.track, production.track, ai.track,
];

export const lessons: Lesson[] = [
  ...javascript.lessons, ...nodejs.lessons, ...goFundamentals.lessons, ...goConcurrency.lessons,
  ...typescript.lessons, ...react.lessons, ...dsa.lessons, ...networks.lessons, ...os.lessons,
  ...databases.lessons, ...backend.lessons, ...distributed.lessons, ...systemDesignA.lessons,
  ...systemDesignB.lessons, ...cloud.lessons, ...production.lessons, ...ai.lessons,
];

export const questions: InterviewQuestion[] = [
  ...jsA.questions, ...jsB.questions, ...goQ.questions, ...frontendQ.questions, ...backendQ.questions,
];

export const outputQuestions = lydia as OutputQuestion[];
export const designExercises: DesignExercise[] = exercises;

const lessonIndex = new Map(lessons.map((l) => [lessonRef(l), l]));
const questionIndex = new Map(questions.map((q) => [q.id, q]));
const trackIndex = new Map(tracks.map((t) => [t.slug, t]));

export function lessonRef(l: Pick<Lesson, "track" | "slug">) {
  return `${l.track}/${l.slug}`;
}

export function getTrack(slug: string): Track | undefined {
  return trackIndex.get(slug as TrackSlug);
}

export function getLesson(ref: string): Lesson | undefined {
  return lessonIndex.get(ref);
}

export function getQuestion(id: string): InterviewQuestion | undefined {
  // accept "javascript/js-01" style refs as well as bare ids
  return questionIndex.get(id.includes("/") ? id.split("/").pop()! : id);
}

export function getDesignExercise(slug: string) {
  return designExercises.find((e) => e.slug === slug);
}

/** Lessons of a track in curriculum order (module order, then lesson order). */
export function trackLessons(slug: string): Lesson[] {
  const t = getTrack(slug);
  if (!t) return [];
  return t.modules.flatMap((m) => m.lessons.map((s) => getLesson(`${slug}/${s}`)).filter((l): l is Lesson => !!l));
}

export function questionsForTrack(slug: string) {
  return questions.filter((q) => q.track === slug).sort((a, b) => a.number - b.number);
}

/** Previous/next lesson within the track's curriculum order. */
export function lessonNeighbours(ref: string) {
  const [track] = ref.split("/");
  const list = trackLessons(track);
  const i = list.findIndex((l) => lessonRef(l) === ref);
  return { prev: i > 0 ? list[i - 1] : undefined, next: i >= 0 && i < list.length - 1 ? list[i + 1] : undefined };
}

export function moduleOf(ref: string) {
  const [track, slug] = ref.split("/");
  return getTrack(track)?.modules.find((m) => m.lessons.includes(slug));
}

/** Resolve a ref that may point at a lesson ("track/slug") or a question ("track/q-id"). */
export function resolveRef(ref: string): { kind: "lesson"; lesson: Lesson } | { kind: "question"; question: InterviewQuestion } | undefined {
  const l = getLesson(ref);
  if (l) return { kind: "lesson", lesson: l };
  const q = getQuestion(ref);
  if (q) return { kind: "question", question: q };
  return undefined;
}

export function lessonsReferencing(ref: string) {
  return lessons.filter((l) => l.prerequisites.includes(ref) || l.related.includes(ref));
}

/** Interview questions linked to a lesson, from either side of the relation. */
export function questionsForLesson(l: Lesson): InterviewQuestion[] {
  const ref = lessonRef(l);
  const ids = new Set((l.questions ?? []).map((q) => q.split("/").pop()!));
  return questions.filter((q) => ids.has(q.id) || q.relatedLessons.includes(ref)).sort((a, b) => a.track.localeCompare(b.track) || a.number - b.number);
}
