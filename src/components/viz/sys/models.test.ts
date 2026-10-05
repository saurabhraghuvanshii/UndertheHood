import { describe, expect, it } from "vitest";
import * as C from "./cache-model";
import * as L from "./lb-model";
import * as R from "./rate-limiter-model";
import * as B from "./circuit-breaker-model";

describe("cache-aside model", () => {
  it("serves stale reads after a DB-only write until the TTL expires", () => {
    let s = C.initCache({ ttl: 3, strategy: "db-only" });
    s = C.read(s, "user:1"); // miss, cache v1
    expect(s.stats.misses).toBe(1);
    s = C.write(s, "user:1"); // DB v2, cache still v1
    s = C.read(s, "user:1");
    expect(s.last[0].kind).toBe("stale-hit");
    expect(s.stats.staleReads).toBe(1);
    s = C.tick(C.tick(C.tick(s))); // TTL 3 → expired
    expect(s.cache.find((e) => e.key === "user:1")).toBeUndefined();
    s = C.read(s, "user:1");
    expect(s.last[0].kind).toBe("miss");
    expect(s.cache.find((e) => e.key === "user:1")?.version).toBe(2);
  });

  it("invalidation and write-through prevent stale reads", () => {
    for (const strategy of ["invalidate", "write-through"] as const) {
      let s = C.initCache({ strategy });
      s = C.read(s, "user:2");
      s = C.write(s, "user:2");
      s = C.read(s, "user:2");
      expect(s.stats.staleReads).toBe(0);
      expect(s.last.some((e) => e.kind === "stale-hit")).toBe(false);
    }
  });

  it("evicts the least recently used entry at capacity", () => {
    let s = C.initCache({ capacity: 3, ttl: 10 });
    s = C.read(s, "user:1");
    s = C.tick(s);
    s = C.read(s, "user:2");
    s = C.tick(s);
    s = C.read(s, "user:3");
    s = C.tick(s);
    s = C.read(s, "user:1"); // touch 1 → 2 is now LRU
    s = C.read(s, "user:4");
    expect(s.stats.evictions).toBe(1);
    expect(s.cache.map((e) => e.key).sort()).toEqual(["user:1", "user:3", "user:4"]);
    expect(s.last.some((e) => e.kind === "evict" && e.key === "user:2")).toBe(true);
    expect(C.hitRatio(s)).toBeCloseTo(1 / 5);
  });
});

describe("load balancer model", () => {
  it("round robin spreads requests evenly", () => {
    let s = L.initLb("round-robin");
    s = L.send(s, 12);
    expect(s.servers.map((x) => x.active.length)).toEqual([3, 3, 3, 3]);
  });

  it("round robin skips dead servers", () => {
    let s = L.kill(L.initLb("round-robin"), 1);
    s = L.send(s, 6);
    expect(s.servers.map((x) => x.active.length)).toEqual([2, 0, 2, 2]);
  });

  it("least connections picks the least busy live server", () => {
    let s = L.initLb("least-connections");
    s = L.send(s, 4); // one each
    s = { ...s, servers: s.servers.map((x, i) => (i === 2 ? { ...x, active: [] } : x)) };
    expect(L.choose(s, 1).server).toBe(2);
  });

  it("consistent hashing is sticky per client", () => {
    const s = L.initLb("consistent-hash");
    expect(L.choose(s, 7).server).toBe(L.choose(s, 7).server);
  });

  it("consistent hashing remaps about 1/N keys; modulo remaps most", () => {
    const r = L.remapStats(4, 2, 2000);
    expect(r.ringFraction).toBeGreaterThan(0.1);
    expect(r.ringFraction).toBeLessThan(0.4);
    expect(r.modFraction).toBeGreaterThan(0.6);
  });
});

describe("token bucket model", () => {
  it("allows a burst up to capacity, then rejects with Retry-After", () => {
    let s = R.initRl(5, 1);
    s = R.burst(s, 8);
    const last = s.requests.slice(-8);
    expect(last.filter((r) => r.allowed)).toHaveLength(5);
    expect(last.filter((r) => !r.allowed).every((r) => r.retryAfter === 1)).toBe(true);
    expect(s.tokens).toBe(0);
  });

  it("refills per tick, capped at capacity", () => {
    let s = R.burst(R.initRl(10, 2), 10);
    s = R.tick(s);
    expect(s.tokens).toBe(2);
    s = R.tick(s, 20);
    expect(s.tokens).toBe(10);
  });

  it("computes Retry-After from fractional refill", () => {
    expect(R.retryAfter(0, 0.5)).toBe(2);
    expect(R.retryAfter(0.5, 0.5)).toBe(1);
    expect(R.retryAfter(0, 2)).toBe(1);
  });

  it("fixed window allows ~2x the limit across a boundary; bucket does not", () => {
    const s = R.boundaryDemo(10, 1);
    const reqs = s.requests.slice(-20);
    expect(reqs.filter((r) => r.fwAllowed)).toHaveLength(20);
    expect(reqs.filter((r) => r.allowed)).toHaveLength(11);
  });
});

describe("circuit breaker model", () => {
  it("closed → open → half-open → closed", () => {
    let s = B.initCb("failing");
    for (let i = 0; i < 3; i++) s = B.send(s);
    expect(s.state).toBe("CLOSED"); // below MIN_CALLS
    s = B.send(s);
    expect(s.state).toBe("OPEN");
    s = B.send(s);
    expect(s.calls.at(-1)?.outcome).toBe("short-circuit");
    expect(s.stats.shortCircuited).toBe(1);
    for (let i = 0; i < B.COOLDOWN; i++) s = B.tick(s);
    expect(s.state).toBe("HALF_OPEN");
    s = B.setHealth(s, "healthy");
    s = B.send(s);
    expect(s.state).toBe("HALF_OPEN");
    s = B.send(s);
    expect(s.state).toBe("CLOSED");
    expect(s.window).toEqual([]);
  });

  it("half-open → open on a failed probe (timeouts count as failures)", () => {
    let s = B.initCb("slow");
    s = B.sendMany(s, 4);
    expect(s.state).toBe("OPEN");
    for (let i = 0; i < B.COOLDOWN; i++) s = B.tick(s);
    expect(s.state).toBe("HALF_OPEN");
    s = B.send(s);
    expect(s.state).toBe("OPEN");
    expect(s.openedAt).toBe(s.tick);
  });

  it("stays closed when failures are under 50%", () => {
    let s = B.initCb("healthy");
    s = B.sendMany(s, 4);
    s = B.setHealth(s, "failing");
    s = B.sendMany(s, 2); // 2 of 6 failed
    expect(s.state).toBe("CLOSED");
    s = B.send(s); // window: ok ok ok fail fail fail → 50%
    expect(s.state).toBe("OPEN");
  });
});
