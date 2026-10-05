import { TraceBuilder, env, setProp, setVar, heapObj, type Trace } from "./trace";

/* ------------------------------------------------------------------ closure */
function closureTrace(): Trace {
  const code = `function makeCounter() {
  let count = 0;
  return function increment() {
    count++;
    return count;
  };
}

const counter = makeCounter();
console.log(counter());
console.log(counter());`;
  const t = new TraceBuilder();
  t.step(null, "Before any line runs, the engine creates the **global execution context**. In its creation phase it records every declaration: `makeCounter` is a function declaration, so it is created right away as a function object on the heap. `counter` is a `const`, so it exists but stays *uninitialized* (temporal dead zone) until its line runs.", (s) => {
    s.stack = [{ name: "global", env: "G" }];
    s.heap = [{ id: "f1", label: "function makeCounter", props: [{ name: "[[Environment]]", value: "→ Global" }] }];
    s.envs = [{ id: "G", label: "Global", bindings: [{ name: "makeCounter", value: "ƒ", ref: "f1" }, { name: "counter", value: "<uninitialized>", state: "uninit" }] }];
  }, "creation");
  t.step(9, "`makeCounter()` is called. A new **execution context** is pushed onto the call stack, with a fresh **lexical environment** (`makeCounter` env) whose *outer* reference is where the function was *defined* — the global environment. `count` is hoisted but uninitialized.", (s) => {
    s.stack.push({ name: "makeCounter()", env: "E1" });
    s.envs.push({ id: "E1", label: "makeCounter #1", outer: "G", bindings: [{ name: "count", value: "<uninitialized>", state: "uninit" }] });
  });
  t.step(2, "`let count = 0` initializes the binding in makeCounter's environment.", (s) => setVar(s, "E1", "count", "0"));
  t.step(3, "A new function object `increment` is created. Every function stores a hidden `[[Environment]]` slot pointing to the environment it was created in — here, makeCounter's environment. **This pointer is the closure.**", (s) => {
    s.heap.push({ id: "f2", label: "function increment", props: [{ name: "[[Environment]]", value: "→ makeCounter #1" }] });
  });
  t.step(9, "`makeCounter` returns the function and its execution context is **popped** off the stack. Normally its environment would now be garbage. But `increment.[[Environment]]` still points at it, so it stays reachable on the heap — it is *retained*. `counter` now references the function.", (s) => {
    s.stack.pop();
    env(s, "E1").retained = true;
    setVar(s, "G", "counter", "ƒ increment", "f2");
  });
  t.step(10, "Calling `counter()` pushes a new context for `increment`. Its new environment is empty, and its *outer* reference comes from `[[Environment]]` — the retained makeCounter environment, **not** the caller's.", (s) => {
    s.stack.push({ name: "increment()", env: "E2" });
    s.envs.push({ id: "E2", label: "increment #1", outer: "E1", bindings: [] });
  });
  t.step(4, "`count++`: `count` isn't in increment's own environment, so the engine walks the scope chain outward: increment → makeCounter #1, finds `count` and updates it to 1.", (s) => setVar(s, "E1", "count", "1"));
  t.step(5, "`return count` returns 1. The increment context is popped; its (empty) environment is no longer referenced. `console.log` prints 1.", (s) => {
    s.stack.pop();
    env(s, "E2").dead = true;
    s.console.push("1");
  });
  t.step(11, "Second call: another fresh increment environment, but the *same* outer environment — the state survived between calls.", (s) => {
    s.envs = s.envs.filter((e) => e.id !== "E2");
    s.stack.push({ name: "increment()", env: "E3" });
    s.envs.push({ id: "E3", label: "increment #2", outer: "E1", bindings: [] });
  });
  t.step(4, "`count++` updates the same `count`, now 2.", (s) => setVar(s, "E1", "count", "2"));
  t.step(5, "Returns 2 and prints it. The makeCounter environment will stay alive as long as `counter` is reachable. Setting `counter = null` would make both the function and its environment unreachable, so the garbage collector could reclaim them.", (s) => {
    s.stack.pop();
    s.envs = s.envs.filter((e) => e.id !== "E3");
    s.console.push("2");
  });
  return {
    id: "js-closure", title: "Closures and retained environments", code, panels: ["stack", "envs", "heap", "console"], steps: t.steps,
    takeaway: "A closure is a function plus the environment it was created in. The environment survives the call that created it because the function object keeps a reference to it.",
  };
}

/* --------------------------------------------------------------- event loop */
function eventLoopTrace(): Trace {
  const code = `console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
queueMicrotask(() => console.log("D"));
(async () => {
  console.log("E");
  await null;
  console.log("F");
})();
console.log("G");`;
  const t = new TraceBuilder();
  t.step(null, "The whole script is itself a **task**. While it runs, the call stack is never empty. Nothing from any queue can run until the stack is empty.", (s) => {
    s.stack = [{ name: "script (global)" }];
  });
  t.step(1, "Synchronous: prints **A** immediately.", (s) => s.console.push("A"));
  t.step(2, "`setTimeout` hands the callback to the host's timer (a Web API in browsers, libuv in Node). Even with 0 ms, the callback can only enter the **task queue** after the timer fires — and it will only run once the stack is empty and all microtasks are drained.", (s) => s.webapis.push("timer 0ms → () => log B"));
  t.step(2, "The timer has expired (≈ immediately), so its callback is queued as a **task** (macrotask).", (s) => {
    s.webapis = [];
    s.tasks.push("() => log B");
  });
  t.step(3, "`Promise.resolve()` is already fulfilled, so `.then` immediately queues a **promise reaction job** in the **microtask queue**.", (s) => s.microtasks.push("() => log C"));
  t.step(4, "`queueMicrotask` also adds to the microtask queue, behind C.", (s) => s.microtasks.push("() => log D"));
  t.step(5, "The async arrow function is called. **An async function runs synchronously until its first `await`.**", (s) => s.stack.push({ name: "async arrow()" }));
  t.step(6, "Prints **E** synchronously.", (s) => s.console.push("E"));
  t.step(7, "`await null` wraps `null` in a resolved promise and suspends the function. Its continuation (the rest of the body) is queued as a microtask. The function returns a pending promise to the caller and is popped.", (s) => {
    s.stack.pop();
    s.microtasks.push("resume async arrow → log F");
  });
  t.step(10, "Still synchronous: prints **G**. Then the script ends and the stack becomes empty.", (s) => s.console.push("G"));
  t.step(null, "Stack is empty → the event loop performs a **microtask checkpoint**: it runs microtasks one by one *until the queue is empty* — including any microtasks added while draining.", (s) => {
    s.stack = [];
  }, "microtasks");
  t.step(3, "First microtask: prints **C**.", (s) => {
    s.microtasks.shift();
    s.stack = [{ name: "() => log C" }];
    s.console.push("C");
  }, "microtasks");
  t.step(4, "Next microtask: prints **D**.", (s) => {
    s.microtasks.shift();
    s.stack = [{ name: "() => log D" }];
    s.console.push("D");
  }, "microtasks");
  t.step(8, "The async function resumes after `await` and prints **F**. Its promise fulfils (nobody is listening).", (s) => {
    s.microtasks.shift();
    s.stack = [{ name: "async arrow (resumed)" }];
    s.console.push("F");
  }, "microtasks");
  t.step(null, "Microtask queue is empty. Browsers may now render. Then the event loop takes the **next task** from the task queue.", (s) => {
    s.stack = [];
  }, "task");
  t.step(2, "The timer callback finally runs and prints **B**. Final order: A E G C D F B.", (s) => {
    s.tasks.shift();
    s.stack = [{ name: "() => log B" }];
    s.console.push("B");
  }, "task");
  t.step(null, "Everything has run. Rule of thumb: synchronous code → all microtasks → one task → all microtasks → next task…", (s) => {
    s.stack = [];
  });
  return {
    id: "js-event-loop", title: "Event loop: tasks vs microtasks", code, panels: ["stack", "queues", "console"], steps: t.steps,
    takeaway: "After each task (including the initial script), the microtask queue is drained completely before the next task runs. That's why promise callbacks beat setTimeout(…, 0).",
  };
}

/* ---------------------------------------------------------------- hoisting */
function hoistingTrace(): Trace {
  const code = `console.log(a);
console.log(greet());
console.log(b);
var a = 1;
let b = 2;
function greet() {
  return "hi";
}`;
  const t = new TraceBuilder();
  t.step(null, "**Creation phase.** Before running any line, the engine scans the scope for declarations and creates bindings: `var a` is created *and initialized to `undefined`*; `let b` is created but left **uninitialized**; the function declaration `greet` is created *and fully initialized* with its function object. Nothing is physically moved — that's what “hoisting” really means.", (s) => {
    s.stack = [{ name: "global", env: "G" }];
    s.envs = [{ id: "G", label: "Global", bindings: [{ name: "a", value: "undefined" }, { name: "b", value: "<uninitialized>", state: "uninit" }, { name: "greet", value: "ƒ greet", ref: "f1" }] }];
    s.heap = [{ id: "f1", label: "function greet", props: [] }];
  }, "creation");
  t.step(1, "**Execution phase.** `a` exists and holds `undefined`, so this prints `undefined` — no error.", (s) => s.console.push("undefined"), "execution");
  t.step(2, "`greet` was fully initialized during creation, so calling it before its line works and prints `hi`.", (s) => {
    s.stack.push({ name: "greet()" });
    s.console.push("hi");
  }, "execution");
  t.step(3, "`b` exists but is still uninitialized — reading it here is inside its **temporal dead zone (TDZ)**, which runs from the start of the scope until the `let` line executes. The engine throws.", (s) => {
    s.stack.pop();
    s.error = "ReferenceError: Cannot access 'b' before initialization";
    s.console.push("Uncaught ReferenceError: Cannot access 'b' before initialization");
  }, "execution");
  t.step(5, "Had execution continued (e.g. if line 3 were removed), `var a = 1` would assign 1 and `let b = 2` would *initialize* b, ending its TDZ. The TDZ exists so that reading a variable before its declaration is a loud error rather than a silent `undefined`.", (s) => {
    setVar(s, "G", "a", "1");
    const b = env(s, "G").bindings.find((x) => x.name === "b")!;
    b.value = "2";
    b.state = "changed";
  }, "what-if");
  return {
    id: "js-hoisting", title: "Hoisting and the temporal dead zone", code, panels: ["stack", "envs", "console"], steps: t.steps,
    takeaway: "All declarations are registered before execution. var starts as undefined, function declarations start fully usable, and let/const/class start uninitialized (TDZ) until their declaration runs.",
  };
}

/* -------------------------------------------------------------------- this */
function thisTrace(): Trace {
  const code = `"use strict";
function show() {
  return this;
}
const user = { name: "Ada", show };

user.show();                 // 1
show();                      // 2
show.call({ name: "Bo" });   // 3
const bound = show.bind(user);
bound.call({ name: "Bo" });  // 4
new show();                  // 5

const team = {
  name: "Core",
  names() {
    return ["x"].map(() => this.name);
  },
};
team.names();                // 6`;
  const t = new TraceBuilder();
  t.step(null, "`this` is **not** decided where a function is written. For regular functions it is decided by **how the function is called**. Arrow functions are the exception: they have no `this` of their own and use the `this` of the surrounding code.", (s) => {
    s.stack = [{ name: "global" }];
  });
  t.step(7, "**Method call** `obj.fn()`: the object before the dot becomes `this`. → returns `user`.", (s) => {
    s.stack = [{ name: "global" }, { name: "show()", thisValue: "user { name: \"Ada\" }" }];
    s.console.push("1 → user");
  });
  t.step(8, "**Plain call** `fn()`: no object before the dot. In strict mode `this` is `undefined` (in sloppy mode it would be the global object — a classic source of bugs).", (s) => {
    s.stack = [{ name: "global" }, { name: "show()", thisValue: "undefined" }];
    s.console.push("2 → undefined");
  });
  t.step(9, "**Explicit binding** with `call`/`apply`: the first argument becomes `this`.", (s) => {
    s.stack = [{ name: "global" }, { name: "show()", thisValue: "{ name: \"Bo\" }" }];
    s.console.push("3 → { name: \"Bo\" }");
  });
  t.step(10, "`bind` creates a **new bound function** whose `this` is permanently fixed to `user`.", (s) => {
    s.stack = [{ name: "global" }];
    s.heap = [{ id: "b", label: "bound show", props: [{ name: "[[BoundThis]]", value: "user" }, { name: "[[BoundTargetFunction]]", value: "show" }] }];
  });
  t.step(11, "Calling a bound function with `call` **cannot** override the bound `this` — `bind` wins. → returns `user`.", (s) => {
    s.stack = [{ name: "global" }, { name: "show() via bound", thisValue: "user { name: \"Ada\" }" }];
    s.console.push("4 → user");
  });
  t.step(12, "**`new`**: the engine creates a fresh object (linked to `show.prototype`) and uses it as `this`. `new` even beats `bind`.", (s) => {
    s.stack = [{ name: "global" }, { name: "new show()", thisValue: "{} (new instance of show)" }];
    s.console.push("5 → show {}");
  });
  t.step(20, "`team.names()` is a method call, so inside `names`, `this` is `team`.", (s) => {
    s.stack = [{ name: "global" }, { name: "names()", thisValue: "team" }];
  });
  t.step(17, "The arrow callback passed to `map` has **no own `this`**. It looks up `this` lexically — from `names`, where it is `team`. A regular `function` callback here would get `undefined` (plain call inside map). → `[\"Core\"]`.", (s) => {
    s.stack = [{ name: "global" }, { name: "names()", thisValue: "team" }, { name: "map()" }, { name: "arrow (lexical this)", thisValue: "team ← inherited from names()" }];
    s.console.push("6 → [\"Core\"]");
  });
  t.step(null, "Precedence for regular functions: `new` > `bind` > `call`/`apply` > method call > plain call. Arrow functions ignore all of these.", (s) => {
    s.stack = [{ name: "global" }];
  });
  return {
    id: "js-this", title: "How `this` is bound", code, panels: ["stack", "heap", "console"], steps: t.steps,
    takeaway: "For regular functions `this` is set by the call site (new, bind, call/apply, obj.method(), plain call). Arrow functions capture `this` from where they are defined.",
  };
}

/* -------------------------------------------------------------- references */
function referencesTrace(): Trace {
  const code = `let x = 10;
let y = x;
y = 20;
const a = { n: 1, tags: ["js"] };
const b = a;
b.n = 2;
const c = { ...a };
c.n = 3;
c.tags.push("go");
console.log(x, y, a.n, c.n, a.tags);
let temp = { big: "data" };
temp = null;`;
  const t = new TraceBuilder();
  t.step(null, "Conceptual picture: variables hold either a **primitive value** directly or a **reference** (an address) to an object on the **heap**. (Engines optimise this in many ways — e.g. V8 stores small integers inline and may keep captured variables in heap “contexts” — but the observable semantics match this model.)", (s) => {
    s.stack = [{ name: "global", env: "G" }];
    s.envs = [{ id: "G", label: "Global", bindings: [] }];
  });
  t.step(1, "`x` holds the primitive 10.", (s) => setVar(s, "G", "x", "10"));
  t.step(2, "`let y = x` **copies the value**. x and y are independent.", (s) => setVar(s, "G", "y", "10"));
  t.step(3, "Changing y doesn't touch x.", (s) => setVar(s, "G", "y", "20"));
  t.step(4, "An object literal allocates an object on the heap (and the array inside it is a separate heap object). `a` holds a reference to it.", (s) => {
    s.heap.push({ id: "o1", label: "Object #1", props: [{ name: "n", value: "1" }, { name: "tags", value: "→ Array #2", ref: "o2" }] });
    s.heap.push({ id: "o2", label: "Array #2", props: [{ name: "0", value: "\"js\"" }] });
    setVar(s, "G", "a", "→ Object #1", "o1");
  });
  t.step(5, "`const b = a` copies the **reference**, not the object. Both names now point at the same object — this is **aliasing**.", (s) => setVar(s, "G", "b", "→ Object #1", "o1"));
  t.step(6, "Mutating through `b` is visible through `a` because there is only one object. (`const` only stops re-assigning `b`; it doesn't freeze the object.)", (s) => setProp(s, "o1", "n", "2"));
  t.step(7, "Spread `{ ...a }` creates a **new** object and copies a's own properties one level deep. `n` is copied as a value; `tags` is copied as a *reference* to the same array. This is a **shallow copy**.", (s) => {
    s.heap.push({ id: "o3", label: "Object #3", props: [{ name: "n", value: "2" }, { name: "tags", value: "→ Array #2", ref: "o2" }] });
    setVar(s, "G", "c", "→ Object #3", "o3");
  });
  t.step(8, "`c.n = 3` changes only the new object.", (s) => setProp(s, "o3", "n", "3"));
  t.step(9, "But `c.tags.push(\"go\")` mutates the **shared** array — `a.tags` sees it too. Use `structuredClone(a)` for a deep copy.", (s) => setProp(s, "o2", "1", "\"go\""));
  t.step(10, "Prints `10 20 2 3 [\"js\", \"go\"]`.", (s) => s.console.push("10 20 2 3 [\"js\", \"go\"]"));
  t.step(11, "Another object is allocated and referenced by `temp`.", (s) => {
    s.heap.push({ id: "o4", label: "Object #4", props: [{ name: "big", value: "\"data\"" }] });
    setVar(s, "G", "temp", "→ Object #4", "o4");
  });
  t.step(12, "After `temp = null`, nothing references Object #4. It is **unreachable**, so a future garbage-collection cycle may reclaim it (mark-and-sweep starts from roots like the global object and the stack and frees whatever it can't reach). You can't control *when* that happens.", (s) => {
    setVar(s, "G", "temp", "null");
    heapObj(s, "o4").unreachable = true;
  });
  return {
    id: "js-references", title: "Stack values, heap objects and aliasing", code, panels: ["envs", "heap", "console"], steps: t.steps,
    takeaway: "Assignment copies primitives by value and objects by reference. Spread/Object.assign copy one level (shallow). Objects that nothing reachable references can be garbage-collected.",
  };
}

/* --------------------------------------------------------------- async/await */
function asyncAwaitTrace(): Trace {
  const code = `async function load() {
  console.log("2: load starts");
  const v = await fetchValue();
  console.log("5: resumed with", v);
  return v * 2;
}
function fetchValue() {
  console.log("3: fetchValue runs");
  return Promise.resolve(21);
}
console.log("1: start");
load().then((r) => console.log("6: result", r));
console.log("4: sync code continues");`;
  const t = new TraceBuilder();
  t.step(null, "Two function declarations are registered; the script task starts.", (s) => {
    s.stack = [{ name: "script" }];
  });
  t.step(11, "Synchronous log.", (s) => s.console.push("1: start"));
  t.step(12, "Calling an async function creates its **result promise** (pending) and starts running the body *synchronously*.", (s) => {
    s.stack.push({ name: "load()" });
    s.heap = [{ id: "p1", label: "Promise (load result)", props: [{ name: "[[PromiseState]]", value: "pending" }] }];
  });
  t.step(2, "Still synchronous — no await yet.", (s) => s.console.push("2: load starts"));
  t.step(3, "The operand of `await` is evaluated first: `fetchValue()` runs synchronously and returns an already-fulfilled promise (21).", (s) => {
    s.stack.push({ name: "fetchValue()" });
    s.console.push("3: fetchValue runs");
    s.heap.push({ id: "p2", label: "Promise (fetchValue)", props: [{ name: "[[PromiseState]]", value: "fulfilled: 21" }] });
  });
  t.step(3, "`await` **suspends** `load`: its stack frame is saved (as a generator-like continuation) and popped. Because p2 is already fulfilled, the continuation is queued as a microtask right away. Control returns to the caller with the pending promise.", (s) => {
    s.stack = [{ name: "script" }];
    s.microtasks.push("resume load() with 21");
  });
  t.step(12, "`.then(...)` registers a reaction on load's still-pending promise. Nothing is queued yet.", (s) => {
    setProp(s, "p1", "reactions", "[(r) => log 6]");
  });
  t.step(13, "The rest of the script runs **before** load resumes — await never blocks the thread.", (s) => s.console.push("4: sync code continues"));
  t.step(null, "Script task done; stack empty → drain microtasks.", (s) => {
    s.stack = [];
  }, "microtasks");
  t.step(4, "`load` resumes exactly where it left off, with `v = 21`.", (s) => {
    s.microtasks.shift();
    s.stack = [{ name: "load() (resumed)" }];
    s.console.push("5: resumed with 21");
  }, "microtasks");
  t.step(5, "`return 42` fulfils load's promise, which queues its `.then` reaction as another microtask — run in the same checkpoint.", (s) => {
    s.stack = [];
    setProp(s, "p1", "[[PromiseState]]", "fulfilled: 42");
    s.microtasks.push("(r) => log 6 with 42");
  }, "microtasks");
  t.step(12, "The reaction runs: prints the result.", (s) => {
    s.microtasks.shift();
    s.stack = [{ name: "(r) => …" }];
    s.console.push("6: result 42");
  }, "microtasks");
  t.step(null, "Done. `await` = “pause this function, let everything else continue, resume me in a microtask once the value is ready”.", (s) => {
    s.stack = [];
  });
  return {
    id: "js-async-await", title: "async/await suspension", code, panels: ["stack", "heap", "queues", "console"], steps: t.steps,
    takeaway: "An async function runs synchronously until its first await, then returns a pending promise. Its continuation resumes later as a microtask; the caller never waits.",
  };
}

export const TRACES = {
  closure: closureTrace(),
  eventLoop: eventLoopTrace(),
  hoisting: hoistingTrace(),
  thisBinding: thisTrace(),
  references: referencesTrace(),
  asyncAwait: asyncAwaitTrace(),
};
