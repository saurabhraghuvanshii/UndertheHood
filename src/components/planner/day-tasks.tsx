"use client";
import Link from "next/link";
import { useState } from "react";
import { CalendarDays, Trash2 } from "lucide-react";
import { actions, useLearner } from "@/lib/store";
import type { PlanTask, TaskKind } from "@/lib/planner";
import type { ISODate } from "@/lib/dates";
import { Button, EmptyState } from "@/components/ui";
import { cn } from "@/components/ui/cn";

export const KIND_LABEL: Record<TaskKind, string> = { lesson: "Lesson", practice: "Practice", question: "Interview Q", revision: "Revision", review: "Weekly review", custom: "Task" };
const KIND_ORDER: TaskKind[] = ["revision", "lesson", "practice", "question", "review", "custom"];

export function taskHref(t: PlanTask): string | undefined {
  if (!t.ref) return t.kind === "review" ? "/revision" : undefined;
  if (t.ref.startsWith("question:")) return `/q/${t.ref.slice(9)}`;
  if (t.kind === "practice") return `/paths/${t.ref}#quiz`;
  return `/paths/${t.ref}`;
}

export function TaskRow({ t, draggable }: { t: PlanTask; draggable?: boolean }) {
  const [moving, setMoving] = useState(false);
  const href = taskHref(t);
  return (
    <li
      className={cn("group flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border px-3 py-2", t.done ? "border-border bg-surface-2" : "border-border-strong bg-surface")}
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/task-id", t.id);
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      <input type="checkbox" checked={t.done} onChange={() => actions.toggleTask(t.id)} aria-label={`Mark “${t.title}” ${t.done ? "not done" : "done"}`} className="h-4 w-4 accent-[var(--accent)]" />
      <span className="w-20 shrink-0 text-[11px] font-medium uppercase tracking-wide text-subtle">{KIND_LABEL[t.kind]}</span>
      <span className={cn("min-w-0 flex-1 text-sm", t.done && "text-muted line-through")}>
        {href ? <Link href={href} className="hover:underline">{t.title}</Link> : t.title}
      </span>
      <span className="flex items-center gap-1 text-xs text-muted">
        {t.done ? (
          <label className="inline-flex items-center gap-1">
            <input type="number" min={0} value={t.actualMin ?? t.estMin} onChange={(e) => actions.updateTask(t.id, { actualMin: Math.max(0, +e.target.value) })} className="w-14 rounded border border-border-strong bg-surface px-1 py-0.5 text-right" aria-label="Actual minutes" />
            min
          </label>
        ) : (
          <span>{t.estMin} min</span>
        )}
        {moving ? (
          <input type="date" autoFocus defaultValue={t.date} onBlur={() => setMoving(false)} onChange={(e) => { if (e.target.value) { actions.updateTask(t.id, { date: e.target.value }); setMoving(false); } }} className="rounded border border-border-strong bg-surface px-1 py-0.5" aria-label="Move to date" />
        ) : (
          <button onClick={() => setMoving(true)} className="rounded p-1 opacity-60 hover:bg-surface-3 hover:opacity-100" aria-label={`Move “${t.title}” to another day`} title="Move to another day"><CalendarDays className="h-3.5 w-3.5" /></button>
        )}
        <button onClick={() => actions.deleteTask(t.id)} className="rounded p-1 opacity-60 hover:bg-surface-3 hover:opacity-100" aria-label={`Delete “${t.title}”`} title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
      </span>
    </li>
  );
}

export function DayTasks({ date, emptyHint }: { date: ISODate; emptyHint?: React.ReactNode }) {
  const all = useLearner((s) => s.tasks);
  const tasks = all.filter((t) => t.date === date).sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind));
  const [title, setTitle] = useState("");
  const [est, setEst] = useState(30);
  const planned = tasks.reduce((s, t) => s + t.estMin, 0);
  const done = tasks.filter((t) => t.done).reduce((s, t) => s + (t.actualMin ?? t.estMin), 0);
  return (
    <div>
      {tasks.length > 0 && (
        <p className="mb-2 text-xs text-muted">{tasks.filter((t) => t.done).length}/{tasks.length} done · {done} of {planned} planned minutes</p>
      )}
      {tasks.length === 0 ? <EmptyState title="Nothing scheduled.">{emptyHint}</EmptyState> : <ul className="space-y-1.5">{tasks.map((t) => <TaskRow key={t.id} t={t} />)}</ul>}
      <form
        className="mt-3 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          actions.addTask({ date, kind: "custom", title: title.trim(), estMin: est, done: false });
          setTitle("");
        }}
      >
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a task or study session…" aria-label="New task" className="min-w-0 flex-1 rounded-md border border-border-strong bg-surface px-2.5 py-1.5 text-sm" />
        <input type="number" min={5} step={5} value={est} onChange={(e) => setEst(+e.target.value)} aria-label="Estimated minutes" className="w-20 rounded-md border border-border-strong bg-surface px-2 py-1.5 text-sm" />
        <Button type="submit" size="sm">Add</Button>
      </form>
    </div>
  );
}
