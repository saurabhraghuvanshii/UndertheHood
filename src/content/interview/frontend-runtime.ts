import type { InterviewQuestion, SourceRef } from "../types";

/**
 * Frontend & runtime interview bank: Node.js, React, TypeScript, networks.
 */

const NODE_LOOP: SourceRef = { label: "Node.js — The Node.js Event Loop", url: "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick", kind: "docs" };
const LIBUV: SourceRef = { label: "libuv — Design overview", url: "https://docs.libuv.org/en/v1.x/design.html", kind: "docs" };
const LIBUV_POOL: SourceRef = { label: "libuv — Thread pool work scheduling", url: "https://docs.libuv.org/en/v1.x/threadpool.html", kind: "docs" };
const NODE_DONT_BLOCK: SourceRef = { label: "Node.js — Don't Block the Event Loop (or the Worker Pool)", url: "https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop", kind: "docs" };
const NODE_STREAM: SourceRef = { label: "Node.js API — Stream", url: "https://nodejs.org/api/stream.html", kind: "docs" };
const NODE_BACKPRESSURE: SourceRef = { label: "Node.js — Backpressuring in Streams", url: "https://nodejs.org/en/learn/modules/backpressuring-in-streams", kind: "docs" };
const NODE_WORKERS: SourceRef = { label: "Node.js API — Worker threads", url: "https://nodejs.org/api/worker_threads.html", kind: "docs" };
const NODE_CLUSTER: SourceRef = { label: "Node.js API — Cluster", url: "https://nodejs.org/api/cluster.html", kind: "docs" };
const NODE_CHILD: SourceRef = { label: "Node.js API — Child process", url: "https://nodejs.org/api/child_process.html", kind: "docs" };
const NODE_ESM: SourceRef = { label: "Node.js API — ECMAScript modules", url: "https://nodejs.org/api/esm.html", kind: "docs" };
const NODE_CJS: SourceRef = { label: "Node.js API — CommonJS modules", url: "https://nodejs.org/api/modules.html", kind: "docs" };
const V8_IGNITION: SourceRef = { label: "V8 blog — Firing up the Ignition interpreter", url: "https://v8.dev/blog/ignition-interpreter", kind: "external" };
const V8_SPARKPLUG: SourceRef = { label: "V8 blog — Sparkplug, a non-optimizing JavaScript compiler", url: "https://v8.dev/blog/sparkplug", kind: "external" };
const V8_MAGLEV: SourceRef = { label: "V8 blog — Maglev, V8's fastest optimizing JIT", url: "https://v8.dev/blog/maglev", kind: "external" };
const V8_FAST_PROPS: SourceRef = { label: "V8 blog — Fast properties in V8", url: "https://v8.dev/blog/fast-properties", kind: "external" };

const REACT_RENDER: SourceRef = { label: "react.dev — Render and Commit", url: "https://react.dev/learn/render-and-commit", kind: "docs" };
const REACT_PRESERVE: SourceRef = { label: "react.dev — Preserving and Resetting State", url: "https://react.dev/learn/preserving-and-resetting-state", kind: "docs" };
const REACT_LISTS: SourceRef = { label: "react.dev — Rendering Lists (keys)", url: "https://react.dev/learn/rendering-lists", kind: "docs" };
const REACT_RULES: SourceRef = { label: "react.dev — Rules of Hooks", url: "https://react.dev/reference/rules/rules-of-hooks", kind: "docs" };
const REACT_EFFECTS: SourceRef = { label: "react.dev — Synchronizing with Effects", url: "https://react.dev/learn/synchronizing-with-effects", kind: "docs" };
const REACT_NO_EFFECT: SourceRef = { label: "react.dev — You Might Not Need an Effect", url: "https://react.dev/learn/you-might-not-need-an-effect", kind: "docs" };
const REACT_MEMO: SourceRef = { label: "react.dev — useMemo", url: "https://react.dev/reference/react/useMemo", kind: "docs" };
const REACT_MEMO_COMP: SourceRef = { label: "react.dev — memo", url: "https://react.dev/reference/react/memo", kind: "docs" };
const REACT_COMPILER: SourceRef = { label: "react.dev — React Compiler", url: "https://react.dev/learn/react-compiler", kind: "docs" };
const REACT_QUEUE: SourceRef = { label: "react.dev — Queueing a Series of State Updates", url: "https://react.dev/learn/queueing-a-series-of-state-updates", kind: "docs" };
const REACT_18: SourceRef = { label: "react.dev blog — React v18.0 (automatic batching)", url: "https://react.dev/blog/2022/03/29/react-v18", kind: "docs" };
const REACT_RSC: SourceRef = { label: "react.dev — Server Components", url: "https://react.dev/reference/rsc/server-components", kind: "docs" };
const REACT_USE_CLIENT: SourceRef = { label: "react.dev — 'use client' directive", url: "https://react.dev/reference/rsc/use-client", kind: "docs" };
const FIBER: SourceRef = { label: "acdlite — React Fiber Architecture", url: "https://github.com/acdlite/react-fiber-architecture", kind: "external" };

const TS_OBJECTS: SourceRef = { label: "TypeScript Handbook — Everyday Types (type aliases vs interfaces)", url: "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html", kind: "docs" };
const TS_GENERICS: SourceRef = { label: "TypeScript Handbook — Generics", url: "https://www.typescriptlang.org/docs/handbook/2/generics.html", kind: "docs" };
const TS_ENUMS: SourceRef = { label: "TypeScript Handbook — Enums", url: "https://www.typescriptlang.org/docs/handbook/enums.html", kind: "docs" };
const TS_NARROWING: SourceRef = { label: "TypeScript Handbook — Narrowing", url: "https://www.typescriptlang.org/docs/handbook/2/narrowing.html", kind: "docs" };
const TS_COMPAT: SourceRef = { label: "TypeScript Handbook — Type Compatibility", url: "https://www.typescriptlang.org/docs/handbook/type-compatibility.html", kind: "docs" };
const TS_ERASABLE: SourceRef = { label: "TSConfig reference — erasableSyntaxOnly", url: "https://www.typescriptlang.org/tsconfig/#erasableSyntaxOnly", kind: "docs" };

const RFC9110: SourceRef = { label: "RFC 9110 — HTTP Semantics", url: "https://www.rfc-editor.org/rfc/rfc9110", kind: "docs" };
const RFC9113: SourceRef = { label: "RFC 9113 — HTTP/2", url: "https://www.rfc-editor.org/rfc/rfc9113", kind: "docs" };
const RFC9114: SourceRef = { label: "RFC 9114 — HTTP/3", url: "https://www.rfc-editor.org/rfc/rfc9114", kind: "docs" };
const RFC9000: SourceRef = { label: "RFC 9000 — QUIC", url: "https://www.rfc-editor.org/rfc/rfc9000", kind: "docs" };
const RFC8446: SourceRef = { label: "RFC 8446 — TLS 1.3", url: "https://www.rfc-editor.org/rfc/rfc8446", kind: "docs" };
const RFC9293: SourceRef = { label: "RFC 9293 — Transmission Control Protocol", url: "https://www.rfc-editor.org/rfc/rfc9293", kind: "docs" };
const RFC768: SourceRef = { label: "RFC 768 — User Datagram Protocol", url: "https://www.rfc-editor.org/rfc/rfc768", kind: "docs" };
const MDN_CORS: SourceRef = { label: "MDN — Cross-Origin Resource Sharing (CORS)", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS", kind: "docs" };
const MDN_HTTP_EVOLUTION: SourceRef = { label: "MDN — Evolution of HTTP", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Evolution_of_HTTP", kind: "docs" };
const MDN_NAV: SourceRef = { label: "MDN — How browsers work (navigation)", url: "https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work", kind: "docs" };
const FETCH_SPEC: SourceRef = { label: "WHATWG Fetch Standard — CORS protocol", url: "https://fetch.spec.whatwg.org/#http-cors-protocol", kind: "docs" };

export const questions: InterviewQuestion[] = [
  // ───────────────────────────── Node.js ─────────────────────────────
  {
    id: "node-01",
    track: "nodejs",
    number: 1,
    question: "How can Node.js be single-threaded yet handle thousands of concurrent connections?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["node", "libuv", "event-loop", "non-blocking-io", "architecture"],
    shortAnswer:
      "Only *your JavaScript* runs on one thread. Node is V8 (which executes JS) plus libuv (an event loop and I/O library) plus C++ bindings. When you open a socket or read a file, Node hands that work to libuv and your code returns immediately; the JS thread is free to run other callbacks.\n\nFor network sockets libuv uses the OS's readiness APIs — epoll on Linux, kqueue on macOS, IOCP on Windows — so one thread can watch thousands of sockets without blocking. Work the OS can't do asynchronously (file system calls, `dns.lookup`, some crypto, zlib) goes to a small libuv thread pool, 4 threads by default. When results are ready, callbacks are queued and the event loop runs them one at a time on the main thread. So concurrency comes from *waiting* in parallel, not computing in parallel — which is why CPU-heavy JS still blocks everyone.",
    deep: [
      { type: "p", text: "The key distinction is between **concurrency** (many operations in flight) and **parallelism** (many computations at the same instant). A Node server spends most of its time waiting on network and disk. Waiting does not need a thread per connection if the OS can tell you *which* sockets are ready." },
      {
        type: "table",
        head: ["Layer", "What it does", "Thread"],
        rows: [
          ["V8", "Parses, compiles and runs your JavaScript; owns the heap and GC", "Main thread (plus GC/compiler helper threads)"],
          ["Node bindings (C++)", "Expose `fs`, `net`, `crypto`… to JS and translate to libuv calls", "Main thread"],
          ["libuv event loop", "Polls the OS for ready I/O, runs timers, dispatches callbacks", "Main thread"],
          ["libuv thread pool", "Runs blocking work: most `fs` ops, `dns.lookup`, `crypto.pbkdf2/scrypt/randomBytes` (async), `zlib`", "4 worker threads by default"],
          ["Kernel async I/O", "TCP/UDP sockets, pipes — readiness notifications via epoll/kqueue/IOCP", "No extra user thread"],
        ],
      },
      { type: "flow", nodes: ["JS calls socket.write / fs.readFile", "Node binding", "libuv: OS poller or thread pool", "Completion queued", "Event loop runs your callback"], caption: "Conceptual flow of an async operation." },
      { type: "callout", tone: "spec-vs-impl", title: "Implementation detail", text: "Which operations use the thread pool is a libuv/Node implementation choice, not part of any JavaScript spec. It has changed over time (e.g. libuv added io_uring support for some file operations on Linux, then Node disabled it by default for security reasons). Treat the list as \"current Node behaviour\", not a law." },
      { type: "compare", items: [
        { title: "Thread-per-connection (classic)", points: ["Simple blocking code", "Memory per thread stack (often ~1 MB reserved)", "Context-switch overhead with 10k+ connections"] },
        { title: "Event loop (Node)", points: ["One JS thread, cheap per-connection state", "Excellent for I/O-bound work", "Any long synchronous computation stalls *all* requests"] },
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      caption: "Node-only. A CPU-bound loop blocks every request; I/O does not. Output order shown is what you'd observe when hitting /fast while /slow is running.",
      code: `const http = require("node:http");

http.createServer((req, res) => {
  if (req.url === "/slow") {
    const end = Date.now() + 5000;
    while (Date.now() < end) {} // blocks the only JS thread for 5 s
    return res.end("slow done\\n");
  }
  res.end("fast\\n");
}).listen(3000);

// curl localhost:3000/slow &  curl localhost:3000/fast
// -> /fast only answers after /slow finishes.`,
      output: "slow done\nfast",
    },
    walkthrough: [
      { title: "Request arrives", detail: "The kernel accepts the TCP connection; libuv's poll phase learns the listening socket is readable and Node emits `request` on the main thread." },
      { title: "Handler starts async I/O", detail: "e.g. a DB query over a socket: the write is handed to the kernel and the handler returns. The JS stack is now empty." },
      { title: "Loop keeps polling", detail: "While the DB is thinking, the loop handles other connections' callbacks." },
      { title: "Response ready", detail: "epoll/kqueue reports the DB socket readable; the loop runs your callback / resolves your promise; you write the HTTP response." },
      { title: "The trap", detail: "If any callback does 5 s of CPU work, no other callback can run during those 5 s — the event loop is blocked." },
    ],
    followUps: [
      { q: "So is Node really single-threaded?", a: "The JavaScript execution is single-threaded per isolate. The process has more threads: the libuv thread pool, V8's background GC and compiler threads, and any `worker_threads` you create." },
      { q: "How do you handle CPU-heavy work?", a: "Move it off the main thread: `worker_threads` for in-process parallel JS, a child process or separate service, or split it into chunks yielded with `setImmediate`. Scale across cores with `cluster` or multiple processes behind a load balancer." },
      { q: "Does more thread-pool threads make HTTP faster?", a: "No. Network sockets don't use the thread pool. Raising `UV_THREADPOOL_SIZE` only helps if you're saturating it with fs/crypto/zlib/`dns.lookup` work." },
    ],
    pitfalls: [
      "Saying \"Node is multi-threaded so CPU work is fine\" — your JS callbacks still run one at a time.",
      "Claiming all async I/O uses the thread pool — sockets use OS readiness APIs instead.",
      "Using synchronous APIs (`fs.readFileSync`, `crypto.pbkdf2Sync`) inside request handlers.",
      "Large `JSON.parse`/`JSON.stringify` or regexes with catastrophic backtracking on the request path.",
    ],
    glossary: [
      { term: "libuv", definition: "C library providing Node's event loop, thread pool and cross-platform async I/O." },
      { term: "epoll / kqueue / IOCP", definition: "OS mechanisms (Linux / BSD-macOS / Windows) for waiting on many I/O handles at once." },
      { term: "Thread pool", definition: "A fixed set of libuv worker threads that run blocking operations off the main thread." },
      { term: "I/O-bound", definition: "Work whose time is dominated by waiting for network or disk, not CPU." },
    ],
    relatedLessons: ["nodejs/node-architecture", "nodejs/node-event-loop", "os/io-models", "os/processes-threads", "javascript/event-loop"],
    relatedQuestions: ["node-02", "node-04", "node-06"],
    sources: [LIBUV, NODE_DONT_BLOCK, NODE_LOOP],
  },
  {
    id: "node-02",
    track: "nodejs",
    number: 2,
    question: "Explain the phases of the Node.js event loop.",
    level: "intermediate",
    frequency: "very-high",
    tags: ["node", "event-loop", "libuv", "timers", "setImmediate"],
    shortAnswer:
      "Each turn of the loop goes through phases, each with its own FIFO queue: **timers** runs expired `setTimeout`/`setInterval` callbacks; **pending callbacks** runs some deferred system-level callbacks like certain TCP errors; **idle/prepare** is internal; **poll** retrieves new I/O events and runs their callbacks, and may block waiting for I/O if nothing else is scheduled; **check** runs `setImmediate` callbacks; **close callbacks** runs things like `socket.on('close')`.\n\nBetween every single callback — since Node 11 — Node drains the `process.nextTick` queue and then the promise microtask queue. The loop exits when there are no more active handles or requests.",
    deep: [
      { type: "steps", steps: [
        { title: "timers", detail: "Run callbacks whose threshold has elapsed. The delay is a *minimum*, not a guarantee." },
        { title: "pending callbacks", detail: "I/O callbacks deferred from the previous iteration (e.g. some TCP errors such as ECONNREFUSED on certain systems)." },
        { title: "idle, prepare", detail: "Used internally by Node/libuv." },
        { title: "poll", detail: "Compute how long to block, wait for I/O, then run I/O callbacks. If `setImmediate` callbacks are queued, it won't block; if timers are due, it wraps around." },
        { title: "check", detail: "Run `setImmediate` callbacks — designed to run right after poll." },
        { title: "close callbacks", detail: "e.g. `'close'` events when a handle is destroyed abruptly." },
      ] },
      { type: "viz", id: "js-event-loop", caption: "Generic task vs microtask ordering; Node layers the phases above on top of this model." },
      { type: "callout", tone: "spec-vs-impl", title: "Node 11 change", text: "Before Node 11, the nextTick and microtask queues were drained only *between phases*, so two `setTimeout` callbacks with promises inside could interleave differently from browsers. Since Node 11 they are drained after *each* callback, matching browser behaviour. The phases themselves are libuv implementation details, not part of the ECMAScript spec." },
      { type: "p", text: "Microtasks are not a phase. `process.nextTick` callbacks run first, then promise reactions, and both are fully drained — including ones queued while draining — before the loop moves to the next callback. That is why a recursive `process.nextTick` can starve I/O." },
      { type: "table", head: ["API", "Where it runs"], rows: [
        ["`setTimeout` / `setInterval`", "timers phase"],
        ["`fs.readFile` callback, socket `data`", "poll phase"],
        ["`setImmediate`", "check phase"],
        ["`socket.on('close')`", "close callbacks phase"],
        ["`process.nextTick`", "nextTick queue — after the current operation, before promises"],
        ["`Promise.then`, `queueMicrotask`", "microtask queue — after nextTick queue"],
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      caption: "Node-only (CommonJS). Inside an I/O callback the order is deterministic.",
      code: `const fs = require("node:fs");

fs.readFile(__filename, () => {
  setTimeout(() => console.log("timeout"), 0);
  setImmediate(() => console.log("immediate"));
  process.nextTick(() => console.log("nextTick"));
  Promise.resolve().then(() => console.log("promise"));
  console.log("sync in poll callback");
});`,
      output: "sync in poll callback\nnextTick\npromise\nimmediate\ntimeout",
    },
    walkthrough: [
      { title: "Poll phase runs the readFile callback", detail: "It prints `sync in poll callback` and queues a timer, an immediate, a tick and a promise reaction." },
      { title: "Callback returns", detail: "Node drains nextTick (`nextTick`) then microtasks (`promise`)." },
      { title: "Check phase", detail: "Poll is done, so the loop continues to check: `immediate`." },
      { title: "Next iteration, timers phase", detail: "The 0 ms (really ≥1 ms) timer has expired: `timeout`." },
    ],
    followUps: [
      { q: "Why can `setTimeout(fn, 0)` run later than 0 ms?", a: "Node clamps 0 to 1 ms, and timers only run when the loop reaches the timers phase; a busy poll or long callback delays them." },
      { q: "When does the process exit?", a: "When the loop has no referenced handles (servers, timers, sockets) or pending requests. `timer.unref()` lets a timer not keep the process alive." },
      { q: "Is the browser event loop the same?", a: "Same task/microtask idea, different structure: browsers follow the HTML spec's task queues and rendering steps; Node's phases come from libuv. There is no `setImmediate` or `process.nextTick` in standard browsers." },
    ],
    pitfalls: [
      "Listing microtasks as a phase of the loop.",
      "Saying `setImmediate` always runs before `setTimeout(0)` — only guaranteed inside an I/O callback.",
      "Recursive `process.nextTick` or promise chains that never yield, starving I/O.",
      "Forgetting the pre-Node-11 behaviour difference when reading old blog posts.",
    ],
    glossary: [
      { term: "Phase", definition: "A stage of one loop iteration with its own callback queue." },
      { term: "Microtask", definition: "A job (promise reaction, `queueMicrotask`) run after the current callback, before the next task." },
      { term: "nextTick queue", definition: "Node-specific queue processed before promise microtasks after each operation." },
      { term: "Handle", definition: "A long-lived libuv object (timer, socket, server) that can keep the loop alive." },
    ],
    relatedLessons: ["nodejs/node-event-loop", "nodejs/node-architecture", "javascript/event-loop", "javascript/timers"],
    relatedQuestions: ["node-03", "node-01"],
    sources: [NODE_LOOP, LIBUV],
  },
  {
    id: "node-03",
    track: "nodejs",
    number: 3,
    question: "process.nextTick vs setImmediate vs setTimeout(0) — what runs first?",
    level: "intermediate",
    frequency: "high",
    tags: ["node", "event-loop", "nextTick", "setImmediate", "microtasks"],
    shortAnswer:
      "`process.nextTick` runs first: right after the current operation finishes, before promise microtasks and before the loop moves on. Then promise callbacks. `setImmediate` runs in the **check** phase, right after poll. `setTimeout(fn, 0)` runs in the **timers** phase once at least 1 ms has passed.\n\nThe classic gotcha: in the main module, `setTimeout(0)` vs `setImmediate` order is *nondeterministic* — it depends on whether 1 ms has elapsed by the time the loop starts. Inside an I/O callback, `setImmediate` always wins because check comes right after poll. And the names are misleading: `nextTick` is more immediate than `setImmediate`.",
    deep: [
      { type: "table", head: ["Scheduled with", "Runs", "Can starve I/O?"], rows: [
        ["`process.nextTick(fn)`", "After the current JS operation, before promises", "Yes, if recursive"],
        ["`Promise.resolve().then(fn)` / `queueMicrotask(fn)`", "After the nextTick queue drains", "Yes, if endless"],
        ["`setImmediate(fn)`", "Check phase of the current/next loop iteration", "No — new immediates queued during check wait for the next iteration"],
        ["`setTimeout(fn, 0)`", "Timers phase, after ≥1 ms", "No"],
      ] },
      { type: "viz", id: "js-event-loop", caption: "Microtasks drain completely before the next task — Node adds the nextTick queue in front of them." },
      { type: "callout", tone: "spec-vs-impl", title: "ESM vs CommonJS nuance", text: "In an ES module, top-level code itself runs inside a promise job (module evaluation is async), so a promise reaction queued at top level can run *before* a `process.nextTick` queued at top level. The \"nextTick before promise\" rule is cleanest to demonstrate in CommonJS." },
      { type: "callout", tone: "spec-vs-impl", title: "Node 11+", text: "Since Node 11, nextTick and microtask queues drain after each individual timer/immediate callback, not only between phases." },
      { type: "p", text: "Why main-module timeout vs immediate is racy: the timer is due at `start + 1 ms`. If entering the loop took more than 1 ms (process load, slow machine), the timers phase sees it expired and runs it first; otherwise the loop passes timers, goes through poll and check (immediate first), then catches the timer next iteration." },
    ],
    example: {
      type: "code",
      lang: "js",
      caption: "Node-only, CommonJS main module. Lines 1–3 of output are deterministic; the last two may swap between runs.",
      code: `setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));
Promise.resolve().then(() => console.log("promise"));
process.nextTick(() => console.log("nextTick"));
console.log("sync");`,
      output: "sync\nnextTick\npromise\ntimeout     (or immediate first — nondeterministic)\nimmediate",
    },
    walkthrough: [
      { title: "Synchronous code", detail: "`sync` prints; four callbacks are queued in four different places." },
      { title: "Main script finishes", detail: "nextTick queue drains → `nextTick`; then microtasks → `promise`." },
      { title: "Loop starts", detail: "If ≥1 ms elapsed, timers phase runs `timeout`, then check runs `immediate`. Otherwise check runs `immediate` first and `timeout` runs next iteration." },
      { title: "Make it deterministic", detail: "Schedule both from inside an I/O callback (e.g. `fs.readFile`): poll → check → timers, so `immediate` always precedes `timeout`." },
    ],
    followUps: [
      { q: "When should you use process.nextTick?", a: "Rarely: mainly to emit events or call callbacks asynchronously *after* the caller has had a chance to attach listeners, while still before any I/O. Node docs recommend `setImmediate` for most \"defer this\" needs." },
      { q: "How do you yield to I/O during a long computation?", a: "Chunk the work and schedule the next chunk with `setImmediate`, which lets the poll phase run between chunks. `nextTick` or promises would not yield to I/O." },
      { q: "Does `setTimeout(fn, 0)` really mean 0?", a: "No — Node coerces delays below 1 to 1 ms, and the callback only runs when the loop reaches the timers phase." },
    ],
    pitfalls: [
      "Stating a fixed order for timeout vs immediate in the main module.",
      "Thinking `setImmediate` is \"more immediate\" than `nextTick` because of the name.",
      "Using recursive `nextTick` for polling loops — it blocks I/O forever.",
      "Assuming the CommonJS ordering of nextTick vs promises also holds at ESM top level.",
    ],
    glossary: [
      { term: "Check phase", definition: "The event-loop phase that runs `setImmediate` callbacks, right after poll." },
      { term: "Starvation", definition: "When a queue keeps refilling so other work (like I/O) never gets to run." },
      { term: "Nondeterministic", definition: "Order can differ between runs because it depends on timing outside your control." },
    ],
    relatedLessons: ["nodejs/node-event-loop", "javascript/event-loop", "javascript/timers", "javascript/promises"],
    relatedQuestions: ["node-02"],
    sources: [NODE_LOOP, { label: "Node.js API — process.nextTick", url: "https://nodejs.org/api/process.html#processnexttickcallback-args", kind: "docs" }],
  },
  {
    id: "node-04",
    track: "nodejs",
    number: 4,
    question: "What is the libuv thread pool and which operations use it?",
    level: "advanced",
    frequency: "high",
    tags: ["node", "libuv", "thread-pool", "performance", "crypto", "fs"],
    shortAnswer:
      "libuv keeps a pool of worker threads — 4 by default, configurable with the `UV_THREADPOOL_SIZE` environment variable up to 1024 — for operations that have no good non-blocking OS API. In Node that's most of the async `fs` module, `dns.lookup` (which calls the blocking `getaddrinfo`), async CPU-heavy crypto like `pbkdf2`, `scrypt`, `randomBytes`/`randomFill`, and async `zlib`.\n\nNetwork sockets do *not* use it — they use epoll/kqueue/IOCP — and neither do `dns.resolve*` functions, which use c-ares over the network. Because the pool is small and shared, five slow `pbkdf2` calls can make a sixth `fs.readFile` wait, which is a common hidden latency source.",
    deep: [
      { type: "table", head: ["Uses thread pool", "Does not"], rows: [
        ["Async `fs.*` (except `fs.watch`, which uses OS notifications)", "TCP/UDP sockets, HTTP"],
        ["`dns.lookup` (and therefore default hostname resolution in `http.get`, `net.connect`)", "`dns.resolve*`, `dns.Resolver` (c-ares, network I/O)"],
        ["`crypto.pbkdf2`, `scrypt`, `randomBytes`/`randomFill` (async), `generateKeyPair` (async)", "Sync crypto variants — they block the *main* thread instead"],
        ["Async `zlib` (except sync variants)", "Pipes, TTYs, signals, child process stdio"],
        ["Native addons that call `uv_queue_work`", "Timers"],
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Implementation detail", text: "Pool size defaults to 4 and is read once, when the pool is first used; setting `process.env.UV_THREADPOOL_SIZE` later in the program may have no effect, so set it in the environment before starting Node. The exact list of pool-backed APIs is Node/libuv behaviour and can change between versions." },
      { type: "p", text: "Because `dns.lookup` uses the pool, a slow DNS server can clog the pool and stall unrelated file reads. Services that make many outbound connections sometimes cache DNS or use `dns.resolve` to avoid this." },
      { type: "list", items: [
        "Diagnose: latency on fs/crypto calls that grows in steps of ~4 concurrent operations is the classic signature.",
        "Fix: raise `UV_THREADPOOL_SIZE` (roughly number of cores, more if work is I/O-waiting), reduce pool work, or move CPU work to `worker_threads`.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      caption: "Node-only. Timings are illustrative (they depend on the machine), but the batching pattern is the point: with the default pool of 4, the 5th hash finishes roughly one 'round' later.",
      code: `const crypto = require("node:crypto");
const start = Date.now();

for (let i = 1; i <= 5; i++) {
  crypto.pbkdf2("pw", "salt", 200_000, 64, "sha512", () => {
    console.log(\`hash \${i}: \${Date.now() - start} ms\`);
  });
}`,
      output: "hash 1: 210 ms\nhash 3: 212 ms\nhash 2: 213 ms\nhash 4: 215 ms\nhash 5: 420 ms",
    },
    walkthrough: [
      { title: "Five jobs submitted", detail: "Each async `pbkdf2` is queued as a work item for the libuv pool." },
      { title: "Four run in parallel", detail: "Four pool threads pick up jobs 1–4 (completion order among them can vary)." },
      { title: "Fifth waits", detail: "Job 5 starts only when a thread frees up, so it completes about one job-duration later." },
      { title: "Experiment", detail: "Run with `UV_THREADPOOL_SIZE=5 node file.js` and all five finish together (given ≥5 cores)." },
    ],
    followUps: [
      { q: "Why doesn't Node use the thread pool for sockets?", a: "The OS already offers efficient readiness notification for sockets, which scales to many thousands of connections without threads. Files on most OSes lack a comparable, reliable non-blocking interface." },
      { q: "Is the thread pool the same as worker_threads?", a: "No. The libuv pool runs C/C++ work submitted by Node internals; you can't run JS there. `worker_threads` create separate V8 isolates with their own event loops to run JavaScript in parallel." },
      { q: "Should I set UV_THREADPOOL_SIZE to 1024?", a: "Usually not: each thread has memory cost, and CPU-bound work gains nothing beyond core count. Size it to your workload and measure." },
    ],
    pitfalls: [
      "Claiming HTTP requests or all I/O go through the thread pool.",
      "Setting `UV_THREADPOOL_SIZE` from inside the app after the pool has already been used.",
      "Using `crypto.pbkdf2Sync` in a request handler — it blocks the main thread instead of the pool.",
      "Ignoring that `dns.lookup` shares the pool with fs and crypto.",
    ],
    glossary: [
      { term: "UV_THREADPOOL_SIZE", definition: "Environment variable setting libuv's pool size (default 4, max 1024)." },
      { term: "getaddrinfo", definition: "Blocking OS resolver call used by `dns.lookup`; honours /etc/hosts and system config." },
      { term: "c-ares", definition: "Asynchronous DNS library used by `dns.resolve*`, which queries DNS servers over the network." },
    ],
    relatedLessons: ["nodejs/node-architecture", "nodejs/worker-threads", "networks/dns", "os/processes-threads"],
    relatedQuestions: ["node-01", "node-06"],
    sources: [LIBUV_POOL, NODE_DONT_BLOCK, { label: "Node.js API — DNS (implementation considerations)", url: "https://nodejs.org/api/dns.html#implementation-considerations", kind: "docs" }],
  },
  {
    id: "node-05",
    track: "nodejs",
    number: 5,
    question: "What are streams in Node.js, and what is backpressure?",
    level: "intermediate",
    frequency: "high",
    tags: ["node", "streams", "backpressure", "buffers", "highWaterMark"],
    shortAnswer:
      "A stream processes data in chunks instead of loading it all into memory. There are Readable, Writable, Duplex and Transform streams, and they're everywhere: files, HTTP requests and responses, sockets, zlib.\n\nBackpressure is what happens when the consumer is slower than the producer. Each stream has an internal buffer sized by `highWaterMark` (16 KiB for byte streams by default, 16 objects in object mode; newer Node versions raised the byte default to 64 KiB). `writable.write()` returns `false` once that buffer is full — that's the signal to stop writing and wait for the `'drain'` event. `pipe()` and especially `stream.pipeline()` do this automatically and `pipeline` also propagates errors and cleans up. Ignoring the `false` return makes memory grow without bound.",
    deep: [
      { type: "compare", items: [
        { title: "Buffer everything", points: ["`fs.readFile` then process", "Memory ∝ file size", "Simple, fine for small inputs"] },
        { title: "Stream", points: ["Process chunk by chunk", "Memory ∝ highWaterMark × pipeline depth", "Starts producing output before input ends"] },
      ] },
      { type: "steps", steps: [
        { title: "Producer writes", detail: "`ok = dest.write(chunk)` appends to the writable's buffer." },
        { title: "Buffer passes highWaterMark", detail: "`write` returns `false`. The data is still accepted — `false` is advisory." },
        { title: "Producer pauses", detail: "A well-behaved producer stops (a Readable in `pipe` is paused automatically)." },
        { title: "Buffer drains", detail: "When the underlying resource catches up, the writable emits `'drain'` and the producer resumes." },
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Version note", text: "`highWaterMark` defaults are Node implementation details: historically 16 KiB for byte streams (64 KiB for `fs.createReadStream`) and 16 objects in object mode. Node 22 raised the general byte default to 64 KiB. Check `stream.getDefaultHighWaterMark()` on your version." },
      { type: "p", text: "Prefer `await pipeline(src, transform, dest)` from `node:stream/promises`. Unlike bare `.pipe()`, it destroys all streams when any one errors, so you don't leak file descriptors or hang forever." },
    ],
    example: {
      type: "code",
      lang: "js",
      caption: "Node-only. Gzip a large file with constant memory; errors anywhere reject the promise.",
      code: `const { pipeline } = require("node:stream/promises");
const fs = require("node:fs");
const zlib = require("node:zlib");

async function main() {
  await pipeline(
    fs.createReadStream("big.log"),
    zlib.createGzip(),
    fs.createWriteStream("big.log.gz"),
  );
  console.log("done");
}
main().catch((err) => console.error("failed:", err.message));`,
      output: "done",
    },
    walkthrough: [
      { title: "Read chunk", detail: "The file stream reads up to its highWaterMark and pushes the chunk to gzip." },
      { title: "Gzip is slower", detail: "Its buffer fills; `write` returns false; pipeline pauses the read stream." },
      { title: "Drain", detail: "gzip flushes to the write stream, emits 'drain', reading resumes." },
      { title: "End", detail: "All streams finish; the pipeline promise resolves and `done` prints." },
    ],
    followUps: [
      { q: "Does write() returning false mean the chunk was dropped?", a: "No. It was buffered; `false` just says the buffer is over the high-water mark and you should wait for 'drain' before writing more." },
      { q: "Why is .pipe() considered risky?", a: "It handles backpressure but not error propagation or cleanup: an error in the destination leaves the source open. `pipeline` destroys every stream on error." },
      { q: "What is object mode?", a: "A stream that moves arbitrary JS values instead of Buffers/strings; highWaterMark then counts objects, not bytes." },
      { q: "Can you consume a Readable with for await?", a: "Yes — Readables are async iterables, and `for await` naturally applies backpressure because you pull one chunk at a time." },
    ],
    pitfalls: [
      "Ignoring `write()`'s return value in a loop, causing unbounded memory growth.",
      "Using `.pipe()` without error handlers on every stream.",
      "Reading a multi-GB file with `fs.readFile` and hitting buffer/heap limits.",
      "Mixing flowing-mode `'data'` listeners with `pipe` and losing data.",
    ],
    glossary: [
      { term: "Backpressure", definition: "Flow-control signal telling a fast producer to slow down for a slower consumer." },
      { term: "highWaterMark", definition: "Buffer threshold after which a stream signals backpressure." },
      { term: "Transform stream", definition: "A Duplex stream whose output is computed from its input (e.g. gzip)." },
      { term: "Buffer", definition: "Node's fixed-size byte array type, allocated outside the V8 JS heap." },
    ],
    relatedLessons: ["nodejs/streams-buffers", "nodejs/node-event-loop", "system-design/backpressure", "go/backpressure-bounded-concurrency"],
    relatedQuestions: ["node-01"],
    sources: [NODE_STREAM, NODE_BACKPRESSURE],
  },
  {
    id: "node-06",
    track: "nodejs",
    number: 6,
    question: "worker_threads vs cluster vs child_process — when do you use each?",
    level: "intermediate",
    frequency: "high",
    tags: ["node", "worker-threads", "cluster", "child-process", "parallelism"],
    shortAnswer:
      "All three get you parallelism, at different isolation levels.\n\n`worker_threads` run JavaScript on extra threads *inside one process*: each worker has its own V8 isolate and event loop, they talk by message passing, and can share memory with `SharedArrayBuffer`. Use them for CPU-heavy JS like image processing or parsing.\n\n`cluster` forks multiple copies of your Node *process* that share a server port, so you use all cores for an HTTP server; a crash only kills one worker. `child_process` spawns any program — `spawn`, `exec`, `execFile`, `fork` — for running shell tools or isolating untrusted or crashy work. In containers, people often skip cluster and just run more replicas.",
    deep: [
      { type: "table", head: ["", "worker_threads", "cluster", "child_process"], rows: [
        ["Unit", "Thread (V8 isolate) in same process", "Full Node process (via `child_process.fork`)", "Any OS process"],
        ["Memory", "Separate JS heaps; optional `SharedArrayBuffer`", "Fully separate", "Fully separate"],
        ["Communication", "`postMessage`, transferables, shared memory", "IPC messages; shared listening socket", "stdio pipes, IPC (with `fork`)"],
        ["Startup cost", "Lower (still ms + MBs per isolate)", "Higher", "Highest (exec a binary)"],
        ["Crash impact", "Uncaught error ends the worker; can affect process if not handled", "One worker dies, primary can respawn", "Isolated"],
        ["Typical use", "CPU-bound JS", "Use all cores for a network server", "Run ffmpeg/git/python, sandboxing"],
      ] },
      { type: "callout", tone: "tip", text: "Workers are expensive to start; use a pool (e.g. a fixed set of workers fed by a queue) rather than one worker per request." },
      { type: "callout", tone: "spec-vs-impl", title: "Implementation detail", text: "Cluster's default load distribution on non-Windows platforms is round-robin by the primary process; on Windows it leaves accepting to the OS. This is Node behaviour, configurable via `cluster.schedulingPolicy`." },
      { type: "p", text: "Process managers like PM2 build on cluster mode and add restarts, log handling and zero-downtime reloads. In Kubernetes, one process per container plus horizontal scaling is usually simpler." },
    ],
    example: {
      type: "code",
      lang: "js",
      caption: "Node-only. Offload a CPU-bound Fibonacci to a worker thread so the main loop stays responsive.",
      code: `const { Worker, isMainThread, parentPort, workerData } = require("node:worker_threads");

const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));

if (isMainThread) {
  const w = new Worker(__filename, { workerData: 35 });
  w.on("message", (r) => console.log("fib(35) =", r));
  console.log("main thread still free");
} else {
  parentPort.postMessage(fib(workerData));
}`,
      output: "main thread still free\nfib(35) = 9227465",
    },
    walkthrough: [
      { title: "Main thread", detail: "Creates a Worker running the same file with `workerData = 35`, registers a listener, prints immediately." },
      { title: "Worker thread", detail: "New isolate; `isMainThread` is false; computes fib(35) on its own thread." },
      { title: "Message", detail: "Result is structured-cloned back; main thread's 'message' callback prints it." },
    ],
    followUps: [
      { q: "Do worker threads share variables?", a: "No — each has its own heap and module instances. Only `SharedArrayBuffer` (with `Atomics`) is shared; other data is copied (structured clone) or transferred (e.g. ArrayBuffer ownership)." },
      { q: "Would worker_threads speed up an I/O-heavy API?", a: "Generally no; I/O is already concurrent on the event loop. Workers help CPU-bound work." },
      { q: "Cluster vs multiple containers?", a: "Both use all cores. Containers give the orchestrator visibility and per-instance health checks; cluster saves memory/ports on a single VM. Pick one layer for replication, not both blindly." },
    ],
    pitfalls: [
      "Spawning a new Worker per request instead of pooling.",
      "Expecting shared global state across cluster workers (sessions in memory break).",
      "Using `exec` with user input — shell injection; prefer `execFile`/`spawn` with argument arrays.",
      "Using workers for I/O-bound work and adding overhead for nothing.",
    ],
    glossary: [
      { term: "Isolate", definition: "An independent V8 instance with its own heap; each worker thread has one." },
      { term: "IPC", definition: "Inter-process communication — messages between separate processes." },
      { term: "Structured clone", definition: "The algorithm used to copy values between threads/processes via postMessage." },
    ],
    relatedLessons: ["nodejs/worker-threads", "nodejs/pm2-process-management", "os/processes-threads", "javascript/event-loop"],
    relatedQuestions: ["node-01", "node-04"],
    sources: [NODE_WORKERS, NODE_CLUSTER, NODE_CHILD],
  },
  {
    id: "node-07",
    track: "nodejs",
    number: 7,
    question: "What are the differences between CommonJS and ES modules in Node.js?",
    level: "intermediate",
    frequency: "high",
    tags: ["node", "modules", "commonjs", "esm", "require", "import"],
    shortAnswer:
      "CommonJS uses `require` and `module.exports`. Loading is synchronous and dynamic: `require` is a function call that runs the module and returns its exports object, and you get a *copy* of values at that time.\n\nES modules use `import`/`export`. The graph is parsed and linked before any code runs, which enables static analysis and tree-shaking; loading is asynchronous, top-level `await` is allowed, and imports are *live bindings* to the exporter's variables. Node picks the system by file extension (`.mjs`/`.cjs`) or the nearest package.json `\"type\"` field. ESM requires full file extensions in relative imports and has no `__dirname` or `require` by default. ESM can import CommonJS; CommonJS historically needed dynamic `import()` for ESM, though recent Node versions support `require()` of synchronous ES modules.",
    deep: [
      { type: "table", head: ["", "CommonJS", "ES modules"], rows: [
        ["Syntax", "`require()`, `module.exports`", "`import`, `export`"],
        ["When resolved", "At runtime, when `require` runs", "Statically, before evaluation (link phase)"],
        ["Loading", "Synchronous", "Asynchronous; top-level `await`"],
        ["Bindings", "Value copied into exports object", "Live, read-only bindings"],
        ["Extensions in relative paths", "Optional (`./util` tries .js, .json, .node, index.js)", "Required (`./util.js`)"],
        ["`this` at top level", "`module.exports`", "`undefined`"],
        ["Globals", "`__dirname`, `__filename`, `require`", "`import.meta.url`, `import.meta.dirname` (newer Node)"],
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Version-dependent", text: "`require()` of ES modules landed behind a flag in Node 22 and was enabled by default in later releases (Node 20.19+/22.12+). It only works for modules without top-level await. `import.meta.dirname`/`filename` appeared in Node 20.11/21.2. Check your Node version before relying on these." },
      { type: "p", text: "Resolution for bare specifiers (`import x from \"pkg\"`) walks up `node_modules` directories in both systems; package.json `\"exports\"` can map different entry points for `import` vs `require` (conditional exports). Publishing both formats risks the *dual package hazard*: two copies of a module's state." },
    ],
    example: {
      type: "code",
      lang: "js",
      caption: "Live bindings: ESM importers see updates; a CommonJS destructured require would not. (Two files shown together; run with Node as .mjs.)",
      code: `// counter.mjs
export let count = 0;
export function inc() { count++; }

// main.mjs
import { count, inc } from "./counter.mjs";
console.log(count);
inc();
console.log(count);`,
      output: "0\n1",
    },
    walkthrough: [
      { title: "Parse & link", detail: "Node parses main.mjs, finds the import, loads and parses counter.mjs, and links `count` to counter's variable slot." },
      { title: "Evaluate", detail: "counter.mjs runs first (dependencies first), then main.mjs." },
      { title: "Live binding", detail: "After `inc()` mutates `count` inside counter.mjs, main sees `1`. With `const { count } = require(...)` in CJS it would still print 0." },
    ],
    followUps: [
      { q: "Can you assign to an imported binding?", a: "No — imports are read-only views; `count = 5` in the importer throws a TypeError. Only the exporting module can change it." },
      { q: "How are circular dependencies handled?", a: "CJS returns a partially populated `module.exports`. ESM's link phase creates bindings first, so accessing one before its module evaluates throws a TDZ ReferenceError rather than giving `undefined`." },
      { q: "Why does tree-shaking need ESM?", a: "Because imports/exports are static syntax, bundlers can prove which exports are unused without running code. `require` can be computed at runtime." },
    ],
    pitfalls: [
      "Omitting `.js` extensions in ESM relative imports.",
      "Using `__dirname` in ESM — use `import.meta.url` / `import.meta.dirname`.",
      "Assuming a TS `import` compiles to ESM — it depends on `module`/`moduleResolution` settings.",
      "Shipping dual CJS/ESM packages with stateful singletons (dual package hazard).",
    ],
    glossary: [
      { term: "Live binding", definition: "An import that reflects the exporter's current variable value." },
      { term: "Bare specifier", definition: "An import path without `./`, `../` or `/`, resolved via node_modules or import maps." },
      { term: "Conditional exports", definition: "package.json `exports` entries that choose a file based on conditions like `import`, `require`, `node`." },
    ],
    relatedLessons: ["nodejs/module-systems", "javascript/modules", "typescript/incremental-compilation"],
    relatedQuestions: ["node-03"],
    sources: [NODE_ESM, NODE_CJS, { label: "Node.js API — Packages (exports, type)", url: "https://nodejs.org/api/packages.html", kind: "docs" }],
  },
  {
    id: "node-08",
    track: "nodejs",
    number: 8,
    question: "How does V8 execute JavaScript? (JIT tiers, hidden classes, inline caches)",
    level: "advanced",
    frequency: "medium",
    tags: ["v8", "jit", "hidden-classes", "inline-caches", "performance"],
    shortAnswer:
      "V8 parses source into an AST and the Ignition interpreter compiles it to compact bytecode, which starts running immediately. While it runs, V8 collects type feedback. Hot functions move up tiers: Sparkplug is a fast baseline compiler that turns bytecode into machine code without optimizing, Maglev is a quick mid-tier optimizer, and TurboFan is the heavy optimizing compiler that speculates based on feedback — for example, \"this `x` is always a small integer\".\n\nObjects get hidden classes, also called shapes or maps, describing their property layout, and inline caches remember the shape seen at each property access so the next access is a fast offset load. If a speculation is wrong, V8 *deoptimizes* back to bytecode. Practical takeaway: keep object shapes and argument types consistent. All of this is V8 implementation detail, not JavaScript semantics.",
    deep: [
      { type: "flow", nodes: ["Source", "Parser → AST", "Ignition bytecode", "Sparkplug (baseline)", "Maglev (mid-tier)", "TurboFan (optimized)"], caption: "Conceptual tiering pipeline; hot code moves right, deopts move it back to bytecode." },
      { type: "callout", tone: "spec-vs-impl", title: "V8-specific", text: "Tier names and thresholds are V8 internals as of recent Chrome/Node versions (Sparkplug shipped in 2021, Maglev in Chrome 117 / 2023). Other engines (SpiderMonkey, JavaScriptCore) use different tiers. None of it is in the ECMAScript spec, and it changes between releases." },
      { type: "table", head: ["Concept", "What it is", "Why it matters"], rows: [
        ["Hidden class / map", "Internal descriptor of an object's property names, order and offsets", "Objects created the same way share a map → fast property access"],
        ["Inline cache (IC)", "Per-call-site cache of maps seen and how to load the property", "Monomorphic (1 shape) is fastest; megamorphic (many) falls back to slow lookup"],
        ["Type feedback", "Recorded types/shapes at each operation", "Lets TurboFan speculate and emit specialised code"],
        ["Deoptimization", "Bail out of optimized code when an assumption fails", "Frequent deopts waste work; keep types stable"],
      ] },
      { type: "p", text: "Garbage collection is generational: a fast *Scavenger* copies survivors out of the young generation, while a mostly concurrent/incremental *Mark-Compact* (the Orinoco project) handles the old generation. Also V8 implementation detail." },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      caption: "Semantically both objects are equivalent; internally, different property order means different hidden classes, so a call site seeing both becomes polymorphic.",
      code: `function makeA() { return { x: 1, y: 2 }; }
function makeB() { const o = { y: 2 }; o.x = 1; return o; }

const a = makeA();
const b = makeB();
console.log(Object.keys(a).join(","));
console.log(Object.keys(b).join(","));
console.log(a.x + b.x);`,
      output: "x,y\ny,x\n2",
    },
    walkthrough: [
      { title: "makeA", detail: "Literal `{x, y}` gets a map with x at offset 0, y at offset 1." },
      { title: "makeB", detail: "Starts as `{y}` then transitions to a new map when `x` is added: different layout." },
      { title: "Property read site", detail: "A function reading `.x` on both sees two maps → polymorphic inline cache, slightly slower than monomorphic." },
      { title: "Observable result", detail: "The JS result is identical (`2`); only performance characteristics differ. Key order differs because insertion order is preserved." },
    ],
    followUps: [
      { q: "Why have an interpreter at all if there's a JIT?", a: "Startup and memory: bytecode is compact and starts fast; most code runs only a few times and isn't worth optimizing. The interpreter also gathers the feedback the optimizers need." },
      { q: "What causes deoptimization?", a: "A speculation failing: a new object shape, a number that was always an int becoming a double or string, `arguments` tricks, changing prototypes, etc." },
      { q: "Is `delete obj.prop` slow?", a: "It can push the object into dictionary (hash-table) mode in V8, losing fast-property benefits. Setting to `undefined` or using a Map is often better for dynamic keys." },
    ],
    pitfalls: [
      "Presenting V8 tier names as part of JavaScript itself.",
      "Micro-optimizing for hidden classes without profiling.",
      "Saying JS is \"interpreted only\" or \"compiled only\" — modern engines do both.",
      "Using objects as hash maps with ever-changing keys instead of `Map`.",
    ],
    glossary: [
      { term: "JIT", definition: "Just-in-time compilation: compiling to machine code while the program runs." },
      { term: "Bytecode", definition: "A compact intermediate instruction format executed by an interpreter (Ignition in V8)." },
      { term: "Monomorphic", definition: "A call/property site that has only seen one shape — the fastest case for inline caches." },
      { term: "Deoptimization", definition: "Discarding optimized code and resuming in a lower tier when assumptions fail." },
    ],
    relatedLessons: ["nodejs/v8-internals", "nodejs/jit-compilation", "javascript/memory-leaks-gc", "javascript/performance"],
    relatedQuestions: ["node-01"],
    sources: [V8_IGNITION, V8_SPARKPLUG, V8_MAGLEV, V8_FAST_PROPS, { label: "V8 blog — Trash talk: the Orinoco garbage collector", url: "https://v8.dev/blog/trash-talk", kind: "external" }],
  },

  // ───────────────────────────── React ─────────────────────────────
  {
    id: "react-01",
    track: "react",
    number: 1,
    question: "How does React render and reconcile updates?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["react", "rendering", "reconciliation", "fiber", "commit"],
    shortAnswer:
      "An update — a state change, a new prop from a parent, or a context change — schedules a re-render. In the **render phase** React calls your component functions to get a new tree of elements, and reconciles it against the previous tree, which it stores as a tree of *fibers*. It diffs using two heuristics: elements of a different type replace the whole subtree, and children in lists are matched by `key`. This phase is pure and, with concurrent features, interruptible.\n\nIn the **commit phase** React applies the minimal set of DOM mutations synchronously, runs ref updates and layout effects, then the browser paints, and later the passive `useEffect`s run. Rendering a component doesn't mean the DOM changes — only differences get committed.",
    deep: [
      { type: "steps", steps: [
        { title: "Trigger", detail: "Initial `root.render`, or a `setState`/context change queues an update on a fiber." },
        { title: "Render (reconcile)", detail: "React walks the fiber tree from the updated component down, calling components to produce elements and building a work-in-progress tree. Can be paused/resumed in concurrent rendering." },
        { title: "Diff", detail: "Same type at same position → update props, keep state. Different type → unmount old subtree, mount new. Lists → match by key." },
        { title: "Commit", detail: "Synchronously apply DOM inserts/updates/deletions, attach refs, run `useLayoutEffect`s. Cannot be interrupted." },
        { title: "Paint & passive effects", detail: "Browser paints; React then runs `useEffect` callbacks (cleanup of previous first)." },
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Implementation detail", text: "Fiber (React 16+), the double-buffered `current`/`workInProgress` trees and lane-based priorities are React internals. The public contract is: components must be pure during render, and effects run after commit." },
      { type: "p", text: "Re-rendering cascades down: when a parent renders, its children render too by default, even if their props are equal. `React.memo`, moving state down, or passing children as props limit that cascade." },
      { type: "compare", items: [
        { title: "Render phase", points: ["Calls components", "Must be pure (no side effects)", "May run more than once (StrictMode, concurrent)"] },
        { title: "Commit phase", points: ["Touches the DOM", "Runs once per committed update", "Layout effects synchronous, passive effects after paint"] },
      ] },
    ],
    example: {
      type: "code",
      lang: "tsx",
      caption: "Changing the element type at the same position resets state; the console line is what you'd see after toggling once.",
      code: `function Counter() {
  const [n, setN] = useState(0);
  useEffect(() => () => console.log("Counter unmounted at", n), [n]);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
}

function App({ fancy }: { fancy: boolean }) {
  // <div> vs <section>: different type → whole subtree remounts
  return fancy ? <section><Counter /></section> : <div><Counter /></div>;
}`,
      output: "Counter unmounted at 0",
    },
    walkthrough: [
      { title: "Initial render", detail: "`<div><Counter/></div>` mounted; n = 0." },
      { title: "Toggle `fancy`", detail: "Render phase sees `<section>` where `<div>` was — type differs." },
      { title: "Reconcile", detail: "React discards the `div` subtree including Counter's fiber and state, and creates new fibers under `section`." },
      { title: "Commit", detail: "Old DOM removed, effect cleanups run (logging), new DOM inserted; new Counter starts at 0." },
    ],
    followUps: [
      { q: "Does every render touch the DOM?", a: "No. If the diff finds no differences, the commit has nothing to do for that node. Rendering is calling your function; committing is mutating the DOM." },
      { q: "Why must render be pure?", a: "React may call it multiple times, discard results, or render in the background. Side effects in render would run unpredictably." },
      { q: "What is Fiber?", a: "React's internal unit of work: one object per component instance storing type, props, state (hooks), effects and pointers to child/sibling/parent. It lets React split rendering into interruptible chunks." },
    ],
    pitfalls: [
      "Equating \"component re-rendered\" with \"DOM updated\".",
      "Defining a component inside another component — new type each render → remount & lost state.",
      "Doing fetches or subscriptions directly in the render body.",
      "Assuming children skip rendering when their props didn't change (only with memo).",
    ],
    glossary: [
      { term: "Reconciliation", definition: "Comparing the new element tree with the previous one to decide what to change." },
      { term: "Fiber", definition: "Internal node representing a component instance and its pending work." },
      { term: "Commit phase", definition: "The synchronous phase where React applies changes to the host (DOM)." },
    ],
    relatedLessons: ["react/rendering-reconciliation", "react/virtual-dom", "react/hooks-internals", "react/component-placement"],
    relatedQuestions: ["react-02", "react-03", "react-07"],
    sources: [REACT_RENDER, REACT_PRESERVE, FIBER],
  },
  {
    id: "react-02",
    track: "react",
    number: 2,
    question: "What is the virtual DOM, and is it faster than the real DOM?",
    level: "beginner",
    frequency: "very-high",
    tags: ["react", "virtual-dom", "performance", "dom"],
    shortAnswer:
      "The \"virtual DOM\" is React's in-memory description of the UI: plain JS objects — React elements — returned by your components. On each update React builds a new description, diffs it against the previous one, and applies only the needed changes to the real DOM.\n\nIt is *not* inherently faster than hand-written DOM updates — a perfect manual update always does less work, because the diff itself costs something. What it buys you is a declarative model: you describe the UI for a given state and React figures out the mutations, with performance that's good enough by default and batching of DOM writes. Frameworks like Svelte and Solid show you can be declarative without a virtual DOM by compiling to direct updates.",
    deep: [
      { type: "compare", items: [
        { title: "What the virtual DOM gives you", points: ["Declarative UI: UI = f(state)", "Batched, minimal DOM writes", "A renderer-agnostic tree (React DOM, React Native, etc.)"] },
        { title: "What it doesn't", points: ["Free performance — diffing costs CPU", "Faster than precise manual DOM updates", "Protection from re-rendering huge trees unnecessarily"] },
      ] },
      { type: "p", text: "A React element is a small object like `{ type: 'li', props: { children: 'a' }, key: null }`. Creating thousands is cheap compared with DOM operations, which can trigger style recalculation and layout." },
      { type: "callout", tone: "misconception", title: "\"The real DOM is slow\"", text: "Individual DOM API calls are fast. What's expensive is unnecessary work, especially forcing synchronous layout by interleaving reads (`offsetHeight`) and writes. The virtual DOM helps by batching writes, not by magic." },
      { type: "callout", tone: "spec-vs-impl", text: "\"Virtual DOM\" is a community term; React's docs talk about elements, rendering and reconciliation. The internal representation used for diffing is the fiber tree." },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      caption: "A toy virtual-DOM diff: compare two element descriptions and list the minimal patches.",
      code: `const prev = { type: "ul", children: ["a", "b", "c"] };
const next = { type: "ul", children: ["a", "B", "c", "d"] };

function diff(p, n) {
  if (p.type !== n.type) return ["REPLACE root"];
  const ops = [];
  const len = Math.max(p.children.length, n.children.length);
  for (let i = 0; i < len; i++) {
    if (p.children[i] === undefined) ops.push(\`INSERT \${n.children[i]}\`);
    else if (n.children[i] === undefined) ops.push(\`REMOVE \${p.children[i]}\`);
    else if (p.children[i] !== n.children[i]) ops.push(\`TEXT \${p.children[i]} -> \${n.children[i]}\`);
  }
  return ops;
}
console.log(diff(prev, next).join("\\n"));`,
      output: "TEXT b -> B\nINSERT d",
    },
    walkthrough: [
      { title: "Two descriptions", detail: "Old and new trees are just objects — cheap to create." },
      { title: "Diff", detail: "Same root type, so compare children positionally." },
      { title: "Patches", detail: "Only two DOM operations needed instead of rebuilding the list." },
      { title: "Real React", detail: "Uses keys rather than positions for lists and works on fibers, but the idea is the same." },
    ],
    followUps: [
      { q: "Then why did React choose it?", a: "To make UI declarative and composable with acceptable performance, and to keep a renderer-agnostic tree. Developer productivity and predictability, not raw speed." },
      { q: "How do Svelte/Solid differ?", a: "They compile templates to code that updates exactly the DOM nodes tied to changed state (fine-grained reactivity), skipping the diff step." },
      { q: "What's the shadow DOM?", a: "Unrelated: a browser feature for encapsulating a component's DOM and styles (Web Components). The virtual DOM is a JS data structure." },
    ],
    pitfalls: [
      "Claiming the virtual DOM is always faster than direct DOM manipulation.",
      "Confusing virtual DOM with shadow DOM.",
      "Ignoring that re-rendering large trees still costs CPU even if few DOM changes result.",
    ],
    glossary: [
      { term: "React element", definition: "Immutable object describing what to render: type, props, key." },
      { term: "Diffing", definition: "Comparing two trees to compute the changes between them." },
      { term: "Layout thrashing", definition: "Alternating DOM reads and writes that force repeated synchronous layout." },
    ],
    relatedLessons: ["react/virtual-dom", "react/rendering-reconciliation", "javascript/dom", "javascript/performance"],
    relatedQuestions: ["react-01", "react-03"],
    sources: [REACT_RENDER, { label: "react.dev — Writing Markup with JSX", url: "https://react.dev/learn/writing-markup-with-jsx", kind: "docs" }],
  },
  {
    id: "react-03",
    track: "react",
    number: 3,
    question: "Why do list items need keys, and why is the array index a bad key?",
    level: "beginner",
    frequency: "very-high",
    tags: ["react", "keys", "lists", "reconciliation", "state"],
    shortAnswer:
      "Keys tell React which item is which across renders. When reconciling a list, React matches old and new children by key, so it can move, insert or delete DOM nodes and — crucially — keep each component's *state* attached to the right item.\n\nThe index is a bad key when the list can be reordered, filtered, or have items inserted anywhere but the end: after inserting at the top, every item's index shifts, so React thinks item 0 is still item 0 and reuses its DOM and state for different data. You see inputs keeping the wrong text or checkboxes jumping. Use a stable, unique ID from your data. Index is acceptable only for static lists that never change order.",
    deep: [
      { type: "table", head: ["Key choice", "Insert at top", "Verdict"], rows: [
        ["Stable id (`todo.id`)", "React inserts one new node; others keep state", "Correct"],
        ["Index", "Every item's props change; state stays with the position, not the item", "Buggy for dynamic lists"],
        ["`Math.random()` / `crypto.randomUUID()` in render", "Every key new every render → everything remounts", "Correct-looking but slow, loses all state"],
      ] },
      { type: "p", text: "Keys only need to be unique among siblings, not globally. They are not passed as a prop to your component. A key can also be used deliberately to *reset* a component: changing `key={userId}` remounts it with fresh state." },
      { type: "callout", tone: "tip", text: "If items have no IDs, generate them when the data is created (e.g. when the user adds a todo), not during render." },
    ],
    example: {
      type: "code",
      lang: "tsx",
      caption: "Type into the first input, then click 'Add to top'. With index keys the typed text stays at position 0 instead of following its item.",
      code: `function List() {
  const [items, setItems] = useState([{ id: "b", label: "B" }]);
  return (
    <>
      <button onClick={() => setItems([{ id: crypto.randomUUID(), label: "New" }, ...items])}>
        Add to top
      </button>
      {items.map((item, i) => (
        <label key={i /* BUG: use item.id */}>
          {item.label} <input />
        </label>
      ))}
    </>
  );
}`,
      output: "Before: [B: \"hello\"]\nAfter (index keys): [New: \"hello\"] [B: \"\"]\nAfter (id keys):    [New: \"\"] [B: \"hello\"]",
    },
    walkthrough: [
      { title: "Render 1", detail: "One label with key 0 showing B; user types into its uncontrolled input." },
      { title: "Prepend", detail: "New render has keys 0 (New) and 1 (B)." },
      { title: "Reconcile with index keys", detail: "Key 0 exists in both → React reuses that DOM node (with its typed text) and just updates the label text to New. Key 1 is new → fresh empty input for B." },
      { title: "With id keys", detail: "Key `b` is matched to the old node and moved; the new key gets a fresh node." },
    ],
    followUps: [
      { q: "Do keys need to be globally unique?", a: "No, only among siblings in the same array." },
      { q: "How can keys reset state on purpose?", a: "Rendering `<Profile key={userId} />` makes React treat a different userId as a different component, so it remounts with fresh state." },
      { q: "Why can't I read `props.key`?", a: "`key` is consumed by React for reconciliation and isn't passed to the component; pass the id under another prop name if needed." },
    ],
    pitfalls: [
      "Using index keys for sortable/filterable lists.",
      "Generating random keys during render.",
      "Putting the key on the inner element instead of the element returned from `map`.",
    ],
    glossary: [
      { term: "Key", definition: "A sibling-unique identifier React uses to match list items across renders." },
      { term: "Uncontrolled input", definition: "An input whose value lives in the DOM rather than React state." },
      { term: "Remount", definition: "Destroying a component instance and creating a new one, losing its state." },
    ],
    relatedLessons: ["react/rendering-reconciliation", "react/virtual-dom"],
    relatedQuestions: ["react-01", "react-02"],
    sources: [REACT_LISTS, REACT_PRESERVE],
  },
  {
    id: "react-04",
    track: "react",
    number: 4,
    question: "Why do the Rules of Hooks exist?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["react", "hooks", "rules-of-hooks", "fiber"],
    shortAnswer:
      "The rules are: call hooks only at the top level of a React function component or custom hook — not inside conditions, loops, nested functions or after an early return — and only from React functions.\n\nThey exist because React doesn't identify hooks by name; it identifies them by *call order*. Each component's fiber keeps its hooks as an ordered list — conceptually a linked list. On every render, the first `useState` call reads slot 1, the second reads slot 2, and so on. If a condition skips a hook on one render, every later hook reads the wrong slot, and state gets mixed up. The ESLint plugin `eslint-plugin-react-hooks` enforces this statically.",
    deep: [
      { type: "steps", steps: [
        { title: "Mount", detail: "Each hook call appends a hook node (state, queue, deps…) to the fiber's list, in call order." },
        { title: "Update", detail: "React walks the same list with a cursor; the Nth hook call gets the Nth node." },
        { title: "Order changes", detail: "If hook #2 is skipped, hook #3 receives node #2's data — wrong type, wrong state, or React throws \"Rendered fewer hooks than expected\"." },
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Implementation detail", text: "The linked list stored on `fiber.memoizedState` is a React internal. The public contract is just the rules. The newer `use()` API is an exception: it may be called conditionally because it doesn't occupy a stateful hook slot in the same way." },
      { type: "code", lang: "js", runnable: true, caption: "A toy model of order-based hook storage.", code: `let slots = [];
let cursor = 0;
function useState(init) {
  const i = cursor++;
  if (!(i in slots)) slots[i] = init;
  return [slots[i], (v) => (slots[i] = v)];
}
function render(showAge) {
  cursor = 0;
  const [name] = useState("Ada");
  if (showAge) useState(36);
  const [city] = useState("London");
  return \`\${name} / \${city}\`;
}
console.log(render(true));
console.log(render(false));`, output: "Ada / London\nAda / 36" },
    ],
    example: {
      type: "code",
      lang: "tsx",
      caption: "The fix: always call the hook, put the condition inside it or in what you render.",
      code: `// BAD
function Profile({ user }: { user?: User }) {
  if (!user) return null;          // early return before a hook
  const [tab, setTab] = useState("posts");
  return <Tabs value={tab} onChange={setTab} />;
}

// GOOD
function Profile({ user }: { user?: User }) {
  const [tab, setTab] = useState("posts");
  if (!user) return null;
  return <Tabs value={tab} onChange={setTab} />;
}`,
    },
    walkthrough: [
      { title: "Toy model render(true)", detail: "Slots: 0 = Ada, 1 = 36, 2 = London. Output `Ada / London`." },
      { title: "render(false)", detail: "The age hook is skipped, so the city call takes cursor 1 and reads 36. Output `Ada / 36` — the bug." },
      { title: "Real React", detail: "Same failure mode, which is why the rules forbid conditional hook calls." },
    ],
    followUps: [
      { q: "Why not key hooks by name instead?", a: "Name collisions in custom hooks composing other hooks, and the need for unique keys everywhere; order-based identity keeps the API small and composable. The React team discussed this trade-off in the original hooks RFC." },
      { q: "Can custom hooks call hooks conditionally?", a: "No — a custom hook is just a function whose hook calls inline into the caller's list, so the same rules apply." },
      { q: "Are loops allowed if the count never changes?", a: "Technically it would work, but the linter forbids it because it can't prove the count is stable. Extract a child component per item instead." },
    ],
    pitfalls: [
      "Calling a hook after an early `return`.",
      "Calling hooks inside event handlers or `useEffect` callbacks.",
      "Disabling the lint rule instead of restructuring.",
    ],
    glossary: [
      { term: "Hook", definition: "A function starting with `use` that lets a component access React state or features." },
      { term: "Hook list", definition: "Per-fiber ordered storage of hook state, matched by call order." },
      { term: "Custom hook", definition: "A function that calls other hooks to package reusable stateful logic." },
    ],
    relatedLessons: ["react/hooks-internals", "react/custom-hooks", "react/rendering-reconciliation", "javascript/closures"],
    relatedQuestions: ["react-05", "react-07"],
    sources: [REACT_RULES, { label: "React RFC — Hooks (React RFC #68)", url: "https://github.com/reactjs/rfcs/pull/68", kind: "external" }],
  },
  {
    id: "react-05",
    track: "react",
    number: 5,
    question: "How do useEffect cleanup and the dependency array work?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["react", "useEffect", "cleanup", "dependencies", "strict-mode"],
    shortAnswer:
      "`useEffect(setup, deps)` runs `setup` after React commits and the browser paints. If `setup` returns a function, that's the cleanup. React compares each dependency with `Object.is`: if any changed since the last render, it runs the *previous* cleanup and then the new setup. With an empty array it runs after mount and cleans up on unmount; with no array it runs after every render.\n\nCleanup exists so effects can be undone: unsubscribe, clear timers, abort fetches, ignore stale responses. In development, StrictMode deliberately mounts, unmounts and re-mounts each component once, so setup → cleanup → setup runs — a stress test that exposes missing cleanups. It doesn't happen in production.",
    deep: [
      { type: "table", head: ["deps", "Setup runs", "Cleanup runs"], rows: [
        ["omitted", "After every commit", "Before every next setup, and on unmount"],
        ["`[]`", "After mount", "On unmount"],
        ["`[a, b]`", "After mount and whenever `a` or `b` changed (`Object.is`)", "Before re-running, and on unmount"],
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Development-only behaviour", text: "StrictMode's extra setup/cleanup cycle on mount is a development check (React 18+). Production runs setup once per mount." },
      { type: "p", text: "Each render's effect closes over that render's props and state. Missing dependencies mean the effect keeps using stale values; the `react-hooks/exhaustive-deps` lint rule catches this. Objects and functions created during render are new every time, so listing them as deps re-runs the effect every render." },
      { type: "callout", tone: "tip", text: "Many effects shouldn't exist: derive values during render, and handle user events in event handlers. Effects are for synchronizing with *external* systems." },
    ],
    example: {
      type: "code",
      lang: "tsx",
      caption: "Fetch with cleanup that prevents stale responses from overwriting newer ones. Output assumes userId changes 1 → 2 before request 1 resolves.",
      code: `function Profile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const ctrl = new AbortController();
    console.log("setup", userId);
    fetch(\`/api/users/\${userId}\`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then(setUser)
      .catch(() => {});
    return () => {
      console.log("cleanup", userId);
      ctrl.abort();
    };
  }, [userId]);
  return <p>{user?.name ?? "loading"}</p>;
}`,
      output: "setup 1\ncleanup 1\nsetup 2",
    },
    walkthrough: [
      { title: "Mount with userId=1", detail: "After paint, setup runs: logs `setup 1`, starts request 1." },
      { title: "Props change to 2", detail: "React renders, commits, sees deps changed." },
      { title: "Cleanup of previous effect", detail: "Runs with the *old* closure: logs `cleanup 1`, aborts request 1." },
      { title: "New setup", detail: "Logs `setup 2`, starts request 2. Only its result can call `setUser`." },
      { title: "In dev StrictMode", detail: "On first mount you'd additionally see `setup 1, cleanup 1, setup 1`." },
    ],
    followUps: [
      { q: "useEffect vs useLayoutEffect?", a: "`useLayoutEffect` runs synchronously after DOM mutations and before paint — use for measuring layout to avoid flicker. `useEffect` runs after paint and doesn't block it." },
      { q: "Why does my effect run in an infinite loop?", a: "It sets state that's also a dependency, or depends on an object/function recreated every render. Fix with correct deps, functional updates, or moving creation inside the effect / `useMemo`." },
      { q: "Can the effect callback be async?", a: "Not directly — it must return a cleanup function or nothing, and an async function returns a promise. Define an async function inside and call it." },
    ],
    pitfalls: [
      "Omitting dependencies to make an effect \"run once\" and reading stale values.",
      "Not cleaning up subscriptions, intervals or listeners.",
      "Treating StrictMode's double run as a bug instead of fixing missing cleanup.",
      "Using an effect to compute derived state.",
    ],
    glossary: [
      { term: "Cleanup function", definition: "Function returned from an effect that undoes its setup." },
      { term: "Dependency array", definition: "Values whose change (by `Object.is`) re-runs an effect." },
      { term: "StrictMode", definition: "Development wrapper that double-invokes renders and effects to surface impure code and missing cleanup." },
      { term: "Stale closure", definition: "A function capturing values from an older render." },
    ],
    relatedLessons: ["react/use-effect-cleanup", "react/hooks-internals", "javascript/closures", "javascript/memory-leaks-gc"],
    relatedQuestions: ["react-04", "react-06"],
    sources: [REACT_EFFECTS, REACT_NO_EFFECT, { label: "react.dev — useEffect", url: "https://react.dev/reference/react/useEffect", kind: "docs" }],
  },
  {
    id: "react-06",
    track: "react",
    number: 6,
    question: "useMemo vs useCallback vs React.memo — and when don't they help?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["react", "useMemo", "useCallback", "memo", "performance", "react-compiler"],
    shortAnswer:
      "`useMemo(fn, deps)` caches a computed *value* between renders until a dependency changes. `useCallback(fn, deps)` caches a *function* identity — it's `useMemo(() => fn, deps)`. `React.memo(Component)` wraps a component so it skips re-rendering when its props are shallowly equal.\n\nThey work together: `memo` on a child is useless if the parent passes a new object or arrow function every render, so you stabilize those with `useMemo`/`useCallback`. They don't help when the computation is cheap, when deps change every render anyway, when the child isn't memoized, or when the child re-renders because of its own state or context. They also cost memory and comparisons. The React Compiler, stable since late 2025, can insert this memoization automatically.",
    deep: [
      { type: "table", head: ["API", "Caches", "Compared with"], rows: [
        ["`useMemo`", "A value returned by a function", "Each dep via `Object.is`"],
        ["`useCallback`", "A function reference", "Each dep via `Object.is`"],
        ["`React.memo`", "A component's last render output", "Shallow prop comparison (or custom `arePropsEqual`)"],
      ] },
      { type: "list", items: [
        "**Helps:** expensive computations (sorting/filtering thousands of items), stabilizing props for a `memo` child, stabilizing a dependency of another hook's deps array.",
        "**Doesn't help:** cheap calculations; props that include fresh `children` JSX (new every render); context consumers (context changes bypass memo); deps that always change.",
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Cache semantics", text: "React may discard memoized values (e.g. during development or for offscreen components) — treat `useMemo` as a performance hint, never as a semantic guarantee. The React Compiler (1.0 released October 2025) auto-memoizes components and hooks at build time, which makes most manual memoization unnecessary in compiled code." },
    ],
    example: {
      type: "code",
      lang: "tsx",
      caption: "Without useCallback, Row re-renders on every parent render despite memo. Log shows typing in the search box with the stabilized version.",
      code: `const Row = memo(function Row({ item, onSelect }: RowProps) {
  console.log("render row", item.id);
  return <li onClick={() => onSelect(item.id)}>{item.name}</li>;
});

function Table({ items }: { items: Item[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const onSelect = useCallback((id: string) => setSelected(id), []);
  const visible = useMemo(() => items.filter((i) => i.name.includes(query)), [items, query]);
  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul>{visible.map((i) => <Row key={i.id} item={i} onSelect={onSelect} />)}</ul>
    </>
  );
}`,
      output: "(typing a character that keeps rows a and b visible)\n(no \"render row\" logs — props are shallow-equal)",
    },
    walkthrough: [
      { title: "Typing updates `query`", detail: "Table re-renders; `visible` recomputes because `query` changed — but `filter` returns the same item objects." },
      { title: "Props for each Row", detail: "`item` is the same object reference; `onSelect` is the same function thanks to `useCallback`." },
      { title: "memo comparison", detail: "Shallow-equal → Row bails out; no log." },
      { title: "Remove useCallback", detail: "`onSelect` is a new function each render → every Row re-renders and logs." },
    ],
    followUps: [
      { q: "Is useCallback a performance optimization by itself?", a: "No. Creating a function is cheap; `useCallback` only helps if something compares the function's identity (a memo child or a hook dependency)." },
      { q: "Why does my memo component still re-render?", a: "Some prop changes identity each render (inline objects, arrays, functions, JSX children), it consumes a context that changed, or its own state changed." },
      { q: "What does the React Compiler change?", a: "It analyzes components at build time and memoizes values and JSX automatically, following the Rules of React. Manual `useMemo`/`useCallback` become mostly unnecessary, though they remain valid escape hatches." },
    ],
    pitfalls: [
      "Wrapping every value in `useMemo` by default — adds overhead and noise.",
      "Using `memo` but passing inline objects/arrow functions.",
      "Relying on `useMemo` for correctness (e.g. to keep a value \"stable forever\").",
      "Forgetting dependencies, producing stale cached values.",
    ],
    glossary: [
      { term: "Memoization", definition: "Caching a result keyed by its inputs to avoid recomputation." },
      { term: "Referential equality", definition: "Two references point to the same object (`Object.is(a, b)` is true)." },
      { term: "Shallow comparison", definition: "Comparing each top-level prop with `Object.is`, without looking inside objects." },
      { term: "React Compiler", definition: "Build-time tool that automatically memoizes React components and hooks." },
    ],
    relatedLessons: ["react/memoization-hooks", "react/rendering-reconciliation", "javascript/memoization", "javascript/equality-coercion"],
    relatedQuestions: ["react-01", "react-05"],
    sources: [REACT_MEMO, REACT_MEMO_COMP, { label: "react.dev — useCallback", url: "https://react.dev/reference/react/useCallback", kind: "docs" }, REACT_COMPILER],
  },
  {
    id: "react-07",
    track: "react",
    number: 7,
    question: "Is setState synchronous? Explain batching.",
    level: "intermediate",
    frequency: "high",
    tags: ["react", "useState", "batching", "react-18", "functional-updates"],
    shortAnswer:
      "Calling a state setter doesn't change the variable you're holding — it *queues* an update and schedules a re-render. Inside the current event handler, `count` is still the value from this render; the new value appears on the next render. So in that sense it's asynchronous.\n\nReact also **batches**: multiple setState calls in the same tick produce one re-render. Before React 18 this only happened inside React event handlers; since React 18 with `createRoot`, batching is automatic everywhere — timeouts, promises, native listeners. If the next state depends on the previous one, use a functional update, `setCount(c => c + 1)`, because the updater receives the latest queued value. `flushSync` opts out when you truly need a synchronous DOM update.",
    deep: [
      { type: "steps", steps: [
        { title: "Call setter", detail: "React appends an update to that hook's queue and schedules a render." },
        { title: "Rest of handler runs", detail: "Local `count` is unchanged — it's a constant from this render's closure." },
        { title: "Batch", detail: "All updates queued in the same tick are processed together." },
        { title: "Next render", detail: "React processes the queue in order: values replace, updater functions are applied to the running result." },
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Version-dependent", text: "React 17 and earlier (or React 18 with legacy `ReactDOM.render`) batched only inside React-managed event handlers; updates in `setTimeout` or promise callbacks rendered once per call. React 18's `createRoot` made batching automatic in all contexts." },
      { type: "table", head: ["Code", "Result from count = 0"], rows: [
        ["`setCount(count + 1)` ×3", "1 — each call sees 0"],
        ["`setCount(c => c + 1)` ×3", "3 — each updater gets the previous result"],
        ["`setCount(count + 5); setCount(c => c + 1)`", "6"],
      ] },
    ],
    example: {
      type: "code",
      lang: "tsx",
      caption: "One click; logs show one render after the handler, and stale `count` inside it.",
      code: `function Counter() {
  const [count, setCount] = useState(0);
  console.log("render", count);
  function handle() {
    setCount(count + 1);
    setCount(count + 1);
    setCount((c) => c + 1);
    console.log("in handler", count);
  }
  return <button onClick={handle}>{count}</button>;
}`,
      output: "render 0\nin handler 0\nrender 2",
    },
    walkthrough: [
      { title: "Initial", detail: "`render 0`." },
      { title: "Click", detail: "Queue: replace with 1, replace with 1, updater c+1. Handler logs `in handler 0` — the closure value." },
      { title: "Batched render", detail: "Process queue: 0 → 1 → 1 → 2. One render: `render 2`." },
    ],
    followUps: [
      { q: "How do I read the new state right after setting it?", a: "Compute it into a variable first (`const next = count + 1; setCount(next); use(next)`), or react to it in the next render / an effect." },
      { q: "When would you use flushSync?", a: "Rarely — e.g. you must update the DOM synchronously before reading layout or scrolling to a newly added item. It hurts performance if overused." },
      { q: "Does setting the same value re-render?", a: "If `Object.is(old, new)` React bails out of re-rendering children (it may still call the component once before bailing)." },
    ],
    pitfalls: [
      "Expecting `count` to update immediately after `setCount`.",
      "Using `setX(x + 1)` repeatedly where a functional update is needed.",
      "Mutating an object in state and calling setState with the same reference — no re-render.",
    ],
    glossary: [
      { term: "Batching", definition: "Grouping several state updates into a single re-render." },
      { term: "Functional update", definition: "Passing a function `prev => next` to a setter so it uses the latest queued state." },
      { term: "flushSync", definition: "React DOM API forcing pending updates inside its callback to commit synchronously." },
    ],
    relatedLessons: ["react/use-state-batching", "react/hooks-internals", "react/rendering-reconciliation", "javascript/closures"],
    relatedQuestions: ["react-01", "react-04"],
    sources: [REACT_QUEUE, REACT_18, { label: "react.dev — State as a Snapshot", url: "https://react.dev/learn/state-as-a-snapshot", kind: "docs" }],
  },
  {
    id: "react-08",
    track: "react",
    number: 8,
    question: "What's the difference between Server Components, SSR and Client Components?",
    level: "advanced",
    frequency: "high",
    tags: ["react", "rsc", "ssr", "server-components", "nextjs", "hydration"],
    shortAnswer:
      "**SSR** — server-side rendering — renders your components to HTML on the server for a fast first paint; then the *same* components' JavaScript ships to the browser and **hydrates**, attaching event handlers. Everything still runs on the client too.\n\n**Server Components** are components that run *only* on the server — at build time or request time. They can be async, read databases or files directly, and their code never ships to the browser; their output is sent as a serialized React tree, the RSC payload. **Client Components**, marked by a `'use client'` boundary, are the interactive ones that can use state, effects and browser APIs; they're pre-rendered via SSR and hydrated. Props crossing from server to client must be serializable — no functions except Server Actions, no class instances. RSC and SSR are complementary: frameworks like Next.js use both.",
    deep: [
      { type: "table", head: ["", "Server Component", "Client Component", "SSR"], rows: [
        ["What it is", "A component type", "A component type", "A rendering technique"],
        ["Runs on", "Server only", "Server (for SSR) + browser", "Server producing HTML"],
        ["JS sent to browser", "None for the component", "Yes", "N/A"],
        ["State / effects / handlers", "No", "Yes", "N/A"],
        ["Data access", "Direct (DB, fs, secrets), can `await`", "Via fetch/APIs", "N/A"],
      ] },
      { type: "flow", nodes: ["Server Components render", "RSC payload (serialized tree + client refs)", "SSR renders HTML", "Browser shows HTML", "Client JS hydrates client components"], caption: "Conceptual Next.js App Router pipeline for a first request." },
      { type: "callout", tone: "spec-vs-impl", title: "Framework detail", text: "React defines Server Components and the `'use client'`/`'use server'` directives; bundling, routing, streaming and caching are provided by frameworks (e.g. Next.js App Router). The RSC payload format is an implementation detail." },
      { type: "p", text: "`'use client'` marks a *boundary*: that module and everything it imports become client code. A Client Component can still render Server Components passed in as `children` props, which is how you keep most of the tree on the server." },
    ],
    example: {
      type: "code",
      lang: "tsx",
      caption: "Server Component fetches data; only the small interactive button ships JS.",
      code: `// app/posts/page.tsx — Server Component (default in Next.js App Router)
import { LikeButton } from "./like-button";
export default async function Posts() {
  const posts = await db.post.findMany(); // runs on server; never bundled
  return posts.map((p) => (
    <article key={p.id}>
      <h2>{p.title}</h2>
      <LikeButton postId={p.id} />{/* serializable prop */}
    </article>
  ));
}

// app/posts/like-button.tsx
"use client";
import { useState } from "react";
export function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false);
  return <button onClick={() => setLiked(!liked)}>{liked ? "♥" : "♡"}</button>;
}`,
    },
    walkthrough: [
      { title: "Request", detail: "Server runs `Posts`, awaiting the DB query." },
      { title: "Serialize", detail: "Output tree is encoded; `LikeButton` appears as a reference to a client module plus its props `{ postId }`." },
      { title: "SSR", detail: "The tree, including LikeButton's initial render, becomes HTML for fast first paint." },
      { title: "Hydrate", detail: "Browser loads only LikeButton's JS and attaches the click handler. `db` code is never shipped." },
    ],
    followUps: [
      { q: "Can a Client Component import a Server Component?", a: "Not directly — importing it would turn it into client code. Pass the Server Component as `children` or another prop from a server parent." },
      { q: "Why must props be serializable?", a: "They cross a network boundary inside the RSC payload. Functions, class instances and Symbols can't be encoded (Server Actions are the special case: they're passed as references to server endpoints)." },
      { q: "Do Server Components replace APIs?", a: "For reads within your own app, often yes. You still need APIs for third-party clients, mobile apps or webhooks." },
    ],
    pitfalls: [
      "Treating SSR and Server Components as the same thing.",
      "Adding `'use client'` at the top of a large tree and shipping everything.",
      "Passing functions or Dates/class instances as props across the boundary (Dates are serializable in RSC; class instances are not — check what your version supports).",
      "Leaking secrets by importing server-only modules into client files (use the `server-only` package).",
    ],
    glossary: [
      { term: "Hydration", definition: "Attaching React's event handlers and state to server-rendered HTML in the browser." },
      { term: "RSC payload", definition: "Serialized output of Server Components plus references to client modules." },
      { term: "'use client'", definition: "Directive marking a module as the entry to client-side code." },
      { term: "Server Action", definition: "An async server function (`'use server'`) callable from the client by reference." },
    ],
    relatedLessons: ["react/server-components", "react/component-placement", "react/rendering-reconciliation"],
    relatedQuestions: ["react-01"],
    sources: [REACT_RSC, REACT_USE_CLIENT, { label: "Next.js — Server and Client Components", url: "https://nextjs.org/docs/app/getting-started/server-and-client-components", kind: "docs" }],
  },

  // ───────────────────────────── TypeScript ─────────────────────────────
  {
    id: "ts-01",
    track: "typescript",
    number: 1,
    question: "What's the difference between `type` and `interface` in TypeScript?",
    level: "beginner",
    frequency: "very-high",
    tags: ["typescript", "types", "interfaces", "declaration-merging"],
    shortAnswer:
      "Both can describe object shapes, and for most object types they're interchangeable. The differences: an `interface` can only describe object-like types and can be *reopened* — two declarations with the same name merge, which is how libraries augment globals like `Window`. It extends with `extends`, and the compiler reports conflicts there clearly.\n\nA `type` alias can name *any* type — unions, intersections, primitives, tuples, mapped and conditional types — but can't be reopened; declaring it twice is an error. Common guidance, including the TypeScript handbook's: use `interface` for public object shapes you expect to extend, and `type` when you need unions or type-level computation. Consistency within a codebase matters more than the choice.",
    deep: [
      { type: "table", head: ["Capability", "interface", "type"], rows: [
        ["Object shapes", "Yes", "Yes"],
        ["Unions / primitives / tuples", "No", "Yes"],
        ["Mapped & conditional types", "No", "Yes"],
        ["Declaration merging", "Yes", "No (duplicate identifier error)"],
        ["Extend", "`extends` (checks compatibility, errors on conflicts)", "`&` intersection (conflicting props may become `never`)"],
        ["`class implements`", "Yes", "Yes, if it resolves to an object type"],
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Compiler detail", text: "The TypeScript team has noted that interfaces can be slightly cheaper for the checker because `extends` relationships are cached, whereas large intersections are re-computed. This is a compiler performance detail, only noticeable in very large codebases." },
      { type: "p", text: "Declaration merging is a feature and a hazard: it lets you augment third-party types (`declare module 'express' { interface Request { user?: User } }`), but an accidental second interface with the same name silently merges." },
    ],
    example: {
      type: "code",
      lang: "ts",
      caption: "Interfaces merge; type aliases can express unions.",
      code: `interface User { id: string }
interface User { name: string }          // merges
const u: User = { id: "1", name: "Ada" }; // both required

type Status = "idle" | "loading" | "error"; // interface can't do this
type Result = { ok: true; data: User } | { ok: false; error: string };

// type User2 = { id: string };
// type User2 = { name: string };       // Error: Duplicate identifier 'User2'`,
    },
    walkthrough: [
      { title: "Two `interface User` blocks", detail: "The compiler merges them into one with both `id` and `name`." },
      { title: "`Status`", detail: "A union of string literals — only a type alias can name it." },
      { title: "`Result`", detail: "A discriminated union; narrowing on `ok` gives the right branch." },
      { title: "Duplicate type alias", detail: "Compile-time error: aliases are not open." },
    ],
    followUps: [
      { q: "Can an interface extend a type alias?", a: "Yes, if the alias is an object type (or intersection of object types). It can't extend a union." },
      { q: "What happens with conflicting properties in an intersection?", a: "For `{ a: string } & { a: number }`, `a` becomes `string & number`, i.e. `never`, so the type is unusable — often without an error at the declaration site. `extends` would report the conflict immediately." },
      { q: "Which do you prefer?", a: "A good answer: interfaces for object contracts, especially public/extended ones; type aliases for unions, utility and computed types — and follow the codebase's lint rule (e.g. `@typescript-eslint/consistent-type-definitions`)." },
    ],
    pitfalls: [
      "Claiming one is strictly more powerful for objects — they're mostly equivalent.",
      "Forgetting interfaces merge, causing surprise fields from globals or other files.",
      "Using intersections to \"override\" a property type (results in `never`).",
    ],
    glossary: [
      { term: "Type alias", definition: "A name for any type, declared with `type`." },
      { term: "Declaration merging", definition: "Combining multiple declarations with the same name into one (interfaces, namespaces)." },
      { term: "Intersection type", definition: "`A & B` — a value must satisfy both." },
    ],
    relatedLessons: ["typescript/types-vs-interfaces", "typescript/structural-typing", "typescript/utility-types"],
    relatedQuestions: ["ts-05", "ts-03"],
    sources: [TS_OBJECTS, { label: "TypeScript Handbook — Declaration Merging", url: "https://www.typescriptlang.org/docs/handbook/declaration-merging.html", kind: "docs" }],
  },
  {
    id: "ts-02",
    track: "typescript",
    number: 2,
    question: "Explain generics and generic constraints.",
    level: "intermediate",
    frequency: "very-high",
    tags: ["typescript", "generics", "constraints", "keyof", "inference"],
    shortAnswer:
      "Generics let you write code that works over many types while preserving the relationship between them. `function first<T>(xs: T[]): T | undefined` says: whatever element type you pass in, you get that same type out — unlike `any`, which throws the information away. TypeScript usually infers `T` from the arguments.\n\nA **constraint**, `T extends Something`, limits what `T` can be so you can safely use its members — for example `<T extends { length: number }>` lets you read `.length`. A classic combination is `<T, K extends keyof T>(obj: T, key: K): T[K]`, which type-checks property access and returns the exact property type. Generics exist only at compile time; they're erased from the emitted JavaScript.",
    deep: [
      { type: "list", items: [
        "**Type parameter**: `T` in `function f<T>(x: T)` — a placeholder filled per call.",
        "**Inference**: TS infers `T` from arguments; you can pass it explicitly (`f<string>(...)`).",
        "**Constraint**: `T extends U` — T must be assignable to U.",
        "**Default**: `<T = string>` — used when not inferred or provided.",
        "**Generic types**: `interface Box<T> { value: T }`, `Promise<T>`, `Array<T>`.",
      ] },
      { type: "callout", tone: "tip", text: "Rule of thumb from the handbook: a type parameter should appear at least twice (e.g. in an input and the output). If it appears once, you probably don't need a generic." },
      { type: "callout", tone: "spec-vs-impl", title: "Type erasure", text: "TypeScript generics are erased at compile time; there's no runtime `T` to inspect (unlike C# reified generics). Runtime checks need values, e.g. type guards or schema validators." },
    ],
    example: {
      type: "code",
      lang: "ts",
      caption: "Constraint with keyof keeps property access type-safe.",
      code: `function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: 1, name: "Ada" };
const n = getProp(user, "name");   // n: string
const i = getProp(user, "id");     // i: number
// getProp(user, "email");         // Error: '"email"' not assignable to '"id" | "name"'
console.log(n, i);`,
      output: "Ada 1",
    },
    walkthrough: [
      { title: "Infer T", detail: "From `user`, T = `{ id: number; name: string }`." },
      { title: "Constrain K", detail: "`keyof T` = `\"id\" | \"name\"`; the literal `\"name\"` fits." },
      { title: "Return type", detail: "Indexed access `T[K]` = `string` for `\"name\"`." },
      { title: "Invalid key", detail: "`\"email\"` is not in `keyof T` → compile error, no runtime cost." },
    ],
    followUps: [
      { q: "Why not just use any?", a: "`any` disables checking and loses the input-output relationship; generics keep full types for callers." },
      { q: "What is a conditional type?", a: "`T extends U ? X : Y`, a type-level if. With `infer` it can extract parts of types, e.g. `ReturnType<F>`." },
      { q: "What does `const` on a type parameter do?", a: "`<const T>` (TS 5.0+) infers the narrowest literal/readonly types, as if the caller had written `as const`." },
    ],
    pitfalls: [
      "Generic parameters used only once (no relationship to preserve).",
      "Over-constraining so callers can't pass valid types.",
      "Expecting to check `T` at runtime.",
    ],
    glossary: [
      { term: "Type parameter", definition: "A placeholder type in angle brackets, filled per use." },
      { term: "Constraint", definition: "`extends` bound restricting what a type parameter can be." },
      { term: "keyof", definition: "Operator producing the union of a type's property names." },
      { term: "Indexed access type", definition: "`T[K]` — the type of property K on T." },
    ],
    relatedLessons: ["typescript/generics", "typescript/utility-types", "typescript/narrowing"],
    relatedQuestions: ["ts-04", "ts-01"],
    sources: [TS_GENERICS, { label: "TypeScript Handbook — Keyof Type Operator", url: "https://www.typescriptlang.org/docs/handbook/2/keyof-types.html", kind: "docs" }],
  },
  {
    id: "ts-03",
    track: "typescript",
    number: 3,
    question: "Enums vs union literal types / `as const` — which should you use?",
    level: "intermediate",
    frequency: "high",
    tags: ["typescript", "enums", "union-types", "as-const"],
    shortAnswer:
      "TypeScript `enum`s are one of the few features that generate runtime JavaScript: a numeric enum compiles to an object with a reverse mapping, and string enums to a plain object. They're *nominal-ish* — you can't pass the string `\"Active\"` where `Status.Active` is expected — and numeric enums accept any number, which is a type hole.\n\nMany teams prefer a union of string literals, `type Status = \"active\" | \"inactive\"`, which has zero runtime cost and works with plain JSON values. When you also need the values at runtime, use an `as const` object and derive the type from it. Enums also don't work with Node's built-in type stripping or `erasableSyntaxOnly`, which pushes the ecosystem further toward unions.",
    deep: [
      { type: "table", head: ["", "enum", "union literal", "`as const` object"], rows: [
        ["Runtime code", "Yes (object, reverse map for numeric)", "None", "The object you wrote"],
        ["Accepts raw string `\"active\"`", "No (string enums)", "Yes", "Yes (via derived type)"],
        ["Iterate values", "Yes (with numeric reverse-map quirks)", "No", "`Object.values(obj)`"],
        ["Works with type stripping (`--erasableSyntaxOnly`, Node strip-types)", "No", "Yes", "Yes"],
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Version notes", text: "`erasableSyntaxOnly` arrived in TypeScript 5.8; Node's type stripping (unflagged in Node 23.6 / 22.18) only removes erasable syntax, so enums, namespaces with values and parameter properties need transformation. Since TS 5.0, numeric enums are stricter about out-of-range literal assignments, but `number` variables are still assignable." },
      { type: "p", text: "`const enum` inlines values at use sites and emits nothing, but breaks with isolated per-file transpilers (Babel, esbuild, swc) and `isolatedModules`, so it's discouraged in libraries." },
    ],
    example: {
      type: "code",
      lang: "ts",
      caption: "The as-const pattern: one source of truth for runtime values and the type.",
      code: `const Status = {
  Active: "active",
  Inactive: "inactive",
} as const;
type Status = (typeof Status)[keyof typeof Status]; // "active" | "inactive"

function setStatus(s: Status) { return s.toUpperCase(); }

console.log(setStatus(Status.Active));
console.log(setStatus("inactive"));      // plain string literal works too
console.log(Object.values(Status).join("|"));

enum Num { A, B }
console.log(Num[0], Num.B);               // reverse mapping`,
      output: "ACTIVE\nINACTIVE\nactive|inactive\nA 1",
    },
    walkthrough: [
      { title: "`as const`", detail: "Makes properties readonly and their types literal (`\"active\"`, not `string`)." },
      { title: "Derive the union", detail: "`typeof Status` gets the object's type; indexing by `keyof` yields the value union." },
      { title: "Usage", detail: "Both `Status.Active` and the raw literal type-check." },
      { title: "Numeric enum", detail: "Emits `Num[Num[\"A\"] = 0] = \"A\"`, so `Num[0]` is `\"A\"`." },
    ],
    followUps: [
      { q: "Are there good reasons to use enums?", a: "Existing codebases that use them, or wanting nominal-like safety where raw strings shouldn't be accepted. Both are reasonable; just know the costs." },
      { q: "Why is the numeric enum a type hole?", a: "Any `number`-typed value is assignable to a numeric enum type, so `const s: Num = someNumber` compiles even if out of range." },
      { q: "What's `satisfies` useful for here?", a: "`const x = {...} as const satisfies Record<string, string>` checks the object against a type without widening the inferred literal types." },
    ],
    pitfalls: [
      "Iterating a numeric enum with `Object.keys` and getting both names and numbers.",
      "Using `const enum` in a library compiled per-file.",
      "Forgetting `as const`, so values widen to `string`.",
    ],
    glossary: [
      { term: "Literal type", definition: "A type with exactly one value, e.g. `\"active\"` or `42`." },
      { term: "as const", definition: "Assertion making a literal deeply readonly with the narrowest literal types." },
      { term: "Reverse mapping", definition: "Numeric enums map value → name as well as name → value." },
      { term: "Erasable syntax", definition: "TypeScript syntax that can be removed without changing runtime behaviour." },
    ],
    relatedLessons: ["typescript/enums", "typescript/narrowing", "go/enums-iota"],
    relatedQuestions: ["ts-01", "ts-05"],
    sources: [TS_ENUMS, TS_ERASABLE, { label: "Node.js — Running TypeScript natively", url: "https://nodejs.org/en/learn/typescript/run-natively", kind: "docs" }],
  },
  {
    id: "ts-04",
    track: "typescript",
    number: 4,
    question: "What's the difference between `any`, `unknown` and `never`?",
    level: "intermediate",
    frequency: "high",
    tags: ["typescript", "any", "unknown", "never", "narrowing", "type-safety"],
    shortAnswer:
      "`any` turns off type checking: you can do anything with it, and it's assignable to and from everything, so errors spread silently. `unknown` is the safe top type: anything can be assigned *to* it, but you can't use it — call it, read properties, pass it as a `string` — until you narrow it with a check like `typeof`, `instanceof`, or a type guard. Use it for untrusted input like `JSON.parse` results or caught errors.\n\n`never` is the bottom type: no value has it. It's the return type of functions that always throw or never finish, what's left after you've narrowed away every case, and it's used for exhaustiveness checks — assigning a leftover value to `never` turns a forgotten union case into a compile error.",
    deep: [
      { type: "table", head: ["", "any", "unknown", "never"], rows: [
        ["Assign anything to it", "Yes", "Yes", "No"],
        ["Assign it to other types", "Yes (unsafe)", "Only to `unknown`/`any`", "Yes (to everything)"],
        ["Use members without checks", "Yes", "No", "N/A (unreachable)"],
        ["Position in type hierarchy", "Escape hatch (both top and bottom)", "Top", "Bottom"],
      ] },
      { type: "p", text: "With `useUnknownInCatchVariables` (part of `strict` since TS 4.4), `catch (e)` gives `e: unknown`, forcing you to check `e instanceof Error` before reading `e.message`." },
      { type: "callout", tone: "tip", text: "`never` in a union disappears: `string | never` is `string`. That's what makes conditional types like `Exclude<T, U>` work." },
    ],
    example: {
      type: "code",
      lang: "ts",
      caption: "Exhaustiveness checking with never.",
      code: `type Shape = { kind: "circle"; r: number } | { kind: "square"; s: number };

function area(sh: Shape): number {
  switch (sh.kind) {
    case "circle": return Math.PI * sh.r ** 2;
    case "square": return sh.s ** 2;
    default: {
      const unreachable: never = sh; // error here if a new kind is added
      throw new Error("unknown shape " + unreachable);
    }
  }
}

const raw: unknown = JSON.parse('{"kind":"square","s":3}');
// area(raw);                       // Error: unknown not assignable to Shape
if (typeof raw === "object" && raw !== null && "kind" in raw) {
  console.log(area(raw as Shape));
}`,
      output: "9",
    },
    walkthrough: [
      { title: "Switch narrows", detail: "In each case `sh` is narrowed to one variant; in `default` nothing is left, so `sh: never`." },
      { title: "Adding `triangle`", detail: "`default` would then see the triangle type, which isn't assignable to `never` → compile error pointing at the missing case." },
      { title: "unknown input", detail: "Must be checked before use; here a minimal structural check then an assertion (a schema validator would be safer)." },
    ],
    followUps: [
      { q: "When is `any` acceptable?", a: "Migration from JS, or truly dynamic interop where you immediately wrap it in a typed boundary. Prefer `unknown` plus validation." },
      { q: "What's a user-defined type guard?", a: "A function returning `x is T`; when it returns true, TS narrows `x` to `T` in that branch." },
      { q: "Why is `never` assignable to everything?", a: "It's the empty set; an empty set is a subset of every set, so a value of type never (which can't exist) trivially satisfies any type." },
    ],
    pitfalls: [
      "Using `as` casts on `unknown` without any validation — that's `any` with extra steps.",
      "Leaving implicit `any` on (turn on `noImplicitAny` / `strict`).",
      "Confusing `never` with `void` — `void` functions return (undefined); `never` functions don't return.",
    ],
    glossary: [
      { term: "Top type", definition: "A type every value is assignable to (`unknown`)." },
      { term: "Bottom type", definition: "A type with no values, assignable to all types (`never`)." },
      { term: "Narrowing", definition: "Refining a type within a code path using checks the compiler understands." },
      { term: "Exhaustiveness check", definition: "Making the compiler prove all cases of a union are handled." },
    ],
    relatedLessons: ["typescript/narrowing", "typescript/strict-mode", "typescript/generics"],
    relatedQuestions: ["ts-02", "ts-05"],
    sources: [TS_NARROWING, { label: "TypeScript Handbook — More on Functions (unknown, never)", url: "https://www.typescriptlang.org/docs/handbook/2/functions.html", kind: "docs" }],
  },
  {
    id: "ts-05",
    track: "typescript",
    number: 5,
    question: "What is structural typing in TypeScript? How do excess property checks and branded types fit in?",
    level: "intermediate",
    frequency: "medium",
    tags: ["typescript", "structural-typing", "excess-property-checks", "branding"],
    shortAnswer:
      "TypeScript compares types by *shape*, not by name: if a value has at least the properties a type requires, with compatible types, it's assignable — even if it was declared as a completely different interface or class. That's structural typing, and it matches how JavaScript code is actually written — duck typing.\n\nOne exception feels nominal: **excess property checks**. When you pass a *fresh object literal* directly, TS errors on unknown properties to catch typos; assign it to a variable first and the check doesn't apply. When you need two structurally identical types to be incompatible — `UserId` vs `OrderId`, both strings — you use **branding**: intersect with a phantom property like `string & { readonly __brand: \"UserId\" }`.",
    deep: [
      { type: "compare", items: [
        { title: "Structural (TypeScript, Go interfaces)", points: ["Compatibility by members", "No `implements` needed", "Easy interop with plain objects/JSON"] },
        { title: "Nominal (Java, C#, Rust structs)", points: ["Compatibility by declared name/hierarchy", "Same shape ≠ same type", "Prevents mixing semantically different values"] },
      ] },
      { type: "list", items: [
        "Classes are compared structurally too — except members declared `private`/`protected` (or `#private`), which make classes effectively nominal.",
        "Function parameter types are checked contravariantly under `strictFunctionTypes` (for function-typed properties, not method shorthand).",
        "Excess property checks apply only to fresh object literals assigned to a target type.",
      ] },
      { type: "callout", tone: "note", text: "Branding exists purely at the type level: at runtime a `UserId` is just a string. You create branded values through a function or an `as` cast at a validated boundary." },
    ],
    example: {
      type: "code",
      lang: "ts",
      caption: "Structural compatibility, excess property checks and a brand.",
      code: `interface Point { x: number; y: number }
class Vec { constructor(public x: number, public y: number, public z = 0) {} }

const p: Point = new Vec(1, 2);          // OK: Vec has x and y
// const q: Point = { x: 1, y: 2, z: 3 }; // Error: object literal may only specify known properties
const tmp = { x: 1, y: 2, z: 3 };
const q: Point = tmp;                    // OK: not a fresh literal

type UserId = string & { readonly __brand: "UserId" };
type OrderId = string & { readonly __brand: "OrderId" };
const userId = (s: string) => s as UserId;
function loadUser(id: UserId) { return "user " + id; }

console.log(p.x + q.y);
console.log(loadUser(userId("u_1")));
// loadUser("u_1" as OrderId);           // Error: OrderId not assignable to UserId`,
      output: "3\nuser u_1",
    },
    walkthrough: [
      { title: "Vec → Point", detail: "Vec has `x: number` and `y: number` (plus `z`), so it's assignable." },
      { title: "Fresh literal with `z`", detail: "Excess property check flags `z` as a likely mistake." },
      { title: "Via a variable", detail: "No freshness → only structural check → OK." },
      { title: "Brands", detail: "`__brand` literal types differ, so UserId and OrderId are mutually incompatible, though both are strings at runtime." },
    ],
    followUps: [
      { q: "Why does TS use structural typing?", a: "JavaScript code routinely uses anonymous object literals and duck typing; structural typing describes that without forcing class hierarchies." },
      { q: "How does Go compare?", a: "Go interfaces are satisfied structurally (implicitly), but Go named struct types are nominal — two structs with identical fields are different types without conversion." },
      { q: "How do you make a class nominal?", a: "Add a private member (e.g. `#brand`). Classes with private members are only compatible with instances from the same declaration." },
    ],
    pitfalls: [
      "Assuming `implements` is required for compatibility.",
      "Expecting excess property checks on non-literal values.",
      "Relying on brands as runtime validation — they're compile-time only.",
    ],
    glossary: [
      { term: "Structural typing", definition: "Type compatibility determined by members, not declared names." },
      { term: "Excess property check", definition: "Error when a fresh object literal has properties the target type doesn't declare." },
      { term: "Branded type", definition: "A type made artificially distinct with a phantom property to emulate nominal typing." },
    ],
    relatedLessons: ["typescript/structural-typing", "typescript/types-vs-interfaces", "go/interfaces"],
    relatedQuestions: ["ts-01", "ts-04"],
    sources: [TS_COMPAT, { label: "TypeScript Handbook — Object Types (excess property checks)", url: "https://www.typescriptlang.org/docs/handbook/2/objects.html", kind: "docs" }],
  },

  // ───────────────────────────── Networks ─────────────────────────────
  {
    id: "net-01",
    track: "networks",
    number: 1,
    question: "What happens when you type a URL into the browser and press Enter?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["networks", "dns", "tcp", "tls", "http", "browser"],
    shortAnswer:
      "The browser parses the URL, checks whether it can use a cached response or an already-open connection, and otherwise resolves the hostname with **DNS**: browser cache, OS cache, then a recursive resolver that walks root, TLD and authoritative servers. With the IP it opens a **TCP** connection with a three-way handshake — or a QUIC connection over UDP for HTTP/3 — and does a **TLS** handshake to authenticate the server's certificate and agree on keys.\n\nIt sends an **HTTP** request; on the server side this typically passes through a CDN or load balancer to an application that may hit caches and databases. The response streams back; the browser parses HTML, discovers CSS, JS and images, fetching them over the same connection, builds the DOM and CSSOM, runs scripts, lays out and paints.",
    deep: [
      { type: "viz", id: "sys-request-flow", caption: "DNS → TCP → TLS → load balancer → app → cache → DB (conceptual)." },
      { type: "steps", steps: [
        { title: "URL parsing & HSTS", detail: "Scheme, host, port, path. If the host is on the HSTS list, `http` is upgraded to `https` before any request." },
        { title: "Caches", detail: "HTTP cache may satisfy the request outright; an existing keep-alive / HTTP/2 connection may be reused." },
        { title: "DNS", detail: "Stub resolver → recursive resolver → root → TLD (`.com`) → authoritative; answer cached per TTL." },
        { title: "Transport", detail: "TCP SYN, SYN-ACK, ACK (1 RTT), or QUIC handshake combined with TLS for HTTP/3." },
        { title: "TLS 1.3", detail: "ClientHello/ServerHello, certificate verification, keys derived; 1 RTT (0-RTT on resumption)." },
        { title: "HTTP request/response", detail: "`GET /` with headers; edge/CDN, load balancer, app server, caches, DB; status + headers + body back." },
        { title: "Rendering", detail: "Parse HTML → DOM, CSS → CSSOM, run JS, layout, paint, composite; subresources fetched in parallel." },
      ] },
      { type: "callout", tone: "spec-vs-impl", text: "Exact order and shortcuts vary by browser: speculative DNS prefetch and preconnect, Happy Eyeballs (racing IPv6/IPv4), HTTPS DNS records advertising HTTP/3, and connection coalescing are browser implementation choices." },
    ],
    example: {
      type: "code",
      lang: "bash",
      caption: "curl can print timing for each phase. Numbers are illustrative.",
      code: `curl -s -o /dev/null -w 'dns=%{time_namelookup} tcp=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} total=%{time_total}\\n' https://example.com`,
      output: "dns=0.012 tcp=0.031 tls=0.068 ttfb=0.120 total=0.121",
    },
    walkthrough: [
      { title: "dns", detail: "Time until the name resolved." },
      { title: "tcp", detail: "Cumulative time when the TCP handshake completed (~1 RTT after DNS)." },
      { title: "tls", detail: "Cumulative time when TLS finished." },
      { title: "ttfb", detail: "Time to first byte: request sent + server processing + first response byte." },
    ],
    followUps: [
      { q: "How would you make this faster?", a: "Fewer round trips: connection reuse, HTTP/2 or HTTP/3, TLS 1.3 / session resumption, a CDN close to users, `preconnect`/`dns-prefetch` hints, caching headers, and smaller critical resources." },
      { q: "What's the difference between recursive and iterative DNS resolution?", a: "The client asks a recursive resolver for the final answer; that resolver queries root/TLD/authoritative servers iteratively, each returning a referral, until it gets the answer." },
      { q: "Where does a load balancer fit?", a: "After DNS points to it (often an anycast/CDN edge); it terminates or passes through TLS and forwards to healthy app instances." },
    ],
    pitfalls: [
      "Skipping TLS or describing DNS as a single lookup.",
      "Forgetting caches and connection reuse — most requests skip several steps.",
      "Ignoring the server side (load balancer, app, DB) or the rendering pipeline.",
    ],
    glossary: [
      { term: "RTT", definition: "Round-trip time — time for a packet to go to the peer and a response to come back." },
      { term: "Recursive resolver", definition: "DNS server that resolves names on a client's behalf and caches results." },
      { term: "HSTS", definition: "HTTP Strict Transport Security — tells browsers to only use HTTPS for a host." },
      { term: "TTFB", definition: "Time to first byte of the response." },
    ],
    relatedLessons: ["networks/dns", "networks/tcp", "networks/tls-handshake", "networks/http", "networks/http-caching", "system-design/dns-tcp-lb-firewalls"],
    relatedQuestions: ["net-02", "net-03", "net-05"],
    sources: [MDN_NAV, RFC9110, { label: "Julia Evans — Networking zines", url: "https://wizardzines.com/zines/networking/", kind: "external" }],
  },
  {
    id: "net-02",
    track: "networks",
    number: 2,
    question: "TCP vs UDP — what's the difference and when would you use each?",
    level: "beginner",
    frequency: "very-high",
    tags: ["networks", "tcp", "udp", "transport-layer"],
    shortAnswer:
      "Both are transport protocols on top of IP. **TCP** is connection-oriented: a three-way handshake, then a reliable, ordered byte stream. It numbers bytes, retransmits lost segments, and does flow control — don't overwhelm the receiver — and congestion control — don't overwhelm the network. The cost is handshake latency and head-of-line blocking: one lost packet stalls everything behind it.\n\n**UDP** sends independent datagrams with just ports and a checksum: no connection, no ordering, no retransmission, no congestion control. It's lower latency and preserves message boundaries. Use TCP for web, APIs, databases, file transfer; use UDP for DNS queries, real-time voice, video and games, and as the base for protocols that build their own reliability — QUIC, which HTTP/3 runs on.",
    deep: [
      { type: "table", head: ["", "TCP", "UDP"], rows: [
        ["Connection", "Yes (handshake, state on both ends)", "No"],
        ["Reliability", "Acks + retransmission", "None (app decides)"],
        ["Ordering", "In-order byte stream", "Datagrams may arrive out of order or duplicated"],
        ["Message boundaries", "No (stream — you must frame messages)", "Yes (one send = one datagram)"],
        ["Flow / congestion control", "Yes (receive window; e.g. CUBIC/BBR)", "No"],
        ["Header", "20–60 bytes", "8 bytes"],
        ["Typical uses", "HTTP/1.1, HTTP/2, SSH, databases", "DNS, VoIP, games, QUIC/HTTP/3, DHCP"],
      ] },
      { type: "callout", tone: "misconception", text: "\"UDP is faster\" is imprecise. UDP has no handshake and no waiting for retransmits, so latency can be lower, but raw throughput depends on the application's own pacing and congestion handling." },
      { type: "callout", tone: "spec-vs-impl", text: "Congestion control algorithms (Reno, CUBIC — Linux default — BBR) are implementation choices layered on the TCP spec (RFC 9293 and related RFCs)." },
    ],
    example: {
      type: "code",
      lang: "js",
      caption: "Node-only. TCP is a stream: two writes may arrive as one 'data' chunk. Output shown is typical on localhost, not guaranteed.",
      code: `const net = require("node:net");

const server = net.createServer((sock) => {
  sock.on("data", (d) => console.log("chunk:", JSON.stringify(d.toString())));
  sock.on("end", () => server.close());
}).listen(4000, () => {
  const c = net.connect(4000, () => {
    c.write("hello ");
    c.write("world");
    c.end();
  });
});`,
      output: "chunk: \"hello world\"",
    },
    walkthrough: [
      { title: "Connect", detail: "Three-way handshake on localhost." },
      { title: "Two writes", detail: "The kernel may coalesce them into one segment / one read." },
      { title: "One data event", detail: "TCP preserves bytes and order, not message boundaries — protocols add framing (length prefixes, delimiters)." },
      { title: "UDP contrast", detail: "With `dgram`, each `send` arrives as exactly one message — or not at all." },
    ],
    followUps: [
      { q: "What is head-of-line blocking in TCP?", a: "Because TCP delivers bytes in order, a lost segment holds back all later data until it's retransmitted, even if that data belongs to independent HTTP/2 streams." },
      { q: "Flow control vs congestion control?", a: "Flow control protects the *receiver* (advertised receive window). Congestion control protects the *network* (sender's congestion window reacting to loss/delay)." },
      { q: "Why does DNS use UDP?", a: "Queries are small and a single round trip; no handshake is cheaper. It falls back to TCP for large responses (and zone transfers)." },
    ],
    pitfalls: [
      "Assuming one `write` equals one `read` on TCP.",
      "Saying UDP is \"unreliable so never use it for important data\" — QUIC builds reliability on it.",
      "Confusing flow control with congestion control.",
    ],
    glossary: [
      { term: "Segment", definition: "A TCP unit of data with a header (sequence/ack numbers, flags, window)." },
      { term: "Datagram", definition: "A self-contained UDP message." },
      { term: "Congestion window", definition: "Sender-side limit on unacknowledged data, adapted to network conditions." },
      { term: "QUIC", definition: "Encrypted, multiplexed transport over UDP used by HTTP/3." },
    ],
    relatedLessons: ["networks/tcp", "networks/udp", "networks/osi-tcp-ip", "networks/http"],
    relatedQuestions: ["net-03", "net-01"],
    sources: [RFC9293, RFC768, RFC9000],
  },
  {
    id: "net-03",
    track: "networks",
    number: 3,
    question: "What changed between HTTP/1.1, HTTP/2 and HTTP/3?",
    level: "intermediate",
    frequency: "high",
    tags: ["networks", "http", "http2", "http3", "quic", "multiplexing"],
    shortAnswer:
      "The semantics — methods, status codes, headers — are the same across all three, defined in RFC 9110; what changed is how messages travel.\n\n**HTTP/1.1** is text-based with persistent keep-alive connections, but one request at a time per connection, so browsers open about six connections per host. **HTTP/2** is binary and *multiplexes* many streams over one TCP connection, with HPACK header compression — this removes HTTP-level head-of-line blocking, but a lost TCP packet still stalls every stream. **HTTP/3** runs over QUIC on UDP: streams are independent at the transport level, so loss on one doesn't block others; TLS 1.3 is built in; handshakes are faster; and connections can survive network changes, like Wi-Fi to cellular, via connection IDs.",
    deep: [
      { type: "table", head: ["", "HTTP/1.1", "HTTP/2", "HTTP/3"], rows: [
        ["Transport", "TCP (+TLS)", "TCP + TLS (h2) in practice", "QUIC over UDP (TLS 1.3 built in)"],
        ["Framing", "Text", "Binary frames", "Binary frames on QUIC streams"],
        ["Concurrency", "One in-flight request per connection (pipelining unused)", "Many streams on one connection", "Many independent streams"],
        ["Header compression", "None", "HPACK", "QPACK"],
        ["HOL blocking", "HTTP and TCP level", "TCP level only", "Removed at transport (per-stream)"],
        ["Spec", "RFC 9112", "RFC 9113", "RFC 9114"],
      ] },
      { type: "callout", tone: "spec-vs-impl", text: "HTTP/2 server push is defined in RFC 9113 but browsers have removed support (Chrome disabled it in 2022). HTTP/2 over cleartext (h2c) exists but browsers only use h2 over TLS. Browsers discover HTTP/3 via `Alt-Svc` headers or HTTPS DNS records." },
      { type: "p", text: "Domain sharding and sprite sheets were HTTP/1.1 workarounds for the connection limit; with HTTP/2+ they're usually counterproductive because they defeat multiplexing and compression." },
    ],
    example: {
      type: "code",
      lang: "bash",
      caption: "Check which protocol a server negotiates. Output is illustrative and depends on the server and your curl build.",
      code: `curl -sI --http2 https://example.com -o /dev/null -w '%{http_version}\\n'
curl -sI --http3 https://cloudflare.com -o /dev/null -w '%{http_version}\\n'`,
      output: "2\n3",
    },
    walkthrough: [
      { title: "ALPN", detail: "During TLS, the client offers `h2` and `http/1.1`; the server picks one." },
      { title: "HTTP/3", detail: "Requires a curl built with QUIC support; the client connects over UDP 443." },
      { title: "Reading the result", detail: "`%{http_version}` prints the version actually used." },
    ],
    followUps: [
      { q: "Why doesn't HTTP/2 fix head-of-line blocking completely?", a: "Its streams share one TCP byte stream; TCP must deliver bytes in order, so a single lost packet delays all streams until retransmission." },
      { q: "Why build QUIC on UDP instead of a new IP protocol?", a: "Middleboxes (NATs, firewalls) only reliably pass TCP and UDP, and implementing in user space lets it evolve without OS kernel updates." },
      { q: "Is HTTP/3 always faster?", a: "Usually on lossy/mobile networks and for new connections. On clean, low-latency networks the difference is small, and UDP can be throttled or blocked on some networks, so clients fall back to HTTP/2." },
    ],
    pitfalls: [
      "Saying HTTP/2 removed all head-of-line blocking.",
      "Claiming each version changed methods/status codes — semantics are shared.",
      "Forgetting HTTP/1.1 keep-alive already reuses connections.",
    ],
    glossary: [
      { term: "Multiplexing", definition: "Interleaving multiple independent streams on a single connection." },
      { term: "HPACK / QPACK", definition: "Header compression schemes for HTTP/2 and HTTP/3." },
      { term: "ALPN", definition: "TLS extension letting client and server agree on the application protocol." },
      { term: "Head-of-line blocking", definition: "When one delayed item holds up everything queued behind it." },
    ],
    relatedLessons: ["networks/http", "networks/tcp", "networks/udp", "networks/tls-handshake", "networks/curl-debugging"],
    relatedQuestions: ["net-02", "net-05"],
    sources: [RFC9110, RFC9113, RFC9114, MDN_HTTP_EVOLUTION],
  },
  {
    id: "net-04",
    track: "networks",
    number: 4,
    question: "What is CORS, and when does the browser send a preflight request?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["networks", "cors", "browser-security", "same-origin-policy", "preflight"],
    shortAnswer:
      "Browsers enforce the **same-origin policy**: a page's scripts can't read responses from a different origin — scheme, host and port. **CORS** is how the *server* opts in to allow it, via response headers like `Access-Control-Allow-Origin`. It's enforced by the browser; curl or a backend ignores it entirely.\n\nFor \"simple\" requests — GET, HEAD or POST with only safelisted headers and a content type of form-urlencoded, multipart or text/plain — the browser sends the request and then decides whether JS may read the response. For anything else — a `PUT` or `DELETE`, a `Content-Type: application/json`, an `Authorization` header — it first sends an **OPTIONS preflight** with `Access-Control-Request-Method` and `-Headers`; only if the server approves does the real request go out. Credentials like cookies need `Access-Control-Allow-Credentials: true` and a specific origin, not `*`.",
    deep: [
      { type: "steps", steps: [
        { title: "Page at https://app.com calls fetch('https://api.com/x', { method: 'PUT', headers: { 'Content-Type': 'application/json' } })", detail: "Not simple → preflight needed." },
        { title: "Preflight", detail: "`OPTIONS /x` with `Origin: https://app.com`, `Access-Control-Request-Method: PUT`, `Access-Control-Request-Headers: content-type`." },
        { title: "Server approves", detail: "`204` with `Access-Control-Allow-Origin: https://app.com`, `Access-Control-Allow-Methods: PUT`, `Access-Control-Allow-Headers: content-type`, optional `Access-Control-Max-Age`." },
        { title: "Actual request", detail: "Browser sends PUT; response must again include `Access-Control-Allow-Origin`." },
        { title: "JS reads response", detail: "Otherwise fetch rejects with a TypeError and the console shows a CORS error." },
      ] },
      { type: "callout", tone: "misconception", title: "CORS is not server-side protection", text: "CORS relaxes the browser's same-origin policy; it doesn't stop non-browser clients, and a simple cross-origin POST still *reaches* your server even if the response is blocked. CSRF protection is a separate concern." },
      { type: "list", items: [
        "`Vary: Origin` is needed when the server echoes different allowed origins, so caches don't serve one origin's headers to another.",
        "`Access-Control-Max-Age` caches preflight results (browsers cap it, e.g. Chromium at 2 hours).",
        "Exposing non-safelisted response headers to JS needs `Access-Control-Expose-Headers`.",
      ] },
    ],
    example: {
      type: "code",
      lang: "http",
      caption: "A preflight exchange followed by the real request.",
      code: `OPTIONS /orders/42 HTTP/1.1
Host: api.example.com
Origin: https://app.example.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: content-type, authorization

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, PUT, DELETE
Access-Control-Allow-Headers: content-type, authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 600
Vary: Origin`,
    },
    walkthrough: [
      { title: "Why preflight", detail: "PUT + JSON content type + Authorization header are not CORS-safelisted." },
      { title: "Server check", detail: "Origin is on the allow-list; requested method and headers are allowed." },
      { title: "Cache", detail: "Browser may skip the preflight for 600 s for this method/header combination." },
      { title: "Credentials", detail: "Because Allow-Credentials is true, Allow-Origin must be the explicit origin, not `*`." },
    ],
    followUps: [
      { q: "Why does my request work in Postman but not the browser?", a: "Postman isn't a browser and doesn't enforce the same-origin policy; the server is missing CORS headers (or the preflight fails)." },
      { q: "How do you avoid CORS entirely?", a: "Serve frontend and API from the same origin, e.g. via a reverse proxy or a framework's rewrites (`/api` → backend)." },
      { q: "Does a 'no-cors' fetch fix it?", a: "No — it makes an opaque request whose response JS can't read. Useful only for fire-and-forget or caching." },
    ],
    pitfalls: [
      "Setting `Access-Control-Allow-Origin: *` together with credentials (browsers reject it).",
      "Reflecting any `Origin` back without an allow-list.",
      "Not handling `OPTIONS` in the server or auth middleware (preflight gets 401).",
      "Treating CORS as an authentication/authorization mechanism.",
    ],
    glossary: [
      { term: "Origin", definition: "The (scheme, host, port) triple of a URL." },
      { term: "Same-origin policy", definition: "Browser rule restricting how documents/scripts from one origin interact with another's resources." },
      { term: "Preflight", definition: "An automatic OPTIONS request asking the server whether the real cross-origin request is allowed." },
      { term: "Simple request", definition: "A cross-origin request using safelisted methods/headers that needs no preflight." },
    ],
    relatedLessons: ["networks/cors", "networks/http", "backend/csrf", "javascript/fetch-http"],
    relatedQuestions: ["net-01", "net-03"],
    sources: [MDN_CORS, FETCH_SPEC],
  },
  {
    id: "net-05",
    track: "networks",
    number: 5,
    question: "Walk through the TLS 1.3 handshake.",
    level: "advanced",
    frequency: "high",
    tags: ["networks", "tls", "https", "certificates", "cryptography"],
    shortAnswer:
      "TLS 1.3 completes in one round trip. The client sends a **ClientHello** with supported cipher suites, a random value, the server name via SNI, ALPN protocols like h2, and — the key change from 1.2 — a Diffie-Hellman *key share* guessed for a likely group such as X25519.\n\nThe server replies with a **ServerHello** containing its own key share; both sides now compute the same shared secret, and everything after that is encrypted. The server sends its **Certificate** chain, a **CertificateVerify** signature proving it holds the private key, and **Finished**. The client validates the chain up to a trusted root CA and checks the hostname, sends its own Finished, and application data flows. Resumed sessions can even send early, 0-RTT data — with replay risks. Forward secrecy is mandatory because static RSA key exchange was removed.",
    deep: [
      { type: "steps", steps: [
        { title: "ClientHello", detail: "Versions, cipher suites (e.g. TLS_AES_128_GCM_SHA256), `key_share`, `server_name` (SNI), ALPN, signature algorithms." },
        { title: "ServerHello", detail: "Chosen suite + server `key_share`. Both derive handshake keys via (EC)DHE + HKDF." },
        { title: "EncryptedExtensions, Certificate, CertificateVerify, Finished", detail: "Encrypted with handshake keys. CertificateVerify signs the transcript with the certificate's private key." },
        { title: "Client verifies", detail: "Chain → trusted root, validity dates, hostname match (SAN), revocation policy; checks server Finished MAC." },
        { title: "Client Finished", detail: "Client can send application data immediately alongside it — 1 RTT total." },
      ] },
      { type: "compare", items: [
        { title: "TLS 1.2", points: ["2 RTT full handshake", "RSA key exchange allowed (no forward secrecy)", "Certificate sent in cleartext", "Many legacy ciphers (CBC, RC4…)"] },
        { title: "TLS 1.3 (RFC 8446)", points: ["1 RTT (0-RTT resumption)", "Only ephemeral (EC)DHE — forward secrecy", "Certificate encrypted", "Only AEAD ciphers"] },
      ] },
      { type: "callout", tone: "spec-vs-impl", text: "If the client guessed the wrong key-share group, the server sends a HelloRetryRequest, costing an extra round trip. Certificate revocation checking (OCSP, CRLs, stapling) and hybrid post-quantum key exchange (e.g. X25519MLKEM768, now enabled by default in major browsers) are deployment/implementation choices beyond the core RFC." },
    ],
    example: {
      type: "code",
      lang: "bash",
      caption: "Inspect a real handshake. Output abbreviated and illustrative.",
      code: `openssl s_client -connect example.com:443 -servername example.com -tls1_3 -brief </dev/null`,
      output: "CONNECTION ESTABLISHED\nProtocol version: TLSv1.3\nCiphersuite: TLS_AES_256_GCM_SHA384\nPeer certificate: CN = example.com\nVerification: OK\nNegotiated TLS1.3 group: X25519",
    },
    walkthrough: [
      { title: "-servername", detail: "Sets SNI so the server presents the right certificate." },
      { title: "Protocol / Ciphersuite", detail: "Shows 1.3 was negotiated with an AEAD suite." },
      { title: "Verification: OK", detail: "Chain validated to a root in OpenSSL's trust store." },
      { title: "Group", detail: "The (EC)DHE group used for the key share." },
    ],
    followUps: [
      { q: "What is forward secrecy?", a: "Session keys come from ephemeral Diffie-Hellman keys that are discarded, so stealing the server's long-term private key later can't decrypt recorded past traffic." },
      { q: "Why is 0-RTT data risky?", a: "Early data isn't protected against replay; an attacker can resend it. Only use it for idempotent requests (e.g. GET), and servers may reject it." },
      { q: "What is the chain of trust?", a: "Leaf certificate signed by an intermediate CA, signed by a root CA the OS/browser trusts. The server sends leaf + intermediates; roots are pre-installed." },
      { q: "What does SNI leak, and what's ECH?", a: "SNI reveals the hostname in plaintext in ClientHello. Encrypted Client Hello (ECH) encrypts it using a key published in DNS." },
    ],
    pitfalls: [
      "Describing the TLS 1.2 RSA key exchange as how TLS 1.3 works.",
      "Saying the certificate encrypts the traffic — it authenticates the server; session keys come from (EC)DHE.",
      "Forgetting hostname verification (only checking the chain).",
      "Using 0-RTT for non-idempotent requests.",
    ],
    glossary: [
      { term: "ECDHE", definition: "Ephemeral elliptic-curve Diffie-Hellman key exchange — both sides derive a shared secret without sending it." },
      { term: "SNI", definition: "Server Name Indication — hostname sent in ClientHello for virtual hosting." },
      { term: "AEAD", definition: "Authenticated encryption with associated data (e.g. AES-GCM, ChaCha20-Poly1305)." },
      { term: "Certificate Authority", definition: "Trusted entity that signs certificates binding names to public keys." },
    ],
    relatedLessons: ["networks/tls-handshake", "networks/http", "networks/tcp", "system-design/dns-tcp-lb-firewalls"],
    relatedQuestions: ["net-01", "net-03"],
    sources: [RFC8446, { label: "Cloudflare — A detailed look at RFC 8446 (TLS 1.3)", url: "https://blog.cloudflare.com/rfc-8446-aka-tls-1-3/", kind: "external" }],
  },
];
