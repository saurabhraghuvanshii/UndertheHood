import type { Track } from "../types";

/**
 * System design track structure. The 40 checklist topics keep their original order.
 * Lessons live in `system-design-a.ts` (framework + topics 1–20) and `system-design-b.ts` (21–40).
 * Design exercises live in `../design/exercises.ts`.
 */
export const track: Track = {
  slug: "system-design",
  title: "System design interviews",
  tagline: "The 40-topic checklist, a repeatable interview method and 12 worked designs.",
  description:
    "Every building block of a system design interview explained from first principles — the mechanism, when to use it, its limits and operational cost — plus a repeatable framework for running the interview itself.",
  modules: [
    { id: "sd-method", title: "The interview method", summary: "A repeatable 12-step framework for any design question.", lessons: ["interview-framework"] },
    { id: "sd-foundations", title: "Scale and performance foundations", summary: "Checklist 1–4: scaling, latency vs throughput, estimation and the network path.", lessons: ["vertical-vs-horizontal-scaling", "latency-throughput", "capacity-estimation", "dns-tcp-lb-firewalls"] },
    { id: "sd-data", title: "Data storage", summary: "Checklist 5–8: choosing and modelling databases.", lessons: ["sql-vs-nosql", "data-modeling", "database-indexes", "normalization-denormalization"] },
    { id: "sd-caching", title: "Caching and traffic distribution", summary: "Checklist 9–12: caches, invalidation, load balancing and CDNs.", lessons: ["caching-strategies", "cache-invalidation", "load-balancing-algorithms", "cdn-edge-caching"] },
    { id: "sd-distributed-data", title: "Distributed data", summary: "Checklist 13–18: partitioning, replication, consistency, CAP, transactions and parallelism.", lessons: ["sharding-partitioning", "replication", "consistency-models", "cap-theorem", "locks-transactions-isolation", "multithreading-parallelism"] },
    { id: "sd-async", title: "APIs under load and async processing", summary: "Checklist 19–24: idempotency, rate limiting, queues, backpressure and delivery semantics.", lessons: ["api-idempotency", "rate-limiting", "async-processing", "rabbitmq-kafka-sqs", "backpressure", "delivery-semantics"] },
    { id: "sd-api", title: "API design", summary: "Checklist 25–29: REST, RPC/gRPC, versioning, OpenAPI and auth.", lessons: ["rest-api-design", "rpc-grpc", "api-versioning", "openapi-swagger", "authn-authz"] },
    { id: "sd-resilience", title: "Resilience", summary: "Checklist 30–32: timeouts, retries, circuit breakers, bulkheads and graceful degradation.", lessons: ["circuit-breakers-timeouts-retries", "bulkheads", "fail-fast-graceful-degradation"] },
    { id: "sd-observability", title: "Observability", summary: "Checklist 33–36: logs, metrics, traces, health checks and alerting.", lessons: ["logging-monitoring-tracing", "health-checks-heartbeats", "dashboards-alerts", "distributed-tracing"] },
    { id: "sd-operations", title: "Operating the system", summary: "Checklist 37–40: failover, discovery, deployments and service boundaries.", lessons: ["redundancy-failover", "service-discovery", "deployment-strategies", "monolith-vs-microservices"] },
  ],
  milestones: [
    {
      id: "sd-rate-limiter-service",
      title: "Distributed rate limiter",
      summary: "Implement a token-bucket limiter backed by Redis with atomic Lua scripts, and load-test it.",
      level: "advanced",
      requirements: ["Atomic check-and-decrement per key", "Correct behaviour across multiple app instances", "Fail-open vs fail-closed decision documented", "Load test showing limit accuracy"],
      exercises: ["system-design/rate-limiting", "backend/redis"],
    },
    {
      id: "sd-cache-layer",
      title: "Caching layer with invalidation",
      summary: "Add cache-aside caching to an API, with TTLs, stampede protection and invalidation on writes.",
      level: "intermediate",
      requirements: ["Cache-aside reads with TTL + jitter", "Invalidate on update; reason about the race between write and invalidate", "Single-flight / request coalescing for hot keys", "Hit-ratio metric"],
      exercises: ["system-design/caching-strategies", "system-design/cache-invalidation"],
    },
    {
      id: "sd-notification-system",
      title: "Scalable notification system",
      summary: "Queue-backed fan-out with retries, idempotency keys, a dead-letter queue and per-user rate limits.",
      level: "expert",
      requirements: ["Producer → queue → workers with at-least-once delivery", "Idempotent consumers", "Exponential backoff + DLQ", "Tracing across producer and consumer"],
      exercises: ["system-design/async-processing", "system-design/delivery-semantics", "system-design/api-idempotency", "system-design/distributed-tracing"],
    },
  ],
  sources: [
    { label: "Learner's 40-topic system design checklist", kind: "original-note", note: "Order and topic names preserved from the supplied checklist." },
    { label: "Designing Data-Intensive Applications — Martin Kleppmann", url: "https://dataintensive.net/", kind: "external" },
    { label: "Google SRE Book", url: "https://sre.google/sre-book/table-of-contents/", kind: "docs" },
    { label: "AWS Builders' Library", url: "https://aws.amazon.com/builders-library/", kind: "external" },
  ],
};
