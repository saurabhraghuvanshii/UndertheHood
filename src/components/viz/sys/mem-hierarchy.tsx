"use client";
import { useRef, useState } from "react";
import { Narration, VizFrame } from "../kit";
import { cn } from "@/components/ui/cn";

type Level = { id: string; name: string; range: string; ns: number; size: string; text: string };

/**
 * Representative values (ns) chosen from the quoted ranges. Everything else in the
 * component (bar widths, human-scale times, ratios) is computed from these numbers.
 */
const LEVELS: Level[] = [
  { id: "reg", name: "CPU register", range: "~0.3 ns", ns: 0.3, size: "bytes (a few dozen 8-byte registers per core)", text: "Registers are inside the core; an instruction reads them in about a clock cycle. The compiler decides which variables live here, which is one reason tight loops over local variables are so fast." },
  { id: "l1", name: "L1 cache", range: "~1 ns", ns: 1, size: "tens of KB per core (e.g. 32–64 KB data)", text: "L1 is private to each core and moves data in 64-byte cache lines. Touch one byte and the whole line comes in, so reading the next 63 bytes is nearly free. That is spatial locality: sequential array scans exploit it, pointer-chasing does not." },
  { id: "l2", name: "L2 cache", range: "~4 ns", ns: 4, size: "hundreds of KB to a few MB per core", text: "L2 catches what falls out of L1. A working set that fits in L2 still runs fast; hot loops that overflow it start paying several times more per access." },
  { id: "l3", name: "L3 cache", range: "~10–15 ns", ns: 12, size: "MBs, shared by all cores on the chip", text: "L3 is shared, so cores compete for it, and two cores writing to the same cache line force it to bounce between them (false sharing). Padding hot per-thread counters onto separate lines avoids that." },
  { id: "ram", name: "Main memory (DRAM)", range: "~80–100 ns", ns: 90, size: "GBs", text: "A cache miss to DRAM costs ~100 cycles or more, enough time for hundreds of instructions. This is why arrays beat linked lists: an array’s next element is usually already in the cache line or prefetched, while each list node can be a fresh miss somewhere else in memory. It is also why allocation patterns matter: many small heap objects (JS objects, Go values that escape to the heap) scatter data and add garbage-collector work, while contiguous slices and typed arrays keep it dense." },
  { id: "ssd", name: "NVMe SSD random read", range: "~20–100 µs", ns: 50_000, size: "hundreds of GB to TBs", text: "An SSD read is hundreds of times slower than RAM. The OS page cache keeps recently read file pages in RAM to hide this, which is why the second run of a database query or a build is often much faster than the first." },
  { id: "dc", name: "Same-datacenter round trip", range: "~0.5 ms", ns: 500_000, size: "another machine’s RAM", text: "A network round trip inside one datacenter is roughly ten SSD reads. A cache like Redis is fast because it serves from RAM, but every call still pays this round trip, so batching (pipelining, multi-get) usually matters more than the cache’s own speed. N+1 query patterns multiply this cost." },
  { id: "hdd", name: "Hard disk seek", range: "~5–10 ms", ns: 7_000_000, size: "TBs", text: "A spinning disk must physically move its head and wait for the platter. Random reads are terrible; sequential reads are fine. Log-structured designs (append-only logs, LSM trees) were popular partly to turn random writes into sequential ones." },
  { id: "wan", name: "Cross-continent round trip", range: "~70–150 ms", ns: 100_000_000, size: "the internet", text: "Light in fibre covers roughly 200 km per millisecond, so distance sets a hard floor. A TCP + TLS handshake costs extra round trips before the first byte, which is why CDNs terminate connections near users and why connection reuse matters." },
];

const L1_NS = 1;
const MIN_LOG = Math.log10(0.1);
const MAX_LOG = Math.log10(1e9);

function fmtNs(ns: number) {
  if (ns < 1000) return `${ns} ns`;
  if (ns < 1e6) return `${ns / 1000} µs`;
  return `${ns / 1e6} ms`;
}

/** Human-scale duration when 1 L1 hit (1 ns) is stretched to 1 second. */
export function humanScale(ns: number) {
  const sec = ns / L1_NS;
  const units: [number, string][] = [
    [365 * 86400, "year"],
    [30 * 86400, "month"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
    [1, "second"],
  ];
  for (const [u, name] of units) {
    if (sec >= u) {
      const v = sec / u;
      const r = v >= 10 ? Math.round(v) : Math.round(v * 10) / 10;
      return `~${r} ${name}${r === 1 ? "" : "s"}`;
    }
  }
  return `~${Math.round(sec * 10) / 10} seconds`;
}

export default function MemHierarchyViz() {
  const [sel, setSel] = useState(4);
  const cur = LEVELS[sel];
  const prev = sel > 0 ? LEVELS[sel - 1] : null;

  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const move = (i: number) => {
    const n = Math.max(0, Math.min(LEVELS.length - 1, i));
    setSel(n);
    refs.current[n]?.focus();
  };
  const onKey = (e: React.KeyboardEvent) => {
    const k = e.key;
    if (k === "ArrowDown" || k === "ArrowRight") move(sel + 1);
    else if (k === "ArrowUp" || k === "ArrowLeft") move(sel - 1);
    else if (k === "Home") move(0);
    else if (k === "End") move(LEVELS.length - 1);
    else return;
    e.preventDefault();
  };

  return (
    <VizFrame
      title="Memory hierarchy latency ladder"
      kind="model"
      description={<>Approximate orders of magnitude; real values vary by hardware, generation and load. Bars use a <strong>logarithmic</strong> scale: each gridline is 10× slower than the one before. Select a row to learn what lives there.</>}
      footer={
        <>
          <strong className="text-fg">Takeaway.</strong> Each step down the ladder is roughly 3× to 1000× slower, so the shape of your data often matters more than the number of instructions. Keep hot data small and contiguous, read memory sequentially, batch network calls, and keep connections open. The human-scale column stretches one L1 hit (taken as {L1_NS} ns) to one second, using the representative value shown for each row. Latency figures popularised by Jeff Dean’s “numbers every programmer should know” are the inspiration; measure on your own hardware before relying on any of them.
        </>
      }
    >
      <div role="radiogroup" aria-label="Memory and storage levels (arrow keys move)" onKeyDown={onKey} className="flex flex-col gap-1">
        <div className="grid grid-cols-[minmax(0,8.5rem)_1fr] gap-2 px-1 text-[11px] uppercase tracking-wider text-muted sm:grid-cols-[11rem_1fr_7rem]">
          <span>Level</span>
          <span>Latency (log scale)</span>
          <span className="hidden text-right sm:block">If L1 = 1 s</span>
        </div>
        {LEVELS.map((l, i) => {
          const w = ((Math.log10(l.ns) - MIN_LOG) / (MAX_LOG - MIN_LOG)) * 100;
          const on = i === sel;
          return (
            <button
              key={l.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              onClick={() => setSel(i)}
              className={cn("grid grid-cols-[minmax(0,8.5rem)_1fr] items-center gap-2 rounded-md border px-1 py-1.5 text-left sm:grid-cols-[11rem_1fr_7rem]", on ? "border-fg bg-surface-2" : "border-transparent hover:bg-surface-2")}
            >
              <span className={cn("text-xs leading-tight", on ? "font-semibold text-fg" : "text-fg")}>{l.name}</span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="relative h-3 rounded-sm bg-surface-2" aria-hidden>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                    <span key={g} className="absolute inset-y-0 w-px bg-border" style={{ left: `${(g / 10) * 100}%` }} />
                  ))}
                  <span className={cn("absolute inset-y-0 left-0 rounded-sm", on ? "bg-accent" : "bg-fg/60")} style={{ width: `${w}%` }} />
                </span>
                <span className="font-mono text-[11px] text-muted">
                  {l.range}
                  <span className="sm:hidden"> · {humanScale(l.ns)}</span>
                </span>
              </span>
              <span className="hidden text-right font-mono text-xs text-fg sm:block">{humanScale(l.ns)}</span>
            </button>
          );
        })}
        <div className="grid grid-cols-[minmax(0,8.5rem)_1fr] gap-2 px-1 sm:grid-cols-[11rem_1fr_7rem]" aria-hidden>
          <span />
          <span className="flex justify-between font-mono text-[10px] text-subtle">
            <span>0.1 ns</span>
            <span>10 µs</span>
            <span>1 s</span>
          </span>
        </div>
      </div>

      <Narration>
        <p>
          <strong>{cur.name}</strong>: {cur.range} (using {fmtNs(cur.ns)}). Typical size: {cur.size}. On the human scale: {humanScale(cur.ns)}.
          {prev && <> About {Math.round(cur.ns / prev.ns).toLocaleString()}× the {prev.name.toLowerCase()} figure.</>}
        </p>
        <p className="mt-1.5">{cur.text}</p>
      </Narration>
    </VizFrame>
  );
}
