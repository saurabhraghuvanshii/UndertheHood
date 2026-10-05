/**
 * Pure model of a Go channel (hchan) following runtime/chan.go:
 * a circular buffer (buf, sendx, recvx, qcount), a queue of parked senders
 * (sendq) and parked receivers (recvq), and the closed flag.
 */

export type GId = "G1" | "G2" | "G3" | "G4";
export const SENDERS: GId[] = ["G1", "G2"];
export const RECEIVERS: GId[] = ["G3", "G4"];
export const ALL_G: GId[] = ["G1", "G2", "G3", "G4"];

export type GStatus = "running" | "blocked-send" | "blocked-recv" | "done" | "panicked";

export interface GInfo {
  status: GStatus;
  /** value this goroutine is trying to send (when blocked on send) */
  pending?: number;
  /** human-readable result of its last completed operation */
  last?: string;
}

export interface LogEntry {
  n: number;
  text: string;
  tone: "neutral" | "ok" | "warn" | "danger" | "info";
}

export interface ChanState {
  cap: number;
  /** circular buffer slots; null = empty slot */
  buf: (number | null)[];
  sendx: number;
  recvx: number;
  qcount: number;
  sendq: { g: GId; value: number }[];
  recvq: GId[];
  closed: boolean;
  /** close() was called on an already-closed channel */
  closePanicked?: boolean;
  gs: Record<GId, GInfo>;
  nextValue: number;
  log: LogEntry[];
  seq: number;
}

export function newChan(cap: number): ChanState {
  return {
    cap,
    buf: new Array(cap).fill(null),
    sendx: 0,
    recvx: 0,
    qcount: 0,
    sendq: [],
    recvq: [],
    closed: false,
    gs: { G1: { status: "running" }, G2: { status: "running" }, G3: { status: "running" }, G4: { status: "running" } },
    nextValue: 1,
    log: [],
    seq: 0,
  };
}

function clone(s: ChanState): ChanState {
  return {
    ...s,
    buf: s.buf.slice(),
    sendq: s.sendq.map((x) => ({ ...x })),
    recvq: s.recvq.slice(),
    gs: { G1: { ...s.gs.G1 }, G2: { ...s.gs.G2 }, G3: { ...s.gs.G3 }, G4: { ...s.gs.G4 } },
    log: s.log.slice(),
  };
}

function log(s: ChanState, text: string, tone: LogEntry["tone"] = "neutral") {
  s.seq += 1;
  s.log.push({ n: s.seq, text, tone });
}

export function canAct(s: ChanState, g: GId): boolean {
  return s.gs[g].status === "running";
}

/** ch <- v, performed by goroutine g. */
export function send(prev: ChanState, g: GId): ChanState {
  if (!canAct(prev, g)) return prev;
  const s = clone(prev);
  const v = s.nextValue++;
  if (s.closed) {
    s.gs[g] = { status: "panicked", last: "panic: send on closed channel" };
    log(s, `${g}: ch <- ${v} → panic: send on closed channel. Sending on a closed channel always panics (and would crash the whole program unless recovered).`, "danger");
    return s;
  }
  // 1. A receiver is already waiting: hand the value straight to it, bypassing the buffer.
  const r = s.recvq.shift();
  if (r) {
    s.gs[r] = { status: "running", last: `received ${v} (ok=true)` };
    s.gs[g] = { status: "running", last: `sent ${v}` };
    log(s, `${g}: ch <- ${v}. ${r} was parked in recvq, so the runtime copies ${v} directly to ${r} and makes it runnable. The buffer is not touched.`, "ok");
    return s;
  }
  // 2. Room in the buffer: enqueue at sendx.
  if (s.qcount < s.cap) {
    s.buf[s.sendx] = v;
    s.sendx = (s.sendx + 1) % s.cap;
    s.qcount++;
    s.gs[g] = { status: "running", last: `sent ${v}` };
    log(s, `${g}: ch <- ${v}. No receiver waiting and the buffer has room (${s.qcount}/${s.cap}), so ${v} is copied into the buffer and ${g} carries on without blocking.`, "info");
    return s;
  }
  // 3. Park the sender on sendq.
  s.sendq.push({ g, value: v });
  s.gs[g] = { status: "blocked-send", pending: v };
  log(
    s,
    s.cap === 0
      ? `${g}: ch <- ${v}. Unbuffered and no receiver is waiting, so ${g} parks in sendq until someone receives.`
      : `${g}: ch <- ${v}. The buffer is full (${s.cap}/${s.cap}), so ${g} parks in sendq holding ${v}.`,
    "warn",
  );
  return s;
}

/** v, ok := <-ch, performed by goroutine g. */
export function recv(prev: ChanState, g: GId): ChanState {
  if (!canAct(prev, g)) return prev;
  const s = clone(prev);
  // Closed and drained: return immediately with the zero value.
  if (s.closed && s.qcount === 0) {
    s.gs[g] = { status: "running", last: "received 0 (ok=false)" };
    log(s, `${g}: <-ch. The channel is closed and empty, so it returns immediately with the zero value 0 and ok=false. (A for-range loop over the channel ends here.)`, "info");
    return s;
  }
  const sender = s.sendq.shift();
  if (sender) {
    if (s.cap === 0) {
      // Unbuffered: take directly from the parked sender.
      s.gs[g] = { status: "running", last: `received ${sender.value} (ok=true)` };
      s.gs[sender.g] = { status: "running", last: `sent ${sender.value}` };
      log(s, `${g}: <-ch. ${sender.g} was parked in sendq, so ${g} takes ${sender.value} directly from it and wakes it. This is the unbuffered rendezvous.`, "ok");
      return s;
    }
    // Buffer is full: take the head, then move the parked sender's value to the tail.
    const v = s.buf[s.recvx]!;
    s.buf[s.recvx] = sender.value;
    s.recvx = (s.recvx + 1) % s.cap;
    s.sendx = s.recvx;
    s.gs[g] = { status: "running", last: `received ${v} (ok=true)` };
    s.gs[sender.g] = { status: "running", last: `sent ${sender.value}` };
    log(s, `${g}: <-ch receives ${v} from the head of the buffer. ${sender.g} was parked in sendq, so its value ${sender.value} is copied into the freed slot at the tail and ${sender.g} is woken. FIFO order is preserved.`, "ok");
    return s;
  }
  if (s.qcount > 0) {
    const v = s.buf[s.recvx]!;
    s.buf[s.recvx] = null;
    s.recvx = (s.recvx + 1) % s.cap;
    s.qcount--;
    s.gs[g] = { status: "running", last: `received ${v} (ok=true)` };
    log(s, `${g}: <-ch takes ${v} from the head of the buffer (${s.qcount}/${s.cap} left).${s.closed ? " The channel is closed, but buffered values are still delivered before ok becomes false." : ""}`, "info");
    return s;
  }
  s.recvq.push(g);
  s.gs[g] = { status: "blocked-recv" };
  log(s, `${g}: <-ch. Nothing to receive, so ${g} parks in recvq until a sender arrives or the channel is closed.`, "warn");
  return s;
}

/** close(ch), performed by main. */
export function closeChan(prev: ChanState): ChanState {
  const s = clone(prev);
  if (s.closed) {
    s.closePanicked = true;
    log(s, "close(ch) → panic: close of closed channel. Closing twice always panics; usually only the sender side should close.", "danger");
    return s;
  }
  s.closed = true;
  const woken = s.recvq.splice(0);
  for (const r of woken) s.gs[r] = { status: "running", last: "received 0 (ok=false)" };
  const panicked = s.sendq.splice(0);
  for (const p of panicked) s.gs[p.g] = { status: "panicked", last: "panic: send on closed channel" };
  let msg = "close(ch). The channel is marked closed.";
  if (s.qcount) msg += ` ${s.qcount} buffered value${s.qcount === 1 ? "" : "s"} can still be received.`;
  if (woken.length) msg += ` Parked receivers ${woken.join(", ")} wake up with (0, ok=false).`;
  if (panicked.length) msg += ` Parked senders ${panicked.map((p) => p.g).join(", ")} wake up and panic: send on closed channel.`;
  log(s, msg, panicked.length ? "danger" : "info");
  return s;
}

/** The goroutine returns from its function. */
export function exitG(prev: ChanState, g: GId): ChanState {
  if (!canAct(prev, g)) return prev;
  const s = clone(prev);
  s.gs[g] = { ...s.gs[g], status: "done" };
  log(s, `${g} returns and exits. It will never send or receive again.`);
  return s;
}

export type DeadlockStatus =
  | { kind: "none" }
  | { kind: "some-blocked"; blocked: GId[]; canUnblock: GId[] }
  | { kind: "stuck"; blocked: GId[] };

/**
 * Among the four goroutines: who is blocked, and could anyone still unblock them?
 * A blocked sender needs a live receiver (or close); a blocked receiver needs a live sender (or close).
 * close() is available from main, so we only report "stuck" when every goroutine that is
 * not done/panicked is blocked.
 */
export function deadlockStatus(s: ChanState): DeadlockStatus {
  const blocked = ALL_G.filter((g) => s.gs[g].status === "blocked-send" || s.gs[g].status === "blocked-recv");
  if (blocked.length === 0) return { kind: "none" };
  const alive = ALL_G.filter((g) => s.gs[g].status === "running");
  if (alive.length === 0) return { kind: "stuck", blocked };
  const needRecv = blocked.some((g) => s.gs[g].status === "blocked-send");
  const canUnblock = alive.filter((g) => (needRecv ? RECEIVERS.includes(g) : SENDERS.includes(g)));
  return { kind: "some-blocked", blocked, canUnblock };
}

/** Buffered values in FIFO order (head first). */
export function bufferContents(s: ChanState): number[] {
  const out: number[] = [];
  for (let k = 0; k < s.qcount; k++) out.push(s.buf[(s.recvx + k) % s.cap]!);
  return out;
}
