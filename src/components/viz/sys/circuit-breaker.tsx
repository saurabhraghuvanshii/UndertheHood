"use client";
import { useState } from "react";
import { Clock, RotateCcw, Send } from "lucide-react";
import { Chip, CtlButton, Empty, Narration, Panel, Segmented, VizFrame } from "../kit";
import { cn } from "@/components/ui/cn";
import { COOLDOWN, MIN_CALLS, PROBES_TO_CLOSE, TIMEOUT_MS, WINDOW, failureRate, initCb, send, sendMany, setHealth, tick, type BreakerState, type Health, type Outcome } from "./circuit-breaker-model";

const HEALTH: { value: Health; label: string }[] = [
  { value: "healthy", label: "Healthy" },
  { value: "failing", label: "Failing" },
  { value: "slow", label: "Slow → timeout" },
];

const OUTCOME: Record<Outcome, { label: string; tone: "ok" | "danger" | "warn" | "info" }> = {
  success: { label: "ok", tone: "ok" },
  error: { label: "500", tone: "danger" },
  timeout: { label: "timeout", tone: "warn" },
  "short-circuit": { label: "fallback", tone: "info" },
};

export default function CircuitBreakerViz() {
  const [s, setS] = useState(() => initCb());
  const lastTransition = [...s.last].reverse().find((e) => e.transition)?.transition;
  const fails = s.window.filter((x) => x === "fail").length;

  return (
    <VizFrame
      title="Circuit breaker"
      kind="model"
      description={
        <>
          Policy in this model: in CLOSED, the breaker keeps the last {WINDOW} results and trips when at least {MIN_CALLS} are recorded and ≥ 50% failed (errors and {TIMEOUT_MS} ms timeouts both count). OPEN fails fast for {COOLDOWN} ticks, then HALF-OPEN lets probes through: {PROBES_TO_CLOSE} successes close it, one failure re-opens it.
        </>
      }
      footer={
        <>
          <strong className="text-fg">Why bother.</strong> Without a breaker, every caller waits the full timeout on a dead dependency, threads and connections pile up, and the failure spreads upstream. Failing fast with a fallback keeps the caller healthy and gives the dependency room to recover. Pair breakers with timeouts (so “slow” becomes a failure) and with retries that use backoff and jitter, and never retry while the breaker is open. Libraries such as resilience4j, Polly and gobreaker implement this with similar knobs; the thresholds here are illustrative.
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Segmented label="Dependency" value={s.health} options={HEALTH} onChange={(v) => setS((x) => setHealth(x, v))} />

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Circuit breaker actions">
          <CtlButton label="Send request" onClick={() => setS(send)} primary>
            <Send className="h-4 w-4" /> <span className="text-xs">Send</span>
          </CtlButton>
          <CtlButton label="Send 5 requests" onClick={() => setS((x) => sendMany(x, 5))}>
            <span className="text-xs">Send 5</span>
          </CtlButton>
          <CtlButton label="Tick (time passes)" onClick={() => setS(tick)}>
            <Clock className="h-4 w-4" /> <span className="text-xs">Tick</span>
          </CtlButton>
          <CtlButton label="Reset" onClick={() => setS(initCb(s.health))}>
            <RotateCcw className="h-4 w-4" /> <span className="text-xs">Reset</span>
          </CtlButton>
          <span className="ml-auto font-mono text-xs text-muted">tick {s.tick}</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <Panel title="State machine" hint={`current: ${s.state.replace("_", "-")}`}>
            <StateDiagram current={s.state} transition={lastTransition} />
          </Panel>
          <Panel title="Rolling window" hint={`last ${WINDOW} calls in CLOSED`}>
            <div className="flex gap-1" aria-label={`Window: ${s.window.length ? s.window.join(", ") : "empty"}`}>
              {Array.from({ length: WINDOW }, (_, i) => {
                const v = s.window[i];
                return (
                  <span key={i} className={cn("flex h-7 w-9 items-center justify-center rounded border font-mono text-[11px]", v === "ok" ? "border-ok/40 bg-ok-soft" : v === "fail" ? "border-danger/40 bg-danger-soft" : "border-dashed border-border-strong text-subtle")}>
                    {v ?? "·"}
                  </span>
                );
              })}
            </div>
            <p className="mt-1.5 text-xs text-muted">
              {fails}/{s.window.length} failed ({Math.round(failureRate(s.window) * 100)}%).{" "}
              {s.state === "OPEN" && s.openedAt !== null && `Half-open in ${Math.max(0, COOLDOWN - (s.tick - s.openedAt))} tick(s).`}
              {s.state === "HALF_OPEN" && `Probe successes: ${s.probeSuccesses}/${PROBES_TO_CLOSE}.`}
            </p>
            <dl className="mt-2 grid grid-cols-2 gap-1 text-xs">
              {[
                ["Sent", s.stats.sent],
                ["Succeeded", s.stats.succeeded],
                ["Failed", s.stats.failed],
                ["Short-circuited", s.stats.shortCircuited],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between rounded border border-border px-1.5 py-0.5">
                  <dt className="text-muted">{k}</dt>
                  <dd className="font-mono text-fg">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        </div>

        <Narration>
          {s.last.map((e, i) => (
            <p key={i} className={i > 0 ? "mt-1" : ""}>
              {e.text}
            </p>
          ))}
        </Narration>

        <Panel title="Recent calls" hint="oldest → newest">
          {s.calls.length === 0 ? (
            <Empty>no calls yet</Empty>
          ) : (
            <ol className="flex flex-wrap gap-1">
              {s.calls.slice(-16).map((c) => (
                <li key={c.id} title={`#${c.id} at tick ${c.tick} while ${c.state}: ${c.outcome}, ${c.latencyMs} ms`}>
                  <Chip tone={OUTCOME[c.outcome].tone}>
                    #{c.id} {OUTCOME[c.outcome].label} <span className="text-[10px] text-muted">{c.latencyMs}ms</span>
                  </Chip>
                </li>
              ))}
            </ol>
          )}
          <p className="mt-1.5 text-[11px] text-subtle">Latencies are illustrative. Note how “fallback” calls cost ~0 ms while timeouts cost the full {TIMEOUT_MS} ms.</p>
        </Panel>

        <Panel title="Log" hint="newest first">
          {s.log.length === 0 ? (
            <Empty>no events yet</Empty>
          ) : (
            <ol className="max-h-40 overflow-y-auto text-xs">
              {s.log.map((e, i) => (
                <li key={s.log.length - i} className="flex gap-2 border-b border-border py-1 last:border-0">
                  <span className="shrink-0 font-mono text-subtle">t{e.tick}</span>
                  <span className={e.transition ? "font-medium text-fg" : "text-muted"}>
                    {e.transition && <span className="font-mono">[{e.transition.from.replace("_", "-")} → {e.transition.to.replace("_", "-")}] </span>}
                    {e.text}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>
    </VizFrame>
  );
}

const NODES: Record<BreakerState, { x: number; y: number; label: string }> = {
  CLOSED: { x: 60, y: 36, label: "CLOSED" },
  OPEN: { x: 260, y: 36, label: "OPEN" },
  HALF_OPEN: { x: 160, y: 134, label: "HALF-OPEN" },
};

const EDGES: { from: BreakerState; to: BreakerState; label: string; d: string; lx: number; ly: number }[] = [
  { from: "CLOSED", to: "OPEN", label: "≥50% fail (min 4)", d: "M 108 30 L 210 30", lx: 160, ly: 22 },
  { from: "OPEN", to: "HALF_OPEN", label: `cooldown ${COOLDOWN} ticks`, d: "M 270 56 L 206 114", lx: 276, ly: 100 },
  { from: "HALF_OPEN", to: "OPEN", label: "probe fails", d: "M 180 114 L 244 56", lx: 184, ly: 80 },
  { from: "HALF_OPEN", to: "CLOSED", label: `${PROBES_TO_CLOSE} probes ok`, d: "M 112 122 L 60 56", lx: 48, ly: 98 },
];

function StateDiagram({ current, transition }: { current: BreakerState; transition?: { from: BreakerState; to: BreakerState } }) {
  return (
    <svg viewBox="0 0 320 160" className="h-auto w-full" role="img" aria-label={`Breaker state machine. Current state: ${current.replace("_", "-")}.${transition ? ` Last transition: ${transition.from.replace("_", "-")} to ${transition.to.replace("_", "-")}.` : ""}`}>
      <defs>
        <marker id="cb-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--fg-muted)" />
        </marker>
        <marker id="cb-arrow-on" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)" />
        </marker>
      </defs>
      {EDGES.map((e) => {
        const on = transition?.from === e.from && transition?.to === e.to;
        return (
          <g key={e.from + e.to}>
            <path d={e.d} fill="none" stroke={on ? "var(--accent)" : "var(--fg-subtle)"} strokeWidth={on ? 2.5 : 1.2} markerEnd={`url(#${on ? "cb-arrow-on" : "cb-arrow"})`} />
            <text x={e.lx} y={e.ly} textAnchor="middle" fontSize={9.5} fill={on ? "var(--fg)" : "var(--fg-muted)"} fontWeight={on ? 600 : 400}>
              {e.label}
            </text>
          </g>
        );
      })}
      {(Object.keys(NODES) as BreakerState[]).map((k) => {
        const n = NODES[k];
        const on = k === current;
        const fill = on ? (k === "CLOSED" ? "var(--ok-soft)" : k === "OPEN" ? "var(--danger-soft)" : "var(--warn-soft)") : "var(--surface)";
        return (
          <g key={k}>
            <rect x={n.x - 48} y={n.y - 18} width={96} height={36} rx={8} fill={fill} stroke={on ? "var(--fg)" : "var(--border-strong)"} strokeWidth={on ? 2.5 : 1} />
            <text x={n.x} y={on ? n.y - 1 : n.y + 4} textAnchor="middle" fontSize={12} fontWeight={on ? 700 : 500} fill="var(--fg)" fontFamily="var(--font-mono, monospace)">
              {n.label}
            </text>
            {on && (
              <text x={n.x} y={n.y + 12} textAnchor="middle" fontSize={9} fill="var(--fg-muted)">
                ● current
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
