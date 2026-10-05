import type { InterviewQuestion } from "../types";

/**
 * Interview bank: databases (db-*), backend (be-*), cloud (cloud-*) and AI (ai-*).
 */

export const questions: InterviewQuestion[] = [
  // ═══════════════════════════════════════════ DATABASES
  {
    id: "db-01",
    track: "databases",
    number: 1,
    question: "How does a B-tree index make a query fast, and when will PostgreSQL ignore your index?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["index", "b-tree", "explain", "postgres"],
    shortAnswer: "An index is a separate sorted structure that maps key values to row locations. Postgres's default is a B-tree (a B+tree variant): each node is an 8 KB page holding hundreds of keys, so even billions of rows need only 3–4 levels — a lookup reads a handful of pages instead of the whole table, and the linked leaves make range scans and ORDER BY cheap.\n\nThe planner ignores an index when it estimates a sequential scan is cheaper: the predicate matches a large fraction of rows, the table is tiny, the column is wrapped in a function or cast, a composite index's leading column isn't constrained, a `LIKE '%x'` leading wildcard is used, or statistics are stale. I confirm with `EXPLAIN (ANALYZE, BUFFERS)` and compare estimated vs actual rows.",
    deep: [
      { type: "flow", nodes: ["Root page", "Internal page", "Leaf page (key → TID)", "Heap page (row)"], caption: "Conceptual Index Scan path" },
      { type: "list", items: [
        "**Fan-out** is the reason: ~300 keys per page → 300³ ≈ 27 million keys in 3 levels; upper levels stay in cache.",
        "**Leftmost prefix**: `(a, b)` serves `a = ?` and `a = ? AND b > ?`, not `b = ?` alone.",
        "**Index Only Scan** needs all columns in the index (`INCLUDE`) *and* the visibility map to mark pages all-visible.",
        "**Bitmap scans** gather TIDs from one or more indexes, sort them by page, then read the heap in physical order — good for medium selectivity.",
        "Every index costs write throughput and can prevent HOT updates.",
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Engine differences", text: "MySQL InnoDB stores the table itself as a clustered B+tree on the primary key; secondary indexes point to the PK, so a secondary lookup is two tree traversals. Postgres uses an unordered heap plus TIDs." },
    ],
    example: {
      type: "code",
      lang: "sql",
      caption: "Expression index for a case-insensitive lookup",
      code: `CREATE TABLE users (id serial PRIMARY KEY, email text);
CREATE INDEX users_email_idx ON users (email);

-- Can't use users_email_idx: the column is wrapped in lower()
SELECT id FROM users WHERE lower(email) = 'a@x.io';

-- Fix: index the same expression the query uses
CREATE INDEX users_email_lower_idx ON users (lower(email));`,
    },
    walkthrough: [
      { title: "Planner sees `lower(email) = $1`", detail: "The B-tree on `email` is ordered by raw email, not lower(email), so it cannot seek." },
      { title: "Falls back to Seq Scan", detail: "Every row is read and lower() evaluated." },
      { title: "Expression index added", detail: "Now the index is sorted by lower(email); the same predicate matches it exactly, enabling an Index Scan (once the table is large enough that it's cheaper)." },
    ],
    followUps: [
      { q: "Why might the planner choose a Seq Scan even with a perfect index?", a: "If the query returns, say, 30% of rows, thousands of random heap reads cost more than one sequential pass. Cost settings (`random_page_cost`) and statistics drive that decision." },
      { q: "How do you add an index to a busy production table?", a: "`CREATE INDEX CONCURRENTLY` — it avoids blocking writes but takes longer, can't run in a transaction block, and leaves an INVALID index to drop if it fails." },
      { q: "How would you find unused indexes?", a: "Check `pg_stat_user_indexes.idx_scan` over a representative period (and on replicas too, since stats are per-node), then drop candidates carefully." },
    ],
    pitfalls: [
      "Indexing every column — slows writes and wastes memory",
      "Wrong composite column order (range column first)",
      "Trusting EXPLAIN without ANALYZE — estimates can be wildly off",
      "Forgetting that foreign keys aren't indexed automatically in Postgres",
    ],
    glossary: [
      { term: "TID", definition: "Tuple identifier (page, offset) pointing to a heap row version." },
      { term: "Selectivity", definition: "Fraction of rows a predicate matches." },
      { term: "Expression index", definition: "An index on a computed expression such as lower(email)." },
    ],
    relatedLessons: ["databases/indexing", "system-design/database-indexes", "dsa/trees"],
    relatedQuestions: ["db-02"],
  },
  {
    id: "db-02",
    track: "databases",
    number: 2,
    question: "Explain ACID, isolation levels and MVCC. Which anomalies does PostgreSQL's default isolation level allow?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["acid", "isolation", "mvcc", "transactions", "postgres"],
    shortAnswer: "Atomicity: all statements commit or none. Consistency: constraints and invariants hold after each commit. Isolation: concurrent transactions only interfere as much as the isolation level allows. Durability: once COMMIT returns, the change survives a crash because the WAL was flushed.\n\nPostgres implements isolation with MVCC: an UPDATE writes a new row version stamped with xmin/xmax, and each transaction reads through a snapshot, so readers never block writers. The default, Read Committed, takes a new snapshot per statement — no dirty reads, but non-repeatable reads, phantoms, lost updates in read-modify-write code, and write skew are possible. Repeatable Read is snapshot isolation; Serializable uses SSI and aborts one transaction of a dangerous pair, so you must retry.",
    deep: [
      { type: "table", head: ["Level (Postgres)", "Non-repeatable read", "Phantom", "Lost update", "Write skew"], rows: [
        ["Read Committed", "Yes", "Yes", "Yes (app read-modify-write)", "Yes"],
        ["Repeatable Read", "No", "No", "Error 40001 instead", "Yes"],
        ["Serializable", "No", "No", "No", "No (one aborts)"],
      ] },
      { type: "p", text: "Dead row versions are reclaimed by VACUUM. Long transactions hold back the oldest snapshot and cause bloat." },
      { type: "callout", tone: "spec-vs-impl", title: "Postgres specifics", text: "READ UNCOMMITTED behaves as READ COMMITTED in Postgres; its REPEATABLE READ also prevents phantoms; SERIALIZABLE is SSI (since 9.1). Other engines (MySQL InnoDB, SQL Server) implement the same names differently." },
    ],
    example: {
      type: "code",
      lang: "sql",
      caption: "Lost update at Read Committed and the atomic fix (two sessions, stock starts at 10)",
      code: `-- Session A                         -- Session B
SELECT stock FROM p WHERE id=1; -- 10
                                     SELECT stock FROM p WHERE id=1; -- 10
UPDATE p SET stock = 9 WHERE id=1;
                                     UPDATE p SET stock = 9 WHERE id=1; -- waits for A
COMMIT;
                                     -- proceeds; COMMIT
SELECT stock FROM p WHERE id=1;  -- 9  (two sales, one decrement)

-- Fix: let the database do the read-modify-write atomically
UPDATE p SET stock = stock - 1 WHERE id = 1 AND stock > 0;`,
    },
    walkthrough: [
      { title: "Both sessions read 10", detail: "Plain SELECTs take no locks; each sees the latest committed version." },
      { title: "A updates, B blocks", detail: "B's UPDATE targets a row A has modified but not committed, so B waits on A's row lock." },
      { title: "A commits, B overwrites", detail: "At Read Committed, B re-checks its WHERE against the new version (still matches id=1) and writes 9 — A's decrement is lost." },
      { title: "Atomic version", detail: "`stock = stock - 1` is evaluated against the latest committed row after the wait, so the result is 8." },
    ],
    followUps: [
      { q: "What happens to session B at Repeatable Read?", a: "After A commits, B's UPDATE fails with `could not serialize access due to concurrent update` (SQLSTATE 40001); the app retries the transaction." },
      { q: "Give a write-skew example.", a: "Two doctors on call; each transaction checks that at least two are on call and sets itself off call. They update different rows, so snapshot isolation allows both — leaving zero on call. Serializable or locking a shared row prevents it." },
      { q: "How is durability achieved without writing data pages at commit?", a: "The WAL record is fsynced at commit; data pages are written later. Crash recovery replays WAL from the last checkpoint." },
    ],
    pitfalls: [
      "Assuming Read Committed prevents lost updates",
      "Using Serializable without a retry loop",
      "Holding transactions open across network calls",
      "Confusing ACID consistency with CAP consistency",
    ],
    glossary: [
      { term: "MVCC", definition: "Multi-version concurrency control: readers see a snapshot of row versions instead of taking locks." },
      { term: "Snapshot isolation", definition: "Each transaction reads from a consistent snapshot taken at its start." },
      { term: "SSI", definition: "Serializable Snapshot Isolation: SI plus detection of dangerous dependency cycles." },
    ],
    relatedLessons: ["databases/transactions-acid", "system-design/locks-transactions-isolation"],
    relatedQuestions: ["db-01", "db-03"],
  },
  {
    id: "db-03",
    track: "databases",
    number: 3,
    question: "How does PostgreSQL streaming replication work, and what is the difference between synchronous and asynchronous replication?",
    level: "advanced",
    frequency: "high",
    tags: ["replication", "wal", "high-availability", "postgres"],
    shortAnswer: "Every change in Postgres is first written to the write-ahead log. With physical streaming replication a walsender process on the primary streams WAL records to a walreceiver on each replica, which writes them to disk and a startup process replays them — the replica is a byte-identical, read-only hot standby.\n\nBy default it's asynchronous: COMMIT returns once the primary's WAL is flushed, so replicas lag slightly, reads can be stale, and failover can lose the last commits. With `synchronous_standby_names` set, `synchronous_commit = on` makes COMMIT wait until a standby has flushed the WAL (zero data loss on failover) and `remote_apply` waits until it's replayed (read-your-writes on that standby) — at the cost of commit latency and the risk that writes stall if no sync standby is available.",
    deep: [
      { type: "flow", nodes: ["COMMIT", "WAL flush (primary)", "walsender", "walreceiver (replica)", "replay", "hot standby reads"], caption: "Conceptual" },
      { type: "list", items: [
        "**Replication slots** keep WAL until the replica has it — but an abandoned slot can fill the primary's disk.",
        "**Lag** is visible in `pg_stat_replication` (write_lag, flush_lag, replay_lag).",
        "**Quorum commit**: `ANY 1 (r1, r2)` so a single standby outage doesn't block writes.",
        "**Failover** needs an external orchestrator (Patroni + etcd, managed HA) and fencing to avoid split brain.",
        "**Logical replication** decodes WAL into row changes for cross-version upgrades and CDC.",
      ] },
    ],
    example: {
      type: "code",
      lang: "sql",
      caption: "Per-transaction durability choice",
      code: `-- Default for the cluster: synchronous_standby_names = 'ANY 1 (r1, r2)'
BEGIN;
SET LOCAL synchronous_commit = remote_apply;   -- this payment must be readable on the standby
INSERT INTO payments (id, amount) VALUES (1, 100);
COMMIT;   -- returns after a standby has replayed it

BEGIN;
SET LOCAL synchronous_commit = local;          -- analytics event: speed over safety
INSERT INTO page_views (path) VALUES ('/home');
COMMIT;   -- returns after local WAL flush only`,
    },
    walkthrough: [
      { title: "remote_apply transaction", detail: "Primary flushes WAL, streams it, waits until one of r1/r2 reports replay LSN ≥ commit LSN." },
      { title: "local transaction", detail: "Commit is acknowledged after the primary's flush; standbys catch up asynchronously." },
      { title: "Why mix", detail: "synchronous_commit can be set per transaction, so critical writes pay for safety and bulk/low-value writes don't." },
    ],
    followUps: [
      { q: "Is a replica a backup?", a: "No — destructive statements replicate too. Keep base backups plus a WAL archive for point-in-time recovery." },
      { q: "How do you avoid read-your-writes anomalies with async replicas?", a: "Route the user to the primary for a short window after writes, or remember the commit LSN and only read from a replica that has replayed past it." },
      { q: "Why doesn't Postgres elect a new leader by itself?", a: "Core Postgres has no consensus layer; tools like Patroni use a distributed store (etcd/Consul/ZooKeeper) for leader election and fencing." },
    ],
    pitfalls: [
      "A single synchronous standby — its outage blocks all commits",
      "Unmonitored replication slots filling the disk",
      "Long queries on a replica cancelled by replay conflicts (or causing bloat with hot_standby_feedback)",
    ],
    glossary: [
      { term: "WAL", definition: "Write-ahead log: sequential record of changes flushed before data pages." },
      { term: "Hot standby", definition: "A replica serving read-only queries while replaying WAL." },
      { term: "RPO", definition: "Recovery point objective: acceptable data loss window." },
    ],
    relatedLessons: ["databases/postgres-replication", "system-design/replication", "distributed/consensus-basics"],
    relatedQuestions: ["db-02", "db-06"],
  },
  {
    id: "db-04",
    track: "databases",
    number: 4,
    question: "What is connection pooling, how do you size a pool, and why do serverless apps run out of database connections?",
    level: "intermediate",
    frequency: "high",
    tags: ["connection-pool", "pgbouncer", "serverless", "postgres"],
    shortAnswer: "Opening a Postgres connection is expensive — TCP, TLS and authentication round trips plus a forked backend process with its own memory — so applications keep a bounded set of open connections and lend them out per query or transaction.\n\nPool size should follow the database's capacity, roughly a small multiple of its CPU cores for the whole cluster, divided across the maximum number of app instances; callers beyond that wait, which is useful backpressure. Serverless breaks this because every concurrent function instance has its own pool, so connections scale with traffic and hit `max_connections`. The fix is an external pooler like PgBouncer in transaction mode or RDS Proxy, tiny per-instance pools, and concurrency caps.",
    deep: [
      { type: "table", head: ["PgBouncer mode", "Released after", "Breaks"], rows: [
        ["session", "client disconnect", "nothing"],
        ["transaction", "each transaction", "session SET, LISTEN, session advisory locks, temp tables across transactions, prepared statements on PgBouncer < 1.21"],
        ["statement", "each statement", "multi-statement transactions"],
      ] },
      { type: "p", text: "Little's law gives a quick sanity check: busy connections ≈ throughput × time each request holds a connection." },
    ],
    example: {
      type: "code",
      lang: "text",
      caption: "Budget arithmetic",
      code: `max_connections        = 100
reserved (admin, repl)  = 10   -> usable 90
max app instances       = 15
per-instance pool max   = floor(90 / 15) = 6

Little's law check: 1500 req/s × 4 ms per DB call = 6 busy connections in total`,
      output: `Per-instance pool: 6. Average busy connections: 6 — plenty of headroom.`,
    },
    walkthrough: [
      { title: "Reserve", detail: "Keep connections for superuser, migrations and replication." },
      { title: "Divide by max instances", detail: "Autoscaling adds instances; size for the peak count, not today's." },
      { title: "Validate with Little's law", detail: "If required busy connections exceed the budget, the fix is faster queries or a pooler, not a bigger max_connections." },
    ],
    followUps: [
      { q: "Why not raise max_connections to 5000?", a: "Each connection is a process; thousands of active backends waste memory and contend on CPU and locks. Throughput typically peaks at a small multiple of cores." },
      { q: "How do you run a transaction through `pg.Pool`?", a: "Check out one client with `pool.connect()`, run BEGIN…COMMIT on it, and release it in `finally`. `pool.query` may use a different connection per call." },
      { q: "What does Prisma Accelerate or RDS Proxy give you?", a: "A managed, shared pool in front of the database so ephemeral or numerous clients don't each open their own connections (Accelerate also offers query caching)." },
    ],
    pitfalls: [
      "Pool max set to expected HTTP concurrency",
      "Not releasing clients on error paths (connection leaks)",
      "Session-level SET behind transaction pooling",
      "Creating a new pool or ORM client per request",
    ],
    glossary: [
      { term: "Connection pool", definition: "A bounded set of reusable open connections." },
      { term: "PgBouncer", definition: "A lightweight Postgres connection pooler/proxy." },
      { term: "Little's law", definition: "L = λW: items in system = arrival rate × time in system." },
    ],
    relatedLessons: ["databases/connection-pooling", "databases/prisma", "system-design/backpressure"],
    relatedQuestions: ["db-05"],
  },
  {
    id: "db-05",
    track: "databases",
    number: 5,
    question: "What is the N+1 query problem in ORMs, how do you detect it, and how do you fix it?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["orm", "n+1", "prisma", "sqlalchemy", "performance"],
    shortAnswer: "N+1 happens when code loads a list with one query and then lazily loads a relation for each item — one query per row. With 100 posts that's 101 round trips, each fast on its own but slow in total, and it gets worse with latency to the database.\n\nI detect it with query logging or tracing (many identical queries with different parameters inside one request). The fix is to load relations in bulk: eager loading (`include` in Prisma, `selectinload`/`joinedload` in SQLAlchemy, `include` in Sequelize), a JOIN, or batching with an IN list — in GraphQL that's DataLoader.",
    deep: [
      { type: "compare", items: [
        { title: "JOIN-based eager loading", points: ["One round trip", "Row duplication for one-to-many (parent repeated per child)", "Can explode with multiple one-to-many joins"] },
        { title: "IN-based batch loading", points: ["2 queries (parents, then children WHERE fk IN (...))", "No duplication", "Very large IN lists may need chunking"] },
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Tool behaviour varies", text: "Prisma's `include` traditionally issues one extra IN query per relation level (newer versions can use JOINs); Mongoose `populate` issues a separate `$in` query; SQLAlchemy lets you choose per relationship. Always check the emitted SQL." },
    ],
    example: {
      type: "code",
      lang: "ts",
      caption: "Query count with Prisma for 100 users",
      code: `// N+1
const users = await prisma.user.findMany();            // 1 query
for (const u of users) {
  await prisma.post.count({ where: { authorId: u.id } }); // +100 queries
}

// Fixed: aggregate the relation in the same request
const withCounts = await prisma.user.findMany({
  include: { _count: { select: { posts: true } } },
});`,
      output: `N+1 version: 101 queries
Fixed version: a constant number of queries (typically 1; the count is aggregated by the database), independent of N`,
    },
    walkthrough: [
      { title: "Spot it", detail: "Trace shows one `SELECT ... FROM users` followed by 100 near-identical `SELECT count(*) ... WHERE authorId = $1`." },
      { title: "Choose a bulk strategy", detail: "Relation counts → `_count`; full children → `include`; arbitrary → one `WHERE authorId IN (...)` then group in memory." },
      { title: "Verify", detail: "Re-run with query logging; query count should no longer depend on N." },
    ],
    followUps: [
      { q: "How does DataLoader solve N+1 in GraphQL?", a: "Resolvers call `loader.load(id)`; DataLoader collects all ids requested in the same tick, calls a batch function once with the array (one IN query), and caches per request." },
      { q: "Is eager loading always better?", a: "No — eagerly loading relations you don't use wastes I/O and memory. Load what the response needs." },
    ],
    pitfalls: [
      "Fixing N+1 with a giant JOIN across several one-to-many relations (cartesian explosion)",
      "Hiding N+1 inside serializers/template rendering",
      "Caching per-item queries instead of batching them",
    ],
    glossary: [
      { term: "Lazy loading", definition: "Fetching a relation only when it is first accessed." },
      { term: "Eager loading", definition: "Fetching relations up front together with the parent query." },
      { term: "DataLoader", definition: "A batching + per-request caching utility used in GraphQL servers." },
    ],
    relatedLessons: ["databases/orm-vs-odm", "databases/prisma", "backend/rest-graphql-grpc-trpc"],
    relatedQuestions: ["be-06", "db-04"],
  },
  {
    id: "db-06",
    track: "databases",
    number: 6,
    question: "What is the difference between partitioning and sharding, and how do you choose a shard key?",
    level: "advanced",
    frequency: "high",
    tags: ["partitioning", "sharding", "scaling", "postgres"],
    shortAnswer: "Partitioning splits one logical table into several physical tables inside the same database server — in Postgres via `PARTITION BY RANGE/LIST/HASH` — so queries can prune irrelevant partitions and old data can be dropped instantly. Sharding splits data across multiple servers, each owning a subset of keys, to scale writes and storage beyond one machine.\n\nA good shard key has high cardinality, spreads load evenly (no hot keys), and matches the dominant access pattern so most queries and transactions hit one shard — tenant_id or user_id is common. Sharding costs you cross-shard joins, cross-shard transactions, global uniqueness and painful resharding, so I exhaust indexing, caching, replicas and partitioning first.",
    deep: [
      { type: "table", head: ["", "Partitioning", "Sharding"], rows: [
        ["Where", "One server", "Many servers"],
        ["Transparent to app?", "Yes (same table name)", "Usually not (routing layer, or Citus/Vitess)"],
        ["Transactions/joins", "Normal", "Cross-shard needs 2PC/sagas or is avoided"],
        ["Main win", "Pruning, maintenance, retention", "Write throughput and data size"],
      ] },
      { type: "list", items: [
        "**Hash sharding** spreads evenly but kills range queries; **range sharding** keeps ranges local but risks hot spots (e.g. time-ordered keys).",
        "**Directory/lookup sharding** stores key → shard in a table, allowing moves at the cost of an extra lookup.",
        "**Consistent hashing** or many virtual shards mapped to fewer physical nodes makes rebalancing cheaper.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      caption: "Why modulo sharding hurts resharding",
      code: `const keys = Array.from({ length: 1000 }, (_, i) => i);
const moved = keys.filter((k) => k % 4 !== k % 5).length;
console.log(\`moved \${moved} of \${keys.length} keys going from 4 to 5 shards\`);`,
      output: "moved 800 of 1000 keys going from 4 to 5 shards",
    },
    walkthrough: [
      { title: "hash % N", detail: "A key's shard depends on N, so changing N reshuffles almost everything (here 80%)." },
      { title: "Consistent hashing / virtual shards", detail: "Adding a node moves only ~1/N of keys." },
    ],
    followUps: [
      { q: "How do you keep a unique constraint (e.g. email) across shards?", a: "Shard by that key, keep a separate global lookup table/service, or enforce uniqueness asynchronously with compensation." },
      { q: "In Postgres partitioning, why must a primary key include the partition key?", a: "Unique indexes are per partition; only if the partition key is part of the key can per-partition uniqueness guarantee global uniqueness." },
    ],
    pitfalls: [
      "Sharding by a monotonically increasing key (all writes hit the last shard)",
      "Choosing a key that forces most queries to scatter-gather across all shards",
      "Sharding before measuring — replicas or partitioning would have sufficed",
    ],
    glossary: [
      { term: "Partition pruning", definition: "Skipping partitions whose bounds can't match the query predicate." },
      { term: "Hot shard", definition: "A shard receiving a disproportionate share of traffic." },
      { term: "Scatter-gather", definition: "Sending a query to all shards and merging results." },
    ],
    relatedLessons: ["databases/partitioning-sharding", "system-design/sharding-partitioning", "databases/database-scaling"],
    relatedQuestions: ["db-03"],
  },
  // ═══════════════════════════════════════════ BACKEND
  {
    id: "be-01",
    track: "backend",
    number: 1,
    question: "Redis is \"single-threaded\" — so why is it so fast, and what does that mean for how you use it?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["redis", "event-loop", "performance", "caching"],
    shortAnswer: "Redis keeps all data in memory, uses compact purpose-built data structures, and executes commands on a single main thread driven by an event loop (epoll/kqueue I/O multiplexing). Most commands are O(1) or O(log n) and take microseconds, so one thread can serve on the order of a hundred thousand or more simple operations per second, with no locks or context switches between commands.\n\nIt also means every command is atomic and commands run one at a time — so one slow command (`KEYS *`, a huge `DEL`, a long Lua script) blocks every other client. Since Redis 6, optional I/O threads can parallelise socket reads/writes and protocol parsing, but command execution itself remains single-threaded; to use more cores you run more instances or Redis Cluster.",
    deep: [
      { type: "list", items: [
        "**Atomicity for free**: `INCR`, `SETNX`/`SET NX`, Lua scripts and MULTI/EXEC run without interleaving, which is why Redis is popular for counters, locks and rate limiters.",
        "**Latency killers**: O(N) commands on big keys (`KEYS`, `SMEMBERS` on million-member sets, `HGETALL` on huge hashes); use `SCAN`, `UNLINK` (lazy free in a background thread).",
        "**Persistence** (RDB snapshots via fork, AOF with fsync policy) runs mostly off the main thread, but fork on a large dataset can cause latency spikes.",
        "**Scaling**: replicas for reads and HA; Redis Cluster shards keys across 16384 hash slots.",
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Version and fork details", text: "Redis 6.0 introduced `io-threads` for network I/O; background threads already handled some tasks (lazy freeing, AOF fsync). Forks and alternatives (KeyDB, Dragonfly, Valkey releases) make different threading choices — check the specific server's docs." },
    ],
    example: {
      type: "code",
      lang: "bash",
      caption: "Atomic counter vs racy read-modify-write",
      code: `redis-cli SET views 0
redis-cli INCR views      # atomic on the server
redis-cli INCR views
redis-cli GET views`,
      output: `OK
(integer) 1
(integer) 2
"2"`,
    },
    walkthrough: [
      { title: "SET", detail: "Stores the string \"0\"." },
      { title: "INCR ×2", detail: "Each INCR parses the integer, adds 1 and stores it in one indivisible step on the main thread — two concurrent clients can never both read 0." },
      { title: "GET", detail: "Returns the string \"2\" (Redis stores it as a string; INCR treats it as a 64-bit integer)." },
    ],
    followUps: [
      { q: "How do you find what's blocking Redis?", a: "`SLOWLOG GET`, `LATENCY DOCTOR`, `INFO commandstats`, and `--bigkeys` / `MEMORY USAGE` to find oversized keys." },
      { q: "Is a Lua script atomic?", a: "Yes — the whole script runs without other commands interleaving, which also means a long script blocks the server (bounded by `busy-reply-threshold`/`lua-time-limit`, after which only SCRIPT KILL/SHUTDOWN NOSAVE are accepted)." },
      { q: "How do you use multiple cores?", a: "Run several Redis instances (Cluster shards or separate roles); enable io-threads for network-heavy workloads." },
    ],
    pitfalls: [
      "Running `KEYS *` in production",
      "Assuming io-threads make command execution parallel",
      "Storing huge values/collections in one key",
    ],
    glossary: [
      { term: "Event loop", definition: "A loop that waits for ready sockets (epoll/kqueue) and processes their events one at a time." },
      { term: "I/O threads", definition: "Redis 6+ threads that handle socket reads/writes and parsing, not command execution." },
      { term: "UNLINK", definition: "Deletes a key's name immediately and frees its memory in a background thread." },
    ],
    relatedLessons: ["backend/redis", "system-design/caching-strategies", "nodejs/node-event-loop"],
    relatedQuestions: ["be-02"],
  },
  {
    id: "be-02",
    track: "backend",
    number: 2,
    question: "How would you implement API rate limiting with Redis?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["rate-limiting", "redis", "token-bucket", "lua"],
    shortAnswer: "Pick an algorithm and a key (per user, API key or IP). The simplest is a fixed window: `INCR rl:{user}:{minute}` and `EXPIRE` it, rejecting above the limit — cheap but allows bursts of 2× at window boundaries. A sliding-window log uses a sorted set of timestamps (`ZADD`, `ZREMRANGEBYSCORE`, `ZCARD`) for exact counts at higher memory cost. A token bucket stores tokens and last-refill time and allows controlled bursts with a steady average rate.\n\nBecause the check-and-update must be atomic across many app servers, I run it as a Lua script (or `MULTI` for the simple INCR+EXPIRE case), return 429 with `Retry-After` when rejected, and decide whether to fail open or closed if Redis is unavailable.",
    deep: [
      { type: "viz", id: "sys-rate-limiter", caption: "Token bucket" },
      { type: "table", head: ["Algorithm", "Redis structure", "Trade-off"], rows: [
        ["Fixed window", "String + INCR + EXPIRE", "Tiny, but boundary bursts"],
        ["Sliding log", "Sorted set of timestamps", "Exact, memory O(requests)"],
        ["Sliding window counter", "Two fixed-window counters, weighted", "Good approximation, cheap"],
        ["Token bucket", "Hash {tokens, ts} + Lua", "Bursts up to capacity, smooth average"],
      ] },
      { type: "callout", tone: "warning", title: "Atomicity", text: "`GET` then `SET` from the app races between servers. Do the whole decision in one Lua script; in Redis Cluster keep all keys of one script in the same hash slot (hash tags like `rl:{user42}`)." },
    ],
    example: {
      type: "code",
      lang: "js",
      caption: "Token bucket logic (in-memory model of what the Lua script computes)",
      code: `function createBucket(capacity, refillPerSec) {
  let tokens = capacity, last = 0;
  return function allow(nowMs) {
    tokens = Math.min(capacity, tokens + ((nowMs - last) / 1000) * refillPerSec);
    last = nowMs;
    if (tokens >= 1) { tokens -= 1; return true; }
    return false;
  };
}
const allow = createBucket(3, 1); // burst 3, 1 token/sec
const t = [0, 0, 0, 0, 500, 1000, 1000];
console.log(t.map((ms) => \`\${ms}ms:\${allow(ms) ? "ok" : "429"}\`).join(" "));`,
      output: "0ms:ok 0ms:ok 0ms:ok 0ms:429 500ms:429 1000ms:ok 1000ms:429",
    },
    walkthrough: [
      { title: "t=0, three requests", detail: "Bucket starts full (3); each consumes one token." },
      { title: "t=0, fourth", detail: "0 tokens → rejected with 429." },
      { title: "t=500ms", detail: "Refilled 0.5 token — still below 1 → 429." },
      { title: "t=1000ms", detail: "Another 0.5 → exactly 1 token → allowed, then empty again." },
    ],
    followUps: [
      { q: "Fail open or fail closed if Redis is down?", a: "Usually fail open for user-facing APIs (availability) with a local in-memory fallback limit; fail closed for abuse-sensitive endpoints like login or SMS sending." },
      { q: "Where should rate limiting live?", a: "Coarse limits at the edge (CDN/API gateway/WAF), fine-grained per-tenant/business limits in the app or gateway with Redis." },
      { q: "What headers do you return?", a: "429 Too Many Requests with `Retry-After`; many APIs also send `RateLimit-*` / `X-RateLimit-*` headers for remaining quota." },
    ],
    pitfalls: [
      "Non-atomic GET/SET from application code",
      "Using wall-clock time from many app servers with skewed clocks (use Redis `TIME` inside the script)",
      "Keys without TTL accumulating forever",
      "Limiting by IP behind a proxy without trusting the right X-Forwarded-For hop",
    ],
    glossary: [
      { term: "Token bucket", definition: "Tokens refill at a fixed rate up to a capacity; each request spends one." },
      { term: "Fixed window", definition: "Counting requests per aligned time window." },
      { term: "Hash tag", definition: "`{...}` part of a Redis Cluster key that determines its hash slot." },
    ],
    relatedLessons: ["backend/redis", "system-design/rate-limiting"],
    relatedQuestions: ["be-01"],
  },
  {
    id: "be-03",
    track: "backend",
    number: 3,
    question: "JWTs vs server-side sessions: how do they work, what are the security pitfalls, and how do you revoke a JWT?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["jwt", "sessions", "authentication", "refresh-tokens", "security"],
    shortAnswer: "A server-side session stores state on the server (or Redis) and gives the browser an opaque random id in an HttpOnly cookie; every request looks the session up, so logout and revocation are instant. A JWT is a signed, self-contained token — base64url header, payload of claims, and signature — that the server verifies without a lookup, which suits stateless and cross-service auth.\n\nThe JWT pitfalls: the payload is only encoded, not encrypted; you must pin the accepted algorithm to avoid `alg: none` and HS256/RS256 key-confusion attacks; and you can't easily revoke one before `exp`. So I use short-lived access tokens (minutes) plus a long-lived, rotating refresh token stored server-side, with reuse detection — revocation means deleting the refresh token (or session/device record), and for immediate cut-off a denylist of `jti`s or a per-user token version checked on sensitive operations.",
    deep: [
      { type: "compare", items: [
        { title: "Server-side session", points: ["Opaque id, state in DB/Redis", "Instant revocation, easy per-device listing", "Lookup per request (cheap with Redis)", "Cookie → needs CSRF defence"] },
        { title: "JWT access token", points: ["Self-contained, verified with a key", "No lookup; works across services", "Hard to revoke before exp", "Size grows with claims"] },
      ] },
      { type: "list", items: [
        "**alg: none** — some libraries historically accepted unsigned tokens if the header said so. Always pass an explicit algorithm allow-list.",
        "**Algorithm confusion** — if a verifier for RS256 accepts HS256, an attacker can sign with HMAC using the *public* key as the secret. Pin algorithm and key type.",
        "**Storage** — localStorage is readable by any XSS; HttpOnly, Secure, SameSite cookies resist token theft but need CSRF protection.",
        "**Refresh rotation** — each refresh issues a new refresh token and invalidates the old; reuse of an old one signals theft → revoke the whole token family.",
        "**Device sessions** — store one refresh token/session row per device (id, user agent, last seen), enabling 'log out other devices' and concurrent-session limits.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      caption: "A JWT's header and payload are just base64url JSON — anyone can read them",
      code: `const b64url = (obj) => btoa(JSON.stringify(obj)).replace(/=+$/, "").replace(/\\+/g, "-").replace(/\\//g, "_");
const header = { alg: "HS256", typ: "JWT" };
const payload = { sub: "42", role: "user", exp: 1767225600 };
const token = \`\${b64url(header)}.\${b64url(payload)}.<signature>\`;
console.log(token);
const [h, p] = token.split(".");
const decode = (s) => JSON.parse(atob(s.replace(/-/g, "+").replace(/_/g, "/")));
console.log(decode(h).alg, decode(p).sub, decode(p).role);`,
      output: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzY3MjI1NjAwfQ.<signature>
HS256 42 user`,
    },
    walkthrough: [
      { title: "Encode", detail: "Header and payload are JSON → base64url (no padding). No secret is involved." },
      { title: "Sign", detail: "The signature is HMAC/RSA/ECDSA over `header.payload`; only it proves integrity." },
      { title: "Decode", detail: "Anyone can decode the first two parts — never put secrets or PII you wouldn't expose in the payload." },
    ],
    followUps: [
      { q: "Where should a SPA keep tokens?", a: "Prefer an HttpOnly Secure SameSite cookie (possibly via a backend-for-frontend) so XSS can't read it; if tokens must live in JS, keep the access token in memory only and the refresh token in an HttpOnly cookie." },
      { q: "Which claims must a verifier check?", a: "Signature with a pinned algorithm/key, `exp` (and `nbf`), `iss`, and `aud` — plus any app-specific checks." },
      { q: "How do you limit concurrent sessions?", a: "Keep a sessions/devices table per user; on login, count active rows and revoke the oldest (or deny) beyond the limit; access tokens carry a session id checked when refreshing." },
    ],
    pitfalls: [
      "Letting the token header choose the verification algorithm",
      "Long-lived access tokens with no revocation path",
      "Storing tokens in localStorage on XSS-prone apps",
      "Treating JWT payload as confidential",
    ],
    glossary: [
      { term: "JWS", definition: "JSON Web Signature — the signed JWT format (header.payload.signature)." },
      { term: "Refresh token", definition: "Long-lived credential used only to obtain new short-lived access tokens." },
      { term: "jti", definition: "JWT ID claim — a unique token id usable for denylisting." },
    ],
    relatedLessons: ["backend/authentication-jwt-sessions", "backend/csrf", "system-design/authn-authz"],
    relatedQuestions: ["be-04"],
  },
  {
    id: "be-04",
    track: "backend",
    number: 4,
    question: "What is CSRF, why does it work, and how do you prevent it?",
    level: "intermediate",
    frequency: "high",
    tags: ["csrf", "cookies", "samesite", "security", "owasp"],
    shortAnswer: "Cross-Site Request Forgery tricks a logged-in user's browser into sending a state-changing request to your site from another site — a hidden auto-submitting form, for example. It works because browsers attach your site's cookies to requests going to your site regardless of which page initiated them; the attacker can't read the response, but the side effect (transfer, email change) happens.\n\nDefences: SameSite cookies (`Lax` blocks cookies on cross-site POSTs; `Strict` on all cross-site requests), a synchronizer or double-submit CSRF token that the attacker can't know, verifying `Origin`/`Sec-Fetch-Site` headers on unsafe methods, never changing state on GET, and requiring re-authentication for sensitive actions. APIs that authenticate with an `Authorization` header instead of cookies aren't CSRF-prone by default.",
    deep: [
      { type: "steps", steps: [
        { title: "Victim logs in to bank.example", detail: "Browser stores a session cookie for bank.example." },
        { title: "Victim visits evil.example", detail: "Page contains a form posting to bank.example/transfer and submits it with JS." },
        { title: "Browser sends the POST", detail: "Without SameSite protection the bank's cookie is attached — the server sees an authenticated request." },
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "SameSite defaults differ by browser", text: "Chrome (since 2020) treats cookies without a SameSite attribute as `Lax` by default (with a short-lived exception for top-level POSTs right after the cookie is set). Other browsers have not all adopted Lax-by-default. `SameSite=None` requires `Secure`. Set the attribute explicitly instead of relying on defaults." },
      { type: "callout", tone: "misconception", title: "CORS is not CSRF protection", text: "CORS controls whether a script on another origin can *read* a response. Simple form posts don't need CORS preflight at all, so the request is still sent." },
    ],
    example: {
      type: "code",
      lang: "http",
      caption: "A hardened session cookie and the attack it blocks",
      code: `Set-Cookie: sid=9f8c...; Path=/; HttpOnly; Secure; SameSite=Lax

# From https://evil.example (cross-site), auto-submitted form:
POST /transfer HTTP/1.1
Host: bank.example
Origin: https://evil.example
Sec-Fetch-Site: cross-site
Content-Type: application/x-www-form-urlencoded

to=attacker&amount=1000`,
      output: `Browser omits the sid cookie (SameSite=Lax blocks cross-site POST).
Server also rejects: Origin not in allow-list → 403.`,
    },
    walkthrough: [
      { title: "SameSite=Lax", detail: "Cookie sent on top-level GET navigations from other sites, but not on cross-site POSTs or subresource requests." },
      { title: "Origin check", detail: "Defence in depth for older browsers or same-site subdomain attacks: compare Origin to your allow-list on POST/PUT/PATCH/DELETE." },
      { title: "Token", detail: "For forms, a per-session token in a hidden field that the server compares — the attacker can't read it cross-origin." },
    ],
    followUps: [
      { q: "Why isn't SameSite enough on its own?", a: "\"Site\" means registrable domain, so a compromised or user-controlled subdomain is same-site; older browsers may ignore it; and GET endpoints that change state are still exposed under Lax." },
      { q: "Does a JSON API need CSRF protection?", a: "If it authenticates via cookies, yes — require a non-simple content type or custom header (forcing a CORS preflight) plus Origin checks or tokens. If it uses bearer tokens in headers, browsers don't attach them automatically." },
    ],
    pitfalls: [
      "State-changing GET endpoints",
      "Relying on CORS as protection",
      "Leaking CSRF tokens in URLs or logs",
      "Assuming every browser defaults to SameSite=Lax",
    ],
    glossary: [
      { term: "SameSite", definition: "Cookie attribute (Strict/Lax/None) controlling whether cookies are sent on cross-site requests." },
      { term: "Synchronizer token", definition: "Server-generated secret embedded in forms and verified on submit." },
      { term: "Sec-Fetch-Site", definition: "Fetch metadata request header telling the server whether a request is same-origin, same-site or cross-site." },
    ],
    relatedLessons: ["backend/csrf", "backend/authentication-jwt-sessions", "networks/cors"],
    relatedQuestions: ["be-03"],
  },
  {
    id: "be-05",
    track: "backend",
    number: 5,
    question: "Design reliable webhook delivery: retries, ordering, security and dead-letter queues.",
    level: "advanced",
    frequency: "high",
    tags: ["webhooks", "dlq", "retries", "idempotency", "hmac", "queues"],
    shortAnswer: "When a domain event happens, write it in the same database transaction as the state change (an outbox row), then a dispatcher enqueues deliveries per subscriber endpoint. Workers POST the payload with a timeout, signed with an HMAC over the timestamp and body so receivers can verify authenticity and reject replays. Non-2xx or timeouts are retried with exponential backoff and jitter; after a max attempt count or age the delivery moves to a dead-letter queue for inspection and manual or automated replay.\n\nDelivery is at-least-once, so every event carries a unique id and receivers must be idempotent. Ordering isn't guaranteed across retries — include timestamps/versions, or deliver per-key sequentially if needed. Per-endpoint concurrency limits and circuit breaking stop one slow customer from starving everyone.",
    deep: [
      { type: "flow", nodes: ["DB txn + outbox row", "Dispatcher", "Delivery queue", "Worker pool", "Customer endpoint", "Retry w/ backoff", "DLQ"], caption: "Conceptual pipeline" },
      { type: "viz", id: "go-worker-pool", caption: "Workers pull delivery jobs from a channel/queue" },
      { type: "list", items: [
        "**Signature**: `HMAC-SHA256(secret, timestamp + '.' + body)` in a header; receivers verify in constant time and reject old timestamps.",
        "**Backoff**: e.g. 1 m, 5 m, 30 m, 2 h… with ±jitter; cap total retry age (often 24–72 h).",
        "**DLQ**: keep payload, attempts, last status/error; expose replay in a dashboard; alert on DLQ growth.",
        "**Isolation**: per-endpoint queues or rate limits so a down endpoint doesn't block others; disable endpoints that fail for days.",
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Broker-specific DLQ behaviour", text: "SQS moves a message to a DLQ after `maxReceiveCount` via a redrive policy; RabbitMQ dead-letters via a dead-letter exchange on reject/TTL/length limits; Kafka has no built-in DLQ — consumers publish failures to a separate topic (as Kafka Connect does)." },
    ],
    example: {
      type: "code",
      lang: "js",
      caption: "Exponential backoff with full jitter — deterministic preview using a fixed 'random' value",
      code: `const base = 60, cap = 6 * 3600; // seconds
const delay = (attempt, r) => Math.round(r * Math.min(cap, base * 2 ** attempt));
const schedule = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((a) => delay(a, 0.5));
console.log(schedule.join(", "));`,
      output: "30, 60, 120, 240, 480, 960, 1920, 3840, 7680",
    },
    walkthrough: [
      { title: "Exponential growth", detail: "Upper bound doubles each attempt: 60, 120, 240 … seconds." },
      { title: "Cap", detail: "Never wait more than 6 h between attempts (cap reached later in the sequence)." },
      { title: "Full jitter", detail: "Real code uses a fresh random r ∈ [0, 1) so thousands of failed deliveries don't retry in lockstep; r = 0.5 here just makes the output reproducible." },
      { title: "After the last attempt", detail: "Move to the DLQ with the error context." },
    ],
    followUps: [
      { q: "How does the receiver handle duplicates?", a: "Store processed event ids (unique constraint) and skip repeats; respond 2xx quickly and process asynchronously." },
      { q: "Why not send the webhook directly inside the request that changed state?", a: "The HTTP call could fail after the DB commit (lost event) or succeed before a rollback (phantom event); it also adds customer latency to your request. The outbox makes event creation atomic with the state change." },
      { q: "What do you retry and what not?", a: "Retry timeouts, connection errors, 5xx and 429 (respecting Retry-After). Generally don't retry 4xx like 400/401/404 — they won't fix themselves (some providers retry everything for simplicity)." },
    ],
    pitfalls: [
      "Retrying without jitter (thundering herd)",
      "No per-endpoint isolation",
      "Unsigned payloads or signatures without timestamps (replay)",
      "DLQ nobody monitors",
    ],
    glossary: [
      { term: "Dead-letter queue", definition: "Holding area for messages that repeatedly failed processing." },
      { term: "Outbox pattern", definition: "Writing events to a table in the same transaction as state changes, then publishing them asynchronously." },
      { term: "At-least-once", definition: "Every message is delivered one or more times; duplicates possible." },
    ],
    relatedLessons: ["backend/webhooks-dlq", "distributed/idempotency-patterns", "distributed/distributed-transactions", "system-design/delivery-semantics"],
    relatedQuestions: ["be-02"],
  },
  {
    id: "be-06",
    track: "backend",
    number: 6,
    question: "REST vs GraphQL vs gRPC vs tRPC — when would you choose each, and how do you solve the N+1 problem in GraphQL?",
    level: "intermediate",
    frequency: "high",
    tags: ["rest", "graphql", "grpc", "trpc", "dataloader", "api-design"],
    shortAnswer: "REST models resources over HTTP with standard methods and status codes — simple, cacheable and universal, ideal for public APIs. GraphQL exposes a typed schema and lets clients ask for exactly the fields and nested relations they need in one request, great for varied front-ends, at the cost of harder HTTP caching, query-cost control and resolver performance. gRPC uses Protobuf contracts over HTTP/2 with streaming and generated clients — efficient for service-to-service calls, awkward directly from browsers. tRPC shares TypeScript types between a TS server and client with no schema language — excellent DX inside a full-stack TypeScript monorepo, not for polyglot or public APIs.\n\nIn GraphQL each field has a resolver; a list of 50 posts whose `author` resolver queries the DB produces 51 queries. DataLoader fixes it by collecting all `load(id)` calls in one tick into a single batch query and caching per request.",
    deep: [
      { type: "table", head: ["", "REST", "GraphQL", "gRPC", "tRPC"], rows: [
        ["Contract", "OpenAPI (optional)", "SDL schema", ".proto", "TS types"],
        ["Transport", "HTTP/1.1+ JSON", "Usually HTTP POST JSON", "HTTP/2, Protobuf", "HTTP JSON"],
        ["Caching", "HTTP caches/CDN", "Client/normalized caches; persisted queries", "App-level", "App-level / React Query"],
        ["Best fit", "Public APIs", "Product UIs aggregating data", "Internal microservices, streaming", "TS full-stack apps"],
      ] },
      { type: "callout", tone: "warning", title: "GraphQL hardening", text: "Limit query depth/complexity, paginate lists, use persisted queries for public clients, and disable introspection in production if your threat model requires it." },
    ],
    example: {
      type: "code",
      lang: "js",
      caption: "Mini DataLoader: batching loads issued in the same tick",
      code: `let queries = 0;
const db = async (ids) => { queries++; return ids.map((id) => ({ id, name: "user" + id })); };

function createLoader(batchFn) {
  let pending = [];
  return {
    load(id) {
      return new Promise((resolve) => {
        pending.push({ id, resolve });
        if (pending.length === 1) queueMicrotask(async () => {
          const batch = pending; pending = [];
          const rows = await batchFn(batch.map((p) => p.id));
          batch.forEach((p, i) => p.resolve(rows[i]));
        });
      });
    },
  };
}

const posts = [{ authorId: 1 }, { authorId: 2 }, { authorId: 3 }];
const userLoader = createLoader(db);
Promise.all(posts.map((p) => userLoader.load(p.authorId))).then((authors) => {
  console.log(authors.map((a) => a.name).join(","), "queries:", queries);
});`,
      output: "user1,user2,user3 queries: 1",
    },
    walkthrough: [
      { title: "Resolvers run", detail: "Each post's author resolver calls `load(authorId)` synchronously in the same tick." },
      { title: "Queue", detail: "The first call schedules a microtask; later calls just append to `pending`." },
      { title: "Flush", detail: "The microtask runs after the current synchronous work, sending all ids in one batch call (`WHERE id IN (1,2,3)`)." },
      { title: "Resolve", detail: "Results are matched back by position; real DataLoader also dedupes and caches per request." },
    ],
    followUps: [
      { q: "Why create a DataLoader per request?", a: "Its cache would otherwise leak data across users and become stale; per-request scope keeps batching benefits without cross-request consistency issues." },
      { q: "Can GraphQL responses be cached by a CDN?", a: "With GET + persisted queries (hash ids) yes; arbitrary POST queries generally aren't CDN-cacheable." },
      { q: "When would you pick gRPC over REST internally?", a: "High call volume, strict contracts across languages, streaming needs, and tolerance for binary payloads/HTTP/2 infrastructure." },
    ],
    pitfalls: [
      "Unbounded nested GraphQL queries (DoS)",
      "Global DataLoader instances",
      "Using tRPC for a public, multi-language API",
      "Returning 200 with errors for REST endpoints",
    ],
    glossary: [
      { term: "Resolver", definition: "Function that produces the value for one GraphQL field." },
      { term: "DataLoader", definition: "Utility that batches and caches loads within a request." },
      { term: "Persisted query", definition: "A pre-registered GraphQL query referenced by id/hash." },
    ],
    relatedLessons: ["backend/rest-graphql-grpc-trpc", "system-design/rest-api-design", "system-design/rpc-grpc", "backend/serialization"],
    relatedQuestions: ["db-05"],
  },
  // ═══════════════════════════════════════════ CLOUD
  {
    id: "cloud-01",
    track: "cloud",
    number: 1,
    question: "What is a container, how does Docker isolate it, and how is that different from a virtual machine?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["docker", "containers", "namespaces", "cgroups", "vm"],
    shortAnswer: "A container is an ordinary Linux process (or group of processes) that the kernel isolates and constrains. Namespaces give it its own view of the system — PID, network, mount, UTS (hostname), IPC, user — so it sees its own process tree, interfaces and filesystem root. Cgroups limit and account its CPU, memory, PIDs and I/O. The filesystem comes from a stack of read-only image layers plus a thin writable layer via a union filesystem like overlay2.\n\nA VM virtualises hardware and runs its own guest kernel on a hypervisor, so it has stronger isolation but boots slower and costs more memory. Containers share the host kernel: they start in milliseconds and are dense, but a kernel vulnerability or a privileged container weakens isolation — hence sandboxes like gVisor or Firecracker microVMs for untrusted multi-tenant code.",
    deep: [
      { type: "compare", items: [
        { title: "Container", points: ["Shares host kernel", "Namespaces + cgroups + seccomp/capabilities", "MB-sized images, ms startup", "Linux containers need a Linux kernel (Docker Desktop runs a VM on macOS/Windows)"] },
        { title: "Virtual machine", points: ["Own guest kernel on a hypervisor", "Hardware-level isolation boundary", "GB images, seconds to boot", "Any OS"] },
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Runtime layers", text: "`docker` CLI → dockerd → containerd → runc (an OCI runtime) which calls clone()/unshare() for namespaces and writes cgroup files. Kubernetes talks to containerd/CRI-O directly. Cgroup v2 (unified hierarchy) is the default on modern distros." },
    ],
    example: {
      type: "code",
      lang: "bash",
      caption: "PID namespace: the container sees itself as PID 1",
      code: `docker run --rm alpine ps -o pid,comm`,
      output: `PID   COMMAND
    1 ps`,
    },
    walkthrough: [
      { title: "New PID namespace", detail: "runc starts the process in a fresh PID namespace; the first process there is PID 1." },
      { title: "Host view", detail: "On the host the same process has an ordinary, larger PID — `ps` on the host shows it." },
      { title: "Implication", detail: "PID 1 has special signal semantics: it ignores signals without handlers by default, so apps should handle SIGTERM or run under a tiny init (`--init`, tini)." },
    ],
    followUps: [
      { q: "What happens when a container exceeds its memory limit?", a: "The cgroup OOM killer kills a process in it; Docker/Kubernetes report exit code 137 (128 + SIGKILL) / OOMKilled." },
      { q: "Why is running as root in a container risky?", a: "Without user namespaces, container root is host root (UID 0) constrained only by capabilities/seccomp; an escape or a mounted host path gives full access. Use a non-root USER and drop capabilities." },
    ],
    pitfalls: [
      "Calling containers 'lightweight VMs' and assuming VM-level isolation",
      "Running privileged containers or mounting the Docker socket",
      "Not handling SIGTERM as PID 1",
    ],
    glossary: [
      { term: "Namespace", definition: "Kernel feature giving a process an isolated view of a global resource." },
      { term: "cgroup", definition: "Control group: kernel mechanism to limit and account resource usage." },
      { term: "OverlayFS", definition: "Union filesystem merging read-only lower layers with a writable upper layer." },
    ],
    relatedLessons: ["cloud/docker", "os/processes-threads", "os/virtual-memory"],
    relatedQuestions: ["cloud-04"],
  },
  {
    id: "cloud-02",
    track: "cloud",
    number: 2,
    question: "Explain Kubernetes liveness, readiness and startup probes. What goes wrong when they're misconfigured?",
    level: "intermediate",
    frequency: "high",
    tags: ["kubernetes", "probes", "health-checks", "deployments"],
    shortAnswer: "All three are checks the kubelet runs against a container (HTTP GET, TCP, exec or gRPC). A failing **readiness** probe removes the pod from Service endpoints so it gets no traffic, but doesn't restart it — use it for 'I can serve right now' (warming caches, draining, temporarily overloaded). A failing **liveness** probe makes the kubelet restart the container — use it only for 'I'm stuck and can't recover', like a deadlock. A **startup** probe gates the other two until the app has started, so slow boots aren't killed.\n\nThe classic mistake is a liveness probe that checks dependencies like the database: when the DB blips, every pod restarts at once and turns a partial outage into a total one. Other mistakes: no readiness probe (traffic before the app is ready), too-aggressive timeouts under load, and identical endpoints for liveness and readiness.",
    deep: [
      { type: "table", head: ["Probe", "On failure", "Should check"], rows: [
        ["startup", "Container restarted after failureThreshold × periodSeconds; other probes wait until it succeeds", "Process finished initialising"],
        ["readiness", "Removed from Service endpoints (no restart)", "Can serve requests now (may include critical deps, carefully)"],
        ["liveness", "Container killed and restarted", "Process itself is healthy (event loop responsive), not dependencies"],
      ] },
      { type: "p", text: "Rolling updates also rely on readiness: a new pod counts as available only once ready, which is what makes `maxUnavailable`/`maxSurge` safe." },
    ],
    example: {
      type: "code",
      lang: "yaml",
      caption: "Sensible probe configuration",
      code: `containers:
  - name: api
    image: ghcr.io/acme/api:1.4.2
    ports: [{ containerPort: 8080 }]
    startupProbe:
      httpGet: { path: /healthz, port: 8080 }
      periodSeconds: 5
      failureThreshold: 24        # up to 120 s to start
    readinessProbe:
      httpGet: { path: /readyz, port: 8080 }
      periodSeconds: 5
      failureThreshold: 2
    livenessProbe:
      httpGet: { path: /healthz, port: 8080 }   # process-only check
      periodSeconds: 10
      timeoutSeconds: 2
      failureThreshold: 3`,
    },
    walkthrough: [
      { title: "Boot", detail: "Only the startup probe runs; the app has 120 s to answer /healthz." },
      { title: "Started", detail: "Liveness and readiness begin. The pod joins endpoints after /readyz passes." },
      { title: "Overload / dependency issue", detail: "/readyz fails twice → traffic shifts to other pods; no restart." },
      { title: "Deadlock", detail: "/healthz times out 3 times (~30 s) → kubelet restarts the container." },
    ],
    followUps: [
      { q: "How do you avoid dropped requests during shutdown?", a: "On SIGTERM, start failing readiness / stop accepting new work, keep serving in-flight requests, and exit before terminationGracePeriodSeconds; a short preStop sleep helps because endpoint removal propagates asynchronously." },
      { q: "Should readiness check the database?", a: "Only if the pod truly can't do anything useful without it — and remember that if all pods go unready together, the Service has no endpoints. Many teams prefer degraded responses over failing readiness for shared dependencies." },
    ],
    pitfalls: [
      "Liveness depending on downstream services",
      "No startup probe for slow-starting apps (crash loops)",
      "Timeouts shorter than GC pauses or load spikes",
    ],
    glossary: [
      { term: "kubelet", definition: "Node agent that runs pods and executes probes." },
      { term: "Endpoints / EndpointSlice", definition: "The set of ready pod IPs behind a Service." },
      { term: "CrashLoopBackOff", definition: "Pod state when a container repeatedly fails and restarts with increasing delay." },
    ],
    relatedLessons: ["cloud/kubernetes", "system-design/health-checks-heartbeats", "go/graceful-shutdown"],
    relatedQuestions: ["cloud-03"],
  },
  {
    id: "cloud-03",
    track: "cloud",
    number: 3,
    question: "Walk through how an external HTTP request reaches a pod in Kubernetes.",
    level: "intermediate",
    frequency: "high",
    tags: ["kubernetes", "ingress", "service", "kube-proxy", "networking"],
    shortAnswer: "DNS for the hostname resolves to a cloud load balancer, typically created for the ingress controller's Service of type LoadBalancer. The LB forwards to the ingress controller pods (NGINX, Traefik, a cloud controller or a Gateway API implementation), which terminate TLS and match the Host and path against Ingress rules to choose a backend Service.\n\nThe controller usually routes straight to the Service's ready pod IPs from EndpointSlices; otherwise traffic hits the Service's virtual ClusterIP, where kube-proxy's iptables/IPVS rules (or an eBPF dataplane like Cilium) DNAT it to one ready pod. The CNI plugin's pod network carries the packet to that pod, possibly on another node, and the container receives it on its port.",
    deep: [
      { type: "viz", id: "sys-request-flow", caption: "General request path; in Kubernetes the 'LB → app' hop expands to LB → ingress controller → Service → pod" },
      { type: "flow", nodes: ["DNS", "Cloud LB", "Ingress controller (TLS, host/path rules)", "Service (ClusterIP / endpoints)", "Pod"], caption: "Conceptual" },
      { type: "callout", tone: "spec-vs-impl", title: "Implementation-dependent", text: "An Ingress object does nothing without an ingress controller. Whether traffic goes via NodePorts, directly to pod IPs (cloud 'container-native' LB), through kube-proxy iptables, IPVS or eBPF depends on the cluster's controller and CNI. The Gateway API is the newer, more expressive successor to Ingress." },
    ],
    example: {
      type: "code",
      lang: "yaml",
      caption: "Ingress → Service → Pods",
      code: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata: { name: shop }
spec:
  ingressClassName: nginx
  tls: [{ hosts: [shop.example.com], secretName: shop-tls }]
  rules:
    - host: shop.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend: { service: { name: api, port: { number: 80 } } }
---
apiVersion: v1
kind: Service
metadata: { name: api }
spec:
  selector: { app: api }          # pods with this label (and Ready) become endpoints
  ports: [{ port: 80, targetPort: 8080 }]`,
    },
    walkthrough: [
      { title: "GET https://shop.example.com/api/cart", detail: "DNS → LB IP; LB → ingress controller pod." },
      { title: "TLS + routing", detail: "Controller uses secret shop-tls, matches host + /api prefix → Service api:80." },
      { title: "Endpoint selection", detail: "Chooses a ready pod with label app=api, forwards to port 8080." },
      { title: "Pod network", detail: "CNI routes the packet to the pod's IP on whichever node it runs." },
    ],
    followUps: [
      { q: "ClusterIP vs NodePort vs LoadBalancer?", a: "ClusterIP: internal virtual IP only. NodePort: opens a port on every node forwarding to the Service. LoadBalancer: provisions a cloud LB pointing at the Service (built on NodePort or direct pod routing)." },
      { q: "How do pods find each other?", a: "Cluster DNS (CoreDNS): `api.default.svc.cluster.local` resolves to the Service's ClusterIP (or pod IPs for headless Services)." },
    ],
    pitfalls: [
      "Creating an Ingress without an installed controller",
      "Selector labels that don't match pod labels (Service with no endpoints)",
      "Mixing up `port` and `targetPort`",
    ],
    glossary: [
      { term: "Ingress controller", definition: "A reverse proxy deployment that implements Ingress rules." },
      { term: "kube-proxy", definition: "Node component programming iptables/IPVS rules for Service virtual IPs." },
      { term: "CNI", definition: "Container Network Interface: plugin providing pod networking." },
    ],
    relatedLessons: ["cloud/kubernetes", "networks/dns", "system-design/dns-tcp-lb-firewalls", "system-design/service-discovery"],
    relatedQuestions: ["cloud-02"],
  },
  {
    id: "cloud-04",
    track: "cloud",
    number: 4,
    question: "How do Docker image layers and the build cache work, and why use multi-stage builds?",
    level: "intermediate",
    frequency: "high",
    tags: ["docker", "layers", "build-cache", "multi-stage"],
    shortAnswer: "Each filesystem-changing Dockerfile instruction (RUN, COPY, ADD) produces a content-addressed layer; the image is the ordered stack of layers plus config. When building, a step is reused from cache if its instruction and inputs (including the checksums of copied files) match and every previous step was cached — the first change invalidates everything after it. So I copy dependency manifests and install dependencies before copying the source, so code edits don't reinstall packages.\n\nMulti-stage builds use a full toolchain image to compile or bundle, then `COPY --from=build` only the artifacts into a minimal runtime image. The result is smaller, has fewer packages to patch, and doesn't ship compilers, dev dependencies or build secrets.",
    deep: [
      { type: "list", items: [
        "Deleting a file in a later layer doesn't shrink the image — the bytes remain in the earlier layer. Clean up in the same RUN.",
        "`.dockerignore` keeps node_modules, .git and secrets out of the build context (and out of cache keys).",
        "BuildKit adds cache mounts (`RUN --mount=type=cache`) and secret mounts that never land in layers.",
        "Pin base images by tag + digest for reproducibility.",
      ] },
    ],
    example: {
      type: "code",
      lang: "text",
      caption: "Dockerfile: cache-friendly, multi-stage Node build",
      code: `FROM node:22-slim AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build && pnpm prune --prod

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "dist/server.js"]`,
    },
    walkthrough: [
      { title: "Manifest-only COPY", detail: "Install step's cache key depends only on package.json + lockfile, so it's reused until dependencies change." },
      { title: "COPY . . then build", detail: "Source edits invalidate only these later steps." },
      { title: "Runtime stage", detail: "Starts fresh from the slim base; only production node_modules and dist are copied — no source, dev deps or build tools." },
      { title: "USER node", detail: "Runs as non-root." },
    ],
    followUps: [
      { q: "How do you share cache in CI where runners are ephemeral?", a: "Export/import BuildKit cache to a registry or the CI cache (`--cache-to/--cache-from type=registry` or `type=gha`)." },
      { q: "Distroless or Alpine?", a: "Distroless/slim reduces attack surface; Alpine uses musl libc, which can cause subtle compatibility/performance differences for some native modules. Choose based on your runtime's needs." },
    ],
    pitfalls: [
      "`COPY . .` before installing dependencies",
      "Secrets passed via ARG/ENV (persist in image history)",
      "Using `latest` tags for base images",
    ],
    glossary: [
      { term: "Layer", definition: "A content-addressed filesystem diff produced by a build step." },
      { term: "Build context", definition: "The set of files sent to the builder, filtered by .dockerignore." },
      { term: "Multi-stage build", definition: "A Dockerfile with several FROM stages, copying artifacts between them." },
    ],
    relatedLessons: ["cloud/docker", "cloud/ci-cd", "production/build-performance"],
    relatedQuestions: ["cloud-01"],
  },

  // ═══════════════════════════════════════════ AI
  {
    id: "ai-01",
    track: "ai",
    number: 1,
    question: "How does a large language model generate text, and what do temperature and top-p actually do?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["llm", "tokens", "sampling", "temperature", "kv-cache"],
    shortAnswer: "Text is split into tokens (sub-word pieces). The model — a decoder-only transformer — reads the token sequence and outputs a score (logit) for every token in its vocabulary as the next token. Those logits are turned into probabilities with softmax, one token is chosen, appended, and the loop repeats until a stop token or length limit. The prompt is processed in parallel once (prefill); each new token then reuses cached keys and values for earlier tokens (the KV cache), so generation costs one step per output token.\n\nTemperature divides the logits before softmax: below 1 sharpens the distribution toward the top token, above 1 flattens it, and near 0 approaches greedy decoding. Top-p (nucleus) sampling keeps the smallest set of tokens whose probabilities sum to p and samples among them, cutting off the long tail. Neither changes what the model knows — only how it picks among its own predictions.",
    deep: [
      { type: "steps", steps: [
        { title: "Tokenize", detail: "Prompt → token ids (e.g. BPE)." },
        { title: "Prefill", detail: "All prompt tokens processed in parallel; KV cache filled." },
        { title: "Decode loop", detail: "Logits for next token → temperature/top-k/top-p → sample → append → repeat." },
        { title: "Stop", detail: "End-of-sequence token, stop sequence, or max tokens." },
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Provider differences", text: "Tokenizers, default sampling parameters, maximum context windows and whether temperature 0 is fully deterministic differ by model and provider (batching and floating-point non-determinism can still vary outputs). Check the API docs for the model you use." },
    ],
    example: {
      type: "code",
      lang: "js",
      caption: "Softmax with temperature over three candidate next tokens",
      code: `const logits = { Paris: 4.0, Lyon: 2.0, London: 1.0 };
function softmax(obj, T) {
  const exps = Object.entries(obj).map(([k, v]) => [k, Math.exp(v / T)]);
  const sum = exps.reduce((s, [, e]) => s + e, 0);
  return exps.map(([k, e]) => \`\${k}=\${(e / sum).toFixed(3)}\`).join(" ");
}
for (const T of [0.5, 1, 2]) console.log(\`T=\${T}: \${softmax(logits, T)}\`);`,
      output: `T=0.5: Paris=0.980 Lyon=0.018 London=0.002
T=1: Paris=0.844 Lyon=0.114 London=0.042
T=2: Paris=0.629 Lyon=0.231 London=0.140`,
    },
    walkthrough: [
      { title: "T = 0.5", detail: "Logits doubled before softmax → gaps widen → 'Paris' ~98%." },
      { title: "T = 1", detail: "The model's raw distribution." },
      { title: "T = 2", detail: "Logits halved → flatter → unlikely tokens sampled far more often (more 'creative', more errors)." },
      { title: "Top-p = 0.9 at T=1", detail: "Paris (0.844) + Lyon (0.114) = 0.958 ≥ 0.9 → London is excluded from sampling." },
    ],
    followUps: [
      { q: "Why are output tokens usually priced higher and slower than input tokens?", a: "Input is processed in one parallel prefill pass; output is generated sequentially, one forward pass per token, which is memory-bandwidth-bound and harder to batch." },
      { q: "What limits context length?", a: "Attention cost grows with sequence length (quadratically for vanilla attention) and the KV cache grows linearly per token per layer, consuming GPU memory; models are also only reliable up to lengths they were trained/extended for." },
    ],
    pitfalls: [
      "Equating temperature 0 with guaranteed determinism",
      "Counting words instead of tokens for limits and cost",
      "Thinking higher temperature makes the model 'smarter'",
    ],
    glossary: [
      { term: "Token", definition: "A unit of text (often a sub-word) the model reads and predicts." },
      { term: "Logit", definition: "Unnormalised score for each vocabulary token before softmax." },
      { term: "KV cache", definition: "Stored attention keys/values of previous tokens reused during generation." },
    ],
    relatedLessons: ["ai/llm-internals", "ai/transformers", "ai/prompt-engineering"],
    relatedQuestions: ["ai-04"],
  },
  {
    id: "ai-02",
    track: "ai",
    number: 2,
    question: "What is RAG? When would you use RAG vs fine-tuning vs a plain LLM call, and how do you evaluate a RAG system?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["rag", "fine-tuning", "retrieval", "evaluation", "embeddings"],
    shortAnswer: "Retrieval-Augmented Generation retrieves relevant passages from your own data at query time — via vector, keyword or hybrid search, often with a reranker — and puts them in the prompt so the model answers grounded in them, ideally with citations. It's the right tool when knowledge is private, large or changes often, and when you need traceability.\n\nFine-tuning changes the model's weights to teach behaviour, format, tone or a narrow task; it's poor at injecting frequently changing facts. A plain LLM call is enough when the task needs only general knowledge or everything fits in the prompt. I evaluate retrieval and generation separately: retrieval with recall@k and MRR on a labelled question set, generation with faithfulness/groundedness, answer relevance and correctness — using human review plus LLM-as-judge checks — and I track latency and cost.",
    deep: [
      { type: "flow", nodes: ["Docs", "Chunk", "Embed", "Vector index"], caption: "Indexing (offline)" },
      { type: "flow", nodes: ["Question", "Embed / rewrite", "Hybrid retrieve top-k", "Rerank", "Prompt with context", "LLM answer + citations"], caption: "Query time" },
      { type: "table", head: ["Approach", "Good for", "Weak at"], rows: [
        ["Plain LLM", "General knowledge, transformation tasks", "Private or fresh facts"],
        ["RAG", "Private, changing, citeable knowledge", "Retrieval misses; context limits"],
        ["Fine-tuning", "Style, format, domain behaviour, smaller/cheaper models", "Updating facts; traceability"],
      ] },
      { type: "p", text: "These combine: a fine-tuned model can still use RAG. Most failures are retrieval failures (wrong chunking, missing keyword matches, no reranking), so measure retrieval first." },
    ],
    example: {
      type: "code",
      lang: "js",
      caption: "Recall@k and MRR for a tiny labelled eval set",
      code: `const evals = [
  { relevant: "d3", retrieved: ["d3", "d7", "d1"] },
  { relevant: "d5", retrieved: ["d2", "d5", "d9"] },
  { relevant: "d8", retrieved: ["d1", "d2", "d4"] },
];
const k = 3;
const recall = evals.filter((e) => e.retrieved.slice(0, k).includes(e.relevant)).length / evals.length;
const mrr = evals.reduce((s, e) => {
  const r = e.retrieved.indexOf(e.relevant);
  return s + (r === -1 ? 0 : 1 / (r + 1));
}, 0) / evals.length;
console.log(\`recall@\${k}=\${recall.toFixed(2)} MRR=\${mrr.toFixed(2)}\`);`,
      output: "recall@3=0.67 MRR=0.50",
    },
    walkthrough: [
      { title: "Question 1", detail: "Relevant doc at rank 1 → hit, reciprocal rank 1." },
      { title: "Question 2", detail: "Rank 2 → hit, reciprocal rank 0.5." },
      { title: "Question 3", detail: "Not retrieved → miss, 0." },
      { title: "Aggregate", detail: "Recall@3 = 2/3 ≈ 0.67; MRR = (1 + 0.5 + 0) / 3 = 0.50. Improve retrieval before tuning prompts." },
    ],
    followUps: [
      { q: "How do you choose chunk size?", a: "Experiment against your eval set: too small loses context, too large dilutes embeddings and wastes the prompt budget. Split on document structure (headings, paragraphs) with modest overlap, and store metadata for filtering and citations." },
      { q: "Why hybrid search?", a: "Dense embeddings capture meaning but miss exact identifiers (error codes, SKUs); BM25 keyword search catches them. Fusing results (e.g. reciprocal rank fusion) then reranking with a cross-encoder improves precision." },
      { q: "How do you reduce hallucinations?", a: "Instruct the model to answer only from the context and say when it doesn't know, require citations, check groundedness automatically, and improve retrieval recall." },
    ],
    pitfalls: [
      "Evaluating only end answers by eyeballing a few examples",
      "Fine-tuning to add facts that change weekly",
      "Stuffing too many chunks ('lost in the middle', cost)",
      "Ignoring access control on retrieved documents",
    ],
    glossary: [
      { term: "Recall@k", definition: "Fraction of queries whose relevant item appears in the top k results." },
      { term: "MRR", definition: "Mean reciprocal rank of the first relevant result." },
      { term: "Reranker", definition: "A model (often a cross-encoder) that re-scores retrieved candidates against the query." },
    ],
    relatedLessons: ["ai/rag", "ai/vector-databases", "ai/prompt-engineering"],
    relatedQuestions: ["ai-03"],
  },
  {
    id: "ai-03",
    track: "ai",
    number: 3,
    question: "How do vector databases find similar items quickly? Explain embeddings, similarity metrics and HNSW.",
    level: "advanced",
    frequency: "high",
    tags: ["vector-database", "embeddings", "ann", "hnsw", "ivf", "pgvector"],
    shortAnswer: "An embedding model maps text (or images) to a fixed-length vector so that semantically similar inputs are close together. Similarity is measured with cosine similarity, dot product or Euclidean distance — for normalised vectors they produce the same ranking. Exact nearest-neighbour search compares the query with every vector, O(n·d), which is too slow at millions of vectors.\n\nVector databases use approximate nearest-neighbour (ANN) indexes. HNSW builds a multi-layer proximity graph: sparse upper layers for long jumps, dense bottom layer for fine search; a query greedily walks toward closer neighbours layer by layer, giving roughly logarithmic search with high recall, tuned by M (links per node), ef_construction and ef_search. IVF clusters vectors and searches only the nearest clusters (nprobe). The trade-off is recall vs latency vs memory, and metadata filtering interacts badly with ANN if done naively.",
    deep: [
      { type: "table", head: ["Index", "Idea", "Knobs", "Trade-off"], rows: [
        ["Flat (exact)", "Compare to all vectors", "—", "Perfect recall, O(n) per query"],
        ["HNSW", "Hierarchical navigable small-world graph", "M, ef_construction, ef_search", "Fast, high recall; memory-heavy, slower builds"],
        ["IVF", "k-means clusters, search nprobe nearest lists", "lists, nprobe", "Less memory; needs training; recall depends on nprobe"],
        ["PQ / quantisation", "Compress vectors into codes", "subvectors, bits", "Much less memory; lower accuracy"],
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Filtering", text: "Post-filtering ANN results (e.g. tenant_id = 7) can return fewer than k matches; pre-filtering can break graph traversal. Engines differ (pgvector added iterative index scans in 0.8.0; others use filtered HNSW or partitioned indexes) — check your engine's docs." },
    ],
    example: {
      type: "code",
      lang: "js",
      caption: "Exact cosine-similarity ranking (what ANN approximates)",
      code: `const cos = (a, b) => {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] ** 2; nb += b[i] ** 2; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
};
const query = [0.9, 0.1, 0.0];
const docs = { refunds: [0.8, 0.2, 0.1], shipping: [0.1, 0.9, 0.2], pricing: [0.5, 0.5, 0.0] };
const ranked = Object.entries(docs)
  .map(([id, v]) => [id, cos(query, v)])
  .sort((x, y) => y[1] - x[1]);
for (const [id, s] of ranked) console.log(id, s.toFixed(3));`,
      output: `refunds 0.984
pricing 0.781
shipping 0.214`,
    },
    walkthrough: [
      { title: "Toy 3-d embeddings", detail: "Real embeddings have hundreds to thousands of dimensions; the math is identical." },
      { title: "Cosine", detail: "Dot product divided by both lengths → angle-based similarity in [-1, 1]." },
      { title: "Ranking", detail: "The query is closest in direction to 'refunds'." },
      { title: "At scale", detail: "HNSW/IVF avoid computing this against every vector, accepting that the true top-k is occasionally missed." },
    ],
    followUps: [
      { q: "Do you need a dedicated vector database?", a: "Not always. pgvector in Postgres is enough for many apps (transactions, joins, filters with your existing data); dedicated engines help at very large scale or with advanced filtering/hybrid features." },
      { q: "What happens when you change embedding models?", a: "Vectors from different models aren't comparable — you must re-embed the whole corpus and rebuild the index." },
    ],
    pitfalls: [
      "Mixing embeddings from different models or versions",
      "Using a distance metric different from the one the model was trained for",
      "Never measuring ANN recall against exact search",
    ],
    glossary: [
      { term: "Embedding", definition: "A dense vector representation of an input capturing semantic similarity." },
      { term: "ANN", definition: "Approximate nearest-neighbour search: trades exactness for speed." },
      { term: "HNSW", definition: "Hierarchical Navigable Small World graph index for ANN search." },
    ],
    relatedLessons: ["ai/vector-databases", "ai/rag", "databases/indexing"],
    relatedQuestions: ["ai-02"],
  },
  {
    id: "ai-04",
    track: "ai",
    number: 4,
    question: "Explain self-attention in a transformer. Why is it scaled by √d_k, and what is the KV cache?",
    level: "advanced",
    frequency: "high",
    tags: ["transformer", "attention", "kv-cache", "llm"],
    shortAnswer: "Each token's vector is projected into a query, a key and a value. A token's query is compared (dot product) with every key to measure how relevant each other token is; softmax turns those scores into weights, and the token's output is the weighted sum of the values. That lets every position pull information from any other position in one step, and multi-head attention does this in several learned subspaces at once. In decoder LLMs a causal mask prevents attending to future tokens.\n\nScores are divided by √d_k because dot products of d_k-dimensional vectors grow in magnitude with d_k; large scores push softmax into saturated regions with tiny gradients. During generation, keys and values of past tokens never change, so they're cached per layer — the KV cache — and each new token only computes its own Q, K, V. That makes decoding linear per token, but the cache's memory grows with sequence length, layers and batch size.",
    deep: [
      { type: "p", text: "Formula (Vaswani et al., 2017): `Attention(Q, K, V) = softmax(QKᵀ / √d_k) V`." },
      { type: "list", items: [
        "Cost of the score matrix is O(n²·d) for n tokens — the reason long contexts are expensive.",
        "KV cache size ≈ 2 × layers × kv_heads × head_dim × tokens × bytes per value (per sequence).",
        "Grouped-query / multi-query attention share K/V across heads to shrink the cache.",
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Architecture variants", text: "Positional encoding (sinusoidal, learned, RoPE), normalisation placement, attention variants (GQA, sliding window) and kernels (FlashAttention) differ between models; the core QKV mechanism is shared." },
    ],
    example: {
      type: "code",
      lang: "js",
      caption: "Attention for the 3rd token of a 3-token sequence (d_k = 2)",
      code: `const softmax = (xs) => { const m = Math.max(...xs); const e = xs.map((x) => Math.exp(x - m)); const s = e.reduce((a, b) => a + b); return e.map((x) => x / s); };
const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
const Q = [[1, 0], [0, 1], [1, 1]];
const K = [[1, 0], [0, 1], [1, 1]];
const V = [[1, 0], [0, 1], [0.5, 0.5]];
const dk = 2;
const q = Q[2];
const weights = softmax(K.map((k) => dot(q, k) / Math.sqrt(dk)));
const out = [0, 1].map((j) => weights.reduce((s, w, i) => s + w * V[i][j], 0));
console.log("weights", weights.map((w) => w.toFixed(3)).join(" "));
console.log("output", out.map((x) => x.toFixed(3)).join(" "));`,
      output: `weights 0.248 0.248 0.503
output 0.500 0.500`,
    },
    walkthrough: [
      { title: "Scores", detail: "q·k = 1, 1, 2 → scaled by 1/√2 → 0.707, 0.707, 1.414." },
      { title: "Softmax", detail: "Weights 0.248, 0.248, 0.503 — the token attends most to itself." },
      { title: "Weighted sum", detail: "0.248·[1,0] + 0.248·[0,1] + 0.503·[0.5,0.5] = [0.5, 0.5]." },
      { title: "Generation", detail: "When token 4 arrives, K and V rows for tokens 1–3 are reused from the KV cache." },
    ],
    followUps: [
      { q: "What does multi-head attention add?", a: "Several attention operations in parallel with separate projections, letting heads specialise (syntax, coreference, position) before outputs are concatenated and projected." },
      { q: "Why does a long prompt increase time-to-first-token?", a: "Prefill must compute attention over all prompt tokens (quadratic in length for vanilla attention) and fill the KV cache before the first output token." },
    ],
    pitfalls: [
      "Saying attention is O(n) — vanilla self-attention is O(n²) in sequence length",
      "Forgetting the causal mask in decoder models",
      "Ignoring KV-cache memory when estimating serving capacity",
    ],
    glossary: [
      { term: "Query / Key / Value", definition: "Learned projections of token vectors used to compute and apply attention weights." },
      { term: "Causal mask", definition: "Prevents positions from attending to later positions." },
      { term: "Multi-head attention", definition: "Parallel attention computations in different learned subspaces." },
    ],
    relatedLessons: ["ai/transformers", "ai/llm-internals"],
    relatedQuestions: ["ai-01"],
    sources: [{ label: "Vaswani et al., Attention Is All You Need (arXiv 1706.03762)", url: "https://arxiv.org/abs/1706.03762", kind: "external" }],
  },
];
