import type { Lesson, SourceRef, Track } from "../types";

/**
 * Backend engineering track: caching with Redis, API styles, serialization,
 * authentication and browser security, async delivery (webhooks + DLQs) and
 * a few platform topics from the learner's study list.
 */

const redisDocs: SourceRef = { label: "Redis documentation", url: "https://redis.io/docs/latest/", kind: "docs" };
const owaspCsrf: SourceRef = {
  label: "OWASP Cross-Site Request Forgery Prevention Cheat Sheet",
  url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html",
  kind: "docs",
};
const owaspSession: SourceRef = {
  label: "OWASP Session Management Cheat Sheet",
  url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html",
  kind: "docs",
};
const owaspJwt: SourceRef = {
  label: "OWASP JSON Web Token Cheat Sheet",
  url: "https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html",
  kind: "docs",
};
const rfc7519: SourceRef = { label: "RFC 7519 — JSON Web Token (JWT)", url: "https://datatracker.ietf.org/doc/html/rfc7519", kind: "docs" };
const rfc8725: SourceRef = { label: "RFC 8725 — JWT Best Current Practices", url: "https://datatracker.ietf.org/doc/html/rfc8725", kind: "docs" };

export const track: Track = {
  slug: "backend",
  title: "Backend engineering",
  tagline: "Redis, API styles, auth and sessions, CSRF, webhooks with dead-letter queues and the wire formats in between.",
  description:
    "The building blocks of a production backend: what Redis really does (and why it is single-threaded where it matters), how REST, GraphQL, gRPC and tRPC differ, how bytes become objects, how authentication actually works with JWTs and sessions, why CSRF exists, and how to deliver webhooks reliably with retries and a dead-letter queue. Ends with a few platform topics from the learner's study list.",
  modules: [
    {
      id: "backend-caching",
      title: "Caching and in-memory data",
      summary: "Redis data structures, caching patterns, rate limiting, persistence and its execution model.",
      lessons: ["redis"],
    },
    {
      id: "backend-apis",
      title: "APIs and wire formats",
      summary: "REST vs GraphQL vs gRPC vs tRPC, the N+1 problem and DataLoader, serialization formats and two server frameworks.",
      lessons: ["rest-graphql-grpc-trpc", "serialization", "fastapi", "express-vs-feathers"],
    },
    {
      id: "backend-security",
      title: "Authentication and API security",
      summary: "JWTs vs server sessions, refresh tokens, device sessions, CSRF, single sign-on and API keys.",
      lessons: ["authentication-jwt-sessions", "csrf", "single-sign-on", "api-key-security"],
    },
    {
      id: "backend-async",
      title: "Asynchronous delivery",
      summary: "Webhooks, retries with backoff, dead-letter queues and transactional email verification.",
      lessons: ["webhooks-dlq", "email-verification-services"],
    },
    {
      id: "backend-platforms",
      title: "Platforms from the study list",
      summary: "Outlines for Chrome extensions, WordPress on the LAMP stack and Google Apps Script.",
      lessons: ["chrome-extension-internals", "wordpress-lamp-stack", "google-apps-script"],
    },
  ],
  milestones: [
    {
      id: "be-redis-cache-layer",
      title: "Caching layer with Redis",
      summary: "Put a cache-aside layer and a rate limiter in front of a slow endpoint and measure the effect.",
      level: "intermediate",
      requirements: [
        "Cache-aside reads with a TTL and explicit invalidation on writes",
        "Protect against stampedes (single-flight lock or probabilistic early refresh)",
        "A per-client rate limiter implemented atomically (Lua script or a single INCR+EXPIRE pattern)",
        "Report hit ratio and p95 latency before/after",
      ],
      stretch: ["Use client-side caching (CLIENT TRACKING) for a hot key", "Compare RDB vs AOF recovery after a crash"],
      exercises: ["backend/redis", "system-design/caching-strategies", "system-design/cache-invalidation", "system-design/rate-limiting"],
    },
    {
      id: "be-auth-service",
      title: "Session + token auth service",
      summary: "Implement login with short-lived access tokens, rotating refresh tokens and per-device session revocation.",
      level: "intermediate",
      requirements: [
        "Access JWT (≤15 min) verified with a pinned algorithm; refresh token stored hashed server-side",
        "Refresh-token rotation with reuse detection that revokes the whole token family",
        "List and revoke sessions per device",
        "Cookies set with HttpOnly, Secure, SameSite and a CSRF defence for cookie-authenticated mutations",
      ],
      stretch: ["Add OIDC login with an external identity provider"],
      exercises: ["backend/authentication-jwt-sessions", "backend/csrf", "system-design/authn-authz"],
    },
    {
      id: "be-webhook-worker",
      title: "Webhook delivery worker with DLQ",
      summary: "Deliver signed webhooks with retries, exponential backoff with jitter and a dead-letter queue plus replay.",
      level: "advanced",
      requirements: [
        "Outbox table or queue feeding a bounded worker pool",
        "HMAC-SHA256 signatures with timestamp to prevent replay",
        "Exponential backoff with jitter and a max-attempts cap; then move to a DLQ",
        "A replay command for DLQ messages and an idempotency key per event",
      ],
      stretch: ["Per-endpoint circuit breaker so one dead receiver doesn't starve others"],
      exercises: ["backend/webhooks-dlq", "go/worker-pool", "distributed/idempotency-patterns", "system-design/delivery-semantics"],
    },
  ],
  sources: [
    redisDocs,
    { label: "GraphQL — Learn", url: "https://graphql.org/learn/", kind: "docs" },
    { label: "graphql/dataloader (GitHub)", url: "https://github.com/graphql/dataloader", kind: "external" },
    { label: "gRPC documentation", url: "https://grpc.io/docs/", kind: "docs" },
    { label: "tRPC documentation", url: "https://trpc.io/docs", kind: "docs" },
    { label: "Protocol Buffers documentation", url: "https://protobuf.dev/", kind: "docs" },
    rfc7519,
    rfc8725,
    owaspSession,
    owaspCsrf,
    { label: "MDN — Set-Cookie (SameSite)", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie", kind: "docs" },
    { label: "Standard Webhooks specification", url: "https://www.standardwebhooks.com/", kind: "external" },
    { label: "FastAPI documentation", url: "https://fastapi.tiangolo.com/", kind: "docs" },
  ],
};

/** Compact builder for outline lessons (structure + objectives + sources; deep content still to be written). */
function outline(o: {
  slug: string;
  title: string;
  summary: string;
  level: Lesson["level"];
  frequency: Lesson["frequency"];
  minutes: number;
  prerequisites: string[];
  related: string[];
  tags: string[];
  sources: SourceRef[];
  objectives: string[];
  covers: string[];
}): Lesson {
  return {
    slug: o.slug,
    track: "backend",
    title: o.title,
    summary: o.summary,
    level: o.level,
    frequency: o.frequency,
    minutes: o.minutes,
    kinds: ["theory"],
    status: "outline",
    prerequisites: o.prerequisites,
    related: o.related,
    tags: o.tags,
    sources: o.sources,
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: o.objectives }] },
      { id: "summary", title: "What this lesson will cover", blocks: [{ type: "list", items: o.covers }] },
    ],
  };
}

export const lessons: Lesson[] = [
  // ───────────────────────────────────────────────────────────── redis
  {
    slug: "redis",
    track: "backend",
    title: "Redis: data structures, caching, rate limiting and persistence",
    summary:
      "What Redis is under the hood: an in-memory data-structure server with single-threaded command execution, used for caching, rate limiting, queues and leaderboards — plus how it persists data with RDB and AOF.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 45,
    kinds: ["theory", "visualization", "coding"],
    status: "authored",
    prerequisites: ["system-design/caching-strategies", "networks/tcp"],
    related: [
      "system-design/cache-invalidation",
      "system-design/rate-limiting",
      "os/processes-threads",
      "os/virtual-memory",
      "databases/connection-pooling",
    ],
    tags: ["redis", "cache", "rate-limiting", "persistence", "rdb", "aof", "event-loop"],
    sources: [
      redisDocs,
      { label: "Redis data types", url: "https://redis.io/docs/latest/develop/data-types/", kind: "docs" },
      { label: "Redis persistence (RDB and AOF)", url: "https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/", kind: "docs" },
      { label: "Client-side caching in Redis", url: "https://redis.io/docs/latest/develop/reference/client-side-caching/", kind: "docs" },
      { label: "Key eviction", url: "https://redis.io/docs/latest/develop/reference/eviction/", kind: "docs" },
      { label: "Scripting with Lua (EVAL)", url: "https://redis.io/docs/latest/develop/interact/programmability/eval-intro/", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Pick the right Redis data structure (string, hash, list, set, sorted set, stream) for a problem.",
              "Explain why Redis executes commands on one thread and what Redis 6 I/O threads changed (and did not change).",
              "Implement cache-aside with TTLs and avoid stampedes.",
              "Build an atomic rate limiter with INCR/EXPIRE or a Lua script.",
              "Compare RDB snapshots and the AOF, and choose an fsync policy.",
              "Describe client-side caching with CLIENT TRACKING.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Think of Redis as a giant shared dictionary that lives in RAM on another machine. Instead of only storing strings, each value can be a real data structure — a list, a set, a sorted set — and the server offers atomic operations on it (`LPUSH`, `SADD`, `ZINCRBY`). Because everything is in memory and one thread applies the commands in order, each operation takes microseconds and never interleaves with another.",
          },
          {
            type: "p",
            text: "That makes Redis the default answer for 'I need something faster than my database that many app servers can share': caches, sessions, counters, rate limits, leaderboards, simple queues and distributed locks.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "**Redis** is an in-memory key–value store whose values are typed data structures. Clients speak the RESP protocol over TCP. Data can optionally be persisted to disk (RDB snapshots and/or an append-only file) and replicated to replicas.",
          },
          {
            type: "table",
            head: ["Type", "Typical commands", "Use it for"],
            rows: [
              ["String", "`GET`, `SET … EX`, `INCR`, `SETNX`", "Cached blobs, counters, simple locks"],
              ["Hash", "`HSET`, `HGET`, `HINCRBY`", "Objects with fields (user profile, session)"],
              ["List", "`LPUSH`, `RPOP`, `BLMOVE`", "Simple queues, recent-items feeds"],
              ["Set", "`SADD`, `SISMEMBER`, `SINTER`", "Uniqueness, tags, 'who liked this'"],
              ["Sorted set", "`ZADD`, `ZRANGE … BYSCORE`, `ZINCRBY`", "Leaderboards, sliding-window rate limits, priority/delay queues"],
              ["Stream", "`XADD`, `XREADGROUP`, `XACK`", "Append-only log with consumer groups"],
              ["Bitmap / HyperLogLog", "`SETBIT`, `PFADD`, `PFCOUNT`", "Daily-active flags, approximate unique counts"],
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "**Latency:** a RAM lookup over a LAN is typically sub-millisecond, versus milliseconds for a disk-backed query with joins.",
              "**Shared state:** stateless app servers behind a load balancer need one place for sessions, counters and locks.",
              "**Atomic primitives:** `INCR`, `SET NX`, `ZADD` and Lua scripts give you race-free read-modify-write without database transactions.",
              "**Offloading:** absorbing hot reads in Redis protects the primary database (see caching strategies).",
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "p",
            text: "Redis runs an **event loop** (its own small library, `ae`, on top of epoll/kqueue). One main thread accepts connections, reads requests, executes each command to completion, and queues replies. Because only that thread touches the dataset, there are no locks around data structures and every single command is atomic.",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Redis 6 'threaded I/O' is not multi-threaded execution",
            text: "Redis 6.0 added optional I/O threads (`io-threads` in redis.conf) that parallelise reading from and writing to sockets and parsing. **Command execution remains single-threaded.** Redis also uses background threads for things like `UNLINK`/lazy freeing, closing files and AOF fsync. Forks such as KeyDB and Dragonfly take different, multi-threaded approaches — that is their design, not Redis's.",
          },
          {
            type: "steps",
            steps: [
              { title: "Read", detail: "The event loop sees a readable socket, reads bytes into the client's query buffer (possibly on an I/O thread in 6.0+)." },
              { title: "Parse", detail: "RESP is parsed into an argv array: `[\"INCR\", \"hits\"]`." },
              { title: "Execute", detail: "The main thread looks up the command table and runs it against the in-memory dictionary. Nothing else runs meanwhile." },
              { title: "Reply", detail: "The reply is appended to the client's output buffer and written when the socket is writable." },
              { title: "Propagate", detail: "Write commands are appended to the AOF buffer (if enabled) and streamed to replicas." },
            ],
          },
          {
            type: "p",
            text: "**Memory encodings.** Small hashes, lists, sets and sorted sets use compact encodings (listpack, intset) and convert to hash tables / skiplists as they grow. A sorted set is a skiplist plus a hash table, which is why `ZADD` and `ZRANK` are O(log N) while `ZSCORE` is O(1).",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Encodings are version-specific",
            text: "Redis 7.0 replaced ziplist with listpack as the compact encoding; thresholds such as `hash-max-listpack-entries` are configurable. Check `OBJECT ENCODING key` on your own server rather than memorising internals.",
          },
          {
            type: "p",
            text: "**Expiry** is enforced two ways: lazily (a key is checked when accessed) and actively (a periodic job samples keys with TTLs and deletes expired ones). **Eviction** happens only when `maxmemory` is reached; the policy (`noeviction` by default, or `allkeys-lru`, `allkeys-lfu`, `volatile-ttl`, …) picks victims using an approximated LRU/LFU based on sampling, not a perfect global ordering.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: persistence with RDB and AOF",
        blocks: [
          {
            type: "compare",
            items: [
              {
                title: "RDB snapshot",
                points: [
                  "Point-in-time compact binary dump (`dump.rdb`).",
                  "`BGSAVE` calls `fork()`; the child writes the snapshot while the parent keeps serving. Copy-on-write means only pages modified during the save are duplicated.",
                  "Fast restarts, good for backups.",
                  "You can lose everything written since the last snapshot.",
                ],
              },
              {
                title: "AOF (append-only file)",
                points: [
                  "Logs every write command; replayed on restart.",
                  "`appendfsync always` (safest, slowest), `everysec` (default — lose ≤ ~1 s), `no` (OS decides).",
                  "Grows over time; a background rewrite compacts it.",
                  "Usually combined with an RDB preamble for faster loading.",
                ],
              },
            ],
          },
          {
            type: "callout",
            tone: "warning",
            title: "fork() and memory",
            text: "A write-heavy instance doing `BGSAVE` can temporarily need much more RAM because of copy-on-write page duplication. Leave headroom and watch for Linux transparent huge pages, which make each copied page larger. See virtual memory.",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "Since Redis 7.0 the AOF is split into a base file plus incremental files tracked by a manifest (multi-part AOF). Older versions used a single file. Behaviour of rewrites differs accordingly.",
          },
        ],
      },
      {
        id: "visualization",
        blocks: [
          { type: "viz", id: "sys-cache", caption: "Cache-aside: miss → read DB → populate with TTL; writes invalidate the key." },
          { type: "viz", id: "sys-rate-limiter", caption: "Token bucket: tokens refill at a fixed rate; each request spends one or is rejected." },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "text",
            caption: "redis-cli session: strings, TTLs, counters and a sorted-set leaderboard",
            code: `127.0.0.1:6379> SET user:42 "{\\"name\\":\\"Ada\\"}" EX 60
OK
127.0.0.1:6379> GET user:42
"{\\"name\\":\\"Ada\\"}"
127.0.0.1:6379> INCR page:home:views
(integer) 1
127.0.0.1:6379> INCR page:home:views
(integer) 2
127.0.0.1:6379> ZADD leaderboard 120 alice 95 bob 180 carol
(integer) 3
127.0.0.1:6379> ZREVRANGE leaderboard 0 1 WITHSCORES
1) "carol"
2) "180"
3) "alice"
4) "120"
127.0.0.1:6379> SET lock:invoice:7 worker-a NX PX 30000
OK
127.0.0.1:6379> SET lock:invoice:7 worker-b NX PX 30000
(nil)`,
          },
          {
            type: "code",
            lang: "ts",
            caption: "Cache-aside with a TTL (node-redis v4 style; db.getUser is your own function)",
            code: `async function getUser(id: string) {
  const key = "user:" + id;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);           // hit

  const user = await db.getUser(id);              // miss → source of truth
  // jittered TTL so many keys don't expire at the same instant
  const ttl = 300 + Math.floor(Math.random() * 60);
  await redis.set(key, JSON.stringify(user), { EX: ttl });
  return user;
}

async function updateUser(id: string, patch: object) {
  await db.updateUser(id, patch);
  await redis.del("user:" + id);                  // invalidate after the write
}`,
          },
          {
            type: "code",
            lang: "text",
            caption: "Fixed-window rate limiter as a Lua script (atomic: runs as one command)",
            code: `-- KEYS[1] = "rl:{client}:{window}"   ARGV[1] = limit   ARGV[2] = window seconds
local n = redis.call("INCR", KEYS[1])
if n == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[2])
end
if n > tonumber(ARGV[1]) then
  return 0   -- reject
end
return 1     -- allow`,
          },
          {
            type: "p",
            text: "Why a script? Doing `INCR` and then `EXPIRE` as two round trips risks a crash in between, leaving a counter that never expires. A Lua script executes atomically on the single command thread. A sliding window can be built with a sorted set: `ZREMRANGEBYSCORE` old timestamps, `ZADD` now, `ZCARD` to count. See rate limiting.",
          },
          {
            type: "p",
            text: "**Client-side caching (Redis 6+).** A client sends `CLIENT TRACKING ON`; the server remembers which keys that connection read and pushes an invalidation message (RESP3 push, or via a redirected Pub/Sub connection in RESP2) when any of them change. In `BCAST` mode the server instead broadcasts invalidations for key prefixes the client subscribed to. This lets app servers keep a tiny in-process cache of very hot keys without serving stale data for long.",
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Cache stampede:** a hot key expires and thousands of requests hit the DB at once. Mitigate with a short lock (`SET NX`) so one request rebuilds, jittered TTLs, or early probabilistic refresh.",
              "**Slow commands block everyone:** `KEYS *`, `SMEMBERS` on a huge set, or a long Lua script freeze the single execution thread. Use `SCAN`, paginate, and check `SLOWLOG GET`.",
              "**Big keys:** deleting a 10-million-element set with `DEL` blocks; `UNLINK` frees memory on a background thread.",
              "**Replication is asynchronous:** a write acknowledged by the primary can be lost on failover. `WAIT` reduces but does not eliminate the window.",
              "**Locks with `SET NX PX` are leases:** if your work outlives the TTL, another worker gets the lock. Store a unique token and release with a compare-and-delete script.",
              "**Cluster mode:** multi-key commands and Lua scripts must touch keys in the same hash slot; use hash tags like `{user:42}:profile`.",
            ],
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "callout",
            tone: "misconception",
            title: "\"Redis is multi-threaded since version 6\"",
            text: "Only network I/O can be threaded. Commands still run one at a time on the main thread, which is exactly why `INCR` and Lua scripts are atomic without locks.",
          },
          {
            type: "list",
            items: [
              "Using Redis as the only copy of important data with default (or no) persistence.",
              "Caching without TTLs and without an invalidation plan — stale data forever.",
              "Leaving `maxmemory-policy` at `noeviction` on a pure cache: writes start failing with OOM errors instead of evicting.",
              "Opening a new connection per request instead of reusing a client/pool.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Choice", "Gain", "Cost"],
            rows: [
              ["Cache in Redis vs in-process", "Shared across instances, survives deploys", "Network hop, serialization cost"],
              ["AOF `always`", "Near-zero data loss", "fsync on every write — much lower throughput"],
              ["AOF `everysec`", "Good throughput", "Up to ~1 s of writes lost on crash"],
              ["RDB only", "Small files, fast restart", "Lose minutes of data"],
              ["Lua script", "Atomic multi-step logic", "Blocks the server while it runs; keep it short"],
            ],
          },
        ],
      },
      {
        id: "real-world",
        blocks: [
          {
            type: "list",
            items: [
              "Session stores for web apps (hash per session with TTL).",
              "API gateways use Redis counters for per-key rate limits.",
              "Leaderboards and 'top N' feeds with sorted sets.",
              "Background job libraries (Sidekiq, BullMQ) build queues on lists, sorted sets and streams.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Redis is an in-memory data-structure store. It is fast because data is in RAM, its structures have good complexity, and one thread executes commands so there is no lock contention — Redis 6 added I/O threads for sockets but execution is still single-threaded, which is why every command and Lua script is atomic. I use it for cache-aside with TTLs, rate limiting with INCR/EXPIRE in a Lua script or sorted sets, sessions and leaderboards. For durability it has RDB snapshots via fork and copy-on-write, and an AOF with fsync every second by default.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Explain the event loop and why a single slow command hurts p99 for all clients.",
              "Walk through cache-aside vs write-through, and how you'd handle stampedes and invalidation races (delete-after-write, short TTLs).",
              "Compare fixed window, sliding log (sorted set) and token bucket rate limiting; mention atomicity.",
              "Discuss persistence: RDB fork + COW memory spike, AOF fsync policies and rewrite.",
              "Mention replication is async and Sentinel/Cluster handle failover; acknowledged writes can be lost.",
            ],
          },
        ],
      },
      {
        id: "practice",
        blocks: [
          {
            type: "list",
            ordered: true,
            items: [
              "Build a sliding-window limiter with a sorted set and prove it's atomic using `MULTI`/`EXEC` or Lua.",
              "Measure `SET`/`GET` throughput with `redis-benchmark`, then run a `KEYS *` on a million keys and watch latency for other clients.",
              "Kill Redis with `appendfsync everysec` during a write loop and count how many writes were lost.",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Typed data structures in RAM + one execution thread = microsecond atomic operations.",
              "I/O threads (6.0+) parallelise sockets, not commands.",
              "Cache-aside with jittered TTLs and invalidate-on-write; guard against stampedes.",
              "Rate limit atomically (Lua or sorted sets).",
              "RDB = snapshots via fork; AOF = command log with fsync policy; replication is async.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "RESP", definition: "Redis Serialization Protocol, the text-based request/response protocol clients use. RESP3 (Redis 6+) adds push messages and richer types." },
      { term: "Cache-aside", definition: "The application checks the cache first, reads the database on a miss and populates the cache itself." },
      { term: "TTL", definition: "Time to live: seconds until a key expires automatically." },
      { term: "RDB", definition: "Redis Database file — a point-in-time binary snapshot." },
      { term: "AOF", definition: "Append-only file — a log of write commands replayed on restart." },
      { term: "Copy-on-write", definition: "After fork(), parent and child share memory pages; a page is copied only when one side writes to it." },
      { term: "Eviction policy", definition: "The rule Redis uses to delete keys when maxmemory is reached (e.g. allkeys-lru)." },
      { term: "Cache stampede", definition: "Many concurrent requests missing the same expired key and all hitting the backing store." },
    ],
    followUps: [
      { q: "If Redis is single-threaded, how does it use multiple cores?", a: "Run several instances (Redis Cluster shards keys across them), enable I/O threads for socket work, and rely on background threads for fsync and lazy freeing. A single instance's command execution still uses one core." },
      { q: "How do you invalidate a cache safely when the DB is updated?", a: "Write to the DB first, then delete the cache key (not update it), and keep TTLs as a safety net. Deleting avoids racing writers storing stale values; a small delay-double-delete or CDC-driven invalidation handles remaining races." },
      { q: "Is a Redis lock safe for correctness-critical work?", a: "A single-instance `SET NX PX` lock is a lease that can expire mid-work or be lost on failover. For correctness, pair it with fencing tokens checked by the resource, or use a system built on consensus." },
      { q: "MULTI/EXEC vs Lua?", a: "MULTI/EXEC queues commands and runs them atomically but can't branch on intermediate results (WATCH gives optimistic concurrency). Lua can read, decide and write in one atomic step." },
    ],
    quiz: [
      {
        id: "redis-q1",
        prompt: "What did Redis 6.0's `io-threads` feature change?",
        options: [
          "Commands now execute in parallel on all cores",
          "Socket reads/writes and parsing can use extra threads; command execution stays single-threaded",
          "Lua scripts run on a separate thread",
          "Persistence moved to a separate process",
        ],
        answer: 1,
        explanation: "I/O threads offload network work. The dataset is still only mutated by the main thread, preserving per-command atomicity.",
      },
      {
        id: "redis-q2",
        prompt: "Why implement `INCR` + `EXPIRE` rate limiting in a Lua script instead of two separate calls?",
        options: [
          "Lua is faster than C",
          "So the counter and its expiry are set atomically; a crash between calls can't leave an immortal key",
          "EXPIRE is not available outside Lua",
          "To use multiple threads",
        ],
        answer: 1,
        explanation: "A script runs as one atomic unit on the command thread, so no other client and no partial failure can interleave between the two steps.",
      },
      {
        id: "redis-q3",
        prompt: "With `appendfsync everysec`, roughly how much acknowledged data can be lost if the machine loses power?",
        options: ["None", "About one second of writes", "Everything since the last RDB snapshot", "Only the last command"],
        answer: 1,
        explanation: "The AOF is fsynced about once per second in the background, so up to ~1 s of writes may not have reached disk.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── authentication-jwt-sessions
  {
    slug: "authentication-jwt-sessions",
    track: "backend",
    title: "Authentication: JWTs, sessions, refresh tokens and devices",
    summary:
      "How a server remembers who you are: server-side sessions vs JWTs, what is actually inside a JWT, the classic JWT vulnerabilities, refresh-token rotation, and managing sessions per device.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 50,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["networks/http", "system-design/authn-authz"],
    related: ["backend/csrf", "backend/single-sign-on", "backend/redis", "networks/tls-handshake", "networks/cors"],
    tags: ["auth", "jwt", "sessions", "cookies", "refresh-token", "security"],
    sources: [
      rfc7519,
      rfc8725,
      { label: "RFC 7515 — JSON Web Signature (JWS)", url: "https://datatracker.ietf.org/doc/html/rfc7515", kind: "docs" },
      { label: "OAuth 2.0 Security Best Current Practice (RFC 9700)", url: "https://datatracker.ietf.org/doc/html/rfc9700", kind: "docs" },
      owaspSession,
      owaspJwt,
      { label: "Auth0 — Critical vulnerabilities in JSON Web Token libraries (2015)", url: "https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/", kind: "external" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Distinguish authentication (who are you) from authorization (what may you do).",
              "Explain stateful sessions vs stateless tokens and when each fits.",
              "Decode a JWT by hand and explain why its payload is not secret.",
              "Recognise `alg: none`, HS/RS algorithm confusion and missing claim checks.",
              "Design short-lived access tokens with rotating refresh tokens and reuse detection.",
              "Model per-device sessions, concurrent-session limits and 'log out everywhere'.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "HTTP is stateless: each request arrives with no memory of the last. After you log in, the server must hand you something you present on every request. There are two families of 'somethings'.",
          },
          {
            type: "compare",
            items: [
              { title: "Session (coat-check ticket)", points: ["You get a random ticket number.", "The server keeps the coat (your session data) in its store.", "To revoke, the server throws the coat away."] },
              { title: "JWT (signed ID card)", points: ["You carry a card listing your claims, stamped by the server.", "Any server with the key can check the stamp without looking anything up.", "The card is valid until it expires — hard to take back."] },
            ],
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "A **session** is server-side state keyed by an unguessable **session ID** sent to the client, usually in a cookie. A **JSON Web Token (JWT, RFC 7519)** is a compact, URL-safe set of claims. In practice almost every JWT is a **JWS**: `base64url(header).base64url(payload).base64url(signature)`. The signature proves integrity and origin; it does **not** hide the payload.",
          },
          {
            type: "table",
            head: ["Claim", "Meaning", "Must you check it?"],
            rows: [
              ["`iss`", "Issuer", "Yes — reject tokens from other issuers"],
              ["`aud`", "Intended audience (your API)", "Yes — prevents token reuse across services"],
              ["`exp` / `nbf`", "Expiry / not-before (seconds since epoch)", "Yes, with small clock-skew leeway"],
              ["`sub`", "Subject (user id)", "Used to identify the user"],
              ["`iat`, `jti`", "Issued-at, unique token id", "Useful for revocation lists and replay checks"],
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "**Sessions** give instant revocation and keep data off the client, at the cost of a lookup (often Redis) per request.",
              "**JWTs** let many services verify identity without a shared store — useful across microservices and third parties — at the cost of hard revocation and bigger requests.",
              "Most real systems combine both: a short-lived JWT access token plus a long-lived, server-tracked refresh token (which is effectively a session).",
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Header", detail: "`{\"alg\":\"RS256\",\"typ\":\"JWT\",\"kid\":\"2026-key-1\"}` — names the signing algorithm and which key." },
              { title: "Payload", detail: "Claims JSON, base64url-encoded (not encrypted)." },
              { title: "Signing input", detail: "The ASCII string `base64url(header) + \".\" + base64url(payload)`." },
              { title: "Signature", detail: "HS256 = HMAC-SHA256 with a shared secret. RS256/ES256 = sign with a private key, verify with the public key (published as a JWKS)." },
              { title: "Verification", detail: "Recompute/verify the signature using the algorithm **your server expects**, then validate `exp`, `nbf`, `iss`, `aud`." },
            ],
          },
          {
            type: "callout",
            tone: "warning",
            title: "Classic JWT vulnerabilities",
            text: "**`alg: none`** — the spec allows unsigned tokens; libraries that trusted the header accepted forged tokens with an empty signature. **HS/RS confusion** — a server expecting RS256 verifies with its *public* key; if the library lets the token's header choose HS256, an attacker HMAC-signs a forged token using that public key (which is public!) as the secret, and verification passes. The fix for both: pin the allowed algorithm(s) per key on the server, never read it from the token.",
          },
          {
            type: "list",
            items: [
              "**`kid` / `jku` injection:** don't let header fields fetch keys from arbitrary URLs or file paths; map `kid` to a known key set.",
              "**Weak HMAC secrets** can be brute-forced offline from any captured token — use ≥256 random bits.",
              "**Sensitive data in the payload** is readable by anyone who sees the token.",
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Library defaults vary",
            text: "Modern libraries (e.g. `jose`, recent `jsonwebtoken`) reject `none` by default and require an explicit algorithm list, but older versions and other languages differed. RFC 8725 (JWT BCP) says verifiers must restrict algorithms. Always pass `algorithms: [\"RS256\"]` (or equivalent) explicitly.",
          },
          {
            type: "p",
            text: "**Refresh tokens.** The access token lives minutes; the refresh token (opaque random string, stored *hashed* in the database with user, device and family id) lives days. On refresh, the server issues a new access token **and a new refresh token**, invalidating the old one (*rotation*). If an already-used refresh token shows up again, someone stole it: revoke the whole family and force re-login (*reuse detection*, recommended by the OAuth 2.0 Security BCP).",
          },
          {
            type: "p",
            text: "**Devices and concurrent sessions.** Model a `sessions` table: `id`, `user_id`, `device_id` (a random id the client generates once and stores), `user_agent`, `ip`, `created_at`, `last_seen_at`, `refresh_token_hash`, `revoked_at`. Listing rows gives 'your devices'; revoking a row kills that device's refresh token; limiting rows per user enforces 'max 3 concurrent sessions'. For instant 'log out everywhere' with JWTs, store a `token_version` on the user and embed it in tokens — bump it to invalidate all outstanding access tokens on the next check.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: login → refresh → theft detection",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Login", detail: "Password (or SSO) verified. Server creates session row S1 for device D, refresh token R1 (hash stored), access JWT A1 (exp 15 min)." },
              { title: "API calls", detail: "Client sends `Authorization: Bearer A1`. API verifies signature + claims with no DB lookup." },
              { title: "Refresh", detail: "After 15 min, client posts R1 to `/auth/refresh`. Server finds hash(R1) in S1, marks R1 used, issues A2 + R2." },
              { title: "Theft", detail: "An attacker who copied R1 earlier posts it. Server sees R1 already used → revokes family S1 (R2 too). Both parties must log in again; the legitimate user notices." },
              { title: "Logout", detail: "Delete/revoke S1. A2 still works until it expires (≤15 min) unless you also check a denylist or token_version." },
            ],
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "js",
            runnable: true,
            caption: "Anyone can read a JWT's header and payload — no key needed",
            code: `const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
  ".eyJzdWIiOiI0MiIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzY3MjI1NjAwfQ" +
  ".c2lnbmF0dXJlLWJ5dGVzLWdvLWhlcmU";

function b64urlDecode(part) {
  const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  return atob(padded);
}

const [h, p] = token.split(".");
console.log(b64urlDecode(h));
console.log(b64urlDecode(p));
console.log(new Date(JSON.parse(b64urlDecode(p)).exp * 1000).toISOString());`,
            output: `{"alg":"HS256","typ":"JWT"}
{"sub":"42","role":"user","exp":1767225600}
2026-01-01T00:00:00.000Z`,
          },
          {
            type: "code",
            lang: "ts",
            caption: "Verifying safely with the `jose` library: pinned algorithm, issuer and audience",
            code: `import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS = createRemoteJWKSet(new URL("https://auth.example.com/.well-known/jwks.json"));

export async function authenticate(bearer: string) {
  const { payload } = await jwtVerify(bearer, JWKS, {
    algorithms: ["RS256"],            // never trust the header's alg
    issuer: "https://auth.example.com",
    audience: "orders-api",
    clockTolerance: 30,               // seconds of skew
  });
  return { userId: payload.sub, scopes: payload.scope };
}`,
          },
          {
            type: "code",
            lang: "http",
            caption: "Session cookie with safe attributes",
            code: `HTTP/1.1 200 OK
Set-Cookie: __Host-sid=8f3c…e1; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=1209600`,
          },
          {
            type: "p",
            text: "The `__Host-` prefix forces `Secure`, `Path=/` and no `Domain`, so a subdomain can't overwrite it. `HttpOnly` hides it from JavaScript (limits XSS theft). `SameSite=Lax` blocks it on most cross-site subrequests (see the CSRF lesson).",
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Session fixation:** always issue a fresh session ID after login or privilege change.",
              "**Clock skew** between services makes fresh tokens look expired — allow ~30–60 s leeway.",
              "**Role changes** don't affect already-issued JWTs until they expire; keep access tokens short or check a version.",
              "**Key rotation:** publish old and new public keys in the JWKS during the overlap and select by `kid`.",
              "**Concurrent refresh** from two tabs can trip reuse detection; allow a tiny grace window or serialise refresh in the client.",
            ],
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "callout",
            tone: "misconception",
            title: "\"JWTs are encrypted\"",
            text: "A signed JWT (JWS) is only encoded. Anyone holding it can read the claims. Encryption requires JWE, which is rarely what you want for access tokens.",
          },
          {
            type: "list",
            items: [
              "Storing access tokens in `localStorage` — any XSS can read and exfiltrate them. Prefer HttpOnly cookies or in-memory storage plus a cookie-held refresh token.",
              "Using JWTs as long-lived sessions with no revocation story.",
              "Verifying with `jwt.decode` (which does not verify) instead of `verify`.",
              "Putting PII or permissions you'll need to revoke instantly into the token.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["", "Server sessions", "JWT access tokens"],
            rows: [
              ["Revocation", "Immediate (delete the row)", "Wait for expiry or maintain a denylist"],
              ["Per-request cost", "Store lookup (Redis ~sub-ms)", "Signature verification (CPU), no I/O"],
              ["Cross-service", "Needs shared store or gateway", "Any service with the public key"],
              ["Size", "~32-byte ID", "Hundreds of bytes to KBs per request"],
              ["CSRF exposure", "Yes if in cookies", "No if sent in Authorization header; yes if in cookies"],
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Sessions store state server-side behind a random ID in a cookie, so revocation is instant but every request needs a lookup. A JWT is a base64url header and payload plus a signature — readable by anyone, verifiable without a lookup, but hard to revoke. I'd use short-lived JWT access tokens with rotating, server-stored refresh tokens and reuse detection, pin the verification algorithm to avoid `alg:none` and HS/RS confusion, validate exp, iss and aud, and keep a sessions table per device so users can see and revoke devices.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Draw the token lifecycle: login, access, refresh with rotation, reuse detection, logout.",
              "Explain the HS/RS confusion attack precisely: public key used as HMAC secret.",
              "Discuss where tokens live in a browser and the XSS vs CSRF trade-off.",
              "Describe revocation options: short TTL, denylist by `jti`, `token_version`, introspection endpoint.",
              "Describe per-device sessions and concurrent-session limits.",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Session = opaque ID + server state; JWT = signed, readable claims.",
              "Pin algorithms; validate exp/nbf/iss/aud; never trust header-chosen keys.",
              "Short access tokens + rotating refresh tokens with reuse detection.",
              "Sessions table per device enables listing, revoking and limiting sessions.",
              "Cookies: `__Host-`, Secure, HttpOnly, SameSite.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Authentication", definition: "Proving who a principal is." },
      { term: "Authorization", definition: "Deciding what an authenticated principal may do." },
      { term: "JWS", definition: "JSON Web Signature — a signed (not encrypted) token format; most JWTs are JWS." },
      { term: "JWKS", definition: "JSON Web Key Set — a published list of public keys, selected by `kid`." },
      { term: "Refresh token", definition: "A long-lived credential used only to obtain new access tokens." },
      { term: "Token rotation", definition: "Issuing a new refresh token on every use and invalidating the previous one." },
      { term: "Session fixation", definition: "An attack where the victim is made to use a session ID the attacker already knows." },
      { term: "base64url", definition: "Base64 with `-` and `_` instead of `+` and `/`, and padding removed — safe in URLs." },
    ],
    followUps: [
      { q: "How do you log a user out of a JWT-based system immediately?", a: "You can't un-sign a token. Options: keep access tokens very short, check a `jti` denylist in Redis until each token's exp, or embed a per-user `token_version` and compare it on each request (one cheap lookup)." },
      { q: "Why is HS256 risky across many services?", a: "Every verifier holds the same secret that can also mint tokens, so compromising any service lets an attacker forge tokens for all. Asymmetric algorithms let services verify without being able to sign." },
      { q: "Where should a SPA keep tokens?", a: "Common answer: access token in memory, refresh token in an HttpOnly, Secure, SameSite cookie scoped to the refresh path — or use a backend-for-frontend that keeps tokens server-side and gives the browser only a session cookie." },
      { q: "What is a device identifier and is it trustworthy?", a: "A random id the client generates and persists to label its session. It's a label, not a security boundary — an attacker can copy it — so security still rests on the refresh token." },
    ],
    quiz: [
      {
        id: "auth-q1",
        prompt: "A server expects RS256 but its library uses whatever `alg` the token header says. What attack does this enable?",
        options: [
          "Padding oracle",
          "Signing a forged token with HS256 using the server's public key as the HMAC secret",
          "SQL injection through the `sub` claim",
          "Replay of expired tokens",
        ],
        answer: 1,
        explanation: "The verifier will HMAC-verify with the 'key' it has — the public RSA key — which the attacker also has. Pin the algorithm.",
      },
      {
        id: "auth-q2",
        prompt: "What should happen when a previously used refresh token is presented again?",
        options: [
          "Issue new tokens as normal",
          "Ignore it silently",
          "Treat it as theft and revoke the whole token family",
          "Extend its expiry",
        ],
        answer: 2,
        explanation: "With rotation, legitimate clients never reuse a refresh token, so reuse signals that it was copied.",
      },
      {
        id: "auth-q3",
        prompt: "Which statement about a standard signed JWT is true?",
        options: [
          "Its payload is encrypted",
          "Its payload can be read by anyone holding it",
          "It can be revoked by deleting it from the client",
          "It requires a database lookup to verify",
        ],
        answer: 1,
        explanation: "JWS payloads are base64url-encoded JSON; the signature only guarantees integrity.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── csrf
  {
    slug: "csrf",
    track: "backend",
    title: "CSRF: cross-site request forgery and SameSite cookies",
    summary:
      "Why browsers' automatic cookie sending lets another site act as you, and the layered defences: SameSite cookies, CSRF tokens, Origin and Fetch Metadata checks.",
    level: "intermediate",
    frequency: "high",
    minutes: 35,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["networks/http", "networks/cors", "backend/authentication-jwt-sessions"],
    related: ["backend/authentication-jwt-sessions", "networks/cors", "system-design/authn-authz"],
    tags: ["security", "csrf", "cookies", "samesite", "owasp"],
    sources: [
      owaspCsrf,
      { label: "MDN — Set-Cookie (SameSite attribute)", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie", kind: "docs" },
      { label: "web.dev — SameSite cookies explained", url: "https://web.dev/articles/samesite-cookies-explained", kind: "external" },
      { label: "MDN — Sec-Fetch-Site (Fetch Metadata)", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Sec-Fetch-Site", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain how a CSRF attack works and which requests are vulnerable.",
              "Know what `SameSite=Strict`, `Lax` and `None` do — and their browser defaults.",
              "Implement a synchronizer or double-submit token and an Origin / Fetch Metadata check.",
              "Explain why CORS is not a CSRF defence and why bearer-token APIs are not vulnerable.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "You are logged in to `bank.example` in one tab. In another tab you open `evil.example`, which contains a hidden form that auto-submits to `https://bank.example/transfer`. Your browser helpfully attaches your bank cookie to that request, so the bank sees a perfectly authenticated transfer. The attacker never saw your cookie — they just *borrowed your browser*.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "**Cross-Site Request Forgery (CSRF)** is an attack that causes a victim's browser to send a state-changing request to a site where the victim is authenticated by **ambient credentials** — cookies, HTTP Basic auth or client certificates that the browser attaches automatically. The attacker can trigger the request but (thanks to the same-origin policy) cannot read the response.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "Any cookie-authenticated endpoint that changes state (POST/PUT/DELETE, or a badly designed GET) is a target.",
              "HTML forms can send cross-site POSTs with `application/x-www-form-urlencoded`, `multipart/form-data` or `text/plain` without any CORS preflight.",
              "Consequences range from changing an email address (→ account takeover) to transferring money.",
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "table",
            head: ["SameSite value", "Cookie sent on cross-site…", "Notes"],
            rows: [
              ["`Strict`", "Never", "Even following a link from another site arrives logged-out"],
              ["`Lax`", "Top-level navigations with safe methods (e.g. clicking a link, GET)", "Blocks cross-site POST forms, iframes, images, fetch"],
              ["`None`", "Always", "Must also be `Secure`; needed for genuine third-party/embedded use"],
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Defaults differ between browsers",
            text: "Chrome (since version 80, 2020) treats cookies without a `SameSite` attribute as `Lax`, with a temporary ~2-minute exception allowing top-level cross-site POSTs right after the cookie is set ('Lax+POST'). Other browsers have not uniformly shipped Lax-by-default (Firefox tried and reverted). Never rely on the default: set `SameSite` explicitly and keep a second defence.",
          },
          {
            type: "callout",
            tone: "warning",
            title: "Same-site is not same-origin",
            text: "A 'site' is the scheme plus registrable domain (eTLD+1). `attacker.example.com` and `app.example.com` are **same-site**, so SameSite cookies flow between them. A compromised or user-content subdomain can still mount CSRF; tokens or Origin checks cover that.",
          },
          {
            type: "list",
            items: [
              "**Synchronizer token:** server stores a random token in the session and embeds it in forms; a mutation must echo it back in a field or header. The attacker can't read it cross-origin.",
              "**Signed double-submit cookie:** server sets a token cookie (HMAC-bound to the session); the client copies it into a header. Plain unsigned double-submit is weaker because sibling subdomains can set cookies.",
              "**Custom request header:** require e.g. `X-CSRF-Token` on JSON APIs. Cross-site pages can't add custom headers without a CORS preflight that your server refuses.",
              "**Origin / Referer check:** reject mutations whose `Origin` isn't yours.",
              "**Fetch Metadata:** modern browsers send `Sec-Fetch-Site: same-origin | same-site | cross-site | none`; reject `cross-site` on state-changing routes.",
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          {
            type: "flow",
            nodes: ["Victim logs in to bank (cookie set)", "Visits evil page", "Hidden form auto-POSTs to bank", "Browser attaches cookie?", "Server checks token / Origin", "Rejected (403)"],
            caption: "Conceptual: each defence breaks the chain at a different link.",
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "html",
            caption: "The attack page (served from evil.example)",
            code: `<form action="https://bank.example/transfer" method="POST" id="f">
  <input type="hidden" name="to" value="attacker" />
  <input type="hidden" name="amount" value="1000" />
</form>
<script>document.getElementById("f").submit();</script>`,
          },
          {
            type: "code",
            lang: "ts",
            caption: "Express middleware: Fetch Metadata + Origin check + token for cookie-authenticated mutations",
            code: `import crypto from "node:crypto";

const SAFE = new Set(["GET", "HEAD", "OPTIONS"]);
const ALLOWED_ORIGIN = "https://bank.example";

export function csrfGuard(req, res, next) {
  if (SAFE.has(req.method)) return next();

  const site = req.get("Sec-Fetch-Site");
  if (site && site !== "same-origin" && site !== "none") {
    return res.status(403).send("cross-site request blocked");
  }
  const origin = req.get("Origin");
  if (origin && origin !== ALLOWED_ORIGIN) {
    return res.status(403).send("bad origin");
  }
  const sent = Buffer.from(String(req.get("X-CSRF-Token") ?? ""));
  const expected = Buffer.from(req.session.csrfToken);
  if (sent.length !== expected.length || !crypto.timingSafeEqual(sent, expected)) {
    return res.status(403).send("bad csrf token");
  }
  next();
}`,
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "callout",
            tone: "misconception",
            title: "\"We have CORS, so we're safe from CSRF\"",
            text: "CORS controls whether a cross-origin page may *read* a response. Simple requests (form POSTs) are still *sent*, with cookies, and the side effect happens. CORS helps only indirectly: it blocks custom headers and non-simple content types without a successful preflight.",
          },
          {
            type: "list",
            items: [
              "Changing state on GET — `SameSite=Lax` still sends cookies on top-level GET navigations.",
              "Accepting `text/plain` or form bodies on a 'JSON' endpoint, bypassing the preflight you were relying on.",
              "Thinking an XSS bug is covered by CSRF defences — script on your origin can read tokens; XSS defeats CSRF protection.",
              "Login CSRF: forgetting to protect the login form, letting an attacker log the victim into the attacker's account.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Defence", "Strength", "Limitation"],
            rows: [
              ["SameSite=Lax/Strict", "Cheap, broad", "Doesn't cover same-site subdomains; browser-dependent defaults"],
              ["Synchronizer token", "Strong, classic", "Needs server state and template plumbing"],
              ["Signed double-submit", "Stateless", "Must bind to session; more moving parts"],
              ["Fetch Metadata / Origin", "No client changes", "Older clients may omit headers — decide fail-open vs fail-closed"],
              ["Bearer token in header", "Not ambient → immune to CSRF", "Token must live in JS-readable storage → XSS exposure"],
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "CSRF abuses the fact that browsers attach cookies automatically: a malicious page makes the victim's browser send a state-changing request to a site they're logged into. The attacker can't read the response, only cause the side effect. Defences are layered: set SameSite=Lax or Strict explicitly, never change state on GET, require a CSRF token or custom header on mutations, and check Origin or Sec-Fetch-Site. CORS is not a CSRF defence, and APIs that use bearer tokens in the Authorization header aren't vulnerable because nothing is attached automatically.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Differentiate site vs origin and explain the subdomain gap in SameSite.",
              "Explain why a JSON-only endpoint with strict Content-Type checking forces a preflight.",
              "Contrast CSRF (borrowing the browser) with XSS (running code in your origin).",
              "Mention login CSRF and why tokens should be rotated on login.",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "CSRF needs ambient credentials + a state-changing endpoint.",
              "SameSite helps but set it explicitly; defaults differ by browser.",
              "Add a token or custom header, and Origin / Fetch Metadata checks.",
              "CORS ≠ CSRF protection. XSS defeats CSRF protection.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Ambient credential", definition: "A credential the browser attaches automatically, such as a cookie." },
      { term: "Site", definition: "Scheme + registrable domain (eTLD+1), e.g. https://example.com covers all its subdomains." },
      { term: "Origin", definition: "Scheme + host + port; stricter than site." },
      { term: "Preflight", definition: "A CORS OPTIONS request the browser sends before non-simple cross-origin requests." },
      { term: "Fetch Metadata", definition: "Request headers like Sec-Fetch-Site describing the request's context, sent by modern browsers." },
    ],
    followUps: [
      { q: "Does SameSite=Lax fully prevent CSRF?", a: "No. It doesn't cover top-level GETs (so GETs must be safe), same-site subdomain attackers, or older browsers. It's a strong baseline plus another layer." },
      { q: "Is a JSON API using cookies safe if it only accepts application/json?", a: "Largely, because a cross-site page can't send that content type without a preflight — but only if the server strictly rejects other content types and doesn't enable credentialed CORS for untrusted origins." },
      { q: "Why use timingSafeEqual for token comparison?", a: "A naive comparison can leak how many leading characters matched via timing; a constant-time compare removes that side channel." },
    ],
    quiz: [
      {
        id: "csrf-q1",
        prompt: "With `SameSite=Lax`, which cross-site request still includes the cookie?",
        options: ["An auto-submitted POST form", "A fetch() call", "A top-level GET navigation from clicking a link", "An <img> tag request"],
        answer: 2,
        explanation: "Lax allows top-level navigations with safe methods; it blocks subresource and cross-site POST requests.",
      },
      {
        id: "csrf-q2",
        prompt: "Why is an API authenticated solely by `Authorization: Bearer …` (no cookies) not vulnerable to classic CSRF?",
        options: [
          "Bearer tokens are encrypted",
          "The browser never attaches the header automatically; the attacker's page would need to know the token",
          "CORS blocks all cross-site requests",
          "HTTPS prevents it",
        ],
        answer: 1,
        explanation: "CSRF needs ambient credentials. A header the application adds explicitly is not ambient.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── webhooks-dlq
  {
    slug: "webhooks-dlq",
    track: "backend",
    title: "Webhooks, retries and dead-letter queues",
    summary:
      "Delivering events to other people's servers reliably: signed payloads, at-least-once delivery with idempotent receivers, exponential backoff with jitter, and dead-letter queues for messages that keep failing.",
    level: "intermediate",
    frequency: "high",
    minutes: 45,
    kinds: ["theory", "visualization", "coding", "system-design"],
    status: "authored",
    prerequisites: ["networks/http", "system-design/async-processing", "go/worker-pool"],
    related: [
      "distributed/idempotency-patterns",
      "distributed/distributed-transactions",
      "system-design/delivery-semantics",
      "system-design/rabbitmq-kafka-sqs",
      "system-design/circuit-breakers-timeouts-retries",
      "system-design/backpressure",
    ],
    tags: ["webhooks", "dlq", "retries", "backoff", "hmac", "queues", "idempotency"],
    sources: [
      { label: "Standard Webhooks specification", url: "https://www.standardwebhooks.com/", kind: "external" },
      { label: "Stripe — Receive webhook events (signatures, retries)", url: "https://docs.stripe.com/webhooks", kind: "docs" },
      { label: "Amazon SQS — Dead-letter queues", url: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html", kind: "docs" },
      { label: "RabbitMQ — Dead Letter Exchanges", url: "https://www.rabbitmq.com/docs/dlx", kind: "docs" },
      { label: "AWS Architecture Blog — Exponential Backoff And Jitter", url: "https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/", kind: "external" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain what a webhook is and why delivery is at-least-once.",
              "Sign and verify payloads with HMAC and a timestamp to stop forgery and replay.",
              "Design retries with exponential backoff, jitter and a max-attempt cap.",
              "Explain what a dead-letter queue is, when messages land there, and how to replay them.",
              "Make receivers idempotent and fast (acknowledge, then process asynchronously).",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Instead of a client polling 'has the payment finished yet?', the provider calls *you* when something happens — a **webhook** is a reverse API call. But the receiver is someone else's server: it may be down, slow or buggy. So the sender needs a post office: keep the letter, try again later, and after enough failed attempts put it in a 'return to sender' pile — the **dead-letter queue** — where a human or a tool can look at it.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "A **webhook** is an HTTP request (usually `POST` with a JSON body) that a system sends to a URL registered by a subscriber when an event occurs. A **dead-letter queue (DLQ)** is a separate queue where messages are moved after they exceed a retry limit or are rejected as unprocessable, so they stop blocking or looping in the main queue without being lost.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "Networks and receivers fail; without retries, events silently disappear.",
              "Without a cap, a permanently failing message (*poison message*) retries forever, wasting capacity and hiding new failures.",
              "Without signatures anyone could POST fake 'payment succeeded' events to your endpoint.",
              "Because retries mean duplicates, receivers must be idempotent — exactly-once delivery over HTTP isn't achievable, only exactly-once *effects*.",
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Record the event", detail: "In the same DB transaction as the business change, insert into an **outbox** table. This avoids 'committed but never sent' (see distributed transactions)." },
              { title: "Enqueue", detail: "A relay reads the outbox and enqueues one delivery job per subscriber endpoint." },
              { title: "Deliver", detail: "A bounded worker pool POSTs the payload with a timeout (e.g. 5–10 s), an event id and an HMAC signature header." },
              { title: "Classify the result", detail: "2xx = done. 5xx, 429, timeouts, connection errors = retry. Most 4xx (except 408/409/429) = likely permanent; many systems still retry a few times." },
              { title: "Schedule retry", detail: "Delay = min(cap, base × 2^attempt) with random jitter; store `next_attempt_at` (or use a delayed queue / visibility timeout)." },
              { title: "Dead-letter", detail: "After N attempts (or a time budget, e.g. 3 days), move the job to the DLQ, alert, and optionally disable the endpoint." },
              { title: "Replay", detail: "Operators fix the cause and re-drive DLQ messages back to the main queue; idempotency keys make this safe." },
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "How brokers implement DLQs",
            text: "Amazon SQS uses a *redrive policy*: after a message's receive count exceeds `maxReceiveCount` it moves to the configured DLQ (and SQS supports redrive back to the source). RabbitMQ uses a *dead-letter exchange* (`x-dead-letter-exchange`) for rejected, expired or overflowed messages. Kafka has no built-in DLQ; it's an application convention (a separate topic), though Kafka Connect sink connectors offer one.",
          },
          {
            type: "p",
            text: "**Signatures.** Sender and receiver share a secret per endpoint. The sender computes `HMAC-SHA256(secret, timestamp + \".\" + rawBody)` and sends the timestamp and signature in headers. The receiver recomputes over the **raw bytes** (not re-serialised JSON), compares in constant time, and rejects timestamps older than a tolerance (e.g. 5 minutes) to block replays.",
          },
        ],
      },
      {
        id: "visualization",
        blocks: [
          { type: "viz", id: "go-worker-pool", caption: "A bounded worker pool draining a jobs queue — the delivery stage of a webhook system." },
          {
            type: "flow",
            nodes: ["Outbox", "Delivery queue", "Worker pool", "Receiver", "Retry (backoff)", "DLQ after N attempts"],
            caption: "Conceptual pipeline; retries loop back to the queue with a delay.",
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "js",
            runnable: true,
            caption: "Exponential backoff schedule (base 30 s, cap 1 h) — add jitter in production",
            code: `const base = 30, cap = 3600;
const schedule = [];
for (let attempt = 1; attempt <= 8; attempt++) {
  schedule.push(Math.min(cap, base * 2 ** (attempt - 1)));
}
console.log(schedule.join(" "));

// "full jitter": sleep a random amount between 0 and the computed delay
const fullJitter = (attempt) => Math.random() * Math.min(cap, base * 2 ** (attempt - 1));
console.log(fullJitter(3) <= 120);`,
            output: `30 60 120 240 480 960 1920 3600
true`,
          },
          {
            type: "code",
            lang: "js",
            caption: "Signing and verifying a webhook (Node.js, node:crypto)",
            code: `import crypto from "node:crypto";

const secret = "whsec_test_123";
const body = '{"id":"evt_1","type":"invoice.paid"}';
const timestamp = "1767225600";

function sign(ts, payload) {
  return crypto.createHmac("sha256", secret).update(ts + "." + payload).digest("hex");
}

function verify(ts, payload, signature, nowSec) {
  if (Math.abs(nowSec - Number(ts)) > 300) return "rejected: stale timestamp";
  const expected = Buffer.from(sign(ts, payload), "hex");
  const given = Buffer.from(signature, "hex");
  if (given.length !== expected.length) return "rejected: bad signature";
  return crypto.timingSafeEqual(expected, given) ? "ok" : "rejected: bad signature";
}

const sig = sign(timestamp, body);
console.log(sig);
console.log(verify(timestamp, body, sig, 1767225660));
console.log(verify(timestamp, body.replace("paid", "void"), sig, 1767225660));
console.log(verify(timestamp, body, sig, 1767226000));`,
            output: `cde23313302b59d7d7f6cc603011dd7b5415af46af97077444c1f7067416c9ef
ok
rejected: bad signature
rejected: stale timestamp`,
          },
          {
            type: "code",
            lang: "sql",
            caption: "Idempotent receiver: record processed event ids in the same transaction as the effect",
            code: `BEGIN;
INSERT INTO processed_events (event_id) VALUES ('evt_1')
  ON CONFLICT (event_id) DO NOTHING;
-- if 0 rows were inserted, this event was already handled: COMMIT and return 200
UPDATE invoices SET status = 'paid' WHERE id = 'inv_9';
COMMIT;`,
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Ordering:** retries reorder events (`updated` may arrive before `created`). Include a version/timestamp and let receivers ignore stale updates, or fetch current state from the API.",
              "**Slow receivers:** a receiver that takes 30 s per request ties up workers. Use timeouts, per-endpoint concurrency limits and a circuit breaker.",
              "**Retry storms:** all failed jobs retrying at the same instant after an outage — jitter spreads them out.",
              "**Body parsing:** frameworks that parse JSON before your handler change whitespace; verify against the raw body.",
              "**Secret rotation:** send signatures for both old and new secrets during the rotation window.",
              "**SSRF:** users register URLs; block internal IP ranges so your sender can't be aimed at your own infrastructure.",
            ],
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "callout",
            tone: "misconception",
            title: "\"A DLQ means the message is handled\"",
            text: "A DLQ is a holding pen, not a solution. Without alerts, dashboards and a replay tool, it's just a place where data goes to be forgotten.",
          },
          {
            type: "list",
            items: [
              "Doing heavy work synchronously in the webhook handler — respond 2xx fast, enqueue internally.",
              "Retrying immediately in a tight loop with no backoff.",
              "Assuming exactly-once delivery and not deduplicating by event id.",
              "Comparing signatures with `===` instead of a constant-time function.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Decision", "Option A", "Option B"],
            rows: [
              ["Retry budget", "Many attempts over days (higher delivery rate)", "Few attempts (faster feedback, more DLQ volume)"],
              ["Payload", "Full object ('fat' event)", "Just id + type ('thin'); receiver fetches current state — avoids ordering bugs"],
              ["Queue", "DB table with `next_attempt_at` (simple, transactional)", "Broker with delay/DLQ support (scales, more infra)"],
              ["4xx handling", "Dead-letter immediately", "Retry a few times in case of misconfiguration"],
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Webhooks are HTTP callbacks to subscriber URLs, delivered at-least-once. I write events to an outbox in the same transaction, deliver them with a bounded worker pool and timeouts, sign each payload with HMAC over timestamp plus raw body, and retry failures with exponential backoff and jitter. After a max number of attempts the message goes to a dead-letter queue with alerting and a replay tool. Receivers verify the signature, deduplicate by event id, return 2xx quickly and process asynchronously.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Explain why exactly-once delivery is impossible and how idempotency gives exactly-once effects.",
              "Walk through retry classification (5xx/429/timeouts vs 4xx).",
              "Discuss isolation: per-endpoint queues or concurrency limits so one bad receiver doesn't starve others.",
              "Explain DLQ semantics in SQS (maxReceiveCount) vs RabbitMQ (DLX) vs Kafka (convention).",
            ],
          },
        ],
      },
      {
        id: "practice",
        blocks: [
          {
            type: "list",
            ordered: true,
            items: [
              "Build a receiver that randomly returns 500 and watch your sender's backoff schedule.",
              "Add a DLQ and a CLI command that re-drives messages, then prove duplicates are ignored.",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Outbox → queue → bounded workers → signed POST with timeout.",
              "Retry with exponential backoff + jitter, capped; then DLQ + alert + replay.",
              "HMAC over timestamp + raw body; constant-time compare; reject stale timestamps.",
              "At-least-once delivery ⇒ idempotent receivers keyed by event id.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Webhook", definition: "An HTTP callback sent by a provider to a subscriber-registered URL when an event occurs." },
      { term: "Dead-letter queue", definition: "A queue holding messages that could not be processed after the retry limit, for inspection and replay." },
      { term: "Poison message", definition: "A message that fails every time it is processed, e.g. due to malformed data." },
      { term: "Exponential backoff", definition: "Waiting progressively longer (typically doubling) between retries." },
      { term: "Jitter", definition: "Randomness added to retry delays so clients don't retry in sync." },
      { term: "HMAC", definition: "Hash-based message authentication code: a keyed hash proving the sender knew the secret and the body wasn't altered." },
      { term: "Outbox pattern", definition: "Writing outgoing messages to a table in the same transaction as the state change, then relaying them asynchronously." },
    ],
    followUps: [
      { q: "Why include a timestamp in the signed content?", a: "So a captured request can't be replayed later: the receiver rejects signatures whose timestamp is outside a tolerance window, and the attacker can't change the timestamp without breaking the HMAC." },
      { q: "Why might a receiver prefer thin events?", a: "Thin events (id + type) force fetching current state, sidestepping out-of-order delivery and stale payloads, at the cost of an extra API call." },
      { q: "When should an endpoint be auto-disabled?", a: "After sustained failure (e.g. all deliveries failing for days). Notify the owner and keep events so they can be replayed once fixed." },
    ],
    quiz: [
      {
        id: "wh-q1",
        prompt: "Why add jitter to exponential backoff?",
        options: [
          "To make retries faster",
          "To prevent many clients from retrying at the same moment and overloading the recovering service",
          "To guarantee ordering",
          "Because HMAC requires it",
        ],
        answer: 1,
        explanation: "Synchronized retries create load spikes (thundering herd); jitter spreads them across time.",
      },
      {
        id: "wh-q2",
        prompt: "Which message should land in the DLQ?",
        options: [
          "A message that succeeded on the second attempt",
          "A message whose receiver returned 200 slowly",
          "A message that failed every attempt until the retry limit",
          "Every message, for auditing",
        ],
        answer: 2,
        explanation: "DLQs isolate messages that exhausted their retries so they stop cycling but aren't lost.",
      },
      {
        id: "wh-q3",
        prompt: "The receiver verifies the signature after `JSON.parse` and `JSON.stringify` of the body. What's wrong?",
        options: [
          "Nothing",
          "Re-serialisation can change bytes (whitespace, key order, escaping), so valid signatures fail",
          "JSON.stringify is too slow",
          "HMAC only works on binary",
        ],
        answer: 1,
        explanation: "The signature covers the exact raw bytes sent; verify against the raw body.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── rest-graphql-grpc-trpc
  {
    slug: "rest-graphql-grpc-trpc",
    track: "backend",
    title: "REST vs GraphQL vs gRPC vs tRPC",
    summary:
      "Four ways to expose an API, what each optimises for, how GraphQL schemas and resolvers execute nested queries, why that causes N+1 queries, and how DataLoader batches them away.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 45,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["networks/http", "system-design/rest-api-design"],
    related: ["system-design/rpc-grpc", "system-design/api-versioning", "system-design/openapi-swagger", "backend/serialization", "javascript/event-loop"],
    tags: ["rest", "graphql", "grpc", "trpc", "dataloader", "n+1", "api-design"],
    sources: [
      { label: "GraphQL — Learn (schemas, execution)", url: "https://graphql.org/learn/", kind: "docs" },
      { label: "GraphQL specification", url: "https://spec.graphql.org/", kind: "docs" },
      { label: "graphql/dataloader (GitHub)", url: "https://github.com/graphql/dataloader", kind: "external" },
      { label: "gRPC — Introduction and core concepts", url: "https://grpc.io/docs/what-is-grpc/core-concepts/", kind: "docs" },
      { label: "tRPC documentation", url: "https://trpc.io/docs", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Compare REST, GraphQL, gRPC and tRPC on contract, transport, tooling and caching.",
              "Read a GraphQL schema and explain how resolvers execute a nested query.",
              "Explain the N+1 problem and fix it with DataLoader-style batching.",
              "Choose an API style for public, internal and full-stack-TypeScript scenarios.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "REST", points: ["Resources at URLs, HTTP verbs as actions.", "Server decides the response shape.", "Plays well with HTTP caching and every client."] },
              { title: "GraphQL", points: ["One endpoint, a typed schema.", "Client asks for exactly the fields it needs, nested.", "Server runs a resolver per field."] },
              { title: "gRPC", points: ["Call remote functions defined in `.proto` files.", "Binary Protobuf over HTTP/2, streaming built in.", "Great service-to-service; browsers need a proxy (gRPC-Web)."] },
              { title: "tRPC", points: ["TypeScript functions on the server, called from a TS client.", "Types flow through inference — no schema file or codegen.", "Only makes sense when both ends are TypeScript you own."] },
            ],
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "A **GraphQL schema** declares types and the root `Query`/`Mutation`/`Subscription` fields. A **resolver** is a function `(parent, args, context, info)` that produces one field's value. Execution walks the query tree: it resolves the root field, then for each returned object resolves its selected child fields, and so on — breadth by level, with sibling fields resolved concurrently when they return promises.",
          },
          {
            type: "code",
            lang: "text",
            caption: "Schema (SDL) and a nested query",
            code: `type Author { id: ID!  name: String! }
type Post   { id: ID!  title: String!  author: Author! }
type Query  { posts(limit: Int = 10): [Post!]! }

# client query
{ posts(limit: 4) { title author { name } } }`,
          },
        ],
      },
      {
        id: "internals",
        title: "Internals: why nested queries cause N+1",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Root resolver", detail: "`Query.posts` runs one SQL query → 4 posts." },
              { title: "Child resolvers", detail: "`Post.author` runs once **per post**, each doing `SELECT * FROM authors WHERE id = ?` → 4 more queries." },
              { title: "Total", detail: "1 + N queries. With nested lists (posts → comments → author) it multiplies." },
              { title: "DataLoader fix", detail: "Each `Post.author` call does `loader.load(authorId)` instead. The loader collects all keys requested in the same tick, then calls a batch function once: `WHERE id IN (1,2,3)`. It also memoises keys per request." },
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "DataLoader's batching window is an implementation detail",
            text: "The reference JavaScript DataLoader schedules the batch after the current job queue drains (using `process.nextTick`/microtask-based scheduling in Node). Other languages implement 'collect then flush' differently. Create a new loader **per request** so its cache doesn't leak data between users.",
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "js",
            runnable: true,
            caption: "N+1 vs a minimal DataLoader, counting simulated queries",
            code: `let queries = 0;
const authors = { 1: "Ada", 2: "Linus", 3: "Grace" };
const posts = [
  { id: 10, authorId: 1 }, { id: 11, authorId: 2 },
  { id: 12, authorId: 1 }, { id: 13, authorId: 3 },
];

// "SELECT * FROM authors WHERE id IN (...)"
async function fetchAuthors(ids) {
  queries++;
  return ids.map((id) => authors[id]);
}

// Naive resolver: one query per post (N+1)
async function naive() {
  queries = 1; // the posts query
  return Promise.all(posts.map((p) => fetchAuthors([p.authorId]).then((r) => r[0])));
}

// Minimal DataLoader: collect keys during this tick, flush once in a microtask
function createLoader(batchFn) {
  let pending = null;
  const cache = new Map();
  return function load(key) {
    if (cache.has(key)) return cache.get(key);
    if (!pending) {
      pending = { keys: [], resolvers: [] };
      const batch = pending;
      queueMicrotask(async () => {
        pending = null;
        const values = await batchFn(batch.keys);
        batch.resolvers.forEach((resolve, i) => resolve(values[i]));
      });
    }
    const p = new Promise((resolve) => pending.resolvers.push(resolve));
    pending.keys.push(key);
    cache.set(key, p);
    return p;
  };
}

async function batched() {
  queries = 1;
  const loadAuthor = createLoader(fetchAuthors);
  return Promise.all(posts.map((p) => loadAuthor(p.authorId)));
}

naive().then((names) => {
  console.log("naive:", names.join(","), "queries =", queries);
  return batched();
}).then((names) => {
  console.log("batched:", names.join(","), "queries =", queries);
});`,
            output: `naive: Ada,Linus,Ada,Grace queries = 5
batched: Ada,Linus,Ada,Grace queries = 2`,
          },
          {
            type: "code",
            lang: "text",
            caption: "The same operation as a gRPC service definition (proto3)",
            code: `syntax = "proto3";
service Blog {
  rpc ListPosts(ListPostsRequest) returns (ListPostsResponse);
  rpc WatchPosts(WatchRequest) returns (stream Post);   // server streaming
}
message ListPostsRequest { int32 limit = 1; }
message Post { string id = 1; string title = 2; string author_name = 3; }
message ListPostsResponse { repeated Post posts = 1; }
message WatchRequest {}`,
          },
          {
            type: "code",
            lang: "ts",
            caption: "tRPC: the client's types come from the server router by inference",
            code: `// server
export const appRouter = router({
  postById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => db.post.findUnique({ where: { id: input.id } })),
});
export type AppRouter = typeof appRouter;

// client (imports only the type)
const post = await trpc.postById.query({ id: "10" }); // fully typed`,
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**GraphQL query cost:** clients can request deeply nested or huge queries. Use depth/complexity limits, pagination and persisted queries.",
              "**HTTP caching:** REST GETs cache at CDNs naturally; GraphQL usually POSTs to one URL, so caching moves to the client (normalized caches) or persisted GET queries.",
              "**Errors:** GraphQL typically returns HTTP 200 with an `errors` array and partial `data`; monitoring must inspect the body.",
              "**gRPC in browsers:** browsers can't speak raw gRPC (no control over HTTP/2 framing/trailers); use gRPC-Web or Connect with a proxy.",
              "**tRPC coupling:** client and server share types; breaking changes surface at compile time but you can't give third parties a stable contract easily.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["", "REST", "GraphQL", "gRPC", "tRPC"],
            rows: [
              ["Contract", "OpenAPI (optional)", "Schema (required)", ".proto (required)", "TS types (inferred)"],
              ["Transport / format", "HTTP/1.1+, usually JSON", "HTTP, JSON", "HTTP/2, Protobuf", "HTTP, JSON"],
              ["Over/under-fetching", "Common", "Client picks fields", "Fixed messages", "Fixed per procedure"],
              ["Caching", "HTTP/CDN native", "Harder", "App-level", "HTTP GET for queries"],
              ["Best for", "Public APIs", "Many clients with varied needs", "Internal service calls, streaming", "Full-stack TS monorepo"],
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "REST models resources over HTTP and caches well; GraphQL exposes a typed schema where clients choose fields and a resolver runs per field; gRPC is contract-first RPC with Protobuf over HTTP/2 and streaming, ideal between services; tRPC shares TypeScript types between client and server with no codegen. GraphQL's per-field resolvers cause N+1 queries on nested lists — DataLoader fixes that by collecting keys in one tick and issuing one batched query, with a per-request cache.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Explain resolver execution order and where batching happens.",
              "Discuss protecting a GraphQL API: depth limits, cost analysis, persisted queries, field-level auth.",
              "Explain why gRPC benefits from HTTP/2 (multiplexing, streams, header compression).",
              "Argue for a hybrid: REST/GraphQL at the edge, gRPC inside.",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "REST = resources + HTTP semantics; GraphQL = schema + resolvers; gRPC = proto + HTTP/2; tRPC = shared TS types.",
              "Nested GraphQL lists → N+1; DataLoader batches and dedupes per request.",
              "Pick by audience: public, varied clients, internal services, or one TS team.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Resolver", definition: "A function that returns the value for one field in a GraphQL schema." },
      { term: "N+1 problem", definition: "One query for a list plus one query per item to fetch related data." },
      { term: "DataLoader", definition: "A utility that batches and caches individual loads into a single bulk fetch per tick." },
      { term: "Protobuf", definition: "Protocol Buffers: a schema-defined, compact binary serialization format." },
      { term: "Over-fetching", definition: "Receiving more data than the client needs." },
    ],
    followUps: [
      { q: "Does GraphQL replace REST?", a: "No. It's a different trade-off: flexible queries and a strong schema in exchange for harder caching, query-cost control and more server complexity." },
      { q: "How does DataLoader know when to dispatch?", a: "It defers the batch until the current synchronous work and queued promise jobs have run, so all `load` calls made while resolving one level are collected first." },
      { q: "Why is gRPC popular for microservices?", a: "Strongly typed contracts with generated clients in many languages, compact binary payloads, HTTP/2 multiplexing, deadlines and bidirectional streaming." },
    ],
    quiz: [
      {
        id: "api-q1",
        prompt: "A GraphQL query fetches 50 posts and each post's author with a naive resolver. How many DB queries?",
        options: ["1", "2", "51", "100"],
        answer: 2,
        explanation: "1 for the posts plus 1 per post for its author = 51. With DataLoader it becomes 2.",
      },
      {
        id: "api-q2",
        prompt: "Why should a DataLoader be created per request rather than globally?",
        options: [
          "It's faster",
          "Its memo cache could return stale or another user's (authorization-filtered) data across requests",
          "GraphQL requires it",
          "Global objects can't hold promises",
        ],
        answer: 1,
        explanation: "The cache is meant for deduplication within one request; sharing it leaks data and staleness.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── serialization
  {
    slug: "serialization",
    track: "backend",
    title: "Serialization: JSON vs Protobuf and friends",
    summary:
      "Turning in-memory objects into bytes and back: what JSON can't represent, how Protobuf encodes fields with tags and varints, schema evolution, and the security risks of deserializing untrusted input.",
    level: "beginner",
    frequency: "medium",
    minutes: 30,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["javascript/data-types"],
    related: ["backend/rest-graphql-grpc-trpc", "javascript/json-circular", "go/json", "system-design/rpc-grpc"],
    tags: ["serialization", "json", "protobuf", "schema-evolution", "security"],
    sources: [
      { label: "RFC 8259 — The JSON Data Interchange Format", url: "https://datatracker.ietf.org/doc/html/rfc8259", kind: "docs" },
      { label: "Protocol Buffers — Encoding", url: "https://protobuf.dev/programming-guides/encoding/", kind: "docs" },
      { label: "Protocol Buffers — Language guide (proto3), updating messages", url: "https://protobuf.dev/programming-guides/proto3/", kind: "docs" },
      { label: "OWASP Deserialization Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Define serialization and deserialization.",
              "Predict what JSON loses (BigInt, Date, undefined, Set, precision).",
              "Explain Protobuf's tag + wire-type + varint encoding and why field numbers must never be reused.",
              "Know why deserializing untrusted data into arbitrary types is dangerous.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Objects in memory are full of pointers that mean nothing to another process. To send or store them you flatten them into a byte sequence (**serialize**) that the other side rebuilds (**deserialize**). Text formats like JSON are human-readable but verbose and loosely typed; binary formats like Protobuf are compact and schema-driven but need the schema to read.",
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "p",
            text: "**Protobuf encoding.** Each field is written as a *key* = `(field_number << 3) | wire_type`, followed by the value. Integers use **varints**: 7 bits per byte, high bit set means 'more bytes follow'. Field names never go on the wire — only numbers.",
          },
          {
            type: "table",
            head: ["Field", "Value", "Bytes (hex)", "Why"],
            rows: [
              ["`int32 id = 1`", "150", "`08 96 01`", "key (1<<3)|0 = 0x08; 150 as varint = 0x96 0x01"],
              ["`string name = 2`", "\"hi\"", "`12 02 68 69`", "key (2<<3)|2 = 0x12; length 2; UTF-8 bytes"],
            ],
          },
          {
            type: "list",
            items: [
              "**Schema evolution:** adding a field with a new number is safe — old readers skip unknown fields; removing a field means marking its number `reserved` so it's never reused with a different meaning.",
              "**Defaults:** in proto3, scalar fields equal to their default (0, \"\") aren't encoded unless marked `optional`, so 'missing' and 'zero' look the same.",
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "JSON (RFC 8259) doesn't limit number precision, but most parsers — including JavaScript's `JSON.parse` — read numbers as IEEE-754 doubles, so integers above 2^53 − 1 silently lose precision. Send 64-bit ids as strings.",
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "js",
            runnable: true,
            caption: "What JSON drops or changes",
            code: `const order = {
  id: 9007199254740993n,          // BigInt
  createdAt: new Date(Date.UTC(2026, 0, 1)),
  note: undefined,
  tags: new Set(["a", "b"]),
  total: 0.1 + 0.2,
};

try {
  JSON.stringify(order);
} catch (e) {
  console.log(e instanceof TypeError);
}

const wire = JSON.stringify({ ...order, id: order.id.toString() });
console.log(wire);

const back = JSON.parse(wire);
console.log(typeof back.createdAt, JSON.stringify(back.tags), "note" in back);
console.log(JSON.parse('{"id": 9007199254740993}').id);`,
            output: `true
{"id":"9007199254740993","createdAt":"2026-01-01T00:00:00.000Z","tags":{},"total":0.30000000000000004}
string {} false
9007199254740992`,
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Sending int64 ids as JSON numbers to JavaScript clients.",
              "Reusing a deleted Protobuf field number — old data decodes into the new field with the wrong meaning.",
              "Using native object deserializers (Java `ObjectInputStream`, Python `pickle`, PHP `unserialize`) on untrusted input — they can instantiate arbitrary classes and lead to remote code execution.",
              "Not validating after parsing: valid JSON isn't valid input. Use a schema validator (Zod, Pydantic, JSON Schema).",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Format", "Readable", "Schema", "Size/speed", "Typical use"],
            rows: [
              ["JSON", "Yes", "Optional (JSON Schema)", "Larger, slower to parse", "Public web APIs, configs"],
              ["Protobuf", "No", "Required (.proto)", "Compact, fast", "gRPC, internal events"],
              ["Avro", "No", "Required, often in a registry", "Compact", "Kafka pipelines"],
              ["MessagePack / CBOR", "No", "No", "Compact JSON-like", "Caches, constrained devices"],
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Serialization converts in-memory structures into bytes; deserialization rebuilds them. JSON is readable and universal but verbose, loosely typed and loses things like BigInt precision and Dates. Protobuf is a schema-first binary format that writes field numbers and varints instead of names — smaller and faster, and it evolves safely as long as you never reuse field numbers. Never deserialize untrusted data into arbitrary types, and always validate after parsing.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "JSON: universal, lossy for BigInt/Date/undefined/Set; doubles for numbers.",
              "Protobuf: tag = field<<3 | wiretype, varints, unknown fields skipped.",
              "Evolve schemas additively; reserve removed field numbers.",
              "Validate parsed input; avoid native object deserializers on untrusted data.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Serialization", definition: "Encoding an in-memory value into a byte or text representation." },
      { term: "Varint", definition: "Variable-length integer encoding using 7 data bits per byte and a continuation bit." },
      { term: "Wire type", definition: "Protobuf's 3-bit code telling the parser how to read the following value (varint, length-delimited, fixed32/64)." },
      { term: "Schema evolution", definition: "Changing a data schema while old and new readers/writers keep interoperating." },
    ],
    followUps: [
      { q: "Is Protobuf always faster than JSON?", a: "Usually smaller and faster to parse, but modern JSON parsers are very fast and compression narrows size gaps. Measure for your payloads; tooling and debuggability also matter." },
      { q: "How do you add a required field to a Protobuf message?", a: "You don't make it required on the wire — proto3 has no required. Add it as a new field, handle its absence in code, and enforce at the application layer." },
    ],
    quiz: [
      {
        id: "ser-q1",
        prompt: "What does `JSON.parse('{\"id\": 9007199254740993}').id` return in JavaScript?",
        options: ["9007199254740993", "9007199254740992", "A BigInt", "It throws"],
        answer: 1,
        explanation: "The number exceeds Number.MAX_SAFE_INTEGER and rounds to the nearest representable double.",
      },
      {
        id: "ser-q2",
        prompt: "Why must a removed Protobuf field's number be reserved?",
        options: [
          "To save space",
          "So it's never reused; old serialized data would otherwise decode into a new field with a different meaning",
          "Because the compiler crashes otherwise",
          "To keep field names stable",
        ],
        answer: 1,
        explanation: "Only numbers are on the wire, so reusing one silently reinterprets old bytes.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── outlines
  outline({
    slug: "fastapi",
    title: "FastAPI: async Python APIs with type hints",
    summary: "How FastAPI turns Python type hints into validation (Pydantic), dependency injection and an OpenAPI schema, and how it runs on ASGI servers like Uvicorn.",
    level: "beginner",
    frequency: "medium",
    minutes: 30,
    prerequisites: ["networks/http", "system-design/rest-api-design"],
    related: ["backend/express-vs-feathers", "system-design/openapi-swagger", "backend/serialization"],
    tags: ["python", "fastapi", "asgi", "pydantic", "openapi"],
    sources: [
      { label: "FastAPI documentation", url: "https://fastapi.tiangolo.com/", kind: "docs" },
      { label: "FastAPI — Concurrency and async / await", url: "https://fastapi.tiangolo.com/async/", kind: "docs" },
      { label: "Pydantic documentation", url: "https://docs.pydantic.dev/", kind: "docs" },
      { label: "Uvicorn documentation", url: "https://www.uvicorn.org/", kind: "docs" },
    ],
    objectives: [
      "Build a typed endpoint whose request body is validated by a Pydantic model.",
      "Explain ASGI vs WSGI and what Uvicorn does.",
      "Know when FastAPI runs a handler in the event loop (`async def`) vs a thread pool (`def`) — and why blocking calls inside `async def` stall every request.",
      "Use dependency injection (`Depends`) for DB sessions and auth.",
      "Read the auto-generated OpenAPI docs at `/docs`.",
    ],
    covers: [
      "ASGI, the event loop and the thread pool for sync handlers",
      "Path/query/body parameters from type hints; Pydantic validation and serialization",
      "Dependencies, background tasks, lifespan events",
      "Deploying with multiple worker processes behind a reverse proxy",
    ],
  }),
  outline({
    slug: "express-vs-feathers",
    title: "Express vs Feathers.js",
    summary: "Express is a minimal routing + middleware layer for Node.js; Feathers is a framework on top that adds a service abstraction, hooks and real-time events. When does the extra structure pay off?",
    level: "beginner",
    frequency: "low",
    minutes: 25,
    prerequisites: ["nodejs/node-architecture", "networks/http"],
    related: ["backend/fastapi", "backend/rest-graphql-grpc-trpc", "networks/websockets"],
    tags: ["nodejs", "express", "feathers", "middleware", "realtime"],
    sources: [
      { label: "Express — Using middleware", url: "https://expressjs.com/en/guide/using-middleware.html", kind: "docs" },
      { label: "Feathers documentation", url: "https://feathersjs.com/", kind: "docs" },
    ],
    objectives: [
      "Explain Express's middleware chain (`req`, `res`, `next`) and error-handling middleware.",
      "Describe Feathers services (find/get/create/update/patch/remove) and before/after/error hooks.",
      "Explain how Feathers publishes service events to clients over WebSockets.",
      "Choose between a minimal stack and a conventions-heavy framework.",
    ],
    covers: [
      "Express routing and middleware ordering; async error handling",
      "Feathers service interface, hooks and channels for real-time",
      "Database adapters and authentication in Feathers",
      "Trade-off: flexibility vs conventions and team onboarding",
    ],
  }),
  outline({
    slug: "single-sign-on",
    title: "Single sign-on: OAuth 2.0, OpenID Connect and SAML",
    summary: "How one login works across many apps: the OAuth 2.0 authorization code flow with PKCE, OpenID Connect ID tokens, and the older SAML browser SSO.",
    level: "intermediate",
    frequency: "high",
    minutes: 40,
    prerequisites: ["backend/authentication-jwt-sessions", "system-design/authn-authz"],
    related: ["backend/csrf", "backend/api-key-security", "networks/tls-handshake"],
    tags: ["sso", "oauth2", "oidc", "saml", "pkce", "security"],
    sources: [
      { label: "RFC 6749 — The OAuth 2.0 Authorization Framework", url: "https://datatracker.ietf.org/doc/html/rfc6749", kind: "docs" },
      { label: "RFC 7636 — PKCE", url: "https://datatracker.ietf.org/doc/html/rfc7636", kind: "docs" },
      { label: "OpenID Connect Core 1.0", url: "https://openid.net/specs/openid-connect-core-1_0.html", kind: "docs" },
      { label: "OAuth 2.0 Security Best Current Practice (RFC 9700)", url: "https://datatracker.ietf.org/doc/html/rfc9700", kind: "docs" },
      { label: "OWASP SAML Security Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/SAML_Security_Cheat_Sheet.html", kind: "docs" },
    ],
    objectives: [
      "Distinguish OAuth 2.0 (delegated authorization) from OpenID Connect (authentication on top).",
      "Walk through the authorization code flow with PKCE, including `state` and `nonce`.",
      "Explain what an ID token contains and how to validate it.",
      "Compare OIDC with SAML for enterprise SSO.",
    ],
    covers: [
      "Roles: resource owner, client, authorization server, resource server",
      "Authorization code + PKCE; why the implicit flow is deprecated",
      "ID token vs access token; discovery documents and JWKS",
      "SAML assertions, signature-wrapping pitfalls, IdP- vs SP-initiated login",
      "Single logout and session lifetimes",
    ],
  }),
  outline({
    slug: "api-key-security",
    title: "API key security",
    summary: "Designing, storing and rotating API keys: high-entropy prefixed keys, storing only hashes, scoping, rate limits per key, and leak detection.",
    level: "intermediate",
    frequency: "medium",
    minutes: 25,
    prerequisites: ["backend/authentication-jwt-sessions"],
    related: ["backend/single-sign-on", "backend/redis", "system-design/rate-limiting", "system-design/authn-authz"],
    tags: ["security", "api-keys", "hashing", "rotation", "secrets"],
    sources: [
      { label: "OWASP REST Security Cheat Sheet (API keys)", url: "https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html", kind: "docs" },
      { label: "OWASP Secrets Management Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html", kind: "docs" },
      { label: "GitHub — About secret scanning", url: "https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning", kind: "docs" },
    ],
    objectives: [
      "Generate keys with enough entropy and a recognisable prefix (helps secret scanners).",
      "Store a hash of the key (show it to the user once), look it up by a non-secret key id.",
      "Scope keys to permissions and environments; expire and rotate them without downtime.",
      "Explain why API keys identify a client/project but are weaker than user authentication.",
    ],
    covers: [
      "Key format, prefixes and checksums",
      "Hashing (fast hash is fine for high-entropy keys) and constant-time comparison",
      "Scopes, per-key rate limits and audit logs",
      "Rotation with overlapping validity; revocation; leak response and secret scanning",
      "Never ship secret keys in browser or mobile bundles",
    ],
  }),
  outline({
    slug: "email-verification-services",
    title: "Email verification and transactional email services",
    summary: "Verifying that a user owns an email address with signed, expiring links or codes, and sending it reliably through a transactional email provider with SPF, DKIM and DMARC.",
    level: "beginner",
    frequency: "medium",
    minutes: 25,
    prerequisites: ["backend/authentication-jwt-sessions"],
    related: ["backend/webhooks-dlq", "backend/api-key-security", "networks/dns", "distributed/idempotency-patterns"],
    tags: ["email", "verification", "spf", "dkim", "dmarc", "tokens"],
    sources: [
      { label: "OWASP Forgot Password Cheat Sheet (token handling)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html", kind: "docs" },
      { label: "RFC 7208 — Sender Policy Framework (SPF)", url: "https://datatracker.ietf.org/doc/html/rfc7208", kind: "docs" },
      { label: "RFC 6376 — DomainKeys Identified Mail (DKIM)", url: "https://datatracker.ietf.org/doc/html/rfc6376", kind: "docs" },
      { label: "RFC 7489 — DMARC", url: "https://datatracker.ietf.org/doc/html/rfc7489", kind: "docs" },
    ],
    objectives: [
      "Design a verification token: random, single-use, short-lived, stored hashed.",
      "Explain why a verification link shouldn't log the user in by itself on a different device without care.",
      "Send email asynchronously through a queue and a provider (SES, SendGrid, Postmark, Resend…), handling bounces via webhooks.",
      "Configure SPF, DKIM and DMARC so messages aren't marked as spam.",
    ],
    covers: [
      "Token generation, storage and expiry; codes vs magic links",
      "Rate limiting resend requests and avoiding account enumeration",
      "Provider webhooks for bounces/complaints; suppression lists",
      "DNS records for deliverability; the difference between syntax checks, MX checks and actual verification",
    ],
  }),
  outline({
    slug: "chrome-extension-internals",
    title: "Chrome extension internals (Manifest V3)",
    summary: "How a Chrome extension is put together: the manifest, the service-worker background, content scripts in isolated worlds, message passing and permissions.",
    level: "intermediate",
    frequency: "low",
    minutes: 30,
    prerequisites: ["javascript/event-loop", "javascript/dom"],
    related: ["networks/cors", "backend/csrf", "javascript/modules"],
    tags: ["chrome", "extensions", "manifest-v3", "service-worker", "content-scripts"],
    sources: [
      { label: "Chrome for Developers — Extensions documentation", url: "https://developer.chrome.com/docs/extensions", kind: "docs" },
      { label: "Manifest V3 overview", url: "https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3", kind: "docs" },
      { label: "Content scripts (isolated worlds)", url: "https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts", kind: "docs" },
      { label: "Message passing", url: "https://developer.chrome.com/docs/extensions/develop/concepts/messaging", kind: "docs" },
    ],
    objectives: [
      "Read a `manifest.json` and identify each component it declares.",
      "Explain why MV3 replaced persistent background pages with event-driven service workers (and what that means for in-memory state).",
      "Describe content scripts' isolated world: shared DOM, separate JavaScript globals.",
      "Pass messages between content scripts, the service worker and popup.",
      "Request minimal permissions and host permissions.",
    ],
    covers: [
      "Manifest V3 structure; service worker lifecycle and `chrome.storage`",
      "Content scripts, isolated worlds and injection via `chrome.scripting`",
      "`chrome.runtime` messaging and long-lived ports",
      "`declarativeNetRequest` vs the old blocking `webRequest`",
      "Security: CSP, remote code restrictions, review process",
    ],
  }),
  outline({
    slug: "wordpress-lamp-stack",
    title: "WordPress and the LAMP stack",
    summary: "How a classic LAMP request works — Linux, Apache, MySQL, PHP — and how WordPress builds pages from themes, plugins, hooks and the database on every request.",
    level: "beginner",
    frequency: "low",
    minutes: 30,
    prerequisites: ["networks/http", "os/processes-threads"],
    related: ["databases/indexing", "backend/redis", "cloud/cdn-cloudfront", "databases/connection-pooling"],
    tags: ["wordpress", "php", "lamp", "apache", "mysql", "caching"],
    sources: [
      { label: "WordPress Developer Resources", url: "https://developer.wordpress.org/", kind: "docs" },
      { label: "WordPress Plugin Handbook — Hooks", url: "https://developer.wordpress.org/plugins/hooks/", kind: "docs" },
      { label: "PHP Manual — OPcache", url: "https://www.php.net/manual/en/book.opcache.php", kind: "docs" },
      { label: "Apache HTTP Server documentation", url: "https://httpd.apache.org/docs/", kind: "docs" },
    ],
    objectives: [
      "Trace a request through Apache (or Nginx + PHP-FPM), PHP and MySQL.",
      "Explain PHP's share-nothing request model and what OPcache caches.",
      "Describe WordPress's actions and filters (hooks), themes and plugins.",
      "Know the main performance levers: page caching, object cache (Redis), CDN, database indexes.",
      "Recognise common security issues: outdated plugins, file permissions, `wp-config.php` secrets.",
    ],
    covers: [
      "LAMP vs LEMP; mod_php vs PHP-FPM",
      "WordPress bootstrap, The Loop, `wp_options` autoload and the database schema",
      "Hooks: actions vs filters",
      "Caching layers and hardening",
    ],
  }),
  outline({
    slug: "google-apps-script",
    title: "Google Apps Script",
    summary: "Server-side JavaScript hosted by Google that automates Sheets, Docs, Gmail and Drive: triggers, quotas, the V8 runtime and when to outgrow it.",
    level: "beginner",
    frequency: "low",
    minutes: 20,
    prerequisites: ["javascript/data-types", "javascript/sync-vs-async"],
    related: ["backend/webhooks-dlq", "backend/api-key-security"],
    tags: ["google-apps-script", "automation", "serverless", "triggers"],
    sources: [
      { label: "Apps Script documentation", url: "https://developers.google.com/apps-script", kind: "docs" },
      { label: "Apps Script — Triggers", url: "https://developers.google.com/apps-script/guides/triggers", kind: "docs" },
      { label: "Apps Script — Quotas for Google services", url: "https://developers.google.com/apps-script/guides/services/quotas", kind: "docs" },
      { label: "Apps Script — Web apps (doGet/doPost)", url: "https://developers.google.com/apps-script/guides/web", kind: "docs" },
    ],
    objectives: [
      "Write a bound script that reads and writes a Google Sheet in batches.",
      "Use simple and installable triggers (onEdit, time-driven) and know their limits.",
      "Expose a small web app or webhook endpoint with `doGet`/`doPost`.",
      "Understand execution-time and daily quotas, and why batching `getValues`/`setValues` matters.",
      "Store secrets in `PropertiesService`, not in code.",
    ],
    covers: [
      "Bound vs standalone scripts; the V8 runtime (synchronous service calls)",
      "SpreadsheetApp, GmailApp, DriveApp and UrlFetchApp",
      "Triggers, authorization scopes and quotas",
      "When to migrate to a real backend",
    ],
  }),
];
