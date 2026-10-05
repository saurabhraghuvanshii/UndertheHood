import "server-only";
import { createHighlighter, type Highlighter } from "shiki";
import type { CodeLang } from "@/content/types";

const LANG: Record<CodeLang, string> = {
  js: "javascript", ts: "typescript", tsx: "tsx", go: "go", bash: "bash", sql: "sql", json: "json",
  yaml: "yaml", http: "http", text: "text", python: "python", html: "html", css: "css",
};

let hl: Promise<Highlighter> | null = null;
function highlighter() {
  hl ??= createHighlighter({
    themes: ["vitesse-light", "vitesse-dark"],
    langs: Object.values(LANG).filter((l) => l !== "text"),
  });
  return hl;
}

export async function highlight(code: string, lang: CodeLang): Promise<string> {
  const h = await highlighter();
  return h.codeToHtml(code, {
    lang: LANG[lang] ?? "text",
    themes: { light: "vitesse-light", dark: "vitesse-dark" },
    defaultColor: "light",
  });
}
