"use client";
import Link from "next/link";
import { useState } from "react";
import type { ItemMeta } from "@/content/item-index";
import { actions, useHydrated, useLearner } from "@/lib/store";
import { addDays, diffDays, formatShort, today } from "@/lib/dates";
import type { Grade } from "@/lib/srs";
import { Badge, Button, EmptyState, SectionTitle } from "@/components/ui";

const GRADES: { g: Grade; label: string }[] = [
  { g: "again", label: "Forgot" },
  { g: "hard", label: "Hard" },
  { g: "good", label: "Good" },
  { g: "easy", label: "Easy" },
];

export function RevisionQueue({ meta }: { meta: Record<string, ItemMeta> }) {
  const hydrated = useHydrated();
  const progress = useLearner((s) => s.progress);
  const notes = useLearner((s) => s.notes);
  const [editing, setEditing] = useState<string | null>(null);
  if (!hydrated) return <div className="h-64 animate-pulse rounded-lg bg-surface-2" />;
  const t = today();
  const items = Object.entries(progress).filter(([k, p]) => p.revision && meta[k]).sort((a, b) => a[1].revision!.due.localeCompare(b[1].revision!.due));
  const due = items.filter(([, p]) => p.revision!.due <= t);
  const upcoming = items.filter(([, p]) => p.revision!.due > t);
  const flagged = notes.filter((n) => n.flagged);

  const Row = ({ k, showGrades }: { k: string; showGrades: boolean }) => {
    const p = progress[k];
    const r = p.revision!;
    const overdue = diffDays(t, r.due);
    return (
      <li className="rounded-lg border border-border bg-surface p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{meta[k].kind}</Badge>
          <Link href={meta[k].href} className="min-w-0 flex-1 font-medium hover:underline">{meta[k].title}</Link>
          <span className="text-xs text-muted">
            {r.due <= t ? (overdue > 0 ? <span className="text-warn">{overdue}d overdue</span> : "due today") : `due ${formatShort(r.due)}`}
            {" · "}interval {r.interval || "—"}d · {r.reps} good in a row
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {showGrades && (
            <>
              <span className="text-xs text-muted">Recall it, open it if needed, then grade:</span>
              {GRADES.map((g) => <Button key={g.g} size="sm" variant={g.g === "good" ? "primary" : "secondary"} onClick={() => actions.reviewItem(k, g.g)}>{g.label}</Button>)}
            </>
          )}
          <span className="ml-auto flex items-center gap-2 text-xs">
            {editing === k ? (
              <input type="date" autoFocus defaultValue={r.due} onBlur={() => setEditing(null)} onChange={(e) => { if (e.target.value) { actions.setRevisionDue(k, e.target.value); setEditing(null); } }} className="rounded border border-border-strong bg-surface px-1 py-0.5" aria-label="New due date" />
            ) : (
              <button className="underline" onClick={() => setEditing(k)}>change date</button>
            )}
            <button className="underline" onClick={() => actions.setRevisionDue(k, addDays(t, 1))}>tomorrow</button>
            <button className="text-danger underline" onClick={() => actions.removeFromRevision(k)}>remove</button>
          </span>
        </div>
      </li>
    );
  };

  return (
    <div className="space-y-10">
      <section>
        <SectionTitle>Due now ({due.length})</SectionTitle>
        {due.length === 0 ? (
          <EmptyState title={items.length ? "All caught up." : "Your revision queue is empty."}>
            {items.length ? `Next review ${upcoming[0] ? formatShort(upcoming[0][1].revision!.due) : ""}.` : "Items join the queue when you mark a lesson understood, answer an output question, grade a mock-interview answer, or press “Add to revision queue”."}
          </EmptyState>
        ) : (
          <ul className="space-y-2">{due.map(([k]) => <Row key={k} k={k} showGrades />)}</ul>
        )}
      </section>
      {upcoming.length > 0 && (
        <section>
          <SectionTitle>Upcoming ({upcoming.length})</SectionTitle>
          <ul className="space-y-2">{upcoming.slice(0, 50).map(([k]) => <Row key={k} k={k} showGrades={false} />)}</ul>
        </section>
      )}
      {flagged.length > 0 && (
        <section>
          <SectionTitle>Notes flagged for revision ({flagged.length})</SectionTitle>
          <ul className="space-y-1.5 text-sm">{flagged.map((n) => <li key={n.id}><Link href={`/notes?note=${n.id}`} className="hover:underline">{n.title || n.body.slice(0, 80)}</Link>{n.itemKey && meta[n.itemKey] && <span className="text-muted"> · {meta[n.itemKey].title}</span>}</li>)}</ul>
        </section>
      )}
    </div>
  );
}
