import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VIZ_META } from "@/components/viz/meta";
import { VizEmbed } from "@/components/viz/embed";
import { Breadcrumbs } from "@/components/learn/breadcrumbs";
import { RefLink } from "@/components/learn/ref-link";
import { PageHeader } from "@/components/ui";
import type { VizId } from "@/content/types";

export function generateStaticParams() {
  return Object.keys(VIZ_META).map((viz) => ({ viz }));
}

export async function generateMetadata({ params }: PageProps<"/lab/[viz]">): Promise<Metadata> {
  const m = VIZ_META[(await params).viz as VizId];
  return m ? { title: m.title, description: m.summary } : {};
}

export default async function VizPage({ params }: PageProps<"/lab/[viz]">) {
  const id = (await params).viz as VizId;
  const meta = VIZ_META[id];
  if (!meta) notFound();
  return (
    <div>
      <Breadcrumbs items={[{ href: "/lab", label: "Runtime lab" }, { label: meta.title }]} />
      <PageHeader eyebrow={meta.group} title={meta.title} description={meta.summary} />
      <VizEmbed id={id} />
      <section className="mt-8">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">Learn the concept</h2>
        <ul className="space-y-1.5 text-sm">{meta.lessons.map((r) => <li key={r}><RefLink refId={r} showTrack /></li>)}</ul>
      </section>
    </div>
  );
}
