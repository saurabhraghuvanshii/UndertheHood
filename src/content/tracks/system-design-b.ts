import type { Lesson, SourceRef } from "../types";

/**
 * System design checklist topics 21–40 (track "system-design").
 * Order matches the learner's checklist and the module order in `system-design.ts`.
 */

const CHECKLIST: SourceRef = { label: "Learner's 40-topic system design checklist", kind: "original-note" };
const SRE_OVERLOAD: SourceRef = { label: "Google SRE Book — Handling Overload", url: "https://sre.google/sre-book/handling-overload/", kind: "docs" };
const SRE_CASCADING: SourceRef = { label: "Google SRE Book — Addressing Cascading Failures", url: "https://sre.google/sre-book/addressing-cascading-failures/", kind: "docs" };
const SRE_MONITORING: SourceRef = { label: "Google SRE Book — Monitoring Distributed Systems", url: "https://sre.google/sre-book/monitoring-distributed-systems/", kind: "docs" };
const SRE_WORKBOOK_ALERTING: SourceRef = { label: "Google SRE Workbook — Alerting on SLOs", url: "https://sre.google/workbook/alerting-on-slos/", kind: "docs" };
const SRE_SLO: SourceRef = { label: "Google SRE Book — Service Level Objectives", url: "https://sre.google/sre-book/service-level-objectives/", kind: "docs" };
const AWS_BACKOFF: SourceRef = { label: "AWS Builders' Library — Timeouts, retries, and backoff with jitter", url: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/", kind: "external" };
const AWS_BACKLOG: SourceRef = { label: "AWS Builders' Library — Avoiding insurmountable queue backlogs", url: "https://aws.amazon.com/builders-library/avoiding-insurmountable-queue-backlogs/", kind: "external" };
const AWS_JITTER_BLOG: SourceRef = { label: "AWS Architecture Blog — Exponential Backoff and Jitter", url: "https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/", kind: "external" };
const KAFKA_DOCS: SourceRef = { label: "Apache Kafka documentation", url: "https://kafka.apache.org/documentation/", kind: "docs" };
const RABBIT_RELIABILITY: SourceRef = { label: "RabbitMQ — Consumer Acknowledgements and Publisher Confirms", url: "https://www.rabbitmq.com/docs/confirms", kind: "docs" };
const SQS_VISIBILITY: SourceRef = { label: "Amazon SQS — Visibility timeout", url: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html", kind: "docs" };
const SQS_DLQ: SourceRef = { label: "Amazon SQS — Dead-letter queues", url: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html", kind: "docs" };
const GRPC_DOCS: SourceRef = { label: "gRPC — Core concepts, architecture and lifecycle", url: "https://grpc.io/docs/what-is-grpc/core-concepts/", kind: "docs" };
const OPENAPI_SPEC: SourceRef = { label: "OpenAPI Specification (latest)", url: "https://spec.openapis.org/oas/latest.html", kind: "docs" };
const OTEL_DOCS: SourceRef = { label: "OpenTelemetry documentation — Concepts", url: "https://opentelemetry.io/docs/concepts/", kind: "docs" };
const W3C_TRACE: SourceRef = { label: "W3C Trace Context", url: "https://www.w3.org/TR/trace-context/", kind: "docs" };
const FOWLER_MICRO: SourceRef = { label: "Martin Fowler & James Lewis — Microservices", url: "https://martinfowler.com/articles/microservices.html", kind: "external" };
const K8S_PROBES: SourceRef = { label: "Kubernetes — Configure Liveness, Readiness and Startup Probes", url: "https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/", kind: "docs" };

export const lessons: Lesson[] = [
  // ---------------------------------------------------------------------------
  // 21. Async processing
  // ---------------------------------------------------------------------------
  {
    slug: "async-processing",
    track: "system-design",
    title: "Asynchronous processing",
    summary:
      "Move slow or unreliable work off the request path: accept the request, enqueue a job, return quickly, and let workers finish it — trading immediacy for latency, resilience and smoothing of load.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 30,
    kinds: ["theory", "visualization", "system-design"],
    status: "authored",
    prerequisites: ["system-design/latency-throughput", "system-design/api-idempotency"],
    related: [
      "system-design/rabbitmq-kafka-sqs",
      "system-design/backpressure",
      "system-design/delivery-semantics",
      "backend/webhooks-dlq",
      "distributed/event-driven-architecture",
      "go/worker-pool",
    ],
    tags: ["queues", "workers", "background-jobs", "202-accepted", "decoupling"],
    sources: [CHECKLIST, AWS_BACKLOG, SQS_DLQ, { label: "Microsoft Azure Architecture Center — Asynchronous Request-Reply pattern", url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/async-request-reply", kind: "docs" }],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Decide which work belongs on the synchronous request path and which can be deferred.",
              "Describe the producer → queue → worker pipeline and what each part guarantees.",
              "Design the client contract for async work (`202 Accepted`, status polling, webhooks).",
              "Name the new failure modes async introduces: duplicates, poison messages, backlogs, lost visibility.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A restaurant waiter does not stand at the stove while your food cooks. They write the order on a ticket, pin it to the rail, and go serve other tables. The kitchen works through tickets at its own pace. The rail is the **queue**, the waiter is the **producer**, the cooks are **workers**.",
          },
          {
            type: "p",
            text: "If 50 people order at once, the rail gets long but nobody is turned away at the door and the cooks never get more tickets than they can hold. That is the essence of async processing: **decouple accepting work from doing work**.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "**Asynchronous processing** means the component that receives a request does not perform all of the work before responding. It durably records the intent (usually as a message in a queue or a row in a jobs table) and returns; separate **workers** consume and execute the work later, reporting results via a status store, callback, or event.",
          },
          {
            type: "table",
            head: ["Term", "Meaning"],
            rows: [
              ["Producer", "Code that creates a job/message (often the API handler)."],
              ["Queue / broker", "Durable buffer that stores messages until a consumer acknowledges them."],
              ["Worker / consumer", "Process that pulls messages, does the work, then acks (or fails)."],
              ["Ack", "Consumer's signal that a message is done and may be deleted."],
              ["Dead-letter queue (DLQ)", "Where messages go after repeatedly failing, for inspection and replay."],
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
              "**Latency** — the user waits for the enqueue (milliseconds), not the video transcode (minutes).",
              "**Load smoothing** — a queue absorbs bursts; workers process at a steady, provisioned rate.",
              "**Failure isolation** — if the email provider is down, signups still succeed; emails retry later.",
              "**Independent scaling** — scale workers on queue depth separately from the web tier.",
              "**Retry for free** — unacked messages are redelivered, so transient failures heal without user action.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "How it works",
        blocks: [
          { type: "flow", nodes: ["Client", "API (validate + enqueue)", "Queue", "Worker pool", "Result store / event"], caption: "Conceptual async pipeline." },
          {
            type: "steps",
            steps: [
              { title: "Accept and validate", detail: "The API validates input synchronously — reject bad requests now, not in a worker hours later." },
              { title: "Persist intent", detail: "Write the job durably (queue publish with confirm, or DB row). Only after the durable write succeeds do you respond." },
              { title: "Respond 202", detail: "Return `202 Accepted` with a job id and a `Location` header pointing to a status resource." },
              { title: "Worker leases the message", detail: "A worker receives the message; the broker hides it from other workers (SQS visibility timeout, RabbitMQ unacked state, Kafka partition ownership)." },
              { title: "Do the work idempotently", detail: "Because redelivery is possible, side effects are keyed by job id so a second run is a no-op." },
              { title: "Ack or fail", detail: "On success, ack/delete/commit the offset. On failure, nack or let the lease expire; after N attempts the message goes to a DLQ." },
              { title: "Publish result", detail: "Update job status (`succeeded`, `failed`), and optionally emit an event or call a webhook." },
            ],
          },
          { type: "viz", id: "go-worker-pool", caption: "A jobs channel feeding N workers is the in-process version of the same pattern: bounded workers pulling from a shared queue." },
          {
            type: "callout",
            tone: "warning",
            title: "The dual-write problem",
            text: "If the handler writes to the DB **and** publishes to the queue, a crash between the two leaves them inconsistent. The **transactional outbox** fixes this: insert the message into an `outbox` table in the same DB transaction, and have a relay publish outbox rows to the broker.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: video upload",
        blocks: [
          {
            type: "code",
            lang: "http",
            code: `POST /videos HTTP/1.1
Content-Type: application/json

{"uploadId": "u_81f", "title": "Cat"}

HTTP/1.1 202 Accepted
Location: /videos/v_42/status

{"id": "v_42", "status": "queued"}`,
            caption: "The API stores the upload and enqueues a transcode job, then returns immediately.",
          },
          {
            type: "code",
            lang: "ts",
            code: `// Worker: idempotent consumer keyed by job id
async function handle(msg: { jobId: string; videoId: string }) {
  // Insert-if-absent claims the job; a redelivered message hits the unique key.
  const claimed = await db.query(
    "INSERT INTO processed_jobs(job_id) VALUES ($1) ON CONFLICT DO NOTHING",
    [msg.jobId],
  );
  if (claimed.rowCount === 0) return; // already done (or in progress) -> just ack

  await transcode(msg.videoId);                // the slow part
  await db.query("UPDATE videos SET status='ready' WHERE id=$1", [msg.videoId]);
}`,
            caption: "Sketch: claim-then-work. A production version records status per job so a crash mid-transcode can be retried rather than skipped.",
          },
          {
            type: "callout",
            tone: "note",
            text: "The claim row above marks the job as taken *before* the work finishes. If the worker crashes after claiming, a redelivery would skip it. Real systems store `status = in_progress` with a lease timestamp and let stale leases be reclaimed, or make the final write itself idempotent.",
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "table",
            head: ["Good async candidates", "Keep synchronous"],
            rows: [
              ["Sending email / push / SMS", "Login, reading a profile"],
              ["Image/video processing, PDF generation", "Payment authorization the user must see now"],
              ["Search indexing, analytics events", "Inventory check before confirming an order"],
              ["Fan-out to followers' feeds", "Anything whose result the next screen needs"],
              ["Calling flaky third-party webhooks", "Validation errors the user must fix"],
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        title: "Edge cases and limitations",
        blocks: [
          {
            type: "list",
            items: [
              "**Duplicates** — almost every broker is at-least-once; consumers must be idempotent.",
              "**Poison messages** — a message that always crashes the worker blocks progress unless max-receive + DLQ is configured.",
              "**Insurmountable backlog** — if arrival rate exceeds processing rate for long enough, the queue holds hours of stale work. Set message TTLs, prioritise fresh work, and alert on *age of oldest message*, not just depth.",
              "**Ordering** — parallel workers break global order; use a partition/message-group key if per-entity order matters.",
              "**Read-your-writes** — the user refreshes and the thing isn't there yet. Show a pending state.",
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
              { title: "Use async when", points: ["Work is slow (>~1s) or calls unreliable dependencies", "The user doesn't need the result to continue", "Load is bursty", "Work fans out to many recipients"] },
              { title: "Avoid async when", points: ["The caller needs the answer to proceed", "Strong consistency with the response is required", "Volume is low and the work is fast — a queue adds ops cost for nothing", "You can't make the work idempotent"] },
            ],
          },
        ],
      },
      {
        id: "real-world",
        title: "Operational implications",
        blocks: [
          {
            type: "list",
            items: [
              "Monitor **queue depth**, **age of oldest message**, consumer lag, worker error rate and DLQ size.",
              "Autoscale workers on backlog per worker, but cap scale-out at what downstream dependencies tolerate.",
              "Propagate a trace context in message headers so a job's trace links back to the request that created it.",
              "Have a DLQ replay runbook — DLQs that nobody drains are just slow data loss.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Async processing decouples accepting work from doing it. The API validates, durably enqueues a job, and returns `202` with a job id; workers pull from the queue, do the work idempotently, and ack. It buys lower latency, burst absorption and failure isolation, at the cost of eventual results, duplicate deliveries, and new things to monitor like queue age and DLQs.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Explain the **outbox pattern** for the DB-plus-publish dual write.",
              "Explain **visibility timeouts / leases** and why the work must be idempotent (redelivery after timeout).",
              "Discuss **retry policy**: backoff with jitter, max attempts, then DLQ; separate transient from permanent errors.",
              "Discuss **backlog strategy**: LIFO or freshness-first for user-facing work, TTLs, shedding.",
              "Client contract: polling a status URL vs webhooks vs WebSocket push.",
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
              "Accept fast, persist intent durably, process later.",
              "Workers must be idempotent; brokers redeliver.",
              "Use outbox to avoid dual-write inconsistencies.",
              "Watch queue age, not only depth; drain DLQs.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "202 Accepted", definition: "HTTP status meaning the request was accepted for processing but processing hasn't completed." },
      { term: "Transactional outbox", definition: "Writing outgoing messages to a DB table in the same transaction as the business change; a relay publishes them later." },
      { term: "Poison message", definition: "A message that fails every time it is processed, typically due to bad data or a bug." },
      { term: "DLQ", definition: "Dead-letter queue: holding area for messages that exceeded their retry limit." },
      { term: "Consumer lag", definition: "How far behind consumers are from the newest message (count or time)." },
    ],
    followUps: [
      { q: "How does the client learn the job finished?", a: "Polling a status resource (simple, works everywhere), a webhook callback (server-to-server), or push via WebSocket/SSE (interactive UIs). Many systems offer polling plus an optional webhook." },
      { q: "What if the queue is down when the API tries to enqueue?", a: "Either fail the request (`503`) so the client retries, or write to a local/DB outbox that a relay drains later. Never return `202` without having durably stored the intent." },
      { q: "Why alert on age of oldest message instead of depth?", a: "Depth depends on throughput: 10k messages is nothing for a fast consumer and hours of delay for a slow one. Age directly measures the user-visible delay." },
      { q: "Database-as-queue or a real broker?", a: "A jobs table with `SELECT ... FOR UPDATE SKIP LOCKED` is fine at modest scale and gives transactional enqueue for free. A broker wins for high throughput, fan-out, and replay." },
      { q: "How do you scale workers safely?", a: "Scale on backlog per worker, but cap concurrency at what downstream (DB, third-party APIs) can take — otherwise scaling workers just moves the overload downstream." },
    ],
    quiz: [
      {
        id: "async-q1",
        prompt: "A signup handler commits the user row, then publishes `UserCreated`. The process crashes between the two. What prevents the lost event?",
        options: ["A longer visibility timeout", "A transactional outbox", "A dead-letter queue", "Consumer groups"],
        answer: 1,
        explanation: "The outbox writes the event in the same DB transaction as the user row, so either both persist or neither; a relay publishes it later.",
      },
      {
        id: "async-q2",
        prompt: "Which metric best captures user-visible delay in an async pipeline?",
        options: ["Queue depth", "Worker CPU", "Age of the oldest unprocessed message", "Messages published per second"],
        answer: 2,
        explanation: "Age of oldest message is the delay the next job will experience, independent of throughput.",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 22. RabbitMQ vs Kafka vs SQS
  // ---------------------------------------------------------------------------
  {
    slug: "rabbitmq-kafka-sqs",
    track: "system-design",
    title: "Message brokers: RabbitMQ vs Kafka vs SQS",
    summary:
      "Queues delete messages once consumed; logs keep them and let consumers track their position. Understand consumer groups, partitions and ordering, retention and replay, visibility timeouts and DLQs — and when to pick which.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 40,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["system-design/async-processing", "system-design/sharding-partitioning"],
    related: ["system-design/delivery-semantics", "system-design/backpressure", "backend/webhooks-dlq", "distributed/event-driven-architecture"],
    tags: ["kafka", "rabbitmq", "sqs", "log", "partitions", "consumer-groups", "dlq"],
    sources: [
      CHECKLIST,
      KAFKA_DOCS,
      RABBIT_RELIABILITY,
      { label: "RabbitMQ — Streams", url: "https://www.rabbitmq.com/docs/streams", kind: "docs" },
      SQS_VISIBILITY,
      SQS_DLQ,
      { label: "Amazon SQS — FIFO queues", url: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-fifo-queues.html", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain the difference between a **message queue** (broker) and a **distributed log**.",
              "Describe consumer groups, partitions and how ordering is (and isn't) guaranteed.",
              "Explain retention/replay, visibility timeouts, acks and DLQs per system.",
              "Choose between RabbitMQ, Kafka and SQS for a given workload and justify it.",
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
              { title: "Queue (RabbitMQ, SQS) — a to-do pile", points: ["Each task is handed to one worker", "When the worker says done, the task is thrown away", "The broker tracks who has what"] },
              { title: "Log (Kafka) — a newspaper archive", points: ["Every article is appended and kept for days", "Each reader keeps a bookmark (offset)", "Many independent readers; anyone can re-read from an old page"] },
            ],
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["", "RabbitMQ", "Apache Kafka", "Amazon SQS"],
            rows: [
              ["Model", "Smart broker: exchanges route to queues (AMQP 0-9-1); also offers Streams", "Partitioned, replicated append-only log", "Fully managed queue (Standard and FIFO)"],
              ["Delivery to consumers", "Push to consumers with prefetch limit", "Consumers pull by offset", "Consumers long-poll `ReceiveMessage`"],
              ["After consumption", "Acked messages are deleted", "Messages kept until retention (time/size) or compaction", "Deleted when consumer calls `DeleteMessage`"],
              ["Ordering", "Per queue, with a single consumer; lost with competing consumers + redelivery", "Per partition", "Standard: best-effort; FIFO: per message group"],
              ["Replay", "Not for classic queues (Streams: yes)", "Yes — reset the group's offsets", "No (once deleted, gone)"],
              ["Ops", "You run it (or managed offering)", "You run it (or MSK / Confluent)", "Zero ops, pay per request"],
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "Brokers are not interchangeable. Picking a log when you needed a task queue gives you head-of-line blocking per partition and awkward per-message retries; picking a queue when you needed a log means you can't add a new consumer that reprocesses last week's events. Interviewers ask this to see whether you understand the **data model**, not the brand names.",
          },
        ],
      },
      {
        id: "internals",
        title: "How they work",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Kafka: topics → partitions → offsets", detail: "A topic is split into partitions; each is an ordered, append-only log replicated across brokers. A producer chooses the partition by key hash, so all events for one key land in one partition in order." },
              { title: "Kafka: consumer groups", detail: "Within a group, each partition is assigned to exactly one consumer, so max parallelism = partition count. Different groups read independently, each with its own committed offsets — that's how one topic feeds billing, search and analytics at once." },
              { title: "Kafka: retention and replay", detail: "Messages stay for `retention.ms`/`retention.bytes` regardless of consumption. Replay = reset the group's offset. Log compaction keeps the latest value per key, making a topic a changelog." },
              { title: "RabbitMQ: exchanges and queues", detail: "Producers publish to an exchange (direct, topic, fanout, headers); bindings route copies to queues. Consumers get messages pushed up to their `prefetch` count; unacked messages are redelivered if the channel closes." },
              { title: "RabbitMQ: DLX", detail: "A rejected (`nack` with requeue=false) or expired message can be routed to a dead-letter exchange; quorum queues also support a delivery limit." },
              { title: "SQS: visibility timeout", detail: "`ReceiveMessage` hides the message for the visibility timeout (default 30s). If not deleted in time it becomes visible again and is redelivered. Extend it with `ChangeMessageVisibility` for long jobs." },
              { title: "SQS: redrive policy", detail: "After `maxReceiveCount` receives without deletion, SQS moves the message to the configured DLQ. FIFO queues order within a `MessageGroupId` and deduplicate within a 5-minute window." },
            ],
          },
          { type: "flow", nodes: ["Producer (key=user42)", "hash(key) % N", "Partition 3", "Consumer B of group 'billing'"], caption: "Kafka: same key → same partition → ordered for that key." },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Version-dependent details",
            text: "Kafka 4.0 removed ZooKeeper in favour of KRaft, and newer releases add share groups (queue-like consumption, KIP-932). RabbitMQ 4.x deprecates classic mirrored queues in favour of quorum queues. Check versions before claiming specific behaviour.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: ordering across a consumer group",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Setup", detail: "Topic `orders` has 6 partitions; group `fulfillment` has 3 consumers → 2 partitions each." },
              { title: "Produce", detail: "Events keyed by `orderId`: `created`, `paid`, `shipped` for order 17 all hash to partition 4." },
              { title: "Consume", detail: "Consumer C owns partitions 4 and 5, so it sees order 17's events in order." },
              { title: "Scale to 8 consumers", detail: "Only 6 get partitions; 2 sit idle. To scale further you must add partitions — which changes key→partition mapping for new messages." },
              { title: "Rebalance", detail: "If C dies, its partitions move to another member, which resumes from the last committed offset; anything processed but not committed is reprocessed." },
            ],
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "table",
            head: ["Workload", "Good fit", "Why"],
            rows: [
              ["Background jobs (emails, thumbnails)", "SQS or RabbitMQ", "Per-message ack, retry, DLQ; no need for replay"],
              ["Event stream feeding many services + analytics", "Kafka", "Multiple independent consumer groups, replay, high throughput"],
              ["Complex routing (topic patterns, fanout, priorities)", "RabbitMQ", "Exchanges and bindings, priority queues"],
              ["Serverless app on AWS, low ops", "SQS (+ SNS for fanout)", "Managed, scales automatically, Lambda trigger"],
              ["Change data capture / event sourcing", "Kafka", "Ordered per key, compaction, long retention"],
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        title: "Edge cases and limitations",
        blocks: [
          {
            type: "list",
            items: [
              "**Kafka head-of-line blocking** — one slow/poison message stalls its whole partition; you need a retry topic + DLQ pattern yourself.",
              "**Hot partitions** — a celebrity key overloads one partition; ordering per key prevents spreading it.",
              "**SQS visibility timeout shorter than processing** → a second worker gets the same message while the first is still working.",
              "**RabbitMQ memory/disk alarms** — when queues grow huge, the broker blocks publishers (flow control).",
              "**Ordering vs retries** — retrying message 5 later while 6 succeeds breaks order unless you block the key.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        title: "When to pick which",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Kafka", points: ["Pick for: high-throughput event streams, many consumers, replay, CDC", "Avoid for: per-message retries/delays, low volume with small team", "Cost: partitions, rebalances, cluster ops"] },
              { title: "RabbitMQ", points: ["Pick for: task queues with rich routing, priorities, RPC-ish patterns", "Avoid for: long retention and replay at scale", "Cost: running a stateful cluster"] },
              { title: "SQS", points: ["Pick for: simple durable work queues on AWS, zero ops", "Avoid for: replay, fan-out (add SNS/EventBridge), strict ordering at high throughput", "Cost: per-request pricing; 256 KiB message limit"] },
            ],
          },
        ],
      },
      {
        id: "real-world",
        title: "Operational implications",
        blocks: [
          {
            type: "list",
            items: [
              "Kafka: monitor consumer lag per partition, under-replicated partitions, and ISR shrinkage; choose partition count up front.",
              "Producer durability: Kafka `acks=all` + `min.insync.replicas`; RabbitMQ publisher confirms + durable/quorum queues; SQS is durable once `SendMessage` returns.",
              "All three: alert on DLQ growth and build a redrive tool (SQS has native DLQ redrive).",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "RabbitMQ and SQS are queues: a message goes to one consumer and is deleted on ack, with redelivery on failure and DLQs after N attempts. Kafka is a partitioned log: messages are retained, consumers in a group split partitions and track offsets, ordering is per partition, and new consumer groups can replay history. I pick SQS for low-ops job queues, RabbitMQ for rich routing, and Kafka for high-volume event streams with multiple consumers or replay.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Max parallelism in a Kafka group = partitions; adding partitions remaps keys.",
              "Offset commit timing defines delivery semantics: commit before processing → at-most-once; after → at-least-once.",
              "SQS FIFO: ordering per `MessageGroupId`, dedup window of 5 minutes, lower throughput than Standard (high-throughput mode raises limits).",
              "Retry topics in Kafka: main → retry-1m → retry-10m → DLQ to avoid blocking a partition.",
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
              "Queue = delete on ack; log = retain and track offsets.",
              "Kafka ordering is per partition; parallelism capped by partitions.",
              "SQS hides messages for a visibility timeout; DLQ after maxReceiveCount.",
              "Choose by data model and ops budget, not popularity.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Partition", definition: "An ordered, append-only shard of a Kafka topic; unit of ordering and parallelism." },
      { term: "Offset", definition: "Position of a record within a partition; consumers commit offsets to record progress." },
      { term: "Consumer group", definition: "Set of consumers sharing work; each partition is read by one member of the group." },
      { term: "Visibility timeout", definition: "SQS period during which a received message is hidden from other consumers." },
      { term: "Exchange", definition: "RabbitMQ routing component that delivers messages to bound queues." },
      { term: "Prefetch", definition: "RabbitMQ limit on unacked messages pushed to a consumer — a backpressure knob." },
    ],
    followUps: [
      { q: "How do you get per-user ordering with parallelism?", a: "Partition (Kafka) or message group (SQS FIFO) by user id. Different users process in parallel; one user's events stay ordered." },
      { q: "Can Kafka be used as a job queue?", a: "Yes, but per-message retry and delay are awkward and a slow message blocks its partition. Use retry topics, or newer share groups where available, or choose a queue." },
      { q: "What happens if an SQS job takes 10 minutes but the visibility timeout is 30s?", a: "It becomes visible again and another worker picks it up, causing duplicate concurrent processing. Set the timeout above p99 processing time or extend it with a heartbeat." },
      { q: "How do you add a new service that needs last month of events?", a: "With Kafka, create a new consumer group starting at the earliest offset (if retention covers a month). With SQS/RabbitMQ you'd need a separate archive." },
      { q: "Why does RabbitMQ need prefetch?", a: "Without it the broker pushes unbounded messages to a consumer, which buffers them in memory; prefetch caps in-flight unacked messages." },
    ],
    quiz: [
      {
        id: "brokers-q1",
        prompt: "A Kafka topic has 4 partitions and the consumer group has 10 consumers. How many consumers actively receive messages?",
        options: ["10", "4", "1", "It depends on the producer"],
        answer: 1,
        explanation: "Each partition is assigned to at most one consumer in a group, so only 4 consumers get work.",
      },
      {
        id: "brokers-q2",
        prompt: "Which feature lets a brand-new consumer reprocess events from last week?",
        options: ["SQS visibility timeout", "RabbitMQ prefetch", "Kafka retention + offset reset", "SQS DLQ redrive"],
        answer: 2,
        explanation: "Kafka keeps records for the retention period; a new group can start from the earliest offset.",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 23. Backpressure
  // ---------------------------------------------------------------------------
  {
    slug: "backpressure",
    track: "system-design",
    title: "Backpressure",
    summary:
      "When producers outpace consumers, something must give: buffer, drop, or slow the producer down. Backpressure is the deliberate signal from a slow stage to a fast one — bounded queues, credits, 429/503 and load shedding — so overload degrades gracefully instead of exploding.",
    level: "intermediate",
    frequency: "high",
    minutes: 30,
    kinds: ["theory", "visualization", "system-design"],
    status: "authored",
    prerequisites: ["system-design/async-processing", "system-design/latency-throughput"],
    related: [
      "system-design/rate-limiting",
      "system-design/bulkheads",
      "system-design/fail-fast-graceful-degradation",
      "go/backpressure-bounded-concurrency",
      "go/channels",
      "nodejs/streams-buffers",
    ],
    tags: ["overload", "bounded-queue", "load-shedding", "flow-control", "429"],
    sources: [CHECKLIST, SRE_OVERLOAD, SRE_CASCADING, AWS_BACKLOG, { label: "Reactive Streams specification", url: "https://www.reactive-streams.org/", kind: "docs" }],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain why unbounded buffers turn overload into latency and then into crashes.",
              "List the three responses to overload: buffer (bounded), drop/shed, or slow the producer.",
              "Recognise backpressure mechanisms at each layer: TCP windows, channels, prefetch, HTTP 429/503.",
              "Design a service that sheds load before it falls over.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Picture a highway on-ramp with a traffic light. Without the light, cars pour onto a full highway and everyone stops. With it, cars wait briefly on the ramp and the highway keeps flowing. The light is **backpressure**: the congested stage tells the upstream stage to slow down.",
          },
          {
            type: "p",
            text: "Queueing theory makes the same point: as utilisation approaches 100%, waiting time grows without bound. A buffer can absorb a burst, but it cannot fix a sustained rate mismatch — it only delays the failure and makes it bigger.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "**Backpressure** is any mechanism by which a consumer that cannot keep up propagates resistance upstream, so producers slow down, wait, or get rejected, instead of the system accumulating unbounded work.",
          },
          {
            type: "table",
            head: ["Strategy", "What happens", "Example"],
            rows: [
              ["Block / slow producer", "Producer waits until capacity frees", "Full Go channel blocks the sender; TCP receive window shrinks"],
              ["Bounded buffer", "Absorb bursts up to a limit, then apply another strategy", "Queue of 1,000 jobs"],
              ["Reject / shed", "Fail fast with a retryable error", "HTTP `429`/`503` with `Retry-After`"],
              ["Drop / sample", "Discard low-value work", "Drop debug logs, sample metrics"],
              ["Pull-based credit", "Consumer requests N items it can handle", "Reactive Streams `request(n)`, RabbitMQ prefetch, Kafka pull"],
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
              "Unbounded queues hide overload until memory runs out — then the process dies and loses everything in the buffer.",
              "Long queues make latency explode; requests time out client-side while the server still burns CPU completing them (wasted work).",
              "Without backpressure, overload in one service cascades to its callers (thread pools fill waiting on it).",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "How it works",
        blocks: [
          { type: "viz", id: "go-worker-pool", caption: "A bounded jobs channel with N workers: when the channel is full, the producer blocks — backpressure in its simplest form." },
          {
            type: "steps",
            steps: [
              { title: "Bound every queue", detail: "Every buffer between stages has a maximum size: channel capacity, thread-pool queue length, broker max-length, in-flight request limit." },
              { title: "Decide what happens when full", detail: "Block (in-process, same trust domain), reject (across a network boundary), or drop (low-value data)." },
              { title: "Signal upstream", detail: "Across services the signal is an error the caller understands: `429 Too Many Requests` or `503` + `Retry-After`, gRPC `RESOURCE_EXHAUSTED`." },
              { title: "Caller reacts", detail: "Callers back off with jitter, respect `Retry-After`, and propagate the pressure to their own callers rather than queueing internally." },
              { title: "Shed by priority", detail: "Under overload, reject low-priority work (prefetch, batch, analytics) first to protect critical requests." },
            ],
          },
          {
            type: "code",
            lang: "go",
            code: `// Bounded admission: at most 100 requests in flight; reject the rest fast.
var inflight = make(chan struct{}, 100)

func handler(w http.ResponseWriter, r *http.Request) {
	select {
	case inflight <- struct{}{}:
		defer func() { <-inflight }()
		serve(w, r)
	default:
		w.Header().Set("Retry-After", "1")
		http.Error(w, "overloaded", http.StatusServiceUnavailable)
	}
}`,
            caption: "A semaphore made from a buffered channel. `select` with `default` turns a would-block into a fast rejection.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: a traffic spike",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Normal", detail: "Service handles 1,000 rps at 50% capacity; in-flight ≈ 20." },
              { title: "Spike to 3,000 rps", detail: "Capacity is ~2,000 rps. In-flight climbs to the cap of 100." },
              { title: "Without a cap", detail: "Requests pile up in memory; p99 latency goes from 50ms to 30s; clients time out at 2s and retry, doubling load; GC thrash; OOM." },
              { title: "With a cap", detail: "~1,000 rps get fast `503`s with `Retry-After`; the 2,000 accepted rps still see normal latency. Goodput stays near capacity." },
            ],
          },
          {
            type: "callout",
            tone: "tip",
            title: "Goodput, not throughput",
            text: "Throughput counts all work done; goodput counts work that completed in time to be useful. Backpressure exists to keep goodput high under overload.",
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "table",
            head: ["Layer", "Backpressure mechanism"],
            rows: [
              ["TCP", "Receiver advertises a window; sender cannot exceed it"],
              ["HTTP/2, gRPC", "Per-stream and connection flow-control windows"],
              ["Node.js streams", "`write()` returns false past `highWaterMark`; wait for `drain`; `pipe()` handles it"],
              ["Go", "Buffered channels and semaphores block senders"],
              ["RabbitMQ / Kafka", "Prefetch limits; pull-based consumption; broker blocks publishers on memory alarm"],
              ["Edge / API", "Rate limiting, concurrency limits, `429`/`503`"],
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        title: "Edge cases and limitations",
        blocks: [
          {
            type: "list",
            items: [
              "**Blocking across a network** ties up the caller's threads/connections; prefer explicit rejection between services.",
              "**Rejections still cost** — parsing and rejecting a request uses CPU. Shed as early (edge, LB) and cheaply as possible.",
              "**Retries defeat backpressure** if clients ignore `Retry-After` and retry immediately.",
              "**Queues between async stages** — a durable broker can buffer for hours; you need TTLs and producer-side limits or the backlog becomes insurmountable.",
              "**Static limits drift** — capacity changes with deploys and instance types; adaptive concurrency limits (e.g. based on latency gradients) track it automatically.",
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
              { title: "Block the producer", points: ["Lossless", "Simple in-process", "Can deadlock or spread stalls upstream", "Bad across untrusted network boundaries"] },
              { title: "Reject / shed", points: ["Protects the server", "Clear signal to clients", "Requires client retry logic", "Some users see errors"] },
              { title: "Drop", points: ["Cheapest", "Only acceptable for lossy data (metrics, telemetry, real-time video frames)"] },
            ],
          },
        ],
      },
      {
        id: "real-world",
        title: "Operational implications",
        blocks: [
          {
            type: "list",
            items: [
              "Alert on rejection rate and queue saturation (USE method: utilisation, saturation, errors).",
              "Load-test past capacity to verify the service sheds instead of collapsing.",
              "Mark requests with a criticality so shedding can drop the least important first (Google SRE describes per-request criticality).",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Backpressure is the slow stage telling the fast stage to slow down. You bound every buffer and decide what happens when it's full: block the producer, reject with a retryable error like `429`/`503` and `Retry-After`, or drop low-value work. Unbounded queues just convert overload into latency and then into out-of-memory crashes; bounded queues plus load shedding keep goodput high.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Little's law: in-flight = arrival rate × latency. Cap in-flight and latency stays bounded.",
              "Prefer LIFO or deadline-aware dequeue under overload: old requests whose clients already gave up are wasted work.",
              "Propagate deadlines so downstream services drop work that can no longer be useful.",
              "Combine with rate limiting (per-client fairness) and circuit breakers (stop calling a sick dependency).",
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
              "Every queue must be bounded.",
              "When full: block, reject, or drop — choose deliberately.",
              "Across services, reject fast with a retryable signal.",
              "Measure goodput and saturation, not just throughput.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Load shedding", definition: "Deliberately rejecting some requests under overload to keep serving the rest." },
      { term: "Goodput", definition: "Useful work completed within its deadline." },
      { term: "Little's law", definition: "L = λW: average items in a system equals arrival rate times average time in system." },
      { term: "Flow control", definition: "Protocol-level mechanism limiting how much a sender may send before the receiver allows more." },
      { term: "Retry-After", definition: "HTTP header telling the client how long to wait before retrying." },
    ],
    followUps: [
      { q: "Isn't a big queue enough to handle spikes?", a: "A queue absorbs short bursts. For sustained overload it only grows, adding latency to every item until clients time out — then the server processes requests nobody is waiting for." },
      { q: "429 or 503?", a: "`429` signals this client exceeded its quota (rate limiting). `503` signals the server as a whole is overloaded or unavailable. Both can carry `Retry-After`." },
      { q: "How does TCP implement backpressure?", a: "The receiver advertises a receive window; when the application stops reading, the window shrinks to zero and the sender must stop sending." },
      { q: "How do you pick the concurrency limit?", a: "Start from load tests (the knee of the latency curve) and Little's law; better, use an adaptive limiter that lowers the limit when latency rises." },
    ],
    quiz: [
      {
        id: "bp-q1",
        prompt: "A service uses an unbounded in-memory queue. Under sustained 2× overload, what happens first?",
        options: ["Requests are rejected with 429", "Latency rises steadily, then memory exhaustion", "The queue automatically sheds", "Throughput doubles"],
        answer: 1,
        explanation: "Without a bound, the queue grows; every request waits longer, and eventually memory runs out.",
      },
      {
        id: "bp-q2",
        prompt: "In Go, what turns a blocking channel send into immediate rejection?",
        options: ["A buffered channel", "`select` with a `default` case", "`close(ch)`", "`sync.WaitGroup`"],
        answer: 1,
        explanation: "`select` with `default` runs the default branch if the send would block.",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 24. Delivery semantics
  // ---------------------------------------------------------------------------
  {
    slug: "delivery-semantics",
    track: "system-design",
    title: "Delivery semantics: at-most-once, at-least-once, \"exactly-once\"",
    summary:
      "Networks lose acks, so a sender must choose between maybe losing a message and maybe duplicating it. \"Exactly-once\" in practice means at-least-once delivery plus idempotent or transactional processing — and Kafka's EOS covers only a specific scope.",
    level: "advanced",
    frequency: "very-high",
    minutes: 35,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["system-design/rabbitmq-kafka-sqs", "system-design/api-idempotency"],
    related: ["system-design/async-processing", "distributed/idempotency-patterns", "distributed/distributed-transactions", "backend/webhooks-dlq"],
    tags: ["at-least-once", "exactly-once", "idempotency", "kafka-transactions", "dedup"],
    sources: [
      CHECKLIST,
      { label: "Apache Kafka documentation — Message Delivery Semantics", url: "https://kafka.apache.org/documentation/#semantics", kind: "docs" },
      { label: "Confluent — Exactly-once Semantics Are Possible: Here's How Kafka Does It", url: "https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/", kind: "external" },
      RABBIT_RELIABILITY,
      SQS_VISIBILITY,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Define at-most-once, at-least-once and exactly-once *processing*.",
              "Explain why the ack/commit point determines which one you get.",
              "Build an idempotent consumer with a dedup store in the same transaction as the side effect.",
              "State precisely what Kafka exactly-once semantics (EOS) do and do not cover.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "You mail a cheque and ask for a receipt. No receipt arrives. Did the cheque get lost, or the receipt? You can't tell. If you don't resend, the payee might get nothing (**at-most-once**). If you resend, they might get two (**at-least-once**). The only way to have exactly one payment is for the payee to recognise the duplicate cheque number and ignore it — **idempotency**.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Semantics", "Guarantee", "How", "Risk"],
            rows: [
              ["At-most-once", "0 or 1 time", "Ack/commit **before** processing; no retries", "Loss on crash"],
              ["At-least-once", "1 or more times", "Ack/commit **after** processing; retry on failure", "Duplicates"],
              ["Exactly-once (effect)", "Effect observed once", "At-least-once delivery + idempotent or transactional processing", "Complexity; scope-limited"],
            ],
          },
          {
            type: "callout",
            tone: "misconception",
            title: "\"Exactly-once delivery\" is not a thing over an unreliable network",
            text: "No protocol can guarantee a message crosses the wire exactly once when acks can be lost. What systems achieve is **exactly-once processing**: duplicates arrive but their effect is applied once.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "Charging a card twice, sending two welcome emails, or double-counting revenue are real incidents caused by assuming a queue delivers once. Every design with a queue should state its delivery semantics and how duplicates are handled.",
          },
        ],
      },
      {
        id: "internals",
        title: "How it works",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Where duplicates come from", detail: "Producer retries after a lost publish-ack; consumer crashes after doing work but before ack; visibility timeout expires mid-processing; consumer-group rebalance before offset commit." },
              { title: "At-most-once in Kafka", detail: "Commit the offset, then process. A crash after commit skips the record." },
              { title: "At-least-once in Kafka", detail: "Process, then commit. A crash before commit reprocesses from the last committed offset." },
              { title: "Idempotent consumer", detail: "Each message carries a unique id. Record processed ids in the same database transaction as the side effect; a duplicate violates the unique key and is skipped." },
              { title: "Kafka idempotent producer", detail: "Producer id + per-partition sequence numbers let the broker drop duplicate appends from producer retries. Default-enabled since Kafka 3.0." },
              { title: "Kafka transactions (EOS)", detail: "A producer atomically writes output records to several partitions **and** commits consumer offsets; consumers with `isolation.level=read_committed` only see committed data. This makes consume-transform-produce **within Kafka** exactly-once." },
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Kafka EOS scope",
            text: "Kafka EOS covers reading from Kafka and writing to Kafka (e.g. Kafka Streams with `processing.guarantee=exactly_once_v2`). The moment your consumer calls an external API, sends an email, or writes to Postgres, Kafka cannot roll that back — you need idempotency or a transactional sink that stores offsets alongside the data.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: idempotent payment consumer",
        blocks: [
          {
            type: "code",
            lang: "sql",
            code: `CREATE TABLE processed_messages (
  message_id text PRIMARY KEY,
  processed_at timestamptz NOT NULL DEFAULT now()
);`,
          },
          {
            type: "code",
            lang: "ts",
            code: `async function onPaymentRequested(msg: { id: string; orderId: string; cents: number }) {
  await db.transaction(async (tx) => {
    // 1. Dedup and side effect commit (or roll back) together.
    const r = await tx.query(
      "INSERT INTO processed_messages(message_id) VALUES ($1) ON CONFLICT DO NOTHING",
      [msg.id],
    );
    if (r.rowCount === 0) return; // duplicate: already applied

    await tx.query(
      "INSERT INTO ledger(order_id, amount_cents) VALUES ($1, $2)",
      [msg.orderId, msg.cents],
    );
  });
  // 2. Only now ack / commit offset. A crash before this => redelivery => dedup hit.
}`,
            caption: "At-least-once delivery + dedup in the same transaction = effectively-once ledger entries.",
          },
          {
            type: "callout",
            tone: "warning",
            title: "External side effects",
            text: "If the side effect is an external call (e.g. a card charge), the DB transaction can't include it. Pass an idempotency key to the provider (Stripe-style `Idempotency-Key`) so the provider deduplicates.",
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "table",
            head: ["Use case", "Semantics", "Reason"],
            rows: [
              ["Metrics / telemetry", "At-most-once acceptable", "Losing a sample is cheaper than duplicating load"],
              ["Order events, payments", "At-least-once + idempotency", "Loss is unacceptable; duplicates must be harmless"],
              ["Stream aggregation Kafka → Kafka", "Kafka EOS", "Transactions cover read-process-write within Kafka"],
              ["Webhooks to customers", "At-least-once, with event ids", "Receivers dedupe on event id"],
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        title: "Edge cases and limitations",
        blocks: [
          {
            type: "list",
            items: [
              "Dedup tables grow forever — expire entries after a window longer than the max redelivery delay.",
              "Natural idempotency is cheaper: `SET status='shipped'` is idempotent; `balance = balance - 10` is not.",
              "SQS FIFO dedup only lasts 5 minutes; a later duplicate gets through.",
              "Message ids must be assigned by the producer once, not regenerated on retry.",
              "Ordering + idempotency: a stale duplicate arriving after a newer update can overwrite it unless you use version checks.",
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
              { title: "Idempotent consumer", points: ["Works with any broker and any sink you control", "Requires a dedup key and storage", "Most common answer in interviews"] },
              { title: "Kafka transactions", points: ["True EOS for Kafka-to-Kafka pipelines", "Adds latency (commit intervals) and config complexity", "Doesn't extend to external systems"] },
            ],
          },
        ],
      },
      {
        id: "real-world",
        title: "Operational implications",
        blocks: [
          {
            type: "list",
            items: [
              "Track a duplicate-hit metric: a sudden rise flags rebalances or too-short visibility timeouts.",
              "Document per-topic semantics in the schema registry or service README.",
              "Replays (resetting offsets) are only safe if every consumer is idempotent.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Because acks can be lost, you either risk loss (at-most-once: ack before processing) or duplicates (at-least-once: ack after). Exactly-once is really exactly-once *effect*: at-least-once delivery plus idempotent processing, e.g. recording the message id in the same transaction as the side effect. Kafka's EOS uses idempotent producers and transactions, but it only covers read-process-write within Kafka; external side effects still need idempotency keys.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Two Generals problem: no finite protocol guarantees agreement over a lossy channel.",
              "Transactional sink pattern: store Kafka offsets in the same DB transaction as results; on restart, seek to the stored offset.",
              "Zombie fencing in Kafka uses `transactional.id` epochs so an old producer instance can't commit.",
              "Outbox on the producer side + idempotent consumer on the receiving side = end-to-end effectively-once.",
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
              "Ack position decides at-most vs at-least once.",
              "Exactly-once = at-least-once + idempotency or transactions.",
              "Kafka EOS is Kafka-to-Kafka only.",
              "Use producer-assigned ids and dedup in the same transaction as the effect.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Idempotent", definition: "Applying an operation multiple times has the same effect as applying it once." },
      { term: "EOS", definition: "Kafka's exactly-once semantics: idempotent producer + transactions + read_committed consumers." },
      { term: "read_committed", definition: "Kafka consumer isolation level that hides records from aborted or open transactions." },
      { term: "Dedup store", definition: "Table or cache of processed message ids used to drop duplicates." },
      { term: "Zombie", definition: "A stale producer/consumer instance that still believes it owns work after being replaced." },
    ],
    followUps: [
      { q: "Can SQS Standard give exactly-once?", a: "No. Standard is at-least-once with possible duplicates and best-effort ordering. Use idempotent consumers; FIFO adds a 5-minute dedup window but still needs idempotent processing for robustness." },
      { q: "Why must dedup happen in the same transaction?", a: "Otherwise a crash between recording the id and applying the effect (or vice versa) either loses the effect or applies it twice." },
      { q: "How long should you keep message ids?", a: "Longer than the maximum time a duplicate can arrive: retry windows, DLQ redrive, and replay windows. Often days; use TTL or partitioned tables." },
      { q: "Is HTTP PUT exactly-once?", a: "PUT is idempotent by definition, so retrying it is safe — that's at-least-once delivery with idempotent effect, the same pattern." },
      { q: "What does the Kafka idempotent producer prevent?", a: "Duplicate writes to a partition caused by the producer retrying a send whose ack was lost. It does not prevent the consumer from processing twice." },
    ],
    quiz: [
      {
        id: "ds-q1",
        prompt: "A Kafka consumer commits offsets before processing each batch. What semantics does it have?",
        options: ["At-most-once", "At-least-once", "Exactly-once", "None"],
        answer: 0,
        explanation: "If it crashes after committing but before processing, those records are skipped — possible loss, no duplicates.",
      },
      {
        id: "ds-q2",
        prompt: "A Kafka Streams app with exactly_once_v2 also sends an email per record. Is the email exactly-once?",
        options: ["Yes, EOS covers all side effects", "No, EOS covers only Kafka reads/writes and offsets", "Yes if acks=all", "Only with read_committed"],
        answer: 1,
        explanation: "Kafka cannot roll back an email. External effects need their own idempotency.",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 25. REST API design
  // ---------------------------------------------------------------------------
  {
    slug: "rest-api-design",
    track: "system-design",
    title: "REST API design",
    summary:
      "Model resources as nouns, use HTTP methods with their safety and idempotency guarantees, return precise status codes, paginate with cursors, and report errors in a consistent machine-readable format such as RFC 9457 problem details.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 35,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["networks/http", "system-design/api-idempotency"],
    related: ["system-design/api-versioning", "system-design/openapi-swagger", "system-design/rpc-grpc", "backend/rest-graphql-grpc-trpc", "system-design/rate-limiting"],
    tags: ["rest", "http", "status-codes", "pagination", "problem-details"],
    sources: [
      CHECKLIST,
      { label: "RFC 9110 — HTTP Semantics", url: "https://www.rfc-editor.org/rfc/rfc9110", kind: "docs" },
      { label: "RFC 9457 — Problem Details for HTTP APIs", url: "https://www.rfc-editor.org/rfc/rfc9457", kind: "docs" },
      { label: "Google Cloud API Design Guide", url: "https://cloud.google.com/apis/design", kind: "docs" },
      { label: "Roy Fielding's dissertation, Chapter 5 — REST", url: "https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm", kind: "external" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Design resource-oriented URLs and map operations onto HTTP methods.",
              "Know which methods are safe and idempotent and why that matters for retries.",
              "Choose correct status codes and a consistent error body.",
              "Implement cursor pagination and explain why offset pagination breaks at scale.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "REST treats your API like a filing cabinet of documents (resources) with a small fixed set of verbs: read it, create one, replace it, patch it, delete it. Because the verbs are standard, every cache, proxy, client library and engineer already knows what they mean.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "**REST** (Representational State Transfer) is an architectural style: a uniform interface over resources identified by URIs, stateless requests, cacheable responses, and a layered system. In practice, \"REST API\" means resource-oriented JSON over HTTP using HTTP semantics correctly.",
          },
          {
            type: "table",
            head: ["Method", "Typical use", "Safe", "Idempotent"],
            rows: [
              ["GET", "Read a resource or collection", "Yes", "Yes"],
              ["HEAD / OPTIONS", "Metadata / capabilities", "Yes", "Yes"],
              ["PUT", "Create or fully replace at a known URI", "No", "Yes"],
              ["DELETE", "Remove", "No", "Yes"],
              ["POST", "Create in a collection; actions", "No", "No (make it so with `Idempotency-Key`)"],
              ["PATCH", "Partial update", "No", "Not guaranteed"],
            ],
          },
          {
            type: "callout",
            tone: "note",
            text: "**Safe** = no intended state change (so crawlers and prefetchers may call it). **Idempotent** = repeating the request has the same effect as once — which is what makes automatic retries safe.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "Correct semantics let infrastructure help: CDNs cache GETs, clients retry idempotent calls, proxies understand status codes.",
              "A predictable API reduces integration bugs and support load.",
              "APIs are hard to change once public — design mistakes become permanent.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "Design rules",
        blocks: [
          {
            type: "table",
            head: ["Concern", "Recommendation"],
            rows: [
              ["URLs", "Plural nouns, hierarchy for ownership: `/users/42/orders/7`. Avoid verbs except for true actions: `POST /orders/7:cancel` or `POST /orders/7/cancellation`."],
              ["Filtering & sorting", "Query params: `?status=paid&created_after=2026-01-01&sort=-created_at`. Whitelist fields."],
              ["Partial responses", "`?fields=id,name` to reduce payloads."],
              ["Pagination", "Cursor-based with `limit` and an opaque `next_cursor`."],
              ["Concurrency", "`ETag` + `If-Match` on updates → `412 Precondition Failed` on conflicts."],
              ["Errors", "One format everywhere: RFC 9457 `application/problem+json`."],
            ],
          },
          {
            type: "table",
            head: ["Status", "Use for"],
            rows: [
              ["200 / 201 / 204", "OK with body / Created (+ `Location`) / OK no body"],
              ["202", "Accepted for async processing"],
              ["400 / 422", "Malformed request / semantically invalid input"],
              ["401 / 403", "Not authenticated / authenticated but not allowed"],
              ["404 / 409 / 412", "Not found / state conflict / precondition (ETag) failed"],
              ["429", "Rate limited (+ `Retry-After`)"],
              ["500 / 502 / 503 / 504", "Server bug / bad upstream / overloaded or down / upstream timeout"],
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: cursor pagination and errors",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Offset: `?offset=10000&limit=50`", points: ["DB must scan and discard 10,000 rows", "Inserts during paging shift rows → duplicates or skips", "Easy random page jumps"] },
              { title: "Cursor: `?after=eyJpZCI6...&limit=50`", points: ["Uses an index seek: `WHERE (created_at, id) < ($1, $2) ORDER BY ... LIMIT 50`", "Stable under concurrent inserts", "No jumping to page 200"] },
            ],
          },
          {
            type: "code",
            lang: "http",
            code: `GET /orders?status=paid&limit=2 HTTP/1.1

HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": [{"id": "o_9"}, {"id": "o_8"}],
  "next_cursor": "eyJjIjoiMjAyNi0xMC0wMVQxMjowMDowMFoiLCJpZCI6Im9fOCJ9"
}`,
            caption: "The cursor encodes the last row's sort key (here base64 JSON of created_at and id). Treat it as opaque to clients.",
          },
          {
            type: "code",
            lang: "http",
            code: `HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json

{
  "type": "https://api.example.com/problems/insufficient-funds",
  "title": "Insufficient funds",
  "status": 422,
  "detail": "Balance is 30.00, transfer requires 50.00.",
  "instance": "/transfers/t_123",
  "balance": "30.00"
}`,
            caption: "RFC 9457 problem details: standard members plus extension members like `balance`.",
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "table",
            head: ["Operation", "Request", "Response"],
            rows: [
              ["List a user's orders", "`GET /users/42/orders?limit=20`", "`200` + page + cursor"],
              ["Create order", "`POST /orders` + `Idempotency-Key`", "`201` + `Location: /orders/7`"],
              ["Replace shipping address", "`PUT /orders/7/shipping-address`", "`200` or `204`"],
              ["Cancel order", "`POST /orders/7:cancel`", "`200`, or `409` if already shipped"],
              ["Delete draft", "`DELETE /drafts/3`", "`204` (and `204`/`404` on repeat — still idempotent in effect)"],
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        title: "Edge cases and limitations",
        blocks: [
          {
            type: "list",
            items: [
              "**Chatty clients** — deeply nested UIs need many round trips; consider composite endpoints, `?include=`, GraphQL, or a BFF.",
              "**Long-running operations** don't fit request/response; return `202` + operation resource.",
              "**Large exports** — stream or generate asynchronously; don't paginate a million rows.",
              "**Leaking internals** — error messages shouldn't include stack traces or SQL.",
              "**`200` with `{\"error\": ...}`** breaks every HTTP-aware tool; use real status codes.",
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
              { title: "REST fits", points: ["Public APIs and third-party integrations", "CRUD-shaped domains", "Cacheable reads via HTTP caching/CDNs"] },
              { title: "Consider alternatives", points: ["Internal high-throughput service calls → gRPC", "Flexible client-driven queries → GraphQL", "Real-time push → WebSockets/SSE"] },
            ],
          },
        ],
      },
      {
        id: "real-world",
        title: "Operational implications",
        blocks: [
          {
            type: "list",
            items: [
              "Measure per-endpoint latency and error rate by status class (RED).",
              "Apply rate limits and max page size; reject `limit=100000`.",
              "Document with OpenAPI and lint for consistency in CI.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "I model resources as plural nouns, use GET for safe reads, PUT/DELETE for idempotent writes, and POST with an idempotency key for creation. I return precise status codes — 201 with Location, 202 for async, 409 for conflicts, 429 with Retry-After — and a single error format like RFC 9457 problem details. Lists use cursor pagination keyed on an indexed sort column, because offset pagination gets slower with depth and skips or duplicates rows under concurrent writes.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Optimistic concurrency with ETags and `If-Match`.",
              "HTTP caching: `Cache-Control`, `ETag`/`If-None-Match` → `304`.",
              "HATEOAS is part of Fielding's REST but rarely used in practice; acknowledge it.",
              "PUT vs PATCH: JSON Merge Patch (RFC 7396) vs JSON Patch (RFC 6902).",
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
              "Resources as nouns; HTTP methods for verbs.",
              "Safe and idempotent methods enable caching and retries.",
              "Precise status codes + RFC 9457 errors.",
              "Cursor pagination over offset for large or changing lists.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Resource", definition: "A named thing exposed by the API, identified by a URI." },
      { term: "Safe method", definition: "An HTTP method with no intended side effects (GET, HEAD, OPTIONS)." },
      { term: "Cursor", definition: "Opaque token encoding the position after the last returned item." },
      { term: "Problem details", definition: "RFC 9457 JSON error format with type, title, status, detail and instance." },
      { term: "ETag", definition: "Version identifier of a representation, used for caching and conditional requests." },
    ],
    followUps: [
      { q: "Is DELETE still idempotent if the second call returns 404?", a: "Yes. Idempotency is about server state, not the response code. After one or many DELETEs the resource is gone." },
      { q: "401 vs 403?", a: "401: no valid credentials (authenticate). 403: credentials are valid but lack permission." },
      { q: "How would you let clients jump to page N with cursors?", a: "Usually you don't; offer filters instead (date ranges). If needed, allow offset for shallow pages and cursor beyond a limit." },
      { q: "How do you handle a partial update safely?", a: "PATCH with a defined format (Merge Patch) plus `If-Match` ETag to avoid lost updates." },
      { q: "Where do verbs like 'publish' fit?", a: "As custom methods (`POST /posts/1:publish`) or by modelling state (`PATCH status=published`). Pick one convention." },
    ],
    quiz: [
      {
        id: "rest-q1",
        prompt: "Which method is idempotent but not safe?",
        options: ["GET", "POST", "PUT", "HEAD"],
        answer: 2,
        explanation: "PUT changes state (not safe) but repeating it yields the same state (idempotent).",
      },
      {
        id: "rest-q2",
        prompt: "Why is offset pagination problematic for a feed with frequent inserts?",
        options: ["It can't be cached", "New rows shift offsets, causing duplicates/skips, and deep offsets are slow", "It requires POST", "It breaks JSON"],
        answer: 1,
        explanation: "Offsets are positional; inserts shift positions, and the DB scans skipped rows.",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 26. RPC and gRPC
  // ---------------------------------------------------------------------------
  {
    slug: "rpc-grpc",
    track: "system-design",
    title: "RPC and gRPC",
    summary:
      "gRPC is a contract-first RPC framework: Protocol Buffers define services and messages, HTTP/2 carries multiplexed streams, and deadlines, cancellation and four streaming modes are built in. Great between services; browsers need gRPC-Web or a gateway.",
    level: "intermediate",
    frequency: "high",
    minutes: 30,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["system-design/rest-api-design", "networks/http"],
    related: ["backend/rest-graphql-grpc-trpc", "backend/serialization", "system-design/circuit-breakers-timeouts-retries", "go/context", "system-design/api-versioning"],
    tags: ["grpc", "protobuf", "http2", "streaming", "deadlines"],
    sources: [
      CHECKLIST,
      GRPC_DOCS,
      { label: "gRPC — Deadlines", url: "https://grpc.io/docs/guides/deadlines/", kind: "docs" },
      { label: "gRPC — Status codes", url: "https://grpc.io/docs/guides/status-codes/", kind: "docs" },
      { label: "gRPC-Web", url: "https://github.com/grpc/grpc-web", kind: "docs" },
      { label: "Protocol Buffers — Language guide (proto3)", url: "https://protobuf.dev/programming-guides/proto3/", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain RPC and how gRPC implements it over HTTP/2 with protobuf.",
              "Name the four call types and when to use streaming.",
              "Use deadlines and cancellation and explain deadline propagation.",
              "Know why browsers can't call gRPC directly and what gRPC-Web does.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "RPC makes a network call look like a local function call: `user, err := client.GetUser(ctx, req)`. gRPC generates that client and the server stub from a schema file, so both sides agree on types at compile time instead of trusting hand-written JSON.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "**gRPC** is an open-source RPC framework. Services and messages are defined in `.proto` files (Protocol Buffers, a compact binary format), code generators produce typed clients/servers in many languages, and calls run over **HTTP/2**, using one stream per call on long-lived multiplexed connections.",
          },
          {
            type: "code",
            lang: "text",
            code: `syntax = "proto3";
package orders.v1;

service OrderService {
  rpc GetOrder(GetOrderRequest) returns (Order);                       // unary
  rpc WatchOrder(WatchOrderRequest) returns (stream OrderEvent);       // server streaming
  rpc UploadItems(stream Item) returns (UploadSummary);                // client streaming
  rpc Chat(stream ChatMessage) returns (stream ChatMessage);           // bidirectional
}

message GetOrderRequest { string id = 1; }
message Order { string id = 1; int64 total_cents = 2; string status = 3; }`,
            caption: "Field numbers (= 1, = 2) — not names — identify fields on the wire.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "**Typed contracts** catch breaking changes at build time across polyglot services.",
              "**Efficiency** — binary protobuf is smaller and faster to parse than JSON; HTTP/2 multiplexing avoids connection churn.",
              "**Streaming** is first-class, not bolted on.",
              "**Deadlines, cancellation, metadata, status codes** are standardized across languages.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "How it works",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Call", detail: "Client stub serializes the request message to protobuf bytes." },
              { title: "HTTP/2 request", detail: "`POST /orders.v1.OrderService/GetOrder` with `content-type: application/grpc`, a `grpc-timeout` header carrying the deadline, and length-prefixed message frames." },
              { title: "Server", detail: "Decodes, runs the handler with a context that is cancelled when the deadline passes or the client cancels." },
              { title: "Response", detail: "Message frames, then HTTP/2 **trailers** carrying `grpc-status` and `grpc-message`." },
            ],
          },
          {
            type: "table",
            head: ["Call type", "Use case"],
            rows: [
              ["Unary", "Normal request/response"],
              ["Server streaming", "Subscriptions, large result sets, progress updates"],
              ["Client streaming", "Uploads, batched telemetry"],
              ["Bidirectional", "Chat, real-time sync, long-lived control channels"],
            ],
          },
          {
            type: "callout",
            tone: "warning",
            title: "Load balancing gotcha",
            text: "Because a client keeps one long-lived HTTP/2 connection, an L4 load balancer pins all its calls to one backend. Use L7 (per-request) load balancing via a proxy like Envoy, or client-side load balancing with service discovery.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: deadline propagation in Go",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `func (s *server) GetOrder(ctx context.Context, req *pb.GetOrderRequest) (*pb.Order, error) {
	// ctx already carries the caller's deadline (from grpc-timeout).
	// Passing it on means the downstream call inherits the *remaining* budget.
	inv, err := s.inventory.Check(ctx, &invpb.CheckRequest{OrderId: req.Id})
	if err != nil {
		if status.Code(err) == codes.DeadlineExceeded {
			return nil, status.Error(codes.DeadlineExceeded, "inventory too slow")
		}
		return nil, err
	}
	return &pb.Order{Id: req.Id, Status: inv.Status}, nil
}

// Caller sets the overall budget once:
ctx, cancel := context.WithTimeout(context.Background(), 300*time.Millisecond)
defer cancel()
order, err := client.GetOrder(ctx, &pb.GetOrderRequest{Id: "o_7"})`,
            caption: "grpc-go converts the context deadline to `grpc-timeout` and back, so the whole call tree shares one budget.",
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "table",
            head: ["Scenario", "Choice"],
            rows: [
              ["Service-to-service calls in a polyglot microservice fleet", "gRPC"],
              ["Public API for third-party developers", "REST/JSON (optionally a gRPC-JSON transcoding gateway)"],
              ["Browser SPA calling backend", "REST/GraphQL, or gRPC-Web / Connect via a proxy"],
              ["Mobile app on poor networks wanting compact payloads", "gRPC can work well (native clients)"],
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        title: "Edge cases and limitations",
        blocks: [
          {
            type: "list",
            items: [
              "**Browsers** can't access HTTP/2 frames and trailers via fetch, so plain gRPC is impossible; **gRPC-Web** uses a proxy (Envoy) to translate.",
              "**Debuggability** — binary payloads need tools like `grpcurl`; server reflection helps.",
              "**Schema evolution** — never reuse or renumber fields; mark removed ones `reserved`.",
              "**Streams and LB** — long streams pin to one backend; rebalance with max connection age.",
              "**No HTTP caching** for most gRPC calls (they're POSTs).",
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
              { title: "gRPC", points: ["Typed contracts, codegen", "Compact, fast, streaming", "Built-in deadlines", "Harder from browsers; tooling needed for debugging"] },
              { title: "REST/JSON", points: ["Universal, human-readable", "HTTP caching, CDNs", "Looser contracts unless you add OpenAPI", "Larger payloads, no native streaming"] },
            ],
          },
        ],
      },
      {
        id: "real-world",
        title: "Operational implications",
        blocks: [
          {
            type: "list",
            items: [
              "Always set deadlines; a gRPC call without one can wait forever.",
              "Retry only on retryable codes (`UNAVAILABLE`, sometimes `RESOURCE_EXHAUSTED`), never blindly on `INTERNAL`.",
              "Use a service mesh or xDS-based client LB for per-request balancing.",
              "Run `buf breaking` (or equivalent) in CI to block incompatible proto changes.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "gRPC is contract-first RPC: protobuf defines messages and services, code generation gives typed clients and servers, and calls run over HTTP/2 with multiplexing, unary and three streaming modes, metadata, status codes in trailers and built-in deadlines. I use it for internal service-to-service traffic; for browsers I'd use REST or gRPC-Web through a proxy, since browsers can't speak raw gRPC.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Deadline propagation: each hop subtracts elapsed time; servers should check `ctx.Err()` and stop work.",
              "L7 vs L4 load balancing for long-lived HTTP/2 connections.",
              "Protobuf compatibility rules: adding fields is safe; changing types or numbers isn't.",
              "Service config retry policies and hedging exist in gRPC but must respect retry budgets.",
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
              "Protobuf contracts + HTTP/2 transport + codegen.",
              "Unary, server, client and bidirectional streaming.",
              "Deadlines propagate through the call tree.",
              "Browsers need gRPC-Web via a proxy.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "RPC", definition: "Remote procedure call: invoking a function on another process as if it were local." },
      { term: "Protocol Buffers", definition: "Google's language-neutral binary serialization format with a schema (.proto)." },
      { term: "Deadline", definition: "Absolute time by which a call must complete; gRPC propagates it as grpc-timeout." },
      { term: "Trailers", definition: "HTTP headers sent after the body; gRPC puts the final status there." },
      { term: "gRPC-Web", definition: "Variant protocol that lets browsers call gRPC services through a translating proxy." },
    ],
    followUps: [
      { q: "Why a deadline instead of a timeout per hop?", a: "A deadline is absolute and shared: downstream hops know the remaining budget. Independent per-hop timeouts can add up to more than the user is willing to wait." },
      { q: "How do you evolve a proto schema safely?", a: "Add new fields with new numbers; never reuse numbers; reserve removed numbers and names; avoid changing field types." },
      { q: "Why does gRPC need L7 load balancing?", a: "Calls are multiplexed on long-lived connections, so connection-level balancing sends all of a client's calls to one server." },
      { q: "gRPC vs GraphQL?", a: "GraphQL targets flexible client-driven reads (often from browsers); gRPC targets efficient typed service-to-service calls." },
    ],
    quiz: [
      {
        id: "grpc-q1",
        prompt: "Where does gRPC send the final status code of a call?",
        options: ["HTTP status line", "In the protobuf body", "HTTP/2 trailers (`grpc-status`)", "A separate request"],
        answer: 2,
        explanation: "gRPC usually returns HTTP 200 and carries the RPC status in trailers.",
      },
      {
        id: "grpc-q2",
        prompt: "Which change to a proto message is backward compatible?",
        options: ["Renumbering a field", "Adding a new field with a new number", "Changing int64 to string", "Reusing a deleted field's number"],
        answer: 1,
        explanation: "Old readers ignore unknown fields; numbers are the wire identity.",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 27. API versioning
  // ---------------------------------------------------------------------------
  {
    slug: "api-versioning",
    track: "system-design",
    title: "API versioning",
    summary:
      "Most change should be additive and backward compatible; versions are for the breaking changes you can't avoid. Choose a scheme (URL path, header, media type, date-based), define what counts as breaking, and run a deprecation process with sunset dates.",
    level: "intermediate",
    frequency: "medium",
    minutes: 20,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["system-design/rest-api-design"],
    related: ["system-design/openapi-swagger", "system-design/rpc-grpc", "system-design/deployment-strategies"],
    tags: ["versioning", "compatibility", "deprecation", "sunset"],
    sources: [
      CHECKLIST,
      { label: "Google Cloud API Design Guide — Versioning", url: "https://cloud.google.com/apis/design/versioning", kind: "docs" },
      { label: "Stripe — API versioning", url: "https://docs.stripe.com/api/versioning", kind: "docs" },
      { label: "RFC 8594 — The Sunset HTTP Header Field", url: "https://www.rfc-editor.org/rfc/rfc8594", kind: "docs" },
      { label: "RFC 9745 — The Deprecation HTTP Response Header Field", url: "https://www.rfc-editor.org/rfc/rfc9745", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Distinguish breaking from non-breaking changes.",
              "Compare URL, header, media-type and date-based versioning.",
              "Run a deprecation and sunset process.",
              "Implement multiple versions without forking the codebase.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "An API is a promise to code you don't control. Mobile apps from two years ago are still calling you. Versioning is how you keep old promises while making new ones.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Non-breaking (additive)", "Breaking"],
            rows: [
              ["Add an optional request field", "Remove or rename a field"],
              ["Add a response field", "Change a field's type or meaning"],
              ["Add an endpoint", "Make an optional field required"],
              ["Add an enum value (only if clients tolerate unknown values)", "Change error codes / status codes clients depend on"],
              ["Relax validation", "Tighten validation, change defaults"],
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "Without explicit versions, every breaking change is a coordinated outage with all consumers. With them, you can evolve while clients migrate on their own schedule.",
          },
        ],
      },
      {
        id: "internals",
        title: "Versioning schemes",
        blocks: [
          {
            type: "table",
            head: ["Scheme", "Example", "Pros", "Cons"],
            rows: [
              ["URL path", "`/v2/orders`", "Visible, easy to route and cache", "Whole-API version bumps; URLs change"],
              ["Header", "`Api-Version: 2`", "Clean URLs", "Less visible; caches need `Vary`"],
              ["Media type", "`Accept: application/vnd.acme.v2+json`", "Per-resource versions, HTTP-pure", "Clunky for clients"],
              ["Date-based (Stripe)", "`Stripe-Version: 2024-06-20`", "Fine-grained; account pinned to a version", "Requires a transformation layer"],
              ["Package (gRPC)", "`package orders.v2;`", "Explicit in contracts", "Duplicate service definitions"],
            ],
          },
          {
            type: "steps",
            steps: [
              { title: "Pin", detail: "Each client is pinned to a version (explicit header or account default)." },
              { title: "Core model is latest", detail: "Business logic speaks only the newest internal model." },
              { title: "Transform at the edge", detail: "Request/response adapters convert between the pinned version and latest, chained version by version." },
              { title: "Deprecate", detail: "Announce, emit `Deprecation` and `Sunset` headers, track usage per version, contact remaining callers, then remove." },
            ],
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "http",
            code: `GET /v1/users/42 HTTP/1.1

HTTP/1.1 200 OK
Deprecation: @1767225600
Sunset: Thu, 01 Oct 2026 00:00:00 GMT
Link: <https://api.example.com/docs/migrate-v2>; rel="deprecation"`,
            caption: "Signalling deprecation in-band so client tooling can warn developers.",
          },
        ],
      },
      {
        id: "edge-cases",
        title: "Edge cases and limitations",
        blocks: [
          {
            type: "list",
            items: [
              "Adding an enum value is breaking for clients with exhaustive switches — document \"unknown values must be tolerated\" from day one.",
              "Mobile clients can't be force-upgraded quickly; plan for long tails and minimum-supported-version checks.",
              "Webhooks/events need versioning too — payload shape is part of the contract.",
              "Behaviour changes (sorting, defaults, rounding) are breaking even if the schema is identical.",
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
              { title: "URL versioning", points: ["Best default for public REST APIs", "Simple for clients, docs and gateways", "Encourages big-bang versions"] },
              { title: "Date / header versioning", points: ["Best for APIs evolving continuously with many clients", "Needs transformation layer and discipline"] },
              { title: "No versioning (evolve additively)", points: ["Fine for internal APIs where you control all clients", "Use expand/contract and consumer contract tests"] },
            ],
          },
        ],
      },
      {
        id: "real-world",
        title: "Operational implications",
        blocks: [
          {
            type: "list",
            items: [
              "Log the version on every request; dashboards show who still uses v1.",
              "Every live version multiplies test and support surface — keep the number small.",
              "Use OpenAPI diffs or `buf breaking` in CI to catch accidental breaking changes.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Prefer additive, backward-compatible changes and only bump versions for breaking ones. For public REST I'd use a major version in the path, like `/v1`, for simplicity; for continuously evolving APIs a date-based header with edge transformers works well. Internally, keep one current model and adapt old versions at the boundary, and deprecate with Deprecation/Sunset headers, usage tracking, and a published timeline.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Tolerant reader: clients ignore unknown fields; servers accept unknown optional fields.",
              "Consumer-driven contract tests (e.g. Pact) detect breaks before deploy.",
              "Version transformers composed as a chain v1→v2→v3 keep each step small.",
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
              "Evolve additively; version only for breaking changes.",
              "Path versioning is the simple default; headers/dates for fine-grained evolution.",
              "Adapt at the edge; keep one internal model.",
              "Deprecate with headers, metrics and dates.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Breaking change", definition: "A change that can make an existing, correctly written client fail." },
      { term: "Sunset header", definition: "RFC 8594 header announcing when a resource will stop being available." },
      { term: "Tolerant reader", definition: "A client that ignores unknown fields and is lenient about what it accepts." },
      { term: "Version pinning", definition: "Locking a client or account to a specific API version." },
    ],
    followUps: [
      { q: "Is adding a required request field breaking?", a: "Yes — existing clients don't send it and will start failing validation." },
      { q: "How long should you support an old version?", a: "Depends on clients: months for internal/web, often a year or more for public APIs and mobile; drive it with usage data." },
      { q: "Why not version every endpoint independently?", a: "It's flexible but confusing; clients must track a matrix of versions. Most APIs version the whole surface or use dates." },
      { q: "How does gRPC handle versioning?", a: "Additive proto changes are compatible; breaking changes go to a new package such as `orders.v2`, served side by side." },
    ],
    quiz: [
      {
        id: "ver-q1",
        prompt: "Which change is backward compatible for well-behaved clients?",
        options: ["Renaming `user_id` to `userId`", "Adding an optional response field", "Changing `price` from number to string", "Making `email` required"],
        answer: 1,
        explanation: "Tolerant clients ignore new response fields.",
      },
      {
        id: "ver-q2",
        prompt: "What's the main operational cost of keeping many API versions alive?",
        options: ["Larger URLs", "Multiplied testing, support and code paths", "Slower DNS", "No caching"],
        answer: 1,
        explanation: "Each version is a contract you must keep working.",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 28. OpenAPI / Swagger
  // ---------------------------------------------------------------------------
  {
    slug: "openapi-swagger",
    track: "system-design",
    title: "OpenAPI and Swagger",
    summary:
      "OpenAPI is a machine-readable description of an HTTP API — paths, operations, schemas, auth. One document drives docs, client SDKs, server stubs, validation, mocks and breaking-change checks. Swagger is the older name and a set of tools around it.",
    level: "beginner",
    frequency: "medium",
    minutes: 20,
    kinds: ["theory"],
    status: "authored",
    prerequisites: ["system-design/rest-api-design"],
    related: ["system-design/api-versioning", "system-design/rpc-grpc", "backend/serialization"],
    tags: ["openapi", "swagger", "contract-first", "codegen", "json-schema"],
    sources: [
      CHECKLIST,
      OPENAPI_SPEC,
      { label: "OpenAPI Initiative — Learn OpenAPI", url: "https://learn.openapis.org/", kind: "docs" },
      { label: "Swagger tools", url: "https://swagger.io/tools/", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain what an OpenAPI document contains and the OpenAPI vs Swagger naming.",
              "Compare contract-first and code-first workflows.",
              "List what tooling an OpenAPI spec unlocks (docs, codegen, validation, linting, diffing).",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "An OpenAPI file is the blueprint of your API. Humans read it as documentation; machines read it to generate clients, validate requests and detect breaking changes. Like protobuf for gRPC, it turns an informal agreement into a checked contract.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "The **OpenAPI Specification (OAS)** is a vendor-neutral, language-agnostic format (YAML or JSON) for describing HTTP APIs. **Swagger 2.0** was donated to the OpenAPI Initiative and became OAS 3.0; \"Swagger\" now refers to SmartBear's tools (Swagger UI, Editor, Codegen). OAS 3.1 aligns schemas fully with JSON Schema 2020-12.",
          },
          {
            type: "code",
            lang: "yaml",
            code: `openapi: 3.1.0
info: { title: Orders API, version: 1.4.0 }
paths:
  /orders/{id}:
    get:
      operationId: getOrder
      parameters:
        - { name: id, in: path, required: true, schema: { type: string } }
      responses:
        "200":
          description: The order
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Order" }
        "404":
          description: Not found
          content:
            application/problem+json:
              schema: { $ref: "#/components/schemas/Problem" }
      security: [{ bearerAuth: [] }]
components:
  securitySchemes:
    bearerAuth: { type: http, scheme: bearer, bearerFormat: JWT }
  schemas:
    Order:
      type: object
      required: [id, status]
      properties:
        id: { type: string }
        status: { type: string, enum: [pending, paid, shipped] }
    Problem:
      type: object
      properties:
        type: { type: string }
        title: { type: string }
        status: { type: integer }`,
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "Docs that can't drift from the implementation (if validated in CI).",
              "Generated, typed SDKs for many languages.",
              "Request/response validation middleware.",
              "Mock servers so frontends can build before the backend exists.",
              "Automated breaking-change detection between spec versions.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "Workflows",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Contract-first (design-first)", points: ["Write the spec, review it like code", "Generate server stubs and clients", "Best for public APIs and parallel teams"] },
              { title: "Code-first", points: ["Annotate handlers/types; generate the spec", "Fast for small teams", "Spec quality depends on annotations; easy to leak internals"] },
            ],
          },
          { type: "flow", nodes: ["openapi.yaml", "Lint (Spectral)", "Diff vs main", "Codegen SDKs + types", "Validation middleware", "Swagger UI / docs"], caption: "A typical spec-driven CI pipeline." },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "table",
            head: ["Tool category", "Examples"],
            rows: [
              ["Docs", "Swagger UI, Redoc"],
              ["Lint", "Spectral"],
              ["Codegen", "OpenAPI Generator, openapi-typescript, oapi-codegen (Go)"],
              ["Diff / breaking", "oasdiff, openapi-diff"],
              ["Mocking", "Prism"],
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        title: "Edge cases and limitations",
        blocks: [
          {
            type: "list",
            items: [
              "Specs drift when hand-maintained and not validated against real traffic or tests.",
              "Generated SDKs can be awkward; many companies post-process or hand-wrap them.",
              "OAS describes request/response HTTP; event-driven APIs use **AsyncAPI** instead.",
              "Polymorphism (`oneOf`, discriminators) is supported unevenly by code generators.",
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
              { title: "Worth it when", points: ["External consumers", "Multiple client languages", "Several teams sharing APIs"] },
              { title: "Less value when", points: ["Single internal consumer in the same repo with shared types (e.g. tRPC)", "Internal gRPC — protobuf already is the contract"] },
            ],
          },
        ],
      },
      {
        id: "real-world",
        title: "Operational implications",
        blocks: [
          {
            type: "list",
            items: [
              "Treat the spec as code: PR reviews, lint, and breaking-change gates.",
              "Validate responses in tests (or in staging) against the spec to detect drift.",
              "Publish versioned specs alongside releases.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "OpenAPI is the standard machine-readable description of an HTTP API: paths, operations, parameters, JSON-Schema-based models and security schemes. Swagger was its old name and is now a tool suite. A spec lets you generate docs and SDKs, validate traffic, mock servers and catch breaking changes in CI. I prefer contract-first for public APIs so the design gets reviewed before code exists.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "OAS 3.1 = full JSON Schema 2020-12 compatibility (e.g. `type: [string, \"null\"]` instead of `nullable`).",
              "Breaking-change detection: removed paths, new required params, narrowed enums.",
              "Pair with consumer-driven contracts for behaviour, not just shape.",
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
              "OpenAPI = API contract in YAML/JSON.",
              "Swagger = legacy name + tools.",
              "Drives docs, codegen, validation, mocks, diffs.",
              "Keep it in CI so it can't drift.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "OAS", definition: "OpenAPI Specification." },
      { term: "operationId", definition: "Unique name for an operation; used as the method name in generated code." },
      { term: "Contract-first", definition: "Designing the API spec before implementing it." },
      { term: "AsyncAPI", definition: "Sibling specification for describing event-driven / message-based APIs." },
    ],
    followUps: [
      { q: "OpenAPI vs Swagger?", a: "Swagger 2.0 was the spec's name before the OpenAPI Initiative renamed it OpenAPI 3.0; Swagger now refers to tools." },
      { q: "How do you stop the spec drifting from the code?", a: "Either generate it from code, or generate code/types from it, and validate real responses against it in tests." },
      { q: "Does OpenAPI work for gRPC?", a: "Not natively; protobuf is the contract. gRPC-Gateway can generate an OpenAPI spec for a JSON transcoding layer." },
      { q: "What's a good breaking-change gate?", a: "Diff the PR's spec against main with a tool like oasdiff and fail CI on breaking changes unless a new version is introduced." },
    ],
    quiz: [
      {
        id: "oas-q1",
        prompt: "Which spec describes Kafka/AMQP message APIs the way OpenAPI describes HTTP?",
        options: ["JSON Schema", "AsyncAPI", "GraphQL SDL", "WSDL"],
        answer: 1,
        explanation: "AsyncAPI targets event-driven APIs.",
      },
      {
        id: "oas-q2",
        prompt: "Code generators typically use which field as the generated method name?",
        options: ["summary", "operationId", "tags", "servers"],
        answer: 1,
        explanation: "operationId uniquely identifies an operation.",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 29. AuthN / AuthZ
  // ---------------------------------------------------------------------------
  {
    slug: "authn-authz",
    track: "system-design",
    title: "Authentication and authorization",
    summary:
      "Authentication proves who you are; authorization decides what you may do. Compare server sessions and JWTs, walk through OAuth 2.0 and OpenID Connect (authorization code + PKCE), model permissions with RBAC, ABAC or ReBAC, and handle token revocation.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 45,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["system-design/rest-api-design", "networks/tls-handshake"],
    related: ["backend/authentication-jwt-sessions", "backend/csrf", "networks/cors", "backend/redis", "system-design/rate-limiting"],
    tags: ["authentication", "authorization", "jwt", "oauth2", "oidc", "pkce", "rbac", "abac", "rebac"],
    sources: [
      CHECKLIST,
      { label: "RFC 6749 — The OAuth 2.0 Authorization Framework", url: "https://www.rfc-editor.org/rfc/rfc6749", kind: "docs" },
      { label: "RFC 7636 — Proof Key for Code Exchange (PKCE)", url: "https://www.rfc-editor.org/rfc/rfc7636", kind: "docs" },
      { label: "RFC 9700 — Best Current Practice for OAuth 2.0 Security", url: "https://www.rfc-editor.org/rfc/rfc9700", kind: "docs" },
      { label: "RFC 7519 — JSON Web Token (JWT)", url: "https://www.rfc-editor.org/rfc/rfc7519", kind: "docs" },
      { label: "OpenID Connect Core 1.0", url: "https://openid.net/specs/openid-connect-core-1_0.html", kind: "docs" },
      { label: "Zanzibar: Google's Consistent, Global Authorization System (USENIX ATC 2019)", url: "https://www.usenix.org/conference/atc19/presentation/pang", kind: "external" },
      { label: "OWASP Session Management Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Separate authentication (identity) from authorization (permission).",
              "Compare server-side sessions and self-contained JWTs, including revocation.",
              "Walk through the OAuth 2.0 authorization code flow with PKCE, and what OIDC adds.",
              "Choose between RBAC, ABAC and ReBAC.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "At a conference, the registration desk checks your ID (**authentication**) and gives you a badge. Doors check the badge's colour to decide which rooms you may enter (**authorization**). A session is a badge number the door looks up in a list; a JWT is a badge with your permissions printed on it and a tamper-proof seal — the door can trust it without calling the desk, but it can't easily be cancelled before it expires.",
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
              ["Authentication (AuthN)", "Verifying identity: password + MFA, passkeys, SSO."],
              ["Authorization (AuthZ)", "Deciding whether an identity may perform an action on a resource."],
              ["Session", "Random opaque id stored in a cookie; server maps it to user state."],
              ["JWT", "Signed (JWS) token with claims (`sub`, `exp`, `aud`, scopes) verifiable without a lookup."],
              ["OAuth 2.0", "Delegated **authorization** framework: an app gets an access token to call an API on a user's behalf."],
              ["OpenID Connect", "Identity layer on OAuth 2.0: adds an **ID token** (JWT) and `userinfo` so apps can authenticate users."],
            ],
          },
          {
            type: "callout",
            tone: "misconception",
            title: "OAuth is not login",
            text: "OAuth 2.0 alone tells a client it may access something, not who the user is. Use OIDC's ID token for login.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "Broken access control and authentication failures are perennial top risks in the OWASP Top 10. In system design, auth determines where state lives (session store vs stateless tokens), how services trust each other, and how quickly you can cut off a compromised account.",
          },
        ],
      },
      {
        id: "internals",
        title: "How it works",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Server sessions", points: ["Cookie holds a random id (`HttpOnly; Secure; SameSite`)", "Lookup per request in Redis/DB", "Instant revocation: delete the session", "Needs shared store across instances", "CSRF protection needed for cookies"] },
              { title: "JWT access tokens", points: ["Stateless verification with public key (JWKS)", "Good for many services / third-party APIs", "Revocation hard until `exp`; keep them short (≈5–15 min)", "Pair with refresh tokens (rotated, revocable)", "Never put secrets in claims — payload is only base64url-encoded"] },
            ],
          },
          {
            type: "steps",
            steps: [
              { title: "1. Client makes PKCE pair", detail: "Generates a random `code_verifier` and `code_challenge = BASE64URL(SHA256(verifier))`." },
              { title: "2. Redirect to authorization server", detail: "`/authorize?response_type=code&client_id=…&redirect_uri=…&scope=openid profile&state=…&code_challenge=…&code_challenge_method=S256`." },
              { title: "3. User authenticates and consents", detail: "At the identity provider, not in your app." },
              { title: "4. Redirect back with code", detail: "`redirect_uri?code=…&state=…`; client checks `state` matches (CSRF defence)." },
              { title: "5. Exchange code", detail: "Client POSTs the code **and `code_verifier`** to `/token`. The server hashes the verifier and compares — an intercepted code is useless without it." },
              { title: "6. Tokens", detail: "Access token (for APIs), refresh token (for renewal), and with OIDC an ID token (who the user is)." },
              { title: "7. Call APIs", detail: "`Authorization: Bearer <access_token>`; resource server validates signature, `exp`, `aud`, `iss`, scopes." },
            ],
          },
          {
            type: "table",
            head: ["Flow", "Use for"],
            rows: [
              ["Authorization code + PKCE", "Web apps, SPAs, mobile — now recommended for all clients"],
              ["Client credentials", "Service-to-service, no user"],
              ["Device authorization (RFC 8628)", "TVs, CLIs without a browser"],
              ["Implicit / password grant", "Deprecated — don't use (RFC 9700)"],
            ],
          },
          {
            type: "table",
            head: ["Model", "Rule shape", "Good for"],
            rows: [
              ["RBAC", "user → roles → permissions", "Admin/editor/viewer apps; simple orgs"],
              ["ABAC", "policy over attributes (user.dept, resource.owner, time, IP)", "Fine-grained, contextual rules"],
              ["ReBAC", "relationships graph: user is `editor` of folder, doc is `in` folder", "Sharing models (Google Drive, GitHub); Zanzibar-style systems like SpiceDB, OpenFGA"],
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: verifying a JWT and authorizing",
        blocks: [
          {
            type: "code",
            lang: "ts",
            code: `import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS = createRemoteJWKSet(new URL("https://auth.example.com/.well-known/jwks.json"));

export async function authorize(req: Request, orderOwnerId: string) {
  const token = req.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) throw new HttpError(401, "missing token");

  // AuthN: signature, issuer, audience, expiry
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: "https://auth.example.com",
    audience: "orders-api",
    algorithms: ["RS256", "ES256"], // never accept "none"
  });

  // AuthZ: scope + ownership (ABAC-ish rule)
  const scopes = String(payload.scope ?? "").split(" ");
  if (!scopes.includes("orders:read")) throw new HttpError(403, "insufficient scope");
  if (payload.sub !== orderOwnerId && !scopes.includes("orders:admin")) {
    throw new HttpError(403, "not your order");
  }
  return payload.sub;
}`,
            caption: "Sketch using the `jose` library; `HttpError` is an app-defined error type. Always pin algorithms and check audience.",
          },
        ],
      },
      {
        id: "edge-cases",
        title: "Edge cases and limitations",
        blocks: [
          {
            type: "list",
            items: [
              "**Revocation** — JWTs stay valid until `exp`. Options: short TTL + refresh rotation, a denylist of `jti` checked per request (re-adds state), token introspection (RFC 7662), or session version claims.",
              "**Refresh token theft** — rotate on every use and revoke the family on reuse detection.",
              "**Storing tokens in the browser** — `localStorage` is readable by XSS; prefer `HttpOnly` cookies or a backend-for-frontend that holds tokens server-side.",
              "**Algorithm confusion** — accepting `alg: none` or HS256 with a public key; pin algorithms.",
              "**Clock skew** — allow small leeway on `exp`/`nbf`.",
              "**IDOR** — authenticating is not enough; check the object belongs to the caller.",
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
              { title: "Sessions", points: ["Best for first-party web apps", "Simple, revocable", "Needs session store and CSRF defence"] },
              { title: "JWT", points: ["Best for APIs consumed by many services/clients", "No lookup on hot path", "Revocation and token size are the costs"] },
              { title: "Central policy service (e.g. OPA, SpiceDB)", points: ["Consistent authZ across services", "Extra network hop; must be highly available and cached"] },
            ],
          },
        ],
      },
      {
        id: "real-world",
        title: "Operational implications",
        blocks: [
          {
            type: "list",
            items: [
              "Rotate signing keys via JWKS with overlapping validity (`kid` header).",
              "Rate-limit login and token endpoints; alert on credential stuffing patterns.",
              "Audit-log authorization decisions for sensitive actions.",
              "At the edge, an API gateway can validate tokens; services still enforce object-level authZ.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Authentication establishes identity; authorization decides permissions. For a first-party web app I'd use server sessions in an HttpOnly cookie backed by Redis — easy to revoke. For APIs across services I'd use OIDC with the authorization code flow plus PKCE, short-lived JWT access tokens verified via JWKS, and rotating refresh tokens. Authorization is RBAC for simple roles, ABAC for contextual rules, or ReBAC for sharing models, always enforced per object to avoid IDOR.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "PKCE defeats authorization-code interception because only the original client knows the verifier.",
              "`state` defends against CSRF on the redirect; `nonce` binds the ID token to the request.",
              "Zanzibar-style ReBAC: relation tuples, check API, consistency tokens (zookies) to avoid new-enemy problem.",
              "Service-to-service: mTLS identities (SPIFFE) or client-credentials tokens.",
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
              "AuthN = who; AuthZ = what.",
              "Sessions are revocable; JWTs are stateless but hard to revoke — keep them short.",
              "Authorization code + PKCE for every client type; OIDC for login.",
              "RBAC → ABAC → ReBAC as rules get richer.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "PKCE", definition: "Proof Key for Code Exchange (RFC 7636): binds an authorization code to the client that requested it." },
      { term: "ID token", definition: "OIDC JWT asserting the user's identity to the client." },
      { term: "Access token", definition: "Credential presented to a resource server to access protected APIs." },
      { term: "Refresh token", definition: "Long-lived credential used to obtain new access tokens." },
      { term: "JWKS", definition: "JSON Web Key Set: published public keys used to verify token signatures." },
      { term: "IDOR", definition: "Insecure direct object reference: accessing another user's object by changing an id." },
      { term: "ReBAC", definition: "Relationship-based access control: permissions derived from a graph of relationships." },
    ],
    followUps: [
      { q: "How do you log a user out everywhere with JWTs?", a: "Revoke refresh tokens, keep access tokens short, and optionally store a per-user `tokens_valid_after` timestamp or session version checked against the token's `iat`." },
      { q: "Why is the implicit flow deprecated?", a: "It returned tokens in the URL fragment, exposing them to history, referrers and injection; code + PKCE is safer for SPAs." },
      { q: "Where should authorization be enforced in microservices?", a: "Coarse checks (valid token, scope) at the gateway; fine-grained object checks in the owning service or via a central policy engine." },
      { q: "Sessions in a horizontally scaled app?", a: "Store sessions in a shared store like Redis, or use sticky sessions (fragile). Stateless app servers + shared session store is standard." },
      { q: "What's the difference between scopes and roles?", a: "Scopes limit what a *client* may do on the user's behalf (delegation); roles describe what a *user* may do. Effective permission is their intersection." },
    ],
    quiz: [
      {
        id: "auth-q1",
        prompt: "What does PKCE protect against?",
        options: ["XSS stealing cookies", "An intercepted authorization code being exchanged by an attacker", "Expired JWTs", "SQL injection"],
        answer: 1,
        explanation: "Without the code_verifier, a stolen code can't be redeemed.",
      },
      {
        id: "auth-q2",
        prompt: "A valid JWT for user A requests `/orders/123` owned by user B. What should the API return?",
        options: ["200 — token is valid", "401", "403 (or 404 to avoid leaking existence)", "500"],
        answer: 2,
        explanation: "The user is authenticated but not authorized for that object.",
      },
      {
        id: "auth-q3",
        prompt: "Which protocol adds a standard identity (ID token) on top of OAuth 2.0?",
        options: ["SAML", "OpenID Connect", "PKCE", "JWKS"],
        answer: 1,
        explanation: "OIDC is the identity layer on OAuth 2.0.",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 30. Circuit breakers, timeouts, retries
  // ---------------------------------------------------------------------------
  {
    slug: "circuit-breakers-timeouts-retries",
    track: "system-design",
    title: "Circuit breakers, timeouts and retries",
    summary:
      "Every remote call needs a timeout; retries need exponential backoff with jitter and a budget, or they become retry storms; and a circuit breaker stops calling a dependency that is clearly failing, failing fast until a probe shows it has recovered.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 40,
    kinds: ["theory", "visualization", "coding", "system-design"],
    status: "authored",
    prerequisites: ["system-design/latency-throughput", "system-design/api-idempotency"],
    related: [
      "system-design/bulkheads",
      "system-design/fail-fast-graceful-degradation",
      "system-design/backpressure",
      "system-design/rpc-grpc",
      "go/context",
    ],
    tags: ["resilience", "circuit-breaker", "retries", "backoff", "jitter", "timeouts", "retry-budget"],
    sources: [
      CHECKLIST,
      AWS_BACKOFF,
      AWS_JITTER_BLOG,
      SRE_CASCADING,
      SRE_OVERLOAD,
      { label: "Martin Fowler — CircuitBreaker", url: "https://martinfowler.com/bliki/CircuitBreaker.html", kind: "external" },
      { label: "gRPC — Retry", url: "https://grpc.io/docs/guides/retry/", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Choose timeouts from latency percentiles and propagate deadlines.",
              "Implement retries with exponential backoff, full jitter, and a retry budget.",
              "Explain how retry storms amplify outages across layers.",
              "Describe circuit breaker states (closed, open, half-open) and their transitions.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A **timeout** is refusing to wait forever on hold. A **retry** is calling back. **Backoff** is waiting longer each time, and **jitter** makes sure a thousand callers don't all redial at the same second. A **circuit breaker** is like the fuse in your house: when a circuit keeps failing, it trips and stops the current, then cautiously tries again later.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Mechanism", "Definition"],
            rows: [
              ["Timeout", "Upper bound on how long a caller waits for a response before giving up."],
              ["Deadline", "Absolute time by which the whole operation must finish; propagated to downstream calls."],
              ["Retry", "Re-issuing a failed request, only for transient errors and idempotent operations."],
              ["Exponential backoff", "Wait `base × 2^attempt` (capped) between retries."],
              ["Jitter", "Randomising the wait to de-synchronise clients."],
              ["Retry budget", "Cap on retries as a fraction of traffic (e.g. retries ≤ 10% of requests)."],
              ["Circuit breaker", "State machine that fails calls immediately when a dependency's recent failure rate is too high."],
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
              "Without timeouts, a slow dependency ties up threads/connections until the caller itself falls over.",
              "Naive retries multiply load exactly when the dependency is weakest: 3 retries at each of 4 layers = up to 4^4 = 256× load at the bottom.",
              "Circuit breakers give a struggling service room to recover and give callers a fast, handleable error.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "How it works",
        blocks: [
          { type: "viz", id: "sys-circuit-breaker", caption: "Closed → open after failures cross a threshold; after a cool-down, half-open lets probe requests through; success closes, failure re-opens." },
          {
            type: "table",
            head: ["State", "Behaviour", "Transition"],
            rows: [
              ["Closed", "Calls pass through; outcomes recorded in a sliding window", "→ Open when failure rate ≥ threshold (with a minimum request count)"],
              ["Open", "Calls fail immediately (or use a fallback)", "→ Half-open after cool-down"],
              ["Half-open", "A limited number of probe calls pass", "→ Closed on success; → Open on failure"],
            ],
          },
          {
            type: "steps",
            steps: [
              { title: "Pick timeouts from data", detail: "Set the timeout a bit above the dependency's p99.9 latency under normal load, and below the caller's own deadline." },
              { title: "Propagate deadlines", detail: "Pass the remaining budget downstream (Go `context`, gRPC deadlines). If too little time remains, don't even start the call." },
              { title: "Retry selectively", detail: "Retry timeouts, `503`, connection resets; never `400`/`403`; only idempotent operations or ones with idempotency keys." },
              { title: "Back off with jitter", detail: "Full jitter: `sleep = random(0, min(cap, base × 2^attempt))`." },
              { title: "Budget retries", detail: "Token bucket: each success adds 0.1 tokens, each retry costs 1. When empty, don't retry. Retry at one layer only (usually closest to the user or the client library)." },
              { title: "Break the circuit", detail: "If failures persist, stop calling; return a fallback or fast error." },
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Code: retry with full jitter and a budget",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package retry

import (
	"context"
	"errors"
	"math/rand/v2"
	"sync"
	"time"
)

// Budget allows retries up to ~ratio of successful calls.
type Budget struct {
	mu     sync.Mutex
	tokens float64
	max    float64
	ratio  float64 // e.g. 0.1 => one retry per 10 successes
}

func (b *Budget) OnSuccess() { b.mu.Lock(); b.tokens = min(b.max, b.tokens+b.ratio); b.mu.Unlock() }
func (b *Budget) TryRetry() bool {
	b.mu.Lock(); defer b.mu.Unlock()
	if b.tokens < 1 { return false }
	b.tokens--
	return true
}

var ErrPermanent = errors.New("permanent")

func Do(ctx context.Context, b *Budget, attempts int, base, cap time.Duration,
	call func(context.Context) error) error {
	var err error
	for i := 0; i < attempts; i++ {
		if err = call(ctx); err == nil {
			b.OnSuccess()
			return nil
		}
		if errors.Is(err, ErrPermanent) || i == attempts-1 || !b.TryRetry() {
			return err
		}
		// Full jitter: uniform in [0, min(cap, base*2^i)).
		backoff := min(cap, base<<i)
		sleep := time.Duration(rand.Int64N(int64(backoff)))
		select {
		case <-time.After(sleep):
		case <-ctx.Done(): // respect the caller's deadline
			return ctx.Err()
		}
	}
	return err
}`,
            caption: "Go 1.22+ (math/rand/v2, built-in min). The context deadline bounds the total time spent including backoff.",
          },
          {
            type: "code",
            lang: "ts",
            code: `type State = "closed" | "open" | "half-open";

class CircuitBreaker {
  private state: State = "closed";
  private failures = 0;
  private openedAt = 0;
  constructor(private threshold = 5, private coolDownMs = 10_000) {}

  async call<T>(fn: () => Promise<T>, fallback: () => T): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.openedAt < this.coolDownMs) return fallback(); // fail fast
      this.state = "half-open"; // let one probe through
    }
    try {
      const v = await fn();
      this.state = "closed";
      this.failures = 0;
      return v;
    } catch {
      this.failures++;
      if (this.state === "half-open" || this.failures >= this.threshold) {
        this.state = "open";
        this.openedAt = Date.now();
      }
      return fallback();
    }
  }
}`,
            caption: "Minimal consecutive-failure breaker. Production libraries use rate-based sliding windows, minimum call counts, and limit concurrent half-open probes.",
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "table",
            head: ["Attempt", "Cap", "No jitter", "Full jitter (example draw)"],
            rows: [
              ["1", "100 ms", "100 ms", "37 ms"],
              ["2", "200 ms", "200 ms", "152 ms"],
              ["3", "400 ms", "400 ms", "9 ms"],
              ["4", "800 ms", "800 ms", "611 ms"],
            ],
          },
          {
            type: "callout",
            tone: "note",
            text: "Without jitter, every client that failed at time T retries at exactly T+100ms, T+300ms, … — synchronized waves that re-overload the server. Jitter spreads them out.",
          },
        ],
      },
      {
        id: "edge-cases",
        title: "Edge cases and limitations",
        blocks: [
          {
            type: "list",
            items: [
              "**Retry storms** — retries at every layer multiply; retry at one layer and use budgets.",
              "**Non-idempotent retries** — a timed-out POST may have succeeded; retrying charges twice without an idempotency key.",
              "**Timeout too short** causes false failures and retry load; too long ties up resources.",
              "**Breaker per host vs per service** — a single bad instance can trip a service-wide breaker; outlier ejection at the LB is more precise.",
              "**Low traffic** — a breaker with few samples flaps; require a minimum request volume.",
              "**Hedged requests** reduce tail latency but add load; cap them (e.g. hedge only after p95).",
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
              { title: "Retries help", points: ["Transient blips: packet loss, a restarting instance, leader election", "Idempotent reads"] },
              { title: "Retries hurt", points: ["Overload (they add load)", "Deterministic errors (validation, auth)", "Long-running non-idempotent writes"] },
              { title: "Circuit breaker cost", points: ["Some requests fail that might have succeeded", "Needs tuning and per-dependency state", "Fallback logic to design and test"] },
            ],
          },
        ],
      },
      {
        id: "real-world",
        title: "Operational implications",
        blocks: [
          {
            type: "list",
            items: [
              "Expose metrics: retry rate, budget exhaustion, breaker state changes; alert on breakers stuck open.",
              "Service meshes (Envoy, Istio, Linkerd) provide timeouts, retries, retry budgets and outlier detection without app code — but don't double up with library retries.",
              "Chaos-test: inject latency and errors to verify timeouts and breakers actually trigger.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Every network call gets a timeout derived from the dependency's tail latency, and deadlines propagate downstream. Retries are only for transient errors on idempotent operations, with exponential backoff, full jitter, a capped attempt count and a retry budget so they can't amplify an outage. A circuit breaker tracks failure rate: closed passes traffic, open fails fast with a fallback, and half-open sends probes to decide whether to close again.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Amplification math: r retries at each of n layers → up to (r+1)^n requests at the bottom.",
              "Full jitter vs equal jitter vs decorrelated jitter (AWS analysis: full jitter minimizes total work).",
              "Server-side help: `Retry-After`, signalling \"don't retry\" in responses (overload vs failure).",
              "Adaptive throttling (SRE book): clients reject locally when `requests > K × accepts`.",
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
              "Always set timeouts; propagate deadlines.",
              "Retry only transient + idempotent, with backoff + jitter + budget.",
              "Retry at one layer to avoid storms.",
              "Circuit breaker: closed → open → half-open → closed.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Retry storm", definition: "Surge of retried requests that amplifies load on an already failing system." },
      { term: "Full jitter", definition: "Sleep a uniformly random time between 0 and the exponential backoff cap." },
      { term: "Half-open", definition: "Circuit breaker state that allows limited probe traffic to test recovery." },
      { term: "Retry budget", definition: "Limit on retries relative to normal traffic, enforced per client." },
      { term: "Hedged request", definition: "Sending a duplicate request to another replica if the first is slow, using whichever returns first." },
      { term: "Outlier detection", definition: "Load balancer feature that ejects individual hosts with high error rates." },
    ],
    followUps: [
      { q: "Where should retries live in a deep call chain?", a: "At one layer — typically the client closest to the failing dependency or the edge — and other layers should not retry, or should honour a 'don't retry' signal." },
      { q: "How do you pick a timeout?", a: "From the dependency's latency distribution (e.g. a bit above p99.9) and the caller's remaining deadline; revisit as latency changes." },
      { q: "What should happen when the breaker is open?", a: "Return a fallback (cached value, default, degraded feature) or a fast error the caller can handle — never hang." },
      { q: "Why does jitter help even with backoff?", a: "Backoff alone keeps clients synchronized because they all failed at the same time; jitter spreads retries uniformly." },
      { q: "Circuit breaker vs rate limiter?", a: "A rate limiter protects a server from too many requests; a breaker protects a caller (and the dependency) from calling something that is failing." },
    ],
    quiz: [
      {
        id: "cb-q1",
        prompt: "A breaker in the open state sees its cool-down expire. What happens next?",
        options: ["It closes immediately", "It goes half-open and allows probe requests", "It stays open forever", "It resets failure counts and stays open"],
        answer: 1,
        explanation: "Half-open tests recovery with limited traffic.",
      },
      {
        id: "cb-q2",
        prompt: "Four service layers each retry 3 times (4 attempts). Worst-case attempts at the bottom per user request?",
        options: ["12", "16", "64", "256"],
        answer: 3,
        explanation: "4 attempts per layer across 4 layers: 4^4 = 256.",
      },
      {
        id: "cb-q3",
        prompt: "Which error is a good retry candidate?",
        options: ["400 Bad Request", "403 Forbidden", "503 Service Unavailable on a GET", "422 Unprocessable Content"],
        answer: 2,
        explanation: "503 is transient; GET is idempotent.",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 31. Bulkheads
  // ---------------------------------------------------------------------------
  {
    slug: "bulkheads",
    track: "system-design",
    title: "Bulkheads",
    summary:
      "Partition resources — thread pools, connection pools, instances, cells — so a failure or overload in one part can't sink the whole system, just as watertight compartments keep a ship afloat.",
    level: "intermediate",
    frequency: "medium",
    minutes: 20,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["system-design/circuit-breakers-timeouts-retries"],
    related: ["system-design/backpressure", "system-design/fail-fast-graceful-degradation", "system-design/redundancy-failover", "databases/connection-pooling"],
    tags: ["resilience", "isolation", "cells", "shuffle-sharding", "thread-pools"],
    sources: [
      CHECKLIST,
      SRE_CASCADING,
      { label: "Microsoft Azure Architecture Center — Bulkhead pattern", url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead", kind: "docs" },
      { label: "AWS Builders' Library — Workload isolation using shuffle-sharding", url: "https://aws.amazon.com/builders-library/workload-isolation-using-shuffle-sharding/", kind: "external" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain how shared resource pools let one slow dependency take down unrelated features.",
              "Apply bulkheads at several levels: per-dependency pools, per-tenant limits, cells.",
              "Explain shuffle sharding and why it shrinks blast radius.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Ships are divided into watertight compartments. A hole floods one compartment, not the whole hull. In software, the \"water\" is exhausted threads, connections or memory; the compartments are separate pools with their own limits.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "The **bulkhead pattern** isolates resources into independent pools per dependency, feature, tenant or customer group, each with a hard cap, so saturation in one pool does not starve the others.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "A web server with one 200-thread pool calls both a fast profile service and a slow recommendations service. If recommendations hangs, all 200 threads end up waiting on it and even profile requests fail. A cap of, say, 40 concurrent recommendation calls would have contained the damage.",
          },
        ],
      },
      {
        id: "internals",
        title: "Levels of bulkheading",
        blocks: [
          {
            type: "table",
            head: ["Level", "Mechanism", "Contains"],
            rows: [
              ["In-process", "Separate semaphores / thread pools / connection pools per dependency", "One slow dependency"],
              ["Request class", "Separate pools for interactive vs batch traffic", "Batch jobs starving users"],
              ["Tenant", "Per-tenant concurrency limits and quotas", "Noisy neighbours"],
              ["Deployment", "Separate clusters for critical vs non-critical services", "Bad deploy of a non-critical service"],
              ["Cell-based architecture", "Full independent stacks, each serving a subset of customers", "Any failure to one cell's customers"],
              ["Shuffle sharding", "Each customer assigned a random small set of workers", "A poison customer affects few others"],
            ],
          },
          {
            type: "code",
            lang: "go",
            code: `// One semaphore per dependency: recommendations can use at most 40 slots.
var (
	recsSlots    = make(chan struct{}, 40)
	profileSlots = make(chan struct{}, 100)
)

func callWithBulkhead(ctx context.Context, slots chan struct{}, f func(context.Context) error) error {
	select {
	case slots <- struct{}{}:
		defer func() { <-slots }()
		return f(ctx)
	case <-ctx.Done():
		return ctx.Err()
	default:
		return ErrBulkheadFull // fail fast; caller degrades (e.g. hides recommendations)
	}
}`,
            caption: "`ErrBulkheadFull` is an app-defined sentinel error.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: shuffle sharding",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Setup", detail: "8 workers. Plain sharding into 4 shards of 2: a poison customer kills its shard, affecting 1/4 of customers." },
              { title: "Shuffle shard", detail: "Assign each customer a random combination of 2 of the 8 workers. There are C(8,2) = 28 combinations." },
              { title: "Failure", detail: "A poison customer takes down its 2 workers. Another customer is fully down only if it shares *both* workers: about 1/28 of customers." },
              { title: "Clients retry across their shard", detail: "Customers sharing one worker still have the other one, so they degrade instead of failing." },
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        title: "Edge cases and limitations",
        blocks: [
          {
            type: "list",
            items: [
              "Partitioned pools reduce utilisation: idle capacity in one pool can't help another.",
              "Limits need tuning; too small causes needless rejections.",
              "Shared hidden resources (one DB, one cache, one DNS resolver) defeat bulkheads above them.",
              "Cells add routing complexity and make cross-cell operations (global search, migrations) harder.",
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
              { title: "Use bulkheads when", points: ["Calling multiple dependencies with different reliability", "Multi-tenant systems with noisy neighbours", "Mixing interactive and batch workloads"] },
              { title: "Costs", points: ["Lower peak utilisation", "More configuration", "Cells: duplicated infrastructure and a routing layer"] },
            ],
          },
        ],
      },
      {
        id: "real-world",
        title: "Operational implications",
        blocks: [
          {
            type: "list",
            items: [
              "Expose per-pool saturation and rejection metrics.",
              "Pair with timeouts (to free slots) and circuit breakers (to stop filling them).",
              "AWS and others use cells to bound blast radius; deploy changes cell by cell.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Bulkheads isolate resources so one failure can't exhaust everything. In a service, that means separate concurrency limits or connection pools per dependency, so a hung dependency fills only its own pool and the caller degrades just that feature. At larger scale: per-tenant quotas, separate clusters for batch vs interactive, cell-based architecture, and shuffle sharding to limit blast radius.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Shuffle sharding math: with n workers and shard size k, full overlap probability is 1/C(n,k).",
              "Cells: a thin routing layer maps customer → cell; cells share nothing; cell size bounded and tested.",
              "Bulkheads + breakers + timeouts form the standard resilience trio.",
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
              "Separate pools per dependency/tenant/workload.",
              "Fail fast when a pool is full.",
              "Cells and shuffle sharding bound blast radius at scale.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Blast radius", definition: "The portion of users or system affected by a single failure." },
      { term: "Cell", definition: "An independent, complete copy of a service stack serving a subset of customers." },
      { term: "Shuffle sharding", definition: "Assigning each customer a random subset of resources so overlaps between customers are rare." },
      { term: "Noisy neighbour", definition: "A tenant whose load degrades others sharing the same resources." },
    ],
    followUps: [
      { q: "Bulkhead vs circuit breaker?", a: "A bulkhead caps how much of your resources one dependency can consume; a breaker stops calling it entirely when it's failing. They complement each other." },
      { q: "How do you size a bulkhead?", a: "Little's law: expected rps to the dependency × its normal latency, plus headroom; verify under load tests." },
      { q: "What's a hidden shared resource?", a: "Something all pools still depend on — a single DB, connection-tracking table, DNS, a logging pipeline — which can still cause correlated failure." },
      { q: "Why do cells help deployments?", a: "You deploy to one cell first; a bad change affects only that cell's customers, acting like a canary with hard isolation." },
    ],
    quiz: [
      {
        id: "bh-q1",
        prompt: "One 200-thread pool serves calls to fast service A and hung service B. What does a bulkhead change?",
        options: ["B becomes faster", "B can only consume its own capped pool, so A calls still get threads", "A gets retried", "Requests are cached"],
        answer: 1,
        explanation: "Isolation keeps B's hang from starving A.",
      },
      {
        id: "bh-q2",
        prompt: "With 8 workers and shards of 2 chosen by shuffle sharding, how many distinct shards exist?",
        options: ["4", "16", "28", "64"],
        answer: 2,
        explanation: "C(8,2) = 28.",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 32. Fail fast and graceful degradation
  // ---------------------------------------------------------------------------
  {
    slug: "fail-fast-graceful-degradation",
    track: "system-design",
    title: "Fail fast and graceful degradation",
    summary:
      "When something is wrong, detect it early and refuse quickly rather than hanging; when a non-critical dependency fails, keep the core experience working with fallbacks — stale data, defaults, or a hidden feature.",
    level: "intermediate",
    frequency: "high",
    minutes: 25,
    kinds: ["theory", "visualization", "system-design"],
    status: "authored",
    prerequisites: ["system-design/circuit-breakers-timeouts-retries"],
    related: ["system-design/bulkheads", "system-design/backpressure", "system-design/caching-strategies", "system-design/deployment-strategies"],
    tags: ["resilience", "fallback", "load-shedding", "degraded-mode", "feature-flags"],
    sources: [CHECKLIST, SRE_OVERLOAD, SRE_CASCADING, { label: "AWS Builders' Library — Avoiding fallback in distributed systems", url: "https://aws.amazon.com/builders-library/avoiding-fallback-in-distributed-systems/", kind: "external" }],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain fail-fast and why a fast error beats a slow one.",
              "Classify dependencies as critical vs non-critical and design fallbacks for the latter.",
              "Recognise when fallbacks are dangerous (untested paths, bimodal behaviour).",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "If the coffee machine is broken, a good café tells you at the door and offers tea, rather than taking your money and making you wait 20 minutes for nothing. **Fail fast** is telling you at the door. **Graceful degradation** is offering tea.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Fail fast", points: ["Validate inputs and preconditions up front", "Reject when overloaded or a breaker is open", "Don't start work that can't finish before the deadline", "Crash on invalid config at startup rather than misbehave later"] },
              { title: "Graceful degradation", points: ["Serve a reduced but useful response when parts fail", "Fallbacks: cached/stale data, defaults, static content, feature off", "Core flows protected; nice-to-haves sacrificed"] },
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
              "Slow failures hold resources (threads, connections, memory) and cascade upstream; fast failures release them immediately.",
              "Users tolerate a missing recommendations widget; they don't tolerate a product page that won't load.",
              "Clear, early errors are easier to debug than timeouts deep in a call chain.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "How it works",
        blocks: [
          { type: "viz", id: "sys-circuit-breaker", caption: "An open breaker is the classic fail-fast trigger; the fallback path is where graceful degradation happens." },
          {
            type: "table",
            head: ["Dependency fails", "Degraded behaviour"],
            rows: [
              ["Recommendations", "Show bestsellers (static list) or hide the widget"],
              ["Personalised pricing", "Show list price"],
              ["Search cluster", "Serve cached results for top queries; disable filters"],
              ["Reviews service", "Show product without reviews; \"reviews temporarily unavailable\""],
              ["Payment provider A", "Route to provider B — or block checkout (critical, no silent fallback)"],
              ["Overload", "Serve lighter responses (fewer items, no images), shed batch traffic"],
            ],
          },
          {
            type: "steps",
            steps: [
              { title: "Map the critical path", detail: "List dependencies per user journey and mark each critical or optional." },
              { title: "Define fallbacks for optional deps", detail: "Default, cached, or omit. Make the response schema allow the omission." },
              { title: "Wire fail-fast triggers", detail: "Timeouts, breakers, bulkhead rejections and deadline checks all route to the fallback." },
              { title: "Add kill switches", detail: "Feature flags to turn off expensive features manually during incidents." },
              { title: "Test the degraded mode", detail: "Game days and chaos experiments that actually run the fallback path." },
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Code: product page with fallbacks",
        blocks: [
          {
            type: "code",
            lang: "ts",
            code: `async function productPage(id: string, deadline: AbortSignal) {
  // Critical: if this fails, the page fails (fast).
  const product = await catalog.get(id, { signal: deadline });

  // Optional: each has its own short timeout and a fallback.
  const [recs, reviews] = await Promise.all([
    withTimeout(recsSvc.forProduct(id), 150).catch(() => BESTSELLERS),
    withTimeout(reviewsSvc.summary(id), 200).catch(() => null), // UI hides the section
  ]);

  return { product, recs, reviews, degraded: recs === BESTSELLERS || reviews === null };
}`,
            caption: "Sketch: `withTimeout` rejects after N ms. The `degraded` flag is emitted as a metric.",
          },
        ],
      },
      {
        id: "edge-cases",
        title: "Edge cases and limitations",
        blocks: [
          {
            type: "list",
            items: [
              "**Untested fallbacks** fail when you need them; AWS notes fallback paths are rarely exercised and can cause their own outages.",
              "**Bimodal behaviour** — a fallback that is much more expensive (e.g. hitting the DB when the cache is down) can overload the system. Prefer fallbacks that are cheaper than the primary.",
              "**Silent degradation** hides problems; always emit metrics and alerts when serving degraded.",
              "**Correctness-critical paths** (payments, auth) usually should fail closed, not degrade.",
              "**Stale data** fallbacks need a maximum staleness.",
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
              { title: "Fail closed (error)", points: ["Security, money, data integrity", "Clear semantics"] },
              { title: "Fail open / degrade", points: ["Non-critical features, read paths", "Better availability, risk of serving stale/partial data"] },
            ],
          },
        ],
      },
      {
        id: "real-world",
        title: "Operational implications",
        blocks: [
          {
            type: "list",
            items: [
              "Dashboards should show the degraded-response rate per feature.",
              "Runbooks list which kill switches exist and their user impact.",
              "Validate config and dependencies at startup and fail readiness if they're broken (crash early, not mid-traffic).",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Fail fast means detecting problems early — validation, timeouts, open breakers, insufficient deadline — and returning an error immediately instead of tying up resources. Graceful degradation means classifying dependencies as critical or optional and giving optional ones cheap fallbacks: cached data, defaults, or hiding the feature, so the core journey keeps working. Fallbacks must be tested and monitored, and security- or money-critical paths should fail closed.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Load shedding by criticality is degradation at the request level.",
              "Brownout: dynamically disable optional features as load rises.",
              "Static stability: system keeps working with the last known good state if the control plane is down.",
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
              "Fast errors free resources; slow ones cascade.",
              "Degrade optional features; protect the core.",
              "Fallbacks must be cheaper than the primary and tested.",
              "Measure and alert on degraded mode.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Fallback", definition: "Alternative behaviour used when the primary path fails." },
      { term: "Kill switch", definition: "Flag that disables a feature instantly in production." },
      { term: "Fail closed", definition: "On failure, deny/stop rather than allow/continue." },
      { term: "Static stability", definition: "Ability to keep operating in a known-good state when dependencies like control planes fail." },
      { term: "Brownout", definition: "Deliberately turning off optional features under load to preserve core capacity." },
    ],
    followUps: [
      { q: "Should an auth service outage degrade to 'allow all'?", a: "No. Security checks fail closed. You might allow cached decisions for a short time, but never skip authorization." },
      { q: "Why is a DB fallback for a cache outage dangerous?", a: "The DB is usually sized for cache-miss traffic only; full traffic can overload it, turning a cache outage into a DB outage." },
      { q: "How do you test degraded mode?", a: "Fault injection in staging and production game days; synthetic checks that force fallbacks; metrics proving fallback paths run." },
      { q: "What is a 'deadline check' fail-fast?", a: "Before starting expensive work, check whether enough of the request's deadline remains; if not, return immediately." },
    ],
    quiz: [
      {
        id: "ff-q1",
        prompt: "Which fallback is safest?",
        options: ["Query the primary DB when the cache is down", "Serve a static bestseller list when recommendations fail", "Skip authorization when the policy service times out", "Retry forever"],
        answer: 1,
        explanation: "It's cheap, non-critical, and doesn't shift load elsewhere.",
      },
      {
        id: "ff-q2",
        prompt: "Why prefer a fast error to a slow one under failure?",
        options: ["Errors are cheaper to log", "It releases threads/connections immediately, preventing cascades", "Clients like errors", "It improves caching"],
        answer: 1,
        explanation: "Held resources are what make failures spread.",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 33. Logging, monitoring, tracing
  // ---------------------------------------------------------------------------
  {
    slug: "logging-monitoring-tracing",
    track: "system-design",
    title: "Logging, monitoring and tracing",
    summary:
      "Observability's three signal types: logs (discrete events), metrics (cheap aggregated numbers over time) and traces (a request's path across services). Use RED for services and USE for resources, log in structured form, and keep metric cardinality under control.",
    level: "intermediate",
    frequency: "high",
    minutes: 35,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["system-design/latency-throughput"],
    related: [
      "system-design/dashboards-alerts",
      "system-design/distributed-tracing",
      "system-design/health-checks-heartbeats",
      "production/observability-opentelemetry",
      "go/structured-logging",
    ],
    tags: ["observability", "logs", "metrics", "traces", "red", "use", "cardinality"],
    sources: [
      CHECKLIST,
      SRE_MONITORING,
      OTEL_DOCS,
      { label: "Brendan Gregg — The USE Method", url: "https://www.brendangregg.com/usemethod.html", kind: "external" },
      { label: "Grafana Labs — The RED Method", url: "https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/", kind: "external" },
      { label: "Prometheus — Metric and label naming", url: "https://prometheus.io/docs/practices/naming/", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain what logs, metrics and traces are each good and bad at.",
              "Apply the RED method to services and the USE method to resources.",
              "Write structured logs with correlation ids.",
              "Explain metric cardinality and why `user_id` labels are dangerous.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Metrics are your car's dashboard gauges: speed and temperature at a glance, cheap to watch constantly. Logs are the mechanic's notes: detailed records of specific events. Traces are a GPS track of one journey: every stop, and how long each took.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Signal", "What", "Great for", "Weak at"],
            rows: [
              ["Metrics", "Numeric time series (counters, gauges, histograms) with labels", "Dashboards, alerting, trends; cheap at any traffic", "Per-request detail; high-cardinality dimensions"],
              ["Logs", "Timestamped event records, ideally structured (JSON)", "Debugging specific errors, audit trails", "Cost at volume; aggregation is slow"],
              ["Traces", "Tree of spans for one request across services", "Where latency goes; cross-service causality", "Sampling means not every request is kept"],
            ],
          },
          {
            type: "callout",
            tone: "note",
            text: "**Monitoring** answers known questions (is error rate above X?). **Observability** is the ability to ask new questions about system behaviour from its outputs without shipping new code. Profiles are often called the fourth signal.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "You can't operate what you can't see. In interviews, mentioning which metrics you'd alert on and how you'd debug a slow request shows production maturity.",
          },
        ],
      },
      {
        id: "internals",
        title: "How it works",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "RED (per service/endpoint)", points: ["**R**ate — requests per second", "**E**rrors — failed requests per second (or ratio)", "**D**uration — latency distribution (histograms → p50/p99)"] },
              { title: "USE (per resource: CPU, disk, pool, queue)", points: ["**U**tilisation — % time busy", "**S**aturation — queued/waiting work", "**E**rrors — error events"] },
            ],
          },
          {
            type: "p",
            text: "Google's SRE book adds the **four golden signals**: latency, traffic, errors, saturation — essentially RED plus saturation.",
          },
          {
            type: "steps",
            steps: [
              { title: "Instrument", detail: "Libraries/SDKs (OpenTelemetry, Prometheus clients) emit metrics, logs and spans from the app." },
              { title: "Collect", detail: "Agents/collectors scrape (Prometheus pull) or receive (OTLP push), batch, and enrich with resource attributes (service, pod, region)." },
              { title: "Store", detail: "Time-series DB for metrics, log store (Loki, Elasticsearch), trace store (Tempo, Jaeger)." },
              { title: "Query and correlate", detail: "Dashboards and alerts on metrics; jump from a latency spike to exemplar traces, and from a span to its logs via trace id." },
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Example: structured log and cardinality",
        blocks: [
          {
            type: "code",
            lang: "json",
            code: `{"ts":"2026-10-05T10:12:03.417Z","level":"error","service":"checkout","msg":"payment declined",
 "trace_id":"4bf92f3577b34da6a3ce929d0e0e4736","span_id":"00f067aa0ba902b7",
 "order_id":"o_981","provider":"stripe","http.status":402,"duration_ms":412}`,
            caption: "Machine-parseable fields; trace_id links the log to its trace.",
          },
          {
            type: "table",
            head: ["Label set", "Series count", "OK?"],
            rows: [
              ["`method` (5) × `route` (40) × `status` (10)", "2,000", "Yes"],
              ["… × `region` (5)", "10,000", "Yes"],
              ["… × `user_id` (1M)", "10 billion", "No — put user ids in logs/traces, not metric labels"],
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        title: "Edge cases and limitations",
        blocks: [
          {
            type: "list",
            items: [
              "**Averages hide tails** — use histograms and percentiles; you can't average percentiles across instances.",
              "**Log volume costs** — sample debug logs, set retention tiers, don't log request bodies.",
              "**PII in logs** — redact tokens, emails, card numbers.",
              "**Clock skew** across hosts misorders logs; rely on trace structure for causality.",
              "**Unbounded label values** (URLs with ids) explode cardinality; normalise to route templates.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Question", "Best signal"],
            rows: [
              ["Is the service healthy right now?", "Metrics"],
              ["Why did order o_981 fail?", "Logs (+ trace)"],
              ["Which downstream call made checkout slow?", "Traces"],
              ["Is the DB connection pool saturated?", "Metrics (USE)"],
            ],
          },
        ],
      },
      {
        id: "real-world",
        title: "Operational implications",
        blocks: [
          {
            type: "list",
            items: [
              "Standardise on OpenTelemetry for vendor-neutral instrumentation and semantic conventions.",
              "Propagate a correlation/trace id through all logs.",
              "Budget observability costs; high-cardinality data belongs in traces/logs or in systems built for wide events.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Metrics are cheap aggregated numbers for dashboards and alerts; logs are detailed structured events for debugging; traces show one request's path across services. For each service I track RED — rate, errors, duration as a histogram — and for resources like pools and queues I track USE — utilisation, saturation, errors. Logs are structured JSON with a trace id, and I keep metric labels low-cardinality: no user ids or raw URLs.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Histograms vs summaries: histograms aggregate across instances; client-side summaries don't.",
              "Exemplars attach trace ids to histogram buckets for metric → trace navigation.",
              "Wide structured events (one rich event per request) as an alternative to many narrow logs.",
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
              "Metrics for health, logs for detail, traces for causality.",
              "RED for services; USE for resources; four golden signals.",
              "Structured logs with trace ids.",
              "Control label cardinality.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Cardinality", definition: "Number of unique label-value combinations (time series) for a metric." },
      { term: "Histogram", definition: "Metric counting observations into buckets, enabling percentile estimates." },
      { term: "Structured logging", definition: "Emitting logs as key-value data (e.g. JSON) rather than free text." },
      { term: "Golden signals", definition: "Latency, traffic, errors, saturation (Google SRE)." },
      { term: "Exemplar", definition: "A sample trace id attached to a metric data point." },
    ],
    followUps: [
      { q: "Why not alert on average latency?", a: "Averages hide the tail; a few very slow requests ruin user experience while the mean looks fine. Use percentiles from histograms or SLO-based alerts." },
      { q: "Where should user_id go?", a: "In logs and trace attributes, which handle high cardinality per event, not in metric labels." },
      { q: "Pull (Prometheus) vs push (OTLP)?", a: "Pull gives the server control and easy up/down detection; push suits short-lived jobs and firewalled environments. Many setups mix both via collectors." },
      { q: "How do you correlate logs with traces?", a: "Inject trace_id/span_id into every log line via the logging library's context integration." },
    ],
    quiz: [
      {
        id: "obs-q1",
        prompt: "Which is the USE method?",
        options: ["Users, Sessions, Errors", "Utilisation, Saturation, Errors", "Uptime, SLO, Error budget", "Usage, Scale, Events"],
        answer: 1,
        explanation: "USE is for resources: utilisation, saturation, errors.",
      },
      {
        id: "obs-q2",
        prompt: "Adding `user_id` as a Prometheus label to a request counter mainly causes…",
        options: ["Lower accuracy", "Cardinality explosion (millions of series)", "Missing traces", "Nothing"],
        answer: 1,
        explanation: "Each unique label value creates a new time series.",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 34. Health checks and heartbeats
  // ---------------------------------------------------------------------------
  {
    slug: "health-checks-heartbeats",
    track: "system-design",
    title: "Health checks and heartbeats",
    summary:
      "Liveness asks \"should this process be restarted?\", readiness asks \"should it get traffic?\", startup asks \"has it finished booting?\". Shallow vs deep checks, heartbeats and timeout-based failure detectors decide how quickly — and how wrongly — a system declares something dead.",
    level: "intermediate",
    frequency: "high",
    minutes: 25,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["system-design/load-balancing-algorithms"],
    related: ["system-design/redundancy-failover", "system-design/service-discovery", "cloud/kubernetes", "go/graceful-shutdown", "distributed/consensus-basics"],
    tags: ["liveness", "readiness", "startup-probe", "heartbeat", "failure-detection"],
    sources: [
      CHECKLIST,
      K8S_PROBES,
      { label: "AWS Builders' Library — Implementing health checks", url: "https://aws.amazon.com/builders-library/implementing-health-checks/", kind: "external" },
      { label: "Hayashibara et al. — The φ Accrual Failure Detector", url: "https://doi.org/10.1109/RELDIS.2004.1353004", kind: "external" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Distinguish liveness, readiness and startup checks and what action each triggers.",
              "Decide between shallow and deep health checks.",
              "Explain heartbeats and timeout-based failure detectors and their false-positive trade-off.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A nurse asks three different questions: Is the patient alive (liveness)? Are they fit to go back to work (readiness)? Are they still waking up from anaesthesia, so don't judge yet (startup)? Each answer triggers a different action.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Check", "Question", "On failure (Kubernetes)", "Should check"],
            rows: [
              ["Liveness", "Is the process stuck beyond self-recovery?", "Container restarted", "Only the process itself (event loop responsive, no deadlock)"],
              ["Readiness", "Can it serve traffic right now?", "Removed from Service endpoints (no restart)", "Warm-up done, critical local deps OK, not draining"],
              ["Startup", "Has it finished starting?", "Liveness/readiness held off until success; restart if never succeeds", "Initial boot (migrations, cache load)"],
            ],
          },
          {
            type: "p",
            text: "A **heartbeat** is a periodic \"I'm alive\" message from a node to a monitor or peers. A **failure detector** declares a node suspected/dead when heartbeats stop for longer than a timeout.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "Load balancers, orchestrators, service registries and leader election all depend on health signals. Wrong checks cause the worst outages: a deep liveness check that fails when the DB is slow makes Kubernetes restart every pod simultaneously, turning a DB hiccup into a full outage.",
          },
        ],
      },
      {
        id: "internals",
        title: "How it works",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Shallow check", points: ["Returns 200 if the process can handle a request", "Cheap, never cascades", "Misses broken dependencies or disk-full"] },
              { title: "Deep check", points: ["Verifies dependencies (DB, cache, downstream)", "Detects more failures", "If a shared dependency fails, *every* instance fails the check → fleet-wide removal"] },
            ],
          },
          {
            type: "steps",
            steps: [
              { title: "Probe", detail: "Orchestrator or LB calls `/healthz` / `/readyz` every N seconds with a timeout." },
              { title: "Threshold", detail: "Only after `failureThreshold` consecutive failures does it act (avoid flapping)." },
              { title: "Act", detail: "Readiness: stop routing. Liveness: restart. LB: mark target unhealthy." },
              { title: "Recover", detail: "`successThreshold` passes re-admit the instance." },
            ],
          },
          {
            type: "code",
            lang: "yaml",
            code: `startupProbe:
  httpGet: { path: /healthz, port: 8080 }
  failureThreshold: 30     # up to 30 × 5s = 150s to boot
  periodSeconds: 5
livenessProbe:
  httpGet: { path: /healthz, port: 8080 }   # shallow: process responsive
  periodSeconds: 10
  failureThreshold: 3
readinessProbe:
  httpGet: { path: /readyz, port: 8080 }    # warm, not draining, local deps OK
  periodSeconds: 5
  failureThreshold: 2`,
            caption: "Kubernetes probes for a typical HTTP service.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: graceful shutdown with readiness",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "SIGTERM received", detail: "Pod is being replaced during a rolling deploy." },
              { title: "Fail readiness", detail: "`/readyz` starts returning 503; endpoints controller removes the pod; LBs stop sending new requests (takes a few seconds to propagate)." },
              { title: "Drain", detail: "Finish in-flight requests; stop accepting new connections; close keep-alives." },
              { title: "Exit", detail: "Before `terminationGracePeriodSeconds` elapses. Liveness stays green throughout so the pod isn't killed early." },
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        title: "Edge cases and limitations",
        blocks: [
          {
            type: "list",
            items: [
              "**Can't tell slow from dead** — in an asynchronous network, a timeout-based detector will sometimes suspect a live node (GC pause, network partition).",
              "**Fail-open behaviour** — some LBs (e.g. AWS ALB/NLB) route to all targets if all are unhealthy, deliberately avoiding total outage from a bad check.",
              "**Deep checks on liveness** cause restart storms; keep liveness shallow.",
              "**Health endpoint expensive** — probes at high frequency across many instances can load a DB; cache the deep result for a few seconds.",
              "**Gray failures** — process passes health checks but serves errors; supplement with real-traffic signals (outlier detection on error rate).",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Timeout / threshold", "Effect"],
            rows: [
              ["Short", "Fast detection, more false positives → unnecessary failovers/restarts"],
              ["Long", "Fewer false positives, slower detection → longer user impact"],
              ["Adaptive (φ accrual)", "Outputs a suspicion level based on observed heartbeat inter-arrival distribution; used by Cassandra and Akka"],
            ],
          },
        ],
      },
      {
        id: "real-world",
        title: "Operational implications",
        blocks: [
          {
            type: "list",
            items: [
              "Alert on readiness flapping and restart counts (`CrashLoopBackOff`).",
              "Startup probes stop slow-booting apps from being killed by liveness.",
              "Leader leases + heartbeats (etcd, ZooKeeper sessions) drive failover; tune them together with fencing.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Liveness checks whether the process should be restarted, so it must be shallow — just \"am I responsive\". Readiness checks whether it should receive traffic: warm-up done, not draining, local dependencies fine; failing it removes the instance without restarting it. Startup probes give slow boots time. Deep dependency checks are useful for readiness or monitoring but risky, since a shared dependency failure can mark every instance unhealthy at once. Heartbeats with timeouts detect failures, trading detection speed against false positives.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Perfect failure detection is impossible in asynchronous systems; detectors are 'eventually accurate' at best.",
              "Gossip-based membership (SWIM) spreads failure suspicions without a central monitor.",
              "Combine passive (real traffic errors) and active (probe) health signals.",
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
              "Liveness → restart; readiness → route; startup → wait.",
              "Keep liveness shallow; be careful with deep checks.",
              "Heartbeat timeouts trade speed for false positives.",
              "Use readiness to drain gracefully.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Liveness probe", definition: "Check whose failure causes a container restart." },
      { term: "Readiness probe", definition: "Check whose failure removes an instance from load balancing." },
      { term: "Heartbeat", definition: "Periodic signal proving a node is alive." },
      { term: "Failure detector", definition: "Component that suspects nodes as failed based on missing heartbeats." },
      { term: "Gray failure", definition: "Partial failure where a component looks healthy to checks but misbehaves for users." },
    ],
    followUps: [
      { q: "Should readiness check the database?", a: "Carefully. If the DB is down for everyone, failing readiness removes all pods and turns errors into connection refusals. Many teams check only instance-local issues and let circuit breakers handle shared dependencies." },
      { q: "Why might a pod be restarted repeatedly during load spikes?", a: "Liveness timeouts too tight: a busy process responds slowly, fails liveness, restarts, loses capacity, and the remaining pods get busier." },
      { q: "How do heartbeats handle a GC pause?", a: "They don't distinguish — a long pause looks like death. That's why leader leases need fencing tokens." },
      { q: "What's a startup probe for?", a: "Apps with long, variable boot times; it disables liveness until boot completes, avoiding kill loops." },
    ],
    quiz: [
      {
        id: "hc-q1",
        prompt: "A liveness probe checks the shared database. The DB has a 30s blip. Likely outcome?",
        options: ["Nothing", "All pods restart at once, extending the outage", "Only one pod restarts", "Traffic shifts to another region"],
        answer: 1,
        explanation: "A shared-dependency check fails on every pod simultaneously.",
      },
      {
        id: "hc-q2",
        prompt: "What does failing a Kubernetes readiness probe do?",
        options: ["Restarts the container", "Removes the pod from Service endpoints", "Deletes the deployment", "Scales up"],
        answer: 1,
        explanation: "Readiness controls traffic, not lifecycle.",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 35. Dashboards and alerts
  // ---------------------------------------------------------------------------
  {
    slug: "dashboards-alerts",
    track: "system-design",
    title: "Dashboards, alerts, SLIs and SLOs",
    summary:
      "Define what 'good' means with SLIs and SLOs, spend the error budget deliberately, alert on user-visible symptoms using multi-window burn rates, and keep pages rare and actionable to avoid alert fatigue.",
    level: "intermediate",
    frequency: "high",
    minutes: 35,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["system-design/logging-monitoring-tracing"],
    related: ["system-design/health-checks-heartbeats", "system-design/deployment-strategies", "production/observability-opentelemetry"],
    tags: ["sli", "slo", "error-budget", "burn-rate", "alerting", "on-call"],
    sources: [CHECKLIST, SRE_MONITORING, SRE_SLO, SRE_WORKBOOK_ALERTING, { label: "Google SRE Book — Practical Alerting", url: "https://sre.google/sre-book/practical-alerting/", kind: "docs" }],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Define SLI, SLO, SLA and error budget precisely.",
              "Compute an error budget and a burn rate.",
              "Design symptom-based, multi-window burn-rate alerts.",
              "Structure dashboards and reduce alert fatigue.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Perfect reliability is impossible and too expensive. An SLO says \"we promise to be good 99.9% of the time\"; the remaining 0.1% is a budget you can spend on deploys, experiments and bad luck. Alerts should wake someone only when you're spending that budget fast enough to matter.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Term", "Definition", "Example"],
            rows: [
              ["SLI", "A measured ratio of good events to valid events", "% of HTTP requests with non-5xx status and latency < 300ms"],
              ["SLO", "Target for an SLI over a window", "99.9% over 30 days"],
              ["SLA", "Contract with consequences (credits) if missed; looser than the SLO", "99.5% monthly or refund"],
              ["Error budget", "1 − SLO", "0.1% of requests ≈ 43.2 minutes of full outage per 30 days"],
              ["Burn rate", "How fast you consume budget relative to plan", "Burn rate 1 = exactly exhaust budget at window end"],
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
              "Cause-based alerts (CPU > 80%) page for things users never notice and miss failures nobody predicted.",
              "SLOs align product and engineering: budget left → ship faster; budget exhausted → focus on reliability.",
              "Alert fatigue makes on-call ignore pages, including the real one.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "How it works",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Choose SLIs from user journeys", detail: "Availability and latency for request/response; freshness for pipelines; durability for storage. Measure as close to the user as practical (LB logs, client telemetry)." },
              { title: "Set SLOs", detail: "Based on what users need and what's achievable historically — not 100%." },
              { title: "Compute burn rate", detail: "burn rate = observed error ratio ÷ (1 − SLO). With a 99.9% SLO, a 1% error rate is a burn rate of 10." },
              { title: "Alert on fast and slow burns", detail: "Page on fast burn (budget gone in days); ticket on slow burn (budget gone in weeks)." },
              { title: "Use two windows per alert", detail: "A long window for significance and a short window to stop alerting once it's fixed." },
            ],
          },
          {
            type: "table",
            head: ["Severity", "Long window", "Short window", "Burn rate", "Budget consumed (30-day SLO)"],
            rows: [
              ["Page", "1 h", "5 min", "14.4", "2% in 1 hour"],
              ["Page", "6 h", "30 min", "6", "5% in 6 hours"],
              ["Ticket", "3 days", "6 h", "1", "10% in 3 days"],
            ],
          },
          {
            type: "callout",
            tone: "note",
            text: "These are the starting parameters recommended in the Google SRE Workbook's 'Alerting on SLOs' chapter; tune them to your traffic.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: a Prometheus burn-rate alert",
        blocks: [
          {
            type: "code",
            lang: "yaml",
            code: `# 99.9% availability SLO => error budget 0.001
- alert: CheckoutErrorBudgetFastBurn
  expr: |
    (
      sum(rate(http_requests_total{service="checkout",code=~"5.."}[1h]))
      / sum(rate(http_requests_total{service="checkout"}[1h]))
    ) > (14.4 * 0.001)
    and
    (
      sum(rate(http_requests_total{service="checkout",code=~"5.."}[5m]))
      / sum(rate(http_requests_total{service="checkout"}[5m]))
    ) > (14.4 * 0.001)
  labels: { severity: page }
  annotations:
    summary: "Checkout burning error budget 14.4x (2% of monthly budget per hour)"
    runbook: "https://runbooks.example.com/checkout-errors"`,
            caption: "Fires only when both the 1h and 5m error ratios exceed 1.44%.",
          },
        ],
      },
      {
        id: "examples",
        title: "Dashboards",
        blocks: [
          {
            type: "list",
            items: [
              "**Top row**: SLO status and remaining error budget per user journey.",
              "**Service row**: RED per endpoint (rate, error ratio, p50/p95/p99 latency).",
              "**Resource row**: USE for CPU, memory, pools, queues; saturation first.",
              "**Dependencies**: latency/errors of each downstream call; breaker states.",
              "**Change overlay**: deploy and flag-change annotations to correlate regressions.",
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        title: "Edge cases and limitations",
        blocks: [
          {
            type: "list",
            items: [
              "**Low traffic** — a few errors produce huge ratios; use longer windows, synthetic traffic, or count-based thresholds.",
              "**Server-side SLIs miss** failures before your server (DNS, CDN, LB); add probes or client telemetry.",
              "**Latency SLOs** need histograms with bucket boundaries at the threshold.",
              "**Too many SLOs** dilute focus; a handful per service.",
              "Cause-based alerts are still fine as **tickets** or for imminent capacity issues (disk will fill in 4h).",
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
              { title: "Symptom-based alerts", points: ["Page on user impact (errors, latency, freshness)", "Fewer, more meaningful pages", "Need good SLIs"] },
              { title: "Cause-based alerts", points: ["CPU, memory, disk, queue depth", "Useful for diagnosis and capacity", "Noisy as pages; route to dashboards/tickets"] },
            ],
          },
        ],
      },
      {
        id: "real-world",
        title: "Operational implications",
        blocks: [
          {
            type: "list",
            items: [
              "Every page has an owner, a runbook link and requires human action; otherwise delete or automate it.",
              "Review alert volume weekly; track pages per shift.",
              "Error budget policy: what happens when it's exhausted (freeze risky launches, prioritise fixes).",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "I define SLIs as good-events over valid-events for each key user journey — say, requests that succeed under 300ms — and set an SLO like 99.9% over 30 days, giving a 0.1% error budget. I page on symptoms, not causes, using multi-window burn-rate alerts: for example, page if both the 1-hour and 5-minute windows burn at 14.4× budget, ticket on slow burns. Dashboards start with SLO status, then RED per service and USE for resources, with deploy annotations.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "99.9% over 30 days = 43.2 minutes; 99.99% ≈ 4.3 minutes.",
              "Burn rate 14.4 for 1 hour consumes 14.4/720 = 2% of a 30-day budget.",
              "Error budgets as a release gate; SLA < SLO < internal targets.",
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
              "SLI measures, SLO targets, SLA contracts.",
              "Error budget = 1 − SLO; spend it deliberately.",
              "Page on fast burn across two windows; ticket on slow burn.",
              "Every page actionable, with a runbook.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "SLI", definition: "Service level indicator: a quantitative measure of service behaviour as users experience it." },
      { term: "SLO", definition: "Service level objective: target value for an SLI over a period." },
      { term: "SLA", definition: "Service level agreement: external contract, with penalties, based on SLOs." },
      { term: "Error budget", definition: "Allowed unreliability: 1 − SLO over the window." },
      { term: "Burn rate", definition: "Rate of error-budget consumption relative to the rate that would exactly exhaust it." },
      { term: "Alert fatigue", definition: "Desensitisation caused by frequent non-actionable alerts." },
    ],
    followUps: [
      { q: "Why not set the SLO to 100%?", a: "It's unattainable, infinitely expensive, and leaves no room for change. Users can't distinguish 100% from 99.99% because their own networks fail more often." },
      { q: "Why two windows?", a: "The long window ensures the problem is significant; the short window ensures it's still happening, so the alert resets quickly after the fix." },
      { q: "How do you alert for a low-traffic service?", a: "Use longer windows, synthetic probes to generate traffic, or minimum-event-count conditions." },
      { q: "What belongs on a page vs a ticket?", a: "Pages: imminent or ongoing user impact needing human action now. Tickets: slow burns, capacity trends, things that can wait until business hours." },
    ],
    quiz: [
      {
        id: "slo-q1",
        prompt: "SLO is 99.9%. Current error rate is 0.5%. What's the burn rate?",
        options: ["0.5", "2", "5", "50"],
        answer: 2,
        explanation: "0.5% / 0.1% = 5.",
      },
      {
        id: "slo-q2",
        prompt: "Which is a symptom-based alert?",
        options: ["CPU > 90%", "Checkout requests failing above budget burn threshold", "Pod restarted", "Disk IOPS high"],
        answer: 1,
        explanation: "It directly measures user-visible failure.",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 36. Distributed tracing
  // ---------------------------------------------------------------------------
  {
    slug: "distributed-tracing",
    track: "system-design",
    title: "Distributed tracing",
    summary:
      "A trace follows one request across services as a tree of timed spans. Context propagation (W3C `traceparent`) carries the trace id across process boundaries; sampling (head vs tail) controls cost; OpenTelemetry standardises the APIs, SDKs and wire protocol.",
    level: "intermediate",
    frequency: "high",
    minutes: 30,
    kinds: ["theory", "visualization", "system-design"],
    status: "authored",
    prerequisites: ["system-design/logging-monitoring-tracing"],
    related: ["production/observability-opentelemetry", "go/context", "system-design/async-processing", "system-design/monolith-vs-microservices"],
    tags: ["tracing", "spans", "traceparent", "sampling", "opentelemetry"],
    sources: [
      CHECKLIST,
      W3C_TRACE,
      OTEL_DOCS,
      { label: "OpenTelemetry — Sampling", url: "https://opentelemetry.io/docs/concepts/sampling/", kind: "docs" },
      { label: "OpenTelemetry — Context propagation", url: "https://opentelemetry.io/docs/concepts/context-propagation/", kind: "docs" },
      { label: "Dapper, a Large-Scale Distributed Systems Tracing Infrastructure (Google, 2010)", url: "https://research.google/pubs/dapper-a-large-scale-distributed-systems-tracing-infrastructure/", kind: "external" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Define trace, span, parent/child and span attributes/events.",
              "Explain context propagation and the W3C `traceparent` header format.",
              "Compare head-based and tail-based sampling.",
              "Describe the OpenTelemetry pipeline (API, SDK, exporter, Collector).",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A parcel gets a tracking number at pickup. Every depot scans it, recording arrival and departure. Later you can see the full journey and where it sat for two days. The tracking number is the **trace id**; each depot's scan is a **span**; writing the number on the box is **context propagation**.",
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
              ["Trace", "All spans sharing one trace id: the full request journey."],
              ["Span", "One timed operation: name, start/end, status, attributes, events, parent span id."],
              ["Root span", "Span without a parent, usually at the edge."],
              ["Span context", "Trace id + span id + flags; the part that crosses process boundaries."],
              ["Propagation", "Injecting span context into outgoing requests/messages and extracting it on receipt."],
              ["Baggage", "Optional key-values propagated alongside context (e.g. tenant id)."],
            ],
          },
          {
            type: "code",
            lang: "text",
            code: `traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
             ^^ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ^^^^^^^^^^^^^^^^ ^^
          version        trace-id (16 bytes)    parent-id (8 B) flags (01 = sampled)`,
            caption: "W3C Trace Context `traceparent` header; `tracestate` carries vendor-specific data.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "In a microservice system a single slow page may involve twenty services. Metrics say *that* p99 is high; logs on each service are disconnected. A trace shows *which* hop is slow, whether calls ran in sequence or parallel, and where errors originated.",
          },
        ],
      },
      {
        id: "internals",
        title: "How it works",
        blocks: [
          { type: "viz", id: "sys-request-flow", caption: "Each hop in a request path — LB, app, cache, DB — can become a span in one trace." },
          {
            type: "steps",
            steps: [
              { title: "Start root span", detail: "The edge service (or gateway) sees no incoming `traceparent`, creates a new trace id and makes the sampling decision." },
              { title: "Create child spans", detail: "Each meaningful operation (HTTP handler, DB query, outgoing call) starts a span whose parent is the current span in context." },
              { title: "Inject", detail: "The HTTP/gRPC client instrumentation writes `traceparent` into outgoing headers; for queues, into message headers." },
              { title: "Extract", detail: "The next service reads the header and continues the trace with a child span." },
              { title: "Export", detail: "SDK batches finished spans and exports via OTLP to a Collector, which processes (sampling, redaction) and forwards to a backend (Jaeger, Tempo, vendor)." },
              { title: "Assemble", detail: "The backend joins spans by trace id into a waterfall view." },
            ],
          },
          {
            type: "compare",
            items: [
              { title: "Head-based sampling", points: ["Decide at the root (e.g. keep 5%) and propagate the decision via the sampled flag", "Cheap, consistent across services", "Blind: may drop the rare slow/error trace"] },
              { title: "Tail-based sampling", points: ["Buffer all spans of a trace, decide after it completes (keep all errors, slow traces, + a % of normal)", "Keeps the interesting traces", "Needs a stateful Collector tier that sees all spans of a trace; more cost and memory"] },
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Code: manual span and propagation (OpenTelemetry JS)",
        blocks: [
          {
            type: "code",
            lang: "ts",
            code: `import { trace, context, propagation, SpanStatusCode } from "@opentelemetry/api";

const tracer = trace.getTracer("checkout");

export async function chargeOrder(orderId: string) {
  return tracer.startActiveSpan("chargeOrder", async (span) => {
    span.setAttribute("order.id", orderId);
    try {
      const headers: Record<string, string> = {};
      propagation.inject(context.active(), headers); // adds traceparent
      const res = await fetch("https://payments.internal/charge", {
        method: "POST",
        headers: { ...headers, "content-type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      span.setAttribute("http.response.status_code", res.status);
      if (!res.ok) span.setStatus({ code: SpanStatusCode.ERROR });
      return res.ok;
    } finally {
      span.end();
    }
  });
}`,
            caption: "Auto-instrumentation usually does the inject/extract for HTTP clients; shown manually for clarity.",
          },
        ],
      },
      {
        id: "edge-cases",
        title: "Edge cases and limitations",
        blocks: [
          {
            type: "list",
            items: [
              "**Broken propagation** — one uninstrumented proxy or thread hop that drops context splits a trace into fragments.",
              "**Async messaging** — a consumer span may use a *link* to the producer span rather than a parent when one message triggers a batch.",
              "**Clock skew** — span timestamps from different hosts may misalign slightly.",
              "**Cost** — tracing everything at high RPS is expensive; sample.",
              "**Sensitive data** in attributes — redact in the Collector.",
              "**Untrusted incoming traceparent** — at public edges, decide whether to honour or restart the trace.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Choice", "When"],
            rows: [
              ["Head sampling 1–10%", "High-volume, cost-sensitive, general latency analysis"],
              ["Tail sampling", "Need every error/slow trace; can afford a Collector tier"],
              ["100% sampling", "Low traffic or critical flows (payments)"],
              ["Auto-instrumentation", "Fast coverage of frameworks/clients"],
              ["Manual spans", "Business operations auto-instrumentation can't see"],
            ],
          },
        ],
      },
      {
        id: "real-world",
        title: "Operational implications",
        blocks: [
          {
            type: "list",
            items: [
              "Run the OpenTelemetry Collector as agent and/or gateway to decouple apps from backends.",
              "Inject trace ids into logs and use exemplars on metrics for cross-navigation.",
              "Use service maps derived from traces to discover real dependencies.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "A trace is a tree of spans sharing one trace id; each span times one operation and links to its parent. Context propagates between services in the W3C `traceparent` header — trace id, parent span id, sampled flag — and in message headers for queues. Head sampling decides at the root and is cheap; tail sampling decides after the trace completes so it can keep all errors and slow requests. I'd use OpenTelemetry SDKs exporting OTLP to a Collector.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Tail sampling requires routing all spans of a trace to the same Collector instance (load-balancing exporter by trace id).",
              "Span links for fan-in/batching; span events for in-span logs (exceptions).",
              "Critical-path analysis: the longest chain of sequential spans determines latency.",
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
              "Trace = tree of spans with one trace id.",
              "Propagate context via `traceparent` (HTTP) and message headers.",
              "Head sampling is cheap; tail sampling keeps interesting traces.",
              "OpenTelemetry + Collector is the standard pipeline.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Span", definition: "A named, timed operation within a trace." },
      { term: "traceparent", definition: "W3C header carrying version, trace id, parent span id and trace flags." },
      { term: "Head-based sampling", definition: "Sampling decision made when the trace starts." },
      { term: "Tail-based sampling", definition: "Sampling decision made after all spans of a trace are seen." },
      { term: "OTLP", definition: "OpenTelemetry Protocol for exporting telemetry." },
      { term: "Span link", definition: "Reference from one span to another that isn't its parent (e.g. batch consumers)." },
    ],
    followUps: [
      { q: "How does tracing work across Kafka?", a: "The producer injects `traceparent` into record headers; consumers extract it and create a span that's a child of, or linked to, the producer span." },
      { q: "Why might traces be fragmented?", a: "Context lost somewhere: an uninstrumented hop, a thread pool without context propagation, or a proxy stripping headers." },
      { q: "What's the cost trade-off of tail sampling?", a: "You must collect and buffer 100% of spans briefly, and run stateful Collectors that group by trace id, but you keep exactly the traces you care about." },
      { q: "Tracing vs logging correlation id?", a: "A correlation id links logs; a trace adds timing, parent-child structure and causality across services." },
    ],
    quiz: [
      {
        id: "dt-q1",
        prompt: "In `traceparent: 00-<32 hex>-<16 hex>-01`, what does `01` mean?",
        options: ["Version 1", "Sampled flag set", "First span", "Error"],
        answer: 1,
        explanation: "The trace-flags byte; bit 0 is 'sampled'.",
      },
      {
        id: "dt-q2",
        prompt: "Which sampling guarantees all error traces are kept?",
        options: ["Head-based 1%", "Tail-based with an error policy", "Random per span", "No sampling is possible"],
        answer: 1,
        explanation: "Only after the trace finishes do you know it contained an error.",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 37. Redundancy and failover
  // ---------------------------------------------------------------------------
  {
    slug: "redundancy-failover",
    track: "system-design",
    title: "Redundancy and failover",
    summary:
      "Remove single points of failure with redundant components, then decide how traffic moves when one dies: active-active or active-passive. Set RTO and RPO targets, and prevent split brain with quorum, leases and fencing.",
    level: "advanced",
    frequency: "high",
    minutes: 35,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["system-design/replication", "system-design/health-checks-heartbeats"],
    related: ["system-design/cap-theorem", "system-design/consistency-models", "distributed/consensus-basics", "databases/postgres-replication", "system-design/service-discovery"],
    tags: ["high-availability", "failover", "active-active", "rto", "rpo", "split-brain", "fencing"],
    sources: [
      CHECKLIST,
      { label: "AWS Well-Architected — Reliability Pillar", url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html", kind: "docs" },
      { label: "AWS — Disaster recovery options in the cloud", url: "https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html", kind: "docs" },
      { label: "Martin Kleppmann — How to do distributed locking (fencing tokens)", url: "https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html", kind: "external" },
      { label: "Google SRE Book — Managing Critical State: Distributed Consensus for Reliability", url: "https://sre.google/sre-book/managing-critical-state/", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Identify single points of failure and add redundancy at each layer.",
              "Compare active-active and active-passive (hot/warm/cold standby).",
              "Define RTO and RPO and map them to DR strategies.",
              "Explain split brain and prevent it with quorum and fencing tokens.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Planes have two engines and two pilots. Redundancy is having the spare; failover is the procedure for handing over control. The dangerous case isn't an engine dying — it's both pilots thinking they're in command and pulling the controls in opposite directions. That's **split brain**.",
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
              ["Redundancy", "Extra capacity/components so one failure doesn't stop service (N+1, N+2)."],
              ["Failover", "Shifting work from a failed component to a healthy one; failback returns it."],
              ["Active-active", "All replicas serve traffic concurrently."],
              ["Active-passive", "One primary serves; standby takes over on failure (hot = running & synced, warm = running scaled down, cold = provisioned on demand)."],
              ["RTO", "Recovery Time Objective: max acceptable downtime."],
              ["RPO", "Recovery Point Objective: max acceptable data loss, measured in time."],
              ["Split brain", "Two nodes both believe they're primary and accept conflicting writes."],
              ["Fencing", "Mechanism ensuring a deposed primary can no longer act (tokens, STONITH, revoking access)."],
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "Hardware fails, zones lose power, and deployments break things. Availability targets like 99.99% (≈52 minutes a year) are impossible without redundancy and automated failover — but badly designed failover causes data loss and outages of its own.",
          },
        ],
      },
      {
        id: "internals",
        title: "How it works",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Active-active", points: ["Full capacity used; no idle standby", "Failover = stop routing to the dead node (fast)", "Writes in multiple places need conflict handling or partitioned ownership", "Each site needs headroom to absorb others' load"] },
              { title: "Active-passive", points: ["Simple single-writer semantics", "Standby capacity idle (cost)", "Failover takes detection + promotion time", "Async replication → possible data loss (RPO > 0)"] },
            ],
          },
          {
            type: "steps",
            steps: [
              { title: "Detect", detail: "Heartbeats / health checks miss for a timeout." },
              { title: "Decide", detail: "A quorum (majority of an odd-sized group, or a consensus system like etcd/ZooKeeper) agrees the primary is gone — no single observer decides alone." },
              { title: "Fence", detail: "Revoke the old primary's ability to write: bump an epoch/fencing token, revoke its lease, cut storage access, or power it off (STONITH)." },
              { title: "Promote", detail: "Choose the most up-to-date replica and promote it." },
              { title: "Redirect", detail: "Update DNS, VIP, service registry or proxy config so clients reach the new primary." },
            ],
          },
          {
            type: "table",
            head: ["DR strategy", "RTO", "RPO", "Cost"],
            rows: [
              ["Backup & restore", "Hours+", "Hours (last backup)", "$"],
              ["Pilot light (data replicated, minimal compute)", "Tens of minutes", "Minutes", "$$"],
              ["Warm standby (scaled-down full stack)", "Minutes", "Seconds–minutes", "$$$"],
              ["Multi-site active-active", "Near zero", "Near zero (sync) / seconds (async)", "$$$$"],
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: fencing tokens",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Lease 33", detail: "Node A acquires the leader lease from the lock service with token 33." },
              { title: "Pause", detail: "A hits a 40s GC pause; its lease expires." },
              { title: "Lease 34", detail: "Node B acquires the lease with token 34 and writes to storage with token 34." },
              { title: "Zombie write", detail: "A wakes, still thinks it's leader, writes with token 33." },
              { title: "Rejected", detail: "Storage has seen 34, so it rejects any token < 34. A's stale write is fenced off." },
            ],
          },
          {
            type: "callout",
            tone: "warning",
            text: "Fencing only works if the **resource being protected** checks the token. A lock without fencing can't prevent split brain under pauses or partitions.",
          },
        ],
      },
      {
        id: "edge-cases",
        title: "Edge cases and limitations",
        blocks: [
          {
            type: "list",
            items: [
              "**Async replication + failover = lost writes** that were acknowledged by the old primary but not replicated.",
              "**Failover flapping** — aggressive detection fails over on transient blips; add hysteresis.",
              "**Correlated failures** — replicas in the same rack/zone, or sharing a bad config, fail together.",
              "**Untested failover** — the standby's config, capacity or credentials have drifted; DR drills catch this.",
              "**DNS caching** delays redirection beyond TTL; clients may pin old IPs.",
              "**Two-node clusters** can't form a majority after a partition; use an odd number or a witness.",
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
              { title: "Active-active", points: ["Stateless tiers: always", "Multi-region data: only with conflict strategy (CRDTs, per-key home region)", "Best RTO"] },
              { title: "Active-passive", points: ["Single-writer databases", "Simpler correctness", "Pay for idle standby; failover takes time"] },
            ],
          },
        ],
      },
      {
        id: "real-world",
        title: "Operational implications",
        blocks: [
          {
            type: "list",
            items: [
              "Run regular failover drills (game days); measure actual RTO/RPO.",
              "Spread replicas across failure domains: hosts, racks, AZs, regions.",
              "Keep capacity headroom: with 3 AZs at N+1, each AZ should run ≤ ~66% so two can absorb the third.",
              "Managed databases (RDS Multi-AZ, Cloud SQL HA) automate fencing and promotion — know their RPO.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "I remove single points of failure by running redundant instances across failure domains. Stateless tiers run active-active behind load balancers; stateful single-writer stores are usually active-passive with a synchronous or async replica. RTO is how long recovery may take and RPO how much data we may lose — they drive the choice from backup-restore up to multi-site active-active. Failover must be decided by quorum and the old primary fenced with leases or fencing tokens to avoid split brain.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Synchronous replication gives RPO≈0 at the cost of write latency and availability if the replica is down.",
              "Quorum-based systems (Raft) make failover safe by construction: only a majority-elected leader can commit.",
              "Static stability: data planes keep working when the control plane that orchestrates failover is down.",
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
              "Redundancy across failure domains; failover moves traffic.",
              "Active-active for capacity & RTO; active-passive for simplicity.",
              "RTO = downtime, RPO = data loss.",
              "Quorum + fencing prevent split brain.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "RTO", definition: "Maximum acceptable time to restore service after an outage." },
      { term: "RPO", definition: "Maximum acceptable data loss measured as time before the failure." },
      { term: "Split brain", definition: "Multiple nodes concurrently acting as primary." },
      { term: "Fencing token", definition: "Monotonically increasing number issued with a lease, checked by storage to reject stale leaders." },
      { term: "STONITH", definition: "\"Shoot the other node in the head\": forcibly powering off a node to fence it." },
      { term: "Failure domain", definition: "Set of components that can fail together (host, rack, AZ, region)." },
    ],
    followUps: [
      { q: "How do you get RPO = 0?", a: "Synchronous replication to at least one other node before acknowledging writes (or quorum writes), accepting higher latency." },
      { q: "Why is a 2-node cluster risky?", a: "During a partition neither side has a majority; either both stop (no availability) or both continue (split brain). Add a third voter or witness." },
      { q: "What's the hardest part of active-active multi-region?", a: "Concurrent writes to the same data in different regions — you need conflict resolution or to assign each record a home region." },
      { q: "How do clients find the new primary?", a: "Via a VIP, DNS update (watch TTLs), a service registry, or a proxy like PgBouncer/HAProxy that's reconfigured." },
    ],
    quiz: [
      {
        id: "ha-q1",
        prompt: "Business tolerates 1 hour of downtime and 5 minutes of data loss. What are RTO and RPO?",
        options: ["RTO 5 min, RPO 1 h", "RTO 1 h, RPO 5 min", "Both 1 h", "Both 5 min"],
        answer: 1,
        explanation: "RTO is downtime; RPO is data loss window.",
      },
      {
        id: "ha-q2",
        prompt: "A paused old leader wakes and writes with fencing token 33; storage last saw 34. What happens?",
        options: ["Write succeeds", "Write is rejected", "Storage crashes", "Token 33 is upgraded"],
        answer: 1,
        explanation: "Storage rejects tokens lower than the highest seen.",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 38. Service discovery
  // ---------------------------------------------------------------------------
  {
    slug: "service-discovery",
    track: "system-design",
    title: "Service discovery",
    summary:
      "In dynamic infrastructure, instances come and go, so callers need a way to find healthy addresses. Compare client-side and server-side discovery, DNS-based discovery and its caching pitfalls, registries like Consul and etcd, and how Kubernetes Services do it.",
    level: "intermediate",
    frequency: "medium",
    minutes: 25,
    kinds: ["theory", "visualization", "system-design"],
    status: "authored",
    prerequisites: ["system-design/dns-tcp-lb-firewalls", "system-design/health-checks-heartbeats"],
    related: ["system-design/load-balancing-algorithms", "cloud/kubernetes", "networks/dns", "system-design/rpc-grpc", "system-design/monolith-vs-microservices"],
    tags: ["service-discovery", "consul", "etcd", "dns", "kubernetes-services", "service-mesh"],
    sources: [
      CHECKLIST,
      { label: "Kubernetes — Service", url: "https://kubernetes.io/docs/concepts/services-networking/service/", kind: "docs" },
      { label: "Kubernetes — DNS for Services and Pods", url: "https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/", kind: "docs" },
      { label: "HashiCorp Consul — Service discovery", url: "https://developer.hashicorp.com/consul/docs/concepts/service-discovery", kind: "docs" },
      { label: "etcd documentation", url: "https://etcd.io/docs/", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain why static IPs don't work with autoscaling and containers.",
              "Compare client-side vs server-side discovery.",
              "Describe registration (self vs third-party) and health integration.",
              "Explain how Kubernetes Services, EndpointSlices and cluster DNS work.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Instead of memorising every friend's current address, you look them up in a phone book that updates itself when they move. A service registry is that phone book; discovery is the lookup.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "**Service discovery** is the mechanism by which a client resolves a logical service name (`payments`) to the current set of healthy network endpoints. It has two parts: **registration** (instances added/removed from a registry) and **lookup** (clients or proxies query it).",
          },
          {
            type: "compare",
            items: [
              { title: "Client-side discovery", points: ["Client queries the registry and load-balances itself", "No extra hop; smart LB (e.g. least-request, zone-aware)", "Discovery logic in every client/language (or a sidecar)", "Examples: gRPC xDS clients, Netflix Eureka + Ribbon"] },
              { title: "Server-side discovery", points: ["Client calls a stable address (LB/proxy) that looks up backends", "Clients stay simple", "Extra hop; LB must be highly available", "Examples: AWS ALB + target groups, Kubernetes Service via kube-proxy"] },
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "Autoscaling, rolling deploys, spot instances and container rescheduling change IPs constantly. Hard-coded addresses break; discovery makes the topology dynamic while callers use stable names.",
          },
        ],
      },
      {
        id: "internals",
        title: "How it works",
        blocks: [
          { type: "viz", id: "sys-request-flow", caption: "Discovery happens at the DNS and load-balancer steps of a request path." },
          {
            type: "steps",
            steps: [
              { title: "Register", detail: "Self-registration (instance calls the registry on startup and heartbeats) or third-party registration (orchestrator registers it — Kubernetes does this from pod status)." },
              { title: "Health-check", detail: "Registry or orchestrator removes instances that fail checks or stop heartbeating (TTL)." },
              { title: "Lookup", detail: "Via DNS (A/SRV records), an HTTP API, or a watch/stream (etcd watch, xDS) that pushes changes." },
              { title: "Balance", detail: "Client or proxy picks an endpoint with an LB algorithm." },
            ],
          },
          {
            type: "table",
            head: ["Kubernetes piece", "Role"],
            rows: [
              ["Service", "Stable virtual IP (ClusterIP) and DNS name `payments.prod.svc.cluster.local` selecting pods by label"],
              ["EndpointSlice", "Current ready pod IPs for the Service (readiness probe gates membership)"],
              ["kube-proxy (iptables/IPVS) or eBPF dataplane", "Translates ClusterIP traffic to a pod IP on each node (L4)"],
              ["CoreDNS", "Answers Service DNS queries; headless Services return pod IPs directly"],
            ],
          },
          {
            type: "table",
            head: ["Registry", "Notes"],
            rows: [
              ["Consul", "Service catalog, health checks, DNS and HTTP interfaces, multi-datacenter; Raft-based servers"],
              ["etcd", "Consistent KV store (Raft) with watches and leases; Kubernetes' backing store; build discovery on top"],
              ["ZooKeeper", "Ephemeral znodes vanish when the session dies — classic registration primitive"],
              ["Cloud-native", "AWS Cloud Map, ECS service discovery, ALB target groups"],
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: a pod replacement",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "New pod starts", detail: "Gets IP 10.1.4.7; readiness probe fails until warmed." },
              { title: "Ready", detail: "Readiness passes; the EndpointSlice controller adds 10.1.4.7 to `payments`." },
              { title: "Dataplane update", detail: "kube-proxy on every node updates rules; new connections can hit the new pod." },
              { title: "Old pod terminates", detail: "Marked terminating, removed from EndpointSlice; drains in-flight requests during grace period." },
              { title: "Clients unaffected", detail: "They kept calling `payments:8080` throughout." },
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        title: "Edge cases and limitations",
        blocks: [
          {
            type: "list",
            items: [
              "**DNS caching** — clients/JVMs/resolvers caching beyond TTL keep calling dead IPs; DNS also lacks health and load info.",
              "**Long-lived connections** (HTTP/2, gRPC) through a ClusterIP pin to one pod — kube-proxy balances connections, not requests. Use headless Services + client LB, or a mesh.",
              "**Registry outage** — clients should cache the last known endpoints (static stability).",
              "**Propagation delay** — a terminated pod may still get traffic for a second; add a preStop sleep.",
              "**Stale self-registrations** if instances crash without deregistering — rely on TTL/heartbeats.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Approach", "Pick when"],
            rows: [
              ["DNS only", "Simple, coarse discovery; tolerate TTL delays"],
              ["Server-side LB", "Polyglot clients; want simple clients; external traffic"],
              ["Client-side with registry/xDS", "High RPS internal gRPC; need per-request smart LB"],
              ["Service mesh (sidecars/ambient)", "Want discovery, mTLS, retries, telemetry uniformly; accept added complexity"],
            ],
          },
        ],
      },
      {
        id: "real-world",
        title: "Operational implications",
        blocks: [
          {
            type: "list",
            items: [
              "Registries are critical infrastructure: run them as Raft clusters of 3 or 5 across zones.",
              "Tie registration to readiness, not just process start.",
              "Monitor endpoint churn and discovery propagation latency.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Service discovery maps a service name to the current healthy instances. Instances register — themselves or via the orchestrator — and health checks remove dead ones. In client-side discovery the client queries a registry like Consul or an xDS control plane and load-balances itself; in server-side discovery it calls a load balancer that does the lookup. In Kubernetes, a Service gives a stable DNS name and virtual IP, EndpointSlices track ready pod IPs, and kube-proxy routes connections.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Headless Services (`clusterIP: None`) return pod IPs for client-side balancing and StatefulSet identities.",
              "xDS (Envoy's discovery APIs) is used by gRPC proxyless mesh and service meshes.",
              "Consistency trade-off: registries favour availability for reads; stale-but-available endpoint lists beat no list.",
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
              "Registration + health + lookup.",
              "Client-side (smart, no hop) vs server-side (simple clients).",
              "DNS is easy but caches; registries and watches are fresher.",
              "Kubernetes: Service + EndpointSlice + kube-proxy + CoreDNS.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Service registry", definition: "Database of service instances and their locations/health." },
      { term: "EndpointSlice", definition: "Kubernetes object listing network endpoints backing a Service." },
      { term: "Headless Service", definition: "Kubernetes Service without a cluster IP; DNS returns pod IPs." },
      { term: "xDS", definition: "Family of Envoy discovery APIs (listeners, clusters, endpoints) used by meshes and gRPC." },
      { term: "SRV record", definition: "DNS record type giving host and port for a service." },
    ],
    followUps: [
      { q: "Why is DNS alone often insufficient?", a: "TTL caching delays updates, there's no health or load information, and many clients cache resolutions indefinitely." },
      { q: "Why do gRPC calls in Kubernetes often hit one pod?", a: "kube-proxy balances at connection level; one HTTP/2 connection carries all calls. Use a headless Service with client-side LB or a mesh." },
      { q: "Self-registration vs third-party registration?", a: "Self: simple, but every service needs registry code and stale entries on crash. Third-party: orchestrator handles it consistently." },
      { q: "What happens if the registry goes down?", a: "Well-designed clients keep using the last known endpoints; new instances can't be discovered until it recovers." },
    ],
    quiz: [
      {
        id: "sdisc-q1",
        prompt: "What determines whether a pod appears in a Service's EndpointSlice?",
        options: ["Liveness probe", "Readiness probe status", "Container image tag", "Node CPU"],
        answer: 1,
        explanation: "Only ready pods are listed as ready endpoints.",
      },
      {
        id: "sdisc-q2",
        prompt: "Which is client-side discovery?",
        options: ["Calling an AWS ALB DNS name", "A gRPC client receiving endpoints via xDS and picking one per request", "Calling a ClusterIP", "Hard-coded IP"],
        answer: 1,
        explanation: "The client itself knows the endpoints and balances.",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 39. Deployment strategies
  // ---------------------------------------------------------------------------
  {
    slug: "deployment-strategies",
    track: "system-design",
    title: "Deployment strategies",
    summary:
      "Ship changes without downtime and limit the blast radius of bad ones: rolling, blue-green and canary releases, feature flags to decouple deploy from release, and expand/contract migrations so database changes stay compatible with old and new code.",
    level: "intermediate",
    frequency: "high",
    minutes: 35,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["system-design/health-checks-heartbeats", "system-design/load-balancing-algorithms"],
    related: ["cloud/ci-cd", "cloud/kubernetes", "system-design/dashboards-alerts", "system-design/api-versioning", "system-design/fail-fast-graceful-degradation"],
    tags: ["deployments", "blue-green", "canary", "rolling", "feature-flags", "migrations", "expand-contract"],
    sources: [
      CHECKLIST,
      { label: "Martin Fowler — BlueGreenDeployment", url: "https://martinfowler.com/bliki/BlueGreenDeployment.html", kind: "external" },
      { label: "Martin Fowler — CanaryRelease (Danilo Sato)", url: "https://martinfowler.com/bliki/CanaryRelease.html", kind: "external" },
      { label: "Martin Fowler — ParallelChange (expand/contract)", url: "https://martinfowler.com/bliki/ParallelChange.html", kind: "external" },
      { label: "Pete Hodgson — Feature Toggles (martinfowler.com)", url: "https://martinfowler.com/articles/feature-toggles.html", kind: "external" },
      { label: "Kubernetes — Deployments (rolling update)", url: "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/", kind: "docs" },
      { label: "Google SRE Workbook — Canarying Releases", url: "https://sre.google/workbook/canarying-releases/", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Compare rolling, blue-green and canary deployments by risk, cost and rollback speed.",
              "Use feature flags to separate deploying code from releasing features.",
              "Run schema changes with expand/contract so every step is backward compatible.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Changing a running system is like changing a tyre while driving. Rolling swaps one wheel at a time; blue-green builds a second car and you hop across; canary lets one passenger try the new car before everyone moves. Feature flags are seats you can unlock later without rebuilding the car.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Strategy", "How", "Rollback", "Cost", "Risk exposure"],
            rows: [
              ["Recreate", "Stop old, start new", "Redeploy old", "Low", "Downtime; everyone hit"],
              ["Rolling", "Replace instances in batches (`maxSurge`, `maxUnavailable`)", "Roll back gradually", "Low", "Grows with each batch; mixed versions"],
              ["Blue-green", "Deploy full new env (green), switch traffic from blue at once", "Switch back instantly", "2× capacity during switch", "All users at switch time"],
              ["Canary", "Route small % to new version, compare metrics, ramp up", "Route 0% to canary", "Small extra", "Only the canary slice"],
              ["Feature flag", "Code deployed dark; flag controls who sees it", "Flip the flag", "Flag system + code paths", "Targeted cohorts"],
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "Most production incidents are triggered by changes. A good deployment strategy limits how many users a bad change reaches and how quickly you can undo it — directly protecting your error budget.",
          },
        ],
      },
      {
        id: "internals",
        title: "How it works",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Canary: deploy", detail: "Start a few instances of v2 alongside v1." },
              { title: "Route a slice", detail: "Send 1–5% of traffic (or internal users first) via weighted LB or mesh rules." },
              { title: "Compare", detail: "Automated analysis compares canary vs baseline on error rate, latency and business metrics for a fixed bake time." },
              { title: "Ramp or abort", detail: "Promote in steps (5% → 25% → 50% → 100%) or route back to 0% automatically." },
            ],
          },
          { type: "flow", nodes: ["Router", "Blue (v1, live)", "Green (v2, idle → tested)", "Switch router to green", "Keep blue for rollback"], caption: "Blue-green: the switch is a router/DNS/LB change." },
          {
            type: "steps",
            steps: [
              { title: "Expand", detail: "Add the new column/table (nullable, no constraints breaking old code). Deploy." },
              { title: "Dual-write", detail: "New code writes old and new columns; reads old." },
              { title: "Backfill", detail: "Copy historical data in batches." },
              { title: "Switch reads", detail: "Read from new column (behind a flag); verify." },
              { title: "Stop old writes", detail: "Remove old-column writes once no running version reads it." },
              { title: "Contract", detail: "Drop the old column in a later release." },
            ],
          },
          {
            type: "callout",
            tone: "warning",
            title: "Why expand/contract",
            text: "During any rolling, canary or blue-green deploy, old and new code run against the same database at once. A migration that renames a column in one step breaks whichever version doesn't expect it — and makes rollback impossible.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Example: Kubernetes rolling update",
        blocks: [
          {
            type: "code",
            lang: "yaml",
            code: `apiVersion: apps/v1
kind: Deployment
metadata: { name: api }
spec:
  replicas: 10
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2         # up to 12 pods during the rollout
      maxUnavailable: 0   # never drop below 10 ready pods
  minReadySeconds: 20     # a new pod must stay ready 20s before it counts
  template:
    spec:
      containers:
        - name: api
          image: registry.example.com/api:1.8.0
          readinessProbe: { httpGet: { path: /readyz, port: 8080 } }`,
            caption: "Readiness gates each batch; `kubectl rollout undo` reverts.",
          },
        ],
      },
      {
        id: "edge-cases",
        title: "Edge cases and limitations",
        blocks: [
          {
            type: "list",
            items: [
              "**Mixed versions** during rolling/canary: APIs, message formats and caches must be compatible both ways.",
              "**Stateful changes aren't rolled back** by switching traffic — data written by v2 must be readable by v1.",
              "**Canary signal at low traffic** — 1% of a small service is too few requests for statistics; use longer bake times.",
              "**Sticky sessions** can keep users on the old colour after a blue-green switch; drain connections.",
              "**Flag debt** — stale flags multiply code paths; give each flag an owner and expiry.",
              "**Long-running jobs/connections** on old instances need graceful drain.",
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
              { title: "Rolling", points: ["Default for stateless services", "Cheap", "Slower rollback; mixed versions"] },
              { title: "Blue-green", points: ["Instant cutover and rollback", "Double capacity; DB shared so still needs compatible migrations"] },
              { title: "Canary", points: ["Best risk control with metric analysis", "Needs traffic splitting and good observability"] },
              { title: "Feature flags", points: ["Release independent of deploy; per-user targeting; kill switches", "Runtime complexity, flag debt"] },
            ],
          },
        ],
      },
      {
        id: "real-world",
        title: "Operational implications",
        blocks: [
          {
            type: "list",
            items: [
              "Annotate dashboards with deploys and flag changes.",
              "Automate rollback on SLO burn during rollout (Argo Rollouts, Flagger, Spinnaker).",
              "Deploy regions/cells progressively, not all at once.",
              "Freeze risky deploys when the error budget is exhausted.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Rolling updates replace instances in batches gated by readiness — cheap, default for stateless services. Blue-green stands up a full new environment and switches traffic at once, giving instant rollback at the cost of double capacity. Canary sends a small slice to the new version, compares metrics against the baseline and ramps up or aborts automatically. Feature flags decouple deploy from release. Because old and new code always overlap, database changes use expand/contract: add, dual-write, backfill, switch reads, then drop.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Progressive delivery: canary + automated analysis + flags.",
              "Shadow/dark traffic: mirror requests to v2 and discard responses to test under real load.",
              "Rollback vs roll forward: rollback is only safe when v2 hasn't written incompatible data.",
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
              "Rolling = cheap; blue-green = instant switch; canary = limited exposure.",
              "Flags separate deploy from release.",
              "Expand/contract keeps schema compatible across versions.",
              "Automate rollback on metrics.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Canary", definition: "New version receiving a small fraction of traffic to detect problems early." },
      { term: "Blue-green", definition: "Two identical environments; traffic switched from old (blue) to new (green)." },
      { term: "Expand/contract", definition: "Parallel change: add new schema, migrate, then remove old in separate steps." },
      { term: "Feature flag", definition: "Runtime switch controlling whether code paths are active for given users." },
      { term: "maxSurge / maxUnavailable", definition: "Kubernetes rolling-update limits on extra and missing pods." },
    ],
    followUps: [
      { q: "How do you roll back a blue-green deploy that ran a migration?", a: "You can only switch back if the migration was backward compatible (expand phase). Destructive changes are deferred to a later contract step." },
      { q: "Canary vs feature flag?", a: "Canary exposes a new *binary* to a traffic slice; flags expose a *feature* to a user cohort within the same binary. They combine well." },
      { q: "How do you rename a column with zero downtime?", a: "Add new column, dual-write, backfill, switch reads, stop writing old, drop old — each in separate deploys." },
      { q: "What metrics gate a canary?", a: "Error rate, latency percentiles, saturation and key business metrics (checkout success), compared to a baseline running the old version." },
    ],
    quiz: [
      {
        id: "dep-q1",
        prompt: "Which strategy gives the fastest rollback?",
        options: ["Recreate", "Rolling", "Blue-green", "Big-bang migration"],
        answer: 2,
        explanation: "Switch the router back to blue.",
      },
      {
        id: "dep-q2",
        prompt: "Why can't you rename a column in one migration during a rolling deploy?",
        options: ["SQL doesn't allow it", "Old instances still query the old name", "It's too slow", "Canaries block it"],
        answer: 1,
        explanation: "Old and new code run simultaneously against one schema.",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 40. Monolith vs microservices
  // ---------------------------------------------------------------------------
  {
    slug: "monolith-vs-microservices",
    track: "system-design",
    title: "Monolith vs microservices",
    summary:
      "Microservices buy independent deployment and scaling at the price of distributed-systems complexity. Start with a well-modularised monolith, let team structure (Conway's law) and real pressure points drive splits, and know the costs you're signing up for.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 35,
    kinds: ["theory", "system-design"],
    status: "authored",
    prerequisites: ["system-design/rest-api-design", "system-design/async-processing"],
    related: [
      "system-design/service-discovery",
      "system-design/distributed-tracing",
      "system-design/circuit-breakers-timeouts-retries",
      "distributed/distributed-transactions",
      "distributed/event-driven-architecture",
      "production/monorepos-turborepo",
    ],
    tags: ["architecture", "microservices", "modular-monolith", "conways-law", "strangler-fig"],
    sources: [
      CHECKLIST,
      FOWLER_MICRO,
      { label: "Martin Fowler — MonolithFirst", url: "https://martinfowler.com/bliki/MonolithFirst.html", kind: "external" },
      { label: "Martin Fowler — MicroservicePrerequisites", url: "https://martinfowler.com/bliki/MicroservicePrerequisites.html", kind: "external" },
      { label: "Martin Fowler — StranglerFigApplication", url: "https://martinfowler.com/bliki/StranglerFigApplication.html", kind: "external" },
      { label: "Martin Fowler — Conway's Law", url: "https://martinfowler.com/bliki/ConwaysLaw.html", kind: "external" },
      { label: "microservices.io — Microservice architecture patterns (Chris Richardson)", url: "https://microservices.io/patterns/", kind: "external" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Define monolith, modular monolith and microservices.",
              "List the concrete costs of distribution (network, consistency, ops, debugging).",
              "Apply Conway's law to service boundaries.",
              "Decide when and how to split (strangler fig, bounded contexts).",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A monolith is one big house: easy to walk between rooms, but renovating the kitchen means the whole family lives with the dust. Microservices are a street of separate houses: each family renovates on its own schedule, but now you need roads, mail and phones between them — and messages can get lost.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Style", "Definition"],
            rows: [
              ["Monolith", "One deployable unit containing all functionality, typically one database."],
              ["Modular monolith", "One deployable, but internally split into modules with enforced boundaries and owned data (no reaching into another module's tables)."],
              ["Microservices", "Independently deployable services, each owning its data, organised around business capabilities, communicating over the network."],
              ["Distributed monolith", "Anti-pattern: many services that must be deployed together and share a database — all the costs, none of the benefits."],
            ],
          },
          {
            type: "callout",
            tone: "note",
            title: "Conway's law",
            text: "Organisations design systems that mirror their communication structures. Service boundaries that cut across team boundaries create constant cross-team coordination; align services with teams (and teams with business capabilities).",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "It's one of the most common interview discussions and real-world architecture decisions. The mature answer isn't \"microservices are modern\" — it's understanding which problems they solve (team autonomy, independent scaling/deploys, fault isolation) and what they cost.",
          },
        ],
      },
      {
        id: "internals",
        title: "The costs of distribution",
        blocks: [
          {
            type: "table",
            head: ["In-process call", "Network call"],
            rows: [
              ["Nanoseconds", "Milliseconds; tail latency adds up across hops"],
              ["Always arrives", "Can fail, time out, or succeed without you knowing"],
              ["One transaction across modules", "Distributed transactions → sagas, outbox, eventual consistency"],
              ["Refactor across modules in one commit", "Versioned API contracts; coordinated changes"],
              ["Stack trace", "Distributed tracing, correlated logs"],
              ["One deploy pipeline", "N pipelines, service discovery, config, secrets, mTLS"],
            ],
          },
          {
            type: "list",
            items: [
              "**Prerequisites** (Fowler): rapid provisioning, basic monitoring, rapid application deployment — plus a DevOps culture.",
              "**Data ownership**: each service owns its tables; others access via API or events. Shared DBs recreate the coupling.",
              "**Communication**: sync (REST/gRPC) for queries needing answers; async events for decoupled workflows.",
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: strangler fig migration",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Modularise first", detail: "Inside the monolith, carve out a `billing` module with a clear interface and its own tables." },
              { title: "Put a router in front", detail: "An API gateway/proxy routes all traffic to the monolith initially." },
              { title: "Extract", detail: "Build the billing service; replicate or migrate its data; route `/billing/*` to it (canary first)." },
              { title: "Replace internal calls", detail: "Monolith calls the billing API instead of the module; events replace cross-module DB joins." },
              { title: "Remove", detail: "Delete billing code and tables from the monolith. Repeat for the next capability with real pressure." },
            ],
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "table",
            head: ["Good reason to split", "Bad reason to split"],
            rows: [
              ["Multiple teams blocked on one deploy pipeline", "\"Netflix does it\""],
              ["A component with very different scaling (e.g. image processing)", "Each class becomes a service (nanoservices)"],
              ["Different reliability/security requirements (payments, PCI scope)", "To fix messy code — you get messy distributed code"],
              ["Different tech needs (ML in Python, API in Go)", "Before domain boundaries are understood"],
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        title: "Edge cases and limitations",
        blocks: [
          {
            type: "list",
            items: [
              "**Wrong boundaries** are far costlier to fix across services than across modules — another reason to start modular.",
              "**Chatty services** — one user request triggering dozens of sync calls multiplies latency and failure probability.",
              "**Cascading failures** need timeouts, breakers, bulkheads in every service.",
              "**Cross-service queries/reporting** need data replication into a warehouse or read models.",
              "**Small teams** (< ~10 engineers) rarely benefit; operational overhead dominates.",
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
              { title: "(Modular) monolith", points: ["Simple ops, debugging, transactions", "Fast refactoring while domain is unclear", "Scales further than people think (scale horizontally behind an LB)", "Deploys couple teams as org grows"] },
              { title: "Microservices", points: ["Team autonomy; independent deploys and scaling", "Fault isolation (if designed for it)", "Heterogeneous tech", "Distributed-systems complexity, higher infra and cognitive cost"] },
            ],
          },
        ],
      },
      {
        id: "real-world",
        title: "Operational implications",
        blocks: [
          {
            type: "list",
            items: [
              "Microservices require: CI/CD per service, service discovery, centralised logs/metrics/traces, secrets, API gateway, on-call per team.",
              "Platform teams emerge to provide paved roads (templates, mesh, observability).",
              "Contract testing and API versioning become mandatory.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "A monolith is one deployable unit — simple to build, debug and keep consistent, but it couples teams' deploys as the org grows. Microservices give independent deployment and scaling and fault isolation, but every call becomes a network call that can fail, transactions become sagas, and you need discovery, tracing and per-service pipelines. I'd start with a modular monolith with strict module and data boundaries, and extract services along business capabilities and team boundaries (Conway's law) when there's real pressure — using the strangler fig pattern.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Bounded contexts (DDD) as candidate service boundaries.",
              "Database-per-service + outbox + events; sagas for multi-service workflows.",
              "Availability math: a request needing 10 services each at 99.9% is ≈ 99.0% available if they fail independently.",
              "Inverse Conway manoeuvre: shape teams to get the architecture you want.",
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
              "Microservices trade simplicity for autonomy and independent scaling.",
              "Start with a modular monolith; split on real pressure.",
              "Align services with teams and business capabilities.",
              "Avoid the distributed monolith (shared DB, lockstep deploys).",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Modular monolith", definition: "Single deployable with strictly enforced internal module boundaries." },
      { term: "Conway's law", definition: "System structure mirrors the communication structure of the organisation that builds it." },
      { term: "Strangler fig", definition: "Incrementally replacing parts of a legacy system by routing functionality to new components." },
      { term: "Bounded context", definition: "DDD term for a boundary within which a domain model is consistent." },
      { term: "Distributed monolith", definition: "Services that are separately deployed but tightly coupled, so they must change together." },
      { term: "Saga", definition: "Sequence of local transactions with compensating actions, replacing a distributed transaction." },
    ],
    followUps: [
      { q: "How do you handle a transaction spanning two services?", a: "Avoid it via boundaries if possible; otherwise use a saga with compensating actions and the outbox pattern for reliable events." },
      { q: "What's a sign you've built a distributed monolith?", a: "Services must be deployed together, share a database, or a change in one routinely requires changes in several." },
      { q: "Can a monolith scale?", a: "Yes — run many identical instances behind a load balancer, add caching and read replicas. Scaling limits are usually organisational before technical." },
      { q: "How small should a microservice be?", a: "Sized to a business capability one team can own end-to-end, not by lines of code." },
      { q: "Why does availability drop with more services?", a: "If a request depends on all of them serially, availabilities multiply: 0.999^10 ≈ 0.990." },
    ],
    quiz: [
      {
        id: "mm-q1",
        prompt: "Which most strongly suggests extracting a microservice?",
        options: ["Code is messy", "A separate team needs to deploy a capability independently and it has distinct scaling needs", "The monolith uses one database", "A new framework is popular"],
        answer: 1,
        explanation: "Team autonomy and distinct scaling are the core benefits.",
      },
      {
        id: "mm-q2",
        prompt: "A request synchronously calls 5 services, each 99.9% available (independent). Approximate end-to-end availability?",
        options: ["99.9%", "99.5%", "95%", "99.99%"],
        answer: 1,
        explanation: "0.999^5 ≈ 0.995.",
      },
    ],
  },
];
