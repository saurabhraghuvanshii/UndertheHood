"use client";
import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { Chip, CtlButton, Empty, Narration, Panel, Segmented, VizFrame, usePrefersReducedMotion } from "../kit";
import { DURATIONS, SOURCE, TOTAL_JOBS, activeLines, newPool, poolTick, type PoolState, type WorkerState } from "./worker-pool-model";

const W: Record<WorkerState, { t: string; tone: "ok" | "neutral" | "info"; g: string }> = {
  busy: { t: "busy", tone: "ok", g: "▶" },
  waiting: { t: "idle — waiting on jobs", tone: "info", g: "…" },
  exited: { t: "exited", tone: "neutral", g: "■" },
};

export default function WorkerPoolViz() {
  const [n, setN] = useState(2);
  const [buf, setBuf] = useState(2);
  const [st, setSt] = useState<{ s: PoolState; mark: number }>(() => ({ s: newPool(2, 2), mark: 0 }));
  const [auto, setAuto] = useState(false);
  const reduced = usePrefersReducedMotion();
  const s = st.s;

  const running = auto && !s.mainDone;
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSt((x) => (x.s.mainDone ? x : { s: poolTick(x.s), mark: x.s.seq })), reduced ? 2000 : 900);
    return () => clearInterval(t);
  }, [running, reduced]);

  const reset = (workers = n, b = buf) => {
    setAuto(false);
    setSt({ s: newPool(workers, b), mark: 0 });
  };
  const active = activeLines(s);
  const recent = s.log.filter((e) => e.n > st.mark);
  const sent = s.nextJob - 1;

  return (
    <VizFrame
      title="Worker pool and backpressure"
      kind="model"
      description="A producer feeds 12 jobs into a buffered channel; N workers range over it and send results back to main. Change the knobs and compare elapsed ticks and how long the producer spends blocked."
      footer={
        <>
          Simplified: the producer creates at most one job per tick, job durations are fixed ({DURATIONS.join(", ")} ticks), and main collects results instantly. A bounded buffer is what gives you
          backpressure: when workers fall behind, the producer blocks instead of queueing unbounded work in memory.
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          label="Workers"
          value={n}
          options={[1, 2, 3, 4].map((v) => ({ value: v, label: String(v) }))}
          onChange={(v) => {
            setN(v);
            reset(v, buf);
          }}
        />
        <Segmented
          label="jobs buffer"
          value={buf}
          options={[0, 1, 2, 3, 4].map((v) => ({ value: v, label: String(v) }))}
          onChange={(v) => {
            setBuf(v);
            reset(n, v);
          }}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <CtlButton onClick={() => setSt({ s: poolTick(s), mark: s.seq })} disabled={s.mainDone} label="Tick" primary>
          <StepForward className="h-4 w-4" /> <span className="text-xs">Tick</span>
        </CtlButton>
        <CtlButton onClick={() => setAuto(!running)} disabled={s.mainDone} label={running ? "Pause auto-run" : "Auto-run"}>
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span className="text-xs">{running ? "Pause" : "Auto-run"}</span>
        </CtlButton>
        <CtlButton onClick={() => reset()} label="Reset">
          <RotateCcw className="h-4 w-4" />
        </CtlButton>
        <span className="font-mono text-xs text-muted">
          tick {s.tick} · completed {s.results.length}/{TOTAL_JOBS} · producer blocked {s.producerBlockedTicks} tick{s.producerBlockedTicks === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="grid content-start gap-3">
          <Panel title="Producer" hint={`${sent}/${TOTAL_JOBS} sent`}>
            <Chip tone={s.producer === "blocked" ? "warn" : s.producer === "done" ? "neutral" : "ok"}>
              {s.producer === "blocked" ? `⏸ blocked on jobs <- ${s.nextJob}` : s.producer === "done" ? "■ done · jobs closed" : s.producer === "closing" ? "▶ about to close(jobs)" : "▶ sending"}
            </Chip>
          </Panel>
          <Panel title="jobs channel" hint={s.jobsClosed ? "closed" : `depth ${s.jobs.length}/${s.bufferCap}`}>
            {s.bufferCap === 0 ? (
              <p className="text-[12.5px] text-muted">Unbuffered: each send waits for a free worker.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: s.bufferCap }, (_, k) => (
                  <div key={k} className={cn("flex h-9 w-9 items-center justify-center rounded border font-mono text-[13px]", s.jobs[k] !== undefined ? "border-info/50 bg-info-soft text-fg" : "border-dashed border-border-strong text-subtle")}>
                    {s.jobs[k] ?? "·"}
                  </div>
                ))}
              </div>
            )}
            {s.jobsClosed && <div className="mt-1.5"><Chip tone="neutral">✕ closed</Chip></div>}
          </Panel>
          <Panel title="Workers" hint={`wg = ${s.wg}`}>
            <ul className="space-y-1.5 text-[12.5px]">
              {s.workers.map((w) => (
                <li key={w.id} className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="font-mono">worker {w.id}</span>
                  <Chip tone={W[w.state].tone}>
                    {W[w.state].g} {w.state === "busy" ? `job ${w.job} · ${w.remaining} left` : W[w.state].t}
                  </Chip>
                  <span className="w-full text-[11px] text-subtle">{w.completed} done</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="main: results" hint={s.resultsClosed ? "results closed" : `${s.results.length} collected`}>
            <div className="flex flex-wrap gap-1">{s.results.length ? s.results.map((r) => <Chip key={r} tone="ok">{r}</Chip>) : <Empty>none yet</Empty>}</div>
          </Panel>
        </div>
        <Panel title="Code" hint="▶ = active now">
          <pre className="overflow-x-auto rounded bg-code p-1.5 font-mono text-[11.5px] leading-snug">
            {SOURCE.map((l, k) => (
              <div key={k} className={cn("px-1 whitespace-pre", active.includes(k) ? "bg-accent-soft text-fg" : "text-muted")}>
                <span aria-hidden className="inline-block w-3 text-accent">{active.includes(k) ? "▶" : ""}</span>
                {l.replace("B)", `${s.bufferCap})`).replace("w <= N", `w <= ${s.workers.length}`)}
              </div>
            ))}
          </pre>
        </Panel>
      </div>

      <Narration>
        {recent.length ? (
          <ul className="space-y-1">
            {recent.map((e) => (
              <li key={e.n}>{e.text}</li>
            ))}
          </ul>
        ) : s.tick > 0 ? (
          <>Tick {s.tick}: workers keep working; nothing changed hands.</>
        ) : (
          <>Press Tick to start. With 1 worker and a small buffer, watch the producer block when the buffer fills.</>
        )}
      </Narration>
    </VizFrame>
  );
}
