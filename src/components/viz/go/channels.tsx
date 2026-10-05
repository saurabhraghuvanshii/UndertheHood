"use client";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { Chip, CtlButton, Empty, Narration, Panel, Segmented, VizFrame } from "../kit";
import { ALL_G, SENDERS, canAct, closeChan, deadlockStatus, exitG, newChan, recv, send, type ChanState, type GId, type GStatus } from "./channels-model";

const STATUS: Record<GStatus, { text: string; tone: "neutral" | "ok" | "warn" | "danger" | "info"; glyph: string }> = {
  running: { text: "running", tone: "ok", glyph: "▶" },
  "blocked-send": { text: "blocked on send", tone: "warn", glyph: "⏸" },
  "blocked-recv": { text: "blocked on receive", tone: "warn", glyph: "⏸" },
  done: { text: "done (returned)", tone: "neutral", glyph: "■" },
  panicked: { text: "panicked", tone: "danger", glyph: "✕" },
};

export default function ChannelsViz() {
  const [cap, setCap] = useState(0);
  const [s, setS] = useState<ChanState>(() => newChan(0));
  const reset = (c = cap) => setS(newChan(c));
  const last = s.log[s.log.length - 1];
  const dl = deadlockStatus(s);

  const btn = "inline-flex h-8 items-center rounded-md border border-border-strong bg-surface px-2.5 font-mono text-[12.5px] text-fg hover:bg-surface-2 disabled:opacity-40";

  return (
    <VizFrame
      title="Channels: buffered vs unbuffered"
      kind="model"
      description="Play the four goroutines yourself. The rules follow runtime/chan.go: a waiting receiver gets the value directly, otherwise the buffer is used, otherwise the goroutine parks in a wait queue."
      footer={
        <>
          Values are numbered automatically so you can follow them. A panic here would, in a real program, crash the whole process unless recovered — the model lets you keep exploring. Fairness
          and timing are simplified: the runtime wakes parked goroutines in FIFO order, but when a woken goroutine actually runs is up to the scheduler.
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          label="Capacity"
          value={cap}
          options={[0, 1, 2, 3].map((c) => ({ value: c, label: c === 0 ? "0 (unbuffered)" : String(c) }))}
          onChange={(c) => {
            setCap(c);
            reset(c);
          }}
        />
        <span className="font-mono text-xs text-muted">ch := make(chan int{cap ? `, ${cap}` : ""})</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Channel operations">
        {SENDERS.map((g) => (
          <button key={g} type="button" className={btn} disabled={!canAct(s, g)} onClick={() => setS(send(s, g))}>
            {g}: ch &lt;- {s.nextValue}
          </button>
        ))}
        {(["G3", "G4"] as GId[]).map((g) => (
          <button key={g} type="button" className={btn} disabled={!canAct(s, g)} onClick={() => setS(recv(s, g))}>
            {g}: &lt;-ch
          </button>
        ))}
        <button type="button" className={cn(btn, "border-danger/40")} onClick={() => setS(closeChan(s))}>
          close(ch)
        </button>
        <CtlButton onClick={() => reset()} label="Reset">
          <RotateCcw className="h-4 w-4" /> <span className="text-xs">Reset</span>
        </CtlButton>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Panel title="Buffer (circular queue)" hint={s.closed ? "closed" : "open"}>
          {s.cap === 0 ? (
            <p className="text-[13px] text-muted">No buffer. Every send must meet a receiver directly (a rendezvous).</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {s.buf.map((v, k) => (
                <div key={k} className="flex flex-col items-center">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded border font-mono text-sm", v === null ? "border-dashed border-border-strong text-subtle" : "anim-pop border-info/50 bg-info-soft text-fg")}>
                    {v ?? "·"}
                  </div>
                  <span className="mt-0.5 font-mono text-[10px] leading-tight text-subtle">
                    [{k}]
                    {k === s.recvx && <span className="block text-fg">recvx</span>}
                    {k === s.sendx && <span className="block text-fg">sendx</span>}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-2 text-[12px]">
            <Chip>
              qcount {s.qcount}/{s.cap}
            </Chip>
            {s.closed ? <Chip tone="danger">✕ closed</Chip> : <Chip tone="ok">open</Chip>}
            {s.closePanicked && <Chip tone="danger">panic: close of closed channel</Chip>}
          </div>
        </Panel>

        <Panel title="Wait queues">
          <div className="space-y-2 text-[13px]">
            <div>
              <div className="text-[11px] text-muted">sendq — parked senders</div>
              <div className="mt-1 flex flex-wrap gap-1">{s.sendq.length ? s.sendq.map((x) => <Chip key={x.g} tone="warn">{x.g} holding {x.value}</Chip>) : <Empty />}</div>
            </div>
            <div>
              <div className="text-[11px] text-muted">recvq — parked receivers</div>
              <div className="mt-1 flex flex-wrap gap-1">{s.recvq.length ? s.recvq.map((g) => <Chip key={g} tone="warn">{g}</Chip>) : <Empty />}</div>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Goroutines" className="mt-3">
        <ul className="grid gap-2 sm:grid-cols-2">
          {ALL_G.map((g) => {
            const info = s.gs[g];
            const st = STATUS[info.status];
            return (
              <li key={g} className="flex flex-wrap items-center justify-between gap-2 rounded border border-border bg-surface px-2 py-1.5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-sm font-semibold">{g}</span>
                    <span className="text-[11px] text-subtle">{SENDERS.includes(g) ? "sender" : "receiver"}</span>
                    <Chip tone={st.tone}>
                      <span aria-hidden>{st.glyph}</span> {st.text}
                      {info.status === "blocked-send" && ` (${info.pending})`}
                    </Chip>
                  </div>
                  <div className="mt-0.5 font-mono text-[11.5px] text-muted">{info.last ?? "—"}</div>
                </div>
                <button type="button" className="rounded border border-border px-1.5 py-0.5 text-[11px] text-muted hover:text-fg disabled:opacity-40" disabled={!canAct(s, g)} onClick={() => setS(exitG(s, g))}>
                  return
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel title="Deadlock?" className="mt-3">
        <div className="text-[13px] leading-relaxed">
          {dl.kind === "none" && <p className="text-muted">No goroutine is blocked.</p>}
          {dl.kind === "some-blocked" && (
            <p>
              <Chip tone="warn">⏸ {dl.blocked.join(", ")} asleep</Chip>{" "}
              {dl.canUnblock.length ? (
                <>They wake when {dl.canUnblock.join(" or ")} performs the matching operation, or when the channel is closed.</>
              ) : (
                <>No running goroutine can do the matching operation — only close(ch) could wake them. If nothing ever does, they leak.</>
              )}
            </p>
          )}
          {dl.kind === "stuck" && (
            <p>
              <Chip tone="danger">✕ every remaining goroutine is blocked</Chip> {dl.blocked.join(", ")} can never be woken by each other. If main were blocked too, the runtime would stop with{" "}
              <code className="font-mono">fatal error: all goroutines are asleep - deadlock!</code>
            </p>
          )}
          <p className="mt-1 text-[12px] text-subtle">
            The runtime only detects a deadlock when <em>all</em> goroutines — including main — are blocked. A few stuck goroutines while others keep running is a silent goroutine leak, not a crash.
          </p>
        </div>
      </Panel>

      <Narration>{last ? last.text : "Pick an operation. Try an unbuffered channel first: a send blocks until a receiver arrives."}</Narration>

      {s.log.length > 1 && (
        <details className="mt-2 text-[13px]">
          <summary className="cursor-pointer text-muted">Event log ({s.log.length})</summary>
          <ol className="mt-1 max-h-48 space-y-1 overflow-y-auto pl-1">
            {s.log
              .slice()
              .reverse()
              .map((e) => (
                <li key={e.n} className={cn("border-l-2 pl-2", e.tone === "danger" ? "border-danger" : e.tone === "warn" ? "border-warn" : e.tone === "ok" ? "border-ok" : "border-border-strong")}>
                  <span className="font-mono text-[11px] text-subtle">{e.n}.</span> {e.text}
                </li>
              ))}
          </ol>
        </details>
      )}
    </VizFrame>
  );
}
