"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ItemMeta } from "@/content/item-index";
import { actions, useHydrated, useLearner, type Note } from "@/lib/store";
import { Badge, Button, EmptyState, SectionTitle } from "@/components/ui";
import { NoteCard, NoteEditor } from "./notes-panel";
import { cn } from "@/components/ui/cn";

export function NotesPage({ meta, focus }: { meta: Record<string, ItemMeta>; focus?: string }) {
  const hydrated = useHydrated();
  const notes = useLearner((s) => s.notes);
  const bookmarks = useLearner((s) => s.bookmarks);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<Note["kind"] | "">("");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState<"notes" | "bookmarks">("notes");

  useEffect(() => {
    if (focus && hydrated) document.getElementById(`note-${focus}`)?.scrollIntoView({ block: "center" });
  }, [focus, hydrated]);

  if (!hydrated) return <div className="h-64 animate-pulse rounded-lg bg-surface-2" />;
  const ql = q.toLowerCase();
  const shown = notes.filter((n) => (!kind || n.kind === kind) && (!flaggedOnly || n.flagged) && (!ql || `${n.title} ${n.body} ${n.tags.join(" ")} ${n.itemKey ? meta[n.itemKey]?.title ?? "" : ""}`.toLowerCase().includes(ql)));
  const bms = Object.entries(bookmarks).filter(([k]) => meta[k]).sort((a, b) => b[1].createdAt.localeCompare(a[1].createdAt));

  return (
    <div>
      <div className="mb-6 flex gap-1 border-b border-border" role="tablist">
        {(["notes", "bookmarks"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn("-mb-px border-b-2 px-3 py-2 text-sm font-medium capitalize", tab === t ? "border-fg text-fg" : "border-transparent text-muted hover:text-fg")}>
            {t} <span className="text-subtle">({t === "notes" ? notes.length : bms.length})</span>
          </button>
        ))}
      </div>
      {tab === "notes" ? (
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your notes…" aria-label="Search notes" className="min-w-0 flex-1 rounded-md border border-border-strong bg-surface px-2.5 py-1.5 text-sm sm:max-w-xs" />
            <select value={kind} onChange={(e) => setKind(e.target.value as Note["kind"] | "")} aria-label="Kind" className="rounded-md border border-border-strong bg-surface px-2 py-1.5 text-sm">
              <option value="">All kinds</option><option value="note">Notes</option><option value="answer">Interview answers</option><option value="snippet">Snippets</option>
            </select>
            <label className="inline-flex items-center gap-1.5 text-sm text-muted"><input type="checkbox" checked={flaggedOnly} onChange={(e) => setFlaggedOnly(e.target.checked)} className="accent-[var(--accent)]" />Flagged</label>
            <Button size="sm" variant="primary" className="ml-auto" onClick={() => setAdding(true)}>New note</Button>
          </div>
          {adding && <div className="mb-4"><NoteEditor onDone={() => setAdding(false)} /></div>}
          {shown.length === 0 ? (
            <EmptyState title={notes.length ? "No notes match." : "No notes yet."}>Add notes from any lesson or question page — they’re linked back automatically — or write a free-standing note here.</EmptyState>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {shown.map((n) => (
                <div key={n.id} className={cn(focus === n.id && "rounded-lg ring-2 ring-accent")}>
                  <NoteCard note={n} showLink={n.itemKey && meta[n.itemKey] ? <Link href={meta[n.itemKey].href} className="ml-auto text-accent hover:underline">↳ {meta[n.itemKey].title}</Link> : undefined} />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <SectionTitle>Bookmarks</SectionTitle>
          {bms.length === 0 ? <EmptyState title="No bookmarks yet.">Use the Bookmark button on lessons, questions and design exercises.</EmptyState> : (
            <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
              {bms.map(([k]) => (
                <li key={k} className="flex items-center gap-3 px-4 py-2.5">
                  <Badge>{meta[k].kind}</Badge>
                  <Link href={meta[k].href} className="min-w-0 flex-1 truncate text-sm hover:underline">{meta[k].title}</Link>
                  <button onClick={() => actions.toggleBookmark(k)} className="text-xs text-muted underline">remove</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
