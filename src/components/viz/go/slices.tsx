"use client";
import { useMemo, useState } from "react";
import { cn } from "@/components/ui/cn";
import { Chip, Empty, Narration, Panel, Segmented, StepControls, VizFrame, useStepper } from "../kit";
import { SCENARIOS, reachable, runScenario, type BackingArray, type ScenarioFrame, type SliceState } from "./slices-model";

const MAX_CELLS = 16;
const SHOWN_WHEN_TRUNCATED = 10;
const CELL = "2.25rem";

export default function SlicesViz() {
  const [scId, setScId] = useState(SCENARIOS[0].id);
  const sc = SCENARIOS.find((s) => s.id === scId)!;
  const frames = useMemo(() => runScenario(sc), [sc]);
  const s = useStepper(frames.length, 2200);
  const i = Math.min(s.i, frames.length - 1);
  const f = frames[i];

  return (
    <VizFrame
      title="Slice headers, backing arrays and append"
      kind="model"
      description={<>A slice is a small header — pointer, length, capacity — that points into a backing array. {sc.intro}</>}
      footer={
        <>
          Capacities use Go&apos;s growth rule from <code className="font-mono">runtime/slice.go</code> (Go 1.20+; the smoother 1.25× transition after 256 elements dates from Go 1.18) for <code className="font-mono">[]int</code> on a 64-bit
          platform. The requested capacity is then rounded up to a malloc size class, so real capacities often differ from &ldquo;just double&rdquo; — and they depend on the element size, so a{" "}
          <code className="font-mono">[]byte</code> or <code className="font-mono">[]struct{"{…}"}</code> grows differently. The exact numbers are an implementation detail, not a language guarantee.
        </>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Segmented
          label="Scenario"
          value={scId}
          options={SCENARIOS.map((x) => ({ value: x.id, label: x.label }))}
          onChange={(v) => {
            setScId(v);
            s.reset();
          }}
        />
      </div>
      <StepControls s={s} />

      <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Panel title="Go source" hint="▶ = this step">
          <ol className="space-y-0.5 font-mono text-[12.5px]">
            {sc.steps.map((st, k) => (
              <li
                key={k}
                aria-current={k === i ? "step" : undefined}
                className={cn("flex gap-1.5 rounded px-1 py-0.5 break-all", k === i ? "bg-accent-soft text-fg" : k < i ? "text-fg" : "text-subtle")}
              >
                <span aria-hidden className="w-3 shrink-0 text-accent">{k === i ? "▶" : ""}</span>
                <span>{st.code}</span>
              </li>
            ))}
          </ol>
        </Panel>
        <Panel title="Slice headers (on the stack)">
          <Headers state={f.state} />
        </Panel>
      </div>

      <Panel title="Backing arrays (on the heap)" className="mt-3" hint="solid = within len · dashed = spare cap">
        <Heap frame={f} />
      </Panel>

      <Narration>
        <span className="font-mono text-[13px] text-muted">{f.code}</span>
        <br />
        {f.note}
      </Narration>
    </VizFrame>
  );
}

function Headers({ state }: { state: SliceState }) {
  if (state.order.length === 0) return <Empty>no variables yet</Empty>;
  return (
    <div className="flex flex-wrap gap-2">
      {state.order.map((name) => {
        const h = state.vars[name];
        return (
          <div key={name} className="anim-in min-w-0 rounded border border-border-strong bg-surface text-[12px]">
            <div className="border-b border-border px-2 py-0.5 font-mono font-semibold text-fg">{name}</div>
            <dl className="grid grid-cols-3 divide-x divide-border font-mono">
              <div className="px-2 py-1">
                <dt className="text-[10px] uppercase tracking-wide text-subtle">ptr</dt>
                <dd className="text-fg">{h.arr ? `→ ${h.arr}[${h.off}]` : "nil"}</dd>
              </div>
              <div className="px-2 py-1">
                <dt className="text-[10px] uppercase tracking-wide text-subtle">len</dt>
                <dd className="text-fg">{h.len}</dd>
              </div>
              <div className="px-2 py-1">
                <dt className="text-[10px] uppercase tracking-wide text-subtle">cap</dt>
                <dd className="text-fg">{h.cap.toLocaleString()}</dd>
              </div>
            </dl>
          </div>
        );
      })}
    </div>
  );
}

function Heap({ frame }: { frame: ScenarioFrame }) {
  const { state } = frame;
  const live = reachable(state);
  if (state.arrays.length === 0) return <Empty>nothing allocated — a nil slice has no backing array</Empty>;
  return (
    <div className="space-y-3">
      {state.arrays.map((a) => (
        <ArrayRow key={a.id} a={a} state={state} live={live.has(a.id)} justFreed={frame.freed.includes(a.id)} written={frame.written?.arr === a.id ? frame.written.idx : []} isNew={frame.grew?.to === a.id} />
      ))}
    </div>
  );
}

function ArrayRow({ a, state, live, justFreed, written, isNew }: { a: BackingArray; state: SliceState; live: boolean; justFreed: boolean; written: number[]; isNew: boolean }) {
  const truncated = a.cap > MAX_CELLS;
  const shown = truncated ? SHOWN_WHEN_TRUNCATED : a.cap;
  const refs = state.order.filter((n) => state.vars[n].arr === a.id && state.vars[n].cap > 0).map((n) => ({ name: n, h: state.vars[n] }));
  const cols = shown + (truncated ? 1 : 0);
  const gridStyle = { gridTemplateColumns: `repeat(${shown}, ${CELL})${truncated ? " 5.5rem" : ""}` };

  return (
    <div className={cn("min-w-0", !live && "opacity-55")}>
      <div className="mb-1 flex flex-wrap items-center gap-2 text-[12px]">
        <span className="font-mono font-semibold text-fg">array {a.id}</span>
        <span className="font-mono text-muted">
          cap {a.cap.toLocaleString()} · {(a.cap * 8).toLocaleString()} B
        </span>
        {isNew && <Chip tone="info">new allocation</Chip>}
        {live ? (
          <Chip tone="ok">live</Chip>
        ) : (
          <Chip tone="warn">{justFreed ? "just became garbage" : "garbage"} — no slice points here</Chip>
        )}
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="grid w-max gap-y-1" style={gridStyle}>
          {Array.from({ length: shown }, (_, k) => {
            const inLen = refs.some(({ h }) => k >= h.off && k < h.off + h.len);
            const inCap = refs.some(({ h }) => k >= h.off && k < h.off + h.cap);
            const w = written.includes(k);
            return (
              <div key={k} className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-9 w-[2.1rem] items-center justify-center rounded-sm border font-mono text-[13px]",
                    inLen ? "border-accent/60 bg-accent-soft text-fg" : inCap ? "border-dashed border-border-strong bg-surface text-subtle" : "border-border bg-surface-2 text-subtle",
                    w && "anim-pop ring-2 ring-warn",
                  )}
                  title={`${a.id}[${k}] = ${a.cells[k]}${w ? " (written this step)" : ""}`}
                >
                  {a.cells[k]}
                </div>
                <span className="font-mono text-[10px] text-subtle">{w ? "✎" : k}</span>
              </div>
            );
          })}
          {truncated && (
            <div className="flex h-9 items-center px-1 font-mono text-[11px] text-subtle">… +{(a.cap - shown).toLocaleString()}</div>
          )}
          {refs.map(({ name, h }) => {
            const start = Math.min(h.off, shown);
            if (start >= shown) {
              return (
                <div key={name} className="font-mono text-[11px] text-muted" style={{ gridColumn: `1 / span ${cols}` }}>
                  {name} → index {h.off.toLocaleString()} (off-screen)
                </div>
              );
            }
            const lenVis = Math.max(0, Math.min(h.off + h.len, shown) - start);
            const capVis = Math.max(1, Math.min(h.off + h.cap, shown) - start);
            return (
              <div key={name} className="min-w-0" style={{ gridColumn: `${start + 1} / span ${capVis}` }}>
                <div className="flex h-1.5">
                  {lenVis > 0 && <div className="border-t-2 border-l-2 border-accent" style={{ flex: lenVis }} />}
                  {capVis - lenVis > 0 && <div className={cn("border-t-2 border-dashed border-muted", lenVis === 0 && "border-l-2")} style={{ flex: capVis - lenVis }} />}
                </div>
                <div className="whitespace-nowrap font-mono text-[11px] text-fg">
                  ↑ {name} <span className="text-muted">len {h.len} · cap {h.cap.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
