import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { outputQuestions } from "@/content";
import { CodeBlock } from "@/components/content/code-block";
import { Breadcrumbs } from "@/components/learn/breadcrumbs";
import { BookmarkButton } from "@/components/learn/progress-ui";
import { OutputQuiz } from "@/components/learn/output-quiz";
import { NotesPanel } from "@/components/learn/notes-panel";
import { Sources } from "@/components/learn/sources";
import { outputKey } from "@/lib/progress";
import { outputHref } from "@/lib/routes";

export function generateStaticParams() {
  return outputQuestions.map((q) => ({ id: q.id }));
}

export async function generateMetadata({ params }: PageProps<"/interview/output/[id]">): Promise<Metadata> {
  const { id } = await params;
  const q = outputQuestions.find((x) => x.id === id);
  return { title: q ? `Output Q${q.number}` : "Output question" };
}

export default async function OutputQuestionPage({ params }: PageProps<"/interview/output/[id]">) {
  const { id } = await params;
  const i = outputQuestions.findIndex((x) => x.id === id);
  if (i < 0) notFound();
  const q = outputQuestions[i];
  const prev = outputQuestions[i - 1];
  const next = outputQuestions[i + 1];
  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumbs items={[{ href: "/interview", label: "Interview prep" }, { href: "/interview/output", label: "Output prediction" }, { label: `#${q.number}` }]} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">#{q.number}. {q.title}</h1>
        <BookmarkButton itemKey={outputKey(q.id)} />
      </div>
      {q.code && <CodeBlock code={q.code} lang={q.lang} runnable={q.lang === "js"} />}
      <OutputQuiz id={q.id} options={q.options} answer={q.answer} explanation={q.explanation} />
      <div className="mt-8"><NotesPanel itemKey={outputKey(q.id)} /></div>
      <nav className="mt-8 flex justify-between border-t border-border pt-4 text-sm" aria-label="Question navigation">
        {prev ? <Link href={outputHref(prev.id)} className="hover:underline">← #{prev.number}</Link> : <span />}
        {next ? <Link href={outputHref(next.id)} className="hover:underline">#{next.number} →</Link> : <span />}
      </nav>
      <div className="mt-6"><Sources sources={[q.source]} /></div>
    </div>
  );
}
