import type { Lesson, Level, Frequency, ContentKind, SourceRef, Track } from "../types";

/**
 * JavaScript track: language foundations → scope & functions → objects/OOP → async →
 * browser platform → advanced patterns. Lessons are grouped into per-module arrays
 * below and concatenated into `lessons` at the end of the file.
 */

// ---------------------------------------------------------------------------
// Source helpers
// ---------------------------------------------------------------------------

const LYDIA: SourceRef = {
  label: "lydiahallie/javascript-questions (MIT)",
  url: "https://github.com/lydiahallie/javascript-questions",
  kind: "external",
  note: "Output-prediction questions; licensed MIT.",
};

// ---------------------------------------------------------------------------
// Outline helper — for lessons whose deep content is not written yet.
// ---------------------------------------------------------------------------

interface OutlineSpec {
  slug: string;
  title: string;
  summary: string;
  level: Level;
  frequency: Frequency;
  minutes: number;
  kinds?: ContentKind[];
  prerequisites: string[];
  related?: string[];
  tags: string[];
  sources: SourceRef[];
  objectives: string[];
  covers: string[];
  questions?: string[];
}

function outline(o: OutlineSpec): Lesson {
  return {
    slug: o.slug,
    track: "javascript",
    title: o.title,
    summary: o.summary,
    level: o.level,
    frequency: o.frequency,
    minutes: o.minutes,
    kinds: o.kinds ?? ["theory"],
    status: "outline",
    prerequisites: o.prerequisites,
    related: o.related ?? [],
    tags: o.tags,
    sources: [],
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: o.objectives }] },
      {
        id: "summary",
        title: "What this lesson will cover",
        blocks: [
          { type: "list", items: o.covers },
          {
            type: "callout",
            tone: "note",
            title: "Outline",
            text: "This lesson is an outline: the structure, objectives and sources are in place, the full write-up is still to come. Use the sources above in the meantime.",
          },
        ],
      },
    ],
    ...(o.questions ? { questions: o.questions } : {}),
  };
}

// ---------------------------------------------------------------------------
// Track
// ---------------------------------------------------------------------------

export const track: Track = {
  slug: "javascript",
  title: "JavaScript",
  tagline: "From types and coercion to execution contexts, closures, the event loop and the garbage collector.",
  description:
    "A path through the language as the engine sees it: values and coercion, lexical environments and execution contexts, closures and `this`, prototypes, promises and the event loop, the browser platform, and the advanced patterns (debounce, memoization, deep copy, GC-aware code) that interviews love. Spec behaviour and engine (V8) implementation details are kept clearly apart.",
  modules: [
    {
      id: "js-foundations",
      title: "Foundations",
      summary: "Syntax and ASI, operators, primitives vs objects, coercion and equality, strings, numbers, arrays, objects and destructuring.",
      lessons: [
        "syntax-asi", "operators-control-flow", "data-types", "null-vs-undefined", "equality-coercion",
        "typeof-instanceof", "strings-numbers-unicode", "regex", "arrays-iteration", "objects-descriptors",
        "destructuring-spread",
      ],
    },
    {
      id: "js-scope-functions",
      title: "Scope and functions",
      summary: "var/let/const, scope, hoisting and the TDZ, execution contexts, the call stack, closures, higher-order functions and `this`.",
      lessons: [
        "var-let-const", "scope", "hoisting-tdz", "execution-context", "call-stack",
        "function-declarations-expressions", "closures", "recursion", "iife", "higher-order-functions",
        "map-filter-reduce", "currying", "this-binding", "call-apply-bind", "arrow-functions",
      ],
    },
    {
      id: "js-objects-oop",
      title: "Objects and OOP",
      summary: "Prototype chains, classes, accessors, private fields, mixins, symbols, proxies, immutability, copying and keyed collections.",
      lessons: [
        "prototypes", "classes-inheritance", "getters-setters-static", "private-fields", "mixins", "symbols",
        "proxy-reflect", "freeze-seal", "deep-copy", "map-set", "weakmap-weakset",
      ],
    },
    {
      id: "js-async",
      title: "Asynchronous JavaScript",
      summary: "Sync vs async, the event loop, callbacks, promises, async/await, combinators, timers, iterators, generators and cancellation.",
      lessons: [
        "sync-vs-async", "event-loop", "callbacks", "promises", "async-await", "promise-combinators", "timers",
        "generators-iterators", "async-iteration", "abortcontroller",
      ],
    },
    {
      id: "js-browser",
      title: "Browser and web platform",
      summary: "The DOM, events and delegation, fetch, JSON, URLs and forms, CORS, ES modules, script loading, storage, workers and rAF.",
      lessons: [
        "dom", "dom-manipulation", "dom-events-bubbling", "event-delegation", "fetch-http", "json-circular",
        "url-formdata", "cors-browser-security", "modules", "script-loading", "storage-workers-raf",
      ],
    },
    {
      id: "js-advanced",
      title: "Advanced JavaScript",
      summary: "Memoization, debounce/throttle, memory leaks and GC, performance, singletons, decorators, tail calls, errors, tooling and testing.",
      lessons: [
        "memoization", "debounce-throttle", "memory-leaks-gc", "performance", "error-handling", "singleton",
        "decorators", "tail-calls", "bundling-transpilation", "testing-linting",
      ],
    },
  ],
  milestones: [
    {
      id: "js-promise-utils",
      title: "Promise utility library",
      summary: "Re-implement the promise combinators and a `promisify` helper from scratch.",
      level: "intermediate",
      requirements: [
        "`promiseAll(iterable)`: resolves with results in input order, rejects on the first rejection, resolves `[]` for an empty iterable",
        "`promiseAllSettled(iterable)`: never rejects; returns `{ status, value | reason }` objects in input order",
        "`promiseAny(iterable)`: resolves with the first fulfilment, rejects with an `AggregateError` (errors in input order) if all reject",
        "Non-promise values in the input are treated as already-fulfilled (wrap with `Promise.resolve`)",
        "`promisify(fn)` converts an error-first callback API into a promise-returning function and preserves `this`",
        "Tests that compare your output against the built-ins, including ordering and empty-input cases",
      ],
      stretch: ["`promiseRace` and a `timeout(promise, ms)` helper", "`pLimit(n)` style concurrency limiter reusing your code"],
      exercises: ["javascript/promises", "javascript/promise-combinators", "javascript/callbacks", "javascript/event-loop"],
    },
    {
      id: "js-debounce-throttle",
      title: "Debounce and throttle",
      summary: "Production-grade `debounce` and `throttle` with leading/trailing options and cancellation.",
      level: "intermediate",
      requirements: [
        "`debounce(fn, wait, { leading, trailing })` with correct defaults (`trailing: true`)",
        "`throttle(fn, wait, { leading, trailing })` that invokes at most once per window",
        "Forward `this` and the latest arguments to `fn`",
        "`.cancel()` clears pending timers; `.flush()` invokes a pending trailing call immediately",
        "Deterministic tests using fake timers",
      ],
      stretch: ["`maxWait` option for debounce", "A `requestAnimationFrame`-based throttle for scroll handlers"],
      exercises: ["javascript/debounce-throttle", "javascript/closures", "javascript/timers", "javascript/this-binding"],
    },
    {
      id: "js-event-emitter",
      title: "EventEmitter",
      summary: "A Node-style event emitter with `on`, `once`, `off` and `emit`.",
      level: "intermediate",
      requirements: [
        "`on(event, listener)`, `off(event, listener)`, `once(event, listener)` and `emit(event, ...args)`",
        "Listeners run synchronously in registration order; `emit` returns whether any listener ran",
        "Removing a listener during `emit` does not skip or double-call other listeners (iterate a copy)",
        "`once` listeners can be removed with `off` using the original function",
        "Emitting `error` with no listener throws, like Node's EventEmitter",
      ],
      stretch: ["`maxListeners` warning to catch leaks", "An async `once(emitter, event)` returning a promise"],
      exercises: ["javascript/callbacks", "javascript/closures", "javascript/memory-leaks-gc", "javascript/event-delegation"],
    },
    {
      id: "js-deep-clone",
      title: "Deep clone",
      summary: "A `deepClone` that handles cycles, shared references and built-in types.",
      level: "advanced",
      requirements: [
        "Clones plain objects and arrays recursively; primitives are returned as-is",
        "Preserves cycles and shared references using a `WeakMap` of original → copy",
        "Handles `Date`, `RegExp`, `Map` and `Set` (cloning keys/values deeply)",
        "Preserves the prototype of class instances (document what you do with private state)",
        "Tests comparing against `structuredClone` and showing where the two differ (functions, prototypes)",
      ],
      stretch: ["Copy symbol-keyed and non-enumerable properties with their descriptors", "An iterative version that cannot overflow the stack"],
      exercises: ["javascript/deep-copy", "javascript/weakmap-weakset", "javascript/map-set", "javascript/recursion"],
    },
    {
      id: "js-lru-memoize",
      title: "LRU memoize",
      summary: "A memoizer with a bounded least-recently-used cache.",
      level: "advanced",
      requirements: [
        "`memoize(fn, { max, key })` caches results keyed by a resolver (default: first argument)",
        "Evicts the least-recently-used entry when `max` is exceeded, in O(1) (use `Map` insertion order)",
        "Memoizing an async function caches the promise and evicts it if it rejects",
        "Exposes `.cache.clear()` and hit/miss counters",
      ],
      stretch: ["TTL per entry", "A `WeakMap`-based variant for object arguments that does not leak"],
      exercises: ["javascript/memoization", "javascript/map-set", "javascript/closures", "javascript/promises"],
    },
    {
      id: "js-polling-client",
      title: "Polling client with backoff and cancellation",
      summary: "Evolve the `polling.js` practice file into a robust poller.",
      level: "advanced",
      requirements: [
        "Poll an endpoint with `fetch` until a condition is met or the caller aborts",
        "Exponential backoff with jitter on failures; reset the delay after a success",
        "Cancellation via `AbortController`: aborting stops the timer *and* aborts the in-flight request",
        "Never overlap requests (schedule the next poll after the previous one settles, not with `setInterval`)",
        "Rejects with the abort reason when cancelled; tests with fake timers and a mocked `fetch`",
      ],
      stretch: ["Per-request timeout via `AbortSignal.timeout` combined with `AbortSignal.any`", "Pause polling while the tab is hidden (`visibilitychange`)"],
      exercises: ["javascript/abortcontroller", "javascript/fetch-http", "javascript/timers", "javascript/async-await"],
    },
    {
      id: "js-task-queue",
      title: "Task queue with a concurrency limit",
      summary: "Run async tasks with at most N in flight, preserving result order.",
      level: "advanced",
      requirements: [
        "`runWithLimit(tasks, n)` where tasks are functions returning promises",
        "At most `n` tasks are running at any moment; a new one starts as soon as one settles",
        "Results are returned in input order; the first failure rejects (and optionally stops scheduling)",
        "A queue API (`add(task) → Promise`) with `onIdle()`",
      ],
      stretch: ["Priorities", "Pause/resume and per-task `AbortSignal`"],
      exercises: ["javascript/promises", "javascript/async-await", "javascript/event-loop", "javascript/promise-combinators"],
    },
  ],
  sources: [LYDIA],
};

// ===========================================================================
// Module 1 — Foundations
// ===========================================================================

const foundations: Lesson[] = [
  outline({
    slug: "syntax-asi",
    title: "Syntax, statements and automatic semicolon insertion",
    summary: "How JavaScript source is parsed into statements and expressions, and the exact rules by which the parser inserts semicolons for you.",
    level: "beginner",
    frequency: "medium",
    minutes: 20,
    prerequisites: [],
    related: ["javascript/operators-control-flow", "javascript/function-declarations-expressions"],
    tags: ["syntax", "asi", "statements", "expressions"],
    sources: [],
    objectives: [
      "Distinguish statements from expressions and explain where each is allowed",
      "State the three ASI rules and the 'restricted productions' (`return`, `throw`, `break`, `continue`, postfix `++`/`--`, arrow `=>`)",
      "Predict the classic ASI hazards: `return` followed by a newline, lines starting with `(`, `[` or a template literal",
      "Choose and enforce a semicolon style with a formatter instead of memorising edge cases",
    ],
    covers: [
      "Tokens, statements, expressions, expression statements and blocks",
      "ASI rule by rule, with the spec's restricted productions",
      "Why `return\\n{ ok: true }` returns `undefined`",
      "Leading `(`/`[` hazards in semicolon-less code and the defensive `;` prefix",
      "Strict mode (`'use strict'`) and what it changes at parse time",
      "Prettier/ESLint as the practical answer",
    ],
  }),
  outline({
    slug: "operators-control-flow",
    title: "Operators and control flow",
    summary: "Arithmetic, comparison, logical and nullish operators, short-circuiting, precedence, and the control-flow statements (if, switch, loops, labels).",
    level: "beginner",
    frequency: "medium",
    minutes: 25,
    prerequisites: ["javascript/syntax-asi"],
    related: ["javascript/equality-coercion", "javascript/arrays-iteration"],
    tags: ["operators", "short-circuit", "nullish", "switch", "loops"],
    sources: [],
    objectives: [
      "Use `&&`, `||` and `??` knowing they return one of their operands, not a boolean",
      "Explain short-circuit evaluation and the logical assignment operators (`||=`, `&&=`, `??=`)",
      "Read precedence and associativity (e.g. `**` is right-associative; `??` cannot mix with `||` without parentheses)",
      "Pick the right loop (`for`, `while`, `do…while`, `for…of`, `for…in`) and use labels with `break`/`continue`",
      "Know that `switch` compares with strict equality and falls through without `break`",
    ],
    covers: [
      "Arithmetic, unary `+`, increment/decrement prefix vs postfix",
      "Comparison operators and their coercion (deep dive in equality-coercion)",
      "Logical operators returning operands; `??` vs `||` for defaults",
      "Optional chaining `?.` as a short-circuiting operator",
      "Comma operator, `void`, `typeof`, `delete`, `in`",
      "Control flow: if/else, switch (strict comparison, fall-through), loops, labels",
    ],
  }),
  {
    slug: "data-types",
    track: "javascript",
    title: "Data types: primitives, objects and references",
    summary: "The eight types of the language, why primitives are immutable values while objects are shared through references, and what that means for assignment, function arguments and memory.",
    level: "beginner",
    frequency: "very-high",
    minutes: 35,
    kinds: ["theory", "visualization", "quiz"],
    status: "authored",
    prerequisites: [],
    related: ["javascript/equality-coercion", "javascript/null-vs-undefined", "javascript/typeof-instanceof", "javascript/deep-copy", "javascript/memory-leaks-gc"],
    tags: ["types", "primitives", "objects", "references", "typeof", "pass-by-sharing"],
    sources: [],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Name all eight language types and the result of `typeof` for each",
              "Explain the difference between a value and a reference, and why `const` does not make an object immutable",
              "Describe JavaScript's argument passing (\"call by sharing\") precisely",
              "Separate the spec's model from engine details such as V8's Smis and heap numbers",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          { type: "p", text: "Think of a variable as a labelled box. For a **primitive** (a number, a string…) the box holds the value itself. For an **object** the box holds an *address* — a reference — pointing to the object living somewhere else." },
          { type: "p", text: "Copying the box copies what is inside it. Copying a number gives you an independent number; copying an address gives you a second arrow to the **same** object. Almost every \"why did my object change?\" bug comes from forgetting this." },
        ],
      },
      {
        id: "definition",
        blocks: [
          { type: "p", text: "The ECMAScript spec defines exactly eight **language types**. Seven are primitive; the eighth is Object (functions and arrays are kinds of object)." },
          {
            type: "table",
            head: ["Type", "Example", "`typeof`", "Notes"],
            rows: [
              ["Undefined", "`undefined`", "`\"undefined\"`", "Value of uninitialised bindings, missing properties, missing arguments"],
              ["Null", "`null`", "`\"object\"`", "Intentional \"no value\". The `typeof` result is a historical bug kept for compatibility"],
              ["Boolean", "`true`", "`\"boolean\"`", ""],
              ["Number", "`42`, `0.1`, `NaN`, `-0`", "`\"number\"`", "IEEE-754 double precision (64-bit float)"],
              ["BigInt", "`42n`", "`\"bigint\"`", "Arbitrary-precision integers (ES2020); cannot mix with Number in arithmetic"],
              ["String", "`\"hi\"`", "`\"string\"`", "Immutable sequence of UTF-16 code units"],
              ["Symbol", "`Symbol(\"id\")`", "`\"symbol\"`", "Unique, usable as property keys (ES2015)"],
              ["Object", "`{}`, `[]`, `function(){}`", "`\"object\"` / `\"function\"`", "Callable objects report `\"function\"`"],
            ],
          },
          { type: "p", text: "**Primitive**: an immutable value with no properties of its own. **Object**: a mutable collection of properties, with identity — two objects are equal only if they are the same object." },
        ],
      },
      {
        id: "why",
        blocks: [
          { type: "list", items: [
            "Equality (`===`) compares primitives by value but objects by identity — essential for React state, memoization and `Map` keys.",
            "Mutating a shared object changes it for every holder of the reference: the source of many aliasing bugs.",
            "Knowing what is copied on assignment is the basis of shallow vs deep copy and of memory-leak reasoning.",
          ] },
        ],
      },
      {
        id: "internals",
        blocks: [
          { type: "p", text: "**Immutability of primitives.** No operation changes a primitive in place. `s.toUpperCase()` returns a *new* string; `n++` rebinds `n` to a new number. That is why primitives can be freely shared or copied — nobody can observe the difference." },
          { type: "p", text: "**Auto-boxing.** `\"abc\".length` works even though primitives have no properties. The spec performs `ToObject` on property access, conceptually wrapping the string in a temporary `String` object whose prototype is `String.prototype`. Writing a property onto that temporary is lost (and throws in strict mode)." },
          { type: "p", text: "**Call by sharing.** Arguments are always passed by value — but for objects, the value *is* the reference. A function can mutate the object you passed, but reassigning its parameter never affects the caller's variable. JavaScript has no pass-by-reference in the C++ sense." },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "\"Primitives on the stack, objects on the heap\" is a simplification",
            text: "The spec never mentions a stack or heap. In V8, small integers (**Smis**) are encoded directly in a tagged machine word; other numbers become heap-allocated `HeapNumber`s unless the optimizing compiler unboxes them; strings are always heap objects (often shared or interned). Variables captured by closures live in heap-allocated `Context` objects even if they hold primitives. The useful mental model is *value vs reference*, not stack vs heap.",
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "`let a = 1; let b = a;`", detail: "`b` receives a copy of the value `1`. The two bindings are independent." },
              { title: "`b++`", detail: "`b` is rebound to `2`. `a` is still `1` — no one mutated the number `1`." },
              { title: "`const o1 = { n: 1 }; const o2 = o1;`", detail: "One object is allocated. `o1` and `o2` hold the same reference (they alias)." },
              { title: "`o2.n++`", detail: "Mutates the shared object; reading `o1.n` now gives `2`." },
              { title: "`reassign(o1)`", detail: "Inside, the parameter is rebound to a new object. The caller's `o1` still points at the original." },
              { title: "`mutate(o1)`", detail: "Inside, a property on the shared object is written — visible to the caller." },
            ],
          },
        ],
      },
      {
        id: "visualization",
        blocks: [
          { type: "p", text: "Step through assignment and copying below. Notice that copying an object variable copies only the arrow; spreading (`{ ...o }`) creates a new top-level object but nested objects are still shared." },
          { type: "viz", id: "js-references", caption: "Conceptual model: bindings hold primitives directly or references to objects. Not a literal picture of engine memory." },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "js",
            runnable: true,
            caption: "Value vs reference, and call by sharing",
            code: `let a = 1;
let b = a;
b++;
console.log(a, b);

const o1 = { n: 1 };
const o2 = o1;
o2.n++;
console.log(o1.n);

function reassign(obj) { obj = { n: 99 }; }
function mutate(obj) { obj.n = 42; }
reassign(o1);
console.log(o1.n);
mutate(o1);
console.log(o1.n);`,
            output: `1 2
2
2
42`,
          },
          {
            type: "code",
            lang: "js",
            runnable: true,
            caption: "typeof for every type",
            code: `console.log(typeof undefined, typeof null, typeof true, typeof 1, typeof 1n);
console.log(typeof "s", typeof Symbol(), typeof {}, typeof [], typeof function () {});`,
            output: `undefined object boolean number bigint
string symbol object object function`,
          },
          {
            type: "code",
            lang: "js",
            runnable: true,
            caption: "Numbers are doubles",
            code: `console.log(0.1 + 0.2 === 0.3, 0.1 + 0.2);
console.log(Number.MAX_SAFE_INTEGER + 2);
console.log(2n ** 64n);`,
            output: `false 0.30000000000000004
9007199254740992
18446744073709551616n`,
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          { type: "list", items: [
            "`typeof null === \"object\"` — test for null with `x === null`.",
            "`typeof []` is `\"object\"`; use `Array.isArray`.",
            "`NaN` is a number and is not equal to itself; use `Number.isNaN` or `Object.is`.",
            "`-0` exists: `0 === -0` is `true` but `Object.is(0, -0)` is `false`, and `1 / -0` is `-Infinity`.",
            "Integers above `2**53 - 1` lose precision; use BigInt for exact large integers (IDs from APIs are often strings for this reason).",
            "`typeof undeclaredVariable` is `\"undefined\"` rather than a ReferenceError — except inside the TDZ of a `let`/`const`, where it throws.",
          ] },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          { type: "callout", tone: "misconception", title: "\"const makes it immutable\"", text: "`const` makes the *binding* non-reassignable. The object it points to can still be mutated. Use `Object.freeze` (shallow) or immutable update patterns for immutability." },
          { type: "callout", tone: "misconception", title: "\"Objects are passed by reference\"", text: "They are passed *by sharing*: the reference is copied. Reassigning the parameter never changes the caller's variable, which real pass-by-reference would." },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          { type: "compare", items: [
            { title: "Mutating shared objects", points: ["No allocation, fast", "Hard to reason about: any holder sees the change", "Breaks identity-based change detection (React, memo)"] },
            { title: "Copy-on-write / immutable updates", points: ["Changes are explicit and detectable with `===`", "Costs allocations (usually cheap for young-generation GC)", "Needs discipline or tooling (Immer, readonly types)"] },
          ] },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          { type: "p", text: "JavaScript has seven primitive types — undefined, null, boolean, number, bigint, string, symbol — plus Object. Primitives are immutable and compared by value; objects are mutable, have identity, and variables hold references to them. Assignment and argument passing always copy the value, which for objects means copying the reference, so two variables can alias the same object. `typeof null` is `\"object\"` for historical reasons and `typeof` a function is `\"function\"`." },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          { type: "p", text: "Go further by explaining auto-boxing (`ToObject` on property access), call-by-sharing, why numbers are IEEE-754 doubles (safe-integer range, `0.1 + 0.2`), and why BigInt exists. Then add the engine perspective: the spec has no stack/heap, while V8 uses tagged Smis, heap numbers and context-allocated captured variables." },
        ],
      },
      {
        id: "summary",
        blocks: [
          { type: "list", items: [
            "8 types: 7 primitives + Object.",
            "Primitives: immutable, compared by value. Objects: mutable, compared by identity.",
            "Everything is passed by value; an object's value is its reference (call by sharing).",
            "`typeof null` is `\"object\"`; arrays are objects; functions report `\"function\"`.",
            "Stack vs heap is an engine detail; reason with values and references.",
          ] },
        ],
      },
    ],
    glossary: [
      { term: "Primitive", definition: "An immutable value that is not an object: undefined, null, boolean, number, bigint, string or symbol." },
      { term: "Reference", definition: "The value an object-typed variable holds: a pointer-like handle to the object." },
      { term: "Aliasing", definition: "Two or more bindings referring to the same object, so a mutation through one is visible through all." },
      { term: "Call by sharing", definition: "Argument passing where the caller's value (for objects, the reference) is copied into the parameter." },
      { term: "Auto-boxing", definition: "Temporarily wrapping a primitive in its wrapper object (String, Number…) to perform a property access." },
      { term: "Smi", definition: "V8's 'small integer' representation stored directly in a tagged word, avoiding a heap allocation (engine detail)." },
    ],
    followUps: [
      { q: "Why does `typeof null` return \"object\"?", a: "In the first implementation values carried a type tag and the object tag was 0; `null` was the null pointer, also 0. The behaviour was frozen for web compatibility (a proposal to fix it was rejected)." },
      { q: "Is a string passed by reference?", a: "Semantically it doesn't matter: strings are immutable, so you cannot observe sharing. Engines do share the underlying memory, but the language treats strings as values." },
      { q: "How do you check that something is a plain object?", a: "`x !== null && typeof x === \"object\" && !Array.isArray(x)`, or check `Object.getPrototypeOf(x)` is `Object.prototype` or `null` for strictly plain objects." },
    ],
    quiz: [
      {
        id: "dt-1",
        prompt: "What is logged?",
        code: { lang: "js", code: `const a = { x: 1 };
const b = a;
b.x = 2;
let c = a.x;
c = 3;
console.log(a.x);` },
        options: ["1", "2", "3", "undefined"],
        answer: 1,
        explanation: "`b` aliases `a`, so `b.x = 2` mutates the shared object. `c` receives the primitive `2`; reassigning `c` does not touch the object.",
      },
      {
        id: "dt-2",
        prompt: "Which `typeof` result is NOT possible?",
        options: ["\"bigint\"", "\"symbol\"", "\"null\"", "\"function\""],
        answer: 2,
        explanation: "`typeof null` is `\"object\"`. There is no `\"null\"` result.",
      },
      {
        id: "dt-3",
        prompt: "A function receives an object and does `param = {}`. What happens to the caller's variable?",
        options: ["It now points to the empty object", "Nothing — only the local parameter is rebound", "TypeError", "The original object is cleared"],
        answer: 1,
        explanation: "Call by sharing: the parameter holds a copy of the reference. Rebinding it does not affect the caller.",
      },
    ],
    questions: ["javascript/js-12", "javascript/js-13", "javascript/js-18"],
  },
  {
    slug: "null-vs-undefined",
    track: "javascript",
    title: "null vs undefined",
    summary: "Two ways to say \"no value\": `undefined` is what the language gives you by default, `null` is what programmers assign on purpose.",
    level: "beginner",
    frequency: "high",
    minutes: 15,
    kinds: ["theory", "quiz"],
    status: "authored",
    prerequisites: ["javascript/data-types"],
    related: ["javascript/equality-coercion", "javascript/destructuring-spread", "javascript/json-circular"],
    tags: ["null", "undefined", "nullish", "default-parameters"],
    sources: [],
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: [
        "List where the engine produces `undefined` on its own",
        "Explain how `null` and `undefined` behave with `==`, `typeof`, arithmetic, JSON and default parameters",
        "Use `??` and `?.` to handle both safely",
      ] }] },
      { id: "intuition", blocks: [
        { type: "p", text: "`undefined` means \"nothing has been put here yet\" — the language's default. `null` means \"I deliberately put *nothing* here\" — a value programmers choose. Both are primitive types with exactly one value each." },
      ] },
      { id: "definition", blocks: [
        { type: "table", head: ["", "`undefined`", "`null`"], rows: [
          ["Who produces it", "The engine: uninitialised `let`/`var`, missing properties, missing arguments, functions with no `return`, `void 0`", "Your code (and some APIs, e.g. `document.getElementById` when nothing matches)"],
          ["`typeof`", "`\"undefined\"`", "`\"object\"` (historical bug)"],
          ["`Number(x)`", "`NaN`", "`0`"],
          ["Default parameters", "Triggers the default", "Does **not** trigger the default"],
          ["`JSON.stringify` in objects", "Property omitted", "Kept as `null`"],
        ] },
        { type: "p", text: "Under loose equality they are equal only to each other: `null == undefined` is `true`, but `null == 0` and `undefined == false` are both `false`. Strictly, `null !== undefined`." },
      ] },
      { id: "examples", blocks: [
        { type: "code", lang: "js", runnable: true, code: `function f(a = 5) { return a; }
console.log(f(undefined), f(null));
console.log(JSON.stringify({ a: undefined, b: null }));
console.log(Number(null), Number(undefined), null + 1);

const o = { x: null, y: undefined };
console.log(o.x ?? "default", o.y ?? "default", 0 ?? "default", 0 || "default");`, output: `5 null
{"b":null}
0 NaN 1
default default 0 default` },
      ] },
      { id: "mistakes", blocks: [
        { type: "list", items: [
          "Using `||` for defaults: it also replaces `0`, `\"\"` and `false`. Use `??` when only null/undefined should fall back.",
          "Checking `typeof x === \"object\"` without excluding `null`.",
          "Treating `undefined` as a keyword: it is a (non-writable) global property and can be shadowed by a local variable; `void 0` always yields the real value.",
          "Expecting `null >= 0` to be false: relational comparison converts `null` to `0`, so it is `true` even though `null == 0` is `false`.",
        ] },
      ] },
      { id: "interview-short", blocks: [
        { type: "p", text: "`undefined` is the engine's default for \"no value yet\" — missing properties, arguments, return values, uninitialised variables. `null` is an explicit, intentional empty value assigned by code. `null == undefined` is true but `===` is false; `typeof null` is \"object\"; `Number(null)` is 0 while `Number(undefined)` is NaN; default parameters and destructuring defaults fire only for `undefined`. Use `x == null` or `??` to handle both." },
      ] },
      { id: "summary", blocks: [{ type: "list", items: [
        "`undefined`: absence by default. `null`: absence on purpose.",
        "Loosely equal to each other, to nothing else.",
        "Defaults (`= value`) only trigger on `undefined`; `??` and `?.` treat both as nullish.",
      ] }] },
    ],
    glossary: [
      { term: "Nullish", definition: "Either `null` or `undefined`; the values `??` and `?.` react to." },
      { term: "`void` operator", definition: "Evaluates an expression and returns `undefined`; `void 0` is a safe way to write undefined." },
    ],
    followUps: [
      { q: "Should an API return null or undefined for 'not found'?", a: "Either works if consistent. Many style guides use `null` for intentional absence in data (it survives JSON) and leave `undefined` to the language." },
      { q: "How do you check for both?", a: "`x == null` is the one idiomatic use of loose equality; or `x === null || x === undefined`." },
    ],
    quiz: [
      { id: "nu-1", prompt: "What does `JSON.stringify({ a: undefined, b: null, c: [undefined] })` produce?", options: ["{\"a\":null,\"b\":null,\"c\":[null]}", "{\"b\":null,\"c\":[null]}", "{\"b\":null,\"c\":[]}", "{\"a\":undefined,\"b\":null}"], answer: 1, explanation: "Object properties with `undefined` are omitted, but inside arrays `undefined` becomes `null` to keep indexes stable." },
      { id: "nu-2", prompt: "`function f(x = 1) { return x }` — what is `f(null)`?", options: ["1", "null", "undefined", "TypeError"], answer: 1, explanation: "Default parameters apply only when the argument is `undefined`." },
    ],
    questions: ["javascript/js-13", "javascript/js-12"],
  },
  {
    slug: "equality-coercion",
    track: "javascript",
    title: "Equality and type coercion (== vs ===)",
    summary: "How `==`, `===`, `Object.is` and SameValueZero differ, the exact algorithm behind loose equality, ToPrimitive, and truthiness.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 40,
    kinds: ["theory", "quiz"],
    status: "authored",
    prerequisites: ["javascript/data-types"],
    related: ["javascript/null-vs-undefined", "javascript/typeof-instanceof", "javascript/symbols", "javascript/operators-control-flow"],
    tags: ["equality", "coercion", "ToPrimitive", "truthiness", "Object.is"],
    sources: [LYDIA],
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: [
        "Explain the four sameness algorithms: IsStrictlyEqual (`===`), IsLooselyEqual (`==`), SameValue (`Object.is`) and SameValueZero",
        "Run the loose-equality algorithm by hand on tricky inputs like `[] == ![]`",
        "Describe ToPrimitive (Symbol.toPrimitive → valueOf/toString order) and how `+` decides between addition and concatenation",
        "List every falsy value",
      ] }] },
      { id: "prerequisites", blocks: [{ type: "p", text: "You should know the eight data types and the value/reference distinction from [Data types](/paths/javascript/data-types)." }] },
      { id: "intuition", blocks: [
        { type: "p", text: "`===` asks \"are these the same type *and* the same value?\" — no conversions. `==` asks \"could these be the same after I convert them into a common type?\" and follows a fixed recipe of conversions to get there. The recipe is deterministic; it is just not obvious." },
      ] },
      { id: "definition", blocks: [
        { type: "table", head: ["Algorithm", "Used by", "NaN vs NaN", "+0 vs -0", "Coerces?"], rows: [
          ["IsStrictlyEqual", "`===`, `switch`, `indexOf`", "false", "equal", "No"],
          ["IsLooselyEqual", "`==`", "false", "equal", "Yes"],
          ["SameValue", "`Object.is`", "**true**", "**different**", "No"],
          ["SameValueZero", "`includes`, `Map`/`Set` keys", "**true**", "equal", "No"],
        ] },
        { type: "p", text: "**Coercion** is converting a value from one type to another. It is *explicit* when you call `Number(x)`, `String(x)`, `Boolean(x)` and *implicit* when an operator does it for you (`==`, `+`, `<`, `if (x)`)." },
      ] },
      { id: "why", blocks: [
        { type: "p", text: "Interviewers use coercion puzzles to see whether you reason from rules rather than memorised trivia. In real code, understanding it explains bugs like `\"10\" < \"9\"` being `true` (string comparison), `[] + {}` producing a string, and `includes(NaN)` working while `indexOf(NaN)` does not." },
      ] },
      { id: "internals", blocks: [
        { type: "p", text: "**IsLooselyEqual(x, y)** — simplified but faithful to the spec's order:" },
        { type: "steps", steps: [
          { title: "Same type?", detail: "Use strict equality (`===`)." },
          { title: "null and undefined", detail: "`null == undefined` is true. Neither is loosely equal to anything else (the `document.all` legacy quirk aside)." },
          { title: "Number vs String", detail: "Convert the string with ToNumber, compare again." },
          { title: "BigInt vs String", detail: "Convert the string with StringToBigInt; if that fails, false." },
          { title: "Boolean vs anything", detail: "Convert the boolean to a number (`true` → 1, `false` → 0), compare again. This is why `\"1\" == true` but `\"true\" == true` is false." },
          { title: "Object vs primitive", detail: "Convert the object with ToPrimitive (no hint), compare again." },
          { title: "BigInt vs Number", detail: "Compare mathematical values (`1n == 1` is true; NaN/Infinity are never equal to a BigInt)." },
          { title: "Otherwise", detail: "false (e.g. Symbol vs string, object vs object with different identity)." },
        ] },
        { type: "p", text: "**ToPrimitive(obj, hint)**: if the object has a `Symbol.toPrimitive` method, call it with the hint (`\"number\"`, `\"string\"` or `\"default\"`). Otherwise use OrdinaryToPrimitive: for hint `\"string\"` try `toString()` then `valueOf()`; for `\"number\"`/`\"default\"` try `valueOf()` then `toString()`. The first one returning a primitive wins; if neither does, TypeError. Plain objects' `valueOf` returns the object itself, so they fall through to `toString` → `\"[object Object]\"`; arrays' `toString` joins elements with commas." },
        { type: "p", text: "**The `+` operator** calls ToPrimitive on both operands (hint `\"default\"`). If either result is a string, it concatenates; otherwise both are converted with ToNumeric and added. Other arithmetic operators (`-`, `*`, `/`) always convert to numbers." },
        { type: "p", text: "**Relational comparison** (`<`, `>`): after ToPrimitive with hint `\"number\"`, if *both* are strings they are compared by UTF-16 code units (lexicographically); otherwise both become numbers. `null >= 0` is true because `null` → 0, even though `null == 0` is false — `==` has its own null rule." },
        { type: "p", text: "**Truthiness** (ToBoolean) never calls user code. The falsy values are exactly: `false`, `0`, `-0`, `0n`, `\"\"`, `null`, `undefined`, `NaN` (plus the legacy `document.all`). Everything else — including `[]`, `{}`, `\"0\"` and `\"false\"` — is truthy." },
      ] },
      { id: "walkthrough", title: "Walkthrough: why `[] == ![]` is true", blocks: [
        { type: "steps", steps: [
          { title: "Evaluate `![]`", detail: "`[]` is truthy, so `![]` is `false`. Now: `[] == false`." },
          { title: "Boolean operand", detail: "Convert `false` to the number `0`. Now: `[] == 0`." },
          { title: "Object vs primitive", detail: "ToPrimitive(`[]`): `valueOf()` returns the array itself (not primitive), so `toString()` → `\"\"`. Now: `\"\" == 0`." },
          { title: "String vs number", detail: "ToNumber(`\"\"`) is `0`. Now: `0 == 0` → **true**." },
        ] },
      ] },
      { id: "examples", blocks: [
        { type: "code", lang: "js", runnable: true, caption: "Loose equality and sameness", code: `console.log([] == ![], "0" == false, null == 0, null >= 0);
console.log(null == undefined, [1] == 1, [1, 2] == "1,2");
console.log(NaN == NaN, Object.is(NaN, NaN), Object.is(0, -0), 0 === -0);
console.log([NaN].includes(NaN), [NaN].indexOf(NaN));`, output: `true true false true
true true true
false true false true
true -1` },
        { type: "code", lang: "js", runnable: true, caption: "The + operator and ToPrimitive", code: `console.log([] + {}, 1 + "2", "3" * "4", true + 1, [2] * [3]);

const money = {
  valueOf() { return 42; },
  toString() { return "forty-two"; },
};
console.log(money + 1, \`\${money}\`, money == 42, String(money));`, output: `[object Object] 12 12 2 6
43 forty-two true forty-two` },
        { type: "callout", tone: "note", title: "`{} + []` in a console", text: "Typed at the start of a statement, `{}` is parsed as an empty *block*, so `{} + []` is really `+[]` → `0`. Inside an expression (`console.log({} + [])`) it is `\"[object Object]\"`." },
      ] },
      { id: "edge-cases", blocks: [
        { type: "list", items: [
          "`\"10\" < \"9\"` is `true` — both strings, compared character by character.",
          "`\"b\" + \"a\" + +\"a\" + \"a\"` is `\"baNaNa\"` — unary `+` on `\"a\"` gives NaN.",
          "Template literals use hint `\"string\"` (`toString` first) while `+` uses `\"default\"` (`valueOf` first) — see the `money` example.",
          "Symbols cannot be implicitly converted to strings: `Symbol() + \"\"` throws a TypeError, but `String(Symbol(\"x\"))` works.",
          "Date objects are special: their `Symbol.toPrimitive` treats hint `\"default\"` as `\"string\"`, so `date + 1` concatenates.",
        ] },
      ] },
      { id: "mistakes", blocks: [
        { type: "callout", tone: "misconception", title: "\"== converts both sides to booleans\"", text: "It never calls ToBoolean. A boolean operand is converted to a *number*. That is why `if (\"0\")` runs (truthy) but `\"0\" == false` is true." },
        { type: "callout", tone: "tip", title: "Rule of thumb", text: "Use `===` everywhere; use `x == null` deliberately when you mean \"null or undefined\". Linters (`eqeqeq` with the `null: ignore` option) can enforce exactly this." },
      ] },
      { id: "tradeoffs", blocks: [
        { type: "compare", items: [
          { title: "`===`", points: ["Predictable, no conversions", "Requires you to normalise types first (e.g. parse input)"] },
          { title: "`==`", points: ["Convenient for `x == null`", "Surprising elsewhere; hides type bugs"] },
          { title: "`Object.is`", points: ["Distinguishes `-0`, matches `NaN`", "What React uses for state comparisons", "Rarely needed otherwise"] },
        ] },
      ] },
      { id: "interview-short", blocks: [
        { type: "p", text: "`===` compares type and value without conversion. `==` applies the IsLooselyEqual algorithm: null and undefined only equal each other; booleans become numbers; strings vs numbers convert the string to a number; objects vs primitives call ToPrimitive (valueOf then toString). `Object.is` is like `===` but treats NaN as equal to itself and +0 and -0 as different. I use `===` by default and `== null` only to check for nullish." },
      ] },
      { id: "interview-deep", blocks: [
        { type: "p", text: "Walk the algorithm on `[] == ![]`, explain ToPrimitive's hint and `Symbol.toPrimitive`, contrast `+` (string wins) with other arithmetic (numbers), point out the separate relational algorithm (`null >= 0`), and finish with SameValueZero in `includes`/`Map`/`Set`." },
      ] },
      { id: "summary", blocks: [{ type: "list", items: [
        "Four sameness algorithms: `===`, `==`, `Object.is`, SameValueZero.",
        "`==` steps: same type → strict; null/undefined pair; booleans → numbers; strings → numbers; objects → ToPrimitive.",
        "ToPrimitive: `Symbol.toPrimitive`, else valueOf/toString in hint order.",
        "`+` concatenates if either primitive is a string.",
        "8 falsy values; everything else is truthy.",
      ] }] },
    ],
    glossary: [
      { term: "Coercion", definition: "Converting a value to another type, explicitly (`Number(x)`) or implicitly by an operator." },
      { term: "ToPrimitive", definition: "Spec operation that converts an object to a primitive using `Symbol.toPrimitive` or `valueOf`/`toString`." },
      { term: "Hint", definition: "The preferred result type passed to ToPrimitive: \"number\", \"string\" or \"default\"." },
      { term: "SameValueZero", definition: "Equality like SameValue but treating +0 and -0 as equal; used by `includes`, `Map` and `Set`." },
      { term: "Falsy", definition: "A value that converts to `false` in a boolean context." },
    ],
    followUps: [
      { q: "Why does `[1,2,3].indexOf(NaN)` return -1 but `includes(NaN)` return true?", a: "`indexOf` uses strict equality (NaN !== NaN); `includes` uses SameValueZero, which treats NaN as equal to NaN." },
      { q: "How would you make `a == 1 && a == 2 && a == 3` true?", a: "Give `a` a `valueOf` (or `Symbol.toPrimitive`) that returns an incrementing counter; each `==` calls ToPrimitive again." },
      { q: "Is `==` ever faster than `===`?", a: "Not meaningfully; `===` can skip conversions. Choose by semantics, not speed." },
    ],
    quiz: [
      { id: "eq-1", prompt: "What is `\"1\" == true`?", options: ["true", "false", "TypeError", "undefined"], answer: 0, explanation: "Boolean → number: `\"1\" == 1`, then string → number: `1 == 1`." },
      { id: "eq-2", prompt: "What is `null >= 0`?", options: ["true", "false"], answer: 0, explanation: "Relational comparison converts null to 0, and `0 >= 0` is true — even though `null == 0` is false." },
      { id: "eq-3", prompt: "Which value is truthy?", options: ["0n", "\"\"", "[]", "NaN"], answer: 2, explanation: "All objects, including empty arrays, are truthy." },
      { id: "eq-4", prompt: "What does `[] + []` evaluate to?", options: ["0", "\"\" (empty string)", "[]", "NaN"], answer: 1, explanation: "Both arrays ToPrimitive to `\"\"`; since a string is involved, `+` concatenates two empty strings." },
    ],
    questions: ["javascript/js-10", "javascript/js-12"],
  },
  outline({
    slug: "typeof-instanceof",
    title: "typeof, instanceof, NaN and BigInt",
    summary: "Runtime type checks and their blind spots: `typeof`, `instanceof`, `Array.isArray`, `Number.isNaN` vs `isNaN`, and when to reach for BigInt.",
    level: "beginner",
    frequency: "high",
    minutes: 20,
    prerequisites: ["javascript/data-types"],
    related: ["javascript/prototypes", "javascript/equality-coercion", "javascript/symbols"],
    tags: ["typeof", "instanceof", "Array.isArray", "NaN", "BigInt"],
    sources: [],
    objectives: [
      "Know every `typeof` result and its two quirks (`null`, functions)",
      "Explain that `instanceof` walks the prototype chain (and can be customised with `Symbol.hasInstance`)",
      "Detect arrays reliably across realms (iframes) with `Array.isArray`",
      "Use `Number.isNaN` instead of the coercing global `isNaN`",
      "Use BigInt for exact integers above 2^53 − 1 and know its restrictions",
    ],
    covers: [
      "`typeof` table and `typeof` on undeclared vs TDZ bindings",
      "`instanceof` algorithm and why it fails across realms",
      "Array detection: `Array.isArray` vs `instanceof Array` vs `Object.prototype.toString.call`",
      "NaN: where it comes from, `isNaN` vs `Number.isNaN`, `Object.is`",
      "BigInt literals, no mixing with Number, `JSON.stringify` throws on BigInt",
    ],
    questions: ["javascript/js-25", "javascript/js-12"],
  }),
  outline({
    slug: "strings-numbers-unicode",
    title: "Strings, numbers, Math and Unicode",
    summary: "UTF-16 strings and code points, string methods, number precision and formatting, and the Math object.",
    level: "beginner",
    frequency: "medium",
    minutes: 30,
    prerequisites: ["javascript/data-types"],
    related: ["javascript/regex", "javascript/equality-coercion"],
    tags: ["strings", "unicode", "utf-16", "numbers", "Math", "Intl"],
    sources: [],
    objectives: [
      "Explain why `\"😀\".length` is 2 (UTF-16 code units vs code points) and iterate strings by code point",
      "Use common string methods and template literals (including tagged templates)",
      "Reason about IEEE-754 precision, `Number.EPSILON`, safe integers and rounding",
      "Format numbers and dates for users with `Intl`",
    ],
    covers: [
      "String immutability, indexing, `at()`, slicing, searching, padding, `normalize()`",
      "Code units, code points, surrogate pairs, grapheme clusters (`Intl.Segmenter`)",
      "Template literals and tagged templates",
      "Number parsing (`Number` vs `parseInt`/`parseFloat`), `toFixed`, precision pitfalls",
      "Math utilities and `Math.random` caveats (not cryptographically secure — use `crypto.getRandomValues`)",
    ],
  }),
  outline({
    slug: "regex",
    title: "Regular expressions",
    summary: "RegExp syntax, flags, groups, lookarounds, the stateful `lastIndex` trap, and catastrophic backtracking.",
    level: "intermediate",
    frequency: "low",
    minutes: 30,
    prerequisites: ["javascript/strings-numbers-unicode"],
    tags: ["regex", "RegExp", "backtracking"],
    sources: [],
    objectives: [
      "Write and read patterns with character classes, quantifiers, anchors and groups",
      "Use flags `g`, `i`, `m`, `s`, `u`, `v`, `y`, `d` appropriately",
      "Avoid the `lastIndex` bug when reusing a global regex with `test()`",
      "Recognise patterns prone to catastrophic backtracking (ReDoS)",
    ],
    covers: [
      "Literal vs `new RegExp`, escaping user input",
      "Named groups, backreferences, lookahead/lookbehind",
      "`match`, `matchAll`, `replace`/`replaceAll` with functions, `split`",
      "Unicode mode and property escapes (`\\p{L}`)",
      "Performance and ReDoS",
    ],
  }),
  outline({
    slug: "arrays-iteration",
    title: "Arrays: iteration, search, transformation and mutation",
    summary: "The array toolkit — which methods mutate, which copy, how holes behave, and for…of vs for…in.",
    level: "beginner",
    frequency: "high",
    minutes: 30,
    kinds: ["theory", "coding"],
    prerequisites: ["javascript/data-types", "javascript/operators-control-flow"],
    related: ["javascript/map-filter-reduce", "javascript/generators-iterators", "javascript/typeof-instanceof"],
    tags: ["arrays", "for-of", "for-in", "mutation", "sorting"],
    sources: [],
    objectives: [
      "Classify array methods as mutating (`push`, `splice`, `sort`, `reverse`) or copying (`map`, `slice`, `toSorted`, `toSpliced`, `with`)",
      "Choose `for…of` (values via the iterator) over `for…in` (enumerable string keys, including inherited ones) for arrays",
      "Use `find`/`findIndex`/`findLast`, `some`/`every`, `includes`, `flat`/`flatMap`",
      "Sort correctly: the default comparator compares strings; `sort` is stable since ES2019",
    ],
    covers: [
      "Creating arrays: literals, `Array.from`, `Array.of`, holes and `length`",
      "Iteration: `for`, `for…of`, `forEach` (no `break`, ignores returned promises), `for…in` pitfalls",
      "Search and test methods; `indexOf` vs `includes` and NaN",
      "Mutating vs non-mutating (ES2023 `toSorted`, `toReversed`, `toSpliced`, `with`)",
      "Engine note: V8 elements kinds (packed/holey, SMI/double/elements) and why holes are slow",
    ],
    questions: ["javascript/js-19", "javascript/js-25", "javascript/js-15"],
  }),
  outline({
    slug: "objects-descriptors",
    title: "Objects: properties, descriptors and utilities",
    summary: "Property keys, descriptors (writable, enumerable, configurable), accessors, enumeration order and the `Object.*` utility belt.",
    level: "intermediate",
    frequency: "medium",
    minutes: 30,
    prerequisites: ["javascript/data-types"],
    related: ["javascript/prototypes", "javascript/freeze-seal", "javascript/getters-setters-static", "javascript/proxy-reflect"],
    tags: ["objects", "property-descriptors", "enumeration", "Object.keys"],
    sources: [],
    objectives: [
      "Explain data vs accessor property descriptors and their default attribute values",
      "Predict property enumeration order (integer keys ascending, then strings in insertion order, then symbols)",
      "Choose between `Object.keys`, `Object.entries`, `Object.getOwnPropertyNames`, `Reflect.ownKeys` and `for…in`",
      "Use `Object.assign`, `Object.fromEntries`, `Object.hasOwn`, `structuredClone` appropriately",
    ],
    covers: [
      "Property keys are strings or symbols; computed keys; shorthand methods",
      "Descriptors and `Object.defineProperty` defaults (all `false`)",
      "Own vs inherited, enumerable vs non-enumerable",
      "Enumeration order rules",
      "Engine note: hidden classes (shapes) and why adding properties in a consistent order helps V8",
    ],
  }),
  outline({
    slug: "destructuring-spread",
    title: "Destructuring, spread, rest and optional chaining",
    summary: "Unpacking arrays and objects, defaults, rest/spread semantics (shallow!), and `?.` with `??`.",
    level: "beginner",
    frequency: "high",
    minutes: 20,
    prerequisites: ["javascript/data-types", "javascript/null-vs-undefined"],
    related: ["javascript/deep-copy", "javascript/objects-descriptors"],
    tags: ["destructuring", "spread", "rest", "optional-chaining"],
    sources: [],
    objectives: [
      "Destructure nested objects/arrays with renaming and defaults (defaults apply only to `undefined`)",
      "Explain that object spread copies own enumerable properties shallowly and invokes getters",
      "Distinguish rest parameters from the legacy `arguments` object",
      "Use `?.` (including `?.()` and `?.[]`) and know it short-circuits the whole chain",
    ],
    covers: [
      "Array destructuring uses the iterator protocol; object destructuring uses property access",
      "Swapping with `[a, b] = [b, a]`",
      "Spread in calls, arrays and objects; spread vs `Object.assign` (setters)",
      "Rest parameters vs `arguments`",
      "Optional chaining + nullish coalescing patterns",
    ],
  }),
];

// ===========================================================================
// Module 2 — Scope and functions
// ===========================================================================

const scopeFunctions: Lesson[] = [
  {
    slug: "var-let-const",
    track: "javascript",
    title: "var, let and const",
    summary: "Three ways to declare a variable that differ in scope, hoisting/TDZ, re-declaration, reassignment and how they interact with the global object and loops.",
    level: "beginner",
    frequency: "very-high",
    minutes: 25,
    kinds: ["theory", "quiz"],
    status: "authored",
    prerequisites: ["javascript/data-types"],
    related: ["javascript/scope", "javascript/hoisting-tdz", "javascript/closures", "javascript/execution-context"],
    tags: ["var", "let", "const", "block-scope", "tdz", "loops"],
    sources: [],
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: [
        "Compare `var`, `let` and `const` across scope, hoisting, TDZ, redeclaration, reassignment and global-object behaviour",
        "Explain the classic `for (var i…) setTimeout` bug and why `let` fixes it (a fresh binding per iteration)",
        "Pick a declaration keyword by default (`const`, then `let`; avoid `var`)",
      ] }] },
      { id: "intuition", blocks: [
        { type: "p", text: "`var` is the original, function-scoped declaration with loose rules. ES2015 added `let` and `const`, which are **block-scoped** (they live inside the nearest `{ }`) and cannot be used before their declaration line runs. `const` additionally forbids reassigning the binding." },
      ] },
      { id: "definition", blocks: [
        { type: "table", head: ["", "`var`", "`let`", "`const`"], rows: [
          ["Scope", "Function (or script/global)", "Block", "Block"],
          ["Hoisted?", "Yes, initialised to `undefined`", "Yes, but **uninitialised** (TDZ)", "Yes, but **uninitialised** (TDZ)"],
          ["Redeclare in same scope", "Allowed", "SyntaxError", "SyntaxError"],
          ["Reassign", "Allowed", "Allowed", "TypeError"],
          ["Must initialise", "No", "No", "Yes"],
          ["Top-level in a classic script", "Creates a property on the global object", "Global lexical binding, *not* a global-object property", "Same as `let`"],
          ["Per-iteration binding in `for`", "No (one shared binding)", "Yes", "Yes (for `for…of`/`for…in`)"],
        ] },
      ] },
      { id: "why", blocks: [
        { type: "p", text: "`var`'s function scope leaks loop counters and temporary values into the whole function, lets you redeclare by accident, and silently yields `undefined` before assignment. Block scoping and the TDZ turn those silent bugs into immediate errors." },
      ] },
      { id: "internals", blocks: [
        { type: "p", text: "Declarations are instantiated when their **environment record** is created (see [Execution context](/paths/javascript/execution-context)). `var` names go into the function's *VariableEnvironment* and are initialised to `undefined` straight away. `let`/`const` names are created in the block's declarative environment record but left **uninitialised** until the declaration executes — accessing them in between throws a ReferenceError. That window is the temporal dead zone." },
        { type: "p", text: "In a `for (let i = 0; …; i++)` loop, the spec (CreatePerIterationEnvironment) copies `i` into a **new** environment record for every iteration. A closure created in iteration 2 therefore captures iteration 2's `i`. With `var` there is one binding for the whole function, so every callback sees its final value." },
        { type: "p", text: "At the top level of a classic script, the global environment record has two parts: an *object record* backed by the global object (`var` and function declarations land here, so they become `window.x`) and a *declarative record* for `let`/`const`/`class`. ES modules have their own module scope, so no top-level declaration leaks onto `globalThis`." },
      ] },
      { id: "examples", blocks: [
        { type: "code", lang: "js", runnable: true, caption: "The loop-closure classic", code: `for (var i = 0; i < 3; i++) setTimeout(() => console.log("var", i));
for (let j = 0; j < 3; j++) setTimeout(() => console.log("let", j));`, output: `var 3
var 3
var 3
let 0
let 1
let 2` },
        { type: "code", lang: "js", runnable: true, caption: "Block scope, redeclaration and const", code: `var x = 1;
{ var x = 2; }   // same function-scoped binding
console.log(x);

let y = 1;
{ let y = 2; }   // a different, block-scoped binding
console.log(y);

const arr = [1];
arr.push(2);     // mutation is fine
console.log(arr.join(","));
try { arr = []; } catch (e) { console.log(e.name); }`, output: `2
1
1,2
TypeError` },
      ] },
      { id: "mistakes", blocks: [
        { type: "callout", tone: "misconception", title: "\"let and const are not hoisted\"", text: "They are hoisted — the binding exists from the start of the block (which is why an inner `let x` shadows an outer `x` even on lines *before* the declaration). They are just not *initialised*, hence the TDZ." },
        { type: "callout", tone: "misconception", title: "\"const means constant value\"", text: "It means constant *binding*. `const obj = {}` can still be mutated; freeze it if you need that." },
      ] },
      { id: "tradeoffs", blocks: [
        { type: "list", items: [
          "Default to `const`: it documents that the binding never changes and catches accidental reassignment.",
          "Use `let` for counters, accumulators and values that genuinely change.",
          "Avoid `var` in new code; you still need to read it in legacy code and understand its function scope.",
        ] },
      ] },
      { id: "interview-short", blocks: [
        { type: "p", text: "`var` is function-scoped, hoisted and initialised to `undefined`, can be redeclared, and at the top level of a script becomes a property of the global object. `let` and `const` are block-scoped, hoisted but uninitialised until their declaration runs — the temporal dead zone — and cannot be redeclared in the same scope. `const` also cannot be reassigned, but the object it refers to can still be mutated. In `for` loops `let` creates a fresh binding per iteration, which fixes the classic setTimeout-in-a-loop bug." },
      ] },
      { id: "interview-deep", blocks: [
        { type: "p", text: "Explain it via environment records: var bindings in the VariableEnvironment initialised at instantiation; lexical bindings created uninitialised; per-iteration environment copies for `for (let…)`; the global record's object vs declarative halves; modules having no global leakage." },
      ] },
      { id: "summary", blocks: [{ type: "list", items: [
        "`var`: function scope, `undefined` before assignment, redeclarable, leaks to `window` at top level.",
        "`let`/`const`: block scope, TDZ, no redeclaration; `const` blocks reassignment only.",
        "Loops: `let` gives each iteration its own binding.",
        "Default to `const`, then `let`.",
      ] }] },
    ],
    glossary: [
      { term: "Binding", definition: "The association between a name and a value inside an environment record." },
      { term: "Block scope", definition: "Visibility limited to the enclosing `{ }` block." },
      { term: "Temporal dead zone (TDZ)", definition: "The period between entering a scope and executing a `let`/`const`/`class` declaration, during which the binding exists but cannot be accessed." },
      { term: "Shadowing", definition: "An inner declaration with the same name hiding an outer one." },
    ],
    followUps: [
      { q: "How did people fix the loop bug before `let`?", a: "By creating a new function scope per iteration with an IIFE (`(function (i) { setTimeout(() => log(i)) })(i)`) or passing `i` as an extra argument to `setTimeout`." },
      { q: "Does `const` inside `for (const i = 0; i < 3; i++)` work?", a: "No: the update `i++` reassigns the binding and throws a TypeError after the first iteration. `const` works in `for…of`/`for…in` because each iteration gets a new binding that is never reassigned." },
    ],
    quiz: [
      { id: "vlc-1", prompt: "What is logged?", code: { lang: "js", code: `function f() {
  if (true) { var a = 1; let b = 2; }
  console.log(typeof a, typeof b);
}
f();` }, options: ["number number", "number undefined", "undefined undefined", "ReferenceError"], answer: 1, explanation: "`a` is function-scoped. `b` is block-scoped and not visible outside the `if`; `typeof` on an unresolvable name gives \"undefined\" rather than throwing." },
      { id: "vlc-2", prompt: "Which line throws?", code: { lang: "js", code: `const o = { n: 1 }; // 1
o.n = 2;            // 2
o = { n: 3 };       // 3` }, options: ["1", "2", "3", "None"], answer: 2, explanation: "Mutating is allowed; reassigning a `const` binding throws a TypeError." },
    ],
    questions: ["javascript/js-06", "javascript/js-05"],
  },
  {
    slug: "scope",
    track: "javascript",
    title: "Scope: global, function, block and lexical scoping",
    summary: "Where a name is visible, how identifier lookup walks the chain of environments outward, and why JavaScript scope is lexical (decided by where code is written).",
    level: "beginner",
    frequency: "very-high",
    minutes: 30,
    kinds: ["theory", "quiz"],
    status: "authored",
    prerequisites: ["javascript/var-let-const"],
    related: ["javascript/execution-context", "javascript/closures", "javascript/hoisting-tdz", "javascript/modules"],
    tags: ["scope", "lexical-scope", "scope-chain", "shadowing", "global"],
    sources: [],
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: [
        "Name the kinds of scope: global, module, function, block (and the `catch` parameter, class bodies)",
        "Explain lexical scoping and the scope chain as a linked list of environment records",
        "Resolve identifiers by hand, including shadowing",
        "Contrast lexical scope with dynamic `this`",
      ] }] },
      { id: "intuition", blocks: [
        { type: "p", text: "Scopes are nested boxes drawn around your source code. Code inside a box can see names declared in its own box and in every box that *encloses* it, but never names in a sibling or inner box. Because the boxes come from the source text, you can determine visibility just by reading the code — that is **lexical** (static) scoping." },
      ] },
      { id: "definition", blocks: [
        { type: "list", items: [
          "**Global scope** — the outermost scope of a classic script, shared by all scripts on the page.",
          "**Module scope** — top level of an ES module; private to that module.",
          "**Function scope** — parameters, `var`s and function declarations inside a function.",
          "**Block scope** — `let`, `const`, `class` (and function declarations in strict mode) inside `{ }`, including loop bodies and `catch (e)` clauses.",
        ] },
        { type: "p", text: "The **scope chain** is the sequence of environments searched when resolving a name: current environment, then its outer environment, and so on up to the global environment. If the name is not found, reading it throws a ReferenceError (and in sloppy mode, *assigning* to it creates an accidental global)." },
      ] },
      { id: "internals", blocks: [
        { type: "p", text: "Every scope at runtime is an **Environment Record**, and each record has an `[[OuterEnv]]` field pointing to the record of the enclosing scope. When a function object is created, the spec stores the environment it was created in as its `[[Environment]]` slot. When the function is *called*, its new function environment's `[[OuterEnv]]` is set to that stored `[[Environment]]` — not to the caller's environment. That single rule is what makes scope lexical and makes closures possible." },
        { type: "p", text: "Identifier resolution (ResolveBinding → GetIdentifierReference) walks `[[OuterEnv]]` links until a record has the name. The walk is conceptually dynamic but its *shape* is fixed by the source, which lets engines precompute it." },
        { type: "callout", tone: "spec-vs-impl", title: "Engines resolve most lookups at compile time", text: "V8's parser performs scope analysis, so most variable accesses compile into direct slot loads (a register, a stack slot or a `Context` slot at a known depth) instead of a name search. `eval` and `with` defeat this analysis, which is one reason they make code slower and are disallowed or restricted in strict mode." },
      ] },
      { id: "walkthrough", blocks: [
        { type: "code", lang: "js", runnable: true, code: `const a = "global a";
function outer() {
  const b = "outer b";
  function inner() {
    const a = "inner a";   // shadows the global a
    console.log(a, "|", b);
  }
  inner();
}
outer();`, output: `inner a | outer b` },
        { type: "steps", steps: [
          { title: "Resolve `a` inside `inner`", detail: "Found in inner's own environment → \"inner a\". The global `a` is shadowed." },
          { title: "Resolve `b`", detail: "Not in inner's environment → follow `[[OuterEnv]]` to outer's environment → \"outer b\"." },
          { title: "Resolve `console`", detail: "Not in inner or outer → global environment → found as a property of the global object." },
        ] },
      ] },
      { id: "examples", blocks: [
        { type: "code", lang: "js", runnable: true, caption: "Lexical, not dynamic: the caller's variables are invisible", code: `const who = "global";
function show() { return who; }
function caller() {
  const who = "caller";
  return show();
}
console.log(caller());`, output: `global` },
      ] },
      { id: "edge-cases", blocks: [
        { type: "list", items: [
          "Sloppy-mode assignment to an undeclared name creates a global property; strict mode throws a ReferenceError.",
          "`catch (err)` creates a block-scoped binding for `err`.",
          "Function declarations inside blocks have legacy Annex B semantics in sloppy mode (also creating a function-scoped `var`); in strict mode they are block-scoped.",
          "Named function expressions bind their own name in a tiny scope visible only inside the function.",
        ] },
      ] },
      { id: "mistakes", blocks: [
        { type: "callout", tone: "misconception", title: "\"this is part of scope\"", text: "`this` is not looked up through the scope chain (except in arrow functions, which have no `this` of their own and therefore find the enclosing one lexically). For regular functions it is determined by *how the function is called*." },
      ] },
      { id: "tradeoffs", blocks: [
        { type: "list", items: [
          "Keep scopes small: declare variables close to use, prefer block scope.",
          "Avoid globals; use modules so top-level names are module-private.",
          "Shadowing is legal but can confuse readers — lint rules like `no-shadow` help in large codebases.",
        ] },
      ] },
      { id: "interview-short", blocks: [
        { type: "p", text: "Scope determines where a name is visible. JavaScript has global, module, function and block scope, and it's lexical: the scope chain is fixed by where functions are written, not where they're called. To resolve a name, the engine looks in the current environment, then follows the outer reference to the enclosing environment, up to the global one, throwing ReferenceError if not found. Each function remembers the environment it was created in, which is exactly what makes closures work." },
      ] },
      { id: "interview-deep", blocks: [
        { type: "p", text: "Mention environment records and `[[OuterEnv]]`, the function's `[[Environment]]` slot captured at creation, the global record's object + declarative halves, and the engine view: static scope analysis turning lookups into slot accesses, defeated by `eval`/`with`." },
      ] },
      { id: "summary", blocks: [{ type: "list", items: [
        "Kinds: global, module, function, block.",
        "Lexical: decided by source position.",
        "Lookup walks `[[OuterEnv]]` links outward.",
        "Functions capture their creation environment — the basis of closures.",
      ] }] },
    ],
    glossary: [
      { term: "Scope", definition: "The region of code where a binding is visible." },
      { term: "Lexical scoping", definition: "Scoping determined by the program's source structure rather than by the call sequence." },
      { term: "Scope chain", definition: "The linked list of environment records searched to resolve an identifier." },
      { term: "Environment Record", definition: "Spec structure holding the bindings of one scope plus a reference to its outer environment." },
      { term: "[[OuterEnv]]", definition: "The field of an environment record pointing to the enclosing scope's record (null for the global environment)." },
    ],
    followUps: [
      { q: "What is dynamic scoping and does JavaScript have it?", a: "Dynamic scoping resolves names by the call stack (as in Bash or early Lisps). JavaScript does not, although `this` and the deprecated `with` statement feel dynamic." },
      { q: "Why does an inner `let x` cause a ReferenceError when you read `x` above it, even though an outer `x` exists?", a: "The inner binding exists from the start of the block (hoisted) and shadows the outer one, but is in its TDZ until its declaration runs." },
    ],
    quiz: [
      { id: "sc-1", prompt: "What does `caller()` return?", code: { lang: "js", code: `let v = 1;
function read() { return v; }
function caller() { let v = 2; return read(); }` }, options: ["1", "2", "undefined", "ReferenceError"], answer: 0, explanation: "`read` resolves `v` through the environment where it was defined (global), not where it was called." },
      { id: "sc-2", prompt: "In strict mode, what does `function f() { leaked = 1 } f()` do?", options: ["Creates a global `leaked`", "Creates a local `leaked`", "Throws ReferenceError", "Nothing"], answer: 2, explanation: "Strict mode forbids implicit globals." },
    ],
    questions: ["javascript/js-06", "javascript/js-02"],
  },
  {
    slug: "hoisting-tdz",
    track: "javascript",
    title: "Hoisting and the temporal dead zone",
    summary: "What \"hoisting\" really is — bindings created before code runs — and how var, functions, let/const and classes differ, including the TDZ.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 30,
    kinds: ["theory", "visualization", "quiz"],
    status: "authored",
    prerequisites: ["javascript/var-let-const", "javascript/scope"],
    related: ["javascript/execution-context", "javascript/function-declarations-expressions", "javascript/classes-inheritance"],
    tags: ["hoisting", "tdz", "creation-phase", "function-declarations"],
    sources: [LYDIA],
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: [
        "Explain hoisting as declaration instantiation, not as code being moved",
        "Predict behaviour for `var`, function declarations, function expressions, `let`/`const` and `class` before their declaration line",
        "Define the TDZ and identify it in default parameters and `typeof`",
      ] }] },
      { id: "prerequisites", blocks: [{ type: "p", text: "You should know [var/let/const](/paths/javascript/var-let-const) and [scope](/paths/javascript/scope)." }] },
      { id: "intuition", blocks: [
        { type: "p", text: "Before a scope's code runs, the engine reads the whole scope and *registers every declared name*. Code later can then refer to those names. How usable a name is before its line depends on the kind of declaration: a `var` already holds `undefined`, a function declaration already holds the whole function, and `let`/`const`/`class` exist but are locked until their line runs." },
        { type: "p", text: "Nothing is physically moved to the top — \"hoisting\" is a metaphor for this up-front registration." },
      ] },
      { id: "definition", blocks: [
        { type: "table", head: ["Declaration", "Binding created at scope entry?", "Initial value before its line", "Access before line"], rows: [
          ["`var x`", "Yes (function scope)", "`undefined`", "`undefined`"],
          ["`function f(){}`", "Yes", "The function object", "Works — callable"],
          ["`var f = function(){}`", "Yes (it's a `var`)", "`undefined`", "`f()` → TypeError: not a function"],
          ["`let` / `const`", "Yes (block scope)", "*uninitialised*", "ReferenceError (TDZ)"],
          ["`class C {}`", "Yes (block scope)", "*uninitialised*", "ReferenceError (TDZ)"],
          ["`import`", "Yes (module scope)", "Live binding to the export", "Works (if the exporting module has evaluated)"],
        ] },
        { type: "p", text: "The **temporal dead zone** is the time from entering a scope until a `let`/`const`/`class` declaration is evaluated. It is *temporal* (about execution time), not positional: a function declared above a `let` can read it as long as it is *called* after the declaration has run." },
      ] },
      { id: "why", blocks: [
        { type: "p", text: "Hoisting of function declarations enables mutual recursion and lets you put helpers at the bottom of a file. The TDZ exists so that `const` can never be observed with two different values (`undefined` then the real one) and to turn use-before-define bugs into loud errors." },
      ] },
      { id: "internals", title: "How it works: the creation phase", blocks: [
        { type: "p", text: "Many tutorials describe a **creation phase** and an **execution phase**. The spec doesn't use those words; the creation phase corresponds to the *DeclarationInstantiation* algorithms that run when a script, function, block or module environment is set up." },
        { type: "steps", steps: [
          { title: "Create the environment record", detail: "A new function or block environment whose `[[OuterEnv]]` is the function's captured environment (or the enclosing block)." },
          { title: "Bind parameters", detail: "Parameter names are created and initialised with the arguments (defaults are evaluated left to right, so later parameters are in TDZ while earlier defaults run)." },
          { title: "Instantiate var declarations", detail: "Each `var` name not already bound is created and initialised to `undefined`." },
          { title: "Instantiate function declarations", detail: "Each function declaration is turned into a function object (capturing the current environment) and bound — overwriting a same-named `var`'s `undefined`." },
          { title: "Create lexical declarations", detail: "`let`, `const` and `class` names are created but **not initialised**. Accessing them throws until their declaration is evaluated." },
          { title: "Execution phase", detail: "Statements run top to bottom. Executing `let x = 1` initialises `x`; `var x = 1` merely assigns to the already-initialised binding." },
        ] },
        { type: "callout", tone: "spec-vs-impl", title: "Engines don't literally do two passes over your code", text: "V8 pre-parses functions lazily and allocates bindings during bytecode generation; TDZ checks are emitted only where it cannot prove the binding is initialised. The observable behaviour, however, is exactly the spec's." },
      ] },
      { id: "walkthrough", blocks: [
        { type: "code", lang: "js", runnable: true, code: `console.log(a);          // var: hoisted, undefined
var a = 10;

console.log(greet());    // function declaration: fully hoisted
function greet() { return "hi"; }

try { sayHi(); } catch (e) { console.log(e.name); }   // var holding undefined
var sayHi = function () { return "hi"; };

try { console.log(b); } catch (e) { console.log(e.name); }  // TDZ
let b = 1;`, output: `undefined
hi
TypeError
ReferenceError` },
      ] },
      { id: "visualization", blocks: [
        { type: "p", text: "The visualization walks a scope through its creation phase (bindings appear with `undefined`, a function or *uninitialised*) and then its execution phase, highlighting when each `let` leaves the TDZ. If it is unavailable, follow the steps table above with the walkthrough code." },
        { type: "viz", id: "js-hoisting", caption: "Conceptual model of declaration instantiation followed by execution." },
      ] },
      { id: "examples", blocks: [
        { type: "code", lang: "js", runnable: true, caption: "Shadowing + TDZ: the inner binding exists from the top of the block", code: `let t = "outer";
{
  try { console.log(t); } catch (e) { console.log(e.name); }
  let t = "inner";
}`, output: `ReferenceError` },
        { type: "code", lang: "js", runnable: true, caption: "TDZ in default parameters and the temporal nature of the TDZ", code: `function f(x = y, y = 1) { return [x, y]; }
try { f(); } catch (e) { console.log(e.name); }
console.log(f(5).join());

function readLater() { return value; }
const value = 42;
console.log(readLater());   // called after initialisation: fine`, output: `ReferenceError
5,1
42` },
      ] },
      { id: "edge-cases", blocks: [
        { type: "list", items: [
          "`typeof` is not safe in the TDZ: `typeof x; let x;` throws, while `typeof neverDeclared` returns \"undefined\".",
          "If a `var` and a function declaration share a name, the function wins at instantiation; a later `var x = …` assignment then overwrites it.",
          "Class declarations are in the TDZ, so `new C()` above `class C {}` throws — unlike function constructors.",
          "Function declarations inside blocks in sloppy mode follow Annex B web-compat rules; don't rely on them.",
        ] },
      ] },
      { id: "mistakes", blocks: [
        { type: "callout", tone: "misconception", title: "\"Hoisting moves declarations to the top of the file\"", text: "It moves nothing and is per *scope*, not per file. Each function and block instantiates its own declarations when it is entered." },
        { type: "callout", tone: "misconception", title: "\"let and const aren't hoisted\"", text: "If they weren't, the inner `console.log(t)` above would print \"outer\". It throws because the inner `t` is already bound (hoisted) but uninitialised." },
      ] },
      { id: "tradeoffs", blocks: [
        { type: "list", items: [
          "Relying on function hoisting lets you order code top-down (public API first, helpers below) — a common, readable style.",
          "Relying on `var` hoisting is never worth it; declare before use.",
          "ESLint `no-use-before-define` catches TDZ issues statically.",
        ] },
      ] },
      { id: "interview-short", blocks: [
        { type: "p", text: "Hoisting means declarations are processed when a scope is entered, before any of its code runs. `var` bindings are created and initialised to `undefined`; function declarations are created with their full function value, so they can be called early; `let`, `const` and `class` are created but left uninitialised, and touching them before the declaration runs throws a ReferenceError — the temporal dead zone. Function expressions assigned to `var` behave like `var`, so calling them early gives \"is not a function\"." },
      ] },
      { id: "interview-deep", blocks: [
        { type: "p", text: "Map it onto FunctionDeclarationInstantiation: parameters, then `var`s initialised to undefined, then function objects created (capturing the environment), then lexical bindings created uninitialised. Point out the TDZ is temporal (calls after initialisation are fine), that default parameters have their own TDZ, and that `typeof` does not protect you." },
      ] },
      { id: "summary", blocks: [{ type: "list", items: [
        "Hoisting = bindings created at scope entry.",
        "`var` → undefined; function declaration → function; `let`/`const`/`class` → uninitialised (TDZ).",
        "TDZ is about time, not position.",
        "Function expressions and arrows follow their variable's rules.",
      ] }] },
    ],
    glossary: [
      { term: "Hoisting", definition: "The observable effect of creating a scope's bindings before executing its statements." },
      { term: "Declaration instantiation", definition: "Spec algorithms (e.g. FunctionDeclarationInstantiation) that create bindings when a scope is entered." },
      { term: "Creation phase", definition: "Informal name for declaration instantiation; contrasted with the execution phase." },
      { term: "TDZ", definition: "Temporal dead zone: a `let`/`const`/`class` binding exists but cannot be read or written until its declaration runs." },
    ],
    followUps: [
      { q: "Are arrow functions hoisted?", a: "Only as whatever variable holds them. `const f = () => {}` is in the TDZ before that line; with `var`, `f` is `undefined`." },
      { q: "Why does `console.log(foo)` print the function and not undefined when both `var foo` and `function foo` exist?", a: "Function declarations are instantiated after vars and overwrite the binding's initial `undefined` with the function object; the `var foo` declaration itself doesn't reset it." },
      { q: "Are imports hoisted?", a: "Yes. Module linking binds all imports before the module body runs, so `import` statements are effective anywhere in the file." },
    ],
    quiz: [
      { id: "ho-1", prompt: "What is logged?", code: { lang: "js", code: `var x = 1;
function f() {
  console.log(x);
  var x = 2;
}
f();` }, options: ["1", "2", "undefined", "ReferenceError"], answer: 2, explanation: "The local `var x` is hoisted within `f` and initialised to undefined, shadowing the global `x`." },
      { id: "ho-2", prompt: "What happens?", code: { lang: "js", code: `const p = new Person();
class Person {}` }, options: ["Creates a Person", "TypeError", "ReferenceError", "undefined"], answer: 2, explanation: "Class declarations are hoisted but uninitialised (TDZ)." },
      { id: "ho-3", prompt: "What is logged?", code: { lang: "js", code: `console.log(typeof foo);
var foo = 1;
function foo() {}` }, options: ["\"undefined\"", "\"number\"", "\"function\"", "ReferenceError"], answer: 2, explanation: "At instantiation the function declaration wins; the assignment `foo = 1` has not yet run at the log." },
    ],
    questions: ["javascript/js-05", "javascript/js-06"],
  },
  {
    slug: "execution-context",
    track: "javascript",
    title: "Execution contexts and lexical environments",
    summary: "The engine's bookkeeping for running code: execution contexts on a stack, each pointing at environment records chained by outer references — the machinery behind scope, hoisting, closures and `this`.",
    level: "intermediate",
    frequency: "high",
    minutes: 40,
    kinds: ["theory", "visualization", "quiz"],
    status: "authored",
    prerequisites: ["javascript/scope", "javascript/hoisting-tdz"],
    related: ["javascript/call-stack", "javascript/closures", "javascript/this-binding", "javascript/event-loop"],
    tags: ["execution-context", "lexical-environment", "environment-record", "creation-phase", "realm"],
    sources: [],
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: [
        "Define an execution context and list its key components (LexicalEnvironment, VariableEnvironment, Realm, Function, this via the function environment)",
        "Distinguish the kinds of environment records: declarative, function, object, global, module",
        "Trace the creation phase and execution phase for a function call",
        "Explain how `[[Environment]]` + `[[OuterEnv]]` produce lexical scope and closures",
      ] }] },
      { id: "prerequisites", blocks: [{ type: "p", text: "Read [Scope](/paths/javascript/scope) and [Hoisting & TDZ](/paths/javascript/hoisting-tdz) first; this lesson explains the machinery underneath both." }] },
      { id: "intuition", blocks: [
        { type: "p", text: "Whenever JavaScript starts running a piece of code — the whole script, a function call, a module — it creates a small *workspace* for it: \"which variables exist here, what is `this`, and where should I look next if a name is missing?\". That workspace is an **execution context**. Calls push new workspaces; returns pop them." },
        { type: "p", text: "The variables themselves live in **environment records** — think of them as dictionaries with a pointer to the enclosing dictionary. The execution context just points at the current one." },
      ] },
      { id: "definition", blocks: [
        { type: "p", text: "An **execution context** is a spec device that tracks the runtime evaluation of code. Kinds: the **global** context (one per realm/script run), **function** contexts (one per call), **module** contexts, and `eval` contexts." },
        { type: "table", head: ["Component", "What it holds"], rows: [
          ["Code evaluation state", "Where to resume (needed for generators and `await`)"],
          ["Function", "The function object being run (null for scripts/modules)"],
          ["Realm", "The set of intrinsics (`Array`, `Object.prototype`…) and the global object; each iframe/worker has its own realm"],
          ["ScriptOrModule", "The script or module record the code came from"],
          ["LexicalEnvironment", "The environment record used to resolve identifiers right now (changes as blocks are entered and exited)"],
          ["VariableEnvironment", "The environment record holding `var` bindings for this context"],
          ["PrivateEnvironment", "The `#private` names visible (inside class bodies)"],
        ] },
        { type: "table", head: ["Environment record", "Created for", "Holds"], rows: [
          ["Declarative", "Blocks, `catch`, functions (as base)", "`let`, `const`, `class`, parameters, inner functions"],
          ["Function", "Each call of a non-arrow function", "Declarative bindings + `[[ThisValue]]`, `[[NewTarget]]`, `[[FunctionObject]]`"],
          ["Object", "`with` statements; the var half of the global record", "Bindings backed by an object's properties"],
          ["Global", "The realm's global scope", "Object record (global object: `var`, function decls) + declarative record (`let`/`const`/`class`)"],
          ["Module", "Each ES module", "Top-level bindings and *live* import bindings"],
        ] },
        { type: "p", text: "Older articles (and the ES5 spec) call these **lexical environments**; since ES2015 the spec talks about environment records with an `[[OuterEnv]]` field. Same idea." },
      ] },
      { id: "why", blocks: [
        { type: "p", text: "Every \"weird\" behaviour interviewers probe — hoisting, the TDZ, closures retaining variables, `this` depending on the call site, the call stack overflowing — is a direct consequence of these structures. Learn the model once and the puzzles become mechanical." },
      ] },
      { id: "internals", blocks: [
        { type: "p", text: "**Function creation.** When a function expression or declaration is evaluated, the engine creates a function object and stores the *current* LexicalEnvironment in its `[[Environment]]` slot. Arrow functions additionally have `[[ThisMode]]` lexical." },
        { type: "p", text: "**Function call** ([[Call]] → PrepareForOrdinaryCall → OrdinaryCallBindThis → FunctionDeclarationInstantiation):" },
        { type: "steps", steps: [
          { title: "1. New execution context", detail: "Created and pushed onto the execution context stack (the call stack); it becomes the *running* execution context." },
          { title: "2. New function environment", detail: "A function environment record is created with `[[OuterEnv]]` = the callee's `[[Environment]]` (where it was *defined*, not where it is called)." },
          { title: "3. Bind this", detail: "For non-arrow functions, `[[ThisValue]]` is set from the call (receiver, `undefined`, or the global object in sloppy mode). Arrow functions skip this; their environment has no `this` binding." },
          { title: "4. Creation phase (declaration instantiation)", detail: "Parameters, `arguments` (non-arrow, if used), `var`s (→ undefined), function declarations (→ function objects), lexical declarations (uninitialised)." },
          { title: "5. Execution phase", detail: "Statements run. Entering a block creates a new declarative record whose outer is the current one, and LexicalEnvironment temporarily points at it." },
          { title: "6. Return", detail: "The context is popped; the caller's context resumes. The environment record is *not* destroyed if something (a closure) still references it — it is simply garbage-collected once unreachable." },
        ] },
        { type: "callout", tone: "spec-vs-impl", title: "V8 materialises only what escapes", text: "Spec environment records are a model. V8 performs scope analysis at parse time: variables never referenced by an inner function live in registers/stack slots of the bytecode frame, and only *captured* variables are allocated in a heap `Context` object linked to its parent context. Functions with `eval` or `with` force everything into contexts. This is why closures cost memory proportional to what they capture, not to the whole scope." },
      ] },
      { id: "walkthrough", blocks: [
        { type: "code", lang: "js", runnable: true, code: `const greeting = "hello";
function makeGreeter(name) {
  const punctuation = "!";
  return function () {
    return greeting + ", " + name + punctuation;
  };
}
const greetAda = makeGreeter("Ada");
console.log(greetAda());`, output: `hello, Ada!` },
        { type: "steps", steps: [
          { title: "Global creation phase", detail: "Global record gets `makeGreeter` (function object, `[[Environment]]` = global) and uninitialised `greeting`, `greetAda`." },
          { title: "Global execution", detail: "`greeting` initialised to \"hello\". `makeGreeter(\"Ada\")` is called." },
          { title: "makeGreeter context", detail: "Pushed. Function env E1 { name: \"Ada\", punctuation: ⟂ }, outer = global. Executes: punctuation = \"!\"; the anonymous function is created with `[[Environment]]` = E1." },
          { title: "Return", detail: "makeGreeter's context is popped, but E1 is still referenced by the returned function, so it survives." },
          { title: "greetAda() context", detail: "Pushed. New env E2 {}, outer = E1. Resolving `name` and `punctuation` finds them in E1; `greeting` in global." },
        ] },
      ] },
      { id: "visualization", blocks: [
        { type: "p", text: "The hoisting visualization shows the creation phase filling an environment record and the execution phase updating it; pair it with the steps above to see the context stack push and pop." },
        { type: "viz", id: "js-hoisting", caption: "Conceptual: environment record contents during creation vs execution." },
      ] },
      { id: "memory", title: "Memory view", blocks: [
        { type: "p", text: "Execution contexts are short-lived (one per active call). Environment records may outlive their context when captured. A useful mental picture:" },
        { type: "flow", nodes: ["greetAda (function object)", "[[Environment]] → E1 { name, punctuation }", "[[OuterEnv]] → Global { greeting, makeGreeter, greetAda }"], caption: "Conceptual chain of environment records kept alive by a closure." },
      ] },
      { id: "edge-cases", blocks: [
        { type: "list", items: [
          "Each iframe/worker has its own realm: `[] instanceof otherFrame.Array` is false because the `Array.prototype`s differ.",
          "Generators and async functions *suspend* their execution context (removing it from the stack) and later push it back — their code evaluation state makes resumption possible.",
          "Direct `eval` runs in the caller's context and can add `var`s to it in sloppy mode; strict-mode `eval` gets its own variable environment.",
        ] },
      ] },
      { id: "mistakes", blocks: [
        { type: "callout", tone: "misconception", title: "\"The scope chain follows the call stack\"", text: "The call stack is a stack of execution contexts; the scope chain is a chain of environment records linked by *definition site*. They coincide only for functions defined where they're called." },
      ] },
      { id: "tradeoffs", blocks: [
        { type: "list", items: [
          "Closures are cheap in modern engines but each captured variable becomes heap-allocated and kept alive as long as the closure is.",
          "`eval`/`with` disable static scope resolution and optimisations.",
        ] },
      ] },
      { id: "interview-short", blocks: [
        { type: "p", text: "An execution context is the environment in which code runs: there's a global one, and a new one is created and pushed on the call stack for each function call. Each has a lexical environment — an environment record holding the bindings plus a reference to the outer environment — and a `this` binding. Creation happens in two stages: declaration instantiation (parameters, `var` → undefined, function declarations, uninitialised `let`/`const`) and then execution. The outer reference comes from where the function was defined, which is why scope is lexical and closures work." },
      ] },
      { id: "interview-deep", blocks: [
        { type: "p", text: "Cover the components (LexicalEnvironment vs VariableEnvironment, Realm, PrivateEnvironment), record types (declarative, function with `[[ThisValue]]`, object, global split, module with live bindings), the `[[Environment]]` slot on function objects, suspension for generators/async, and V8's context allocation of captured variables only." },
      ] },
      { id: "summary", blocks: [{ type: "list", items: [
        "Execution context = bookkeeping for running code; stack of them = call stack.",
        "Environment records hold bindings and link outward via `[[OuterEnv]]`.",
        "Functions capture their creation environment in `[[Environment]]`.",
        "Creation phase instantiates declarations; execution phase runs statements.",
        "Engines only heap-allocate captured variables (V8 detail).",
      ] }] },
    ],
    glossary: [
      { term: "Execution context", definition: "Spec structure tracking the evaluation of one script, module, function call or eval." },
      { term: "Execution context stack", definition: "The stack of active execution contexts; its top is the running context. Commonly called the call stack." },
      { term: "Environment record", definition: "A set of bindings for one scope plus a link to the outer environment." },
      { term: "[[Environment]]", definition: "Internal slot on a function object storing the environment in which it was created." },
      { term: "Realm", definition: "A global environment plus its set of intrinsic objects; each window, iframe and worker has its own." },
      { term: "Context (V8)", definition: "Heap object where V8 stores variables captured by closures (engine detail)." },
    ],
    followUps: [
      { q: "What's the difference between LexicalEnvironment and VariableEnvironment?", a: "VariableEnvironment holds `var` (and function) bindings for the whole function; LexicalEnvironment starts as the same record but is swapped for nested block records as blocks execute, holding `let`/`const`." },
      { q: "When is an environment record freed?", a: "When it becomes unreachable — typically when the call returns and no closure references it. It's ordinary garbage collection." },
      { q: "How do async functions fit in?", a: "At `await` the function's execution context is suspended and popped; a promise reaction job later resumes it, pushing it back onto the stack with its environment intact." },
    ],
    quiz: [
      { id: "ec-1", prompt: "When a function is called, its environment's outer reference is set to…", options: ["The caller's environment", "The global environment", "The environment where the function was created", "The prototype of the function"], answer: 2, explanation: "`[[OuterEnv]]` comes from the callee's `[[Environment]]`, captured at creation." },
      { id: "ec-2", prompt: "Which environment record kind has a `this` binding?", options: ["Declarative (block)", "Function (for non-arrow functions)", "Object record for `with`", "None — `this` is on the execution context only"], answer: 1, explanation: "Function environment records carry `[[ThisValue]]`; arrow functions' records don't bind `this`, so lookup continues outward. The global record also provides a `this` (the global this value)." },
    ],
    questions: ["javascript/js-05", "javascript/js-02", "javascript/js-03"],
  },
  {
    slug: "call-stack",
    track: "javascript",
    title: "The call stack",
    summary: "The LIFO stack of execution contexts: how calls push and returns pop, stack traces, stack overflow, and why the event loop waits for an empty stack.",
    level: "beginner",
    frequency: "high",
    minutes: 25,
    kinds: ["theory", "coding", "quiz"],
    status: "authored",
    prerequisites: ["javascript/execution-context"],
    related: ["javascript/event-loop", "javascript/recursion", "javascript/tail-calls", "javascript/error-handling"],
    tags: ["call-stack", "stack-overflow", "stack-trace", "lifo", "data-structures"],
    sources: [],
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: [
        "Trace the call stack for nested calls",
        "Explain stack overflow and its error in different engines",
        "Read a stack trace and know why async traces are partial",
        "Implement a stack data structure (a frequent companion interview question)",
      ] }] },
      { id: "intuition", blocks: [
        { type: "p", text: "A stack of plates: calling a function puts a plate (its execution context) on top; returning removes the top plate. Only the top plate is ever being worked on — JavaScript runs one thing at a time on a given thread." },
      ] },
      { id: "definition", blocks: [
        { type: "p", text: "The **call stack** is the spec's *execution context stack*: a last-in-first-out stack whose top element is the running execution context. A **stack frame** is the engine's physical representation of one entry (return address, arguments, locals/registers)." },
      ] },
      { id: "why", blocks: [
        { type: "list", items: [
          "Explains stack traces and debugging.",
          "Explains recursion limits and `RangeError`.",
          "Foundation of the event loop: callbacks run only when the stack is empty, so long synchronous work blocks everything.",
        ] },
      ] },
      { id: "internals", blocks: [
        { type: "steps", steps: [
          { title: "Script start", detail: "The global execution context is pushed." },
          { title: "Call", detail: "Arguments are evaluated, a new context is pushed and becomes running." },
          { title: "Return or throw", detail: "The context is popped. A throw unwinds frames until a `try/catch` handles it; if none does, the error is reported as uncaught (and the task ends)." },
          { title: "Empty stack", detail: "When the script finishes, the stack is empty and the event loop can run microtasks and the next task." },
        ] },
        { type: "callout", tone: "spec-vs-impl", title: "Stack size is engine- and platform-specific", text: "The spec sets no limit. V8 reserves a fixed native stack (around 1 MB on 64-bit by default, adjustable in Node with `--stack-size`), so the maximum depth depends on frame size — typically around ten thousand frames for small functions. Exceeding it throws `RangeError: Maximum call stack size exceeded` in V8; Firefox throws `InternalError: too much recursion`." },
        { type: "p", text: "**Async stack traces.** After an `await`, the original caller frames are gone (the function was resumed from a microtask). V8 reconstructs \"async stack traces\" by following the promise chain of `async` functions — zero-cost because it only walks when an error trace is captured. Plain `.then` callbacks and timers don't get this treatment." },
      ] },
      { id: "walkthrough", blocks: [
        { type: "code", lang: "js", runnable: true, code: `const trace = [];
function a() { trace.push("enter a"); b(); trace.push("exit a"); }
function b() { trace.push("enter b"); c(); trace.push("exit b"); }
function c() { trace.push("enter c"); trace.push("exit c"); }
a();
console.log(trace.join(" > "));`, output: `enter a > enter b > enter c > exit c > exit b > exit a` },
        { type: "table", head: ["Moment", "Stack (bottom → top)"], rows: [
          ["Calling a", "global, a"],
          ["Inside c", "global, a, b, c"],
          ["c returned", "global, a, b"],
          ["All done", "global → then empty"],
        ] },
      ] },
      { id: "examples", blocks: [
        { type: "code", lang: "js", runnable: true, caption: "Stack overflow (output from V8; Firefox reports InternalError)", code: `let depth = 0;
function recurse() { depth++; recurse(); }
try { recurse(); } catch (e) { console.log(e.name, depth > 1000); }`, output: `RangeError true` },
        { type: "code", lang: "js", runnable: true, caption: "Implementing a stack (interview companion)", code: `class Stack {
  #items = [];
  push(x) { this.#items.push(x); return this; }
  pop() {
    if (this.isEmpty()) throw new Error("stack underflow");
    return this.#items.pop();
  }
  peek() { return this.#items.at(-1); }
  isEmpty() { return this.#items.length === 0; }
  get size() { return this.#items.length; }
}
const s = new Stack().push(1).push(2).push(3);
console.log(s.pop(), s.peek(), s.size);`, output: `3 2 2` },
      ] },
      { id: "mistakes", blocks: [
        { type: "callout", tone: "misconception", title: "\"setTimeout(fn, 0) runs fn next\"", text: "It runs fn only after the current stack has fully unwound *and* pending microtasks have run, and after any earlier tasks." },
        { type: "callout", tone: "warning", title: "Catching RangeError to 'recover'", text: "After a stack overflow there is little stack left; recovering is fragile. Convert deep recursion to iteration with an explicit stack instead." },
      ] },
      { id: "tradeoffs", blocks: [
        { type: "compare", items: [
          { title: "Recursion", points: ["Natural for trees", "Limited depth; each frame costs memory", "No tail-call optimisation in V8/SpiderMonkey"] },
          { title: "Explicit stack (iteration)", points: ["Unlimited depth (heap-bounded)", "More code", "Easier to pause/resume"] },
        ] },
      ] },
      { id: "interview-short", blocks: [
        { type: "p", text: "The call stack is a LIFO structure of execution contexts. Calling a function pushes a frame, returning pops it, and the top is always the code currently running. JavaScript has one call stack per thread, so while it's non-empty nothing else — no event callbacks, no promise reactions — can run. Infinite or too-deep recursion exhausts it and throws a RangeError in V8." },
      ] },
      { id: "interview-deep", blocks: [
        { type: "p", text: "Connect it to the execution-context stack in the spec, engine frames, unwinding on throw, engine stack limits, async stack traces after `await`, and why the event loop processes tasks only on an empty stack." },
      ] },
      { id: "summary", blocks: [{ type: "list", items: [
        "One stack per thread; call = push, return/throw = pop.",
        "Stack overflow → RangeError (V8).",
        "Event loop runs queued work only on an empty stack.",
        "Use an explicit stack for deep traversals.",
      ] }] },
    ],
    glossary: [
      { term: "LIFO", definition: "Last in, first out." },
      { term: "Stack frame", definition: "Engine representation of one active call: return address, arguments, locals." },
      { term: "Unwinding", definition: "Popping frames while propagating an exception to the nearest handler." },
      { term: "Stack overflow", definition: "Exceeding the engine's stack limit, usually via unbounded recursion." },
    ],
    followUps: [
      { q: "Is there one call stack per tab?", a: "One per agent/thread: the main thread has one, each Web Worker has its own." },
      { q: "Why can't you see the caller in a stack trace after a setTimeout?", a: "The timer callback starts a fresh stack from the event loop; the scheduling frames are long gone. DevTools can stitch async traces for debugging." },
    ],
    quiz: [
      { id: "cs-1", prompt: "In what order are \"A\", \"B\", \"C\" logged?", code: { lang: "js", code: `setTimeout(() => console.log("A"), 0);
(function f() { console.log("B"); })();
console.log("C");` }, options: ["A B C", "B C A", "B A C", "A C B"], answer: 1, explanation: "The timer callback waits for the stack to empty; B and C are synchronous." },
      { id: "cs-2", prompt: "What does V8 throw on unbounded recursion?", options: ["StackOverflowError", "RangeError", "InternalError", "TypeError"], answer: 1, explanation: "V8: `RangeError: Maximum call stack size exceeded`. (Firefox: InternalError.)" },
    ],
    questions: ["javascript/js-50", "javascript/js-01", "javascript/js-42"],
  },
  outline({
    slug: "function-declarations-expressions",
    title: "Function declarations vs expressions",
    summary: "Declarations, expressions, named function expressions, arrow functions and methods — how they differ in hoisting, naming and `this`.",
    level: "beginner",
    frequency: "high",
    minutes: 20,
    prerequisites: ["javascript/hoisting-tdz"],
    related: ["javascript/arrow-functions", "javascript/iife", "javascript/this-binding"],
    tags: ["functions", "function-expression", "named-function-expression", "first-class"],
    sources: [],
    objectives: [
      "Tell a declaration from an expression by its position in the grammar",
      "Explain the hoisting difference (declaration fully hoisted, expression follows its variable)",
      "Use named function expressions for recursion and readable stack traces",
      "Know that functions are first-class objects with `name`, `length` and properties",
    ],
    covers: [
      "Declarations, expressions, arrows, method shorthand, `new Function` (and why to avoid it)",
      "Hoisting differences",
      "Name inference (`const f = () => {}` → `f.name === \"f\"`)",
      "Parameters: defaults, rest, `length`, `arguments`",
      "Functions as first-class values",
    ],
  }),
  {
    slug: "closures",
    track: "javascript",
    title: "Closures",
    summary: "A function bundled with the environment it was created in: how closures keep variables alive, what they really capture, the loop pitfall, real uses (privacy, once, memoize, debounce) and their memory cost.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 45,
    kinds: ["theory", "visualization", "coding", "quiz"],
    status: "authored",
    prerequisites: ["javascript/scope", "javascript/execution-context"],
    related: ["javascript/var-let-const", "javascript/higher-order-functions", "javascript/memoization", "javascript/debounce-throttle", "javascript/memory-leaks-gc", "javascript/iife", "javascript/currying"],
    tags: ["closures", "lexical-environment", "encapsulation", "loop-closure", "memory"],
    sources: [],
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: [
        "Define a closure precisely and explain why every JavaScript function is technically one",
        "Explain how a closure keeps an environment record alive after its function returns",
        "Show that closures capture *bindings* (live variables), not values — and fix the loop pitfall",
        "Use closures for private state, factories, `once`, memoization and partial application",
        "Reason about closure memory cost, including V8's shared-context retention",
      ] }] },
      { id: "prerequisites", blocks: [{ type: "p", text: "Know [lexical scope](/paths/javascript/scope) and the `[[Environment]]`/`[[OuterEnv]]` model from [Execution contexts](/paths/javascript/execution-context)." }] },
      { id: "intuition", blocks: [
        { type: "p", text: "A function in JavaScript carries a backpack. When it is created, it packs a reference to the scope it was born in. Wherever the function goes later — returned, stored, passed as a callback — it can still reach into that backpack and read or update those variables." },
        { type: "p", text: "The variables are not copied into the backpack; the backpack holds the *same* variables. If two functions share a backpack, they see each other's updates." },
      ] },
      { id: "definition", blocks: [
        { type: "p", text: "A **closure** is the combination of a function and the lexical environment in which it was declared. In spec terms: every function object has an `[[Environment]]` slot pointing to the environment record that was active when it was created; calling the function creates a new environment whose `[[OuterEnv]]` is that slot. As long as the function is reachable, so is that environment." },
        { type: "callout", tone: "note", title: "Every function is a closure", text: "Technically yes. In everyday speech, \"closure\" means a function that *uses* variables from an outer scope that has already finished executing." },
      ] },
      { id: "why", blocks: [
        { type: "list", items: [
          "**Encapsulation**: private state without classes (module pattern, factory functions).",
          "**Callbacks keep context**: event handlers, timers and promise callbacks read variables from where they were set up.",
          "**Function factories**: `makeAdder(5)`, partial application, currying.",
          "**Stateful utilities**: `once`, `memoize`, `debounce`, `throttle` all store state in a closure.",
          "React hooks rely on closures — and stale closures are a top React bug.",
        ] },
      ] },
      { id: "internals", blocks: [
        { type: "steps", steps: [
          { title: "Outer function is called", detail: "A function environment E is created holding the outer function's parameters and locals." },
          { title: "Inner function is created", detail: "Evaluating the inner function expression creates a function object whose `[[Environment]]` = E." },
          { title: "Outer function returns", detail: "Its execution context is popped. E is *not* freed, because the inner function object (now returned) still references it." },
          { title: "Inner function is called later", detail: "A fresh environment E2 is created with `[[OuterEnv]]` = E. Name lookups that miss E2 find the variables in E." },
          { title: "Garbage collection", detail: "When the inner function itself becomes unreachable, E becomes unreachable too and is collected." },
        ] },
        { type: "p", text: "**Bindings, not values.** Because E holds the variable itself, closures observe later changes and can make them (`count++`). Each *call* of the outer function creates a *new* E, which is why two counters made by the same factory are independent." },
        { type: "callout", tone: "spec-vs-impl", title: "What V8 actually keeps alive", text: "V8's parser determines which variables are referenced by inner functions. Only those are allocated in a heap `Context` object; the rest stay in the stack frame and die with it. However, **all closures created in the same scope share one Context**. If one closure captures a large object and a sibling closure is long-lived, the large object stays alive even though the long-lived closure never uses it. Engines are allowed to do this — the spec's model keeps the whole environment alive anyway." },
      ] },
      { id: "walkthrough", blocks: [
        { type: "code", lang: "js", runnable: true, code: `function makeCounter() {
  let count = 0;
  return { inc: () => ++count, get: () => count };
}
const c1 = makeCounter();
const c2 = makeCounter();
c1.inc(); c1.inc(); c2.inc();
console.log(c1.get(), c2.get());`, output: `2 1` },
        { type: "steps", steps: [
          { title: "`makeCounter()` #1", detail: "Creates environment E1 { count: 0 }. `inc` and `get` both capture E1." },
          { title: "`makeCounter()` #2", detail: "Creates a separate E2 { count: 0 } for c2's functions." },
          { title: "`c1.inc()` twice", detail: "Each call increments the *shared* E1.count → 2." },
          { title: "`c2.inc()`", detail: "E2.count → 1. E1 is untouched." },
          { title: "Reading", detail: "`c1.get()` reads E1.count (2); `c2.get()` reads E2.count (1). `count` is private: no code outside can reach it." },
        ] },
      ] },
      { id: "visualization", blocks: [
        { type: "p", text: "Step through a counter closure: watch `makeCounter`'s execution context pop off the stack while its environment record stays on the heap, pinned by the returned function. Then call the closure and see the new environment link to the retained one." },
        { type: "viz", id: "js-closure", caption: "Conceptual model of execution contexts and retained environment records." },
      ] },
      { id: "memory", title: "Memory view", blocks: [
        { type: "flow", nodes: ["c1 (object)", "inc / get (functions)", "[[Environment]] → E1 { count }", "global env"], caption: "Conceptual reachability chain: E1 lives as long as c1's functions are reachable." },
        { type: "p", text: "A closure's memory cost is the captured variables (and, in V8, everything in the shared Context). Long-lived closures — event listeners, intervals, caches — are the usual source of closure-related leaks." },
      ] },
      { id: "examples", blocks: [
        { type: "code", lang: "js", runnable: true, caption: "once(): state lives in the closure", code: `function once(fn) {
  let done = false, result;
  return function (...args) {
    if (!done) { done = true; result = fn.apply(this, args); }
    return result;
  };
}
const init = once(() => { console.log("init ran"); return 42; });
console.log(init(), init());`, output: `init ran
42 42` },
        { type: "code", lang: "js", runnable: true, caption: "The loop pitfall: one var binding vs per-iteration let bindings", code: `const withVar = [];
for (var i = 0; i < 3; i++) withVar.push(() => i);
console.log(withVar.map((f) => f()).join());

const withLet = [];
for (let j = 0; j < 3; j++) withLet.push(() => j);
console.log(withLet.map((f) => f()).join());`, output: `3,3,3
0,1,2` },
        { type: "code", lang: "js", runnable: true, caption: "Function factory (partial application)", code: `const makeAdder = (x) => (y) => x + y;
const add5 = makeAdder(5);
console.log(add5(1), add5(10), makeAdder(1)(1));`, output: `6 15 2` },
      ] },
      { id: "edge-cases", blocks: [
        { type: "list", items: [
          "**Stale closures**: a callback created during one render/iteration keeps reading *that* environment's variables. In React this shows up as an effect or interval seeing old state.",
          "Closures capture variables, not `this` (except arrow functions, which resolve `this` lexically too).",
          "`setTimeout` in a `var` loop: fix with `let`, an IIFE, or by passing the value as an argument.",
          "Closures created in a hot loop allocate a function object each time — usually fine, occasionally worth hoisting.",
        ] },
      ] },
      { id: "mistakes", blocks: [
        { type: "callout", tone: "misconception", title: "\"A closure copies the variables' values when it's created\"", text: "It references the live bindings. The `var` loop example would print 0,1,2 if values were copied." },
        { type: "callout", tone: "misconception", title: "\"Closures always leak memory\"", text: "They retain what they reference only while they are reachable. A leak is a *reachable-but-unneeded* closure, e.g. an event listener never removed." },
      ] },
      { id: "tradeoffs", blocks: [
        { type: "compare", items: [
          { title: "Closure-based privacy", points: ["Truly private, no syntax needed", "One set of functions per instance (more memory than prototype methods)", "Not inspectable/debuggable from outside"] },
          { title: "Class with #private fields", points: ["Methods shared on the prototype", "Also truly private (brand-checked)", "Requires `this` discipline"] },
        ] },
      ] },
      { id: "real-world", blocks: [
        { type: "list", items: [
          "Module pattern / IIFE modules before ES modules.",
          "Event handler factories: `button.addEventListener(\"click\", () => select(id))`.",
          "Memoization caches, debounce timers, rate limiters.",
          "Middleware and dependency injection (`(deps) => (req, res) => …`).",
        ] },
      ] },
      { id: "interview-short", blocks: [
        { type: "p", text: "A closure is a function together with the lexical environment it was created in. Because JavaScript functions store a reference to their defining scope, an inner function can keep reading and updating its outer function's variables even after the outer function has returned. It captures the variables themselves, not a snapshot, which is why `var` in a loop gives every callback the final value while `let` gives each iteration its own binding. Closures power private state, factories, callbacks, memoize and debounce." },
      ] },
      { id: "interview-deep", blocks: [
        { type: "p", text: "Explain `[[Environment]]` set at function creation and `[[OuterEnv]]` set at call time; that each outer call creates a fresh environment; the loop fix via CreatePerIterationEnvironment; the memory angle (environment reachable via the function, GC'd when the function is unreachable); and V8 specifics — only captured variables are context-allocated, and sibling closures share one Context, which can retain large objects unexpectedly." },
      ] },
      { id: "practice", blocks: [
        { type: "list", ordered: true, items: [
          "Write `makeCounter(start, step)` returning `{ next, reset }`.",
          "Write `once(fn)` and `memoize(fn)`.",
          "Fix a `var`-loop `setTimeout` bug three ways (let, IIFE, extra timer argument).",
          "Write `rateLimit(fn, n, ms)` allowing at most n calls per window.",
        ] },
      ] },
      { id: "summary", blocks: [{ type: "list", items: [
        "Closure = function + its creation environment.",
        "Environment survives as long as the function is reachable.",
        "Captures live bindings; each outer call makes a new environment.",
        "Uses: privacy, factories, callbacks, once/memoize/debounce.",
        "V8 allocates only captured variables in a shared Context per scope.",
      ] }] },
    ],
    glossary: [
      { term: "Closure", definition: "A function plus a reference to the lexical environment in which it was created." },
      { term: "Captured variable", definition: "A variable from an outer scope that an inner function references." },
      { term: "Stale closure", definition: "A closure still referencing an old environment whose values are outdated relative to newer state." },
      { term: "Module pattern", definition: "Using a function (often an IIFE) to create private state and return a public API object." },
      { term: "Context allocation", definition: "V8's placement of captured variables in a heap-allocated Context object (engine detail)." },
    ],
    followUps: [
      { q: "Can a closure modify an outer variable?", a: "Yes — it holds the binding, so `count++` inside the closure updates the variable for every function sharing that environment." },
      { q: "How do closures relate to React's stale-state bug?", a: "Each render creates new closures over that render's state. An effect or interval created once keeps the first render's closure; fix with dependency arrays, functional updates or refs." },
      { q: "Do closures hurt performance?", a: "Rarely meaningfully. Costs are an allocation per created closure plus heap-allocated captured variables. Avoid creating them in extremely hot paths and avoid capturing large objects in long-lived callbacks." },
    ],
    quiz: [
      { id: "cl-1", prompt: "What is logged?", code: { lang: "js", code: `function f() {
  let x = 1;
  const g = () => x;
  x = 2;
  return g;
}
console.log(f()());` }, options: ["1", "2", "undefined", "ReferenceError"], answer: 1, explanation: "`g` references the binding `x`, which is 2 by the time `g` runs." },
      { id: "cl-2", prompt: "Which change makes the loop print 0 1 2?", code: { lang: "js", code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i));
}` }, options: ["Use `const` instead of `var`", "Use `let` instead of `var`", "Use `setTimeout(..., 0)`", "Wrap in `try/finally`"], answer: 1, explanation: "`let` creates a new binding per iteration. `const` would throw on `i++`." },
      { id: "cl-3", prompt: "Two closures created in the same function call…", options: ["Each get a private copy of the variables", "Share the same environment record", "Cannot access `let` variables", "Are garbage-collected when the function returns"], answer: 1, explanation: "Both reference the same environment, so they see each other's updates." },
    ],
    questions: ["javascript/js-02", "javascript/js-26"],
  },
  outline({
    slug: "recursion",
    title: "Recursion",
    summary: "Functions that call themselves: base cases, the call stack cost, recursion over trees and nested data, and converting recursion to iteration.",
    level: "intermediate",
    frequency: "medium",
    minutes: 25,
    kinds: ["theory", "coding"],
    prerequisites: ["javascript/call-stack"],
    related: ["javascript/tail-calls", "javascript/deep-copy", "javascript/memoization", "dsa/recursion"],
    tags: ["recursion", "base-case", "stack-overflow", "trees"],
    sources: [],
    objectives: [
      "Write recursive functions with explicit base cases and progress toward them",
      "Trace the call stack of a recursive call and estimate its depth",
      "Recurse over nested arrays/objects (flatten, deep clone, tree walk)",
      "Convert recursion to iteration with an explicit stack when depth is unbounded",
    ],
    covers: [
      "Base case + recursive case; mutual recursion",
      "Call-stack growth and overflow limits",
      "Memoizing overlapping subproblems (fibonacci)",
      "Recursion over DOM trees and JSON",
      "Why JS engines (except Safari's JavaScriptCore) don't do proper tail calls",
    ],
  }),
  outline({
    slug: "iife",
    title: "IIFEs (immediately invoked function expressions)",
    summary: "Running a function expression immediately to create a private scope — the pre-module way to avoid globals, and where it is still useful.",
    level: "beginner",
    frequency: "medium",
    minutes: 15,
    prerequisites: ["javascript/function-declarations-expressions", "javascript/closures"],
    related: ["javascript/modules", "javascript/singleton"],
    tags: ["iife", "module-pattern", "scope"],
    sources: [],
    objectives: [
      "Explain why the wrapping parentheses are needed (expression vs declaration)",
      "Use an IIFE to create private state (the module pattern)",
      "Use an async IIFE to `await` where top-level await is unavailable",
      "Recognise the ASI hazard of starting a line with `(`",
    ],
    covers: [
      "Syntax variants: `(function(){})()`, `(() => {})()`, `!function(){}()`",
      "Module pattern and revealing module pattern",
      "The pre-`let` loop fix",
      "Async IIFE vs top-level await",
    ],
  }),
  outline({
    slug: "higher-order-functions",
    title: "Higher-order functions",
    summary: "Functions that take or return functions: callbacks, composition, decorators-as-wrappers and function factories.",
    level: "beginner",
    frequency: "high",
    minutes: 20,
    kinds: ["theory", "coding"],
    prerequisites: ["javascript/closures"],
    related: ["javascript/map-filter-reduce", "javascript/currying", "javascript/memoization", "javascript/debounce-throttle"],
    tags: ["higher-order-functions", "first-class-functions", "composition"],
    sources: [],
    objectives: [
      "Define first-class and higher-order functions",
      "Write wrappers (`logged`, `once`, `memoize`) that forward `this` and arguments",
      "Compose functions with `compose`/`pipe`",
      "Explain the trade-off between abstraction and readability/performance",
    ],
    covers: [
      "Functions as values; callbacks as arguments; returning functions",
      "Built-in HOFs (array methods, `setTimeout`, `addEventListener`)",
      "Wrapping functions correctly (`fn.apply(this, args)`)",
      "compose/pipe, point-free style",
    ],
    questions: ["javascript/js-08", "javascript/js-15"],
  }),
  outline({
    slug: "map-filter-reduce",
    title: "map, filter and reduce",
    summary: "The three core array transformations: what each returns, how `reduce` works with and without an initial value, and implementing them yourself.",
    level: "beginner",
    frequency: "very-high",
    minutes: 20,
    kinds: ["theory", "coding"],
    prerequisites: ["javascript/higher-order-functions", "javascript/arrays-iteration"],
    related: ["javascript/higher-order-functions"],
    tags: ["map", "filter", "reduce", "arrays", "polyfill"],
    sources: [],
    objectives: [
      "State what each returns (new array of same length / subset / single accumulated value)",
      "Explain `reduce` without an initial value (first element is the accumulator; empty array throws TypeError)",
      "Write polyfills for all three, including skipping holes and passing `(value, index, array)`",
      "Know the `['1','2','3'].map(parseInt)` gotcha",
    ],
    covers: [
      "Callback signature and `thisArg`",
      "Chaining vs a single `reduce` (readability vs passes)",
      "Polyfills and hole handling",
      "Async callbacks: `map` returns promises; combine with `Promise.all`",
    ],
    questions: ["javascript/js-15", "javascript/js-08"],
  }),
  outline({
    slug: "currying",
    title: "Currying and partial application",
    summary: "Transforming `f(a, b, c)` into `f(a)(b)(c)`, a generic `curry` implementation based on `fn.length`, and when partial application is genuinely useful.",
    level: "intermediate",
    frequency: "high",
    minutes: 20,
    kinds: ["theory", "coding"],
    prerequisites: ["javascript/closures", "javascript/higher-order-functions"],
    related: ["javascript/call-apply-bind"],
    tags: ["currying", "partial-application", "closures"],
    sources: [],
    objectives: [
      "Distinguish currying from partial application",
      "Implement a generic `curry(fn)` using `fn.length` and closures",
      "Implement infinite currying like `sum(1)(2)(3)()`",
      "Know `fn.length` caveats (defaults and rest parameters are not counted)",
    ],
    covers: [
      "Definitions and the closure mechanics behind them",
      "Generic curry; placeholder variants",
      "Partial application with `bind`",
      "Use cases: configuration, event handlers, functional pipelines",
    ],
    questions: ["javascript/js-27"],
  }),
  {
    slug: "this-binding",
    track: "javascript",
    title: "this: the four binding rules (and lexical this)",
    summary: "`this` is decided by how a function is called — new, explicit (call/apply/bind), implicit (method call) or default — except in arrow functions, which take it from the enclosing scope.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 40,
    kinds: ["theory", "visualization", "quiz"],
    status: "authored",
    prerequisites: ["javascript/execution-context", "javascript/function-declarations-expressions"],
    related: ["javascript/call-apply-bind", "javascript/arrow-functions", "javascript/classes-inheritance", "javascript/prototypes"],
    tags: ["this", "binding", "strict-mode", "method", "lexical-this"],
    sources: [LYDIA],
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: [
        "Determine `this` for any call using the precedence: `new` > explicit (`bind`/`call`/`apply`) > implicit (method call) > default",
        "Explain why extracting a method loses `this` and how to fix it",
        "Explain the strict vs sloppy default binding and `this` at the top level of scripts vs modules",
        "Explain lexical `this` in arrow functions and class field arrows",
      ] }] },
      { id: "prerequisites", blocks: [{ type: "p", text: "Know that a function call creates an execution context with a function environment record ([Execution contexts](/paths/javascript/execution-context)) — `this` lives in that record." }] },
      { id: "intuition", blocks: [
        { type: "p", text: "`this` is an *implicit parameter*. Most parameters are given in the parentheses; `this` is given by the **call site** — usually the object to the left of the dot. The same function can receive different `this` values on different calls, just like different arguments." },
        { type: "p", text: "Arrow functions don't have that implicit parameter at all, so a `this` inside them means whatever `this` meant in the surrounding code." },
      ] },
      { id: "definition", blocks: [
        { type: "table", head: ["Rule (highest precedence first)", "Call shape", "`this` is"], rows: [
          ["1. `new` binding", "`new Fn()`", "The newly created object"],
          ["2. Explicit binding", "`fn.call(obj)`, `fn.apply(obj)`, `fn.bind(obj)()`", "`obj` (a bound function ignores later call/apply)"],
          ["3. Implicit binding", "`obj.fn()` / `obj[\"fn\"]()`", "`obj` — the base of the member expression"],
          ["4. Default binding", "`fn()`", "`undefined` in strict mode; the global object in sloppy mode"],
          ["Arrow functions", "any", "The `this` of the enclosing scope (lexical), regardless of call shape"],
        ] },
        { type: "p", text: "`new` beats `bind`: calling `new` on a bound function ignores the bound `this` (but keeps bound arguments)." },
      ] },
      { id: "why", blocks: [
        { type: "p", text: "`this` makes one function reusable across many objects (prototype methods are shared by all instances). The price is that `this` is *not* fixed — passing `obj.method` as a callback is the single most common source of `this` bugs." },
      ] },
      { id: "internals", blocks: [
        { type: "steps", steps: [
          { title: "Evaluating the call expression", detail: "For `obj.fn()`, evaluating `obj.fn` yields a *Reference* whose base is `obj`. The call uses that base as thisValue. For a plain `fn()` the base is an environment record, which supplies `undefined`." },
          { title: "[[Call]] → OrdinaryCallBindThis", detail: "If the function's `[[ThisMode]]` is *lexical* (arrow), nothing is bound. If *strict*, thisValue is used as-is. If sloppy, `null`/`undefined` become the global object and primitives are boxed (`5` → `Number {5}`)." },
          { title: "Stored in the function environment record", detail: "`[[ThisValue]]` is set on the new function environment. Evaluating `this` calls ResolveThisBinding, which walks outward to the nearest environment that *has* a this binding — for an arrow, that's the enclosing function's (or the global/module) environment." },
          { title: "`new`", detail: "[[Construct]] creates an object whose prototype is `Fn.prototype` (for base constructors), binds it as `this`, and returns it unless the constructor returns another object. Derived class constructors start with `this` uninitialised until `super()` returns." },
        ] },
        { type: "p", text: "Top level: in a classic script `this` is the global object (`window`, or `self` in a worker); in an ES module it is `undefined`; in Node CommonJS it is `module.exports`." },
      ] },
      { id: "walkthrough", blocks: [
        { type: "code", lang: "js", runnable: true, code: `"use strict";
const user = {
  name: "Ada",
  regular() { return this?.name; },
  arrow: () => this === user,
  delayed() { return [1].map(function () { return this; })[0]; },
  delayedArrow() { return [1].map(() => this.name)[0]; },
};
console.log(user.regular());       // implicit
const detached = user.regular;
console.log(detached());            // default (strict) → undefined
console.log(user.arrow());          // lexical: outer this, not user
console.log(user.delayed());        // callback called plainly
console.log(user.delayedArrow());   // arrow inherits method's this
const bound = user.regular.bind({ name: "Grace" });
console.log(bound(), bound.call({ name: "Linus" }));`, output: `Ada
undefined
false
undefined
Ada
Grace Grace` },
        { type: "steps", steps: [
          { title: "`user.regular()`", detail: "Implicit binding: base object `user`." },
          { title: "`detached()`", detail: "No base object, strict mode → `this` is undefined, `this?.name` is undefined." },
          { title: "`user.arrow()`", detail: "The arrow was created in the module/script top level, so `this` is that outer value — never `user`. Object literals do not create a scope for `this`." },
          { title: "`user.delayed()`", detail: "`map` calls the regular callback without a receiver (no `thisArg`), so `this` is undefined." },
          { title: "`user.delayedArrow()`", detail: "The arrow resolves `this` from `delayedArrow`'s environment, which is `user`." },
          { title: "`bound.call(…)`", detail: "Explicit binding via `bind` wins permanently; later `call` cannot override it." },
        ] },
      ] },
      { id: "visualization", blocks: [
        { type: "p", text: "Pick a call shape and the visualization highlights which rule fires and what `this` resolves to. The table above encodes the same decision procedure." },
        { type: "viz", id: "js-this", caption: "Conceptual decision procedure for this binding." },
      ] },
      { id: "examples", blocks: [
        { type: "code", lang: "js", runnable: true, caption: "Losing this when passing methods, and the class-field arrow fix", code: `class Button {
  constructor() { this.label = "OK"; }
  handle() { return this?.label; }
  handleArrow = () => this.label;
}
const b = new Button();
const h = b.handle, ha = b.handleArrow;
console.log(h(), ha());`, output: `undefined OK` },
        { type: "code", lang: "js", runnable: true, caption: "new beats bind", code: `function Person(name) { this.name = name; }
const BoundPerson = Person.bind({ name: "ignored" });
const p = new BoundPerson("Barbara");
console.log(p.name, p instanceof Person);`, output: `Barbara true` },
      ] },
      { id: "edge-cases", blocks: [
        { type: "list", items: [
          "Nested member access: in `a.b.c()`, `this` is `a.b`, not `a`.",
          "`(0, obj.fn)()` and `(obj.fn = obj.fn)()` drop the base, so default binding applies; plain `(obj.fn)()` keeps it.",
          "DOM event listeners (non-arrow) receive the element as `this` (`event.currentTarget`).",
          "Array methods accept a `thisArg` (`arr.map(fn, ctx)`), ignored by arrows.",
          "Sloppy mode boxes primitives: `fn.call(5)` gives `Number {5}`; strict mode keeps `5`.",
          "Class bodies are always strict, so extracted class methods get `undefined`, not `window`.",
        ] },
      ] },
      { id: "mistakes", blocks: [
        { type: "callout", tone: "misconception", title: "\"this refers to the function itself\" / \"this is the object where the function is defined\"", text: "Neither. For regular functions it's determined by the call; for arrows, by the enclosing scope." },
        { type: "callout", tone: "warning", title: "Arrow functions as object methods", text: "`{ name: \"x\", greet: () => this.name }` does not see the object. Use method shorthand for methods; use arrows for callbacks *inside* methods." },
      ] },
      { id: "tradeoffs", blocks: [
        { type: "compare", items: [
          { title: "Prototype method + bind at use site", points: ["One function shared by all instances", "Must remember to bind/wrap when passing"] },
          { title: "Class field arrow", points: ["Always bound, safe to pass", "One function per instance (memory)", "Not on the prototype: harder to override/mock"] },
        ] },
      ] },
      { id: "interview-short", blocks: [
        { type: "p", text: "`this` is determined by how a function is called. With `new`, it's the new object. With `call`, `apply` or `bind`, it's the object you pass. When called as a method, `obj.fn()`, it's `obj`. Otherwise it's `undefined` in strict mode or the global object in sloppy mode. Arrow functions don't have their own `this`; they use the `this` of the scope they were defined in, which makes them ideal for callbacks inside methods but wrong as object methods." },
      ] },
      { id: "interview-deep", blocks: [
        { type: "p", text: "Explain it via References (the base value of a member expression), `[[ThisMode]]` (lexical/strict/global), OrdinaryCallBindThis (boxing and global substitution in sloppy mode), ResolveThisBinding walking to the nearest environment with a this binding, `[[Construct]]` and derived-class `super()` initialisation, and why bound functions ignore later call/apply but not `new`." },
      ] },
      { id: "summary", blocks: [{ type: "list", items: [
        "Precedence: new > explicit > implicit > default.",
        "Default: undefined (strict) or global (sloppy).",
        "Arrows: lexical this; can't be changed by call/apply/bind.",
        "Extracting methods loses `this` — bind, wrap, or use field arrows.",
      ] }] },
    ],
    glossary: [
      { term: "Call site", definition: "The place in code where a function is invoked; its shape determines `this` for regular functions." },
      { term: "Implicit binding", definition: "`this` set to the object a method was accessed on (`obj.fn()`)." },
      { term: "Explicit binding", definition: "`this` set via `call`, `apply` or `bind`." },
      { term: "Default binding", definition: "`this` for a plain call: undefined in strict mode, the global object in sloppy mode." },
      { term: "Lexical this", definition: "Arrow functions' behaviour of resolving `this` from the enclosing scope." },
      { term: "Strict mode", definition: "Opt-in restricted variant of JS (`'use strict'`, modules and classes are always strict)." },
    ],
    followUps: [
      { q: "What is `this` inside a `setTimeout` callback?", a: "Regular function: the timer calls it without a receiver — in browsers HTML specifies `this` as the global object (window) even in strict mode for setTimeout callbacks; in Node it's the Timeout object. Use an arrow to inherit the outer `this`." },
      { q: "Can you change an arrow function's `this` with `call`?", a: "No. The first argument is ignored because arrows have no this binding." },
      { q: "What does `this` refer to in a static method?", a: "The class (constructor) it was called on — `this` in `static create()` is the class, so subclasses calling it get themselves." },
    ],
    quiz: [
      { id: "th-1", prompt: "What is logged (strict mode)?", code: { lang: "js", code: `const obj = {
  x: 1,
  get() { return this.x; },
};
const fn = obj.get;
console.log(fn?.call(obj), obj.get());` }, options: ["1 1", "undefined 1", "TypeError", "1 undefined"], answer: 0, explanation: "`call(obj)` explicitly binds `obj`; the method call implicitly binds it." },
      { id: "th-2", prompt: "Which rule has the highest precedence?", options: ["Implicit", "Explicit (bind)", "new", "Default"], answer: 2, explanation: "`new` overrides even a bound `this`." },
      { id: "th-3", prompt: "What is logged?", code: { lang: "js", code: `const counter = {
  n: 0,
  start() {
    [1, 2, 3].forEach(() => this.n++);
    return this.n;
  },
};
console.log(counter.start());` }, options: ["0", "3", "NaN", "TypeError"], answer: 1, explanation: "The arrow callbacks inherit `start`'s `this`, which is `counter`." },
    ],
    questions: ["javascript/js-03", "javascript/js-29", "javascript/js-23"],
  },
  {
    slug: "call-apply-bind",
    track: "javascript",
    title: "call, apply and bind",
    summary: "Explicitly setting `this` (and arguments): how the three methods differ, how bound functions work internally, and how to polyfill them.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 30,
    kinds: ["theory", "coding", "visualization", "quiz"],
    status: "authored",
    prerequisites: ["javascript/this-binding"],
    related: ["javascript/arrow-functions", "javascript/currying", "javascript/symbols"],
    tags: ["call", "apply", "bind", "this", "polyfill", "partial-application"],
    sources: [],
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: [
        "Use `call` (args listed), `apply` (args as array-like) and `bind` (returns a new function)",
        "Explain bound function exotic objects: fixed `this`, preset arguments, `name`/`length`, behaviour with `new`",
        "Write polyfills for `call` and `bind`",
        "Borrow methods (e.g. `Array.prototype.slice.call(arguments)`) and know modern alternatives",
      ] }] },
      { id: "intuition", blocks: [
        { type: "p", text: "`this` is normally supplied by the call site. These three methods let *you* supply it. `call` and `apply` invoke immediately; `bind` makes a new function with `this` (and optionally some leading arguments) locked in, to call later." },
      ] },
      { id: "definition", blocks: [
        { type: "table", head: ["Method", "Signature", "Invokes now?", "Returns"], rows: [
          ["`call`", "`fn.call(thisArg, a, b)`", "Yes", "fn's return value"],
          ["`apply`", "`fn.apply(thisArg, [a, b])`", "Yes", "fn's return value"],
          ["`bind`", "`fn.bind(thisArg, a)`", "No", "A new bound function"],
        ] },
        { type: "p", text: "Mnemonic: **a**pply takes an **a**rray, **c**all takes **c**ommas." },
      ] },
      { id: "why", blocks: [
        { type: "list", items: [
          "Passing methods as callbacks without losing `this` (`el.addEventListener(\"click\", this.onClick.bind(this))`).",
          "Method borrowing: using a function from one prototype on another object.",
          "Partial application: `bind(null, presetArg)`.",
          "Forwarding calls in wrappers (`fn.apply(this, args)` in memoize/debounce).",
        ] },
      ] },
      { id: "internals", blocks: [
        { type: "p", text: "`call`/`apply` simply perform the internal `[[Call]]` with the given thisArg and argument list; the callee's `[[ThisMode]]` then decides what happens (strict keeps it as-is, sloppy boxes primitives and turns null/undefined into the global object, arrows ignore it)." },
        { type: "p", text: "`bind` creates a **bound function exotic object** with internal slots `[[BoundTargetFunction]]`, `[[BoundThis]]` and `[[BoundArguments]]`. Calling it calls the target with `[[BoundThis]]` and `[[BoundArguments]]` prepended to the new arguments. Because the bound `this` is applied inside, a later `call`/`apply`/`bind` on the bound function cannot change it. Its `[[Construct]]` (present only if the target is a constructor) ignores `[[BoundThis]]` and constructs the target — which is why `new` beats `bind`." },
        { type: "p", text: "Bound functions get `name` = `\"bound \" + target.name` and `length` = max(0, target.length − number of bound args). They have no `prototype` property; `instanceof` checks delegate to the target." },
      ] },
      { id: "walkthrough", blocks: [
        { type: "code", lang: "js", runnable: true, code: `function intro(greeting, punct) {
  return greeting + ", " + this.name + punct;
}
const ada = { name: "Ada" };
console.log(intro.call(ada, "Hi", "!"));
console.log(intro.apply(ada, ["Hello", "?"]));
const hiAda = intro.bind(ada, "Hey");
console.log(hiAda("."));
console.log(hiAda.name, hiAda.length);
console.log(Math.max.apply(null, [3, 7, 2]), Math.max(...[3, 7, 2]));`, output: `Hi, Ada!
Hello, Ada?
Hey, Ada.
bound intro 1
7 7` },
      ] },
      { id: "visualization", blocks: [
        { type: "p", text: "In the `this` visualizer, choose the *explicit* call shapes to see `call`/`apply` set `this` for one call while `bind` fixes it permanently (until `new` is used)." },
        { type: "viz", id: "js-this", caption: "Conceptual: explicit binding in the this decision procedure." },
      ] },
      { id: "examples", blocks: [
        { type: "code", lang: "js", runnable: true, caption: "Polyfills (simplified: no edge-case handling for non-callable targets)", code: `Function.prototype.myCall = function (ctx, ...args) {
  ctx = ctx == null ? globalThis : Object(ctx);
  const key = Symbol("fn");          // unique key: no clash with existing props
  ctx[key] = this;                   // 'this' is the function being called
  try { return ctx[key](...args); }  // implicit binding does the work
  finally { delete ctx[key]; }
};

Function.prototype.myBind = function (ctx, ...preset) {
  const fn = this;
  return function bound(...later) {
    if (new.target) return new fn(...preset, ...later); // new beats bind
    return fn.apply(ctx, [...preset, ...later]);
  };
};

function intro(greeting, punct) { return greeting + ", " + this.name + punct; }
const ada = { name: "Ada" };
console.log(intro.myCall(ada, "Yo", "~"));
console.log(intro.myBind(ada, "Hiya")("!!"));`, output: `Yo, Ada~
Hiya, Ada!!` },
        { type: "callout", tone: "note", title: "Polyfill caveat", text: "`myCall` mimics sloppy-mode substitution (null → globalThis, primitives boxed). Real `call` passes thisArg untouched to strict functions — no polyfill can fully reproduce that, which is fine for interviews if you say so." },
      ] },
      { id: "edge-cases", blocks: [
        { type: "list", items: [
          "Binding twice: `fn.bind(a).bind(b)` — `this` stays `a` (arguments do accumulate).",
          "`call`/`apply`/`bind` on an arrow function can preset arguments but cannot change `this`.",
          "`apply` with huge arrays can exceed the engine's argument limit (RangeError); loop or reduce instead.",
          "`bind` in a render/hot path creates a new function each time, which breaks identity-based memoization.",
        ] },
      ] },
      { id: "mistakes", blocks: [
        { type: "callout", tone: "misconception", title: "\"bind calls the function\"", text: "`bind` only returns a new function. `button.onclick = handler.bind(this)()` calls it immediately and assigns its return value." },
      ] },
      { id: "tradeoffs", blocks: [
        { type: "compare", items: [
          { title: "bind", points: ["Reusable bound function", "Allocates; identity differs from original (can't `removeEventListener` with a fresh bind)"] },
          { title: "Arrow wrapper", points: ["`() => this.onClick()`, flexible", "Same allocation and identity caveat"] },
          { title: "Spread instead of apply", points: ["`fn(...args)` is clearer when `this` doesn't matter", "Only `apply`/`call` set `this`"] },
        ] },
      ] },
      { id: "interview-short", blocks: [
        { type: "p", text: "All three set `this` explicitly. `call(thisArg, ...args)` and `apply(thisArg, argsArray)` invoke the function immediately; the only difference is how arguments are passed. `bind(thisArg, ...args)` doesn't call anything — it returns a new bound function with `this` and optional leading arguments fixed permanently; later `call`/`apply` can't change it, but `new` ignores the bound `this`. Arrow functions ignore the thisArg entirely." },
      ] },
      { id: "interview-deep", blocks: [
        { type: "p", text: "Describe bound function exotic objects and their slots, `name`/`length` rules, the construct path, sloppy-mode thisArg substitution, and write `myCall` (temporary symbol key + implicit binding) and `myBind` (closure + `new.target` check) on the spot." },
      ] },
      { id: "summary", blocks: [{ type: "list", items: [
        "call: commas, now. apply: array, now. bind: later, returns new function.",
        "Bound `this` is permanent except against `new`.",
        "Arrows ignore thisArg.",
        "Polyfill call with a temporary symbol property; bind with a closure.",
      ] }] },
    ],
    glossary: [
      { term: "thisArg", definition: "The value passed as the first argument to call/apply/bind to be used as `this`." },
      { term: "Bound function", definition: "A function created by `bind` that wraps a target with a fixed `this` and preset arguments." },
      { term: "Method borrowing", definition: "Calling a method from one object/prototype on an unrelated object via call/apply." },
      { term: "Partial application", definition: "Fixing some arguments of a function to produce a function of fewer arguments." },
    ],
    followUps: [
      { q: "How would you implement `apply` using `call`?", a: "`Function.prototype.myApply = function (ctx, args = []) { return this.call(ctx, ...args); }` — or reuse the symbol trick from `myCall`." },
      { q: "Why can't you remove a listener added with `handler.bind(this)`?", a: "Each `bind` returns a new function; `removeEventListener` needs the identical reference. Store the bound function once and reuse it." },
    ],
    quiz: [
      { id: "cab-1", prompt: "What is logged?", code: { lang: "js", code: `function f() { return this.v; }
const g = f.bind({ v: 1 });
console.log(g.call({ v: 2 }));` }, options: ["1", "2", "undefined", "TypeError"], answer: 0, explanation: "A bound function's `this` cannot be overridden by `call`." },
      { id: "cab-2", prompt: "What is `function f(a, b, c) {}; f.bind(null, 1).length`?", options: ["3", "2", "1", "0"], answer: 1, explanation: "Bound length = target length minus bound argument count (min 0)." },
    ],
    questions: ["javascript/js-23", "javascript/js-49", "javascript/js-03"],
  },
  {
    slug: "arrow-functions",
    track: "javascript",
    title: "Arrow functions vs regular functions",
    summary: "Arrow functions are not just shorter syntax: they have no own `this`, `arguments`, `super` or `new.target`, cannot be constructors, and have no `prototype`.",
    level: "beginner",
    frequency: "very-high",
    minutes: 25,
    kinds: ["theory", "visualization", "quiz"],
    status: "authored",
    prerequisites: ["javascript/this-binding", "javascript/function-declarations-expressions"],
    related: ["javascript/call-apply-bind", "javascript/closures", "javascript/classes-inheritance"],
    tags: ["arrow-functions", "lexical-this", "arguments", "constructors"],
    sources: [],
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: [
        "List every semantic difference between arrows and regular functions",
        "Explain lexical `this`/`arguments` via environment lookup",
        "Know where arrows are the right choice (callbacks) and where they are wrong (object methods, prototype methods, constructors, dynamic-`this` APIs)",
      ] }] },
      { id: "intuition", blocks: [
        { type: "p", text: "A regular function is a full-blown function: it gets its own `this`, its own `arguments`, and can be used with `new`. An arrow function is a lightweight *expression* function that borrows those things from wherever it was written." },
      ] },
      { id: "definition", blocks: [
        { type: "table", head: ["Feature", "Regular function", "Arrow function"], rows: [
          ["`this`", "Dynamic (call site)", "Lexical (enclosing scope); call/apply/bind can't change it"],
          ["`arguments`", "Own array-like object", "None — refers to the enclosing function's (use rest `...args`)"],
          ["`new`", "Allowed (if not a method/generator)", "TypeError: not a constructor"],
          ["`prototype` property", "Yes", "No"],
          ["`super`, `new.target`", "Own", "Lexical"],
          ["Generators (`yield`)", "`function*`", "Not possible"],
          ["Duplicate parameter names", "Allowed in sloppy mode", "Never"],
          ["Hoisting", "Declarations hoisted", "Only as the variable holding it"],
        ] },
      ] },
      { id: "why", blocks: [
        { type: "p", text: "Before arrows, callbacks inside methods needed `var self = this` or `.bind(this)`. Lexical `this` removes that boilerplate, and concise bodies make small transformations (`xs.map(x => x * 2)`) readable." },
      ] },
      { id: "internals", blocks: [
        { type: "p", text: "An arrow's function object has `[[ThisMode]]` = lexical. When it's called, the new function environment record has *no* this binding, so `this` resolves by walking `[[OuterEnv]]` to the nearest environment that has one — the enclosing regular function's, or the module/global environment. `arguments`, `super` and `new.target` work the same way. Arrows have no `[[Construct]]` internal method, hence the TypeError with `new`." },
        { type: "callout", tone: "spec-vs-impl", title: "Performance", text: "Arrows aren't faster or slower in any meaningful way in modern engines. Choose by semantics." },
      ] },
      { id: "walkthrough", blocks: [
        { type: "code", lang: "js", runnable: true, code: `const regular = function () { return arguments.length; };
const arrow = (...args) => args.length;
console.log(regular(1, 2), arrow(1, 2));
try { new arrow(); } catch (e) { console.log(e.name); }
console.log("prototype" in regular, "prototype" in arrow);

function outer() {
  const inner = () => arguments[0];  // outer's arguments
  return inner("ignored");
}
console.log(outer("from outer"));

const o = { v: 1, m() { return () => this.v; } };
const f = o.m();
console.log(f(), f.call({ v: 2 }));   // call can't rebind`, output: `2 2
TypeError
true false
from outer
1 1` },
      ] },
      { id: "visualization", blocks: [
        { type: "p", text: "In the `this` visualizer, compare a regular callback and an arrow callback inside the same method: the arrow follows the scope chain to the method's `this`." },
        { type: "viz", id: "js-this", caption: "Conceptual: lexical this for arrow functions." },
      ] },
      { id: "examples", blocks: [
        { type: "code", lang: "js", runnable: true, caption: "Returning an object literal needs parentheses", code: `const mk = () => ({ ok: true });
const oops = () => { ok: true };   // block with a label 'ok', returns undefined
console.log(mk().ok, oops());`, output: `true undefined` },
      ] },
      { id: "mistakes", blocks: [
        { type: "list", items: [
          "Arrow as an object method: `this` is the outer scope, not the object.",
          "Arrow on a prototype (`Foo.prototype.bar = () => …`): same problem.",
          "Arrow as a DOM handler when you need `this === element` — use `event.currentTarget` instead.",
          "Libraries that set `this` for you (jQuery callbacks, Mocha's `this.timeout`) need regular functions.",
        ] },
      ] },
      { id: "tradeoffs", blocks: [
        { type: "compare", items: [
          { title: "Use arrows for", points: ["Callbacks inside methods", "Short pure transformations", "Class field handlers that must stay bound"] },
          { title: "Use regular functions for", points: ["Object/prototype methods", "Constructors", "Generators", "Functions that need `arguments` or dynamic `this`", "Top-level declarations you want hoisted"] },
        ] },
      ] },
      { id: "interview-short", blocks: [
        { type: "p", text: "Arrow functions are a concise function syntax with lexical bindings: they don't have their own `this`, `arguments`, `super` or `new.target` — they use the enclosing scope's. So their `this` can't be changed with call, apply or bind, they can't be used with `new`, and they have no `prototype`. They're great for callbacks inside methods, but shouldn't be used as object methods, prototype methods or constructors." },
      ] },
      { id: "interview-deep", blocks: [
        { type: "p", text: "Explain `[[ThisMode]]: lexical`, the missing this binding on the function environment record so ResolveThisBinding walks outward, the absent `[[Construct]]`, and the class-field-arrow pattern's per-instance cost." },
      ] },
      { id: "summary", blocks: [{ type: "list", items: [
        "No own this/arguments/super/new.target.",
        "Not constructible, no prototype.",
        "Great for callbacks; wrong for methods.",
        "Wrap object literal bodies in parentheses.",
      ] }] },
    ],
    glossary: [
      { term: "Concise body", definition: "An arrow body without braces; its expression value is returned implicitly." },
      { term: "Lexical binding", definition: "A name resolved from the enclosing scope rather than set per call." },
      { term: "`new.target`", definition: "Meta-property telling a function whether (and with which constructor) it was called with `new`." },
    ],
    followUps: [
      { q: "Why can't arrow functions be generators?", a: "The grammar simply doesn't define `yield` inside arrow bodies; generator arrows were proposed but not adopted." },
      { q: "Are arrow functions in class fields on the prototype?", a: "No. Class fields are initialised per instance, so each instance gets its own arrow function." },
    ],
    quiz: [
      { id: "af-1", prompt: "What does `new (() => {})()` do?", options: ["Creates an empty object", "Returns undefined", "Throws TypeError", "Throws SyntaxError"], answer: 2, explanation: "Arrow functions have no [[Construct]] — `is not a constructor`." },
      { id: "af-2", prompt: "Inside an arrow function nested in a regular function `f`, `arguments` refers to…", options: ["The arrow's own arguments", "f's arguments", "undefined", "A ReferenceError always"], answer: 1, explanation: "`arguments` is resolved lexically like `this`." },
    ],
    questions: ["javascript/js-16", "javascript/js-29"],
  },
];

// ===========================================================================
// Module 3 — Objects and OOP
// ===========================================================================

const objectsOop: Lesson[] = [
  {
    slug: "prototypes",
    track: "javascript",
    title: "Prototypes and prototypal inheritance",
    summary: "Objects delegate missing property lookups to their prototype, forming a chain that ends at null. Constructor functions, `new`, `.prototype` vs `[[Prototype]]`, and `instanceof` all build on this.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 40,
    kinds: ["theory", "coding", "quiz"],
    status: "authored",
    prerequisites: ["javascript/data-types", "javascript/this-binding"],
    related: ["javascript/classes-inheritance", "javascript/objects-descriptors", "javascript/mixins", "javascript/typeof-instanceof"],
    tags: ["prototype", "prototype-chain", "delegation", "new", "instanceof", "__proto__"],
    sources: [LYDIA],
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: [
        "Explain property lookup along the `[[Prototype]]` chain and why writes don't go up the chain",
        "Distinguish `obj.__proto__` / `Object.getPrototypeOf(obj)` from `Fn.prototype`",
        "Describe exactly what `new` does, and implement `myNew` and `myInstanceOf`",
        "Create objects with a chosen prototype (`Object.create`, including `null`)",
      ] }] },
      { id: "intuition", blocks: [
        { type: "p", text: "Every object has a hidden link to another object — its **prototype**. When you ask an object for a property it doesn't have, it asks its prototype, which asks *its* prototype, and so on. It's delegation: \"I don't know, ask my parent\"." },
        { type: "p", text: "This is how all arrays share `push` and `map` without each array storing its own copy: they live once on `Array.prototype`." },
      ] },
      { id: "definition", blocks: [
        { type: "list", items: [
          "**`[[Prototype]]`**: internal slot on every object; either another object or `null`. Read with `Object.getPrototypeOf(obj)` (or the legacy `obj.__proto__` accessor).",
          "**`Fn.prototype`**: an ordinary property on (non-arrow) functions. It is the object that becomes the `[[Prototype]]` of instances created by `new Fn()`.",
          "**Prototype chain**: the sequence of `[[Prototype]]` links from an object to `null`.",
          "**Own property**: a property stored on the object itself (`Object.hasOwn(obj, key)`).",
        ] },
        { type: "flow", nodes: ["rex", "Dog.prototype", "Object.prototype", "null"], caption: "Prototype chain of `const rex = new Dog()`." },
      ] },
      { id: "why", blocks: [
        { type: "list", items: [
          "Memory: shared methods live once on the prototype.",
          "It is the inheritance model underneath `class` syntax.",
          "Explains `instanceof`, `hasOwnProperty` vs `in`, `for…in` listing inherited keys, and prototype-pollution vulnerabilities.",
        ] },
      ] },
      { id: "internals", blocks: [
        { type: "steps", steps: [
          { title: "[[Get]] (reading `obj.key`)", detail: "If `obj` has an own property `key`, return it (calling the getter with `this = obj` for accessors). Otherwise repeat on `[[Prototype]]`. If the chain reaches `null`, return `undefined`." },
          { title: "[[Set]] (writing `obj.key = v`)", detail: "Look up `key` along the chain. If an inherited *setter* is found, call it with `this = obj`. If an inherited *non-writable* data property is found, the write fails (TypeError in strict mode). Otherwise create/update an **own** property on `obj` — this is *shadowing*; the prototype is unchanged." },
          { title: "`new Fn(args)`", detail: "1) Create an object whose `[[Prototype]]` is `Fn.prototype`. 2) Call `Fn` with `this` = that object. 3) If `Fn` returns an object, use it; otherwise return the new object." },
          { title: "`obj instanceof Fn`", detail: "Calls `Fn[Symbol.hasInstance]` (default: OrdinaryHasInstance), which walks `obj`'s chain looking for `Fn.prototype`." },
        ] },
        { type: "callout", tone: "spec-vs-impl", title: "Hidden classes and inline caches (V8)", text: "V8 gives objects a hidden class (\"map\"/shape) describing their layout, and caches property-lookup results per call site (inline caches), including where along the prototype chain a property was found. Mutating a prototype after objects use it (`Object.setPrototypeOf`, adding methods to `Array.prototype`) invalidates these assumptions and can deoptimise code — another reason to set prototypes at creation (`Object.create`, `class`)." },
      ] },
      { id: "walkthrough", blocks: [
        { type: "code", lang: "js", runnable: true, code: `const animal = { eats: true, describe() { return this.name + " eats: " + this.eats; } };
const rabbit = Object.create(animal);   // rabbit.[[Prototype]] = animal
rabbit.name = "Rabbit";
console.log(rabbit.describe(), Object.hasOwn(rabbit, "eats"), "eats" in rabbit);

rabbit.eats = false;                     // creates an OWN property (shadowing)
console.log(rabbit.eats, animal.eats);

console.log(Object.getPrototypeOf(rabbit) === animal,
            Object.getPrototypeOf(animal) === Object.prototype,
            Object.getPrototypeOf(Object.prototype));`, output: `Rabbit eats: true false true
false true
true true null` },
        { type: "steps", steps: [
          { title: "`rabbit.describe()`", detail: "Not own → found on `animal`; called with `this = rabbit` (implicit binding), so `this.name` is \"Rabbit\" and `this.eats` is found on `animal`." },
          { title: "`rabbit.eats = false`", detail: "[[Set]] finds a writable data property on the prototype, so it creates an own property on rabbit. `animal.eats` stays true." },
        ] },
      ] },
      { id: "examples", blocks: [
        { type: "code", lang: "js", runnable: true, caption: "Constructor functions, and implementing new / instanceof", code: `function Dog(name) { this.name = name; }
Dog.prototype.bark = function () { return this.name + " says woof"; };
const d = new Dog("Rex");
console.log(d.bark(), Object.getPrototypeOf(d) === Dog.prototype, Dog.prototype.constructor === Dog);

function myNew(Ctor, ...args) {
  const obj = Object.create(Ctor.prototype);
  const result = Ctor.apply(obj, args);
  const isObj = result !== null && (typeof result === "object" || typeof result === "function");
  return isObj ? result : obj;
}
function myInstanceOf(obj, Ctor) {
  let proto = Object.getPrototypeOf(obj);
  while (proto !== null) {
    if (proto === Ctor.prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}
console.log(myNew(Dog, "Fido").bark());
console.log(myInstanceOf(d, Dog), myInstanceOf(d, Object), myInstanceOf(d, Array));`, output: `Rex says woof true true
Fido says woof
true true false` },
        { type: "code", lang: "js", runnable: true, caption: "Inherited setters intercept writes; null-prototype objects", code: `const proto = { set x(v) { console.log("setter", v); } };
const child = Object.create(proto);
child.x = 5;
console.log(Object.hasOwn(child, "x"));

const dict = Object.create(null);   // no Object.prototype: safe dictionary
console.log(typeof dict.toString, "toString" in dict);`, output: `setter 5
false
undefined false` },
      ] },
      { id: "edge-cases", blocks: [
        { type: "list", items: [
          "Functions have both: `Dog.prototype` (for instances) and their own `[[Prototype]]`, which is `Function.prototype`.",
          "Arrow functions and methods have no `.prototype` and cannot be used with `new`.",
          "Reassigning `Dog.prototype = {…}` after creating instances leaves old instances on the old prototype, and drops `constructor` unless you restore it.",
          "`for…in` iterates inherited enumerable properties; `Object.keys` doesn't.",
          "Prototype pollution: merging untrusted JSON with a `\"__proto__\"` key into objects can modify `Object.prototype`. Use null-prototype objects, `Map`, or key filtering.",
        ] },
      ] },
      { id: "mistakes", blocks: [
        { type: "callout", tone: "misconception", title: "\"obj.prototype is the object's prototype\"", text: "Only functions have a meaningful `.prototype`, and it's the prototype of the objects they *construct*. An object's own prototype is `Object.getPrototypeOf(obj)`." },
        { type: "callout", tone: "misconception", title: "\"Prototypal inheritance copies methods\"", text: "Nothing is copied. Lookups are live: adding a method to the prototype later makes it available to every existing instance." },
      ] },
      { id: "tradeoffs", blocks: [
        { type: "compare", items: [
          { title: "Prototype delegation", points: ["Memory-efficient shared behaviour", "Dynamic and late-bound", "Long chains slightly slow lookups; mutation hurts engine caches"] },
          { title: "Composition / own functions", points: ["Explicit and flexible", "Per-object function copies cost memory"] },
        ] },
      ] },
      { id: "interview-short", blocks: [
        { type: "p", text: "Every object has an internal `[[Prototype]]` link to another object or null. When a property isn't found on the object, lookup continues up this chain — that's prototypal inheritance, delegation rather than copying. `new Fn()` creates an object whose prototype is `Fn.prototype`, runs `Fn` with `this` bound to it, and returns it. Writes create own properties that shadow the prototype's, unless an inherited setter intercepts them. `class` syntax is built on exactly this mechanism." },
      ] },
      { id: "interview-deep", blocks: [
        { type: "p", text: "Walk through [[Get]]/[[Set]] semantics (setters and non-writable inherited properties), `.prototype` vs `[[Prototype]]`, the four steps of `new`, OrdinaryHasInstance, `Object.create(null)`, prototype pollution, and the V8 angle: hidden classes, inline caches and why `setPrototypeOf` is slow." },
      ] },
      { id: "practice", blocks: [{ type: "list", ordered: true, items: [
        "Implement `myNew`, `myInstanceOf` and `myObjectCreate(proto)` (with a temporary constructor).",
        "Build a two-level inheritance with constructor functions and `Object.create`, then rewrite it with `class`.",
      ] }] },
      { id: "summary", blocks: [{ type: "list", items: [
        "Lookups delegate up `[[Prototype]]` to null.",
        "Writes create own properties (unless a setter/read-only intercepts).",
        "`Fn.prototype` becomes instances' `[[Prototype]]` via `new`.",
        "`instanceof` searches the chain for `Fn.prototype`.",
      ] }] },
    ],
    glossary: [
      { term: "[[Prototype]]", definition: "Internal link from an object to the object it delegates property lookups to." },
      { term: "Prototype chain", definition: "Successive [[Prototype]] links from an object up to null." },
      { term: "Shadowing", definition: "An own property hiding a same-named property further up the chain." },
      { term: "Constructor function", definition: "A regular function intended to be called with `new`." },
      { term: "Prototype pollution", definition: "A vulnerability where attacker-controlled keys modify a shared prototype like Object.prototype." },
      { term: "Hidden class", definition: "V8's internal description of an object's shape used to optimise property access (engine detail)." },
    ],
    followUps: [
      { q: "What's the difference between `Object.create(proto)` and `new Fn()`?", a: "`Object.create` sets the prototype directly without running any constructor; `new` also runs the constructor to initialise the object." },
      { q: "Why is `__proto__` discouraged?", a: "It's a legacy accessor on Object.prototype (absent on null-prototype objects); `Object.getPrototypeOf`/`setPrototypeOf` are the standard APIs. The `__proto__` key in object literals is still a standard way to set the prototype at creation." },
      { q: "How does `hasOwnProperty` differ from `in`?", a: "`in` checks the whole chain; `hasOwnProperty`/`Object.hasOwn` checks only own properties." },
    ],
    quiz: [
      { id: "pr-1", prompt: "What is logged?", code: { lang: "js", code: `function A() {}
A.prototype.x = 1;
const a = new A();
A.prototype.x = 2;
console.log(a.x);` }, options: ["1", "2", "undefined", "TypeError"], answer: 1, explanation: "Lookup is live — `a` delegates to `A.prototype`, which now holds 2." },
      { id: "pr-2", prompt: "What is `Object.getPrototypeOf(Function.prototype)`?", options: ["null", "Function.prototype", "Object.prototype", "undefined"], answer: 2, explanation: "Function.prototype is itself an ordinary object that delegates to Object.prototype." },
      { id: "pr-3", prompt: "`const o = Object.create({ x: 1 }); o.x = 2;` — what is the prototype's x now?", options: ["1", "2"], answer: 0, explanation: "The write creates an own property on `o`, shadowing the inherited one." },
    ],
    questions: ["javascript/js-04", "javascript/js-31"],
  },
  {
    slug: "classes-inheritance",
    track: "javascript",
    title: "Classes, constructors and inheritance",
    summary: "What `class` and `extends` really create, the `super()` rule, method overriding, fields and their initialisation order, statics, and how classes differ from constructor functions.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 40,
    kinds: ["theory", "coding", "quiz"],
    status: "authored",
    prerequisites: ["javascript/prototypes"],
    related: ["javascript/getters-setters-static", "javascript/private-fields", "javascript/mixins", "javascript/this-binding", "javascript/decorators"],
    tags: ["class", "extends", "super", "constructor", "overriding", "fields"],
    sources: [],
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: [
        "Map class syntax to the prototype objects it creates (two chains: instances and constructors)",
        "Explain why derived constructors must call `super()` before using `this`",
        "Override methods and call the parent with `super.method()`",
        "Predict field initialisation order relative to `super()` and constructor bodies",
        "List the real differences between classes and constructor functions",
      ] }] },
      { id: "intuition", blocks: [
        { type: "p", text: "A class is a blueprint plus a factory: the constructor builds each instance; methods go onto a shared prototype object that all instances delegate to. `extends` links one blueprint's prototype to another's so instances fall back to parent methods." },
      ] },
      { id: "definition", blocks: [
        { type: "code", lang: "js", runnable: true, code: `class Animal {
  static count = 0;
  constructor(name) { this.name = name; Animal.count++; }
  speak() { return this.name + " makes a sound"; }
}
class Cat extends Animal {
  constructor(name) { super(name); this.lives = 9; }
  speak() { return super.speak() + " (meow)"; }   // override + delegate
}
const c = new Cat("Tom");
console.log(c.speak(), c.lives, Animal.count);
console.log(typeof Animal,
  Object.getPrototypeOf(Cat) === Animal,                      // constructor chain
  Object.getPrototypeOf(Cat.prototype) === Animal.prototype); // instance chain`, output: `Tom makes a sound (meow) 9 1
function true true` },
        { type: "flow", nodes: ["c", "Cat.prototype", "Animal.prototype", "Object.prototype", "null"], caption: "Instance chain. A second chain links the constructors: Cat → Animal → Function.prototype (so statics are inherited)." },
      ] },
      { id: "why", blocks: [
        { type: "p", text: "Classes make the prototype pattern declarative and less error-prone (no forgetting `constructor`, no manual `Object.create`), add features impossible with plain functions (`super`, private `#fields`, static blocks), and are the shape most frameworks and TypeScript expect." },
      ] },
      { id: "internals", blocks: [
        { type: "steps", steps: [
          { title: "Class evaluation", detail: "Creates the constructor function F and F.prototype. Methods are defined as **non-enumerable** properties on F.prototype; static members on F. With `extends B`, `F.[[Prototype]] = B` and `F.prototype.[[Prototype]] = B.prototype`." },
          { title: "Methods get a [[HomeObject]]", detail: "That's how `super.method()` finds the parent: it looks up `method` starting from `[[HomeObject]].[[Prototype]]`, independent of `this`." },
          { title: "`new Cat()` — derived constructor", detail: "Derived classes ([[ConstructorKind]] derived) do **not** create `this`. `this` is uninitialised (TDZ-like) until `super(...)` runs the parent constructor, which creates the object (with `new.target.prototype` = Cat.prototype). Touching `this` earlier → ReferenceError." },
          { title: "Field initialisation", detail: "Base class: fields are initialised right at the start of the constructor. Derived class: fields are initialised immediately after `super()` returns, before the rest of the constructor body." },
          { title: "Return", detail: "The constructor returns `this` unless it explicitly returns an object." },
        ] },
        { type: "table", head: ["Difference", "Class", "Constructor function"], rows: [
          ["Call without `new`", "TypeError", "Runs as a normal function"],
          ["Hoisting", "TDZ (like `let`)", "Declaration fully hoisted"],
          ["Strict mode", "Always", "Only if opted in"],
          ["Methods enumerable", "No", "Yes, if assigned to `.prototype`"],
          ["`super`, `#private`, static blocks", "Yes", "No"],
          ["Subclassing built-ins (Array, Error, Map)", "Works correctly", "Awkward / broken"],
        ] },
      ] },
      { id: "examples", blocks: [
        { type: "code", lang: "js", runnable: true, caption: "this before super(), and calling a class without new", code: `class Animal { constructor(name) { this.name = name; } }
class Bad extends Animal {
  constructor() { this.x = 1; super("b"); }
}
try { new Bad(); } catch (e) { console.log(e.name); }
try { Animal("x"); } catch (e) { console.log(e.name); }`, output: `ReferenceError
TypeError` },
        { type: "code", lang: "js", runnable: true, caption: "Field initialisation order trap: parent constructor calls an overridden method", code: `class Base {
  constructor() { this.init(); }
  init() { this.kind = "base"; }
}
class Derived extends Base {
  field = "set";
  init() { this.kind = "derived:" + this.field; }
}
console.log(new Derived().kind);`, output: `derived:undefined` },
        { type: "p", text: "The overridden `init` runs during `super()`, *before* Derived's fields are initialised. Avoid calling overridable methods from constructors." },
      ] },
      { id: "edge-cases", blocks: [
        { type: "list", items: [
          "Methods are not auto-bound: `const f = obj.method; f()` → `this` is undefined (classes are strict).",
          "Subclassing built-ins works: `class MyArr extends Array {}` instances' `map` return `MyArr` (via `Symbol.species`).",
          "`extends null` and `extends` an expression (`extends mixin(Base)`) are allowed.",
          "Class fields are own properties defined with `[[DefineOwnProperty]]` semantics, so they do not trigger parent setters.",
          "Getters/setters and static methods are covered in their own lesson.",
        ] },
      ] },
      { id: "mistakes", blocks: [
        { type: "callout", tone: "misconception", title: "\"JavaScript classes are like Java classes\"", text: "They're syntax over prototypes: classes are functions, methods live on a mutable prototype object, and instances can be changed after creation. There's no class-based type system at runtime." },
        { type: "callout", tone: "warning", title: "Deep hierarchies", text: "Inheritance couples child to parent internals (the init-order trap above). Prefer shallow hierarchies and composition." },
      ] },
      { id: "tradeoffs", blocks: [
        { type: "compare", items: [
          { title: "Inheritance", points: ["Shared behaviour with `super`", "Tight coupling; fragile base class problem", "Single parent only"] },
          { title: "Composition", points: ["Combine small behaviours freely", "More wiring code", "Easier testing and change"] },
        ] },
      ] },
      { id: "interview-short", blocks: [
        { type: "p", text: "A class declaration creates a constructor function plus a prototype object; methods are non-enumerable properties on that prototype. `extends` sets up two prototype links — `Child.prototype → Parent.prototype` for instance methods and `Child → Parent` for statics. In a derived constructor `this` doesn't exist until `super()` calls the parent constructor, so you must call `super` first. Overriding is just shadowing on the prototype chain, and `super.method()` calls the parent's version via the method's home object. Unlike constructor functions, classes must be called with `new`, are strict and in the TDZ before declaration." },
      ] },
      { id: "interview-deep", blocks: [
        { type: "p", text: "Discuss [[HomeObject]] for `super` lookups, derived vs base [[ConstructorKind]], `new.target` and how the parent constructor allocates with the child's prototype, field initialisation timing (after `super()`), [[Define]] vs [[Set]] semantics for fields, and built-in subclassing with `Symbol.species`." },
      ] },
      { id: "summary", blocks: [{ type: "list", items: [
        "class = constructor function + prototype; methods non-enumerable.",
        "extends links instance and constructor prototype chains.",
        "Derived: call super() before this; fields init right after super().",
        "Override by shadowing; super.method() via [[HomeObject]].",
      ] }] },
    ],
    glossary: [
      { term: "Derived class", definition: "A class declared with `extends`; its constructor must call `super()` before using `this`." },
      { term: "[[HomeObject]]", definition: "Internal slot of a method recording the object it was defined on; used to resolve `super`." },
      { term: "Class field", definition: "Per-instance property declared in the class body, initialised at construction." },
      { term: "Method overriding", definition: "Defining a method in a subclass with the same name as a parent method, shadowing it on the chain." },
      { term: "`Symbol.species`", definition: "Static hook telling built-in methods which constructor to use for derived objects." },
    ],
    followUps: [
      { q: "Can you implement classes without `class`?", a: "Mostly: constructor functions, `Object.create(Parent.prototype)` for `Child.prototype`, restoring `constructor`, `Parent.call(this, …)` in the child constructor and `Object.setPrototypeOf(Child, Parent)` for statics. True private fields and correct built-in subclassing need class syntax." },
      { q: "Why must `super()` come first?", a: "In derived classes the *parent* constructor allocates the object (important for exotic built-ins like Array). Until it runs, there is no `this` to use." },
    ],
    quiz: [
      { id: "ci-1", prompt: "Where does `speak` live in `class A { speak() {} }`?", options: ["On each instance", "On A", "On A.prototype (non-enumerable)", "On Object.prototype"], answer: 2, explanation: "Methods are installed on the prototype as non-enumerable properties." },
      { id: "ci-2", prompt: "What happens when a derived constructor accesses `this` before `super()`?", options: ["`this` is an empty object", "ReferenceError", "TypeError", "It works in sloppy mode"], answer: 1, explanation: "The this binding is uninitialised until super() returns." },
      { id: "ci-3", prompt: "When are a derived class's fields initialised?", options: ["Before the parent constructor runs", "Right after super() returns", "At the end of the constructor", "Lazily on first access"], answer: 1, explanation: "Fields are defined on `this` immediately after `super()` returns." },
    ],
    questions: ["javascript/js-31", "javascript/js-04"],
  },
  outline({
    slug: "getters-setters-static",
    title: "Getters, setters and static members",
    summary: "Accessor properties for computed or validated values, and static methods, fields and blocks that belong to the class rather than instances.",
    level: "intermediate",
    frequency: "medium",
    minutes: 20,
    prerequisites: ["javascript/classes-inheritance", "javascript/objects-descriptors"],
    related: ["javascript/private-fields", "javascript/singleton"],
    tags: ["getters", "setters", "static", "accessors"],
    sources: [],
    objectives: [
      "Define accessors in object literals, classes and with `Object.defineProperty`",
      "Avoid infinite recursion when a setter writes to its own name (use a backing `#field`)",
      "Use static methods/fields for factories, caches and constants; know that `this` in a static is the class",
      "Know that statics are inherited through the constructor prototype chain",
    ],
    covers: [
      "Accessor descriptors (`get`/`set`, no `value`/`writable`)",
      "Validation and computed properties",
      "Static methods, static fields, static blocks (ES2022)",
      "`this` in statics and subclass inheritance of statics",
    ],
  }),
  outline({
    slug: "private-fields",
    title: "Private fields and methods (#private)",
    summary: "Hard privacy with `#name`: brand checks, the `#x in obj` test, and how it compares to closures, WeakMaps and TypeScript `private`.",
    level: "intermediate",
    frequency: "medium",
    minutes: 20,
    prerequisites: ["javascript/classes-inheritance"],
    related: ["javascript/closures", "javascript/weakmap-weakset", "javascript/proxy-reflect"],
    tags: ["private-fields", "encapsulation", "brand-check"],
    sources: [],
    objectives: [
      "Declare private fields, methods, accessors and statics",
      "Explain why accessing `#x` on a foreign object throws a TypeError (brand check) and how `#x in obj` tests for it",
      "Compare #private with closure privacy, WeakMap privacy and TypeScript's compile-time `private`",
      "Know the Proxy incompatibility (private access on a proxy throws)",
    ],
    covers: [
      "Syntax and semantics; privacy is lexical to the class body",
      "Brand checks and ergonomic `#x in obj`",
      "Subclasses can't see parent privates",
      "Interaction with Proxy, structuredClone and JSON",
    ],
  }),
  outline({
    slug: "mixins",
    title: "Composition and mixins",
    summary: "Sharing behaviour without deep inheritance: object composition, `Object.assign` mixins and class-expression (\"subclass factory\") mixins.",
    level: "intermediate",
    frequency: "medium",
    minutes: 20,
    prerequisites: ["javascript/classes-inheritance"],
    related: ["javascript/prototypes", "javascript/higher-order-functions", "javascript/symbols"],
    tags: ["mixins", "composition", "inheritance"],
    sources: [],
    objectives: [
      "Explain composition over inheritance with concrete examples",
      "Implement `Object.assign` mixins and know their limits (getters are flattened, `super` doesn't work)",
      "Implement subclass-factory mixins: `const Serializable = (Base) => class extends Base {…}`",
      "Handle name collisions and ordering",
    ],
    covers: [
      "Composition with factory functions",
      "Copy-based mixins via `Object.assign` onto a prototype",
      "Subclass-factory mixins and `super` chaining",
      "Using symbols to avoid name clashes; `instanceof` with `Symbol.hasInstance`",
    ],
    questions: ["javascript/js-47"],
  }),
  outline({
    slug: "symbols",
    title: "Symbols and well-known symbols",
    summary: "Unique property keys, the global symbol registry, and the well-known symbols (`Symbol.iterator`, `Symbol.toPrimitive`, `Symbol.hasInstance`…) that hook into language behaviour.",
    level: "intermediate",
    frequency: "medium",
    minutes: 20,
    prerequisites: ["javascript/data-types", "javascript/objects-descriptors"],
    related: ["javascript/generators-iterators", "javascript/equality-coercion", "javascript/mixins"],
    tags: ["symbol", "well-known-symbols", "Symbol.iterator", "metaprogramming"],
    sources: [],
    objectives: [
      "Create symbols and use them as collision-free property keys",
      "Explain that symbol keys are skipped by `for…in`, `Object.keys` and `JSON.stringify` (but not by `Reflect.ownKeys`)",
      "Contrast `Symbol()` with `Symbol.for()` (global registry)",
      "Use well-known symbols to customise iteration, coercion, `instanceof` and `toString` tags",
    ],
    covers: [
      "Uniqueness and descriptions",
      "Symbol-keyed properties and their (non-)visibility",
      "Global registry",
      "`Symbol.iterator`, `Symbol.asyncIterator`, `Symbol.toPrimitive`, `Symbol.hasInstance`, `Symbol.toStringTag`, `Symbol.species`",
      "Why symbols are not truly private",
    ],
    questions: ["javascript/js-30", "javascript/js-45"],
  }),
  outline({
    slug: "proxy-reflect",
    title: "Proxy and Reflect",
    summary: "Intercepting fundamental object operations with Proxy traps, forwarding them correctly with Reflect, invariants, and real uses (validation, reactivity, observability).",
    level: "advanced",
    frequency: "medium",
    minutes: 30,
    kinds: ["theory", "coding"],
    prerequisites: ["javascript/prototypes", "javascript/objects-descriptors"],
    related: ["javascript/freeze-seal", "javascript/private-fields", "javascript/symbols"],
    tags: ["proxy", "reflect", "metaprogramming", "traps", "reactivity"],
    sources: [],
    objectives: [
      "Map each trap (`get`, `set`, `has`, `deleteProperty`, `ownKeys`, `apply`, `construct`…) to the internal method it intercepts",
      "Forward with `Reflect.*` and pass the `receiver` so getters and inheritance keep working",
      "Explain proxy invariants (e.g. can't report a non-configurable property as missing)",
      "Build a validation proxy and a tiny reactive store; know the performance cost and private-field limitation",
    ],
    covers: [
      "Handler/target model and the 13 traps",
      "Reflect as the default behaviour of each internal method",
      "Receiver and why `target[key]` is subtly wrong",
      "Revocable proxies, invariants",
      "Use cases: Vue 3 reactivity, Immer drafts, logging, negative array indexes",
    ],
    questions: ["javascript/js-33", "javascript/js-37"],
  }),
  outline({
    slug: "freeze-seal",
    title: "Object.freeze, seal and preventExtensions",
    summary: "Three levels of locking an object, what each forbids, why they are shallow, and how to deep-freeze.",
    level: "intermediate",
    frequency: "high",
    minutes: 15,
    prerequisites: ["javascript/objects-descriptors"],
    related: ["javascript/deep-copy", "javascript/proxy-reflect", "javascript/var-let-const"],
    tags: ["freeze", "seal", "preventExtensions", "immutability"],
    sources: [],
    objectives: [
      "Tabulate add/delete/modify/reconfigure permissions for preventExtensions, seal and freeze",
      "Explain the descriptor changes each makes (configurable false; writable false for freeze)",
      "Show that all three are shallow and write a recursive `deepFreeze`",
      "Know that failed writes are silent in sloppy mode and TypeErrors in strict mode",
    ],
    covers: [
      "Comparison table and `isFrozen`/`isSealed`/`isExtensible`",
      "Shallow semantics; deepFreeze with cycle handling",
      "`const` vs freeze",
      "Frozen arrays and `push` throwing",
    ],
    questions: ["javascript/js-35", "javascript/js-51"],
  }),
  {
    slug: "deep-copy",
    track: "javascript",
    title: "Shallow vs deep copy (and structuredClone)",
    summary: "Spread and `Object.assign` copy one level; nested objects stay shared. How JSON round-tripping, `structuredClone` and a hand-written recursive clone differ — cycles, Dates, Maps, prototypes and functions.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 35,
    kinds: ["theory", "visualization", "coding", "quiz"],
    status: "authored",
    prerequisites: ["javascript/data-types", "javascript/destructuring-spread"],
    related: ["javascript/json-circular", "javascript/weakmap-weakset", "javascript/freeze-seal", "javascript/recursion", "javascript/map-set"],
    tags: ["deep-copy", "shallow-copy", "structuredClone", "JSON", "cycles", "immutability"],
    sources: [],
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: [
        "Explain what a shallow copy shares and what a deep copy duplicates",
        "Compare spread/`Object.assign`, `JSON.parse(JSON.stringify())`, `structuredClone` and custom clones",
        "Write a deep clone that handles cycles, shared references, Date, RegExp, Map and Set",
        "Decide when you need a deep copy at all (often immutable updates are better)",
      ] }] },
      { id: "intuition", blocks: [
        { type: "p", text: "Copying an object is like photocopying a folder. A **shallow** copy gives you a new folder containing the same *sticky notes pointing to* other folders — open a nested folder through either copy and you're in the same place. A **deep** copy photocopies every nested folder as well, so the two are completely independent." },
      ] },
      { id: "definition", blocks: [
        { type: "table", head: ["Technique", "Depth", "Cycles", "Date / Map / Set", "Functions, prototypes, getters"], rows: [
          ["`{ ...obj }`, `Object.assign({}, obj)`, `arr.slice()`", "Shallow (own enumerable props)", "N/A", "Shared references", "Getters invoked → plain values; prototype lost (spread)"],
          ["`JSON.parse(JSON.stringify(obj))`", "Deep", "**TypeError**", "Date → string; Map/Set → `{}`", "Functions/undefined/symbols dropped; NaN/Infinity → null; prototype lost"],
          ["`structuredClone(obj)`", "Deep", "Preserved", "Preserved", "Functions and DOM nodes → **DataCloneError**; prototype lost (plain object); getters run"],
          ["Custom recursive clone", "Deep", "If you use a `WeakMap`", "If you handle them", "Your choice (e.g. keep prototype)"],
        ] },
      ] },
      { id: "why", blocks: [
        { type: "list", items: [
          "Avoid accidental shared mutation (default state objects, config, caches).",
          "State management (Redux, React) relies on *new references* at changed paths — usually via shallow copies along the path, not a full deep copy.",
          "Passing data across workers/`postMessage` uses the structured clone algorithm.",
        ] },
      ] },
      { id: "internals", blocks: [
        { type: "p", text: "**Spread** performs CopyDataProperties: for each own enumerable key (strings and symbols), `[[Get]]` the value (running getters) and define it on the new object. Values are copied as-is, so nested objects are aliased." },
        { type: "p", text: "**structuredClone** is defined by the HTML Standard, not ECMAScript: StructuredSerialize walks the graph with a *memory map* from already-visited objects to their serialized form — this is what preserves cycles and shared references — then StructuredDeserialize rebuilds it. Supported: primitives (except symbols), plain objects, arrays, Date, RegExp, Map, Set, ArrayBuffer/typed arrays, Blob/File, Error types and more. Class instances come back as plain objects; non-cloneable values throw a `DataCloneError`." },
        { type: "p", text: "**A custom clone** needs the same memory-map trick: before recursing into an object, record `original → copy` in a `WeakMap` so revisiting it returns the existing copy." },
      ] },
      { id: "visualization", blocks: [
        { type: "p", text: "Use the references visualization to compare `const b = a`, `const b = { ...a }` and `structuredClone(a)`: watch which arrows point to new objects and which still point to the shared nested object." },
        { type: "viz", id: "js-references", caption: "Conceptual heap diagram of aliasing, shallow copy and deep copy." },
      ] },
      { id: "walkthrough", blocks: [
        { type: "code", lang: "js", runnable: true, code: `const original = { name: "Ada", tags: ["math"], born: new Date(0) };

const shallow = { ...original };
shallow.name = "Grace";          // top-level: independent
shallow.tags.push("code");       // nested: shared!
console.log(original.name, original.tags.join());

const viaJson = JSON.parse(JSON.stringify(original));
console.log(typeof viaJson.born); // Date became a string

const deep = structuredClone(original);
deep.tags.push("x");
console.log(original.tags.length, deep.born instanceof Date);`, output: `Ada math,code
string
2 true` },
      ] },
      { id: "examples", blocks: [
        { type: "code", lang: "js", runnable: true, caption: "A deep clone with cycles, Map/Set/Date/RegExp and prototypes", code: `function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return seen.get(value);          // cycle / shared ref
  if (value instanceof Date) return new Date(value);
  if (value instanceof RegExp) return new RegExp(value.source, value.flags);
  if (value instanceof Map) {
    const out = new Map();
    seen.set(value, out);
    for (const [k, v] of value) out.set(deepClone(k, seen), deepClone(v, seen));
    return out;
  }
  if (value instanceof Set) {
    const out = new Set();
    seen.set(value, out);
    for (const v of value) out.add(deepClone(v, seen));
    return out;
  }
  const out = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value));
  seen.set(value, out);                                  // register BEFORE recursing
  for (const key of Reflect.ownKeys(value)) out[key] = deepClone(value[key], seen);
  return out;
}

class Point { constructor(x) { this.x = x; } norm() { return Math.abs(this.x); } }
const src = { list: [1, { n: 2 }], when: new Date(0), m: new Map([["k", { v: 1 }]]), p: new Point(3) };
src.me = src;
const copy = deepClone(src);
console.log(copy.me === copy, copy.list[1] !== src.list[1], copy.m.get("k").v, copy.p.norm());

const shared = { v: 1 };
const two = deepClone({ a: shared, b: shared });
console.log(two.a === two.b);   // sharing preserved`, output: `true true 1 3
true` },
        { type: "code", lang: "js", runnable: true, caption: "structuredClone limits", code: `const cyclic = { id: 1 };
cyclic.self = cyclic;
const cc = structuredClone(cyclic);
console.log(cc.self === cc);

try { structuredClone({ f() {} }); } catch (e) { console.log(e.name); }

class Point { constructor(x) { this.x = x; } }
const pc = structuredClone(new Point(-2));
console.log(pc instanceof Point, pc.x);`, output: `true
DataCloneError
false -2` },
      ] },
      { id: "edge-cases", blocks: [
        { type: "list", items: [
          "The custom clone above copies non-enumerable keys as enumerable and doesn't copy descriptors/getters; use `Object.getOwnPropertyDescriptors` if that matters.",
          "Class instances with `#private` fields cannot be cloned faithfully by any external function — private state is invisible. Give the class its own `clone()` method.",
          "Deep recursion on very deep structures can overflow the stack; an iterative version uses an explicit work stack.",
          "`structuredClone` is available in browsers and Node 17+; in older environments it may be missing.",
          "Typed arrays and ArrayBuffers can be *transferred* instead of copied with `structuredClone(x, { transfer: [buf] })`.",
        ] },
      ] },
      { id: "mistakes", blocks: [
        { type: "callout", tone: "misconception", title: "\"Spread makes a copy, so it's safe to mutate\"", text: "Only the top level. `{ ...state }.user.name = \"x\"` mutates the original user." },
        { type: "callout", tone: "warning", title: "JSON round-trip as a default", text: "Quietly corrupts Dates, drops undefined and functions, turns NaN into null and crashes on cycles. Prefer `structuredClone`." },
      ] },
      { id: "tradeoffs", blocks: [
        { type: "compare", items: [
          { title: "Deep copy everything", points: ["Simple mental model", "O(size of graph) time and memory every time", "Breaks identity for unchanged parts (re-renders everything)"] },
          { title: "Structural sharing (copy along the changed path)", points: ["Cheap; unchanged subtrees keep identity", "Requires immutable-update discipline or Immer"] },
        ] },
      ] },
      { id: "interview-short", blocks: [
        { type: "p", text: "A shallow copy creates a new top-level object but copies nested references, so nested objects are shared — that's what spread, `Object.assign` and `slice` do. A deep copy recursively duplicates the whole graph. `JSON.parse(JSON.stringify())` is a lossy deep copy: it fails on cycles and loses Dates, Maps, functions and undefined. `structuredClone` is the built-in deep copy: it handles cycles, Dates, Maps and Sets, but throws on functions and drops prototypes. For full control I write a recursive clone with a WeakMap of visited objects to handle cycles." },
      ] },
      { id: "interview-deep", blocks: [
        { type: "p", text: "Explain CopyDataProperties semantics for spread (getters run, own enumerable only), the HTML structured clone algorithm and its memory map, write the WeakMap-based clone (register before recursion!), and discuss when structural sharing beats deep copying." },
      ] },
      { id: "summary", blocks: [{ type: "list", items: [
        "Shallow: new top level, shared nested objects.",
        "JSON round-trip: lossy, no cycles.",
        "structuredClone: cycles + built-ins, no functions/prototypes.",
        "Custom: WeakMap memo for cycles and shared refs.",
        "Prefer structural sharing for app state.",
      ] }] },
    ],
    glossary: [
      { term: "Shallow copy", definition: "A new object whose properties reference the same values (including nested objects) as the original." },
      { term: "Deep copy", definition: "A copy in which every reachable nested object is also duplicated." },
      { term: "Structured clone algorithm", definition: "HTML-defined serialization used by structuredClone, postMessage and IndexedDB." },
      { term: "Structural sharing", definition: "Creating a new version of a data structure that reuses unchanged parts of the old one." },
      { term: "DataCloneError", definition: "DOMException thrown when structured cloning encounters a non-cloneable value." },
    ],
    followUps: [
      { q: "Why use a WeakMap rather than a Map for the visited set?", a: "Either works within a single call; a WeakMap doesn't hold the originals strongly, which matters if the memo is ever kept around. It also only accepts object keys, which is what we need." },
      { q: "How would you clone a function?", a: "You generally don't — functions close over environments that can't be copied. Share the reference." },
      { q: "Does `Object.assign` trigger setters?", a: "Yes on the target (it uses [[Set]]); object spread uses define semantics and doesn't." },
    ],
    quiz: [
      { id: "dc-1", prompt: "What is logged?", code: { lang: "js", code: `const a = { n: { v: 1 } };
const b = { ...a };
b.n.v = 2;
console.log(a.n.v);` }, options: ["1", "2", "undefined", "TypeError"], answer: 1, explanation: "Spread is shallow: `b.n` and `a.n` are the same object." },
      { id: "dc-2", prompt: "Which value makes `structuredClone` throw?", options: ["A Map", "A cyclic object", "An object with a method", "A Date"], answer: 2, explanation: "Functions are not cloneable → DataCloneError." },
      { id: "dc-3", prompt: "What does `JSON.parse(JSON.stringify({ d: new Date(0) })).d` produce?", options: ["A Date", "A string", "A number", "{}"], answer: 1, explanation: "Date's toJSON produces an ISO string; JSON.parse doesn't revive it." },
    ],
    questions: ["javascript/js-18", "javascript/js-52"],
  },
  outline({
    slug: "map-set",
    title: "Map and Set",
    summary: "Keyed collections with any-type keys, insertion order and SameValueZero equality — and when they beat plain objects and arrays.",
    level: "beginner",
    frequency: "high",
    minutes: 20,
    prerequisites: ["javascript/data-types", "javascript/equality-coercion"],
    related: ["javascript/weakmap-weakset", "javascript/memoization", "javascript/generators-iterators"],
    tags: ["Map", "Set", "collections", "SameValueZero"],
    sources: [],
    objectives: [
      "Use `Map` for dictionaries with non-string keys or frequent add/delete",
      "Use `Set` for uniqueness and the ES2025 set methods (`union`, `intersection`, `difference`…) where available",
      "Explain key equality (SameValueZero: NaN equals NaN; objects by identity)",
      "Rely on insertion-order iteration (and build an LRU cache from it)",
    ],
    covers: [
      "Map vs Object (prototype keys, key types, size, ordering, performance under churn)",
      "Set vs Array for membership",
      "Iteration protocols: `keys`, `values`, `entries`, `forEach`",
      "Serialising Maps/Sets (JSON needs conversion)",
      "Map-based LRU cache",
    ],
  }),
  outline({
    slug: "weakmap-weakset",
    title: "WeakMap, WeakSet and WeakRef",
    summary: "Collections that hold their keys weakly so they don't prevent garbage collection — for metadata, caches and private data — plus WeakRef/FinalizationRegistry and their caveats.",
    level: "advanced",
    frequency: "high",
    minutes: 25,
    prerequisites: ["javascript/map-set", "javascript/memory-leaks-gc"],
    related: ["javascript/deep-copy", "javascript/memoization", "javascript/private-fields"],
    tags: ["WeakMap", "WeakSet", "WeakRef", "garbage-collection", "ephemeron"],
    sources: [],
    objectives: [
      "Explain weak references: an entry disappears once its key is otherwise unreachable",
      "Know why WeakMaps aren't iterable and have no `size` (GC timing must not be observable)",
      "Use WeakMaps for per-object metadata, memoization keyed by objects, and DOM-node data",
      "Explain ephemeron semantics (value kept alive only while the key is) and WeakRef/FinalizationRegistry caveats",
    ],
    covers: [
      "API and key restrictions (objects and non-registered symbols)",
      "Ephemerons and GC",
      "Use cases vs Map leaks",
      "WeakRef and FinalizationRegistry: non-deterministic, not for program logic",
    ],
    questions: ["javascript/js-39", "javascript/js-32"],
  }),
];

// ===========================================================================
// Module 4 — Asynchronous JavaScript
// ===========================================================================

const asyncJs: Lesson[] = [
  outline({
    slug: "sync-vs-async",
    title: "Synchronous vs asynchronous code",
    summary: "Why a single-threaded language needs asynchrony, what \"non-blocking\" really means, and where the actual waiting happens (the host, not the JS thread).",
    level: "beginner",
    frequency: "very-high",
    minutes: 15,
    prerequisites: ["javascript/call-stack"],
    related: ["javascript/event-loop", "javascript/callbacks", "javascript/promises", "nodejs/node-event-loop"],
    tags: ["async", "non-blocking", "single-threaded", "concurrency"],
    sources: [],
    objectives: [
      "Define synchronous (blocking, run-to-completion) and asynchronous (start now, finish later via a callback/promise) operations",
      "Explain that JS runs on one thread per agent while the host (browser, libuv) performs I/O and timers in parallel",
      "Show how long synchronous work freezes the UI or server, and how to split or offload it",
      "Distinguish concurrency (interleaving) from parallelism (Web Workers, worker_threads)",
    ],
    covers: [
      "Run-to-completion semantics",
      "Blocking examples: busy loops, `JSON.parse` of huge payloads, sync XHR / `fs.readFileSync`",
      "Async APIs: timers, fetch, events, file I/O; how results come back via the event loop",
      "Evolution: callbacks → promises → async/await",
      "Offloading CPU work: chunking, `scheduler.yield()`/`setTimeout`, workers",
    ],
    questions: ["javascript/js-14", "javascript/js-11"],
  }),
  {
    slug: "event-loop",
    track: "javascript",
    title: "The event loop: tasks, microtasks and rendering",
    summary: "How one JavaScript thread interleaves timers, I/O, promise reactions and rendering: the task queues, the microtask checkpoint, why promises beat setTimeout, and how Node's phases differ from the browser.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 50,
    kinds: ["theory", "visualization", "quiz"],
    status: "authored",
    prerequisites: ["javascript/call-stack", "javascript/sync-vs-async"],
    related: ["javascript/promises", "javascript/async-await", "javascript/timers", "nodejs/node-event-loop", "javascript/storage-workers-raf"],
    tags: ["event-loop", "microtasks", "macrotasks", "task-queue", "rendering", "queueMicrotask", "node"],
    sources: [LYDIA],
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: [
        "Describe one iteration of the browser event loop: pick a task, run it, perform a microtask checkpoint, maybe render",
        "Predict output ordering of sync code, promise callbacks, `queueMicrotask`, `setTimeout` and `await`",
        "Explain why microtasks can starve rendering while tasks cannot",
        "Contrast the browser model with Node's libuv phases and `process.nextTick`",
      ] }] },
      { id: "prerequisites", blocks: [{ type: "p", text: "You need the call stack (one stack, run-to-completion) and the idea that hosts perform I/O and timers outside the JS thread." }] },
      { id: "intuition", blocks: [
        { type: "p", text: "Picture a single chef (the JS thread) with a ticket rail (the **task queue**) and a sticky-note pad (the **microtask queue**). The chef finishes the current dish completely, then works through *every* sticky note — including notes added while doing notes — then maybe plates up for the dining room (**rendering**), and only then takes the next ticket." },
        { type: "p", text: "Timers, network responses and clicks add tickets. Promise callbacks add sticky notes. That one rule explains almost every ordering puzzle." },
      ] },
      { id: "definition", blocks: [
        { type: "list", items: [
          "**Event loop**: the host's algorithm that repeatedly selects work and runs it on the JS thread. It is defined by the HTML Standard (browsers) or libuv + Node (server), not by ECMAScript.",
          "**Task** (often called *macrotask*): a unit of work like running a script, a timer callback, an event dispatch, a `MessageChannel` message, or an I/O completion. A browser has several task sources/queues and may choose among them.",
          "**Microtask**: a short job that runs as soon as the stack empties, before the next task. Sources: promise reactions (`then`/`catch`/`finally`, `await` continuations), `queueMicrotask`, `MutationObserver`.",
          "**Microtask checkpoint**: the step that drains the microtask queue *completely*, including microtasks enqueued during the drain.",
          "ECMAScript calls microtask-like work **jobs** (e.g. PromiseReactionJob) and leaves *when* to run them to the host via HostEnqueuePromiseJob.",
        ] },
      ] },
      { id: "why", blocks: [
        { type: "p", text: "Ordering bugs (state read before an update lands, UI not repainting during a loop, a promise chain starving input handling, `setTimeout(fn, 0)` not being \"immediately\") all come from this model. It's also the single most asked JavaScript interview question." },
      ] },
      { id: "internals", title: "How it works", blocks: [
        { type: "steps", steps: [
          { title: "1. Pick a task", detail: "Choose the oldest runnable task from one of the task queues (the browser may prioritise, e.g. input over timers). The initial script itself is a task." },
          { title: "2. Run it to completion", detail: "Push its callback on the call stack and run until the stack is empty. Nothing can interrupt it." },
          { title: "3. Microtask checkpoint", detail: "While the microtask queue is non-empty, dequeue and run the oldest microtask. New microtasks are appended and also run in this checkpoint. Microtasks also run whenever the stack empties *during* a task (e.g. between two event listeners dispatched by a real user click)." },
          { title: "4. Update the rendering (if it's time)", detail: "Roughly every frame (~16.7 ms at 60 Hz) and only if needed: run resize/scroll steps, `requestAnimationFrame` callbacks, style, layout, paint. Not every loop iteration renders." },
          { title: "5. Repeat", detail: "If there are no tasks, the loop sleeps until the host enqueues one (timer expiry, network data, input)." },
        ] },
        { type: "callout", tone: "warning", title: "Microtasks can starve the page", text: "Because the checkpoint drains until empty, a microtask that always enqueues another (`function loop() { queueMicrotask(loop) }`) blocks rendering and input forever. The same loop with `setTimeout` lets the browser render and handle events between iterations." },
        { type: "p", text: "**Promise reaction jobs.** When a promise settles, every reaction registered with `then` becomes a PromiseReactionJob passed to HostEnqueuePromiseJob — i.e. a microtask. Calling `then` on an *already settled* promise enqueues the job immediately. Resolving a promise with another promise/thenable enqueues a NewPromiseResolveThenableJob that calls `then` on it, costing extra ticks (see Promises)." },
        { type: "callout", tone: "spec-vs-impl", title: "Timers are clamped and best-effort", text: "`setTimeout(fn, 0)` means \"no sooner than ~0 ms\". Browsers clamp nested timers (nesting level > 5) to ≥ 4 ms, throttle timers in background tabs (often to ≥ 1 s), and may delay further under load. Node clamps `0` to 1 ms." },
      ] },
      { id: "walkthrough", blocks: [
        { type: "code", lang: "js", runnable: true, code: `console.log("script start");
setTimeout(() => console.log("timeout"), 0);

async function a() {
  console.log("a start");
  await null;
  console.log("a after await");
}
a();

new Promise((resolve) => {
  console.log("executor");     // executors run synchronously
  resolve();
}).then(() => console.log("then"));

console.log("script end");`, output: `script start
a start
executor
script end
a after await
then
timeout` },
        { type: "steps", steps: [
          { title: "Task: the script", detail: "Logs \"script start\". `setTimeout` hands a timer to the host, which will enqueue a *task* later." },
          { title: "Call a()", detail: "Logs \"a start\". `await null` suspends `a` and schedules its continuation as a microtask (M1)." },
          { title: "Promise constructor", detail: "The executor runs synchronously: logs \"executor\" and resolves. `.then` on a fulfilled promise enqueues the reaction immediately (M2)." },
          { title: "End of script", detail: "Logs \"script end\". Stack empty → microtask checkpoint." },
          { title: "Drain microtasks", detail: "M1 resumes `a` → \"a after await\". M2 → \"then\"." },
          { title: "Next task", detail: "The timer task runs → \"timeout\"." },
        ] },
      ] },
      { id: "visualization", blocks: [
        { type: "p", text: "Step through code and watch callbacks move between the call stack, the microtask queue and the task queue. Notice that the microtask queue is always emptied before the next task is picked up." },
        { type: "viz", id: "js-event-loop", caption: "Conceptual model of one browser event-loop iteration (rendering omitted)." },
      ] },
      { id: "examples", blocks: [
        { type: "code", lang: "js", runnable: true, caption: "Microtasks scheduled inside tasks run before the next task", code: `setTimeout(() => {
  console.log("timeout 1");
  Promise.resolve().then(() => console.log("micro inside timeout 1"));
}, 0);
setTimeout(() => console.log("timeout 2"), 0);

Promise.resolve()
  .then(() => {
    console.log("micro 1");
    setTimeout(() => console.log("timeout 3"), 0);
  })
  .then(() => console.log("micro 2"));`, output: `micro 1
micro 2
timeout 1
micro inside timeout 1
timeout 2
timeout 3` },
      ] },
      { id: "edge-cases", title: "Edge cases and Node.js differences", blocks: [
        { type: "p", text: "**Node.js** runs the same microtask semantics but a different task loop, implemented by libuv in **phases**. Each phase has a FIFO queue of callbacks:" },
        { type: "table", head: ["Phase", "Runs"], rows: [
          ["timers", "Expired `setTimeout`/`setInterval` callbacks"],
          ["pending callbacks", "Some deferred system-level I/O callbacks (e.g. TCP errors)"],
          ["idle, prepare", "Internal"],
          ["poll", "Retrieve new I/O events and run their callbacks; may block waiting for I/O"],
          ["check", "`setImmediate` callbacks"],
          ["close callbacks", "e.g. `socket.on(\"close\")`"],
        ] },
        { type: "list", items: [
          "Since **Node 11**, the `process.nextTick` queue and then the promise microtask queue are drained after **each** callback (matching browsers); before that, only between phases.",
          "`process.nextTick` runs before promise microtasks (in CommonJS). In an ES module, top-level code is itself running inside a promise job, so a promise callback scheduled at top level can run before a nextTick.",
          "In the main module, `setTimeout(fn, 0)` vs `setImmediate` order is non-deterministic (depends on process timing); inside an I/O callback, `setImmediate` always runs first because check follows poll.",
          "See the Node track's event-loop lesson for libuv details: [Node event loop](/paths/nodejs/node-event-loop).",
        ] },
        { type: "code", lang: "js", caption: "Node (CommonJS): nextTick before promises", code: `process.nextTick(() => console.log("nextTick"));
Promise.resolve().then(() => console.log("promise"));`, output: `nextTick
promise` },
        { type: "list", items: [
          "Browsers dispatch a *real* user click to multiple listeners as separate callbacks, with a microtask checkpoint between them. A programmatic `el.click()` runs all listeners within the calling script's stack, so microtasks run only after all listeners — ordering differs!",
          "`requestAnimationFrame` callbacks run in the rendering step, before style/layout/paint, not as tasks.",
          "`MessageChannel`/`postMessage` tasks are often used as a faster \"next task\" than a clamped `setTimeout`.",
        ] },
      ] },
      { id: "mistakes", blocks: [
        { type: "callout", tone: "misconception", title: "\"The event loop is part of JavaScript/V8\"", text: "V8 has no event loop. The embedder provides it: Blink's scheduler in Chrome, libuv in Node. ECMAScript only defines jobs and asks the host to run them." },
        { type: "callout", tone: "misconception", title: "\"setTimeout(fn, 0) runs right after the current line\"", text: "It runs in a future task: after the current task, all microtasks, possibly a render, and any earlier tasks." },
        { type: "callout", tone: "misconception", title: "\"async code runs in parallel\"", text: "Callbacks are interleaved on one thread. Only the host's I/O and Workers are truly parallel." },
      ] },
      { id: "tradeoffs", blocks: [
        { type: "compare", items: [
          { title: "Microtask (`queueMicrotask`, promises)", points: ["Runs ASAP, before rendering", "Good for consistent state before anyone else observes it", "Can starve rendering and input"] },
          { title: "Task (`setTimeout`, `MessageChannel`)", points: ["Yields to rendering and input", "Higher latency (clamping, queues)", "Good for chunking long work"] },
          { title: "`requestAnimationFrame`", points: ["Aligned with frames", "Right place for visual updates", "Paused in background tabs"] },
        ] },
      ] },
      { id: "real-world", blocks: [
        { type: "list", items: [
          "React batches state updates and schedules work with `MessageChannel` tasks so the browser can render in between.",
          "Long tasks (>50 ms) hurt INP; split them by yielding to the event loop (`await scheduler.yield()` where supported, or `setTimeout`).",
          "In Node, CPU-heavy work blocks every request: offload to `worker_threads` or chunk it.",
        ] },
      ] },
      { id: "interview-short", blocks: [
        { type: "p", text: "JavaScript runs on a single thread with a call stack. Async work — timers, network, events — is done by the host, which queues callbacks. The event loop takes one task from a task queue, runs it to completion, then drains the entire microtask queue — promise callbacks, `await` continuations, `queueMicrotask` — and then the browser may render before picking the next task. So synchronous code runs first, then all microtasks, then the next timeout. In Node, the loop has phases — timers, poll, check for `setImmediate`, close — and `process.nextTick` runs even before promise microtasks." },
      ] },
      { id: "interview-deep", blocks: [
        { type: "p", text: "Cover: HostEnqueuePromiseJob and PromiseReactionJob; the microtask checkpoint draining recursively; when rendering happens and rAF's place; starvation; timer clamping; real vs synthetic click ordering; Node phases, the Node 11 change, nextTick vs promises (and the ESM nuance), and setImmediate vs setTimeout determinism." },
      ] },
      { id: "practice", blocks: [
        { type: "list", ordered: true, items: [
          "Predict, then run, ten mixed ordering snippets (Lydia Hallie's questions are good drills).",
          "Write a function that processes 1e6 items without freezing the page by yielding every 5 ms.",
          "Show starvation: compare a recursive `queueMicrotask` loop with a `setTimeout` loop while a CSS animation runs.",
        ] },
      ] },
      { id: "summary", blocks: [{ type: "list", items: [
        "One task → all microtasks → maybe render → next task.",
        "Microtasks: promise reactions, await continuations, queueMicrotask, MutationObserver.",
        "Tasks: script, timers, events, messages, I/O.",
        "Node: libuv phases; nextTick before promises; queues drained after each callback since Node 11.",
        "The event loop belongs to the host, not the engine.",
      ] }] },
    ],
    glossary: [
      { term: "Event loop", definition: "Host algorithm that schedules tasks, microtasks and rendering onto the JS thread." },
      { term: "Task (macrotask)", definition: "A unit of work queued by the host: script, timer, event, message, I/O callback." },
      { term: "Microtask", definition: "High-priority job run when the stack empties, before the next task (promise reactions, queueMicrotask)." },
      { term: "Microtask checkpoint", definition: "Point at which the host drains the microtask queue completely." },
      { term: "Job", definition: "ECMAScript's term for deferred work such as a PromiseReactionJob; hosts map promise jobs to microtasks." },
      { term: "libuv", definition: "C library providing Node's event loop and async I/O." },
      { term: "Starvation", definition: "One kind of work (e.g. endless microtasks) preventing other work (rendering, tasks) from running." },
    ],
    followUps: [
      { q: "Is `await` a microtask?", a: "The continuation after `await` is scheduled as a promise reaction job, i.e. a microtask, once the awaited promise settles." },
      { q: "Why does a `while(true)` loop freeze the page even with pending timers?", a: "The current task never finishes, so the loop never reaches the microtask checkpoint, rendering or the next task." },
      { q: "What's the difference between `setImmediate` and `setTimeout(fn, 0)` in Node?", a: "`setImmediate` runs in the check phase right after poll; `setTimeout` in the timers phase. From an I/O callback, immediate always fires first; from the main module the order is non-deterministic." },
      { q: "Where do `MutationObserver` callbacks run?", a: "As microtasks, which is why they see a batch of mutations after the current script finishes but before rendering." },
    ],
    quiz: [
      { id: "el-1", prompt: "What is the output order?", code: { lang: "js", code: `setTimeout(() => console.log("A"));
Promise.resolve().then(() => console.log("B"));
queueMicrotask(() => console.log("C"));
console.log("D");` }, options: ["D A B C", "D B C A", "B C D A", "D C B A"], answer: 1, explanation: "Sync first (D), then microtasks in FIFO order (B, C), then the timer task (A)." },
      { id: "el-2", prompt: "Which of these is NOT a microtask source?", options: ["Promise.then", "queueMicrotask", "MutationObserver", "setTimeout(fn, 0)"], answer: 3, explanation: "Timers enqueue tasks." },
      { id: "el-3", prompt: "In Node (CommonJS), which logs first: `process.nextTick` or `Promise.resolve().then`, both scheduled from the main script?", options: ["nextTick", "Promise", "Non-deterministic"], answer: 0, explanation: "Node drains the nextTick queue before the promise microtask queue." },
      { id: "el-4", prompt: "Why can an infinite chain of microtasks freeze rendering while an infinite chain of setTimeouts doesn't?", options: ["Microtasks are slower", "The checkpoint drains microtasks until empty before rendering can happen", "setTimeout runs on another thread", "Browsers prioritise timers over microtasks"], answer: 1, explanation: "Rendering opportunities only occur between tasks, after the microtask queue is empty." },
    ],
    questions: ["javascript/js-01", "javascript/js-14", "javascript/js-20", "javascript/js-09"],
  },
  outline({
    slug: "callbacks",
    title: "Callbacks and error-first callbacks",
    summary: "Passing functions to be called later: synchronous vs asynchronous callbacks, Node's error-first convention, callback hell, inversion of control, and promisifying.",
    level: "beginner",
    frequency: "high",
    minutes: 20,
    kinds: ["theory", "coding"],
    prerequisites: ["javascript/higher-order-functions", "javascript/sync-vs-async"],
    related: ["javascript/promises", "javascript/event-loop", "javascript/error-handling"],
    tags: ["callbacks", "error-first", "callback-hell", "promisify"],
    sources: [],
    objectives: [
      "Distinguish synchronous callbacks (`map`) from asynchronous ones (`setTimeout`, `fs.readFile`)",
      "Use Node's error-first signature `(err, result)` and propagate errors correctly",
      "Explain callback hell and inversion of control (called twice? never? synchronously?)",
      "Write `promisify` and avoid \"Zalgo\" (sometimes-sync, sometimes-async callbacks)",
    ],
    covers: [
      "Sync vs async callbacks",
      "Error-first callbacks; why `throw` inside an async callback can't be caught by the caller's try/catch",
      "Callback hell and how named functions / promises fix it",
      "Trust issues that promises solve (once-only resolution, always async)",
      "`util.promisify` and writing your own",
    ],
    questions: ["javascript/js-11", "javascript/js-14"],
  }),
  {
    slug: "promises",
    track: "javascript",
    title: "Promises: states, chaining and error propagation",
    summary: "A promise is a placeholder for a future value with three states. How `then` returns new promises, how values and errors flow down a chain, how reaction jobs are scheduled, and the classic mistakes.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 45,
    kinds: ["theory", "visualization", "coding", "quiz"],
    status: "authored",
    prerequisites: ["javascript/callbacks", "javascript/event-loop"],
    related: ["javascript/async-await", "javascript/promise-combinators", "javascript/error-handling", "javascript/timers"],
    tags: ["promises", "then", "chaining", "microtasks", "error-propagation", "thenable"],
    sources: [LYDIA],
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: [
        "Name the three states and explain that settlement happens once",
        "Explain why `then` always returns a *new* promise and how its callback's return value or throw determines that promise",
        "Trace error propagation through a chain and recovery with `catch`",
        "Explain promise reaction jobs and why resolving with a promise costs extra microtask ticks",
        "Avoid the common mistakes: forgotten `return`, nested promises, the explicit-construction anti-pattern, unhandled rejections",
      ] }] },
      { id: "intuition", blocks: [
        { type: "p", text: "A promise is a receipt for a meal being cooked. Right now it's *pending*. Later it becomes *fulfilled* (here's your meal) or *rejected* (kitchen's out of fish) — and once that happens it never changes. You can attach \"when it's ready, do X\" instructions at any time, even after it's ready; they still run, always asynchronously." },
      ] },
      { id: "definition", blocks: [
        { type: "table", head: ["State", "Meaning", "Transitions"], rows: [
          ["pending", "Not settled yet", "→ fulfilled or → rejected"],
          ["fulfilled", "Has a value", "Final"],
          ["rejected", "Has a reason (usually an Error)", "Final"],
        ] },
        { type: "list", items: [
          "**Settled** = fulfilled or rejected. **Resolved** = locked in: either settled, or following another promise/thenable (it may still be pending!).",
          "`new Promise(executor)` runs the executor **synchronously** with `resolve` and `reject` functions. Only the first call to either matters; a throw inside the executor rejects.",
          "`p.then(onFulfilled, onRejected)` registers reactions and returns a new promise. `catch(f)` is `then(undefined, f)`; `finally(f)` runs `f` without receiving the value and passes the original outcome through (unless `f` throws or returns a rejected promise).",
          "A **thenable** is any object with a `then` method; promises adopt the state of thenables they are resolved with.",
        ] },
      ] },
      { id: "why", blocks: [
        { type: "list", items: [
          "Fix callback problems: one result, exactly once, always async, composable, errors propagate like exceptions.",
          "Foundation of async/await, fetch, and almost every modern async API.",
        ] },
      ] },
      { id: "internals", blocks: [
        { type: "p", text: "A promise object holds `[[PromiseState]]`, `[[PromiseResult]]` and two lists of reaction records (fulfil/reject). Simplified mechanics:" },
        { type: "steps", steps: [
          { title: "`then` on a pending promise", detail: "Appends a reaction record (handler + the capability of the derived promise) to the lists." },
          { title: "`then` on a settled promise", detail: "Immediately enqueues a **PromiseReactionJob** via HostEnqueuePromiseJob (a microtask)." },
          { title: "Settling", detail: "`resolve(value)` with a non-thenable fulfils: every queued reaction becomes a PromiseReactionJob microtask, in registration order. `reject(reason)` does the same with the reject reactions." },
          { title: "Running a reaction job", detail: "Calls the handler with the result. If the handler returns `v`, the derived promise is resolved with `v`; if it throws `e`, the derived promise is rejected with `e`. A missing handler passes the value/reason through unchanged — this is how errors skip `then`s until a `catch`." },
          { title: "Resolving with a thenable", detail: "`resolve(otherPromise)` doesn't fulfil directly: it enqueues a **NewPromiseResolveThenableJob** that calls `otherPromise.then(resolve, reject)`, which in turn needs another job when `otherPromise` is already settled. Result: about two extra microtask ticks." },
        ] },
        { type: "p", text: "**Unhandled rejections.** If a promise is rejected with no reject handler by the time the host checks (browsers: after the microtask checkpoint; Node: after microtasks drain), the host reports it — `unhandledrejection` events in browsers, and since **Node 15** an unhandled rejection crashes the process by default." },
      ] },
      { id: "walkthrough", blocks: [
        { type: "code", lang: "js", runnable: true, code: `const p = new Promise((resolve, reject) => {
  resolve("first");
  resolve("ignored");                 // already resolved: no effect
  reject(new Error("ignored too"));
});
p.then((v) => console.log("A", v));

Promise.resolve(1)
  .then((v) => v + 1)                                  // 2
  .then((v) => { throw new Error("boom at " + v); })   // rejects
  .then(() => console.log("skipped"))                  // no reject handler: passes through
  .catch((e) => { console.log("B", e.message); return "recovered"; })
  .finally(() => console.log("C finally"))             // passes "recovered" through
  .then((v) => console.log("D", v));`, output: `A first
B boom at 2
C finally
D recovered` },
      ] },
      { id: "visualization", blocks: [
        { type: "p", text: "In the event-loop visualizer, follow each `.then` reaction as it becomes a microtask only when its promise settles. Each link in a chain therefore costs at least one microtask tick." },
        { type: "viz", id: "js-event-loop", caption: "Conceptual: promise reactions flowing through the microtask queue." },
      ] },
      { id: "examples", blocks: [
        { type: "code", lang: "js", runnable: true, caption: "Two chains interleave one tick at a time", code: `const order = [];
const p = Promise.resolve();
p.then(() => order.push("a1")).then(() => order.push("a2")).then(() => order.push("a3"));
p.then(() => order.push("b1")).then(() => order.push("b2"));
setTimeout(() => console.log(order.join(" ")));`, output: `a1 b1 a2 b2 a3` },
        { type: "code", lang: "js", runnable: true, caption: "Resolving with a promise costs two extra ticks", code: `const log = [];
new Promise((r) => r(Promise.resolve())).then(() => log.push("resolved-with-promise"));
Promise.resolve()
  .then(() => log.push("t1"))
  .then(() => log.push("t2"))
  .then(() => log.push("t3"));
setTimeout(() => console.log(log.join(" ")));`, output: `t1 t2 resolved-with-promise t3` },
        { type: "code", lang: "js", caption: "Promisifying a callback API", code: `const delay = (ms, value) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err, result) => (err ? reject(err) : resolve(result)));
    });
  };
}` },
      ] },
      { id: "edge-cases", blocks: [
        { type: "list", items: [
          "`then` callbacks always run asynchronously, even for already-resolved promises — no Zalgo.",
          "Returning a promise from `then` makes the chain wait for it (flattening). You can't get a promise of a promise.",
          "`Promise.resolve(p)` returns `p` itself if it is a native promise with the same constructor.",
          "Rejecting with a non-Error loses stack traces; always reject with `Error` instances.",
          "Errors thrown asynchronously inside an executor (e.g. in a setTimeout callback within it) are NOT caught by the promise.",
          "`then(onOk, onErr)` differs from `then(onOk).catch(onErr)`: the second also catches errors thrown by `onOk`.",
        ] },
      ] },
      { id: "mistakes", blocks: [
        { type: "callout", tone: "warning", title: "Forgetting to return", text: "`.then(() => { fetchMore(); })` doesn't wait for `fetchMore` and loses its errors. Return the promise (or use async/await)." },
        { type: "callout", tone: "warning", title: "The explicit-construction anti-pattern", text: "Wrapping an existing promise in `new Promise((res, rej) => p.then(res, rej))` adds nothing and often swallows errors. Just return/chain `p`. Use `new Promise` only to adapt callback APIs." },
        { type: "callout", tone: "misconception", title: "\"Promises make code run in parallel / in the background\"", text: "A promise is just a notification mechanism. The executor runs synchronously on the main thread; concurrency comes from the underlying async operation (timer, I/O)." },
      ] },
      { id: "tradeoffs", blocks: [
        { type: "compare", items: [
          { title: "Promises", points: ["Single value, once", "Composable (all/race/any)", "Eager: work starts at creation", "Not cancellable by themselves (use AbortController)"] },
          { title: "Callbacks / event emitters / observables", points: ["Multiple values over time", "Cancellation via unsubscribe", "Harder error handling and composition"] },
        ] },
      ] },
      { id: "interview-short", blocks: [
        { type: "p", text: "A promise represents the eventual result of an async operation and is pending, fulfilled or rejected — settling happens once. `then` registers callbacks and returns a new promise resolved with whatever the callback returns, or rejected with what it throws, so values and errors flow down the chain; a `catch` handles any rejection above it and can recover. Callbacks always run asynchronously as microtasks, which is why they run before `setTimeout` callbacks. Returning a promise from `then` flattens it, so the chain waits." },
      ] },
      { id: "interview-deep", blocks: [
        { type: "p", text: "Discuss reaction records and PromiseReactionJobs, HostEnqueuePromiseJob, pass-through of missing handlers, thenable adoption via NewPromiseResolveThenableJob (extra ticks), `finally` semantics, unhandled-rejection tracking (Node 15 default crash), and implement a minimal promise or `promisify` on a whiteboard." },
      ] },
      { id: "practice", blocks: [{ type: "list", ordered: true, items: [
        "Implement `promiseAll`, `promiseAllSettled`, `promiseAny` and `promisify` (see the Promise utility milestone).",
        "Implement `retry(fn, { retries, delay })` with exponential backoff.",
        "Write a minimal `MyPromise` supporting `then` chaining and thenable adoption.",
      ] }] },
      { id: "summary", blocks: [{ type: "list", items: [
        "pending → fulfilled | rejected, once.",
        "Executor is synchronous; reactions are microtasks.",
        "`then` returns a new promise: return → fulfil, throw → reject.",
        "Errors skip to the nearest catch; catch can recover.",
        "Always return promises in chains; reject with Errors; handle rejections.",
      ] }] },
    ],
    glossary: [
      { term: "Settled", definition: "A promise that is fulfilled or rejected." },
      { term: "Resolved", definition: "A promise whose fate is locked in — settled, or following another promise." },
      { term: "Executor", definition: "The function passed to `new Promise`, run synchronously with resolve/reject." },
      { term: "Thenable", definition: "Any object with a `then` method; promises assimilate thenables." },
      { term: "PromiseReactionJob", definition: "Spec job that runs a then/catch handler and settles the derived promise; queued as a microtask." },
      { term: "Unhandled rejection", definition: "A rejected promise with no rejection handler attached when the host checks." },
    ],
    followUps: [
      { q: "Are promises cancellable?", a: "No. You cancel the underlying work (e.g. with an AbortSignal passed to fetch) and let the promise reject with an AbortError." },
      { q: "What's the difference between `Promise.resolve(x)` and `new Promise(r => r(x))`?", a: "Mostly the same, except `Promise.resolve` returns `x` unchanged if it's already a native promise." },
      { q: "Can `finally` change the result?", a: "Only by throwing or returning a rejected promise; a normal return value is ignored and the original outcome passes through." },
    ],
    quiz: [
      { id: "pm-1", prompt: "What is logged?", code: { lang: "js", code: `Promise.reject(new Error("x"))
  .then(() => console.log("a"))
  .catch(() => console.log("b"))
  .then(() => console.log("c"));` }, options: ["a c", "b c", "b", "a b c"], answer: 1, explanation: "The rejection skips the first then; catch handles it and returns undefined, so the chain continues fulfilled." },
      { id: "pm-2", prompt: "When does the executor passed to `new Promise` run?", options: ["Synchronously, immediately", "As a microtask", "As a task", "When `then` is called"], answer: 0, explanation: "Executors run synchronously during construction." },
      { id: "pm-3", prompt: "What does `.then(() => { fetchData(); })` resolve with?", options: ["fetchData's result", "undefined, without waiting", "A pending promise", "It rejects"], answer: 1, explanation: "Without `return`, the callback returns undefined immediately; the chain doesn't wait." },
    ],
    questions: ["javascript/js-09", "javascript/js-11", "javascript/js-01", "javascript/js-41"],
  },
  {
    slug: "async-await",
    track: "javascript",
    title: "async/await",
    summary: "Syntax that lets asynchronous code read like synchronous code: what an async function returns, how `await` suspends and resumes via microtasks, error handling, sequential vs parallel awaits, and the desugaring to promises.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 40,
    kinds: ["theory", "visualization", "coding", "quiz"],
    status: "authored",
    prerequisites: ["javascript/promises", "javascript/event-loop"],
    related: ["javascript/promise-combinators", "javascript/generators-iterators", "javascript/async-iteration", "javascript/error-handling", "javascript/abortcontroller"],
    tags: ["async", "await", "microtasks", "error-handling", "concurrency", "top-level-await"],
    sources: [LYDIA],
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: [
        "State what an async function returns in every case (return value, throw, returned promise)",
        "Explain how `await` suspends the function, frees the call stack, and resumes in a microtask",
        "Desugar async/await into promises (and generators)",
        "Handle errors with try/catch and avoid unhandled rejections",
        "Choose sequential vs concurrent awaits (`Promise.all`) and avoid `forEach` with async callbacks",
      ] }] },
      { id: "intuition", blocks: [
        { type: "p", text: "`await` is a bookmark. When the function reaches `await somePromise`, it puts a bookmark in, steps off the call stack so other code can run, and asks the promise to wake it when it settles. When woken, it continues from the bookmark with all its local variables intact." },
      ] },
      { id: "definition", blocks: [
        { type: "list", items: [
          "An **async function** always returns a promise. `return v` fulfils it with `v` (adopting `v` if it's a promise); `throw e` rejects it with `e`.",
          "Code before the first `await` runs **synchronously** when the function is called.",
          "`await x` converts `x` to a promise (`PromiseResolve`), suspends the function, and resumes it with the fulfilment value — or throws the rejection reason at the `await` site.",
          "`await` is allowed in async functions and at the top level of ES modules (**top-level await**, ES2022).",
        ] },
      ] },
      { id: "why", blocks: [
        { type: "p", text: "Linear control flow: loops, conditionals and try/catch/finally work naturally across async steps, without nesting or chained `then`s. Stack traces and debugging are better too (V8 async stack traces)." },
      ] },
      { id: "internals", blocks: [
        { type: "steps", steps: [
          { title: "Call", detail: "A promise capability (the function's result promise) is created; the function body starts running synchronously in a new execution context." },
          { title: "`await v`", detail: "`promise = PromiseResolve(%Promise%, v)` (a native promise is used as-is; anything else is wrapped). Then PerformPromiseThen(promise, onFulfilled, onRejected) with internal closures that resume this function." },
          { title: "Suspend", detail: "The execution context is removed from the stack (its state — locals, position — saved, like a generator). Control returns to the caller, which receives the result promise." },
          { title: "Resume", detail: "When `promise` settles, a PromiseReactionJob microtask runs the closure: the context is pushed back and execution continues with the value, or the reason is thrown at the `await`." },
          { title: "Finish", detail: "Returning resolves the result promise; throwing rejects it." },
        ] },
        { type: "callout", tone: "spec-vs-impl", title: "The await optimisation (ES2019 / V8 7.2)", text: "Originally `await p` always wrapped `p` in a new promise and resolved it with `p`, costing 3 microtask ticks. A 2019 spec change (driven by V8's \"fast async\" work) uses PromiseResolve, so awaiting a native promise now costs a single tick. Old Node versions (≤ 11) show different orderings for the same code." },
        { type: "p", text: "**Desugaring.** Conceptually, an async function is a generator driven by a promise runner: each `await` is a `yield` of a promise, and the runner calls `gen.next(value)` / `gen.throw(err)` when it settles. Libraries like `co` did exactly this before async/await existed." },
      ] },
      { id: "walkthrough", blocks: [
        { type: "code", lang: "js", runnable: true, code: `async function task() {
  console.log("2 task start (sync)");
  const v = await 42;               // suspend; resume in a microtask
  console.log("4 resumed with", v);
  return "done";
}
console.log("1 before");
task().then((r) => console.log("5", r));
console.log("3 after call");`, output: `1 before
2 task start (sync)
3 after call
4 resumed with 42
5 done` },
        { type: "steps", steps: [
          { title: "Call task()", detail: "Runs synchronously until `await 42`: logs 2." },
          { title: "await 42", detail: "42 is wrapped in a fulfilled promise; the resume closure is enqueued as a microtask. task() returns its pending promise." },
          { title: "Caller continues", detail: "`.then` registers on that promise; logs 3. Script ends." },
          { title: "Microtask: resume", detail: "Logs 4; `return \"done\"` fulfils task's promise, enqueuing the `.then` reaction." },
          { title: "Microtask: then", detail: "Logs 5." },
        ] },
      ] },
      { id: "visualization", blocks: [
        { type: "p", text: "Watch the async function's frame leave the call stack at each `await` and re-enter when its continuation microtask runs. The caller keeps running in between." },
        { type: "viz", id: "js-async-await", caption: "Conceptual model of async function suspension and resumption." },
      ] },
      { id: "examples", blocks: [
        { type: "code", lang: "js", runnable: true, caption: "Sequential vs concurrent awaits", code: `const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));

(async () => {
  let t = Date.now();
  const a = await sleep(50, "a");
  const b = await sleep(50, "b");              // starts only after a finishes
  const sequential = Date.now() - t >= 100;

  t = Date.now();
  const [c, d] = await Promise.all([sleep(50, "c"), sleep(50, "d")]); // both started at once
  const concurrent = Date.now() - t < 90;

  console.log(a + b + c + d, sequential, concurrent);
})();`, output: `abcd true true` },
        { type: "code", lang: "js", runnable: true, caption: "Errors: await throws at the await site", code: `async function load() {
  try {
    await Promise.reject(new Error("nope"));
    console.log("never");
  } catch (e) {
    console.log("caught", e.message);
  } finally {
    console.log("cleanup");
  }
}
load();`, output: `caught nope
cleanup` },
        { type: "code", lang: "js", runnable: true, caption: "return vs return await (tick counts, current engines)", code: `const log = [];
async function viaReturn() { return Promise.resolve(); }
async function viaReturnAwait() { return await Promise.resolve(); }
viaReturn().then(() => log.push("return"));
viaReturnAwait().then(() => log.push("return await"));
Promise.resolve()
  .then(() => log.push("t1")).then(() => log.push("t2"))
  .then(() => log.push("t3")).then(() => log.push("t4"));
setTimeout(() => console.log(log.join(" ")));`, output: `t1 return await t2 return t3 t4` },
        { type: "p", text: "Returning a promise from an async function resolves the result promise *with a thenable* (two extra ticks), while `return await` unwraps it first. More importantly, `return await` inside `try` lets the `catch` handle the rejection; a bare `return promise` doesn't." },
      ] },
      { id: "edge-cases", blocks: [
        { type: "list", items: [
          "`array.forEach(async (x) => { await … })` does not wait — `forEach` ignores returned promises. Use `for…of` (sequential) or `await Promise.all(array.map(async …))` (concurrent).",
          "A promise created but awaited later can reject *before* you await it, triggering an unhandled-rejection warning (or crash in Node). Attach handlers early or use `Promise.all`.",
          "`await` on a non-promise still yields one microtask tick.",
          "Top-level await in a module blocks evaluation of modules that import it (siblings still evaluate).",
          "Async functions can't be constructors and `await` is not allowed in non-async nested functions/callbacks.",
        ] },
      ] },
      { id: "mistakes", blocks: [
        { type: "callout", tone: "misconception", title: "\"await blocks the thread\"", text: "It suspends only the async function. The thread keeps running other code, events and rendering." },
        { type: "callout", tone: "warning", title: "Accidental waterfalls", text: "Awaiting independent requests one after another multiplies latency. Start them first, then await together." },
      ] },
      { id: "tradeoffs", blocks: [
        { type: "compare", items: [
          { title: "async/await", points: ["Readable linear flow", "try/catch error handling", "Easy to serialise accidentally"] },
          { title: "Raw promise chains", points: ["Explicit concurrency and composition", "Nesting and error placement are error-prone", "Fine for small transforms"] },
        ] },
      ] },
      { id: "interview-short", blocks: [
        { type: "p", text: "An async function always returns a promise: its return value fulfils it and a throw rejects it. Inside it, `await` pauses the function until the awaited promise settles, without blocking the thread — the function's frame is suspended and the continuation is scheduled as a microtask, so other code keeps running. Errors from awaited promises are thrown at the await, so try/catch works. It's syntactic sugar over promises; for independent operations you start them together and use `Promise.all` instead of awaiting one by one." },
      ] },
      { id: "interview-deep", blocks: [
        { type: "p", text: "Explain PromiseResolve + PerformPromiseThen at each await, execution-context suspension like generators, the ES2019 tick reduction, `return` vs `return await` (ticks and try/catch), unhandled rejections from late-awaited promises, top-level await's effect on the module graph, and the generator-runner desugaring." },
      ] },
      { id: "practice", blocks: [{ type: "list", ordered: true, items: [
        "Rewrite a three-level `then` chain with async/await and add per-step error handling.",
        "Implement `mapLimit(items, n, asyncFn)` with async/await.",
        "Implement a tiny `run(generatorFn)` that drives a generator yielding promises — your own async/await.",
      ] }] },
      { id: "summary", blocks: [{ type: "list", items: [
        "Async functions return promises.",
        "Sync until the first await; each await suspends and resumes via a microtask.",
        "Errors are thrown at await; use try/catch.",
        "Concurrent work: start first, `await Promise.all`.",
        "Never `forEach` with async callbacks.",
      ] }] },
    ],
    glossary: [
      { term: "Async function", definition: "A function declared with `async` that returns a promise and may use `await`." },
      { term: "Suspension", definition: "Saving a function's execution state and removing it from the call stack until it is resumed." },
      { term: "Continuation", definition: "The rest of an async function after an `await`, scheduled to run when the awaited promise settles." },
      { term: "Top-level await", definition: "Using `await` at the top level of an ES module (ES2022)." },
      { term: "Waterfall", definition: "Unnecessarily sequential async operations that could have run concurrently." },
    ],
    followUps: [
      { q: "How is async/await related to generators?", a: "Both suspend and resume an execution context. async/await is equivalent to a generator that yields promises plus a runner that resumes it on settlement." },
      { q: "How do you add a timeout to an awaited operation?", a: "Race it against a timer (`Promise.race`), or better, pass `AbortSignal.timeout(ms)` to APIs like fetch so the work is actually cancelled." },
      { q: "Does `await` inside a `for` loop run iterations in parallel?", a: "No, each iteration waits. That's correct when order or rate limiting matters; otherwise map to promises and `Promise.all`." },
    ],
    quiz: [
      { id: "aa-1", prompt: "What does `(async () => { throw new Error(\"x\") })()` evaluate to?", options: ["Throws synchronously", "A rejected promise", "undefined", "A fulfilled promise with an Error"], answer: 1, explanation: "Throws inside async functions reject the returned promise." },
      { id: "aa-2", prompt: "What is the output order?", code: { lang: "js", code: `async function f() { console.log(1); await null; console.log(3); }
f();
console.log(2);` }, options: ["1 2 3", "1 3 2", "2 1 3", "3 1 2"], answer: 0, explanation: "f runs synchronously until await; the continuation is a microtask after the script." },
      { id: "aa-3", prompt: "Which runs three independent requests concurrently?", options: ["for (const u of urls) await fetch(u)", "urls.forEach(async u => await fetch(u))", "await Promise.all(urls.map(u => fetch(u)))", "await urls.map(fetch)"], answer: 2, explanation: "Option 2 also starts them concurrently but doesn't wait or handle errors; `await` on an array doesn't wait for its elements." },
    ],
    questions: ["javascript/js-07", "javascript/js-11", "javascript/js-01"],
  },
  outline({
    slug: "promise-combinators",
    title: "Promise.all, allSettled, race and any",
    summary: "The four combinators for running promises concurrently — their resolution and rejection rules, empty-input behaviour, and how to implement them.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 25,
    kinds: ["theory", "coding"],
    prerequisites: ["javascript/promises"],
    related: ["javascript/async-await", "javascript/abortcontroller", "javascript/error-handling"],
    tags: ["Promise.all", "Promise.allSettled", "Promise.race", "Promise.any", "AggregateError", "concurrency"],
    sources: [],
    objectives: [
      "State each combinator's rule: all (all fulfil, or first rejection), allSettled (always fulfils with outcomes), race (first to settle), any (first fulfilment, or AggregateError)",
      "Know the empty-iterable results: all/allSettled → `[]`, any → rejects with AggregateError, race → forever pending",
      "Explain that combinators don't cancel the losers — the other operations keep running",
      "Implement `promiseAll` and friends preserving input order",
    ],
    covers: [
      "Semantics table and ordering guarantees",
      "Non-promise inputs are wrapped with `Promise.resolve`",
      "Failure handling: fail-fast vs collect-all",
      "Timeouts with `race` vs real cancellation with AbortSignal",
      "Polyfills and concurrency limiting (`pLimit`)",
    ],
    questions: ["javascript/js-41", "javascript/js-09"],
  }),
  {
    slug: "timers",
    track: "javascript",
    title: "Timers: setTimeout, setInterval and friends",
    summary: "How timers are scheduled as tasks on the event loop, why the delay is only a minimum, clamping and throttling, setInterval drift vs recursive setTimeout, and Node's setImmediate.",
    level: "beginner",
    frequency: "high",
    minutes: 25,
    kinds: ["theory", "visualization", "quiz"],
    status: "authored",
    prerequisites: ["javascript/event-loop"],
    related: ["javascript/debounce-throttle", "javascript/storage-workers-raf", "javascript/abortcontroller", "nodejs/node-event-loop"],
    tags: ["setTimeout", "setInterval", "clearTimeout", "clamping", "setImmediate"],
    sources: [],
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: [
        "Explain that a timer's delay is a *minimum* before its callback is queued as a task",
        "Know the clamping rules (nested timers ≥ 4 ms, background-tab throttling, Node's 1 ms minimum)",
        "Prefer recursive `setTimeout` to `setInterval` for async or variable-length work",
        "Clear timers to avoid leaks and stale callbacks",
      ] }] },
      { id: "intuition", blocks: [
        { type: "p", text: "`setTimeout(fn, 100)` is like asking a receptionist to put a ticket on the chef's rail in 100 ms. The receptionist (the host) is punctual about *adding the ticket*, but the chef (the JS thread) only picks it up after finishing the current dish and all the sticky notes (microtasks)." },
      ] },
      { id: "definition", blocks: [
        { type: "list", items: [
          "`setTimeout(fn, delay, ...args)` → id. Runs `fn(...args)` once, no sooner than `delay` ms later. `clearTimeout(id)` cancels it.",
          "`setInterval(fn, delay, ...args)` → id. Re-queues `fn` every `delay` ms until `clearInterval(id)`.",
          "Timers are defined by the host (HTML Standard, Node), not by ECMAScript. Their callbacks run as **tasks**.",
          "In browsers the id is a number; in Node it's a `Timeout` object (with `ref()`/`unref()`).",
        ] },
      ] },
      { id: "internals", blocks: [
        { type: "steps", steps: [
          { title: "Schedule", detail: "The host records the callback and a due time; nothing is queued yet." },
          { title: "Wait (off the JS thread)", detail: "The host's timer machinery tracks the due time while JS keeps running other code." },
          { title: "Queue", detail: "At/after the due time, a task is queued on the timer task source." },
          { title: "Run", detail: "When the event loop picks that task (after the current task and its microtasks, and any earlier tasks), the callback runs." },
        ] },
        { type: "callout", tone: "spec-vs-impl", title: "Clamping and throttling", text: "HTML clamps timers nested more than 5 levels deep to at least 4 ms. Browsers throttle timers in background tabs (typically to once per second, more aggressively after minutes hidden). Node treats delays below 1 ms as 1 ms and runs expired timers in the event loop's *timers* phase; `setImmediate` runs in the *check* phase." },
        { type: "p", text: "**setInterval drift and overlap.** `setInterval` schedules on a fixed cadence regardless of how long the callback or the async work it starts takes. If each poll triggers a 3-second request on a 1-second interval, requests pile up. A recursive `setTimeout` scheduled *after* the work finishes guarantees spacing and no overlap." },
      ] },
      { id: "visualization", blocks: [
        { type: "p", text: "In the event-loop visualizer, watch a `setTimeout(…, 0)` callback wait in the task queue while synchronous code and every microtask run first." },
        { type: "viz", id: "js-event-loop", caption: "Conceptual: timer callbacks are tasks, queued behind microtasks." },
      ] },
      { id: "examples", blocks: [
        { type: "code", lang: "js", runnable: true, caption: "A busy main thread delays timers; extra args; clearTimeout", code: `const start = Date.now();
setTimeout((a, b) => console.log("args:", a, b), 10, "x", "y");
const id = setTimeout(() => console.log("never"), 5);
clearTimeout(id);
setTimeout(() => {
  console.log("blocked timer late:", Date.now() - start >= 100);
}, 0);
while (Date.now() - start < 100) {}   // block the thread for 100 ms`, output: `blocked timer late: true
args: x y` },
        { type: "code", lang: "js", caption: "Polling without overlap: schedule the next run after the previous finishes", code: `async function poll(url, intervalMs, signal) {
  while (!signal.aborted) {
    try {
      const res = await fetch(url, { signal });
      if (res.ok) console.log(await res.json());
    } catch (e) {
      if (signal.aborted) break;
      console.error(e);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}` },
      ] },
      { id: "edge-cases", blocks: [
        { type: "list", items: [
          "Delays larger than 2,147,483,647 ms (~24.8 days) overflow a 32-bit int and fire immediately.",
          "Passing a string as the callback (`setTimeout(\"code\", 0)`) evals it — avoid.",
          "`this` inside a regular-function timer callback is the global object in browsers (and the Timeout object in Node); use arrows or bind.",
          "Timers keep their callbacks (and everything those close over) alive until they fire or are cleared — a classic leak with intervals.",
          "In the Node main module, `setTimeout(fn, 0)` vs `setImmediate(fn)` order is non-deterministic.",
        ] },
      ] },
      { id: "mistakes", blocks: [
        { type: "callout", tone: "misconception", title: "\"setTimeout(fn, 1000) runs after exactly one second\"", text: "It runs no sooner than one second, and possibly much later if the thread is busy or the tab is in the background. For accurate clocks compute from `Date.now()`/`performance.now()` instead of counting ticks." },
        { type: "callout", tone: "misconception", title: "\"setTimeout(fn, 0) runs before promises\"", text: "Promise callbacks are microtasks and always run before the next timer task." },
      ] },
      { id: "interview-short", blocks: [
        { type: "p", text: "Timers are host APIs: `setTimeout` schedules a callback to be queued as a task after at least the given delay, `setInterval` repeats it. The delay is a minimum — the callback waits for the current task, all microtasks and earlier tasks — and browsers clamp nested timers to 4 ms and throttle background tabs. For repeated async work I use a recursive `setTimeout` so runs never overlap, and I always clear timers on teardown." },
      ] },
      { id: "summary", blocks: [{ type: "list", items: [
        "Delay = minimum; callbacks are tasks.",
        "Microtasks run before timers.",
        "Clamping (4 ms nested), background throttling, Node 1 ms minimum.",
        "Recursive setTimeout > setInterval for async work.",
        "Clear timers to avoid leaks.",
      ] }] },
    ],
    glossary: [
      { term: "Timer task", definition: "The task queued by the host when a timer's delay has elapsed." },
      { term: "Clamping", definition: "Raising very small timer delays to a minimum (e.g. 4 ms for deeply nested timers)." },
      { term: "Drift", definition: "Gradual timing error when an interval's actual period differs from the requested one." },
      { term: "`setImmediate`", definition: "Node API running a callback in the check phase, right after I/O polling." },
    ],
    followUps: [
      { q: "How would you implement setInterval with setTimeout?", a: "A function that runs the callback and then schedules itself again with setTimeout, storing the latest id so a `clear` function can cancel it." },
      { q: "How do you make an accurate countdown?", a: "Store the target end time and on each tick compute `end - Date.now()`; ticks may be late, but the displayed value stays correct." },
    ],
    quiz: [
      { id: "tm-1", prompt: "What is the output order?", code: { lang: "js", code: `setTimeout(() => console.log("t"), 0);
Promise.resolve().then(() => console.log("p"));
console.log("s");` }, options: ["t p s", "s t p", "s p t", "p s t"], answer: 2, explanation: "Synchronous code, then microtasks, then the timer task." },
      { id: "tm-2", prompt: "Why prefer recursive setTimeout for polling an API?", options: ["It's faster", "The next request is scheduled only after the previous one finishes, so requests never overlap", "setInterval is deprecated", "It avoids clamping"], answer: 1, explanation: "setInterval keeps a fixed cadence regardless of how long each request takes." },
    ],
    questions: ["javascript/js-20", "javascript/js-01"],
  },
  {
    slug: "generators-iterators",
    track: "javascript",
    title: "Iterators, Symbol.iterator and generators",
    summary: "The iteration protocols behind for…of and spread, writing custom iterables, and generator functions that pause at `yield` — including two-way communication, `return`/`throw`, laziness and cleanup.",
    level: "intermediate",
    frequency: "high",
    minutes: 40,
    kinds: ["theory", "coding", "quiz"],
    status: "authored",
    prerequisites: ["javascript/symbols", "javascript/closures"],
    related: ["javascript/async-iteration", "javascript/async-await", "javascript/arrays-iteration", "javascript/map-set"],
    tags: ["iterators", "iterables", "Symbol.iterator", "generators", "yield", "lazy-evaluation"],
    sources: [],
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: [
        "Define the iterable and iterator protocols precisely",
        "Make any object iterable with `[Symbol.iterator]`",
        "Write generators; explain that calling one runs no code and that `next(v)` sends values in",
        "Use `return()`/`throw()` and `finally` for cleanup (including on `break`)",
        "Build lazy pipelines over infinite sequences",
      ] }] },
      { id: "intuition", blocks: [
        { type: "p", text: "An **iterator** is a dispenser: each press of `next()` gives you one item and tells you whether it's empty. An **iterable** is anything that can hand you a fresh dispenser. A **generator** is the easiest way to build a dispenser: write a normal-looking function and put `yield` wherever you want to hand out an item — the function pauses there until the next press." },
      ] },
      { id: "definition", blocks: [
        { type: "list", items: [
          "**Iterable protocol**: an object with a `[Symbol.iterator]()` method returning an iterator. Built-ins: Array, String, Map, Set, arguments, NodeList, typed arrays.",
          "**Iterator protocol**: an object with `next()` returning `{ value, done }`; optionally `return()` (called on early exit) and `throw()`.",
          "**Consumers**: `for…of`, spread `[...x]`, array destructuring, `Array.from`, `Promise.all`, `new Map(iterable)`, `yield*`.",
          "**Generator function** (`function*`): calling it returns a generator object (both iterator and iterable) without running the body. Each `next(v)` runs until the next `yield`, which produces a value; `v` becomes the result of the paused `yield` expression.",
        ] },
      ] },
      { id: "why", blocks: [
        { type: "list", items: [
          "Uniform iteration across data structures, including your own (trees, ranges, paginated APIs).",
          "Laziness: compute values on demand, handle infinite sequences, avoid building big arrays.",
          "Generators were the foundation for async/await (pausable functions) and power Redux-Saga-style control flow.",
        ] },
      ] },
      { id: "internals", blocks: [
        { type: "p", text: "A generator object stores a suspended **execution context** (its locals, its position) and a state: *suspendedStart*, *suspendedYield*, *executing* or *completed*. `next(v)` pushes that context back onto the call stack and resumes; `yield` saves it and pops it off, returning `{ value, done: false }` to the caller. Returning (or falling off the end) produces `{ value: returnValue, done: true }`, after which every `next()` gives `{ value: undefined, done: true }`." },
        { type: "p", text: "`gen.return(x)` resumes the generator as if `return x` happened at the paused `yield`, so `finally` blocks run. `gen.throw(e)` resumes by throwing `e` at the `yield`, which a `try/catch` inside the generator can handle. `for…of` calls the iterator's `return()` on `break`, `return` or a thrown error — so generator cleanup code runs reliably." },
        { type: "callout", tone: "note", title: "Same machinery as async functions", text: "Suspending and resuming an execution context is exactly what `await` does. The difference is who resumes it: the caller (`next()`) for generators, a promise reaction job for async functions." },
      ] },
      { id: "walkthrough", blocks: [
        { type: "code", lang: "js", runnable: true, code: `function* counter() {
  console.log("started");
  const x = yield 1;
  console.log("received", x);
  yield x * 2;
  return "done";
}
const it = counter();          // nothing runs yet
console.log("created");
console.log(JSON.stringify(it.next()));     // runs to first yield
console.log(JSON.stringify(it.next(21)));   // 21 becomes the value of 'yield 1'
console.log(JSON.stringify(it.next()));
console.log(JSON.stringify(it.next()));`, output: `created
started
{"value":1,"done":false}
received 21
{"value":42,"done":false}
{"value":"done","done":true}
{"done":true}` },
        { type: "p", text: "(The last line is `{ value: undefined, done: true }`; `JSON.stringify` omits undefined properties.) Note that the argument to the *first* `next()` is discarded — there's no paused `yield` to receive it yet." },
      ] },
      { id: "examples", blocks: [
        { type: "code", lang: "js", runnable: true, caption: "A hand-written iterable, and a generator-based one for a tree", code: `const range = {
  from: 1, to: 3,
  [Symbol.iterator]() {
    let cur = this.from;
    const last = this.to;
    return { next: () => (cur <= last ? { value: cur++, done: false } : { value: undefined, done: true }) };
  },
};
console.log([...range].join(), Math.max(...range));

class Tree {
  constructor(v, kids = []) { this.v = v; this.kids = kids; }
  *[Symbol.iterator]() {          // generator method
    yield this.v;
    for (const k of this.kids) yield* k;   // delegate to child iterables
  }
}
const t = new Tree(1, [new Tree(2, [new Tree(3)]), new Tree(4)]);
console.log([...t].join());`, output: `1,2,3 3
1,2,3,4` },
        { type: "code", lang: "js", runnable: true, caption: "Lazy pipeline over an infinite sequence", code: `function* naturals() { let n = 1; while (true) yield n++; }
function* map(f, it) { for (const x of it) yield f(x); }
function* take(n, it) {
  for (const x of it) {
    if (n-- <= 0) return;
    yield x;
  }
}
console.log([...take(4, map((x) => x * x, naturals()))].join());`, output: `1,4,9,16` },
        { type: "code", lang: "js", runnable: true, caption: "Cleanup on break; return() and throw()", code: `function* withCleanup() {
  try { yield 1; yield 2; }
  finally { console.log("cleanup"); }
}
for (const v of withCleanup()) { console.log("got", v); break; }

const g2 = (function* () {
  try { yield 1; }
  catch (e) { console.log("caught inside", e); yield "after"; }
})();
g2.next();
console.log(JSON.stringify(g2.throw("err")));`, output: `got 1
cleanup
caught inside err
{"value":"after","done":false}` },
      ] },
      { id: "edge-cases", blocks: [
        { type: "list", items: [
          "Generators are single-use: once completed, iterating again yields nothing. An iterable *class* can return a fresh generator each time.",
          "Plain objects are not iterable (`for…of {}` throws TypeError); use `Object.entries(obj)`.",
          "A generator's `return` value is ignored by `for…of` and spread (they stop at `done: true`).",
          "Iterator helpers (`iterator.map/filter/take/toArray`, ES2025) are available in recent engines — check support before relying on them.",
          "Arrow functions can't be generators.",
        ] },
      ] },
      { id: "mistakes", blocks: [
        { type: "callout", tone: "misconception", title: "\"Calling a generator function runs it\"", text: "It only creates the generator object. Nothing runs until the first `next()`." },
        { type: "callout", tone: "warning", title: "Spreading infinite iterators", text: "`[...naturals()]` never terminates. Limit with `take` first." },
      ] },
      { id: "tradeoffs", blocks: [
        { type: "compare", items: [
          { title: "Generators / lazy iteration", points: ["Memory-efficient, supports infinite data", "Composable pipelines", "Per-item overhead; harder to debug"] },
          { title: "Arrays + map/filter", points: ["Simple, fast for small/medium data", "Materialises every intermediate array"] },
        ] },
      ] },
      { id: "interview-short", blocks: [
        { type: "p", text: "An iterable is an object with a `Symbol.iterator` method that returns an iterator; an iterator has a `next()` method returning `{ value, done }`. `for…of`, spread and destructuring use this protocol, so you can make any object iterable. A generator function, declared with `function*`, returns a generator object that implements both protocols: each `next()` runs the body until the next `yield`, pausing with its state saved, and the value passed to `next` becomes the result of the `yield`. They're great for lazy and infinite sequences and custom iteration." },
      ] },
      { id: "interview-deep", blocks: [
        { type: "p", text: "Explain generator states and suspended execution contexts, two-way communication, `return()`/`throw()` and finally semantics, `for…of` calling `return()` on early exit, `yield*` delegation, the link to async/await (generator + promise runner), and async generators for streams." },
      ] },
      { id: "summary", blocks: [{ type: "list", items: [
        "Iterable: `[Symbol.iterator]()` → iterator. Iterator: `next()` → `{ value, done }`.",
        "Generators pause at `yield`; `next(v)` resumes and sends `v` in.",
        "`return()`/`throw()` resume with a return/throw; `finally` runs on early exit.",
        "Lazy, composable, infinite-friendly.",
      ] }] },
    ],
    glossary: [
      { term: "Iterable", definition: "An object implementing `[Symbol.iterator]()`." },
      { term: "Iterator", definition: "An object with `next()` returning `{ value, done }`." },
      { term: "Generator", definition: "Object returned by a `function*`; a pausable iterator." },
      { term: "`yield*`", definition: "Delegates iteration to another iterable inside a generator." },
      { term: "Lazy evaluation", definition: "Computing values only when they are requested." },
    ],
    followUps: [
      { q: "How would you implement async/await using generators?", a: "Write `run(genFn)`: call `gen.next()`, and whenever it yields a promise, wait for it and call `gen.next(value)` or `gen.throw(err)`; resolve the outer promise when `done`." },
      { q: "What's the difference between an iterator and an iterable?", a: "The iterable produces iterators (often fresh each time); the iterator holds the iteration state and is consumed." },
    ],
    quiz: [
      { id: "gi-1", prompt: "What does `[...(function* () { yield 1; return 2; yield 3; })()]` produce?", options: ["[1, 2, 3]", "[1, 2]", "[1]", "[]"], answer: 2, explanation: "Spread stops at `done: true`; the return value 2 is not included and code after return never runs." },
      { id: "gi-2", prompt: "What happens to the argument of the first `next()` call?", options: ["It's the first yielded value", "It's discarded", "It becomes the generator's parameter", "TypeError"], answer: 1, explanation: "There's no paused `yield` to receive it." },
      { id: "gi-3", prompt: "Which is NOT iterable by default?", options: ["String", "Map", "Plain object", "arguments"], answer: 2, explanation: "Plain objects don't implement Symbol.iterator." },
    ],
    questions: ["javascript/js-28", "javascript/js-45", "javascript/js-44"],
  },
  outline({
    slug: "async-iteration",
    title: "Async iteration: for await…of and async generators",
    summary: "Iterating over values that arrive over time — paginated APIs, streams, events — with `Symbol.asyncIterator`, async generators and `for await…of`.",
    level: "advanced",
    frequency: "medium",
    minutes: 25,
    kinds: ["theory", "coding"],
    prerequisites: ["javascript/generators-iterators", "javascript/async-await"],
    related: ["javascript/fetch-http", "javascript/abortcontroller", "nodejs/streams-buffers"],
    tags: ["for-await", "async-generators", "Symbol.asyncIterator", "streams", "pagination"],
    sources: [],
    objectives: [
      "Define the async iterator protocol (`next()` returns a promise of `{ value, done }`)",
      "Write an async generator that paginates an API lazily",
      "Consume Node streams and web `ReadableStream`s with `for await…of`",
      "Handle errors, early exit (`return()`) and backpressure",
    ],
    covers: [
      "Async iterable protocol and `Symbol.asyncIterator`",
      "Async generators: `await` + `yield`",
      "`for await…of` over sync iterables of promises (and its pitfalls vs `Promise.all`)",
      "Streams and event sources as async iterables (`events.on`)",
      "`Array.fromAsync`",
    ],
    questions: ["javascript/js-44"],
  }),
  outline({
    slug: "abortcontroller",
    title: "Cancellation with AbortController and AbortSignal",
    summary: "The standard cancellation primitive: aborting fetches, timers and your own async functions, `AbortSignal.timeout` and `AbortSignal.any`, and cleanup of listeners.",
    level: "intermediate",
    frequency: "medium",
    minutes: 20,
    kinds: ["theory", "coding"],
    prerequisites: ["javascript/promises", "javascript/async-await"],
    related: ["javascript/fetch-http", "javascript/timers", "javascript/promise-combinators", "javascript/memory-leaks-gc"],
    tags: ["AbortController", "AbortSignal", "cancellation", "timeouts"],
    sources: [],
    objectives: [
      "Abort a `fetch` and distinguish `AbortError` (user abort) from `TimeoutError` (`AbortSignal.timeout`)",
      "Make your own async functions abortable: check `signal.aborted`, listen for `abort`, call `signal.throwIfAborted()`",
      "Combine signals with `AbortSignal.any` (e.g. user cancel + per-request timeout)",
      "Remove many listeners at once with `addEventListener(..., { signal })`",
    ],
    covers: [
      "Controller/signal split (capability to abort vs ability to observe)",
      "fetch, streams, `events.once`, `timers/promises` in Node accept signals",
      "Writing abortable sleep and polling loops (see the polling-client milestone)",
      "Abort reasons and error handling",
      "Race conditions: ignoring stale responses vs actually aborting",
    ],
  }),
];

// ===========================================================================
// Module 5 — Browser and web platform
// ===========================================================================

const browser: Lesson[] = [
  outline({
    slug: "dom",
    title: "The DOM: structure, nodes and traversal",
    summary: "The Document Object Model as a tree of nodes: Node vs Element, node types, live vs static collections, and traversing and querying the tree.",
    level: "beginner",
    frequency: "high",
    minutes: 25,
    prerequisites: ["javascript/objects-descriptors"],
    related: ["javascript/dom-manipulation", "javascript/dom-events-bubbling", "react/virtual-dom"],
    tags: ["dom", "nodes", "elements", "traversal", "querySelector"],
    sources: [],
    objectives: [
      "Explain how HTML is parsed into a tree of nodes and how the DOM differs from the HTML source",
      "Distinguish Node (any node: text, comment, element…) from Element (tag nodes) and their APIs (`childNodes` vs `children`)",
      "Traverse with parent/child/sibling properties and query with `querySelector(All)`, `closest`, `matches`",
      "Know live (`HTMLCollection`, `childNodes`) vs static (`querySelectorAll`'s NodeList) collections",
    ],
    covers: [
      "Document, nodes, node types, the inheritance chain (EventTarget → Node → Element → HTMLElement)",
      "Whitespace text nodes and why `firstChild` surprises people",
      "Querying and traversal APIs",
      "Live vs static collections and iteration pitfalls",
      "The DOM vs the render tree (CSSOM, layout) at a high level",
    ],
  }),
  outline({
    slug: "dom-manipulation",
    title: "Creating, inserting and updating DOM nodes",
    summary: "Creating and moving nodes, attributes vs properties vs styles, `innerHTML` and XSS, DocumentFragment batching, and avoiding layout thrashing.",
    level: "beginner",
    frequency: "medium",
    minutes: 25,
    kinds: ["theory", "coding"],
    prerequisites: ["javascript/dom"],
    related: ["javascript/performance", "javascript/cors-browser-security", "javascript/event-delegation"],
    tags: ["dom", "attributes", "properties", "innerHTML", "xss", "reflow"],
    sources: [],
    objectives: [
      "Create, insert (`append`, `prepend`, `before`, `after`, `insertAdjacentHTML`), replace and remove nodes",
      "Explain attributes (HTML source, strings) vs properties (live JS state) with `value`, `checked`, `class`/`className`",
      "Use `classList`, `dataset` and `style` correctly; read computed styles with `getComputedStyle`",
      "Avoid XSS (`textContent` over `innerHTML`) and batch writes to prevent layout thrashing",
    ],
    covers: [
      "Creation and insertion APIs; moving vs cloning nodes",
      "Attributes vs properties vs styles",
      "innerHTML/textContent/innerText differences and security",
      "DocumentFragment and batching",
      "Forced synchronous layout and read/write batching",
    ],
  }),
  outline({
    slug: "dom-events-bubbling",
    title: "DOM events: capturing, target and bubbling",
    summary: "How an event travels through the tree in three phases, `addEventListener` options, `target` vs `currentTarget`, stopping propagation and preventing defaults.",
    level: "beginner",
    frequency: "high",
    minutes: 25,
    prerequisites: ["javascript/dom"],
    related: ["javascript/event-delegation", "javascript/this-binding", "javascript/event-loop"],
    tags: ["events", "bubbling", "capturing", "addEventListener", "preventDefault"],
    sources: [],
    objectives: [
      "Describe the capture → target → bubble phases and the propagation path",
      "Use `addEventListener` options: `capture`, `once`, `passive`, `signal`",
      "Distinguish `event.target` from `event.currentTarget`",
      "Use `stopPropagation`, `stopImmediatePropagation` and `preventDefault` correctly",
      "Know which events don't bubble (`focus`, `blur`, `mouseenter`) and their bubbling alternatives",
    ],
    covers: [
      "Event dispatch algorithm and the composed path (shadow DOM)",
      "Listener options and passive scroll listeners",
      "Default actions and cancellation",
      "Custom events (`CustomEvent`, `dispatchEvent`) — synchronous dispatch",
      "Removing listeners and leak avoidance",
    ],
    questions: ["javascript/js-22"],
  }),
  {
    slug: "event-delegation",
    track: "javascript",
    title: "Event delegation",
    summary: "Handle events for many (or future) child elements with one listener on an ancestor, using bubbling plus `event.target.closest()`.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 25,
    kinds: ["theory", "coding", "quiz"],
    status: "authored",
    prerequisites: ["javascript/dom-events-bubbling"],
    related: ["javascript/dom", "javascript/memory-leaks-gc", "javascript/performance", "react/rendering-reconciliation"],
    tags: ["event-delegation", "bubbling", "closest", "performance", "dynamic-content"],
    sources: [],
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: [
        "Explain how delegation relies on bubbling",
        "Implement delegation robustly with `closest()` and a containment check",
        "Handle dynamically added elements without re-binding",
        "Know the limits: non-bubbling events, `stopPropagation` in children, shadow DOM retargeting",
      ] }] },
      { id: "prerequisites", blocks: [{ type: "p", text: "You need the three event phases and `target` vs `currentTarget` from the DOM events lesson." }] },
      { id: "intuition", blocks: [
        { type: "p", text: "Instead of giving every apartment its own doorman, put one receptionist in the lobby. Every visitor passes through the lobby anyway (bubbling), so the receptionist checks which apartment they're for and routes them." },
      ] },
      { id: "definition", blocks: [
        { type: "p", text: "**Event delegation** is attaching a single listener to a common ancestor and determining the logical source from `event.target` (typically with `event.target.closest(selector)`), instead of attaching listeners to each descendant." },
      ] },
      { id: "why", blocks: [
        { type: "list", items: [
          "**Fewer listeners**: one function and one registration instead of thousands — less memory and setup time.",
          "**Dynamic content**: items added later are handled automatically; no re-binding after re-rendering a list.",
          "**Simpler cleanup**: remove one listener; fewer leak opportunities when nodes are replaced.",
        ] },
      ] },
      { id: "internals", blocks: [
        { type: "p", text: "When the user clicks an element, the browser computes the propagation path (target → … → document → window), runs capturing listeners top-down, then the target's listeners, then bubbling listeners bottom-up. A delegated listener on the `<ul>` runs during the bubble phase with `currentTarget = ul` and `target` = the deepest element actually clicked (maybe a `<span>` inside the `<li>`). `closest()` walks up from `target` (including itself) to find the element you care about." },
        { type: "callout", tone: "spec-vs-impl", title: "React already delegates", text: "React attaches its listeners at the root container (since React 17; at `document` before that) and dispatches synthetic events itself — a framework-level delegation. This is a React implementation detail, not something you configure." },
      ] },
      { id: "walkthrough", blocks: [
        { type: "code", lang: "html", code: `<ul id="todos">
  <li data-id="1"><span>Buy milk</span> <button class="delete">×</button></li>
  <li data-id="2"><span>Walk dog</span> <button class="delete">×</button></li>
</ul>` },
        { type: "code", lang: "js", caption: "One listener for all current and future items", code: `const list = document.querySelector("#todos");

list.addEventListener("click", (event) => {
  const button = event.target.closest("button.delete");
  if (!button || !list.contains(button)) return;   // not a delete click (or outside list)
  const item = button.closest("li");
  console.log("delete", item.dataset.id);
  item.remove();
});

// Added later — no new listener needed:
list.insertAdjacentHTML("beforeend",
  '<li data-id="3"><span>Code</span> <button class="delete">×</button></li>');` },
        { type: "steps", steps: [
          { title: "User clicks the × of item 3", detail: "`target` is the button (or a child of it, e.g. an icon)." },
          { title: "Bubbling reaches the ul", detail: "The delegated listener runs with `currentTarget = list`." },
          { title: "`closest(\"button.delete\")`", detail: "Finds the button even if an inner `<svg>` was clicked; returns null for clicks on the text." },
          { title: "Containment check", detail: "`list.contains(button)` guards against matches outside the list in nested structures." },
          { title: "Act", detail: "Read `data-id` from the `li` and remove it. Logs `delete 3`." },
        ] },
      ] },
      { id: "examples", blocks: [
        { type: "code", lang: "js", caption: "A reusable delegate helper with cleanup via AbortSignal", code: `function delegate(root, type, selector, handler, options = {}) {
  const listener = (event) => {
    const match = event.target.closest(selector);
    if (match && root.contains(match)) handler.call(match, event, match);
  };
  root.addEventListener(type, listener, options);
  return () => root.removeEventListener(type, listener, options);
}

const controller = new AbortController();
delegate(document.body, "click", "[data-action]", (e, el) => {
  console.log("action:", el.dataset.action);
}, { signal: controller.signal });
// later: controller.abort() removes the listener` },
      ] },
      { id: "edge-cases", blocks: [
        { type: "list", items: [
          "Non-bubbling events (`focus`, `blur`, `mouseenter`, `mouseleave`, `load` on images) can't be delegated in the bubble phase — use `focusin`/`focusout`, `mouseover`/`mouseout`, or a capturing listener.",
          "A child calling `event.stopPropagation()` prevents the delegated handler from ever seeing the event.",
          "`event.target` may be a Text node in some synthetic cases; guard with `event.target instanceof Element`.",
          "Inside shadow DOM, events are retargeted at the shadow host; use `event.composedPath()` to see inner nodes.",
          "High-frequency events (`mousemove`, `scroll`) delegated to `document` run for every movement anywhere — throttle or bind narrowly.",
        ] },
      ] },
      { id: "mistakes", blocks: [
        { type: "callout", tone: "warning", title: "Using `event.target.matches()` alone", text: "Fails when the user clicks a nested element (icon inside a button). Use `closest()`." },
        { type: "callout", tone: "misconception", title: "\"Delegation is always faster\"", text: "It saves registrations, but the handler runs for every matching event in the subtree and does selector matching each time. For a handful of static elements, direct listeners are fine." },
      ] },
      { id: "tradeoffs", blocks: [
        { type: "compare", items: [
          { title: "Delegated listener", points: ["One listener, handles dynamic children", "Selector logic in the handler", "Can't delegate non-bubbling events directly"] },
          { title: "Per-element listeners", points: ["Simple and explicit", "Must re-bind for new elements and clean up removed ones", "Memory scales with element count"] },
        ] },
      ] },
      { id: "real-world", blocks: [
        { type: "list", items: [
          "Large tables and lists (thousands of rows) with per-row actions.",
          "Analytics: one document-level click listener reading `data-track` attributes.",
          "Framework internals (React's root listeners, jQuery's `.on(type, selector, fn)`).",
        ] },
      ] },
      { id: "interview-short", blocks: [
        { type: "p", text: "Event delegation means putting one listener on a parent instead of one on each child. It works because most events bubble from the target up through its ancestors, so the parent's listener sees them; inside it you use `event.target.closest(selector)` to find which child was meant. Benefits: fewer listeners and less memory, and elements added later are handled automatically. Caveats: events that don't bubble, like focus, need `focusin` or capture, and a child calling stopPropagation blocks it." },
      ] },
      { id: "interview-deep", blocks: [
        { type: "p", text: "Walk through the propagation path and phases, target vs currentTarget, why `closest` + `contains` is robust, non-bubbling events and capture-phase delegation, shadow DOM retargeting and `composedPath`, and React's root-level delegation (React 17 change)." },
      ] },
      { id: "practice", blocks: [{ type: "list", ordered: true, items: [
        "Build a todo list with add/toggle/delete using a single listener.",
        "Write `delegate(root, type, selector, handler)` returning an unsubscribe function, and test it with nested markup.",
      ] }] },
      { id: "summary", blocks: [{ type: "list", items: [
        "One ancestor listener + bubbling + `closest()`.",
        "Handles dynamic children; fewer listeners.",
        "Use focusin/focusout or capture for non-bubbling events.",
        "Guard with `contains` and beware stopPropagation.",
      ] }] },
    ],
    glossary: [
      { term: "Bubbling", definition: "Phase in which an event propagates from the target up through its ancestors." },
      { term: "`event.target`", definition: "The deepest element where the event originated." },
      { term: "`event.currentTarget`", definition: "The element whose listener is currently running." },
      { term: "`closest(selector)`", definition: "Returns the nearest ancestor (or self) matching a selector, or null." },
      { term: "Retargeting", definition: "Shadow DOM behaviour where events appear to come from the shadow host when observed outside it." },
    ],
    followUps: [
      { q: "How would you delegate focus events?", a: "Listen for `focusin`/`focusout`, which bubble, or add a capturing `focus` listener (`{ capture: true }`) on the ancestor." },
      { q: "What's the difference between stopPropagation and preventDefault?", a: "stopPropagation stops the event travelling to further nodes; preventDefault cancels the browser's default action (following a link, submitting a form). They're independent." },
    ],
    quiz: [
      { id: "ed-1", prompt: "In a delegated listener on `ul`, what is `event.currentTarget`?", options: ["The clicked li", "The ul", "The document", "The deepest clicked node"], answer: 1, explanation: "currentTarget is the element the running listener is attached to." },
      { id: "ed-2", prompt: "Which event cannot be delegated via bubbling?", options: ["click", "input", "focus", "keydown"], answer: 2, explanation: "focus doesn't bubble; use focusin or a capture listener." },
    ],
    questions: ["javascript/js-22"],
  },
  outline({
    slug: "fetch-http",
    title: "fetch, HTTP and headers",
    summary: "Making HTTP requests from JavaScript: the fetch API's two-step promise, why HTTP errors don't reject, headers, bodies, credentials, streaming and timeouts.",
    level: "intermediate",
    frequency: "high",
    minutes: 30,
    kinds: ["theory", "coding"],
    prerequisites: ["javascript/promises", "javascript/async-await"],
    related: ["javascript/abortcontroller", "javascript/json-circular", "javascript/cors-browser-security", "networks/http", "javascript/url-formdata"],
    tags: ["fetch", "http", "headers", "response", "json"],
    sources: [],
    objectives: [
      "Use `fetch` with method, headers, body and credentials options",
      "Explain that `fetch` rejects only on network failure/abort — check `response.ok`/`status` yourself",
      "Read bodies once (`json()`, `text()`, `blob()`, `body` stream) and know `bodyUsed`",
      "Add timeouts and cancellation with `AbortSignal.timeout`/`AbortController`",
      "Write a small typed wrapper with error handling and retries",
    ],
    covers: [
      "Request/Response/Headers objects",
      "Error model: network errors vs HTTP errors",
      "JSON, FormData, URLSearchParams and Blob bodies (Content-Type set automatically)",
      "Credentials and cookies (`same-origin` default), caching modes",
      "Streaming responses and progress",
      "Node 18+ built-in fetch (undici)",
    ],
  }),
  outline({
    slug: "json-circular",
    title: "JSON: stringify, parse and circular references",
    summary: "How JSON.stringify and JSON.parse really behave — dropped values, toJSON, replacers and revivers — and how to deal with circular structures.",
    level: "intermediate",
    frequency: "medium",
    minutes: 20,
    kinds: ["theory", "coding"],
    prerequisites: ["javascript/data-types", "javascript/objects-descriptors"],
    related: ["javascript/deep-copy", "javascript/weakmap-weakset", "backend/serialization"],
    tags: ["json", "stringify", "parse", "circular-references", "serialization"],
    sources: [],
    objectives: [
      "Predict stringify output for undefined, functions, symbols, NaN/Infinity, Dates, Maps, BigInt (throws) and nested arrays",
      "Use `toJSON`, replacer functions/arrays, `space`, and `parse` revivers (e.g. reviving Dates)",
      "Detect circular references and serialise them safely (WeakSet-based replacer, or a reference-encoding scheme)",
      "Know the security and precision caveats (large integers, `__proto__` keys)",
    ],
    covers: [
      "Serialisation rules and the TypeError on cycles",
      "Replacers, `toJSON` and revivers",
      "Safe-stringify with a WeakSet of ancestors vs seen-set (shared refs aren't cycles!)",
      "structuredClone vs JSON for copying",
      "Large numbers, BigInt and precision",
    ],
    questions: ["javascript/js-52", "javascript/js-18"],
  }),
  outline({
    slug: "url-formdata",
    title: "URL, URLSearchParams and FormData",
    summary: "Building and parsing URLs safely, query strings with URLSearchParams, and collecting/sending form data.",
    level: "beginner",
    frequency: "low",
    minutes: 15,
    prerequisites: ["javascript/fetch-http"],
    related: ["javascript/fetch-http", "networks/http"],
    tags: ["URL", "URLSearchParams", "FormData", "encoding"],
    sources: [],
    objectives: [
      "Parse and build URLs with `new URL(path, base)` instead of string concatenation",
      "Read and write query parameters (including repeated keys) with URLSearchParams",
      "Know `encodeURIComponent` vs `encodeURI` and when URLSearchParams encodes for you",
      "Send forms (including files) with FormData and let the browser set the multipart boundary",
    ],
    covers: [
      "URL parts and relative resolution",
      "URLSearchParams API and `+` vs `%20` encoding",
      "FormData from a `<form>`, `Object.fromEntries(formData)`",
      "Multipart uploads with fetch",
    ],
  }),
  outline({
    slug: "cors-browser-security",
    title: "CORS and browser security basics",
    summary: "The same-origin policy, how CORS relaxes it (simple vs preflighted requests, credentials), and related browser defences: XSS, CSP, cookies' SameSite.",
    level: "intermediate",
    frequency: "high",
    minutes: 30,
    prerequisites: ["javascript/fetch-http"],
    related: ["networks/cors", "backend/csrf", "javascript/dom-manipulation"],
    tags: ["cors", "same-origin-policy", "preflight", "xss", "csp", "samesite"],
    sources: [],
    objectives: [
      "Define an origin and what the same-origin policy blocks (reading responses, not sending requests)",
      "Explain simple vs preflighted requests and the `OPTIONS` handshake headers",
      "Configure credentialed CORS correctly (`Access-Control-Allow-Credentials`, no wildcard origin)",
      "Recognise that CORS is not a server-side protection and doesn't stop CSRF",
      "Know the basics of XSS prevention and CSP",
    ],
    covers: [
      "Origins, SOP, and why CORS errors appear in the browser only",
      "Preflight triggers and caching (`Access-Control-Max-Age`)",
      "Credentials and cookies (SameSite)",
      "Common misconfigurations (reflecting any Origin with credentials)",
      "XSS, CSP, Trusted Types overview",
    ],
  }),
  {
    slug: "modules",
    track: "javascript",
    title: "ES modules (import/export, dynamic import, top-level await)",
    summary: "How ES modules work: static import/export, live bindings, the three-phase load (construct, link, evaluate), circular dependencies, dynamic `import()`, top-level await, and how they differ from CommonJS.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 40,
    kinds: ["theory", "quiz"],
    status: "authored",
    prerequisites: ["javascript/scope", "javascript/hoisting-tdz"],
    related: ["javascript/script-loading", "javascript/bundling-transpilation", "javascript/singleton", "javascript/iife", "nodejs/node-architecture"],
    tags: ["esm", "import", "export", "commonjs", "dynamic-import", "top-level-await", "live-bindings", "tree-shaking"],
    sources: [],
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: [
        "Use named and default exports/imports, namespaces and re-exports",
        "Explain live bindings and why imports are read-only",
        "Describe the module loading phases and why imports are static and hoisted",
        "Handle circular dependencies and explain the TDZ errors they cause",
        "Use dynamic `import()` for code splitting and top-level await correctly",
        "Compare ESM with CommonJS (sync `require`, copied values, `module.exports`) and Node interop",
      ] }] },
      { id: "intuition", blocks: [
        { type: "p", text: "A module is a file with its own private scope that explicitly declares what it shares (`export`) and what it needs (`import`). Because those declarations are written at the top level with fixed strings, tools — and the engine — can see the whole dependency graph *before running any code*." },
      ] },
      { id: "definition", blocks: [
        { type: "code", lang: "js", caption: "math.js", code: `export const PI = 3.14159;
export function area(r) { return PI * r * r; }
export default class Circle { constructor(r) { this.r = r; } }` },
        { type: "code", lang: "js", caption: "main.js", code: `import Circle, { area, PI as pi } from "./math.js";
import * as math from "./math.js";          // namespace object
export { area } from "./math.js";           // re-export
const { heavy } = await import("./heavy.js"); // dynamic import + top-level await` },
        { type: "list", items: [
          "Modules are **strict mode** automatically, have **module scope** (no globals leak), top-level `this` is `undefined`, and each module is evaluated **once** per realm (a singleton per URL/specifier resolution).",
          "In browsers, `<script type=\"module\">` is deferred by default and fetched with CORS.",
        ] },
      ] },
      { id: "why", blocks: [
        { type: "list", items: [
          "Encapsulation without IIFEs; explicit dependencies.",
          "Static structure enables tree-shaking, faster parsing, early errors (importing a missing name is a link-time SyntaxError).",
          "One standard module system for browsers and Node.",
        ] },
      ] },
      { id: "internals", blocks: [
        { type: "steps", steps: [
          { title: "1. Construction (fetch + parse)", detail: "Starting from the entry, the host resolves each specifier to a URL/path, fetches it and parses it into a Module Record, discovering its imports statically. This repeats breadth-wise until the whole graph is loaded. No code runs yet." },
          { title: "2. Linking (instantiation)", detail: "For each module an environment record is created. Exports are bound and every import is wired as an **indirect binding** to the exporter's variable — not a copy. Function declarations are initialised now (so they're usable across cycles); `let`/`const`/`class` exports stay uninitialised (TDZ)." },
          { title: "3. Evaluation", detail: "Modules execute depth-first, post-order: dependencies before dependents, each exactly once. With top-level await, a module's evaluation becomes asynchronous; modules depending on it wait, while unrelated siblings can proceed." },
        ] },
        { type: "p", text: "**Live bindings.** Because imports are references to the exporter's binding, if the exporter later reassigns `export let count`, importers see the new value. Importers cannot assign to an import (TypeError: assignment to constant variable), though they can mutate an imported object." },
        { type: "p", text: "**Cycles.** If `a.js` imports `b.js` and `b.js` imports `a.js`, evaluation starts b first (post-order). If b's top-level code reads a `let`/`const` export of a that hasn't been evaluated yet, it throws a ReferenceError (TDZ). Function declarations are fine because they were initialised at link time. Fix by moving shared code into a third module or only touching imports inside functions called later." },
        { type: "callout", tone: "spec-vs-impl", title: "Who resolves specifiers?", text: "ECMAScript defines module records, linking and evaluation; *loading* and *resolution* belong to the host. Browsers need URLs (or import maps for bare specifiers like `\"react\"`); Node resolves bare specifiers via `node_modules` and `package.json` `exports`; bundlers implement their own resolution." },
      ] },
      { id: "walkthrough", title: "Walkthrough: live binding vs CommonJS copy", blocks: [
        { type: "code", lang: "js", caption: "counter.mjs", code: `export let count = 0;
export function increment() { count++; }` },
        { type: "code", lang: "js", caption: "main.mjs", code: `import { count, increment } from "./counter.mjs";
console.log(count);
increment();
console.log(count);   // live binding sees the update`, output: `0
1` },
        { type: "code", lang: "js", caption: "CommonJS equivalent (counter.cjs / main.cjs)", code: `// counter.cjs
let count = 0;
module.exports = { count, increment() { count++; } };

// main.cjs
const { count, increment } = require("./counter.cjs");
console.log(count);
increment();
console.log(count);   // destructured copy of the value at require time`, output: `0
0` },
      ] },
      { id: "examples", blocks: [
        { type: "code", lang: "js", caption: "Code splitting with dynamic import", code: `button.addEventListener("click", async () => {
  const { openEditor } = await import("./editor.js"); // fetched on first click only
  openEditor();
});` },
        { type: "table", head: ["", "ES modules", "CommonJS"], rows: [
          ["Syntax", "`import` / `export`", "`require()` / `module.exports`"],
          ["Loading", "Async-capable, graph built before execution", "Synchronous, executed on `require` call"],
          ["Bindings", "Live, read-only", "Copied values (object reference for `module.exports`)"],
          ["Static analysis / tree-shaking", "Yes", "Limited (dynamic `require`)"],
          ["Top-level await", "Yes", "No"],
          ["`this` at top level", "undefined", "`module.exports`"],
          ["`__dirname`, `require`", "Not defined (use `import.meta.dirname`/`import.meta.url`)", "Available"],
          ["Node detection", "`.mjs`, or `\"type\": \"module\"`", "`.cjs`, or default `.js`"],
        ] },
        { type: "p", text: "Interop in Node: ESM can `import` CommonJS (module.exports becomes the default export, with best-effort named exports). CommonJS can load ESM with dynamic `import()`, and recent Node versions (22.12+/20.19+) also allow `require()` of synchronous ES modules (no top-level await)." },
      ] },
      { id: "edge-cases", blocks: [
        { type: "list", items: [
          "Imports are hoisted: an `import` at the bottom of a file is still linked before any code runs.",
          "Import specifiers must be string literals; computed paths need `import()`.",
          "A module imported via two different URLs (e.g. `?v=1` query) is evaluated twice.",
          "Top-level await in a widely imported module delays the whole app's startup.",
          "`export default` exports a *value* (expression); `export { x as default }` exports the live binding.",
        ] },
      ] },
      { id: "mistakes", blocks: [
        { type: "callout", tone: "misconception", title: "\"import copies the value\"", text: "ES imports are live bindings. CommonJS destructuring copies." },
        { type: "callout", tone: "warning", title: "Mixing default and named exports carelessly", text: "Default exports can be renamed freely on import, which hurts searchability and refactoring; many teams prefer named exports." },
      ] },
      { id: "tradeoffs", blocks: [
        { type: "compare", items: [
          { title: "Static imports", points: ["Analysable, tree-shakable", "Everything loaded upfront"] },
          { title: "Dynamic import()", points: ["Code splitting, conditional loading", "Async; adds a network round trip at use time"] },
          { title: "Unbundled ESM in production", points: ["Simple, cacheable per file", "Request waterfalls for deep graphs (mitigate with modulepreload)"] },
        ] },
      ] },
      { id: "interview-short", blocks: [
        { type: "p", text: "ES modules give each file its own scope with explicit `export` and `import`. Imports are static, so the engine builds the whole dependency graph before executing: construction (fetch and parse), linking (wire imports to exports as live bindings), then evaluation, dependencies first, each module once. Imports are live, read-only references, unlike CommonJS where `require` runs synchronously and you get a copy of the value. Dynamic `import()` returns a promise for lazy loading, and modules support top-level await." },
      ] },
      { id: "interview-deep", blocks: [
        { type: "p", text: "Detail the module record lifecycle, indirect bindings and TDZ across cycles, post-order evaluation with async (TLA) modules, host-defined resolution (import maps, Node `exports`), tree-shaking prerequisites, and Node interop including `require(esm)` in recent versions." },
      ] },
      { id: "summary", blocks: [{ type: "list", items: [
        "Module scope, strict mode, evaluated once.",
        "Construct → link → evaluate.",
        "Live, read-only bindings; CJS copies.",
        "Cycles: TDZ for let/const exports; functions OK.",
        "import() for splitting; top-level await blocks dependents.",
      ] }] },
    ],
    glossary: [
      { term: "Module record", definition: "Spec structure representing a parsed module, its imports, exports and environment." },
      { term: "Live binding", definition: "An import that reflects the current value of the exporter's variable." },
      { term: "Linking", definition: "Phase that connects imports to exports and creates module environments." },
      { term: "Tree-shaking", definition: "Removing unused exports at build time using static module structure." },
      { term: "Specifier", definition: "The string in `import ... from \"x\"`, resolved by the host to a module location." },
      { term: "Import map", definition: "Browser feature mapping bare specifiers to URLs." },
    ],
    followUps: [
      { q: "Are ES modules singletons?", a: "Yes per resolved URL within a realm: every importer shares the same module instance and its state." },
      { q: "Why is tree-shaking easier with ESM?", a: "Imports/exports are static declarations, so the bundler can prove which exports are unused without running code." },
      { q: "How does top-level await affect sibling modules?", a: "Only modules that (transitively) depend on the awaiting module wait; independent branches of the graph continue evaluating." },
    ],
    quiz: [
      { id: "md-1", prompt: "After `import { n } from './m.js'`, what happens on `n = 5`?", options: ["Updates the exporter's n", "Creates a local n", "TypeError", "SyntaxError at parse time"], answer: 2, explanation: "Import bindings are immutable from the importer's side; assignment throws a TypeError at runtime." },
      { id: "md-2", prompt: "In which phase are imports wired to exports?", options: ["Construction", "Linking", "Evaluation", "At each access"], answer: 1, explanation: "Linking creates environments and indirect bindings before any module code runs." },
      { id: "md-3", prompt: "What is top-level `this` in an ES module?", options: ["window", "globalThis", "undefined", "module.exports"], answer: 2, explanation: "Modules are strict and have no top-level this binding to the global object." },
    ],
    questions: ["javascript/js-17", "javascript/js-40"],
  },
  outline({
    slug: "script-loading",
    title: "Script loading: async, defer and type=module",
    summary: "How `<script>` blocks the HTML parser, what `async` and `defer` change (download vs execution timing and order), module scripts, and preload hints.",
    level: "intermediate",
    frequency: "high",
    minutes: 20,
    prerequisites: ["javascript/dom"],
    related: ["javascript/modules", "javascript/performance", "javascript/event-loop"],
    tags: ["script", "async", "defer", "module", "DOMContentLoaded", "preload"],
    sources: [],
    objectives: [
      "Explain why a classic `<script>` blocks parsing (it might `document.write`)",
      "Compare `async` (run as soon as downloaded, any order) and `defer` (run in order after parsing, before DOMContentLoaded)",
      "Know that module scripts are deferred by default and accept `async`",
      "Choose placements and hints (`preload`, `modulepreload`) for performance",
    ],
    covers: [
      "Parser-blocking scripts and the preload scanner",
      "async vs defer timeline and ordering guarantees",
      "DOMContentLoaded and load events",
      "Module scripts, `nomodule`, dynamically inserted scripts (async by default)",
      "Third-party script strategies",
    ],
    questions: ["javascript/js-48"],
  }),
  outline({
    slug: "storage-workers-raf",
    title: "Storage, Web Workers and requestAnimationFrame",
    summary: "Browser platform APIs around the main thread: localStorage/sessionStorage/IndexedDB/cookies, Web Workers for parallelism, and rAF for frame-aligned work.",
    level: "intermediate",
    frequency: "medium",
    minutes: 30,
    prerequisites: ["javascript/event-loop"],
    related: ["javascript/timers", "javascript/performance", "javascript/deep-copy", "nodejs/worker-threads"],
    tags: ["localStorage", "IndexedDB", "web-workers", "requestAnimationFrame", "postMessage"],
    sources: [],
    objectives: [
      "Choose between cookies, localStorage, sessionStorage, IndexedDB and the Cache API (size, sync vs async, scope, security)",
      "Move CPU-heavy work to a Web Worker and communicate with `postMessage` (structured clone, transferables)",
      "Use requestAnimationFrame for animations and visual updates, and know where it runs in the event loop",
      "Understand that workers have their own event loop, global scope and no DOM",
    ],
    covers: [
      "Storage options compared; localStorage is synchronous and string-only",
      "Dedicated, shared and service workers at a glance",
      "Message passing, transfer, SharedArrayBuffer and cross-origin isolation",
      "rAF timing, background-tab pausing, rAF-based throttling",
    ],
  }),
];

// ===========================================================================
// Module 6 — Advanced JavaScript
// ===========================================================================

const advanced: Lesson[] = [
  outline({
    slug: "memoization",
    title: "Memoization",
    summary: "Caching function results by their arguments: implementation with closures and Maps, key strategies, cache bounds (LRU), async memoization and when it backfires.",
    level: "intermediate",
    frequency: "high",
    minutes: 25,
    kinds: ["theory", "coding"],
    prerequisites: ["javascript/closures", "javascript/map-set"],
    related: ["javascript/weakmap-weakset", "javascript/recursion", "javascript/memory-leaks-gc", "react/memoization-hooks"],
    tags: ["memoization", "caching", "lru", "pure-functions"],
    sources: [],
    objectives: [
      "Implement `memoize(fn, resolver)` with a Map in a closure",
      "Explain why only pure (deterministic, side-effect-free) functions should be memoized",
      "Choose cache keys (primitive args, JSON keys, WeakMap for object args) and bound memory with LRU/TTL",
      "Memoize async functions by caching promises and evicting rejections",
    ],
    covers: [
      "Basic memoize and memoized recursion (fibonacci)",
      "Key strategies and their pitfalls (object identity, argument order)",
      "Unbounded caches as memory leaks; LRU with Map insertion order",
      "Async memoization and request deduplication",
      "React's useMemo/memo as a related idea",
    ],
    questions: ["javascript/js-36"],
  }),
  {
    slug: "debounce-throttle",
    track: "javascript",
    title: "Debounce and throttle",
    summary: "Two rate-limiting patterns for noisy events: debounce waits for a pause, throttle enforces a maximum rate. Implementations with closures and timers, leading/trailing edges, cancellation and when to use each.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 35,
    kinds: ["theory", "coding", "quiz"],
    status: "authored",
    prerequisites: ["javascript/closures", "javascript/timers", "javascript/this-binding"],
    related: ["javascript/event-loop", "javascript/storage-workers-raf", "javascript/performance", "javascript/higher-order-functions"],
    tags: ["debounce", "throttle", "rate-limiting", "timers", "closures", "events"],
    sources: [],
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: [
        "Explain the difference between debounce and throttle with a timeline",
        "Implement both from scratch, preserving `this` and the latest arguments",
        "Add leading/trailing options and `cancel`",
        "Pick the right one for search inputs, resize, scroll, button double-clicks and autosave",
      ] }] },
      { id: "intuition", blocks: [
        { type: "p", text: "**Debounce** is an elevator door: every new person entering resets the timer; the door closes only after nobody has entered for N seconds. **Throttle** is a metronome: no matter how often you poke it, it ticks at most once every N ms." },
      ] },
      { id: "definition", blocks: [
        { type: "table", head: ["", "Debounce", "Throttle"], rows: [
          ["Fires", "After `wait` ms of silence (trailing) — or at the start of a burst (leading)", "At most once per `wait` ms during activity"],
          ["Continuous input for 3 s, wait = 300 ms", "Once (at 3.3 s)", "About 10 times"],
          ["Typical use", "Search-as-you-type, validation, autosave, resize end", "Scroll position, mousemove, drag, infinite scroll checks, rate-limited APIs"],
        ] },
      ] },
      { id: "why", blocks: [
        { type: "p", text: "Events like `input`, `scroll`, `resize` and `mousemove` can fire dozens of times per second. Running expensive work (network requests, layout reads, re-renders) on each one wastes CPU, battery and server capacity, and can make the UI janky." },
      ] },
      { id: "internals", blocks: [
        { type: "p", text: "Both are higher-order functions that return a wrapper; the wrapper's state (the pending timer id, the last call time, the latest arguments) lives in a **closure**. Debounce clears and re-creates a `setTimeout` on every call. Throttle compares the current time with the last invocation and, for a trailing call, schedules one timer for the remaining time." },
        { type: "p", text: "The callbacks run as **timer tasks** on the event loop, so they're delayed by at least `wait` and possibly more under load or in background tabs (timer throttling). For visual work, a `requestAnimationFrame`-based throttle aligns updates to frames instead of an arbitrary interval." },
      ] },
      { id: "walkthrough", blocks: [
        { type: "code", lang: "js", runnable: true, code: `function debounce(fn, wait, { leading = false, trailing = true } = {}) {
  let timer = null, lastArgs, lastThis;
  function debounced(...args) {
    lastArgs = args;
    lastThis = this;
    const callNow = leading && timer === null;   // first call of a burst
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (trailing && !callNow) fn.apply(lastThis, lastArgs);
      lastArgs = lastThis = undefined;
    }, wait);
    if (callNow) fn.apply(this, args);
  }
  debounced.cancel = () => {
    clearTimeout(timer);
    timer = null;
    lastArgs = lastThis = undefined;
  };
  return debounced;
}

const log = [];
const search = debounce((q) => log.push("search:" + q), 50);
search("j"); search("ja"); search("jav");
setTimeout(() => search("java"), 20);         // still inside the quiet window
setTimeout(() => console.log(log.join(" ")), 200);`, output: `search:java` },
        { type: "steps", steps: [
          { title: "Calls at 0 ms", detail: "Each call clears the previous timer and starts a new 50 ms timer; latest args are \"jav\"." },
          { title: "Call at 20 ms", detail: "Clears again; new timer fires at ~70 ms with args \"java\"." },
          { title: "~70 ms", detail: "No calls for 50 ms → the trailing call runs once with the latest arguments." },
        ] },
      ] },
      { id: "examples", blocks: [
        { type: "code", lang: "js", caption: "Throttle with leading call and a trailing call for the last event", code: `function throttle(fn, wait) {
  let last = 0, timer = null, pendingArgs = null, pendingThis = null;
  return function throttled(...args) {
    const now = Date.now();
    const remaining = wait - (now - last);
    if (remaining <= 0) {            // window passed: run immediately (leading)
      clearTimeout(timer);
      timer = null;
      last = now;
      fn.apply(this, args);
    } else {                         // inside window: remember latest, schedule trailing once
      pendingArgs = args;
      pendingThis = this;
      if (!timer) {
        timer = setTimeout(() => {
          last = Date.now();
          timer = null;
          fn.apply(pendingThis, pendingArgs);
        }, remaining);
      }
    }
  };
}

window.addEventListener("scroll", throttle(() => {
  console.log("scrollY", window.scrollY);   // at most every 100 ms
}, 100), { passive: true });` },
        { type: "code", lang: "js", caption: "Frame-aligned throttle for visual updates", code: `function rafThrottle(fn) {
  let scheduled = false, lastArgs;
  return function (...args) {
    lastArgs = args;
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; fn.apply(this, lastArgs); });
  };
}` },
      ] },
      { id: "edge-cases", blocks: [
        { type: "list", items: [
          "Create the debounced function **once** (outside render / per component instance). Re-creating it each render resets its closure and it never fires as expected — in React use `useMemo`/`useRef` and cancel on unmount.",
          "Debounce can starve under continuous input (never fires). Lodash's `maxWait` guarantees a call at least every N ms — which is essentially throttle.",
          "Async callbacks: debouncing a request doesn't cancel the in-flight previous request; pair it with AbortController to avoid stale responses overwriting fresh ones.",
          "Pass `event` data you need eagerly — some frameworks reuse/pool event objects (React ≤16).",
          "Background tabs throttle timers to ≥ 1 s in most browsers.",
        ] },
      ] },
      { id: "mistakes", blocks: [
        { type: "callout", tone: "warning", title: "Losing `this` and arguments", text: "Using an arrow for the returned wrapper or calling `fn()` without `apply` drops the caller's `this`. Capture `this` in a regular function and forward with `fn.apply(this, args)`." },
        { type: "callout", tone: "misconception", title: "\"Throttle and debounce are interchangeable\"", text: "Debounce reports the *end* of a burst; throttle samples *during* it. A scroll-progress bar debounced would update only when scrolling stops." },
      ] },
      { id: "tradeoffs", blocks: [
        { type: "compare", items: [
          { title: "Debounce", points: ["Minimal calls; only final state", "Latency of at least `wait`", "Can starve without maxWait"] },
          { title: "Throttle", points: ["Regular updates during activity", "More calls than debounce", "May skip intermediate values"] },
          { title: "rAF throttle", points: ["Perfectly frame-aligned, no wasted work between frames", "Only for visual updates; paused in background"] },
        ] },
      ] },
      { id: "real-world", blocks: [
        { type: "list", items: [
          "Search autocomplete: debounce 200–300 ms + abort previous fetch.",
          "Window resize → recompute layout: debounce or rAF throttle.",
          "Infinite scroll trigger: throttle (or better, IntersectionObserver).",
          "Prevent double submit: leading-edge debounce on the click handler.",
        ] },
      ] },
      { id: "interview-short", blocks: [
        { type: "p", text: "Both limit how often a function runs in response to frequent events. Debounce delays execution until the events stop for a given time — each call resets a timer — so it runs once at the end of a burst; good for search input or autosave. Throttle guarantees the function runs at most once per interval while events keep coming; good for scroll or mousemove. Both are implemented as higher-order functions that keep a timer and the latest arguments in a closure and forward `this` with apply." },
      ] },
      { id: "interview-deep", blocks: [
        { type: "p", text: "Implement both live, then discuss leading vs trailing edges, `cancel`/`flush`, `maxWait`, preserving `this` and args, interaction with the event loop and timer clamping, rAF-based throttling, React pitfalls (stable identity, cleanup on unmount) and combining with AbortController for request races." },
      ] },
      { id: "practice", blocks: [{ type: "list", ordered: true, items: [
        "Add `flush()` to debounce (invoke the pending call immediately).",
        "Add `maxWait` to debounce and show it behaves like throttle under continuous input.",
        "Write tests with fake timers (Vitest/Jest `useFakeTimers`).",
      ] }] },
      { id: "summary", blocks: [{ type: "list", items: [
        "Debounce: wait for quiet; throttle: cap the rate.",
        "State lives in a closure; timers drive execution.",
        "Forward `this` and latest args; expose cancel.",
        "Create once; clean up; abort stale requests.",
      ] }] },
    ],
    glossary: [
      { term: "Debounce", definition: "Delay a function until a specified time has passed without further calls." },
      { term: "Throttle", definition: "Ensure a function runs at most once per time window." },
      { term: "Leading edge", definition: "Invoking at the start of a burst of calls." },
      { term: "Trailing edge", definition: "Invoking after a burst, with the latest arguments." },
      { term: "maxWait", definition: "Debounce option forcing an invocation if calls have been delayed for that long." },
    ],
    followUps: [
      { q: "How do you test debounce without waiting real time?", a: "Use fake timers (`vi.useFakeTimers()` / `jest.useFakeTimers()`) and advance the clock deterministically." },
      { q: "How would you debounce an async function and return a promise to every caller?", a: "Keep a list of pending resolvers; when the debounced call runs, resolve/reject all of them with its result (or only the latest caller, depending on requirements)." },
    ],
    quiz: [
      { id: "dt2-1", prompt: "A user types 10 characters, 100 ms apart, into an input with a 300 ms debounced handler. How many times does it run (trailing only)?", options: ["0", "1", "3", "10"], answer: 1, explanation: "Every keystroke resets the timer; it fires once, 300 ms after the last keystroke." },
      { id: "dt2-2", prompt: "Which fits a scroll-position progress bar best?", options: ["Debounce 500 ms", "Throttle / rAF throttle", "setInterval polling", "No limiting"], answer: 1, explanation: "You want regular updates during scrolling, not only after it stops." },
      { id: "dt2-3", prompt: "Why use `fn.apply(this, args)` inside the wrapper?", options: ["To make it async", "To preserve the caller's this and arguments", "To clear the timer", "For performance"], answer: 1, explanation: "The wrapper replaces the original function, so it must forward context and arguments." },
    ],
    questions: ["javascript/js-21", "javascript/js-20"],
  },
  {
    slug: "memory-leaks-gc",
    track: "javascript",
    title: "Memory management, garbage collection and memory leaks",
    summary: "How JavaScript frees memory automatically through reachability (mark-and-sweep), how V8's generational collector works, the common leak patterns (listeners, timers, closures, caches, detached DOM) and how to find them with heap snapshots.",
    level: "advanced",
    frequency: "high",
    minutes: 45,
    kinds: ["theory", "visualization", "quiz"],
    status: "authored",
    prerequisites: ["javascript/data-types", "javascript/closures"],
    related: ["javascript/weakmap-weakset", "javascript/performance", "javascript/memoization", "javascript/event-delegation", "javascript/abortcontroller", "nodejs/v8-internals"],
    tags: ["garbage-collection", "memory-leaks", "mark-and-sweep", "generational-gc", "heap-snapshot", "v8", "orinoco"],
    sources: [],
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: [
        "Explain the memory lifecycle (allocate, use, release) and reachability from roots",
        "Describe mark-and-sweep and why reference counting fails on cycles",
        "Describe V8's generational GC: young generation scavenges, old generation mark-compact, and concurrent/incremental marking (as an implementation detail)",
        "Recognise the classic leak patterns and fix them",
        "Find leaks with DevTools heap snapshots, allocation timelines and Node's `--inspect`/`writeHeapSnapshot`",
      ] }] },
      { id: "intuition", blocks: [
        { type: "p", text: "Think of memory as a city of buildings connected by roads. The garbage collector starts from a few always-open entrances (**roots**: globals, the current call stack) and walks every road. Any building it can't reach is demolished. A **leak** in a GC'd language is a building you no longer need but that is still connected by some forgotten road." },
      ] },
      { id: "definition", blocks: [
        { type: "list", items: [
          "**Garbage collection (GC)**: automatic reclamation of memory for objects that can no longer be reached by the program.",
          "**Roots**: starting points always considered live — the global object, local variables and arguments on the current stacks, handles held by the host (e.g. DOM nodes in the document, active timers' callbacks, registered event listeners).",
          "**Reachable**: transitively referenced from a root. Reachable objects are kept; unreachable ones are collected — whether or not your program will ever use them again.",
          "**Memory leak**: memory that is reachable but no longer needed, and grows over time.",
        ] },
        { type: "callout", tone: "note", title: "The spec says almost nothing", text: "ECMAScript doesn't define a GC algorithm or when collection happens; it only constrains weak references (WeakRef/FinalizationRegistry). Everything below about generations and marking is how engines — specifically V8 — implement it." },
      ] },
      { id: "why", blocks: [
        { type: "p", text: "Long-lived single-page apps and Node servers run for hours or days. A small leak per navigation or per request eventually causes jank (longer GC pauses), tab crashes or out-of-memory restarts." },
      ] },
      { id: "internals", blocks: [
        { type: "p", text: "**Reference counting** (early IE, COM) frees an object when its count drops to zero, but two objects referencing each other never reach zero. **Tracing (mark-and-sweep)**, used by all modern engines, handles cycles: unreachable cycles are simply never marked." },
        { type: "steps", steps: [
          { title: "Mark", detail: "Starting from roots, visit every reachable object and mark it (tri-color marking: white = unvisited, grey = discovered, black = fully scanned)." },
          { title: "Sweep", detail: "Unmarked (white) objects' memory is added to free lists." },
          { title: "Compact (sometimes)", detail: "Live objects are moved together to reduce fragmentation, and pointers updated." },
        ] },
        { type: "callout", tone: "spec-vs-impl", title: "V8's generational collector (Orinoco)", text: "Based on the *generational hypothesis* (most objects die young), V8 splits the heap. New objects are bump-allocated in the small **young generation** and collected by a frequent, fast **scavenger** (a parallel semi-space copying collector) that copies survivors; objects surviving two scavenges are promoted to the **old generation**, collected by **mark-compact**. Marking runs mostly concurrently/incrementally on helper threads with write barriers, and sweeping is concurrent, keeping main-thread pauses short. Large objects live in a separate space. Details change between V8 versions." },
        { type: "p", text: "**Closures and GC.** A closure keeps its environment reachable. In V8, all closures created in the same scope share one Context object, so a long-lived closure can keep alive variables captured only by a sibling closure — a subtle leak source." },
      ] },
      { id: "visualization", blocks: [
        { type: "p", text: "In the references visualization, remove the last reference to an object and watch it become unreachable — that is precisely when it becomes eligible for collection. Then keep one stray reference (a cache entry, a listener) and see the whole subgraph stay alive." },
        { type: "viz", id: "js-references", caption: "Conceptual reachability graph; not V8's actual heap layout." },
      ] },
      { id: "walkthrough", title: "Walkthrough: the five classic leaks", blocks: [
        { type: "code", lang: "js", caption: "1. Forgotten listeners and timers", code: `function mountWidget(el) {
  const big = new Array(1e6).fill("data");
  const onResize = () => console.log(big.length, el.id);
  window.addEventListener("resize", onResize);           // window holds onResize → big, el
  const id = setInterval(() => console.log(big.length), 1000); // timer holds its callback
  return function unmount() {                            // the fix: tear down
    window.removeEventListener("resize", onResize);
    clearInterval(id);
  };
}` },
        { type: "code", lang: "js", caption: "2. Unbounded caches and global collections", code: `const cache = new Map();                    // grows forever, keyed by request
function getUser(req) {
  if (!cache.has(req)) cache.set(req, loadUser(req));
  return cache.get(req);
}
// Fix: bound it (LRU/TTL), or key by object with a WeakMap so entries die with the key
const meta = new WeakMap();` },
        { type: "code", lang: "js", caption: "3. Detached DOM nodes", code: `const rows = [];
function render(list) {
  for (const item of list) {
    const tr = document.createElement("tr");
    rows.push(tr);              // JS array keeps every row...
    table.append(tr);
  }
}
table.innerHTML = "";           // ...so removed rows stay alive as 'detached' nodes` },
        { type: "code", lang: "js", caption: "4. Closures capturing more than needed", code: `function handler(bigPayload) {
  const summary = bigPayload.items.length;   // capture only what you need
  return () => console.log(summary);         // not () => console.log(bigPayload.items.length)
}` },
        { type: "code", lang: "js", caption: "5. Accidental globals (sloppy mode)", code: `function f() { leaked = new Array(1e6); }  // no declaration → global property; strict mode throws` },
      ] },
      { id: "examples", title: "Finding leaks", blocks: [
        { type: "steps", steps: [
          { title: "Reproduce", detail: "Perform the suspected action repeatedly (open/close a modal 10×, send 1000 requests)." },
          { title: "Observe growth", detail: "DevTools Performance/Memory panel or `performance.memory`-style metrics; in Node, `process.memoryUsage().heapUsed` over time." },
          { title: "Three-snapshot technique", detail: "Take a heap snapshot, do the action, snapshot again, repeat, snapshot again. Compare: objects allocated between 1 and 2 still present in 3 are suspects." },
          { title: "Follow retainers", detail: "In the snapshot, select a suspect and read its *retainers* path back to a root (e.g. `Window → listeners → closure → context → bigArray`). Search for \"Detached\" to find detached DOM trees." },
          { title: "Fix and verify", detail: "Remove the reference (cleanup function, WeakMap, bounded cache) and confirm the count no longer grows." },
        ] },
        { type: "p", text: "In Node: run with `--inspect` and use Chrome DevTools, or call `v8.writeHeapSnapshot()`; `--max-old-space-size` changes the heap limit but only delays a leak." },
      ] },
      { id: "edge-cases", blocks: [
        { type: "list", items: [
          "`delete obj.prop` or setting variables to `null` only helps if that was the last path to the object; it doesn't free anything by itself.",
          "Console logging an object in DevTools keeps it reachable from the console — leaks that vanish when you stop logging.",
          "Unresolved promises that are referenced (e.g. stored in a map) keep their reaction closures alive.",
          "WeakRef/FinalizationRegistry callbacks are non-deterministic and may never run; never rely on them for correctness.",
          "Removing a DOM element whose listeners reference only itself is fine — modern GCs collect the cycle. Old IE's separate DOM refcounting is history.",
        ] },
      ] },
      { id: "mistakes", blocks: [
        { type: "callout", tone: "misconception", title: "\"Cycles leak in JavaScript\"", text: "Not with tracing GC: an unreachable cycle is collected. Leaks come from *reachable* things you forgot about." },
        { type: "callout", tone: "misconception", title: "\"Calling gc() / nulling everything improves performance\"", text: "Forcing GC (only possible with flags) usually hurts. Write code that drops references naturally; let the collector do its job." },
      ] },
      { id: "tradeoffs", blocks: [
        { type: "compare", items: [
          { title: "Allocation-heavy code", points: ["Young-gen GC makes short-lived garbage cheap", "Very high allocation rates still cost scavenges and promotions"] },
          { title: "Object pooling / reuse", points: ["Fewer allocations in hot paths (games, parsers)", "Pooled objects are long-lived and old-gen; complexity; easy to leak state"] },
        ] },
      ] },
      { id: "real-world", blocks: [
        { type: "list", items: [
          "React effects must return cleanup functions for subscriptions, intervals and listeners.",
          "`addEventListener(type, fn, { signal })` + `AbortController.abort()` removes many listeners at once on teardown.",
          "Server caches keyed by request/user must be bounded (LRU) or external (Redis).",
          "Node EventEmitter warns when more than 10 listeners are added to one event — often a leak symptom.",
        ] },
      ] },
      { id: "interview-short", blocks: [
        { type: "p", text: "JavaScript uses automatic garbage collection based on reachability: starting from roots like globals and the call stack, the collector marks everything reachable and frees the rest — mark-and-sweep, which also handles cycles. V8 is generational: new objects go into a young space collected often by a fast scavenger, survivors are promoted to an old space collected by mark-compact, mostly concurrently. A memory leak is memory that's still reachable but no longer needed — typically forgotten event listeners or intervals, unbounded caches or global arrays, detached DOM nodes held in JS, or closures capturing large objects. I find them with heap snapshots, comparing retained objects and following their retainer paths." },
      ] },
      { id: "interview-deep", blocks: [
        { type: "p", text: "Discuss roots and tri-color marking, why refcounting fails on cycles, the generational hypothesis and V8's scavenger/mark-compact split, concurrent marking with write barriers, shared closure contexts, ephemeron semantics of WeakMap, and the three-snapshot debugging technique with retainer analysis." },
      ] },
      { id: "summary", blocks: [{ type: "list", items: [
        "Reachable from roots = alive; unreachable = collectable.",
        "Mark-and-sweep handles cycles; refcounting doesn't.",
        "V8: young-gen scavenges + old-gen mark-compact, mostly concurrent (engine detail).",
        "Leaks: listeners, timers, caches, detached DOM, fat closures, accidental globals.",
        "Diagnose with heap snapshots and retainer paths.",
      ] }] },
    ],
    glossary: [
      { term: "Garbage collector", definition: "Runtime component that reclaims memory of unreachable objects." },
      { term: "Root", definition: "A reference always considered live (globals, stack slots, host handles)." },
      { term: "Mark-and-sweep", definition: "Tracing GC that marks reachable objects then frees unmarked ones." },
      { term: "Generational GC", definition: "Collecting young objects frequently and old objects rarely, exploiting that most objects die young." },
      { term: "Scavenger", definition: "V8's young-generation copying collector (engine detail)." },
      { term: "Detached DOM node", definition: "A node removed from the document but still referenced from JavaScript." },
      { term: "Retainer", definition: "An object holding a reference that keeps another object alive." },
    ],
    followUps: [
      { q: "How do WeakMaps help avoid leaks?", a: "Entries don't keep their keys alive; when a key object becomes otherwise unreachable, its entry (and value, if not referenced elsewhere) can be collected." },
      { q: "What causes long GC pauses?", a: "Large old-generation heaps with many live objects, high promotion rates and very large allocations. V8 mitigates with incremental/concurrent marking, but app-level fixes (less retained state, bounded caches) matter most." },
      { q: "Can closures cause leaks?", a: "Only when a closure that is still reachable keeps unneeded data alive — e.g. a never-removed listener or an interval. Plus V8's shared-context effect between sibling closures." },
    ],
    quiz: [
      { id: "gc-1", prompt: "Two objects reference each other but nothing else references them. What happens?", options: ["They leak forever", "They're collectable", "Only one is collected", "TypeError"], answer: 1, explanation: "Tracing GC collects unreachable cycles." },
      { id: "gc-2", prompt: "Which is NOT a common leak source?", options: ["Interval never cleared", "Listener on window never removed", "Unbounded Map cache", "A local variable in a function that returned"], answer: 3, explanation: "Locals become unreachable when the function returns (unless captured by a reachable closure)." },
      { id: "gc-3", prompt: "In V8, where are most new objects allocated?", options: ["Old space", "Young generation (nursery)", "Large object space", "The stack"], answer: 1, explanation: "New objects are allocated in the young generation and promoted if they survive." },
    ],
    questions: ["javascript/js-32", "javascript/js-39", "javascript/js-38"],
  },
  outline({
    slug: "performance",
    title: "JavaScript performance and profiling",
    summary: "Measuring before optimising: DevTools performance profiles, long tasks and INP, layout thrashing, engine-friendly code (stable shapes, monomorphic calls) and Node profiling.",
    level: "advanced",
    frequency: "medium",
    minutes: 35,
    prerequisites: ["javascript/event-loop", "javascript/memory-leaks-gc"],
    related: ["javascript/debounce-throttle", "javascript/dom-manipulation", "javascript/storage-workers-raf", "nodejs/jit-compilation", "nodejs/v8-internals"],
    tags: ["performance", "profiling", "long-tasks", "inp", "jit", "hidden-classes"],
    sources: [],
    objectives: [
      "Measure with `performance.now()`, User Timing marks and DevTools/`--cpu-prof` profiles before changing code",
      "Identify long tasks and improve responsiveness (INP) by yielding to the event loop",
      "Avoid forced synchronous layout (read-then-write batching)",
      "Write engine-friendly code: consistent object shapes, monomorphic call sites, avoiding `delete` and holey arrays (V8 detail)",
      "Choose algorithms and data structures first; micro-optimise last",
    ],
    covers: [
      "Profiling workflow in browsers and Node (flame charts)",
      "Main-thread budget: 50 ms long tasks, 16.7 ms frames",
      "Rendering pipeline costs: style, layout, paint, composite",
      "JIT basics: Ignition/Sparkplug/Maglev/TurboFan tiers, inline caches, deoptimisation (engine detail)",
      "Memory and GC pressure as a performance problem",
      "Bundle size, code splitting and lazy loading",
    ],
    questions: ["javascript/js-38"],
  }),
  outline({
    slug: "error-handling",
    title: "Error handling, exceptions and custom errors",
    summary: "try/catch/finally semantics, the built-in Error types, custom error classes with `cause`, async error handling, and global handlers.",
    level: "intermediate",
    frequency: "high",
    minutes: 25,
    kinds: ["theory", "coding"],
    prerequisites: ["javascript/classes-inheritance", "javascript/promises"],
    related: ["javascript/async-await", "javascript/call-stack", "javascript/callbacks"],
    tags: ["errors", "try-catch", "finally", "custom-errors", "error-cause", "unhandledrejection"],
    sources: [],
    objectives: [
      "Explain try/catch/finally control flow, including `return` inside `finally` overriding",
      "Use built-in types (TypeError, RangeError, SyntaxError, ReferenceError, AggregateError) meaningfully",
      "Write custom error classes (`class NotFoundError extends Error`) with `name` and `cause`",
      "Handle errors in callbacks, promises and async functions; know why try/catch can't catch async callback throws",
      "Install global handlers (`error`, `unhandledrejection`, Node `uncaughtException`) for reporting, not recovery",
    ],
    covers: [
      "Throwing anything vs throwing Errors (stack traces)",
      "finally semantics and pitfalls",
      "Custom errors, `instanceof` checks, `Error.cause` chaining",
      "Async error handling patterns",
      "Global handlers and crash policies (Node 15 unhandled rejections)",
    ],
    questions: ["javascript/js-24", "javascript/js-34"],
  }),
  outline({
    slug: "singleton",
    title: "The singleton pattern in JavaScript",
    summary: "Ensuring one shared instance: module-level singletons (ES modules are evaluated once), class-based singletons, lazy initialisation, and why singletons complicate testing.",
    level: "intermediate",
    frequency: "medium",
    minutes: 15,
    prerequisites: ["javascript/modules", "javascript/classes-inheritance"],
    related: ["javascript/getters-setters-static", "javascript/iife", "javascript/closures"],
    tags: ["singleton", "design-patterns", "modules"],
    sources: [],
    objectives: [
      "Implement a singleton with a module export, a closure, and a class with a static instance",
      "Explain that ES modules are already singletons per resolved specifier (and when that breaks: duplicate packages, different URLs)",
      "Discuss drawbacks: hidden global state, test isolation, tight coupling — and dependency injection as an alternative",
    ],
    covers: [
      "Module-scope instances",
      "Class singletons with `static #instance` and a private constructor substitute",
      "Lazy initialisation (including async)",
      "Testing and resetting singletons",
      "Node module cache and duplicate-package pitfalls",
    ],
    questions: ["javascript/js-46"],
  }),
  outline({
    slug: "decorators",
    title: "Decorators (and their version caveats)",
    summary: "Decorators wrap classes and class members declaratively. TC39 decorators (stage 3) differ from TypeScript's legacy `experimentalDecorators` — know which one your tooling uses.",
    level: "advanced",
    frequency: "low",
    minutes: 25,
    prerequisites: ["javascript/classes-inheritance", "javascript/higher-order-functions"],
    related: ["javascript/proxy-reflect", "javascript/memoization", "typescript/generics"],
    tags: ["decorators", "tc39", "typescript", "metaprogramming"],
    sources: [],
    objectives: [
      "Explain the decorator idea as higher-order functions applied to class elements",
      "Write a TC39-style method decorator `(value, context) => replacement` (e.g. `@logged`, `@bound`, `@memoize`)",
      "Contrast with TypeScript legacy decorators (`target, key, descriptor`; parameter decorators; `emitDecoratorMetadata`) used by Angular/NestJS",
      "State the support caveat: as of 2025 no major browser ships decorators natively; they are compiled by TypeScript 5+/Babel",
    ],
    covers: [
      "Decorator kinds: class, method, getter/setter, field, auto-accessor (`accessor` keyword)",
      "`context` object: kind, name, static, private, `addInitializer`, metadata",
      "Writing decorators without decorators (plain wrappers)",
      "Legacy vs standard decorators and migration",
      "Version/support status — check before relying on it",
    ],
    questions: ["javascript/js-43"],
  }),
  outline({
    slug: "tail-calls",
    title: "Tail calls and proper tail calls (PTC)",
    summary: "ES2015 specified proper tail calls in strict mode, but only Safari's JavaScriptCore implements them; V8 and SpiderMonkey don't. What that means for recursion depth, and practical alternatives (loops, trampolines).",
    level: "advanced",
    frequency: "low",
    minutes: 20,
    prerequisites: ["javascript/recursion", "javascript/call-stack"],
    related: ["javascript/generators-iterators"],
    tags: ["tail-calls", "ptc", "tco", "recursion", "trampoline"],
    sources: [],
    objectives: [
      "Define a tail call (the call is the last action; its result is returned directly)",
      "Know the support reality: spec'd for strict mode in ES2015, implemented only in JavaScriptCore (Safari); not in V8 (Chrome/Node) or SpiderMonkey (Firefox)",
      "Explain the debate (lost stack frames for debugging; the abandoned 'syntactic tail calls' proposal)",
      "Convert tail-recursive functions to loops or use a trampoline",
    ],
    covers: [
      "Tail position rules and accumulator-style recursion",
      "PTC vs TCO terminology",
      "Engine support history (V8 shipped then removed behind a flag)",
      "Trampolines and explicit stacks",
    ],
    questions: ["javascript/js-42"],
  }),
  outline({
    slug: "bundling-transpilation",
    title: "Bundling, transpilation and module resolution",
    summary: "What happens between your source and the browser: transpilers (TypeScript, Babel, SWC, esbuild), bundlers (Vite/Rollup, webpack), module resolution, tree-shaking, code splitting, source maps and polyfills.",
    level: "intermediate",
    frequency: "medium",
    minutes: 30,
    prerequisites: ["javascript/modules"],
    related: ["javascript/script-loading", "javascript/performance", "production/build-performance", "production/monorepos-turborepo"],
    tags: ["bundlers", "transpilation", "babel", "vite", "webpack", "tree-shaking", "source-maps"],
    sources: [],
    objectives: [
      "Distinguish transpiling syntax from polyfilling APIs (and browserslist targets)",
      "Explain what a bundler does: resolve, transform, link the graph, tree-shake, split chunks, emit with hashes",
      "Explain Node/bundler module resolution (`node_modules`, `package.json` `exports`/`main`/`module`, conditions)",
      "Use source maps and understand `sideEffects` for tree-shaking",
    ],
    covers: [
      "Transpilers and their trade-offs (type-checking vs type-stripping)",
      "Bundler pipeline and dev-server models (unbundled ESM in dev)",
      "Resolution algorithms and dual CJS/ESM packages",
      "Tree-shaking prerequisites and pitfalls",
      "Code splitting and dynamic import",
    ],
  }),
  outline({
    slug: "testing-linting",
    title: "Testing, linting and conventions",
    summary: "Keeping JavaScript correct and consistent: unit tests with Vitest/Jest, fake timers and mocks, ESLint rules that catch real bugs, Prettier, and naming conventions.",
    level: "beginner",
    frequency: "medium",
    minutes: 25,
    kinds: ["theory", "coding"],
    prerequisites: ["javascript/modules", "javascript/async-await"],
    related: ["javascript/debounce-throttle", "javascript/error-handling", "production/git-workflows"],
    tags: ["testing", "vitest", "jest", "eslint", "prettier", "conventions"],
    sources: [],
    objectives: [
      "Write unit tests (arrange/act/assert) for pure functions and async code",
      "Use fake timers, spies and module mocks judiciously",
      "Configure ESLint to catch bugs (`no-undef`, `eqeqeq`, `no-unused-vars`, `no-floating-promises` via typescript-eslint) and let Prettier own formatting",
      "Follow common conventions: camelCase, PascalCase classes, UPPER_SNAKE constants, named exports",
    ],
    covers: [
      "Test runners: Vitest, Jest, node:test",
      "Testing async code and timers",
      "Mocks vs fakes; testing behaviour not implementation",
      "Lint rules with high bug-catching value",
      "Formatting and naming conventions",
    ],
  }),
];

// ---------------------------------------------------------------------------
export const lessons: Lesson[] = [...foundations, ...scopeFunctions, ...objectsOop, ...asyncJs, ...browser, ...advanced];
