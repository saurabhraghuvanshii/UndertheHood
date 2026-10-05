"use client";
import { useEffect, useState } from "react";
import { Clock, Pause, Play, RotateCcw, Send } from "lucide-react";
import { CtlButton, Empty, Narration, Panel, Segmented, VizFrame } from "../kit";
import { cn } from "@/components/ui/cn";
import { boundaryDemo, burst, fmt, initRl, request, tick } from "./rate-limiter-model";

export default function RateLimiterViz() {
  const [s, setS] = useState(() => initRl(10, 1));
  const [auto, setAuto] = useState(false);
  const [compare, setCompare] = useState<"off" | "on">("off");

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setS((x) => tick(x)), 1000);
    return () => clearInterval(t);
  }, [auto]);

  const recent = s.requests.slice(-20);
  const slots = Array.from({ length: s.capacity }, (_, i) => Math.max(0, Math.min(1, s.tokens - i)));
  const fwTicksLeft = s.fw.windowStart + s.fw.window - s.tick;

  return (
    <VizFrame
      title="Token-bucket rate limiter"
      kind="model"
      description={<>A bucket holds up to {s.capacity} tokens and refills {fmt(s.refill)} per tick. Each request spends one token; with no whole token left the request gets <span className="font-mono">429 Too Many Requests</span> and a <span className="font-mono">Retry-After</span> hint. Time is in ticks (think “seconds”).</>}
      footer={
        <>
          <strong className="text-fg">What to notice.</strong> Capacity sets the largest burst you tolerate; refill rate sets the sustained rate. A fixed-window counter (“{s.fw.limit} per {s.fw.window} ticks”) has the same average rate but resets all at once, so a client can send a full window’s quota just before the boundary and another just after: up to 2× the limit in a moment. Production limiters keep bucket state per client key in a shared store such as Redis and update it atomically, and should send <span className="font-mono">Retry-After</span> (or <span className="font-mono">RateLimit-*</span> headers) so clients back off instead of hammering.
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Segmented label="Capacity" value={s.capacity} options={[5, 10].map((v) => ({ value: v, label: String(v) }))} onChange={(v) => setS(initRl(v, s.refill))} />
          <Segmented label="Refill / tick" value={s.refill} options={[0.5, 1, 2].map((v) => ({ value: v, label: String(v) }))} onChange={(v) => setS(initRl(s.capacity, v))} />
          <Segmented label="Compare fixed window" value={compare} options={[{ value: "off", label: "Off" }, { value: "on", label: "On" }]} onChange={setCompare} />
        </div>

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Rate limiter actions">
          <CtlButton label="Send 1 request" onClick={() => setS(request)} primary>
            <Send className="h-4 w-4" /> <span className="text-xs">Send 1</span>
          </CtlButton>
          <CtlButton label="Burst of 8 requests" onClick={() => setS((x) => burst(x, 8))}>
            <span className="text-xs">Burst of 8</span>
          </CtlButton>
          <CtlButton label="Tick (refill)" onClick={() => setS((x) => tick(x))}>
            <Clock className="h-4 w-4" /> <span className="text-xs">Tick</span>
          </CtlButton>
          <CtlButton label={auto ? "Stop automatic ticking" : "Tick automatically every second"} onClick={() => setAuto((a) => !a)}>
            {auto ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} <span className="text-xs">Auto</span>
          </CtlButton>
          <CtlButton label="Reset" onClick={() => { setAuto(false); setS(initRl(s.capacity, s.refill)); }}>
            <RotateCcw className="h-4 w-4" />
          </CtlButton>
          {compare === "on" && (
            <CtlButton label="Run the window-boundary burst demo" onClick={() => { setAuto(false); setS(boundaryDemo(s.capacity, s.refill)); }}>
              <span className="text-xs">Boundary burst demo</span>
            </CtlButton>
          )}
          <span className="ml-auto font-mono text-xs text-muted">tick {s.tick}</span>
        </div>

        <div className={cn("grid gap-3", compare === "on" && "sm:grid-cols-2")}>
          <Panel title="Token bucket" hint={`${fmt(s.tokens)} / ${s.capacity} tokens`}>
            <div className="flex flex-wrap gap-1" role="meter" aria-valuemin={0} aria-valuemax={s.capacity} aria-valuenow={s.tokens} aria-label="Tokens in bucket">
              {slots.map((f, i) => (
                <span key={i} className="relative h-6 w-6 overflow-hidden rounded border border-border-strong bg-surface" aria-hidden>
                  <span className="absolute inset-y-0 left-0 bg-accent transition-[width] duration-300" style={{ width: `${f * 100}%` }} />
                </span>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-muted">
              Filled squares are tokens. {s.tokens >= 1 ? `Next request will be allowed.` : `Empty: next request is rejected until a whole token refills.`}
            </p>
          </Panel>
          {compare === "on" && (
            <Panel title="Fixed-window counter" hint={`${s.fw.limit} per ${s.fw.window} ticks`}>
              <div className="flex items-center gap-2">
                <div className="h-3 flex-1 overflow-hidden rounded bg-surface-2" aria-hidden>
                  <div className="h-full bg-fg/70" style={{ width: `${(s.fw.count / s.fw.limit) * 100}%` }} />
                </div>
                <span className="font-mono text-xs">
                  {s.fw.count}/{s.fw.limit}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-muted">
                Window ticks {s.fw.windowStart}–{s.fw.windowStart + s.fw.window - 1}; counter resets to 0 in {fwTicksLeft} tick{fwTicksLeft === 1 ? "" : "s"}. Same requests, counted the fixed-window way.
              </p>
            </Panel>
          )}
        </div>

        <Narration>{s.last}</Narration>

        <Panel title="Last 20 requests" hint="oldest → newest">
          {recent.length === 0 ? (
            <Empty>no requests yet</Empty>
          ) : (
            <ol className="flex flex-wrap gap-1">
              {recent.map((r) => (
                <li
                  key={r.id}
                  className={cn("min-w-[3.25rem] rounded border px-1 py-0.5 text-center font-mono text-[10px] leading-tight", r.allowed ? "border-ok/40 bg-ok-soft" : "border-danger/40 bg-danger-soft")}
                  title={`Request #${r.id} at tick ${r.tick}`}
                >
                  <div className="text-subtle">#{r.id} t{r.tick}</div>
                  <div className="font-semibold text-fg">{r.allowed ? "200" : "429"}</div>
                  <div className="text-muted">{r.allowed ? `${fmt(r.tokensAfter)} left` : `retry ${r.retryAfter}`}</div>
                  {compare === "on" && <div className={cn("border-t border-border", r.fwAllowed ? "text-ok" : "text-danger")}>FW {r.fwAllowed ? "ok" : "429"}</div>}
                </li>
              ))}
            </ol>
          )}
          <p className="mt-1.5 text-[11px] text-subtle">“retry N” is the Retry-After value in ticks.{compare === "on" ? " “FW” shows what the fixed-window counter would have answered." : ""}</p>
        </Panel>
      </div>
    </VizFrame>
  );
}
