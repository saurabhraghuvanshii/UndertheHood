import type { Lesson, Track } from "../types";

const notes100x = { label: "100xDocs — review reminder from learner's study notes", kind: "original-note" as const };
const mit6006 = { label: "MIT 6.006 Introduction to Algorithms (Spring 2020, OCW)", url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/", kind: "external" as const };
const clrs = { label: "Cormen, Leiserson, Rivest, Stein — Introduction to Algorithms (CLRS), 4th ed.", url: "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/", kind: "external" as const };
const bigo = { label: "Big-O Cheat Sheet", url: "https://www.bigocheatsheet.com/", kind: "external" as const };
const mdnMap = { label: "MDN — Map", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map", kind: "docs" as const };
const mdnBitwise = { label: "MDN — Bitwise operators (expressions and operators guide)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators#bitwise_operators", kind: "docs" as const };

export const track: Track = {
  slug: "dsa",
  title: "Data structures and algorithms",
  tagline: "Big-O, the core data structures and the patterns interviewers actually ask about.",
  description:
    "Learn to reason about cost first (Big-O and amortized analysis), then build the core data structures yourself in JavaScript — arrays, linked lists, stacks, queues, hash tables, trees, heaps and graphs — and finish with the recurring algorithm patterns: recursion, sorting and searching, two pointers, sliding window and dynamic programming.",
  modules: [
    {
      id: "dsa-foundations",
      title: "Foundations",
      summary: "How to measure cost, how numbers are stored in bits, and how recursion uses the call stack.",
      lessons: ["complexity", "number-systems", "recursion"],
    },
    {
      id: "dsa-linear",
      title: "Linear structures",
      summary: "Arrays and strings, linked lists, stacks, queues and hash tables — what each operation really costs.",
      lessons: ["arrays-strings", "linked-lists", "stacks-queues", "hash-tables"],
    },
    {
      id: "dsa-trees-graphs",
      title: "Trees and graphs",
      summary: "Hierarchical and networked data: binary search trees, heaps and graph traversal.",
      lessons: ["trees", "heaps", "graphs"],
    },
    {
      id: "dsa-patterns",
      title: "Algorithm patterns",
      summary: "Sorting and searching, two pointers and sliding window, and dynamic programming basics.",
      lessons: ["sorting-searching", "two-pointers-sliding-window", "dynamic-programming"],
    },
  ],
  milestones: [
    {
      id: "dsa-lru-cache",
      title: "LRU cache with O(1) get and put",
      summary: "Implement a least-recently-used cache using a hash map plus a doubly linked list.",
      level: "intermediate",
      requirements: [
        "`get(key)` and `put(key, value)` both run in O(1) time",
        "Hash map from key to list node; doubly linked list ordered from most to least recently used",
        "Use sentinel head/tail nodes so insert and unlink have no special cases",
        "Evict the least-recently-used entry when capacity is exceeded",
        "Tests cover: hit moves entry to front, update of existing key, eviction order, capacity 1",
      ],
      stretch: [
        "Write a second version using only `Map` insertion order and compare the code size",
        "Add per-entry TTL expiry and explain how it interacts with LRU order",
      ],
      exercises: ["dsa/hash-tables", "dsa/linked-lists", "dsa/complexity", "system-design/caching-strategies"],
    },
    {
      id: "dsa-heap-dijkstra",
      title: "Min-heap priority queue and Dijkstra",
      summary: "Build a binary min-heap from scratch and use it to compute shortest paths on a weighted graph.",
      level: "advanced",
      requirements: [
        "Array-backed binary heap with `push`, `pop` and `peek`; sift-up and sift-down in O(log n)",
        "Adjacency-list graph representation",
        "Dijkstra with lazy deletion (skip stale heap entries) in O((V + E) log V)",
        "Return both distances and the predecessor map; reconstruct a path",
      ],
      stretch: ["Show with a counter-example why Dijkstra fails with negative edge weights", "Implement heapify in O(n) and justify the bound"],
      exercises: ["dsa/heaps", "dsa/graphs", "dsa/complexity"],
    },
    {
      id: "dsa-stack-queue-kit",
      title: "Stack and queue toolkit",
      summary: "A tiny library of stack, O(1) queue and deque implementations, plus classic problems solved with them.",
      level: "beginner",
      requirements: [
        "Stack backed by an array and one backed by a singly linked list, same interface",
        "Queue with O(1) enqueue and dequeue (head index or linked list — not `Array.prototype.shift`)",
        "Solve: balanced brackets, evaluate reverse Polish notation, BFS on a grid",
      ],
      stretch: ["Ring-buffer deque with automatic growth", "Benchmark `shift()` vs your queue for 100k elements"],
      exercises: ["dsa/stacks-queues", "dsa/linked-lists", "dsa/graphs"],
    },
  ],
  sources: [mit6006, clrs, bigo, mdnMap, mdnBitwise, notes100x],
};

export const lessons: Lesson[] = [
  // ---------------------------------------------------------------- complexity
  {
    slug: "complexity",
    track: "dsa",
    title: "Complexity: Big-O and amortized analysis",
    summary:
      "How to describe the growth of an algorithm's time and memory as input grows — Big-O, Θ and Ω — and why a dynamic array's push is O(1) amortized even though some pushes copy everything.",
    level: "beginner",
    frequency: "very-high",
    minutes: 30,
    kinds: ["theory", "coding", "quiz"],
    status: "authored",
    prerequisites: [],
    related: ["dsa/arrays-strings", "dsa/hash-tables", "dsa/recursion", "javascript/performance"],
    tags: ["big-o", "asymptotic", "amortized", "time-complexity", "space-complexity"],
    sources: [mit6006, clrs, bigo, notes100x],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain what Big-O measures (growth rate) and what it deliberately ignores (constants, hardware)",
              "Distinguish O, Θ and Ω, and best/average/worst case — they are different axes",
              "Derive the complexity of loops, nested loops, halving loops and simple recursion",
              "Explain amortized O(1) using dynamic-array doubling",
              "Account for space complexity, including the recursion call stack",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Imagine looking for a name in a phone book. Reading every page takes time proportional to the book's size; opening it in the middle and halving each time takes time proportional to how many times you can halve it. When the book doubles in size, the first strategy takes twice as long, the second takes **one more step**.",
          },
          {
            type: "p",
            text: "Big-O is the language for that difference. It ignores whether a step takes 1 ns or 10 ns and asks only: *as the input grows, how does the work grow?*",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "Let `f(n)` be the cost (steps or bytes) of an algorithm on input size `n`. The three asymptotic notations bound `f` by a simpler function `g` for all sufficiently large `n`, up to a constant factor:",
          },
          {
            type: "table",
            head: ["Notation", "Meaning", "Formally (for some c > 0 and all n ≥ n₀)"],
            rows: [
              ["`f = O(g)`", "upper bound — grows **no faster** than g", "`f(n) ≤ c·g(n)`"],
              ["`f = Ω(g)`", "lower bound — grows **at least as fast** as g", "`f(n) ≥ c·g(n)`"],
              ["`f = Θ(g)`", "tight bound — both O and Ω", "`c₁·g(n) ≤ f(n) ≤ c₂·g(n)`"],
            ],
          },
          {
            type: "callout",
            tone: "misconception",
            title: "Big-O is not \"worst case\"",
            text: "Best/average/worst case pick *which inputs* you analyze; O/Ω/Θ describe *how tightly* you bound the cost. Quicksort's worst case is Θ(n²) and its average case is Θ(n log n). In interviews \"Big-O\" usually means a tight bound on the worst case — say which case you mean.",
          },
          {
            type: "p",
            text: "**Amortized** cost is the average cost per operation over a worst-case *sequence* of operations. It is a guarantee about totals, not a probability: no randomness is involved.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "It predicts behaviour at scale: an O(n²) step that is instant at n = 1,000 takes ~10,000× longer at n = 100,000",
              "It is hardware-independent, so two people can compare algorithms without benchmarking",
              "Interviewers use it to check that you know *why* a solution is fast, not just that it passes",
            ],
          },
          {
            type: "table",
            head: ["Class", "Name", "n = 10⁶ (rough step count)", "Typical source"],
            rows: [
              ["O(1)", "constant", "1", "array index, hash lookup (average)"],
              ["O(log n)", "logarithmic", "~20", "binary search, balanced-tree lookup, heap push"],
              ["O(n)", "linear", "10⁶", "single pass"],
              ["O(n log n)", "linearithmic", "~2×10⁷", "merge sort, heap sort, efficient comparison sorts"],
              ["O(n²)", "quadratic", "10¹²", "all pairs, nested loops"],
              ["O(2ⁿ)", "exponential", "astronomical", "all subsets, naive recursion"],
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "How to derive a bound",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Pick the input size", detail: "Name it explicitly: `n` = array length, `V`/`E` = vertices/edges, `m`,`n` for two inputs. Two independent inputs give bounds like O(m + n), not O(n)." },
              { title: "Count the dominant operation", detail: "Loops multiply: a loop of n containing a loop of n is n². Sequential blocks add: O(n) then O(n²) is O(n + n²) = O(n²)." },
              { title: "Watch the loop variable", detail: "`i++` up to n is O(n); `i *= 2` up to n is O(log n) because i reaches n after log₂ n doublings." },
              { title: "Count hidden work", detail: "`arr.includes`, `indexOf`, `slice`, spread and string concatenation in a loop are all O(n) each — a single loop calling them is O(n²)." },
              { title: "Drop constants and lower-order terms", detail: "3n² + 10n + 7 is Θ(n²). This is valid only because we care about large n." },
              { title: "Space too", detail: "Count extra memory you allocate *plus* recursion depth: each active call keeps a frame on the call stack." },
            ],
          },
          {
            type: "p",
            text: "**Amortized analysis by aggregate counting.** A dynamic array (like a JS array or Go slice) has spare capacity. When it fills, it allocates a buffer twice the size and copies everything over. That single push costs O(n), but it can only happen after n cheap pushes.",
          },
          {
            type: "p",
            text: "Starting at capacity 1 and doubling, the copies over n pushes cost 1 + 2 + 4 + … + n/2 + n < 2n. Add n for the writes themselves and the total is < 3n, so the **amortized** cost per push is < 3 = O(1).",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Growth factors are implementation details",
            text: "The ECMAScript spec says nothing about how arrays grow. V8 currently grows a fast array's backing store by roughly 1.5× plus a small constant; Go 1.18+ uses a formula that transitions from 2× to ~1.25× for large slices. Any constant factor > 1 still gives amortized O(1) — only the constant changes.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: counting copies when doubling",
        blocks: [
          {
            type: "code",
            lang: "js",
            runnable: true,
            caption: "A toy dynamic array that counts how many element copies it performs.",
            code: `class DynArray {
  constructor() { this.cap = 1; this.len = 0; this.buf = new Array(1); this.copies = 0; }
  push(x) {
    if (this.len === this.cap) {
      const next = new Array(this.cap * 2);
      for (let i = 0; i < this.len; i++) { next[i] = this.buf[i]; this.copies++; }
      this.buf = next;
      this.cap *= 2;
    }
    this.buf[this.len++] = x;
  }
}

for (const n of [8, 1024, 1000000]) {
  const a = new DynArray();
  for (let i = 0; i < n; i++) a.push(i);
  console.log(n, "pushes ->", a.copies, "copies, ratio", (a.copies / n).toFixed(2));
}`,
            output: `8 pushes -> 7 copies, ratio 0.88
1024 pushes -> 1023 copies, ratio 1.00
1000000 pushes -> 1048575 copies, ratio 1.05`,
          },
          {
            type: "p",
            text: "The copies per push stay bounded (below 2) no matter how large n gets — that is amortized O(1). For n = 1,000,000 the last resize happened at 524,288 → 1,048,576, so total copies are 1 + 2 + … + 524,288 = 1,048,575.",
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "js",
            caption: "Same task, different complexity: does an array contain a duplicate?",
            code: `// O(n²) time, O(1) extra space
function hasDupQuadratic(a) {
  for (let i = 0; i < a.length; i++)
    for (let j = i + 1; j < a.length; j++)
      if (a[i] === a[j]) return true;
  return false;
}

// O(n log n) time (sort), O(n) space for the copy
function hasDupSort(a) {
  const s = [...a].sort((x, y) => x - y);
  for (let i = 1; i < s.length; i++) if (s[i] === s[i - 1]) return true;
  return false;
}

// O(n) average time, O(n) space
function hasDupSet(a) {
  const seen = new Set();
  for (const x of a) { if (seen.has(x)) return true; seen.add(x); }
  return false;
}`,
          },
          {
            type: "compare",
            items: [
              { title: "Quadratic", points: ["No extra memory", "Fine for n ≤ a few thousand", "Hopeless at n = 10⁶"] },
              { title: "Sort first", points: ["Middle ground", "Good when you need sorted data anyway", "Mutating the input in place would save memory"] },
              { title: "Hash set", points: ["Fastest asymptotically", "Pays O(n) memory", "Average case — adversarial hashes can degrade it"] },
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
              "Calling `O(n)` helpers (`includes`, `indexOf`, `shift`, `splice`, `slice`) inside a loop and still claiming O(n)",
              "Forgetting the recursion stack in space complexity — recursive DFS on a linked-list-shaped tree is O(n) space",
              "Writing O(n) for two independent inputs: merging lists of sizes m and n is O(m + n)",
              "Saying hash lookups are O(1) without \"average\" — the worst case is O(n)",
              "Treating amortized O(1) as \"every call is fast\": individual operations can still spike, which matters for latency-sensitive code",
              "Over-trusting Big-O for small n: an O(n²) insertion sort beats O(n log n) merge sort on ~16 elements, which is why real sorts switch to it",
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
              "**Time vs space** — memoization and hash sets buy time with memory",
              "**Asymptotics vs constants** — cache-friendly arrays often beat pointer-heavy trees with better Big-O at realistic sizes",
              "**Amortized vs worst-case** — a resizing hash table is great for throughput but can cause a latency spike; real-time systems may prefer incremental resizing",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Big-O describes how cost grows with input size, ignoring constant factors and lower-order terms. O is an upper bound, Ω a lower bound, Θ a tight bound; best/average/worst case is a separate choice of which inputs. Amortized analysis averages over a sequence: a doubling dynamic array occasionally copies n elements, but the total copying over n pushes is under 2n, so push is O(1) amortized.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Show the geometric series: copies = 1 + 2 + … + n/2 < n, so total work is linear",
              "Contrast with growing by a constant (+10 each time): copies = 10 + 20 + … ≈ n²/20, so push becomes O(n) amortized — the *multiplicative* growth is what matters",
              "Mention the accounting (banker's) method: charge each push 3 units; 1 pays for the write and 2 are saved to pay for copying it and one older element later",
              "Always state space complexity and case (average vs worst) unprompted",
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
              "Big-O = growth rate; constants and small terms are dropped",
              "O / Ω / Θ = upper / lower / tight bound; best/avg/worst = which inputs",
              "Loops multiply, sequences add, halving gives log n",
              "Amortized O(1) push comes from multiplicative growth",
              "Count space, including recursion depth",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Asymptotic", definition: "Describing behaviour as the input size grows towards infinity." },
      { term: "Big-O", definition: "An upper bound on growth: f = O(g) if f(n) ≤ c·g(n) for large n." },
      { term: "Θ (Theta)", definition: "A tight bound: the function is bounded above and below by constant multiples of g." },
      { term: "Ω (Omega)", definition: "A lower bound on growth." },
      { term: "Amortized cost", definition: "Total cost of a worst-case sequence of operations divided by the number of operations." },
      { term: "Dynamic array", definition: "An array that reallocates a larger backing buffer when full, e.g. JS arrays, Go slices, C++ vector." },
      { term: "Space complexity", definition: "Extra memory used as a function of input size, including call-stack frames." },
    ],
    followUps: [
      { q: "Why is binary search O(log n)?", a: "Each comparison halves the remaining range; after k steps n/2ᵏ elements remain, which reaches 1 when k = log₂ n." },
      { q: "Is O(2n) different from O(n)?", a: "No. Constant factors are dropped, so O(2n) = O(n). It may still be twice as slow in practice." },
      { q: "What is the complexity of building a string by `+=` in a loop?", a: "Naively O(n²) because each concatenation copies. Modern JS engines use rope/cons-string representations that make this much cheaper in practice, but `array.join` is the portable linear approach." },
      { q: "Can amortized O(1) operations be a problem?", a: "Yes, in latency-sensitive code: one push may cost O(n). Pre-sizing the buffer or incremental resizing avoids the spike." },
    ],
    quiz: [
      {
        id: "complexity-q1",
        prompt: "What is the time complexity of this function?",
        code: { lang: "js", code: `function f(n) {\n  let c = 0;\n  for (let i = 1; i < n; i *= 2)\n    for (let j = 0; j < n; j++) c++;\n  return c;\n}` },
        options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
        answer: 1,
        explanation: "The outer loop runs ~log₂ n times (i doubles) and the inner loop runs n times for each, so n·log n.",
      },
      {
        id: "complexity-q2",
        prompt: "A dynamic array grows by adding 100 slots whenever it is full. What is the amortized cost of push?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        answer: 2,
        explanation: "Copies total 100 + 200 + … ≈ n²/200, i.e. Θ(n²) over n pushes, so Θ(n) per push. Only multiplicative growth gives amortized O(1).",
      },
      {
        id: "complexity-q3",
        prompt: "Which statement is correct?",
        options: [
          "Big-O always refers to the worst case",
          "Θ(n log n) implies O(n²)",
          "O(n) means the algorithm takes exactly n steps",
          "Amortized O(1) means each operation is O(1)",
        ],
        answer: 1,
        explanation: "Θ(n log n) is O(n log n), and anything O(n log n) is also O(n²) because O is only an upper bound.",
      },
    ],
  },
  // ---------------------------------------------------------------- number-systems
  {
    slug: "number-systems",
    track: "dsa",
    title: "Number systems: binary, hex and two's complement",
    summary:
      "How integers are written in base 2 and base 16, how negative numbers are stored with two's complement, and how JavaScript's bitwise operators work on 32-bit integers.",
    level: "beginner",
    frequency: "medium",
    minutes: 25,
    kinds: ["theory", "coding", "quiz"],
    status: "authored",
    prerequisites: [],
    related: ["dsa/complexity", "dsa/hash-tables", "javascript/data-types"],
    tags: ["binary", "hexadecimal", "twos-complement", "bitwise", "bit-manipulation"],
    sources: [mdnBitwise, clrs, notes100x],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Convert between decimal, binary and hexadecimal by hand and in JS",
              "Explain two's complement and why it makes addition hardware simple",
              "Predict the result of JS bitwise operators, which work on 32-bit signed integers",
              "Use classic bit tricks: power-of-two check, clearing the lowest set bit, masks",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Decimal has ten digits because we have ten fingers; computers have two-state switches, so they count in base 2. Each binary position is worth double the one to its right: `1011` = 8 + 0 + 2 + 1 = 11.",
          },
          {
            type: "p",
            text: "Hexadecimal (base 16) is shorthand for binary: one hex digit is exactly four bits, so `0xFF` is `1111 1111`. That is why memory addresses, colours (`#ff8800`) and hashes are printed in hex.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "In base `b`, digit dₖ at position k contributes dₖ·bᵏ. A **bit** is one binary digit, a **byte** is 8 bits, and an n-bit unsigned integer ranges from 0 to 2ⁿ − 1.",
          },
          {
            type: "p",
            text: "**Two's complement** stores a signed n-bit integer so that the top bit has weight −2ⁿ⁻¹ instead of +2ⁿ⁻¹. For 8 bits the range is −128 to 127, and `11111111` means −128 + 127 = −1. To negate a number: invert every bit, then add 1 (`-x === ~x + 1`).",
          },
          {
            type: "table",
            head: ["8-bit pattern", "Unsigned", "Two's complement"],
            rows: [
              ["`0000 0101`", "5", "5"],
              ["`0111 1111`", "127", "127"],
              ["`1000 0000`", "128", "−128"],
              ["`1111 1011`", "251", "−5"],
              ["`1111 1111`", "255", "−1"],
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
              "The same adder circuit handles signed and unsigned addition — no special case for negatives, and only one representation of zero",
              "Overflow behaviour (e.g. 127 + 1 = −128 in 8 bits) explains real bugs in fixed-width languages",
              "Bit masks pack many booleans into one integer: permissions, feature flags, Bloom filters, hash table sizing",
              "Interview problems: single number (XOR), counting bits, power of two, subsets via bitmasks",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "How JavaScript does it",
        blocks: [
          {
            type: "p",
            text: "JS `number` is a 64-bit IEEE-754 double. Bitwise operators first convert their operands with the spec's `ToInt32` (or `ToUint32` for `>>>`): truncate to an integer, wrap modulo 2³², and reinterpret as signed 32-bit. The result is converted back to a double.",
          },
          {
            type: "table",
            head: ["Operator", "Meaning", "Example"],
            rows: [
              ["`&`", "AND — 1 where both are 1", "`5 & 3` → 1"],
              ["`|`", "OR — 1 where either is 1", "`5 | 3` → 7"],
              ["`^`", "XOR — 1 where they differ", "`5 ^ 3` → 6"],
              ["`~`", "NOT — invert all 32 bits", "`~5` → −6"],
              ["`<<`", "shift left, fill with 0", "`1 << 4` → 16"],
              ["`>>`", "arithmetic shift right (copies sign bit)", "`-8 >> 1` → −4"],
              ["`>>>`", "logical shift right (fills with 0), result unsigned", "`-8 >>> 1` → 2147483644"],
            ],
          },
          {
            type: "callout",
            tone: "warning",
            title: "Beyond 32 bits",
            text: "Integers are exact as doubles only up to `Number.MAX_SAFE_INTEGER` (2⁵³ − 1), and bitwise ops silently wrap anything outside 32 bits (`2 ** 31 | 0` is −2147483648). Use `BigInt` (`1n << 40n`) for larger bit manipulation.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: −5 in 8 bits",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Write +5", detail: "`0000 0101`" },
              { title: "Invert every bit", detail: "`1111 1010` (this is −6, which is why `~5 === -6`)" },
              { title: "Add 1", detail: "`1111 1011` = −5" },
              { title: "Check by adding 5", detail: "`1111 1011 + 0000 0101 = 1 0000 0000`; the carry out of bit 7 is discarded, leaving 0." },
            ],
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "js",
            runnable: true,
            code: `console.log((10).toString(2), (255).toString(16), parseInt("ff", 16));
console.log(0b1010, 0xff, 0o17);
console.log(~5, -1 >>> 0);
console.log((-5 >>> 0).toString(2));
console.log(2 ** 31 | 0, -8 >> 1, -8 >>> 1);
console.log(5 & 3, 5 | 3, 5 ^ 3, 1 << 4);

// x & (x - 1) clears the lowest set bit
const isPow2 = (x) => x > 0 && (x & (x - 1)) === 0;
console.log(isPow2(64), isPow2(96));

function popcount(x) { let c = 0; while (x !== 0) { x &= x - 1; c++; } return c; }
console.log(popcount(0b1011), popcount(-1));`,
            output: `1010 ff 255
10 255 15
-6 4294967295
11111111111111111111111111111011
-2147483648 -4 2147483644
1 7 6 16
true false
3 32`,
          },
          {
            type: "p",
            text: "`popcount(-1)` is 32 because `-1` is thirty-two 1-bits after `ToInt32`. The loop terminates because each `x &= x - 1` removes exactly one set bit.",
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Using `x | 0` or `~~x` to truncate numbers larger than 2³¹ — they wrap to negative values; use `Math.trunc`",
              "Forgetting operator precedence: `x & 1 === 0` parses as `x & (1 === 0)`; write `(x & 1) === 0`",
              "Expecting `>>` and `>>>` to agree on negative numbers",
              "`(-5).toString(2)` gives `\"-101\"`, not the two's-complement bits; use `(-5 >>> 0).toString(2)`",
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
              { title: "Bit tricks", points: ["Compact and fast", "Great for flags and masks", "Easy to get wrong; hurt readability"] },
              { title: "Plain arithmetic / booleans", points: ["Readable", "No 32-bit wrapping surprises", "More memory for many flags"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Binary is base 2, hex is base 16 and each hex digit maps to 4 bits. Signed integers use two's complement: the top bit has negative weight, negation is invert-and-add-one, and one adder works for both signs. In JS, bitwise operators convert to 32-bit signed integers, so results wrap outside that range; `>>>` is the only operator that yields an unsigned result.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "XOR tricks: `a ^ a = 0` and `a ^ 0 = a`, so XOR-ing all elements finds the one unpaired number in O(n) time, O(1) space",
              "Subsets via bitmask: for n ≤ ~20, loop `mask` from 0 to 2ⁿ − 1 and include item i when `mask & (1 << i)`",
              "Hash tables often use power-of-two capacities so `hash & (cap - 1)` replaces a slower `%`",
              "Overflow: in C/Go fixed-width ints wrap (Go defines wrapping; signed overflow is undefined behaviour in C)",
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
              "Position value = digit × baseᵏ; 1 hex digit = 4 bits",
              "Two's complement: top bit is −2ⁿ⁻¹; `-x = ~x + 1`",
              "JS bitwise ops work on 32-bit ints; use BigInt beyond that",
              "`x & (x - 1)` clears the lowest set bit",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Bit", definition: "A single binary digit, 0 or 1." },
      { term: "Byte", definition: "8 bits; can represent 256 values." },
      { term: "Hexadecimal", definition: "Base-16 notation using digits 0–9 and a–f; one hex digit is 4 bits." },
      { term: "Two's complement", definition: "Signed integer encoding in which the most significant bit has weight −2ⁿ⁻¹; negation is bitwise NOT plus one." },
      { term: "Mask", definition: "An integer whose set bits select which bits of another integer to read, set or clear." },
      { term: "ToInt32", definition: "The ECMAScript abstract operation that converts a number to a signed 32-bit integer before bitwise operations." },
    ],
    followUps: [
      { q: "Why not store negatives as a sign bit plus magnitude?", a: "Sign-magnitude has two zeros (+0 and −0) and needs separate circuitry for subtraction. Two's complement has one zero and plain binary addition just works." },
      { q: "How do you check if the i-th bit is set?", a: "`(x >> i) & 1` or `(x & (1 << i)) !== 0`." },
      { q: "What does `0.1 + 0.2 === 0.3` return and why?", a: "`false`: 0.1 and 0.2 have no exact binary fraction representation, so the double result is 0.30000000000000004." },
    ],
    quiz: [
      {
        id: "number-systems-q1",
        prompt: "What is the 8-bit two's-complement representation of −1?",
        options: ["`1000 0001`", "`1111 1110`", "`1111 1111`", "`0111 1111`"],
        answer: 2,
        explanation: "Invert 0000 0001 → 1111 1110, add 1 → 1111 1111.",
      },
      {
        id: "number-systems-q2",
        prompt: "What does this log?",
        code: { lang: "js", code: "console.log(~~3.7, ~~-3.7, (2 ** 32 + 5) | 0);" },
        options: ["3 -3 5", "4 -4 5", "3 -4 4294967301", "3 -3 4294967301"],
        answer: 0,
        explanation: "`~~` truncates towards zero via ToInt32; 2³² + 5 wraps modulo 2³² to 5.",
      },
    ],
  },
  // ---------------------------------------------------------------- arrays-strings
  {
    slug: "arrays-strings",
    track: "dsa",
    title: "Arrays and strings",
    summary:
      "Contiguous storage gives O(1) indexing and fast scans but O(n) inserts in the middle; strings are immutable sequences of UTF-16 code units in JavaScript.",
    level: "beginner",
    frequency: "very-high",
    minutes: 25,
    kinds: ["theory", "coding", "quiz"],
    status: "authored",
    prerequisites: ["dsa/complexity"],
    related: ["dsa/linked-lists", "dsa/two-pointers-sliding-window", "dsa/hash-tables", "javascript/data-types"],
    tags: ["array", "string", "contiguous-memory", "unicode", "immutability"],
    sources: [mit6006, bigo, { label: "MDN — Array", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array", kind: "docs" }, { label: "MDN — String (UTF-16 characters, code points)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#utf-16_characters_unicode_code_points_and_grapheme_clusters", kind: "docs" }, notes100x],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain why array indexing is O(1) (address arithmetic on contiguous memory)",
              "Know the cost of push/pop vs shift/unshift/splice",
              "Explain string immutability and its cost when building strings",
              "Handle Unicode correctly: `length` counts UTF-16 code units, not characters",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "An array is a row of numbered lockers of equal width. To find locker 500 you don't walk past 499 others — you compute its position: `start + 500 × width`. Inserting a new locker at the front, though, means shifting every other locker over by one.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "An **array** stores elements in one contiguous block of memory, so element i lives at `base + i × elementSize`. A **string** is a sequence of characters; in JavaScript it is an immutable sequence of 16-bit UTF-16 code units.",
          },
          {
            type: "table",
            head: ["Operation", "Cost", "Why"],
            rows: [
              ["`a[i]` read/write", "O(1)", "address arithmetic"],
              ["`push` / `pop` (end)", "O(1) amortized", "spare capacity; occasional resize"],
              ["`unshift` / `shift` (front)", "O(n)", "every element moves one slot"],
              ["`splice` in the middle", "O(n)", "elements after the index move"],
              ["search unsorted (`includes`)", "O(n)", "linear scan"],
              ["search sorted (binary search)", "O(log n)", "halve each step"],
              ["`slice` / spread / `concat`", "O(k)", "copies k elements"],
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "Arrays are the default container because CPUs love them: sequential scans hit the cache and the hardware prefetcher, so a linear pass over an array is often faster than \"better\" pointer-based structures. Most interview problems start with an array or string.",
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "JS arrays are objects; engines make them fast",
            text: "The spec defines arrays as objects with integer-like keys and a magic `length`. V8 tracks an internal *elements kind* (e.g. packed small integers, packed doubles, packed generic, holey) and stores dense arrays in a contiguous backing store. Creating holes (`a[1000] = x` on a short array) or mixing types can move an array to a slower representation or even a dictionary mode. These are V8 implementation details, not language guarantees.",
          },
          {
            type: "p",
            text: "Strings cannot be mutated: `s[0] = \"j\"` is silently ignored in sloppy mode and throws a `TypeError` in strict mode. Every \"change\" creates a new string. Engines optimise concatenation with rope-like representations, but `parts.push(...)` then `parts.join(\"\")` is the portable linear-time way to build big strings.",
          },
          {
            type: "p",
            text: "Characters outside the Basic Multilingual Plane (emoji, many CJK extensions) take two code units — a *surrogate pair*. `\"😀\".length` is 2. Iterating with `for…of` or spreading `[...s]` walks code points instead.",
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "js",
            runnable: true,
            code: `const s = "hello";
console.log(s, s.toUpperCase(), s);   // toUpperCase returns a new string
console.log("😀".length, [..."😀"].length);
console.log([..."stressed"].reverse().join(""));

// Frequency counting: O(n) anagram check
function isAnagram(a, b) {
  if (a.length !== b.length) return false;
  const count = new Map();
  for (const ch of a) count.set(ch, (count.get(ch) ?? 0) + 1);
  for (const ch of b) {
    const c = count.get(ch);
    if (!c) return false;
    count.set(ch, c - 1);
  }
  return true;
}
console.log(isAnagram("listen", "silent"), isAnagram("rat", "car"));

const a = [1, 2, 3];
a[10] = 4;                // creates holes at 3..9
console.log(a.length, a[5]);`,
            output: `hello HELLO hello
2 1
desserts
true false
11 undefined`,
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Using `shift()` in a loop as a queue — O(n) each call on large arrays (see stacks and queues)",
              "Default `sort()` compares as strings: `[10, 9, 1].sort()` → `[1, 10, 9]`; pass `(a, b) => a - b`",
              "Reversing a string with `split(\"\")` breaks emoji into lone surrogates; use `[...s]`",
              "Building a string with `+=` in a hot loop in older engines, or with `concat` on huge inputs",
              "Off-by-one errors with inclusive/exclusive bounds — `slice(start, end)` excludes `end`",
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
              { title: "Array", points: ["O(1) indexing", "Cache-friendly scans", "O(n) insert/delete at front or middle"] },
              { title: "Linked list", points: ["O(1) insert/delete at a known node", "O(n) indexing", "Pointer chasing, poor locality"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Arrays store elements contiguously, so index access is O(1) by address arithmetic and appending is amortized O(1), while inserting or removing at the front or middle is O(n) because elements shift. JS strings are immutable UTF-16 sequences: every modification makes a new string, and `length` counts code units, so an emoji has length 2.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Most array problems reduce to: hashing for lookups, sorting, two pointers, sliding window or prefix sums",
              "Prefix sums: precompute `pre[i+1] = pre[i] + a[i]` so any range sum is `pre[r+1] - pre[l]` in O(1)",
              "In-place algorithms (reverse, partition, dedupe sorted array) trade readability for O(1) space",
              "Mention locality: arrays of numbers stay in contiguous memory, arrays of objects store pointers",
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
              "Index O(1); end ops amortized O(1); front/middle ops O(n)",
              "Strings are immutable; build with arrays + join",
              "`length` counts UTF-16 code units",
              "Engine optimisations (elements kinds) depend on dense, homogeneous arrays",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Contiguous memory", definition: "Elements stored back-to-back in one block, so the address of any element can be computed directly." },
      { term: "UTF-16 code unit", definition: "A 16-bit value; JS strings are sequences of these. Some characters need two (a surrogate pair)." },
      { term: "Code point", definition: "A Unicode character number, e.g. U+1F600 for 😀." },
      { term: "Prefix sum", definition: "An array where entry i holds the sum of the first i elements, enabling O(1) range sums." },
      { term: "Holey array", definition: "An array with missing indices; engines may store these less efficiently." },
    ],
    followUps: [
      { q: "Why is `a.indexOf(x)` inside a loop dangerous?", a: "It is O(n) each time, so the loop becomes O(n²). Precompute a Map from value to index instead." },
      { q: "How would you reverse words in a sentence in place?", a: "Reverse the whole character array, then reverse each word; O(n) time and O(1) extra space in languages with mutable strings (in JS you work on an array of characters)." },
    ],
    quiz: [
      {
        id: "arrays-strings-q1",
        prompt: "Which operation on a large JS array is typically O(n)?",
        options: ["`a.push(x)`", "`a.pop()`", "`a.unshift(x)`", "`a[42]`"],
        answer: 2,
        explanation: "`unshift` inserts at index 0, so every existing element must move up one slot.",
      },
      {
        id: "arrays-strings-q2",
        prompt: "What does `[10, 9, 1].sort()` return?",
        options: ["`[1, 9, 10]`", "`[1, 10, 9]`", "`[10, 9, 1]`", "`[9, 10, 1]`"],
        answer: 1,
        explanation: "Without a comparator, elements are compared as strings: \"1\" < \"10\" < \"9\".",
      },
    ],
  },
  // ---------------------------------------------------------------- linked-lists
  {
    slug: "linked-lists",
    track: "dsa",
    title: "Linked lists",
    summary:
      "Nodes connected by pointers: O(1) insertion and removal at a known position, O(n) access by index. Learn singly vs doubly linked lists, sentinels, reversal and the fast/slow pointer technique.",
    level: "beginner",
    frequency: "high",
    minutes: 35,
    kinds: ["theory", "coding", "quiz"],
    status: "authored",
    prerequisites: ["dsa/complexity", "dsa/arrays-strings"],
    related: ["dsa/stacks-queues", "dsa/hash-tables", "dsa/two-pointers-sliding-window", "javascript/deep-copy"],
    tags: ["linked-list", "pointers", "doubly-linked-list", "fast-slow-pointers", "lru"],
    sources: [mit6006, clrs, bigo, notes100x],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Implement a singly linked list with head and tail pointers",
              "Reverse a list iteratively and explain each pointer move",
              "Use fast/slow pointers to find the middle and detect cycles",
              "Explain when a doubly linked list and sentinel nodes are worth it (e.g. LRU cache)",
              "Compare linked lists with arrays honestly, including cache locality",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A linked list is a treasure hunt: each clue tells you where the next clue is. Inserting a new clue between two others only means rewriting one note — nothing else moves. But to reach the 50th clue you have to follow the first 49.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "A **linked list** is a sequence of **nodes**, each holding a value and a reference (`next`) to the following node. The list is identified by its **head**; the last node's `next` is `null`. A **doubly linked list** also stores `prev`, allowing O(1) removal of a node you already hold and backwards traversal.",
          },
          {
            type: "flow",
            nodes: ["head → [1 | next]", "[2 | next]", "[3 | next]", "null"],
            caption: "Conceptual singly linked list; nodes may live anywhere in memory.",
          },
          {
            type: "table",
            head: ["Operation", "Singly (head + tail)", "Doubly", "Array"],
            rows: [
              ["Access i-th element", "O(n)", "O(n)", "O(1)"],
              ["Insert/remove at head", "O(1)", "O(1)", "O(n)"],
              ["Append at tail", "O(1)", "O(1)", "O(1) amortized"],
              ["Remove tail", "O(n) (need predecessor)", "O(1)", "O(1)"],
              ["Remove a node you hold", "O(n) (need predecessor)", "O(1)", "O(n)"],
              ["Search by value", "O(n)", "O(n)", "O(n)"],
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
              "Constant-time splicing: LRU caches, free lists in allocators, OS run queues and the kernel's intrusive lists",
              "No reallocation or copying when the list grows",
              "Pointer manipulation is the most common way interviewers test careful, bug-free coding",
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "p",
            text: "In JavaScript a node is just an object; `next` holds a reference to another heap object. Nodes are allocated separately, so following `next` is a pointer chase that may miss the CPU cache — the main reason arrays usually win for iteration-heavy work.",
          },
          {
            type: "p",
            text: "**Sentinel (dummy) nodes** remove edge cases. A doubly linked list with permanent `head` and `tail` sentinels never has a null neighbour, so insert and unlink are four pointer assignments with no `if` statements. This is exactly how an O(1) LRU cache is usually written.",
          },
          {
            type: "code",
            lang: "js",
            caption: "Doubly linked list with sentinels — the core of an LRU cache.",
            code: `class DList {
  constructor() {
    this.head = { prev: null, next: null };   // sentinel
    this.tail = { prev: this.head, next: null }; // sentinel
    this.head.next = this.tail;
  }
  addFront(node) {          // O(1)
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }
  unlink(node) {            // O(1) — no search, we already hold the node
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }
  popBack() {               // least recently used
    const node = this.tail.prev;
    if (node === this.head) return null;
    this.unlink(node);
    return node;
  }
}`,
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: reversing a list",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Start", detail: "`prev = null`, `cur = 1`. List: 1 → 2 → 3 → null." },
              { title: "Save next", detail: "`next = 2` so we don't lose the rest of the list." },
              { title: "Flip", detail: "`1.next = prev (null)`. Now 1 points backwards." },
              { title: "Advance", detail: "`prev = 1`, `cur = 2`. Repeat: 2.next = 1, then 3.next = 2." },
              { title: "Finish", detail: "`cur` becomes null; `prev` (3) is the new head: 3 → 2 → 1 → null. O(n) time, O(1) space." },
            ],
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "js",
            runnable: true,
            code: `class Node {
  constructor(value, next = null) { this.value = value; this.next = next; }
}

class LinkedList {
  constructor() { this.head = null; this.tail = null; this.size = 0; }
  prepend(value) {                       // O(1)
    this.head = new Node(value, this.head);
    if (!this.tail) this.tail = this.head;
    this.size++;
  }
  append(value) {                        // O(1) thanks to the tail pointer
    const node = new Node(value);
    if (this.tail) this.tail.next = node; else this.head = node;
    this.tail = node;
    this.size++;
  }
  remove(value) {                        // O(n): must find the predecessor
    let prev = null, cur = this.head;
    while (cur && cur.value !== value) { prev = cur; cur = cur.next; }
    if (!cur) return false;
    if (prev) prev.next = cur.next; else this.head = cur.next;
    if (cur === this.tail) this.tail = prev;
    this.size--;
    return true;
  }
  toArray() {
    const out = [];
    for (let n = this.head; n; n = n.next) out.push(n.value);
    return out;
  }
}

function reverse(head) {
  let prev = null, cur = head;
  while (cur) {
    const next = cur.next;   // 1. remember the rest
    cur.next = prev;         // 2. flip the pointer
    prev = cur;              // 3. advance prev
    cur = next;              // 4. advance cur
  }
  return prev;               // new head
}

const list = new LinkedList();
list.append(2); list.append(3); list.prepend(1); list.append(4);
console.log(list.toArray().join(" -> "), "| size", list.size);
list.remove(3);
console.log(list.toArray().join(" -> "), "| tail", list.tail.value);
list.head = reverse(list.head);   // note: list.tail is now stale — fix it in real code
console.log(list.toArray().join(" -> "));`,
            output: `1 -> 2 -> 3 -> 4 | size 4
1 -> 2 -> 4 | tail 4
4 -> 2 -> 1`,
          },
          {
            type: "code",
            lang: "js",
            runnable: true,
            caption: "Fast/slow pointers: middle node and Floyd's cycle detection.",
            code: `function middle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) { slow = slow.next; fast = fast.next.next; }
  return slow;
}
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next; fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}
const fromArray = (arr) => arr.reduceRight((next, value) => ({ value, next }), null);
const a = fromArray([1, 2, 3, 4, 5]);
console.log(middle(a).value, hasCycle(a));
a.next.next.next.next.next = a.next; // 5 -> 2 creates a cycle
console.log(hasCycle(a));`,
            output: `3 false
true`,
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "Empty list (`head === null`) and single-node list — test both for every operation",
              "Removing the head or the tail: update `head`/`tail` pointers too",
              "Cycles: naive traversal loops forever; use Floyd's algorithm or a visited `Set`",
              "Even-length lists: decide which \"middle\" you want (the loop above returns the second of the two)",
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
              "Overwriting `cur.next` before saving it — the rest of the list is lost (and garbage collected)",
              "Forgetting to update `size` or `tail` after a removal",
              "Claiming linked lists are faster than arrays in general — for scans and indexing they are usually slower",
              "Calling a JS array \"a linked list\" — it is a dynamic array",
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
              { title: "Singly linked", points: ["One pointer per node", "Cheap head operations", "Can't remove a node without its predecessor"] },
              { title: "Doubly linked", points: ["Two pointers per node (more memory)", "O(1) unlink of a known node", "Backwards traversal; ideal for LRU"] },
              { title: "Dynamic array", points: ["Best locality and indexing", "Amortized O(1) append", "O(n) insert/remove away from the end"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "A linked list stores values in nodes connected by `next` (and `prev` in a doubly linked list). Insertion and removal are O(1) once you hold the right node, but finding a node by index or value is O(n), and nodes scattered in memory make traversal cache-unfriendly. Classic techniques are iterative reversal with three pointers, fast/slow pointers for the middle and cycle detection, and sentinel nodes to avoid null checks.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "LRU cache: a hash map gives O(1) lookup of the node, the doubly linked list gives O(1) move-to-front and evict-from-back",
              "Floyd's algorithm: if there is a cycle, fast gains one step per iteration on slow inside the loop, so they must meet; resetting one pointer to head and moving both by one finds the cycle start",
              "Merge two sorted lists with a dummy head in O(m + n); merge sort on a linked list is O(n log n) without random access",
              "Recursive reversal is elegant but uses O(n) stack — iterative is safer for long lists",
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
              "Nodes + pointers; head identifies the list",
              "O(1) splice at a known node, O(n) access",
              "Save `next` before rewiring",
              "Fast/slow pointers: middle and cycles",
              "Sentinels + doubly linked list = O(1) LRU",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Node", definition: "An object holding a value and references to neighbouring nodes." },
      { term: "Head / tail", definition: "The first and last nodes of a list." },
      { term: "Sentinel node", definition: "A dummy node that holds no data and exists only so every real node has non-null neighbours." },
      { term: "Floyd's cycle detection", definition: "Tortoise-and-hare algorithm: a slow and a fast pointer meet if and only if the list has a cycle." },
      { term: "Cache locality", definition: "How close in memory successive accesses are; better locality means fewer slow trips to RAM." },
    ],
    followUps: [
      { q: "How do you delete a node in a singly linked list given only that node?", a: "Copy the next node's value into it and unlink the next node. It fails for the tail node, which is why the trick is considered a hack." },
      { q: "How do you find the k-th node from the end in one pass?", a: "Advance a lead pointer k steps, then move lead and trail together until lead hits null; trail is the answer." },
      { q: "Why does an LRU cache need a doubly linked list rather than a singly linked one?", a: "To remove an arbitrary node in O(1) you need its predecessor; `prev` gives it to you without a search." },
    ],
    quiz: [
      {
        id: "linked-lists-q1",
        prompt: "In a singly linked list with head and tail pointers, which operation is O(n)?",
        options: ["Insert at head", "Append at tail", "Remove the tail", "Remove the head"],
        answer: 2,
        explanation: "Removing the tail requires setting the new tail's `next` to null, and finding that predecessor means walking from the head.",
      },
      {
        id: "linked-lists-q2",
        prompt: "During iterative reversal, what must you do before setting `cur.next = prev`?",
        options: ["Set `prev = cur`", "Save `cur.next` in a temporary", "Set `head = cur`", "Nothing"],
        answer: 1,
        explanation: "Overwriting `cur.next` first loses the only reference to the remainder of the list.",
      },
      {
        id: "linked-lists-q3",
        prompt: "Why are linked lists often slower than arrays for a full traversal even though both are O(n)?",
        options: ["Linked lists have more elements", "Pointer chasing causes cache misses", "Arrays are O(log n) to traverse", "JS optimises linked lists away"],
        answer: 1,
        explanation: "Array elements are contiguous and prefetched; list nodes can be scattered, so each step may wait on main memory.",
      },
    ],
  },
  // ---------------------------------------------------------------- stacks-queues
  {
    slug: "stacks-queues",
    track: "dsa",
    title: "Stacks and queues",
    summary:
      "LIFO and FIFO containers: implement a stack in JavaScript with an array and with a linked list, build a queue that is really O(1), and recognise the problems each one solves.",
    level: "beginner",
    frequency: "very-high",
    minutes: 30,
    kinds: ["theory", "coding", "quiz"],
    status: "authored",
    prerequisites: ["dsa/arrays-strings", "dsa/linked-lists"],
    related: ["dsa/graphs", "dsa/recursion", "dsa/trees", "javascript/call-stack", "javascript/event-loop"],
    tags: ["stack", "queue", "deque", "lifo", "fifo", "bfs", "monotonic-stack"],
    sources: [
      mit6006,
      clrs,
      { label: "MDN — Array.prototype.shift()", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/shift", kind: "docs" },
      { label: "ECMAScript spec — Array.prototype.shift", url: "https://tc39.es/ecma262/#sec-array.prototype.shift", kind: "docs" },
      notes100x,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Define the stack (LIFO) and queue (FIFO) abstract data types and their operations",
              "Implement a stack in JS backed by an array and by a linked list",
              "Explain why `Array.prototype.shift` is a poor queue and write an O(1) queue",
              "Recognise stack problems (matching, undo, DFS, monotonic stack) and queue problems (BFS, scheduling, buffering)",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A **stack** is a pile of plates: you add and remove from the top, so the last plate in is the first out. A **queue** is a line at a shop: people join at the back and are served from the front, so the first in is the first out.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["ADT", "Order", "Core operations (all should be O(1))"],
            rows: [
              ["Stack", "LIFO — last in, first out", "`push(x)`, `pop()`, `peek()`, `isEmpty()`"],
              ["Queue", "FIFO — first in, first out", "`enqueue(x)`, `dequeue()`, `peek()`, `isEmpty()`"],
              ["Deque", "both ends", "`pushFront`, `pushBack`, `popFront`, `popBack`"],
            ],
          },
          {
            type: "p",
            text: "These are **abstract data types**: they promise behaviour, not a layout. An array, a linked list or a ring buffer can all implement them — the choice only changes the constants and worst cases.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "Stacks model nesting: function calls (the call stack), brackets, undo history, expression parsing, depth-first search",
              "Queues model fairness and arrival order: breadth-first search, job queues, the event loop's task queues, network buffers",
              "Converting recursion to iteration means managing your own explicit stack",
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "p",
            text: "A JS array makes a great stack: `push` and `pop` operate on the end, which is amortized O(1). A linked-list stack pushes and pops at the head, which is worst-case O(1) with no resizing, at the cost of one object allocation per element.",
          },
          {
            type: "p",
            text: "Queues are trickier. `push` + `shift` looks like a queue, but `shift` removes index 0 and, per the spec, moves every remaining element down by one — O(n) per dequeue, O(n²) for a whole BFS.",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Is shift() really O(n)?",
            text: "The spec algorithm shifts each element. V8 can sometimes avoid the copy by \"left-trimming\" the array's backing store in place, which makes `shift` cheap for some arrays — but whether that applies depends on the array's size, elements kind and heap state, and other engines behave differently. Don't rely on it: write a queue with a head index, a linked list or a ring buffer.",
          },
          {
            type: "compare",
            items: [
              { title: "Head-index queue", points: ["Array + moving `head` pointer", "O(1) dequeue", "Needs periodic compaction to free memory"] },
              { title: "Linked-list queue", points: ["Head + tail pointers", "Worst-case O(1)", "One allocation per element"] },
              { title: "Ring buffer", points: ["Fixed array, wrap indices with modulo", "No allocation in steady state", "Must grow (copy) or reject when full"] },
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: balanced brackets with a stack",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Input `{[()]}`", detail: "Read `{`, `[`, `(` — each opener is pushed. Stack: `{ [ (`." },
              { title: "Read `)`", detail: "Pop → `(`; it matches. Stack: `{ [`." },
              { title: "Read `]` then `}`", detail: "Pop `[` and `{`; both match. Stack empty." },
              { title: "End", detail: "Empty stack at the end ⇒ balanced. A mismatch on pop, or leftovers at the end, ⇒ unbalanced." },
            ],
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "js",
            runnable: true,
            caption: "Two stack implementations with the same interface, plus a classic stack problem.",
            code: `// 1. Array-backed stack: push/pop at the END are amortized O(1)
class ArrayStack {
  #items = [];
  push(x) { this.#items.push(x); }
  pop() { return this.#items.pop(); }          // undefined when empty
  peek() { return this.#items[this.#items.length - 1]; }
  get size() { return this.#items.length; }
  isEmpty() { return this.#items.length === 0; }
}

// 2. Linked-list stack: push/pop at the HEAD are worst-case O(1)
class ListStack {
  #head = null; #size = 0;
  push(x) { this.#head = { value: x, next: this.#head }; this.#size++; }
  pop() {
    if (!this.#head) return undefined;
    const { value } = this.#head;
    this.#head = this.#head.next;
    this.#size--;
    return value;
  }
  peek() { return this.#head?.value; }
  get size() { return this.#size; }
  isEmpty() { return this.#size === 0; }
}

for (const S of [ArrayStack, ListStack]) {
  const s = new S();
  s.push("a"); s.push("b"); s.push("c");
  console.log(S.name, s.pop(), s.peek(), s.size);
}

function isBalanced(str) {
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const stack = [];
  for (const ch of str) {
    if (ch === "(" || ch === "[" || ch === "{") stack.push(ch);
    else if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false;
    }
  }
  return stack.length === 0;
}
console.log(isBalanced("{[()()]}"), isBalanced("([)]"), isBalanced("(("));`,
            output: `ArrayStack c b 2
ListStack c b 2
true false false`,
          },
          {
            type: "code",
            lang: "js",
            runnable: true,
            caption: "An O(1) queue using a head index, used for breadth-first search on a grid.",
            code: `class Queue {
  #items = []; #head = 0;
  enqueue(x) { this.#items.push(x); }
  dequeue() {
    if (this.#head === this.#items.length) return undefined;
    const x = this.#items[this.#head];
    this.#items[this.#head++] = undefined;   // let GC reclaim it
    // compact occasionally so memory doesn't grow forever
    if (this.#head > 1024 && this.#head * 2 > this.#items.length) {
      this.#items = this.#items.slice(this.#head);
      this.#head = 0;
    }
    return x;
  }
  get size() { return this.#items.length - this.#head; }
}

const q = new Queue();
q.enqueue(1); q.enqueue(2); q.enqueue(3);
console.log(q.dequeue(), q.dequeue(), q.size);

// BFS on a grid uses a queue: shortest steps from top-left to bottom-right
function shortestPath(grid) {
  const rows = grid.length, cols = grid[0].length;
  const dist = grid.map((row) => Array.from(row, () => -1));
  const queue = new Queue();
  queue.enqueue([0, 0]); dist[0][0] = 0;
  while (queue.size) {
    const [r, c] = queue.dequeue();
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      if (grid[nr][nc] === "#" || dist[nr][nc] !== -1) continue;
      dist[nr][nc] = dist[r][c] + 1;
      queue.enqueue([nr, nc]);
    }
  }
  return dist[rows - 1][cols - 1];
}
console.log(shortestPath(["..#", ".#.", "..."]));`,
            output: `1 2 1
4`,
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "Pop/dequeue on empty: decide between returning `undefined` and throwing; be consistent",
              "Using `0` or `\"\"` as values — check `size`, not truthiness of the popped value",
              "Unbounded queues under load grow until memory runs out; real systems bound them and apply backpressure",
              "Deep recursion converted to an explicit stack avoids `RangeError: Maximum call stack size exceeded`",
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
              "Using `shift()` / `unshift()` as queue operations on large arrays",
              "Pushing and popping at the *front* of an array for a stack — use the end",
              "Forgetting the final emptiness check in bracket matching (`\"((\"` would pass)",
              "Marking BFS nodes visited when dequeued instead of when enqueued, causing duplicates in the queue",
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
              { title: "Array stack", points: ["Simplest, fastest in practice", "Amortized O(1)", "Occasional resize spike"] },
              { title: "Linked-list stack", points: ["Worst-case O(1)", "Allocation and GC per element", "Worse cache locality"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "A stack is LIFO — push and pop at one end — and a queue is FIFO — enqueue at the back, dequeue at the front. In JavaScript an array with `push`/`pop` is already an O(1) amortized stack, or you can use a linked list with a head pointer for worst-case O(1). For a queue I avoid `shift`, which is O(n) per the spec; I use a head index, a linked list with head and tail, or a ring buffer.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Queue with two stacks: push to `in`; on dequeue, if `out` is empty pour all of `in` into `out`. Each element moves at most twice ⇒ amortized O(1)",
              "Min-stack: keep a parallel stack of running minimums so `getMin` is O(1)",
              "Monotonic stack: \"next greater element\" in O(n) — each index is pushed and popped once",
              "DFS uses a stack (explicit or the call stack); BFS uses a queue and finds shortest paths in unweighted graphs",
              "The JS event loop runs tasks from FIFO queues — a real-world queue you already use",
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
              "Stack = LIFO; queue = FIFO; deque = both ends",
              "Array `push`/`pop` is a fine stack",
              "Don't build queues on `shift`",
              "Stack ⇒ nesting, undo, DFS; queue ⇒ BFS, scheduling, buffering",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "LIFO", definition: "Last in, first out — the most recently added item is removed first." },
      { term: "FIFO", definition: "First in, first out — items leave in arrival order." },
      { term: "Abstract data type (ADT)", definition: "A type defined by its operations and their behaviour, independent of implementation." },
      { term: "Deque", definition: "Double-ended queue supporting insertion and removal at both ends." },
      { term: "Ring buffer", definition: "A fixed-size array used circularly with head and tail indices that wrap around." },
      { term: "Monotonic stack", definition: "A stack kept in increasing or decreasing order, used for next-greater/smaller problems." },
    ],
    followUps: [
      { q: "Implement a queue using two stacks — what is the complexity?", a: "Enqueue is O(1). Dequeue is O(n) in the worst case when transferring, but each element is transferred at most once, so it's O(1) amortized." },
      { q: "How would you implement a stack using queues?", a: "With one queue: after enqueuing x, rotate the previous size elements to the back so x is at the front. Push becomes O(n), pop O(1)." },
      { q: "Why does recursion sometimes crash where an explicit stack does not?", a: "The call stack has a fixed, fairly small size; an explicit stack lives on the heap and can grow much larger." },
    ],
    quiz: [
      {
        id: "stacks-queues-q1",
        prompt: "What does this log?",
        code: { lang: "js", code: `const s = [];\ns.push(1); s.push(2); s.push(3);\ns.pop();\ns.push(4);\nconsole.log(s.pop(), s.pop());` },
        options: ["3 2", "4 2", "4 3", "1 2"],
        answer: 1,
        explanation: "After popping 3 and pushing 4 the stack is [1, 2, 4]; pops return 4 then 2.",
      },
      {
        id: "stacks-queues-q2",
        prompt: "Which data structure does breadth-first search rely on?",
        options: ["Stack", "Queue", "Heap", "Hash set only"],
        answer: 1,
        explanation: "BFS processes nodes in the order discovered, level by level — FIFO.",
      },
      {
        id: "stacks-queues-q3",
        prompt: "Why is `while (q.length) q.shift()` a risky BFS queue in JavaScript?",
        options: ["shift returns the wrong element", "shift is O(n) per the spec, making BFS potentially O(n²)", "Arrays can't hold arrays", "shift mutates the original array"],
        answer: 1,
        explanation: "shift moves all remaining elements down. Some engines optimise it sometimes, but you can't rely on that.",
      },
    ],
  },
  // ---------------------------------------------------------------- hash-tables
  {
    slug: "hash-tables",
    track: "dsa",
    title: "Hash tables",
    summary:
      "How a hash function turns keys into array indexes for average O(1) lookup, how collisions are handled (chaining vs open addressing), why load factor and resizing matter, and how JS `Map` and plain objects compare.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 40,
    kinds: ["theory", "coding", "quiz"],
    status: "authored",
    prerequisites: ["dsa/arrays-strings", "dsa/complexity", "dsa/linked-lists"],
    related: ["dsa/number-systems", "dsa/two-pointers-sliding-window", "javascript/weakmap-weakset", "javascript/memoization", "system-design/caching-strategies", "system-design/sharding-partitioning"],
    tags: ["hash-table", "hashing", "collisions", "chaining", "open-addressing", "load-factor", "map"],
    sources: [mit6006, clrs, mdnMap, bigo, { label: "V8 blog — Optimizing hash tables: hiding the hash code", url: "https://v8.dev/blog/hash-code", kind: "docs" }, notes100x],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain how a hash function and a bucket array give average O(1) get/set/delete",
              "Compare collision strategies: separate chaining vs open addressing (linear probing)",
              "Explain load factor, resizing/rehashing and why the worst case is O(n)",
              "Choose between JS `Map`, plain objects, `Set` and `WeakMap`",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A cloakroom gives you a ticket number so the attendant can walk straight to hook 42 instead of searching every coat. A hash table does the same: it computes a number from the key and jumps straight to that slot in an array.",
          },
          {
            type: "p",
            text: "Occasionally two coats get the same number. The table needs a rule for that — hang both on the same hook (chaining) or try the next free hook (open addressing).",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "A **hash table** stores key–value pairs in an array of **buckets**. A **hash function** maps a key to an integer; `index = hash(key) mod capacity` picks the bucket. A **collision** happens when different keys map to the same bucket. The **load factor** α = entries / buckets measures how full the table is.",
          },
          {
            type: "table",
            head: ["Operation", "Average", "Worst case"],
            rows: [
              ["get / set / delete", "O(1)", "O(n) — every key collides"],
              ["iterate all entries", "O(n + capacity)", "O(n + capacity)"],
              ["resize (rehash)", "O(n), but amortized O(1) per insert", "O(n)"],
            ],
          },
          {
            type: "p",
            text: "A good hash function is **deterministic** (same key, same hash), **fast**, and **spreads keys uniformly** so buckets stay short. Keys that are equal must hash equally.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "The default tool for \"have I seen this?\", counting, grouping, deduplication and joins — it turns many O(n²) solutions into O(n)",
              "Caches, symbol tables, database hash indexes and hash joins, routing tables and sets are all built on it",
              "Consistent hashing (sharding, load balancers) extends the same idea across machines",
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "compare",
            items: [
              {
                title: "Separate chaining",
                points: [
                  "Each bucket holds a list of entries",
                  "Collisions just lengthen a list; α can exceed 1",
                  "Deletion is simple",
                  "Extra pointers; poorer cache locality",
                  "Java's HashMap converts long chains into balanced trees",
                ],
              },
              {
                title: "Open addressing (e.g. linear probing)",
                points: [
                  "All entries live in the array itself",
                  "On collision probe the next slot (i+1, i+2, …)",
                  "Excellent locality; must keep α well below 1 (often ≤ 0.5–0.75)",
                  "Deletion needs tombstones or backward-shift",
                  "Suffers from clustering as α grows",
                ],
              },
            ],
          },
          {
            type: "p",
            text: "**Resizing.** When α passes a threshold the table allocates a larger bucket array (typically 2×) and re-inserts every entry, because each index depends on the capacity. One resize is O(n), but doubling makes inserts amortized O(1) — the same argument as dynamic arrays.",
          },
          {
            type: "p",
            text: "**Why the worst case is O(n).** If many keys land in one bucket, lookups degrade to a linear scan. Attackers can exploit predictable hashes (\"hash flooding\" denial-of-service), which is why many runtimes use seeded or randomised hash functions such as SipHash.",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "JS Map and objects under the hood",
            text: "The spec only requires `Map` operations to be *sublinear on average* and iteration in insertion order. V8 implements `Map`/`Set` with a deterministic hash table (an ordered, chained design) and stores an object's hash code lazily. Plain objects are different: V8 uses hidden classes (shapes) for objects with a stable set of property names, and switches to a dictionary (hash table) mode when you add and delete many dynamic keys. These are V8 details, not guarantees.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: insert with chaining and a resize",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Hash", detail: "`hash(\"apple\")` produces a 32-bit integer." },
              { title: "Index", detail: "`index = hash % capacity` (capacity 4 initially) picks a bucket." },
              { title: "Scan the bucket", detail: "If an entry with an equal key exists, overwrite its value (size unchanged)." },
              { title: "Insert", detail: "Otherwise append `[key, value]` and increment size." },
              { title: "Check load factor", detail: "After the 4th insert, α = 4/4 = 1 > 0.75, so allocate 8 buckets and re-insert every entry at its new index." },
            ],
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "js",
            runnable: true,
            caption: "A minimal chained hash map with FNV-1a hashing and resizing at α > 0.75.",
            code: `// FNV-1a 32-bit string hash
function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

class HashMap {
  constructor(capacity = 4) {
    this.buckets = Array.from({ length: capacity }, () => []);
    this.size = 0;
  }
  #index(key) { return hash(key) % this.buckets.length; }
  set(key, value) {
    const bucket = this.buckets[this.#index(key)];
    const entry = bucket.find((e) => e[0] === key);
    if (entry) { entry[1] = value; return; }       // update
    bucket.push([key, value]);
    this.size++;
    if (this.size / this.buckets.length > 0.75) this.#resize();
  }
  get(key) {
    const entry = this.buckets[this.#index(key)].find((e) => e[0] === key);
    return entry?.[1];
  }
  delete(key) {
    const bucket = this.buckets[this.#index(key)];
    const i = bucket.findIndex((e) => e[0] === key);
    if (i === -1) return false;
    bucket.splice(i, 1);
    this.size--;
    return true;
  }
  #resize() {
    const old = this.buckets;
    this.buckets = Array.from({ length: old.length * 2 }, () => []);
    for (const bucket of old) for (const [k, v] of bucket) this.buckets[this.#index(k)].push([k, v]);
    console.log("resized to", this.buckets.length);
  }
}

const m = new HashMap();
for (const w of ["apple", "banana", "cherry", "date", "elder"]) m.set(w, w.length);
m.set("apple", 99);
console.log(m.get("apple"), m.get("date"), m.get("fig"), m.size);
console.log(m.delete("banana"), m.get("banana"), m.size);`,
            output: `resized to 8
99 4 undefined 5
true undefined 4`,
          },
          {
            type: "code",
            lang: "js",
            runnable: true,
            caption: "Map vs plain object: key types and ordering.",
            code: `const obj = {};
obj["2"] = "two"; obj.b = "b"; obj[1] = "one"; obj.a = "a";
console.log(Object.keys(obj).join(","));   // integer-like keys first, ascending

const map = new Map();
map.set("2", "two").set("b", "b").set(1, "one").set("a", "a");
console.log([...map.keys()].join(","), map.size);   // pure insertion order

const k1 = { id: 1 };
map.set(k1, "object key");
console.log(map.get(k1), map.get({ id: 1 }));   // keys compared by identity
console.log(map.has(1), map.has("1"));          // no string coercion`,
            output: `1,2,b,a
2,b,1,a 4
object key undefined
true false`,
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "Object keys are coerced to strings (`obj[1]` and `obj[\"1\"]` are the same key); `Map` keeps types",
              "`Map` compares keys with SameValueZero: `NaN` equals `NaN`, and `+0`/`-0` are the same key",
              "Objects as `Map` keys compare by reference — two equal-looking objects are different keys",
              "Plain objects inherit from `Object.prototype`: `\"toString\" in {}` is true; use `Object.create(null)` or `Map`",
              "Mutating a key's hashed fields after insertion (in languages with custom hashes) makes it unfindable",
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
              "Stating O(1) without \"average\" — the worst case is O(n)",
              "Using a plain object as a dictionary of user-supplied keys (prototype pollution risks, `__proto__` key)",
              "Assuming iteration order is random — JS `Map` and object orders are specified",
              "Forgetting that resizing must re-hash every key because indexes depend on capacity",
              "Using a `Map` cache keyed by objects that should be garbage collected — prefer `WeakMap`",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Need", "Choose", "Why"],
            rows: [
              ["Dynamic keys, frequent add/delete, non-string keys", "`Map`", "Designed for it; has `size`; insertion order"],
              ["Fixed, known fields (a record)", "plain object", "Engines optimise stable shapes; JSON-friendly"],
              ["Membership only", "`Set`", "No values to store"],
              ["Metadata attached to objects without leaking memory", "`WeakMap`", "Entries vanish when the key object is collected"],
              ["Ordered keys / range queries", "balanced BST or sorted array", "Hash tables have no useful order"],
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "A hash table hashes a key to an index in a bucket array, giving average O(1) insert, lookup and delete. Collisions are handled by chaining (a list per bucket) or open addressing (probing for another slot). When the load factor passes a threshold the table doubles and rehashes, which keeps operations amortized O(1); the worst case is O(n) if many keys collide. In JS I use `Map` for dynamic keys — any key type, insertion order and a `size` — and plain objects for fixed-shape records.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Expected chain length is α under simple uniform hashing, so keeping α constant via resizing keeps lookups O(1) on average",
              "Linear probing's expected probes grow sharply as α approaches 1 (≈ 1/(1−α)² for unsuccessful search), hence lower thresholds",
              "Power-of-two capacities allow `hash & (cap − 1)` instead of `%`, but then the hash's low bits must be well mixed",
              "Hash flooding: seeded hashes (SipHash) or tree-ified buckets bound the damage",
              "Distributed version: consistent hashing minimises remapping when nodes join or leave",
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
              "hash(key) mod capacity → bucket",
              "Collisions: chaining or open addressing",
              "Keep α bounded by doubling and rehashing ⇒ amortized O(1)",
              "Worst case O(n); seeded hashes defend against attacks",
              "JS: `Map` for dictionaries, objects for records, `WeakMap` for object metadata",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Hash function", definition: "A deterministic function mapping a key to an integer, ideally spreading keys uniformly." },
      { term: "Bucket", definition: "A slot in the hash table's underlying array." },
      { term: "Collision", definition: "Two different keys mapping to the same bucket." },
      { term: "Separate chaining", definition: "Collision strategy where each bucket stores a list of entries." },
      { term: "Open addressing", definition: "Collision strategy where entries are stored in the array itself and collisions probe other slots." },
      { term: "Load factor (α)", definition: "Number of entries divided by number of buckets." },
      { term: "Rehashing", definition: "Re-inserting all entries into a larger bucket array after resizing." },
      { term: "Tombstone", definition: "A marker left in an open-addressing slot after deletion so probe sequences are not broken." },
    ],
    followUps: [
      { q: "Why do hash tables resize by doubling rather than by a fixed amount?", a: "Multiplicative growth makes the total rehash work over n inserts O(n), so each insert is amortized O(1). Fixed increments make it O(n) per insert amortized." },
      { q: "How would you design a hash function for a pair of integers?", a: "Combine them so order matters and bits mix, e.g. `h = h1 * 31 + h2` or a proper mixer; avoid XOR alone because (a, b) and (b, a) would collide." },
      { q: "When is a hash table the wrong choice?", a: "When you need ordering or range queries (use a balanced tree or sorted structure), when memory is tight, or when strict worst-case latency matters." },
      { q: "What is the difference between Map and WeakMap?", a: "WeakMap keys must be objects (or non-registered symbols) and are held weakly, so entries disappear when keys are garbage collected; it is not iterable and has no size." },
    ],
    quiz: [
      {
        id: "hash-tables-q1",
        prompt: "A chained hash table has 1,000 entries in 500 buckets. What is the load factor and expected chain length?",
        options: ["0.5", "2", "500", "1,000"],
        answer: 1,
        explanation: "α = 1000 / 500 = 2, which is also the expected bucket length under uniform hashing.",
      },
      {
        id: "hash-tables-q2",
        prompt: "What does this log?",
        code: { lang: "js", code: `const o = {}; o[1] = "a"; o["1"] = "b";\nconst m = new Map(); m.set(1, "a"); m.set("1", "b");\nconsole.log(Object.keys(o).length, m.size);` },
        options: ["1 1", "2 2", "1 2", "2 1"],
        answer: 2,
        explanation: "Object keys are coerced to strings, so both writes hit key \"1\". Map distinguishes the number 1 from the string \"1\".",
      },
      {
        id: "hash-tables-q3",
        prompt: "Why must a hash table rehash every entry when it resizes?",
        options: ["To sort the keys", "Bucket index depends on capacity (hash mod capacity)", "Hash functions are random", "To remove tombstones only"],
        answer: 1,
        explanation: "Changing capacity changes `hash % capacity`, so entries must move to their new buckets.",
      },
    ],
  },
  // ---------------------------------------------------------------- outlines
  outline({
    slug: "recursion",
    title: "Recursion",
    summary: "Solving a problem by calling the same function on smaller inputs: base cases, the call stack, recursion trees for complexity, and converting recursion to iteration.",
    level: "beginner",
    frequency: "high",
    minutes: 30,
    prerequisites: ["dsa/complexity", "javascript/call-stack"],
    related: ["dsa/trees", "dsa/dynamic-programming", "dsa/stacks-queues", "javascript/tail-calls", "javascript/memoization"],
    tags: ["recursion", "base-case", "call-stack", "backtracking", "recurrence"],
    objectives: [
      "Write recursive functions with a correct base case and progress towards it",
      "Trace recursion on the call stack and compute its space cost (maximum depth)",
      "Derive complexity from a recursion tree and simple recurrences (e.g. T(n) = 2T(n/2) + n)",
      "Recognise backtracking (subsets, permutations) and convert recursion to an explicit stack",
      "Know that proper tail calls are in the spec but only Safari/JavaScriptCore ships them",
    ],
    covers: [
      "Base case vs recursive case; the leap of faith",
      "Call-stack frames and `RangeError: Maximum call stack size exceeded`",
      "Recursion trees and the master theorem at an intuitive level",
      "Backtracking template: choose → explore → un-choose",
      "Memoization as the bridge to dynamic programming",
      "Iterative rewrites with an explicit stack",
    ],
    sources: [mit6006, clrs, { label: "MDN — Recursion (glossary)", url: "https://developer.mozilla.org/en-US/docs/Glossary/Recursion", kind: "docs" }, notes100x],
  }),
  outline({
    slug: "trees",
    title: "Trees and binary search trees",
    summary: "Hierarchical data: binary trees, traversals (pre/in/post-order and level-order), binary search trees and why balancing keeps operations O(log n).",
    level: "intermediate",
    frequency: "very-high",
    minutes: 40,
    prerequisites: ["dsa/recursion", "dsa/stacks-queues"],
    related: ["dsa/heaps", "dsa/graphs", "system-design/database-indexes"],
    tags: ["tree", "binary-tree", "bst", "traversal", "balanced-tree", "b-tree"],
    objectives: [
      "Define root, leaf, height, depth and the properties of binary trees",
      "Implement DFS traversals recursively and iteratively, and BFS level-order with a queue",
      "Implement BST search, insert and delete, and explain O(h) cost",
      "Explain why balanced trees (AVL, red-black) and B-trees guarantee O(log n) height",
      "Solve classic problems: max depth, validate BST, lowest common ancestor",
    ],
    covers: [
      "Tree vocabulary and representations (node objects, arrays for complete trees)",
      "Pre-, in-, post-order and level-order traversals",
      "BST operations and the degenerate (linked-list-shaped) worst case",
      "Self-balancing trees at a conceptual level; B+ trees in database indexes",
      "Tries for prefix search",
    ],
    sources: [mit6006, clrs, bigo, notes100x],
  }),
  outline({
    slug: "heaps",
    title: "Heaps and priority queues",
    summary: "A binary heap stored in an array gives O(log n) insert and extract-min and O(1) peek — the standard priority queue behind top-k problems, schedulers and Dijkstra.",
    level: "intermediate",
    frequency: "high",
    minutes: 35,
    prerequisites: ["dsa/trees", "dsa/arrays-strings"],
    related: ["dsa/graphs", "dsa/sorting-searching", "dsa/complexity"],
    tags: ["heap", "priority-queue", "binary-heap", "top-k", "heapsort"],
    objectives: [
      "Explain the heap property and the array layout (children of i at 2i+1 and 2i+2)",
      "Implement sift-up and sift-down, push, pop and peek",
      "Show that building a heap from n items (heapify) is O(n)",
      "Apply heaps to top-k, k-way merge, running median and scheduling",
      "Know that JavaScript has no built-in priority queue",
    ],
    covers: [
      "Min-heap vs max-heap and the heap invariant",
      "Array representation of a complete binary tree",
      "Sift-up / sift-down mechanics and O(log n) bounds",
      "Bottom-up heapify in O(n); heapsort",
      "Patterns: top-k with a size-k heap, two heaps for the median",
    ],
    sources: [mit6006, clrs, bigo, notes100x],
  }),
  outline({
    slug: "graphs",
    title: "Graphs",
    summary: "Vertices and edges: adjacency lists vs matrices, BFS and DFS, topological sort, cycle detection, union-find and shortest paths with Dijkstra.",
    level: "intermediate",
    frequency: "high",
    minutes: 50,
    prerequisites: ["dsa/stacks-queues", "dsa/hash-tables", "dsa/recursion"],
    related: ["dsa/trees", "dsa/heaps", "system-design/service-discovery"],
    tags: ["graph", "bfs", "dfs", "topological-sort", "dijkstra", "union-find"],
    objectives: [
      "Represent graphs with adjacency lists and matrices and state their space costs",
      "Implement BFS (shortest path in unweighted graphs) and DFS (connectivity, cycles)",
      "Topologically sort a DAG with Kahn's algorithm or DFS post-order",
      "Use union-find (disjoint set union) for connectivity",
      "Run Dijkstra with a min-heap and explain why negative edges break it",
    ],
    covers: [
      "Directed/undirected, weighted/unweighted, DAGs; O(V + E) traversal",
      "Grids as implicit graphs",
      "Cycle detection with colouring (directed) and parent tracking (undirected)",
      "Topological sort for dependency resolution (build systems, package managers)",
      "Union-find with path compression and union by rank",
      "Dijkstra in O((V + E) log V); a note on Bellman-Ford",
    ],
    sources: [mit6006, clrs, bigo, notes100x],
  }),
  outline({
    slug: "sorting-searching",
    title: "Sorting and searching",
    summary: "Comparison sorts (merge, quick, heap, insertion), stability, the Ω(n log n) lower bound, counting/radix sort, and binary search including \"search on the answer\".",
    level: "intermediate",
    frequency: "high",
    minutes: 45,
    prerequisites: ["dsa/complexity", "dsa/recursion", "dsa/arrays-strings"],
    related: ["dsa/heaps", "dsa/two-pointers-sliding-window"],
    tags: ["sorting", "merge-sort", "quicksort", "binary-search", "stability"],
    objectives: [
      "Implement merge sort and quicksort and state their best/average/worst complexity and space",
      "Explain stability and why `Array.prototype.sort` is required to be stable since ES2019",
      "Explain the Ω(n log n) comparison lower bound and when counting/radix sort beat it",
      "Write bug-free binary search with clear loop invariants, including lower/upper bound variants",
      "Apply binary search on a monotonic answer space",
    ],
    covers: [
      "Insertion, merge, quick and heap sort compared",
      "Hybrid sorts in practice (V8 uses TimSort — an implementation detail)",
      "Default `sort()` string comparison pitfall and comparator contracts",
      "Binary search templates and off-by-one traps",
      "Quickselect for k-th smallest in average O(n)",
    ],
    sources: [mit6006, clrs, bigo, { label: "V8 blog — Getting things sorted in V8", url: "https://v8.dev/blog/array-sort", kind: "docs" }, { label: "MDN — Array.prototype.sort()", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort", kind: "docs" }, notes100x],
  }),
  outline({
    slug: "two-pointers-sliding-window",
    title: "Two pointers and sliding window",
    summary: "Linear-time patterns for arrays and strings: converging pointers on sorted data, fast/slow pointers, and fixed or variable-size windows maintained with counters.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 35,
    prerequisites: ["dsa/arrays-strings", "dsa/hash-tables"],
    related: ["dsa/linked-lists", "dsa/sorting-searching", "dsa/complexity"],
    tags: ["two-pointers", "sliding-window", "prefix-sum", "patterns"],
    objectives: [
      "Recognise when two pointers turn an O(n²) pair search into O(n)",
      "Apply converging pointers (pair sum in sorted array, container with most water, palindromes)",
      "Write fixed-size and variable-size sliding windows with a hash map of counts",
      "Argue the O(n) bound: each pointer only moves forward",
      "Know when a window fails (negative numbers in sum problems) and prefix sums are needed",
    ],
    covers: [
      "Converging, same-direction and fast/slow pointer variants",
      "Sliding window template: expand right, shrink left while invalid, record answer",
      "Longest substring without repeating characters, minimum window substring",
      "Prefix sums + hash map for subarray-sum-equals-k",
    ],
    sources: [mit6006, bigo, notes100x],
  }),
  outline({
    slug: "dynamic-programming",
    title: "Dynamic programming basics",
    summary: "Solving problems with overlapping subproblems and optimal substructure by caching results: memoization (top-down) vs tabulation (bottom-up), state design and space optimisation.",
    level: "advanced",
    frequency: "high",
    minutes: 50,
    prerequisites: ["dsa/recursion", "dsa/complexity", "javascript/memoization"],
    related: ["dsa/graphs", "dsa/sorting-searching"],
    tags: ["dynamic-programming", "memoization", "tabulation", "knapsack", "lcs"],
    objectives: [
      "Identify overlapping subproblems and optimal substructure",
      "Turn a recursive solution into memoized and tabulated versions",
      "Define DP state, transition, base cases and evaluation order explicitly",
      "Analyse DP complexity as (number of states) × (work per state)",
      "Reduce space by keeping only the rows you need",
    ],
    covers: [
      "Fibonacci and climbing stairs: exponential → linear",
      "1-D DP: house robber, coin change; 2-D DP: grid paths, LCS, edit distance",
      "0/1 knapsack and why iteration order matters",
      "Top-down vs bottom-up trade-offs (stack depth, computing only needed states)",
    ],
    sources: [mit6006, clrs, notes100x],
  }),
];

interface OutlineSpec {
  slug: string;
  title: string;
  summary: string;
  level: Lesson["level"];
  frequency: Lesson["frequency"];
  minutes: number;
  prerequisites: string[];
  related: string[];
  tags: string[];
  objectives: string[];
  covers: string[];
  sources: Lesson["sources"];
}

function outline(o: OutlineSpec): Lesson {
  return {
    slug: o.slug,
    track: "dsa",
    title: o.title,
    summary: o.summary,
    level: o.level,
    frequency: o.frequency,
    minutes: o.minutes,
    kinds: ["theory", "coding"],
    status: "outline",
    prerequisites: o.prerequisites,
    related: o.related,
    tags: o.tags,
    sources: o.sources,
    sections: [
      { id: "objectives", blocks: [{ type: "list", items: o.objectives }] },
      { id: "summary", title: "What this lesson will cover", blocks: [{ type: "list", items: o.covers }] },
    ],
  };
}
