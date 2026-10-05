import type { Metadata } from "next";
import Link from "next/link";
import { tracks } from "@/content";
import { LevelBadge, PageHeader } from "@/components/ui";
import { Inline } from "@/components/content/inline";
import { RefLink } from "@/components/learn/ref-link";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  const withMs = tracks.filter((t) => t.milestones.length);
  return (
    <div>
      <PageHeader title="Projects and milestones" description="Prove understanding by building. Each milestone lists what you must demonstrate and the lessons it exercises." />
      <div className="space-y-10">
        {withMs.map((t) => (
          <section key={t.slug} aria-labelledby={`p-${t.slug}`}>
            <h2 id={`p-${t.slug}`} className="mb-3 text-lg font-semibold"><Link href={`/paths/${t.slug}#milestones`} className="hover:underline">{t.title}</Link></h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {t.milestones.map((m) => (
                <article key={m.id} className="flex flex-col rounded-lg border border-border bg-surface p-4">
                  <div className="mb-1 flex flex-wrap items-center gap-2"><h3 className="font-semibold">{m.title}</h3><LevelBadge level={m.level} /></div>
                  <p className="text-sm text-muted"><Inline text={m.summary} /></p>
                  <ul className="mt-3 flex-1 list-disc space-y-1 pl-5 text-sm marker:text-subtle">{m.requirements.map((r) => <li key={r}><Inline text={r} /></li>)}</ul>
                  <p className="mt-3 text-xs text-subtle">Builds on: {m.exercises.map((e, i) => <span key={e}>{i > 0 && " · "}<RefLink refId={e} /></span>)}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
