import type { Lesson, Track } from "../types";

export const track: Track = {
  slug: "nodejs",
  title: "Node.js and runtime internals",
  tagline: "V8, libuv, the event loop phases, streams, workers and how Node really runs your code.",
  description:
    "What actually happens when Node runs a file: V8 compiles and optimises your JavaScript, libuv drives the event loop and a small thread pool, and the OS does the heavy lifting for network I/O. From there: streams and backpressure, worker threads vs cluster vs child processes, module resolution, and the production tooling around it.",
  modules: [
    {
      id: "node-runtime",
      title: "Runtime architecture",
      summary: "V8 + libuv + bindings, the thread pool, and the event loop phases with nextTick and microtasks.",
      lessons: ["node-architecture", "node-event-loop"],
    },
    {
      id: "node-v8",
      title: "Inside V8",
      summary: "Parsing, the Ignition interpreter, the Sparkplug/Maglev/TurboFan tiers, hidden classes, inline caches and garbage collection.",
      lessons: ["v8-internals", "jit-compilation"],
    },
    {
      id: "node-io-concurrency",
      title: "I/O and parallelism",
      summary: "Buffers, streams and backpressure; worker threads, cluster and child processes.",
      lessons: ["streams-buffers", "worker-threads"],
    },
    {
      id: "node-ecosystem",
      title: "Modules and production",
      summary: "CommonJS vs ESM resolution, PM2 process management, and choosing a web framework (Express vs Feathers.js).",
      lessons: ["module-systems", "pm2-process-management", "express-vs-feathers"],
    },
  ],
  milestones: [
    {
      id: "node-task-scheduler",
      title: "Event-loop-aware task scheduler",
      summary: "A scheduler that runs many small jobs without starving I/O, and proves it with event-loop lag metrics.",
      level: "intermediate",
      requirements: [
        "Accept jobs with priorities; run them in chunks that yield with `setImmediate` (not `process.nextTick`) so I/O callbacks still run",
        "Measure event-loop delay with `perf_hooks.monitorEventLoopDelay()` and print p50/p99 while a benchmark HTTP server is under load",
        "Show (with a test or log) the difference between scheduling the next chunk via `nextTick`, a resolved promise and `setImmediate`",
        "Offload one CPU-heavy job type to a `worker_threads` worker and compare the loop delay",
      ],
      stretch: ["Add cancellation with `AbortController`", "Expose metrics on a `/metrics` endpoint"],
      exercises: ["nodejs/node-event-loop", "nodejs/node-architecture", "nodejs/worker-threads"],
    },
    {
      id: "node-stream-processor",
      title: "Streaming file processor",
      summary: "Process a multi-gigabyte CSV/NDJSON file with constant memory using streams and `pipeline()`.",
      level: "intermediate",
      requirements: [
        "Read with `fs.createReadStream`, transform line-by-line with a `Transform` stream, write gzip output via `zlib`",
        "Wire everything with `stream/promises` `pipeline()` so errors and cleanup propagate",
        "Demonstrate backpressure: log when `write()` returns false and when `'drain'` fires",
        "Keep RSS roughly flat regardless of input size (record it with `process.memoryUsage()`)",
      ],
      stretch: ["Tune `highWaterMark` and graph throughput vs memory", "Parallelise CPU-heavy transforms with a worker pool"],
      exercises: ["nodejs/streams-buffers", "nodejs/node-architecture"],
    },
    {
      id: "node-cluster-service",
      title: "Multi-core HTTP service",
      summary: "Run one HTTP service across all cores with cluster or PM2 and shut down gracefully.",
      level: "advanced",
      requirements: [
        "Start one worker per core using `node:cluster` (or PM2 cluster mode) and restart crashed workers",
        "Handle SIGTERM: stop accepting connections, finish in-flight requests, then exit",
        "Explain in a README why in-memory state (sessions, rate limits) must move to Redis or similar",
      ],
      exercises: ["nodejs/worker-threads", "nodejs/pm2-process-management", "go/graceful-shutdown", "backend/redis"],
    },
  ],
  sources: [
    { label: "Node.js docs — The Node.js Event Loop", url: "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick", kind: "docs" },
    { label: "Node.js docs — Don't Block the Event Loop (or the Worker Pool)", url: "https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop", kind: "docs" },
    { label: "Node.js API reference", url: "https://nodejs.org/api/", kind: "docs" },
    { label: "libuv — Design overview", url: "https://docs.libuv.org/en/v1.x/design.html", kind: "docs" },
    { label: "V8 blog", url: "https://v8.dev/blog", kind: "docs" },
    { label: "V8 blog — Trash talk: the Orinoco garbage collector", url: "https://v8.dev/blog/trash-talk", kind: "docs" },
    { label: "100xDocs — review reminder from learner's study notes", kind: "original-note" },
  ],
};

export const lessons: Lesson[] = [
  // ───────────────────────────────────────────────────────────── node-architecture
  {
    slug: "node-architecture",
    track: "nodejs",
    title: "Node.js architecture: V8, libuv and the thread pool",
    summary:
      "Node is V8 (runs your JavaScript on one thread) plus libuv (event loop, OS async I/O and a small thread pool) glued together by C++ bindings. Knowing which work goes where explains almost every Node performance question.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 25,
    kinds: ["theory", "visualization"],
    status: "authored",
    prerequisites: ["javascript/event-loop", "javascript/sync-vs-async"],
    related: ["nodejs/node-event-loop", "nodejs/worker-threads", "nodejs/v8-internals", "os/processes-threads"],
    tags: ["node", "libuv", "v8", "thread-pool", "async-io"],
    sources: [
      { label: "libuv — Design overview", url: "https://docs.libuv.org/en/v1.x/design.html", kind: "docs" },
      { label: "libuv — Thread pool work scheduling", url: "https://docs.libuv.org/en/v1.x/threadpool.html", kind: "docs" },
      { label: "Node.js docs — Don't Block the Event Loop (or the Worker Pool)", url: "https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop", kind: "docs" },
      { label: "Node.js docs — dns: implementation considerations", url: "https://nodejs.org/api/dns.html#implementation-considerations", kind: "docs" },
      { label: "Node.js docs — CLI: UV_THREADPOOL_SIZE", url: "https://nodejs.org/api/cli.html#uv_threadpool_sizesize", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Name the three layers of Node (V8, libuv, bindings/core modules) and what each owns",
              "Explain why \"single-threaded\" refers to your JavaScript, not the whole process",
              "Say which operations use the libuv thread pool and which use the OS's async I/O",
              "Predict when the thread pool becomes a bottleneck and how to tune it",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Picture a restaurant with **one waiter** (the JavaScript thread) and a kitchen. The waiter never cooks: they take an order, hand it off, and move on to the next table. When a dish is ready, a bell rings and the waiter delivers it.",
          },
          {
            type: "p",
            text: "Some dishes are handled by the building itself (network sockets: the OS tells Node when data arrives). Others need a cook (file reads, hashing passwords): those go to a **small team of four cooks** — the libuv thread pool. If the waiter starts cooking themselves (a CPU-heavy loop), every table waits.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Layer", "What it is", "Responsibilities"],
            rows: [
              ["V8", "Google's JavaScript/WebAssembly engine (C++)", "Parse, compile and run JS; heap and garbage collection; microtask (promise) queue"],
              ["libuv", "Cross-platform C library for async I/O", "Event loop, timers, non-blocking sockets via epoll/kqueue/IOCP, thread pool for blocking work, signals, child processes"],
              ["Bindings + core modules", "C++ glue and JS libraries (`fs`, `net`, `crypto`, `zlib`…)", "Expose libuv/OpenSSL/zlib/c-ares/llhttp to JavaScript"],
              ["Your code", "JavaScript on the main thread", "Registers callbacks/promises; should do little CPU work per callback"],
            ],
          },
          {
            type: "p",
            text: "**Single-threaded** means one thread runs your JavaScript at a time per isolate. The Node *process* has several threads: the main thread, the libuv thread pool (default 4), V8's background compiler and GC helper threads, and more.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "A thread-per-connection server spends memory on stacks and CPU on context switches while most threads sit waiting for I/O. Node instead keeps one thread busy and lets the OS multiplex thousands of sockets, which is ideal for I/O-bound services (APIs, proxies, real-time apps).",
          },
          {
            type: "p",
            text: "The cost: any synchronous CPU work blocks *everything*. Knowing the architecture tells you when Node is a great fit and when you need workers, a separate service, or a different language.",
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "flow",
            nodes: ["Your JS (main thread)", "Node core module", "C++ binding", "libuv", "OS async I/O or thread pool", "Completion queued", "Event loop runs your callback"],
            caption: "Conceptual path of an async call such as fs.readFile or socket.write.",
          },
          {
            type: "table",
            head: ["Kind of work", "Where it runs", "Why"],
            rows: [
              ["TCP/UDP sockets, pipes, HTTP servers/clients", "OS async I/O (epoll on Linux, kqueue on macOS/BSD, IOCP on Windows)", "Kernels can notify readiness/completion for sockets without blocking a thread"],
              ["File system (`fs.*` async APIs)", "Thread pool", "Regular-file I/O has no portable non-blocking readiness API, so libuv runs blocking syscalls on worker threads"],
              ["`dns.lookup()` (used by `http.get`, `net.connect` by default)", "Thread pool", "Wraps the blocking `getaddrinfo(3)` so it honours /etc/hosts and nsswitch"],
              ["`dns.resolve*()`", "c-ares over sockets — not the thread pool", "Speaks DNS directly over the network"],
              ["`crypto.pbkdf2`, `scrypt`, `randomBytes`/`randomFill` (async), `generateKeyPair`", "Thread pool", "CPU-heavy; offloaded so the main thread stays free"],
              ["`zlib` async APIs", "Thread pool", "CPU-heavy compression"],
              ["Your own JS loops, `JSON.parse` of huge strings, sync APIs (`readFileSync`)", "Main thread", "Blocks the event loop until done"],
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "libuv implementation details",
            text: "The pool size defaults to 4 and is set by `UV_THREADPOOL_SIZE` (libuv caps it at 1024), read once when the pool is first used. Which calls use the pool is a libuv/Node implementation detail; recent libuv versions can also use `io_uring` for some file operations on Linux. Treat the table as the documented model, not a contract.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: what happens on fs.readFile",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "JS calls fs.readFile(path, cb)", detail: "Core `fs` validates arguments and calls into the C++ binding; the function returns immediately." },
              { title: "Work queued to libuv", detail: "The binding submits an open/stat/read/close sequence as thread-pool requests (`uv_fs_*`)." },
              { title: "A pool thread blocks on the syscall", detail: "One of the 4 threads performs `read(2)`; the main thread keeps running other JavaScript." },
              { title: "Completion signalled", detail: "The worker posts the result and wakes the loop (via an internal async handle) during the poll phase." },
              { title: "Callback runs on the main thread", detail: "libuv invokes the binding's completion, which calls your `cb(err, data)`; then Node drains nextTick and promise microtasks." },
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
            caption: "Saturating the thread pool: with the default 4 threads, 6 pbkdf2 calls finish in two waves. Timings are illustrative and machine-dependent.",
            code: `const crypto = require("node:crypto");
const start = Date.now();
for (let i = 1; i <= 6; i++) {
  crypto.pbkdf2("secret", "salt", 200_000, 64, "sha512", () => {
    console.log(\`hash \${i} done after \${Date.now() - start} ms\`);
  });
}`,
            output: `hash 1 done after 210 ms
hash 3 done after 212 ms
hash 2 done after 214 ms
hash 4 done after 215 ms
hash 5 done after 420 ms
hash 6 done after 423 ms`,
          },
          {
            type: "p",
            text: "Run it with `UV_THREADPOOL_SIZE=6 node hash.js` and (on a machine with ≥6 cores) all six finish in one wave. The first four finish in nondeterministic order because they truly run in parallel.",
          },
          {
            type: "code",
            lang: "js",
            caption: "Blocking the main thread delays every other callback, including timers.",
            code: `const t0 = Date.now();
setTimeout(() => console.log(\`timer fired after \${Date.now() - t0} ms\`), 10);
while (Date.now() - t0 < 500) {} // busy loop on the JS thread`,
            output: "timer fired after 500 ms",
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Slow DNS starves file I/O.** `dns.lookup` occupies a pool thread; four slow lookups block every `fs` call. Use `dns.resolve*`, a caching resolver, or a bigger pool.",
              "**`*Sync` APIs** (`readFileSync`, `pbkdf2Sync`) run on the main thread — fine at startup, harmful inside request handlers.",
              "**Raising the pool size isn't free:** more threads than cores just adds contention for CPU-bound work.",
              "**Network I/O doesn't care about the pool:** 10,000 open sockets need zero pool threads.",
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
            title: "\"Node is single-threaded, so it can't use multiple cores\"",
            text: "Your JavaScript runs on one thread per isolate, but the process already uses several threads, and you can use more cores with `worker_threads`, `cluster` or multiple processes behind a load balancer.",
          },
          {
            type: "callout",
            tone: "misconception",
            title: "\"All async I/O goes through the thread pool\"",
            text: "Only operations without a usable OS async API (files, `getaddrinfo`, some crypto/zlib) use the pool. Sockets use the kernel's readiness notification directly.",
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Node's model is great for", points: ["Many concurrent, mostly idle connections", "I/O-bound APIs, gateways, BFFs, real-time (WebSockets)", "Sharing code/types with the frontend"] },
              { title: "It struggles with", points: ["Long CPU-bound work on the request path (image processing, big JSON, crypto in JS)", "Workloads needing shared-memory parallelism everywhere", "Latency-sensitive services where one slow callback delays all others"] },
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
              "Monitor event-loop delay (`perf_hooks.monitorEventLoopDelay`) alongside CPU — high delay with low CPU often means a long synchronous callback.",
              "Services doing heavy bcrypt/scrypt or file work commonly bump `UV_THREADPOOL_SIZE` (e.g. to 8–16) after measuring.",
              "CPU-heavy tasks (PDF rendering, image resizing) are pushed to worker threads or a separate queue-driven service.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Node is V8 plus libuv. V8 runs my JavaScript on a single main thread; libuv provides the event loop. Network I/O is handed to the OS's async mechanisms (epoll, kqueue, IOCP), so one thread can juggle thousands of sockets. Work that can't be done asynchronously by the OS — file system calls, `dns.lookup`, and CPU-heavy crypto and zlib — runs on libuv's thread pool, four threads by default. When work completes, its callback is queued and the event loop runs it on the main thread. So Node is single-threaded for JavaScript but not for the process, and the rule is: never block the main thread.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Mention the pool size knob (`UV_THREADPOOL_SIZE`, default 4) and a concrete starvation story (slow `dns.lookup` delaying `fs`).",
              "Distinguish readiness-based I/O (epoll/kqueue: \"socket is readable\") from completion-based (IOCP, io_uring: \"read finished\") and say libuv abstracts both.",
              "Explain how to use multiple cores: `worker_threads` for CPU tasks in-process, `cluster`/PM2 or containers for scaling a server horizontally.",
              "Bring metrics: event-loop delay/utilisation (`performance.eventLoopUtilization()`), not just CPU.",
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
              "V8 runs JS on one thread; libuv owns the loop, OS async I/O and the thread pool.",
              "Sockets → OS async I/O; files, `dns.lookup`, heavy crypto and zlib → thread pool (default 4).",
              "Blocking the main thread delays everything; saturating the pool delays only pool-backed calls.",
              "Scale CPU work with workers or processes, and measure event-loop delay.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "V8", definition: "Google's open-source JavaScript and WebAssembly engine used by Chrome and Node." },
      { term: "libuv", definition: "C library that provides Node's event loop, async I/O abstractions and thread pool across operating systems." },
      { term: "Thread pool", definition: "A fixed set of libuv worker threads (default 4) that run blocking operations so the main thread doesn't have to." },
      { term: "epoll / kqueue / IOCP", definition: "Kernel APIs on Linux, BSD/macOS and Windows for waiting on many I/O sources efficiently." },
      { term: "Binding", definition: "C++ code that exposes native functionality (libuv, OpenSSL, zlib) to JavaScript core modules." },
      { term: "Event-loop delay", definition: "How late the loop is in running callbacks compared with when they became runnable; a key Node health metric." },
    ],
    followUps: [
      { q: "Does `http.get('https://example.com')` use the thread pool?", a: "The DNS step does by default, because it calls `dns.lookup` (getaddrinfo). The TCP connection, TLS and data transfer use non-blocking sockets via the OS, not the pool." },
      { q: "Why not make the thread pool huge?", a: "Pool threads for CPU work compete for the same cores; beyond the core count you add context switches and memory with no throughput gain. Size it from measurements." },
      { q: "Is `setTimeout` handled by the thread pool?", a: "No. Timers live inside libuv's loop (a min-heap of deadlines) and are checked in the timers phase; no thread is used." },
      { q: "How do you use all cores for an HTTP server?", a: "Run N processes — `cluster`, PM2 cluster mode, or multiple containers behind a load balancer. `worker_threads` are better for offloading CPU tasks than for serving sockets." },
    ],
    quiz: [
      {
        id: "arch-q1",
        prompt: "Which of these does NOT use the libuv thread pool by default?",
        options: ["fs.readFile", "dns.lookup", "Reading from a TCP socket", "crypto.pbkdf2 (async)"],
        answer: 2,
        explanation: "Sockets use the OS's non-blocking I/O (epoll/kqueue/IOCP). The others are blocking or CPU-heavy and go to the pool.",
      },
      {
        id: "arch-q2",
        prompt: "You start 8 async `crypto.scrypt` calls at once with default settings on an 8-core machine. What happens?",
        options: ["All 8 run in parallel", "4 run in parallel, the other 4 wait for a free pool thread", "They run one at a time on the main thread", "Node throws because the pool is full"],
        answer: 1,
        explanation: "The default pool has 4 threads; extra requests queue until a thread frees up.",
      },
      {
        id: "arch-q3",
        prompt: "What does \"Node is single-threaded\" most accurately mean?",
        options: ["The process has exactly one OS thread", "Your JavaScript in one isolate runs on one thread at a time", "Node cannot use more than one CPU core", "I/O is performed synchronously"],
        answer: 1,
        explanation: "The process has many threads (pool, GC, compiler); only JS execution per isolate is single-threaded.",
      },
    ],
    questions: ["nodejs/node-01", "nodejs/node-04"],
  },
  // ───────────────────────────────────────────────────────────── node-event-loop
  {
    slug: "node-event-loop",
    track: "nodejs",
    title: "The Node.js event loop: phases, nextTick and microtasks",
    summary:
      "libuv's loop cycles through timers, pending callbacks, idle/prepare, poll, check and close phases. Between every callback Node drains the `process.nextTick` queue and then the promise microtask queue — which explains nearly every ordering puzzle.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 35,
    kinds: ["theory", "visualization", "coding"],
    status: "authored",
    prerequisites: ["nodejs/node-architecture", "javascript/event-loop", "javascript/promises"],
    related: ["javascript/timers", "javascript/async-await", "nodejs/streams-buffers", "os/io-models"],
    tags: ["node", "event-loop", "libuv", "nextTick", "setImmediate", "microtasks"],
    sources: [
      { label: "Node.js docs — The Node.js Event Loop", url: "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick", kind: "docs" },
      { label: "Node.js docs — Understanding process.nextTick()", url: "https://nodejs.org/en/learn/asynchronous-work/understanding-processnexttick", kind: "docs" },
      { label: "Node.js docs — Understanding setImmediate()", url: "https://nodejs.org/en/learn/asynchronous-work/understanding-setimmediate", kind: "docs" },
      { label: "libuv — Design overview (the I/O loop)", url: "https://docs.libuv.org/en/v1.x/design.html#the-i-o-loop", kind: "docs" },
      { label: "Node.js 11 changelog — timers/immediates microtask behaviour aligned with browsers", url: "https://github.com/nodejs/node/pull/22842", kind: "external" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "List the six loop phases in order and what each runs",
              "Explain where `process.nextTick` and promise callbacks run relative to phases",
              "Predict output ordering of `setTimeout(0)`, `setImmediate`, `nextTick` and promises — including the nondeterministic case",
              "Recognise patterns that starve the loop (recursive nextTick, huge sync work)",
            ],
          },
        ],
      },
      {
        id: "prerequisites",
        blocks: [
          {
            type: "p",
            text: "You should know the browser-style model from the JavaScript event loop lesson (`javascript/event-loop`): call stack, task queue and microtask queue. Node keeps the same promise semantics but replaces the single \"task queue\" with libuv's multi-phase loop.",
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Think of the loop as a bus driving a fixed circular route with six stops. At each stop it picks up every passenger (callback) waiting *for that stop* and serves them one by one. After **each** passenger, two VIP lines get served completely first: the `nextTick` line, then the promise line.",
          },
          {
            type: "p",
            text: "When nothing is waiting anywhere, the bus parks at the poll stop and sleeps until the OS wakes it (data arrived, timer due). When there is nothing left to wait for at all, Node exits.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Phase", "Runs", "Typical sources"],
            rows: [
              ["timers", "Callbacks of expired `setTimeout`/`setInterval`", "Timer min-heap whose deadline ≤ now"],
              ["pending callbacks", "Some I/O callbacks deferred from the previous iteration", "e.g. certain TCP errors like `ECONNREFUSED` on some systems"],
              ["idle, prepare", "Internal libuv/Node housekeeping", "Not user-visible"],
              ["poll", "Most I/O completion callbacks; may block waiting for I/O", "Sockets, file-system results from the pool, `fs` streams"],
              ["check", "`setImmediate` callbacks", "Always right after poll"],
              ["close callbacks", "`'close'` handlers", "`socket.destroy()`, `server.close()`"],
            ],
          },
          {
            type: "list",
            items: [
              "**nextTick queue** — `process.nextTick(fn)`; Node-specific; drained first after the current operation.",
              "**Microtask queue** — promise reactions and `queueMicrotask`; owned by V8; drained right after the nextTick queue.",
              "Both queues are drained **after every individual callback** (since Node 11), not once per phase.",
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "Ordering bugs are real production bugs: an event emitted before a listener is attached, a cache written after it is read, a recursive `nextTick` that freezes a server. Interviewers love output-prediction questions here because they test whether you know the *mechanism*, not just the API names.",
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Run the main script", detail: "Your top-level code runs to completion; then nextTick and microtask queues are drained. Then the loop starts." },
              { title: "timers", detail: "libuv updates its cached 'now' and runs every timer whose deadline has passed (subject to a per-iteration limit in Node's timer lists)." },
              { title: "pending → idle/prepare", detail: "Deferred I/O callbacks, then internal hooks." },
              { title: "poll", detail: "Compute a timeout: 0 if immediates are pending, else until the nearest timer, else infinite. Block in epoll/kqueue/IOCP for that long and run ready I/O callbacks." },
              { title: "check", detail: "Run all `setImmediate` callbacks queued before this phase began (ones queued during it wait for the next iteration)." },
              { title: "close", detail: "Run close handlers. If no active handles or requests remain (no timers, sockets, pending fs work), the process exits; otherwise loop again." },
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Version-dependent behaviour",
            text: "Before **Node 11**, microtasks ran only between phases, so two `setImmediate` callbacks ran back-to-back before any promise queued by the first. Node 11+ drains nextTick and microtasks after each callback, matching browsers. Exact phase internals belong to libuv and have been adjusted across releases; rely on the documented ordering guarantees, not on undocumented timing.",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "CommonJS vs ESM entry points",
            text: "In a CommonJS main script, `process.nextTick` callbacks run before promise callbacks queued in the same synchronous code. In an ES module, top-level code is itself evaluated as part of a promise job, so promise callbacks can run before nextTick callbacks. Avoid relying on nextTick-vs-promise order across module types.",
          },
        ],
      },
      {
        id: "visualization",
        blocks: [
          { type: "viz", id: "js-event-loop", caption: "Sync code, then microtasks, then tasks. In Node, think of 'tasks' as the per-phase callbacks (timers, I/O, check), with nextTick drained before promise microtasks." },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: a deterministic ordering puzzle",
        blocks: [
          {
            type: "code",
            lang: "js",
            caption: "Run as a CommonJS file (`node order.js`). This ordering is deterministic.",
            code: `const fs = require("node:fs");

console.log("1 sync start");
setImmediate(() => console.log("5 check: setImmediate"));
Promise.resolve().then(() => console.log("4 microtask: promise"));
process.nextTick(() => console.log("3 nextTick"));

fs.readFile(__filename, () => {
  console.log("6 poll: readFile callback");
  setTimeout(() => console.log("9 timers: setTimeout 0"), 0);
  setImmediate(() => console.log("8 check: setImmediate from I/O"));
  process.nextTick(() => console.log("7 nextTick after I/O callback"));
});

console.log("2 sync end");`,
            output: `1 sync start
2 sync end
3 nextTick
4 microtask: promise
5 check: setImmediate
6 poll: readFile callback
7 nextTick after I/O callback
8 check: setImmediate from I/O
9 timers: setTimeout 0`,
          },
          {
            type: "steps",
            steps: [
              { title: "Lines 1–2", detail: "Synchronous code runs first. `readFile` only *starts* work on the thread pool." },
              { title: "3 then 4", detail: "After the main script, Node drains nextTick, then V8's promise microtasks." },
              { title: "5", detail: "First iteration: no timers; poll finds nothing ready yet and doesn't wait because an immediate is pending; check runs the immediate." },
              { title: "6", detail: "readFile needs several pool round-trips (open, stat, read, close); its callback eventually runs in a later poll phase." },
              { title: "7", detail: "nextTick queued inside that callback runs as soon as the callback returns." },
              { title: "8 before 9", detail: "After poll comes check, so an immediate scheduled from an I/O callback always beats a 0 ms timer, which must wait for the next timers phase." },
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
            caption: "The famous nondeterministic case: in the main module, timeout vs immediate order depends on process performance.",
            code: `setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));`,
            output: `timeout
immediate
(or, on another run:)
immediate
timeout`,
          },
          {
            type: "p",
            text: "`setTimeout(fn, 0)` is really 1 ms. If the loop enters the timers phase *before* 1 ms has elapsed since scheduling, the timer isn't due and the immediate runs first; otherwise the timer runs first.",
          },
          {
            type: "code",
            lang: "js",
            caption: "Node ≥ 11 drains microtasks between individual immediates (Node ≤ 10 printed both immediates first).",
            code: `setImmediate(() => {
  console.log("immediate 1");
  Promise.resolve().then(() => console.log("microtask from immediate 1"));
});
setImmediate(() => console.log("immediate 2"));`,
            output: `immediate 1
microtask from immediate 1
immediate 2`,
          },
          {
            type: "code",
            lang: "js",
            caption: "Emitting from the constructor: nextTick lets callers attach listeners first.",
            code: `const { EventEmitter } = require("node:events");

class Job extends EventEmitter {
  constructor() {
    super();
    process.nextTick(() => this.emit("ready")); // emitting synchronously here would be lost
  }
}

const job = new Job();
job.on("ready", () => console.log("ready received"));`,
            output: "ready received",
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Starvation:** a `nextTick` (or promise) that recursively schedules itself never lets the loop reach poll — I/O stalls. Recursive `setImmediate` does not starve I/O.",
              "**Timers are minimums:** `setTimeout(fn, 100)` runs *no earlier* than 100 ms, later if the loop is busy.",
              "**Immediates added during check** run on the next iteration, so a self-rescheduling immediate yields to I/O each time.",
              "**Process exit:** the loop exits when there are no referenced handles; `timer.unref()` lets a timer not keep the process alive.",
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
            title: "\"setImmediate runs immediately; nextTick runs on the next tick\"",
            text: "The names are historical and effectively swapped: `nextTick` runs before the loop continues at all; `setImmediate` runs in the check phase of the current or next iteration. The Node docs themselves call the naming unfortunate.",
          },
          {
            type: "callout",
            tone: "warning",
            title: "Chunking CPU work with nextTick",
            text: "Splitting a big loop into `process.nextTick` chunks does *not* let I/O in — the nextTick queue is drained completely before moving on. Use `setImmediate` (or a worker thread) to yield.",
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Scheduler", "Runs", "Use for", "Risk"],
            rows: [
              ["`process.nextTick`", "Right after current operation, before promises", "Deferring an emit/callback until the caller has set up listeners; consistent async APIs", "Starves I/O if recursive"],
              ["`queueMicrotask` / promise", "After nextTick queue, before next callback", "Standard, cross-platform deferral", "Starves I/O if recursive"],
              ["`setImmediate`", "Check phase", "Yielding between chunks of work; running after current I/O", "Node-specific API"],
              ["`setTimeout(fn, 0)`", "Next timers phase (≥ 1 ms)", "Delays; cross-platform code", "Order vs setImmediate is nondeterministic outside I/O callbacks"],
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Node's event loop is libuv's loop with six phases: timers, pending callbacks, idle/prepare, poll, check and close callbacks. Timers run expired `setTimeout`/`setInterval` callbacks, poll waits for and runs I/O callbacks, check runs `setImmediate`, and close runs close handlers. On top of that, after every single callback Node drains the `process.nextTick` queue and then the promise microtask queue — that's been true since Node 11. So nextTick beats promises, both beat any timer or immediate, and inside an I/O callback `setImmediate` always fires before `setTimeout(0)`; in the main module that pair is nondeterministic.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Explain *why* poll blocks and how its timeout is computed (zero if immediates pending, else time to next timer).",
              "Explain the nondeterminism of timeout-vs-immediate in terms of the 1 ms minimum and loop start time.",
              "Mention the Node 11 change and the ESM-vs-CJS nextTick nuance as implementation details.",
              "Connect to production: event-loop delay metrics, recursive nextTick starvation, `setImmediate` for cooperative yielding, workers for CPU work.",
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
              "Phases: timers → pending → idle/prepare → poll → check → close.",
              "After each callback: drain nextTick, then promise microtasks.",
              "Inside I/O callbacks: setImmediate before setTimeout(0). In main module: either order.",
              "Yield with setImmediate; never loop forever on nextTick/microtasks.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Phase", definition: "One stage of a libuv loop iteration with its own FIFO queue of callbacks." },
      { term: "Microtask", definition: "A job in V8's queue (promise reactions, queueMicrotask) run before control returns to the event loop." },
      { term: "process.nextTick", definition: "Node-specific queue drained after the current operation and before promise microtasks." },
      { term: "setImmediate", definition: "Schedules a callback in the check phase, right after poll." },
      { term: "Starvation", definition: "When one kind of work keeps being scheduled so other work (e.g. I/O callbacks) never gets to run." },
      { term: "Handle (libuv)", definition: "A long-lived object such as a timer, socket or server that keeps the loop alive while active and referenced." },
    ],
    followUps: [
      { q: "Why is `setTimeout(fn, 0)` vs `setImmediate(fn)` nondeterministic in the main module?", a: "Node clamps 0 to 1 ms. Whether 1 ms has elapsed when the loop first checks timers depends on how long startup took, so either may run first. Inside an I/O callback, check always comes before the next timers phase." },
      { q: "What changed in Node 11?", a: "Microtasks and nextTicks started running between individual `setTimeout`/`setImmediate` callbacks instead of only between phases, aligning Node with browser semantics." },
      { q: "How would you detect a blocked event loop in production?", a: "Track event-loop delay (`monitorEventLoopDelay`) or event-loop utilisation, alert on p99, and use `--cpu-prof` or a profiler to find long synchronous frames." },
      { q: "When does the Node process exit?", a: "When the loop has no active, referenced handles or requests (timers, sockets, servers, pending fs work) and the queues are empty." },
    ],
    quiz: [
      {
        id: "loop-q1",
        prompt: "Inside an `fs.readFile` callback you call `setTimeout(a, 0)` and `setImmediate(b)`. Which runs first?",
        options: ["a", "b", "Nondeterministic", "Whichever was scheduled first"],
        answer: 1,
        explanation: "The callback runs in poll; check (setImmediate) comes next, before the loop wraps around to timers.",
      },
      {
        id: "loop-q2",
        prompt: "In a CommonJS main script, what's the output?",
        code: {
          lang: "js",
          code: `Promise.resolve().then(() => console.log("P"));
process.nextTick(() => console.log("T"));
console.log("S");`,
        },
        options: ["S P T", "S T P", "T P S", "P T S"],
        answer: 1,
        explanation: "Sync first, then the nextTick queue, then promise microtasks.",
      },
      {
        id: "loop-q3",
        prompt: "Which pattern can freeze all I/O in a Node server?",
        options: ["A function that reschedules itself with setImmediate", "A function that reschedules itself with process.nextTick", "A setInterval every 1 ms", "Many pending fs.readFile calls"],
        answer: 1,
        explanation: "The nextTick queue is drained completely before the loop proceeds, so a self-rescheduling nextTick never lets poll run.",
      },
    ],
    questions: ["nodejs/node-02", "nodejs/node-03"],
  },
  // ───────────────────────────────────────────────────────────── v8-internals
  {
    slug: "v8-internals",
    track: "nodejs",
    title: "V8 internals: tiers, hidden classes, inline caches and GC",
    summary:
      "V8 parses JavaScript to bytecode, interprets it with Ignition while collecting type feedback, then compiles hot code through Sparkplug, Maglev and TurboFan. Hidden classes and inline caches make property access fast; a generational garbage collector (Scavenger + Mark-Compact, project Orinoco) reclaims memory.",
    level: "advanced",
    frequency: "high",
    minutes: 35,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["nodejs/node-architecture", "javascript/execution-context", "javascript/prototypes"],
    related: ["nodejs/jit-compilation", "javascript/memory-leaks-gc", "javascript/performance", "go/garbage-collection", "os/stack-vs-heap"],
    tags: ["v8", "jit", "ignition", "turbofan", "hidden-classes", "inline-caches", "gc"],
    sources: [
      { label: "V8 blog — Firing up the Ignition interpreter", url: "https://v8.dev/blog/ignition-interpreter", kind: "docs" },
      { label: "V8 blog — Sparkplug: a non-optimizing JavaScript compiler", url: "https://v8.dev/blog/sparkplug", kind: "docs" },
      { label: "V8 blog — Maglev: V8's fastest optimizing JIT", url: "https://v8.dev/blog/maglev", kind: "docs" },
      { label: "V8 blog — Launching Ignition and TurboFan", url: "https://v8.dev/blog/launching-ignition-and-turbofan", kind: "docs" },
      { label: "V8 blog — Fast properties in V8", url: "https://v8.dev/blog/fast-properties", kind: "docs" },
      { label: "V8 docs — Maps (hidden classes) in V8", url: "https://v8.dev/docs/hidden-classes", kind: "docs" },
      { label: "V8 blog — Trash talk: the Orinoco garbage collector", url: "https://v8.dev/blog/trash-talk", kind: "docs" },
      { label: "V8 blog — Blazingly fast parsing, part 2: lazy parsing", url: "https://v8.dev/blog/preparser", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Trace a function from source text to optimised machine code and back (deoptimisation)",
              "Explain hidden classes (V8 \"Maps\") and why property order and late additions matter",
              "Explain inline caches and monomorphic vs polymorphic vs megamorphic call sites",
              "Describe V8's generational GC: Scavenger for the young generation, Mark-Compact for the old",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "JavaScript gives the engine almost no type information up front: `a + b` could add numbers, concatenate strings or call `valueOf`. V8's strategy is to **start cheap and watch**: run everything in an interpreter, record what types actually show up, and spend compile time only on code that is hot and predictable.",
          },
          {
            type: "p",
            text: "If a bet turns out wrong (a function optimised for numbers suddenly receives a string), V8 throws away the optimised code and falls back to the interpreter. That fallback is called **deoptimisation**.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Component", "Role", "Trade-off"],
            rows: [
              ["Parser (+ pre-parser)", "Source → AST; inner functions are pre-parsed lazily and fully parsed only when first called", "Fast startup vs re-parsing cost later"],
              ["Ignition", "Bytecode generator + register-based interpreter; records type feedback in feedback vectors", "Compact, quick to produce, slower to execute"],
              ["Sparkplug", "Baseline compiler: bytecode → machine code without optimisation", "Very fast compile, removes interpreter dispatch overhead"],
              ["Maglev", "Mid-tier optimising compiler using feedback", "Good code, compiles much faster than TurboFan"],
              ["TurboFan", "Top-tier speculative optimising compiler (inlining, escape analysis, type specialisation)", "Fastest code, most expensive to compile, can deoptimise"],
              ["Orinoco GC", "Generational, parallel/concurrent/incremental garbage collector", "Short pauses vs extra CPU and write-barrier cost"],
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "All of this is V8 implementation detail",
            text: "The ECMAScript spec says nothing about tiers, hidden classes or GC algorithms. Sparkplug shipped in V8 9.1 (2021), Maglev in Chrome 117 (2023); TurboFan's backend is being migrated to Turboshaft. Node inherits whatever V8 version it bundles, so heuristics change between Node releases — measure, don't memorise thresholds.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "Knowing the pipeline explains practical advice that otherwise sounds like folklore: initialise all object fields in the constructor, keep functions monomorphic in hot paths, avoid `delete` on hot objects, and don't keep large object graphs alive. It also explains why micro-benchmarks lie (warm-up, tier-up, dead-code elimination).",
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "flow",
            nodes: ["Source", "Parser → AST", "Ignition bytecode + feedback", "Sparkplug (baseline)", "Maglev (mid-tier)", "TurboFan (optimised)"],
            caption: "Conceptual tiering pipeline. Deoptimisation goes from optimised code back to Ignition when speculation fails.",
          },
          {
            type: "p",
            text: "**Hidden classes (Maps).** Every object points to a Map describing its layout: which properties exist and at which offset. Objects created the same way share a Map, and adding a property creates a *transition* to a new Map. Same shape means V8 can load `obj.x` with a fixed offset instead of a dictionary lookup.",
          },
          {
            type: "p",
            text: "**Inline caches (ICs).** Each property access or call site has a feedback slot remembering the Maps it has seen. One Map → *monomorphic* (fastest); a few (V8 currently uses up to 4) → *polymorphic*; more → *megamorphic*, falling back to a generic, slower lookup. Optimising compilers use this feedback to specialise code.",
          },
          {
            type: "p",
            text: "**Garbage collection.** Most objects die young (the generational hypothesis). New objects are bump-allocated in the young generation, which the **Scavenger** cleans by copying survivors between semi-spaces in parallel. Objects that survive twice are promoted to the old generation, collected by **Mark-Compact** using concurrent and incremental marking, parallel compaction and concurrent sweeping (the Orinoco project).",
          },
          {
            type: "list",
            items: [
              "Write barriers record old→young pointers so the Scavenger needn't scan the whole old space.",
              "Heap limits are configurable in Node: `--max-old-space-size=<MB>`, `--max-semi-space-size=<MB>`.",
              "Large objects live in a separate large-object space and are never moved.",
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: life of a hot function",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Lazy parse", detail: "`function add(a, b) { return a + b }` is pre-parsed at load; fully parsed and compiled to bytecode on first call." },
              { title: "Interpret + feedback", detail: "Ignition runs it; the `+` site's feedback slot records 'small integers' (Smis) on every call." },
              { title: "Baseline", detail: "After some invocations, Sparkplug emits machine code mirroring the bytecode — still generic, but no interpreter dispatch." },
              { title: "Optimise", detail: "When hot enough, Maglev and later TurboFan compile a version that assumes Smi inputs, guarded by cheap type checks and possibly inlined into callers." },
              { title: "Deoptimise", detail: "`add('a', 'b')` fails a guard; V8 reconstructs the interpreter frame and continues in Ignition. Feedback now includes strings; a later re-optimisation handles both." },
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
            caption: "Observe hidden classes with V8 natives syntax: `node --allow-natives-syntax shapes.js` (debug-only intrinsic; never use in production code).",
            code: `function Point(x, y) {
  this.x = x;
  this.y = y;
}
const a = new Point(1, 2);
const b = new Point(3, 4);
const c = new Point(5, 6);
c.z = 7; // transition to a new Map

const d = { x: 1, y: 2 };
const e = { y: 2, x: 1 }; // same keys, different order

console.log(%HaveSameMap(a, b));
console.log(%HaveSameMap(a, c));
console.log(%HaveSameMap(d, e));`,
            output: `true
false
false`,
          },
          {
            type: "code",
            lang: "js",
            caption: "Shape-friendly vs shape-hostile code (the first keeps call sites monomorphic).",
            code: `// Good: every object gets all fields, same order, in the constructor
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.lastLogin = null; // initialise even if unknown
  }
}

// Hostile in hot paths: shapes diverge per object
function makeUser(name, email, admin) {
  const u = {};
  if (admin) u.role = "admin"; // conditional field first
  u.name = name;
  u.email = email;
  return u;
}`,
          },
          {
            type: "code",
            lang: "bash",
            caption: "Useful flags for exploring (output is verbose and version-dependent).",
            code: `node --trace-opt --trace-deopt app.js     # log optimisations and deopts
node --max-old-space-size=4096 app.js     # raise old-generation limit to ~4 GB
node --trace-gc app.js                    # one line per GC (Scavenge / Mark-Compact)`,
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "`delete obj.prop` on a hot object can switch it to slow *dictionary mode*; set to `undefined`/`null` instead if the shape should stay stable.",
              "Arrays have *elements kinds* (packed Smi → packed double → packed generic, and holey variants); transitions are one-way, so a hole or mixed type can permanently slow an array.",
              "Megamorphic sites are common in generic library code (e.g. a function accepting any object); that's fine off the hot path.",
              "Micro-benchmarks can be optimised away entirely if results are unused — always consume results and warm up.",
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
            title: "\"JavaScript is interpreted\"",
            text: "V8 starts in an interpreter but compiles hot code to machine code with several JIT tiers. \"Interpreted vs compiled\" describes implementations, not languages.",
          },
          {
            type: "callout",
            tone: "misconception",
            title: "\"Memory leaks are impossible with a GC\"",
            text: "The GC frees only *unreachable* objects. Anything still referenced — globals, caches without eviction, closures held by listeners, timers never cleared — stays forever.",
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Multi-tier JIT", points: ["Fast startup (interpreter) and fast steady state (TurboFan)", "Adapts to real types seen at runtime", "Costs: compile CPU, memory for feedback and code, deopt cliffs"] },
              { title: "Ahead-of-time compilation (e.g. Go)", points: ["Predictable performance from the first call", "No warm-up or deopts", "Less ability to specialise on runtime behaviour"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "V8 parses JavaScript (lazily for inner functions) into an AST, generates bytecode and runs it in the Ignition interpreter, which records type feedback. Hot functions are tiered up: Sparkplug compiles bytecode to baseline machine code, then Maglev and TurboFan produce optimised code that speculates on the observed types; if a speculation fails, V8 deoptimises back to the interpreter. Objects get hidden classes, which V8 calls Maps, so property access can use fixed offsets, and inline caches remember those Maps at each access site. Memory is managed by a generational GC: a fast Scavenger for young objects and a concurrent Mark-Compact for the old generation. All of this is V8 implementation detail, not the JS spec.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Give a concrete deopt trigger (type change at a `+`, a new object shape at a hot property access) and how you'd detect it (`--trace-deopt`).",
              "Explain why initialising fields in the constructor helps (single Map, monomorphic ICs).",
              "Explain why young-generation GC is cheap (cost ∝ survivors, not garbage) and why long-lived caches push work to Mark-Compact.",
              "Tie to Node ops: heap limits (`--max-old-space-size`), heap snapshots for leaks, GC pauses showing up as event-loop delay.",
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
              "Pipeline: parse → Ignition bytecode (+ feedback) → Sparkplug → Maglev → TurboFan, with deopt back to Ignition.",
              "Hidden classes (Maps) + inline caches make property access fast when shapes are consistent.",
              "GC: Scavenger (young, copying) + Mark-Compact (old, concurrent/incremental) — Orinoco.",
              "All engine-specific; versions change heuristics.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "JIT (just-in-time) compilation", definition: "Compiling code to machine code while the program runs, usually guided by runtime profiling." },
      { term: "Bytecode", definition: "A compact, machine-independent instruction format executed by an interpreter (Ignition in V8)." },
      { term: "Type feedback", definition: "Per-site records of the types/shapes actually observed, stored in feedback vectors and used by optimising compilers." },
      { term: "Hidden class / Map", definition: "V8's internal description of an object's layout; objects with the same Map share property offsets." },
      { term: "Inline cache (IC)", definition: "A per-site cache of previously seen Maps and how to handle them, making repeated property access fast." },
      { term: "Deoptimisation", definition: "Discarding optimised code whose assumptions failed and resuming in the interpreter." },
      { term: "Generational GC", definition: "A collector that splits the heap by object age because most objects die young." },
    ],
    followUps: [
      { q: "Why have both Sparkplug and Maglev?", a: "To smooth the cost curve: Sparkplug compiles almost instantly but doesn't optimise; Maglev produces optimised code much faster than TurboFan, so medium-hot code gets good performance without TurboFan's compile cost." },
      { q: "What makes an inline cache megamorphic?", a: "Seeing more Maps at a single site than the polymorphic limit (currently 4 in V8). V8 then uses a generic stub cache lookup instead of specialised checks." },
      { q: "Why is the Scavenger fast?", a: "It only touches live objects (copying survivors out of the nursery); dead objects cost nothing. Most young objects are dead, so little work is done." },
      { q: "How do you find a memory leak in Node?", a: "Take heap snapshots over time (`--inspect` + DevTools, or `v8.writeHeapSnapshot()`), compare retained sizes, and follow retainer paths to the unexpected reference." },
    ],
    quiz: [
      {
        id: "v8-q1",
        prompt: "Which V8 component produces bytecode and collects type feedback?",
        options: ["TurboFan", "Ignition", "Sparkplug", "Orinoco"],
        answer: 1,
        explanation: "Ignition is the bytecode generator and interpreter; it fills feedback vectors used by higher tiers.",
      },
      {
        id: "v8-q2",
        prompt: "`const p = {x: 1, y: 2}` and `const q = {y: 2, x: 1}` — do they share a hidden class?",
        options: ["Yes, same keys", "No, property insertion order differs", "Only after optimisation", "Only in strict mode"],
        answer: 1,
        explanation: "Maps are built by transitions in insertion order, so different orders produce different Maps.",
      },
      {
        id: "v8-q3",
        prompt: "What usually triggers a deoptimisation?",
        options: ["A GC cycle", "A speculative assumption (e.g. 'always integers') being violated", "Calling a function too many times", "Using `const` instead of `let`"],
        answer: 1,
        explanation: "Optimised code is guarded by checks; when a guard fails, V8 bails out to the interpreter.",
      },
    ],
    questions: ["nodejs/node-08"],
  },
  // ───────────────────────────────────────────────────────────── jit-compilation
  {
    slug: "jit-compilation",
    track: "nodejs",
    title: "JIT compilation: interpreters, baseline and optimising compilers",
    summary:
      "Why dynamic-language engines compile at runtime: profiling, speculative optimisation, on-stack replacement and deoptimisation — and how this compares with ahead-of-time compilation.",
    level: "advanced",
    frequency: "medium",
    minutes: 20,
    kinds: ["theory"],
    status: "outline",
    prerequisites: ["nodejs/v8-internals", "os/cpu-memory-hierarchy"],
    related: ["javascript/performance", "go/escape-analysis"],
    tags: ["jit", "aot", "v8", "deoptimization", "osr"],
    sources: [
      { label: "V8 blog — Sparkplug: a non-optimizing JavaScript compiler", url: "https://v8.dev/blog/sparkplug", kind: "docs" },
      { label: "V8 blog — Maglev: V8's fastest optimizing JIT", url: "https://v8.dev/blog/maglev", kind: "docs" },
      { label: "Benedikt Meurer — An introduction to speculative optimization in V8", url: "https://ponyfoo.com/articles/an-introduction-to-speculative-optimization-in-v8", kind: "external", note: "Article by Benedikt Meurer (V8 team), hosted on Pony Foo." },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Contrast interpretation, AOT compilation and JIT compilation",
              "Explain tiering: why engines don't optimise everything immediately",
              "Explain speculative optimisation, guards, deoptimisation and on-stack replacement (OSR)",
              "Recognise JIT-related performance cliffs and benchmarking pitfalls (warm-up, dead-code elimination)",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "p",
            text: "This lesson is an outline. It will cover:",
          },
          {
            type: "list",
            items: [
              "Source → machine code paths: interpreter, AOT (Go, C), JIT (V8, JVM HotSpot, .NET)",
              "Hotness counters and tier-up in V8 (Ignition → Sparkplug → Maglev → TurboFan) — implementation detail",
              "Speculation on types/shapes, guard checks, deopt and OSR for long-running loops",
              "Benchmark hygiene: warm-up, `--trace-opt`/`--trace-deopt`, consuming results",
            ],
          },
        ],
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── streams-buffers
  {
    slug: "streams-buffers",
    track: "nodejs",
    title: "Buffers, streams and backpressure",
    summary:
      "Buffers hold raw bytes; streams move data in chunks so memory stays bounded. Backpressure — `write()` returning false and waiting for `'drain'` — stops a fast producer from flooding a slow consumer. `pipeline()` wires it all up safely.",
    level: "intermediate",
    frequency: "high",
    minutes: 30,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["nodejs/node-event-loop", "javascript/async-iteration"],
    related: ["system-design/backpressure", "go/backpressure-bounded-concurrency", "nodejs/node-architecture"],
    tags: ["node", "streams", "buffer", "backpressure", "highWaterMark", "pipeline"],
    sources: [
      { label: "Node.js docs — Stream", url: "https://nodejs.org/api/stream.html", kind: "docs" },
      { label: "Node.js docs — Buffer", url: "https://nodejs.org/api/buffer.html", kind: "docs" },
      { label: "Node.js docs — Backpressuring in Streams", url: "https://nodejs.org/en/learn/modules/backpressuring-in-streams", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain what a Buffer is and why byte length ≠ string length",
              "Name the four stream types and their roles",
              "Explain `highWaterMark`, `write()` returning false and the `'drain'` event",
              "Use `pipeline()` (or async iteration) instead of hand-wired `.pipe()` chains",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Reading a 10 GB log with `readFile` is like filling a bathtub before drinking from it. A stream is drinking from the tap: you take a cupful (a chunk), deal with it, take another. Backpressure is your hand on the tap — if you can't swallow fast enough, you close it a bit.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Type", "Role", "Examples"],
            rows: [
              ["Readable", "Source of chunks", "`fs.createReadStream`, `http.IncomingMessage`, `process.stdin`"],
              ["Writable", "Sink for chunks", "`fs.createWriteStream`, `http.ServerResponse`, `process.stdout`"],
              ["Duplex", "Independent readable + writable sides", "`net.Socket`"],
              ["Transform", "Duplex whose output is computed from its input", "`zlib.createGzip()`, `crypto.createHash` (stream mode)"],
            ],
          },
          {
            type: "list",
            items: [
              "**Buffer** — Node's subclass of `Uint8Array` for raw bytes; its memory is typically allocated outside the V8 JS heap.",
              "**highWaterMark** — the internal buffer threshold (bytes, or objects in object mode) at which a stream signals \"stop\".",
              "**Backpressure** — the signal from consumer to producer to slow down: `write()` returns `false`; resume on `'drain'`.",
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Defaults change between versions",
            text: "The default `highWaterMark` for byte streams was 16 KiB and was raised to 64 KiB in Node 22; object-mode streams default to 16 objects; `fs.createReadStream` uses 64 KiB. Check the docs for your Node version rather than hard-coding assumptions.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "Without streams, memory grows with input size and nothing is sent until everything is read (bad time-to-first-byte). Without backpressure, a fast reader paired with a slow writer (disk, slow client) buffers unboundedly in memory until the process crashes.",
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Producer writes", detail: "`writable.write(chunk)` appends to the writable's internal buffer and starts the underlying I/O if idle." },
              { title: "Threshold check", detail: "If buffered length ≥ `highWaterMark`, `write()` returns `false`. The data is still accepted — it's a request to stop, not a rejection." },
              { title: "Producer pauses", detail: "A well-behaved producer stops writing (or `pipe`/`pipeline` pauses the readable)." },
              { title: "Drain", detail: "As the OS accepts data, the buffer empties; when it is empty, `'drain'` fires and the producer resumes." },
            ],
          },
          {
            type: "p",
            text: "Readables have a mirror mechanism: they fill their buffer up to `highWaterMark` by calling `_read()`, and stop reading from the source when the consumer isn't pulling. `pipe()` and `pipeline()` connect the two signals automatically.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: manual backpressure",
        blocks: [
          {
            type: "code",
            lang: "js",
            caption: "Write a million lines without buffering them all in memory.",
            code: `const fs = require("node:fs");

const out = fs.createWriteStream("big.txt");
let i = 0;
const N = 1_000_000;

function writeSome() {
  let ok = true;
  while (i < N && ok) {
    ok = out.write(\`line \${i++}\\n\`); // false => buffer is above highWaterMark
  }
  if (i < N) out.once("drain", writeSome); // resume when flushed
  else out.end(() => console.log("done"));
}
writeSome();`,
            output: "done",
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "js",
            caption: "Preferred: `pipeline` handles backpressure, errors and cleanup for every stage.",
            code: `const fs = require("node:fs");
const zlib = require("node:zlib");
const { pipeline } = require("node:stream/promises");

async function gzip(src) {
  await pipeline(
    fs.createReadStream(src),
    zlib.createGzip(),
    fs.createWriteStream(src + ".gz"),
  );
  console.log("compressed", src);
}
gzip("access.log").catch(console.error);`,
            output: "compressed access.log",
          },
          {
            type: "code",
            lang: "js",
            runnable: true,
            caption: "Bytes vs characters (same idea as Buffer.byteLength, using the web TextEncoder).",
            code: `const s = "héllo";
const bytes = new TextEncoder().encode(s);
console.log(s.length, bytes.length);
console.log(Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(" "));`,
            output: `5 6
68 c3 a9 6c 6c 6f`,
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "**Ignoring `write()`'s return value** — works in tests, explodes memory in production with slow clients.",
              "**`a.pipe(b).pipe(c)` without error handling** — `.pipe()` doesn't forward errors or destroy other streams; a failure can leak file descriptors. Use `pipeline()`.",
              "**Concatenating chunks as strings** — a multi-byte UTF-8 character may be split across chunks; use `setEncoding('utf8')` or `StringDecoder`.",
              "**`Buffer.allocUnsafe` without filling** — may expose old memory contents; use `Buffer.alloc` unless you overwrite every byte.",
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
              { title: "Read whole file (readFile)", points: ["Simplest code", "Memory ∝ file size", "Fine for small configs"] },
              { title: "Streams", points: ["Constant memory, early first byte", "Composable (gzip, hash, parse)", "More complex error handling — use pipeline"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Streams process data in chunks instead of loading it all, so memory stays bounded. There are readable, writable, duplex and transform streams. Each has an internal buffer limited by `highWaterMark`; when a writable's buffer passes it, `write()` returns false, and the producer should stop until `'drain'` fires — that's backpressure. `pipe` and especially `stream.pipeline` handle backpressure automatically, and `pipeline` also propagates errors and destroys all streams on failure.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Explain that `write()` returning false doesn't drop data; ignoring it just grows memory.",
              "Compare streams to async iterators (`for await (const chunk of readable)`), which pull and so get backpressure naturally.",
              "Relate to HTTP: a slow client's TCP window fills, the socket's writable buffer fills, `res.write()` returns false.",
              "Mention Web Streams (`ReadableStream`) available in Node for cross-runtime code.",
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
              "Buffers are raw bytes (Uint8Array subclass); bytes ≠ characters.",
              "Four stream types; each buffers up to `highWaterMark`.",
              "Backpressure: respect `write()` → false, resume on `'drain'`.",
              "Use `pipeline()` for correctness.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Chunk", definition: "One piece of data passed through a stream (a Buffer, string, or object in object mode)." },
      { term: "highWaterMark", definition: "Buffer threshold above which a stream asks its producer to pause." },
      { term: "Backpressure", definition: "Flow control in which a slow consumer signals a fast producer to slow down." },
      { term: "'drain' event", definition: "Emitted by a writable when its buffer has emptied after `write()` returned false." },
      { term: "pipeline()", definition: "Helper that connects streams with backpressure, forwards errors and destroys all stages on failure." },
    ],
    followUps: [
      { q: "What happens if you ignore `write()` returning false?", a: "Data keeps being buffered in memory inside the writable; with a slow consumer memory grows until GC pressure or an out-of-memory crash." },
      { q: "Why prefer `pipeline` over `pipe`?", a: "`pipe` doesn't propagate errors or clean up the other streams, risking leaked descriptors and hung requests. `pipeline` does both and supports a promise API." },
      { q: "Where does Buffer memory live?", a: "Typically outside the V8 JS heap (external memory tracked by V8), which is why `process.memoryUsage()` reports `external` and `arrayBuffers` separately from `heapUsed`." },
    ],
    quiz: [
      {
        id: "streams-q1",
        prompt: "`writable.write(chunk)` returns `false`. What happened to `chunk`?",
        options: ["It was dropped", "It was buffered; you should wait for 'drain' before writing more", "An error is thrown next tick", "It will be written only after end()"],
        answer: 1,
        explanation: "The chunk is accepted and buffered; `false` is an advisory signal to pause.",
      },
      {
        id: "streams-q2",
        prompt: "Which stream type is a gzip compressor?",
        options: ["Readable", "Writable", "Transform", "None — it's a Buffer"],
        answer: 2,
        explanation: "A Transform is a duplex stream whose output is derived from its input.",
      },
    ],
    questions: ["nodejs/node-05"],
  },
  // ───────────────────────────────────────────────────────────── worker-threads
  {
    slug: "worker-threads",
    track: "nodejs",
    title: "worker_threads vs cluster vs child_process",
    summary:
      "Three ways to use more than one core: worker threads (in-process, separate V8 isolates, can share memory), cluster (multiple Node processes sharing a server port) and child processes (run any program). Pick by isolation, sharing and what you're scaling.",
    level: "intermediate",
    frequency: "high",
    minutes: 25,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["nodejs/node-architecture", "os/processes-threads"],
    related: ["nodejs/pm2-process-management", "system-design/multithreading-parallelism", "go/concurrency-vs-parallelism"],
    tags: ["node", "worker_threads", "cluster", "child_process", "parallelism"],
    sources: [
      { label: "Node.js docs — Worker threads", url: "https://nodejs.org/api/worker_threads.html", kind: "docs" },
      { label: "Node.js docs — Cluster", url: "https://nodejs.org/api/cluster.html", kind: "docs" },
      { label: "Node.js docs — Child process", url: "https://nodejs.org/api/child_process.html", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain what each mechanism creates (thread + isolate vs process)",
              "Choose the right one for CPU-bound tasks, scaling an HTTP server, or running external programs",
              "Know how data moves: structured clone, transferables, SharedArrayBuffer, IPC",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A worker thread is a second cook in the *same* kitchen: cheap to talk to, can share a fridge (SharedArrayBuffer), but if the building burns, both go. A cluster worker or child process is a *separate restaurant*: fully isolated, communicates by phone (IPC), heavier to open.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["", "worker_threads", "cluster", "child_process"],
            rows: [
              ["Creates", "OS thread with its own V8 isolate + event loop, same process", "N Node processes (forked from the primary)", "Any OS process (`spawn`, `exec`, `execFile`, `fork`)"],
              ["Memory", "Separate JS heaps; can share `SharedArrayBuffer`, transfer `ArrayBuffer`s", "Fully separate", "Fully separate"],
              ["Communication", "`postMessage` (structured clone), `MessageChannel`, `Atomics`", "IPC messages; workers share listening sockets", "stdio streams; IPC channel with `fork`"],
              ["Crash blast radius", "Uncaught error ends that worker; process-level failures (e.g. OOM) affect all", "One process", "One process"],
              ["Best for", "CPU-heavy JS (parsing, image/crypto in JS, compression)", "Using all cores for a network server", "Running other programs/scripts, sandboxing"],
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "A single event loop uses one core for JavaScript. CPU-heavy work on it blocks every request, and a single process can't use a 16-core box. These three APIs are Node's answers, with different isolation and cost.",
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "list",
            items: [
              "**Workers** start a new isolate and loop on a new thread; startup takes milliseconds and memory per worker is in the MBs, so use a **pool** rather than one worker per task.",
              "**Messages** are copied with the structured clone algorithm; pass `transferList` to move an `ArrayBuffer` without copying (the sender loses access).",
              "**cluster**: the primary forks workers with `child_process.fork`. By default on non-Windows platforms the primary accepts connections and hands them out round-robin; workers don't share in-memory state.",
              "**child_process**: `spawn` streams stdio; `exec` runs via a shell and buffers output (up to `maxBuffer`); `execFile` avoids the shell; `fork` starts a Node script with an IPC channel.",
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Platform-specific scheduling",
            text: "cluster's default scheduling policy is round-robin on all platforms except Windows, where the OS distributes connections. It can be changed with `cluster.schedulingPolicy` or `NODE_CLUSTER_SCHED_POLICY`.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: offload a CPU task",
        blocks: [
          {
            type: "code",
            lang: "js",
            caption: "One file acting as both main thread and worker (CommonJS).",
            code: `const { Worker, isMainThread, parentPort, workerData } = require("node:worker_threads");

if (isMainThread) {
  const worker = new Worker(__filename, { workerData: 40 });
  worker.on("message", (result) => console.log("fib(40) =", result));
  worker.on("error", console.error);
  console.log("main thread is still free");
} else {
  const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));
  parentPort.postMessage(fib(workerData));
}`,
            output: `main thread is still free
fib(40) = 102334155`,
          },
          {
            type: "steps",
            steps: [
              { title: "new Worker", detail: "Spawns a thread, creates an isolate and loop, and evaluates the same file with `isMainThread === false`." },
              { title: "Main continues", detail: "The main thread logs immediately; its loop stays responsive." },
              { title: "Worker computes", detail: "The recursive fib runs on another core." },
              { title: "postMessage", detail: "The number is structured-cloned to the main thread, where the `'message'` handler runs as a normal loop callback." },
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
            caption: "Minimal cluster: one HTTP worker per core sharing port 3000.",
            code: `const cluster = require("node:cluster");
const http = require("node:http");
const os = require("node:os");

if (cluster.isPrimary) {
  for (let i = 0; i < os.availableParallelism(); i++) cluster.fork();
  cluster.on("exit", (w) => { console.log(\`worker \${w.process.pid} died, restarting\`); cluster.fork(); });
} else {
  http.createServer((req, res) => res.end(\`handled by \${process.pid}\\n\`)).listen(3000);
}`,
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Using worker threads for I/O-bound work — the main loop already handles I/O concurrently; you just add overhead.",
              "Creating a worker per request instead of a pool (e.g. Piscina or a hand-rolled pool).",
              "Storing sessions or rate-limit counters in memory under cluster/PM2 — each process has its own copy; use Redis or sticky sessions.",
              "Passing user input to `exec` — shell injection; prefer `execFile`/`spawn` with an argument array.",
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
              { title: "worker_threads", points: ["Low-latency messaging, optional shared memory", "Less isolation", "Ideal for CPU tasks"] },
              { title: "cluster / PM2", points: ["Simple multi-core HTTP scaling", "No shared memory, process overhead", "In containers, many teams run 1 process per container and scale replicas instead"] },
              { title: "child_process", points: ["Run anything (ffmpeg, Python, git)", "Full isolation", "Serialization and process start cost"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "`worker_threads` run JavaScript on extra threads inside the same process; each worker has its own V8 isolate and event loop, they communicate with `postMessage` and can share memory through `SharedArrayBuffer`. That's for CPU-bound work. `cluster` forks multiple Node processes that share a listening port, so a server can use every core; they share nothing in memory. `child_process` runs arbitrary programs — `spawn` for streaming, `exec` for small shell commands, `fork` for Node scripts with IPC. Rule of thumb: CPU task → worker pool; scale a server → cluster, PM2 or more containers; external program → child_process.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Discuss copy vs transfer vs share (structured clone, transferList, SharedArrayBuffer + Atomics).",
              "Explain why I/O-bound work doesn't benefit from workers (the loop already overlaps waits).",
              "Talk about state externalisation and sticky sessions (e.g. WebSockets) with cluster.",
              "Containers/Kubernetes: one process per container and horizontal scaling often replace cluster.",
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
              "Workers: threads + isolates, for CPU-bound JS; pool them.",
              "Cluster: processes sharing a port, for multi-core servers.",
              "child_process: run other programs; avoid shell injection.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Isolate", definition: "An independent V8 instance with its own heap; workers each get one." },
      { term: "Structured clone", definition: "The algorithm used to copy values between threads/windows (supports Maps, Dates, typed arrays; not functions)." },
      { term: "SharedArrayBuffer", definition: "Memory that multiple threads can access simultaneously; coordinated with `Atomics`." },
      { term: "IPC", definition: "Inter-process communication, e.g. the message channel between a primary and its forked children." },
    ],
    followUps: [
      { q: "Can worker threads share objects?", a: "Not ordinary JS objects — each isolate has its own heap. They can share raw memory via SharedArrayBuffer, or transfer ArrayBuffers/MessagePorts." },
      { q: "Why might cluster be unnecessary on Kubernetes?", a: "The orchestrator already runs many replicas and load-balances between them; one process per container simplifies health checks, resource limits and restarts." },
      { q: "When would you use child_process over a worker?", a: "When the work is a non-JS program (ffmpeg, ImageMagick, Python), or you need full process isolation from crashes and memory limits." },
    ],
    quiz: [
      {
        id: "wt-q1",
        prompt: "You need to resize images in a Node API without hurting latency. Best first choice?",
        options: ["More async/await", "A worker-thread pool (or a native library that uses the thread pool)", "process.nextTick chunks", "cluster with 1 worker"],
        answer: 1,
        explanation: "Image resizing is CPU-bound; it must leave the main thread.",
      },
      {
        id: "wt-q2",
        prompt: "Under cluster, an in-memory rate limiter will…",
        options: ["Work exactly as before", "Count per process, so the effective limit is multiplied by the number of workers", "Crash the primary", "Be shared automatically via IPC"],
        answer: 1,
        explanation: "Processes share no memory; each worker keeps its own counters.",
      },
    ],
    questions: ["nodejs/node-06"],
  },
  // ───────────────────────────────────────────────────────────── module-systems
  {
    slug: "module-systems",
    track: "nodejs",
    title: "CommonJS vs ES modules: loading and resolution in Node",
    summary:
      "CommonJS (`require`) loads synchronously and returns a copied `module.exports` value; ES modules (`import`) are parsed, linked and evaluated asynchronously with live bindings. Node decides which system a file uses from its extension and the nearest package.json `type`, and resolves packages via `exports`.",
    level: "intermediate",
    frequency: "high",
    minutes: 20,
    kinds: ["theory"],
    status: "outline",
    prerequisites: ["javascript/modules"],
    related: ["nodejs/node-event-loop", "production/pnpm-internals"],
    tags: ["node", "commonjs", "esm", "module-resolution", "package-exports"],
    sources: [
      { label: "Node.js docs — Modules: CommonJS modules", url: "https://nodejs.org/api/modules.html", kind: "docs" },
      { label: "Node.js docs — Modules: ECMAScript modules", url: "https://nodejs.org/api/esm.html", kind: "docs" },
      { label: "Node.js docs — Modules: Packages (exports, type)", url: "https://nodejs.org/api/packages.html", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain how Node decides whether a file is CJS or ESM (`.cjs`/`.mjs`, package.json `\"type\"`)",
              "Walk through `require()` resolution: core modules, relative paths, `node_modules` lookup up the directory tree, the module cache",
              "Contrast CJS value copies with ESM live bindings, and sync vs async loading (top-level await)",
              "Use package.json `exports`/conditional exports for dual packages; know interop rules (`import` of CJS, `require` of ESM)",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          { type: "p", text: "This lesson is an outline. It will cover:" },
          {
            type: "list",
            items: [
              "CJS wrapper function (`exports, require, module, __filename, __dirname`) and `require.cache`",
              "ESM phases: construction (parse + fetch), instantiation (linking), evaluation; why imports are hoisted and static",
              "Resolution: file extensions are mandatory in ESM; `exports` encapsulation; `imports` (`#internal`) maps",
              "Interop: default-import of CJS, the dual-package hazard, and `require(esm)` support added in recent Node versions (version-dependent)",
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "Loading synchronous ESM graphs with `require()` landed behind a flag in Node 22 and was later enabled by default in newer release lines; check your Node version's docs before relying on it.",
          },
        ],
      },
    ],
    questions: ["nodejs/node-07"],
  },
  // ───────────────────────────────────────────────────────────── pm2-process-management
  {
    slug: "pm2-process-management",
    track: "nodejs",
    title: "PM2 and process management",
    summary:
      "PM2 keeps Node processes alive, runs them in cluster mode across cores, reloads them without downtime and collects logs — and when a container orchestrator should do those jobs instead.",
    level: "beginner",
    frequency: "medium",
    minutes: 15,
    kinds: ["theory"],
    status: "outline",
    prerequisites: ["nodejs/worker-threads"],
    related: ["go/graceful-shutdown", "cloud/docker", "cloud/kubernetes"],
    tags: ["node", "pm2", "process-manager", "zero-downtime"],
    sources: [
      { label: "PM2 documentation — Quick start", url: "https://pm2.keymetrics.io/docs/usage/quick-start/", kind: "docs" },
      { label: "PM2 documentation — Cluster mode", url: "https://pm2.keymetrics.io/docs/usage/cluster-mode/", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Start, list, restart and monitor apps with `pm2 start/ls/restart/monit/logs`",
              "Use an `ecosystem.config.js` with `instances: \"max\"` and `exec_mode: \"cluster\"`",
              "Explain `pm2 reload` (rolling, zero-downtime) vs `restart`, and graceful shutdown with SIGINT + `kill_timeout`",
              "Decide between PM2 on a VM and one-process-per-container on Docker/Kubernetes",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          { type: "p", text: "This lesson is an outline. It will cover:" },
          {
            type: "list",
            items: [
              "What a process manager does: supervision, restarts with backoff, log handling, startup scripts",
              "PM2 cluster mode built on Node's `cluster` module",
              "Zero-downtime reloads and the app's responsibility to drain connections",
              "Why containers usually run `node` directly (or `pm2-runtime`) and let the orchestrator supervise",
            ],
          },
        ],
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── express-vs-feathers
  {
    slug: "express-vs-feathers",
    track: "nodejs",
    title: "Express vs Feathers.js",
    summary:
      "Express is a minimal routing + middleware layer over Node's `http`; Feathers is a higher-level framework built around services and hooks that exposes the same service over REST and real-time transports. Compare abstraction level, structure and when each fits.",
    level: "beginner",
    frequency: "low",
    minutes: 15,
    kinds: ["theory"],
    status: "outline",
    prerequisites: ["nodejs/node-architecture", "javascript/fetch-http"],
    related: ["backend/rest-graphql-grpc-trpc", "go/gin", "system-design/rest-api-design"],
    tags: ["node", "express", "feathers", "middleware", "frameworks"],
    sources: [
      { label: "Express — Guide: Using middleware", url: "https://expressjs.com/en/guide/using-middleware.html", kind: "docs" },
      { label: "Feathers — Guides", url: "https://feathersjs.com/guides/", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain Express's middleware chain (`req, res, next`), routers and error-handling middleware",
              "Explain Feathers services (find/get/create/update/patch/remove) and hooks (before/after/error)",
              "Compare how each handles real-time (Socket.IO in Feathers) and validation/auth",
              "Choose between a minimal library and an opinionated framework for a given team and project",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          { type: "p", text: "This lesson is an outline. It will cover:" },
          {
            type: "list",
            items: [
              "Express request lifecycle and common middleware ordering bugs",
              "Feathers service + hooks architecture and transport independence (REST, websockets)",
              "Trade-offs: flexibility vs conventions, ecosystem size, learning curve",
              "Where alternatives fit (Fastify, NestJS, Hono) at a high level",
            ],
          },
        ],
      },
    ],
  },
];
