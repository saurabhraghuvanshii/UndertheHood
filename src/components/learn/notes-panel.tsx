"use client";
import { useState } from "react";
import { Flag, Pencil, Trash2 } from "lucide-react";
import { actions, useHydrated, useLearner, type Note } from "@/lib/store";
import type { ItemKey } from "@/lib/progress";
import { Button } from "@/components/ui";
import { cn } from "@/components/ui/cn";

const KIND_LABEL: Record<Note["kind"], string> = { note: "Note", answer: "My interview answer", snippet: "Code snippet" };

export function NoteEditor({ initial, itemKey, onDone, defaultKind = "note" }: { initial?: Note; itemKey?: ItemKey; onDone: () => void; defaultKind?: Note["kind"] }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [kind, setKind] = useState<Note["kind"]>(initial?.kind ?? defaultKind);
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [flagged, setFlagged] = useState(initial?.flagged ?? false);
  return (
    <form
      className="anim-in space-y-2 rounded-lg border border-border-strong bg-surface p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!body.trim() && !title.trim()) return;
        actions.saveNote({ id: initial?.id, itemKey: initial?.itemKey ?? itemKey, title: title.trim(), body, kind, tags: tags.split(",").map((t) => t.trim()).filter(Boolean), flagged });
        onDone();
      }}
    >
      <div className="flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="note-kind">Type</label>
        <select id="note-kind" value={kind} onChange={(e) => setKind(e.target.value as Note["kind"])} className="rounded-md border border-border-strong bg-surface px-2 py-1.5 text-sm">
          {Object.entries(KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" aria-label="Title" className="min-w-0 flex-1 rounded-md border border-border-strong bg-surface px-2 py-1.5 text-sm" />
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={kind === "answer" ? "Write your answer the way you'd say it in an interview…" : kind === "snippet" ? "Paste code…" : "What clicked? What's still fuzzy?"}
        aria-label="Note body"
        rows={kind === "snippet" ? 8 : 5}
        className={cn("w-full rounded-md border border-border-strong bg-surface px-2 py-1.5 text-sm leading-relaxed", kind === "snippet" && "font-mono text-[13px]")}
      />
      <div className="flex flex-wrap items-center gap-2">
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tags, comma separated" aria-label="Tags" className="min-w-0 flex-1 rounded-md border border-border-strong bg-surface px-2 py-1.5 text-sm" />
        <label className="inline-flex items-center gap-1.5 text-sm text-muted">
          <input type="checkbox" checked={flagged} onChange={(e) => setFlagged(e.target.checked)} className="accent-[var(--accent)]" /> Flag for revision
        </label>
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="sm">Save</Button>
        <Button size="sm" variant="ghost" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  );
}

export function NoteCard({ note, showLink }: { note: Note; showLink?: React.ReactNode }) {
  const [editing, setEditing] = useState(false);
  if (editing) return <NoteEditor initial={note} onDone={() => setEditing(false)} />;
  return (
    <article className="rounded-lg border border-border bg-surface p-3" id={`note-${note.id}`}>
      <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="font-medium uppercase tracking-wide">{KIND_LABEL[note.kind]}</span>
        {note.flagged && <span className="inline-flex items-center gap-1 text-warn"><Flag className="h-3 w-3" aria-hidden />revision</span>}
        <span>· {new Date(note.updatedAt).toLocaleDateString()}</span>
        <span className="ml-auto flex gap-1">
          <button onClick={() => setEditing(true)} className="rounded p-1 hover:bg-surface-2" aria-label="Edit note"><Pencil className="h-3.5 w-3.5" /></button>
          <button onClick={() => { if (confirm("Delete this note?")) actions.deleteNote(note.id); }} className="rounded p-1 hover:bg-surface-2" aria-label="Delete note"><Trash2 className="h-3.5 w-3.5" /></button>
        </span>
      </div>
      {note.title && <h3 className="font-medium text-fg">{note.title}</h3>}
      {note.kind === "snippet" ? (
        <pre className="mt-1 overflow-x-auto rounded bg-code p-2 font-mono text-[12.5px]">{note.body}</pre>
      ) : (
        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-fg/90">{note.body}</p>
      )}
      {(note.tags.length > 0 || showLink) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          {note.tags.map((t) => <span key={t} className="rounded bg-surface-2 px-1.5 py-0.5 text-muted">#{t}</span>)}
          {showLink}
        </div>
      )}
    </article>
  );
}

export function NotesPanel({ itemKey, title = "Your notes", defaultKind }: { itemKey: ItemKey; title?: string; defaultKind?: Note["kind"] }) {
  const hydrated = useHydrated();
  const all = useLearner((s) => s.notes);
  const notes = all.filter((n) => n.itemKey === itemKey);
  const [adding, setAdding] = useState(false);
  return (
    <section aria-labelledby={`notes-${itemKey}`} className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 id={`notes-${itemKey}`} className="text-sm font-semibold uppercase tracking-wider text-muted">{title}</h2>
        {!adding && <Button size="sm" onClick={() => setAdding(true)} disabled={!hydrated}>Add note</Button>}
      </div>
      {adding && <NoteEditor itemKey={itemKey} onDone={() => setAdding(false)} defaultKind={defaultKind} />}
      {hydrated && notes.length === 0 && !adding && <p className="text-sm text-muted">No notes yet. Writing your own explanation is the fastest way to find gaps.</p>}
      {notes.map((n) => <NoteCard key={n.id} note={n} />)}
    </section>
  );
}
