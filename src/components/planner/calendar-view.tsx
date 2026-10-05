"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { actions, useHydrated, useLearner } from "@/lib/store";
import { addDays, addMonths, daysInRange, formatLong, formatMonth, formatShort, formatWeekdayShort, monthGrid, startOfWeek, today, type ISODate } from "@/lib/dates";
import { Button, Segmented } from "./ui-bits";
import { DayTasks, KIND_LABEL } from "./day-tasks";
import { cn } from "@/components/ui/cn";
import type { PlanTask } from "@/lib/planner";

type View = "month" | "week" | "day";

function useDrop(date: ISODate) {
  const [over, setOver] = useState(false);
  return {
    over,
    props: {
      onDragOver: (e: React.DragEvent) => {
        if (e.dataTransfer.types.includes("text/task-id")) {
          e.preventDefault();
          setOver(true);
        }
      },
      onDragLeave: () => setOver(false),
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData("text/task-id");
        if (id) actions.updateTask(id, { date });
      },
    },
  };
}

function Chip({ t }: { t: PlanTask }) {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/task-id", t.id)}
      className={cn("cursor-grab truncate rounded px-1.5 py-0.5 text-[11px] leading-4", t.done ? "bg-surface-3 text-subtle line-through" : t.kind === "revision" ? "bg-warn-soft text-fg" : t.kind === "lesson" ? "bg-accent-soft text-fg" : "bg-surface-2 text-fg")}
      title={`${KIND_LABEL[t.kind]}: ${t.title} (${t.estMin} min) — drag to move`}
    >
      {t.done ? "✓ " : ""}{t.title}
    </div>
  );
}

function MonthCell({ d, month, tasks, deadlines, onOpen }: { d: ISODate; month: string; tasks: PlanTask[]; deadlines: string[]; onOpen: (d: ISODate) => void }) {
  const { over, props } = useDrop(d);
  const t = today();
  const mins = tasks.reduce((s, x) => s + x.estMin, 0);
  return (
    <div {...props} className={cn("min-h-24 min-w-0 border-b border-r border-border p-1", d.slice(0, 7) !== month && "bg-surface-2/50", over && "bg-accent-soft")}>
      <button onClick={() => onOpen(d)} className={cn("mb-1 flex w-full items-center justify-between rounded px-1 text-xs hover:bg-surface-3", d === t ? "font-bold text-accent" : d.slice(0, 7) !== month ? "text-subtle" : "text-muted")} aria-label={`${formatLong(d)}: ${tasks.length} tasks${deadlines.length ? ", deadline" : ""}`}>
        <span>{Number(d.slice(8))}</span>
        {mins > 0 && <span className="font-mono text-[10px] text-subtle">{mins}m</span>}
      </button>
      {deadlines.map((g) => <div key={g} className="mb-0.5 flex items-center gap-1 truncate rounded bg-danger-soft px-1.5 text-[11px] text-danger"><Flag className="h-3 w-3 shrink-0" aria-hidden />Target: {g}</div>)}
      <div className="space-y-0.5">
        {tasks.slice(0, 3).map((x) => <Chip key={x.id} t={x} />)}
        {tasks.length > 3 && <button onClick={() => onOpen(d)} className="px-1 text-[11px] text-muted hover:underline">+{tasks.length - 3} more</button>}
      </div>
    </div>
  );
}

function WeekColumn({ d, tasks, deadlines, onOpen }: { d: ISODate; tasks: PlanTask[]; deadlines: string[]; onOpen: (d: ISODate) => void }) {
  const { over, props } = useDrop(d);
  return (
    <div {...props} className={cn("min-h-64 min-w-0 rounded-md border border-border bg-surface p-2", over && "bg-accent-soft", d === today() && "border-accent")}>
      <button onClick={() => onOpen(d)} className="mb-2 block w-full text-left text-xs font-medium text-muted hover:text-fg">{formatWeekdayShort(d)} {formatShort(d)}</button>
      {deadlines.map((g) => <div key={g} className="mb-1 truncate rounded bg-danger-soft px-1.5 text-[11px] text-danger">⚑ {g}</div>)}
      <div className="space-y-1">{tasks.map((x) => <Chip key={x.id} t={x} />)}</div>
    </div>
  );
}

export function CalendarView() {
  const hydrated = useHydrated();
  const tasks = useLearner((s) => s.tasks);
  const plans = useLearner((s) => s.plans);
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState<ISODate>(() => today());
  if (!hydrated) return <div className="h-[600px] animate-pulse rounded-lg bg-surface-2" />;

  const tasksOn = (d: ISODate) => tasks.filter((t) => t.date === d);
  const deadlinesOn = (d: ISODate) => plans.filter((p) => p.target === d).map((p) => p.goal);
  const open = (d: ISODate) => {
    setDate(d);
    setView("day");
  };
  const step = (n: number) => setDate(view === "month" ? addMonths(date, n) : view === "week" ? addDays(date, 7 * n) : addDays(date, n));
  const heading = view === "month" ? formatMonth(date) : view === "week" ? `Week of ${formatShort(startOfWeek(date))}` : formatLong(date);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => step(-1)} aria-label="Previous"><ChevronLeft className="h-4 w-4" /></Button>
        <Button size="sm" onClick={() => step(1)} aria-label="Next"><ChevronRight className="h-4 w-4" /></Button>
        <Button size="sm" variant="ghost" onClick={() => setDate(today())}>Today</Button>
        <h2 className="text-lg font-semibold" aria-live="polite">{heading}</h2>
        <div className="ml-auto"><Segmented label="View" value={view} onChange={setView} options={[{ value: "month", label: "Month" }, { value: "week", label: "Week" }, { value: "day", label: "Day" }]} /></div>
      </div>

      {view === "month" && (
        <div className="overflow-x-auto">
          <div className="min-w-[640px] overflow-hidden rounded-lg border-l border-t border-border bg-surface">
            <div className="grid grid-cols-7 border-b border-border bg-surface-2 text-center text-xs font-medium text-muted">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="border-r border-border py-1.5">{d}</div>)}
            </div>
            <div className="grid grid-cols-7">
              {monthGrid(date).map((d) => <MonthCell key={d} d={d} month={date.slice(0, 7)} tasks={tasksOn(d)} deadlines={deadlinesOn(d)} onOpen={open} />)}
            </div>
          </div>
        </div>
      )}
      {view === "week" && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
          {daysInRange(startOfWeek(date), addDays(startOfWeek(date), 6)).map((d) => <WeekColumn key={d} d={d} tasks={tasksOn(d)} deadlines={deadlinesOn(d)} onOpen={open} />)}
        </div>
      )}
      {view === "day" && (
        <div className="max-w-2xl">
          {deadlinesOn(date).map((g) => <p key={g} className="mb-3 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">⚑ Target date for “{g}”</p>)}
          <DayTasks date={date} />
        </div>
      )}
      <p className="mt-4 text-xs text-subtle">Drag tasks between days to reschedule, or use the calendar icon on a task in day view (keyboard friendly). Lessons are tinted, revisions are amber, completed tasks are struck through.</p>
    </div>
  );
}
