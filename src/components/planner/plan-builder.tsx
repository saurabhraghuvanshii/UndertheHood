"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Level } from "@/content/types";
import type { LessonRow } from "@/content/summaries";
import { generatePlan, type PlanTopic } from "@/lib/planner";
import { actions, getState, useHydrated, uid } from "@/lib/store";
import { addDays, formatLong, formatShort, today } from "@/lib/dates";
import { effectiveStatus, isComplete, lessonKey } from "@/lib/progress";
import { Badge, Button, LEVEL_LABEL } from "@/components/ui";
import { cn } from "@/components/ui/cn";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function PlanBuilder({ rows, tracks, initialTrack }: { rows: LessonRow[]; tracks: { slug: string; title: string }[]; initialTrack?: string }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const [goal, setGoal] = useState(initialTrack ? `Learn ${tracks.find((t) => t.slug === initialTrack)?.title ?? initialTrack}` : "Interview-ready in JavaScript");
  const [start, setStart] = useState(today());
  const [target, setTarget] = useState(addDays(today(), 42));
  const [minutes, setMinutes] = useState(60);
  const [daysOff, setDaysOff] = useState<number[]>([0]);
  const [level, setLevel] = useState<Level>("beginner");
  const [selected, setSelected] = useState<string[]>(() => (initialTrack ? rows.filter((r) => r.track === initialTrack).map((r) => r.ref) : rows.filter((r) => r.track === "javascript").slice(0, 12).map((r) => r.ref)));
  const [filterTrack, setFilterTrack] = useState(initialTrack ?? "javascript");
  const [skipDone, setSkipDone] = useState(true);
  const [onlyAuthored, setOnlyAuthored] = useState(false);
  const [includeQuestions, setIncludeQuestions] = useState(true);

  const byRef = useMemo(() => new Map(rows.map((r) => [r.ref, r])), [rows]);
  const completed = useMemo(() => {
    if (!hydrated) return new Set<string>();
    const p = getState().progress;
    return new Set(rows.filter((r) => isComplete(effectiveStatus(p[lessonKey(r.ref)], today(), { hasQuiz: r.hasQuiz }))).map((r) => r.ref));
  }, [hydrated, rows]);

  const lookup = (ref: string): PlanTopic | undefined => {
    const r = byRef.get(ref);
    return r && { ref: r.ref, title: r.title, minutes: r.minutes, level: r.level, prerequisites: r.prerequisites, questions: r.questions };
  };
  const topics = selected.filter((r) => !(skipDone && completed.has(r)) && !(onlyAuthored && byRef.get(r)?.status !== "authored"));
  // cheap (a few hundred lessons at most), so recomputed on every render
  const result = generatePlan({ planId: "preview", topics, start, target, minutesPerDay: minutes, daysOff, learnerLevel: level, completed: skipDone ? completed : undefined, includeQuestions }, lookup);

  const visible = rows.filter((r) => r.track === filterTrack);
  const toggle = (ref: string) => setSelected((s) => (s.includes(ref) ? s.filter((x) => x !== ref) : [...s, ref]));
  const allOn = visible.every((r) => selected.includes(r.ref));

  const save = () => {
    const id = uid().slice(0, 8);
    const tasks = generatePlan({ planId: id, topics, start, target, minutesPerDay: minutes, daysOff, learnerLevel: level, completed: skipDone ? completed : undefined, includeQuestions }, lookup).tasks;
    actions.savePlan({ id, goal, createdAt: today(), start, target, minutesPerDay: minutes, daysOff, learnerLevel: level, topics }, tasks);
    router.push("/planner");
  };

  const field = "rounded-md border border-border-strong bg-surface px-2.5 py-1.5 text-sm";
  const firstWeek = result.tasks.filter((t) => t.date < addDays(start, 7));

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0 space-y-8">
        <fieldset className="grid min-w-0 gap-4 sm:grid-cols-2">
          <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">1 · Goal and schedule</legend>
          <label className="text-sm sm:col-span-2">Goal<input value={goal} onChange={(e) => setGoal(e.target.value)} className={`${field} mt-1 w-full`} /></label>
          <label className="text-sm">Start<input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={`${field} mt-1 w-full`} /></label>
          <label className="text-sm">Target completion date<input type="date" value={target} min={start} onChange={(e) => setTarget(e.target.value)} className={`${field} mt-1 w-full`} /></label>
          <label className="text-sm">Study time per day: <strong>{minutes} min</strong>
            <input type="range" min={15} max={240} step={15} value={minutes} onChange={(e) => setMinutes(+e.target.value)} className="mt-2 w-full accent-[var(--accent)]" />
          </label>
          <label className="text-sm">Your current level
            <select value={level} onChange={(e) => setLevel(e.target.value as Level)} className={`${field} mt-1 w-full`}>
              {Object.entries(LEVEL_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <div className="text-sm sm:col-span-2">
            <span>Days off</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {WEEKDAYS.map((d, i) => {
                const off = daysOff.includes(i);
                return (
                  <button key={d} type="button" aria-pressed={off} onClick={() => setDaysOff((x) => (off ? x.filter((y) => y !== i) : [...x, i]))} className={cn("rounded-md border px-2.5 py-1 text-xs", off ? "border-fg bg-fg text-bg" : "border-border-strong")}>
                    {d}{off && " · off"}
                  </button>
                );
              })}
            </div>
          </div>
        </fieldset>

        <fieldset className="min-w-0">
          <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">2 · Topics ({selected.length} selected)</legend>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <select value={filterTrack} onChange={(e) => setFilterTrack(e.target.value)} className={field} aria-label="Path">
              {tracks.map((t) => <option key={t.slug} value={t.slug}>{t.title}</option>)}
            </select>
            <Button size="sm" onClick={() => setSelected((s) => (allOn ? s.filter((r) => !visible.some((v) => v.ref === r)) : [...new Set([...s, ...visible.map((v) => v.ref)])]))}>
              {allOn ? "Deselect" : "Select"} whole path
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected([])}>Clear all</Button>
          </div>
          <ul className="max-h-[420px] divide-y divide-border overflow-y-auto rounded-lg border border-border bg-surface">
            {visible.map((r) => (
              <li key={r.ref}>
                <label className="flex cursor-pointer items-start gap-3 px-3 py-2 hover:bg-surface-2">
                  <input type="checkbox" checked={selected.includes(r.ref)} onChange={() => toggle(r.ref)} className="mt-1 accent-[var(--accent)]" />
                  <span className="min-w-0 flex-1">
                    <span className="text-sm font-medium">{r.title}</span>
                    <span className="block text-xs text-muted">{r.module} · {r.minutes} min · {LEVEL_LABEL[r.level]}{r.status === "outline" && " · outline"}{completed.has(r.ref) && " · already learned"}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={skipDone} onChange={(e) => setSkipDone(e.target.checked)} className="accent-[var(--accent)]" />Skip lessons I’ve already learned</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={onlyAuthored} onChange={(e) => setOnlyAuthored(e.target.checked)} className="accent-[var(--accent)]" />Only fully written lessons</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={includeQuestions} onChange={(e) => setIncludeQuestions(e.target.checked)} className="accent-[var(--accent)]" />Add interview questions</label>
          </div>
        </fieldset>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start" aria-label="Plan preview">
        <div className="rounded-lg border border-border-strong bg-surface p-4">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">3 · Proposed plan</p>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-muted">Topics</dt><dd className="font-semibold">{result.orderedTopics.length}{result.addedPrerequisites.length > 0 && <span className="font-normal text-muted"> (+{result.addedPrerequisites.length} prereqs)</span>}</dd></div>
            <div><dt className="text-muted">Study days</dt><dd className="font-semibold">{result.studyDays}</dd></div>
            <div><dt className="text-muted">Total time</dt><dd className="font-semibold">{Math.round(result.totalMinutes / 60)} h</dd></div>
            <div><dt className="text-muted">Finishes</dt><dd className={cn("font-semibold", result.fitsTarget ? "text-ok" : "text-danger")}>{result.tasks.length ? formatShort(result.finishDate) : "—"} {result.tasks.length > 0 && (result.fitsTarget ? "✓" : "✗")}</dd></div>
          </dl>
          {result.warnings.length > 0 && (
            <ul className="mt-3 space-y-1.5 text-sm">
              {result.warnings.map((w) => <li key={w} className={cn("rounded-md px-2.5 py-1.5", w.startsWith("At ") ? "bg-danger-soft text-danger" : "bg-warn-soft text-warn")}>{w}</li>)}
            </ul>
          )}
          <p className="mt-3 text-xs leading-relaxed text-subtle">Time = lesson estimate × difficulty for your level. Each lesson gets a practice task, up to two interview questions, and revisions after 1, 3 and 7 days. A weekly review is added every ~6 study days. Prerequisites you haven’t learned are pulled in automatically, in order.</p>
          <Button variant="primary" className="mt-4 w-full" onClick={save} disabled={!result.tasks.length}>Save plan to my calendar</Button>
        </div>
        {firstWeek.length > 0 && (
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">First week</p>
            <ol className="space-y-2 text-sm">
              {[...new Set(firstWeek.map((t) => t.date))].map((d) => (
                <li key={d}>
                  <span className="text-xs font-medium text-muted">{formatLong(d)}</span>
                  <ul className="mt-0.5 space-y-0.5">
                    {firstWeek.filter((t) => t.date === d).map((t) => (
                      <li key={t.id} className="flex gap-2"><Badge>{t.kind}</Badge><span className="min-w-0 flex-1 truncate">{t.title}</span><span className="text-xs text-subtle">{t.estMin}m</span></li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        )}
      </aside>
    </div>
  );
}
