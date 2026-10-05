import Link from "next/link";
import type { Metadata } from "next";
import { designExercises, getTrack, trackLessons, lessonRef } from "@/content";
import { LevelBadge, PageHeader, SectionTitle, ButtonLink } from "@/components/ui";
import { StatusPill } from "@/components/learn/progress-ui";
import { TrackProgress } from "@/components/learn/track-progress";
import { designKey } from "@/lib/progress";

export const metadata: Metadata = { title: "System design" };

export default function DesignPage() {
  const track = getTrack("system-design")!;
  const ls = trackLessons("system-design");
  return (
    <div>
      <PageHeader
        title="System design"
        description="The 40-topic checklist teaches the building blocks; the exercises put them together the way an interview does — requirements, estimates, APIs, data model, architecture, bottlenecks, failures and trade-offs."
        actions={<ButtonLink href="/paths/system-design" variant="primary">40-topic curriculum</ButtonLink>}
      >
        <div className="mt-5 max-w-md"><TrackProgress items={ls.map((l) => ({ ref: lessonRef(l), hasQuiz: !!l.quiz?.length }))} label={track.title} /></div>
      </PageHeader>
      <SectionTitle>Design exercises — easiest first</SectionTitle>
      <ol className="grid gap-3 md:grid-cols-2">
        {designExercises.map((e, i) => (
          <li key={e.slug}>
            <Link href={`/design/${e.slug}`} className="flex h-full flex-col rounded-lg border border-border bg-surface p-4 hover:border-border-strong">
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs text-subtle">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-semibold">{e.title}</span>
                <span className="ml-auto"><StatusPill itemKey={designKey(e.slug)} /></span>
              </span>
              <span className="mt-1 flex-1 text-sm text-muted">{e.summary}</span>
              <span className="mt-3 flex items-center gap-2 text-xs text-subtle"><LevelBadge level={e.level} /> {e.minutes} min</span>
            </Link>
          </li>
        ))}
      </ol>
      <section className="mt-10">
        <SectionTitle>The interview method</SectionTitle>
        <ol className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {["Clarify functional requirements", "Clarify non-functional requirements", "Establish assumptions and constraints", "Estimate traffic, storage and resources", "Define APIs and data models", "Draw a high-level architecture", "Explain the main request flows", "Identify bottlenecks", "Choose databases, caches, queues and infra", "Discuss scaling, consistency, availability, failures", "Cover security, observability, operations", "Explain trade-offs and alternatives"].map((s, i) => (
            <li key={s} className="flex gap-3 rounded-md border border-border bg-surface px-3 py-2"><span className="font-mono text-subtle">{i + 1}</span>{s}</li>
          ))}
        </ol>
        <p className="mt-3 text-sm"><Link href="/paths/system-design/interview-framework" className="text-accent underline">Read the full method →</Link></p>
      </section>
    </div>
  );
}
