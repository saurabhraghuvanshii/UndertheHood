import type { Lesson, Track } from "../types";

/**
 * Database systems and DBMS track: relational model, indexing, transactions/MVCC,
 * replication, partitioning, psql, ORMs/ODMs, Prisma, connection pooling and scaling.
 */

const pg = (label: string, path: string) => ({ label, url: `https://www.postgresql.org/docs/current/${path}`, kind: "docs" as const });

export const track: Track = {
  slug: "databases",
  title: "Database systems and DBMS",
  tagline: "From tables and SQL to B+trees, MVCC, WAL replication and connection pools.",
  description:
    "How a relational database actually stores, finds and protects your data. Start with the relational model and SQL, then open the hood: B+tree indexes and EXPLAIN, transactions and PostgreSQL's MVCC, write-ahead logging and streaming replication, partitioning and sharding. Finish with the application side — ORMs vs ODMs, Prisma's trade-offs, connection pooling (PgBouncer, serverless pitfalls) and a playbook for scaling a database.",
  modules: [
    {
      id: "db-foundations",
      title: "Foundations",
      summary: "The relational model, SQL basics and driving PostgreSQL from the psql CLI.",
      lessons: ["relational-model-sql", "psql-cli"],
    },
    {
      id: "db-internals",
      title: "Storage engine internals",
      summary: "B+tree indexes and query plans, transactions, isolation and MVCC.",
      lessons: ["indexing", "transactions-acid"],
    },
    {
      id: "db-availability-scale",
      title: "Replication, partitioning and scale",
      summary: "WAL and streaming replication, partitioning and sharding, and an end-to-end scaling playbook.",
      lessons: ["postgres-replication", "partitioning-sharding", "database-scaling"],
    },
    {
      id: "db-application",
      title: "Databases from the application",
      summary: "ORMs vs ODMs, Prisma in depth, and why connection pooling matters (especially on serverless).",
      lessons: ["orm-vs-odm", "prisma", "connection-pooling"],
    },
  ],
  milestones: [
    {
      id: "db-index-lab",
      title: "Index and query-plan lab",
      summary: "Load a realistic dataset into PostgreSQL and make slow queries fast using EXPLAIN (ANALYZE, BUFFERS).",
      level: "intermediate",
      requirements: [
        "Seed a table with at least 1 million rows (e.g. orders with customer_id, status, created_at)",
        "Capture EXPLAIN (ANALYZE, BUFFERS) for 3 slow queries before any index exists",
        "Add single-column, composite and partial indexes; justify column order for the composite one",
        "Show the before/after plans and explain why the planner switched (or refused to switch) to an index",
      ],
      stretch: ["Demonstrate an index-only scan and the effect of VACUUM on the visibility map", "Measure write slowdown caused by each extra index"],
      exercises: ["databases/indexing", "databases/psql-cli", "databases/relational-model-sql"],
    },
    {
      id: "db-replica-lab",
      title: "Primary + streaming replica with read routing",
      summary: "Run a primary and a hot-standby replica (Docker Compose is fine), route reads to the replica and observe replication lag.",
      level: "advanced",
      requirements: [
        "Configure a physical streaming replica using pg_basebackup and a replication slot",
        "Query pg_stat_replication on the primary and report write/flush/replay lag",
        "In the app, send writes to the primary and reads to the replica; demonstrate a read-your-writes anomaly",
        "Fix the anomaly for one endpoint (e.g. read from primary for N seconds after a write)",
      ],
      stretch: ["Switch to synchronous_commit = remote_apply for one transaction and measure latency", "Promote the replica and document the failover steps"],
      exercises: ["databases/postgres-replication", "databases/transactions-acid", "system-design/replication"],
    },
    {
      id: "db-pooling-lab",
      title: "Connection pooling under load",
      summary: "Put PgBouncer in front of PostgreSQL and load-test an API to compare direct connections vs pooled ones.",
      level: "intermediate",
      requirements: [
        "Load-test an endpoint with 500 concurrent clients against a database with max_connections = 100",
        "Add PgBouncer in transaction mode and repeat; record errors, p50 and p99 latency",
        "Explain which session features break in transaction mode and how your app avoids them",
      ],
      stretch: ["Repeat with Prisma and its connection_limit / pgbouncer=true settings"],
      exercises: ["databases/connection-pooling", "databases/prisma", "databases/orm-vs-odm"],
    },
  ],
  sources: [
    pg("PostgreSQL documentation (current)", ""),
    pg("PostgreSQL: Indexes", "indexes.html"),
    pg("PostgreSQL: Concurrency Control (MVCC)", "mvcc.html"),
    pg("PostgreSQL: High Availability, Load Balancing, and Replication", "high-availability.html"),
    pg("PostgreSQL: Table Partitioning", "ddl-partitioning.html"),
    pg("PostgreSQL: psql", "app-psql.html"),
    { label: "Use The Index, Luke! (Markus Winand)", url: "https://use-the-index-luke.com/", kind: "external" },
    { label: "PgBouncer documentation", url: "https://www.pgbouncer.org/usage.html", kind: "docs" },
    { label: "Prisma documentation", url: "https://www.prisma.io/docs", kind: "docs" },
    { label: "Designing Data-Intensive Applications (Kleppmann), ch. 3, 5, 6, 7", kind: "external" },
  ],
};

export const lessons: Lesson[] = [
  // ───────────────────────────────────────────── relational-model-sql
  {
    slug: "relational-model-sql",
    track: "databases",
    title: "The relational model and SQL basics",
    summary: "Relations, keys and constraints, and the core SQL you need: SELECT, JOINs, GROUP BY, and the logical order a query is evaluated in.",
    level: "beginner",
    frequency: "very-high",
    minutes: 30,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: [],
    related: ["system-design/sql-vs-nosql", "system-design/data-modeling", "system-design/normalization-denormalization", "databases/indexing"],
    tags: ["sql", "relational", "joins", "keys", "postgres"],
    sources: [
      pg("PostgreSQL tutorial: The SQL Language", "tutorial-sql.html"),
      pg("PostgreSQL: Constraints", "ddl-constraints.html"),
      pg("PostgreSQL: SELECT", "sql-select.html"),
      { label: "E. F. Codd, A Relational Model of Data for Large Shared Data Banks (1970)", url: "https://dl.acm.org/doi/10.1145/362384.362685", kind: "external" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [{ type: "list", items: [
          "Explain relations, tuples, attributes, primary keys and foreign keys",
          "Write SELECT queries with WHERE, JOIN, GROUP BY / HAVING and ORDER BY",
          "Know the *logical* evaluation order of a SELECT and why `WHERE` can't see a SELECT alias",
          "Pick the right JOIN (INNER vs LEFT) and avoid accidental row multiplication",
        ] }],
      },
      {
        id: "intuition",
        blocks: [
          { type: "p", text: "A relational database stores facts as rows in tables. Each table describes one kind of thing (users, orders), each row is one fact, and relationships are expressed by *values* (an order row stores the `user_id`) rather than by pointers." },
          { type: "p", text: "SQL is **declarative**: you describe the result you want, and the query planner decides how to get it (which index, which join algorithm). That separation is why the same query can go from 10 s to 10 ms after adding an index — without changing the SQL." },
        ],
      },
      {
        id: "definition",
        blocks: [
          { type: "table", head: ["Term", "Meaning"], rows: [
            ["Relation (table)", "A set of tuples sharing the same attributes (columns)"],
            ["Primary key", "Column(s) that uniquely identify a row; implies NOT NULL + UNIQUE (and an index in Postgres)"],
            ["Foreign key", "Column(s) whose values must exist in another table's key — enforced referential integrity"],
            ["Constraint", "A rule the DB enforces on every write: NOT NULL, UNIQUE, CHECK, FOREIGN KEY, EXCLUDE"],
            ["NULL", "\"Unknown/absent\". Comparisons with NULL yield NULL (not true), so use `IS NULL`"],
          ] },
        ],
      },
      {
        id: "internals",
        title: "Logical query evaluation order",
        blocks: [
          { type: "steps", steps: [
            { title: "FROM / JOIN", detail: "Build the input row set." },
            { title: "WHERE", detail: "Filter individual rows (aggregates not available yet)." },
            { title: "GROUP BY", detail: "Collapse rows into groups." },
            { title: "HAVING", detail: "Filter groups (aggregates available)." },
            { title: "SELECT", detail: "Compute output expressions and aliases." },
            { title: "DISTINCT", detail: "Remove duplicates." },
            { title: "ORDER BY", detail: "Sort (aliases are visible here)." },
            { title: "LIMIT / OFFSET", detail: "Trim the result." },
          ] },
          { type: "callout", tone: "spec-vs-impl", title: "Logical, not physical", text: "This is the *semantic* order. The planner is free to reorder physically — pushing filters into scans, choosing hash vs merge vs nested-loop joins — as long as the result is the same." },
        ],
      },
      {
        id: "examples",
        blocks: [
          { type: "code", lang: "sql", caption: "Schema, a LEFT JOIN and an aggregate", code: `CREATE TABLE users (
  id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email text NOT NULL UNIQUE
);
CREATE TABLE orders (
  id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES users(id),
  total   numeric(10,2) NOT NULL CHECK (total >= 0)
);
INSERT INTO users (email) VALUES ('a@x.io'), ('b@x.io');
INSERT INTO orders (user_id, total) VALUES (1, 10), (1, 5);

SELECT u.email, count(o.id) AS n, coalesce(sum(o.total), 0) AS spent
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.email
ORDER BY u.email;`, output: ` email  | n | spent
--------+---+-------
 a@x.io | 2 | 15.00
 b@x.io | 0 |     0
(2 rows)` },
          { type: "p", text: "`count(o.id)` counts non-NULL values, so the user with no orders gets 0. `count(*)` would have returned 1 for `b@x.io`, because the LEFT JOIN still produces one row with NULL order columns." },
        ],
      },
      {
        id: "mistakes",
        blocks: [{ type: "list", items: [
          "`WHERE col = NULL` — always NULL (never true); use `IS NULL`",
          "Filtering a LEFT JOIN's right table in `WHERE` (turns it into an INNER JOIN); put the condition in `ON` instead",
          "Joining two one-to-many tables at once and summing — rows multiply (fan-out) and totals inflate",
          "`NOT IN (subquery)` when the subquery can return NULL — returns no rows; prefer `NOT EXISTS`",
        ] }],
      },
      {
        id: "interview-short",
        blocks: [{ type: "p", text: "The relational model stores data as tables of rows linked by key values, with constraints (PK, FK, UNIQUE, CHECK) enforced by the database. SQL is declarative: I describe the result, the planner picks the access paths. Logically a SELECT runs FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT, which explains why aggregates can't be used in WHERE and aliases can be used in ORDER BY." }],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: [
          "Tables + keys + constraints; relationships are values, not pointers",
          "SQL is declarative; the planner decides the physical plan",
          "Know the logical evaluation order and NULL's three-valued logic",
        ] }],
      },
    ],
    glossary: [
      { term: "Tuple", definition: "A row: one ordered set of attribute values." },
      { term: "Referential integrity", definition: "Guarantee that every foreign-key value points to an existing row." },
      { term: "Three-valued logic", definition: "SQL predicates evaluate to TRUE, FALSE or NULL (unknown)." },
    ],
    followUps: [
      { q: "Difference between WHERE and HAVING?", a: "WHERE filters rows before grouping and cannot use aggregates; HAVING filters groups after GROUP BY and can." },
      { q: "When would you use a surrogate key over a natural key?", a: "When natural keys can change (emails), are wide, or are composite — a stable integer/UUID surrogate keeps foreign keys small and immutable. Keep a UNIQUE constraint on the natural key anyway." },
    ],
    quiz: [
      {
        id: "rel-q1",
        prompt: "Why does `SELECT price * 2 AS p FROM items WHERE p > 10` fail in PostgreSQL?",
        options: ["`p` is a reserved word", "WHERE is evaluated before SELECT, so the alias doesn't exist yet", "Aliases are never allowed", "Arithmetic is not allowed in SELECT"],
        answer: 1,
        explanation: "Logically WHERE runs before the SELECT list is computed. Repeat the expression or use a subquery/CTE.",
      },
      {
        id: "rel-q2",
        prompt: "`SELECT * FROM t WHERE x NOT IN (SELECT y FROM u)` returns zero rows even though some x values are absent from u. Most likely cause?",
        options: ["u.y contains a NULL", "t is empty", "NOT IN needs an index", "y is a text column"],
        answer: 0,
        explanation: "`x NOT IN (1, NULL)` evaluates to NULL for every x not equal to 1, which is not true, so no rows pass. Use NOT EXISTS.",
      },
    ],
  },

  // ───────────────────────────────────────────── psql-cli
  {
    slug: "psql-cli",
    track: "databases",
    title: "PostgreSQL CLI (psql)",
    summary: "Connecting, navigating and debugging with psql: meta-commands, \\x, \\timing, \\e, running scripts and safe transactions at the prompt.",
    level: "beginner",
    frequency: "medium",
    minutes: 20,
    kinds: ["coding"],
    status: "authored",
    prerequisites: ["databases/relational-model-sql"],
    related: ["databases/indexing"],
    tags: ["psql", "cli", "postgres", "tooling"],
    sources: [pg("PostgreSQL: psql reference", "app-psql.html"), pg("PostgreSQL: Connection strings (libpq)", "libpq-connect.html#LIBPQ-CONNSTRING")],
    sections: [
      {
        id: "objectives",
        blocks: [{ type: "list", items: [
          "Connect with a connection URI or flags and environment variables",
          "Use meta-commands to inspect databases, tables, indexes and roles",
          "Make output readable (\\x, \\pset) and measure queries (\\timing)",
          "Run SQL files and use transactions safely at the prompt",
        ] }],
      },
      {
        id: "definition",
        blocks: [
          { type: "p", text: "`psql` is PostgreSQL's interactive terminal. Lines starting with a backslash are **meta-commands** handled by psql itself (client side); everything else is SQL sent to the server when terminated by `;`." },
          { type: "code", lang: "bash", caption: "Connecting", code: `psql "postgresql://app:secret@localhost:5432/shop?sslmode=disable"
# or with flags / env vars
PGPASSWORD=secret psql -h localhost -U app -d shop
# run a single command or a file, stop on first error
psql -d shop -c "SELECT now();"
psql -d shop -v ON_ERROR_STOP=1 -f migrate.sql` },
        ],
      },
      {
        id: "examples",
        blocks: [
          { type: "table", head: ["Meta-command", "What it does"], rows: [
            ["`\\l`", "List databases"],
            ["`\\c dbname`", "Connect to another database"],
            ["`\\dt`, `\\dt+`", "List tables (+ sizes)"],
            ["`\\d orders`", "Describe a table: columns, indexes, constraints, triggers"],
            ["`\\di`", "List indexes"],
            ["`\\du`", "List roles"],
            ["`\\x auto`", "Expanded display when rows are too wide"],
            ["`\\timing on`", "Print client-measured execution time after each query"],
            ["`\\e`", "Edit the current query buffer in $EDITOR"],
            ["`\\i file.sql`", "Execute a file"],
            ["`\\copy t TO 'f.csv' CSV HEADER`", "Client-side COPY (file on your machine, not the server)"],
            ["`\\set ON_ERROR_ROLLBACK interactive`", "A typo inside a transaction doesn't abort the whole transaction"],
            ["`\\q`", "Quit"],
          ] },
          { type: "code", lang: "sql", caption: "Try a destructive change safely", code: `BEGIN;
DELETE FROM orders WHERE created_at < '2020-01-01';
-- psql prints: DELETE 1234  -> check the count before deciding
ROLLBACK;  -- or COMMIT;` },
        ],
      },
      {
        id: "mistakes",
        blocks: [{ type: "list", items: [
          "Forgetting the `;` — psql waits for more input (prompt changes from `=>` to `->`)",
          "Using server-side `COPY ... FROM '/path'` when the file is on your laptop — use `\\copy`",
          "Running ad-hoc UPDATE/DELETE in autocommit mode on production; open a transaction first",
        ] }],
      },
      {
        id: "interview-short",
        blocks: [{ type: "p", text: "psql is the Postgres CLI: backslash meta-commands like `\\d table`, `\\di`, `\\x` and `\\timing` are handled client-side, SQL goes to the server. For scripts I use `-v ON_ERROR_STOP=1 -f`, and for risky manual changes I wrap them in BEGIN/ROLLBACK to check the affected row count first." }],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: ["Meta-commands inspect; SQL executes", "`\\d`, `\\x auto`, `\\timing` cover most day-to-day debugging", "Scripts: ON_ERROR_STOP; manual fixes: inside a transaction"] }],
      },
    ],
    glossary: [{ term: "Meta-command", definition: "A backslash command interpreted by psql itself rather than sent to the server as SQL." }],
  },
  // ───────────────────────────────────────────── indexing
  {
    slug: "indexing",
    track: "databases",
    title: "Indexing: B+tree internals and EXPLAIN",
    summary: "What an index physically is, how a B+tree finds a row in a handful of page reads, how composite/partial/covering indexes work, and how to read EXPLAIN (ANALYZE) to see whether the planner uses them.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 55,
    kinds: ["theory", "visualization", "coding"],
    status: "authored",
    prerequisites: ["databases/relational-model-sql", "dsa/trees"],
    related: ["system-design/database-indexes", "databases/transactions-acid", "databases/psql-cli", "os/cpu-memory-hierarchy"],
    tags: ["index", "b-tree", "b+tree", "explain", "query-planner", "postgres"],
    sources: [
      pg("PostgreSQL: Indexes", "indexes.html"),
      pg("PostgreSQL: Index types", "indexes-types.html"),
      pg("PostgreSQL: Multicolumn indexes", "indexes-multicolumn.html"),
      pg("PostgreSQL: Index-only scans and covering indexes", "indexes-index-only-scans.html"),
      pg("PostgreSQL: Using EXPLAIN", "using-explain.html"),
      pg("PostgreSQL: B-Tree implementation", "btree-implementation.html"),
      { label: "Use The Index, Luke! — The anatomy of an index", url: "https://use-the-index-luke.com/sql/anatomy", kind: "external" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [{ type: "list", items: [
          "Explain why a full table scan is O(n) page reads and a B+tree lookup is O(log n) with a huge fan-out",
          "Describe B+tree structure: root, internal and leaf pages, sorted keys, sibling-linked leaves",
          "Choose column order for composite indexes (equality first, then range) and know the leftmost-prefix rule",
          "Read EXPLAIN / EXPLAIN ANALYZE: Seq Scan, Index Scan, Index Only Scan, Bitmap Heap Scan, estimated vs actual rows",
          "Name the costs of indexes: write amplification, storage, and planner mis-estimates",
        ] }],
      },
      {
        id: "prerequisites",
        blocks: [{ type: "p", text: "Basic SQL and the idea of a balanced search tree. Knowing that disks and RAM are read in fixed-size **pages** (Postgres uses 8 KB pages by default) makes the design click." }],
      },
      {
        id: "intuition",
        blocks: [
          { type: "p", text: "An index is the index at the back of a book: a separate, **sorted** structure that maps a key (\"MVCC\") to locations (page numbers). Instead of reading every page of the book you jump to the right place." },
          { type: "p", text: "The catch is the same as in a book: someone has to keep that index up to date whenever the text changes. Every INSERT, UPDATE of an indexed column, and DELETE must also update every index on the table." },
        ],
      },
      {
        id: "definition",
        blocks: [
          { type: "p", text: "A **database index** is an auxiliary data structure, stored separately from the table (the *heap* in Postgres), that maps key values to row locations so that lookups, range scans and ordered reads avoid scanning the whole table. PostgreSQL's default index type is a **B-tree** (implemented as a B+tree variant: all row pointers live in leaf pages)." },
          { type: "table", head: ["Index type (Postgres)", "Good for"], rows: [
            ["B-tree (default)", "Equality and range (`=`, `<`, `BETWEEN`, `ORDER BY`, prefix `LIKE 'abc%'` with suitable collation/opclass)"],
            ["Hash", "Equality only"],
            ["GIN", "\"Contains\" queries: jsonb, arrays, full-text search"],
            ["GiST / SP-GiST", "Geometric, ranges, nearest-neighbour, custom"],
            ["BRIN", "Huge, naturally ordered tables (e.g. append-only time series) — tiny summaries per block range"],
          ] },
        ],
      },
      {
        id: "why",
        blocks: [
          { type: "p", text: "Without an index, `WHERE email = 'a@x.io'` on a 10 million row table reads every heap page — maybe a gigabyte of I/O. A B+tree with ~300 keys per 8 KB page has a fan-out so large that 3–4 levels cover billions of keys, so the lookup touches ~4 index pages plus 1 heap page, and the upper levels are almost always cached in memory." },
          { type: "callout", tone: "note", title: "Why B+trees and not binary trees?", text: "A binary tree has fan-out 2, so a billion keys need ~30 levels — 30 random page reads. B+trees are designed for block storage: one node = one page, and many keys per page means very shallow trees." },
        ],
      },
      {
        id: "internals",
        blocks: [
          { type: "flow", nodes: ["Root page", "Internal page (key ranges)", "Leaf page (sorted keys + TIDs)", "Heap page (actual row)"], caption: "Conceptual lookup path for an Index Scan" },
          { type: "list", items: [
            "**Internal pages** hold separator keys and child page pointers. A search does a binary search inside each page, then follows one pointer down.",
            "**Leaf pages** hold every indexed key in sorted order, each with a **TID** (tuple id = heap page number + item offset) pointing to the row.",
            "Leaves are linked to their siblings, so a range scan (`BETWEEN`, `ORDER BY ... LIMIT`) finds the first key and then walks sideways without going back to the root.",
            "Inserting into a full leaf **splits** it into two and pushes a separator key up to the parent; splits can cascade up to the root, which is how the tree grows in height — always staying balanced.",
          ] },
          { type: "callout", tone: "spec-vs-impl", title: "PostgreSQL specifics", text: "Postgres B-trees follow the Lehman & Yao design (right-links that allow concurrent splits without locking the whole tree). Since PostgreSQL 13, B-tree **deduplication** stores repeated keys once with a list of TIDs, shrinking indexes on low-cardinality columns. Postgres indexes do not store visibility information, which is why index-only scans need the visibility map (see below). MySQL InnoDB differs fundamentally: the table itself *is* a clustered B+tree on the primary key, and secondary indexes store the primary key instead of a physical pointer." },
          { type: "p", text: "**Composite indexes** sort by the first column, then by the second within equal first values, and so on — like a phone book sorted by (last name, first name). That gives the **leftmost-prefix rule**: an index on `(a, b, c)` can serve `a = ?`, `a = ? AND b = ?`, `a = ? AND b > ?`, but not `b = ?` alone efficiently." },
          { type: "p", text: "**Covering / index-only scans**: if every column the query needs is in the index (add non-key columns with `INCLUDE`), Postgres can skip the heap — but only for pages the **visibility map** marks all-visible (set by VACUUM). Otherwise it must still visit the heap to check MVCC visibility." },
          { type: "p", text: "**Partial indexes** index only rows matching a predicate (`WHERE status = 'pending'`), keeping them small. **Expression indexes** index a computed value (`lower(email)`) and are used only when the query uses the same expression." },
        ],
      },
      {
        id: "walkthrough",
        title: "Reading EXPLAIN",
        blocks: [
          { type: "code", lang: "sql", caption: "Before and after an index (plans are illustrative — costs and timings vary by machine and data)", code: `EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 42;
-- Seq Scan on orders  (cost=0.00..18334.00 rows=98 width=40)
--                     (actual time=0.031..61.2 rows=103 loops=1)
--   Filter: (customer_id = 42)
--   Rows Removed by Filter: 999897

CREATE INDEX orders_customer_id_idx ON orders (customer_id);
ANALYZE orders;

EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 42;
-- Bitmap Heap Scan on orders  (cost=5.17..380.2 rows=98 width=40)
--                             (actual time=0.05..0.31 rows=103 loops=1)
--   Recheck Cond: (customer_id = 42)
--   ->  Bitmap Index Scan on orders_customer_id_idx
--         Index Cond: (customer_id = 42)` },
          { type: "steps", steps: [
            { title: "Read inside-out", detail: "The most-indented node runs first and feeds its parent." },
            { title: "cost=startup..total", detail: "Planner estimate in arbitrary units (roughly sequential page fetches). Only meaningful for comparing plans." },
            { title: "rows (estimated) vs actual rows", detail: "A big mismatch means bad statistics or correlated columns — the #1 cause of bad plans. Run ANALYZE; consider extended statistics." },
            { title: "Scan type", detail: "Seq Scan (read all), Index Scan (walk index, fetch each heap row), Bitmap Index + Heap Scan (collect TIDs, sort by page, then read heap pages in order — good for medium selectivity), Index Only Scan (heap skipped when visible)." },
            { title: "BUFFERS", detail: "`EXPLAIN (ANALYZE, BUFFERS)` shows shared hits (cache) vs reads (I/O) — the real cost." },
          ] },
          { type: "callout", tone: "warning", title: "EXPLAIN ANALYZE executes the query", text: "For an UPDATE/DELETE, wrap it in `BEGIN; EXPLAIN ANALYZE ...; ROLLBACK;`." },
        ],
      },
      {
        id: "edge-cases",
        title: "When the index is not used",
        blocks: [{ type: "list", items: [
          "**Low selectivity**: if the predicate matches a large fraction of rows, a Seq Scan is genuinely cheaper than thousands of random heap reads. The planner is usually right.",
          "**Function on the column**: `WHERE lower(email) = ...` can't use an index on `email`; create an expression index.",
          "**Type mismatch / implicit casts** prevent index use in some cases (e.g. comparing a text column to a numeric parameter).",
          "**Leading wildcard**: `LIKE '%abc'` can't use a B-tree; consider a trigram GIN index (pg_trgm).",
          "**Wrong column order** in a composite index for the query's predicates.",
          "**Stale statistics** after bulk loads — run ANALYZE.",
          "**Small tables** — scanning a few pages beats walking an index.",
        ] }],
      },
      {
        id: "tradeoffs",
        blocks: [
          { type: "compare", items: [
            { title: "Benefits", points: ["Point lookups and range scans in O(log n)", "Pre-sorted output for ORDER BY / LIMIT", "Enforces UNIQUE / PRIMARY KEY", "Index-only scans avoid heap I/O"] },
            { title: "Costs", points: ["Every write updates every index (write amplification)", "Disk and cache space", "Postgres: index updates also defeat HOT updates when an indexed column changes", "More plans for the planner to get wrong"] },
          ] },
        ],
      },
      {
        id: "real-world",
        blocks: [{ type: "list", items: [
          "Index foreign keys you join or cascade-delete on — Postgres does not create them automatically.",
          "Build indexes on live tables with `CREATE INDEX CONCURRENTLY` (slower, no long write lock; can't run inside a transaction block).",
          "Find unused indexes with `pg_stat_user_indexes.idx_scan = 0` and drop them.",
          "For keyset pagination, an index on `(created_at, id)` lets `WHERE (created_at, id) < ($1, $2) ORDER BY created_at DESC, id DESC LIMIT 20` stay fast at any depth.",
        ] }],
      },
      {
        id: "interview-short",
        blocks: [{ type: "p", text: "An index is a separate sorted structure — in Postgres a B+tree by default — mapping keys to row locations. Because each node is a disk page holding hundreds of keys, the tree is only 3–4 levels deep even for billions of rows, so lookups touch a few pages instead of the whole table, and linked leaves make range scans and ORDER BY cheap. The cost is that every write must maintain every index. I verify usage with EXPLAIN ANALYZE, compare estimated vs actual rows, and design composite indexes with equality columns first, then range columns." }],
      },
      {
        id: "interview-deep",
        blocks: [
          { type: "list", items: [
            "**Clustered vs non-clustered**: InnoDB clusters the table by PK (secondary lookups = two B+tree traversals). Postgres stores rows in an unordered heap; `CLUSTER` reorders once but isn't maintained.",
            "**Why the planner picks a Seq Scan**: cost model with `random_page_cost` vs `seq_page_cost`; on SSDs teams often lower random_page_cost.",
            "**Bitmap scans** combine multiple indexes with BitmapAnd/BitmapOr and read heap pages in physical order.",
            "**Index-only scans** depend on the visibility map, so autovacuum health directly affects read performance.",
            "**LSM trees** (RocksDB, Cassandra) trade read cost for sequential write throughput — the opposite design point from B+trees.",
          ] },
        ],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: [
          "B+tree: shallow, page-sized nodes, sorted keys, linked leaves",
          "Composite indexes obey the leftmost-prefix rule — equality first, range last",
          "EXPLAIN ANALYZE: inside-out, compare estimated vs actual rows, check BUFFERS",
          "Indexes speed reads and slow writes; drop the unused ones",
        ] }],
      },
    ],
    glossary: [
      { term: "Heap", definition: "In Postgres, the main table storage: an unordered collection of 8 KB pages holding row versions." },
      { term: "TID / ctid", definition: "Tuple identifier: (page number, item offset) locating a row version in the heap." },
      { term: "Fan-out", definition: "Number of children per tree node. High fan-out → shallow tree → fewer page reads." },
      { term: "Selectivity", definition: "Fraction of rows a predicate matches. Indexes help most when selectivity is low (few rows)." },
      { term: "Covering index", definition: "An index containing every column a query needs, enabling an index-only scan." },
      { term: "Visibility map", definition: "Per-table bitmap marking heap pages whose tuples are all visible to every transaction; maintained by VACUUM." },
      { term: "Planner statistics", definition: "Per-column histograms and most-common values gathered by ANALYZE, used to estimate row counts." },
    ],
    followUps: [
      { q: "Index on (a, b): does `WHERE b = 5` use it?", a: "Generally not efficiently — keys are sorted by a first, so b values are scattered. Postgres may still do a full index scan if it's cheaper than the heap, but you'd normally add an index on b. (Some engines, like MySQL 8 and Oracle, have 'skip scan' for low-cardinality leading columns.)" },
      { q: "Why might adding an index make the app slower overall?", a: "Writes get slower (each index must be updated, WAL volume grows, HOT updates may be lost), and memory used by the index competes with hot data in shared_buffers / page cache." },
      { q: "What is a HOT update?", a: "Heap-Only Tuple: when an UPDATE changes no indexed column and the new version fits on the same page, Postgres skips creating new index entries — chaining from the old version instead. Indexing a frequently updated column prevents this." },
      { q: "Should you index a boolean column?", a: "Usually not by itself (50% selectivity). A partial index for the rare value — e.g. `WHERE processed = false` — is often ideal." },
    ],
    quiz: [
      {
        id: "idx-q1",
        prompt: "Index `(user_id, created_at)`. Which query benefits most?",
        options: [
          "`WHERE created_at > now() - interval '1 day'`",
          "`WHERE user_id = 7 AND created_at > now() - interval '1 day'`",
          "`WHERE created_at > now() - interval '1 day' OR user_id = 7`",
          "`WHERE lower(user_id::text) = '7'`",
        ],
        answer: 1,
        explanation: "Equality on the leading column then a range on the second column maps to one contiguous slice of the index.",
      },
      {
        id: "idx-q2",
        prompt: "EXPLAIN ANALYZE shows `rows=5` estimated but `actual rows=480000`. What is the most likely fix?",
        options: ["Add more RAM", "Run ANALYZE / improve statistics", "Switch to a Hash index", "Increase max_connections"],
        answer: 1,
        explanation: "Huge estimate errors come from stale or insufficient statistics (or correlated columns needing extended statistics). The planner chose a plan for 5 rows.",
      },
      {
        id: "idx-q3",
        prompt: "Why can't Postgres always answer from an index alone even when the index covers every column?",
        options: ["Indexes are compressed", "Index entries lack MVCC visibility info, so the heap must be checked unless the visibility map marks the page all-visible", "B-trees don't store values", "Index-only scans are disabled by default"],
        answer: 1,
        explanation: "Visibility lives in heap tuple headers (xmin/xmax). The visibility map lets the executor skip the heap for all-visible pages.",
      },
    ],
  },
  // ───────────────────────────────────────────── transactions-acid
  {
    slug: "transactions-acid",
    track: "databases",
    title: "Transactions, ACID and MVCC in PostgreSQL",
    summary: "What atomicity, consistency, isolation and durability actually promise, the anomalies each isolation level allows, and how PostgreSQL's MVCC (xmin/xmax, snapshots, VACUUM) lets readers and writers not block each other.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 60,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["databases/relational-model-sql"],
    related: ["system-design/locks-transactions-isolation", "databases/indexing", "databases/postgres-replication", "distributed/distributed-transactions", "os/synchronization"],
    tags: ["acid", "transactions", "isolation", "mvcc", "vacuum", "wal", "postgres"],
    sources: [
      pg("PostgreSQL: Concurrency Control", "mvcc.html"),
      pg("PostgreSQL: Transaction Isolation", "transaction-iso.html"),
      pg("PostgreSQL: Explicit Locking", "explicit-locking.html"),
      pg("PostgreSQL: Routine Vacuuming", "routine-vacuuming.html"),
      pg("PostgreSQL: Write-Ahead Logging", "wal-intro.html"),
      { label: "A Critique of ANSI SQL Isolation Levels (Berenson et al., 1995)", url: "https://arxiv.org/abs/cs/0701157", kind: "external" },
      { label: "Ports & Grittner, Serializable Snapshot Isolation in PostgreSQL (VLDB 2012)", url: "https://arxiv.org/abs/1208.4179", kind: "external" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [{ type: "list", items: [
          "Define each ACID property precisely — and say which component provides it",
          "Recognise dirty reads, non-repeatable reads, phantoms, lost updates and write skew",
          "Map Postgres isolation levels to the anomalies they prevent",
          "Explain MVCC: row versions, xmin/xmax, snapshots, and why VACUUM exists",
          "Choose between row locks (`SELECT ... FOR UPDATE`), atomic updates and SERIALIZABLE + retries",
        ] }],
      },
      {
        id: "intuition",
        blocks: [
          { type: "p", text: "A transaction is an *all-or-nothing envelope* around several statements. Transferring money is the classic example: debit A and credit B must both happen or neither — and no one else should see the money \"in flight\"." },
          { type: "p", text: "MVCC is how Postgres lets many envelopes be open at once: instead of overwriting a row, an UPDATE writes a **new version**. Each transaction looks at the database through a **snapshot** — a photo of which transactions had committed when it started looking — and only sees versions that are visible in that photo." },
        ],
      },
      {
        id: "definition",
        blocks: [
          { type: "table", head: ["Property", "Promise", "Provided by (Postgres)"], rows: [
            ["Atomicity", "All statements commit or none do", "Transaction status in the commit log (pg_xact); aborted versions are simply never visible"],
            ["Consistency", "Each commit moves the DB from one valid state to another (constraints hold)", "Constraints/triggers + *your* application logic — the weakest, most app-dependent letter"],
            ["Isolation", "Concurrent transactions don't interfere beyond what the isolation level allows", "MVCC snapshots + locks + SSI"],
            ["Durability", "Once COMMIT returns, the data survives a crash", "WAL flushed (fsync) to disk before COMMIT returns (with default synchronous_commit = on)"],
          ] },
        ],
      },
      {
        id: "why",
        blocks: [{ type: "p", text: "Without transactions, every partial failure (crash between two writes, a constraint violation halfway through) and every race between concurrent requests becomes the application's problem. With them you reason about one request at a time — up to the guarantees of the isolation level you picked, which is where most real bugs hide." }],
      },
      {
        id: "internals",
        blocks: [
          { type: "p", text: "**Anomalies** (what weaker isolation lets through):" },
          { type: "table", head: ["Anomaly", "What happens"], rows: [
            ["Dirty read", "Reading another transaction's uncommitted write"],
            ["Non-repeatable read", "Reading the same row twice and getting different committed values"],
            ["Phantom", "Re-running a range query and seeing new/removed rows"],
            ["Lost update", "Two read-modify-write cycles overwrite each other (`x = x_read + 1` twice → +1)"],
            ["Write skew", "Two transactions read overlapping data, write *different* rows, and together violate an invariant (both on-call doctors go off call)"],
          ] },
          { type: "table", head: ["Postgres level", "Dirty read", "Non-repeatable", "Phantom", "Lost update", "Write skew"], rows: [
            ["Read Committed (default)", "No", "Possible", "Possible", "Possible (for read-then-write in app code)", "Possible"],
            ["Repeatable Read (snapshot isolation)", "No", "No", "No (in Postgres)", "Detected → serialization error", "Possible"],
            ["Serializable (SSI)", "No", "No", "No", "No", "No — one transaction aborts with SQLSTATE 40001"],
          ] },
          { type: "callout", tone: "spec-vs-impl", title: "Postgres vs the SQL standard", text: "The standard defines four levels by forbidden anomalies. In PostgreSQL, READ UNCOMMITTED behaves exactly like READ COMMITTED (no dirty reads ever), REPEATABLE READ is snapshot isolation and also prevents phantoms (stricter than the standard requires), and SERIALIZABLE uses Serializable Snapshot Isolation (since 9.1) — optimistic, so you must be ready to retry. MySQL InnoDB's REPEATABLE READ is different again (locking reads see the latest data; gap locks)." },
          { type: "p", text: "**MVCC mechanics.** Every heap tuple carries hidden system columns:" },
          { type: "list", items: [
            "`xmin` — id of the transaction that created this version",
            "`xmax` — id of the transaction that deleted/updated it (0 if live)",
            "An UPDATE = mark old version's xmax + insert a new version with a new xmin (and new ctid)",
            "A **snapshot** records: the lowest still-running xid, the next xid to be assigned, and the list of in-progress xids. A version is visible if its xmin committed before the snapshot and its xmax is empty, aborted or not yet committed in the snapshot.",
            "Read Committed takes a fresh snapshot **per statement**; Repeatable Read and Serializable take one per **transaction** (at its first statement).",
          ] },
          { type: "p", text: "Old versions that no snapshot can see anymore are **dead tuples**. `VACUUM` (usually autovacuum) reclaims their space, updates the visibility map and **freezes** old xids to avoid 32-bit transaction-id wraparound. A long-running transaction holds back the oldest snapshot, so nothing newer than it can be vacuumed → table and index bloat." },
          { type: "callout", tone: "note", title: "Readers don't block writers", text: "Plain SELECTs take no row locks in Postgres. Writers block only writers on the *same row*: a second UPDATE of a row waits for the first transaction to commit or roll back. In Read Committed it then re-evaluates its WHERE against the newly committed version; in Repeatable Read/Serializable it fails with a serialization error." },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: seeing MVCC versions",
        blocks: [
          { type: "code", lang: "sql", caption: "xmin/xmax are real columns you can select (xid values will differ on your machine)", code: `CREATE TABLE acct (id int PRIMARY KEY, balance int);
INSERT INTO acct VALUES (1, 100);
SELECT xmin, xmax, ctid, * FROM acct;
--  xmin | xmax | ctid  | id | balance
--   741 |    0 | (0,1) |  1 |     100

UPDATE acct SET balance = 90 WHERE id = 1;
SELECT xmin, xmax, ctid, * FROM acct;
--  xmin | xmax | ctid  | id | balance
--   742 |    0 | (0,2) |  1 |      90     -- a NEW tuple; (0,1) is now dead` },
          { type: "steps", steps: [
            { title: "T1 (Repeatable Read) BEGIN; SELECT balance", detail: "Snapshot taken: sees 90." },
            { title: "T2 UPDATE balance = 50; COMMIT", detail: "Creates version (0,3) with xmin = T2; sets xmax of (0,2) to T2." },
            { title: "T1 SELECT balance again", detail: "T2 is not visible in T1's snapshot, so (0,2) is still the visible version: 90. No blocking occurred." },
            { title: "T1 UPDATE balance = balance - 10", detail: "The row was changed by a transaction T1 can't see → ERROR: could not serialize access due to concurrent update. T1 must retry." },
            { title: "Later: autovacuum", detail: "Once no snapshot needs (0,1) and (0,2), they are reclaimed." },
          ] },
        ],
      },
      {
        id: "examples",
        title: "Fixing a lost update",
        blocks: [
          { type: "code", lang: "sql", caption: "Three correct options for 'decrement stock if available'", code: `-- 1) Atomic conditional update (best when it fits in one statement)
UPDATE products SET stock = stock - 1 WHERE id = $1 AND stock > 0;
-- check affected rows: 0 means out of stock

-- 2) Pessimistic lock: read-then-write with the row locked
BEGIN;
SELECT stock FROM products WHERE id = $1 FOR UPDATE;
-- app logic ...
UPDATE products SET stock = $2 WHERE id = $1;
COMMIT;

-- 3) Optimistic: version column, retry on 0 rows
UPDATE products SET stock = $2, version = version + 1
WHERE id = $1 AND version = $3;` },
          { type: "p", text: "For invariants spanning several rows (write skew), use SERIALIZABLE with a retry loop, or lock a common row/use an advisory lock, or move the invariant into a constraint (UNIQUE, EXCLUDE)." },
        ],
      },
      {
        id: "mistakes",
        blocks: [{ type: "list", items: [
          "Assuming the default (Read Committed) prevents lost updates in `SELECT` → compute in app → `UPDATE` code",
          "Using SERIALIZABLE without retry logic for SQLSTATE 40001 / 40P01",
          "Leaving transactions open (idle in transaction) — holds locks and blocks VACUUM; set `idle_in_transaction_session_timeout`",
          "Doing network calls (HTTP, email) inside a DB transaction",
          "Believing \"Consistency\" in ACID is the same as consistency in CAP — it isn't (CAP's C is linearizability)",
        ] }],
      },
      {
        id: "tradeoffs",
        blocks: [{ type: "compare", items: [
          { title: "Read Committed + targeted locks", points: ["Fewest aborts, highest throughput", "You must spot every race yourself", "Good default for simple CRUD"] },
          { title: "Serializable (SSI)", points: ["Correct by construction: behaves as if transactions ran one at a time", "Optimistic → aborts under contention; needs retries", "Some overhead tracking read/write dependencies"] },
        ] }],
      },
      {
        id: "interview-short",
        blocks: [{ type: "p", text: "ACID: atomicity is all-or-nothing, consistency means constraints and invariants hold after commit, isolation controls what concurrent transactions see, durability means committed data survives crashes via the write-ahead log flushed before COMMIT returns. Postgres implements isolation with MVCC: updates write new row versions tagged with xmin/xmax, each transaction reads through a snapshot, so readers never block writers. Read Committed (default) snapshots per statement and allows lost updates in read-modify-write code; Repeatable Read is snapshot isolation; Serializable adds SSI and may abort transactions, so you retry. VACUUM cleans up dead versions." }],
      },
      {
        id: "interview-deep",
        blocks: [{ type: "list", items: [
          "**Durability knobs**: `synchronous_commit = off` returns before WAL flush — risk losing the last few hundred ms of commits on crash, but no corruption.",
          "**Write skew** example: two doctors check `count(on_call) >= 2` and each sets themselves off call. Snapshot isolation allows it; SSI aborts one.",
          "**Bloat**: hot-updated tables plus a long transaction → dead tuples accumulate; monitor `n_dead_tup`, oldest `backend_xmin`.",
          "**xid wraparound**: transaction ids are 32-bit; freezing by VACUUM is mandatory, or Postgres eventually refuses writes to protect data.",
          "**Deadlocks**: detected after `deadlock_timeout` (1 s default); one transaction is aborted. Avoid by locking rows in a consistent order.",
        ] }],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: [
          "ACID = all-or-nothing, invariants, isolation level semantics, WAL-backed durability",
          "MVCC: versions + snapshots → readers don't block writers",
          "Default Read Committed allows lost updates and write skew — use atomic updates, FOR UPDATE, or SERIALIZABLE + retry",
          "VACUUM is part of MVCC, not optional housekeeping",
        ] }],
      },
    ],
    glossary: [
      { term: "Transaction", definition: "A sequence of operations executed as one atomic, isolated unit." },
      { term: "MVCC", definition: "Multi-Version Concurrency Control: keep multiple versions of a row so readers see a consistent snapshot without locking." },
      { term: "Snapshot", definition: "The set of transactions considered committed from a given transaction's point of view." },
      { term: "xmin / xmax", definition: "Hidden tuple header fields: creating and deleting transaction ids." },
      { term: "Dead tuple", definition: "A row version no longer visible to any transaction; reclaimed by VACUUM." },
      { term: "WAL", definition: "Write-Ahead Log: changes are logged sequentially and flushed before data pages, enabling crash recovery and replication." },
      { term: "SSI", definition: "Serializable Snapshot Isolation: snapshot isolation plus detection of dangerous read/write dependency cycles, aborting one transaction." },
      { term: "Write skew", definition: "Anomaly where concurrent transactions read the same data and update disjoint rows, jointly violating an invariant." },
    ],
    followUps: [
      { q: "Does SELECT ... FOR UPDATE prevent phantoms?", a: "No — it locks the rows that exist and match. New rows inserted by others aren't locked. Use SERIALIZABLE, a unique/exclusion constraint, or lock a parent row." },
      { q: "Why is an UPDATE in Postgres more expensive than in an update-in-place engine?", a: "It writes a whole new tuple (and possibly new index entries unless HOT applies) and leaves a dead tuple for VACUUM — more WAL and bloat in exchange for non-blocking reads." },
      { q: "How does Postgres guarantee durability without fsyncing data pages at commit?", a: "It fsyncs only the WAL (sequential). Data pages are written later by the background writer/checkpointer; after a crash, recovery replays WAL from the last checkpoint." },
    ],
    quiz: [
      {
        id: "tx-q1",
        prompt: "Two concurrent requests run `SELECT stock` → (app computes stock-1) → `UPDATE ... SET stock = :new` at Read Committed. Starting stock 10. Final stock?",
        options: ["8, always", "9 is possible (lost update)", "Error 40001", "Deadlock"],
        answer: 1,
        explanation: "Both read 10 and both write 9. Read Committed doesn't detect this; use `stock = stock - 1`, FOR UPDATE, or a stricter level.",
      },
      {
        id: "tx-q2",
        prompt: "In PostgreSQL, what does `SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED` give you?",
        options: ["Dirty reads", "Read Committed behaviour", "Serializable", "An error"],
        answer: 1,
        explanation: "Postgres accepts the syntax but never exposes uncommitted data; it behaves as Read Committed.",
      },
      {
        id: "tx-q3",
        prompt: "A reporting job keeps a transaction open for 6 hours. What is the most likely side effect?",
        options: ["Faster vacuums", "Dead tuples can't be reclaimed → bloat", "Writes are blocked table-wide", "WAL is disabled"],
        answer: 1,
        explanation: "VACUUM can't remove versions that the oldest snapshot might still need.",
      },
    ],
  },
  // ───────────────────────────────────────────── postgres-replication
  {
    slug: "postgres-replication",
    track: "databases",
    title: "PostgreSQL replication: WAL, streaming, sync vs async",
    summary: "How the write-ahead log powers crash recovery and replication, how a primary streams WAL to hot-standby replicas, what synchronous_commit levels really guarantee, replication slots, lag, failover, and logical replication.",
    level: "advanced",
    frequency: "high",
    minutes: 55,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["databases/transactions-acid"],
    related: ["system-design/replication", "system-design/consistency-models", "system-design/redundancy-failover", "distributed/consensus-basics", "databases/database-scaling"],
    tags: ["replication", "wal", "streaming", "hot-standby", "failover", "postgres", "high-availability"],
    sources: [
      pg("PostgreSQL: Write-Ahead Logging (WAL)", "wal-intro.html"),
      pg("PostgreSQL: High Availability, Load Balancing, and Replication", "high-availability.html"),
      pg("PostgreSQL: Log-Shipping Standby Servers (streaming, slots, synchronous)", "warm-standby.html"),
      pg("PostgreSQL: Hot Standby", "hot-standby.html"),
      pg("PostgreSQL: synchronous_commit and replication settings", "runtime-config-replication.html"),
      pg("PostgreSQL: Logical Replication", "logical-replication.html"),
      pg("PostgreSQL: pg_stat_replication", "monitoring-stats.html#MONITORING-PG-STAT-REPLICATION-VIEW"),
      { label: "Patroni (HA template for PostgreSQL)", url: "https://patroni.readthedocs.io/", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [{ type: "list", items: [
          "Explain what the WAL is and why it makes both crash recovery and replication possible",
          "Describe physical streaming replication: walsender, walreceiver, startup (replay) process",
          "Compare async vs sync replication and the synchronous_commit levels (off, local, remote_write, on, remote_apply)",
          "Measure and reason about replication lag and its user-visible anomalies (read-your-writes)",
          "Explain replication slots, failover/promotion, split brain, and when to use logical replication",
        ] }],
      },
      {
        id: "intuition",
        blocks: [
          { type: "p", text: "Postgres never trusts its data files after a crash — it trusts its **journal**. Every change is first appended to the write-ahead log; data pages are written lazily. Replication is the realisation that if you ship that same journal to another machine and replay it, you get an identical copy of the database." },
          { type: "flow", nodes: ["Client COMMIT", "Primary: WAL buffer → WAL file (fsync)", "walsender", "network", "Replica walreceiver → WAL file", "startup process replays", "Replica pages (read-only queries)"], caption: "Conceptual physical streaming replication" },
        ],
      },
      {
        id: "definition",
        blocks: [
          { type: "list", items: [
            "**WAL**: a sequential log of low-level page changes, addressed by **LSN** (log sequence number, a byte position). Rule: a data page may not be written to disk before the WAL describing its change is flushed.",
            "**Physical (streaming) replication**: replicas receive WAL bytes and replay them, producing a byte-for-byte copy of the whole cluster (all databases). Same major version and architecture required.",
            "**Hot standby**: a replica that accepts read-only queries while replaying.",
            "**Logical replication**: decodes WAL into row-level changes per table (publications/subscriptions); works across major versions and allows selective replication.",
          ] },
        ],
      },
      {
        id: "why",
        blocks: [{ type: "list", items: [
          "**High availability**: promote a replica if the primary dies",
          "**Read scaling**: offload read-only queries and reports",
          "**Backups/PITR**: base backup + archived WAL lets you restore to any point in time",
          "**Zero-downtime upgrades and migrations** (logical replication)",
        ] }],
      },
      {
        id: "internals",
        blocks: [
          { type: "steps", steps: [
            { title: "Bootstrap", detail: "`pg_basebackup` copies the primary's data directory while it runs, plus the WAL needed to make it consistent." },
            { title: "Connect", detail: "The replica starts with `primary_conninfo` set (and a `standby.signal` file since PG 12); its walreceiver connects to the primary using the replication protocol." },
            { title: "Stream", detail: "A walsender process on the primary streams WAL records as they are written. The walreceiver writes and flushes them to the replica's pg_wal." },
            { title: "Replay", detail: "The startup process applies WAL to data pages. Hot-standby queries see the state as of the last replayed commit." },
            { title: "Feedback", detail: "The replica reports write/flush/replay LSNs back; the primary shows them in `pg_stat_replication`." },
          ] },
          { type: "p", text: "**Replication slots** make the primary retain WAL until a given consumer has received it, so a replica that disconnects can catch up instead of needing a fresh base backup. The danger: an abandoned slot retains WAL forever and can fill the primary's disk (PG 13+ offers `max_slot_wal_keep_size` as a guard)." },
          { type: "p", text: "**Synchronous replication** is configured with `synchronous_standby_names` (e.g. `FIRST 1 (r1, r2)` or quorum `ANY 2 (r1, r2, r3)`). Then `synchronous_commit` decides how long COMMIT waits:" },
          { type: "table", head: ["synchronous_commit", "COMMIT returns after…", "Survives"], rows: [
            ["off", "WAL written to OS buffers, not flushed locally", "Not even a primary crash (last ~few hundred ms may be lost; no corruption)"],
            ["local", "Local WAL flush only", "Primary crash; not primary loss"],
            ["remote_write", "Sync standby has written WAL to its OS (not fsynced)", "Primary loss, unless the standby's OS crashes too"],
            ["on (default)", "Local flush + sync standby flushed WAL to disk (if sync standbys are configured)", "Primary loss"],
            ["remote_apply", "Sync standby has **replayed** the commit", "Primary loss, and reads on that standby see the commit (read-your-writes)"],
          ] },
          { type: "callout", tone: "spec-vs-impl", title: "Version-specific details", text: "Before PostgreSQL 12, standby settings lived in recovery.conf; PG 12 moved them into postgresql.conf with standby.signal. Quorum syntax `ANY n (...)` arrived in PG 10. `max_slot_wal_keep_size` arrived in PG 13. Without synchronous_standby_names, `on` behaves like `local`. Managed services (RDS, Cloud SQL, Aurora) wrap or replace this machinery — Aurora, for instance, replicates at its storage layer rather than via streaming WAL to replicas." },
          { type: "callout", tone: "warning", title: "Sync replication can stop writes", text: "If the only synchronous standby is down, commits on the primary wait indefinitely. Use at least two candidates (FIRST 1 of 2, or ANY quorum) so one failure doesn't halt writes." },
        ],
      },
      {
        id: "walkthrough",
        title: "Observing lag",
        blocks: [
          { type: "code", lang: "sql", caption: "On the primary (illustrative values)", code: `SELECT application_name, state, sync_state,
       write_lag, flush_lag, replay_lag
FROM pg_stat_replication;
-- application_name | state     | sync_state | write_lag       | flush_lag       | replay_lag
-- replica1         | streaming | async      | 00:00:00.000412 | 00:00:00.001090 | 00:00:00.001270` },
          { type: "code", lang: "sql", caption: "On a replica", code: `SELECT pg_is_in_recovery(),                 -- true on a standby
       now() - pg_last_xact_replay_timestamp() AS approx_lag;` },
          { type: "p", text: "Lag spikes come from heavy write bursts, long-running queries on the replica conflicting with replay (`max_standby_streaming_delay`), network issues, or slow replica disks." },
        ],
      },
      {
        id: "edge-cases",
        blocks: [{ type: "list", items: [
          "**Read-your-writes**: user updates profile (primary), next page loads from an async replica → stale data. Fixes: read from primary for a short window after writes, track the commit LSN and wait until the replica has replayed it, or use remote_apply for that path.",
          "**Monotonic reads**: load balancer alternates between two replicas with different lag → data appears to go back in time. Pin a session to one replica.",
          "**Query conflicts**: replay wants to remove row versions a long replica query still needs → the query is cancelled after max_standby_streaming_delay, or use `hot_standby_feedback = on` (at the cost of bloat on the primary).",
          "**Split brain**: two nodes both believe they are primary after a partition. Real HA needs fencing and a consensus-based arbiter (Patroni + etcd/Consul, or a managed service).",
          "**Async failover loses data**: promoting an async replica discards any commits it hadn't received (RPO > 0).",
        ] }],
      },
      {
        id: "tradeoffs",
        blocks: [{ type: "compare", items: [
          { title: "Asynchronous", points: ["No commit latency penalty", "Primary unaffected by replica failures", "Failover can lose recently committed transactions", "Replicas serve stale reads"] },
          { title: "Synchronous", points: ["RPO = 0 for the sync standby set", "Every commit pays a network round trip (+ remote fsync)", "Write availability depends on standby availability", "remote_apply additionally gives read-your-writes on the standby"] },
        ] }],
      },
      {
        id: "real-world",
        blocks: [{ type: "list", items: [
          "Typical setup: primary + one sync standby in another AZ (quorum) + async read replicas.",
          "Failover is orchestrated (Patroni, pg_auto_failover, cloud managed HA); apps connect through a VIP, DNS name or proxy that follows the leader.",
          "Logical replication is used for zero-downtime major-version upgrades and for CDC into Kafka (via logical decoding, e.g. Debezium).",
        ] }],
      },
      {
        id: "interview-short",
        blocks: [{ type: "p", text: "Postgres writes every change to the write-ahead log first; physical streaming replication ships that WAL from a walsender on the primary to replicas that replay it, producing an identical read-only hot standby. By default it's asynchronous — commits don't wait, so replicas lag and a failover can lose recent commits. With synchronous_standby_names and synchronous_commit = on, a commit waits until a standby has flushed the WAL (RPO zero) at the cost of latency and availability; remote_apply also waits for replay so reads on that standby are fresh. Slots retain WAL for slow replicas; logical replication decodes WAL into row changes for upgrades and CDC." }],
      },
      {
        id: "interview-deep",
        blocks: [{ type: "list", items: [
          "Physical replication copies the whole cluster byte-for-byte (including indexes and bloat); logical replicates table rows, needs replica identity (PK) for UPDATE/DELETE and doesn't replicate DDL or sequences automatically.",
          "Replication ≠ backup: a `DROP TABLE` replicates instantly. Keep base backups + WAL archive (e.g. pgBackRest, WAL-G) for point-in-time recovery.",
          "Postgres has no built-in consensus; leader election comes from external tools using etcd/Consul (Raft) — see distributed consensus.",
          "Delayed replicas (`recovery_min_apply_delay`) give you a time window to recover from human error.",
        ] }],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: [
          "WAL first, pages later → crash recovery and replication from the same log",
          "Streaming replication = ship + replay WAL; replicas are read-only hot standbys",
          "Async: fast but lossy failover and stale reads; sync: RPO 0, slower commits, availability risk",
          "Watch lag, slots and replica query conflicts; replication is not a backup",
        ] }],
      },
    ],
    glossary: [
      { term: "LSN", definition: "Log Sequence Number: a position in the WAL stream, used to measure replication progress." },
      { term: "walsender / walreceiver", definition: "Primary-side and replica-side processes that stream WAL over the replication protocol." },
      { term: "Hot standby", definition: "A replica that serves read-only queries while continuously replaying WAL." },
      { term: "Replication slot", definition: "Primary-side bookmark that retains WAL until a consumer confirms receipt." },
      { term: "RPO / RTO", definition: "Recovery Point Objective (how much data you may lose) / Recovery Time Objective (how long recovery may take)." },
      { term: "Promotion", definition: "Turning a standby into a writable primary (`pg_promote()` / `pg_ctl promote`)." },
      { term: "Split brain", definition: "Two nodes simultaneously accepting writes as primary, causing divergent data." },
      { term: "PITR", definition: "Point-In-Time Recovery: restore a base backup and replay archived WAL up to a chosen moment." },
    ],
    followUps: [
      { q: "Can you write to a streaming replica?", a: "No. Hot standbys are read-only; writes fail with 'cannot execute ... in a read-only transaction'. Logical replication subscribers are writable (but you must avoid conflicts)." },
      { q: "How would you guarantee a user sees their own write when reads go to replicas?", a: "Return the commit LSN (`pg_current_wal_lsn()` after commit) to the client/session, and on reads route to a replica only if `pg_last_wal_replay_lsn() >= that LSN`, else use the primary. Simpler: stick to the primary for a few seconds after a write." },
      { q: "Why does an inactive replication slot threaten the primary?", a: "The primary keeps all WAL from the slot's restart LSN onward; pg_wal grows until the disk fills and the primary stops. Monitor `pg_replication_slots` and set max_slot_wal_keep_size." },
    ],
    quiz: [
      {
        id: "repl-q1",
        prompt: "With one sync standby and `synchronous_commit = on`, what does COMMIT wait for?",
        options: ["Nothing remote", "Standby received WAL in memory", "Standby flushed WAL to durable storage", "Standby replayed the transaction"],
        answer: 2,
        explanation: "`on` waits for the remote flush. `remote_write` waits for the OS write; `remote_apply` waits for replay.",
      },
      {
        id: "repl-q2",
        prompt: "An async replica is promoted after the primary's disk dies. What can happen?",
        options: ["Nothing is lost by definition", "Transactions committed on the old primary but not yet streamed are lost", "The replica refuses to promote", "All replicas must be rebuilt from the WAL archive first"],
        answer: 1,
        explanation: "Asynchronous replication means RPO > 0: commits acknowledged to clients may never have reached the replica.",
      },
    ],
  },
  // ───────────────────────────────────────────── partitioning-sharding
  {
    slug: "partitioning-sharding",
    track: "databases",
    title: "Partitioning and sharding in practice",
    summary: "Splitting one big table into partitions inside a single Postgres instance (declarative range/list/hash partitioning) vs splitting data across many database servers (sharding) — and what each costs you.",
    level: "advanced",
    frequency: "high",
    minutes: 40,
    kinds: ["theory", "system-design"],
    status: "outline",
    prerequisites: ["databases/indexing", "databases/transactions-acid"],
    related: ["system-design/sharding-partitioning", "databases/database-scaling", "distributed/distributed-transactions"],
    tags: ["partitioning", "sharding", "postgres", "citus", "scaling"],
    sources: [
      pg("PostgreSQL: Table Partitioning", "ddl-partitioning.html"),
      { label: "Citus documentation (distributed Postgres)", url: "https://docs.citusdata.com/", kind: "docs" },
      { label: "Vitess documentation (sharded MySQL)", url: "https://vitess.io/docs/", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [{ type: "list", items: [
          "Distinguish partitioning (one node, many physical tables) from sharding (many nodes)",
          "Create range, list and hash partitions in Postgres and verify partition pruning with EXPLAIN",
          "Choose a shard key: cardinality, even distribution, query locality, hot keys",
          "Understand what sharding breaks: cross-shard joins, transactions, unique constraints, rebalancing",
        ] }],
      },
      {
        id: "examples",
        blocks: [{ type: "code", lang: "sql", caption: "Declarative range partitioning (PostgreSQL 10+)", code: `CREATE TABLE events (
  id bigint, created_at timestamptz NOT NULL, payload jsonb
) PARTITION BY RANGE (created_at);

CREATE TABLE events_2026_10 PARTITION OF events
  FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

-- Dropping a month of data is now a metadata operation:
-- DROP TABLE events_2025_10;` }],
      },
      {
        id: "summary",
        title: "What this lesson will cover",
        blocks: [{ type: "list", items: [
          "Partition pruning, partition-wise joins, per-partition indexes and their limits (unique constraints must include the partition key)",
          "Retention by detaching/dropping partitions; automation with pg_partman",
          "Sharding strategies: range, hash, directory/lookup; consistent hashing",
          "Application-level sharding vs Citus/Vitess; resharding and hot-shard mitigation",
        ] }],
      },
    ],
  },

  // ───────────────────────────────────────────── database-scaling
  {
    slug: "database-scaling",
    track: "databases",
    title: "Database scaling playbook",
    summary: "An ordered playbook for scaling a relational database: fix queries and indexes, pool connections, cache, scale up, add read replicas, partition, and only then shard.",
    level: "advanced",
    frequency: "very-high",
    minutes: 35,
    kinds: ["system-design"],
    status: "outline",
    prerequisites: ["databases/indexing", "databases/postgres-replication", "databases/connection-pooling"],
    related: ["system-design/vertical-vs-horizontal-scaling", "system-design/caching-strategies", "system-design/sharding-partitioning", "databases/partitioning-sharding", "backend/redis"],
    tags: ["scaling", "replicas", "caching", "sharding", "postgres"],
    sources: [
      pg("PostgreSQL: Performance Tips", "performance-tips.html"),
      pg("PostgreSQL: pg_stat_statements", "pgstatstatements.html"),
      { label: "Designing Data-Intensive Applications (Kleppmann), ch. 5–6", kind: "external" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [{ type: "list", items: [
          "Find the actual bottleneck first (pg_stat_statements, EXPLAIN, CPU vs I/O vs connections vs locks)",
          "Apply cheap fixes before architectural ones",
          "Know what each step costs in consistency and operational complexity",
        ] }],
      },
      {
        id: "walkthrough",
        title: "The playbook (in order)",
        blocks: [{ type: "steps", steps: [
          { title: "Measure", detail: "Top queries by total time in pg_stat_statements; check cache hit ratio, locks, connection count." },
          { title: "Fix queries and indexes", detail: "N+1 queries, missing indexes, SELECT *, unbounded OFFSET pagination." },
          { title: "Pool connections", detail: "PgBouncer / app pool sizing." },
          { title: "Cache", detail: "Redis/app cache for hot, read-heavy data (with an invalidation story)." },
          { title: "Scale up", detail: "More RAM/CPU/IOPS — underrated and simple." },
          { title: "Read replicas", detail: "Offload reads; handle replication lag." },
          { title: "Partition", detail: "Keep hot data and indexes small; cheap retention." },
          { title: "Shard / distributed SQL", detail: "When write volume or data size exceeds one node." },
        ] }],
      },
      {
        id: "summary",
        title: "What this lesson will cover",
        blocks: [{ type: "list", items: [
          "Worked diagnosis of a slow system using pg_stat_statements",
          "Cost/benefit table for each step, including consistency side effects",
          "CQRS/read models and moving analytics off the OLTP database",
        ] }],
      },
    ],
  },

  // ───────────────────────────────────────────── orm-vs-odm
  {
    slug: "orm-vs-odm",
    track: "databases",
    title: "ORM vs ODM: Prisma, Sequelize, SQLAlchemy, Mongoose",
    summary: "What object-relational mappers and object-document mappers do for you, how they differ (MongoDB driver vs Mongoose, Prisma, Sequelize, SQLAlchemy), and the classic traps: N+1 queries, hidden transactions and leaky abstractions.",
    level: "intermediate",
    frequency: "high",
    minutes: 45,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["databases/relational-model-sql"],
    related: ["databases/prisma", "databases/connection-pooling", "system-design/sql-vs-nosql", "system-design/data-modeling", "backend/rest-graphql-grpc-trpc"],
    tags: ["orm", "odm", "prisma", "sequelize", "sqlalchemy", "mongoose", "mongodb", "n+1"],
    sources: [
      { label: "Prisma ORM documentation", url: "https://www.prisma.io/docs/orm", kind: "docs" },
      { label: "Sequelize documentation", url: "https://sequelize.org/docs/v6/", kind: "docs" },
      { label: "SQLAlchemy 2.0 documentation (ORM + Core)", url: "https://docs.sqlalchemy.org/en/20/", kind: "docs" },
      { label: "Mongoose documentation", url: "https://mongoosejs.com/docs/", kind: "docs" },
      { label: "MongoDB Node.js driver documentation", url: "https://www.mongodb.com/docs/drivers/node/current/", kind: "docs" },
      { label: "Martin Fowler — Patterns of Enterprise Application Architecture (Active Record, Data Mapper, Unit of Work)", url: "https://martinfowler.com/eaaCatalog/", kind: "external" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [{ type: "list", items: [
          "Define ORM and ODM and the impedance mismatch they address",
          "Contrast Active Record (Sequelize, Mongoose documents) with Data Mapper / Unit of Work (SQLAlchemy) and Prisma's query-builder style",
          "Explain what Mongoose adds over the raw MongoDB driver (schemas, validation, middleware, populate)",
          "Detect and fix N+1 queries; know when to drop to raw SQL",
        ] }],
      },
      {
        id: "intuition",
        blocks: [
          { type: "p", text: "Your code thinks in objects with nested fields and references; a relational database thinks in flat rows joined by keys. That mismatch (the **object-relational impedance mismatch**) is what an ORM papers over: you write `user.posts`, it writes the SQL." },
          { type: "p", text: "A document database like MongoDB already stores nested JSON-like documents, so the mismatch is smaller. An **ODM** like Mongoose is less about translation and more about adding the *schema and validation* that MongoDB itself doesn't require." },
        ],
      },
      {
        id: "definition",
        blocks: [
          { type: "table", head: ["Tool", "Kind", "Style", "Notes"], rows: [
            ["MongoDB driver", "Driver", "Plain documents and query objects", "No schema enforced by the client; maximum control"],
            ["Mongoose", "ODM (MongoDB)", "Schema + Model + Active Record documents", "Validation, casting, defaults, middleware hooks, `populate()` for references (extra queries, not joins)"],
            ["Prisma ORM", "ORM (SQL + MongoDB)", "Schema file → generated, fully typed client; plain objects, no entity classes", "Declarative migrations; relation queries via `include`/`select`"],
            ["Sequelize", "ORM (SQL)", "Active Record models (`User.findAll`, `user.save()`)", "Mature, JS-first; typings less precise"],
            ["SQLAlchemy", "Toolkit + ORM (Python)", "Core (SQL expression language) + ORM with Data Mapper and Session (Unit of Work)", "Very powerful; explicit session/transaction management"],
          ] },
          { type: "callout", tone: "note", title: "Active Record vs Data Mapper", text: "**Active Record**: the object knows how to save itself (`user.save()`). **Data Mapper**: plain objects; a separate mapper/session tracks changes and flushes them (SQLAlchemy's Session is a Unit of Work that batches INSERT/UPDATEs at flush/commit)." },
        ],
      },
      {
        id: "why",
        blocks: [{ type: "list", items: [
          "Productivity: CRUD without hand-written SQL, typed results (Prisma, SQLAlchemy 2.0 typing)",
          "Safety: parameterised queries by default (SQL injection protection — unless you use raw string APIs unsafely)",
          "Migrations and a single source of truth for the schema",
          "Portability across databases (in theory; in practice you'll use DB-specific features)",
        ] }],
      },
      {
        id: "internals",
        title: "How the N+1 problem happens",
        blocks: [
          { type: "p", text: "Lazy loading means accessing a relation triggers a query *at that moment*. In a loop over N parents, that's 1 query for the list + N queries for children." },
          { type: "code", lang: "ts", caption: "Prisma: N+1 vs one relation query", code: `// N+1: 1 query for users, then 1 per user
const users = await prisma.user.findMany();
for (const u of users) {
  const posts = await prisma.post.findMany({ where: { authorId: u.id } });
}

// Better: let Prisma fetch the relation in bulk
const usersWithPosts = await prisma.user.findMany({ include: { posts: true } });` },
          { type: "callout", tone: "spec-vs-impl", title: "How each tool loads relations", text: "Prisma historically resolved `include` with one extra query per relation level using `WHERE authorId IN (...)` (not N+1); Prisma 5.x introduced `relationLoadStrategy: \"join\"` (behind the `relationJoins` preview flag at first) to use database-level JOINs/JSON aggregation instead — check the docs for its status in your version. SQLAlchemy offers `selectinload` (IN query) and `joinedload` (JOIN). Sequelize uses JOINs for `include`. Mongoose `populate()` issues a separate `$in` query per path. Check the generated SQL with query logging." },
        ],
      },
      {
        id: "examples",
        blocks: [
          { type: "code", lang: "ts", caption: "Mongoose adds schema, casting and validation on top of MongoDB", code: `import mongoose from "mongoose";

const User = mongoose.model("User", new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  age:   { type: Number, min: 0 },
}));

const u = new User({ email: "A@X.IO", age: "42" });
console.log(u.email, typeof u.age);   // a@x.io number   (cast by the schema)
console.log(new User({ age: -1 }).validateSync()?.errors.email?.kind); // required` },
          { type: "code", lang: "python", caption: "SQLAlchemy 2.0: Session as Unit of Work", code: `from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

with Session(engine) as session, session.begin():
    users = session.scalars(
        select(User).options(selectinload(User.posts))  # 2 queries total
    ).all()
    users[0].name = "renamed"   # tracked; UPDATE emitted at flush/commit` },
        ],
      },
      {
        id: "mistakes",
        blocks: [{ type: "list", items: [
          "N+1 queries from lazy relations inside loops (and in GraphQL resolvers)",
          "Fetching whole rows/documents when you need two columns (use `select`)",
          "Assuming each ORM call is a transaction — multiple calls are separate unless wrapped (`prisma.$transaction`, `session.begin()`, `sequelize.transaction`)",
          "Building raw SQL with string interpolation (`$queryRawUnsafe`, `sequelize.query` with template strings) → SQL injection",
          "Treating Mongoose `populate()` as a join — it's an extra round trip per path, and has no transactional consistency with the parent read",
          "Letting the ORM's schema drift from migrations actually applied in production",
        ] }],
      },
      {
        id: "tradeoffs",
        blocks: [{ type: "compare", items: [
          { title: "ORM / ODM", points: ["Fast CRUD, typed models, migrations", "Consistent validation", "Hides query cost; easy to write slow code", "Complex reporting queries get awkward"] },
          { title: "Query builder / raw SQL (Kysely, Drizzle, sqlc, SQLAlchemy Core)", points: ["Full control of SQL and performance", "Use every DB feature (CTEs, window functions, upserts)", "More code; mapping by hand or via codegen"] },
        ] }],
      },
      {
        id: "interview-short",
        blocks: [{ type: "p", text: "An ORM maps relational rows to objects so you can query and persist with code instead of SQL; an ODM like Mongoose does the same for document databases, mostly adding schemas, casting, validation and hooks that MongoDB doesn't enforce. Styles differ: Sequelize and Mongoose are Active Record, SQLAlchemy is a Data Mapper with a Unit-of-Work session, Prisma generates a typed client from a schema file. They boost productivity and prevent injection by parameterising queries, but hide cost — the classic issue is N+1 from lazy relations, fixed with eager loading or batching. For complex queries I drop to raw SQL or a query builder." }],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: [
          "ORM = rows ↔ objects; ODM = documents ↔ objects + schema/validation",
          "Active Record vs Data Mapper vs generated client",
          "Always look at the SQL your ORM emits; kill N+1 with eager loading/batching",
          "Wrap multi-step writes in explicit transactions",
        ] }],
      },
    ],
    glossary: [
      { term: "ORM", definition: "Object-Relational Mapper: library mapping relational tables/rows to programming-language objects." },
      { term: "ODM", definition: "Object-Document Mapper: maps documents in a document DB (e.g. MongoDB) to objects with schemas." },
      { term: "Impedance mismatch", definition: "Conceptual gap between object graphs in code and relational tables." },
      { term: "N+1 query", definition: "One query for a list plus one query per item to load a relation." },
      { term: "Eager loading", definition: "Fetching related data up front in bulk instead of lazily per access." },
      { term: "Unit of Work", definition: "Pattern that tracks changed objects during a business transaction and writes them out together." },
    ],
    followUps: [
      { q: "Does using an ORM eliminate SQL injection?", a: "Only for the parameterised APIs. Raw-query escape hatches with string interpolation are still injectable; use tagged/parameterised variants (e.g. Prisma's `$queryRaw` tagged template)." },
      { q: "MongoDB has schema validation now — why still use Mongoose?", a: "MongoDB's `$jsonSchema` validation is server-side and useful, but Mongoose adds client-side casting, defaults, virtuals, middleware and population. Many teams use both, or just the driver with a validation library (zod) for less magic." },
      { q: "How do you find N+1 queries in production?", a: "Enable query logging or APM tracing (OpenTelemetry DB spans), and look for many identical queries with different parameters within one request." },
    ],
    quiz: [
      {
        id: "orm-q1",
        prompt: "A Mongoose `populate('author')` on 50 posts typically results in…",
        options: ["A SQL JOIN", "One extra query using $in for the referenced authors", "50 extra queries always", "No queries — it's cached"],
        answer: 1,
        explanation: "populate collects referenced ids and issues a separate find with `$in` per path. It's not a server-side join.",
      },
      {
        id: "orm-q2",
        prompt: "Which tool follows the Data Mapper / Unit of Work pattern?",
        options: ["Mongoose", "Sequelize", "SQLAlchemy ORM", "The MongoDB driver"],
        answer: 2,
        explanation: "SQLAlchemy's Session tracks object changes and flushes them as a unit; entities don't save themselves.",
      },
    ],
  },
  // ───────────────────────────────────────────── prisma
  {
    slug: "prisma",
    track: "databases",
    title: "Prisma: schema, client, limitations and Accelerate",
    summary: "How Prisma's schema → generated client → query engine pipeline works, its connection pool settings, known limitations (raw SQL escape hatches, bulk operations, serverless cold starts), and what Prisma Accelerate adds (managed pooling + caching).",
    level: "intermediate",
    frequency: "medium",
    minutes: 40,
    kinds: ["theory", "coding"],
    status: "outline",
    prerequisites: ["databases/orm-vs-odm", "databases/connection-pooling"],
    related: ["databases/orm-vs-odm", "databases/connection-pooling", "typescript/generics"],
    tags: ["prisma", "orm", "typescript", "connection-pooling", "serverless", "accelerate"],
    sources: [
      { label: "Prisma ORM docs", url: "https://www.prisma.io/docs/orm", kind: "docs" },
      { label: "Prisma: Connection pool", url: "https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool", kind: "docs" },
      { label: "Prisma: Configure Prisma Client with PgBouncer", url: "https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer", kind: "docs" },
      { label: "Prisma Accelerate docs", url: "https://www.prisma.io/docs/accelerate", kind: "docs" },
      { label: "Prisma: Transactions and batch queries", url: "https://www.prisma.io/docs/orm/prisma-client/queries/transactions", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [{ type: "list", items: [
          "Describe the Prisma pipeline: `schema.prisma` → `prisma generate` → typed client → query engine → database",
          "Use migrations (`prisma migrate dev` vs `migrate deploy`) correctly across environments",
          "Configure the client's connection pool (`connection_limit`, `pool_timeout`) and use it behind PgBouncer",
          "Know the limitations and escape hatches (`$queryRaw`, `$transaction`, interactive transactions)",
          "Explain what Prisma Accelerate offers: a managed connection pool in front of your DB plus an optional global query cache",
        ] }],
      },
      {
        id: "definition",
        blocks: [
          { type: "code", lang: "text", caption: "schema.prisma (excerpt)", code: `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  posts Post[]
}

model Post {
  id       Int  @id @default(autoincrement())
  author   User @relation(fields: [authorId], references: [id])
  authorId Int
  @@index([authorId])
}` },
          { type: "callout", tone: "spec-vs-impl", title: "Moving parts change between versions", text: "For most of its history Prisma Client delegated query execution to a Rust **query engine** binary/library bundled per platform, with its own connection pool (default size `num_physical_cpus * 2 + 1`). Newer releases add **driver adapters** (use JS drivers like `pg` or serverless drivers such as Neon's) and a TypeScript-based query compiler that removes the Rust engine. Older PgBouncer versions needed `?pgbouncer=true` to disable prepared statements; PgBouncer 1.21+ can track protocol-level prepared statements. Verify against the docs for the version you run." },
        ],
      },
      {
        id: "summary",
        title: "What this lesson will cover",
        blocks: [{ type: "list", items: [
          "One PrismaClient per process (the hot-reload singleton pattern in Next.js dev)",
          "Limitations: complex SQL (CTEs, window functions) via `$queryRaw`/TypedSQL, bulk upserts, long interactive transactions, cold-start size in serverless",
          "Pool sizing per instance × number of instances ≤ database capacity; using PgBouncer/RDS Proxy/Accelerate in serverless",
          "Accelerate: connection pooling over HTTP from edge/serverless runtimes, per-query cache strategies (TTL, stale-while-revalidate) and their consistency implications",
          "Reading Prisma query logs and OpenTelemetry tracing to spot N+1",
        ] }],
      },
    ],
  },

  // ───────────────────────────────────────────── connection-pooling
  {
    slug: "connection-pooling",
    track: "databases",
    title: "Connection pooling: PgBouncer and serverless pitfalls",
    summary: "Why opening a Postgres connection is expensive, how application-side pools and PgBouncer (session / transaction / statement modes) multiplex many clients onto few server connections, how to size pools, and why serverless functions exhaust connections.",
    level: "intermediate",
    frequency: "high",
    minutes: 45,
    kinds: ["theory", "system-design", "coding"],
    status: "authored",
    prerequisites: ["databases/transactions-acid", "os/processes-threads"],
    related: ["databases/prisma", "databases/database-scaling", "system-design/backpressure", "go/backpressure-bounded-concurrency", "networks/tcp"],
    tags: ["connection-pool", "pgbouncer", "serverless", "postgres", "rds-proxy", "pool-sizing"],
    sources: [
      { label: "PgBouncer: Usage and pooling modes", url: "https://www.pgbouncer.org/usage.html", kind: "docs" },
      { label: "PgBouncer: Feature matrix per pooling mode", url: "https://www.pgbouncer.org/features.html", kind: "docs" },
      { label: "PgBouncer: Configuration", url: "https://www.pgbouncer.org/config.html", kind: "docs" },
      pg("PostgreSQL: Connections and Authentication (max_connections)", "runtime-config-connection.html"),
      pg("PostgreSQL: Architectural fundamentals (process per connection)", "tutorial-arch.html"),
      { label: "node-postgres: Pooling", url: "https://node-postgres.com/features/pooling", kind: "docs" },
      { label: "HikariCP wiki: About Pool Sizing", url: "https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing", kind: "external" },
      { label: "AWS: Amazon RDS Proxy", url: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy.html", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [{ type: "list", items: [
          "Explain the cost of a Postgres connection (process, memory, TLS + auth handshake)",
          "Describe how an application-side pool works: checkout, return, wait queue, timeouts",
          "Compare PgBouncer's session, transaction and statement modes and what breaks in each",
          "Size pools from database capacity, not from request concurrency",
          "Diagnose and fix serverless connection exhaustion",
        ] }],
      },
      {
        id: "intuition",
        blocks: [
          { type: "p", text: "A database connection is like a phone line to a busy call centre with a fixed number of agents. Dialling (TCP + TLS + authentication + spawning a backend) is slow, and each open line occupies an agent even when you're silent. A pool keeps a few lines open and hands them to whoever needs to talk *right now*." },
          { type: "p", text: "More lines doesn't mean more throughput: the database has a fixed number of CPU cores and disks. Past a point, extra concurrent queries just contend for locks, CPU and memory, and everyone gets slower." },
        ],
      },
      {
        id: "definition",
        blocks: [
          { type: "p", text: "A **connection pool** maintains a bounded set of open database connections and lends them to callers for the duration of a query or transaction. Pools live either **in-process** (node-postgres `Pool`, Go `database/sql`, HikariCP, Prisma's engine) or **out-of-process** as a proxy (PgBouncer, RDS Proxy, Supavisor, Prisma Accelerate) that many app instances share." },
        ],
      },
      {
        id: "why",
        blocks: [
          { type: "list", items: [
            "Postgres forks one **backend process** per connection. Each costs memory (a few MB baseline, more with `work_mem` usage and caches) and scheduler overhead.",
            "`max_connections` defaults to 100; raising it to thousands degrades performance (snapshot computation and lock-manager costs grow with connection count).",
            "New connections cost several round trips: TCP handshake, TLS handshake, startup + authentication (SCRAM), then backend fork — milliseconds that add up per request.",
          ] },
          { type: "callout", tone: "spec-vs-impl", title: "Engine-specific", text: "The process-per-connection model is PostgreSQL's (PG 14 improved snapshot scalability with many connections, but the per-process cost remains). MySQL uses a thread per connection; managed services cap connections by instance size." },
        ],
      },
      {
        id: "internals",
        blocks: [
          { type: "steps", steps: [
            { title: "Checkout", detail: "Caller asks the pool for a connection. If one is idle, it's handed over immediately." },
            { title: "Grow", detail: "If none is idle and size < max, the pool opens a new connection." },
            { title: "Wait", detail: "At max, the caller waits in a queue up to an acquire timeout (e.g. `connectionTimeoutMillis`, Prisma `pool_timeout`) — this is backpressure." },
            { title: "Use", detail: "The caller runs its query or whole transaction on that one connection (a transaction must stay on one connection)." },
            { title: "Release", detail: "Connection returns to the pool (after a reset if needed). Idle connections beyond the minimum are closed after an idle timeout." },
          ] },
          { type: "p", text: "**PgBouncer** speaks the Postgres protocol to clients and holds a smaller pool of real server connections. Its **pool mode** decides when a server connection is returned:" },
          { type: "table", head: ["Mode", "Server connection released", "Multiplexing", "What breaks"], rows: [
            ["session", "When the client disconnects", "Low (just saves connect cost)", "Nothing — full session semantics"],
            ["transaction", "At end of each transaction", "High — most common", "Session state across transactions: `SET` (use `SET LOCAL`), session advisory locks, `LISTEN`, temp tables kept across transactions, protocol prepared statements (unless PgBouncer ≥ 1.21 with `max_prepared_statements`)"],
            ["statement", "After every statement", "Highest", "Multi-statement transactions are disallowed"],
          ] },
          { type: "flow", nodes: ["1000 client connections", "PgBouncer (transaction mode)", "20 server connections", "PostgreSQL"], caption: "Conceptual: many short transactions share a few backends" },
        ],
      },
      {
        id: "walkthrough",
        title: "Sizing a pool",
        blocks: [
          { type: "p", text: "Start from what the database can do in parallel, then divide among clients. A widely quoted starting point (from the HikariCP/PostgreSQL community) is `connections ≈ (cores × 2) + effective_spindle_count` for the *whole* database — then load test. Short queries need surprisingly few connections." },
          { type: "code", lang: "text", caption: "Budget example", code: `DB: 8 vCPU, max_connections = 100, reserve 10 for admin/migrations/replication
Usable: 90
App: 6 instances (autoscaling up to 10)
Per-instance pool max = floor(90 / 10) = 9   <- size for the MAX instance count` },
          { type: "code", lang: "js", caption: "node-postgres pool with explicit limits", code: `import pg from "pg";
const pool = new pg.Pool({
  max: 9,                        // per process
  idleTimeoutMillis: 10_000,     // close idle connections
  connectionTimeoutMillis: 2_000 // fail fast instead of queueing forever
});

// Single query: pool checks out + releases for you
const { rows } = await pool.query("SELECT now()");

// Transaction: must hold ONE client for all statements
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query("UPDATE acct SET balance = balance - 10 WHERE id = 1");
  await client.query("UPDATE acct SET balance = balance + 10 WHERE id = 2");
  await client.query("COMMIT");
} catch (e) {
  await client.query("ROLLBACK");
  throw e;
} finally {
  client.release();              // forgetting this leaks the connection
}` },
        ],
      },
      {
        id: "edge-cases",
        title: "Serverless pitfalls",
        blocks: [
          { type: "list", items: [
            "Each function instance (Lambda container, Vercel function) has its **own** in-process pool. 300 concurrent invocations × pool size 5 = 1500 connections → `FATAL: sorry, too many clients already`.",
            "Frozen instances keep TCP connections open while idle; the DB still counts them.",
            "Cold starts pay the full connect + TLS cost on the request path.",
          ] },
          { type: "steps", steps: [
            { title: "Put an external pooler in front", detail: "PgBouncer (transaction mode), RDS Proxy, Supabase Supavisor, Neon's pooled endpoint, or Prisma Accelerate." },
            { title: "Keep in-function pools tiny", detail: "max 1–2 per instance; create the pool outside the handler so warm invocations reuse it." },
            { title: "Cap concurrency", detail: "Reserved concurrency on the function so it can't exceed the DB budget." },
            { title: "Consider HTTP/WebSocket drivers", detail: "Serverless drivers (e.g. Neon serverless, PlanetScale) and data proxies avoid long-lived TCP connections from ephemeral runtimes." },
          ] },
        ],
      },
      {
        id: "mistakes",
        blocks: [{ type: "list", items: [
          "Pool max = expected concurrent HTTP requests (thousands) — the DB becomes the contention point",
          "Not releasing clients on error paths → pool slowly drains, then every request times out",
          "Running BEGIN and COMMIT through `pool.query` (each call may get a different connection)",
          "Using `SET search_path` / session variables behind PgBouncer transaction mode",
          "Holding a connection while awaiting an external API call",
          "Creating a new pool (or new PrismaClient) per request",
        ] }],
      },
      {
        id: "tradeoffs",
        blocks: [{ type: "compare", items: [
          { title: "In-process pool", points: ["No extra hop, simplest", "Full session features", "Total connections = instances × max — explodes with autoscaling/serverless"] },
          { title: "External pooler (PgBouncer, RDS Proxy)", points: ["Caps server connections regardless of client count", "Extra network hop and component to operate", "Transaction mode restricts session features"] },
        ] }],
      },
      {
        id: "interview-short",
        blocks: [{ type: "p", text: "Postgres creates a process per connection, and establishing one costs TCP, TLS and auth round trips, so we reuse a bounded set via a pool. The pool size should reflect what the database can execute in parallel — roughly a small multiple of its cores — not request concurrency; excess callers wait, which is healthy backpressure. With many app instances or serverless functions, per-process pools multiply, so we put PgBouncer or RDS Proxy in front. Transaction mode gives the best multiplexing but breaks session state like SET, LISTEN, advisory locks and, on older PgBouncer, prepared statements." }],
      },
      {
        id: "interview-deep",
        blocks: [{ type: "list", items: [
          "Little's law: required connections ≈ throughput × average time holding a connection. 2000 qps × 5 ms = 10 connections busy on average.",
          "Pool wait time is a key metric — if it grows while DB CPU is low, look for slow transactions holding connections (or leaks).",
          "PgBouncer is single-threaded per process; at very high rates run several (`so_reuseport`) or use a multi-threaded pooler.",
          "Prepared statements + transaction pooling: older setups disabled them (Prisma `pgbouncer=true`), PgBouncer 1.21+ can map them across server connections.",
        ] }],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: [
          "Connections are expensive; reuse them",
          "Size pools from DB capacity and divide across max instances",
          "PgBouncer transaction mode = high multiplexing, no session state",
          "Serverless: external pooler + tiny per-instance pools + concurrency caps",
        ] }],
      },
    ],
    glossary: [
      { term: "Backend process", definition: "The server process Postgres forks to serve one client connection." },
      { term: "max_connections", definition: "Postgres setting limiting concurrent connections (default 100)." },
      { term: "PgBouncer", definition: "Lightweight Postgres connection pooler/proxy multiplexing client connections onto fewer server connections." },
      { term: "Transaction pooling", definition: "Pooler mode returning the server connection after each transaction." },
      { term: "Acquire timeout", definition: "Maximum time a caller waits for a free pooled connection before erroring." },
      { term: "Connection leak", definition: "A checked-out connection that is never released back to the pool." },
      { term: "Little's law", definition: "L = λ × W: average items in a system = arrival rate × average time each spends in it." },
    ],
    followUps: [
      { q: "Why not just set max_connections = 5000?", a: "Each connection is a process with memory overhead; many active backends thrash CPU caches and contend on locks, and per-snapshot work grows with connection count. Throughput usually peaks at a small multiple of cores and then falls." },
      { q: "How do you use advisory locks with PgBouncer in transaction mode?", a: "Use transaction-scoped locks (`pg_advisory_xact_lock`), which are released at commit/rollback, instead of session-level `pg_advisory_lock`." },
      { q: "Where would you run PgBouncer?", a: "Either as a central tier in front of the DB (shared cap across all apps) or as a sidecar per app host (cuts connect cost, but doesn't cap global connections). Many deployments use both." },
    ],
    quiz: [
      {
        id: "pool-q1",
        prompt: "Which feature is unsafe through PgBouncer in transaction mode?",
        options: ["`SET LOCAL statement_timeout = '5s'` inside a transaction", "`SET search_path = tenant_a` at connection start", "A single-statement INSERT", "`pg_advisory_xact_lock`"],
        answer: 1,
        explanation: "Session-level SET persists on the server connection, which will be handed to other clients after your transaction. SET LOCAL and xact locks are transaction-scoped.",
      },
      {
        id: "pool-q2",
        prompt: "A service handles 1000 req/s, each holding a connection for 20 ms. Roughly how many connections are busy on average?",
        options: ["2", "20", "200", "1000"],
        answer: 1,
        explanation: "Little's law: 1000 × 0.02 s = 20.",
      },
      {
        id: "pool-q3",
        prompt: "Why do serverless functions commonly exhaust Postgres connections?",
        options: ["They use UDP", "Each concurrent instance has its own pool, so total connections scale with concurrency", "Postgres blocks serverless IPs", "Pools don't work in Node"],
        answer: 1,
        explanation: "Instances don't share memory, so pools multiply; an external pooler fixes it.",
      },
    ],
  },
];
