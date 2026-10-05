import Link from "next/link";
import type { Metadata } from "next";
import { tracks, trackLessons, questionsForTrack, lessonRef } from "@/content";
import { PageHeader } from "@/components/ui";
import { TrackProgress } from "@/components/learn/track-progress";

export const metadata: Metadata = { title: "Learning paths" };

export default function PathsPage() {
  return (
    <div>
      <PageHeader title="Learning paths" description="Fifteen structured paths, each split into modules with prerequisites, lessons, practice and project milestones. Outline lessons are marked as such — nothing pretends to be finished." />
      <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tracks.map((t, i) => {
          const ls = trackLessons(t.slug);
          const authored = ls.filter((l) => l.status === "authored").length;
          const qs = questionsForTrack(t.slug).length;
          return (
            <li key={t.slug} className="flex">
              <Link href={`/paths/${t.slug}`} className="group flex w-full flex-col rounded-lg border border-border bg-surface p-5 transition-colors hover:border-border-strong">
                <span className="font-mono text-xs text-subtle">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="mt-1 text-lg font-semibold tracking-tight group-hover:underline">{t.title}</h2>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{t.tagline}</p>
                <p className="mt-4 text-xs text-subtle">
                  {t.modules.length} modules · {ls.length} lessons ({authored} written{ls.length - authored ? `, ${ls.length - authored} outline` : ""}){qs ? ` · ${qs} interview Qs` : ""}
                </p>
                <div className="mt-3"><TrackProgress items={ls.map((l) => ({ ref: lessonRef(l), hasQuiz: !!l.quiz?.length }))} label={t.title} /></div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
