import type { Lesson, Track } from "../types";

const OSTEP = { label: "Operating Systems: Three Easy Pieces (OSTEP)", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/", kind: "external" as const, note: "Free online textbook by Remzi and Andrea Arpaci-Dusseau." };
const NOTE_100X = { label: "100xDocs — review reminder from learner's study notes", kind: "original-note" as const };

export const track: Track = {
  slug: "os",
  title: "Operating systems",
  tagline: "What actually runs your code: CPUs, caches, processes, threads, virtual memory and the kernel.",
  description:
    "The layer underneath every runtime. Learn how source code becomes instructions a CPU fetches and executes, why memory is a ladder of caches, how processes and threads share (or don't share) memory, how the kernel schedules work and mediates I/O — and why Node, Go and databases are built the way they are.",
  modules: [
    {
      id: "os-hardware-execution",
      title: "Hardware and execution",
      summary: "From source code to machine instructions, and the latency ladder from registers to the network.",
      lessons: ["cpu-memory-hierarchy"],
    },
    {
      id: "os-processes-memory",
      title: "Processes and memory",
      summary: "Processes vs threads, the call stack vs the heap, and virtual memory with pages and the TLB.",
      lessons: ["processes-threads", "stack-vs-heap", "virtual-memory"],
    },
    {
      id: "os-concurrency",
      title: "Concurrency",
      summary: "How the scheduler shares CPUs between threads, and how threads coordinate safely.",
      lessons: ["scheduling", "synchronization"],
    },
    {
      id: "os-io-kernel",
      title: "I/O and the kernel",
      summary: "System calls as the user/kernel boundary, file systems, and blocking vs non-blocking vs multiplexed I/O.",
      lessons: ["system-calls", "io-models"],
    },
  ],
  milestones: [
    {
      id: "os-thread-pool",
      title: "Build a thread pool",
      summary: "A fixed set of worker threads pulling tasks from a bounded queue, with graceful shutdown.",
      level: "intermediate",
      requirements: [
        "N worker threads created once and reused (any language: C/pthreads, Rust, Java, Go goroutines, or Node worker_threads)",
        "Bounded task queue: submitters block (or get an error) when the queue is full — this is backpressure",
        "Queue protected by a mutex plus condition variables (`notEmpty`, `notFull`) or an equivalent primitive",
        "Graceful shutdown: stop accepting work, drain queued tasks, join every worker",
        "A test that submits many tasks concurrently and verifies every task ran exactly once",
      ],
      stretch: [
        "Per-task futures/promises for results and errors",
        "Measure throughput vs number of workers and explain the curve (CPU-bound vs I/O-bound tasks)",
        "Work stealing between per-worker queues",
      ],
      exercises: ["os/processes-threads", "os/synchronization", "os/scheduling", "go/worker-pool", "nodejs/worker-threads"],
    },
    {
      id: "os-mini-shell",
      title: "Build a mini shell",
      summary: "A tiny Unix shell that runs programs with fork/exec/wait and supports pipes.",
      level: "advanced",
      requirements: [
        "Read a line, split into arguments, `fork()` a child and `execvp()` the program",
        "Parent `waitpid()`s and prints the exit status",
        "Support `a | b` by creating a pipe and wiring stdout/stdin with `dup2()`",
        "Built-ins `cd` and `exit` run in the shell process itself (explain why they must)",
      ],
      stretch: ["Output redirection `>`", "Background jobs with `&` and reaping zombies on SIGCHLD"],
      exercises: ["os/processes-threads", "os/system-calls", "os/io-models"],
    },
    {
      id: "os-toy-allocator",
      title: "Toy memory allocator",
      summary: "Implement malloc/free over one big buffer with a free list, and observe fragmentation.",
      level: "expert",
      requirements: [
        "Manage a fixed arena (e.g. a 1 MiB array) with a free list of blocks",
        "First-fit allocation with block splitting; coalesce adjacent free blocks on free",
        "Report external fragmentation after a randomized alloc/free workload",
      ],
      stretch: ["Size-class bins (like modern allocators)", "Compare first-fit vs best-fit fragmentation"],
      exercises: ["os/stack-vs-heap", "os/virtual-memory"],
    },
  ],
  sources: [
    OSTEP,
    { label: "Linux man-pages project (man7.org)", url: "https://man7.org/linux/man-pages/", kind: "docs" },
    { label: "epoll(7) — Linux manual page", url: "https://man7.org/linux/man-pages/man7/epoll.7.html", kind: "docs" },
    { label: "Latency Numbers Every Programmer Should Know", url: "https://gist.github.com/jboner/2841832", kind: "external", note: "Approximate, dated (circa 2012) figures; use for orders of magnitude only." },
    { label: "Ulrich Drepper — What Every Programmer Should Know About Memory", url: "https://people.freebsd.org/~lstewart/articles/cpumemory.pdf", kind: "external" },
    { label: "Julia Evans — wizard zines", url: "https://wizardzines.com/", kind: "external" },
    NOTE_100X,
  ],
};

export const lessons: Lesson[] = [
  // ───────────────────────────────────────────── cpu-memory-hierarchy
  {
    slug: "cpu-memory-hierarchy",
    track: "os",
    title: "CPU execution and the memory hierarchy",
    summary:
      "How source code becomes machine instructions the CPU fetches, decodes and executes — and why memory is a ladder of ever-larger, ever-slower layers from registers to disk.",
    level: "beginner",
    frequency: "high",
    minutes: 30,
    kinds: ["theory", "visualization", "quiz"],
    status: "authored",
    prerequisites: [],
    related: ["os/stack-vs-heap", "os/virtual-memory", "javascript/performance", "system-design/latency-throughput"],
    tags: ["cpu", "cache", "latency", "locality", "compilation"],
    sources: [
      OSTEP,
      { label: "Latency Numbers Every Programmer Should Know", url: "https://gist.github.com/jboner/2841832", kind: "external", note: "Approximate and dated; orders of magnitude only." },
      { label: "Ulrich Drepper — What Every Programmer Should Know About Memory", url: "https://people.freebsd.org/~lstewart/articles/cpumemory.pdf", kind: "external" },
      NOTE_100X,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Trace the path source code → compiler/interpreter → machine code → CPU fetch/decode/execute",
              "Name the layers of the memory hierarchy and their rough latency orders of magnitude",
              "Explain cache lines, spatial and temporal locality, and why access patterns change performance",
              "Reason about why a cache or an in-memory store beats a disk or network round trip",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Think of a chef. The knife in hand is a **register**, the cutting board is the **L1 cache**, the counter is **L2/L3**, the fridge is **RAM**, the basement freezer is the **SSD**, and the supermarket across town is **the network**. Each step further away holds more but takes far longer to reach.",
          },
          {
            type: "p",
            text: "A good chef keeps what they are about to use close by. CPUs do the same automatically with caches — and your code is fast when its access pattern lets them.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "list",
            items: [
              "**CPU (core)**: hardware that repeatedly fetches an instruction, decodes it and executes it, reading and writing registers and memory.",
              "**Machine code**: the binary instructions of a specific instruction set architecture (ISA) such as x86-64 or ARM64.",
              "**Memory hierarchy**: registers → L1 → L2 → L3 caches → main memory (RAM) → storage (SSD/HDD) → network; each level larger, cheaper per byte, and slower.",
              "**Cache line**: the unit transferred between RAM and the caches — commonly 64 bytes on x86-64 and many ARM cores.",
              "**Locality**: *temporal* — recently used data is likely reused; *spatial* — data near recently used data is likely used next.",
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "A CPU can execute several instructions per nanosecond, but a trip to RAM costs on the order of 100 ns. Without caches the processor would spend most of its time waiting. The hierarchy exists because fast memory is expensive and physically must sit close to the core.",
          },
          {
            type: "p",
            text: "This explains everyday engineering choices: why arrays beat linked lists for iteration, why Redis is faster than Postgres for hot keys, and why chatty network calls dominate request latency.",
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "flow",
            nodes: ["Source code", "Compiler / JIT", "Machine code in memory", "Fetch", "Decode", "Execute", "Write back"],
            caption: "Conceptual pipeline. Real CPUs overlap these stages (pipelining), execute out of order and predict branches.",
          },
          {
            type: "steps",
            steps: [
              { title: "Compile", detail: "An ahead-of-time compiler (C, Go, Rust) turns source into machine code in an executable. JavaScript is instead parsed to bytecode and hot code is JIT-compiled to machine code at runtime by the engine." },
              { title: "Load", detail: "The OS loads the executable's code and data into the process's virtual address space and sets the program counter (instruction pointer) to the entry point." },
              { title: "Fetch", detail: "The core reads the instruction at the program counter — usually from the L1 instruction cache." },
              { title: "Decode", detail: "The instruction's bits are decoded into an operation and its operands (registers, immediate values, memory addresses)." },
              { title: "Execute", detail: "The ALU or another unit performs it: add two registers, load a value from memory, compare and branch." },
              { title: "Write back and advance", detail: "Results go to registers or memory; the program counter moves to the next instruction (or the branch target)." },
            ],
          },
          {
            type: "table",
            head: ["Layer", "Typical size", "Approx. latency (order of magnitude)"],
            rows: [
              ["Registers", "tens of values per core", "< 1 ns (within a cycle)"],
              ["L1 cache", "~32–64 KiB per core", "~1 ns"],
              ["L2 cache", "~256 KiB–2 MiB per core", "~3–5 ns"],
              ["L3 cache", "several–tens of MiB, shared", "~10–20 ns"],
              ["RAM (DRAM)", "GiB", "~50–100 ns"],
              ["NVMe SSD random read", "TB", "~10–100 µs"],
              ["HDD seek", "TB", "~5–10 ms"],
              ["Network round trip, same datacenter", "—", "~0.5 ms"],
              ["Network round trip, cross-continent", "—", "~100–150 ms"],
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "These numbers are approximate and hardware-specific",
            text: "Cache sizes, latencies and even the 64-byte line size vary across CPU generations and vendors. Treat the table as a conceptual ladder of **orders of magnitude** — the ratios (roughly 1 : 100 : 100,000 : 1,000,000 from L1 to RAM to SSD to cross-region network) are what matter.",
          },
          {
            type: "p",
            text: "When the core loads an address, it checks L1, then L2, then L3. A miss at every level fetches the whole 64-byte cache line from RAM, so neighbouring bytes arrive for free. Hardware **prefetchers** detect sequential or strided patterns and fetch lines before you ask.",
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          {
            type: "p",
            text: "Summing an array of 1,000,000 32-bit integers sequentially (conceptual):",
          },
          {
            type: "steps",
            steps: [
              { title: "First access misses", detail: "`a[0]` is not cached; the core fetches its 64-byte line from RAM (~100 ns). That line holds `a[0]`..`a[15]`." },
              { title: "Next 15 accesses hit", detail: "`a[1]`..`a[15]` are already in L1 (~1 ns each) — spatial locality." },
              { title: "Prefetcher kicks in", detail: "Seeing a sequential pattern, hardware fetches upcoming lines early, hiding most RAM latency." },
              { title: "Contrast: random access", detail: "Visiting the same elements in a random order defeats both effects; most accesses become cache misses and the loop can be several times slower even though Big-O is identical." },
            ],
          },
        ],
      },
      {
        id: "visualization",
        blocks: [
          { type: "viz", id: "mem-hierarchy", caption: "Conceptual latency ladder — approximate orders of magnitude, not measurements of any specific machine." },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "js",
            runnable: true,
            caption: "Same work, different access pattern. Row-major traversal touches memory sequentially; column-major jumps by a whole row each step. Exact timings vary by machine and engine.",
            code: `const N = 1000;
const grid = new Float64Array(N * N); // one contiguous block, row-major

function rowMajor() {
  let s = 0;
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) s += grid[r * N + c];
  return s;
}
function colMajor() {
  let s = 0;
  for (let c = 0; c < N; c++)
    for (let r = 0; r < N; r++) s += grid[r * N + c];
  return s;
}

let t = performance.now(); rowMajor();
const rowMs = performance.now() - t;
t = performance.now(); colMajor();
const colMs = performance.now() - t;
console.log("column-major slower:", colMs > rowMs);`,
            output: "column-major slower: true",
          },
          {
            type: "callout",
            tone: "note",
            text: "The printed result is typical, not guaranteed: on a tiny grid that fits in cache, or with timer noise, both loops can take similar time.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Assuming Big-O alone predicts speed — two O(n) loops can differ several-fold because of cache behaviour.",
              "Believing \"RAM is fast\": it is fast compared to disk, but ~100× slower than L1.",
              "Quoting latency numbers as exact facts. They are orders of magnitude and change with hardware.",
              "**False sharing**: two threads writing different variables that sit on the same cache line force the line to bounce between cores.",
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
              { title: "Contiguous data (arrays, struct-of-arrays)", points: ["Cache and prefetcher friendly", "Fast iteration", "Costly inserts in the middle / resizing"] },
              { title: "Pointer-linked data (linked lists, trees of objects)", points: ["Cheap structural edits", "Each hop may be a cache miss", "Extra memory for pointers"] },
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
              "In-memory caches (Redis, CDN edges) exist because RAM and nearby servers sit several rungs above disk and cross-region networks.",
              "Databases read pages in blocks and keep a buffer pool in RAM for the same reason.",
              "Game engines and numeric libraries lay data out as arrays of structs/struct of arrays to maximise locality.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "The CPU repeatedly fetches, decodes and executes machine instructions. Memory is a hierarchy — registers, L1/L2/L3 caches, RAM, SSD, network — each level bigger but slower by roughly an order of magnitude or more. Caches move data in 64-byte lines and exploit temporal and spatial locality, so sequential access patterns are much faster than random ones even with the same Big-O.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Modern cores pipeline, execute out of order and speculate on branches; a mispredicted branch flushes work and costs tens of cycles.",
              "Caches are coherent across cores (e.g. MESI-style protocols); writes by one core invalidate copies in others — the root of false sharing.",
              "The TLB is a cache too — of virtual-to-physical page translations; see the virtual memory lesson.",
              "Design consequence: minimise round trips at every level — batch DB queries, keep hot data in RAM, colocate services.",
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
              "Code becomes machine instructions; the CPU loops fetch → decode → execute.",
              "Memory is a latency ladder; each rung is roughly 10–1000× slower than the one above.",
              "Caches work in lines and reward locality; access pattern matters as much as Big-O.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "ISA", definition: "Instruction set architecture — the set of machine instructions a CPU family understands (x86-64, ARM64)." },
      { term: "Program counter", definition: "Register holding the address of the next instruction to fetch (instruction pointer on x86)." },
      { term: "Cache line", definition: "Fixed-size block (commonly 64 bytes) moved between RAM and CPU caches." },
      { term: "Cache hit / miss", definition: "Whether requested data was found in a given cache level." },
      { term: "Spatial locality", definition: "Tendency to access data near recently accessed data." },
      { term: "Temporal locality", definition: "Tendency to re-access recently accessed data." },
      { term: "False sharing", definition: "Performance loss when threads write distinct variables that share a cache line." },
      { term: "JIT", definition: "Just-in-time compilation: generating machine code at runtime for hot code paths." },
    ],
    followUps: [
      { q: "Why is a linked list slower to iterate than an array even though both are O(n)?", a: "Array elements are contiguous, so each cache line brings many elements and the prefetcher streams ahead. List nodes are scattered on the heap; each `next` hop can be a cache miss costing ~100 ns." },
      { q: "What is false sharing and how do you fix it?", a: "Two cores repeatedly writing different variables in the same cache line make the line ping-pong between their caches. Fix by padding/aligning hot per-thread data to separate cache lines or by keeping per-thread state local and merging at the end." },
      { q: "Is JavaScript compiled?", a: "Engines like V8 parse JS to bytecode and interpret it, then JIT-compile hot functions to optimised machine code — so the CPU ultimately executes machine code either way." },
    ],
    quiz: [
      {
        id: "cmh-q1",
        prompt: "Roughly how much slower is a main-memory (RAM) access than an L1 cache hit?",
        options: ["About the same", "About 2×", "About 100×", "About 1,000,000×"],
        answer: 2,
        explanation: "L1 is on the order of 1 ns and RAM on the order of 100 ns — roughly two orders of magnitude (approximate, hardware-dependent).",
      },
      {
        id: "cmh-q2",
        prompt: "Why does iterating an array sequentially usually beat visiting the same elements in random order?",
        options: [
          "Sequential loops use fewer instructions",
          "Each cache line fetched brings neighbouring elements, and prefetchers stream ahead",
          "Random access forces a system call",
          "The garbage collector pauses random access",
        ],
        answer: 1,
        explanation: "Spatial locality: a 64-byte line holds many neighbours, and hardware prefetching hides RAM latency for predictable patterns.",
      },
      {
        id: "cmh-q3",
        prompt: "Which stage of the instruction cycle reads the next instruction at the program counter?",
        options: ["Decode", "Execute", "Fetch", "Write back"],
        answer: 2,
        explanation: "Fetch reads the instruction (usually from the L1 instruction cache); decode then interprets it.",
      },
    ],
  },

  // ───────────────────────────────────────────── processes-threads
  {
    slug: "processes-threads",
    track: "os",
    title: "Processes and threads",
    summary:
      "A process is an isolated address space plus resources; a thread is an execution context (registers, stack) that shares its process's memory. Knowing the difference explains fork/exec, context-switch cost, and why Node, Go and Nginx are designed the way they are.",
    level: "beginner",
    frequency: "very-high",
    minutes: 35,
    kinds: ["theory", "quiz"],
    status: "authored",
    prerequisites: ["os/cpu-memory-hierarchy"],
    related: [
      "os/scheduling", "os/synchronization", "os/stack-vs-heap", "go/goroutines", "go/concurrency-vs-parallelism",
      "nodejs/worker-threads", "nodejs/node-architecture", "system-design/multithreading-parallelism",
    ],
    tags: ["process", "thread", "fork", "exec", "context-switch", "green-threads"],
    sources: [
      OSTEP,
      { label: "OSTEP — Processes (chapter PDF)", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-intro.pdf", kind: "external" },
      { label: "OSTEP — Process API (fork/exec/wait)", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-api.pdf", kind: "external" },
      { label: "OSTEP — Concurrency and threads", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf", kind: "external" },
      { label: "fork(2) — Linux manual page", url: "https://man7.org/linux/man-pages/man2/fork.2.html", kind: "docs" },
      NOTE_100X,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Define process and thread precisely, and list what each owns vs shares",
              "Explain the process lifecycle states and what the PCB stores",
              "Describe fork/exec/wait and why shells use them",
              "Compare context-switch costs: process vs thread vs user-space (green) thread",
              "Map these ideas onto Node.js, Go and multi-process servers",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A **process** is like a house: its own walls, its own furniture (memory), its own keys (open files). A **thread** is a person living in the house. Several people in one house share the kitchen and can bump into each other; people in different houses can't touch each other's stuff without calling or mailing (IPC).",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "compare",
            items: [
              {
                title: "Process",
                points: [
                  "An instance of a running program",
                  "Owns a private virtual address space (code, data, heap, stacks)",
                  "Owns OS resources: file descriptors, sockets, signal handlers, credentials",
                  "Isolated: a crash or wild pointer usually can't corrupt another process",
                  "Contains one or more threads",
                ],
              },
              {
                title: "Thread",
                points: [
                  "A unit of execution scheduled on a CPU",
                  "Owns: program counter, registers, its own stack, thread-local storage",
                  "Shares with sibling threads: heap, globals, code, open files",
                  "Cheap communication via shared memory — and therefore data races",
                  "One thread crashing (e.g. segfault) typically kills the whole process",
                ],
              },
            ],
          },
          {
            type: "p",
            text: "The kernel tracks each process in a **process control block (PCB)** — PID, state, saved registers, memory mappings, open-file table, scheduling info. Threads have a smaller **thread control block (TCB)** with their own registers and stack pointer.",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Linux blurs the line",
            text: "On Linux both processes and threads are \"tasks\" (`task_struct`) created by `clone()`; flags decide what is shared. A thread is a task that shares the address space and file table with its parent. Other kernels keep separate process and thread objects, but the conceptual model is the same.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "**Isolation** (processes) gives safety and security: a browser tab or a worker crashing doesn't take down everything.",
              "**Sharing** (threads) gives cheap communication and lower memory overhead for parallel work on the same data.",
              "Choosing between them shapes architecture: Chrome's process-per-site, Postgres's process-per-connection, Nginx/Node's few processes with event loops, Go's many goroutines on a few threads.",
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "flow",
            nodes: ["New", "Ready", "Running", "Blocked (waiting for I/O)", "Ready", "Running", "Terminated"],
            caption: "Conceptual process/thread state lifecycle. The scheduler moves Ready → Running; I/O or a lock wait moves Running → Blocked.",
          },
          {
            type: "steps",
            steps: [
              { title: "fork()", detail: "Creates a child process that is a copy of the parent. Modern kernels use **copy-on-write**: pages are shared read-only until either side writes, so fork is cheap. Returns 0 in the child and the child's PID in the parent." },
              { title: "exec()", detail: "Replaces the current process's program with a new executable (new code, data, heap, stack) while keeping the PID and, by default, open file descriptors." },
              { title: "wait()/waitpid()", detail: "The parent blocks until a child exits and collects its status. A child that has exited but not been waited on is a **zombie**; one whose parent died is an **orphan**, adopted by init/systemd." },
            ],
          },
          {
            type: "p",
            text: "A **context switch** saves the running thread's registers into its TCB, picks another thread, and restores its registers. Switching between threads of the same process keeps the address space. Switching between processes also changes the page-table root, which can flush or tag TLB entries and leaves caches full of the old process's data — the indirect cost often exceeds the direct cost.",
          },
          {
            type: "table",
            head: ["Kind", "Who schedules", "Creation cost", "Switch cost", "Example"],
            rows: [
              ["Process", "Kernel", "High (address space, fd table)", "Highest (address space change)", "Postgres backend per connection"],
              ["Kernel thread (1:1)", "Kernel", "Medium (kernel stack, typically MB-sized user stack reserved)", "Medium (syscall + register save)", "pthreads, Java platform threads, libuv pool threads"],
              ["User-space / green thread (M:N)", "Language runtime", "Low (small growable stack)", "Low (no kernel entry)", "Go goroutines, Java virtual threads, Erlang processes"],
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Numbers depend on OS and runtime",
            text: "A context switch is commonly quoted at a few microseconds on Linux, default thread stacks reserve about 8 MiB of virtual memory (glibc, configurable), and Go goroutines start with a few KiB of stack that grows on demand. All of these vary by version and configuration.",
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          { type: "p", text: "What a shell does when you type `ls -l`:" },
          {
            type: "steps",
            steps: [
              { title: "Parse", detail: "The shell splits the line into `[\"ls\", \"-l\"]`." },
              { title: "fork", detail: "The shell process clones itself; now there are two nearly identical processes." },
              { title: "exec in the child", detail: "The child calls `execvp(\"ls\", args)`; its memory image is replaced by the `ls` program. Its stdout fd still points at your terminal." },
              { title: "wait in the parent", detail: "The shell calls `waitpid()` and sleeps (Blocked) until `ls` exits." },
              { title: "Reap and prompt", detail: "The kernel delivers the exit status; the zombie entry is removed; the shell prints the next prompt." },
            ],
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "bash",
            caption: "Inspect processes and their threads on Linux.",
            code: `# list processes with thread counts (NLWP = number of light-weight processes / threads)
ps -eo pid,ppid,nlwp,comm | head

# threads of one process (each has its own TID)
ps -T -p <pid>

# a Node.js process typically shows several threads: main JS thread, libuv pool, V8 helpers
ps -T -p $(pgrep -n node)`,
          },
          {
            type: "table",
            head: ["Runtime", "Model"],
            rows: [
              ["Node.js", "One main JS thread per process running the event loop; libuv thread pool (default 4) for fs/dns.lookup/crypto/zlib; scale with `cluster`/multiple processes or `worker_threads`."],
              ["Go", "Many goroutines multiplexed onto OS threads by the runtime scheduler (G/M/P); `GOMAXPROCS` threads run Go code at once."],
              ["Python (CPython)", "Real OS threads, but historically one GIL means one thread runs Python bytecode at a time; multiprocessing for CPU parallelism."],
              ["Postgres", "Process per connection (hence connection pooling)."],
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
              "Forking a multi-threaded process copies only the calling thread; locks held by other threads stay locked forever in the child. Only async-signal-safe calls are safe before exec.",
              "Zombie processes accumulate if a parent never waits on its children.",
              "Thread-local storage looks global but is per-thread — surprises when code moves between threads.",
            ],
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Saying \"Node.js is single-threaded\" without qualification — JavaScript runs on one thread, but the process has several.",
              "Assuming threads give parallelism automatically — on one core they only interleave (concurrency, not parallelism).",
              "Spawning one OS thread per request at high load — memory and switch overhead dominate; use pools or event loops.",
              "Treating processes as free to create in hot paths — fork+exec per request (classic CGI) is expensive.",
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
              { title: "Multi-process", points: ["Strong isolation and fault containment", "Use all cores without shared-memory races", "Higher memory; IPC needed to communicate"] },
              { title: "Multi-threaded", points: ["Cheap sharing of data", "Lower memory per unit of concurrency", "Data races, deadlocks; one crash kills all"] },
              { title: "Event loop (single thread + async I/O)", points: ["Very cheap per connection", "No locks for JS state", "CPU-heavy work blocks everyone"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "A process is an isolated instance of a program with its own virtual address space and resources like file descriptors. A thread is an execution context inside a process — its own registers and stack — sharing the process's heap and globals with sibling threads. Processes give isolation at higher cost; threads give cheap shared-memory communication at the price of races. Context-switching between processes is more expensive because the address space changes, hurting TLB and cache locality.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "fork uses copy-on-write; exec replaces the image; the shell pattern is fork → exec → wait.",
              "Linux implements both as tasks via `clone()` with sharing flags.",
              "Threading models: 1:1 (kernel threads), N:1 (pure green threads — no parallelism), M:N (Go, Java virtual threads) — the runtime parks goroutines on blocking ops and hands its OS thread work from other goroutines.",
              "Direct switch cost is microseconds; indirect cost is cold caches and TLB — why pinning and fewer, busier threads often win.",
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
              "Process = address space + resources; thread = execution context sharing that space.",
              "Processes isolate; threads share. Both are scheduled by the kernel; green threads by a runtime.",
              "fork/exec/wait is how new programs start on Unix.",
              "Context switches cost more across processes than across threads, and runtime-level switches cost least.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Process", definition: "A running program with its own virtual address space and OS resources." },
      { term: "Thread", definition: "An independently scheduled execution context sharing its process's memory." },
      { term: "PCB", definition: "Process control block — kernel record holding a process's PID, state, registers, memory map and open files." },
      { term: "Context switch", definition: "Saving one thread's CPU state and restoring another's so it can run." },
      { term: "Copy-on-write", definition: "Sharing pages read-only after fork and copying a page only when one side writes to it." },
      { term: "Zombie process", definition: "A process that has exited but whose status hasn't been collected by its parent via wait." },
      { term: "IPC", definition: "Inter-process communication: pipes, sockets, shared memory, signals, message queues." },
      { term: "Green thread", definition: "A thread scheduled by a language runtime in user space rather than by the kernel." },
    ],
    followUps: [
      { q: "Why is creating a thread cheaper than creating a process?", a: "A new thread needs only a stack and a TCB; it reuses the existing address space, page tables and file table. A process needs its own address space (even with copy-on-write, new page tables) and resource tables." },
      { q: "If threads share memory, what do they NOT share?", a: "Registers (including the program counter and stack pointer), their stack, thread-local storage, and per-thread signal masks." },
      { q: "How does Go run 100,000 goroutines on 8 cores?", a: "Goroutines are user-space threads with small growable stacks. The runtime multiplexes them over a small number of OS threads (M) using processors (P, = GOMAXPROCS); blocked goroutines are parked and cost no CPU." },
      { q: "Is a Node.js process single-threaded?", a: "JavaScript executes on one main thread, but the process also runs libuv thread-pool threads and V8 helper threads (GC, compilation). Worker threads add more JS threads, each with its own isolate and event loop." },
    ],
    quiz: [
      {
        id: "pt-q1",
        prompt: "Which of these is NOT shared between threads of the same process?",
        options: ["Heap", "Global variables", "Open file descriptors", "Call stack"],
        answer: 3,
        explanation: "Each thread has its own stack and registers; heap, globals and file descriptors are shared.",
      },
      {
        id: "pt-q2",
        prompt: "After `fork()`, what does the call return in the child process?",
        options: ["The parent's PID", "0", "The child's PID", "-1"],
        answer: 1,
        explanation: "fork returns 0 in the child and the child's PID in the parent (-1 on failure).",
      },
      {
        id: "pt-q3",
        prompt: "Why is a process-to-process context switch usually more expensive than a thread-to-thread switch within one process?",
        options: [
          "Processes have more registers",
          "The address space changes, so TLB entries and cached data are less useful",
          "Threads don't need to save registers",
          "The kernel isn't involved in thread switches",
        ],
        answer: 1,
        explanation: "Switching address spaces changes the page-table root; TLB and cache contents from the old process become useless. Kernel threads still need register saves and kernel entry.",
      },
    ],
  },
  // ───────────────────────────────────────────── stack-vs-heap
  {
    slug: "stack-vs-heap",
    track: "os",
    title: "Stack vs heap",
    summary:
      "Each thread gets a call stack of frames that is allocated and freed automatically in LIFO order; the heap holds data whose lifetime outlives a call, managed manually or by a garbage collector. Where a value lives decides its cost and lifetime.",
    level: "beginner",
    frequency: "very-high",
    minutes: 30,
    kinds: ["theory", "visualization", "quiz"],
    status: "authored",
    prerequisites: ["os/processes-threads", "os/cpu-memory-hierarchy"],
    related: ["os/virtual-memory", "go/stack-vs-heap", "go/escape-analysis", "javascript/call-stack", "javascript/memory-leaks-gc"],
    tags: ["stack", "heap", "memory", "allocation", "gc", "stack-overflow"],
    sources: [
      OSTEP,
      { label: "OSTEP — Memory API (malloc/free)", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-api.pdf", kind: "external" },
      { label: "OSTEP — Free-space management", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-freespace.pdf", kind: "external" },
      { label: "MDN — Memory management (JavaScript)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management", kind: "docs" },
      NOTE_100X,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Describe the layout of a process's address space: code, data, heap, stacks",
              "Explain stack frames and why stack allocation is nearly free",
              "Explain heap allocation, fragmentation and the role of malloc/free or a GC",
              "Recognise stack overflow and know why deep recursion causes it",
              "Know that in managed languages the runtime, not you, decides placement",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "The **stack** is a pile of plates: each function call puts a plate (frame) on top, and returning removes it. Nothing to search for, nothing to clean up — just move the top. The **heap** is a warehouse: you ask for space of some size, someone finds a free spot, and it stays there until it is explicitly freed or the garbage collector decides nobody can reach it.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "compare",
            items: [
              {
                title: "Stack",
                points: [
                  "One per thread",
                  "Holds frames: return address, saved registers, parameters, local variables",
                  "Allocate/free = move the stack pointer (LIFO)",
                  "Size fixed or bounded (often MBs for OS threads)",
                  "Lifetime tied to the function call",
                ],
              },
              {
                title: "Heap",
                points: [
                  "Shared by all threads of the process",
                  "Holds dynamically sized or long-lived data",
                  "Allocate via an allocator (malloc/new) that searches free lists or size classes",
                  "Grows as needed (until address space / RAM limits)",
                  "Lifetime until freed manually or collected by a GC",
                ],
              },
            ],
          },
          {
            type: "flow",
            nodes: ["Code (text)", "Data / BSS (globals)", "Heap ↑ grows up", "… free …", "Stack ↓ grows down"],
            caption: "Conceptual layout of a single-threaded process's virtual address space. Real layouts add shared libraries, mmap regions, guard pages and one stack per thread.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "Stack allocation is a single pointer adjustment and the memory is hot in cache — the cheapest allocation possible.",
              "But a frame disappears when its function returns, so anything that must outlive the call (returned objects, closures, data shared across threads) needs the heap.",
              "Heap allocation costs more (allocator bookkeeping, possible locks, later GC work) and is the source of leaks, fragmentation and use-after-free bugs.",
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Call", detail: "The caller pushes arguments (or places them in registers, per the calling convention) and the return address; the callee adjusts the stack pointer to reserve space for its locals." },
              { title: "Run", detail: "Locals are addressed at fixed offsets from the stack/frame pointer — no lookup required." },
              { title: "Return", detail: "The stack pointer moves back; the frame's memory is instantly reusable by the next call. Nothing is zeroed or 'freed'." },
              { title: "Heap request", detail: "`malloc(n)` asks the allocator for n bytes. It finds a fitting free block (free lists, size-class bins, per-thread caches) or asks the kernel for more memory via `brk`/`mmap`." },
              { title: "Heap release", detail: "`free(p)` returns the block to the allocator (not usually to the OS). In GC languages, the collector later finds unreachable objects and reclaims them." },
            ],
          },
          {
            type: "p",
            text: "**Stack overflow** happens when frames exceed the stack's limit — classically from unbounded or very deep recursion. The OS places an unmapped **guard page** below the stack, so overflowing triggers a fault instead of silently corrupting the heap.",
          },
          {
            type: "p",
            text: "**Fragmentation**: after many allocations and frees of varied sizes, free memory can be split into small holes. A large request may fail or force growth even though the total free memory is enough (external fragmentation). Allocators fight this with size classes and coalescing; compacting GCs fight it by moving objects.",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "In managed languages, placement is the runtime's decision",
            text: "C and C++ make the choice explicit. Go's compiler uses **escape analysis** to keep values on the goroutine stack when they provably don't outlive the call, and moves them to the heap otherwise; goroutine stacks themselves are small and grow by copying. JavaScript engines like V8 keep most objects on a GC-managed heap and may optimise some allocations away (escape analysis in the optimising compiler). The spec of either language says nothing about stack vs heap — it's an implementation detail.",
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          {
            type: "code",
            lang: "js",
            runnable: true,
            caption: "Conceptual JS view: primitives behave like values copied into the frame; objects live on the heap and variables hold references to them.",
            code: `function makeUser(name) {
  const age = 30;               // local value, conceptually in makeUser's frame
  const user = { name, age };   // object allocated on the GC heap
  return user;                  // the reference escapes; the frame is discarded
}

const a = makeUser("Ada");
const b = a;        // copies the reference, not the object
b.age = 31;
console.log(a.age); // same heap object
let n = 1;
let m = n;          // copies the value
m = 2;
console.log(n);`,
            output: "31\n1",
          },
          {
            type: "steps",
            steps: [
              { title: "Call makeUser", detail: "A frame is pushed with `name` and `age`." },
              { title: "Allocate", detail: "The object literal is allocated on the heap; `user` holds a reference." },
              { title: "Return", detail: "The frame is popped. The object survives because `a` still references it." },
              { title: "Alias", detail: "`b = a` copies the reference; both point to one object, so `a.age` reads 31." },
              { title: "Collect later", detail: "When no references remain, the GC may reclaim the object at some unspecified time." },
            ],
          },
        ],
      },
      {
        id: "visualization",
        blocks: [
          { type: "viz", id: "js-references", caption: "The JavaScript view of stack vs heap: bindings in frames, objects on the heap, references shared by aliases. Conceptual — engines decide actual placement." },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "js",
            runnable: true,
            caption: "Unbounded recursion exhausts the call stack. The exact depth reached depends on the engine and frame size.",
            code: `function depth(n) { return depth(n + 1); }
try {
  depth(0);
} catch (e) {
  console.log(e instanceof RangeError, e.message.includes("call stack"));
}`,
            output: "true true",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "The error is a `RangeError` with message \"Maximum call stack size exceeded\" in V8 (Chrome, Node). Firefox's SpiderMonkey throws an `InternalError: too much recursion`, so this snippet prints `false false` there.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "\"Primitives live on the stack, objects on the heap\" is a useful mental model for JS, not a guarantee — closures capture locals into heap-allocated contexts, and engines optimise freely.",
              "Returning a pointer to a local variable in C — the frame is gone; it's undefined behaviour. (Go makes this safe by escaping the value to the heap.)",
              "Assuming `free` or GC returns memory to the OS immediately — allocators often keep it for reuse, so RSS may not drop.",
              "Thinking a GC prevents leaks — anything still referenced (global caches, listeners, closures) is never collected.",
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
              { title: "Manual (C/C++ malloc/free, Rust ownership)", points: ["Predictable, no GC pauses", "Bugs: leaks, double free, use-after-free (Rust prevents these at compile time)", "More programmer effort"] },
              { title: "Garbage collected (JS, Go, Java)", points: ["Memory-safe by default", "CPU and latency cost of collection", "Leaks still possible via lingering references"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Each thread has a stack of frames holding locals and return addresses; allocation is just moving the stack pointer, it's fast and freed automatically when the function returns, but it's limited in size and data can't outlive the call. The heap is shared by the process for dynamically sized or long-lived data; it's more flexible but slower to allocate and needs freeing — manually or by a GC — and can fragment. In Go or JS the runtime decides placement (e.g. via escape analysis).",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Calling conventions decide which arguments go in registers vs stack; frames contain saved registers and the return address.",
              "Guard pages make stack overflow fault deterministically; a thread's stack size is set at creation.",
              "Modern allocators (jemalloc, tcmalloc, glibc's ptmalloc) use per-thread caches and size classes to avoid locks and fragmentation.",
              "Generational GCs make short-lived heap allocation cheap via bump allocation in a young generation — closing much of the gap with the stack.",
              "Go: `go build -gcflags=-m` prints escape-analysis decisions.",
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
              "Stack: per thread, LIFO frames, automatic, fast, bounded.",
              "Heap: shared, flexible lifetime, allocator/GC managed, slower, can fragment or leak.",
              "Deep recursion → stack overflow; lingering references → heap leaks.",
              "In managed runtimes the compiler/engine chooses placement.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Stack frame", definition: "The region of the stack for one function call: return address, saved registers, arguments and locals." },
      { term: "Stack pointer", definition: "Register pointing at the current top of the stack." },
      { term: "Heap", definition: "Region of memory for dynamically allocated data with lifetimes independent of function calls." },
      { term: "Allocator", definition: "Library code (malloc, a runtime allocator) that hands out and reclaims heap blocks." },
      { term: "Fragmentation", definition: "Free memory split into pieces too small to satisfy requests even though total free space is sufficient." },
      { term: "Escape analysis", definition: "Compiler analysis deciding whether a value can outlive its function; if not, it can be stack-allocated." },
      { term: "Guard page", definition: "An unmapped page adjacent to a stack so overflow causes a fault." },
      { term: "Garbage collector", definition: "Runtime component that reclaims heap objects no longer reachable from roots." },
    ],
    followUps: [
      { q: "Why is stack allocation faster than heap allocation?", a: "It's one pointer adjustment with no search or bookkeeping, the memory is almost always in cache, and freeing is implicit at return. Heap allocation searches free structures, may lock, and later needs freeing or GC." },
      { q: "Can a closure's captured variable live on the stack?", a: "Not if the closure outlives the call. Engines move captured variables into a heap-allocated context object so the closure can still reach them after the frame is popped." },
      { q: "How do you fix a stack overflow from recursion?", a: "Convert to iteration with an explicit stack (heap-allocated array), reduce depth (e.g. divide and conquer), or raise the thread's stack size. JS engines generally don't implement proper tail calls, so tail recursion won't help in V8." },
    ],
    quiz: [
      {
        id: "svh-q1",
        prompt: "Which statement about a thread's stack is true?",
        options: [
          "It is shared by all threads in the process",
          "Allocation is done by searching a free list",
          "Frames are freed automatically when the function returns",
          "It grows without limit",
        ],
        answer: 2,
        explanation: "Returning moves the stack pointer back; stacks are per-thread, bounded, and need no free-list search.",
      },
      {
        id: "svh-q2",
        prompt: "In Go, what decides whether a local variable is heap-allocated?",
        options: ["The `new` keyword", "Escape analysis by the compiler", "The garbage collector at runtime", "Variable size only"],
        answer: 1,
        explanation: "The compiler's escape analysis keeps values on the stack when they don't outlive the function; `new` or `&T{}` doesn't force a heap allocation.",
      },
    ],
  },
  // ───────────────────────────────────────────── virtual-memory
  {
    slug: "virtual-memory",
    track: "os",
    title: "Virtual memory: pages, page tables, TLB and page faults",
    summary:
      "Every process sees its own private address space. The MMU translates virtual pages to physical frames through page tables, caches translations in the TLB, and traps to the kernel on page faults — enabling isolation, lazy allocation, copy-on-write and memory-mapped files.",
    level: "intermediate",
    frequency: "high",
    minutes: 30,
    kinds: ["theory", "quiz"],
    status: "authored",
    prerequisites: ["os/processes-threads", "os/stack-vs-heap", "os/cpu-memory-hierarchy"],
    related: ["os/system-calls", "os/io-models", "go/garbage-collection"],
    tags: ["virtual-memory", "paging", "tlb", "page-fault", "mmap", "swap"],
    sources: [
      OSTEP,
      { label: "OSTEP — Paging: Introduction", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-paging.pdf", kind: "external" },
      { label: "OSTEP — Paging: Faster Translations (TLBs)", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-tlbs.pdf", kind: "external" },
      { label: "mmap(2) — Linux manual page", url: "https://man7.org/linux/man-pages/man2/mmap.2.html", kind: "docs" },
      NOTE_100X,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain why processes use virtual rather than physical addresses",
              "Translate a virtual address into page number + offset and follow it through a page table",
              "Describe the TLB and why TLB misses are expensive",
              "Distinguish minor and major page faults, and relate them to lazy allocation, copy-on-write, swap and mmap",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Each process gets a map with street addresses that start at zero and look endless. The OS keeps a private directory translating those addresses to actual buildings (physical RAM). Two processes can both use address `0x400000` and land in different buildings — or the same one, if the OS deliberately shares it.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "list",
            items: [
              "**Virtual address space**: the range of addresses a process can use, private to that process.",
              "**Page / frame**: fixed-size chunks of virtual memory (pages) and physical memory (frames).",
              "**Page table**: per-process structure mapping virtual page numbers to physical frames plus permission bits (present, writable, user, executable).",
              "**MMU**: the CPU hardware that performs translation on every memory access.",
              "**TLB**: a small, fast cache of recent virtual→physical translations inside the MMU.",
              "**Page fault**: a trap to the kernel when a translation is missing or the access violates permissions.",
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Sizes are architecture-specific",
            text: "x86-64 uses 4 KiB base pages with 2 MiB and 1 GiB huge pages and a 4-level (or 5-level) page table. ARM64 supports 4, 16 or 64 KiB granules; Apple Silicon macOS uses 16 KiB pages. The concepts are identical.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "**Isolation**: a process cannot even name another process's memory.",
              "**Simplicity**: every program can be linked as if it owned a large contiguous space.",
              "**Efficiency tricks**: allocate lazily, share library code between processes, copy-on-write after fork, map files directly into memory.",
              "**Overcommit**: the sum of virtual allocations can exceed RAM; only touched pages consume frames.",
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Split the address", detail: "With 4 KiB pages, the low 12 bits are the offset within the page; the remaining bits are the virtual page number (VPN)." },
              { title: "Check the TLB", detail: "On a TLB hit the frame number is available almost immediately; combine it with the offset to form the physical address." },
              { title: "Walk the page table (TLB miss)", detail: "The MMU (hardware walker on x86/ARM) reads several levels of the page table from memory — each level a potential cache miss — then fills the TLB." },
              { title: "Check permissions and presence", detail: "If the entry is not present or the access isn't permitted, the CPU raises a page fault." },
              { title: "Kernel handles the fault", detail: "Minor fault: allocate a zeroed frame or map an already-cached page, update the table, retry. Major fault: read the page from disk (swap or a mapped file) first. Invalid access: deliver SIGSEGV." },
            ],
          },
          {
            type: "table",
            head: ["Event", "Typical cost (approximate)", "Cause"],
            rows: [
              ["TLB hit", "~free (part of the access)", "Recently used page"],
              ["TLB miss + page walk", "tens to hundreds of cycles", "Touching many distinct pages"],
              ["Minor page fault", "~microseconds", "First touch of fresh memory, copy-on-write"],
              ["Major page fault", "~10 µs (NVMe) to ms (HDD)", "Page must be read from disk/swap"],
            ],
          },
          {
            type: "p",
            text: "A context switch to another process changes the page-table root register; TLB entries for the old process become useless unless tagged with an address-space ID (PCID/ASID), which modern CPUs support.",
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          { type: "p", text: "A program calls `malloc(100 MiB)` and then writes to the first byte (Linux, conceptual):" },
          {
            type: "steps",
            steps: [
              { title: "Reserve", detail: "The allocator uses `mmap` for a large request; the kernel records a 100 MiB virtual region. No physical memory is used yet." },
              { title: "First write", detail: "The MMU finds no present mapping for that page → page fault." },
              { title: "Minor fault", detail: "The kernel grabs a zeroed 4 KiB frame, installs the mapping, and resumes the instruction." },
              { title: "Result", detail: "Resident memory grows by one page, not 100 MiB. Memory is committed page by page as it is touched." },
            ],
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "bash",
            caption: "Observe page size and page faults on Linux.",
            code: `getconf PAGESIZE              # usually 4096 on x86-64 Linux
/usr/bin/time -v node -e "Buffer.alloc(200 * 1024 * 1024)" 2>&1 | grep -i "page faults"
# Minor (reclaiming a frame) page faults: ...   <- grows with memory touched
# Major (requiring I/O) page faults: ...        <- ideally 0`,
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Equating virtual size (VSZ) with memory usage — resident set size (RSS) is what is actually in RAM.",
              "Assuming a successful malloc means memory is available — with overcommit, the OOM killer may strike when pages are touched.",
              "Ignoring TLB reach: random access over a huge heap can be slowed by TLB misses; huge pages help some databases and JVMs.",
              "Treating swap as free extra RAM — major faults are thousands of times slower than RAM access.",
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
              { title: "Small pages (4 KiB)", points: ["Less internal fragmentation", "Fine-grained sharing and protection", "More TLB entries needed; bigger page tables"] },
              { title: "Huge pages (2 MiB / 1 GiB)", points: ["Far greater TLB reach", "Fewer page walks", "Waste for sparse use; transparent huge pages can cause latency spikes"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Virtual memory gives each process a private address space. Addresses are split into page number and offset; the MMU translates pages to physical frames using per-process page tables and caches translations in the TLB. Missing or forbidden mappings cause page faults that the kernel handles — allocating on first touch, copying on write, reading from disk, or killing the process with a segfault. This gives isolation, lazy allocation and memory-mapped files.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Multi-level page tables keep tables small for sparse address spaces at the cost of longer walks.",
              "PCID/ASID tags reduce TLB flushes on context switch; Meltdown mitigations (KPTI) increased switch costs on affected CPUs.",
              "`mmap` maps files into memory so reads become page faults served from the page cache — used by databases (LMDB, older MongoDB engines) and loaders for shared libraries.",
              "Copy-on-write after fork is why Redis can snapshot (BGSAVE) a large dataset cheaply — until writes force page copies.",
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
              "Virtual addresses → (TLB or page table) → physical frames.",
              "Page faults implement lazy allocation, copy-on-write, swap and mmap.",
              "Watch RSS, not VSZ; major faults and TLB misses are performance signals.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Page", definition: "Fixed-size block of virtual memory (often 4 KiB)." },
      { term: "Frame", definition: "Fixed-size block of physical memory that a page maps to." },
      { term: "MMU", definition: "Memory management unit — hardware that translates virtual to physical addresses." },
      { term: "TLB", definition: "Translation lookaside buffer — cache of recent page translations." },
      { term: "Page fault", definition: "Trap raised when an access has no valid mapping or violates permissions." },
      { term: "RSS", definition: "Resident set size — physical memory currently mapped for a process." },
      { term: "mmap", definition: "System call that maps files or anonymous memory into the address space." },
      { term: "Overcommit", definition: "Allowing virtual allocations to exceed available physical memory." },
    ],
    followUps: [
      { q: "What happens on a segmentation fault?", a: "The access hit an address with no valid mapping or wrong permissions (e.g. writing read-only code, null pointer). The page-fault handler finds no legitimate reason to fix it and sends SIGSEGV, usually terminating the process." },
      { q: "Why does fork not double memory usage immediately?", a: "Parent and child share the same physical frames marked read-only (copy-on-write). Only pages that one side writes are copied, on demand via page faults." },
      { q: "Why can huge pages improve database performance?", a: "Each TLB entry covers far more memory, so large working sets cause fewer TLB misses and page walks." },
    ],
    quiz: [
      {
        id: "vm-q1",
        prompt: "With 4 KiB pages, how many low-order bits of a virtual address form the page offset?",
        options: ["8", "12", "16", "32"],
        answer: 1,
        explanation: "4 KiB = 4096 = 2^12 bytes, so 12 bits address a byte within the page.",
      },
      {
        id: "vm-q2",
        prompt: "A program touches freshly malloc'd memory for the first time. What usually happens?",
        options: ["A major page fault reads from swap", "A minor page fault maps a zeroed frame", "Nothing — the memory was already mapped", "The process gets SIGSEGV"],
        answer: 1,
        explanation: "Memory is committed lazily; first touch triggers a minor fault that installs a zeroed physical frame.",
      },
    ],
  },
  // ───────────────────────────────────────────── synchronization
  {
    slug: "synchronization",
    track: "os",
    title: "Synchronization: mutexes, semaphores, condition variables and deadlock",
    summary:
      "When threads share memory, unsynchronized read-modify-write sequences race. Mutexes give mutual exclusion, semaphores count permits, condition variables let threads sleep until a predicate holds — and misuse leads to deadlock, which requires four Coffman conditions.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 35,
    kinds: ["theory", "coding", "quiz"],
    status: "authored",
    prerequisites: ["os/processes-threads"],
    related: ["os/scheduling", "go/mutex", "go/race-deadlock-livelock", "go/atomics", "system-design/locks-transactions-isolation", "system-design/multithreading-parallelism"],
    tags: ["mutex", "semaphore", "condition-variable", "deadlock", "race-condition", "critical-section"],
    sources: [
      OSTEP,
      { label: "OSTEP — Locks", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-locks.pdf", kind: "external" },
      { label: "OSTEP — Condition Variables", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-cv.pdf", kind: "external" },
      { label: "OSTEP — Semaphores", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-sema.pdf", kind: "external" },
      { label: "OSTEP — Common Concurrency Problems (deadlock)", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-bugs.pdf", kind: "external" },
      NOTE_100X,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain a race condition on `count++` at the instruction level",
              "Use a mutex to protect a critical section",
              "Distinguish counting semaphores from mutexes",
              "Use a condition variable correctly (while-loop re-check, hold the lock)",
              "State the four deadlock conditions and how to break each",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A **mutex** is the single key to a one-person bathroom. A **semaphore** is a bowl of N parking tokens. A **condition variable** is a waiting room with a bell: you sit down (releasing the key) until someone rings to say \"something changed — go check\".",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "list",
            items: [
              "**Race condition**: the result depends on the timing/interleaving of threads accessing shared state, at least one writing.",
              "**Critical section**: code that accesses shared state and must not run concurrently with itself.",
              "**Mutex (lock)**: at most one holder; `lock()` blocks while another thread holds it; only the owner should `unlock()`.",
              "**Semaphore**: an integer counter with atomic `wait/P` (decrement, block at 0) and `signal/V` (increment, wake a waiter). A binary semaphore resembles a mutex but has no owner.",
              "**Condition variable**: lets a thread atomically release a mutex and sleep until signalled; on wake-up it re-acquires the mutex.",
              "**Deadlock**: a set of threads each waiting for a resource held by another in the set, so none can proceed.",
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "`count++` is really load → add → store. Two threads can both load 5, both store 6, and one increment is lost. Synchronization primitives impose ordering so shared invariants hold — and also establish memory visibility (happens-before) so one thread's writes are seen by the next.",
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Hardware atomics", detail: "CPUs provide atomic instructions such as compare-and-swap (CAS) and fetch-and-add, plus memory fences. All locks are built on these." },
              { title: "Spin, then sleep", detail: "A lock first tries a CAS in user space. If contended it may spin briefly, then ask the kernel to sleep the thread (Linux: `futex`) until the holder releases." },
              { title: "Uncontended is cheap", detail: "With no contention, lock/unlock stay entirely in user space — tens of nanoseconds. Contention, not locking itself, is what's expensive." },
              { title: "Condition wait", detail: "`wait(cv, m)` atomically unlocks `m` and sleeps; `signal` wakes one waiter, `broadcast` wakes all. The waker usually holds the mutex while changing the predicate." },
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "`futex` is Linux-specific; macOS and Windows use other kernel wait primitives. POSIX allows **spurious wake-ups** from condition waits, so correct code always re-checks the predicate in a loop.",
          },
          {
            type: "table",
            head: ["Coffman condition", "Meaning", "How to break it"],
            rows: [
              ["Mutual exclusion", "Resources can't be shared", "Use lock-free/immutable data where possible"],
              ["Hold and wait", "Holding one resource while waiting for another", "Acquire all locks at once, or release before waiting"],
              ["No preemption", "Resources can't be taken away", "Use try-lock with timeout and back off"],
              ["Circular wait", "A cycle of threads each waiting on the next", "Impose a global lock ordering (most common fix)"],
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          { type: "p", text: "A classic deadlock with two locks:" },
          {
            type: "steps",
            steps: [
              { title: "T1 locks A", detail: "Transfer from account A to B: T1 acquires lock A." },
              { title: "T2 locks B", detail: "Transfer from B to A: T2 acquires lock B." },
              { title: "T1 waits for B", detail: "T1 now needs B; it's held by T2, so T1 blocks (hold and wait)." },
              { title: "T2 waits for A", detail: "T2 needs A, held by T1 — a cycle. All four conditions hold; neither ever proceeds." },
              { title: "Fix", detail: "Always lock the lower account ID first. Both threads then try A first; one waits without holding B, and the cycle can't form." },
            ],
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "text",
            caption: "Bounded buffer (producer/consumer) with one mutex and two condition variables — language-neutral pseudocode.",
            code: `mutex m; cond notFull, notEmpty; queue q; const CAP = 10

produce(item):
  lock(m)
  while q.size == CAP: wait(notFull, m)   # while, not if: re-check after waking
  q.push(item)
  signal(notEmpty)
  unlock(m)

consume():
  lock(m)
  while q.size == 0: wait(notEmpty, m)
  item = q.pop()
  signal(notFull)
  unlock(m)
  return item`,
          },
          {
            type: "code",
            lang: "js",
            runnable: true,
            caption: "Even single-threaded JS has logical races across await points: both tasks read the balance before either writes it.",
            code: `let balance = 100;
const tick = () => new Promise((r) => setTimeout(r, 0));

async function withdraw(amount) {
  const current = balance;   // read
  await tick();              // yield: another task runs here
  balance = current - amount; // write based on a stale read
}

Promise.all([withdraw(30), withdraw(50)]).then(() => console.log(balance));`,
            output: "50",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Using `if` instead of `while` around a condition wait — spurious wake-ups or another consumer can invalidate the predicate.",
              "Holding a lock during slow I/O or while calling unknown callbacks — kills throughput and invites deadlock.",
              "Protecting writes but not reads — readers can see torn or stale state.",
              "Inconsistent lock ordering across code paths.",
              "Assuming a single-threaded runtime (Node) is immune — async interleavings still race on shared state.",
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
              { title: "Coarse-grained lock", points: ["Simple, easy to reason about", "Low parallelism under contention"] },
              { title: "Fine-grained locks", points: ["More parallelism", "More deadlock risk; needs strict ordering"] },
              { title: "Lock-free / atomics / message passing", points: ["No blocking, no deadlock", "Hard to get right (ABA, memory ordering) — or shifts design to channels/actors"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "A race happens when threads interleave non-atomic read-modify-write on shared data. A mutex makes a critical section mutually exclusive; a semaphore is a counter of permits, useful for limiting concurrency; a condition variable lets a thread release the lock and sleep until a predicate may have changed, always re-checked in a while loop. Deadlock needs mutual exclusion, hold-and-wait, no preemption and circular wait; the usual fix is a global lock ordering or timeouts.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Locks are built on atomic CAS plus fences; Linux sleeps contended waiters with futexes.",
              "Locks also publish memory: unlock happens-before a subsequent lock of the same mutex.",
              "Livelock: threads keep reacting to each other without progress (fix with randomized backoff). Starvation: a thread never gets the lock (fix with fair locks).",
              "Priority inversion: a low-priority thread holds a lock needed by a high-priority one; priority inheritance mitigates it.",
              "Read-write locks allow many readers or one writer — helpful only when reads dominate and critical sections are long enough.",
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
              "Shared mutable state + concurrency = races unless synchronized.",
              "Mutex for exclusion, semaphore for counting, condition variable for waiting on a predicate.",
              "Deadlock needs all four Coffman conditions — break one (usually circular wait).",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Race condition", definition: "Outcome depends on the interleaving of concurrent accesses to shared state." },
      { term: "Critical section", definition: "Code that must execute without concurrent access to the same shared state." },
      { term: "Mutex", definition: "Lock providing mutual exclusion with an owning thread." },
      { term: "Semaphore", definition: "Counter with atomic wait (decrement/block) and signal (increment/wake) operations." },
      { term: "Condition variable", definition: "Primitive to sleep until signalled, used together with a mutex and a predicate." },
      { term: "Deadlock", definition: "Threads waiting on each other in a cycle so none can proceed." },
      { term: "CAS", definition: "Compare-and-swap: atomically replace a value only if it equals an expected value." },
      { term: "Futex", definition: "Linux fast user-space mutex: wait/wake syscall used only when contended." },
    ],
    followUps: [
      { q: "Mutex vs binary semaphore?", a: "A mutex has an owner — only the locking thread should unlock, enabling error checks and priority inheritance. A binary semaphore has no owner; any thread may signal it, which suits signalling between threads rather than protecting a critical section." },
      { q: "Why must you hold the mutex when calling wait on a condition variable?", a: "Checking the predicate and going to sleep must be atomic with respect to the thread that changes it; otherwise the signal can arrive between the check and the sleep and be lost forever." },
      { q: "How would you detect a deadlock in production?", a: "Thread dumps showing threads blocked on locks held by each other (cycle in the wait-for graph), Go's runtime 'all goroutines are asleep' panic, database deadlock detectors that abort a victim transaction, and lock-acquisition timeouts with logging." },
    ],
    quiz: [
      {
        id: "sync-q1",
        prompt: "Which Coffman condition does a global lock ordering eliminate?",
        options: ["Mutual exclusion", "Hold and wait", "No preemption", "Circular wait"],
        answer: 3,
        explanation: "If every thread acquires locks in the same order, a cycle of waiters cannot form.",
      },
      {
        id: "sync-q2",
        prompt: "Why do condition-variable waits belong in a `while` loop?",
        options: [
          "To spin and save CPU",
          "Because wake-ups can be spurious or the predicate can change before the thread re-acquires the lock",
          "Because signal wakes all threads",
          "It's a style preference only",
        ],
        answer: 1,
        explanation: "After waking, the thread must re-check the condition; POSIX allows spurious wake-ups and other threads may have consumed the state.",
      },
      {
        id: "sync-q3",
        prompt: "What does the async `withdraw` example print?",
        code: { lang: "js", code: "let balance = 100;\n// two withdraw calls (30 and 50) each read balance, await, then write current - amount" },
        options: ["20", "50", "70", "100"],
        answer: 1,
        explanation: "Both read 100 before either writes. withdraw(30) writes 70, then withdraw(50) writes 100 - 50 = 50 — a lost update.",
      },
    ],
  },
  // ───────────────────────────────────────────── scheduling (outline)
  {
    slug: "scheduling",
    track: "os",
    title: "CPU scheduling and context switches",
    summary:
      "How the kernel decides which ready thread runs on which core and for how long: preemption via timer interrupts, time slices, fairness vs latency, and what a context switch costs — compared with Go's user-space G/M/P scheduler.",
    level: "intermediate",
    frequency: "medium",
    minutes: 25,
    kinds: ["theory", "visualization"],
    status: "outline",
    prerequisites: ["os/processes-threads"],
    related: ["os/synchronization", "go/gmp-scheduler", "go/concurrency-vs-parallelism", "system-design/multithreading-parallelism"],
    tags: ["scheduler", "preemption", "context-switch", "cfs", "eevdf"],
    sources: [
      OSTEP,
      { label: "OSTEP — Scheduling: Introduction", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-sched.pdf", kind: "external" },
      { label: "OSTEP — Multi-level Feedback Queue", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-sched-mlfq.pdf", kind: "external" },
      { label: "Linux kernel docs — EEVDF scheduler", url: "https://docs.kernel.org/scheduler/sched-eevdf.html", kind: "docs" },
      { label: "Linux kernel docs — CFS scheduler design", url: "https://docs.kernel.org/scheduler/sched-design-CFS.html", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Distinguish cooperative from preemptive scheduling and explain timer interrupts",
              "Compare classic policies: FIFO, shortest job first, round robin, MLFQ, fair-share",
              "Measure and reason about context-switch cost (direct and cache/TLB effects)",
              "Contrast the kernel scheduler with Go's G/M/P runtime scheduler",
            ],
          },
        ],
      },
      {
        id: "visualization",
        blocks: [
          { type: "viz", id: "go-scheduler", caption: "For comparison: Go's runtime scheduler multiplexes goroutines onto OS threads in user space. The kernel scheduler, covered here, then schedules those OS threads onto cores." },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "Linux used the Completely Fair Scheduler (CFS) from 2.6.23 and replaced it with EEVDF in 6.6. Time-slice lengths, priorities (nice values) and real-time classes are kernel-specific details.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Will cover: ready queues, preemption via timer interrupts, and the metrics (turnaround, response time, fairness).",
              "Will cover: FIFO/SJF/round robin/MLFQ and Linux CFS → EEVDF.",
              "Will cover: context-switch anatomy and cost; CPU affinity and multicore load balancing.",
              "Will cover: user-space schedulers (Go G/M/P, Node's event loop) layered on top of kernel scheduling.",
            ],
          },
        ],
      },
    ],
  },
  // ───────────────────────────────────────────── system-calls (outline)
  {
    slug: "system-calls",
    track: "os",
    title: "System calls and the user/kernel boundary",
    summary:
      "Programs can't touch hardware directly; they ask the kernel through system calls. Learn how a syscall crosses from user mode to kernel mode, what it costs, and how to observe syscalls with strace.",
    level: "intermediate",
    frequency: "medium",
    minutes: 20,
    kinds: ["theory"],
    status: "outline",
    prerequisites: ["os/processes-threads", "os/virtual-memory"],
    related: ["os/io-models", "nodejs/node-architecture"],
    tags: ["syscall", "kernel-mode", "user-mode", "strace", "vdso"],
    sources: [
      OSTEP,
      { label: "OSTEP — Limited Direct Execution", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-mechanisms.pdf", kind: "external" },
      { label: "syscalls(2) — Linux manual page", url: "https://man7.org/linux/man-pages/man2/syscalls.2.html", kind: "docs" },
      { label: "strace(1) — Linux manual page", url: "https://man7.org/linux/man-pages/man1/strace.1.html", kind: "docs" },
      { label: "Julia Evans — wizard zines (strace, Linux)", url: "https://wizardzines.com/", kind: "external" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain user mode vs kernel mode and why the CPU enforces them",
              "Trace a syscall: library wrapper → trap instruction → kernel handler → return",
              "Know common syscall families: process (fork, execve, exit), files (open, read, write), memory (mmap, brk), networking (socket, accept, connect)",
              "Use strace to see what a program (e.g. a Node or Go server) actually asks the kernel",
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
              "Will cover: limited direct execution, traps, interrupts and privilege levels.",
              "Will cover: syscall cost (mode switch, mitigations) and why batching and buffering matter.",
              "Will cover: the vDSO fast path for calls like `clock_gettime`.",
              "Will cover: hands-on strace of `cat`, a Node.js HTTP server and a Go binary.",
            ],
          },
        ],
      },
    ],
  },
  // ───────────────────────────────────────────── io-models (outline)
  {
    slug: "io-models",
    track: "os",
    title: "File systems and I/O models",
    summary:
      "From file descriptors, inodes and the page cache to the I/O models that servers are built on: blocking, non-blocking, multiplexed (select/poll/epoll/kqueue), and completion-based async I/O (io_uring, IOCP).",
    level: "advanced",
    frequency: "high",
    minutes: 30,
    kinds: ["theory"],
    status: "outline",
    prerequisites: ["os/system-calls", "os/processes-threads"],
    related: ["nodejs/node-architecture", "nodejs/node-event-loop", "go/gmp-scheduler", "javascript/event-loop"],
    tags: ["io", "epoll", "kqueue", "io_uring", "file-descriptor", "page-cache", "filesystem"],
    sources: [
      OSTEP,
      { label: "OSTEP — Files and Directories", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/file-intro.pdf", kind: "external" },
      { label: "OSTEP — Event-based Concurrency", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-events.pdf", kind: "external" },
      { label: "epoll(7) — Linux manual page", url: "https://man7.org/linux/man-pages/man7/epoll.7.html", kind: "docs" },
      { label: "io_uring(7) — Linux manual page", url: "https://man7.org/linux/man-pages/man7/io_uring.7.html", kind: "docs" },
      { label: "libuv — Design overview", url: "https://docs.libuv.org/en/v1.x/design.html", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain file descriptors, inodes, directories and the page cache",
              "Compare blocking, non-blocking, I/O multiplexing and async (completion) I/O",
              "Explain why epoll/kqueue scale to many sockets better than select/poll",
              "Understand why libuv uses epoll/kqueue for sockets but a thread pool for regular file I/O",
            ],
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Model", "Call behaviour", "Typical use"],
            rows: [
              ["Blocking", "Thread sleeps until data is ready and copied", "Thread-per-connection servers, simple scripts"],
              ["Non-blocking", "Returns immediately with EAGAIN if not ready", "Building block for event loops"],
              ["Multiplexing (select/poll/epoll/kqueue)", "One call waits for readiness on many fds", "Nginx, Redis, Node (libuv), Go netpoller"],
              ["Completion-based async (io_uring, Windows IOCP)", "Submit operations; get notified when done", "High-throughput storage and networking"],
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "epoll and io_uring are Linux-only; kqueue is BSD/macOS; IOCP is Windows. Readiness APIs don't work for regular files on Linux (files always report ready), which is why libuv offloads file I/O to its thread pool.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Will cover: file descriptors, inodes, directories, the page cache and fsync durability.",
              "Will cover: the four I/O models with timelines of who waits where.",
              "Will cover: select vs poll vs epoll/kqueue (level- vs edge-triggered) and the C10K problem.",
              "Will cover: io_uring, and how Node's libuv and Go's netpoller map onto these models.",
            ],
          },
        ],
      },
    ],
  },
];
