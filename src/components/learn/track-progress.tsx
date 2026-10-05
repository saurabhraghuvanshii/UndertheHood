"use client";
import { useHydrated, useLearner } from "@/lib/store";
import { effectiveStatus, isComplete, lessonKey } from "@/lib/progress";
import { today } from "@/lib/dates";
import { ProgressBar } from "@/components/ui";

export function useCompletion(items: { ref: string; hasQuiz: boolean }[]) {
  const hydrated = useHydrated();
  const progress = useLearner((s) => s.progress);
  if (!hydrated) return { done: 0, total: items.length, hydrated };
  const t = today();
  const done = items.filter((i) => isComplete(effectiveStatus(progress[lessonKey(i.ref)], t, { hasQuiz: i.hasQuiz }))).length;
  return { done, total: items.length, hydrated };
}

export function TrackProgress({ items, label }: { items: { ref: string; hasQuiz: boolean }[]; label: string }) {
  const { done, total, hydrated } = useCompletion(items);
  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-baseline justify-between text-xs text-muted">
        <span>{hydrated ? `${done} of ${total} learned` : `${total} lessons`}</span>
        {hydrated && total > 0 && <span className="font-mono">{Math.round((done / total) * 100)}%</span>}
      </div>
      <ProgressBar value={done} max={total} label={`${label} progress`} />
    </div>
  );
}
