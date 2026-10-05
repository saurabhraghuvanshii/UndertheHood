"use client";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { excerpt, search, type SearchKind } from "@/lib/search";
import { useSearchDocs } from "@/lib/use-search";
import { KIND_LABEL } from "./search-results";
import { EmptyState } from "@/components/ui";
import { cn } from "@/components/ui/cn";

const KINDS: SearchKind[] = ["lesson", "question", "design", "glossary", "code", "output", "note", "track"];

export function SearchPage({ initial }: { initial: string }) {
  const [q, setQ] = useState(initial);
  const [kinds, setKinds] = useState<SearchKind[]>([]);
  const { docs, loading, error } = useSearchDocs();
  const deferredQ = useDeferredValue(q);
  // one search over everything; kind filters and counts are derived from it
  const all = useMemo(() => search(docs, deferredQ, 100000), [docs, deferredQ]);
  const counts = useMemo(() => Object.fromEntries(KINDS.map((k) => [k, all.filter((h) => h.doc.kind === k).length])), [all]);
  const hits = useMemo(() => (kinds.length ? all.filter((h) => kinds.includes(h.doc.kind)) : all).slice(0, 100), [all, kinds]);
  return (
    <div>
      <input
        value={q}
        autoFocus
        onChange={(e) => {
          setQ(e.target.value);
          // keep the URL shareable without triggering a server round-trip per keystroke
          window.history.replaceState(null, "", `/search?q=${encodeURIComponent(e.target.value)}`);
        }}
        placeholder="Search lessons, questions, glossary terms, code, design exercises and your notes"
        aria-label="Search"
        className="h-12 w-full rounded-lg border border-border-strong bg-surface px-4 text-base focus:border-accent focus:outline-none focus-visible:outline-none"
      />
      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Filter by type">
        {KINDS.map((k) => {
          const on = kinds.includes(k);
          return (
            <button key={k} aria-pressed={on} onClick={() => setKinds((x) => (on ? x.filter((y) => y !== k) : [...x, k]))} className={cn("rounded-full border px-2.5 py-0.5 text-xs", on ? "border-fg bg-fg text-bg" : "border-border-strong text-muted hover:text-fg")}>
              {KIND_LABEL[k]} {q && <span className="opacity-70">{counts[k] ?? 0}</span>}
            </button>
          );
        })}
      </div>
      <div className="mt-6" aria-live="polite">
        {loading && <p className="text-sm text-muted">Loading the index…</p>}
        {error && <p className="text-sm text-danger">Couldn’t load the search index: {error}</p>}
        {!loading && q && hits.length === 0 && <EmptyState title={`No results for “${q}”.`}>Try a shorter or different term — search matches word prefixes, so “clos” finds closures.</EmptyState>}
        {hits.length > 0 && (
          <ol className="space-y-3">
            {hits.map((h) => (
              <li key={h.doc.id}>
                <Link href={h.doc.href} className="block rounded-lg border border-border bg-surface p-3 hover:border-border-strong">
                  <span className="flex flex-wrap items-baseline gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-subtle">{KIND_LABEL[h.doc.kind]}</span>
                    <span className="font-medium text-fg">{h.doc.title}</span>
                    {h.doc.subtitle && <span className="text-xs text-muted">{h.doc.subtitle}</span>}
                  </span>
                  <span className={cn("mt-1 block text-sm text-muted", h.doc.kind === "code" && "font-mono text-xs")}>{excerpt(h.doc.text, q)}</span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
