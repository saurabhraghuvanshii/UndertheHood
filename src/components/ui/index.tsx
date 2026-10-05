import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";
import type { Frequency, Level, AuthoringStatus } from "@/content/types";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const btn = (variant: Variant, size: Size) =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap",
    size === "sm" ? "h-8 px-3 text-sm" : "h-10 px-4 text-sm",
    variant === "primary" && "bg-accent text-accent-fg hover:opacity-90",
    variant === "secondary" && "border border-border-strong bg-surface text-fg hover:bg-surface-2",
    variant === "ghost" && "text-muted hover:bg-surface-2 hover:text-fg",
    variant === "danger" && "border border-danger/40 text-danger hover:bg-danger-soft",
  );

export function Button({ variant = "secondary", size = "md", className, ...p }: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button type="button" className={cn(btn(variant, size), className)} {...p} />;
}

export function ButtonLink({ variant = "secondary", size = "md", className, ...p }: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={cn(btn(variant, size), className)} {...p} />;
}

type Tone = "neutral" | "accent" | "ok" | "warn" | "danger" | "info";
const toneCls: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted border-border",
  accent: "bg-accent-soft text-accent border-transparent",
  ok: "bg-ok-soft text-ok border-transparent",
  warn: "bg-warn-soft text-warn border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
  info: "bg-info-soft text-info border-transparent",
};

export function Badge({ tone = "neutral", className, children, title }: { tone?: Tone; className?: string; children: ReactNode; title?: string }) {
  return (
    <span title={title} className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium leading-5 whitespace-nowrap", toneCls[tone], className)}>
      {children}
    </span>
  );
}

export function Card({ className, children, as: As = "div", ...p }: { className?: string; children: ReactNode; as?: "div" | "section" | "article" | "li" } & Record<string, unknown>) {
  return (
    <As className={cn("rounded-lg border border-border bg-surface", className)} {...p}>
      {children}
    </As>
  );
}

export function ProgressBar({ value, max = 100, label, className }: { value: number; max?: number; label: string; className?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-3", className)} role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

export const LEVEL_LABEL: Record<Level, string> = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced", expert: "Expert" };
export const FREQ_LABEL: Record<Frequency, string> = { "very-high": "Asked very often", high: "Asked often", medium: "Sometimes asked", low: "Rarely asked" };

export function LevelBadge({ level }: { level: Level }) {
  const bars = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 }[level];
  return (
    <Badge title={`Difficulty: ${LEVEL_LABEL[level]}`}>
      <span aria-hidden className="font-mono tracking-tighter">{"▮".repeat(bars)}{"▯".repeat(4 - bars)}</span>
      {LEVEL_LABEL[level]}
    </Badge>
  );
}

export function FrequencyBadge({ frequency }: { frequency: Frequency }) {
  const tone: Tone = frequency === "very-high" ? "warn" : frequency === "high" ? "info" : "neutral";
  return <Badge tone={tone} title="Interview frequency">{FREQ_LABEL[frequency]}</Badge>;
}

export function AuthoringBadge({ status }: { status: AuthoringStatus }) {
  if (status === "authored") return null;
  return (
    <Badge tone="neutral" title="Structure and sources exist; the full lesson hasn't been written yet.">
      Outline
    </Badge>
  );
}

export function PageHeader({ eyebrow, title, description, actions, children }: { eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; actions?: ReactNode; children?: ReactNode }) {
  return (
    <header className="mb-8 border-b border-border pb-6">
      {eyebrow && <div className="mb-2 text-sm text-muted">{eyebrow}</div>}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">{title}</h1>
          {description && <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </header>
  );
}

export function SectionTitle({ children, action, id }: { children: ReactNode; action?: ReactNode; id?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 id={id} className="text-sm font-semibold uppercase tracking-wider text-muted">{children}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border-strong px-5 py-8 text-center">
      <p className="font-medium text-fg">{title}</p>
      {children && <div className="mx-auto mt-1 max-w-md text-sm text-muted">{children}</div>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded border border-border-strong bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-muted">{children}</kbd>;
}
