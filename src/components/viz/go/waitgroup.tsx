"use client";
import { useState } from "react";
import { cn } from "@/components/ui/cn";
import { Chip, Narration, Panel, Segmented, StepControls, VizFrame, useStepper } from "../kit";

type WState = "not started" | "runnable" | "running" | "done" | "killed";
type MainState = "running" | "blocked in Wait" | "exited";

interface Step {
  /** highlighted source lines with who is executing them */
  hl: { line: number; who: string }[];
  counter: number;
  main: MainState;
  workers: [WState, WState, WState];
  out?: string;
  note: string;
}

interface Scenario {
  id: "ok" | "bug";
  label: string;
  code: string[];
  steps: Step[];
}

const NS: WState = "not started";

const SCENARIOS: Scenario[] = [
  {
    id: "ok",
    label: "A · Correct",
    code: [
      "func main() {",
      "    var wg sync.WaitGroup",
      "    wg.Add(3)",
      "    for i := 1; i <= 3; i++ {",
      "        go worker(i, &wg)",
      "    }",
      "    wg.Wait()",
      '    fmt.Println("all done")',
      "}",
      "",
      "func worker(id int, wg *sync.WaitGroup) {",
      "    defer wg.Done()",
      "    work(id)",
      "}",
    ],
    steps: [
      { hl: [{ line: 1, who: "main" }], counter: 0, main: "running", workers: [NS, NS, NS], note: "A WaitGroup is a counter plus a way to sleep until it reaches zero. Its zero value is ready to use, with counter 0." },
      { hl: [{ line: 2, who: "main" }], counter: 3, main: "running", workers: [NS, NS, NS], note: "main calls wg.Add(3) before starting any goroutine. The counter now says: three pieces of work are outstanding." },
      { hl: [{ line: 4, who: "main" }], counter: 3, main: "running", workers: ["runnable", "runnable", "runnable"], note: "The loop starts three goroutines. `go` returns immediately: the workers are runnable, but none may have run yet." },
      { hl: [{ line: 6, who: "main" }], counter: 3, main: "blocked in Wait", workers: ["runnable", "runnable", "runnable"], note: "wg.Wait() sees counter 3 > 0, so main parks. It uses no CPU while it waits." },
      { hl: [{ line: 12, who: "W2" }], counter: 3, main: "blocked in Wait", workers: ["runnable", "running", "runnable"], note: "The scheduler happens to run worker 2 first. Order between goroutines is not guaranteed." },
      { hl: [{ line: 11, who: "W2" }], counter: 2, main: "blocked in Wait", workers: ["runnable", "done", "runnable"], note: "Worker 2 returns; its deferred wg.Done() runs (Done is Add(-1)). Counter 3 → 2. Using defer means Done runs even if work panics or returns early." },
      { hl: [{ line: 12, who: "W1" }, { line: 12, who: "W3" }], counter: 2, main: "blocked in Wait", workers: ["running", "done", "running"], note: "Workers 1 and 3 run in parallel on different Ps." },
      { hl: [{ line: 11, who: "W1" }], counter: 1, main: "blocked in Wait", workers: ["done", "done", "running"], note: "Worker 1 finishes: counter 2 → 1. main is still parked." },
      { hl: [{ line: 11, who: "W3" }, { line: 6, who: "main" }], counter: 0, main: "running", workers: ["done", "done", "done"], note: "Worker 3 finishes: counter 1 → 0. Reaching zero releases every goroutine blocked in Wait, so main wakes up." },
      { hl: [{ line: 7, who: "main" }], counter: 0, main: "exited", workers: ["done", "done", "done"], out: "all done", note: "main prints and returns. All work really is done, and Done happened-before Wait returned, so main safely sees the workers' writes." },
    ],
  },
  {
    id: "bug",
    label: "B · Add inside goroutine",
    code: [
      "func main() {",
      "    var wg sync.WaitGroup",
      "    for i := 1; i <= 3; i++ {",
      "        go func() {",
      "            wg.Add(1)        // BUG: too late",
      "            defer wg.Done()",
      "            work(i)",
      "        }()",
      "    }",
      "    wg.Wait()",
      '    fmt.Println("all done")',
      "}",
    ],
    steps: [
      { hl: [{ line: 1, who: "main" }], counter: 0, main: "running", workers: [NS, NS, NS], note: "Same idea, but each goroutine is supposed to register itself with wg.Add(1)." },
      { hl: [{ line: 3, who: "main" }], counter: 0, main: "running", workers: ["runnable", "runnable", "runnable"], note: "main starts three goroutines. They are runnable, but nothing says they run before main continues — and here none has run yet. The counter is still 0." },
      { hl: [{ line: 9, who: "main" }], counter: 0, main: "running", workers: ["runnable", "runnable", "runnable"], note: "wg.Wait() checks the counter: it is 0, so Wait returns immediately. main does not wait for anything." },
      { hl: [{ line: 10, who: "main" }, { line: 4, who: "W1" }], counter: 1, main: "running", workers: ["running", "runnable", "runnable"], out: "all done", note: "main prints \"all done\" — a lie. Meanwhile worker 1 finally runs and calls wg.Add(1), but main has already passed Wait. (Calling Add with a positive delta while counter is 0 concurrently with Wait is exactly what the WaitGroup docs forbid.)" },
      { hl: [{ line: 11, who: "main" }], counter: 1, main: "exited", workers: ["killed", "killed", "killed"], out: "all done", note: "main returns, so the program exits — and every other goroutine is stopped mid-flight. Workers never finish. Whether this bug shows depends on timing, so it can pass tests and fail in production. Fix: call wg.Add before the go statement." },
    ],
  },
];

const W_TONE: Record<WState, "neutral" | "ok" | "warn" | "danger" | "info"> = { "not started": "neutral", runnable: "info", running: "ok", done: "neutral", killed: "danger" };
const W_GLYPH: Record<WState, string> = { "not started": "·", runnable: "…", running: "▶", done: "✓", killed: "✕" };

export default function WaitGroupViz() {
  const [id, setId] = useState<Scenario["id"]>("ok");
  const sc = SCENARIOS.find((x) => x.id === id)!;
  const s = useStepper(sc.steps.length, 1800);
  const st = sc.steps[Math.min(s.i, sc.steps.length - 1)];

  return (
    <VizFrame
      title="WaitGroup"
      kind="trace"
      description="One possible scheduling of this program, step by step. Watch the WaitGroup counter and who is blocked."
      footer={
        <>
          Go 1.25 added <code className="font-mono">wg.Go(func() {"{ … }"})</code>, which does the Add(1), the goroutine start and the deferred Done for you — making scenario B&apos;s mistake impossible. On older
          versions, call <code className="font-mono">wg.Add</code> before <code className="font-mono">go</code>. Go 1.25&apos;s <code className="font-mono">go vet</code> also reports a wg.Add inside the goroutine it is
          meant to track.
        </>
      }
    >
      <div className="mb-3">
        <Segmented
          label="Scenario"
          value={id}
          options={SCENARIOS.map((x) => ({ value: x.id, label: x.label }))}
          onChange={(v) => {
            setId(v);
            s.reset();
          }}
        />
      </div>
      <StepControls s={s} />

      <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Panel title="Code">
          <pre className="overflow-x-auto rounded bg-code p-1.5 font-mono text-[12px] leading-snug">
            {sc.code.map((l, k) => {
              const who = st.hl.filter((h) => h.line === k).map((h) => h.who);
              return (
                <div key={k} className={cn("flex gap-2 px-1", who.length ? "bg-accent-soft text-fg" : "text-muted", l.includes("BUG") && "text-danger")}>
                  <span className="min-w-0 flex-1 whitespace-pre">{l || " "}</span>
                  {who.length > 0 && <span className="shrink-0 text-[10.5px] font-semibold text-accent">◀ {who.join(", ")}</span>}
                </div>
              );
            })}
          </pre>
        </Panel>
        <div className="grid content-start gap-3">
          <Panel title="wg counter">
            <div key={st.counter} className="anim-pop font-mono text-3xl font-semibold text-fg">
              {st.counter}
            </div>
          </Panel>
          <Panel title="Goroutines">
            <ul className="space-y-1.5 text-[12.5px]">
              <li className="flex items-center justify-between gap-2">
                <span className="font-mono">main</span>
                <Chip tone={st.main === "blocked in Wait" ? "warn" : st.main === "exited" ? "neutral" : "ok"}>
                  {st.main === "blocked in Wait" ? "⏸" : st.main === "exited" ? "■" : "▶"} {st.main}
                </Chip>
              </li>
              {st.workers.map((w, k) => (
                <li key={k} className="flex items-center justify-between gap-2">
                  <span className="font-mono">worker {k + 1}</span>
                  <Chip tone={W_TONE[w]}>
                    {W_GLYPH[w]} {w}
                  </Chip>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="stdout">
            <pre className="font-mono text-[12px] text-fg">{st.out ?? " "}</pre>
          </Panel>
        </div>
      </div>
      <Narration>{st.note}</Narration>
    </VizFrame>
  );
}
