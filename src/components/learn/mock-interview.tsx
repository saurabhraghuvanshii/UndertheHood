"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { actions, getState } from "@/lib/store";
import { effectiveStatus, questionKey } from "@/lib/progress";
import { today } from "@/lib/dates";
import type { Grade } from "@/lib/srs";
import type { FollowUp, Level } from "@/content/types";
import { Button } from "@/components/ui";
import { Paragraphs, Inline } from "@/components/content/inline";
import { cn } from "@/components/ui/cn";

interface Q { id: string; track: string; question: string; shortAnswer: string; followUps: FollowUp[]; level: Level; href: string }

const GRADES: { g: Grade; label: string; hint: string }[] = [
  { g: "again", label: "Couldn't answer", hint: "review tomorrow" },
  { g: "hard", label: "Shaky", hint: "shorter interval" },
  { g: "good", label: "Solid", hint: "normal interval" },
  { g: "easy", label: "Nailed it", hint: "longer interval" },
];

/** wall-clock helpers, only called from event handlers */
const now = () => Date.now();
const minutesSince = (t: number) => Math.max(1, Math.round((now() - t) / 60000));

function pick(pool: Q[], tracks: string[], n: number): Q[] {
  const t = today();
  const progress = getState().progress;
  const eligible = pool.filter((q) => tracks.includes(q.track));
  // weight: not mastered / interview-ready questions are 3x as likely
  const weighted = eligible.map((q) => {
    const s = effectiveStatus(progress[questionKey(q.id)], t, { hasQuiz: false });
    const w = s === "mastered" ? 1 : s === "interview-ready" ? 2 : 3;
    return { q, k: Math.random() ** (1 / w) };
  });
  return weighted.sort((a, b) => b.k - a.k).slice(0, n).map((x) => x.q);
}

export function MockInterview({ pool, tracks, initialTrack }: { pool: Q[]; tracks: { slug: string; title: string }[]; initialTrack?: string }) {
  const [selected, setSelected] = useState<string[]>(initialTrack ? [initialTrack] : tracks.slice(0, 1).map((t) => t.slug));
  const [count, setCount] = useState(5);
  const [perQ, setPerQ] = useState(3);
  const [session, setSession] = useState<Q[] | null>(null);
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [draft, setDraft] = useState("");
  const [left, setLeft] = useState(0);
  const [results, setResults] = useState<{ q: Q; grade: Grade }[]>([]);
  const [started, setStarted] = useState(0);
  const [elapsedMin, setElapsedMin] = useState(0);

  useEffect(() => {
    if (!session || revealed || i >= session.length) return;
    const id = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(id);
  }, [session, revealed, i]);

  const start = () => {
    const s = pick(pool, selected, count);
    setSession(s);
    setI(0);
    setResults([]);
    setRevealed(false);
    setDraft("");
    setLeft(perQ * 60);
    setStarted(now());
  };
  const grade = (g: Grade) => {
    const q = session![i];
    const key = questionKey(q.id);
    actions.addToRevision(key);
    actions.reviewItem(key, g);
    if (draft.trim()) actions.saveNote({ itemKey: key, kind: "answer", title: `Mock answer · ${today()}`, body: draft.trim(), tags: ["mock"], flagged: g === "again" || g === "hard" });
    setResults((r) => [...r, { q, grade: g }]);
    if (i + 1 >= session!.length) setElapsedMin(minutesSince(started));
    setI(i + 1);
    setRevealed(false);
    setDraft("");
    setLeft(perQ * 60);
  };

  if (!session) {
    return (
      <div className="max-w-2xl space-y-6 rounded-lg border border-border bg-surface p-5">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Question banks</legend>
          <div className="flex flex-wrap gap-2">
            {tracks.map((t) => {
              const on = selected.includes(t.slug);
              return (
                <button key={t.slug} aria-pressed={on} onClick={() => setSelected((s) => (on ? s.filter((x) => x !== t.slug) : [...s, t.slug]))} className={cn("rounded-full border px-3 py-1 text-sm", on ? "border-accent bg-accent text-accent-fg" : "border-border-strong hover:bg-surface-2")}>
                  {t.title}
                </button>
              );
            })}
          </div>
        </fieldset>
        <div className="flex flex-wrap gap-6">
          <label className="text-sm">Questions <select value={count} onChange={(e) => setCount(+e.target.value)} className="ml-2 rounded-md border border-border-strong bg-surface px-2 py-1">{[3, 5, 8, 10].map((n) => <option key={n}>{n}</option>)}</select></label>
          <label className="text-sm">Minutes per question <select value={perQ} onChange={(e) => setPerQ(+e.target.value)} className="ml-2 rounded-md border border-border-strong bg-surface px-2 py-1">{[2, 3, 5].map((n) => <option key={n}>{n}</option>)}</select></label>
        </div>
        <Button variant="primary" onClick={start} disabled={!selected.length}>Start</Button>
      </div>
    );
  }

  if (i >= session.length) {
    const mins = elapsedMin;
    return (
      <div className="max-w-2xl space-y-4">
        <h2 className="text-xl font-semibold">Session complete</h2>
        <p className="text-sm text-muted">{session.length} questions in about {mins} min. Each grade has scheduled the question’s next revision.</p>
        <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
          {results.map((r) => (
            <li key={r.q.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <Link href={r.q.href} className="min-w-0 flex-1 truncate hover:underline">{r.q.question}</Link>
              <span className={cn("text-xs font-medium", r.grade === "again" ? "text-danger" : r.grade === "hard" ? "text-warn" : "text-ok")}>{GRADES.find((g) => g.g === r.grade)!.label}</span>
            </li>
          ))}
        </ul>
        <div className="flex gap-2"><Button variant="primary" onClick={start}>Another round</Button><Button onClick={() => setSession(null)}>Change settings</Button></div>
      </div>
    );
  }

  const q = session[i];
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>Question {i + 1} of {session.length}</span>
        <span className={cn("font-mono text-base", left === 0 ? "text-danger" : left < 30 ? "text-warn" : "text-fg")} aria-live="off" role="timer">{mm}:{ss}{left === 0 && " — time’s up"}</span>
      </div>
      <h2 className="text-2xl font-semibold leading-snug">{q.question}</h2>
      <label className="block text-sm text-muted">
        Optional: jot your answer (saved to your notes when you grade)
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={5} className="mt-1 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-fg" />
      </label>
      {!revealed ? (
        <Button variant="primary" onClick={() => setRevealed(true)}>Reveal model answer</Button>
      ) : (
        <div className="anim-in space-y-4">
          <div className="prose-ink space-y-3 rounded-lg border border-accent/30 bg-accent-soft/40 px-5 py-4 text-[15px] leading-relaxed"><Paragraphs text={q.shortAnswer} /></div>
          {q.followUps.length > 0 && (
            <div className="rounded-lg border border-border bg-surface p-4 text-sm">
              <p className="mb-2 font-semibold">The interviewer might follow up with:</p>
              <ul className="list-disc space-y-1 pl-5">{q.followUps.map((f) => <li key={f.q}><Inline text={f.q} /></li>)}</ul>
              <Link href={q.href} target="_blank" className="mt-2 inline-block text-accent underline">Open the full explanation ↗</Link>
            </div>
          )}
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">How did you do?</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {GRADES.map((g) => (
                <button key={g.g} onClick={() => grade(g.g)} className="rounded-md border border-border-strong bg-surface px-3 py-2 text-left text-sm hover:bg-surface-2">
                  <span className="block font-medium">{g.label}</span>
                  <span className="block text-xs text-muted">{g.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
}
