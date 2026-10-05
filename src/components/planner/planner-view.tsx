"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { actions, useHydrated, useLearner } from "@/lib/store";
import { rescheduleMissed } from "@/lib/planner";
import { addDays, daysInRange, formatLong, formatShort, formatWeekdayShort, startOfWeek, today, type ISODate } from "@/lib/dates";
import { Button, ButtonLink, EmptyState, ProgressBar, SectionTitle } from "@/components/ui";
import { DayTasks } from "./day-tasks";
import { cn } from "@/components/ui/cn";

export function PlannerView({ date }: { date: ISODate }) {
  const hydrated = useHydrated();
  const router = useRouter();
  const tasks = useLearner((s) => s.tasks);
  const plans = useLearner((s) => s.plans);
  const activeId = useLearner((s) => s.activePlanId);
  const reflections = useLearner((s) => s.reflections);
  const progress = useLearner((s) => s.progress);
  const t = today();
  const plan = plans.find((p) => p.id === activeId) ?? plans[plans.length - 1];
  const missed = tasks.filter((x) => !x.done && x.date < t);
  const dueRevisions = Object.values(progress).filter((p) => p.revision && p.revision.due <= date).length;
  const go = (d: ISODate) => router.replace(d === t ? "/planner" : `/planner?date=${d}`, { scroll: false });

  if (!hydrated) return <div className="h-96 animate-pulse rounded-lg bg-surface-2" />;

  const week = daysInRange(startOfWeek(date), addDays(startOfWeek(date), 6));
  const weekTasks = tasks.filter((x) => x.date >= week[0] && x.date <= week[6]);
  const weekPlanned = weekTasks.reduce((s, x) => s + x.estMin, 0);
  const weekDone = weekTasks.filter((x) => x.done).reduce((s, x) => s + (x.actualMin ?? x.estMin), 0);
  const dayTasks = tasks.filter((x) => x.date === date);
  const objectives = dayTasks.filter((x) => x.kind === "lesson").map((x) => x.title);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-8">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => go(addDays(date, -1))} aria-label="Previous day"><ChevronLeft className="h-4 w-4" /></Button>
          <h2 className="text-xl font-semibold tracking-tight">{date === t ? "Today · " : ""}{formatLong(date)}</h2>
          <Button size="sm" onClick={() => go(addDays(date, 1))} aria-label="Next day"><ChevronRight className="h-4 w-4" /></Button>
          {date !== t && <Button size="sm" variant="ghost" onClick={() => go(t)}>Back to today</Button>}
          <input type="date" value={date} onChange={(e) => e.target.value && go(e.target.value)} className="ml-auto rounded-md border border-border-strong bg-surface px-2 py-1 text-sm" aria-label="Jump to date" />
        </div>

        {missed.length > 0 && date === t && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-warn/40 bg-warn-soft px-4 py-3 text-sm">
            <span className="flex-1"><strong>{missed.length} unfinished task{missed.length > 1 ? "s" : ""}</strong> from earlier days.</span>
            <Button size="sm" onClick={() => {
              const r = rescheduleMissed(tasks, t, plan?.minutesPerDay ?? 60, plan?.daysOff ?? []);
              actions.setTasks(r.tasks);
            }}>Reschedule into upcoming days</Button>
          </div>
        )}

        {objectives.length > 0 && (
          <section>
            <SectionTitle>Learning objectives</SectionTitle>
            <ul className="list-disc space-y-1 pl-5 text-sm">{objectives.map((o) => <li key={o}>Understand and be able to explain: <strong>{o}</strong></li>)}</ul>
          </section>
        )}

        <section>
          <SectionTitle>Tasks</SectionTitle>
          <DayTasks date={date} emptyHint={plans.length === 0 ? <>Create a study plan to fill your calendar, or add tasks manually below.</> : "Free day — or add something below."} />
          {dueRevisions > 0 && (
            <p className="mt-3 text-sm">
              <Link href="/revision" className="text-accent underline">{dueRevisions} spaced-repetition review{dueRevisions > 1 ? "s" : ""} due</Link> by this day.
            </p>
          )}
        </section>

        <section>
          <SectionTitle>End-of-day reflection</SectionTitle>
          <textarea
            value={reflections[date] ?? ""}
            onChange={(e) => actions.setReflection(date, e.target.value)}
            rows={4}
            placeholder="What did you learn? What's still unclear? What will you do differently tomorrow?"
            aria-label="Reflection"
            className="w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm leading-relaxed"
          />
          <p className="mt-1 text-xs text-subtle">Saved automatically in this browser.</p>
        </section>
      </div>

      <aside className="space-y-6">
        <div className="rounded-lg border border-border bg-surface p-4">
          <SectionTitle>This week</SectionTitle>
          <div className="mb-2 flex justify-between text-sm"><span>{weekDone} of {weekPlanned} min</span><span className="text-muted">{weekTasks.filter((x) => x.done).length}/{weekTasks.length} tasks</span></div>
          <ProgressBar value={weekDone} max={Math.max(weekPlanned, 1)} label="Weekly progress" />
          <ol className="mt-4 grid grid-cols-7 gap-1 text-center">
            {week.map((d) => {
              const dt = tasks.filter((x) => x.date === d);
              const done = dt.length > 0 && dt.every((x) => x.done);
              return (
                <li key={d}>
                  <button onClick={() => go(d)} className={cn("w-full rounded-md border py-1.5 text-xs", d === date ? "border-fg" : "border-border", d === t && "font-semibold")} aria-label={`${formatLong(d)}: ${dt.length} tasks${done ? ", all done" : ""}`}>
                    <span className="block text-subtle">{formatWeekdayShort(d).slice(0, 2)}</span>
                    <span className="block">{dt.length ? (done ? "✓" : dt.filter((x) => x.done).length + "/" + dt.length) : "·"}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <SectionTitle action={<ButtonLink size="sm" href="/planner/new">New plan</ButtonLink>}>Study plans</SectionTitle>
          {plans.length === 0 ? (
            <EmptyState title="No plan yet" action={<ButtonLink href="/planner/new" variant="primary" size="sm">Create a plan</ButtonLink>}>Pick a goal, a target date and your daily time — the planner builds a realistic schedule.</EmptyState>
          ) : (
            <ul className="space-y-3">
              {plans.map((p) => {
                const pt = tasks.filter((x) => x.planId === p.id);
                const d = pt.filter((x) => x.done).length;
                return (
                  <li key={p.id} className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p.goal}</span>
                      {p.id === plan?.id && <span className="text-xs text-accent">active</span>}
                    </div>
                    <p className="text-xs text-muted">Target {formatShort(p.target)} · {p.minutesPerDay} min/day · {p.topics.length} topics</p>
                    <ProgressBar className="mt-1.5" value={d} max={Math.max(pt.length, 1)} label={`${p.goal} progress`} />
                    <div className="mt-1 flex gap-3 text-xs">
                      {p.id !== plan?.id && <button className="underline" onClick={() => actions.savePlan(p, pt.filter((x) => !x.done))}>Make active</button>}
                      <button className="text-danger underline" onClick={() => { if (confirm(`Delete plan “${p.goal}” and its unfinished tasks?`)) actions.deletePlan(p.id); }}>Delete</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <Link href="/calendar" className="block text-sm text-accent underline">Open the calendar →</Link>
      </aside>
    </div>
  );
}
