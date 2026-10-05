/**
 * Pure model of two goroutines each running `for i := 0; i < 3; i++ { counter++ }`,
 * where counter++ is really LOAD / ADD / STORE, optionally guarded by a sync.Mutex.
 */

export type MG = "G1" | "G2";
export const MGS: MG[] = ["G1", "G2"];
export type Instr = "LOCK" | "LOAD" | "ADD" | "STORE" | "UNLOCK";

export const ITERATIONS = 3;
export const EXPECTED = ITERATIONS * 2;

export interface MGState {
  pc: number;
  reg: number | null;
  blocked: boolean;
  /** write sequence number of counter observed by the last LOAD */
  loadedSeq: number;
  /** value of counter observed by the last LOAD */
  loadedValue: number | null;
}

export interface MutexLog {
  n: number;
  g: MG | null;
  text: string;
  tone: "neutral" | "ok" | "warn" | "danger" | "info";
}

export interface MutexState {
  useMutex: boolean;
  counter: number;
  /** increments every STORE; lets us detect stale loads */
  writeSeq: number;
  lastWriter: MG | null;
  owner: MG | null;
  waiters: MG[];
  gs: Record<MG, MGState>;
  lostUpdates: { by: MG; victim: MG; wrote: number; lost: number }[];
  log: MutexLog[];
  seq: number;
}

export function program(useMutex: boolean): Instr[] {
  const body: Instr[] = useMutex ? ["LOCK", "LOAD", "ADD", "STORE", "UNLOCK"] : ["LOAD", "ADD", "STORE"];
  return Array.from({ length: ITERATIONS }, () => body).flat();
}

export const SOURCE = (useMutex: boolean) =>
  useMutex
    ? ["for i := 0; i < 3; i++ {", "    mu.Lock()", "    r := counter   // LOAD", "    r = r + 1      // ADD", "    counter = r    // STORE", "    mu.Unlock()", "}"]
    : ["for i := 0; i < 3; i++ {", "    // counter++ compiles to:", "    r := counter   // LOAD", "    r = r + 1      // ADD", "    counter = r    // STORE", "}"];

/** Source line (index into SOURCE) for an instruction. */
export function lineOf(useMutex: boolean, ins: Instr | undefined): number {
  if (!ins) return SOURCE(useMutex).length - 1;
  const map: Record<Instr, number> = { LOCK: 1, LOAD: 2, ADD: 3, STORE: 4, UNLOCK: 5 };
  return map[ins];
}

const freshG = (): MGState => ({ pc: 0, reg: null, blocked: false, loadedSeq: 0, loadedValue: null });

export function newMutexState(useMutex: boolean): MutexState {
  return { useMutex, counter: 0, writeSeq: 0, lastWriter: null, owner: null, waiters: [], gs: { G1: freshG(), G2: freshG() }, lostUpdates: [], log: [], seq: 0 };
}

function clone(s: MutexState): MutexState {
  return { ...s, waiters: s.waiters.slice(), gs: { G1: { ...s.gs.G1 }, G2: { ...s.gs.G2 } }, lostUpdates: s.lostUpdates.slice(), log: s.log.slice() };
}

function log(s: MutexState, g: MG | null, text: string, tone: MutexLog["tone"] = "neutral") {
  s.seq++;
  s.log.push({ n: s.seq, g, text, tone });
}

export const other = (g: MG): MG => (g === "G1" ? "G2" : "G1");
export const isDone = (s: MutexState, g: MG) => s.gs[g].pc >= program(s.useMutex).length;
export const canStep = (s: MutexState, g: MG) => !isDone(s, g) && !s.gs[g].blocked;
export const allDone = (s: MutexState) => MGS.every((g) => isDone(s, g));
export const currentInstr = (s: MutexState, g: MG): Instr | undefined => program(s.useMutex)[s.gs[g].pc];
export const iterationOf = (s: MutexState, g: MG) => Math.min(ITERATIONS, Math.floor(s.gs[g].pc / (s.useMutex ? 5 : 3)) + 1);

/** Execute one micro-step of goroutine g. */
export function step(prev: MutexState, g: MG): MutexState {
  if (!canStep(prev, g)) return prev;
  const s = clone(prev);
  const me = s.gs[g];
  const ins = program(s.useMutex)[me.pc];
  switch (ins) {
    case "LOCK":
      if (s.owner === null) {
        s.owner = g;
        me.pc++;
        log(s, g, `${g}: mu.Lock() — the mutex was free, so ${g} now holds it.`, "info");
      } else {
        me.blocked = true;
        if (!s.waiters.includes(g)) s.waiters.push(g);
        log(s, g, `${g}: mu.Lock() — ${s.owner} holds the mutex, so ${g} blocks (parks) until it is unlocked.`, "warn");
      }
      break;
    case "LOAD":
      me.reg = s.counter;
      me.loadedSeq = s.writeSeq;
      me.loadedValue = s.counter;
      me.pc++;
      log(s, g, `${g}: LOAD — copies counter (${s.counter}) into its register.`);
      break;
    case "ADD":
      me.reg = (me.reg ?? 0) + 1;
      me.pc++;
      log(s, g, `${g}: ADD — its register is now ${me.reg}. The shared counter is unchanged (${s.counter}).`);
      break;
    case "STORE": {
      const stale = s.writeSeq > me.loadedSeq && s.lastWriter !== null && s.lastWriter !== g;
      const before = s.counter;
      s.counter = me.reg ?? 0;
      s.writeSeq++;
      me.pc++;
      if (stale) {
        const victim = s.lastWriter as MG;
        s.lostUpdates.push({ by: g, victim, wrote: s.counter, lost: before });
        log(s, g, `${g}: STORE ${s.counter} — lost update! ${g} overwrote ${victim}'s store: counter was ${before}, but ${g} loaded ${me.loadedValue} before ${victim} wrote, so ${victim}'s increment is gone.`, "danger");
      } else {
        log(s, g, `${g}: STORE — counter = ${s.counter}.`, "ok");
      }
      s.lastWriter = g;
      break;
    }
    case "UNLOCK": {
      s.owner = null;
      me.pc++;
      const w = s.waiters.shift();
      if (w) {
        s.gs[w].blocked = false;
        log(s, g, `${g}: mu.Unlock() — wakes ${w}, which will retry Lock on its next step.`, "info");
      } else {
        log(s, g, `${g}: mu.Unlock() — the mutex is free again.`, "info");
      }
      break;
    }
  }
  if (allDone(s)) {
    log(
      s,
      null,
      s.counter === EXPECTED
        ? `Both goroutines finished. counter = ${s.counter}, as expected.${s.useMutex ? "" : " This interleaving happened to be safe — the race is still there."}`
        : `Both goroutines finished. counter = ${s.counter}, but 6 increments ran: ${EXPECTED - s.counter} update${EXPECTED - s.counter === 1 ? " was" : "s were"} lost.`,
      s.counter === EXPECTED ? "ok" : "danger",
    );
  }
  return s;
}

/** Run to completion choosing a random runnable goroutine at each step. */
export function randomInterleaving(prev: MutexState, rnd: () => number = Math.random): MutexState {
  let s = prev;
  for (let guard = 0; guard < 200 && !allDone(s); guard++) {
    const ready = MGS.filter((g) => canStep(s, g));
    if (!ready.length) break;
    s = step(s, ready[Math.floor(rnd() * ready.length)]);
  }
  return s;
}
