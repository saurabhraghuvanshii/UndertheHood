import type { Lesson, Track } from "../types";

/**
 * Production engineering and observability: telemetry, monorepos, package managers,
 * git workflows, build performance, repository quality and shipping features safely.
 */

const OTEL_DOCS = { label: "OpenTelemetry documentation", url: "https://opentelemetry.io/docs/", kind: "docs" as const };
const PNPM_DOCS = { label: "pnpm documentation", url: "https://pnpm.io/motivation", kind: "docs" as const };
const TURBO_DOCS = { label: "Turborepo documentation", url: "https://turbo.build/repo/docs", kind: "docs" as const };
const GIT_BOOK = { label: "Pro Git book (git-scm.com)", url: "https://git-scm.com/book/en/v2", kind: "docs" as const };

export const track: Track = {
  slug: "production",
  title: "Production engineering and observability",
  tagline: "Traces, metrics and logs; monorepos, pnpm and fast builds; git hygiene and shipping safely.",
  description:
    "What happens after the code compiles: instrumenting services with OpenTelemetry, structuring monorepos with Turborepo, understanding how pnpm lays out node_modules, keeping git history clean, making builds fast through caching, running Node processes with PM2, and shipping features to production deliberately — with documentation and product analytics that make a project usable by others.",
  modules: [
    {
      id: "production-observability",
      title: "Observability",
      summary: "Traces, metrics and logs, and how OpenTelemetry standardises collecting and exporting them.",
      lessons: ["observability-opentelemetry"],
    },
    {
      id: "production-tooling",
      title: "Repositories, packages and builds",
      summary: "Monorepos and task graphs, pnpm's content-addressable store, incremental builds and caching.",
      lessons: ["monorepos-turborepo", "pnpm-internals", "build-performance"],
    },
    {
      id: "production-collaboration",
      title: "Git and repository quality",
      summary: "Branching models, conventional commits, rewriting history safely, and documentation that makes a repo usable.",
      lessons: ["git-workflows", "repo-documentation-github-quality"],
    },
    {
      id: "production-shipping",
      title: "Running and shipping software",
      summary: "Process management with PM2, delivering features end to end, and measuring whether users stay.",
      lessons: ["pm2", "production-feature-development", "user-retention-product-analytics"],
    },
  ],
  milestones: [
    {
      id: "production-otel-service",
      title: "OpenTelemetry-instrumented service",
      summary: "Instrument a small two-service HTTP system so a single request can be followed end to end.",
      level: "intermediate",
      requirements: [
        "Initialise the OTel SDK before any other import, with a `service.name` resource attribute",
        "Use auto-instrumentation for HTTP and the database client, plus at least one manual span with attributes",
        "Propagate W3C `traceparent` between the two services and show one trace spanning both",
        "Export via OTLP to an OpenTelemetry Collector that batches and forwards to a trace backend (e.g. Jaeger)",
        "Emit a request-duration histogram and include trace ids in structured logs",
      ],
      stretch: [
        "Add tail-based sampling in the Collector that keeps all error traces",
        "Build a dashboard with p50/p95/p99 latency and error rate",
      ],
      exercises: ["production/observability-opentelemetry", "system-design/distributed-tracing", "system-design/logging-monitoring-tracing"],
    },
    {
      id: "production-monorepo",
      title: "pnpm + Turborepo monorepo with remote caching",
      summary: "Split an app into workspace packages and make repeated builds near-instant.",
      level: "intermediate",
      requirements: [
        "A pnpm workspace with at least one app and two internal packages using `workspace:*` dependencies",
        "A `turbo.json` declaring `build`, `test` and `lint` tasks with correct `dependsOn` and `outputs`",
        "Demonstrate a cache hit (`FULL TURBO`) on an unchanged second run and a partial rebuild after editing one package",
        "Explain why a phantom dependency fails under pnpm but worked under a flat npm layout",
      ],
      stretch: ["Enable remote caching in CI and show a cache hit across machines", "Run only affected packages with `--filter=...[origin/main]`"],
      exercises: ["production/pnpm-internals", "production/monorepos-turborepo", "production/build-performance"],
    },
    {
      id: "production-clean-history",
      title: "Clean, documented repository",
      summary: "Bring a messy repo up to a standard a stranger could contribute to.",
      level: "beginner",
      requirements: [
        "Adopt Conventional Commits with a commit-msg check (e.g. commitlint) and a Commitizen prompt",
        "Remove an accidentally committed secret from all history with git-filter-repo, rotate the secret, and document the steps",
        "Write a README with purpose, quick start, configuration and architecture overview; add CONTRIBUTING and a LICENSE",
      ],
      stretch: ["Generate a CHANGELOG from conventional commits", "Add issue and PR templates plus branch protection"],
      exercises: ["production/git-workflows", "production/repo-documentation-github-quality"],
    },
  ],
  sources: [
    OTEL_DOCS,
    PNPM_DOCS,
    TURBO_DOCS,
    GIT_BOOK,
    { label: "git-filter-repo", url: "https://github.com/newren/git-filter-repo", kind: "external" },
    { label: "Conventional Commits specification", url: "https://www.conventionalcommits.org/en/v1.0.0/", kind: "docs" },
    { label: "Commitizen (cz-cli)", url: "https://github.com/commitizen/cz-cli", kind: "external" },
    { label: "PM2 documentation", url: "https://pm2.keymetrics.io/docs/usage/quick-start/", kind: "docs" },
  ],
};

export const lessons: Lesson[] = [
  {
    slug: "observability-opentelemetry",
    track: "production",
    title: "Observability with OpenTelemetry",
    summary:
      "Traces, metrics and logs as three complementary views of a running system, and how OpenTelemetry's API, SDK, context propagation and Collector produce them in a vendor-neutral way.",
    level: "intermediate",
    frequency: "high",
    minutes: 45,
    kinds: ["theory", "coding", "system-design"],
    status: "authored",
    prerequisites: ["system-design/logging-monitoring-tracing", "networks/http"],
    related: ["system-design/distributed-tracing", "system-design/dashboards-alerts", "go/structured-logging", "production/pm2"],
    tags: ["observability", "opentelemetry", "tracing", "metrics", "logs", "otlp", "collector"],
    sources: [
      OTEL_DOCS,
      { label: "OpenTelemetry concepts: signals", url: "https://opentelemetry.io/docs/concepts/signals/", kind: "docs" },
      { label: "OpenTelemetry Collector", url: "https://opentelemetry.io/docs/collector/", kind: "docs" },
      { label: "OpenTelemetry JavaScript (Node.js) getting started", url: "https://opentelemetry.io/docs/languages/js/getting-started/nodejs/", kind: "docs" },
      { label: "OpenTelemetry semantic conventions", url: "https://opentelemetry.io/docs/specs/semconv/", kind: "docs" },
      { label: "W3C Trace Context recommendation", url: "https://www.w3.org/TR/trace-context/", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Distinguish monitoring (known questions) from observability (asking new questions of telemetry).",
              "Explain what traces, spans, metrics and logs each answer, and how they link via trace ids.",
              "Describe OpenTelemetry's split into API, SDK, instrumentation libraries, OTLP and the Collector.",
              "Explain context propagation with the W3C `traceparent` header.",
              "Choose between head-based and tail-based sampling, and avoid metric cardinality explosions.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Think of a request as a parcel moving through a warehouse. **Metrics** are the counters on the wall (parcels per minute, how many were late). **Logs** are notes individual workers scribble. A **trace** is the parcel's tracking history: every station it visited, when it arrived and how long it stayed.",
          },
          {
            type: "p",
            text: "Each view alone is incomplete. Metrics tell you p99 latency spiked; a trace shows *which* hop was slow; the logs attached to that span tell you *why*. Observability is being able to jump between them for a request you didn't anticipate.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Signal", "What it is", "Best for", "Cost driver"],
            rows: [
              ["Trace", "A tree of **spans** sharing one trace id; each span is a timed operation with attributes, events and a status", "Latency breakdown across services, finding the slow or failing hop", "Number of spans stored (hence sampling)"],
              ["Metric", "A numeric measurement aggregated over time (counter, up-down counter, histogram, gauge) with attributes", "Dashboards, SLOs, alerting on rates and percentiles", "Number of unique attribute combinations (**cardinality**)"],
              ["Log", "A timestamped record, ideally structured (key/value), optionally carrying trace and span ids", "Detailed context for a specific event or error", "Volume of bytes ingested and retained"],
            ],
          },
          {
            type: "p",
            text: "**OpenTelemetry (OTel)** is a CNCF project that standardises how telemetry is *produced and transported*: a specification, per-language APIs and SDKs, semantic conventions for attribute names, the OTLP wire protocol and the Collector. It is not a storage backend — you export to Jaeger, Tempo, Prometheus, a vendor, etc.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "**Vendor neutrality:** instrument once, switch backends by changing exporter config, not code.",
              "**Shared conventions:** `http.request.method`, `http.response.status_code`, `db.system` mean the same thing in every language, so dashboards work across services.",
              "**Correlation:** the same context (trace id) flows into spans, logs and metric exemplars.",
              "**Library instrumentation:** HTTP servers, clients and DB drivers can be instrumented without you editing them.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "How OpenTelemetry works",
        blocks: [
          {
            type: "flow",
            nodes: ["Your code + instrumentation libs", "OTel API", "OTel SDK (sampler, processors, exporter)", "OTLP", "Collector (receive → process → export)", "Backends"],
            caption: "Conceptual pipeline from instrumented code to storage.",
          },
          {
            type: "steps",
            steps: [
              { title: "API", detail: "Libraries depend only on the API (`trace.getTracer()`, `meter.createCounter()`). With no SDK registered the API is a **no-op**, so instrumenting a library costs almost nothing for users who don't enable telemetry." },
              { title: "SDK", detail: "The application installs the SDK, which supplies real implementations: a **Resource** (who is emitting: `service.name`, version, host), a **Sampler**, **SpanProcessors** (usually a BatchSpanProcessor that buffers spans and exports in batches), metric readers and exporters." },
              { title: "Context", detail: "The active span lives in a *context* object carried implicitly (AsyncLocalStorage in Node, `context.Context` in Go). Child spans created inside pick up the parent automatically." },
              { title: "Propagation", detail: "At process boundaries a **propagator** injects the context into headers (`traceparent`, optionally `tracestate` and `baggage`) and the receiving service extracts it, continuing the same trace." },
              { title: "Export", detail: "Exporters send data, typically over **OTLP** (gRPC on port 4317 or HTTP/protobuf on 4318 by default), to a Collector or directly to a backend." },
              { title: "Collector", detail: "A standalone process with **pipelines** of receivers → processors → exporters. It batches, retries, filters, redacts attributes, adds metadata, does tail sampling and fans out to several backends — keeping that logic out of your app." },
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Signal maturity varies by language",
            text: "The OTel specification defines traces, metrics and logs, but each language SDK reaches stability per signal at different times (logs and the newer profiling signal lagged traces). Check the status table for your language on opentelemetry.io before depending on a signal in production.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: one request across two services",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Request arrives at `api`", detail: "No `traceparent` header, so the sampler starts a new trace: random 16-byte trace id, 8-byte span id, and decides sampled = true. A SERVER span `GET /orders/:id` starts." },
              { title: "`api` queries Postgres", detail: "The pg instrumentation creates a CLIENT child span with `db.system=postgresql` and the statement (sanitised)." },
              { title: "`api` calls `pricing`", detail: "The HTTP client instrumentation creates a CLIENT span and injects `traceparent: 00-<traceId>-<clientSpanId>-01`." },
              { title: "`pricing` extracts context", detail: "Its SERVER span uses the same trace id and records the client span as its parent. Parent-based sampling honours the `01` (sampled) flag." },
              { title: "Spans end and are batched", detail: "Each SDK's BatchSpanProcessor exports completed spans to the Collector, which forwards them. The backend reassembles the tree by trace id and parent span id." },
            ],
          },
          {
            type: "code",
            lang: "js",
            runnable: true,
            caption: "Decoding a W3C traceparent header (version-traceid-parentid-flags).",
            code: `const header = "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01";
const [version, traceId, parentId, flags] = header.split("-");
console.log(version, traceId.length, parentId.length);
console.log("sampled:", (parseInt(flags, 16) & 1) === 1);`,
            output: `00 32 16
sampled: true`,
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "ts",
            caption: "instrumentation.ts — must run before the app imports http, express, pg, etc.",
            code: `import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";

const sdk = new NodeSDK({
  resource: resourceFromAttributes({ "service.name": "orders-api" }),
  traceExporter: new OTLPTraceExporter({ url: "http://localhost:4318/v1/traces" }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();

process.on("SIGTERM", () => {
  sdk.shutdown().finally(() => process.exit(0)); // flush buffered spans
});`,
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Package APIs change between versions",
            text: "OTel JS package names and helpers evolve (for example, newer `@opentelemetry/resources` versions expose `resourceFromAttributes` where older ones used `new Resource({...})`). Auto-instrumentation patches modules when they are loaded, so load this file first: `node --require ./instrumentation.js app.js` for CommonJS, or `--import` for ESM (which also needs the loader hook described in the OTel JS docs).",
          },
          {
            type: "code",
            lang: "ts",
            caption: "A manual span and a histogram around business logic.",
            code: `import { trace, metrics, SpanStatusCode } from "@opentelemetry/api";

const tracer = trace.getTracer("checkout");
const latency = metrics.getMeter("checkout").createHistogram("checkout.duration", { unit: "ms" });

export async function checkout(cartId: string) {
  return tracer.startActiveSpan("checkout", async (span) => {
    const start = performance.now();
    span.setAttribute("cart.item_count", 3);           // low-cardinality, useful
    try {
      return await chargeCard(cartId);
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw err;
    } finally {
      latency.record(performance.now() - start, { "payment.method": "card" });
      span.end();                                     // un-ended spans are never exported
    }
  });
}`,
          },
          {
            type: "code",
            lang: "yaml",
            caption: "Minimal Collector pipeline: receive OTLP, batch, export to a tracing backend and log metrics.",
            code: `receivers:
  otlp:
    protocols:
      grpc:
      http:
processors:
  batch:
exporters:
  otlp/jaeger:
    endpoint: jaeger:4317
    tls:
      insecure: true
  debug:
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/jaeger]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [debug]`,
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Broken traces across queues:** HTTP propagation is automatic, but for Kafka/SQS/Redis jobs you must inject context into message headers and extract it in the consumer (often modelled with PRODUCER/CONSUMER spans and *links*).",
              "**Context loss in async code:** callbacks scheduled outside the instrumented path (custom thread pools, some promise libraries) can lose the active context, producing orphan root spans.",
              "**Short-lived processes:** CLIs and serverless functions exit before the batch processor flushes — call `shutdown()`/`forceFlush()` before exit.",
              "**Clock skew:** spans from different hosts use different clocks; a child may appear to start before its parent. Trust durations within one host more than cross-host offsets.",
            ],
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "callout",
            tone: "warning",
            title: "Cardinality explosions",
            text: "Every unique combination of metric attributes is a separate time series. Putting `user.id`, a raw URL path or a request id on a metric can create millions of series and a huge bill. Use bounded values (route template `/orders/:id`, status class) on metrics; put high-cardinality ids on spans and logs.",
          },
          {
            type: "list",
            items: [
              "Initialising the SDK after importing the libraries it should patch, so nothing is auto-instrumented.",
              "Forgetting `span.end()` on error paths.",
              "Logging without trace ids, so logs can't be joined to traces.",
              "Recording secrets or PII in span attributes (full SQL with values, auth headers). Redact in code or in a Collector processor.",
              "Sampling at 100% in high-traffic production, then sampling randomly in the backend — you pay for transport of data you discard.",
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
              { title: "Head-based sampling (in the SDK)", points: ["Decision at the root span, e.g. `ParentBased(TraceIdRatioBased(0.1))`", "Cheap: unsampled spans are never exported", "Blind: can't know yet whether the request will error or be slow"] },
              { title: "Tail-based sampling (in the Collector)", points: ["Decision after the whole trace is buffered", "Can keep 100% of errors and slow traces, a sample of the rest", "Needs memory and all spans of a trace routed to the same Collector instance"] },
            ],
          },
          {
            type: "compare",
            items: [
              { title: "Export directly from the app", points: ["Fewer moving parts", "Backend credentials and retry logic live in every service", "Changing backend means redeploying apps"] },
              { title: "Export via a Collector", points: ["Central batching, retries, redaction, sampling, fan-out", "One more component to run and scale (agent per node and/or gateway)", "Apps only need to know one local endpoint"] },
            ],
          },
        ],
      },
      {
        id: "real-world",
        blocks: [
          {
            type: "p",
            text: "A common Kubernetes layout runs a Collector **agent** as a DaemonSet (one per node, receiving from local pods and adding Kubernetes metadata) and a **gateway** Deployment that does tail sampling and exports to backends. Teams typically alert on metrics (error rate, p99 latency against an SLO), then pivot to exemplar traces and correlated logs to debug.",
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Observability means being able to explain new, unexpected behaviour from the telemetry a system emits. The three main signals are metrics (cheap aggregates for alerting), traces (per-request span trees showing where time went across services) and logs (detailed events). OpenTelemetry standardises producing them: libraries call a no-op-by-default API, the app installs an SDK with a resource, sampler, batch processor and exporter, context crosses services via the W3C `traceparent` header, and data is sent over OTLP to a Collector that batches, processes and exports to any backend.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "**API/SDK split** lets library authors instrument without forcing a dependency on a specific exporter or adding overhead when telemetry is off.",
              "**Span model:** name, kind (SERVER, CLIENT, INTERNAL, PRODUCER, CONSUMER), start/end time, attributes, events (e.g. exceptions), status (Unset/Ok/Error), links to other spans.",
              "**Metric instruments:** Counter (monotonic), UpDownCounter, Histogram (latency distributions, percentiles), Gauge, plus asynchronous/observable variants read on collection.",
              "**Sampling** must be consistent across services: parent-based samplers follow the upstream decision so traces aren't half-recorded.",
              "**Cost control:** sampling for traces, bounded attributes for metrics, log levels and retention for logs.",
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
              "Run Jaeger and a Collector locally with Docker; instrument an Express app and view a trace.",
              "Add a second service and verify the trace spans both; then break propagation (strip the header) and observe two separate traces.",
              "Add a histogram with a `route` attribute; then try adding `user.id` and reason about how many series it would create.",
              "Configure the Collector's tail-sampling processor to keep all traces with an error status.",
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
              "Metrics alert, traces locate, logs explain — joined by trace ids.",
              "OTel = spec + API + SDK + semantic conventions + OTLP + Collector; it doesn't store data.",
              "Context propagation (`traceparent`) is what turns per-service spans into one distributed trace.",
              "Control cost with sampling (head vs tail) and bounded metric cardinality.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Span", definition: "A named, timed operation within a trace, with attributes, events, status and a parent span id." },
      { term: "Trace", definition: "All spans sharing one trace id, forming a tree that represents a single request's journey." },
      { term: "Resource", definition: "Attributes describing the entity producing telemetry, e.g. `service.name`, `service.version`, host or pod." },
      { term: "OTLP", definition: "OpenTelemetry Protocol: the protobuf-based wire format for sending telemetry over gRPC or HTTP." },
      { term: "Collector", definition: "A standalone OTel process that receives, processes and exports telemetry through configurable pipelines." },
      { term: "Context propagation", definition: "Passing trace context across process boundaries, usually via the W3C `traceparent` header." },
      { term: "Cardinality", definition: "The number of unique attribute-value combinations for a metric; each one is a separate time series." },
      { term: "Tail-based sampling", definition: "Deciding whether to keep a trace after seeing all its spans, so errors and slow requests can always be kept." },
      { term: "Semantic conventions", definition: "Standard attribute names and values (e.g. `http.response.status_code`) defined by OTel for consistency across languages." },
    ],
    followUps: [
      { q: "Why do libraries depend only on the OTel API and not the SDK?", a: "So instrumentation is free when no SDK is installed (the API is a no-op) and the application, not the library, decides on exporters, sampling and processors. It also avoids version conflicts between multiple SDKs in one process." },
      { q: "How do you keep a trace connected through a message queue?", a: "Inject the current context into the message's headers/attributes when producing, and extract it when consuming. The consumer span either becomes a child of the producer span or, for batch consumption, uses span links to each producing context." },
      { q: "Your trace backend bill doubled. What do you look at?", a: "Span volume per service (lower head sampling or add tail sampling that keeps errors/slow traces), noisy spans from chatty instrumentations (disable e.g. fs instrumentation), and attribute bloat. For metrics, look for attributes with unbounded values." },
      { q: "What's the difference between monitoring and observability?", a: "Monitoring checks known failure modes with predefined dashboards and alerts. Observability is the property of a system that lets you investigate unknown questions after the fact, which requires rich, correlated, high-dimensional telemetry such as traces with attributes." },
    ],
    quiz: [
      {
        id: "otel-q1",
        prompt: "A library is instrumented with the OpenTelemetry API, but the application never installs an SDK. What happens?",
        options: ["The library throws at startup", "Spans are buffered in memory forever", "API calls are no-ops; nothing is recorded or exported", "Spans are printed to stdout"],
        answer: 2,
        explanation: "Without a registered SDK, the global providers are no-op implementations, so instrumentation adds negligible overhead.",
      },
      {
        id: "otel-q2",
        prompt: "Which attribute is most dangerous to add to a request-count metric?",
        options: ["`http.request.method`", "`http.route` (template like `/users/:id`)", "`user.id`", "`http.response.status_code`"],
        answer: 2,
        explanation: "User ids are unbounded, so each user creates a new time series (cardinality explosion). The others have small, bounded value sets.",
      },
      {
        id: "otel-q3",
        prompt: "You must keep every trace that contains an error while sampling 5% of successful ones. Where is this decided?",
        options: ["Head-based sampler in each SDK", "Tail-sampling processor in a Collector", "In the trace backend's UI", "In the W3C `tracestate` header"],
        answer: 1,
        explanation: "Whether a trace contains an error is only known after its spans complete, so the decision must be tail-based, which the Collector does by buffering spans per trace.",
      },
    ],
  },
  {
    slug: "pnpm-internals",
    track: "production",
    title: "pnpm internals: content-addressable store, hard links and symlinks",
    summary:
      "How pnpm stores each file once on disk, hard-links it into a virtual store, and builds a strict, symlinked node_modules that prevents phantom dependencies.",
    level: "intermediate",
    frequency: "medium",
    minutes: 35,
    kinds: ["theory", "visualization"],
    status: "authored",
    prerequisites: ["javascript/modules", "os/virtual-memory"],
    related: ["production/monorepos-turborepo", "production/build-performance", "nodejs/node-architecture"],
    tags: ["pnpm", "npm", "node_modules", "hard-links", "symlinks", "package-manager", "workspaces"],
    sources: [
      PNPM_DOCS,
      { label: "pnpm: Symlinked node_modules structure", url: "https://pnpm.io/symlinked-node-modules-structure", kind: "docs" },
      { label: "pnpm: Flat node_modules is not the only way", url: "https://pnpm.io/blog/2020/05/27/flat-node-modules-is-not-the-only-way", kind: "docs" },
      { label: "pnpm: How peers are resolved", url: "https://pnpm.io/how-peers-are-resolved", kind: "docs" },
      { label: "pnpm settings (.npmrc / pnpm-workspace.yaml)", url: "https://pnpm.io/settings", kind: "docs" },
      { label: "Node.js: loading from node_modules folders", url: "https://nodejs.org/api/modules.html#loading-from-node_modules-folders", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain how Node resolves bare imports by walking up `node_modules` directories.",
              "Describe the problems with npm/Yarn v1's flat (hoisted) layout: phantom dependencies, doppelgangers, disk use.",
              "Explain pnpm's content-addressable store and why hard links make installs fast and cheap.",
              "Read pnpm's `node_modules/.pnpm` virtual store and explain how symlinks give strict-yet-resolvable dependencies.",
              "Know the escape hatches (`node-linker=hoisted`, hoist patterns) and when to use them.",
            ],
          },
        ],
      },
      {
        id: "prerequisites",
        blocks: [
          {
            type: "p",
            text: "A **hard link** is another directory entry pointing at the same file data (inode); there is no 'original' — the data is freed when the last link is removed, and links can't cross filesystems. A **symlink** is a small file containing a path that the OS follows when opened; it can point anywhere, including to a directory.",
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Imagine every project on your machine sharing one library warehouse. Instead of photocopying books into each project (npm copies files into each `node_modules`), pnpm keeps one copy of each page in the warehouse and gives projects *pointers* to it. Then it arranges those pointers so each package can see only the books it declared — not everything lying around.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "list",
            items: [
              "**Content-addressable store:** a global directory where every file from every package version is stored once, named by a hash of its contents.",
              "**Virtual store:** `node_modules/.pnpm/`, containing one folder per resolved package (`name@version`, plus a peer suffix when needed) whose files are hard links into the store.",
              "**Strict node_modules:** your project's top-level `node_modules` contains only symlinks for your *direct* dependencies.",
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "compare",
            items: [
              {
                title: "Flat / hoisted layout (npm, Yarn v1)",
                points: [
                  "Transitive deps are hoisted to the top `node_modules`, so your code can `require` packages you never declared (**phantom dependencies**) — until an upstream change removes them.",
                  "Conflicting versions can't all be hoisted, so the same version gets duplicated in several nested folders (**doppelgangers**).",
                  "Every project holds full copies of every file.",
                ],
              },
              {
                title: "pnpm layout",
                points: [
                  "Only declared dependencies are resolvable from your code.",
                  "Each `name@version` (per peer set) appears once in the virtual store.",
                  "File content stored once per machine; installs mostly create links instead of copying bytes.",
                ],
              },
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "p",
            text: "Node's resolver, for `require('debug')` inside file `F`, looks in `dirname(F)/node_modules/debug`, then the parent directory's `node_modules`, and so on up to the root. Crucially, Node resolves symlinks to their **real path** by default before doing this, so a package's 'location' is its folder inside `.pnpm`. pnpm exploits exactly this.",
          },
          {
            type: "code",
            lang: "text",
            caption: "Conceptual layout after `pnpm add express` (express depends on debug, among others).",
            code: `node_modules/
├── express -> ./.pnpm/express@4.21.2/node_modules/express        (symlink)
└── .pnpm/
    ├── express@4.21.2/
    │   └── node_modules/
    │       ├── express/        <- real folder; files are hard links into the store
    │       ├── debug -> ../../debug@2.6.9/node_modules/debug        (symlink)
    │       └── ...other deps of express as sibling symlinks
    ├── debug@2.6.9/
    │   └── node_modules/
    │       ├── debug/          <- hard links into the store
    │       └── ms -> ../../ms@2.0.0/node_modules/ms
    ├── ms@2.0.0/node_modules/ms/
    └── node_modules/           <- "hidden" hoisting target (see hoist-pattern)`,
          },
          {
            type: "steps",
            steps: [
              { title: "Your code imports `express`", detail: "Found at `node_modules/express`, a symlink. Node uses the real path: `.pnpm/express@4.21.2/node_modules/express`." },
              { title: "express imports `debug`", detail: "Node walks up from express's real path and finds `.pnpm/express@4.21.2/node_modules/debug` — a sibling symlink pnpm placed there because express declares it." },
              { title: "Your code imports `debug`", detail: "Top-level `node_modules` has no `debug` (you didn't declare it), so resolution fails: the phantom dependency is caught." },
              { title: "Why the extra `node_modules` level?", detail: "Placing the package at `.pnpm/<id>/node_modules/<name>` lets the package find itself by name and puts its dependencies in a directory its resolution naturally reaches, without circular symlinks." },
            ],
          },
          {
            type: "p",
            text: "**Installing** goes through resolve (lockfile `pnpm-lock.yaml` or registry metadata), fetch (download tarballs not already in the store, verifying integrity hashes) and link (create virtual-store folders and links). Because fetch is skipped for content already in the store, warm installs are dominated by cheap link syscalls.",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Import method and store location are configurable",
            text: "`package-import-method` defaults to `auto`: try a copy-on-write clone (reflink, on filesystems like Btrfs/APFS), then a hard link, then fall back to copying — e.g. when the store is on a different filesystem/drive than the project, since hard links can't cross filesystems. The default store path is platform-dependent (on Linux typically under `~/.local/share/pnpm/store`); run `pnpm store path` to see yours.",
          },
          {
            type: "p",
            text: "**Peer dependencies** are resolved from the dependent's parent, so the same package can need different folders for different peers. pnpm encodes the peer set in the virtual-store folder name (e.g. a suffix with the peer versions), creating separate instances only when necessary.",
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "bash",
            caption: "Inspecting links yourself (paths and inode numbers will differ on your machine).",
            code: `pnpm store path                       # where the content-addressable store lives
ls -l node_modules                    # direct deps are symlinks into .pnpm
ls node_modules/.pnpm                 # one folder per resolved package
# Same inode number in two projects = same file on disk (hard link):
ls -i projA/node_modules/.pnpm/ms@2.0.0/node_modules/ms/index.js
ls -i projB/node_modules/.pnpm/ms@2.0.0/node_modules/ms/index.js
pnpm why debug                        # who depends on debug and why`,
          },
          {
            type: "code",
            lang: "yaml",
            caption: "pnpm-workspace.yaml for a monorepo; internal deps use the workspace protocol.",
            code: `packages:
  - "apps/*"
  - "packages/*"
# in apps/web/package.json:  "dependencies": { "@acme/ui": "workspace:*" }`,
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Tools that don't follow symlinks** (some bundlers, React Native's Metro historically, serverless packagers) may break; `node-linker=hoisted` creates a flat npm-style layout instead.",
              "**Packages with their own phantom deps** (requiring something they didn't declare) still mostly work because pnpm hoists everything into the hidden `.pnpm/node_modules` (`hoist-pattern` defaults to `*`), which is reachable from packages inside `.pnpm` but not from your code. `packageExtensions` lets you patch the missing declaration properly.",
              "**Tools that must be visible at top level** (some ESLint plugins/configs) can be hoisted with `public-hoist-pattern`; `shamefully-hoist=true` hoists everything (most npm-compatible, least strict).",
              "**Editing a file inside node_modules** edits the shared store content for every project using that file. Use `pnpm patch` instead.",
              "**Docker:** copying `node_modules` between stages can turn hard links into copies; `pnpm fetch` + `pnpm install --offline` and a mounted store cache keep image builds fast.",
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Version-dependent defaults",
            text: "Defaults have shifted across major versions — for example pnpm 10 stopped running dependencies' lifecycle (postinstall) scripts by default unless allowed via `onlyBuiltDependencies`, and default hoist patterns have changed over time. Check the settings page for the version pinned in your `packageManager` field.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Assuming pnpm 'duplicates less' only because of dedupe — the saving comes from the global store and hard links.",
              "Fixing a 'module not found' after migrating from npm by enabling `shamefully-hoist` instead of adding the missing dependency to `package.json`.",
              "Thinking deleting a project's `node_modules` frees the disk space — the store still holds the content until `pnpm store prune`.",
              "Confusing hard links (same inode, same filesystem) with symlinks (path pointers).",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Layout", "Strictness", "Disk / speed", "Compatibility"],
            rows: [
              ["npm / Yarn v1 hoisted", "Loose (phantom deps)", "Full copies per project", "Highest — what most tools expect"],
              ["pnpm isolated (default)", "Strict for your code", "Single store + links; fast warm installs", "Very high; rare symlink-unaware tools"],
              ["pnpm `node-linker=hoisted`", "Loose", "Still uses the store", "npm-like"],
              ["Yarn Plug'n'Play", "Strict", "No node_modules at all; resolution via a generated map", "Needs PnP-aware tooling / patched fs"],
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "pnpm keeps every file of every package version once in a global content-addressable store keyed by content hash. On install it hard-links those files into a virtual store at `node_modules/.pnpm/<name>@<version>/node_modules/<name>`, and places each package's dependencies as sibling symlinks there. Your top-level `node_modules` contains only symlinks to your direct dependencies. Because Node resolves the real path and walks up, each package sees exactly its declared deps — so phantom dependencies fail, disk usage is shared across projects, and warm installs are mostly link creation.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Hard links give instant, space-free 'copies' within a filesystem; reflinks (copy-on-write clones) are preferred where supported because edits don't affect the store.",
              "Symlinks give the dependency graph structure without nesting folders, avoiding path-length issues and duplication.",
              "The lockfile pins exact versions and integrity hashes; `--frozen-lockfile` (default in CI) fails if `package.json` and lockfile disagree.",
              "Workspaces: `workspace:*` links local packages via symlinks and is rewritten to a real version range on publish.",
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
              "Create a project with npm, import a transitive dependency directly, then switch to pnpm and observe the failure.",
              "Install the same package in two projects and confirm identical inode numbers with `ls -i`.",
              "Run `pnpm store prune` after deleting a project and compare `du -sh` of the store before and after.",
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
              "One global store, files keyed by content hash.",
              "Hard links from the store into `node_modules/.pnpm`; symlinks to wire the graph.",
              "Top level exposes only direct dependencies → strictness for free from Node's resolution rules.",
              "Escape hatches exist (`node-linker=hoisted`, hoist patterns) for tools that assume a flat layout.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Content-addressable storage", definition: "Storing data under a name derived from a hash of its contents, so identical content is stored once and integrity is verifiable." },
      { term: "Hard link", definition: "An additional directory entry for the same inode; works only within one filesystem." },
      { term: "Symbolic link", definition: "A file containing a path that the OS follows when accessed; may point across filesystems and to directories." },
      { term: "Phantom dependency", definition: "A package your code imports successfully without declaring it, only because a hoisted layout happened to place it within reach." },
      { term: "Doppelganger", definition: "The same package version installed multiple times in different nested folders of a hoisted layout." },
      { term: "Virtual store", definition: "pnpm's `node_modules/.pnpm` directory containing one folder per resolved package instance." },
      { term: "Reflink", definition: "A copy-on-write clone: a new file sharing data blocks with the source until either is modified." },
    ],
    followUps: [
      { q: "Why does pnpm need both hard links and symlinks?", a: "Hard links share file *contents* with the store without copying bytes. Symlinks build the *directory structure* of the dependency graph, letting many packages point to one package folder without nesting or duplication. Hard links can't target directories, so they can't do the graph wiring." },
      { q: "A package works with npm but fails with 'Cannot find module' under pnpm. Why, and how do you fix it?", a: "Most likely the code (yours or the package's) imports something not declared in its package.json — a phantom dependency. Fix by adding the dependency (yours) or using `packageExtensions`/reporting upstream (theirs). Hoisting options are a last resort." },
      { q: "If two projects share a store and I edit a file in one project's node_modules, what happens?", a: "With hard links the edit changes the shared inode, so the other project sees it too and the store's content no longer matches its hash. Use `pnpm patch`, which creates a proper patched copy." },
    ],
    quiz: [
      {
        id: "pnpm-q1",
        prompt: "Your app declares only `express`. Under pnpm's default layout, what happens on `require('debug')` from your app code (express depends on debug)?",
        options: ["It resolves to express's copy of debug", "It fails with MODULE_NOT_FOUND", "pnpm installs debug automatically", "It resolves from the global store"],
        answer: 1,
        explanation: "The top-level node_modules holds only symlinks for direct dependencies; debug is reachable only from inside express's virtual-store folder.",
      },
      {
        id: "pnpm-q2",
        prompt: "Why might pnpm fall back to copying files instead of hard-linking?",
        options: ["The package is too large", "The store is on a different filesystem than the project", "The lockfile is frozen", "The package has peer dependencies"],
        answer: 1,
        explanation: "Hard links cannot span filesystems, so pnpm's `auto` import method falls back to copying (after trying reflink clone and hard link).",
      },
      {
        id: "pnpm-q3",
        prompt: "Where does Node look for express's own dependencies when express is loaded via pnpm's symlink?",
        options: ["The project's top-level node_modules only", "Next to express's real path inside `.pnpm/express@x/node_modules/`", "In the global store", "In NODE_PATH only"],
        answer: 1,
        explanation: "Node resolves the symlink to its real path and walks up from there, reaching the sibling symlinks pnpm created in the same `node_modules` folder.",
      },
    ],
  },
  {
    slug: "git-workflows",
    track: "production",
    title: "Git workflows, Conventional Commits and history cleanup",
    summary:
      "Branching models (trunk-based, GitHub flow, Git Flow), merge vs rebase, Conventional Commits with Commitizen, and rewriting history safely with git-filter-repo.",
    level: "beginner",
    frequency: "medium",
    minutes: 30,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: [],
    related: ["production/monorepos-turborepo", "production/repo-documentation-github-quality", "cloud/ci-cd"],
    tags: ["git", "branching", "rebase", "conventional-commits", "commitizen", "git-filter-repo"],
    sources: [
      GIT_BOOK,
      { label: "Pro Git: Git Branching — Rebasing", url: "https://git-scm.com/book/en/v2/Git-Branching-Rebasing", kind: "docs" },
      { label: "Conventional Commits 1.0.0", url: "https://www.conventionalcommits.org/en/v1.0.0/", kind: "docs" },
      { label: "Commitizen (cz-cli)", url: "https://github.com/commitizen/cz-cli", kind: "external" },
      { label: "git-filter-repo", url: "https://github.com/newren/git-filter-repo", kind: "external" },
      { label: "git-filter-branch docs (warning recommending alternatives)", url: "https://git-scm.com/docs/git-filter-branch", kind: "docs" },
      { label: "GitHub: Removing sensitive data from a repository", url: "https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Compare trunk-based development, GitHub flow and Git Flow.",
              "Choose between merge, squash-merge and rebase, and know the golden rule of rebasing.",
              "Write Conventional Commits and explain how they drive semantic versioning and changelogs.",
              "Remove a file or secret from all history with git-filter-repo — and know why rotation is still mandatory.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A Git repository is a graph of immutable commits, each pointing to its parent(s); branches are just movable labels on commits. Every 'workflow' is a convention about where labels move and how branches rejoin. 'Rewriting history' never edits commits — it creates new commits and moves labels to them.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Model", "Shape", "Fits"],
            rows: [
              ["Trunk-based", "Short-lived branches (hours to a day or two) merged to `main` often; incomplete work hidden behind feature flags", "Teams with strong CI and continuous deployment"],
              ["GitHub flow", "Branch from `main`, open a PR, review + CI, merge, deploy", "Most web apps and open-source projects"],
              ["Git Flow", "Long-lived `develop` plus `feature/*`, `release/*`, `hotfix/*` branches", "Versioned products with scheduled releases; heavy for continuous delivery"],
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "Merge, squash and rebase",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Merge commit", points: ["Preserves the true history and branch topology", "Creates a commit with two parents", "History can get noisy"] },
              { title: "Squash merge", points: ["Whole PR becomes one commit on main", "Clean, revertible-per-PR history", "Loses individual commit granularity"] },
              { title: "Rebase", points: ["Replays your commits on top of the new base, creating new commit ids", "Linear history", "Never rebase commits others have already based work on (shared/pushed branches) — their copies diverge"] },
            ],
          },
          {
            type: "code",
            lang: "bash",
            caption: "Updating a feature branch and cleaning it before review.",
            code: `git fetch origin
git rebase origin/main            # replay my commits on the latest main
git rebase -i origin/main         # (interactive; squash/fixup/reword my own commits)
git push --force-with-lease       # safer than --force: refuses if remote moved unexpectedly`,
          },
        ],
      },
      {
        id: "examples",
        title: "Conventional Commits and Commitizen",
        blocks: [
          {
            type: "code",
            lang: "text",
            caption: "Format: type(optional scope)!: description, then optional body and footers.",
            code: `feat(auth): add refresh-token rotation

fix(api): return 404 instead of 500 for missing order

feat(billing)!: drop support for legacy invoice ids

BREAKING CHANGE: invoice ids are now UUIDs`,
          },
          {
            type: "list",
            items: [
              "`fix` → PATCH, `feat` → MINOR, `!` or a `BREAKING CHANGE:` footer → MAJOR (under SemVer). Other types (`docs`, `chore`, `refactor`, `test`, `ci`, `perf`) are conventions, not part of the core spec's version mapping.",
              "**Commitizen** (`cz`/`git cz`) prompts you for type, scope and description so messages follow the format; **commitlint** in a `commit-msg` hook (e.g. via Husky) enforces it.",
              "Release tools (semantic-release, release-please, changesets with conventions) read commit history to bump versions and generate CHANGELOGs.",
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Removing a committed secret with git-filter-repo",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Rotate the secret first", detail: "Once pushed, assume it's compromised: clones, forks, CI caches and scrapers may already have it. Rewriting history only stops *future* exposure." },
              { title: "Work in a fresh clone", detail: "git-filter-repo refuses to run on a non-fresh clone without `--force`, as a safety check against destroying unpushed work." },
              { title: "Rewrite", detail: "`git filter-repo --invert-paths --path config/.env` removes the file from every commit; `--replace-text replacements.txt` redacts strings inside files instead." },
              { title: "Re-add remote and force-push", detail: "filter-repo removes the `origin` remote to prevent accidental pushes; add it back and force-push all branches and tags." },
              { title: "Clean up downstream", detail: "Every collaborator must re-clone (old clones still contain the secret). Hosts may keep cached views or PR refs — follow the host's sensitive-data guide." },
            ],
          },
          {
            type: "code",
            lang: "bash",
            code: `git clone --mirror git@github.com:acme/app.git && cd app.git
git filter-repo --invert-paths --path config/.env
git remote add origin git@github.com:acme/app.git
git push --force --mirror origin`,
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "filter-repo vs filter-branch",
            text: "git-filter-repo is a separate tool (a Python script), not built into Git. Git's own documentation for `git filter-branch` warns about its pitfalls and performance and points users to alternatives such as git-filter-repo.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Rebasing or force-pushing a shared branch, silently discarding teammates' commits — use `--force-with-lease` and agree on who owns the branch.",
              "Treating history rewrite as sufficient after a leak without rotating credentials.",
              "Long-lived feature branches that drift for weeks and produce painful merges.",
              "Commit messages like 'fix stuff' that make `git log`, `git bisect` and changelogs useless.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "I prefer short-lived branches off `main` with PRs, CI and squash or rebase merges for a linear history, and feature flags for unfinished work. Rebasing rewrites commits, so I only rebase my own unshared work and push with `--force-with-lease`. Conventional Commits make history machine-readable so versions and changelogs can be automated. If a secret is committed, I rotate it immediately, then purge it with git-filter-repo and force-push, knowing existing clones still contain it.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Branches are labels; rewriting history creates new commits.",
              "Pick a branching model that matches release cadence; trunk-based + flags for continuous delivery.",
              "Conventional Commits: `type(scope)!: description` → automated SemVer and changelogs.",
              "Leaked secret: rotate first, then filter-repo, force-push, re-clone.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Rebase", definition: "Replaying commits onto a new base commit, producing new commits with new ids." },
      { term: "Squash merge", definition: "Combining all commits of a branch into a single commit on the target branch." },
      { term: "Feature flag", definition: "A runtime switch that hides incomplete or risky functionality so code can merge before it's released." },
      { term: "--force-with-lease", definition: "A force push that fails if the remote branch has moved since you last fetched it." },
    ],
    followUps: [
      { q: "When would you choose merge commits over squash merges?", a: "When individual commits within a branch are meaningful and reviewed (e.g. a large, carefully staged change, or integrating long-lived release branches) and you want the branch topology preserved for auditing." },
      { q: "Why does git-filter-repo not fully solve a leaked secret?", a: "Anyone who cloned, forked or cached the repo before the rewrite still has the old objects. Only rotating (revoking and reissuing) the secret removes the risk." },
    ],
    quiz: [
      {
        id: "git-q1",
        prompt: "Under Conventional Commits with SemVer, `feat(api)!: remove v1 endpoints` triggers which bump?",
        options: ["Patch", "Minor", "Major", "None"],
        answer: 2,
        explanation: "The `!` marks a breaking change, which maps to a MAJOR version bump regardless of type.",
      },
      {
        id: "git-q2",
        prompt: "Why is `git push --force-with-lease` safer than `--force`?",
        options: ["It signs the push", "It refuses if the remote branch changed since your last fetch", "It creates a backup branch", "It only pushes tags"],
        answer: 1,
        explanation: "It checks the remote ref still matches what you last saw, so you don't overwrite someone else's new commits.",
      },
    ],
  },
  {
    slug: "monorepos-turborepo",
    track: "production",
    title: "Monorepos and Turborepo: task graphs and remote caching",
    summary:
      "Why teams put many packages in one repository, and how Turborepo builds a task graph from workspace dependencies and skips work using content-hashed local and remote caches.",
    level: "intermediate",
    frequency: "medium",
    minutes: 30,
    kinds: ["theory", "coding"],
    status: "outline",
    prerequisites: ["production/pnpm-internals"],
    related: ["production/build-performance", "cloud/ci-cd", "typescript/incremental-compilation"],
    tags: ["monorepo", "turborepo", "task-graph", "remote-cache", "workspaces"],
    sources: [
      TURBO_DOCS,
      { label: "Turborepo: Configuring tasks", url: "https://turbo.build/repo/docs/crafting-your-repository/configuring-tasks", kind: "docs" },
      { label: "Turborepo: Caching", url: "https://turbo.build/repo/docs/crafting-your-repository/caching", kind: "docs" },
      { label: "pnpm workspaces", url: "https://pnpm.io/workspaces", kind: "docs" },
      { label: "monorepo.tools (comparison of monorepo tools)", url: "https://monorepo.tools/", kind: "external" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Weigh monorepo vs polyrepo: atomic cross-package changes and shared tooling vs CI scale and ownership boundaries.",
              "Explain how Turborepo derives a task graph from `turbo.json` (`dependsOn`, `^build` meaning 'build my dependencies first') and the workspace package graph.",
              "Explain cache keys: a hash of task inputs (source files, dependency hashes, env vars, config) mapped to stored outputs and logs.",
              "Set up remote caching so CI and teammates share results, and filter runs to affected packages.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "code",
            lang: "json",
            caption: "A minimal turbo.json: build dependencies first; cache dist/ as the build output.",
            code: `{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "test": { "dependsOn": ["build"] },
    "dev": { "cache": false, "persistent": true }
  }
}`,
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Config key changed in Turborepo 2",
            text: "Turborepo 2.x uses a top-level `tasks` key; 1.x used `pipeline`. Check the schema for your installed version.",
          },
        ],
      },
      {
        id: "summary",
        title: "What this lesson will cover",
        blocks: [
          {
            type: "list",
            items: [
              "Monorepo trade-offs and alternatives (Nx, Bazel, plain pnpm workspaces).",
              "Task graph construction, parallelism and topological ordering.",
              "Cache hashing inputs, declaring `outputs` and `env` correctly, and debugging cache misses (`--dry`, `--summarize`).",
              "Remote caching and its security (signed artifacts), plus `--filter` for affected-only CI.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "build-performance",
    track: "production",
    title: "Build performance: incremental compilation and caching",
    summary:
      "Making builds and CI fast by not redoing work: incremental compilers, project references, faster transpilers, dependency and Docker layer caching, and task-level caches.",
    level: "intermediate",
    frequency: "low",
    minutes: 25,
    kinds: ["theory"],
    status: "outline",
    prerequisites: ["typescript/incremental-compilation", "production/monorepos-turborepo"],
    related: ["production/pnpm-internals", "cloud/ci-cd", "cloud/docker"],
    tags: ["build", "ci", "caching", "incremental", "typescript", "docker"],
    sources: [
      { label: "TypeScript: Project References", url: "https://www.typescriptlang.org/docs/handbook/project-references.html", kind: "docs" },
      { label: "TSConfig reference: incremental", url: "https://www.typescriptlang.org/tsconfig#incremental", kind: "docs" },
      { label: "Docker build cache", url: "https://docs.docker.com/build/cache/", kind: "docs" },
      { label: "GitHub Actions: caching dependencies", url: "https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows", kind: "docs" },
      { label: "Turborepo: Caching", url: "https://turbo.build/repo/docs/crafting-your-repository/caching", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Measure before optimising: find where build/CI time goes (install, type-check, bundle, tests, image build).",
              "Use incremental compilation (`tsc --incremental`, `.tsbuildinfo`, project references with `tsc -b`) and separate type-checking from transpilation (esbuild/SWC).",
              "Order Dockerfile instructions so dependency layers are cached, and cache package-manager stores in CI.",
              "Understand the correctness risk of caching: every input that affects output must be part of the cache key.",
            ],
          },
        ],
      },
      {
        id: "summary",
        title: "What this lesson will cover",
        blocks: [
          {
            type: "list",
            items: [
              "Profiling builds and CI pipelines.",
              "Incremental and parallel compilation; transpile-only vs type-check.",
              "Layer, dependency and task caches; cache key design and invalidation.",
              "Splitting and sharding test suites; only building what changed.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "repo-documentation-github-quality",
    track: "production",
    title: "Repository documentation and GitHub project quality",
    summary:
      "What makes a repository easy to understand, run and contribute to: a good README, contributing guide, license, templates, CI badges, branch protection and architecture notes.",
    level: "beginner",
    frequency: "low",
    minutes: 20,
    kinds: ["theory"],
    status: "outline",
    prerequisites: ["production/git-workflows"],
    related: ["cloud/ci-cd", "production/production-feature-development"],
    tags: ["documentation", "readme", "github", "open-source", "contributing"],
    sources: [
      { label: "GitHub Docs: About READMEs", url: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes", kind: "docs" },
      { label: "GitHub Docs: Setting up your project for healthy contributions", url: "https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions", kind: "docs" },
      { label: "Choose a License", url: "https://choosealicense.com/", kind: "external" },
      { label: "Diátaxis documentation framework", url: "https://diataxis.fr/", kind: "external" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Write a README that answers: what is this, why does it exist, how do I run it in under five minutes, how is it configured, and where do I go next.",
              "Add community health files: CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, LICENSE, issue and PR templates.",
              "Separate documentation types (tutorials, how-to guides, reference, explanation) as described by Diátaxis.",
              "Signal quality with CI status, tests, releases/changelog, and protected branches requiring review.",
            ],
          },
        ],
      },
      {
        id: "summary",
        title: "What this lesson will cover",
        blocks: [
          {
            type: "list",
            items: [
              "README structure and examples; architecture decision records (ADRs).",
              "GitHub community health files, templates, CODEOWNERS and branch protection rules.",
              "Keeping docs correct: docs next to code, checked examples, review requirements.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "pm2",
    track: "production",
    title: "PM2: running Node.js processes in production",
    summary:
      "Using the PM2 process manager to keep Node apps alive, run them in cluster mode across CPU cores, reload without downtime, manage logs and restart on boot — and when a container orchestrator replaces it.",
    level: "beginner",
    frequency: "low",
    minutes: 20,
    kinds: ["theory"],
    status: "outline",
    prerequisites: ["nodejs/node-architecture"],
    related: ["cloud/docker", "cloud/kubernetes", "production/observability-opentelemetry"],
    tags: ["pm2", "nodejs", "process-manager", "cluster", "zero-downtime"],
    sources: [
      { label: "PM2 quick start", url: "https://pm2.keymetrics.io/docs/usage/quick-start/", kind: "docs" },
      { label: "PM2 cluster mode", url: "https://pm2.keymetrics.io/docs/usage/cluster-mode/", kind: "docs" },
      { label: "PM2 ecosystem file", url: "https://pm2.keymetrics.io/docs/usage/application-declaration/", kind: "docs" },
      { label: "Node.js cluster module", url: "https://nodejs.org/api/cluster.html", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Start, restart, stop and monitor apps with PM2 and an `ecosystem.config.js`.",
              "Explain cluster mode: PM2 uses Node's `cluster` module to fork workers that share a listening port, one per core with `-i max`.",
              "Use `pm2 reload` for rolling restarts and handle `SIGINT` for graceful shutdown.",
              "Persist the process list across reboots (`pm2 startup`, `pm2 save`) and rotate logs.",
              "Decide when PM2 is redundant (inside Kubernetes/ECS, where the orchestrator restarts containers and scales replicas).",
            ],
          },
        ],
      },
      {
        id: "summary",
        title: "What this lesson will cover",
        blocks: [
          {
            type: "list",
            items: [
              "Fork vs cluster mode and the stateful-memory caveat (in-memory sessions don't share across workers).",
              "Zero-downtime reloads, graceful shutdown and readiness signalling.",
              "Logs, monitoring and memory-limit restarts.",
              "PM2 on a VM vs one process per container.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "production-feature-development",
    track: "production",
    title: "Production-level feature development",
    summary:
      "Taking a feature from idea to safely running in production: design notes, tests, migrations, feature flags, observability, staged rollout, and rollback planning.",
    level: "intermediate",
    frequency: "medium",
    minutes: 30,
    kinds: ["theory", "system-design"],
    status: "outline",
    prerequisites: ["production/git-workflows", "system-design/deployment-strategies"],
    related: ["production/observability-opentelemetry", "cloud/ci-cd", "system-design/fail-fast-graceful-degradation"],
    tags: ["feature-flags", "rollout", "migrations", "testing", "production-readiness"],
    sources: [
      { label: "Learner's study list (topic name only)", kind: "original-note", note: "Listed as a topic in the learner's notes; no further content was supplied, so none is reproduced." },
      { label: "Martin Fowler: Feature Toggles", url: "https://martinfowler.com/articles/feature-toggles.html", kind: "external" },
      { label: "Google SRE book", url: "https://sre.google/sre-book/table-of-contents/", kind: "external" },
      { label: "Martin Fowler: Parallel Change (expand/contract)", url: "https://martinfowler.com/bliki/ParallelChange.html", kind: "external" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Write a short design doc covering scope, data model changes, failure modes and metrics of success.",
              "Ship schema changes safely with expand/contract (backward-compatible migrations, then cleanup).",
              "Merge early behind feature flags and roll out gradually (internal → percentage → everyone) with a kill switch.",
              "Define production readiness: tests, dashboards, alerts, runbooks, rate limits, idempotency, and a rollback plan.",
            ],
          },
        ],
      },
      {
        id: "summary",
        title: "What this lesson will cover",
        blocks: [
          {
            type: "list",
            items: [
              "From ticket to design doc to reviewable PRs.",
              "Testing pyramid and contract tests for APIs.",
              "Migrations, flags, canaries and dark launches.",
              "Post-launch: measuring adoption, cleaning up flags, writing a post-mortem when things go wrong.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "user-retention-product-analytics",
    track: "production",
    title: "User retention and product analytics",
    summary:
      "Instrumenting product events and reading retention cohorts, funnels and activation metrics so engineering work can be judged by whether users actually come back.",
    level: "beginner",
    frequency: "low",
    minutes: 20,
    kinds: ["theory"],
    status: "outline",
    prerequisites: ["production/production-feature-development"],
    related: ["production/observability-opentelemetry", "system-design/dashboards-alerts"],
    tags: ["product-analytics", "retention", "cohorts", "funnels", "events"],
    sources: [
      { label: "Learner's study list (topic name only)", kind: "original-note", note: "Listed as a topic in the learner's notes; no further content was supplied, so none is reproduced." },
      { label: "PostHog docs: Retention", url: "https://posthog.com/docs/product-analytics/retention", kind: "docs" },
      { label: "Rodden, Hutchinson, Fu (2010): Measuring the User Experience on a Large Scale (HEART framework)", url: "https://research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications/", kind: "external" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Design an event taxonomy (consistent names, properties, user and session identity) and track it reliably server-side where possible.",
              "Read a cohort retention table (Day 1/7/30) and distinguish retention from engagement and acquisition.",
              "Build funnels to find drop-off and define an activation event that predicts retention.",
              "Respect privacy: consent, PII minimisation and data retention rules.",
            ],
          },
        ],
      },
      {
        id: "summary",
        title: "What this lesson will cover",
        blocks: [
          {
            type: "list",
            items: [
              "Product analytics vs operational observability.",
              "Events, identities, cohorts, funnels and retention curves.",
              "Frameworks such as HEART for choosing metrics; A/B testing basics.",
              "Implementation pitfalls: duplicate events, client blocking, timezone bucketing.",
            ],
          },
        ],
      },
    ],
  },
];
