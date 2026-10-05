import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuestion, getTrack, questions, questionsForTrack } from "@/content";
import { Blocks } from "@/components/content/blocks";
import { CodeBlock } from "@/components/content/code-block";
import { Inline, Paragraphs } from "@/components/content/inline";
import { Breadcrumbs } from "@/components/learn/breadcrumbs";
import { ReadingLayout } from "@/components/learn/reading-layout";
import { BookmarkButton, ProgressPanel, StudyTimer } from "@/components/learn/progress-ui";
import { NotesPanel } from "@/components/learn/notes-panel";
import { RefLink } from "@/components/learn/ref-link";
import { Reveal } from "@/components/learn/reveal";
import { Sources } from "@/components/learn/sources";
import { FrequencyBadge, LevelBadge } from "@/components/ui";
import { questionKey } from "@/lib/progress";
import { questionHref } from "@/lib/routes";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function generateStaticParams() {
  return questions.map((q) => ({ track: q.track, id: q.id }));
}

export async function generateMetadata({ params }: PageProps<"/interview/[track]/[id]">): Promise<Metadata> {
  const q = getQuestion((await params).id);
  return q ? { title: q.question } : {};
}

function H({ id, children }: { id: string; children: React.ReactNode }) {
  return <h2 id={id} className="mb-4 mt-10 scroll-mt-20 text-xl font-semibold tracking-tight">{children}</h2>;
}

export default async function QuestionPage({ params }: PageProps<"/interview/[track]/[id]">) {
  const { track: trackSlug, id } = await params;
  const q = getQuestion(id);
  const track = getTrack(trackSlug);
  if (!q || !track || q.track !== trackSlug) notFound();
  const list = questionsForTrack(trackSlug);
  const i = list.findIndex((x) => x.id === q.id);
  const prev = list[i - 1];
  const next = list[i + 1];
  const key = questionKey(q.id);

  return (
    <ReadingLayout railLabel="Question details" rail={
      <>
          <ProgressPanel itemKey={key} hasQuiz={false} kindLabel="question" />
          {q.relatedLessons.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Lessons</p>
              <ul className="space-y-1.5 text-sm">{q.relatedLessons.map((r) => <li key={r}><RefLink refId={r} /></li>)}</ul>
            </div>
          )}
          {q.relatedQuestions.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Related questions</p>
              <ul className="space-y-1.5 text-sm">
                {q.relatedQuestions.map((r) => {
                  const rq = getQuestion(r);
                  return <li key={r}>{rq ? <Link href={questionHref(rq)} className="hover:underline">#{rq.number} {rq.question}</Link> : <span className="text-subtle">{r}</span>}</li>;
                })}
              </ul>
            </div>
          )}
          {q.sources && q.sources.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Sources</p>
              <Sources sources={q.sources} />
            </div>
          )}
      </>
    }>
      <StudyTimer itemKey={key} href={questionHref(q)} title={q.question} />
      <Breadcrumbs items={[{ href: "/interview", label: "Interview prep" }, { href: `/interview/${track.slug}`, label: track.title }, { label: `Question ${q.number}` }]} />
      <header className="mb-8 border-b border-border pb-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm text-subtle">#{q.number}</span>
          <LevelBadge level={q.level} />
          <FrequencyBadge frequency={q.frequency} />
          {q.tags.slice(0, 4).map((t) => <span key={t} className="text-xs text-subtle">#{t}</span>)}
        </div>
        <h1 className="text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">{q.question}</h1>
        <div className="mt-4"><BookmarkButton itemKey={key} /></div>
      </header>

      <h2 className="mb-3 text-xl font-semibold tracking-tight">Interview answer <span className="text-sm font-normal text-muted">(30–90 seconds)</span></h2>
      <Reveal>
        <div className="prose-ink space-y-3 rounded-lg border border-accent/30 bg-accent-soft/40 px-5 py-4 text-[15.5px] leading-[1.75]">
          <Paragraphs text={q.shortAnswer} />
        </div>
      </Reveal>

      <H id="deep">Deep explanation</H>
      <Blocks blocks={q.deep} />

      {q.example && (
        <>
          <H id="example">Example</H>
          <CodeBlock code={q.example.code} lang={q.example.lang} caption={q.example.caption} output={q.example.output} runnable={q.example.runnable} />
        </>
      )}
      {q.walkthrough && q.walkthrough.length > 0 && (
        <>
          <H id="walkthrough">Execution walkthrough</H>
          <Blocks blocks={[{ type: "steps", steps: q.walkthrough }]} />
        </>
      )}
      {q.followUps.length > 0 && (
        <>
          <H id="follow-ups">Likely follow-ups</H>
          <div className="space-y-2">
            {q.followUps.map((f, k) => (
              <details key={k} className="group rounded-lg border border-border bg-surface px-4 py-3">
                <summary className="cursor-pointer list-none font-medium"><span className="mr-2 inline-block text-subtle transition-transform group-open:rotate-90" aria-hidden>›</span><Inline text={f.q} /></summary>
                <div className="prose-ink mt-2 pl-5 text-[15px] leading-relaxed text-fg/90"><Inline text={f.a} /></div>
              </details>
            ))}
          </div>
        </>
      )}
      {q.pitfalls.length > 0 && (
        <>
          <H id="pitfalls">Pitfalls and misconceptions</H>
          <Blocks blocks={[{ type: "list", items: q.pitfalls }]} />
        </>
      )}
      {q.glossary.length > 0 && (
        <>
          <H id="glossary">Key terminology</H>
          <dl className="grid gap-3 sm:grid-cols-2">
            {q.glossary.map((g) => (
              <div key={g.term} className="rounded-lg border border-border bg-surface p-3">
                <dt className="font-semibold">{g.term}</dt>
                <dd className="prose-ink mt-1 text-sm text-muted"><Inline text={g.definition} /></dd>
              </div>
            ))}
          </dl>
        </>
      )}
      <div className="mt-10"><NotesPanel itemKey={key} title="Your answer & notes" defaultKind="answer" /></div>

      <nav aria-label="Question navigation" className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
        {prev ? <Link href={questionHref(prev)} className="flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm hover:bg-surface sm:max-w-[48%]"><ArrowLeft className="h-4 w-4 shrink-0" aria-hidden /><span className="truncate">#{prev.number} {prev.question}</span></Link> : <span />}
        {next && <Link href={questionHref(next)} className="flex items-center justify-end gap-2 rounded-lg border border-border px-4 py-3 text-sm hover:bg-surface sm:max-w-[48%]"><span className="truncate">#{next.number} {next.question}</span><ArrowRight className="h-4 w-4 shrink-0" aria-hidden /></Link>}
      </nav>
    </ReadingLayout>
  );
}
