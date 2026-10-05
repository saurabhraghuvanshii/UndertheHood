/**
 * Pure tick model of a worker pool:
 *
 *   jobs := make(chan Job, B); results := make(chan Result)
 *   producer: for each job { jobs <- job }; close(jobs)
 *   N workers: for job := range jobs { work(job); results <- r }; wg.Done()
 *   closer:   wg.Wait(); close(results)
 *   main:     for r := range results { collect(r) }
 *
 * Simplifications: the producer creates at most one job per tick; main collects
 * results immediately (results never back up).
 */

export const TOTAL_JOBS = 12;
/** Deterministic job durations in ticks (1–3). */
export const DURATIONS = [2, 1, 3, 1, 2, 3, 1, 2, 2, 1, 3, 1];

export type ProducerState = "sending" | "blocked" | "closing" | "done";
export type WorkerState = "waiting" | "busy" | "exited";

export interface Worker {
  id: number;
  state: WorkerState;
  job: number | null;
  remaining: number;
  completed: number;
}

export interface PoolLog {
  n: number;
  tick: number;
  text: string;
  tone: "neutral" | "ok" | "warn" | "info";
}

export interface PoolState {
  bufferCap: number;
  tick: number;
  /** next job number the producer will send (1-based); > TOTAL_JOBS when all sent */
  nextJob: number;
  producer: ProducerState;
  producerBlockedTicks: number;
  jobs: number[];
  jobsClosed: boolean;
  jobsClosedAt: number | null;
  workers: Worker[];
  wg: number;
  results: number[];
  resultsClosed: boolean;
  mainDone: boolean;
  maxDepth: number;
  log: PoolLog[];
  seq: number;
}

export function newPool(workers: number, bufferCap: number): PoolState {
  return {
    bufferCap,
    tick: 0,
    nextJob: 1,
    producer: "sending",
    producerBlockedTicks: 0,
    jobs: [],
    jobsClosed: false,
    jobsClosedAt: null,
    workers: Array.from({ length: workers }, (_, i) => ({ id: i + 1, state: "waiting", job: null, remaining: 0, completed: 0 })),
    wg: workers,
    results: [],
    resultsClosed: false,
    mainDone: false,
    maxDepth: 0,
    log: [],
    seq: 0,
  };
}

function clone(s: PoolState): PoolState {
  return { ...s, jobs: s.jobs.slice(), workers: s.workers.map((w) => ({ ...w })), results: s.results.slice(), log: s.log.slice() };
}

function log(s: PoolState, text: string, tone: PoolLog["tone"] = "neutral") {
  s.seq++;
  s.log.push({ n: s.seq, tick: s.tick, text, tone });
}

const start = (w: Worker, job: number) => {
  w.state = "busy";
  w.job = job;
  w.remaining = DURATIONS[(job - 1) % DURATIONS.length];
};

export function poolTick(prev: PoolState): PoolState {
  if (prev.mainDone) return prev;
  const s = clone(prev);
  s.tick++;

  // 1. Busy workers make progress; finished jobs are sent on results and collected by main.
  for (const w of s.workers) {
    if (w.state !== "busy") continue;
    w.remaining--;
    if (w.remaining === 0) {
      s.results.push(w.job!);
      w.completed++;
      log(s, `Worker ${w.id} finished job ${w.job} and sent the result; main collected it.`, "ok");
      w.job = null;
      w.state = "waiting";
    }
  }

  // 2. Producer.
  if (s.producer === "closing") {
    s.jobsClosed = true;
    s.jobsClosedAt = s.tick;
    s.producer = "done";
    log(s, "Producer has sent all 12 jobs and calls close(jobs). Workers will drain what is buffered, then their range loops end.", "info");
  } else if (s.producer === "sending" || s.producer === "blocked") {
    const job = s.nextJob;
    const waiting = s.workers.find((w) => w.state === "waiting");
    if (s.jobs.length === 0 && waiting) {
      start(waiting, job);
      s.nextJob++;
      s.producer = "sending";
      log(s, `Producer sends job ${job}; worker ${waiting.id} was waiting in range, so it receives the job directly.`);
    } else if (s.jobs.length < s.bufferCap) {
      s.jobs.push(job);
      s.nextJob++;
      if (s.producer === "blocked") log(s, `Room in the buffer again: the producer unblocks and job ${job} goes into the queue.`, "info");
      s.producer = "sending";
    } else {
      if (s.producer !== "blocked") log(s, s.bufferCap === 0 ? `Producer wants to send job ${job} but no worker is free: unbuffered send blocks.` : `Buffer full (${s.bufferCap}/${s.bufferCap}): the producer blocks on jobs <- ${job}. That's backpressure.`, "warn");
      s.producer = "blocked";
      s.producerBlockedTicks++;
    }
    if (s.nextJob > TOTAL_JOBS && s.producer === "sending") s.producer = "closing";
  }

  // 3. Waiting workers take jobs from the buffer, or exit if it is closed and drained.
  for (const w of s.workers) {
    if (w.state !== "waiting") continue;
    if (s.jobs.length) {
      const job = s.jobs.shift()!;
      start(w, job);
      log(s, `Worker ${w.id} takes job ${job} from the buffer (${DURATIONS[(job - 1) % DURATIONS.length]} tick${DURATIONS[(job - 1) % DURATIONS.length] === 1 ? "" : "s"} of work).`);
    } else if (s.jobsClosed) {
      w.state = "exited";
      s.wg--;
      log(s, `jobs is closed and empty, so worker ${w.id}'s for-range loop ends; it calls wg.Done() (wg = ${s.wg}).`, "info");
    }
  }
  s.maxDepth = Math.max(s.maxDepth, s.jobs.length);

  // 4. Closer goroutine and main.
  if (s.wg === 0 && !s.resultsClosed) {
    s.resultsClosed = true;
    s.mainDone = true;
    log(s, `wg.Wait() returns in the closer goroutine, which calls close(results). main's range over results ends: all ${s.results.length} results collected in ${s.tick} ticks.`, "ok");
  }
  return s;
}

export function runToEnd(s: PoolState, limit = 500): PoolState {
  let x = s;
  for (let i = 0; i < limit && !x.mainDone; i++) x = poolTick(x);
  return x;
}

export const SOURCE = [
  "jobs := make(chan int, B)",
  "results := make(chan int)",
  "var wg sync.WaitGroup",
  "for w := 1; w <= N; w++ {",
  "    wg.Add(1)",
  "    go func() {                     // worker",
  "        defer wg.Done()",
  "        for job := range jobs {",
  "            results <- work(job)",
  "        }",
  "    }()",
  "}",
  "go func() {                         // producer",
  "    for j := 1; j <= 12; j++ { jobs <- j }",
  "    close(jobs)",
  "}()",
  "go func() { wg.Wait(); close(results) }()",
  "for r := range results { collect(r) } // main",
];

/** Which source lines are "active" right now. */
export function activeLines(s: PoolState): number[] {
  const out = new Set<number>();
  if (s.producer === "sending" || s.producer === "blocked") out.add(13);
  if (s.producer === "closing" || s.jobsClosedAt === s.tick) out.add(14);
  if (s.workers.some((w) => w.state === "busy")) out.add(8);
  if (s.workers.some((w) => w.state === "waiting")) out.add(7);
  if (s.workers.some((w) => w.state === "exited") && !s.resultsClosed) out.add(6);
  if (s.resultsClosed) out.add(16);
  else out.add(17);
  return [...out];
}
