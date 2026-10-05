# Content authoring guide

All learning content lives in `src/content/` as typed TypeScript data. The schema is
`src/content/types.ts` — read it before writing anything. UI code never lives here.

## Files and exports

| File | Exports |
| --- | --- |
| `src/content/tracks/<track>.ts` | `export const track: Track` and `export const lessons: Lesson[]` |
| `src/content/interview/<name>.ts` | `export const questions: InterviewQuestion[]` |
| `src/content/design/exercises.ts` | `export const exercises: DesignExercise[]` |

Import types with `import type { ... } from "../types";`. No other imports, no React.

Every lesson listed in a module's `lessons` array must exist in that file's `lessons`
array and vice versa. Lesson refs elsewhere are `"track/slug"` (e.g. `"javascript/closures"`).

## Teaching rules (non-negotiable)

Each authored lesson teaches **What, Why, How (internals), Visualize, Interview**.

- Assume the reader may be a beginner: define a term before relying on it (and add it to `glossary`).
- Go from intuition → precise definition → internal mechanics → edge cases → trade-offs → interview.
- Accuracy beats simplicity. Where behaviour is an implementation detail (V8, Node/libuv, the Go
  runtime, a specific Postgres version), say so with a `callout` of tone `spec-vs-impl`.
  Name versions when behaviour is version-dependent (e.g. Go 1.22 loop-variable semantics,
  Go 1.14 async preemption, Go 1.18 append growth formula, Node 11 microtask ordering change).
- Conceptual diagrams must say they are conceptual.
- No walls of text: paragraphs ≤ ~4 sentences; prefer `steps`, `list`, `table`, `compare`, `code`.
- Code examples must be correct and actually produce the stated `output`. Use `runnable: true` only
  for JavaScript snippets that run in a plain Web Worker (no DOM, no `require`, no network) and print via `console.log`.
- Don't reproduce copyrighted text. Write original explanations; link to docs in `sources`.
- Never claim to have read a source you couldn't read, and don't link private sources (Notion pages,
  ChatGPT conversations) on the site.
- **Source policy:** JavaScript and Go lessons/questions list no references except the
  lydiahallie/javascript-questions repo (where relevant). Other tracks may cite documentation.
- Keep sections proportional: a trivial topic may only need objectives, intuition, definition,
  examples, mistakes, interview-short and summary.

## Status

- `status: "authored"` — full lesson. Should normally include: objectives, intuition, definition, why,
  internals, walkthrough, examples, edge-cases or mistakes, tradeoffs, interview-short, interview-deep,
  follow-ups (as `followUps`), glossary, summary, and a `quiz` of 2–4 questions where meaningful.
- `status: "outline"` — must still have a real `summary`, `objectives` section, `prerequisites`,
  `sources`, and a `summary` section listing what will be covered. Never fake depth.

## String hygiene

- Use template literals for multi-line code. **Escape backticks (\`) and `${` (as `\${`) inside them.**
  Go raw strings and JS template literals in examples are the usual trap.
- Inline markdown supported in text: `code`, **bold**, *italic*, [label](url). Nothing else
  (no headings, no nested lists, no HTML).
- `shortAnswer` may contain blank-line-separated paragraphs.

## Validate

Run `pnpm exec tsc --noEmit` from the repo root and fix every error in your files.
Run `pnpm test` when the content integrity tests exist (`src/content/__tests__`).
