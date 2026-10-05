import type { InterviewQuestion } from "../types";

/**
 * JavaScript interview questions 1–26 (ranked by interview frequency, as supplied by the learner).
 * Questions 27–52 live in `javascript-b.ts`.
 * Only topics were supplied, so `question` is a natural interviewer phrasing of each topic.
 */

const learnerList = {
  label: "Learner-supplied JavaScript interview list (topics ranked by frequency)",
  kind: "original-note",
  note: "Only topic names were supplied; question wording and all explanations are original.",
} as const;

export const questions: InterviewQuestion[] = [
  // ───────────────────────────────────────────── 1. Event loop
  {
    id: "js-01",
    track: "javascript",
    number: 1,
    question: "What is the event loop in JavaScript and how does it work?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["event-loop", "microtasks", "tasks", "async", "runtime"],
    shortAnswer:
      "JavaScript runs your code on a single thread with one call stack. The event loop is the mechanism in the *host* (the browser or Node) that decides what runs next once the stack is empty.\n\nThere are two main kinds of queued work: **tasks** (also called macrotasks — timers, I/O callbacks, UI events, message events) and **microtasks** (promise reactions, `queueMicrotask`, `MutationObserver`). The loop takes one task, runs it to completion, then **drains the entire microtask queue** — including microtasks queued by other microtasks — and only then (in a browser) may render and pick the next task.\n\nThat is why `Promise.resolve().then(...)` always runs before `setTimeout(..., 0)`, and why an infinite chain of microtasks can freeze a page just like a `while (true)` loop.",
    deep: [
      { type: "p", text: "**Intuition.** Think of a single chef (the thread) with one order pad (the call stack). The chef never stops halfway through a dish. Waiters keep dropping new orders into an inbox (the task queue), and there is also a small \"urgent sticky-notes\" pile (the microtask queue). After each dish, the chef clears *every* sticky note — even ones added while clearing — before taking the next order from the inbox." },
      { type: "viz", id: "js-event-loop", caption: "Step through sync code, microtasks and tasks to see the ordering." },
      { type: "steps", steps: [
        { title: "Run the current task to completion", detail: "The initial script itself is a task. Every function call pushes a frame on the call stack; nothing can interrupt it (run-to-completion)." },
        { title: "Stack empties → microtask checkpoint", detail: "The host runs microtasks one by one until the microtask queue is empty. Microtasks queued during this phase are run in the same checkpoint." },
        { title: "Rendering opportunity (browsers)", detail: "The browser *may* run `requestAnimationFrame` callbacks, style, layout and paint — typically aligned with the display refresh rate, not after every task." },
        { title: "Pick the next task", detail: "The loop takes the oldest runnable task from one of its task queues (the browser can prioritise between queues, e.g. user input over timers) and repeats." },
      ] },
      { type: "table", head: ["Queue", "Examples", "When it runs"], rows: [
        ["Call stack", "your synchronous code", "now, until it returns"],
        ["Microtask queue", "`promise.then/catch/finally`, `await` continuations, `queueMicrotask`, `MutationObserver`", "after the stack empties, fully drained before anything else"],
        ["Task queues", "`setTimeout`, `setInterval`, `MessageChannel`, I/O, UI events", "one task per loop iteration"],
        ["Animation frame callbacks (browser)", "`requestAnimationFrame`", "before the next paint"],
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Who owns the event loop?", text: "ECMAScript itself only defines *jobs* (e.g. promise jobs) and says the host must run them when the stack is empty. The actual event loop is defined by the **HTML Standard** for browsers and by **libuv** for Node.js. V8 does not ship an event loop for the browser; it provides the microtask queue that the embedder drains." },
      { type: "p", text: "**Node.js differences.** Node's loop runs in *phases*: timers → pending callbacks → poll (I/O) → check (`setImmediate`) → close callbacks. `process.nextTick` callbacks run in their own queue *before* promise microtasks. Since **Node 11**, microtasks are drained after *each* individual `setTimeout`/`setImmediate` callback, matching browser behaviour; before Node 11 they ran only between phases." },
      { type: "list", items: [
        "In Node's main module, `setTimeout(fn, 0)` vs `setImmediate(fn)` order is **not deterministic** (it depends on how fast the loop starts). Inside an I/O callback, `setImmediate` always fires first.",
        "Microtask starvation: a microtask that keeps queueing microtasks blocks rendering and all tasks forever.",
        "Long tasks (> 50 ms) make a page feel janky because input events have to wait for the current task to finish.",
        "`await` always resumes in a microtask, even when awaiting a non-promise value.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve()
  .then(() => console.log("C"))
  .then(() => console.log("D"));
queueMicrotask(() => console.log("E"));
console.log("F");`,
      output: `A
F
C
E
D
B`,
    },
    walkthrough: [
      { title: "Sync: log A", detail: "The script task starts; `A` prints immediately." },
      { title: "Schedule timer", detail: "`setTimeout(..., 0)` hands the callback to the host's timer; when it expires it becomes a *task*. Nothing prints." },
      { title: "Queue first promise reaction", detail: "`Promise.resolve()` is already fulfilled, so the `C` callback is queued as a microtask right away. The `D` reaction waits for the promise returned by the first `.then`." },
      { title: "Queue E", detail: "`queueMicrotask` appends `E` after `C`. Microtask queue: [C, E]." },
      { title: "Sync: log F", detail: "`F` prints; the script task ends and the stack is empty." },
      { title: "Drain microtasks", detail: "Run `C` → its promise fulfils, queuing `D` at the end: [E, D]. Run `E`, then `D`. The queue is now empty." },
      { title: "Next task", detail: "The timer task runs and prints `B`." },
    ],
    followUps: [
      { q: "What is the output order of `setTimeout(f, 0)` and `setImmediate(g)` in Node?", a: "From the main module it is non-deterministic: it depends on whether the 1 ms timer has expired when the loop enters the timers phase. Inside an I/O callback, `setImmediate` always runs first because the check phase comes right after poll." },
      { q: "Where does `process.nextTick` fit?", a: "Node runs the nextTick queue before the promise microtask queue whenever it drains microtasks. Recursive `nextTick` calls can starve I/O, which is why Node docs recommend `queueMicrotask` or `setImmediate` for most cases." },
      { q: "When does the browser render relative to tasks and microtasks?", a: "Rendering happens at most once per loop iteration, after a task and its microtask checkpoint, and only when the browser decides a frame is due (usually ~60 Hz). `requestAnimationFrame` callbacks run just before that paint." },
      { q: "How do you break up a long-running computation so the page stays responsive?", a: "Split it into chunks and yield between chunks with a *task* (`setTimeout`, `MessageChannel`, or `scheduler.yield()`/`scheduler.postTask` where supported), or move it to a Web Worker. Yielding via a microtask does not help because microtasks run before rendering and input." },
      { q: "Is JavaScript really single-threaded?", a: "Each agent (a page, a worker) runs JS on one thread at a time, but the host uses other threads for networking, timers, disk I/O (libuv thread pool in Node), and garbage collection. Workers give you additional JS threads with their own event loops." },
    ],
    pitfalls: [
      "Saying `setTimeout(fn, 0)` runs \"immediately\": it runs in a later task, after all microtasks, and may be clamped (≥ 4 ms when deeply nested in browsers).",
      "Thinking only one microtask runs between tasks — the whole queue is drained.",
      "Using a microtask loop to \"yield\" to the UI — it never lets the browser paint.",
      "Assuming Node and browser loops are identical (phases, `setImmediate`, `process.nextTick`).",
    ],
    glossary: [
      { term: "Call stack", definition: "The list of functions currently executing; the most recently called function is on top." },
      { term: "Task (macrotask)", definition: "A unit of work like a timer callback or a click handler; the event loop runs one per iteration." },
      { term: "Microtask", definition: "A small high-priority job (promise reaction, `queueMicrotask`) that runs as soon as the stack empties, before the next task." },
      { term: "Run-to-completion", definition: "Once a function starts, no other JavaScript on that thread can run until the stack is empty." },
      { term: "Host", definition: "The environment embedding the JS engine (browser, Node, Deno) that provides timers, I/O and the event loop." },
    ],
    relatedLessons: ["javascript/event-loop", "javascript/sync-vs-async", "javascript/promises", "javascript/timers", "javascript/call-stack", "nodejs/node-event-loop"],
    relatedQuestions: ["js-09", "js-14", "js-20", "js-07"],
    sources: [
      learnerList,
      { label: "MDN — JavaScript execution model", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model", kind: "docs" },
      { label: "MDN — Using microtasks (queueMicrotask guide)", url: "https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide", kind: "docs" },
      { label: "HTML Standard — Event loops", url: "https://html.spec.whatwg.org/multipage/webappapis.html#event-loops", kind: "docs" },
      { label: "Node.js — The event loop, timers and process.nextTick()", url: "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick", kind: "docs" },
    ],
  },

  // ───────────────────────────────────────────── 2. Closures
  {
    id: "js-02",
    track: "javascript",
    number: 2,
    question: "What is a closure in JavaScript?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["closures", "scope", "lexical-environment", "functions"],
    shortAnswer:
      "A closure is a function bundled together with the variables from the scope where it was **defined**. In JavaScript every function is a closure: when it is created it keeps a hidden reference to its surrounding lexical environment, so it can still read and update those variables after the outer function has returned.\n\nThat is how we get private state (a counter whose `count` nobody else can touch), function factories like `makeMultiplier(2)`, and callbacks that remember context. The key detail is that closures capture **bindings, not values** — if the variable changes later, the closure sees the new value — and anything captured stays alive as long as the closure is reachable.",
    deep: [
      { type: "p", text: "**Intuition.** A function is like a backpack-wearing worker: when it is created it packs a reference to the room it was built in. Wherever it is sent later, it can still reach into that backpack. The backpack holds *live links* to variables, not photocopies." },
      { type: "viz", id: "js-closure", caption: "Watch the counter's lexical environment survive after makeCounter returns." },
      { type: "steps", steps: [
        { title: "Creation", detail: "When a function object is created, the engine stores the current lexical environment in its internal `[[Environment]]` slot." },
        { title: "Call", detail: "Calling the function creates a new environment for its parameters and locals whose *outer* reference is that saved `[[Environment]]`." },
        { title: "Lookup", detail: "Identifier resolution walks outward through this chain: local → enclosing function → … → module/global. That chain is fixed by where code is written (lexical scoping), not by where it is called." },
        { title: "Lifetime", detail: "An environment is garbage-collected only when nothing references it. A returned inner function keeps its outer environment alive." },
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "What actually gets retained", text: "The spec models closures as references to whole environment records. Engines like V8 optimise this: variables that no inner function uses stay on the stack, and captured ones are moved into a heap-allocated *context* object. In V8 all closures created in the same scope share one context, so one closure capturing a big object can keep it alive for its siblings too." },
      { type: "list", items: [
        "Closures capture **bindings**: `let` in a `for` loop creates a fresh binding per iteration; `var` creates one shared binding (the classic `3,3,3` bug).",
        "Closures enable the module pattern / data privacy, partial application, memoization, debouncing and React hooks.",
        "Retaining large objects or DOM nodes in long-lived closures (event listeners, timers) is a common memory-leak source.",
        "Question js-26 covers closures again with an emphasis on worked examples; this question is about the definition and mechanics.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `function makeCounter() {
  let count = 0; // private: only the returned methods can reach it
  return {
    increment() { count += 1; return count; },
    get() { return count; },
  };
}

const a = makeCounter();
const b = makeCounter();
a.increment();
a.increment();
b.increment();
console.log(a.get(), b.get());`,
      output: `2 1`,
    },
    walkthrough: [
      { title: "First call", detail: "`makeCounter()` creates environment E1 with `count = 0`. Both methods are created inside it, so their `[[Environment]]` is E1." },
      { title: "Return", detail: "`makeCounter` returns; its stack frame is gone, but E1 survives because `a.increment` and `a.get` reference it." },
      { title: "Second call", detail: "A brand-new environment E2 (`count = 0`) is created for `b`. Counters do not share state." },
      { title: "Mutations", detail: "`a.increment()` twice updates E1's `count` to 2; `b.increment()` updates E2's `count` to 1." },
      { title: "Read", detail: "`a.get()` reads E1 → 2, `b.get()` reads E2 → 1." },
    ],
    followUps: [
      { q: "Why does `for (var i = 0; i < 3; i++) setTimeout(() => console.log(i))` print 3, 3, 3?", a: "`var` is function-scoped, so there is one `i` shared by all callbacks; by the time they run the loop has finished and `i` is 3. With `let`, each iteration gets a new binding so you see 0, 1, 2. Pre-ES6 fix: wrap in an IIFE that takes `i` as a parameter." },
      { q: "Do closures copy variables?", a: "No. They hold a reference to the environment, so they see later reassignments. If you want a snapshot, copy the value into a new binding (e.g. a parameter or a `const` inside the loop)." },
      { q: "How can closures cause memory leaks?", a: "A long-lived closure (event listener, interval, cache) keeps its whole captured scope alive, including large arrays or detached DOM nodes. Remove listeners, clear timers, and avoid capturing more than you need." },
      { q: "What is a stale closure in React?", a: "A callback or effect created during an earlier render still sees that render's props/state. Fixes: correct dependency arrays, functional state updates (`setX(x => x + 1)`), or refs for mutable latest values." },
    ],
    pitfalls: [
      "Defining a closure as \"a function inside a function\" — any function closes over its defining scope, including top-level ones.",
      "Assuming captured values are frozen at creation time.",
      "Creating closures in hot loops and attaching them to many objects when a shared prototype method would do.",
    ],
    glossary: [
      { term: "Lexical scope", definition: "Scope determined by where code is written in the source, not by how it is called." },
      { term: "Lexical environment", definition: "The engine's record of variable names → values for one scope, plus a link to its outer scope." },
      { term: "`[[Environment]]`", definition: "Internal slot on every function object pointing to the environment it was created in." },
      { term: "Binding", definition: "The association between a name and a storage slot; closures capture bindings, so updates are visible." },
    ],
    relatedLessons: ["javascript/closures", "javascript/scope", "javascript/execution-context", "javascript/memory-leaks-gc"],
    relatedQuestions: ["js-26", "js-06", "js-21", "js-08"],
    sources: [
      learnerList,
      { label: "MDN — Closures", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures", kind: "docs" },
      { label: "ECMAScript — Environment Records", url: "https://tc39.es/ecma262/#sec-environment-records", kind: "docs" },
    ],
  },

  // ───────────────────────────────────────────── 3. this
  {
    id: "js-03",
    track: "javascript",
    number: 3,
    question: "How does the `this` keyword work in JavaScript?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["this", "functions", "binding", "strict-mode"],
    shortAnswer:
      "`this` is decided by **how a function is called**, not where it is defined — except for arrow functions, which have no `this` of their own and use the `this` of the surrounding scope.\n\nThe rules, in priority order: called with `new` → `this` is the new object. Explicitly bound with `call`, `apply` or `bind` → the given object. Called as a method, `obj.fn()` → `obj`. A plain call `fn()` → `undefined` in strict mode, or the global object in sloppy mode. So if you pull a method off an object and call it bare, you lose `this` — which is why we `bind` callbacks or use arrows.",
    deep: [
      { type: "p", text: "**Intuition.** `this` is an implicit parameter. Most parameters are passed between the parentheses; `this` is passed by whatever is to the left of the dot (or by `new`, `call`, `apply`, `bind`) at the moment of the call." },
      { type: "viz", id: "js-this", caption: "Try each call style and see which object `this` points to." },
      { type: "table", head: ["Call form", "`this` value", "Notes"], rows: [
        ["`new Fn()`", "freshly created object", "highest priority; even beats `bind`'s thisArg"],
        ["`fn.call(o)`, `fn.apply(o)`, `fn.bind(o)()`", "`o`", "in sloppy mode `null`/`undefined` become `globalThis` and primitives are boxed"],
        ["`obj.fn()` / `obj[\"fn\"]()`", "`obj`", "the base of the member expression at call time"],
        ["`fn()`", "`undefined` (strict) / `globalThis` (sloppy)", "classes and ES modules are always strict"],
        ["arrow function", "inherited lexically", "cannot be changed by `call`/`bind`/`new`"],
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Spec view", text: "In the spec, a method call evaluates to a *Reference Record* whose base is `obj`; the call uses that base as `thisValue`. Assigning `const f = obj.fn` takes only the function value, so the base is lost. Function `[[ThisMode]]` is `lexical` for arrows, `strict` for strict functions, and `global` for sloppy ones." },
      { type: "list", items: [
        "Top-level `this`: `undefined` in ES modules, `globalThis` (window) in classic scripts, `module.exports` in CommonJS modules.",
        "DOM event handlers registered with `addEventListener` and a regular function get `this === event.currentTarget`.",
        "Passing a method as a callback (`setTimeout(obj.fn)`, `arr.map(obj.fn)`) detaches it from `obj`.",
        "Question js-29 focuses specifically on how arrow functions handle `this`; this one covers all binding rules.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `const user = {
  name: "Ada",
  greet() {
    "use strict";
    return this === undefined ? "no this" : "Hi " + this.name;
  },
};

const greet = user.greet;           // detached from user
console.log(user.greet());          // method call
console.log(greet());               // plain call (strict)
console.log(greet.call({ name: "Grace" }));
const bound = greet.bind({ name: "Linus" });
console.log(bound.call({ name: "Other" })); // bind wins over call

function Person(name) { this.name = name; }
console.log(new Person("Alan").name);`,
      output: `Hi Ada
no this
Hi Grace
Hi Linus
Alan`,
    },
    walkthrough: [
      { title: "`user.greet()`", detail: "Method call: the base of `user.greet` is `user`, so `this.name` is \"Ada\"." },
      { title: "`greet()`", detail: "Same function, plain call. The function is strict, so `this` is `undefined`." },
      { title: "`call`", detail: "`call` sets `this` explicitly to `{ name: \"Grace\" }`." },
      { title: "`bind` then `call`", detail: "A bound function ignores any later `this` passed by `call`/`apply`; it stays bound to Linus." },
      { title: "`new`", detail: "`new Person` creates an object, binds it to `this`, runs the body, and returns the object." },
    ],
    followUps: [
      { q: "Which wins: `bind` or `new`?", a: "`new`. Calling `new` on a bound function ignores the bound `this` (bound arguments are still prepended) and constructs a new instance of the target function." },
      { q: "How do you keep `this` in a class method used as an event handler?", a: "Bind it in the constructor (`this.onClick = this.onClick.bind(this)`), use a class field arrow function (`onClick = () => {...}`), or wrap at the call site (`el.addEventListener(\"click\", () => this.onClick())`)." },
      { q: "What is `this` inside a `setTimeout` callback?", a: "For a regular function, browsers call it with `this` set to the global object (`window`) even in strict-mode code; in Node it is the `Timeout` object. Arrow callbacks just inherit the outer `this`, which is what you usually want." },
      { q: "Why does `[1,2].forEach(obj.log)` lose `this`?", a: "Only the function value is passed. `forEach` calls it as a plain function (with `thisArg` undefined unless you pass it as the second argument: `arr.forEach(obj.log, obj)`)." },
    ],
    pitfalls: [
      "Believing `this` refers to the function itself or to its lexical scope.",
      "Using an arrow function as an object method and expecting `this` to be the object.",
      "Forgetting that class bodies are strict, so extracted methods get `undefined`, not `window`.",
    ],
    glossary: [
      { term: "Strict mode", definition: "An opt-in (`\"use strict\"`, automatic in modules and classes) stricter variant of JS; among other things, plain calls get `this = undefined`." },
      { term: "Sloppy mode", definition: "The legacy non-strict mode, where a missing `this` defaults to the global object." },
      { term: "Bound function", definition: "A wrapper created by `bind` that permanently fixes `this` (and optionally leading arguments)." },
      { term: "`globalThis`", definition: "A standard name for the global object in any environment (`window`, `self`, `global`)." },
    ],
    relatedLessons: ["javascript/this-binding", "javascript/call-apply-bind", "javascript/arrow-functions", "javascript/classes-inheritance"],
    relatedQuestions: ["js-29", "js-16", "js-23", "js-49"],
    sources: [
      learnerList,
      { label: "MDN — this", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this", kind: "docs" },
      { label: "MDN — Strict mode", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode", kind: "docs" },
    ],
  },

  // ───────────────────────────────────────────── 4. Prototypal inheritance
  {
    id: "js-04",
    track: "javascript",
    number: 4,
    question: "Explain prototypal inheritance in JavaScript.",
    level: "intermediate",
    frequency: "very-high",
    tags: ["prototypes", "inheritance", "objects", "classes"],
    shortAnswer:
      "Every JavaScript object has a hidden link, `[[Prototype]]`, to another object or `null`. When you read a property that the object doesn't have itself, the engine follows that link and looks on the prototype, then the prototype's prototype, and so on — the **prototype chain** — until it finds it or hits `null` and returns `undefined`.\n\nSo objects inherit directly from other objects, by delegation rather than copying. You set the link with `Object.create(proto)`, or with constructor functions: `new Fn()` links the new object to `Fn.prototype`. ES6 `class` and `extends` are syntax over this same mechanism. Writes, however, go to the object itself and shadow the inherited property rather than changing the prototype.",
    deep: [
      { type: "p", text: "**Intuition.** An object is like a person who, when asked something they don't know, says \"ask my parent\". Methods live once on the parent; every child *delegates* to it. Change the parent's method and every child sees the change immediately." },
      { type: "flow", nodes: ["dog (own: name)", "animal (speak)", "Object.prototype (toString, hasOwnProperty)", "null"], caption: "Lookup for dog.speak walks this chain left to right." },
      { type: "steps", steps: [
        { title: "Get", detail: "`obj.x` checks own properties, then `[[Prototype]]`, recursively. Getters found on the chain run with `this = obj` (the original receiver)." },
        { title: "Set", detail: "`obj.x = v` creates/updates an **own** property on `obj` (shadowing), unless the chain has a setter for `x` (which is called) or a non-writable `x` (assignment fails; TypeError in strict mode)." },
        { title: "`new F()`", detail: "Creates an object whose `[[Prototype]]` is `F.prototype`, calls `F` with `this` bound to it, and returns it unless `F` returns another object." },
        { title: "`class B extends A`", detail: "Sets `B.prototype.[[Prototype]] = A.prototype` (instance methods) and `B.[[Prototype]] = A` (static methods)." },
      ] },
      { type: "callout", tone: "misconception", title: "`prototype` vs `[[Prototype]]`", text: "`F.prototype` is an ordinary property on *functions*: the object that will become the `[[Prototype]]` of instances created by `new F()`. An object's own `[[Prototype]]` is read with `Object.getPrototypeOf(obj)` (the legacy `obj.__proto__` accessor does the same)." },
      { type: "callout", tone: "spec-vs-impl", title: "Performance", text: "Engines like V8 cache property lookups using hidden classes (shapes) and inline caches. Changing an object's prototype after creation with `Object.setPrototypeOf` invalidates those optimisations, so MDN warns it is slow — prefer `Object.create` at creation time." },
      { type: "list", items: [
        "`Object.create(null)` creates an object with no prototype — useful as a pure dictionary with no inherited `toString` or `__proto__` surprises.",
        "`in` checks the whole chain; `Object.hasOwn(obj, k)` / `hasOwnProperty` check only own properties.",
        "`instanceof` checks whether `F.prototype` appears anywhere in the object's chain.",
        "Mutating built-in prototypes (\"prototype pollution\") affects every object and is a security risk.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `const animal = {
  speak() { return this.name + " makes a sound"; },
};

const dog = Object.create(animal); // dog.[[Prototype]] = animal
dog.name = "Rex";

console.log(dog.speak());
console.log(Object.getPrototypeOf(dog) === animal);
console.log(Object.hasOwn(dog, "speak"), "speak" in dog);

animal.speak = function () { return "changed for " + this.name; };
console.log(dog.speak()); // delegation is live

function Cat(name) { this.name = name; }
Cat.prototype.meow = function () { return this.name + ": meow"; };
const c = new Cat("Tom");
console.log(c.meow(), Object.getPrototypeOf(c) === Cat.prototype, c instanceof Cat);`,
      output: `Rex makes a sound
true
false true
changed for Rex
Tom: meow true true`,
    },
    walkthrough: [
      { title: "Create dog", detail: "`Object.create(animal)` makes an empty object whose prototype is `animal`; then `name` is added as an own property." },
      { title: "`dog.speak()`", detail: "`speak` is not own → found on `animal`. It is called with `this = dog`, so it reads `dog.name`." },
      { title: "Own vs inherited", detail: "`Object.hasOwn(dog, \"speak\")` is false; `\"speak\" in dog` walks the chain and is true." },
      { title: "Live delegation", detail: "Replacing `animal.speak` changes behaviour for `dog` immediately, because nothing was copied." },
      { title: "Constructor pattern", detail: "`new Cat(\"Tom\")` links the instance to `Cat.prototype`, where `meow` lives; `instanceof` finds `Cat.prototype` on the chain." },
    ],
    followUps: [
      { q: "How is ES6 `class` different from constructor functions?", a: "It is mostly syntax over the same prototype model, but with differences: class constructors throw if called without `new`, class bodies are strict, methods are non-enumerable, `class` declarations are in the TDZ until evaluated, and `extends`/`super` wire up both prototype chains (including for built-ins like `Array`)." },
      { q: "What is at the end of every prototype chain?", a: "`Object.prototype`, whose `[[Prototype]]` is `null` — unless the object was created with `Object.create(null)` or had its prototype set to `null`." },
      { q: "How would you implement inheritance without `class`?", a: "`function Child(...a) { Parent.call(this, ...a); }` then `Child.prototype = Object.create(Parent.prototype); Child.prototype.constructor = Child;` (and optionally `Object.setPrototypeOf(Child, Parent)` for statics)." },
      { q: "What is prototype pollution?", a: "An attack where untrusted input like `{\"__proto__\": {\"isAdmin\": true}}` is deep-merged into an object, adding properties to `Object.prototype` that every object then inherits. Mitigate with `Object.create(null)`, key allow-lists, and `Object.freeze(Object.prototype)` in some contexts." },
    ],
    pitfalls: [
      "Confusing `F.prototype` with an instance's `[[Prototype]]`.",
      "Putting mutable arrays/objects on a prototype — every instance shares and mutates the same one.",
      "Using `for...in` on objects with inherited enumerable properties without an own-property check.",
      "Calling `Object.setPrototypeOf` in hot code paths.",
    ],
    glossary: [
      { term: "`[[Prototype]]`", definition: "The internal link from an object to the object it inherits from." },
      { term: "Prototype chain", definition: "The sequence of objects followed via `[[Prototype]]` links during property lookup." },
      { term: "Shadowing", definition: "An own property with the same name as an inherited one hides the inherited one." },
      { term: "Delegation", definition: "Forwarding a lookup to another object at access time instead of copying its members." },
    ],
    relatedLessons: ["javascript/prototypes", "javascript/classes-inheritance", "javascript/mixins", "javascript/this-binding"],
    relatedQuestions: ["js-31", "js-47", "js-03"],
    sources: [
      learnerList,
      { label: "MDN — Inheritance and the prototype chain", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain", kind: "docs" },
      { label: "MDN — Object.create()", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create", kind: "docs" },
      { label: "MDN — Object.setPrototypeOf() (performance warning)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf", kind: "docs" },
    ],
  },
  // ───────────────────────────────────────────── 5. Hoisting
  {
    id: "js-05",
    track: "javascript",
    number: 5,
    question: "What is hoisting in JavaScript?",
    level: "beginner",
    frequency: "very-high",
    tags: ["hoisting", "tdz", "scope", "execution-context"],
    shortAnswer:
      "Hoisting is the name for the fact that declarations are processed **before** any code in a scope runs, so they behave as if they were moved to the top. Nothing is physically moved: the engine first sets up the scope (creation phase), then executes it.\n\nWhat differs is how each declaration is initialised. Function declarations are fully hoisted — you can call them before the line they appear on. `var` is hoisted and initialised to `undefined`. `let`, `const` and `class` are hoisted too, but left **uninitialised** until their declaration line runs; touching them earlier throws a `ReferenceError`. That window is the **temporal dead zone**. Function *expressions* and arrow functions follow the rules of the variable they are assigned to.",
    deep: [
      { type: "p", text: "**Intuition.** Before a meeting starts, the organiser writes every attendee's name on the whiteboard. Function declarations show up with their full notes attached; `var` attendees get a blank card (`undefined`); `let`/`const`/`class` attendees are listed but marked \"do not talk to yet\" until they actually arrive." },
      { type: "viz", id: "js-hoisting", caption: "Creation phase vs execution phase, including the temporal dead zone." },
      { type: "table", head: ["Declaration", "Hoisted?", "Initial value before its line", "Scope"], rows: [
        ["`function f() {}`", "yes", "the function object", "function (block in strict mode)"],
        ["`var x`", "yes", "`undefined`", "function"],
        ["`let x` / `const x`", "yes (binding created)", "uninitialised → ReferenceError (TDZ)", "block"],
        ["`class C {}`", "yes (binding created)", "uninitialised → ReferenceError (TDZ)", "block"],
        ["`var f = function () {}`", "only `var f`", "`undefined` → calling throws TypeError", "function"],
        ["`import` bindings", "yes", "linked before the module body runs", "module"],
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Spec terminology", text: "The spec never uses the word *hoisting*. It describes `FunctionDeclarationInstantiation` / `GlobalDeclarationInstantiation`, which create bindings for all declarations before evaluating the body. `let`/`const` bindings are created but stay uninitialised until their `LexicalBinding` is evaluated." },
      { type: "list", items: [
        "The TDZ is *temporal*, not positional: a function declared above can reference a `let` below, as long as it is *called* after the `let` line runs.",
        "`typeof undeclaredName` is `\"undefined\"`, but `typeof x` inside the TDZ of `let x` throws.",
        "Function declarations inside blocks have quirky legacy semantics in sloppy mode (Annex B); in strict mode they are block-scoped. Avoid relying on either.",
        "Duplicate names: a function declaration and a `var` of the same name — the function wins at creation time, but a later assignment overwrites it.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `console.log(typeof hoistedFn);   // function declaration
console.log(v);                  // var
try { console.log(l); } catch (e) { console.log(e.name); }
try { exprFn(); } catch (e) { console.log(e.name); }

var v = 1;
let l = 2;
function hoistedFn() {}
var exprFn = function () {};`,
      output: `function
undefined
ReferenceError
TypeError`,
    },
    walkthrough: [
      { title: "Creation phase", detail: "The engine registers `hoistedFn` (initialised to the function), `v` and `exprFn` (both `undefined`), and `l` (uninitialised)." },
      { title: "`typeof hoistedFn`", detail: "Already a function → \"function\"." },
      { title: "`console.log(v)`", detail: "`v` exists and holds `undefined`; the `= 1` assignment hasn't run yet." },
      { title: "Read `l`", detail: "`l` is in its TDZ → `ReferenceError`." },
      { title: "Call `exprFn`", detail: "`exprFn` is `undefined`; calling `undefined` throws `TypeError` (not ReferenceError)." },
    ],
    followUps: [
      { q: "Are `let` and `const` hoisted?", a: "Yes — their bindings are created at scope entry (which is why they shadow outer variables from the very top of the block), but they are not initialised, so access before the declaration throws. Saying \"they are not hoisted\" is the common inaccurate answer." },
      { q: "What does this print: `var x = 1; function f() { console.log(x); var x = 2; } f();`?", a: "`undefined`. The inner `var x` is hoisted to the top of `f` and shadows the outer `x`, but its assignment hasn't run when `console.log` executes." },
      { q: "Why does the TDZ exist?", a: "To catch use-before-initialisation bugs and to make `const` meaningful — a `const` that could be observed as `undefined` before assignment would effectively have two values." },
      { q: "Are classes hoisted?", a: "The binding is, but it is in the TDZ, so `new C()` before `class C {}` throws a ReferenceError. Class expressions follow the variable they are assigned to." },
    ],
    pitfalls: [
      "Claiming code is \"moved to the top\" literally.",
      "Saying `let`/`const` are not hoisted at all.",
      "Calling a function expression before its assignment and expecting it to work.",
      "Relying on block-level function declarations in sloppy mode.",
    ],
    glossary: [
      { term: "Creation phase", definition: "The setup step when entering a scope, where the engine creates bindings for every declaration." },
      { term: "Temporal dead zone (TDZ)", definition: "The time between entering a scope and executing a `let`/`const`/`class` declaration, during which accessing it throws." },
      { term: "Function declaration", definition: "A statement of the form `function name() {}`; fully initialised during the creation phase." },
      { term: "Function expression", definition: "A function produced as a value, e.g. `const f = function () {}`; only exists once that line runs." },
    ],
    relatedLessons: ["javascript/hoisting-tdz", "javascript/var-let-const", "javascript/execution-context", "javascript/scope"],
    relatedQuestions: ["js-06", "js-02"],
    sources: [
      learnerList,
      { label: "MDN Glossary — Hoisting", url: "https://developer.mozilla.org/en-US/docs/Glossary/Hoisting", kind: "docs" },
      { label: "MDN — let (temporal dead zone)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let", kind: "docs" },
      { label: "ECMAScript — FunctionDeclarationInstantiation", url: "https://tc39.es/ecma262/#sec-functiondeclarationinstantiation", kind: "docs" },
    ],
  },

  // ───────────────────────────────────────────── 6. let, const, var
  {
    id: "js-06",
    track: "javascript",
    number: 6,
    question: "What are the differences between `let`, `const` and `var`?",
    level: "beginner",
    frequency: "very-high",
    tags: ["var", "let", "const", "scope", "tdz"],
    shortAnswer:
      "Three differences matter: **scope**, **hoisting behaviour**, and **reassignment**.\n\n`var` is function-scoped, initialised to `undefined` when hoisted, can be redeclared, and at the top level of a classic script it becomes a property of the global object. `let` and `const` are block-scoped, live in the temporal dead zone until their line runs, and can't be redeclared in the same scope. `const` additionally can't be reassigned and must be initialised — but it is not immutability: the object a `const` points to can still be mutated.\n\nAnother practical difference: in a `for (let i ...)` loop each iteration gets a fresh `i`, so closures capture separate values, whereas `var` shares one. Default today: `const`, `let` when you need to reassign, avoid `var`.",
    deep: [
      { type: "compare", items: [
        { title: "var", points: ["function scope (or global)", "hoisted + initialised to `undefined`", "redeclaration allowed", "global `var` creates a `globalThis` property (classic scripts)", "one binding shared across loop iterations"] },
        { title: "let", points: ["block scope", "hoisted, TDZ until declared", "redeclaration in same scope is a SyntaxError", "reassignable", "fresh binding per `for` iteration"] },
        { title: "const", points: ["block scope", "hoisted, TDZ until declared", "must be initialised", "binding cannot be reassigned (TypeError)", "referenced object stays mutable"] },
      ] },
      { type: "viz", id: "js-references", caption: "`const` freezes the arrow (the binding), not the object on the heap." },
      { type: "callout", tone: "misconception", title: "`const` ≠ immutable", text: "`const arr = []; arr.push(1)` is fine. To make the object itself read-only, use `Object.freeze` (shallow) — see js-35 and js-51." },
      { type: "callout", tone: "spec-vs-impl", title: "Per-iteration bindings", text: "For `for (let i = 0; ...)` the spec's `CreatePerIterationEnvironment` copies the current value into a new environment before each iteration. Engines optimise this away when no closure captures `i`, so `let` loops are not slower in practice." },
      { type: "list", items: [
        "Top-level `let`/`const` in a script live in a shared *declarative* global environment: visible to other scripts but **not** properties of `window`.",
        "Inside ES modules, top-level `var` is module-scoped too — nothing leaks onto `globalThis`.",
        "`const` in `for...of`/`for...in` is fine (`for (const x of xs)`) because each iteration gets a new binding; `for (const i = 0; i < n; i++)` throws on `i++`.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `const fns1 = [];
for (var i = 0; i < 3; i++) fns1.push(() => i);
const fns2 = [];
for (let j = 0; j < 3; j++) fns2.push(() => j);
console.log(fns1.map(f => f()).join(","), fns2.map(f => f()).join(","));

const obj = { n: 1 };
obj.n = 2;                 // mutation is allowed
console.log(obj.n);
try { obj = {}; } catch (e) { console.log(e.name); } // reassignment is not

{
  var fnScoped = "var leaks out of blocks";
  let blockScoped = "let stays inside";
}
console.log(fnScoped, typeof blockScoped);`,
      output: `3,3,3 0,1,2
2
TypeError
var leaks out of blocks undefined`,
    },
    walkthrough: [
      { title: "`var` loop", detail: "A single `i` is shared. After the loop it is 3, so all three closures return 3." },
      { title: "`let` loop", detail: "Each iteration has its own `j` (0, 1, 2), captured separately." },
      { title: "Mutating a const object", detail: "`obj.n = 2` changes the object on the heap; the binding still points to the same object." },
      { title: "Reassigning a const", detail: "`obj = {}` throws `TypeError: Assignment to constant variable` at runtime." },
      { title: "Block scope", detail: "`var` inside a bare block is visible outside; `let` is not, and `typeof` an out-of-scope (undeclared here) name returns \"undefined\"." },
    ],
    followUps: [
      { q: "Why would you ever still see `var`?", a: "Legacy code, transpiled ES5 output, and rare cases needing function-scope across blocks. Modern lint rules (`no-var`, `prefer-const`) push to `let`/`const`." },
      { q: "Does `const` make code faster?", a: "Not meaningfully by itself; engines infer constness. Its value is communicating intent and preventing accidental reassignment." },
      { q: "What happens with `let x = 1; { console.log(x); let x = 2; }`?", a: "ReferenceError: the inner `let x` is hoisted to the top of the block and shadows the outer `x`, so the `console.log` hits the inner `x` in its TDZ." },
      { q: "Is `let x; let x;` allowed?", a: "No — it's an early `SyntaxError`, reported before any code in the script runs. `var x; var x;` is allowed." },
    ],
    pitfalls: [
      "Thinking `const` objects or arrays are immutable.",
      "Using `var` in loops with async callbacks.",
      "Expecting top-level `let` to appear on `window`.",
    ],
    glossary: [
      { term: "Block scope", definition: "Visibility limited to the nearest `{ ... }` block (including `if`, `for`, bare blocks)." },
      { term: "Function scope", definition: "Visibility across the whole function body, regardless of blocks." },
      { term: "Redeclaration", definition: "Declaring the same name twice in one scope; allowed for `var`, a SyntaxError for `let`/`const`." },
      { term: "Binding", definition: "The link between a variable name and the value slot; `const` makes this link permanent." },
    ],
    relatedLessons: ["javascript/var-let-const", "javascript/hoisting-tdz", "javascript/scope", "javascript/freeze-seal"],
    relatedQuestions: ["js-05", "js-02", "js-35"],
    sources: [
      learnerList,
      { label: "MDN — let", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let", kind: "docs" },
      { label: "MDN — const", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const", kind: "docs" },
      { label: "MDN — var", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var", kind: "docs" },
    ],
  },

  // ───────────────────────────────────────────── 7. async / await
  {
    id: "js-07",
    track: "javascript",
    number: 7,
    question: "How do `async` and `await` work in JavaScript?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["async-await", "promises", "microtasks", "error-handling"],
    shortAnswer:
      "`async`/`await` is syntax over promises. An `async` function **always returns a promise**: a returned value fulfils it, a thrown error rejects it.\n\nInside it, `await x` pauses *that function only*: it converts `x` to a promise, registers a continuation, and returns control to the caller. When the promise settles, the rest of the function resumes as a **microtask** — with the value, or by throwing the rejection reason at the `await` line, which is why plain `try/catch` works. Code before the first `await` runs synchronously.\n\nTwo things interviewers look for: awaiting in sequence is slower than starting work together with `Promise.all`, and even `await` on a non-promise value still yields for a microtask tick.",
    deep: [
      { type: "p", text: "**Intuition.** An `async` function is a bookmarkable function. `await` places a bookmark, hands the book back to the event loop, and says \"call me back on this page when the promise is done\". Everything else on the thread keeps running meanwhile." },
      { type: "viz", id: "js-async-await", caption: "See the function suspend at await and resume in a microtask." },
      { type: "steps", steps: [
        { title: "Call", detail: "Calling an async function creates its result promise and runs the body synchronously up to the first `await`." },
        { title: "Await", detail: "`await v` does roughly `PromiseResolve(v)` (returns `v` itself if it's already a native promise), attaches fulfil/reject reactions, and suspends the function. The caller receives the pending result promise." },
        { title: "Resume", detail: "When the awaited promise settles, a microtask resumes the function: the value becomes the result of the `await` expression, or the reason is thrown at that point." },
        { title: "Finish", detail: "`return v` resolves the result promise with `v` (adopting it if `v` is a promise/thenable); an uncaught throw rejects it." },
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Tick counts changed in ES2019", text: "Originally `await nativePromise` cost three microtask ticks. A 2019 spec change (shipped in V8 7.2 / Node 12) made `await` use `PromiseResolve`, so awaiting a native promise now takes one tick. Awaiting a *thenable* (non-native) still takes extra ticks. Code should never depend on exact tick counts." },
      { type: "list", items: [
        "Sequential: `const a = await f(); const b = await g();` — total time ≈ f + g. Concurrent: `const [a, b] = await Promise.all([f(), g()]);` — ≈ max(f, g).",
        "`await` inside `forEach` does not wait: `forEach` ignores the returned promises. Use `for...of` (sequential) or `Promise.all(arr.map(...))` (concurrent).",
        "`return await p` inside `try` is meaningful: without `await`, a rejection skips the local `catch`.",
        "Top-level `await` is allowed in ES modules (not classic scripts or CommonJS).",
        "js-11 compares callbacks, promises and async/await side by side; this question is about the async/await mechanics.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `async function f() {
  console.log("2: inside f, before await");
  const x = await 10; // non-promise: still yields a microtask tick
  console.log("4: after await, x =", x);
  return x * 2;
}

console.log("1: start");
const p = f();
console.log("3: f returned a promise?", p instanceof Promise);
p.then(v => console.log("5: resolved with", v));`,
      output: `1: start
2: inside f, before await
3: f returned a promise? true
4: after await, x = 10
5: resolved with 20`,
    },
    walkthrough: [
      { title: "Sync start", detail: "\"1\" prints." },
      { title: "Enter `f`", detail: "The body runs synchronously: \"2\" prints." },
      { title: "`await 10`", detail: "10 is wrapped in a resolved promise; a resume reaction is queued as a microtask and `f` returns its pending promise `p`." },
      { title: "Back in caller", detail: "\"3 ... true\" prints and `.then` registers a reaction on `p`." },
      { title: "Microtask: resume `f`", detail: "`x = 10`, \"4\" prints, `return 20` fulfils `p`, which queues the `.then` reaction." },
      { title: "Microtask: `.then`", detail: "\"5: resolved with 20\" prints." },
    ],
    followUps: [
      { q: "How do you handle errors with async/await?", a: "Wrap awaits in `try/catch` (and `finally` for cleanup), or attach `.catch` to the promise the async function returns. Unhandled rejections trigger `unhandledrejection` in browsers and, by default since Node 15, crash the Node process." },
      { q: "How do you run several awaits in parallel?", a: "Start all promises first, then await them together: `await Promise.all([a(), b()])` (fails fast), or `Promise.allSettled` when you need every outcome." },
      { q: "Does `await` block the thread?", a: "No. It only suspends the current async function; the event loop keeps running other tasks and microtasks." },
      { q: "What's the difference between `return p` and `return await p`?", a: "Outside `try/catch` they behave almost identically (modern engines optimise both). Inside `try`, only `return await p` lets the local `catch`/`finally` observe the rejection, and it also preserves the function in async stack traces." },
    ],
    pitfalls: [
      "Using `await` inside `forEach` and expecting it to wait.",
      "Accidentally serialising independent requests with consecutive awaits.",
      "Forgetting that an async function returns a promise (e.g. `if (await isValid())` vs `if (isValid())` — the latter is always truthy).",
      "Fire-and-forget async calls without a `.catch`, leading to unhandled rejections.",
    ],
    glossary: [
      { term: "Async function", definition: "A function declared with `async` that always returns a promise and may use `await`." },
      { term: "Suspend / resume", definition: "Pausing a function's execution at `await` and continuing later from the same point with its local variables intact." },
      { term: "Thenable", definition: "Any object with a `then` method; promises adopt the state of thenables." },
      { term: "Top-level await", definition: "Using `await` directly in an ES module body; it delays modules that import it until it settles." },
    ],
    relatedLessons: ["javascript/async-await", "javascript/promises", "javascript/event-loop", "javascript/promise-combinators", "javascript/error-handling"],
    relatedQuestions: ["js-11", "js-09", "js-01", "js-41", "js-44"],
    sources: [
      learnerList,
      { label: "MDN — async function", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function", kind: "docs" },
      { label: "MDN — await", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await", kind: "docs" },
      { label: "V8 blog — Faster async functions and promises", url: "https://v8.dev/blog/fast-async", kind: "external" },
    ],
  },

  // ───────────────────────────────────────────── 8. Higher-order functions
  {
    id: "js-08",
    track: "javascript",
    number: 8,
    question: "What are higher-order functions in JavaScript?",
    level: "beginner",
    frequency: "very-high",
    tags: ["higher-order-functions", "functional-programming", "callbacks", "closures"],
    shortAnswer:
      "A higher-order function is a function that **takes a function as an argument, returns a function, or both**. This works because JavaScript functions are *first-class values*: you can store them in variables, pass them around and return them like any other value.\n\nEveryday examples are `map`, `filter`, `reduce`, `sort` with a comparator, `addEventListener`, and `setTimeout` — they accept callbacks. Functions that *return* functions include `bind`, debounce/throttle wrappers, memoize, and currying helpers; they rely on closures to remember their configuration. The benefit is abstraction: you separate *what* to do with each item from *how* to iterate or *when* to run it.",
    deep: [
      { type: "p", text: "**Intuition.** A higher-order function is a recipe template with a blank labelled \"insert technique here\". `map` knows how to walk an array and build a new one; you supply what happens to each element." },
      { type: "table", head: ["Kind", "Examples", "What the HOF controls"], rows: [
        ["Takes a function", "`arr.map(fn)`, `arr.sort(cmp)`, `el.addEventListener(\"click\", fn)`", "iteration, ordering, timing"],
        ["Returns a function", "`fn.bind(obj)`, `debounce(fn, 300)`, `memoize(fn)`, `x => y => x + y`", "configuration captured in a closure"],
        ["Both (decorators)", "`withLogging(fn)`, `once(fn)`, `withRetry(fn)`", "wraps behaviour around an existing function"],
      ] },
      { type: "callout", tone: "tip", title: "Preserve `this` and arguments in wrappers", text: "A generic wrapper should forward everything: `return function (...args) { return fn.apply(this, args); }`. Using an arrow as the wrapper would lose the caller's `this`." },
      { type: "callout", tone: "spec-vs-impl", title: "Performance", text: "The spec says nothing about speed. V8 can inline small callbacks passed to built-ins like `Array.prototype.map` once code is hot, so HOFs are usually fine; in extremely hot loops a plain `for` loop can still be faster and allocate less." },
      { type: "list", items: [
        "Callbacks passed to array methods receive `(element, index, array)` — this is why `[\"1\",\"2\",\"3\"].map(parseInt)` gives `[1, NaN, NaN]`.",
        "Composition: `const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);`",
        "Related ideas covered elsewhere: currying (js-27), memoization (js-36), map/filter/reduce (js-15), debounce/throttle (js-21).",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `// Takes a function and returns a new one (a decorator)
function withLogging(fn) {
  return function (...args) {
    const result = fn.apply(this, args);
    console.log(fn.name + "(" + args.join(", ") + ") = " + result);
    return result;
  };
}

const add = (a, b) => a + b;
const loggedAdd = withLogging(add);
loggedAdd(2, 3);

// Returns a function that applies f twice
const twice = f => x => f(f(x));
console.log(twice(n => n * 10)(3));

// Takes a function: sort with a comparator
console.log([3, 1, 2].sort((a, b) => a - b).join(","));`,
      output: `add(2, 3) = 5
300
1,2,3`,
    },
    walkthrough: [
      { title: "Wrap", detail: "`withLogging(add)` returns a new function that closes over `fn = add`." },
      { title: "Call wrapper", detail: "`loggedAdd(2, 3)` calls `add` with the same arguments, logs `add(2, 3) = 5` (the arrow got its name `add` from the variable), and returns 5." },
      { title: "`twice`", detail: "`twice(n => n * 10)` returns `x => f(f(x))`; with 3: 3 → 30 → 300." },
      { title: "Comparator", detail: "`sort` decides *when* to compare; the comparator decides *how*. Without it, numbers would be sorted as strings." },
    ],
    followUps: [
      { q: "Why does `[10, 1, 2].sort()` give `[1, 10, 2]`?", a: "The default comparator converts elements to strings and compares UTF-16 code units, so \"10\" < \"2\". Pass `(a, b) => a - b` for numeric sorting." },
      { q: "What is a pure function and why does it matter for HOFs?", a: "A function whose output depends only on its inputs and has no side effects. Pure callbacks make `map`/`filter` predictable, testable and safe to memoize or parallelise." },
      { q: "Write `compose` and `pipe`.", a: "`const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);` applies left-to-right; `compose` is the same with `reduceRight` (right-to-left)." },
      { q: "How are HOFs related to closures?", a: "A HOF that returns a function almost always relies on a closure to remember its arguments (the wrapped function, a delay, a cache)." },
    ],
    pitfalls: [
      "Passing a function that expects different parameters (`map(parseInt)`).",
      "Calling the function instead of passing it: `setTimeout(doWork(), 100)` passes the *result*.",
      "Losing `this` when passing methods as callbacks.",
    ],
    glossary: [
      { term: "First-class function", definition: "Functions are ordinary values that can be stored, passed and returned." },
      { term: "Callback", definition: "A function passed to another function to be called later." },
      { term: "Decorator / wrapper", definition: "A function that takes a function and returns an enhanced version of it." },
      { term: "Pure function", definition: "Same inputs → same output, with no observable side effects." },
    ],
    relatedLessons: ["javascript/higher-order-functions", "javascript/map-filter-reduce", "javascript/closures", "javascript/currying", "javascript/memoization"],
    relatedQuestions: ["js-15", "js-02", "js-27", "js-36", "js-21"],
    sources: [
      learnerList,
      { label: "MDN Glossary — First-class function", url: "https://developer.mozilla.org/en-US/docs/Glossary/First-class_Function", kind: "docs" },
      { label: "MDN Glossary — Callback function", url: "https://developer.mozilla.org/en-US/docs/Glossary/Callback_function", kind: "docs" },
      { label: "MDN — Array.prototype.sort()", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort", kind: "docs" },
    ],
  },
  // ───────────────────────────────────────────── 9. Promises
  {
    id: "js-09",
    track: "javascript",
    number: 9,
    question: "What is a Promise in JavaScript and how does it work?",
    level: "intermediate",
    frequency: "very-high",
    tags: ["promises", "async", "microtasks", "error-handling"],
    shortAnswer:
      "A Promise is an object representing the eventual result of an asynchronous operation. It starts **pending** and settles exactly once, to **fulfilled** with a value or **rejected** with a reason; after that its state never changes.\n\nYou consume it with `.then(onFulfilled, onRejected)`, `.catch` and `.finally`. Each of those returns a **new** promise, resolved with whatever the handler returns — and if the handler returns a promise, the chain waits for it. A thrown error turns into a rejection that skips down to the next `catch`. Handlers always run asynchronously as microtasks, even if the promise is already settled.\n\nThe constructor's executor runs synchronously, and for combining promises we have `Promise.all`, `allSettled`, `race` and `any`.",
    deep: [
      { type: "p", text: "**Intuition.** A promise is a receipt for an order. The receipt exists immediately; the food (value) or an apology (error) arrives later, exactly once. You can tell several people \"when this receipt is ready, do X\" — even after it's ready, they'll still be told, just not instantly." },
      { type: "flow", nodes: ["pending", "fulfilled (value) | rejected (reason)", "reactions queued as microtasks"], caption: "Conceptual state machine: a promise settles at most once." },
      { type: "steps", steps: [
        { title: "Construction", detail: "`new Promise(executor)` calls `executor(resolve, reject)` synchronously. A throw inside the executor rejects the promise. Extra `resolve`/`reject` calls after the first are ignored." },
        { title: "Resolve vs fulfil", detail: "`resolve(x)` fulfils with `x` unless `x` is a promise/thenable — then the promise *follows* `x` (adopts its eventual state). So \"resolved\" can still mean pending." },
        { title: "Subscribing", detail: "`then` registers reactions and returns a new promise. When the source settles, each reaction becomes a microtask (a *PromiseReactionJob*)." },
        { title: "Chaining", detail: "The derived promise resolves with the handler's return value, or rejects with what it throws. Missing handlers pass values/reasons through unchanged." },
      ] },
      { type: "table", head: ["Combinator", "Fulfils when", "Rejects when"], rows: [
        ["`Promise.all`", "all fulfil (array of values, in input order)", "the first rejection"],
        ["`Promise.allSettled`", "all settle (array of `{status, value|reason}`)", "never (for promise inputs)"],
        ["`Promise.race`", "first to settle fulfils", "first to settle rejects"],
        ["`Promise.any`", "first fulfilment", "all reject → `AggregateError`"],
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Unhandled rejections", text: "The spec only defines a `HostPromiseRejectionTracker` hook. Browsers fire `unhandledrejection` events; Node.js (since v15) treats an unhandled rejection as an uncaught exception by default (`--unhandled-rejections=throw`) and exits the process." },
      { type: "list", items: [
        "`.then(a, b)` differs from `.then(a).catch(b)`: in the first, `b` does not catch errors thrown by `a`.",
        "`.finally(fn)` receives no argument and passes the original value/reason through unless `fn` throws or returns a rejected promise.",
        "A promise cannot be cancelled; use `AbortController` with APIs that support it (e.g. `fetch`).",
        "js-41 dives deeper into `Promise.all`; js-11 compares promises with callbacks and async/await.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `const wait = (ms, value, fail) =>
  new Promise((resolve, reject) =>
    setTimeout(() => (fail ? reject(new Error(value)) : resolve(value)), ms));

console.log("sync start");
wait(20, "first")
  .then(v => { console.log("got", v); return wait(10, "second"); })
  .then(v => { console.log("got", v); return wait(5, "boom", true); })
  .then(() => console.log("never runs"))
  .catch(e => { console.log("caught", e.message); return "recovered"; })
  .then(v => console.log("after catch:", v))
  .finally(() => console.log("finally"));

const p = new Promise(resolve => {
  console.log("executor runs synchronously");
  resolve(1);
  resolve(2); // ignored: a promise settles once
});
p.then(v => console.log("settled once with", v));`,
      output: `sync start
executor runs synchronously
settled once with 1
got first
got second
caught boom
after catch: recovered
finally`,
    },
    walkthrough: [
      { title: "Sync phase", detail: "\"sync start\" prints, the 20 ms timer is scheduled and the chain is wired up. The second executor runs immediately and prints its line; `resolve(2)` is ignored." },
      { title: "Microtask", detail: "`p` is already fulfilled, so its reaction runs as soon as the script ends: \"settled once with 1\"." },
      { title: "After 20 ms", detail: "\"got first\". The handler returns a new promise, so the chain waits for it (10 ms)." },
      { title: "After 10 more ms", detail: "\"got second\", then a promise that rejects after 5 ms is returned." },
      { title: "Rejection", detail: "The rejection skips the \"never runs\" handler and reaches `catch`, which returns \"recovered\" — the chain is fulfilled again." },
      { title: "Tail", detail: "\"after catch: recovered\", then `finally`." },
    ],
    followUps: [
      { q: "What's the difference between resolved and fulfilled?", a: "Fulfilled is a final state with a value. Resolved means the promise's fate is locked in — either settled, or following another promise that may still be pending." },
      { q: "How would you promisify a callback API?", a: "`const p = (...args) => new Promise((res, rej) => fn(...args, (err, val) => err ? rej(err) : res(val)));` — Node also offers `util.promisify` and promise-based modules like `fs/promises`." },
      { q: "Why do promise handlers run asynchronously even for settled promises?", a: "To guarantee consistent ordering (no \"sometimes sync, sometimes async\" behaviour — known as releasing Zalgo). Code after `.then()` always runs before the handler." },
      { q: "Implement a timeout for a promise.", a: "`Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(\"timeout\")), ms))])` — and clear the timer / abort the underlying work when possible, since race doesn't cancel `p`." },
      { q: "What does `Promise.resolve(p) === p` return for a native promise `p`?", a: "`true` — `Promise.resolve` returns the same promise if it is already a native promise from the same constructor." },
    ],
    pitfalls: [
      "Forgetting to `return` a promise inside `.then`, which breaks the chain (the next step runs early with `undefined`).",
      "Nesting `.then` calls instead of chaining them (recreating callback hell).",
      "Wrapping an existing promise in `new Promise` (the explicit-construction anti-pattern) and losing rejections.",
      "Missing a final `.catch`, causing unhandled rejections.",
    ],
    glossary: [
      { term: "Pending / fulfilled / rejected", definition: "The three states of a promise; the last two are called *settled*." },
      { term: "Executor", definition: "The function passed to `new Promise`, called immediately with `resolve` and `reject`." },
      { term: "Reaction", definition: "A handler registered via `then`/`catch`/`finally`, run as a microtask after settlement." },
      { term: "Promise chaining", definition: "Each `then` returns a new promise, letting async steps run in sequence." },
    ],
    relatedLessons: ["javascript/promises", "javascript/promise-combinators", "javascript/async-await", "javascript/event-loop", "javascript/callbacks"],
    relatedQuestions: ["js-41", "js-11", "js-07", "js-01"],
    sources: [
      learnerList,
      { label: "MDN — Promise", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise", kind: "docs" },
      { label: "MDN — Using promises", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises", kind: "docs" },
      { label: "ECMAScript — Promise objects", url: "https://tc39.es/ecma262/#sec-promise-objects", kind: "docs" },
      { label: "Node.js CLI — --unhandled-rejections", url: "https://nodejs.org/api/cli.html#--unhandled-rejectionsmode", kind: "docs" },
    ],
  },

  // ───────────────────────────────────────────── 10. == vs ===
  {
    id: "js-10",
    track: "javascript",
    number: 10,
    question: "What is the difference between `==` and `===` in JavaScript?",
    level: "beginner",
    frequency: "very-high",
    tags: ["equality", "coercion", "types"],
    shortAnswer:
      "`===` is **strict equality**: if the types differ the answer is `false`, no conversion happens. `==` is **loose equality**: if the types differ it first coerces them using fixed rules — `null` and `undefined` equal each other and nothing else, booleans become numbers, strings compared with numbers become numbers, and objects are converted to primitives via `valueOf`/`toString`.\n\nThat's why `0 == \"0\"`, `\"\" == 0` and `[] == false` are all true. For objects, both operators compare **references**, not contents. Two special cases apply to both: `NaN` is never equal to itself, and `+0` equals `-0`; `Object.is` handles those differently.\n\nIn practice: use `===` everywhere; the one common idiom for `==` is `x == null` to check for null or undefined at once.",
    deep: [
      { type: "p", text: "**Intuition.** `===` asks \"are these the same type *and* the same value?\". `==` says \"let me try to make them the same type first, then compare\" — and the conversion rules are where the surprises live." },
      { type: "steps", steps: [
        { title: "Same type", detail: "Both operators behave like `===`." },
        { title: "`null` / `undefined`", detail: "`null == undefined` is true; either compared with anything else is false (so `null == 0` is false)." },
        { title: "Number vs string", detail: "The string is converted with `ToNumber` (`\"\"` → 0, `\" 42 \"` → 42, `\"abc\"` → NaN)." },
        { title: "Boolean vs anything", detail: "The boolean becomes a number first (`true` → 1, `false` → 0), then compare again." },
        { title: "Object vs primitive", detail: "The object is converted with `ToPrimitive` (`Symbol.toPrimitive`, then `valueOf`, then `toString`), then compare again." },
        { title: "BigInt", detail: "`1n == 1` is true (mathematical value), `1n === 1` is false (different types)." },
      ] },
      { type: "table", head: ["Comparison", "`==`", "`===`", "`Object.is`"], rows: [
        ["`0` vs `\"0\"`", "true", "false", "false"],
        ["`null` vs `undefined`", "true", "false", "false"],
        ["`NaN` vs `NaN`", "false", "false", "true"],
        ["`0` vs `-0`", "true", "true", "false"],
        ["`[]` vs `false`", "true", "false", "false"],
        ["`{}` vs `{}`", "false", "false", "false"],
      ] },
      { type: "callout", tone: "misconception", title: "`==` is not \"equality ignoring types\"", text: "Loose equality is not transitive: `\"0\" == 0` and `0 == \"\"` are both true, but `\"0\" == \"\"` is false. And `null >= 0` is true while `null == 0` is false, because relational operators use `ToNumber` while `==` has a special null rule." },
      { type: "callout", tone: "spec-vs-impl", title: "Spec names", text: "The algorithms are `IsLooselyEqual` (`==`), `IsStrictlyEqual` (`===`), `SameValue` (`Object.is`) and `SameValueZero` (used by `includes`, `Map`, `Set` — like `SameValue` but `+0` equals `-0`). That's why `[NaN].includes(NaN)` is true but `[NaN].indexOf(NaN)` is -1." },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `console.log(0 == "0", 0 === "0");
console.log(null == undefined, null === undefined);
console.log(null == 0, null >= 0);
console.log("" == 0, "0" == false, [] == false);
console.log(NaN == NaN, Object.is(NaN, NaN));
console.log(0 === -0, Object.is(0, -0));
const a = {};
console.log(a == {}, a === a);`,
      output: `true false
true false
false true
true true true
false true
true false
false true`,
    },
    walkthrough: [
      { title: "`0 == \"0\"`", detail: "Number vs string → `\"0\"` becomes 0 → true. `===` sees different types → false." },
      { title: "`null` rules", detail: "`null == undefined` is special-cased true. `null == 0` is false (null only loosely equals undefined), but `null >= 0` converts null to 0 → true." },
      { title: "`[] == false`", detail: "false → 0; `[]` → ToPrimitive → \"\" → 0; 0 == 0 → true." },
      { title: "NaN and -0", detail: "IEEE-754 says NaN ≠ NaN and +0 = -0; `Object.is` uses SameValue and flips both." },
      { title: "Objects", detail: "Two distinct object literals are different references → false; an object equals itself." },
    ],
    followUps: [
      { q: "When is `==` acceptable?", a: "`value == null` as a concise check for `null` or `undefined` is a widely accepted idiom (many lint configs allow it via `eqeqeq: [\"error\", \"smart\"]`)." },
      { q: "How do you compare two objects by content?", a: "Neither operator does that. Write a deep-equal function (handling cycles, types, key order), use a library (e.g. `util.isDeepStrictEqual` in Node, Lodash `isEqual`), or compare a canonical serialisation for simple data." },
      { q: "How do you check for NaN?", a: "`Number.isNaN(x)` (no coercion) or `Object.is(x, NaN)`. The global `isNaN` coerces first, so `isNaN(\"abc\")` is true." },
      { q: "What does `[1] == 1` give, and why?", a: "true — `[1]` → ToPrimitive → `\"1\"` → ToNumber → 1." },
    ],
    pitfalls: [
      "Assuming `==` is transitive.",
      "Expecting `===` to compare object or array contents.",
      "Using `indexOf` to look for `NaN`.",
      "Checking `if (x == false)` — `[]`, `\"0\"` and `\"\"` all match.",
    ],
    glossary: [
      { term: "Type coercion", definition: "Automatic conversion of a value from one type to another (e.g. string to number)." },
      { term: "ToPrimitive", definition: "The spec operation that turns an object into a primitive via `Symbol.toPrimitive`, `valueOf` or `toString`." },
      { term: "SameValueZero", definition: "Equality used by `includes`, `Map` and `Set`: NaN equals NaN and +0 equals -0." },
      { term: "Reference equality", definition: "Two object values are equal only if they point to the very same object in memory." },
    ],
    relatedLessons: ["javascript/equality-coercion", "javascript/data-types", "javascript/null-vs-undefined"],
    relatedQuestions: ["js-12", "js-13"],
    sources: [
      learnerList,
      { label: "MDN — Equality comparisons and sameness", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness", kind: "docs" },
      { label: "ECMAScript — IsLooselyEqual", url: "https://tc39.es/ecma262/#sec-islooselyequal", kind: "docs" },
    ],
  },

  // ───────────────────────────────────────────── 11. Callbacks vs Promises vs async/await
  {
    id: "js-11",
    track: "javascript",
    number: 11,
    question: "Compare callbacks, Promises and async/await for handling asynchronous code.",
    level: "intermediate",
    frequency: "high",
    tags: ["callbacks", "promises", "async-await", "error-handling", "async"],
    shortAnswer:
      "All three are ways to say \"run this when the result is ready\", and they build on each other.\n\n**Callbacks** pass a function to be called later — Node's convention is `(err, result)`. They're simple but nesting sequential steps creates *callback hell*, errors must be checked manually at every level, and you're trusting the callee to call you exactly once.\n\n**Promises** turn the future result into a value you can return and chain. Errors propagate to one `.catch`, settlement happens once, and combinators like `Promise.all` handle concurrency.\n\n**async/await** is syntax over promises: asynchronous code reads top to bottom, and you use regular `try/catch`, loops and conditionals. It still returns promises, so you mix it with `Promise.all` for parallel work. Callbacks remain right for repeated events like `addEventListener` or streams.",
    deep: [
      { type: "compare", items: [
        { title: "Callbacks", points: ["function passed in, called later", "error-first convention in Node", "nesting for sequences (pyramid of doom)", "no built-in guarantee of single/async invocation", "great for repeated events"] },
        { title: "Promises", points: ["a value representing a future result", "settles once, handlers always async", "flat chaining with `.then`", "errors propagate to `.catch`", "`all`/`allSettled`/`race`/`any`"] },
        { title: "async/await", points: ["syntax over promises", "sequential-looking code", "`try/catch/finally`, loops, early returns", "easy to accidentally serialise work", "returns a promise to callers"] },
      ] },
      { type: "p", text: "**Inversion of control.** With callbacks you hand your continuation to someone else's code; a buggy library might call it twice, never, or synchronously. A promise inverts this back: the callee returns a promise and *you* decide what to attach, and the promise contract ensures one settlement and asynchronous handlers." },
      { type: "callout", tone: "spec-vs-impl", title: "Scheduling", text: "Callbacks run on whatever queue the API uses (a task for `setTimeout`, an I/O phase in Node). Promise reactions and `await` continuations always run as microtasks. So converting an API from callbacks to promises can subtly change ordering relative to other tasks." },
      { type: "list", items: [
        "Bridge callbacks → promises with `util.promisify` (Node) or a manual `new Promise` wrapper.",
        "Bridge promises → callbacks with `p.then(v => cb(null, v), e => cb(e))`.",
        "For streams of values, async iteration (`for await...of`, js-44) generalises async/await.",
        "This question overlaps with js-07 (async/await mechanics) and js-09 (promises); here the focus is choosing between the styles.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `// A fake callback-style API (error-first)
function getUserCb(id, cb) {
  setTimeout(() => (id > 0 ? cb(null, { id, name: "User" + id }) : cb(new Error("bad id"))), 10);
}
// Promise wrapper (what util.promisify does)
const getUser = id =>
  new Promise((resolve, reject) => getUserCb(id, (err, u) => (err ? reject(err) : resolve(u))));

// 1) Callback style
getUserCb(1, (err, user) => {
  if (err) { console.log("callback error:", err.message); return; }
  console.log("1 callback:", user.name);

  // 2) Promise style
  getUser(2)
    .then(u => console.log("2 promise:", u.name))
    .then(main);
});

// 3) async/await style
async function main() {
  try {
    const u = await getUser(3);
    console.log("3 async/await:", u.name);
    await getUser(-1);
  } catch (e) {
    console.log("4 caught:", e.message);
  }
}`,
      output: `1 callback: User1
2 promise: User2
3 async/await: User3
4 caught: bad id`,
    },
    walkthrough: [
      { title: "Callback", detail: "After 10 ms the callback receives `(null, user)`; we must check `err` by hand." },
      { title: "Promise", detail: "`getUser(2)` returns a promise; after 10 ms the first `then` logs, then `main` is called by the next `then`." },
      { title: "async/await", detail: "`await getUser(3)` suspends `main`; it resumes 10 ms later and logs." },
      { title: "Error path", detail: "`getUser(-1)` rejects; the rejection is thrown at the `await` and caught by the ordinary `catch`." },
    ],
    followUps: [
      { q: "What is callback hell and how do you fix it without promises?", a: "Deeply nested callbacks for sequential steps. You can flatten it with named functions and early returns, or libraries like `async`; promises/async-await are the modern fix." },
      { q: "When are callbacks still the right tool?", a: "For events that fire many times (DOM events, `EventEmitter`, stream `data` events), for synchronous HOFs like `map`, and for extremely hot paths where promise allocation matters." },
      { q: "How do you run three independent requests and wait for all with async/await?", a: "`const [a, b, c] = await Promise.all([fa(), fb(), fc()]);` — start them together; consecutive `await`s would run them one after another." },
      { q: "What is \"releasing Zalgo\"?", a: "An API that calls its callback sometimes synchronously and sometimes asynchronously, making ordering unpredictable. Promises prevent this because handlers are always asynchronous." },
    ],
    pitfalls: [
      "Mixing styles inconsistently (e.g. throwing inside a callback, which a surrounding `try/catch` can't catch).",
      "Calling a callback twice (e.g. forgetting `return` after `cb(err)`).",
      "Thinking async/await replaces promises — it uses them.",
    ],
    glossary: [
      { term: "Error-first callback", definition: "Node convention: the first callback argument is an error (or null), the rest are results." },
      { term: "Callback hell", definition: "Hard-to-read code from nesting many asynchronous callbacks." },
      { term: "Inversion of control", definition: "Handing control of when/how your code runs to someone else's code." },
      { term: "Promisify", definition: "Wrap a callback-based function so it returns a promise instead." },
    ],
    relatedLessons: ["javascript/callbacks", "javascript/promises", "javascript/async-await", "javascript/sync-vs-async", "javascript/error-handling"],
    relatedQuestions: ["js-07", "js-09", "js-14", "js-41"],
    sources: [
      learnerList,
      { label: "MDN — Using promises", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises", kind: "docs" },
      { label: "Node.js — util.promisify", url: "https://nodejs.org/api/util.html#utilpromisifyoriginal", kind: "docs" },
      { label: "MDN Glossary — Callback function", url: "https://developer.mozilla.org/en-US/docs/Glossary/Callback_function", kind: "docs" },
    ],
  },

  // ───────────────────────────────────────────── 12. Data types
  {
    id: "js-12",
    track: "javascript",
    number: 12,
    question: "What are the data types in JavaScript?",
    level: "beginner",
    frequency: "high",
    tags: ["data-types", "primitives", "objects", "typeof"],
    shortAnswer:
      "JavaScript has **eight** types: seven primitives — `undefined`, `null`, `boolean`, `number`, `bigint`, `string`, `symbol` — and `object`. Arrays, functions, dates, maps and so on are all objects.\n\nPrimitives are immutable and compared by value; objects are mutable and compared and passed by reference — more precisely, the reference is copied. Calling a method on a primitive, like `\"abc\".toUpperCase()`, works through temporary wrapper objects.\n\nThe usual traps: `typeof null` is `\"object\"` — a historical bug kept for compatibility — `typeof` of a function is `\"function\"` even though functions are objects, and `number` is a 64-bit float, so `0.1 + 0.2 !== 0.3` and integers are only exact up to 2^53 − 1. That's what `bigint` is for.",
    deep: [
      { type: "table", head: ["Type", "`typeof`", "Examples / notes"], rows: [
        ["Undefined", "\"undefined\"", "`undefined` — uninitialised / missing"],
        ["Null", "\"object\" (bug)", "`null` — intentional absence"],
        ["Boolean", "\"boolean\"", "`true`, `false`"],
        ["Number", "\"number\"", "IEEE-754 double: `42`, `3.14`, `NaN`, `Infinity`, `-0`"],
        ["BigInt", "\"bigint\"", "`9007199254740993n` — arbitrary-precision integers (ES2020)"],
        ["String", "\"string\"", "immutable sequence of UTF-16 code units"],
        ["Symbol", "\"symbol\"", "unique identifiers, e.g. `Symbol.iterator` (ES2015)"],
        ["Object", "\"object\" / \"function\"", "plain objects, arrays, functions, Date, Map, Set, RegExp…"],
      ] },
      { type: "viz", id: "js-references", caption: "Primitives are copied by value; objects are shared through references." },
      { type: "callout", tone: "spec-vs-impl", title: "Why `typeof null === \"object\"`", text: "In the first JavaScript implementation, values carried a type tag and objects used tag 0; `null` was the NULL pointer, whose bits also read as tag 0. A later ES proposal to fix it (`typeof null === \"null\"`) was rejected because it broke existing sites. In modern engines representation is different (V8 uses tagged pointers/Smis), but the observable result is frozen by the spec." },
      { type: "list", items: [
        "Use `Array.isArray` for arrays (js-25), `x === null` for null, `typeof x === \"function\"` for callables.",
        "`Number.MAX_SAFE_INTEGER` is 2^53 − 1; beyond that, not every integer is representable.",
        "Mixing `bigint` and `number` in arithmetic throws a TypeError (`1n + 1`); comparisons are allowed.",
        "Strings are UTF-16: `\"😀\".length` is 2. Iterate with `for...of` for code points.",
        "`Object.prototype.toString.call(x)` gives a finer tag like `[object Date]`.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `const values = [42, 9007199254740993n, "hi", true, undefined, null, Symbol("id"), {}, [], function () {}];
console.log(values.map(v => typeof v).join(" "));

console.log(0.1 + 0.2 === 0.3, Number.MAX_SAFE_INTEGER + 2);

const str = "abc";
const upper = str.toUpperCase(); // temporary String wrapper; str is unchanged
console.log(str, upper);

let a = { n: 1 };
let b = a;     // copies the reference
b.n = 2;
console.log(a.n);`,
      output: `number bigint string boolean undefined object symbol object object function
false 9007199254740992
abc ABC
2`,
    },
    walkthrough: [
      { title: "typeof row", detail: "Note `null` → \"object\", array → \"object\", function → \"function\"." },
      { title: "Floating point", detail: "0.1 and 0.2 have no exact binary representation, so their sum is 0.30000000000000004. `MAX_SAFE_INTEGER + 2` should be 9007199254740993 but rounds to the nearest double, 9007199254740992." },
      { title: "Immutable strings", detail: "`toUpperCase` returns a new string; `str` is untouched." },
      { title: "References", detail: "`a` and `b` hold references to the same object, so a write through `b` is visible via `a`." },
    ],
    followUps: [
      { q: "Is JavaScript pass-by-reference?", a: "No — everything is passed by value, but for objects the value *is* a reference (sometimes called call-by-sharing). Reassigning a parameter doesn't affect the caller; mutating the object does." },
      { q: "How do you safely add money values?", a: "Avoid floats for currency: store integer minor units (cents) or use `bigint`/a decimal library, and format with `Intl.NumberFormat`." },
      { q: "What are wrapper objects?", a: "`String`, `Number`, `Boolean`, `Symbol`, `BigInt` objects that primitives are temporarily converted to for property access. `new String(\"a\")` creates a real object — avoid it (`typeof` is \"object\" and it's truthy even when empty)." },
      { q: "Is `NaN` a number?", a: "Yes, `typeof NaN === \"number\"` — it is the IEEE-754 \"not a number\" value produced by invalid numeric operations." },
    ],
    pitfalls: [
      "Using `typeof x === \"object\"` as an object check (it's also true for `null`).",
      "Using `typeof` to detect arrays.",
      "Comparing floats with `===` after arithmetic; compare with a tolerance instead.",
      "Parsing large IDs (e.g. 64-bit database IDs) as numbers — keep them as strings or bigint.",
    ],
    glossary: [
      { term: "Primitive", definition: "A non-object value with no methods of its own; immutable." },
      { term: "IEEE-754 double", definition: "The 64-bit binary floating-point format used by JavaScript numbers." },
      { term: "Safe integer", definition: "An integer that can be represented exactly and compared correctly: between −(2^53 − 1) and 2^53 − 1." },
      { term: "Wrapper object", definition: "A temporary object created around a primitive so its methods can be called." },
    ],
    relatedLessons: ["javascript/data-types", "javascript/equality-coercion", "javascript/null-vs-undefined", "javascript/symbols", "javascript/deep-copy"],
    relatedQuestions: ["js-13", "js-10", "js-25", "js-30"],
    sources: [
      learnerList,
      { label: "MDN — JavaScript data types and data structures", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures", kind: "docs" },
      { label: "MDN — typeof (including typeof null)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof", kind: "docs" },
      { label: "ECMAScript — ECMAScript language types", url: "https://tc39.es/ecma262/#sec-ecmascript-language-types", kind: "docs" },
    ],
  },
  // ───────────────────────────────────────────── 13. null vs undefined
  {
    id: "js-13",
    track: "javascript",
    number: 13,
    question: "What is the difference between `null` and `undefined`?",
    level: "beginner",
    frequency: "high",
    tags: ["null", "undefined", "data-types", "nullish"],
    shortAnswer:
      "Both mean \"no value\", but they come from different places. `undefined` is what the **language** gives you when something hasn't been set: an uninitialised variable, a missing property, a missing argument, a function with no `return`. `null` is a value **you** assign on purpose to say \"intentionally empty\".\n\nThey're different types: `typeof undefined` is `\"undefined\"`, while `typeof null` is `\"object\"`, which is a historical bug. `null == undefined` is true but `null === undefined` is false. They convert differently too: `Number(null)` is 0, `Number(undefined)` is NaN. Default parameters kick in only for `undefined`, JSON keeps `null` but drops `undefined` properties, and `??` and `?.` treat both as nullish.",
    deep: [
      { type: "table", head: ["Aspect", "`undefined`", "`null`"], rows: [
        ["Meaning", "not assigned / missing", "deliberately empty"],
        ["Who produces it", "the engine (and you, rarely)", "you or APIs (e.g. `document.getElementById` miss)"],
        ["`typeof`", "\"undefined\"", "\"object\" (legacy bug)"],
        ["`Number(x)`", "NaN", "0"],
        ["Default parameters", "trigger the default", "do not trigger"],
        ["`JSON.stringify({ k: x })`", "property omitted (in arrays → `null`)", "`{\"k\":null}`"],
        ["`??`, `?.`, `== null`", "nullish", "nullish"],
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Is `undefined` a keyword?", text: "`null` is a literal keyword. `undefined` is a non-writable, non-configurable property of the global object (since ES5). Inside a function you can still *shadow* it with a local variable called `undefined` — legal but terrible. `void 0` always yields the real `undefined`, which is why minifiers use it." },
      { type: "list", items: [
        "`null` is the end of every prototype chain: `Object.getPrototypeOf(Object.prototype) === null`.",
        "A missing property and a property explicitly set to `undefined` differ for `in`, `Object.keys` and `hasOwn`.",
        "`??` only falls back on null/undefined, whereas `||` also falls back on `0`, `\"\"`, `false` and `NaN`.",
        "Arrays with holes (`[1, , 3]`) report `undefined` for the hole, but the index doesn't exist (`1 in arr` is false).",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `let declared;
const obj = { a: null };
function f(x) { return x; }
console.log(declared, obj.b, f(), (() => {})());

console.log(typeof null, typeof undefined);
console.log(null == undefined, null === undefined);
console.log(Number(null), Number(undefined));

function greet(name = "guest") { return "hi " + name; }
console.log(greet(undefined), greet(null));

console.log(obj.a ?? "default", obj.a || "fallback", 0 ?? "default");
console.log(JSON.stringify({ a: undefined, b: null }));`,
      output: `undefined undefined undefined undefined
object undefined
true false
0 NaN
hi guest hi null
default fallback 0
{"b":null}`,
    },
    walkthrough: [
      { title: "Sources of undefined", detail: "Uninitialised `let`, missing property `obj.b`, missing argument, and a function without `return` all give `undefined`." },
      { title: "typeof", detail: "`null` reports \"object\" due to the historical bug." },
      { title: "Equality", detail: "Loose equality special-cases null/undefined as equal; strict does not." },
      { title: "Numeric conversion", detail: "null → 0, undefined → NaN." },
      { title: "Defaults", detail: "`greet(undefined)` uses the default; `greet(null)` passes `null` through and concatenates \"null\"." },
      { title: "Nullish operators", detail: "`??` falls back for `null`; `||` too; `0 ?? \"default\"` keeps 0 because 0 isn't nullish." },
      { title: "JSON", detail: "The `undefined` property is dropped; `null` is kept." },
    ],
    followUps: [
      { q: "How do you check for \"null or undefined\" in one go?", a: "`x == null`, or `x === null || x === undefined`, or use `??` / `?.` directly where the goal is a fallback or safe access." },
      { q: "Should APIs return null or undefined for \"not found\"?", a: "Pick one consistently. A common convention: `undefined` for \"not set/absent\" (like a missing optional field) and `null` for an explicit, meaningful empty value (like a database NULL or a cleared field)." },
      { q: "Why does TypeScript distinguish `x?: T` from `x: T | undefined`?", a: "Optional means the property may be absent; `| undefined` means it's present but may hold undefined. With `exactOptionalPropertyTypes` TS enforces the difference, mirroring the `in`/`hasOwn` behaviour." },
      { q: "What does `typeof undeclaredVar` return?", a: "\"undefined\", without throwing — unless the name is a `let`/`const` in its TDZ, which throws a ReferenceError." },
    ],
    pitfalls: [
      "Using `typeof x === \"object\"` and forgetting null.",
      "Using `||` for defaults when `0` or `\"\"` are valid values.",
      "Expecting default parameters to replace `null`.",
      "Sending `undefined` fields in JSON and expecting the server to receive them.",
    ],
    glossary: [
      { term: "Nullish", definition: "Either `null` or `undefined`." },
      { term: "Nullish coalescing (`??`)", definition: "Returns the right side only if the left side is null or undefined." },
      { term: "Optional chaining (`?.`)", definition: "Stops and returns undefined if the value before it is nullish, instead of throwing." },
      { term: "`void 0`", definition: "An expression that always evaluates to `undefined`." },
    ],
    relatedLessons: ["javascript/null-vs-undefined", "javascript/data-types", "javascript/equality-coercion"],
    relatedQuestions: ["js-12", "js-10"],
    sources: [
      learnerList,
      { label: "MDN — null", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null", kind: "docs" },
      { label: "MDN — undefined", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined", kind: "docs" },
      { label: "MDN — Nullish coalescing operator (??)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing", kind: "docs" },
    ],
  },

  // ───────────────────────────────────────────── 14. Sync vs async
  {
    id: "js-14",
    track: "javascript",
    number: 14,
    question: "What is the difference between synchronous and asynchronous programming in JavaScript?",
    level: "beginner",
    frequency: "high",
    tags: ["sync-vs-async", "event-loop", "blocking", "concurrency"],
    shortAnswer:
      "Synchronous code runs line by line, and each statement must finish before the next starts. If one step is slow — a big loop, or synchronous file reads with `fs.readFileSync` — it **blocks** the single JavaScript thread, so nothing else can run: no clicks, no rendering, no other requests in a Node server.\n\nAsynchronous code starts an operation, such as a timer, network request or file read, hands the waiting to the host environment, and continues immediately. The result comes back later through a callback, a promise or `await`, scheduled by the event loop once the call stack is free.\n\nSo JavaScript gets **concurrency without parallelism** on one thread: lots of I/O can be in flight at once, but your callbacks still run one at a time. Asynchrony doesn't help CPU-heavy work; for that you need workers.",
    deep: [
      { type: "p", text: "**Intuition.** Synchronous is standing at the counter until your coffee is made. Asynchronous is taking a buzzer and sitting down; the barista keeps serving others and the buzzer (callback) calls you back." },
      { type: "compare", items: [
        { title: "Synchronous", points: ["runs to completion in order", "result available on the next line", "simple control flow and stack traces", "blocks the thread while it runs", "fine for fast, CPU-bound steps"] },
        { title: "Asynchronous", points: ["starts work, continues immediately", "result delivered later (callback/promise/await)", "lets I/O overlap", "ordering decided by the event loop", "needs explicit error propagation"] },
      ] },
      { type: "viz", id: "js-event-loop", caption: "The event loop runs async continuations only once the stack is empty." },
      { type: "callout", tone: "misconception", title: "Async ≠ parallel ≠ background thread", text: "Wrapping CPU-heavy code in a promise or async function does **not** move it off the main thread — the executor and any code after `await` still run on it. Use Web Workers / Node `worker_threads` for parallel CPU work." },
      { type: "callout", tone: "spec-vs-impl", title: "Who actually waits", text: "In browsers, networking and timers are handled by browser threads/processes. In Node, network I/O uses OS readiness APIs (epoll/kqueue/IOCP) via libuv, while file system operations, DNS `lookup`, some crypto and zlib run on the libuv thread pool (default 4 threads, `UV_THREADPOOL_SIZE`)." },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `function blockFor(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {} // synchronous busy-wait: blocks everything
}

console.log("1 start");
setTimeout(() => console.log("4 timer fired (asked for 0 ms)"), 0);
blockFor(50);
console.log("2 after 50 ms of blocking work");
Promise.resolve().then(() => console.log("3 microtask"));`,
      output: `1 start
2 after 50 ms of blocking work
3 microtask
4 timer fired (asked for 0 ms)`,
    },
    walkthrough: [
      { title: "Schedule timer", detail: "The 0 ms timer expires almost immediately, but its callback can only run once the stack is empty." },
      { title: "Block", detail: "The busy loop holds the thread for 50 ms. The timer is ready and waiting — it can't interrupt." },
      { title: "Finish sync code", detail: "\"2\" prints and a microtask is queued." },
      { title: "Microtasks first", detail: "Once the script task ends, the microtask runs: \"3\"." },
      { title: "Then the timer task", detail: "Finally \"4\" — at least 50 ms late. In a browser, a click during those 50 ms would also have waited." },
    ],
    followUps: [
      { q: "Why is `readFileSync` acceptable at startup but not in a request handler?", a: "At startup nothing else needs to run yet. In a request handler, it blocks the event loop and stalls every other concurrent request on that process." },
      { q: "Concurrency vs parallelism?", a: "Concurrency is dealing with many things in overlapping time periods (interleaving); parallelism is literally executing at the same instant on multiple cores. JS on one thread is concurrent, not parallel." },
      { q: "How do you keep a UI responsive during heavy computation?", a: "Move it to a Web Worker, or chunk it and yield back to the event loop with tasks between chunks." },
      { q: "Is `Array.prototype.forEach` asynchronous?", a: "No. Callbacks to `forEach`, `map`, etc. are called synchronously, which is why `async` callbacks inside them aren't awaited." },
    ],
    pitfalls: [
      "Believing promises make CPU work non-blocking.",
      "Expecting a value from an async call on the next line without awaiting it.",
      "Using sync APIs (`*Sync` in Node, synchronous XHR) on hot paths.",
    ],
    glossary: [
      { term: "Blocking", definition: "Code that holds the thread so nothing else can run until it finishes." },
      { term: "Non-blocking I/O", definition: "Starting an I/O operation and being notified when it completes, instead of waiting." },
      { term: "Concurrency", definition: "Making progress on several tasks by interleaving them." },
      { term: "Parallelism", definition: "Running several computations at the same moment on different cores." },
      { term: "libuv", definition: "The C library behind Node's event loop, async I/O and thread pool." },
    ],
    relatedLessons: ["javascript/sync-vs-async", "javascript/event-loop", "javascript/callbacks", "javascript/promises", "nodejs/node-architecture", "nodejs/worker-threads"],
    relatedQuestions: ["js-01", "js-11", "js-07"],
    sources: [
      learnerList,
      { label: "MDN — Introducing asynchronous JavaScript", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Introducing", kind: "docs" },
      { label: "Node.js — Overview of blocking vs non-blocking", url: "https://nodejs.org/en/learn/asynchronous-work/overview-of-blocking-vs-non-blocking", kind: "docs" },
      { label: "Node.js — Don't block the event loop", url: "https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop", kind: "docs" },
    ],
  },

  // ───────────────────────────────────────────── 15. map, filter, reduce
  {
    id: "js-15",
    track: "javascript",
    number: 15,
    question: "Explain `map`, `filter` and `reduce` with examples.",
    level: "beginner",
    frequency: "high",
    tags: ["map-filter-reduce", "arrays", "higher-order-functions", "functional-programming"],
    shortAnswer:
      "They're array methods that take a callback, and none of them mutate the original array.\n\n`map` transforms every element and returns a new array of the **same length**. `filter` keeps the elements for which the callback returns a truthy value, so the new array is the same length or shorter. `reduce` folds the whole array into **one value** — a sum, an object, a lookup map — by calling `(accumulator, element) => newAccumulator` and carrying the accumulator forward.\n\nCallbacks receive `(element, index, array)`, which is why `[\"1\",\"2\"].map(parseInt)` misbehaves. Always pass an initial value to `reduce`: without one it starts from the first element, and on an empty array it throws a TypeError.",
    deep: [
      { type: "table", head: ["Method", "Callback returns", "Result", "Typical use"], rows: [
        ["`map`", "new element", "array, same length", "transform/project fields"],
        ["`filter`", "truthy/falsy", "array, ≤ length", "select items"],
        ["`reduce`", "next accumulator", "any single value", "sum, group, index, flatten"],
      ] },
      { type: "steps", steps: [
        { title: "Length is captured up front", detail: "These methods read `length` once at the start; elements appended during iteration aren't visited." },
        { title: "Holes are skipped", detail: "For sparse arrays the callback isn't called for missing indices (`map` preserves the holes)." },
        { title: "`reduce` without initial value", detail: "Uses element 0 as the accumulator and starts at index 1; an empty array throws `TypeError: Reduce of empty array with no initial value`." },
        { title: "Copies are shallow", detail: "`map` creates a new array, but objects inside are the same references unless you create new ones." },
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Performance", text: "Chaining `filter().map()` creates intermediate arrays and walks the data twice. For typical UI-sized data this is irrelevant; for very large arrays in hot paths a single `for` loop or a single `reduce` can be faster and allocate less. Measure before optimising." },
      { type: "list", items: [
        "Related methods: `flatMap`, `find`, `some`/`every` (short-circuit), `forEach` (no return value), `Object.groupBy` (ES2024) for grouping.",
        "Non-mutating copies of mutating methods: `toSorted`, `toReversed`, `toSpliced`, `with` (ES2023).",
        "These are higher-order functions — see js-08.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `const orders = [
  { id: 1, amount: 120, status: "paid" },
  { id: 2, amount: 80, status: "refunded" },
  { id: 3, amount: 45, status: "paid" },
];

const paid = orders.filter(o => o.status === "paid");
const amounts = paid.map(o => o.amount);
const total = amounts.reduce((sum, a) => sum + a, 0);
console.log(paid.map(o => o.id).join(","), amounts.join(","), total);

const byStatus = orders.reduce((acc, o) => {
  (acc[o.status] ??= []).push(o.id);
  return acc;
}, {});
console.log(JSON.stringify(byStatus));

console.log(["1", "2", "3"].map(parseInt).join(","));
try { [].reduce((a, b) => a + b); } catch (e) { console.log(e.name); }`,
      output: `1,3 120,45 165
{"paid":[1,3],"refunded":[2]}
1,NaN,NaN
TypeError`,
    },
    walkthrough: [
      { title: "filter", detail: "Keeps orders 1 and 3." },
      { title: "map", detail: "Projects their amounts: [120, 45]." },
      { title: "reduce (sum)", detail: "acc: 0 → 120 → 165." },
      { title: "reduce (group)", detail: "Starts with `{}`; `??=` creates each status array on first sight, then pushes ids." },
      { title: "`map(parseInt)`", detail: "Calls `parseInt(\"1\", 0)` → 1 (radix 0 means default), `parseInt(\"2\", 1)` → NaN (invalid radix), `parseInt(\"3\", 2)` → NaN (3 isn't a binary digit)." },
      { title: "Empty reduce", detail: "No initial value and no elements → TypeError." },
    ],
    followUps: [
      { q: "Implement `map` using `reduce`.", a: "`const map = (arr, fn) => arr.reduce((acc, x, i) => { acc.push(fn(x, i, arr)); return acc; }, []);`" },
      { q: "Write a polyfill for `Array.prototype.map`.", a: "Loop `i` from 0 to the length captured at the start; for each index that exists (`i in this`), set `result[i] = fn.call(thisArg, this[i], i, this)`; return `result` created with the same length. Check that `fn` is callable and throw a TypeError otherwise." },
      { q: "When should you use `forEach` instead of `map`?", a: "When you only want side effects and don't need a new array. Using `map` and ignoring the result is a code smell." },
      { q: "How do you stop a `reduce` early?", a: "You can't break out of it; use a `for...of` loop with `break`, or `some`/`every`/`find` which short-circuit." },
    ],
    pitfalls: [
      "Forgetting `return` in a multi-line arrow callback (`map` yields `undefined`s).",
      "Omitting `reduce`'s initial value.",
      "Mutating the accumulator *and* objects from the source array unintentionally.",
      "Using `async` callbacks with `map` and forgetting `Promise.all`.",
    ],
    glossary: [
      { term: "Accumulator", definition: "The running value `reduce` carries from one callback call to the next." },
      { term: "Sparse array", definition: "An array with missing indices (holes), e.g. `[1, , 3]`." },
      { term: "Immutable operation", definition: "One that returns a new value instead of changing the original." },
    ],
    relatedLessons: ["javascript/map-filter-reduce", "javascript/higher-order-functions"],
    relatedQuestions: ["js-08"],
    sources: [
      learnerList,
      { label: "MDN — Array.prototype.map()", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map", kind: "docs" },
      { label: "MDN — Array.prototype.filter()", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter", kind: "docs" },
      { label: "MDN — Array.prototype.reduce()", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce", kind: "docs" },
    ],
  },

  // ───────────────────────────────────────────── 16. Arrow functions
  {
    id: "js-16",
    track: "javascript",
    number: 16,
    question: "What are arrow functions and how do they differ from regular functions?",
    level: "beginner",
    frequency: "high",
    tags: ["arrow-functions", "this", "functions", "es6"],
    shortAnswer:
      "Arrow functions are a shorter function syntax from ES2015 — `(a, b) => a + b`, with an implicit return when the body is an expression — but the important differences are semantic.\n\nThey have **no own `this`**: they use the `this` of the enclosing scope, and `call`, `apply` and `bind` can't change it. They also have no own `arguments` (use rest parameters), no `prototype`, and **can't be used as constructors**, so `new` throws a TypeError. They can't be generators either.\n\nThat makes them ideal for callbacks inside methods, like `setTimeout(() => this.tick())`, and a poor choice for object methods, prototype methods, or event handlers that need `this` to be the element.",
    deep: [
      { type: "table", head: ["Feature", "Regular function", "Arrow function"], rows: [
        ["`this`", "set by the call (dynamic)", "lexical — from the surrounding scope"],
        ["`arguments`", "own `arguments` object", "none (refers to outer one, if any)"],
        ["`new`", "allowed (for function declarations/expressions)", "TypeError — not a constructor"],
        ["`prototype` property", "yes", "no"],
        ["`super`, `new.target`", "own", "lexical"],
        ["Generator (`function*`)", "possible", "not possible"],
        ["Duplicate parameter names", "allowed in sloppy mode", "always a SyntaxError"],
      ] },
      { type: "viz", id: "js-this", caption: "Compare how a regular function and an arrow pick up `this`." },
      { type: "callout", tone: "spec-vs-impl", title: "Spec detail", text: "Arrow functions have `[[ThisMode]]: lexical`, so their function environment has no `this` binding; lookups of `this` walk outward like any variable. They also lack a `[[Construct]]` internal method, which is what makes `new` fail." },
      { type: "list", items: [
        "Object literal returns need parentheses: `() => ({ ok: true })`; `() => { ok: true }` is a block with a label and returns `undefined`.",
        "Line terminator rule: the `=>` must be on the same line as the parameters.",
        "Class field arrows (`handle = () => {}`) create one function per instance — convenient binding, but not on the prototype.",
        "js-29 covers the arrow-function `this` behaviour in more depth; this question covers all differences.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `const timer = {
  seconds: 0,
  tick3() {
    [1, 2, 3].forEach(() => { this.seconds++; }); // arrow: this === timer
    return this.seconds;
  },
};
console.log(timer.tick3());

const arrow = () => {};
console.log(typeof arrow.prototype);
try { new arrow(); } catch (e) { console.log(e.name); }

function regular() { return arguments.length; }
const arrowArgs = (...args) => args.length;
console.log(regular(1, 2, 3), arrowArgs(1, 2, 3));

const makeObj = () => ({ ok: true });
const oops = () => { ok: true }; // block with a label, not an object
console.log(makeObj().ok, oops());`,
      output: `3
undefined
TypeError
3 3
true undefined`,
    },
    walkthrough: [
      { title: "Lexical this", detail: "Inside `tick3`, `this` is `timer`; the arrow callbacks reuse it, so `seconds` reaches 3. A regular `function` callback would get `undefined`/global `this`." },
      { title: "No prototype", detail: "`arrow.prototype` doesn't exist → \"undefined\"." },
      { title: "Not a constructor", detail: "`new arrow()` throws TypeError." },
      { title: "Arguments", detail: "Regular functions have `arguments`; arrows use rest parameters instead." },
      { title: "Object literal trap", detail: "Without parentheses, the braces are a function body; `ok:` is a label, so it returns `undefined`." },
    ],
    followUps: [
      { q: "Can you bind an arrow function?", a: "`bind` returns a new function and can pre-fill arguments, but the `this` argument is ignored — the arrow keeps its lexical `this`." },
      { q: "Why not use arrows as object methods?", a: "`const o = { name: \"x\", f: () => this.name }` — the arrow's `this` comes from the scope around the object literal (module/global), not from `o`." },
      { q: "Are arrow functions faster?", a: "Not in any meaningful general sense. Choose them for semantics and readability." },
      { q: "Do arrow functions have a `name`?", a: "Yes, inferred from the variable or property they're assigned to (`const add = () => {}` → `add.name === \"add\"`)." },
    ],
    pitfalls: [
      "Using an arrow for a method that relies on `this`.",
      "Using an arrow in `addEventListener` when you need `this === event.currentTarget` (use the event parameter instead).",
      "Returning an object literal without parentheses.",
      "Expecting `arguments` inside an arrow.",
    ],
    glossary: [
      { term: "Lexical this", definition: "`this` taken from the surrounding code where the function was written, not from how it's called." },
      { term: "Implicit return", definition: "With an expression body (`x => x * 2`) the expression's value is returned automatically." },
      { term: "Rest parameters", definition: "`(...args)` collects remaining arguments into a real array." },
      { term: "Constructor", definition: "A function callable with `new` to create objects; arrows are not constructors." },
    ],
    relatedLessons: ["javascript/arrow-functions", "javascript/this-binding", "javascript/call-apply-bind"],
    relatedQuestions: ["js-29", "js-03", "js-23"],
    sources: [
      learnerList,
      { label: "MDN — Arrow function expressions", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions", kind: "docs" },
      { label: "ECMAScript — Arrow function definitions", url: "https://tc39.es/ecma262/#sec-arrow-function-definitions", kind: "docs" },
    ],
  },
  // ───────────────────────────────────────────── 17. Modules
  {
    id: "js-17",
    track: "javascript",
    number: 17,
    question: "What are JavaScript modules and why do we use them?",
    level: "intermediate",
    frequency: "high",
    tags: ["modules", "esm", "commonjs", "scope", "bundling"],
    shortAnswer:
      "A module is a file with its **own scope** that explicitly exports what it wants to share and imports what it needs. This replaced the old approach of script tags sharing one global namespace, giving us encapsulation, explicit dependencies, and code that tools can analyse.\n\nThe standard system is **ES modules** — `import` and `export`. They're static, so imports and exports are known before any code runs, which enables tree-shaking. Imports are **live read-only bindings** rather than copies. Modules are evaluated once and cached, run in strict mode, have top-level `this` of `undefined`, can use top-level `await`, and load asynchronously; `import()` loads one on demand.\n\nNode also has the older **CommonJS** format — `require` and `module.exports` — which is synchronous and copies values at the time of the `require`.",
    deep: [
      { type: "compare", items: [
        { title: "ES modules (ESM)", points: ["`import` / `export` syntax, static structure", "live bindings to exports", "async loading; supports top-level await", "always strict; `this` is `undefined` at top level", "browsers: `<script type=\"module\">`; Node: `.mjs` or `\"type\": \"module\"`"] },
        { title: "CommonJS (CJS)", points: ["`require()` / `module.exports`", "`require` returns the exports object at that moment (values copied out when destructured)", "synchronous loading", "wrapped in a function: `exports, require, module, __filename, __dirname`", "Node's original format"] },
      ] },
      { type: "steps", steps: [
        { title: "Construction (parse)", detail: "The loader fetches and parses each module, discovering `import` statements to build the module graph — no code runs yet." },
        { title: "Linking (instantiate)", detail: "Exports and imports are wired together as bindings. Imported names point at the exporting module's variables." },
        { title: "Evaluation", detail: "Modules execute once, dependencies first (post-order). The result is cached in the module map; importing again returns the same instance." },
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Spec vs host", text: "ECMAScript defines module syntax, linking and evaluation (Cyclic Module Records). *How* a specifier like `\"./math.js\"` or `\"react\"` is resolved and fetched is host-defined: the HTML standard (URLs, import maps) for browsers, Node's resolution algorithm (`package.json` `exports`, file extensions required for relative ESM imports) for Node." },
      { type: "list", items: [
        "Circular imports are allowed; a module may observe another's binding in the TDZ if it's accessed before that module has evaluated.",
        "Dynamic `import()` returns a promise and works in both ESM and CJS — the basis for code splitting.",
        "Since Node 22.12 / 20.19, `require()` of synchronous ES modules (no top-level await) is supported by default.",
        "js-40 focuses on the details of `import`/`export` syntax (named vs default, re-exports); this question is the bigger picture.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      caption: "Three files shown together; run as ES modules (e.g. Node with .mjs files or a browser with type=module).",
      code: `// math.js
export const PI = 3.14159;
export function area(r) { return PI * r * r; }
export default function describe() { return "math utils"; }

// counter.js
export let count = 0;
export function increment() { count++; }

// main.js
import describe, { area } from "./math.js";
import { count, increment } from "./counter.js";
import * as math from "./math.js";

console.log(describe(), area(1));
console.log(count);
increment();
console.log(count);          // live binding: sees the update
console.log(typeof math.area);
// count = 5;                // TypeError: imported bindings are read-only

const { PI } = await import("./math.js"); // dynamic import + top-level await
console.log(PI);`,
      output: `math utils 3.14159
0
1
function
3.14159`,
    },
    walkthrough: [
      { title: "Graph construction", detail: "`main.js` is parsed; its static imports reveal `math.js` and `counter.js`, which are fetched and parsed." },
      { title: "Linking", detail: "`describe`, `area`, `count`, `increment` and the `math` namespace object are bound to the exporting modules' variables." },
      { title: "Evaluate dependencies", detail: "`math.js` and `counter.js` run first (once each)." },
      { title: "Live binding", detail: "`increment()` changes `count` inside `counter.js`; `main.js` reads 1 because its `count` is a view onto that variable, not a copy." },
      { title: "Dynamic import", detail: "`import(\"./math.js\")` returns the already-evaluated cached module, so `PI` is the same value." },
    ],
    followUps: [
      { q: "Why does tree-shaking need ES modules?", a: "Because `import`/`export` are static declarations, bundlers can determine which exports are used without running the code. `require` can be dynamic (`require(name)`), so usage can't be proven statically." },
      { q: "Named vs default exports — which do you prefer?", a: "Named exports give consistent names across the codebase, better auto-imports and refactoring; default exports are convenient for a module's single main thing. Many teams prefer named exports." },
      { q: "What happens with circular dependencies?", a: "ESM links bindings first, so cycles don't crash by themselves, but accessing a `let`/`const`/`class` export before its module has evaluated throws a TDZ ReferenceError. In CJS you get a partially filled `module.exports`." },
      { q: "How do browsers load module scripts?", a: "`<script type=\"module\">` is deferred by default (runs after parsing, in order), can be `async`, is fetched with CORS, and runs once per URL even if included twice." },
    ],
    pitfalls: [
      "Omitting file extensions in Node ESM relative imports (`./math` fails; `./math.js` works).",
      "Mixing `require` and `import` in one file without understanding the interop rules.",
      "Expecting `__dirname` in ESM (use `import.meta.dirname` in recent Node, or `import.meta.url`).",
      "Assuming imports are copies and can be reassigned.",
    ],
    glossary: [
      { term: "ES module (ESM)", definition: "The standard JavaScript module format using `import`/`export`." },
      { term: "CommonJS (CJS)", definition: "Node's original module format using `require` and `module.exports`." },
      { term: "Live binding", definition: "An imported name that always reflects the current value of the exporting module's variable." },
      { term: "Tree-shaking", definition: "Removing unused exports from a bundle by static analysis." },
      { term: "Module specifier", definition: "The string after `from`, such as `\"./math.js\"` or `\"react\"`." },
    ],
    relatedLessons: ["javascript/modules", "javascript/script-loading", "javascript/hoisting-tdz"],
    relatedQuestions: ["js-40", "js-48"],
    sources: [
      learnerList,
      { label: "MDN — JavaScript modules", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules", kind: "docs" },
      { label: "Node.js — ECMAScript modules", url: "https://nodejs.org/api/esm.html", kind: "docs" },
      { label: "Node.js — Modules: CommonJS modules", url: "https://nodejs.org/api/modules.html", kind: "docs" },
      { label: "ECMAScript — Modules", url: "https://tc39.es/ecma262/#sec-modules", kind: "docs" },
    ],
  },

  // ───────────────────────────────────────────── 18. Deep copying
  {
    id: "js-18",
    track: "javascript",
    number: 18,
    question: "How do you deep copy an object in JavaScript?",
    level: "intermediate",
    frequency: "high",
    tags: ["deep-copy", "structuredClone", "json", "references"],
    shortAnswer:
      "First, the distinction. A **shallow** copy — spread `{...obj}`, `Object.assign`, or `arr.slice()` — creates a new top-level container, but nested objects are still shared. A **deep** copy recursively duplicates everything, so no references are shared.\n\nThe modern built-in is `structuredClone(obj)`. It handles nested objects, arrays, `Date`, `Map`, `Set`, `RegExp`, typed arrays and even circular references. But it **can't clone functions or DOM nodes** (it throws `DataCloneError`), and it drops class prototypes — you get plain objects back — along with getters, setters and symbol keys.\n\nThe old `JSON.parse(JSON.stringify(obj))` trick is lossier: it drops `undefined` and functions, turns dates into strings, `NaN` and `Infinity` into `null`, loses `Map` and `Set`, and throws on cycles and BigInt. For full control — class instances, custom types — write a recursive clone with a `WeakMap` to track cycles, or use a library.",
    deep: [
      { type: "viz", id: "js-references", caption: "Shallow copy: new outer box, shared inner boxes. Deep copy: everything duplicated." },
      { type: "table", head: ["Technique", "Depth", "Dates / Map / Set", "Cycles", "Functions / class instances"], rows: [
        ["`{...o}` / `Object.assign`", "shallow", "shared refs", "n/a", "copied by reference / own enumerable props only"],
        ["`JSON.parse(JSON.stringify(o))`", "deep", "Date → string; Map/Set → `{}`", "throws TypeError", "functions dropped; prototype lost"],
        ["`structuredClone(o)`", "deep", "preserved", "preserved", "functions throw `DataCloneError`; prototype lost"],
        ["custom recursive clone", "deep", "your choice", "with a `WeakMap`", "your choice"],
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Where structuredClone comes from", text: "`structuredClone` is a host API defined by the HTML Standard (the same structured clone algorithm used by `postMessage` and IndexedDB), not ECMAScript. It is available in modern browsers, Web Workers, Node 17+, Deno and Bun." },
      { type: "list", items: [
        "Structured clone also copies `Error` objects (name/message), `ArrayBuffer`s (or transfers them with the `transfer` option), `Blob`, `File` and `ImageData`.",
        "Property descriptors aren't preserved: getters are invoked and their values copied; non-enumerable props are skipped.",
        "Deep copying is O(size of the graph) — for big state trees consider immutable updates (copy only the changed path) instead.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `const original = { name: "Ada", tags: ["math"], born: new Date(0), meta: { n: 1 } };

const shallow = { ...original };
shallow.tags.push("code");                  // shared nested array!
console.log(original.tags.join(","));

const viaJson = JSON.parse(JSON.stringify(original));
console.log(typeof viaJson.born, viaJson.born);

const deep = structuredClone(original);
deep.meta.n = 99;
console.log(original.meta.n, deep.born instanceof Date);

const cyclic = { name: "loop" };
cyclic.self = cyclic;
const cyclicCopy = structuredClone(cyclic);
console.log(cyclicCopy.self === cyclicCopy, cyclicCopy !== cyclic);

try { structuredClone({ fn() {} }); } catch (e) { console.log(e.name); }`,
      output: `math,code
string 1970-01-01T00:00:00.000Z
1 true
true true
DataCloneError`,
    },
    walkthrough: [
      { title: "Shallow copy", detail: "Spread copies the `tags` reference, so pushing through `shallow` mutates `original.tags`." },
      { title: "JSON round-trip", detail: "`Date#toJSON` produces an ISO string; parsing doesn't turn it back into a Date." },
      { title: "structuredClone", detail: "`meta` is a fresh object (original stays 1) and `born` is still a real Date." },
      { title: "Cycles", detail: "The clone's `self` points to the clone, not the original — the algorithm remembers objects it already copied." },
      { title: "Functions", detail: "Functions aren't cloneable → `DataCloneError` (a `DOMException`)." },
    ],
    followUps: [
      { q: "Write a basic deep clone that handles cycles.", a: "`function clone(v, seen = new WeakMap()) { if (v === null || typeof v !== \"object\") return v; if (seen.has(v)) return seen.get(v); const out = Array.isArray(v) ? [] : Object.create(Object.getPrototypeOf(v)); seen.set(v, out); for (const k of Reflect.ownKeys(v)) out[k] = clone(v[k], seen); return out; }` — then add special cases for Date, Map, Set, RegExp as needed." },
      { q: "Why does React/Redux prefer immutable updates over deep copies?", a: "Copying only the changed path (`{...state, user: {...state.user, name}}`) is cheaper and keeps unchanged subtrees referentially equal, which enables cheap `===` change detection." },
      { q: "Does `Object.freeze` help?", a: "It prevents mutation of the top level (shallowly) but doesn't copy anything; deep-freezing requires recursion." },
      { q: "How does `JSON.stringify` handle circular references?", a: "It throws a TypeError. You can break cycles with a replacer that tracks seen objects (js-52 covers this)." },
    ],
    pitfalls: [
      "Calling spread or `Object.assign` a \"clone\" when nested data is shared.",
      "Using JSON round-tripping on data with dates, `undefined`, `Map`/`Set` or BigInt.",
      "Expecting `structuredClone` to preserve class instances and methods.",
    ],
    glossary: [
      { term: "Shallow copy", definition: "A new outer object whose nested objects are still shared with the original." },
      { term: "Deep copy", definition: "A fully independent copy where every nested object is duplicated." },
      { term: "Structured clone algorithm", definition: "The browser/host algorithm for copying values between contexts (postMessage, IndexedDB, `structuredClone`)." },
      { term: "Circular reference", definition: "An object that refers back to itself directly or through other objects." },
    ],
    relatedLessons: ["javascript/deep-copy", "javascript/json-circular", "javascript/data-types", "javascript/freeze-seal"],
    relatedQuestions: ["js-52", "js-35", "js-12"],
    sources: [
      learnerList,
      { label: "MDN — structuredClone()", url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone", kind: "docs" },
      { label: "MDN — The structured clone algorithm", url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm", kind: "docs" },
      { label: "MDN Glossary — Deep copy", url: "https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy", kind: "docs" },
      { label: "MDN — JSON.stringify()", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify", kind: "docs" },
    ],
  },

  // ───────────────────────────────────────────── 19. for...of vs for...in
  {
    id: "js-19",
    track: "javascript",
    number: 19,
    question: "What is the difference between `for...of` and `for...in`?",
    level: "beginner",
    frequency: "high",
    tags: ["loops", "iteration", "iterators", "objects"],
    shortAnswer:
      "`for...in` iterates over the **enumerable string keys** of an object, *including inherited ones* from the prototype chain. The keys are always strings — even array indices — and symbol keys are skipped. It's meant for plain objects.\n\n`for...of` iterates over the **values** produced by an *iterable*: anything with a `Symbol.iterator` method, such as arrays, strings, Maps, Sets, `arguments`, NodeLists and generators. Plain objects aren't iterable, so `for...of` on one throws a TypeError.\n\nRule of thumb: arrays and other collections, use `for...of`. For an object's own entries, use `for (const [k, v] of Object.entries(obj))` rather than `for...in`, which avoids inherited keys.",
    deep: [
      { type: "compare", items: [
        { title: "for...in", points: ["yields keys (strings)", "own + inherited enumerable properties", "skips symbol keys", "works on any object", "order: integer keys ascending, then string keys in insertion order (own before inherited)"] },
        { title: "for...of", points: ["yields values from an iterator", "requires `Symbol.iterator`", "works with arrays, strings, Map, Set, generators", "supports `break`/`continue`/`return` (calls iterator `return()`)", "strings iterate by code point"] },
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "for...in order", text: "For a long time `for...in` order was implementation-defined. ES2020 tightened the spec so that, for ordinary objects not modified during iteration, engines follow the same order as `Object.keys` for own properties, then walk up the prototype chain. Adding/deleting properties during the loop still has loosely specified effects." },
      { type: "list", items: [
        "Arrays with extra properties or a polluted `Array.prototype` leak those keys into `for...in`.",
        "`for await...of` iterates async iterables (js-44); `Symbol.iterator` lets you make your own classes iterable (js-45).",
        "`for...of` over `Object.entries`, `Object.keys` or `Object.values` gives own enumerable string-keyed properties only.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `const arr = ["a", "b"];
arr.extra = "x";

for (const k in arr) console.log("in:", k, typeof k);
for (const v of arr) console.log("of:", v);

const parent = { inherited: 1 };
const child = Object.create(parent);
child.own = 2;
for (const k in child) console.log("in child:", k);
console.log(Object.keys(child).join(","));

try { for (const v of child) {} } catch (e) { console.log(e.name); }

for (const [k, v] of Object.entries({ x: 1, y: 2 })) console.log(k + "=" + v);`,
      output: `in: 0 string
in: 1 string
in: extra string
of: a
of: b
in child: own
in child: inherited
own
TypeError
x=1
y=2`,
    },
    walkthrough: [
      { title: "for...in on an array", detail: "Yields the string keys \"0\", \"1\" and the extra property \"extra\"." },
      { title: "for...of on an array", detail: "Uses the array iterator, which yields only element values." },
      { title: "Inherited keys", detail: "`for...in` walks up to `parent` and yields `inherited`; `Object.keys` returns only own keys." },
      { title: "Non-iterable", detail: "Plain objects have no `Symbol.iterator`, so `for...of` throws TypeError (\"child is not iterable\")." },
      { title: "Entries", detail: "`Object.entries` returns an array of `[key, value]` pairs, which is iterable and destructurable." },
    ],
    followUps: [
      { q: "How do you get the index in a `for...of` over an array?", a: "`for (const [i, v] of arr.entries())`." },
      { q: "Why does `for...of` over a string handle emoji correctly while a `for` loop with `str[i]` doesn't?", a: "The string iterator yields Unicode code points, combining surrogate pairs; indexing works on UTF-16 code units, splitting astral characters in two." },
      { q: "How do you make a custom object work with `for...of`?", a: "Implement `[Symbol.iterator]()` returning an object with `next()` that returns `{ value, done }` — or simply define it as a generator method (`*[Symbol.iterator]() { yield ... }`)." },
      { q: "Is `for...in` slower?", a: "Typically yes — it has to enumerate the prototype chain and handle shape changes — but the bigger reason to avoid it on arrays is correctness, not speed." },
    ],
    pitfalls: [
      "Using `for...in` on arrays (string indices, extra/inherited keys).",
      "Using `for...of` on plain objects.",
      "Doing arithmetic with `for...in` keys (`k + 1` concatenates strings).",
    ],
    glossary: [
      { term: "Enumerable", definition: "A property flag that makes the property show up in `for...in` and `Object.keys`." },
      { term: "Iterable", definition: "An object with a `Symbol.iterator` method that returns an iterator." },
      { term: "Iterator", definition: "An object with a `next()` method returning `{ value, done }`." },
      { term: "Code point", definition: "A single Unicode character number; some take two UTF-16 code units (a surrogate pair)." },
    ],
    relatedLessons: ["javascript/generators-iterators", "javascript/prototypes", "javascript/symbols"],
    relatedQuestions: ["js-45", "js-44", "js-04"],
    sources: [
      learnerList,
      { label: "MDN — for...of", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of", kind: "docs" },
      { label: "MDN — for...in", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in", kind: "docs" },
      { label: "MDN — Iteration protocols", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols", kind: "docs" },
    ],
  },

  // ───────────────────────────────────────────── 20. Timers
  {
    id: "js-20",
    track: "javascript",
    number: 20,
    question: "How do timers (`setTimeout`, `setInterval`) work in JavaScript?",
    level: "intermediate",
    frequency: "high",
    tags: ["timers", "setTimeout", "setInterval", "event-loop"],
    shortAnswer:
      "`setTimeout(fn, delay)` asks the host to queue `fn` as a **task** after *at least* `delay` milliseconds. `setInterval` does the same repeatedly. Both return an ID that you pass to `clearTimeout` or `clearInterval` to cancel them.\n\nThe delay is a **minimum, not a guarantee**: the callback can only run when the call stack is empty and all microtasks have drained, so busy code delays it. Browsers also clamp delays: once timers are nested more than five levels deep, the minimum becomes 4 ms, and background tabs are throttled to around once per second or less. Delays above about 24.8 days (2^31 − 1 ms) overflow.\n\n`setInterval` keeps a fixed schedule however long your callback takes, so slow callbacks can run back-to-back with no breathing room; for work of variable duration a recursive `setTimeout` is safer. For animation, use `requestAnimationFrame` instead.",
    deep: [
      { type: "steps", steps: [
        { title: "Register", detail: "The host records the callback and its expiry time; JS continues immediately." },
        { title: "Expire", detail: "When the time passes, the host queues a task (browser) or the timer becomes due in the timers phase (Node)." },
        { title: "Run", detail: "When the event loop picks that task — after the current task and microtasks — the callback runs. Timers with the same delay fire in the order they were created." },
        { title: "Repeat (intervals)", detail: "`setInterval` reschedules itself after each run. JS can't be interrupted, so a callback never overlaps itself, and a long callback doesn't cause a burst of queued catch-up ticks — but the gap between runs can shrink to almost nothing." },
      ] },
      { type: "table", head: ["Behaviour", "Browser", "Node.js"], rows: [
        ["Return value", "integer ID", "`Timeout` object (with `ref()`, `unref()`, `refresh()`; coerces to a number ID)"],
        ["`0` delay", "treated as 0, clamped to ≥ 4 ms when nested > 5 levels", "values < 1 become 1 ms"],
        ["Very large delay", "> 2^31 − 1 ms overflows → treated as 0 (fires ASAP)", "> 2^31 − 1 ms → set to 1 ms with a warning"],
        ["Background throttling", "inactive tabs: ≥ ~1 s; Chrome may batch further (intensive throttling)", "none"],
        ["Related APIs", "`requestAnimationFrame`, `requestIdleCallback`", "`setImmediate`, `timers/promises`"],
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Spec source", text: "Timers are not part of ECMAScript; they're defined by the HTML Standard's \"timer initialization steps\" (including the nesting-level clamp) and implemented separately by Node in its `timers` module on top of libuv. The exact background-tab policy is browser-specific." },
      { type: "list", items: [
        "Extra arguments are passed to the callback: `setTimeout(fn, 100, a, b)`.",
        "Passing a string (`setTimeout(\"code\", 0)`) evaluates code like `eval` — avoid; it's blocked by CSP.",
        "Promise-based delay in Node: `import { setTimeout as sleep } from \"node:timers/promises\"; await sleep(100);`.",
        "Timers keep closures alive; clear them when components unmount to avoid leaks.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `setTimeout(() => console.log("timeout 20"), 20);
setTimeout(() => console.log("timeout 0"), 0);

const cancelled = setTimeout(() => console.log("never"), 5);
clearTimeout(cancelled);

let ticks = 0;
const interval = setInterval(() => {
  ticks++;
  console.log("interval tick", ticks);
  if (ticks === 2) clearInterval(interval);
}, 5);

Promise.resolve().then(() => console.log("microtask"));
console.log("sync");`,
      output: `sync
microtask
timeout 0
interval tick 1
interval tick 2
timeout 20`,
    },
    walkthrough: [
      { title: "Registration", detail: "Three timers and an interval are registered; one timer is immediately cancelled so it never fires." },
      { title: "Sync and microtasks", detail: "\"sync\" prints, then the microtask queue drains: \"microtask\"." },
      { title: "~0–1 ms", detail: "\"timeout 0\" fires first." },
      { title: "~5 ms, ~10 ms", detail: "Two interval ticks; the second clears the interval." },
      { title: "~20 ms", detail: "\"timeout 20\" fires last. (Under extreme load the real gaps can be longer, but each delay is a minimum.)" },
    ],
    followUps: [
      { q: "How do you build an accurate timer or countdown?", a: "Don't count ticks — they drift. Record a start time with `performance.now()` and compute the remaining time on each tick, scheduling the next tick relative to the target." },
      { q: "Why prefer recursive `setTimeout` over `setInterval`?", a: "It schedules the next run only after the current one finishes, so slow callbacks never overlap or pile up, and you can adapt the delay (e.g. backoff)." },
      { q: "What does `unref()` do in Node?", a: "It tells the event loop that this timer alone shouldn't keep the process alive; if nothing else is pending, Node can exit before it fires." },
      { q: "Why is `setTimeout(fn, 0)` not a good \"yield\" in browsers?", a: "It works, but nested chains get clamped to 4 ms each. `MessageChannel` or `scheduler.postTask`/`scheduler.yield()` (where supported) yield with less delay." },
    ],
    pitfalls: [
      "Treating the delay as exact.",
      "Forgetting to clear intervals (leaks and duplicate work, especially in SPA components).",
      "Calling the function when passing it: `setTimeout(fn(), 100)`.",
      "Using timers for animation instead of `requestAnimationFrame`.",
    ],
    glossary: [
      { term: "Clamping", definition: "The host raising a requested delay to a minimum value (e.g. 4 ms)." },
      { term: "Drift", definition: "Accumulated timing error when a repeating timer runs later than planned each time." },
      { term: "Throttling (browser)", definition: "Reducing how often timers fire in background tabs to save power." },
      { term: "`requestAnimationFrame`", definition: "Schedules a callback right before the browser's next repaint." },
    ],
    relatedLessons: ["javascript/timers", "javascript/event-loop", "javascript/debounce-throttle", "nodejs/node-event-loop"],
    relatedQuestions: ["js-01", "js-21", "js-14"],
    sources: [
      learnerList,
      { label: "MDN — setTimeout()", url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout", kind: "docs" },
      { label: "MDN — setInterval()", url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval", kind: "docs" },
      { label: "HTML Standard — Timers", url: "https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers", kind: "docs" },
      { label: "Node.js — Timers", url: "https://nodejs.org/api/timers.html", kind: "docs" },
    ],
  },
  // ───────────────────────────────────────────── 21. Debounce & throttle
  {
    id: "js-21",
    track: "javascript",
    number: 21,
    question: "What are debouncing and throttling, and how would you implement them?",
    level: "intermediate",
    frequency: "high",
    tags: ["debounce-throttle", "performance", "closures", "timers", "events"],
    shortAnswer:
      "Both limit how often a function runs in response to rapid events like typing, scrolling or resizing.\n\n**Debounce** waits until the events *stop*: each call resets a timer, and the function runs only after `wait` ms of silence. Use it for search-as-you-type, autosave, or validating after the user pauses. **Throttle** guarantees the function runs *at most once per interval* while events keep coming. Use it for scroll position, resize layout, or drag handlers where you want steady updates.\n\nImplementation-wise, both are higher-order functions that return a wrapper, with a closure holding state: a timer ID for debounce, a last-run timestamp or a cooldown flag for throttle. Good implementations forward `this` and arguments, and offer leading/trailing options and `cancel`.",
    deep: [
      { type: "p", text: "**Intuition.** Debounce is an elevator door: it closes only after people stop walking in. Throttle is a metronome: no matter how fast you tap, it lets one beat through per interval." },
      { type: "compare", items: [
        { title: "Debounce", points: ["fires after a quiet period", "a continuous stream of events may never fire (trailing) until it stops", "good for: search input, autosave, window-resize final layout", "state: pending timer"] },
        { title: "Throttle", points: ["fires at most once per interval", "steady rate during a continuous stream", "good for: scroll/drag/mousemove, rate-limited polling", "state: last-run time (+ optional trailing timer)"] },
      ] },
      { type: "list", items: [
        "**Leading vs trailing**: leading fires on the first event; trailing fires once after the burst. Lodash's `debounce` supports both and a `maxWait` (which turns it into a throttle).",
        "**Lifecycle**: expose `cancel()`/`flush()` and cancel on component unmount to avoid calls on unmounted UI.",
        "**React**: create the debounced function once (`useMemo`/`useRef`), otherwise every render creates a new one with a fresh timer.",
        "For visual updates, `requestAnimationFrame` is a natural throttle (once per frame).",
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Timing caveat", text: "Both rely on timers and `Date.now()`/`performance.now()`, so they inherit timer imprecision: background-tab throttling and busy main threads stretch the intervals. They're rate-*limiters* for UX, not precise schedulers." },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `function debounce(fn, wait) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

function throttle(fn, interval) {
  let last = -Infinity; // leading-edge throttle
  return function (...args) {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn.apply(this, args);
    }
  };
}

const debounced = debounce(q => console.log("debounced search:", q), 50);
const throttled = throttle(n => console.log("throttled call", n), 1000);

["r", "re", "rea", "reac", "react"].forEach((q, i) => {
  debounced(q);   // keeps resetting the timer
  throttled(i);   // only the first call within 1 s gets through
});`,
      output: `throttled call 0
debounced search: react`,
    },
    walkthrough: [
      { title: "Five rapid calls", detail: "All happen in the same synchronous loop, within a millisecond or two." },
      { title: "Throttle", detail: "Call 0 passes (`now - (-Infinity)` ≥ 1000) and sets `last`; calls 1–4 are within 1 s and dropped." },
      { title: "Debounce", detail: "Each call clears the previous timer and starts a new 50 ms one; only the last timer (\"react\") survives." },
      { title: "After 50 ms", detail: "The surviving timer fires: \"debounced search: react\"." },
    ],
    followUps: [
      { q: "Add a trailing call to the throttle so the final event isn't lost.", a: "Keep `pendingArgs` and a timer: when a call is dropped, store its args and, if no timer exists, schedule one for `interval - (now - last)` that runs `fn` with the latest args and updates `last`." },
      { q: "Implement a leading-edge debounce.", a: "Run `fn` immediately if no timer is active, then start a timer that just clears itself after `wait`; calls while the timer is active reset it but don't run `fn`." },
      { q: "Which would you use for an infinite-scroll \"near bottom\" check?", a: "Throttle (or an `IntersectionObserver`, which avoids scroll handlers entirely). Debounce would only check after scrolling stops, which feels laggy." },
      { q: "Why use `function` instead of an arrow for the returned wrapper?", a: "So the wrapper receives the caller's `this` (e.g. a method or a DOM element) and can forward it with `fn.apply(this, args)`." },
    ],
    pitfalls: [
      "Creating a new debounced function on every call/render, which defeats the purpose.",
      "Losing `this`/arguments in the wrapper.",
      "Not cancelling pending timers on teardown.",
      "Mixing them up: debounce for \"after the user stops\", throttle for \"steadily while it happens\".",
    ],
    glossary: [
      { term: "Debounce", definition: "Delay running a function until a burst of calls has stopped for a set time." },
      { term: "Throttle", definition: "Allow a function to run at most once per time window." },
      { term: "Leading / trailing edge", definition: "Running at the start of a burst vs after it ends." },
      { term: "Burst", definition: "A quick series of events, like keystrokes or scroll events." },
    ],
    relatedLessons: ["javascript/debounce-throttle", "javascript/closures", "javascript/timers", "javascript/higher-order-functions", "javascript/performance"],
    relatedQuestions: ["js-02", "js-08", "js-20", "js-38"],
    sources: [
      learnerList,
      { label: "MDN Glossary — Debounce", url: "https://developer.mozilla.org/en-US/docs/Glossary/Debounce", kind: "docs" },
      { label: "MDN Glossary — Throttle", url: "https://developer.mozilla.org/en-US/docs/Glossary/Throttle", kind: "docs" },
      { label: "Lodash — debounce", url: "https://lodash.com/docs/4.17.15#debounce", kind: "external" },
    ],
  },

  // ───────────────────────────────────────────── 22. Event delegation
  {
    id: "js-22",
    track: "javascript",
    number: 22,
    question: "What is event delegation and why is it useful?",
    level: "intermediate",
    frequency: "high",
    tags: ["event-delegation", "dom", "events", "bubbling", "performance"],
    shortAnswer:
      "Event delegation means attaching **one listener to a common ancestor** instead of one per child, and working out which child was involved from `event.target`. It works because most DOM events **bubble**: after firing on the target, they travel up through each ancestor.\n\nThe benefits are fewer listeners and less memory, and it automatically handles children added later — great for lists, tables and dynamic content.\n\nIn the handler you usually do `event.target.closest(\"selector\")`, because the target might be a nested element such as an icon inside a button, and you check the match is inside your container. Caveats: some events don't bubble — `focus`, `blur`, `mouseenter` and `mouseleave` — so use `focusin`/`focusout` or `mouseover`/`mouseout` instead, and `stopPropagation` in a child breaks delegation.",
    deep: [
      { type: "flow", nodes: ["capture: window → document → … → ul", "target: span inside li", "bubble: li → ul (delegate handler) → body → document → window"], caption: "Conceptual event path for a click on a span inside a list item." },
      { type: "steps", steps: [
        { title: "Capture phase", detail: "The event travels from `window` down to the target's parent; listeners registered with `{ capture: true }` run here." },
        { title: "Target phase", detail: "Listeners on the target itself run." },
        { title: "Bubble phase", detail: "If `event.bubbles` is true, it travels back up; normal listeners on ancestors run, including the delegated one." },
        { title: "Identify the item", detail: "`event.target` is the deepest element clicked; `event.currentTarget` is the element whose listener is running (the container)." },
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Where this is specified", text: "Event dispatch, phases and `composedPath()` are defined in the DOM Standard (WHATWG), not ECMAScript. Whether an event bubbles is decided per event type by its spec (e.g. UI Events): `click` bubbles, `focus` doesn't. Frameworks build on this: React attaches its listeners to the root container and dispatches synthetic events itself." },
      { type: "list", items: [
        "Shadow DOM retargets `event.target` at the shadow boundary; use `event.composedPath()` to see the real path.",
        "Disabled form controls don't dispatch click events in most browsers, so delegated handlers won't see them.",
        "High-frequency events (`mousemove`, `scroll`) delegated at the document level still run on every event — keep the handler cheap or throttle it.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      caption: "Browser-only (needs the DOM). Assumes <ul id=\"todo\"> with <li data-id=\"…\"><span>text</span> <button class=\"remove\"><i>×</i></button></li> items.",
      code: `const list = document.getElementById("todo");

list.addEventListener("click", (event) => {
  // target may be the <i> icon inside the button, so search upward
  const button = event.target.closest("button.remove");
  if (!button || !list.contains(button)) return; // click elsewhere

  const item = button.closest("li");
  console.log("remove", item.dataset.id);
  item.remove();
});

// Items added later work automatically - no new listeners needed
const li = document.createElement("li");
li.dataset.id = "3";
li.innerHTML = '<span>New task</span> <button class="remove"><i>×</i></button>';
list.append(li);`,
      output: `// clicking the × icon of item 3:
remove 3
// clicking the text of an item: (nothing logged)`,
    },
    walkthrough: [
      { title: "One listener", detail: "Only the `<ul>` has a click listener, regardless of how many items exist." },
      { title: "Click the icon", detail: "`event.target` is the `<i>` element; the event bubbles from `<i>` → `<button>` → `<li>` → `<ul>`." },
      { title: "Find the button", detail: "`closest(\"button.remove\")` walks up from the `<i>` and finds the button; `list.contains` ensures it belongs to this list." },
      { title: "Act", detail: "The parent `<li>` is found, its `data-id` read (\"3\"), and it's removed." },
      { title: "Other clicks", detail: "Clicking the span finds no matching button, so the handler returns early." },
    ],
    followUps: [
      { q: "What's the difference between `event.target` and `event.currentTarget`?", a: "`target` is where the event originated (deepest element); `currentTarget` is the element whose listener is currently running — the container in delegation." },
      { q: "How do you delegate focus events?", a: "Use `focusin`/`focusout`, which bubble, or listen to `focus` in the capture phase (`addEventListener(\"focus\", fn, true)`)." },
      { q: "What's the difference between `stopPropagation` and `preventDefault`?", a: "`stopPropagation` stops the event moving to further elements (breaking delegation above it); `preventDefault` cancels the browser's default action (following a link, submitting a form) but propagation continues." },
      { q: "When would you not use delegation?", a: "For non-bubbling events, when handlers need per-element state that is easier to bind directly, or for very hot events where filtering every event at the root costs more than direct listeners." },
    ],
    pitfalls: [
      "Comparing `event.target` directly to the item instead of using `closest` (nested elements break it).",
      "Forgetting events like `focus`, `blur`, `mouseenter` don't bubble.",
      "A child calling `stopPropagation`, silently breaking the delegated handler.",
    ],
    glossary: [
      { term: "Event bubbling", definition: "After firing on the target, an event propagates up through its ancestors." },
      { term: "Capture phase", definition: "The first phase, where the event travels from the window down toward the target." },
      { term: "`event.target`", definition: "The element where the event originated." },
      { term: "`Element.closest()`", definition: "Returns the nearest ancestor (or the element itself) matching a CSS selector." },
    ],
    relatedLessons: ["javascript/event-delegation", "javascript/dom", "javascript/performance"],
    relatedQuestions: ["js-21", "js-32"],
    sources: [
      learnerList,
      { label: "MDN — Event bubbling", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling", kind: "docs" },
      { label: "MDN — Element.closest()", url: "https://developer.mozilla.org/en-US/docs/Web/API/Element/closest", kind: "docs" },
      { label: "DOM Standard — Dispatching events", url: "https://dom.spec.whatwg.org/#dispatching-events", kind: "docs" },
    ],
  },

  // ───────────────────────────────────────────── 23. call, apply, bind
  {
    id: "js-23",
    track: "javascript",
    number: 23,
    question: "What is the difference between `call`, `apply` and `bind`?",
    level: "intermediate",
    frequency: "high",
    tags: ["call-apply-bind", "this", "functions"],
    shortAnswer:
      "All three let you set `this` for a function explicitly.\n\n`call(thisArg, a, b)` invokes the function **immediately** with arguments listed one by one. `apply(thisArg, [a, b])` also invokes immediately but takes the arguments as an **array**, or any array-like. `bind(thisArg, a)` **doesn't call** the function: it returns a new *bound function* with `this` permanently fixed, plus optionally some leading arguments pre-filled (partial application).\n\nA bound function's `this` can't be overridden later by `call`, `apply` or another `bind` — only `new` ignores it. Arrow functions ignore the `thisArg` entirely. Today, spread syntax — `fn(...args)` — has replaced most uses of `apply`.",
    deep: [
      { type: "table", head: ["Method", "Invokes now?", "Arguments", "Returns"], rows: [
        ["`fn.call(t, a, b)`", "yes", "listed", "fn's return value"],
        ["`fn.apply(t, [a, b])`", "yes", "array / array-like", "fn's return value"],
        ["`fn.bind(t, a)`", "no", "partial, prepended", "a new bound function"],
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Bound function exotic objects", text: "`bind` creates a *bound function exotic object* with internal slots `[[BoundTargetFunction]]`, `[[BoundThis]]` and `[[BoundArguments]]`. Its `name` is `\"bound \" + target.name`, its `length` is the target's length minus the bound arguments (min 0), and it has no `prototype` property; `new` on it constructs the target and ignores `[[BoundThis]]`." },
      { type: "list", items: [
        "In sloppy mode, a `null`/`undefined` thisArg becomes `globalThis` and primitives are boxed; in strict mode they're passed as-is.",
        "Borrowing methods: `Array.prototype.slice.call(arguments)` (today: `Array.from(arguments)` or rest parameters).",
        "Very large arrays passed to `apply` or spread can hit engine argument-count limits (RangeError).",
        "js-49 asks specifically about implementing/using `Function.prototype.call`; js-03 covers all `this` rules.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `function introduce(greeting, punctuation) {
  return greeting + ", I am " + this.name + punctuation;
}
const ada = { name: "Ada" };

console.log(introduce.call(ada, "Hi", "!"));
console.log(introduce.apply(ada, ["Hello", "."]));

const adaIntro = introduce.bind(ada, "Hey"); // this + first arg fixed
console.log(adaIntro("?"));
console.log(adaIntro.call({ name: "Other" }, "!")); // bound this wins
console.log(adaIntro.name, adaIntro.length);

function Point(x, y) { this.x = x; this.y = y; }
const BoundPoint = Point.bind({ ignored: true }, 1);
const p = new BoundPoint(2); // new ignores the bound this
console.log(p.x, p.y, p instanceof Point, "ignored" in p);

console.log(Math.max.apply(null, [3, 9, 4]), Math.max(...[3, 9, 4]));`,
      output: `Hi, I am Ada!
Hello, I am Ada.
Hey, I am Ada?
Hey, I am Ada!
bound introduce 1
1 2 true false
9 9`,
    },
    walkthrough: [
      { title: "call", detail: "Runs `introduce` now with `this = ada` and args \"Hi\", \"!\"." },
      { title: "apply", detail: "Same, but args come from an array." },
      { title: "bind", detail: "Returns a new function with `this = ada` and `greeting = \"Hey\"` pre-filled; calling it with \"?\" supplies `punctuation`." },
      { title: "Override attempt", detail: "`call({ name: \"Other\" })` on a bound function can't change `this` → still Ada." },
      { title: "Metadata", detail: "Name becomes \"bound introduce\"; length is 2 − 1 = 1." },
      { title: "new on a bound function", detail: "Constructs a real `Point` with x = 1 (bound arg), y = 2; the bound `this` object is ignored." },
      { title: "apply vs spread", detail: "Both pass the array elements as separate arguments to `Math.max`." },
    ],
    followUps: [
      { q: "Implement `bind` yourself.", a: "`Function.prototype.myBind = function (ctx, ...pre) { const fn = this; return function bound(...args) { return new.target ? new fn(...pre, ...args) : fn.apply(ctx, [...pre, ...args]); }; };` — the `new.target` check mimics constructor behaviour." },
      { q: "Implement `call` without using `call`/`apply`.", a: "Temporarily attach the function to the context under a unique symbol key, invoke it as a method, delete the key, return the result: `const k = Symbol(); ctx[k] = this; const r = ctx[k](...args); delete ctx[k]; return r;` (box primitives and default `ctx` to `globalThis` first)." },
      { q: "Can you re-bind a bound function?", a: "You can call `bind` again to pre-fill more arguments, but the `this` stays the one from the first `bind`." },
      { q: "When is `bind` commonly used?", a: "Passing methods as callbacks (`button.addEventListener(\"click\", this.onClick.bind(this))`), partial application (`log.bind(null, \"[db]\")`), and preserving context in timers." },
    ],
    pitfalls: [
      "Using `bind` where `call` was meant (nothing happens — you get a function back).",
      "Binding inside render/hot loops, creating new functions each time (breaks memoization, can't remove the listener later).",
      "Expecting `bind`/`call` to change an arrow function's `this`.",
    ],
    glossary: [
      { term: "thisArg", definition: "The value to use as `this` when invoking the function." },
      { term: "Partial application", definition: "Fixing some of a function's arguments to produce a function that takes the rest." },
      { term: "Array-like", definition: "An object with a `length` and indexed elements, like `arguments` or a NodeList." },
      { term: "Method borrowing", definition: "Using another object's method on your object via `call`/`apply`." },
    ],
    relatedLessons: ["javascript/call-apply-bind", "javascript/this-binding", "javascript/arrow-functions", "javascript/currying"],
    relatedQuestions: ["js-49", "js-03", "js-16", "js-27"],
    sources: [
      learnerList,
      { label: "MDN — Function.prototype.call()", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call", kind: "docs" },
      { label: "MDN — Function.prototype.apply()", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply", kind: "docs" },
      { label: "MDN — Function.prototype.bind()", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind", kind: "docs" },
    ],
  },
  // ───────────────────────────────────────────── 24. try...catch
  {
    id: "js-24",
    track: "javascript",
    number: 24,
    question: "How does `try...catch` work in JavaScript?",
    level: "beginner",
    frequency: "high",
    tags: ["error-handling", "try-catch", "exceptions", "async"],
    shortAnswer:
      "`try` runs a block. If anything inside it throws — synchronously — control jumps straight to `catch (err)`, which receives the thrown value. `finally` runs afterwards **no matter what**: success, caught error, re-throw, or even a `return` in the `try`. The catch parameter is optional since ES2019, so `catch { }` works.\n\nThe key limitation is that it's synchronous: it only catches errors thrown while the `try` block is on the call stack. An error thrown later inside a `setTimeout` callback or a promise isn't caught — unless you `await` that promise inside the `try`, in which case the rejection is re-thrown at the `await`.\n\nGood practice: throw `Error` objects rather than strings, catch only what you can handle, re-throw the rest, and use `finally` for cleanup.",
    deep: [
      { type: "steps", steps: [
        { title: "Throw", detail: "`throw expr` (or an engine error like TypeError) creates an *abrupt completion* that unwinds the call stack frame by frame." },
        { title: "Catch", detail: "The nearest enclosing `try` with a `catch` gets the thrown value. Anything can be thrown, so `err` might not be an `Error`." },
        { title: "Finally", detail: "Runs on every exit path. A `return` or `throw` inside `finally` *overrides* the pending result or error — usually a bug." },
        { title: "Uncaught", detail: "If no handler exists, the host reports it (`window.onerror` / `error` event, `process.on(\"uncaughtException\")` — Node exits by default)." },
      ] },
      { type: "table", head: ["Situation", "Caught by surrounding try/catch?"], rows: [
        ["Synchronous throw inside `try`", "yes"],
        ["Throw inside a `setTimeout` callback scheduled in `try`", "no — it runs later on a fresh stack"],
        ["`promise.then(...)` that rejects, not awaited", "no — use `.catch`"],
        ["`await promise` that rejects, inside `try`", "yes — thrown at the `await`"],
        ["Error inside an event listener", "no — reported to the global error handler"],
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Error details are partly non-standard", text: "`name`, `message` and (since ES2022) `cause` are standard. `error.stack` is *not* in the ECMAScript spec; its format differs between V8, SpiderMonkey and JavaScriptCore. V8 also offers `Error.captureStackTrace` and `Error.stackTraceLimit`." },
      { type: "list", items: [
        "Wrap with context without losing the original: `throw new Error(\"loading config failed\", { cause: err })`.",
        "Custom errors: `class NotFoundError extends Error { name = \"NotFoundError\"; }` and check with `instanceof`.",
        "Modern engines optimise functions containing `try/catch` fine; the old \"try/catch deopts\" advice is obsolete in V8 (TurboFan).",
        "js-34 asks about exceptions more broadly (throwing, custom error types, propagation); this question focuses on the `try...catch...finally` statement.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `function parse(json) {
  try {
    const data = JSON.parse(json);
    return "ok:" + data.a;
  } catch (err) {
    return "failed:" + err.name;
  } finally {
    console.log("finally for", json);
  }
}
console.log(parse('{"a":1}'));
console.log(parse("{bad"));

function finallyOverrides() {
  try { return "try"; } finally { return "finally"; } // overrides!
}
console.log(finallyOverrides());

try {
  null.prop;
} catch (e) {
  console.log(e instanceof TypeError, e.name);
}

async function load() {
  try {
    await Promise.reject(new Error("network down"));
  } catch (e) {
    console.log("caught async:", e.message);
  }
}
load();`,
      output: `finally for {"a":1}
ok:1
finally for {bad
failed:SyntaxError
finally
true TypeError
caught async: network down`,
    },
    walkthrough: [
      { title: "Successful parse", detail: "`try` computes \"ok:1\", but before the function actually returns, `finally` logs. Then the caller logs \"ok:1\"." },
      { title: "Failed parse", detail: "`JSON.parse` throws a SyntaxError → `catch` returns \"failed:SyntaxError\"; `finally` logs first, then the caller prints the result." },
      { title: "finally overrides", detail: "The `return` in `finally` replaces the `try`'s return value." },
      { title: "Engine error", detail: "Reading a property of `null` throws a TypeError, caught synchronously." },
      { title: "Async", detail: "`load()` awaits a rejected promise; the rejection is thrown at the `await` and caught. This prints last because `await` resumes in a microtask after the synchronous code." },
    ],
    followUps: [
      { q: "Why doesn't `try { setTimeout(() => { throw e }) } catch {}` work?", a: "The callback runs later in a separate task, after the `try` block has already finished and its frame is gone. Put the `try/catch` inside the callback, or use promises/async-await." },
      { q: "How do you handle errors globally?", a: "Browsers: `window.addEventListener(\"error\", ...)` and `\"unhandledrejection\"`. Node: `process.on(\"uncaughtException\")` / `\"unhandledRejection\"` for logging, then exit — the process state may be corrupt." },
      { q: "Should you throw strings?", a: "No — strings have no stack trace or name. Throw `Error` (or a subclass), and in `catch` don't assume `err` is an Error; check with `instanceof Error` when needed." },
      { q: "What does `finally` return if `try` throws and `finally` returns?", a: "The `finally`'s return value; the error is silently swallowed. That's why returning from `finally` is flagged by linters (`no-unsafe-finally`)." },
    ],
    pitfalls: [
      "Empty `catch` blocks that swallow errors silently.",
      "Expecting `try/catch` to catch errors in callbacks or un-awaited promises.",
      "Returning or throwing from `finally`.",
      "Wrapping huge blocks so you can't tell which operation failed.",
    ],
    glossary: [
      { term: "Exception", definition: "A thrown value that interrupts normal execution until a `catch` handles it." },
      { term: "Stack unwinding", definition: "Popping function frames off the call stack while looking for a handler." },
      { term: "Abrupt completion", definition: "Spec term for leaving a block via `throw`, `return`, `break` or `continue` instead of finishing normally." },
      { term: "Error cause", definition: "The ES2022 `cause` option that links a new error to the original one." },
    ],
    relatedLessons: ["javascript/error-handling", "javascript/async-await", "javascript/promises", "javascript/call-stack"],
    relatedQuestions: ["js-34", "js-07", "js-09"],
    sources: [
      learnerList,
      { label: "MDN — try...catch", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch", kind: "docs" },
      { label: "MDN — Error", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error", kind: "docs" },
      { label: "Node.js — Errors", url: "https://nodejs.org/api/errors.html", kind: "docs" },
    ],
  },

  // ───────────────────────────────────────────── 25. Array detection
  {
    id: "js-25",
    track: "javascript",
    number: 25,
    question: "How do you check whether a value is an array in JavaScript?",
    level: "beginner",
    frequency: "high",
    tags: ["arrays", "data-types", "typeof", "instanceof"],
    shortAnswer:
      "Use `Array.isArray(value)`. That's the correct answer and the reason matters.\n\n`typeof []` is `\"object\"`, so `typeof` can't tell arrays from objects. `value instanceof Array` *usually* works, but it checks the prototype chain against one particular `Array` constructor. So it fails for arrays from another realm — an iframe, another window, Node's `vm` module — and it can be fooled by objects whose prototype was set to `Array.prototype`.\n\n`Array.isArray` checks the internal nature of the object — whether it's an array exotic object — so it works across realms, sees through Proxies wrapping arrays, and returns false for array-likes such as `arguments`, NodeLists and typed arrays. The older fallback was `Object.prototype.toString.call(v) === \"[object Array]\"`.",
    deep: [
      { type: "table", head: ["Check", "`[]`", "cross-realm array", "`Object.create(Array.prototype)`", "`arguments` / NodeList"], rows: [
        ["`typeof v === \"object\"`", "true", "true", "true", "true (useless)"],
        ["`v instanceof Array`", "true", "**false**", "**true**", "false"],
        ["`v.constructor === Array`", "true", "false", "true", "false"],
        ["`Object.prototype.toString.call(v)`", "[object Array]", "[object Array]", "[object Object]", "[object Arguments] / [object NodeList]"],
        ["`Array.isArray(v)`", "true", "true", "false", "false"],
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Spec detail", text: "`Array.isArray` calls the abstract operation `IsArray`: true for *Array exotic objects* (whose special behaviour is that `length` tracks indices), and for a Proxy it recursively checks the proxy's target (throwing if the proxy was revoked). It does not consult prototypes or `Symbol.toStringTag`, which is why it can't be spoofed." },
      { type: "list", items: [
        "Typed arrays (`Uint8Array`) are not arrays: use `ArrayBuffer.isView(v)` to detect them.",
        "To accept any array-like or iterable, convert with `Array.from(v)` instead of checking.",
        "`Array.prototype` itself is an array: `Array.isArray(Array.prototype)` is true (a legacy quirk).",
        "In TypeScript, `Array.isArray` narrows the type to `any[]`; consider a typed guard for `readonly` arrays.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `const values = [[], new Array(3), {}, "abc", { length: 0 }, new Uint8Array(2), Array.prototype];
console.log(values.map(v => Array.isArray(v)).join(","));

console.log(typeof [], [] instanceof Array, Object.prototype.toString.call([]));

const fake = Object.create(Array.prototype); // spoofs instanceof
console.log(fake instanceof Array, Array.isArray(fake));

console.log(Array.isArray(new Proxy([], {})));

function f() { return Array.isArray(arguments); }
console.log(f(1, 2));`,
      output: `true,true,false,false,false,false,true
object true [object Array]
true false
true
false`,
    },
    walkthrough: [
      { title: "Mixed values", detail: "Array literals and `new Array(3)` are arrays; plain objects, strings, array-likes and typed arrays aren't; `Array.prototype` is (legacy)." },
      { title: "Other checks", detail: "`typeof` says \"object\"; `instanceof` and the toString tag work for same-realm arrays." },
      { title: "Spoofing", detail: "An object inheriting from `Array.prototype` fools `instanceof` but not `Array.isArray`." },
      { title: "Proxy", detail: "`IsArray` looks through the proxy to its array target → true." },
      { title: "arguments", detail: "Array-like but not an array → false." },
    ],
    followUps: [
      { q: "What is a realm and why does `instanceof` fail across them?", a: "A realm is a separate set of built-ins and global object — each iframe, worker or `vm` context has its own. An array from an iframe was built by *that* realm's `Array`, so its prototype chain contains a different `Array.prototype` than yours." },
      { q: "How would you polyfill `Array.isArray`?", a: "`Array.isArray = Array.isArray || (v => Object.prototype.toString.call(v) === \"[object Array]\");` — this was the ES3-era approach (not proxy-aware, but realm-safe)." },
      { q: "How do you convert an array-like to a real array?", a: "`Array.from(arrayLike)`, spread for iterables (`[...nodeList]`), or legacy `Array.prototype.slice.call(arrayLike)`." },
      { q: "How do you detect a plain object?", a: "`v !== null && typeof v === \"object\" && !Array.isArray(v)` for a rough check, or `Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null` for a strict plain-object check." },
    ],
    pitfalls: [
      "Using `typeof` to detect arrays.",
      "Relying on `instanceof Array` with data from iframes, workers (after cloning it is fine) or `vm` contexts.",
      "Treating NodeLists or `arguments` as arrays and calling `map` on them.",
    ],
    glossary: [
      { term: "Realm", definition: "An isolated JavaScript global environment with its own built-in objects (e.g. each iframe)." },
      { term: "Array exotic object", definition: "The spec's name for real arrays, whose `length` automatically tracks the highest index." },
      { term: "Array-like", definition: "An object with `length` and numeric keys that isn't a real array." },
      { term: "`instanceof`", definition: "Checks whether a constructor's `prototype` appears in an object's prototype chain." },
    ],
    relatedLessons: ["javascript/data-types", "javascript/prototypes", "javascript/proxy-reflect"],
    relatedQuestions: ["js-12", "js-04"],
    sources: [
      learnerList,
      { label: "MDN — Array.isArray()", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray", kind: "docs" },
      { label: "ECMAScript — IsArray", url: "https://tc39.es/ecma262/#sec-isarray", kind: "docs" },
    ],
  },

  // ───────────────────────────────────────────── 26. Closures with examples
  {
    id: "js-26",
    track: "javascript",
    number: 26,
    question: "Explain closures with practical examples.",
    level: "intermediate",
    frequency: "high",
    tags: ["closures", "examples", "scope", "patterns"],
    shortAnswer:
      "A closure is a function that keeps access to the variables of the scope where it was created, even after that scope has finished running. The best way to explain it is through what it lets you build.\n\n**Private state**: a `makeCounter()` whose `count` can only be changed through the returned methods. **Function factories**: `makeMultiplier(2)` returns a function that remembers `factor = 2`. **Run-once and memoize wrappers**: a `once(fn)` that remembers whether it already ran. **Callbacks and timers**: a debounce wrapper remembering its timer ID, or an event handler remembering which item it belongs to.\n\nAnd two classic gotchas: `var` in a loop shares one binding, so all callbacks see the final value, and a closure that captured an old object keeps seeing that old object — the \"stale closure\" problem in React.",
    deep: [
      { type: "p", text: "This question overlaps js-02 (what a closure *is* and how environments work). Here the interviewer wants **examples**: show a few patterns, explain what each closure captures, and mention a pitfall or two." },
      { type: "viz", id: "js-closure", caption: "Each factory call creates a separate environment that the returned function keeps alive." },
      { type: "table", head: ["Pattern", "What the closure remembers", "Real-world use"], rows: [
        ["Private state / module pattern", "mutable variables like `count`", "counters, caches, encapsulated stores"],
        ["Function factory", "configuration (`factor`, `baseUrl`)", "`makeMultiplier`, `createLogger(\"db\")`, API clients"],
        ["once / memoize", "a flag or a cache `Map`", "lazy init, expensive pure calculations"],
        ["debounce / throttle", "timer ID, last-run time", "search boxes, scroll handlers"],
        ["Callbacks with context", "loop item, request ID", "event handlers, `setTimeout` in loops"],
        ["React hooks", "props/state of one render", "event handlers, effects"],
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Memory cost", text: "Each closure keeps its environment alive. In V8, closures created in the same scope share one context object, so a small callback can accidentally retain a large array captured by a sibling closure. Keep long-lived closures small and release them (remove listeners, clear timers)." },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `// 1) once(): remembers whether it already ran
function once(fn) {
  let done = false, result;
  return (...args) => {
    if (!done) { done = true; result = fn(...args); }
    return result;
  };
}
const init = once(() => { console.log("initialising"); return 42; });
console.log(init(), init());

// 2) Function factory: remembers configuration
function makeMultiplier(factor) { return n => n * factor; }
const double = makeMultiplier(2), triple = makeMultiplier(3);
console.log(double(5), triple(5));

// 3) Pitfall: var shares ONE binding across iterations
function makeAdders() {
  const adders = [];
  for (var i = 1; i <= 3; i++) adders.push(x => x + i);
  return adders.map(add => add(10)).join(",");
}
console.log(makeAdders());

// 4) Stale closure: captured the OLD object
let config = { level: "info" };
const getLevel = (cfg => () => cfg.level)(config);
config = { level: "debug" };
console.log(getLevel());`,
      output: `initialising
42 42
10 15
14,14,14
info`,
    },
    walkthrough: [
      { title: "once", detail: "The first `init()` runs the function (logging \"initialising\") and stores 42 in the closure; the second call sees `done === true` and returns the cached 42. Both calls finish before `console.log` prints \"42 42\"." },
      { title: "Factory", detail: "Each `makeMultiplier` call creates its own environment: `double` remembers 2, `triple` remembers 3." },
      { title: "var loop", detail: "All three arrows close over the same `i`, which is 4 when they run, so each returns 14. Using `let i` would give 11,12,13." },
      { title: "Stale closure", detail: "The IIFE passed the *current* object as `cfg`. Reassigning `config` later points the outer variable at a new object, but `cfg` still references the old one → \"info\"." },
    ],
    followUps: [
      { q: "Build a memoize function using a closure.", a: "`const memoize = fn => { const cache = new Map(); return x => { if (!cache.has(x)) cache.set(x, fn(x)); return cache.get(x); }; };` — the `cache` lives in the closure (see js-36 for multi-argument keys and eviction)." },
      { q: "Implement the module pattern without ES modules.", a: "An IIFE returning an object of functions that close over private variables: `const store = (() => { let items = []; return { add: x => items.push(x), all: () => [...items] }; })();`." },
      { q: "How do closures relate to React's stale state bug?", a: "A handler created during render N closes over render N's state; if it runs later (in a timer or effect without dependencies), it reads old values. Fix with dependency arrays, functional updates, or refs." },
      { q: "How do you fix the var-loop bug without `let`?", a: "Create a new scope per iteration: `(function (j) { adders.push(x => x + j); })(i);` or use `forEach`, whose callback parameter is a fresh binding each call." },
    ],
    pitfalls: [
      "Explaining closures only with the definition and no concrete pattern (this question explicitly wants examples).",
      "Confusing \"captures the variable\" with \"captures the value\".",
      "Leaking memory through long-lived closures holding big objects.",
    ],
    glossary: [
      { term: "IIFE", definition: "Immediately Invoked Function Expression — a function defined and called at once, often to create a private scope." },
      { term: "Factory function", definition: "A function that builds and returns new functions or objects, often configured via closure." },
      { term: "Stale closure", definition: "A closure that still references outdated variables or objects from when it was created." },
      { term: "Memoization", definition: "Caching a function's results by its inputs to avoid recomputation." },
    ],
    relatedLessons: ["javascript/closures", "javascript/scope", "javascript/memoization", "javascript/debounce-throttle", "javascript/var-let-const"],
    relatedQuestions: ["js-02", "js-06", "js-21", "js-36"],
    sources: [
      learnerList,
      { label: "MDN — Closures (practical closures, emulating private methods)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures", kind: "docs" },
      { label: "MDN Glossary — IIFE", url: "https://developer.mozilla.org/en-US/docs/Glossary/IIFE", kind: "docs" },
    ],
  },
];
