import type { InterviewQuestion } from "../types";

/**
 * JavaScript interview questions 27–52 (ranked by interview frequency in the
 * learner's original list). Items 1–26 live in `javascript-a.ts`.
 * Overlapping topics are kept on purpose and cross-linked via `relatedQuestions`.
 */

export const questions: InterviewQuestion[] = [
  // ───────────────────────────────────────────────────────────── 27
  {
    id: "js-27",
    track: "javascript",
    number: 27,
    question: "What is currying, and how would you implement a generic `curry` function?",
    level: "intermediate",
    frequency: "medium",
    tags: ["functions", "closures", "functional-programming", "implement-it"],
    shortAnswer:
      "Currying turns a function that takes several arguments, like `f(a, b, c)`, into a chain of functions that each take one argument: `f(a)(b)(c)`. Each call returns a new function that **remembers** the arguments so far through a closure, and only when enough arguments have arrived does it call the original function.\n\nA generic `curry` reads the target's arity from `fn.length`, collects arguments across calls, and invokes `fn` once it has at least that many. In practice most implementations are \"auto-curried\" — they accept one *or more* arguments per call, so `f(1)(2)(3)`, `f(1, 2)(3)` and `f(1)(2, 3)` all work. It is useful for building specialised functions from general ones (partial application) and for point-free composition, e.g. `const add10 = add(10)`.",
    deep: [
      { type: "p", text: "**Intuition.** Think of a curried function as a form you fill in one field at a time. Every time you fill a field you get back a *new*, more specific form; when the last field is filled the form is submitted. The partially filled forms are reusable: `const greetInEnglish = greet('Hello')` can be called with many names." },
      { type: "p", text: "**Currying vs partial application.** *Currying* is the transformation of an n-ary function into n nested unary functions. *Partial application* is fixing some arguments now and the rest later (`fn.bind(null, 1)` is partial application). Most JavaScript `curry` helpers (Lodash, Ramda) are a hybrid: they curry, but each step may take several arguments." },
      { type: "steps", steps: [
        { title: "Read the arity", detail: "`fn.length` is the number of declared parameters *before* the first default value or rest parameter. `((a, b = 1) => {}).length` is `1`; `((...xs) => {}).length` is `0`." },
        { title: "Collect arguments in a closure", detail: "The returned function closes over the arguments received so far. Each partial call creates a new closure with a longer argument list — previous partials are not mutated, so they stay reusable." },
        { title: "Invoke when satisfied", detail: "Once `args.length >= fn.length`, call `fn.apply(this, args)`. Using `apply(this, …)` preserves `this` if the curried function is used as a method." },
      ] },
      { type: "viz", id: "js-closure", caption: "Each partial application is a closure retaining the arguments collected so far." },
      { type: "callout", tone: "spec-vs-impl", title: "Cost", text: "Every partial call allocates a new function object and an argument array. Engines optimise this well, but a deeply curried function in a hot loop is still slower than a direct call. Curry at setup time, not inside tight loops." },
      { type: "list", items: [
        "**Variadic functions** (`(...nums) => …`) have `length === 0`, so a naive `curry` calls them immediately. Pass an explicit arity: `curry(fn, 3)`.",
        "**Default parameters** shorten `length`, so the function may fire early.",
        "**Infinite currying** like `sum(1)(2)(3)()` needs a terminator (an empty call) or a `valueOf`/`Symbol.toPrimitive` trick — it is a different puzzle from arity-based currying.",
        "**Placeholders** (Lodash's `_.curry.placeholder`) let you skip arguments; vanilla implementations do not support this.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      caption: "An auto-currying helper that accepts one or more arguments per call",
      code: `function curry(fn, arity = fn.length) {
  return function curried(...args) {
    if (args.length >= arity) return fn.apply(this, args);
    return (...more) => curried.apply(this, [...args, ...more]);
  };
}

const add3 = (a, b, c) => a + b + c;
const add = curry(add3);

console.log(add(1)(2)(3));
console.log(add(1, 2)(3));
console.log(add(1)(2, 3));

const add5 = add(5);          // reusable partial
console.log(add5(1)(1), add5(10, 10));

const sumAll = curry((...nums) => nums.reduce((s, n) => s + n, 0), 3);
console.log(sumAll(1)(2)(3));`,
      output: `6
6
6
7 25
6`,
    },
    walkthrough: [
      { title: "curry(add3)", detail: "`arity` defaults to `add3.length`, which is 3. `curry` returns `curried`; nothing is called yet." },
      { title: "add(1)", detail: "`args = [1]`, `1 < 3`, so it returns an arrow function closing over `args = [1]`." },
      { title: "(2)", detail: "The arrow calls `curried(...[1], 2)` → `args = [1, 2]`, still short, returns another closure." },
      { title: "(3)", detail: "`args = [1, 2, 3]`, `3 >= 3`, so `add3.apply(this, [1, 2, 3])` returns 6." },
      { title: "add5 reuse", detail: "`add5` captured `[5]`. `add5(1)` and `add5(10, 10)` each build *new* argument arrays from it, so the two uses don't interfere: 5+1+1 = 7 and 5+10+10 = 25." },
      { title: "Variadic with explicit arity", detail: "`(...nums) => …` has `length` 0, so we pass `3` explicitly; otherwise `sumAll(1)` would fire immediately and return 1." },
    ],
    followUps: [
      { q: "Implement `sum(1)(2)(3)()` that returns 6 for any number of calls.", a: "Return a function that accumulates while it receives an argument and returns the total when called with none: `const sum = (a) => (b) => b === undefined ? a : sum(a + b);`. The empty call is the terminator. Alternatives override `valueOf`/`Symbol.toPrimitive` so the function coerces to the total, but that relies on implicit coercion and is fragile." },
      { q: "What is the difference between currying and `bind`?", a: "`bind` does one-shot partial application (and fixes `this`): `add3.bind(null, 1)` returns a function waiting for the *rest* of the arguments in one call. Currying produces a chain that can keep accepting arguments over many calls until the arity is met." },
      { q: "Why does `curry` use `fn.apply(this, args)` instead of `fn(...args)`?", a: "So the curried function still works as a method. If you put a curried function on an object and call `obj.method(1)(2)`, the first call's `this` is `obj`; the inner arrows inherit it lexically and `apply` forwards it to the original function." },
      { q: "Where is currying actually useful in real code?", a: "Configuring reusable functions (`const logError = log('error')`), building predicates for `filter` (`users.filter(hasRole('admin'))`), Redux-style middleware signatures `store => next => action`, and point-free composition with `pipe`/`compose`." },
    ],
    pitfalls: [
      "Relying on `fn.length` for functions with default or rest parameters — it under-reports arity.",
      "Mutating a shared args array inside the closure, so reused partials leak arguments into each other.",
      "Confusing currying with partial application in an interview — define both briefly.",
      "Over-currying hot paths: each step allocates a function and an array.",
    ],
    glossary: [
      { term: "Arity", definition: "How many arguments a function expects. In JS, `fn.length` reports the declared parameters before the first default/rest parameter." },
      { term: "Partial application", definition: "Fixing some of a function's arguments now and supplying the rest later, producing a function of fewer arguments." },
      { term: "Closure", definition: "A function together with the variables from the scope where it was created, which it keeps access to after that scope has finished." },
      { term: "Point-free style", definition: "Writing functions by combining other functions without naming their arguments, e.g. `const shout = pipe(trim, toUpper)`." },
    ],
    relatedLessons: ["javascript/currying", "javascript/closures", "javascript/higher-order-functions"],
    relatedQuestions: ["js-02", "js-08", "js-26", "js-36"],
    sources: [],
  },

  // ───────────────────────────────────────────────────────────── 28
  {
    id: "js-28",
    track: "javascript",
    number: 28,
    question: "What are generators in JavaScript, and how do `function*` and `yield` work?",
    level: "intermediate",
    frequency: "medium",
    tags: ["generators", "iterators", "control-flow", "es2015"],
    shortAnswer:
      "A generator is a function declared with `function*` that can **pause** in the middle and **resume** later. Calling it does not run the body; it returns a generator object, which is an iterator. Each `next()` runs the body until the next `yield`, hands out that value as `{ value, done: false }`, and freezes the function's local state. The next `next()` picks up right where it left off.\n\nCommunication is two-way: the argument you pass to `next(x)` becomes the result of the paused `yield` expression. You can also call `return()` to finish it early or `throw()` to inject an error at the pause point. Generators make lazy sequences, infinite streams and custom iterables trivial, and they were the building block libraries like `co` used for async flow before `async/await`.",
    deep: [
      { type: "p", text: "**Intuition.** A normal function is a phone call: once it starts it talks until it hangs up. A generator is a conversation by letter: it writes one reply (`yield`), waits for your next letter (`next()`), and continues from the same sentence." },
      { type: "steps", steps: [
        { title: "Call → suspendedStart", detail: "`const g = gen()` creates a generator object with its own execution context, but runs **no** body code yet." },
        { title: "next() → run to yield", detail: "The context is pushed on the call stack and runs until a `yield`. The yielded value is returned as `{ value, done: false }` and the context is popped *without being destroyed* (state `suspendedYield`)." },
        { title: "next(x) → resume", detail: "The paused `yield` expression evaluates to `x`. The *first* `next(x)` argument is ignored because no `yield` is waiting yet." },
        { title: "return / end", detail: "Reaching `return v` (or the end) produces `{ value: v, done: true }`. Afterwards every `next()` returns `{ value: undefined, done: true }`." },
      ] },
      { type: "table", head: ["Method", "Effect at the paused yield"], rows: [
        ["`next(v)`", "`yield` evaluates to `v`; run to the next `yield`/`return`"],
        ["`return(v)`", "Acts like a `return v` at that point; `finally` blocks still run"],
        ["`throw(err)`", "Acts like `throw err` at that point; can be caught by `try/catch` inside the generator"],
      ] },
      { type: "p", text: "**`yield*`** delegates to another iterable: it forwards `next/throw/return` to the inner iterator and evaluates to the inner generator's `return` value. Generator objects are themselves iterable (`g[Symbol.iterator]() === g`), so they work with `for...of`, spread and destructuring — but `for...of` ignores the final `return` value." },
      { type: "viz", id: "js-async-await", caption: "Async functions reuse the same suspend/resume machinery; generators let *you* drive the resumption." },
      { type: "callout", tone: "spec-vs-impl", title: "How engines suspend", text: "The spec models suspension as saving the generator's execution context. Engines implement it differently: V8 compiles generators into a resumable state machine and stores live registers in the generator object when it yields. That is why a paused generator costs memory proportional to its live locals, not a whole OS thread." },
      { type: "list", items: [
        "A generator object is **single-use**: once `done`, it stays done. Re-call the generator function for a fresh run.",
        "`break` in `for...of` calls `return()` on the generator, so its `finally` blocks run (cleanup works).",
        "Arrow functions cannot be generators; there is no `*` arrow syntax.",
        "Calling `next()` re-entrantly from inside the running generator throws `TypeError` (already running).",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      caption: "Pausing, resuming and passing values back into a generator",
      code: `function* conversation() {
  console.log('started');
  const x = yield 1;          // pause here; resumes with next(...)'s argument
  console.log('received', x);
  yield x * 2;
  return 'done';
}

const show = (r) => console.log(r.value, r.done);
const g = conversation();       // nothing printed yet
show(g.next('ignored'));        // first next() argument is ignored
show(g.next(21));
show(g.next());
show(g.next());

function* naturals() { let n = 1; while (true) yield n++; }
function* take(iter, k) { for (const v of iter) { if (k-- <= 0) return; yield v; } }
console.log([...take(naturals(), 5)].join(' '));`,
      output: `started
1 false
received 21
42 false
done true
undefined true
1 2 3 4 5`,
    },
    walkthrough: [
      { title: "conversation()", detail: "Creates the generator object. The body has not run, so `started` is not printed yet." },
      { title: "next('ignored')", detail: "Runs the body: prints `started`, hits `yield 1`, pauses. Returns `{ value: 1, done: false }`. The argument is dropped because no `yield` was waiting." },
      { title: "next(21)", detail: "The paused `yield 1` evaluates to 21, so `x = 21`. Prints `received 21`, then pauses at `yield 42`." },
      { title: "next()", detail: "Resumes, reaches `return 'done'` → `{ value: 'done', done: true }`." },
      { title: "next() again", detail: "The generator is finished: `{ value: undefined, done: true }`." },
      { title: "Infinite but lazy", detail: "`naturals()` never ends, but `take` pulls only five values. When `take` returns, `for...of` calls `naturals`'s `return()`, closing it." },
    ],
    followUps: [
      { q: "How could you build `async/await` out of generators?", a: "Write a runner that calls `gen.next()`, and whenever the yielded value is a promise, waits for it and resumes with `gen.next(result)` (or `gen.throw(err)` on rejection). That is exactly what the `co` library did and what transpilers emitted for `async` functions before engines supported them natively." },
      { q: "Why is the first argument to `next()` ignored?", a: "The first `next()` *starts* the body; there is no paused `yield` expression to receive a value yet. If you need an initial value, pass it as an argument to the generator function itself." },
      { q: "What happens to `finally` blocks if a consumer breaks out of `for...of`?", a: "`for...of` calls the iterator's `return()` method, which resumes the generator as if a `return` happened at the paused `yield`. Pending `finally` blocks run, so resource cleanup is reliable." },
      { q: "When would you use a generator in production code?", a: "Lazy pipelines over large or infinite data, custom iterables for data structures (trees, ranges), pagination helpers, and state machines like Redux-Saga effects. For async streams use async generators (`async function*`)." },
    ],
    pitfalls: [
      "Expecting `gen()` to run the body — it only creates the generator object.",
      "Reusing an exhausted generator object and getting nothing back.",
      "Expecting `for...of` or spread to include the `return` value — they stop at `done: true` and drop it.",
      "Spreading an infinite generator (`[...naturals()]`) hangs the thread.",
    ],
    glossary: [
      { term: "Generator object", definition: "The object returned by calling a `function*`. It is both an iterator (has `next`) and an iterable (has `[Symbol.iterator]`)." },
      { term: "yield", definition: "An expression that pauses a generator, hands a value to the caller and later evaluates to whatever the caller passes to `next()`." },
      { term: "Lazy evaluation", definition: "Computing values only when they are requested, instead of all up front." },
      { term: "Execution context", definition: "The engine's record of a running function: its variables, `this`, and where it is in the code." },
    ],
    relatedLessons: ["javascript/generators-iterators", "javascript/async-iteration", "javascript/async-await"],
    relatedQuestions: ["js-45", "js-44", "js-07", "js-19"],
    sources: [],
  },

  // ───────────────────────────────────────────────────────────── 29
  {
    id: "js-29",
    track: "javascript",
    number: 29,
    question: "How does `this` work inside arrow functions, and how is that different from regular functions?",
    level: "intermediate",
    frequency: "medium",
    tags: ["this", "arrow-functions", "scope"],
    shortAnswer:
      "Arrow functions don't have their own `this`. They use the `this` of the scope where they were **written** — it's resolved lexically, like any other variable from an outer scope. A regular function's `this` is decided by **how it is called**: `obj.method()` gives `obj`, a plain call gives `undefined` in strict mode, `new` gives the new object, and `call/apply/bind` set it explicitly.\n\nBecause an arrow's `this` is captured at creation, `call`, `apply` and `bind` can't change it, and arrows can't be used with `new`. That's why arrows are perfect for callbacks inside methods — `setTimeout(() => this.tick())` keeps the instance — but a bad choice for object methods or prototype methods, where you *want* `this` to be the receiver.",
    deep: [
      { type: "p", text: "**Overlap note.** This topic overlaps with js-03 (`this` in general) and js-16 (arrow functions in general). Here the emphasis is narrow: *only* the `this` behaviour of arrows, why it exists, and the bugs it causes or fixes." },
      { type: "viz", id: "js-this", caption: "Regular functions get `this` from the call site; arrows look it up in the enclosing scope." },
      { type: "compare", items: [
        { title: "Regular function", points: ["`this` set per call (call-site rule)", "Changed by `call/apply/bind`", "Can be a constructor with `new`", "Has its own `arguments`, `super`, `new.target`"] },
        { title: "Arrow function", points: ["No own `this`; uses the enclosing scope's `this`", "`call/apply/bind` cannot change `this` (extra args still passed)", "`new` throws `TypeError` (no `[[Construct]]`)", "No own `arguments`, `super`, `new.target` either — all lexical"] },
      ] },
      { type: "p", text: "**Precise mechanics.** In spec terms an arrow function's `[[ThisMode]]` is *lexical*. Its function environment has no `this` binding, so a `this` reference walks outward through environments until it finds one that does — the nearest enclosing regular function, class field initializer, module (`undefined`) or script (the global object)." },
      { type: "list", items: [
        "**Class fields:** `handle = () => this.x` creates a *per-instance* arrow whose `this` is the instance — popular for React class handlers, but each instance gets its own copy (more memory, not on the prototype, invisible to `super`).",
        "**Object literal methods:** `{ name: 'a', get: () => this.name }` — the object literal does not create a scope, so `this` is the outer `this` (often `undefined` in modules or `globalThis` in scripts), not the object.",
        "**Event listeners:** with a regular function, `this` is the element (`event.currentTarget`); with an arrow it is not.",
        "**Prototype methods:** `Foo.prototype.bar = () => this` never sees the instance.",
      ] },
      { type: "callout", tone: "misconception", title: "\"Arrows bind this to the object they are defined in\"", text: "They bind to the **scope** they are defined in, and object literals are not scopes. Only functions, classes (for field initializers), modules and scripts provide a `this`." },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      caption: "Regular vs arrow `this` (strict mode)",
      code: `'use strict';
const counter = {
  count: 0,
  makeRegular() { return function () { return this; }; },
  makeArrow() { return () => this.count; },
};

const regular = counter.makeRegular();
const arrow = counter.makeArrow();

console.log(regular());                    // plain call → undefined in strict mode
console.log(arrow());                      // lexical this = counter
console.log(arrow.call({ count: 99 }));    // call cannot rebind an arrow
console.log(arrow.bind({ count: 7 })());   // neither can bind

const timer = {
  ticks: 0,
  start() {
    [1, 2, 3].forEach(() => this.ticks++); // arrow keeps 'timer'
    return this.ticks;
  },
};
console.log(timer.start());

try { new arrow(); } catch (e) { console.log(e.constructor.name); }`,
      output: `undefined
0
0
0
3
TypeError`,
    },
    walkthrough: [
      { title: "makeRegular()", detail: "Returns an anonymous regular function. Its `this` is not decided until it is called." },
      { title: "regular()", detail: "Called with no receiver in strict mode → `this` is `undefined`." },
      { title: "makeArrow()", detail: "Called as `counter.makeArrow()`, so inside it `this === counter`. The arrow created there captures that `this` permanently." },
      { title: "arrow.call / bind", detail: "The `thisArg` is ignored because the arrow has no `this` binding to set; it still reads `counter.count` → 0." },
      { title: "forEach with arrow", detail: "The arrow inside `start` uses `start`'s `this` (`timer`), so all three increments hit `timer.ticks` → 3. With a regular function callback, `this` would be `undefined` and `this.ticks++` would throw." },
      { title: "new arrow()", detail: "Arrows have no `[[Construct]]` internal method → `TypeError`." },
    ],
    followUps: [
      { q: "What does `this` refer to in an arrow at the top level of an ES module vs a classic script?", a: "In a module, top-level `this` is `undefined`, so the arrow sees `undefined`. In a classic script, top-level `this` is the global object (`window`, or the worker's global scope). In CommonJS, top-level `this` is `module.exports`." },
      { q: "Why is `class A { handle = () => this.x }` both popular and criticised?", a: "Popular because `handle` can be passed as a callback without `bind`. Criticised because each instance allocates its own function, it lives on the instance not the prototype (so subclasses can't call it via `super.handle()`), and it is harder to mock/spy on via the prototype." },
      { q: "Can you get the `arguments` object inside an arrow?", a: "Not its own — `arguments` inside an arrow refers to the enclosing regular function's `arguments` (or is a `ReferenceError` at module top level). Use rest parameters `(...args) => …` instead." },
      { q: "How was this problem solved before ES2015?", a: "With `var self = this;` captured in a closure, or `function () { … }.bind(this)`. Arrows are essentially built-in syntax for the `self = this` pattern." },
    ],
    pitfalls: [
      "Using arrows as object-literal or prototype methods and getting the outer `this`.",
      "Expecting `bind`/`call` to fix an arrow's `this`.",
      "Using an arrow as a DOM event handler and then reading `this` as the element.",
      "Assuming arrows are always faster or always better — they are just different binding rules.",
    ],
    glossary: [
      { term: "Lexical this", definition: "`this` taken from the surrounding code where the function was written, not from how it is called." },
      { term: "Call site", definition: "The place and form of a function call (`obj.f()`, `f()`, `new f()`), which decides a regular function's `this`." },
      { term: "Receiver", definition: "The object a method is called on — the `obj` in `obj.method()`." },
      { term: "[[Construct]]", definition: "The spec's internal method that makes a function usable with `new`. Arrows and methods don't have it." },
    ],
    relatedLessons: ["javascript/arrow-functions", "javascript/this-binding", "javascript/call-apply-bind"],
    relatedQuestions: ["js-03", "js-16", "js-23", "js-49"],
    sources: [],
  },
  // ───────────────────────────────────────────────────────────── 30
  {
    id: "js-30",
    track: "javascript",
    number: 30,
    question: "What are Symbols in JavaScript, and when would you use them?",
    level: "intermediate",
    frequency: "medium",
    tags: ["symbols", "primitives", "metaprogramming", "es2015"],
    shortAnswer:
      "A Symbol is a primitive type whose values are **guaranteed unique**: `Symbol('id') !== Symbol('id')` even with the same description. The description is just a label for debugging.\n\nTheir main job is to be property keys that can't collide with anyone else's keys. Symbol-keyed properties are skipped by `for...in`, `Object.keys` and `JSON.stringify`, so they're handy for attaching metadata to objects you don't own. They're *not* private, though — `Object.getOwnPropertySymbols` and `Reflect.ownKeys` reveal them.\n\nTwo other things: `Symbol.for('key')` uses a global registry so the same key returns the same symbol across files and realms, and **well-known symbols** like `Symbol.iterator`, `Symbol.asyncIterator` and `Symbol.toPrimitive` are hooks that let your objects plug into language features.",
    deep: [
      { type: "p", text: "**Intuition.** A string key is like writing a name on a shared whiteboard — anyone writing the same name overwrites you. A symbol is like a unique key cut just for you; only code that holds that exact key object can open that slot." },
      { type: "table", head: ["Kind", "Created by", "Identity"], rows: [
        ["Local symbol", "`Symbol('desc')`", "Unique every call; not shared"],
        ["Registered symbol", "`Symbol.for('key')`", "One per key in a cross-realm global registry; `Symbol.keyFor(sym)` returns the key"],
        ["Well-known symbol", "Built in: `Symbol.iterator`, `Symbol.hasInstance`, …", "Same across realms; used by the language as protocol hooks"],
      ] },
      { type: "list", items: [
        "**Hidden from enumeration:** `for...in`, `Object.keys`, `Object.entries`, `JSON.stringify` ignore symbol keys. `Object.assign` and object spread **do** copy enumerable own symbol keys.",
        "**Not coerced implicitly:** `'id: ' + sym` throws `TypeError`; use `String(sym)` or `sym.description`.",
        "**Not a constructor:** `new Symbol()` throws `TypeError` (prevents accidental wrapper objects).",
        "**typeof** is `'symbol'`; symbols are primitives, compared by identity.",
      ] },
      { type: "table", head: ["Well-known symbol", "Lets you customise"], rows: [
        ["`Symbol.iterator`", "`for...of`, spread, destructuring"],
        ["`Symbol.asyncIterator`", "`for await...of`"],
        ["`Symbol.toPrimitive`", "How an object converts to number/string"],
        ["`Symbol.hasInstance`", "The result of `instanceof`"],
        ["`Symbol.toStringTag`", "The tag in `Object.prototype.toString` output"],
      ] },
      { type: "callout", tone: "misconception", title: "Symbols are not privacy", text: "They prevent *accidental* collisions and hide keys from casual enumeration, but anyone can list them with `Reflect.ownKeys`. For true privacy use `#private` class fields or a module-scoped `WeakMap`." },
      { type: "callout", tone: "spec-vs-impl", title: "Symbols as WeakMap keys (ES2023)", text: "Since ES2023, non-registered symbols can be `WeakMap`/`WeakSet`/`WeakRef` targets; registered ones (`Symbol.for`) cannot, because they can be recreated from their key and so never become unreachable. Check engine support before relying on it." },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `const id = Symbol('id');
const user = { name: 'Ada', [id]: 42 };

console.log(user[id]);
console.log(JSON.stringify(Object.keys(user)));
console.log(JSON.stringify(user));
console.log(Object.getOwnPropertySymbols(user).length);

console.log(Symbol('id') === Symbol('id'));
console.log(Symbol.for('app') === Symbol.for('app'));
console.log(id.description, String(id));

try { console.log('key: ' + id); } catch (e) { console.log(e.constructor.name); }

const money = {
  amount: 5,
  [Symbol.toPrimitive](hint) { return hint === 'number' ? this.amount : '$' + this.amount; },
};
console.log(+money, String(money));`,
      output: `42
["name"]
{"name":"Ada"}
1
false
true
id Symbol(id)
TypeError
5 $5`,
    },
    walkthrough: [
      { title: "Computed symbol key", detail: "`[id]: 42` stores a property whose key is the symbol itself, not the string `'id'`." },
      { title: "Enumeration", detail: "`Object.keys` and `JSON.stringify` only see string keys, so the symbol property is invisible to them." },
      { title: "getOwnPropertySymbols", detail: "The reflection API still finds it — symbols hide keys, they do not protect them." },
      { title: "Identity", detail: "Two `Symbol('id')` calls produce different values; `Symbol.for('app')` looks up the global registry and returns the same symbol both times." },
      { title: "Coercion", detail: "String concatenation with a symbol throws `TypeError`; explicit `String(id)` returns `'Symbol(id)'`." },
      { title: "Symbol.toPrimitive", detail: "Unary `+` requests hint `'number'` → 5. `String(money)` requests `'string'` → `'$5'`." },
    ],
    followUps: [
      { q: "Does `Object.assign` copy symbol-keyed properties?", a: "Yes. `Object.assign` and object spread copy all *own enumerable* properties, including symbol keys. Only `JSON.stringify`, `for...in`, `Object.keys/values/entries` skip them." },
      { q: "When would you use `Symbol.for` instead of `Symbol()`?", a: "When different modules, bundles or realms (e.g. an iframe) must agree on the same key without sharing a variable — React uses `Symbol.for('react.element')` to mark elements so copies of React can recognise each other's objects." },
      { q: "How would you make an object work with `for...of`?", a: "Implement a `[Symbol.iterator]()` method returning an iterator object with `next()` (see js-45). Generators make this a one-liner: `*[Symbol.iterator]() { yield* this.items; }`." },
      { q: "Are symbols garbage collected?", a: "Local symbols are values like any other and can be collected when unreachable. Registered symbols live in the global registry, which is why they are not allowed as weak keys." },
    ],
    pitfalls: [
      "Treating symbol properties as private data.",
      "Concatenating a symbol into a string and getting a `TypeError`.",
      "Expecting symbol-keyed data to survive `JSON.stringify` round trips.",
      "Using `Symbol('x')` in two files and expecting them to match — use `Symbol.for` or export the symbol.",
    ],
    glossary: [
      { term: "Primitive", definition: "A basic immutable value that is not an object: string, number, bigint, boolean, undefined, null, symbol." },
      { term: "Global symbol registry", definition: "A runtime-wide table mapping string keys to symbols, used by `Symbol.for` and `Symbol.keyFor`." },
      { term: "Well-known symbol", definition: "A built-in symbol the language itself looks up to let objects customise behaviour, such as `Symbol.iterator`." },
      { term: "Realm", definition: "A separate JavaScript global environment (its own `Array`, `Object`, …), e.g. an iframe or a worker." },
    ],
    relatedLessons: ["javascript/symbols", "javascript/generators-iterators", "javascript/data-types"],
    relatedQuestions: ["js-12", "js-45", "js-39"],
    sources: [],
  },

  // ───────────────────────────────────────────────────────────── 31
  {
    id: "js-31",
    track: "javascript",
    number: 31,
    question: "How does inheritance work with ES6 classes (`extends` and `super`)?",
    level: "intermediate",
    frequency: "medium",
    tags: ["classes", "inheritance", "prototypes", "oop"],
    shortAnswer:
      "ES6 classes are mostly cleaner syntax over prototypes. `class Dog extends Animal` sets up **two** prototype links: `Dog.prototype` inherits from `Animal.prototype`, so instances get the parent's methods, and `Dog` itself inherits from `Animal`, so static members are inherited too.\n\nIn a derived class the constructor must call `super(...)` before touching `this`, because the **parent** constructor is the one that actually creates the object. `super.method()` calls the parent's version of a method, which is how you extend behaviour instead of replacing it.\n\nClasses add some real semantics over old constructor functions: they must be called with `new`, their bodies are strict mode, methods are non-enumerable, they're in the TDZ until defined, and they support `#private` fields and `static` blocks.",
    deep: [
      { type: "p", text: "**Overlap note.** js-04 covers prototypal inheritance itself. This question is about how the `class` syntax maps onto that machinery, plus the pieces that are genuinely new (derived-constructor rules, `super`, private fields)." },
      { type: "flow", nodes: ["dog instance", "Dog.prototype", "Animal.prototype", "Object.prototype", "null"], caption: "Instance-side [[Prototype]] chain created by `extends`" },
      { type: "flow", nodes: ["Dog (constructor)", "Animal (constructor)", "Function.prototype"], caption: "Constructor-side chain — this is why static members are inherited" },
      { type: "steps", steps: [
        { title: "new Dog('Rex')", detail: "A derived constructor does **not** create `this` itself. `this` is in a TDZ-like uninitialised state." },
        { title: "super(name, 'woof')", detail: "Calls `Animal` as a constructor with `new.target === Dog`, so the object it allocates gets `Dog.prototype` as its prototype. The returned object becomes `this`." },
        { title: "Fields initialise", detail: "Immediately after `super()` returns, `Dog`'s own class fields are defined on `this`. (In a base class, fields initialise at the start of the constructor.)" },
        { title: "Rest of constructor", detail: "Now `this.tricks = []` is allowed. Using `this` before `super()` throws `ReferenceError`." },
      ] },
      { type: "p", text: "**`super` is static.** `super.method()` is resolved via the method's *home object* (the object it was defined on), not via `this`. It looks up `Object.getPrototypeOf(HomeObject)` and calls the method with the current `this`. That is why copying a method to another object doesn't change what `super` refers to." },
      { type: "list", items: [
        "**Private fields** (`#sound`) are per-class: a subclass cannot read the parent's `#sound`; it must use a parent method.",
        "**Extending built-ins** (`class MyArr extends Array`) works properly with `class` syntax because the built-in constructor allocates the exotic object; with ES5 functions it didn't.",
        "**`extends null`** and `extends` any expression (`extends mixin(Base)`) are allowed — the basis of class-mixins (js-47).",
        "Returning an object from a constructor replaces `this` — legal, but rarely a good idea.",
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Not *just* sugar", text: "Classes compile to prototype structures, but some semantics can't be reproduced with ES5 functions alone: the `new`-only check, derived-constructor `this` allocation (needed to subclass `Array`/`Error` properly), true `#private` fields and `super` home objects. Transpilers approximate some of these." },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `class Animal {
  static count = 0;
  #sound;
  constructor(name, sound) {
    this.name = name;
    this.#sound = sound;
    Animal.count++;
  }
  speak() { return this.name + ' says ' + this.#sound; }
}

class Dog extends Animal {
  constructor(name) {
    super(name, 'woof');     // must come before using 'this'
    this.tricks = [];
  }
  speak() { return super.speak() + '!'; }
}

const d = new Dog('Rex');
console.log(d.speak());
console.log(Object.getPrototypeOf(Dog.prototype) === Animal.prototype);
console.log(Object.getPrototypeOf(Dog) === Animal);
console.log(d instanceof Animal, Animal.count, Dog.count);
console.log(typeof Dog, Object.keys(d).join(','));

try { Dog('Max'); } catch (e) { console.log(e.constructor.name); }`,
      output: `Rex says woof!
true
true
true 1 1
function name,tricks
TypeError`,
    },
    walkthrough: [
      { title: "new Dog('Rex')", detail: "Dog's constructor runs, but `this` is not yet available." },
      { title: "super(name, 'woof')", detail: "Animal's constructor allocates the object (prototype `Dog.prototype`), sets `name` and the private `#sound`, increments `Animal.count` to 1." },
      { title: "this.tricks = []", detail: "Now legal. Own enumerable keys are `name` and `tricks`; `#sound` is private and never appears in `Object.keys`." },
      { title: "d.speak()", detail: "Finds `Dog.prototype.speak`, which calls `super.speak()` → `Animal.prototype.speak` with `this = d` → `'Rex says woof'`, then appends `'!'`." },
      { title: "Dog.count", detail: "Not an own property of `Dog`; lookup follows `Dog`'s prototype (`Animal`) and finds `Animal.count` = 1." },
      { title: "Dog('Max')", detail: "Class constructors throw `TypeError` when called without `new`." },
    ],
    followUps: [
      { q: "What happens if a derived class has no constructor?", a: "It gets a default one equivalent to `constructor(...args) { super(...args); }`, forwarding all arguments to the parent." },
      { q: "Why must `super()` be called before `this` in a derived constructor?", a: "Because the parent constructor is responsible for creating the object (important for built-ins like `Array` and `Error` which need special internal slots). Until it returns, there is no `this` to use, so accessing it throws `ReferenceError`." },
      { q: "If you increment `Dog.count++`, what happens?", a: "It reads the inherited `Animal.count` (1) and then **creates an own** `Dog.count` property set to 2 — `Animal.count` stays 1. Static inheritance is prototype lookup, and assignment creates an own property on the target." },
      { q: "How do you call a parent's static method from a child's static method?", a: "`super.method()` inside a `static` method refers to the parent constructor's statics, because the static method's home object is `Dog` and `Dog`'s prototype is `Animal`." },
      { q: "How would you write this without classes?", a: "`function Dog(name) { Animal.call(this, name, 'woof'); }` then `Dog.prototype = Object.create(Animal.prototype); Dog.prototype.constructor = Dog; Object.setPrototypeOf(Dog, Animal);` — the last line is the static inheritance most people forget." },
    ],
    pitfalls: [
      "Accessing `this` before `super()` in a derived constructor (`ReferenceError`).",
      "Expecting a subclass to access the parent's `#private` fields.",
      "Assuming class declarations are hoisted like function declarations — they are in the TDZ until evaluated.",
      "Passing class methods as callbacks and losing `this` (methods are not auto-bound).",
      "Mutating an inherited static and expecting the parent to change.",
    ],
    glossary: [
      { term: "Derived class", definition: "A class declared with `extends`; its constructor must call `super()`." },
      { term: "Home object", definition: "The object a method was defined on; `super` lookups start from its prototype." },
      { term: "TDZ (temporal dead zone)", definition: "The period between entering a scope and a `let`/`const`/`class` declaration being evaluated, during which accessing the name throws." },
      { term: "new.target", definition: "Inside a constructor, the constructor that `new` was originally applied to — lets a base class know which subclass is being built." },
    ],
    relatedLessons: ["javascript/classes-inheritance", "javascript/prototypes", "javascript/mixins"],
    relatedQuestions: ["js-04", "js-47", "js-46"],
    sources: [],
  },

  // ───────────────────────────────────────────────────────────── 32
  {
    id: "js-32",
    track: "javascript",
    number: 32,
    question: "What causes memory leaks in JavaScript applications, and how do you find and fix them?",
    level: "advanced",
    frequency: "medium",
    tags: ["memory", "garbage-collection", "performance", "debugging"],
    shortAnswer:
      "JavaScript is garbage collected using **reachability**: anything that can be reached from roots — globals, the current call stack, active closures, pending timers and listeners — is kept; everything else can be freed. So a leak in JS isn't forgotten `free()`; it's memory you no longer *need* but that's still *reachable*.\n\nThe classic causes are: forgotten `setInterval`s or event listeners whose callbacks close over big data, unbounded caches or `Map`s used as caches, accidental globals, detached DOM nodes still referenced from JS, and long-lived closures holding large objects.\n\nTo find them I reproduce the action several times, take heap snapshots in DevTools (or Node with `--inspect`), compare them, and look at the **retainers** path to see what's keeping objects alive. Fixes are usually: clean up in teardown (`removeEventListener`, `clearInterval`, `AbortController`), bound caches (LRU), or use `WeakMap`/`WeakRef` for metadata keyed by objects.",
    deep: [
      { type: "p", text: "**Intuition.** The garbage collector is a cleaner who throws away anything nobody can reach. A leak is a box you'll never open again but are still holding by a string — the cleaner can't touch it." },
      { type: "steps", steps: [
        { title: "Roots", detail: "Global object, the call stack's local variables, the microtask/task queues, registered timers and event listeners, and host-held references (e.g. the DOM tree)." },
        { title: "Mark", detail: "The collector traverses every reference from the roots and marks reachable objects." },
        { title: "Sweep / compact", detail: "Unmarked objects are reclaimed. Cycles that are unreachable from roots are collected too — reference counting is not used, so `a.b = b; b.a = a` alone is **not** a leak." },
      ] },
      { type: "viz", id: "js-references", caption: "Objects stay alive while some reference chain from a root reaches them." },
      { type: "table", head: ["Leak pattern", "Why it stays reachable", "Fix"], rows: [
        ["Forgotten `setInterval`", "Timer list → callback → closure → data", "`clearInterval` on teardown"],
        ["Listeners never removed", "Emitter/element → listener → closure", "`removeEventListener`, `{ once: true }`, or `{ signal }` with `AbortController`"],
        ["Unbounded cache / Map", "Module-level Map → every value ever stored", "LRU/TTL limit, or `WeakMap` keyed by object"],
        ["Detached DOM nodes", "JS variable → removed element → its subtree", "Null the reference; avoid caching nodes"],
        ["Accidental globals", "`x = …` without declaration in sloppy mode → global object", "Strict mode / modules, linting"],
        ["Closures capturing too much", "Long-lived callback keeps a big outer variable", "Copy only what you need into the closure"],
        ["Pending promises", "A promise that never settles keeps its handlers' closures", "Timeouts, `AbortSignal`, settle every promise"],
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "V8's collector", text: "The spec says nothing about *how* or *when* memory is reclaimed. V8 (Chrome, Node) uses a generational collector: a fast scavenger for the young generation and concurrent/incremental mark-compact for the old generation (the \"Orinoco\" project). Collection timing is non-deterministic, so never rely on it for program logic." },
      { type: "list", items: [
        "**Find it:** DevTools Memory panel → heap snapshot → do the action N times → snapshot again → 'Comparison' view; look for counts growing by N. Use the 'Retainers' pane to see the path keeping an object alive. Search 'Detached' for detached DOM trees.",
        "**Node:** `node --inspect` + Chrome DevTools, `process.memoryUsage()`, `--heapsnapshot-signal`, or `v8.writeHeapSnapshot()`.",
        "**Confirm:** memory that grows and *never* returns to baseline after GC (sawtooth rising over time) suggests a leak; a high but stable plateau usually doesn't.",
        "**DevTools itself:** objects you `console.log` stay reachable while the console is open — don't misdiagnose that.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      caption: "A listener leak: each 'mount' subscribes but never unsubscribes",
      code: `class Emitter {
  constructor() { this.listeners = new Set(); }
  on(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);  // unsubscribe function
  }
}

const bus = new Emitter();

function mountWidget() {
  const bigData = new Array(100000).fill('x');   // captured by the listener
  return bus.on(() => bigData.length);
}

for (let i = 0; i < 3; i++) mountWidget();      // leak: return value ignored
console.log('leaky listeners:', bus.listeners.size);

bus.listeners.clear();
for (let i = 0; i < 3; i++) {
  const off = mountWidget();
  off();                                         // teardown removes the reference
}
console.log('fixed listeners:', bus.listeners.size);`,
      output: `leaky listeners: 3
fixed listeners: 0`,
    },
    walkthrough: [
      { title: "mountWidget()", detail: "Allocates a 100k-element array and registers a listener closure that references it." },
      { title: "Leaky loop", detail: "The unsubscribe function is discarded, so `bus` (a long-lived module object) → Set → listener → closure → `bigData`. Three arrays stay reachable forever." },
      { title: "Fixed loop", detail: "Calling `off()` deletes the listener from the Set. Nothing references the closure any more, so the closure and its array become garbage." },
      { title: "In real apps", detail: "The same shape appears as a React effect without cleanup, a `window.addEventListener('resize', …)` in a component, or a WebSocket handler that is never removed." },
    ],
    followUps: [
      { q: "Can circular references cause leaks in modern JS?", a: "Not by themselves. Mark-and-sweep reclaims cycles that are unreachable from roots. Old IE had leaks from cycles *between* JS objects and COM-based DOM objects because the DOM used reference counting — that is historical." },
      { q: "How does `AbortController` help with listener cleanup?", a: "Pass `{ signal: controller.signal }` to several `addEventListener` calls; one `controller.abort()` removes them all. It also cancels `fetch` calls sharing the signal, so a component can tear down everything in one place." },
      { q: "When is `WeakRef` appropriate?", a: "For caches where you'd like to reuse an object if it still exists but don't want to keep it alive, typically paired with `FinalizationRegistry` to clean up map entries. GC timing is unpredictable, so code must work whether or not the target was collected. Prefer `WeakMap` when the lifetime should follow a key object." },
      { q: "How do you tell a leak from normal high memory usage?", a: "Force or wait for GC and check whether usage returns to a baseline. Repeat an action N times: if retained object counts grow linearly with N and never drop, it's a leak; a stable plateau is just working-set size." },
    ],
    pitfalls: [
      "Thinking `delete obj.prop` or setting a local to `null` frees memory immediately — it only removes one reference.",
      "Using a plain `Map`/object as a cache keyed by objects with no eviction.",
      "Forgetting cleanup in component teardown (React effects, Angular `ngOnDestroy`, Vue `unmounted`).",
      "Misreading DevTools: retained-by-console objects and 'shallow' vs 'retained' size.",
    ],
    glossary: [
      { term: "Garbage collection (GC)", definition: "Automatic reclamation of memory the program can no longer reach." },
      { term: "Root", definition: "A starting reference the GC always treats as alive, like global variables or the current call stack." },
      { term: "Retainer", definition: "An object holding a reference that keeps another object alive; the 'retainers path' explains why something wasn't collected." },
      { term: "Detached DOM node", definition: "An element removed from the page but still referenced from JavaScript, so it can't be freed." },
      { term: "Heap snapshot", definition: "A dump of all objects in memory and their references at one moment, used to diagnose leaks." },
    ],
    relatedLessons: ["javascript/memory-leaks-gc", "javascript/weakmap-weakset", "javascript/closures", "javascript/timers"],
    relatedQuestions: ["js-39", "js-02", "js-38", "js-20"],
    sources: [],
  },

  // ───────────────────────────────────────────────────────────── 33
  {
    id: "js-33",
    track: "javascript",
    number: 33,
    question: "What is a Proxy in JavaScript, and what can you do with it?",
    level: "advanced",
    frequency: "medium",
    tags: ["proxy", "metaprogramming", "reflect", "reactivity"],
    shortAnswer:
      "A `Proxy` wraps a target object and lets you intercept fundamental operations on it — reading a property, writing one, `in`, `delete`, listing keys, calling a function, `new` — through **trap** functions on a handler object: `new Proxy(target, { get, set, … })`. Any trap you don't define falls through to the target.\n\nIt's used for validation, default values, logging and access control, negative array indexes, and most famously reactivity: Vue 3 and MobX track which properties a component reads in `get` and trigger re-renders in `set`. Traps usually forward to the target with the matching `Reflect` method, like `Reflect.set(target, key, value, receiver)`.\n\nThe catches: proxies cost performance, the proxy isn't `===` to its target, and objects with internal slots like `Map`, `Date` or class `#private` fields break when methods run with the proxy as `this`.",
    deep: [
      { type: "p", text: "**Intuition.** A proxy is a receptionist in front of an office. Every visitor (property access, assignment, call) goes through the receptionist, who can log them, turn them away, redirect them, or let them straight through." },
      { type: "table", head: ["Trap", "Intercepts"], rows: [
        ["`get` / `set`", "`p.x`, `p.x = v` (including inherited lookups that reach the proxy)"],
        ["`has`", "`'x' in p`"],
        ["`deleteProperty`", "`delete p.x`"],
        ["`ownKeys`", "`Object.keys`, `Reflect.ownKeys`, `for...in` key listing"],
        ["`getOwnPropertyDescriptor` / `defineProperty`", "descriptor reads and `Object.defineProperty`"],
        ["`getPrototypeOf` / `setPrototypeOf`", "prototype reads/writes, `instanceof`"],
        ["`isExtensible` / `preventExtensions`", "extensibility checks, `Object.freeze/seal`"],
        ["`apply` / `construct`", "calling a function proxy / `new` on it"],
      ] },
      { type: "p", text: "These 13 traps correspond one-to-one to the spec's object **internal methods** (`[[Get]]`, `[[Set]]`, …). A proxy is an *exotic object* whose internal methods call your traps instead of the ordinary algorithms." },
      { type: "callout", tone: "warning", title: "Invariants", text: "The engine checks that traps don't lie about the target in ways that would break language guarantees. For example, `get` must return the real value for a non-writable, non-configurable data property, and `ownKeys` must include all non-configurable keys. Violations throw `TypeError`." },
      { type: "list", items: [
        "**Internal slots:** `new Proxy(new Map(), {}).get('a')` throws `TypeError`, because `Map.prototype.get` runs with `this = proxy`, which lacks `[[MapData]]`. Fix by binding methods to the target in the `get` trap.",
        "**Private fields:** `#x` access on a proxy of a class instance throws for the same reason — private names live on the target, not the proxy.",
        "**Identity:** `proxy !== target`; storing both in a `Set` gives two entries.",
        "**Revocable:** `Proxy.revocable(target, handler)` returns `{ proxy, revoke }`; after `revoke()` every operation throws — useful for handing out temporary access.",
        "**Shallow:** only the top-level object is wrapped; reactivity libraries wrap nested objects lazily inside `get`.",
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Performance", text: "Engines heavily optimise ordinary property access (inline caches, hidden classes). Proxy operations go through trap calls and invariant checks, so they are noticeably slower in hot paths. Fine for configuration, state containers and dev tooling; avoid wrapping objects accessed millions of times per second." },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      caption: "Validation on write and defaults on read",
      code: `function createUser(target) {
  return new Proxy(target, {
    set(obj, prop, value, receiver) {
      if (prop === 'age' && (!Number.isInteger(value) || value < 0)) {
        throw new TypeError('age must be a non-negative integer');
      }
      return Reflect.set(obj, prop, value, receiver);
    },
    get(obj, prop, receiver) {
      if (typeof prop === 'string' && !(prop in obj)) return 'no ' + prop;
      return Reflect.get(obj, prop, receiver);
    },
  });
}

const user = createUser({ name: 'Ada' });
user.age = 36;
console.log(user.age, user.name, user.email);

try { user.age = -1; } catch (e) { console.log(e.message); }
console.log(user.age);

const map = new Proxy(new Map(), {});
try { map.set('a', 1); } catch (e) { console.log(e.constructor.name); }`,
      output: `36 Ada no email
age must be a non-negative integer
36
TypeError`,
    },
    walkthrough: [
      { title: "user.age = 36", detail: "Triggers the `set` trap. 36 passes validation, so `Reflect.set` writes it onto the target and returns `true` (a `false` return would throw in strict mode)." },
      { title: "user.email", detail: "The `get` trap sees `'email'` is not in the target and returns the default string instead of `undefined`." },
      { title: "user.age = -1", detail: "Validation fails and the trap throws; the target keeps 36." },
      { title: "Proxy around a Map", detail: "`map.set` is found via the (empty) `get` fallthrough, but it is then called with `this = proxy`. The proxy has no `[[MapData]]` internal slot → `TypeError`." },
    ],
    followUps: [
      { q: "How does Vue 3's reactivity use proxies?", a: "`reactive(obj)` returns a proxy. The `get` trap records (tracks) which effect read which key; the `set` trap triggers every effect that depended on that key. Nested objects are wrapped on access. Vue 2 used `Object.defineProperty` getters/setters instead, which couldn't detect added/deleted properties or array index writes." },
      { q: "Why forward with `Reflect.get(obj, prop, receiver)` instead of `obj[prop]`?", a: "`receiver` preserves the correct `this` for getters. If the target has `get full() { return this.first }` and the proxy (or an object inheriting from it) is the receiver, `obj[prop]` would run the getter with `this = target`, bypassing the proxy's traps for `this.first`." },
      { q: "How would you make a Map work through a Proxy?", a: "In the `get` trap, if the value is a function, return `value.bind(target)` so internal-slot methods run against the real Map — then add your own interception for `set`/`delete` calls as needed." },
      { q: "Can a proxy detect `===` comparisons or `typeof`?", a: "No. Identity comparison and `typeof` aren't trappable. `typeof` reflects the target: a proxy of a function is `'function'`, otherwise `'object'`." },
    ],
    pitfalls: [
      "Returning `false` (or nothing) from a `set` trap — `undefined` is falsy, so strict-mode assignments throw `TypeError`.",
      "Wrapping `Map`/`Set`/`Date`/class instances with private fields and calling their methods through the proxy.",
      "Assuming nested objects are proxied automatically.",
      "Violating invariants (e.g. hiding a non-configurable key in `ownKeys`).",
    ],
    glossary: [
      { term: "Trap", definition: "A handler method on a proxy (like `get` or `set`) that runs instead of the default behaviour for one operation." },
      { term: "Target", definition: "The object a proxy wraps and forwards to when no trap is defined." },
      { term: "Internal method", definition: "Spec-level operations every object supports, like `[[Get]]` and `[[Set]]`; proxy traps map to them." },
      { term: "Internal slot", definition: "Hidden per-object storage used by built-ins, like a Map's entries (`[[MapData]]`); proxies don't have their target's slots." },
      { term: "Receiver", definition: "The object that should act as `this` for getters/setters found during a property lookup." },
    ],
    relatedLessons: ["javascript/proxy-reflect", "javascript/prototypes", "javascript/freeze-seal"],
    relatedQuestions: ["js-37", "js-35", "js-43"],
    sources: [],
  },

  // ───────────────────────────────────────────────────────────── 34
  {
    id: "js-34",
    track: "javascript",
    number: 34,
    question: "How do exceptions work in JavaScript — throwing, propagation, custom errors and async errors?",
    level: "intermediate",
    frequency: "medium",
    tags: ["errors", "exceptions", "async", "error-handling"],
    shortAnswer:
      "`throw` stops normal execution and **unwinds the call stack** frame by frame until it reaches an enclosing `try/catch`; if none exists, it becomes an uncaught error for the host — logged in the console, or crashing a Node process by default. You can throw any value, but you should throw `Error` objects because they carry a `name`, `message` and `stack`.\n\nFor domain errors I subclass `Error` and set `name`, and when re-throwing I wrap with `new Error('context', { cause: err })` so the original isn't lost. `finally` runs whether or not an error happened.\n\nThe big gotcha is async: `try/catch` only catches errors thrown **synchronously** while it's on the stack. A throw inside a `setTimeout` callback or a rejected promise you didn't `await` escapes it. With promises you use `.catch()` or `await` inside `try`, and there are global hooks for the rest: `unhandledrejection` in browsers, `process.on('unhandledRejection')` in Node.",
    deep: [
      { type: "p", text: "**Overlap note.** js-24 focuses on the `try...catch` statement syntax. This question is broader: what an exception *is*, how it travels, error types, custom errors, and asynchronous failure." },
      { type: "steps", steps: [
        { title: "throw value", detail: "Creates an *abrupt completion* of type throw. The current function stops at that point." },
        { title: "Unwind", detail: "Each frame on the call stack is exited (running any `finally` blocks on the way) until a frame with an active `try` whose `catch` covers the throw point." },
        { title: "Catch", detail: "The `catch (err)` block receives the thrown value. If it re-throws, unwinding continues outward." },
        { title: "Uncaught", detail: "If the stack empties, the host reports it: browsers fire `window.onerror`/`error` events; Node prints it and exits with code 1." },
      ] },
      { type: "table", head: ["Built-in error", "Typical cause"], rows: [
        ["`TypeError`", "Wrong type: calling a non-function, reading a property of `undefined`, writing to a frozen object in strict mode"],
        ["`ReferenceError`", "Undeclared variable, or TDZ access"],
        ["`RangeError`", "Value out of range, call stack overflow in V8"],
        ["`SyntaxError`", "Invalid code (at parse time) or invalid `JSON.parse` input"],
        ["`AggregateError`", "Several errors at once, e.g. `Promise.any` when all reject"],
      ] },
      { type: "viz", id: "js-event-loop", caption: "A callback queued as a later task runs on a fresh stack — the original `try` is long gone." },
      { type: "list", items: [
        "**`finally` overrides:** a `return` or `throw` inside `finally` replaces the pending return value or exception. Avoid control flow in `finally`.",
        "**Error `cause`** (ES2022): `new Error(msg, { cause })` chains errors without losing the stack of the original.",
        "**Optional catch binding** (ES2019): `catch { … }` when you don't need the error.",
        "**Promise rejections** are exceptions in async functions: `await p` throws the rejection reason, so a normal `try/catch` works around `await`.",
        "**Throwing non-Errors** (`throw 'oops'`) loses the stack trace and breaks `err.message`.",
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Stack traces are not in the spec", text: "`error.stack` is a de-facto standard implemented by all engines with different formats; `Error.captureStackTrace` and `Error.stackTraceLimit` are V8 extensions. Node since v15 terminates the process on unhandled promise rejections by default (`--unhandled-rejections=throw`)." },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `class ValidationError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'ValidationError';
  }
}

function parseAge(input) {
  const n = Number(input);
  if (!Number.isInteger(n)) throw new ValidationError('bad age: ' + input);
  return n;
}

function loadUser(raw) {
  try {
    return { age: parseAge(raw.age) };
  } catch (err) {
    throw new Error('loadUser failed', { cause: err });
  } finally {
    console.log('finally runs');
  }
}

try {
  loadUser({ age: 'abc' });
} catch (e) {
  console.log(e.message);
  console.log(e.cause.name + ': ' + e.cause.message);
  console.log(e.cause instanceof ValidationError, e.cause instanceof Error);
}

try {
  setTimeout(() => { /* a throw here would NOT be caught by this try */ }, 0);
  Promise.reject(new Error('async boom')).catch((err) => console.log('caught:', err.message));
} catch {
  console.log('never reached');
}`,
      output: `finally runs
loadUser failed
ValidationError: bad age: abc
true true
caught: async boom`,
    },
    walkthrough: [
      { title: "parseAge('abc')", detail: "`Number('abc')` is `NaN`, not an integer, so a `ValidationError` is thrown. `parseAge`'s frame is abandoned." },
      { title: "Caught in loadUser", detail: "The `catch` wraps it in a new `Error` with `cause` and re-throws. Before control leaves `loadUser`, `finally` runs and prints." },
      { title: "Outer catch", detail: "Receives the wrapper. `e.cause` is the original `ValidationError` with its own name, message and stack." },
      { title: "Async part", detail: "The `try` block finishes synchronously without throwing. The rejection is handled by the promise's own `.catch`, which runs later as a microtask — the surrounding `try/catch` plays no part." },
    ],
    followUps: [
      { q: "Why doesn't `try { setTimeout(() => { throw e }) } catch {}` catch anything?", a: "`setTimeout` only *schedules* the callback. The `try` block completes and its frame is gone; the callback later runs on a fresh call stack from the task queue, where no `try` surrounds it. Put the `try` inside the callback." },
      { q: "What's the difference between `return await p` and `return p` inside a `try` in an async function?", a: "`return await p` waits for `p` inside the `try`, so a rejection is caught by the local `catch`. `return p` hands the promise out immediately, so its rejection propagates to the caller and the local `catch` never sees it." },
      { q: "How do you reliably detect a custom error type?", a: "`instanceof` works within one realm, provided you set up the subclass with `class … extends Error`. Across realms or package copies, check a discriminant like `err.name` or a `code` property (as Node does with `err.code === 'ENOENT'`)." },
      { q: "Should you use exceptions for control flow?", a: "Generally no — use them for exceptional conditions. Expected outcomes (validation results, 'not found') are often clearer as return values, e.g. `{ ok: false, error }`. Exceptions are also harder for engines to optimise when thrown frequently." },
    ],
    pitfalls: [
      "Throwing strings or plain objects — no stack trace.",
      "Swallowing errors with an empty `catch {}`.",
      "Wrapping async callbacks in an outer `try` and assuming it covers them.",
      "Returning from `finally` and silently discarding an exception.",
      "Forgetting `this.name = …` in custom errors so logs show plain `Error`.",
    ],
    glossary: [
      { term: "Exception", definition: "A signal that something went wrong, which interrupts normal flow and travels up the call stack until handled." },
      { term: "Stack unwinding", definition: "Exiting function frames one by one while an exception looks for a handler." },
      { term: "Abrupt completion", definition: "Spec term for a statement ending via `throw`, `return`, `break` or `continue` instead of normally." },
      { term: "Unhandled rejection", definition: "A rejected promise with no rejection handler attached by the time the host checks." },
      { term: "Error cause", definition: "The `cause` option/property linking a wrapper error to the error that triggered it." },
    ],
    relatedLessons: ["javascript/error-handling", "javascript/promises", "javascript/async-await", "javascript/call-stack"],
    relatedQuestions: ["js-24", "js-09", "js-07", "js-41"],
    sources: [],
  },
  // ───────────────────────────────────────────────────────────── 35
  {
    id: "js-35",
    track: "javascript",
    number: 35,
    question: "What does `Object.freeze()` do, and what are its limitations?",
    level: "beginner",
    frequency: "medium",
    tags: ["objects", "immutability", "property-descriptors"],
    shortAnswer:
      "`Object.freeze(obj)` makes an object's own properties read-only and locks its shape: you can't add, delete or change properties, and its prototype can't be changed. In strict mode the failed write throws a `TypeError`; in sloppy mode it fails **silently**. It returns the same object, not a copy.\n\nThe key limitation is that it's **shallow**. If a property holds another object or array, that inner object is still fully mutable — `config.db.host = 'x'` works on a frozen `config`. For deep immutability you write a recursive `deepFreeze`, or use a library or immutable patterns.\n\nAlso note `const` is different: `const` stops the *variable* being reassigned, while `freeze` stops the *object* being changed. And setters on a frozen object still run, so it doesn't freeze state hidden in closures or in a `Map`'s internal data.",
    deep: [
      { type: "p", text: "**Intuition.** Freezing laminates the top page of a binder: you can't write on it or remove it, but if that page says 'see folder B', folder B is still a normal, editable folder." },
      { type: "steps", steps: [
        { title: "Prevent extensions", detail: "Calls the object's `[[PreventExtensions]]`: no new properties, and the prototype can no longer be changed." },
        { title: "Lock every own property", detail: "For each own key (strings and symbols): set `configurable: false`, and for **data** properties also `writable: false`. Accessor properties keep their getter/setter functions." },
        { title: "Return the same object", detail: "`Object.freeze(o) === o`. `Object.isFrozen(o)` checks the result." },
      ] },
      { type: "compare", items: [
        { title: "const", points: ["Applies to a **binding** (variable)", "Prevents reassignment: `x = other` throws", "Object contents stay mutable"] },
        { title: "Object.freeze", points: ["Applies to an **object**", "Prevents property add/delete/change", "Variable can still be reassigned if declared with `let`"] },
      ] },
      { type: "list", items: [
        "**Arrays:** a frozen array rejects `push`, `pop`, `sort` and index writes. Built-in methods like `push` *always* throw `TypeError` on failure, even in sloppy mode.",
        "**Map/Set/Date:** their data lives in internal slots, not properties. `Object.freeze(new Map()).set('a', 1)` still works.",
        "**Typed arrays** with elements cannot be frozen at all — `Object.freeze(new Uint8Array(1))` throws `TypeError`.",
        "**Primitives:** `Object.freeze(5)` just returns 5 (ES2015+; ES5 threw).",
        "**Cycles:** a naive recursive `deepFreeze` loops forever on circular structures — skip already-frozen objects.",
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Performance myths", text: "Freezing doesn't make code faster in general. Engines can sometimes treat frozen objects' properties as constants, but V8 has historically also had slower paths for some frozen objects. Freeze for correctness (guarding shared config, catching accidental mutation), not speed." },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `'use strict';
const config = Object.freeze({ port: 8080, db: { host: 'localhost' } });

try { config.port = 9090; } catch (e) { console.log(e.constructor.name); }
config.db.host = 'prod-db';                 // shallow: nested object is mutable
console.log(config.port, config.db.host);
console.log(Object.isFrozen(config), Object.isFrozen(config.db));

function deepFreeze(obj) {
  for (const key of Reflect.ownKeys(obj)) {
    const value = obj[key];
    if (value && (typeof value === 'object' || typeof value === 'function') && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  }
  return Object.freeze(obj);
}

const safe = deepFreeze({ db: { host: 'localhost' }, tags: ['a'] });
try { safe.db.host = 'x'; } catch (e) { console.log(e.constructor.name); }
try { safe.tags.push('b'); } catch (e) { console.log(e.constructor.name); }
console.log(safe.db.host, safe.tags.length);`,
      output: `TypeError
8080 prod-db
true false
TypeError
TypeError
localhost 1`,
    },
    walkthrough: [
      { title: "config.port = 9090", detail: "`port` is non-writable; in strict mode the failed assignment throws `TypeError`." },
      { title: "config.db.host = 'prod-db'", detail: "`config.db` is a reference to a separate, unfrozen object. Only the reference is locked, not its target." },
      { title: "deepFreeze", detail: "Walks all own keys (including symbols via `Reflect.ownKeys`), recursing into objects first, then freezes the parent. The `isFrozen` check avoids infinite loops on cycles." },
      { title: "safe.tags.push('b')", detail: "The nested array is frozen too, so `push` fails to set index 1 and throws." },
    ],
    followUps: [
      { q: "What's the difference between freeze, seal and preventExtensions?", a: "`preventExtensions`: no new properties. `seal`: that plus no deletion/reconfiguration (all properties non-configurable), but existing values can change. `freeze`: that plus data properties become read-only. See js-51." },
      { q: "Can you unfreeze an object?", a: "No. Freezing is irreversible because properties become non-configurable and the object non-extensible. Make a copy (`{ ...frozen }` or `structuredClone`) to get a mutable version." },
      { q: "Is a frozen object fully immutable if it has a setter?", a: "No. Accessor properties stay accessors; calling the setter still runs its function, which can mutate variables in its closure or other objects. Freeze only locks property *slots*." },
      { q: "Why might you freeze objects in a Redux-like store in development?", a: "To catch accidental mutations of state early — Redux Toolkit uses Immer, which auto-freezes produced state in development so a mutation throws (in strict mode) instead of silently breaking change detection." },
    ],
    pitfalls: [
      "Assuming freeze is deep.",
      "Not noticing silent failures in sloppy-mode scripts.",
      "Confusing `const` with immutability.",
      "Expecting a frozen `Map`/`Set` to reject `set`/`add`.",
      "Writing `deepFreeze` without cycle protection.",
    ],
    glossary: [
      { term: "Property descriptor", definition: "The settings for one property: `value`, `writable`, `enumerable`, `configurable` (or `get`/`set` for accessors)." },
      { term: "Shallow", definition: "Affecting only the top-level object, not objects referenced from it." },
      { term: "Configurable", definition: "Whether a property can be deleted or have its descriptor changed." },
      { term: "Extensible", definition: "Whether new properties can be added to an object." },
    ],
    relatedLessons: ["javascript/freeze-seal", "javascript/var-let-const", "javascript/deep-copy"],
    relatedQuestions: ["js-51", "js-06", "js-18"],
    sources: [],
  },

  // ───────────────────────────────────────────────────────────── 36
  {
    id: "js-36",
    track: "javascript",
    number: 36,
    question: "What is memoization, and how would you implement a `memoize` function in JavaScript?",
    level: "intermediate",
    frequency: "medium",
    tags: ["closures", "caching", "performance", "implement-it"],
    shortAnswer:
      "Memoization caches a function's results by its arguments, so calling it again with the same inputs returns the stored answer instead of recomputing. It's only safe for **pure** functions — same input always gives the same output with no side effects.\n\nThe implementation is a higher-order function that keeps a `Map` in a **closure**: build a key from the arguments, return the cached value on a hit, otherwise call the original and store the result. For a single primitive argument the argument itself is the key; for several you need a key strategy like `JSON.stringify(args)` or nested Maps.\n\nThe trade-off is memory for speed: an unbounded cache can grow forever, so in real code you bound it with LRU or TTL, or use a `WeakMap` when keys are objects. Classic examples are recursive Fibonacci and React's `useMemo` / `React.memo`.",
    deep: [
      { type: "p", text: "**Overlap note.** Memoization is a textbook use of closures (js-02): the cache is private state that survives between calls. Here the emphasis is the caching strategy — keys, invalidation and memory — rather than how closures work." },
      { type: "viz", id: "js-closure", caption: "The memoized wrapper closes over its cache; each call reads and writes the same Map." },
      { type: "table", head: ["Key strategy", "Good for", "Watch out"], rows: [
        ["The argument itself (`Map` key)", "One primitive or object argument", "Objects compare by identity, not content"],
        ["`JSON.stringify(args)`", "Small plain-data arguments", "Slow for big inputs; key order matters; drops functions/`undefined`; throws on cycles"],
        ["Nested `Map`s per argument", "Multiple arguments of any type", "More code; still identity for objects"],
        ["`WeakMap` keyed by object", "Derived data per object", "Only object keys; entries vanish when the object is collected"],
      ] },
      { type: "list", items: [
        "**Recursive functions** must call the *memoized* version for sub-problems, otherwise inner calls bypass the cache.",
        "**Async functions:** cache the *promise*, so concurrent callers share one in-flight request; delete the entry on rejection so failures aren't cached forever.",
        "**`this`:** forward it with `fn.apply(this, args)` if the function might be used as a method (and decide whether `this` should be part of the key).",
        "**Single-entry memo** (like React's `useMemo`, or `memoize-one`) only remembers the last arguments — tiny memory, great for render paths.",
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Map is the right container", text: "A `Map` preserves key types (no string coercion like plain objects), has O(1) average lookup, and iterates in insertion order — which makes a simple LRU possible: on hit, delete and re-insert; on overflow, delete the first key." },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `function memoize(fn, keyFn = (...args) => JSON.stringify(args)) {
  const cache = new Map();
  return function (...args) {
    const key = keyFn(...args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

let calls = 0;
const slowSquare = (n) => { calls++; return n * n; };
const fastSquare = memoize(slowSquare);
console.log(fastSquare(9), fastSquare(9), fastSquare(3));
console.log('calls:', calls);

let fibCalls = 0;
const fib = memoize((n) => {
  fibCalls++;
  return n < 2 ? n : fib(n - 1) + fib(n - 2);   // recursion goes through the cache
});
console.log(fib(50), 'computed', fibCalls, 'times');`,
      output: `81 81 9
calls: 2
12586269025 computed 51 times`,
    },
    walkthrough: [
      { title: "fastSquare(9)", detail: "Key `'[9]'` is missing → calls `slowSquare` (calls = 1), stores 81." },
      { title: "fastSquare(9) again", detail: "Key hit → returns 81 without calling `slowSquare`." },
      { title: "fastSquare(3)", detail: "New key → computes 9 (calls = 2)." },
      { title: "fib(50)", detail: "Naive recursion makes ~40 billion calls. Because `fib` refers to the memoized wrapper, each `n` from 0 to 50 is computed once: 51 computations, O(n) time." },
    ],
    followUps: [
      { q: "How would you add an LRU limit?", a: "Use the Map's insertion order: on a hit, `delete` the key and `set` it again to mark it most recent; after inserting, if `cache.size > max`, delete `cache.keys().next().value` (the oldest)." },
      { q: "How do you memoize an async function safely?", a: "Store the promise immediately so concurrent calls share it: `if (!cache.has(k)) cache.set(k, fn(...args).catch(err => { cache.delete(k); throw err; }))`. Return `cache.get(k)`. Removing on failure lets callers retry." },
      { q: "Why not memoize everything?", a: "Hashing keys and storing results cost time and memory. For cheap functions or rarely repeated inputs, memoization is slower. It is also wrong for impure functions (time, randomness, I/O, mutation)." },
      { q: "How do `React.memo` and `useMemo` relate?", a: "Both are memoization keyed on shallow equality: `React.memo` skips re-rendering a component if props are shallowly equal; `useMemo` caches a computed value until its dependency array changes. They keep only the last result, not a full cache." },
    ],
    pitfalls: [
      "Memoizing impure functions (e.g. depending on `Date.now()` or external state).",
      "Unbounded caches that become memory leaks.",
      "Object arguments: same content but different identity misses the cache; mutated objects return stale results.",
      "Recursive functions calling the un-memoized original.",
      "Caching rejected promises forever.",
    ],
    glossary: [
      { term: "Pure function", definition: "A function whose output depends only on its inputs and that has no side effects." },
      { term: "Cache hit / miss", definition: "A hit finds a stored result; a miss means the result must be computed." },
      { term: "LRU (least recently used)", definition: "An eviction rule that removes the entry unused for the longest time when the cache is full." },
      { term: "Higher-order function", definition: "A function that takes or returns another function." },
    ],
    relatedLessons: ["javascript/memoization", "javascript/closures", "javascript/higher-order-functions", "react/memoization-hooks"],
    relatedQuestions: ["js-02", "js-26", "js-27", "js-08", "js-39"],
    sources: [],
  },

  // ───────────────────────────────────────────────────────────── 37
  {
    id: "js-37",
    track: "javascript",
    number: 37,
    question: "What is the Reflect API, and why use it instead of the equivalent `Object` methods or operators?",
    level: "advanced",
    frequency: "medium",
    tags: ["reflect", "proxy", "metaprogramming"],
    shortAnswer:
      "`Reflect` is a built-in namespace object — not a constructor — with one static method for each of the 13 fundamental object operations: `Reflect.get`, `set`, `has`, `deleteProperty`, `ownKeys`, `defineProperty`, `getPrototypeOf`, `apply`, `construct`, and so on. They map one-to-one to the Proxy traps.\n\nWhy use it: first, it gives **clean return values** — `Reflect.defineProperty` returns `true`/`false` instead of throwing like `Object.defineProperty`. Second, it turns operators into functions: `Reflect.has` for `in`, `Reflect.deleteProperty` for `delete`, `Reflect.construct` for `new`. Third, and most important, inside proxy traps `Reflect.get(target, key, receiver)` forwards the default behaviour **with the correct receiver**, so getters and setters see the right `this`. `Reflect.ownKeys` is also the one call that returns both string and symbol keys.",
    deep: [
      { type: "p", text: "**Intuition.** If a Proxy is a receptionist who can intercept requests, Reflect is the standard procedure manual: 'here is exactly what normally happens for this request'. Traps do their extra work and then follow the manual." },
      { type: "table", head: ["Reflect", "Older equivalent", "Difference"], rows: [
        ["`Reflect.defineProperty`", "`Object.defineProperty`", "Returns boolean instead of throwing"],
        ["`Reflect.get(t, k, receiver)`", "`t[k]`", "Explicit receiver for getters"],
        ["`Reflect.set(t, k, v, receiver)`", "`t[k] = v`", "Returns boolean; explicit receiver"],
        ["`Reflect.has`", "`k in t`", "Function form"],
        ["`Reflect.deleteProperty`", "`delete t[k]`", "Function form, returns boolean"],
        ["`Reflect.ownKeys`", "`Object.getOwnPropertyNames` + `getOwnPropertySymbols`", "Strings and symbols in one list"],
        ["`Reflect.apply(f, this, args)`", "`f.apply(this, args)`", "Works even if `f` has an own `apply` property shadowing the method"],
        ["`Reflect.construct(C, args, newTarget)`", "`new C(...args)`", "Can set `new.target` to a different constructor"],
        ["`Reflect.getPrototypeOf(x)`", "`Object.getPrototypeOf(x)`", "Throws `TypeError` for primitives instead of coercing them"],
      ] },
      { type: "p", text: "**The receiver matters.** When a getter is inherited, `this` inside it should be the object the lookup *started* on. A proxy trap that does `return target[key]` runs the getter with `this = target`, which skips the proxy for any `this.x` the getter reads. `Reflect.get(target, key, receiver)` passes the original receiver along." },
      { type: "callout", tone: "note", title: "Not a constructor", text: "`Reflect` is a plain object like `Math`. `new Reflect()` throws `TypeError`." },
      { type: "callout", tone: "spec-vs-impl", title: "Spec mapping", text: "Each `Reflect` method is specified as a thin wrapper calling the matching internal method (e.g. `Reflect.get` → `target.[[Get]](key, receiver)`), so behaviour is identical across engines, unlike stack traces or GC." },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `const target = {};
console.log(Reflect.defineProperty(target, 'x', { value: 1 }));   // non-writable, non-configurable
console.log(Reflect.defineProperty(target, 'x', { value: 2 }));   // can't redefine → false
try { Object.defineProperty(target, 'x', { value: 2 }); } catch (e) { console.log(e.constructor.name); }

console.log(Reflect.has(target, 'x'), Reflect.ownKeys({ a: 1, [Symbol('s')]: 2 }).length);

const base = { get who() { return this.name; } };
const child = Object.create(base);
child.name = 'child';
console.log(Reflect.get(base, 'who', child));   // getter runs with this = child

class Point { constructor(x) { this.x = x; } }
console.log(Reflect.construct(Point, [7]).x);
console.log(Reflect.apply(Math.max, null, [1, 5, 3]));`,
      output: `true
false
TypeError
true 2
child
7
5`,
    },
    walkthrough: [
      { title: "First defineProperty", detail: "Creates `x` with defaults `writable: false, configurable: false` → succeeds, returns `true`." },
      { title: "Second defineProperty", detail: "Changing the value of a non-writable, non-configurable property isn't allowed. `Reflect` reports `false`; `Object.defineProperty` throws `TypeError` for the same request." },
      { title: "ownKeys", detail: "Returns `['a', Symbol(s)]` — length 2." },
      { title: "Reflect.get with receiver", detail: "The getter lives on `base`, but we pass `child` as receiver, so `this.name` reads `'child'`." },
      { title: "construct / apply", detail: "Function forms of `new Point(7)` and `Math.max.apply(null, [1, 5, 3])`." },
    ],
    followUps: [
      { q: "Show a proxy trap that breaks without the receiver.", a: "`const p = new Proxy({ first: 'A', get full() { return this.first; } }, { get(t, k, r) { if (k === 'first') return 'B'; return t[k]; } })`. `p.full` returns `'A'` because the getter ran with `this = t`. With `Reflect.get(t, k, r)` it returns `'B'` since `this.first` goes back through the proxy." },
      { q: "What is the third argument of `Reflect.construct` for?", a: "`newTarget` — it sets `new.target` and therefore which `prototype` the new object gets. It lets you run a parent constructor while producing an instance of a subclass, which is how some class-emulation and mixin code builds objects without `class` syntax." },
      { q: "Why does `Reflect.set` returning `false` matter in a proxy trap?", a: "A `set` trap must return a truthy value to signal success. Returning `Reflect.set(...)` passes the real result through, so strict-mode assignments correctly throw when the underlying write fails (e.g. read-only property)." },
    ],
    pitfalls: [
      "Ignoring the boolean results of `Reflect.set`/`defineProperty` and assuming success.",
      "Dropping the `receiver` argument in proxy traps.",
      "Calling `Reflect.getPrototypeOf` with a primitive (throws, unlike `Object.getPrototypeOf`).",
      "Trying `new Reflect()`.",
    ],
    glossary: [
      { term: "Namespace object", definition: "A plain object grouping related static functions, like `Math`, `JSON` or `Reflect`." },
      { term: "Receiver", definition: "The object treated as `this` when a getter or setter runs during a property lookup." },
      { term: "Fundamental operation", definition: "A basic object operation the spec defines as an internal method, like getting or defining a property." },
      { term: "new.target", definition: "The constructor that `new` was applied to; `Reflect.construct` can set it explicitly." },
    ],
    relatedLessons: ["javascript/proxy-reflect", "javascript/prototypes"],
    relatedQuestions: ["js-33", "js-49", "js-31"],
    sources: [],
  },

  // ───────────────────────────────────────────────────────────── 38
  {
    id: "js-38",
    track: "javascript",
    number: 38,
    question: "How would you approach optimizing the performance of a JavaScript application?",
    level: "advanced",
    frequency: "medium",
    tags: ["performance", "web-vitals", "main-thread", "loading"],
    shortAnswer:
      "I start by **measuring**, not guessing: Lighthouse or the DevTools Performance panel, real-user Core Web Vitals — LCP for loading, INP for responsiveness, CLS for layout stability — and profiling the actual slow interaction.\n\nThen I work in three layers. **Load:** ship less JavaScript with code splitting, lazy loading and tree shaking; compress and cache; and use `defer` or `async` so scripts don't block parsing. **Runtime:** keep the main thread free by breaking long tasks into chunks and yielding, moving heavy work to Web Workers, debouncing or throttling high-frequency events, batching DOM reads and writes to avoid layout thrashing, and virtualizing long lists. **Algorithmic:** choose the right data structures, like a `Set` instead of `array.includes` in a loop, and memoize expensive pure work.\n\nFinally I watch memory — leaks and GC pressure — and re-measure after each change to confirm it actually helped.",
    deep: [
      { type: "p", text: "**Intuition.** The browser's main thread is a single cashier serving JavaScript, style, layout, paint and input. Any one customer who takes too long (a long task over ~50 ms) makes everyone queue — that is the jank users feel." },
      { type: "viz", id: "js-event-loop", caption: "Input events wait in the task queue until the current task finishes; long tasks directly delay interaction." },
      { type: "table", head: ["Metric", "Measures", "Common JS levers"], rows: [
        ["LCP (Largest Contentful Paint)", "Loading: when the main content appears", "Less render-blocking JS, code splitting, preload critical resources, SSR"],
        ["INP (Interaction to Next Paint)", "Responsiveness of all interactions (replaced FID as a Core Web Vital in March 2024)", "Break up long tasks, yield, smaller event handlers, workers"],
        ["CLS (Cumulative Layout Shift)", "Visual stability", "Reserve space for content injected by JS"],
      ] },
      { type: "list", items: [
        "**Ship less:** route-level `import()` code splitting, tree shaking (ES modules), removing heavy dependencies, `defer`/`type=module` scripts (js-48).",
        "**Yield to the main thread:** chunk loops with `setTimeout`, `requestIdleCallback`, or `scheduler.yield()` where supported (check current browser support).",
        "**Off-main-thread:** Web Workers for parsing, crypto, image processing.",
        "**DOM:** batch reads then writes; use `requestAnimationFrame` for visual updates; virtualise long lists; delegate events (js-22).",
        "**Event rate:** debounce/throttle scroll, resize and input handlers (js-21).",
        "**Algorithms and data structures:** O(n²) → O(n) with `Map`/`Set`; memoize (js-36).",
        "**Memory:** fix leaks and avoid allocation churn in hot loops (js-32).",
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Engine-level tips are V8 details", text: "Advice like 'keep object shapes consistent', 'don't `delete` properties in hot objects' and 'avoid mixing types in arrays' comes from how V8 uses hidden classes (maps) and inline caches. It's real but implementation-specific and usually a micro-optimisation — apply it only after a profile points at that code." },
      { type: "callout", tone: "tip", title: "Interview structure", text: "Say: measure → identify the bottleneck category (network/load, main-thread CPU, rendering, memory) → apply the targeted fix → verify with the same measurement. Interviewers listen for 'measure first' more than for a list of tricks." },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      caption: "Breaking one long task into chunks so other work (input, rendering) can run in between",
      code: `function processInChunks(items, work, chunkSize = 1000) {
  return new Promise((resolve) => {
    const results = [];
    let i = 0;
    function runChunk() {
      const end = Math.min(i + chunkSize, items.length);
      for (; i < end; i++) results.push(work(items[i]));
      if (i < items.length) setTimeout(runChunk, 0);   // yield, then continue
      else resolve(results);
    }
    runChunk();
  });
}

const items = Array.from({ length: 5000 }, (_, i) => i);
processInChunks(items, (n) => n * 2).then((out) => {
  console.log(out.length, out[4999]);
});
console.log('main thread is free between chunks');`,
      output: `main thread is free between chunks
5000 9998`,
    },
    walkthrough: [
      { title: "First chunk", detail: "Runs synchronously for items 0–999, then schedules the next chunk as a new task with `setTimeout`." },
      { title: "Synchronous log", detail: "The rest of the script runs immediately, proving the work isn't blocking it." },
      { title: "Remaining chunks", detail: "Each chunk is its own short task. Between tasks the browser can handle clicks, keypresses and paint frames." },
      { title: "Resolve", detail: "After 5 chunks all items are processed and the promise resolves with 5000 results; the last is 4999 × 2 = 9998." },
      { title: "Trade-off", detail: "Total time gets slightly longer (timer clamping, scheduling overhead) but the page stays responsive — that is what INP rewards." },
    ],
    followUps: [
      { q: "What is a long task and why 50 ms?", a: "A task that occupies the main thread for over 50 ms. The figure comes from the RAIL model: to respond to input within ~100 ms, the browser needs tasks short enough that new input can be handled promptly. The Long Tasks API and DevTools flag them." },
      { q: "What is layout thrashing?", a: "Alternating DOM writes and layout reads (`el.style.width = …; el.offsetHeight; …`) in a loop forces the browser to recalculate layout synchronously each time. Fix by reading all values first, then writing, or by scheduling writes in `requestAnimationFrame`." },
      { q: "When would you use a Web Worker instead of chunking?", a: "When the work is CPU-heavy and doesn't need the DOM (parsing, compression, image filters). A worker runs truly in parallel; chunking only interleaves on the same thread. Workers cost message-passing and data copying (or transfer of `ArrayBuffer`s)." },
      { q: "How do you reduce JavaScript bundle size?", a: "Analyse the bundle (e.g. a bundle visualiser), split by route with dynamic `import()`, rely on ESM tree shaking, replace heavy libraries, avoid shipping polyfills to modern browsers, and lazy-load below-the-fold components." },
    ],
    pitfalls: [
      "Optimising without measuring, or measuring only on a fast developer machine.",
      "Micro-optimising syntax while a 2 MB bundle or an O(n²) loop is the real problem.",
      "Assuming `async` code is off the main thread — promises still run on it.",
      "Using `setTimeout(0)` expecting zero delay; nested timers are clamped to ≥4 ms in browsers.",
    ],
    glossary: [
      { term: "Main thread", definition: "The browser thread that runs your JavaScript, handles input and does style, layout and paint." },
      { term: "Long task", definition: "Any single task that blocks the main thread for more than 50 ms." },
      { term: "Core Web Vitals", definition: "Google's user-centric metrics: LCP (loading), INP (responsiveness) and CLS (visual stability)." },
      { term: "Tree shaking", definition: "Removing unused exports from a bundle, possible because ES module imports are static." },
      { term: "Layout thrashing", definition: "Forcing repeated synchronous layout by interleaving DOM writes and reads." },
    ],
    relatedLessons: ["javascript/performance", "javascript/debounce-throttle", "javascript/event-loop", "javascript/script-loading", "javascript/memory-leaks-gc"],
    relatedQuestions: ["js-21", "js-36", "js-32", "js-48", "js-01", "js-22"],
    sources: [],
  },

  // ───────────────────────────────────────────────────────────── 39
  {
    id: "js-39",
    track: "javascript",
    number: 39,
    question: "What are WeakMap and WeakSet, and how do they differ from Map and Set?",
    level: "intermediate",
    frequency: "medium",
    tags: ["weakmap", "weakset", "garbage-collection", "collections"],
    shortAnswer:
      "`WeakMap` and `WeakSet` hold their keys **weakly**: an entry doesn't stop its key from being garbage collected. When nothing else references the key object, the engine can drop the whole entry automatically.\n\nBecause of that, keys must be objects — or, since ES2023, non-registered symbols — and you can't use primitives like strings, since those are never \"unreachable\". The collections are also **not iterable** and have no `size`, `keys` or `clear`, because their contents depend on when GC happens, and exposing that would make programs non-deterministic. You only get `get/set/has/delete` on WeakMap and `add/has/delete` on WeakSet.\n\nThey're for attaching data to objects you don't own without leaking memory: private data per instance, caching derived values per object, tracking DOM nodes, or a \"seen\" set for cycle detection.",
    deep: [
      { type: "p", text: "**Intuition.** A normal `Map` is a sticky note glued to your fridge: as long as the note is there, the thing it describes is kept. A `WeakMap` note is pinned *to the object itself* — throw the object away and the note goes with it." },
      { type: "compare", items: [
        { title: "Map / Set", points: ["Any value as key", "Strong references: entries keep keys alive", "Iterable, has `size`, `clear`", "Use for general-purpose collections"] },
        { title: "WeakMap / WeakSet", points: ["Object (or non-registered symbol) keys only", "Weak keys: entries vanish when key is unreachable", "Not iterable, no `size`/`clear`", "Use for metadata tied to object lifetime"] },
      ] },
      { type: "p", text: "**Ephemeron semantics.** A WeakMap entry's *value* is kept alive only while its *key* is reachable from elsewhere. Even if the value references the key back, the pair can still be collected — a plain `Map` with the same cycle would keep both alive forever (if the Map itself is alive)." },
      { type: "viz", id: "js-references", caption: "Strong vs weak references: only strong paths from roots keep an object alive." },
      { type: "list", items: [
        "**Private data:** `const priv = new WeakMap(); constructor() { priv.set(this, {...}) }` — the pre-`#private` pattern, still useful across classes in one module.",
        "**Per-object caches:** cache a derived value (computed layout, parsed AST) keyed by the source object; no manual eviction.",
        "**Cycle detection:** a `WeakSet` of visited objects in deep-clone or `JSON.stringify` replacers (js-52).",
        "**Branding:** `WeakSet` of objects created by your factory, to check `isMine(obj)` without adding properties.",
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "When are entries removed?", text: "The spec only says entries for unreachable keys *may* be removed; GC timing is up to the engine and is non-deterministic. You can't observe it except via `WeakRef`/`FinalizationRegistry` (ES2021), which are themselves explicitly non-deterministic. Symbols as weak keys arrived in ES2023 — registered symbols from `Symbol.for` are rejected because they can always be recreated. Check engine support for symbol keys." },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `const privateData = new WeakMap();

class Person {
  constructor(name, ssn) {
    this.name = name;
    privateData.set(this, { ssn });      // tied to this instance's lifetime
  }
  lastFour() { return privateData.get(this).ssn.slice(-4); }
}

const p = new Person('Ada', '123-45-6789');
console.log(p.lastFour());
console.log(JSON.stringify(Object.keys(p)));

try { new WeakMap().set('key', 1); } catch (e) { console.log(e.constructor.name); }

const seen = new WeakSet();
const obj = {};
seen.add(obj);
console.log(seen.has(obj), seen.has({}));
console.log(typeof privateData.size, typeof privateData.keys);`,
      output: `6789
["name"]
TypeError
true false
undefined undefined`,
    },
    walkthrough: [
      { title: "privateData.set(this, …)", detail: "Stores the secret outside the instance, keyed by the instance. It never appears in `Object.keys` or JSON." },
      { title: "p.lastFour()", detail: "Looks up the instance's record and slices the last four characters." },
      { title: "String key", detail: "`'key'` is a primitive, so `set` throws `TypeError` (\"Invalid value used as weak map key\")." },
      { title: "WeakSet.has({})", detail: "A fresh `{}` is a different object — membership is by identity." },
      { title: "No size / keys", detail: "Weak collections expose no enumeration API, so both are `undefined`." },
      { title: "Garbage collection", detail: "When `p` becomes unreachable, its WeakMap entry (and the `{ ssn }` object) become collectable too — no cleanup code needed." },
    ],
    followUps: [
      { q: "Why can't you iterate a WeakMap?", a: "Iteration results would depend on whether GC had run yet, making program behaviour non-deterministic and leaking GC timing. Not exposing iteration also lets engines implement it efficiently without tracking key order." },
      { q: "WeakMap vs WeakRef?", a: "A WeakMap ties a *value's* lifetime to a key object and never exposes unreachable keys. A `WeakRef` is a direct weak pointer you can `deref()`, which may return `undefined` after collection. WeakMap is simpler and deterministic to use; WeakRef is for caches where you'd like to reuse an object if it still exists." },
      { q: "Is a WeakMap a fix for all memory leaks?", a: "Only for leaks where data should die with a key object. If the key itself is kept alive elsewhere (a global array, a listener), the entry stays. And values that reference keys held elsewhere still need care." },
      { q: "Can WeakMap keys be symbols?", a: "Since ES2023, yes, as long as they are not registered with `Symbol.for` (registered symbols can be recreated from their key, so they would never become unreachable). Well-known symbols like `Symbol.iterator` are technically allowed but are effectively immortal. Check your target engines' support before relying on it." },
    ],
    pitfalls: [
      "Trying to use strings or numbers as keys.",
      "Expecting `size`, `forEach` or iteration.",
      "Assuming entries disappear immediately when the key is dropped — GC timing is unspecified.",
      "Using a `Map` with object keys as a cache and leaking every key.",
    ],
    glossary: [
      { term: "Weak reference", definition: "A reference that doesn't keep its target alive for garbage collection purposes." },
      { term: "Ephemeron", definition: "A key/value pair where the value is reachable only as long as the key is reachable from elsewhere." },
      { term: "Reachable", definition: "Accessible by following references from roots like globals or the call stack." },
      { term: "Registered symbol", definition: "A symbol created with `Symbol.for(key)`, stored in a global registry so it can be looked up again." },
    ],
    relatedLessons: ["javascript/weakmap-weakset", "javascript/memory-leaks-gc", "javascript/symbols"],
    relatedQuestions: ["js-32", "js-52", "js-30", "js-36"],
    sources: [],
  },

  // ───────────────────────────────────────────────────────────── 40
  {
    id: "js-40",
    track: "javascript",
    number: 40,
    question: "How do ES module `import` and `export` work, and how do they differ from CommonJS?",
    level: "intermediate",
    frequency: "medium",
    tags: ["modules", "esm", "commonjs", "bundling"],
    shortAnswer:
      "ES modules use `export` to expose bindings and `import` to use them. There are **named** exports — `export const x`, `import { x }` — and one optional **default** export — `export default`, `import anything from`. You can also use `import * as ns` for a namespace object, and dynamic `import()` for lazy loading.\n\nThe key semantics: imports are **static** — top-level and with string literal specifiers — so tools can analyse the dependency graph and tree-shake. They're **live, read-only bindings**: if the exporting module changes a value, importers see the new value, but they can't assign to it. Each module is evaluated **once** and cached, runs in strict mode, and has its own top-level scope.\n\nCommonJS differs: `require` is a synchronous function call that can go anywhere, and it returns a **copy** of `module.exports` at that moment. ESM loads asynchronously in phases and supports top-level `await`.",
    deep: [
      { type: "p", text: "**Overlap note.** js-17 covers modules in general (why modules exist, CommonJS vs ESM history). This question focuses on the exact `import`/`export` syntax and semantics an interviewer probes: live bindings, static structure, default vs named, and circular imports." },
      { type: "steps", steps: [
        { title: "Construction (parse)", detail: "The loader fetches the entry module, parses it, finds its static `import` declarations, and recursively fetches dependencies, building a module graph. No code runs yet." },
        { title: "Linking (instantiate)", detail: "Each export becomes a binding in a module environment; imports are wired as *references* to those bindings (not copies). Imports are effectively hoisted." },
        { title: "Evaluation", detail: "Modules run in post-order (dependencies first), each exactly once. With top-level `await`, a module and its dependents wait asynchronously." },
      ] },
      { type: "table", head: ["Syntax", "Meaning"], rows: [
        ["`export const a = 1` / `export function f() {}`", "Named export"],
        ["`export { a as b }`", "Export under another name"],
        ["`export default expr`", "The single default export (actually a named export called `default`)"],
        ["`export * from './m.js'`", "Re-export all named exports (not the default)"],
        ["`import d, { a, b as c } from './m.js'`", "Default plus named imports"],
        ["`import * as ns from './m.js'`", "Namespace object (frozen-like, live)"],
        ["`await import('./m.js')`", "Dynamic import → promise of the namespace; can be anywhere"],
        ["`import './polyfill.js'`", "Side-effect only import"],
      ] },
      { type: "compare", items: [
        { title: "ES modules", points: ["Static `import`/`export` (except `import()`)", "Live read-only bindings", "Async loading; top-level `await`", "Strict mode; top-level `this` is `undefined`", "`import.meta.url` for the module's URL"] },
        { title: "CommonJS (Node)", points: ["`require()` is a runtime function call", "Gets the value of `module.exports` at call time (a copy of primitives)", "Synchronous loading", "Sloppy by default; `this === module.exports`", "`__filename`, `__dirname`"] },
      ] },
      { type: "callout", tone: "warning", title: "Circular imports", text: "In a cycle, one module may run before the other has initialised its exports. Accessing an imported `let`/`const`/`class` that hasn't been initialised yet throws `ReferenceError` (TDZ); function declarations are fine because they're initialised during linking." },
      { type: "callout", tone: "spec-vs-impl", title: "Host-defined loading", text: "The language spec defines module records and linking; *how specifiers resolve and files load* is up to the host. Browsers require full URLs or import maps (bare specifiers like `'react'` need an import map or bundler). Node resolves `node_modules`, needs `.mjs` or `\"type\": \"module\"`, and since Node 22.12 / 20.19 can `require()` synchronous ES modules (those without top-level `await`) by default." },
    ],
    example: {
      type: "code",
      lang: "js",
      caption: "Live bindings across two modules (needs a module loader, so not runnable here)",
      code: `// counter.js
export let count = 0;
export function increment() { count++; }
export default function hello() { return 'hi'; }

// main.js
import hello, { count, increment } from './counter.js';
import * as counter from './counter.js';

console.log(count);
increment();
console.log(count, counter.count);   // both see the live value
console.log(hello());
// count = 5;   // TypeError: imported bindings are read-only`,
      output: `0
1 1
hi`,
    },
    walkthrough: [
      { title: "Linking", detail: "`count` in `main.js` is wired to the `count` binding inside `counter.js` — not a copy of `0`." },
      { title: "First log", detail: "Reads the binding: 0." },
      { title: "increment()", detail: "Mutates `count` inside `counter.js`. Because the import is a live reference, `main.js` now sees 1 through both `count` and `counter.count`." },
      { title: "CommonJS contrast", detail: "`const { count } = require('./counter')` would copy 0 into a local at require time and keep printing 0 after `increment()`." },
      { title: "Assignment", detail: "Assigning to an imported binding is a `TypeError` — only the exporting module can change it." },
    ],
    followUps: [
      { q: "Why can bundlers tree-shake ESM but not CommonJS easily?", a: "ESM imports/exports are static declarations, so a bundler knows at build time exactly which exports are used. `require` can be called conditionally with computed paths and `module.exports` can be mutated at runtime, so its usage can't be fully known statically." },
      { q: "Default vs named exports — which do you prefer?", a: "Many teams prefer named exports: names are consistent across imports, IDE auto-import and refactors work better, and tree shaking is more precise. Default exports suit modules with one obvious main thing (a React component per file)." },
      { q: "If two modules import the same module, does it run twice?", a: "No. A module is evaluated once per module map (per realm, per resolved URL); later imports get the same instance. This is why an ES module is a natural singleton (js-46). Different resolved paths, e.g. two copies in `node_modules`, are different modules." },
      { q: "What does top-level `await` do to importers?", a: "A module using top-level `await` pauses its own evaluation; modules that depend on it wait until it finishes, while unrelated sibling branches can continue. It's only allowed in modules, not classic scripts or CommonJS." },
    ],
    pitfalls: [
      "Assuming `import { x }` copies the value — it's a live binding.",
      "Forgetting file extensions in browser/Node ESM specifiers (`./util.js`, not `./util`).",
      "Mixing `export default` and `import { default }` names inconsistently.",
      "Circular imports hitting TDZ errors for `const`/`class` exports.",
      "Expecting `__dirname` in ESM — use `import.meta.url` (or `import.meta.dirname` in recent Node).",
    ],
    glossary: [
      { term: "Live binding", definition: "An import that always reflects the exporting module's current value, like a read-only window into its variable." },
      { term: "Module graph", definition: "The tree (or graph) of modules connected by their imports, built before any code runs." },
      { term: "Specifier", definition: "The string after `from` that identifies a module, like `'./utils.js'` or `'react'`." },
      { term: "Tree shaking", definition: "Dropping unused exports from a production bundle." },
      { term: "Import map", definition: "A browser feature (a `<script type=\"importmap\">`) mapping bare specifiers like `'react'` to URLs." },
    ],
    relatedLessons: ["javascript/modules", "javascript/script-loading", "javascript/singleton"],
    relatedQuestions: ["js-17", "js-46", "js-48"],
    sources: [],
  },
  // ───────────────────────────────────────────────────────────── 41
  {
    id: "js-41",
    track: "javascript",
    number: 41,
    question: "How does `Promise.all()` work, and what happens when one of the promises rejects?",
    level: "intermediate",
    frequency: "low",
    tags: ["promises", "async", "concurrency", "promise-combinators"],
    shortAnswer:
      "`Promise.all(iterable)` takes many promises and returns **one** promise. It fulfils with an array of all the results **in input order**, not completion order, once every input has fulfilled. Non-promise values are treated as already-resolved, and an empty input resolves immediately to `[]`.\n\nIt's **fail-fast**: as soon as any input rejects, the combined promise rejects with that first reason. But it doesn't **cancel** the other operations — JavaScript promises have no cancellation, so the remaining requests keep running and their results are just ignored. If you need cancellation you pass an `AbortSignal` to the underlying work.\n\nIf you want every outcome even when some fail, use `Promise.allSettled`. `Promise.race` settles with the first to settle, and `Promise.any` fulfils with the first success.",
    deep: [
      { type: "p", text: "**Overlap note.** js-09 covers promises themselves (states, chaining, microtasks). This question zooms in on the combinator: ordering, fail-fast semantics, what is *not* cancelled, and how to implement it." },
      { type: "steps", steps: [
        { title: "Iterate input", detail: "For each item, call `Promise.resolve(item)` (strictly, `this.resolve`), so plain values and thenables are normalised." },
        { title: "Attach handlers", detail: "Each fulfilment stores its value at its own **index** in a results array and decrements a remaining counter." },
        { title: "All fulfilled", detail: "When the counter hits zero, resolve with the results array — order matches input order regardless of timing." },
        { title: "First rejection", detail: "The first rejection rejects the combined promise. Later rejections are ignored (and, because `all` attached handlers to them, they don't trigger unhandled-rejection warnings)." },
      ] },
      { type: "table", head: ["Combinator", "Fulfils when", "Rejects when"], rows: [
        ["`Promise.all`", "All fulfil (array of values)", "Any rejects (first reason)"],
        ["`Promise.allSettled`", "All settle (array of `{status, value|reason}`)", "Never (for promise inputs)"],
        ["`Promise.race`", "First to settle fulfils", "First to settle rejects"],
        ["`Promise.any`", "First to fulfil", "All reject (`AggregateError`)"],
      ] },
      { type: "viz", id: "js-event-loop", caption: "Each input's handlers run as microtasks; the combined promise settles from inside one of them." },
      { type: "callout", tone: "misconception", title: "\"Promise.all runs promises in parallel\"", text: "Promises don't *run* — the operations behind them already started when you created them. `Promise.all` only waits. Concurrency comes from starting the work before awaiting; `for (const id of ids) await fetch(id)` is sequential, `await Promise.all(ids.map(fetch))` is concurrent." },
      { type: "callout", tone: "spec-vs-impl", title: "Spec detail", text: "`Promise.all` is specified to read `this.resolve` once and call it for each element, which is why subclasses of `Promise` work with it. Results are written by index via per-element resolve functions that ignore repeated calls." },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `function task(name, ms, shouldFail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('settled', name);
      if (shouldFail) reject(new Error(name));
      else resolve(name);
    }, ms);
  });
}

Promise.all([task('a', 30), task('b', 10), 42])
  .then((values) => console.log('all:', values.join(',')));

Promise.all([task('slow', 50), task('boom', 20, true)])
  .then(() => console.log('never printed'))
  .catch((err) => console.log('rejected:', err.message));`,
      output: `settled b
settled boom
rejected: boom
settled a
all: a,b,42
settled slow`,
    },
    walkthrough: [
      { title: "t = 10 ms", detail: "`b` fulfils first, stored at index 1. The first `all` still waits for `a`." },
      { title: "t = 20 ms", detail: "`boom` rejects → the second `all` rejects immediately → `rejected: boom`." },
      { title: "t = 30 ms", detail: "`a` fulfils at index 0. All inputs are done (42 was already resolved) → `['a', 'b', 42]` in **input order**, even though `b` finished first." },
      { title: "t = 50 ms", detail: "`slow` still completes and logs — fail-fast rejected the combined promise but did not stop the timer behind `slow`." },
    ],
    followUps: [
      { q: "Implement `Promise.all`.", a: "`function all(iterable) { return new Promise((resolve, reject) => { const items = [...iterable]; const out = new Array(items.length); let left = items.length; if (left === 0) return resolve(out); items.forEach((item, i) => { Promise.resolve(item).then(v => { out[i] = v; if (--left === 0) resolve(out); }, reject); }); }); }` — index-based storage preserves order; `reject` is safe to call repeatedly because a promise settles only once." },
      { q: "How do you actually cancel the other requests when one fails?", a: "Create an `AbortController`, pass `controller.signal` to each `fetch`, and call `controller.abort()` in the `.catch` of `Promise.all`. The aborted fetches then reject with an `AbortError`." },
      { q: "How do you limit concurrency for 1,000 requests?", a: "`Promise.all` on 1,000 started requests runs them all at once. Use a pool: start N workers that each pull the next item from a shared index until done, and `await Promise.all(workers)`; or use a library like `p-limit`." },
      { q: "What does `await Promise.all([])` return?", a: "An empty array, synchronously resolved (the promise is fulfilled immediately, `await` still yields one microtask)." },
    ],
    pitfalls: [
      "Assuming a rejection cancels the other operations.",
      "Starting requests sequentially inside a loop and then calling `Promise.all` on already-awaited values.",
      "Using `Promise.all` when partial failure is acceptable — use `allSettled`.",
      "Launching thousands of operations at once without a concurrency limit.",
      "Expecting results in completion order.",
    ],
    glossary: [
      { term: "Combinator", definition: "A function that combines several promises into one, like `all`, `allSettled`, `race` and `any`." },
      { term: "Fail-fast", definition: "Stopping (rejecting) as soon as the first failure is seen instead of waiting for everything." },
      { term: "Thenable", definition: "Any object with a `then` method; promises adopt the state of thenables." },
      { term: "AbortSignal", definition: "A standard object for cancelling operations like `fetch`, created by an `AbortController`." },
    ],
    relatedLessons: ["javascript/promise-combinators", "javascript/promises", "javascript/async-await", "javascript/event-loop"],
    relatedQuestions: ["js-09", "js-07", "js-11", "js-34"],
    sources: [],
  },

  // ───────────────────────────────────────────────────────────── 42
  {
    id: "js-42",
    track: "javascript",
    number: 42,
    question: "What is tail-call optimization, and does JavaScript support it?",
    level: "advanced",
    frequency: "low",
    tags: ["recursion", "call-stack", "spec-vs-engine", "es2015"],
    shortAnswer:
      "A **tail call** is a function call that's the very last thing a function does — `return f(x)`, with nothing left to compute afterwards. Since the caller's frame isn't needed any more, an engine can **reuse** it instead of pushing a new one, so tail-recursive functions run in constant stack space instead of overflowing.\n\nES2015 actually **specifies** proper tail calls in strict mode. In practice, though, only Safari's JavaScriptCore ships them. V8 — so Chrome and Node — implemented it behind a flag and then removed it, and Firefox never shipped it. Engine teams objected because eliminated frames vanish from stack traces and debugging tools, among other concerns.\n\nSo in portable JavaScript you can't rely on TCO. For deep recursion you convert to a loop, use an explicit stack, or use a **trampoline**.",
    deep: [
      { type: "p", text: "**Intuition.** Normally each call is a sticky note stacked on the previous one so you know where to return. In a tail call you'd just be passing the answer straight through, so you could throw away your note before making the call — the stack never grows." },
      { type: "table", head: ["Code", "Tail call?", "Why"], rows: [
        ["`return f(n - 1)`", "Yes", "Nothing happens after the call"],
        ["`return n * f(n - 1)`", "No", "Multiplication happens after `f` returns"],
        ["`return a || f(x)`", "Yes (for `f(x)`)", "The right operand of `||`/`&&`/`??` is in tail position"],
        ["`return cond ? f(x) : g(x)`", "Yes", "Both branches are in tail position"],
        ["`f(x); return;`", "No", "Implicit `return undefined` after the call"],
        ["`return await f(x)`", "No", "Async functions never have proper tail calls"],
        ["Call inside `try` with a `finally`", "No", "The frame must stay to run `finally`"],
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Spec says yes, engines mostly say no", text: "ES2015 requires proper tail calls (PTC) in strict-mode code. JavaScriptCore (Safari) implements them. V8 shipped PTC behind `--harmony-tailcalls` (Node 6/7) and removed it; SpiderMonkey (Firefox) never shipped it. An alternative 'syntactic tail calls' proposal (explicit opt-in syntax) stalled. Check a current compatibility table before relying on any of this." },
      { type: "list", items: [
        "**Objections raised:** missing frames in `error.stack` and DevTools, interaction with `Function.prototype.caller`/`arguments` semantics, and that it changes performance characteristics in ways developers can't see.",
        "**Stack depth** without TCO is engine-specific (roughly ten thousand frames in V8 by default, depending on frame size); overflow throws `RangeError` in V8/JSC and `InternalError: too much recursion` in Firefox.",
        "**Workarounds:** rewrite as a `while` loop, keep an explicit stack array (DFS), or a trampoline that returns thunks and loops on them.",
      ] },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      caption: "Tail-recursive sum vs a trampoline. Output shown is V8 (Chrome/Node); Firefox reports InternalError, and Safari (which ships proper tail calls) prints 500000500000 on the first line.",
      code: `'use strict';
function sumTo(n, acc = 0) {
  if (n === 0) return acc;
  return sumTo(n - 1, acc + n);       // a proper tail call per the spec
}
try {
  console.log(sumTo(1e6));
} catch (e) {
  console.log('stack overflow:', e.constructor.name);
}

// Trampoline: return a thunk instead of recursing, and loop on it.
const trampoline = (fn) => (...args) => {
  let result = fn(...args);
  while (typeof result === 'function') result = result();
  return result;
};
const sumToT = trampoline(function step(n, acc = 0) {
  return n === 0 ? acc : () => step(n - 1, acc + n);
});
console.log(sumToT(1e6));`,
      output: `stack overflow: RangeError
500000500000`,
    },
    walkthrough: [
      { title: "sumTo(1e6)", detail: "Each call ends with `return sumTo(...)`, a tail call. In an engine with PTC the frame is replaced each time, so depth stays constant and it returns 500000500000." },
      { title: "In V8/Firefox", detail: "Every call pushes a new frame. A million frames exceed the stack limit and the engine throws; we catch and print the error type." },
      { title: "Trampoline", detail: "`step` never calls itself directly — it returns a zero-argument function (thunk) describing the next step. The trampoline's `while` loop calls the thunk; the stack depth never exceeds two frames." },
      { title: "Result", detail: "Sum of 1..1,000,000 = 1e6 × (1e6 + 1) / 2 = 500000500000, well within safe integer range." },
    ],
    followUps: [
      { q: "Why isn't `return n * fact(n - 1)` a tail call, and how do you fix it?", a: "The multiplication happens after the recursive call returns, so the frame is still needed. Add an accumulator: `function fact(n, acc = 1) { return n <= 1 ? acc : fact(n - 1, n * acc); }` — the recursive call is now the last operation (use `BigInt` for large `n`)." },
      { q: "Does TCO apply in sloppy mode?", a: "No. The ES2015 spec only requires proper tail calls in strict-mode code, partly because sloppy-mode `fn.caller` and `fn.arguments` would expose eliminated frames." },
      { q: "What's the cost of a trampoline?", a: "An extra closure allocation per step and the loop overhead — usually slower than a hand-written loop, but it keeps recursive structure readable and stack-safe on every engine." },
      { q: "How would you traverse a deep tree without recursion?", a: "Use an explicit stack: `const stack = [root]; while (stack.length) { const node = stack.pop(); visit(node); stack.push(...node.children); }`. The 'stack' now lives on the heap, which is much larger than the call stack." },
    ],
    pitfalls: [
      "Claiming 'JavaScript has TCO' without the engine caveat — only Safari ships it.",
      "Assuming `return await f()` or calls inside `try/finally` are tail calls.",
      "Using deep recursion on user-controlled input (deep JSON, long linked lists) in Node or Chrome.",
      "Confusing 'tail position' with 'last line of the function'.",
    ],
    glossary: [
      { term: "Tail call", definition: "A call whose result is returned directly, with no work left in the caller afterwards." },
      { term: "Proper tail calls (PTC)", definition: "The ES2015 requirement that tail calls in strict mode not grow the call stack." },
      { term: "Stack frame", definition: "The record of one active function call: its local variables and where to return to." },
      { term: "Trampoline", definition: "A loop that repeatedly calls returned functions (thunks), turning recursion into iteration." },
      { term: "Thunk", definition: "A zero-argument function wrapping a computation to be run later." },
    ],
    relatedLessons: ["javascript/tail-calls", "javascript/call-stack", "dsa/recursion"],
    relatedQuestions: ["js-50", "js-34"],
    sources: [],
  },

  // ───────────────────────────────────────────────────────────── 43
  {
    id: "js-43",
    track: "javascript",
    number: 43,
    question: "What are decorators in JavaScript, and what is their current status?",
    level: "advanced",
    frequency: "low",
    tags: ["decorators", "classes", "metaprogramming", "typescript", "tc39"],
    shortAnswer:
      "A decorator is a function, applied with `@name` syntax, that receives a class or class member and can **replace or augment** it — for example `@logged` wrapping a method to log calls, `@bound` auto-binding it, or `@memoize`. It's a declarative way to add cross-cutting behaviour.\n\nStatus matters here. The **TC39 decorators proposal** — the 2022 redesign — is at Stage 3, not yet part of the published standard. A standard decorator has the signature `(value, context) => replacement`, where `context` carries `kind`, `name`, `addInitializer` and so on, and it supports `accessor` fields. **TypeScript 5.0+** implements this standard version by default.\n\nThat's different from TypeScript's older `experimentalDecorators`, the legacy design used by Angular, NestJS and TypeORM, which works on property descriptors and has parameter decorators and `emitDecoratorMetadata`. Native browser support is still limited — none shipped them as of 2025 — so in practice you compile them with TypeScript or Babel. Check current engine support.",
    deep: [
      { type: "p", text: "**Intuition.** A decorator is a label you stick on a class member that says 'run this transformation on me when the class is defined'. `@logged method() {}` is roughly `method = logged(method, { kind: 'method', name: 'method', … })`." },
      { type: "table", head: ["", "TC39 Stage 3 (2022 design)", "TypeScript legacy (`experimentalDecorators`)"], rows: [
        ["Signature", "`(value, context) => newValue | void`", "`(target, key, descriptor) => descriptor | void`"],
        ["What you receive", "The member itself (method, getter, class) or `undefined` for fields", "The prototype/constructor plus a property descriptor"],
        ["Fields", "Return an initializer function `(initialValue) => newValue`", "Receives target and key only, no descriptor"],
        ["Parameter decorators", "Not included", "Supported (used by Angular/Nest DI)"],
        ["Metadata", "Separate `Symbol.metadata` proposal (TS 5.2+)", "`emitDecoratorMetadata` + `reflect-metadata`"],
        ["Auto-accessors", "`accessor x = 1` keyword", "No"],
        ["Enable in TS", "Default since TS 5.0", "`\"experimentalDecorators\": true`"],
      ] },
      { type: "p", text: "**Evaluation order.** Decorator expressions are evaluated top to bottom, then applied bottom-up (closest to the member first). Method decorators run at class definition time; `context.addInitializer` registers code to run per instance (for non-static members) — that's how `@bound` binds methods to each instance." },
      { type: "callout", tone: "spec-vs-impl", title: "Status is version-sensitive", text: "As of 2025 the proposal is Stage 3 and engines were still implementing it; no browser shipped decorators natively. TypeScript 5.0+ and Babel (`@babel/plugin-proposal-decorators` with `version: \"2023-11\"`) compile the standard version. The two decorator flavours are **incompatible** — a library written for legacy decorators won't work under the standard ones. Check the TC39 proposal repo and compatibility tables for the current state." },
      { type: "p", text: "**Without the syntax**, a decorator is just a higher-order function you apply manually. This desugared form runs in any engine:" },
      { type: "code", lang: "js", runnable: true, code: `function logged(value, context) {
  return function (...args) {
    const result = value.apply(this, args);
    console.log(context.name + '(' + args.join(', ') + ') = ' + result);
    return result;
  };
}
class Calculator { add(a, b) { return a + b; } }
// What '@logged add(a, b) {}' does, roughly:
Calculator.prototype.add = logged(Calculator.prototype.add, { kind: 'method', name: 'add' });
new Calculator().add(2, 3);`, output: "add(2, 3) = 5" },
    ],
    example: {
      type: "code",
      lang: "ts",
      caption: "A standard (Stage 3) method decorator in TypeScript 5.0+ — compile with tsc, not runnable natively",
      code: `function logged<This, Args extends unknown[], Return>(
  value: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) {
  const name = String(context.name);
  return function (this: This, ...args: Args): Return {
    console.log('-> ' + name + '(' + args.join(', ') + ')');
    const result = value.call(this, ...args);
    console.log('<- ' + name + ' = ' + String(result));
    return result;
  };
}

function bound(_value: unknown, context: ClassMethodDecoratorContext) {
  context.addInitializer(function (this: any) {
    this[context.name] = this[context.name].bind(this);
  });
}

class Calculator {
  base = 10;
  @logged add(a: number, b: number) { return a + b; }
  @bound getBase() { return this.base; }
}

const calc = new Calculator();
calc.add(2, 3);
const { getBase } = calc;        // detached, but still bound
console.log(getBase());`,
      output: `-> add(2, 3)
<- add = 5
10`,
    },
    walkthrough: [
      { title: "Class definition", detail: "When `Calculator` is defined, `logged` is called with the original `add` and a context `{ kind: 'method', name: 'add', … }`. Its return value replaces `add` on the prototype." },
      { title: "@bound", detail: "Doesn't replace the method; it registers an initializer that runs for each new instance and assigns a bound copy as an own property." },
      { title: "calc.add(2, 3)", detail: "Runs the wrapper: logs the call, invokes the original with the right `this`, logs the result." },
      { title: "Detached getBase()", detail: "Normally `this` would be lost, but the instance's own bound copy keeps `this = calc` → 10." },
    ],
    followUps: [
      { q: "Can decorators be used on plain functions or object literals?", a: "No. Both the standard and legacy versions only decorate classes and class members (methods, getters/setters, fields, auto-accessors, and the class itself). Function decorators have been discussed as a separate idea." },
      { q: "What does the `accessor` keyword do?", a: "`accessor x = 1` creates a private storage slot plus a public getter/setter pair. Decorators on it receive `{ get, set }` and can return replacements — useful for reactive or validated fields, since plain field decorators can only transform the initial value." },
      { q: "Why does Angular still use legacy decorators?", a: "Its dependency injection relies on parameter decorators and emitted type metadata (`emitDecoratorMetadata`), which the standard proposal doesn't provide. Migrating requires different designs (e.g. Angular's `inject()` function)." },
      { q: "In what order are multiple decorators applied?", a: "Expressions are evaluated top to bottom, but application is bottom-up: in `@a @b method() {}`, `b` wraps the method first, then `a` wraps `b`'s result — like `a(b(method))`." },
    ],
    pitfalls: [
      "Mixing legacy and standard decorator libraries in one TypeScript project.",
      "Claiming decorators are part of standard JavaScript today — they're Stage 3; check current status.",
      "Expecting field decorators to receive the value — standard field decorators receive `undefined` and return an initializer.",
      "Forgetting that the decorator runs at class definition, not at each call (unless it wraps).",
    ],
    glossary: [
      { term: "Decorator", definition: "A function applied with `@` that transforms or annotates a class or class member when the class is defined." },
      { term: "TC39 stage", definition: "Maturity level of a JavaScript proposal (0–4). Stage 3 means the design is complete and awaiting implementation experience; Stage 4 means it's in the standard." },
      { term: "Cross-cutting concern", definition: "Behaviour needed in many places, like logging, caching or authorisation, that isn't core business logic." },
      { term: "Auto-accessor", definition: "A class field declared with `accessor`, backed by private storage and exposed through a generated getter/setter." },
      { term: "Property descriptor", definition: "The object describing a property (`value`, `writable`, `get`, `set`, …); legacy decorators modify it." },
    ],
    relatedLessons: ["javascript/decorators", "javascript/classes-inheritance", "javascript/higher-order-functions", "typescript/generics"],
    relatedQuestions: ["js-31", "js-36", "js-08", "js-33"],
    sources: [],
  },

  // ───────────────────────────────────────────────────────────── 44
  {
    id: "js-44",
    track: "javascript",
    number: 44,
    question: "What is asynchronous iteration (`for await...of` and async generators), and when would you use it?",
    level: "advanced",
    frequency: "low",
    tags: ["async-iteration", "generators", "streams", "es2018"],
    shortAnswer:
      "Asynchronous iteration, from ES2018, is the iterator protocol for values that arrive over time. An async iterator's `next()` returns a **promise** of `{ value, done }` instead of the object directly, and `for await (const x of source)` awaits each one in turn. An object becomes async-iterable by implementing `[Symbol.asyncIterator]()`.\n\nThe easiest way to produce one is an **async generator**, `async function*`, where you can both `await` and `yield`. It's ideal for paginated APIs — yield each item while fetching the next page lazily — and for streams like Node readable streams, `fetch` response bodies, or WebSocket messages, with natural backpressure because the producer only advances when the consumer asks.\n\n`for await` also accepts ordinary iterables of promises. `break` calls `return()` so cleanup runs, and it can only be used inside async functions or at module top level.",
    deep: [
      { type: "p", text: "**Overlap note.** This builds on generators (js-28) and the sync iterator protocol (js-45). The difference is that every step is awaited, so the *consumer* pauses between items instead of blocking." },
      { type: "compare", items: [
        { title: "Sync iteration", points: ["`[Symbol.iterator]()`", "`next()` → `{ value, done }`", "`for...of`, spread, destructuring", "`function*`"] },
        { title: "Async iteration", points: ["`[Symbol.asyncIterator]()`", "`next()` → `Promise<{ value, done }>`", "`for await...of` only (no async spread)", "`async function*`"] },
      ] },
      { type: "steps", steps: [
        { title: "Get the iterator", detail: "`for await` looks up `[Symbol.asyncIterator]`; if absent it falls back to `[Symbol.iterator]` and wraps it so each value is awaited." },
        { title: "Await next()", detail: "Each loop iteration awaits `iterator.next()`; the async function suspends until it settles." },
        { title: "Body runs", detail: "With the resolved `value`. The producer (an async generator) is paused at its `yield` meanwhile — it does no extra work — which gives pull-based backpressure." },
        { title: "Finish or exit", detail: "On `done: true` the loop ends. On `break`, `return` or a thrown error, `iterator.return()` is awaited so the producer's `finally` blocks run." },
      ] },
      { type: "viz", id: "js-async-await", caption: "Each `for await` step suspends the consumer exactly like an `await`." },
      { type: "list", items: [
        "**Requests queue:** calling an async generator's `next()` twice without awaiting is allowed — requests are queued and resolved in order.",
        "**Sequential by design:** `for await` processes one item at a time. For concurrent processing, use `Promise.all` on batches instead.",
        "**Iterable of promises:** `for await (const v of [p1, p2])` awaits them in array order, but they're already running concurrently; a later promise that rejects early may be reported as unhandled before the loop reaches it.",
        "**Helpers:** `Array.fromAsync` (newer — check support) collects an async iterable into an array; Node's `events.on` and `readline` expose async iterators.",
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Where async iterables appear", text: "Node.js `Readable` streams have been async-iterable since Node 10. Web `ReadableStream` async iteration is in the Streams standard and supported in Node, Firefox and Chromium; check Safari support before relying on it." },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `async function* ticks(n, ms) {
  try {
    for (let i = 1; i <= n; i++) {
      await new Promise((r) => setTimeout(r, ms));
      yield i;
    }
  } finally {
    console.log('ticks cleaned up');
  }
}

(async () => {
  for await (const t of ticks(3, 10)) console.log('tick', t);

  const results = [];
  for await (const v of [Promise.resolve('a'), 'b', Promise.resolve('c')]) results.push(v);
  console.log(results.join(''));

  const gen = ticks(10, 1);
  for await (const t of gen) { if (t === 2) break; }   // break → gen.return()
  console.log(JSON.stringify(await gen.next()));
})();`,
      output: `tick 1
tick 2
tick 3
ticks cleaned up
abc
ticks cleaned up
{"done":true}`,
    },
    walkthrough: [
      { title: "First loop", detail: "Each `next()` resumes `ticks`, which waits 10 ms then yields. The loop body logs each value. After 3 the generator finishes and its `finally` runs." },
      { title: "Iterable of promises", detail: "Arrays have no `Symbol.asyncIterator`, so `for await` uses the sync iterator and awaits each element: `'a'`, `'b'`, `'c'`." },
      { title: "break", detail: "At `t === 2` the loop exits early, which calls `gen.return()`. The generator resumes at its paused `yield` as if returning, so `finally` logs cleanup." },
      { title: "After return", detail: "The generator is closed; `next()` resolves to `{ value: undefined, done: true }`, which `JSON.stringify` prints without the `undefined` value." },
    ],
    followUps: [
      { q: "Write an async generator that paginates an API.", a: "`async function* allItems(url) { while (url) { const res = await fetch(url); const page = await res.json(); yield* page.items; url = page.next; } }` — consumers write `for await (const item of allItems(start))` and pages are fetched only as needed." },
      { q: "How do you make a custom class async-iterable without a generator?", a: "Implement `[Symbol.asyncIterator]() { return { next: () => Promise.resolve({ value, done }), return: () => Promise.resolve({ done: true }) }; }`. Generators are simpler because they handle state, queueing and `return()` for you." },
      { q: "Why is `for await` sometimes a performance trap?", a: "It serialises work: each iteration waits before the next one starts. If items are independent (e.g. fetch 100 URLs), map them to promises and use `Promise.all`, or process in bounded concurrent batches." },
      { q: "What does `yield*` do in an async generator?", a: "Delegates to another async (or sync) iterable, re-yielding each of its values and forwarding `return`/`throw` — handy for flattening pages into items." },
    ],
    pitfalls: [
      "Using `for await` at the top level of a classic script or in a non-async function (`SyntaxError`).",
      "Expecting concurrency from `for await` — it is sequential.",
      "Spreading an async iterable (`[...asyncGen()]` throws — it's not sync-iterable).",
      "Not putting cleanup in `finally`, so early `break` leaks connections or handles.",
    ],
    glossary: [
      { term: "Async iterator", definition: "An object whose `next()` returns a promise of `{ value, done }`." },
      { term: "Async generator", definition: "A function declared `async function*` that can both `await` promises and `yield` values." },
      { term: "Backpressure", definition: "Letting a slow consumer control how fast a producer generates data, so work doesn't pile up." },
      { term: "Pull-based", definition: "The consumer asks for the next value; the producer doesn't push values on its own schedule." },
    ],
    relatedLessons: ["javascript/async-iteration", "javascript/generators-iterators", "javascript/async-await", "nodejs/streams-buffers"],
    relatedQuestions: ["js-28", "js-45", "js-07", "js-41"],
    sources: [],
  },

  // ───────────────────────────────────────────────────────────── 45
  {
    id: "js-45",
    track: "javascript",
    number: 45,
    question: "What is `Symbol.iterator`, and how do you make an object iterable?",
    level: "intermediate",
    frequency: "low",
    tags: ["iterators", "symbols", "protocols", "es2015"],
    shortAnswer:
      "`Symbol.iterator` is a well-known symbol that marks an object as **iterable**. If an object has a method under that key that returns an **iterator** — an object with a `next()` method returning `{ value, done }` — then `for...of`, spread, array destructuring, `Array.from`, `new Map(…)`, `Promise.all` and friends can all consume it.\n\nArrays, strings, Maps, Sets, `arguments` and NodeLists all implement it; plain objects don't, which is why `for...of` on `{}` throws \"is not iterable\".\n\nTo make your own class iterable you add `[Symbol.iterator]()`, and the simplest way is to make it a generator: `*[Symbol.iterator]() { yield* this.items; }`. If the consumer stops early — `break`, or destructuring only a few values — the language calls the iterator's optional `return()` method so you can clean up.",
    deep: [
      { type: "p", text: "**Overlap note.** js-28 covers generators and js-44 the async version of this protocol. This question is about the protocol itself: the two interfaces (iterable vs iterator) and how language features consume them." },
      { type: "table", head: ["Interface", "Requirement"], rows: [
        ["Iterable", "Has a `[Symbol.iterator]()` method that returns an iterator"],
        ["Iterator", "Has `next()` returning `{ value, done }`; optionally `return()` and `throw()`"],
        ["Iterable iterator", "An iterator whose `[Symbol.iterator]()` returns itself (generators, array iterators)"],
      ] },
      { type: "list", items: [
        "**Consumers:** `for...of`, spread `[...x]` and `f(...x)`, array destructuring, `yield*`, `Array.from`, `new Map/Set/WeakMap/WeakSet`, `Promise.all/race/allSettled/any`, `Object.fromEntries`.",
        "**Not consumers:** `for...in` (enumerates keys), object spread `{...x}` (copies own properties).",
        "**Laziness:** values are produced on demand, so iterables can be infinite as long as the consumer stops.",
        "**Single-pass vs re-iterable:** an iterable that returns a *fresh* iterator each call (like an array) can be looped many times; a generator object returns itself, so it's exhausted after one pass.",
      ] },
      { type: "viz", id: "js-references", caption: "The iterator is a separate object holding cursor state; the iterable just creates iterators." },
      { type: "callout", tone: "spec-vs-impl", title: "IteratorClose", text: "When a consumer stops before `done: true` — `break`/`return`/`throw` in `for...of`, or destructuring that takes only some values — the spec's IteratorClose calls `iterator.return()` if it exists. Spread and `Array.from` always exhaust the iterator, so they never call it. Engines optimise array iteration heavily, but *only* while `Array.prototype[Symbol.iterator]` is untouched — patching it deoptimises every spread." },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `class Range {
  constructor(start, end) { this.start = start; this.end = end; }
  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    return {
      next() {
        return current <= end
          ? { value: current++, done: false }
          : { value: undefined, done: true };
      },
      return() {                       // called when a consumer stops early
        console.log('cleanup');
        return { value: undefined, done: true };
      },
      [Symbol.iterator]() { return this; },
    };
  }
}

const r = new Range(1, 4);
console.log([...r].join(','));
const [a, b] = r;                      // takes 2, then closes the iterator
console.log(a, b);
for (const n of r) { if (n === 2) break; }
console.log(Math.max(...r));

try { for (const x of { a: 1 }) {} } catch (e) { console.log(e.constructor.name); }`,
      output: `1,2,3,4
cleanup
1 2
cleanup
4
TypeError`,
    },
    walkthrough: [
      { title: "[...r]", detail: "Spread calls `r[Symbol.iterator]()` and calls `next()` until `done: true` — it exhausts the iterator, so `return()` is not called." },
      { title: "const [a, b] = r", detail: "Destructuring pulls two values. The iterator isn't done, so the engine calls `return()` → prints `cleanup`, then `a = 1, b = 2`." },
      { title: "for...of with break", detail: "A fresh iterator (each call creates new `current`), stopped at 2 → `return()` again." },
      { title: "Math.max(...r)", detail: "Spread into arguments → `Math.max(1, 2, 3, 4)` → 4." },
      { title: "Plain object", detail: "`{ a: 1 }` has no `Symbol.iterator` → `TypeError: … is not iterable`." },
    ],
    followUps: [
      { q: "Rewrite `Range`'s iterator with a generator.", a: "`*[Symbol.iterator]() { for (let i = this.start; i <= this.end; i++) yield i; }` — the generator object is an iterator with `next`, `return` and `throw` built in; `finally` blocks replace a manual `return()`." },
      { q: "How do you iterate a plain object's entries with `for...of`?", a: "Use `Object.entries(obj)` (or `keys`/`values`), which returns an array: `for (const [k, v] of Object.entries(obj)) {}`. Or define `[Symbol.iterator]` on the object if it's a custom collection." },
      { q: "Why does spreading a Map give arrays of pairs?", a: "`Map.prototype[Symbol.iterator]` is the same function as `Map.prototype.entries`, which yields `[key, value]` arrays. Sets yield values; strings yield Unicode code points (so emoji aren't split into surrogate halves)." },
      { q: "What are iterator helpers?", a: "ES2025 added methods on `Iterator.prototype` such as `map`, `filter`, `take`, `drop`, `flatMap`, `reduce` and `toArray`, which work lazily on any iterator (e.g. `naturals().filter(isEven).take(3).toArray()`). Check engine support for older targets." },
    ],
    pitfalls: [
      "Returning the iterable itself instead of an iterator from `[Symbol.iterator]()`.",
      "Sharing cursor state on the iterable, so two loops interfere — create state per iterator call.",
      "Forgetting `done: true`, causing infinite loops in spread.",
      "Expecting `for...of` on a plain object to work.",
    ],
    glossary: [
      { term: "Iterable", definition: "An object that can produce an iterator via its `[Symbol.iterator]()` method." },
      { term: "Iterator", definition: "An object with a `next()` method that returns `{ value, done }` results one at a time." },
      { term: "Iterator protocol", definition: "The agreed shape (`next`, optional `return`/`throw`) that lets any code consume any iterator." },
      { term: "Well-known symbol", definition: "A built-in symbol the language checks for to enable a feature, such as `Symbol.iterator`." },
    ],
    relatedLessons: ["javascript/generators-iterators", "javascript/symbols", "javascript/async-iteration"],
    relatedQuestions: ["js-28", "js-44", "js-30", "js-19"],
    sources: [],
  },

  // ───────────────────────────────────────────────────────────── 46
  {
    id: "js-46",
    track: "javascript",
    number: 46,
    question: "How would you implement the Singleton pattern in JavaScript, and when should you (not) use it?",
    level: "intermediate",
    frequency: "low",
    tags: ["design-patterns", "modules", "classes"],
    shortAnswer:
      "A singleton guarantees one shared instance of something — a config store, a logger, a database connection pool — with a single access point.\n\nIn modern JavaScript the simplest singleton is an **ES module**: a module is evaluated only once and cached, so `export const config = new Config()` gives every importer the same object. With classes you can keep a private static `#instance` and expose `static getInstance()`, creating lazily on first use. Before modules, people used an IIFE closure.\n\nThe caveats are what interviewers actually want to hear. It's global state in disguise, so it hides dependencies and makes tests leak state into each other. And \"single\" only means single **per module instance** — two copies of a package in `node_modules`, separate bundles, iframes or workers each get their own. Often dependency injection is the better choice.",
    deep: [
      { type: "p", text: "**Intuition.** A singleton is the one office printer everyone shares. Convenient — until two teams configure it differently, or you want to test with a fake printer." },
      { type: "table", head: ["Approach", "How", "Notes"], rows: [
        ["Module singleton", "`export default new Logger()`", "Idiomatic; relies on the module cache; eager creation on first import"],
        ["Class with static instance", "`static #instance; static getInstance()`", "Lazy creation; private static field prevents outside tampering"],
        ["Closure / IIFE", "`const Store = (() => { let inst; return { get: () => inst ??= create() }; })()`", "Pre-ES2015 pattern"],
        ["Frozen object literal", "`export default Object.freeze({ … })`", "For pure config with no state changes"],
      ] },
      { type: "list", items: [
        "**Async initialisation:** cache the *promise*, not the result — `let ready; export function getDb() { return ready ??= connect(); }` — so concurrent callers don't open two connections.",
        "**Testing:** provide a `reset()` for tests or, better, inject the instance as a parameter so tests can pass a fake.",
        "**Server-side rendering:** a module-level singleton on a Node server is shared across *all requests and users* — never store per-user state in it.",
        "**Hot module reload:** dev servers can re-evaluate a module, creating a second instance (a common cause of 'too many DB connections' in Next.js dev; the usual fix is caching on `globalThis`).",
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "\"Once\" is per module record", text: "The language guarantees a module is evaluated once *per module map*, keyed by resolved specifier. Bundlers, Node's resolution (`node_modules` duplicates, symlinks, ESM vs CJS copies of a dual package) and separate realms (iframes, workers) can each produce distinct instances." },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `class Config {
  static #instance = null;
  #settings = new Map();

  constructor() {
    if (Config.#instance) return Config.#instance;   // 'new' also returns the singleton
    Config.#instance = this;
  }
  static getInstance() { return Config.#instance ?? new Config(); }

  set(key, value) { this.#settings.set(key, value); return this; }
  get(key) { return this.#settings.get(key); }
}

const a = Config.getInstance();
const b = new Config();
a.set('env', 'prod');
console.log(a === b, b.get('env'));

// Lazy async singleton: cache the promise, not the value
let connecting = null;
let connects = 0;
function getConnection() {
  return (connecting ??= new Promise((resolve) => {
    connects++;
    setTimeout(() => resolve({ id: 1 }), 10);
  }));
}
Promise.all([getConnection(), getConnection()]).then(([c1, c2]) => {
  console.log(c1 === c2, 'connects:', connects);
});`,
      output: `true prod
true connects: 1`,
    },
    walkthrough: [
      { title: "Config.getInstance()", detail: "No instance yet → `new Config()` runs; the constructor stores `this` in the private static field." },
      { title: "new Config()", detail: "A throwaway object is allocated, but the constructor *returns* the stored instance. Returning an object from a constructor replaces the result of `new`, so `a === b`." },
      { title: "Shared state", detail: "`a.set` and `b.get` operate on the same `#settings` Map → `'prod'`." },
      { title: "Async singleton", detail: "Both callers hit `getConnection` before it resolves. `??=` stores the first promise, so the second call reuses it: one connection attempt, same object." },
    ],
    followUps: [
      { q: "Why is an ES module a natural singleton?", a: "The loader evaluates each module once and caches its module record; every `import` of the same resolved specifier gets the same bindings. So top-level state in the module is shared by all importers (see js-40)." },
      { q: "What problems do singletons cause in testing?", a: "State persists between tests, so order matters and tests become flaky; they're hard to replace with fakes because code reaches for the global instead of receiving a dependency. Mitigations: dependency injection, a reset hook, or module mocking (`jest.mock`, `vi.mock`)." },
      { q: "How would you avoid creating multiple Prisma/DB clients during Next.js dev hot reload?", a: "Store the instance on `globalThis` in development: `const db = globalThis.__db ?? new Client(); if (process.env.NODE_ENV !== 'production') globalThis.__db = db;`. The global survives module re-evaluation." },
      { q: "Singleton vs static class (only static methods)?", a: "A singleton is an object instance: it can implement interfaces, be passed around, be lazily created and be swapped in tests. A class with only static members is just a namespace — in JS a plain module of functions is usually simpler." },
    ],
    pitfalls: [
      "Storing per-request or per-user data in a server-side singleton.",
      "Assuming one instance across duplicated packages, bundles, workers or iframes.",
      "Race conditions in lazy async initialisation (caching the result instead of the promise).",
      "Using singletons as an excuse for hidden global dependencies.",
    ],
    glossary: [
      { term: "Singleton", definition: "A design pattern that restricts a class or resource to one shared instance with a global access point." },
      { term: "Module cache", definition: "The loader's record of already-evaluated modules, so each runs once." },
      { term: "Dependency injection", definition: "Passing a component the objects it needs instead of letting it fetch globals, which makes swapping and testing easy." },
      { term: "IIFE", definition: "Immediately Invoked Function Expression — `(() => { … })()` — used to create a private scope." },
    ],
    relatedLessons: ["javascript/singleton", "javascript/modules", "javascript/classes-inheritance", "javascript/closures"],
    relatedQuestions: ["js-40", "js-17", "js-31", "js-02"],
    sources: [],
  },
  // ───────────────────────────────────────────────────────────── 47
  {
    id: "js-47",
    track: "javascript",
    number: 47,
    question: "What are mixins in JavaScript, and how do you implement them?",
    level: "intermediate",
    frequency: "low",
    tags: ["mixins", "classes", "composition", "design-patterns"],
    shortAnswer:
      "A mixin is a bundle of reusable behaviour you add to a class **without** making it the parent. JavaScript has single inheritance — one `extends` — so mixins are how you share features like \"serialisable\" or \"emits events\" across unrelated classes.\n\nThere are two common styles. **Object mixins** copy methods onto a prototype with `Object.assign(User.prototype, Serializable)` — simple, but it flattens getters into values and `super` doesn't work as you'd expect. **Subclass factories**, or class-expression mixins, are functions that take a base class and return a class extending it: `const Eventful = Base => class extends Base { … }`, used as `class User extends Serializable(Eventful(Model))`. These build a real prototype chain, so `super`, `instanceof` checks against the base, and private fields all work.\n\nThe risks are name collisions and order-dependent overrides, so many teams prefer plain composition — has-a instead of is-a — when they can.",
    deep: [
      { type: "p", text: "**Intuition.** Inheritance says 'a User **is a** Model'. A mixin says 'a User also **can** serialise and emit events', picked à la carte without inventing a `SerializableEventfulModel` base class." },
      { type: "compare", items: [
        { title: "Object.assign mixin", points: ["`Object.assign(Target.prototype, mixinObj)`", "Copies own enumerable properties only", "Getters/setters are invoked and flattened into plain values", "`super` inside mixin methods refers to the mixin object's prototype, not the target's parent", "No trace in the prototype chain"] },
        { title: "Subclass factory", points: ["`const M = (Base) => class extends Base { … }`", "Inserts a real class into the chain", "`super.method()` calls the next class in the chain", "Supports `#private` fields and `static`", "Order of application defines override order"] },
      ] },
      { type: "p", text: "**How the chain looks.** `class User extends Serializable(Eventful(Model))` creates `User → (anonymous Serializable class) → (anonymous Eventful class) → Model → Object`. Each mixin class is created fresh per application, so `Serializable(A)` and `Serializable(B)` are different classes." },
      { type: "list", items: [
        "**Collisions:** two mixins defining `init()` — the outer one wins unless it calls `super.init()` cooperatively.",
        "**`instanceof` a mixin:** doesn't work directly because each application creates a new class; implement `static [Symbol.hasInstance]` with a brand (e.g. a `WeakSet` or symbol) if you need it.",
        "**Constructors:** mixin constructors should accept `...args` and forward them with `super(...args)`.",
        "**Alternatives:** composition (`this.events = new Emitter()`), or plain functions that operate on objects.",
      ] },
      { type: "callout", tone: "note", title: "Where you'll see them", text: "Lit/web-component libraries and many TypeScript codebases use subclass-factory mixins (TypeScript documents a typed version). React moved *away* from mixins (`createClass` mixins) to hooks because of implicit dependencies and name clashes." },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `const Serializable = (Base) => class extends Base {
  toJSON() { return { type: this.constructor.name, ...this }; }
};

const Eventful = (Base) => class extends Base {
  #handlers = {};
  on(evt, fn) { (this.#handlers[evt] ??= []).push(fn); return this; }
  emit(evt, ...args) { (this.#handlers[evt] ?? []).forEach((fn) => fn(...args)); }
};

class Model {
  constructor(data) { Object.assign(this, data); }
}

class User extends Serializable(Eventful(Model)) {}

const u = new User({ name: 'Ada' });
u.on('saved', (who) => console.log('saved', who));
u.emit('saved', u.name);
console.log(JSON.stringify(u));
console.log(u instanceof Model, typeof u.on);`,
      output: `saved Ada
{"type":"User","name":"Ada"}
true function`,
    },
    walkthrough: [
      { title: "Eventful(Model)", detail: "Returns a new anonymous class extending `Model`, with a private `#handlers` field and `on`/`emit`." },
      { title: "Serializable(…)", detail: "Wraps that class with another anonymous class adding `toJSON`." },
      { title: "new User({ name: 'Ada' })", detail: "Default constructors forward args up the chain to `Model`, which copies `name` onto the instance. `#handlers` is initialised when the Eventful layer's constructor runs." },
      { title: "on / emit", detail: "Found two levels up the prototype chain; the handler logs `saved Ada`." },
      { title: "JSON.stringify(u)", detail: "Calls `toJSON`. Object spread copies only own enumerable *public* properties, so `#handlers` isn't included → `{ type: 'User', name: 'Ada' }`." },
    ],
    followUps: [
      { q: "Why does `super` break with `Object.assign` mixins?", a: "`super` is bound to a method's *home object* — the object literal it was defined in. When you copy the method to another prototype, `super` still looks up the mixin object's prototype (usually `Object.prototype`), not the target class's parent." },
      { q: "How do you resolve two mixins that define the same method?", a: "Application order decides which wins (outermost overrides). Make mixins cooperative by calling `super.method?.(...args)` so each layer adds its behaviour and passes control along the chain." },
      { q: "Mixins vs composition?", a: "Mixins merge behaviour into one object's interface (is-a, implicit). Composition holds helper objects as fields and delegates (has-a, explicit). Composition avoids collisions and is easier to test; mixins give a flatter API. Prefer composition unless the shared interface is genuinely part of the type." },
    ],
    pitfalls: [
      "Copying accessors with `Object.assign` (they are evaluated, not copied).",
      "Silent method name collisions between mixins.",
      "Mixin constructors that don't forward arguments to `super`.",
      "Expecting `u instanceof Serializable` to work — `Serializable` is a factory function, not a class.",
    ],
    glossary: [
      { term: "Mixin", definition: "A reusable set of methods added to a class without being its single parent class." },
      { term: "Subclass factory", definition: "A function that takes a base class and returns a new class extending it, used to apply mixins." },
      { term: "Class expression", definition: "A class defined inline as a value, like `const A = class extends B {}`." },
      { term: "Composition", definition: "Building behaviour by holding and delegating to other objects instead of inheriting from them." },
    ],
    relatedLessons: ["javascript/mixins", "javascript/classes-inheritance", "javascript/prototypes"],
    relatedQuestions: ["js-31", "js-04", "js-43"],
    sources: [],
  },

  // ───────────────────────────────────────────────────────────── 48
  {
    id: "js-48",
    track: "javascript",
    number: 48,
    question: "What does the `async` attribute on a `<script>` tag do, and how is it different from `defer`?",
    level: "beginner",
    frequency: "low",
    tags: ["browser", "script-loading", "performance", "html"],
    shortAnswer:
      "By default, a `<script src>` **blocks** HTML parsing: the browser stops, downloads the script, runs it, and only then continues building the page.\n\nWith `async`, the download happens **in parallel** with parsing, and the script runs **as soon as it arrives** — pausing the parser briefly if it's still going. Async scripts run in whatever order they finish downloading, and may run before or after `DOMContentLoaded`.\n\nWith `defer`, the download is also in parallel, but execution waits until the HTML is fully parsed, and deferred scripts run **in document order**, just before `DOMContentLoaded`.\n\nSo `async` suits independent scripts like analytics or ads, while `defer` suits your app code that needs the DOM or depends on other scripts. Module scripts, `type=\"module\"`, are deferred by default, and `async` on a module makes it run as soon as it and its imports are ready.",
    deep: [
      { type: "table", head: ["", "Download", "Executes", "Order", "Blocks parser?"], rows: [
        ["`<script src>`", "Blocking", "Immediately when downloaded", "Document order", "Yes (fetch + run)"],
        ["`<script async src>`", "Parallel", "As soon as downloaded", "Whichever finishes first", "Only while it runs"],
        ["`<script defer src>`", "Parallel", "After parsing, before `DOMContentLoaded`", "Document order", "No"],
        ["`<script type=\"module\">`", "Parallel (plus its imports)", "Like `defer`", "Document order", "No"],
        ["`<script type=\"module\" async>`", "Parallel (plus its imports)", "As soon as module graph is ready", "Unordered", "Only while it runs"],
      ] },
      { type: "list", items: [
        "**Inline classic scripts** ignore `async` and `defer` — those only apply when `src` is present. Inline *module* scripts do honour `async`.",
        "**Dynamically inserted scripts** (`document.createElement('script')`) behave as async by default; set `script.async = false` to make them execute in insertion order.",
        "**`DOMContentLoaded`** waits for deferred and module scripts, but not for async ones. The window `load` event waits for async scripts too.",
        "**`document.write`** from an async or deferred script is ignored (with a console warning), because the parser isn't at a known position.",
        "If both `async` and `defer` are present, browsers that support `async` use it; `defer` was a legacy fallback.",
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Preload scanner", text: "Even with blocking scripts, modern browsers run a speculative *preload scanner* that discovers and starts fetching later resources while the parser is blocked. That reduces — but doesn't remove — the cost of parser-blocking scripts, because execution still blocks parsing and rendering." },
      { type: "callout", tone: "tip", title: "Rule of thumb", text: "App code: `defer` or `type=\"module\"` in the `<head>`. Independent third-party code that nobody depends on: `async`. Avoid plain blocking scripts in the `<head>` unless something truly must run before the first paint (e.g. a tiny theme snippet to prevent a flash)." },
    ],
    example: {
      type: "code",
      lang: "html",
      caption: "Each external file just logs its own name",
      code: `<!doctype html>
<html>
  <head>
    <script src="analytics.js" async></script>  <!-- logs 'analytics' -->
    <script src="lib.js" defer></script>        <!-- logs 'lib' -->
    <script src="app.js" defer></script>        <!-- logs 'app' (uses lib) -->
    <script>
      console.log('inline');
      document.addEventListener('DOMContentLoaded', () => console.log('DOMContentLoaded'));
    </script>
  </head>
  <body>…</body>
</html>`,
      output: `inline
lib
app
DOMContentLoaded
// 'analytics' can appear at any point — wherever its download finishes`,
    },
    walkthrough: [
      { title: "Parser meets the async script", detail: "Starts downloading `analytics.js` in the background and keeps parsing." },
      { title: "Deferred scripts", detail: "Both downloads start in parallel; execution is queued until parsing finishes, in document order." },
      { title: "Inline script", detail: "Runs immediately when the parser reaches it → `inline`, and registers the `DOMContentLoaded` listener." },
      { title: "Parsing finishes", detail: "`lib` then `app` run in order (even if `app.js` downloaded first), then `DOMContentLoaded` fires." },
      { title: "The async script", detail: "Runs whenever its download completes — possibly between the deferred scripts or after `DOMContentLoaded` — so nothing else should depend on it." },
    ],
    followUps: [
      { q: "Why is putting scripts at the end of `<body>` an older technique?", a: "It avoided blocking parsing of the content above, but the download didn't start until the parser reached the end. `defer` in the `<head>` starts the download early *and* runs after parsing, so it's usually faster." },
      { q: "Can an async script safely use `document.getElementById`?", a: "Not reliably — it may run before the element has been parsed. Either use `defer`, or wait for `DOMContentLoaded` inside the async script (checking `document.readyState` in case it already fired)." },
      { q: "Do `async`/`defer` affect scripts loaded with `import()`?", a: "No. Dynamic `import()` is a runtime call that always loads asynchronously and returns a promise; the attributes only apply to `<script>` elements." },
      { q: "How do `async` and `defer` relate to the event loop?", a: "Each script execution is a task. Deferred scripts run as tasks after parsing; async scripts are queued as tasks when their download completes. Microtasks queued by a script (e.g. promise callbacks) run right after that script's task." },
    ],
    pitfalls: [
      "Using `async` for scripts that depend on each other (order isn't guaranteed).",
      "Adding `defer`/`async` to inline classic scripts and expecting an effect.",
      "Assuming an async script has run before `DOMContentLoaded`.",
      "Forgetting dynamically inserted scripts are async by default.",
    ],
    glossary: [
      { term: "Parser-blocking", definition: "A resource that forces the HTML parser to stop until it has been downloaded and executed." },
      { term: "DOMContentLoaded", definition: "An event fired when the HTML is fully parsed and deferred scripts have run, without waiting for images or async scripts." },
      { term: "Module script", definition: "A `<script type=\"module\">`, which uses ES module semantics and is deferred by default." },
      { term: "Preload scanner", definition: "A secondary browser parser that looks ahead to start fetching resources early." },
    ],
    relatedLessons: ["javascript/script-loading", "javascript/performance", "javascript/modules", "javascript/dom"],
    relatedQuestions: ["js-38", "js-40", "js-17", "js-01"],
    sources: [],
  },

  // ───────────────────────────────────────────────────────────── 49
  {
    id: "js-49",
    track: "javascript",
    number: 49,
    question: "How does `Function.prototype.call()` work, and can you implement it yourself?",
    level: "intermediate",
    frequency: "low",
    tags: ["this", "functions", "call-apply-bind", "implement-it"],
    shortAnswer:
      "`fn.call(thisArg, a, b)` invokes `fn` **immediately**, with `this` set to `thisArg` and the remaining arguments passed individually. It's how you borrow a method for an object that doesn't own it — like `Array.prototype.slice.call(arguments)` or `Object.prototype.toString.call(value)` — and how old-style constructors called their parent: `Parent.call(this, name)`.\n\nThe `this` details: in strict-mode functions `thisArg` is used exactly as given; in sloppy-mode functions `null` or `undefined` becomes `globalThis`, and primitives get boxed into objects. Arrow functions and already-bound functions ignore the `thisArg`.\n\nTo implement it, you temporarily attach the function to the target object under a unique `Symbol` key, call it as a method so normal method-call `this` binding applies, then delete the key.",
    deep: [
      { type: "p", text: "**Overlap note.** js-23 compares `call`, `apply` and `bind` side by side. Here the focus is `call` alone: its exact `this` semantics, method borrowing, and the classic polyfill interview task." },
      { type: "viz", id: "js-this", caption: "`call` is the explicit-binding rule: it overrides the call-site rule for one invocation." },
      { type: "steps", steps: [
        { title: "Check callable", detail: "If `fn` isn't callable, throw `TypeError`." },
        { title: "Prepare this", detail: "Strict-mode target: use `thisArg` as is (even `undefined` or a primitive). Sloppy-mode target: `null`/`undefined` → `globalThis`, primitives → wrapper objects." },
        { title: "Invoke", detail: "Call `fn` with that `this` and the remaining arguments; return its result. Arrow functions ignore the `this` (lexical), bound functions use their bound `this`." },
      ] },
      { type: "table", head: ["Use", "Example"], rows: [
        ["Borrow array methods", "`Array.prototype.map.call('abc', c => c.toUpperCase())`"],
        ["Reliable type tag", "`Object.prototype.toString.call(null)` → `'[object Null]'`"],
        ["Own-property check safely", "`Object.prototype.hasOwnProperty.call(obj, 'k')` (or `Object.hasOwn`)"],
        ["Parent constructor (pre-class)", "`function Dog(n) { Animal.call(this, n); }`"],
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "The polyfill is an approximation", text: "The spec's `call` sets `this` directly in the new execution context. A userland polyfill must fake it by attaching the function to an object, which can't work for frozen/non-extensible objects, always boxes primitives (a strict-mode function would see the wrapper object instead of the primitive), and is briefly visible to `Reflect.ownKeys` or proxies." },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `Function.prototype.myCall = function (thisArg, ...args) {
  if (typeof this !== 'function') throw new TypeError('myCall target is not callable');
  const ctx = thisArg == null ? globalThis : Object(thisArg);
  const key = Symbol('fn');          // unique key: no collision with existing props
  ctx[key] = this;                   // 'this' here is the function being called
  try {
    return ctx[key](...args);        // method call → this === ctx
  } finally {
    delete ctx[key];
  }
};

function greet(greeting, punct) { return greeting + ', ' + this.name + punct; }
const ada = { name: 'Ada' };

console.log(greet.call(ada, 'Hello', '!'));
console.log(greet.myCall(ada, 'Hi', '?'));
console.log(JSON.stringify(Reflect.ownKeys(ada)));   // temporary key removed

const toArray = function () { return Array.prototype.slice.call(arguments); };
console.log(JSON.stringify(toArray(1, 2, 3)));

const bound = greet.bind({ name: 'Bound' });
console.log(bound.call(ada, 'Hey', '.'));             // bound this wins
console.log(Object.prototype.toString.call(null));`,
      output: `Hello, Ada!
Hi, Ada?
["name"]
[1,2,3]
Hey, Bound.
[object Null]`,
    },
    walkthrough: [
      { title: "greet.call(ada, …)", detail: "Native `call` runs `greet` with `this = ada` → `'Hello, Ada!'`." },
      { title: "greet.myCall(ada, …)", detail: "Inside `myCall`, `this` is `greet`. It stores `greet` on `ada` under a fresh symbol and calls `ada[key]('Hi', '?')`, so the method-call rule sets `this = ada`." },
      { title: "Cleanup", detail: "`finally` deletes the temporary key even if the function throws, so `ada` only has `name` afterwards." },
      { title: "Borrowing slice", detail: "`arguments` is array-like but not an array; `slice.call(arguments)` runs the array method on it and returns a real array." },
      { title: "Bound function", detail: "`bind` created a function with a fixed `this`; `call` can't override it." },
      { title: "toString.call(null)", detail: "Borrowing `Object.prototype.toString` gives a reliable internal tag even for `null`." },
    ],
    followUps: [
      { q: "Implement `apply` and `bind` using the same idea.", a: "`apply` is identical but takes an array: `myApply(thisArg, args = [])` → `ctx[key](...args)`. `bind` returns a closure: `function myBind(thisArg, ...pre) { const fn = this; return function (...rest) { return new.target ? new fn(...pre, ...rest) : fn.call(thisArg, ...pre, ...rest); }; }` — the `new.target` branch handles `new` on bound functions." },
      { q: "What happens with `greet.call('str')` in strict vs sloppy mode?", a: "Sloppy: `this` is a `String` wrapper object. Strict: `this` is the primitive `'str'` itself. With `null`/`undefined`, sloppy gives `globalThis` while strict keeps `null`/`undefined`." },
      { q: "Why might `call` be preferred over `apply`?", a: "It reads better when arguments are known individually, and with spread syntax `fn.call(ctx, ...arr)` covers most `apply` use cases. Performance differences are negligible in modern engines." },
      { q: "What does `Function.prototype.call.call(fn, ctx, x)` do?", a: "The outer `call` invokes `call` itself with `this = fn`, so it's equivalent to `fn.call(ctx, x)`. It appears in code that wants a reference to `call` that can't be tampered with via `fn.call` being overridden." },
    ],
    pitfalls: [
      "Passing arguments as an array to `call` (that's `apply`).",
      "Expecting `call` to change an arrow function's or bound function's `this`.",
      "Polyfills using a string key like `ctx.fn`, which can overwrite a real property.",
      "Forgetting `null`/`undefined` handling in sloppy vs strict mode.",
    ],
    glossary: [
      { term: "thisArg", definition: "The value `call`/`apply`/`bind` use as `this` for the invocation." },
      { term: "Method borrowing", definition: "Using one object's method on another object via `call`/`apply`." },
      { term: "Boxing", definition: "Wrapping a primitive in its object form (`'a'` → `String` object) so it can act as `this` in sloppy mode." },
      { term: "Array-like", definition: "An object with numeric indexes and a `length` (like `arguments`) that isn't a real array." },
    ],
    relatedLessons: ["javascript/call-apply-bind", "javascript/this-binding", "javascript/arrow-functions"],
    relatedQuestions: ["js-23", "js-03", "js-29", "js-37"],
    sources: [],
  },

  // ───────────────────────────────────────────────────────────── 50
  {
    id: "js-50",
    track: "javascript",
    number: 50,
    question: "How would you implement a stack in JavaScript, and what problems is it used for?",
    level: "beginner",
    frequency: "low",
    tags: ["data-structures", "stack", "dsa", "implement-it"],
    shortAnswer:
      "A stack is a **last-in, first-out** collection: you `push` onto the top, `pop` from the top, and `peek` to look at the top without removing it. All three are O(1).\n\nIn JavaScript an array already behaves like a stack with `push` and `pop`, both amortised O(1) at the end of the array. For an interview I'd wrap it in a class with a private `#items` array so callers can't reach into the middle, and add `peek`, `isEmpty` and `size`, throwing or returning `undefined` on underflow. Alternatively, a linked list where each node points to the one below gives strict O(1) without array resizing.\n\nClassic uses are matching brackets, undo history, expression evaluation, DFS and backtracking, and the engine's own **call stack**. One thing to avoid: `shift`/`unshift` work at the *front* of the array and are O(n), so don't use them for a stack.",
    deep: [
      { type: "p", text: "**Intuition.** A stack of plates: you can only add or take from the top. The most recent thing you put down is the first thing you get back." },
      { type: "table", head: ["Operation", "Array-backed", "Linked-list-backed"], rows: [
        ["`push`", "Amortised O(1) (occasional resize copy)", "O(1), one node allocation"],
        ["`pop`", "O(1)", "O(1)"],
        ["`peek`", "O(1): `items[items.length - 1]` or `items.at(-1)`", "O(1): `head.value`"],
        ["Memory", "Compact, cache-friendly", "Extra object per element"],
      ] },
      { type: "list", items: [
        "**Balanced brackets:** push openers; on a closer, pop and check it matches.",
        "**Undo/redo:** two stacks; doing an action pushes to undo, undoing moves it to redo.",
        "**DFS / backtracking:** an explicit stack replaces recursion (and avoids stack overflow — see js-42).",
        "**Expression evaluation:** postfix (RPN) evaluation and the shunting-yard algorithm.",
        "**Monotonic stack:** 'next greater element' and histogram problems in O(n).",
        "**The call stack:** the engine pushes a frame per function call and pops on return.",
      ] },
      { type: "viz", id: "js-event-loop", caption: "The call stack is a stack: the event loop only takes the next task when it is empty." },
      { type: "callout", tone: "spec-vs-impl", title: "Array internals", text: "The spec defines `push`/`pop` semantically; complexity is an engine detail. V8 stores dense arrays in a contiguous backing store that grows geometrically, making `push` amortised O(1). `shift` typically moves every element (V8 can sometimes 'left-trim' small arrays cheaply, but don't rely on it)." },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `class Stack {
  #items = [];
  push(...values) { this.#items.push(...values); return this; }
  pop() {
    if (this.isEmpty()) throw new RangeError('stack underflow');
    return this.#items.pop();
  }
  peek() { return this.#items[this.#items.length - 1]; }
  isEmpty() { return this.#items.length === 0; }
  get size() { return this.#items.length; }
}

function isBalanced(str) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const stack = new Stack();
  for (const ch of str) {
    if (ch === '(' || ch === '[' || ch === '{') stack.push(ch);
    else if (ch in pairs) {
      if (stack.isEmpty() || stack.pop() !== pairs[ch]) return false;
    }
  }
  return stack.isEmpty();
}

const s = new Stack().push(1, 2, 3);
console.log(s.pop(), s.peek(), s.size);
console.log(isBalanced('{[()()]}'), isBalanced('([)]'), isBalanced('(('));
try { new Stack().pop(); } catch (e) { console.log(e.name + ': ' + e.message); }`,
      output: `3 2 2
true false false
RangeError: stack underflow`,
    },
    walkthrough: [
      { title: "push(1, 2, 3)", detail: "Items `[1, 2, 3]`; top is 3." },
      { title: "pop / peek / size", detail: "`pop()` removes 3; `peek()` sees 2 without removing it; size is 2." },
      { title: "'{[()()]}'", detail: "Push `{`, `[`, `(`; `)` pops `(` ✓; push `(`; `)` pops ✓; `]` pops `[` ✓; `}` pops `{` ✓; stack empty → `true`." },
      { title: "'([)]'", detail: "Push `(`, `[`; `)` pops `[` which doesn't match `(` → `false`." },
      { title: "'(('", detail: "No closers; two openers left on the stack → not empty → `false`." },
      { title: "Underflow", detail: "Popping an empty stack throws our `RangeError`." },
    ],
    followUps: [
      { q: "Design a stack with O(1) `getMin()`.", a: "Keep a second stack of minimums: on `push(x)`, push `min(x, currentMin)` onto it; on `pop`, pop both. `getMin()` is the top of the min stack. Space is O(n) extra (can be optimised by pushing only when `x <= currentMin`)." },
      { q: "Implement a queue using two stacks.", a: "`inbox` for enqueue, `outbox` for dequeue. On dequeue, if `outbox` is empty, pop everything from `inbox` into `outbox` (reversing order), then pop `outbox`. Each element moves at most once, so operations are amortised O(1)." },
      { q: "How does this relate to 'Maximum call stack size exceeded'?", a: "The engine's call stack has a fixed size. Each call pushes a frame; unbounded or very deep recursion overflows it and throws `RangeError`. Converting recursion to an explicit heap-allocated stack like this class removes that limit." },
      { q: "Why might `push(...values)` be risky for huge inputs?", a: "Spreading a very large array into function arguments can exceed the engine's argument limit and throw `RangeError`. For bulk inserts, loop and push one at a time." },
    ],
    pitfalls: [
      "Using `shift`/`unshift` (front of the array) for stack operations — O(n).",
      "Not defining underflow behaviour (silently returning `undefined` vs throwing).",
      "Exposing the internal array so callers can mutate the middle.",
      "Confusing stack (LIFO) with queue (FIFO).",
    ],
    glossary: [
      { term: "LIFO", definition: "Last In, First Out — the most recently added item is removed first." },
      { term: "Amortised O(1)", definition: "Usually constant time, with occasional expensive operations (like resizing) that average out to constant per operation." },
      { term: "Underflow", definition: "Trying to pop from an empty stack." },
      { term: "Call stack", definition: "The engine's stack of active function calls; each call pushes a frame and each return pops one." },
    ],
    relatedLessons: ["javascript/call-stack", "dsa/stacks-queues", "dsa/recursion"],
    relatedQuestions: ["js-42", "js-01"],
    sources: [],
  },

  // ───────────────────────────────────────────────────────────── 51
  {
    id: "js-51",
    track: "javascript",
    number: 51,
    question: "What is the difference between `Object.seal()` and `Object.freeze()`?",
    level: "beginner",
    frequency: "low",
    tags: ["objects", "immutability", "property-descriptors"],
    shortAnswer:
      "Both lock an object's **shape**: you can't add new properties or delete existing ones, and the prototype can't be changed. The difference is values. `Object.seal` still lets you **change existing property values**, because they stay writable. `Object.freeze` also makes data properties **read-only**, so nothing can change.\n\nThey're two rungs on a ladder. `preventExtensions` only blocks adding. `seal` adds non-configurable properties, so no deleting and no redefining. `freeze` adds non-writable values. You check them with `Object.isExtensible`, `isSealed` and `isFrozen`.\n\nBoth are **shallow** — nested objects remain mutable — both are irreversible, and in sloppy mode violations fail silently while strict mode throws `TypeError`.",
    deep: [
      { type: "p", text: "**Overlap note.** js-35 covers `Object.freeze` on its own (shallowness, deep freeze, `const` vs freeze). This question is the comparison: exactly which operations each level forbids." },
      { type: "table", head: ["Operation", "preventExtensions", "seal", "freeze"], rows: [
        ["Add property", "✗", "✗", "✗"],
        ["Delete property", "✓", "✗", "✗"],
        ["Change value of existing data property", "✓", "✓", "✗"],
        ["Reconfigure (enumerable, accessor ↔ data)", "✓", "✗", "✗"],
        ["Change prototype", "✗", "✗", "✗"],
        ["Mutate nested objects", "✓", "✓", "✓"],
        ["Setters still run", "✓", "✓", "✓"],
      ] },
      { type: "steps", steps: [
        { title: "seal", detail: "`[[PreventExtensions]]`, then every own property → `configurable: false`." },
        { title: "freeze", detail: "Same, plus every own **data** property → `writable: false`. Accessors keep their get/set." },
      ] },
      { type: "list", items: [
        "**Vacuous truth:** an empty sealed or non-extensible object is also frozen — `Object.isFrozen(Object.seal({}))` is `true` — because there are no properties left that could change.",
        "**Arrays:** a sealed array can have elements overwritten (`arr[0] = 9`) but not `push`/`pop` (length changes). A frozen array allows neither.",
        "**One-way:** once non-configurable, a property can still go from `writable: true` to `false` (that's how freeze builds on seal) but never back.",
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Same primitive underneath", text: "Both are defined by the spec's `SetIntegrityLevel(O, 'sealed' | 'frozen')` and checked by `TestIntegrityLevel`. They work on proxies too, by calling the proxy's `preventExtensions` and `defineProperty` traps." },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `'use strict';
const sealed = Object.seal({ a: 1 });
const frozen = Object.freeze({ a: 1 });

function attempt(label, fn) {
  try { fn(); console.log(label, 'ok'); }
  catch (e) { console.log(label, e.constructor.name); }
}

attempt('sealed: modify', () => { sealed.a = 2; });
attempt('sealed: add   ', () => { sealed.b = 1; });
attempt('sealed: delete', () => { delete sealed.a; });
attempt('frozen: modify', () => { frozen.a = 2; });

console.log(sealed.a, frozen.a);
console.log(Object.isSealed(frozen), Object.isFrozen(sealed));
console.log(Object.isFrozen(Object.seal({})));`,
      output: `sealed: modify ok
sealed: add    TypeError
sealed: delete TypeError
frozen: modify TypeError
2 1
true false
true`,
    },
    walkthrough: [
      { title: "sealed.a = 2", detail: "`a` is still writable → succeeds." },
      { title: "sealed.b = 1", detail: "The object is non-extensible → strict mode throws `TypeError`." },
      { title: "delete sealed.a", detail: "`a` is non-configurable → `TypeError`." },
      { title: "frozen.a = 2", detail: "Frozen data properties are non-writable → `TypeError`." },
      { title: "Integrity checks", detail: "Every frozen object is also sealed. A sealed object with a writable property isn't frozen — but an empty sealed object is, vacuously." },
    ],
    followUps: [
      { q: "When would you choose seal over freeze?", a: "When the set of fields is fixed but values legitimately change — e.g. a state object whose keys must not be misspelled or added by accident. A typo like `state.cuont = 1` throws in strict mode instead of silently creating a new property." },
      { q: "Can you add a property to a sealed object's prototype and see it on the object?", a: "Yes. Sealing affects only the object's own properties and its prototype link; the prototype object itself is untouched, so inherited properties added there are still visible." },
      { q: "Do seal/freeze make code faster?", a: "Not reliably. They're for enforcing invariants. Engines may optimise some cases and de-optimise others; measure if it matters." },
    ],
    pitfalls: [
      "Thinking seal prevents value changes.",
      "Assuming either is deep.",
      "Not noticing silent failures in sloppy-mode code.",
      "Trying to undo sealing/freezing.",
    ],
    glossary: [
      { term: "Non-extensible", definition: "An object that can't receive new properties." },
      { term: "Non-configurable", definition: "A property that can't be deleted or have its attributes changed (except writable true → false)." },
      { term: "Non-writable", definition: "A data property whose value can't be changed by assignment." },
      { term: "Integrity level", definition: "The spec's name for the sealed/frozen states set by `SetIntegrityLevel`." },
    ],
    relatedLessons: ["javascript/freeze-seal"],
    relatedQuestions: ["js-35", "js-33", "js-37"],
    sources: [],
  },

  // ───────────────────────────────────────────────────────────── 52
  {
    id: "js-52",
    track: "javascript",
    number: 52,
    question: "What happens when you call `JSON.stringify()` on an object with circular references, and how do you handle it?",
    level: "intermediate",
    frequency: "low",
    tags: ["json", "serialization", "circular-references", "weakset"],
    shortAnswer:
      "`JSON.stringify` walks the object graph recursively. If it reaches an object that's already on the current path — say `user.self = user`, or a parent and child that point at each other — it throws a **`TypeError`**, with messages like \"Converting circular structure to JSON\" in V8 or \"cyclic object value\" in Firefox. JSON is a tree format and has no way to express references.\n\nTo handle it, I pass a **replacer** function that tracks objects it has seen in a `WeakSet` and returns a placeholder like `'[Circular]'` — or `undefined` to drop the key — when it meets one again. A caveat: a simple \"seen\" set also flags objects that are merely **shared** in two places without any cycle; to be exact you track only the current ancestor path.\n\nAlternatives: if you just need a copy, `structuredClone` handles cycles natively. Libraries like `flatted` encode references so they can be restored. Or redesign the data so it stores IDs instead of back-references.",
    deep: [
      { type: "p", text: "**Intuition.** JSON can only write things out as nested boxes. A cycle is a box that contains itself — you'd write forever, so the serializer stops and throws instead." },
      { type: "viz", id: "js-references", caption: "A cycle: following references from `user` eventually leads back to `user`." },
      { type: "steps", steps: [
        { title: "Stack check", detail: "The spec's `SerializeJSONObject` keeps a stack of objects currently being serialised. If the value is already in that stack, it throws `TypeError`." },
        { title: "Replacer call order", detail: "A replacer function is called with `this` = the containing object, first for the root (key `''`), then for each property before it is serialised — so it can swap in a placeholder before recursion happens." },
        { title: "Placeholder", detail: "Returning a string replaces the value; returning `undefined` omits the property (or becomes `null` inside arrays)." },
      ] },
      { type: "compare", items: [
        { title: "WeakSet 'seen' replacer", points: ["Simple, common answer", "Flags *any* repeated object, even non-circular shared ones", "Output loses the second occurrence"] },
        { title: "Ancestor-path replacer", points: ["Tracks only objects on the current path (using `this`)", "Flags true cycles only; shared objects serialise twice", "Slightly more code"] },
      ] },
      { type: "list", items: [
        "**Other `TypeError`s:** `BigInt` values also throw unless they define `toJSON`.",
        "**Silently dropped:** `undefined`, functions and symbols (as values) are omitted in objects and become `null` in arrays; `NaN`/`Infinity` become `null`; `Date` uses `toJSON` → ISO string; `Map`/`Set` become `{}`.",
        "**`toJSON`** on an object is called first and its return value is serialised — another place to break cycles.",
        "**Node's `util.inspect`** (and `console.log`) prints cycles as `<ref *1>` … `[Circular *1]` instead of throwing — it's not JSON.",
      ] },
      { type: "callout", tone: "spec-vs-impl", title: "Error messages differ", text: "The exception type (`TypeError`) is specified; the message is not. V8 says \"Converting circular structure to JSON\" and names the closing property; Firefox says \"cyclic object value\"; Safari says \"JSON.stringify cannot serialize cyclic structures\". Don't match on the message text." },
    ],
    example: {
      type: "code",
      lang: "js",
      runnable: true,
      code: `const user = { name: 'Ada' };
user.self = user;                        // cycle

try { JSON.stringify(user); } catch (e) { console.log(e.constructor.name); }

function getCircularReplacer() {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    return value;
  };
}
console.log(JSON.stringify(user, getCircularReplacer()));

// Caveat: a shared (non-circular) object is also flagged
const shared = { x: 1 };
console.log(JSON.stringify({ a: shared, b: shared }, getCircularReplacer()));

// Exact version: only objects on the current ancestor path count
function safeStringify(value) {
  const ancestors = [];
  return JSON.stringify(value, function (key, val) {
    if (typeof val !== 'object' || val === null) return val;
    while (ancestors.length > 0 && ancestors[ancestors.length - 1] !== this) ancestors.pop();
    if (ancestors.includes(val)) return '[Circular]';
    ancestors.push(val);
    return val;
  });
}
console.log(safeStringify({ a: shared, b: shared }));
console.log(safeStringify(user));

const clone = structuredClone(user);     // copies cycles natively
console.log(clone.self === clone, clone !== user);`,
      output: `TypeError
{"name":"Ada","self":"[Circular]"}
{"a":{"x":1},"b":"[Circular]"}
{"a":{"x":1},"b":{"x":1}}
{"name":"Ada","self":"[Circular]"}
true true`,
    },
    walkthrough: [
      { title: "Plain stringify", detail: "Serialising `user.self` finds `user` already on the stack → `TypeError`." },
      { title: "WeakSet replacer", detail: "Root call (`key ''`) adds `user` to `seen`. When the `self` key yields `user` again, it's in `seen` → replaced by `'[Circular]'` before recursion." },
      { title: "Shared object false positive", detail: "`shared` is added when serialising `a`; at `b` it's 'seen' again and replaced — even though there's no cycle." },
      { title: "Ancestor-path replacer", detail: "`this` is the object that holds `key`. Popping ancestors until the top is `this` keeps exactly the current path. At `b`, `shared` is no longer an ancestor, so it serialises normally; `user.self` is still detected." },
      { title: "structuredClone", detail: "The structured clone algorithm keeps a memory map of already-copied objects, so the clone's `self` points to the clone itself." },
    ],
    followUps: [
      { q: "How would you serialise a cyclic graph so it can be restored?", a: "Encode references explicitly: assign each object an id and replace repeated objects with `{ $ref: id }` (as in Crockford's `cycle.js` decycle/retrocycle), or use a library like `flatted`. On parse, a reviver resolves the references back into real links." },
      { q: "Why use a WeakSet rather than a Set in the replacer?", a: "Either works since the replacer is short-lived, but a WeakSet is the idiomatic choice: it accepts only objects, matches identity, and doesn't keep the objects alive if the replacer is retained. It also signals intent ('membership marker')." },
      { q: "Does `structuredClone` handle everything?", a: "It handles cycles, `Map`, `Set`, `Date`, `RegExp`, typed arrays and more, but throws `DataCloneError` on functions, DOM nodes and some host objects, and drops prototypes (class instances become plain objects) and property descriptors (getters are evaluated)." },
      { q: "Where do circular references commonly appear in practice?", a: "Parent/child links in trees (`node.parent`), doubly linked lists, ORM entities with bidirectional relations, Express `req`/`res` objects, DOM nodes, and error objects with `cause` chains that loop. Logging such objects with `JSON.stringify` is a classic production crash." },
    ],
    pitfalls: [
      "Using a 'seen' set and silently losing legitimately shared data.",
      "Matching on the error message text, which differs per engine.",
      "Forgetting that `BigInt` also throws in `JSON.stringify`.",
      "Using `JSON.parse(JSON.stringify(x))` for deep copy on cyclic data — use `structuredClone`.",
    ],
    glossary: [
      { term: "Circular reference", definition: "A chain of references that leads from an object back to itself." },
      { term: "Replacer", definition: "The optional second argument to `JSON.stringify`: a function (or key array) that can change or drop values during serialisation." },
      { term: "structuredClone", definition: "A built-in deep-copy function using the structured clone algorithm, which supports cycles and many built-in types." },
      { term: "Serialisation", definition: "Turning in-memory data into a string or bytes that can be stored or sent." },
    ],
    relatedLessons: ["javascript/json-circular", "javascript/deep-copy", "javascript/weakmap-weakset", "backend/serialization"],
    relatedQuestions: ["js-18", "js-39", "js-32"],
    sources: [],
  },
];
