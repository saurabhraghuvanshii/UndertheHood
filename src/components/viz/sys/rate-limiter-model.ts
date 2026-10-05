/**
 * Token-bucket rate limiter model (pure, React-free), with a fixed-window counter
 * running on the same request stream for comparison.
 *
 * Token bucket: holds up to `capacity` tokens; `refill` tokens are added at every tick
 * (capped at capacity). A request takes one token (allowed, 200) or, if fewer than one
 * token is available, is rejected (429) with Retry-After = ticks until one token exists.
 *
 * Fixed window: windows of `window` ticks; at most `limit` requests per window. The window
 * is sized so the long-run rate matches the bucket: limit = capacity, window = capacity / refill.
 */

export type RlRequest = { id: number; tick: number; allowed: boolean; retryAfter: number | null; tokensAfter: number; fwAllowed: boolean };

export type RlState = {
  capacity: number;
  refill: number; // tokens per tick
  tokens: number;
  tick: number;
  nextId: number;
  fw: { window: number; limit: number; windowStart: number; count: number };
  requests: RlRequest[]; // newest last
  last: string;
};

const KEEP = 40;

export function fixedWindowFor(capacity: number, refill: number) {
  return { window: Math.max(1, Math.round(capacity / refill)), limit: capacity };
}

export function initRl(capacity = 10, refill = 1): RlState {
  const { window, limit } = fixedWindowFor(capacity, refill);
  return {
    capacity,
    refill,
    tokens: capacity,
    tick: 0,
    nextId: 1,
    fw: { window, limit, windowStart: 0, count: 0 },
    requests: [],
    last: `The bucket starts full with ${capacity} tokens and gains ${refill} token${refill === 1 ? "" : "s"} per tick.`,
  };
}

/** Ticks until at least one token is available. */
export function retryAfter(tokens: number, refill: number): number {
  return Math.max(1, Math.ceil((1 - tokens) / refill - 1e-9));
}

export function tick(s: RlState, n = 1): RlState {
  let st = s;
  for (let k = 0; k < n; k++) {
    const t = st.tick + 1;
    const tokens = Math.min(st.capacity, st.tokens + st.refill);
    const winStart = Math.floor(t / st.fw.window) * st.fw.window;
    const fw = winStart !== st.fw.windowStart ? { ...st.fw, windowStart: winStart, count: 0 } : st.fw;
    const added = tokens - st.tokens;
    st = {
      ...st,
      tick: t,
      tokens,
      fw,
      last: `Tick ${t}: ${added > 0 ? `refilled ${fmt(added)} token${added === 1 ? "" : "s"}` : "bucket already full, refill wasted"} → ${fmt(tokens)}/${st.capacity}.${fw !== st.fw ? ` (A new fixed window started at tick ${winStart}; its counter reset to 0.)` : ""}`,
    };
  }
  return st;
}

export function request(s: RlState): RlState {
  const fwAllowed = s.fw.count < s.fw.limit;
  const fw = { ...s.fw, count: s.fw.count + (fwAllowed ? 1 : 0) };
  if (s.tokens >= 1) {
    const tokens = s.tokens - 1;
    const r: RlRequest = { id: s.nextId, tick: s.tick, allowed: true, retryAfter: null, tokensAfter: tokens, fwAllowed };
    return { ...s, tokens, fw, nextId: s.nextId + 1, requests: [...s.requests, r].slice(-KEEP), last: `Request #${r.id}: took 1 token → 200 OK. ${fmt(tokens)} token${tokens === 1 ? "" : "s"} left.` };
  }
  const ra = retryAfter(s.tokens, s.refill);
  const r: RlRequest = { id: s.nextId, tick: s.tick, allowed: false, retryAfter: ra, tokensAfter: s.tokens, fwAllowed };
  return {
    ...s,
    fw,
    nextId: s.nextId + 1,
    requests: [...s.requests, r].slice(-KEEP),
    last: `Request #${r.id}: bucket has ${fmt(s.tokens)} tokens (< 1) → 429 Too Many Requests, Retry-After: ${ra} tick${ra === 1 ? "" : "s"} (time until the next whole token at ${fmt(s.refill)}/tick).`,
  };
}

export function burst(s: RlState, n: number): RlState {
  let st = s;
  for (let k = 0; k < n; k++) st = request(st);
  const batch = st.requests.slice(-n);
  const ok = batch.filter((r) => r.allowed).length;
  return { ...st, last: `Burst of ${n} at tick ${st.tick}: ${ok} allowed (200), ${n - ok} rejected (429). A bucket allows a burst up to its capacity, then only the refill rate.` };
}

/**
 * Boundary-burst demo: from a fresh limiter, advance to the last tick of the first fixed
 * window, send `capacity` requests, advance one tick into the next window, send `capacity` again.
 */
export function boundaryDemo(capacity: number, refill: number): RlState {
  let s = initRl(capacity, refill);
  s = tick(s, s.fw.window - 1);
  s = burst(s, capacity);
  s = tick(s, 1);
  s = burst(s, capacity);
  const last2 = s.requests.slice(-2 * capacity);
  const tb = last2.filter((r) => r.allowed).length;
  const fw = last2.filter((r) => r.fwAllowed).length;
  return {
    ...s,
    last: `Boundary burst: ${capacity} requests at tick ${s.tick - 1} (end of one window) and ${capacity} at tick ${s.tick} (start of the next). Fixed window allowed ${fw} in 2 ticks because its counter reset at the boundary; the token bucket allowed ${tb} (one bucketful plus the refill).`,
  };
}

export const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
