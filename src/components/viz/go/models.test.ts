import { describe, expect, it } from "vitest";
import { applySliceOp, emptySliceState, growCap, nextSliceCap, roundUpSize, runScenario, SCENARIOS, sliceValues, type SliceOp, type SliceState } from "./slices-model";
import { bufferContents, closeChan, deadlockStatus, exitG, newChan, recv, send } from "./channels-model";
import { EXPECTED, newMutexState, randomInterleaving, step, type MG } from "./mutex-model";
import { newPool, poolTick, runToEnd, TOTAL_JOBS } from "./worker-pool-model";
import { blockSyscall, findRunnable, newScheduler, spawnMany, tick } from "./scheduler-model";

function run(ops: SliceOp[]): SliceState {
  let s = emptySliceState();
  for (const op of ops) {
    const r = applySliceOp(s, op);
    if (r.error) throw new Error(r.error);
    s = r.state;
  }
  return s;
}

describe("growslice ([]int)", () => {
  it("appending one at a time to nil gives caps 1,2,4,4,8", () => {
    let s = run([{ kind: "nil", name: "s" }]);
    const caps: number[] = [];
    for (let v = 1; v <= 5; v++) {
      s = applySliceOp(s, { kind: "append", target: "s", src: "s", values: [v] }).state;
      caps.push(s.vars.s.cap);
    }
    expect(caps).toEqual([1, 2, 4, 4, 8]);
    expect(sliceValues(s, "s")).toEqual([1, 2, 3, 4, 5]);
  });
  it("bulk appends to nil round up to size classes", () => {
    expect(growCap(3, 0).newCap).toBe(3);
    expect(growCap(5, 0).newCap).toBe(6);
    const s = run([{ kind: "append", target: "t", src: null, values: [1, 2, 3, 4, 5] }]);
    expect(s.vars.t.cap).toBe(6);
  });
  it("large slices grow by the 1.25x-ish formula plus size classes", () => {
    expect(growCap(257, 256).newCap).toBe(512);
    expect(nextSliceCap(513, 512)).toBe(832);
    expect(growCap(513, 512).newCap).toBe(848);
    expect(roundUpSize(40000)).toBe(40960);
  });
  it("aliasing: append into spare capacity overwrites the other slice", () => {
    const frames = runScenario(SCENARIOS.find((x) => x.id === "aliasing")!);
    const afterAppend = frames[2].state;
    expect(sliceValues(afterAppend, "a")).toEqual([1, 2, 99]);
    expect(frames[2].grew).toBeNull();
  });
  it("full slice expression forces a copy", () => {
    const frames = runScenario(SCENARIOS.find((x) => x.id === "fullslice")!);
    expect(frames[2].grew?.newCap).toBe(4);
    expect(sliceValues(frames[3].state, "a")).toEqual([1, 2, 3]);
  });
  it("memory retention: clone frees the big array", () => {
    const frames = runScenario(SCENARIOS.find((x) => x.id === "retention")!);
    expect(frames[2].freed).toEqual([]);
    expect(frames[3].freed).toEqual(["#1"]);
    expect(frames[3].state.vars.head.cap).toBe(3);
  });
  it("reslice bounds are checked", () => {
    const s = run([{ kind: "literal", name: "a", values: [1, 2] }]);
    expect(applySliceOp(s, { kind: "reslice", target: "b", src: "a", hi: 3 }).error).toMatch(/out of range/);
  });
  it("copy copies min(len) elements", () => {
    const s = run([
      { kind: "literal", name: "a", values: [1, 2, 3] },
      { kind: "make", name: "b", len: 2 },
    ]);
    const r = applySliceOp(s, { kind: "copy", dst: "b", src: "a" });
    expect(r.copied).toBe(2);
    expect(sliceValues(r.state, "b")).toEqual([1, 2]);
  });
});

describe("channels", () => {
  it("unbuffered: a send with a waiting receiver hands off directly", () => {
    let s = recv(newChan(0), "G3");
    expect(s.gs.G3.status).toBe("blocked-recv");
    s = send(s, "G1");
    expect(s.gs.G3.status).toBe("running");
    expect(s.gs.G3.last).toBe("received 1 (ok=true)");
    expect(s.qcount).toBe(0);
  });
  it("unbuffered: a send without a receiver parks, then a receive takes from the sender", () => {
    let s = send(newChan(0), "G1");
    expect(s.gs.G1.status).toBe("blocked-send");
    s = recv(s, "G3");
    expect(s.gs.G1.status).toBe("running");
    expect(s.gs.G3.last).toBe("received 1 (ok=true)");
  });
  it("buffered: fills, then blocks; a receive frees a slot and wakes the parked sender", () => {
    let s = newChan(2);
    s = send(s, "G1");
    s = send(s, "G2");
    expect(bufferContents(s)).toEqual([1, 2]);
    s = send(s, "G1");
    expect(s.gs.G1.status).toBe("blocked-send");
    s = recv(s, "G3");
    expect(s.gs.G3.last).toBe("received 1 (ok=true)");
    expect(s.gs.G1.status).toBe("running");
    expect(bufferContents(s)).toEqual([2, 3]);
    expect(s.sendq).toHaveLength(0);
  });
  it("receive from closed+empty returns ok=false; buffered values drain first", () => {
    let s = send(newChan(1), "G1");
    s = closeChan(s);
    s = recv(s, "G3");
    expect(s.gs.G3.last).toBe("received 1 (ok=true)");
    s = recv(s, "G4");
    expect(s.gs.G4.last).toBe("received 0 (ok=false)");
    expect(s.gs.G4.status).toBe("running");
  });
  it("close twice panics; send on closed panics", () => {
    let s = closeChan(newChan(0));
    s = closeChan(s);
    expect(s.closePanicked).toBe(true);
    s = send(s, "G1");
    expect(s.gs.G1.status).toBe("panicked");
  });
  it("close wakes parked receivers with ok=false and panics parked senders", () => {
    let s = recv(newChan(0), "G3");
    s = closeChan(s);
    expect(s.gs.G3.last).toBe("received 0 (ok=false)");
    let t = send(newChan(0), "G1");
    t = closeChan(t);
    expect(t.gs.G1.status).toBe("panicked");
  });
  it("reports stuck when every remaining goroutine is blocked", () => {
    let s = exitG(newChan(0), "G3");
    s = exitG(s, "G4");
    s = send(s, "G1");
    expect(deadlockStatus(s).kind).toBe("some-blocked");
    s = send(s, "G2");
    expect(deadlockStatus(s).kind).toBe("stuck");
  });
});

describe("mutex", () => {
  const seq = (useMutex: boolean, order: MG[]) => order.reduce((s, g) => step(s, g), newMutexState(useMutex));
  it("detects a lost update without the mutex", () => {
    const s = seq(false, ["G1", "G2", "G1", "G2", "G1", "G2"]);
    expect(s.counter).toBe(1);
    expect(s.lostUpdates).toHaveLength(1);
    expect(s.lostUpdates[0]).toMatchObject({ by: "G2", victim: "G1" });
  });
  it("serial execution gives 6 with no lost updates", () => {
    const s = seq(false, [...Array(9).fill("G1"), ...Array(9).fill("G2")]);
    expect(s.counter).toBe(EXPECTED);
    expect(s.lostUpdates).toHaveLength(0);
  });
  it("with the mutex a contender blocks and every interleaving yields 6", () => {
    let s = step(newMutexState(true), "G1"); // G1 locks
    s = step(s, "G2"); // G2 blocks
    expect(s.gs.G2.blocked).toBe(true);
    expect(step(s, "G2")).toBe(s);
    for (let k = 0; k < 20; k++) {
      let r = 0.1 * k;
      const out = randomInterleaving(newMutexState(true), () => (r = (r * 9301 + 0.49297) % 1));
      expect(out.counter).toBe(EXPECTED);
      expect(out.lostUpdates).toHaveLength(0);
    }
  });
});

describe("worker pool", () => {
  for (const workers of [1, 2, 3, 4])
    for (const buf of [0, 1, 2, 3, 4])
      it(`completes all jobs with ${workers} workers, buffer ${buf}`, () => {
        let s = newPool(workers, buf);
        let maxDepth = 0;
        for (let i = 0; i < 200 && !s.mainDone; i++) {
          s = poolTick(s);
          maxDepth = Math.max(maxDepth, s.jobs.length);
        }
        expect(s.mainDone).toBe(true);
        expect([...s.results].sort((a, b) => a - b)).toEqual(Array.from({ length: TOTAL_JOBS }, (_, i) => i + 1));
        expect(maxDepth).toBeLessThanOrEqual(buf);
        expect(s.workers.every((w) => w.state === "exited")).toBe(true);
      });
  it("one slow worker with a small buffer blocks the producer (backpressure)", () => {
    expect(runToEnd(newPool(1, 1)).producerBlockedTicks).toBeGreaterThan(0);
  });
  it("more workers finish sooner", () => {
    expect(runToEnd(newPool(4, 2)).tick).toBeLessThan(runToEnd(newPool(1, 2)).tick);
  });
});

describe("scheduler", () => {
  it("new goroutines go to runnext, bumping the old one to the local queue", () => {
    const s = spawnMany(newScheduler(1), 3);
    expect(s.ps[0].runnext).toBe(4);
    expect(s.ps[0].local).toEqual([2, 3]);
  });
  it("an idle P steals half of a busy P's local queue", () => {
    const s = spawnMany(newScheduler(2), 8); // P0: runnext G9, local G2..G8 (7)
    expect(s.ps[0].local).toHaveLength(7);
    const thief = s.ps[1];
    const pick = findRunnable(s, thief)!;
    // steals ceil(7/2) = 4: runs one, queues three
    expect(pick.g).toBe(2);
    expect(thief.local).toEqual([3, 4, 5]);
    expect(s.ps[0].local).toEqual([6, 7, 8]);
  });
  it("tick wakes idle Ps on new Ms which steal work", () => {
    const s = tick(spawnMany(newScheduler(2), 8));
    expect(s.ps[1].m).not.toBeNull();
    expect(s.ps[1].cur).not.toBeNull();
    expect(s.ms.length).toBe(2);
  });
  it("blocking syscall hands the P to another M so it stays busy", () => {
    let s = spawnMany(newScheduler(1), 2);
    s = blockSyscall(s, 0);
    expect(s.gs[1].status).toBe("syscall");
    expect(s.ms[0].state).toBe("syscall");
    expect(s.ps[0].m).toBe(1);
    expect(s.ps[0].cur).not.toBeNull();
    // syscall returns: P is busy, so main goes to the global queue and M0 parks
    s = tick(tick(tick(s)));
    expect(s.syscalls).toHaveLength(0);
    expect(s.ms[0].state === "idle" || s.ms[0].state === "running").toBe(true);
    expect(s.gs[1].status === "runnable" || s.gs[1].status === "running").toBe(true);
  });
  it("a long-running G is preempted when others wait", () => {
    let s = spawnMany(newScheduler(1), 1);
    s = tick(s);
    s = tick(s);
    expect(s.ps[0].cur).toBe(2);
    expect(s.ps[0].local).toContain(1);
  });
});
