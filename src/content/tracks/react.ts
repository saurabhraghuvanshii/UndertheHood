import type { Lesson, Track } from "../types";

const rd = (path: string) => `https://react.dev/${path}`;

export const track: Track = {
  slug: "react",
  title: "React and frontend internals",
  tagline: "What actually happens between setState and the pixels: Fiber, reconciliation, hooks and server components.",
  description:
    "React is a library for describing UI as a function of state and letting a reconciler figure out the minimal DOM changes. This track explains render vs commit, how Fiber and keys drive reconciliation, why hooks have rules (they live in a list on the fiber), how effects and memoization really behave, and where Server Components fit relative to SSR and client components.",
  modules: [
    {
      id: "react-rendering",
      title: "Rendering and reconciliation",
      summary: "Render vs commit, the Fiber tree, diffing heuristics, keys and what the virtual DOM does and doesn't buy you.",
      lessons: ["rendering-reconciliation", "virtual-dom", "component-placement"],
    },
    {
      id: "react-hooks",
      title: "Hooks in depth",
      summary: "How hooks are stored, state batching, effect lifecycles and cleanup, memoization and building custom hooks.",
      lessons: ["hooks-internals", "use-state-batching", "use-effect-cleanup", "memoization-hooks", "custom-hooks"],
    },
    {
      id: "react-architecture",
      title: "Server components and the ecosystem",
      summary: "RSC vs SSR vs client components, the serialization boundary, and the copy-in component philosophy of shadcn/ui.",
      lessons: ["server-components", "shadcn-ui"],
    },
  ],
  milestones: [
    {
      id: "react-use-debounce",
      title: "useDebounce + search box",
      summary: "A `useDebounce(value, delay)` hook powering a search input that fetches only after typing pauses, with stale responses ignored.",
      level: "intermediate",
      requirements: [
        "Effect sets a timeout and its cleanup clears it on every value change and on unmount",
        "Fetch uses `AbortController`; cleanup aborts the in-flight request",
        "Works correctly under `<StrictMode>` (mount → cleanup → mount in development)",
        "No missing dependencies (`eslint-plugin-react-hooks` clean)",
      ],
      stretch: ["Add a `useDebouncedCallback` variant and explain when you'd use each"],
      exercises: ["react/use-effect-cleanup", "react/custom-hooks", "javascript/debounce-throttle", "javascript/closures"],
    },
    {
      id: "react-virtualized-list",
      title: "Virtualized list",
      summary: "Render 100,000 rows smoothly by mounting only the rows in (and slightly around) the viewport.",
      level: "advanced",
      requirements: [
        "Fixed row height; compute the visible index window from `scrollTop` and container height",
        "Use a spacer element so the scrollbar reflects the full list height",
        "Stable keys from item IDs, not indices",
        "Measure with the React DevTools Profiler before and after; memoize rows only where it shows a win",
      ],
      stretch: ["Variable row heights with measured offsets", "Keyboard navigation that scrolls the focused row into view"],
      exercises: ["react/rendering-reconciliation", "react/memoization-hooks", "javascript/performance", "javascript/dom"],
    },
    {
      id: "react-mini-reconciler",
      title: "Mini reconciler (optional)",
      summary: "Build a toy `createElement`/`render` with a keyed child-diffing algorithm to see why keys and element types matter.",
      level: "expert",
      requirements: [
        "Elements as plain objects `{ type, props, children }`",
        "Diff old vs new: different type → replace node; same type → patch attributes",
        "Keyed children: move existing DOM nodes rather than recreating them",
        "Log every DOM operation and show fewer ops with keys than with indices on a reorder",
      ],
      exercises: ["react/rendering-reconciliation", "react/virtual-dom", "javascript/dom"],
    },
  ],
  sources: [
    { label: "react.dev — Render and Commit", url: rd("learn/render-and-commit"), kind: "docs" },
    { label: "react.dev — Preserving and Resetting State", url: rd("learn/preserving-and-resetting-state"), kind: "docs" },
    { label: "react.dev — Rules of Hooks", url: rd("reference/rules/rules-of-hooks"), kind: "docs" },
    { label: "react.dev — Synchronizing with Effects", url: rd("learn/synchronizing-with-effects"), kind: "docs" },
    { label: "react.dev — You Might Not Need an Effect", url: rd("learn/you-might-not-need-an-effect"), kind: "docs" },
    { label: "react.dev — useMemo", url: rd("reference/react/useMemo"), kind: "docs" },
    { label: "react.dev — useCallback", url: rd("reference/react/useCallback"), kind: "docs" },
    { label: "react.dev — memo", url: rd("reference/react/memo"), kind: "docs" },
    { label: "react.dev — Queueing a Series of State Updates", url: rd("learn/queueing-a-series-of-state-updates"), kind: "docs" },
    { label: "react.dev — Reusing Logic with Custom Hooks", url: rd("learn/reusing-logic-with-custom-hooks"), kind: "docs" },
    { label: "react.dev — Server Components", url: rd("reference/rsc/server-components"), kind: "docs" },
    { label: "react.dev — React Compiler", url: rd("learn/react-compiler"), kind: "docs" },
    { label: "React Fiber Architecture (Andrew Clark)", url: "https://github.com/acdlite/react-fiber-architecture", kind: "external" },
    { label: "shadcn/ui documentation", url: "https://ui.shadcn.com/docs", kind: "docs" },
    { label: "100xDocs — review reminder from learner's study notes", kind: "original-note" },
    {
      label: "Learner's study notes — React rendering explanations and hooks summary",
      kind: "inaccessible",
      note: "Mentioned in the learner's notes but the file was not provided; nothing was imported from it.",
    },
  ],
};

export const lessons: Lesson[] = [
  // ───────────────────────────────────────────── rendering-reconciliation
  {
    slug: "rendering-reconciliation",
    track: "react",
    title: "Rendering and reconciliation (render vs commit, Fiber, keys)",
    summary:
      "A React 'render' is calling your components to get a description of the UI; reconciliation diffs that description against the previous one; the commit phase applies the minimal DOM changes. Element types and keys decide what is reused and what is remounted.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 35,
    kinds: ["theory", "coding", "quiz"],
    status: "authored",
    prerequisites: ["javascript/dom", "javascript/closures"],
    related: ["react/virtual-dom", "react/hooks-internals", "react/memoization-hooks", "react/component-placement"],
    tags: ["rendering", "reconciliation", "fiber", "keys", "commit"],
    sources: [
      { label: "react.dev — Render and Commit", url: rd("learn/render-and-commit"), kind: "docs" },
      { label: "react.dev — Preserving and Resetting State", url: rd("learn/preserving-and-resetting-state"), kind: "docs" },
      { label: "react.dev — Rendering Lists (keys)", url: rd("learn/rendering-lists"), kind: "docs" },
      { label: "React Fiber Architecture (Andrew Clark)", url: "https://github.com/acdlite/react-fiber-architecture", kind: "external" },
    ],
    questions: ["react/react-01", "react/react-02", "react/react-03"],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Distinguish trigger, render and commit, and say which one touches the DOM",
              "Explain what a Fiber is and why React moved to it",
              "State the two diffing heuristics: element type and key",
              "Predict when state is preserved vs reset",
              "Explain why array indices make bad keys for reorderable lists",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Think of a restaurant: the **trigger** is an order (initial mount or a state update), **render** is the kitchen preparing the dish (React calls your components and works out what changed), and **commit** is the waiter putting it on the table (React mutates the DOM).",
          },
          {
            type: "p",
            text: "\"Re-render\" therefore does *not* mean 'repaint the page'. It means 'call the component function again'. If the output is the same, the commit phase does nothing to the DOM.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "list",
            items: [
              "**Element**: a plain object returned from JSX, e.g. `{ type: 'li', props: {...}, key: '3' }`. Cheap and immutable.",
              "**Render phase**: React calls components (starting from the one whose state changed, then its descendants) to produce new elements and computes what changed. Must be pure — no DOM writes, no subscriptions.",
              "**Reconciliation**: comparing the new element tree with the previous one to decide which fibers/DOM nodes to keep, update, create or delete.",
              "**Commit phase**: React applies DOM insertions/updates/deletions, attaches refs, runs layout effects synchronously, then schedules passive effects (`useEffect`).",
              "**Fiber**: React's internal per-component record — type, key, props, state, pointers to child/sibling/parent (`return`), and flags describing pending DOM work.",
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "A general tree diff is O(n³). React makes it O(n) by assuming two heuristics: elements of **different types** produce different trees, and **keys** identify which children are stable across renders. These assumptions are almost always true in real UIs and are what you control as a developer.",
          },
          {
            type: "p",
            text: "Fiber (React 16) replaced the old recursive 'stack reconciler' so render work can be split into units, paused, prioritised and resumed. That is the foundation of concurrent features like `startTransition` and `Suspense`.",
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Trigger", detail: "`root.render()` on mount, or a `setState`/dispatch. React marks the fiber and its ancestors as having pending work and schedules a render with a priority (lane)." },
              { title: "Begin work (render, top-down)", detail: "For each fiber in the work-in-progress tree, React either bails out (same props, no pending state/context changes) or calls the component and reconciles its returned children against the current children." },
              { title: "Reconcile children", detail: "Same type + same key → reuse the fiber (update props, keep state). Different type or key → delete the old subtree (unmount, state lost) and create new fibers." },
              { title: "Complete work (bottom-up)", detail: "Host fibers (DOM elements) prepare DOM nodes/property updates; effect flags bubble up so the commit knows where work is." },
              { title: "Commit (synchronous, not interruptible)", detail: "Mutation phase writes the DOM; the work-in-progress tree becomes `current`; layout effects (`useLayoutEffect`) and ref attachments run; then passive effects (`useEffect`) run, usually after the browser paints." },
            ],
          },
          {
            type: "flow",
            nodes: ["setState (trigger)", "Render: call components", "Reconcile (diff by type + key)", "Commit: DOM mutations", "Layout effects", "Browser paint", "Passive effects (useEffect)"],
            caption: "Conceptual pipeline for one update. Render may be interrupted and restarted in concurrent rendering; commit may not.",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Double buffering is an implementation detail",
            text: "Internally React keeps two fiber trees — `current` (on screen) and `workInProgress` — linked via `alternate`, and swaps them at commit. Lanes, bail-out rules and fiber field names are React internals that change between versions; the public guarantees are: render is pure and may run more than once, commit applies changes atomically.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: state preserved or reset?",
        blocks: [
          {
            type: "code",
            lang: "tsx",
            code: `function App({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div>
      {isAdmin ? <Counter label="admin" /> : <Counter label="user" />}
    </div>
  );
}

function App2({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div>
      {isAdmin ? <section><Counter /></section> : <div><Counter /></div>}
    </div>
  );
}`,
          },
          {
            type: "steps",
            steps: [
              { title: "App: toggle isAdmin", detail: "Both branches put a `Counter` at the same position in the tree. Same type, same position → the fiber is reused, only the `label` prop changes. **Count is preserved.**" },
              { title: "App2: toggle isAdmin", detail: "The parent at that position changes from `section` to `div` — different type. React tears down the whole subtree including `Counter`. **Count resets to its initial value.**" },
              { title: "Forcing a reset", detail: "Give the element a different key, e.g. `<Counter key={userId} />`. A new key means a new identity, so React remounts it." },
            ],
          },
        ],
      },
      {
        id: "examples",
        title: "Keys in lists",
        blocks: [
          {
            type: "code",
            lang: "tsx",
            code: `// ❌ index keys: after removing the first todo, every item's key shifts,
// so React matches the wrong state (e.g. an <input>'s text) to the wrong row.
todos.map((t, i) => <TodoRow key={i} todo={t} />);

// ✅ stable identity from the data
todos.map((t) => <TodoRow key={t.id} todo={t} />);`,
          },
          {
            type: "table",
            head: ["Change in list", "Index keys", "Stable ID keys"],
            rows: [
              ["Append at end", "Fine", "Fine"],
              ["Insert/remove at start", "Every row's props change; local state attaches to the wrong row", "Only one fiber created/deleted"],
              ["Reorder / sort", "State and DOM (focus, input text) mismatched", "Fibers moved, state follows the item"],
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Components defined inside components**: `function Parent() { function Child() {...} return <Child/> }` creates a new `Child` type every render, so it remounts every time and loses state.",
              "**Keys are only compared among siblings**: they don't need to be globally unique.",
              "**`key` is not a prop**: the child can't read `props.key`.",
              "**Strict Mode** double-invokes component functions in development to surface impure renders.",
            ],
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Equating 're-render' with 'DOM update' — a re-render that produces identical output commits nothing.",
              "Using `Math.random()` or `Date.now()` as keys — every render remounts everything.",
              "Doing side effects (fetch, DOM writes, subscriptions) in the component body during render.",
              "Thinking a child re-renders only if its props change — by default a parent re-render re-renders all its children unless they're memoized.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "list",
            items: [
              "Heuristic O(n) diffing can do more work than a perfect diff in odd cases (e.g. changing a wrapper type remounts a large subtree) — in exchange it's fast and predictable.",
              "Interruptible rendering improves responsiveness but means render functions may run several times for one commit, so they must be pure.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "When state changes, React re-renders: it calls the affected components to get a new element tree. Reconciliation diffs it against the previous tree using two heuristics — a different element type means 'throw away and rebuild that subtree', and keys identify list children across renders. Then the commit phase applies only the necessary DOM changes and runs effects. Since React 16 this runs on Fiber, which breaks rendering into interruptible units so React can prioritise urgent updates.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "State belongs to a position in the tree (fiber identity = type + key + position), not to the component function.",
              "Render phase: `beginWork` down, `completeWork` up; commit phase: before-mutation, mutation, layout; passive effects afterwards.",
              "Bail-out: if a fiber has the same props object, no pending updates and no changed context, React skips calling it and may skip its subtree.",
              "Concurrent rendering (React 18) can yield to the browser mid-render and discard a work-in-progress tree if a higher-priority update arrives.",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Trigger → render (pure, may repeat) → commit (DOM writes, effects).",
              "Different type → remount; same type → update; keys give list items identity.",
              "Use stable data IDs as keys; change a key to reset state deliberately.",
              "Fiber makes rendering interruptible and prioritisable.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Render (React)", definition: "Calling component functions to compute the next UI description. Not the same as painting pixels." },
      { term: "Commit", definition: "The phase where React applies DOM changes and runs layout and then passive effects." },
      { term: "Reconciliation", definition: "The diffing process that decides which fibers/DOM nodes to keep, update, add or remove." },
      { term: "Fiber", definition: "React's internal unit of work and per-component record, linked as a tree via child/sibling/return pointers." },
      { term: "Key", definition: "A sibling-unique identity hint that lets React match list children across renders." },
      { term: "Bail-out", definition: "React skipping a component's render because nothing it depends on changed." },
    ],
    followUps: [
      { q: "Does a parent re-render always re-render its children?", a: "By default yes, unless the child is wrapped in `React.memo` with equal props, or the same element object is reused (e.g. passed as `children`), in which case React can bail out." },
      { q: "How do you reset a component's state when a prop changes?", a: "Give it a key derived from that prop (`<Profile key={userId} />`). A new key means a new identity, so React unmounts the old instance and mounts a fresh one." },
      { q: "Why must render be pure?", a: "Concurrent React may call render multiple times, pause it, or throw away the result. Side effects during render could run repeatedly or for UI that never commits." },
    ],
    quiz: [
      {
        id: "rr-q1",
        prompt: "Which phase writes to the DOM?",
        options: ["Trigger", "Render", "Commit", "Reconciliation"],
        answer: 2,
        explanation: "Render and reconciliation compute changes; only the commit phase mutates the DOM.",
      },
      {
        id: "rr-q2",
        prompt: "A `<Counter />` is moved from inside `<section>` to inside `<div>` at the same position. What happens to its state?",
        options: ["Preserved", "Reset, because an ancestor's element type changed", "Preserved only if it has a key", "React throws"],
        answer: 1,
        explanation: "When an element's type changes, React unmounts the whole subtree beneath it, so the Counter remounts with fresh state.",
      },
      {
        id: "rr-q3",
        prompt: "Why are array indices risky as keys?",
        options: [
          "They're numbers, and keys must be strings",
          "Inserting/removing/reordering shifts indices, so React associates state with the wrong item",
          "They make React skip rendering",
          "They must be globally unique",
        ],
        answer: 1,
        explanation: "Index keys describe position, not identity. When positions change, fibers (and their state/DOM) get matched to different data.",
      },
    ],
  },
  // ───────────────────────────────────────────── hooks-internals
  {
    slug: "hooks-internals",
    track: "react",
    title: "How hooks work internally (and why the rules exist)",
    summary:
      "React doesn't identify hooks by name — it stores them as an ordered list on the component's fiber and matches them by call order on each render. That single fact explains both rules of hooks.",
    level: "advanced",
    frequency: "very-high",
    minutes: 25,
    kinds: ["theory", "coding", "quiz"],
    status: "authored",
    prerequisites: ["react/rendering-reconciliation", "javascript/closures"],
    related: ["react/use-state-batching", "react/use-effect-cleanup", "react/custom-hooks", "react/memoization-hooks"],
    tags: ["hooks", "fiber", "rules-of-hooks", "useState"],
    sources: [
      { label: "react.dev — Rules of Hooks", url: rd("reference/rules/rules-of-hooks"), kind: "docs" },
      { label: "react.dev — State: A Component's Memory", url: rd("learn/state-a-components-memory"), kind: "docs" },
      { label: "React Fiber Architecture (Andrew Clark)", url: "https://github.com/acdlite/react-fiber-architecture", kind: "external" },
    ],
    questions: ["react/react-04"],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain where hook state lives between renders",
              "Explain how React knows which `useState` is which",
              "Derive the two rules of hooks from that mechanism",
              "Explain stale closures in terms of per-render snapshots",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Imagine React handing your component a numbered tray each render: slot 1, slot 2, slot 3. The first hook call gets slot 1, the second gets slot 2. Nothing is labelled with a name — only the order connects this render's `useState` to last render's.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "list",
            items: [
              "**Hook**: a function starting with `use` that reads or registers state/behaviour on the currently rendering component.",
              "**Rule 1 — only call hooks at the top level**: not inside conditions, loops, nested functions, after early returns, or in try/catch/finally.",
              "**Rule 2 — only call hooks from React functions**: function components or custom hooks, not regular functions or class components.",
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "Function components are just functions; their local variables vanish when they return. Hooks give them memory by storing data *outside* the function, on the fiber, and handing it back on the next call. Order-based matching keeps the API minimal — no keys or names to pass.",
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Fiber holds a hook list", detail: "Each component fiber has a `memoizedState` field pointing to its first hook object. Each hook object has its own `memoizedState` (the stored value), an update `queue`, and a `next` pointer to the following hook." },
              { title: "Mount", detail: "On the first render React uses a 'mount' dispatcher: each hook call appends a new hook object to the list and initialises it." },
              { title: "Update", detail: "On later renders React uses an 'update' dispatcher: each hook call advances a cursor to the next hook object in the existing list and reads/processes it." },
              { title: "setState enqueues", detail: "`setCount` pushes an update onto that hook's queue and schedules a render; the new state is computed when the component renders next." },
              { title: "Mismatch", detail: "If a hook call is skipped (say inside an `if`), every later hook reads its neighbour's slot. React detects some cases and warns ('Rendered fewer hooks than expected'), but the root cause is the shifted list." },
            ],
          },
          {
            type: "flow",
            nodes: ["fiber.memoizedState", "hook 1: useState(count)", "hook 2: useEffect", "hook 3: useMemo", "null"],
            caption: "Conceptual: a component's hooks form a singly linked list in call order.",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "React implementation detail",
            text: "The linked list, dispatcher swapping and field names (`memoizedState`, `queue`, `next`) are React internals, not public API, and may change. The public contract is only the Rules of Hooks: call hooks unconditionally, in the same order, from components or custom hooks. (The `use` API, added in React 19, is an exception that may be called conditionally.)",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: breaking the order",
        blocks: [
          {
            type: "code",
            lang: "tsx",
            code: `function Form({ showEmail }: { showEmail: boolean }) {
  const [name, setName] = useState("Ada");      // slot 1
  if (showEmail) {
    const [email, setEmail] = useState("");     // slot 2 — only sometimes!
  }
  const [age, setAge] = useState(36);           // slot 2 or 3
  // ...
}`,
          },
          {
            type: "steps",
            steps: [
              { title: "Render 1 (showEmail = true)", detail: "List: [name='Ada', email='', age=36]." },
              { title: "Render 2 (showEmail = false)", detail: "React walks the list: `name` ← slot 1 ✔, `age` ← slot 2, which holds `''` from email ✘. One hook object (slot 3) is never read." },
              { title: "Fix", detail: "Call every hook unconditionally and put the condition in how you *use* the value, or move the conditional part into its own component." },
            ],
          },
        ],
      },
      {
        id: "examples",
        title: "Stale closures",
        blocks: [
          {
            type: "code",
            lang: "tsx",
            code: `function Counter() {
  const [count, setCount] = useState(0);
  function addThree() {
    setCount(count + 1); // count is this render's snapshot: 0
    setCount(count + 1); // still 0
    setCount(count + 1); // still 0  → next render: 1
  }
  function addThreeFixed() {
    setCount((c) => c + 1); // updater functions are queued
    setCount((c) => c + 1); // and applied in order to the latest value
    setCount((c) => c + 1); // → next render: 3
  }
  // ...
}`,
            caption: "Each render's handlers close over that render's state. The hook stores the latest value; your closure holds a snapshot.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Calling a hook after an early `return` — it's the same as a conditional hook.",
              "Calling hooks inside event handlers or `useEffect` callbacks.",
              "Expecting `count` to change immediately after `setCount` in the same handler.",
              "Disabling `react-hooks/exhaustive-deps` instead of fixing the stale closure it points to.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Order-based hooks (React's choice)", points: ["Tiny API, easy composition via custom hooks", "Requires a lint rule and discipline", "No conditional hooks"] },
              { title: "Name/key-based alternatives", points: ["Would allow conditional calls", "Name collisions when composing custom hooks", "More boilerplate at every call site"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "React stores a component's hook state on its fiber as an ordered list, one entry per hook call. On each render it walks that list in call order, so the n-th hook call always gets the n-th entry. That's why hooks must be called at the top level, unconditionally, from components or custom hooks: if a call is skipped the order shifts and hooks read each other's state.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "React swaps a dispatcher (mount vs update vs dev-warning variants) so `useState` behaves differently on first and subsequent renders.",
              "Updates are queued on the hook; the reducer runs during the next render, which is why the new value isn't visible synchronously.",
              "Effects are stored as hook entries too, holding the deps array and cleanup; React compares deps with `Object.is` to decide whether to re-run.",
              "Custom hooks don't get their own storage — their internal hook calls simply become entries in the calling component's list.",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Hook state lives on the fiber, matched by call order.",
              "Rules of hooks protect that order.",
              "Each render sees a snapshot; use updater functions for queued updates.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Dispatcher", definition: "Internal object React swaps in during render so hook calls behave differently on mount vs update." },
      { term: "Hook object", definition: "Internal record per hook call holding its stored value, update queue and pointer to the next hook." },
      { term: "Stale closure", definition: "A function that captured a variable from an older render and therefore sees an outdated value." },
      { term: "Updater function", definition: "`setX(prev => next)`: a function queued and applied to the latest state rather than a snapshot." },
    ],
    followUps: [
      { q: "Can a custom hook call hooks conditionally if it's always called?", a: "No. The custom hook's inner hook calls are part of the component's list; a conditional inside it shifts the order just the same." },
      { q: "Why does ESLint's rules-of-hooks rule rely on the `use` prefix?", a: "Static analysis can't know what a function does; the naming convention marks functions that may call hooks, so the linter can enforce the rules at their call sites." },
      { q: "How did class components keep state instead?", a: "On the component instance (`this.state`), with named fields — no ordering constraint, but logic reuse required HOCs or render props." },
    ],
    quiz: [
      {
        id: "hi-q1",
        prompt: "How does React know which `useState` call corresponds to which stored value?",
        options: ["By variable name", "By the order of hook calls in the render", "By a hidden key generated by the compiler", "By the initial value"],
        answer: 1,
        explanation: "Hooks are matched positionally against the list stored on the fiber.",
      },
      {
        id: "hi-q2",
        prompt: "After clicking a button that runs `setCount(count + 1)` three times (count was 0), what is count on the next render?",
        options: ["0", "1", "3", "It depends on batching"],
        answer: 1,
        explanation: "All three use the same snapshot value 0, so each queues 'replace with 1'. Use updater functions to get 3.",
      },
    ],
  },
  // ───────────────────────────────────────────── use-state-batching
  {
    slug: "use-state-batching",
    track: "react",
    title: "useState updates and automatic batching",
    summary:
      "`setState` doesn't change the variable you're holding; it queues an update and schedules a render. React 18 batches all updates in the same tick — including those in timeouts, promises and native handlers — into a single render.",
    level: "intermediate",
    frequency: "high",
    minutes: 15,
    kinds: ["theory", "coding", "quiz"],
    status: "authored",
    prerequisites: ["react/hooks-internals"],
    related: ["react/rendering-reconciliation", "javascript/event-loop"],
    tags: ["useState", "batching", "react-18"],
    sources: [
      { label: "react.dev — Queueing a Series of State Updates", url: rd("learn/queueing-a-series-of-state-updates"), kind: "docs" },
      { label: "react.dev — flushSync", url: rd("reference/react-dom/flushSync"), kind: "docs" },
    ],
    questions: ["react/react-07"],
    sections: [
      {
        id: "objectives",
        blocks: [
          { type: "list", items: ["Explain why state appears 'async' after `setState`", "Predict the result of several queued updates", "Describe what changed with automatic batching in React 18"] },
        ],
      },
      {
        id: "intuition",
        blocks: [
          { type: "p", text: "Like a waiter collecting the whole table's order before going to the kitchen, React collects every `setState` from one event before rendering once. Your variables are snapshots of the render you're in." },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "list",
            items: [
              "`setX(value)` queues 'replace with value'; `setX(fn)` queues 'apply fn to the latest pending value'.",
              "**Batching**: multiple state updates processed in one render/commit.",
              "**Automatic batching (React 18, with `createRoot`)**: updates are batched everywhere, not only inside React event handlers.",
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Version-dependent",
            text: "In React 17 and earlier (and with the legacy `ReactDOM.render` root in 18), updates were batched only inside React-managed event handlers; inside `setTimeout`, promises or native listeners each `setState` triggered its own render. React 18's `createRoot` batches all of them. `flushSync(() => ...)` opts out when you must read the DOM immediately.",
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "tsx",
            code: `function Demo() {
  const [n, setN] = useState(0);
  const [flag, setFlag] = useState(false);
  console.log("render", n, flag);

  function onClick() {
    setTimeout(() => {
      setN((x) => x + 1);
      setFlag((f) => !f);
      // React 18 + createRoot: ONE render → "render 1 true"
      // React 17: two renders → "render 1 false", then "render 1 true"
    }, 0);
  }
  return <button onClick={onClick}>go</button>;
}`,
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          { type: "list", items: ["Reading state right after setting it and expecting the new value.", "Using `setX(x + 1)` repeatedly instead of the updater form.", "Mutating an object in state and calling `setX(sameObject)` — `Object.is` sees no change and React may bail out."] },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          { type: "p", text: "`setState` doesn't mutate the current variable; it queues an update and schedules a re-render, so inside the same handler you still see the old snapshot. React batches updates from the same tick into one render, and since React 18 with `createRoot` that batching is automatic everywhere — timeouts, promises, native events. Use the updater form when the next state depends on the previous one, and `flushSync` if you truly need a synchronous flush." },
        ],
      },
      {
        id: "summary",
        blocks: [{ type: "list", items: ["Updates are queued; state is a per-render snapshot.", "Updater functions compose; plain values replace.", "React 18 batches automatically; `flushSync` opts out."] }],
      },
    ],
    glossary: [
      { term: "Batching", definition: "Grouping multiple state updates into a single render and commit." },
      { term: "flushSync", definition: "`react-dom` API that forces React to process the updates inside its callback synchronously." },
    ],
    followUps: [
      { q: "Is setState synchronous or asynchronous?", a: "Neither, strictly: the call returns immediately after queuing; the render happens later in the same task (for discrete events) or a scheduled one. The value you hold never changes." },
    ],
    quiz: [
      {
        id: "usb-q1",
        prompt: "count is 0. A handler runs `setCount(c => c + 1); setCount(5); setCount(c => c * 2);`. Next render's count?",
        options: ["2", "5", "10", "11"],
        answer: 2,
        explanation: "Queue: +1 → 1, replace → 5, ×2 → 10.",
      },
      {
        id: "usb-q2",
        prompt: "With React 18 `createRoot`, two setState calls inside a `fetch().then` callback cause how many renders?",
        options: ["0", "1", "2", "Depends on Strict Mode"],
        answer: 1,
        explanation: "Automatic batching groups them into one render.",
      },
    ],
  },
  // ───────────────────────────────────────────── use-effect-cleanup
  {
    slug: "use-effect-cleanup",
    track: "react",
    title: "useEffect, dependencies and cleanup",
    summary:
      "An effect synchronises a component with something outside React. It runs after commit; its cleanup runs before the effect re-runs with new dependencies and when the component unmounts. Cleanup is how you avoid leaks and race conditions.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 30,
    kinds: ["theory", "coding", "quiz"],
    status: "authored",
    prerequisites: ["react/hooks-internals", "javascript/closures"],
    related: ["react/custom-hooks", "react/rendering-reconciliation", "javascript/memory-leaks-gc", "javascript/fetch-http"],
    tags: ["useEffect", "cleanup", "dependencies", "strict-mode", "race-conditions"],
    sources: [
      { label: "react.dev — Synchronizing with Effects", url: rd("learn/synchronizing-with-effects"), kind: "docs" },
      { label: "react.dev — Lifecycle of Reactive Effects", url: rd("learn/lifecycle-of-reactive-effects"), kind: "docs" },
      { label: "react.dev — You Might Not Need an Effect", url: rd("learn/you-might-not-need-an-effect"), kind: "docs" },
      { label: "react.dev — useEffect reference", url: rd("reference/react/useEffect"), kind: "docs" },
    ],
    questions: ["react/react-05"],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "State exactly when an effect and its cleanup run",
              "Explain the three dependency-array forms",
              "Write cleanups for timers, subscriptions and fetches",
              "Explain why Strict Mode runs effects twice in development",
              "Recognise effects that shouldn't exist (derived state, event logic)",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Think of an effect as 'start synchronising' and its cleanup as 'stop synchronising'. When the thing you sync with changes (a different chat room ID), React stops the old sync and starts a new one. When the component leaves the screen, it just stops.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "code",
            lang: "tsx",
            code: `useEffect(() => {
  // setup: runs after commit
  const conn = createConnection(roomId);
  conn.connect();
  return () => {
    // cleanup: runs before the next setup and on unmount
    conn.disconnect();
  };
}, [roomId]); // dependencies`,
          },
          {
            type: "table",
            head: ["Dependency array", "Effect runs"],
            rows: [
              ["omitted", "After every commit"],
              ["`[]`", "After the first commit only (plus the dev-only Strict Mode re-run)"],
              ["`[a, b]`", "After the first commit and whenever `a` or `b` changed (`Object.is`) since the last run"],
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "Without cleanup, intervals keep firing, sockets stay open and listeners pile up — memory leaks and duplicate work.",
              "Without cleanup, a slow response for an old `userId` can arrive after a fast response for the new one and overwrite it (race condition).",
              "Thinking in 'sync/unsync' instead of 'mount/unmount' makes effects correct for any sequence of prop changes.",
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Render", detail: "The `useEffect` call stores the effect function and deps in the component's hook entry and, if deps changed, flags it to run. Nothing executes yet." },
              { title: "Commit", detail: "React updates the DOM. `useLayoutEffect` cleanups/setups run synchronously here, before paint." },
              { title: "Passive effects", detail: "Usually after paint, React runs all pending **cleanups** (with the previous render's closures) first, then all new **setups**." },
              { title: "Unmount", detail: "React runs the last cleanup for every effect of the removed component." },
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Strict Mode double-run (development only)",
            text: "Since React 18, `<StrictMode>` in development mounts each component, immediately runs every effect's cleanup, then runs setup again (setup → cleanup → setup). It's a stress test that your cleanup mirrors your setup. Production runs setup once. Also note: passive effects caused by a discrete user input (like a click) may be flushed synchronously before paint — 'after paint' is the usual case, not a guarantee.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: roomId changes from 'general' to 'travel'",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Mount", detail: "Render with `general`; commit; setup connects to `general`." },
              { title: "Prop change", detail: "Render with `travel`; deps `['travel']` differ from `['general']`, so the effect is flagged." },
              { title: "Cleanup old", detail: "React runs the cleanup created during the `general` render → disconnects `general`." },
              { title: "Setup new", detail: "Runs the new setup → connects to `travel`." },
              { title: "Unmount", detail: "Cleanup from the `travel` render runs → disconnects `travel`." },
            ],
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "tsx",
            code: `// Timer
useEffect(() => {
  const id = setInterval(() => setTick((t) => t + 1), 1000);
  return () => clearInterval(id);
}, []);

// Event listener
useEffect(() => {
  const onResize = () => setWidth(window.innerWidth);
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}, []);

// Fetch without races
useEffect(() => {
  const controller = new AbortController();
  fetch(\`/api/users/\${userId}\`, { signal: controller.signal })
    .then((r) => r.json())
    .then(setUser)
    .catch((e) => { if (e.name !== "AbortError") setError(e); });
  return () => controller.abort(); // stale request can't overwrite newer state
}, [userId]);`,
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Passing an `async` function directly: `useEffect(async () => ...)` returns a Promise, not a cleanup. Define the async function inside and call it.",
              "Lying about dependencies (`[]` while reading `props.id`) → stale closures. Fix the code, don't silence the linter.",
              "Objects/functions created during render as dependencies → the effect re-runs every render because the identity changes.",
              "Using an effect to compute derived state (`useEffect(() => setFull(first + ' ' + last))`) — just compute it during render.",
              "Using an effect to respond to a user event — put that logic in the event handler.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "`useEffect`", points: ["Runs after paint (usually)", "Doesn't block the browser", "Right for subscriptions, network, logging"] },
              { title: "`useLayoutEffect`", points: ["Runs before paint, synchronously", "Can measure DOM and adjust without flicker", "Blocks paint — use sparingly"] },
              { title: "No effect at all", points: ["Derived values, event-driven logic", "Data fetching via a framework/library cache", "Fewer bugs, fewer renders"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "`useEffect` runs after React commits. The dependency array controls re-runs: omitted means every render, empty means once, otherwise when a dependency changes by `Object.is`. The function you return is the cleanup; React calls it before re-running the effect with new deps — using the old render's values — and on unmount. Cleanups prevent leaks (intervals, listeners, sockets) and races (abort stale fetches). In development Strict Mode runs setup, cleanup, setup to check that cleanup is symmetric.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Each render has its own effect and cleanup closures; the cleanup sees the props/state of the render that created it.",
              "All cleanups for a commit run before any new setups.",
              "`useEffectEvent` (stable since React 19.2) lets an effect read latest values without making them dependencies.",
              "Data fetching in effects has drawbacks (waterfalls, no caching, no SSR); frameworks and libraries like TanStack Query or RSC are often better.",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Effects synchronise with external systems; cleanup stops that sync.",
              "Order: commit → old cleanups → new setups; cleanup again on unmount.",
              "Be honest about dependencies; abort stale async work.",
              "Many effects shouldn't exist.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Effect", definition: "Code that synchronises a component with a system outside React, run after commit." },
      { term: "Cleanup function", definition: "The function an effect returns; undoes the setup before re-run and on unmount." },
      { term: "Dependency array", definition: "Values the effect reads; React re-runs the effect when any changes by `Object.is`." },
      { term: "Strict Mode", definition: "Development-only checks including double rendering and an extra effect setup/cleanup cycle." },
      { term: "AbortController", definition: "Web API used to cancel fetches and other abortable operations via a signal." },
    ],
    followUps: [
      { q: "Why does my effect run twice in development?", a: "Strict Mode in React 18+ mounts, cleans up and re-mounts to reveal missing cleanup. It doesn't happen in production; fix the cleanup rather than disabling Strict Mode." },
      { q: "When does cleanup run relative to the next render?", a: "After the next render is committed, before the new effect's setup — not before the render itself." },
      { q: "How do you avoid an object dependency re-triggering the effect?", a: "Depend on primitive fields, create the object inside the effect, or memoize it with `useMemo`." },
    ],
    quiz: [
      {
        id: "uec-q1",
        prompt: "`userId` changes from 1 to 2. In what order do things run?",
        options: [
          "setup(2), then cleanup(1)",
          "render(2), commit, cleanup(1), setup(2)",
          "cleanup(1), render(2), setup(2)",
          "render(2), setup(2); cleanup only on unmount",
        ],
        answer: 1,
        explanation: "React renders and commits the new UI, then runs the previous effect's cleanup, then the new setup.",
      },
      {
        id: "uec-q2",
        prompt: "What's wrong with `useEffect(async () => { await load(); }, [])`?",
        options: ["Nothing", "Effects can't access state", "The async function returns a Promise, which React would treat as the cleanup", "It runs on every render"],
        answer: 2,
        explanation: "An effect must return nothing or a cleanup function. Declare an async function inside and call it.",
      },
      {
        id: "uec-q3",
        prompt: "In production, with `[]` deps, how many times does setup run for one mounted component?",
        options: ["0", "1", "2", "Every render"],
        answer: 1,
        explanation: "Once. The double run is a development-only Strict Mode behaviour.",
      },
    ],
  },
  // ───────────────────────────────────────────── memoization-hooks
  {
    slug: "memoization-hooks",
    track: "react",
    title: "useMemo, useCallback and React.memo — and when they don't help",
    summary:
      "`useMemo` caches a computed value, `useCallback` caches a function identity, and `React.memo` skips re-rendering a component whose props are shallowly equal. They only pay off together and when measured; the React Compiler can now insert most of them automatically.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 25,
    kinds: ["theory", "coding", "quiz"],
    status: "authored",
    prerequisites: ["react/rendering-reconciliation", "react/hooks-internals", "javascript/memoization"],
    related: ["react/use-effect-cleanup", "react/component-placement", "javascript/performance"],
    tags: ["useMemo", "useCallback", "React.memo", "performance", "react-compiler"],
    sources: [
      { label: "react.dev — useMemo", url: rd("reference/react/useMemo"), kind: "docs" },
      { label: "react.dev — useCallback", url: rd("reference/react/useCallback"), kind: "docs" },
      { label: "react.dev — memo", url: rd("reference/react/memo"), kind: "docs" },
      { label: "react.dev — React Compiler", url: rd("learn/react-compiler"), kind: "docs" },
    ],
    questions: ["react/react-06"],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Say precisely what each of the three APIs caches",
              "Explain referential equality and why a new object/function breaks `React.memo`",
              "Identify cases where memoization adds cost without benefit",
              "Know what the React Compiler does",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Every render creates new objects and functions. To JavaScript, `{}` from this render and `{}` from the last are different (`!==`). Memoization lets you hand children *the same* object as last time, so a memoized child can tell 'nothing changed' cheaply.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["API", "Caches", "Recomputes when"],
            rows: [
              ["`useMemo(fn, deps)`", "The **return value** of `fn`", "Any dep changes (`Object.is`)"],
              ["`useCallback(fn, deps)`", "The **function** `fn` itself (≈ `useMemo(() => fn, deps)`)", "Any dep changes"],
              ["`React.memo(Component, areEqual?)`", "The component's **last rendered output**", "Props aren't shallowly equal (or `areEqual` returns false); own state/context changes still re-render"],
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "Skip genuinely expensive calculations (filtering 50k rows) on renders where inputs didn't change.",
              "Keep prop identities stable so `React.memo` children can bail out.",
              "Keep effect dependencies stable so effects don't re-run every render.",
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Stored on the hook entry", detail: "`useMemo`/`useCallback` keep `[value, deps]` in their hook slot. On render React compares each dep with the previous using `Object.is`; if all equal it returns the cached value without calling `fn`." },
              { title: "React.memo comparison", detail: "Before rendering a memo component, React shallow-compares old and new props (each prop with `Object.is`). Equal → reuse previous output and skip the subtree unless something inside has its own pending update." },
              { title: "Cost is never zero", detail: "Every memo call allocates a deps array and runs comparisons on every render, and keeps old values alive in memory." },
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "A performance hint, not a guarantee",
            text: "React's docs state the cache may be discarded (e.g. in development on file edits, or if a component suspends during mount). Never rely on `useMemo` for correctness — only for speed. The React Compiler (stable 1.0 released in 2025) is a build-time Babel plugin that auto-memoizes components and values based on data-flow analysis; in compiled code, manual `useMemo`/`useCallback` are mostly unnecessary.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: memo that doesn't work",
        blocks: [
          {
            type: "code",
            lang: "tsx",
            code: `const Row = React.memo(function Row({ item, onSelect, style }: RowProps) {
  return <li style={style} onClick={() => onSelect(item.id)}>{item.name}</li>;
});

function List({ items }: { items: Item[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <ul>
      {items.map((it) => (
        <Row
          key={it.id}
          item={it}
          onSelect={(id) => setSelected(id)}   // new function every render ❌
          style={{ padding: 4 }}                // new object every render ❌
        />
      ))}
    </ul>
  );
}`,
          },
          {
            type: "steps",
            steps: [
              { title: "Click a row", detail: "`setSelected` re-renders `List`." },
              { title: "Props compared", detail: "`item` is the same reference ✔, but `onSelect` and `style` are new objects ✘." },
              { title: "Result", detail: "Every `Row` re-renders anyway — `React.memo` only added comparison cost." },
              { title: "Fix", detail: "`const onSelect = useCallback((id) => setSelected(id), [])` (or just pass `setSelected`, which is stable), and hoist the style to a module constant." },
            ],
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "tsx",
            code: `function Table({ rows, query }: { rows: Row[]; query: string }) {
  // Expensive and only depends on rows + query
  const visible = useMemo(
    () => rows.filter((r) => r.name.includes(query)).sort(byName),
    [rows, query],
  );
  return <Grid rows={visible} />;
}`,
            caption: "A good fit: costly work, clear inputs, and an output passed to a child that benefits from a stable reference.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "`useCallback` on a handler passed to a plain DOM element (`<button>`) — DOM elements don't bail out, so it's pure overhead.",
              "`React.memo` on a component that receives `children` JSX — a new element object every render defeats the comparison.",
              "Memoizing cheap computations like `a + b`.",
              "Missing dependencies, producing stale values that look like 'React bugs'.",
              "Expecting `React.memo` to block re-renders from context changes or the component's own state.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Memoize", points: ["Measured slow render (Profiler)", "Expensive pure computation", "Prop to a memoized child / dependency of an effect"] },
              { title: "Don't bother", points: ["Cheap computations", "Props to DOM elements", "Values whose deps change every render anyway"] },
              { title: "Restructure instead", points: ["Move state down to where it's used", "Pass components as `children` so they aren't re-created", "Split context into smaller providers"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "`useMemo` caches a computed value and `useCallback` caches a function, both until a dependency changes by `Object.is`. `React.memo` wraps a component so it skips re-rendering when its props are shallowly equal. They work together: memo on a child is useless if the parent passes a fresh object or callback each render. They aren't free — comparisons and retained memory — so I use them for measured hot spots, expensive computations or stable effect dependencies. With the React Compiler, most of this is automatic.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Often the better fix is composition: lifting content into `children` or moving state down so fewer components re-render at all.",
              "`React.memo` custom comparators must compare *all* props including functions, or you'll render stale callbacks.",
              "Context consumers re-render on any change to the context value; memoize the provider value (`useMemo`) and split contexts.",
              "The React Compiler requires code to follow the Rules of React (pure render, no mutation of props/state); it skips components it can't prove safe.",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "`useMemo` = value, `useCallback` = function, `React.memo` = component output.",
              "All rely on referential equality; one unstable prop breaks the chain.",
              "Measure first; restructure before memoizing; let the compiler help.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Referential equality", definition: "Two values are the same reference (`Object.is(a, b)`), not merely equal in content." },
      { term: "Shallow comparison", definition: "Comparing each top-level prop with `Object.is`, without looking inside objects." },
      { term: "React Compiler", definition: "A build-time tool that automatically memoizes React components and hooks based on static analysis." },
      { term: "Profiler", definition: "React DevTools tool that records which components rendered and how long they took." },
    ],
    followUps: [
      { q: "Is `useCallback(fn, deps)` the same as `useMemo(() => fn, deps)`?", a: "Yes, semantically. `useCallback` is the convenience form for functions." },
      { q: "Why does my memoized child still re-render?", a: "Usually an unstable prop (inline object/array/function/JSX children), a context it consumes changed, or its own state changed." },
      { q: "Should I wrap every component in React.memo?", a: "No. Comparisons cost time and most re-renders are cheap. Profile, then memoize the components that are both slow and frequently re-rendered with the same props." },
    ],
    quiz: [
      {
        id: "mh-q1",
        prompt: "A `React.memo` child receives `config={{ dense: true }}` inline. What happens when the parent re-renders?",
        options: ["Child skips re-render", "Child re-renders because `config` is a new object each time", "React deep-compares config", "Error"],
        answer: 1,
        explanation: "The inline object literal is a new reference every render, so the shallow comparison fails.",
      },
      {
        id: "mh-q2",
        prompt: "Which is the most likely wasted `useCallback`?",
        options: [
          "A handler passed to a `React.memo` list row",
          "A function used as a `useEffect` dependency",
          "An `onClick` passed directly to a `<button>`",
          "A callback passed to a memoized custom hook",
        ],
        answer: 2,
        explanation: "Host elements like `<button>` don't skip rendering based on prop identity, so stabilising the handler gains nothing.",
      },
    ],
  },
  // ───────────────────────────────────────────── server-components
  {
    slug: "server-components",
    track: "react",
    title: "Server Components vs SSR vs client components",
    summary:
      "React Server Components run only on the server (or at build time) and send a serialized UI description — never their code — to the browser. SSR is a different thing: rendering client components to HTML for the first load, then hydrating. The `\"use client\"` directive marks the serialization boundary.",
    level: "advanced",
    frequency: "high",
    minutes: 30,
    kinds: ["theory", "coding", "quiz"],
    status: "authored",
    prerequisites: ["react/rendering-reconciliation", "react/use-effect-cleanup"],
    related: ["react/component-placement", "javascript/fetch-http", "backend/serialization"],
    tags: ["rsc", "ssr", "hydration", "use-client", "nextjs"],
    sources: [
      { label: "react.dev — Server Components", url: rd("reference/rsc/server-components"), kind: "docs" },
      { label: "react.dev — 'use client' directive", url: rd("reference/rsc/use-client"), kind: "docs" },
      { label: "react.dev — Server Functions", url: rd("reference/rsc/server-functions"), kind: "docs" },
      { label: "react.dev — hydrateRoot", url: rd("reference/react-dom/client/hydrateRoot"), kind: "docs" },
    ],
    questions: ["react/react-08"],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Define server components, client components and SSR precisely",
              "Explain why RSC and SSR are complementary, not alternatives",
              "Identify what can cross the server → client boundary",
              "Decide where to put the `\"use client\"` boundary",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "SSR is like printing a photo of the app so the user sees something fast, then shipping all the code to make it interactive. Server Components are like a chef who cooks part of the meal in the kitchen and only sends the plate — the recipe (code) for those parts never leaves the server.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["", "Server Component", "Client Component", "SSR"],
            rows: [
              ["What is it", "A component type", "A component type", "A rendering technique"],
              ["Runs where", "Server or build time only", "Browser (and also on the server during SSR)", "Server, producing HTML"],
              ["JS shipped to browser", "None for the component itself", "Yes", "Yes — hydration needs the client code"],
              ["Can use state/effects/event handlers", "No", "Yes", "n/a"],
              ["Can be async / read DB or files directly", "Yes", "No (fetch via APIs)", "n/a"],
            ],
          },
          {
            type: "list",
            items: [
              "**RSC payload**: a serialized description of the server-rendered tree, with placeholders referencing client component modules and their props.",
              "**Hydration**: attaching React's event handlers and state to server-generated HTML on the client.",
              "**`\"use client\"`**: placed at the top of a module, marks it — and everything it imports — as client code. It defines a boundary, not 'this component only'.",
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "Smaller bundles: markdown parsers, date libraries, DB clients used only on the server ship zero bytes to the browser.",
              "Data access next to the component: no API layer or client-side waterfall just to fetch what one component needs.",
              "Secrets stay on the server.",
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Server renders the server tree", detail: "Server components execute (awaiting data). When React reaches a client component it does not run it in this pass; it records a reference to the client module plus its serialized props." },
              { title: "Serialize", detail: "The result is streamed as the RSC payload. Props crossing the boundary must be serializable: primitives, plain objects/arrays, Date, Map/Set, Promises, JSX, and Server Functions — not arbitrary functions or class instances." },
              { title: "Optional SSR", detail: "On the initial request a framework also runs the client components on the server to produce HTML, so users see content before JS loads." },
              { title: "Client", detail: "The browser loads client component bundles, reconstructs the tree from the payload, and hydrates the HTML. On navigation, only a new RSC payload is fetched and merged, preserving client state." },
            ],
          },
          {
            type: "flow",
            nodes: ["Server Components (async, data access)", "RSC payload (serialized tree)", "SSR → HTML (first load)", "Browser: client bundles", "Hydration → interactive"],
            caption: "Conceptual pipeline in an RSC framework such as the Next.js App Router.",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Framework-dependent",
            text: "React defines the Server Components model and APIs, but bundling, routing, caching and the wire format are provided by a framework (e.g. Next.js App Router, React Router's RSC support). The RSC payload format is an internal detail. In Next.js App Router, components are server components by default.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: placing the boundary",
        blocks: [
          {
            type: "code",
            lang: "tsx",
            code: `// app/post/[id]/page.tsx — Server Component (default)
import { db } from "@/lib/db";          // never shipped to the browser
import { LikeButton } from "./LikeButton";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await db.post.findUnique({ where: { id } });
  if (!post) return <p>Not found</p>;
  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.body}</div>
      <LikeButton postId={post.id} initialLikes={post.likes} />
    </article>
  );
}

// app/post/[id]/LikeButton.tsx
"use client";
import { useState } from "react";
export function LikeButton({ postId, initialLikes }: { postId: string; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  return <button onClick={() => setLikes(likes + 1)}>♥ {likes}</button>;
}`,
          },
          {
            type: "steps",
            steps: [
              { title: "Server", detail: "`PostPage` awaits the DB and renders. `LikeButton` becomes a client reference with props `{ postId, initialLikes }` — both serializable." },
              { title: "Browser", detail: "Only `LikeButton`'s code (plus React) is downloaded; the article content arrives as rendered output." },
              { title: "Keep the boundary low", detail: "Mark the small interactive leaf as client, not the whole page, to keep the server benefits." },
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "A client component can't *import* a server component, but it can receive one as `children`/props from a server parent.",
              "Passing `onClick={() => ...}` from a server to a client component fails: functions aren't serializable (unless it's a Server Function marked `\"use server\"`).",
              "Context providers are client components; wrap them in a small `\"use client\"` provider file.",
              "`\"use server\"` marks Server Functions callable from the client, not server components.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Server Components", points: ["Zero client JS for static parts", "Direct data access, fewer waterfalls", "No interactivity; requires framework support; new mental model"] },
              { title: "Client Components + SSR", points: ["Fast first paint and full interactivity", "All component code shipped and hydrated", "Data usually fetched through APIs"] },
              { title: "Client-only SPA", points: ["Simplest hosting", "Blank screen until JS loads", "Largest bundles"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Server Components run only on the server or at build time; they can be async and read data directly, and their code never ships to the browser — React sends a serialized description of their output. Client components, marked with `\"use client\"`, are regular interactive components with state and effects. SSR is orthogonal: it renders client components to HTML on the server for a fast first paint, then hydrates them. A typical app uses all three: server components for data and layout, small client leaves for interactivity, SSR for the initial HTML. Props crossing the boundary must be serializable.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "\"use client\" marks a module-graph boundary: everything imported below it is client code.",
              "Server components can pass Promises to client components, which unwrap them with `use()` and Suspense for streaming.",
              "Refetching a route re-renders server components and merges the new payload without losing client state.",
              "Security: anything passed as props to a client component is visible to the user; Server Functions are public endpoints and need authorization.",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "RSC = component type that runs on the server and ships no JS.",
              "SSR = HTML for the first load; still hydrates client code.",
              "`\"use client\"` is the serialization boundary; keep it close to interactive leaves.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Server Component", definition: "A React component that renders only on the server/build and sends its output, not its code, to the client." },
      { term: "Client Component", definition: "A component in a `\"use client\"` module graph; runs in the browser and can use state, effects and events." },
      { term: "SSR", definition: "Server-side rendering: producing HTML on the server for the initial page load." },
      { term: "Hydration", definition: "React attaching interactivity to existing server-rendered HTML." },
      { term: "RSC payload", definition: "The serialized tree a server sends to the client in an RSC framework." },
      { term: "Server Function", definition: "An async function marked `\"use server\"` that the client can call over the network." },
    ],
    followUps: [
      { q: "Do Server Components replace SSR?", a: "No. They're complementary: RSC decides which code runs only on the server; SSR turns the initial tree (including client components) into HTML." },
      { q: "Can a server component use useState?", a: "No — it renders once per request and has no client lifetime. Move stateful parts into a client component." },
      { q: "How do you render a server component inside a client component?", a: "Pass it from a server parent as `children` or another JSX prop; the client component renders the already-rendered slot." },
    ],
    quiz: [
      {
        id: "sc-q1",
        prompt: "Which prop can a Server Component NOT pass to a Client Component?",
        options: ["A string", "A Date", "An inline arrow function `() => alert(1)`", "A JSX element"],
        answer: 2,
        explanation: "Ordinary functions aren't serializable across the boundary. Only Server Functions (`\"use server\"`) can be passed.",
      },
      {
        id: "sc-q2",
        prompt: "What does SSR send that a client-only SPA doesn't?",
        options: ["No JavaScript at all", "Pre-rendered HTML for the first paint", "A database connection", "The RSC payload only"],
        answer: 1,
        explanation: "SSR returns HTML immediately; the client still downloads JS and hydrates.",
      },
      {
        id: "sc-q3",
        prompt: "`\"use client\"` at the top of a file means…",
        options: [
          "The component only renders in the browser, never on the server",
          "That module and its imports are client code; it marks the server→client boundary",
          "The component is lazy-loaded",
          "Server functions in the file are disabled",
        ],
        answer: 1,
        explanation: "It's a module-graph boundary. Client components can still be pre-rendered to HTML via SSR.",
      },
    ],
  },
  // ───────────────────────────────────────────── outlines
  {
    slug: "virtual-dom",
    track: "react",
    title: "The virtual DOM: what it is and what it doesn't buy you",
    summary:
      "The 'virtual DOM' is React's tree of plain JavaScript element objects that it diffs to decide which real DOM operations to perform. It enables a declarative programming model; it is not inherently faster than well-written direct DOM updates.",
    level: "beginner",
    frequency: "very-high",
    minutes: 15,
    kinds: ["theory"],
    status: "outline",
    prerequisites: ["javascript/dom"],
    related: ["react/rendering-reconciliation", "react/memoization-hooks"],
    tags: ["virtual-dom", "dom", "diffing"],
    sources: [
      { label: "react.dev — Render and Commit", url: rd("learn/render-and-commit"), kind: "docs" },
      { label: "MDN — Document Object Model", url: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model", kind: "docs" },
    ],
    questions: ["react/react-02"],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Describe React elements as plain objects and how they differ from DOM nodes",
              "Explain why DOM writes and layout/reflow are the expensive part",
              "Debunk 'the virtual DOM is faster than the DOM'",
              "Compare with fine-grained reactivity approaches (Svelte, Solid, signals)",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Elements vs fibers vs DOM nodes",
              "What batching DOM writes and diffing buy: declarative code, cross-platform renderers (DOM, Native)",
              "What it costs: re-running components and diffing even when little changed",
              "Alternatives without a virtual DOM and their trade-offs",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "custom-hooks",
    track: "react",
    title: "Custom hooks: reusing stateful logic",
    summary:
      "A custom hook is a function starting with `use` that calls other hooks. It shares *logic*, not state — each component calling it gets its own independent state.",
    level: "intermediate",
    frequency: "high",
    minutes: 15,
    kinds: ["theory", "coding"],
    status: "outline",
    prerequisites: ["react/hooks-internals", "react/use-effect-cleanup"],
    related: ["react/memoization-hooks", "javascript/debounce-throttle"],
    tags: ["custom-hooks", "useDebounce", "composition"],
    sources: [{ label: "react.dev — Reusing Logic with Custom Hooks", url: rd("learn/reusing-logic-with-custom-hooks"), kind: "docs" }],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Extract a custom hook from repeated effect + state logic",
              "Explain why two components using the same hook don't share state",
              "Implement `useDebounce` and `useOnlineStatus` with correct cleanup",
              "Design a hook's return shape (tuple vs object) and stable callbacks",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Naming rule and why the linter needs it",
              "Hooks share logic, not state",
              "Worked examples: useDebounce, useLocalStorage, useFetch with AbortController",
              "When a hook should be a component or a library instead",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "component-placement",
    track: "react",
    title: "Component placement and what re-renders",
    summary:
      "Where you put state and how you compose components decides how much of the tree re-renders. Moving state down and lifting content up as `children` often beats memoization.",
    level: "intermediate",
    frequency: "medium",
    minutes: 15,
    kinds: ["theory", "coding"],
    status: "outline",
    prerequisites: ["react/rendering-reconciliation"],
    related: ["react/memoization-hooks", "react/server-components"],
    tags: ["composition", "state-colocation", "re-renders"],
    sources: [
      { label: "react.dev — Sharing State Between Components", url: rd("learn/sharing-state-between-components"), kind: "docs" },
      { label: "react.dev — Passing Data Deeply with Context", url: rd("learn/passing-data-deeply-with-context"), kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Predict which components re-render after a state update",
              "Colocate state with the components that use it",
              "Use `children` to keep expensive subtrees from re-rendering",
              "Avoid defining components inside other components",
              "Choose where the client boundary goes in an RSC app",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Re-render propagation from the state owner downwards",
              "'Move state down' and 'lift content up' patterns",
              "Context granularity and provider value stability",
              "Server vs client placement of components",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "shadcn-ui",
    track: "react",
    title: "shadcn/ui and the copy-in components philosophy",
    summary:
      "shadcn/ui isn't installed as a dependency: a CLI copies component source (built on Radix UI primitives and Tailwind CSS) into your repo, so you own and edit the code. This lesson covers the trade-offs versus a packaged component library.",
    level: "beginner",
    frequency: "low",
    minutes: 10,
    kinds: ["theory"],
    status: "outline",
    prerequisites: ["react/component-placement"],
    related: ["react/server-components"],
    tags: ["shadcn", "radix", "tailwind", "design-systems"],
    sources: [
      { label: "shadcn/ui documentation", url: "https://ui.shadcn.com/docs", kind: "docs" },
      { label: "Radix UI Primitives", url: "https://www.radix-ui.com/primitives", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain 'you own the code' vs `npm install some-ui-lib`",
              "Describe the roles of Radix primitives (behaviour, accessibility) and Tailwind (styling)",
              "Weigh customisation freedom against taking on upgrades yourself",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "How the CLI and `components.json` work",
              "Headless primitives + utility CSS composition",
              "Trade-offs: no version lock-in vs manual updates and drift",
              "Theming with CSS variables",
            ],
          },
        ],
      },
    ],
  },
];
