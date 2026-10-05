import type { Metadata } from "next";
import { tracks } from "@/content";
import { lessonRows } from "@/content/summaries";
import { PageHeader } from "@/components/ui";
import { Breadcrumbs } from "@/components/learn/breadcrumbs";
import { PlanBuilder } from "@/components/planner/plan-builder";

export const metadata: Metadata = { title: "New study plan" };

export default async function NewPlanPage({ searchParams }: PageProps<"/planner/new">) {
  const sp = await searchParams;
  const track = typeof sp.track === "string" ? sp.track : undefined;
  return (
    <div>
      <Breadcrumbs items={[{ href: "/planner", label: "Planner" }, { label: "New plan" }]} />
      <PageHeader title="Create a study plan" description="Choose what you want to learn, by when, and how much time you really have. The plan respects prerequisites and difficulty, and tells you honestly if it won't fit." />
      <PlanBuilder rows={lessonRows()} tracks={tracks.map((t) => ({ slug: t.slug, title: t.title }))} initialTrack={track} />
    </div>
  );
}
