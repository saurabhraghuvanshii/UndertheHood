#!/usr/bin/env node
/**
 * Converts content-sources/Js-questions-lydiahallie.md (a copy of
 * https://github.com/lydiahallie/javascript-questions, MIT licensed, as kept in the
 * learner's language-learning repo) into src/content/imported/lydia-questions.json.
 *
 *   node scripts/import-lydia.mjs
 *
 * Original numbering, code, options and explanations are preserved. HTML is reduced
 * to the inline markdown subset the app renders; images are replaced with links.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const md = readFileSync(join(root, "content-sources/Js-questions-lydiahallie.md"), "utf8");

const SOURCE = {
  label: "lydiahallie/javascript-questions (MIT)",
  url: "https://github.com/lydiahallie/javascript-questions",
  kind: "external",
  note: "Imported from © Lydia Hallie, MIT License",
};

function htmlToInline(s) {
  return s
    .replace(/<img[^>]*src="([^"]+)"[^>]*>/g, "[diagram]($1)")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<\/?(b|strong)>/g, "**")
    .replace(/<\/?(i|em)>/g, "*")
    .replace(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g, "[$2]($1)")
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const chunks = md.split(/^###### /m).slice(1);
const out = [];
for (const chunk of chunks) {
  const head = chunk.match(/^(\d+)\.\s*(.+)$/m);
  if (!head) continue;
  const number = Number(head[1]);
  const codeMatch = chunk.match(/```(\w*)\n([\s\S]*?)```/);
  const options = [...chunk.matchAll(/^- ([A-F]): (.+)$/gm)].map((m) => m[2].trim());
  const answerMatch = chunk.match(/#### Answer: ([A-F])/);
  const explanation = chunk.split(/#### Answer: [A-F]/)[1]?.split("</details>")[0] ?? "";
  if (!answerMatch || options.length === 0) {
    console.warn(`skipping #${number}: could not parse`);
    continue;
  }
  const lang = codeMatch?.[1] === "html" ? "html" : "js";
  out.push({
    id: `lydia-${String(number).padStart(3, "0")}`,
    number,
    title: head[2].trim(),
    code: codeMatch ? codeMatch[2].replace(/\s+$/, "") : "",
    lang,
    options,
    answer: answerMatch[1].charCodeAt(0) - 65,
    explanation: htmlToInline(explanation),
    source: SOURCE,
  });
}

writeFileSync(join(root, "src/content/imported/lydia-questions.json"), JSON.stringify(out, null, 1) + "\n");
console.log(`imported ${out.length} questions`);
