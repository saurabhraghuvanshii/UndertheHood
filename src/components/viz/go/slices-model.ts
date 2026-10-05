/**
 * Pure model of Go slices: backing arrays + slice headers, and the runtime's
 * real growth rule for []int (8-byte elements) from runtime/slice.go (Go 1.20+).
 * No React here so it can be unit-tested.
 */

export const ELEM_SIZE = 8; // int on 64-bit platforms

/** Go's malloc size classes (bytes) for small objects (≤ 32 KiB). */
export const SIZE_CLASSES = [
  8, 16, 24, 32, 48, 64, 80, 96, 112, 128, 144, 160, 176, 192, 208, 224, 240, 256, 288, 320, 352, 384, 416, 448, 480, 512, 576, 640, 704, 768, 896, 1024, 1152, 1280, 1408, 1536, 1792,
  2048, 2304, 2688, 3072, 3200, 3456, 4096, 4864, 5376, 6144, 6528, 6784, 6912, 8192, 9472, 9728, 10240, 10880, 12288, 13568, 14336, 16384, 18432, 19072, 20480, 21760, 24576, 27264, 28672,
  32768,
];
const PAGE_SIZE = 8192;

/** runtime.nextslicecap: the capacity growslice asks for, before size-class rounding. */
export function nextSliceCap(newLen: number, oldCap: number): number {
  let newcap = oldCap;
  const doublecap = newcap + newcap;
  if (newLen > doublecap) return newLen;
  const threshold = 256;
  if (oldCap < threshold) return doublecap;
  for (;;) {
    // Transition from growing 2x for small slices to 1.25x for large slices.
    newcap += (newcap + 3 * threshold) >> 2;
    if (newcap >= newLen) break;
  }
  return newcap;
}

/** runtime.roundupsize: round an allocation up to its size class (or whole pages for large objects). */
export function roundUpSize(bytes: number): number {
  if (bytes <= 0) return 0;
  if (bytes <= SIZE_CLASSES[SIZE_CLASSES.length - 1]) {
    for (const c of SIZE_CLASSES) if (c >= bytes) return c;
  }
  return Math.ceil(bytes / PAGE_SIZE) * PAGE_SIZE;
}

export interface GrowInfo {
  requested: number;
  roundedBytes: number;
  newCap: number;
}

/** Capacity of the new backing array that growslice allocates for []int. */
export function growCap(newLen: number, oldCap: number, elemSize = ELEM_SIZE): GrowInfo {
  const requested = nextSliceCap(newLen, oldCap);
  const roundedBytes = roundUpSize(requested * elemSize);
  return { requested, roundedBytes, newCap: Math.floor(roundedBytes / elemSize) };
}

// ---------------------------------------------------------------------------
// Heap model

export interface BackingArray {
  id: string;
  cap: number;
  cells: number[];
}

export interface SliceHeader {
  /** null = nil slice */
  arr: string | null;
  off: number;
  len: number;
  cap: number;
}

export interface SliceState {
  arrays: BackingArray[];
  vars: Record<string, SliceHeader>;
  /** order in which variables were declared, for stable rendering */
  order: string[];
  nextArray: number;
}

export type SliceOp =
  | { kind: "nil"; name: string }
  | { kind: "make"; name: string; len: number; cap?: number }
  | { kind: "literal"; name: string; values: number[] }
  | { kind: "append"; target: string; src: string | null; values: number[] }
  | { kind: "appendSlice"; target: string; src: string | null; from: string }
  | { kind: "reslice"; target: string; src: string; lo?: number; hi?: number; max?: number }
  | { kind: "set"; name: string; index: number; value: number }
  | { kind: "copy"; dst: string; src: string }
  | { kind: "assignNil"; name: string };

export interface StepResult {
  state: SliceState;
  /** cells written during this op */
  written: { arr: string; idx: number[] } | null;
  grew: (GrowInfo & { oldCap: number; newLen: number; from: string | null; to: string }) | null;
  /** arrays that became unreachable during this op */
  freed: string[];
  copied?: number;
  error?: string;
}

export function emptySliceState(): SliceState {
  return { arrays: [], vars: {}, order: [], nextArray: 1 };
}

function clone(s: SliceState): SliceState {
  return {
    arrays: s.arrays.map((a) => ({ ...a, cells: a.cells.slice() })),
    vars: Object.fromEntries(Object.entries(s.vars).map(([k, v]) => [k, { ...v }])),
    order: s.order.slice(),
    nextArray: s.nextArray,
  };
}

function alloc(s: SliceState, cap: number): BackingArray {
  const a: BackingArray = { id: `#${s.nextArray++}`, cap, cells: new Array(cap).fill(0) };
  s.arrays.push(a);
  return a;
}

function assign(s: SliceState, name: string, h: SliceHeader) {
  if (!(name in s.vars)) s.order.push(name);
  s.vars[name] = h;
}

const NIL: SliceHeader = { arr: null, off: 0, len: 0, cap: 0 };

export function getArray(s: SliceState, id: string | null): BackingArray | undefined {
  return id ? s.arrays.find((a) => a.id === id) : undefined;
}

/** Arrays referenced by at least one variable. */
export function reachable(s: SliceState): Set<string> {
  const r = new Set<string>();
  for (const h of Object.values(s.vars)) if (h.arr && h.cap > 0) r.add(h.arr);
  return r;
}

/** Element values visible through a slice header. */
export function sliceValues(s: SliceState, name: string): number[] {
  const h = s.vars[name];
  if (!h) return [];
  const a = getArray(s, h.arr);
  if (!a) return [];
  return a.cells.slice(h.off, h.off + h.len);
}

function header(s: SliceState, name: string | null): SliceHeader {
  if (name === null) return NIL;
  const h = s.vars[name];
  if (!h) throw new Error(`undefined: ${name}`);
  return h;
}

/** Apply one operation, returning the new (immutable) state plus annotations. */
export function applySliceOp(prev: SliceState, op: SliceOp): StepResult {
  const s = clone(prev);
  const before = reachable(prev);
  let written: StepResult["written"] = null;
  let grew: StepResult["grew"] = null;
  let copied: number | undefined;

  try {
    switch (op.kind) {
      case "nil":
        assign(s, op.name, { ...NIL });
        break;
      case "make": {
        const cap = op.cap ?? op.len;
        if (op.len > cap) throw new Error("panic: makeslice: cap out of range");
        const a = alloc(s, cap);
        assign(s, op.name, { arr: a.id, off: 0, len: op.len, cap });
        break;
      }
      case "literal": {
        const a = alloc(s, op.values.length);
        op.values.forEach((v, i) => (a.cells[i] = v));
        assign(s, op.name, { arr: a.id, off: 0, len: op.values.length, cap: op.values.length });
        written = { arr: a.id, idx: op.values.map((_, i) => i) };
        break;
      }
      case "append":
      case "appendSlice": {
        const src = { ...header(s, op.src) };
        const values = op.kind === "append" ? op.values : sliceValues(s, op.from);
        const newLen = src.len + values.length;
        if (newLen <= src.cap) {
          if (values.length === 0) {
            assign(s, op.target, src);
            break;
          }
          const a = getArray(s, src.arr)!;
          const idx: number[] = [];
          values.forEach((v, i) => {
            a.cells[src.off + src.len + i] = v;
            idx.push(src.off + src.len + i);
          });
          written = { arr: a.id, idx };
          assign(s, op.target, { ...src, len: newLen });
        } else {
          const g = growCap(newLen, src.cap);
          const old = getArray(s, src.arr);
          const a = alloc(s, g.newCap);
          const existing = old ? old.cells.slice(src.off, src.off + src.len) : [];
          [...existing, ...values].forEach((v, i) => (a.cells[i] = v));
          written = { arr: a.id, idx: Array.from({ length: newLen }, (_, i) => i) };
          grew = { ...g, oldCap: src.cap, newLen, from: src.arr, to: a.id };
          assign(s, op.target, { arr: a.id, off: 0, len: newLen, cap: g.newCap });
        }
        break;
      }
      case "reslice": {
        const src = header(s, op.src);
        const lo = op.lo ?? 0;
        const hi = op.hi ?? src.len;
        const max = op.max ?? src.cap;
        if (!(0 <= lo && lo <= hi && hi <= max && max <= src.cap)) {
          throw new Error(`panic: runtime error: slice bounds out of range [${lo}:${hi}${op.max !== undefined ? `:${max}` : ""}] with capacity ${src.cap}`);
        }
        assign(s, op.target, { arr: src.arr, off: src.off + lo, len: hi - lo, cap: max - lo });
        break;
      }
      case "set": {
        const h = header(s, op.name);
        if (op.index < 0 || op.index >= h.len) throw new Error(`panic: runtime error: index out of range [${op.index}] with length ${h.len}`);
        const a = getArray(s, h.arr)!;
        a.cells[h.off + op.index] = op.value;
        written = { arr: a.id, idx: [h.off + op.index] };
        break;
      }
      case "copy": {
        const d = header(s, op.dst);
        const vals = sliceValues(s, op.src);
        const n = Math.min(d.len, vals.length);
        const a = getArray(s, d.arr);
        const idx: number[] = [];
        for (let i = 0; i < n; i++) {
          a!.cells[d.off + i] = vals[i];
          idx.push(d.off + i);
        }
        if (a && n) written = { arr: a.id, idx };
        copied = n;
        break;
      }
      case "assignNil":
        assign(s, op.name, { ...NIL });
        break;
    }
  } catch (e) {
    return { state: prev, written: null, grew: null, freed: [], error: (e as Error).message };
  }

  const after = reachable(s);
  const freed = [...before].filter((id) => !after.has(id));
  return { state: s, written, grew, freed, copied };
}

// ---------------------------------------------------------------------------
// Scenarios

export interface ScenarioStep {
  code: string;
  op: SliceOp;
  note: string;
}

export interface Scenario {
  id: string;
  label: string;
  intro: string;
  steps: ScenarioStep[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: "growth",
    label: "Growth",
    intro: "Append one element at a time to a nil slice and watch capacity jump.",
    steps: [
      { code: "var s []int", op: { kind: "nil", name: "s" }, note: "A nil slice: the header is {ptr: nil, len: 0, cap: 0}. No backing array exists yet." },
      { code: "s = append(s, 1)", op: { kind: "append", target: "s", src: "s", values: [1] }, note: "" },
      { code: "s = append(s, 2)", op: { kind: "append", target: "s", src: "s", values: [2] }, note: "" },
      { code: "s = append(s, 3)", op: { kind: "append", target: "s", src: "s", values: [3] }, note: "" },
      { code: "s = append(s, 4)", op: { kind: "append", target: "s", src: "s", values: [4] }, note: "" },
      { code: "s = append(s, 5)", op: { kind: "append", target: "s", src: "s", values: [5] }, note: "" },
      { code: "t := append([]int(nil), 1, 2, 3, 4, 5)", op: { kind: "append", target: "t", src: null, values: [1, 2, 3, 4, 5] }, note: "" },
    ],
  },
  {
    id: "aliasing",
    label: "Aliasing gotcha",
    intro: "Two slices sharing one backing array: append through one silently overwrites the other.",
    steps: [
      { code: "a := []int{1, 2, 3}", op: { kind: "literal", name: "a", values: [1, 2, 3] }, note: "A slice literal allocates a backing array with exactly len = cap = 3." },
      { code: "b := a[:2]", op: { kind: "reslice", target: "b", src: "a", hi: 2 }, note: "Slicing copies only the header. b points at the same array: len 2, but cap is still 3 — it can see a[2] as spare room." },
      { code: "b = append(b, 99)", op: { kind: "append", target: "b", src: "b", values: [99] }, note: "" },
      { code: "a[0] = 100", op: { kind: "set", name: "a", index: 0, value: 100 }, note: "Writes through a are visible through b too: they are two windows onto one array." },
      { code: "c := append(a, 4)", op: { kind: "append", target: "c", src: "a", values: [4] }, note: "" },
      { code: "c[0] = 7", op: { kind: "set", name: "c", index: 0, value: 7 }, note: "After a reallocation c has its own array, so this write does not affect a or b. Whether two slices alias depends on whether append had spare capacity — a classic source of heisenbugs." },
    ],
  },
  {
    id: "fullslice",
    label: "Full slice expression",
    intro: "a[lo:hi:max] limits capacity so the next append must copy instead of overwriting.",
    steps: [
      { code: "a := []int{1, 2, 3}", op: { kind: "literal", name: "a", values: [1, 2, 3] }, note: "Backing array of 3 elements, len = cap = 3." },
      { code: "b := a[:2:2]", op: { kind: "reslice", target: "b", src: "a", hi: 2, max: 2 }, note: "The three-index form sets cap = max − lo = 2. b still shares the array, but it can no longer see a[2]." },
      { code: "b = append(b, 99)", op: { kind: "append", target: "b", src: "b", values: [99] }, note: "" },
      { code: "b[0] = 7", op: { kind: "set", name: "b", index: 0, value: 7 }, note: "b now owns a separate array, so a is untouched. Returning s[:n:n] from an API is a cheap way to stop callers' appends from clobbering your data." },
    ],
  },
  {
    id: "retention",
    label: "Memory retention",
    intro: "A tiny subslice keeps a huge backing array alive.",
    steps: [
      { code: "data := make([]int, 10_000) // ~80 KB", op: { kind: "make", name: "data", len: 10000 }, note: "make allocates exactly the length you ask for (no rounding of cap for make; the allocator still rounds the bytes up to pages for a large object)." },
      { code: "head := data[:3]", op: { kind: "reslice", target: "head", src: "data", hi: 3 }, note: "head is a 3-element window, but its pointer points into the big array, and its cap is 10,000." },
      { code: "data = nil", op: { kind: "assignNil", name: "data" }, note: "data no longer references the array — but head still does. The garbage collector traces pointers, not lengths, so all 10,000 elements stay alive for as long as head does." },
      { code: "head = slices.Clone(head) // or append([]int(nil), head...)", op: { kind: "appendSlice", target: "head", src: null, from: "head" }, note: "" },
    ],
  },
];

export interface ScenarioFrame extends StepResult {
  code: string;
  note: string;
}

/** Run a scenario, returning one frame per step (state after that step). */
export function runScenario(sc: Scenario): ScenarioFrame[] {
  let st = emptySliceState();
  return sc.steps.map((step) => {
    const r = applySliceOp(st, step.op);
    st = r.state;
    return { ...r, code: step.code, note: step.note || explain(step, r) };
  });
}

function explain(step: ScenarioStep, r: StepResult): string {
  const op = step.op;
  if (r.error) return r.error;
  if (op.kind === "append" || op.kind === "appendSlice") {
    const h = r.state.vars[op.target];
    if (r.grew) {
      const g = r.grew;
      const why =
        g.newLen > 2 * g.oldCap
          ? `the new length ${g.newLen} is more than double the old cap ${g.oldCap}, so the runtime asks for exactly ${g.requested}`
          : g.oldCap < 256
            ? `the old cap ${g.oldCap} is under 256, so the runtime doubles it to ${g.requested}`
            : `the old cap ${g.oldCap} is ≥ 256, so it grows by about 1.25× (+192) until it fits: ${g.requested}`;
      const round =
        g.newCap !== g.requested
          ? ` ${g.requested} × 8 bytes = ${g.requested * 8} bytes is rounded up to the ${g.roundedBytes}-byte size class, so cap becomes ${g.newCap} — not ${g.requested}.`
          : ` ${g.requested} × 8 = ${g.roundedBytes} bytes is already a size class, so cap = ${g.newCap}.`;
      const freed = r.freed.length ? ` The old array ${r.freed.join(", ")} is now unreferenced: garbage for the GC to reclaim.` : g.from ? " The old array is still referenced by another slice, so it stays alive." : "";
      return `No room: the new len would be ${g.newLen} but cap is ${g.oldCap}. growslice allocates a new array ${g.to} and copies the elements over. Capacity: ${why}.${round}${freed}`;
    }
    const shared = Object.entries(r.state.vars).filter(([n, v]) => n !== op.target && v.arr === h.arr && v.cap > 0).map(([n]) => n);
    return `len ${h.len - (op.kind === "append" ? op.values.length : 0)} < cap ${h.cap}: append writes into spare capacity in place — no allocation.${shared.length ? ` But ${shared.join(", ")} share${shared.length === 1 ? "s" : ""} this array, and the written cell is visible to ${shared.length === 1 ? "it" : "them"}: ${shared.map((n) => `${n} = [${sliceValues(r.state, n).join(" ")}]`).join(", ")}.` : ""}`;
  }
  return "";
}
