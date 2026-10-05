import "server-only";
import type { Block } from "@/content/types";
import { designExercises, lessonRef, lessons, outputQuestions, questions, tracks, getTrack } from "@/content";
import { designHref, lessonHref, outputHref, questionHref } from "./routes";
import type { SearchDoc } from "./search";

const strip = (s: string) => s.replace(/[`*]/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

function blockText(b: Block): string {
  switch (b.type) {
    case "p": return b.text;
    case "list": return b.items.join(" ");
    case "callout": return `${b.title ?? ""} ${b.text}`;
    case "steps": return b.steps.map((s) => `${s.title} ${s.detail}`).join(" ");
    case "table": return [...b.head, ...b.rows.flat()].join(" ");
    case "compare": return b.items.map((i) => `${i.title} ${i.points.join(" ")}`).join(" ");
    case "flow": return b.nodes.join(" ");
    case "code": return b.caption ?? "";
    default: return "";
  }
}
const textOf = (blocks: Block[], max = 4000) => strip(blocks.map(blockText).join(" ")).slice(0, max);

/** Everything searchable, built once at build time and served as /search-index.json. */
export function buildSearchIndex(): SearchDoc[] {
  const docs: SearchDoc[] = [];
  for (const t of tracks) docs.push({ id: `track:${t.slug}`, kind: "track", title: t.title, subtitle: t.tagline, href: `/paths/${t.slug}`, text: t.description });
  for (const l of lessons) {
    const href = lessonHref(l);
    const track = getTrack(l.track)?.title ?? l.track;
    docs.push({ id: `lesson:${lessonRef(l)}`, kind: "lesson", title: l.title, subtitle: `${track}${l.status === "outline" ? " · outline" : ""}`, href, text: `${strip(l.summary)} ${textOf(l.sections.flatMap((s) => s.blocks))}`, tags: [...l.tags, l.track] });
    for (const g of l.glossary ?? []) docs.push({ id: `gl:${lessonRef(l)}:${g.term}`, kind: "glossary", title: g.term, subtitle: `Glossary · ${l.title}`, href: `${href}#glossary`, text: strip(g.definition) });
    l.sections.forEach((s) => s.blocks.forEach((b, i) => {
      if (b.type === "code" && b.caption) docs.push({ id: `code:${lessonRef(l)}:${s.id}:${i}`, kind: "code", title: strip(b.caption), subtitle: `${b.lang} · ${l.title}`, href: `${href}#${s.id}`, text: b.code.slice(0, 600) });
    }));
  }
  for (const q of questions) {
    const href = questionHref(q);
    docs.push({ id: `q:${q.id}`, kind: "question", title: q.question, subtitle: `${getTrack(q.track)?.title ?? q.track} · Q${q.number}`, href, text: `${strip(q.shortAnswer)} ${textOf(q.deep, 2500)}`, tags: q.tags });
    for (const g of q.glossary) docs.push({ id: `gl:${q.id}:${g.term}`, kind: "glossary", title: g.term, subtitle: `Glossary · Q${q.number}`, href: `${href}#glossary`, text: strip(g.definition) });
    if (q.example?.caption) docs.push({ id: `code:${q.id}`, kind: "code", title: strip(q.example.caption), subtitle: `${q.example.lang} · Q${q.number}`, href: `${href}#example`, text: q.example.code.slice(0, 600) });
  }
  for (const e of designExercises) docs.push({ id: `design:${e.slug}`, kind: "design", title: `Design: ${e.title}`, subtitle: "System design exercise", href: designHref(e.slug), text: `${e.summary} ${e.functional.join(" ")} ${e.bottlenecks.join(" ")}` });
  for (const o of outputQuestions) docs.push({ id: `out:${o.id}`, kind: "output", title: `Output #${o.number}: ${o.code.split("\n").find((x) => x.trim())?.trim().slice(0, 60) ?? o.title}`, subtitle: "JavaScript output prediction", href: outputHref(o.id), text: `${o.code} ${strip(o.explanation).slice(0, 800)}` });
  return docs;
}
