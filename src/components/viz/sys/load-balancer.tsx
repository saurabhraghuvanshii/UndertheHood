"use client";
import { useState } from "react";
import { Clock, RotateCcw, Send } from "lucide-react";
import { Chip, CtlButton, Empty, Narration, Panel, Segmented, VizFrame } from "../kit";
import { cn } from "@/components/ui/cn";
import { CLIENTS, SERVER_NAMES, VNODES, buildRing, clientKey, hash32, initLb, kill, remapStats, revive, ringLookup, send, setAlgorithm, tick, type Algorithm } from "./lb-model";

const ALGOS: { value: Algorithm; label: string }[] = [
  { value: "round-robin", label: "Round robin" },
  { value: "least-connections", label: "Least conn." },
  { value: "consistent-hash", label: "Consistent hash" },
];

const ALGO_TEXT: Record<Algorithm, string> = {
  "round-robin": "Round robin hands requests out in a fixed cycle A → B → C → D. Simple and fair by count, but blind to load: a server stuck with long requests still gets its turn.",
  "least-connections": "Least connections sends each request to the live server with the fewest in-flight requests, so slow requests naturally steer new work elsewhere.",
  "consistent-hash": `Consistent hashing places each server at ${VNODES} points (virtual nodes) on a hash ring and sends a client to the first server point clockwise from hash(client id). The same client sticks to the same server, which keeps per-server caches warm.`,
};

/** Server colours are paired with letter labels everywhere, never used alone. */
const SERVER_COLOR = ["var(--accent)", "var(--info)", "var(--warn)", "var(--fg-subtle)"];

export default function LoadBalancerViz() {
  const [s, setS] = useState(() => initLb());
  const live = s.servers.map((x, i) => (x.alive ? i : -1)).filter((i) => i >= 0);
  const dead = s.servers.map((x, i) => (x.alive ? -1 : i)).filter((i) => i >= 0);
  const maxActive = Math.max(4, ...s.servers.map((x) => x.active.length));

  const liveKey = live.join(",");
  const remap = remapStats(4, dead.length ? dead : [3], 1000);

  const ringAll = buildRing([0, 1, 2, 3]);
  const ringLive = buildRing(live);
  const clients = Array.from({ length: CLIENTS }, (_, i) => i + 1).map((c) => ({ c, before: ringLookup(ringAll, clientKey(c)), now: ringLookup(ringLive, clientKey(c)) }));
  const movedClients = clients.filter((x) => x.before !== x.now).length;

  const lastRoutes = s.last.filter((e) => e.kind === "route");
  const perServer = SERVER_NAMES.map((_, i) => lastRoutes.filter((e) => e.server === i).length);

  return (
    <VizFrame
      title="Load-balancing algorithms"
      kind="model"
      description="Four backend servers behind one load balancer. Each request comes from one of 24 clients and takes a few ticks to finish; durations are deliberately uneven and come from a fixed pseudo-random seed, so runs are reproducible."
      footer={
        <>
          <strong className="text-fg">What to notice.</strong> Send 10, then Tick a few times: round robin gives every server the same <em>count</em>, but the long requests pile up unevenly; least connections balances <em>in-flight</em> work. Kill a server under consistent hashing: only the clients that lived on it move (about 1/N of keys), while <code className="font-mono">hash % N</code> would reshuffle most keys because N changed. Real balancers (NGINX, Envoy, HAProxy) add health checks, weights, and smarter variants like “power of two random choices”.
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Segmented label="Algorithm" value={s.algorithm} options={ALGOS} onChange={(v) => setS((x) => setAlgorithm(x, v))} />
        <p className="text-xs text-muted">{ALGO_TEXT[s.algorithm]}</p>

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Load balancer actions">
          <CtlButton label="Send 1 request" onClick={() => setS((x) => send(x, 1))} primary>
            <Send className="h-4 w-4" /> <span className="text-xs">Send 1</span>
          </CtlButton>
          <CtlButton label="Send 10 requests" onClick={() => setS((x) => send(x, 10))}>
            <span className="text-xs">Send 10</span>
          </CtlButton>
          <CtlButton label="Tick (requests progress)" onClick={() => setS(tick)}>
            <Clock className="h-4 w-4" /> <span className="text-xs">Tick</span>
          </CtlButton>
          <CtlButton label="Reset" onClick={() => setS(initLb(s.algorithm))}>
            <RotateCcw className="h-4 w-4" />
          </CtlButton>
          <span className="ml-auto font-mono text-xs text-muted">tick {s.tick}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {s.servers.map((srv, i) => (
            <div key={srv.name} className={cn("rounded-md border p-2", srv.alive ? "border-border bg-bg" : "border-danger/40 bg-danger-soft")}>
              <div className="flex items-center justify-between gap-1">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-fg">
                  <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: SERVER_COLOR[i] }} />
                  Server {srv.name}
                </span>
                <span className={cn("text-[11px] font-medium", srv.alive ? "text-ok" : "text-danger")}>{srv.alive ? "up" : "down"}</span>
              </div>
              <div className="mt-1.5 flex h-2 overflow-hidden rounded bg-surface-2" aria-hidden>
                <div className="bg-fg/70" style={{ width: `${(srv.active.length / maxActive) * 100}%` }} />
              </div>
              <div className="mt-1 text-xs text-muted">
                <span className="font-mono text-fg">{srv.active.length}</span> active · <span className="font-mono text-fg">{srv.handled}</span> done
              </div>
              <div className="mt-1 flex min-h-6 flex-wrap gap-0.5" aria-label={`In-flight requests on server ${srv.name}, ticks remaining`}>
                {srv.active.length === 0 ? <Empty>idle</Empty> : srv.active.map((r) => (
                  <span key={r.id} title={`#${r.id} ${clientKey(r.client)}: ${r.remaining} of ${r.duration} ticks left`} className={cn("rounded border px-1 font-mono text-[10px]", r.duration >= 5 ? "border-warn/50 bg-warn-soft" : "border-border-strong bg-surface")}>
                    {r.remaining}
                  </span>
                ))}
              </div>
              <div className="mt-1.5">
                {srv.alive ? (
                  <CtlButton label={`Kill server ${srv.name}`} onClick={() => setS((x) => kill(x, i))} disabled={live.length === 1}>
                    <span className="text-xs">Kill</span>
                  </CtlButton>
                ) : (
                  <CtlButton label={`Revive server ${srv.name}`} onClick={() => setS((x) => revive(x, i))}>
                    <span className="text-xs">Revive</span>
                  </CtlButton>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-subtle">Small boxes are in-flight requests showing ticks remaining; shaded boxes are long requests (5+ ticks).</p>

        <Narration>
          {s.last.length === 0 ? (
            <>Press <strong>Send 10</strong> to route a batch of requests, then <strong>Tick</strong> to let them finish.</>
          ) : lastRoutes.length > 1 ? (
            <>
              <p>
                Routed {lastRoutes.length} requests: {SERVER_NAMES.map((n, i) => `${n} ${perServer[i]}`).join(", ")}.
              </p>
              <p className="mt-1 text-muted">Last: {lastRoutes[lastRoutes.length - 1].text}</p>
            </>
          ) : (
            s.last.map((e, i) => <p key={i}>{e.text}</p>)
          )}
        </Narration>

        {s.algorithm === "consistent-hash" && (
          <Panel title="Hash ring" hint={`${VNODES} virtual nodes per server`}>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <Ring liveKey={liveKey} />
              <div className="min-w-0 flex-1 text-xs">
                <p className="text-muted">Where each client lands now{dead.length ? " (moved clients marked “moved”)" : ""}:</p>
                <ul className="mt-1 flex flex-wrap gap-1">
                  {clients.map(({ c, before, now }) => (
                    <li key={c}>
                      <Chip tone={before !== now ? "warn" : "neutral"}>
                        c{c}→{SERVER_NAMES[now] ?? "–"}
                        {before !== now && <span className="text-[10px]"> moved</span>}
                      </Chip>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-muted">
                  {dead.length ? `${movedClients} of ${CLIENTS} clients changed server because ${dead.map((d) => SERVER_NAMES[d]).join(", ")} went down.` : "All servers up. Kill one to see which clients move."}
                </p>
              </div>
            </div>
          </Panel>
        )}

        <Panel title="Keys remapped when a server is removed" hint="1,000 test keys">
          <p className="mb-2 text-xs text-muted">
            {dead.length ? `Removing ${dead.map((d) => SERVER_NAMES[d]).join(", ")} from 4 servers:` : "If server D were removed from 4 servers:"}
          </p>
          <RemapBar label="Consistent hashing" moved={remap.ringMoved} total={remap.nKeys} />
          <RemapBar label="hash % N" moved={remap.modMoved} total={remap.nKeys} />
          <p className="mt-2 text-xs text-muted">
            Ideal minimum is {Math.round(remap.ideal * 100)}% (only the removed server’s keys). Modulo hashing changes the divisor, so a key keeps its server only by coincidence. Virtual-node counts are small here, so the ring’s share is approximate.
          </p>
        </Panel>
      </div>
    </VizFrame>
  );
}

function RemapBar({ label, moved, total }: { label: string; moved: number; total: number }) {
  const pct = (moved / total) * 100;
  return (
    <div className="mb-1.5 grid grid-cols-[7.5rem_1fr] items-center gap-2 text-xs sm:grid-cols-[9rem_1fr]">
      <span className="text-fg">{label}</span>
      <div className="flex items-center gap-2">
        <div className="h-3 flex-1 overflow-hidden rounded bg-surface-2" aria-hidden>
          <div className="h-full bg-fg/70" style={{ width: `${pct}%` }} />
        </div>
        <span className="w-24 shrink-0 text-right font-mono">
          {moved} ({Math.round(pct)}%)
        </span>
      </div>
    </div>
  );
}

const parseKey = (k: string) => (k ? k.split(",").map(Number) : []);

function Ring({ liveKey }: { liveKey: string }) {
  const live = parseKey(liveKey);
  const ring = buildRing(live);
  const R = 70;
  const C = 90;
  const ang = (pos: number) => (pos / 4294967296) * Math.PI * 2 - Math.PI / 2;
  return (
    <figure className="shrink-0">
      <svg viewBox="0 0 180 180" width={180} height={180} role="img" aria-label={`Hash ring with ${ring.length} virtual nodes for servers ${live.map((i) => SERVER_NAMES[i]).join(", ")} and ${CLIENTS} client positions`}>
        <circle cx={C} cy={C} r={R} fill="none" stroke="var(--border-strong)" strokeWidth={1} />
        {ring.map((p, k) => {
          const a = ang(p.pos);
          return <line key={k} x1={C + Math.cos(a) * (R - 6)} y1={C + Math.sin(a) * (R - 6)} x2={C + Math.cos(a) * (R + 6)} y2={C + Math.sin(a) * (R + 6)} stroke={SERVER_COLOR[p.server]} strokeWidth={1.5} />;
        })}
        {Array.from({ length: CLIENTS }, (_, i) => {
          const a = ang(hash32(clientKey(i + 1)));
          return <circle key={i} cx={C + Math.cos(a) * (R - 16)} cy={C + Math.sin(a) * (R - 16)} r={2} fill="var(--fg)" />;
        })}
        <text x={C} y={C - 4} textAnchor="middle" fontSize={10} fill="var(--fg-muted)">
          ticks = servers
        </text>
        <text x={C} y={C + 10} textAnchor="middle" fontSize={10} fill="var(--fg-muted)">
          dots = clients
        </text>
      </svg>
      <figcaption className="flex flex-wrap justify-center gap-2 text-[11px] text-muted">
        {live.map((i) => (
          <span key={i} className="inline-flex items-center gap-1">
            <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: SERVER_COLOR[i] }} />
            {SERVER_NAMES[i]}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
