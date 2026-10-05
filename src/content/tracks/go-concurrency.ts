import type { Lesson, SourceRef } from "../types";

/**
 * Go track — "Concurrency" and "Production Go" modules.
 * Structure lives in `go.ts`; fundamentals/runtime lessons live in `go-fundamentals.ts`.
 */

const notion = (label: string, url: string): SourceRef => ({
  label: `Notion: ${label}`,
  url,
  kind: "inaccessible",
  note: "Private Notion page — not readable, nothing imported.",
});

const N = {
  cvp: notion("Concurrency vs parallelism vs interleaving", "https://app.notion.com/p/Concurrency-vs-parallelism-vs-interleaving-1a2e9488b51a81238232c26abe6489a8"),
  goroutines: notion("Goroutines", "https://app.notion.com/p/Goroutines-1a2e9488b51a816da0b5d42463eeff5f"),
  channels: notion("Channels — buffered vs unbuffered, defers", "https://app.notion.com/p/Channels-Buffered-vs-Unbuffered-defers-1a2e9488b51a81baa5f6f8568198f14b"),
  chanSync: notion("Channel synchronization & WaitGroups", "https://app.notion.com/p/Channel-synchronization-waitgroups-1a2e9488b51a816a8000cab1310a0e90"),
  mutex: notion("Mutex", "https://app.notion.com/p/Mutex-1a2e9488b51a81e2a5b9dc69eadc3ed4"),
  select: notion("Select", "https://app.notion.com/p/Select-1a2e9488b51a8180bef1cb10aabbbea8"),
  requests: notion("Concurrent requests", "https://app.notion.com/p/Concurrent-requests-1a2e9488b51a81d9b1e6d999b89d0015"),
  context: notion("Context", "https://app.notion.com/p/Context-1a2e9488b51a8102aa07d68282079f75"),
  patterns: notion("Concurrency patterns", "https://app.notion.com/p/Concurrency-patterns-1a2e9488b51a8125acecc5904e7bd9e6"),
  range: notion("Range", "https://app.notion.com/p/Range-1a2e9488b51a81a59e06d83bcc5e3869"),
  close: notion("Close", "https://app.notion.com/p/Close-1a2e9488b51a81fcbc2adf2ff2b20779"),
  workerPool: notion("Worker pool pattern", "https://app.notion.com/p/Worker-pool-pattern-1a2e9488b51a8130a3f6c09175ea85d3"),
  puzzles: notion("Puzzles", "https://app.notion.com/p/Puzzles-1a2e9488b51a811895d7f8e0c360e078"),
  gin: notion("Gin framework", "https://app.notion.com/p/Gin-framework-1a2e9488b51a81ab982ae161c27a0e8c"),
  forkJoin: notion("Fork-Join model", "https://app.notion.com/p/Fork-Join-model-1a2e9488b51a81c1a189efb5d525af60"),
  raceDeadlock: notion("Race conditions, deadlocks and livelocks", "https://app.notion.com/p/Race-conditions-deadlocks-and-livelocks-1a2e9488b51a81df955ec8b03cc89c13"),
};

const S = {
  practice: {
    label: "Learner's Go practice code (language-learning/Go)",
    url: "https://github.com/saurabhraghuvanshii/language-learning/tree/main/Go",
    kind: "original-note",
    note: "Examples in this lesson adapt the learner's own practice programs (routines, concurrency, super30-Go/channel).",
  } as SourceRef,
  pgl: {
    label: "Practical Go Lessons (book)",
    url: "https://www.practical-go-lessons.com/",
    kind: "external",
    note: "Recommended companion reading; its contents are not reproduced here.",
  } as SourceRef,
  memModel: { label: "The Go Memory Model", url: "https://go.dev/ref/mem", kind: "docs" } as SourceRef,
  spec: { label: "The Go Programming Language Specification", url: "https://go.dev/ref/spec", kind: "docs" } as SourceRef,
  effective: { label: "Effective Go — Concurrency", url: "https://go.dev/doc/effective_go#concurrency", kind: "docs" } as SourceRef,
  pipelines: { label: "Go blog: Pipelines and cancellation", url: "https://go.dev/blog/pipelines", kind: "docs" } as SourceRef,
  contextBlog: { label: "Go blog: Context", url: "https://go.dev/blog/context", kind: "docs" } as SourceRef,
  contextPkg: { label: "Package context", url: "https://pkg.go.dev/context", kind: "docs" } as SourceRef,
  sync: { label: "Package sync", url: "https://pkg.go.dev/sync", kind: "docs" } as SourceRef,
  atomic: { label: "Package sync/atomic", url: "https://pkg.go.dev/sync/atomic", kind: "docs" } as SourceRef,
  race: { label: "Data Race Detector", url: "https://go.dev/doc/articles/race_detector", kind: "docs" } as SourceRef,
  pprof: { label: "Package net/http/pprof", url: "https://pkg.go.dev/net/http/pprof", kind: "docs" } as SourceRef,
  diagnostics: { label: "Go diagnostics", url: "https://go.dev/doc/diagnostics", kind: "docs" } as SourceRef,
  runtime: { label: "Package runtime", url: "https://pkg.go.dev/runtime", kind: "docs" } as SourceRef,
  schedSrc: {
    label: "Go runtime source: runtime/proc.go (scheduler)",
    url: "https://github.com/golang/go/blob/master/src/runtime/proc.go",
    kind: "external",
    note: "Implementation, not specification — details change between releases.",
  } as SourceRef,
  chanSrc: {
    label: "Go runtime source: runtime/chan.go",
    url: "https://github.com/golang/go/blob/master/src/runtime/chan.go",
    kind: "external",
    note: "Implementation, not specification.",
  } as SourceRef,
  concurrencyTalk: { label: "Rob Pike — Concurrency is not Parallelism (Go blog)", url: "https://go.dev/blog/waza-talk", kind: "docs" } as SourceRef,
  errorsBlog: { label: "Go blog: Working with Errors in Go 1.13", url: "https://go.dev/blog/go1.13-errors", kind: "docs" } as SourceRef,
  errorsPkg: { label: "Package errors", url: "https://pkg.go.dev/errors", kind: "docs" } as SourceRef,
  slog: { label: "Package log/slog", url: "https://pkg.go.dev/log/slog", kind: "docs" } as SourceRef,
  slogBlog: { label: "Go blog: Structured Logging with slog", url: "https://go.dev/blog/slog", kind: "docs" } as SourceRef,
  testing: { label: "Package testing", url: "https://pkg.go.dev/testing", kind: "docs" } as SourceRef,
  httpPkg: { label: "Package net/http (Server.Shutdown)", url: "https://pkg.go.dev/net/http#Server.Shutdown", kind: "docs" } as SourceRef,
  signal: { label: "Package os/signal (NotifyContext)", url: "https://pkg.go.dev/os/signal#NotifyContext", kind: "docs" } as SourceRef,
  gin: { label: "Gin documentation", url: "https://gin-gonic.com/docs/", kind: "external" } as SourceRef,
  errgroup: { label: "golang.org/x/sync/errgroup", url: "https://pkg.go.dev/golang.org/x/sync/errgroup", kind: "docs" } as SourceRef,
};

export const lessons: Lesson[] = [
  // ───────────────────────────────────────────────────────── concurrency-vs-parallelism
  {
    slug: "concurrency-vs-parallelism",
    track: "go",
    title: "Concurrency vs parallelism",
    summary:
      "Concurrency is structuring a program as independently progressing tasks; parallelism is executing several of them at the same instant. Go gives you the first with goroutines and gets the second from GOMAXPROCS.",
    level: "beginner",
    frequency: "very-high",
    minutes: 15,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/functions", "os/processes-threads"],
    related: ["go/goroutines", "go/gmp-scheduler", "system-design/multithreading-parallelism"],
    tags: ["concurrency", "parallelism", "interleaving", "GOMAXPROCS"],
    sources: [S.concurrencyTalk, S.effective, S.runtime, S.practice, S.pgl, N.cvp],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Define concurrency, parallelism and interleaving precisely and tell them apart.",
              "Explain why a concurrent program can run on one CPU core and still be useful.",
              "Know which knob (`GOMAXPROCS`) decides how much Go code runs in parallel.",
              "Predict how output changes when a function call becomes a `go` statement.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "One cook making three dishes is *concurrent*: while the pasta water heats she chops onions, then stirs the sauce. She is only ever doing one thing at a moment, but all three dishes make progress. Three cooks each making one dish is *parallel*: work literally happens at the same time.",
          },
          {
            type: "p",
            text: "Concurrency is about **dealing with** many things at once (structure). Parallelism is about **doing** many things at once (execution). A well-structured concurrent program *may* run in parallel if the hardware allows — that is the payoff of designing concurrently.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Term", "Meaning", "Needs multiple cores?"],
            rows: [
              ["Concurrency", "Program is composed of tasks whose lifetimes overlap; each can make progress without waiting for the others to finish.", "No"],
              ["Interleaving", "One way to run concurrent tasks on one core: switch between them so their steps alternate (A1 B1 A2 B2…).", "No"],
              ["Parallelism", "Two or more tasks execute instructions at the same physical instant.", "Yes"],
            ],
          },
          {
            type: "p",
            text: "In Go, the `go` statement creates concurrency. The runtime then runs goroutines on up to `GOMAXPROCS` OS threads *simultaneously executing Go code*, which defaults to the number of usable CPUs — that is where parallelism comes from.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "**I/O-bound work** (HTTP calls, DB queries) spends most of its time waiting. Concurrency lets other tasks run during the wait — a speed-up even on one core.",
              "**CPU-bound work** (hashing, image resizing) only gets faster with parallelism — more cores actually computing.",
              "**Responsiveness**: a server must accept new connections while old requests are still in progress. That is a structural (concurrency) requirement.",
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: the sheep and fish counter",
        blocks: [
          {
            type: "p",
            text: "This is adapted from the learner's practice program. First the sequential version: `count(\"fish\")` cannot start until `count(\"sheep\")` returns.",
          },
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"time"
)

func count(thing string) {
	for i := 1; i <= 3; i++ {
		fmt.Println(i, thing)
		time.Sleep(100 * time.Millisecond)
	}
}

func main() {
	count("sheep")
	count("fish")
}`,
            output: `1 sheep
2 sheep
3 sheep
1 fish
2 fish
3 fish`,
          },
          {
            type: "p",
            text: "Now put `go` in front of the first call. `main` no longer waits for it: both counters are alive at the same time, and their lines interleave.",
          },
          {
            type: "code",
            lang: "go",
            code: `func main() {
	go count("sheep") // starts a new goroutine and returns immediately
	count("fish")     // runs in the main goroutine
}`,
            caption: "Order may vary — one possible output shown.",
            output: `1 fish
1 sheep
2 sheep
2 fish
3 sheep
3 fish`,
          },
          {
            type: "steps",
            steps: [
              { title: "go count(\"sheep\")", detail: "The runtime creates a goroutine and puts it on a run queue. `main` continues immediately." },
              { title: "count(\"fish\") prints and sleeps", detail: "Sleeping parks the main goroutine, so the scheduler runs the sheep goroutine." },
              { title: "Interleaving", detail: "Each sleep is a point where the other goroutine gets to run. With several cores they may even print at the same instant (parallel)." },
              { title: "main returns", detail: "When `main` returns the whole program exits — even if the sheep goroutine had one more line to print. Sometimes `3 sheep` is lost." },
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "p",
            text: "`runtime.GOMAXPROCS(0)` reports how many Ps (scheduler contexts) exist, i.e. how many goroutines can run Go code in parallel. `runtime.NumCPU()` reports usable CPUs. Goroutines blocked in system calls or on I/O don't count against GOMAXPROCS.",
          },
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"runtime"
)

func main() {
	fmt.Println("CPUs:", runtime.NumCPU())
	fmt.Println("GOMAXPROCS:", runtime.GOMAXPROCS(0)) // 0 = query, don't change
}`,
            caption: "Machine-dependent output; on an 8-CPU laptop:",
            output: `CPUs: 8
GOMAXPROCS: 8`,
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "GOMAXPROCS defaults are version-dependent",
            text: "Historically the default was the number of logical CPUs visible to the process. Since Go 1.25 the runtime on Linux also respects a container's cgroup CPU limit and can adjust the value as the limit changes. Older versions ignored CPU quotas, which is why many services used `go.uber.org/automaxprocs`.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Assuming more goroutines means more speed. CPU-bound work cannot exceed GOMAXPROCS-way parallelism; extra goroutines only add scheduling and memory overhead.",
              "Assuming goroutines run in the order they were started. The spec makes no ordering promise — synchronize explicitly.",
              "Forgetting that `main` returning ends the program; it does not wait for other goroutines.",
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
              { title: "Concurrency buys", points: ["Overlapping waits (I/O)", "Simpler modelling of independent activities", "Ability to exploit parallel hardware later"] },
              { title: "Concurrency costs", points: ["Shared-state bugs: races, deadlocks", "Nondeterministic output, harder tests", "Coordination overhead (locks, channels, context switches)"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Concurrency is a property of program *structure*: independent tasks whose executions overlap in time, possibly by interleaving on a single core. Parallelism is a property of *execution*: tasks literally run at the same instant on multiple cores. In Go, `go` gives you concurrency; the runtime runs up to GOMAXPROCS goroutines in parallel. Concurrency helps I/O-bound work even on one core; only parallelism speeds up CPU-bound work.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Amdahl's law: if 20% of the work is serial, the speed-up from parallelism is capped at 5× no matter how many cores you add.",
              "Setting `GOMAXPROCS=1` keeps concurrency but removes parallelism — useful to show that data races still happen on one core (a goroutine can be preempted mid read-modify-write).",
              "Parallelism without concurrency exists too: SIMD instructions operate on several values at once inside a single sequential instruction stream.",
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
              "Concurrency = structure (dealing with many things); parallelism = execution (doing many things).",
              "Interleaving is how concurrency runs on one core.",
              "Go: `go` creates concurrency; GOMAXPROCS bounds parallel execution of Go code.",
              "Main returning ends the program — synchronize before exiting.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Concurrency", definition: "Composing a program of independently progressing tasks whose lifetimes overlap." },
      { term: "Parallelism", definition: "Simultaneous execution of multiple tasks on multiple processing units." },
      { term: "Interleaving", definition: "Alternating the steps of several tasks on one processor so all make progress." },
      { term: "GOMAXPROCS", definition: "The maximum number of OS threads that can execute Go code simultaneously (the number of Ps)." },
      { term: "I/O-bound", definition: "Work whose duration is dominated by waiting for disk, network or other devices." },
      { term: "CPU-bound", definition: "Work whose duration is dominated by computation." },
    ],
    followUps: [
      { q: "Can a concurrent Go program have data races with GOMAXPROCS=1?", a: "Yes. Goroutines can be preempted between the read and write of `x++`, so another goroutine's update can be lost even though nothing runs in parallel." },
      { q: "Will spawning 1,000 goroutines make a CPU-bound computation 1,000× faster?", a: "No. At most GOMAXPROCS goroutines execute Go code at once, so speed-up is bounded by core count (and by the serial fraction, per Amdahl's law)." },
      { q: "Why is Node.js concurrent but (mostly) not parallel?", a: "Its JavaScript runs on one thread with an event loop interleaving callbacks; only libuv's thread pool and worker threads add parallelism." },
    ],
    quiz: [
      {
        id: "cvp-q1",
        prompt: "A web server handles 100 slow database calls on a machine with a single CPU core. Which property makes it fast?",
        options: ["Parallelism", "Concurrency", "Neither — one core can only serve one request", "SIMD"],
        answer: 1,
        explanation: "The calls spend their time waiting. Interleaving lets the core serve other requests during each wait — concurrency without parallelism.",
      },
      {
        id: "cvp-q2",
        prompt: "What does `runtime.GOMAXPROCS(0)` do?",
        options: ["Disables parallelism", "Returns the current setting without changing it", "Sets it to the number of CPUs", "Panics"],
        answer: 1,
        explanation: "A value < 1 queries the current setting.",
      },
      {
        id: "cvp-q3",
        prompt: "In `go count(\"sheep\"); count(\"fish\")`, why might `3 sheep` never print?",
        options: ["Goroutines can't call fmt.Println", "main returning terminates the program without waiting for other goroutines", "The scheduler always runs main first", "time.Sleep cancels goroutines"],
        answer: 1,
        explanation: "Program exit happens when main returns; other goroutines are simply stopped.",
      },
    ],
    questions: ["go/go-01"],
  },
  // ───────────────────────────────────────────────────────── goroutines
  {
    slug: "goroutines",
    track: "go",
    title: "Goroutines",
    summary:
      "A goroutine is a function executing concurrently, managed by the Go runtime rather than the OS. It starts with a tiny growable stack, so programs can run hundreds of thousands of them — but nobody waits for them unless you make them.",
    level: "beginner",
    frequency: "very-high",
    minutes: 25,
    kinds: ["theory", "coding", "visualization"],
    status: "authored",
    prerequisites: ["go/concurrency-vs-parallelism", "go/functions"],
    related: ["go/gmp-scheduler", "go/goroutine-stacks", "go/waitgroup", "go/goroutine-leaks", "os/processes-threads"],
    tags: ["goroutine", "go statement", "runtime", "loop variable", "Go 1.22"],
    sources: [S.spec, S.effective, S.runtime, S.practice, S.pgl, N.goroutines],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Start goroutines with the `go` statement and know what is evaluated when.",
              "Explain why goroutines are far cheaper than OS threads.",
              "Wait for goroutines correctly instead of using `time.Sleep`.",
              "Know the Go 1.22 loop-variable change and why it fixed a classic bug.",
              "Know what happens when a goroutine panics.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Think of OS threads as a small team of workers and goroutines as a big pile of tickets. The Go runtime is the manager handing tickets to workers: when a ticket is waiting on something (network, channel, timer) it goes back on the shelf and the worker grabs another. You write straightforward blocking code; the runtime keeps the workers busy.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "The spec defines a `go` statement as starting the execution of a function call \"as an independent concurrent thread of control, or goroutine, within the same address space\". The function value and its arguments are **evaluated in the calling goroutine** at the `go` statement; then the call runs concurrently, and the caller does not wait. Return values are discarded.",
          },
          {
            type: "code",
            lang: "go",
            code: `go worker(id, jobs)        // named function
go func(msg string) {      // function literal, argument evaluated now
	fmt.Println(msg)
}("hello")`,
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "table",
            head: ["", "Goroutine", "OS thread"],
            rows: [
              ["Initial stack", "~2 KB, grows and shrinks by copying", "Fixed, typically 1–8 MB reserved"],
              ["Creation", "Runtime allocation, no syscall (sub-microsecond)", "Syscall (`clone`), kernel bookkeeping"],
              ["Switch", "User-space, saves a few registers", "Kernel context switch"],
              ["Scheduling", "Go runtime (G/M/P), cooperative + async preemption", "OS kernel scheduler"],
              ["Identity", "No public ID; cannot be killed from outside", "Has TID; can be signalled"],
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Numbers are runtime details",
            text: "The spec says nothing about stack size or cost. The 2 KB minimum stack has been the gc runtime's choice since Go 1.4, and since Go 1.19 the runtime may start goroutines with a larger stack based on the average observed stack usage.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: the goroutine that never prints",
        blocks: [
          {
            type: "p",
            text: "From the learner's practice code: `main` starts a goroutine and immediately returns.",
          },
          {
            type: "code",
            lang: "go",
            code: `package main

import "fmt"

func main() {
	go count()
}

func count() {
	for k := 0; k < 10; k++ {
		fmt.Println(k)
	}
}`,
            caption: "Almost always prints nothing — and that is not guaranteed either way.",
            output: ``,
          },
          {
            type: "steps",
            steps: [
              { title: "go count()", detail: "A new G is created and queued; `main` does not wait." },
              { title: "main returns", detail: "Returning from `main.main` calls `exit`. All other goroutines are terminated mid-flight, without running their defers." },
              { title: "Fix", detail: "Make `main` wait: a `sync.WaitGroup`, a done channel, or (in a real program) a context-aware shutdown. Never `time.Sleep` and hope." },
            ],
          },
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	for i := 0; i < 3; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			fmt.Println("goroutine", i) // Go 1.22+: each iteration has its own i
		}()
	}
	wg.Wait()
	fmt.Println("all done")
}`,
            caption: "Order of the goroutine lines may vary; one possible output:",
            output: `goroutine 2
goroutine 1
goroutine 0
all done`,
          },
          {
            type: "callout",
            tone: "warning",
            title: "Go 1.22 loop-variable semantics",
            text: "Before Go 1.22 a `for` loop had ONE variable `i` shared by all iterations, so goroutines usually printed `goroutine 3` three times. Since Go 1.22 each iteration declares a fresh variable. The rule applies per module, based on the `go` line in `go.mod` — a module declaring `go 1.21` still gets the old behaviour.",
          },
        ],
      },
      {
        id: "visualization",
        blocks: [
          { type: "viz", id: "go-scheduler", caption: "Goroutines (G) waiting in run queues and executing on OS threads (M) through processors (P)." },
          { type: "p", text: "Each `go` statement adds a G to the current P's queue; Ms bound to Ps take Gs from queues and run them. The scheduler lesson explains each part." },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "p",
            text: "`runtime.NumGoroutine()` counts live goroutines. A goroutine exists as soon as the `go` statement completes, even if it hasn't run yet:",
          },
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"runtime"
)

func main() {
	fmt.Println("before:", runtime.NumGoroutine())
	done := make(chan struct{})
	for i := 0; i < 3; i++ {
		go func() { <-done }() // parked until done is closed
	}
	fmt.Println("after:", runtime.NumGoroutine())
	close(done)
}`,
            output: `before: 1
after: 4`,
          },
          {
            type: "list",
            items: [
              "A blocked goroutine (on a channel, mutex, timer, network read) is *parked*: it consumes memory (its stack) but no CPU and no OS thread.",
              "Goroutines have no parent/child relationship for lifetime purposes: a goroutine keeps running after the function that started it returns.",
              "There is no API to kill a goroutine. Cancellation is cooperative — pass a `context.Context` or a done channel and have the goroutine check it.",
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "p",
            text: "**A panic in any goroutine crashes the whole program** unless that same goroutine recovers it. A `recover` in `main` cannot catch a panic from another goroutine:",
          },
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"time"
)

func main() {
	defer func() {
		if r := recover(); r != nil { // never sees the goroutine's panic
			fmt.Println("recovered:", r)
		}
	}()
	go func() {
		panic("boom")
	}()
	time.Sleep(100 * time.Millisecond)
	fmt.Println("unreachable")
}`,
            caption: "Goroutine numbers and paths vary; abridged:",
            output: `panic: boom

goroutine 19 [running]:
main.main.func2()
	.../main.go:16 +0x25
created by main.main in goroutine 1
exit status 2`,
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Using `time.Sleep` to \"wait\" for goroutines — it is a guess, slow when too long and wrong when too short.",
              "Calling `wg.Add(1)` *inside* the goroutine: `Wait` may run before the `Add` and return early.",
              "Starting a goroutine with no way to stop it (a leak) — every goroutine needs a defined exit path.",
              "Ignoring the return value or error of a function started with `go` — it is discarded; send it on a channel or store it.",
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
              { title: "Goroutine per task", points: ["Simplest code: blocking style", "Great for I/O-bound fan-out", "Unbounded count can exhaust memory or downstream services"] },
              { title: "Fixed worker pool", points: ["Bounded memory and load", "Natural backpressure", "More plumbing: job and result channels, shutdown"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "A goroutine is a function running concurrently under the Go runtime's scheduler. It starts with a ~2 KB stack that grows by copying, is created and switched in user space, and is multiplexed onto a small number of OS threads (M:N scheduling). Arguments to a `go` call are evaluated immediately; the caller doesn't wait, so you synchronize with WaitGroups, channels or context. An unrecovered panic in any goroutine kills the process.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "M:N model: many goroutines on few threads; blocking network I/O parks only the goroutine (netpoller), blocking syscalls cause the P to be handed off to another thread.",
              "Why no goroutine IDs? The Go team deliberately avoids goroutine-local storage; pass context explicitly instead.",
              "Memory per goroutine: at minimum the stack plus the `g` struct — roughly a few KB; a million parked goroutines is a few GB.",
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
              "`go f(x)` evaluates `f` and `x` now, runs the call concurrently, never waits.",
              "Goroutines are cheap (small growable stack, user-space switching) but not free.",
              "Always give goroutines a way to finish and a way for someone to wait for them.",
              "Go 1.22+: loop variables are per-iteration (module `go` version ≥ 1.22).",
              "Panics in goroutines must be recovered in that goroutine or the process dies.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Goroutine", definition: "A function executing concurrently, scheduled by the Go runtime." },
      { term: "go statement", definition: "`go f(args)` — evaluates f and args, then starts f in a new goroutine without waiting." },
      { term: "M:N scheduling", definition: "Multiplexing M user-level tasks onto N OS threads." },
      { term: "Parked", definition: "A goroutine that is blocked and not on any run queue; it uses memory but no CPU." },
      { term: "Goroutine leak", definition: "A goroutine that stays blocked forever, holding its memory." },
    ],
    followUps: [
      { q: "What is printed by `x := 1; go fmt.Println(x); x = 2` (with proper waiting)?", a: "`1`. Arguments are evaluated at the `go` statement, before `x = 2`." },
      { q: "How do you stop a goroutine from outside?", a: "You can't forcibly. Signal it (close a channel / cancel a context) and have it return when it observes the signal." },
      { q: "Does a goroutine die when the function that spawned it returns?", a: "No. Only the end of `main` (or `os.Exit`, or a crash) stops other goroutines." },
    ],
    quiz: [
      {
        id: "goroutines-q1",
        prompt: "In a module with `go 1.22` in go.mod, what does this print (ignoring order)?",
        code: { lang: "go", code: `var wg sync.WaitGroup
for i := 0; i < 3; i++ {
	wg.Add(1)
	go func() { defer wg.Done(); fmt.Print(i) }()
}
wg.Wait()` },
        options: ["333", "Some permutation of 012", "000", "It doesn't compile"],
        answer: 1,
        explanation: "Since Go 1.22 each iteration has its own `i`, so each goroutine prints a different value, in nondeterministic order.",
      },
      {
        id: "goroutines-q2",
        prompt: "A goroutine panics and `main` has `defer func(){ recover() }()`. What happens?",
        options: ["main recovers it", "The program crashes", "Only the goroutine dies", "The panic is ignored"],
        answer: 1,
        explanation: "recover only works in deferred calls of the panicking goroutine.",
      },
    ],
    questions: ["go/go-01", "go/go-24"],
  },

  // ───────────────────────────────────────────────────────── gmp-scheduler
  {
    slug: "gmp-scheduler",
    track: "go",
    title: "The G/M/P scheduler",
    summary:
      "How the Go runtime multiplexes goroutines (G) onto OS threads (M) through processors (P): local and global run queues, runnext, work stealing, the netpoller, syscall hand-off and preemption.",
    level: "advanced",
    frequency: "high",
    minutes: 35,
    kinds: ["theory", "visualization"],
    status: "authored",
    prerequisites: ["go/goroutines", "os/scheduling", "os/processes-threads"],
    related: ["go/goroutine-stacks", "go/concurrency-vs-parallelism", "go/profiling-pprof"],
    tags: ["scheduler", "GMP", "work stealing", "netpoller", "preemption", "sysmon"],
    sources: [S.runtime, S.schedSrc, S.diagnostics, S.pgl],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Name the three scheduler entities and the role of each.",
              "Trace how a newly created goroutine gets to run.",
              "Explain work stealing, the global run queue and fairness.",
              "Explain what happens to the thread and P when a goroutine blocks on network I/O vs a blocking syscall.",
              "Explain cooperative vs asynchronous preemption (Go 1.14).",
            ],
          },
        ],
      },
      {
        id: "prerequisites",
        blocks: [
          { type: "p", text: "You should know what an OS thread is and that the kernel schedules threads onto CPU cores. Go adds a second scheduler on top, inside your process." },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Picture a restaurant: **G**s are orders, **M**s are cooks (OS threads) and **P**s are cooking stations. A cook can only cook while standing at a station, and there are exactly GOMAXPROCS stations. Each station has its own small queue of orders; there's also a shared overflow queue. An idle cook at an empty station walks over and takes half of another station's orders.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Entity", "What it is", "How many"],
            rows: [
              ["G (goroutine)", "Stack, saved registers (PC, SP), status, the function to run", "As many as you create"],
              ["M (machine)", "An OS thread. Executes Go code only while holding a P", "Grows as needed (blocked threads in syscalls don't count); default cap 10,000 (`debug.SetMaxThreads`)"],
              ["P (processor)", "Scheduling context: a local run queue, the `runnext` slot, per-P caches (e.g. memory allocator cache)", "Exactly GOMAXPROCS"],
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "All of this is implementation",
            text: "The language spec only promises goroutines exist and run concurrently. G/M/P, queue sizes, the 61-tick check and stealing are details of the gc runtime (`runtime/proc.go`) and have changed between releases. They are, however, standard interview material.",
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "list",
            items: [
              "**Local run queue (LRQ)**: each P has a fixed-size circular queue of 256 runnable Gs. Lock-free for the owner, stealable by others.",
              "**runnext**: a one-G slot on each P. A goroutine readied by the running G (e.g. the receiver woken by a channel send, or a newly created G) goes here and runs next, inheriting the remaining time slice — good cache locality for producer/consumer pairs.",
              "**Global run queue (GRQ)**: an unbounded linked list protected by a lock. When a local queue is full, half of it (128 Gs) plus the new G is moved to the global queue.",
              "**Fairness**: every 61st scheduling tick, a P checks the global queue first, so Gs there can't starve behind busy local queues. 61 is prime to avoid lining up with other periodic patterns.",
              "**Work stealing**: a P with nothing to run checks its LRQ, the GRQ, the netpoller, then picks other Ps in random order and steals **half** of a victim's local queue.",
              "**Spinning Ms**: a few idle threads actively look for work for a short while before sleeping, trading a bit of CPU for low wake-up latency.",
            ],
          },
          {
            type: "steps",
            steps: [
              { title: "go f()", detail: "`newproc` allocates a G (reusing a dead one if possible), puts it in the current P's `runnext`; the previous runnext G is kicked to the tail of the LRQ." },
              { title: "Wake a P if idle", detail: "If there are idle Ps and no spinning Ms, the runtime wakes (or creates) an M to pick up the new work." },
              { title: "schedule()", detail: "An M with a P calls `schedule` → `findRunnable`: (every 61 ticks: GRQ) → runnext → LRQ → GRQ → netpoll → steal → GC idle work → park the M." },
              { title: "execute(g)", detail: "Switch to the G's stack and resume at its saved PC. It runs until it blocks, yields, finishes, or is preempted." },
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: blocking — network vs syscall",
        blocks: [
          {
            type: "compare",
            items: [
              {
                title: "Network I/O (netpoller)",
                points: [
                  "Sockets are put in non-blocking mode.",
                  "A read that would block parks the G on the netpoller (epoll on Linux, kqueue on BSD/macOS, IOCP on Windows).",
                  "The M and P immediately run another G — no thread is blocked.",
                  "When the FD becomes ready, netpoll returns the G to a run queue.",
                ],
              },
              {
                title: "Blocking syscall / cgo call",
                points: [
                  "The M really blocks in the kernel (e.g. some file I/O).",
                  "On entry the P is marked as in-syscall; if the syscall takes long, **sysmon** retakes the P and hands it to another M (idle or new).",
                  "When the syscall returns, the old M tries to reacquire a P; if none is free, it puts its G on the global queue and goes idle.",
                  "This is why a Go program can have many more threads than GOMAXPROCS.",
                ],
              },
            ],
          },
          {
            type: "p",
            text: "**sysmon** is a runtime thread that runs without a P. It wakes periodically (20 µs up to 10 ms) to retake Ps from long syscalls, poll the network if nobody has recently, and request preemption of goroutines that have run for more than ~10 ms.",
          },
        ],
      },
      {
        id: "memory",
        title: "Preemption",
        blocks: [
          {
            type: "p",
            text: "Before Go 1.14 preemption was **cooperative**: a goroutine could only be descheduled at a safe point, chiefly the stack-check in function prologues. A tight loop without calls (`for {}`) could hog a P forever and stall GC's stop-the-world.",
          },
          {
            type: "p",
            text: "Go 1.14 added **asynchronous preemption**: sysmon sends the thread a signal (`SIGURG` on Unix), the signal handler checks the goroutine is at an async-safe point and injects a call to the scheduler. So this program finishes on modern Go even with a single P:",
          },
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"runtime"
	"time"
)

func main() {
	runtime.GOMAXPROCS(1) // one P: only one goroutine runs Go code at a time
	go func() {
		for { // tight loop, no function calls
		}
	}()
	time.Sleep(10 * time.Millisecond)
	fmt.Println("main still gets scheduled")
}`,
            caption: "Go 1.14+; on Go ≤ 1.13 this could hang forever.",
            output: `main still gets scheduled`,
          },
        ],
      },
      {
        id: "visualization",
        blocks: [
          { type: "viz", id: "go-scheduler", caption: "Conceptual: Ps with local run queues, the global queue, work stealing, and a syscall hand-off." },
          {
            type: "p",
            text: "You can watch the real scheduler with `GODEBUG=schedtrace=1000`, which prints a line every second: global queue length (`runqueue`) and each P's local queue length in brackets.",
          },
          {
            type: "code",
            lang: "bash",
            code: `GOMAXPROCS=4 GODEBUG=schedtrace=1000 ./busy   # 1000 CPU-bound goroutines`,
            caption: "Real output from Go 1.26 (fields vary by version):",
            output: `SCHED 0ms: gomaxprocs=4 idleprocs=2 threads=4 spinningthreads=1 needspinning=0 idlethreads=0 runqueue=0 [ 2 0 0 0 ] schedticks=[ 0 0 0 0 ]
SCHED 1007ms: gomaxprocs=4 idleprocs=0 threads=5 spinningthreads=0 needspinning=1 idlethreads=0 runqueue=590 [ 158 92 78 78 ] schedticks=[ 53 52 51 52 ]`,
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "`runtime.LockOSThread` wires a G to its M (needed for some C libraries, OpenGL, namespaces). While locked, that M runs only that G.",
              "`runtime.Gosched()` voluntarily yields: the G goes to the global queue. Rarely needed since 1.14.",
              "Containers: if GOMAXPROCS exceeds the container's CPU quota, threads get throttled by the kernel. Go 1.25+ considers cgroup CPU limits on Linux by default.",
              "cgo calls behave like blocking syscalls: each concurrent cgo call can occupy a thread.",
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
              { title: "Why the P exists", points: ["Before Go 1.1 there was one global queue with one lock — a contention bottleneck", "Per-P queues and caches make the common path lock-free", "Decouples \"threads that exist\" from \"threads running Go code\""] },
              { title: "Costs of the design", points: ["Complex runtime code", "Fairness is approximate, not strict FIFO", "Spinning threads burn some CPU to cut latency"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Go uses M:N scheduling with three entities: G is a goroutine, M is an OS thread, P is a processor context holding a local run queue; there are GOMAXPROCS Ps and an M needs a P to run Go code. New goroutines go into the current P's `runnext`/local queue (256 slots), overflow goes to a global queue that is checked every 61 ticks for fairness, and idle Ps steal half of another P's queue. Network I/O parks goroutines on the netpoller without blocking threads; for blocking syscalls sysmon hands the P to another M. Since Go 1.14 goroutines are preempted asynchronously via signals.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Why steal *half*? It amortizes the cost of stealing and balances load quickly in both directions.",
              "Why does runnext exist? A sender waking a receiver can hand off the CPU directly, keeping data hot in cache — but a pair could ping-pong forever, so runnext inherits the time slice instead of getting a fresh one.",
              "How does GC interact? Stop-the-world phases need every G at a safe point — async preemption made this bounded even for tight loops.",
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
              "G = goroutine, M = OS thread, P = context with a 256-slot local run queue; #P = GOMAXPROCS.",
              "runnext → local queue → global queue (checked every 61 ticks) → netpoller → steal half.",
              "Network I/O parks the G; blocking syscalls get the P handed off by sysmon.",
              "Async preemption since Go 1.14; before that only at function calls.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "G", definition: "Runtime representation of a goroutine: stack, registers, status." },
      { term: "M", definition: "An OS thread managed by the runtime." },
      { term: "P", definition: "A scheduling context required to run Go code; holds a local run queue. Count = GOMAXPROCS." },
      { term: "runnext", definition: "Per-P slot for the goroutine that should run next, used for locality." },
      { term: "Work stealing", definition: "An idle P taking half the runnable goroutines from another P's queue." },
      { term: "Netpoller", definition: "Runtime integration with epoll/kqueue/IOCP that parks goroutines waiting on network I/O." },
      { term: "sysmon", definition: "Background runtime thread (no P) that retakes Ps from syscalls and triggers preemption." },
      { term: "Asynchronous preemption", definition: "Signal-based interruption of a running goroutine at an async-safe point (Go 1.14+)." },
    ],
    followUps: [
      { q: "Can a Go program have more OS threads than GOMAXPROCS?", a: "Yes. GOMAXPROCS limits threads *executing Go code*. Threads blocked in syscalls or cgo, sysmon, and idle threads are extra." },
      { q: "What happens to a goroutine blocked on `conn.Read`?", a: "It is parked on the netpoller; its M and P go on to run other goroutines. When data arrives the G becomes runnable again." },
      { q: "Why is the check of the global queue every 61 ticks needed?", a: "If two goroutines keep re-readying each other via runnext/local queue, Gs in the global queue could starve. The periodic check guarantees progress." },
      { q: "What was the problem with the Go 1.0 scheduler?", a: "A single global run queue with a global mutex; no per-P caches. It scaled poorly with cores. Dmitry Vyukov's Go 1.1 redesign introduced P and work stealing." },
    ],
    quiz: [
      {
        id: "gmp-q1",
        prompt: "How many Ps does a Go program have?",
        options: ["One per goroutine", "One per OS thread", "GOMAXPROCS", "Always the number of physical cores"],
        answer: 2,
        explanation: "The number of Ps equals GOMAXPROCS.",
      },
      {
        id: "gmp-q2",
        prompt: "An idle P finds its local queue empty and the global queue empty. What does it do next (roughly)?",
        options: ["Exit the thread", "Poll the network, then steal half of another P's local queue", "Steal exactly one goroutine", "Block until GC"],
        answer: 1,
        explanation: "findRunnable checks netpoll and then tries to steal half of a random victim P's run queue.",
      },
      {
        id: "gmp-q3",
        prompt: "What changed in Go 1.14?",
        options: ["Goroutine stacks became 2 KB", "Asynchronous, signal-based preemption", "Work stealing was introduced", "GOMAXPROCS defaulted to NumCPU"],
        answer: 1,
        explanation: "2 KB stacks came in 1.4, work stealing in 1.1, GOMAXPROCS=NumCPU in 1.5; async preemption in 1.14.",
      },
    ],
    questions: ["go/go-02"],
  },

  // ───────────────────────────────────────────────────────── goroutine-stacks
  {
    slug: "goroutine-stacks",
    track: "go",
    title: "Goroutine stacks: small, growable, copyable",
    summary:
      "Goroutines start with a tiny stack that the runtime grows by allocating a bigger one and copying frames over, fixing up pointers. That is what makes millions of goroutines feasible — and why Go never lets you keep a raw pointer into a stack from C.",
    level: "advanced",
    frequency: "medium",
    minutes: 20,
    kinds: ["theory"],
    status: "authored",
    prerequisites: ["go/goroutines", "go/stack-vs-heap"],
    related: ["go/gmp-scheduler", "go/escape-analysis", "go/garbage-collection"],
    tags: ["stack", "stack growth", "contiguous stacks", "morestack"],
    sources: [S.runtime, S.schedSrc, { label: "Go 1.4 release notes (stack size)", url: "https://go.dev/doc/go1.4", kind: "docs" }, { label: "Go 1.19 release notes (initial stack sizing)", url: "https://go.dev/doc/go1.19", kind: "docs" }],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain how a goroutine stack starts small and grows.",
              "Describe the function-prologue stack check and `morestack`.",
              "Compare segmented stacks (old) with contiguous copying stacks (current).",
              "Know the maximum stack size and what a stack overflow looks like.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Instead of reserving a huge fixed region for every goroutine \"just in case\", Go gives each one a small notebook. When it runs out of pages, the runtime buys a notebook twice as big, copies everything over and throws the old one away.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "list",
            items: [
              "Initial stack: **2 KB** (since Go 1.4; it was 8 KB in 1.2–1.3, 4 KB before).",
              "Growth: **double** the size, copy all frames, adjust pointers that point into the stack.",
              "Shrink: during garbage collection, a goroutine using less than a quarter of its stack may get it halved.",
              "Maximum: 1 GB on 64-bit, 250 MB on 32-bit (adjustable via `debug.SetMaxStack`).",
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Implementation details",
            text: "None of these numbers are in the spec. Since Go 1.19 the runtime may choose a larger *initial* stack based on the average stack usage it observed, to avoid repeated early growth.",
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Prologue check", detail: "Most functions start with a compiler-inserted comparison: is SP below `g.stackguard0`? (Tiny leaf functions marked NOSPLIT skip it.)" },
              { title: "morestack", detail: "If the frame won't fit, call `runtime.morestack` → `newstack`." },
              { title: "Allocate and copy", detail: "Allocate a stack twice the size, copy the used portion, and walk frames using compiler-generated stack maps to adjust every pointer that points into the old stack." },
              { title: "Resume", detail: "Free the old stack and re-run the function prologue on the new stack." },
            ],
          },
          {
            type: "p",
            text: "The same prologue check doubles as a cooperative preemption point: the runtime can set `stackguard0` to a poison value so the next call enters the scheduler instead of growing.",
          },
          {
            type: "compare",
            items: [
              { title: "Segmented stacks (≤ Go 1.2)", points: ["Grow by linking a new segment", "No copying", "\"Hot split\": a call at a segment boundary inside a loop allocates/frees a segment every iteration"] },
              { title: "Contiguous stacks (Go 1.3+)", points: ["Grow by copying to a 2× region", "Amortized O(1) growth", "Requires precise knowledge of every pointer into the stack"] },
            ],
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "p",
            text: "Deep recursion that would overflow a typical 8 MB thread stack in C works fine, because the goroutine stack just keeps doubling as needed:",
          },
          {
            type: "code",
            lang: "go",
            code: `package main

import "fmt"

func depth(n int) int {
	var pad [64]byte // make each frame a bit bigger
	_ = pad
	if n == 0 {
		return 0
	}
	return depth(n-1) + 1
}

func main() {
	fmt.Println(depth(1_000_000))
}`,
            output: `1000000`,
          },
          {
            type: "p",
            text: "Unbounded recursion eventually hits the limit and the runtime aborts (not a recoverable panic):",
          },
          {
            type: "code",
            lang: "text",
            code: `runtime: goroutine stack exceeds 1000000000-byte limit
fatal error: stack overflow`,
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "Because stacks move, Go pointers to stack data must never be held by C code (cgo pointer-passing rules) — escape analysis moves such values to the heap.",
              "`unsafe.Pointer` arithmetic stored as `uintptr` is not updated when the stack moves.",
              "Stack growth is a cost on hot paths: a goroutine that repeatedly grows from 2 KB in a deep call chain pays copying each time it is newly created.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Each goroutine starts with a small stack (2 KB in the gc runtime since Go 1.4). Function prologues check for room; if not, the runtime allocates a stack twice as large, copies the frames and fixes up pointers into the stack, then continues. Stacks shrink during GC. This replaced segmented stacks in Go 1.3 to fix the hot-split problem. The max is 1 GB on 64-bit, after which you get a fatal stack overflow.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Small initial stack → cheap goroutines.",
              "Grow by doubling + copy; shrink during GC.",
              "Prologue stack check is also a cooperative preemption point.",
              "Stack overflow at 1 GB (64-bit) is fatal, not a panic.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Stack frame", definition: "The region of a stack holding one function call's locals, arguments and return address." },
      { term: "morestack", definition: "Runtime routine called from a function prologue when the stack needs to grow." },
      { term: "Hot split", definition: "Pathology of segmented stacks where a loop repeatedly allocates and frees a stack segment at a boundary." },
      { term: "Stack map", definition: "Compiler metadata describing which stack slots hold pointers at each safe point." },
    ],
    followUps: [
      { q: "Why can't Go just use OS thread stacks for goroutines?", a: "OS stacks are large and fixed (MBs reserved), so a million goroutines would need terabytes of address space; growable stacks keep the common case tiny." },
      { q: "Is stack overflow recoverable with recover()?", a: "No. It is a fatal runtime error, not a panic." },
    ],
    quiz: [
      {
        id: "stacks-q1",
        prompt: "How does a goroutine stack grow in modern Go?",
        options: ["Linking a new segment", "Allocating a 2× stack and copying frames", "The OS extends it automatically", "It doesn't; it is fixed at 2 KB"],
        answer: 1,
        explanation: "Contiguous stacks (Go 1.3+) are grown by copying to a larger allocation.",
      },
      {
        id: "stacks-q2",
        prompt: "What fixed the 'hot split' problem?",
        options: ["Async preemption", "Contiguous copying stacks", "Escape analysis", "GOMAXPROCS"],
        answer: 1,
        explanation: "Copying stacks don't free/allocate segments at a boundary in a loop.",
      },
    ],
    questions: ["go/go-01"],
  },

  // ───────────────────────────────────────────────────────── channels
  {
    slug: "channels",
    track: "go",
    title: "Channels: unbuffered vs buffered",
    summary:
      "A channel is a typed, goroutine-safe queue that also synchronizes. Unbuffered channels are a rendezvous — sender and receiver meet; buffered channels decouple them up to a capacity. Inside, it is a lock, a ring buffer and two queues of waiting goroutines.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 35,
    kinds: ["theory", "coding", "visualization"],
    status: "authored",
    prerequisites: ["go/goroutines"],
    related: ["go/channel-close-range", "go/select", "go/mutex", "go/worker-pool", "go/race-deadlock-livelock"],
    tags: ["channel", "unbuffered", "buffered", "hchan", "sudog", "happens-before", "deadlock"],
    sources: [S.spec, S.memModel, S.effective, S.chanSrc, S.practice, S.pgl, N.channels, N.chanSync],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Create, send on, receive from and type-restrict channels.",
              "Predict exactly when a send or receive blocks for unbuffered and buffered channels.",
              "Explain the `hchan` structure: ring buffer, sendq/recvq, lock.",
              "Use channels for synchronization (happens-before), not only for data.",
              "Recognise the \"all goroutines are asleep\" deadlock.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "An **unbuffered** channel is handing a parcel to someone in person: you both have to be there, and when the handover is done you both *know* it happened. A **buffered** channel is a mailbox with N slots: you can drop off parcels and leave, until the box is full; the recipient picks them up later.",
          },
          {
            type: "callout",
            tone: "tip",
            title: "Go proverb",
            text: "\"Don't communicate by sharing memory; share memory by communicating.\" Pass ownership of data through a channel instead of having two goroutines touch it under a lock — when it fits the problem.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `ch := make(chan int)       // unbuffered (capacity 0)
buf := make(chan int, 3)   // buffered, capacity 3
var nilCh chan int         // nil channel: blocks forever on send and receive

ch <- 42       // send
v := <-ch      // receive
v, ok := <-ch  // ok == false only if ch is closed and drained

func producer(out chan<- int) {} // send-only parameter
func consumer(in <-chan int)  {} // receive-only parameter`,
          },
          {
            type: "table",
            head: ["Operation", "Unbuffered", "Buffered (cap N)"],
            rows: [
              ["Send blocks until…", "a receiver takes the value", "there is a free slot (len < N)"],
              ["Receive blocks until…", "a sender offers a value", "the buffer is non-empty"],
              ["Guarantee when send returns", "the receiver has the value", "the value is in the buffer (maybe nobody has read it)"],
              ["`len(ch)` / `cap(ch)`", "0 / 0", "items queued / N"],
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
              "**Data transfer + synchronization in one primitive**: the receive also tells you the sender reached that point.",
              "**Ownership hand-off**: after sending a pointer, the sender should stop touching it; the receiver now owns it.",
              "**Bounded queues**: a buffered channel is a ready-made backpressure mechanism — producers slow down when consumers fall behind.",
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: the rendezvous",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"time"
)

func main() {
	ch := make(chan string) // unbuffered
	go func() {
		time.Sleep(100 * time.Millisecond)
		fmt.Println("receiver: ready")
		fmt.Println("receiver: got", <-ch)
	}()
	fmt.Println("sender: sending")
	ch <- "ping" // blocks until the receiver takes it
	fmt.Println("sender: send completed")
	time.Sleep(10 * time.Millisecond)
}`,
            caption: "The first three lines are always in this order; the last two may swap.",
            output: `sender: sending
receiver: ready
receiver: got ping
sender: send completed`,
          },
          {
            type: "steps",
            steps: [
              { title: "Send with no receiver", detail: "main locks the channel, sees an empty `recvq`, wraps itself in a `sudog` (waiting-goroutine record holding a pointer to the value) on `sendq`, and parks." },
              { title: "Receiver arrives", detail: "The goroutine locks the channel, finds main in `sendq`, copies the value directly out of the sender's sudog, and marks main runnable." },
              { title: "Both continue", detail: "Now both goroutines are runnable; which prints first is up to the scheduler." },
            ],
          },
          {
            type: "p",
            text: "Using a channel purely as a signal (from the learner's practice code): main does other work, then blocks until the helper says it's finished.",
          },
          {
            type: "code",
            lang: "go",
            code: `package main

import "fmt"

func main() {
	c := make(chan int)
	go func() {
		sum := 0
		for i := range 100 { // range over an int: Go 1.22+
			sum += i
		}
		c <- sum // blocks until main receives
	}()
	fmt.Println(<-c)
}`,
            output: `4950`,
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "p",
            text: "`make(chan T, n)` allocates an `hchan` struct on the heap and returns a pointer to it — which is why channels behave like references when passed to functions.",
          },
          {
            type: "table",
            head: ["hchan field", "Purpose"],
            rows: [
              ["`buf`, `dataqsiz`, `qcount`", "Circular buffer of `dataqsiz` elements, `qcount` in use (nil/0 for unbuffered)"],
              ["`sendx`, `recvx`", "Ring indices for the next send/receive slot"],
              ["`sendq`, `recvq`", "FIFO queues of parked goroutines (`sudog`s) waiting to send/receive"],
              ["`closed`", "Set by `close`"],
              ["`lock`", "A runtime mutex protecting all of the above"],
            ],
          },
          {
            type: "list",
            items: [
              "**Send** (lock held): if a receiver is waiting → copy straight into it and wake it (skips the buffer). Else if buffer has room → copy into `buf[sendx]`. Else → enqueue on `sendq` and park.",
              "**Receive**: if a sender is waiting → for unbuffered, copy from it; for a full buffer, take the head item and move the waiting sender's value to the tail. Else if buffer non-empty → take `buf[recvx]`. Else if closed → zero value, `ok=false`. Else → park on `recvq`.",
              "Woken goroutines are put in the waker's P `runnext`, so hand-offs are fast.",
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Spec vs runtime",
            text: "The spec and memory model define blocking and ordering. `hchan`, `sudog`, direct stack-to-stack copy and `runnext` hand-off are gc runtime details from `runtime/chan.go`.",
          },
          {
            type: "p",
            text: "**Memory model guarantees** (go.dev/ref/mem): a send happens-before the corresponding receive completes; for unbuffered channels the receive happens-before the send completes; closing happens-before a receive that returns because the channel is closed; and the k-th receive on a channel with capacity C happens-before the (k+C)-th send completes — which is why a buffered channel works as a counting semaphore.",
          },
        ],
      },
      {
        id: "visualization",
        blocks: [
          { type: "viz", id: "go-channels", caption: "Senders and receivers blocking and unblocking on an unbuffered vs a buffered channel." },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import "fmt"

func main() {
	ch := make(chan int, 2)
	ch <- 1
	ch <- 2 // buffer now full; a third send would block
	fmt.Println(len(ch), cap(ch))
	fmt.Println(<-ch, <-ch) // FIFO
}`,
            output: `2 2
1 2`,
          },
          {
            type: "p",
            text: "The classic beginner deadlock: sending on an unbuffered channel in `main` with nobody to receive. The runtime notices that *every* goroutine is blocked and aborts:",
          },
          {
            type: "code",
            lang: "go",
            code: `package main

import "fmt"

func main() {
	ch := make(chan int)
	ch <- 1 // no receiver can ever arrive
	fmt.Println(<-ch)
}`,
            caption: "File path abridged:",
            output: `fatal error: all goroutines are asleep - deadlock!

goroutine 1 [chan send]:
main.main()
	.../main.go:7 +0x36
exit status 2`,
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "table",
            head: ["Operation", "nil channel", "closed channel", "open channel"],
            rows: [
              ["send", "blocks forever", "**panic**", "blocks or succeeds"],
              ["receive", "blocks forever", "buffered values, then zero value + `ok=false` immediately", "blocks or succeeds"],
              ["close", "**panic**", "**panic**", "succeeds"],
            ],
          },
          {
            type: "callout",
            tone: "misconception",
            title: "Deadlock detection is global only",
            text: "\"all goroutines are asleep\" fires only when *no* goroutine can run. If a single goroutine is stuck but others (an HTTP server, a ticker) are alive, the runtime says nothing — that is a goroutine leak.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Using a buffered channel to \"fix\" a deadlock: it only delays it until the buffer fills.",
              "Assuming a buffered send means the value was processed. Only an unbuffered send (or an explicit reply) proves that.",
              "Huge buffers to absorb bursts — they hide slow consumers and use memory; size buffers deliberately.",
              "Passing `chan T` everywhere instead of directional `chan<- T` / `<-chan T`, losing compiler checks of who may send.",
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
              { title: "Unbuffered", points: ["Strong synchronization: send completion ⇒ received", "Easy to reason about", "Each hand-off needs both sides ready → more blocking"] },
              { title: "Buffered", points: ["Absorbs short bursts, fewer context switches", "Works as a semaphore / bounded queue", "Weaker guarantees; buffer size is a tuning decision"] },
              { title: "Mutex instead", points: ["Faster for guarding a small piece of shared state", "No ownership transfer semantics", "Better when many goroutines read/update the same struct"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "A channel is a typed, thread-safe FIFO that also synchronizes goroutines. With an unbuffered channel a send blocks until a receiver takes the value — a rendezvous, so completion proves delivery. A buffered channel of capacity N lets sends proceed until N items are queued, and receives block only when it's empty. Internally it's an `hchan` with a lock, a ring buffer and queues of waiting senders/receivers; a waiting receiver gets the value copied directly. Sending on a closed channel panics, receiving from one returns the zero value and false, and nil channels block forever.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "A buffered channel of capacity N with `struct{}` elements is a counting semaphore: send to acquire, receive to release.",
              "`chan struct{}` costs zero bytes per element — the idiomatic \"signal only\" channel.",
              "Channel operations are much slower than an uncontended mutex (they take a lock and may involve scheduling); don't use a channel where a counter or mutex is the natural fit.",
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
              "Unbuffered = rendezvous; buffered = mailbox with N slots.",
              "nil: block forever; closed: send panics, receive drains then zero/false.",
              "hchan = lock + ring buffer + sendq/recvq of sudogs.",
              "Channels establish happens-before; use them for ownership hand-off and signaling.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Channel", definition: "A typed conduit for sending values between goroutines with built-in synchronization." },
      { term: "Unbuffered channel", definition: "Capacity 0: send and receive must happen together (rendezvous)." },
      { term: "Buffered channel", definition: "Has a queue of fixed capacity; sends block only when full." },
      { term: "hchan", definition: "Runtime struct backing a channel: lock, ring buffer, wait queues, closed flag." },
      { term: "sudog", definition: "Runtime record representing a goroutine waiting on a channel (or other sync object)." },
      { term: "Happens-before", definition: "Memory-model ordering: if A happens-before B, B is guaranteed to see A's effects." },
      { term: "Directional channel", definition: "`chan<- T` (send-only) or `<-chan T` (receive-only) types restricting usage." },
    ],
    followUps: [
      { q: "What do `len` and `cap` return on an unbuffered channel?", a: "Both 0." },
      { q: "Is it safe to send on a channel from many goroutines at once?", a: "Yes — channel operations are synchronized internally. Closing it concurrently with sends is not safe (send on closed panics)." },
      { q: "Why does a receive from a waiting sender on a full buffered channel take from the buffer head rather than from the sender?", a: "To preserve FIFO order: the buffered items were sent first. The waiting sender's value moves to the tail." },
    ],
    quiz: [
      {
        id: "channels-q1",
        prompt: "What happens?",
        code: { lang: "go", code: `ch := make(chan int, 1)
ch <- 1
ch <- 2
fmt.Println(<-ch)` },
        options: ["Prints 1", "Prints 2", "fatal error: all goroutines are asleep - deadlock!", "panic: channel full"],
        answer: 2,
        explanation: "The second send blocks because the buffer (cap 1) is full and no other goroutine exists to receive.",
      },
      {
        id: "channels-q2",
        prompt: "After `ch <- v` returns on an **unbuffered** channel, what do you know?",
        options: ["Nothing", "A receiver has received v", "v is in the buffer", "The receiver finished processing v"],
        answer: 1,
        explanation: "Unbuffered send completes only when a receiver takes the value. Processing afterwards is not implied.",
      },
      {
        id: "channels-q3",
        prompt: "Receiving from a nil channel…",
        options: ["panics", "returns zero value", "blocks forever", "returns zero, false"],
        answer: 2,
        explanation: "Nil channels are never ready, which is useful to disable select cases.",
      },
    ],
    questions: ["go/go-03", "go/go-04", "go/go-09"],
  },

  // ───────────────────────────────────────────────────────── channel-close-range
  {
    slug: "channel-close-range",
    track: "go",
    title: "Closing channels and ranging over them",
    summary:
      "`close` means \"no more values will be sent\". Receivers drain what's buffered, then get the zero value with ok=false, and `for range` ends. The rule that keeps programs panic-free: only the sender — and only one of them — closes.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 25,
    kinds: ["theory", "coding", "visualization"],
    status: "authored",
    prerequisites: ["go/channels"],
    related: ["go/select", "go/worker-pool", "go/waitgroup", "go/goroutine-leaks"],
    tags: ["close", "range", "comma-ok", "pipeline", "ownership"],
    sources: [S.spec, S.pipelines, S.memModel, S.pgl, N.close, N.range],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain exactly what `close` does and does not do.",
              "Use the comma-ok receive and `for v := range ch`.",
              "Apply the ownership rule: who closes, and how to close with many senders.",
              "Build a small pipeline whose stages shut down cleanly.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Closing a channel is the producer saying \"that's the last parcel\". It does not destroy the channel or empty it; it broadcasts end-of-stream to every current and future receiver at once.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "list",
            items: [
              "`close(ch)` records that no more values will be sent. Values already buffered are still delivered.",
              "After the buffer is drained, receives return immediately with the zero value; `v, ok := <-ch` gives `ok == false`.",
              "`for v := range ch` receives until the channel is closed **and** drained.",
              "Sending on a closed channel panics; closing a closed or nil channel panics.",
              "Closing is a **broadcast**: all goroutines blocked receiving wake up at once — unlike a send, which wakes one.",
            ],
          },
          {
            type: "code",
            lang: "go",
            code: `package main

import "fmt"

func main() {
	ch := make(chan int, 3)
	ch <- 1
	ch <- 2
	close(ch) // no more sends; buffered values are still delivered

	for v := range ch { // stops after the buffer is drained
		fmt.Println("got", v)
	}

	v, ok := <-ch // closed and empty
	fmt.Println(v, ok)
}`,
            output: `got 1
got 2
0 false`,
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "Ends `range` loops in consumers so they can return (prevents leaks).",
              "Broadcast cancellation: `close(done)` wakes every goroutine selecting on `<-done` — the mechanism under `context.Context.Done()`.",
              "You do **not** need to close a channel to free it; unreachable channels are garbage collected. Close only to signal.",
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: a pipeline (after go.dev/blog/pipelines)",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import "fmt"

// gen owns out: it is the only sender, so it is the one that closes.
func gen(nums ...int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for _, n := range nums {
			out <- n
		}
	}()
	return out
}

func sq(in <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for n := range in { // ends when gen closes its channel
			out <- n * n
		}
	}()
	return out
}

func main() {
	for v := range sq(gen(1, 2, 3, 4)) {
		fmt.Println(v)
	}
}`,
            output: `1
4
9
16`,
          },
          {
            type: "steps",
            steps: [
              { title: "Each stage owns its output", detail: "The goroutine that creates and writes `out` is the only one that closes it, via `defer close(out)`." },
              { title: "Close cascades", detail: "gen finishes → closes → sq's range ends → sq closes → main's range ends." },
              { title: "Return receive-only", detail: "Returning `<-chan int` makes it a compile error for callers to send on or close the channel." },
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "p",
            text: "In the runtime, `close` takes the channel lock, sets `closed`, then releases **all** waiting receivers (they get zero values) and all waiting senders (they panic when they resume). The memory model guarantees the close happens-before any receive that returns because of it.",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "There's intentionally no `isClosed(ch)` function: any answer would be stale by the time you act on it. Design so that the owner knows when to close.",
          },
        ],
      },
      {
        id: "visualization",
        blocks: [
          { type: "viz", id: "go-channels", caption: "Try closing a buffered channel: receivers drain the buffer first, then see ok=false." },
        ],
      },
      {
        id: "edge-cases",
        title: "Many senders: who closes?",
        blocks: [
          {
            type: "list",
            items: [
              "**One sender** → the sender closes when done.",
              "**Many senders, one channel** → no sender closes it. A coordinator waits for all senders (`sync.WaitGroup`) and then closes: `go func() { wg.Wait(); close(results) }()`.",
              "**Receiver wants to stop senders** → the receiver must not close the data channel. Close a separate `done` channel (or cancel a context) that senders `select` on.",
            ],
          },
          {
            type: "code",
            lang: "text",
            code: `panic: send on closed channel
panic: close of closed channel
panic: close of nil channel`,
            caption: "The three runtime panics close() rules prevent.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Closing from the receiver side while senders are still running → send-on-closed panic.",
              "Forgetting to close → consumers ranging over the channel block forever (leak, or global deadlock).",
              "Closing inside a loop that may run twice → close-of-closed panic. `sync.Once` can guard a close that may be triggered from several places.",
              "Treating the zero value from a closed channel as real data — use comma-ok when zero is a valid value.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "`close(ch)` signals that no more values will come. Buffered values are still delivered; after that, receives return the zero value with ok=false and `range` loops exit. Close is a broadcast that wakes all receivers. Sending on a closed channel or closing twice panics, so the rule is: the sender closes, never the receiver; with multiple senders a coordinator closes after a WaitGroup, and receivers signal senders through a separate done channel or context. Channels don't need closing for GC.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Close = end-of-stream broadcast, not cleanup.",
              "Receivers: drain, then zero + ok=false; range stops.",
              "Owner (single sender) closes; multiple senders → WaitGroup + closer goroutine.",
              "Receivers stop senders via done/context, never by closing the data channel.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "close", definition: "Built-in that marks a channel as having no more sends." },
      { term: "Comma-ok receive", definition: "`v, ok := <-ch`; ok is false when the channel is closed and empty." },
      { term: "Pipeline", definition: "Stages connected by channels, each a goroutine receiving from upstream and sending downstream." },
      { term: "Channel owner", definition: "The goroutine responsible for creating, writing to and closing a channel." },
    ],
    followUps: [
      { q: "Do I have to close every channel?", a: "No. Close only when receivers need to know no more values are coming (e.g. they range over it). Unreferenced channels are garbage collected." },
      { q: "How do you safely close a channel that several goroutines might want to close?", a: "Guard with `sync.Once`, or better, restructure so a single owner closes." },
      { q: "Can you reopen a closed channel?", a: "No. Make a new one." },
    ],
    quiz: [
      {
        id: "close-q1",
        prompt: "What does this print?",
        code: { lang: "go", code: `ch := make(chan string, 2)
ch <- "a"
close(ch)
v1, ok1 := <-ch
v2, ok2 := <-ch
fmt.Printf("%q %v %q %v\\n", v1, ok1, v2, ok2)` },
        options: [`"a" true "" false`, `"a" false "" false`, "panic", `"a" true "a" true`],
        answer: 0,
        explanation: "The buffered \"a\" is still delivered with ok=true; then the channel is closed and empty: zero value and false.",
      },
      {
        id: "close-q2",
        prompt: "Three worker goroutines send to `results`. Who should close it?",
        options: ["Each worker after its last send", "The receiver", "A separate goroutine after wg.Wait()", "Nobody ever"],
        answer: 2,
        explanation: "Only after all senders are done is closing safe; a WaitGroup plus a closer goroutine expresses that.",
      },
    ],
    questions: ["go/go-04"],
  },

  // ───────────────────────────────────────────────────────── select
  {
    slug: "select",
    track: "go",
    title: "select: waiting on many channels",
    summary:
      "`select` blocks until one of several channel operations can proceed, picking uniformly at random among ready cases. With `default` it never blocks; with nil channels you can switch cases off; with `time.After` or `ctx.Done()` you get timeouts and cancellation.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 30,
    kinds: ["theory", "coding", "visualization"],
    status: "authored",
    prerequisites: ["go/channels", "go/channel-close-range"],
    related: ["go/context", "go/goroutine-leaks", "go/backpressure-bounded-concurrency"],
    tags: ["select", "timeout", "default", "nil channel", "for-select"],
    sources: [S.spec, S.pipelines, S.chanSrc, S.pgl, N.select],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Write select statements with receive, send, default and timeout cases.",
              "Explain how select chooses when several cases are ready.",
              "Use nil channels to disable cases and the for-select loop with a done channel.",
              "Avoid the leak in the naive timeout pattern.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "`select` is a receptionist watching several doors. She waits until someone shows up at *any* door and serves that person. If several arrive at once she picks one at random so no door is always favoured. With a `default` case she doesn't wait at all — if nobody is there right now, she does something else.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `select {
case v := <-in:          // receive
	use(v)
case out <- x:           // send
	sent()
case <-ctx.Done():       // cancellation
	return ctx.Err()
case <-time.After(time.Second): // timeout
	return errTimeout
default:                 // optional: makes select non-blocking
	doSomethingElse()
}`,
          },
          {
            type: "steps",
            steps: [
              { title: "Evaluate", detail: "All channel expressions and right-hand sides of sends are evaluated once, in source order, on entering select (even for cases that won't be chosen)." },
              { title: "Choose", detail: "If one or more cases can proceed, one is chosen by **uniform pseudo-random selection**." },
              { title: "Else default", detail: "If none is ready and there's a `default`, it runs." },
              { title: "Else block", detail: "Otherwise the goroutine blocks until some case can proceed. `select {}` with no cases blocks forever." },
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "list",
            items: [
              "The runtime (`selectgo`) shuffles the cases into a random poll order and locks all involved channels in a fixed order (by address) to avoid deadlocking against other selects.",
              "Pass 1: look for any ready case in the random order. Pass 2 (if none and no default): enqueue a sudog on *every* channel and park. Pass 3 (on wake): dequeue from all the other channels.",
              "Random choice guarantees that, in the long run, no ready case starves.",
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "The spec mandates uniform pseudo-random choice among ready cases. The three-pass algorithm and lock ordering are runtime implementation details.",
          },
          {
            type: "code",
            lang: "go",
            code: `package main

import "fmt"

func main() {
	a := make(chan int, 1000)
	b := make(chan int, 1000)
	for i := 0; i < 1000; i++ {
		a <- i
		b <- i
	}
	countA, countB := 0, 0
	for i := 0; i < 1000; i++ {
		select { // both cases are always ready
		case <-a:
			countA++
		case <-b:
			countB++
		}
	}
	fmt.Println("a:", countA, "b:", countB)
}`,
            caption: "Varies every run; roughly 50/50. One run:",
            output: `a: 517 b: 483`,
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: timeout without a leak",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"time"
)

func main() {
	result := make(chan string, 1) // buffer 1: the worker can always send and exit
	go func() {
		time.Sleep(200 * time.Millisecond) // slow work
		result <- "done"
	}()

	select {
	case r := <-result:
		fmt.Println(r)
	case <-time.After(50 * time.Millisecond):
		fmt.Println("timeout")
	}
}`,
            output: `timeout`,
          },
          {
            type: "steps",
            steps: [
              { title: "Enter select", detail: "Neither `result` nor the timer channel is ready, so main parks on both." },
              { title: "50 ms", detail: "The timer fires and sends on its channel; main wakes and runs the timeout case." },
              { title: "200 ms", detail: "The worker sends into the 1-slot buffer — nobody receives, but the send doesn't block, so the goroutine exits." },
              { title: "Leak avoided", detail: "With an **unbuffered** `result`, the worker would block forever on its send: a goroutine leak." },
            ],
          },
        ],
      },
      {
        id: "visualization",
        blocks: [
          { type: "viz", id: "go-channels", caption: "A goroutine blocked in select is queued on several channels at once and leaves all of them when one fires." },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "p",
            text: "**Non-blocking send** with `default` — drop work when the queue is full (load shedding):",
          },
          {
            type: "code",
            lang: "go",
            code: `package main

import "fmt"

func main() {
	ch := make(chan int, 1)
	for i := 0; i < 3; i++ {
		select {
		case ch <- i:
			fmt.Println("sent", i)
		default: // runs when no other case is ready
			fmt.Println("full, dropped", i)
		}
	}
	fmt.Println("buffered:", <-ch)
}`,
            output: `sent 0
full, dropped 1
full, dropped 2
buffered: 0`,
          },
          {
            type: "p",
            text: "**Nil channels disable cases.** Merging two streams until *both* are closed: when one closes, set it to nil so select stops picking its (always-ready) closed case.",
          },
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"slices"
)

func producer(vals ...int) <-chan int {
	ch := make(chan int)
	go func() {
		defer close(ch)
		for _, v := range vals {
			ch <- v
		}
	}()
	return ch
}

func merge(a, b <-chan int) []int {
	var out []int
	for a != nil || b != nil {
		select {
		case v, ok := <-a:
			if !ok {
				a = nil // a nil channel is never ready: disables this case
				continue
			}
			out = append(out, v)
		case v, ok := <-b:
			if !ok {
				b = nil
				continue
			}
			out = append(out, v)
		}
	}
	return out
}

func main() {
	got := merge(producer(1, 3, 5), producer(2, 4))
	slices.Sort(got) // arrival order is nondeterministic
	fmt.Println(got)
}`,
            output: `[1 2 3 4 5]`,
          },
          {
            type: "p",
            text: "**for-select loop** — the backbone of long-running goroutines:",
          },
          {
            type: "code",
            lang: "go",
            code: `func worker(ctx context.Context, jobs <-chan Job) error {
	for {
		select {
		case <-ctx.Done():
			return ctx.Err() // cancelled: exit cleanly
		case j, ok := <-jobs:
			if !ok {
				return nil // producer finished
			}
			process(j)
		}
	}
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
              "`break` inside a select case breaks out of the **select**, not the enclosing `for`. Use `return` or a labeled break.",
              "`time.After` in a hot loop creates a new timer each iteration. Since Go 1.23 unreferenced timers are collected promptly, but a reusable `time.NewTimer`/`Reset` or a context deadline is still cleaner.",
              "Select gives no priority. To prefer cancellation, check `ctx.Done()` in a separate non-blocking select first, or check `ctx.Err()` after receiving.",
              "A closed channel is *always* ready — a select loop on it spins unless you nil it out or return.",
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
              "Busy loop: `for { select { ... default: } }` with an empty default burns 100% CPU.",
              "Timeout pattern with an unbuffered result channel → leaked worker goroutine.",
              "Expecting the first-listed case to win when several are ready.",
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
              { title: "time.After per select", points: ["One line", "New timer each time", "Fine for one-shot timeouts"] },
              { title: "context.WithTimeout", points: ["Propagates to callees (HTTP, DB)", "Must call cancel", "Preferred for request-scoped deadlines"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "`select` waits on multiple channel operations and runs the first that can proceed; if several are ready it picks one uniformly at random, which prevents starvation. A `default` case makes it non-blocking. Common uses: timeouts with `time.After` or `ctx.Done()`, cancellation in a for-select loop, non-blocking sends to shed load, and disabling cases by setting a channel to nil. `select {}` blocks forever.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Why random rather than in order? Deterministic order would let a busy first channel starve the others.",
              "How can one goroutine wait on N channels where N is dynamic? `reflect.Select`, or fan the channels into one with merge goroutines.",
              "Locking all channels in address order is the classic lock-ordering trick to avoid deadlock between two selects over the same channels.",
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
              "Blocks until one case is ready; random among ready cases.",
              "default → non-blocking; nil channel → disabled case; closed channel → always ready.",
              "for-select + ctx.Done() is the standard long-running loop.",
              "Buffer result channels in timeout patterns to avoid leaks.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "select", definition: "Statement that waits on several channel operations and performs exactly one." },
      { term: "default case", definition: "Runs immediately if no other case is ready, making select non-blocking." },
      { term: "for-select loop", definition: "A `for { select { … } }` loop processing events until a done/cancel signal." },
      { term: "Load shedding", definition: "Dropping work when the system is at capacity instead of queueing it." },
    ],
    followUps: [
      { q: "What does a select with only a default case do?", a: "Runs the default immediately — equivalent to no select." },
      { q: "How do you give priority to cancellation over work?", a: "Before the main select, do a non-blocking `select { case <-ctx.Done(): return; default: }`, or check `ctx.Err()` at the top of each loop iteration." },
      { q: "Are the send values in non-chosen cases evaluated?", a: "Yes, all channel operands and send expressions are evaluated once on entry, in source order." },
    ],
    quiz: [
      {
        id: "select-q1",
        prompt: "Both `a` and `b` have a value ready. Which case runs?",
        code: { lang: "go", code: `select {
case v := <-a: fmt.Println("a", v)
case v := <-b: fmt.Println("b", v)
}` },
        options: ["Always a (first case)", "Always b", "Either, chosen uniformly at random", "Both"],
        answer: 2,
        explanation: "The spec requires uniform pseudo-random selection among ready cases.",
      },
      {
        id: "select-q2",
        prompt: "Why set a channel variable to nil inside a select loop?",
        options: ["To close it", "To free its memory", "To disable that case, since nil channels are never ready", "To make the select non-blocking"],
        answer: 2,
        explanation: "Operations on nil channels block forever, so select never picks that case.",
      },
      {
        id: "select-q3",
        prompt: "In the timeout pattern, what goes wrong if `result` is unbuffered and the timeout fires first?",
        options: ["Panic", "The worker goroutine blocks forever on its send (leak)", "Nothing", "The select runs twice"],
        answer: 1,
        explanation: "No one will ever receive, so the worker's send never completes.",
      },
    ],
    questions: ["go/go-05", "go/go-10"],
  },

  // ───────────────────────────────────────────────────────── defer
  {
    slug: "defer",
    track: "go",
    title: "defer, panic and recover",
    summary:
      "`defer` schedules a call to run when the surrounding function returns — in LIFO order, with arguments evaluated immediately. It is how Go guarantees cleanup (Unlock, Close, Done), and the only place `recover` can stop a panic.",
    level: "beginner",
    frequency: "very-high",
    minutes: 25,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/functions", "go/errors"],
    related: ["go/mutex", "go/waitgroup", "go/error-wrapping", "go/goroutines"],
    tags: ["defer", "panic", "recover", "LIFO", "named results", "open-coded defers"],
    sources: [S.spec, { label: "Go blog: Defer, Panic, and Recover", url: "https://go.dev/blog/defer-panic-and-recover", kind: "docs" }, S.effective, S.pgl, N.channels],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Predict the order and argument values of deferred calls.",
              "Use defer for cleanup paired immediately with acquisition.",
              "Modify named results from a deferred closure.",
              "Use recover correctly and know its limits (same goroutine, directly in a deferred function).",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Deferring is like stacking sticky notes on the exit door: \"close the file\", \"unlock the mutex\". When you leave the function — by return, by falling off the end, or by panic — you read the notes from the top of the stack down.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "list",
            items: [
              "`defer f(args)` evaluates `f` and `args` **now**, and calls `f(args)` just before the surrounding function returns.",
              "Multiple defers run in **last-in, first-out** order.",
              "Deferred calls run after the return values are set, so a deferred closure can read and modify **named** result parameters.",
              "They also run while a panic unwinds the stack; `recover()` called directly inside a deferred function stops the panic and returns its value.",
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import "fmt"

func main() {
	for i := 0; i < 3; i++ {
		defer fmt.Println("defer", i) // args evaluated now
	}
	x := 10
	defer fmt.Println("x at defer time:", x) // captures the value 10
	defer func() {
		fmt.Println("x in closure:", x) // reads x when it runs
	}()
	x = 20
	fmt.Println("body done")
}`,
            output: `body done
x in closure: 20
x at defer time: 10
defer 2
defer 1
defer 0`,
          },
          {
            type: "steps",
            steps: [
              { title: "Loop", detail: "Three deferred calls are pushed with i = 0, 1, 2 already evaluated." },
              { title: "Println defer", detail: "`x` is evaluated as 10 right now and stored with the deferred call." },
              { title: "Closure defer", detail: "The closure captures the *variable* x, not its value." },
              { title: "Return", detail: "Defers run LIFO: closure (sees 20), then 10, then 2, 1, 0." },
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import "fmt"

func double() (n int) {
	defer func() { n *= 2 }() // runs after "return 21" sets n
	return 21
}

func safeDiv(a, b int) (q int, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("recovered: %v", r)
		}
	}()
	return a / b, nil
}

func main() {
	fmt.Println(double())
	fmt.Println(safeDiv(10, 2))
	fmt.Println(safeDiv(1, 0))
}`,
            output: `42
5 <nil>
0 recovered: runtime error: integer divide by zero`,
          },
          {
            type: "p",
            text: "`return 21` is not atomic: it first assigns `n = 21`, then runs deferred calls, then actually returns. That window is where the deferred closure doubles `n` and where `safeDiv` turns a panic into an error.",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Cost of defer",
            text: "Older Go heap- or stack-allocated a defer record per call, costing tens of nanoseconds. Since Go 1.14 most defers are **open-coded**: the compiler inlines the deferred call at each exit, making it nearly free. Defers inside loops can't be open-coded and fall back to the slower path.",
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `mu.Lock()
defer mu.Unlock()         // pair acquire + release on adjacent lines

f, err := os.Open(path)
if err != nil {
	return err
}
defer f.Close()           // only after the error check: f is valid

wg.Add(1)
go func() {
	defer wg.Done()       // runs even if the goroutine panics or returns early
	work()
}()`,
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "`recover()` only works when called **directly** by a deferred function, in the **same goroutine** that panicked. Anywhere else it returns nil.",
              "`os.Exit` and `log.Fatal` exit immediately — deferred calls do **not** run.",
              "A nil function value is not called at defer time; the panic happens when the deferred call executes at function exit.",
              "Defer in a loop runs at function end, not iteration end — 10,000 file opens in a loop keep 10,000 files open. Wrap the body in a function.",
              "Some runtime failures are fatal errors, not panics, and can't be recovered: concurrent map writes, stack overflow, all-goroutines-asleep deadlock, out of memory.",
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
              "`defer resp.Body.Close()` before checking `err` — resp may be nil.",
              "Ignoring the error from a deferred `Close` on a written file — buffered data may fail to flush. Capture it into a named error result.",
              "Using panic/recover for normal control flow. Panics are for programmer errors and truly unrecoverable states.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "`defer` pushes a call that runs when the enclosing function returns, in LIFO order. The function value and arguments are evaluated at the defer statement, while closures see variables' final values. Deferred calls run after result values are assigned, so they can change named results, and they run during panics; `recover` in a deferred function of the same goroutine stops the panic. Since Go 1.14 most defers are open-coded and almost free.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "LIFO; args evaluated immediately; closures read variables at run time.",
              "Runs on return and on panic; not on os.Exit.",
              "Named results can be modified by defers.",
              "recover: deferred function, same goroutine, directly.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "defer", definition: "Statement scheduling a function call to run when the surrounding function returns." },
      { term: "panic", definition: "Built-in that stops normal execution and unwinds the goroutine's stack, running defers." },
      { term: "recover", definition: "Built-in that, inside a deferred function, stops a panic and returns its value." },
      { term: "Named result", definition: "A function result given a name in the signature; visible to deferred closures." },
      { term: "Open-coded defer", definition: "Compiler optimization (Go 1.14) that inlines deferred calls at function exits." },
    ],
    followUps: [
      { q: "What does `func f() (r int) { defer func(){ r++ }(); return 0 }` return?", a: "1. `return 0` sets r=0, the defer increments it, then f returns." },
      { q: "Can a deferred function recover a panic from a goroutine it started?", a: "No. Each goroutine must recover its own panics." },
      { q: "When are the arguments of `defer log.Println(time.Since(start))` evaluated?", a: "Immediately — so it logs ~0. Wrap it: `defer func(){ log.Println(time.Since(start)) }()`." },
    ],
    quiz: [
      {
        id: "defer-q1",
        prompt: "What does this print?",
        code: { lang: "go", code: `for i := 1; i <= 3; i++ {
	defer fmt.Print(i)
}` },
        options: ["123", "321", "333", "000"],
        answer: 1,
        explanation: "LIFO order; each i was evaluated at its defer statement.",
      },
      {
        id: "defer-q2",
        prompt: "Which statement is true?",
        options: ["Deferred calls run after os.Exit", "recover works in any function during a panic", "A deferred closure can change a named return value", "Defers run when the enclosing block ends"],
        answer: 2,
        explanation: "Defers run after results are assigned and before the function actually returns.",
      },
    ],
    questions: ["go/go-19", "go/go-20"],
  },

  // ───────────────────────────────────────────────────────── waitgroup
  {
    slug: "waitgroup",
    track: "go",
    title: "sync.WaitGroup",
    summary:
      "A WaitGroup is a counter of outstanding goroutines: Add before starting, Done when finished, Wait until zero. Simple — but the order of Add vs go, and never copying it, matter.",
    level: "beginner",
    frequency: "very-high",
    minutes: 20,
    kinds: ["theory", "coding", "visualization"],
    status: "authored",
    prerequisites: ["go/goroutines", "go/defer"],
    related: ["go/fork-join", "go/worker-pool", "go/channel-close-range", "go/mutex"],
    tags: ["WaitGroup", "sync", "Add", "Done", "Wait", "wg.Go", "Go 1.25"],
    sources: [S.sync, S.memModel, S.practice, S.pgl, N.chanSync],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Wait for a set of goroutines with Add/Done/Wait.",
              "Explain why Add must happen before the `go` statement.",
              "Avoid copying a WaitGroup.",
              "Close a results channel safely using a WaitGroup.",
              "Know `wg.Go` (Go 1.25+).",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A WaitGroup is a tally of people who went out. You add one mark per person *before* they leave, each person erases a mark when they're back, and you wait at the door until the tally is zero.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "list",
            items: [
              "`wg.Add(n)` adds n (may be negative) to the counter.",
              "`wg.Done()` is `wg.Add(-1)`.",
              "`wg.Wait()` blocks until the counter is zero.",
              "The counter going negative panics: `sync: negative WaitGroup counter`.",
              "Memory model: each `Done` \"synchronizes before\" the `Wait` it unblocks — writes made before Done are visible after Wait.",
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	results := make([]int, 5)
	for i := range 5 {
		wg.Add(1) // before the go statement
		go func() {
			defer wg.Done()
			results[i] = i * i // each goroutine writes its own index: no race
		}()
	}
	wg.Wait()
	fmt.Println(results)
}`,
            output: `[0 1 4 9 16]`,
          },
          {
            type: "steps",
            steps: [
              { title: "Add(1) ×5", detail: "Counter reaches 5 before or while goroutines start — never zero while work is pending." },
              { title: "Goroutines write", detail: "Distinct slice elements are distinct memory locations, so concurrent writes don't race." },
              { title: "Done ×5", detail: "Each decrements; the last one (counter → 0) wakes the waiter." },
              { title: "Wait returns", detail: "Happens-after every Done, so all writes to `results` are visible." },
            ],
          },
        ],
      },
      {
        id: "visualization",
        blocks: [
          { type: "viz", id: "go-waitgroup", caption: "The counter rising with Add, falling with Done, and Wait releasing at zero." },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "p",
            text: "A WaitGroup is a single 64-bit atomic word holding the counter (high 32 bits) and the number of waiters (low 32 bits), plus a runtime semaphore. `Add` atomically updates the counter; if it hits zero with waiters, it releases the semaphore once per waiter. `Wait` increments the waiter count and sleeps on the semaphore.",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "The bit layout is a runtime detail and has changed across versions. The documented contract is only Add/Done/Wait and the synchronization guarantee.",
          },
          {
            type: "p",
            text: "**Go 1.25 added `wg.Go(f)`**, which does `Add(1)`, starts `f` in a goroutine and calls `Done` when it returns. Only available if your module targets Go 1.25 or later:",
          },
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	var mu sync.Mutex
	total := 0
	for i := 1; i <= 4; i++ {
		wg.Go(func() { // Go 1.25+: Add(1) + go + defer Done() in one call
			mu.Lock()
			total += i
			mu.Unlock()
		})
	}
	wg.Wait()
	fmt.Println(total)
}`,
            output: `10`,
          },
        ],
      },
      {
        id: "examples",
        title: "Closing a results channel",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `results := make(chan int)
var wg sync.WaitGroup
for _, url := range urls {
	wg.Add(1)
	go func() {
		defer wg.Done()
		results <- fetchSize(url)
	}()
}
go func() {
	wg.Wait()      // all senders finished…
	close(results) // …so closing is safe
}()
for size := range results { // ends after close
	fmt.Println(size)
}`,
            caption: "The closer goroutine lets main start receiving immediately; calling wg.Wait() in main before the range would deadlock on the unbuffered sends.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "**Add inside the goroutine** — `Wait` may observe counter 0 before any goroutine ran and return early.",
              "**Copying the WaitGroup** (passing by value) — Done decrements the copy, Wait waits forever. `go vet` reports \"passes lock by value\". Pass `*sync.WaitGroup` or use a closure.",
              "**Calling Done twice / forgetting Done** — negative-counter panic, or Wait blocks forever. `defer wg.Done()` as the first line prevents both.",
              "**Reusing a WaitGroup** before the previous Wait returned.",
            ],
          },
          {
            type: "code",
            lang: "go",
            code: `func work(id int, wg sync.WaitGroup) { // BUG: wg copied
	defer wg.Done()
	fmt.Println("work", id)
}

func main() {
	var wg sync.WaitGroup
	wg.Add(1)
	go work(1, wg)
	wg.Wait()
}`,
            caption: "Go 1.26 shows the wait state as [sync.WaitGroup.Wait]; older versions show [semacquire].",
            output: `work 1
fatal error: all goroutines are asleep - deadlock!

goroutine 1 [sync.WaitGroup.Wait]:
...`,
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "WaitGroup", points: ["Just waits; no results or errors", "Cheap and simple", "Pair with a slice-by-index or channel for results"] },
              { title: "errgroup.Group (x/sync)", points: ["Wait returns the first error", "WithContext cancels siblings on error", "SetLimit bounds concurrency"] },
              { title: "Done channel", points: ["Good for exactly one goroutine", "Composes with select/timeouts", "Awkward for N goroutines"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "WaitGroup is a concurrency-safe counter: `Add` before starting each goroutine, `defer wg.Done()` inside it, and `Wait` blocks until the count is zero. Add must happen before the `go` statement or Wait can return early. Never copy a WaitGroup — pass a pointer. Done synchronizes-before Wait returns, so results written before Done are visible. Go 1.25 added `wg.Go(f)` which wraps the Add/go/Done dance.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Add before go; defer Done; Wait.",
              "Never copy; vet catches it.",
              "Wait in a separate goroutine to close a shared results channel.",
              "Need errors/cancellation → errgroup.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "sync.WaitGroup", definition: "Counter-based barrier to wait for a collection of goroutines." },
      { term: "go vet copylocks", definition: "Vet check reporting values containing sync types passed or assigned by value." },
      { term: "errgroup", definition: "`golang.org/x/sync/errgroup`: WaitGroup plus error propagation, context cancellation and a concurrency limit." },
    ],
    followUps: [
      { q: "Can you call Add(5) once instead of Add(1) five times?", a: "Yes, as long as exactly five Done calls follow." },
      { q: "Is it OK to call Wait from multiple goroutines?", a: "Yes; all waiters are released when the counter reaches zero." },
      { q: "What does wg.Go do if f panics?", a: "The docs say f must not panic; a panic in that goroutine crashes the program like any unrecovered goroutine panic." },
    ],
    quiz: [
      {
        id: "wg-q1",
        prompt: "What's wrong here?",
        code: { lang: "go", code: `for i := 0; i < 3; i++ {
	go func() {
		wg.Add(1)
		defer wg.Done()
		work(i)
	}()
}
wg.Wait()` },
        options: ["Nothing", "Wait may return before any work ran", "Panics with negative counter", "Deadlocks always"],
        answer: 1,
        explanation: "Add happens inside the goroutine, possibly after Wait already saw zero.",
      },
      {
        id: "wg-q2",
        prompt: "Passing `sync.WaitGroup` by value to a worker leads to…",
        options: ["A compile error", "Wait blocking forever (deadlock)", "Correct behaviour", "A data race only"],
        answer: 1,
        explanation: "Done decrements the copy; the original counter never reaches zero.",
      },
    ],
    questions: ["go/go-06"],
  },

  // ───────────────────────────────────────────────────────── mutex
  {
    slug: "mutex",
    track: "go",
    title: "sync.Mutex and RWMutex",
    summary:
      "A mutex lets exactly one goroutine at a time into a critical section, turning racy read-modify-write sequences into safe ones. Learn when to use Mutex vs RWMutex vs channels, why Go mutexes aren't reentrant, and how starvation mode works.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 35,
    kinds: ["theory", "coding", "visualization"],
    status: "authored",
    prerequisites: ["go/goroutines", "go/waitgroup", "go/defer"],
    related: ["go/atomics", "go/race-deadlock-livelock", "go/race-detector", "go/channels", "os/synchronization"],
    tags: ["mutex", "RWMutex", "critical section", "starvation", "reentrancy", "TryLock"],
    sources: [S.sync, S.memModel, { label: "Go source: sync/mutex.go (starvation mode comment)", url: "https://github.com/golang/go/blob/master/src/internal/sync/mutex.go", kind: "external", note: "Implementation, not spec." }, S.practice, S.pgl, N.mutex],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain why `count++` from many goroutines loses updates.",
              "Protect shared state with Mutex and RWMutex idiomatically.",
              "Choose between a mutex, a channel and an atomic.",
              "Explain non-reentrancy and normal vs starvation mode.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A mutex is the single key to a bathroom. Whoever holds the key goes in; everyone else queues. An RWMutex is a museum room: any number of visitors (readers) can look at once, but when the restorer (writer) needs to work, everyone must leave and nobody else enters until they're done.",
          },
        ],
      },
      {
        id: "why",
        title: "Why: the lost update",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	count := 0
	for range 1000 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			count++ // read, add, write: three steps, not atomic
		}()
	}
	wg.Wait()
	fmt.Println(count)
}`,
            caption: "Data race — result varies per run and is often less than 1000. One run:",
            output: `949`,
          },
          {
            type: "steps",
            steps: [
              { title: "G1 reads count = 41", detail: "Into a register." },
              { title: "G2 reads count = 41", detail: "Before G1 has written back." },
              { title: "G1 writes 42, G2 writes 42", detail: "One increment is lost. Worse: the memory model says a racy program's behaviour is not even limited to \"some interleaving\" for multiword values." },
            ],
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"sync"
)

type Counter struct {
	mu sync.Mutex // guards n
	n  map[string]int
}

func (c *Counter) Inc(key string) { // pointer receiver: never copy a Mutex
	c.mu.Lock()
	defer c.mu.Unlock()
	c.n[key]++
}

func (c *Counter) Get(key string) int {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.n[key]
}

func main() {
	c := Counter{n: make(map[string]int)}
	var wg sync.WaitGroup
	for range 1000 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			c.Inc("hits")
		}()
	}
	wg.Wait()
	fmt.Println(c.Get("hits"))
}`,
            output: `1000`,
          },
          {
            type: "list",
            items: [
              "Zero value is an unlocked mutex — no constructor needed.",
              "Put the mutex next to the fields it guards and say so in a comment.",
              "Memory model: the n-th `Unlock` synchronizes before the (n+1)-th `Lock` returns, so writes inside one critical section are visible in the next.",
              "`TryLock` exists (Go 1.18) but the docs warn correct uses are rare.",
            ],
          },
        ],
      },
      {
        id: "visualization",
        blocks: [
          { type: "viz", id: "go-mutex", caption: "Two goroutines incrementing a counter with and without a mutex." },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "p",
            text: "A `sync.Mutex` is two 32-bit words: a `state` (locked bit, woken bit, starving bit, count of waiters) and a semaphore. The fast path is a single compare-and-swap from 0 to locked. Contended goroutines may spin briefly (on multicore, if the lock holder is running), then park on the semaphore.",
          },
          {
            type: "compare",
            items: [
              { title: "Normal mode", points: ["Waiters queue FIFO", "A woken waiter must *compete* with newly arriving goroutines, which usually win (they're already on a CPU)", "High throughput"] },
              { title: "Starvation mode", points: ["Entered when a waiter has waited > 1 ms", "Unlock hands ownership **directly** to the front waiter", "Newcomers don't spin; they queue at the tail", "Exits when a waiter is the last one or waited < 1 ms"] },
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "Spinning, the 1 ms threshold and the state layout are implementation details (`internal/sync/mutex.go` in recent releases). The documented guarantees are mutual exclusion and the memory-model ordering.",
          },
          {
            type: "p",
            text: "**RWMutex**: many `RLock` holders or one `Lock` holder. If a writer is waiting, new `RLock` calls block — this prevents writer starvation, but it also means recursive read-locking can deadlock (reader holds RLock, writer queues, same reader RLocks again and waits behind the writer).",
          },
          {
            type: "code",
            lang: "go",
            code: `type Cache struct {
	mu sync.RWMutex
	m  map[string]string
}

func (c *Cache) Get(k string) (string, bool) {
	c.mu.RLock() // many readers may hold RLock at once
	defer c.mu.RUnlock()
	v, ok := c.m[k]
	return v, ok
}

func (c *Cache) Set(k, v string) {
	c.mu.Lock() // exclusive: waits for readers to leave
	defer c.mu.Unlock()
	c.m[k] = v
}`,
          },
        ],
      },
      {
        id: "edge-cases",
        title: "Not reentrant",
        blocks: [
          {
            type: "p",
            text: "Go mutexes are **not reentrant** (not recursive): a goroutine that holds a lock and calls Lock again blocks forever. Go mutexes aren't tied to goroutines at all — one goroutine may Lock and another Unlock.",
          },
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"sync"
)

type Account struct {
	mu      sync.Mutex
	balance int
}

func (a *Account) Balance() int {
	a.mu.Lock()
	defer a.mu.Unlock()
	return a.balance
}

func (a *Account) Withdraw(n int) bool {
	a.mu.Lock()
	defer a.mu.Unlock()
	if a.Balance() < n { // BUG: Balance locks a.mu again -> blocks forever
		return false
	}
	a.balance -= n
	return true
}

func main() {
	a := &Account{balance: 100}
	fmt.Println(a.Withdraw(30))
}`,
            output: `fatal error: all goroutines are asleep - deadlock!

goroutine 1 [sync.Mutex.Lock]:
...`,
          },
          {
            type: "p",
            text: "Fix: split into an unexported `balanceLocked()` that assumes the lock is held, and have both public methods call it.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Value receivers on a type containing a mutex — each call locks a copy, protecting nothing (vet: copylocks).",
              "Holding a lock during slow I/O (network call, channel send) — serializes everything and invites deadlocks.",
              "Protecting writes but not reads — the reader still races.",
              "Inconsistent lock ordering across two mutexes → deadlock (see race-deadlock-livelock).",
              "Reaching for RWMutex by default — with short critical sections, its extra bookkeeping often makes it slower than Mutex. Measure.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Tool", "Best when", "Avoid when"],
            rows: [
              ["Mutex", "Guarding a struct/map shared by many goroutines; short critical sections", "You're transferring ownership of data or coordinating stages"],
              ["RWMutex", "Reads vastly outnumber writes and read sections are non-trivial", "Critical sections are tiny or writes are frequent"],
              ["Channel", "Passing data/ownership between goroutines, pipelines, signaling", "Just protecting a counter or cache"],
              ["Atomic", "A single word: counters, flags, pointer swaps", "Invariants span several fields"],
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "A `sync.Mutex` provides mutual exclusion: Lock/Unlock around a critical section so read-modify-write sequences like `count++` don't lose updates. RWMutex allows many concurrent readers or one writer. Go mutexes are not reentrant, must not be copied, and have a fast CAS path, brief spinning, and a starvation mode after a waiter waits over 1 ms, where ownership is handed off FIFO. Use mutexes to guard state, channels to pass ownership and coordinate, atomics for single words.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Why not reentrant? The Go team considers recursive locks a sign that invariants are unclear: code called with the lock held may see a broken invariant.",
              "Sharding: replace one hot mutex with N mutex-protected shards keyed by hash to cut contention.",
              "`sync.Map` is optimised for keys written once and read many times, or disjoint key sets per goroutine — not a general replacement for map+Mutex.",
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
              "Lock; defer Unlock; keep sections short.",
              "Not reentrant; not copyable; zero value ready.",
              "RWMutex for read-heavy workloads — measure first.",
              "Normal mode for throughput, starvation mode (> 1 ms) for fairness.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Mutex", definition: "Mutual-exclusion lock: at most one holder at a time." },
      { term: "Critical section", definition: "Code that accesses shared state and must not run concurrently with other such code." },
      { term: "RWMutex", definition: "Reader/writer lock allowing many readers or one writer." },
      { term: "Reentrant lock", definition: "A lock the holder can acquire again without blocking. Go's are not." },
      { term: "Starvation mode", definition: "Mutex mode where ownership is handed directly to the longest waiter." },
      { term: "Lock contention", definition: "Goroutines frequently waiting for the same lock." },
    ],
    followUps: [
      { q: "Can you unlock a Mutex from a different goroutine than the one that locked it?", a: "Yes, it's allowed; Go mutexes aren't owned by goroutines. Unlocking an unlocked mutex is a fatal error." },
      { q: "Mutex or channel for a shared cache?", a: "Mutex (or RWMutex). The cache is state guarded in place; channels would add a goroutine and latency for no ownership benefit." },
      { q: "What's the cost of an uncontended Lock/Unlock?", a: "A couple of atomic operations — on the order of 10–20 ns on modern x86. Contention is what's expensive." },
    ],
    quiz: [
      {
        id: "mutex-q1",
        prompt: "What happens when a goroutine calls `mu.Lock()` twice without unlocking?",
        options: ["Second call returns immediately", "It blocks forever", "Panics: recursive lock", "Compile error"],
        answer: 1,
        explanation: "Go mutexes are not reentrant.",
      },
      {
        id: "mutex-q2",
        prompt: "Why is this method broken? `func (c Counter) Inc() { c.mu.Lock(); c.n++; c.mu.Unlock() }`",
        options: ["Missing defer", "Value receiver copies the mutex and the counter", "Mutex must be a pointer field", "It's fine"],
        answer: 1,
        explanation: "Each call operates on a copy; the original n never changes and nothing is protected.",
      },
      {
        id: "mutex-q3",
        prompt: "When does a sync.Mutex switch to starvation mode?",
        options: ["After 10 goroutines wait", "When a waiter fails to acquire it for more than 1 ms", "When GOMAXPROCS=1", "Never; it's always FIFO"],
        answer: 1,
        explanation: "This is the runtime's fairness mechanism (an implementation detail).",
      },
    ],
    questions: ["go/go-07", "go/go-08"],
  },

  // ───────────────────────────────────────────────────────── atomics
  {
    slug: "atomics",
    track: "go",
    title: "Atomics and the Go memory model",
    summary:
      "sync/atomic performs indivisible operations on single words — counters, flags, pointer swaps — without locks. To use them correctly you need the memory model's happens-before rules, which is also what makes every other sync primitive work.",
    level: "advanced",
    frequency: "medium",
    minutes: 30,
    kinds: ["theory", "coding", "visualization"],
    status: "authored",
    prerequisites: ["go/mutex"],
    related: ["go/sync-once", "go/race-detector", "go/race-deadlock-livelock", "os/cpu-memory-hierarchy"],
    tags: ["atomic", "CAS", "memory model", "happens-before", "sequential consistency"],
    sources: [S.memModel, S.atomic, { label: "Russ Cox — Memory Models (series)", url: "https://research.swtch.com/mm", kind: "external" }, S.pgl],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Use the typed atomics (`atomic.Int64`, `atomic.Bool`, `atomic.Pointer[T]`).",
              "Write a compare-and-swap retry loop.",
              "State the happens-before rule and why a data race breaks everything.",
              "Decide when atomics are enough and when you need a mutex.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Without synchronization, CPUs and compilers may reorder and cache memory operations, so one goroutine's writes can show up late or out of order for another. An atomic operation is both indivisible (no torn reads or lost increments) and a *synchronization point* that orders the surrounding plain reads and writes.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "list",
            items: [
              "**Data race**: two goroutines access the same memory location concurrently, at least one writes, and at least one access isn't atomic/synchronized.",
              "**Happens-before**: the ordering the memory model uses. If write W happens-before read R (and no other write intervenes), R must see W.",
              "**Synchronized before**: created by sync operations — channel send→receive, Unlock→next Lock, Done→Wait return, Once.Do completion → Do return, and atomics: if atomic B observes atomic A's effect, A is synchronized before B.",
              "Since the 2022 memory-model revision (Go 1.19), Go atomics are **sequentially consistent**: all atomic ops behave as if executed in some single total order.",
              "**DRF-SC**: data-race-free programs behave as if sequentially consistent. Racy programs get no such promise.",
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: publishing data with an atomic flag",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"runtime"
	"sync/atomic"
)

var data int
var ready atomic.Bool

func main() {
	go func() {
		data = 42         // (1) plain write
		ready.Store(true) // (2) atomic store "publishes" it
	}()
	for !ready.Load() { // (3) atomic load observes (2)
		runtime.Gosched()
	}
	fmt.Println(data) // (4) guaranteed to see 42
}`,
            output: `42`,
          },
          {
            type: "steps",
            steps: [
              { title: "(1) → (2)", detail: "Sequenced in the same goroutine." },
              { title: "(2) → (3)", detail: "The load observes the store, so the store is synchronized before the load." },
              { title: "(3) → (4)", detail: "Same goroutine. By transitivity (1) happens-before (4): data is 42." },
              { title: "If ready were a plain bool", detail: "This would be a data race: the compiler may hoist the load out of the loop (spin forever) and nothing orders `data`." },
            ],
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"sync"
	"sync/atomic"
)

func main() {
	var hits atomic.Int64 // Go 1.19+ typed atomics; zero value is ready to use
	var wg sync.WaitGroup
	for range 1000 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			hits.Add(1)
		}()
	}
	wg.Wait()
	fmt.Println(hits.Load())
}`,
            output: `1000`,
          },
          {
            type: "p",
            text: "**Compare-and-swap (CAS)** is the building block of lock-free code: \"set to new only if it still equals old\". It fails if someone else got there first, so you loop:",
          },
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"sync"
	"sync/atomic"
)

// storeMax raises m to v if v is larger, without a lock.
func storeMax(m *atomic.Int64, v int64) {
	for {
		cur := m.Load()
		if v <= cur {
			return
		}
		if m.CompareAndSwap(cur, v) { // succeeds only if nobody changed m meanwhile
			return
		}
		// lost the race: reload and retry
	}
}

func main() {
	var max atomic.Int64
	var wg sync.WaitGroup
	for i := range 100 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			storeMax(&max, int64(i))
		}()
	}
	wg.Wait()
	fmt.Println(max.Load())
}`,
            output: `99`,
          },
          {
            type: "p",
            text: "`atomic.Pointer[T]` (Go 1.19) is ideal for read-mostly config: readers `Load()` a snapshot with no lock, a writer builds a new value and `Store()`s it (copy-on-write).",
          },
        ],
      },
      {
        id: "visualization",
        blocks: [
          { type: "viz", id: "go-mutex", caption: "Lost updates from a plain counter; an atomic Add or a mutex fixes them." },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "p",
            text: "On amd64, `Add` compiles to `LOCK XADD`, `CompareAndSwap` to `LOCK CMPXCHG`, and `Store` to `XCHG` (a full barrier, needed for sequential consistency). On arm64 they use load-acquire/store-release or LSE atomic instructions. The cache-coherence protocol gives the core exclusive ownership of the cache line for the operation.",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "Instruction choices are compiler/architecture details. The contract is the memory model: sequentially consistent atomics. On 32-bit platforms, 64-bit atomic functions require 64-bit alignment — the typed `atomic.Int64` guarantees it; raw `int64` struct fields may not.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Mixing atomic and plain access to the same variable — any plain access racing with an atomic is still a data race. Typed atomics make this impossible.",
              "Check-then-act with two atomics: `if x.Load() == 0 { x.Store(1) }` is not atomic as a whole — use CompareAndSwap.",
              "Using atomics for multi-field invariants (e.g. balance and history) — use a mutex.",
              "Copying an `atomic.Int64` struct value (vet flags it).",
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
              { title: "Atomics", points: ["Fastest for one word", "No blocking, no deadlocks", "Hard to reason about beyond simple counters/flags", "Contended CAS loops waste CPU"] },
              { title: "Mutex", points: ["Protects arbitrary invariants", "Easier to read and review", "Blocking; small overhead uncontended"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "sync/atomic offers indivisible loads, stores, adds, swaps and compare-and-swap on single words, with typed wrappers like `atomic.Int64` and `atomic.Pointer[T]` since Go 1.19. In Go's memory model atomics are sequentially consistent and create happens-before edges: if one atomic observes another's write, everything before the write is visible after the read. They're right for counters, flags and pointer swaps; for invariants across several fields, use a mutex.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "The ABA problem: a CAS can succeed even though the value changed A→B→A meanwhile; GC in Go removes the classic memory-reuse variant for pointers but not for integer state machines.",
              "False sharing: two hot atomics on the same 64-byte cache line slow each other down; pad structs if profiling shows it.",
              "Why can a racy program do *anything*? Without happens-before, compilers may legally reorder or eliminate accesses, and multiword values (strings, interfaces, slices) can be torn.",
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
              "Atomics = indivisible + synchronizing single-word ops.",
              "Happens-before is created only by sync operations; data races void guarantees.",
              "Go atomics are sequentially consistent (memory model, 2022).",
              "Prefer typed atomics; use mutexes for multi-field state.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Atomic operation", definition: "An operation that appears to happen instantaneously; no other goroutine sees a partial state." },
      { term: "Compare-and-swap (CAS)", definition: "Atomically sets a value to new only if it currently equals old; reports success." },
      { term: "Memory model", definition: "Rules specifying when a read is guaranteed to observe a write from another goroutine." },
      { term: "Sequential consistency", definition: "All operations appear in one global order consistent with each goroutine's program order." },
      { term: "DRF-SC", definition: "Data-race-free programs execute sequentially consistently." },
      { term: "False sharing", definition: "Performance loss when independent variables share a CPU cache line written by different cores." },
    ],
    followUps: [
      { q: "Is reading an int while another goroutine writes it with atomic.StoreInt64 OK if you only read with a plain load?", a: "No — that's a data race. Every concurrent access must be atomic (or otherwise synchronized)." },
      { q: "What's atomic.Value vs atomic.Pointer[T]?", a: "Both store a value for lock-free loads. atomic.Value takes `any` and panics if the concrete type changes; atomic.Pointer[T] is type-safe and preferred since Go 1.19." },
    ],
    quiz: [
      {
        id: "atomics-q1",
        prompt: "Which creates a happens-before edge between goroutines?",
        options: ["Two plain writes to the same variable", "time.Sleep", "An atomic Load observing an atomic Store", "Printing to stdout"],
        answer: 2,
        explanation: "Sleep is not synchronization; atomics observed by other atomics are.",
      },
      {
        id: "atomics-q2",
        prompt: "Why loop around CompareAndSwap?",
        options: ["CAS is slow", "It may fail when another goroutine changed the value; you reload and retry", "Go requires it", "To avoid ABA"],
        answer: 1,
        explanation: "CAS reports failure instead of blocking; the retry loop recomputes from the fresh value.",
      },
    ],
    questions: ["go/go-08"],
  },

  // ───────────────────────────────────────────────────────── sync-once
  {
    slug: "sync-once",
    track: "go",
    title: "sync.Once and lazy initialization",
    summary:
      "`sync.Once` runs a function exactly once no matter how many goroutines race to call it, and makes everyone wait until it has finished. Go 1.21 added OnceFunc, OnceValue and OnceValues.",
    level: "intermediate",
    frequency: "medium",
    minutes: 15,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/mutex", "go/atomics"],
    related: ["go/atomics", "go/channel-close-range"],
    tags: ["sync.Once", "lazy init", "singleton", "OnceValue", "double-checked locking"],
    sources: [S.sync, S.memModel, S.pgl],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Lazily initialize shared state exactly once, safely.",
              "Explain why Once is a fast atomic check plus a mutex (and not just a CAS).",
              "Know the panic and recursion edge cases.",
              "Use `sync.OnceValue` (Go 1.21+).",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "The first person into the office turns on the lights; everyone arriving at the same moment waits at the door until the lights are on, and everyone after that just walks in.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"sync"
)

var (
	once   sync.Once
	config map[string]string
)

func loadConfig() {
	fmt.Println("loading config") // expensive: runs once
	config = map[string]string{"env": "prod"}
}

func main() {
	var wg sync.WaitGroup
	for range 5 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			once.Do(loadConfig) // all 5 callers return only after loadConfig finished
			_ = config["env"]
		}()
	}
	wg.Wait()
	fmt.Println(config["env"])
}`,
            output: `loading config
prod`,
          },
          {
            type: "p",
            text: "Memory model: the completion of the single call `f()` is synchronized before *any* `once.Do(f)` returns — so every caller sees `config` fully built.",
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Fast path", detail: "Atomically load a `done` flag. If set, return immediately — one atomic load on every later call." },
              { title: "Slow path", detail: "Lock a mutex, check `done` again (double-checked locking), call f, then atomically set done and unlock." },
              { title: "Why not just CAS?", detail: "`if CAS(done, 0, 1) { f() }` would let losers return *before* f finished. The mutex makes them wait." },
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "The atomic + mutex structure is the current implementation (the source comment explains why CAS is wrong). Only the exactly-once and synchronization guarantees are documented.",
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"sync"
)

func main() {
	// Go 1.21+: OnceValue wraps a function so it runs at most once and caches the result.
	getPort := sync.OnceValue(func() int {
		fmt.Println("computing port")
		return 8080
	})
	fmt.Println(getPort())
	fmt.Println(getPort())

	var once sync.Once
	for i := range 2 {
		func() {
			defer func() { recover() }()
			once.Do(func() {
				fmt.Println("attempt", i)
				panic("init failed")
			})
		}()
	}
	fmt.Println("Once is done even though f panicked")
}`,
            output: `computing port
8080
8080
attempt 0
Once is done even though f panicked`,
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "If f panics, Do considers it done — later calls do nothing. `OnceFunc`/`OnceValue` instead re-panic with the same value on every call.",
              "Calling `once.Do` from inside f on the same Once deadlocks (f waits for the mutex it holds).",
              "There's no way to reset a Once; for retryable initialization, use a mutex and your own `initialized` flag (or a new Once).",
              "Once must not be copied after first use.",
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
              { title: "Package init() / var initializer", points: ["Runs at program start, single-threaded", "Simplest", "Pays the cost even if never used; can't take runtime params"] },
              { title: "sync.Once", points: ["Lazy, concurrency-safe", "Cost only on first use", "Errors need handling (OnceValues returns (T, error))"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "`sync.Once.Do(f)` guarantees f runs exactly once across all goroutines, and every caller returns only after f has completed, with its writes visible. It's implemented as an atomic done-flag fast path plus a mutex slow path with double-checking — a plain CAS would let callers proceed before f finishes. A panic in f still marks it done; calling Do recursively deadlocks. Go 1.21 added OnceFunc, OnceValue and OnceValues.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Exactly once; callers wait for completion.",
              "Atomic fast path + mutex slow path.",
              "Panic = done; recursion = deadlock; no reset.",
              "OnceValue/OnceValues (1.21) for cached results.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Lazy initialization", definition: "Deferring creation of a value until first use." },
      { term: "Double-checked locking", definition: "Check a flag without the lock, then again with it, to avoid locking on the fast path." },
      { term: "sync.OnceValue", definition: "Go 1.21 helper returning a function that computes a value once and caches it." },
    ],
    followUps: [
      { q: "How would you implement a thread-safe singleton in Go?", a: "A package-level variable plus `sync.Once` (or `sync.OnceValue`) in the accessor; or initialize eagerly in a var declaration if laziness isn't needed." },
      { q: "Why can't Once be implemented with a single CompareAndSwap?", a: "Goroutines losing the CAS would return immediately while the winner is still running f, observing uninitialized state." },
    ],
    quiz: [
      {
        id: "once-q1",
        prompt: "f panics on the first `once.Do(f)` (recovered by the caller). What does the second `once.Do(f)` do?",
        options: ["Calls f again", "Nothing", "Panics again", "Deadlocks"],
        answer: 1,
        explanation: "A panicking f is considered to have returned; Do won't call it again.",
      },
      {
        id: "once-q2",
        prompt: "Goroutine B calls once.Do(f) while A is still inside f. B…",
        options: ["returns immediately", "runs f too", "blocks until A's f returns", "panics"],
        answer: 2,
        explanation: "Do doesn't return until f has completed.",
      },
    ],
    questions: ["go/go-25"],
  },

  // ───────────────────────────────────────────────────────── worker-pool
  {
    slug: "worker-pool",
    track: "go",
    title: "Worker pool pattern",
    summary:
      "A fixed number of goroutines pull jobs from a shared channel and push results to another. It bounds concurrency, gives natural backpressure, and — with the right close/WaitGroup choreography — shuts down cleanly.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 30,
    kinds: ["coding", "visualization", "theory"],
    status: "authored",
    prerequisites: ["go/channels", "go/channel-close-range", "go/waitgroup"],
    related: ["go/fork-join", "go/backpressure-bounded-concurrency", "go/concurrent-requests", "go/context", "go/graceful-shutdown"],
    tags: ["worker pool", "fan-out", "fan-in", "jobs channel", "bounded concurrency"],
    sources: [S.pipelines, { label: "Go by Example: Worker Pools", url: "https://gobyexample.com/worker-pools", kind: "external" }, S.errgroup, S.practice, S.pgl, N.workerPool, N.patterns],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Build a worker pool with jobs and results channels.",
              "Get the shutdown order right: who closes jobs, who closes results.",
              "Size the pool for CPU-bound vs I/O-bound work.",
              "Add cancellation and error handling.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A bakery with three bakers and one order spike: orders go on a single rail (jobs channel); whichever baker is free grabs the next ticket; finished cakes go on the counter (results channel). Hiring 1,000 bakers for 1,000 orders wouldn't fit in the kitchen — a fixed crew keeps the kitchen usable.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "flow",
            nodes: ["Producer", "jobs chan", "Worker 1..N", "results chan", "Consumer"],
            caption: "Fan-out to N workers, fan-in to one results channel.",
          },
          {
            type: "list",
            items: [
              "**Fan-out**: several goroutines receive from the same channel; each value goes to exactly one of them.",
              "**Fan-in**: several goroutines send to one channel that a single consumer reads.",
              "Ownership: the producer closes `jobs`; a closer goroutine closes `results` after `wg.Wait()`.",
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"sync"
)

type Job struct{ ID, N int }
type Result struct{ JobID, Square int }

func worker(id int, jobs <-chan Job, results chan<- Result, wg *sync.WaitGroup) {
	defer wg.Done()
	for j := range jobs { // exits when jobs is closed and drained
		results <- Result{JobID: j.ID, Square: j.N * j.N}
	}
}

func main() {
	const numWorkers = 3
	jobs := make(chan Job)
	results := make(chan Result)

	var wg sync.WaitGroup
	for w := 1; w <= numWorkers; w++ {
		wg.Add(1)
		go worker(w, jobs, results, &wg)
	}

	go func() { // producer: the only sender on jobs, so it closes jobs
		defer close(jobs)
		for i := 1; i <= 10; i++ {
			jobs <- Job{ID: i, N: i}
		}
	}()

	go func() { // closer: results is closed once every worker has exited
		wg.Wait()
		close(results)
	}()

	sum := 0
	for r := range results {
		sum += r.Square
	}
	fmt.Println("sum of squares 1..10 =", sum)
}`,
            caption: "Which worker handles which job varies; the sum doesn't.",
            output: `sum of squares 1..10 = 385`,
          },
          {
            type: "steps",
            steps: [
              { title: "Start workers", detail: "3 goroutines block on `range jobs`." },
              { title: "Produce", detail: "Each send hands a job to whichever worker is waiting (fan-out). Unbuffered jobs ⇒ the producer runs at the workers' pace (backpressure)." },
              { title: "Consume", detail: "main ranges over results concurrently — essential, or workers would block sending results and stop taking jobs." },
              { title: "Drain", detail: "Producer closes jobs → each worker's range ends → `Done` ×3 → closer sees Wait return → closes results → main's range ends." },
            ],
          },
        ],
      },
      {
        id: "visualization",
        blocks: [
          { type: "viz", id: "go-worker-pool", caption: "Jobs flowing to N workers and results flowing back." },
        ],
      },
      {
        id: "internals",
        title: "Sizing and variations",
        blocks: [
          {
            type: "table",
            head: ["Workload", "Pool size", "Why"],
            rows: [
              ["CPU-bound", "≈ GOMAXPROCS", "More workers can't run in parallel; they just add switching"],
              ["I/O-bound (HTTP, DB)", "Bounded by the downstream: DB pool size, API rate limits", "Workers mostly wait; the limit protects the dependency"],
              ["Mixed", "Measure: throughput vs latency curve", "Little's law: concurrency ≈ throughput × latency"],
            ],
          },
          {
            type: "list",
            items: [
              "**Buffered jobs channel**: lets the producer run ahead by N jobs; absorbs bursts but delays backpressure.",
              "**Results by index**: if you need ordered output, include the job index and write into a pre-sized slice.",
              "**Errors**: put `err` in Result, or use `errgroup.Group` with `SetLimit(n)` (golang.org/x/sync) which bounds goroutines and returns the first error.",
              "**Cancellation**: workers `select` on `ctx.Done()` alongside receiving jobs and sending results, so a cancelled pool doesn't leak.",
            ],
          },
          {
            type: "code",
            lang: "go",
            code: `func worker(ctx context.Context, jobs <-chan Job, results chan<- Result) {
	for {
		select {
		case <-ctx.Done():
			return
		case j, ok := <-jobs:
			if !ok {
				return
			}
			r := process(j)
			select { // sending can block too: make it cancellable
			case results <- r:
			case <-ctx.Done():
				return
			}
		}
	}
}`,
            caption: "Cancellation-aware worker.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Calling `wg.Wait()` in main *before* reading results with an unbuffered results channel → deadlock.",
              "Workers closing the results channel → second close panics.",
              "Forgetting to close jobs → workers block forever; results never closes; main hangs.",
              "Sending results without a consumer running concurrently → workers stall.",
              "One goroutine per job with no limit, \"because goroutines are cheap\" — memory is cheap, your database is not.",
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
              { title: "Worker pool", points: ["Long-lived goroutines, fixed count", "Good for streams of jobs", "More plumbing"] },
              { title: "Semaphore + goroutine per job", points: ["Spawn per job, acquire a slot first", "Simple for a known batch", "Goroutines still created for every job (only execution is bounded)"] },
              { title: "errgroup.SetLimit", points: ["Minimal code; first-error + cancel", "External module (x/sync)", "Go blocks when at the limit"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Start N worker goroutines that `range` over a jobs channel and send to a results channel. The producer, as sole sender, closes jobs when done; a separate goroutine waits on a WaitGroup for all workers and then closes results; the consumer ranges over results. N is about GOMAXPROCS for CPU-bound work and set by downstream capacity for I/O-bound work. Add a context so workers exit on cancellation, and carry errors in the result or use errgroup with SetLimit.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Ordering: results arrive out of order — tag with job IDs or index into a slice.",
              "Graceful shutdown: stop the producer (cancel its context), let workers drain jobs already taken, then close results.",
              "Hot-key contention: if workers share a mutex-protected map, the pool may serialize on it — shard or batch.",
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
              "jobs → N workers → results.",
              "Producer closes jobs; closer goroutine closes results after wg.Wait().",
              "Consume results concurrently.",
              "Size by workload; add ctx for cancellation.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Worker pool", definition: "A fixed set of goroutines processing jobs from a shared queue." },
      { term: "Fan-out", definition: "Distributing work from one channel to many goroutines." },
      { term: "Fan-in", definition: "Merging outputs of many goroutines into one channel." },
      { term: "Little's law", definition: "Average items in a system = arrival rate × average time in system." },
    ],
    followUps: [
      { q: "How do you return results in input order?", a: "Include the index in each job and write to `results[idx]` in a pre-allocated slice (distinct indices don't race), then read after Wait." },
      { q: "What happens if one job panics?", a: "The whole program crashes unless the worker recovers; recover per job and convert it to an error result." },
      { q: "How do you stop the pool early on the first error?", a: "Use a context: cancel it on error; workers and producer select on ctx.Done(). errgroup.WithContext does this for you." },
    ],
    quiz: [
      {
        id: "wp-q1",
        prompt: "Who should close the results channel?",
        options: ["Each worker when it finishes", "The producer of jobs", "A goroutine that calls wg.Wait() then close(results)", "The consumer"],
        answer: 2,
        explanation: "Only once all senders (workers) are done is it safe to close.",
      },
      {
        id: "wp-q2",
        prompt: "Reasonable worker count for hashing files already in memory (CPU-bound)?",
        options: ["1", "≈ GOMAXPROCS", "10,000", "One per file"],
        answer: 1,
        explanation: "Parallelism is capped by the number of Ps.",
      },
    ],
    questions: ["go/go-22"],
  },

  // ───────────────────────────────────────────────────────── fork-join
  {
    slug: "fork-join",
    track: "go",
    title: "Fork-join",
    summary:
      "Split a problem into independent pieces, run them concurrently (fork), wait for all (join), then combine. In Go: goroutines + WaitGroup + per-goroutine result slots, with a threshold so tiny pieces stay sequential.",
    level: "intermediate",
    frequency: "medium",
    minutes: 25,
    kinds: ["coding", "theory", "visualization"],
    status: "authored",
    prerequisites: ["go/waitgroup", "go/goroutines"],
    related: ["go/worker-pool", "go/concurrent-requests", "go/atomics"],
    tags: ["fork-join", "divide and conquer", "parallel sum", "merge sort", "false sharing"],
    sources: [S.sync, S.errgroup, S.pgl, N.forkJoin, N.patterns],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Implement flat (chunked) and recursive fork-join in Go.",
              "Collect partial results without data races.",
              "Choose a granularity threshold.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Counting votes: split the ballot boxes among four counters (fork), wait until all four report (join), add the four subtotals (combine). The join point is a barrier — nobody adds up until everyone is done.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Fork", detail: "Start a goroutine per sub-task (or per chunk)." },
              { title: "Join", detail: "Wait for all of them — `wg.Wait()`, or receive N times from a channel." },
              { title: "Combine", detail: "Merge the partial results in the parent goroutine." },
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: parallel sum",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"sync"
)

func parallelSum(nums []int, parts int) int {
	partial := make([]int, parts) // one slot per goroutine: no shared writes
	chunk := (len(nums) + parts - 1) / parts

	var wg sync.WaitGroup
	for p := 0; p < parts; p++ { // fork
		lo := p * chunk
		hi := min(lo+chunk, len(nums))
		if lo >= hi {
			continue
		}
		wg.Add(1)
		go func() {
			defer wg.Done()
			for _, n := range nums[lo:hi] {
				partial[p] += n
			}
		}()
	}
	wg.Wait() // join

	total := 0
	for _, s := range partial { // combine
		total += s
	}
	return total
}

func main() {
	nums := make([]int, 1_000_000)
	for i := range nums {
		nums[i] = i + 1
	}
	fmt.Println(parallelSum(nums, 4))
}`,
            output: `500000500000`,
          },
          {
            type: "list",
            items: [
              "Each goroutine reads a disjoint subslice and writes only `partial[p]` — no locks needed.",
              "`wg.Wait()` makes all `partial` writes visible to the combining loop (Done synchronizes before Wait returns).",
              "Uses the `min` builtin (Go 1.21) and per-iteration loop variables (Go 1.22).",
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "False sharing",
            text: "`partial[0..3]` sit next to each other in one cache line, so four cores writing them in a hot loop keep invalidating each other's cache. Summing into a local variable and writing `partial[p]` once at the end avoids it — a hardware effect, invisible in the language semantics.",
          },
        ],
      },
      {
        id: "examples",
        title: "Recursive fork-join: parallel merge sort",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"slices"
	"sync"
)

const threshold = 2048 // below this, sequential is faster than spawning

func mergeSort(s []int) []int {
	if len(s) <= threshold {
		out := slices.Clone(s)
		slices.Sort(out)
		return out
	}
	mid := len(s) / 2
	var left []int
	var wg sync.WaitGroup
	wg.Add(1)
	go func() { // fork the left half
		defer wg.Done()
		left = mergeSort(s[:mid])
	}()
	right := mergeSort(s[mid:]) // do the right half ourselves
	wg.Wait()                   // join
	return merge(left, right)
}

func merge(a, b []int) []int {
	out := make([]int, 0, len(a)+len(b))
	i, j := 0, 0
	for i < len(a) && j < len(b) {
		if a[i] <= b[j] {
			out = append(out, a[i])
			i++
		} else {
			out = append(out, b[j])
			j++
		}
	}
	out = append(out, a[i:]...)
	return append(out, b[j:]...)
}

func main() {
	s := make([]int, 100_000)
	for i := range s {
		s[i] = (i * 7919) % 100_000
	}
	sorted := mergeSort(s)
	fmt.Println(slices.IsSorted(sorted), sorted[0], sorted[len(sorted)-1])
}`,
            output: `true 0 99999`,
          },
          {
            type: "p",
            text: "Two tricks: the parent does one half itself instead of idling (half the goroutines), and the threshold stops spawning when work is too small to amortize goroutine and merge overhead.",
          },
        ],
      },
      {
        id: "visualization",
        blocks: [
          { type: "viz", id: "go-waitgroup", caption: "The join: Wait releases only after every forked task calls Done." },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Fork-join", points: ["Known, finite set of sub-tasks", "Barrier at the end", "Natural for divide-and-conquer"] },
              { title: "Worker pool", points: ["Open-ended stream of jobs", "Fixed workers, no global barrier", "Better for unbounded input"] },
            ],
          },
          {
            type: "p",
            text: "Speed-up is limited by the sequential combine step and by memory bandwidth — summing integers is often memory-bound, so 4 goroutines rarely give 4×.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "All goroutines `+=` into one shared total without sync — data race.",
              "Forking on every recursive level down to size 1 — millions of goroutines, slower than sequential.",
              "Ignoring errors from sub-tasks — use errgroup to join and get the first error.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Fork-join splits work into independent parts, runs each in a goroutine, waits for all at a join point, then combines. In Go you fork with `go`, join with a WaitGroup (or errgroup for errors), and give each goroutine its own result slot to avoid races. Use a threshold so small sub-problems run sequentially, and remember the combine step and memory bandwidth cap the speed-up.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Fork → join (barrier) → combine.",
              "Per-goroutine result slots; no shared accumulator.",
              "Threshold for granularity; parent does half the work.",
              "Watch false sharing and memory-bound workloads.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Fork", definition: "Starting sub-tasks to run concurrently." },
      { term: "Join", definition: "Waiting for all forked sub-tasks to finish." },
      { term: "Barrier", definition: "A synchronization point that all participants must reach before any proceeds." },
      { term: "Granularity", definition: "Size of each sub-task relative to the overhead of running it concurrently." },
    ],
    followUps: [
      { q: "How is Go's runtime itself fork-join friendly?", a: "Work stealing: idle Ps steal half of a busy P's run queue, which is how fork-join schedulers (like Java's ForkJoinPool or Cilk) balance load too." },
      { q: "When would you use channels instead of a WaitGroup to join?", a: "When sub-tasks produce values you want to stream or process as they arrive: receive exactly N results from a channel." },
    ],
    quiz: [
      {
        id: "fj-q1",
        prompt: "Why give each goroutine its own `partial[p]`?",
        options: ["Speed only", "Distinct elements are distinct memory locations, so there is no data race", "Slices are atomic", "WaitGroup requires it"],
        answer: 1,
        explanation: "Concurrent writes to different elements don't conflict; one shared int would race.",
      },
      {
        id: "fj-q2",
        prompt: "What does the threshold in parallel merge sort prevent?",
        options: ["Deadlock", "Spawning goroutines for work too small to benefit", "Stack overflow", "Data races"],
        answer: 1,
        explanation: "Below some size, goroutine overhead outweighs parallel gains.",
      },
    ],
    questions: ["go/go-06", "go/go-22"],
  },

  // ───────────────────────────────────────────────────────── concurrent-requests
  {
    slug: "concurrent-requests",
    track: "go",
    title: "Making concurrent HTTP requests",
    summary:
      "Fan out N HTTP calls with goroutines, bound how many are in flight, put a deadline on all of them with context, always close response bodies, and collect results without races.",
    level: "intermediate",
    frequency: "high",
    minutes: 30,
    kinds: ["coding", "visualization"],
    status: "authored",
    prerequisites: ["go/goroutines", "go/waitgroup", "go/http-client", "go/context"],
    related: ["go/worker-pool", "go/backpressure-bounded-concurrency", "go/goroutine-leaks", "go/fork-join"],
    tags: ["http", "fan-out", "semaphore", "timeout", "httptest", "connection pooling"],
    sources: [{ label: "Package net/http (Client)", url: "https://pkg.go.dev/net/http#Client", kind: "docs" }, S.contextPkg, S.errgroup, S.pgl, N.requests],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Fetch many URLs concurrently and keep results in input order.",
              "Limit in-flight requests with a semaphore channel.",
              "Apply a shared deadline through `http.NewRequestWithContext`.",
              "Avoid leaking connections and goroutines.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Five requests that each take 100 ms take 500 ms one after another. Concurrently they take ~100 ms — the waits overlap. But firing 10,000 at once at one API gets you rate-limited or knocks it over, so you cap the number in flight.",
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"sync"
	"time"
)

func fetch(ctx context.Context, client *http.Client, url string) (string, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return "", err
	}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close() // always close, or the connection can't be reused
	b, err := io.ReadAll(resp.Body)
	return string(b), err
}

func main() {
	// A local test server stands in for real APIs: each request takes 100ms.
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(100 * time.Millisecond)
		fmt.Fprintf(w, "hello from %s", r.URL.Path)
	}))
	defer srv.Close()

	paths := []string{"/a", "/b", "/c", "/d", "/e"}
	bodies := make([]string, len(paths)) // results by index: order preserved, no race
	errs := make([]error, len(paths))

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	client := &http.Client{} // reuse one client: connection pooling
	sem := make(chan struct{}, 3) // at most 3 requests in flight
	var wg sync.WaitGroup

	start := time.Now()
	for i, p := range paths {
		wg.Add(1)
		go func() {
			defer wg.Done()
			sem <- struct{}{}        // acquire a slot
			defer func() { <-sem }() // release it
			bodies[i], errs[i] = fetch(ctx, client, srv.URL+p)
		}()
	}
	wg.Wait()

	for i := range paths {
		fmt.Println(bodies[i], errs[i])
	}
	elapsed := time.Since(start)
	fmt.Println("faster than sequential (500ms):", elapsed < 450*time.Millisecond)
}`,
            caption: "Takes ~200 ms: 3 requests, then the remaining 2.",
            output: `hello from /a <nil>
hello from /b <nil>
hello from /c <nil>
hello from /d <nil>
hello from /e <nil>
faster than sequential (500ms): true`,
          },
          {
            type: "steps",
            steps: [
              { title: "Spawn 5 goroutines", detail: "Each tries to put a token into `sem` (capacity 3). Three succeed; two block." },
              { title: "Requests run", detail: "Each goroutine blocks in network I/O — parked on the netpoller, no thread held." },
              { title: "Slots free up", detail: "After ~100 ms, finished goroutines release tokens; the two waiting ones proceed." },
              { title: "Join", detail: "wg.Wait() returns after ~200 ms. Results are printed in input order because each goroutine wrote its own index." },
            ],
          },
        ],
      },
      {
        id: "visualization",
        blocks: [
          { type: "viz", id: "go-worker-pool", caption: "Bounded concurrency: a fixed number of slots, the rest of the work queued." },
        ],
      },
      {
        id: "internals",
        title: "What the http.Client does for you",
        blocks: [
          {
            type: "list",
            items: [
              "`http.Client` and its `Transport` are safe for concurrent use and keep a pool of idle keep-alive connections per host. Create one and reuse it.",
              "`DefaultTransport` keeps at most **2 idle connections per host** (`MaxIdleConnsPerHost`). With high fan-out to one host, raise it, or you'll churn TCP/TLS handshakes.",
              "A connection only returns to the pool if you read the body to EOF **and** close it.",
              "`http.DefaultClient` has **no timeout**. Use a context deadline per request or set `Client.Timeout`.",
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
              "First success wins (hedged/racing requests): send results on a channel buffered to N, take the first, then `cancel()` the rest — buffering prevents the losers from leaking.",
              "Partial failure: decide up front — fail all on first error (errgroup.WithContext) or collect all errors (`errors.Join`).",
              "Per-request timeout vs overall deadline: derive a child `context.WithTimeout` per request from the overall context.",
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
              "Appending to a shared slice from goroutines — data race. Index into a pre-sized slice or use a channel.",
              "Forgetting `resp.Body.Close()` — leaks connections and the goroutines that read them.",
              "New `http.Client{}` per request with a custom Transport — no connection reuse.",
              "Unbounded goroutines against a single upstream service.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Spawn a goroutine per URL, each writing to its own index in a results slice, and join with a WaitGroup (or errgroup to get the first error and cancel the rest). Bound concurrency with a buffered-channel semaphore or errgroup.SetLimit. Pass a context with a deadline into `http.NewRequestWithContext` so slow calls are cancelled. Reuse one http.Client, always read and close bodies, and tune MaxIdleConnsPerHost for high fan-out to one host.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Goroutine per request + WaitGroup/errgroup.",
              "Semaphore channel to cap in-flight requests.",
              "Context deadline on every request.",
              "One shared client; always close bodies.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Semaphore", definition: "A counter limiting how many goroutines may proceed at once; a buffered channel of capacity N works as one." },
      { term: "Connection pooling", definition: "Reusing established TCP/TLS connections for multiple requests." },
      { term: "httptest.Server", definition: "Standard-library local HTTP server for tests and examples." },
      { term: "Hedged request", definition: "Sending duplicate requests and using the first response to cut tail latency." },
    ],
    followUps: [
      { q: "How would you return the first successful response and cancel the rest?", a: "Shared cancellable context; results channel buffered to N; receive until one succeeds, then cancel()." },
      { q: "Why might 100 concurrent requests to one host be slow even though the code is concurrent?", a: "Only 2 idle connections are kept per host by default, so many requests open new TCP/TLS connections; HTTP/1.1 also can't multiplex. Raise MaxIdleConnsPerHost or use HTTP/2." },
    ],
    quiz: [
      {
        id: "creq-q1",
        prompt: "What does `sem := make(chan struct{}, 3)` implement when goroutines send before working and receive after?",
        options: ["A mutex", "A limit of 3 concurrent workers", "A 3-second timeout", "A queue of results"],
        answer: 1,
        explanation: "A buffered channel of capacity 3 is a counting semaphore.",
      },
      {
        id: "creq-q2",
        prompt: "Which is a data race?",
        options: ["Each goroutine writes `results[i]` for its own i", "Each goroutine does `results = append(results, r)`", "Each goroutine sends on a channel", "Each goroutine calls wg.Done()"],
        answer: 1,
        explanation: "append reads and writes the shared slice header.",
      },
    ],
    questions: ["go/go-11", "go/go-22"],
  },

  // ───────────────────────────────────────────────────────── context
  {
    slug: "context",
    track: "go",
    title: "context: cancellation, deadlines and request-scoped values",
    summary:
      "A `context.Context` carries a cancellation signal, an optional deadline and request-scoped values down a call tree. Cancelling a context cancels everything derived from it — and only that — so one request's timeout cleanly stops all the work it started.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 35,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/select", "go/channel-close-range"],
    related: ["go/goroutine-leaks", "go/graceful-shutdown", "go/concurrent-requests", "go/worker-pool"],
    tags: ["context", "cancellation", "deadline", "timeout", "WithValue", "context tree"],
    sources: [S.contextPkg, S.contextBlog, S.pipelines, S.pgl, N.context],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Create derived contexts with WithCancel, WithTimeout, WithDeadline, WithValue.",
              "Explain the context tree and that cancellation propagates only downward.",
              "Make your own functions respect `ctx.Done()`.",
              "Follow the conventions: first parameter, always call cancel, values only for request-scoped data.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "An HTTP request arrives and your handler calls a DB, two APIs and a cache, some in goroutines. The client hangs up. Without context, all that work continues for nobody. Context is the shared \"stop\" wire threaded through every call: pull it once at the top, and everything downstream hears it.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `type Context interface {
	Deadline() (deadline time.Time, ok bool)
	Done() <-chan struct{} // closed when cancelled or deadline passes
	Err() error            // nil, context.Canceled or context.DeadlineExceeded
	Value(key any) any
}`,
          },
          {
            type: "table",
            head: ["Constructor", "Cancelled when"],
            rows: [
              ["`context.Background()` / `TODO()`", "Never — roots of the tree"],
              ["`WithCancel(parent)`", "You call `cancel()`, or the parent is cancelled"],
              ["`WithTimeout(parent, d)` / `WithDeadline(parent, t)`", "Time passes, `cancel()`, or parent cancelled"],
              ["`WithValue(parent, k, v)`", "Only when the parent is (adds a value, no new cancellation)"],
              ["`WithCancelCause` (1.20)", "Like WithCancel; `context.Cause(ctx)` returns the reason you passed"],
              ["`WithoutCancel(parent)` (1.21)", "Never — keeps values, detaches from parent's cancellation"],
              ["`AfterFunc(ctx, f)` (1.21)", "Not a constructor: runs f in its own goroutine after ctx is done"],
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"context"
	"errors"
	"fmt"
	"time"
)

func slowOp(ctx context.Context) error {
	select {
	case <-time.After(200 * time.Millisecond): // the "work"
		return nil
	case <-ctx.Done(): // cancelled or deadline passed
		return ctx.Err()
	}
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancel() // always release the timer and the child's resources

	err := slowOp(ctx)
	fmt.Println(err)
	fmt.Println(errors.Is(err, context.DeadlineExceeded))
}`,
            output: `context deadline exceeded
true`,
          },
          {
            type: "p",
            text: "**The tree.** Every derived context has a parent. Cancellation flows from a node to its descendants, never upward or sideways:",
          },
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"context"
	"fmt"
)

type ctxKey struct{} // unexported key type: no collisions with other packages

func main() {
	root := context.Background()
	parent, cancelParent := context.WithCancel(root)
	child, cancelChild := context.WithCancel(parent)
	reqCtx := context.WithValue(child, ctxKey{}, "req-42")

	cancelChild() // cancelling a child does not affect its parent
	fmt.Println("parent:", parent.Err(), "| child:", child.Err())

	cancelParent() // cancelling a parent cancels the whole subtree
	fmt.Println("parent:", parent.Err(), "| value ctx:", reqCtx.Err())
	fmt.Println("request id still readable:", reqCtx.Value(ctxKey{}))
}`,
            output: `parent: <nil> | child: context canceled
parent: context canceled | value ctx: context canceled
request id still readable: req-42`,
          },
          {
            type: "flow",
            nodes: ["Background", "WithCancel (parent)", "WithCancel (child)", "WithValue (reqCtx)"],
            caption: "Conceptual: cancel flows left → right only.",
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "list",
            items: [
              "A cancellable context (`cancelCtx`) holds a mutex, a lazily created `done` channel, the error, and a set of child cancelers.",
              "When derived, a child registers itself in its nearest cancellable ancestor's children set. Cancelling closes `done` (the broadcast!) and recursively cancels children, then removes itself from its parent.",
              "`WithTimeout` = cancelCtx + a `time.AfterFunc` timer that calls cancel; calling cancel early stops the timer — hence \"always call cancel\".",
              "`WithValue` contexts form a linked list; `Value` walks up toward the root, O(depth). Fine for a few values, not a map.",
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "Struct names (`cancelCtx`, `timerCtx`, `valueCtx`) and the registration mechanism are implementation details of package context; the documented contract is Done/Err/Deadline/Value semantics and propagation to derived contexts.",
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"context"
	"errors"
	"fmt"
)

func main() {
	ctx, cancel := context.WithCancelCause(context.Background()) // Go 1.20+
	cancel(errors.New("upstream returned 503"))
	fmt.Println(ctx.Err())
	fmt.Println(context.Cause(ctx))
}`,
            output: `context canceled
upstream returned 503`,
          },
          {
            type: "code",
            lang: "go",
            code: `func (s *Server) handle(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context() // cancelled if the client disconnects or the server shuts down
	ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()

	user, err := s.db.QueryUser(ctx, r.URL.Query().Get("id")) // database/sql honours ctx
	if errors.Is(err, context.DeadlineExceeded) {
		http.Error(w, "timeout", http.StatusGatewayTimeout)
		return
	}
	// ...
}`,
            caption: "Typical server usage.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Not calling cancel → the timer and child registration linger until the parent is cancelled (`go vet` lostcancel check warns).",
              "Storing a Context in a struct field — pass it explicitly as the first parameter, named `ctx`.",
              "Passing `nil` — use `context.TODO()` if unsure.",
              "Using WithValue for optional function parameters or dependencies (loggers, DB handles). Values are for request-scoped data crossing API boundaries: request IDs, auth claims, trace spans.",
              "Using built-in types like `string` as keys — collisions across packages. Use an unexported key type.",
              "Starting background work from a request handler with `r.Context()` — it is cancelled when the response is sent. Use `context.WithoutCancel(r.Context())` (1.21) to keep values but not cancellation.",
              "Assuming cancellation is preemptive. It's cooperative: code must check `ctx.Done()`/`ctx.Err()`.",
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
              { title: "context", points: ["Standard: net/http, database/sql, gRPC all accept it", "Deadlines + values + cancellation", "Must be threaded through every signature"] },
              { title: "Plain done channel", points: ["Minimal, no allocation per derivation", "No deadlines or values", "Fine inside a single package's goroutines"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "context.Context carries cancellation, deadlines and request-scoped values. Contexts form a tree from Background; WithCancel/WithTimeout/WithDeadline derive children, and cancelling a node closes its Done channel and cancels all descendants but never its parent. Functions take ctx as the first argument, select on `ctx.Done()` and return `ctx.Err()`. Always defer the cancel func to release timers. Use values only for request-scoped data with unexported key types.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Why is Done a channel? Closing a channel is a broadcast that any number of goroutines can select on, composing with other channel operations.",
              "Deadline propagation over the network: gRPC sends the remaining deadline in a header so downstream services inherit the budget.",
              "Cost: each WithCancel allocates and registers with the parent; deeply nested contexts make Value lookups slower.",
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
              "Tree of contexts; cancellation propagates downward only.",
              "ctx first param; defer cancel(); select on ctx.Done().",
              "Err: Canceled or DeadlineExceeded; Cause (1.20) for reasons.",
              "Values: request-scoped only, unexported keys.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Context", definition: "Interface carrying deadline, cancellation signal and request-scoped values." },
      { term: "Context tree", definition: "Parent/child relationships formed by deriving contexts; cancellation flows to descendants." },
      { term: "context.Canceled", definition: "Error returned by Err() after explicit cancellation." },
      { term: "context.DeadlineExceeded", definition: "Error returned by Err() after the deadline passed." },
      { term: "lostcancel", definition: "go vet check that flags a cancel function that isn't called on all paths." },
    ],
    followUps: [
      { q: "If a child context has a 5 s timeout and its parent 1 s, when is the child cancelled?", a: "After 1 s — a child's effective deadline is the earlier of its own and its ancestors'." },
      { q: "Does cancelling a context kill goroutines using it?", a: "No. It closes Done; goroutines must observe it and return." },
      { q: "How do you run cleanup when a context is cancelled without a dedicated goroutine?", a: "`context.AfterFunc(ctx, f)` (Go 1.21) — f runs in its own goroutine after ctx is done; the returned stop func deregisters it." },
    ],
    quiz: [
      {
        id: "ctx-q1",
        prompt: "You cancel a child context. What happens to its parent?",
        options: ["Parent is cancelled", "Nothing", "Parent's deadline is reset", "Panic"],
        answer: 1,
        explanation: "Cancellation propagates only to descendants.",
      },
      {
        id: "ctx-q2",
        prompt: "Why `defer cancel()` right after `WithTimeout` even if the timeout will fire anyway?",
        options: ["Style only", "It releases the timer and parent registration as soon as the work is done", "Otherwise the deadline is ignored", "Required for Value to work"],
        answer: 1,
        explanation: "Until cancel runs or the deadline fires, resources stay attached to the parent.",
      },
      {
        id: "ctx-q3",
        prompt: "Which is an appropriate context value?",
        options: ["A *sql.DB", "An optional timeout parameter", "The request's trace ID", "A logger configuration flag"],
        answer: 2,
        explanation: "Request-scoped data that crosses API boundaries.",
      },
    ],
    questions: ["go/go-11", "go/go-10"],
  },

  // ───────────────────────────────────────────────────────── race-deadlock-livelock
  {
    slug: "race-deadlock-livelock",
    track: "go",
    title: "Race conditions, deadlocks, livelocks and starvation",
    summary:
      "The four classic concurrency failure modes: wrong answers from unlucky timing (races), everyone waiting forever (deadlock), everyone busy but going nowhere (livelock), and someone never getting a turn (starvation) — what each looks like in Go and how to prevent it.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 35,
    kinds: ["theory", "coding", "visualization"],
    status: "authored",
    prerequisites: ["go/mutex", "go/channels"],
    related: ["go/race-detector", "go/atomics", "go/goroutine-leaks", "os/synchronization", "system-design/locks-transactions-isolation"],
    tags: ["race condition", "data race", "deadlock", "livelock", "starvation", "Coffman conditions", "lock ordering"],
    sources: [S.memModel, S.race, S.sync, S.pgl, N.raceDeadlock],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Distinguish a **data race** from a **race condition**.",
              "Recognise and prevent deadlocks (lock ordering, channel cycles).",
              "Explain livelock and starvation with examples.",
              "Know what Go's runtime detects for you — and what it doesn't.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "list",
            items: [
              "**Race condition**: two shoppers both see \"1 left\" and both buy it.",
              "**Deadlock**: two cars at a narrow bridge, each waiting for the other to reverse.",
              "**Livelock**: two people in a corridor both step left, then both step right, forever.",
              "**Starvation**: a polite person at a busy counter who never gets served because others keep cutting in.",
            ],
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Failure", "Definition", "Symptom"],
            rows: [
              ["Data race", "Concurrent access to one memory location, ≥1 write, not synchronized", "Corrupt or stale values; undefined behaviour; detected by `-race`"],
              ["Race condition", "Correctness depends on timing/interleaving of operations (even if each is synchronized)", "Intermittent wrong results; `-race` may be silent"],
              ["Deadlock", "A set of goroutines each waiting for something another holds", "Hang; or `fatal error: all goroutines are asleep - deadlock!`"],
              ["Livelock", "Goroutines keep reacting to each other and changing state, but make no progress", "High CPU, no throughput"],
              ["Starvation", "A goroutine is perpetually denied a resource others keep getting", "Some requests time out while the system looks healthy"],
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: a race condition with no data race",
        blocks: [
          {
            type: "p",
            text: "Every access below is mutex-protected, so `go run -race` reports nothing. The bug is that *check* and *act* are two separate critical sections.",
          },
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"sync"
	"time"
)

type Account struct {
	mu      sync.Mutex
	balance int
}

func (a *Account) Balance() int { a.mu.Lock(); defer a.mu.Unlock(); return a.balance }
func (a *Account) Debit(n int)  { a.mu.Lock(); defer a.mu.Unlock(); a.balance -= n }

func main() {
	acc := &Account{balance: 100}
	var wg sync.WaitGroup
	for range 2 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			if acc.Balance() >= 100 { // check…
				time.Sleep(time.Millisecond) // e.g. a fraud-check call
				acc.Debit(100) // …then act on a stale answer
			}
		}()
	}
	wg.Wait()
	fmt.Println("balance:", acc.Balance())
}`,
            caption: "Timing-dependent; with the sleep it almost always overdraws:",
            output: `balance: -100`,
          },
          {
            type: "p",
            text: "Fix: make the compound operation atomic — one method `TryDebit(n) bool` that checks and debits under a single Lock. The same idea at the database level is `UPDATE … SET balance = balance - 100 WHERE balance >= 100`.",
          },
        ],
      },
      {
        id: "internals",
        title: "Deadlock: conditions and prevention",
        blocks: [
          {
            type: "p",
            text: "A deadlock needs all four **Coffman conditions**: mutual exclusion, hold-and-wait, no preemption, and circular wait. Break any one and deadlock is impossible — in practice we break *circular wait* with a global lock order.",
          },
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"sync"
	"time"
)

func main() {
	var a, b sync.Mutex
	var wg sync.WaitGroup
	wg.Add(2)
	go func() {
		defer wg.Done()
		a.Lock()
		time.Sleep(10 * time.Millisecond)
		b.Lock() // waits for goroutine 2
		fmt.Println("g1 got both")
		b.Unlock()
		a.Unlock()
	}()
	go func() {
		defer wg.Done()
		b.Lock()
		time.Sleep(10 * time.Millisecond)
		a.Lock() // waits for goroutine 1
		fmt.Println("g2 got both")
		a.Unlock()
		b.Unlock()
	}()
	wg.Wait()
}`,
            caption: "AB/BA lock ordering; abridged output:",
            output: `fatal error: all goroutines are asleep - deadlock!

goroutine 1 [sync.WaitGroup.Wait]:
...
goroutine 7 [sync.Mutex.Lock]:
...
goroutine 8 [sync.Mutex.Lock]:
...`,
          },
          {
            type: "list",
            items: [
              "**Lock ordering**: always acquire A before B (e.g. order by account ID when transferring between two accounts).",
              "**Lock scope**: never call unknown code, block on a channel, or do I/O while holding a lock.",
              "**Timeouts**: channels + select/context let you give up instead of waiting forever. `sync.Mutex` has no timed Lock.",
              "**Channel cycles** deadlock too: A waits to send to B while B waits to send to A.",
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "What the runtime detects",
            text: "The runtime's check only fires when *every* goroutine is blocked and no timers or network pollers could wake one. A deadlock among 2 goroutines in a server with other live goroutines just hangs silently. Use goroutine profiles (`/debug/pprof/goroutine?debug=2`) to find them.",
          },
        ],
      },
      {
        id: "visualization",
        blocks: [
          { type: "viz", id: "go-mutex", caption: "Interleavings that lose updates, and how a mutex serializes the critical section." },
        ],
      },
      {
        id: "examples",
        title: "Livelock and starvation",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `// Illustrative livelock: each goroutine grabs its first lock, fails TryLock on
// the second, politely releases and retries — in lockstep, forever.
func polite(first, second *sync.Mutex) {
	for {
		first.Lock()
		if second.TryLock() {
			// work...
			second.Unlock()
			first.Unlock()
			return
		}
		first.Unlock()
		time.Sleep(time.Millisecond) // same back-off as the other goroutine
	}
}
// go polite(&a, &b); go polite(&b, &a)`,
            caption: "Fix: random jitter in the back-off, or a consistent lock order (which removes the conflict entirely).",
          },
          {
            type: "list",
            items: [
              "**Starvation in Go**: a greedy goroutine repeatedly re-acquiring a mutex used to starve waiters; `sync.Mutex` starvation mode (> 1 ms wait) hands the lock off FIFO. RWMutex blocks new readers when a writer waits so writers aren't starved.",
              "Scheduler-level starvation of tight loops was fixed by async preemption (Go 1.14).",
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
              "Believing \"race detector clean\" means \"race-free logic\" — it finds data races only, and only on executed paths.",
              "Treating `time.Sleep` as synchronization in tests.",
              "Holding a mutex while sending on an unbuffered channel whose receiver needs the same mutex.",
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
              { title: "Coarse-grained locking", points: ["One lock, easy to reason about", "No ordering problems", "Contention under load"] },
              { title: "Fine-grained locking", points: ["More parallelism", "Lock ordering discipline required", "Higher deadlock risk"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "A data race is unsynchronized concurrent access with at least one write — undefined behaviour, caught by `-race`. A race condition is broader: the result depends on timing, e.g. check-then-act across two locked calls, which the race detector won't catch. A deadlock is a cycle of goroutines waiting on each other — prevent it with consistent lock ordering and not holding locks across blocking calls; Go only detects it when all goroutines are blocked. Livelock is busy non-progress (fix with jittered back-off); starvation is a goroutine never getting a resource (mutex starvation mode mitigates it).",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Data race ⊂ race conditions; `-race` finds only the former.",
              "Deadlock = circular wait; prevent with lock ordering and short critical sections.",
              "Runtime deadlock detection is global-only.",
              "Livelock: jitter; starvation: fairness (FIFO hand-off).",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Data race", definition: "Unsynchronized concurrent accesses to the same memory, at least one a write." },
      { term: "Race condition", definition: "A bug where correctness depends on the relative timing of events." },
      { term: "Deadlock", definition: "Goroutines blocked forever, each waiting for a resource held by another." },
      { term: "Livelock", definition: "Goroutines actively changing state in response to each other without progress." },
      { term: "Starvation", definition: "A goroutine indefinitely denied access to a resource." },
      { term: "Coffman conditions", definition: "Mutual exclusion, hold-and-wait, no preemption, circular wait — all required for deadlock." },
      { term: "Check-then-act", definition: "Deciding based on a read, then acting, without holding a lock across both." },
    ],
    followUps: [
      { q: "How do you transfer money between two accounts without deadlock?", a: "Lock both accounts' mutexes in a global order (e.g. by ID), regardless of transfer direction." },
      { q: "Can a program with GOMAXPROCS=1 have a data race?", a: "Yes — preemption can interleave a read-modify-write; and the race detector reports it regardless." },
      { q: "Why doesn't my deadlocked server print 'all goroutines are asleep'?", a: "Other goroutines (listener, netpoller, timers) are still alive, so the global check doesn't fire." },
    ],
    quiz: [
      {
        id: "rdl-q1",
        prompt: "Both Balance() and Debit() lock the same mutex. Two goroutines do `if Balance() >= 100 { Debit(100) }`. What does `-race` report?",
        options: ["A data race", "Nothing — but there is a race condition", "A deadlock", "A livelock"],
        answer: 1,
        explanation: "All accesses are synchronized, so no data race; the logic is still timing-dependent.",
      },
      {
        id: "rdl-q2",
        prompt: "Which Coffman condition does a global lock order break?",
        options: ["Mutual exclusion", "Hold and wait", "No preemption", "Circular wait"],
        answer: 3,
        explanation: "If everyone acquires in the same order, no cycle can form.",
      },
    ],
    questions: ["go/go-08", "go/go-09"],
  },

  // ───────────────────────────────────────────────────────── goroutine-leaks
  {
    slug: "goroutine-leaks",
    track: "go",
    title: "Goroutine leaks",
    summary:
      "A leaked goroutine is blocked forever — on a channel nobody will use, a lock nobody will release, or a loop with no exit. Leaks aren't garbage collected; they accumulate until memory or file descriptors run out. Every goroutine needs a known way to end.",
    level: "intermediate",
    frequency: "high",
    minutes: 25,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/channels", "go/select", "go/context"],
    related: ["go/profiling-pprof", "go/backpressure-bounded-concurrency", "go/concurrent-requests"],
    tags: ["goroutine leak", "NumGoroutine", "pprof goroutine", "goleak", "blocked forever"],
    sources: [S.pipelines, S.pprof, { label: "uber-go/goleak", url: "https://github.com/uber-go/goleak", kind: "external" }, S.pgl],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "List the common shapes of goroutine leaks.",
              "Fix them with buffering, close, or context cancellation.",
              "Detect leaks in tests and in production.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A goroutine waiting on a channel that nobody will ever touch is like a caller on hold for a department that was shut down: it never hangs up on its own. The garbage collector can't help, because a blocked goroutine is a GC root — it and everything it references stay alive.",
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"runtime"
	"time"
)

// firstResult returns whichever of 3 goroutines answers first.
func firstResult() int {
	ch := make(chan int) // BUG: unbuffered — the 2 losers block forever on send
	for i := 0; i < 3; i++ {
		go func() { ch <- i }()
	}
	return <-ch
}

func main() {
	firstResult()
	time.Sleep(50 * time.Millisecond) // let the losers reach their send
	fmt.Println("goroutines:", runtime.NumGoroutine())
}`,
            output: `goroutines: 3`,
          },
          {
            type: "steps",
            steps: [
              { title: "Three senders", detail: "All three try to send on an unbuffered channel." },
              { title: "One receive", detail: "firstResult takes one value and returns; `ch` is still referenced by the two blocked goroutines." },
              { title: "Leak", detail: "main + 2 stuck senders = 3 goroutines, forever. Called per request, this grows without bound." },
              { title: "Fix", detail: "`make(chan int, 3)` — every sender can complete and exit. Or pass a ctx and `select` on `ctx.Done()` in the send." },
            ],
          },
        ],
      },
      {
        id: "definition",
        title: "Common leak shapes",
        blocks: [
          {
            type: "table",
            head: ["Shape", "Fix"],
            rows: [
              ["Send with no receiver (abandoned result, timeout pattern)", "Buffer to the number of senders, or select on ctx.Done()"],
              ["Receive/range on a channel nobody closes", "Owner closes when done"],
              ["for-select loop with no exit case", "Add `case <-ctx.Done(): return`"],
              ["Worker blocked sending results after consumer gave up", "Make sends cancellable too"],
              ["Blocked on a mutex never unlocked (missing Unlock on an error path)", "`defer mu.Unlock()`"],
              ["HTTP response body never closed", "`defer resp.Body.Close()`"],
              ["Ticker never stopped (pre–Go 1.23)", "`defer t.Stop()`; Go 1.23+ GC-collects unreferenced tickers"],
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "Detecting leaks",
        blocks: [
          {
            type: "list",
            items: [
              "**Metric**: export `runtime.NumGoroutine()`; a number that only goes up under steady load is a leak.",
              "**Profile**: `/debug/pprof/goroutine?debug=1` groups goroutines by stack with counts — thousands parked at the same `chan send` line is your culprit. `debug=2` shows each goroutine with how long it has been blocked.",
              "**Tests**: `go.uber.org/goleak` fails a test if unexpected goroutines remain at the end (`defer goleak.VerifyNone(t)` or `goleak.VerifyTestMain`).",
            ],
          },
          {
            type: "code",
            lang: "text",
            code: `goroutine profile: total 10004
10000 @ 0x43a5d6 0x407b0c 0x4078f8 0x6a1c45 0x46e8e1
#	0x6a1c44	main.firstResult.func1+0x24	/app/main.go:13
...`,
            caption: "Illustrative /debug/pprof/goroutine?debug=1 output: 10,000 goroutines stuck on the same line.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Starting a goroutine without being able to answer \"when and how does it exit?\"",
              "Assuming unreachable channels free their blocked goroutines — they don't.",
              "Fixing a leak by adding `time.Sleep` or a huge buffer instead of fixing ownership.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "A goroutine leak is a goroutine that blocks forever — typically sending to a channel with no receiver, ranging over a channel nobody closes, or looping without a cancellation case. Blocked goroutines are GC roots, so their stacks and everything they reference stay allocated. Prevent with clear ownership (sender closes), buffered result channels for abandoned results, and context cancellation in every blocking select. Detect via NumGoroutine metrics, pprof goroutine profiles and goleak in tests.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Every goroutine needs an exit path.",
              "Blocked goroutines are never collected.",
              "Buffer abandoned results; close owned channels; select on ctx.Done().",
              "Watch NumGoroutine; read goroutine profiles; use goleak.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Goroutine leak", definition: "A goroutine that can never terminate, permanently consuming resources." },
      { term: "GC root", definition: "A starting point for reachability in garbage collection; goroutine stacks are roots." },
      { term: "goleak", definition: "Uber's library that detects goroutines left running at the end of tests." },
    ],
    followUps: [
      { q: "Why doesn't the GC collect a goroutine blocked on an unreachable channel?", a: "The goroutine itself is a root and references the channel; the runtime doesn't prove that nothing can ever wake it." },
      { q: "How would you find a leak in production?", a: "Graph goroutine count over time, then take a goroutine profile and look for large groups parked at the same stack." },
    ],
    quiz: [
      {
        id: "leak-q1",
        prompt: "Smallest fix for the firstResult leak with 3 senders?",
        options: ["close(ch) after receiving", "make(chan int, 3)", "runtime.GC()", "time.Sleep in senders"],
        answer: 1,
        explanation: "Closing would make the senders panic. A buffer of 3 lets every sender complete.",
      },
      {
        id: "leak-q2",
        prompt: "Which pprof endpoint helps most for leaks?",
        options: ["/debug/pprof/profile", "/debug/pprof/goroutine", "/debug/pprof/heap only", "/debug/pprof/trace"],
        answer: 1,
        explanation: "It shows where all goroutines are parked, grouped by stack.",
      },
    ],
    questions: ["go/go-10"],
  },

  // ───────────────────────────────────────────────────────── backpressure-bounded-concurrency
  {
    slug: "backpressure-bounded-concurrency",
    track: "go",
    title: "Backpressure and bounded concurrency",
    summary:
      "Unbounded goroutines and unbounded queues turn a traffic spike into an out-of-memory crash. Bound concurrency with semaphores and pools, bound queues with buffered channels, and decide explicitly whether to block, drop or reject when full.",
    level: "advanced",
    frequency: "high",
    minutes: 25,
    kinds: ["theory", "coding", "visualization"],
    status: "authored",
    prerequisites: ["go/worker-pool", "go/select"],
    related: ["system-design/backpressure", "system-design/rate-limiting", "go/concurrent-requests", "go/goroutine-leaks"],
    tags: ["backpressure", "semaphore", "bounded queue", "load shedding", "errgroup SetLimit"],
    sources: [S.pipelines, S.errgroup, { label: "golang.org/x/sync/semaphore", url: "https://pkg.go.dev/golang.org/x/sync/semaphore", kind: "docs" }, S.pgl, N.patterns],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain backpressure and why unbounded buffering fails.",
              "Bound concurrency with a channel semaphore, errgroup.SetLimit or a weighted semaphore.",
              "Pick a full-queue policy: block, drop, or reject with an error (429).",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A sink drains 1 L/min. If the tap runs at 2 L/min, a bigger sink only delays the flood. Backpressure is the drain telling the tap to slow down. In Go, a full buffered channel blocking the sender *is* that signal.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "list",
            items: [
              "**Backpressure**: a slow consumer causes producers to slow down, propagating upstream to the source (e.g. TCP flow control, a client waiting).",
              "**Bounded concurrency**: at most N operations in progress at once.",
              "**Bounded queue**: at most M items waiting.",
              "When both are full, something must give: **block** the producer, **drop** (shed) the item, or **reject** with an error the caller can retry later.",
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"
	"sync"
	"sync/atomic"
	"time"
)

func main() {
	const limit = 3
	sem := make(chan struct{}, limit)
	var inFlight, peak atomic.Int32
	var wg sync.WaitGroup

	for i := 0; i < 20; i++ {
		sem <- struct{}{} // blocks the loop (the producer) while 3 are running
		wg.Add(1)
		go func() {
			defer wg.Done()
			defer func() { <-sem }()
			n := inFlight.Add(1)
			for { // record the highest concurrency seen
				p := peak.Load()
				if n <= p || peak.CompareAndSwap(p, n) {
					break
				}
			}
			time.Sleep(10 * time.Millisecond) // simulated I/O
			inFlight.Add(-1)
		}()
	}
	wg.Wait()
	fmt.Println("peak concurrency:", peak.Load(), "<= limit:", peak.Load() <= limit)
}`,
            caption: "Peak is typically exactly 3; the guarantee is ≤ 3.",
            output: `peak concurrency: 3 <= limit: true`,
          },
          {
            type: "p",
            text: "Acquiring the semaphore *before* `go` means at most 3 goroutines even exist — the loop itself is throttled (backpressure on the producer). Acquiring inside the goroutine would bound execution but still create all 20 goroutines up front.",
          },
        ],
      },
      {
        id: "visualization",
        blocks: [
          { type: "viz", id: "go-worker-pool", caption: "A fixed pool with a bounded job queue: when it's full, the producer waits." },
        ],
      },
      {
        id: "examples",
        title: "Full-queue policies",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `// Block (backpressure): caller waits, but respects cancellation.
func (q *Queue) Submit(ctx context.Context, j Job) error {
	select {
	case q.jobs <- j:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

// Reject (load shedding): fail fast so the client can back off.
func (q *Queue) TrySubmit(j Job) error {
	select {
	case q.jobs <- j:
		return nil
	default:
		return ErrQueueFull // HTTP handler maps this to 429/503 + Retry-After
	}
}`,
          },
          {
            type: "table",
            head: ["Tool", "Use for"],
            rows: [
              ["`make(chan struct{}, n)`", "Simple counting semaphore"],
              ["`errgroup.Group.SetLimit(n)`", "Bounded fan-out with first-error + cancellation"],
              ["`semaphore.Weighted` (x/sync)", "Weighted permits (e.g. a big job takes 4 slots), context-aware Acquire"],
              ["Worker pool + buffered jobs chan", "Long-lived workers and a bounded queue"],
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
              { title: "Block", points: ["No work lost", "Latency grows; callers may time out anyway", "Propagates pressure upstream (good)"] },
              { title: "Drop / reject", points: ["Protects latency for accepted work", "Work lost or retried", "Needs client retry with backoff + jitter"] },
              { title: "Huge buffer", points: ["Absorbs short bursts", "Hides overload until OOM", "Queued items may be stale by the time they're processed"] },
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
              "`go handle(req)` for every incoming message from a queue with no limit.",
              "Unbounded in-memory slices used as queues.",
              "Concurrency limit higher than the downstream DB pool — goroutines just queue inside the driver.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Backpressure means a slow consumer slows producers instead of letting work pile up. In Go, bounded channels give it naturally: a full buffered channel blocks the sender. Bound concurrency with a buffered-channel semaphore, worker pools, errgroup.SetLimit or semaphore.Weighted, and decide the overflow policy explicitly: block with a context timeout, or shed load with a non-blocking select and return 429/503. Unbounded goroutines or queues just convert overload into memory exhaustion.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Bound both in-flight work and queued work.",
              "Acquire before `go` to throttle the producer itself.",
              "Overflow policy: block (with ctx), drop, or reject.",
              "Size limits from downstream capacity.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Backpressure", definition: "Feedback from a slow stage that slows down upstream producers." },
      { term: "Load shedding", definition: "Deliberately rejecting work under overload to protect the rest." },
      { term: "Weighted semaphore", definition: "A semaphore where each acquire can take a variable number of permits." },
    ],
    followUps: [
      { q: "Where does backpressure end up in an HTTP server?", a: "Blocked handler goroutines → TCP accept/receive buffers fill → clients see slow responses or timeouts. Explicit rejection (429) is often kinder." },
      { q: "How do you pick the concurrency limit?", a: "From the bottleneck's capacity (DB pool, API quota), then load-test: increase until throughput plateaus and latency rises." },
    ],
    quiz: [
      {
        id: "bp-q1",
        prompt: "What does `select { case ch <- j: default: return ErrFull }` implement?",
        options: ["Backpressure by blocking", "Load shedding", "A deadlock", "A semaphore release"],
        answer: 1,
        explanation: "When the queue is full, it rejects immediately.",
      },
      {
        id: "bp-q2",
        prompt: "Acquiring a semaphore slot before the `go` statement (vs inside the goroutine) additionally bounds…",
        options: ["Nothing", "The number of goroutines that exist", "GOMAXPROCS", "Channel capacity"],
        answer: 1,
        explanation: "The producer loop blocks, so goroutines aren't created ahead of capacity.",
      },
    ],
    questions: ["go/go-22"],
  },

  // ───────────────────────────────────────────────────────── puzzles
  {
    slug: "puzzles",
    track: "go",
    title: "Concurrency puzzles: predict the output, spot the bug",
    summary:
      "Twelve original Go concurrency puzzles — output prediction and bug spotting — covering channels, select, defer, WaitGroup, mutex copies, map races and the Go 1.22 loop variable. Every program was run on Go 1.26; answers explain the rule behind them.",
    level: "intermediate",
    frequency: "high",
    minutes: 40,
    kinds: ["quiz", "coding"],
    status: "authored",
    prerequisites: ["go/channels", "go/channel-close-range", "go/select", "go/defer", "go/waitgroup", "go/mutex"],
    related: ["go/race-deadlock-livelock", "go/goroutine-leaks", "go/sync-once"],
    tags: ["puzzles", "output prediction", "bug spotting", "interview practice"],
    sources: [S.spec, S.memModel, S.pgl, N.puzzles],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Practise predicting exact output — or \"fatal error\" — before running code.",
              "Name the rule behind each answer (that's what interviewers listen for).",
              "Distinguish deterministic output from \"order may vary\".",
            ],
          },
          {
            type: "callout",
            tone: "tip",
            title: "How to use this page",
            text: "Cover the answer callout, write down your prediction, then read it. All programs are `package main` with the obvious imports (`fmt`, `sync`, `time`) and a module targeting Go 1.22 or later.",
          },
        ],
      },
      {
        id: "examples",
        title: "Part 1 — predict the output",
        blocks: [
          { type: "p", text: "**Puzzle 1 — select with a full buffer.**" },
          {
            type: "code",
            lang: "go",
            code: `func main() {
	ch := make(chan int, 1)
	ch <- 1
	select {
	case ch <- 2:
		fmt.Println("sent 2")
	default:
		fmt.Println("default")
	}
	fmt.Println(<-ch)
}`,
          },
          { type: "callout", tone: "tip", title: "Answer", text: "`default` then `1`. The buffer (cap 1) is full, so the send case isn't ready and `default` runs. The value 2 was never sent." },

          { type: "p", text: "**Puzzle 2 — len of a closed channel.**" },
          {
            type: "code",
            lang: "go",
            code: `func main() {
	ch := make(chan int, 3)
	ch <- 1
	ch <- 2
	close(ch)
	fmt.Println(len(ch))
	for v := range ch {
		fmt.Print(v, " ")
	}
	fmt.Println(len(ch))
	v, ok := <-ch
	fmt.Println(v, ok)
}`,
          },
          { type: "callout", tone: "tip", title: "Answer", text: "Three lines: `2`, then `1 2 0`, then `0 false`. Closing doesn't discard buffered values (len is still 2); range drains them, after which len is 0 and receives return the zero value with ok=false." },

          { type: "p", text: "**Puzzle 3 — defers, closures and a named result.**" },
          {
            type: "code",
            lang: "go",
            code: `func f() (out []int) {
	for i := 0; i < 3; i++ {
		defer func() { out = append(out, i) }()
	}
	return []int{9}
}

func main() {
	fmt.Println(f())
}`,
          },
          { type: "callout", tone: "tip", title: "Answer", text: "`[9 2 1 0]`. `return []int{9}` assigns out first; then defers run LIFO, each appending its own per-iteration `i` (Go 1.22+). With Go ≤ 1.21 semantics all closures share one `i` (value 3 after the loop) and it prints `[9 3 3 3]`." },

          { type: "p", text: "**Puzzle 4 — receiving from a nil channel.**" },
          {
            type: "code",
            lang: "go",
            code: `func main() {
	var ch chan int
	select {
	case v := <-ch:
		fmt.Println("got", v)
	case <-time.After(10 * time.Millisecond):
		fmt.Println("timeout")
	}
}`,
          },
          { type: "callout", tone: "tip", title: "Answer", text: "`timeout`. A nil channel is never ready, so that case is effectively disabled — no panic, no zero value." },

          { type: "p", text: "**Puzzle 5 — break inside select.**" },
          {
            type: "code",
            lang: "go",
            code: `func main() {
	ch := make(chan int)
	close(ch)
	n := 0
	for n < 3 {
		select {
		case <-ch:
			n++
			break // what does this break?
		}
		fmt.Println("after select", n)
	}
}`,
          },
          { type: "callout", tone: "tip", title: "Answer", text: "`after select 1`, `after select 2`, `after select 3`. `break` exits the innermost `for`, `switch` or `select` — here the select. A closed channel is always ready, so each iteration receives immediately. To leave the loop, use a labeled break or return." },

          { type: "p", text: "**Puzzle 6 — go-statement arguments vs captured variables.**" },
          {
            type: "code",
            lang: "go",
            code: `func main() {
	x := 1
	start := make(chan struct{})
	done := make(chan struct{})
	go func(v int) {
		<-start
		fmt.Println("arg:", v, "captured:", x)
		close(done)
	}(x)
	x = 2
	close(start)
	<-done
}`,
          },
          { type: "callout", tone: "tip", title: "Answer", text: "`arg: 1 captured: 2` — deterministic and race-free. The argument is evaluated at the `go` statement (1). The closure reads `x` after `<-start`, and `x = 2` happens-before `close(start)`, which happens-before the receive completes." },

          { type: "p", text: "**Puzzle 7 — mutex in a value receiver.**" },
          {
            type: "code",
            lang: "go",
            code: `type Counter struct {
	mu sync.Mutex
	n  int
}

func (c Counter) Inc() {
	c.mu.Lock()
	c.n++
	c.mu.Unlock()
}

func main() {
	var c Counter
	for range 100 {
		c.Inc()
	}
	fmt.Println(c.n)
}`,
          },
          { type: "callout", tone: "tip", title: "Answer", text: "`0` — even with no goroutines. The value receiver copies the whole struct (mutex included) on each call and increments the copy. `go vet` reports \"passes lock by value\". Use `func (c *Counter) Inc()`." },
        ],
      },
      {
        id: "practice",
        title: "Part 2 — what goes wrong?",
        blocks: [
          { type: "p", text: "**Puzzle 8 — send before go.**" },
          {
            type: "code",
            lang: "go",
            code: `func main() {
	ch := make(chan int)
	ch <- 1
	go func() { fmt.Println(<-ch) }()
}`,
          },
          { type: "callout", tone: "tip", title: "Answer", text: "`fatal error: all goroutines are asleep - deadlock!` with `goroutine 1 [chan send]`. main blocks on the unbuffered send *before* the receiver goroutine is ever started. Swap the two statements (and wait for the goroutine) to fix it." },

          { type: "p", text: "**Puzzle 9 — ranging over a channel nobody closes.**" },
          {
            type: "code",
            lang: "go",
            code: `func main() {
	ch := make(chan int)
	for i := range 3 {
		go func() { ch <- i }()
	}
	for v := range ch {
		fmt.Println(v)
	}
}`,
          },
          { type: "callout", tone: "tip", title: "Answer", text: "Prints 0, 1, 2 in some order, then `fatal error: all goroutines are asleep - deadlock!` with `goroutine 1 [chan receive]`. range waits for a close that never comes. Fix: a WaitGroup for the senders plus a closer goroutine (`wg.Wait(); close(ch)`), or receive exactly 3 times." },

          { type: "p", text: "**Puzzle 10 — once.Do and a small buffer.**" },
          {
            type: "code",
            lang: "go",
            code: `func main() {
	var once sync.Once
	var wg sync.WaitGroup
	results := make(chan string, 3)
	for _, name := range []string{"a", "b", "c"} {
		wg.Add(1)
		go func() {
			defer wg.Done()
			once.Do(func() { results <- "init by " + name })
			results <- "ran " + name
		}()
	}
	wg.Wait()
	close(results)
	n := 0
	for range results {
		n++
	}
	fmt.Println(n)
}`,
          },
          { type: "callout", tone: "tip", title: "Answer", text: "Deadlock: `fatal error: all goroutines are asleep - deadlock!` (main in `WaitGroup.Wait`). There are **four** sends (one init + three \"ran\") into a buffer of three, and nobody receives until after `wg.Wait()`. The fourth sender blocks, so Wait never returns. Fix: buffer 4, or drain concurrently with a closer goroutine." },

          { type: "p", text: "**Puzzle 11 — concurrent map writes.**" },
          {
            type: "code",
            lang: "go",
            code: `func main() {
	m := map[int]int{}
	var wg sync.WaitGroup
	for i := range 100 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			m[i] = i
		}()
	}
	wg.Wait()
	fmt.Println(len(m))
}`,
          },
          { type: "callout", tone: "tip", title: "Answer", text: "Usually `fatal error: concurrent map writes` — a fatal error that `recover` cannot catch. Detection is best-effort, so occasionally it prints `100`, but the program is racy either way (`-race` always flags it). Protect the map with a mutex, or use `sync.Map` for its niche cases." },

          { type: "p", text: "**Puzzle 12 — the classic loop capture, two Go versions.**" },
          {
            type: "code",
            lang: "go",
            code: `func main() {
	var wg sync.WaitGroup
	for i := 0; i < 3; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			fmt.Print(i)
		}()
	}
	wg.Wait()
	fmt.Println()
}`,
          },
          { type: "callout", tone: "tip", title: "Answer", text: "Module with `go 1.22`+ in go.mod: some permutation of `012` (each iteration has its own `i`). Module with `go 1.21` or older: typically `333`, because all closures share one `i` that the loop has already advanced to 3 — and it is a data race. The fix before 1.22 was `i := i` inside the loop or passing `i` as an argument." },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Full buffer + default → default; nil channel → never ready; closed channel → always ready.",
              "`break` in select leaves the select.",
              "Arguments are evaluated at go/defer time; closures read variables later.",
              "Count your sends against buffer capacity before calling Wait.",
              "Unclosed channels hang `range`; maps are not goroutine-safe.",
              "Loop-variable semantics depend on the module's Go version (1.22).",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Output prediction", definition: "Interview format: state exactly what a program prints, or how it fails." },
      { term: "Labeled break", definition: "`break Label` exits the statement carrying that label, e.g. an outer for loop." },
      { term: "Fatal error", definition: "A runtime failure (deadlock, concurrent map writes) that cannot be recovered, unlike a panic." },
    ],
    followUps: [
      { q: "Which of these puzzles would `go vet` catch?", a: "Puzzle 7 (copylocks). Go 1.22 also made the vet loopclosure check unnecessary for modules on the new semantics." },
      { q: "Which would `go run -race` flag?", a: "Puzzle 11 (map writes) and Puzzle 12 under pre-1.22 semantics. Puzzle 6 is deliberately race-free." },
    ],
    quiz: [
      {
        id: "puz-q1",
        prompt: "What prints?",
        code: { lang: "go", code: `ch := make(chan int, 2)
ch <- 1
close(ch)
a, ok1 := <-ch
b, ok2 := <-ch
fmt.Println(a, ok1, b, ok2)` },
        options: ["1 true 0 false", "1 false 0 false", "panic", "1 true 1 true"],
        answer: 0,
        explanation: "Buffered values are delivered after close with ok=true; then zero value and false.",
      },
      {
        id: "puz-q2",
        prompt: "What prints?",
        code: { lang: "go", code: `x := 0
defer fmt.Println("deferred:", x)
x = 5
fmt.Println("body:", x)` },
        options: ["body: 5 / deferred: 5", "body: 5 / deferred: 0", "deferred: 0 / body: 5", "body: 0 / deferred: 5"],
        answer: 1,
        explanation: "The deferred call's arguments are evaluated at the defer statement (x=0) and it runs after the body.",
      },
      {
        id: "puz-q3",
        prompt: "What happens?",
        code: { lang: "go", code: `var mu sync.Mutex
mu.Lock()
mu.Lock()
fmt.Println("locked twice")` },
        options: ["Prints \"locked twice\"", "panic: recursive lock", "fatal error: all goroutines are asleep - deadlock!", "Compile error"],
        answer: 2,
        explanation: "Go mutexes aren't reentrant; main blocks forever and it's the only goroutine.",
      },
      {
        id: "puz-q4",
        prompt: "With `for v := range ch` in main and 3 sender goroutines that never close ch, what happens after the 3 values are printed?",
        options: ["The loop ends", "Fatal deadlock error", "Panic: range over open channel", "It returns zero values forever"],
        answer: 1,
        explanation: "range keeps waiting; with every goroutine blocked, the runtime reports a deadlock.",
      },
    ],
    questions: ["go/go-09", "go/go-19", "go/go-24"],
  },

  // ───────────────────────────────────────────────────────── graceful-shutdown
  {
    slug: "graceful-shutdown",
    track: "go",
    title: "Graceful shutdown",
    summary:
      "On SIGTERM, stop accepting new work, let in-flight requests and jobs finish within a deadline, then release resources. In Go: signal.NotifyContext, http.Server.Shutdown and a context-driven worker drain.",
    level: "intermediate",
    frequency: "high",
    minutes: 25,
    kinds: ["coding", "theory"],
    status: "authored",
    prerequisites: ["go/context", "go/http-server", "go/waitgroup"],
    related: ["go/worker-pool", "cloud/kubernetes", "system-design/health-checks-heartbeats", "system-design/deployment-strategies"],
    tags: ["graceful shutdown", "SIGTERM", "signal.NotifyContext", "http.Server.Shutdown", "Kubernetes"],
    sources: [S.signal, S.httpPkg, S.contextPkg, { label: "Kubernetes: Pod termination", url: "https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination", kind: "docs" }, S.pgl],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Turn OS signals into context cancellation with `signal.NotifyContext`.",
              "Use `http.Server.Shutdown` with a timeout and handle `http.ErrServerClosed`.",
              "Order shutdown steps: readiness → stop intake → drain → close resources.",
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "Every deploy, autoscale-down and node drain kills processes. Kubernetes sends **SIGTERM**, waits `terminationGracePeriodSeconds` (default 30 s), then sends **SIGKILL**. A process that dies instantly on SIGTERM drops in-flight requests (users see 502s) and abandons half-finished jobs.",
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	// ctx is cancelled on the first SIGINT (Ctrl-C) or SIGTERM (Kubernetes, systemd).
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	mux := http.NewServeMux()
	mux.HandleFunc("GET /slow", func(w http.ResponseWriter, r *http.Request) {
		select {
		case <-time.After(2 * time.Second): // in-flight work that should finish
			w.Write([]byte("done\\n"))
		case <-r.Context().Done(): // client went away
		}
	})

	srv := &http.Server{
		Addr:              ":8080",
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		slog.Info("listening", "addr", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			slog.Error("server failed", "err", err)
			os.Exit(1)
		}
	}()

	<-ctx.Done() // block until a signal arrives
	stop()       // restore default behaviour: a second Ctrl-C kills immediately
	slog.Info("shutting down")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	// Stop accepting, close idle conns, wait for active requests (up to 10s).
	if err := srv.Shutdown(shutdownCtx); err != nil {
		slog.Error("forced shutdown", "err", err)
	}
	// Then: flush logs/metrics, close DB pools, stop workers...
	slog.Info("bye")
}`,
            caption: "Run, `curl localhost:8080/slow`, then send SIGTERM 0.3 s later. Timestamps vary; the curl still receives \"done\".",
            output: `2026/10/05 14:05:36 INFO listening addr=:8080
2026/10/05 14:05:36 INFO shutting down
2026/10/05 14:05:39 INFO bye`,
          },
          {
            type: "steps",
            steps: [
              { title: "Signal → ctx", detail: "NotifyContext cancels ctx on the first listed signal. Calling `stop()` unregisters, so a second Ctrl-C uses the default (kill)." },
              { title: "Shutdown", detail: "Closes listeners immediately (new connections are refused), closes idle keep-alive connections, and waits for active ones to become idle." },
              { title: "ListenAndServe returns", detail: "Immediately with `http.ErrServerClosed` — that's expected, not a failure. Note main must not exit until Shutdown returns." },
              { title: "Deadline", detail: "If requests outlast `shutdownCtx`, Shutdown returns the context error; you can then `srv.Close()` to force-close." },
            ],
          },
          {
            type: "callout",
            tone: "warning",
            title: "Shutdown doesn't cancel request contexts",
            text: "`Shutdown` waits; it does not cancel `r.Context()` of in-flight requests (that's why the 2 s request completed). Long-lived connections (WebSockets, hijacked conns) aren't tracked at all — register cleanup with `srv.RegisterOnShutdown`. If you want handlers to stop early, pass a base context via `Server.BaseContext` that you cancel yourself.",
          },
        ],
      },
      {
        id: "internals",
        title: "Order of operations in production",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Fail readiness", detail: "Flip `/readyz` to 503 so the load balancer stops routing new traffic. Optionally sleep a few seconds: endpoint removal propagates asynchronously in Kubernetes." },
              { title: "Stop intake", detail: "`srv.Shutdown`, stop consuming from queues (cancel consumer context)." },
              { title: "Drain", detail: "Workers finish current jobs; producer closes jobs channel; `wg.Wait()` with a deadline." },
              { title: "Release", detail: "Flush logs/traces/metrics, close DB pools, commit offsets." },
              { title: "Exit before SIGKILL", detail: "Total budget < terminationGracePeriodSeconds." },
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
              "Treating `http.ErrServerClosed` as fatal and calling `log.Fatal` — skips the rest of shutdown.",
              "`main` returning right after calling Shutdown in a goroutine — the wait never happens.",
              "Using `log.Fatal`/`os.Exit` deep in code — deferred cleanups don't run.",
              "Running as PID 1 in a container via a shell wrapper (`sh -c`) that doesn't forward SIGTERM — use exec form or a tiny init.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Use `signal.NotifyContext` for SIGINT/SIGTERM, run the server in a goroutine, block on ctx.Done(), then call `srv.Shutdown` with a timeout context: it stops accepting connections, closes idle ones and waits for active requests. Ignore `http.ErrServerClosed` from ListenAndServe. In Kubernetes, fail readiness first, drain workers and queues, flush telemetry and close pools, all within the termination grace period before SIGKILL.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "SIGTERM → NotifyContext → Shutdown(ctx with timeout).",
              "ErrServerClosed is normal.",
              "Readiness off → stop intake → drain → release → exit.",
              "Budget < grace period (default 30 s).",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "SIGTERM", definition: "Polite termination signal; processes should clean up and exit." },
      { term: "SIGKILL", definition: "Uncatchable kill signal sent after the grace period." },
      { term: "signal.NotifyContext", definition: "Returns a context cancelled when one of the given signals arrives (Go 1.16)." },
      { term: "http.Server.Shutdown", definition: "Gracefully stops a server: closes listeners and idle conns, waits for active requests." },
      { term: "Readiness probe", definition: "Health check telling the load balancer whether to send traffic." },
    ],
    followUps: [
      { q: "What's the difference between Shutdown and Close?", a: "Shutdown is graceful (stop accepting, wait for active requests); Close immediately closes all listeners and connections." },
      { q: "How do you drain a worker pool on shutdown?", a: "Cancel the producer's context so it stops and closes the jobs channel; workers finish in-flight jobs and exit their range; wait on the WaitGroup with a timeout." },
    ],
    quiz: [
      {
        id: "gs-q1",
        prompt: "What does `srv.ListenAndServe()` return after `srv.Shutdown` is called?",
        options: ["nil", "http.ErrServerClosed", "context.Canceled", "It never returns"],
        answer: 1,
        explanation: "It returns ErrServerClosed immediately; treat it as a normal exit.",
      },
      {
        id: "gs-q2",
        prompt: "Kubernetes sends SIGTERM. How long before SIGKILL by default?",
        options: ["5 s", "10 s", "30 s", "Never"],
        answer: 2,
        explanation: "terminationGracePeriodSeconds defaults to 30.",
      },
    ],
    questions: ["go/go-23"],
  },

  // ───────────────────────────────────────────────────────── error-wrapping
  {
    slug: "error-wrapping",
    track: "go",
    title: "Error wrapping: %w, errors.Is, errors.As, errors.Join",
    summary:
      "Add context to errors as they bubble up without losing the original: wrap with `fmt.Errorf(\"...: %w\", err)`, test identity with `errors.Is`, extract typed errors with `errors.As`, combine several with `errors.Join` (Go 1.20).",
    level: "intermediate",
    frequency: "high",
    minutes: 20,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/errors", "go/interfaces"],
    related: ["go/defer", "go/structured-logging", "go/interface-internals-typed-nil"],
    tags: ["errors", "wrapping", "%w", "errors.Is", "errors.As", "errors.Join", "sentinel errors"],
    sources: [S.errorsBlog, S.errorsPkg, S.pgl],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Wrap errors with context using `%w`.",
              "Choose between sentinel errors and custom error types.",
              "Use `errors.Is`, `errors.As` (and `errors.AsType` on Go 1.26+).",
              "Know when *not* to wrap.",
            ],
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "list",
            items: [
              "**Wrapping** (Go 1.13): an error that contains another, exposed by an `Unwrap() error` method. `fmt.Errorf` with `%w` creates one. Since Go 1.20 an error may wrap several (`Unwrap() []error`; multiple `%w` verbs; `errors.Join`), forming a tree.",
              "`errors.Is(err, target)`: is any error in the tree equal to target (or does one's `Is` method say so)?",
              "`errors.As(err, &target)`: find the first error in the tree assignable to target's type and set target.",
              "`%v` formats the message but does **not** wrap — the chain is cut.",
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"errors"
	"fmt"
	"io/fs"
	"os"
)

var ErrNotFound = errors.New("not found") // sentinel error

type ValidationError struct { // custom error type carrying data
	Field string
}

func (e *ValidationError) Error() string { return "invalid " + e.Field }

func findUser(id int) error {
	if id == 0 {
		return &ValidationError{Field: "id"}
	}
	return fmt.Errorf("findUser %d: %w", id, ErrNotFound) // wrap with context
}

func handler(id int) error {
	if err := findUser(id); err != nil {
		return fmt.Errorf("GET /users: %w", err) // wrap again
	}
	return nil
}

func main() {
	err := handler(7)
	fmt.Println(err)
	fmt.Println(errors.Is(err, ErrNotFound)) // walks the chain
	fmt.Println(err == ErrNotFound)          // compares only the outer error

	err = handler(0)
	var ve *ValidationError
	if errors.As(err, &ve) { // finds the first *ValidationError in the chain
		fmt.Println("bad field:", ve.Field)
	}

	_, err = os.Open("/no/such/file")
	fmt.Println(errors.Is(err, fs.ErrNotExist))

	joined := errors.Join(ErrNotFound, &ValidationError{Field: "email"}) // Go 1.20
	fmt.Println(errors.Is(joined, ErrNotFound))
	fmt.Println(joined)

	noWrap := fmt.Errorf("lookup: %v", ErrNotFound) // %v formats but does NOT wrap
	fmt.Println(errors.Is(noWrap, ErrNotFound))
}`,
            output: `GET /users: findUser 7: not found
true
false
bad field: id
true
true
not found
invalid email
false`,
          },
          {
            type: "p",
            text: "Go 1.26 added a generic `errors.AsType[E error](err) (E, bool)`, which avoids declaring the target variable: `if ve, ok := errors.AsType[*ValidationError](err); ok { ... }`. Use `errors.As` if you must support older Go versions.",
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Sentinel (`var ErrX = errors.New`)", points: ["Cheap identity check with errors.Is", "No extra data", "Becomes part of your public API"] },
              { title: "Custom type", points: ["Carries fields (status code, field name)", "Checked with errors.As", "Also public API once exported"] },
              { title: "Opaque (`%v` / new error)", points: ["Callers can't depend on internals", "Use at boundaries (e.g. hide a DB driver error from API clients)", "Loses programmatic inspection"] },
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
              "Comparing wrapped errors with `==` — use errors.Is.",
              "Passing a non-pointer to errors.As (it panics: target must be a non-nil pointer).",
              "Messages like \"failed to …: failed to …: error …\" — add *what you were doing*, not \"failed\".",
              "Logging an error *and* returning it at every level — log once, at the top.",
              "Returning a typed nil pointer as `error` — the interface is non-nil (see interface-internals-typed-nil).",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Wrap errors with `fmt.Errorf(\"context: %w\", err)` to add context while keeping the original in an Unwrap chain. `errors.Is` checks whether any error in the chain matches a sentinel like `fs.ErrNotExist`; `errors.As` finds an error of a specific type so you can read its fields. Go 1.20 added multi-error wrapping with `errors.Join` and multiple %w. `%v` doesn't wrap, which is how you deliberately hide implementation errors at API boundaries.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "%w wraps; %v doesn't.",
              "Is for identity, As for type (AsType in 1.26+).",
              "Join (1.20) for multiple errors.",
              "Wrapped errors are API — wrap deliberately.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Sentinel error", definition: "A package-level error value compared by identity, e.g. io.EOF." },
      { term: "Error wrapping", definition: "Embedding one error inside another, retrievable via Unwrap." },
      { term: "errors.Join", definition: "Go 1.20 function combining errors into one that wraps all of them." },
    ],
    followUps: [
      { q: "How does errors.Is work with a custom type?", a: "It compares with == at each step and also calls an `Is(target error) bool` method if the error defines one, letting types define equivalence." },
      { q: "Why does `errors.Is(err, io.EOF)` matter for readers?", a: "Wrapped EOFs would fail `err == io.EOF`; but io.Reader implementations must return io.EOF unwrapped, so callers can still use ==." },
    ],
    quiz: [
      {
        id: "ew-q1",
        prompt: "`err := fmt.Errorf(\"read: %v\", io.EOF)`. What's `errors.Is(err, io.EOF)`?",
        options: ["true", "false", "panics", "compile error"],
        answer: 1,
        explanation: "%v only formats; there's nothing to unwrap.",
      },
      {
        id: "ew-q2",
        prompt: "Which extracts a `*net.OpError` from a wrapped error?",
        options: ["errors.Is", "errors.As", "errors.Unwrap once", "type switch on err"],
        answer: 1,
        explanation: "errors.As walks the chain looking for a matching type; a type switch only checks the outer error.",
      },
    ],
    questions: ["go/go-21"],
  },

  // ───────────────────────────────────────────────────────── race-detector
  {
    slug: "race-detector",
    track: "go",
    title: "The race detector (-race)",
    summary:
      "`go test -race` / `go run -race` instrument every memory access and report data races that actually happen during the run, with both stacks. Run it in CI; it only finds races your tests exercise.",
    level: "intermediate",
    frequency: "high",
    minutes: 15,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/mutex", "go/atomics"],
    related: ["go/race-deadlock-livelock", "go/benchmarking-testing"],
    tags: ["race detector", "ThreadSanitizer", "-race", "CI", "happens-before"],
    sources: [S.race, S.memModel, S.pgl],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Run the race detector and read its report.",
              "Explain how it works (happens-before tracking) and its limits.",
              "Know its cost and where it belongs (tests/CI, canaries).",
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          {
            type: "code",
            lang: "bash",
            code: `go test -race ./...
go run -race ./cmd/server
go build -race -o server-race ./cmd/server`,
          },
          {
            type: "p",
            text: "On the racy counter from the mutex lesson (`count++` in 1000 goroutines), the report names the two conflicting accesses and where each goroutine was created:",
          },
          {
            type: "code",
            lang: "text",
            code: `==================
WARNING: DATA RACE
Read at 0x00c00011c038 by goroutine 8:
  main.main.func1()
      /app/racy/main.go:15 +0x7b

Previous write at 0x00c00011c038 by goroutine 11:
  main.main.func1()
      /app/racy/main.go:15 +0x8d

Goroutine 8 (running) created at:
  main.main()
      /app/racy/main.go:13 +0x7d

Goroutine 11 (finished) created at:
  main.main()
      /app/racy/main.go:13 +0x7d
==================`,
            caption: "Real output (paths shortened). The program exits with status 66 if a race was found.",
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "list",
            items: [
              "The compiler instruments every memory read/write; the runtime links in ThreadSanitizer (TSan, a C/C++ library from LLVM).",
              "TSan keeps shadow memory recording recent accesses per 8-byte word, with vector clocks per goroutine. Sync operations (channel ops, Mutex, WaitGroup, atomics) update the clocks to model happens-before.",
              "Two accesses to the same word, at least one a write, with neither happening-before the other → report.",
              "**No false positives** in practice: a report is a real race. **False negatives** are common: races on paths not executed, or whose timing didn't overlap within TSan's history window.",
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Cost",
            text: "Per the Go docs, memory usage may increase 5–10× and execution time 2–20×. It's supported only on certain 64-bit OS/arch combinations — check the docs for your platform. Tunable with `GORACE` (e.g. `GORACE=\"halt_on_error=1 log_path=/tmp/race\"`).",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Running `-race` once locally and concluding the code is race-free.",
              "Tests that don't run things concurrently — the detector can only see what executes. Write tests that hammer shared state from several goroutines.",
              "\"Fixing\" a report by adding `time.Sleep` — that hides the race, it doesn't add a happens-before edge.",
              "Treating a clean run as proof there are no *race conditions* (logic-level, e.g. check-then-act).",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "The `-race` flag builds the program with ThreadSanitizer instrumentation: every memory access is recorded with vector clocks, and synchronization operations establish happens-before. If two accesses to the same location, one a write, aren't ordered, it prints both stacks. It has essentially no false positives but only finds races that occur during that run, costs 2–20× CPU and 5–10× memory, so we run `go test -race ./...` in CI and sometimes a race-enabled canary.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "`-race` on test/run/build.",
              "Dynamic detection: only executed paths.",
              "Real reports, but absence ≠ proof.",
              "CI always; production rarely (cost).",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "ThreadSanitizer (TSan)", definition: "Dynamic data-race detector from LLVM used by Go's -race." },
      { term: "Vector clock", definition: "Per-thread logical timestamps used to decide whether events are ordered by happens-before." },
      { term: "Shadow memory", definition: "Extra memory where the detector stores metadata about each application word." },
    ],
    followUps: [
      { q: "Can the race detector find deadlocks?", a: "No. It finds data races only." },
      { q: "Why might a race appear only under -race in CI but never locally?", a: "Different timing, more cores, or tests running in parallel exercise interleavings your local runs don't." },
    ],
    quiz: [
      {
        id: "race-q1",
        prompt: "A `-race` run of your tests is clean. What can you conclude?",
        options: ["No data races exist", "No data races occurred on the executed paths during that run", "No race conditions exist", "No deadlocks exist"],
        answer: 1,
        explanation: "It's a dynamic tool: it reports only what it observed.",
      },
      {
        id: "race-q2",
        prompt: "Which of these does the race detector treat as synchronization?",
        options: ["time.Sleep", "A channel send/receive", "fmt.Println", "runtime.Gosched"],
        answer: 1,
        explanation: "Channels, mutexes, WaitGroups and atomics create happens-before edges; sleeping doesn't.",
      },
    ],
    questions: ["go/go-08"],
  },

  // ───────────────────────────────────────────────────────── profiling-pprof
  {
    slug: "profiling-pprof",
    track: "go",
    title: "Profiling with pprof",
    summary:
      "pprof samples where your program spends CPU, allocates memory, blocks and waits on locks, and where its goroutines are parked. Expose it with net/http/pprof (on a private port), capture with `go tool pprof`, read top/list/flame graphs.",
    level: "advanced",
    frequency: "medium",
    minutes: 25,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/goroutines", "go/garbage-collection"],
    related: ["go/benchmarking-testing", "go/goroutine-leaks", "go/escape-analysis", "go/gmp-scheduler"],
    tags: ["pprof", "CPU profile", "heap profile", "goroutine profile", "flame graph", "PGO"],
    sources: [S.pprof, S.diagnostics, { label: "Go blog: Profiling Go Programs", url: "https://go.dev/blog/pprof", kind: "docs" }, { label: "Profile-guided optimization", url: "https://go.dev/doc/pgo", kind: "docs" }],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Expose and capture each profile type.",
              "Read `top`, `list` and the flame-graph view.",
              "Pick the right profile for the symptom (CPU, memory, latency, leaks).",
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"log"
	"net/http"
	_ "net/http/pprof" // registers /debug/pprof/* on http.DefaultServeMux
	"runtime"
)

func main() {
	runtime.SetMutexProfileFraction(5)     // sample 1 in 5 mutex contention events
	runtime.SetBlockProfileRate(1_000_000) // ~1 sample per ms spent blocked

	// Debug server on localhost only — never expose pprof publicly.
	go func() {
		log.Println(http.ListenAndServe("localhost:6060", nil))
	}()

	// Application server on its own mux, so pprof isn't on the public port.
	app := http.NewServeMux()
	app.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("hello\\n"))
	})
	log.Fatal(http.ListenAndServe(":8080", app))
}`,
          },
          {
            type: "code",
            lang: "bash",
            code: `# 30 s CPU profile, then open an interactive web UI with a flame graph
go tool pprof -http=:8081 'http://localhost:6060/debug/pprof/profile?seconds=30'

# Live heap (inuse_space by default); -sample_index=alloc_space for total allocations
go tool pprof http://localhost:6060/debug/pprof/heap

# Where are all goroutines parked? (text, grouped by stack)
curl 'http://localhost:6060/debug/pprof/goroutine?debug=1'

# From tests/benchmarks
go test -bench . -cpuprofile cpu.out -memprofile mem.out && go tool pprof cpu.out`,
          },
        ],
      },
      {
        id: "definition",
        title: "Profile types",
        blocks: [
          {
            type: "table",
            head: ["Endpoint", "Shows", "Use when"],
            rows: [
              ["`/debug/pprof/profile?seconds=N`", "CPU samples (100 Hz by default)", "High CPU, slow handlers"],
              ["`/debug/pprof/heap`", "Live heap by allocation site (sampled)", "Memory growth, leaks"],
              ["`/debug/pprof/allocs`", "All allocations since start", "GC pressure, allocation-heavy code"],
              ["`/debug/pprof/goroutine`", "Stacks of all goroutines", "Goroutine leaks, deadlocks"],
              ["`/debug/pprof/block`", "Time blocked on channels/selects/cond (needs SetBlockProfileRate)", "Latency without CPU usage"],
              ["`/debug/pprof/mutex`", "Lock contention (needs SetMutexProfileFraction)", "Throughput capped by a lock"],
              ["`/debug/pprof/threadcreate`", "Stacks that created OS threads", "Thread explosions (blocking syscalls, cgo)"],
              ["`/debug/pprof/trace?seconds=N`", "Execution trace for `go tool trace`", "Scheduler latency, GC pauses, per-goroutine timelines"],
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "list",
            items: [
              "CPU profiling uses a timer signal (SIGPROF) to interrupt threads ~100×/s and record the stack — sampling, so cheap enough for production on demand.",
              "Heap profiling samples about one allocation per 512 KB allocated (`runtime.MemProfileRate`) and scales the numbers up.",
              "**flat** = time in the function itself; **cum** = including callees. `list FuncName` shows per-line costs.",
              "**PGO** (Go 1.21 GA): put a representative CPU profile at `default.pgo` in the main package and `go build` uses it to guide inlining and devirtualization — typically a few percent faster.",
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "Sampling rates and the 512 KB heap rate are runtime defaults that can change; profiles are statistical estimates, not exact counts.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Importing net/http/pprof in a service that serves `http.DefaultServeMux` publicly — leaks internals and enables DoS via long profiles.",
              "Reading a CPU profile to explain latency when the code is mostly *waiting* — use block/mutex profiles or a trace.",
              "Profiling a dev build under unrealistic load.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "pprof is Go's sampling profiler. Importing net/http/pprof exposes /debug/pprof endpoints: CPU profile, heap and allocs, goroutine stacks, block and mutex contention (once enabled), threadcreate and execution traces. I capture with `go tool pprof -http`, look at top by flat/cum and a flame graph, then `list` the hot function. CPU for burn, heap/allocs for memory and GC pressure, goroutine for leaks, block/mutex for latency where CPU is idle. Keep the endpoint on a private port.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Match profile to symptom.",
              "Sampling → safe-ish in production, statistical results.",
              "Private port for pprof.",
              "PGO reuses CPU profiles to speed builds' output.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "pprof", definition: "Go's profiling format and tool (`go tool pprof`)." },
      { term: "Flat vs cum", definition: "Cost in the function body alone vs including everything it calls." },
      { term: "Flame graph", definition: "Visualization of stacks where width is proportional to sampled cost." },
      { term: "PGO", definition: "Profile-guided optimization: the compiler uses a CPU profile to optimize hot paths." },
    ],
    followUps: [
      { q: "Memory keeps growing but heap profile inuse is flat. What else?", a: "Goroutine leaks (stacks aren't in the heap profile), cgo/off-heap memory, or the runtime not returning freed memory to the OS yet. Check goroutine count and runtime/metrics." },
      { q: "CPU is 10% but p99 latency is high. Which profile?", a: "Block and mutex profiles, or an execution trace to see scheduling delays and GC pauses." },
    ],
    quiz: [
      {
        id: "pprof-q1",
        prompt: "Which profile best finds a goroutine leak?",
        options: ["CPU", "heap", "goroutine", "threadcreate"],
        answer: 2,
        explanation: "It lists where every goroutine is parked.",
      },
      {
        id: "pprof-q2",
        prompt: "Why are block and mutex profiles empty by default?",
        options: ["They're deprecated", "Their sampling rates default to 0; you must enable them", "They require cgo", "Only available in tests"],
        answer: 1,
        explanation: "Call runtime.SetBlockProfileRate / SetMutexProfileFraction.",
      },
    ],
    questions: ["go/go-10", "go/go-18"],
  },

  // ───────────────────────────────────────────────────────── benchmarking-testing
  {
    slug: "benchmarking-testing",
    track: "go",
    title: "Testing and benchmarking",
    summary:
      "Go's `testing` package gives you table-driven tests, subtests, parallel tests, benchmarks with allocation reporting, fuzzing and examples — all run by `go test`. Measure with `-benchmem`, compare with benchstat, and know `b.Loop` (Go 1.24).",
    level: "intermediate",
    frequency: "medium",
    minutes: 25,
    kinds: ["coding", "theory"],
    status: "authored",
    prerequisites: ["go/functions", "go/slices-internals"],
    related: ["go/race-detector", "go/profiling-pprof", "go/escape-analysis"],
    tags: ["testing", "table-driven tests", "t.Parallel", "benchmark", "-benchmem", "b.Loop", "fuzzing"],
    sources: [S.testing, { label: "Add a test (Go tutorial)", url: "https://go.dev/doc/tutorial/add-a-test", kind: "docs" }, { label: "benchstat", url: "https://pkg.go.dev/golang.org/x/perf/cmd/benchstat", kind: "docs" }, { label: "Go fuzzing", url: "https://go.dev/doc/security/fuzz/", kind: "docs" }],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Write table-driven tests with subtests.",
              "Write benchmarks and read ns/op, B/op, allocs/op.",
              "Avoid common benchmarking mistakes; use b.Loop or b.ResetTimer.",
              "Know fuzzing and the -race/-count/-run flags.",
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `// sum.go
package bt

func Sum(s []int) int {
	t := 0
	for _, v := range s {
		t += v
	}
	return t
}

func Squares(n int) []int {
	var out []int // no preallocation: append grows repeatedly
	for i := range n {
		out = append(out, i*i)
	}
	return out
}

func SquaresPrealloc(n int) []int {
	out := make([]int, 0, n)
	for i := range n {
		out = append(out, i*i)
	}
	return out
}`,
          },
          {
            type: "code",
            lang: "go",
            code: `// sum_test.go
package bt

import "testing"

func TestSum(t *testing.T) {
	tests := []struct {
		name string
		in   []int
		want int
	}{
		{"empty", nil, 0},
		{"one", []int{5}, 5},
		{"negatives", []int{-2, 3, -1}, 0},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel() // subtests run concurrently (tc is per-iteration in Go 1.22+)
			if got := Sum(tc.in); got != tc.want {
				t.Errorf("Sum(%v) = %d, want %d", tc.in, got, tc.want)
			}
		})
	}
}

func BenchmarkSquares(b *testing.B) {
	for b.Loop() { // Go 1.24+: replaces for i := 0; i < b.N; i++
		Squares(1000)
	}
}

func BenchmarkSquaresPrealloc(b *testing.B) {
	for b.Loop() {
		SquaresPrealloc(1000)
	}
}`,
          },
          {
            type: "code",
            lang: "bash",
            code: `go test -run '^$' -bench . -benchmem`,
            caption: "Machine-dependent; one run on a 12-thread laptop:",
            output: `goos: linux
goarch: amd64
pkg: gox/bt
cpu: 12th Gen Intel(R) Core(TM) i5-12450H
BenchmarkSquares-12            	  275378	      5779 ns/op	   25208 B/op	      12 allocs/op
BenchmarkSquaresPrealloc-12    	 2688562	       420.8 ns/op	       0 B/op	       0 allocs/op
PASS`,
          },
          {
            type: "list",
            items: [
              "`-run '^$'` skips tests; `-bench .` runs all benchmarks; `-12` is GOMAXPROCS.",
              "12 allocs/op: append doubled the backing array repeatedly (see slices-internals).",
              "0 allocs/op for the preallocated version: after inlining, escape analysis proved the 8 KB array doesn't escape, so it lives on the stack — allocation counts depend on the compiler, which is why you measure.",
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "list",
            items: [
              "Classic benchmarks loop `b.N` times; the framework grows b.N until the run lasts ~1 s (`-benchtime`).",
              "`b.Loop()` (Go 1.24) runs setup only once, times only the loop, and keeps the loop body's calls from being optimized away. Before 1.24, use `b.ResetTimer()` after setup and assign results to a package-level sink.",
              "`b.ReportAllocs()` = per-benchmark `-benchmem`. `b.RunParallel` benchmarks concurrent code across GOMAXPROCS goroutines.",
              "Run each benchmark multiple times (`-count=10`) and compare old vs new with `benchstat`, which reports deltas with confidence.",
              "Fuzzing (Go 1.18): `func FuzzX(f *testing.F)`, `go test -fuzz=FuzzX` generates inputs and saves failures under testdata/fuzz.",
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "`b.Loop` exists only on Go 1.24+; `t.Context()` (a per-test context cancelled at test end) on 1.24+; `testing/synctest` for testing concurrent code with a fake clock became generally available in Go 1.25. Check your module's Go version.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Benchmarking code whose result is unused — the compiler may delete it (b.Loop protects against this).",
              "Including setup in the timed region.",
              "Comparing single runs on a noisy laptop; use -count and benchstat.",
              "Tests depending on map iteration order or goroutine timing (time.Sleep) — flaky.",
              "Not running `go test -race` in CI.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Go tests are `TestXxx(t *testing.T)` functions in _test.go files, usually table-driven with `t.Run` subtests and `t.Parallel`. Benchmarks are `BenchmarkXxx(b *testing.B)`; run with `go test -bench . -benchmem` to see ns/op, bytes and allocations per op. Since Go 1.24 `for b.Loop()` replaces the b.N loop and avoids timing setup or dead-code elimination. Use -count and benchstat to compare, -race in CI, fuzzing for parsers, and pprof profiles from benchmarks to find hot spots.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Table-driven tests + subtests + Parallel.",
              "-bench -benchmem; ns/op, B/op, allocs/op.",
              "b.Loop (1.24) or ResetTimer + sink.",
              "benchstat for comparisons; -race in CI.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Table-driven test", definition: "A test iterating over a slice of input/expected cases." },
      { term: "b.N", definition: "Iteration count chosen by the benchmark framework." },
      { term: "b.Loop", definition: "Go 1.24 benchmark loop helper that handles timing and prevents dead-code elimination." },
      { term: "benchstat", definition: "Tool computing statistics and deltas between benchmark runs." },
      { term: "Fuzzing", definition: "Automatically generating inputs to find crashes or failing assertions." },
    ],
    followUps: [
      { q: "How do you test code that uses time.Now or sleeps?", a: "Inject a clock interface or use `testing/synctest` (Go 1.25) which runs goroutines in a bubble with a fake clock." },
      { q: "What does allocs/op tell you that ns/op doesn't?", a: "Allocation pressure drives GC cost across the whole program, not just this function's time." },
    ],
    quiz: [
      {
        id: "bt-q1",
        prompt: "Which flag adds B/op and allocs/op to benchmark output?",
        options: ["-v", "-benchmem", "-race", "-cover"],
        answer: 1,
        explanation: "Or call b.ReportAllocs() in the benchmark.",
      },
      {
        id: "bt-q2",
        prompt: "What does `for b.Loop()` (Go 1.24) improve over `for i := 0; i < b.N; i++`?",
        options: ["Runs in parallel", "Excludes setup from timing and prevents the body being optimized away", "Measures memory", "Nothing"],
        answer: 1,
        explanation: "Setup outside the loop runs once and isn't timed; results are kept alive.",
      },
    ],
    questions: ["go/go-12"],
  },

  // ───────────────────────────────────────────────────────── structured-logging
  {
    slug: "structured-logging",
    track: "go",
    title: "Structured logging with log/slog",
    summary:
      "log/slog (Go 1.21) logs key-value records instead of free text, with levels, handlers for JSON or text, child loggers with attached attributes, groups, and LogValuer for redaction — so logs are queryable and safe.",
    level: "intermediate",
    frequency: "medium",
    minutes: 20,
    kinds: ["coding", "theory"],
    status: "authored",
    prerequisites: ["go/interfaces", "go/context"],
    related: ["system-design/logging-monitoring-tracing", "production/observability-opentelemetry", "go/error-wrapping"],
    tags: ["slog", "structured logging", "JSON logs", "log levels", "redaction"],
    sources: [S.slog, S.slogBlog],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Log with slog using key-value pairs and typed Attrs.",
              "Configure JSON/text handlers, levels and ReplaceAttr.",
              "Attach request-scoped attributes with `With` and redact with `LogValuer`.",
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "`log.Printf(\"user %s failed login from %s\", u, ip)` is easy to write and hard to query. Structured logs are records — `{\"msg\":\"login failed\",\"user\":\"ann\",\"ip\":\"…\"}` — so your log platform can filter `user=ann` or count by `route` without regexes.",
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"context"
	"log/slog"
	"os"
)

type Email string

// LogValue redacts the address whenever an Email is logged.
func (Email) LogValue() slog.Value { return slog.StringValue("[redacted]") }

func main() {
	opts := &slog.HandlerOptions{
		Level: slog.LevelDebug,
		ReplaceAttr: func(groups []string, a slog.Attr) slog.Attr {
			if a.Key == slog.TimeKey && len(groups) == 0 {
				return slog.Attr{} // drop time so the output is reproducible
			}
			return a
		},
	}
	logger := slog.New(slog.NewJSONHandler(os.Stdout, opts))

	reqLog := logger.With("request_id", "r-42", "route", "/login") // attached to every line
	reqLog.Info("login attempt", "user", Email("ann@example.com"))
	reqLog.Debug("cache lookup", slog.Bool("hit", false), slog.Int("ms", 3))
	reqLog.LogAttrs(context.Background(), slog.LevelWarn, "slow query",
		slog.Group("db", slog.String("table", "users"), slog.Int("ms", 812)))

	text := slog.New(slog.NewTextHandler(os.Stdout, opts))
	text.Error("payment failed", "order", 1234, "err", "card declined")
}`,
            output: `{"level":"INFO","msg":"login attempt","request_id":"r-42","route":"/login","user":"[redacted]"}
{"level":"DEBUG","msg":"cache lookup","request_id":"r-42","route":"/login","hit":false,"ms":3}
{"level":"WARN","msg":"slow query","request_id":"r-42","route":"/login","db":{"table":"users","ms":812}}
level=ERROR msg="payment failed" order=1234 err="card declined"`,
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "list",
            items: [
              "**Logger** (front end) builds a `Record` (time, level, message, attrs) and passes it to a **Handler** (back end) that formats and writes it. You can write custom handlers (e.g. add trace IDs from ctx).",
              "`With` pre-formats attributes once in the handler, so per-call cost stays low.",
              "`LogAttrs` with typed `slog.Int/String/...` avoids allocating for `any` key-value pairs on hot paths.",
              "Levels are integers (Debug −4, Info 0, Warn 4, Error 8); `slog.LevelVar` lets you change the level at runtime.",
              "`slog.SetDefault(logger)` also redirects the old `log` package's output through slog.",
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
              "Odd number of key-value args — slog emits a `!BADKEY` attribute; `go vet` checks slog calls.",
              "Logging secrets/PII — use LogValuer or ReplaceAttr to redact.",
              "High-cardinality message strings (`\"user 123 failed\"`) — keep the message constant; put variables in attributes.",
              "Logging the same error at every layer.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "log/slog, added in Go 1.21, is the standard structured logger: a Logger produces records with a level, message and key-value attributes, and a Handler (JSONHandler, TextHandler or custom) renders them. `With` attaches request-scoped fields like request_id to a child logger, groups nest attributes, `LogValuer` and ReplaceAttr redact sensitive values, and `LogAttrs` with typed attrs avoids allocations on hot paths.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Key-value records, not formatted strings.",
              "Logger → Record → Handler (JSON/Text/custom).",
              "With for context, Group for nesting, LogValuer for redaction.",
              "Constant messages, variable attributes.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Structured logging", definition: "Emitting logs as machine-parseable key-value records." },
      { term: "slog.Handler", definition: "Interface that formats and outputs log records." },
      { term: "LogValuer", definition: "Interface letting a type control how it is logged (e.g. redaction)." },
      { term: "Cardinality", definition: "Number of distinct values a field takes; high-cardinality messages hurt log indexing." },
    ],
    followUps: [
      { q: "How do you add the trace ID from a context to every log line?", a: "Write a Handler wrapper whose Handle(ctx, r) reads the span from ctx and adds attributes, and log with the *Context methods (InfoContext etc.)." },
      { q: "Why not just use zap or zerolog?", a: "They're still faster in some benchmarks, but slog is standard, has a pluggable handler API (zap/zerolog can be handlers), and avoids a dependency." },
    ],
    quiz: [
      {
        id: "slog-q1",
        prompt: "What does `logger.With(\"request_id\", id)` return?",
        options: ["A log line", "A child logger that adds request_id to every record", "An error", "A Handler"],
        answer: 1,
        explanation: "With returns a new Logger with the attributes attached.",
      },
    ],
    questions: [],
  },

  // ───────────────────────────────────────────────────────── gin
  {
    slug: "gin",
    track: "go",
    title: "Building HTTP APIs with Gin",
    summary:
      "Gin is a popular HTTP framework on top of net/http: a radix-tree router, middleware chains, request binding with validation, and JSON helpers. Know what it adds — and what Go 1.22's ServeMux now covers without it.",
    level: "beginner",
    frequency: "medium",
    minutes: 25,
    kinds: ["coding", "theory"],
    status: "authored",
    prerequisites: ["go/http-server", "go/json", "go/external-modules"],
    related: ["go/context", "go/graceful-shutdown", "go/structured-logging", "backend/rest-graphql-grpc-trpc"],
    tags: ["gin", "router", "middleware", "binding", "validation", "REST"],
    sources: [S.gin, { label: "gin-gonic/gin on GitHub", url: "https://github.com/gin-gonic/gin", kind: "external" }, { label: "Go 1.22 routing enhancements", url: "https://go.dev/blog/routing-enhancements", kind: "docs" }, N.gin],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Define routes, groups and path/query parameters in Gin.",
              "Bind and validate JSON bodies.",
              "Write middleware with `c.Next()` and `c.Abort()`.",
              "Compare Gin with the standard library router (Go 1.22+).",
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin" // go get github.com/gin-gonic/gin
)

type CreateUser struct {
	Name  string \`json:"name"  binding:"required,min=2"\`
	Email string \`json:"email" binding:"required,email"\`
}

// Timing is middleware: code before c.Next() runs on the way in, after it on the way out.
func Timing() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		slog.Info("request", "path", c.FullPath(), "status", c.Writer.Status(), "took", time.Since(start))
	}
}

func RequireToken(token string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.GetHeader("Authorization") != "Bearer "+token {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return // Abort stops later handlers; return stops this one
		}
		c.Next()
	}
}

func main() {
	r := gin.Default() // includes Logger and Recovery (turns panics into 500s)
	r.Use(Timing())

	r.GET("/health", func(c *gin.Context) { c.String(http.StatusOK, "ok") })

	api := r.Group("/api/v1", RequireToken("secret"))
	{
		api.GET("/users/:id", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"id": c.Param("id"), "fields": c.Query("fields")})
		})
		api.POST("/users", func(c *gin.Context) {
			var in CreateUser
			if err := c.ShouldBindJSON(&in); err != nil { // decode + validate tags
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			// c.Request.Context() is the request's context: pass it to DB calls.
			c.JSON(http.StatusCreated, in)
		})
	}

	r.Run(":8080") // for graceful shutdown, use http.Server{Handler: r} instead
}`,
            caption: "Requires the Gin module. Validation tags use go-playground/validator.",
          },
          {
            type: "code",
            lang: "bash",
            code: `curl -s -H 'Authorization: Bearer secret' localhost:8080/api/v1/users/7?fields=name
curl -s -X POST -H 'Authorization: Bearer secret' -d '{"name":"A"}' localhost:8080/api/v1/users`,
            caption: "Expected responses (not executed here; the validation text comes from go-playground/validator and can vary by version):",
            output: `{"fields":"name","id":"7"}
{"error":"Key: 'CreateUser.Name' Error:Field validation for 'Name' failed on the 'min' tag\\nKey: 'CreateUser.Email' Error:Field validation for 'Email' failed on the 'required' tag"}`,
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "list",
            items: [
              "Gin's router is a radix tree (from httprouter): lookups are proportional to path length, not number of routes.",
              "`*gin.Context` objects are pooled with `sync.Pool` and reused across requests — **never** use `c` in a goroutine that outlives the handler; call `c.Copy()` first.",
              "Middleware is a slice of handlers per route; `c.Next()` advances an index, `c.Abort()` sets it past the end.",
              "`gin.Default()` installs Recovery, so a panic in a handler becomes a 500 instead of crashing the process (net/http's server also recovers per-connection panics, but logs and closes the connection).",
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Do you still need Gin?",
            text: "Since Go 1.22, `http.ServeMux` supports methods and wildcards (`mux.HandleFunc(\"GET /users/{id}\", h)` + `r.PathValue(\"id\")`). Gin still adds binding/validation, middleware ergonomics and helpers; the standard library adds zero dependencies. Both are valid choices.",
          },
          {
            type: "code",
            lang: "go",
            code: `mux := http.NewServeMux()
mux.HandleFunc("GET /users/{id}", func(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(map[string]string{"id": r.PathValue("id")}) // Go 1.22 patterns
})`,
            caption: "The standard-library equivalent of a Gin path parameter.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Using `c` inside a spawned goroutine without `c.Copy()` — the context is recycled for another request.",
              "Using `c.Bind*` (which writes a 400 automatically) and then writing another response — use `ShouldBind*` and handle errors yourself.",
              "Forgetting `return` after `c.Abort…` in a handler — later code still runs.",
              "Running `gin.Default()` in production without setting `gin.SetMode(gin.ReleaseMode)` (or `GIN_MODE=release`).",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Gin is a net/http-compatible framework with a fast radix-tree router, route groups, middleware chains driven by `c.Next()`/`c.Abort()`, struct binding with validation tags via ShouldBindJSON, and JSON helpers. `gin.Default` adds logging and panic recovery. Its Context is pooled, so copy it before using it in goroutines. Since Go 1.22 the standard ServeMux handles methods and path parameters, so Gin is a convenience choice rather than a necessity.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Router + groups + middleware + binding.",
              "c.Next / c.Abort control the chain.",
              "Pooled Context: c.Copy() for goroutines.",
              "Go 1.22 ServeMux covers basic routing without dependencies.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Middleware", definition: "A handler that wraps others to add cross-cutting behaviour (auth, logging)." },
      { term: "Radix tree", definition: "Compressed prefix tree used for fast route matching." },
      { term: "Binding", definition: "Decoding request data into a struct, optionally validating it." },
      { term: "gin.H", definition: "Shorthand for `map[string]any` used to build JSON responses." },
    ],
    followUps: [
      { q: "How do you gracefully shut down a Gin server?", a: "Gin's Engine is an http.Handler: wrap it in `&http.Server{Addr: \":8080\", Handler: r}` and use Shutdown as in the graceful-shutdown lesson." },
      { q: "What's the difference between c.Bind and c.ShouldBind?", a: "Bind aborts with 400 on error automatically; ShouldBind returns the error and lets you respond." },
    ],
    quiz: [
      {
        id: "gin-q1",
        prompt: "Why must you call `c.Copy()` before using a Gin context in a goroutine?",
        options: ["It's faster", "Contexts are pooled and reused after the handler returns", "Goroutines can't read headers", "It's required by net/http"],
        answer: 1,
        explanation: "The original *gin.Context may be reset and handed to another request.",
      },
    ],
    questions: [],
  },
];
