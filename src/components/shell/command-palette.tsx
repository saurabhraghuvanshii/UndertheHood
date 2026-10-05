"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { search } from "@/lib/search";
import { useSearchDocs } from "@/lib/use-search";
import { KIND_LABEL } from "@/components/learn/search-results";
import { Kbd } from "@/components/ui";

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const { docs, loading, error } = useSearchDocs();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const hits = useMemo(() => search(docs, q, 12), [docs, q]);

  useEffect(() => input.current?.focus(), []);

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Search">
      <button className="absolute inset-0 bg-black/35" aria-label="Close search" onClick={onClose} />
      <div className="anim-in relative w-full max-w-xl overflow-hidden rounded-lg border border-border-strong bg-surface shadow-2xl">
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="h-4 w-4 text-subtle" aria-hidden />
          <input
            ref={input}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              else if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, hits.length - 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
              else if (e.key === "Enter") {
                if (hits[active]) go(hits[active].doc.href);
                else if (q.trim()) go(`/search?q=${encodeURIComponent(q)}`);
              }
            }}
            placeholder="Search lessons, questions, glossary, code, notes…"
            className="h-12 w-full bg-transparent text-base text-fg outline-none placeholder:text-subtle"
            role="combobox"
            aria-expanded={hits.length > 0}
            aria-controls="palette-results"
            aria-activedescendant={hits[active] ? `hit-${active}` : undefined}
          />
          <Kbd>Esc</Kbd>
        </div>
        <ul id="palette-results" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
          {loading && <li className="px-3 py-6 text-center text-sm text-muted">Loading index…</li>}
          {error && <li className="px-3 py-6 text-center text-sm text-danger">Couldn’t load the search index ({error}).</li>}
          {!loading && q && hits.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">No matches for “{q}”.</li>}
          {!q && !loading && <li className="px-3 py-6 text-center text-sm text-muted">Type to search {docs.length.toLocaleString()} items. Enter opens the full results page.</li>}
          {hits.map((h, i) => (
            <li key={h.doc.id} id={`hit-${i}`} role="option" aria-selected={i === active}>
              <button
                onMouseEnter={() => setActive(i)}
                onClick={() => go(h.doc.href)}
                className={`flex w-full items-baseline gap-3 rounded-md px-3 py-2 text-left ${i === active ? "bg-surface-3" : ""}`}
              >
                <span className="w-20 shrink-0 text-xs uppercase tracking-wide text-subtle">{KIND_LABEL[h.doc.kind]}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-fg">{h.doc.title}</span>
                  {h.doc.subtitle && <span className="block truncate text-xs text-muted">{h.doc.subtitle}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
