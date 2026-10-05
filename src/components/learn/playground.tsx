"use client";
import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { runJs, type LogLine } from "@/lib/js-runner";
import { Button } from "@/components/ui";
import { cn } from "@/components/ui/cn";

const PRESETS: Record<string, string> = {
  "Event loop order": `console.log("A");
setTimeout(() => console.log("B (task)"), 0);
Promise.resolve().then(() => console.log("C (microtask)"));
queueMicrotask(() => console.log("D (microtask)"));
(async () => {
  console.log("E");
  await null;
  console.log("F (after await)");
})();
console.log("G");`,
  "Closures in loops": `var fns = [];
for (var i = 0; i < 3; i++) fns.push(() => i);
console.log("var:", fns.map((f) => f()));

let fns2 = [];
for (let j = 0; j < 3; j++) fns2.push(() => j);
console.log("let:", fns2.map((f) => f()));`,
  "Microtask starvation": `let n = 0;
setTimeout(() => console.log("timer finally ran after", n, "microtasks"), 0);
function spin() { if (++n < 100000) queueMicrotask(spin); }
spin();`,
  "Timer drift": `const start = performance.now();
let ticks = 0;
const id = setInterval(() => {
  ticks++;
  console.log("tick", ticks, "at", Math.round(performance.now() - start), "ms");
  if (ticks === 5) clearInterval(id);
}, 100);`,
  "Debounce": `function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
const log = debounce((v) => console.log("search:", v), 100);
["h", "he", "hel", "hell", "hello"].forEach((v, i) => setTimeout(() => log(v), i * 30));`,
};

const STORAGE = "uth:playground";

export function Playground() {
  // rendered client-only (see playground-loader), so reading localStorage here is safe
  const [code, setCode] = useState(() => {
    try {
      return localStorage.getItem(STORAGE) ?? PRESETS["Event loop order"];
    } catch {
      return PRESETS["Event loop order"];
    }
  });
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [running, setRunning] = useState(false);
  const [timeout, setTimeoutMs] = useState(2000);
  const [note, setNote] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE, code);
    } catch {}
  }, [code]);

  const run = async () => {
    setLogs([]);
    setNote("");
    setRunning(true);
    const r = await runJs(code, (l) => setLogs((x) => [...x, l]), timeout);
    setRunning(false);
    if (r.timedOut) setNote(`Worker stopped after ${timeout / 1000}s.`);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <label className="text-sm text-muted">
            Example{" "}
            <select onChange={(e) => e.target.value && setCode(PRESETS[e.target.value])} defaultValue="" className="ml-1 rounded-md border border-border-strong bg-surface px-2 py-1 text-sm text-fg">
              <option value="">Choose…</option>
              {Object.keys(PRESETS).map((k) => <option key={k}>{k}</option>)}
            </select>
          </label>
          <label className="text-sm text-muted">
            Time limit{" "}
            <select value={timeout} onChange={(e) => setTimeoutMs(+e.target.value)} className="ml-1 rounded-md border border-border-strong bg-surface px-2 py-1 text-sm text-fg">
              {[1000, 2000, 5000].map((t) => <option key={t} value={t}>{t / 1000}s</option>)}
            </select>
          </label>
          <Button variant="primary" size="sm" onClick={run} disabled={running} className="ml-auto"><Play className="h-3.5 w-3.5" aria-hidden />{running ? "Running…" : "Run"}</Button>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); run(); }
            if (e.key === "Tab") {
              e.preventDefault();
              const el = e.currentTarget, s = el.selectionStart;
              setCode(code.slice(0, s) + "  " + code.slice(el.selectionEnd));
              requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2));
            }
          }}
          spellCheck={false}
          aria-label="JavaScript code (Ctrl+Enter to run)"
          className="h-[420px] w-full resize-y rounded-lg border border-border-strong bg-code p-3 font-mono text-[13px] leading-relaxed text-fg"
        />
        <p className="mt-1 text-xs text-subtle">Ctrl/⌘ + Enter runs. Your code is kept in this browser.</p>
      </div>
      <div className="min-w-0">
        <div className="mb-2 flex h-8 items-center text-sm font-medium text-muted">Console</div>
        <div className="h-[420px] overflow-auto rounded-lg border border-border bg-surface p-3 font-mono text-[13px] leading-relaxed" role="log" aria-live="polite">
          {logs.length === 0 && !running && <span className="text-subtle">Output appears here.</span>}
          {logs.map((l, i) => (
            <div key={i} className={cn("flex gap-3", l.level === "error" ? "text-danger" : l.level === "warn" ? "text-warn" : "text-fg")}>
              <span className="w-12 shrink-0 text-right text-subtle">{l.t}ms</span>
              <span className="whitespace-pre-wrap break-words">{l.text}</span>
            </div>
          ))}
          {note && <div className="mt-2 font-sans text-xs text-muted">{note}</div>}
        </div>
      </div>
    </div>
  );
}
