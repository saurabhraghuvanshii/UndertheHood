import type { Metadata } from "next";
import { outputQuestions } from "@/content";
import { PageHeader } from "@/components/ui";
import { Breadcrumbs } from "@/components/learn/breadcrumbs";
import { QuestionList } from "@/components/learn/question-list";
import { outputKey } from "@/lib/progress";
import { outputHref } from "@/lib/routes";

export const metadata: Metadata = { title: "JavaScript output prediction" };

export default function OutputIndex() {
  return (
    <div>
      <Breadcrumbs items={[{ href: "/interview", label: "Interview prep" }, { label: "Output prediction" }]} />
      <PageHeader
        title="What’s the output?"
        description={<>{outputQuestions.length} JavaScript output-prediction questions, imported with their original numbering from the copy in your <a className="underline" href="https://github.com/saurabhraghuvanshii/language-learning/blob/main/JS/Js-questions-lydiahallie.md">language-learning</a> repo. Original work © Lydia Hallie, <a className="underline" href="https://github.com/lydiahallie/javascript-questions">MIT License</a>.</>}
      />
      <QuestionList
        showFrequency={false}
        rows={outputQuestions.map((q) => ({ id: q.id, number: q.number, title: firstLine(q), level: "intermediate", frequency: "medium", tags: [], href: outputHref(q.id), itemKey: outputKey(q.id), hasQuiz: true }))}
      />
    </div>
  );
}

function firstLine(q: (typeof outputQuestions)[number]) {
  const code = q.code.split("\n").find((l) => l.trim() && !l.trim().startsWith("//")) ?? "";
  return `${q.title} — ${code.trim().slice(0, 70)}`;
}
