import type { SourceRef } from "@/content/types";
import { Badge } from "@/components/ui";

const KIND: Record<SourceRef["kind"], { label: string; tone: "neutral" | "accent" | "warn" | "info" }> = {
  "original-note": { label: "Your notes", tone: "accent" },
  docs: { label: "Docs", tone: "info" },
  external: { label: "External", tone: "neutral" },
  inaccessible: { label: "Not accessible", tone: "warn" },
};

export function Sources({ sources }: { sources: SourceRef[] }) {
  if (!sources.length) return null;
  return (
    <ul className="space-y-2 text-sm">
      {sources.map((s, i) => (
        <li key={i} className="flex flex-wrap items-baseline gap-2">
          <Badge tone={KIND[s.kind].tone}>{KIND[s.kind].label}</Badge>
          {s.url && s.kind !== "inaccessible" ? (
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-fg underline decoration-border-strong underline-offset-2 hover:decoration-fg">{s.label}</a>
          ) : s.url ? (
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-muted underline decoration-dotted">{s.label}</a>
          ) : (
            <span className="text-fg">{s.label}</span>
          )}
          {s.note && <span className="w-full pl-0 text-xs text-muted sm:w-auto">{s.note}</span>}
        </li>
      ))}
    </ul>
  );
}
