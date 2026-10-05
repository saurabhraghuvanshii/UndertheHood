/**
 * Small dependency-free full-text search. The index is built on the server from
 * content (see app/search-index.json/route.ts), fetched lazily by the client, and
 * merged with the learner's local notes at query time.
 */
export type SearchKind = "lesson" | "question" | "output" | "design" | "glossary" | "code" | "note" | "track";

export interface SearchDoc {
  id: string;
  kind: SearchKind;
  title: string;
  /** shown under the title */
  subtitle?: string;
  href: string;
  /** searchable body (already trimmed) */
  text: string;
  tags?: string[];
}

export function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}.#+]+/gu, " ")
    .split(" ")
    .map((t) => t.replace(/^\.+|\.+$/g, ""))
    .filter((t) => t.length > 0);
}

export interface SearchHit { doc: SearchDoc; score: number }

const KIND_BOOST: Partial<Record<SearchKind, number>> = { lesson: 1.3, track: 1.4, question: 1.2, design: 1.2, note: 1.1 };

/**
 * Every query token must match (as a prefix of a word) somewhere in the doc.
 * Title matches weigh most, then tags, then body; exact-phrase title matches get a bonus.
 */
export function search(docs: SearchDoc[], query: string, limit = 50, kinds?: SearchKind[]): SearchHit[] {
  const q = tokenize(query);
  if (!q.length) return [];
  const phrase = query.trim().toLowerCase();
  const hits: SearchHit[] = [];
  for (const doc of docs) {
    if (kinds && kinds.length && !kinds.includes(doc.kind)) continue;
    const title = tokenize(doc.title);
    const tags = (doc.tags ?? []).flatMap(tokenize);
    const body = tokenize(doc.text);
    let score = 0;
    let all = true;
    for (const t of q) {
      const inTitle = title.some((w) => w.startsWith(t)) ? (title.includes(t) ? 10 : 6) : 0;
      const inTags = tags.some((w) => w.startsWith(t)) ? 4 : 0;
      let inBody = 0;
      for (const w of body) if (w.startsWith(t)) inBody += w === t ? 1 : 0.5;
      const s = inTitle + inTags + Math.min(inBody, 6);
      if (s === 0) {
        all = false;
        break;
      }
      score += s;
    }
    if (!all) continue;
    if (doc.title.toLowerCase().includes(phrase)) score += 8;
    score *= KIND_BOOST[doc.kind] ?? 1;
    hits.push({ doc, score });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Short excerpt around the first matching token. */
export function excerpt(text: string, query: string, len = 160): string {
  const q = tokenize(query);
  const lower = text.toLowerCase();
  let at = -1;
  for (const t of q) {
    at = lower.indexOf(t);
    if (at >= 0) break;
  }
  if (at < 0) return text.slice(0, len) + (text.length > len ? "…" : "");
  const start = Math.max(0, at - 50);
  return (start > 0 ? "…" : "") + text.slice(start, start + len) + (start + len < text.length ? "…" : "");
}
