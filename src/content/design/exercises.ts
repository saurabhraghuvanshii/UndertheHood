import type { DesignExercise } from "../types";

/**
 * Twelve worked system design exercises, ordered from beginner to expert.
 * Every number in `estimation` is shown with its arithmetic so it can be checked.
 * Architecture diagrams are conceptual: they show responsibilities and data flow,
 * not a literal deployment.
 */

// ---------------------------------------------------------------------------
// 1. URL shortener
// ---------------------------------------------------------------------------
const urlShortener: DesignExercise = {
  slug: "url-shortener",
  title: "URL shortener (bit.ly / TinyURL)",
  level: "beginner",
  summary:
    "Map long URLs to short codes and redirect at very high read QPS. The classic warm-up: key generation, a read-heavy KV store, caching and the 301-vs-302 analytics trade-off.",
  minutes: 60,
  status: "authored",
  functional: [
    "Create a short URL for a long URL; optionally accept a custom alias (e.g. `sho.rt/spring-sale`).",
    "Redirect `GET /{code}` to the original URL.",
    "Optional expiry per link; expired links return `410 Gone`.",
    "Owners can list and delete their links.",
    "Basic click analytics per link (total clicks, clicks per day, top referrers/countries).",
  ],
  nonFunctional: [
    "Redirect latency p99 < 50 ms server-side (it sits in front of every click).",
    "Availability 99.99% for redirects; creation can tolerate slightly lower availability.",
    "Short codes must never collide: one code maps to exactly one long URL, forever (until deletion/expiry).",
    "Codes should not be trivially enumerable (privacy of unlisted links).",
    "Read-heavy: ~100 reads per write. Analytics may be eventually consistent (minutes).",
  ],
  assumptions: [
    "100M new short URLs per day.",
    "Read:write ratio 100:1 → 10B redirects per day.",
    "Peak traffic = 3× average.",
    "Average stored record ≈ 500 bytes (long URL ~200 B + code, owner, timestamps, index overhead).",
    "Retention: 5 years.",
    "~1B distinct codes are accessed per day; traffic is heavily skewed (Pareto-ish 80/20).",
    "Click event ≈ 100 bytes (code, timestamp, country, referrer hash, UA class).",
  ],
  estimation: [
    { type: "p", text: "All numbers use 1 day = 86,400 s ≈ 10^5 s for sanity checks, but the exact division is shown." },
    {
      type: "table",
      head: ["Quantity", "Arithmetic", "Result"],
      rows: [
        ["Write QPS (avg)", "100,000,000 ÷ 86,400", "≈ 1,160 writes/s"],
        ["Write QPS (peak)", "1,160 × 3", "≈ 3,500 writes/s"],
        ["Read QPS (avg)", "10,000,000,000 ÷ 86,400", "≈ 115,700 reads/s"],
        ["Read QPS (peak)", "115,700 × 3", "≈ 347,000 reads/s"],
        ["Records over 5 years", "100M × 365 × 5", "182.5B records"],
        ["Storage over 5 years", "182.5B × 500 B", "≈ 91 TB (≈ 274 TB with 3× replication)"],
        ["Outbound redirect bandwidth (avg)", "115,700 × ~500 B response", "≈ 58 MB/s ≈ 460 Mbps"],
        ["Inbound create bandwidth (avg)", "1,160 × 500 B", "≈ 0.6 MB/s (negligible)"],
        ["Cache for hot set", "20% of 1B daily codes = 200M × 500 B", "≈ 100 GB"],
        ["Click events per day", "10B × 100 B", "≈ 1 TB/day raw (much less compressed)"],
      ],
    },
    {
      type: "table",
      head: ["Code length (base62)", "Keyspace", "Enough for 182.5B?"],
      rows: [
        ["6 chars", "62^6 ≈ 56.8 billion", "No — exhausted in ~1.5 years"],
        ["7 chars", "62^7 ≈ 3.52 trillion", "Yes — 182.5B is ~5% of the space"],
        ["8 chars", "62^8 ≈ 218 trillion", "Yes, but longer than needed"],
      ],
    },
    { type: "callout", tone: "tip", title: "What the numbers tell you", text: "Writes are trivial (~3.5k/s peak); the design is driven by **~350k redirects/s at peak** and a hot set that fits in ~100 GB of RAM. So: cache-first read path, a horizontally partitioned KV store, and keep the redirect service stateless." },
  ],
  api: [
    {
      type: "code",
      lang: "http",
      caption: "Create a short URL (idempotent with Idempotency-Key)",
      code: `POST /v1/urls HTTP/1.1
Authorization: Bearer <access-token>
Idempotency-Key: 5f0c2a8e-8a8b-4f7e-9d6b-2b1d3c4e5f60
Content-Type: application/json

{
  "long_url": "https://example.com/products/shoes?utm_source=newsletter",
  "custom_alias": "spring-sale",
  "expires_at": "2027-01-01T00:00:00Z"
}

HTTP/1.1 201 Created
Content-Type: application/json

{
  "code": "spring-sale",
  "short_url": "https://sho.rt/spring-sale",
  "long_url": "https://example.com/products/shoes?utm_source=newsletter",
  "expires_at": "2027-01-01T00:00:00Z",
  "created_at": "2026-10-05T10:00:00Z"
}`,
    },
    {
      type: "code",
      lang: "http",
      caption: "Redirect (the hot path)",
      code: `GET /aZ3kP9q HTTP/1.1
Host: sho.rt

HTTP/1.1 302 Found
Location: https://example.com/products/shoes?utm_source=newsletter
Cache-Control: private, max-age=0

# unknown code -> 404 Not Found, expired -> 410 Gone`,
    },
    {
      type: "code",
      lang: "http",
      caption: "Management and analytics",
      code: `GET    /v1/urls?cursor=<opaque>&limit=50      -> list my links (cursor pagination)
DELETE /v1/urls/{code}                         -> 204 No Content
GET    /v1/urls/{code}/stats?from=2026-10-01&to=2026-10-05

HTTP/1.1 200 OK
{ "code": "aZ3kP9q", "total_clicks": 18234,
  "by_day": [{ "date": "2026-10-04", "clicks": 5120 }],
  "top_countries": [{ "country": "IN", "clicks": 7001 }] }`,
    },
    { type: "callout", tone: "note", text: "Custom aliases are a **conditional insert** (`put if not exists`). A `409 Conflict` tells the caller the alias is taken. Without an alias the server generates the code, so retries must carry an `Idempotency-Key` or the client will get two different codes for one request." },
  ],
  dataModel: [
    {
      type: "code",
      lang: "sql",
      caption: "Primary mapping — modelled as a wide-column / KV table (Cassandra/DynamoDB style)",
      code: `-- Partition key: code. Every redirect is a single-partition point read.
CREATE TABLE urls (
  code        text PRIMARY KEY,      -- 7-char base62 or custom alias
  long_url    text,
  owner_id    bigint,
  created_at  timestamp,
  expires_at  timestamp              -- also used as a DB TTL where supported
);

-- "List my links": a separate table keyed by owner, clustered by time.
CREATE TABLE urls_by_owner (
  owner_id    bigint,
  created_at  timestamp,
  code        text,
  long_url    text,
  PRIMARY KEY ((owner_id), created_at, code)
) WITH CLUSTERING ORDER BY (created_at DESC);`,
    },
    {
      type: "table",
      head: ["Store", "Key / partitioning", "Why"],
      rows: [
        ["urls (KV)", "partition key `code` (hash-partitioned)", "Uniform spread because codes are random-looking; O(1) lookups; no joins needed."],
        ["urls_by_owner", "partition `owner_id`, cluster `created_at DESC`", "Owner listing is a single-partition range scan; written alongside `urls` (denormalised)."],
        ["ID ranges (ZooKeeper/etcd or a tiny SQL table)", "single row per range allocator", "Hands out blocks of 1M sequence numbers so app servers generate codes locally."],
        ["click_events (Kafka → OLAP, e.g. ClickHouse)", "partition by `code`, ordered by time", "Append-only analytics; aggregated into per-day rollups."],
      ],
    },
    { type: "callout", tone: "tip", text: "No relational features are needed on the hot path, so a KV/wide-column store that scales horizontally by hash of `code` is the natural fit. Postgres sharded by code also works at this scale — the point is that the access pattern is a single-key read." },
  ],
  architecture: {
    nodes: [
      { id: "client", label: "Browser / API client", kind: "client" },
      { id: "edge", label: "CDN + L7 load balancer", kind: "edge" },
      { id: "redirect", label: "Redirect service", kind: "service" },
      { id: "api", label: "Create/manage API", kind: "service" },
      { id: "idgen", label: "ID range allocator", kind: "service" },
      { id: "cache", label: "Redis cache (code → URL)", kind: "cache" },
      { id: "kv", label: "KV store (urls)", kind: "data" },
      { id: "clicks", label: "Kafka: click events", kind: "queue" },
      { id: "analytics", label: "Analytics aggregator", kind: "service" },
      { id: "olap", label: "OLAP store (rollups)", kind: "data" },
    ],
    edges: [
      { from: "client", to: "edge", label: "HTTPS" },
      { from: "edge", to: "redirect", label: "GET /{code}" },
      { from: "edge", to: "api", label: "POST /v1/urls" },
      { from: "api", to: "idgen", label: "lease ID block" },
      { from: "api", to: "kv", label: "conditional put" },
      { from: "redirect", to: "cache", label: "lookup" },
      { from: "redirect", to: "kv", label: "on miss" },
      { from: "redirect", to: "clicks", label: "async click event" },
      { from: "clicks", to: "analytics", label: "consume" },
      { from: "analytics", to: "olap", label: "rollups" },
    ],
    notes: [
      { type: "list", items: [
        "**Edge (CDN + LB)**: terminates TLS, absorbs abuse, routes `/{code}` to redirect service and `/v1/*` to the API. With 302 responses the CDN does not cache redirects for users, but it can cache `404`s briefly to blunt scanning.",
        "**Redirect service**: stateless; cache-aside lookup in Redis, fall back to the KV store, emit a click event fire-and-forget (never block the redirect on analytics).",
        "**Create/manage API**: validates URLs (scheme allow-list, malware/phishing check via a URL-reputation service), allocates codes, writes `urls` and `urls_by_owner`.",
        "**ID range allocator**: hands each API instance a block of 1M sequence numbers; the instance converts `permute(seq)` to base62 locally. One coordination call per million creates.",
        "**Redis**: ~100 GB hot set sharded across a few nodes; LRU eviction; negative caching of unknown codes for a short TTL.",
        "**KV store**: Cassandra/DynamoDB, RF=3, partitioned by `code`; reads at `LOCAL_QUORUM` or `ONE` (a code never changes after creation, so stale reads are not a risk except right after deletion).",
        "**Kafka → aggregator → OLAP**: click analytics are decoupled and eventually consistent.",
      ] },
    ],
  },
  flows: [
    {
      title: "Create (write path)",
      steps: [
        "Client sends `POST /v1/urls` with an `Idempotency-Key`; API authenticates and rate-limits per user.",
        "API validates the URL (scheme http/https only, length limit, reputation check).",
        "If a custom alias is given: conditional insert `IF NOT EXISTS`; on conflict return 409.",
        "Otherwise take the next number from the locally leased ID block, apply a bijective permutation (so codes are not sequential), base62-encode to 7 chars.",
        "Write `urls` (conditional put as a safety net) and `urls_by_owner`; store the idempotency key → response for 24 h.",
        "Return 201 with the short URL. Optionally pre-warm the cache.",
      ],
    },
    {
      title: "Redirect (read path)",
      steps: [
        "`GET /aZ3kP9q` hits the edge; routed to any redirect instance.",
        "Redis `GET url:aZ3kP9q` → hit (~95%+ of traffic) returns the long URL.",
        "On miss, read the KV store by partition key; populate Redis with a TTL (+ jitter). Unknown code → cache a short negative entry, return 404.",
        "Check `expires_at`; expired → 410.",
        "Respond `302 Found` with `Location`.",
        "Asynchronously publish a click event (code, ts, country from IP, referrer) to Kafka; drop rather than block if the producer buffer is full.",
      ],
    },
    {
      title: "Analytics",
      steps: [
        "Aggregator consumes click events, aggregates per (code, minute/day, country, referrer).",
        "Writes rollups to the OLAP store; stats API reads rollups (minutes of lag is acceptable).",
      ],
    },
  ],
  bottlenecks: [
    "Redirect read QPS (~350k/s peak) — solved by Redis + stateless horizontal redirect fleet; the KV store only sees cache misses.",
    "Hot links (a viral code getting 50k/s) — a single Redis shard owns that key; add an in-process LRU cache (seconds TTL) on redirect instances to absorb hot keys.",
    "Code generation contention — avoided by leasing ID blocks instead of hitting a central counter per create.",
    "Analytics write amplification — 10B events/day must not touch the OLTP store; Kafka + batch/stream aggregation.",
  ],
  failures: [
    { scenario: "Redis cluster node fails", mitigation: "Replica promotion (Redis Cluster/Sentinel); misses fall through to the KV store, which is sized to survive a partial cache loss. Request coalescing (single-flight) per key prevents a stampede on hot codes." },
    { scenario: "ID allocator unavailable", mitigation: "Each API instance holds a leased block (1M IDs ≈ minutes to hours of local creates) and requests the next block when 20% remains, so short outages are invisible. Unused IDs from crashed instances are simply skipped (the space is huge)." },
    { scenario: "KV store region outage", mitigation: "Multi-region replication; redirects served from the nearest healthy region. Mappings are immutable, so async cross-region replication is safe except for very recent creates." },
    { scenario: "Kafka unavailable", mitigation: "Redirects keep working; click events buffered locally then dropped with a metric. Analytics is best-effort by design." },
    { scenario: "Abuse: phishing/malware links", mitigation: "Reputation check at create time, re-scan periodically, ability to disable a code (tombstone + cache purge), per-account rate limits." },
  ],
  tradeoffs: [
    { decision: "301 vs 302 redirect", options: "301 Moved Permanently (browsers and proxies cache it) vs 302 Found / 307 (not cached by default).", choice: "302: every click reaches us, so analytics are accurate and links can be disabled or retargeted. 301 cuts load but you lose click counts and cannot change or kill the destination once cached. Pick 301 only when the product has no analytics and wants minimal load." },
    { decision: "Code generation strategy", options: "(a) hash(long URL) truncated to 7 chars + collision handling; (b) random 7 chars + check-and-retry; (c) counter/ID blocks + base62.", choice: "(c) with a bijective permutation: no collisions by construction, no read-before-write. (a) gives natural dedup but collisions grow with the birthday bound; (b) is simple but needs a conditional write and retries as the space fills." },
    { decision: "Dedup identical long URLs", options: "Return the existing code for the same long URL vs always mint a new code.", choice: "Mint per (owner, request): different owners want separate analytics. Optional per-owner dedup via an index on hash(owner, long_url)." },
    { decision: "Database", options: "Sharded SQL vs KV/wide-column store.", choice: "KV store: the only hot access pattern is point lookup by code; horizontal scaling and TTLs are built in. SQL is fine at smaller scale." },
  ],
  walkthrough: [
    { title: "1. Clarify functional requirements", detail: "\"Shorten, redirect, custom aliases, expiry, and per-link analytics — is that the scope? Do we need user accounts and link editing? I'll assume accounts exist, links are immutable once created except delete, and analytics can lag by minutes.\"" },
    { title: "2. Non-functional requirements", detail: "\"Redirects are on the critical path of every click, so low latency (p99 < 50 ms server-side) and four nines availability matter more than create latency. Codes must be unique forever and ideally not guessable.\"" },
    { title: "3. Assumptions", detail: "\"Let's say 100M creates a day, 100:1 reads to writes, 3× peak, 5-year retention, ~500 bytes per record.\"" },
    { title: "4. Estimate", detail: "\"That's ~1.2k writes/s and ~116k reads/s average, ~350k/s peak. 182.5B records × 500 B ≈ 91 TB over 5 years. 62^6 is only ~57B, so I need 7 base62 characters (~3.5T). The hot set — 20% of 1B daily codes — is ~100 GB, which fits in RAM.\"" },
    { title: "5. API and data model", detail: "\"POST /v1/urls with an idempotency key, GET /{code} returning 302, plus list/delete/stats. Storage is a KV table keyed by code, and a second table keyed by owner for listing.\"" },
    { title: "6. High-level design", detail: "\"Edge → stateless redirect service → Redis → KV store. Creates go through an API service that leases ID blocks. Clicks go to Kafka and an aggregator writes rollups to an OLAP store.\"" },
    { title: "7. Main flows", detail: "\"Walk the create path (validate, allocate, permute, encode, conditional put) and the redirect path (cache, KV on miss, negative cache, 302, async click event).\"" },
    { title: "8. Bottlenecks", detail: "\"The read path dominates; hot keys can overload one Redis shard, so I'd add a small in-process cache. Analytics volume (10B/day) must never touch the OLTP store.\"" },
    { title: "9. Component choices", detail: "\"Counter blocks over hashing because collisions are impossible and there's no read-before-write; permute the counter so codes aren't sequential. Cassandra/DynamoDB because it's a pure point-lookup workload.\"" },
    { title: "10. Scaling, consistency, failure", detail: "\"Everything stateless scales horizontally; KV is hash-partitioned by code. Mappings are immutable, so eventual consistency across regions is fine — the one edge case is reading a link milliseconds after creation in another region, solved by reading the home region on miss. Cache loss degrades to KV reads.\"" },
    { title: "11. Security, observability, ops", detail: "\"URL reputation checks, scheme allow-list, rate limits per account and per IP, ability to tombstone malicious codes. Metrics: redirect p99, cache hit ratio, 404 rate (scanning signal), Kafka lag.\"" },
    { title: "12. Trade-offs", detail: "\"302 over 301 to keep analytics and the ability to disable links, at the cost of more traffic. If the interviewer drops analytics, 301 plus CDN caching would cut our load dramatically.\"" },
  ],
  followUps: [
    { q: "Why not just use MD5 of the URL and take 7 characters?", a: "Truncated hashes collide; by the birthday bound you expect a collision after roughly sqrt(3.5T) ≈ 1.9M URLs, so you need a check-and-retry loop (read-before-write) on every create. The same URL also always maps to the same code, which breaks per-owner analytics. A counter + permutation has zero collisions and no extra reads." },
    { q: "How do you stop people enumerating codes?", a: "Don't expose raw sequence numbers: apply a keyed bijective permutation (e.g. a small Feistel network or multiplication by a secret odd constant modulo 62^7) before base62 encoding. Add rate limits on 404s per IP, and offer longer codes for sensitive links." },
    { q: "How would you support link expiry efficiently?", a: "Store `expires_at`, check it on read (return 410), and use the database's native TTL (Cassandra/DynamoDB) to delete rows asynchronously. Set the cache TTL to min(default TTL, time until expiry)." },
    { q: "A link goes viral at 100k clicks/s. What breaks?", a: "One Redis shard owns that key and becomes hot. Mitigate with an in-process LRU on each redirect instance (1–5 s TTL), or replicate hot keys across shards with suffixes. Analytics for that code should be pre-aggregated in the producer (count per second) rather than 100k individual events." },
    { q: "How do you delete a link quickly everywhere?", a: "Write a tombstone in the KV store, delete from Redis, and broadcast an invalidation for in-process caches (short TTLs bound the worst case). This is a big reason to prefer 302: with 301, browsers may keep redirecting from their own cache indefinitely." },
  ],
  related: [
    "system-design/interview-framework",
    "system-design/capacity-estimation",
    "system-design/caching-strategies",
    "system-design/sql-vs-nosql",
    "system-design/sharding-partitioning",
    "system-design/api-idempotency",
    "system-design/rate-limiting",
    "networks/http-caching",
    "dsa/hash-tables",
  ],
};

// ---------------------------------------------------------------------------
// 2. Distributed rate limiter
// ---------------------------------------------------------------------------
const rateLimiter: DesignExercise = {
  slug: "rate-limiter",
  title: "Distributed rate limiter",
  level: "intermediate",
  summary:
    "Enforce per-key request limits across a fleet of stateless gateways with ~1 ms overhead. Covers token bucket vs sliding window algorithms, atomic Redis Lua scripts, fail-open vs fail-closed and hot keys.",
  minutes: 60,
  status: "authored",
  functional: [
    "Limit requests per identity: API key, user ID, IP address, or (key, endpoint) combinations.",
    "Support multiple rules per request, e.g. 100 req/s burst AND 10,000 req/day per API key.",
    "Rules are configurable at runtime without redeploys (per plan/tier, per endpoint).",
    "Rejected requests get `429 Too Many Requests` with `Retry-After` and `RateLimit-*` headers.",
    "Expose current usage to clients (remaining quota).",
  ],
  nonFunctional: [
    "Added latency p99 < 2 ms per request (limiter is on every request).",
    "Accurate across many gateway instances: a client must not get N× the limit by spreading requests over N instances.",
    "Highly available: limiter failure must not take down the API (explicit fail-open/fail-closed policy).",
    "Scales to ~1M checks/s at peak.",
    "Small over-admission (a few %) is acceptable; under-admission of legitimate traffic is worse.",
  ],
  assumptions: [
    "500k requests/s average across the API fleet, 1M/s peak.",
    "10M distinct active identities per day, each subject to ~3 rules → 30M active limiter keys.",
    "200 gateway instances in each of 2 regions; limits are enforced per region (global limits discussed as a follow-up).",
    "A Redis primary handles roughly 100k–200k simple Lua script calls/s (order-of-magnitude, workload-dependent).",
    "Token-bucket state per key ≈ 200 bytes in Redis including key name and per-key overhead.",
  ],
  estimation: [
    {
      type: "table",
      head: ["Quantity", "Arithmetic", "Result"],
      rows: [
        ["Limiter checks (peak)", "1M req/s × 1 script call (all rules evaluated in one script)", "1M Redis calls/s"],
        ["Redis shards needed", "1M ÷ ~100k calls/s per primary", "≈ 10 primaries; run 16 for headroom (+1 replica each)"],
        ["Token bucket memory", "30M keys × 200 B", "≈ 6 GB total (tiny)"],
        ["Sliding-window-log memory (worst case)", "10M keys at a 1,000 req/min limit × 1,000 entries × ~40 B", "10M × 1,000 × 40 B = 400 GB"],
        ["Sliding-window-counter memory", "30M keys × 2 counters × ~100 B", "≈ 6 GB"],
        ["Network to Redis", "1M calls/s × ~200 B request+response", "≈ 200 MB/s across the cluster"],
        ["Latency budget", "same-AZ Redis RTT ~0.2–0.5 ms + script ~10–50 µs", "fits in the 2 ms p99 budget"],
      ],
    },
    { type: "callout", tone: "tip", title: "What the numbers tell you", text: "Memory is a non-issue for counters/buckets but the **sliding window log** is ~65× bigger — that's the quantitative reason to reject it at scale. The real constraint is **ops/s on Redis**, which drives sharding and the 'one round-trip per request' rule." },
  ],
  api: [
    {
      type: "code",
      lang: "http",
      caption: "What a client sees",
      code: `GET /v1/orders HTTP/1.1
Authorization: Bearer sk_live_...

HTTP/1.1 200 OK
RateLimit-Limit: 100
RateLimit-Remaining: 37
RateLimit-Reset: 1

HTTP/1.1 429 Too Many Requests
Retry-After: 2
RateLimit-Limit: 100
RateLimit-Remaining: 0
Content-Type: application/json

{ "error": "rate_limited", "rule": "api_key_per_second", "retry_after_ms": 1800 }`,
    },
    {
      type: "code",
      lang: "json",
      caption: "Internal: rule configuration (pushed to gateways by the rules service)",
      code: `{
  "rules": [
    { "id": "api_key_per_second", "match": { "plan": "pro" },
      "key": "api_key", "algorithm": "token_bucket", "capacity": 100, "refill_per_sec": 50 },
    { "id": "api_key_per_day", "match": { "plan": "pro" },
      "key": "api_key", "algorithm": "fixed_window", "limit": 1000000, "window_sec": 86400 },
    { "id": "login_per_ip", "match": { "route": "POST /v1/login" },
      "key": "ip", "algorithm": "sliding_window_counter", "limit": 10, "window_sec": 60 }
  ],
  "failure_mode": { "default": "open", "POST /v1/login": "closed" }
}`,
    },
    { type: "callout", tone: "note", text: "The limiter is usually a **library/middleware in the gateway** calling Redis directly, not a separate network service — an extra hop would eat the latency budget. A sidecar or Envoy's global rate limit service is the alternative when many languages must share it." },
  ],
  dataModel: [
    {
      type: "table",
      head: ["Redis key", "Type / fields", "TTL", "Why"],
      rows: [
        ["`rl:{api_key}:tb:api_key_per_second`", "HASH `tokens`, `ts_ms`", "≈ time to refill fully (capacity ÷ rate) + margin", "Token bucket state; 2 fields updated atomically."],
        ["`rl:{api_key}:sw:login_per_ip:{window_start}`", "STRING counter", "2 × window", "Sliding-window counter keeps current and previous window counts."],
        ["`rl:{api_key}:fw:api_key_per_day:{yyyymmdd}`", "STRING counter (INCR)", "window + margin", "Fixed window for coarse daily quotas."],
      ],
    },
    { type: "p", text: "The `{api_key}` part is a Redis Cluster **hash tag**: everything inside braces is hashed to choose the slot, so all rules for one identity live on the same shard and a single Lua script can evaluate them atomically (multi-key scripts must stay within one slot)." },
    {
      type: "code",
      lang: "sql",
      caption: "Rules live in a small relational table (source of truth), cached in every gateway",
      code: `CREATE TABLE rate_limit_rules (
  id              text PRIMARY KEY,
  match_plan      text,
  match_route     text,
  key_type        text NOT NULL,          -- api_key | user_id | ip
  algorithm       text NOT NULL,          -- token_bucket | sliding_window_counter | fixed_window
  capacity        int,
  refill_per_sec  numeric,
  window_sec      int,
  failure_mode    text NOT NULL DEFAULT 'open',
  version         bigint NOT NULL,
  updated_at      timestamptz NOT NULL DEFAULT now()
);`,
    },
    {
      type: "code",
      lang: "text",
      caption: "Token bucket as a Redis Lua script — atomic read-modify-write in one round-trip",
      code: `-- KEYS[1] = bucket key; ARGV = capacity, refill_per_ms, now_ms, cost
local cap    = tonumber(ARGV[1])
local rate   = tonumber(ARGV[2])
local now    = tonumber(ARGV[3])
local cost   = tonumber(ARGV[4])
local b      = redis.call('HMGET', KEYS[1], 'tokens', 'ts')
local tokens = tonumber(b[1]) or cap
local ts     = tonumber(b[2]) or now
tokens = math.min(cap, tokens + math.max(0, now - ts) * rate)
local allowed = 0
if tokens >= cost then tokens = tokens - cost; allowed = 1 end
redis.call('HSET', KEYS[1], 'tokens', tokens, 'ts', now)
redis.call('PEXPIRE', KEYS[1], math.ceil(cap / rate) + 1000)
return { allowed, tokens }`,
    },
    { type: "callout", tone: "warning", title: "Why a script and not GET then SET", text: "Two gateways doing GET → compute → SET concurrently both read 1 token and both admit: a classic lost update. Redis runs a Lua script **atomically** (no other command interleaves), so read-refill-decrement-write is one indivisible step. Pass `now` from the gateway or call `redis.call('TIME')` inside the script to avoid clock skew between gateways." },
  ],
  architecture: {
    nodes: [
      { id: "client", label: "API clients", kind: "client" },
      { id: "lb", label: "Load balancer", kind: "edge" },
      { id: "gateway", label: "API gateway + limiter middleware", kind: "service" },
      { id: "local", label: "In-process rule cache + local counters", kind: "cache" },
      { id: "redis", label: "Redis Cluster (limiter state)", kind: "cache" },
      { id: "rules", label: "Rules service", kind: "service" },
      { id: "rulesdb", label: "Rules DB", kind: "data" },
      { id: "backend", label: "Backend services", kind: "service" },
      { id: "metrics", label: "Metrics / logs pipeline", kind: "queue" },
    ],
    edges: [
      { from: "client", to: "lb", label: "HTTPS" },
      { from: "lb", to: "gateway", label: "round robin" },
      { from: "gateway", to: "local", label: "rules lookup" },
      { from: "gateway", to: "redis", label: "EVALSHA (1 RTT)" },
      { from: "gateway", to: "backend", label: "allowed requests" },
      { from: "rules", to: "rulesdb", label: "CRUD" },
      { from: "rules", to: "gateway", label: "push rule versions" },
      { from: "gateway", to: "metrics", label: "allow/deny counts" },
    ],
    notes: [
      { type: "list", items: [
        "**Gateway middleware**: extracts identities (API key, user, IP), finds matching rules from the in-memory rule cache, and evaluates all rules for that identity in **one** Lua call. Returns 429 or forwards.",
        "**In-process cache**: rules (pushed or polled with a version number) and, optionally, a local pre-filter: if a key was denied in the last few hundred ms, deny locally without calling Redis — protects Redis from abusive clients.",
        "**Redis Cluster**: sharded by hash slot; hash tags keep one identity's keys together. Replicas exist for failover, but limiter state is ephemeral — losing it means briefly over-admitting, not data loss.",
        "**Rules service/DB**: source of truth; changes are versioned and propagated within seconds.",
        "**Metrics**: per-rule allow/deny counts, Redis latency, fail-open events — needed to tune limits and spot attacks.",
      ] },
      { type: "compare", items: [
        { title: "Token bucket", points: ["Allows bursts up to capacity, then a steady refill rate", "2 numbers of state per key", "Best default for APIs"] },
        { title: "Fixed window counter", points: ["`INCR` + `EXPIRE` — simplest", "Boundary burst: up to 2× limit across a window edge", "Fine for coarse daily quotas"] },
        { title: "Sliding window log", points: ["Exact: sorted set of timestamps", "Memory O(limit) per key — 400 GB in our estimate", "Only for low limits (e.g. 5 logins/min)"] },
        { title: "Sliding window counter", points: ["Weighted: prev × overlap + current", "2 counters per key, near-exact (assumes uniform rate in prev window)", "Good accuracy/cost compromise"] },
      ] },
      { type: "viz", id: "sys-rate-limiter", caption: "Token bucket: refill rate, capacity and bursts." },
    ],
  },
  flows: [
    {
      title: "Allowed request",
      steps: [
        "Gateway authenticates the request and resolves identities (api_key=K, ip=I, route=R).",
        "Looks up matching rules in its in-memory rule cache (no network).",
        "Calls `EVALSHA` on the Redis shard that owns hash tag `{K}` with all rule params and `cost=1`.",
        "Script refills and decrements each bucket atomically; returns allowed=1 and remaining tokens.",
        "Gateway forwards to the backend and adds `RateLimit-*` headers to the response.",
      ],
    },
    {
      title: "Rejected request",
      steps: [
        "Script returns allowed=0 and the time until the next token: (cost − tokens) ÷ refill rate.",
        "Gateway responds 429 with `Retry-After`, records a deny metric, and caches 'denied until T' locally to short-circuit repeat offenders.",
      ],
    },
    {
      title: "Rule change",
      steps: [
        "Operator updates a rule; rules service bumps the version and stores it.",
        "Gateways receive the push (or poll every few seconds), atomically swap their rule table.",
        "Existing bucket state remains valid; a new capacity applies on the next refill computation.",
      ],
    },
  ],
  bottlenecks: [
    "Redis ops/s — one round-trip per request; keep all rules for an identity in one script call and shard by identity.",
    "Hot keys — a single huge tenant or an attacker hammering one key concentrates load on one shard; use local deny caching and, for very large tenants, split the limit into N sub-buckets (key#0..key#N-1) each with limit/N.",
    "Network RTT — Redis must be in the same AZ/region as gateways; cross-region calls would blow the latency budget.",
    "Rule matching cost — precompile rules into a map keyed by (plan, route) rather than scanning a list per request.",
  ],
  failures: [
    { scenario: "Redis shard unavailable or slow (> 5 ms)", mitigation: "Short client timeout (e.g. 5 ms) + circuit breaker. Apply the per-rule failure mode: **fail open** for normal API traffic (availability over strictness), **fail closed** for security-sensitive routes like login/OTP. Optionally fall back to a conservative local limiter (global limit ÷ instance count)." },
    { scenario: "Redis failover loses recent writes", mitigation: "Async replication means a promoted replica may have slightly stale buckets → brief over-admission. Acceptable by the NFRs; document it." },
    { scenario: "Clock skew between gateways", mitigation: "Use Redis server time (`TIME` inside the script) as the single clock, or monotonic per-key timestamps (never move `ts` backwards)." },
    { scenario: "Bad rule pushed (limit = 0)", mitigation: "Validation + staged rollout of rule changes, dry-run/shadow mode that logs would-be denials before enforcing, instant rollback by version." },
  ],
  tradeoffs: [
    { decision: "Algorithm", options: "Token bucket vs fixed window vs sliding window log vs sliding window counter.", choice: "Token bucket for per-second API limits (bursty clients, tiny state); fixed window for daily quotas; sliding window log only for very small limits on sensitive endpoints." },
    { decision: "Centralised (Redis) vs local-only counters", options: "Local in-memory limits per instance (no network, inaccurate with N instances) vs shared Redis (accurate, adds ~0.5 ms).", choice: "Redis as source of truth plus local deny-caching. For extreme scale, a hybrid: instances lease batches of tokens (e.g. 10 at a time) from Redis, trading a little accuracy for 10× fewer calls." },
    { decision: "Fail open vs fail closed", options: "Admit everything when the limiter is down vs reject everything.", choice: "Per rule. Default open (the limiter protects capacity; a short outage of the limiter rarely matters), closed for abuse-sensitive endpoints." },
    { decision: "Per-region vs global limits", options: "Independent limits per region vs a global counter.", choice: "Per region with the limit split by expected traffic share; global sync (async counter replication) only for billing-grade quotas where seconds of lag are fine." },
  ],
  walkthrough: [
    { title: "1. Clarify functional requirements", detail: "\"Is this client-side throttling or server-side protection? I'll assume server-side, at the API gateway, keyed by API key, user and IP, with multiple rules per request and runtime-configurable limits. Rejected calls get 429 with Retry-After.\"" },
    { title: "2. Non-functional requirements", detail: "\"It runs on every request, so it must add under ~2 ms p99 and must never become the reason the API is down. It must be accurate across hundreds of gateway instances, but a few percent over-admission is acceptable.\"" },
    { title: "3. Assumptions", detail: "\"1M requests/s peak, 30M active limiter keys, 200 gateway instances per region, limits enforced per region.\"" },
    { title: "4. Estimate", detail: "\"1M checks/s means ~10 Redis primaries at ~100k scripts/s each; I'd provision 16. Token bucket state is ~6 GB total. A sliding window log would need ~400 GB, which rules it out for high limits.\"" },
    { title: "5. API and data model", detail: "\"Client-facing contract is headers and 429. Internally: rules in a small SQL table pushed to gateways; limiter state in Redis hashes keyed by identity with a hash tag so one identity's rules share a shard.\"" },
    { title: "6. High-level design", detail: "\"LB → gateways with limiter middleware → Redis Cluster. A rules service pushes config. No separate limiter service on the hot path, to save a hop.\"" },
    { title: "7. Main flows", detail: "\"Resolve identity, match rules locally, one EVALSHA that refills and decrements atomically, then forward or 429 with Retry-After computed from the refill rate.\"" },
    { title: "8. Bottlenecks", detail: "\"Redis ops/s and hot keys. I'd cache denials locally for a few hundred ms and split giant tenants into sub-buckets.\"" },
    { title: "9. Component choices", detail: "\"Token bucket because it models bursts naturally with two numbers of state. Redis because it's in-memory, single-threaded per shard so Lua scripts are atomic, and supports TTLs so idle keys clean themselves up.\"" },
    { title: "10. Scaling, consistency, failure", detail: "\"Scale by adding shards. Consistency is per key on one primary; failover can lose a few updates — acceptable. Timeouts of a few ms with a circuit breaker and per-rule fail-open/fail-closed.\"" },
    { title: "11. Security, observability, ops", detail: "\"Identify clients before limiting (IP-only limits are weak behind NAT and easy to rotate). Dashboards for allow/deny per rule, Redis latency, fail-open count. Shadow mode for new rules.\"" },
    { title: "12. Trade-offs", detail: "\"Accuracy vs latency: exact global limits need coordination; I'm choosing per-region Redis accuracy with optional token leasing if we outgrow it.\"" },
  ],
  followUps: [
    { q: "How do you enforce a global limit across regions?", a: "Options: route each tenant to a home region for limiting (adds latency for remote traffic); split the limit across regions by traffic share and rebalance periodically; or keep local counters and asynchronously gossip/aggregate usage (CRDT-like G-counters) accepting seconds of over-admission. Exact global limits require a cross-region round trip per request, which is rarely worth it." },
    { q: "Why does the fixed window allow 2× bursts?", a: "With a 100/min window, a client can send 100 at 00:59 and 100 at 01:00 — 200 requests in about one second, both windows individually within limit. The sliding window counter fixes most of this by weighting the previous window by its overlap with the last 60 s." },
    { q: "Can you do it without Redis?", a: "Yes: consistent-hash each identity to one limiter instance (sticky routing) and keep state in memory there; or use local limits of limit ÷ N per instance (inaccurate with uneven load balancing). Envoy's local rate limit and global rate limit service are real-world examples of each." },
    { q: "How do you rate-limit by cost rather than request count?", a: "Make `cost` a parameter of the bucket: a cheap GET costs 1 token, an expensive export costs 50. GraphQL APIs often compute cost from query complexity before execution." },
    { q: "What headers should you return and why?", a: "`Retry-After` (seconds or HTTP date) tells well-behaved clients when to retry; `RateLimit-Limit/Remaining/Reset` (IETF draft; many APIs use `X-RateLimit-*`) let clients self-throttle before hitting 429. Clients should retry with exponential backoff and jitter." },
  ],
  related: [
    "system-design/rate-limiting",
    "system-design/caching-strategies",
    "system-design/sharding-partitioning",
    "system-design/fail-fast-graceful-degradation",
    "system-design/circuit-breakers-timeouts-retries",
    "system-design/backpressure",
    "backend/redis",
    "dsa/hash-tables",
  ],
};

// ---------------------------------------------------------------------------
// 3. Notification service
// ---------------------------------------------------------------------------
const notificationService: DesignExercise = {
  slug: "notification-service",
  title: "Notification service (push, email, SMS, in-app)",
  level: "intermediate",
  summary:
    "A shared platform that internal services call to notify users across channels. Covers preferences, templating, priority queues, provider failover, retries with idempotency, per-user throttling and campaign fan-out.",
  minutes: 70,
  status: "authored",
  functional: [
    "Internal services send a notification to a user (or a segment) with a template ID and variables.",
    "Channels: mobile push (APNs/FCM), email, SMS, and an in-app inbox.",
    "Respect user preferences (opt-outs per category and channel, quiet hours, time zone).",
    "Priorities: transactional (OTP, password reset) vs marketing; scheduled sends.",
    "Delivery status tracking (queued, sent, delivered, failed, opened) and per-notification history.",
    "Deduplicate: the same event must not notify the same user twice.",
  ],
  nonFunctional: [
    "Transactional notifications handed to the provider within ~5 s p99; marketing can take minutes.",
    "At-least-once internally, effectively-once to the user via idempotency keys.",
    "Isolation: a 100M-user marketing campaign must not delay OTPs.",
    "Survive provider outages (fail over to a secondary provider where possible).",
    "Highly available ingestion (99.99%); durable once accepted (no silent drops).",
  ],
  assumptions: [
    "300M registered users, ~2 devices each.",
    "500M notifications/day on average: 70% push, 20% email, 5% SMS, 5% in-app only.",
    "Marketing campaigns create bursts of 10× average.",
    "Stored notification record ≈ 1 KB (rendered payload + status history); kept 90 days.",
    "Device token record ≈ 200 B.",
  ],
  estimation: [
    {
      type: "table",
      head: ["Quantity", "Arithmetic", "Result"],
      rows: [
        ["Average send rate", "500,000,000 ÷ 86,400", "≈ 5,800/s"],
        ["Campaign peak", "5,800 × 10", "≈ 58,000/s"],
        ["Push / email / SMS per day", "500M × 70% / 20% / 5%", "350M / 100M / 25M"],
        ["SMS rate (avg)", "25,000,000 ÷ 86,400", "≈ 290/s (expensive; provider throughput limits matter)"],
        ["Notification log per day", "500M × 1 KB", "500 GB/day"],
        ["Log retention (90 days)", "500 GB × 90", "45 TB (≈ 135 TB at RF=3)"],
        ["Device tokens", "300M users × 2 × 200 B", "≈ 120 GB"],
        ["Time to send a 100M-user campaign at peak rate", "100,000,000 ÷ 58,000/s", "≈ 1,720 s ≈ 29 min"],
      ],
    },
    { type: "callout", tone: "tip", title: "What the numbers tell you", text: "Throughput is modest per channel; the hard parts are **burst isolation** (campaigns vs OTPs), **external provider limits/failures**, and **not double-sending** under retries." },
  ],
  api: [
    {
      type: "code",
      lang: "http",
      caption: "Send to one user",
      code: `POST /v1/notifications HTTP/1.1
Authorization: Bearer <service-token>
Idempotency-Key: order-shipped:ord_8812:user_42
Content-Type: application/json

{
  "user_id": "user_42",
  "category": "order_updates",
  "priority": "high",
  "template_id": "order_shipped_v3",
  "data": { "order_id": "ord_8812", "eta": "2026-10-07" },
  "channels": ["push", "email"],
  "send_at": null
}

HTTP/1.1 202 Accepted
{ "notification_id": "ntf_01JAB3...", "status": "queued" }`,
    },
    {
      type: "code",
      lang: "http",
      caption: "Campaign, status, preferences, inbox",
      code: `POST /v1/campaigns                 { "segment_id": "seg_eu_active", "template_id": "...", "send_at": "..." }
GET  /v1/notifications/{id}        -> { "status": "delivered", "attempts": [...] }
GET  /v1/users/{id}/preferences    -> { "order_updates": { "push": true, "email": false }, "quiet_hours": "22:00-07:00", "tz": "Asia/Kolkata" }
PUT  /v1/users/{id}/preferences
GET  /v1/users/{id}/inbox?cursor=...&limit=20
POST /v1/devices                   { "user_id": "...", "platform": "ios", "token": "..." }`,
    },
    { type: "callout", tone: "note", text: "Returning **202 Accepted** is deliberate: the caller only needs to know the request is durably queued. The idempotency key is derived from the business event (`event:entity:user`) so a retried upstream call cannot produce a second notification." },
  ],
  dataModel: [
    {
      type: "code",
      lang: "sql",
      caption: "Core tables",
      code: `-- Wide-column (Cassandra): high write volume, queried by user or by id.
CREATE TABLE notifications_by_user (
  user_id        text,
  created_at     timeuuid,
  notification_id text,
  category       text,
  channel        text,
  status         text,       -- queued | sent | delivered | failed | read
  rendered       text,
  PRIMARY KEY ((user_id), created_at)
) WITH CLUSTERING ORDER BY (created_at DESC) AND default_time_to_live = 7776000; -- 90 days

-- Idempotency: insert-if-not-exists with TTL (e.g. 7 days)
CREATE TABLE idempotency_keys (
  idem_key        text PRIMARY KEY,
  notification_id text
) WITH default_time_to_live = 604800;

-- Relational (Postgres), small and strongly consistent:
CREATE TABLE preferences (
  user_id     bigint,
  category    text,
  channel     text,
  enabled     boolean NOT NULL,
  PRIMARY KEY (user_id, category, channel)
);
CREATE TABLE devices (
  device_id   uuid PRIMARY KEY,
  user_id     bigint NOT NULL,
  platform    text NOT NULL,     -- ios | android | web
  token       text NOT NULL UNIQUE,
  last_seen   timestamptz
);
CREATE INDEX devices_user_idx ON devices (user_id);
CREATE TABLE templates (
  template_id text, version int, channel text, locale text, body text,
  PRIMARY KEY (template_id, version, channel, locale)
);`,
    },
    { type: "p", text: "Preferences and devices are read on every send, so they are cached (Redis, keyed by `user_id`) with invalidation on update. Notification history is partitioned by `user_id` because the inbox query is 'latest N for a user'." },
  ],
  architecture: {
    nodes: [
      { id: "producers", label: "Internal services", kind: "client" },
      { id: "api", label: "Notification API", kind: "service" },
      { id: "prefs", label: "Preference + device service", kind: "service" },
      { id: "cache", label: "Redis (prefs, devices, dedup)", kind: "cache" },
      { id: "queues", label: "Kafka topics per channel × priority", kind: "queue" },
      { id: "scheduler", label: "Scheduler / campaign fan-out", kind: "service" },
      { id: "workers", label: "Channel workers (render + send)", kind: "service" },
      { id: "providers", label: "APNs / FCM / SES / Twilio", kind: "external" },
      { id: "store", label: "Notification store (Cassandra)", kind: "data" },
      { id: "retry", label: "Retry topics + DLQ", kind: "queue" },
    ],
    edges: [
      { from: "producers", to: "api", label: "POST /v1/notifications" },
      { from: "api", to: "cache", label: "idempotency check" },
      { from: "api", to: "prefs", label: "resolve prefs + devices" },
      { from: "prefs", to: "cache", label: "read-through" },
      { from: "api", to: "queues", label: "enqueue per channel" },
      { from: "api", to: "scheduler", label: "send_at / campaigns" },
      { from: "scheduler", to: "queues", label: "release when due" },
      { from: "queues", to: "workers", label: "consume" },
      { from: "workers", to: "providers", label: "send" },
      { from: "workers", to: "store", label: "status updates" },
      { from: "workers", to: "retry", label: "transient failures" },
      { from: "retry", to: "workers", label: "delayed redelivery" },
    ],
    notes: [
      { type: "list", items: [
        "**Notification API**: auth for internal callers, schema validation, idempotency insert-if-absent, preference filtering, then writes one message per (user, channel) to the right topic. Returns 202.",
        "**Preference/device service**: owns opt-outs, quiet hours, locales and device tokens; cached heavily.",
        "**Kafka topics** split by channel and priority (`push.high`, `push.low`, `email.high`, ...). Separate consumer groups and capacity per topic give **bulkhead isolation**: campaigns fill `*.low` without touching OTP latency.",
        "**Scheduler**: stores future sends (time-bucketed table) and releases them; expands campaigns by paging through the segment and enqueueing in batches at a controlled rate.",
        "**Channel workers**: render the template (locale, variables), apply per-user frequency caps, call the provider with timeouts, record status. One worker pool per channel so a slow SMS provider cannot starve push.",
        "**Retry topics + DLQ**: transient failures go to delay topics (e.g. 1 min, 10 min, 1 h); after max attempts the message lands in a DLQ for inspection/replay.",
        "**Providers**: external; device tokens reported invalid (APNs 410 / FCM UNREGISTERED) are deleted.",
      ] },
    ],
  },
  flows: [
    {
      title: "Transactional send (e.g. order shipped)",
      steps: [
        "Order service calls `POST /v1/notifications` with an idempotency key derived from the event.",
        "API does `SET idem:<key> NX EX 604800` (or an `IF NOT EXISTS` insert); if the key exists, return the original notification ID.",
        "Load preferences and devices (cache); drop disabled channels; defer if inside quiet hours (unless the category is exempt, like OTP).",
        "Write a `queued` record and enqueue one message per channel to `push.high` / `email.high`; respond 202.",
        "Push worker renders the template, calls APNs/FCM per device with a 2–5 s timeout, marks `sent`.",
        "Delivery/open callbacks (email webhooks, push receipts) update the status asynchronously.",
      ],
    },
    {
      title: "Campaign to a segment",
      steps: [
        "Marketing creates a campaign; scheduler snapshots the segment (user IDs) at send time.",
        "Scheduler pages through users in batches of e.g. 1,000, enqueuing into `*.low` topics with a token-bucket send rate.",
        "Workers apply preference and frequency caps per user (e.g. max 3 marketing pushes/day) before sending.",
        "Progress is checkpointed per batch so a crashed scheduler resumes without resending earlier batches.",
      ],
    },
    {
      title: "Failure and retry",
      steps: [
        "Provider returns 5xx/timeout → worker publishes to the retry topic with attempt+1 and backoff with jitter.",
        "Provider returns a permanent error (invalid token, hard bounce) → mark failed, clean up token/address, no retry.",
        "After N attempts → DLQ + alert; operators can replay after fixing the cause.",
      ],
    },
  ],
  bottlenecks: [
    "Campaign bursts — throttle fan-out and isolate by priority topic; autoscale low-priority workers on consumer lag.",
    "Provider rate limits (especially SMS and email reputation/warm-up) — per-provider token buckets in workers.",
    "Preference lookups on every send — cache with explicit invalidation; batch lookups during campaigns.",
    "Hot users (a user receiving many notifications) — per-user frequency caps and digesting (\"5 new likes\").",
  ],
  failures: [
    { scenario: "Primary SMS/email provider outage", mitigation: "Circuit breaker per provider; route to the secondary provider for that channel. Keep templates provider-agnostic." },
    { scenario: "Worker crashes after sending but before committing the Kafka offset", mitigation: "The message is redelivered. Before sending, the worker checks a per-(notification, channel, device) send marker; providers that accept idempotency keys get one. This gives effectively-once delivery in practice; a tiny window of duplicates remains and is accepted." },
    { scenario: "Kafka partition leader failure", mitigation: "Replication factor 3, `acks=all`, `min.insync.replicas=2` so acknowledged sends survive a broker loss." },
    { scenario: "Poison message (template renders fail)", mitigation: "Catch, send to DLQ immediately (not retry topics), alert the owning team." },
    { scenario: "Upstream bug sends the same event 1,000 times", mitigation: "Idempotency keys dedupe identical events; per-user caps bound the damage of distinct-but-wrong events." },
  ],
  tradeoffs: [
    { decision: "Queue technology", options: "Kafka vs SQS/RabbitMQ.", choice: "Kafka for high throughput, replay and partitioning by user (ordering per user). SQS is a fine managed alternative with native visibility timeouts and DLQs; RabbitMQ gives per-message delay/priority more naturally. The retry topic pattern compensates for Kafka's lack of per-message delays." },
    { decision: "Resolve preferences at ingest vs at send", options: "Filter in the API (fewer messages enqueued) vs in workers (fresher preferences for delayed sends).", choice: "Both: coarse filter at ingest, re-check in the worker for scheduled/campaign sends, since a user may opt out between scheduling and sending." },
    { decision: "Delivery guarantee", options: "At-most-once (never duplicate, may lose) vs at-least-once + dedup.", choice: "At-least-once + idempotency: a missed OTP or password reset is worse than an occasional duplicate marketing push." },
  ],
  walkthrough: [
    { title: "1. Clarify functional requirements", detail: "\"Which channels? Who calls us — internal services only? Do we own templates and preferences? I'll assume push, email, SMS and in-app; internal callers; we own templates, preferences, scheduling and status tracking.\"" },
    { title: "2. Non-functional requirements", detail: "\"OTPs need seconds; marketing can take minutes. We must not lose accepted notifications and must not spam users with duplicates. A big campaign must not hurt transactional latency.\"" },
    { title: "3. Assumptions", detail: "\"300M users, 500M notifications/day, 10× campaign bursts, 90-day history.\"" },
    { title: "4. Estimate", detail: "\"~5.8k/s average, ~58k/s peak; 500 GB/day of history → 45 TB for 90 days. A 100M-user campaign at peak rate takes about half an hour, which is acceptable for marketing.\"" },
    { title: "5. API and data model", detail: "\"POST returns 202 with an idempotency key from the business event. History in Cassandra by user; preferences/devices/templates in Postgres with a Redis cache.\"" },
    { title: "6. High-level design", detail: "\"API → Kafka topics by channel and priority → channel workers → providers, with a scheduler for delayed sends and campaigns, and retry topics plus a DLQ.\"" },
    { title: "7. Main flows", detail: "\"Walk the OTP path end to end, then a campaign fan-out with throttling and checkpointing.\"" },
    { title: "8. Bottlenecks", detail: "\"Provider limits and burst isolation, not raw throughput. Per-provider token buckets and per-priority consumer pools.\"" },
    { title: "9. Component choices", detail: "\"Kafka for throughput and replay; Cassandra for write-heavy, per-user history; Redis for dedup keys and cached preferences.\"" },
    { title: "10. Scaling, consistency, failure", detail: "\"Workers scale on consumer lag. At-least-once plus dedup markers. Provider circuit breakers with failover.\"" },
    { title: "11. Security, observability, ops", detail: "\"Only authenticated internal callers; PII in templates is minimised; unsubscribe links and legal compliance (CAN-SPAM, GDPR consent). Metrics: send latency per priority, provider error rates, DLQ depth, opt-out rate.\"" },
    { title: "12. Trade-offs", detail: "\"I'm accepting rare duplicates for no loss, and re-checking preferences at send time at the cost of extra reads.\"" },
  ],
  followUps: [
    { q: "How do you guarantee an OTP isn't stuck behind a campaign?", a: "Separate high-priority topics with dedicated consumer capacity (bulkheads), plus provider-level reserved throughput for transactional traffic. Never share a FIFO queue between priorities — a priority field in a shared queue does not help once the queue is 10M messages deep." },
    { q: "How do you handle quiet hours across time zones?", a: "Store the user's time zone; if the send falls inside quiet hours and the category isn't exempt, compute the next allowed local time and hand it to the scheduler instead of the send queue." },
    { q: "How do you avoid notifying a user about 50 likes individually?", a: "Aggregate: buffer low-priority events per (user, type) for a window (e.g. 10 minutes) and send a digest. This is a stateful stream job keyed by user." },
    { q: "How would you implement delayed retries on Kafka?", a: "Kafka has no per-message delay. Use a small set of retry topics with fixed delays (1m, 10m, 1h); consumers of each topic pause until the message's due time. Or use a delay-capable queue (SQS delay, RabbitMQ delayed exchange) for retries only." },
    { q: "What do you track to know the system is healthy?", a: "End-to-end latency (accepted → handed to provider) per priority, consumer lag per topic, provider error/throttle rates, DLQ size, duplicate-send rate (from dedup marker hits) and unsubscribe/complaint rates." },
  ],
  related: [
    "system-design/async-processing",
    "system-design/rabbitmq-kafka-sqs",
    "system-design/delivery-semantics",
    "system-design/api-idempotency",
    "system-design/bulkheads",
    "system-design/circuit-breakers-timeouts-retries",
    "system-design/rate-limiting",
    "backend/webhooks-dlq",
    "distributed/idempotency-patterns",
  ],
};

// ---------------------------------------------------------------------------
// 4. Chat application
// ---------------------------------------------------------------------------
const chatApplication: DesignExercise = {
  slug: "chat-application",
  title: "Chat application (WhatsApp / Messenger)",
  level: "advanced",
  summary:
    "Real-time 1:1 and group messaging for hundreds of millions of users. Covers WebSocket connection gateways, a session registry, per-conversation ordering, delivery/read receipts, offline sync, presence and multi-device.",
  minutes: 90,
  status: "authored",
  functional: [
    "1:1 and group chats (groups up to 500 members).",
    "Send text messages in real time; media (images/video/files) via upload + reference.",
    "Sent / delivered / read receipts.",
    "Offline users receive messages on reconnect, plus a mobile push notification.",
    "Online/last-seen presence and typing indicators.",
    "Message history synced across a user's devices (phone + web/desktop).",
  ],
  nonFunctional: [
    "End-to-end delivery latency p99 < 500 ms when both users are online in the same region.",
    "No message loss once the sender sees the 'sent' tick; no duplicates shown to the user.",
    "Messages in a conversation are displayed in the same order on every device.",
    "Availability 99.99%; presence may be eventually consistent (seconds).",
    "Security: TLS in transit; end-to-end encryption is a follow-up (server then stores ciphertext only).",
  ],
  assumptions: [
    "500M DAU; each sends 40 messages/day.",
    "Peak = 3× average; at peak 30% of DAU are connected concurrently.",
    "Average stored message ≈ 200 B (text ~100 B + IDs, timestamps, metadata).",
    "Average recipients per message ≈ 1.5 (mostly 1:1; groups pull the average up).",
    "One gateway host holds ~200k concurrent WebSocket connections at ~30 KB of memory each (buffers + TLS state).",
    "10% of messages carry media averaging 200 KB; history kept indefinitely (users can delete).",
    "Clients send a heartbeat every 30 s.",
  ],
  estimation: [
    {
      type: "table",
      head: ["Quantity", "Arithmetic", "Result"],
      rows: [
        ["Messages per day", "500M × 40", "20B/day"],
        ["Message QPS (avg)", "20,000,000,000 ÷ 86,400", "≈ 231,000/s"],
        ["Message QPS (peak)", "231,000 × 3", "≈ 694,000/s"],
        ["Deliveries (avg)", "231,000 × 1.5 recipients", "≈ 347,000/s"],
        ["Concurrent connections (peak)", "500M × 30%", "150M WebSockets"],
        ["Gateway hosts", "150M ÷ 200k per host", "750 hosts (+ headroom for AZ loss → ~1,000)"],
        ["Gateway memory", "200k conns × 30 KB", "≈ 6 GB per host; ≈ 4.5 TB across the fleet"],
        ["Heartbeats", "150M ÷ 30 s", "5M/s — must terminate at the gateway, never hit a database"],
        ["Text storage per day", "20B × 200 B", "4 TB/day"],
        ["Text storage per year", "4 TB × 365", "≈ 1.46 PB (≈ 4.4 PB at RF=3)"],
        ["Media per day", "20B × 10% × 200 KB = 2B × 200 KB", "≈ 400 TB/day → object storage + CDN"],
      ],
    },
    { type: "callout", tone: "tip", title: "What the numbers tell you", text: "The defining problems are **150M long-lived connections** (stateful gateways, routing a message to the right host) and **~700k msg/s of ordered, durable writes**. Heartbeats at 5M/s show why presence must be handled at the edge and only state changes propagated." },
  ],
  api: [
    {
      type: "code",
      lang: "json",
      caption: "WebSocket frames (client ⇄ gateway)",
      code: `// client -> server: send
{ "type": "send", "client_msg_id": "c-7f3e9a", "conversation_id": "conv_123",
  "body": "hey!", "media_ref": null }

// server -> sender: accepted + durably stored (single tick)
{ "type": "ack", "client_msg_id": "c-7f3e9a", "message_id": "m_01JAB...", "seq": 1042,
  "server_ts": "2026-10-05T10:00:00.120Z" }

// server -> recipient device
{ "type": "message", "conversation_id": "conv_123", "message_id": "m_01JAB...", "seq": 1042,
  "sender_id": "u_1", "body": "hey!", "server_ts": "2026-10-05T10:00:00.120Z" }

// recipient -> server: receipts (cumulative per conversation)
{ "type": "receipt", "conversation_id": "conv_123", "delivered_up_to": 1042 }
{ "type": "receipt", "conversation_id": "conv_123", "read_up_to": 1042 }

// typing / presence (ephemeral, never stored)
{ "type": "typing", "conversation_id": "conv_123", "state": "start" }`,
    },
    {
      type: "code",
      lang: "http",
      caption: "REST for sync, history and media",
      code: `GET  /v1/sync?cursor=<per-device cursor>            -> conversations with new messages since cursor
GET  /v1/conversations/{id}/messages?before_seq=1000&limit=50
POST /v1/media/uploads   -> { "upload_url": "https://objstore/...signed...", "media_ref": "med_9a.." }
POST /v1/groups          { "name": "Trip", "members": ["u_1","u_2"] }
POST /v1/groups/{id}/members`,
    },
    { type: "callout", tone: "note", text: "`client_msg_id` makes sends **idempotent**: if the socket drops before the ack arrives, the client resends with the same ID and the server returns the existing `message_id` instead of storing a duplicate." },
  ],
  dataModel: [
    {
      type: "code",
      lang: "sql",
      caption: "Wide-column tables (Cassandra / ScyllaDB / HBase)",
      code: `-- Messages: partition by conversation + time bucket so partitions stay bounded.
CREATE TABLE messages (
  conversation_id text,
  bucket          int,          -- e.g. month number, or seq / 10000
  seq             bigint,       -- per-conversation monotonic sequence
  message_id      text,
  sender_id       text,
  client_msg_id   text,
  body            blob,         -- ciphertext if end-to-end encrypted
  media_ref       text,
  server_ts       timestamp,
  PRIMARY KEY ((conversation_id, bucket), seq)
) WITH CLUSTERING ORDER BY (seq DESC);

-- A user's conversation list with unread state, for the chat list screen and sync.
CREATE TABLE user_conversations (
  user_id          text,
  conversation_id  text,
  last_seq         bigint,
  last_read_seq    bigint,
  last_message_at  timestamp,
  PRIMARY KEY ((user_id), conversation_id)
);

CREATE TABLE group_members (
  group_id  text,
  user_id   text,
  role      text,
  joined_at timestamp,
  PRIMARY KEY ((group_id), user_id)
);`,
    },
    {
      type: "table",
      head: ["State", "Store", "Key", "Notes"],
      rows: [
        ["Session registry", "Redis", "`sess:{user_id}` → set of (device_id, gateway_id)", "Written on connect/disconnect; TTL refreshed by the gateway (not per heartbeat per user — batched)."],
        ["Presence", "Redis", "`presence:{user_id}` → online / last_seen", "Only transitions are written; subscribers notified via pub/sub."],
        ["Dedup", "Redis", "`dedup:{sender}:{client_msg_id}` → message_id, TTL 24 h", "Makes resends idempotent."],
        ["Media", "Object storage + CDN", "content hash", "Messages only carry a reference."],
      ],
    },
    { type: "p", text: "Partitioning messages by `conversation_id` keeps a conversation's history together for ordered range reads; the `bucket` component stops a 5-year-old busy group chat from becoming one unbounded partition." },
  ],
  architecture: {
    nodes: [
      { id: "client", label: "Mobile / web clients", kind: "client" },
      { id: "lb", label: "L4 load balancer", kind: "edge" },
      { id: "gateway", label: "WebSocket gateways", kind: "service" },
      { id: "sessions", label: "Session + presence registry (Redis)", kind: "cache" },
      { id: "chat", label: "Chat service", kind: "service" },
      { id: "groups", label: "Group service", kind: "service" },
      { id: "log", label: "Kafka (partitioned by conversation)", kind: "queue" },
      { id: "fanout", label: "Message processor / fan-out", kind: "service" },
      { id: "msgdb", label: "Message store (Cassandra)", kind: "data" },
      { id: "push", label: "APNs / FCM", kind: "external" },
      { id: "media", label: "Object storage + CDN", kind: "data" },
    ],
    edges: [
      { from: "client", to: "lb", label: "WSS" },
      { from: "lb", to: "gateway", label: "sticky TCP" },
      { from: "gateway", to: "sessions", label: "register / presence" },
      { from: "gateway", to: "chat", label: "send frames (gRPC)" },
      { from: "chat", to: "groups", label: "membership check" },
      { from: "chat", to: "log", label: "append" },
      { from: "log", to: "fanout", label: "consume in order" },
      { from: "fanout", to: "msgdb", label: "persist with seq" },
      { from: "fanout", to: "sessions", label: "where is recipient?" },
      { from: "fanout", to: "gateway", label: "deliver to host" },
      { from: "fanout", to: "push", label: "offline recipients" },
      { from: "client", to: "media", label: "upload / download media" },
    ],
    notes: [
      { type: "list", items: [
        "**L4 load balancer**: long-lived TCP connections; balances on connect (least-connections), not per message.",
        "**WebSocket gateways**: stateful, hold connections and nothing else — auth on connect, heartbeats, ping/pong, backpressure per socket. Keeping business logic out of them means they can be drained and redeployed safely.",
        "**Session registry**: maps user → devices → gateway host. This is how any service finds the host holding a recipient's socket.",
        "**Chat service**: stateless validation (membership, blocking, size limits), dedup by `client_msg_id`, append to Kafka keyed by `conversation_id`.",
        "**Kafka**: the durable, ordered log. One partition per key range means all messages of a conversation are consumed by one processor in order.",
        "**Message processor**: assigns `seq` (single writer per conversation), persists, updates `user_conversations`, then looks up recipients' sessions and delivers; falls back to push notifications.",
        "**Group service**: membership with caching; large groups are fanned out in batches.",
        "**Media**: clients upload directly to object storage via presigned URLs; downloads come from the CDN.",
      ] },
      { type: "callout", tone: "note", title: "Conceptual diagram", text: "Presence pub/sub, the sync API and the push-notification service are folded into the nodes above to keep the diagram legible." },
    ],
  },
  flows: [
    {
      title: "Send a message (both users online)",
      steps: [
        "A's device sends `{type: send, client_msg_id}` over its WebSocket to gateway G1.",
        "G1 forwards to the chat service, which checks membership and the dedup key, then appends to Kafka (acks=all).",
        "Chat service acks back through G1: A sees the single tick ('sent').",
        "The processor for that partition assigns `seq = last_seq + 1`, writes the message and updates `user_conversations` for each member.",
        "Processor looks up B in the session registry → B's phone is on gateway G7; it calls G7 (gRPC), which pushes the frame down B's socket.",
        "B's device acks `delivered_up_to`; the receipt flows back to A (double tick). Opening the chat sends `read_up_to` (blue ticks).",
      ],
    },
    {
      title: "Recipient offline",
      steps: [
        "Session registry has no live session for B → processor sends a push notification via APNs/FCM (collapsed if many messages).",
        "When B reconnects, the client calls `/v1/sync` with its per-device cursor and pulls all conversations with `last_seq` greater than what it has.",
        "The client fetches missing messages by `(conversation_id, seq)` range, then acks delivery.",
      ],
    },
    {
      title: "Group message (200 members)",
      steps: [
        "Same append path — the message is stored **once** under the group's conversation_id.",
        "Processor fetches the member list (cached), batches session lookups, groups recipients by gateway host and sends one RPC per host.",
        "Offline members get (rate-limited) pushes; receipts are aggregated per member and shown as 'read by N'.",
      ],
    },
    {
      title: "Presence",
      steps: [
        "Gateway marks a user online on connect and offline when the socket closes or heartbeats stop for ~60 s.",
        "Only transitions are written to the presence store and published to subscribers (users currently viewing that contact).",
        "'Last seen' is written on the offline transition, not on every heartbeat.",
      ],
    },
  ],
  bottlenecks: [
    "Connection count and memory on gateways — tune kernel limits (file descriptors, ephemeral ports), use epoll-based servers, shed load by refusing new connections when full.",
    "Hot conversations (huge active groups) serialize on one Kafka partition/processor — cap group size, batch deliveries, or shard very large broadcast channels differently.",
    "Session registry lookups for every delivery (~350k/s) — Redis cluster sharded by user ID; batch lookups for groups.",
    "Reconnect storms after a gateway or AZ failure — clients reconnect with jittered exponential backoff; sync endpoints rate-limited.",
  ],
  failures: [
    { scenario: "A gateway host dies (200k sockets drop)", mitigation: "Clients reconnect (with jitter) to other hosts and run sync from their cursor, so nothing is lost — messages live in the log/DB, not the gateway. Stale session entries expire by TTL, and delivery to a dead gateway fails fast and falls back to push." },
    { scenario: "Processor crashes after persisting but before delivering", mitigation: "Kafka redelivers from the last committed offset; writes are idempotent (keyed by message_id/seq) and clients dedupe by message_id. The recipient also catches up via sync." },
    { scenario: "Network partition between regions", mitigation: "Each conversation has a home region that orders its messages; users in other regions connect to local gateways that forward to the home region. During a partition, conversations homed in the unreachable region degrade (queue on client) rather than fork their ordering." },
    { scenario: "Redis session registry shard down", mitigation: "Replicas take over; during the gap deliveries fall back to push + sync, which is correct but slower." },
  ],
  tradeoffs: [
    { decision: "Transport", options: "WebSockets vs long polling vs MQTT vs server-sent events.", choice: "WebSockets (or MQTT on mobile for battery efficiency): full duplex, low overhead per message. Long polling as a fallback for hostile networks." },
    { decision: "Ordering", options: "Client timestamps vs server timestamps vs per-conversation sequence numbers.", choice: "Server-assigned per-conversation `seq` from a single writer: clocks across devices are unreliable, and a gapless monotonic number also gives a simple sync cursor." },
    { decision: "Group fan-out", options: "Write a copy to each member's inbox (fan-out on write) vs store once and fan out notifications only.", choice: "Store once per conversation, deliver to online members, and let offline members pull via sync. Per-member copies multiply storage by group size for no benefit." },
    { decision: "Message retention", options: "Store forever on the server (multi-device history) vs delete after delivery (WhatsApp's original model).", choice: "Server-side history for multi-device sync; with E2E encryption the server stores ciphertext and each device has its own keys." },
  ],
  walkthrough: [
    { title: "1. Clarify functional requirements", detail: "\"1:1 and groups up to 500, text plus media, receipts, offline delivery, presence, multi-device history. I'll leave voice/video calls and E2E encryption details as follow-ups.\"" },
    { title: "2. Non-functional requirements", detail: "\"Sub-500 ms delivery when both are online, no lost or duplicated messages, consistent order per conversation across devices. Presence can lag a few seconds.\"" },
    { title: "3. Assumptions", detail: "\"500M DAU, 40 messages each per day, 30% concurrently connected at peak, 200 bytes per message.\"" },
    { title: "4. Estimate", detail: "\"20B messages/day → ~231k/s average, ~700k/s peak. 150M sockets at 200k per host → ~750 gateway hosts. Text is 4 TB/day, ~1.5 PB/year. 5M heartbeats/s means presence has to be handled at the gateway.\"" },
    { title: "5. API and data model", detail: "\"WebSocket frames for send/ack/message/receipt with a client_msg_id for idempotency, REST for sync and history. Messages keyed by (conversation_id, bucket) clustered by seq.\"" },
    { title: "6. High-level design", detail: "\"L4 LB → WebSocket gateways → chat service → Kafka keyed by conversation → processor that persists and fans out using a Redis session registry, with push for offline users.\"" },
    { title: "7. Main flows", detail: "\"Walk the online send with the three ticks, then offline + reconnect sync with cursors, then a group message.\"" },
    { title: "8. Bottlenecks", detail: "\"Connection density, reconnect storms, very active groups on one partition, and registry lookups.\"" },
    { title: "9. Component choices", detail: "\"Kafka for an ordered durable log per conversation; Cassandra for write-heavy time-ordered history; Redis for ephemeral session/presence state.\"" },
    { title: "10. Scaling, consistency, failure", detail: "\"Gateways are disposable; truth lives in the log and DB, so any failure is repaired by client sync. Per-conversation home region for ordering.\"" },
    { title: "11. Security, observability, ops", detail: "\"TLS everywhere, auth token on connect, abuse/spam limits per sender, E2E encryption via a Signal-style protocol where the server only routes ciphertext. Metrics: delivery latency, connected sockets, reconnect rate, undelivered backlog.\"" },
    { title: "12. Trade-offs", detail: "\"Store-once for groups over per-member copies; seq numbers over timestamps; WebSockets with long-polling fallback.\"" },
  ],
  followUps: [
    { q: "How does the server know which gateway a user is on?", a: "Gateways register `user → (device, gateway_id)` in a session registry (Redis) on connect and remove it on disconnect, with a TTL as a safety net. Delivery looks up the registry and calls the gateway directly; alternatively, each gateway subscribes to a pub/sub channel per connected user, which avoids the lookup but creates many subscriptions." },
    { q: "How do you guarantee ordering in a group when two people send at the same time?", a: "Both messages are appended to the same Kafka partition (keyed by conversation_id), and a single processor assigns seq in log order. Every device renders by seq, so they all agree — even if that order differs from the senders' wall-clock times." },
    { q: "How do read receipts scale in a 500-member group?", a: "Make receipts cumulative (`read_up_to = seq`) rather than per message, store one row per (member, conversation), and send aggregated updates (debounced) to the sender. Many apps only show detailed receipts on demand." },
    { q: "How would you add end-to-end encryption?", a: "Each device holds identity and session keys (Signal protocol: X3DH key agreement + Double Ratchet). The server distributes public pre-keys and routes ciphertext. Groups use sender keys so a message is encrypted once and the key is distributed pairwise. The server can no longer search or moderate content." },
    { q: "How do you sync history to a newly added device?", a: "The new device authenticates, gets the conversation list and pages history by (conversation, seq). With E2E, history must be transferred from an existing device or an encrypted backup, since the server cannot decrypt it." },
  ],
  related: [
    "system-design/load-balancing-algorithms",
    "system-design/sharding-partitioning",
    "system-design/rabbitmq-kafka-sqs",
    "system-design/delivery-semantics",
    "system-design/consistency-models",
    "system-design/health-checks-heartbeats",
    "system-design/api-idempotency",
    "networks/websockets",
    "networks/tcp",
    "backend/redis",
  ],
};

// ---------------------------------------------------------------------------
// 5. News feed
// ---------------------------------------------------------------------------
const newsFeed: DesignExercise = {
  slug: "news-feed",
  title: "News feed (Facebook / X timeline)",
  level: "advanced",
  summary:
    "Build each user's home feed from the people they follow. The heart of the problem is fan-out on write vs fan-out on read, the celebrity problem, feed caches, ranking and hydration at ~100k feed loads per second.",
  minutes: 90,
  status: "authored",
  functional: [
    "Users create posts (text, images, links).",
    "Users follow other users (asymmetric follow graph).",
    "Home feed: posts from followed accounts, ranked (or reverse-chronological), with infinite scroll.",
    "Feed reflects likes/comments counts; deleted or privacy-restricted posts never appear.",
  ],
  nonFunctional: [
    "Feed load p99 < 300 ms server-side.",
    "A new post appears in followers' feeds within ~5–10 s (eventual consistency is fine).",
    "Highly available reads (99.99%); posting may degrade more gracefully.",
    "Handle extreme skew: accounts with 50M+ followers.",
  ],
  assumptions: [
    "300M DAU, each loads the feed 10 times/day; a load returns 20 posts.",
    "Each DAU posts 0.5 times/day on average.",
    "Average 200 followers per poster; a few thousand accounts have more than 100k followers.",
    "Peak = 3× average.",
    "Post record ≈ 1 KB (media stored separately).",
    "Precomputed feed keeps the latest 500 entries per user; each entry = 8 B post ID + 8 B score/timestamp.",
  ],
  estimation: [
    {
      type: "table",
      head: ["Quantity", "Arithmetic", "Result"],
      rows: [
        ["Feed loads per day", "300M × 10", "3B/day"],
        ["Feed read QPS (avg / peak)", "3,000,000,000 ÷ 86,400 ≈ 34,700; × 3", "≈ 34.7k/s avg, ≈ 104k/s peak"],
        ["Post hydrations (peak)", "104k loads/s × 20 posts", "≈ 2.1M post lookups/s → must come from cache"],
        ["Posts per day", "300M × 0.5", "150M/day"],
        ["Post write QPS (avg / peak)", "150,000,000 ÷ 86,400 ≈ 1,740; × 3", "≈ 1.7k/s avg, ≈ 5.2k/s peak"],
        ["Fan-out writes per day (push model)", "150M posts × 200 followers", "30B feed inserts/day"],
        ["Fan-out write rate (avg / peak)", "30,000,000,000 ÷ 86,400 ≈ 347k; × 3", "≈ 347k/s avg, ≈ 1M/s peak"],
        ["Feed cache size", "300M users × 500 × 16 B", "2.4 TB (≈ 38 Redis nodes at 64 GB usable)"],
        ["Post storage over 5 years", "150M × 1 KB × 365 × 5", "≈ 274 TB (before replication)"],
        ["One celebrity post with push", "50M followers ÷ 1M writes/s", "~50 s of the entire fan-out capacity — per post"],
      ],
    },
    { type: "callout", tone: "tip", title: "What the numbers tell you", text: "Reads (~100k/s) are cheap if the feed is precomputed, and 30B fan-out writes/day is affordable for normal users. The last row is the **celebrity problem**: pushing a 50M-follower post is absurd, so those posts must be pulled at read time." },
  ],
  api: [
    {
      type: "code",
      lang: "http",
      caption: "Feed and posting",
      code: `GET /v1/feed?cursor=eyJzY29yZSI6MTcyODEyMzQ1Niwi...&limit=20 HTTP/1.1
Authorization: Bearer <token>

HTTP/1.1 200 OK
{
  "items": [
    { "post_id": "1843029384756123648", "author": { "id": "u_9", "name": "Asha", "avatar_url": "..." },
      "text": "Shipped it!", "media": [{ "url": "https://cdn.example/m/ab12.jpg" }],
      "created_at": "2026-10-05T09:58:00Z", "like_count": 120, "comment_count": 8, "liked_by_me": false }
  ],
  "next_cursor": "eyJzY29yZSI6MTcyODEyMDAwMCwi..."
}

POST /v1/posts            { "text": "...", "media_ids": ["med_1"], "visibility": "followers" }  -> 201 { "post_id": "..." }
POST /v1/users/{id}/follow   -> 204
DELETE /v1/users/{id}/follow -> 204`,
    },
    { type: "callout", tone: "note", text: "Use an **opaque cursor** (last score + post ID) instead of `offset`: new posts arriving at the top would shift offsets and cause duplicates or gaps while scrolling." },
  ],
  dataModel: [
    {
      type: "code",
      lang: "sql",
      caption: "Storage",
      code: `-- Posts: point lookups by id (hydration). Snowflake ids are time-sortable.
CREATE TABLE posts (
  post_id     bigint PRIMARY KEY,
  author_id   bigint,
  text        text,
  media       list<text>,
  visibility  text,
  created_at  timestamp,
  deleted     boolean
);

-- Author timeline: used for pull (celebrities) and for rebuilding feeds.
CREATE TABLE user_posts (
  author_id   bigint,
  post_id     bigint,
  PRIMARY KEY ((author_id), post_id)
) WITH CLUSTERING ORDER BY (post_id DESC);

-- Social graph, stored in both directions.
CREATE TABLE followers (          -- who follows X (fan-out on write)
  user_id     bigint,
  bucket      int,                -- splits celebrity partitions
  follower_id bigint,
  PRIMARY KEY ((user_id, bucket), follower_id)
);
CREATE TABLE following (          -- whom does X follow (fan-out on read)
  user_id     bigint,
  followee_id bigint,
  is_celebrity boolean,
  PRIMARY KEY ((user_id), followee_id)
);`,
    },
    {
      type: "table",
      head: ["Cache", "Structure", "Notes"],
      rows: [
        ["`feed:{user_id}`", "Redis sorted set: member = post_id, score = rank/time; trimmed to 500", "Precomputed feed for push-model authors. Only for active users (e.g. seen in last 30 days)."],
        ["`post:{post_id}`", "Redis hash / memcached object", "Hydration cache; 2M lookups/s at peak, batched with MGET."],
        ["`recent:{celebrity_id}`", "List of the latest ~100 post IDs", "Pulled and merged at read time."],
        ["`counts:{post_id}`", "Counters (likes, comments)", "Updated asynchronously; slightly stale is fine."],
      ],
    },
  ],
  architecture: {
    nodes: [
      { id: "client", label: "Apps / web", kind: "client" },
      { id: "edge", label: "CDN + API gateway", kind: "edge" },
      { id: "postsvc", label: "Post service", kind: "service" },
      { id: "feedsvc", label: "Feed service (merge + rank)", kind: "service" },
      { id: "events", label: "Kafka: post events", kind: "queue" },
      { id: "fanout", label: "Fan-out workers", kind: "service" },
      { id: "graph", label: "Social graph store", kind: "data" },
      { id: "feedcache", label: "Feed cache (Redis ZSETs)", kind: "cache" },
      { id: "postcache", label: "Post + counter cache", kind: "cache" },
      { id: "postdb", label: "Post store", kind: "data" },
      { id: "ranker", label: "Ranking service", kind: "service" },
    ],
    edges: [
      { from: "client", to: "edge", label: "HTTPS" },
      { from: "edge", to: "postsvc", label: "POST /posts" },
      { from: "edge", to: "feedsvc", label: "GET /feed" },
      { from: "postsvc", to: "postdb", label: "write post" },
      { from: "postsvc", to: "events", label: "PostCreated" },
      { from: "events", to: "fanout", label: "consume" },
      { from: "fanout", to: "graph", label: "page followers" },
      { from: "fanout", to: "feedcache", label: "ZADD to followers" },
      { from: "feedsvc", to: "feedcache", label: "read precomputed" },
      { from: "feedsvc", to: "graph", label: "celebrity followees" },
      { from: "feedsvc", to: "postcache", label: "hydrate (MGET)" },
      { from: "postcache", to: "postdb", label: "on miss" },
      { from: "feedsvc", to: "ranker", label: "score candidates" },
    ],
    notes: [
      { type: "list", items: [
        "**Post service**: validates and stores the post (Snowflake ID), emits `PostCreated` to Kafka. Media were uploaded earlier directly to object storage and are served by the CDN.",
        "**Fan-out workers**: for authors below the celebrity threshold, page through followers and `ZADD` the post ID into each *active* follower's feed, then trim to 500. Inactive users are skipped; their feed is rebuilt on next login.",
        "**Social graph store**: followers/following in both directions; can be a sharded KV store or a dedicated graph service (like Facebook's TAO).",
        "**Feed service**: reads the precomputed feed, pulls recent posts from followed celebrities, merges, filters (deleted, blocked, privacy), asks the ranker to score, hydrates posts in batches, and builds the cursor.",
        "**Ranking service**: candidate scoring (recency, affinity with the author, engagement predictions). Can be a simple time-decay formula or an ML model.",
        "**Caches**: feed cache holds IDs only (small); the post cache holds objects, so an edit or delete updates one key rather than millions of feed entries.",
      ] },
    ],
  },
  flows: [
    {
      title: "Publish (write path, hybrid fan-out)",
      steps: [
        "Client calls `POST /v1/posts`; post service writes to the post store and `user_posts`, emits `PostCreated`.",
        "Fan-out worker checks the author's follower count.",
        "Regular author (< 100k followers): page followers in batches of ~1,000, keep active ones, pipeline `ZADD feed:{f} score post_id` + `ZREMRANGEBYRANK feed:{f} 0 -501`.",
        "Celebrity author: no fan-out; just push the post ID to `recent:{author}`.",
        "Within seconds the post is visible to normal followers; celebrity followers see it on their next feed load.",
      ],
    },
    {
      title: "Load feed (read path)",
      steps: [
        "`GET /v1/feed`: feed service reads the top ~200 IDs from `feed:{user}` (or rebuilds it from followees' `user_posts` if missing).",
        "Fetch the followed-celebrity list and their `recent:{id}` lists; merge with the precomputed IDs.",
        "Filter out deleted posts, muted/blocked authors and posts already seen in this session.",
        "Ranker scores the candidates; take the top 20 after the cursor.",
        "Hydrate the 20 posts, authors and counters with batched MGETs; return items + next cursor.",
      ],
    },
    {
      title: "Follow / unfollow",
      steps: [
        "Write both graph edges.",
        "Follow: optionally backfill the newest few posts of the followee into the follower's feed.",
        "Unfollow: filter that author at read time immediately; lazily remove entries from the feed cache.",
      ],
    },
  ],
  bottlenecks: [
    "Fan-out write amplification (~1M ZADDs/s at peak) — pipeline per Redis shard, skip inactive followers, rate-limit fan-out per author.",
    "Celebrity posts — pull model at read time; their `recent:` lists are tiny and extremely hot, so replicate them in local caches.",
    "Hydration (2M lookups/s) — batched multi-gets against a large post cache; keep feed entries as IDs only.",
    "Hot partitions in the follower table for huge accounts — bucketed partitions.",
  ],
  failures: [
    { scenario: "Feed cache node lost", mitigation: "Rebuild affected users' feeds lazily on next request (pull from followees' `user_posts`, which is the fan-out-on-read path anyway). Higher latency for those users, no data loss." },
    { scenario: "Fan-out workers lag (Kafka lag grows)", mitigation: "Feeds are just staler. Autoscale on lag; prioritise fan-out for recently active followers. Freshness SLO alerting on lag." },
    { scenario: "Post deleted after fan-out", mitigation: "Mark deleted in the post store/cache; feed service filters at read time. Feed entries are cleaned lazily." },
    { scenario: "Ranking service slow or down", mitigation: "Timeout (e.g. 50 ms) and fall back to reverse-chronological order — graceful degradation." },
  ],
  tradeoffs: [
    { decision: "Fan-out on write (push) vs fan-out on read (pull)", options: "Push: precompute every follower's feed at post time — fast reads, heavy writes, wasted work for inactive users. Pull: assemble at read time — cheap writes, expensive reads (query hundreds of followees).", choice: "Hybrid: push for normal authors to active followers, pull for celebrities (> ~100k followers) merged at read time." },
    { decision: "Store IDs vs full posts in the feed cache", options: "Denormalised post copies in every feed vs IDs + separate hydration.", choice: "IDs only: 16 B per entry keeps 2.4 TB of feed cache feasible, and edits/deletes touch one object." },
    { decision: "Ranked vs chronological", options: "Chronological (simple, predictable) vs ML ranking (engagement, more complex).", choice: "Ranked with a chronological fallback; candidate generation and ranking separated so either can evolve." },
  ],
  walkthrough: [
    { title: "1. Clarify functional requirements", detail: "\"Asymmetric follows, posts with media, a ranked home feed with infinite scroll. Out of scope: comments UI, ads, search.\"" },
    { title: "2. Non-functional requirements", detail: "\"Feed loads under 300 ms, very high read availability, posts visible to followers within seconds — eventual consistency is fine.\"" },
    { title: "3. Assumptions", detail: "\"300M DAU, 10 loads/day, 0.5 posts/day, 200 followers on average, some accounts with tens of millions.\"" },
    { title: "4. Estimate", detail: "\"~35k feed loads/s average, ~104k peak, each hydrating 20 posts → 2M lookups/s. 150M posts/day × 200 followers = 30B fan-out writes/day, ~350k/s. Feed cache of 500 IDs per user is 2.4 TB.\"" },
    { title: "5. API and data model", detail: "\"Cursor-paginated GET /feed, POST /posts, follow endpoints. Posts by ID, author timelines, follower/following tables, Redis ZSET feeds.\"" },
    { title: "6. High-level design", detail: "\"Post service → Kafka → fan-out workers → feed cache; feed service merges precomputed + celebrity pulls, ranks and hydrates.\"" },
    { title: "7. Main flows", detail: "\"Publish with the hybrid fan-out decision; read with merge, filter, rank, hydrate.\"" },
    { title: "8. Bottlenecks", detail: "\"Celebrity fan-out, hydration volume, hot partitions.\"" },
    { title: "9. Component choices", detail: "\"Redis sorted sets for feeds, a wide-column store for posts and timelines, Kafka to decouple posting from fan-out.\"" },
    { title: "10. Scaling, consistency, failure", detail: "\"Feeds are a cache of a derivable view, so losing them costs latency, not data. Deletes are enforced at read time.\"" },
    { title: "11. Security, observability, ops", detail: "\"Privacy checks at read time, not just at fan-out (visibility can change). Metrics: feed latency, fan-out lag, cache hit ratio, empty-feed rate.\"" },
    { title: "12. Trade-offs", detail: "\"Hybrid push/pull trades complexity for bounded write cost; IDs-only cache trades an extra hydration hop for small memory and easy edits.\"" },
  ],
  followUps: [
    { q: "Where do you set the celebrity threshold?", a: "It's a cost crossover: push costs (followers × writes) per post; pull costs (reads × celebrity followees) per feed load. Pick a threshold (often ~10k–1M) where the fan-out write cost exceeds the extra read-time merge cost, and make it configurable. Some systems also treat very active posters specially." },
    { q: "How do you avoid wasting fan-out on inactive users?", a: "Only push to users active in the last N days. For returning inactive users, build the feed on demand with the pull path, then cache it." },
    { q: "How do you paginate a ranked feed without duplicates?", a: "Snapshot the ranked candidate list for the session (or rank within a fixed candidate window) and use a cursor over that snapshot; newly arrived posts appear via a 'new posts' pill at the top rather than shifting the list." },
    { q: "How does a like count stay fast?", a: "Write likes to a durable store, update counters asynchronously (Kafka → counter service), cache counts, and accept slight staleness. For hot posts, shard the counter and sum on read." },
    { q: "How would you show a post edited after fan-out?", a: "Because feeds store only IDs, hydration always reads the latest version from the post cache/store; the edit invalidates one cache key." },
  ],
  related: [
    "system-design/caching-strategies",
    "system-design/normalization-denormalization",
    "system-design/sharding-partitioning",
    "system-design/async-processing",
    "system-design/consistency-models",
    "system-design/fail-fast-graceful-degradation",
    "system-design/data-modeling",
    "backend/redis",
    "distributed/event-driven-architecture",
  ],
};

// ---------------------------------------------------------------------------
// 6. File storage and sync
// ---------------------------------------------------------------------------
const fileStorage: DesignExercise = {
  slug: "file-storage",
  title: "File storage and sync (Dropbox / Google Drive on S3-like storage)",
  level: "advanced",
  summary:
    "Store users' files durably and keep them in sync across devices. Covers chunking, content-addressed dedup, resumable multipart uploads straight to object storage, a metadata journal with cursors, conflict handling and erasure coding.",
  minutes: 90,
  status: "authored",
  functional: [
    "Upload, download, rename, move and delete files and folders.",
    "Automatic sync across a user's devices; offline edits sync when back online.",
    "Version history (restore previous versions for 30 days) and trash.",
    "Share files/folders with other users (view/edit) and via links.",
    "Large files (up to 50 GB) with resumable uploads.",
  ],
  nonFunctional: [
    "Durability 99.999999999% (11 nines) for stored bytes; never lose an acknowledged file.",
    "Changes propagate to other online devices within ~5 s.",
    "Metadata strongly consistent per namespace (a user's folder tree must never be corrupted).",
    "Efficient bandwidth: only changed parts of a file are uploaded; identical chunks aren't stored twice.",
    "Availability 99.99% for metadata, 99.9%+ for bulk transfer.",
  ],
  assumptions: [
    "50M registered users, 10M DAU; average 10 GB stored per user.",
    "Each DAU uploads 10 files/day; average file 2 MB; downloads = 2× uploads by bytes.",
    "Peak = 3× average.",
    "Chunk size 4 MB (most files are a single chunk).",
    "Cross-file dedup removes ~20% of bytes; erasure coding RS(10,4) → 1.4× storage overhead.",
    "Average ~5,000 file entries per user; metadata row ≈ 300 B.",
  ],
  estimation: [
    {
      type: "table",
      head: ["Quantity", "Arithmetic", "Result"],
      rows: [
        ["Logical data stored", "50M × 10 GB", "500 PB"],
        ["After dedup", "500 PB × 0.8", "400 PB unique"],
        ["Raw capacity with RS(10,4)", "400 PB × 1.4", "560 PB on disk (vs 1.2 EB with 3× replication)"],
        ["Uploads per day", "10M × 10", "100M files/day"],
        ["Upload QPS (avg / peak)", "100,000,000 ÷ 86,400 ≈ 1,160; × 3", "≈ 1.2k/s avg, ≈ 3.5k/s peak"],
        ["Ingress bytes per day", "100M × 2 MB", "200 TB/day"],
        ["Ingress bandwidth (avg)", "200 TB ÷ 86,400 s", "≈ 2.3 GB/s ≈ 18.5 Gbps (peak ≈ 55 Gbps)"],
        ["Egress bandwidth (avg)", "2 × 2.3 GB/s", "≈ 4.6 GB/s ≈ 37 Gbps"],
        ["Yearly growth (logical)", "200 TB × 365", "≈ 73 PB/year"],
        ["Chunk index rows", "400 PB ÷ 4 MB", "10^11 chunks; × ~100 B ≈ 10 TB index"],
        ["File metadata", "50M × 5,000 × 300 B", "250B rows ≈ 75 TB → must be sharded"],
      ],
    },
    { type: "callout", tone: "tip", title: "What the numbers tell you", text: "Bytes and metadata are two different problems. **Bytes** (hundreds of PB, tens of Gbps) go straight between clients and object storage. **Metadata** (75 TB, strongly consistent, transactional per user) lives in a sharded relational store. The API servers should never proxy file bytes." },
  ],
  api: [
    {
      type: "code",
      lang: "http",
      caption: "Upload: negotiate chunks, upload the missing ones, commit",
      code: `POST /v1/files/upload_session HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{ "path": "/Photos/beach.mov", "size": 1073741824,
  "chunks": ["sha256:9f86d0...", "sha256:60303a...", "...256 hashes..."],
  "base_revision": "rev_41" }

HTTP/1.1 200 OK
{ "session_id": "us_7c1",
  "missing": [
    { "index": 3, "hash": "sha256:a1b2...", "upload_url": "https://blocks.example/put?sig=..." }
  ],
  "expires_at": "2026-10-06T10:00:00Z" }

PUT https://blocks.example/put?sig=...      (4 MB body; retried independently)
-> 200 OK

POST /v1/files/commit
{ "session_id": "us_7c1" }
-> 200 { "path": "/Photos/beach.mov", "revision": "rev_42", "size": 1073741824 }
-> 409 { "error": "conflict", "server_revision": "rev_43" }   # someone else changed it`,
    },
    {
      type: "code",
      lang: "http",
      caption: "Sync and download",
      code: `POST /v1/sync/list_changes     { "cursor": "ns_88:journal_100234" }
-> { "entries": [ { "op": "upsert", "path": "/Docs/a.txt", "revision": "rev_9", "chunks": ["sha256:..."] },
                  { "op": "delete", "path": "/old.txt" } ],
     "cursor": "ns_88:journal_100241", "has_more": false }

POST /v1/sync/longpoll          { "cursor": "ns_88:journal_100241", "timeout": 60 }
-> { "changes": true }          # then call list_changes

GET  /v1/blocks/{hash}          -> 302 to a signed CDN / object-storage URL`,
    },
    { type: "callout", tone: "note", text: "This is the same shape as S3 **multipart upload** (initiate → upload parts independently → complete with the part list): parts can be retried or parallelised individually, and nothing is visible until the commit. Here the 'parts' are content-addressed, so they also deduplicate." },
  ],
  dataModel: [
    {
      type: "code",
      lang: "sql",
      caption: "Metadata (sharded MySQL/Postgres, shard key = namespace_id)",
      code: `-- A namespace is a user's root or a shared folder; it is the unit of sharding and consistency.
CREATE TABLE file_entries (
  namespace_id  bigint,
  path_hash     bytea,           -- hash of normalised path (lookup key)
  path          text,
  is_dir        boolean,
  revision      bigint,          -- bumps on every change (optimistic concurrency)
  size          bigint,
  chunk_list    bytea,           -- ordered list of chunk hashes
  deleted       boolean DEFAULT false,
  updated_at    timestamptz,
  PRIMARY KEY (namespace_id, path_hash)
);

-- Append-only change journal per namespace: drives sync cursors and version history.
CREATE TABLE journal (
  namespace_id  bigint,
  journal_id    bigint,          -- monotonic per namespace
  path          text,
  op            text,            -- upsert | delete | move
  revision      bigint,
  chunk_list    bytea,
  PRIMARY KEY (namespace_id, journal_id)
);

-- Content-addressed chunk index (separate KV store, keyed by hash)
CREATE TABLE chunks (
  chunk_hash    bytea PRIMARY KEY,    -- SHA-256 of the plaintext chunk
  storage_key   text,                 -- location in the blob store
  size          int,
  ref_count     bigint,               -- for garbage collection
  created_at    timestamptz
);`,
    },
    {
      type: "table",
      head: ["Choice", "Why"],
      rows: [
        ["Shard by `namespace_id`", "All writes for one folder tree are on one shard, so a commit (update entry + append journal) is a single local transaction. Shared folders are their own namespace, mounted into each member's tree."],
        ["Journal with monotonic `journal_id`", "A device's sync cursor is just `(namespace, journal_id)`; 'what changed since X' is a range scan."],
        ["Chunk index keyed by hash", "Dedup is a point lookup; uniform hash distribution spreads load."],
        ["Bytes in object storage", "Durable, cheap, erasure-coded; metadata never stores bytes."],
      ],
    },
  ],
  architecture: {
    nodes: [
      { id: "client", label: "Desktop / mobile sync client", kind: "client" },
      { id: "edge", label: "API gateway / LB", kind: "edge" },
      { id: "meta", label: "Metadata service", kind: "service" },
      { id: "metadb", label: "Metadata DB (sharded SQL)", kind: "data" },
      { id: "metacache", label: "Metadata cache", kind: "cache" },
      { id: "block", label: "Block service", kind: "service" },
      { id: "chunkidx", label: "Chunk index (KV)", kind: "data" },
      { id: "blobs", label: "Object storage (erasure-coded)", kind: "data" },
      { id: "journalq", label: "Change events (Kafka)", kind: "queue" },
      { id: "notify", label: "Notification service (long-poll)", kind: "service" },
      { id: "cdn", label: "CDN for downloads", kind: "edge" },
    ],
    edges: [
      { from: "client", to: "edge", label: "metadata API" },
      { from: "edge", to: "meta", label: "upload_session / commit / list_changes" },
      { from: "meta", to: "metacache", label: "read" },
      { from: "meta", to: "metadb", label: "txn: entry + journal" },
      { from: "meta", to: "block", label: "which chunks are missing?" },
      { from: "block", to: "chunkidx", label: "lookup hashes" },
      { from: "client", to: "blobs", label: "PUT chunks (presigned)" },
      { from: "meta", to: "journalq", label: "namespace changed" },
      { from: "journalq", to: "notify", label: "consume" },
      { from: "notify", to: "client", label: "wake long-poll" },
      { from: "client", to: "cdn", label: "GET chunks" },
      { from: "cdn", to: "blobs", label: "on miss" },
    ],
    notes: [
      { type: "list", items: [
        "**Sync client**: watches the local filesystem, splits files into chunks, hashes them (SHA-256), keeps a local DB of known revisions and the namespace cursor. It does most of the work — the server only coordinates.",
        "**Metadata service**: owns the file tree. Commit = verify all chunks exist, check `base_revision` (optimistic concurrency), update `file_entries` and append to `journal` in one transaction.",
        "**Block service**: answers 'which of these hashes do you not have?', issues presigned upload URLs, verifies the uploaded bytes hash to the claimed value before inserting into the chunk index.",
        "**Object storage**: S3-like; erasure coding RS(10,4) tolerates losing any 4 of 14 fragments, at 1.4× overhead instead of 3×.",
        "**Change events + notification service**: commit publishes `namespace changed`; devices holding a long-poll on that namespace are woken and call `list_changes` with their cursor.",
        "**CDN**: popular shared files and chunk downloads; links are signed and short-lived.",
      ] },
    ],
  },
  flows: [
    {
      title: "Upload / edit a file",
      steps: [
        "Client detects a change, splits the file into chunks and hashes each one.",
        "`upload_session` sends path, size, chunk hash list and the revision it edited (`base_revision`).",
        "Block service looks up the hashes; returns only the missing ones with presigned URLs. Editing one paragraph of a large file typically means one new chunk.",
        "Client PUTs missing chunks directly to object storage, in parallel and resumably; block service verifies each hash on completion.",
        "Client calls commit. Metadata service, in one shard-local transaction: verifies chunks, checks `revision == base_revision`, writes the new entry with revision+1, appends a journal row.",
        "On revision mismatch → 409; the client saves its version as 'beach (conflicted copy).mov' and commits that instead.",
        "A namespace-changed event is published.",
      ],
    },
    {
      title: "Sync to another device",
      steps: [
        "Device B holds `longpoll(cursor)`; the notification service wakes it when its namespace changes.",
        "B calls `list_changes(cursor)` and receives journal entries after its cursor, plus a new cursor.",
        "For each upsert, B diffs the chunk list against chunks it already has locally and downloads only the missing ones (via CDN).",
        "B reassembles the file to a temp path, verifies hashes, and atomically renames it into place; stores the new cursor.",
      ],
    },
    {
      title: "Delete and garbage collection",
      steps: [
        "Delete writes a tombstone entry + journal row; the file stays restorable for 30 days.",
        "After retention, a background job removes old revisions and decrements chunk ref counts.",
        "Chunks with ref_count = 0 (after a grace period, to avoid racing an in-flight upload that references them) are deleted from object storage.",
      ],
    },
  ],
  bottlenecks: [
    "Metadata shard hot spots — huge shared namespaces (a company-wide folder) concentrate writes; split by sub-tree or move to dedicated shards.",
    "Notification fan-out — millions of long-polls; use an event-driven server (epoll) and wake only devices subscribed to the changed namespace.",
    "Small-file overhead — millions of tiny files mean many metadata rows and requests; batch commits and pack small chunks in storage.",
    "Upload bandwidth — mitigate with dedup, delta (chunk-level) sync and compression on the client.",
  ],
  failures: [
    { scenario: "Upload interrupted at 70%", mitigation: "Chunks already uploaded are persisted and content-addressed; the client restarts the session and the server reports only the remaining chunks as missing." },
    { scenario: "Client crashes between uploading chunks and commit", mitigation: "Nothing is visible (no commit). Orphan chunks with ref_count 0 are garbage-collected after a grace period." },
    { scenario: "Two devices edit the same file offline", mitigation: "Optimistic concurrency on revision: the second commit gets 409 and is saved as a conflicted copy. Files are opaque bytes, so no automatic merge (Google Docs-style collaboration needs OT/CRDTs instead)." },
    { scenario: "Disk or rack loss in object storage", mitigation: "Erasure coding across failure domains + background repair re-creates lost fragments; periodic scrubbing verifies checksums to catch silent corruption." },
    { scenario: "Metadata shard primary fails", mitigation: "Semi-synchronous replica promotion so committed transactions are not lost; clients retry commits idempotently (same session ID)." },
  ],
  tradeoffs: [
    { decision: "Fixed-size vs content-defined chunking", options: "Fixed 4 MB chunks (simple) vs content-defined chunk boundaries using a rolling hash (Rabin/FastCDC).", choice: "Fixed size is fine for most files (and was Dropbox's original design); content-defined chunking dedups better when bytes are inserted in the middle of a file, since boundaries don't all shift. Choose CDC if the workload has many such edits." },
    { decision: "Dedup scope", options: "Global cross-user dedup (max savings) vs per-user/namespace dedup.", choice: "Per-namespace or with proof-of-possession. Global dedup leaks information: a client can learn that *someone* has a file by observing that its hash 'uploads' instantly. It also complicates per-user encryption." },
    { decision: "Replication vs erasure coding", options: "3× replication (fast reads/repairs) vs RS(10,4) (1.4× overhead).", choice: "Erasure coding for the bulk of cold-ish data (saves ~640 PB here), replication for hot/small objects where latency matters." },
    { decision: "Push vs poll for sync", options: "WebSockets vs long-poll vs periodic polling.", choice: "Long-poll: simple, works through proxies, only a 'something changed' bit is pushed; the data still comes from the cursor-based list API, which is the single source of truth." },
  ],
  walkthrough: [
    { title: "1. Clarify functional requirements", detail: "\"Upload/download, multi-device sync, versions, sharing, large files. Real-time co-editing is out of scope — files are opaque bytes.\"" },
    { title: "2. Non-functional requirements", detail: "\"Never lose a file (11 nines), changes visible on other devices within seconds, folder tree strongly consistent, and bandwidth-efficient sync.\"" },
    { title: "3. Assumptions", detail: "\"50M users × 10 GB, 10M DAU uploading 10 × 2 MB files a day, 4 MB chunks.\"" },
    { title: "4. Estimate", detail: "\"500 PB logical, ~400 PB after dedup, ~560 PB raw with RS(10,4). 200 TB/day ingest is ~18.5 Gbps average. 250B metadata rows ≈ 75 TB — so metadata needs sharding too.\"" },
    { title: "5. API and data model", detail: "\"Three-step upload: session with hashes, PUT missing chunks to presigned URLs, commit with base revision. Metadata sharded by namespace with an append-only journal; chunk index keyed by hash.\"" },
    { title: "6. High-level design", detail: "\"Split control plane from data plane: metadata service + sharded SQL; block service + object storage; a notification service for long-polls; CDN for downloads.\"" },
    { title: "7. Main flows", detail: "\"Upload with dedup and conflict detection; sync via cursor + long-poll; delete with GC by ref counts.\"" },
    { title: "8. Bottlenecks", detail: "\"Huge shared namespaces, notification fan-out, small-file overhead.\"" },
    { title: "9. Component choices", detail: "\"SQL for metadata because commits need transactions; object storage for bytes; SHA-256 content addressing for integrity and dedup.\"" },
    { title: "10. Scaling, consistency, failure", detail: "\"Namespace = shard = consistency boundary. Resumable uploads; commits are atomic; GC is delayed so it never races an upload.\"" },
    { title: "11. Security, observability, ops", detail: "\"Encryption at rest per tenant key, signed short-lived URLs, ACL checks on every metadata call, dedup scoped to avoid side channels. Metrics: sync latency, commit conflict rate, upload failure rate, storage growth.\"" },
    { title: "12. Trade-offs", detail: "\"Erasure coding vs replication, chunking strategy, dedup scope, long-poll vs WebSockets.\"" },
  ],
  followUps: [
    { q: "Why not stream file bytes through the API servers?", a: "At ~55 Gbps peak ingress the API tier would become a giant proxy; it also couples bulk transfer to metadata availability. Presigned URLs let clients talk to object storage directly while the API keeps control (authorisation, expiry, which chunk)." },
    { q: "How do you verify an uploaded chunk is really what the client claimed?", a: "The block service (or storage layer) hashes the received bytes and compares with the claimed SHA-256 before registering it in the chunk index. Otherwise a malicious client could poison a hash that other users dedupe against." },
    { q: "How does a shared folder work across users?", a: "It's its own namespace with its own journal and shard. Each member's tree has a mount point referencing it; sync clients track one cursor per namespace they can see. ACLs live on the namespace." },
    { q: "How would you implement version history efficiently?", a: "Every commit already writes a journal row with the full chunk list, and unchanged chunks are shared between versions, so a new version of a large file usually costs one or two new chunks. Restoring is just committing an old chunk list." },
    { q: "What changes for a 50 GB file?", a: "~12,800 chunks of 4 MB; the session tracks which are done, the client uploads many in parallel, and the commit carries the list (or a manifest object). The same idea as S3 multipart, which allows up to 10,000 parts — another reason to use larger chunks for huge files." },
  ],
  related: [
    "system-design/sharding-partitioning",
    "system-design/replication",
    "system-design/consistency-models",
    "system-design/cdn-edge-caching",
    "system-design/locks-transactions-isolation",
    "system-design/api-idempotency",
    "system-design/data-modeling",
    "cloud/cdn-cloudfront",
    "dsa/hash-tables",
  ],
};

// ---------------------------------------------------------------------------
// 7. Video streaming
// ---------------------------------------------------------------------------
const videoStreaming: DesignExercise = {
  slug: "video-streaming",
  title: "Video streaming (YouTube / Netflix)",
  level: "advanced",
  summary:
    "Upload, transcode and stream video at internet scale. Covers resumable uploads, a parallel transcoding pipeline producing an ABR ladder, HLS/DASH packaging (CMAF), CDN delivery with multi-Tbps egress, signed URLs/DRM and playback QoE telemetry.",
  minutes: 100,
  status: "authored",
  functional: [
    "Creators upload videos (up to several GB) with title, description, visibility.",
    "Videos are transcoded into multiple resolutions/bitrates and become playable.",
    "Viewers stream with adaptive bitrate (quality adjusts to bandwidth) on web, mobile and TV.",
    "Seek, resume where you left off, thumbnails.",
    "View counts and basic analytics; private/unlisted videos with access control.",
  ],
  nonFunctional: [
    "Playback start time (time to first frame) < 2 s p90; rebuffering ratio < 1%.",
    "Video available within minutes of upload for a 5-minute clip.",
    "Never lose an uploaded original.",
    "Egress cost dominates: maximise CDN offload.",
    "Playback availability 99.99%; upload pipeline can tolerate delays.",
  ],
  assumptions: [
    "1M uploads/day, average duration 5 min, average source bitrate ~8 Mbps (1080p) → ~300 MB per source file.",
    "ABR ladder (H.264): 240p 0.4, 360p 0.8, 480p 1.4, 720p 2.8, 1080p 5.0 Mbps — sum 10.4 Mbps.",
    "1B views/day, average watch time 5 min, average delivered bitrate 3 Mbps.",
    "Segment length 4 s. Peak = 2× average for viewing.",
    "Transcoding cost ≈ 1 core-second per rendition-second (H.264, medium preset; a rough planning number — it varies a lot by codec, preset and resolution).",
  ],
  estimation: [
    {
      type: "table",
      head: ["Quantity", "Arithmetic", "Result"],
      rows: [
        ["Source size", "8 Mbps × 300 s = 2,400 Mb ÷ 8", "300 MB per upload"],
        ["Raw ingest per day", "1M × 300 MB", "300 TB/day ≈ 3.5 GB/s ≈ 28 Gbps avg"],
        ["Encoded size per video", "10.4 Mbps × 300 s = 3,120 Mb ÷ 8", "390 MB (all renditions, one codec)"],
        ["Encoded storage per day / year", "1M × 390 MB; × 365", "390 TB/day; ≈ 142 PB/year"],
        ["Originals per year", "300 TB × 365", "≈ 110 PB/year → cold/archive tier"],
        ["Watch seconds per day", "1B views × 300 s", "3 × 10^11 s"],
        ["Concurrent streams (avg)", "3 × 10^11 ÷ 86,400", "≈ 3.47M streams"],
        ["Egress (avg / peak)", "3.47M × 3 Mbps; × 2", "≈ 10.4 Tbps avg, ≈ 21 Tbps peak"],
        ["Origin egress at 95% CDN hit ratio", "10.4 Tbps × 5%", "≈ 0.52 Tbps"],
        ["Segment requests (avg)", "3.47M streams ÷ 4 s per segment", "≈ 870k req/s (CDN)"],
        ["Transcode compute", "1M × (5 renditions × 300 s) = 1.5 × 10^9 core-s ÷ 86,400", "≈ 17,400 cores busy on average"],
      ],
    },
    { type: "callout", tone: "tip", title: "What the numbers tell you", text: "**Egress (10–20 Tbps) is the whole game** — only a CDN (often with ISP-embedded caches, like Netflix Open Connect) can serve it economically. Storage grows by ~250 PB/year, so tiering (hot renditions vs cold originals, dropping unused renditions of unpopular videos) matters. Transcoding is embarrassingly parallel." },
  ],
  api: [
    {
      type: "code",
      lang: "http",
      caption: "Resumable upload",
      code: `POST /v1/videos HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{ "title": "Trip to Ladakh", "size_bytes": 314572800, "content_type": "video/mp4", "visibility": "public" }

HTTP/1.1 201 Created
{ "video_id": "v_8KqZ", "upload_url": "https://upload.example/v_8KqZ?session=...", "chunk_size": 8388608 }

PUT https://upload.example/v_8KqZ?session=...
Content-Range: bytes 0-8388607/314572800
-> 308 Resume Incomplete   Range: bytes=0-8388607

GET /v1/videos/v_8KqZ  -> { "status": "processing", "renditions_ready": ["360p"] }`,
    },
    {
      type: "code",
      lang: "http",
      caption: "Playback",
      code: `GET /v1/videos/v_8KqZ/play HTTP/1.1
-> 200 {
  "hls":  "https://cdn.example/v_8KqZ/master.m3u8?token=...&exp=1728130000",
  "dash": "https://cdn.example/v_8KqZ/manifest.mpd?token=...&exp=1728130000",
  "resume_at_s": 132,
  "drm": { "widevine_license_url": "https://license.example/wv" }
}

# HLS master playlist (served by the CDN)
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360,CODECS="avc1.4d401e,mp4a.40.2"
360p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720,CODECS="avc1.4d401f,mp4a.40.2"
720p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080,CODECS="avc1.640028,mp4a.40.2"
1080p/index.m3u8`,
    },
    { type: "callout", tone: "note", title: "How ABR works", text: "HLS and DASH both split each rendition into short segments (2–6 s) listed in a manifest (`.m3u8` playlists for HLS, an `.mpd` XML for DASH). The **player** measures throughput and buffer level and chooses which rendition to fetch for the *next* segment — the server is just static files. With **CMAF** (fragmented MP4) one set of segments can be referenced by both HLS and DASH manifests, halving storage and CDN cache footprint." },
  ],
  dataModel: [
    {
      type: "code",
      lang: "sql",
      caption: "Video metadata (sharded SQL or wide-column, keyed by video_id)",
      code: `CREATE TABLE videos (
  video_id     text PRIMARY KEY,
  owner_id     bigint NOT NULL,
  title        text,
  status       text,            -- uploading | processing | ready | failed | blocked
  visibility   text,            -- public | unlisted | private
  duration_s   int,
  source_key   text,            -- object key of the original
  created_at   timestamptz
);
CREATE INDEX videos_owner_idx ON videos (owner_id, created_at DESC);

CREATE TABLE renditions (
  video_id     text,
  codec        text,            -- h264 | vp9 | av1
  height       int,             -- 240..2160
  bitrate_kbps int,
  playlist_key text,            -- e.g. v_8KqZ/720p/index.m3u8
  status       text,
  PRIMARY KEY (video_id, codec, height)
);

CREATE TABLE transcode_tasks (
  task_id      text PRIMARY KEY,
  video_id     text,
  chunk_index  int,             -- source split into GOP-aligned pieces
  rendition    text,
  state        text,            -- pending | leased | done | failed
  attempts     int,
  lease_until  timestamptz
);

-- Watch progress: high write rate, per (user, video); wide-column store
-- PRIMARY KEY ((user_id), video_id) -> position_s, updated_at`,
    },
    {
      type: "table",
      head: ["Object storage layout", "Purpose"],
      rows: [
        ["`originals/{video_id}/source.mp4`", "Durable master copy; moved to an archive tier after processing."],
        ["`vod/{video_id}/{rendition}/seg_00042.m4s`", "CMAF segments; immutable → cacheable forever at the CDN."],
        ["`vod/{video_id}/master.m3u8`, `manifest.mpd`", "Manifests; small, cached with shorter TTL."],
        ["`thumbs/{video_id}/...`", "Poster images and seek-preview sprites."],
      ],
    },
  ],
  architecture: {
    nodes: [
      { id: "client", label: "Uploader / player apps", kind: "client" },
      { id: "cdn", label: "CDN (edge + ISP caches)", kind: "edge" },
      { id: "upload", label: "Upload + video API", kind: "service" },
      { id: "raw", label: "Originals (object storage)", kind: "data" },
      { id: "jobs", label: "Transcode job queue", kind: "queue" },
      { id: "transcode", label: "Transcode + package workers", kind: "service" },
      { id: "origin", label: "Segment origin (object storage)", kind: "data" },
      { id: "metadb", label: "Video metadata DB", kind: "data" },
      { id: "playback", label: "Playback service (manifest URLs, tokens, DRM)", kind: "service" },
      { id: "telemetry", label: "QoE / view events (Kafka)", kind: "queue" },
    ],
    edges: [
      { from: "client", to: "upload", label: "resumable upload" },
      { from: "upload", to: "raw", label: "store source" },
      { from: "upload", to: "metadb", label: "status=processing" },
      { from: "upload", to: "jobs", label: "split + enqueue tasks" },
      { from: "jobs", to: "transcode", label: "lease task" },
      { from: "transcode", to: "raw", label: "read source chunk" },
      { from: "transcode", to: "origin", label: "segments + manifests" },
      { from: "transcode", to: "metadb", label: "rendition ready" },
      { from: "client", to: "playback", label: "GET /play" },
      { from: "playback", to: "metadb", label: "ACL + renditions" },
      { from: "client", to: "cdn", label: "manifests + segments" },
      { from: "cdn", to: "origin", label: "cache miss (shielded)" },
      { from: "client", to: "telemetry", label: "beacons" },
    ],
    notes: [
      { type: "list", items: [
        "**Upload API**: resumable chunked uploads (tus/GCS-style) so a dropped connection resumes; validates format, stores the original, creates a processing job.",
        "**Job queue + workers**: the source is split at keyframes (GOP boundaries) into e.g. 10 s pieces; each (piece, rendition) is an independent task with a lease, so a 5-minute video becomes ~150 tasks running in parallel. A final step stitches/validates and packages into CMAF segments + HLS/DASH manifests, generates thumbnails.",
        "**Transcoding ladder**: one encode per rendition (and per codec — H.264 for compatibility, VP9/AV1 for bandwidth savings on popular videos). Per-title encoding tunes the ladder to content complexity (cartoons need fewer bits than sports).",
        "**Segment origin**: object storage behind an origin shield (a mid-tier cache) so thousands of edge nodes don't all miss to storage.",
        "**CDN**: segments are immutable, so they are cached with long TTLs; hot content is pre-positioned in ISP-embedded caches off-peak.",
        "**Playback service**: authorises the viewer, returns manifest URLs with signed tokens (expiry), DRM license endpoints for premium content and the resume position.",
        "**Telemetry**: players send startup time, bitrate switches, rebuffer events and view heartbeats for QoE dashboards, view counts and recommendations.",
      ] },
    ],
  },
  flows: [
    {
      title: "Upload and processing",
      steps: [
        "Client creates the video record and uploads the file in 8 MB chunks to the resumable upload endpoint.",
        "On completion the original is stored, the status becomes `processing`, and a split job is enqueued.",
        "Splitter probes the file (ffprobe), splits at keyframes into ~10 s pieces and enqueues (piece × rendition) tasks.",
        "Workers lease tasks, encode, write outputs; leases expire if a worker dies so the task is retried elsewhere.",
        "When all pieces of a rendition are done, the packager concatenates and segments into 4 s CMAF fragments and writes playlists. Low renditions finish first, so the video can go live at 360p while 1080p is still encoding.",
        "Metadata becomes `ready`; content moderation / copyright matching can run in parallel and gate publication.",
      ],
    },
    {
      title: "Playback",
      steps: [
        "Player calls `/play`; playback service checks visibility/ACL and returns signed manifest URLs.",
        "Player fetches the master playlist from the CDN, picks a starting rendition (often a conservative one for fast start), and fetches the first segments.",
        "ABR loop: after each segment, the player estimates throughput and buffer health and picks the rendition for the next segment.",
        "CDN edge serves segments; a miss goes to the regional shield, then to origin storage.",
        "Player sends periodic heartbeats (position, bitrate, rebuffers) → view counts, resume position and QoE metrics.",
      ],
    },
  ],
  bottlenecks: [
    "CDN egress and cost — high cache hit ratio (immutable segments, origin shield, ISP caches), efficient codecs for popular titles (AV1/VP9 ≈ 30–50% fewer bits than H.264 for similar quality).",
    "Long-tail content — most videos are rarely watched; edge hit ratio is low for them, so the origin shield and storage tiering matter.",
    "Transcoding bursts — queue-based elastic worker pools, spot/preemptible instances (tasks are idempotent and short), GPU/ASIC encoders for scale.",
    "Viral video thundering herd — request coalescing at edge/shield so one miss fetches from origin while others wait.",
  ],
  failures: [
    { scenario: "Transcode worker dies mid-task", mitigation: "The task lease expires and another worker picks it up; outputs are written to a temp key and atomically promoted, so partial files are never referenced. Max attempts → mark failed and alert." },
    { scenario: "A CDN PoP fails", mitigation: "DNS/anycast steers users to the next PoP; multi-CDN with client- or DNS-based switching for big providers. Players retry failed segment requests against alternate CDN hostnames listed in the manifest." },
    { scenario: "Origin storage region outage", mitigation: "Replicate renditions of popular content to a second region; the shield fails over. Originals are cross-region replicated for durability." },
    { scenario: "Corrupt or unsupported upload", mitigation: "Probe and validate before fan-out; failed status with a user-facing error; never block the queue (poison tasks go to a DLQ)." },
  ],
  tradeoffs: [
    { decision: "HLS vs DASH", options: "HLS (required by Apple devices/Safari) vs DASH (open standard, common on Android/smart TVs).", choice: "Both, from one set of CMAF segments with two manifests — packaging is cheap, storage isn't." },
    { decision: "Segment duration", options: "Short (2 s): faster start and adaptation, more requests and overhead. Long (6–10 s): better compression efficiency and fewer requests, slower adaptation.", choice: "~4 s for VOD as a balance; 1–2 s (or LL-HLS partial segments) for low-latency live." },
    { decision: "Transcode everything upfront vs on demand", options: "Full ladder for every upload vs minimal renditions first and more (e.g. AV1, 4K) only when a video gets popular.", choice: "Tiered: H.264 ladder for everything, premium codecs only for videos crossing a view threshold. Saves compute and storage on the long tail." },
    { decision: "Build vs buy CDN", options: "Commercial CDNs vs own edge (Open Connect-style appliances in ISPs).", choice: "Commercial/multi-CDN until egress volume justifies owning edge hardware; at Netflix scale owning it is far cheaper." },
  ],
  walkthrough: [
    { title: "1. Clarify functional requirements", detail: "\"VOD, not live (I'll mention live at the end). Upload, transcode, adaptive playback on all devices, resume, view counts. Recommendations and comments are out of scope.\"" },
    { title: "2. Non-functional requirements", detail: "\"Fast start (< 2 s), minimal rebuffering, originals never lost, cost efficiency — egress is the dominant cost.\"" },
    { title: "3. Assumptions", detail: "\"1M uploads/day of 5 minutes, 1B views/day of 5 minutes at 3 Mbps average, a five-rung H.264 ladder summing to 10.4 Mbps.\"" },
    { title: "4. Estimate", detail: "\"300 TB/day of originals, 390 TB/day of renditions — ~250 PB/year total. ~3.5M concurrent streams → ~10 Tbps average, ~21 Tbps peak egress. Transcoding ≈ 17k cores busy on average.\"" },
    { title: "5. API and data model", detail: "\"Resumable upload, a status endpoint, and a /play endpoint returning signed HLS/DASH URLs. Metadata for videos, renditions and transcode tasks; segments as immutable objects.\"" },
    { title: "6. High-level design", detail: "\"Upload → originals → split → parallel transcode tasks → package to CMAF → origin → CDN → player. Playback service handles auth, signed URLs and DRM; telemetry flows back through Kafka.\"" },
    { title: "7. Main flows", detail: "\"Processing pipeline with leases and progressive availability; playback with the client-side ABR loop.\"" },
    { title: "8. Bottlenecks", detail: "\"Egress, long-tail cache misses, transcode bursts, viral thundering herds.\"" },
    { title: "9. Component choices", detail: "\"Object storage for everything binary, a queue with leases for tasks, CMAF to share segments between HLS and DASH, multi-CDN with an origin shield.\"" },
    { title: "10. Scaling, consistency, failure", detail: "\"Tasks are idempotent and retried via lease expiry; segments are immutable so caching is trivial and consistent; metadata status transitions are the only strongly consistent piece.\"" },
    { title: "11. Security, observability, ops", detail: "\"Signed expiring URLs, DRM for premium content, upload scanning and moderation. QoE dashboards: startup time, rebuffer ratio, average bitrate, CDN hit ratio, per-ISP breakdowns.\"" },
    { title: "12. Trade-offs", detail: "\"Segment length, upfront vs on-demand transcoding, buying vs building the edge.\"" },
  ],
  followUps: [
    { q: "How does the player decide which quality to fetch?", a: "Throughput-based ABR estimates bandwidth from recent segment download times; buffer-based ABR (e.g. BOLA) picks quality from buffer occupancy; production players blend both, start conservatively for fast startup, and avoid oscillation with hysteresis." },
    { q: "What changes for live streaming?", a: "Ingest via RTMP/SRT to a live transcoder that produces the ladder in real time; playlists are continuously updated (sliding window) and refreshed by players; latency targets push you to short segments or LL-HLS/LL-DASH with partial segments and chunked transfer. No time for parallel chunked transcoding of the whole file." },
    { q: "How do you protect premium content?", a: "DRM (Widevine, FairPlay, PlayReady): segments are encrypted (CENC/CBCS), and the player obtains decryption keys from a license server after auth. Signed URLs/tokens only stop casual hotlinking; DRM protects the content itself." },
    { q: "How do you count views accurately?", a: "Player heartbeats into Kafka; a stream job counts a view after a threshold (e.g. 30 s watched), dedupes by (session, video) and filters bots. Counts are approximate in real time and reconciled in batch." },
    { q: "How would you cut storage costs?", a: "Archive originals to cold storage after processing, drop rarely-used renditions for cold videos (re-transcode on demand), use per-title encoding, and generate AV1 only for popular titles where the bandwidth savings repay the encode cost." },
  ],
  related: [
    "system-design/cdn-edge-caching",
    "system-design/async-processing",
    "system-design/latency-throughput",
    "system-design/capacity-estimation",
    "system-design/rabbitmq-kafka-sqs",
    "system-design/backpressure",
    "networks/http",
    "networks/http-caching",
    "cloud/cdn-cloudfront",
  ],
};

// ---------------------------------------------------------------------------
// 8. Search autocomplete
// ---------------------------------------------------------------------------
const searchAutocomplete: DesignExercise = {
  slug: "search-autocomplete",
  title: "Search autocomplete (typeahead)",
  level: "advanced",
  summary:
    "Return the top suggestions for a prefix in a few milliseconds at ~460k requests/s. Covers tries with precomputed top-k per node, an offline aggregation + build pipeline, a streaming trending layer, layered caching and filtering.",
  minutes: 75,
  status: "authored",
  functional: [
    "As the user types, return up to 10 suggested completions for the current prefix.",
    "Rank by popularity with recency (time-decayed counts); surface trending queries within minutes.",
    "Filter offensive/legal-blocked suggestions; support multiple languages/locales.",
    "Light personalisation (the user's own recent searches) is a stretch goal.",
  ],
  nonFunctional: [
    "Server p99 < 20 ms; end-to-end < 100 ms so suggestions keep up with typing.",
    "Very high availability; stale suggestions are acceptable (popularity changes slowly), missing suggestions are a poor experience but not an outage.",
    "Read-dominated: suggestions are rebuilt offline; the serving path is read-only.",
  ],
  assumptions: [
    "5B searches/day; with client debouncing (~100–150 ms) each search triggers ~4 autocomplete requests.",
    "Peak = 2× average.",
    "Index keeps the top 100M distinct queries (above a minimum frequency), average 20 characters.",
    "Prefixes indexed up to 15 characters (longer prefixes rarely add value); ~500M distinct prefix nodes after sharing.",
    "Each prefix entry ≈ 100 B (prefix + 10 suggestion IDs × 4 B + overhead).",
    "One serving node handles ~50k req/s from memory.",
  ],
  estimation: [
    {
      type: "table",
      head: ["Quantity", "Arithmetic", "Result"],
      rows: [
        ["Autocomplete requests per day", "5B × 4", "20B/day"],
        ["QPS (avg / peak)", "20,000,000,000 ÷ 86,400 ≈ 231k; × 2", "≈ 231k/s avg, ≈ 463k/s peak"],
        ["Prefix upper bound", "100M queries × 15 chars", "1.5B (shared prefixes bring it to ~500M)"],
        ["Prefix → top-10 index", "500M × 100 B", "≈ 50 GB"],
        ["Suggestion strings", "100M × ~30 B (text + score)", "≈ 3 GB"],
        ["Serving replicas per region", "463k ÷ 50k per node", "≈ 10; run 15 for headroom and AZ failure"],
        ["Query log volume", "5B searches × ~50 B", "≈ 250 GB/day into the aggregation pipeline"],
      ],
    },
    { type: "callout", tone: "tip", title: "What the numbers tell you", text: "The whole index (~53 GB) fits in one machine's RAM, so the simplest robust design is **full replicas** of an immutable, precomputed index, scaled horizontally for QPS. Sharding by prefix only becomes necessary with many locales or personalisation." },
  ],
  api: [
    {
      type: "code",
      lang: "http",
      caption: "Suggest endpoint (cacheable)",
      code: `GET /v1/suggest?q=how+to+ma&locale=en-IN&limit=10 HTTP/1.1

HTTP/1.1 200 OK
Cache-Control: public, max-age=300
Content-Type: application/json

{
  "prefix": "how to ma",
  "suggestions": [
    { "text": "how to make pizza", "score": 0.94 },
    { "text": "how to make money online", "score": 0.91 },
    { "text": "how to manage stress", "score": 0.73 }
  ],
  "index_version": "2026-10-05T06:00Z+trend-1712"
}`,
    },
    { type: "callout", tone: "note", text: "Normalise the prefix (lowercase, collapse spaces, Unicode NFKC) before lookup and before caching, so `How  To` and `how to` share a cache entry. The client cancels in-flight requests when the user keeps typing and ignores out-of-order responses." },
  ],
  dataModel: [
    {
      type: "code",
      lang: "text",
      caption: "Trie with top-k cached at every node (conceptual)",
      code: `root
 └─ h
     └─ o
         └─ w ─ top10: ["how to make pizza", "how to tie a tie", ...]
             └─ " " ─ t ─ o ─ " " ─ m ─ a ─ top10: ["how to make pizza", "how to make money online", ...]

Lookup(prefix): walk len(prefix) edges -> return node.top10   // O(len(prefix)), no subtree scan
Build: post-order traversal; node.top10 = topK(own terminal count ∪ children's top10)`,
    },
    {
      type: "code",
      lang: "sql",
      caption: "Offline tables (data lake / warehouse)",
      code: `-- Hourly aggregates from raw query logs
CREATE TABLE query_counts_hourly (
  locale     text,
  query      text,      -- normalised
  hour       timestamp,
  count      bigint,
  PRIMARY KEY (locale, hour, query)
);

-- Daily scored candidates fed into the index builder:
-- score = sum over the last 30 days of count_d * exp(-lambda * age_days)
CREATE TABLE query_scores (
  locale     text,
  query      text,
  score      double precision,
  blocked    boolean,
  PRIMARY KEY (locale, query)
);`,
    },
    {
      type: "table",
      head: ["Serving structure", "Choice", "Why"],
      rows: [
        ["Index format", "Flattened sorted array of prefixes → offsets into a suggestion table (or an FST), memory-mapped", "Compact, cache-friendly, immutable → no locks; load a new version with an atomic pointer swap."],
        ["Versioning", "Snapshot per build, stored in object storage", "Roll forward/back instantly; every replica serves the same version."],
        ["Trending overlay", "Small in-memory map prefix → trending top-k, refreshed every minute", "Freshness without rebuilding the big index."],
      ],
    },
  ],
  architecture: {
    nodes: [
      { id: "client", label: "Search box (debounced)", kind: "client" },
      { id: "cdn", label: "CDN / edge cache", kind: "edge" },
      { id: "suggest", label: "Suggest service (in-memory index)", kind: "service" },
      { id: "trending", label: "Trending overlay (Redis)", kind: "cache" },
      { id: "logs", label: "Query log stream (Kafka)", kind: "queue" },
      { id: "stream", label: "Stream job (trending windows)", kind: "service" },
      { id: "lake", label: "Data lake (logs, aggregates)", kind: "data" },
      { id: "builder", label: "Batch aggregation + index builder", kind: "service" },
      { id: "snapshots", label: "Index snapshots (object storage)", kind: "data" },
    ],
    edges: [
      { from: "client", to: "cdn", label: "GET /suggest?q=" },
      { from: "cdn", to: "suggest", label: "cache miss" },
      { from: "suggest", to: "trending", label: "merge fresh top-k" },
      { from: "suggest", to: "logs", label: "search events" },
      { from: "logs", to: "stream", label: "consume" },
      { from: "stream", to: "trending", label: "update every minute" },
      { from: "logs", to: "lake", label: "archive" },
      { from: "lake", to: "builder", label: "daily/hourly batch" },
      { from: "builder", to: "snapshots", label: "publish version" },
      { from: "snapshots", to: "suggest", label: "load + atomic swap" },
    ],
    notes: [
      { type: "list", items: [
        "**Client**: debounce, cancel stale requests, cache recent prefixes locally (typing 'how' then deleting a character should not hit the network).",
        "**CDN / edge cache**: short prefixes ('a', 'ho') are requested by everyone and change slowly, so caching them for minutes absorbs a large share of traffic.",
        "**Suggest service**: stateless apart from a read-only, memory-mapped index; lookup is O(prefix length) and returns precomputed top-k, then merges the trending overlay and applies last-mile filters.",
        "**Batch builder**: aggregates logs with time decay, removes blocked/PII-like queries and low-frequency noise (privacy: only queries searched by many distinct users), builds the trie with top-k per node, publishes an immutable snapshot.",
        "**Stream job**: counts queries in sliding windows (e.g. 10 min) and flags those whose rate jumps far above their baseline — breaking news shows up within minutes.",
      ] },
    ],
  },
  flows: [
    {
      title: "Serve a suggestion request",
      steps: [
        "User types 'how to ma'; client waits for a ~120 ms pause, then requests (or hits its local cache).",
        "CDN returns a cached response if present; otherwise a suggest replica handles it.",
        "Replica normalises the prefix, walks the trie (or binary-searches the flattened prefix array) to the node and reads its top-10.",
        "It merges trending candidates for the same prefix (score boost), removes blocked items, returns 10 results with `Cache-Control`.",
        "The final submitted search (not every keystroke) is logged to Kafka.",
      ],
    },
    {
      title: "Rebuild the index",
      steps: [
        "Hourly/daily batch job aggregates query counts per locale and applies exponential time decay.",
        "Filters: blocklists, minimum distinct-user count (privacy), spam detection.",
        "Builds the trie bottom-up computing top-k per node with a bounded heap; serialises a compact snapshot with a version.",
        "Canary: one replica loads it and is checked for latency and suggestion-quality metrics; then all replicas load and atomically swap.",
      ],
    },
  ],
  bottlenecks: [
    "Top-of-funnel prefixes (1–2 chars) are the hottest keys — served from CDN and per-replica caches.",
    "Index build time over billions of log lines — distributed aggregation (Spark), incremental builds per locale.",
    "Memory per replica — compact encodings (FST / succinct tries), cap prefix length, cap per-locale query count.",
    "Freshness — the batch index is hours old; the trending overlay closes the gap.",
  ],
  failures: [
    { scenario: "Bad index build (e.g. empty or offensive suggestions)", mitigation: "Validation gates (size, coverage, blocklist hits), canary rollout, and instant rollback by loading the previous snapshot version." },
    { scenario: "Trending layer unavailable", mitigation: "Serve from the base index only; suggestions are a little stale, nothing breaks." },
    { scenario: "Suggest replicas overloaded", mitigation: "Return fewer results or cached results for short prefixes; the client treats timeouts silently (no suggestions shown) rather than blocking search." },
    { scenario: "Coordinated manipulation (bots pushing a query)", mitigation: "Count distinct users/IPs rather than raw events, anomaly detection on velocity, human review for trending items." },
  ],
  tradeoffs: [
    { decision: "Precomputed top-k per node vs computing at query time", options: "Store top-k at every trie node (more memory, O(len) lookup) vs traverse the subtree and rank on each request (less memory, unbounded latency for short prefixes).", choice: "Precompute: short prefixes have enormous subtrees, and they are the most frequent requests." },
    { decision: "Trie vs KV map of prefix → suggestions", options: "In-memory trie/FST vs a distributed KV store (Redis/Cassandra) keyed by prefix.", choice: "Either works; the KV form is easy to shard and update, the in-memory trie is faster and needs no network hop. At ~50 GB, replicated in-memory wins; switch to KV when personalised or multi-locale data outgrows RAM." },
    { decision: "Freshness", options: "Rebuild the full index frequently vs batch + streaming overlay (lambda-style).", choice: "Batch daily/hourly for the bulk, streaming overlay for trending — the overlay is small and cheap to update." },
  ],
  walkthrough: [
    { title: "1. Clarify functional requirements", detail: "\"Top 10 completions per prefix, ranked by popularity with recency, trending within minutes, filtered, per locale. Personalisation as an extension.\"" },
    { title: "2. Non-functional requirements", detail: "\"Under ~20 ms server time, extremely available, staleness is fine. The serving path is read-only.\"" },
    { title: "3. Assumptions", detail: "\"5B searches/day, ~4 requests per search after debouncing, 100M indexed queries, prefixes capped at 15 chars.\"" },
    { title: "4. Estimate", detail: "\"20B requests/day ≈ 231k/s, ~460k/s peak. ~500M prefix nodes × 100 B ≈ 50 GB — it fits in RAM, so replicate the whole index; ~10–15 replicas per region.\"" },
    { title: "5. API and data model", detail: "\"GET /suggest?q= with Cache-Control. A trie with top-k at each node, flattened into an immutable snapshot; offline tables for hourly counts and decayed scores.\"" },
    { title: "6. High-level design", detail: "\"Serving: client → CDN → suggest replicas with in-memory index + trending overlay. Offline: logs → Kafka → lake → batch builder → snapshots; Kafka → stream job → trending.\"" },
    { title: "7. Main flows", detail: "\"Lookup is a walk to the prefix node and a read of its top-k; rebuild is aggregate, decay, filter, build bottom-up, canary, swap.\"" },
    { title: "8. Bottlenecks", detail: "\"Hot short prefixes, build time, memory, freshness.\"" },
    { title: "9. Component choices", detail: "\"Immutable memory-mapped snapshots: lock-free reads and trivial rollback. Spark for aggregation, Flink for trending windows.\"" },
    { title: "10. Scaling, consistency, failure", detail: "\"Add replicas for QPS; shard by locale or prefix range if the index outgrows RAM. Bad builds roll back by version.\"" },
    { title: "11. Security, observability, ops", detail: "\"Blocklists, privacy thresholds so a rare query typed by one person never becomes a suggestion, manipulation detection. Metrics: latency, CDN hit ratio, suggestion CTR, index age.\"" },
    { title: "12. Trade-offs", detail: "\"Memory for latency (top-k per node), freshness via an overlay instead of constant rebuilds.\"" },
  ],
  followUps: [
    { q: "How do you add personalisation?", a: "Keep the global index as is and merge a small per-user candidate set (recent searches from a per-user store, fetched in parallel) at serving time, with a boost. Personalised responses must not be cached publicly (`Cache-Control: private`)." },
    { q: "How do you handle typos?", a: "Fuzzy matching: search the trie allowing edit distance 1 for longer prefixes (bounded), or map common misspellings to canonical prefixes offline. Keep it bounded — fuzzy traversal can explode on short prefixes." },
    { q: "How do you shard if the index doesn't fit?", a: "By locale first; then by prefix range (e.g. first two characters), with care for skew — 's' and 'c' prefixes are much bigger than 'x'. A lookup goes to exactly one shard because a prefix determines its range." },
    { q: "Why time decay instead of raw counts?", a: "Raw all-time counts keep stale queries on top forever. Exponential decay (score = Σ count_d × e^(−λ·age)) lets new popular queries overtake old ones while keeping evergreen queries stable." },
  ],
  related: [
    "system-design/caching-strategies",
    "system-design/cdn-edge-caching",
    "system-design/sharding-partitioning",
    "system-design/replication",
    "system-design/async-processing",
    "system-design/deployment-strategies",
    "dsa/trees",
    "networks/http-caching",
  ],
};

// ---------------------------------------------------------------------------
// 9. Distributed task queue
// ---------------------------------------------------------------------------
const distributedTaskQueue: DesignExercise = {
  slug: "distributed-task-queue",
  title: "Distributed task queue (SQS / Celery backend)",
  level: "advanced",
  summary:
    "A durable queue that producers enqueue jobs into and a fleet of workers consumes. Covers partitioned replicated storage, leases and visibility timeouts, at-least-once delivery, delayed tasks, priorities, retries with backoff, DLQs and fencing stale workers.",
  minutes: 90,
  status: "authored",
  functional: [
    "Create named queues; enqueue tasks with a payload (≤ 256 KB), optional delay, priority and deduplication ID.",
    "Workers lease tasks; a leased task is invisible to others until the lease (visibility timeout) expires.",
    "Workers ack (delete), nack (retry later) or extend the lease of a task.",
    "Automatic retries with exponential backoff; after max attempts the task moves to a dead-letter queue.",
    "Optional FIFO per group key (tasks with the same key run one at a time, in order).",
    "Queue metrics: depth, age of oldest task, in-flight count.",
  ],
  nonFunctional: [
    "Durable: an acknowledged enqueue survives the loss of any single node/AZ.",
    "At-least-once delivery; handlers must be idempotent (exactly-once processing is not offered).",
    "Enqueue p99 < 20 ms; lease p99 < 50 ms.",
    "Scales horizontally with queue count and throughput; one hot queue can scale beyond one machine.",
    "Backlog tolerant: consumers can be down for hours without losing work.",
  ],
  assumptions: [
    "1B tasks/day; peak = 5× average.",
    "Average payload 2 KB.",
    "Each task costs ~3 broker operations (enqueue, lease, ack), more on retries.",
    "Average handler time 200 ms; 10% of tasks are delayed/scheduled.",
    "One replicated partition sustains ~5k durable ops/s (replicated log with batching).",
    "Design for a 6-hour consumer outage at peak rate.",
  ],
  estimation: [
    {
      type: "table",
      head: ["Quantity", "Arithmetic", "Result"],
      rows: [
        ["Enqueue rate (avg / peak)", "1,000,000,000 ÷ 86,400 ≈ 11,600; × 5", "≈ 11.6k/s avg, ≈ 58k/s peak"],
        ["Broker ops (peak)", "58k × 3", "≈ 174k ops/s"],
        ["Partitions", "174k ÷ 5k per partition", "≈ 35 → provision 64"],
        ["Ingest bandwidth (peak)", "58k × 2 KB", "≈ 116 MB/s (× 3 for replication)"],
        ["Concurrent tasks in flight (Little's law)", "11.6k/s × 0.2 s; peak 58k/s × 0.2 s", "≈ 2.3k avg, ≈ 11.6k peak worker slots"],
        ["Backlog for a 6 h outage", "58k/s × 21,600 s", "≈ 1.25B tasks × 2 KB ≈ 2.5 TB (≈ 7.5 TB replicated)"],
        ["Delayed tasks per day", "1B × 10%", "100M timers/day ≈ 1.2k/s average"],
      ],
    },
    { type: "callout", tone: "tip", title: "What the numbers tell you", text: "Throughput is moderate; what drives the design is **durability + lease semantics** and being able to absorb a **multi-TB backlog**. Little's law sizes the worker fleet: concurrency = arrival rate × service time." },
  ],
  api: [
    {
      type: "code",
      lang: "http",
      caption: "Producer and worker APIs",
      code: `POST /v1/queues/emails/tasks HTTP/1.1
Content-Type: application/json

{ "payload": { "to": "a@example.com", "template": "welcome" },
  "delay_seconds": 0, "priority": 5, "dedup_id": "welcome:user_42", "group_key": null,
  "max_attempts": 8 }

HTTP/1.1 201 Created
{ "task_id": "t_01JAC9...", "partition": 17 }

POST /v1/queues/emails/lease
{ "max_tasks": 10, "visibility_timeout_s": 30, "wait_time_s": 20 }      # long poll
-> 200 { "tasks": [ { "task_id": "t_01JAC9...", "receipt": "r_17_88812_gen3", "attempt": 1,
                      "payload": { ... } } ] }

POST /v1/queues/emails/tasks/t_01JAC9.../ack      { "receipt": "r_17_88812_gen3" }  -> 204
POST /v1/queues/emails/tasks/t_01JAC9.../nack     { "receipt": "...", "retry_after_s": 60 } -> 204
POST /v1/queues/emails/tasks/t_01JAC9.../extend   { "receipt": "...", "visibility_timeout_s": 60 } -> 204
# stale receipt (lease expired and task re-leased) -> 409 Conflict`,
    },
    { type: "callout", tone: "note", text: "The **receipt** encodes (partition, offset, lease generation). Every re-lease bumps the generation, so a slow worker whose lease expired cannot ack or extend a task now owned by someone else — a fencing token." },
  ],
  dataModel: [
    {
      type: "code",
      lang: "sql",
      caption: "Per-partition task state (logical schema; physically a replicated log + in-memory indexes, or a SQL table)",
      code: `CREATE TABLE tasks (
  queue          text,
  partition      int,
  task_id        text,
  priority       smallint,
  visible_at     timestamptz,   -- delay / backoff / lease expiry all become 'not visible until'
  state          text,          -- ready | leased | done | dead
  lease_gen      int,
  attempts       int,
  max_attempts   int,
  group_key      text,
  dedup_id       text,
  payload        bytea,
  enqueued_at    timestamptz,
  PRIMARY KEY (queue, partition, task_id)
);
-- The lease query: highest priority, oldest, currently visible
CREATE INDEX tasks_ready_idx ON tasks (queue, partition, priority DESC, visible_at)
  WHERE state IN ('ready', 'leased');

-- Small-scale implementation on Postgres (one partition = one table):
--   UPDATE tasks SET state = 'leased', lease_gen = lease_gen + 1,
--          visible_at = now() + interval '30 seconds', attempts = attempts + 1
--   WHERE task_id IN (
--     SELECT task_id FROM tasks
--     WHERE queue = 'emails' AND state IN ('ready','leased') AND visible_at <= now()
--     ORDER BY priority DESC, visible_at
--     LIMIT 10
--     FOR UPDATE SKIP LOCKED)
--   RETURNING task_id, lease_gen, payload;`,
    },
    {
      type: "table",
      head: ["Structure (per partition, in memory, rebuilt from the log)", "Purpose"],
      rows: [
        ["Ready heap ordered by (priority, enqueue time)", "O(log n) lease of the next task."],
        ["In-flight map task → lease expiry, plus an expiry min-heap", "Re-queue tasks whose visibility timeout passed."],
        ["Hierarchical timing wheel (or time-bucketed list) for delayed tasks", "O(1) insert; tasks move to the ready heap when due."],
        ["Dedup map dedup_id → task_id (TTL e.g. 5 min)", "Idempotent enqueue for producer retries."],
        ["Replicated write-ahead log (Raft, 3 replicas)", "Durability; indexes are rebuilt by replaying it; periodic snapshots bound replay time."],
      ],
    },
  ],
  architecture: {
    nodes: [
      { id: "producers", label: "Producers", kind: "client" },
      { id: "frontend", label: "Queue frontend (stateless API)", kind: "service" },
      { id: "meta", label: "Metadata / coordinator (etcd)", kind: "data" },
      { id: "brokers", label: "Partition brokers (Raft groups)", kind: "data" },
      { id: "scheduler", label: "Delay scheduler", kind: "service" },
      { id: "workers", label: "Worker fleet", kind: "service" },
      { id: "dlq", label: "Dead-letter queues", kind: "queue" },
      { id: "metrics", label: "Metrics + autoscaler", kind: "service" },
    ],
    edges: [
      { from: "producers", to: "frontend", label: "enqueue" },
      { from: "frontend", to: "meta", label: "partition map (cached)" },
      { from: "frontend", to: "brokers", label: "append / lease / ack" },
      { from: "frontend", to: "scheduler", label: "long delays" },
      { from: "scheduler", to: "brokers", label: "release when due" },
      { from: "workers", to: "frontend", label: "lease / ack / extend (long poll)" },
      { from: "brokers", to: "dlq", label: "attempts exhausted" },
      { from: "meta", to: "brokers", label: "assignment + leader election" },
      { from: "brokers", to: "metrics", label: "depth, oldest age" },
      { from: "metrics", to: "workers", label: "scale on backlog" },
    ],
    notes: [
      { type: "list", items: [
        "**Frontend**: stateless; authenticates, picks a partition (random/round-robin for throughput, hash(group_key) for FIFO groups), forwards to the partition leader. For leases it polls several partitions so idle partitions don't starve workers.",
        "**Partition brokers**: each partition is a Raft group (leader + 2 followers in different AZs). Enqueue/lease/ack are log entries; an op is acknowledged after a majority persists it. The leader keeps the in-memory heaps.",
        "**Coordinator (etcd/ZooKeeper)**: queue → partitions map, broker membership, placement. Not on the per-task path.",
        "**Delay scheduler**: short delays live in the partition's timing wheel; very long delays (days) are parked in a time-bucketed store and released into partitions when due.",
        "**Workers**: long-poll lease, process, ack; extend the lease periodically (heartbeat) for long tasks; idempotent handlers.",
        "**DLQ**: an ordinary queue; tasks keep their attempt history for debugging and can be redriven.",
      ] },
      { type: "callout", tone: "warning", title: "Visibility timeouts are not locks", text: "If a worker pauses (GC, network) past its visibility timeout, the task is handed to another worker while the first may still be running. That is why delivery is at-least-once and handlers must be idempotent, and why side effects should be fenced by the lease generation where possible." },
    ],
  },
  flows: [
    {
      title: "Enqueue",
      steps: [
        "Producer sends the task; frontend checks the dedup ID (return the existing task if seen within the window).",
        "Frontend chooses a partition and forwards to its leader.",
        "Leader appends an `enqueue` entry to the Raft log; once a majority has it, inserts into the ready heap (or timing wheel if delayed) and acks the producer.",
      ],
    },
    {
      title: "Lease → process → ack",
      steps: [
        "Worker long-polls `lease(max=10, visibility=30s)`; frontend asks partitions with ready tasks.",
        "Leader pops tasks from the ready heap, logs a `lease(task, gen+1, expires_at)` entry, returns tasks with receipts.",
        "Worker processes; for long work it calls `extend` every ~10 s.",
        "On success the worker acks with its receipt; the leader verifies the generation, logs `done`, removes the task (data compacted later).",
        "On a recoverable error the worker nacks with `retry_after = base × 2^attempt + jitter`; the task returns to the timing wheel.",
      ],
    },
    {
      title: "Lease expiry and dead-lettering",
      steps: [
        "Expiry heap fires for a task whose lease passed without ack/extend: log `expire`, put it back in the ready heap.",
        "If `attempts >= max_attempts`, move it to the DLQ instead, with the last error and attempt history.",
        "Any late ack from the old worker carries an old generation and is rejected with 409.",
      ],
    },
  ],
  bottlenecks: [
    "Single hot queue — spread across many partitions; workers lease from multiple partitions. FIFO groups limit parallelism to the number of distinct group keys.",
    "Lease contention on the ready heap — partition leaders serialise operations; batch leases (10 at a time) and batch log writes.",
    "Very large backlogs — keep only indexes in memory and payloads on disk; snapshots bound recovery time.",
    "Poison tasks retried forever — max attempts + DLQ; exponential backoff stops hot retry loops.",
  ],
  failures: [
    { scenario: "Partition leader crashes", mitigation: "Raft elects a follower within seconds; it rebuilds heaps from the log/snapshot. Leases granted by the old leader are in the log, so their expiry times are known; unacked leased tasks simply expire and are redelivered." },
    { scenario: "Worker crashes mid-task", mitigation: "No ack → lease expires → task redelivered to another worker. Visibility timeout should be > p99 task time, or workers should heartbeat with extend." },
    { scenario: "Producer times out and retries enqueue", mitigation: "Dedup ID within a window turns the retry into a no-op; without it, accept a duplicate and rely on idempotent handlers." },
    { scenario: "Ack lost after the side effect happened", mitigation: "Task is redelivered; handler idempotency (e.g. upsert keyed by task_id, or a processed-IDs table written in the same transaction as the effect) prevents a double effect." },
    { scenario: "Downstream dependency down → every task fails", mitigation: "Backoff with jitter and a circuit breaker in workers so they pause leasing rather than burning attempts and flooding the DLQ." },
  ],
  tradeoffs: [
    { decision: "Storage engine", options: "Postgres with `FOR UPDATE SKIP LOCKED` vs Redis lists/streams vs a purpose-built replicated log.", choice: "Postgres is excellent up to a few thousand tasks/s and gives transactional enqueue with business data (outbox). Redis is fast but durability depends on AOF/replication settings. At 58k/s with strict durability, a partitioned Raft-replicated log." },
    { decision: "Kafka as a task queue?", options: "Kafka consumer groups vs a per-message-ack queue.", choice: "Kafka tracks one offset per partition, so a single slow or failing task blocks everything behind it (head-of-line blocking) and there are no per-message visibility timeouts or delays. Great for event streams; a task queue needs per-task leases." },
    { decision: "Ordering", options: "Best-effort ordering (max parallelism) vs strict FIFO per group.", choice: "Best-effort by default; FIFO only for queues that need it, scoped per group key so different groups still run in parallel." },
    { decision: "Push vs pull delivery", options: "Broker pushes to workers vs workers long-poll.", choice: "Pull with long polling: workers control their own concurrency (natural backpressure); push needs flow control per worker." },
  ],
  walkthrough: [
    { title: "1. Clarify functional requirements", detail: "\"Enqueue with delay/priority/dedup, lease with visibility timeout, ack/nack/extend, retries with backoff, DLQ, optional FIFO groups. Is a result backend in scope? I'll leave it as a follow-up.\"" },
    { title: "2. Non-functional requirements", detail: "\"Durable once acked, at-least-once delivery, low enqueue latency, survives multi-hour consumer outages, scales a single queue horizontally.\"" },
    { title: "3. Assumptions", detail: "\"1B tasks/day, 5× peak, 2 KB payloads, 200 ms handlers, 5k durable ops/s per partition.\"" },
    { title: "4. Estimate", detail: "\"~58k enqueues/s peak → ~174k broker ops/s → ~35 partitions, I'd provision 64. Little's law says ~11.6k concurrent worker slots at peak. A 6-hour outage leaves ~1.25B tasks ≈ 2.5 TB, so payloads must live on disk.\"" },
    { title: "5. API and data model", detail: "\"enqueue, lease (long poll), ack/nack/extend with receipts that carry a lease generation. Per-partition state: ready heap, in-flight expiry heap, timing wheel, dedup map — all derived from a replicated log.\"" },
    { title: "6. High-level design", detail: "\"Stateless frontends → partition leaders (Raft groups) → workers pulling; coordinator for placement; delay scheduler for long timers; DLQs.\"" },
    { title: "7. Main flows", detail: "\"Enqueue with dedup, the lease/process/ack cycle, expiry and dead-lettering.\"" },
    { title: "8. Bottlenecks", detail: "\"Hot queues, heap contention, giant backlogs, poison tasks.\"" },
    { title: "9. Component choices", detail: "\"Raft log for durability with simple failover; long-poll pull for backpressure; Postgres SKIP LOCKED as the small-scale alternative.\"" },
    { title: "10. Scaling, consistency, failure", detail: "\"Each partition is linearizable; leases are in the log so failover preserves them. Visibility timeouts give at-least-once, never exactly-once.\"" },
    { title: "11. Security, observability, ops", detail: "\"Per-queue IAM, payload encryption, size limits. Key metrics: depth, age of oldest message (the best SLO signal), in-flight, DLQ rate, redelivery rate.\"" },
    { title: "12. Trade-offs", detail: "\"Durability vs latency (sync replication), ordering vs parallelism, why not Kafka for tasks.\"" },
  ],
  followUps: [
    { q: "How do you pick the visibility timeout?", a: "Longer than the p99 processing time, so healthy tasks don't get redelivered, but short enough that crashed workers' tasks come back quickly. For variable-length work, use a short timeout plus periodic extend (heartbeat)." },
    { q: "Can you offer exactly-once?", a: "Not end to end across an arbitrary side effect. You can get exactly-once *processing* if the handler's effect and a 'processed task_id' record commit in the same transaction (or the effect is idempotent). The queue itself can only promise at-least-once (or at-most-once)." },
    { q: "How do delayed tasks scale to millions of timers?", a: "Hierarchical timing wheels give O(1) insert/expire for near-term delays; long delays are bucketed by time (e.g. per minute) in storage and loaded into the wheel shortly before they are due." },
    { q: "How do priorities avoid starvation?", a: "Weighted fair selection (e.g. lease from high:medium:low in a 6:3:1 ratio) or aging (raise priority with wait time) instead of strict priority." },
    { q: "How should autoscaling work?", a: "Scale workers on backlog per worker and age of oldest task, not CPU. Target: backlog ÷ (per-worker throughput) ≤ the acceptable drain time." },
  ],
  related: [
    "system-design/async-processing",
    "system-design/rabbitmq-kafka-sqs",
    "system-design/delivery-semantics",
    "system-design/backpressure",
    "system-design/api-idempotency",
    "system-design/replication",
    "system-design/locks-transactions-isolation",
    "distributed/consensus-basics",
    "distributed/idempotency-patterns",
    "go/worker-pool",
  ],
};

// ---------------------------------------------------------------------------
// 10. API gateway
// ---------------------------------------------------------------------------
const apiGateway: DesignExercise = {
  slug: "api-gateway",
  title: "API gateway",
  level: "advanced",
  summary:
    "The single front door for hundreds of backend services: routing, TLS, authentication, rate limiting, transformations, canaries and observability — at ~1M req/s with a few ms of overhead. Covers the data plane / control plane split and safe config rollout.",
  minutes: 80,
  status: "authored",
  functional: [
    "Route requests by host, path, method and headers to backend services (with path rewrites).",
    "Terminate TLS; validate authentication (JWT, API keys, mTLS for partners) and pass identity to backends.",
    "Per-consumer rate limits and quotas; request size limits; IP allow/deny lists.",
    "Traffic management: weighted routing for canaries/blue-green, retries, timeouts, circuit breaking.",
    "Request/response transformation (headers, CORS), response caching for selected routes.",
    "Self-service route configuration for service teams, with validation and audit.",
  ],
  nonFunctional: [
    "Added latency p99 < 5 ms (excluding backend time).",
    "Availability 99.99%+: it is a single point of entry, so it must not be a single point of failure.",
    "Config changes propagate to all nodes in < 10 s and can be rolled back instantly.",
    "Horizontal scale to 1M req/s peak; noisy tenants must not degrade others.",
  ],
  assumptions: [
    "400k req/s average, 1M req/s peak.",
    "Average request + response size 5 KB.",
    "One gateway node (16 vCPU) sustains ~20k req/s with TLS and the plugin chain.",
    "3 AZs; capacity must survive the loss of a whole AZ.",
    "~10% of requests at peak open a new TLS connection (the rest reuse keep-alive connections); a full handshake costs ~1 ms of CPU (order of magnitude).",
    "JWT signature verification (RS256) ≈ 40 µs of CPU.",
    "5,000 routes across 300 backend services; access log line ≈ 500 B.",
  ],
  estimation: [
    {
      type: "table",
      head: ["Quantity", "Arithmetic", "Result"],
      rows: [
        ["Nodes for peak", "1,000,000 ÷ 20,000", "50 nodes"],
        ["Nodes surviving an AZ loss", "50 × 3/2", "75 nodes (25 per AZ)"],
        ["Peak bandwidth", "1M × 5 KB", "5 GB/s ≈ 40 Gbps"],
        ["TLS handshake CPU (peak)", "100k new conns/s × 1 ms", "100 cores ≈ 6–7 nodes' worth → keep-alive and session resumption matter"],
        ["JWT verification CPU (peak)", "1M × 40 µs", "40 cores; cache verified tokens by hash to cut it further"],
        ["Access logs per day", "400k × 86,400 × 500 B", "≈ 17.3 TB/day"],
        ["Route table size", "5,000 routes × ~2 KB", "≈ 10 MB — trivially in memory on every node"],
      ],
    },
    { type: "callout", tone: "tip", title: "What the numbers tell you", text: "The data plane is CPU-bound (TLS, crypto, parsing), stateless and easy to scale; the config is tiny. The design risk is not capacity but **blast radius**: a bad config push or a slow plugin hits every API at once." },
  ],
  api: [
    {
      type: "code",
      lang: "json",
      caption: "Route definition (control-plane API, declarative)",
      code: `{
  "route_id": "orders-v2",
  "match": { "host": "api.example.com", "path_prefix": "/v2/orders", "methods": ["GET", "POST"] },
  "auth": { "type": "jwt", "issuer": "https://auth.example.com", "audiences": ["orders"], "required_scopes": ["orders:read"] },
  "rate_limit": { "key": "consumer_id", "per_second": 200, "burst": 400 },
  "upstreams": [
    { "service": "orders", "subset": "v2-stable", "weight": 95 },
    { "service": "orders", "subset": "v2-canary", "weight": 5 }
  ],
  "timeout_ms": 2000,
  "retries": { "attempts": 2, "on": ["connect-failure", "503"], "only_idempotent": true },
  "rewrite": { "strip_prefix": "/v2" },
  "headers": { "add_request": { "X-Consumer-Id": "{{consumer.id}}" }, "remove_request": ["Authorization"] }
}`,
    },
    {
      type: "code",
      lang: "http",
      caption: "What a backend receives",
      code: `GET /orders/123 HTTP/1.1
Host: orders.internal
X-Request-Id: 01JACD2Q8M7...
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
X-Consumer-Id: c_8812
X-Auth-Subject: user_42
X-Auth-Scopes: orders:read`,
    },
    { type: "callout", tone: "warning", text: "Backends must only accept traffic from the gateway (mTLS or network policy); otherwise identity headers like `X-Auth-Subject` can be forged by anyone who reaches the backend directly. The gateway must also strip any such headers sent by clients." },
  ],
  dataModel: [
    {
      type: "code",
      lang: "sql",
      caption: "Control-plane store (Postgres) — the source of truth for config",
      code: `CREATE TABLE routes (
  route_id     text PRIMARY KEY,
  team         text NOT NULL,
  spec         jsonb NOT NULL,       -- validated against a schema
  version      bigint NOT NULL,
  updated_by   text NOT NULL,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE consumers (
  consumer_id  text PRIMARY KEY,
  plan         text NOT NULL,        -- drives rate limits / quotas
  api_key_hash bytea UNIQUE,         -- store a hash, never the key
  status       text NOT NULL
);

-- Every published config is an immutable snapshot that nodes can roll back to.
CREATE TABLE config_snapshots (
  snapshot_id  bigint PRIMARY KEY,
  routes_hash  text NOT NULL,
  blob_key     text NOT NULL,        -- compiled config in object storage
  created_at   timestamptz NOT NULL,
  status       text NOT NULL         -- canary | active | rolled_back
);`,
    },
    {
      type: "table",
      head: ["Runtime state", "Where", "Why"],
      rows: [
        ["Compiled route table (prefix trie / radix tree)", "In memory on every node", "O(path length) matching with zero network calls."],
        ["JWKS public keys", "In memory, refreshed every few minutes and on unknown `kid`", "Local JWT verification."],
        ["Rate-limit counters", "Redis cluster (token buckets via Lua) + local deny cache", "Accurate cross-node limits."],
        ["Upstream endpoints", "From service discovery (pushed)", "Health-aware load balancing."],
      ],
    },
  ],
  architecture: {
    nodes: [
      { id: "client", label: "Apps / partners", kind: "client" },
      { id: "edge", label: "Anycast DNS + L4 LB + WAF/DDoS", kind: "edge" },
      { id: "gateway", label: "Gateway data plane (Envoy-like)", kind: "service" },
      { id: "control", label: "Control plane", kind: "service" },
      { id: "configdb", label: "Config store + snapshots", kind: "data" },
      { id: "idp", label: "Identity provider (JWKS, introspection)", kind: "external" },
      { id: "ratelimit", label: "Rate-limit Redis", kind: "cache" },
      { id: "discovery", label: "Service discovery", kind: "service" },
      { id: "backends", label: "Backend services", kind: "service" },
      { id: "telemetry", label: "Logs / metrics / traces pipeline", kind: "queue" },
    ],
    edges: [
      { from: "client", to: "edge", label: "HTTPS" },
      { from: "edge", to: "gateway", label: "TCP (proxy protocol)" },
      { from: "gateway", to: "idp", label: "fetch JWKS (cached)" },
      { from: "gateway", to: "ratelimit", label: "check limits" },
      { from: "gateway", to: "backends", label: "routed request (mTLS)" },
      { from: "control", to: "configdb", label: "validate + store" },
      { from: "control", to: "gateway", label: "push config (xDS-style)" },
      { from: "discovery", to: "control", label: "endpoints + health" },
      { from: "gateway", to: "telemetry", label: "access logs, spans" },
    ],
    notes: [
      { type: "list", items: [
        "**Edge**: anycast/GeoDNS to the nearest region, L4 load balancers spreading connections over gateway nodes, WAF and volumetric DDoS protection before any expensive work.",
        "**Data plane**: stateless proxies running a fixed filter chain: TLS → request ID/trace context → route match → authN → authZ (scopes) → rate limit → transform → load-balance + retry/timeout/circuit-break → response filters → log. Each filter has a strict time budget.",
        "**Control plane**: validates route specs (schema, conflicts, ownership), compiles them into a snapshot and pushes it to data-plane nodes (like Envoy's xDS). It is **not** on the request path — if it is down, gateways keep serving the last good config.",
        "**Service discovery**: provides healthy upstream endpoints; the gateway does client-side load balancing (least-request / P2C) with outlier ejection.",
        "**Identity provider**: issues tokens; the gateway verifies JWTs locally using cached public keys and only calls introspection for opaque tokens (with caching).",
        "**Telemetry**: every request gets a request ID and W3C `traceparent`; RED metrics per route and per consumer.",
      ] },
    ],
  },
  flows: [
    {
      title: "Request path",
      steps: [
        "Client resolves `api.example.com` to the nearest region; L4 LB hands the TCP connection to a gateway node.",
        "Gateway terminates TLS (session resumption for returning clients), assigns a request ID and trace context.",
        "Matches the route in the in-memory radix tree (host + path + method).",
        "Authenticates: verifies the JWT signature with cached JWKS, checks `exp`, `aud`, `iss` and required scopes; or looks up the hashed API key.",
        "Rate limit: one Redis Lua call for the consumer's buckets; 429 if exceeded.",
        "Picks an upstream (weighted canary split, then least-request among healthy endpoints) and forwards over a pooled mTLS connection with a timeout; retries only idempotent requests on connect failures.",
        "Applies response filters (CORS, header removal), emits an access log + metrics, returns.",
      ],
    },
    {
      title: "Config change (safe rollout)",
      steps: [
        "Team submits a route change; control plane validates schema, ownership and conflicts, and runs it against recorded test requests.",
        "A new snapshot is pushed to a canary slice of gateway nodes; error rate and latency for affected routes are compared with the baseline.",
        "If healthy, push to all nodes progressively; otherwise automatic rollback to the previous snapshot.",
        "Nodes apply snapshots atomically (build a new route table, swap the pointer); in-flight requests finish on the old one.",
      ],
    },
  ],
  bottlenecks: [
    "CPU for TLS and crypto — keep-alive, TLS session resumption/0-RTT considerations, ECDSA certificates, verified-token caching.",
    "Shared plugin chain — a slow plugin (e.g. synchronous external auth call) adds latency to every route; enforce budgets and prefer local verification.",
    "Rate-limit Redis — the only shared hot dependency; fail open with local fallback limits.",
    "Connection pools to backends — per-upstream limits so one slow service can't exhaust gateway resources (bulkheads).",
  ],
  failures: [
    { scenario: "Bad config pushed (e.g. a route catching all paths)", mitigation: "Validation + conflict detection, canary rollout with automatic rollback, immutable versioned snapshots and a one-click revert." },
    { scenario: "Control plane down", mitigation: "Data plane keeps serving the last good config; only config changes are blocked. New nodes boot from the last snapshot in object storage." },
    { scenario: "A backend becomes slow", mitigation: "Per-route timeouts, circuit breaker and per-upstream connection/concurrency limits; return 503/504 fast instead of letting requests pile up in the gateway." },
    { scenario: "Identity provider outage", mitigation: "JWTs verify locally with cached JWKS, so existing tokens keep working; only token issuance fails. Cache keys longer than the refresh interval." },
    { scenario: "Retry storm", mitigation: "Retry budgets (e.g. retries ≤ 10% of requests per upstream), only idempotent methods, jittered backoff, and honoring `Retry-After`." },
  ],
  tradeoffs: [
    { decision: "Centralised gateway vs per-service sidecars (service mesh)", options: "One edge gateway for north-south traffic vs sidecar proxies for every service (east-west).", choice: "Both, with different jobs: the edge gateway owns external concerns (public auth, quotas, WAF, API products); a mesh handles internal mTLS, retries and telemetry. Don't put business logic in either." },
    { decision: "Auth at the gateway vs in each service", options: "Gateway verifies identity and coarse scopes vs every service does it all.", choice: "Gateway does authentication and coarse authorisation; fine-grained, resource-level authorisation (can user 42 see order 123?) stays in the owning service." },
    { decision: "Build vs buy", options: "Envoy/Kong/AWS API Gateway vs custom.", choice: "Use a proven proxy (Envoy/NGINX-based) for the data plane; build the control plane workflows (ownership, validation, rollout) that fit your org." },
    { decision: "Response aggregation (BFF) in the gateway?", options: "Gateway composes multiple backend calls vs a dedicated BFF service.", choice: "Keep the gateway thin; aggregation goes in BFF services owned by the client teams, so gateway releases stay low-risk." },
  ],
  walkthrough: [
    { title: "1. Clarify functional requirements", detail: "\"Is this the public edge for external clients, internal service-to-service, or both? I'll design the external edge: routing, TLS, authN, rate limiting, canaries, transformations and self-service config.\"" },
    { title: "2. Non-functional requirements", detail: "\"Every API depends on it, so availability and blast radius dominate: < 5 ms overhead, 99.99%+, fast but safe config propagation.\"" },
    { title: "3. Assumptions", detail: "\"1M req/s peak, 5 KB average exchange, ~20k req/s per node, three AZs.\"" },
    { title: "4. Estimate", detail: "\"50 nodes at peak, 75 to survive an AZ loss; 40 Gbps. TLS handshakes alone could cost ~100 cores at peak, so connection reuse matters. Config is ~10 MB — every node holds all of it.\"" },
    { title: "5. API and data model", detail: "\"Declarative route specs through a control-plane API, stored as versioned snapshots in Postgres + object storage; runtime state is in-memory route trees and Redis buckets.\"" },
    { title: "6. High-level design", detail: "\"Edge LB/WAF → stateless data plane with a filter chain → backends; a separate control plane pushes config; telemetry out to the pipeline.\"" },
    { title: "7. Main flows", detail: "\"Walk a request through the filter chain, then a config change through validation, canary and rollout.\"" },
    { title: "8. Bottlenecks", detail: "\"Crypto CPU, plugin latency, rate-limit Redis, backend connection pools.\"" },
    { title: "9. Component choices", detail: "\"Envoy-style proxies with xDS for dynamic config, local JWT verification, Redis token buckets.\"" },
    { title: "10. Scaling, consistency, failure", detail: "\"Data plane scales linearly. Config is eventually consistent across nodes but versioned; control-plane outages don't affect traffic. Circuit breakers and retry budgets protect backends.\"" },
    { title: "11. Security, observability, ops", detail: "\"Strip spoofable headers, mTLS to backends, WAF, secrets in a vault, audit log of config changes. Golden signals per route and per consumer; trace propagation.\"" },
    { title: "12. Trade-offs", detail: "\"Thin gateway vs smart gateway, gateway vs mesh responsibilities, build vs buy.\"" },
  ],
  followUps: [
    { q: "How do you avoid the gateway becoming a single point of failure?", a: "It's a fleet, not a box: stateless nodes across AZs behind L4 LBs, anycast/GeoDNS across regions, capacity for an AZ loss, no request-path dependency on the control plane, and fail-open policies for non-security dependencies like rate limiting." },
    { q: "How do canary releases work through the gateway?", a: "Weighted routing between upstream subsets (95/5), optionally sticky by user ID hash so a user consistently sees one version, with automated analysis of error rate/latency per subset and rollback." },
    { q: "Where should request validation happen?", a: "Cheap structural checks (size limits, content type, schema validation for public APIs via OpenAPI) at the gateway to reject junk early; business validation in the service." },
    { q: "How do you support long-lived connections (WebSockets, gRPC streams)?", a: "The gateway must support HTTP upgrade and HTTP/2 streams, with separate timeouts, connection draining on deploys (stop accepting, let streams finish or migrate) and per-node connection limits." },
    { q: "How do you handle API versioning at the gateway?", a: "Route by path prefix (`/v2`) or header (`Accept-Version`) to different upstream subsets; deprecate with `Deprecation`/`Sunset` headers and per-consumer usage metrics to know who still calls the old version." },
  ],
  related: [
    "system-design/load-balancing-algorithms",
    "system-design/rate-limiting",
    "system-design/authn-authz",
    "system-design/circuit-breakers-timeouts-retries",
    "system-design/service-discovery",
    "system-design/deployment-strategies",
    "system-design/api-versioning",
    "system-design/distributed-tracing",
    "networks/tls-handshake",
    "backend/authentication-jwt-sessions",
  ],
};

// ---------------------------------------------------------------------------
// 11. Webhook delivery
// ---------------------------------------------------------------------------
const webhookDelivery: DesignExercise = {
  slug: "webhook-delivery",
  title: "Webhook delivery platform (Stripe / GitHub style)",
  level: "advanced",
  summary:
    "Reliably deliver events to thousands of customer-owned HTTP endpoints you don't control. Covers HMAC signatures with timestamps, retries with exponential backoff and jitter, DLQs and replay, per-endpoint isolation against slow receivers, idempotency and SSRF-safe egress.",
  minutes: 90,
  status: "authored",
  functional: [
    "Customers register endpoints (URL + subscribed event types) and get a signing secret.",
    "Every matching event is POSTed to each subscribed endpoint with a signature.",
    "Retry failed deliveries with exponential backoff for ~3 days; then mark as failed and notify the customer.",
    "Delivery log per endpoint (attempts, status codes, latency) and manual/bulk replay.",
    "Auto-disable endpoints that fail persistently; secret rotation without downtime.",
  ],
  nonFunctional: [
    "At-least-once delivery: no event silently lost once accepted.",
    "Isolation: one slow or broken customer endpoint must not delay others.",
    "First-attempt latency p99 < 5 s from event creation for healthy endpoints.",
    "Receivers can verify authenticity and reject replays.",
    "Security: never let customers use webhooks to reach our internal network (SSRF).",
  ],
  assumptions: [
    "500M events/day; each matches on average 2 endpoints → 1B deliveries/day.",
    "Peak = 5× average.",
    "Average payload 2 KB; delivery attempt log row ≈ 200 B.",
    "Healthy endpoint latency ~300 ms; request timeout 10 s.",
    "~5% of first attempts fail; failed deliveries take ~3 extra attempts on average.",
    "Events and attempt logs retained 30 days. ~1M registered endpoints.",
  ],
  estimation: [
    {
      type: "table",
      head: ["Quantity", "Arithmetic", "Result"],
      rows: [
        ["Deliveries per day", "500M × 2", "1B/day"],
        ["Delivery rate (avg / peak)", "1,000,000,000 ÷ 86,400 ≈ 11,600; × 5", "≈ 11.6k/s avg, ≈ 58k/s peak"],
        ["In-flight requests (Little's law)", "11.6k/s × 0.3 s; 58k/s × 0.3 s", "≈ 3.5k avg, ≈ 17.4k peak concurrent HTTP calls"],
        ["One slow endpoint", "500 events/s × 10 s timeout", "5,000 concurrent connections for a single customer — why isolation is needed"],
        ["Retry attempts per day", "1B × 5% × 3", "≈ 150M/day"],
        ["Event storage (30 days)", "500M × 2 KB × 30", "1 TB/day → 30 TB"],
        ["Attempt log (30 days)", "(1B + 150M) × 200 B × 30", "230 GB/day → ≈ 6.9 TB"],
        ["Egress bandwidth (peak)", "58k × 2 KB", "≈ 116 MB/s ≈ 0.93 Gbps"],
      ],
    },
    { type: "callout", tone: "tip", title: "What the numbers tell you", text: "Throughput is moderate. The defining risk is **receivers you don't control**: a few slow endpoints can consume all connection slots (17k healthy in-flight vs 5k for one bad endpoint). So the design centres on **per-endpoint queues and concurrency limits**, not raw scale." },
  ],
  api: [
    {
      type: "code",
      lang: "http",
      caption: "What a receiver gets",
      code: `POST /hooks/payments HTTP/1.1
Host: customer.example.com
Content-Type: application/json
User-Agent: ExampleWebhooks/1.0
Webhook-Id: evt_01JACF3N8Z4KQ
Webhook-Timestamp: 1728122400
Webhook-Signature: v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd

{ "id": "evt_01JACF3N8Z4KQ", "type": "payment.succeeded", "created": 1728122399,
  "data": { "payment_id": "pay_771", "amount": 4999, "currency": "INR" } }

# Any 2xx within 10 s = delivered. 3xx/4xx/5xx/timeout = failed attempt (410 Gone may disable the endpoint).`,
    },
    {
      type: "code",
      lang: "http",
      caption: "Management API",
      code: `POST /v1/webhook_endpoints   { "url": "https://customer.example.com/hooks/payments", "events": ["payment.*"] }
-> 201 { "id": "we_42", "secret": "whsec_...shown once..." }
POST /v1/webhook_endpoints/we_42/rotate_secret   { "grace_period_hours": 24 }
GET  /v1/webhook_endpoints/we_42/deliveries?status=failed&cursor=...
POST /v1/events/evt_01JACF3N8Z4KQ/redeliver      { "endpoint_id": "we_42" }
POST /v1/webhook_endpoints/we_42/replay          { "from": "2026-10-04T00:00:00Z", "to": "2026-10-05T00:00:00Z" }`,
    },
    {
      type: "code",
      lang: "ts",
      caption: "Receiver-side verification (Node.js). Sign over the RAW body bytes, not re-serialised JSON.",
      code: `import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyWebhook(rawBody: Buffer, headers: Record<string, string>, secret: string): boolean {
  const ts = Number(headers["webhook-timestamp"]);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false; // replay window: 5 min

  const signed = Buffer.concat([Buffer.from(headers["webhook-id"] + "." + ts + "."), rawBody]);
  const expected = createHmac("sha256", secret).update(signed).digest("hex");

  // During secret rotation the header may carry several signatures: "v1=abc v1=def"
  return headers["webhook-signature"].split(" ").some((part) => {
    const sig = part.replace(/^v1=/, "");
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b); // constant-time compare
  });
}`,
    },
    { type: "callout", tone: "note", title: "Why the timestamp is inside the signature", text: "HMAC proves the payload came from us and wasn't modified. Including the timestamp (and event ID) in the signed string means an attacker who captured a request can't replay it later: changing the timestamp breaks the signature, and an old timestamp is rejected by the 5-minute window. Receivers should still dedupe by `Webhook-Id`, because *we* legitimately retry." },
  ],
  dataModel: [
    {
      type: "code",
      lang: "sql",
      caption: "Tables",
      code: `-- Subscriptions (Postgres; small, read-mostly, cached in dispatchers)
CREATE TABLE endpoints (
  endpoint_id     text PRIMARY KEY,
  account_id      text NOT NULL,
  url             text NOT NULL,
  event_types     text[] NOT NULL,
  secrets         jsonb NOT NULL,      -- [{ "id": 2, "secret_enc": "...", "expires_at": null }, { "id": 1, ... }]
  status          text NOT NULL,       -- active | disabled | paused
  max_concurrency int NOT NULL DEFAULT 20,
  consecutive_failures int NOT NULL DEFAULT 0
);
CREATE INDEX endpoints_account_idx ON endpoints (account_id);

-- Events: written once, referenced by every delivery (wide-column or partitioned SQL)
CREATE TABLE events (
  event_id     text PRIMARY KEY,
  account_id   text,
  type         text,
  payload      bytea,                  -- the exact bytes that get signed
  created_at   timestamptz
);

-- One row per (event, endpoint); partitioned by endpoint for the delivery log UI
CREATE TABLE deliveries (
  endpoint_id   text,
  event_id      text,
  status        text,                  -- pending | succeeded | retrying | failed
  attempts      int,
  next_attempt_at timestamptz,
  last_status_code int,
  last_error    text,
  PRIMARY KEY (endpoint_id, event_id)
);
CREATE INDEX deliveries_due_idx ON deliveries (next_attempt_at) WHERE status = 'retrying';`,
    },
    {
      type: "table",
      head: ["Decision", "Why"],
      rows: [
        ["Store the event once, deliveries reference it", "Fan-out to N endpoints doesn't copy payloads; replay re-sends the same bytes."],
        ["`deliveries` primary key (endpoint_id, event_id)", "Natural idempotency: a duplicated dispatch upserts the same row instead of creating a second delivery."],
        ["Secrets encrypted at rest (KMS), multiple active", "Rotation: sign with both old and new during the grace period."],
        ["Per-endpoint queue (logical)", "Isolation and per-endpoint concurrency limits; implemented as partitions/virtual queues, not millions of physical queues."],
      ],
    },
  ],
  architecture: {
    nodes: [
      { id: "producers", label: "Internal services (event sources)", kind: "client" },
      { id: "ingest", label: "Event ingest API", kind: "service" },
      { id: "events", label: "Event store", kind: "data" },
      { id: "bus", label: "Kafka: events", kind: "queue" },
      { id: "dispatcher", label: "Dispatcher (match subscriptions)", kind: "service" },
      { id: "subs", label: "Endpoint/subscription DB + cache", kind: "data" },
      { id: "epq", label: "Per-endpoint delivery queues", kind: "queue" },
      { id: "workers", label: "Delivery workers", kind: "service" },
      { id: "egress", label: "Egress proxy (SSRF guard)", kind: "edge" },
      { id: "receivers", label: "Customer endpoints", kind: "external" },
      { id: "retry", label: "Retry scheduler", kind: "service" },
      { id: "dlq", label: "Failed deliveries (DLQ)", kind: "queue" },
    ],
    edges: [
      { from: "producers", to: "ingest", label: "emit event (outbox)" },
      { from: "ingest", to: "events", label: "persist payload" },
      { from: "ingest", to: "bus", label: "publish event_id" },
      { from: "bus", to: "dispatcher", label: "consume" },
      { from: "dispatcher", to: "subs", label: "who subscribes?" },
      { from: "dispatcher", to: "epq", label: "one task per endpoint" },
      { from: "epq", to: "workers", label: "fair scheduling" },
      { from: "workers", to: "egress", label: "signed POST" },
      { from: "egress", to: "receivers", label: "HTTPS" },
      { from: "workers", to: "retry", label: "failed attempt" },
      { from: "retry", to: "epq", label: "re-enqueue when due" },
      { from: "workers", to: "dlq", label: "attempts exhausted" },
    ],
    notes: [
      { type: "list", items: [
        "**Ingest**: producers write events via a transactional outbox so an event exists if and only if the business change committed. Payload is stored once; the bus carries the ID.",
        "**Dispatcher**: matches event type + account against cached subscriptions and creates one delivery task per endpoint (upsert keyed by (endpoint, event) for idempotency).",
        "**Per-endpoint queues**: tasks are grouped by endpoint (e.g. Kafka partitioned by endpoint hash + in-worker virtual queues, or Redis streams per endpoint). Workers schedule fairly across endpoints (round-robin / weighted fair queueing) and enforce `max_concurrency` per endpoint.",
        "**Delivery workers**: load payload, sign with HMAC-SHA256 (all active secrets), POST with connect timeout ~3 s and total timeout 10 s, record the attempt. Non-blocking I/O so thousands of in-flight calls per worker are cheap.",
        "**Egress proxy**: resolves DNS itself, blocks private/link-local/metadata ranges (10/8, 172.16/12, 192.168/16, 127/8, 169.254/16, IPv6 equivalents), pins the resolved IP for the connection (defeats DNS rebinding), fixed egress IPs customers can allow-list.",
        "**Retry scheduler**: time-ordered index of `next_attempt_at`; releases due deliveries back into their endpoint queue.",
        "**DLQ**: deliveries that exhausted retries; visible in the dashboard, replayable, and the customer is emailed.",
      ] },
    ],
  },
  flows: [
    {
      title: "Happy path",
      steps: [
        "Payments service commits a payment and an outbox row in one transaction; a relay publishes `payment.succeeded` to ingest.",
        "Ingest stores the payload under `event_id` and publishes the ID to Kafka.",
        "Dispatcher finds 2 subscribed endpoints and upserts 2 delivery rows + tasks into their endpoint queues.",
        "A worker takes the task (respecting the endpoint's concurrency limit), builds `id.timestamp.body`, computes HMAC-SHA256 with the endpoint secret, sends via the egress proxy.",
        "Receiver verifies the signature and timestamp, dedupes on `Webhook-Id`, enqueues its own processing and returns 200 quickly.",
        "Worker marks the delivery succeeded and resets the endpoint's failure counter.",
      ],
    },
    {
      title: "Failure, retry and DLQ",
      steps: [
        "Receiver returns 503 or times out → attempt recorded, `attempts += 1`.",
        "`next_attempt_at = now + min(30 s × 2^attempts, 12 h)` with ±20% jitter → e.g. 1 min, 2 min, 4 min, ... capped at 12 h. The 1 initial attempt + 15 retries span 30 s × (2 + 4 + … + 1,024) ≈ 17 h plus 5 × 12 h = 60 h, i.e. ≈ 77 h ≈ 3.2 days.",
        "Retry scheduler re-enqueues it when due; the event payload and ID are unchanged (receivers dedupe).",
        "After the last attempt → status failed, task to the DLQ, customer notified. After N days of consecutive failures the endpoint is auto-disabled.",
        "When the customer fixes their endpoint they replay failed deliveries (bulk replay is rate-limited per endpoint).",
      ],
    },
    {
      title: "Slow endpoint isolation",
      steps: [
        "Endpoint A starts taking 10 s per request; its in-flight count hits `max_concurrency = 20`.",
        "Further tasks for A wait in A's queue — workers skip A and serve other endpoints, so their latency is unaffected.",
        "A circuit breaker opens for A after repeated timeouts: deliveries are deferred to the retry schedule instead of hammering a struggling server.",
        "A's backlog drains at its own pace once it recovers.",
      ],
    },
  ],
  bottlenecks: [
    "Head-of-line blocking — a shared FIFO would let one slow endpoint stall everyone; per-endpoint queues + concurrency caps + fair scheduling.",
    "Connection slots — non-blocking HTTP clients and connection reuse per endpoint (keep-alive) instead of a thread per request.",
    "Replay storms — a customer replaying a day of events; rate-limit replays per endpoint and run them on a separate lower-priority lane.",
    "Hot accounts — huge accounts with many endpoints/events get dedicated partitions or worker pools.",
  ],
  failures: [
    { scenario: "Worker crashes after the receiver returned 200 but before recording success", mitigation: "Task lease expires → delivery retried → receiver sees the same `Webhook-Id` again and dedupes. This is the at-least-once contract, documented for customers." },
    { scenario: "Customer endpoint down for 2 days", mitigation: "Retries with backoff continue (≈ 3.2 days); circuit breaker prevents hammering; then DLQ + email; auto-disable after persistent failure; replay once fixed." },
    { scenario: "Dispatcher processes the same event twice", mitigation: "Delivery rows are upserted on (endpoint_id, event_id); a duplicate dispatch is a no-op." },
    { scenario: "SSRF attempt: endpoint URL resolves to 169.254.169.254 or an internal service", mitigation: "Egress proxy validates the resolved IP on every connection, blocks private ranges and redirects to them, and runs in an isolated network segment with no route to internal services." },
    { scenario: "Signing secret leaked by a customer", mitigation: "Rotate secret: new secret active immediately, old one still signs for a grace period (both signatures sent), then expires." },
  ],
  tradeoffs: [
    { decision: "Ordering guarantees", options: "Strict per-endpoint ordering vs unordered delivery.", choice: "Unordered (with `created` timestamps and object versions in payloads). Strict ordering means one failing event blocks all later ones for that endpoint for up to 3 days. Recommend receivers fetch the latest object state if order matters." },
    { decision: "Thin vs fat payloads", options: "Full object in the payload vs just IDs ('something changed, fetch it').", choice: "Full payload for convenience, with an API to fetch current state. Thin events are safer for very sensitive data and avoid stale-data issues, at the cost of an extra API call per event." },
    { decision: "Queue per endpoint", options: "Millions of physical queues vs shared partitions with virtual per-endpoint queues.", choice: "Virtual queues: partition by hash(endpoint_id), and inside each worker keep per-endpoint sub-queues with concurrency tokens. Physical queues per endpoint don't scale operationally." },
    { decision: "Signature scheme", options: "HMAC shared secret vs asymmetric signatures (Ed25519) vs mTLS.", choice: "HMAC-SHA256 is simple and universally supported. Asymmetric signatures let receivers verify with a public key (no shared secret to leak) — worth offering for high-security customers." },
  ],
  walkthrough: [
    { title: "1. Clarify functional requirements", detail: "\"Customers register URLs and event types, we POST signed events, retry for days, show a delivery log, allow replay, rotate secrets, disable dead endpoints.\"" },
    { title: "2. Non-functional requirements", detail: "\"At-least-once, isolation between customers, authenticity and replay protection, and SSRF safety because customers choose the URL.\"" },
    { title: "3. Assumptions", detail: "\"500M events/day, 2 endpoints each, 5× peaks, 300 ms healthy latency, 10 s timeout, 5% first-attempt failures.\"" },
    { title: "4. Estimate", detail: "\"1B deliveries/day → ~11.6k/s, ~58k/s peak; Little's law gives ~17k in-flight calls at peak, while a single endpoint at 500/s with 10 s timeouts would hold 5k — so isolation is the key design driver. 30 TB of events for 30 days.\"" },
    { title: "5. API and data model", detail: "\"Signed POST with Webhook-Id, Timestamp and Signature over id.timestamp.body; management APIs for endpoints, secrets, delivery logs and replay. Events stored once; deliveries keyed by (endpoint, event).\"" },
    { title: "6. High-level design", detail: "\"Outbox → ingest → Kafka → dispatcher → per-endpoint queues → workers → egress proxy → customers, with a retry scheduler and a DLQ.\"" },
    { title: "7. Main flows", detail: "\"Happy path; failure with exponential backoff and jitter to DLQ; slow-endpoint isolation.\"" },
    { title: "8. Bottlenecks", detail: "\"Head-of-line blocking, connection slots, replay storms, hot accounts.\"" },
    { title: "9. Component choices", detail: "\"Kafka for the event stream, virtual per-endpoint queues with concurrency tokens, a time-indexed retry store, non-blocking HTTP clients, a dedicated egress proxy.\"" },
    { title: "10. Scaling, consistency, failure", detail: "\"Everything is idempotent by (endpoint, event); at-least-once with receiver dedupe. Circuit breakers per endpoint; auto-disable.\"" },
    { title: "11. Security, observability, ops", detail: "\"HMAC with timestamp, constant-time compare, secret rotation with dual signatures, SSRF protection, static egress IPs. Metrics: success rate and latency per endpoint, retry queue size, DLQ rate, time-to-first-attempt.\"" },
    { title: "12. Trade-offs", detail: "\"No ordering guarantee, fat vs thin payloads, virtual vs physical queues, HMAC vs asymmetric signatures.\"" },
  ],
  followUps: [
    { q: "Why add jitter to the backoff?", a: "When a big receiver recovers from an outage, every delivery that failed at the same moment would retry at exactly the same moments, producing synchronised waves that knock it over again. Random jitter spreads retries out." },
    { q: "How should a receiver process webhooks correctly?", a: "Verify the signature on the raw body, check the timestamp window, dedupe on the event ID (unique constraint), enqueue the work and return 2xx fast — don't do slow processing inside the request, or our 10 s timeout will cause retries and duplicates." },
    { q: "How do you rotate a signing secret without downtime?", a: "Generate a new secret while keeping the old one valid for a grace period; sign each request with both and send both signatures in the header. Receivers accept any valid signature, switch to the new secret at their pace, then the old one expires." },
    { q: "How do you guarantee an event is emitted exactly when the business change commits?", a: "Transactional outbox: write the event row in the same database transaction as the change; a relay reads the outbox (polling or CDC) and publishes. Publishing directly after commit can lose events if the process crashes in between." },
    { q: "Why not let customers choose any port or follow redirects?", a: "Arbitrary ports and redirects widen the SSRF surface (redirect to an internal IP after the initial check). Allow only 443/80 (or a small list), don't follow redirects (or re-validate each hop), and enforce HTTPS for production endpoints." },
  ],
  related: [
    "system-design/delivery-semantics",
    "system-design/api-idempotency",
    "system-design/circuit-breakers-timeouts-retries",
    "system-design/bulkheads",
    "system-design/async-processing",
    "system-design/backpressure",
    "system-design/authn-authz",
    "backend/webhooks-dlq",
    "distributed/idempotency-patterns",
    "distributed/event-driven-architecture",
  ],
};

// ---------------------------------------------------------------------------
// 12. Real-time analytics
// ---------------------------------------------------------------------------
const realtimeAnalytics: DesignExercise = {
  slug: "realtime-analytics",
  title: "Real-time analytics pipeline (product / ad analytics dashboards)",
  level: "expert",
  summary:
    "Ingest millions of events per second and answer dashboard queries over fresh data in under a second. Covers collectors, Kafka partitioning, stream processing with event-time windows, watermarks and late events, exactly-once aggregation, approximate distinct counts, OLAP stores and lambda vs kappa.",
  minutes: 120,
  status: "authored",
  functional: [
    "Collect events (page views, clicks, purchases, ad impressions) from web/mobile SDKs and servers for many tenants.",
    "Dashboards: counts, sums and unique users over time (minute granularity), filtered and grouped by dimensions (country, device, campaign, event type).",
    "Top-N queries (top pages, top campaigns) and simple funnels over the last 24 hours to 90 days.",
    "Data visible on dashboards within ~10 s of the event.",
    "Raw events available for ad-hoc analysis and reprocessing.",
  ],
  nonFunctional: [
    "Ingest 3M events/s at peak without dropping data; collectors highly available.",
    "Dashboard queries p95 < 1 s.",
    "Correct aggregates despite duplicates (client retries) and late/out-of-order events (offline mobile devices).",
    "Exactly-once *effect* on aggregates; at-least-once transport.",
    "Multi-tenant isolation: one huge tenant must not slow down others.",
    "Cost-efficient storage over a year of history.",
  ],
  assumptions: [
    "1M events/s average, 3M events/s peak.",
    "Average event 500 B (JSON) before compression; columnar compression ≈ 10×.",
    "Kafka partition budget ≈ 10 MB/s per partition (conservative).",
    "Distinct (tenant, minute, dimension-combination) rollup rows ≈ 1M per minute; rollup row ≈ 100 B.",
    "Dashboard query load ≈ 5k queries/s at peak.",
    "Raw events retained 1 year in the lake; Kafka retention 3 days.",
    "Event-time skew: 99% of events arrive within 2 minutes; mobile offline batches can be days late.",
  ],
  estimation: [
    {
      type: "table",
      head: ["Quantity", "Arithmetic", "Result"],
      rows: [
        ["Ingest bandwidth (avg / peak)", "1M × 500 B; 3M × 500 B", "500 MB/s avg; 1.5 GB/s ≈ 12 Gbps peak"],
        ["Events per day", "1M × 86,400", "86.4B/day"],
        ["Raw bytes per day", "86.4B × 500 B", "43.2 TB/day uncompressed"],
        ["Lake storage per year (columnar)", "43.2 TB ÷ 10 × 365", "≈ 4.3 TB/day → ≈ 1.58 PB/year"],
        ["Kafka partitions", "1.5 GB/s ÷ 10 MB/s", "150 minimum → provision 256 for headroom and growth"],
        ["Kafka retention (3 days)", "43.2 TB × 3 = 130 TB; × RF 3; ÷ ~4× producer compression", "≈ 100 TB of broker disk"],
        ["Rollup rows per day", "1M per minute × 1,440", "1.44B rows × 100 B ≈ 144 GB/day (re-rolled to hourly after 7 days)"],
        ["HyperLogLog sketch (2^14 registers × 6 bits)", "16,384 × 6 ÷ 8", "≈ 12 KB, standard error 1.04 ÷ √16,384 ≈ 0.81%"],
      ],
    },
    { type: "callout", tone: "tip", title: "What the numbers tell you", text: "You cannot query 86B raw events/day interactively. The design must **pre-aggregate in the stream** into compact rollups (144 GB/day instead of 43 TB/day) and keep raw data in cheap columnar storage for drill-down and reprocessing. Exact distinct counts are too expensive at this scale, so unique users use **sketches (HLL)**." },
  ],
  api: [
    {
      type: "code",
      lang: "http",
      caption: "Collection (batched, from SDKs)",
      code: `POST /v1/collect HTTP/1.1
Host: collect.example.com
Content-Type: application/json
Content-Encoding: gzip
X-Write-Key: wk_tenant_42

{ "batch": [
  { "event_id": "0f8b7c1e-3a8d-4a52-9c1b-6f0e2f6d2a11", "type": "page_view",
    "ts": "2026-10-05T10:00:01.234Z", "anonymous_id": "a_77", "user_id": null,
    "props": { "path": "/pricing", "referrer": "google" },
    "context": { "device": "mobile", "os": "android", "app_version": "5.2.0" } }
] }

HTTP/1.1 202 Accepted       # only after the batch is acknowledged by Kafka (acks=all)`,
    },
    {
      type: "code",
      lang: "http",
      caption: "Query (dashboards)",
      code: `POST /v1/query HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{ "tenant": "t_42", "metrics": ["count", "unique_users"],
  "filter": { "type": "page_view", "country": ["IN", "US"] },
  "group_by": ["device"], "granularity": "minute",
  "from": "2026-10-05T09:00:00Z", "to": "2026-10-05T10:00:00Z" }

HTTP/1.1 200 OK
{ "rows": [ { "t": "2026-10-05T09:00:00Z", "device": "mobile", "count": 18233, "unique_users": 9120 } ],
  "freshness_s": 6, "approximate": ["unique_users"] }`,
    },
    { type: "callout", tone: "note", text: "The client-generated `event_id` is what makes deduplication possible when an SDK retries a batch after a timeout. The server adds `received_at`, so every event carries both **event time** (when it happened) and **processing/ingest time** (when we saw it)." },
  ],
  dataModel: [
    {
      type: "code",
      lang: "sql",
      caption: "OLAP rollup table (ClickHouse-style) and raw lake table",
      code: `-- Minute rollups, written by the stream job (upserts are idempotent per key)
CREATE TABLE rollup_minute (
  tenant_id     UInt32,
  minute        DateTime,
  event_type    LowCardinality(String),
  country       LowCardinality(String),
  device        LowCardinality(String),
  campaign_id   UInt64,
  events        UInt64,
  revenue       Decimal(18, 4),
  users_hll     AggregateFunction(uniqHLL12, String)  -- mergeable sketch
)
ENGINE = ReplacingMergeTree            -- later versions of the same key replace earlier ones
PARTITION BY toYYYYMMDD(minute)
ORDER BY (tenant_id, minute, event_type, country, device, campaign_id);

-- Raw events in the lake (Iceberg/Parquet on object storage)
-- partitioned by (event_date, tenant_bucket); sorted by (tenant_id, event_time)
CREATE TABLE raw_events (
  event_id     string,
  tenant_id    int,
  type         string,
  event_time   timestamp,
  received_at  timestamp,
  user_key     string,
  props        map<string, string>
) PARTITIONED BY (days(event_time), bucket(64, tenant_id));`,
    },
    {
      type: "table",
      head: ["Choice", "Why"],
      rows: [
        ["Kafka partition key = hash(tenant_id, user_key)", "Spreads load evenly while keeping one user's events in order on one partition (useful for sessions/funnels)."],
        ["OLAP sort key starts with `tenant_id, minute`", "Every dashboard query filters by tenant and time range; data skipping prunes almost everything else."],
        ["Daily partitions", "Cheap retention (drop whole partitions) and re-rollup of old days to hourly."],
        ["Mergeable aggregates (sums, HLL sketches)", "Minute rows can be merged into hours/days and across late-arriving updates without rescanning raw data. Note: you cannot add distinct counts — you must merge sketches."],
      ],
    },
  ],
  architecture: {
    nodes: [
      { id: "sdk", label: "Web / mobile / server SDKs", kind: "client" },
      { id: "collector", label: "Collectors (edge, stateless)", kind: "edge" },
      { id: "kafka", label: "Kafka: raw events (256 partitions)", kind: "queue" },
      { id: "stream", label: "Stream processor (Flink)", kind: "service" },
      { id: "olap", label: "OLAP store (ClickHouse / Druid / Pinot)", kind: "data" },
      { id: "lake", label: "Data lake (Parquet / Iceberg)", kind: "data" },
      { id: "batch", label: "Batch jobs (backfill, late data, compaction)", kind: "service" },
      { id: "query", label: "Query service", kind: "service" },
      { id: "qcache", label: "Query result cache", kind: "cache" },
      { id: "dash", label: "Dashboards", kind: "client" },
    ],
    edges: [
      { from: "sdk", to: "collector", label: "batched HTTPS" },
      { from: "collector", to: "kafka", label: "produce (acks=all)" },
      { from: "kafka", to: "stream", label: "consume" },
      { from: "stream", to: "olap", label: "minute rollups (idempotent upsert)" },
      { from: "kafka", to: "lake", label: "raw sink (connector)" },
      { from: "stream", to: "lake", label: "too-late events side output" },
      { from: "lake", to: "batch", label: "read" },
      { from: "batch", to: "olap", label: "corrections / backfills" },
      { from: "dash", to: "query", label: "POST /v1/query" },
      { from: "query", to: "qcache", label: "lookup" },
      { from: "query", to: "olap", label: "SQL" },
    ],
    notes: [
      { type: "list", items: [
        "**Collectors**: stateless HTTP servers at the edge; authenticate the write key, validate schema/size, enrich minimally (received_at, geo from IP), produce to Kafka and only then return 202. Per-tenant ingest quotas protect the pipeline.",
        "**Kafka**: the durable buffer and replayable source of truth for the last 3 days. Absorbs downstream slowness (backpressure) and lets new consumers start from any offset.",
        "**Stream processor (Flink)**: dedupes by `event_id` (keyed state with a TTL), assigns event-time timestamps and watermarks, aggregates into 1-minute tumbling windows per (tenant, dims), maintains HLL sketches, emits rollups. Checkpoints state + Kafka offsets together for exactly-once state.",
        "**OLAP store**: columnar, time-partitioned, sorted by tenant/time; serves group-by/filter queries over rollups in milliseconds to a second.",
        "**Data lake**: all raw events in Parquet (Iceberg tables) for drill-down via Trino/Spark, reprocessing and training data.",
        "**Batch jobs**: fold in events that arrived after allowed lateness, rebuild rollups after logic changes (replay), compact minute rollups into hourly ones.",
        "**Query service**: tenant-aware query building, caching of results for closed time ranges, per-tenant concurrency limits.",
      ] },
    ],
  },
  flows: [
    {
      title: "Ingest → rollup (the hot path)",
      steps: [
        "SDK batches events (e.g. every 5 s or 50 events), gzips and POSTs; retries with the same event_ids on failure.",
        "Collector validates, adds `received_at` and geo, produces to Kafka keyed by hash(tenant, user); returns 202 after the broker ack.",
        "Flink reads the partition, drops duplicates whose `event_id` was seen in the last hour (keyed state with TTL).",
        "Watermark = max event time seen − 2 min (bounded out-of-orderness). Events go into 1-minute tumbling windows by **event time**.",
        "When the watermark passes the window end, Flink emits the window's aggregates (counts, sums, HLL) as an upsert keyed by (tenant, minute, dims).",
        "Dashboards see the minute ~2 min after it closes; an 'in-progress' current-minute estimate can be shown from early-firing triggers every 10 s.",
      ],
    },
    {
      title: "Late and out-of-order events",
      steps: [
        "Event arrives after its window fired but within allowed lateness (e.g. 1 h): Flink updates the window state and re-emits the row; the OLAP upsert replaces the old version.",
        "Event arrives after allowed lateness (e.g. a phone offline for 2 days): routed to a side output → lake.",
        "Hourly/nightly batch job recomputes affected (tenant, minute) rollups from the lake and upserts corrections.",
        "Dashboards mark recent periods as 'may still change' until the correction horizon passes.",
      ],
    },
    {
      title: "Dashboard query",
      steps: [
        "Query service validates tenant access and rewrites the request into SQL on `rollup_minute` (or hourly rollups for long ranges).",
        "Results for fully closed time buckets are cached; only the most recent buckets are re-queried each refresh.",
        "OLAP prunes by partition (date) and sort key (tenant, minute), aggregates, merges HLL sketches for unique users.",
        "Response includes freshness and which metrics are approximate.",
      ],
    },
  ],
  bottlenecks: [
    "Skewed keys — one giant tenant or a viral campaign concentrates state on one Flink subtask; use two-phase aggregation (pre-aggregate on a salted key, then merge) and keep partitioning by (tenant, user) rather than tenant alone.",
    "Stateful dedup memory — 1h of event IDs at 3M/s is ~10.8B IDs; use RocksDB-backed state, shorter dedup windows, or per-partition Bloom filters (accepting a tiny false-drop rate).",
    "High-cardinality dimensions (user_id, URL with query strings) explode rollup rows — restrict rollup dimensions; serve high-cardinality drill-downs from raw data.",
    "OLAP query concurrency — per-tenant limits, result caching, materialised hourly/daily rollups for long ranges.",
  ],
  failures: [
    { scenario: "Flink task manager crashes", mitigation: "Restart from the last checkpoint (state + Kafka offsets are consistent). Events after the checkpoint are re-read; rollup writes are idempotent upserts by key (or transactional), so nothing is double-counted." },
    { scenario: "OLAP cluster slow or down", mitigation: "Kafka buffers; Flink applies backpressure or its sink retries. Dashboards show stale data with a freshness banner. Catch-up after recovery is bounded by Kafka retention (3 days)." },
    { scenario: "Bug in aggregation logic shipped", mitigation: "Kappa-style reprocessing: deploy the fixed job as a new consumer group reading from the lake/Kafka start point into a new table version, verify, then switch the query service atomically." },
    { scenario: "Collector region outage", mitigation: "Anycast/GeoDNS failover to other regions; SDKs buffer on device and retry with backoff. Duplicates from retries are removed by event_id." },
    { scenario: "Tenant floods events (bug or attack)", mitigation: "Per-tenant ingest quotas at collectors (429 + SDK backoff), separate Kafka topics or priority lanes for the largest tenants." },
  ],
  tradeoffs: [
    { decision: "Lambda vs kappa architecture", options: "Lambda: a batch layer recomputes accurate results from raw data and a speed layer gives fresh approximate results; queries merge both — two codebases computing the same metric. Kappa: one streaming pipeline; reprocessing = replaying the log through the same code.", choice: "Kappa as the primary model (one codebase, Flink can run the same job in batch mode over the lake), plus a narrow batch correction job for events beyond allowed lateness. Pure lambda's duplicated logic tends to drift." },
    { decision: "Event time vs processing time windows", options: "Processing time: simple, no waiting, but a delayed batch is counted in the wrong minute. Event time: correct attribution, requires watermarks and late-data handling.", choice: "Event time with a 2-minute bounded-out-of-orderness watermark and 1-hour allowed lateness; trades a little freshness for correct numbers." },
    { decision: "Exact vs approximate distinct counts", options: "Exact sets of user IDs per bucket (huge, not mergeable cheaply) vs HyperLogLog sketches (~12 KB, ~0.8% error, mergeable).", choice: "HLL for dashboards, labelled approximate; exact counts available via batch queries on the lake when needed (billing)." },
    { decision: "Pre-aggregate vs query raw", options: "Rollups at ingest (fast, fixed dimensions) vs storing raw events in the OLAP store and aggregating at query time (flexible, expensive).", choice: "Rollups for the standard dashboards, raw columnar data for ad-hoc drill-downs — most products end up with both." },
  ],
  walkthrough: [
    { title: "1. Clarify functional requirements", detail: "\"Which metrics and dimensions? Is it per-tenant? How fresh, how far back, and do we need raw drill-down? I'll assume multi-tenant dashboards of counts, sums, uniques and top-N, 10 s freshness, 90 days of dashboards and a year of raw data.\"" },
    { title: "2. Non-functional requirements", detail: "\"Never drop accepted events, sub-second dashboard queries, correct numbers despite retries and late mobile events, tenant isolation, and cost control.\"" },
    { title: "3. Assumptions", detail: "\"1M events/s average, 3M peak, 500 B each, 10× columnar compression, 99% of events within 2 minutes but some days late.\"" },
    { title: "4. Estimate", detail: "\"1.5 GB/s peak ingest → at least 150 Kafka partitions, I'd use 256. 43 TB/day raw → ~4.3 TB/day compressed → ~1.6 PB/year in the lake. Minute rollups ~144 GB/day. HLL sketches are 12 KB at 0.81% error.\"" },
    { title: "5. API and data model", detail: "\"Batched collect endpoint with client event_ids; a query API over rollups. Rollup table ordered by tenant and minute with mergeable aggregates; raw Iceberg table partitioned by day and tenant bucket.\"" },
    { title: "6. High-level design", detail: "\"SDKs → collectors → Kafka → Flink → OLAP; Kafka → lake; batch jobs for late data and backfills; a query service with caching.\"" },
    { title: "7. Main flows", detail: "\"Ingest with dedup, watermarks and tumbling windows; late events via allowed lateness and side outputs; dashboard queries hitting rollups and caches.\"" },
    { title: "8. Bottlenecks", detail: "\"Skew, dedup state size, dimension cardinality, query concurrency.\"" },
    { title: "9. Component choices", detail: "\"Kafka for a replayable buffer, Flink for event-time stateful processing with exactly-once checkpoints, ClickHouse/Druid/Pinot for columnar OLAP, Iceberg on object storage for the lake.\"" },
    { title: "10. Scaling, consistency, failure", detail: "\"Everything scales by partitions. Exactly-once effect = checkpointed state + idempotent upserts. Kappa reprocessing for logic bugs; Kafka absorbs downstream outages.\"" },
    { title: "11. Security, observability, ops", detail: "\"Write keys per tenant, PII minimisation and deletion (GDPR erasure in the lake via Iceberg row deletes), tenant-scoped queries. Monitor consumer lag, watermark delay, late-event rate, dedup hit rate, end-to-end freshness.\"" },
    { title: "12. Trade-offs", detail: "\"Kappa over lambda, event time over processing time, HLL over exact uniques, rollups plus raw for flexibility.\"" },
  ],
  followUps: [
    { q: "What exactly is a watermark?", a: "A watermark is the stream processor's assertion that no more events with event time ≤ W are expected. Windows ending before W can fire. A bounded-out-of-orderness watermark (max seen − 2 min) trades latency for completeness; events behind the watermark are 'late' and handled by allowed lateness or side outputs." },
    { q: "How do you get exactly-once counts when Kafka delivers at least once?", a: "Flink's checkpoints snapshot operator state and source offsets consistently; after a failure, both roll back together, so the state reflects each event once. The sink must then be idempotent (upsert by rollup key) or transactional (two-phase commit with Kafka transactions). Dedup by event_id handles duplicates created *before* Kafka, e.g. SDK retries." },
    { q: "Why not just put everything in one big database?", a: "86B events/day of row-oriented inserts and full scans for aggregates would be orders of magnitude too slow and expensive. Columnar storage, time partitioning and pre-aggregation are what make sub-second dashboards possible." },
    { q: "How do you compute unique users across a week from daily data?", a: "Merge the daily HLL sketches (register-wise max) and estimate from the merged sketch. Summing daily distinct counts would massively over-count users active on several days." },
    { q: "How would you support funnels (signup → activation → purchase)?", a: "Funnels need per-user ordered sequences: partitioning by user keeps a user's events together, so a stateful stream job (or a batch job on the lake) can track each user's step progress with a time limit and emit funnel counts per step." },
    { q: "When would you choose lambda after all?", a: "When the batch computation is fundamentally different and much more accurate (e.g. ML-based fraud filtering or billing reconciliation that needs complete data), or when replaying a year of events through the stream job is impractical. Then the batch layer becomes the authoritative result and the stream is a fast preview." },
  ],
  related: [
    "system-design/async-processing",
    "system-design/rabbitmq-kafka-sqs",
    "system-design/delivery-semantics",
    "system-design/backpressure",
    "system-design/sharding-partitioning",
    "system-design/sql-vs-nosql",
    "system-design/logging-monitoring-tracing",
    "system-design/dashboards-alerts",
    "distributed/event-driven-architecture",
    "distributed/idempotency-patterns",
  ],
};

export const exercises: DesignExercise[] = [
  urlShortener,
  rateLimiter,
  notificationService,
  chatApplication,
  newsFeed,
  fileStorage,
  videoStreaming,
  searchAutocomplete,
  distributedTaskQueue,
  apiGateway,
  webhookDelivery,
  realtimeAnalytics,
];
