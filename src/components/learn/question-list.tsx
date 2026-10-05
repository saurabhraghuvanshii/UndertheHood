"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Frequency, Level } from "@/content/types";
import { useHydrated, useLearner } from "@/lib/store";
import { effectiveStatus, STATUS_LABEL, STATUSES, type ProgressStatus } from "@/lib/progress";
import { today } from "@/lib/dates";
import { StatusPill } from "./progress-ui";
import { FREQ_LABEL, LEVEL_LABEL, LevelBadge, EmptyState } from "@/components/ui";

export interface QRow { id: string; number: number; title: string; level: Level; frequency: Frequency; tags: string[]; href: string; itemKey: string; hasQuiz?: boolean }

export function QuestionList({ rows, showFrequency = true }: { rows: QRow[]; showFrequency?: boolean }) {
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<Level | "">("");
  const [status, setStatus] = useState<ProgressStatus | "">("");
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const hydrated = useHydrated();
  const progress = useLearner((s) => s.progress);
  const bookmarks = useLearner((s) => s.bookmarks);
  const t = today();
  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (q && !`${r.number} ${r.title} ${r.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase())) return false;
        if (level && r.level !== level) return false;
        if (status && effectiveStatus(progress[r.itemKey], t, { hasQuiz: !!r.hasQuiz }) !== status) return false;
        if (onlyBookmarked && !bookmarks[r.itemKey]) return false;
        return true;
      }),
    [rows, q, level, status, onlyBookmarked, progress, bookmarks, t],
  );
  const sel = "rounded-md border border-border-strong bg-surface px-2 py-1.5 text-sm";
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2" role="search">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter questions…" aria-label="Filter questions" className={`${sel} min-w-0 flex-1 sm:max-w-xs`} />
        <select value={level} onChange={(e) => setLevel(e.target.value as Level | "")} className={sel} aria-label="Difficulty">
          <option value="">All levels</option>
          {Object.entries(LEVEL_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as ProgressStatus | "")} className={sel} aria-label="Status">
          <option value="">Any status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <label className="inline-flex items-center gap-1.5 text-sm text-muted">
          <input type="checkbox" checked={onlyBookmarked} onChange={(e) => setOnlyBookmarked(e.target.checked)} className="accent-[var(--accent)]" /> Bookmarked
        </label>
        <span className="ml-auto text-xs text-subtle" aria-live="polite">{filtered.length} of {rows.length}</span>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="No questions match these filters." />
      ) : (
        <ol className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
          {filtered.map((r) => (
            <li key={r.id}>
              <Link href={r.href} className="flex items-start gap-3 px-4 py-3 hover:bg-surface-2">
                <span className="w-8 shrink-0 pt-0.5 text-right font-mono text-xs text-subtle">{r.number}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-fg">{r.title}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-2">
                    <LevelBadge level={r.level} />
                    {showFrequency && <span className="text-xs text-subtle">{FREQ_LABEL[r.frequency]}</span>}
                  </span>
                </span>
                <span className="shrink-0 pt-0.5">{hydrated && <StatusPill itemKey={r.itemKey} hasQuiz={!!r.hasQuiz} />}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
