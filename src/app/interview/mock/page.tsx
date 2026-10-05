import type { Metadata } from "next";
import { getTrack, questions } from "@/content";
import { PageHeader } from "@/components/ui";
import { Breadcrumbs } from "@/components/learn/breadcrumbs";
import { MockInterview } from "@/components/learn/mock-interview";
import { questionHref } from "@/lib/routes";

export const metadata: Metadata = { title: "Mock interview" };

export default async function MockPage({ searchParams }: PageProps<"/interview/mock">) {
  const sp = await searchParams;
  const track = typeof sp.track === "string" ? sp.track : undefined;
  const pool = questions.map((q) => ({ id: q.id, track: q.track, question: q.question, shortAnswer: q.shortAnswer, followUps: q.followUps.slice(0, 2), level: q.level, href: questionHref(q) }));
  const tracks = [...new Set(questions.map((q) => q.track))].map((t) => ({ slug: t, title: getTrack(t)?.title ?? t }));
  return (
    <div>
      <Breadcrumbs items={[{ href: "/interview", label: "Interview prep" }, { label: "Mock interview" }]} />
      <PageHeader title="Mock interview" description="Questions are drawn at random from the banks you choose, favouring ones you haven't mastered. Answer out loud against the clock, compare with the model answer, then grade yourself honestly — the grade schedules the question's next revision." />
      <MockInterview pool={pool} tracks={tracks} initialTrack={track} />
    </div>
  );
}
