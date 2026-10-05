"use client";
import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { Chip, CtlButton, Empty, Narration, Panel, Segmented, VizFrame, usePrefersReducedMotion } from "../kit";
import {
  LOCAL_QUEUE_CAP,
  blockChannel,
  blockSyscall,
  counts,
  newScheduler,
  spawn,
  spawnMany,
  tick,
  wakeWaiting,
  type SchedState,
} from "./scheduler-model";

const gLabel = (id: number) => (id === 1 ? "G1·main" : `G${id}`);

export default function SchedulerViz() {
  const [procs, setProcs] = useState(2);
  const [st, setSt] = useState<{ s: SchedState; mark: number }>(() => ({ s: newScheduler(2), mark: 0 }));
  const s = st.s;
  const act = (f: (x: SchedState) => SchedState) => setSt((x) => ({ s: f(x.s), mark: x.s.seq }));
  const [target, setTarget] = useState(0);
  const [auto, setAuto] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setSt((x) => ({ s: tick(x.s), mark: x.s.seq })), reduced ? 2200 : 1100);
    return () => clearInterval(t);
  }, [auto, reduced]);

  const reset = (n = procs) => {
    setAuto(false);
    setTarget(0);
    setSt({ s: newScheduler(n), mark: 0 });
  };

  const tp = s.ps[Math.min(target, s.ps.length - 1)];
  const c = counts(s);
  const recent = s.log.filter((e) => e.n > st.mark);

  const btn = "inline-flex h-8 items-center gap-1 rounded-md border border-border-strong bg-surface px-2.5 text-[12.5px] text-fg hover:bg-surface-2 disabled:opacity-40";

  return (
    <VizFrame
      title="The G/M/P scheduler"
      kind="model"
      description={
        <>
          G = goroutine, M = OS thread, P = processor (a scheduling context; GOMAXPROCS of them). An M needs a P to run Go code. <strong className="font-medium text-fg">Conceptual, not to scale:</strong> one
          tick stands in for a time slice, and work is a handful of ticks.
        </>
      }
      footer={
        <>
          Simplifications: no spinning Ms, no netpoller activity, no GC workers, LockOSThread or timers; preemption after 2 ticks stands in for sysmon&apos;s 10ms limit; work stealing here
          tries one random victim instead of four randomized passes; the syscall handoff happens instantly rather than when sysmon notices it. The order in which a P looks for work — runnext, local
          queue, global queue (first on every 61st check), netpoller, steal — follows <code className="font-mono">runtime.findRunnable</code>.
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          label="GOMAXPROCS"
          value={procs}
          options={[1, 2, 3, 4].map((n) => ({ value: n, label: String(n) }))}
          onChange={(n) => {
            setProcs(n);
            reset(n);
          }}
        />
        <Segmented label="Acting P" value={Math.min(target, s.ps.length - 1)} options={s.ps.map((p) => ({ value: p.id, label: `P${p.id}` }))} onChange={setTarget} />
        <span className="font-mono text-xs text-muted">tick {s.tick}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Scheduler actions">
        <button type="button" className={btn} onClick={() => act((x) => spawn(x, target))}>
          go f()
        </button>
        <button type="button" className={btn} onClick={() => act((x) => spawnMany(x, 8, target))}>
          Spawn 8
        </button>
        <CtlButton onClick={() => act(tick)} label="Tick" primary>
          <StepForward className="h-4 w-4" /> <span className="text-xs">Tick</span>
        </CtlButton>
        <CtlButton onClick={() => setAuto(!auto)} label={auto ? "Pause auto-run" : "Auto-run"}>
          {auto ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span className="text-xs">{auto ? "Pause" : `Auto-run${reduced ? " (slow)" : ""}`}</span>
        </CtlButton>
        <CtlButton onClick={() => reset()} label="Reset">
          <RotateCcw className="h-4 w-4" />
        </CtlButton>
      </div>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={`Actions for the goroutine running on P${tp.id}`}>
        <button type="button" className={btn} disabled={tp.cur === null} onClick={() => act((x) => blockSyscall(x, tp.id))}>
          {tp.cur !== null ? gLabel(tp.cur) : `P${tp.id}'s G`}: blocking syscall
        </button>
        <button type="button" className={btn} disabled={tp.cur === null} onClick={() => act((x) => blockChannel(x, tp.id))}>
          {tp.cur !== null ? gLabel(tp.cur) : `P${tp.id}'s G`}: wait on channel
        </button>
        <button type="button" className={btn} disabled={s.waiting.length === 0} onClick={() => act((x) => wakeWaiting(x, tp.id))}>
          Wake {s.waiting.length ? gLabel(s.waiting[0]) : "a waiting G"}
        </button>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {s.ps.map((p) => (
          <Panel key={p.id} title={`P${p.id}`} hint={p.m !== null ? `on M${p.m}` : "idle (no M)"} className={cn(p.id === tp.id && "ring-1 ring-accent")}>
            <div className="space-y-2 text-[12.5px]">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="w-16 shrink-0 text-muted">running</span>
                {p.cur !== null ? (
                  <Chip tone="ok" className="anim-pop">
                    ▶ {gLabel(p.cur)} <span className="text-muted">left {s.gs[p.cur].work === Infinity ? "∞" : s.gs[p.cur].work}</span>
                  </Chip>
                ) : (
                  <Empty>nothing</Empty>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="w-16 shrink-0 text-muted">runnext</span>
                {p.runnext !== null ? <Chip tone="accent">{gLabel(p.runnext)}</Chip> : <Empty />}
              </div>
              <div className="flex flex-wrap items-start gap-1.5">
                <span className="w-16 shrink-0 text-muted">
                  local <span className="font-mono text-[10.5px] text-subtle">{p.local.length}/{LOCAL_QUEUE_CAP}</span>
                </span>
                <div className="flex min-w-0 flex-1 flex-wrap gap-1">{p.local.length ? p.local.map((g) => <Chip key={g}>{gLabel(g)}</Chip>) : <Empty />}</div>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Panel title="Global run queue">
          <div className="flex flex-wrap gap-1">{s.global.length ? s.global.map((g) => <Chip key={g}>{gLabel(g)}</Chip>) : <Empty />}</div>
        </Panel>
        <Panel title="Blocked off-P">
          <div className="space-y-1.5 text-[12.5px]">
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-muted">syscall:</span>
              {s.syscalls.length ? (
                s.syscalls.map((x) => (
                  <Chip key={x.g} tone="warn">
                    {gLabel(x.g)} on M{x.m} · {x.remaining}t
                  </Chip>
                ))
              ) : (
                <Empty>none</Empty>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-muted">chan wait:</span>
              {s.waiting.length ? s.waiting.map((g) => <Chip key={g} tone="info">⏸ {gLabel(g)}</Chip>) : <Empty>none</Empty>}
            </div>
          </div>
        </Panel>
        <Panel title="Threads (M)" hint={`${s.ms.length} total`}>
          <div className="flex flex-wrap gap-1">
            {s.ms.map((m) => (
              <Chip key={m.id} tone={m.state === "running" ? "ok" : m.state === "syscall" ? "warn" : "neutral"}>
                M{m.id} {m.state === "running" ? `→ P${m.p}` : m.state === "syscall" ? "in syscall" : "idle"}
              </Chip>
            ))}
          </div>
        </Panel>
      </div>
      <p className="mt-2 font-mono text-[11.5px] text-muted">
        goroutines: {c.total} created · {c.running} running · {c.runnable} runnable · {c.dead} finished
      </p>

      <Narration>
        {recent.length ? (
          <ul className="space-y-1">
            {recent.map((e) => (
              <li key={e.n}>{e.text}</li>
            ))}
          </ul>
        ) : s.tick > 0 ? (
          <>Tick {s.tick}: every P kept running its current goroutine; nothing was scheduled.</>
        ) : (
          <>Main (G1) is running on P0. Press &ldquo;Spawn 8&rdquo;, then Tick, and watch idle Ps wake up and steal work.</>
        )}
      </Narration>

      {s.log.length > 0 && (
        <details className="mt-2 text-[13px]">
          <summary className="cursor-pointer text-muted">Event log ({s.log.length})</summary>
          <ol className="mt-1 max-h-56 space-y-1 overflow-y-auto pl-1">
            {s.log
              .slice()
              .reverse()
              .map((e) => (
                <li key={e.n} className={cn("border-l-2 pl-2", e.tone === "warn" ? "border-warn" : e.tone === "ok" ? "border-ok" : e.tone === "info" ? "border-info" : "border-border-strong", e.n > st.mark && "text-fg")}>
                  <span className="font-mono text-[11px] text-subtle">t{e.tick}</span> {e.text}
                </li>
              ))}
          </ol>
        </details>
      )}
    </VizFrame>
  );
}
