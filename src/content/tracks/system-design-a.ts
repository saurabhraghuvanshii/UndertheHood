import type { Lesson, SourceRef } from "../types";

/**
 * System design lessons, part A: the interview framework + checklist topics 1–20.
 * Track structure lives in `system-design.ts`; topics 21–40 live in `system-design-b.ts`.
 */

const CHECKLIST: SourceRef = { label: "Learner's 40-topic system design checklist", kind: "original-note" };
const DDIA: SourceRef = { label: "Designing Data-Intensive Applications — Martin Kleppmann", url: "https://dataintensive.net/", kind: "external" };
const SRE: SourceRef = { label: "Google SRE Book", url: "https://sre.google/sre-book/table-of-contents/", kind: "docs" };
const SD_PRIMER: SourceRef = { label: "The System Design Primer (donnemartin)", url: "https://github.com/donnemartin/system-design-primer", kind: "external" };
const AWS_TIMEOUTS: SourceRef = { label: "AWS Builders' Library — Timeouts, retries and backoff with jitter", url: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/", kind: "external" };
const AWS_CACHING: SourceRef = { label: "AWS Builders' Library — Caching challenges and strategies", url: "https://aws.amazon.com/builders-library/caching-challenges-and-strategies/", kind: "external" };
const PG_ISOLATION: SourceRef = { label: "PostgreSQL docs — Transaction Isolation", url: "https://www.postgresql.org/docs/current/transaction-iso.html", kind: "docs" };
const JEPSEN: SourceRef = { label: "Jepsen — Consistency Models", url: "https://jepsen.io/consistency", kind: "external" };
const DYNAMO: SourceRef = { label: "Dynamo: Amazon's Highly Available Key-value Store (SOSP 2007)", url: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf", kind: "external" };

export const lessons: Lesson[] = [
  // ───────────────────────────────────────────────────────────── interview-framework
  {
    slug: "interview-framework",
    track: "system-design",
    title: "The system design interview framework",
    summary:
      "A repeatable 12-step method for any design question — from clarifying requirements to defending trade-offs — with a 45-minute time budget, what interviewers actually score, and the failure modes to avoid.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 35,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: [],
    related: [
      "system-design/capacity-estimation",
      "system-design/latency-throughput",
      "system-design/sql-vs-nosql",
      "system-design/caching-strategies",
      "system-design/sharding-partitioning",
      "system-design/cap-theorem",
    ],
    tags: ["interview", "method", "framework", "requirements", "estimation", "trade-offs"],
    sources: [
      CHECKLIST,
      SD_PRIMER,
      DDIA,
      SRE,
      { label: "AWS Well-Architected Framework", url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Run any design question through the same 12 steps so you never stall or skip something important.",
              "Budget a 45-minute interview so you reach the deep dive instead of drowning in requirements.",
              "Know what interviewers score: problem framing, structured thinking, technical depth, trade-off reasoning and communication.",
              "Recognise the classic failure modes (jumping to boxes, buzzword soup, no numbers, no trade-offs) and the phrases that avoid them.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A system design interview is not a quiz with one right answer. It is a simulated design review: a senior engineer wants to watch how you turn a vague product request into a system that works, scales and fails gracefully — and how you explain *why* you chose each piece.",
          },
          {
            type: "p",
            text: "A framework is a checklist pilots use before take-off: it frees your head for the interesting parts because the routine parts are automatic. You don't recite it robotically — you use it to steer the conversation and to recover when you get lost.",
          },
        ],
      },
      {
        id: "definition",
        title: "The 12 steps",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "1. Clarify functional requirements", detail: "What must the system *do*? List 3–5 core user actions (e.g. 'shorten a URL', 'redirect', 'see click stats'). Explicitly park everything else as out of scope." },
              { title: "2. Non-functional requirements", detail: "How well must it do it? Scale (DAU, QPS), latency targets (p99 < 200 ms), availability (99.9% vs 99.99%), consistency needs, durability, cost, compliance." },
              { title: "3. Assumptions & constraints", detail: "State what you are assuming out loud: read/write ratio, object sizes, geography, retention, team size, existing infrastructure. Assumptions make estimates possible and are easy for the interviewer to correct." },
              { title: "4. Estimate traffic, storage, resources", detail: "Back-of-the-envelope: average and peak QPS, storage per year, bandwidth, memory for a cache working set, rough server counts. Numbers decide whether you need sharding, caching or a CDN." },
              { title: "5. APIs & data models", detail: "Define the contract (endpoints or RPCs with key fields) and the core entities with their access patterns. Access patterns drive the database choice and indexes." },
              { title: "6. High-level architecture", detail: "Draw the simplest system that meets the functional requirements: clients, edge (DNS/CDN/LB), stateless services, data stores, async workers. Keep it to ~6–10 boxes." },
              { title: "7. Main request flows", detail: "Walk the critical paths through your diagram — e.g. the write path and the read path — step by step. This proves the boxes actually connect." },
              { title: "8. Bottlenecks", detail: "Using your numbers, find what breaks first: a hot database, a fan-out, a single point of failure, a hot key, cross-region latency." },
              { title: "9. Choose databases, caches, queues, infra", detail: "Now justify concrete technology choices against the access patterns: SQL vs NoSQL, which cache and where, which queue, object storage, search index." },
              { title: "10. Scaling, consistency, availability, failure handling", detail: "Sharding and replication strategy, consistency model per data type, what happens when a node, zone or dependency fails (timeouts, retries, idempotency, failover)." },
              { title: "11. Security, observability, operations", detail: "AuthN/AuthZ, encryption, rate limiting, abuse; metrics/logs/traces and the SLOs you would alert on; deployments, migrations, on-call concerns." },
              { title: "12. Trade-offs & alternatives", detail: "Summarise the key decisions, what you gave up for each, and what you would change at 10× scale or with different requirements." },
            ],
          },
          {
            type: "callout",
            tone: "tip",
            title: "Memory hook",
            text: "Steps 1–5 are *what* (requirements → numbers → contract), 6–7 are *the design*, 8–10 are *making it survive scale and failure*, 11–12 are *making it operable and defensible*.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "**Ambiguity is the test.** Prompts like 'design Twitter' are deliberately vague; clarifying is a scored skill, not a delay.",
              "**Numbers prevent over- and under-engineering.** 50 QPS fits on one Postgres box; 500k QPS does not. Without estimates every choice is a guess.",
              "**Structure makes depth possible.** If the skeleton is done by minute 20, you get 15–20 minutes for the deep dive where senior signals live.",
              "**Trade-offs are the senior signal.** Anyone can name Kafka; explaining why not SQS here, and what you'd lose, is what distinguishes levels.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "How the steps feed each other",
        blocks: [
          {
            type: "flow",
            nodes: ["Requirements (1–3)", "Numbers (4)", "Contract (5)", "Design (6–7)", "Stress it (8–10)", "Operate (11)", "Defend (12)"],
            caption: "Each stage consumes the output of the previous one; when an interviewer changes a requirement, re-run the chain from that point.",
          },
          {
            type: "table",
            head: ["Output of step", "Drives decision in"],
            rows: [
              ["Read/write ratio (3)", "Caching, read replicas, denormalisation (9, 10)"],
              ["Peak QPS (4)", "Number of app servers, need for sharding or queues (8, 10)"],
              ["Storage/year (4)", "Single DB vs sharded, hot/cold tiering, object storage (9)"],
              ["Access patterns (5)", "Primary keys, indexes, SQL vs NoSQL (9)"],
              ["Consistency need (2)", "Sync vs async replication, transactions, cache TTLs (10)"],
              ["Availability target (2)", "Multi-AZ/region, failover, graceful degradation (10, 11)"],
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "A 45-minute time budget",
        blocks: [
          {
            type: "table",
            head: ["Minutes", "Steps", "What 'done' looks like"],
            rows: [
              ["0–5", "1–3", "A short written list of features (in/out of scope), NFRs with numbers, and stated assumptions."],
              ["5–10", "4–5", "Peak QPS, storage/yr, bandwidth; 3–6 API calls; core entities with keys."],
              ["10–20", "6–7", "A clean diagram and the read + write path walked through end-to-end."],
              ["20–35", "8–10", "Deep dive on 1–2 bottlenecks the interviewer cares about (sharding, cache, fan-out, consistency, failure)."],
              ["35–40", "11", "Security, monitoring/SLOs, deployment — quick, targeted bullet points."],
              ["40–45", "12", "Recap decisions and trade-offs; answer 'what would you change at 10×?'; leave time for questions."],
            ],
          },
          {
            type: "callout",
            tone: "warning",
            title: "Let the interviewer steer the deep dive",
            text: "At ~minute 20 ask: 'I can go deeper on the feed fan-out, the storage sharding, or failure handling — which is most interesting to you?' It shows awareness and avoids spending 15 minutes on something they don't score.",
          },
          {
            type: "p",
            text: "Concrete example — 'design a URL shortener'. Steps 1–3: create short link, redirect, optional expiry and analytics; 100M new links/month, 100:1 read/write, redirect p99 < 50 ms, 99.99% availability. Step 4: ~40 writes/s average, ~4k reads/s average, ~10× at peak; ~500 bytes/link → ~12B links and ~6 TB over 10 years. Step 5: `POST /links`, `GET /{code}`; table `links(code PK, long_url, owner_id, created_at, expires_at)`. Step 6–7: LB → stateless API → cache → key-value store; read path hits the cache first. Step 8–10: hot links (cache + CDN 301/302), ID generation without collisions (pre-allocated ranges or base62 of a counter), key-value store partitioned by code. Step 11: abuse/spam scanning, rate limits per user. Step 12: 301 (cacheable, loses analytics) vs 302 (every hit reaches you).",
          },
        ],
      },
      {
        id: "examples",
        title: "What interviewers evaluate",
        blocks: [
          {
            type: "table",
            head: ["Dimension", "Weak signal", "Strong signal"],
            rows: [
              ["Problem navigation", "Starts drawing immediately", "Asks targeted questions, scopes down, writes requirements"],
              ["Solution design", "Boxes with no data flow", "Coherent components, clear request flows, sensible APIs/data model"],
              ["Technical depth", "Names technologies", "Explains how they work and where they break (e.g. replication lag, hot shards)"],
              ["Trade-offs", "'X is best'", "'X gives us A at the cost of B; given requirement R, I'd accept B'"],
              ["Quantitative reasoning", "No numbers", "Quick estimates that change decisions"],
              ["Operational maturity", "Ignores failure", "Timeouts, retries, idempotency, monitoring, rollout"],
              ["Communication", "Monologue", "Thinks aloud, checks in, adapts to hints"],
            ],
          },
          {
            type: "list",
            items: [
              "\"Before I design, let me confirm the core use cases…\"",
              "\"I'll assume X; tell me if that's wrong.\"",
              "\"Let me do a quick estimate to see whether one database is enough.\"",
              "\"The simplest thing that works is… then I'll evolve it for scale.\"",
              "\"The bottleneck here will be… because the numbers say…\"",
              "\"The trade-off is… I'd choose… because our requirement is…\"",
              "\"If this component fails, the user sees… and we recover by…\"",
              "\"Which area would you like me to go deeper on?\"",
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        title: "Common failure modes",
        blocks: [
          {
            type: "table",
            head: ["Failure mode", "Why it hurts", "Fix"],
            rows: [
              ["Jumping straight to the diagram", "You design the wrong system", "Spend the first 5 minutes on steps 1–3"],
              ["Endless requirements", "No time for depth", "Cap it at ~5 minutes; park extras explicitly"],
              ["Estimation theatre", "10 minutes of arithmetic that changes nothing", "Round aggressively; only compute numbers that drive decisions"],
              ["Buzzword soup", "Kafka + Kubernetes + microservices for 100 QPS", "Start simple; add components only when a number or requirement demands it"],
              ["Ignoring the interviewer's hints", "Signals poor collaboration", "Treat a question as a steer, not an attack"],
              ["No failure handling", "Looks junior on availability", "For each critical box: what if it's slow, down or returns errors?"],
              ["'It depends' with no conclusion", "Sounds evasive", "Say what it depends on, then *pick* given the stated requirements"],
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Breadth-first (default)", points: ["Get a complete end-to-end design first", "Then deepen 1–2 areas", "Safe: you always have a working answer"] },
              { title: "Depth-first", points: ["Use when the interviewer explicitly asks to focus on one component", "Risky otherwise: you may never cover the read path or failures"] },
            ],
          },
          {
            type: "p",
            text: "Adapt the framework to the question type: a product design (feed, chat) emphasises data model and fan-out; an infrastructure design (rate limiter, distributed cache, job scheduler) emphasises algorithms, consistency and failure semantics. Steps 1–7 compress for infrastructure questions; 8–10 expand.",
          },
        ],
      },
      {
        id: "real-world",
        blocks: [
          {
            type: "p",
            text: "The same steps form a real design document: context and goals, non-goals, estimates, API, data model, architecture, alternatives considered, risks, rollout and monitoring. Practising the framework is practising design reviews — which is why interviewers value it.",
          },
          {
            type: "list",
            items: [
              "**Cost** belongs in step 2/12 — 'three regions triples storage cost' is a legitimate trade-off.",
              "**SLOs** from step 2 become alerts in step 11 (see the Google SRE book's chapter on service level objectives).",
              "**Migration** is often the real-world hard part: how do you get from today's system to this one without downtime?",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "I use a fixed sequence: clarify functional and non-functional requirements and assumptions, estimate the load, define APIs and the data model, draw the simplest high-level design and walk the main flows, then find bottlenecks and choose concrete storage, caching and queuing. After that I cover scaling, consistency and failure handling, briefly touch security and observability, and close with trade-offs and alternatives. I keep the first ten minutes tight so most of the time goes to the deep dive the interviewer cares about.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "**Requirements are a negotiation.** Propose a scope and let the interviewer adjust it; that is faster than asking open questions one at a time.",
              "**Estimate to decide.** Every number should end with a sentence like 'so a single primary can handle writes, but reads need a cache'.",
              "**Design for the read path and the write path separately.** They often have opposite needs (fast fan-out reads vs durable ordered writes).",
              "**Name the consistency model per data type.** Payment balances need strong consistency; like counts can be eventually consistent.",
              "**Failure is a first-class requirement.** For each dependency: timeout, retry with backoff and jitter, idempotency, fallback.",
              "**Close with evolution.** 'At 10× I'd shard by user_id and move fan-out to async workers' shows you see the system as something that grows.",
            ],
          },
        ],
      },
      {
        id: "glossary",
        blocks: [
          {
            type: "table",
            head: ["Term", "Meaning"],
            rows: [
              ["NFR", "Non-functional requirement: a quality attribute such as latency, availability or durability."],
              ["SLO", "Service level objective: a target for a measured indicator, e.g. 99.9% of requests under 300 ms."],
              ["Back-of-the-envelope", "A quick, rounded estimate good to an order of magnitude."],
              ["Read path / write path", "The sequence of components a read or write request passes through."],
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
              "12 steps: requirements → NFRs → assumptions → estimates → API/data → architecture → flows → bottlenecks → technology choices → scale/consistency/failure → security/ops → trade-offs.",
              "Budget: ~10 min on requirements and numbers, ~10 on the design, ~15 on the deep dive, ~10 on ops, trade-offs and questions.",
              "Scored on navigation, design, depth, trade-offs, numbers, operational maturity and communication.",
              "Start simple, let numbers justify complexity, and always state what you gave up.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Functional requirement", definition: "Something the system must do, e.g. 'users can post a message'." },
      { term: "Non-functional requirement", definition: "A quality the system must have, e.g. 'p99 latency under 200 ms' or '99.99% availability'." },
      { term: "Deep dive", definition: "The part of the interview where you go into detail on one or two components or problems." },
      { term: "Out of scope", definition: "Features you explicitly agree not to design, to keep the problem tractable." },
    ],
    followUps: [
      { q: "What do you do if the interviewer gives you no numbers?", a: "Propose them: 'I'll assume 10M DAU, each doing ~10 reads and 1 write a day — does that sound right?' Proposing beats asking open questions, and the interviewer can correct you." },
      { q: "How do you handle a requirement change mid-interview?", a: "Restate it, identify which earlier steps it invalidates (often estimates or the consistency model), and re-run the chain from there instead of patching randomly." },
      { q: "When should you introduce microservices?", a: "Only when a requirement justifies it — independent scaling, team ownership, different availability needs. Otherwise a modular monolith plus a few async workers is simpler and easier to defend." },
      { q: "How much estimation is enough?", a: "Enough to make decisions: peak QPS, storage growth, bandwidth and cache size. Round to one significant figure; stop when the numbers stop changing the design." },
      { q: "What if you don't know a technology the interviewer mentions?", a: "Say so, then reason from first principles about what it must do (e.g. 'a log-structured store must compact, so I'd expect write amplification'). Honesty plus reasoning scores better than bluffing." },
    ],
    quiz: [
      {
        id: "if-q1",
        prompt: "You are 5 minutes in, have requirements written, and the interviewer seems impatient. What's the best next move?",
        options: ["Draw the full architecture with every component you know", "Do a quick estimate of QPS and storage, then sketch the API", "Ask ten more clarifying questions", "Start with the database schema in full detail"],
        answer: 1,
        explanation: "After requirements, quick estimates and the API contract give you the inputs for the design without stalling. Over-asking and over-detailing burn the time you need for the deep dive.",
      },
      {
        id: "if-q2",
        prompt: "Which statement best shows trade-off reasoning?",
        options: ["We'll use Cassandra because it scales", "NoSQL is better than SQL", "I'll use async replication: we accept a few seconds of stale reads on follower replicas in exchange for low write latency, and route a user's reads to the leader right after they write", "We'll use Kafka for everything"],
        answer: 2,
        explanation: "A trade-off statement names the choice, the cost, why the cost is acceptable for the stated requirements, and a mitigation.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── 1. vertical-vs-horizontal-scaling
  {
    slug: "vertical-vs-horizontal-scaling",
    track: "system-design",
    title: "Vertical vs horizontal scaling",
    summary:
      "Scale up (a bigger machine) or scale out (more machines)? Why horizontal scaling requires stateless services, what makes stateful tiers hard to scale out, and when a big box is the right answer.",
    level: "beginner",
    frequency: "very-high",
    minutes: 20,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["system-design/interview-framework"],
    related: [
      "system-design/load-balancing-algorithms",
      "system-design/sharding-partitioning",
      "system-design/replication",
      "system-design/capacity-estimation",
      "cloud/kubernetes",
    ],
    tags: ["scaling", "scale-up", "scale-out", "stateless", "autoscaling"],
    sources: [
      CHECKLIST,
      DDIA,
      SD_PRIMER,
      { label: "The Twelve-Factor App — Processes (stateless)", url: "https://12factor.net/processes", kind: "external" },
      { label: "AWS EC2 Auto Scaling — User Guide", url: "https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Define vertical (scale-up) and horizontal (scale-out) scaling and their limits.",
              "Explain why scale-out needs stateless app servers and where the state goes instead.",
              "Know why databases are the hardest tier to scale horizontally.",
              "Choose between them using cost, failure isolation and operational complexity.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A restaurant gets busier. It can buy a bigger stove and hire a faster chef (vertical), or open more kitchens with more chefs (horizontal). The bigger stove is simple but has a maximum size and, if it breaks, dinner stops. More kitchens scale further, but now you need a host to seat guests (a load balancer) and recipes that any kitchen can follow (stateless servers).",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Vertical scaling (scale up)", points: ["Add CPU, RAM, faster disks or network to one machine", "No code change; same single process", "Bounded by the largest instance available", "Usually needs a restart or failover to resize", "Single point of failure unless replicated"] },
              { title: "Horizontal scaling (scale out)", points: ["Add more machines running the same role", "Needs a load balancer or partitioning to spread work", "Near-linear capacity growth for stateless tiers", "Survives individual machine failure", "Adds distributed-systems complexity: coordination, consistency, partial failure"] },
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
              "Every system eventually outgrows one machine in throughput, memory, storage or blast radius.",
              "Hardware price is non-linear at the top end: the biggest instances cost disproportionately more per unit of capacity.",
              "Availability: N small machines behind a load balancer tolerate losing one; one big machine does not.",
              "Elasticity: scale-out lets you add and remove capacity with demand (autoscaling) instead of provisioning for peak forever.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "What makes scale-out work",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Make the tier stateless", detail: "A request must be servable by *any* instance. Move sessions to a shared store (Redis, a database) or into signed tokens; move uploaded files to object storage; avoid in-process caches that must be consistent." },
              { title: "Distribute requests", detail: "Put a load balancer in front (see load-balancing algorithms). Health checks remove dead instances." },
              { title: "Scale the state separately", detail: "Data tiers scale out with read replicas (for reads), caching, and sharding (for writes and storage) — each with consistency costs." },
              { title: "Automate capacity", detail: "Autoscaling groups or Kubernetes HPA add instances on CPU, request rate or queue depth signals; scale-in drains connections first." },
            ],
          },
          {
            type: "table",
            head: ["Tier", "Scale-out difficulty", "Typical approach"],
            rows: [
              ["Stateless web/API", "Easy", "More instances behind an LB, autoscaling"],
              ["Cache", "Moderate", "Client-side or proxy sharding via consistent hashing"],
              ["Async workers", "Easy", "More consumers on a queue (bounded by partitions in Kafka)"],
              ["Relational DB reads", "Moderate", "Read replicas — with replication lag"],
              ["Relational DB writes", "Hard", "Vertical first, then sharding or a distributed SQL database"],
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Evolving a real service",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Day 1", detail: "One VM runs the app and Postgres. Fine for thousands of users." },
              { title: "Split tiers", detail: "Move Postgres to its own (bigger) machine — vertical scaling of the DB. The app server is now stateless." },
              { title: "Scale out the app", detail: "Three app instances behind a load balancer across availability zones; sessions in Redis." },
              { title: "Offload reads", detail: "Add a cache and one or two read replicas as the read/write ratio grows." },
              { title: "Writes hit the ceiling", detail: "Primary CPU is at 70% on the largest practical instance. Now — and only now — shard by tenant or user, or move hot data to a horizontally scalable store." },
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Amdahl applies:** if 20% of every request is serialised on one lock or one DB row, adding servers stops helping (see multithreading & parallelism).",
              "**Coordination overhead:** scale-out tiers that must agree (locks, leader election, cross-shard transactions) add latency and failure modes.",
              "**Sticky sessions** break statelessness: a hot instance cannot shed load and a dead instance loses sessions.",
              "**Connection limits:** 200 app instances × 20 pooled connections = 4,000 DB connections — more than Postgres handles well without a pooler like PgBouncer.",
              "**Vertical has a ceiling and a restart:** resizing a VM typically means a reboot or a failover, i.e. a planned blip.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Criterion", "Vertical", "Horizontal"],
            rows: [
              ["Simplicity", "High — no distribution", "Lower — LB, statelessness, coordination"],
              ["Ceiling", "Largest machine", "Practically very high for stateless tiers"],
              ["Fault tolerance", "Single box", "Survives node loss"],
              ["Cost curve", "Super-linear at the top", "Roughly linear; commodity machines"],
              ["Elasticity", "Coarse, often with downtime", "Fine-grained, automatic"],
              ["Best for", "Databases early on, legacy apps, latency-sensitive single-node workloads", "Stateless services, workers, caches, partitioned data stores"],
            ],
          },
          {
            type: "callout",
            tone: "tip",
            text: "Real systems do both: scale the stateless tier out, scale the database up as far as reasonable, then partition it.",
          },
        ],
      },
      {
        id: "real-world",
        blocks: [
          {
            type: "list",
            items: [
              "**Monitor** per-instance CPU, memory, request rate and saturation; scale on a signal that leads load (request rate, queue depth) rather than one that lags (CPU after a GC storm).",
              "**Failure mode:** autoscaling thrash — scaling in and out repeatedly. Use cooldowns and scale-in more slowly than scale-out.",
              "**Failure mode:** cold starts — new instances with empty caches and JIT not warmed can briefly increase latency.",
              "**Cost:** reserved/committed capacity for the baseline, autoscaled on-demand or spot capacity for peaks.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Vertical scaling means a bigger machine — simple, no code changes, but capped by hardware, pricier at the top end and a single point of failure. Horizontal scaling means more machines behind a load balancer — near-linear capacity and fault tolerance, but the service must be stateless and you take on distributed-systems complexity. I scale stateless tiers out, scale the database up first, then add replicas, caching and finally sharding when writes outgrow one node.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Statelessness is the enabler: externalise sessions, files and caches so any instance can serve any request.",
              "Read scaling (replicas, caches) and write scaling (sharding) are different problems with different costs.",
              "Serial fractions and shared resources (DB connections, a hot row, a global lock) limit horizontal gains — measure before adding nodes.",
              "Autoscaling needs a good signal, warm-up handling, connection draining and limits so a bug cannot scale you into a huge bill.",
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
              "Scale up = bigger box: simple, bounded, single point of failure.",
              "Scale out = more boxes: needs statelessness + a load balancer, gives elasticity and fault tolerance.",
              "Data tiers are hard to scale out: replicas for reads, sharding for writes.",
              "Use vertical until it's uneconomic or risky, horizontal for anything stateless.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Stateless service", definition: "A service that keeps no per-client data between requests in its own memory, so any instance can handle any request." },
      { term: "Autoscaling", definition: "Automatically adding or removing instances based on a metric such as CPU or request rate." },
      { term: "Sticky session", definition: "Load-balancer affinity that sends a client to the same instance each time." },
      { term: "Blast radius", definition: "How much of the system or user base is affected when one component fails." },
    ],
    followUps: [
      { q: "Your app is stateless but you added sticky sessions for a WebSocket feature. What changes?", a: "Long-lived connections pin users to instances, so load can become uneven and deploys must drain connections. Keep shared state (presence, subscriptions) in Redis/pub-sub so any instance can serve reconnects, and rebalance by closing connections gradually." },
      { q: "When is vertical scaling the right answer even at large scale?", a: "For a write-heavy relational database where sharding would force cross-shard transactions, or for in-memory analytics that need all data in one address space. Large instances are often cheaper than the engineering cost of partitioning." },
      { q: "You doubled app servers but throughput didn't change. Why?", a: "The bottleneck is elsewhere: the database, a shared lock, a downstream rate limit, or the load balancer itself. Find the saturated resource (USE method: utilisation, saturation, errors) before scaling." },
      { q: "How do you scale writes on a relational database?", a: "First vertically and with query/index tuning, batching and moving non-critical writes to async queues; then partition by a key with good locality (tenant, user) or adopt a distributed SQL store, accepting cross-partition costs." },
    ],
    quiz: [
      {
        id: "vh-q1",
        prompt: "Which change is required before an API tier can scale horizontally?",
        options: ["Moving it to a bigger instance", "Storing session state outside the process", "Adding a read replica", "Switching to NoSQL"],
        answer: 1,
        explanation: "Any instance must be able to serve any request, so per-user state must live in a shared store or in the request (e.g. a signed token).",
      },
      {
        id: "vh-q2",
        prompt: "Why is a relational database's write path hard to scale out?",
        options: ["SQL can't run on more than one CPU", "All writes for a given row must be ordered by one authority, and cross-row transactions need coordination across nodes", "Indexes don't work on multiple machines", "Load balancers can't route SQL"],
        answer: 1,
        explanation: "Spreading writes means partitioning data; transactions and constraints spanning partitions then need distributed coordination, which adds latency and complexity.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── 2. latency-throughput
  {
    slug: "latency-throughput",
    track: "system-design",
    title: "Latency vs throughput",
    summary:
      "Latency is how long one request takes; throughput is how many complete per second. Learn percentiles and tail latency, Little's law, and why pushing utilisation towards 100% makes latency explode.",
    level: "beginner",
    frequency: "very-high",
    minutes: 25,
    kinds: ["theory", "visualization", "system-design"],
    status: "authored",
    prerequisites: ["system-design/interview-framework"],
    related: [
      "system-design/capacity-estimation",
      "system-design/dns-tcp-lb-firewalls",
      "system-design/caching-strategies",
      "system-design/multithreading-parallelism",
      "os/cpu-memory-hierarchy",
    ],
    tags: ["latency", "throughput", "percentiles", "p99", "tail-latency", "littles-law", "queueing"],
    sources: [
      CHECKLIST,
      SRE,
      { label: "Google SRE Book — Service Level Objectives", url: "https://sre.google/sre-book/service-level-objectives/", kind: "docs" },
      { label: "The Tail at Scale — Dean & Barroso (CACM 2013)", url: "https://research.google/pubs/the-tail-at-scale/", kind: "external" },
      { label: "Little's law (overview)", url: "https://en.wikipedia.org/wiki/Little%27s_law", kind: "external" },
      DDIA,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Distinguish latency, throughput, bandwidth and response time.",
              "Read latency as a distribution (p50, p95, p99) and explain why averages lie.",
              "Use Little's law to connect concurrency, throughput and latency.",
              "Explain why latency rises sharply as utilisation approaches 100%, and how tail latency amplifies with fan-out.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A highway: latency is how long one car takes to get from A to B; throughput is how many cars pass per hour. Adding lanes raises throughput without making any car faster. A traffic jam makes every car slower *and* fewer cars arrive — that's saturation.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Term", "Definition", "Unit"],
            rows: [
              ["Latency", "Time for one operation from start to finish (often: time waiting + time being served)", "ms, µs"],
              ["Throughput", "Completed operations per unit time", "requests/s, MB/s"],
              ["Bandwidth", "Maximum data rate of a link — a capacity ceiling, not what you achieve", "Gbit/s"],
              ["Utilisation", "Fraction of time a resource is busy", "%"],
              ["Percentile (p99)", "The value below which 99% of observations fall", "ms"],
            ],
          },
          {
            type: "callout",
            tone: "misconception",
            text: "Low latency and high throughput are not the same goal and can conflict: batching raises throughput but makes each item wait longer.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "Users feel latency, especially the slow tail; businesses pay for throughput (machines per request).",
              "SLOs are written as percentiles: 'p99 < 300 ms' — you can't reason about them with averages.",
              "Capacity planning requires knowing the throughput one instance sustains *at an acceptable latency*, not at 100% CPU.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "Where the time goes, and why queues explode",
        blocks: [
          {
            type: "viz",
            id: "sys-request-flow",
            caption: "Conceptual: each hop (DNS, TCP/TLS handshake, load balancer, app, cache, database) adds latency; the end-to-end latency is their sum along the critical path.",
          },
          {
            type: "p",
            text: "**Little's law**: in a stable system, average items in the system L = arrival rate λ × average time in system W. A service handling 2,000 req/s with 50 ms latency has ~100 requests in flight. If latency rises to 500 ms (a slow DB), you need ~1,000 concurrent slots — threads, connections and memory — to keep the same throughput.",
          },
          {
            type: "p",
            text: "**Queueing**: when requests arrive randomly, waiting time grows non-linearly with utilisation. In the simplest single-server model (M/M/1) the average time in system is service time ÷ (1 − utilisation): at 50% busy it's 2× the service time, at 90% it's 10×, at 99% it's 100×. Real systems differ, but the shape — a hockey stick near saturation — holds.",
          },
          {
            type: "table",
            head: ["Utilisation", "Avg time in system (M/M/1, service = 10 ms)"],
            rows: [["50%", "20 ms"], ["80%", "50 ms"], ["90%", "100 ms"], ["95%", "200 ms"], ["99%", "1,000 ms"]],
          },
          {
            type: "viz",
            id: "mem-hierarchy",
            caption: "Conceptual latency ladder: the storage a request touches (cache, RAM, SSD, network) sets its floor latency.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Reading a latency distribution",
        blocks: [
          {
            type: "p",
            text: "1,000 requests: 990 take 20 ms and 10 take 2,000 ms. The average is ~40 ms — which describes *no* real request. p50 = 20 ms, p99 = 20 ms (the 990th value), p99.9 = 2,000 ms. Users hitting that 1% are often your heaviest users (more data, more requests per page).",
          },
          {
            type: "p",
            text: "**Fan-out amplifies the tail.** If a page calls 100 backends in parallel and each has a 1% chance of being slow, the chance the page is slow is 1 − 0.99¹⁰⁰ ≈ 63%. This is the core argument of 'The Tail at Scale'.",
          },
          {
            type: "list",
            items: [
              "**Hedged requests:** after the p95 latency, send a duplicate to another replica and take the first answer.",
              "**Timeouts with budgets:** each hop gets a slice of the end-to-end deadline.",
              "**Reduce variance:** avoid GC pauses, noisy neighbours, head-of-line blocking; keep queues short.",
            ],
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "table",
            head: ["Technique", "Latency", "Throughput"],
            rows: [
              ["Caching", "↓ big", "↑ (offloads backend)"],
              ["Batching writes", "↑ per item", "↑ big"],
              ["More replicas / instances", "≈ (↓ if it reduces queueing)", "↑"],
              ["Compression", "± (CPU vs bytes)", "↑ on bandwidth-bound links"],
              ["Pipelining / multiplexing (HTTP/2)", "↓ (fewer round trips)", "↑"],
              ["Async processing via queue", "↓ for the user-facing response", "smooths peaks"],
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Coordinated omission:** load generators that wait for a slow response before sending the next request under-report tail latency. Use open-model load tests with a fixed arrival rate.",
              "**Percentiles don't average:** you can't average p99s across hosts; aggregate histograms instead.",
              "**Bandwidth-delay product:** a 10 Gbit/s link with 100 ms RTT needs ~125 MB in flight to stay full — TCP window limits can cap throughput far below bandwidth.",
              "**Throughput at 100% CPU is a lie:** the latency at that point is unacceptable; plan capacity for a target utilisation (often 50–70%).",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Optimise latency when", points: ["Interactive user requests", "Synchronous call chains", "Trading, gaming, search-as-you-type"] },
              { title: "Optimise throughput when", points: ["Batch/ETL jobs, log ingestion", "Background processing", "Cost per request dominates"] },
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
              "**Monitor** latency histograms (p50/p95/p99/p99.9) per endpoint, throughput, error rate and saturation — the SRE 'four golden signals'.",
              "**Alert on SLO burn rate**, not on single slow requests.",
              "**Failure mode:** retry storms. When latency rises, clients time out and retry, raising load and latency further. Use backoff with jitter, retry budgets and load shedding (see AWS Builders' Library).",
              "**Cost:** headroom for latency is paid capacity; caching and better algorithms buy latency more cheaply than hardware.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Latency is the time a single request takes; throughput is how many requests complete per second. They're linked by Little's law: concurrency = throughput × latency. I reason about latency as percentiles because averages hide the tail, and the tail dominates when a request fans out to many services. As utilisation approaches 100% queueing makes latency explode, so I size capacity for a target utilisation and use caching, batching and async work depending on which metric matters.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Latency = queueing + service + network + serialisation; find which dominates before optimising.",
              "Little's law sizes pools: threads/connections ≈ target QPS × latency (plus headroom).",
              "Tail latency strategies: hedging, tied requests, micro-partitioning, load shedding, reducing GC and lock contention.",
              "Throughput levers: parallelism, batching, pipelining, removing serial bottlenecks (Amdahl).",
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
              "Latency: time per request (use percentiles). Throughput: requests per second.",
              "L = λ × W connects them.",
              "Queueing makes latency non-linear near saturation — keep headroom.",
              "Fan-out turns rare slowness into common slowness.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "p99", definition: "99th percentile: 99% of requests were at least this fast." },
      { term: "Tail latency", definition: "The slow end of the latency distribution (p99, p99.9)." },
      { term: "Little's law", definition: "L = λW: average number in system equals arrival rate times average time in system." },
      { term: "Saturation", definition: "How much work a resource has queued that it cannot serve yet." },
      { term: "Hedged request", definition: "A duplicate request sent to another replica after a delay, using whichever answers first." },
    ],
    followUps: [
      { q: "Your p50 is fine but p99 is terrible. Where do you look?", a: "Things that affect a minority of requests: GC pauses, lock contention, cache misses, cold instances, large tenants/payloads, a slow replica, retries, or head-of-line blocking in a queue. Break the p99 down by host, endpoint and tenant, and use traces of slow requests." },
      { q: "How many DB connections do you need for 5,000 QPS with 4 ms queries?", a: "Little's law: 5,000 × 0.004 s = 20 concurrent queries on average. Add headroom for bursts and variance (say 2–3×), spread across instances — and confirm the database itself can handle that concurrency." },
      { q: "Does adding servers reduce latency?", a: "Only if latency is dominated by queueing because servers are saturated. If the time is spent in a slow dependency or in the work itself, more servers raise throughput but not latency." },
      { q: "Why might batching hurt user-facing latency?", a: "Each item waits for the batch to fill or a timer to fire. Use small batches with a max-wait (e.g. 5 ms) to bound added latency." },
    ],
    quiz: [
      {
        id: "lt-q1",
        prompt: "A service processes 1,000 req/s with an average latency of 200 ms. How many requests are in flight on average?",
        options: ["5", "200", "1,000", "200,000"],
        answer: 1,
        explanation: "Little's law: L = λW = 1,000 × 0.2 = 200.",
      },
      {
        id: "lt-q2",
        prompt: "A page fans out to 50 services, each with a 2% chance of a slow response. Roughly how often is the page slow?",
        options: ["2%", "~10%", "~64%", "100%"],
        answer: 2,
        explanation: "1 − 0.98⁵⁰ ≈ 0.64. Fan-out turns rare per-service slowness into common page slowness.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── 3. capacity-estimation
  {
    slug: "capacity-estimation",
    track: "system-design",
    title: "Capacity estimation (back-of-the-envelope)",
    summary:
      "Turn product numbers into QPS, storage, bandwidth and server counts in two minutes: powers of two, approximate latency numbers every engineer should know, and worked examples.",
    level: "beginner",
    frequency: "very-high",
    minutes: 30,
    kinds: ["theory", "visualization", "system-design"],
    status: "authored",
    prerequisites: ["system-design/latency-throughput"],
    related: [
      "system-design/interview-framework",
      "system-design/vertical-vs-horizontal-scaling",
      "system-design/caching-strategies",
      "system-design/sharding-partitioning",
      "os/cpu-memory-hierarchy",
    ],
    tags: ["estimation", "qps", "storage", "bandwidth", "latency-numbers", "powers-of-two"],
    sources: [
      CHECKLIST,
      { label: "Latency numbers every programmer should know (gist, after Jeff Dean / Peter Norvig)", url: "https://gist.github.com/jboner/2841832", kind: "external" },
      { label: "Colin Scott — Interactive latency numbers by year", url: "https://colin-scott.github.io/personal_website/research/interactive_latency.html", kind: "external" },
      { label: "Peter Norvig — Teach Yourself Programming in Ten Years (approximate timings table)", url: "https://norvig.com/21-days.html", kind: "external" },
      SD_PRIMER,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Convert daily active users and actions into average and peak QPS.",
              "Estimate storage growth and bandwidth from object sizes and retention.",
              "Use powers of two and approximate latency numbers to sanity-check designs.",
              "Know when an estimate changes the design (and stop computing when it doesn't).",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Estimation is like checking whether a sofa fits through a door before carrying it upstairs. You don't need millimetre precision — you need to know if it's 'easily', 'barely' or 'no way'. One significant figure and the right order of magnitude are enough.",
          },
        ],
      },
      {
        id: "definition",
        title: "The reference numbers",
        blocks: [
          {
            type: "table",
            head: ["Power", "Exact", "Approx.", "Name"],
            rows: [
              ["2¹⁰", "1,024", "10³ (thousand)", "KB / KiB"],
              ["2²⁰", "1,048,576", "10⁶ (million)", "MB / MiB"],
              ["2³⁰", "~1.07 × 10⁹", "10⁹ (billion)", "GB / GiB"],
              ["2⁴⁰", "~1.1 × 10¹²", "10¹² (trillion)", "TB / TiB"],
              ["2⁵⁰", "~1.13 × 10¹⁵", "10¹⁵", "PB / PiB"],
            ],
          },
          {
            type: "table",
            head: ["Handy conversion", "Value"],
            rows: [
              ["Seconds per day", "86,400 ≈ 10⁵"],
              ["1M requests/day", "≈ 12 req/s"],
              ["1B requests/day", "≈ 12k req/s"],
              ["Seconds per month", "≈ 2.6 × 10⁶"],
              ["Seconds per year", "≈ 3.2 × 10⁷"],
              ["Typical peak / average", "2–10× depending on traffic shape"],
              ["char (ASCII/UTF-8 Latin)", "1 byte; UUID 16 bytes binary (36 as text); int64 8 bytes"],
            ],
          },
          {
            type: "callout",
            tone: "warning",
            title: "Latency numbers are approximate orders of magnitude",
            text: "The table below is a mental model, not a benchmark. Exact values vary by hardware generation, cloud provider and load; the famous list dates from ~2010 and some entries (SSD, network) have improved a lot. Use the *ratios* between rows.",
          },
          {
            type: "table",
            head: ["Operation", "Approx. order of magnitude"],
            rows: [
              ["L1 cache reference", "~1 ns"],
              ["Branch mispredict", "~3–5 ns"],
              ["L2 cache reference", "~4–7 ns"],
              ["Mutex lock/unlock (uncontended)", "~20 ns"],
              ["Main memory reference", "~100 ns"],
              ["Compress 1 KB with a fast compressor", "~2–3 µs"],
              ["Send 1 KB over a 1 Gbit/s network", "~10 µs"],
              ["Random 4 KB read from NVMe SSD", "~20–150 µs"],
              ["Read 1 MB sequentially from memory", "~a few µs to tens of µs"],
              ["Round trip within a datacenter / AZ", "~0.5 ms"],
              ["Read 1 MB sequentially from SSD", "~0.1–1 ms"],
              ["HDD seek", "~2–10 ms"],
              ["Read 1 MB sequentially from HDD", "~1–20 ms"],
              ["Round trip across a continent", "~30–80 ms"],
              ["Round trip intercontinental (e.g. US ↔ Europe)", "~80–150 ms"],
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
              "Estimates decide architecture: whether data fits in one DB, whether a cache fits in RAM, whether a CDN is needed.",
              "Latency numbers explain design choices: a cross-region call costs as much as ~1,000 memory reads of a large buffer; avoid it on the hot path.",
              "Interviewers use estimation to check quantitative reasoning — and whether you know when to stop.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "The estimation recipe",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Users → actions", detail: "DAU × actions per user per day = actions/day, separately for reads and writes." },
              { title: "Actions → QPS", detail: "Divide by ~10⁵ s/day for average QPS; multiply by a peak factor (2–10×)." },
              { title: "Writes → storage", detail: "writes/day × bytes per record × retention days × replication factor (often 3) × index/overhead factor (~1.3–2)." },
              { title: "QPS → bandwidth", detail: "QPS × response size = bytes/s; convert to bits (×8) for network links." },
              { title: "Working set → memory", detail: "Cache the hot fraction (often ~20% of daily read objects) × object size." },
              { title: "QPS → servers", detail: "Peak QPS ÷ sustainable QPS per instance at target utilisation, plus N+1/N+2 redundancy." },
            ],
          },
          {
            type: "viz",
            id: "mem-hierarchy",
            caption: "Conceptual latency ladder: each step down is roughly an order of magnitude slower — the reason caches exist at every level.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Worked example: a photo-sharing service",
        blocks: [
          {
            type: "p",
            text: "Assume 100M DAU. Each user views 50 photos and uploads 0.1 photos per day. Average photo 500 KB (plus a 20 KB thumbnail); metadata ~1 KB. Keep everything 5 years.",
          },
          {
            type: "table",
            head: ["Quantity", "Calculation", "Result"],
            rows: [
              ["Uploads/day", "100M × 0.1", "10M/day"],
              ["Upload QPS (avg)", "10M ÷ 10⁵", "~100/s (peak ~300–500/s)"],
              ["Views/day", "100M × 50", "5B/day"],
              ["View QPS (avg)", "5B ÷ 10⁵", "~50k/s (peak ~150k/s)"],
              ["New photo storage/day", "10M × 520 KB", "~5 TB/day"],
              ["5-year storage", "5 TB × 365 × 5", "~9 PB (before replication)"],
              ["Metadata 5 years", "10M × 1 KB × 1,825", "~18 TB"],
              ["Egress (avg)", "50k/s × ~100 KB served size", "~5 GB/s ≈ 40 Gbit/s"],
              ["Hot metadata cache", "20% of daily viewed items' metadata", "Easily tens of GB → a small Redis cluster"],
            ],
          },
          {
            type: "list",
            items: [
              "**Decision 1:** 9 PB of blobs → object storage (S3/GCS), not a database.",
              "**Decision 2:** 40 Gbit/s of image egress → a CDN is mandatory.",
              "**Decision 3:** ~100 writes/s of metadata is easy for one SQL primary; 50k reads/s needs caching and/or replicas.",
              "**Decision 4:** 18 TB of metadata over 5 years will eventually need partitioning or archival — not on day one.",
            ],
          },
        ],
      },
      {
        id: "examples",
        title: "More quick examples",
        blocks: [
          {
            type: "table",
            head: ["Scenario", "Estimate", "Implication"],
            rows: [
              ["Chat: 50M DAU × 40 messages × 200 B", "2B msgs/day ≈ 23k writes/s avg; ~400 GB/day", "Write-optimised partitioned store (e.g. wide-column), partition by conversation"],
              ["URL shortener: 100M new URLs/month × 500 B", "~40 writes/s; ~6 TB per 10 years", "Write rate is trivial; storage fits a few well-provisioned nodes or one key-value store; caching for reads"],
              ["Metrics: 1M hosts × 100 series × every 10 s", "10M points/s", "Time-series DB with compression; aggregate at the edge"],
              ["Rate limiter: 10M active keys × 64 B", "~640 MB", "Fits in a single Redis node's memory (replicate for HA)"],
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Peak factor matters more than precision:** product launches, time zones and events (New Year's, sales) can push peaks 10×+.",
              "**Don't forget replication and overhead:** 3× replicas, indexes, compaction headroom and free space can turn 1 TB of raw data into 5+ TB provisioned.",
              "**Bits vs bytes:** network is quoted in bits per second; storage in bytes. Multiply by 8.",
              "**KB vs KiB:** 1,000 vs 1,024 — irrelevant for estimates; pick one and move on.",
              "**Skew:** averages hide hot keys; a celebrity account or viral post can concentrate a large share of traffic on one partition.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Estimate in detail when", points: ["The number is near a threshold (one node vs many)", "It drives cost (egress, storage tier)", "The interviewer asks for it"] },
              { title: "Round and move on when", points: ["You're 10× away from any threshold", "The result won't change the design", "Time is short"] },
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
              "In production, replace estimates with measurements: load tests give sustainable QPS per instance at your latency SLO.",
              "Capacity planning reviews compare forecast growth with current headroom (CPU, disk, IOPS, connections) months ahead.",
              "Cost estimates use the same arithmetic: storage GB-months, egress GB, instance-hours — egress is often the surprise line item.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "I convert users and actions into requests per day, divide by roughly 100,000 seconds to get average QPS and multiply by a peak factor. Storage is writes per day × record size × retention × replication. Bandwidth is QPS × payload size. I round to one significant figure and use the result to make decisions — for example, petabytes of images means object storage plus a CDN, while 100 writes per second means a single SQL primary is fine.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Separate read and write QPS — they usually differ by 10–100× and are scaled differently.",
              "Estimate the cache working set, not the whole dataset.",
              "Translate latency numbers into design rules: keep hot paths in-memory and in-region; batch disk and network I/O; avoid sequential cross-region calls.",
              "Per-server capacity: a stateless API instance might sustain a few hundred to a few thousand req/s depending on work; say it's an assumption and size with headroom.",
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
              "86,400 s/day ≈ 10⁵; 1M/day ≈ 12/s.",
              "2¹⁰ ≈ 10³; KB → MB → GB → TB → PB in steps of ~1,000.",
              "Latency ladder: cache ns → RAM ~100 ns → SSD ~100 µs → DC round trip ~0.5 ms → cross-continent tens of ms (all approximate).",
              "Estimate → decide → move on.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "QPS", definition: "Queries (requests) per second." },
      { term: "DAU", definition: "Daily active users." },
      { term: "Peak factor", definition: "Ratio of peak to average load." },
      { term: "Working set", definition: "The subset of data accessed frequently enough that it should be in fast storage." },
      { term: "Egress", definition: "Data sent out of a network or cloud region, usually billed per GB." },
    ],
    followUps: [
      { q: "How do you pick a peak factor?", a: "From the traffic shape: global consumer apps with time-zone spread might be 2–3×; regional apps with a daily spike or event-driven traffic can be 5–10× or more. State it as an assumption." },
      { q: "Why multiply storage by replication factor?", a: "Durable stores keep multiple copies (often 3 across zones) and indexes and overhead add more; provisioned capacity is several times raw data size." },
      { q: "How would you estimate the number of servers?", a: "Peak QPS ÷ per-instance capacity measured at the target latency and ~60% utilisation, then add redundancy (N+1 per zone) so losing one zone still leaves enough capacity." },
      { q: "Your estimate says 2 TB of hot data. Cache it all?", a: "Usually not: estimate the working set (often a small fraction is hot). A few hundred GB across a Redis/Memcached cluster may achieve a high hit ratio; measure and size from the hit-ratio curve." },
    ],
    quiz: [
      {
        id: "ce-q1",
        prompt: "500M requests per day is approximately how many requests per second on average?",
        options: ["~600", "~6,000", "~60,000", "~500,000"],
        answer: 1,
        explanation: "500M ÷ ~86,400 ≈ 5,800/s.",
      },
      {
        id: "ce-q2",
        prompt: "Which is roughly the fastest?",
        options: ["Random read from NVMe SSD", "Main memory reference", "Round trip within a datacenter", "HDD seek"],
        answer: 1,
        explanation: "Main memory ~100 ns; SSD random read tens to hundreds of µs; DC round trip ~0.5 ms; HDD seek several ms (all approximate).",
      },
      {
        id: "ce-q3",
        prompt: "10M uploads/day of 2 MB each, kept 1 year, 3× replication. Approximate provisioned storage?",
        options: ["~7 TB", "~70 TB", "~22 PB", "~22 TB"],
        answer: 2,
        explanation: "10M × 2 MB = 20 TB/day; × 365 ≈ 7.3 PB; × 3 ≈ 22 PB.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── 4. dns-tcp-lb-firewalls
  {
    slug: "dns-tcp-lb-firewalls",
    track: "system-design",
    title: "DNS, TCP, load balancers and firewalls",
    summary:
      "The path of a request before your code runs: DNS resolution, TCP and TLS handshakes, firewalls and security groups, and L4/L7 load balancers — what each adds in latency, what each can do for you, and how each fails.",
    level: "beginner",
    frequency: "high",
    minutes: 30,
    kinds: ["theory", "visualization", "system-design"],
    status: "authored",
    prerequisites: ["system-design/latency-throughput"],
    related: [
      "networks/dns",
      "networks/tcp",
      "networks/tls-handshake",
      "networks/http",
      "system-design/load-balancing-algorithms",
      "system-design/cdn-edge-caching",
    ],
    tags: ["dns", "tcp", "tls", "load-balancer", "firewall", "security-groups", "network-path"],
    sources: [
      CHECKLIST,
      { label: "Cloudflare Learning — What is DNS?", url: "https://www.cloudflare.com/learning/dns/what-is-dns/", kind: "external" },
      { label: "RFC 9293 — Transmission Control Protocol", url: "https://www.rfc-editor.org/rfc/rfc9293", kind: "docs" },
      { label: "RFC 8446 — TLS 1.3", url: "https://www.rfc-editor.org/rfc/rfc8446", kind: "docs" },
      { label: "AWS Elastic Load Balancing — product comparison", url: "https://aws.amazon.com/elasticloadbalancing/features/", kind: "docs" },
      { label: "AWS VPC — Security groups vs network ACLs", url: "https://docs.aws.amazon.com/vpc/latest/userguide/infrastructure-security.html", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Trace a request from a browser to your service, naming each hop and its latency cost.",
              "Explain DNS resolution, TTLs and DNS-based routing.",
              "Explain TCP and TLS handshakes and why connection reuse matters.",
              "Contrast L4 and L7 load balancers and stateful firewalls, security groups and WAFs.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Sending a letter to a company: you look up the address (DNS), agree with the post office on a reliable delivery channel (TCP), seal it so nobody can read it (TLS), pass the building's security desk (firewall), and the receptionist routes it to a free employee (load balancer). Each step costs time and each can fail independently.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Component", "Layer", "Job"],
            rows: [
              ["DNS", "Application (UDP/TCP 53, or DoH/DoT)", "Map a name to IP addresses (A/AAAA), aliases (CNAME), mail (MX) etc."],
              ["TCP", "Transport (L4)", "Reliable, ordered byte stream with flow and congestion control"],
              ["TLS", "Above TCP", "Encryption, integrity and server authentication via certificates"],
              ["Firewall / security group", "L3/L4 (sometimes L7)", "Allow or deny traffic by IP, port, protocol (and state)"],
              ["WAF", "L7", "Inspect HTTP requests for attacks (SQLi, XSS), bots, abusive patterns"],
              ["L4 load balancer", "Transport", "Distribute TCP/UDP connections by IP/port; doesn't parse HTTP"],
              ["L7 load balancer", "Application", "Terminate HTTP/TLS, route by host/path/header, retries, rewrites"],
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
              "On a cold connection, handshakes can cost more than your server's work: DNS + TCP + TLS 1.3 ≈ 2–3 round trips before the first HTTP byte.",
              "DNS and load balancers are where traffic steering, failover and blue/green switching happen.",
              "Firewalls and private subnets are the first line of defence; most databases should never be reachable from the internet.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "Hop by hop",
        blocks: [
          {
            type: "viz",
            id: "sys-request-flow",
            caption: "Conceptual request path: DNS → TCP → TLS → load balancer → app → cache → database.",
          },
          {
            type: "steps",
            steps: [
              { title: "DNS resolution", detail: "The browser/OS cache is checked, then a recursive resolver (ISP, 1.1.1.1, 8.8.8.8). On a miss the resolver walks root → TLD (.com) → the domain's authoritative servers, then caches the answer for its TTL. Usually UDP; TCP for large responses and zone transfers." },
              { title: "TCP handshake", detail: "SYN → SYN-ACK → ACK: one round trip before data. New connections start with a small congestion window (slow start), so short-lived connections never reach full speed." },
              { title: "TLS handshake", detail: "TLS 1.3 needs 1 round trip for a full handshake (TLS 1.2 needed 2); session resumption can allow 0-RTT data, which is replayable and must be restricted to idempotent requests. QUIC/HTTP/3 merges transport and TLS handshakes over UDP." },
              { title: "Firewall / security group", detail: "Stateful filters track connections, so a reply to an allowed outbound request is allowed back automatically. In AWS, security groups are stateful and attached to instances; network ACLs are stateless and attached to subnets." },
              { title: "Load balancer", detail: "An L4 LB forwards packets or connections (often with consistent hashing on the 5-tuple). An L7 LB terminates TLS, parses HTTP, chooses a backend per request, and keeps pooled connections to backends." },
              { title: "Application", detail: "Only now does your code run — reading from caches and databases over (ideally reused) connections." },
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Latency budget of a first request",
        blocks: [
          {
            type: "p",
            text: "User in Europe, server in us-east, RTT ≈ 90 ms. Approximate cold-start cost:",
          },
          {
            type: "table",
            head: ["Step", "Round trips", "Approx. time"],
            rows: [
              ["DNS (resolver cache miss)", "several, to various servers", "20–100 ms"],
              ["TCP handshake", "1", "90 ms"],
              ["TLS 1.3 handshake", "1", "90 ms"],
              ["HTTP request + response", "1 (+ server time)", "90 ms + 30 ms"],
              ["Total", "", "≈ 300–400 ms"],
            ],
          },
          {
            type: "list",
            items: [
              "**Terminate TLS at a nearby edge (CDN/PoP):** handshakes happen over a ~10 ms RTT instead of 90 ms; the edge keeps warm connections to origin.",
              "**Reuse connections:** HTTP keep-alive, HTTP/2 multiplexing and connection pools amortise handshakes to zero.",
              "**Longer DNS TTLs** for stable records reduce lookups; short TTLs (30–60 s) when you need fast failover.",
            ],
          },
        ],
      },
      {
        id: "examples",
        title: "Production topology",
        blocks: [
          {
            type: "flow",
            nodes: ["Client", "DNS (geo/latency routing)", "CDN + WAF", "Public L7 LB (TLS termination)", "Private subnet: app instances (SG: only from LB)", "Private subnet: DB (SG: only from app)"],
            caption: "A common layered setup: only the edge and the LB are internet-facing.",
          },
          {
            type: "code",
            lang: "text",
            caption: "Conceptual security group rules",
            code: `sg-lb:  inbound 443/tcp from 0.0.0.0/0
sg-app: inbound 8080/tcp from sg-lb
sg-db:  inbound 5432/tcp from sg-app
(all: outbound restricted to what each tier needs)`,
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**DNS caching ignores your urgency:** some resolvers and clients cache longer than the TTL, so DNS failover can take minutes for a tail of users.",
              "**DNS is not a load balancer:** clients often pick the first IP and don't health-check; use it for coarse geo-steering, with real LBs behind it.",
              "**Connection draining:** removing a backend abruptly breaks in-flight requests; LBs need a deregistration delay.",
              "**Long-lived connections** (WebSockets, gRPC streams) stick to a backend; L4 balancing of them can become uneven after scaling events.",
              "**Ephemeral port / conntrack exhaustion** on NAT gateways or LBs under very high connection churn.",
              "**L7 LB timeouts** (idle timeout) silently kill idle keep-alive or streaming connections — align with app and client timeouts.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "L4 load balancer", points: ["Very fast, high throughput, low cost per connection", "Protocol-agnostic (TCP/UDP, databases, custom protocols)", "Can preserve client IP / pass TLS through", "No path routing, retries or header logic"] },
              { title: "L7 load balancer", points: ["Content-based routing (host, path, header), canaries", "TLS termination, HTTP/2 and gRPC per-request balancing", "Retries, rate limiting, auth, observability per request", "More CPU per request; another TLS hop if re-encrypting"] },
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
              "**Monitor** DNS resolution errors, TLS handshake failures and certificate expiry, LB 5xx split by 'from LB' vs 'from backend', healthy-host count, surge queue / rejected connections.",
              "**Classic outages:** expired certificates, a bad DNS change propagated globally, health checks that are too strict (flapping) or too shallow (pass while the app is broken).",
              "**Cost:** managed LBs bill per hour and per processed unit (connections, bytes, rules); cross-AZ traffic to backends may be billed.",
              "**Security:** defence in depth — WAF at the edge, security groups per tier, private subnets, TLS internally too (mTLS in service meshes).",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Before my code runs, the client resolves the name via DNS, opens a TCP connection (one round trip) and does a TLS handshake (one more round trip in TLS 1.3). Traffic passes firewalls or security groups and reaches a load balancer: L4 balances connections by IP and port, L7 terminates TLS and routes per HTTP request. To cut latency I terminate TLS at the edge and reuse connections; for safety only the edge is public and each tier only accepts traffic from the tier in front.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "DNS gives coarse global steering (geo/latency/weighted records, anycast); LBs give fine-grained health-aware balancing.",
              "Handshake cost is per connection: pools and HTTP/2 multiplexing make it vanish for steady traffic, which is why cold-start latency differs from steady-state latency.",
              "L7 LBs are a natural place for cross-cutting concerns (auth, rate limits, retries) — but retries there must respect idempotency.",
              "Health checks: liveness vs readiness; avoid checks that depend on shared dependencies, or one DB blip ejects every instance.",
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
              "DNS: name → IP, cached by TTL; good for geo-steering, slow for failover.",
              "TCP: 1 RTT handshake; TLS 1.3: +1 RTT; reuse connections.",
              "Firewalls/security groups: least privilege per tier; WAF for HTTP attacks.",
              "L4 LB: fast, connection-level. L7 LB: smart, request-level.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "TTL (DNS)", definition: "How long resolvers may cache a DNS answer." },
      { term: "Recursive resolver", definition: "The DNS server that walks the hierarchy on behalf of clients and caches answers." },
      { term: "RTT", definition: "Round-trip time: time for a packet to go to a peer and a reply to come back." },
      { term: "TLS termination", definition: "Decrypting TLS at a proxy or load balancer so it can inspect and route HTTP." },
      { term: "Security group", definition: "A stateful, instance-level virtual firewall in cloud networks." },
      { term: "WAF", definition: "Web application firewall that filters HTTP requests by rules and signatures." },
      { term: "Anycast", definition: "Announcing the same IP from many locations so packets reach the nearest one." },
    ],
    followUps: [
      { q: "How would you fail over a region using DNS, and what's the catch?", a: "Health-checked DNS records (e.g. failover or latency routing) stop returning the unhealthy region's IPs. The catch is caching: clients and resolvers keep old answers for the TTL or longer, so some traffic keeps going to the failed region for minutes. Anycast or a global LB reacts faster." },
      { q: "Why terminate TLS at the load balancer?", a: "It centralises certificates, lets the LB route on HTTP content, offloads crypto from apps and enables HTTP/2 to clients. If compliance requires encryption in transit internally, re-encrypt to backends or use mTLS." },
      { q: "What's the difference between a security group and a network ACL in AWS?", a: "Security groups are stateful (return traffic allowed automatically), attach to network interfaces and only have allow rules. NACLs are stateless (you must allow both directions), attach to subnets and support allow and deny rules evaluated in order." },
      { q: "Why do gRPC services often need an L7 load balancer?", a: "gRPC multiplexes many requests over one long-lived HTTP/2 connection; an L4 LB balances connections, so one backend can get all of a client's requests. An L7 LB (or client-side balancing) balances individual requests." },
      { q: "What is 0-RTT in TLS 1.3 and why is it risky?", a: "Resumed sessions can send application data with the first flight, saving a round trip. That data can be replayed by an attacker, so servers should accept it only for idempotent requests." },
    ],
    quiz: [
      {
        id: "dns-q1",
        prompt: "How many network round trips does a fresh HTTPS connection with TLS 1.3 need before the first request byte is sent (ignoring DNS)?",
        options: ["0", "1", "2", "4"],
        answer: 2,
        explanation: "One for the TCP handshake and one for the TLS 1.3 handshake. (QUIC/HTTP/3 combines them into one.)",
      },
      {
        id: "dns-q2",
        prompt: "Which component can route /api/* and /static/* to different backend pools?",
        options: ["L4 load balancer", "L7 load balancer", "Network ACL", "DNS A record"],
        answer: 1,
        explanation: "Path-based routing requires parsing HTTP, which is L7.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── 5. sql-vs-nosql
  {
    slug: "sql-vs-nosql",
    track: "system-design",
    title: "SQL vs NoSQL",
    summary:
      "Relational databases versus key-value, document, wide-column and graph stores: what each data model is good at, how they scale, what consistency they give, and how to choose from access patterns instead of hype.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 30,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["system-design/interview-framework"],
    related: [
      "system-design/data-modeling",
      "system-design/database-indexes",
      "system-design/sharding-partitioning",
      "system-design/replication",
      "system-design/cap-theorem",
      "databases/transactions-acid",
      "databases/orm-vs-odm",
    ],
    tags: ["sql", "nosql", "relational", "document", "key-value", "wide-column", "graph", "database-choice"],
    sources: [
      CHECKLIST,
      DDIA,
      DYNAMO,
      { label: "Amazon DynamoDB — NoSQL design best practices", url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-general-nosql-design.html", kind: "docs" },
      { label: "Apache Cassandra — Data modeling", url: "https://cassandra.apache.org/doc/latest/cassandra/developing/data-modeling/index.html", kind: "docs" },
      { label: "PostgreSQL documentation", url: "https://www.postgresql.org/docs/current/", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Describe the relational model and the four main NoSQL families.",
              "Explain what 'scales horizontally' really means for each and what you give up.",
              "Choose a store from access patterns, consistency needs and operational constraints.",
              "Avoid the myths ('SQL doesn't scale', 'NoSQL has no schema').",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A relational database is a well-organised library with a catalogue: you can ask almost any question, joining facts from different shelves, and the librarian guarantees consistency. A NoSQL store is more like a set of labelled lockers: blazing fast if you know the locker number (the key), designed so you can add lockers forever — but asking 'which lockers contain red items?' is expensive unless you planned for it.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Family", "Data model", "Examples", "Sweet spot"],
            rows: [
              ["Relational (SQL)", "Tables of rows, foreign keys, joins, declarative SQL, ACID transactions", "PostgreSQL, MySQL, SQL Server; distributed SQL: Spanner, CockroachDB", "Business data with relationships and invariants; ad-hoc queries"],
              ["Key-value", "Opaque value by key", "Redis, DynamoDB (also document-ish), Memcached", "Sessions, caches, counters, lookups by ID at huge scale"],
              ["Document", "JSON-like nested documents, queries on fields", "MongoDB, Couchbase, Firestore", "Self-contained aggregates (a product with variants); flexible attributes"],
              ["Wide-column", "Rows keyed by partition key, sorted by clustering columns", "Cassandra, ScyllaDB, HBase, Bigtable", "Very high write throughput, time series, messages per conversation"],
              ["Graph", "Nodes and edges with properties", "Neo4j, Amazon Neptune", "Multi-hop relationship queries (fraud rings, recommendations)"],
            ],
          },
          {
            type: "callout",
            tone: "misconception",
            text: "'NoSQL' doesn't mean schemaless — it means *schema-on-read*: the application still assumes a shape; the database just doesn't enforce it. It also doesn't automatically mean eventual consistency: DynamoDB, MongoDB and others offer strongly consistent reads and transactions with caveats.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "The database is the hardest component to change later; it shapes your data model, consistency and scaling story.",
              "Interviewers want the choice justified by access patterns and requirements, not by brand.",
              "Many production systems use both (polyglot persistence): SQL as the system of record, plus Redis, a search index, a wide-column store for events.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "Why they scale differently",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Relational", detail: "Traditionally one primary node owns all writes; joins, foreign keys and multi-row transactions are cheap because all data is local. Scaling writes means sharding, which makes cross-shard joins and transactions expensive — or adopting distributed SQL that does consensus-based replication and distributed transactions at extra latency." },
              { title: "Key-value / wide-column", detail: "Designed around a partition key from day one: data is hash-partitioned across nodes, each operation touches one partition, so adding nodes adds capacity. The price: queries must follow the key; joins and secondary indexes are limited or expensive." },
              { title: "Document", detail: "Groups related data into one document (an aggregate), so most reads are single-document lookups. Sharded by a shard key. Multi-document transactions exist in modern MongoDB but cost more." },
              { title: "Storage engines", detail: "Many relational stores use B-tree indexes (read-optimised, in-place updates); Cassandra/RocksDB-based stores use LSM trees (write-optimised, append + compaction). This, more than 'SQL vs NoSQL', determines write vs read performance." },
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Choosing for an e-commerce platform",
        blocks: [
          {
            type: "table",
            head: ["Data", "Access pattern", "Choice", "Why"],
            rows: [
              ["Orders, payments, inventory", "Transactions across rows; strong invariants (no overselling)", "PostgreSQL", "ACID, constraints, joins for reporting"],
              ["Product catalogue", "Read by ID, flexible attributes per category", "Document store or Postgres JSONB", "Varying attributes per category; read-heavy"],
              ["Shopping cart / sessions", "Get/put by user ID, TTL", "Redis or DynamoDB", "Simple key access, high QPS, expiring"],
              ["Clickstream events", "Append at 100k/s; read by user + time range", "Wide-column or a log (Kafka) + warehouse", "Write throughput, time-ordered partitions"],
              ["Search", "Full-text, facets", "Elasticsearch/OpenSearch", "Inverted index; fed from the system of record"],
              ["'Customers who bought X…'", "Multi-hop traversals", "Graph store or precomputed tables", "Joins of unknown depth"],
            ],
          },
        ],
      },
      {
        id: "examples",
        title: "Same query, two models",
        blocks: [
          {
            type: "code",
            lang: "sql",
            caption: "Relational: normalised tables, joined at read time",
            code: `SELECT o.id, o.created_at, i.product_id, i.qty
FROM orders o
JOIN order_items i ON i.order_id = o.id
WHERE o.user_id = 42
ORDER BY o.created_at DESC
LIMIT 20;`,
          },
          {
            type: "code",
            lang: "text",
            caption: "Wide-column / key-value: one partition per user, sorted by time — query is a single partition read",
            code: `table orders_by_user
  partition key: user_id
  clustering key: created_at DESC, order_id
  columns: items (list<item>), total, status

read: partition user_id=42, first 20 rows`,
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**New query, NoSQL edition:** an access pattern you didn't design for may require a new table, a global secondary index, or a backfill — schema changes moved into application code.",
              "**Hot partitions:** a key-based store is only as scalable as its key distribution; one celebrity partition throttles regardless of cluster size.",
              "**Relational at scale is real:** single Postgres/MySQL nodes routinely handle tens of thousands of simple queries per second and multi-TB datasets; many companies shard MySQL successfully (e.g. with Vitess).",
              "**Secondary indexes in distributed stores** are either local (query must hit all partitions) or global (async, eventually consistent).",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Choose SQL when", points: ["Data is relational with invariants (money, inventory, bookings)", "You need multi-row transactions and constraints", "Queries are varied or unknown (analytics, admin tools)", "Scale fits one primary plus replicas for the foreseeable future"] },
              { title: "Choose NoSQL when", points: ["Access patterns are known and key-based", "Write throughput or data volume exceeds a single primary", "You need predictable single-digit-ms latency at any scale", "Data is naturally aggregate-shaped or schema varies widely"] },
            ],
          },
          {
            type: "callout",
            tone: "tip",
            text: "Good default in interviews: 'Start with Postgres as the system of record; move specific high-volume, key-based workloads to a specialised store when numbers justify it.'",
          },
        ],
      },
      {
        id: "real-world",
        blocks: [
          {
            type: "list",
            items: [
              "**Operations:** self-managed Cassandra needs compaction, repair and tombstone tuning; managed services (DynamoDB, Aurora, Cloud SQL) trade cost for less toil.",
              "**Cost model:** DynamoDB bills per request/capacity unit — a scan-heavy design gets expensive; relational instances bill per hour regardless of load.",
              "**Monitor:** query latency percentiles, replication lag, partition/throttle metrics, storage growth, compaction backlog.",
              "**Migration** between models is expensive (dual writes, backfills, verification) — part of why the initial choice matters.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Relational databases give a flexible query language, joins, constraints and ACID transactions, and scale reads well with replicas; scaling writes requires sharding or distributed SQL. NoSQL stores — key-value, document, wide-column, graph — are built around a partition key, so they scale out easily and give predictable latency, but you must design tables around known access patterns and accept limited joins and often weaker consistency. I default to SQL for core business data and add NoSQL for specific high-scale, key-based workloads.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Frame the choice by data model (relational vs aggregate vs graph), consistency/transaction needs, access patterns, scale and team/ops capability.",
              "Storage engine (B-tree vs LSM) drives read/write performance more than the query language.",
              "Distributed SQL (Spanner, CockroachDB, Yugabyte) blurs the line: SQL + horizontal scale at the cost of higher write latency from consensus.",
              "Mention polyglot persistence with a single system of record and derived stores fed by CDC or events.",
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
              "SQL: flexible queries, joins, transactions; vertical + replicas, then sharding.",
              "NoSQL: key-first design, horizontal scale, query-driven modelling.",
              "Choose from access patterns and invariants, not fashion.",
              "Most real systems combine both.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "ACID", definition: "Atomicity, Consistency, Isolation, Durability — transaction guarantees." },
      { term: "Partition key", definition: "The attribute whose hash (or range) determines which node stores a row." },
      { term: "Aggregate", definition: "A cluster of related data treated as a unit for reads and writes (e.g. an order with its items)." },
      { term: "Schema-on-read", definition: "The structure is interpreted by the application when reading, rather than enforced on write." },
      { term: "Polyglot persistence", definition: "Using different databases for different workloads within one system." },
    ],
    followUps: [
      { q: "Can't you just scale Postgres?", a: "Yes, a long way: vertical scaling, read replicas, connection pooling, partitioned tables and caching handle most products. Beyond a single primary's write capacity you shard (application-level or Citus/Vitess-style) or move to distributed SQL." },
      { q: "When would you pick DynamoDB over Postgres?", a: "Known key-based access patterns, very high or spiky scale, a need for predictable latency and little ops overhead — e.g. session stores, carts, idempotency keys, IoT device state. Not for ad-hoc analytics or complex multi-entity invariants." },
      { q: "How do you handle relationships in a document store?", a: "Embed when data is read together and owned by the parent (order items); reference by ID when shared or unbounded (users, products), accepting application-side joins or denormalised copies." },
      { q: "Is MongoDB eventually consistent?", a: "Not by default for reads from the primary; consistency depends on read/write concerns and read preference. Reading from secondaries is eventually consistent; majority write concern plus majority read concern gives stronger guarantees." },
      { q: "What does Cassandra's tunable consistency mean?", a: "Each operation chooses how many replicas must respond (ONE, QUORUM, ALL). With R + W > N (e.g. QUORUM reads and writes), reads overlap the latest acknowledged write, though edge cases like sloppy quorums and clock-based conflict resolution still apply." },
    ],
    quiz: [
      {
        id: "sn-q1",
        prompt: "A bank needs to move money between accounts without ever losing or duplicating it. What's the best default?",
        options: ["A wide-column store with eventual consistency", "A relational database with ACID transactions", "Memcached", "A graph database"],
        answer: 1,
        explanation: "The core requirement is a multi-row atomic update with invariants, which is exactly what relational ACID transactions provide.",
      },
      {
        id: "sn-q2",
        prompt: "What is the main cost of designing a Cassandra table around a known query?",
        options: ["It can't store more than 1 GB", "New, unforeseen queries may need new tables or backfills", "It cannot replicate", "It has no indexes at all"],
        answer: 1,
        explanation: "Query-first modelling makes the planned queries fast and other queries expensive; supporting new ones often means new denormalised tables.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── 6. data-modeling
  {
    slug: "data-modeling",
    track: "system-design",
    title: "Data modeling",
    summary:
      "How to turn entities and access patterns into tables or documents: keys, relationships, cardinality, choosing primary and partition keys, ID generation, and modelling for the queries you actually run.",
    level: "intermediate",
    frequency: "high",
    minutes: 30,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["system-design/sql-vs-nosql"],
    related: [
      "system-design/database-indexes",
      "system-design/normalization-denormalization",
      "system-design/sharding-partitioning",
      "databases/indexing",
      "databases/prisma",
    ],
    tags: ["data-modeling", "schema", "primary-key", "partition-key", "relationships", "ids", "access-patterns"],
    sources: [
      CHECKLIST,
      DDIA,
      { label: "Amazon DynamoDB — Best practices for designing and using partition keys", url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-design.html", kind: "docs" },
      { label: "PostgreSQL docs — Data Definition", url: "https://www.postgresql.org/docs/current/ddl.html", kind: "docs" },
      { label: "Instagram Engineering — Sharding & IDs at Instagram", url: "https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c", kind: "external" },
      { label: "RFC 9562 — UUIDs (including UUIDv7)", url: "https://www.rfc-editor.org/rfc/rfc9562", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Derive entities, relationships and cardinalities from requirements.",
              "Pick primary keys and partition keys that fit access patterns and distribute load.",
              "Model one-to-many and many-to-many relationships in relational and NoSQL stores.",
              "Choose an ID strategy (auto-increment, UUIDv4, UUIDv7, Snowflake-style).",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A data model is the shape of your filing system. A good one makes the common questions cheap ('show this user's last 20 orders') and keeps facts consistent. A bad one makes every page load a scavenger hunt. You design it by first listing the questions, then shaping the drawers around them.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Concept", "Meaning"],
            rows: [
              ["Entity", "A thing you store (User, Order, Product)"],
              ["Attribute", "A field of an entity (email, price)"],
              ["Relationship & cardinality", "1:1, 1:N (user → orders), M:N (students ↔ courses, via a join table)"],
              ["Primary key", "Uniquely identifies a row; in many engines also determines physical order (InnoDB clustered index)"],
              ["Partition key", "In distributed stores, decides which node holds the row"],
              ["Sort / clustering key", "Orders rows within a partition, enabling range queries"],
              ["Access pattern", "A concrete query the app runs, with its frequency and latency need"],
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
              "Data outlives code: schema mistakes are expensive to migrate at scale.",
              "Keys determine performance: a poor partition key creates hot spots no hardware fixes.",
              "Interviewers expect a data model in step 5 of the framework — entities, keys and the main queries.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "The modelling process",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "List entities and relationships", detail: "Nouns from the requirements become entities; verbs become relationships. Note cardinality and whether a relationship is bounded (an order's items) or unbounded (a user's followers)." },
              { title: "List access patterns", detail: "For each screen/API: the query, its filter and sort, frequency, latency target, and consistency need. Example: 'get conversation messages, newest first, page of 50 — 10k QPS, p99 < 50 ms'." },
              { title: "Choose keys", detail: "Primary key for uniqueness; partition key for distribution (high cardinality, evenly accessed); sort key for range queries within a partition." },
              { title: "Decide embed vs reference", detail: "Embed data read together and owned by the parent; reference shared or unbounded data." },
              { title: "Add indexes", detail: "One per access pattern that the primary key doesn't serve — and no more (each costs writes)." },
              { title: "Plan evolution", detail: "Nullable new columns, backfills, versioned documents, expand-and-contract migrations." },
            ],
          },
          {
            type: "table",
            head: ["ID strategy", "Pros", "Cons"],
            rows: [
              ["Auto-increment BIGINT", "Small, ordered, index-friendly", "Single-writer bottleneck when sharded; leaks volume; guessable"],
              ["UUIDv4 (random)", "Generated anywhere, no coordination", "16 bytes; random inserts fragment B-tree indexes and hurt cache locality"],
              ["UUIDv7 / ULID (time-ordered)", "Decentralised and roughly sortable; good index locality", "Exposes creation time; still 16 bytes"],
              ["Snowflake-style 64-bit (time + machine + sequence)", "Compact, sortable, decentralised", "Needs machine-ID assignment; sensitive to clock skew"],
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Worked example: a chat app",
        blocks: [
          {
            type: "list",
            items: [
              "AP1: list a user's conversations ordered by last activity.",
              "AP2: fetch the latest 50 messages in a conversation, paginate backwards.",
              "AP3: send a message (append) — very high volume.",
              "AP4: look up a user by email at login.",
            ],
          },
          {
            type: "code",
            lang: "sql",
            caption: "Relational version (works well up to a large single-node scale)",
            code: `CREATE TABLE users (
  id          BIGINT PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,          -- AP4
  name        TEXT NOT NULL
);

CREATE TABLE conversations (
  id               BIGINT PRIMARY KEY,
  last_message_at  TIMESTAMPTZ NOT NULL
);

CREATE TABLE conversation_members (           -- M:N users <-> conversations
  user_id          BIGINT REFERENCES users(id),
  conversation_id  BIGINT REFERENCES conversations(id),
  PRIMARY KEY (user_id, conversation_id)
);

CREATE TABLE messages (
  conversation_id  BIGINT NOT NULL,
  id               BIGINT NOT NULL,            -- time-ordered (Snowflake-style)
  sender_id        BIGINT NOT NULL,
  body             TEXT NOT NULL,
  PRIMARY KEY (conversation_id, id)            -- AP2 + AP3: range scan in one key prefix
);`,
          },
          {
            type: "p",
            text: "At larger scale, `messages` moves to a wide-column store with partition key `conversation_id` and clustering key `message_id DESC` — the same shape, distributed. For very large group chats, add a time bucket to the partition key (`conversation_id, day`) so partitions stay bounded. AP1 is served by a denormalised `user_conversations(user_id, last_message_at, conversation_id)` table updated on each message.",
          },
        ],
      },
      {
        id: "examples",
        title: "Partition-key quality check",
        blocks: [
          {
            type: "table",
            head: ["Candidate key", "Verdict", "Reason"],
            rows: [
              ["country", "Bad", "Low cardinality; a few countries dominate"],
              ["created_date", "Bad", "All of today's writes hit one partition"],
              ["user_id", "Usually good", "High cardinality; but power users can be hot"],
              ["conversation_id + time bucket", "Good for large chats", "Bounds partition size"],
              ["tenant_id", "Good for B2B isolation", "Large tenants may need sub-partitioning"],
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Unbounded relationships** (followers, messages) must not be embedded in a single document or row — they grow without limit.",
              "**Soft deletes** (`deleted_at`) complicate unique constraints and every query; consider partial indexes or archival tables.",
              "**Time zones & money:** store timestamps in UTC (`TIMESTAMPTZ`), money as integer minor units or `NUMERIC`, never floats.",
              "**Polymorphic associations** (a `comments` table pointing to many parent types) lose foreign-key integrity.",
              "**Schema migrations** on large tables can lock or rewrite them; use online migration tools and expand → migrate → contract.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Model by entities (relational-first)", points: ["Flexible for future queries", "One source of truth per fact", "Reads may need joins"] },
              { title: "Model by queries (NoSQL-first)", points: ["Each query is one partition read", "Data duplicated across tables", "New queries need new tables/backfills"] },
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
              "**Monitor** slow-query logs, table/partition size distribution, index bloat and hot partitions (throttling metrics in DynamoDB, per-partition load in Cassandra).",
              "**Failure mode:** a growing partition (e.g. one tenant) slows compaction and repairs, then causes timeouts.",
              "**Operational practice:** schema changes reviewed like code; backward-compatible migrations so old and new app versions run side by side during deploys.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "I start from the access patterns: list each query with its filter, sort and volume. Then I identify entities and relationships, pick primary keys for uniqueness, partition keys with high cardinality and even load, and sort keys for range queries. I embed data that's read together and bounded, reference data that's shared or unbounded, and add only the indexes the queries need. For IDs I prefer time-ordered ones like UUIDv7 or Snowflake-style IDs for index locality without central coordination.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Composite primary keys like (conversation_id, message_id) make the common query a single contiguous range scan.",
              "Bound partition size with time buckets; estimate rows per partition from your numbers.",
              "Random UUID primary keys cause B-tree page splits and poor cache locality in clustered indexes (InnoDB); time-ordered IDs fix that.",
              "Plan for evolution: additive changes, dual-reading during migrations, versioned document schemas.",
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
              "Access patterns first, schema second.",
              "Keys decide performance: uniqueness, distribution, ordering.",
              "Embed bounded, co-read data; reference shared or unbounded data.",
              "Choose IDs deliberately; plan migrations from day one.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Cardinality", definition: "How many of one entity relate to another (1:1, 1:N, M:N); also the number of distinct values of a column." },
      { term: "Join table", definition: "A table that implements an M:N relationship with one row per pair." },
      { term: "Clustering key", definition: "Column(s) that order rows inside a partition." },
      { term: "UUIDv7", definition: "A UUID whose leading bits are a Unix timestamp, making IDs roughly time-ordered (RFC 9562)." },
      { term: "Expand-and-contract", definition: "Migration pattern: add the new structure, migrate data and code, then remove the old structure." },
    ],
    followUps: [
      { q: "Why not use the email as the primary key?", a: "Emails change and are long; foreign keys everywhere would need updating. Use a surrogate ID as the primary key and a unique index on email." },
      { q: "How would you model followers for a social network?", a: "A `follows(follower_id, followee_id)` table with the primary key in one direction and an index (or a second denormalised table) for the other direction. At scale, partition each direction by its leading ID and handle celebrity accounts specially." },
      { q: "What's wrong with random UUIDv4 primary keys in MySQL?", a: "InnoDB clusters rows by primary key, so random keys insert into random pages, causing page splits, fragmentation and poor buffer-pool locality; every secondary index also stores the 16-byte key. Time-ordered IDs append near the end." },
      { q: "How do you add a NOT NULL column to a billion-row table safely?", a: "Add it nullable (or with a default that the engine can apply without a rewrite), backfill in batches, deploy code that writes it, then add the constraint (validated online where supported)." },
    ],
    quiz: [
      {
        id: "dm-q1",
        prompt: "In a wide-column store, which is the best partition key for 'get the last 50 messages of a conversation'?",
        options: ["message_id", "sender_id", "conversation_id (optionally with a time bucket)", "created_date"],
        answer: 2,
        explanation: "All messages of a conversation live in one partition, sorted by time, so the query is a single partition range read; time buckets bound partition size.",
      },
      {
        id: "dm-q2",
        prompt: "Which relationship should NOT be embedded inside the parent document?",
        options: ["An order's line items", "A user's address", "A celebrity's followers", "A product's variants"],
        answer: 2,
        explanation: "Followers are unbounded and shared; embedding them would create huge, constantly rewritten documents.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── 7. database-indexes
  {
    slug: "database-indexes",
    track: "system-design",
    title: "Database indexes",
    summary:
      "How indexes turn full scans into lookups: B-tree/B+tree and LSM-tree internals, hash indexes, composite indexes and the leftmost-prefix rule, covering indexes, and what every index costs on writes.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 35,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["system-design/data-modeling"],
    related: [
      "databases/indexing",
      "system-design/sql-vs-nosql",
      "system-design/normalization-denormalization",
      "system-design/locks-transactions-isolation",
      "dsa/trees",
      "dsa/hash-tables",
    ],
    tags: ["indexes", "b-tree", "b+tree", "lsm", "hash-index", "composite-index", "covering-index", "query-planning"],
    sources: [
      CHECKLIST,
      DDIA,
      { label: "Use The Index, Luke — SQL indexing and tuning", url: "https://use-the-index-luke.com/", kind: "external" },
      { label: "PostgreSQL docs — Indexes", url: "https://www.postgresql.org/docs/current/indexes.html", kind: "docs" },
      { label: "PostgreSQL docs — Index-Only Scans and Covering Indexes", url: "https://www.postgresql.org/docs/current/indexes-index-only-scans.html", kind: "docs" },
      { label: "MySQL 8.0 docs — Multiple-Column Indexes", url: "https://dev.mysql.com/doc/refman/8.0/en/multiple-column-indexes.html", kind: "docs" },
      { label: "RocksDB wiki — Leveled Compaction", url: "https://github.com/facebook/rocksdb/wiki/Leveled-Compaction", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain how a B+tree index finds a row in a handful of page reads.",
              "Contrast B-tree and LSM-tree storage engines and their read/write amplification.",
              "Design composite indexes using the leftmost-prefix rule and column ordering.",
              "Use covering indexes, and reason about the write and storage cost of every index.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "An index is the index at the back of a book: instead of reading every page to find 'replication', you look it up alphabetically and jump to page 312. It's a second, sorted copy of some columns plus a pointer to the full row. The book gets thicker and every edit must update the index too — that's the cost.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Index type", "Structure", "Good for", "Not good for"],
            rows: [
              ["B-tree / B+tree", "Balanced tree of sorted keys in fixed-size pages", "Equality, ranges, ORDER BY, prefix LIKE 'abc%'", "Leading-wildcard search, very high random-write rates"],
              ["Hash", "Hash table of key → row location", "Exact equality", "Ranges, sorting, prefix search"],
              ["LSM tree", "In-memory memtable + immutable sorted files (SSTables) merged by compaction", "Write-heavy workloads, sequential I/O", "Read latency predictability; space during compaction"],
              ["Specialised", "GIN/inverted, GiST, BRIN, bitmap, full-text, vector (HNSW)", "Arrays/JSON/full-text, geo, append-ordered big tables, analytics, similarity", "General OLTP lookups"],
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "'B-tree' in Postgres and InnoDB is really a B+tree variant: all keys live in leaves, leaves are linked for range scans, and inner pages only route. In InnoDB the table itself is a B+tree clustered by primary key and secondary indexes store the primary key; in Postgres the table is an unordered heap and every index points to a tuple location (TID).",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "Without an index, a query scans every row: O(n). With a B+tree: O(log n) page reads — for a billion rows, ~3–4 levels because each page holds hundreds of keys.",
              "Indexes are the cheapest, highest-leverage performance fix — and the most common cause of slow writes and bloated storage when overused.",
              "Interviewers expect you to name the indexes your data model needs.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "How the structures work",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "B+tree lookup", detail: "Start at the root page, binary-search the keys to choose a child, repeat down to a leaf, then follow the pointer to the row (or read it directly in a clustered index). Root and inner pages are almost always cached in memory, so a lookup typically costs 1–2 disk reads." },
              { title: "B+tree range scan", detail: "Find the first key, then walk linked leaf pages in order — which is why ORDER BY on an indexed column can avoid a sort." },
              { title: "B+tree writes", detail: "Insert into the right leaf; if it's full, split it and push a key up. Updates happen in place (plus WAL), so random inserts cause random I/O and page splits." },
              { title: "LSM write", detail: "Append to a write-ahead log, insert into the in-memory memtable; when full, flush it as a sorted, immutable SSTable. Writes are sequential and fast." },
              { title: "LSM read", detail: "Check the memtable, then SSTables newest to oldest; Bloom filters skip files that can't contain the key. Background compaction merges files, drops overwritten values and tombstones." },
              { title: "Amplification", detail: "B-trees: higher write amplification for random writes (whole pages rewritten). LSM: write amplification from repeated compaction, read amplification from checking several files, space amplification before compaction catches up." },
            ],
          },
          {
            type: "p",
            text: "**Composite index and the leftmost prefix.** An index on `(a, b, c)` is sorted by a, then b within a, then c within b — like a phone book sorted by last name, then first name. It can seek on `a`, `a, b` or `a, b, c`, and on `a = ? AND b > ?`. It cannot efficiently seek on `b` alone, because b values are scattered across all a's. After the first range condition, later columns can't be used for seeking (only for filtering inside the index).",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "Some engines can 'skip scan' a composite index when the leading column has few distinct values (MySQL 8.0.13+; PostgreSQL 18 added B-tree skip scan). Treat it as an optimisation, not a design strategy.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Designing indexes for an orders table",
        blocks: [
          {
            type: "code",
            lang: "sql",
            caption: "Query: a user's recent orders with a given status",
            code: `SELECT id, created_at, total
FROM orders
WHERE user_id = 42 AND status = 'shipped'
ORDER BY created_at DESC
LIMIT 20;

-- Equality columns first, then the sort/range column:
CREATE INDEX orders_user_status_created
  ON orders (user_id, status, created_at DESC)
  INCLUDE (id, total);   -- PostgreSQL 11+: covering, enables an index-only scan`,
          },
          {
            type: "steps",
            steps: [
              { title: "Seek", detail: "Jump to (42, 'shipped', newest) in the index." },
              { title: "Scan", detail: "Read 20 consecutive leaf entries — already in created_at DESC order, so no sort." },
              { title: "Cover", detail: "Every selected column (`id`, `created_at`, `total`) is in the index, so Postgres can skip the heap when the visibility map marks those pages all-visible. (In InnoDB, secondary indexes already carry the primary key, so `id` would come for free.)" },
            ],
          },
          {
            type: "p",
            text: "Verify with `EXPLAIN (ANALYZE, BUFFERS)`: look for an Index Only Scan with no Sort node and a low 'Heap Fetches' count.",
          },
        ],
      },
      {
        id: "examples",
        title: "Will the index (a, b, c) be used?",
        blocks: [
          {
            type: "table",
            head: ["Predicate", "Seek using index?", "Why"],
            rows: [
              ["a = 1", "Yes", "Leftmost prefix"],
              ["a = 1 AND b = 2", "Yes", "Prefix (a, b)"],
              ["a = 1 AND c = 3", "Seek on a; c filtered within index", "b is skipped"],
              ["b = 2", "Not for a seek (maybe a full index scan or skip scan)", "Not a leftmost prefix"],
              ["a > 1 AND b = 2", "Seek on a only", "Range on a stops further seeking"],
              ["a = 1 ORDER BY b", "Yes, and avoids a sort", "Entries for a = 1 are sorted by b"],
              ["lower(a) = 'x'", "No (unless an expression index on lower(a))", "Function hides the indexed value"],
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Low selectivity:** an index on `status` with 3 values is rarely used — reading 30% of a table via random lookups is slower than a sequential scan. Partial indexes (`WHERE status = 'pending'`) help for skewed values.",
              "**Functions and casts** on indexed columns (`WHERE DATE(created_at) = …`, implicit type casts) prevent index use; rewrite as ranges or use expression indexes.",
              "**Leading wildcards** (`LIKE '%foo'`) can't use a B-tree; use trigram (GIN) or full-text indexes.",
              "**Stale statistics** make the planner choose badly; run ANALYZE after bulk loads.",
              "**Index bloat** in Postgres after heavy updates/deletes; needs vacuum or REINDEX CONCURRENTLY.",
              "**Building an index on a large table** can block writes; use `CREATE INDEX CONCURRENTLY` (Postgres) or online DDL (MySQL).",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Each extra index…", "Effect"],
            rows: [
              ["Reads", "Faster for the queries it matches"],
              ["Writes", "Every INSERT and DELETE updates it; UPDATEs of indexed columns too (Postgres HOT updates are lost when an indexed column changes)"],
              ["Storage & memory", "Competes for buffer cache with table data"],
              ["Locking/replication", "More WAL/binlog volume, more replication traffic"],
            ],
          },
          {
            type: "compare",
            items: [
              { title: "B-tree engine (Postgres, InnoDB)", points: ["Predictable reads", "Great for mixed OLTP", "Random-write heavy loads cost more I/O"] },
              { title: "LSM engine (RocksDB, Cassandra)", points: ["Very high write throughput", "Compression-friendly", "Reads may touch several files; compaction needs tuning and headroom"] },
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
              "**Monitor:** slow query log / `pg_stat_statements`, unused indexes (`pg_stat_user_indexes.idx_scan = 0`), index size vs table size, cache hit ratio, compaction backlog for LSM stores.",
              "**Failure mode:** a deploy adds a query without an index → full scans → CPU spike → whole DB slows. Catch it with query review and EXPLAIN in CI or staging.",
              "**Failure mode:** an index migration locks a hot table at peak. Build indexes concurrently, off-peak.",
              "**Cost:** indexes multiply storage and IOPS on managed databases.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "An index is a separate sorted structure mapping column values to rows, usually a B+tree, so lookups and range scans take O(log n) page reads instead of a full scan. Composite indexes follow the leftmost-prefix rule, so I order columns as equality filters first, then the range or sort column. A covering index includes every column the query needs so the table isn't touched. Each index slows writes and uses storage, so I add them per access pattern. Write-heavy stores often use LSM trees instead, trading read and compaction cost for fast sequential writes.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Fan-out math: an 8 KB page holding ~200–500 keys gives depth 3–4 for billions of rows; upper levels stay in RAM.",
              "Clustered (InnoDB) vs heap (Postgres) affects secondary-index cost and primary-key choice.",
              "Selectivity and statistics drive the planner; an index exists ≠ an index is used.",
              "LSM: memtable + WAL + SSTables + Bloom filters + compaction (size-tiered vs leveled) — trade write, read and space amplification.",
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
              "B+tree: sorted, balanced, O(log n), great for ranges; LSM: write-optimised with compaction; hash: equality only.",
              "Composite (a, b, c): seeks on leftmost prefixes; equality first, then range/sort.",
              "Covering indexes avoid table lookups.",
              "Every index taxes writes, storage and memory — index for real queries only.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Selectivity", definition: "Fraction of rows a predicate matches; highly selective predicates benefit most from indexes." },
      { term: "Covering index", definition: "An index containing every column a query needs, so the table itself need not be read." },
      { term: "Clustered index", definition: "An index whose leaf level is the table data itself, ordered by the index key." },
      { term: "SSTable", definition: "Sorted String Table: an immutable, sorted file of key-value pairs in an LSM tree." },
      { term: "Compaction", definition: "Merging SSTables to discard overwritten/deleted data and reduce the number of files a read checks." },
      { term: "Bloom filter", definition: "A compact probabilistic set that can say 'definitely not present' or 'maybe present'." },
      { term: "Write amplification", definition: "Bytes physically written to storage per byte of logical data written." },
    ],
    followUps: [
      { q: "Why might the database ignore your index?", a: "Low selectivity (a sequential scan is cheaper), outdated statistics, a function or cast on the column, a non-leftmost predicate, or a small table. Check EXPLAIN and the row estimates." },
      { q: "Index (user_id, created_at) or (created_at, user_id) for 'user's orders in the last week'?", a: "(user_id, created_at): equality on user_id narrows to one contiguous block, then the range on created_at is a sequential leaf scan. The other order would scan all users' orders in the date range." },
      { q: "Why are LSM trees good for writes?", a: "Writes are buffered in memory and flushed as sequential immutable files, avoiding random in-place page updates. The cost is moved to background compaction and to reads that may check multiple files." },
      { q: "When would you use a hash index?", a: "For pure equality lookups where you never need ranges or ordering — e.g. in-memory key-value stores. In Postgres B-trees are usually just as good and more versatile; hash indexes are WAL-logged only since PostgreSQL 10." },
      { q: "How do you add an index to a 500 GB table in production?", a: "Use an online build (`CREATE INDEX CONCURRENTLY` in Postgres, online DDL or gh-ost/pt-osc in MySQL), schedule off-peak, monitor replication lag and I/O, and check that it completed validly." },
    ],
    quiz: [
      {
        id: "idx-q1",
        prompt: "Index on (country, city, signup_date). Which query can seek on the most index columns?",
        options: ["WHERE city = 'Pune'", "WHERE country = 'IN' AND city = 'Pune' AND signup_date > '2025-01-01'", "WHERE signup_date > '2025-01-01'", "WHERE country = 'IN' AND signup_date > '2025-01-01'"],
        answer: 1,
        explanation: "Equality on the first two columns followed by a range on the third uses the full leftmost prefix.",
      },
      {
        id: "idx-q2",
        prompt: "What is the main cost of adding five more indexes to a write-heavy table?",
        options: ["Reads become slower", "Every insert must update five more structures, increasing write latency, I/O and storage", "The table can no longer be replicated", "Transactions stop working"],
        answer: 1,
        explanation: "Indexes are maintained synchronously on writes; more indexes mean more work per write plus storage and cache pressure.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── 8. normalization-denormalization
  {
    slug: "normalization-denormalization",
    track: "system-design",
    title: "Normalization vs denormalization",
    summary:
      "Normalize to store each fact once and avoid update anomalies; denormalize to make hot reads cheap. Learn the normal forms that matter, the patterns of denormalization, and how to keep duplicated data consistent.",
    level: "intermediate",
    frequency: "high",
    minutes: 25,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["system-design/data-modeling"],
    related: [
      "system-design/database-indexes",
      "system-design/sql-vs-nosql",
      "system-design/caching-strategies",
      "system-design/async-processing",
      "distributed/event-driven-architecture",
    ],
    tags: ["normalization", "denormalization", "normal-forms", "materialized-views", "read-optimization", "cdc"],
    sources: [
      CHECKLIST,
      DDIA,
      { label: "PostgreSQL docs — Materialized Views", url: "https://www.postgresql.org/docs/current/rules-materializedviews.html", kind: "docs" },
      { label: "Database normalization (overview of normal forms)", url: "https://en.wikipedia.org/wiki/Database_normalization", kind: "external" },
      { label: "Debezium — Change Data Capture documentation", url: "https://debezium.io/documentation/reference/stable/index.html", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain the update, insert and delete anomalies that normalization prevents.",
              "Recognise 1NF, 2NF and 3NF in practice (without memorising formal definitions).",
              "Apply denormalization patterns: duplicated columns, precomputed counters, read models, materialized views.",
              "Keep denormalized data in sync and choose where each approach fits.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Normalization is keeping one master copy of each contact in your phone and referencing it everywhere. Denormalization is writing the friend's name and number on every calendar invite: faster to read, but when they change number you must fix every invite — or someone calls the old one.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Normal form", "Rule (informal)", "Violation example"],
            rows: [
              ["1NF", "Atomic values; no repeating groups", "`phones = '555-1, 555-2'` in one column"],
              ["2NF", "1NF + every non-key column depends on the *whole* composite key", "order_items(order_id, product_id, qty, product_name): name depends only on product_id"],
              ["3NF", "2NF + no non-key column depends on another non-key column", "orders(id, customer_id, customer_email): email depends on customer_id"],
              ["BCNF and beyond", "Stricter forms for edge cases", "Rarely discussed in system design interviews"],
            ],
          },
          {
            type: "p",
            text: "**Denormalization** deliberately stores redundant or precomputed data to avoid joins or aggregation at read time, accepting extra write work and the risk of inconsistency.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "**Normalize** to keep writes simple and correct: one place to update, constraints enforce integrity.",
              "**Denormalize** when reads dominate and joins or aggregations on the hot path are too slow or impossible (no joins across shards or in many NoSQL stores).",
              "The decision is about *where you pay*: at write time (denormalized) or read time (normalized).",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "Anomalies and denormalization patterns",
        blocks: [
          {
            type: "table",
            head: ["Anomaly (unnormalized data)", "What goes wrong"],
            rows: [
              ["Update anomaly", "Customer email stored on 1,000 orders; an update misses some → conflicting emails"],
              ["Insert anomaly", "Can't record a product until someone orders it, because product data lives only in order rows"],
              ["Delete anomaly", "Deleting the last order deletes the only record of the customer's email"],
            ],
          },
          {
            type: "table",
            head: ["Denormalization pattern", "Example", "Sync mechanism"],
            rows: [
              ["Duplicated attribute", "author_name on posts", "Update in the same transaction, or async fan-out on change"],
              ["Precomputed counter", "posts.like_count", "Atomic increment with the like insert; periodic reconciliation"],
              ["Embedded snapshot", "order_items.price_at_purchase", "Intentionally never synced — it's a historical fact"],
              ["Read model / projection", "user_feed table, search index", "Events or CDC → consumer builds the view"],
              ["Materialized view", "daily_sales_by_region", "REFRESH MATERIALIZED VIEW (CONCURRENTLY) on a schedule"],
              ["Summary/rollup tables", "hourly metrics", "Batch or stream aggregation"],
            ],
          },
          {
            type: "flow",
            nodes: ["Write to normalized source of truth", "Change event / CDC (WAL)", "Consumer", "Denormalized read model", "Fast reads"],
            caption: "A common architecture: normalized writes, asynchronously maintained denormalized reads (eventually consistent).",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Example: a blog's post list",
        blocks: [
          {
            type: "code",
            lang: "sql",
            caption: "Normalized read: join + aggregate on every page view",
            code: `SELECT p.id, p.title, u.name AS author, COUNT(c.id) AS comments
FROM posts p
JOIN users u ON u.id = p.author_id
LEFT JOIN comments c ON c.post_id = p.id
GROUP BY p.id, u.name
ORDER BY p.created_at DESC
LIMIT 20;`,
          },
          {
            type: "code",
            lang: "sql",
            caption: "Denormalized: counter maintained on write, single-table read",
            code: `-- write path (same transaction)
INSERT INTO comments (post_id, user_id, body) VALUES (7, 42, 'Nice');
UPDATE posts SET comment_count = comment_count + 1 WHERE id = 7;

-- read path
SELECT id, title, author_name, comment_count
FROM posts ORDER BY created_at DESC LIMIT 20;`,
          },
          {
            type: "p",
            text: "Trade-off: the read became a single index scan, but every comment now also updates the post row — a contention point for viral posts. For very hot counters, buffer increments (e.g. in Redis) and flush periodically, accepting slightly stale counts.",
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Drift:** async-maintained copies can diverge after bugs or lost events; schedule reconciliation jobs that recompute from the source of truth.",
              "**Hot rows:** counters on popular entities serialise writes; use sharded counters or batching.",
              "**Fan-out cost:** changing a user's display name may mean updating millions of rows; consider storing only IDs and resolving names from a cache.",
              "**Historical snapshots are not bugs:** an order's price-at-purchase *should* differ from today's price.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Normalize when", points: ["Write-heavy or frequently changing data", "Strong integrity requirements", "Varied, evolving queries", "Data size makes duplication expensive"] },
              { title: "Denormalize when", points: ["Read-heavy hot paths with strict latency", "Joins are impossible (across shards / in NoSQL)", "Aggregations are expensive to compute per read", "Staleness is acceptable or can be bounded"] },
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
              "**Monitor:** consumer lag for projections, reconciliation diff counts, materialized-view refresh duration.",
              "**Failure mode:** a projection consumer falls behind → users see stale feeds/search. Alert on lag; make consumers idempotent for replays.",
              "**Rebuildability:** keep the source of truth normalized and the event log/CDC stream replayable so read models can be rebuilt from scratch.",
              "**Cost:** duplicated data multiplies storage and write I/O; justify it with read savings.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Normalization stores each fact once — up to roughly third normal form — so updates touch one place and integrity is enforced, at the cost of joins on reads. Denormalization duplicates or precomputes data, like counters, embedded fields or read models, so hot reads are a single lookup, at the cost of more write work and possible inconsistency. I keep the source of truth normalized and build denormalized views for hot read paths, maintained transactionally if they must be exact or asynchronously via events or CDC if slight staleness is fine.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "This is the CQRS idea in miniature: separate write model (normalized) and read models (denormalized).",
              "Choose sync (same transaction) vs async (events/CDC) maintenance based on whether readers can tolerate staleness.",
              "Prefer derived data that can be recomputed — reconciliation is your safety net.",
              "In NoSQL, denormalization is the default modelling technique, not an optimisation.",
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
              "Normalize: one fact, one place; prevents anomalies.",
              "Denormalize: pay at write time to make reads cheap.",
              "Source of truth normalized, read models denormalized.",
              "Have a plan to sync and reconcile duplicates.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Normal form", definition: "A rule set (1NF, 2NF, 3NF…) that eliminates classes of redundancy in a relational schema." },
      { term: "Functional dependency", definition: "Column B depends on column A if A's value determines B's value." },
      { term: "Materialized view", definition: "A query result stored as a table and refreshed periodically or incrementally." },
      { term: "Read model / projection", definition: "A denormalized view built from the source of truth for a specific query." },
      { term: "CDC", definition: "Change data capture: streaming row-level changes from a database's log to other systems." },
    ],
    followUps: [
      { q: "How do you keep a denormalized author_name in sync?", a: "Either update all copies in the same transaction (only if few), or emit a 'user renamed' event and have a consumer update copies asynchronously; or don't duplicate it — store author_id and resolve names from a cache." },
      { q: "Is a cache a form of denormalization?", a: "Yes, conceptually: a cache is a derived copy optimised for reads, with the same staleness and invalidation challenges." },
      { q: "When would you use a materialized view instead of a cache?", a: "For expensive aggregations queried with SQL that tolerate refresh-interval staleness, especially for reporting; it stays inside the database with its own indexes." },
      { q: "How would you implement a like counter for viral posts?", a: "Record likes in a table for correctness, increment a counter in Redis (or sharded counter rows) and flush aggregated deltas periodically; reconcile occasionally from the likes table." },
    ],
    quiz: [
      {
        id: "nd-q1",
        prompt: "orders(id, customer_id, customer_email) violates which normal form?",
        options: ["1NF", "3NF — customer_email depends on customer_id, a non-key column", "It is fully normalized", "2NF only for single-column keys"],
        answer: 1,
        explanation: "A transitive dependency (id → customer_id → customer_email) violates 3NF.",
      },
      {
        id: "nd-q2",
        prompt: "Which denormalized field should intentionally NOT be updated when the source changes?",
        options: ["A post's author_name", "order_items.price_at_purchase", "A cached like_count", "A search index document"],
        answer: 1,
        explanation: "It records a historical fact; changing it would rewrite history.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── 9. caching-strategies
  {
    slug: "caching-strategies",
    track: "system-design",
    title: "Caching strategies",
    summary:
      "Cache-aside, read-through, write-through, write-back and write-around; eviction policies (LRU, LFU, TTL); where to cache; and how to survive stampedes on hot keys.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 35,
    kinds: ["theory", "visualization", "system-design"],
    status: "authored",
    prerequisites: ["system-design/latency-throughput"],
    related: [
      "system-design/cache-invalidation",
      "system-design/cdn-edge-caching",
      "system-design/normalization-denormalization",
      "backend/redis",
      "networks/http-caching",
      "javascript/memoization",
    ],
    tags: ["caching", "cache-aside", "write-through", "write-back", "lru", "lfu", "ttl", "stampede", "redis"],
    sources: [
      CHECKLIST,
      AWS_CACHING,
      { label: "Scaling Memcache at Facebook (NSDI 2013)", url: "https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final170_0.pdf", kind: "external" },
      { label: "Redis docs — Key eviction", url: "https://redis.io/docs/latest/develop/reference/eviction/", kind: "docs" },
      { label: "Optimal Probabilistic Cache Stampede Prevention (Vattani et al., VLDB 2015)", url: "https://www.vldb.org/pvldb/vol8/p886-vattani.pdf", kind: "external" },
      { label: "AWS — Database caching strategies using Redis (whitepaper)", url: "https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/caching-patterns.html", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Describe the five classic read/write caching patterns and their consistency properties.",
              "Choose eviction (LRU, LFU, TTL) and size a cache from the working set.",
              "Explain cache stampedes and three ways to prevent them.",
              "Know where caches live: client, CDN, reverse proxy, application, distributed cache, database buffer pool.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A cache is the notepad on your desk next to the filing cabinet in the basement. Looking at the notepad is instant; walking to the basement is slow. The hard questions are what to write on the notepad, when to cross things out, and what happens when the notepad and the cabinet disagree.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Pattern", "Read path", "Write path", "Consistency", "Typical use"],
            rows: [
              ["Cache-aside (lazy loading)", "App checks cache; on miss reads DB and fills cache", "App writes DB, then deletes (or updates) the cache key", "Stale until TTL/invalidation; race windows exist", "The default for Redis/Memcached in front of a DB"],
              ["Read-through", "App asks the cache; the cache loads from DB on miss", "(paired with one of the write patterns)", "Same as cache-aside, logic centralised in the cache layer", "Caching libraries/providers, DAX for DynamoDB"],
              ["Write-through", "Reads from cache", "Write goes to cache, which synchronously writes DB", "Cache and DB updated together; higher write latency", "Read-after-write-heavy data"],
              ["Write-back (write-behind)", "Reads from cache", "Write to cache; DB updated asynchronously in batches", "Fast writes; data loss risk if cache fails before flush", "Counters, metrics, CPU caches, high write rates"],
              ["Write-around", "Cache-aside style", "Write straight to DB, skip the cache", "Avoids polluting cache with write-once data", "Logs, bulk imports, rarely re-read data"],
            ],
          },
          {
            type: "table",
            head: ["Eviction", "Evicts", "Good for", "Weakness"],
            rows: [
              ["LRU", "Least recently used", "Recency-driven workloads", "A one-off scan flushes the hot set"],
              ["LFU", "Least frequently used (often with decay)", "Stable popularity (top products)", "Slow to adapt to shifting popularity without decay"],
              ["TTL", "Entries older than a time limit", "Bounding staleness", "Not a capacity policy on its own"],
              ["FIFO / random", "Oldest / random", "Simplicity", "Ignores access patterns"],
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "Redis implements *approximated* LRU and LFU by sampling a few keys rather than keeping an exact ordering; the policy is set with `maxmemory-policy` (e.g. `allkeys-lru`, `allkeys-lfu`, `volatile-ttl`). The default is `noeviction`, which makes writes fail when memory is full — a common surprise for caches.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "Latency: memory reads (~sub-ms over the network) instead of disk/queries (ms to tens of ms).",
              "Throughput and cost: a 95% hit ratio means the database sees only 5% of reads.",
              "Resilience: caches can absorb spikes — but this creates a dependency: if the cache dies, the DB may not survive the full load.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "Mechanics of cache-aside",
        blocks: [
          {
            type: "viz",
            id: "sys-cache",
            caption: "Cache-aside: hits served from the cache, misses read the DB and populate the cache with a TTL; writes invalidate.",
          },
          {
            type: "code",
            lang: "ts",
            caption: "Cache-aside read and write (TypeScript-flavoured pseudocode)",
            code: `async function getUser(id: string): Promise<User> {
  const key = "user:" + id;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);            // hit

  const user = await db.users.findById(id);         // miss
  const ttl = 300 + Math.floor(Math.random() * 60); // TTL + jitter
  await redis.set(key, JSON.stringify(user), "EX", ttl);
  return user;
}

async function updateUser(id: string, patch: Partial<User>) {
  await db.users.update(id, patch);   // 1. source of truth first
  await redis.del("user:" + id);      // 2. invalidate (delete, don't set)
}`,
          },
          {
            type: "steps",
            steps: [
              { title: "Hit ratio", detail: "hits ÷ (hits + misses). Effective latency ≈ hit% × cache latency + miss% × (cache + DB latency)." },
              { title: "TTL with jitter", detail: "Random spread prevents many keys created together from expiring together." },
              { title: "Delete on write", detail: "Deleting is idempotent and avoids writing a value computed from a stale read; the next reader repopulates." },
              { title: "Negative caching", detail: "Cache 'not found' briefly so repeated lookups for missing keys don't hammer the DB." },
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Cache stampede (thundering herd) on a hot key",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Setup", detail: "The homepage config key is read 20,000 times per second, cached with a 60 s TTL. Rebuilding it takes a 200 ms query." },
              { title: "Expiry", detail: "At T=60 s the key expires. In the next 200 ms, ~4,000 requests miss and all run the expensive query." },
              { title: "Collapse", detail: "The DB saturates, the query slows to seconds, more requests miss, timeouts trigger retries — a feedback loop." },
            ],
          },
          {
            type: "table",
            head: ["Defence", "How it works", "Trade-off"],
            rows: [
              ["Request coalescing / single-flight", "Only one request per key per process (or a distributed lock) recomputes; others wait for its result", "Waiters add latency; lock needs a timeout"],
              ["Stale-while-revalidate", "Serve the expired value while one background refresh runs", "Briefly stale data"],
              ["Probabilistic early refresh (XFetch)", "Each reader may refresh early with probability rising as expiry nears", "Some extra recomputation"],
              ["Leases (Facebook memcache)", "The cache hands one client a lease token to fill a missing key; others back off briefly", "Needs cache support"],
              ["No expiry for hot keys + explicit refresh", "A job refreshes the key periodically", "Requires knowing hot keys"],
            ],
          },
        ],
      },
      {
        id: "examples",
        title: "Where caches live",
        blocks: [
          {
            type: "table",
            head: ["Layer", "Example", "Notes"],
            rows: [
              ["Browser / client", "HTTP Cache-Control, service worker", "Free; hard to invalidate"],
              ["CDN / edge", "CloudFront, Cloudflare", "Static and cacheable API responses near users"],
              ["Reverse proxy", "Varnish, NGINX proxy_cache", "Whole responses in front of the app"],
              ["In-process", "LRU map, Caffeine (JVM)", "Fastest; each instance has its own copy, so invalidation is per instance"],
              ["Distributed", "Redis, Memcached", "Shared across instances; network hop ~0.2–1 ms"],
              ["Database", "Buffer pool / shared_buffers, OS page cache", "Automatic; size it to the working set"],
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Cold cache after restart/deploy:** hit ratio drops to 0 and the DB takes full load; warm caches gradually or shift traffic slowly.",
              "**Hot keys:** a single key can exceed one cache node's capacity; replicate it, add a small in-process L1 cache, or split the key.",
              "**Large values:** multi-MB values block single-threaded Redis and waste bandwidth; compress or split.",
              "**Cache penetration:** requests for non-existent keys always miss; use negative caching or a Bloom filter.",
              "**Write-back data loss:** a cache node failure before flush loses acknowledged writes unless the cache is replicated and persisted.",
              "**Caching personalised or authorised data** under a shared key leaks data between users — include the user/tenant in the key.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Cache when", points: ["Read-heavy, repeated access to the same data", "Expensive to compute or fetch", "Some staleness is acceptable", "Working set fits in memory"] },
              { title: "Don't (or be careful) when", points: ["Data must be exactly current (balances, inventory decrements)", "Access is uniformly random with low reuse", "Writes dominate", "The cache becomes a hidden hard dependency the DB can't survive without"] },
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
              "**Monitor:** hit ratio per key prefix, evictions/s, memory usage, p99 latency, connection count, hot keys (`redis-cli --hotkeys` with LFU), DB load when the cache is degraded.",
              "**Capacity plan for cache failure:** can the DB survive the miss traffic if a cache node fails? If not, use replicas and consistent hashing so only a fraction of keys miss.",
              "**Cost:** RAM is expensive; size from the hit-ratio curve, not the whole dataset.",
              "**Timeouts:** treat the cache as optional — short timeouts and fall back to the DB (with load shedding) instead of failing requests.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "My default is cache-aside: read from Redis, on a miss read the database and populate with a TTL plus jitter; on writes update the database and delete the key. Write-through keeps the cache updated synchronously at the cost of write latency, write-back buffers writes in the cache for speed at the risk of losing them, and write-around skips the cache for data that won't be re-read. I choose LRU or LFU eviction based on access patterns, size the cache to the working set, and protect hot keys from stampedes with request coalescing or stale-while-revalidate.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Effective latency and DB load are functions of hit ratio — quantify both.",
              "Consistency: cache-aside has a race between a slow reader and a writer; mitigate with TTLs, leases or versioned writes (see cache invalidation).",
              "Failure: a cache outage converts into DB overload; plan with replicas, consistent hashing, L1 caches and load shedding.",
              "Multi-level caching (in-process L1 + Redis L2 + CDN) multiplies hit ratio but multiplies invalidation paths.",
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
              "Cache-aside is the default; read-through/write-through/write-back/write-around trade consistency, latency and durability.",
              "LRU for recency, LFU for stable popularity, TTL to bound staleness.",
              "Stampedes: coalesce, serve stale, refresh early.",
              "Cache failure must not take down the database.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Hit ratio", definition: "Fraction of lookups served by the cache." },
      { term: "TTL", definition: "Time-to-live: how long an entry may be served before it expires." },
      { term: "Cache stampede", definition: "Many concurrent misses on the same key causing a burst of expensive recomputations." },
      { term: "Single-flight", definition: "Collapsing concurrent requests for the same key into one backend call." },
      { term: "Negative caching", definition: "Caching the fact that a value doesn't exist." },
      { term: "Write-back", definition: "Writes are acknowledged once in cache and persisted later." },
    ],
    followUps: [
      { q: "Why delete the cache key on update instead of setting the new value?", a: "Setting can race: two writers may set values in a different order than they committed to the DB, leaving the older value cached indefinitely. Deleting is idempotent; the next read loads the current value (a smaller race remains, bounded by TTL)." },
      { q: "Your Redis cluster loses a node. What happens to the database?", a: "Keys on that node miss; with consistent hashing that's ~1/N of keys. The DB must absorb that extra miss traffic; if it can't, use replicas with automatic failover, in-process L1 caches and load shedding." },
      { q: "LRU or LFU for a product catalogue?", a: "LFU (with decay) usually fits stable popularity better and resists one-off scans; LRU suits recency-driven data like recently viewed sessions." },
      { q: "How do you size the cache?", a: "Estimate the working set (hot fraction × object size), then measure the hit ratio vs memory curve and stop where extra memory gives diminishing returns." },
      { q: "When would you choose write-back?", a: "For high-rate, loss-tolerant or reconstructable writes like view counters or metrics where batching saves enormous DB load — never for payments." },
    ],
    quiz: [
      {
        id: "cs-q1",
        prompt: "Which pattern gives the fastest writes but risks losing acknowledged data if the cache fails?",
        options: ["Cache-aside", "Write-through", "Write-back", "Write-around"],
        answer: 2,
        explanation: "Write-back acknowledges after updating the cache and persists later, so unflushed writes can be lost.",
      },
      {
        id: "cs-q2",
        prompt: "A hot key expires and the DB is flooded with identical queries. Which fix targets this directly?",
        options: ["Increase the DB connection pool", "Request coalescing / stale-while-revalidate for that key", "Switch from LRU to FIFO", "Shorten the TTL"],
        answer: 1,
        explanation: "Coalescing lets one request rebuild the value while others wait or receive the stale value.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── 10. cache-invalidation
  {
    slug: "cache-invalidation",
    track: "system-design",
    title: "Cache invalidation",
    summary:
      "Why keeping caches consistent with the source of truth is hard: TTL vs explicit invalidation, the classic read/write race, versioned keys, CDC-driven invalidation, leases, and multi-layer invalidation.",
    level: "advanced",
    frequency: "high",
    minutes: 30,
    kinds: ["theory", "visualization", "system-design"],
    status: "authored",
    prerequisites: ["system-design/caching-strategies"],
    related: [
      "system-design/cdn-edge-caching",
      "system-design/consistency-models",
      "system-design/replication",
      "backend/redis",
      "networks/http-caching",
    ],
    tags: ["cache-invalidation", "ttl", "race-condition", "versioning", "cdc", "leases", "consistency"],
    sources: [
      CHECKLIST,
      AWS_CACHING,
      { label: "Scaling Memcache at Facebook (NSDI 2013) — leases and invalidation via McSqueal", url: "https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final170_0.pdf", kind: "external" },
      { label: "Debezium — Change Data Capture documentation", url: "https://debezium.io/documentation/reference/stable/index.html", kind: "docs" },
      { label: "RFC 9111 — HTTP Caching", url: "https://www.rfc-editor.org/rfc/rfc9111", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Compare TTL expiry, explicit invalidation and versioned keys.",
              "Walk through the cache-aside stale-set race and its mitigations.",
              "Design invalidation that survives failures (lost deletes, replication lag, multiple cache layers).",
              "Decide how much staleness each data type can tolerate.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Copies of a fact spread like printed flyers. Changing the event time is easy; recalling every flyer is hard. You can print 'valid until Friday' on each one (TTL), chase down every copy (explicit invalidation), or print a new flyer with a new version number that people look up (versioned keys).",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Approach", "How", "Staleness bound", "Complexity"],
            rows: [
              ["TTL only", "Entries expire after N seconds", "≤ TTL", "Lowest"],
              ["Explicit delete on write", "Writer deletes affected keys after committing", "Small window (races, lost deletes)", "Medium: must know every affected key"],
              ["Write-through update", "Writer updates cache with new value", "Small, but ordering races between writers", "Medium"],
              ["Versioned / generation keys", "Key includes a version (user:42:v17); bump the version on write", "None for readers that see the new version", "Medium; old versions expire via TTL"],
              ["CDC / event-driven", "A consumer tails the DB log and invalidates", "Lag of the pipeline; reliable and ordered", "Higher: extra infrastructure"],
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
              "Stale data causes visible bugs: a changed price not shown, a revoked permission still honoured, a deleted post reappearing.",
              "Invalidation spans process boundaries and networks, so it can fail partially — the cache gets out of sync silently.",
              "A defensible design states the staleness bound per data type, not 'the cache is always correct'.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "The classic race",
        blocks: [
          {
            type: "viz",
            id: "sys-cache",
            caption: "Cache-aside with TTL and invalidation on write — the race below happens between these arrows.",
          },
          {
            type: "steps",
            steps: [
              { title: "t1 — Reader A misses", detail: "Key `user:42` is not cached; A reads the DB and gets version v1." },
              { title: "t2 — Writer B updates", detail: "B writes v2 to the DB and deletes `user:42` from the cache (nothing to delete)." },
              { title: "t3 — Reader A sets", detail: "A, delayed by a GC pause or slow network, now writes v1 into the cache." },
              { title: "Result", detail: "The cache holds stale v1 until TTL expiry. No error was raised anywhere." },
            ],
          },
          {
            type: "table",
            head: ["Mitigation", "Idea"],
            rows: [
              ["Always set a TTL", "Bounds the damage of every race and every lost delete"],
              ["Leases", "On a miss the cache issues a token; a delete invalidates outstanding tokens, so A's late set is rejected (Facebook's memcache)"],
              ["Versioned compare-and-set", "Store the row version with the value; only set if newer than what's cached (Lua script or CAS)"],
              ["Delayed second delete", "Delete again ~a few hundred ms after the write to catch in-flight stale sets — a heuristic, not a guarantee"],
              ["Invalidate from the DB log (CDC)", "The invalidation follows commit order and retries until delivered"],
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Production design: product prices",
        blocks: [
          {
            type: "flow",
            nodes: ["Admin updates price", "Postgres commit", "WAL → Debezium → Kafka", "Invalidator service", "DEL product:123 in Redis", "Purge CDN surrogate key product-123"],
            caption: "CDC-driven invalidation: reliable, ordered, decoupled from the writer's code paths.",
          },
          {
            type: "list",
            items: [
              "Redis entries also have a 10-minute TTL as a safety net.",
              "Checkout never trusts cached prices: it re-reads the price from the DB inside the order transaction (the cache is for browsing only).",
              "CDN responses use `s-maxage=60, stale-while-revalidate=30` plus tag-based purges.",
              "The invalidator is idempotent; replaying Kafka from an offset just re-deletes keys.",
            ],
          },
        ],
      },
      {
        id: "examples",
        title: "Choosing a strategy per data type",
        blocks: [
          {
            type: "table",
            head: ["Data", "Tolerable staleness", "Strategy"],
            rows: [
              ["Static assets (JS/CSS)", "Forever (content-hashed names)", "Versioned URLs, `immutable`, no invalidation needed"],
              ["Product descriptions", "Minutes", "TTL + CDC invalidation"],
              ["User profile shown to self", "None after own edit", "Delete on write + read-your-writes (bypass cache briefly for that user)"],
              ["Permissions / auth revocation", "Seconds at most", "Short TTL + push invalidation; check critical actions at source"],
              ["Like counts", "Seconds to minutes", "TTL only"],
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Lost invalidations:** the writer crashes after the DB commit but before the delete. Use TTLs, outbox/CDC, or retries.",
              "**Replica lag:** you invalidate, a reader misses and fills the cache from a *lagging replica* with old data. Fill from the primary for recently written keys, or delay invalidation by the replica lag.",
              "**Derived keys:** one row change affects many cached views (lists, aggregates, search results). Track dependencies with tags or use short TTLs for aggregates.",
              "**Multiple layers:** in-process L1 caches on 200 instances need a broadcast (pub/sub) to invalidate — or very short TTLs.",
              "**Multi-region:** invalidations must reach every region's cache; cross-region lag widens the stale window.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "TTL only", points: ["Simplest, self-healing", "Staleness up to TTL for everyone", "Short TTLs reduce hit ratio"] },
              { title: "Explicit / event-driven invalidation", points: ["Fresh data quickly", "More moving parts and failure modes", "Still needs a TTL as a backstop"] },
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
              "**Monitor:** invalidation pipeline lag, failed invalidations, stale-read sampling (compare a sample of cache values with the DB), hit ratio after changes.",
              "**Failure mode:** an invalidation bug silently serves stale data for hours; the TTL is what limits the incident.",
              "**Failure mode:** mass invalidation (e.g. purge everything after a deploy) → cold cache → DB overload. Purge selectively, warm up gradually.",
              "**Operational lever:** a feature flag to bypass the cache for a key prefix during incidents.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "I always put a TTL on cache entries as a safety net, then add explicit invalidation where staleness matters: after committing to the database, delete the key. That has a race — a slow reader can write an old value after the delete — so for important data I use versioned keys or compare-and-set on a version, or leases, and I drive invalidation from the database's change stream so it's ordered and retried. Critical decisions like checkout prices or permissions are re-validated against the source of truth.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "State the staleness bound per data type, and make the TTL enforce it.",
              "Explain the stale-set race precisely; mention leases (Facebook) and version checks as fixes.",
              "Watch for replica-lag refills and multi-layer/multi-region invalidation fan-out.",
              "Prefer immutable, versioned data where possible — immutable things never need invalidation.",
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
              "TTL always; explicit invalidation where it matters; versioning to avoid invalidation entirely.",
              "Delete-after-commit has a race — leases, CAS on versions, CDC reduce it.",
              "Lost deletes, replica lag and multiple layers are the real-world hazards.",
              "Re-validate critical decisions at the source of truth.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Invalidation", definition: "Removing or marking a cache entry as stale after the source changes." },
      { term: "Lease", definition: "A token granted on a cache miss that authorises one client to fill the key; invalidations revoke it." },
      { term: "Versioned key", definition: "A cache key that embeds a version, so updates create new keys rather than overwrite old ones." },
      { term: "Surrogate key / cache tag", definition: "A label attached to CDN cache entries so all entries with that tag can be purged together." },
      { term: "Outbox pattern", definition: "Writing an event to a table in the same transaction as the data change, later relayed to a broker." },
    ],
    followUps: [
      { q: "Delete-then-write or write-then-delete?", a: "Write the DB first, then delete the cache. Deleting first lets a reader repopulate the old value before your write commits, which is a wider window." },
      { q: "How do you invalidate in-process caches on 300 instances?", a: "Broadcast invalidation messages via pub/sub (Redis pub/sub, Kafka), keep TTLs short as a backstop, or avoid L1 caching for data that changes often." },
      { q: "How does CDC-based invalidation help?", a: "It derives invalidations from the committed log, so every committed change produces an invalidation in commit order, retried until processed, independent of which code path wrote the data." },
      { q: "Why might a cache be filled with stale data right after an invalidation?", a: "The miss was served by a lagging read replica. Read from the primary for recently changed keys or delay re-population." },
    ],
    quiz: [
      {
        id: "ci-q1",
        prompt: "Which mechanism bounds the impact of every missed invalidation?",
        options: ["LRU eviction", "A TTL on every entry", "A larger cache", "Write-around"],
        answer: 1,
        explanation: "TTLs guarantee that any stale entry eventually expires regardless of bugs or lost deletes.",
      },
      {
        id: "ci-q2",
        prompt: "In the stale-set race, what does Facebook's lease mechanism prevent?",
        options: ["A reader that loaded an old value setting it after a newer write's invalidation", "Cache node failures", "Eviction of hot keys", "Network partitions"],
        answer: 0,
        explanation: "The delete invalidates the lease, so the late set from the reader holding an old value is rejected.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── 11. load-balancing-algorithms
  {
    slug: "load-balancing-algorithms",
    track: "system-design",
    title: "Load balancing algorithms",
    summary:
      "Round robin, weighted, least connections, least response time, IP hash, consistent hashing and power of two choices — how each picks a backend, when it fails, and how L4 and L7 balancers differ.",
    level: "intermediate",
    frequency: "high",
    minutes: 30,
    kinds: ["theory", "visualization", "system-design"],
    status: "authored",
    prerequisites: ["system-design/dns-tcp-lb-firewalls", "system-design/vertical-vs-horizontal-scaling"],
    related: [
      "system-design/sharding-partitioning",
      "system-design/health-checks-heartbeats",
      "system-design/service-discovery",
      "system-design/caching-strategies",
      "networks/tcp",
    ],
    tags: ["load-balancing", "round-robin", "least-connections", "consistent-hashing", "p2c", "l4", "l7"],
    sources: [
      CHECKLIST,
      { label: "Envoy docs — Supported load balancers", url: "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers", kind: "docs" },
      { label: "NGINX docs — HTTP load balancing", url: "https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/", kind: "docs" },
      { label: "Maglev: A Fast and Reliable Software Network Load Balancer (Google, NSDI 2016)", url: "https://research.google/pubs/maglev-a-fast-and-reliable-software-network-load-balancer/", kind: "external" },
      { label: "Mitzenmacher — The Power of Two Choices in Randomized Load Balancing", url: "https://www.eecs.harvard.edu/~michaelm/postscripts/mythesis.pdf", kind: "external" },
      { label: "Google SRE Book — Load Balancing in the Datacenter", url: "https://sre.google/sre-book/load-balancing-datacenter/", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain how each common algorithm chooses a backend and what state it needs.",
              "Pick an algorithm for uniform vs variable request costs and for stateful backends (caches, sessions).",
              "Explain consistent hashing and power of two choices.",
              "Contrast L4 and L7 balancing and client-side vs proxy balancing.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Supermarket checkouts. Round robin sends each shopper to the next till in turn — fine if all baskets are the same size. Least connections sends you to the shortest queue. Hashing always sends you to the same till — useful if that cashier already knows you (a warm cache). Power of two choices: glance at two random tills and pick the shorter — almost as good as checking every till, far cheaper.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Algorithm", "Rule", "State needed", "Best for"],
            rows: [
              ["Round robin", "Next backend in rotation", "A counter", "Homogeneous backends, uniform requests"],
              ["Weighted round robin", "Rotation proportional to weights", "Weights", "Mixed instance sizes, canaries (5% weight)"],
              ["Least connections", "Backend with fewest active connections/requests", "Live counts", "Variable request durations, long-lived connections"],
              ["Least response time", "Lowest recent latency (often combined with fewest active)", "Latency stats", "Heterogeneous or noisy backends"],
              ["IP hash", "hash(client IP) mod N", "None", "Simple stickiness without cookies"],
              ["Consistent hashing (ring, Maglev, rendezvous)", "hash(key) → position on a ring; nearest node", "Ring/table", "Cache affinity; minimal remapping when nodes change"],
              ["Power of two choices (P2C)", "Pick 2 random backends, choose the less loaded", "Per-backend load estimate", "Large fleets, distributed balancers with stale info"],
              ["Random", "Uniform random", "None", "Baseline; good with many clients"],
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
              "The algorithm decides tail latency: a backend that's slow but still accepting work can drag p99 down for everyone under round robin.",
              "Stateful backends (caches, WebSocket hubs) need affinity, which plain round robin destroys.",
              "Scale events and failures remap traffic; the algorithm determines how many caches go cold.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "How the interesting ones work",
        blocks: [
          {
            type: "viz",
            id: "sys-load-balancer",
            caption: "Round robin vs least connections vs hashing on the same request stream.",
          },
          {
            type: "steps",
            steps: [
              { title: "Modulo hashing's problem", detail: "With hash(key) mod N, changing N from 4 to 5 remaps ~80% of keys — every cache misses at once." },
              { title: "Consistent hashing", detail: "Hash both nodes and keys onto a ring (0 … 2³²−1). A key belongs to the first node clockwise. Adding a node only takes keys from its neighbour: ~1/N of keys move. Virtual nodes (many points per server) smooth the distribution and allow weights." },
              { title: "Maglev / rendezvous hashing", detail: "Maglev builds a lookup table giving near-perfect balance with minimal disruption; rendezvous (highest-random-weight) scores every node per key and picks the max. Both serve the same goal as the ring." },
              { title: "Power of two choices", detail: "Choosing the less-loaded of two random backends reduces maximum load dramatically compared with random choice, and avoids the herd behaviour of 'everyone picks the global least-loaded' when load information is stale." },
              { title: "Health and outlier handling", detail: "Active health checks remove dead backends; passive outlier detection ejects backends returning errors; slow-start ramps new instances gradually." },
            ],
          },
          {
            type: "compare",
            items: [
              { title: "L4 (transport)", points: ["Balances TCP connections/UDP flows by 5-tuple", "No visibility into requests", "Very high throughput (often in-kernel/DSR/ECMP)", "One long-lived connection = one backend"] },
              { title: "L7 (application)", points: ["Balances individual HTTP/gRPC requests", "Routes by path, header, cookie", "Retries, timeouts, outlier detection", "Costs CPU; terminates TLS"] },
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Example: why round robin hurts a mixed workload",
        blocks: [
          {
            type: "p",
            text: "Four backends; 90% of requests take 10 ms and 10% take 2 s (report exports). Round robin gives each backend the same *number* of requests, but a backend that happens to get several exports is busy for seconds while fast requests queue behind them. Least-connections (or P2C on in-flight requests) sees the backend's high in-flight count and routes new requests elsewhere — p99 for the fast requests improves sharply. Better still: move exports to an async job queue.",
          },
          {
            type: "code",
            lang: "text",
            caption: "Conceptual NGINX upstream with least connections and weights",
            code: `upstream api {
  least_conn;
  server 10.0.1.10:8080 weight=2;   # bigger instance
  server 10.0.1.11:8080;
  server 10.0.1.12:8080 max_fails=3 fail_timeout=10s;
}`,
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Least connections + broken backend:** a backend that fails fast has few active connections, so it attracts *more* traffic. Combine with outlier ejection.",
              "**IP hash behind NAT:** thousands of users behind one corporate IP all land on one backend.",
              "**Hot keys under consistent hashing:** one popular key still overloads its node; use replication of hot keys or bounded-load consistent hashing.",
              "**Many LB instances, local views:** each LB only sees its own connections; P2C or random handles this better than strict least-connections.",
              "**Long-lived connections:** after a scale-out, new backends get no traffic until clients reconnect; set max connection age or balance per request at L7.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Need", "Choose"],
            rows: [
              ["Simple, uniform stateless requests", "Round robin / random"],
              ["Heterogeneous instance sizes or canary rollout", "Weighted"],
              ["Variable request cost, streaming", "Least connections / least request / P2C"],
              ["Cache or session affinity with minimal reshuffle", "Consistent hashing (ring, Maglev, rendezvous)"],
              ["Very large fleets, many balancers", "P2C"],
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
              "**Monitor:** requests and in-flight per backend (imbalance), per-backend latency and error rate, ejections, healthy host count, LB-generated 5xx.",
              "**Client-side balancing** (gRPC, service meshes like Envoy) removes a hop and balances per request, but every client needs service discovery and health info.",
              "**Failure mode:** health checks too sensitive → flapping; too lenient → traffic to broken hosts.",
              "**Failure mode:** retries at multiple layers (client, LB, service) multiply load during incidents — keep a retry budget.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Round robin and weighted round robin work for uniform stateless traffic. When request cost varies I use least connections or power of two choices, which picks the less loaded of two random backends and works well with many balancers. When backends hold state, like a cache shard, I use consistent hashing so adding or removing a node remaps only about 1/N of keys. An L4 balancer distributes connections; an L7 balancer distributes individual HTTP or gRPC requests and adds routing, retries and outlier detection.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Explain why mod-N hashing remaps most keys while consistent hashing remaps ~1/N, and why virtual nodes are needed.",
              "P2C: near-optimal balance with O(1) work and robustness to stale load information.",
              "Combine algorithms with health checks, outlier ejection, slow start and connection draining.",
              "gRPC/HTTP/2 multiplexing needs request-level (L7 or client-side) balancing.",
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
              "RR/weighted for uniform work; least-conn/P2C for variable work; consistent hashing for affinity.",
              "Consistent hashing moves ~1/N keys on membership change.",
              "L4 = connections, L7 = requests.",
              "Algorithms need health checks and outlier detection to be safe.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Virtual node", definition: "One of many ring positions assigned to a single physical server in consistent hashing." },
      { term: "Outlier detection", definition: "Ejecting a backend from the pool after it returns too many errors or is too slow." },
      { term: "Slow start", definition: "Gradually increasing traffic to a newly added backend." },
      { term: "Session affinity", definition: "Routing a client consistently to the same backend." },
      { term: "DSR", definition: "Direct server return: responses bypass the load balancer and go straight to the client." },
    ],
    followUps: [
      { q: "How many keys move when you add a 5th cache node with consistent hashing vs modulo?", a: "Consistent hashing: about 1/5 of keys (those now owned by the new node). Modulo: roughly 4/5 of keys change owner." },
      { q: "Why does least connections fail with a backend that errors instantly?", a: "Errors complete quickly, so that backend always shows few active connections and attracts even more traffic — a black hole. Outlier detection fixes it." },
      { q: "Why is P2C better than 'always pick the least loaded' across many balancers?", a: "With stale or local load data, every balancer picks the same apparently least-loaded backend and overwhelms it (herding). Random sampling of two spreads choices while still avoiding the worst backends." },
      { q: "Where would you put load balancing for internal microservice calls?", a: "Either a central L7 proxy, or client-side/sidecar balancing via a service mesh (Envoy) that uses service discovery — removing a network hop and enabling per-request balancing and retries." },
    ],
    quiz: [
      {
        id: "lb-q1",
        prompt: "Which algorithm best preserves cache locality when cache nodes are added or removed?",
        options: ["Round robin", "Least connections", "Consistent hashing", "Random"],
        answer: 2,
        explanation: "Consistent hashing maps keys stably and moves only ~1/N of keys on membership changes.",
      },
      {
        id: "lb-q2",
        prompt: "A gRPC client opens one HTTP/2 connection through an L4 load balancer. What happens?",
        options: ["Requests are spread evenly across all backends", "All of that client's requests go to one backend", "The L4 LB parses each gRPC call", "The connection fails"],
        answer: 1,
        explanation: "L4 balances connections; all multiplexed requests on that connection reach the same backend.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── 12. cdn-edge-caching
  {
    slug: "cdn-edge-caching",
    track: "system-design",
    title: "CDN and edge caching",
    summary:
      "How content delivery networks cut latency and origin load: points of presence, anycast, cache keys, Cache-Control directives, origin shielding, purging and what can (and can't) be cached at the edge.",
    level: "intermediate",
    frequency: "high",
    minutes: 25,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["system-design/caching-strategies", "system-design/dns-tcp-lb-firewalls"],
    related: [
      "system-design/cache-invalidation",
      "networks/http-caching",
      "cloud/cdn-cloudfront",
      "system-design/capacity-estimation",
      "system-design/rate-limiting",
    ],
    tags: ["cdn", "edge", "cache-control", "anycast", "origin-shield", "purge", "stale-while-revalidate"],
    sources: [
      CHECKLIST,
      { label: "Cloudflare docs — Cache", url: "https://developers.cloudflare.com/cache/", kind: "docs" },
      { label: "MDN — Cache-Control", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control", kind: "docs" },
      { label: "RFC 9111 — HTTP Caching", url: "https://www.rfc-editor.org/rfc/rfc9111", kind: "docs" },
      { label: "Amazon CloudFront Developer Guide — Origin Shield", url: "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/origin-shield.html", kind: "docs" },
      { label: "RFC 5861 — stale-while-revalidate and stale-if-error", url: "https://www.rfc-editor.org/rfc/rfc5861", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain how a CDN routes users to a nearby PoP and serves cached content.",
              "Control edge caching with Cache-Control, cache keys and Vary.",
              "Design purge/versioning strategies and use origin shielding.",
              "Know the limits: personalised content, cache fragmentation, purge propagation.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Instead of every customer driving to the factory, the company stocks popular products in local stores. Most customers get them from the corner store (edge PoP); the store restocks from a regional warehouse (shield) only when it runs out, and the factory (origin) sees a trickle.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Term", "Meaning"],
            rows: [
              ["PoP", "Point of presence: a CDN data centre near users"],
              ["Origin", "Your server or bucket that owns the content"],
              ["Cache key", "What identifies a cached object — by default scheme + host + path + (some) query string"],
              ["Origin shield", "A designated mid-tier cache that edge PoPs fetch from, so the origin sees one request per object instead of one per PoP"],
              ["Purge / invalidation", "Removing objects from edge caches by URL, prefix or tag"],
              ["Edge compute", "Running code at PoPs (Workers, Lambda@Edge) for routing, auth, personalisation"],
            ],
          },
          {
            type: "table",
            head: ["Cache-Control directive", "Effect"],
            rows: [
              ["max-age=N", "Fresh for N seconds (browsers and shared caches)"],
              ["s-maxage=N", "Overrides max-age for shared caches (CDNs) only"],
              ["no-cache", "May store, but must revalidate with the origin before use"],
              ["no-store", "Never store (sensitive data)"],
              ["private", "Only the browser may cache (per-user responses)"],
              ["public", "Shared caches may store (even if normally not, e.g. with Authorization)"],
              ["stale-while-revalidate=N", "Serve stale for up to N s while refreshing in the background"],
              ["stale-if-error=N", "Serve stale for up to N s if the origin errors"],
              ["immutable", "Content never changes at this URL — skip revalidation"],
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
              "Latency: content served from ~10–30 ms away instead of across an ocean; TLS terminates nearby too.",
              "Offload and cost: origin egress and compute drop by the hit ratio; CDN egress is typically cheaper per GB at volume.",
              "Resilience: absorbs traffic spikes and volumetric DDoS; can serve stale content when the origin is down.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "Request path through a CDN",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Routing to a PoP", detail: "Via anycast (the same IP announced from every PoP; BGP routes to a nearby one) or DNS-based steering that returns a nearby PoP's IP." },
              { title: "Edge lookup", detail: "The PoP computes the cache key and checks its cache. Fresh hit → respond immediately." },
              { title: "Revalidation", detail: "Stale entry → conditional request to the parent/origin with If-None-Match (ETag) or If-Modified-Since; a 304 refreshes it cheaply." },
              { title: "Miss", detail: "Fetch from the shield/parent tier; the shield fetches from origin on its own miss, collapsing concurrent requests for the same object." },
              { title: "Store and respond", detail: "Store per Cache-Control and CDN rules; respond to the user." },
            ],
          },
          {
            type: "flow",
            nodes: ["User", "Edge PoP", "Origin shield", "Origin (LB → app / S3)"],
            caption: "Tiered caching: misses at many edges collapse into few origin requests.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Example: a news site",
        blocks: [
          {
            type: "table",
            head: ["Content", "Headers", "Invalidation"],
            rows: [
              ["/assets/app.3f9a2c.js", "public, max-age=31536000, immutable", "Never — new deploy, new hashed filename"],
              ["Article HTML", "public, s-maxage=300, stale-while-revalidate=60, stale-if-error=86400", "Purge by tag 'article-123' on edit"],
              ["Homepage", "public, s-maxage=30, stale-while-revalidate=30", "Short TTL is enough"],
              ["/api/me (personalised)", "private, no-store", "Not cached at the edge"],
              ["Images", "public, max-age=86400; variants by width in the URL", "Versioned URL on change"],
            ],
          },
          {
            type: "p",
            text: "Breaking news: thousands of requests per second for one article. With a 300 s TTL and request collapsing at the shield, the origin serves roughly one request per 300 s per shield region for that page — the rest are hits.",
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Cache-key fragmentation:** tracking query params (`utm_*`), cookies or a broad `Vary: User-Agent` create thousands of variants and destroy the hit ratio. Normalise the key.",
              "**Accidental caching of private data:** a missing `private`/`no-store` on a personalised response can serve one user's page to others — a serious security incident.",
              "**Purge isn't instant everywhere:** propagation can take seconds; browsers that cached with max-age won't see purges at all.",
              "**Long-tail content** (rarely requested) has low hit ratios; origin must still handle it.",
              "**Dynamic/POST requests** pass through, though the CDN still helps with TLS termination, connection reuse and routing.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Cache at the edge", points: ["Static assets, media, downloads", "Public HTML and API responses identical for many users", "Content that can be a few seconds/minutes stale"] },
              { title: "Don't cache (or only at the browser)", points: ["Per-user responses", "Strongly consistent data (balances, stock at checkout)", "Write requests"] },
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
              "**Monitor:** edge hit ratio (requests and bytes), origin request rate and egress, 5xx at edge vs origin, purge latency, latency by region.",
              "**Cost:** CDN egress per GB, requests, and features (edge compute, WAF); origin egress to the CDN; shield reduces origin load but adds a tier.",
              "**Failure modes:** CDN provider outage (multi-CDN for critical sites), misconfigured cache rules, purge-all causing origin stampede.",
              "**Security:** lock the origin so only the CDN can reach it (allow-list CDN IPs or signed headers), otherwise attackers bypass the WAF.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "A CDN caches content in points of presence near users, routed via anycast or DNS. Edges serve hits locally, revalidate stale objects with ETags, and on misses fetch through an origin shield so the origin sees few requests. I control it with Cache-Control — long max-age plus immutable for content-hashed assets, s-maxage with stale-while-revalidate for public pages — and purge by URL or tag when content changes. Personalised responses are private or no-store.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Versioned (content-hashed) URLs are the best invalidation: none needed.",
              "Cache-key design determines hit ratio; strip irrelevant query params and avoid broad Vary.",
              "Tiered caching and request collapsing protect the origin from both normal misses and flash crowds.",
              "Edge compute moves auth checks, A/B assignment and personalisation fragments to the edge while keeping most bytes cacheable.",
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
              "CDN = caches near users + optimised network + DDoS absorption.",
              "Cache-Control (max-age, s-maxage, SWR, immutable, private/no-store) is the contract.",
              "Version URLs for static assets; purge by tag for dynamic pages.",
              "Watch cache keys and never cache private data publicly.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Anycast", definition: "One IP address announced from many locations; the network routes each user to a nearby one." },
      { term: "ETag", definition: "An identifier for a version of a resource used for conditional revalidation." },
      { term: "Origin shield", definition: "A mid-tier cache that sits between edge PoPs and the origin." },
      { term: "Request collapsing", definition: "Combining concurrent misses for the same object into one origin fetch." },
      { term: "Vary", definition: "Response header listing request headers that select between cached variants." },
    ],
    followUps: [
      { q: "How do you deploy a new JS bundle without users getting a stale version?", a: "Use content-hashed filenames with a year-long max-age and immutable; the HTML (short TTL) references the new filename, so no purge is needed." },
      { q: "Can a CDN cache API responses?", a: "Yes, if they're identical for many users (public catalogues, configuration) with s-maxage and a clean cache key. Personalised or authorised responses should be private/no-store, or split into a cacheable shared part and a small personalised call." },
      { q: "What does an origin shield buy you?", a: "Without it each PoP misses independently, so a new object can cause one origin fetch per PoP. A shield funnels misses through one tier, improving hit ratio and protecting the origin." },
      { q: "The origin is down. Can users still see pages?", a: "Yes for cached objects, and stale ones too if responses carry stale-if-error or the CDN is configured to serve stale on origin errors." },
    ],
    quiz: [
      {
        id: "cdn-q1",
        prompt: "Which header is best for a content-hashed static asset?",
        options: ["no-store", "private, max-age=60", "public, max-age=31536000, immutable", "no-cache"],
        answer: 2,
        explanation: "The URL changes when the content does, so it can be cached for a very long time without revalidation.",
      },
      {
        id: "cdn-q2",
        prompt: "The edge hit ratio is low and logs show URLs with many different utm_source values. Fix?",
        options: ["Lower the TTL", "Strip tracking parameters from the cache key", "Add Vary: Cookie", "Disable the origin shield"],
        answer: 1,
        explanation: "Irrelevant query parameters fragment the cache; normalising the key restores hits.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── 13. sharding-partitioning
  {
    slug: "sharding-partitioning",
    track: "system-design",
    title: "Sharding and partitioning",
    summary:
      "Splitting data across nodes: range, hash and directory-based partitioning, consistent hashing, choosing a shard key, hot keys, cross-shard queries and resharding without downtime.",
    level: "advanced",
    frequency: "very-high",
    minutes: 35,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["system-design/data-modeling", "system-design/vertical-vs-horizontal-scaling"],
    related: [
      "system-design/replication",
      "system-design/load-balancing-algorithms",
      "system-design/database-indexes",
      "system-design/consistency-models",
      "distributed/distributed-transactions",
      "dsa/hash-tables",
    ],
    tags: ["sharding", "partitioning", "consistent-hashing", "hot-keys", "resharding", "shard-key"],
    sources: [
      CHECKLIST,
      DDIA,
      DYNAMO,
      { label: "Vitess documentation — Sharding", url: "https://vitess.io/docs/reference/features/sharding/", kind: "docs" },
      { label: "Amazon DynamoDB — Partitions and data distribution", url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.Partitions.html", kind: "docs" },
      { label: "Instagram Engineering — Sharding & IDs at Instagram", url: "https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c", kind: "external" },
      { label: "PostgreSQL docs — Table Partitioning", url: "https://www.postgresql.org/docs/current/ddl-partitioning.html", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Distinguish partitioning within one database from sharding across machines.",
              "Compare range, hash and directory-based schemes and when each fits.",
              "Choose a shard key and handle hot keys.",
              "Explain cross-shard queries/transactions and resharding strategies.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A phone book too big for one volume gets split: A–F, G–M, N–S, T–Z (range). Or you could put each name into volume hash(name) mod 4 (hash) — evenly sized volumes, but you can no longer read 'all names starting with Ka' from one volume. Or keep a little index card saying which volume holds which name (directory).",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Scheme", "How the shard is chosen", "Pros", "Cons"],
            rows: [
              ["Range", "Key ranges (e.g. user_id 0–1M → shard 1)", "Efficient range scans; easy to split ranges", "Hot spots with sequential keys (timestamps, auto-increment)"],
              ["Hash", "hash(key) mod N or a hash ring", "Even distribution", "Range queries hit all shards; mod-N resharding moves most data"],
              ["Consistent hashing", "Hash ring with virtual nodes", "Adding a node moves ~1/N of data", "Still no range locality; needs vnode tuning"],
              ["Directory / lookup", "A mapping service: key (or tenant) → shard", "Flexible placement, move individual tenants", "Lookup service is a dependency and must be highly available and cached"],
              ["Geo / entity-based", "By region or tenant", "Data residency, isolation", "Uneven sizes; large tenants"],
            ],
          },
          {
            type: "callout",
            tone: "note",
            text: "Terminology: *partitioning* often means splitting a table within one database (Postgres declarative partitioning by range/list/hash); *sharding* means partitions live on different servers. Many systems use the words interchangeably.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "Replication scales reads; only partitioning scales writes and total storage beyond one machine.",
              "Smaller partitions mean faster backups, index rebuilds and recovery, and smaller blast radius.",
              "It's the most consequential decision in high-scale designs — the shard key shapes every query.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "Routing, rebalancing and cross-shard work",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Routing", detail: "Something must map key → shard: the client library (with a cached shard map), a proxy (Vitess vtgate, mongos), or the database itself (Cassandra/DynamoDB nodes forward requests)." },
              { title: "Fixed many-partitions approach", detail: "Create many more logical partitions than nodes (Redis Cluster, for example, always has 16,384 hash slots) and assign partitions to nodes. Rebalancing moves whole partitions; keys never change partition." },
              { title: "Splitting", detail: "Range-partitioned systems (Bigtable/HBase, CockroachDB, DynamoDB internally) split a partition when it grows too big or too hot." },
              { title: "Cross-shard queries", detail: "Queries without the shard key scatter to all shards and gather results — latency follows the slowest shard. Global secondary indexes avoid scatter-gather but are updated asynchronously or need distributed transactions." },
              { title: "Cross-shard transactions", detail: "Need two-phase commit or a saga; avoid by choosing a shard key that keeps transactional data together (e.g. everything for a tenant)." },
            ],
          },
          {
            type: "table",
            head: ["Resharding approach", "How"],
            rows: [
              ["Pre-split logical shards", "Start with 1,024 logical shards on 4 servers; move logical shards later"],
              ["Online split with dual writes", "Copy data to new shards, dual-write, verify, cut over reads, stop old writes"],
              ["Log-based migration", "Snapshot + replay change log to the target (Vitess VReplication, CDC), then switch traffic"],
              ["Consistent hashing", "Add a node; only neighbour ranges move"],
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Example: sharding a multi-tenant SaaS",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Requirement", detail: "50k tenants; the largest has 5% of data; all queries are within a tenant; tenants occasionally need to move for compliance." },
              { title: "Shard key", detail: "`tenant_id` — keeps each tenant's transactions and joins on one shard." },
              { title: "Scheme", detail: "Directory: a `tenant → shard` table cached in each app instance. Large tenants get dedicated shards; small ones are packed together." },
              { title: "IDs", detail: "Globally unique IDs (Snowflake-style or UUIDv7) so rows can move between shards without key collisions." },
              { title: "Cross-tenant analytics", detail: "Never on the OLTP shards: CDC into a warehouse." },
              { title: "Moving a tenant", detail: "Copy its rows, replay changes, briefly pause writes for that tenant, flip the directory entry, resume." },
            ],
          },
        ],
      },
      {
        id: "examples",
        title: "Shard key choices for common systems",
        blocks: [
          {
            type: "table",
            head: ["System", "Shard key", "Watch out for"],
            rows: [
              ["Chat messages", "conversation_id (+ time bucket)", "Huge group chats"],
              ["Social posts", "author user_id", "Celebrity accounts; timeline reads need fan-out"],
              ["Orders", "customer_id", "Merchant-side queries become scatter-gather → separate read model"],
              ["IoT metrics", "device_id + time bucket", "Range queries over all devices → analytics store"],
              ["URL shortener", "hash(short code)", "Analytics by owner requires a secondary index"],
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Hot keys:** one key (celebrity, viral product) overwhelms its shard. Mitigations: cache it, replicate reads, add a random suffix to spread writes (key#0…key#9) and merge on read, or give it a dedicated shard.",
              "**Monotonic keys with range partitioning:** every insert lands on the last range — use hashing or prefix with a hash.",
              "**Skewed tenants:** bin-packing changes over time; plan for moving tenants.",
              "**Unique constraints across shards** can't be enforced locally — use a separate uniqueness table keyed by the unique value.",
              "**Joins across shards** become application-level joins; denormalise.",
              "**Operational multiplication:** 64 shards means 64 primaries to back up, upgrade, monitor and fail over.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Shard when", points: ["Write throughput or data size exceeds one primary", "Natural partitioning key exists (tenant, user)", "Isolation between tenants is valuable"] },
              { title: "Delay sharding when", points: ["Vertical scaling, replicas and caching still work", "Queries span many entities", "The team can't absorb the operational cost yet"] },
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
              "**Monitor:** per-shard QPS, CPU, storage and p99 (look for skew), hot-key reports, throttling (DynamoDB), rebalance progress.",
              "**Failure mode:** one shard down → only its users affected (good isolation), but scatter-gather queries fail or degrade for everyone.",
              "**Failure mode:** a rebalance saturates network/disk and causes latency spikes — throttle data movement.",
              "**Tooling:** Vitess (MySQL), Citus (Postgres), MongoDB sharding, managed NoSQL that partitions transparently.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Sharding splits data across machines so writes and storage scale. Range partitioning keeps keys ordered for range scans but risks hot spots on sequential keys; hash partitioning spreads load evenly but loses range locality; a directory maps keys or tenants to shards flexibly at the cost of a lookup service. I pick a shard key with high cardinality and even access that keeps transactional data together, like tenant_id or user_id. I plan for hot keys with caching or key splitting, avoid cross-shard transactions, and pre-split into many logical shards or use consistent hashing so resharding moves little data.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Queries without the shard key are scatter-gather: their latency is the slowest shard's latency and their cost grows with shard count.",
              "Many-logical-partitions-per-node (Redis Cluster's 16,384 slots, Cassandra vnodes) makes rebalancing a matter of moving partitions.",
              "Resharding online: snapshot + change replay + cutover, with verification and rollback.",
              "Global uniqueness and IDs: decentralised ID generation avoids a single sequence.",
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
              "Range: ordered, hot-spot risk. Hash: even, no ranges. Directory: flexible, extra lookup.",
              "The shard key decides locality, balance and which queries are cheap.",
              "Hot keys need special handling regardless of scheme.",
              "Design for resharding from day one (logical shards, global IDs).",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Shard", definition: "A horizontal slice of a dataset stored on its own server(s)." },
      { term: "Shard key", definition: "The attribute that determines which shard a row lives on." },
      { term: "Scatter-gather", definition: "Sending a query to all shards and merging their results." },
      { term: "Hot key / hot partition", definition: "A key or partition receiving disproportionate traffic." },
      { term: "Resharding", definition: "Changing the number or layout of shards and moving data accordingly." },
    ],
    followUps: [
      { q: "How would you handle a celebrity with 100M followers in a user-sharded system?", a: "Treat them specially: cache their posts aggressively, don't fan out their posts on write (merge at read time instead), and possibly spread their data with key suffixes or a dedicated shard." },
      { q: "Why is mod-N hashing bad for resharding?", a: "Changing N changes almost every key's shard, forcing a near-total data migration. Consistent hashing or a fixed number of logical partitions limits movement." },
      { q: "How do you enforce a unique email across shards sharded by user_id?", a: "Keep a separate table keyed by email (itself partitioned by email) and reserve the email there first — effectively a small distributed transaction or a conditional write." },
      { q: "How do you run a query by a non-shard-key attribute?", a: "Use a global secondary index (eventually consistent), a separately partitioned lookup table, a search index, or accept scatter-gather if it's rare." },
      { q: "What breaks when you shard a relational database?", a: "Cross-shard joins, foreign keys, transactions, unique constraints, auto-increment IDs and simple global queries — all must be redesigned or moved to other systems." },
    ],
    quiz: [
      {
        id: "sh-q1",
        prompt: "A time-series table is range-partitioned by timestamp across 10 nodes. What's the problem?",
        options: ["Range scans are slow", "All current writes go to the node owning the latest range", "Data can't be deleted", "Indexes are impossible"],
        answer: 1,
        explanation: "Monotonic keys concentrate inserts on the newest range; prefix with a device/hash or use hash partitioning.",
      },
      {
        id: "sh-q2",
        prompt: "Why choose tenant_id as the shard key in B2B SaaS?",
        options: ["It has the lowest cardinality", "It keeps each tenant's data and transactions on one shard and enables per-tenant isolation", "It makes cross-tenant analytics fast", "It avoids the need for indexes"],
        answer: 1,
        explanation: "Most queries and transactions are within one tenant, so they stay single-shard.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── 14. replication
  {
    slug: "replication",
    track: "system-design",
    title: "Replication",
    summary:
      "Keeping copies of data on multiple nodes: leader-follower, multi-leader and leaderless replication; synchronous vs asynchronous; replication lag and the read-your-writes problem; failover hazards.",
    level: "advanced",
    frequency: "very-high",
    minutes: 35,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["system-design/sql-vs-nosql"],
    related: [
      "system-design/consistency-models",
      "system-design/cap-theorem",
      "system-design/sharding-partitioning",
      "system-design/redundancy-failover",
      "databases/postgres-replication",
      "distributed/consensus-basics",
    ],
    tags: ["replication", "leader-follower", "multi-leader", "leaderless", "quorum", "replication-lag", "failover"],
    sources: [
      CHECKLIST,
      DDIA,
      DYNAMO,
      { label: "PostgreSQL docs — High Availability, Load Balancing, and Replication", url: "https://www.postgresql.org/docs/current/high-availability.html", kind: "docs" },
      { label: "MySQL 8.0 docs — Semisynchronous Replication", url: "https://dev.mysql.com/doc/refman/8.0/en/replication-semisync.html", kind: "docs" },
      { label: "Apache Cassandra — Dynamo-style architecture", url: "https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain the three replication topologies and their conflict behaviour.",
              "Contrast synchronous, semi-synchronous and asynchronous replication.",
              "Diagnose replication-lag anomalies and apply read-your-writes and monotonic-read fixes.",
              "Describe failover and its dangers (data loss, split brain).",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A teacher (leader) writes on the board and students (followers) copy into notebooks. Anyone can read a notebook, but a student who copies slowly may show an old version. If the teacher leaves, a student becomes the new teacher — hopefully one who copied everything.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Topology", "Writes go to", "Conflicts", "Examples"],
            rows: [
              ["Leader-follower (primary-replica)", "One leader; followers apply its log", "None (single writer order)", "Postgres streaming, MySQL, MongoDB replica sets, Kafka partitions"],
              ["Multi-leader", "Any of several leaders (often one per region)", "Concurrent writes conflict → resolution needed", "MySQL group replication (multi-primary), CouchDB, collaborative apps"],
              ["Leaderless", "Any replica(s); client or coordinator writes to W of N nodes", "Concurrent writes → versions/LWW/CRDTs", "Cassandra, DynamoDB-style, Riak"],
            ],
          },
          {
            type: "table",
            head: ["Mode", "Commit acknowledged after", "Trade-off"],
            rows: [
              ["Synchronous", "All (or a named set of) replicas confirm", "No loss on leader failure; latency = slowest replica; a stalled replica blocks writes"],
              ["Semi-synchronous", "At least one replica confirms receipt", "Bounded loss risk, moderate latency"],
              ["Asynchronous", "Leader's local commit", "Lowest latency; recent writes may be lost on failover; followers lag"],
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
              "**Availability:** survive node or zone failure.",
              "**Read scaling:** spread reads across followers.",
              "**Latency:** place replicas near users in other regions.",
              "**Durability:** multiple copies on independent hardware.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "How changes flow",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Replication log", detail: "The leader records changes — physical (WAL bytes, as Postgres streaming replication), logical (row changes, MySQL row-based binlog, Postgres logical replication) or statement-based (fragile with non-deterministic functions)." },
              { title: "Shipping", detail: "Followers connect and stream the log, applying it in order. Their position (LSN, GTID) shows how far behind they are." },
              { title: "Quorums (leaderless)", detail: "With N replicas, write to W and read from R. If R + W > N, every read set overlaps the latest acknowledged write's set. Typical: N=3, W=2, R=2." },
              { title: "Repair (leaderless)", detail: "Read repair fixes stale replicas noticed during reads; anti-entropy (Merkle trees) syncs in the background; hinted handoff stores writes for a temporarily down node." },
              { title: "Conflict resolution (multi-leader/leaderless)", detail: "Last-write-wins by timestamp (simple, silently drops writes), version vectors to detect concurrency, application merge, or CRDTs that merge deterministically." },
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "PostgreSQL's `synchronous_commit` (`off`, `local`, `remote_write`, `on`, `remote_apply`) and `synchronous_standby_names` (e.g. `ANY 1 (a, b)`) let you choose durability vs latency per transaction. MySQL's semi-sync waits for a replica to acknowledge receipt, not to apply.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Replication lag anomalies",
        blocks: [
          {
            type: "table",
            head: ["Anomaly", "Scenario", "Fix"],
            rows: [
              ["Read-your-writes violation", "User edits their profile (leader), refreshes, read hits a lagging follower → old profile", "Read own data from the leader for N seconds after a write, or wait until the follower's LSN ≥ the write's LSN"],
              ["Non-monotonic reads", "Two refreshes hit different followers; a comment appears, then disappears", "Pin a user's reads to one replica (hash user_id) or track the last-seen LSN"],
              ["Consistent prefix violation", "Reader sees an answer before the question (different partitions lag differently)", "Write causally related data to the same partition or track causal dependencies"],
            ],
          },
          {
            type: "code",
            lang: "text",
            caption: "Conceptual read-your-writes routing",
            code: `on write:  lsn = primary.commit(tx); session.last_write_lsn = lsn
on read:   replica = pick_replica()
           if replica.replay_lsn < session.last_write_lsn:
               read from primary (or wait briefly)
           else:
               read from replica`,
          },
        ],
      },
      {
        id: "examples",
        title: "Failover",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Detect", detail: "Leader misses heartbeats for a timeout (e.g. 10–30 s). Too short → false failovers; too long → longer outage." },
              { title: "Elect", detail: "Choose the most up-to-date follower, ideally via consensus (Patroni with etcd, Raft-based systems) so only one leader is chosen." },
              { title: "Reconfigure", detail: "Clients/proxies route writes to the new leader; the old leader must be fenced (STONITH, fencing tokens) so it can't keep accepting writes." },
              { title: "Reconcile", detail: "With async replication, writes the old leader acknowledged but never shipped are lost or must be manually reconciled." },
            ],
          },
          {
            type: "callout",
            tone: "warning",
            title: "Split brain",
            text: "If two nodes both believe they're leader, both accept writes and data diverges. Consensus-based election plus fencing of the old leader prevents it.",
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Lag spikes** under heavy writes, long-running queries on replicas (Postgres hot-standby conflicts), or vacuum/DDL — follower reads can be minutes stale.",
              "**LWW with clock skew** can drop the *later* write if the earlier writer's clock was ahead.",
              "**Sloppy quorums** (Dynamo) improve availability during partitions but break the R + W > N overlap guarantee.",
              "**Synchronous replication to another region** adds a cross-region round trip to every commit.",
              "**Replicas are not backups:** a bad DELETE replicates instantly. Keep point-in-time-recovery backups.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Topology", "Choose when", "Avoid when"],
            rows: [
              ["Leader-follower", "Most OLTP; need simple consistency on writes", "Writes must be accepted in multiple regions with low latency"],
              ["Multi-leader", "Multi-region writes, offline-capable clients, collaborative editing", "You can't define conflict resolution"],
              ["Leaderless", "High write availability, tunable consistency, multi-AZ", "You need transactions or linearizable reads"],
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
              "**Monitor:** replication lag in seconds and bytes, replica health, WAL/binlog disk usage (a dead replica slot can fill the leader's disk in Postgres), failover events.",
              "**Test failover** regularly (game days); measure RTO (time to recover) and RPO (data loss window).",
              "**Cost:** each replica is a full copy of data plus cross-AZ/region transfer costs.",
              "**Managed options** (RDS Multi-AZ, Aurora, Cloud SQL HA) automate failover but still have a failover window of seconds to a minute or two.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Replication keeps copies on multiple nodes for availability, read scaling and durability. Leader-follower sends all writes through one leader and streams its log to followers; multi-leader accepts writes in several places and must resolve conflicts; leaderless writes to W of N replicas and reads from R, with R + W > N giving overlap. Synchronous replication avoids data loss on failover at the cost of latency; asynchronous is fast but followers lag, so I route a user's reads to the leader or an up-to-date replica after they write to get read-your-writes.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Failover is the hard part: detection timeouts, electing the most current follower via consensus, fencing the old leader, losing unreplicated async writes.",
              "Lag anomalies map to session guarantees: read-your-writes, monotonic reads, consistent prefix.",
              "Quorums aren't linearizable by themselves (sloppy quorums, concurrent writes, LWW).",
              "Use LSN/GTID tracking to make replica reads safe without always hitting the leader.",
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
              "Leader-follower (simple), multi-leader (conflicts), leaderless (quorums).",
              "Sync = durable but slow; async = fast but lossy on failover and laggy.",
              "Handle lag with read-your-writes and monotonic-read routing.",
              "Failover needs consensus and fencing; replicas are not backups.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Replication lag", definition: "Delay between a write on the leader and its application on a follower." },
      { term: "LSN", definition: "Log sequence number: a position in the write-ahead log (Postgres); GTID plays a similar role in MySQL." },
      { term: "Quorum", definition: "The minimum number of replicas that must acknowledge an operation." },
      { term: "Split brain", definition: "Two nodes simultaneously acting as leader." },
      { term: "Fencing", definition: "Preventing a deposed leader from making further writes." },
      { term: "RPO / RTO", definition: "Recovery point objective (acceptable data loss) / recovery time objective (acceptable downtime)." },
      { term: "CRDT", definition: "Conflict-free replicated data type: a structure whose concurrent updates merge deterministically." },
    ],
    followUps: [
      { q: "A user updates their bio and the page still shows the old one. Why and how do you fix it?", a: "The read went to an asynchronously replicated follower that hadn't applied the write yet. Route that user's reads to the leader for a short window, or to a replica whose replay position is at least the write's LSN." },
      { q: "With N=3, W=1, R=1, what do you get?", a: "Fast, highly available operations but no overlap guarantee — a read can miss the latest write. Use W=2, R=2 (or QUORUM) when you need reads to see acknowledged writes." },
      { q: "Why not make all replication synchronous?", a: "Every write waits for the slowest replica, and if a synchronous replica is down, writes stall unless you fall back. Common compromise: one synchronous replica in another AZ plus async replicas." },
      { q: "How do multi-leader systems resolve conflicts?", a: "Last-write-wins (lossy), version vectors to detect conflicts and let the application merge, or CRDTs for data types with deterministic merges; or avoid conflicts by routing each record's writes to a home region." },
      { q: "What is RPO for async replication with failover?", a: "Roughly the replication lag at the moment of failure — any writes the leader acknowledged but hadn't shipped are lost." },
    ],
    quiz: [
      {
        id: "rep-q1",
        prompt: "N = 5 replicas. Which (W, R) guarantees read and write sets overlap?",
        options: ["W=2, R=2", "W=3, R=3", "W=1, R=3", "W=2, R=3"],
        answer: 1,
        explanation: "Overlap requires R + W > N: 3 + 3 = 6 > 5. The others sum to 5 or less.",
      },
      {
        id: "rep-q2",
        prompt: "What's the main risk of failing over to an asynchronous follower?",
        options: ["The follower can't accept writes", "Writes acknowledged by the old leader but not yet replicated are lost", "Indexes must be rebuilt", "Reads become slower"],
        answer: 1,
        explanation: "Async replication acknowledges before followers receive the data, so a leader crash can lose the replication-lag window.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── 15. consistency-models
  {
    slug: "consistency-models",
    track: "system-design",
    title: "Consistency models",
    summary:
      "What a read is allowed to return in a replicated system: linearizable, sequential, causal and eventual consistency, plus the session guarantees (read-your-writes, monotonic reads) — and what each costs in latency and availability.",
    level: "advanced",
    frequency: "high",
    minutes: 35,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["system-design/replication"],
    related: [
      "system-design/cap-theorem",
      "system-design/locks-transactions-isolation",
      "system-design/cache-invalidation",
      "distributed/consensus-basics",
      "databases/transactions-acid",
    ],
    tags: ["consistency", "linearizability", "sequential", "causal", "eventual", "read-your-writes", "monotonic-reads"],
    sources: [
      CHECKLIST,
      JEPSEN,
      DDIA,
      { label: "Herlihy & Wing — Linearizability: A Correctness Condition for Concurrent Objects (1990)", url: "https://dl.acm.org/doi/10.1145/78969.78972", kind: "external" },
      { label: "Jepsen — Read Your Writes (session guarantees)", url: "https://jepsen.io/consistency/models/read-your-writes", kind: "external" },
      { label: "Werner Vogels — Eventually Consistent (CACM 2009)", url: "https://www.allthingsdistributed.com/2008/12/eventually_consistent.html", kind: "external" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Define linearizable, sequential, causal and eventual consistency precisely enough to tell them apart.",
              "Define the four session guarantees and map them to replication-lag bugs.",
              "Distinguish consistency models for single objects from isolation levels for transactions.",
              "Pick a model per data type and explain its latency/availability cost.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Imagine a scoreboard shown on many screens around a stadium. Linearizable: every screen updates at the same instant, as if there were one screen. Sequential: screens might lag, but every screen shows the same sequence of scores. Causal: if a goal *caused* a replay, nobody sees the replay before the goal. Eventual: screens might disagree for a while, but once scoring stops they all converge.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Model", "Guarantee", "Availability under partition (per Jepsen)"],
            rows: [
              ["Linearizable", "Every operation appears to take effect atomically at one instant between its call and its return; respects real-time order. Behaves like a single copy.", "Not available — some nodes must refuse"],
              ["Sequential", "All processes see one total order of operations consistent with each process's own program order — but not necessarily real time.", "Not available"],
              ["Causal", "Operations that are causally related (A happened-before B) are seen in that order by everyone; concurrent ones may be seen in different orders.", "Sticky available (clients stay with the same replica)"],
              ["Eventual", "If writes stop, all replicas eventually return the same value. No ordering promise in the meantime.", "Totally available"],
            ],
          },
          {
            type: "table",
            head: ["Session guarantee", "Promise (within one client session)"],
            rows: [
              ["Read-your-writes", "After you write, your reads reflect that write"],
              ["Monotonic reads", "Once you've seen a value, you never see an older one"],
              ["Monotonic writes", "Your writes are applied in the order you issued them"],
              ["Writes-follow-reads", "A write made after reading X is ordered after X everywhere"],
            ],
          },
          {
            type: "callout",
            tone: "misconception",
            title: "Consistency models ≠ isolation levels ≠ ACID's C",
            text: "Linearizability is about single objects in a replicated system (recency). Serializability is about multi-object transactions (isolation) and says nothing about real time. *Strict serializability* combines both. ACID's 'C' means application invariants hold — a different idea again.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "Every replicated or cached system has *some* consistency model; if you don't choose one, you get the weakest by accident.",
              "Stronger models need coordination (consensus, quorums, a single leader) → more latency and less availability during partitions.",
              "Correctness for locks, leader election, unique usernames and balances depends on linearizable operations.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "How systems implement each",
        blocks: [
          {
            type: "table",
            head: ["Model", "Typical mechanism", "Examples"],
            rows: [
              ["Linearizable", "Single leader with reads served by the leader holding a valid lease, or consensus (Raft/Paxos) for every op; TrueTime commit-wait (Spanner)", "etcd, ZooKeeper writes (reads need sync), Spanner, CockroachDB per-key, DynamoDB strongly consistent reads (single item)"],
              ["Sequential", "Total-order broadcast without real-time constraints", "ZooKeeper's guarantees for a client view are close to this"],
              ["Causal", "Track dependencies with vector clocks / version vectors or hybrid logical clocks; delay visibility until dependencies are visible", "MongoDB causally consistent sessions, COPS-style research systems"],
              ["Read-your-writes / monotonic", "Sticky routing or tracking last-seen log position", "Leader reads after write; LSN-aware replica routing"],
              ["Eventual", "Async replication, anti-entropy, LWW or CRDT merges", "DNS, Cassandra at ONE, caches, S3 cross-region replication"],
            ],
          },
          {
            type: "flow",
            nodes: ["Eventual", "Monotonic reads / RYW", "Causal", "Sequential", "Linearizable", "Strict serializable"],
            caption: "Conceptual strength ordering (stronger to the right). Session guarantees and causal are partially ordered, not a strict line.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Spot the model",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "History", detail: "Client A writes x=1 and gets OK at t=10. Client B starts a read at t=12 and gets x=0." },
              { title: "Linearizable?", detail: "No — the write completed before the read began, so any linearizable read must return 1." },
              { title: "Sequential?", detail: "Possibly yes — ordering B's read before A's write is allowed because sequential consistency ignores real time across clients." },
              { title: "Eventual?", detail: "Yes — stale reads are fine as long as replicas converge." },
              { title: "Read-your-writes?", detail: "Not violated — the stale read was by a *different* client. If A itself read 0 after its write, RYW would be violated." },
            ],
          },
        ],
      },
      {
        id: "examples",
        title: "Choosing per data type",
        blocks: [
          {
            type: "table",
            head: ["Data", "Model", "Why"],
            rows: [
              ["Account balance, inventory decrement", "Linearizable / serializable transactions", "Invariants must never be violated"],
              ["Username uniqueness, leader lock", "Linearizable (compare-and-set)", "Two winners would be a bug"],
              ["Chat messages in a thread", "Causal", "Replies must appear after what they reply to"],
              ["User's own profile edits", "Read-your-writes", "Users notice their own changes vanishing"],
              ["Like counts, view counts", "Eventual", "Small, temporary inaccuracy is fine"],
              ["Feed / timeline", "Eventual + monotonic reads", "Freshness lag OK; items shouldn't flicker"],
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Caches break guarantees:** a linearizable database behind a cache is no longer linearizable for reads that hit the cache.",
              "**Quorums aren't automatically linearizable:** concurrent writes with LWW, sloppy quorums and partial-failure writes can produce non-linearizable histories.",
              "**Clocks:** last-write-wins by wall-clock time can violate causality when clocks are skewed.",
              "**'Strong consistency' is ambiguous in marketing** — ask: linearizable? for single keys or transactions? for reads from all replicas?",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Stronger (linearizable/serializable)", points: ["Simple to reason about — like one machine", "Coordination on every op → higher latency, especially cross-region", "Unavailable on the minority side of a partition"] },
              { title: "Weaker (causal/eventual + session)", points: ["Low latency, local reads, available during partitions", "Application must handle stale reads and conflicts", "Harder to test and reason about"] },
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
              "**Monitor:** replication lag (the practical staleness bound), conflict counts, stale-read sampling.",
              "**Test:** Jepsen-style fault injection reveals whether a store actually delivers its documented model under partitions and clock skew.",
              "**Cost:** linearizable cross-region writes cost at least one cross-region round trip (often 50–150 ms).",
              "**Pattern:** strong core (payments in a consensus-backed or single-leader DB) with eventually consistent edges (caches, search, analytics).",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "A consistency model defines what reads may return in a replicated system. Linearizable means it behaves like a single copy with real-time ordering — needed for locks, uniqueness and balances, but it requires coordination. Sequential keeps one global order without real-time guarantees, causal preserves cause-and-effect ordering, and eventual only promises convergence. Session guarantees like read-your-writes and monotonic reads fix the most visible anomalies cheaply. I choose per data type: strong for money and uniqueness, causal or session guarantees for user-facing content, eventual for counters.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Linearizability is a recency guarantee on single objects; serializability is an isolation guarantee on transactions; strict serializability is both.",
              "Causal consistency is about the strongest model that can stay available during partitions (with sticky clients) — a useful middle ground.",
              "Implementation cost: consensus/leases for linearizable, vector clocks/HLCs for causal, sticky routing or LSN tracking for session guarantees.",
              "Reference Jepsen's consistency map when asked to compare models.",
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
              "Linearizable > sequential > causal > eventual (roughly), plus session guarantees.",
              "Stronger = easier to program, slower and less available.",
              "Choose per data type; caches and async replicas silently weaken guarantees.",
              "Don't confuse consistency models, isolation levels and ACID's C.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Linearizability", definition: "Each operation appears to happen atomically at a single point between its invocation and response, consistent with real time." },
      { term: "Causality (happened-before)", definition: "A precedes B if B could have been influenced by A (same process order, or B read A's result)." },
      { term: "Vector clock", definition: "Per-node counters attached to versions to detect whether updates are causally ordered or concurrent." },
      { term: "Strict serializability", definition: "Transactions are serializable and their order respects real time." },
      { term: "Session guarantee", definition: "A consistency promise scoped to one client's sequence of operations." },
    ],
    followUps: [
      { q: "Is a single-leader database linearizable?", a: "Writes and reads served by the leader can be, if the leader knows it's still the leader (leases or consensus). Reads from async followers are not linearizable." },
      { q: "Why is causal consistency attractive?", a: "It preserves the orderings users actually notice (replies after posts) while allowing replicas to serve reads locally and stay available during partitions." },
      { q: "How would you give read-your-writes in a geo-replicated app?", a: "Route a user's reads to their home region/leader for a short period after writes, or carry a session token with the last write position and only read from replicas that have caught up to it." },
      { q: "What's the difference between serializable and linearizable?", a: "Serializable: concurrent transactions produce a result equal to some serial order — any order, even one inconsistent with real time. Linearizable: single-object operations respect real-time order. Strict serializable gives both." },
      { q: "Is eventual consistency 'no guarantees'?", a: "It guarantees convergence when writes stop, but nothing about how long or what you see meanwhile. In practice it's paired with session guarantees and bounded lag monitoring." },
    ],
    quiz: [
      {
        id: "cm-q1",
        prompt: "Client A's write of x=5 returns OK. Afterwards, client B reads x and gets the old value. Which model is definitely violated?",
        options: ["Eventual consistency", "Linearizability", "Causal consistency", "None"],
        answer: 1,
        explanation: "Linearizability requires any read starting after a write completes to see it. Eventual consistency allows stale reads; causal doesn't relate unconnected clients' operations.",
      },
      {
        id: "cm-q2",
        prompt: "A user posts a comment, refreshes, and the comment is missing. Which guarantee would fix this?",
        options: ["Monotonic writes", "Read-your-writes", "Eventual consistency", "Sequential consistency across all clients"],
        answer: 1,
        explanation: "Read-your-writes ensures a client always sees its own completed writes.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── 16. cap-theorem
  {
    slug: "cap-theorem",
    track: "system-design",
    title: "CAP theorem and PACELC",
    summary:
      "What CAP actually says — during a network partition you must choose between linearizability and availability — why 'CA' isn't a real option, and how PACELC adds the everyday latency-vs-consistency trade-off.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 25,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["system-design/consistency-models", "system-design/replication"],
    related: [
      "system-design/consistency-models",
      "system-design/replication",
      "system-design/sql-vs-nosql",
      "distributed/consensus-basics",
      "system-design/redundancy-failover",
    ],
    tags: ["cap", "pacelc", "partition-tolerance", "availability", "consistency", "linearizability"],
    sources: [
      CHECKLIST,
      { label: "Gilbert & Lynch — Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services (2002)", url: "https://dl.acm.org/doi/10.1145/564585.564601", kind: "external" },
      { label: "Eric Brewer — CAP Twelve Years Later: How the 'Rules' Have Changed (InfoQ/IEEE Computer 2012)", url: "https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/", kind: "external" },
      { label: "Daniel Abadi — Consistency Tradeoffs in Modern Distributed Database System Design (PACELC, 2012)", url: "https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf", kind: "external" },
      { label: "Martin Kleppmann — Please stop calling databases CP or AP", url: "https://martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html", kind: "external" },
      JEPSEN,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "State CAP precisely, including what C, A and P mean in the proof.",
              "Explain why partition tolerance is not optional and 'CA' systems don't exist in distributed settings.",
              "Use PACELC to discuss the latency/consistency trade-off when there's no partition.",
              "Avoid labelling whole databases CP/AP; reason per operation and configuration.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Two bank branches share an account ledger over a phone line. The line goes dead. A customer at branch 1 wants to withdraw. The branch can refuse until the line is back (consistent, not available), or allow it and risk the other branch allowing a second withdrawal too (available, not consistent). There's no third option — that's CAP.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Letter", "Meaning in the theorem", "Common misreading"],
            rows: [
              ["C — Consistency", "Linearizability: every read sees the most recent completed write, as if one copy", "Not ACID's C, not 'eventually correct'"],
              ["A — Availability", "Every request to a non-failed node gets a (non-error) response — eventually, with no time bound", "Not '99.99% uptime'"],
              ["P — Partition tolerance", "The system keeps operating despite arbitrary message loss between nodes", "Not something you can opt out of on a real network"],
            ],
          },
          {
            type: "p",
            text: "**Theorem (Gilbert & Lynch, 2002):** in an asynchronous network where messages can be lost, no system can guarantee both linearizability and availability for every request. So *when a partition happens* you choose: reject/timeout some requests (CP) or answer with possibly stale/divergent data (AP).",
          },
          {
            type: "p",
            text: "**PACELC (Abadi):** if there is a **P**artition, choose **A** or **C**; **E**lse (normal operation), choose **L**atency or **C**onsistency. Even with a healthy network, strong consistency costs coordination round trips.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "Interviewers use CAP to check that you understand the fundamental trade-off of replicated data — and whether you can go beyond the slogan.",
              "Partitions are real: switch failures, misconfigured firewalls, GC pauses that look like network loss, cross-region link outages.",
              "PACELC explains the everyday cost: why a globally consistent write takes 100 ms while a local eventually consistent one takes 2 ms.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "Why the proof works",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Setup", detail: "Two replicas, G1 and G2, hold x=0. The network between them partitions — no messages get through." },
              { title: "Write", detail: "A client writes x=1 to G1. To be available, G1 must acknowledge it." },
              { title: "Read", detail: "Another client reads x from G2. To be available, G2 must answer." },
              { title: "Contradiction", detail: "G2 can't know about x=1, so it returns 0 — not linearizable. The only way to stay consistent is for G1 or G2 to refuse (not available)." },
            ],
          },
          {
            type: "callout",
            tone: "misconception",
            title: "\"Pick two of three\" is misleading",
            text: "You can't trade away P on a network that can partition. CAP is really: during a partition, C or A. When there's no partition, you can have both — and PACELC tells you the price is latency.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Applying it to real systems",
        blocks: [
          {
            type: "table",
            head: ["System / configuration", "During partition (PAC)", "Normal operation (ELC)"],
            rows: [
              ["etcd / ZooKeeper / Consul (consensus)", "PC — minority side refuses writes", "EC — every write needs a majority round trip"],
              ["Spanner", "PC", "EC — TrueTime commit-wait adds a few ms"],
              ["Single-leader Postgres + async replicas", "Leader side keeps working; isolated replicas serve stale reads (not linearizable)", "EL for replica reads, EC for leader reads"],
              ["Cassandra at CL=ONE", "PA", "EL"],
              ["Cassandra at QUORUM/QUORUM", "Minority side can't reach quorum → errors; stronger, though not fully linearizable without LWT", "Pays quorum latency"],
              ["DynamoDB default reads / strongly consistent reads", "Eventually consistent reads favour A; strongly consistent reads may fail", "EL vs EC per request"],
            ],
          },
          {
            type: "p",
            text: "Notice the choices are per *operation* and *configuration*, not per product — which is Kleppmann's argument against labelling databases CP or AP.",
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**CAP's availability is very strict** (every non-failed node must answer). Many 'CP' systems are still highly available in practice because the majority side keeps serving.",
              "**CAP says nothing about latency** — a system that answers after 10 minutes is 'available'. PACELC fills that gap.",
              "**Single-node databases** aren't distributed, so CAP doesn't apply; the moment you add a replica or a cache, it does.",
              "**Partial partitions** (A can reach B, B can reach C, A can't reach C) are common and nastier than clean splits.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Prefer C during partitions", points: ["Money movement, inventory reservations, locks, unique IDs", "A wrong answer is worse than no answer", "Users can retry"] },
              { title: "Prefer A during partitions", points: ["Shopping carts, social feeds, likes, presence", "Stale or merged data is acceptable", "Downtime costs more than reconciliation"] },
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
              "**Design both modes:** what does the user see when the system chooses C (error, retry later, read-only mode) and when it chooses A (reconciliation, conflict UI, compensation)?",
              "**Monitor** quorum health, leader elections, cross-region link errors and conflict rates.",
              "**Failure mode:** an AP system that silently loses writes via last-write-wins during a partition. Track conflicts explicitly.",
              "**Failure mode:** a CP system with too-aggressive timeouts treats GC pauses as partitions and flaps leaders.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "CAP says that when a network partition happens, a replicated system must choose between consistency — in the theorem that means linearizability — and availability, meaning every non-failed node still answers. Partitions aren't optional on real networks, so 'CA' isn't a real choice; the question is what you do during a partition. PACELC extends it: even without partitions you trade latency against consistency, because strong consistency needs coordination. I make that choice per operation — consistent for payments and uniqueness, available for carts and feeds.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Sketch the two-node proof to show you understand *why*.",
              "Point out that C = linearizability and A = every non-failed node responds; both are stricter than everyday usage.",
              "Use PACELC for the more practical day-to-day discussion: quorum/consensus latency vs local reads.",
              "Classify operations, not databases; most stores are tunable.",
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
              "During a partition: consistency (linearizability) or availability — not both.",
              "Partition tolerance is mandatory for distributed systems.",
              "PACELC: else, latency vs consistency.",
              "Choose per operation and design user-visible behaviour for both modes.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Network partition", definition: "A failure where some nodes can't communicate with others while each group keeps running." },
      { term: "CP", definition: "Chooses consistency during partitions: some requests fail rather than return stale data." },
      { term: "AP", definition: "Chooses availability during partitions: all nodes answer, possibly with stale or conflicting data." },
      { term: "PACELC", definition: "If Partition: Availability vs Consistency; Else: Latency vs Consistency." },
      { term: "Quorum", definition: "A majority (or configured count) of replicas needed to proceed." },
    ],
    followUps: [
      { q: "Why can't a distributed system be 'CA'?", a: "Because partitions happen whether you like it or not; a system that assumes no partitions has undefined behaviour when one occurs. 'CA' only describes a single-node system." },
      { q: "Is MongoDB CP or AP?", a: "It depends on configuration: with majority write/read concerns and primary reads, a minority-side primary steps down (CP-like); reading from secondaries gives stale reads (AP-like). Classify the operation, not the product." },
      { q: "What does a CP system do for clients on the minority side?", a: "Return errors or time out for operations needing the quorum; often still serves explicitly stale reads if the application opts in." },
      { q: "How does PACELC influence a multi-region design?", a: "Strongly consistent writes need cross-region coordination (tens to hundreds of ms); if latency matters more, use regional leaders/home regions and asynchronous replication, accepting staleness or conflicts." },
    ],
    quiz: [
      {
        id: "cap-q1",
        prompt: "In the CAP theorem, 'C' means:",
        options: ["ACID consistency (invariants hold)", "Linearizability", "Eventual consistency", "Consistent hashing"],
        answer: 1,
        explanation: "Gilbert and Lynch's proof uses atomic/linearizable consistency.",
      },
      {
        id: "cap-q2",
        prompt: "According to PACELC, what does a strongly consistent system trade when there's no partition?",
        options: ["Durability", "Latency", "Partition tolerance", "Nothing"],
        answer: 1,
        explanation: "Coordination for consistency adds round trips, so you pay latency even in normal operation.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── 17. locks-transactions-isolation
  {
    slug: "locks-transactions-isolation",
    track: "system-design",
    title: "Locks, transactions and isolation levels",
    summary:
      "ACID, the four SQL isolation levels and the anomalies each allows (dirty reads, non-repeatable reads, phantoms, lost updates, write skew), MVCC, pessimistic vs optimistic concurrency, and how PostgreSQL and MySQL actually behave.",
    level: "advanced",
    frequency: "very-high",
    minutes: 40,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["system-design/sql-vs-nosql"],
    related: [
      "databases/transactions-acid",
      "system-design/consistency-models",
      "system-design/multithreading-parallelism",
      "system-design/api-idempotency",
      "distributed/distributed-transactions",
      "go/mutex",
      "os/synchronization",
    ],
    tags: ["transactions", "acid", "isolation-levels", "mvcc", "locking", "optimistic-locking", "write-skew", "postgres", "mysql"],
    sources: [
      CHECKLIST,
      PG_ISOLATION,
      { label: "PostgreSQL docs — Explicit Locking", url: "https://www.postgresql.org/docs/current/explicit-locking.html", kind: "docs" },
      { label: "MySQL 8.0 docs — InnoDB Transaction Isolation Levels", url: "https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html", kind: "docs" },
      { label: "Berenson et al. — A Critique of ANSI SQL Isolation Levels (SIGMOD 1995)", url: "https://www.microsoft.com/en-us/research/publication/a-critique-of-ansi-sql-isolation-levels/", kind: "external" },
      { label: "Hermitage — testing transaction isolation levels (Kleppmann)", url: "https://github.com/ept/hermitage", kind: "external" },
      DDIA,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain each ACID property in concrete terms.",
              "Name the five classic anomalies and which isolation levels prevent them.",
              "Explain MVCC and snapshot isolation, and why snapshot isolation still allows write skew.",
              "Choose between pessimistic locking, optimistic concurrency, atomic updates and SERIALIZABLE.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A transaction is an 'all or nothing' envelope around several changes. Isolation answers: while my envelope is open, how much can I see of other people's half-finished envelopes — and can two envelopes based on the same old information both be accepted? Higher isolation means fewer surprises and more waiting or retrying.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Property", "Meaning", "Mechanism"],
            rows: [
              ["Atomicity", "All of a transaction's writes happen, or none do", "Undo/redo logging, abort/rollback"],
              ["Consistency", "Application invariants (constraints) hold before and after", "Constraints + correct application logic"],
              ["Isolation", "Concurrent transactions don't interfere beyond what the level permits", "Locks, MVCC, SSI"],
              ["Durability", "Committed data survives crashes", "Write-ahead log flushed (fsync) at commit, replication"],
            ],
          },
          {
            type: "table",
            head: ["Anomaly", "What happens"],
            rows: [
              ["Dirty read", "T1 reads T2's uncommitted change; T2 rolls back"],
              ["Non-repeatable read", "T1 reads a row twice and gets different values because T2 committed an update in between"],
              ["Phantom", "T1 re-runs a range query and sees new/removed rows committed by T2"],
              ["Lost update", "T1 and T2 both read x=10, both write x+1; final x=11 instead of 12"],
              ["Write skew", "T1 and T2 read the same overlapping data, each updates a *different* row based on what it read, and together they violate an invariant"],
            ],
          },
          {
            type: "table",
            head: ["Level (ANSI name)", "Dirty read", "Non-repeatable", "Phantom", "Lost update", "Write skew"],
            rows: [
              ["Read uncommitted", "Allowed by ANSI (never in PostgreSQL)", "Allowed", "Allowed", "Allowed", "Allowed"],
              ["Read committed", "Prevented", "Allowed", "Allowed", "Allowed", "Allowed"],
              ["Repeatable read", "Prevented", "Prevented", "Allowed by ANSI; prevented in PostgreSQL", "Prevented in PostgreSQL (abort); possible in MySQL for plain read-then-write", "Allowed"],
              ["Serializable", "Prevented", "Prevented", "Prevented", "Prevented", "Prevented"],
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "PostgreSQL vs MySQL InnoDB",
            text: "PostgreSQL's default is **Read Committed**; MySQL InnoDB's default is **Repeatable Read**. PostgreSQL treats Read Uncommitted as Read Committed, so dirty reads never happen. PostgreSQL's Repeatable Read is snapshot isolation: no phantoms, and a concurrent update to a row you're updating aborts with a serialization error. Its Serializable uses Serializable Snapshot Isolation (SSI, since 9.1), which also detects write skew. InnoDB's Repeatable Read gives plain SELECTs a consistent snapshot, but locking reads and UPDATEs see the latest committed rows and use next-key (gap) locks; InnoDB Serializable turns plain SELECTs into locking reads when autocommit is off.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "Most concurrency bugs in web apps are lost updates and write skew hidden behind 'it worked in testing'.",
              "Default isolation levels are weaker than serializable for performance — you must know what your database allows.",
              "Interviewers probe double-booking, overselling and double-spending scenarios that hinge on this.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "MVCC and locking",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "MVCC", detail: "Updates create a new row version instead of overwriting; each version records which transaction created (and deleted) it. Readers pick the versions visible to their snapshot, so readers don't block writers and writers don't block readers." },
              { title: "Snapshot timing", detail: "Read Committed takes a new snapshot per statement; Repeatable Read/snapshot isolation takes one snapshot for the whole transaction." },
              { title: "Write-write conflicts", detail: "Writers still lock rows they modify; a second writer waits. Under snapshot isolation, when the first commits, the second aborts (first-committer-wins) instead of overwriting." },
              { title: "Garbage", detail: "Old versions must be cleaned up: VACUUM in Postgres, purge of undo logs in InnoDB. Long-running transactions prevent cleanup and cause bloat." },
              { title: "Serializable", detail: "Either strict two-phase locking (hold read and write locks until commit — classic, blocks a lot) or SSI (track read/write dependencies and abort transactions that would form a dangerous cycle)." },
              { title: "Deadlocks", detail: "Two transactions each wait for a lock the other holds. Databases detect cycles and abort one; apps must retry. Lock rows in a consistent order to reduce them." },
            ],
          },
          {
            type: "compare",
            items: [
              { title: "Pessimistic (lock first)", points: ["SELECT … FOR UPDATE, advisory locks", "Blocks conflicting transactions", "Good under high contention on few rows", "Risk: deadlocks, long lock waits"] },
              { title: "Optimistic (check at commit)", points: ["Version column + conditional UPDATE, or SERIALIZABLE/SSI", "No blocking; conflicts cause retries", "Good under low contention", "Risk: retry storms under contention"] },
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Fixing lost updates and write skew",
        blocks: [
          {
            type: "code",
            lang: "sql",
            caption: "Lost update and three fixes",
            code: `-- BUG (read-modify-write in the app at READ COMMITTED):
SELECT stock FROM products WHERE id = 7;          -- both txns read 10
UPDATE products SET stock = 9 WHERE id = 7;       -- both write 9

-- Fix 1: atomic update in the database
UPDATE products SET stock = stock - 1 WHERE id = 7 AND stock > 0;

-- Fix 2: pessimistic lock
BEGIN;
SELECT stock FROM products WHERE id = 7 FOR UPDATE;  -- second txn waits here
UPDATE products SET stock = stock - 1 WHERE id = 7;
COMMIT;

-- Fix 3: optimistic concurrency with a version column
UPDATE products SET stock = 9, version = version + 1
WHERE id = 7 AND version = 41;   -- 0 rows updated => someone else won; retry`,
          },
          {
            type: "steps",
            steps: [
              { title: "Write skew scenario", detail: "Rule: at least one doctor must be on call. Alice and Bob are both on call. Each starts a transaction, checks `SELECT count(*) FROM on_call WHERE shift = 1` → 2, and removes themselves." },
              { title: "Under snapshot isolation", detail: "They update *different* rows, so there's no write-write conflict. Both commit; zero doctors on call." },
              { title: "Fixes", detail: "Run at SERIALIZABLE (Postgres SSI aborts one); or lock the rows read with `SELECT … FOR UPDATE`; or materialise the conflict (lock a `shift` row both must update); or enforce with a constraint where possible." },
            ],
          },
        ],
      },
      {
        id: "examples",
        title: "Production patterns",
        blocks: [
          {
            type: "table",
            head: ["Problem", "Pattern"],
            rows: [
              ["Prevent overselling", "Conditional atomic decrement (`WHERE stock >= qty`) and check affected rows"],
              ["Double booking a seat/room", "Unique constraint on (resource, slot), or an exclusion constraint for time ranges (Postgres)"],
              ["Edit conflicts in a UI", "Optimistic version / ETag; return 409/412 on mismatch"],
              ["Job queue in SQL", "`SELECT … FOR UPDATE SKIP LOCKED` so workers don't block each other"],
              ["Complex invariants across rows", "SERIALIZABLE with automatic retry on serialization failures"],
              ["Cross-service consistency", "No distributed lock across DBs if avoidable: sagas + idempotency + outbox"],
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Serialization failures are normal at SERIALIZABLE** — the app must retry the whole transaction (and therefore side effects must not happen inside it).",
              "**Long transactions** hold locks, block vacuum/purge and increase conflict rates; keep transactions short and never wait on user input or external HTTP calls inside one.",
              "**Gap locks in MySQL** can block inserts into ranges unexpectedly and cause deadlocks.",
              "**ORMs hide isolation:** a 'save' that re-reads and writes the whole entity is a classic lost-update source.",
              "**Distributed locks (e.g. in Redis) are leases:** a paused client can wake up after its lock expired — use fencing tokens for correctness.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Choice", "Use when", "Cost"],
            rows: [
              ["Read committed + atomic updates", "Most CRUD; simple counters/decrements", "Must spot read-modify-write patterns"],
              ["Repeatable read / snapshot", "Reports and multi-read consistency within a txn", "Write skew possible; retries on conflicts (Postgres)"],
              ["Serializable", "Complex invariants, financial logic", "More aborts/retries; some throughput loss"],
              ["Explicit row locks", "Hot rows with high contention", "Blocking, deadlock risk"],
              ["Optimistic versions", "Low contention, long user think-time", "Retries / user-facing conflict handling"],
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
              "**Monitor:** lock wait time, deadlock count, serialization failure rate, long-running transactions (`pg_stat_activity` xact_start), MVCC bloat / history list length (InnoDB).",
              "**Failure mode:** one forgotten open transaction ('idle in transaction') blocks vacuum and DDL for hours; set `idle_in_transaction_session_timeout`.",
              "**Failure mode:** a migration takes an ACCESS EXCLUSIVE lock and queues every query behind it; set `lock_timeout` for DDL.",
              "**Testing:** concurrency bugs need concurrent tests (run the race many times) — Hermitage shows how each database actually behaves.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Transactions give atomicity, consistency, isolation and durability. Isolation levels trade safety for concurrency: read committed prevents dirty reads, repeatable read or snapshot isolation also prevents non-repeatable reads, and serializable prevents everything including write skew. Postgres defaults to read committed and MySQL InnoDB to repeatable read, both using MVCC so readers don't block writers. For lost updates I prefer atomic conditional updates or optimistic version checks; I use SELECT FOR UPDATE for hot contended rows, and SERIALIZABLE with retries when invariants span multiple rows.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Snapshot isolation prevents lost updates (first-committer-wins) but not write skew; SSI adds dependency tracking to catch it.",
              "Isolation names differ by vendor — always check the docs (Postgres RR ≠ MySQL RR).",
              "Keep transactions short, idempotent and retryable; never include external side effects.",
              "Across services, replace distributed transactions with sagas, outbox and idempotency keys.",
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
              "ACID: all-or-nothing, invariants, isolation, durability.",
              "Anomalies: dirty read, non-repeatable read, phantom, lost update, write skew.",
              "MVCC = snapshots; snapshot isolation still allows write skew.",
              "Defaults: Postgres Read Committed, MySQL InnoDB Repeatable Read.",
              "Fix races with atomic updates, locks, version checks or SERIALIZABLE + retry.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "MVCC", definition: "Multi-version concurrency control: keeping multiple row versions so readers see a consistent snapshot without locking." },
      { term: "Snapshot isolation", definition: "Each transaction reads from a snapshot taken at its start; write-write conflicts abort one transaction." },
      { term: "SSI", definition: "Serializable Snapshot Isolation: snapshot isolation plus detection of dangerous read/write dependency patterns." },
      { term: "Write skew", definition: "Two transactions read overlapping data and write different rows, jointly breaking an invariant." },
      { term: "Next-key lock", definition: "InnoDB lock on an index record plus the gap before it, used to prevent phantoms." },
      { term: "Fencing token", definition: "A monotonically increasing number issued with a lock so storage can reject writes from stale lock holders." },
    ],
    followUps: [
      { q: "Why doesn't repeatable read prevent write skew?", a: "Each transaction sees a consistent snapshot and writes a different row, so there's no write-write conflict to detect; the invariant depends on rows both read but neither wrote. Serializable (SSI or locking reads) is needed." },
      { q: "How would you prevent two users from booking the same seat?", a: "A unique constraint on (event_id, seat_id) in the bookings table — the database guarantees only one insert succeeds; the loser gets a constraint violation and a friendly error." },
      { q: "Optimistic or pessimistic locking for a flash sale on one product?", a: "High contention on one row makes optimistic retries thrash; use an atomic conditional decrement (or a queue/reservation system). Optimistic works for low-contention edits." },
      { q: "What happens to a transaction that hits a serialization failure in Postgres?", a: "It's aborted with SQLSTATE 40001; the application must retry the entire transaction from the start, ideally with backoff." },
      { q: "Can you use Redis locks for correctness?", a: "Only with care: a lock is a lease that can expire while the holder is paused, so another client may also act. For correctness, pass a fencing token to the storage layer and reject stale tokens — or use the database's own constraints and transactions." },
    ],
    quiz: [
      {
        id: "tx-q1",
        prompt: "Two transactions each read stock=10 and write stock=9. Which anomaly is this?",
        options: ["Dirty read", "Phantom", "Lost update", "Write skew"],
        answer: 2,
        explanation: "Both read-modify-write the same row and one update overwrites the other.",
      },
      {
        id: "tx-q2",
        prompt: "What is PostgreSQL's default isolation level?",
        options: ["Read uncommitted", "Read committed", "Repeatable read", "Serializable"],
        answer: 1,
        explanation: "PostgreSQL defaults to Read Committed; MySQL InnoDB defaults to Repeatable Read.",
      },
      {
        id: "tx-q3",
        prompt: "Which level prevents write skew in PostgreSQL?",
        options: ["Read committed", "Repeatable read", "Serializable", "None"],
        answer: 2,
        explanation: "PostgreSQL's Serializable uses SSI, which detects and aborts transactions that would produce write skew.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── 18. multithreading-parallelism
  {
    slug: "multithreading-parallelism",
    track: "system-design",
    title: "Multithreading, parallelism and concurrency models",
    summary:
      "Processes vs threads vs async event loops vs green threads, concurrency vs parallelism, Amdahl's law, and why contention — not core count — usually limits how far a service scales on one machine.",
    level: "intermediate",
    frequency: "high",
    minutes: 30,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["system-design/latency-throughput"],
    related: [
      "os/processes-threads",
      "os/synchronization",
      "go/concurrency-vs-parallelism",
      "go/gmp-scheduler",
      "go/mutex",
      "nodejs/node-event-loop",
      "nodejs/worker-threads",
      "system-design/locks-transactions-isolation",
    ],
    tags: ["concurrency", "parallelism", "threads", "processes", "async", "event-loop", "amdahl", "contention"],
    sources: [
      CHECKLIST,
      { label: "Amdahl's law (overview)", url: "https://en.wikipedia.org/wiki/Amdahl%27s_law", kind: "external" },
      { label: "Rob Pike — Concurrency is not Parallelism (Go blog)", url: "https://go.dev/blog/waza-talk", kind: "external" },
      { label: "Node.js docs — The Node.js Event Loop", url: "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick", kind: "docs" },
      { label: "Universal Scalability Law (Neil Gunther)", url: "http://www.perfdynamics.com/Manifesto/USLscalability.html", kind: "external" },
      SRE,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Distinguish concurrency (dealing with many things) from parallelism (doing many things at once).",
              "Compare processes, OS threads, async event loops and green threads/goroutines.",
              "Use Amdahl's law to bound speedup and explain contention and coherence costs.",
              "Choose a concurrency model for CPU-bound vs I/O-bound services.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "One chef juggling five dishes — chopping while water boils — is concurrency. Five chefs each cooking a dish at the same time is parallelism. Five chefs sharing one oven is contention: adding a sixth chef doesn't help if everyone waits for the oven.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Model", "Unit", "Memory", "Switch cost", "Examples"],
            rows: [
              ["Processes", "OS process", "Isolated address spaces", "Highest (kernel, TLB)", "Pre-fork servers, Python multiprocessing, PostgreSQL backends"],
              ["OS threads", "Kernel thread", "Shared heap, own stack (~MBs reserved)", "Kernel context switch (µs)", "Java/C++ thread pools, MySQL connection threads"],
              ["Async event loop", "Callbacks/promises on one thread", "Shared, single-threaded", "Very low (no kernel switch)", "Node.js, NGINX workers, Python asyncio, Redis core"],
              ["Green threads / goroutines", "User-space tasks on M:N scheduler", "Small growable stacks (Go starts at a few KB)", "Low (user-space)", "Go, Erlang/Elixir processes, Java virtual threads (21+)"],
            ],
          },
          {
            type: "p",
            text: "**Amdahl's law:** if a fraction p of the work can be parallelised across n cores, speedup = 1 / ((1 − p) + p/n). The serial part caps speedup at 1 / (1 − p) no matter how many cores you add.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "The concurrency model decides how many simultaneous connections a server handles and how it uses cores.",
              "I/O-bound services (most web APIs) need concurrency; CPU-bound work (image processing, compression, ML inference) needs parallelism.",
              "Serial sections — locks, a single DB row, a single-threaded component — limit scaling within a machine *and* across machines.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "Where the time goes",
        blocks: [
          {
            type: "table",
            head: ["p (parallel fraction)", "4 cores", "16 cores", "∞ cores"],
            rows: [
              ["50%", "1.6×", "1.9×", "2×"],
              ["90%", "3.1×", "6.4×", "10×"],
              ["95%", "3.5×", "9.1×", "20×"],
              ["99%", "3.9×", "13.9×", "100×"],
            ],
          },
          {
            type: "list",
            items: [
              "**Lock contention:** threads queue for a mutex; the critical section becomes the serial fraction.",
              "**Cache coherence:** cores writing the same cache line bounce it between caches; *false sharing* happens when unrelated variables share a 64-byte line.",
              "**Context switching:** too many runnable threads waste CPU on switching and thrash caches.",
              "**Coordination (USL):** the Universal Scalability Law adds a coherence term — throughput can *decrease* after a point as nodes spend time agreeing.",
              "**Event loop blocking:** one CPU-heavy callback stalls every connection on that loop.",
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "Runtime specifics matter: CPython's GIL stops threads from running Python bytecode in parallel (a free-threaded build is experimental from Python 3.13); Node.js runs JavaScript on one thread per isolate but offloads some I/O and crypto to libuv's thread pool; Go multiplexes goroutines onto GOMAXPROCS OS threads with a work-stealing scheduler.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Example: sizing a thumbnail service",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Profile", detail: "Each request: 40 ms download from object storage (I/O), 60 ms resize (CPU), 10 ms upload (I/O)." },
              { title: "CPU bound part", detail: "On an 8-core machine, CPU can do at most 8 × (1000 / 60) ≈ 133 resizes/s." },
              { title: "Concurrency needed", detail: "Little's law: 133 req/s × 0.11 s ≈ 15 requests in flight — so ~15–20 concurrent tasks keep CPUs busy while others wait on I/O." },
              { title: "Model", detail: "Async I/O (or goroutines) for downloads/uploads + a bounded worker pool of ~8 for resizing. More than 8 CPU workers only adds context switching." },
              { title: "Scale", detail: "Beyond 133 req/s per box, scale horizontally; the work is embarrassingly parallel (p ≈ 1 across machines)." },
            ],
          },
        ],
      },
      {
        id: "examples",
        title: "Concurrency patterns",
        blocks: [
          {
            type: "table",
            head: ["Pattern", "Use"],
            rows: [
              ["Bounded worker pool", "Cap CPU-bound parallelism at ~core count; apply backpressure"],
              ["Fan-out / fan-in", "Call several dependencies in parallel, combine results (watch tail latency)"],
              ["Producer–consumer queue", "Decouple stages with different speeds"],
              ["Sharded state / per-core partitioning", "Avoid shared locks (e.g. per-shard counters merged on read)"],
              ["Immutable data + message passing", "Avoid shared mutable state entirely (actors, Go channels)"],
              ["Lock-free / atomics", "Hot counters and queues where locks are too costly"],
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Race conditions** — unsynchronised shared writes; detect with race detectors (Go `-race`, TSan).",
              "**Deadlocks** — circular lock waits; acquire locks in a consistent global order.",
              "**Thread-pool starvation** — blocking calls inside a small async/thread pool block everything (e.g. sync file I/O in Node's main thread).",
              "**Unbounded concurrency** — spawning a goroutine/thread per item without limits exhausts memory, file descriptors or downstream capacity.",
              "**Hyper-threads ≠ cores** — SMT siblings share execution units; CPU-bound speedup is less than the vCPU count suggests.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Event loop / async", points: ["Excellent for many I/O-bound connections", "Low memory per connection", "CPU work blocks everyone — offload it", "Callback/async colouring complexity"] },
              { title: "Threads / goroutines", points: ["Natural blocking code style", "Use multiple cores directly", "Shared memory needs synchronisation", "OS threads cost memory; goroutines/virtual threads are cheap"] },
              { title: "Processes", points: ["Isolation: a crash doesn't take others down", "Multi-core even with a GIL", "Higher memory; IPC needed to share"] },
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
              "**Monitor:** CPU utilisation and run-queue length, event-loop lag (Node), goroutine count, thread-pool queue depth, lock wait/mutex profiles, context switches.",
              "**Container gotcha:** runtimes may see host cores instead of the container's CPU quota (e.g. set GOMAXPROCS to the quota; newer runtimes detect it), leading to throttling.",
              "**Failure mode:** CPU throttling under cgroup quotas causes latency spikes even at modest average CPU.",
              "**Cost:** CPU-bound services scale with cores (pay per core); I/O-bound services benefit more from better concurrency than bigger machines.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Concurrency is structuring a program to handle many tasks that overlap in time; parallelism is actually executing them simultaneously on multiple cores. I/O-bound services need concurrency — event loops, goroutines or thread pools — while CPU-bound work needs parallelism up to the core count. Amdahl's law says the serial fraction caps speedup: with 90% parallel work you can never exceed 10×. In practice contention on locks, shared cache lines, connection pools or a hot database row is what stops scaling, so I partition state, keep critical sections small and bound concurrency with worker pools.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Size pools from Little's law for I/O-bound work and core count for CPU-bound work.",
              "Contention, coherence and context switching explain sub-linear (or negative) scaling — USL models this.",
              "Choose runtime-appropriate models: Node offloads CPU work to worker threads; Go uses goroutines with bounded pools; Python uses processes for CPU parallelism.",
              "The same reasoning applies to distributed systems: a single leader or a global lock is the serial fraction of the whole cluster.",
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
              "Concurrency = structure; parallelism = simultaneous execution.",
              "Processes isolate, threads share, event loops multiplex, goroutines are cheap M:N tasks.",
              "Amdahl: speedup ≤ 1 / serial fraction.",
              "Contention — not core count — usually limits scaling.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Concurrency", definition: "Multiple tasks making progress in overlapping time periods, not necessarily simultaneously." },
      { term: "Parallelism", definition: "Multiple tasks executing at the same instant on different cores." },
      { term: "Amdahl's law", definition: "Speedup = 1 / ((1 − p) + p/n), bounding gains from parallelising a fraction p of work." },
      { term: "Contention", definition: "Multiple threads competing for the same resource (lock, cache line, connection)." },
      { term: "False sharing", definition: "Performance loss when independent variables on the same cache line are written by different cores." },
      { term: "Event-loop lag", definition: "Delay between when a callback should run and when it actually runs, indicating a blocked loop." },
    ],
    followUps: [
      { q: "Why can Node.js handle 10k connections on one thread?", a: "Its I/O is non-blocking: the event loop registers interest with the OS (epoll/kqueue) and runs callbacks when data is ready, so idle connections cost little. It breaks down when a callback does heavy CPU work." },
      { q: "Your service uses 8 threads but only 2.5 cores are busy. Why?", a: "Threads are probably blocked: on I/O, on a contended lock, on a small connection pool, or on a single-threaded dependency. Profile lock waits and blocking calls; more threads won't help until the bottleneck is removed." },
      { q: "What's the maximum speedup if 5% of the work is serial?", a: "1 / 0.05 = 20×, regardless of core count." },
      { q: "Threads or processes for a CPU-heavy Python service?", a: "Processes (multiprocessing or multiple workers), because the GIL in standard CPython prevents threads from executing Python bytecode in parallel; or move the hot loop into native code that releases the GIL." },
      { q: "How do goroutines differ from OS threads?", a: "They're scheduled in user space by the Go runtime onto a small number of OS threads, start with small growable stacks, and are cheap to create — so you can have hundreds of thousands. Blocking syscalls are handled by handing the P to another thread." },
    ],
    quiz: [
      {
        id: "mt-q1",
        prompt: "90% of a job is parallelisable. Roughly what speedup do 16 cores give?",
        options: ["16×", "~6.4×", "~10×", "~1.9×"],
        answer: 1,
        explanation: "1 / (0.1 + 0.9/16) = 1 / 0.15625 ≈ 6.4×.",
      },
      {
        id: "mt-q2",
        prompt: "A Node.js API's latency spikes for all users whenever one endpoint generates a large PDF. Best fix?",
        options: ["Add more event loop phases", "Move PDF generation to a worker thread or a background job", "Increase the HTTP keep-alive timeout", "Use more promises"],
        answer: 1,
        explanation: "CPU-heavy work blocks the single JavaScript thread; offloading it keeps the event loop responsive.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── 19. api-idempotency
  {
    slug: "api-idempotency",
    track: "system-design",
    title: "API idempotency",
    summary:
      "Making retries safe: idempotent HTTP methods, idempotency keys for POST, how to store and replay responses atomically, handling concurrent duplicates, and idempotent message consumers.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 30,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["system-design/locks-transactions-isolation"],
    related: [
      "system-design/circuit-breakers-timeouts-retries",
      "system-design/delivery-semantics",
      "system-design/rate-limiting",
      "system-design/rest-api-design",
      "distributed/idempotency-patterns",
      "backend/webhooks-dlq",
    ],
    tags: ["idempotency", "idempotency-key", "retries", "exactly-once", "payments", "http-methods"],
    sources: [
      CHECKLIST,
      { label: "Stripe Engineering — Designing robust and predictable APIs with idempotency", url: "https://stripe.com/blog/idempotency", kind: "external" },
      { label: "Stripe API reference — Idempotent requests", url: "https://docs.stripe.com/api/idempotent_requests", kind: "docs" },
      { label: "AWS Builders' Library — Making retries safe with idempotent APIs", url: "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/", kind: "external" },
      AWS_TIMEOUTS,
      { label: "IETF draft — The Idempotency-Key HTTP Header Field", url: "https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/", kind: "docs" },
      { label: "RFC 9110 §9.2.2 — Idempotent Methods", url: "https://www.rfc-editor.org/rfc/rfc9110#section-9.2.2", kind: "docs" },
      { label: "Brandur Leach — Implementing Stripe-like Idempotency Keys in Postgres", url: "https://brandur.org/idempotency-keys", kind: "external" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Define idempotency and know which HTTP methods are idempotent by specification.",
              "Design an idempotency-key mechanism for POST endpoints (storage, TTL, fingerprinting, replay).",
              "Handle concurrent duplicates and partial failures correctly.",
              "Make queue consumers idempotent under at-least-once delivery.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Pressing a lift call button five times doesn't summon five lifts — that's idempotent. Pressing 'Pay' on a flaky connection and not knowing whether it went through is the opposite: the safe action (retry) could charge you twice. Idempotency makes 'retry' always safe.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "An operation is **idempotent** if performing it multiple times has the same effect on the server as performing it once. (The *response* may differ — a second DELETE might return 404 — but the state is the same.)",
          },
          {
            type: "table",
            head: ["HTTP method", "Safe (no state change)", "Idempotent (RFC 9110)"],
            rows: [
              ["GET, HEAD, OPTIONS, TRACE", "Yes", "Yes"],
              ["PUT (replace resource)", "No", "Yes"],
              ["DELETE", "No", "Yes"],
              ["POST (create / action)", "No", "No — needs an idempotency key"],
              ["PATCH", "No", "Not guaranteed (`increment` isn't; `set field` can be)"],
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
              "Networks fail ambiguously: a timeout doesn't tell you whether the server processed the request.",
              "Retries are everywhere — clients, SDKs, load balancers, service meshes, queue redelivery — so duplicates *will* happen.",
              "Without idempotency, you can't safely retry; with it, at-least-once delivery becomes effectively-once processing.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "How an idempotency-key store works",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Client generates a key", detail: "A unique value (UUID) per *logical* operation, sent as `Idempotency-Key: 7f9c…`. Retries of the same operation reuse the key; a new operation gets a new key." },
              { title: "Server claims the key atomically", detail: "Insert `(key, user_id, request_hash, status='in_progress')` with a unique constraint. If the insert succeeds, this request owns the operation." },
              { title: "Duplicate arrives while in progress", detail: "The insert conflicts and status is in_progress → return 409 Conflict (or wait briefly)." },
              { title: "Duplicate arrives after completion", detail: "Return the stored status code and body — the same response as the first time." },
              { title: "Mismatched payload", detail: "Same key, different request fingerprint → reject (e.g. 422), because the client is misusing the key." },
              { title: "Completion", detail: "Store the response and mark completed in the same transaction as the business write where possible, so the two can't diverge." },
              { title: "Expiry", detail: "Keep keys for a retry window (Stripe documents keys being eligible for removal after at least 24 hours), then delete." },
            ],
          },
          {
            type: "code",
            lang: "sql",
            caption: "Conceptual schema and claim (PostgreSQL)",
            code: `CREATE TABLE idempotency_keys (
  user_id        BIGINT      NOT NULL,
  key            TEXT        NOT NULL,
  request_hash   BYTEA       NOT NULL,
  status         TEXT        NOT NULL,      -- in_progress | completed
  response_code  INT,
  response_body  JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, key)
);

-- claim: returns a row only if we are first
INSERT INTO idempotency_keys (user_id, key, request_hash, status)
VALUES ($1, $2, $3, 'in_progress')
ON CONFLICT (user_id, key) DO NOTHING
RETURNING key;`,
          },
        ],
      },
      {
        id: "walkthrough",
        title: "A payment with a lost response",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Attempt 1", detail: "Client POSTs /payments with key K. Server claims K, charges the card, stores {201, payment_id=p_1} under K, commits. The response is lost in the network." },
              { title: "Client times out", detail: "It can't tell success from failure, so it retries with the *same* key K after backoff with jitter." },
              { title: "Attempt 2", detail: "Server finds K completed with a matching request hash and returns the stored 201 with p_1. No second charge." },
              { title: "External side effects", detail: "If the charge goes to a payment processor, pass an idempotency key to *it* too (derived from K), so a crash between 'charged' and 'recorded' is also safe on retry." },
            ],
          },
          {
            type: "flow",
            nodes: ["Client (key K)", "API: claim K", "Business txn + store response", "Downstream call with derived key", "Response (replayed on retry)"],
          },
        ],
      },
      {
        id: "examples",
        title: "Other ways to get idempotency",
        blocks: [
          {
            type: "table",
            head: ["Technique", "Example"],
            rows: [
              ["Natural keys + unique constraint", "`INSERT … ON CONFLICT DO NOTHING` on (order_id) — a duplicate create becomes a no-op"],
              ["Set, don't increment", "`status = 'shipped'` is idempotent; `count = count + 1` isn't"],
              ["Conditional writes", "`UPDATE … WHERE version = 7` or If-Match ETags"],
              ["Client-generated resource IDs", "PUT /orders/{client_uuid} — retries replace the same resource"],
              ["Consumer dedup table", "Record processed message IDs in the same transaction as the side effect"],
              ["Outbox pattern", "Write the event in the same DB transaction; the relay may resend, consumers dedupe"],
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Crash after side effect, before recording:** the key stays in_progress; on retry you don't know whether the work happened. Use the same transaction for both, or make the side effect itself idempotent (downstream keys), or reconcile with the downstream system.",
              "**Key scope:** scope keys per user/account so one client can't collide with or probe another's keys.",
              "**Errors:** decide which outcomes are stored. Validation errors and successes are usually replayed; transient 5xx failures typically release the key so a retry can try again.",
              "**TTL shorter than retry window** turns a late retry into a duplicate.",
              "**Dedup in a cache only** (e.g. Redis without persistence) can forget keys on failover — acceptable for some cases, not for payments.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Require idempotency keys when", points: ["Creating money movements, orders, messages, bookings", "Clients retry on timeouts", "Operations trigger external side effects"] },
              { title: "Simpler alternatives suffice when", points: ["The operation is naturally idempotent (PUT, set-state)", "A natural unique key exists", "Duplicates are harmless (analytics pings)"] },
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
              "**Monitor:** replayed-response rate, 409 in-progress conflicts, key-mismatch errors, stuck in_progress keys, idempotency table size.",
              "**Cost:** one extra write (and index) per mutating request; prune expired keys in batches.",
              "**Failure mode:** clients generating a new key per retry (bug) → duplicates. SDKs should generate and reuse keys automatically.",
              "**Combine** with retries using exponential backoff and jitter, and with timeouts shorter than the caller's deadline.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Idempotent means repeating an operation has the same effect as doing it once. GET, PUT and DELETE are idempotent by definition, but POST isn't, so for creates and payments the client sends an idempotency key per logical operation. The server atomically claims the key with a unique constraint, does the work and stores the response in the same transaction, and on a retry returns the stored response; a duplicate that arrives while the first is still running gets a 409. Keys are scoped per client, tied to a request fingerprint and expire after the retry window. Consumers of at-least-once queues dedupe the same way.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Idempotency is what turns at-least-once delivery into effectively-once processing; exactly-once *delivery* isn't achievable over unreliable networks.",
              "The atomicity boundary matters: business write + key record in one transaction, and downstream calls must carry their own idempotency keys.",
              "Design error semantics: which failures are stored vs released for retry.",
              "Idempotency keys complement, not replace, natural uniqueness constraints.",
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
              "Retries are inevitable; idempotency makes them safe.",
              "GET/PUT/DELETE idempotent; POST needs an Idempotency-Key.",
              "Claim key atomically → do work → store response → replay on duplicates.",
              "Propagate idempotency to downstream systems and queue consumers.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Idempotent", definition: "Applying an operation multiple times yields the same server state as applying it once." },
      { term: "Idempotency key", definition: "A client-generated unique token identifying one logical operation across retries." },
      { term: "Request fingerprint", definition: "A hash of the request body/parameters used to detect key reuse with different input." },
      { term: "At-least-once delivery", definition: "Messages may be delivered more than once but are never lost (if retried)." },
      { term: "Effectively-once", definition: "At-least-once delivery combined with idempotent processing, so effects happen once." },
    ],
    followUps: [
      { q: "Why can't the server just detect duplicate payments by amount and card?", a: "Two identical legitimate payments are possible (buying two coffees). Only the client knows whether a request is a retry of the same intent, which is what the key encodes." },
      { q: "What should happen if a retry arrives while the first request is still processing?", a: "Don't process it concurrently. Return 409 (the client retries later) or block until the first finishes and replay its response." },
      { q: "How long should you keep idempotency keys?", a: "At least as long as clients may retry, including offline/mobile clients and queued jobs — commonly 24 hours to a few days — then expire them to bound storage." },
      { q: "How do you make a Kafka consumer idempotent?", a: "Derive a unique ID per message (or business key), record it in a processed table in the same transaction as the side effect, and skip messages already recorded; or make the side effect an upsert keyed by that ID." },
      { q: "Is PUT always idempotent in practice?", a: "By specification yes, but only if your implementation replaces state deterministically; a PUT handler that appends to a list or sends an email each time violates the contract." },
    ],
    quiz: [
      {
        id: "idem-q1",
        prompt: "Which HTTP method is NOT idempotent by specification?",
        options: ["PUT", "DELETE", "POST", "GET"],
        answer: 2,
        explanation: "POST is neither safe nor idempotent per RFC 9110; PUT, DELETE and GET are idempotent.",
      },
      {
        id: "idem-q2",
        prompt: "A client retries with the same idempotency key but a different amount. Best response?",
        options: ["Process it as a new payment", "Return the original response", "Reject it as a key reuse with a mismatched request", "Ignore the key and process normally"],
        answer: 2,
        explanation: "The fingerprint mismatch means the client is misusing the key; silently replaying or processing would hide a bug.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── 20. rate-limiting
  {
    slug: "rate-limiting",
    track: "system-design",
    title: "Rate limiting",
    summary:
      "Protecting services and enforcing fairness: token bucket, leaky bucket, fixed window, sliding log and sliding window counter algorithms; distributed rate limiting with Redis; where to enforce; and how to communicate limits to clients.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 35,
    kinds: ["theory", "visualization", "system-design"],
    status: "authored",
    prerequisites: ["system-design/latency-throughput", "system-design/caching-strategies"],
    related: [
      "system-design/api-idempotency",
      "system-design/backpressure",
      "system-design/circuit-breakers-timeouts-retries",
      "system-design/load-balancing-algorithms",
      "system-design/cdn-edge-caching",
      "backend/redis",
    ],
    tags: ["rate-limiting", "token-bucket", "leaky-bucket", "sliding-window", "redis", "429", "throttling", "load-shedding"],
    sources: [
      CHECKLIST,
      { label: "Stripe Engineering — Scaling your API with rate limiters", url: "https://stripe.com/blog/rate-limiters", kind: "external" },
      { label: "Cloudflare Blog — How we built rate limiting capable of scaling to millions of domains", url: "https://blog.cloudflare.com/counting-things-a-lot-of-different-things/", kind: "external" },
      { label: "RFC 6585 — Additional HTTP Status Codes (429 Too Many Requests)", url: "https://www.rfc-editor.org/rfc/rfc6585", kind: "docs" },
      { label: "IETF draft — RateLimit header fields for HTTP", url: "https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/", kind: "docs" },
      { label: "AWS Builders' Library — Fairness in multi-tenant systems", url: "https://aws.amazon.com/builders-library/fairness-in-multi-tenant-systems/", kind: "external" },
      { label: "Envoy docs — Global rate limiting", url: "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/other_features/global_rate_limiting", kind: "docs" },
      AWS_TIMEOUTS,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain the five common rate-limiting algorithms and their burst/accuracy/memory trade-offs.",
              "Implement an atomic distributed limiter with Redis.",
              "Decide where to enforce limits (edge, gateway, service) and on what key.",
              "Communicate limits to clients (429, Retry-After, RateLimit headers) and choose fail-open vs fail-closed.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A nightclub bouncer lets in at most N people per minute. A token bucket is a jar refilled with one token every few seconds, up to a maximum; each guest takes a token, and if the jar is empty they wait. The jar's size allows a short burst (a group arriving together); the refill rate sets the long-term average.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Algorithm", "Mechanism", "Bursts", "Memory per key", "Accuracy"],
            rows: [
              ["Token bucket", "Bucket of capacity B refills at r tokens/s; a request spends a token", "Allows bursts up to B", "2 numbers (tokens, last refill time)", "Exact"],
              ["Leaky bucket (as queue)", "Requests enter a queue drained at a constant rate", "Smooths bursts into a steady output", "Queue", "Exact; adds queueing delay"],
              ["Fixed window counter", "Count per calendar window (e.g. per minute)", "Up to 2× limit across a window boundary", "1 counter", "Coarse"],
              ["Sliding window log", "Store a timestamp per request; count those in the last window", "No boundary burst", "One entry per request (expensive)", "Exact"],
              ["Sliding window counter", "Weighted mix of the previous and current window counts", "Small error", "2 counters", "Approximate, usually close"],
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
              "**Protection:** stop one client, bug or attack from exhausting shared capacity (retry storms, scrapers, credential stuffing).",
              "**Fairness:** multi-tenant systems need per-tenant quotas so one noisy neighbour can't starve others.",
              "**Cost control:** expensive downstream calls (LLM APIs, SMS, payment processors) have their own limits and prices.",
              "**Business:** pricing tiers expressed as quotas.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "Token bucket, step by step",
        blocks: [
          {
            type: "viz",
            id: "sys-rate-limiter",
            caption: "Token bucket: tokens refill at a fixed rate up to capacity; requests consume tokens or are rejected.",
          },
          {
            type: "steps",
            steps: [
              { title: "State", detail: "Per key: `tokens` (float) and `last` (timestamp). Capacity B = 20, rate r = 10/s." },
              { title: "On request at time now", detail: "tokens = min(B, tokens + (now − last) × r); last = now." },
              { title: "Decide", detail: "If tokens ≥ 1: tokens −= 1, allow. Else: reject with 429 and Retry-After ≈ (1 − tokens) / r seconds." },
              { title: "No timers needed", detail: "Refill is computed lazily on each request, so idle keys cost nothing and can expire." },
            ],
          },
          {
            type: "p",
            text: "**Sliding window counter** (Cloudflare's approach): estimate = previous_window_count × (1 − elapsed_fraction_of_current_window) + current_window_count. With 60/min limit, 40 requests last minute, 30 so far and 25% into this minute: 40 × 0.75 + 30 = 60 → the next request is rejected.",
          },
          {
            type: "code",
            lang: "text",
            caption: "Atomic token bucket in Redis (Lua, conceptual) — runs as one script so concurrent app instances can't race",
            code: `-- KEYS[1] = bucket key; ARGV = capacity, rate_per_sec, now_ms, cost
local b = redis.call('HMGET', KEYS[1], 'tokens', 'last')
local capacity = tonumber(ARGV[1])
local rate     = tonumber(ARGV[2])
local now      = tonumber(ARGV[3])
local cost     = tonumber(ARGV[4])
local tokens   = tonumber(b[1]) or capacity
local last     = tonumber(b[2]) or now

tokens = math.min(capacity, tokens + (now - last) / 1000 * rate)
local allowed = 0
if tokens >= cost then
  tokens = tokens - cost
  allowed = 1
end
redis.call('HSET', KEYS[1], 'tokens', tokens, 'last', now)
redis.call('PEXPIRE', KEYS[1], math.ceil(capacity / rate * 1000) * 2)
return { allowed, tokens }`,
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "Using the application's clock (`now_ms` argument) means app-server clock skew affects refill; some implementations read Redis's `TIME` inside the script instead. Either way, run the read-modify-write atomically — a GET then SET from the app races under concurrency.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Designing limits for a public API",
        blocks: [
          {
            type: "table",
            head: ["Layer", "Limit", "Key", "Purpose"],
            rows: [
              ["CDN / WAF", "Very high per-IP thresholds, bot rules", "IP, fingerprint", "Volumetric abuse, DDoS"],
              ["API gateway", "100 req/s, burst 200", "API key / tenant", "Fair use, pricing tiers"],
              ["Login endpoint", "5 attempts / 15 min", "account + IP", "Credential stuffing"],
              ["Expensive endpoint (exports)", "2 concurrent", "tenant", "Concurrency limit, not rate"],
              ["Service → SMS provider", "Provider's limit minus headroom", "global", "Protect downstream & cost"],
            ],
          },
          {
            type: "code",
            lang: "http",
            caption: "Rejecting a request",
            code: `HTTP/1.1 429 Too Many Requests
Retry-After: 2
RateLimit-Policy: "default";q=100;w=1
RateLimit: "default";r=0;t=2
Content-Type: application/json

{"error":"rate_limited","message":"Too many requests, retry after 2 seconds"}`,
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "The `RateLimit` / `RateLimit-Policy` header syntax comes from an IETF draft whose format has changed between revisions; many APIs still use the older de-facto `X-RateLimit-Limit`, `X-RateLimit-Remaining` and `X-RateLimit-Reset`. `429` and `Retry-After` are standard.",
          },
        ],
      },
      {
        id: "examples",
        title: "Rate limiting vs related controls",
        blocks: [
          {
            type: "table",
            head: ["Control", "Limits", "Example"],
            rows: [
              ["Rate limit", "Requests per time", "100 req/s per API key"],
              ["Concurrency limit", "Requests in flight", "Max 10 concurrent exports per tenant (Stripe uses this alongside rate limits)"],
              ["Quota", "Total over a long period", "1M calls per month"],
              ["Load shedding", "Reject when the *server* is overloaded, regardless of client", "Drop low-priority traffic at 90% CPU"],
              ["Backpressure", "Slow producers down by propagating capacity signals", "Bounded queues, TCP flow control"],
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Fixed-window boundary burst:** 100 requests at 12:00:59 and 100 at 12:01:00 = 200 in two seconds.",
              "**Distributed counting:** local per-instance limits multiply with instance count (10 instances × 100 = 1,000). Use a shared store, or divide the limit and accept imprecision.",
              "**Redis is a dependency:** if it's down or slow, decide: fail-open (allow; protects availability) or fail-closed (deny; protects downstreams). Most public APIs fail open with a local fallback limiter.",
              "**Hot keys:** a single huge tenant's counter hits one Redis shard; use local pre-aggregation or batching of decrements.",
              "**Key choice:** per-IP limits punish users behind NAT/carrier-grade NAT and are easy to evade with botnets; prefer authenticated identities.",
              "**Retries amplify:** clients that ignore Retry-After and retry instantly keep the limiter busy — document behaviour and use exponential backoff with jitter in SDKs.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Choice", "Pick when"],
            rows: [
              ["Token bucket", "Default for APIs: allows natural bursts, simple, exact"],
              ["Leaky bucket queue", "Downstream needs a smooth, constant rate (e.g. a provider with strict per-second limits)"],
              ["Fixed window", "Coarse quotas, simplicity, cheap analytics"],
              ["Sliding window counter", "Large scale with low memory and near-exact accuracy"],
              ["Sliding log", "Low volume, strict correctness (e.g. login attempts)"],
              ["Local in-memory limiter", "Per-instance protection, zero latency, approximate global limit"],
              ["Central (Redis/Envoy RLS)", "Accurate global limits; adds a network hop and dependency"],
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
              "**Monitor:** 429 rate per key and endpoint, top limited clients, limiter latency and errors, fail-open events, Redis CPU/memory.",
              "**Rollout:** run new limits in 'shadow' (log-only) mode first to see who would be limited.",
              "**Cost:** a Redis round trip (~sub-ms in-region) per request; batch or use local token caches for very high QPS.",
              "**Failure mode:** a limiter misconfiguration blocks all traffic — keep an override switch and alert on sudden 429 spikes.",
              "**Communicate:** publish limits in docs, return headers so clients can self-throttle.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "I'd default to a token bucket per API key: tokens refill at the sustained rate up to a burst capacity, and each request spends one. Fixed windows are simpler but allow double bursts at boundaries; sliding window counters fix that cheaply; sliding logs are exact but memory-heavy. For a distributed limiter I keep the bucket in Redis and update it atomically with a Lua script, layered with coarse limits at the edge and local limiters as a fallback. Rejected requests get 429 with Retry-After, and I decide explicitly whether to fail open or closed if Redis is unavailable.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Layer limits: edge (IP/bot), gateway (tenant/API key), service (concurrency, expensive operations), outbound (protect providers).",
              "Atomicity: Lua scripts or atomic INCR + EXPIRE; never GET-then-SET from multiple instances.",
              "Accuracy vs cost: central store for precision; local buckets with periodic sync for scale; sliding-window approximation for memory.",
              "Distinguish client rate limiting (fairness) from load shedding (self-protection) — you usually need both.",
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
              "Token bucket = rate + burst; default choice.",
              "Fixed window is cheap but bursty at boundaries; sliding window counter is a good compromise.",
              "Distributed: Redis + atomic script; plan for Redis failure.",
              "429 + Retry-After; clients back off with jitter.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Token bucket", definition: "Limiter where tokens accrue at a fixed rate up to a capacity and each request consumes tokens." },
      { term: "Leaky bucket", definition: "Limiter that queues requests and releases them at a constant rate." },
      { term: "429 Too Many Requests", definition: "HTTP status indicating the client has sent too many requests in a given time." },
      { term: "Retry-After", definition: "Response header telling the client how long to wait before retrying." },
      { term: "Fail-open / fail-closed", definition: "Allowing vs denying requests when the limiter itself is unavailable." },
      { term: "Load shedding", definition: "Deliberately rejecting excess work when a server is overloaded, to keep serving the rest." },
    ],
    followUps: [
      { q: "How would you rate-limit across 50 API servers?", a: "A shared store (Redis cluster) keyed by client, updated atomically with a Lua script, possibly via a dedicated rate-limit service (Envoy RLS). For extreme QPS, give each server a local token allowance refreshed from the central store to cut round trips." },
      { q: "Fail open or fail closed when Redis is down?", a: "Usually fail open with a conservative local in-memory limiter so the product stays up; fail closed for security-sensitive limits like login attempts or for protecting a fragile, costly downstream." },
      { q: "Why is a fixed window limiter inaccurate?", a: "Counts reset at boundaries, so a client can send a full window's quota at the end of one window and another at the start of the next — up to 2× the intended rate in a short span." },
      { q: "How is rate limiting different from load shedding?", a: "Rate limiting enforces per-client policy regardless of server health; load shedding protects the server based on its own load, dropping lowest-priority work first. A server can be overloaded even when every client is within limits." },
      { q: "What key would you rate-limit on for an unauthenticated endpoint?", a: "IP (or IP prefix) plus device/browser fingerprint signals, with generous limits to avoid punishing shared NATs, and stricter limits after authentication on the account or API key." },
    ],
    quiz: [
      {
        id: "rl-q1",
        prompt: "Which algorithm permits a burst up to a fixed capacity while enforcing a long-term average rate?",
        options: ["Fixed window counter", "Token bucket", "Sliding window log", "Round robin"],
        answer: 1,
        explanation: "The bucket capacity bounds the burst; the refill rate bounds the average.",
      },
      {
        id: "rl-q2",
        prompt: "Limit 100/min, fixed windows. What's the worst-case number of requests accepted in a 2-second span?",
        options: ["100", "~3", "200", "Unlimited"],
        answer: 2,
        explanation: "100 at the end of one window plus 100 at the start of the next.",
      },
      {
        id: "rl-q3",
        prompt: "Why run the Redis token-bucket update as a Lua script?",
        options: ["Lua is faster than C", "To make read-refill-decrement atomic across concurrent app instances", "Redis can't store numbers otherwise", "To persist the bucket to disk"],
        answer: 1,
        explanation: "Redis executes a script atomically, preventing races between separate GET and SET calls from different servers.",
      },
    ],
  },
];
