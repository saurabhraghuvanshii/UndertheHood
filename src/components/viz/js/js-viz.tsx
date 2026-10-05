"use client";
import { Fragment } from "react";
import { cn } from "@/components/ui/cn";
import { Chip, Empty, Narration, Panel, StepControls, VizFrame, useStepper } from "../kit";
import { TRACES } from "./traces";
import type { Env, Snapshot, Trace } from "./trace";

/** Minimal inline formatter for trace notes (**bold** and `code`). */
function Note({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) =>
        p.startsWith("**") ? <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>
          : p.startsWith("`") ? <code key={i} className="rounded bg-surface px-1 font-mono text-[0.9em]">{p.slice(1, -1)}</code>
          : <Fragment key={i}>{p}</Fragment>,
      )}
    </>
  );
}

function CodePane({ code, line, error }: { code: string; line: number | null; error?: string }) {
  const lines = code.split("\n");
  return (
    <div className="overflow-x-auto rounded-md border border-border bg-code py-2 font-mono text-[12.5px] leading-[1.65]">
      {lines.map((l, i) => {
        const active = line === i + 1;
        return (
          <div key={i} className={cn("flex min-w-max pr-3", active && (error ? "bg-danger-soft" : "bg-accent-soft"))} aria-current={active ? "step" : undefined}>
            <span className={cn("w-8 shrink-0 select-none pr-2 text-right", active ? "text-accent" : "text-subtle")}>{active ? "▶" : i + 1}</span>
            <span className="whitespace-pre text-fg">{l || " "}</span>
          </div>
        );
      })}
    </div>
  );
}

function EnvCard({ e, envs }: { e: Env; envs: Env[] }) {
  const outer = envs.find((x) => x.id === e.outer);
  return (
    <div className={cn("anim-in rounded border p-2", e.dead ? "border-dashed border-border opacity-50" : e.retained ? "border-warn/60 bg-warn-soft" : "border-border-strong bg-surface")}>
      <div className="mb-1 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="font-semibold text-fg">{e.label}</span>
        {e.retained && <span className="rounded bg-surface px-1 text-[10px] font-medium uppercase text-warn">retained by closure</span>}
        {e.dead && <span className="text-[10px] uppercase text-subtle">unreachable</span>}
        {outer && <span className="ml-auto text-[11px] text-muted">outer → {outer.label}</span>}
      </div>
      {e.bindings.length === 0 ? <Empty>no bindings</Empty> : (
        <dl className="space-y-0.5 font-mono text-[12px]">
          {e.bindings.map((b) => (
            <div key={b.name} className="flex gap-2">
              <dt className="text-muted">{b.name}</dt>
              <dd className={cn("min-w-0 truncate", b.state === "uninit" && "italic text-subtle", b.state === "changed" && "rounded bg-accent-soft px-1 font-semibold text-fg")}>
                {b.value}
                {b.state === "changed" && <span className="sr-only"> (just changed)</span>}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function Queue({ title, items, hint }: { title: string; items: string[]; hint: string }) {
  return (
    <Panel title={title} hint={hint}>
      {items.length === 0 ? <Empty /> : (
        <ol className="flex flex-wrap gap-1.5">
          {items.map((it, i) => <li key={i + it}><Chip tone={title.startsWith("Micro") ? "info" : title.startsWith("Web") ? "neutral" : "warn"}>{i === 0 && "▸ "}{it}</Chip></li>)}
        </ol>
      )}
    </Panel>
  );
}

function SnapshotPanels({ s, t }: { s: Snapshot; t: Trace }) {
  return (
    <div className="grid gap-2">
      {t.panels.includes("stack") && (
        <Panel title="Call stack" hint="top = running now">
          {s.stack.length === 0 ? <Empty>empty — the event loop may pick the next job</Empty> : (
            <ol className="flex flex-col-reverse gap-1">
              {s.stack.map((f, i) => (
                <li key={i + f.name} className={cn("anim-in rounded border px-2 py-1 font-mono text-[12px]", i === s.stack.length - 1 ? "border-accent bg-accent-soft font-semibold" : "border-border-strong bg-surface")}>
                  {f.name}
                  {f.thisValue && <span className="ml-2 font-normal text-muted">this = <span className="text-fg">{f.thisValue}</span></span>}
                </li>
              ))}
            </ol>
          )}
        </Panel>
      )}
      {t.panels.includes("envs") && (
        <Panel title="Lexical environments" hint="scope chain via outer →">
          <div className="grid gap-1.5 sm:grid-cols-2">
            {s.envs.length === 0 ? <Empty /> : s.envs.map((e) => <EnvCard key={e.id} e={e} envs={s.envs} />)}
          </div>
        </Panel>
      )}
      {t.panels.includes("heap") && (
        <Panel title="Heap" hint="objects & functions">
          {s.heap.length === 0 ? <Empty /> : (
            <div className="grid gap-1.5 sm:grid-cols-2">
              {s.heap.map((h) => (
                <div key={h.id} className={cn("anim-in rounded border p-2", h.unreachable ? "border-dashed border-danger/50 opacity-60" : "border-border-strong bg-surface")}>
                  <div className="mb-1 text-xs font-semibold text-fg">
                    {h.label}
                    {h.unreachable && <span className="ml-2 text-[10px] font-medium uppercase text-danger">unreachable → GC may free</span>}
                  </div>
                  <dl className="space-y-0.5 font-mono text-[12px]">
                    {h.props.map((p) => (
                      <div key={p.name} className="flex gap-2">
                        <dt className="text-muted">{p.name}</dt>
                        <dd className={cn("truncate", p.state === "changed" && "rounded bg-accent-soft px-1 font-semibold")}>{p.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}
      {t.panels.includes("queues") && (
        <div className="grid gap-2 sm:grid-cols-3">
          <Queue title="Web APIs / host" items={s.webapis} hint="timers, I/O" />
          <Queue title="Microtask queue" items={s.microtasks} hint="drained fully" />
          <Queue title="Task queue" items={s.tasks} hint="one per loop turn" />
        </div>
      )}
      {t.panels.includes("console") && (
        <Panel title="Console">
          {s.console.length === 0 ? <Empty>no output yet</Empty> : (
            <pre className="font-mono text-[12.5px] leading-relaxed">
              {s.console.map((c, i) => (
                <div key={i} className={cn(c.startsWith("Uncaught") ? "text-danger" : "text-fg", i === s.console.length - 1 && "font-semibold")}>{c}</div>
              ))}
            </pre>
          )}
        </Panel>
      )}
    </div>
  );
}

export function TraceViewer({ trace }: { trace: Trace }) {
  const s = useStepper(trace.steps.length, 1800);
  const snap = trace.steps[s.i];
  return (
    <VizFrame
      title={trace.title}
      kind="trace"
      footer={<><strong className="text-fg">Takeaway.</strong> {trace.takeaway} This is a hand-authored trace of the language semantics, not a recording of an engine; engines may optimise internally but must produce the same observable behaviour.</>}
    >
      <StepControls s={s} />
      {snap.phase && (
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Phase: <span className="text-fg">{snap.phase}</span>
        </p>
      )}
      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <CodePane code={trace.code} line={snap.line} error={snap.error} />
        <SnapshotPanels s={snap} t={trace} />
      </div>
      <Narration>
        {snap.error && <span className="mb-1 block font-mono text-sm text-danger">{snap.error}</span>}
        <Note text={snap.note} />
      </Narration>
    </VizFrame>
  );
}

export const ClosureViz = () => <TraceViewer trace={TRACES.closure} />;
export const EventLoopViz = () => <TraceViewer trace={TRACES.eventLoop} />;
export const HoistingViz = () => <TraceViewer trace={TRACES.hoisting} />;
export const ThisViz = () => <TraceViewer trace={TRACES.thisBinding} />;
export const ReferencesViz = () => <TraceViewer trace={TRACES.references} />;
export const AsyncAwaitViz = () => <TraceViewer trace={TRACES.asyncAwait} />;
