/**
 * Simplified, tick-based model of Go's G/M/P scheduler (runtime/proc.go).
 * Conceptual, not to scale: one "tick" stands in for a scheduling quantum,
 * and goroutine work is a small number of ticks.
 */

export type GStatus = "runnable" | "running" | "syscall" | "waiting" | "dead";

export interface G {
  id: number;
  /** remaining ticks of work; Infinity for main */
  work: number;
  /** consecutive ticks on a P since it was last scheduled */
  ran: number;
  status: GStatus;
}

export interface P {
  id: number;
  m: number | null;
  cur: number | null;
  runnext: number | null;
  local: number[];
  schedtick: number;
}

export type MState = "running" | "idle" | "syscall";
export interface M {
  id: number;
  p: number | null;
  state: MState;
  /** goroutine it is stuck in a syscall with */
  g: number | null;
}

export interface Syscall {
  g: number;
  m: number;
  p: number;
  remaining: number;
}

export interface SchedLog {
  n: number;
  tick: number;
  text: string;
  tone: "neutral" | "ok" | "warn" | "info" | "danger";
}

export interface SchedState {
  gomaxprocs: number;
  gs: Record<number, G>;
  ps: P[];
  ms: M[];
  global: number[];
  waiting: number[];
  syscalls: Syscall[];
  tick: number;
  nextG: number;
  rng: number;
  log: SchedLog[];
  seq: number;
}

export const LOCAL_QUEUE_CAP = 256;
export const PREEMPT_AFTER = 2;
export const GLOBAL_CHECK_EVERY = 61;
export const SYSCALL_TICKS = 3;

export function newScheduler(gomaxprocs: number, seed = 42): SchedState {
  const ps: P[] = Array.from({ length: gomaxprocs }, (_, i) => ({ id: i, m: null, cur: null, runnext: null, local: [], schedtick: 0 }));
  ps[0].m = 0;
  ps[0].cur = 1;
  return {
    gomaxprocs,
    gs: { 1: { id: 1, work: Infinity, ran: 0, status: "running" } },
    ps,
    ms: [{ id: 0, p: 0, state: "running", g: null }],
    global: [],
    waiting: [],
    syscalls: [],
    tick: 0,
    nextG: 2,
    rng: seed >>> 0,
    log: [],
    seq: 0,
  };
}

export function clone(s: SchedState): SchedState {
  return {
    ...s,
    gs: Object.fromEntries(Object.entries(s.gs).map(([k, g]) => [k, { ...g }])),
    ps: s.ps.map((p) => ({ ...p, local: p.local.slice() })),
    ms: s.ms.map((m) => ({ ...m })),
    global: s.global.slice(),
    waiting: s.waiting.slice(),
    syscalls: s.syscalls.map((x) => ({ ...x })),
    log: s.log.slice(),
  };
}

export const gName = (id: number) => (id === 1 ? "G1 (main)" : `G${id}`);

function log(s: SchedState, text: string, tone: SchedLog["tone"] = "neutral") {
  s.seq++;
  s.log.push({ n: s.seq, tick: s.tick, text, tone });
  if (s.log.length > 200) s.log.splice(0, s.log.length - 200);
}

function rand(s: SchedState): number {
  // mulberry32
  s.rng = (s.rng + 0x6d2b79f5) >>> 0;
  let t = s.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function workFor(id: number) {
  return 2 + ((id * 5) % 4); // 2..5 ticks, deterministic
}

function runqput(s: SchedState, p: P, g: number) {
  if (p.local.length >= LOCAL_QUEUE_CAP) {
    // runqputslow: move half the local queue to the global queue
    const half = p.local.splice(0, Math.floor(p.local.length / 2));
    s.global.push(...half);
    log(s, `P${p.id}'s local queue is full, so half of it moves to the global queue.`, "warn");
  }
  p.local.push(g);
}

/** Put g in p.runnext, kicking any previous runnext to the tail of the local queue. */
function putRunnext(s: SchedState, p: P, g: number): number | null {
  const old = p.runnext;
  p.runnext = g;
  if (old !== null) runqput(s, p, old);
  return old;
}

function run(s: SchedState, p: P, g: number) {
  p.cur = g;
  s.gs[g].status = "running";
  s.gs[g].ran = 0;
}

function acquireM(s: SchedState, p: P): { m: M; created: boolean } {
  let m = s.ms.find((x) => x.state === "idle");
  let created = false;
  if (!m) {
    m = { id: s.ms.length, p: null, state: "idle", g: null };
    s.ms.push(m);
    created = true;
  }
  m.state = "running";
  m.p = p.id;
  m.g = null;
  p.m = m.id;
  return { m, created };
}

function releaseM(s: SchedState, p: P) {
  if (p.m === null) return;
  const m = s.ms[p.m];
  m.state = "idle";
  m.p = null;
  p.m = null;
}

export const hasRunnable = (s: SchedState) => s.global.length > 0 || s.ps.some((p) => p.runnext !== null || p.local.length > 0);

/** findRunnable: the order of places a P looks for work. Returns the chosen G (already removed from its queue) and why. */
export function findRunnable(s: SchedState, p: P): { g: number; why: string } | null {
  p.schedtick++;
  if (p.schedtick % GLOBAL_CHECK_EVERY === 0 && s.global.length) {
    const g = s.global.shift()!;
    return { g, why: `took ${gName(g)} from the global queue first — every ${GLOBAL_CHECK_EVERY}th schedule a P checks the global queue before its own, so global work can't starve` };
  }
  if (p.runnext !== null) {
    const g = p.runnext;
    p.runnext = null;
    return { g, why: `took ${gName(g)} from runnext (the most recently readied goroutine runs next — good for producer/consumer locality)` };
  }
  if (p.local.length) {
    const g = p.local.shift()!;
    return { g, why: `took ${gName(g)} from the head of its local run queue` };
  }
  if (s.global.length) {
    const n = Math.min(s.global.length, Math.floor(s.global.length / s.gomaxprocs) + 1);
    const batch = s.global.splice(0, n);
    const g = batch.shift()!;
    for (const x of batch) runqput(s, p, x);
    return { g, why: `local queue empty, so it took ${n} goroutine${n === 1 ? "" : "s"} from the global queue (its fair share), running ${gName(g)}${batch.length ? ` and queueing ${batch.map(gName).join(", ")} locally` : ""}` };
  }
  // netpoll: no network I/O in this model.
  const victims = s.ps.filter((v) => v.id !== p.id && (v.local.length > 0 || v.runnext !== null));
  if (victims.length) {
    const v = victims[Math.floor(rand(s) * victims.length)];
    if (v.local.length) {
      const n = v.local.length - Math.floor(v.local.length / 2);
      const stolen = v.local.splice(0, n);
      const g = stolen.shift()!;
      for (const x of stolen) runqput(s, p, x);
      return { g, why: `found nothing locally, globally or in the netpoller, so it picked a random victim P${v.id} and stole half its queue (${n} of ${n + v.local.length}): runs ${gName(g)}${stolen.length ? `, queues ${stolen.map(gName).join(", ")}` : ""}` };
    }
    const g = v.runnext!;
    v.runnext = null;
    return { g, why: `found nothing else, so it stole ${gName(g)} from P${v.id}'s runnext slot` };
  }
  return null;
}

function schedule(s: SchedState, p: P): boolean {
  const pick = findRunnable(s, p);
  if (pick) {
    run(s, p, pick.g);
    log(s, `P${p.id} ${pick.why}.`, "info");
    return true;
  }
  return false;
}

const othersWaiting = (s: SchedState, p: P) => p.runnext !== null || p.local.length > 0 || s.global.length > 0;

/** Advance the whole machine by one tick. */
export function tick(prev: SchedState): SchedState {
  const s = clone(prev);
  s.tick++;

  // 1. Syscalls make progress; returning goroutines try to get a P back.
  for (const sc of s.syscalls.slice()) {
    sc.remaining--;
    if (sc.remaining > 0) continue;
    s.syscalls.splice(s.syscalls.indexOf(sc), 1);
    const g = s.gs[sc.g];
    const m = s.ms[sc.m];
    const old = s.ps[sc.p];
    const idleP = old.m === null ? old : s.ps.find((x) => x.m === null);
    if (idleP) {
      m.state = "running";
      m.g = null;
      m.p = idleP.id;
      idleP.m = m.id;
      run(s, idleP, g.id);
      log(s, `${gName(g.id)}'s syscall returned. P${idleP.id} was idle, so M${m.id} acquires it and ${gName(g.id)} keeps running.`, "ok");
    } else {
      g.status = "runnable";
      s.global.push(g.id);
      m.state = "idle";
      m.g = null;
      log(s, `${gName(g.id)}'s syscall returned but every P is busy, so ${gName(g.id)} goes to the global run queue and M${m.id} parks in the idle M pool.`, "warn");
    }
  }

  // 2. Every P with an M runs its goroutine; finished / preempted ones make room.
  for (const p of s.ps) {
    if (p.m === null) continue;
    if (p.cur !== null) {
      const g = s.gs[p.cur];
      g.work -= 1;
      g.ran += 1;
      if (g.work <= 0) {
        g.status = "dead";
        p.cur = null;
        log(s, `${gName(g.id)} finished on P${p.id}.`, "ok");
      } else if (g.ran >= PREEMPT_AFTER && othersWaiting(s, p)) {
        g.status = "runnable";
        g.ran = 0;
        p.cur = null;
        runqput(s, p, g.id);
        log(s, `${gName(g.id)} has run ${PREEMPT_AFTER} ticks while others wait, so it is preempted and goes to the tail of P${p.id}'s local queue. (Real Go: sysmon flags goroutines running > 10ms; since Go 1.14 it can preempt asynchronously with a signal.)`, "warn");
      }
    }
    if (p.cur === null && !schedule(s, p)) {
      const mid = p.m;
      releaseM(s, p);
      log(s, `P${p.id} found no work anywhere, so it goes idle and M${mid} parks.`);
    }
  }

  // 3. wakep: idle Ps start (on an idle or new M) if there is work they can grab.
  for (const p of s.ps) {
    if (p.m !== null || !hasRunnable(s)) continue;
    const pick = findRunnable(s, p);
    if (!pick) continue;
    const { m, created } = acquireM(s, p);
    run(s, p, pick.g);
    log(s, `Idle P${p.id} is woken on ${created ? "a new" : "an idle"} M${m.id} because there is runnable work. It ${pick.why}.`, "info");
  }
  return s;
}

function spawningP(s: SchedState, target: number): P | null {
  const t = s.ps[target];
  if (t && t.cur !== null) return t;
  return s.ps.find((p) => p.cur !== null) ?? null;
}

/** `go f()` executed by the goroutine running on the target P. */
export function spawn(prev: SchedState, target = 0): SchedState {
  const s = clone(prev);
  const id = s.nextG++;
  s.gs[id] = { id, work: workFor(id), ran: 0, status: "runnable" };
  const p = spawningP(s, target);
  if (!p) {
    s.global.push(id);
    log(s, `go f() → ${gName(id)}. No goroutine is running on a P, so it goes to the global queue.`);
    return s;
  }
  const old = putRunnext(s, p, id);
  log(s, `${gName(p.cur!)} on P${p.id} runs go f(): new ${gName(id)} (needs ${s.gs[id].work} ticks) goes into P${p.id}'s runnext${old !== null ? `, bumping ${gName(old)} to the tail of the local queue` : ""}.`);
  return s;
}

export function spawnMany(prev: SchedState, n: number, target = 0): SchedState {
  let s = prev;
  for (let i = 0; i < n; i++) s = spawn(s, target);
  return s;
}

/** The goroutine running on P `target` enters a blocking syscall. */
export function blockSyscall(prev: SchedState, target: number): SchedState {
  const p0 = prev.ps[target];
  if (!p0 || p0.cur === null || p0.m === null) return prev;
  const s = clone(prev);
  const p = s.ps[target];
  const g = s.gs[p.cur!];
  const m = s.ms[p.m!];
  g.status = "syscall";
  m.state = "syscall";
  m.g = g.id;
  m.p = null;
  s.syscalls.push({ g: g.id, m: m.id, p: p.id, remaining: SYSCALL_TICKS });
  p.cur = null;
  p.m = null;
  let msg = `${gName(g.id)} makes a blocking syscall (e.g. a file read). The OS thread M${m.id} is stuck in the kernel with it for ${SYSCALL_TICKS} ticks.`;
  if (hasRunnable(s)) {
    const { m: nm, created } = acquireM(s, p);
    const pick = findRunnable(s, p)!;
    run(s, p, pick.g);
    msg += ` P${p.id} is handed off to ${created ? "a new" : "an idle"} thread M${nm.id} (sysmon notices the syscall after ~20µs) so other goroutines keep running: it ${pick.why}.`;
  } else {
    msg += ` There is no other work, so P${p.id} simply goes idle.`;
  }
  log(s, msg, "warn");
  return s;
}

/** The goroutine running on P `target` blocks on a channel operation. */
export function blockChannel(prev: SchedState, target: number): SchedState {
  const p0 = prev.ps[target];
  if (!p0 || p0.cur === null || p0.m === null) return prev;
  const s = clone(prev);
  const p = s.ps[target];
  const g = s.gs[p.cur!];
  g.status = "waiting";
  s.waiting.push(g.id);
  p.cur = null;
  let msg = `${gName(g.id)} blocks on a channel. It is parked — not on any run queue, using no thread — and M${p.m} stays with P${p.id}.`;
  const pick = findRunnable(s, p);
  if (pick) {
    run(s, p, pick.g);
    msg += ` P${p.id} immediately ${pick.why}.`;
  } else {
    const mid = p.m;
    releaseM(s, p);
    msg += ` P${p.id} has nothing else to run, so it goes idle and M${mid} parks.`;
  }
  log(s, msg, "warn");
  return s;
}

/** Another goroutine (running on P `target`) readies the oldest channel-waiting G. */
export function wakeWaiting(prev: SchedState, target: number): SchedState {
  if (prev.waiting.length === 0) return prev;
  const s = clone(prev);
  const id = s.waiting.shift()!;
  s.gs[id].status = "runnable";
  const p = spawningP(s, target) ?? s.ps[target];
  const old = putRunnext(s, p, id);
  log(
    s,
    `${p.cur !== null ? `${gName(p.cur)} on P${p.id}` : "Someone"} completes the channel operation ${gName(id)} was waiting for. ${gName(id)} becomes runnable in P${p.id}'s runnext${old !== null ? ` (${gName(old)} moves to the local queue)` : ""}.`,
    "ok",
  );
  return s;
}

export function counts(s: SchedState) {
  const all = Object.values(s.gs);
  return {
    total: all.length,
    dead: all.filter((g) => g.status === "dead").length,
    runnable: all.filter((g) => g.status === "runnable").length,
    running: all.filter((g) => g.status === "running").length,
  };
}
