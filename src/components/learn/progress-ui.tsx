"use client";
import { useEffect, useRef, useState } from "react";
import { Bookmark, BookmarkCheck, Check, Repeat } from "lucide-react";
import { actions, useHydrated, useLearner } from "@/lib/store";
import { effectiveStatus, suggestStatus, STATUS_GLYPH, STATUS_LABEL, STATUSES, type ItemKey, type ProgressStatus } from "@/lib/progress";
import { formatShort, today } from "@/lib/dates";
import { cn } from "@/components/ui/cn";
import { Button } from "@/components/ui";

const STATUS_TONE: Record<ProgressStatus, string> = {
  "not-started": "text-subtle",
  "in-progress": "text-info",
  learned: "text-accent",
  practised: "text-accent",
  "needs-revision": "text-warn",
  "interview-ready": "text-ok",
  mastered: "text-ok",
};

export function StatusPill({ itemKey, hasQuiz = false, compact }: { itemKey: ItemKey; hasQuiz?: boolean; compact?: boolean }) {
  const hydrated = useHydrated();
  const p = useLearner((s) => s.progress[itemKey]);
  const status = hydrated ? effectiveStatus(p, today(), { hasQuiz }) : "not-started";
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium", STATUS_TONE[status], !hydrated && "opacity-0")} title={STATUS_LABEL[status]}>
      <span aria-hidden className="font-mono">{STATUS_GLYPH[status]}</span>
      <span className={compact ? "sr-only" : undefined}>{STATUS_LABEL[status]}</span>
    </span>
  );
}

export function BookmarkButton({ itemKey, label = "Bookmark" }: { itemKey: ItemKey; label?: string }) {
  const on = useLearner((s) => !!s.bookmarks[itemKey]);
  const hydrated = useHydrated();
  const Icon = on ? BookmarkCheck : Bookmark;
  return (
    <Button size="sm" variant={on ? "primary" : "secondary"} onClick={() => actions.toggleBookmark(itemKey)} aria-pressed={on} disabled={!hydrated}>
      <Icon className="h-4 w-4" aria-hidden />
      {on ? "Bookmarked" : label}
    </Button>
  );
}

/**
 * Counts active study time: only while the tab is visible and the learner has
 * interacted in the last 2 minutes. Flushed to the store once per minute.
 */
export function StudyTimer({ itemKey, href, title }: { itemKey: ItemKey; href: string; title: string }) {
  const lastInput = useRef(0);
  const acc = useRef(0);
  useEffect(() => {
    actions.visit(itemKey, href, title);
    lastInput.current = Date.now();
    const bump = () => (lastInput.current = Date.now());
    const evs = ["scroll", "keydown", "pointerdown", "pointermove"] as const;
    evs.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    const id = setInterval(() => {
      if (document.visibilityState === "visible" && Date.now() - lastInput.current < 120_000) acc.current += 15;
      if (acc.current >= 60) {
        actions.logMinutes(itemKey, Math.floor(acc.current / 60));
        acc.current %= 60;
      }
    }, 15_000);
    return () => {
      clearInterval(id);
      evs.forEach((e) => window.removeEventListener(e, bump));
    };
  }, [itemKey, href, title]);
  return null;
}

/** The full progress panel shown on lessons and questions. */
export function ProgressPanel({ itemKey, hasQuiz, hasPractice = true, kindLabel = "lesson" }: { itemKey: ItemKey; hasQuiz: boolean; hasPractice?: boolean; kindLabel?: string }) {
  const hydrated = useHydrated();
  const p = useLearner((s) => s.progress[itemKey]);
  const { status: suggested, checks } = suggestStatus(p, today(), { hasQuiz });
  const [showWhy, setShowWhy] = useState(false);

  if (!hydrated) return <div className="h-48 animate-pulse rounded-lg border border-border bg-surface-2" />;

  return (
    <div className="space-y-4 rounded-lg border border-border bg-surface p-4 text-sm">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">Your progress</span>
          <StatusPill itemKey={itemKey} hasQuiz={hasQuiz} />
        </div>
        {p?.override && (
          <p className="mt-1 text-xs text-muted">
            Set by you (suggested: {STATUS_LABEL[suggested]}).{" "}
            <button className="underline" onClick={() => actions.setOverride(itemKey, undefined)}>Use suggestion</button>
          </p>
        )}
      </div>

      <div className="space-y-2">
        <CheckButton on={!!p?.understoodAt} onClick={() => actions.setUnderstood(itemKey, !p?.understoodAt)}>
          I understood the explanation
        </CheckButton>
        {hasPractice && (
          <CheckButton on={!!p?.practiceDoneAt} onClick={() => actions.setPracticeDone(itemKey, !p?.practiceDoneAt)}>
            I completed a practice exercise
          </CheckButton>
        )}
        {hasQuiz && (
          <p className="text-xs text-muted">
            Quiz: {p?.quiz ? `best ${p.quiz.best}% · last ${p.quiz.last}% · ${p.quiz.attempts} attempt${p.quiz.attempts > 1 ? "s" : ""}` : "not attempted yet"}
          </p>
        )}
      </div>

      <fieldset>
        <legend className="mb-1.5 text-xs text-muted">How confident would you be explaining this in an interview?</legend>
        <div className="flex gap-1">
          {([1, 2, 3, 4, 5] as const).map((c) => (
            <button
              key={c}
              onClick={() => actions.setConfidence(itemKey, p?.confidence === c ? undefined : c)}
              aria-pressed={p?.confidence === c}
              className={cn("h-8 flex-1 rounded-md border font-mono text-xs", p?.confidence === c ? "border-accent bg-accent text-accent-fg" : "border-border-strong hover:bg-surface-2")}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-subtle"><span>shaky</span><span>could teach it</span></div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        {p?.revision ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <Repeat className="h-3.5 w-3.5" aria-hidden />
            Next revision {p.revision.due <= today() ? <strong className="text-warn">due now</strong> : formatShort(p.revision.due)}
            <button className="underline" onClick={() => actions.removeFromRevision(itemKey)}>remove</button>
          </span>
        ) : (
          <Button size="sm" onClick={() => actions.addToRevision(itemKey)}>
            <Repeat className="h-3.5 w-3.5" aria-hidden /> Add to revision queue
          </Button>
        )}
      </div>

      <div className="border-t border-border pt-3">
        <button className="text-xs font-medium text-muted underline" onClick={() => setShowWhy((v) => !v)} aria-expanded={showWhy}>
          {showWhy ? "Hide" : "How is"} status decided?
        </button>
        {showWhy && (
          <div className="anim-in mt-2 space-y-2">
            <ul className="space-y-1">
              {checks.map((c) => (
                <li key={c.label} className={cn("flex items-start gap-2 text-xs", c.met ? "text-fg" : "text-muted")}>
                  <span aria-hidden className="font-mono">{c.met ? "✓" : "·"}</span>
                  {c.label}
                  <span className="sr-only">{c.met ? "(met)" : "(not yet)"}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] leading-relaxed text-subtle">
              Learned once → understood. Practised → understood + quiz ≥ 70% (if any) + practice. Interview-ready → practised + confidence ≥ 4 + one good spaced review. Mastered → three good reviews with an interval ≥ 21 days. An overdue review shows “Needs revision”. Opening a page never counts.
            </p>
            <label className="flex items-center gap-2 text-xs">
              <span className="text-muted">Override:</span>
              <select
                value={p?.override ?? ""}
                onChange={(e) => actions.setOverride(itemKey, (e.target.value || undefined) as ProgressStatus | undefined)}
                className="rounded-md border border-border-strong bg-surface px-2 py-1"
              >
                <option value="">Use suggestion</option>
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </label>
          </div>
        )}
      </div>
      <p className="text-[11px] text-subtle">
        {p?.minutes ? `${p.minutes} min studied on this ${kindLabel}` : `Active time on this ${kindLabel} is tracked while the tab is visible.`}
        {p?.lastStudied && ` · last studied ${formatShort(p.lastStudied)}`}
      </p>
    </div>
  );
}

function CheckButton({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={cn("flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left transition-colors", on ? "border-accent/50 bg-accent-soft text-fg" : "border-border-strong hover:bg-surface-2")}
    >
      <span className={cn("grid h-4 w-4 shrink-0 place-items-center rounded border", on ? "anim-pop border-accent bg-accent text-accent-fg" : "border-border-strong")}>
        {on && <Check className="h-3 w-3" aria-hidden />}
      </span>
      {children}
    </button>
  );
}
