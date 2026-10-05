"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { LessonRow } from "@/content/summaries";
import type { ContentKind, Frequency, Level } from "@/content/types";
import { useHydrated, useLearner } from "@/lib/store";
import { effectiveStatus, lessonKey, STATUS_LABEL, STATUSES, type ProgressStatus } from "@/lib/progress";
import { today } from "@/lib/dates";
import { AuthoringBadge, EmptyState, FREQ_LABEL, LEVEL_LABEL, LevelBadge } from "@/components/ui";
import { StatusPill } from "./progress-ui";
import { Inline } from "@/components/content/inline";

const TIME = { "": "Any length", short: "≤ 15 min", medium: "16–30 min", long: "31–60 min", xl: "> 60 min" } as const;
const KINDS: ContentKind[] = ["theory", "visualization", "coding", "quiz", "system-design"];

export function Explore({ rows, tracks }: { rows: LessonRow[]; tracks: { slug: string; title: string }[] }) {
  const [q, setQ] = useState("");
  const [track, setTrack] = useState("");
  const [level, setLevel] = useState<Level | "">("");
  const [freq, setFreq] = useState<Frequency | "">("");
  const [time, setTime] = useState<keyof typeof TIME>("");
  const [kind, setKind] = useState<ContentKind | "">("");
  const [status, setStatus] = useState<ProgressStatus | "">("");
  const [authored, setAuthored] = useState(false);
  const [sort, setSort] = useState<"curriculum" | "frequency" | "short">("curriculum");
  const hydrated = useHydrated();
  const progress = useLearner((s) => s.progress);

  const filtered = useMemo(() => {
    const t = today();
    const ql = q.toLowerCase();
    const fr: Frequency[] = ["very-high", "high", "medium", "low"];
    const out = rows.filter((r) => {
      if (ql && !`${r.title} ${r.summary} ${r.module}`.toLowerCase().includes(ql)) return false;
      if (track && r.track !== track) return false;
      if (level && r.level !== level) return false;
      if (freq && r.frequency !== freq) return false;
      if (kind && !r.kinds.includes(kind)) return false;
      if (authored && r.status !== "authored") return false;
      if (time === "short" && r.minutes > 15) return false;
      if (time === "medium" && (r.minutes <= 15 || r.minutes > 30)) return false;
      if (time === "long" && (r.minutes <= 30 || r.minutes > 60)) return false;
      if (time === "xl" && r.minutes <= 60) return false;
      if (status && effectiveStatus(progress[lessonKey(r.ref)], t, { hasQuiz: r.hasQuiz }) !== status) return false;
      return true;
    });
    if (sort === "frequency") out.sort((a, b) => fr.indexOf(a.frequency) - fr.indexOf(b.frequency) || a.order - b.order);
    if (sort === "short") out.sort((a, b) => a.minutes - b.minutes);
    return out;
  }, [rows, q, track, level, freq, kind, authored, time, status, progress, sort]);

  const sel = "rounded-md border border-border-strong bg-surface px-2 py-1.5 text-sm";
  const reset = () => { setQ(""); setTrack(""); setLevel(""); setFreq(""); setTime(""); setKind(""); setStatus(""); setAuthored(false); };
  return (
    <div>
      <div className="mb-5 space-y-2 rounded-lg border border-border bg-surface p-3" role="search">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter topics…" aria-label="Filter topics" className={`${sel} w-full`} />
        <div className="flex flex-wrap gap-2">
          <select value={track} onChange={(e) => setTrack(e.target.value)} className={sel} aria-label="Subject"><option value="">All subjects</option>{tracks.map((t) => <option key={t.slug} value={t.slug}>{t.title}</option>)}</select>
          <select value={level} onChange={(e) => setLevel(e.target.value as Level | "")} className={sel} aria-label="Difficulty"><option value="">All levels</option>{Object.entries(LEVEL_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <select value={freq} onChange={(e) => setFreq(e.target.value as Frequency | "")} className={sel} aria-label="Interview frequency"><option value="">Any frequency</option>{Object.entries(FREQ_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <select value={time} onChange={(e) => setTime(e.target.value as keyof typeof TIME)} className={sel} aria-label="Estimated time">{Object.entries(TIME).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <select value={kind} onChange={(e) => setKind(e.target.value as ContentKind | "")} className={sel} aria-label="Type"><option value="">Any type</option>{KINDS.map((k) => <option key={k} value={k}>{k}</option>)}</select>
          <select value={status} onChange={(e) => setStatus(e.target.value as ProgressStatus | "")} className={sel} aria-label="Completion status"><option value="">Any status</option>{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select>
          <label className="inline-flex items-center gap-1.5 text-sm text-muted"><input type="checkbox" checked={authored} onChange={(e) => setAuthored(e.target.checked)} className="accent-[var(--accent)]" />Fully written only</label>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={`${sel} ml-auto`} aria-label="Sort"><option value="curriculum">Curriculum order</option><option value="frequency">Most asked first</option><option value="short">Shortest first</option></select>
        </div>
      </div>
      <p className="mb-3 text-sm text-muted" aria-live="polite">{filtered.length} of {rows.length} topics {filtered.length !== rows.length && <button onClick={reset} className="ml-2 underline">reset filters</button>}</p>
      {filtered.length === 0 ? <EmptyState title="Nothing matches these filters." /> : (
        <ul className="grid gap-3 md:grid-cols-2">
          {filtered.slice(0, 200).map((r) => (
            <li key={r.ref}>
              <Link href={`/paths/${r.ref}`} className="flex h-full flex-col rounded-lg border border-border bg-surface p-4 hover:border-border-strong">
                <span className="text-xs text-subtle">{r.trackTitle} · {r.module}</span>
                <span className="mt-0.5 flex flex-wrap items-center gap-2 font-semibold">{r.title}<AuthoringBadge status={r.status} /></span>
                <span className="mt-1 line-clamp-2 flex-1 text-sm text-muted"><Inline text={r.summary} /></span>
                <span className="mt-3 flex flex-wrap items-center gap-2 text-xs text-subtle">
                  <LevelBadge level={r.level} /> {r.minutes} min · {FREQ_LABEL[r.frequency]}
                  <span className="ml-auto">{hydrated && <StatusPill itemKey={lessonKey(r.ref)} hasQuiz={r.hasQuiz} />}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {filtered.length > 200 && <p className="mt-4 text-sm text-muted">Showing the first 200 — narrow the filters to see more.</p>}
    </div>
  );
}
