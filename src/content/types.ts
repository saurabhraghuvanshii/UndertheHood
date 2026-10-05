/**
 * Content schema for "Under the Hood".
 *
 * Learning content is plain, typed data. UI components render it; nothing in
 * this folder imports React. Keep it that way so content stays portable
 * (it could later move to MDX, a CMS or a database without touching the UI).
 *
 * Inline text fields (paragraphs, list items, answers, cells) support a tiny
 * markdown subset rendered by `components/content/inline.tsx`:
 *   `code`, **bold**, *italic*, [label](https://url) and [label](/internal/route)
 */

export type Level = "beginner" | "intermediate" | "advanced" | "expert";

/** How often the topic shows up in interviews. */
export type Frequency = "very-high" | "high" | "medium" | "low";

export type ContentKind = "theory" | "visualization" | "coding" | "quiz" | "system-design";

/**
 * Authoring status of a piece of content — NOT the learner's progress.
 * - `authored`: a full lesson following the lesson template.
 * - `outline`:  structure, objectives and sources exist; deep content is still to be written.
 *               The UI labels these as "Outline" so nothing pretends to be complete.
 */
export type AuthoringStatus = "authored" | "outline";

export type CodeLang =
  | "js" | "ts" | "tsx" | "go" | "bash" | "sql" | "json" | "yaml" | "http" | "text" | "python" | "html" | "css";

/** Visualizations implemented in `components/viz`. Embed with `{ type: "viz", id }`. */
export type VizId =
  | "js-closure"        // closure counter: execution contexts, lexical env, retained bindings
  | "js-event-loop"     // sync code, microtasks vs tasks ordering
  | "js-hoisting"       // creation vs execution phase, TDZ
  | "js-this"           // this binding rules
  | "js-references"     // stack vs heap, aliasing, copying objects
  | "js-async-await"    // async function suspension and resumption
  | "go-slices"         // slice header, backing array, append growth, aliasing
  | "go-channels"       // buffered vs unbuffered channel, blocking senders/receivers
  | "go-scheduler"      // G/M/P model, run queues, work stealing, blocking syscalls
  | "go-mutex"          // race condition vs mutex-protected counter
  | "go-waitgroup"      // WaitGroup counter and Wait()
  | "go-worker-pool"    // jobs channel, N workers, results
  | "sys-request-flow"  // DNS -> TCP -> TLS -> LB -> app -> cache -> DB
  | "sys-cache"         // cache-aside hits/misses, TTL, invalidation
  | "sys-load-balancer" // round robin / least connections / hashing
  | "sys-rate-limiter"  // token bucket
  | "sys-circuit-breaker"
  | "mem-hierarchy";    // registers, caches, RAM, disk latency ladder (conceptual)

export interface SourceRef {
  label: string;
  url?: string;
  /**
   * - `original-note`: the learner's own notes/list (wording preserved where useful)
   * - `docs`: authoritative documentation / spec
   * - `external`: article, video, book, repository
   * - `inaccessible`: supplied by the learner but could not be read (private / login required).
   *    Never paraphrase content from these.
   */
  kind: "original-note" | "docs" | "external" | "inaccessible";
  note?: string;
}

export type Block =
  | { type: "p"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "code"; lang: CodeLang; code: string; caption?: string; output?: string; runnable?: boolean }
  | { type: "callout"; tone: "note" | "tip" | "warning" | "misconception" | "spec-vs-impl"; title?: string; text: string }
  | { type: "steps"; steps: { title: string; detail: string }[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "viz"; id: VizId; caption?: string }
  /** Simple left-to-right flow, e.g. ["Client", "DNS", "Load balancer", "App", "DB"] */
  | { type: "flow"; nodes: string[]; caption?: string }
  | { type: "compare"; items: { title: string; points: string[] }[] };

/**
 * The 20-part lesson template. Lessons include only the sections that make
 * sense for the topic (keep the structure proportional to complexity), in this order.
 */
export type SectionId =
  | "objectives" | "prerequisites" | "intuition" | "definition" | "why" | "internals"
  | "walkthrough" | "memory" | "visualization" | "examples" | "edge-cases" | "mistakes"
  | "tradeoffs" | "real-world" | "interview-short" | "interview-deep" | "follow-ups"
  | "practice" | "glossary" | "summary";

export interface Section {
  id: SectionId;
  /** Optional override; defaults to the template title for the id. */
  title?: string;
  blocks: Block[];
}

export interface GlossaryEntry { term: string; definition: string }
export interface FollowUp { q: string; a: string }

export interface QuizQuestion {
  id: string;
  prompt: string;
  code?: { lang: CodeLang; code: string };
  options: string[];
  /** index into options */
  answer: number;
  explanation: string;
}

export interface Lesson {
  /** unique within its track, kebab-case */
  slug: string;
  track: TrackSlug;
  title: string;
  /** one or two sentences shown in lists */
  summary: string;
  level: Level;
  frequency: Frequency;
  /** realistic minutes for a first careful pass */
  minutes: number;
  kinds: ContentKind[];
  status: AuthoringStatus;
  /** lesson refs "track/slug" */
  prerequisites: string[];
  related: string[];
  tags: string[];
  sources: SourceRef[];
  sections: Section[];
  glossary?: GlossaryEntry[];
  followUps?: FollowUp[];
  quiz?: QuizQuestion[];
  /** `trackSlug/q-id` references into interview banks */
  questions?: string[];
}

export interface Module {
  id: string;
  title: string;
  summary: string;
  /** lesson slugs in teaching order */
  lessons: string[];
}

export interface ProjectMilestone {
  id: string;
  title: string;
  summary: string;
  level: Level;
  /** what the learner must demonstrate */
  requirements: string[];
  /** stretch goals */
  stretch?: string[];
  /** lesson refs "track/slug" this milestone exercises */
  exercises: string[];
}

export type TrackSlug =
  | "javascript" | "nodejs" | "go" | "typescript" | "react" | "dsa" | "networks" | "os"
  | "databases" | "backend" | "distributed" | "system-design" | "cloud" | "production" | "ai";

export interface Track {
  slug: TrackSlug;
  title: string;
  /** short line for cards */
  tagline: string;
  description: string;
  modules: Module[];
  milestones: ProjectMilestone[];
  sources: SourceRef[];
}

export interface InterviewQuestion {
  /** e.g. "js-01" — stable, used in URLs and progress keys */
  id: string;
  track: TrackSlug;
  /** position in the original list (1-based) */
  number: number;
  question: string;
  level: Level;
  frequency: Frequency;
  tags: string[];
  /** 30–90 second spoken answer (inline markdown, may contain paragraphs separated by \n\n) */
  shortAnswer: string;
  /** deep explanation */
  deep: Block[];
  /** example + execution walkthrough */
  example?: Extract<Block, { type: "code" }>;
  walkthrough?: { title: string; detail: string }[];
  followUps: FollowUp[];
  pitfalls: string[];
  glossary: GlossaryEntry[];
  relatedLessons: string[];
  /** other question ids, e.g. overlaps ("js-02" <-> "js-26") */
  relatedQuestions: string[];
  sources?: SourceRef[];
}

/** Output-prediction questions (e.g. imported from lydiahallie/javascript-questions, MIT). */
export interface OutputQuestion {
  id: string;
  number: number;
  title: string;
  code: string;
  lang: CodeLang;
  options: string[];
  answer: number;
  explanation: string;
  source: SourceRef;
}

export interface DesignExercise {
  slug: string;
  title: string;
  level: Level;
  summary: string;
  minutes: number;
  status: AuthoringStatus;
  functional: string[];
  nonFunctional: string[];
  assumptions: string[];
  estimation: Block[];
  api: Block[];
  dataModel: Block[];
  /** high-level architecture: components and directed edges */
  architecture: {
    nodes: { id: string; label: string; kind: "client" | "edge" | "service" | "data" | "queue" | "cache" | "external" }[];
    edges: { from: string; to: string; label?: string }[];
    notes: Block[];
  };
  flows: { title: string; steps: string[] }[];
  bottlenecks: string[];
  failures: { scenario: string; mitigation: string }[];
  tradeoffs: { decision: string; options: string; choice: string }[];
  /** model interview walkthrough, in order */
  walkthrough: { title: string; detail: string }[];
  followUps: FollowUp[];
  /** lesson refs "system-design/slug" */
  related: string[];
}
