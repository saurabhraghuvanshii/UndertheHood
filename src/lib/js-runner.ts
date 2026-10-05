"use client";
/**
 * Real JavaScript execution in a throwaway Web Worker.
 *
 * - Runs in this browser's own engine (V8 in Chrome/Edge, SpiderMonkey in Firefox,
 *   JavaScriptCore in Safari) — so engine-specific behaviour is genuine.
 * - Workers have no DOM, no `window`, no `require`; `fetch` is blocked.
 * - The worker is terminated after `timeoutMs`; timers scheduled beyond that never run.
 */
export type LogLine = { level: "log" | "info" | "warn" | "error"; text: string; t: number };

const PRELUDE = `
const __t0 = performance.now();
const __fmt = (v, seen = new WeakSet(), depth = 0) => {
  if (typeof v === "string") return depth ? JSON.stringify(v) : v;
  if (typeof v === "bigint") return v + "n";
  if (typeof v === "symbol" || typeof v === "undefined" || v === null || typeof v !== "object" && typeof v !== "function") return String(v);
  if (typeof v === "function") return v.name ? "[Function: " + v.name + "]" : "[Function (anonymous)]";
  if (seen.has(v)) return "[Circular]";
  seen.add(v);
  if (depth > 3) return Array.isArray(v) ? "[Array]" : "[Object]";
  if (v instanceof Error) return v.name + ": " + v.message;
  if (Array.isArray(v)) return "[ " + v.map((x) => __fmt(x, seen, depth + 1)).join(", ") + " ]";
  if (v instanceof Map) return "Map(" + v.size + ") { " + [...v].map(([k, x]) => __fmt(k, seen, depth + 1) + " => " + __fmt(x, seen, depth + 1)).join(", ") + " }";
  if (v instanceof Set) return "Set(" + v.size + ") { " + [...v].map((x) => __fmt(x, seen, depth + 1)).join(", ") + " }";
  if (v instanceof Promise) return "Promise { <opaque> }";
  const name = v.constructor && v.constructor !== Object ? v.constructor.name + " " : "";
  const keys = Object.keys(v);
  return name + "{ " + keys.map((k) => k + ": " + __fmt(v[k], seen, depth + 1)).join(", ") + (keys.length ? " }" : "}");
};
for (const level of ["log", "info", "warn", "error"]) {
  console[level] = (...args) => postMessage({ level, text: args.map((a) => __fmt(a)).join(" "), t: Math.round(performance.now() - __t0) });
}
self.fetch = () => Promise.reject(new Error("fetch is disabled in the sandbox"));
self.addEventListener("error", (e) => { postMessage({ level: "error", text: /^Uncaught/.test(e.message) ? e.message : "Uncaught " + e.message, t: Math.round(performance.now() - __t0) }); e.preventDefault(); });
self.addEventListener("unhandledrejection", (e) => { postMessage({ level: "error", text: "Uncaught (in promise) " + __fmt(e.reason), t: 0 }); e.preventDefault(); });
`;

export function runJs(code: string, onLog: (l: LogLine) => void, timeoutMs = 2000): Promise<{ timedOut: boolean }> {
  return new Promise((resolve) => {
    // Run as a classic (sloppy-mode) script like a plain <script>, unless the code
    // uses top-level await — then it must run as a module (strict mode, `this` undefined).
    const asModule = needsModule(code);
    const src = `${PRELUDE}\n${code}\n`;
    const url = URL.createObjectURL(new Blob([src], { type: "text/javascript" }));
    let worker: Worker;
    try {
      worker = new Worker(url, { type: asModule ? "module" : "classic" });
    } catch (e) {
      onLog({ level: "error", text: `Could not start worker: ${(e as Error).message}`, t: 0 });
      resolve({ timedOut: false });
      return;
    }
    worker.onmessage = (e) => onLog(e.data as LogLine);
    worker.onerror = (e) => {
      e.preventDefault();
      onLog({ level: "error", text: `SyntaxError or load error: ${e.message}`, t: 0 });
    };
    setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ timedOut: true });
    }, timeoutMs);
  });
}

function needsModule(code: string) {
  try {
    new Function(code); // compile only — never called
    return false;
  } catch (e) {
    return /await|import|export/.test(String((e as Error).message)) || /^\s*(import|export)\s/m.test(code);
  }
}
