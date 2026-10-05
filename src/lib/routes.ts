import type { InterviewQuestion, Lesson } from "@/content/types";

export const lessonHref = (l: Pick<Lesson, "track" | "slug">) => `/paths/${l.track}/${l.slug}`;
export const questionHref = (q: Pick<InterviewQuestion, "track" | "id">) => `/interview/${q.track}/${q.id}`;
export const designHref = (slug: string) => `/design/${slug}`;
export const outputHref = (id: string) => `/interview/output/${id}`;

/** Item keys (progress/bookmarks) → href, for dashboards and lists. */
export function hrefForKey(key: string): string {
  const [kind, rest] = [key.slice(0, key.indexOf(":")), key.slice(key.indexOf(":") + 1)];
  if (kind === "lesson") return `/paths/${rest}`;
  if (kind === "design") return designHref(rest);
  if (kind === "output") return outputHref(rest);
  return "#";
}
