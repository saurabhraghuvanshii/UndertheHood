import type { Lesson, SourceRef } from "../types";

/**
 * Go track — modules "go-fundamentals" and "go-runtime-memory".
 * Every Go snippet with an `output` was compiled and run (Go 1.26, linux/amd64);
 * outputs that depend on the runtime version are called out as such.
 */

const notion = (label: string, url: string): SourceRef => ({
  label,
  url,
  kind: "inaccessible",
  note: "Private Notion page — not readable, nothing imported.",
});

const practiceRepo: SourceRef = {
  label: "Learner's Go practice code (language-learning/Go)",
  url: "https://github.com/saurabhraghuvanshii/language-learning/tree/main/Go",
  kind: "original-note",
};

const pgl: SourceRef = {
  label: "Practical Go Lessons (book)",
  url: "https://www.practical-go-lessons.com/",
  kind: "external",
  note: "Companion reading suggested by the learner.",
};

const tour: SourceRef = { label: "A Tour of Go", url: "https://go.dev/tour/", kind: "docs" };

export const lessons: Lesson[] = [
  // ───────────────────────────────────────────────────────────── why-go
  {
    slug: "why-go",
    track: "go",
    title: "Why Go? Isn't JavaScript enough?",
    summary:
      "A fair comparison of Go and JavaScript/Node.js by runtime, concurrency model, type system, performance, memory and deployment — and when Node is the better choice.",
    level: "beginner",
    frequency: "high",
    minutes: 20,
    kinds: ["theory"],
    status: "authored",
    prerequisites: [],
    related: ["nodejs/node-event-loop", "nodejs/v8-internals", "go/goroutines", "go/gmp-scheduler", "go/garbage-collection"],
    tags: ["go", "javascript", "nodejs", "runtime", "concurrency", "comparison"],
    sources: [
      { label: "Go FAQ — Why did you create a new language?", url: "https://go.dev/doc/faq#creating_a_new_language", kind: "docs" },
      { label: "Go at Google: Language Design in the Service of Software Engineering", url: "https://go.dev/talks/2012/splash.article", kind: "docs" },
      { label: "Node.js — The Node.js Event Loop", url: "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick", kind: "docs" },
      { label: "A Guide to the Go Garbage Collector", url: "https://go.dev/doc/gc-guide", kind: "docs" },
      pgl,
      practiceRepo,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain the difference between an ahead-of-time compiled binary with a runtime (Go) and a JIT-compiled VM (V8 in Node.js).",
              "Contrast goroutines on a preemptive M:N scheduler with Node's single-threaded event loop plus worker threads.",
              "Predict which workloads favour Go (CPU-bound, many-core, latency-sensitive services) and which favour Node (I/O glue, full-stack JS, rapid iteration).",
              "Give a balanced, hype-free answer to “why Go?” in an interview.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Both Go and Node.js are great at writing network services. The difference is *how* they get work done. Node is one very fast cook who never waits for the oven: they start something, move on, and come back when a timer rings (the event loop). Go is a kitchen with many cooks and a manager who keeps every stove busy (the scheduler spreading goroutines across all CPU cores).",
          },
          {
            type: "p",
            text: "If most of your time is spent *waiting* (database, other APIs), one cook who never blocks does fine. If the work itself is heavy (parsing, compressing, hashing, computing), more cooks on more stoves win.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "**Go** is a statically typed, compiled language designed at Google (released 2009) for building large, concurrent, networked software. Programs compile ahead of time to a native executable that bundles the Go **runtime** (scheduler, garbage collector, memory allocator). **Node.js** runs JavaScript on the V8 engine, which interprets and then **JIT**-compiles hot code at run time, with **libuv** providing the event loop and a thread pool for some blocking operations.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "Go was created to make large server codebases fast to build, easy to read and simple to deploy: fast compilation, a small language, built-in concurrency, a strong standard library (HTTP, JSON, crypto, testing) and one formatting style (`gofmt`). It is the language behind Docker, Kubernetes, Terraform, Prometheus and many cloud backends.",
          },
        ],
      },
      {
        id: "internals",
        title: "Side-by-side comparison",
        blocks: [
          {
            type: "table",
            head: ["Dimension", "Go", "JavaScript / Node.js"],
            rows: [
              ["Execution", "Ahead-of-time compiled to native machine code; runtime linked into the binary", "Source shipped and run on V8: interpreter (Ignition) + optimizing JIT (TurboFan and others); can deoptimize"],
              ["Startup / warm-up", "Fast startup, peak speed immediately", "Fast startup; peak speed after hot code is JIT-optimized"],
              ["Concurrency", "Goroutines (cheap, growable stacks) multiplexed M:N onto OS threads by a preemptive scheduler; uses all cores by default (`GOMAXPROCS`)", "One JS thread per isolate running an event loop; async I/O via the OS and libuv; CPU parallelism via `worker_threads`, child processes or the cluster module"],
              ["Blocking code", "Fine: a blocked goroutine parks; the scheduler runs others", "Blocks the whole event loop: every request waits"],
              ["Sharing state", "Shared memory + channels/mutexes; data races possible (use `-race`)", "No shared mutable JS state between workers by default (message passing, `SharedArrayBuffer` opt-in)"],
              ["Type system", "Static, structural interfaces, generics (1.18+), checked at compile time", "Dynamic; TypeScript adds static checks that are erased at run time"],
              ["Memory", "Value types (structs, arrays) laid out inline; escape analysis keeps many values on the stack; concurrent non-moving GC", "Almost everything is a heap object with hidden classes; generational moving GC (Orinoco)"],
              ["Deployment", "Single static-ish binary; trivial cross-compile (`GOOS`/`GOARCH`); tiny containers", "Need Node runtime + `node_modules`; bundlers help"],
              ["Ecosystem", "Strong stdlib for servers/infra; fewer frameworks by design", "npm: enormous ecosystem; same language on frontend and backend"],
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Runtime details are implementation, not language",
            text: "Goroutine scheduling, GC algorithm and stack sizes belong to the standard `gc` toolchain's runtime, not the Go spec. Likewise V8's JIT tiers and GC are V8 details, not ECMAScript. Both change between releases.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: one CPU-heavy request",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Request arrives", detail: "Go's `net/http` starts a new goroutine for the connection. Node queues a callback for the event loop." },
              { title: "Handler hashes a 50 MB upload", detail: "In Go, that goroutine occupies one core; other goroutines keep running on other cores (and are preempted fairly since Go 1.14 asynchronous preemption). In Node, the single JS thread is busy: every other request waits until the hash finishes, unless you offloaded it to a worker." },
              { title: "Handler waits on the database", detail: "Both are efficient here: Go parks the goroutine on the netpoller; Node registers a callback and returns to the loop." },
            ],
          },
          {
            type: "code",
            lang: "go",
            caption: "Go: blocking-style code, concurrency by spawning goroutines",
            code: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	results := make([]int, 4)
	for i := range 4 { // each goroutine may run on a different core
		wg.Add(1)
		go func() {
			defer wg.Done()
			sum := 0
			for n := range 1_000_000 {
				sum += n % (i + 2)
			}
			results[i] = sum
		}()
	}
	wg.Wait()
	fmt.Println(results)
}`,
            output: "[500000 999999 1500000 2000000]",
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
              {
                title: "Go tends to win when…",
                points: [
                  "Work is CPU-bound or mixes CPU and I/O (parsers, proxies, encoders, schedulers).",
                  "You need predictable latency and memory under high concurrency.",
                  "You ship CLIs, agents or infrastructure (single binary, easy cross-compilation).",
                  "A large team benefits from one style and a small language.",
                ],
              },
              {
                title: "Node/JS tends to win when…",
                points: [
                  "The service is mostly I/O glue (BFF, API aggregation) and the team already writes TypeScript.",
                  "You want code sharing with the frontend (validation, types, SSR with React/Next.js).",
                  "A specific npm library or framework saves weeks.",
                  "Prototyping speed matters more than per-core efficiency.",
                ],
              },
            ],
          },
          {
            type: "callout",
            tone: "misconception",
            title: "“Go is always faster”",
            text: "For I/O-bound services both can saturate a network link; the database is usually the bottleneck. V8's JIT is very fast for hot numeric loops. Go's advantages show most clearly in multi-core CPU work, memory footprint per connection and tail latency.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Writing Go like Node: wrapping everything in callbacks or channels when plain sequential code inside a goroutine is clearer.",
              "Assuming goroutines remove the need for synchronization — shared memory means data races are possible.",
              "Rewriting a service in Go for speed without profiling first; the bottleneck is often the database or network.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Go compiles to a native binary with a small runtime, so it starts fast and runs at full speed immediately. Its goroutines are scheduled preemptively across all cores, so blocking code and CPU-heavy work don't stall other requests. Node runs JS on one thread per event loop with a JIT, which is excellent for I/O-bound glue code and sharing code with the frontend, but CPU-bound work must be pushed to worker threads. I'd choose Go for infrastructure, high-concurrency or CPU-heavy services, and Node when the team is TypeScript-first and the work is mostly I/O.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "**Scheduling:** Go's G/M/P scheduler runs goroutines (G) on OS threads (M) holding a processor slot (P); `GOMAXPROCS` defaults to the usable CPU count (Go 1.25+ also respects container CPU limits on Linux). Node's loop runs callbacks to completion; nothing preempts a long-running JS function.",
              "**I/O:** both use non-blocking sockets with epoll/kqueue under the hood — Go hides it behind blocking-looking APIs (the netpoller), Node exposes it via callbacks/promises.",
              "**Memory:** Go structs are contiguous values with no per-object header; JS objects carry hidden-class pointers and live on the heap. Go's GC is concurrent and non-moving with short pauses; V8's is generational and compacting.",
              "**Types:** Go types exist at run time (reflection, interface type switches); TypeScript types are erased, so runtime validation needs a library such as zod.",
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
              "Go: AOT-compiled binary + runtime, goroutines on all cores, static types, value semantics, easy deployment.",
              "Node: JIT VM, single-threaded event loop, huge ecosystem, same language as the browser.",
              "Choose by workload and team, not by benchmark headlines.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "AOT compilation", definition: "Ahead-of-time: translating source to machine code before the program runs." },
      { term: "JIT", definition: "Just-in-time compilation: the VM compiles hot code to machine code while the program runs." },
      { term: "Runtime", definition: "Code linked into every Go program that schedules goroutines, allocates memory and runs the GC." },
      { term: "Goroutine", definition: "A function executing concurrently, managed by the Go runtime rather than the OS; starts with a small growable stack." },
      { term: "Event loop", definition: "A loop that takes ready callbacks from queues and runs each to completion on one thread." },
      { term: "M:N scheduling", definition: "Multiplexing M user-level tasks (goroutines) onto N OS threads." },
    ],
    followUps: [
      { q: "Can Node use all CPU cores?", a: "Yes, but explicitly: `worker_threads`, the cluster module or multiple processes behind a load balancer. Each worker has its own isolate and event loop; sharing data means messages or `SharedArrayBuffer`." },
      { q: "Does Go have an event loop?", a: "Internally, yes: the netpoller uses epoll/kqueue/IOCP to know when sockets are ready and wakes the parked goroutines. You just write blocking-style code." },
      { q: "Why doesn't Go need async/await?", a: "Because blocking a goroutine is cheap: the runtime parks it and runs another. There is no need to colour functions as sync vs async." },
    ],
    quiz: [
      {
        id: "why-go-q1",
        prompt: "A Node.js handler runs a 2-second synchronous CPU loop. What happens to other incoming requests?",
        options: ["They run in parallel on other cores automatically", "They wait until the loop finishes", "V8 preempts the loop every 10 ms", "They are rejected with 503"],
        answer: 1,
        explanation: "JS on the event loop runs to completion; nothing preempts it, so other callbacks wait. Offload CPU work to a worker thread.",
      },
      {
        id: "why-go-q2",
        prompt: "Which statement about Go is accurate?",
        options: ["Go code is interpreted by a VM", "Go binaries include a runtime with a garbage collector and scheduler", "Goroutines are OS threads", "Go has no garbage collector"],
        answer: 1,
        explanation: "Go compiles to native code, and the runtime (GC, scheduler, allocator) is linked into the binary. Goroutines are multiplexed onto OS threads.",
      },
    ],
  },

  // ───────────────────────────────────────────────── installation-hello-world
  {
    slug: "installation-hello-world",
    track: "go",
    title: "Installation and Hello World",
    summary: "Install the Go toolchain, create a module and understand what `go run` and `go build` actually do.",
    level: "beginner",
    frequency: "low",
    minutes: 10,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: [],
    related: ["go/tooling-gofmt", "go/packages-modules"],
    tags: ["go", "setup", "toolchain"],
    sources: [
      { label: "Download and install Go", url: "https://go.dev/doc/install", kind: "docs" },
      { label: "Tutorial: Get started with Go", url: "https://go.dev/doc/tutorial/getting-started", kind: "docs" },
      { label: "Go Toolchains", url: "https://go.dev/doc/toolchain", kind: "docs" },
      notion("Notion: Installation", "https://app.notion.com/p/Installation-1a2e9488b51a810a8424c1c5b4bafc77"),
      notion("Notion: Hello World", "https://app.notion.com/p/Hello-world-1a2e9488b51a81c9840bc9b65c082411"),
      practiceRepo,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [{ type: "list", items: ["Install Go and verify it with `go version`.", "Create a module with `go mod init`.", "Know the difference between `go run`, `go build` and `go install`."] }],
      },
      {
        id: "walkthrough",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Install", detail: "Download the installer/tarball from go.dev/dl (or use your package manager). The toolchain lives in `GOROOT` (e.g. `/usr/local/go`); add its `bin` to `PATH`." },
              { title: "Verify", detail: "`go version` prints the toolchain version; `go env` shows settings such as `GOPATH`, `GOOS`, `GOARCH`, `GOPROXY`." },
              { title: "Create a module", detail: "`mkdir hello && cd hello && go mod init example.com/hello` writes a `go.mod` naming the module and the minimum Go version." },
              { title: "Write main.go and run", detail: "`go run .` compiles to a temporary binary and runs it; `go build` writes the binary to disk." },
            ],
          },
          {
            type: "code",
            lang: "go",
            caption: "main.go",
            code: `package main

import "fmt"

func main() {
	fmt.Println("Hello, World!")
}`,
            output: "Hello, World!",
          },
          {
            type: "code",
            lang: "bash",
            code: `go mod init example.com/hello   # creates go.mod
go run .                         # compile to a temp dir and run
go build -o hello .              # produce ./hello
GOOS=linux GOARCH=arm64 go build -o hello-arm64 .   # cross-compile
go install example.com/tool@latest                   # build a tool into $GOPATH/bin`,
          },
        ],
      },
      {
        id: "definition",
        title: "What the pieces mean",
        blocks: [
          {
            type: "list",
            items: [
              "`package main` + `func main()` = an executable. Any other package name builds a library.",
              "`import \"fmt\"` pulls in the standard formatting package; unused imports are compile errors.",
              "`GOPATH` (default `~/go`) now mainly holds the module cache (`pkg/mod`) and installed binaries (`bin`); your code can live anywhere since modules (Go 1.11+, default since 1.16).",
              "Since Go 1.21 the `go` line in `go.mod` is a minimum requirement, and the `go` command can download a newer toolchain automatically (`GOTOOLCHAIN`).",
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
              "Running `go run main.go` in a multi-file package — only that file is compiled. Use `go run .`.",
              "Forgetting `go mod init`, then getting “go: cannot find main module”.",
              "Expecting a tiny binary: Go binaries include the runtime (~1–2 MB minimum). `-ldflags=\"-s -w\"` strips symbol/debug info.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [{ type: "p", text: "`go build` compiles a package and its dependencies into one native executable that statically links Go code and the runtime (cgo may add dynamic libc linking; `CGO_ENABLED=0` avoids it). Cross-compiling is just setting `GOOS` and `GOARCH`. `go run` does the same into a temp directory and executes it." }],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: ["Install, `go version`, `go mod init`, `go run .`.", "`package main` with `func main` is the entry point.", "Binaries are self-contained and cross-compile easily."] }],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── tooling-gofmt
  {
    slug: "tooling-gofmt",
    track: "go",
    title: "Tooling: gofmt, vet and the go command",
    summary: "Go ships one formatter and a batteries-included toolchain: gofmt, go vet, go test, go doc and friends.",
    level: "beginner",
    frequency: "low",
    minutes: 10,
    kinds: ["theory"],
    status: "authored",
    prerequisites: ["go/installation-hello-world"],
    related: ["go/benchmarking-testing", "go/race-detector", "go/profiling-pprof"],
    tags: ["go", "tooling", "gofmt", "vet"],
    sources: [
      { label: "gofmt command", url: "https://pkg.go.dev/cmd/gofmt", kind: "docs" },
      { label: "go vet command", url: "https://pkg.go.dev/cmd/vet", kind: "docs" },
      { label: "The go command", url: "https://pkg.go.dev/cmd/go", kind: "docs" },
      { label: "go fmt your code (Go blog)", url: "https://go.dev/blog/gofmt", kind: "docs" },
      notion("Notion: Automatic formatting", "https://app.notion.com/p/Automatic-formatting-1a2e9488b51a81438f3ef30e065ba9c5"),
    ],
    sections: [
      {
        id: "objectives",
        blocks: [{ type: "list", items: ["Format code with `gofmt`/`goimports` and know why there are no style debates.", "Catch suspicious code with `go vet`.", "Know the everyday `go` subcommands."] }],
      },
      {
        id: "intuition",
        blocks: [{ type: "p", text: "Go settles formatting by tool, not by discussion. `gofmt` parses your code and prints it back in the one canonical layout (tabs for indentation, aligned comments and fields). Because every Go file looks the same, diffs are smaller and code reviews focus on behaviour." }],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "table",
            head: ["Command", "What it does"],
            rows: [
              ["`gofmt -l -w .`", "List and rewrite files that aren't canonically formatted (`go fmt ./...` runs `gofmt -l -w` on packages)"],
              ["`goimports -w .`", "gofmt + add/remove imports (golang.org/x/tools; what most editors run on save via gopls)"],
              ["`go vet ./...`", "Static checks: Printf verb/arg mismatches, copying locks, unreachable code, struct-tag typos, loop-closure issues…"],
              ["`go test ./...`", "Run tests, benchmarks (`-bench`), fuzzing (`-fuzz`), race detector (`-race`), coverage (`-cover`)"],
              ["`go doc fmt.Println`", "Print documentation from source"],
              ["`go mod tidy`", "Add missing and remove unused module requirements"],
              ["`go build -gcflags=-m`", "Show compiler decisions such as inlining and escape analysis"],
            ],
          },
          {
            type: "callout",
            tone: "tip",
            title: "Beyond the standard toolchain",
            text: "`staticcheck` and `golangci-lint` (an aggregator of many linters) catch more bugs than `go vet`. `gopls` is the official language server used by editors.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [{ type: "list", items: ["Fighting gofmt with editor settings — let it run on save.", "Skipping `go vet`; `go test` runs a subset of vet checks automatically, but not all.", "Committing without `go mod tidy`, leaving stale requirements in `go.mod`."] }],
      },
      {
        id: "interview-short",
        blocks: [{ type: "p", text: "`gofmt` enforces a single canonical format, so style isn't debated. `go vet` reports suspicious constructs that compile but are likely bugs, like Printf mismatches or copied mutexes. The `go` command bundles building, testing, benchmarking, fuzzing, race detection, profiling hooks and dependency management, so most projects need no external build tool." }],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: ["gofmt/goimports on save.", "go vet + staticcheck in CI.", "One `go` command for build, test, mod, doc."] }],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────── packages-modules
  {
    slug: "packages-modules",
    track: "go",
    title: "Packages and modules",
    summary: "A package is a directory of files compiled together; a module is a versioned tree of packages described by go.mod.",
    level: "beginner",
    frequency: "medium",
    minutes: 15,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/installation-hello-world"],
    related: ["go/external-modules", "go/tooling-gofmt"],
    tags: ["go", "packages", "modules", "visibility", "init"],
    sources: [
      { label: "How to Write Go Code", url: "https://go.dev/doc/code", kind: "docs" },
      { label: "Go Modules Reference", url: "https://go.dev/ref/mod", kind: "docs" },
      { label: "Spec — Package initialization", url: "https://go.dev/ref/spec#Package_initialization", kind: "docs" },
      notion("Notion: Using packages", "https://app.notion.com/p/Using-packages-1a2e9488b51a819f8d20c3aff0dbca60"),
      notion("Notion: Modules in Go", "https://app.notion.com/p/Modules-in-go-1a2e9488b51a814088f9c7d72140de4f"),
      pgl,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [{ type: "list", items: ["Distinguish package, module and import path.", "Use capitalization to export identifiers.", "Use `internal/` to restrict imports and understand `init()` order."] }],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "list",
            items: [
              "**Package**: all `.go` files in one directory sharing a `package` clause. It is the unit of compilation and encapsulation.",
              "**Module**: a tree of packages with a `go.mod` at its root declaring the module path, Go version and dependencies.",
              "**Import path**: module path + subdirectory, e.g. `example.com/shop/internal/cart`.",
              "**Exported**: an identifier starting with an uppercase letter (`Cart`, `Total`) is visible to other packages; lowercase (`cart`, `total`) is package-private.",
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
            caption: "A typical layout",
            code: `shop/
├── go.mod                 module example.com/shop
├── cmd/api/main.go        package main  (the executable)
├── internal/cart/cart.go  package cart  (importable only inside shop/)
└── money/money.go         package money (importable by anyone)`,
          },
          {
            type: "code",
            lang: "go",
            caption: "money/money.go",
            code: `package money

import "fmt"

// Cents is exported; format is not.
type Cents int64

func (c Cents) String() string { return format(int64(c)) }

func format(v int64) string { return fmt.Sprintf("$%d.%02d", v/100, v%100) }`,
          },
        ],
      },
      {
        id: "internals",
        title: "Initialization order",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Dependencies first", detail: "Imported packages are fully initialized before the importing package; each package is initialized once even if imported many times." },
              { title: "Package-level variables", detail: "Initialized in dependency order (a var that uses another is initialized after it), otherwise declaration order." },
              { title: "init() functions", detail: "Each file may have several `func init()`; they run after the package's variables, in the order the files are presented to the compiler (sorted by name by the go command)." },
              { title: "main()", detail: "Runs last, in package main." },
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
              "Two packages importing each other — Go forbids import cycles; extract the shared part into a third package.",
              "Heavy work or network calls in `init()` — it slows startup and can't return errors. Prefer explicit constructors.",
              "Package names like `utils`/`common`; Go style favours short, specific names (`money`, `cart`) because call sites read `money.Cents`.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [{ type: "p", text: "A package is a directory compiled as a unit; capitalized identifiers are exported. A module is a versioned collection of packages defined by `go.mod`, with `go.sum` recording checksums. `internal/` directories can only be imported from within the tree rooted at their parent, which lets you hide implementation packages. Packages initialize dependencies first, then variables, then `init()` functions, then `main`." }],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: ["Directory = package; go.mod root = module.", "Uppercase = exported.", "`internal/` restricts importers.", "No import cycles; keep `init` light."] }],
      },
    ],
    glossary: [
      { term: "go.mod", definition: "File at a module's root declaring its path, Go version and dependency requirements." },
      { term: "go.sum", definition: "Cryptographic checksums of module versions, used to verify downloads." },
    ],
  },

  // ─────────────────────────────────────────────────────── variables-constants
  {
    slug: "variables-constants",
    track: "go",
    title: "Variables, constants and zero values",
    summary: "`var`, `:=`, zero values, untyped constants and explicit conversions — Go's small but strict basic type rules.",
    level: "beginner",
    frequency: "medium",
    minutes: 12,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/installation-hello-world"],
    related: ["go/enums-iota", "go/control-flow", "go/pointers"],
    tags: ["go", "variables", "constants", "types", "zero-value"],
    sources: [
      { label: "Spec — Constants", url: "https://go.dev/ref/spec#Constants", kind: "docs" },
      { label: "Spec — The zero value", url: "https://go.dev/ref/spec#The_zero_value", kind: "docs" },
      { label: "Constants (Go blog)", url: "https://go.dev/blog/constants", kind: "docs" },
      notion("Notion: Variables and Constants", "https://app.notion.com/p/Variables-and-Constants-1a2e9488b51a81b9a749f507afdfc1e5"),
      practiceRepo,
      tour,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [{ type: "list", items: ["Declare variables with `var` and `:=`.", "Predict zero values for every type.", "Explain untyped constants and why Go never converts types implicitly."] }],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "list",
            items: [
              "`var x int` declares with an explicit type; `x := 42` declares and infers the type (only inside functions).",
              "Every variable starts at its **zero value**: `0`, `0.0`, `false`, `\"\"`, and `nil` for pointers, slices, maps, channels, functions and interfaces. Structs/arrays are zeroed field-by-field.",
              "`const` values are computed at compile time. An **untyped constant** (`const big = 1 << 100`) has arbitrary precision and takes on a type only when used.",
              "There are no implicit numeric conversions: `float64(x)` is required to mix `int` and `float64`.",
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

import "fmt"

const Pi = 3.14159

func main() {
	var a int
	var s string
	var p *int
	b := 42
	var c, d = 1.5, "go"
	fmt.Println(a, s == "", p == nil, b, c, d)
	fmt.Printf("%T %T\\n", b, c)

	const big = 1 << 100 // untyped constant: arbitrary precision at compile time
	fmt.Println(big >> 98)

	var f float32 = Pi // untyped constant adapts to float32
	x := 10
	y := float64(x) / 4 // explicit conversion required
	fmt.Println(f, y)
}`,
            output: `0 true true 42 1.5 go
int float64
4
3.14159 2.5`,
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "`:=` needs at least one *new* variable on the left; in an inner scope it creates a new variable that **shadows** the outer one (linters such as the `shadow` analyzer can flag this).",
              "Unused local variables are compile errors; unused package-level variables are not.",
              "Integer overflow on typed values wraps silently at run time (`int8(127) + 1` computed at run time is `-128`), but constant overflow is a compile error.",
              "`int` is 64 bits on 64-bit platforms and 32 bits on 32-bit platforms.",
            ],
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [{ type: "list", items: ["Shadowing `err` inside an `if` block with `:=` and then checking the outer, still-nil `err`.", "Expecting `x / 4` with `int x` to give a fraction — integer division truncates."] }],
      },
      {
        id: "interview-short",
        blocks: [{ type: "p", text: "Go variables are always initialized to a zero value, so there's no undefined state; good APIs make the zero value useful (`sync.Mutex`, `bytes.Buffer`). Constants are compile-time, and untyped constants have arbitrary precision until assigned. Go never converts between numeric types implicitly — you write the conversion." }],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: ["`var` vs `:=`.", "Zero values everywhere; `nil` for reference-like types.", "Untyped constants; explicit conversions."] }],
      },
    ],
    glossary: [
      { term: "Zero value", definition: "The value a variable has when declared without an initializer." },
      { term: "Untyped constant", definition: "A compile-time constant without a fixed type; it gets a type from context (default type if none)." },
      { term: "Shadowing", definition: "Declaring a variable in an inner scope with the same name as one in an outer scope, hiding it." },
    ],
  },
  // ─────────────────────────────────────────────────────────────── control-flow
  {
    slug: "control-flow",
    track: "go",
    title: "Control flow: for, if, switch",
    summary: "Go has one loop keyword (`for`), `if` with an init statement, `switch` without fall-through, labels — and per-iteration loop variables since Go 1.22.",
    level: "beginner",
    frequency: "medium",
    minutes: 15,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/variables-constants"],
    related: ["go/functions", "go/goroutines", "go/defer"],
    tags: ["go", "for", "switch", "range", "loopvar"],
    sources: [
      { label: "Spec — Statements", url: "https://go.dev/ref/spec#Statements", kind: "docs" },
      { label: "Fixing For Loops in Go 1.22 (Go blog)", url: "https://go.dev/blog/loopvar-preview", kind: "docs" },
      { label: "Go 1.22 release notes", url: "https://go.dev/doc/go1.22", kind: "docs" },
      notion("Notion: Loops, if-else, switch", "https://app.notion.com/p/Loops-if-else-switch-1a2e9488b51a818a8eddd08ff8f0e712"),
      practiceRepo,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [{ type: "list", items: ["Write every loop shape with `for` and `range`.", "Use `if`/`switch` init statements and know that `switch` doesn't fall through.", "Explain the Go 1.22 loop-variable change."] }],
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
	for i := 0; i < 3; i++ {
		fmt.Print(i, " ")
	}
	fmt.Println()

	n := 1
	for n < 100 { // "while" loop
		n *= 3
	}
	fmt.Println(n)

	for i, r := range "héllo" { // i is a byte index, r is a rune
		if r == 'l' {
			continue
		}
		fmt.Print(i, ":", string(r), " ")
	}
	fmt.Println()

	if rem := n % 7; rem == 0 {
		fmt.Println("divisible")
	} else {
		fmt.Println("remainder", rem)
	}

	switch day := 6; {
	case day == 0 || day == 6:
		fmt.Println("weekend")
	default:
		fmt.Println("weekday")
	}

	switch 2 {
	case 1:
		fmt.Println("one")
	case 2:
		fmt.Println("two")
		fallthrough
	case 3:
		fmt.Println("three")
	case 4:
		fmt.Println("four")
	}

outer:
	for i := range 3 { // range over int: Go 1.22+
		for j := range 3 {
			if j == 2 {
				continue outer
			}
			if i == 2 {
				break outer
			}
			fmt.Print(i, j, " ")
		}
	}
	fmt.Println()
}`,
            output: `0 1 2
243
0:h 1:é 5:o
remainder 5
weekend
two
three
0 0 0 1 1 0 1 1 `,
          },
          {
            type: "callout",
            tone: "note",
            title: "Why the index jumps from 1 to 5",
            text: "Ranging over a string decodes UTF-8: `é` takes two bytes (indices 1–2), so the next rune starts at byte 3. Index 3 and 4 are the two `l`s we skipped.",
          },
        ],
      },
      {
        id: "internals",
        title: "Loop variables: Go 1.22 per-iteration semantics",
        blocks: [
          {
            type: "p",
            text: "Before Go 1.22, a `for` loop declared its variables **once** and reused them every iteration. Closures or goroutines that captured `i` all saw the same variable, which ended at its final value. Since Go 1.22, each iteration gets a **fresh** variable (applies to modules whose `go.mod` says `go 1.22` or later).",
          },
          {
            type: "code",
            lang: "go",
            code: `package main

import "fmt"

func main() {
	var prints []func()
	for i := 0; i < 3; i++ {
		prints = append(prints, func() { fmt.Print(i, " ") })
	}
	for _, p := range prints {
		p()
	}
	fmt.Println()
}`,
            output: "0 1 2 ",
            caption: "With `go 1.22`+ in go.mod. With `go 1.21` or earlier in go.mod the same code prints `3 3 3`.",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "The semantics are chosen per module by the `go` line in `go.mod`, not by the installed toolchain. The compiler only actually allocates a separate variable per iteration when it is captured and escapes; otherwise the cost is zero.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Expecting C-style fall-through in `switch`; Go breaks automatically. Use `fallthrough` explicitly (rare) or list values: `case 1, 2, 3:`.",
              "`break` inside a `switch` or `select` within a loop only exits the switch — use a label to exit the loop.",
              "Modifying the range variable expecting to change the slice: `for _, v := range s { v *= 2 }` edits a copy. Use `s[i] *= 2`.",
              "Reading old code/blog posts that copy `i := i` inside loops — it is unnecessary in Go 1.22+ modules.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [{ type: "p", text: "Go has only `for` (three-clause, condition-only, infinite, and `range`). `if` and `switch` accept an init statement scoped to the block. `switch` cases don't fall through unless you write `fallthrough`, and a tagless switch is a clean if-else chain. Since Go 1.22 loop variables are per-iteration, fixing the classic closure/goroutine capture bug; Go 1.22 also added `range` over integers, and Go 1.23 over iterator functions." }],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: ["One loop keyword: `for`.", "`range` gives index/value (byte index + rune for strings).", "No implicit fall-through; labels for nested breaks.", "Per-iteration loop variables since Go 1.22."] }],
      },
    ],
    glossary: [
      { term: "Rune", definition: "An `int32` holding a Unicode code point." },
      { term: "Label", definition: "An identifier before a statement that `break`/`continue`/`goto` can target." },
    ],
    quiz: [
      {
        id: "control-flow-q1",
        prompt: "In a Go 1.22+ module, what does this print?",
        code: { lang: "go", code: `var fs []func()
for i := range 3 {
	fs = append(fs, func() { fmt.Print(i) })
}
for _, f := range fs {
	f()
}` },
        options: ["333", "012", "222", "Compile error"],
        answer: 1,
        explanation: "Each iteration has its own `i` since Go 1.22, so each closure captures a different variable.",
      },
      {
        id: "control-flow-q2",
        prompt: "What does `break` do inside a `switch` that sits inside a `for` loop?",
        options: ["Exits the loop", "Exits only the switch", "Compile error", "Skips to the next iteration"],
        answer: 1,
        explanation: "`break` targets the innermost `for`, `switch` or `select`. Use a labeled break to leave the loop.",
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────── arrays
  {
    slug: "arrays",
    track: "go",
    title: "Arrays: fixed size, value semantics",
    summary: "A Go array's length is part of its type, and assigning or passing an array copies every element.",
    level: "beginner",
    frequency: "medium",
    minutes: 10,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/variables-constants"],
    related: ["go/slices-internals", "go/pointers"],
    tags: ["go", "arrays", "value-semantics"],
    sources: [
      { label: "Spec — Array types", url: "https://go.dev/ref/spec#Array_types", kind: "docs" },
      { label: "Go Slices: usage and internals (Go blog)", url: "https://go.dev/blog/slices-intro", kind: "docs" },
      notion("Notion: Arrays, slices and maps", "https://app.notion.com/p/Arrays-slices-and-maps-1a2e9488b51a81ecbb1de20901e6dd51"),
      pgl,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [{ type: "list", items: ["Declare arrays and explain why `[3]int` and `[4]int` are different types.", "Predict copying behaviour on assignment and function calls.", "Know when arrays are actually useful (keys, fixed buffers, backing stores of slices)."] }],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "An array `[N]T` is N values of type T stored **contiguously**. The length N is a compile-time constant and part of the type. Arrays are **values**: `b := a` copies all elements, and arrays of comparable elements can be compared with `==` and used as map keys.",
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

import "fmt"

func double(a [3]int) { // receives a copy
	for i := range a {
		a[i] *= 2
	}
}

func doublePtr(a *[3]int) {
	for i := range a {
		a[i] *= 2
	}
}

func main() {
	a := [3]int{1, 2, 3}
	b := a // copies all 3 elements
	b[0] = 100
	fmt.Println(a, b, a == [3]int{1, 2, 3})

	c := [...]string{"x", "y"} // length inferred
	fmt.Printf("%T %d\\n", c, len(c))

	double(a)
	fmt.Println(a)
	doublePtr(&a)
	fmt.Println(a)

	var grid [2][3]int
	grid[1][2] = 7
	fmt.Println(grid)
}`,
            output: `[1 2 3] [100 2 3] true
[2]string 2
[1 2 3]
[2 4 6]
[[0 0 0] [0 0 7]]`,
          },
          { type: "viz", id: "go-slices", caption: "Every slice points into an array like these — the next lesson builds on it." },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "list",
            items: [
              "**Use arrays** for fixed-size data: hashes (`[32]byte` from `sha256.Sum256`), IPv4 addresses, small lookup tables, composite map keys.",
              "**Use slices** for almost everything else — they are views over arrays that can grow.",
              "Passing a large array by value copies it; pass a pointer or a slice instead.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [{ type: "p", text: "Arrays have a fixed length that's part of their type and they have value semantics — assignment and parameter passing copy the whole array. That's unlike JavaScript arrays or Go slices. In practice we use slices, which are descriptors pointing into an underlying array." }],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: ["`[N]T`: length is part of the type.", "Copied on assignment/call; comparable with `==`.", "The backing store of every slice."] }],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────── slices-internals
  {
    slug: "slices-internals",
    track: "go",
    title: "Slices: header, backing array, append growth",
    summary:
      "A slice is a small header (pointer, length, capacity) over a backing array. Understanding that header explains aliasing bugs, append growth and hidden memory retention.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 30,
    kinds: ["theory", "visualization", "coding"],
    status: "authored",
    prerequisites: ["go/arrays"],
    related: ["go/maps", "go/escape-analysis", "go/garbage-collection", "go/pointers"],
    tags: ["go", "slices", "append", "capacity", "aliasing", "memory"],
    sources: [
      { label: "Go Slices: usage and internals (Go blog)", url: "https://go.dev/blog/slices-intro", kind: "docs" },
      { label: "Arrays, slices (and strings): The mechanics of 'append' (Go blog)", url: "https://go.dev/blog/slices", kind: "docs" },
      { label: "Spec — Slice expressions", url: "https://go.dev/ref/spec#Slice_expressions", kind: "docs" },
      { label: "runtime/slice.go (growslice, nextslicecap)", url: "https://github.com/golang/go/blob/master/src/runtime/slice.go", kind: "docs" },
      { label: "Package slices", url: "https://pkg.go.dev/slices", kind: "docs" },
      notion("Notion: Arrays, slices and maps", "https://app.notion.com/p/Arrays-slices-and-maps-1a2e9488b51a81ecbb1de20901e6dd51"),
      pgl,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Describe the slice header and draw it next to its backing array.",
              "Predict when two slices alias the same memory and when `append` reallocates.",
              "Explain the Go 1.18+ growth formula and why observed capacities don't follow it exactly.",
              "Use the full slice expression `s[a:b:c]`, `copy` and `slices.Clone` to avoid aliasing and memory retention.",
            ],
          },
        ],
      },
      { id: "prerequisites", blocks: [{ type: "p", text: "Know [arrays](/paths/go/arrays): fixed-size, contiguous, copied by value." }] },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Think of a backing array as a long bookshelf and a slice as a sticky note that says “start at shelf 3, I'm using 2 books, and there's room for 4”. Copying the sticky note is cheap and both notes describe the *same* shelf. Writing through one note changes the books the other note sees.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "A slice value `[]T` is a three-word **header**: a pointer to an element of a backing array, a **length** (elements you can index, `len(s)`) and a **capacity** (elements from the pointer to the end of the backing array, `cap(s)`). Slicing `s[low:high]` produces a new header over the same array; it never copies elements.",
          },
          {
            type: "code",
            lang: "go",
            caption: "Conceptual layout (runtime's `slice` struct; 24 bytes on 64-bit)",
            code: `type slice struct {
	array unsafe.Pointer // points at the first visible element
	len   int
	cap   int
}`,
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "Passing a slice is as cheap as passing three integers, no matter how many elements it covers, and sub-slicing is O(1). The cost of that design is that copies of a header **share** data — the root of most slice bugs.",
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "append with spare capacity", detail: "If `len(s) < cap(s)`, append writes into the existing backing array and returns a header with `len+1`. Every other slice over that region sees the write." },
              { title: "append beyond capacity", detail: "The runtime (`growslice`) allocates a bigger array, copies the old elements, and returns a header pointing to the new array. Old headers still point at the old array." },
              { title: "Choosing the new capacity (Go 1.18+)", detail: "If the needed length is more than double the old cap, use the needed length. Otherwise, below a threshold of 256 elements, **double**. Above it, grow by `newcap += (newcap + 3*256) / 4` repeatedly — i.e. about 1.25× + 192 — which transitions smoothly from 2× toward 1.25× for large slices." },
              { title: "Round up to a size class", detail: "The byte size is rounded up to the allocator's next **size class**, and the capacity is recomputed from that. That's why observed capacities (e.g. 848 instead of 832) don't match the formula exactly." },
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Growth is an implementation detail",
            text: "The spec only says append allocates a sufficiently large new array when needed. The 2× / 256-element threshold / ~1.25× formula is the `gc` runtime since Go 1.18 (before that: 2× below 1024 elements, then 1.25×). Size classes depend on element size and allocator; never write code that depends on exact capacities.",
          },
          {
            type: "code",
            lang: "go",
            caption: "Watching capacity grow",
            code: `package main

import "fmt"

func main() {
	var s []int
	prev := -1
	for i := 0; i < 2000; i++ {
		s = append(s, i)
		if cap(s) != prev {
			fmt.Print(cap(s), " ")
			prev = cap(s)
		}
	}
	fmt.Println()
}`,
            output: "4 8 16 32 64 128 256 512 848 1280 1792 2560 ",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Reading that output (Go 1.26, linux/amd64)",
            text: "It starts at 4, not 1, because recent compilers can give a non-escaping, appended-to slice a small 32-byte stack buffer first; older versions print `1 2 4 8 …`. From 512 the formula gives 512 + (512+768)/4 = 832, and 832×8 bytes rounds up to the 6784-byte size class = 848 ints.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: aliasing step by step",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import "fmt"

func main() {
	arr := [5]int{0, 1, 2, 3, 4}
	s := arr[1:3]
	fmt.Println(s, len(s), cap(s))

	s[0] = 100 // writes through to arr
	fmt.Println(arr)

	s = append(s, 99) // fits in cap: overwrites arr[3]!
	fmt.Println(arr, s)

	t := arr[1:3:3]  // full slice expression: cap limited to 2
	t = append(t, 7) // exceeds cap: new backing array
	t[0] = -1
	fmt.Println(arr, t)
}`,
            output: `[1 2] 2 4
[0 100 2 3 4]
[0 100 2 99 4] [100 2 99]
[0 100 2 99 4] [-1 2 7]`,
          },
          {
            type: "steps",
            steps: [
              { title: "s := arr[1:3]", detail: "Header {ptr=&arr[1], len=2, cap=4}. Capacity runs to the end of arr." },
              { title: "s[0] = 100", detail: "Writes arr[1]." },
              { title: "append(s, 99)", detail: "len 2 < cap 4, so it writes arr[3] in place — silently clobbering data the array owner may care about." },
              { title: "t := arr[1:3:3]", detail: "Full slice expression `[low:high:max]` sets cap = max−low = 2." },
              { title: "append(t, 7)", detail: "len == cap, so a new array is allocated; t no longer aliases arr and `t[0] = -1` leaves arr alone." },
            ],
          },
        ],
      },
      { id: "visualization", blocks: [{ type: "viz", id: "go-slices", caption: "Step through slicing, appending within capacity, and reallocation." }] },
      {
        id: "memory",
        title: "Memory retention",
        blocks: [
          {
            type: "p",
            text: "A small sub-slice keeps the **entire** backing array alive, because the GC sees the pointer into it. Reading a 100 MB file and keeping `data[:16]` as a header keeps 100 MB reachable.",
          },
          {
            type: "code",
            lang: "go",
            code: `// BAD: retains the whole file
func header(data []byte) []byte { return data[:16] }

// GOOD: copy what you keep; the big array becomes garbage
func headerCopy(data []byte) []byte {
	out := make([]byte, 16)
	copy(out, data[:16])
	return out // or: slices.Clone(data[:16])
}`,
          },
          {
            type: "p",
            text: "The same applies to slices of pointers: after `s = s[:len(s)-1]`, the removed element is still referenced by the backing array. Set it to `nil`/zero first (the `slices.Delete` family does this since Go 1.22).",
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "go",
            caption: "Two appends, one backing array — and what a function can't change",
            code: `package main

import "fmt"

func addOne(s []int) {
	s[0] = 42        // visible to caller: shared backing array
	s = append(s, 1) // invisible to caller: only the local header changes
}

func main() {
	a := make([]int, 3, 10)
	b := append(a, 1)
	c := append(a, 2) // same backing array as b!
	fmt.Println(b[3], c[3])

	x := []int{0, 0, 0}
	addOne(x)
	fmt.Println(x, len(x))

	var nilS []int
	empty := []int{}
	fmt.Println(nilS == nil, empty == nil, len(nilS), len(empty))
}`,
            output: `2 2
[42 0 0] 3
true false 0 0`,
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**nil vs empty**: both have len 0 and work with `append`/`range`, but `encoding/json` marshals nil as `null` and empty as `[]`.",
              "Slices are not comparable with `==` (except to `nil`); use `slices.Equal`.",
              "Indexing beyond `len` panics even if within `cap`; re-slice `s[:cap(s)]` to extend the view.",
              "Strings are immutable byte sequences with a two-word header; `[]byte(str)` copies (the compiler can avoid the copy in some cases).",
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
              "Ignoring append's return value (`append(s, x)` alone doesn't compile — but `t := append(s, x)` and then using `s` is a common logic bug).",
              "Appending to a slice you received from a caller, overwriting their data beyond `len`. Return a new slice or use `s[:len(s):len(s)]` before appending.",
              "Not preallocating: `make([]T, 0, n)` avoids repeated growth when n is known.",
              "Using `make([]int, n)` and then `append` — you get n zeros followed by your values.",
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
              { title: "Share (sub-slice)", points: ["O(1), zero allocation", "Aliasing: writes and appends can leak across", "Can retain large arrays"] },
              { title: "Copy (`copy`, `slices.Clone`)", points: ["O(n) time and allocation", "Independent lifetime and contents", "Lets the GC free the original"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "A slice is a header of pointer, length and capacity over a backing array. Slicing shares that array, so writes are visible through every alias. `append` writes in place if there's capacity; otherwise it allocates a larger array — roughly doubling below 256 elements and then growing by about 1.25× plus a constant, rounded up to an allocator size class — copies, and returns a new header. That's why you must use append's return value and why a small sub-slice can pin a huge array in memory.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Header is passed by value: a callee can mutate elements but not the caller's len/cap — hence `append` returns the new slice.",
              "`s[a:b:c]` caps the capacity so a later append is forced to reallocate, protecting the original array (useful when handing out sub-slices of a buffer).",
              "Growth: `nextslicecap` doubles below 256, then `newcap += (newcap+768)/4` until it fits; `roundupsize` then rounds bytes to a size class. Pre-1.18 used a hard switch at 1024.",
              "GC: interior pointers keep the whole allocation alive; copy small parts out of big buffers you don't need.",
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
              "Write `func Filter(s []int, keep func(int) bool) []int` that filters in place (`s[:0]` trick) and explain what callers must not do afterwards.",
              "Write a stack with `Push`/`Pop` on a `[]*Node` that doesn't leak popped nodes.",
              "Predict then verify the output of appending to two sub-slices of the same array with and without a full slice expression.",
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
              "Slice = (ptr, len, cap) header; slicing shares memory.",
              "append: in place if cap allows, else allocate + copy; always reassign.",
              "Go 1.18+: 2× below 256, then ~1.25×+192, rounded to size classes.",
              "Use `s[a:b:c]`, `copy`, `slices.Clone` to break aliasing and release big arrays.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Slice header", definition: "The (pointer, length, capacity) triple that represents a slice value." },
      { term: "Backing array", definition: "The array that a slice's pointer points into; shared by all slices derived from it." },
      { term: "Capacity", definition: "Number of elements from the slice's start to the end of its backing array." },
      { term: "Full slice expression", definition: "`s[low:high:max]`, which also sets capacity to `max-low`." },
      { term: "Size class", definition: "One of the fixed allocation sizes the Go allocator rounds small requests up to." },
      { term: "Aliasing", definition: "Two references (here, slice headers) that point at the same memory." },
    ],
    followUps: [
      { q: "Why does append return a value instead of modifying the slice in place?", a: "The header is passed by value. When append reallocates, the pointer, len and cap all change, and only a returned header can carry the new values back." },
      { q: "Is appending to a slice from multiple goroutines safe?", a: "No. append reads and writes the header and the backing array without synchronization; concurrent appends race and can lose elements or corrupt data. Use a mutex or have each goroutine write to its own index." },
      { q: "How do you remove element i while preserving order?", a: "`s = append(s[:i], s[i+1:]...)` or `slices.Delete(s, i, i+1)`; for pointer elements, zero the vacated tail slot (slices.Delete does this since Go 1.22)." },
    ],
    quiz: [
      {
        id: "slices-q1",
        prompt: "What does this print?",
        code: { lang: "go", code: `a := make([]int, 3, 10)
b := append(a, 1)
c := append(a, 2)
fmt.Println(b[3], c[3])` },
        options: ["1 2", "2 2", "1 1", "panic"],
        answer: 1,
        explanation: "a has spare capacity, so both appends write into a's backing array at index 3. b and c share it; the second write wins.",
      },
      {
        id: "slices-q2",
        prompt: "`s := arr[2:4:5]` for a `[10]int` array. What are len(s) and cap(s)?",
        options: ["2 and 8", "2 and 3", "4 and 5", "2 and 5"],
        answer: 1,
        explanation: "len = high−low = 2; cap = max−low = 3.",
      },
      {
        id: "slices-q3",
        prompt: "Which keeps a 1 GB buffer alive?",
        options: ["`h := slices.Clone(buf[:8])`", "`h := buf[:8]`", "`var h [8]byte; copy(h[:], buf)`", "None of them"],
        answer: 1,
        explanation: "A sub-slice points into the same allocation; the GC must keep the whole backing array alive.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────── maps
  {
    slug: "maps",
    track: "go",
    title: "Maps: hash tables in the runtime",
    summary:
      "Go maps are runtime-managed hash tables with randomized iteration order, comparable keys, nil-map rules and no built-in concurrency safety.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 25,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/slices-internals"],
    related: ["go/mutex", "go/structs-methods", "dsa/hash-tables", "go/race-detector"],
    tags: ["go", "maps", "hash-table", "swiss-table", "concurrency"],
    sources: [
      { label: "Go maps in action (Go blog)", url: "https://go.dev/blog/maps", kind: "docs" },
      { label: "Faster Go maps with Swiss Tables (Go blog)", url: "https://go.dev/blog/swisstable", kind: "docs" },
      { label: "Spec — Map types", url: "https://go.dev/ref/spec#Map_types", kind: "docs" },
      { label: "Go 1.24 release notes", url: "https://go.dev/doc/go1.24", kind: "docs" },
      { label: "Package maps", url: "https://pkg.go.dev/maps", kind: "docs" },
      notion("Notion: Arrays, slices and maps", "https://app.notion.com/p/Arrays-slices-and-maps-1a2e9488b51a81ecbb1de20901e6dd51"),
      pgl,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Create, read (comma-ok), update, delete and iterate maps.",
              "Explain why iteration order is random and how to iterate deterministically.",
              "Know the nil-map, key-comparability and non-addressable-element rules.",
              "Explain why concurrent writes crash and how to fix it.",
              "Sketch the implementation (buckets/Swiss tables) and label it as an implementation detail.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [{ type: "p", text: "A map is a set of labelled drawers: hash the key to find which small group of drawers to look in, then compare keys inside that group. On average that's O(1) for lookup, insert and delete regardless of size." }],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "`map[K]V` is an unordered collection of key/value pairs. K must be **comparable** (`==` defined): numbers, strings, booleans, pointers, channels, interfaces, and structs/arrays of comparable types — not slices, maps or functions. A map value is effectively a pointer to a runtime structure, so passing a map to a function lets the callee modify the caller's map.",
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
	"maps"
	"slices"
)

func main() {
	ages := map[string]int{"ada": 36, "linus": 54}
	ages["grace"] = 85

	v, ok := ages["bob"] // comma-ok distinguishes "missing" from "zero"
	fmt.Println(v, ok)

	delete(ages, "linus")
	fmt.Println(len(ages))

	for _, k := range slices.Sorted(maps.Keys(ages)) { // deterministic order (Go 1.23+)
		fmt.Print(k, "=", ages[k], " ")
	}
	fmt.Println()

	var m map[string]int // nil map: reads are fine
	fmt.Println(m["x"], len(m))
	// m["x"] = 1 // would panic: assignment to entry in nil map

	counts := make(map[rune]int)
	for _, r := range "banana" {
		counts[r]++
	}
	fmt.Println(counts['a'], counts['n'], counts['z'])
}`,
            output: `0 false
2
ada=36 grace=85
0 0
3 2 0`,
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Hash", detail: "The runtime hashes the key with a per-map random seed (AES-based hashing on CPUs that support it). The seed defeats hash-flooding attacks and is one reason iteration order differs between runs." },
              { title: "Classic design (Go ≤1.23)", detail: "An array of 2^B buckets, each holding 8 key/value slots plus the top 8 bits of each hash (`tophash`) for fast rejection, with overflow buckets chained on. When the average load exceeded 6.5 entries per bucket, the table doubled and entries were **evacuated incrementally** during later writes." },
              { title: "Swiss tables (Go 1.24+)", detail: "Slots are grouped 8 at a time with a control word holding 7 bits of hash per slot, so one comparison checks 8 slots at once; probing is open-addressing. A large map is split into multiple independent tables (a directory, as in extendible hashing), so growth rehashes one bounded table at a time instead of the whole map." },
              { title: "Iteration", detail: "`range` starts at a random position and walks the structure; the spec says order is unspecified, and the runtime deliberately randomizes it so code can't come to depend on it." },
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Everything above the API is implementation",
            text: "The spec defines only map semantics. Buckets, load factors, `tophash`, Swiss-table groups and seeds are `gc` runtime details that changed in Go 1.24 and may change again. Behaviour visible to programs (random order, no element addresses, O(1) average) stayed the same.",
          },
          {
            type: "callout",
            tone: "warning",
            title: "Maps don't shrink",
            text: "Deleting entries frees slots for reuse but the runtime doesn't shrink the table. A map that once held 10 million entries keeps that memory after you delete them. To reclaim it, copy the survivors into a new map. (`clear(m)` in Go 1.21+ empties a map but likewise keeps its capacity.)",
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Map elements are not addressable**: `&m[k]` and `m[k].Field = 1` don't compile (the runtime may move entries when growing). Store pointers (`map[string]*User`) or read-modify-write: `u := m[k]; u.Age++; m[k] = u`.",
              "**Interface keys** compile but panic at run time if the dynamic value isn't comparable (e.g. a slice inside `any`).",
              "**NaN keys**: `NaN != NaN`, so each `m[math.NaN()] = 1` adds a new unreachable entry.",
              "Adding entries during `range` may or may not show them in that iteration; deleting not-yet-reached entries guarantees they won't be produced.",
              "`len(m)` is O(1); there is no `cap` for maps, but `make(map[K]V, hint)` preallocates.",
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
              "Writing to a nil map (a zero-valued struct field of map type) → `panic: assignment to entry in nil map`. Initialize with `make` or a literal.",
              "Reading/writing the same map from several goroutines without locking. The runtime detects some cases and aborts with `fatal error: concurrent map writes` — a fatal error, not a panic, so `recover` can't catch it.",
              "Relying on iteration order in tests or output (golden files, JSON-like printing). Sort the keys. (`fmt` prints maps in sorted key order, which can hide the problem.)",
              "Using `v := m[k]` alone when the zero value is meaningful; use `v, ok := m[k]`.",
            ],
          },
          {
            type: "code",
            lang: "go",
            caption: "Fixing concurrent access with a mutex",
            code: `type Counter struct {
	mu sync.Mutex
	m  map[string]int
}

func (c *Counter) Inc(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.m[key]++
}`,
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Option", "Good for", "Cost"],
            rows: [
              ["map + `sync.Mutex`", "General use, simple to reason about", "All access serialized"],
              ["map + `sync.RWMutex`", "Read-heavy with rare writes", "More overhead per op; writers can wait"],
              ["`sync.Map`", "Keys written once and read many times, or disjoint key sets per goroutine", "Untyped API (`any`), slower for general workloads"],
              ["Sharded maps", "Very high contention", "More code; hashing to shards"],
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "A Go map is a runtime hash table with O(1) average operations. Keys must be comparable; iteration order is unspecified and deliberately randomized. A nil map can be read but writing panics. Maps aren't safe for concurrent writes — the runtime may abort with “concurrent map writes” — so protect them with a mutex or use `sync.Map` for specific patterns. Internally Go used bucketed chaining with incremental growth until 1.23 and switched to Swiss tables in 1.24, but that's an implementation detail.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Why not addressable: growth relocates entries, so a pointer to an element would dangle.",
              "Why random order: prevents programs from depending on an order that would freeze the implementation (and the seed also mitigates hash flooding).",
              "Detection of concurrent writes is best-effort: the map sets a 'writing' flag and checks it; it catches many races but not all — use `-race` in tests.",
              "Swiss tables: SIMD-friendly control bytes check 8 slots per probe; higher load factor (7/8) reduces memory; per-table growth bounds latency spikes.",
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
              "Hash table; comparable keys; comma-ok lookups.",
              "Random iteration order — sort keys when order matters.",
              "nil map: read OK, write panics.",
              "Not concurrency-safe; elements not addressable; memory not returned on delete.",
              "Swiss tables since Go 1.24 (implementation detail).",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Hash function", definition: "Maps a key to a fixed-size number used to pick where the key is stored." },
      { term: "Comparable", definition: "A type for which `==` is defined; required for map keys." },
      { term: "Load factor", definition: "Average number of entries per slot or bucket; exceeding a limit triggers growth." },
      { term: "Swiss table", definition: "An open-addressing hash table design that checks groups of slots using compact control bytes; used by Go maps since 1.24." },
      { term: "Comma-ok", definition: "The two-value form `v, ok := m[k]` that reports whether the key was present." },
    ],
    followUps: [
      { q: "Why can't you take the address of a map element?", a: "Because the runtime moves entries during growth; an element pointer would become invalid. The language forbids it to keep maps memory-safe." },
      { q: "Is reading a map from many goroutines safe?", a: "Yes, concurrent reads with no writer are safe. Any concurrent write (including delete) alongside reads or writes is a data race." },
      { q: "How do you make a set in Go?", a: "`map[T]struct{}` — the empty struct takes zero bytes for values. Check membership with `_, ok := set[x]`." },
    ],
    quiz: [
      {
        id: "maps-q1",
        prompt: "What happens here?",
        code: { lang: "go", code: `var m map[string]int
m["a"] = 1` },
        options: ["m becomes {a:1}", "Compile error", "panic: assignment to entry in nil map", "Silently ignored"],
        answer: 2,
        explanation: "A nil map has no hash table to write into. Reads return the zero value, but writes panic.",
      },
      {
        id: "maps-q2",
        prompt: "Which key type is NOT allowed in a map?",
        options: ["[2]int", "struct{ a, b string }", "[]byte", "*int"],
        answer: 2,
        explanation: "Slices aren't comparable. Arrays, structs of comparable fields and pointers are fine.",
      },
      {
        id: "maps-q3",
        prompt: "Two goroutines write to the same map without locking. The most accurate statement is:",
        options: ["It's fine; maps are atomic", "It may crash with `fatal error: concurrent map writes`, which recover can't catch", "It always panics with a recoverable panic", "Go serializes writes automatically"],
        answer: 1,
        explanation: "It's a data race; the runtime detects many such cases and aborts the program with a fatal error.",
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────── functions
  {
    slug: "functions",
    track: "go",
    title: "Functions, closures and multiple returns",
    summary:
      "Go functions are first-class values with multiple return values, variadic parameters and closures — and every argument is passed by value.",
    level: "beginner",
    frequency: "high",
    minutes: 20,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/variables-constants", "go/control-flow"],
    related: ["go/errors", "go/defer", "go/escape-analysis", "javascript/closures", "go/pointers"],
    tags: ["go", "functions", "closures", "variadic", "first-class"],
    sources: [
      { label: "Spec — Function types and declarations", url: "https://go.dev/ref/spec#Function_declarations", kind: "docs" },
      { label: "Effective Go — Functions", url: "https://go.dev/doc/effective_go#functions", kind: "docs" },
      { label: "Codewalk: First-Class Functions in Go", url: "https://go.dev/doc/codewalk/functions/", kind: "docs" },
      notion("Notion: Functions", "https://app.notion.com/p/Functions-1a2e9488b51a81f99b61d58a2b5e3457"),
      { ...practiceRepo, label: "Learner's practice code — super30-Go/function/function.go", url: "https://github.com/saurabhraghuvanshii/language-learning/tree/main/Go/super30-Go/function" },
      pgl,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Declare functions with grouped parameters, multiple and named results, and variadic parameters.",
              "Pass functions as values and return them (higher-order functions).",
              "Explain closures: what is captured and where captured variables live.",
              "State precisely what “Go is pass-by-value” means for slices, maps, pointers and structs.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [{ type: "p", text: "A function is a recipe with labelled inputs and outputs. Go recipes can return several dishes at once (typically a result and an error), and you can hand a recipe to another recipe — or build a new one on the fly that remembers some ingredients (a closure)." }],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "list",
            items: [
              "`func name(a, b int) int` — consecutive parameters of the same type share the type.",
              "Multiple results: `func f() (int, error)`; **named results** `(q, r int)` are pre-declared zero-valued variables, and a bare `return` returns them.",
              "Variadic: `func sum(nums ...int)` — inside, `nums` is `[]int`; callers can spread a slice with `sum(s...)` (no copy: the slice is passed as is).",
              "Function values have types like `func(int, int) int`; their zero value is `nil` (calling it panics). Functions are comparable only to `nil`.",
              "A **closure** is a function literal that refers to variables of the enclosing function; it captures the *variables* (by reference), not snapshots of their values.",
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
            caption: "Adapted from the learner's function.go practice file",
            code: `package main

import (
	"fmt"
	"strings"
)

func divmod(a, b int) (q, r int) { // named results
	q = a / b
	r = a % b
	return // "naked" return of q, r
}

func sum(nums ...int) int { // variadic: nums is a []int
	total := 0
	for _, n := range nums {
		total += n
	}
	return total
}

func apply(a, b int, fn func(int, int) int) int { return fn(a, b) }

func multiplier(factor int) func(int) int {
	return func(x int) int { return x * factor } // closure captures factor
}

func counter() func() int {
	n := 0
	return func() int { n++; return n }
}

func main() {
	q, r := divmod(17, 5)
	fmt.Println(q, r)

	fmt.Println(sum(), sum(1, 2, 3), sum([]int{4, 5}...))

	fmt.Println(apply(6, 7, func(a, b int) int { return a * b }))

	double := multiplier(2)
	fmt.Println(double(21))

	next := counter()
	next()
	next()
	fmt.Println(next())

	upper := strings.ToUpper // functions are values
	fmt.Println(upper("go"))
}`,
            output: `3 2
0 6 9
42
42
3
GO`,
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Calling convention", detail: "Since Go 1.17 (amd64) arguments and results are passed in registers where possible (the register-based ABI), falling back to the stack. Each goroutine has its own growable stack for frames." },
              { title: "Pass by value", detail: "Every argument is copied. A slice copies its 3-word header (elements shared), a map or channel copies a pointer-sized handle (data shared), a struct copies all fields, a pointer copies the address." },
              { title: "Closures", detail: "A function value that captures variables is a pointer to a closure object holding the code pointer plus references to the captured variables. If the closure outlives the frame (returned, stored, run in a goroutine), escape analysis moves the captured variable to the heap — that's how `counter`'s `n` survives." },
              { title: "Inlining", detail: "Small functions are inlined by the compiler, removing call overhead and often enabling better escape analysis (see `go build -gcflags=-m`)." },
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "The spec defines pass-by-value and closure semantics; the register ABI, closure layout, inlining budget and heap promotion of captured variables are `gc` compiler details.",
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "Go has no default parameter values, no overloading and no named arguments; use option structs or functional options.",
              "Named results are visible to deferred functions, which can modify them after `return` — the basis of the `recover`-to-error pattern.",
              "Methods can be used as values: `f := obj.Method` binds the receiver (a *method value*); `T.Method` is a *method expression* taking the receiver as first argument.",
              "Recursion is fine (stacks grow), but Go doesn't guarantee tail-call optimization.",
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
              "Overusing naked returns in long functions — they hurt readability.",
              "Assuming a function can resize the caller's slice: appending inside the callee doesn't change the caller's header; return the new slice.",
              "Capturing a variable in a goroutine closure and mutating it concurrently — a data race.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Go functions are first-class: they can be stored, passed and returned. They support multiple returns — idiomatically `(value, error)` — named results and variadic parameters. Everything is passed by value, but values like slices, maps, channels and pointers contain references, so callees can mutate shared data. Closures capture variables by reference; if they outlive the function, the compiler moves those variables to the heap.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: ["Multiple/named results, variadic `...T`.", "Functions are values; closures capture variables.", "Always pass-by-value; some values contain pointers.", "No overloading or default args."] }],
      },
    ],
    glossary: [
      { term: "First-class function", definition: "A function that can be used like any value: assigned, passed, returned." },
      { term: "Closure", definition: "A function value that references variables from its surrounding scope." },
      { term: "Variadic", definition: "Accepting a variable number of arguments of one type as the last parameter." },
      { term: "Method value", definition: "A function value created from `x.M` with the receiver `x` already bound." },
    ],
    followUps: [
      { q: "Is a map passed by reference in Go?", a: "No — Go has no pass-by-reference. The map value itself is a pointer to the runtime hash table, and that pointer is copied, so both copies refer to the same table." },
      { q: "What are functional options?", a: "A constructor pattern `New(opts ...Option)` where `type Option func(*Config)`; each option mutates a config, giving optional, extensible, self-documenting parameters." },
    ],
    quiz: [
      {
        id: "functions-q1",
        prompt: "What does this print?",
        code: { lang: "go", code: `func counter() func() int {
	n := 0
	return func() int { n++; return n }
}

a, b := counter(), counter()
a(); a()
fmt.Println(a(), b())` },
        options: ["3 1", "1 1", "3 4", "2 1"],
        answer: 0,
        explanation: "Each call to counter creates a new `n`. `a` has been called three times; `b` once.",
      },
      {
        id: "functions-q2",
        prompt: "`func f(s []int) { s = append(s, 4) }` is called with `s := []int{1,2,3}` (cap 3). What is len(s) in the caller afterwards?",
        options: ["4", "3", "0", "It depends on GC"],
        answer: 1,
        explanation: "The callee received a copy of the header; reassigning its local `s` doesn't affect the caller's len.",
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────── errors
  {
    slug: "errors",
    track: "go",
    title: "Errors as values (and panic/recover)",
    summary:
      "Go reports failures as ordinary `error` values returned alongside results; wrapping with `%w` and inspecting with `errors.Is`/`errors.As` adds context without losing identity. Panics are for bugs.",
    level: "beginner",
    frequency: "very-high",
    minutes: 20,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/functions", "go/interfaces"],
    related: ["go/error-wrapping", "go/defer", "go/interface-internals-typed-nil", "javascript/error-handling"],
    tags: ["go", "errors", "panic", "recover", "wrapping"],
    sources: [
      { label: "Error handling and Go (Go blog)", url: "https://go.dev/blog/error-handling-and-go", kind: "docs" },
      { label: "Working with Errors in Go 1.13 (Go blog)", url: "https://go.dev/blog/go1.13-errors", kind: "docs" },
      { label: "Errors are values (Go blog)", url: "https://go.dev/blog/errors-are-values", kind: "docs" },
      { label: "Defer, Panic, and Recover (Go blog)", url: "https://go.dev/blog/defer-panic-and-recover", kind: "docs" },
      { label: "Package errors", url: "https://pkg.go.dev/errors", kind: "docs" },
      pgl,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Return and check errors idiomatically.",
              "Create sentinel errors and custom error types.",
              "Wrap with `fmt.Errorf(\"…: %w\", err)` and inspect with `errors.Is` / `errors.As`.",
              "Know when `panic` is appropriate and how `recover` works.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [{ type: "p", text: "In JavaScript, failure jumps out of the normal flow (throw) and lands somewhere up the stack. In Go, failure is just another return value you look at right away. It's more typing, but every failure path is visible where it happens." }],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "code",
            lang: "go",
            caption: "The whole built-in error type",
            code: `type error interface {
	Error() string
}`,
          },
          {
            type: "list",
            items: [
              "**Sentinel error**: a package-level value like `io.EOF` or `ErrNotFound` compared by identity.",
              "**Custom error type**: a struct implementing `Error()` carrying data (field, status code…).",
              "**Wrapping**: `fmt.Errorf` with `%w` returns an error whose `Unwrap()` yields the original, forming a chain. Go 1.20+ allows multiple `%w` and `errors.Join`.",
              "`errors.Is(err, target)` walks the chain comparing with `==` (or an `Is` method); `errors.As(err, &target)` finds the first error assignable to target's type.",
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
	"errors"
	"fmt"
)

var ErrNotFound = errors.New("not found") // sentinel error

type ValidationError struct{ Field string } // custom error type

func (e *ValidationError) Error() string { return "invalid " + e.Field }

func findUser(id int) (string, error) {
	if id < 0 {
		return "", &ValidationError{Field: "id"}
	}
	if id != 1 {
		return "", fmt.Errorf("find user %d: %w", id, ErrNotFound) // wrap
	}
	return "ada", nil
}

func safeDiv(a, b int) (res int, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("recovered: %v", r)
		}
	}()
	return a / b, nil
}

func main() {
	if name, err := findUser(1); err == nil {
		fmt.Println("found", name)
	}

	_, err := findUser(7)
	fmt.Println(err)
	fmt.Println(errors.Is(err, ErrNotFound), err == ErrNotFound)

	_, err = findUser(-1)
	var ve *ValidationError
	if errors.As(err, &ve) {
		fmt.Println("bad field:", ve.Field)
	}

	_, err = safeDiv(1, 0)
	fmt.Println(err)
}`,
            output: `found ada
find user 7: not found
true false
bad field: id
recovered: runtime error: integer divide by zero`,
          },
        ],
      },
      {
        id: "internals",
        title: "How panic and recover work",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "panic", detail: "Stops normal execution of the current goroutine and starts unwinding: deferred calls run in LIFO order, frame by frame." },
              { title: "recover", detail: "Only has an effect when called **directly** inside a deferred function during a panic; it returns the panic value and stops the unwinding. The surrounding function then returns normally (with whatever its named results hold)." },
              { title: "Unrecovered", detail: "If the goroutine's stack unwinds completely, the program prints the panic and stack trace and exits with status 2 — even if other goroutines were fine. A panic can't be recovered from a different goroutine." },
            ],
          },
          {
            type: "callout",
            tone: "warning",
            title: "Fatal errors are not panics",
            text: "Some runtime failures — `concurrent map writes`, out of memory, deadlock (`all goroutines are asleep`) — are fatal errors that bypass `recover` entirely.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Ignoring errors with `_` — always handle, wrap, or return them.",
              "Comparing wrapped errors with `==`; use `errors.Is`.",
              "Logging *and* returning the same error at every layer (duplicate logs). Handle it once.",
              "Wrapping with `%v` instead of `%w` — the message is kept but the chain is lost.",
              "Returning a nil *pointer* of a custom error type as `error` — the interface is non-nil (see the typed-nil lesson).",
              "Using panic for expected failures like bad input or a missing file.",
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
              { title: "Errors as values (Go)", points: ["Every failure path is explicit and local", "No hidden control flow", "Verbose `if err != nil`", "Easy to forget context unless wrapped"] },
              { title: "Exceptions (JS/Java)", points: ["Less boilerplate on the happy path", "Any call may throw — invisible control flow", "Stack trace captured automatically", "Easy to catch too broadly"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "In Go, errors are values implementing `Error() string`, returned as the last result and checked immediately. You add context by wrapping with `fmt.Errorf` and `%w`, and inspect chains with `errors.Is` for sentinel values and `errors.As` for typed errors. `panic` is reserved for programmer bugs or impossible states; `recover` inside a deferred function can stop a panic, typically at a goroutine or request boundary.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "net/http recovers panics per request so one handler bug doesn't kill the server — but panics in goroutines you start yourself aren't covered.",
              "Sentinel errors become part of your API; prefer exposing behaviour (`errors.As` to an interface, or `Is` methods) for flexibility.",
              "Wrapping exposes the underlying error to callers; use `%v` when you deliberately want to hide an implementation detail.",
              "Errors don't carry stack traces by default; add context in the message or use a library/structured logging.",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: ["`error` is a one-method interface.", "Return, check, wrap with `%w`.", "`errors.Is` for identity, `errors.As` for type.", "panic for bugs; recover only in deferred functions."] }],
      },
    ],
    glossary: [
      { term: "Sentinel error", definition: "A predeclared error value compared by identity, e.g. `io.EOF`." },
      { term: "Wrapping", definition: "Creating a new error that contains another, retrievable via `Unwrap`." },
      { term: "panic", definition: "A run-time abort of normal flow that unwinds the goroutine's stack, running deferred calls." },
      { term: "recover", definition: "Built-in that stops a panic when called directly in a deferred function." },
    ],
    followUps: [
      { q: "Why does `recover()` in a helper called by the deferred function return nil?", a: "recover only stops a panic when called directly by the deferred function, not deeper in the call chain." },
      { q: "When is panicking acceptable in library code?", a: "For programmer errors that indicate a bug (impossible states, invalid arguments to a `Must…` helper at init time). Never for conditions callers can reasonably expect." },
    ],
    quiz: [
      {
        id: "errors-q1",
        prompt: "`err := fmt.Errorf(\"load: %w\", os.ErrNotExist)`. Which is true?",
        options: ["`err == os.ErrNotExist`", "`errors.Is(err, os.ErrNotExist)`", "Both", "Neither"],
        answer: 1,
        explanation: "err is a new wrapper value, so `==` is false; errors.Is unwraps the chain and finds the sentinel.",
      },
      {
        id: "errors-q2",
        prompt: "Where must `recover()` be called to stop a panic?",
        options: ["Anywhere in the same goroutine", "Directly inside a deferred function", "In main", "In any goroutine"],
        answer: 1,
        explanation: "recover only works when called directly by a deferred function while the goroutine is panicking.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────── structs-methods
  {
    slug: "structs-methods",
    track: "go",
    title: "Structs, methods and embedding",
    summary:
      "Structs group typed fields into a value; methods attach behaviour via value or pointer receivers; embedding promotes fields and methods (composition, not inheritance).",
    level: "beginner",
    frequency: "high",
    minutes: 25,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/functions"],
    related: ["go/interfaces", "go/method-sets", "go/pointers", "go/json"],
    tags: ["go", "structs", "methods", "receivers", "embedding", "alignment"],
    sources: [
      { label: "Spec — Struct types", url: "https://go.dev/ref/spec#Struct_types", kind: "docs" },
      { label: "Spec — Method declarations", url: "https://go.dev/ref/spec#Method_declarations", kind: "docs" },
      { label: "Effective Go — Embedding", url: "https://go.dev/doc/effective_go#embedding", kind: "docs" },
      { label: "Go FAQ — Should I define methods on values or pointers?", url: "https://go.dev/doc/faq#methods_on_values_or_pointers", kind: "docs" },
      notion("Notion: Structs & attaching methods", "https://app.notion.com/p/Structs-attaching-methods-1a2e9488b51a8192b24cec4fa9bddc1a"),
      { ...practiceRepo, label: "Learner's practice code — super30-Go/struct/struct.go", url: "https://github.com/saurabhraghuvanshii/language-learning/tree/main/Go/super30-Go/struct" },
      pgl,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Declare structs, use composite literals and zero values.",
              "Choose between value and pointer receivers.",
              "Use embedding and explain how it differs from inheritance.",
              "Explain field alignment/padding and why field order can change struct size.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [{ type: "p", text: "A struct is a form with labelled boxes. A method is a function that takes the form as a special first argument (the receiver). A value receiver gets a photocopy of the form; a pointer receiver gets the original." }],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "list",
            items: [
              "`type Rect struct { W, H int }` defines a named struct type; fields are laid out in memory in declaration order, contiguously.",
              "`func (r Rect) Area() int` — **value receiver**; `func (r *Rect) Scale(k int)` — **pointer receiver**.",
              "Methods can be declared on any named type defined in the same package (not only structs): `type Celsius float64`.",
              "**Embedding**: a field with a type but no name (`Rect`) promotes its fields and methods to the outer struct.",
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
            caption: "Builds on the learner's rect example (struct.go) by turning functions into methods",
            code: `package main

import "fmt"

type Rect struct {
	W, H int
}

func (r Rect) Area() int { return r.W * r.H } // value receiver: gets a copy

func (r *Rect) Scale(k int) { // pointer receiver: can mutate
	r.W *= k
	r.H *= k
}

type Label struct {
	Rect // embedded: fields and methods are promoted
	Text string
}

func main() {
	r := Rect{W: 10, H: 14}
	fmt.Println(r.Area())

	r.Scale(2) // Go takes &r automatically because r is addressable
	fmt.Printf("%+v %d\\n", r, r.Area())

	l := Label{Rect: Rect{W: 2, H: 3}, Text: "tiny"}
	fmt.Println(l.Area(), l.W, l.Rect.H)

	copyOfR := r
	copyOfR.W = 1
	fmt.Println(r.W, copyOfR.W, r == Rect{W: 20, H: 28})

	point := struct{ X, Y int }{1, 2} // anonymous struct
	fmt.Println(point)
}`,
            output: `140
{W:20 H:28} 560
6 2 3
20 1 true
{1 2}`,
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "p",
            text: "A method is compiled as an ordinary function whose first parameter is the receiver: `Rect.Area(r)` and `(*Rect).Scale(&r, 2)`. There is no vtable inside the struct and no per-object header — a `Rect` is exactly two ints. Dynamic dispatch only appears when a value is stored in an interface.",
          },
          {
            type: "code",
            lang: "go",
            caption: "Field order affects size because of alignment padding",
            code: `package main

import (
	"fmt"
	"unsafe"
)

type Loose struct {
	A bool
	B int64
	C bool
}

type Tight struct {
	B int64
	A bool
	C bool
}

func main() {
	fmt.Println(unsafe.Sizeof(Loose{}), unsafe.Sizeof(Tight{}))
}`,
            output: "24 16",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "Sizes and alignment depend on the architecture (these are amd64 numbers). The `gc` compiler never reorders fields; ordering from largest to smallest alignment minimizes padding. Only worth doing for types allocated in large numbers.",
          },
        ],
      },
      {
        id: "tradeoffs",
        title: "Value vs pointer receivers",
        blocks: [
          {
            type: "table",
            head: ["Use a pointer receiver when…", "Use a value receiver when…"],
            rows: [
              ["The method mutates the receiver", "The type is small and immutable-ish (time.Time, small structs)"],
              ["The struct is large (copying is costly)", "The type is a map, func or chan (already reference-like)"],
              ["The struct contains a `sync.Mutex` or other no-copy field", "You want the value to be safely copyable"],
              ["Other methods already use pointer receivers (be consistent)", "—"],
            ],
          },
          {
            type: "callout",
            tone: "note",
            text: "Receiver choice changes the **method set**, which decides interface satisfaction: `Rect` (value) has only `Area`; `*Rect` has `Area` and `Scale`. See the method-sets lesson.",
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "Structs are comparable with `==` only if all fields are comparable (no slices, maps, funcs).",
              "Embedding is not inheritance: the embedded `Rect`'s methods still receive a `Rect`, not the `Label`; there's no override-and-call-back (no virtual dispatch through the outer type).",
              "If two embedded types provide the same field/method at the same depth, using it is an ambiguity compile error.",
              "Struct tags (`json:\"name\"`) are metadata read via reflection, used by encoding packages.",
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
              "Mutating inside a value-receiver method and wondering why nothing changed.",
              "Copying a struct that contains a `sync.Mutex` (go vet's copylocks check catches this).",
              "Mixing value and pointer receivers on one type without reason.",
              "Using positional literals `Rect{10, 14}` for exported types from other packages — adding a field breaks callers; use field names.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Structs are value types: assignment copies all fields. Methods are functions with a receiver; a pointer receiver can mutate and avoids copies, a value receiver works on a copy. Go uses composition via embedding instead of inheritance — embedded fields and methods are promoted, but there's no virtual dispatch through the outer type; polymorphism comes from interfaces.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: ["Structs are contiguous values, no hidden header.", "Pointer receivers mutate; value receivers copy.", "Embedding = promotion, not inheritance.", "Field order can affect size via padding."] }],
      },
    ],
    glossary: [
      { term: "Receiver", definition: "The value or pointer a method is called on; declared before the method name." },
      { term: "Embedding", definition: "Including a type as an unnamed field so its fields and methods are promoted." },
      { term: "Composite literal", definition: "Syntax that builds a struct, array, slice or map value: `Rect{W: 1, H: 2}`." },
      { term: "Padding", definition: "Unused bytes inserted so each field starts at an address that is a multiple of its alignment." },
    ],
    followUps: [
      { q: "How do you emulate constructors?", a: "With a function `NewT(...) *T` (or `T`) that validates and initializes. Prefer designs where the zero value is already usable." },
      { q: "Can you call a pointer method on a value?", a: "Yes if the value is addressable (a variable, a slice element, a field of an addressable struct); Go inserts `&`. Not on map elements or return values." },
    ],
    quiz: [
      {
        id: "structs-q1",
        prompt: "What does this print?",
        code: { lang: "go", code: `type C struct{ n int }
func (c C) Inc() { c.n++ }

c := C{}
c.Inc(); c.Inc()
fmt.Println(c.n)` },
        options: ["0", "1", "2", "Compile error"],
        answer: 0,
        explanation: "Inc has a value receiver and increments a copy.",
      },
      {
        id: "structs-q2",
        prompt: "Embedding `Rect` in `Label` means…",
        options: ["Label inherits from Rect and can override Area so Rect's code calls Label's version", "Rect's fields and methods are promoted to Label, but Rect's methods still operate on the embedded Rect", "Label is a pointer to a Rect", "Label implements every interface Rect's pointer type implements"],
        answer: 1,
        explanation: "Embedding is composition with promotion; there is no virtual dispatch back to the outer type.",
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── interfaces
  {
    slug: "interfaces",
    track: "go",
    title: "Interfaces: implicit, small, powerful",
    summary:
      "An interface is a set of method signatures; any type with those methods satisfies it implicitly. Type assertions and switches recover the concrete type.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 25,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/structs-methods"],
    related: ["go/interface-internals-typed-nil", "go/method-sets", "go/errors", "typescript/types-vs-interfaces"],
    tags: ["go", "interfaces", "polymorphism", "type-assertion", "type-switch", "any"],
    sources: [
      { label: "Spec — Interface types", url: "https://go.dev/ref/spec#Interface_types", kind: "docs" },
      { label: "Effective Go — Interfaces", url: "https://go.dev/doc/effective_go#interfaces", kind: "docs" },
      { label: "The Laws of Reflection (Go blog)", url: "https://go.dev/blog/laws-of-reflection", kind: "docs" },
      notion("Notion: Interfaces", "https://app.notion.com/p/Interfaces-1a2e9488b51a81948fc9ef52d1ed130f"),
      pgl,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Define interfaces and satisfy them implicitly.",
              "Use type assertions (comma-ok) and type switches safely.",
              "Apply idioms: small interfaces, defined by the consumer, “accept interfaces, return structs”.",
              "Explain `any` and the compile-time satisfaction check.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [{ type: "p", text: "An interface is a job description: “must be able to `Read`”. Anyone who can do the job qualifies — no application form (`implements`) needed. That lets you write code against behaviours, and plug in files, network connections or test fakes interchangeably." }],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "list",
            items: [
              "`type Shape interface { Area() float64 }` — a type **implements** Shape if its method set includes `Area() float64`. Satisfaction is structural and implicit.",
              "An interface **value** holds a concrete type and a value of that type (its *dynamic* type and value). The zero value is `nil` (no type, no value).",
              "`any` is an alias for `interface{}` — satisfied by every type.",
              "**Type assertion** `x.(T)` extracts the concrete value (panics if wrong; use `v, ok := x.(T)`). A **type switch** branches on the dynamic type.",
              "Interfaces can embed other interfaces: `type ReadWriter interface { Reader; Writer }`.",
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
	"math"
)

type Shape interface {
	Area() float64
}

type Rect struct{ W, H float64 }
type Circle struct{ R float64 }

func (r Rect) Area() float64    { return r.W * r.H }
func (c Circle) Area() float64  { return math.Pi * c.R * c.R }
func (c Circle) String() string { return fmt.Sprintf("Circle(r=%g)", c.R) }

var _ Shape = Rect{} // compile-time check that Rect satisfies Shape

func describe(v any) string {
	switch x := v.(type) { // type switch
	case nil:
		return "nil"
	case int:
		return fmt.Sprintf("int %d", x)
	case Shape:
		return fmt.Sprintf("shape with area %.1f", x.Area())
	default:
		return fmt.Sprintf("other %T", x)
	}
}

func main() {
	shapes := []Shape{Rect{3, 4}, Circle{1}}
	total := 0.0
	for _, s := range shapes {
		total += s.Area()
	}
	fmt.Printf("%.2f\\n", total)

	fmt.Println(shapes[1]) // fmt uses the Stringer interface

	if c, ok := shapes[1].(Circle); ok { // type assertion, comma-ok form
		fmt.Println("radius", c.R)
	}
	_, ok := shapes[0].(Circle)
	fmt.Println(ok)

	fmt.Println(describe(42), "|", describe(Rect{2, 5}), "|", describe("hi"), "|", describe(nil))
}`,
            output: `15.14
Circle(r=1)
radius 1
false
int 42 | shape with area 10.0 | other string | nil`,
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "p",
            text: "Under the hood an interface value is two words: a pointer to type information (for non-empty interfaces, an *itab* with the method table) and a pointer to the data. A method call through an interface loads the function pointer from the itab and calls it — dynamic dispatch. The details, including the famous typed-nil gotcha, are in [Interface internals and typed nil](/paths/go/interface-internals-typed-nil).",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "The two-word layout and itab caching are `gc` runtime details. The spec only defines interface semantics (dynamic type + value, method sets, nil).",
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "list",
            items: [
              "**Small interfaces** (`io.Reader`, `io.Writer`, `fmt.Stringer`, `error`) are easy to satisfy and compose. “The bigger the interface, the weaker the abstraction.”",
              "**Define interfaces where they're used** (consumer side), not next to the implementation. Implementations don't need to know about them.",
              "**Accept interfaces, return concrete types**: callers get the full API; you avoid premature abstraction.",
              "Cost: a call through an interface can't be inlined unless the compiler devirtualizes it, and storing values in interfaces may cause heap allocation.",
              "Generics (1.18+) are often better than `any` for containers and algorithms: type-safe and no boxing.",
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
              "Using single-result assertions `x.(T)` on untrusted data — panics on mismatch.",
              "Creating an interface for every struct “for testability” before there's a second implementation.",
              "Returning a nil concrete pointer as an interface (typed nil) — the interface isn't nil.",
              "Expecting `T` to satisfy an interface whose methods have pointer receivers — only `*T` does.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Go interfaces are sets of methods satisfied implicitly — no `implements` keyword — which decouples packages: consumers declare the small interface they need. An interface value carries a dynamic type and value; you recover the concrete type with a type assertion or switch. Idioms are small interfaces, defined by the consumer, and “accept interfaces, return structs”.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Implicit satisfaction lets you introduce an interface *after* the fact over types you don't own (e.g. wrapping a third-party client for tests).",
              "`var _ I = (*T)(nil)` is a zero-cost compile-time assertion.",
              "Interface comparison compares dynamic types and values; it panics if the dynamic type isn't comparable.",
              "`errors.As`, `io.Copy` (checks for `WriterTo`/`ReaderFrom`) and `fmt` (checks `Stringer`, `error`, `Formatter`) use assertions to discover optional capabilities.",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: ["Interfaces = method sets, satisfied implicitly.", "Interface value = dynamic (type, value).", "Assertions/switches recover concrete types; use comma-ok.", "Keep them small and on the consumer side."] }],
      },
    ],
    glossary: [
      { term: "Dynamic type", definition: "The concrete type stored inside an interface value at run time." },
      { term: "Type assertion", definition: "`x.(T)`: asserts that interface x holds T (or implements interface T)." },
      { term: "Type switch", definition: "A switch on `x.(type)` with one case per type." },
      { term: "Duck typing (structural)", definition: "Satisfying a contract by having the right methods, not by declaring it." },
      { term: "Dynamic dispatch", definition: "Choosing which function to call at run time based on the value's type." },
    ],
    followUps: [
      { q: "How do you check at compile time that *T implements io.Writer?", a: "`var _ io.Writer = (*T)(nil)` at package level — compilation fails if not." },
      { q: "When would you use a generic function instead of an interface parameter?", a: "When you need the same type in and out (e.g. `Max[T cmp.Ordered](a, b T) T`), operate on containers of T, or want to avoid boxing — interfaces are for behaviour-based polymorphism with heterogeneous values." },
    ],
    quiz: [
      {
        id: "interfaces-q1",
        prompt: "What happens with `var s Shape = Rect{1,2}; c := s.(Circle)`?",
        options: ["c is a zero Circle", "Compile error", "Runtime panic", "c is nil"],
        answer: 2,
        explanation: "The single-result assertion panics when the dynamic type doesn't match. Use `c, ok := s.(Circle)`.",
      },
      {
        id: "interfaces-q2",
        prompt: "How does a Go type declare that it implements an interface?",
        options: ["`implements` keyword", "Embedding the interface", "It doesn't — having the methods is enough", "A struct tag"],
        answer: 2,
        explanation: "Satisfaction is implicit and structural.",
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── enums-iota
  {
    slug: "enums-iota",
    track: "go",
    title: "Enums with iota",
    summary:
      "Go has no enum keyword; you build enums from a named type, a const block and `iota`, plus a `String()` method. The type adds safety but doesn't restrict values.",
    level: "beginner",
    frequency: "medium",
    minutes: 15,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/variables-constants", "go/structs-methods"],
    related: ["typescript/enums", "go/json", "go/interfaces"],
    tags: ["go", "enums", "iota", "constants", "stringer"],
    sources: [
      { label: "Spec — Iota", url: "https://go.dev/ref/spec#Iota", kind: "docs" },
      { label: "Effective Go — Constants", url: "https://go.dev/doc/effective_go#constants", kind: "docs" },
      { label: "stringer command", url: "https://pkg.go.dev/golang.org/x/tools/cmd/stringer", kind: "docs" },
      notion("Notion: Enums", "https://app.notion.com/p/Enums-1a2e9488b51a8129b4ebea046e6e94ae"),
      { ...practiceRepo, label: "Learner's practice code — super30-Go/enum/enum.go", url: "https://github.com/saurabhraghuvanshii/language-learning/tree/main/Go/super30-Go/enum" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [{ type: "list", items: ["Use `iota` to generate sequential and bit-flag constants.", "Give enums a safe `String()` method.", "Understand the limits: any integer converts to the type."] }],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "`iota` is a predeclared identifier that equals the index of the current line (ConstSpec) inside a `const (...)` block, starting at 0. A line without an expression repeats the previous line's expression (and type) with the new `iota`. Combined with a named type (`type Direction int`) this gives typed enumerations.",
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "p",
            text: "The learner's `enum.go` indexes an array inside `String()`: `[...]string{\"East\", …}[s]`. That works for valid values but **panics** (index out of range) for `dir(7)`. A switch with a fallback is safer:",
          },
          {
            type: "code",
            lang: "go",
            code: `package main

import "fmt"

type Direction int

const (
	East  Direction = iota // 0
	West                   // 1
	South                  // 2
	North                  // 3
)

func (d Direction) String() string {
	switch d {
	case East:
		return "East"
	case West:
		return "West"
	case South:
		return "South"
	case North:
		return "North"
	}
	return fmt.Sprintf("Direction(%d)", int(d))
}

type Status int

const (
	StatusUnknown Status = iota // zero value means "not set"
	StatusActive
	StatusBanned
)

func main() {
	fmt.Println(Direction(1), North, Direction(7))
	fmt.Printf("%v %d\\n", South, South)

	var s Status
	fmt.Println(s == StatusUnknown, StatusBanned)
}`,
            output: `West North Direction(7)
South 2
true 2`,
          },
          {
            type: "code",
            lang: "go",
            caption: "Bit flags, skipping values, and iota per line",
            code: `package main

import "fmt"

type Perm uint8

const (
	Read  Perm = 1 << iota // 1
	Write                  // 2
	Exec                   // 4
)

type ByteSize float64

const (
	_           = iota // skip 0
	KB ByteSize = 1 << (10 * iota)
	MB
	GB
)

const (
	A, B = iota, iota * 10 // iota is per line, not per name
	C, D
)

func main() {
	p := Read | Exec
	fmt.Println(p, p&Write != 0, p&Exec != 0)
	p &^= Exec // clear a bit
	fmt.Println(p)
	fmt.Println(KB, MB, GB)
	fmt.Println(A, B, C, D)
}`,
            output: `5 false true
1
1024 1.048576e+06 1.073741824e+09
0 0 1 10`,
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "Nothing stops `Direction(42)` or an untyped constant `var d Direction = 9`; validate input (e.g. when decoding JSON) yourself.",
              "Reordering or inserting constants changes their numeric values — dangerous if values are persisted in a database or sent over the wire. Persist names, or assign explicit values.",
              "Make the zero value meaningful (`Unknown`/`Invalid`) so an uninitialized field isn't silently a real option.",
              "`go generate` with `stringer -type=Direction` writes `String()` for you.",
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
              { title: "Go iota enums", points: ["Just typed integer constants — zero runtime cost", "Type prevents mixing with other named types", "No exhaustiveness check or value restriction"] },
              { title: "TypeScript/Rust enums or unions", points: ["Closed set checked by the compiler (TS unions, Rust enums)", "Exhaustive switches", "More language machinery"] },
            ],
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [{ type: "list", items: ["Array-index `String()` that panics on unknown values.", "Starting a persisted enum at 0 for a real value so missing data looks valid.", "Expecting the compiler to warn about missing switch cases (use the `exhaustive` linter)."] }],
      },
      {
        id: "interview-short",
        blocks: [{ type: "p", text: "Go builds enums from a named integer type plus a const block using `iota`, which counts lines in the block from zero; omitted expressions repeat with the next iota, which also makes bit flags easy with `1 << iota`. Add a `String()` method (or generate it with `stringer`). The type isn't closed — any integer can be converted to it — so validate at boundaries and make the zero value mean “unknown”." }],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: ["`type X int` + `const ( A X = iota; B; C )`.", "`1 << iota` for flags; `_` to skip.", "Add a safe `String()`.", "Not a closed set — validate."] }],
      },
    ],
    glossary: [
      { term: "iota", definition: "Constant generator equal to the line index within a const block." },
      { term: "Stringer", definition: "`fmt.Stringer`, the `String() string` interface fmt uses for printing; also the code-gen tool of the same name." },
      { term: "Bit flag", definition: "A constant with a single bit set so values can be combined with `|` and tested with `&`." },
    ],
    followUps: [
      { q: "How would you marshal an enum to JSON as a string?", a: "Implement `MarshalText`/`UnmarshalText` (encoding.TextMarshaler) on the type; encoding/json uses them, and UnmarshalText can reject unknown names." },
    ],
    quiz: [
      {
        id: "enums-q1",
        prompt: "What are the values of X, Y, Z?",
        code: { lang: "go", code: `const (
	X = iota * 2
	_
	Y
	Z
)` },
        options: ["0 2 4", "0 4 6", "0 1 2", "0 2 3"],
        answer: 1,
        explanation: "Lines are 0,1,2,3 and repeat `iota * 2`: X=0, _ =2, Y=4, Z=6.",
      },
      {
        id: "enums-q2",
        prompt: "`type Color int; const (Red Color = iota; Green)`. Does `var c Color = 99` compile?",
        options: ["No, 99 isn't a Color constant", "Yes", "Only with a cast", "Only in package main"],
        answer: 1,
        explanation: "99 is an untyped constant representable as int, so it converts implicitly to Color. Go enums aren't closed.",
      },
    ],
  },
  // ─────────────────────────────────────────────────────────────────────── json
  {
    slug: "json",
    track: "go",
    title: "JSON with encoding/json",
    summary:
      "Marshal and unmarshal Go values with struct tags; know the reflection-based rules for exported fields, omitempty, null vs [], numbers in `any`, and streaming decoders.",
    level: "beginner",
    frequency: "high",
    minutes: 20,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/structs-methods", "go/maps"],
    related: ["go/http-server", "go/http-client", "go/enums-iota", "backend/serialization"],
    tags: ["go", "json", "struct-tags", "reflection", "encoding"],
    sources: [
      { label: "Package encoding/json", url: "https://pkg.go.dev/encoding/json", kind: "docs" },
      { label: "JSON and Go (Go blog)", url: "https://go.dev/blog/json", kind: "docs" },
      { label: "Go 1.24 release notes (omitzero)", url: "https://go.dev/doc/go1.24", kind: "docs" },
      { label: "A new experimental Go API for JSON (Go blog)", url: "https://go.dev/blog/jsonv2-exp", kind: "docs" },
      notion("Notion: JSON", "https://app.notion.com/p/JSON-1a2e9488b51a81c6a3b8c2d4abeddd2b"),
      pgl,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Marshal/unmarshal structs using `json:\"…\"` tags and options (`omitempty`, `-`).",
              "Predict how unexported fields, nil slices, unknown keys and case are handled.",
              "Decode unknown shapes into `map[string]any` and know numbers become `float64`.",
              "Stream with `json.Decoder`/`Encoder` and reject unknown fields.",
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
              "`json.Marshal(v)` → `[]byte`; `json.Unmarshal(data, &v)` fills v (must be a non-nil pointer).",
              "Only **exported** (capitalized) fields are encoded or decoded; reflection can't set unexported fields from another package.",
              "A struct **tag** like `json:\"email,omitempty\"` renames the key and omits zero values; `json:\"-\"` skips the field.",
              "Types can customize behaviour by implementing `json.Marshaler`/`Unmarshaler` or `encoding.TextMarshaler`.",
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
	"encoding/json"
	"fmt"
	"strings"
)

type User struct {
	ID       int      \`json:"id"\`
	Name     string   \`json:"name"\`
	Email    string   \`json:"email,omitempty"\`
	Tags     []string \`json:"tags"\`
	Internal string   \`json:"-"\`
	password string   // unexported: invisible to encoding/json
}

func main() {
	u := User{ID: 1, Name: "Ada", Internal: "x", password: "secret"}
	b, err := json.Marshal(u)
	fmt.Println(string(b), err)

	var u2 User
	err = json.Unmarshal([]byte(\`{"ID":2,"NAME":"Lin","extra":true}\`), &u2)
	fmt.Println(u2.ID, u2.Name, err) // key matching is case-insensitive; unknown keys ignored

	var generic map[string]any
	json.Unmarshal([]byte(\`{"n": 42, "list": [1, "a"]}\`), &generic)
	fmt.Printf("%T %T\\n", generic["n"], generic["list"])

	dec := json.NewDecoder(strings.NewReader(\`{"id":3,"nmae":"typo"}\`))
	dec.DisallowUnknownFields()
	var u3 User
	fmt.Println(dec.Decode(&u3))
}`,
            output: `{"id":1,"name":"Ada","tags":null} <nil>
2 Lin <nil>
float64 []interface {}
json: unknown field "nmae"`,
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Reflection", detail: "encoding/json inspects types at run time with the `reflect` package: field names, tags, kinds." },
              { title: "Per-type codec cache", detail: "The first time a type is encoded, the package builds an encoder function for it and caches it (a `sync.Map` keyed by type), so later calls skip most reflection work." },
              { title: "Decoding", detail: "The scanner validates the input; for each object key the decoder finds the matching field — exact tag/name match preferred, then case-insensitive — and sets it via reflection. Unknown keys are skipped unless `DisallowUnknownFields` is set." },
              { title: "Interfaces", detail: "Decoding into `any` produces `map[string]any`, `[]any`, `float64`, `string`, `bool` or `nil`. Use `Decoder.UseNumber()` to keep numbers as `json.Number` (avoids precision loss above 2^53)." },
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Versions",
            text: "Go 1.24 added the `omitzero` tag option (omits zero values, including zero structs and `time.Time`, using `IsZero()` if defined). Go 1.25 shipped an experimental `encoding/json/v2` behind `GOEXPERIMENT=jsonv2` with stricter, faster defaults (e.g. case-sensitive matching). Check your Go version before relying on either.",
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "nil slice → `null`, empty slice → `[]`; nil map → `null`. Initialize to get `[]`/`{}` in APIs.",
              "`omitempty` doesn't omit zero-valued *structs* (use `omitzero` or a pointer).",
              "`[]byte` is encoded as a base64 string.",
              "Map keys are sorted when marshaling; map key types must be strings, integers or TextMarshalers.",
              "Unmarshal into an existing struct/map merges: fields absent from the input keep their previous values.",
              "Strings are HTML-escaped by default (`<` → `\\u003c`); use an `Encoder` with `SetEscapeHTML(false)` if needed.",
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
              "Lowercase field names → silently missing from output.",
              "Passing a non-pointer to Unmarshal → `json: Unmarshal(non-pointer …)` error.",
              "Ignoring the error from Unmarshal/Decode.",
              "Using `json.Unmarshal(io.ReadAll(body))` for large/untrusted bodies without a size limit; prefer `json.NewDecoder(http.MaxBytesReader(...))`.",
              "Typos in tags (`json:\"name, omitempty\"` with a space) — `go vet` reports malformed struct tags.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [{ type: "p", text: "encoding/json uses reflection to map exported struct fields to JSON keys, controlled by struct tags like `json:\"name,omitempty\"`. Unmarshal needs a pointer, matches keys case-insensitively and ignores unknown keys by default. Decoding into `any` yields maps, slices and float64 numbers. For HTTP bodies use a streaming Decoder with a size limit and optionally `DisallowUnknownFields`." }],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: ["Exported fields + tags.", "`omitempty`, `-`, (Go 1.24) `omitzero`.", "nil slice → null.", "`any` numbers → float64; `UseNumber` to preserve.", "Decoder/Encoder for streams."] }],
      },
    ],
    glossary: [
      { term: "Struct tag", definition: "A string literal after a field's type, read via reflection, e.g. `json:\"id\"`." },
      { term: "Marshal / Unmarshal", definition: "Convert a Go value to bytes (encode) / bytes to a Go value (decode)." },
      { term: "Reflection", definition: "Inspecting and manipulating types and values at run time (package `reflect`)." },
    ],
    followUps: [
      { q: "How do you distinguish a missing field from a zero value when decoding?", a: "Use a pointer field (`*int` is nil when absent), or decode into `map[string]json.RawMessage` and check keys." },
      { q: "Why might encoding/json be a bottleneck?", a: "Reflection and allocations per value. Options: reuse decoders, avoid `any`, use code-generated codecs or json/v2, or a different format (protobuf) for internal traffic." },
    ],
    quiz: [
      {
        id: "json-q1",
        prompt: "What does `json.Marshal(struct{ name string; Age int }{\"a\", 3})` produce?",
        options: ["`{\"name\":\"a\",\"Age\":3}`", "`{\"Age\":3}`", "`{}`", "An error"],
        answer: 1,
        explanation: "The unexported field `name` is ignored; `Age` is encoded with its Go name.",
      },
      {
        id: "json-q2",
        prompt: "Decoding `{\"n\": 7}` into `map[string]any` — what's the type of `m[\"n\"]`?",
        options: ["int", "int64", "float64", "json.Number"],
        answer: 2,
        explanation: "JSON numbers decode to float64 in an `any` unless `UseNumber()` is set on a Decoder.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────── http-server
  {
    slug: "http-server",
    track: "go",
    title: "HTTP servers with net/http",
    summary:
      "The `http.Handler` interface, the Go 1.22 pattern-matching ServeMux, middleware, one goroutine per connection, and the timeouts a production server needs.",
    level: "intermediate",
    frequency: "high",
    minutes: 25,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/interfaces", "go/json"],
    related: ["go/http-client", "go/graceful-shutdown", "go/context", "go/gin", "networks/http", "system-design/rest-api-design"],
    tags: ["go", "http", "net/http", "servemux", "middleware", "timeouts"],
    sources: [
      { label: "Package net/http", url: "https://pkg.go.dev/net/http", kind: "docs" },
      { label: "Routing Enhancements for Go 1.22 (Go blog)", url: "https://go.dev/blog/routing-enhancements", kind: "docs" },
      { label: "Package net/http/httptest", url: "https://pkg.go.dev/net/http/httptest", kind: "docs" },
      { label: "Tutorial: Writing Web Applications", url: "https://go.dev/doc/articles/wiki/", kind: "docs" },
      notion("Notion: HTTP Module", "https://app.notion.com/p/HTTP-Module-1a2e9488b51a8144a4fcf560c39ba9c5"),
      pgl,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Write handlers and register routes with method and path wildcards (Go 1.22+).",
              "Explain the `Handler` interface and how middleware wraps it.",
              "Describe the server's concurrency model (goroutine per connection).",
              "Configure timeouts and body limits; test handlers with `httptest`.",
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
            caption: "Everything in net/http's server side builds on one interface",
            code: `type Handler interface {
	ServeHTTP(ResponseWriter, *Request)
}

// HandlerFunc adapts an ordinary function to the Handler interface.
type HandlerFunc func(ResponseWriter, *Request)`,
          },
          {
            type: "p",
            text: "A **ServeMux** is a Handler that routes requests to other Handlers by pattern. Since Go 1.22 patterns may include a method and wildcards: `\"GET /users/{id}\"`, read with `r.PathValue(\"id\")`; `{path...}` matches the rest; `/{$}` matches only the exact path. The most specific pattern wins.",
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "go",
            caption: "Routing and testing in-process with httptest",
            code: `package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

func main() {
	mux := http.NewServeMux()
	// Go 1.22+ patterns: optional method + path wildcards.
	mux.HandleFunc("GET /users/{id}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, \`{"id":%q}\`, r.PathValue("id"))
	})

	// Exercise the handler in-process (no network) with httptest.
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, httptest.NewRequest("GET", "/users/42", nil))
	fmt.Println(rec.Code, rec.Body.String())

	rec = httptest.NewRecorder()
	mux.ServeHTTP(rec, httptest.NewRequest("POST", "/users/42", nil))
	fmt.Println(rec.Code, "Allow:", rec.Header().Get("Allow"))

	rec = httptest.NewRecorder()
	mux.ServeHTTP(rec, httptest.NewRequest("GET", "/nope", nil))
	fmt.Println(rec.Code)
}`,
            output: `200 {"id":"42"}
405 Allow: GET, HEAD
404`,
          },
          {
            type: "code",
            lang: "go",
            caption: "A production-shaped server: middleware, body limit, timeouts",
            code: `package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"
)

type createUser struct {
	Name string \`json:"name"\`
}

func logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
	})
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	})
	mux.HandleFunc("POST /users", func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, 1<<20) // limit body to 1 MiB
		var in createUser
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil || in.Name == "" {
			http.Error(w, "invalid body", http.StatusBadRequest)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{"name": in.Name})
	})

	srv := &http.Server{
		Addr:              ":8080",
		Handler:           logging(mux),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       60 * time.Second,
	}
	log.Fatal(srv.ListenAndServe())
}`,
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Accept loop", detail: "`Server.Serve` loops on `listener.Accept()` and starts **one goroutine per connection** (`go c.serve(ctx)`)." },
              { title: "Per connection", detail: "The goroutine reads a request, calls `Handler.ServeHTTP`, writes the response and, with keep-alive, reads the next request. HTTP/2 multiplexes streams, and each stream's handler runs in its own goroutine." },
              { title: "Blocking is fine", detail: "Handler code does blocking I/O; the runtime parks the goroutine on the netpoller (epoll/kqueue) and runs others." },
              { title: "Request context", detail: "`r.Context()` is cancelled when the client disconnects or the request completes — pass it to database/HTTP calls so work stops early." },
              { title: "Panics", detail: "A panic in a handler is recovered by the server, logged, and the connection closed — the process survives. Goroutines you spawn yourself are not protected." },
            ],
          },
          {
            type: "flow",
            nodes: ["Listener.Accept", "goroutine per conn", "read request", "middleware chain", "ServeMux", "your handler", "ResponseWriter"],
            caption: "Conceptual request path through net/http",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Using `http.ListenAndServe(addr, h)` in production — the default server has **no timeouts**, so slow clients (Slowloris) can hold connections forever.",
              "Writing headers after `WriteHeader`/`Write` — they're ignored (“superfluous response.WriteHeader call” in logs).",
              "Forgetting `return` after `http.Error`, then writing more output.",
              "Sharing mutable state across handlers without synchronization — handlers run concurrently.",
              "Registering on `http.DefaultServeMux` — any imported package (e.g. `net/http/pprof`) can add routes to it.",
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
              { title: "Standard library (net/http, Go 1.22+ mux)", points: ["No dependencies, stable API", "Method + wildcard routing built in", "You assemble middleware, validation, binding yourself"] },
              { title: "Frameworks (Gin, Echo, chi)", points: ["Routing groups, binding/validation, middleware ecosystem", "Extra dependency and API surface", "chi stays close to net/http; Gin uses its own context type"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [{ type: "p", text: "net/http revolves around the `Handler` interface — `ServeHTTP(w, r)`. ServeMux routes by pattern, and since 1.22 supports methods and path wildcards. The server runs each connection in its own goroutine, so handlers are concurrent and may block freely. Middleware is just a function taking and returning a Handler. In production I set Read/ReadHeader/Write/Idle timeouts on an explicit `http.Server`, limit body size, use `r.Context()` for cancellation and shut down with `Shutdown`." }],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Timeout semantics: `ReadHeaderTimeout` covers headers; `ReadTimeout` the whole request incl. body; `WriteTimeout` from end of header read to end of response write; `IdleTimeout` keep-alive waits. For per-handler deadlines use `http.TimeoutHandler` or `http.NewResponseController(w).SetWriteDeadline`.",
              "`Server.Shutdown(ctx)` stops accepting, closes idle connections and waits for active ones — see graceful shutdown.",
              "`httptest.NewRecorder` tests handlers without a network; `httptest.NewServer` starts a real loopback server for client tests.",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: ["Handler interface + HandlerFunc adapter.", "Go 1.22 mux: `\"GET /users/{id}\"` + `PathValue`.", "Goroutine per connection; handlers run concurrently.", "Always configure timeouts and body limits."] }],
      },
    ],
    glossary: [
      { term: "Handler", definition: "Any value with `ServeHTTP(http.ResponseWriter, *http.Request)`." },
      { term: "ServeMux", definition: "net/http's request router (multiplexer)." },
      { term: "Middleware", definition: "A function that wraps a Handler to add behaviour before/after it (logging, auth, recovery)." },
      { term: "Keep-alive", definition: "Reusing one TCP connection for multiple HTTP requests." },
    ],
    followUps: [
      { q: "How would you add authentication to a subset of routes?", a: "Wrap those handlers (or a sub-mux mounted under a prefix) with an auth middleware that validates the token and stores the user in the request context via `r.WithContext`." },
      { q: "What happens if a handler panics?", a: "net/http recovers it per connection, logs the stack and closes the connection; other requests keep working. Add your own recovery middleware to return a 500 and report the error." },
    ],
    quiz: [
      {
        id: "http-server-q1",
        prompt: "With `mux.HandleFunc(\"GET /items/{id}\", h)`, what does a `DELETE /items/1` request get?",
        options: ["200 from h", "404 Not Found", "405 Method Not Allowed", "It hangs"],
        answer: 2,
        explanation: "The path matches a pattern but the method doesn't, so the Go 1.22+ mux replies 405 with an Allow header.",
      },
      {
        id: "http-server-q2",
        prompt: "Why avoid `http.ListenAndServe(\":8080\", mux)` in production?",
        options: ["It's single-threaded", "It has no read/write/idle timeouts", "It doesn't support HTTP/1.1", "It can't use a custom mux"],
        answer: 1,
        explanation: "The zero-value Server it creates has no timeouts, making it vulnerable to slow or stuck clients.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────── http-client
  {
    slug: "http-client",
    track: "go",
    title: "HTTP clients done right",
    summary:
      "Reuse one `http.Client`, always set timeouts, close (and drain) response bodies, check status codes yourself, and pass a context for cancellation.",
    level: "intermediate",
    frequency: "high",
    minutes: 20,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/http-server", "go/json"],
    related: ["go/context", "go/concurrent-requests", "go/goroutine-leaks", "system-design/circuit-breakers-timeouts-retries"],
    tags: ["go", "http", "client", "timeouts", "connection-pooling"],
    sources: [
      { label: "Package net/http — Client and Transport", url: "https://pkg.go.dev/net/http#Client", kind: "docs" },
      { label: "Package context", url: "https://pkg.go.dev/context", kind: "docs" },
      notion("Notion: HTTP Client", "https://app.notion.com/p/HTTP-Client-1a2e9488b51a81c5b200e2edf793147d"),
      pgl,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Build requests with `http.NewRequestWithContext` and send them with a shared client.",
              "Explain connection pooling in `http.Transport` and why bodies must be closed and drained.",
              "Distinguish transport errors from HTTP error status codes.",
              "Choose client-level vs per-request timeouts.",
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
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"time"
)

func main() {
	// A throwaway local server so the example is self-contained.
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, \`{"name":"gopher"}\`)
	}))
	defer srv.Close()

	client := &http.Client{Timeout: 10 * time.Second} // reuse one client

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, srv.URL, nil)
	if err != nil {
		panic(err)
	}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("request failed:", err)
		return
	}
	defer resp.Body.Close() // always close, or the connection leaks

	if resp.StatusCode != http.StatusOK { // a 404/500 is NOT an error from Do
		io.Copy(io.Discard, resp.Body)
		fmt.Println("unexpected status:", resp.Status)
		return
	}

	var out struct {
		Name string \`json:"name"\`
	}
	if err := json.NewDecoder(io.LimitReader(resp.Body, 1<<20)).Decode(&out); err != nil {
		fmt.Println("decode:", err)
		return
	}
	fmt.Println(resp.StatusCode, out.Name)
}`,
            output: "200 gopher",
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Client → Transport", detail: "`http.Client` handles redirects, cookies and the overall timeout; its `Transport` (an `http.RoundTripper`) does the actual connection work." },
              { title: "Connection pool", detail: "`http.Transport` keeps idle keep-alive connections per host (`MaxIdleConnsPerHost` defaults to 2; `MaxIdleConns` 100) and reuses them, avoiding new TCP + TLS handshakes." },
              { title: "Body lifecycle", detail: "A connection returns to the pool only after the body is read to EOF **and** closed. Not closing leaks the connection and its goroutines; closing without reading may force the connection to be discarded." },
              { title: "Cancellation", detail: "The request's context deadline/cancel aborts dialing, TLS, waiting for headers and reading the body." },
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "Pool sizes and idle timeouts are `http.DefaultTransport` defaults that may change; set your own `Transport` for high-throughput clients (e.g. raise `MaxIdleConnsPerHost` when talking to one backend).",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "`http.Get(url)` uses `http.DefaultClient`, which has **no timeout** — a stuck server hangs your goroutine forever.",
              "Creating a new `http.Client`/`Transport` per request — defeats connection reuse and can exhaust sockets/ephemeral ports.",
              "Forgetting `defer resp.Body.Close()` — leaks connections; check `err` first (resp is nil on error).",
              "Treating a nil error as success: 4xx/5xx come back as a normal response with `err == nil`.",
              "Retrying non-idempotent requests (POST) blindly after a timeout.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Timeout", "Covers", "Use for"],
            rows: [
              ["`Client.Timeout`", "Whole exchange incl. reading the body", "Simple safety net"],
              ["Context deadline", "Per request; also cancels on caller cancellation", "Request-scoped budgets, propagation from incoming requests"],
              ["`Transport` dial/TLS/`ResponseHeaderTimeout`", "Individual phases", "Fine-grained control in high-traffic clients"],
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [{ type: "p", text: "I create one `http.Client` with a timeout and reuse it, since its Transport pools keep-alive connections. Each request gets a context with a deadline. After `Do`, I check the error, `defer resp.Body.Close()`, check the status code — a 500 isn't an error from Do — and read the body with a size limit, draining it so the connection can be reused." }],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: ["Reuse a client; never use DefaultClient without a timeout.", "Context per request.", "Close and drain bodies.", "Check status codes explicitly."] }],
      },
    ],
    glossary: [
      { term: "Transport", definition: "The `RoundTripper` that opens, pools and reuses connections for an http.Client." },
      { term: "Connection pooling", definition: "Keeping idle connections open to reuse them for later requests." },
      { term: "Idempotent", definition: "An operation that has the same effect if performed once or many times (GET, PUT, DELETE by design)." },
    ],
    followUps: [
      { q: "How would you fetch 100 URLs concurrently but at most 10 at a time?", a: "A worker pool or a buffered-channel semaphore of size 10, each request with its own context deadline, collecting results via a channel or indexed slice; `errgroup.SetLimit` does this neatly." },
    ],
    quiz: [
      {
        id: "http-client-q1",
        prompt: "A server returns 503. What does `resp, err := client.Do(req)` give you?",
        options: ["err != nil, resp == nil", "err == nil, resp.StatusCode == 503", "A panic", "err wraps 503"],
        answer: 1,
        explanation: "Do only returns an error for transport-level failures (or policy errors); HTTP status codes are in the response.",
      },
      {
        id: "http-client-q2",
        prompt: "Why must you close `resp.Body`?",
        options: ["To flush the request", "So the underlying connection can be reused or released", "To trigger GC", "It's optional"],
        answer: 1,
        explanation: "Unclosed bodies keep connections (and goroutines) busy; they leak until the process exits.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────── external-modules
  {
    slug: "external-modules",
    track: "go",
    title: "Using external modules",
    summary: "Add third-party dependencies with `go get`, and understand go.sum, minimal version selection, major-version import paths and the module proxy.",
    level: "beginner",
    frequency: "medium",
    minutes: 15,
    kinds: ["theory"],
    status: "authored",
    prerequisites: ["go/packages-modules"],
    related: ["go/tooling-gofmt", "go/gin", "production/pnpm-internals"],
    tags: ["go", "modules", "dependencies", "go.sum", "mvs", "semver"],
    sources: [
      { label: "Go Modules Reference", url: "https://go.dev/ref/mod", kind: "docs" },
      { label: "Tutorial: Create a Go module", url: "https://go.dev/doc/tutorial/create-module", kind: "docs" },
      { label: "Managing dependencies", url: "https://go.dev/doc/modules/managing-dependencies", kind: "docs" },
      { label: "Module proxy and checksum database", url: "https://proxy.golang.org/", kind: "docs" },
      notion("Notion: External modules", "https://app.notion.com/p/External-modules-1a2e9488b51a81359b1df7ddd90e7f06"),
      notion("Notion: Modules in Go", "https://app.notion.com/p/Modules-in-go-1a2e9488b51a814088f9c7d72140de4f"),
    ],
    sections: [
      {
        id: "objectives",
        blocks: [{ type: "list", items: ["Add, upgrade and remove dependencies.", "Explain what go.mod and go.sum record.", "Describe minimal version selection and major-version suffixes."] }],
      },
      {
        id: "walkthrough",
        blocks: [
          {
            type: "code",
            lang: "bash",
            code: `go get github.com/google/uuid@latest   # add/upgrade; records it in go.mod + go.sum
go get github.com/google/uuid@v1.6.0   # pin a version
go get github.com/google/uuid@none     # remove
go mod tidy                            # sync go.mod/go.sum with actual imports
go list -m all                         # show the selected build list
go mod why -m github.com/google/uuid   # why is this needed?`,
          },
          {
            type: "code",
            lang: "go",
            code: `package main

import (
	"fmt"

	"github.com/google/uuid"
)

func main() {
	fmt.Println(uuid.NewString()) // random each run
}`,
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "list",
            items: [
              "**Download path**: by default the `go` command fetches modules through `GOPROXY=https://proxy.golang.org,direct` and caches them read-only in `$GOPATH/pkg/mod`.",
              "**go.sum** stores hashes of each module version's content and go.mod; downloads are verified against it and against the public checksum database (`sum.golang.org`), so a tampered version is detected. Commit go.sum.",
              "**Minimal version selection (MVS)**: the build uses, for each module, the *highest* of the minimum versions required anywhere in the graph — never a newer release you didn't ask for. Builds are reproducible without a separate lock file.",
              "**Semantic import versioning**: v2+ of a module has a different import path (`example.com/lib/v2`), so v1 and v2 can coexist in one build.",
              "Private modules: set `GOPRIVATE=github.com/yourorg/*` to bypass the proxy and checksum DB.",
            ],
          },
          {
            type: "callout",
            tone: "note",
            text: "Other knobs: `replace` (point a module at a fork or local directory), `exclude`, `retract` (authors mark bad versions), `go mod vendor` (copy deps into `vendor/`), and since Go 1.24 `tool` directives (`go get -tool`) to track dev tools in go.mod.",
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Go modules (MVS)", points: ["go.mod is effectively the lock", "Upgrades happen only when you ask", "Strong integrity via go.sum + checksum DB"] },
              { title: "npm (semver ranges + lockfile)", points: ["Ranges like ^1.2.0 resolve to newest matching", "package-lock.json pins the result", "Nested/duplicated versions possible"] },
            ],
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [{ type: "list", items: ["Not committing go.sum.", "Leaving a local `replace ../lib` in a published module.", "Importing `example.com/lib` and expecting v2 — major versions need the `/v2` path.", "Pulling large dependency trees for trivial helpers — the standard library covers a lot."] }],
      },
      {
        id: "interview-short",
        blocks: [{ type: "p", text: "Dependencies are added with `go get` and recorded in go.mod; go.sum holds content hashes verified against the public checksum database. Go uses minimal version selection: it picks the highest minimum version that any module requires, so builds are reproducible without a lock file and nothing upgrades implicitly. Major versions from v2 on use a `/vN` import path so different majors can coexist." }],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: ["`go get`, `go mod tidy`.", "go.sum = integrity.", "MVS = predictable versions.", "`/v2` import paths for major versions."] }],
      },
    ],
    glossary: [
      { term: "MVS", definition: "Minimal version selection: Go's algorithm choosing the highest required minimum version of each module." },
      { term: "GOPROXY", definition: "Setting listing module proxies the go command downloads from." },
      { term: "Checksum database", definition: "A transparency log (sum.golang.org) of module hashes used to detect tampering." },
    ],
  },
  // ─────────────────────────────────────────────────────────────────── pointers
  {
    slug: "pointers",
    track: "go",
    title: "Pointers",
    summary:
      "A pointer holds the address of a variable. Go pointers are type-safe (no arithmetic), automatically dereferenced for field access, and it's safe to return a pointer to a local variable.",
    level: "beginner",
    frequency: "high",
    minutes: 20,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/functions", "go/structs-methods"],
    related: ["go/stack-vs-heap", "go/escape-analysis", "go/method-sets", "javascript/data-types"],
    tags: ["go", "pointers", "memory", "nil"],
    sources: [
      { label: "Spec — Pointer types", url: "https://go.dev/ref/spec#Pointer_types", kind: "docs" },
      { label: "Spec — Address operators", url: "https://go.dev/ref/spec#Address_operators", kind: "docs" },
      { label: "Go FAQ — When are function parameters passed by value?", url: "https://go.dev/doc/faq#pass_by_value", kind: "docs" },
      tour,
      pgl,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Use `&` (address-of) and `*` (dereference) and read pointer types like `*int`.",
              "Explain why returning `&local` is safe in Go but not in C.",
              "Decide when a pointer is the right choice (mutation, large values, optional values, identity).",
              "Avoid nil-pointer dereferences.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [{ type: "p", text: "A variable is a box in memory; a pointer is a note with the box's location. Handing someone the note lets them change what's in your box. Handing them a copy of the box (a value) doesn't." }],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "list",
            items: [
              "`*T` is the type “pointer to T”. Zero value: `nil`.",
              "`&x` yields the address of an **addressable** operand (variable, field, slice element, or a composite literal like `&Point{}`).",
              "`*p` reads or writes the value p points to. For struct pointers, `p.X` is shorthand for `(*p).X`.",
              "`new(T)` allocates a zeroed T and returns `*T`. (Go 1.26 also allows `new(expr)`, e.g. `new(42)`, returning a pointer to a copy of the value.)",
              "No pointer arithmetic outside the `unsafe` package; the GC always knows which words are pointers.",
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

import "fmt"

type Point struct{ X, Y int }

func inc(p *int) { *p++ }

func newPoint(x, y int) *Point {
	p := Point{x, y}
	return &p // safe in Go: p is moved to the heap if needed
}

func main() {
	x := 1
	p := &x // p holds the address of x
	inc(p)
	fmt.Println(x, *p, p == &x)

	q := new(int) // pointer to a fresh zero int
	fmt.Println(*q)

	pt := newPoint(1, 2)
	pt.X = 10 // shorthand for (*pt).X
	fmt.Println(*pt)

	var np *Point
	fmt.Println(np == nil)
	// fmt.Println(np.X) // panic: invalid memory address or nil pointer dereference
}`,
            output: `2 2 true
0
{10 2}
true`,
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "p",
            text: "A pointer is one machine word (8 bytes on 64-bit) holding an address. Returning `&p` from `newPoint` would be a dangling pointer in C, because the stack frame dies. Go's compiler runs **escape analysis**: when a variable's address may outlive its frame, the variable is allocated on the garbage-collected heap instead. The language guarantees memory safety; where the memory lives is the compiler's choice.",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "The spec never says “stack” or “heap”. It only guarantees a variable lives as long as it's reachable. Stack vs heap placement is decided by the `gc` compiler — see the next two lessons.",
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Use a pointer when…", points: ["The callee must modify the caller's value", "The value is large and copied often", "You need “no value” (`nil`) distinct from zero", "Identity matters (one shared instance, contains a mutex)"] },
              { title: "Prefer a value when…", points: ["The type is small (a few words)", "Immutability/copy safety is valuable", "You want to avoid heap allocation and GC work", "Concurrency: copies can't be raced on"] },
            ],
          },
          {
            type: "callout",
            tone: "misconception",
            title: "“Pointers are always faster”",
            text: "Passing a pointer avoids a copy but can force a heap allocation and adds indirection (cache misses, GC scanning). For small structs, values are often faster.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Dereferencing a nil pointer → `panic: runtime error: invalid memory address or nil pointer dereference`.",
              "Taking `&v` of a `range` value variable and storing it, thinking it points into the slice — it points to a copy (per-iteration since Go 1.22; before that, the same variable every time). Use `&s[i]`.",
              "Pointers to slices/maps (`*[]T`, `*map`) are rarely needed — those are already reference-like.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [{ type: "p", text: "A pointer stores a variable's address; `&` takes it and `*` follows it. Go has no pointer arithmetic, so pointers are memory-safe, and it's fine to return a pointer to a local variable because escape analysis moves it to the heap if it outlives the function. Use pointers to share/mutate state or avoid copying large values; small values are often better passed by value." }],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: ["`&x`, `*p`, `*T`, `new(T)`.", "No arithmetic; GC-tracked.", "Returning `&local` is safe (escape analysis).", "Values for small data, pointers for sharing/mutation."] }],
      },
    ],
    glossary: [
      { term: "Address", definition: "The location of a value in memory." },
      { term: "Dereference", definition: "Following a pointer to the value it points to (`*p`)." },
      { term: "Addressable", definition: "An operand you can take the address of: variables, pointer indirections, slice elements, fields of addressable structs." },
      { term: "Escape analysis", definition: "Compiler analysis deciding whether a value can live on the stack or must go to the heap." },
    ],
    followUps: [
      { q: "Can a pointer point into the middle of an array or struct?", a: "Yes, `&arr[3]` or `&s.Field` are interior pointers; the GC keeps the whole containing object alive." },
      { q: "What is unsafe.Pointer for?", a: "Low-level conversions between pointer types and uintptr (syscalls, runtime-like code). It bypasses type safety and must follow the documented rules to stay GC-safe." },
    ],
    quiz: [
      {
        id: "pointers-q1",
        prompt: "What does this print?",
        code: { lang: "go", code: `func set(p *int) { p = new(int); *p = 5 }

x := 1
set(&x)
fmt.Println(x)` },
        options: ["5", "1", "0", "panic"],
        answer: 1,
        explanation: "`p` is a copy of the address; reassigning it to a new int doesn't affect x. Only `*p = 5` before reassignment would.",
      },
      {
        id: "pointers-q2",
        prompt: "Returning `&local` from a function in Go is…",
        options: ["Undefined behaviour", "A compile error", "Safe — the variable is heap-allocated if needed", "Only safe for structs"],
        answer: 2,
        explanation: "Escape analysis detects the address escapes and allocates the variable on the heap.",
      },
    ],
  },

  // ────────────────────────────────────────────────────────────── stack-vs-heap
  {
    slug: "stack-vs-heap",
    track: "go",
    title: "Stack vs heap in Go",
    summary:
      "Each goroutine has its own small, growable stack; the heap is shared and garbage-collected. The compiler, not the programmer, decides where a value lives.",
    level: "intermediate",
    frequency: "high",
    minutes: 25,
    kinds: ["theory", "visualization", "coding"],
    status: "authored",
    prerequisites: ["go/pointers"],
    related: ["go/escape-analysis", "go/garbage-collection", "go/goroutine-stacks", "os/stack-vs-heap", "os/cpu-memory-hierarchy"],
    tags: ["go", "memory", "stack", "heap", "allocation", "runtime"],
    sources: [
      { label: "Go FAQ — How do I know whether a variable is allocated on the heap or the stack?", url: "https://go.dev/doc/faq#stack_or_heap", kind: "docs" },
      { label: "A Guide to the Go Garbage Collector", url: "https://go.dev/doc/gc-guide", kind: "docs" },
      { label: "Go 1.4 release notes (contiguous stacks)", url: "https://go.dev/doc/go1.4", kind: "docs" },
      { label: "Go 1.19 release notes (initial stack size)", url: "https://go.dev/doc/go1.19", kind: "docs" },
      { label: "runtime/malloc.go (allocator overview comment)", url: "https://github.com/golang/go/blob/master/src/runtime/malloc.go", kind: "docs" },
      pgl,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain what a stack frame and the heap are, and why stack allocation is cheaper.",
              "Describe Go's per-goroutine growable stacks (copying since Go 1.4).",
              "Outline the heap allocator (size classes, per-P caches) and its link to GC cost.",
              "Measure allocations with `testing.AllocsPerRun` / `-benchmem`.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "The stack is a notepad per worker: each function call tears off a fresh page and throws it away on return — instant and private. The heap is a shared warehouse: anything that must outlive a call goes there, and a cleaning crew (the GC) periodically finds what's no longer used.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "list",
            items: [
              "**Stack**: per-goroutine memory for function frames (locals, spilled registers, return addresses). Allocation = moving the stack pointer; freed automatically on return; no GC involvement.",
              "**Heap**: memory shared by all goroutines, managed by the runtime allocator and reclaimed by the garbage collector.",
              "**Escape**: a value *escapes* to the heap when the compiler can't prove it's unused after its function returns (or it's too large / of unknown size for the stack).",
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "Every heap allocation costs allocator time *and* future GC work (marking, sweeping, memory bandwidth). Stack allocation is nearly free. In hot paths, cutting heap allocations is often the single biggest Go performance win — which is why understanding placement matters.",
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Goroutine stacks start small", detail: "A new goroutine gets a small stack (2 KB minimum since Go 1.4; since Go 1.19 the runtime may start goroutines with a larger initial size based on the average stack usage it has observed). That's why millions of goroutines are feasible." },
              { title: "Growth check", detail: "Most function prologues compare the stack pointer against a guard. If the frame won't fit, the function calls `morestack`." },
              { title: "Contiguous stack copying", detail: "The runtime allocates a new stack twice the size, copies the old one and adjusts pointers that point into the stack, then resumes. This replaced segmented stacks in Go 1.4 (the “hot split” problem). The GC can also shrink stacks that use little of their space." },
              { title: "Max size", detail: "The maximum stack size is 1 GB on 64-bit (configurable with `debug.SetMaxStack`); infinite recursion ends with `fatal error: stack overflow`." },
              { title: "Heap allocator", detail: "Inspired by TCMalloc: small objects (≤32 KB) are rounded to one of ~68 size classes and served from spans cached per P (`mcache`) without locks, refilled from `mcentral`/`mheap`. Tiny pointer-free objects (<16 B) are packed together. Large objects get dedicated spans from the heap." },
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "All of this is the gc runtime",
            text: "Stack sizes, growth strategy, size classes and allocator structure are implementation details of the standard toolchain and have changed across releases (segmented → copying stacks in 1.4, adaptive initial size in 1.19). The language only promises that variables live as long as they're reachable.",
          },
          {
            type: "callout",
            tone: "note",
            title: "Why pointers into a stack are special",
            text: "Because stacks move when they grow, the runtime must find and fix every pointer into a stack. That's only tractable because escape analysis guarantees heap objects never point into a goroutine's stack, and other goroutines' stacks never do either.",
          },
        ],
      },
      { id: "visualization", blocks: [{ type: "viz", id: "mem-hierarchy", caption: "Conceptual latency ladder — stack data is usually hot in cache; scattered heap objects cause more cache misses." }] },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "go",
            caption: "Measuring heap allocations (noinline keeps the compiler from optimizing the comparison away)",
            code: `package main

import (
	"fmt"
	"testing"
)

type point struct{ x, y int }

//go:noinline
func byValue() point { return point{1, 2} }

//go:noinline
func byPointer() *point { return &point{1, 2} }

var sink *point

func main() {
	fmt.Println(testing.AllocsPerRun(100, func() { _ = byValue() }))
	fmt.Println(testing.AllocsPerRun(100, func() { sink = byPointer() }))
}`,
            output: `0
1`,
          },
          {
            type: "p",
            text: "`byValue` returns a copy in registers/stack: zero heap allocations. `byPointer` returns an address that outlives the call, so the `point` is heap-allocated each time. In real code you'd measure with `go test -bench . -benchmem`, which reports `allocs/op` and `B/op`.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Assuming `new`/`&T{}` means heap and plain declarations mean stack — placement depends only on escape analysis.",
              "Returning pointers to small structs “for performance”, creating GC pressure.",
              "Optimizing allocations without profiling first (`pprof` alloc profiles show where they happen).",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["", "Stack", "Heap"],
            rows: [
              ["Allocation cost", "Bump the stack pointer", "Allocator path (fast per-P cache, but more work)"],
              ["Freeing", "Automatic on return", "Garbage collector"],
              ["Visibility", "One goroutine", "Any goroutine"],
              ["Lifetime", "Until the function returns", "Until unreachable"],
              ["Size limits", "Compiler limits per variable; stack grows dynamically", "Bounded by memory / GOMEMLIMIT"],
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [{ type: "p", text: "Each goroutine has its own stack that starts small and grows by copying to a larger contiguous block; the heap is shared and garbage-collected. The compiler's escape analysis decides placement: values whose lifetime can't be proven to end with the function go to the heap. Stack allocation is nearly free while heap allocation costs allocator time and GC work, so reducing allocations in hot paths matters." }],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Copying stacks require precise pointer maps for each frame so the runtime can adjust pointers; the compiler emits them (also used by the GC to scan stacks).",
              "Stacks themselves are allocated from the heap's page allocator but are not scanned like heap objects — the GC scans them as roots.",
              "Size classes mean a 33-byte object occupies 48 bytes — internal fragmentation that `pprof` reports as allocated space.",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: ["Stack: per goroutine, growable, free on return.", "Heap: shared, GC-managed.", "Compiler decides via escape analysis.", "Fewer heap allocs = less GC work."] }],
      },
    ],
    glossary: [
      { term: "Stack frame", definition: "The region of a stack holding one function call's locals and bookkeeping." },
      { term: "Heap", definition: "Memory for values whose lifetime isn't tied to a single call; reclaimed by the GC." },
      { term: "morestack", definition: "Runtime routine invoked when a function needs more stack than is available; triggers stack growth." },
      { term: "Size class", definition: "Fixed allocation size buckets used by Go's allocator for small objects." },
      { term: "mcache", definition: "Per-P cache of spans that lets most small allocations proceed without locks." },
    ],
    followUps: [
      { q: "Why can Go run a million goroutines but not a million OS threads?", a: "Goroutine stacks start at a few KB and grow on demand, and switching is done by the runtime in user space. OS threads reserve large fixed stacks (often 1–8 MB of virtual memory) and switch via the kernel." },
      { q: "What happens on infinite recursion?", a: "The stack keeps doubling until it would exceed the max (1 GB on 64-bit), then the runtime aborts with `fatal error: stack overflow` (goroutine stack exceeds limit)." },
    ],
    quiz: [
      {
        id: "stack-heap-q1",
        prompt: "How does a Go goroutine stack grow (Go 1.4+)?",
        options: ["It can't grow", "By linking new segments", "By allocating a bigger contiguous stack and copying", "By borrowing the OS thread's stack"],
        answer: 2,
        explanation: "Contiguous stack copying replaced segmented stacks in Go 1.4.",
      },
      {
        id: "stack-heap-q2",
        prompt: "Who decides whether `x := T{}` lives on the stack or heap?",
        options: ["The programmer via `new`", "The compiler's escape analysis", "The GC at run time", "The OS"],
        answer: 1,
        explanation: "Placement is a compile-time decision by escape analysis, regardless of syntax.",
      },
    ],
  },

  // ────────────────────────────────────────────────────────── escape-analysis
  {
    slug: "escape-analysis",
    track: "go",
    title: "Escape analysis",
    summary:
      "The compiler proves which values can stay on the stack and moves the rest to the heap. `go build -gcflags=-m` shows its decisions so you can remove unnecessary allocations.",
    level: "advanced",
    frequency: "high",
    minutes: 25,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/stack-vs-heap", "go/interfaces"],
    related: ["go/garbage-collection", "go/profiling-pprof", "go/benchmarking-testing", "go/interface-internals-typed-nil"],
    tags: ["go", "escape-analysis", "compiler", "allocation", "performance"],
    sources: [
      { label: "Go FAQ — stack or heap", url: "https://go.dev/doc/faq#stack_or_heap", kind: "docs" },
      { label: "cmd/compile/internal/escape (source and design comment)", url: "https://github.com/golang/go/tree/master/src/cmd/compile/internal/escape", kind: "docs" },
      { label: "A Guide to the Go Garbage Collector — Eliminating heap allocations", url: "https://go.dev/doc/gc-guide#Eliminating_heap_allocations", kind: "docs" },
      pgl,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Read `-gcflags=-m` output: “moved to heap”, “escapes to heap”, “does not escape”.",
              "List the common causes of escape.",
              "Explain how inlining changes escape results.",
              "Know when it's worth fixing an escape.",
            ],
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "**Escape analysis** is a static analysis in the `gc` compiler. It builds a graph of how values and their addresses flow through assignments, calls and returns. If a value's address can reach somewhere that outlives the current function — a return value, a global, the heap, another goroutine — or the compiler can't tell, the value **escapes** and is heap-allocated. Otherwise it stays on the stack.",
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "go",
            caption: "esc/main.go",
            code: `package main

import "fmt"

type User struct{ Name string }

func stays() int {
	u := User{Name: "a"} // never leaves the frame
	return len(u.Name)
}

func escapes() *User {
	u := User{Name: "b"} // address returned to the caller
	return &u
}

func dynamic(n int) []int {
	return make([]int, n) // size unknown at compile time
}

func boxed(x int) {
	fmt.Println(x) // x converted to an interface (any)
}

func main() {
	_ = stays()
	_ = escapes()
	_ = dynamic(3)
	boxed(4)
}`,
          },
          {
            type: "code",
            lang: "bash",
            caption: "Output in a module named `gox` with Go 1.26 — wording and details vary by version",
            code: "go build -gcflags=-m ./esc",
            output: `# gox/esc
esc/main.go:7:6: can inline stays
esc/main.go:12:6: can inline escapes
esc/main.go:17:6: can inline dynamic
esc/main.go:21:6: can inline boxed
esc/main.go:22:13: inlining call to fmt.Println
esc/main.go:26:11: inlining call to stays
esc/main.go:27:13: inlining call to escapes
esc/main.go:28:13: inlining call to dynamic
esc/main.go:29:7: inlining call to boxed
esc/main.go:29:7: inlining call to fmt.Println
esc/main.go:13:2: moved to heap: u
esc/main.go:18:13: make([]int, n) escapes to heap
esc/main.go:22:13: ... argument does not escape
esc/main.go:22:14: x escapes to heap
esc/main.go:28:13: make([]int, 3) does not escape
esc/main.go:29:7: ... argument does not escape
esc/main.go:29:7: 4 escapes to heap`,
          },
          {
            type: "steps",
            steps: [
              { title: "13:2 moved to heap: u", detail: "In the standalone `escapes` function, `&u` is returned, so `u` must be heap-allocated." },
              { title: "18:13 make([]int, n) escapes", detail: "The new slice is returned to the caller, so its backing array must outlive `dynamic` (its size isn't a constant either)." },
              { title: "28:13 make([]int, 3) does not escape", detail: "After inlining `dynamic(3)` into main, the size is constant and the result unused, so it stays on the stack. **Inlining changed the answer.**" },
              { title: "22:14 x escapes to heap", detail: "Passing an int to `fmt.Println(...any)` converts it to an interface; the interface's data may need a heap copy (“boxing”). The `...` slice itself doesn't escape." },
              { title: "27:13 (no line for main's copy of u)", detail: "Once `escapes()` is inlined into main and its result discarded, nothing escapes there." },
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "Common causes of escape",
        blocks: [
          {
            type: "list",
            items: [
              "Returning a pointer to a local, or a slice/map/closure that references locals.",
              "Storing a pointer into a global, a heap object, a map, a channel, or a field of something that escapes.",
              "Converting to an interface when the interface value escapes (e.g. passed to `fmt` functions, stored in `[]any`) — boxing.",
              "Closures captured by goroutines or returned from the function.",
              "Sizes unknown at compile time (`make([]T, n)`) or too large: explicit variables over 128 KB, implicit ones (`new`, `&T{}`, `make`) over 64 KB.",
              "Calls through interfaces or function values the compiler can't see into: parameters are assumed to escape unless devirtualized.",
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "Escape analysis is an optimization of the `gc` compiler — results change between versions (e.g. size thresholds, newer stack allocation of small variable-size slices, PGO-driven inlining and devirtualization since Go 1.21). Use `-gcflags=-m=2` for the reasoning chain, and never rely on a particular decision for correctness.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Fixing an escape in a hot path",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Find it", detail: "Benchmark with `-benchmem` or take a pprof alloc profile; confirm allocations are significant." },
              { title: "Ask the compiler", detail: "`go build -gcflags=-m=2 ./pkg 2>&1 | grep file.go:LINE` explains why." },
              { title: "Restructure", detail: "Return values instead of pointers; let callers pass in a buffer (`func Read(p []byte)` style); avoid `any` in hot loops; preallocate with known sizes; reuse objects with `sync.Pool` when they're large and frequent." },
              { title: "Re-measure", detail: "Verify allocs/op dropped and the code is still readable." },
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
              "Micro-optimizing escapes in code that isn't hot — readability matters more.",
              "Using `-m` on a package while assuming results apply after inlining into another package's caller (and vice versa).",
              "Thinking `escapes to heap` for a small constant integer always means an allocation — the runtime avoids allocating for some values (e.g. small integers, zero-size values) when boxing.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [{ type: "p", text: "Escape analysis is the compiler deciding whether a value can live on the goroutine's stack or must be heap-allocated because a reference to it might outlive the function. Typical escapes are returning pointers to locals, storing into globals or heap objects, converting to interfaces like when calling `fmt.Println`, closures used by goroutines, and dynamically sized or very large allocations. You inspect it with `go build -gcflags=-m` and fix it only in measured hot paths." }],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "The analysis is flow-insensitive per function and summarizes each function's parameters (“leaks to result”, “does not escape”) so callers can use the summary without re-analyzing.",
              "Interfaces and indirect calls are opaque, so arguments escape conservatively; devirtualization (including PGO-guided) can recover this.",
              "Inlining exposes the callee body to the caller's analysis, which is why `-m` output for the same function can differ by call site.",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: ["Compiler-time decision: stack unless proven otherwise.", "`-gcflags=-m` (and `-m=2`) shows decisions.", "Pointers out, globals, interfaces, closures, unknown sizes → heap.", "Measure first; fix only hot paths."] }],
      },
    ],
    glossary: [
      { term: "Escape", definition: "When a value may be referenced after its function returns, forcing heap allocation." },
      { term: "Inlining", definition: "Replacing a function call with the body of the function at the call site." },
      { term: "Boxing", definition: "Storing a non-pointer value in an interface, which may require copying it to the heap." },
      { term: "Devirtualization", definition: "Turning an interface method call into a direct call when the concrete type is known." },
    ],
    followUps: [
      { q: "Does `sync.Pool` prevent escapes?", a: "No. Pooled objects are heap objects; the pool reduces how often you allocate new ones and how much garbage is created." },
      { q: "Why does `fmt.Println(x)` cause x to escape?", a: "Its parameter is `...any`; converting x to an interface and passing it into a function the compiler treats as letting arguments escape means the boxed copy is heap-allocated." },
    ],
    quiz: [
      {
        id: "escape-q1",
        prompt: "Which most likely causes a heap allocation?",
        options: ["`x := 5; return x`", "`p := Point{}; return &p`", "`var a [4]int; return a[0]`", "`s := make([]int, 8); return len(s)`"],
        answer: 1,
        explanation: "Returning the address of a local makes it escape. The others don't leak a reference out of the frame.",
      },
      {
        id: "escape-q2",
        prompt: "Which flag shows the compiler's escape decisions?",
        options: ["`go vet -escape`", "`go build -gcflags=-m`", "`GODEBUG=escape=1`", "`go test -race`"],
        answer: 1,
        explanation: "`-gcflags=-m` prints inlining and escape decisions; `-m=2` adds reasoning.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────── garbage-collection
  {
    slug: "garbage-collection",
    track: "go",
    title: "The Go garbage collector",
    summary:
      "Go uses a concurrent, tri-color, mark-and-sweep collector that is non-generational and non-moving, with write barriers, short stop-the-world pauses, and two tuning knobs: GOGC and GOMEMLIMIT.",
    level: "advanced",
    frequency: "high",
    minutes: 30,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/stack-vs-heap", "go/escape-analysis"],
    related: ["go/profiling-pprof", "javascript/memory-leaks-gc", "go/goroutine-leaks", "nodejs/v8-internals"],
    tags: ["go", "gc", "garbage-collection", "tri-color", "gogc", "gomemlimit", "runtime"],
    sources: [
      { label: "A Guide to the Go Garbage Collector", url: "https://go.dev/doc/gc-guide", kind: "docs" },
      { label: "Getting to Go: The Journey of Go's Garbage Collector (Go blog)", url: "https://go.dev/blog/ismmkeynote", kind: "docs" },
      { label: "Go GC: Prioritizing low latency and simplicity (Go blog, Go 1.5)", url: "https://go.dev/blog/go15gc", kind: "docs" },
      { label: "Proposal: Eliminate STW stack re-scanning (hybrid write barrier)", url: "https://github.com/golang/proposal/blob/master/design/17503-eliminate-rescan.md", kind: "docs" },
      { label: "Proposal: Soft memory limit (GOMEMLIMIT)", url: "https://github.com/golang/proposal/blob/master/design/48409-soft-memory-limit.md", kind: "docs" },
      { label: "The Green Tea Garbage Collector (Go blog)", url: "https://go.dev/blog/greenteagc", kind: "docs" },
      { label: "Package runtime/debug", url: "https://pkg.go.dev/runtime/debug", kind: "docs" },
      pgl,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain tri-color marking and why a write barrier is needed when marking runs concurrently.",
              "Walk through the phases of a GC cycle and where stop-the-world pauses occur.",
              "Use GOGC and GOMEMLIMIT and read a `gctrace` line.",
              "Contrast Go's GC with generational/moving collectors such as V8's.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Imagine painting a city map: start from the roads leading out of your house (roots), paint every reachable building grey, then visit each grey building, paint its neighbours grey and itself black. Buildings still white at the end are unreachable — demolish them. The twist: people keep building new roads while you paint, so a guard (the write barrier) reports road changes so you don't miss anything.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "list",
            items: [
              "**Mark-and-sweep**: find live objects by tracing pointers from roots (globals, goroutine stacks, registers), then free the unmarked ones.",
              "**Tri-color**: white = not yet seen (garbage if still white at the end); grey = reached but its pointers not scanned; black = reached and fully scanned. Invariant: no black object points to a white one.",
              "**Concurrent**: marking and sweeping run alongside your goroutines (the *mutator*), using ~25% of `GOMAXPROCS` for background workers plus *assists*.",
              "**Non-generational**: no separate young/old spaces. **Non-moving**: objects are never relocated or compacted.",
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
              { title: "1. Sweep termination (short STW)", detail: "Finish any leftover sweeping from the previous cycle; all Ps reach a safe point." },
              { title: "2. Mark setup", detail: "Enable the write barrier and mark assists, queue root-scanning jobs, then restart the world." },
              { title: "3. Concurrent mark", detail: "Background workers scan stacks (pausing one goroutine at a time), globals and heap objects, greying and blackening. Goroutines that allocate heavily are made to perform **mark assists** proportional to their allocation, so they can't outrun the collector." },
              { title: "4. Mark termination (short STW)", detail: "Confirm marking is complete, disable the write barrier, compute the next heap goal." },
              { title: "5. Concurrent sweep", detail: "Unmarked slots are reclaimed lazily as spans are needed for allocation and by a background sweeper." },
            ],
          },
          {
            type: "p",
            text: "**Write barrier.** While marking is concurrent, your code may store a pointer to a white object into a black object and delete the only other reference — the object would be wrongly freed. The compiler emits a small barrier on pointer writes into the heap during marking. Since Go 1.8 it's a **hybrid barrier** (Yuasa-style deletion + Dijkstra-style insertion) that removed the need to re-scan stacks during the STW mark termination, which is why pauses dropped to well under a millisecond in typical programs.",
          },
          {
            type: "p",
            text: "**Pacing.** The heap goal is roughly `live heap + (live heap + GC roots) × GOGC/100` (roots = stacks + globals, included since Go 1.18). With the default `GOGC=100`, the heap may grow to about twice the live data before the next cycle. The pacer starts each cycle early enough to finish marking before the goal is reached.",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Implementation, and it evolves",
            text: "The spec only requires automatic memory management. Everything here describes the `gc` runtime: concurrent collector since Go 1.5, hybrid barrier since 1.8, GOMEMLIMIT since 1.19. In Go 1.26 the **Green Tea** collector (experimental in 1.25) is on by default: still non-moving mark-sweep, but it scans small objects span-by-span for better memory locality, reducing GC CPU cost. Opt-out flags exist for a transition period.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Reading a gctrace line",
        blocks: [
          {
            type: "code",
            lang: "text",
            caption: "GODEBUG=gctrace=1 ./app — one line per cycle (example; numbers vary)",
            code: "gc 3 @0.038s 6%: 0.15+2.7+0.28 ms clock, 1.8+0.28/5.9/1.0+3.3 ms cpu, 3->3->1 MB, 4 MB goal, 0 MB stacks, 0 MB globals, 12 P",
          },
          {
            type: "table",
            head: ["Field", "Meaning"],
            rows: [
              ["`gc 3 @0.038s 6%`", "Third cycle, 38 ms after start, 6% of CPU spent in GC so far"],
              ["`0.15+2.7+0.28 ms clock`", "STW sweep termination + concurrent mark + STW mark termination (wall time)"],
              ["`… ms cpu`", "CPU time split into STW, assist/background/idle marking, mark termination"],
              ["`3->3->1 MB`", "Heap at GC start → heap at GC end → live (marked) heap"],
              ["`4 MB goal`", "Heap goal for this cycle"],
              ["`12 P`", "GOMAXPROCS"],
            ],
          },
          {
            type: "code",
            lang: "go",
            caption: "Setting the knobs from code (equivalent to the environment variables)",
            code: `package main

import (
	"fmt"
	"runtime"
	"runtime/debug"
)

func main() {
	debug.SetGCPercent(200)         // same as GOGC=200
	debug.SetMemoryLimit(512 << 20) // same as GOMEMLIMIT=512MiB

	var keep [][]byte
	for range 100 {
		keep = append(keep, make([]byte, 1<<20)) // 100 MiB live
	}

	var ms runtime.MemStats
	runtime.ReadMemStats(&ms) // briefly stops the world; fine for a demo
	fmt.Printf("heap in use: %d MiB, GC cycles: %d\\n", ms.HeapAlloc>>20, ms.NumGC)
	runtime.KeepAlive(keep)
}`,
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Knob", "Effect", "Trade-off"],
            rows: [
              ["`GOGC` higher (e.g. 200)", "Fewer GC cycles", "More peak memory"],
              ["`GOGC` lower (e.g. 50)", "Less memory", "More CPU spent on GC"],
              ["`GOGC=off`", "No GC by proportion", "Heap grows unbounded — only sensible with GOMEMLIMIT"],
              ["`GOMEMLIMIT=…` (Go 1.19+)", "Soft cap: GC runs more often as total Go memory nears the limit", "Too low → GC thrashing; the runtime caps GC CPU (~50%) to avoid a death spiral, so memory may exceed the limit"],
            ],
          },
          {
            type: "compare",
            items: [
              { title: "Go GC", points: ["Concurrent, non-moving, non-generational", "Optimized for low latency (sub-ms pauses typical)", "Relies on escape analysis + value types to produce less garbage", "No compaction: fragmentation managed by size classes"] },
              { title: "V8 (Node) GC", points: ["Generational: fast scavenges of a young space", "Moving/compacting (copying young gen, compacting old)", "Many short-lived objects are cheap", "Incremental/concurrent marking for the old generation"] },
            ],
          },
          {
            type: "callout",
            tone: "note",
            title: "Why no generations or compaction?",
            text: "Go hands out interior pointers freely and values are often embedded rather than separately allocated; escape analysis keeps many short-lived values off the heap entirely, which weakens the generational hypothesis's payoff. A non-moving design also simplifies cgo interop and avoids needing read barriers.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Calling `runtime.GC()` in production code to “free memory” — it blocks the caller until a full cycle completes.",
              "Assuming memory returns to the OS immediately — the scavenger returns unused pages gradually; RSS lags behind heap size.",
              "Running in a container with a memory limit but no `GOMEMLIMIT` — set it a bit below the container limit (e.g. 90%).",
              "Blaming the GC when the real issue is a leak: goroutines blocked forever, growing maps, sub-slices retaining large arrays, unbounded caches.",
              "Using finalizers for resource cleanup; prefer explicit `Close`. (Go 1.24 added `runtime.AddCleanup`, a safer alternative to `SetFinalizer`, and the `weak` package.)",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [{ type: "p", text: "Go's GC is a concurrent tri-color mark-and-sweep collector. It's non-generational and non-moving. Marking runs alongside the program with a write barrier — a hybrid barrier since Go 1.8 — so only two short stop-the-world phases remain, usually well under a millisecond. Goroutines that allocate fast are made to assist marking. GOGC sets how much the heap may grow relative to live data before the next cycle (default 100), and GOMEMLIMIT (Go 1.19) sets a soft total memory limit. The best tuning is allocating less." }],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Roots: goroutine stacks (scanned precisely with compiler-emitted pointer maps), globals, finalizer queues. Each stack is scanned while that goroutine is briefly paused, not the whole world.",
              "GC CPU: about 25% of GOMAXPROCS in dedicated background workers, plus assists; idle Ps also help mark.",
              "Latency sources besides STW: mark assists slowing allocating goroutines, and the write barrier slowing pointer writes during marking.",
              "Memory limit + GOGC=off is a pattern for batch jobs: no GC until memory approaches the limit.",
              "Tools: `GODEBUG=gctrace=1`, `runtime/metrics`, pprof heap/allocs profiles, execution traces (`go tool trace`) show GC phases.",
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
              "Concurrent tri-color mark-sweep; non-generational, non-moving.",
              "Hybrid write barrier (1.8) → short STW pauses.",
              "GOGC = growth ratio; GOMEMLIMIT = soft limit (1.19).",
              "Green Tea marking default in 1.26 (implementation detail).",
              "Allocate less > tune more.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Root", definition: "A starting point for tracing: globals, goroutine stacks, registers." },
      { term: "Tri-color marking", definition: "Tracing algorithm that partitions objects into white, grey and black sets." },
      { term: "Write barrier", definition: "Code run on pointer writes during marking to keep the tri-color invariant." },
      { term: "STW (stop-the-world)", definition: "A pause where all goroutines are stopped so the runtime can do a step atomically." },
      { term: "Mark assist", definition: "Marking work charged to a goroutine in proportion to how much it allocates during a GC cycle." },
      { term: "GOGC", definition: "Percentage controlling heap growth between cycles (default 100)." },
      { term: "GOMEMLIMIT", definition: "Soft limit on the Go runtime's total memory use (Go 1.19+)." },
      { term: "Pacer", definition: "The runtime component that decides when to start a GC cycle to meet the heap goal." },
    ],
    followUps: [
      { q: "Why doesn't Go need a read barrier?", a: "Because objects never move. Moving collectors need read (or load) barriers to redirect access to relocated objects; Go's non-moving design only needs a write barrier during marking." },
      { q: "A service uses 2× more memory than its live heap. Is that a leak?", a: "Not necessarily: with GOGC=100 the heap goal is about 2× live heap, plus fragmentation and pages not yet returned to the OS. Check live heap in a heap profile and its trend over time." },
      { q: "What's a GC death spiral and how does Go avoid it?", a: "When memory is near a limit, GC runs constantly and the program makes no progress. With GOMEMLIMIT, the runtime caps GC CPU use (roughly 50% over a window), preferring to exceed the limit rather than stall." },
    ],
    quiz: [
      {
        id: "gc-q1",
        prompt: "Which describes Go's GC?",
        options: ["Generational and compacting", "Reference counting", "Concurrent, non-moving tri-color mark-sweep", "Stop-the-world copying collector"],
        answer: 2,
        explanation: "Go traces concurrently with a write barrier, doesn't move objects and has no generations.",
      },
      {
        id: "gc-q2",
        prompt: "Live heap is 100 MB with GOGC=100 and negligible stacks/globals. Roughly when will the next cycle target finishing?",
        options: ["At 100 MB", "At ~200 MB total heap", "At ~150 MB", "Only when memory runs out"],
        answer: 1,
        explanation: "Heap goal ≈ live + live × GOGC/100 = 200 MB.",
      },
      {
        id: "gc-q3",
        prompt: "What problem does the write barrier solve?",
        options: ["Data races between goroutines", "The mutator hiding a white object behind a black one during concurrent marking", "Returning memory to the OS", "Stack overflow"],
        answer: 1,
        explanation: "Without it, a pointer moved into an already-scanned object could leave a live object white, and it would be freed.",
      },
    ],
  },

  // ────────────────────────────────────────────── interface-internals-typed-nil
  {
    slug: "interface-internals-typed-nil",
    track: "go",
    title: "Interface internals and the typed-nil trap",
    summary:
      "An interface value is a (type, data) pair. It equals nil only when both are nil — so a nil pointer stored in an interface is not a nil interface.",
    level: "advanced",
    frequency: "very-high",
    minutes: 25,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/interfaces", "go/pointers", "go/errors"],
    related: ["go/method-sets", "go/escape-analysis", "go/error-wrapping"],
    tags: ["go", "interfaces", "itab", "nil", "runtime", "gotcha"],
    sources: [
      { label: "Go FAQ — Why is my nil error value not equal to nil?", url: "https://go.dev/doc/faq#nil_error", kind: "docs" },
      { label: "Spec — Interface types / Comparison operators", url: "https://go.dev/ref/spec#Comparison_operators", kind: "docs" },
      { label: "Go Data Structures: Interfaces (Russ Cox)", url: "https://research.swtch.com/interfaces", kind: "external" },
      { label: "The Laws of Reflection (Go blog)", url: "https://go.dev/blog/laws-of-reflection", kind: "docs" },
      { label: "runtime/iface.go and runtime/runtime2.go", url: "https://github.com/golang/go/blob/master/src/runtime/iface.go", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Draw an interface value as two words and explain `iface` vs `eface` and the itab.",
              "Explain exactly why `var p *T = nil; var i I = p; i != nil`.",
              "Write error-returning functions that never return a typed nil.",
              "Explain the costs of interfaces: boxing allocations and dynamic dispatch.",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [{ type: "p", text: "An interface is a labelled envelope: the label says what type is inside, the contents are the value. A nil interface is an envelope with no label and nothing inside. Put a nil `*MyErr` in it and the envelope now has a label (“*MyErr”) even though the contents are empty — so it's no longer “nothing”." }],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "code",
            lang: "go",
            caption: "Conceptual runtime layout (gc toolchain, simplified)",
            code: `// interface with methods, e.g. error, io.Reader
type iface struct {
	tab  *itab          // (interface type, concrete type) + method table
	data unsafe.Pointer // pointer to the value (or the value itself if pointer-shaped)
}

// empty interface: any
type eface struct {
	_type *_type        // concrete type descriptor
	data  unsafe.Pointer
}

type itab struct {
	inter *interfacetype
	_type *_type
	hash  uint32     // copy of _type.hash, used by type switches
	fun   [1]uintptr // variable-sized: method addresses in sorted order
}`,
          },
          {
            type: "p",
            text: "An interface value `== nil` only if **both** words are nil: no dynamic type and no value. Comparing two interfaces compares dynamic types first, then values.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "The typed-nil bug, step by step",
        blocks: [
          {
            type: "code",
            lang: "go",
            code: `package main

import "fmt"

type MyErr struct{}

func (*MyErr) Error() string { return "boom" }

func mayFail(fail bool) error {
	var e *MyErr // nil pointer
	if fail {
		e = &MyErr{}
	}
	return e // BUG: wraps a nil *MyErr in a non-nil interface
}

func mayFailFixed(fail bool) error {
	if fail {
		return &MyErr{}
	}
	return nil // untyped nil: interface with no type and no value
}

func main() {
	err := mayFail(false)
	fmt.Println(err == nil)
	fmt.Printf("%T %v\\n", err, err)

	fmt.Println(mayFailFixed(false) == nil)

	var p *MyErr
	var i any = p
	fmt.Println(p == nil, i == nil, i == (*MyErr)(nil))
}`,
            output: `false
*main.MyErr boom
true
true false true`,
          },
          {
            type: "steps",
            steps: [
              { title: "`var e *MyErr`", detail: "A nil pointer of a concrete type." },
              { title: "`return e` as `error`", detail: "The compiler converts it: tab = itab(error, *MyErr), data = nil. The type word is set." },
              { title: "`err == nil`", detail: "Compares against an interface with tab = nil, data = nil. The tab differs → false." },
              { title: "Calling `err.Error()` works", detail: "Dispatch only needs the itab; the method has a pointer receiver that doesn't dereference, so it prints “boom”. A method that read a field would panic with a nil dereference." },
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
            caption: "Peeking at the two words with unsafe (illustration only — never do this in real code)",
            code: `package main

import (
	"fmt"
	"unsafe"
)

// Mirrors the gc runtime's layout of an empty interface. Never do this in real code.
type eface struct {
	typ  unsafe.Pointer
	data unsafe.Pointer
}

type T struct{ n int }

func main() {
	var empty any
	var p *T
	var typedNil any = p
	var boxed any = T{7}

	for _, v := range []*any{&empty, &typedNil, &boxed} {
		e := (*eface)(unsafe.Pointer(v))
		fmt.Println(e.typ != nil, e.data != nil, *v == nil)
	}
	fmt.Println(unsafe.Sizeof(empty))
}`,
            output: `false false true
true false false
true true false
16`,
          },
          {
            type: "list",
            items: [
              "**Method call** `i.M()`: load `tab.fun[k]` and call it with `data` as the receiver — one indirect call. It usually can't be inlined unless the compiler devirtualizes it (statically or with PGO since Go 1.21).",
              "**itab creation**: the compiler emits itabs it can see statically; others are built at run time on first use and cached in a global hash table keyed by (interface, type).",
              "**Type assertion to a concrete type** compares the type pointer — very cheap. **Assertion/switch to an interface type** needs an itab lookup (cached; Go 1.22 added per-call-site caches).",
              "**Boxing**: storing a non-pointer value (e.g. a struct or a large int) in an interface usually copies it to the heap so `data` can point to it. Pointer-shaped values (pointers, maps, chans, funcs, single-pointer structs) go directly in the data word. The runtime avoids allocating for zero-size values, single-byte values and small integers, and escape analysis can keep non-escaping boxes on the stack.",
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "The two-word layout, itab structure, caching and boxing optimizations are `gc` runtime details (field names have moved between packages across versions). The *semantics* — an interface holds a dynamic type and value, and is nil only when it holds neither — are from the spec.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Declaring `var err *MyErr` and returning it through an `error` result. Return the literal `nil` on success.",
              "Storing a nil pointer in an `io.Writer`/`http.Handler` field and checking `!= nil` before calling it.",
              "Checking `if x == nil` on an `any` parameter to detect nil pointers — use `reflect.ValueOf(x).IsNil()` (guarded by Kind) only if you truly must; better, design APIs so it doesn't matter.",
              "Comparing interfaces whose dynamic types are non-comparable (e.g. slices) → run-time panic.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [{ type: "p", text: "An interface value is two words: a type word (an itab with the method table for non-empty interfaces, or a type descriptor for `any`) and a data pointer. It's nil only if both are nil. If you assign a nil `*T` to an interface, the type word is set, so the interface is non-nil — the classic case is a function returning a nil custom-error pointer as `error`, making `err != nil` true. The fix is to return a literal `nil`." }],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Why the design: the type word is needed for dispatch and type switches, so a value-less interface with a type is meaningful (you can still call pointer methods that handle nil receivers).",
              "Performance: interface calls block inlining and cause boxing; in hot paths prefer concrete types or generics (note: generic functions over interface constraints may still use dictionaries, so measure).",
              "`errors.Is(err, nil)` doesn't save you: a typed nil isn't nil under any comparison.",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: ["Interface = (type/itab, data).", "nil interface ⇔ both words nil.", "Typed nil pointer in an interface ≠ nil.", "Return literal `nil` for no error.", "Costs: boxing + indirect calls."] }],
      },
    ],
    glossary: [
      { term: "itab", definition: "Runtime table pairing an interface type with a concrete type, holding the method pointers." },
      { term: "iface / eface", definition: "Runtime representations of non-empty and empty interfaces respectively." },
      { term: "Typed nil", definition: "A nil pointer (or other nil-able value) of a concrete type stored in an interface, making the interface non-nil." },
      { term: "Boxing", definition: "Storing a value in an interface, potentially copying it to the heap." },
    ],
    followUps: [
      { q: "Can a method be called on a nil pointer receiver?", a: "Yes, if it doesn't dereference the receiver. Some types use this deliberately (e.g. a nil *Tree treated as empty)." },
      { q: "How big is an interface value?", a: "Two machine words — 16 bytes on 64-bit platforms." },
      { q: "How do you check if an interface holds a nil pointer?", a: "Type-assert to the concrete pointer type and compare, or use reflect: `v := reflect.ValueOf(x); v.Kind() == reflect.Pointer && v.IsNil()`." },
    ],
    quiz: [
      {
        id: "typednil-q1",
        prompt: "What does this print?",
        code: { lang: "go", code: `var buf *bytes.Buffer
var w io.Writer = buf
fmt.Println(w == nil)` },
        options: ["true", "false", "Compile error", "panic"],
        answer: 1,
        explanation: "w has dynamic type *bytes.Buffer and a nil value — the type word is set, so it's not a nil interface.",
      },
      {
        id: "typednil-q2",
        prompt: "Which return statement makes `err == nil` true for the caller of `func f() error`?",
        options: ["`var e *MyErr; return e`", "`return (*MyErr)(nil)`", "`return nil`", "All of them"],
        answer: 2,
        explanation: "Only the untyped nil produces an interface with no type and no value.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────── method-sets
  {
    slug: "method-sets",
    track: "go",
    title: "Method sets and addressability",
    summary:
      "The method set of `T` contains value-receiver methods; the method set of `*T` contains both. Method sets decide interface satisfaction, and addressability decides when Go can auto-take `&`.",
    level: "intermediate",
    frequency: "high",
    minutes: 20,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["go/structs-methods", "go/interfaces", "go/pointers"],
    related: ["go/interface-internals-typed-nil", "go/maps"],
    tags: ["go", "method-sets", "receivers", "interfaces", "addressability", "embedding"],
    sources: [
      { label: "Spec — Method sets", url: "https://go.dev/ref/spec#Method_sets", kind: "docs" },
      { label: "Spec — Calls (addressability shorthand)", url: "https://go.dev/ref/spec#Calls", kind: "docs" },
      { label: "Spec — Struct types (promoted methods)", url: "https://go.dev/ref/spec#Struct_types", kind: "docs" },
      { label: "Go FAQ — Why do T and *T have different method sets?", url: "https://go.dev/doc/faq#different_method_sets", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "State the method-set rules for `T` and `*T`, including embedded fields.",
              "Explain why `T` doesn't satisfy an interface whose methods have pointer receivers.",
              "Know which expressions are addressable and why `c.Inc()` works on a variable but not on a map element.",
            ],
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Type", "Method set"],
            rows: [
              ["`T`", "Methods declared with receiver `T`"],
              ["`*T`", "Methods with receiver `T` **and** `*T`"],
              ["Struct `S` embedding `T`", "`S` and `*S` get promoted `T` methods; `*S` also gets `*T` methods"],
              ["Struct `S` embedding `*T`", "`S` and `*S` both get `T` and `*T` methods"],
              ["Interface type", "Its declared (and embedded) methods"],
            ],
          },
          {
            type: "p",
            text: "**Addressable** operands: variables, pointer indirections (`*p`), slice index expressions, field selectors of addressable structs, and array indexes of addressable arrays. Not addressable: map elements, function return values, constants, values stored inside interfaces.",
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

import "fmt"

type Counter struct{ n int }

func (c *Counter) Inc()      { c.n++ }
func (c Counter) Value() int { return c.n }

type Incrementer interface{ Inc() }
type Valuer interface{ Value() int }

func main() {
	var c Counter
	c.Inc() // OK: c is addressable, so Go rewrites this to (&c).Inc()
	fmt.Println(c.Value())

	var inc Incrementer = &c // *Counter has Inc
	inc.Inc()
	// var bad Incrementer = c // compile error: Counter does not implement
	//                         // Incrementer (method Inc has pointer receiver)

	var v1 Valuer = c  // Counter has Value
	var v2 Valuer = &c // *Counter also has Value
	fmt.Println(v1.Value(), v2.Value())

	m := map[string]Counter{"a": {}}
	// m["a"].Inc() // compile error: cannot call pointer method Inc on Counter
	fmt.Println(m["a"].Value())
}`,
            output: `1
2 2
0`,
          },
          {
            type: "callout",
            tone: "note",
            title: "Why v1 prints 2",
            text: "`v1` was assigned *after* `inc.Inc()` ran, so it boxed a copy of `c` with n = 2. Later changes to `c` would not affect `v1`; `v2` holds a pointer and would see them.",
          },
        ],
      },
      {
        id: "why",
        title: "Why the rule exists",
        blocks: [
          {
            type: "p",
            text: "Storing `c` in an interface copies it, and the copy inside an interface is not addressable. If Go let a value `Counter` satisfy `Incrementer`, then `inc.Inc()` would have to take the address of that hidden copy and increment *it* — the original `c` would silently not change. Excluding pointer methods from `T`'s method set turns that silent bug into a compile error.",
          },
          {
            type: "p",
            text: "The `c.Inc()` convenience is different: it's call-site sugar for `(&c).Inc()` that only applies when `c` is addressable, so the mutation reaches the real variable. Map elements aren't addressable (entries can move), hence `m[\"a\"].Inc()` is rejected.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Passing a struct value where an interface with pointer-receiver methods is expected — pass `&v`.",
              "Registering `MyHandler{}` instead of `&MyHandler{}` when `ServeHTTP` has a pointer receiver.",
              "Storing structs in maps and trying to call mutating methods on them — use `map[K]*T` or read-modify-write.",
              "Ranging over `[]T` and calling a pointer method on the loop variable, mutating the copy instead of the element — use `s[i].Inc()`.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [{ type: "p", text: "The method set of `T` contains only value-receiver methods, while `*T` has both value and pointer receivers. Interface satisfaction uses method sets, so if any required method has a pointer receiver, only `*T` implements the interface. That's because an interface holds a copy of the value that isn't addressable, so pointer methods would mutate a hidden copy. Separately, calling `v.PtrMethod()` on an addressable variable is allowed because Go inserts `&v`; it doesn't work on map elements or return values." }],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: ["`T`: value methods. `*T`: value + pointer methods.", "Interfaces check method sets.", "Auto-`&` only for addressable operands.", "Map elements and interface contents aren't addressable."] }],
      },
    ],
    glossary: [
      { term: "Method set", definition: "The set of methods callable on a type, used to decide interface satisfaction." },
      { term: "Addressable", definition: "An expression whose memory location can be taken with `&`." },
      { term: "Promoted method", definition: "A method of an embedded field that is accessible directly on the outer struct." },
    ],
    followUps: [
      { q: "Why can a *T call value-receiver methods?", a: "Because dereferencing a pointer always yields a value to copy, so `p.Value()` is `(*p).Value()`; there's no risk of mutating a hidden copy." },
      { q: "If S embeds *T, does S (a value) implement an interface needing T's pointer methods?", a: "Yes. With an embedded pointer, both S and *S include T's and *T's methods, because the pointer is already available inside S." },
    ],
    quiz: [
      {
        id: "method-sets-q1",
        prompt: "`type T struct{}; func (*T) M() {}; type I interface{ M() }`. Which compiles?",
        options: ["`var i I = T{}`", "`var i I = &T{}`", "Both", "Neither"],
        answer: 1,
        explanation: "Only *T's method set contains M.",
      },
      {
        id: "method-sets-q2",
        prompt: "Why does `m[\"k\"].Inc()` (pointer receiver, `map[string]Counter`) fail to compile?",
        options: ["Maps can't hold structs", "Map elements aren't addressable", "Inc must be exported", "Maps are read-only"],
        answer: 1,
        explanation: "Go can only insert `&` for addressable operands; map entries may move, so they aren't addressable.",
      },
    ],
  },
];
