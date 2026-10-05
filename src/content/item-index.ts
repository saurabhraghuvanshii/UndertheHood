import { designExercises, lessonRef, lessons, outputQuestions, questions } from "./index";
import { lessonKey, questionKey, designKey, outputKey } from "@/lib/progress";
import { lessonHref, questionHref, designHref, outputHref } from "@/lib/routes";

export interface ItemMeta { title: string; href: string; kind: "Lesson" | "Question" | "Design" | "Output Q"; track?: string }

/** Title + link for every trackable item key. Passed to client lists (revision queue, bookmarks, dashboard). */
export function itemMeta(): Record<string, ItemMeta> {
  const m: Record<string, ItemMeta> = {};
  for (const l of lessons) m[lessonKey(lessonRef(l))] = { title: l.title, href: lessonHref(l), kind: "Lesson", track: l.track };
  for (const q of questions) m[questionKey(q.id)] = { title: q.question, href: questionHref(q), kind: "Question", track: q.track };
  for (const e of designExercises) m[designKey(e.slug)] = { title: e.title, href: designHref(e.slug), kind: "Design", track: "system-design" };
  for (const o of outputQuestions) m[outputKey(o.id)] = { title: `Output #${o.number}`, href: outputHref(o.id), kind: "Output Q", track: "javascript" };
  return m;
}
