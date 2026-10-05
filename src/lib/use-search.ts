"use client";
import { useEffect, useMemo, useState } from "react";
import type { SearchDoc } from "./search";
import { useLearner } from "./store";

let cache: Promise<SearchDoc[]> | null = null;
/** Fetch (once) the content index. Also called when the browser is idle so search opens instantly. */
export function loadIndex() {
  cache ??= fetch("/search-index.json").then((r) => {
    if (!r.ok) throw new Error(`search index: ${r.status}`);
    return r.json() as Promise<SearchDoc[]>;
  });
  cache.catch(() => (cache = null));
  return cache;
}

/** Content index (lazy, fetched once) + the learner's notes from local storage. */
export function useSearchDocs() {
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const notes = useLearner((s) => s.notes);
  useEffect(() => {
    loadIndex().then(setDocs, (e: Error) => setError(e.message));
  }, []);
  const all = useMemo(() => {
    const noteDocs: SearchDoc[] = notes.map((n) => ({
      id: `note:${n.id}`,
      kind: "note",
      title: n.title || "Untitled note",
      subtitle: n.kind === "answer" ? "Your interview answer" : n.kind === "snippet" ? "Your code snippet" : "Your note",
      href: `/notes?note=${n.id}`,
      text: n.body,
      tags: n.tags,
    }));
    return [...noteDocs, ...(docs ?? [])];
  }, [docs, notes]);
  return { docs: all, loading: !docs && !error, error };
}
