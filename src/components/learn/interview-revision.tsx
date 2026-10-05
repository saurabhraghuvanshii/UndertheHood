"use client";
import Link from "next/link";
import { useHydrated, useLearner } from "@/lib/store";
import { effectiveStatus, questionKey } from "@/lib/progress";
import { today } from "@/lib/dates";
import { EmptyState } from "@/components/ui";
import { StatusPill } from "./progress-ui";

/** Bookmarked questions and questions needing revision. */
export function InterviewRevisionList({ meta }: { meta: { id: string; title: string; href: string; track: string }[] }) {
  const hydrated = useHydrated();
  const progress = useLearner((s) => s.progress);
  const bookmarks = useLearner((s) => s.bookmarks);
  if (!hydrated) return <div className="h-24 animate-pulse rounded-lg bg-surface-2" />;
  const t = today();
  const rows = meta.filter((m) => {
    const k = questionKey(m.id);
    const st = effectiveStatus(progress[k], t, { hasQuiz: false });
    return bookmarks[k] || st === "needs-revision" || st === "in-progress" || (progress[k]?.revision && progress[k]!.revision!.due <= t);
  });
  if (!rows.length) return <EmptyState title="Nothing here yet">Bookmark questions, or start working through a bank — questions you’re learning or that need revision collect here.</EmptyState>;
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
      {rows.map((r) => (
        <li key={r.id}>
          <Link href={r.href} className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-2">
            <span className="min-w-0 flex-1 truncate text-sm">{r.title}</span>
            {bookmarks[questionKey(r.id)] && <span className="text-xs text-subtle">bookmarked</span>}
            <StatusPill itemKey={questionKey(r.id)} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
