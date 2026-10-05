"use client";
/**
 * Shared building blocks for every visualization:
 * - <VizFrame>: titled frame with an honest label (scripted trace / interactive model / real run)
 * - useStepper + <StepControls>: previous / next / play / pause / reset with keyboard support
 * - usePrefersReducedMotion: honours the OS setting and the app's motion override
 * - <Panel>, <Chip>: consistent visual vocabulary
 */
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/components/ui/cn";

export type VizKind = "trace" | "model" | "real";

const KIND_TEXT: Record<VizKind, { label: string; title: string }> = {
  trace: { label: "Scripted trace", title: "A pre-computed, step-by-step trace of how the language specification says this program runs. It is not executing your code." },
  model: { label: "Interactive model", title: "A simplified simulation of the mechanism. Behaviour follows the real rules; sizes, timings and internals are simplified." },
  real: { label: "Real execution", title: "This actually runs in your browser." },
};

export function VizFrame({ title, kind, children, footer, description }: { title: string; kind: VizKind; children: ReactNode; footer?: ReactNode; description?: ReactNode }) {
  const k = KIND_TEXT[kind];
  return (
    <section className="not-prose my-6 overflow-hidden rounded-lg border border-border-strong bg-surface" aria-label={`${title} — ${k.label}`}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <h3 className="text-sm font-semibold text-fg">{title}</h3>
        <span title={k.title} className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", kind === "real" ? "border-ok/40 text-ok" : "border-border-strong text-muted")}>
          {k.label}
        </span>
      </header>
      {description && <div className="border-b border-border px-4 py-2 text-sm text-muted">{description}</div>}
      <div className="p-3 sm:p-4">{children}</div>
      {footer && <footer className="border-t border-border bg-surface-2 px-4 py-2.5 text-[13px] leading-relaxed text-muted">{footer}</footer>}
    </section>
  );
}

const subscribeRM = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
  mq.addEventListener("change", cb);
  return () => {
    mq.removeEventListener("change", cb);
    obs.disconnect();
  };
};
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeRM,
    () => {
      const m = document.documentElement.dataset.motion;
      if (m === "reduce") return true;
      if (m === "full") return false;
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    },
    () => false,
  );
}

export function useStepper(count: number, intervalMs = 1400) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const next = useCallback(() => setI((x) => Math.min(x + 1, count - 1)), [count]);
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), []);
  const reset = useCallback(() => {
    setPlaying(false);
    setI(0);
  }, []);
  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setI((x) => {
        if (x >= count - 1) {
          setPlaying(false);
          return x;
        }
        return x + 1;
      });
    }, intervalMs);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, count, intervalMs]);
  // a scenario switch can shrink `count`; clamp instead of syncing state in an effect
  const idx = Math.min(i, Math.max(0, count - 1));
  return { i: idx, setI, next, prev, reset, playing, setPlaying, count, atEnd: idx >= count - 1 };
}

export function StepControls({ s, label }: { s: ReturnType<typeof useStepper>; label?: string }) {
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); s.next(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); s.prev(); }
  };
  return (
    <div className="flex flex-wrap items-center gap-2" onKeyDown={onKey} role="group" aria-label="Step controls (arrow keys step)">
      <CtlButton onClick={s.reset} label="Reset"><RotateCcw className="h-4 w-4" /></CtlButton>
      <CtlButton onClick={s.prev} disabled={s.i === 0} label="Previous step"><ChevronLeft className="h-4 w-4" /></CtlButton>
      <CtlButton onClick={() => (s.atEnd ? (s.setI(0), s.setPlaying(true)) : s.setPlaying(!s.playing))} label={s.playing ? "Pause" : "Play"} primary>
        {s.playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </CtlButton>
      <CtlButton onClick={s.next} disabled={s.atEnd} label="Next step"><ChevronRight className="h-4 w-4" /></CtlButton>
      <span className="ml-1 font-mono text-xs text-muted" aria-live="polite">
        {label ?? "step"} {s.i + 1}/{s.count}
      </span>
      <input
        type="range"
        min={0}
        max={Math.max(0, s.count - 1)}
        value={s.i}
        onChange={(e) => s.setI(Number(e.target.value))}
        className="ml-auto w-28 accent-[var(--accent)] sm:w-40"
        aria-label="Scrub through steps"
      />
    </div>
  );
}

export function CtlButton({ onClick, disabled, label, children, primary }: { onClick: () => void; disabled?: boolean; label: string; children: ReactNode; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-md border px-2 text-sm disabled:opacity-40",
        primary ? "border-accent bg-accent text-accent-fg hover:opacity-90" : "border-border-strong bg-surface text-fg hover:bg-surface-2",
      )}
    >
      {children}
    </button>
  );
}

export function Panel({ title, children, className, hint }: { title: string; children: ReactNode; className?: string; hint?: string }) {
  return (
    <div className={cn("min-w-0 rounded-md border border-border bg-bg", className)}>
      <div className="flex items-baseline justify-between gap-2 border-b border-border px-2.5 py-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">{title}</span>
        {hint && <span className="hidden truncate text-[11px] text-subtle xl:inline">{hint}</span>}
      </div>
      <div className="p-2">{children}</div>
    </div>
  );
}

export function Chip({ children, tone = "neutral", className, active }: { children: ReactNode; tone?: "neutral" | "accent" | "ok" | "warn" | "danger" | "info"; className?: string; active?: boolean }) {
  const t = {
    neutral: "border-border-strong bg-surface text-fg",
    accent: "border-accent/50 bg-accent-soft text-fg",
    ok: "border-ok/40 bg-ok-soft text-fg",
    warn: "border-warn/40 bg-warn-soft text-fg",
    danger: "border-danger/40 bg-danger-soft text-fg",
    info: "border-info/40 bg-info-soft text-fg",
  }[tone];
  return <span className={cn("anim-in inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[12px]", t, active && "ring-2 ring-accent", className)}>{children}</span>;
}

export function Empty({ children = "empty" }: { children?: ReactNode }) {
  return <span className="text-xs italic text-subtle">{children}</span>;
}

/** Plain-language explanation of the current step; announced to screen readers. */
export function Narration({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 rounded-md border border-border bg-surface-2 px-3 py-2 text-[14px] leading-relaxed text-fg" aria-live="polite">
      {children}
    </div>
  );
}

/** Small toggle-button group for model parameters. */
export function Segmented<T extends string | number>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-xs">
      <span className="text-muted">{label}</span>
      <div className="inline-flex overflow-hidden rounded-md border border-border-strong" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={String(o.value)}
            role="radio"
            aria-checked={o.value === value}
            onClick={() => onChange(o.value)}
            className={cn("px-2 py-1 font-medium", o.value === value ? "bg-fg text-bg" : "bg-surface text-muted hover:text-fg")}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
