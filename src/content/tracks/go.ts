import type { Track } from "../types";

/**
 * Go track structure. Lessons live in `go-fundamentals.ts` (fundamentals, runtime & memory)
 * and `go-concurrency.ts` (concurrency & production).
 */
const notion = (label: string, url: string) => ({ label, url, kind: "inaccessible" as const, note: "Learner's private Notion page — not publicly readable, so nothing was imported from it." });

export const track: Track = {
  slug: "go",
  title: "Go",
  tagline: "From Hello World to the G/M/P scheduler, escape analysis and production services.",
  description:
    "A path from installation and syntax to how the Go runtime actually schedules goroutines, allocates memory, grows slices and collects garbage — then on to concurrency patterns and production engineering.",
  modules: [
    {
      id: "go-fundamentals",
      title: "Fundamentals",
      summary: "Tooling, syntax, types, functions, structs, interfaces and the standard library you use every day.",
      lessons: [
        "why-go", "installation-hello-world", "tooling-gofmt", "packages-modules", "variables-constants",
        "control-flow", "arrays", "slices-internals", "maps", "functions", "errors", "structs-methods",
        "interfaces", "enums-iota", "json", "http-server", "http-client", "external-modules",
      ],
    },
    {
      id: "go-runtime-memory",
      title: "Runtime and memory",
      summary: "Pointers, stack vs heap, escape analysis, the garbage collector and interface internals.",
      lessons: ["pointers", "stack-vs-heap", "escape-analysis", "garbage-collection", "interface-internals-typed-nil", "method-sets"],
    },
    {
      id: "go-concurrency",
      title: "Concurrency",
      summary: "Goroutines, the scheduler, channels, select, sync primitives and the patterns built from them.",
      lessons: [
        "concurrency-vs-parallelism", "goroutines", "gmp-scheduler", "goroutine-stacks", "channels",
        "channel-close-range", "select", "defer", "waitgroup", "mutex", "atomics", "sync-once",
        "worker-pool", "fork-join", "concurrent-requests", "context", "race-deadlock-livelock",
        "goroutine-leaks", "backpressure-bounded-concurrency", "puzzles",
      ],
    },
    {
      id: "go-production",
      title: "Production Go",
      summary: "Graceful shutdown, error wrapping, the race detector, profiling, testing, logging and Gin.",
      lessons: [
        "graceful-shutdown", "error-wrapping", "race-detector", "profiling-pprof", "benchmarking-testing",
        "structured-logging", "gin",
      ],
    },
  ],
  milestones: [
    {
      id: "go-concurrent-http-client",
      title: "Concurrent HTTP client",
      summary: "Fetch N URLs concurrently with a concurrency limit, per-request timeouts and cancellation.",
      level: "intermediate",
      requirements: [
        "Bound concurrency with a semaphore channel or worker pool",
        "Propagate a context with a deadline to every request",
        "Collect results and errors without data races (`go test -race` passes)",
        "Close response bodies; no goroutine leaks when the context is cancelled",
      ],
      stretch: ["Retry with exponential backoff and jitter", "Expose metrics: latency histogram, in-flight requests"],
      exercises: ["go/worker-pool", "go/context", "go/http-client", "go/goroutine-leaks"],
    },
    {
      id: "go-worker-pool",
      title: "Worker pool with graceful shutdown",
      summary: "A job queue with N workers that drains in-flight work on SIGTERM.",
      level: "intermediate",
      requirements: [
        "Jobs channel owned and closed by the producer only",
        "WaitGroup to wait for workers; results channel closed after all workers exit",
        "Shutdown on SIGINT/SIGTERM via `signal.NotifyContext`",
      ],
      exercises: ["go/worker-pool", "go/waitgroup", "go/channel-close-range", "go/graceful-shutdown"],
    },
    {
      id: "go-rate-limiter",
      title: "Token-bucket rate limiter middleware",
      summary: "HTTP middleware limiting requests per client key, safe under concurrency.",
      level: "advanced",
      requirements: [
        "Token bucket per key protected by a mutex (or sharded map)",
        "Return 429 with `Retry-After`",
        "Evict idle buckets so memory doesn't grow without bound",
        "Benchmarks and race-detector clean tests",
      ],
      exercises: ["go/mutex", "go/http-server", "system-design/rate-limiting"],
    },
  ],
  sources: [
    { label: "The Go Programming Language Specification", url: "https://go.dev/ref/spec", kind: "docs" },
    { label: "Effective Go", url: "https://go.dev/doc/effective_go", kind: "docs" },
    { label: "The Go Memory Model", url: "https://go.dev/ref/mem", kind: "docs" },
    { label: "A Guide to the Go Garbage Collector", url: "https://go.dev/doc/gc-guide", kind: "docs" },
    { label: "Practical Go Lessons (book)", url: "https://www.practical-go-lessons.com/", kind: "external", note: "Recommended companion reading supplied by the learner." },
    { label: "Learner's Go practice code (language-learning/Go)", url: "https://github.com/saurabhraghuvanshii/language-learning/tree/main/Go", kind: "original-note" },
    notion("Notion: Installation", "https://app.notion.com/p/Installation-1a2e9488b51a810a8424c1c5b4bafc77?pvs=21"),
    notion("Notion: Goroutines", "https://app.notion.com/p/Goroutines-1a2e9488b51a816da0b5d42463eeff5f?pvs=21"),
    notion("Notion: Channels — buffered vs unbuffered, defers", "https://app.notion.com/p/Channels-Buffered-vs-Unbuffered-defers-1a2e9488b51a81baa5f6f8568198f14b?pvs=21"),
    notion("Notion: Worker pool pattern", "https://app.notion.com/p/Worker-pool-pattern-1a2e9488b51a8130a3f6c09175ea85d3?pvs=21"),
  ],
};
