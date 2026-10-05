"use client";
import { useHydrated } from "@/lib/store";
import { today } from "@/lib/dates";
import { PlannerView } from "./planner-view";

/** "Today" depends on the learner's time zone, so it is resolved in the browser. */
export function TodayDate({ date }: { date?: string }) {
  const hydrated = useHydrated();
  if (!hydrated) return <div className="h-96 animate-pulse rounded-lg bg-surface-2" />;
  return <PlannerView date={date ?? today()} />;
}
