import type { InterviewQuestion } from "../types";

/**
 * Go interview bank, ordered roughly by how often each topic is asked.
 * Examples were run on Go 1.26 unless marked otherwise.
 */

export const questions: InterviewQuestion[] = [
  // ───────────────────────────────────────────── go-01
  {
    id: "go-01",
    track: "go",
    number: 1,
    question: "What is a goroutine, and how is it different from an OS thread?",
    level: "beginner",
    frequency: "very-high",
    tags: ["goroutines", "threads", "runtime", "M:N scheduling"],
    shortAnswer:
      "A goroutine is a function running concurrently under the Go runtime's scheduler rather than the kernel's. It starts with a tiny stack — 2 KB in the gc runtime — that grows by copying, it's created and switched in user space without syscalls, and many goroutines are multiplexed onto a few OS threads (M:N).\n\nAn OS thread has a large fixed stack (often MBs reserved), is created with a syscall and context-switched by the kernel. So you can run hundreds of thousands of goroutines where thousands of threads would be a problem. Goroutines have no exposed ID and can't be killed from outside; you stop them cooperatively with a context or done channel.",
    deep: [
      {
        type: "table",
        head: ["", "Goroutine", "OS thread"],
        rows: [
          ["Stack", "Starts ~2 KB, grows/shrinks by copying (max 1 GB on 64-bit)", "Fixed size reserved, typically 1–8 MB"],
          ["Creation", "Runtime allocation, ~sub-µs", "clone() syscall, kernel structures"],
          ["Switching", "User-space, a few registers, triggered by blocking/preemption", "Kernel context switch"],
          ["Scheduler", "Go runtime (G/M/P)", "OS kernel"],
          ["Blocking I/O", "Parks only the goroutine (netpoller)", "Blocks the thread"],
          ["Identity / control", "No public ID; cooperative cancellation", "TID; signals, priorities"],
        ],
      },
      {
        type: "callout",
        tone: "spec-vs-impl",
        text: "The spec only says a goroutine is \"an independent concurrent thread of control within the same address space\". Stack sizes and scheduling are gc runtime details: 2 KB since Go 1.4; since Go 1.19 the initial size may adapt to observed average stack usage.",
      },
      {
        type: "p",
        text: "Goroutines aren't free: each costs at least a few KB, and blocked ones are never garbage collected — leaks accumulate. And an unrecovered panic in any goroutine terminates the whole process.",
      },
    ],
    example: {
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
		go func() { <-done }() // parked: costs memory, not CPU or a thread
	}
	fmt.Println("after:", runtime.NumGoroutine())
	close(done)
}`,
      output: `before: 1
after: 4`,
    },
    walkthrough: [
      { title: "Start", detail: "Only the main goroutine exists." },
      { title: "go statements", detail: "Each creates a G and queues it; it counts as live immediately." },
      { title: "Parked", detail: "Each blocks on `<-done`, giving its thread back to the scheduler." },
      { title: "close(done)", detail: "Broadcast wakes all three; main may exit before they run — fine here." },
    ],
    followUps: [
      { q: "How many goroutines can a program run?", a: "Limited by memory: at a few KB each, a million parked goroutines needs a few GB. CPU-bound parallelism is still capped at GOMAXPROCS." },
      { q: "Why doesn't Go expose goroutine IDs?", a: "To discourage goroutine-local storage; state should be passed explicitly (e.g. via context)." },
      { q: "What happens to other goroutines when main returns?", a: "The program exits immediately; they're terminated without running defers." },
    ],
    pitfalls: [
      "Saying goroutines are \"lightweight threads\" without explaining the M:N model and stack growth.",
      "Claiming goroutines run in parallel unconditionally — only up to GOMAXPROCS.",
      "Forgetting that blocking syscalls still occupy an OS thread.",
    ],
    glossary: [
      { term: "M:N scheduling", definition: "Multiplexing M user-level tasks onto N OS threads." },
      { term: "Netpoller", definition: "Runtime component that parks goroutines on network I/O using epoll/kqueue/IOCP." },
      { term: "GOMAXPROCS", definition: "Max number of threads executing Go code simultaneously." },
    ],
    relatedLessons: ["go/goroutines", "go/goroutine-stacks", "go/gmp-scheduler", "go/concurrency-vs-parallelism"],
    relatedQuestions: ["go-02", "go-10"],
    sources: [],
  },

  // ───────────────────────────────────────────── go-02
  {
    id: "go-02",
    track: "go",
    number: 2,
    question: "Explain the Go scheduler's G/M/P model.",
    level: "advanced",
    frequency: "very-high",
    tags: ["scheduler", "GMP", "work stealing", "preemption", "netpoller"],
    shortAnswer:
      "G is a goroutine, M is an OS thread, and P is a processor — a scheduling context that an M must hold to run Go code. There are exactly GOMAXPROCS Ps. Each P has a local run queue of up to 256 goroutines plus a `runnext` slot; overflow goes to a global run queue, which Ps check every 61 scheduling ticks for fairness. An idle P steals half of another P's local queue.\n\nWhen a goroutine blocks on network I/O it's parked on the netpoller and the M keeps running other Gs. When it enters a blocking syscall, sysmon hands the P to another M so Go code keeps running. Since Go 1.14 long-running goroutines are preempted asynchronously with signals; before that only at function calls.",
    deep: [
      {
        type: "steps",
        steps: [
          { title: "go f()", detail: "New G placed in the current P's runnext; the old runnext G moves to the local queue tail. Full local queue → half of it moves to the global queue." },
          { title: "schedule()", detail: "Every 61st tick check the global queue first; else runnext → local queue → global queue → netpoll → steal half from a random P." },
          { title: "Run", detail: "Until block (channel, mutex, I/O), yield, exit or preemption (sysmon flags Gs running > ~10 ms)." },
          { title: "Syscall", detail: "M blocks in the kernel; sysmon retakes the P and gives it to another M. On return, the M tries to get a P back or queues its G globally and sleeps." },
        ],
      },
      {
        type: "callout",
        tone: "spec-vs-impl",
        text: "All of this is gc-runtime implementation (runtime/proc.go): 256-slot queues, 61-tick check, steal-half, sysmon's 20 µs–10 ms polling. The spec says nothing about scheduling order or fairness.",
      },
      {
        type: "list",
        items: [
          "Why P exists: before Go 1.1 a single global queue and lock limited scalability; per-P queues and caches make the common path lock-free.",
          "runnext gives locality (a woken receiver runs next on the same P) and inherits the time slice to avoid starvation.",
          "Threads can exceed GOMAXPROCS: blocked syscalls/cgo calls hold threads without Ps.",
        ],
      },
    ],
    example: {
      type: "code",
      lang: "go",
      code: `package main

import (
	"fmt"
	"runtime"
	"time"
)

func main() {
	runtime.GOMAXPROCS(1) // a single P
	go func() {
		for { // tight loop without function calls
		}
	}()
	time.Sleep(10 * time.Millisecond)
	fmt.Println("main still gets scheduled")
}`,
      output: `main still gets scheduled`,
    },
    walkthrough: [
      { title: "One P", detail: "Only one goroutine can execute Go code at a time." },
      { title: "Spinner starts", detail: "When main sleeps, the spinner runs and never calls a function (no cooperative preemption point)." },
      { title: "sysmon", detail: "Notices the G has run > 10 ms and signals its thread (SIGURG); the handler preempts it." },
      { title: "main resumes", detail: "Prints on Go 1.14+. On Go ≤ 1.13 this program could hang." },
    ],
    followUps: [
      { q: "What is work stealing and why steal half?", a: "An idle P takes runnable Gs from a random busy P. Taking half balances load quickly and amortizes the cost of the steal." },
      { q: "What does GOMAXPROCS=1 change?", a: "Removes parallelism of Go code but not concurrency; data races are still possible due to preemption." },
      { q: "How can you observe the scheduler?", a: "`GODEBUG=schedtrace=1000` (add `scheddetail=1` for per-G detail) and `go tool trace`." },
      { q: "What changed for containers in Go 1.25?", a: "On Linux, the default GOMAXPROCS respects the cgroup CPU limit and updates if it changes." },
    ],
    pitfalls: [
      "Saying M = goroutine or P = CPU core (P is a logical context; cores are an OS concept).",
      "Claiming Go scheduling is purely cooperative (outdated since 1.14).",
      "Forgetting the netpoller vs blocking-syscall distinction.",
    ],
    glossary: [
      { term: "G / M / P", definition: "Goroutine / OS thread (machine) / processor context holding a run queue." },
      { term: "runnext", definition: "Per-P slot for the next goroutine to run, used for locality." },
      { term: "sysmon", definition: "Runtime monitor thread: retakes Ps from syscalls, preempts long-running Gs, polls the network." },
      { term: "Work stealing", definition: "Idle Ps taking half of another P's local run queue." },
    ],
    relatedLessons: ["go/gmp-scheduler", "go/goroutines", "go/goroutine-stacks"],
    relatedQuestions: ["go-01"],
    sources: [],
  },

  // ───────────────────────────────────────────── go-03
  {
    id: "go-03",
    track: "go",
    number: 3,
    question: "What is the difference between buffered and unbuffered channels?",
    level: "beginner",
    frequency: "very-high",
    tags: ["channels", "buffered", "unbuffered", "synchronization"],
    shortAnswer:
      "An unbuffered channel has capacity zero: a send blocks until a receiver takes the value, so the two goroutines rendezvous and a completed send proves delivery. A buffered channel with capacity N lets sends proceed until N values are queued; receives block only when it's empty.\n\nUse unbuffered for synchronization and hand-offs, buffered to absorb bursts, decouple producer and consumer, or as a counting semaphore. A buffer doesn't fix a design that deadlocks — it just delays it.",
    deep: [
      {
        type: "table",
        head: ["", "Unbuffered", "Buffered (cap N)"],
        rows: [
          ["Send blocks until", "a receiver arrives", "buffer has a free slot"],
          ["Receive blocks until", "a sender arrives", "buffer is non-empty"],
          ["After send returns you know", "the value was received", "the value is queued"],
          ["Memory model", "receive happens-before send completes", "k-th receive happens-before (k+N)-th send completes"],
        ],
      },
      {
        type: "p",
        text: "Internally both are an `hchan`: a lock, a ring buffer (`buf`, size 0 for unbuffered), `sendx/recvx` indices and two FIFO wait queues (`sendq`, `recvq`) of sudogs. If a receiver is already waiting, a sender copies the value directly to it, skipping the buffer.",
      },
      {
        type: "callout",
        tone: "spec-vs-impl",
        text: "hchan, sudogs and direct copying are runtime details (runtime/chan.go); blocking semantics and happens-before rules are specified.",
      },
    ],
    example: {
      type: "code",
      lang: "go",
      code: `package main

import "fmt"

func main() {
	buf := make(chan int, 2)
	buf <- 1
	buf <- 2 // fine: buffer has room
	fmt.Println(len(buf), cap(buf))
	fmt.Println(<-buf, <-buf)

	unbuf := make(chan int)
	go func() { unbuf <- 42 }() // must be in another goroutine
	fmt.Println(<-unbuf)
}`,
      output: `2 2
1 2
42`,
    },
    walkthrough: [
      { title: "Buffered sends", detail: "Both sends complete immediately, no receiver needed." },
      { title: "len/cap", detail: "2 items queued, capacity 2." },
      { title: "FIFO receives", detail: "1 then 2." },
      { title: "Unbuffered", detail: "The goroutine's send blocks until main receives; doing `unbuf <- 42` in main would deadlock." },
    ],
    followUps: [
      { q: "What do len and cap return for an unbuffered channel?", a: "0 and 0." },
      { q: "How do you use a buffered channel as a semaphore?", a: "`sem := make(chan struct{}, N)`; send to acquire, receive to release; at most N holders." },
      { q: "When would you choose buffer size 1?", a: "To let a single sender complete without waiting — e.g. a result channel in a timeout pattern so the worker doesn't leak." },
    ],
    pitfalls: [
      "Believing a buffered send means the value was processed.",
      "Adding buffers to \"fix\" deadlocks.",
      "Huge buffers hiding a slow consumer.",
    ],
    glossary: [
      { term: "Rendezvous", definition: "Both parties must be present for the exchange to happen." },
      { term: "hchan", definition: "Runtime struct backing a channel." },
      { term: "sudog", definition: "Runtime record for a goroutine waiting on a channel." },
    ],
    relatedLessons: ["go/channels", "go/channel-close-range", "go/select"],
    relatedQuestions: ["go-04", "go-05", "go-09"],
    sources: [],
  },

  // ───────────────────────────────────────────── go-04
  {
    id: "go-04",
    track: "go",
    number: 4,
    question: "What happens when you close a channel? Who should close it?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["channels", "close", "range", "ownership"],
    shortAnswer:
      "`close(ch)` marks that no more values will be sent. Buffered values are still delivered; after that, every receive returns immediately with the zero value and `ok == false`, and `for range` loops end. Close is a broadcast: all blocked receivers wake.\n\nSending on a closed channel panics, closing a closed or nil channel panics, so the rule is: the sender closes, never the receiver, and only once. With several senders, a coordinator waits on a WaitGroup and then closes. If a receiver wants senders to stop, it signals via a separate done channel or context. Closing isn't needed for garbage collection.",
    deep: [
      {
        type: "table",
        head: ["Operation", "nil channel", "closed channel"],
        rows: [
          ["send", "blocks forever", "panic"],
          ["receive", "blocks forever", "drains buffer, then zero value, ok=false"],
          ["close", "panic", "panic"],
        ],
      },
      {
        type: "code",
        lang: "go",
        code: `var wg sync.WaitGroup
for _, w := range workers {
	wg.Add(1)
	go func() { defer wg.Done(); w.run(results) }()
}
go func() { wg.Wait(); close(results) }() // single closer after all senders`,
        caption: "Many senders: close after all of them are done.",
      },
    ],
    example: {
      type: "code",
      lang: "go",
      code: `package main

import "fmt"

func main() {
	ch := make(chan int, 3)
	ch <- 1
	ch <- 2
	close(ch)
	for v := range ch {
		fmt.Println("got", v)
	}
	v, ok := <-ch
	fmt.Println(v, ok)
}`,
      output: `got 1
got 2
0 false`,
    },
    walkthrough: [
      { title: "close", detail: "Two values remain in the buffer." },
      { title: "range", detail: "Receives 1 and 2, then sees closed + empty and exits." },
      { title: "comma-ok", detail: "Zero value and false — not a block, not a panic." },
    ],
    followUps: [
      { q: "Is there a way to check whether a channel is closed without receiving?", a: "No, by design — the answer could be stale immediately. Structure code so the owner knows." },
      { q: "How can multiple places safely trigger a close?", a: "Wrap it in `sync.Once`, or funnel requests to a single owner goroutine." },
    ],
    pitfalls: [
      "Receiver closing the channel while senders are active (send-on-closed panic).",
      "Every worker closing a shared results channel.",
      "Treating the zero value from a closed channel as real data.",
    ],
    glossary: [
      { term: "Comma-ok", definition: "`v, ok := <-ch`; ok false means closed and drained." },
      { term: "Channel owner", definition: "The goroutine responsible for sending on and closing a channel." },
    ],
    relatedLessons: ["go/channel-close-range", "go/channels", "go/worker-pool"],
    relatedQuestions: ["go-03", "go-06", "go-22"],
    sources: [],
  },

  // ───────────────────────────────────────────── go-05
  {
    id: "go-05",
    track: "go",
    number: 5,
    question: "How does select work? What happens if several cases are ready?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["select", "channels", "timeout", "nil channel"],
    shortAnswer:
      "`select` waits on several channel sends/receives and executes exactly one that can proceed. If more than one is ready, it picks uniformly at random, so no case starves. With a `default` case it never blocks; without one and with nothing ready it blocks; `select {}` blocks forever.\n\nIdioms: timeouts with `time.After` or `ctx.Done()`, cancellation inside for-select loops, non-blocking send to shed load, and setting a channel variable to nil to disable its case since nil channels are never ready.",
    deep: [
      {
        type: "list",
        items: [
          "All channel operands and send values are evaluated once, in source order, on entry.",
          "The runtime shuffles cases into a random poll order and locks the channels in address order (to avoid deadlocking against other selects), then: take a ready case; else run default; else enqueue on every channel and park; on wake, dequeue from the others.",
          "A closed channel is always ready — loops must nil it out or return.",
          "`break` inside a case only exits the select.",
        ],
      },
      {
        type: "callout",
        tone: "spec-vs-impl",
        text: "Uniform random choice is required by the spec; lock ordering and the multi-pass algorithm are runtime details.",
      },
    ],
    example: {
      type: "code",
      lang: "go",
      code: `package main

import (
	"fmt"
	"time"
)

func main() {
	result := make(chan string, 1) // buffered: worker never leaks
	go func() {
		time.Sleep(200 * time.Millisecond)
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
    walkthrough: [
      { title: "Nothing ready", detail: "main parks on both channels." },
      { title: "50 ms", detail: "Timer channel fires; timeout case runs." },
      { title: "200 ms", detail: "Worker sends into the 1-slot buffer and exits — no leak." },
    ],
    followUps: [
      { q: "How do you prioritize one case?", a: "Check it first in a separate non-blocking select (with default), or re-check ctx.Err() after receiving." },
      { q: "How do you select over a dynamic number of channels?", a: "reflect.Select, or merge them into one channel with forwarding goroutines." },
    ],
    pitfalls: [
      "Assuming top-to-bottom priority.",
      "Empty `default` in a for loop → busy-spin at 100% CPU.",
      "Unbuffered result channel in a timeout pattern → leaked goroutine.",
    ],
    glossary: [
      { term: "default case", definition: "Runs when no other case is ready, making select non-blocking." },
      { term: "for-select loop", definition: "Long-running loop processing channel events until cancelled." },
    ],
    relatedLessons: ["go/select", "go/context", "go/goroutine-leaks"],
    relatedQuestions: ["go-03", "go-10", "go-11"],
    sources: [],
  },

  // ───────────────────────────────────────────── go-06
  {
    id: "go-06",
    track: "go",
    number: 6,
    question: "How does sync.WaitGroup work and what are common mistakes with it?",
    level: "beginner",
    frequency: "very-high",
    tags: ["WaitGroup", "sync", "goroutines"],
    shortAnswer:
      "A WaitGroup is a concurrency-safe counter. Call `Add(1)` before starting each goroutine, `defer wg.Done()` inside it, and `Wait()` blocks until the counter returns to zero. Each Done synchronizes before Wait returns, so results written before Done are visible afterwards.\n\nCommon mistakes: calling Add inside the goroutine (Wait may return early), passing the WaitGroup by value (Done hits a copy, Wait hangs — go vet flags it), mismatched Add/Done (negative counter panics or a hang), and calling Wait before draining an unbuffered results channel. Go 1.25 added `wg.Go(f)` which does Add, go and Done for you.",
    deep: [
      {
        type: "p",
        text: "Internally it's one atomic 64-bit word — counter in the high 32 bits, number of waiters in the low 32 — plus a semaphore. When Add brings the counter to zero with waiters present, it releases the semaphore for each waiter.",
      },
      {
        type: "callout",
        tone: "spec-vs-impl",
        text: "The bit layout is an implementation detail. `wg.Go` exists only on Go 1.25+.",
      },
      {
        type: "compare",
        items: [
          { title: "WaitGroup", points: ["Just waits", "No errors/results", "Standard library"] },
          { title: "errgroup.Group", points: ["Returns first error", "WithContext cancels siblings", "SetLimit bounds concurrency (x/sync)"] },
        ],
      },
    ],
    example: {
      type: "code",
      lang: "go",
      code: `package main

import (
	"fmt"
	"sync"
)

func work(id int, wg sync.WaitGroup) { // BUG: copied
	defer wg.Done()
	fmt.Println("work", id)
}

func main() {
	var wg sync.WaitGroup
	wg.Add(1)
	go work(1, wg)
	wg.Wait()
}`,
      output: `work 1
fatal error: all goroutines are asleep - deadlock!

goroutine 1 [sync.WaitGroup.Wait]:
...`,
    },
    walkthrough: [
      { title: "Add(1)", detail: "Original counter = 1." },
      { title: "go work(1, wg)", detail: "The WaitGroup struct is copied into the call." },
      { title: "Done on the copy", detail: "Copy's counter goes to 0; original stays 1." },
      { title: "Wait forever", detail: "Only goroutine left is blocked → runtime deadlock error. Fix: `*sync.WaitGroup`." },
    ],
    followUps: [
      { q: "Can you reuse a WaitGroup?", a: "Yes, but new Add calls for the next round must happen after the previous Wait has returned." },
      { q: "How would you collect errors from goroutines?", a: "errgroup, or a per-goroutine error slice indexed by i, or `errors.Join` over collected errors." },
    ],
    pitfalls: [
      "Add inside the goroutine.",
      "WaitGroup passed by value.",
      "Calling Wait in main before reading from an unbuffered results channel.",
    ],
    glossary: [
      { term: "WaitGroup", definition: "Counter-based barrier for waiting on a set of goroutines." },
      { term: "copylocks", definition: "go vet check for values containing locks being copied." },
    ],
    relatedLessons: ["go/waitgroup", "go/fork-join", "go/worker-pool"],
    relatedQuestions: ["go-22", "go-09"],
    sources: [],
  },

  // ───────────────────────────────────────────── go-07
  {
    id: "go-07",
    track: "go",
    number: 7,
    question: "When would you use a Mutex, an RWMutex or a channel?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["mutex", "RWMutex", "channels", "design"],
    shortAnswer:
      "Use a Mutex to protect shared state in place — a map, a cache, a struct's fields — with short critical sections. Use an RWMutex when reads vastly outnumber writes and the read sections are long enough for concurrent readers to matter; otherwise its bookkeeping can make it slower than a plain Mutex. Use channels to transfer ownership of data or coordinate goroutines: pipelines, worker pools, signaling, cancellation.\n\nRule of thumb: mutex for state, channels for communication, atomics for a single word. Go mutexes aren't reentrant and must not be copied.",
    deep: [
      {
        type: "table",
        head: ["Tool", "Fits", "Watch out for"],
        rows: [
          ["Mutex", "Guarding a cache/map/counter", "Holding during I/O; lock ordering"],
          ["RWMutex", "Read-heavy config or lookup tables", "Recursive RLock can deadlock when a writer waits; slower for tiny sections"],
          ["Channel", "Ownership hand-off, pipelines, fan-out/in, done signals", "Leaks, deadlocks, extra latency"],
          ["atomic", "Counters, flags, pointer swaps", "Multi-field invariants"],
        ],
      },
      {
        type: "p",
        text: "sync.Mutex has a fast CAS path, brief spinning on multicore, and a starvation mode: if a waiter waits more than 1 ms, ownership is handed directly to waiters in FIFO order. RWMutex blocks new readers once a writer is waiting to prevent writer starvation.",
      },
      {
        type: "callout",
        tone: "spec-vs-impl",
        text: "Spinning and the 1 ms starvation threshold are implementation details; mutual exclusion and memory-model ordering (Unlock synchronizes before the next Lock) are the contract.",
      },
    ],
    example: {
      type: "code",
      lang: "go",
      code: `package main

import (
	"fmt"
	"sync"
)

type Cache struct {
	mu sync.RWMutex
	m  map[string]string
}

func (c *Cache) Get(k string) (string, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	v, ok := c.m[k]
	return v, ok
}

func (c *Cache) Set(k, v string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.m[k] = v
}

func main() {
	c := &Cache{m: map[string]string{}}
	c.Set("lang", "go")
	fmt.Println(c.Get("lang"))
}`,
      output: `go true`,
    },
    walkthrough: [
      { title: "Set", detail: "Exclusive Lock: waits for all readers to leave." },
      { title: "Get", detail: "Shared RLock: many readers concurrently." },
      { title: "Pointer receiver", detail: "Essential — a value receiver would copy the mutex." },
    ],
    followUps: [
      { q: "What's sync.Map for?", a: "Keys written once and read many times, or goroutines working on disjoint keys. For general use, map + Mutex is clearer and often faster." },
      { q: "How do you reduce contention on a hot mutex?", a: "Shorten critical sections, shard the data by key hash with one mutex per shard, or use atomics/copy-on-write for read-mostly data." },
    ],
    pitfalls: [
      "Defaulting to RWMutex without measuring.",
      "Using channels as a lock substitute for simple state.",
      "Value receivers on types holding a mutex.",
    ],
    glossary: [
      { term: "Critical section", definition: "Code that must not run concurrently with other code touching the same state." },
      { term: "Starvation mode", definition: "Mutex mode handing ownership FIFO after a waiter waited > 1 ms." },
    ],
    relatedLessons: ["go/mutex", "go/atomics", "go/channels"],
    relatedQuestions: ["go-08", "go-13"],
    sources: [],
  },

  // ───────────────────────────────────────────── go-08
  {
    id: "go-08",
    track: "go",
    number: 8,
    question: "What is a data race in Go and how do you detect and prevent it?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["data race", "race detector", "memory model", "happens-before"],
    shortAnswer:
      "A data race is two goroutines accessing the same memory location concurrently, at least one writing, without synchronization. `count++` from many goroutines loses updates, and in general a racy program has no guarantees — multiword values like strings or interfaces can even be torn.\n\nDetect with the race detector: `go test -race` or `go run -race`, which instruments memory accesses (ThreadSanitizer) and reports both conflicting stacks; it only finds races that actually occur during the run. Prevent with a mutex, channels, atomics, or by confinement — each goroutine owns its data. A clean -race run doesn't rule out higher-level race conditions like check-then-act.",
    deep: [
      {
        type: "list",
        items: [
          "Memory model: synchronization (channel ops, Lock/Unlock, WaitGroup, Once, atomics) creates happens-before edges. A read is guaranteed to see a write only if the write happens-before it.",
          "Data-race-free programs behave sequentially consistently (DRF-SC); since Go 1.19's memory-model revision, atomics are sequentially consistent too.",
          "Race detector cost: per the docs, 5–10× memory and 2–20× execution time; exit status 66 on a detected race.",
        ],
      },
      {
        type: "code",
        lang: "text",
        code: `WARNING: DATA RACE
Read at 0x00c00011c038 by goroutine 8:
  main.main.func1()
      /app/main.go:15 +0x7b
Previous write at 0x00c00011c038 by goroutine 11:
  main.main.func1()
      /app/main.go:15 +0x8d`,
        caption: "Abridged real report for `count++` in 1000 goroutines.",
      },
    ],
    example: {
      type: "code",
      lang: "go",
      code: `package main

import (
	"fmt"
	"sync"
	"sync/atomic"
)

func main() {
	var wg sync.WaitGroup
	var racy int
	var safe atomic.Int64
	for range 1000 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			racy++     // data race
			safe.Add(1) // atomic
		}()
	}
	wg.Wait()
	fmt.Println(racy <= 1000, safe.Load())
}`,
      output: `true 1000`,
      caption: "racy is often < 1000 (varies); `go run -race` reports the racy++ line.",
    },
    walkthrough: [
      { title: "racy++", detail: "Load, add, store — two goroutines can load the same value and one increment is lost." },
      { title: "safe.Add", detail: "A single indivisible LOCK XADD on amd64; never loses updates." },
      { title: "wg.Wait", detail: "Makes final values visible to main." },
    ],
    followUps: [
      { q: "Data race vs race condition?", a: "A data race is unsynchronized memory access (detectable). A race condition is any timing-dependent bug — it can exist with perfect locking, e.g. check-then-act across two locked calls." },
      { q: "Can races happen with GOMAXPROCS=1?", a: "Yes; preemption can interleave goroutines mid-operation." },
      { q: "Should you run -race in production?", a: "Usually not (cost); run it in CI on all tests, sometimes on a canary." },
    ],
    pitfalls: [
      "Using time.Sleep as synchronization.",
      "Mixing atomic and non-atomic access to the same variable.",
      "Concluding race-free from one clean run.",
    ],
    glossary: [
      { term: "Data race", definition: "Concurrent, unsynchronized accesses to one location, at least one a write." },
      { term: "Happens-before", definition: "Ordering guaranteeing visibility of one operation's effects to another." },
      { term: "ThreadSanitizer", definition: "The dynamic race detector runtime used by -race." },
    ],
    relatedLessons: ["go/race-detector", "go/race-deadlock-livelock", "go/atomics", "go/mutex"],
    relatedQuestions: ["go-07", "go-13"],
    sources: [],
  },

  // ───────────────────────────────────────────── go-09
  {
    id: "go-09",
    track: "go",
    number: 9,
    question: "What does \"fatal error: all goroutines are asleep - deadlock!\" mean? Does Go detect all deadlocks?",
    level: "intermediate",
    frequency: "high",
    tags: ["deadlock", "channels", "runtime"],
    shortAnswer:
      "The runtime prints it when every goroutine is blocked — on channels, mutexes, WaitGroups, select {} — and nothing like a timer or network poller could ever wake one. Typical causes: sending on an unbuffered channel with no receiver, ranging over a channel nobody closes, Wait with a copied WaitGroup, or locking a non-reentrant mutex twice.\n\nIt does not detect partial deadlocks. If two goroutines deadlock while others are alive — an HTTP server, a ticker — the program just hangs or leaks. For those you use goroutine profiles, timeouts and lock-ordering discipline.",
    deep: [
      {
        type: "list",
        items: [
          "It's a fatal error, not a panic: recover can't catch it and the process exits with status 2, printing every goroutine's stack and wait reason (`[chan send]`, `[chan receive]`, `[sync.Mutex.Lock]`, `[sync.WaitGroup.Wait]` on recent versions, `[semacquire]` on older ones).",
          "Detection happens when the scheduler finds no runnable goroutine, no running M and no pending timers/netpoll — so a pending `time.After` can delay or prevent the message.",
          "Prevention: owner closes channels, consistent lock order, never hold a lock across a blocking operation, select with ctx.Done()/timeouts.",
        ],
      },
      {
        type: "callout",
        tone: "spec-vs-impl",
        text: "Deadlock detection is a runtime convenience, not a language guarantee; wait-reason labels in stack dumps vary by Go version.",
      },
    ],
    example: {
      type: "code",
      lang: "go",
      code: `package main

import "fmt"

func main() {
	ch := make(chan int)
	for i := range 3 {
		go func() { ch <- i }()
	}
	for v := range ch { // nobody closes ch
		fmt.Println(v)
	}
}`,
      output: `2
0
1
fatal error: all goroutines are asleep - deadlock!

goroutine 1 [chan receive]:
...`,
      caption: "The three values print in varying order.",
    },
    walkthrough: [
      { title: "Three senders", detail: "Each sends once and exits." },
      { title: "range receives 3 values", detail: "Then waits for a 4th or a close." },
      { title: "All asleep", detail: "main is the only goroutine and it's blocked → fatal." },
      { title: "Fix", detail: "WaitGroup + closer goroutine, or receive exactly 3 times." },
    ],
    followUps: [
      { q: "How would you debug a hang in a server where this message never appears?", a: "Dump goroutines: /debug/pprof/goroutine?debug=2 or SIGQUIT (prints all stacks); look for goroutines blocked a long time on the same lock/channel." },
      { q: "What are the four conditions for deadlock?", a: "Mutual exclusion, hold-and-wait, no preemption, circular wait (Coffman)." },
    ],
    pitfalls: [
      "Assuming the runtime would have told you about any deadlock.",
      "Trying to recover from it.",
      "Fixing by adding buffers instead of fixing ownership.",
    ],
    glossary: [
      { term: "Deadlock", definition: "Goroutines blocked forever waiting on each other." },
      { term: "Partial deadlock", definition: "A subset of goroutines deadlocked while others keep running — not detected by the runtime." },
    ],
    relatedLessons: ["go/race-deadlock-livelock", "go/channels", "go/puzzles"],
    relatedQuestions: ["go-03", "go-04", "go-10"],
    sources: [],
  },

  // ───────────────────────────────────────────── go-10
  {
    id: "go-10",
    track: "go",
    number: 10,
    question: "What is a goroutine leak? How do you find and prevent one?",
    level: "intermediate",
    frequency: "high",
    tags: ["goroutine leak", "context", "pprof", "goleak"],
    shortAnswer:
      "A goroutine leak is a goroutine that can never finish — usually blocked forever sending to a channel nobody reads, receiving from one nobody closes, or looping without an exit case. Blocked goroutines are GC roots, so their stacks and everything they reference stay in memory; under load they pile up until the service runs out of memory or file descriptors.\n\nPrevent with clear ownership (sender closes), buffered result channels when results may be abandoned, and `ctx.Done()` cases in every blocking select. Find them with a NumGoroutine metric that only grows, the pprof goroutine profile grouped by stack, and goleak in tests.",
    deep: [
      {
        type: "table",
        head: ["Leak shape", "Fix"],
        rows: [
          ["Abandoned result send (first-wins, timeout)", "Buffer to number of senders, or select on ctx.Done()"],
          ["range over never-closed channel", "Owner closes"],
          ["for-select with no exit", "case <-ctx.Done(): return"],
          ["Unclosed HTTP response body", "defer resp.Body.Close()"],
          ["Mutex never unlocked on an error path", "defer Unlock"],
        ],
      },
    ],
    example: {
      type: "code",
      lang: "go",
      code: `package main

import (
	"fmt"
	"runtime"
	"time"
)

func firstResult() int {
	ch := make(chan int) // fix: make(chan int, 3)
	for i := 0; i < 3; i++ {
		go func() { ch <- i }()
	}
	return <-ch
}

func main() {
	firstResult()
	time.Sleep(50 * time.Millisecond)
	fmt.Println("goroutines:", runtime.NumGoroutine())
}`,
      output: `goroutines: 3`,
    },
    walkthrough: [
      { title: "3 senders", detail: "All block on the unbuffered channel." },
      { title: "1 receive", detail: "firstResult returns after taking one value." },
      { title: "2 stuck forever", detail: "main + 2 leaked goroutines = 3." },
      { title: "Fix", detail: "Buffer 3 lets every send complete; or cancel a context the senders select on." },
    ],
    followUps: [
      { q: "Why doesn't the GC reclaim them?", a: "A goroutine's stack is a root; the runtime doesn't prove that nothing can ever wake it." },
      { q: "How do you write a test that catches leaks?", a: "`defer goleak.VerifyNone(t)` (uber-go/goleak) or VerifyTestMain, which fails if unexpected goroutines remain." },
    ],
    pitfalls: [
      "Fire-and-forget goroutines in request handlers with no cancellation.",
      "Closing the data channel from the receiver to stop senders (panics) instead of using a done channel/context.",
    ],
    glossary: [
      { term: "Goroutine leak", definition: "A goroutine that never terminates, holding memory." },
      { term: "goleak", definition: "Library that detects leftover goroutines in tests." },
    ],
    relatedLessons: ["go/goroutine-leaks", "go/context", "go/select", "go/profiling-pprof"],
    relatedQuestions: ["go-05", "go-11", "go-09"],
    sources: [],
  },

  // ───────────────────────────────────────────── go-11
  {
    id: "go-11",
    track: "go",
    number: 11,
    question: "How does context cancellation work? What are the rules for using context?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["context", "cancellation", "deadline", "timeouts"],
    shortAnswer:
      "Contexts form a tree rooted at `context.Background()`. `WithCancel`, `WithTimeout` and `WithDeadline` derive children with a cancel function. Cancelling a context closes its Done channel and cancels all its descendants, never its parent. Code that does blocking work selects on `ctx.Done()` and returns `ctx.Err()` — Canceled or DeadlineExceeded. Cancellation is cooperative.\n\nRules: pass ctx as the first parameter, don't store it in structs, always `defer cancel()` to release timers, never pass nil, and use `WithValue` only for request-scoped data like request IDs, with unexported key types. Newer helpers: WithCancelCause (1.20), WithoutCancel and AfterFunc (1.21).",
    deep: [
      {
        type: "list",
        items: [
          "A cancelable context holds a mutex, a lazily created done channel, its error and a set of children; deriving registers the child with its nearest cancelable ancestor.",
          "Cancel closes done (a broadcast every waiter sees), cancels children recursively and unregisters from the parent.",
          "WithTimeout adds a timer that calls cancel; calling cancel early stops the timer — the reason vet's lostcancel check exists.",
          "Value lookups walk up the chain — O(depth).",
          "A child's effective deadline is the earliest of its own and its ancestors'.",
        ],
      },
      {
        type: "callout",
        tone: "spec-vs-impl",
        text: "Internal types (cancelCtx, timerCtx, valueCtx) are implementation; the Context interface semantics are the contract.",
      },
    ],
    example: {
      type: "code",
      lang: "go",
      code: `package main

import (
	"context"
	"fmt"
	"time"
)

func slowOp(ctx context.Context) error {
	select {
	case <-time.After(200 * time.Millisecond):
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

func main() {
	parent, cancelParent := context.WithCancel(context.Background())
	child, cancel := context.WithTimeout(parent, 50*time.Millisecond)
	defer cancel()

	fmt.Println(slowOp(child))
	fmt.Println("parent:", parent.Err())
	cancelParent()
	fmt.Println("parent:", parent.Err())
}`,
      output: `context deadline exceeded
parent: <nil>
parent: context canceled`,
    },
    walkthrough: [
      { title: "Derive", detail: "child has a 50 ms deadline and is registered with parent." },
      { title: "slowOp", detail: "ctx.Done() closes at 50 ms, before the 200 ms work → DeadlineExceeded." },
      { title: "Upward isolation", detail: "The child timing out did not cancel the parent." },
      { title: "cancelParent", detail: "Would also have cancelled child if still live." },
    ],
    followUps: [
      { q: "How do you start background work from an HTTP handler that must outlive the request?", a: "Use context.WithoutCancel(r.Context()) (keeps values, drops cancellation) — and give it its own timeout." },
      { q: "Does net/http cancel r.Context() when the client disconnects?", a: "Yes, for HTTP/1.x when the connection closes and for HTTP/2 stream resets; also when ServeHTTP returns." },
    ],
    pitfalls: [
      "Not calling cancel.",
      "Storing ctx in a struct for later.",
      "Using context values for optional parameters or dependencies.",
      "Expecting cancellation to stop CPU-bound loops that never check ctx.",
    ],
    glossary: [
      { term: "Context tree", definition: "Parent/child structure through which cancellation flows downward." },
      { term: "DeadlineExceeded", definition: "Error from ctx.Err() after the deadline passed." },
    ],
    relatedLessons: ["go/context", "go/graceful-shutdown", "go/concurrent-requests"],
    relatedQuestions: ["go-10", "go-23"],
    sources: [],
  },

  // ───────────────────────────────────────────── go-12
  {
    id: "go-12",
    track: "go",
    number: 12,
    question: "How do slices work internally? Explain append and aliasing.",
    level: "intermediate",
    frequency: "very-high",
    tags: ["slices", "append", "aliasing", "capacity"],
    shortAnswer:
      "A slice is a three-word header: a pointer to a backing array, a length and a capacity. Assigning or passing a slice copies the header, not the array, so two slices can share elements.\n\n`append` writes in place if len < cap and returns a header with a larger len — still sharing the array. If capacity is exhausted, it allocates a bigger array, copies, and returns a header pointing to the new one; from then on the slices are independent. That's why you must use append's return value, and why appending to a sub-slice can overwrite the original's elements. Use a full slice expression `s[a:b:b]` or `slices.Clone` to break sharing.",
    deep: [
      {
        type: "list",
        items: [
          "Growth (gc, since Go 1.18): roughly doubles for small slices, then transitions smoothly toward ~1.25× above a threshold of 256 elements; the result is rounded up to an allocator size class.",
          "Sub-slicing `s[i:j]` never copies; the result's cap extends to the end of the original array unless limited with `s[i:j:k]`.",
          "A small sub-slice of a huge array keeps the whole array alive (memory leak) — copy what you need.",
        ],
      },
      {
        type: "callout",
        tone: "spec-vs-impl",
        text: "The spec only says append allocates a sufficiently large new array when capacity is insufficient. Exact growth factors are runtime policy (changed in Go 1.18).",
      },
    ],
    example: {
      type: "code",
      lang: "go",
      code: `package main

import "fmt"

func main() {
	a := make([]int, 3, 4) // len 3, cap 4
	b := append(a, 10)     // fits: shares a's array
	c := append(a, 20)     // also fits: overwrites the slot b used!
	fmt.Println(b, c)

	d := append(b, 30) // cap exceeded: new array
	d[0] = 99
	fmt.Println(a, b, d)
	fmt.Println(len(d), cap(d) >= 5)
}`,
      output: `[0 0 0 20] [0 0 0 20]
[0 0 0] [0 0 0 20] [99 0 0 20 30]
5 true`,
    },
    walkthrough: [
      { title: "b := append(a, 10)", detail: "Writes 10 into index 3 of the shared array; b has len 4." },
      { title: "c := append(a, 20)", detail: "a still has len 3, so append writes index 3 again — now 20. b sees it too." },
      { title: "d := append(b, 30)", detail: "b's cap is 4, so a new, larger array is allocated and copied." },
      { title: "d[0] = 99", detail: "Only d changes; a and b still share the old array." },
    ],
    followUps: [
      { q: "Why must you write `s = append(s, x)`?", a: "append may return a header with a different pointer and always a different length; the old header doesn't see new elements." },
      { q: "What is a nil slice vs an empty slice?", a: "nil slice has a nil pointer (s == nil); empty slice has len 0 with a non-nil pointer. Both work with len, range and append; JSON encodes nil as null and empty as []." },
      { q: "Is concurrent append to a shared slice safe?", a: "No — it reads and writes the header and array; protect it or write to distinct indices." },
    ],
    pitfalls: [
      "Appending to a sub-slice and clobbering the parent.",
      "Assuming a function that appends to its slice parameter updates the caller's slice.",
      "Retaining a tiny sub-slice of a huge buffer.",
    ],
    glossary: [
      { term: "Slice header", definition: "Pointer, length and capacity describing a window into an array." },
      { term: "Backing array", definition: "The array that slice elements actually live in." },
      { term: "Full slice expression", definition: "`s[low:high:max]` which also sets capacity to max-low." },
    ],
    relatedLessons: ["go/slices-internals", "go/arrays", "go/escape-analysis"],
    relatedQuestions: ["go-14", "go-17"],
    sources: [],
  },

  // ───────────────────────────────────────────── go-13
  {
    id: "go-13",
    track: "go",
    number: 13,
    question: "Are Go maps safe for concurrent use? What are your options?",
    level: "intermediate",
    frequency: "high",
    tags: ["maps", "concurrency", "sync.Map", "mutex"],
    shortAnswer:
      "No. Concurrent reads are fine, but a write concurrent with any other read or write is a data race. The runtime has a best-effort check that aborts with `fatal error: concurrent map writes` (or `concurrent map read and map write`) — a fatal error, not a recoverable panic — and `-race` reports it reliably.\n\nOptions: guard the map with a sync.Mutex or RWMutex (the default choice); use sync.Map for its two sweet spots — keys written once and read many times, or goroutines working on disjoint key sets; shard the map with one lock per shard for hot workloads; or confine the map to a single goroutine and talk to it over channels.",
    deep: [
      {
        type: "list",
        items: [
          "Why not built-in locking? The Go team chose not to make every map pay for synchronization most uses don't need (FAQ: \"Why are map operations not defined to be atomic?\").",
          "Detection works via a \"writing\" flag in the map header checked on access — cheap, but only catches overlaps that actually happen.",
          "Go 1.24 switched the built-in map implementation to Swiss tables; concurrency rules are unchanged.",
        ],
      },
      {
        type: "callout",
        tone: "spec-vs-impl",
        text: "The concurrent-write check and the Swiss-table implementation are runtime details; the spec simply doesn't make maps safe for concurrent writes.",
      },
    ],
    example: {
      type: "code",
      lang: "go",
      code: `package main

import (
	"fmt"
	"sync"
)

func main() {
	m := map[int]int{}
	var mu sync.Mutex
	var wg sync.WaitGroup
	for i := range 100 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			mu.Lock() // remove the lock and you'll usually get:
			m[i] = i  // fatal error: concurrent map writes
			mu.Unlock()
		}()
	}
	wg.Wait()
	fmt.Println(len(m))
}`,
      output: `100`,
    },
    walkthrough: [
      { title: "100 goroutines", detail: "Each writes a different key — still a race without the lock, because the map's internal structure is shared." },
      { title: "Mutex", detail: "Serializes writes; final len is 100." },
    ],
    followUps: [
      { q: "Can you recover from 'concurrent map writes'?", a: "No, it's a fatal runtime error that terminates the program." },
      { q: "When is sync.Map slower than map+Mutex?", a: "With frequent writes to the same keys or many new keys — its read-optimized design pays extra on writes." },
    ],
    pitfalls: [
      "Believing writes to different keys are safe.",
      "Locking writes but not reads.",
      "Reaching for sync.Map by default and losing type safety.",
    ],
    glossary: [
      { term: "sync.Map", definition: "Concurrent map optimized for read-mostly or disjoint-key workloads." },
      { term: "Sharding", definition: "Splitting data into partitions with independent locks." },
    ],
    relatedLessons: ["go/maps", "go/mutex", "go/race-detector"],
    relatedQuestions: ["go-07", "go-08", "go-14"],
    sources: [],
  },

  // ───────────────────────────────────────────── go-14
  {
    id: "go-14",
    track: "go",
    number: 14,
    question: "What is the difference between a nil map and an empty map?",
    level: "beginner",
    frequency: "high",
    tags: ["maps", "nil", "zero value"],
    shortAnswer:
      "A nil map — `var m map[string]int` — has no hash table allocated. You can read from it (zero values), take its len (0), range over it (no iterations) and delete from it (no-op), but writing to it panics with \"assignment to entry in nil map\". An empty map — `map[string]int{}` or `make(map[string]int)` — is initialized and accepts writes.\n\nThey also differ in comparisons and encoding: only the nil map equals nil, and encoding/json marshals a nil map as `null` but an empty one as `{}`. Struct fields of map type start nil, so initialize them in a constructor before writing.",
    deep: [
      {
        type: "table",
        head: ["Operation", "nil map", "empty map"],
        rows: [
          ["m == nil", "true", "false"],
          ["len, read, comma-ok", "0 / zero value / false", "same"],
          ["range, delete", "fine (no-op)", "fine"],
          ["write m[k] = v", "panic", "works"],
          ["json.Marshal", "null", "{}"],
        ],
      },
    ],
    example: {
      type: "code",
      lang: "go",
      code: `package main

import (
	"encoding/json"
	"fmt"
)

func main() {
	var nilMap map[string]int
	emptyMap := map[string]int{}

	fmt.Println(nilMap == nil, emptyMap == nil)
	fmt.Println(len(nilMap), nilMap["missing"])
	delete(nilMap, "x") // no-op

	a, _ := json.Marshal(nilMap)
	b, _ := json.Marshal(emptyMap)
	fmt.Println(string(a), string(b))

	defer func() { fmt.Println("recovered:", recover()) }()
	nilMap["boom"] = 1
}`,
      output: `true false
0 0
null {}
recovered: assignment to entry in nil map`,
    },
    walkthrough: [
      { title: "Reads", detail: "Safe on nil maps; return zero values." },
      { title: "JSON", detail: "null vs {} — matters for API consumers." },
      { title: "Write", detail: "Runtime panic (recoverable, unlike concurrent map writes)." },
    ],
    followUps: [
      { q: "Same question for slices?", a: "A nil slice can be appended to (append allocates). Only indexing beyond len panics. JSON: null vs []." },
      { q: "Why does reading a nil map work?", a: "The runtime's lookup returns the zero value when the map has no buckets; only insertion needs an allocated table." },
    ],
    pitfalls: [
      "Forgetting to initialize map fields in structs.",
      "APIs returning null instead of {} because a map was never initialized.",
    ],
    glossary: [
      { term: "Zero value", definition: "The default value of a type when declared without initialization; nil for maps." },
    ],
    relatedLessons: ["go/maps", "go/json"],
    relatedQuestions: ["go-13", "go-12"],
    sources: [],
  },

  // ───────────────────────────────────────────── go-15
  {
    id: "go-15",
    track: "go",
    number: 15,
    question: "Why can an interface holding a nil pointer be non-nil? (the typed nil problem)",
    level: "intermediate",
    frequency: "high",
    tags: ["interfaces", "nil", "errors", "typed nil"],
    shortAnswer:
      "An interface value is two words: a dynamic type and a pointer to the value. It's nil only when both are nil. If you assign a nil `*MyErr` to an `error`, the interface has type `*MyErr` and value nil — so `err != nil` is true even though the pointer inside is nil.\n\nThis bites when a function declares a concrete pointer variable and returns it as `error`. The fix is to return a literal `nil` on the success path, never a typed nil pointer.",
    deep: [
      {
        type: "list",
        items: [
          "Non-empty interfaces are stored as (itab, data); the itab pairs the interface type with the concrete type's method table. Empty interfaces (`any`) are (type, data).",
          "Comparing an interface to nil checks that the type word is nil too.",
          "Methods on a nil pointer receiver can still be called — which is why typed nils sometimes \"work\" until something dereferences.",
        ],
      },
      {
        type: "callout",
        tone: "spec-vs-impl",
        text: "The two-word layout (iface/eface, itab) is the gc implementation; the spec's rule is that an interface is nil only if it holds no dynamic type.",
      },
    ],
    example: {
      type: "code",
      lang: "go",
      code: `package main

import "fmt"

type MyErr struct{}

func (*MyErr) Error() string { return "my error" }

func validate(fail bool) error {
	var e *MyErr // typed nil pointer
	if fail {
		e = &MyErr{}
	}
	return e // BUG: interface is (type=*MyErr, value=nil)
}

func validateFixed(fail bool) error {
	if fail {
		return &MyErr{}
	}
	return nil
}

func main() {
	err := validate(false)
	fmt.Println(err == nil)
	fmt.Printf("%T %v\\n", err, err == (*MyErr)(nil))
	fmt.Println(validateFixed(false) == nil)
}`,
      output: `false
*main.MyErr true
true`,
    },
    walkthrough: [
      { title: "return e", detail: "Converts *MyErr(nil) to error: type word = *MyErr, data = nil." },
      { title: "err == nil", detail: "False, because the type word is set." },
      { title: "Fix", detail: "Return untyped nil so both words are nil." },
    ],
    followUps: [
      { q: "How can you detect a typed nil inside an interface?", a: "Type-assert to the concrete type and compare, or use reflect.ValueOf(x).IsNil() for pointer kinds — but better to avoid creating it." },
      { q: "Does this apply to any, not just error?", a: "Yes, to every interface type." },
    ],
    pitfalls: [
      "Declaring `var err *MyErr` and returning it as error.",
      "Assuming `if err != nil` means the pointer inside is usable.",
    ],
    glossary: [
      { term: "Dynamic type", definition: "The concrete type stored in an interface value." },
      { term: "itab", definition: "Runtime table linking an interface type to a concrete type's methods." },
      { term: "Typed nil", definition: "An interface holding a nil value of a non-nil concrete type." },
    ],
    relatedLessons: ["go/interface-internals-typed-nil", "go/interfaces", "go/errors"],
    relatedQuestions: ["go-16", "go-21"],
    sources: [],
  },

  // ───────────────────────────────────────────── go-16
  {
    id: "go-16",
    track: "go",
    number: 16,
    question: "Value receivers vs pointer receivers: how do you choose, and how do they affect interfaces?",
    level: "intermediate",
    frequency: "high",
    tags: ["methods", "receivers", "method sets", "interfaces"],
    shortAnswer:
      "A value receiver gets a copy, so mutations don't affect the caller; a pointer receiver operates on the original. Use a pointer receiver when the method mutates, when the struct is large, or when it contains things that must not be copied, like a sync.Mutex. Keep receivers consistent per type.\n\nMethod sets matter for interfaces: type T's method set includes only value-receiver methods, while *T's includes both. So if any interface method has a pointer receiver, only `*T` implements the interface. Calling `v.PtrMethod()` on an addressable variable still works because Go takes `&v` automatically, but that convenience doesn't apply to interface satisfaction or to non-addressable values like map elements.",
    deep: [
      {
        type: "table",
        head: ["", "Value receiver `(t T)`", "Pointer receiver `(t *T)`"],
        rows: [
          ["Mutates caller's value", "No (copy)", "Yes"],
          ["In method set of T", "Yes", "No"],
          ["In method set of *T", "Yes", "Yes"],
          ["Callable on nil", "No (nil deref when copying)", "Yes (receiver is nil)"],
        ],
      },
    ],
    example: {
      type: "code",
      lang: "go",
      code: `package main

import "fmt"

type Counter struct{ n int }

func (c Counter) IncValue()    { c.n++ } // copy
func (c *Counter) IncPointer() { c.n++ } // original

type Incrementer interface{ IncPointer() }

func main() {
	c := Counter{}
	c.IncValue()
	fmt.Println(c.n)
	c.IncPointer() // Go takes &c automatically
	fmt.Println(c.n)

	var i Incrementer = &c
	i.IncPointer()
	fmt.Println(c.n)
	// var j Incrementer = c // compile error: method IncPointer has pointer receiver
}`,
      output: `0
1
2`,
    },
    walkthrough: [
      { title: "IncValue", detail: "Increments a copy; c.n stays 0." },
      { title: "IncPointer", detail: "c is addressable, so the call is (&c).IncPointer()." },
      { title: "Interface", detail: "Only *Counter has IncPointer in its method set." },
    ],
    followUps: [
      { q: "Why can't you call a pointer method on a map element `m[k].Inc()`?", a: "Map elements aren't addressable (they can move when the map grows)." },
      { q: "Is a pointer receiver always faster?", a: "No; small structs copy cheaply, and pointers can force heap allocation via escape analysis." },
    ],
    pitfalls: [
      "Mixing receiver kinds on one type.",
      "Value receivers on structs with a mutex.",
      "Expecting a T to satisfy an interface whose methods have pointer receivers.",
    ],
    glossary: [
      { term: "Method set", definition: "The set of methods callable on a type, used for interface satisfaction." },
      { term: "Addressable", definition: "An operand whose address can be taken (variables, pointer derefs, slice elements)." },
    ],
    relatedLessons: ["go/method-sets", "go/structs-methods", "go/interfaces", "go/mutex"],
    relatedQuestions: ["go-15", "go-07"],
    sources: [],
  },

  // ───────────────────────────────────────────── go-17
  {
    id: "go-17",
    track: "go",
    number: 17,
    question: "What is escape analysis? How do you know whether a variable lives on the stack or the heap?",
    level: "advanced",
    frequency: "medium",
    tags: ["escape analysis", "stack", "heap", "performance"],
    shortAnswer:
      "Go doesn't let you choose stack or heap; the compiler decides. Escape analysis proves whether a value can outlive its function or be referenced where the compiler can't track it. If not, it stays on the goroutine's stack, which is essentially free and needs no GC. If it may escape — returned by pointer, stored in a global or heap object, captured by a long-lived closure, converted to an interface in some cases, or too large or of unknown size — it's heap-allocated and later collected.\n\nYou can see the decisions with `go build -gcflags=-m`. Fewer escapes means fewer allocations and less GC pressure, which is what `-benchmem` allocs/op measures.",
    deep: [
      {
        type: "list",
        items: [
          "Returning `&local` is safe in Go (unlike C) precisely because escape analysis moves `local` to the heap.",
          "Common escape causes: storing pointers in interfaces passed to non-inlined functions (e.g. fmt.Println arguments), closures outliving the frame, slices with non-constant size, values over the stack-allocation size limits.",
          "Inlining expands what escape analysis can see — a callee that's inlined may let values stay on the caller's stack.",
        ],
      },
      {
        type: "callout",
        tone: "spec-vs-impl",
        text: "The spec has no notion of stack vs heap (Go FAQ: you don't need to know). Escape decisions are compiler-version specific.",
      },
    ],
    example: {
      type: "code",
      lang: "go",
      code: `package main

import "fmt"

type Point struct{ X, Y int }

func onStack() int {
	p := Point{1, 2} // does not escape
	return p.X + p.Y
}

func toHeap() *Point {
	p := Point{3, 4} // escapes: address outlives the function
	return &p
}

func main() {
	fmt.Println(onStack(), toHeap().X)
}

// $ go build -gcflags=-m
// ./main.go:7:6: can inline onStack
// ./main.go:12:6: can inline toHeap
// ./main.go:13:2: moved to heap: p
// ...`,
      output: `3 3`,
    },
    walkthrough: [
      { title: "onStack", detail: "p never has its address taken beyond the frame — stack." },
      { title: "toHeap", detail: "&p is returned; the compiler reports \"moved to heap: p\"." },
      { title: "-m output", detail: "Also shows inlining decisions and which fmt arguments escape." },
    ],
    followUps: [
      { q: "How would you reduce allocations in a hot path?", a: "Measure with -benchmem and pprof allocs; preallocate slices, avoid interface conversions and pointer-heavy structs, reuse buffers with sync.Pool where justified." },
      { q: "Does `new(T)` always allocate on the heap?", a: "No — if it doesn't escape, it can be stack-allocated just like a local variable." },
    ],
    pitfalls: [
      "Assuming `new` or `&T{}` means heap.",
      "Premature optimization without -gcflags=-m or profiles.",
    ],
    glossary: [
      { term: "Escape analysis", definition: "Compile-time analysis deciding whether a value must be heap-allocated." },
      { term: "Inlining", definition: "Replacing a call with the callee's body, enabling further optimization." },
    ],
    relatedLessons: ["go/escape-analysis", "go/stack-vs-heap", "go/garbage-collection", "go/benchmarking-testing"],
    relatedQuestions: ["go-18", "go-12"],
    sources: [],
  },

  // ───────────────────────────────────────────── go-18
  {
    id: "go-18",
    track: "go",
    number: 18,
    question: "How does Go's garbage collector work? How do you tune it?",
    level: "advanced",
    frequency: "high",
    tags: ["garbage collection", "GOGC", "GOMEMLIMIT", "tri-color", "write barrier"],
    shortAnswer:
      "Go uses a concurrent, tri-color mark-and-sweep collector that is non-generational and non-moving. Marking runs mostly concurrently with your goroutines, with a write barrier keeping it correct and short stop-the-world pauses — typically well under a millisecond — at the start and end of a cycle. Goroutines that allocate quickly are drafted into mark assists, which paces the collector. Sweeping happens lazily afterwards.\n\nTuning: GOGC (default 100) triggers the next cycle when the heap has grown 100% over the live heap from the last cycle; higher means less GC CPU but more memory. GOMEMLIMIT (Go 1.19) sets a soft memory cap so the GC works harder near the limit — useful in containers. The best tuning is allocating less: measure with pprof allocs and gctrace.",
    deep: [
      {
        type: "steps",
        steps: [
          { title: "Sweep termination (STW)", detail: "Brief pause; enable the write barrier." },
          { title: "Concurrent mark", detail: "Scan roots (goroutine stacks, globals), then trace the heap: white = unvisited, grey = found but not scanned, black = scanned. Background workers use ~25% of GOMAXPROCS; allocating goroutines assist." },
          { title: "Mark termination (STW)", detail: "Brief pause; disable the write barrier." },
          { title: "Concurrent sweep", detail: "Free unmarked spans lazily as memory is allocated." },
        ],
      },
      {
        type: "code",
        lang: "text",
        code: `gc 1 @0.022s 3%: 0.29+3.1+0.51 ms clock, 3.5+1.1/5.0/0.81+6.2 ms cpu, 3->4->0 MB, 4 MB goal, 0 MB stacks, 0 MB globals, 12 P`,
        caption: "One line of GODEBUG=gctrace=1: cycle number, % CPU used by GC so far, STW + concurrent + STW wall times, heap before→after→live, next goal.",
      },
      {
        type: "callout",
        tone: "spec-vs-impl",
        text: "Everything here is gc-runtime behaviour. The hybrid write barrier (Go 1.8) removed stack re-scanning; Go 1.25 shipped the \"Green Tea\" GC as an experiment and Go 1.26 enables it by default, improving marking locality for small objects.",
      },
    ],
    example: {
      type: "code",
      lang: "bash",
      code: `GODEBUG=gctrace=1 ./server          # one line per GC cycle on stderr
GOGC=200 ./server                     # fewer cycles, more memory
GOMEMLIMIT=900MiB ./server            # soft cap, e.g. in a 1 GiB container
go tool pprof -sample_index=alloc_space http://localhost:6060/debug/pprof/allocs`,
    },
    walkthrough: [
      { title: "Observe", detail: "gctrace shows frequency, pause times and heap sizes." },
      { title: "Reduce allocations", detail: "allocs profile points at the code generating garbage." },
      { title: "Tune", detail: "GOGC trades memory for CPU; GOMEMLIMIT prevents OOM kills in containers." },
    ],
    followUps: [
      { q: "Why isn't Go's GC generational or compacting?", a: "Escape analysis keeps many short-lived values on the stack, reducing the benefit; a non-moving collector simplifies interop (cgo, unsafe) and keeps pauses low." },
      { q: "What's the danger of GOMEMLIMIT alone with GOGC=off?", a: "If the live heap approaches the limit, the GC runs continuously (death spiral); the runtime caps GC CPU at about 50% to limit this." },
      { q: "What are GC roots in Go?", a: "Goroutine stacks, globals, and runtime-internal references." },
    ],
    pitfalls: [
      "Calling runtime.GC() manually to \"help\".",
      "Ignoring allocation rate and only tweaking GOGC.",
      "Confusing RSS with live heap — freed memory is returned to the OS lazily.",
    ],
    glossary: [
      { term: "Tri-color marking", definition: "Marking algorithm using white/grey/black sets to trace reachable objects." },
      { term: "Write barrier", definition: "Code run on pointer writes during marking so concurrent mutations don't hide live objects." },
      { term: "Mark assist", definition: "Allocating goroutines doing GC work proportionally to their allocation." },
      { term: "GOGC", definition: "Heap growth percentage that triggers the next GC (default 100)." },
      { term: "GOMEMLIMIT", definition: "Soft memory limit for the Go runtime (Go 1.19)." },
    ],
    relatedLessons: ["go/garbage-collection", "go/escape-analysis", "go/profiling-pprof"],
    relatedQuestions: ["go-17"],
    sources: [],
  },

  // ───────────────────────────────────────────── go-19
  {
    id: "go-19",
    track: "go",
    number: 19,
    question: "In what order do deferred calls run, and when are their arguments evaluated?",
    level: "beginner",
    frequency: "very-high",
    tags: ["defer", "evaluation order", "closures", "named results"],
    shortAnswer:
      "Deferred calls run when the surrounding function returns — normally or by panic — in last-in, first-out order. The function value and its arguments are evaluated immediately at the defer statement, but a deferred closure reads variables when it runs, so it sees their final values.\n\nDefers run after the return values are set, so a deferred closure can modify named results; that's how you convert a recovered panic into an error or capture a Close error. They don't run on os.Exit or log.Fatal, and defers in a loop run at function end, not per iteration.",
    deep: [
      {
        type: "list",
        items: [
          "`return x` = assign results → run defers (LIFO) → return to caller.",
          "`defer mu.Unlock()` immediately after `mu.Lock()` is the idiom; the defer covers every exit path, including panics.",
          "Since Go 1.14, most defers are open-coded (inlined at exits) and cost close to nothing; defers in loops use the slower path.",
        ],
      },
      {
        type: "callout",
        tone: "spec-vs-impl",
        text: "Open-coded defers are a compiler optimization; LIFO order and argument evaluation timing are specified.",
      },
    ],
    example: {
      type: "code",
      lang: "go",
      code: `package main

import "fmt"

func double() (n int) {
	defer func() { n *= 2 }()
	return 21
}

func main() {
	for i := 0; i < 3; i++ {
		defer fmt.Println("defer", i)
	}
	x := 10
	defer fmt.Println("x at defer time:", x)
	defer func() { fmt.Println("x in closure:", x) }()
	x = 20
	fmt.Println("double:", double())
}`,
      output: `double: 42
x in closure: 20
x at defer time: 10
defer 2
defer 1
defer 0`,
    },
    walkthrough: [
      { title: "double()", detail: "return 21 sets n=21; the defer doubles it to 42." },
      { title: "Loop defers", detail: "Pushed with i=0,1,2 evaluated." },
      { title: "Println defer", detail: "x evaluated as 10." },
      { title: "Closure defer", detail: "Reads x at run time: 20. LIFO order unwinds." },
    ],
    followUps: [
      { q: "How do you time a function with defer?", a: "`defer func(start time.Time){ log.Println(time.Since(start)) }(time.Now())` — the argument captures the start time immediately." },
      { q: "What's wrong with defer inside a loop that opens files?", a: "All files stay open until the function returns; wrap the loop body in a function." },
    ],
    pitfalls: [
      "Expecting deferred arguments to be evaluated late.",
      "defer resp.Body.Close() before checking err.",
      "Relying on defers with os.Exit.",
    ],
    glossary: [
      { term: "LIFO", definition: "Last in, first out — stack order." },
      { term: "Named result", definition: "A named return parameter that deferred closures can modify." },
    ],
    relatedLessons: ["go/defer", "go/puzzles"],
    relatedQuestions: ["go-20", "go-24"],
    sources: [],
  },

  // ───────────────────────────────────────────── go-20
  {
    id: "go-20",
    track: "go",
    number: 20,
    question: "How do panic and recover work? When should you use them?",
    level: "intermediate",
    frequency: "high",
    tags: ["panic", "recover", "defer", "errors"],
    shortAnswer:
      "panic stops normal execution of the current goroutine and unwinds its stack, running deferred calls. If a deferred function calls recover() directly, the panic stops, recover returns the panic value, and the function containing that defer returns normally — so use named results to return an error. If nothing recovers, the program crashes with the panic value and stack traces.\n\nRecover only works in the same goroutine and only when called directly by a deferred function. Use panics for programmer errors and impossible states; use errors for expected failures. Good places to recover: per-request in servers (net/http does this), per-job in worker pools, and at package boundaries that use panics internally — converting them to errors. Fatal runtime errors such as concurrent map writes, deadlock or stack overflow can't be recovered.",
    deep: [
      {
        type: "list",
        items: [
          "Runtime panics: nil pointer dereference, index out of range, nil map write, integer divide by zero, failed type assertion, send on closed channel.",
          "A panic in a goroutine without its own recover kills the process, regardless of recovers elsewhere.",
          "Since Go 1.21, `panic(nil)` becomes a `*runtime.PanicNilError` so recover never returns nil for a real panic.",
          "When recovering generically, re-panic values you don't expect — e.g. `http.ErrAbortHandler`, which net/http uses as a panic value to abort a handler quietly.",
        ],
      },
    ],
    example: {
      type: "code",
      lang: "go",
      code: `package main

import (
	"errors"
	"fmt"
)

func parse(s string) (n int, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("parse %q: %v", s, r)
		}
	}()
	if s == "" {
		panic("empty input")
	}
	return len(s), nil
}

func main() {
	fmt.Println(parse("go"))
	fmt.Println(parse(""))

	err := func() (err error) {
		defer func() {
			if r := recover(); r != nil {
				err = errors.New("caught")
			}
		}()
		var m map[string]int
		m["x"] = 1 // runtime panic: assignment to entry in nil map
		return nil
	}()
	fmt.Println(err)
}`,
      output: `2 <nil>
0 parse "": empty input
caught`,
    },
    walkthrough: [
      { title: "parse(\"go\")", detail: "No panic; recover returns nil; normal return." },
      { title: "parse(\"\")", detail: "panic unwinds to the deferred closure; recover stops it and sets err; n keeps its zero value." },
      { title: "Runtime panic", detail: "Nil-map write is a recoverable runtime panic (unlike concurrent map writes)." },
    ],
    followUps: [
      { q: "Why does recover() in a helper called from a deferred function return nil?", a: "It must be called directly by the deferred function, not by a function it calls." },
      { q: "Should libraries panic?", a: "Not across their API for ordinary failures; return errors. Panicking on misuse (e.g. regexp.MustCompile) is acceptable and documented." },
    ],
    pitfalls: [
      "Using panic/recover as exceptions for control flow.",
      "Recovering and silently swallowing everything.",
      "Assuming main's recover protects goroutines.",
    ],
    glossary: [
      { term: "Unwinding", definition: "Popping stack frames and running their defers during a panic." },
      { term: "Fatal error", definition: "Unrecoverable runtime failure that terminates the process." },
    ],
    relatedLessons: ["go/defer", "go/errors", "go/goroutines"],
    relatedQuestions: ["go-19", "go-21"],
    sources: [],
  },

  // ───────────────────────────────────────────── go-21
  {
    id: "go-21",
    track: "go",
    number: 21,
    question: "How does error wrapping work? Explain errors.Is, errors.As and %w.",
    level: "intermediate",
    frequency: "high",
    tags: ["errors", "wrapping", "errors.Is", "errors.As", "errors.Join"],
    shortAnswer:
      "Since Go 1.13, `fmt.Errorf(\"context: %w\", err)` creates an error that wraps err, exposing it via Unwrap. `errors.Is(err, target)` walks the wrap chain looking for an error equal to target — typically a sentinel like `fs.ErrNotExist` — and `errors.As(err, &target)` finds the first error assignable to target's type so you can read its fields. Go 1.20 added multiple wrapping: several %w verbs and `errors.Join`, forming a tree. Go 1.26 adds a generic `errors.AsType`.\n\n`%v` formats without wrapping, which is how you deliberately hide implementation errors at API boundaries. Wrapped errors become part of your API contract.",
    deep: [
      {
        type: "list",
        items: [
          "Sentinel errors: package-level values compared by identity (`io.EOF`).",
          "Error types: structs carrying data (`*fs.PathError`), matched with As.",
          "Custom matching: types can define `Is(error) bool` or `As(any) bool`.",
          "Add context describing what *this* layer was doing: `\"load config %s: %w\"`.",
        ],
      },
    ],
    example: {
      type: "code",
      lang: "go",
      code: `package main

import (
	"errors"
	"fmt"
)

var ErrNotFound = errors.New("not found")

type ValidationError struct{ Field string }

func (e *ValidationError) Error() string { return "invalid " + e.Field }

func main() {
	err := fmt.Errorf("GET /users: %w", fmt.Errorf("findUser 7: %w", ErrNotFound))
	fmt.Println(err)
	fmt.Println(errors.Is(err, ErrNotFound), err == ErrNotFound)

	err = fmt.Errorf("create: %w", &ValidationError{Field: "email"})
	var ve *ValidationError
	fmt.Println(errors.As(err, &ve), ve.Field)

	joined := errors.Join(ErrNotFound, err)
	fmt.Println(errors.Is(joined, ErrNotFound))

	fmt.Println(errors.Is(fmt.Errorf("x: %v", ErrNotFound), ErrNotFound))
}`,
      output: `GET /users: findUser 7: not found
true false
true email
true
false`,
    },
    walkthrough: [
      { title: "Two wraps", detail: "Message concatenates; the chain keeps ErrNotFound reachable." },
      { title: "Is vs ==", detail: "== only checks the outermost error." },
      { title: "As", detail: "Sets ve to the wrapped *ValidationError." },
      { title: "%v", detail: "Breaks the chain — Is returns false." },
    ],
    followUps: [
      { q: "When should you not wrap?", a: "When exposing the underlying error would leak implementation details you don't want callers depending on (e.g. a specific DB driver's errors)." },
      { q: "What does errors.Unwrap return for a joined error?", a: "nil — Join's error implements Unwrap() []error; errors.Is/As understand it but errors.Unwrap only handles the single form." },
    ],
    pitfalls: [
      "Comparing with == after wrapping.",
      "Passing a non-pointer target to errors.As (panics).",
      "Logging and returning the same error at every level.",
    ],
    glossary: [
      { term: "Sentinel error", definition: "Exported error variable compared by identity." },
      { term: "Wrap chain", definition: "Sequence (or tree) of errors linked by Unwrap." },
    ],
    relatedLessons: ["go/error-wrapping", "go/errors"],
    relatedQuestions: ["go-15", "go-20"],
    sources: [],
  },

  // ───────────────────────────────────────────── go-22
  {
    id: "go-22",
    track: "go",
    number: 22,
    question: "Design a worker pool in Go. How do you handle results, errors and shutdown?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["worker pool", "channels", "WaitGroup", "context", "backpressure"],
    shortAnswer:
      "Create a jobs channel and a results channel, and start N workers that `range` over jobs and send results. The producer, as the only sender, closes jobs when done. A separate goroutine waits on a WaitGroup for all workers and then closes results, while the consumer ranges over results concurrently.\n\nN is about GOMAXPROCS for CPU-bound work and set by downstream capacity for I/O-bound work. Errors travel inside the result struct, or use errgroup with SetLimit and WithContext to stop on the first error. For cancellation and shutdown, workers select on ctx.Done() both when receiving jobs and when sending results; on shutdown you cancel the producer, let workers drain, and wait with a deadline. Unbuffered or small-buffered jobs give natural backpressure.",
    deep: [
      {
        type: "flow",
        nodes: ["Producer", "jobs (closed by producer)", "N workers", "results (closed after wg.Wait)", "Consumer"],
      },
      {
        type: "list",
        items: [
          "Ordering: results arrive out of order; carry an index or write into a pre-sized slice.",
          "Panics: recover per job inside the worker and convert to an error result.",
          "Alternative: semaphore + goroutine per job, or errgroup.SetLimit — less code for finite batches.",
        ],
      },
    ],
    example: {
      type: "code",
      lang: "go",
      code: `package main

import (
	"fmt"
	"sync"
)

type Job struct{ ID, N int }
type Result struct{ JobID, Square int }

func worker(jobs <-chan Job, results chan<- Result, wg *sync.WaitGroup) {
	defer wg.Done()
	for j := range jobs {
		results <- Result{JobID: j.ID, Square: j.N * j.N}
	}
}

func main() {
	jobs := make(chan Job)
	results := make(chan Result)
	var wg sync.WaitGroup
	for range 3 {
		wg.Add(1)
		go worker(jobs, results, &wg)
	}
	go func() {
		defer close(jobs)
		for i := 1; i <= 10; i++ {
			jobs <- Job{ID: i, N: i}
		}
	}()
	go func() { wg.Wait(); close(results) }()

	sum := 0
	for r := range results {
		sum += r.Square
	}
	fmt.Println("sum =", sum)
}`,
      output: `sum = 385`,
    },
    walkthrough: [
      { title: "Workers", detail: "3 goroutines block on range jobs." },
      { title: "Producer", detail: "Sends 10 jobs then closes jobs." },
      { title: "Closer", detail: "After all workers exit, closes results." },
      { title: "Consumer", detail: "main sums results until the channel closes." },
    ],
    followUps: [
      { q: "What happens if main calls wg.Wait() before ranging over results?", a: "Deadlock: workers block sending on unbuffered results, so they never call Done." },
      { q: "How would you make it stop on the first error?", a: "errgroup.WithContext: the first error cancels the context; producer and workers select on ctx.Done(); g.Wait returns the error." },
      { q: "How do you drain on SIGTERM?", a: "signal.NotifyContext cancels the producer; it closes jobs; workers finish current jobs; wait on wg with a timeout." },
    ],
    pitfalls: [
      "Workers closing results.",
      "No consumer running concurrently.",
      "Unbounded goroutines instead of a pool.",
    ],
    glossary: [
      { term: "Fan-out / fan-in", definition: "Distributing work to many goroutines / merging their outputs." },
      { term: "errgroup", definition: "x/sync helper combining WaitGroup, first error, context cancellation and limits." },
    ],
    relatedLessons: ["go/worker-pool", "go/backpressure-bounded-concurrency", "go/channel-close-range", "go/graceful-shutdown"],
    relatedQuestions: ["go-04", "go-06", "go-23"],
    sources: [],
  },

  // ───────────────────────────────────────────── go-23
  {
    id: "go-23",
    track: "go",
    number: 23,
    question: "How do you implement graceful shutdown for a Go HTTP service?",
    level: "intermediate",
    frequency: "high",
    tags: ["graceful shutdown", "SIGTERM", "http.Server", "Kubernetes"],
    shortAnswer:
      "Turn SIGINT and SIGTERM into context cancellation with `signal.NotifyContext`. Run `srv.ListenAndServe()` in a goroutine and treat `http.ErrServerClosed` as normal. Block on `<-ctx.Done()`, then call `srv.Shutdown(ctxWithTimeout)`: it closes listeners, closes idle connections and waits for active requests up to the deadline, after which you can force `srv.Close()`.\n\nThen drain background workers — cancel producers and wait on WaitGroups — flush logs and metrics, close DB pools, and exit before the orchestrator's SIGKILL. Kubernetes waits 30 seconds by default. In Kubernetes, also fail the readiness probe first so traffic stops arriving.",
    deep: [
      {
        type: "list",
        items: [
          "Shutdown doesn't cancel in-flight requests' contexts; it waits. Hijacked/WebSocket connections aren't tracked — use RegisterOnShutdown.",
          "Call `stop()` from NotifyContext after the first signal so a second Ctrl-C kills immediately.",
          "Containers: make sure the Go binary is PID 1 or behind an init that forwards signals.",
        ],
      },
    ],
    example: {
      type: "code",
      lang: "go",
      code: `ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
defer stop()

srv := &http.Server{Addr: ":8080", Handler: mux}
go func() {
	if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}()

<-ctx.Done()
stop()
shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()
if err := srv.Shutdown(shutdownCtx); err != nil {
	srv.Close() // deadline hit: force
}
// drain workers, flush telemetry, close DB pool`,
    },
    walkthrough: [
      { title: "Signal", detail: "SIGTERM cancels ctx." },
      { title: "Shutdown", detail: "Stops accepting; waits for active requests." },
      { title: "ErrServerClosed", detail: "ListenAndServe returns it immediately — expected." },
      { title: "Cleanup", detail: "Workers, telemetry, pools — all within the grace period." },
    ],
    followUps: [
      { q: "Why might requests still fail during a rolling deploy even with Shutdown?", a: "The load balancer may still route to the pod briefly after SIGTERM; fail readiness and wait a few seconds before Shutdown." },
      { q: "Shutdown vs Close?", a: "Shutdown is graceful; Close drops all connections immediately." },
    ],
    pitfalls: [
      "log.Fatal on ErrServerClosed.",
      "main exiting before Shutdown completes.",
      "Shell-form ENTRYPOINT swallowing SIGTERM.",
    ],
    glossary: [
      { term: "SIGTERM", definition: "Termination request signal sent by orchestrators." },
      { term: "Grace period", definition: "Time between SIGTERM and SIGKILL (Kubernetes default 30 s)." },
    ],
    relatedLessons: ["go/graceful-shutdown", "go/context", "go/worker-pool"],
    relatedQuestions: ["go-11", "go-22"],
    sources: [],
  },

  // ───────────────────────────────────────────── go-24
  {
    id: "go-24",
    track: "go",
    number: 24,
    question: "What changed about for-loop variables in Go 1.22?",
    level: "beginner",
    frequency: "high",
    tags: ["loop variable", "closures", "goroutines", "Go 1.22"],
    shortAnswer:
      "Before Go 1.22, a `for` loop declared one variable shared by all iterations, so closures or goroutines that captured it — or pointers taken to it — all saw the same variable, usually its final value. The classic bug: three goroutines printing \"3 3 3\".\n\nSince Go 1.22, each iteration of 3-clause and range loops gets a fresh variable, so captured values are per-iteration. The change is gated by the `go` version in go.mod: modules declaring go 1.22 or later get the new semantics, older ones keep the old behaviour. The old workaround was `i := i` inside the loop. Go 1.22 also added `range` over integers, and Go 1.23 added range over functions.",
    deep: [
      {
        type: "list",
        items: [
          "Applies to `for i := 0; i < n; i++` and `for i, v := range x` — each iteration's variable is distinct; for the 3-clause form the new variable is initialized from the previous iteration's value before the post statement.",
          "Performance: the compiler only heap-allocates per-iteration variables when they escape; otherwise no cost.",
          "Tooling: `go vet`'s loopclosure check targets pre-1.22 code; the `bisect` tool helped find tests depending on old behaviour.",
        ],
      },
    ],
    example: {
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
			fmt.Println("goroutine", i)
		}()
	}
	wg.Wait()
}`,
      output: `goroutine 2
goroutine 1
goroutine 0`,
      caption: "go.mod with go 1.22+: one line per value, order varies. With go 1.21: typically \"goroutine 3\" three times (and a data race).",
    },
    walkthrough: [
      { title: "Go ≥ 1.22", detail: "Each closure captures its own i: 0, 1, 2 in some order." },
      { title: "Go ≤ 1.21", detail: "All capture the same i, which the loop increments to 3 before the goroutines run." },
      { title: "Gate", detail: "Determined per module by go.mod's go line, not by the toolchain version." },
    ],
    followUps: [
      { q: "Could the change break existing code?", a: "Rarely — code that relied on sharing the variable across iterations. That's why it's gated on the go.mod version." },
      { q: "What did people write before 1.22?", a: "`i := i` to shadow, or pass i as an argument: `go func(i int){...}(i)`." },
    ],
    pitfalls: [
      "Assuming upgrading the toolchain alone changes semantics (go.mod must say 1.22+).",
      "Taking `&v` in a range loop on old modules — all pointers alias one variable.",
    ],
    glossary: [
      { term: "Per-iteration variable", definition: "A loop variable freshly declared for each iteration (Go 1.22+)." },
      { term: "go directive", definition: "The `go` line in go.mod declaring the module's language version." },
    ],
    relatedLessons: ["go/goroutines", "go/control-flow", "go/puzzles"],
    relatedQuestions: ["go-01", "go-19"],
    sources: [],
  },

  // ───────────────────────────────────────────── go-25
  {
    id: "go-25",
    track: "go",
    number: 25,
    question: "What is sync.Once and how is it implemented?",
    level: "intermediate",
    frequency: "medium",
    tags: ["sync.Once", "lazy initialization", "singleton", "atomics"],
    shortAnswer:
      "`once.Do(f)` guarantees f runs exactly once across all goroutines, and every caller blocks until that single call has finished, with its writes visible afterwards. It's the idiomatic lazy initializer and singleton.\n\nThe implementation has a fast path — an atomic load of a done flag — and a slow path that takes a mutex, re-checks done, runs f and sets done atomically. A single compare-and-swap isn't enough, because losers would return before f finished. Edge cases: if f panics, Once still counts it as done; calling Do recursively on the same Once deadlocks; it can't be reset. Go 1.21 added OnceFunc, OnceValue and OnceValues, which cache results and re-panic on every call if f panicked.",
    deep: [
      {
        type: "steps",
        steps: [
          { title: "Fast path", detail: "if done.Load() == 1 { return } — one atomic load after initialization." },
          { title: "Slow path", detail: "Lock; if done == 0 { defer done.Store(1); f() }; Unlock." },
          { title: "Visibility", detail: "The return of f is synchronized before any Do returns (memory model)." },
        ],
      },
      {
        type: "callout",
        tone: "spec-vs-impl",
        text: "The atomic + mutex structure is the current implementation; the documented guarantees are exactly-once and the synchronization rule.",
      },
    ],
    example: {
      type: "code",
      lang: "go",
      code: `package main

import (
	"fmt"
	"sync"
)

func main() {
	getConfig := sync.OnceValue(func() map[string]string { // Go 1.21+
		fmt.Println("loading config")
		return map[string]string{"env": "prod"}
	})
	var wg sync.WaitGroup
	for range 5 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			_ = getConfig()["env"]
		}()
	}
	wg.Wait()
	fmt.Println(getConfig()["env"])
}`,
      output: `loading config
prod`,
    },
    walkthrough: [
      { title: "5 concurrent callers", detail: "One wins the mutex and runs the loader; others wait." },
      { title: "Cached", detail: "Subsequent calls return the stored map via the fast path." },
    ],
    followUps: [
      { q: "How would you allow retry if initialization fails?", a: "Don't use Once; use a mutex with an `initialized` flag set only on success, or OnceValues and recreate on error." },
      { q: "Is package-level `var x = load()` an alternative?", a: "Yes, if eager initialization at startup is acceptable; init runs single-threaded before main." },
    ],
    pitfalls: [
      "Expecting retry after a panic or error.",
      "Recursive Do on the same Once.",
      "Copying a Once after use.",
    ],
    glossary: [
      { term: "Double-checked locking", definition: "Check a flag without the lock, then again under the lock." },
      { term: "OnceValue", definition: "Go 1.21 helper that runs a function once and caches its result." },
    ],
    relatedLessons: ["go/sync-once", "go/atomics"],
    relatedQuestions: ["go-07"],
    sources: [],
  },
];
