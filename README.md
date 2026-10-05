# Under the Hood

An interactive engineering textbook, runtime lab, interview-prep platform and study planner —
built to take a learner from "it works" to "I can explain *why* it works" in an interview.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Shiki · lucide-react ·
Vitest + Testing Library · Playwright. Fonts: Libre Franklin (UI) and JetBrains Mono (code, ligatures off).

## Quick start

```bash
pnpm install
pnpm dev                 # http://localhost:3000
pnpm build && pnpm start # production build (fully prerendered content)
```

Node 20.9+ is required (developed on Node 24, pnpm 10).

| Command | What it does |
| --- | --- |
| `pnpm test` | Unit + content-integrity tests (Vitest) |
| `pnpm exec playwright test workflows` | End-to-end workflows on desktop and mobile viewports (needs `pnpm build` first; uses installed Google Chrome — see `playwright.config.ts`) |
| `SHOTS=1 pnpm exec playwright test shoot` | Screenshot tour in light/dark, desktop/mobile → `test-results/shots` |
| `pnpm lint` / `pnpm typecheck` | ESLint / `tsc --noEmit` |
| `pnpm import:lydia` | Re-import the 155 output-prediction questions from `content-sources/` |

## What's inside

| | |
| --- | --- |
| Learning paths | 15 paths · 275 lessons (179 fully written, 96 outlines clearly labelled "Outline") · 48 project milestones |
| Interview banks | 123 questions: all 52 JavaScript questions in the original frequency order, plus Go, Node.js, React, TypeScript, networks, databases, backend, cloud and AI |
| Output prediction | 155 "what's the output?" drills imported from lydiahallie/javascript-questions (MIT) |
| System design | the 40-topic checklist + a 12-step interview method + 12 worked designs with diagrams |
| Runtime lab | 18 visualizations + a real JavaScript playground |

Routes: `/` dashboard · `/explore` · `/paths/[track]` · `/paths/[track]/[lesson]` · `/interview` ·
`/interview/[track]/[id]` · `/interview/output/[id]` · `/interview/mock` · `/lab` · `/lab/[viz]` · `/lab/playground` ·
`/design` · `/design/[slug]` · `/projects` · `/planner` · `/planner/new` · `/calendar` · `/revision` · `/notes` ·
`/search` · `/settings`. Every lesson, question and exercise is a static, deep-linkable page.

## Architecture

```
src/
  content/            typed learning content — no React (see docs/CONTENT_GUIDE.md)
    types.ts          the schema: Track → Module → Lesson (20-part template), InterviewQuestion, DesignExercise…
    tracks/*.ts       one file per path (Go and system design are split across files)
    interview/*.ts    question banks
    design/           system design exercises
    imported/         generated JSON (Lydia Hallie questions)
    index.ts          registry + lookups (the only module that knows which files exist)
    __tests__/        content integrity: refs resolve, no prerequisite cycles, 52 JS questions in order, diagrams valid…
  lib/                pure logic, unit-tested
    planner.ts        study-plan generation + rescheduling
    srs.ts            spaced repetition (SM-2 variant, adjustable)
    progress.ts       7 progress states + the transparent mastery rules
    store.ts          local-first learner store (localStorage, versioned, migrations)
    search.ts         dependency-free prefix search; index served from /search-index.json
    js-runner.ts      real JS execution in a throwaway Web Worker
  components/
    content/          block renderer, Shiki code blocks, architecture diagrams
    learn/            progress panel, quiz, notes, dashboard, explore, mock interview…
    planner/          plan builder, daily planner, calendar
    viz/              visualization kit + js/ (scripted traces), go/ and sys/ (interactive models with tested pure model files)
    shell/            app shell, theme, command palette (Ctrl/⌘ K or /)
  config/site.ts      product name, tagline and navigation — rebrand here
```

- Content pages are Server Components, prerendered at build time; code is highlighted by Shiki on the server.
- Interactive pieces are small Client Components; every visualization is code-split and loaded only where embedded.
- Light/dark themes are CSS tokens in `src/app/globals.css`; the theme is applied before first paint (no flash).
  Motion respects `prefers-reduced-motion` and can be overridden in Settings.

### Honest labelling

Each visualization says what it is: **Scripted trace** (hand-authored against the language spec, not an engine
recording), **Interactive model** (simplified simulation of the real rules — e.g. Go's actual `growslice` and size
classes, `runtime/chan.go` semantics) or **Real execution** (the JS playground and "Run" buttons, which execute in your
browser's own engine). Engine/version-specific claims are marked "Spec vs implementation".

### Progress and mastery

Opening a page never counts as learning. Status advances only from actions:
*Learned once* → understood · *Practised* → + quiz ≥ 70% (if any) + practice · *Interview-ready* → + confidence ≥ 4 and one
good spaced review · *Mastered* → three good reviews with an interval ≥ 21 days · an overdue review shows *Needs
revision*. Learners can override any status; the panel shows the checklist behind each suggestion.

### Planner

`generatePlan` expands missing prerequisites, orders topics so prerequisites come first, scales lesson time by
difficulty vs the learner's level, packs days up to the daily budget (splitting long lessons), adds practice, interview
questions, revisions (+1/+3/+7 days) and weekly reviews, skips days off, and reports when the plan won't fit the
target date instead of silently cramming. Missed tasks can be rescheduled forward without overfilling days.

## Sources and attribution

- JavaScript and Go content cite only the
  [lydiahallie/javascript-questions](https://github.com/lydiahallie/javascript-questions) repository; other tracks
  list their documentation sources per lesson.
- The supplied Notion pages are private and the ChatGPT conversation link requires login, so **nothing was imported
  or paraphrased from them** and they are not linked on the site.
- `content-sources/Js-questions-lydiahallie.md` comes from the learner's
  [language-learning](https://github.com/saurabhraghuvanshii/language-learning) repo; original work © Lydia Hallie,
  MIT License (`content-sources/LICENSE-lydiahallie-javascript-questions`).

## Known limitations

- **No accounts or sync.** All learner data lives in one browser's localStorage. It survives refreshes but not clearing
  site data or switching device/browser. Settings → Export/Import moves it manually. Adding auth + a database would
  mean persisting `LearnerState` (see `lib/store.ts`) per user — the shape is already versioned.
- **Code execution is JavaScript only**, in a Web Worker (no DOM, no network, 1–5 s limit). Go code is not executed;
  Go outputs in lessons were produced by the authors on Go 1.26 and are labelled where nondeterministic.
- **96 lessons are outlines** (objectives, prerequisites and sources only). They're labelled everywhere and can be
  filtered out in Explore and the planner.
- Content was written with AI assistance and checked by running examples, but some version-specific claims
  (e.g. recent Go/Node/React release details) should be spot-checked against the linked docs.
- The search index (~1.7 MB uncompressed) is fetched on first search.

## Adding content

Read `docs/CONTENT_GUIDE.md` (rules and schema) and `docs/CANONICAL_SLUGS.md` (cross-link refs), add the lesson to a
track file and its module, then run `pnpm test` — the integrity tests catch broken refs, missing module entries,
prerequisite cycles and invalid quiz answers.
