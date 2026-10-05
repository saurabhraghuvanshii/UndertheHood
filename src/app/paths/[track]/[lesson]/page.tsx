import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { getLesson, getTrack, lessonNeighbours, lessons, moduleOf, lessonsReferencing, lessonRef, questionsForLesson } from "@/content";
import { SECTION_GOAL, SECTION_TITLES } from "@/content/sections";
import { Blocks } from "@/components/content/blocks";
import { Inline } from "@/components/content/inline";
import { AuthoringBadge, Badge, FrequencyBadge, LevelBadge } from "@/components/ui";
import { Breadcrumbs } from "@/components/learn/breadcrumbs";
import { ReadingLayout } from "@/components/learn/reading-layout";
import { RefLink } from "@/components/learn/ref-link";
import { Sources } from "@/components/learn/sources";
import { BookmarkButton, ProgressPanel, StatusPill, StudyTimer } from "@/components/learn/progress-ui";
import { Quiz } from "@/components/learn/quiz";
import { NotesPanel } from "@/components/learn/notes-panel";
import { lessonKey } from "@/lib/progress";
import { lessonHref, questionHref } from "@/lib/routes";

export function generateStaticParams() {
  return lessons.map((l) => ({ track: l.track, lesson: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/paths/[track]/[lesson]">): Promise<Metadata> {
  const { track, lesson } = await params;
  const l = getLesson(`${track}/${lesson}`);
  return l ? { title: l.title, description: l.summary } : {};
}

export default async function LessonPage({ params }: PageProps<"/paths/[track]/[lesson]">) {
  const { track: trackSlug, lesson: slug } = await params;
  const ref = `${trackSlug}/${slug}`;
  const lesson = getLesson(ref);
  const track = getTrack(trackSlug);
  if (!lesson || !track) notFound();
  const mod = moduleOf(ref);
  const { prev, next } = lessonNeighbours(ref);
  const key = lessonKey(ref);
  const hasQuiz = !!lesson.quiz?.length;
  const sections = lesson.sections.filter((s) => s.blocks.length > 0 && s.id !== "glossary" && s.id !== "follow-ups");
  const leadsTo = lessonsReferencing(ref).filter((l) => l.prerequisites.includes(ref)).slice(0, 6);
  const questions = questionsForLesson(lesson);

  return (
    <ReadingLayout railLabel="Lesson details" rail={
      <>
          <ProgressPanel itemKey={key} hasQuiz={hasQuiz} />
          {sections.length > 3 && (
            <nav aria-label="On this page (sidebar)" className="hidden xl:block">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">On this page</p>
              <ol className="space-y-1 border-l border-border text-sm">
                {sections.map((s) => <li key={s.id}><a href={`#${s.id}`} className="-ml-px block border-l border-transparent pl-3 text-muted hover:border-fg hover:text-fg">{s.title ?? SECTION_TITLES[s.id]}</a></li>)}
              </ol>
            </nav>
          )}
          <RailList title="Learn first" refs={lesson.prerequisites} empty="No prerequisites." />
          {leadsTo.length > 0 && <RailList title="Leads to" refs={leadsTo.map(lessonRef)} />}
          <RailList title="Related" refs={lesson.related} />
          {questions.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Interview questions</p>
              <ul className="space-y-1.5 text-sm">
                {questions.map((q) => <li key={q.id}><Link href={questionHref(q)} className="hover:underline">Q{q.number}. {q.question}</Link></li>)}
              </ul>
            </div>
          )}
          {lesson.sources.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Sources</p>
              <Sources sources={lesson.sources} />
            </div>
          )}
      </>
    }>
      <StudyTimer itemKey={key} href={lessonHref(lesson)} title={lesson.title} />
      <Breadcrumbs items={[{ href: "/paths", label: "Paths" }, { href: `/paths/${track.slug}`, label: track.title }, ...(mod ? [{ href: `/paths/${track.slug}#${mod.id}`, label: mod.title }] : []), { label: lesson.title }]} />

      <header className="mb-8 border-b border-border pb-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <LevelBadge level={lesson.level} />
          <FrequencyBadge frequency={lesson.frequency} />
          <Badge><Clock className="h-3 w-3" aria-hidden />{lesson.minutes} min</Badge>
          {lesson.kinds.map((k) => <Badge key={k}>{k}</Badge>)}
          <AuthoringBadge status={lesson.status} />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{lesson.title}</h1>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted"><Inline text={lesson.summary} /></p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <BookmarkButton itemKey={key} />
          <StatusPill itemKey={key} hasQuiz={hasQuiz} />
        </div>
      </header>

      {lesson.status === "outline" && (
        <aside className="mb-8 rounded-lg border border-dashed border-border-strong bg-surface-2 px-4 py-3 text-sm text-muted">
          <strong className="text-fg">This lesson is an outline.</strong> Its objectives, prerequisites and sources are in place, but the deep explanation hasn’t been written yet. Use the related lessons and your own notes in the meantime.
        </aside>
      )}

      {sections.length > 3 && (
        <nav aria-label="On this page" className="mb-8 rounded-lg border border-border bg-surface p-4 xl:hidden">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">On this page</p>
          <ol className="grid gap-1 text-sm sm:grid-cols-2">
            {sections.map((s) => <li key={s.id}><a href={`#${s.id}`} className="text-muted hover:text-fg">{s.title ?? SECTION_TITLES[s.id]}</a></li>)}
          </ol>
        </nav>
      )}

      {sections.map((s) => (
        <section key={s.id} id={s.id} className="mb-10 scroll-mt-20">
          <h2 className="mb-4 flex items-baseline gap-3 text-xl font-semibold tracking-tight">
            {s.title ?? SECTION_TITLES[s.id]}
            {SECTION_GOAL[s.id] && <span className="text-[11px] font-medium uppercase tracking-wider text-subtle">{SECTION_GOAL[s.id]}</span>}
          </h2>
          <Blocks blocks={s.blocks} />
        </section>
      ))}

      {lesson.followUps && lesson.followUps.length > 0 && (
        <section id="follow-ups" className="mb-10 scroll-mt-20">
          <h2 className="mb-4 flex items-baseline gap-3 text-xl font-semibold tracking-tight">Follow-up questions <span className="text-[11px] font-medium uppercase tracking-wider text-subtle">Interview</span></h2>
          <div className="space-y-2">
            {lesson.followUps.map((f, i) => (
              <details key={i} className="group rounded-lg border border-border bg-surface px-4 py-3">
                <summary className="cursor-pointer list-none font-medium text-fg marker:hidden">
                  <span className="mr-2 inline-block text-subtle transition-transform group-open:rotate-90" aria-hidden>›</span>
                  <Inline text={f.q} />
                </summary>
                <div className="prose-ink mt-2 pl-5 text-[15px] leading-relaxed text-fg/90"><Inline text={f.a} /></div>
              </details>
            ))}
          </div>
        </section>
      )}

      {hasQuiz && (
        <section id="quiz" className="mb-10 scroll-mt-20">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Check yourself</h2>
          <Quiz itemKey={key} questions={lesson.quiz!} />
        </section>
      )}

      {lesson.glossary && lesson.glossary.length > 0 && (
        <section id="glossary" className="mb-10 scroll-mt-20">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Key terminology</h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            {lesson.glossary.map((g) => (
              <div key={g.term} className="rounded-lg border border-border bg-surface p-3">
                <dt className="font-semibold text-fg">{g.term}</dt>
                <dd className="prose-ink mt-1 text-sm leading-relaxed text-muted"><Inline text={g.definition} /></dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="mb-10">
        <NotesPanel itemKey={key} />
      </section>

      <nav aria-label="Lesson navigation" className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
        {prev ? (
          <Link href={lessonHref(prev)} className="group flex items-center gap-2 rounded-lg border border-border px-4 py-3 hover:bg-surface sm:max-w-[48%]">
            <ArrowLeft className="h-4 w-4 shrink-0 text-subtle" aria-hidden />
            <span className="min-w-0"><span className="block text-xs text-muted">Previous</span><span className="block truncate font-medium">{prev.title}</span></span>
          </Link>
        ) : <span />}
        {next ? (
          <Link href={lessonHref(next)} className="group flex items-center justify-end gap-2 rounded-lg border border-border px-4 py-3 text-right hover:bg-surface sm:max-w-[48%]">
            <span className="min-w-0"><span className="block text-xs text-muted">Next</span><span className="block truncate font-medium">{next.title}</span></span>
            <ArrowRight className="h-4 w-4 shrink-0 text-subtle" aria-hidden />
          </Link>
        ) : (
          <Link href={`/paths/${track.slug}`} className="rounded-lg border border-border px-4 py-3 text-sm hover:bg-surface">Back to {track.title}</Link>
        )}
      </nav>
    </ReadingLayout>
  );
}

function RailList({ title, refs, empty }: { title: string; refs: string[]; empty?: string }) {
  if (!refs.length && !empty) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{title}</p>
      {refs.length === 0 ? <p className="text-sm text-subtle">{empty}</p> : (
        <ul className="space-y-1.5 text-sm">
          {refs.map((r) => <li key={r}><RefLink refId={r} showTrack={!r.startsWith(title)} /></li>)}
        </ul>
      )}
    </div>
  );
}
