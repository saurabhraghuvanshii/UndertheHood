import Link from "next/link";
import { resolveRef } from "@/content";
import { lessonHref, questionHref } from "@/lib/routes";

/** Renders a "track/slug" or question ref as a link, or as plain text if it doesn't exist yet. */
export function RefLink({ refId, showTrack }: { refId: string; showTrack?: boolean }) {
  const r = resolveRef(refId);
  if (!r) return <span className="text-subtle" title="Not written yet">{refId.split("/").pop()?.replace(/-/g, " ")} <span className="text-xs">(planned)</span></span>;
  if (r.kind === "lesson")
    return (
      <Link href={lessonHref(r.lesson)} className="hover:underline">
        {r.lesson.title}
        {showTrack && <span className="ml-1 text-xs text-subtle">· {r.lesson.track}</span>}
      </Link>
    );
  return <Link href={questionHref(r.question)} className="hover:underline">Q{r.question.number}. {r.question.question}</Link>;
}
