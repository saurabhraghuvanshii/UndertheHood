import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLesson, getTrack, lessonRef, questionsForTrack, trackLessons, tracks } from "@/content";
import { AuthoringBadge, ButtonLink, LevelBadge, PageHeader, Badge } from "@/components/ui";
import { Breadcrumbs } from "@/components/learn/breadcrumbs";
import { StatusPill } from "@/components/learn/progress-ui";
import { TrackProgress } from "@/components/learn/track-progress";
import { Sources } from "@/components/learn/sources";
import { RefLink } from "@/components/learn/ref-link";
import { Inline } from "@/components/content/inline";
import { lessonKey } from "@/lib/progress";
import { lessonHref } from "@/lib/routes";

export function generateStaticParams() {
  return tracks.map((t) => ({ track: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/paths/[track]">): Promise<Metadata> {
  const t = getTrack((await params).track);
  return t ? { title: t.title, description: t.description } : {};
}

export default async function TrackPage({ params }: PageProps<"/paths/[track]">) {
  const { track: slug } = await params;
  const track = getTrack(slug);
  if (!track) notFound();
  const all = trackLessons(slug);
  const qCount = questionsForTrack(slug).length;
  const totalMin = all.reduce((s, l) => s + l.minutes, 0);

  return (
    <div>
      <Breadcrumbs items={[{ href: "/paths", label: "Paths" }, { label: track.title }]} />
      <PageHeader
        title={track.title}
        description={track.description}
        actions={
          <>
            {qCount > 0 && <ButtonLink href={`/interview/${slug}`}>{qCount} interview questions</ButtonLink>}
            <ButtonLink href={`/planner/new?track=${slug}`} variant="primary">Plan this path</ButtonLink>
          </>
        }
      >
        <div className="mt-5 grid max-w-xl gap-2">
          <TrackProgress items={all.map((l) => ({ ref: lessonRef(l), hasQuiz: !!l.quiz?.length }))} label={track.title} />
          <p className="text-xs text-subtle">≈ {Math.round(totalMin / 60)} hours of first-pass study across {all.length} lessons</p>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-10">
          {track.modules.map((m, mi) => (
            <section key={m.id} id={m.id} className="scroll-mt-20" aria-labelledby={`${m.id}-h`}>
              <div className="mb-3">
                <span className="font-mono text-xs text-subtle">Module {mi + 1}</span>
                <h2 id={`${m.id}-h`} className="text-xl font-semibold tracking-tight">{m.title}</h2>
                <p className="mt-1 text-sm text-muted">{m.summary}</p>
              </div>
              <ol className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
                {m.lessons.map((ls, li) => {
                  const l = getLesson(`${slug}/${ls}`);
                  if (!l) return <li key={ls} className="px-4 py-3 text-sm text-subtle">{ls} — missing</li>;
                  return (
                    <li key={ls}>
                      <Link href={lessonHref(l)} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-2 px-4 py-3 hover:bg-surface-2 sm:grid-cols-[2rem_minmax(0,1fr)_auto]">
                        <span className="pt-0.5 font-mono text-xs text-subtle">{mi + 1}.{li + 1}</span>
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-fg">{l.title}</span>
                            <AuthoringBadge status={l.status} />
                          </span>
                          <span className="mt-0.5 line-clamp-2 block text-sm text-muted"><Inline text={l.summary} /></span>
                        </span>
                        <span className="col-start-2 mt-2 flex flex-wrap items-center gap-2 sm:col-start-3 sm:mt-0 sm:flex-col sm:items-end">
                          <StatusPill itemKey={lessonKey(lessonRef(l))} hasQuiz={!!l.quiz?.length} />
                          <span className="text-xs text-subtle">{l.minutes} min</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}

          {track.milestones.length > 0 && (
            <section id="milestones" aria-labelledby="ms-h">
              <h2 id="ms-h" className="mb-3 text-xl font-semibold tracking-tight">Project milestones</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {track.milestones.map((ms) => (
                  <article key={ms.id} className="rounded-lg border border-border bg-surface p-4">
                    <div className="mb-1 flex items-center gap-2"><h3 className="font-semibold">{ms.title}</h3><LevelBadge level={ms.level} /></div>
                    <p className="text-sm text-muted"><Inline text={ms.summary} /></p>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm marker:text-subtle">
                      {ms.requirements.map((r) => <li key={r}><Inline text={r} /></li>)}
                    </ul>
                    {ms.stretch && <p className="mt-2 text-xs text-muted">Stretch: {ms.stretch.join(" · ")}</p>}
                    <p className="mt-3 text-xs text-subtle">Exercises: {ms.exercises.map((e, i) => <span key={e}>{i > 0 && " · "}<RefLink refId={e} /></span>)}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
        <aside className="space-y-6" aria-label="Track details">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Modules</p>
            <ol className="space-y-1 text-sm">
              {track.modules.map((m) => <li key={m.id}><a href={`#${m.id}`} className="text-muted hover:text-fg">{m.title} <span className="text-subtle">({m.lessons.length})</span></a></li>)}
              {track.milestones.length > 0 && <li><a href="#milestones" className="text-muted hover:text-fg">Project milestones</a></li>}
            </ol>
          </div>
          {track.sources.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Sources</p>
              <Sources sources={track.sources} />
            </div>
          )}
          <Badge>{all.filter((l) => l.status === "authored").length} written · {all.filter((l) => l.status === "outline").length} outline</Badge>
        </aside>
      </div>
    </div>
  );
}
