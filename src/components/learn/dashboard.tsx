"use client";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import type { LessonRow } from "@/content/summaries";
import type { ItemMeta } from "@/content/item-index";
import { useHydrated, useLearner, getState } from "@/lib/store";
import { formatShort, formatWeekdayShort, today } from "@/lib/dates";
import { recentMinutes, recommend, streak, weakItems } from "@/lib/stats";
import { effectiveStatus, isComplete, lessonKey } from "@/lib/progress";
import { Badge, ButtonLink, Card, EmptyState, ProgressBar, SectionTitle } from "@/components/ui";
import { TaskRow } from "@/components/planner/day-tasks";
import { cn } from "@/components/ui/cn";

export function Dashboard({ rows, meta, tracks }: { rows: LessonRow[]; meta: Record<string, ItemMeta>; tracks: { slug: string; title: string }[] }) {
  const hydrated = useHydrated();
  const s = useLearner((x) => x);
  if (!hydrated) return <div className="grid gap-4 md:grid-cols-2"><div className="h-40 animate-pulse rounded-lg bg-surface-2" /><div className="h-40 animate-pulse rounded-lg bg-surface-2" /></div>;

  const t = today();
  const isNew = Object.keys(s.progress).length === 0 && s.tasks.length === 0 && s.notes.length === 0;
  const todayTasks = s.tasks.filter((x) => x.date === t);
  const doneDates = new Set(s.tasks.filter((x) => x.done && x.doneAt).map((x) => x.doneAt!));
  const st = streak(s.activity, doneDates, t);
  const week = recentMinutes(s.activity, t, 7);
  const weekTotal = week.reduce((a, b) => a + b.minutes, 0);
  const maxMin = Math.max(30, ...week.map((w) => w.minutes));
  const due = Object.entries(s.progress).filter(([k, p]) => p.revision && meta[k]).sort((a, b) => a[1].revision!.due.localeCompare(b[1].revision!.due));
  const dueNow = due.filter(([, p]) => p.revision!.due <= t);
  const recs = recommend(rows, getState(), t, 4);
  const weak = weakItems(s).filter((w) => meta[w.key]).slice(0, 5);
  const bookmarkedQs = Object.keys(s.bookmarks).filter((k) => meta[k] && (meta[k].kind === "Question" || meta[k].kind === "Output Q")).slice(0, 6);
  const trackStats = tracks.map((tr) => {
    const ls = rows.filter((r) => r.track === tr.slug);
    const done = ls.filter((r) => isComplete(effectiveStatus(s.progress[lessonKey(r.ref)], t, { hasQuiz: r.hasQuiz }))).length;
    const started = ls.some((r) => s.progress[lessonKey(r.ref)]);
    return { ...tr, total: ls.length, done, started };
  });
  const totals = trackStats.reduce((a, b) => ({ done: a.done + b.done, total: a.total + b.total }), { done: 0, total: 0 });
  const milestones = s.plans.filter((p) => p.target >= t).sort((a, b) => a.target.localeCompare(b.target));
  const byRef = new Map(rows.map((r) => [r.ref, r]));

  return (
    <div className="space-y-8">
      {isNew && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold">Welcome. Where do you want to start?</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">Nothing is tracked yet — progress only appears when you mark things understood, take quizzes, practise or review. A good first hour:</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Link href="/paths/javascript/execution-context" className="rounded-lg border border-border p-3 hover:bg-surface-2"><span className="font-medium">How JavaScript runs</span><span className="block text-sm text-muted">Execution contexts → closures → the event loop</span></Link>
            <Link href="/paths/go/goroutines" className="rounded-lg border border-border p-3 hover:bg-surface-2"><span className="font-medium">How Go schedules goroutines</span><span className="block text-sm text-muted">Goroutines → G/M/P → channels</span></Link>
            <Link href="/planner/new" className="rounded-lg border border-border p-3 hover:bg-surface-2"><span className="font-medium">Build a study plan</span><span className="block text-sm text-muted">Pick a goal, a date and your daily time</span></Link>
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <SectionTitle action={<Link href="/planner" className="text-sm text-accent hover:underline">Planner →</Link>}>Today’s study plan</SectionTitle>
          {todayTasks.length === 0 ? (
            <EmptyState title="Nothing scheduled today." action={s.plans.length ? <ButtonLink href="/calendar" size="sm">Open calendar</ButtonLink> : <ButtonLink href="/planner/new" size="sm" variant="primary">Create a plan</ButtonLink>} />
          ) : (
            <>
              <p className="mb-2 text-xs text-muted">{todayTasks.filter((x) => x.done).length}/{todayTasks.length} done · {todayTasks.reduce((a, b) => a + b.estMin, 0)} min planned</p>
              <ul className="space-y-1.5">{todayTasks.slice(0, 6).map((x) => <TaskRow key={x.id} t={x} />)}</ul>
              {todayTasks.length > 6 && <Link href="/planner" className="mt-2 inline-block text-sm text-accent underline">+{todayTasks.length - 6} more</Link>}
            </>
          )}
        </Card>
        <Card className="p-5">
          <SectionTitle>Momentum</SectionTitle>
          <div className="flex items-baseline gap-2">
            <Flame className={cn("h-5 w-5 self-center", st > 0 ? "text-warn" : "text-subtle")} aria-hidden />
            <span className="text-3xl font-semibold">{st}</span>
            <span className="text-sm text-muted">day streak</span>
          </div>
          <p className="mt-1 text-xs text-muted">{weekTotal} active minutes in the last 7 days</p>
          <ol className="mt-4 flex h-24 items-end gap-1.5" aria-label="Minutes studied per day, last 7 days">
            {week.map((w) => (
              <li key={w.date} className="flex flex-1 flex-col items-center gap-1" title={`${formatShort(w.date)}: ${w.minutes} min`}>
                <span className="sr-only">{formatShort(w.date)}: {w.minutes} minutes</span>
                <span className={cn("w-full rounded-sm", w.minutes ? "bg-accent" : "bg-surface-3")} style={{ height: `${Math.max(4, (w.minutes / maxMin) * 80)}px` }} aria-hidden />
                <span className="text-[10px] text-subtle" aria-hidden>{formatWeekdayShort(w.date).slice(0, 1)}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {s.lastVisited && (
        <Link href={s.lastVisited.href} className="flex items-center gap-3 rounded-lg border border-border bg-surface px-5 py-4 hover:border-border-strong">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">Continue</span>
          <span className="min-w-0 flex-1 truncate font-medium">{s.lastVisited.title}</span>
          <ArrowRight className="h-4 w-4 text-subtle" aria-hidden />
        </Link>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <SectionTitle>Recommended next</SectionTitle>
          <ul className="space-y-2">
            {recs.map((r) => {
              const row = byRef.get(r.ref)!;
              return (
                <li key={r.ref}>
                  <Link href={`/paths/${r.ref}`} className="block rounded-md px-2 py-1.5 hover:bg-surface-2">
                    <span className="font-medium">{row.title}</span>
                    <span className="block text-xs text-muted">{row.trackTitle} · {row.minutes} min{row.status === "outline" && " · outline"}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-subtle">Lessons whose prerequisites you’ve completed, preferring paths you’ve started.</p>
        </Card>
        <Card className="p-5">
          <SectionTitle action={<Link href="/revision" className="text-sm text-accent hover:underline">Revision →</Link>}>Upcoming revisions</SectionTitle>
          {due.length === 0 ? <p className="text-sm text-muted">No reviews scheduled yet.</p> : (
            <>
              <p className="mb-2 text-sm">{dueNow.length ? <strong className="text-warn">{dueNow.length} due now</strong> : "Nothing due today"} · {due.length} in the queue</p>
              <ul className="space-y-1 text-sm">
                {due.slice(0, 5).map(([k, p]) => (
                  <li key={k} className="flex gap-2"><span className="w-16 shrink-0 text-xs text-muted">{p.revision!.due <= t ? "due" : formatShort(p.revision!.due)}</span><Link href={meta[k].href} className="truncate hover:underline">{meta[k].title}</Link></li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <SectionTitle action={<span className="text-xs text-muted">{totals.done} of {totals.total} topics learned</span>}>Progress by path</SectionTitle>
          <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {[...trackStats].sort((a, b) => Number(b.started) - Number(a.started) || b.done - a.done).map((tr) => (
              <li key={tr.slug}>
                <Link href={`/paths/${tr.slug}`} className="block">
                  <span className="mb-1 flex justify-between text-sm"><span className={tr.started ? "font-medium" : "text-muted"}>{tr.title}</span><span className="font-mono text-xs text-subtle">{tr.done}/{tr.total}</span></span>
                  <ProgressBar value={tr.done} max={tr.total} label={`${tr.title} progress`} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <div className="space-y-4">
          <Card className="p-5">
            <SectionTitle>Needs more practice</SectionTitle>
            {weak.length === 0 ? <p className="text-sm text-muted">Low quiz scores, low confidence and forgotten reviews will show up here.</p> : (
              <ul className="space-y-2 text-sm">{weak.map((w) => <li key={w.key}><Link href={meta[w.key].href} className="font-medium hover:underline">{meta[w.key].title}</Link><span className="block text-xs text-muted">{w.reasons.join(" · ")}</span></li>)}</ul>
            )}
          </Card>
          <Card className="p-5">
            <SectionTitle action={<Link href="/notes" className="text-sm text-accent hover:underline">All →</Link>}>Bookmarked questions</SectionTitle>
            {bookmarkedQs.length === 0 ? <p className="text-sm text-muted">None yet.</p> : <ul className="space-y-1 text-sm">{bookmarkedQs.map((k) => <li key={k}><Link href={meta[k].href} className="hover:underline">{meta[k].title}</Link></li>)}</ul>}
          </Card>
          {milestones.length > 0 && (
            <Card className="p-5">
              <SectionTitle>Upcoming milestones</SectionTitle>
              <ul className="space-y-1.5 text-sm">{milestones.map((p) => <li key={p.id} className="flex justify-between gap-2"><span>{p.goal}</span><Badge tone="warn">{formatShort(p.target)}</Badge></li>)}</ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
