/**
 * Load balancer model (pure, React-free).
 *
 * Four backend servers. Each request has a client id (used as the key for consistent
 * hashing) and a duration in ticks, both drawn from a seeded pseudo-random generator so
 * every run is reproducible. Algorithms:
 *  - round robin: next live server in a fixed cycle, ignoring load
 *  - least connections: live server with the fewest active requests (ties: lowest index)
 *  - consistent hashing: hash ring with virtual nodes; key = client id
 */

export type Algorithm = "round-robin" | "least-connections" | "consistent-hash";

export type LbRequest = { id: number; client: number; remaining: number; duration: number };
export type Server = { name: string; alive: boolean; active: LbRequest[]; handled: number };

export type LbEvent = { text: string; server?: number; kind: "route" | "finish" | "kill" | "revive" | "drop" | "tick" | "none" };

export type LbState = {
  algorithm: Algorithm;
  servers: Server[];
  rr: number; // index of the server that round robin will consider next
  seed: number;
  nextId: number;
  tick: number;
  dropped: number;
  rejected: number;
  last: LbEvent[];
  log: LbEvent[];
};

export const SERVER_NAMES = ["A", "B", "C", "D"];
export const VNODES = 40;
export const CLIENTS = 24;
const LOG_MAX = 40;

/** mulberry32: tiny deterministic PRNG. Returns [value in [0,1), next seed]. */
export function rand(seed: number): [number, number] {
  const next = (seed + 0x6d2b79f5) | 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, next];
}

/** FNV-1a 32-bit hash with a final avalanche so short similar strings spread well. */
export function hash32(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

export type RingPoint = { pos: number; server: number };

/** Ring of virtual nodes for the given servers, sorted by position. */
export function buildRing(serverIdx: number[], vnodes = VNODES): RingPoint[] {
  const pts: RingPoint[] = [];
  for (const s of serverIdx) for (let v = 0; v < vnodes; v++) pts.push({ pos: hash32(`${SERVER_NAMES[s] ?? s}#${v}`), server: s });
  return pts.sort((a, b) => a.pos - b.pos);
}

/** Walk clockwise from the key's hash to the first virtual node. */
export function ringLookup(ring: RingPoint[], key: string): number {
  if (ring.length === 0) return -1;
  const h = hash32(key);
  let lo = 0;
  let hi = ring.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (ring[mid].pos < h) lo = mid + 1;
    else hi = mid;
  }
  return ring[lo % ring.length].server;
}

export const clientKey = (c: number) => `client-${c}`;

export function initLb(algorithm: Algorithm = "round-robin", seed = 42): LbState {
  return {
    algorithm,
    servers: SERVER_NAMES.map((name) => ({ name, alive: true, active: [], handled: 0 })),
    rr: 0,
    seed,
    nextId: 1,
    tick: 0,
    dropped: 0,
    rejected: 0,
    last: [],
    log: [],
  };
}

const alive = (s: LbState) => s.servers.map((x, i) => (x.alive ? i : -1)).filter((i) => i >= 0);

/** Which server would the current algorithm pick for this client? (-1 if none alive) */
export function choose(s: LbState, client: number): { server: number; rr: number; why: string } {
  const live = alive(s);
  if (live.length === 0) return { server: -1, rr: s.rr, why: "no live servers" };
  if (s.algorithm === "round-robin") {
    const n = s.servers.length;
    for (let k = 0; k < n; k++) {
      const i = (s.rr + k) % n;
      if (s.servers[i].alive) return { server: i, rr: (i + 1) % n, why: `next in the cycle${k > 0 ? " (skipping dead servers)" : ""}, regardless of how busy it is` };
    }
  }
  if (s.algorithm === "least-connections") {
    let best = live[0];
    for (const i of live) if (s.servers[i].active.length < s.servers[best].active.length) best = i;
    return { server: best, rr: s.rr, why: `it has the fewest active connections (${s.servers[best].active.length})` };
  }
  const server = ringLookup(buildRing(live), clientKey(client));
  return { server, rr: s.rr, why: `hash(${clientKey(client)}) lands on its arc of the ring, so this client always goes there while the server set is unchanged` };
}

function push(s: LbState, events: LbEvent[]): LbState {
  return { ...s, last: events, log: [...events.slice().reverse(), ...s.log].slice(0, LOG_MAX) };
}

export function send(s: LbState, count = 1): LbState {
  let st = s;
  const events: LbEvent[] = [];
  for (let n = 0; n < count; n++) {
    const [r1, s1] = rand(st.seed);
    const [r2, s2] = rand(s1);
    const client = 1 + Math.floor(r1 * CLIENTS);
    // Skewed durations: most requests are short, some are long.
    const duration = r2 < 0.6 ? 1 + Math.floor(r2 * 4) : 4 + Math.floor((r2 - 0.6) * 20);
    const req: LbRequest = { id: st.nextId, client, remaining: duration, duration };
    const c = choose(st, client);
    if (c.server < 0) {
      events.push({ kind: "drop", text: `Request #${req.id} from ${clientKey(client)} failed: no live servers (503).` });
      st = { ...st, seed: s2, nextId: st.nextId + 1, rejected: st.rejected + 1 };
      continue;
    }
    const servers = st.servers.map((x, i) => (i === c.server ? { ...x, active: [...x.active, req] } : x));
    events.push({ kind: "route", server: c.server, text: `Request #${req.id} (${clientKey(client)}, ${duration} tick${duration > 1 ? "s" : ""}) → server ${SERVER_NAMES[c.server]}: ${c.why}.` });
    st = { ...st, servers, rr: c.rr, seed: s2, nextId: st.nextId + 1 };
  }
  return push(st, events);
}

export function tick(s: LbState): LbState {
  let finished = 0;
  const servers = s.servers.map((x) => {
    const active = x.active.map((r) => ({ ...r, remaining: r.remaining - 1 }));
    const done = active.filter((r) => r.remaining <= 0).length;
    finished += done;
    return { ...x, active: active.filter((r) => r.remaining > 0), handled: x.handled + done };
  });
  return push({ ...s, servers, tick: s.tick + 1 }, [{ kind: "tick", text: `Tick ${s.tick + 1}: ${finished} request${finished === 1 ? "" : "s"} finished.` }]);
}

export function kill(s: LbState, i: number): LbState {
  const victim = s.servers[i];
  if (!victim?.alive) return s;
  const lost = victim.active.length;
  const servers = s.servers.map((x, j) => (j === i ? { ...x, alive: false, active: [] } : x));
  const remap = s.algorithm === "consistent-hash" ? ` With consistent hashing only the clients whose arc belonged to ${victim.name} move; everyone else keeps their server (and any warm per-server cache).` : "";
  return push({ ...s, servers, dropped: s.dropped + lost }, [{ kind: "kill", server: i, text: `Server ${victim.name} died; ${lost} in-flight request${lost === 1 ? " was" : "s were"} lost (clients would retry). New requests skip it.${remap}` }]);
}

export function revive(s: LbState, i: number): LbState {
  if (s.servers[i]?.alive !== false) return s;
  const servers = s.servers.map((x, j) => (j === i ? { ...x, alive: true } : x));
  return push({ ...s, servers }, [{ kind: "revive", server: i, text: `Server ${s.servers[i].name} is back and receives traffic again.` }]);
}

export function setAlgorithm(s: LbState, algorithm: Algorithm): LbState {
  return { ...s, algorithm };
}

/**
 * Remove one server and count how many keys change owner.
 * Modulo: owner = liveServers[hash(key) % liveServers.length].
 * Consistent hashing: owner = ring lookup over live servers' virtual nodes.
 */
export function remapStats(nServers: number, removed: number | number[], nKeys = 1000, vnodes = VNODES) {
  const gone = Array.isArray(removed) ? removed : [removed];
  const before = Array.from({ length: nServers }, (_, i) => i);
  const after = before.filter((i) => !gone.includes(i));
  const ringB = buildRing(before, vnodes);
  const ringA = buildRing(after, vnodes);
  let modMoved = 0;
  let ringMoved = 0;
  for (let k = 0; k < nKeys; k++) {
    const key = `key-${k}`;
    const h = hash32(key);
    if (after.length === 0 || before[h % before.length] !== after[h % after.length]) modMoved++;
    if (ringLookup(ringB, key) !== ringLookup(ringA, key)) ringMoved++;
  }
  return { nKeys, modMoved, ringMoved, modFraction: modMoved / nKeys, ringFraction: ringMoved / nKeys, ideal: gone.length / nServers };
}
