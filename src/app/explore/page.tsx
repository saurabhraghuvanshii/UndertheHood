import type { Metadata } from "next";
import { tracks } from "@/content";
import { lessonRows } from "@/content/summaries";
import { PageHeader } from "@/components/ui";
import { Explore } from "@/components/learn/explore";

export const metadata: Metadata = { title: "Explore" };

export default function ExplorePage() {
  return (
    <div>
      <PageHeader title="Explore" description="Every topic across every path. Filter by subject, difficulty, interview frequency, length, type and your own progress." />
      <Explore rows={lessonRows()} tracks={tracks.map((t) => ({ slug: t.slug, title: t.title }))} />
    </div>
  );
}
