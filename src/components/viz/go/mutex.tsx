"use client";
import { useState } from "react";
import { RotateCcw, Shuffle } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { Chip, CtlButton, Narration, Panel, Segmented, VizFrame } from "../kit";
import { EXPECTED, ITERATIONS, MGS, SOURCE, allDone, canStep, currentInstr, isDone, iterationOf, lineOf, newMutexState, randomInterleaving, step, type MG, type MutexState } from "./mutex-model";

export default function MutexViz() {
  const [useMutex, setUseMutex] = useState(false);
  const [s, setS] = useState<MutexState>(() => newMutexState(false));
  const reset = (m = useMutex) => setS(newMutexState(m));
  const last = s.log[s.log.length - 1];
  const done = allDone(s);
  const btn = "inline-flex h-8 items-center gap-1 rounded-md border border-border-strong bg-surface px-2.5 text-[12.5px] text-fg hover:bg-surface-2 disabled:opacity-40";

  return (
    <VizFrame
      title="Race condition vs mutex"
      kind="model"
      description={
        <>
          Two goroutines each run <code className="font-mono">counter++</code> {ITERATIONS} times. That one line is not atomic: it is a load, an add and a store. You choose which goroutine runs next — try to
          lose an update.
        </>
      }
      footer={
        <>
          Real hardware adds more ways to go wrong (caches, compiler reordering), which is why Go&apos;s memory model calls any unsynchronized concurrent write a data race. Run{" "}
          <code className="font-mono">go test -race</code> and the race detector flags the unprotected version even when the result happens to come out right. For a single counter,{" "}
          <code className="font-mono">sync/atomic</code> (<code className="font-mono">atomic.Int64.Add</code>) does the read-modify-write as one indivisible step without a lock. The mutex model is simplified: a woken
          waiter retries Lock; real <code className="font-mono">sync.Mutex</code> also has a starvation mode that hands the lock directly to waiters after 1ms.
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          label="Use sync.Mutex"
          value={useMutex ? "on" : "off"}
          options={[
            { value: "off", label: "Off" },
            { value: "on", label: "On" },
          ]}
          onChange={(v) => {
            const m = v === "on";
            setUseMutex(m);
            reset(m);
          }}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Choose the interleaving">
        {MGS.map((g) => (
          <button key={g} type="button" className={btn} disabled={!canStep(s, g)} onClick={() => setS(step(s, g))}>
            Run {g} step{isDone(s, g) ? " (done)" : s.gs[g].blocked ? " (blocked)" : ""}
          </button>
        ))}
        <button type="button" className={btn} disabled={done} onClick={() => setS(randomInterleaving(s))}>
          <Shuffle className="h-3.5 w-3.5" /> Random interleaving
        </button>
        <CtlButton onClick={() => reset()} label="Reset">
          <RotateCcw className="h-4 w-4" /> <span className="text-xs">Reset</span>
        </CtlButton>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <GPanel s={s} g="G1" />
        <Panel title="Shared memory" className="sm:w-44">
          <div className="text-center">
            <div className="text-[11px] text-muted">counter</div>
            <div key={s.counter} className="anim-pop font-mono text-3xl font-semibold text-fg">
              {s.counter}
            </div>
            <div className="mt-1 text-[11px] text-subtle">expected {EXPECTED} at the end</div>
          </div>
          {useMutex && (
            <div className="mt-2 border-t border-border pt-2 text-[12px]">
              <div className="text-muted">mu</div>
              <div className="mt-0.5">{s.owner ? <Chip tone="warn">● locked by {s.owner}</Chip> : <Chip tone="ok">unlocked</Chip>}</div>
              <div className="mt-1 text-muted">
                waiters: <span className="font-mono text-fg">{s.waiters.length ? s.waiters.join(", ") : "none"}</span>
              </div>
            </div>
          )}
        </Panel>
        <GPanel s={s} g="G2" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
        {s.lostUpdates.length > 0 ? (
          <Chip tone="danger">✕ {s.lostUpdates.length} lost update{s.lostUpdates.length === 1 ? "" : "s"}</Chip>
        ) : (
          <Chip tone="neutral">no lost updates yet</Chip>
        )}
        {done && (
          <Chip tone={s.counter === EXPECTED ? "ok" : "danger"}>
            {s.counter === EXPECTED ? "✓" : "✕"} final {s.counter} vs expected {EXPECTED}
          </Chip>
        )}
        {s.lostUpdates.map((l, k) => (
          <span key={k} className="text-[12px] text-muted">
            {l.by} overwrote {l.victim}&apos;s store ({l.lost} → {l.wrote}).
          </span>
        ))}
      </div>

      <Narration>
        {last ? last.text : useMutex ? "Lock, then load-add-store, then Unlock. Try running G2 while G1 holds the lock." : "Hint: run G1 LOAD, then G2 LOAD, then let both STORE. Both read the same value, so one increment is lost."}
      </Narration>
    </VizFrame>
  );
}

function GPanel({ s, g }: { s: MutexState; g: MG }) {
  const st = s.gs[g];
  const ins = currentInstr(s, g);
  const line = isDone(s, g) ? -1 : lineOf(s.useMutex, ins);
  const status = isDone(s, g) ? { t: "done", tone: "neutral" as const } : st.blocked ? { t: "⏸ blocked on Lock", tone: "warn" as const } : s.owner === g ? { t: "holds mu", tone: "info" as const } : { t: "runnable", tone: "ok" as const };
  return (
    <Panel title={g} hint={isDone(s, g) ? "finished" : `iteration ${iterationOf(s, g)}/${ITERATIONS}`}>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-[12px]">
        <Chip tone={status.tone}>{status.t}</Chip>
        <span className="text-muted">
          register r: <span className="font-mono text-fg">{st.reg ?? "—"}</span>
        </span>
        <span className="text-muted">
          next: <span className="font-mono text-fg">{ins ?? "—"}</span>
        </span>
      </div>
      <pre className="overflow-x-auto rounded bg-code p-1.5 font-mono text-[11.5px] leading-snug">
        {SOURCE(s.useMutex).map((l, k) => (
          <div key={k} className={cn("px-1", k === line ? (st.blocked ? "bg-warn-soft text-fg" : "bg-accent-soft text-fg") : "text-muted")}>
            <span aria-hidden className="inline-block w-3 text-accent">{k === line ? "▶" : ""}</span>
            {l}
          </div>
        ))}
      </pre>
    </Panel>
  );
}
