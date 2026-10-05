/**
 * A tiny model for scripted JavaScript execution traces.
 *
 * Traces are authored by hand against the ECMAScript semantics (not recorded from an
 * engine), so the UI labels them "Scripted trace". Each step is a full snapshot, built
 * by applying a mutation to a copy of the previous snapshot.
 */
export interface Binding {
  name: string;
  value: string;
  /** uninitialized = in the temporal dead zone */
  state?: "uninit" | "changed";
  /** heap object this binding points to */
  ref?: string;
}

export interface Env {
  id: string;
  label: string;
  bindings: Binding[];
  outer?: string;
  /** kept alive only because a closure references it */
  retained?: boolean;
  /** no longer reachable */
  dead?: boolean;
}

export interface Frame {
  name: string;
  env?: string;
  thisValue?: string;
}

export interface HeapObj {
  id: string;
  label: string;
  props: Binding[];
  unreachable?: boolean;
}

export interface Snapshot {
  line: number | null;
  /** plain-language explanation of this step */
  note: string;
  phase?: string;
  stack: Frame[];
  envs: Env[];
  heap: HeapObj[];
  webapis: string[];
  tasks: string[];
  microtasks: string[];
  console: string[];
  error?: string;
}

export interface Trace {
  id: string;
  title: string;
  code: string;
  panels: ("stack" | "envs" | "heap" | "queues" | "console")[];
  steps: Snapshot[];
  takeaway: string;
}

export const EMPTY: Snapshot = { line: null, note: "", stack: [], envs: [], heap: [], webapis: [], tasks: [], microtasks: [], console: [] };

export class TraceBuilder {
  steps: Snapshot[] = [];
  private cur: Snapshot;
  constructor(init: Partial<Snapshot> = {}) {
    this.cur = { ...EMPTY, ...init };
  }
  /** Record a step: copy the current snapshot, apply `mutate`, store it. */
  step(line: number | null, note: string, mutate?: (s: Snapshot) => void, phase?: string) {
    const next: Snapshot = structuredClone({ ...this.cur, line, note, phase, error: undefined });
    // "changed" markers only last one step
    next.envs.forEach((e) => e.bindings.forEach((b) => b.state === "changed" && delete b.state));
    next.heap.forEach((h) => h.props.forEach((b) => b.state === "changed" && delete b.state));
    mutate?.(next);
    this.cur = next;
    this.steps.push(next);
    return this;
  }
}

/* helpers used inside mutate callbacks */
export const env = (s: Snapshot, id: string) => s.envs.find((e) => e.id === id)!;
export const setVar = (s: Snapshot, envId: string, name: string, value: string, ref?: string) => {
  const e = env(s, envId);
  const b = e.bindings.find((x) => x.name === name);
  if (b) {
    b.value = value;
    b.state = "changed";
    b.ref = ref;
  } else e.bindings.push({ name, value, ref, state: "changed" });
};
export const heapObj = (s: Snapshot, id: string) => s.heap.find((h) => h.id === id)!;
export const setProp = (s: Snapshot, id: string, name: string, value: string, ref?: string) => {
  const h = heapObj(s, id);
  const b = h.props.find((x) => x.name === name);
  if (b) {
    b.value = value;
    b.state = "changed";
    b.ref = ref;
  } else h.props.push({ name, value, ref, state: "changed" });
};
