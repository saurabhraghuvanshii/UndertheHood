"use client";
import { useState } from "react";
import { Check, Copy, Play } from "lucide-react";
import { runJs, type LogLine } from "@/lib/js-runner";

export function CodeFrame({ html, code, label, caption, expected, runnable }: { html: string; code: string; label: string; caption?: string; expected?: string; runnable: boolean }) {
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<LogLine[] | null>(null);
  const [running, setRunning] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };
  const run = async () => {
    setLogs([]);
    setRunning(true);
    const r = await runJs(code, (l) => setLogs((x) => [...(x ?? []), l]));
    setTimedOut(r.timedOut);
    setRunning(false);
  };
  const actual = logs?.map((l) => l.text).join("\n").trim();
  const matches = expected !== undefined && logs && !running ? actual === expected.trim() : undefined;

  return (
    <figure className="my-5 overflow-hidden rounded-lg border border-border bg-code">
      <figcaption className="flex items-center justify-between gap-2 border-b border-border px-3 py-1.5 text-xs text-muted">
        <span className="min-w-0 truncate">
          <span className="font-medium text-fg">{label}</span>
          {caption && <span className="ml-2">{caption}</span>}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {runnable && (
            <button onClick={run} disabled={running} className="inline-flex items-center gap-1 rounded px-2 py-0.5 font-medium text-accent hover:bg-accent-soft disabled:opacity-60" title="Executes for real in a Web Worker in your browser">
              <Play className="h-3 w-3" aria-hidden />
              {running ? "Running…" : "Run"}
            </button>
          )}
          <button onClick={copy} className="inline-flex items-center gap-1 rounded px-2 py-0.5 hover:bg-surface-3" aria-label="Copy code">
            {copied ? <Check className="h-3 w-3" aria-hidden /> : <Copy className="h-3 w-3" aria-hidden />}
            {copied ? "Copied" : "Copy"}
          </button>
        </span>
      </figcaption>
      <div className="overflow-x-auto px-4 py-3 text-[13px] leading-relaxed [&_pre]:!m-0 [&_pre]:font-mono" dangerouslySetInnerHTML={{ __html: html }} />
      {expected !== undefined && (
        <div className="border-t border-border px-4 py-2.5">
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-subtle">Expected output</div>
          <pre className="overflow-x-auto font-mono text-[13px] leading-relaxed text-fg">{expected}</pre>
        </div>
      )}
      {logs && (
        <div className="border-t border-border bg-surface px-4 py-2.5" role="status" aria-live="polite">
          <div className="mb-1 flex flex-wrap items-center gap-x-3 text-[11px] font-medium uppercase tracking-wider text-subtle">
            <span>Actual run · your browser’s JS engine (Web Worker)</span>
            {matches === true && <span className="normal-case tracking-normal text-ok">✓ matches expected</span>}
            {matches === false && <span className="normal-case tracking-normal text-warn">≠ differs from expected</span>}
          </div>
          <pre className="overflow-x-auto font-mono text-[13px] leading-relaxed">
            {logs.length === 0 && !running ? <span className="text-muted">(no console output)</span> : null}
            {logs.map((l, i) => (
              <span key={i} className={`block ${l.level === "error" ? "text-danger" : l.level === "warn" ? "text-warn" : "text-fg"}`}>{l.text}</span>
            ))}
          </pre>
          {timedOut && <p className="mt-1 text-xs text-muted">The worker is stopped after 2 s; timers scheduled later don’t run.</p>}
        </div>
      )}
    </figure>
  );
}
