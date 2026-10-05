"use client";
import { useState } from "react";
import type { QuizQuestion } from "@/content/types";
import { actions } from "@/lib/store";
import type { ItemKey } from "@/lib/progress";
import { Button } from "@/components/ui";
import { cn } from "@/components/ui/cn";
import { RichText } from "@/components/content/rich-text";

export function Quiz({ itemKey, questions }: { itemKey: ItemKey; questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const correct = questions.filter((q) => answers[q.id] === q.answer).length;
  const score = Math.round((correct / questions.length) * 100);

  const submit = () => {
    setSubmitted(true);
    actions.recordQuiz(itemKey, score);
  };
  const retry = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-5"
    >
      {questions.map((q, qi) => (
        <fieldset key={q.id} className="rounded-lg border border-border bg-surface p-4">
          <legend className="sr-only">Question {qi + 1}</legend>
          <div className="mb-3 text-[15px] font-medium text-fg">
            <span className="mr-2 font-mono text-sm text-subtle">{qi + 1}.</span>
            <RichText text={q.prompt} inline />
          </div>
          {q.code && <pre className="mb-3 overflow-x-auto rounded-md border border-border bg-code p-3 font-mono text-[12.5px] leading-relaxed">{q.code.code}</pre>}
          <div className="space-y-1.5">
            {q.options.map((o, oi) => {
              const chosen = answers[q.id] === oi;
              const isRight = q.answer === oi;
              return (
                <label
                  key={oi}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2 text-sm",
                    !submitted && (chosen ? "border-accent bg-accent-soft" : "border-border hover:bg-surface-2"),
                    submitted && isRight && "border-ok/50 bg-ok-soft",
                    submitted && chosen && !isRight && "border-danger/50 bg-danger-soft",
                    submitted && !chosen && !isRight && "border-border opacity-70",
                  )}
                >
                  <input type="radio" name={q.id} className="mt-1 accent-[var(--accent)]" checked={chosen} disabled={submitted} onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))} />
                  <span className="min-w-0"><RichText text={o} inline /></span>
                  {submitted && isRight && <span className="ml-auto text-xs font-medium text-ok">✓ correct</span>}
                  {submitted && chosen && !isRight && <span className="ml-auto text-xs font-medium text-danger">✗ your answer</span>}
                </label>
              );
            })}
          </div>
          {submitted && (
            <div className="anim-in mt-3 rounded-md bg-surface-2 px-3 py-2 text-sm text-fg/90">
              <RichText text={q.explanation} />
            </div>
          )}
        </fieldset>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        {!submitted ? (
          <Button type="submit" variant="primary" disabled={Object.keys(answers).length < questions.length}>
            Check answers
          </Button>
        ) : (
          <>
            <p className="text-sm font-medium" role="status">
              You scored {correct}/{questions.length} ({score}%). {score >= 70 ? "Nice — recorded." : "Recorded. Re-read the explanations and try again."}
            </p>
            <Button onClick={retry}>Try again</Button>
          </>
        )}
      </div>
    </form>
  );
}
