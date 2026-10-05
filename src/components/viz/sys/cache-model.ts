/**
 * Cache-aside model (pure, React-free).
 *
 * - The database is the source of truth: each key holds a version number (v1, v2, ...).
 * - The cache holds copies with an expiry tick (TTL) and a "last used" tick for LRU.
 * - Reads go to the cache first; on a miss (or expired entry) the app reads the DB
 *   and populates the cache. If the cache is full, the least recently used entry is evicted.
 * - Writes always update the DB; what happens to the cache depends on the strategy.
 * - A "stale read" is a cache hit whose version differs from the DB's current version.
 */

export type WriteStrategy = "db-only" | "invalidate" | "write-through";

export type CacheEntry = { key: string; version: number; expiresAt: number; lastUsed: number };

export type CacheEventKind = "hit" | "stale-hit" | "miss" | "expired-miss" | "evict" | "expire" | "write" | "invalidate" | "write-through" | "tick" | "reset";

export type CacheEvent = { tick: number; kind: CacheEventKind; key?: string; text: string };

export type CacheState = {
  tick: number;
  ttl: number;
  capacity: number;
  strategy: WriteStrategy;
  db: Record<string, number>;
  cache: CacheEntry[];
  stats: { hits: number; misses: number; staleReads: number; evictions: number; expirations: number };
  log: CacheEvent[];
  /** Events produced by the most recent action (for narration). */
  last: CacheEvent[];
};

export const KEYS = ["user:1", "user:2", "user:3", "user:4"] as const;
const LOG_MAX = 40;

export function initCache(opts: { ttl?: number; capacity?: number; strategy?: WriteStrategy } = {}): CacheState {
  const db: Record<string, number> = {};
  for (const k of KEYS) db[k] = 1;
  return {
    tick: 0,
    ttl: opts.ttl ?? 5,
    capacity: opts.capacity ?? 3,
    strategy: opts.strategy ?? "db-only",
    db,
    cache: [],
    stats: { hits: 0, misses: 0, staleReads: 0, evictions: 0, expirations: 0 },
    log: [],
    last: [],
  };
}

function push(s: CacheState, events: CacheEvent[]): CacheState {
  return { ...s, last: events, log: [...events.slice().reverse(), ...s.log].slice(0, LOG_MAX) };
}

export const isExpired = (e: CacheEntry, tick: number) => tick >= e.expiresAt;

/** Insert/replace an entry, evicting the LRU entry if over capacity. Returns new cache and events. */
function put(s: CacheState, key: string, version: number, out: CacheEvent[]): { cache: CacheEntry[]; evictions: number } {
  let cache = s.cache.filter((e) => e.key !== key);
  let evictions = 0;
  while (cache.length >= s.capacity) {
    const lru = cache.reduce((a, b) => (b.lastUsed < a.lastUsed ? b : a));
    cache = cache.filter((e) => e !== lru);
    evictions++;
    out.push({ tick: s.tick, kind: "evict", key: lru.key, text: `Cache full (${s.capacity} entries): evicted ${lru.key}, the least recently used entry (last used at tick ${lru.lastUsed}).` });
  }
  cache = [...cache, { key, version, expiresAt: s.tick + s.ttl, lastUsed: s.tick }];
  return { cache, evictions };
}

export function read(s: CacheState, key: string): CacheState {
  const out: CacheEvent[] = [];
  const entry = s.cache.find((e) => e.key === key);
  const dbv = s.db[key];
  if (entry && !isExpired(entry, s.tick)) {
    const stale = entry.version !== dbv;
    const cache = s.cache.map((e) => (e.key === key ? { ...e, lastUsed: s.tick } : e));
    out.push(
      stale
        ? { tick: s.tick, kind: "stale-hit", key, text: `Cache HIT for ${key}, but it returned v${entry.version} while the database holds v${dbv}. This is a stale read: nothing removed the old copy, so it will be served until the TTL expires at tick ${entry.expiresAt}.` }
        : { tick: s.tick, kind: "hit", key, text: `Cache HIT for ${key}: returned v${entry.version} without touching the database. It matches the database, so it is fresh.` },
    );
    return push({ ...s, cache, stats: { ...s.stats, hits: s.stats.hits + 1, staleReads: s.stats.staleReads + (stale ? 1 : 0) } }, out);
  }
  let cacheBase = s;
  let expirations = 0;
  if (entry) {
    cacheBase = { ...s, cache: s.cache.filter((e) => e.key !== key) };
    expirations = 1;
    out.push({ tick: s.tick, kind: "expired-miss", key, text: `${key} was in the cache but its TTL ran out at tick ${entry.expiresAt}, so it counts as a MISS. The app reads v${dbv} from the database and caches it again for ${s.ttl} ticks.` });
  } else {
    out.push({ tick: s.tick, kind: "miss", key, text: `Cache MISS for ${key}: the app reads v${dbv} from the database, then stores it in the cache with a TTL of ${s.ttl} ticks (expires at tick ${s.tick + s.ttl}).` });
  }
  const { cache, evictions } = put(cacheBase, key, dbv, out);
  return push({ ...s, cache, stats: { ...s.stats, misses: s.stats.misses + 1, evictions: s.stats.evictions + evictions, expirations: s.stats.expirations + expirations } }, out);
}

export function write(s: CacheState, key: string): CacheState {
  const out: CacheEvent[] = [];
  const v = s.db[key] + 1;
  const db = { ...s.db, [key]: v };
  const cached = s.cache.find((e) => e.key === key);
  let next: CacheState = { ...s, db };
  if (s.strategy === "db-only") {
    out.push({
      tick: s.tick,
      kind: "write",
      key,
      text: cached && !isExpired(cached, s.tick)
        ? `Wrote ${key} = v${v} to the database only. The cache still holds v${cached.version}, so reads will be stale until it expires at tick ${cached.expiresAt}.`
        : `Wrote ${key} = v${v} to the database only. ${key} is not cached right now, so the next read will miss and load v${v}.`,
    });
  } else if (s.strategy === "invalidate") {
    next = { ...next, cache: s.cache.filter((e) => e.key !== key) };
    out.push({ tick: s.tick, kind: "invalidate", key, text: `Wrote ${key} = v${v} to the database, then deleted the cache key${cached ? "" : " (it was not cached)"}. The next read misses and loads the new value, so no stale read.` });
  } else {
    out.push({ tick: s.tick, kind: "write-through", key, text: `Wrote ${key} = v${v} to the database and set the cache to v${v} in the same operation (write-through). Reads stay fresh, at the cost of caching values that may never be read.` });
    const { cache, evictions } = put(next, key, v, out);
    next = { ...next, cache, stats: { ...next.stats, evictions: next.stats.evictions + evictions } };
  }
  return push(next, out);
}

export function tick(s: CacheState): CacheState {
  const t = s.tick + 1;
  const out: CacheEvent[] = [];
  const keep: CacheEntry[] = [];
  for (const e of s.cache) {
    if (isExpired(e, t)) out.push({ tick: t, kind: "expire", key: e.key, text: `${e.key} (v${e.version}) reached its TTL and was dropped from the cache.` });
    else keep.push(e);
  }
  if (out.length === 0) out.push({ tick: t, kind: "tick", text: `Clock advanced to tick ${t}. No entries expired.` });
  return push({ ...s, tick: t, cache: keep, stats: { ...s.stats, expirations: s.stats.expirations + (out[0].kind === "expire" ? out.length : 0) } }, out);
}

export function setStrategy(s: CacheState, strategy: WriteStrategy): CacheState {
  return { ...s, strategy };
}

export function setTtl(s: CacheState, ttl: number): CacheState {
  return { ...s, ttl };
}

export const hitRatio = (s: CacheState) => {
  const n = s.stats.hits + s.stats.misses;
  return n === 0 ? null : s.stats.hits / n;
};
