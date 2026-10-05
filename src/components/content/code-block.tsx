import { highlight } from "@/lib/highlight";
import type { CodeLang } from "@/content/types";
import { CodeFrame } from "./code-frame";

const LABEL: Partial<Record<CodeLang, string>> = { js: "JavaScript", ts: "TypeScript", tsx: "TSX", go: "Go", bash: "Shell", sql: "SQL", json: "JSON", yaml: "YAML", http: "HTTP", python: "Python", html: "HTML", css: "CSS", text: "Text" };

/** Server component: highlights with Shiki at render time, hands HTML to the client frame. */
export async function CodeBlock({ code, lang, caption, output, runnable }: { code: string; lang: CodeLang; caption?: string; output?: string; runnable?: boolean }) {
  const html = await highlight(code, lang);
  return <CodeFrame html={html} code={code} label={LABEL[lang] ?? lang} caption={caption} expected={output} runnable={!!runnable && lang === "js"} />;
}
