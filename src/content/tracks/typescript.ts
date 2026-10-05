import type { Lesson, Track } from "../types";

const hb = (page: string) => `https://www.typescriptlang.org/docs/handbook/${page}`;

export const track: Track = {
  slug: "typescript",
  title: "TypeScript",
  tagline: "A structural type system layered on JavaScript — how it checks, infers, narrows and builds.",
  description:
    "TypeScript adds a compile-time, structural type system to JavaScript and then erases it. This track covers how that type system actually reasons (types vs interfaces, generics, narrowing, structural compatibility), the pragmatic choices teams make (enums vs union literals, strict mode) and how `tsc` builds large codebases quickly (incremental builds and project references).",
  modules: [
    {
      id: "ts-foundations",
      title: "Type system foundations",
      summary: "How TypeScript describes shapes, why compatibility is structural, and how strictness changes what the checker catches.",
      lessons: ["types-vs-interfaces", "structural-typing", "enums", "strict-mode"],
    },
    {
      id: "ts-advanced-types",
      title: "Advanced types",
      summary: "Generics, control-flow narrowing and the built-in utility types that transform other types.",
      lessons: ["generics", "narrowing", "utility-types"],
    },
    {
      id: "ts-tooling",
      title: "Tooling and builds",
      summary: "How `tsc` avoids redoing work: `.tsbuildinfo`, `incremental`, `composite` and project references.",
      lessons: ["incremental-compilation"],
    },
  ],
  milestones: [
    {
      id: "ts-typed-event-emitter",
      title: "Type-safe event emitter",
      summary: "An event emitter whose `on`/`emit` signatures are derived from a single event map type.",
      level: "intermediate",
      requirements: [
        "Define `Events` as a map of event name → payload type",
        "`on<K extends keyof Events>(name: K, fn: (p: Events[K]) => void)` rejects wrong payloads at compile time",
        "`emit` with a misspelled event name is a type error",
        "No `any` in the public API; compile under `strict: true`",
      ],
      stretch: ["Support `once` and an `off` that returns the unsubscribe function", "Infer the map from a runtime object with `as const`"],
      exercises: ["typescript/generics", "typescript/types-vs-interfaces", "typescript/strict-mode"],
    },
    {
      id: "ts-typed-api-client",
      title: "Typed API client with discriminated unions",
      summary: "A fetch wrapper that returns `{ ok: true, data } | { ok: false, error }` and forces callers to narrow.",
      level: "intermediate",
      requirements: [
        "Responses modelled as a discriminated union on `ok` or `status`",
        "Exhaustive `switch` using a `never` check so adding a variant breaks the build",
        "Parse unknown JSON as `unknown` and narrow with a type guard, never cast blindly",
      ],
      stretch: ["Derive request/response types from a route table with mapped types"],
      exercises: ["typescript/narrowing", "typescript/utility-types", "typescript/generics"],
    },
    {
      id: "ts-project-references",
      title: "Monorepo with project references",
      summary: "Split a codebase into `composite` projects built with `tsc -b` and measure the rebuild speed-up.",
      level: "advanced",
      requirements: [
        "At least three projects (`shared`, `api`, `web`) with `references` between them",
        "`composite: true` and `declaration: true` on referenced projects",
        "Show that editing `web` does not re-check `shared` (compare `tsc -b --verbose` output)",
      ],
      exercises: ["typescript/incremental-compilation", "production/monorepos-turborepo", "production/build-performance"],
    },
  ],
  sources: [
    { label: "TypeScript Handbook — Everyday Types", url: hb("2/everyday-types.html"), kind: "docs" },
    { label: "TypeScript Handbook — Generics", url: hb("2/generics.html"), kind: "docs" },
    { label: "TypeScript Handbook — Enums", url: hb("enums.html"), kind: "docs" },
    { label: "TypeScript Handbook — Narrowing", url: hb("2/narrowing.html"), kind: "docs" },
    { label: "TypeScript Handbook — Utility Types", url: hb("utility-types.html"), kind: "docs" },
    { label: "TypeScript Handbook — Type Compatibility", url: hb("type-compatibility.html"), kind: "docs" },
    { label: "TypeScript Handbook — Project References", url: hb("project-references.html"), kind: "docs" },
    { label: "TSConfig reference — strict", url: "https://www.typescriptlang.org/tsconfig#strict", kind: "docs" },
    { label: "TSConfig reference — incremental", url: "https://www.typescriptlang.org/tsconfig#incremental", kind: "docs" },
    { label: "100xDocs — review reminder from learner's study notes", kind: "original-note" },
  ],
};

export const lessons: Lesson[] = [
  // ───────────────────────────────────────────── types-vs-interfaces
  {
    slug: "types-vs-interfaces",
    track: "typescript",
    title: "Type aliases vs interfaces",
    summary:
      "Both name a shape, and for plain object types they are almost interchangeable. The real differences: interfaces can be merged and extended, type aliases can name any type (unions, tuples, mapped and conditional types).",
    level: "beginner",
    frequency: "very-high",
    minutes: 20,
    kinds: ["theory", "coding", "quiz"],
    status: "authored",
    prerequisites: ["javascript/data-types"],
    related: ["typescript/structural-typing", "typescript/generics", "typescript/utility-types"],
    tags: ["types", "interfaces", "declaration-merging"],
    sources: [
      { label: "TypeScript Handbook — Everyday Types (Differences Between Type Aliases and Interfaces)", url: hb("2/everyday-types.html"), kind: "docs" },
      { label: "TypeScript Handbook — Declaration Merging", url: hb("declaration-merging.html"), kind: "docs" },
    ],
    questions: ["typescript/ts-01", "typescript/ts-05"],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Write the same object shape as a `type` and as an `interface`",
              "Name the things only a type alias can do (unions, tuples, mapped/conditional types, primitives)",
              "Explain declaration merging and why it matters for library augmentation",
              "Explain how `extends` and `&` differ when properties conflict",
              "Pick one confidently and justify it in an interview",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Think of a **type alias** as a nickname: `type Id = string | number` just gives a name to any type expression. Think of an **interface** as a named, *open* contract for an object shape: other declarations can add to it later.",
          },
          {
            type: "p",
            text: "Because TypeScript compares types by structure, not by name, a value that fits one fits the other. The choice is mostly about what you need to express and whether the shape should be extendable from elsewhere.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "code",
            lang: "ts",
            code: `// Type alias: a name for ANY type expression
type User = { id: number; name: string };
type Id = string | number;          // union — interfaces can't do this
type Pair = [string, number];       // tuple
type ReadonlyUser = Readonly<User>; // mapped type via a utility

// Interface: a named object (or callable/constructable) shape
interface Account {
  id: number;
  owner: string;
}
interface Admin extends Account {
  permissions: string[];
}`,
            caption: "Both `User` and `Account` describe an object; only the alias can name a union or tuple.",
          },
          {
            type: "table",
            head: ["Capability", "`type`", "`interface`"],
            rows: [
              ["Describe an object shape", "Yes", "Yes"],
              ["Union / intersection / tuple / primitive alias", "Yes", "No (can only extend object-like types)"],
              ["Mapped & conditional types", "Yes", "No"],
              ["Declaration merging (re-open to add members)", "No — duplicate identifier error", "Yes"],
              ["`extends` another shape", "Via `&` intersection", "Via `extends` (checked for conflicts)"],
              ["`class X implements ...`", "Yes, if it resolves to an object type", "Yes"],
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
              "**Library augmentation** depends on merging: e.g. adding a `user` field to Express's `Request` or a custom property to `Window` by re-declaring the interface.",
              "**Modelling data** (API responses, Redux actions, state machines) usually needs unions, which only aliases express.",
              "**Error quality**: when an interface `extends` with a conflicting property you get an error at the declaration; an intersection silently produces `never` for the clashing property.",
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
              {
                title: "Both are erased",
                detail: "Neither produces any JavaScript. After type-checking, `tsc` (or esbuild/SWC) strips them; they cannot affect runtime behaviour.",
              },
              {
                title: "Interfaces are named, open symbols",
                detail: "The checker collects every `interface X` declaration in the same scope into one symbol and merges their members. This is why global augmentation works.",
              },
              {
                title: "Aliases are closed",
                detail: "A `type X = ...` declaration binds once. A second declaration is `Duplicate identifier 'X'`.",
              },
              {
                title: "Compatibility is structural for both",
                detail: "Assignability checks compare members, not names, so an object typed as `User` is assignable to `Account`-like shapes with the same members.",
              },
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Performance folklore",
            text: "The TypeScript team's performance wiki has recommended interfaces over large intersections because `extends` relationships are cached while intersections are recomputed. This is a compiler implementation detail, it only matters for very large type graphs, and it may change between versions — don't treat it as a language rule.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: conflicting properties",
        blocks: [
          {
            type: "code",
            lang: "ts",
            code: `interface A { id: string }
interface B extends A { id: number }
// ❌ Error: Interface 'B' incorrectly extends interface 'A'.
//    Types of property 'id' are incompatible.

type C = { id: string };
type D = C & { id: number };
// ✅ No error here... but D["id"] is string & number, i.e. never.
const d: D = { id: 1 }; // ❌ Type 'number' is not assignable to type 'never'.`,
          },
          {
            type: "steps",
            steps: [
              { title: "`extends` checks compatibility", detail: "The checker verifies `B` is assignable to `A`. `number` is not assignable to `string`, so it reports at the declaration." },
              { title: "`&` combines members", detail: "An intersection merges property types with `&`; `string & number` has no values and reduces to `never`." },
              { title: "Error moves to the use site", detail: "You only find out when you try to create a value — further from the actual mistake." },
            ],
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "ts",
            code: `// Declaration merging: augmenting a global
declare global {
  interface Window {
    appVersion: string;
  }
}
window.appVersion = "1.2.0"; // OK — Window now has appVersion

// Union of shapes — needs a type alias
type Shape =
  | { kind: "circle"; r: number }
  | { kind: "square"; side: number };

function area(s: Shape): number {
  return s.kind === "circle" ? Math.PI * s.r ** 2 : s.side ** 2;
}`,
            caption: "Merging for augmentation; a type alias for a discriminated union.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Assuming an interface creates a runtime value — `instanceof MyInterface` is impossible; interfaces are erased.",
              "Accidentally merging: two files declaring `interface Config` in the global scope silently combine instead of erroring.",
              "Using `&` to 'override' a property type and getting `never` instead (use `Omit<T, 'k'> & { k: NewType }`).",
              "Believing one is 'more correct'. Both are first-class; consistency within a codebase matters more.",
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
              {
                title: "Prefer `interface` when",
                points: [
                  "Describing object/class contracts in a public library API",
                  "Consumers may need to augment it (plugins, globals)",
                  "You want conflict errors at the declaration with `extends`",
                ],
              },
              {
                title: "Prefer `type` when",
                points: [
                  "You need unions, tuples, primitives, function types",
                  "Building mapped/conditional types or using utility types",
                  "You want a closed shape that can't be merged by accident",
                ],
              },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "For object shapes they're nearly interchangeable and both are erased at compile time. A type alias can name *any* type — unions, tuples, primitives, mapped and conditional types. An interface only describes object-like shapes but is open: multiple declarations merge, which is how libraries let you augment `Window` or Express's `Request`. I default to interfaces for public object contracts and aliases for unions and type-level computation.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Compatibility is structural for both: the name `User` vs `Account` doesn't matter, only the members.",
              "`interface B extends A` checks B is assignable to A and errors at the declaration on conflicts; `A & B` intersects property types, potentially producing `never`.",
              "Merging rules: non-function members must have identical types across declarations; function members become overloads, with later declarations' overloads ordered first.",
              "Interfaces can describe call and construct signatures too (`interface Fn { (x: number): string }`), so 'interfaces are only for objects' really means 'object-like types'.",
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
              "Both are compile-time only and structurally compared.",
              "Only aliases: unions, tuples, primitives, mapped/conditional types.",
              "Only interfaces: declaration merging; better conflict errors with `extends`.",
              "Pick a convention and be consistent.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Type alias", definition: "A `type Name = ...` declaration that gives a name to any type expression." },
      { term: "Interface", definition: "A named, open declaration of an object-like shape that can be extended and merged." },
      { term: "Declaration merging", definition: "The compiler combining multiple same-named interface (or namespace) declarations into one." },
      { term: "Intersection type", definition: "`A & B`: a value must satisfy both A and B; conflicting property types intersect, possibly to `never`." },
      { term: "Type erasure", definition: "Types are removed when compiling to JavaScript, so they have no runtime existence." },
    ],
    followUps: [
      { q: "Can a class implement a type alias?", a: "Yes, as long as the alias resolves to an object type (not a union). `class X implements SomeType` checks the class against its members." },
      { q: "How do you add a property to Express's Request type?", a: "Augment the interface via declaration merging, e.g. `declare global { namespace Express { interface Request { user?: User } } }` in a `.d.ts` file included by the project." },
      { q: "How do you 'override' a property's type from an existing type?", a: "Use `Omit<T, 'prop'> & { prop: NewType }`, or `interface X extends Omit<T, 'prop'> { prop: NewType }` — not a bare intersection, which yields `never` on conflict." },
    ],
    quiz: [
      {
        id: "tvi-q1",
        prompt: "Which of these can ONLY be written with a type alias?",
        options: ["An object with two properties", "A union `\"a\" | \"b\"`", "A shape a class implements", "A shape extending another shape"],
        answer: 1,
        explanation: "Interfaces can't name unions. The other three can be done with either.",
      },
      {
        id: "tvi-q2",
        prompt: "What happens here?",
        code: { lang: "ts", code: `interface Cfg { a: string }\ninterface Cfg { b: number }\nconst c: Cfg = { a: "x" };` },
        options: ["Duplicate identifier error", "Compiles fine", "Error: property 'b' is missing", "The second declaration replaces the first"],
        answer: 2,
        explanation: "The two declarations merge into `{ a: string; b: number }`, so the object literal is missing `b`.",
      },
      {
        id: "tvi-q3",
        prompt: "`type D = { id: string } & { id: number }` — what is the type of `D[\"id\"]`?",
        options: ["string", "number", "string | number", "never"],
        answer: 3,
        explanation: "Intersections intersect property types: `string & number` has no inhabitants, so it is `never`.",
      },
    ],
  },
  // ───────────────────────────────────────────── generics
  {
    slug: "generics",
    track: "typescript",
    title: "Generics and constraints",
    summary:
      "Generics are type parameters: they let one function or type work over many types while preserving the relationship between inputs and outputs. Constraints (`extends`) say what a type parameter must at least support.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 30,
    kinds: ["theory", "coding", "quiz"],
    status: "authored",
    prerequisites: ["typescript/types-vs-interfaces", "javascript/higher-order-functions"],
    related: ["typescript/utility-types", "typescript/narrowing", "typescript/structural-typing"],
    tags: ["generics", "constraints", "inference", "keyof"],
    sources: [
      { label: "TypeScript Handbook — Generics", url: hb("2/generics.html"), kind: "docs" },
      { label: "TypeScript Handbook — Keyof Type Operator", url: hb("2/keyof-types.html"), kind: "docs" },
      { label: "TypeScript Handbook — Conditional Types", url: hb("2/conditional-types.html"), kind: "docs" },
    ],
    questions: ["typescript/ts-02", "typescript/ts-04"],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain what problem a type parameter solves compared with `any`",
              "Write generic functions, interfaces and classes",
              "Constrain a type parameter with `extends` and `keyof`",
              "Predict what TypeScript infers for a type argument",
              "Recognise when a generic is unnecessary",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A generic is a function *over types*. Just as `function id(x) { return x }` takes a value, `function id<T>(x: T): T` also takes a type `T` — usually filled in automatically from the argument.",
          },
          {
            type: "p",
            text: "The point is preserving a **relationship**: 'whatever goes in comes out'. `any` loses that relationship; `unknown` keeps safety but forgets the specific type. Generics keep both.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "code",
            lang: "ts",
            code: `function first<T>(xs: T[]): T | undefined {
  return xs[0];
}
const n = first([1, 2, 3]);       // n: number | undefined  (T inferred as number)
const s = first<string>(["a"]);    // explicit type argument

// Constraint: T must have a length property
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}
longest("abc", "de");     // OK, T = string
longest([1, 2], [3]);     // OK, T = number[]
// longest(10, 20);       // ❌ number has no 'length'`,
          },
          {
            type: "list",
            items: [
              "**Type parameter**: the placeholder `T` declared in `<T>`.",
              "**Type argument**: the concrete type that fills it, explicit (`<string>`) or inferred.",
              "**Constraint**: `T extends X` — T must be assignable to X; inside the function you may use X's members.",
              "**Default**: `<T = string>` used when nothing is inferred or supplied.",
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "`function id(x: any): any`", points: ["Accepts anything", "Return type is `any` — type safety is gone downstream", "Typos on the result compile"] },
              { title: "`function id(x: unknown): unknown`", points: ["Safe", "Caller must narrow the result again", "Loses the input type"] },
              { title: "`function id<T>(x: T): T`", points: ["Safe", "Return type equals input type", "Zero runtime cost — erased"] },
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
              { title: "Inference from arguments", detail: "At a call site, the checker matches each argument's type against the parameter types to collect candidates for `T`, then picks a best common type." },
              { title: "Contextual typing flows back", detail: "Once `T` is fixed from earlier arguments, it types later arguments such as callback parameters (e.g. `map(xs, x => x.toFixed())`)." },
              { title: "Constraint check", detail: "The inferred `T` must be assignable to its constraint; otherwise you get an error at the call." },
              { title: "Erasure", detail: "Type parameters disappear from emitted JavaScript. There is no runtime `T` — you can't write `new T()` or `x instanceof T`." },
            ],
          },
          {
            type: "callout",
            tone: "note",
            title: "Literal widening",
            text: "`first([\"a\", \"b\"])` infers `T = string`, not `\"a\" | \"b\"`. Since TypeScript 5.0 you can write `<const T>` on the type parameter to ask for the narrowest (literal, readonly) inference.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: a type-safe property getter",
        blocks: [
          {
            type: "code",
            lang: "ts",
            code: `function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user = { id: 7, name: "Ada" };
const id = getProp(user, "id");     // number
const name = getProp(user, "name"); // string
// getProp(user, "email");          // ❌ '"email"' is not assignable to '"id" | "name"'`,
          },
          {
            type: "steps",
            steps: [
              { title: "Infer T", detail: "From `user`, T = `{ id: number; name: string }`." },
              { title: "Compute keyof T", detail: "`keyof T` = `\"id\" | \"name\"`, which becomes K's constraint." },
              { title: "Infer K", detail: "From the literal argument `\"id\"`, K = `\"id\"` (a literal, because it is constrained to a union of literals)." },
              { title: "Indexed access", detail: "Return type `T[K]` = `T[\"id\"]` = `number`." },
            ],
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "ts",
            code: `// Generic interface and class
interface ApiResult<T> { ok: true; data: T }

class Stack<T> {
  private items: T[] = [];
  push(x: T) { this.items.push(x); }
  pop(): T | undefined { return this.items.pop(); }
}
const s = new Stack<number>();
s.push(1);
// s.push("2"); // ❌

// Generic with default
type Paginated<T, Cursor = string> = { items: T[]; next?: Cursor };`,
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "**Unnecessary type parameters**: `function log<T>(x: T): void` — T appears once, so `unknown` is simpler. A type parameter should relate two or more positions.",
              "**Returning `T` you didn't receive**: `function make<T>(): T { return {} as T }` is an unchecked cast disguised as generics.",
              "**Forgetting constraints**: accessing `x.length` on an unconstrained `T` is an error; add `extends { length: number }`.",
              "**Expecting runtime info**: `T` is erased; pass a runtime value (a class, a schema) if you need behaviour.",
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
              "Generics increase precision but also signature complexity; library code benefits most, app code often needs few.",
              "Deeply nested conditional/recursive generic types slow down the checker and produce hard-to-read errors.",
              "Overloads can be clearer than one very clever generic signature for a handful of distinct cases.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Generics are type parameters that let code work across types while preserving the relationship between input and output — `identity<T>(x: T): T` returns exactly the type it was given, unlike `any`, which turns off checking. TypeScript usually infers the type argument from the call. Constraints like `T extends { length: number }` or `K extends keyof T` restrict what can be passed and let you use those members inside. They're erased at compile time, so there's no runtime cost and no runtime `T`.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "`K extends keyof T` + `T[K]` (indexed access) is the canonical pattern for typed property access, `pick`, and event maps.",
              "Conditional types (`T extends U ? X : Y`) distribute over unions when T is a naked type parameter — that's how `Exclude` works.",
              "`infer` inside conditional types extracts parts of a type (`ReturnType<F>`).",
              "Variance: generic types are checked structurally; TS 4.7 added optional `in`/`out` annotations to declare variance explicitly.",
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
              "Type parameters preserve input/output relationships.",
              "Inference fills them in; constraints bound them.",
              "`keyof` + indexed access types power typed property access.",
              "Erased at runtime — no `new T()`.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Type parameter", definition: "A placeholder type like `T` declared in angle brackets on a function, class, interface or alias." },
      { term: "Type argument", definition: "The concrete type substituted for a type parameter, explicit or inferred." },
      { term: "Constraint", definition: "`T extends X`: the type argument must be assignable to X." },
      { term: "keyof", definition: "Operator producing the union of an object type's property keys." },
      { term: "Indexed access type", definition: "`T[K]`: the type of property K on T." },
      { term: "Conditional type", definition: "`T extends U ? X : Y`, a type-level if/else." },
    ],
    followUps: [
      { q: "What's the difference between `any`, `unknown` and a generic `T`?", a: "`any` disables checking; `unknown` is the safe top type that must be narrowed before use; `T` is a specific-but-unknown-to-the-callee type that the caller fixes, preserving it through the signature." },
      { q: "Why can't you write `new T()`?", a: "Types are erased; at runtime there is no T. Accept a constructor instead: `function make<T>(C: new () => T): T { return new C(); }`." },
      { q: "When does inference produce a literal type?", a: "When the type parameter is constrained to a primitive/literal type (e.g. `K extends keyof T` or `T extends string`) or declared with `const` (TS 5.0+); otherwise literals widen." },
    ],
    quiz: [
      {
        id: "gen-q1",
        prompt: "What is the inferred type of `r`?",
        code: { lang: "ts", code: `function wrap<T>(x: T) { return [x]; }\nconst r = wrap(42);` },
        options: ["any[]", "number[]", "[42]", "unknown[]"],
        answer: 1,
        explanation: "T is inferred as `number` (the literal 42 widens), so the return type is `number[]`.",
      },
      {
        id: "gen-q2",
        prompt: "Which signature lets `get(obj, key)` reject keys that don't exist on obj?",
        options: [
          "`get<T>(obj: T, key: string)`",
          "`get<T, K extends keyof T>(obj: T, key: K): T[K]`",
          "`get(obj: any, key: keyof any)`",
          "`get<T>(obj: T, key: T): T`",
        ],
        answer: 1,
        explanation: "Constraining K to `keyof T` only allows existing keys, and `T[K]` returns the precise property type.",
      },
      {
        id: "gen-q3",
        prompt: "Why is `function log<T>(x: T): void` considered a smell?",
        options: ["It doesn't compile", "T is used only once, so it adds nothing over `unknown`", "Generics can't return void", "It has runtime overhead"],
        answer: 1,
        explanation: "A type parameter is useful when it links two positions. Used once, it is equivalent to `unknown` with extra noise.",
      },
    ],
  },
  // ───────────────────────────────────────────── enums
  {
    slug: "enums",
    track: "typescript",
    title: "Enums vs union literals and `as const`",
    summary:
      "TypeScript enums are one of the few features that emit runtime code. Many teams prefer string-literal unions or `as const` objects, which are erased or plain JavaScript and play better with structural typing and modern compilers.",
    level: "beginner",
    frequency: "high",
    minutes: 15,
    kinds: ["theory", "coding", "quiz"],
    status: "authored",
    prerequisites: ["typescript/types-vs-interfaces"],
    related: ["typescript/structural-typing", "typescript/narrowing", "go/enums-iota"],
    tags: ["enums", "as-const", "union-types"],
    sources: [
      { label: "TypeScript Handbook — Enums", url: hb("enums.html"), kind: "docs" },
      { label: "TSConfig reference — isolatedModules", url: "https://www.typescriptlang.org/tsconfig#isolatedModules", kind: "docs" },
      { label: "TSConfig reference — erasableSyntaxOnly", url: "https://www.typescriptlang.org/tsconfig#erasableSyntaxOnly", kind: "docs" },
    ],
    questions: ["typescript/ts-03"],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Describe what a numeric and a string enum compile to",
              "Explain reverse mappings and why numeric enums are loosely typed",
              "Replace an enum with a union literal or an `as const` object",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          { type: "p", text: "An enum is a named set of constants. In TypeScript it is *also* a real JavaScript object created at runtime — unlike interfaces and type aliases, it doesn't disappear at compile time." },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "code",
            lang: "ts",
            code: `enum Direction { Up, Down }          // numeric: Up = 0, Down = 1
enum Status { Active = "ACTIVE", Off = "OFF" } // string enum

// Roughly what tsc emits for Direction:
// var Direction;
// (function (Direction) {
//   Direction[Direction["Up"] = 0] = "Up";
//   Direction[Direction["Down"] = 1] = "Down";
// })(Direction || (Direction = {}));`,
            caption: "Numeric enums get a reverse mapping: `Direction[0] === \"Up\"`. String enums don't.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "Enums are **nominal-ish**: a string enum member isn't assignable from the plain string `\"ACTIVE\"`, which surprises people coming from JSON.",
              "They emit code, so they don't fit 'TypeScript is JavaScript plus erasable types'. Tools that strip types without type information (Babel, esbuild, Node's type stripping) can't handle `const enum` across files, and TS 5.8's `erasableSyntaxOnly` flag rejects enums entirely.",
              "Union literals give the same autocomplete and exhaustiveness checks with zero runtime footprint.",
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
            title: "Version-dependent behaviour",
            text: "Before TypeScript 5.0, any `number` was assignable to a numeric enum (`const d: Direction = 42` compiled). 5.0 made all enums union enums, so out-of-range literals now error — but a plain `number` variable is still assignable. `const enum` values are inlined by `tsc`, but under `isolatedModules` they can't be inlined across files.",
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "ts",
            code: `// 1) Union of string literals — erased entirely
type Status = "active" | "off";

// 2) as const object — a runtime value AND a derived type
const Status = { Active: "active", Off: "off" } as const;
type StatusT = (typeof Status)[keyof typeof Status]; // "active" | "off"

function label(s: StatusT) {
  switch (s) {
    case "active": return "On";
    case "off": return "Off";
  }
}
label(Status.Active); // OK
label("off");         // OK — plain strings from JSON just work`,
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Iterating a numeric enum with `Object.keys` and getting both names and numbers (because of reverse mappings).",
              "Expecting `\"ACTIVE\"` from an API to type-check as `Status.Active`.",
              "Using `const enum` in a library published as `.d.ts` that consumers compile with `isolatedModules`.",
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
              { title: "Enum", points: ["Namespaced members (`Status.Active`)", "Runtime object for iteration", "Emits code; awkward with strippers; nominal-ish assignability"] },
              { title: "Union literal / `as const`", points: ["Zero or plain-JS runtime cost", "Plain strings assignable — great for JSON", "Need a small type expression to derive the union"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          { type: "p", text: "Enums are a TypeScript feature that emits a runtime object; numeric enums even have reverse mappings. Many teams prefer a string-literal union, or an `as const` object plus a derived union type, because it's erased or plain JavaScript, works with type-stripping tools, and lets raw strings from JSON be assigned without casts. Enums are fine when you want a namespaced runtime object, but string enums over numeric ones." },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Exhaustiveness: with a union, `const _x: never = s` in the `default` branch fails to compile when a new member is added.",
              "`keyof typeof Enum` gives member names; `(typeof Obj)[keyof typeof Obj]` gives the values of an `as const` object.",
              "Node.js's built-in TypeScript type stripping only removes erasable syntax, so enums need transformation, not just stripping.",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          { type: "list", items: ["Enums emit runtime code; numeric ones reverse-map.", "Union literals and `as const` objects are the common modern alternative.", "Prefer string over numeric enums if you use enums at all."] },
        ],
      },
    ],
    glossary: [
      { term: "Reverse mapping", definition: "For numeric enums, the emitted object maps values back to names (`Direction[0] === \"Up\"`)." },
      { term: "`as const`", definition: "A const assertion: infer the narrowest literal, readonly type for an expression." },
      { term: "const enum", definition: "An enum whose member accesses are inlined at compile time; requires cross-file type info." },
      { term: "Erasable syntax", definition: "TypeScript syntax that can be deleted without changing runtime behaviour (types, interfaces) — enums are not erasable." },
    ],
    followUps: [
      { q: "How do you make a `switch` over a union exhaustive?", a: "Add `default: { const _exhaustive: never = value; }` — if a case is missing, `value` isn't `never` and compilation fails." },
      { q: "Why does `Object.keys(Direction)` return 4 items for a 2-member numeric enum?", a: "Reverse mappings add numeric keys (`\"0\"`, `\"1\"`) alongside the names." },
    ],
    quiz: [
      {
        id: "enum-q1",
        prompt: "Which of these leaves NO JavaScript in the compiled output?",
        options: ["`enum E { A }`", "`enum E { A = \"a\" }`", "`type E = \"a\" | \"b\"`", "`const E = { A: \"a\" } as const`"],
        answer: 2,
        explanation: "Type aliases are erased. Both enum forms and the `as const` object produce runtime values.",
      },
      {
        id: "enum-q2",
        prompt: "Given `enum S { On = \"ON\" }`, does `const s: S = \"ON\"` compile?",
        options: ["Yes", "No — a string literal isn't assignable to a string enum type", "Only with strict off", "Only for numeric enums"],
        answer: 1,
        explanation: "String enum members are treated as distinct from their literal values; you must write `S.On`.",
      },
    ],
  },
  // ───────────────────────────────────────────── outlines
  {
    slug: "structural-typing",
    track: "typescript",
    title: "Structural typing and type compatibility",
    summary:
      "TypeScript decides assignability by comparing shapes, not names. This lesson covers how compatibility is computed, excess property checks on fresh object literals, and how to simulate nominal types with brands.",
    level: "intermediate",
    frequency: "high",
    minutes: 20,
    kinds: ["theory", "coding"],
    status: "outline",
    prerequisites: ["typescript/types-vs-interfaces"],
    related: ["typescript/generics", "typescript/strict-mode", "go/interfaces"],
    tags: ["structural-typing", "compatibility", "branding"],
    sources: [{ label: "TypeScript Handbook — Type Compatibility", url: hb("type-compatibility.html"), kind: "docs" }],
    questions: ["typescript/ts-05"],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain structural vs nominal typing with an example",
              "Predict when excess property checks fire (fresh object literals only)",
              "Describe function parameter bivariance for methods vs `strictFunctionTypes`",
              "Create a branded type such as `UserId` to prevent mixing IDs",
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
              "Assignability = 'has at least the required members with compatible types'",
              "Excess property checks and object-literal freshness",
              "Function compatibility: parameter count, return types, variance",
              "Branding / nominal simulation with intersection tags",
              "Comparison with Go's implicitly satisfied interfaces",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "strict-mode",
    track: "typescript",
    title: "Strict mode and what each flag catches",
    summary:
      "`strict: true` turns on a family of checks — `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes` and more. This lesson maps each flag to the bug class it prevents and how to migrate a loose codebase.",
    level: "beginner",
    frequency: "medium",
    minutes: 15,
    kinds: ["theory"],
    status: "outline",
    prerequisites: ["typescript/types-vs-interfaces"],
    related: ["typescript/narrowing", "typescript/structural-typing"],
    tags: ["tsconfig", "strict", "strictNullChecks"],
    sources: [
      { label: "TSConfig reference — strict", url: "https://www.typescriptlang.org/tsconfig#strict", kind: "docs" },
      { label: "TSConfig reference — noUncheckedIndexedAccess", url: "https://www.typescriptlang.org/tsconfig#noUncheckedIndexedAccess", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "List the flags enabled by `strict` and the bug each prevents",
              "Explain why `strictNullChecks` is the most valuable single flag",
              "Know useful flags outside `strict` (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)",
              "Plan an incremental migration of a non-strict project",
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
              "`strict` family: noImplicitAny, strictNullChecks, strictFunctionTypes, strictBindCallApply, strictPropertyInitialization, noImplicitThis, useUnknownInCatchVariables, alwaysStrict",
              "New strict sub-flags may be added in future TS versions (upgrades can surface new errors)",
              "Extra safety flags not included in `strict`",
              "Migration strategy: per-flag, per-directory, `// @ts-expect-error` budget",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "narrowing",
    track: "typescript",
    title: "Narrowing and control-flow analysis",
    summary:
      "The checker tracks how `typeof`, `instanceof`, `in`, equality checks and discriminant properties refine a union inside each branch. This lesson covers those guards, user-defined type predicates, assertion functions and exhaustiveness with `never`.",
    level: "intermediate",
    frequency: "high",
    minutes: 20,
    kinds: ["theory", "coding"],
    status: "outline",
    prerequisites: ["typescript/types-vs-interfaces", "javascript/data-types"],
    related: ["typescript/generics", "typescript/enums", "typescript/strict-mode"],
    tags: ["narrowing", "type-guards", "discriminated-unions", "never"],
    sources: [{ label: "TypeScript Handbook — Narrowing", url: hb("2/narrowing.html"), kind: "docs" }],
    questions: ["typescript/ts-04"],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Use `typeof`, `instanceof`, `in` and truthiness checks to narrow unions",
              "Model state with discriminated unions and switch on the tag",
              "Write `x is T` type predicates and `asserts x is T` assertion functions",
              "Enforce exhaustiveness with a `never` check",
              "Distinguish `any`, `unknown` and `never`",
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
              "Control-flow analysis and why narrowing resets after assignments/callbacks",
              "Built-in guards and their pitfalls (`typeof null === \"object\"`)",
              "Discriminated unions",
              "Type predicates, assertion functions, inferred predicates (TS 5.5)",
              "`never` and exhaustive switches",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "utility-types",
    track: "typescript",
    title: "Utility types and mapped types",
    summary:
      "Built-ins like `Partial`, `Pick`, `Omit`, `Record`, `ReturnType` and `Awaited` are ordinary mapped and conditional types. Learn to use them and to read their definitions so you can write your own.",
    level: "intermediate",
    frequency: "high",
    minutes: 20,
    kinds: ["theory", "coding"],
    status: "outline",
    prerequisites: ["typescript/generics"],
    related: ["typescript/types-vs-interfaces", "typescript/narrowing"],
    tags: ["utility-types", "mapped-types", "conditional-types"],
    sources: [
      { label: "TypeScript Handbook — Utility Types", url: hb("utility-types.html"), kind: "docs" },
      { label: "TypeScript Handbook — Mapped Types", url: hb("2/mapped-types.html"), kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Use `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record` correctly",
              "Use `ReturnType`, `Parameters`, `Awaited`, `NonNullable`, `Exclude`, `Extract`",
              "Re-implement `Partial` and `Pick` as mapped types",
              "Understand distributive conditional types and `infer`",
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
              "Mapped types: `{ [K in keyof T]: ... }` with `?`/`readonly` modifiers and key remapping (`as`)",
              "Conditional types, distribution over unions, `infer`",
              "Common utilities and when `Omit` loses information on unions",
              "Writing a `DeepPartial` and the cost of recursive types",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "incremental-compilation",
    track: "typescript",
    title: "Incremental compilation and project references",
    summary:
      "`incremental` makes `tsc` save a `.tsbuildinfo` file describing the previous build so it can skip unchanged work; `composite` projects and `references` (built with `tsc -b`) split a large codebase into independently cached units.",
    level: "advanced",
    frequency: "medium",
    minutes: 20,
    kinds: ["theory"],
    status: "outline",
    prerequisites: ["typescript/types-vs-interfaces"],
    related: ["production/monorepos-turborepo", "production/build-performance", "production/pnpm-internals"],
    tags: ["tsc", "tsbuildinfo", "project-references", "build"],
    sources: [
      { label: "TypeScript Handbook — Project References", url: hb("project-references.html"), kind: "docs" },
      { label: "TSConfig reference — incremental", url: "https://www.typescriptlang.org/tsconfig#incremental", kind: "docs" },
      { label: "TSConfig reference — composite", url: "https://www.typescriptlang.org/tsconfig#composite", kind: "docs" },
      { label: "TSConfig reference — tsBuildInfoFile", url: "https://www.typescriptlang.org/tsconfig#tsBuildInfoFile", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain what `.tsbuildinfo` stores (file versions/hashes, signatures, dependency graph, diagnostics) and how it avoids re-checking",
              "Enable `incremental` and know where the build info file is written",
              "Configure `composite` projects with `references` and build them with `tsc -b`",
              "Explain why referenced projects consume each other's `.d.ts` output instead of source",
              "Relate this to monorepo tooling (Turborepo caching, editor performance)",
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
              "`incremental` and `tsBuildInfoFile`",
              "`composite`: forces `declaration`, requires listed `include`/`files`, enables referencing",
              "`tsc -b` / `--build`: up-to-date checks, build order, `--verbose`, `--clean`",
              "Signature-based invalidation: a change that doesn't alter a file's public `.d.ts` doesn't force dependents to re-check",
              "Trade-offs vs one big `tsconfig` and vs `noEmit` type-check-only setups",
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            text: "The `.tsbuildinfo` format is an internal `tsc` detail and changes between TypeScript versions; never commit or parse it.",
          },
        ],
      },
    ],
  },
];
