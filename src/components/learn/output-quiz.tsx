"use client";
import { useState } from "react";
import { actions } from "@/lib/store";
import { outputKey } from "@/lib/progress";
import { RichText } from "@/components/content/rich-text";
import { cn } from "@/components/ui/cn";

/** One "what's the output?" question. Answering records a quiz score (100 or 0) and schedules revision. */
export function OutputQuiz({ id, options, answer, explanation }: { id: string; options: string[]; answer: number; explanation: string }) {
  const [chosen, setChosen] = useState<number | null>(null);
  const pick = (i: number) => {
    if (chosen !== null) return;
    setChosen(i);
    const key = outputKey(id);
    actions.recordQuiz(key, i === answer ? 100 : 0);
    actions.addToRevision(key);
    actions.reviewItem(key, i === answer ? "good" : "again");
  };
  return (
    <div className="mt-4">
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-muted">Pick your answer — commit before running the code.</legend>
        <div className="space-y-1.5">
          {options.map((o, i) => (
            <button
              key={i}
              onClick={() => pick(i)}
              disabled={chosen !== null}
              className={cn(
                "flex w-full items-start gap-3 rounded-md border px-3 py-2 text-left text-sm",
                chosen === null && "border-border hover:bg-surface-2",
                chosen !== null && i === answer && "border-ok/50 bg-ok-soft",
                chosen === i && i !== answer && "border-danger/50 bg-danger-soft",
                chosen !== null && chosen !== i && i !== answer && "border-border opacity-60",
              )}
            >
              <span className="font-mono text-xs text-subtle">{String.fromCharCode(65 + i)}</span>
              <span className="min-w-0 flex-1"><RichText text={o} inline /></span>
              {chosen !== null && i === answer && <span className="text-xs font-medium text-ok">✓ answer</span>}
              {chosen === i && i !== answer && <span className="text-xs font-medium text-danger">✗ yours</span>}
            </button>
          ))}
        </div>
      </fieldset>
      {chosen !== null && (
        <div className="anim-in mt-5 rounded-lg border border-border bg-surface p-4 text-[15px] leading-relaxed" role="status">
          <p className="mb-2 font-semibold">{chosen === answer ? "Correct." : `Not quite — the answer is ${String.fromCharCode(65 + answer)}.`} <span className="font-normal text-muted">Added to your revision queue.</span></p>
          <RichText text={explanation} />
        </div>
      )}
    </div>
  );
}
