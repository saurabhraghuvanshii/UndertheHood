import type { ContentKind, Frequency, Level, TrackSlug, AuthoringStatus } from "./types";
import { lessonRef, lessons, moduleOf, questionsForLesson, tracks, getTrack } from "./index";

/** Compact, serialisable lesson rows for client components (explore, planner, dashboard). */
export interface LessonRow {
  ref: string;
  track: TrackSlug;
  trackTitle: string;
  module: string;
  title: string;
  summary: string;
  level: Level;
  frequency: Frequency;
  minutes: number;
  kinds: ContentKind[];
  status: AuthoringStatus;
  hasQuiz: boolean;
  prerequisites: string[];
  questions: { id: string; title: string }[];
  order: number;
}

let cache: LessonRow[] | null = null;
export function lessonRows(): LessonRow[] {
  if (cache) return cache;
  const order = new Map<string, number>();
  let n = 0;
  for (const t of tracks) for (const m of t.modules) for (const s of m.lessons) order.set(`${t.slug}/${s}`, n++);
  cache = lessons
    .map((l) => {
      const ref = lessonRef(l);
      return {
        ref,
        track: l.track,
        trackTitle: getTrack(l.track)?.title ?? l.track,
        module: moduleOf(ref)?.title ?? "",
        title: l.title,
        summary: l.summary,
        level: l.level,
        frequency: l.frequency,
        minutes: l.minutes,
        kinds: l.kinds,
        status: l.status,
        hasQuiz: !!l.quiz?.length,
        prerequisites: l.prerequisites,
        questions: questionsForLesson(l).slice(0, 3).map((q) => ({ id: q.id, title: q.question })),
        order: order.get(ref) ?? 1e6,
      };
    })
    .sort((a, b) => a.order - b.order);
  return cache;
}
