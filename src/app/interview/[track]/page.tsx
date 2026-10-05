import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTrack, questions, questionsForTrack } from "@/content";
import { ButtonLink, PageHeader } from "@/components/ui";
import { Breadcrumbs } from "@/components/learn/breadcrumbs";
import { QuestionList } from "@/components/learn/question-list";
import { questionKey } from "@/lib/progress";
import { questionHref } from "@/lib/routes";

export function generateStaticParams() {
  return [...new Set(questions.map((q) => q.track))].map((track) => ({ track }));
}

export async function generateMetadata({ params }: PageProps<"/interview/[track]">): Promise<Metadata> {
  const t = getTrack((await params).track);
  return t ? { title: `${t.title} interview questions` } : {};
}

export default async function TrackQuestionsPage({ params }: PageProps<"/interview/[track]">) {
  const { track: slug } = await params;
  const track = getTrack(slug);
  const qs = questionsForTrack(slug);
  if (!track || !qs.length) notFound();
  return (
    <div>
      <Breadcrumbs items={[{ href: "/interview", label: "Interview prep" }, { label: track.title }]} />
      <PageHeader
        title={`${track.title} interview questions`}
        description={slug === "javascript" ? "All 52 questions from your list, in the original frequency-ranked order. Overlapping questions are kept and cross-linked." : "Ordered roughly by how often they come up."}
        actions={<><ButtonLink href={`/paths/${slug}`}>Learning path</ButtonLink><ButtonLink href={`/interview/mock?track=${slug}`} variant="primary">Mock interview</ButtonLink></>}
      />
      <QuestionList rows={qs.map((q) => ({ id: q.id, number: q.number, title: q.question, level: q.level, frequency: q.frequency, tags: q.tags, href: questionHref(q), itemKey: questionKey(q.id) }))} />
    </div>
  );
}
