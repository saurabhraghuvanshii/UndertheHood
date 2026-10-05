"use client";
import { useMemo, useState } from "react";
import { Narration, Panel, Segmented, StepControls, VizFrame, useStepper } from "../kit";
import { cn } from "@/components/ui/cn";

type NodeId = "browser" | "dns" | "lb" | "app" | "cache" | "db";
type Cat = "dns" | "setup" | "transit" | "server";

type Step = { id: string; title: string; at: NodeId[]; ms: number; cost: string; cat: Cat; text: string };

type Opts = { dnsCached: boolean; reuse: boolean; cacheHit: boolean; rtt: number; tls: "1.3" | "1.2" };

const NODES: { id: NodeId; label: string; sub: string }[] = [
  { id: "browser", label: "Browser", sub: "client" },
  { id: "dns", label: "DNS", sub: "resolvers" },
  { id: "lb", label: "Load balancer", sub: "L7, terminates TLS" },
  { id: "app", label: "App server", sub: "handler" },
  { id: "cache", label: "Cache", sub: "Redis" },
  { id: "db", label: "Database", sub: "indexed lookup" },
];

const CATS: { id: Cat; label: string; color: string }[] = [
  { id: "dns", label: "DNS", color: "var(--info)" },
  { id: "setup", label: "Connection setup", color: "var(--warn)" },
  { id: "transit", label: "Network transit", color: "var(--accent)" },
  { id: "server", label: "Server work", color: "var(--fg-subtle)" },
];

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Pure: build the ordered list of hops with approximate costs for the given options. */
export function buildSteps(o: Opts): Step[] {
  const s: Step[] = [];
  const rtt = o.rtt;
  s.push({
    id: "bcache",
    title: "Browser HTTP cache",
    at: ["browser"],
    ms: 0,
    cost: "~0 ms (local lookup)",
    cat: "server",
    text: "The browser first checks its HTTP cache. Per-user API responses are usually sent with Cache-Control: no-store or private, no-cache, so there is nothing reusable here and the request must go to the network.",
  });
  if (o.reuse) {
    s.push({
      id: "reuse",
      title: "Reuse open connection",
      at: ["browser", "lb"],
      ms: 0,
      cost: "0 ms",
      cat: "setup",
      text: "A keep-alive connection to api.example.com is already open (HTTP/1.1 keep-alive, or a multiplexed HTTP/2 or HTTP/3 connection). No DNS lookup, no TCP handshake and no TLS handshake: the request can be sent immediately. This is the single biggest saving for repeat requests. (The DNS toggle has no effect while a connection is reused.)",
    });
  } else {
    if (o.dnsCached) {
      s.push({ id: "dns-cached", title: "DNS: cached answer", at: ["browser"], ms: 0, cost: "~0 ms (OS/browser cache)", cat: "dns", text: "The browser or operating system still has api.example.com → its IP address cached from an earlier lookup, within the record’s TTL. No network trip is needed." });
    } else {
      s.push({ id: "dns-stub", title: "DNS: stub → recursive resolver", at: ["browser", "dns"], ms: 10, cost: "~10 ms (nearby resolver round trip, assumed)", cat: "dns", text: "Nothing is cached, so the OS stub resolver asks a recursive resolver (your ISP’s, or a public one like 1.1.1.1) for api.example.com, usually over UDP port 53." });
      s.push({ id: "dns-root", title: "DNS: recursive → root", at: ["dns"], ms: 15, cost: "~15 ms (approx.)", cat: "dns", text: "On a cold cache the resolver asks a root server, which does not know the answer but refers it to the servers for .com. In practice resolvers almost always have root and .com referrals cached; this shows the full cold walk." });
      s.push({ id: "dns-tld", title: "DNS: recursive → .com TLD", at: ["dns"], ms: 15, cost: "~15 ms (approx.)", cat: "dns", text: "The .com TLD servers refer the resolver to example.com’s authoritative name servers (the NS records)." });
      s.push({ id: "dns-auth", title: "DNS: recursive → authoritative", at: ["dns", "browser"], ms: 25, cost: "~25 ms (approx.)", cat: "dns", text: "The authoritative server for example.com returns the A/AAAA record for api.example.com with a TTL. The resolver caches it and returns it to the stub resolver, which hands the IP to the browser." });
    }
    s.push({ id: "tcp", title: "TCP 3-way handshake", at: ["browser", "lb"], ms: rtt, cost: `1 RTT ≈ ${rtt} ms`, cat: "setup", text: `SYN → SYN-ACK → ACK. The client can send data right after its ACK, so the handshake costs one round trip (${rtt} ms at this RTT) before anything useful happens.` });
    if (o.tls === "1.3") {
      s.push({ id: "tls13", title: "TLS 1.3 handshake", at: ["browser", "lb"], ms: rtt, cost: `1 RTT ≈ ${rtt} ms`, cat: "setup", text: "ClientHello already carries a key share; the load balancer answers with ServerHello, its certificate and Finished. Keys are agreed after one round trip. The handshake is with the load balancer, which terminates TLS. (Crypto work adds roughly a millisecond, ignored here.)" });
    } else {
      s.push({ id: "tls12a", title: "TLS 1.2 handshake (1/2)", at: ["browser", "lb"], ms: rtt, cost: `1 RTT ≈ ${rtt} ms`, cat: "setup", text: "TLS 1.2 first round trip: ClientHello → ServerHello, certificate, ServerHelloDone. The client verifies the certificate chain for api.example.com." });
      s.push({ id: "tls12b", title: "TLS 1.2 handshake (2/2)", at: ["browser", "lb"], ms: rtt, cost: `1 RTT ≈ ${rtt} ms`, cat: "setup", text: "Second round trip: ClientKeyExchange, ChangeCipherSpec, Finished → ChangeCipherSpec, Finished. TLS 1.3 removed this extra round trip." });
    }
  }
  s.push({ id: "req", title: "HTTP request travels", at: ["browser", "lb"], ms: rtt / 2, cost: `½ RTT ≈ ${r1(rtt / 2)} ms`, cat: "transit", text: "The encrypted GET /users/42 (with Host, Authorization and other headers) travels to the load balancer: half a round trip." });
  s.push({ id: "lb", title: "Load balancer (L7)", at: ["lb", "app"], ms: 1, cost: "~1 ms (approx.)", cat: "server", text: "The layer-7 load balancer decrypts the request, matches the host and path to a backend pool, picks a healthy app server (round robin, least connections…) and forwards it over a pooled connection inside the datacenter." });
  s.push({ id: "app", title: "App server handler", at: ["app"], ms: 2, cost: "~2 ms (approx.)", cat: "server", text: "The app parses the request, checks the auth token, and routes to the handler for GET /users/:id." });
  s.push(
    o.cacheHit
      ? { id: "cache", title: "Cache GET user:42 → hit", at: ["app", "cache"], ms: 0.5, cost: "~0.5 ms (in-DC round trip)", cat: "server", text: "The handler asks Redis for user:42 and gets it: a cache hit. The database is not touched. Almost all of the 0.5 ms is the network round trip inside the datacenter, not Redis itself." }
      : { id: "cache", title: "Cache GET user:42 → miss", at: ["app", "cache"], ms: 0.5, cost: "~0.5 ms (in-DC round trip)", cat: "server", text: "The handler asks Redis for user:42 and gets nothing back: a cache miss. It has to go to the database (cache-aside)." },
  );
  if (!o.cacheHit) {
    s.push({ id: "db", title: "Database query", at: ["app", "db"], ms: 5, cost: "~5 ms (indexed lookup, approx.)", cat: "server", text: "SELECT … FROM users WHERE id = 42 uses the primary-key index: a few page reads, mostly from the database’s buffer cache. A missing index or a cold disk could make this 10–100× slower." });
    s.push({ id: "cache-set", title: "Cache SET user:42", at: ["app", "cache"], ms: 0.5, cost: "~0.5 ms", cat: "server", text: "The handler stores the row in Redis with a TTL so the next request for user:42 is a hit. (Some apps do this asynchronously; here it is on the request path.)" });
  }
  s.push({ id: "resp-lb", title: "Response through LB", at: ["app", "lb"], ms: 1, cost: "~1 ms (approx.)", cat: "server", text: "The app serializes the user as JSON and returns 200 OK; the load balancer encrypts it and sends it on the client connection." });
  s.push({ id: "resp", title: "Response travels back", at: ["lb", "browser"], ms: rtt / 2, cost: `½ RTT ≈ ${r1(rtt / 2)} ms`, cat: "transit", text: "The response crosses the network back to the browser (another half round trip; a small JSON body fits in a few packets), which decrypts and parses it. Done." });
  return s;
}

const yesNo = [
  { value: "yes" as const, label: "Yes" },
  { value: "no" as const, label: "No" },
];

export default function RequestFlowViz() {
  const [dns, setDns] = useState<"yes" | "no">("no");
  const [reuse, setReuse] = useState<"yes" | "no">("no");
  const [hit, setHit] = useState<"yes" | "no">("no");
  const [rtt, setRtt] = useState(80);
  const [tls, setTls] = useState<"1.3" | "1.2">("1.3");

  const steps = useMemo(() => buildSteps({ dnsCached: dns === "yes", reuse: reuse === "yes", cacheHit: hit === "yes", rtt, tls }), [dns, reuse, hit, rtt, tls]);
  const st = useStepper(steps.length, 1800);
  const idx = Math.min(st.i, steps.length - 1);
  const cur = steps[idx];
  const total = steps.reduce((a, b) => a + b.ms, 0);
  const cumAt = (i: number) => steps.slice(0, i + 1).reduce((a, b) => a + b.ms, 0);
  const sofar = cumAt(idx);
  const byCat = CATS.map((c) => ({ ...c, total: steps.filter((x) => x.cat === c.id).reduce((a, b) => a + b.ms, 0), sofar: steps.slice(0, idx + 1).filter((x) => x.cat === c.id).reduce((a, b) => a + b.ms, 0) }));

  return (
    <VizFrame
      title="Life of an HTTPS request"
      kind="model"
      description={<>Step through <span className="font-mono">GET https://api.example.com/users/42</span> from a browser. All costs are approximate and illustrative; network legs are derived from the client round-trip time (RTT) you pick.</>}
      footer={
        <>
          <strong className="text-fg">See it for real.</strong> <code className="font-mono">curl -w &quot;dns %{"{time_namelookup}"} connect %{"{time_connect}"} tls %{"{time_appconnect}"} ttfb %{"{time_starttransfer}"} total %{"{time_total}"}\n&quot; -o /dev/null -s https://example.com</code> prints cumulative timings for the same phases (each value includes the ones before it). In browser devtools, open Network, click a request and the Timing tab shows DNS Lookup, Initial connection, SSL, Request sent, Waiting for server response (TTFB) and Content Download; repeat requests on a kept-alive connection show no DNS, connection or SSL time. Notice how, at high RTT, connection setup dominates and server work barely registers.
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Segmented label="DNS cached" value={dns} options={yesNo} onChange={setDns} />
          <Segmented label="Connection reused (keep-alive)" value={reuse} options={yesNo} onChange={setReuse} />
          <Segmented label="Cache hit" value={hit} options={yesNo} onChange={setHit} />
          <Segmented label="Client RTT" value={rtt} options={[20, 80, 200].map((v) => ({ value: v, label: `${v} ms` }))} onChange={setRtt} />
          <Segmented label="TLS" value={tls} options={[{ value: "1.3" as const, label: "1.3 (1-RTT)" }, { value: "1.2" as const, label: "1.2 (2-RTT)" }]} onChange={setTls} />
        </div>

        <StepControls s={st} label="hop" />

        <ol className="flex flex-wrap items-stretch gap-x-1 gap-y-2" aria-label="Components on the request path">
          {NODES.map((n, i) => {
            const on = cur.at.includes(n.id);
            const visited = steps.slice(0, idx + 1).some((x) => x.at.includes(n.id));
            return (
              <li key={n.id} className="flex items-center gap-1">
                <div
                  aria-current={on ? "step" : undefined}
                  className={cn(
                    "min-w-[5.5rem] rounded-md border px-2 py-1.5 text-center transition-colors",
                    on ? "border-fg bg-accent-soft ring-2 ring-accent" : visited ? "border-border-strong bg-surface" : "border-dashed border-border bg-bg opacity-70",
                  )}
                >
                  <div className="text-xs font-semibold text-fg">
                    {on && <span aria-hidden>● </span>}
                    {n.label}
                  </div>
                  <div className="text-[10px] text-muted">{n.sub}</div>
                </div>
                {i < NODES.length - 1 && <span aria-hidden className="text-subtle">→</span>}
              </li>
            );
          })}
        </ol>

        <Narration>
          <p className="font-semibold">
            {idx + 1}. {cur.title} <span className="font-mono text-xs font-normal text-muted">· {cur.cost}</span>
          </p>
          <p className="mt-1">{cur.text}</p>
          <p className="mt-1 text-xs text-muted">
            Elapsed so far ≈ {r1(sofar)} ms of ≈ {r1(total)} ms total for this scenario.
          </p>
        </Narration>

        <Panel title="Latency budget" hint="approximate">
          <div className="flex h-4 w-full overflow-hidden rounded bg-surface-2" role="img" aria-label={`Elapsed ${r1(sofar)} of ${r1(total)} milliseconds. ${byCat.map((c) => `${c.label} ${r1(c.sofar)} ms`).join(", ")}.`}>
            {byCat.map((c) => (
              <div key={c.id} style={{ width: `${total ? (c.sofar / total) * 100 : 0}%`, background: c.color }} />
            ))}
          </div>
          <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
            {byCat.map((c) => (
              <li key={c.id} className="inline-flex items-center gap-1">
                <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: c.color }} />
                {c.label}: <span className="font-mono text-fg">{r1(c.sofar)}</span> / {r1(c.total)} ms
              </li>
            ))}
          </ul>
          <table className="mt-2 w-full text-xs">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                <th className="py-1 font-medium">Hop</th>
                <th className="py-1 text-right font-medium">Cost</th>
                <th className="py-1 text-right font-medium">Cumulative</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((x, i) => (
                <tr key={x.id} aria-current={i === idx ? "step" : undefined} className={cn("border-t border-border", i === idx ? "bg-accent-soft font-semibold text-fg" : i < idx ? "text-fg" : "text-subtle")}>
                  <td className="py-1 pr-2">
                    <button type="button" className="text-left hover:underline" onClick={() => st.setI(i)}>
                      {i + 1}. {x.title}
                    </button>
                  </td>
                  <td className="py-1 text-right font-mono">~{r1(x.ms)}</td>
                  <td className="py-1 text-right font-mono">{r1(cumAt(i))}</td>
                </tr>
              ))}
              <tr className="border-t border-border-strong font-semibold text-fg">
                <td className="py-1">Total (ms, approx.)</td>
                <td />
                <td className="py-1 text-right font-mono">{r1(total)}</td>
              </tr>
            </tbody>
          </table>
        </Panel>
      </div>
    </VizFrame>
  );
}
