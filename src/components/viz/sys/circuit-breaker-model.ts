/**
 * Circuit breaker model (pure, React-free).
 *
 * Policy used here (documented in the UI):
 *  - CLOSED: every call goes to the dependency. Results are kept in a rolling window of
 *    the last WINDOW (6) calls. The breaker trips to OPEN when the window holds at least
 *    MIN_CALLS (4) results and at least half of them are failures (timeouts count as failures).
 *  - OPEN: calls are short-circuited (fail fast and serve a fallback) without touching the
 *    dependency. After COOLDOWN (5) ticks the breaker moves to HALF_OPEN.
 *  - HALF_OPEN: calls are let through as trial probes. PROBES_TO_CLOSE (2) consecutive
 *    successes close the breaker (window cleared); any failure re-opens it and restarts
 *    the cooldown.
 */

export type BreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";
export type Health = "healthy" | "failing" | "slow";
export type Outcome = "success" | "error" | "timeout" | "short-circuit";

export const WINDOW = 6;
export const MIN_CALLS = 4;
export const FAILURE_RATE = 0.5;
export const COOLDOWN = 5;
export const PROBES_TO_CLOSE = 2;
export const TIMEOUT_MS = 1000;

export type CbCall = { id: number; tick: number; outcome: Outcome; latencyMs: number; state: BreakerState };
export type CbEvent = { tick: number; text: string; transition?: { from: BreakerState; to: BreakerState } };

export type CbState = {
  state: BreakerState;
  health: Health;
  tick: number;
  window: ("ok" | "fail")[]; // newest last
  openedAt: number | null;
  probeSuccesses: number;
  nextId: number;
  calls: CbCall[];
  stats: { sent: number; succeeded: number; failed: number; shortCircuited: number };
  last: CbEvent[];
  log: CbEvent[];
};

const LOG_MAX = 40;

export function initCb(health: Health = "healthy"): CbState {
  return {
    state: "CLOSED",
    health,
    tick: 0,
    window: [],
    openedAt: null,
    probeSuccesses: 0,
    nextId: 1,
    calls: [],
    stats: { sent: 0, succeeded: 0, failed: 0, shortCircuited: 0 },
    last: [{ tick: 0, text: "The breaker starts CLOSED: requests flow to the dependency and results are recorded." }],
    log: [],
  };
}

function push(s: CbState, events: CbEvent[]): CbState {
  return { ...s, last: events, log: [...events.slice().reverse(), ...s.log].slice(0, LOG_MAX) };
}

export const failureRate = (w: CbState["window"]) => (w.length === 0 ? 0 : w.filter((x) => x === "fail").length / w.length);
export const shouldTrip = (w: CbState["window"]) => w.length >= MIN_CALLS && failureRate(w) >= FAILURE_RATE;

function callDependency(health: Health): { outcome: Outcome; latencyMs: number } {
  if (health === "healthy") return { outcome: "success", latencyMs: 40 };
  if (health === "failing") return { outcome: "error", latencyMs: 15 };
  return { outcome: "timeout", latencyMs: TIMEOUT_MS };
}

const outcomeText = (o: Outcome, ms: number) =>
  o === "success" ? `succeeded in ~${ms} ms` : o === "error" ? `failed fast with a 500 after ~${ms} ms` : o === "timeout" ? `timed out after ${ms} ms (the caller waited the full timeout)` : "was short-circuited";

export function send(s: CbState): CbState {
  const id = s.nextId;
  const events: CbEvent[] = [];
  if (s.state === "OPEN") {
    const call: CbCall = { id, tick: s.tick, outcome: "short-circuit", latencyMs: 0, state: "OPEN" };
    const left = COOLDOWN - (s.tick - (s.openedAt ?? s.tick));
    events.push({ tick: s.tick, text: `Request #${id} short-circuited: the breaker is OPEN, so it failed fast and served the fallback (e.g. cached or default data) without calling the dependency. Half-open in ${left} tick${left === 1 ? "" : "s"}.` });
    return push({ ...s, nextId: id + 1, calls: [...s.calls, call].slice(-30), stats: { ...s.stats, sent: s.stats.sent + 1, shortCircuited: s.stats.shortCircuited + 1 } }, events);
  }
  const { outcome, latencyMs } = callDependency(s.health);
  const ok = outcome === "success";
  const call: CbCall = { id, tick: s.tick, outcome, latencyMs, state: s.state };
  const base: CbState = {
    ...s,
    nextId: id + 1,
    calls: [...s.calls, call].slice(-30),
    stats: { ...s.stats, sent: s.stats.sent + 1, succeeded: s.stats.succeeded + (ok ? 1 : 0), failed: s.stats.failed + (ok ? 0 : 1) },
  };
  if (s.state === "HALF_OPEN") {
    if (!ok) {
      events.push({ tick: s.tick, text: `Probe #${id} ${outcomeText(outcome, latencyMs)}. The dependency is still unhealthy, so the breaker goes back to OPEN and the ${COOLDOWN}-tick cooldown restarts.`, transition: { from: "HALF_OPEN", to: "OPEN" } });
      return push({ ...base, state: "OPEN", openedAt: s.tick, probeSuccesses: 0 }, events);
    }
    const n = s.probeSuccesses + 1;
    if (n >= PROBES_TO_CLOSE) {
      events.push({ tick: s.tick, text: `Probe #${id} ${outcomeText(outcome, latencyMs)}: ${n} successful probes in a row, so the breaker CLOSES and normal traffic resumes with a fresh window.`, transition: { from: "HALF_OPEN", to: "CLOSED" } });
      return push({ ...base, state: "CLOSED", openedAt: null, probeSuccesses: 0, window: [] }, events);
    }
    events.push({ tick: s.tick, text: `Probe #${id} ${outcomeText(outcome, latencyMs)}. ${n}/${PROBES_TO_CLOSE} successful probes; one more closes the breaker.` });
    return push({ ...base, probeSuccesses: n }, events);
  }
  // CLOSED
  const window = [...s.window, ok ? ("ok" as const) : ("fail" as const)].slice(-WINDOW);
  const rate = failureRate(window);
  if (shouldTrip(window)) {
    events.push({
      tick: s.tick,
      text: `Request #${id} ${outcomeText(outcome, latencyMs)}. The window now has ${window.filter((x) => x === "fail").length} failures in ${window.length} calls (${Math.round(rate * 100)}% ≥ 50%, with at least ${MIN_CALLS} calls), so the breaker TRIPS to OPEN. Callers now fail fast instead of piling up on a sick dependency.`,
      transition: { from: "CLOSED", to: "OPEN" },
    });
    return push({ ...base, window, state: "OPEN", openedAt: s.tick, probeSuccesses: 0 }, events);
  }
  const note = window.length < MIN_CALLS ? `Only ${window.length} call${window.length === 1 ? "" : "s"} in the window; at least ${MIN_CALLS} are needed before the breaker can trip.` : `Failure rate ${Math.round(rate * 100)}% is below 50%, so it stays CLOSED.`;
  events.push({ tick: s.tick, text: `Request #${id} ${outcomeText(outcome, latencyMs)}. ${note}` });
  return push({ ...base, window }, events);
}

export function sendMany(s: CbState, n: number): CbState {
  let st = s;
  const all: CbEvent[] = [];
  for (let k = 0; k < n; k++) {
    st = send(st);
    all.push(...st.last);
  }
  const transitions = all.filter((e) => e.transition);
  const summary = transitions.length ? transitions.map((e) => e.text).join(" ") : all[all.length - 1]?.text ?? "";
  return { ...st, last: [{ tick: st.tick, text: `Sent ${n} requests. ${summary}` }] };
}

export function tick(s: CbState): CbState {
  const t = s.tick + 1;
  if (s.state === "OPEN" && s.openedAt !== null && t - s.openedAt >= COOLDOWN) {
    return push({ ...s, tick: t, state: "HALF_OPEN", probeSuccesses: 0 }, [
      { tick: t, text: `Tick ${t}: the ${COOLDOWN}-tick cooldown is over, so the breaker moves to HALF-OPEN. The next requests are trial probes: ${PROBES_TO_CLOSE} successes close it, one failure re-opens it.`, transition: { from: "OPEN", to: "HALF_OPEN" } },
    ]);
  }
  const extra = s.state === "OPEN" && s.openedAt !== null ? ` Cooldown: ${COOLDOWN - (t - s.openedAt)} tick(s) until HALF-OPEN.` : "";
  return { ...s, tick: t, last: [{ tick: t, text: `Tick ${t}.${extra}` }] };
}

export function setHealth(s: CbState, health: Health): CbState {
  const desc = health === "healthy" ? "healthy (responds in ~40 ms)" : health === "failing" ? "failing (returns 500 errors quickly)" : `slow (does not answer; calls hit the ${TIMEOUT_MS} ms timeout)`;
  return push({ ...s, health }, [{ tick: s.tick, text: `The dependency is now ${desc}.` }]);
}
