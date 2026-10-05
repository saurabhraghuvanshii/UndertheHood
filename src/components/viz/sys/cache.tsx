"use client";
import { useState } from "react";
import { Clock, RotateCcw } from "lucide-react";
import { Chip, CtlButton, Empty, Narration, Panel, Segmented, VizFrame } from "../kit";
import { KEYS, hitRatio, initCache, isExpired, read, setStrategy, setTtl, tick, write, type CacheEvent, type WriteStrategy } from "./cache-model";

const STRATEGIES: { value: WriteStrategy; label: string }[] = [
  { value: "db-only", label: "DB only" },
  { value: "invalidate", label: "DB + delete key" },
  { value: "write-through", label: "Write-through" },
];

const STRATEGY_TEXT: Record<WriteStrategy, string> = {
  "db-only": "Writes update the database only. The cache is never told, so a cached copy can be stale until its TTL expires.",
  invalidate: "Writes update the database, then delete the cache key. The next read misses and reloads the fresh value (classic cache-aside).",
  "write-through": "Writes update the database and set the new value in the cache in the same operation.",
};

const TONE: Partial<Record<CacheEvent["kind"], "ok" | "warn" | "danger" | "info" | "neutral">> = {
  hit: "ok",
  "stale-hit": "danger",
  miss: "warn",
  "expired-miss": "warn",
  evict: "info",
  expire: "info",
};

export default function CacheViz() {
  const [s, setS] = useState(() => initCache());
  const ratio = hitRatio(s);
  const reset = () => setS(initCache({ ttl: s.ttl, strategy: s.strategy }));

  return (
    <VizFrame
      title="Cache-aside, TTLs and stale reads"
      kind="model"
      description={<>The app reads from the cache first and falls back to the database on a miss. Cache: capacity {s.capacity}, LRU eviction, TTL {s.ttl} ticks. Versions (v1, v2…) stand in for values so you can see when the cache disagrees with the database.</>}
      footer={
        <>
          <strong className="text-fg">What to notice.</strong> With <em>DB only</em>, read a key, write it, and read it again: you get a stale hit until the TTL expires. A TTL bounds how long data can be wrong; it does not prevent it. Deleting the key after the write fixes the simple case (though in real systems a concurrent reader can still re-cache an old value between the DB write and the delete, which is why some systems delete twice or use versioned keys). Write-through keeps the cache fresh but fills it with values that may never be read. A real cache like Redis evicts by an approximated LRU or LFU policy configured with <code className="font-mono">maxmemory-policy</code>.
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Segmented label="Write strategy" value={s.strategy} options={STRATEGIES} onChange={(v) => setS((x) => setStrategy(x, v))} />
          <Segmented label="TTL" value={s.ttl} options={[3, 5, 10].map((v) => ({ value: v, label: `${v} ticks` }))} onChange={(v) => setS((x) => setTtl(x, v))} />
        </div>
        <p className="text-xs text-muted">{STRATEGY_TEXT[s.strategy]} New TTLs apply to entries cached from now on.</p>

        <div className="flex flex-col gap-2" role="group" aria-label="Cache actions">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-12 text-xs text-muted">Read</span>
            {KEYS.map((k) => (
              <CtlButton key={k} label={`Read ${k}`} onClick={() => setS((x) => read(x, k))}>
                <span className="font-mono text-xs">{k}</span>
              </CtlButton>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-12 text-xs text-muted">Write</span>
            {KEYS.map((k) => (
              <CtlButton key={k} label={`Write ${k} (update DB)`} onClick={() => setS((x) => write(x, k))}>
                <span className="font-mono text-xs">{k}</span>
              </CtlButton>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <CtlButton label="Tick (advance the clock)" onClick={() => setS(tick)} primary>
              <Clock className="h-4 w-4" /> <span className="text-xs">Tick</span>
            </CtlButton>
            <CtlButton label="Reset" onClick={reset}>
              <RotateCcw className="h-4 w-4" /> <span className="text-xs">Reset</span>
            </CtlButton>
            <span className="ml-auto font-mono text-xs text-muted">tick {s.tick}</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Panel title="Cache" hint={`${s.cache.length}/${s.capacity} entries`}>
            {s.cache.length === 0 ? (
              <Empty>no entries</Empty>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {[...s.cache].sort((a, b) => a.key.localeCompare(b.key)).map((e) => {
                  const stale = e.version !== s.db[e.key];
                  const lru = s.cache.length >= s.capacity && e === s.cache.reduce((a, b) => (b.lastUsed < a.lastUsed ? b : a));
                  return (
                    <li key={e.key} className="flex flex-wrap items-center gap-1.5 text-xs">
                      <Chip tone={stale ? "danger" : "ok"}>
                        {e.key} = v{e.version}
                      </Chip>
                      <span className={stale ? "font-medium text-danger" : "text-ok"}>{stale ? `stale (DB has v${s.db[e.key]})` : "fresh"}</span>
                      <span className="text-muted">· expires in {Math.max(0, e.expiresAt - s.tick)}</span>
                      <span className="text-subtle">· used t{e.lastUsed}</span>
                      {lru && <span className="text-info">· next to evict</span>}
                      {isExpired(e, s.tick) && <span className="text-warn">expired</span>}
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
          <Panel title="Database" hint="source of truth">
            <ul className="flex flex-wrap gap-1.5">
              {KEYS.map((k) => (
                <li key={k}>
                  <Chip>
                    {k} = v{s.db[k]}
                  </Chip>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <dl className="grid grid-cols-3 gap-2 text-center sm:grid-cols-6">
          {[
            ["Hits", s.stats.hits],
            ["Misses", s.stats.misses],
            ["Hit ratio", ratio === null ? "—" : `${Math.round(ratio * 100)}%`],
            ["Stale reads", s.stats.staleReads],
            ["Evictions", s.stats.evictions],
            ["Expired", s.stats.expirations],
          ].map(([k, v]) => (
            <div key={k} className="rounded-md border border-border bg-bg px-2 py-1.5">
              <dt className="text-[11px] uppercase tracking-wider text-muted">{k}</dt>
              <dd className={`font-mono text-sm ${k === "Stale reads" && Number(v) > 0 ? "text-danger" : "text-fg"}`}>{v}</dd>
            </div>
          ))}
        </dl>

        <Narration>
          {s.last.length === 0 ? (
            <>Start by reading <span className="font-mono">user:1</span>: the cache is empty, so the first read is a miss.</>
          ) : (
            s.last.map((e, i) => (
              <p key={i} className={i > 0 ? "mt-1" : ""}>
                {e.text}
              </p>
            ))
          )}
        </Narration>

        <Panel title="Event log" hint="newest first">
          {s.log.length === 0 ? (
            <Empty>no events yet</Empty>
          ) : (
            <ol className="max-h-44 overflow-y-auto text-xs">
              {s.log.map((e, i) => (
                <li key={s.log.length - i} className="flex gap-2 border-b border-border py-1 last:border-0">
                  <span className="shrink-0 font-mono text-subtle">t{e.tick}</span>
                  <span className="shrink-0">
                    <Chip tone={TONE[e.kind] ?? "neutral"}>{e.kind}</Chip>
                  </span>
                  <span className="text-muted">{e.text}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>
    </VizFrame>
  );
}
