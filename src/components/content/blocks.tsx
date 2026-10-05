import { AlertTriangle, BookOpen, Cpu, Info, Lightbulb } from "lucide-react";
import type { Block } from "@/content/types";
import { Inline } from "./inline";
import { CodeBlock } from "./code-block";
import { VizEmbed } from "@/components/viz/embed";
import { cn } from "@/components/ui/cn";

const CALLOUT = {
  note: { icon: Info, label: "Note", cls: "border-info/30 bg-info-soft" },
  tip: { icon: Lightbulb, label: "Tip", cls: "border-ok/30 bg-ok-soft" },
  warning: { icon: AlertTriangle, label: "Warning", cls: "border-warn/30 bg-warn-soft" },
  misconception: { icon: AlertTriangle, label: "Common misconception", cls: "border-danger/30 bg-danger-soft" },
  "spec-vs-impl": { icon: Cpu, label: "Spec vs implementation", cls: "border-border-strong bg-surface-2" },
} as const;

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-ink space-y-4 text-[15.5px] leading-[1.75] text-fg/90">
      {blocks.map((b, i) => (
        <BlockView key={i} b={b} />
      ))}
    </div>
  );
}

function BlockView({ b }: { b: Block }) {
  switch (b.type) {
    case "p":
      return <p><Inline text={b.text} /></p>;
    case "list": {
      const L = b.ordered ? "ol" : "ul";
      return (
        <L className={cn("space-y-1.5 pl-5", b.ordered ? "list-decimal" : "list-disc marker:text-subtle")}>
          {b.items.map((it, i) => <li key={i} className="pl-1"><Inline text={it} /></li>)}
        </L>
      );
    }
    case "code":
      return <CodeBlock code={b.code} lang={b.lang} caption={b.caption} output={b.output} runnable={b.runnable} />;
    case "callout": {
      const c = CALLOUT[b.tone] ?? CALLOUT.note;
      const Icon = c.icon;
      return (
        <aside className={cn("rounded-lg border px-4 py-3", c.cls)}>
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-fg">
            <Icon className="h-4 w-4" aria-hidden />
            {b.title ?? c.label}
          </div>
          <div className="text-[15px]"><Inline text={b.text} /></div>
        </aside>
      );
    }
    case "steps":
      return (
        <ol className="relative space-y-0 border-l border-border pl-0">
          {b.steps.map((s, i) => (
            <li key={i} className="relative pb-4 pl-7 last:pb-0">
              <span aria-hidden className="absolute -left-3 top-0.5 grid h-6 w-6 place-items-center rounded-full border border-border-strong bg-surface font-mono text-[11px] text-muted">
                {i + 1}
              </span>
              <div className="font-medium text-fg"><Inline text={s.title} /></div>
              <div className="text-[15px] text-muted"><Inline text={s.detail} /></div>
            </li>
          ))}
        </ol>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead className="bg-surface-2 text-left">
              <tr>{b.head.map((h, i) => <th key={i} scope="col" className="border-b border-border px-3 py-2 font-semibold text-fg"><Inline text={h} /></th>)}</tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i} className="border-b border-border last:border-0 align-top">
                  {r.map((c, j) => <td key={j} className={cn("px-3 py-2", j === 0 && "font-medium text-fg")}><Inline text={c} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "flow":
      return (
        <figure className="my-2">
          <ol className="flex flex-wrap items-center gap-y-2 text-sm" aria-label={b.caption ?? "Flow"}>
            {b.nodes.map((n, i) => (
              <li key={i} className="flex items-center">
                <span className="rounded-md border border-border-strong bg-surface px-2.5 py-1 font-medium text-fg"><Inline text={n} /></span>
                {i < b.nodes.length - 1 && <span aria-hidden className="px-1.5 text-subtle">→</span>}
              </li>
            ))}
          </ol>
          {b.caption && <figcaption className="mt-2 text-sm text-muted"><Inline text={b.caption} /></figcaption>}
        </figure>
      );
    case "compare":
      return (
        <div className={cn("grid gap-3", b.items.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
          {b.items.map((it, i) => (
            <div key={i} className="rounded-lg border border-border bg-surface p-4">
              <div className="mb-2 font-semibold text-fg"><Inline text={it.title} /></div>
              <ul className="list-disc space-y-1 pl-4 text-[14.5px] marker:text-subtle">
                {it.points.map((p, j) => <li key={j}><Inline text={p} /></li>)}
              </ul>
            </div>
          ))}
        </div>
      );
    case "viz":
      return <VizEmbed id={b.id} caption={b.caption} />;
    default:
      return (
        <p className="text-sm text-muted">
          <BookOpen className="mr-1 inline h-4 w-4" />
          Unsupported block
        </p>
      );
  }
}
