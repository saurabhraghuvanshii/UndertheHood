import Link from "next/link";
import type { Metadata } from "next";
import { getTrack, outputQuestions, questions } from "@/content";
import { ButtonLink, PageHeader, SectionTitle } from "@/components/ui";
import { InterviewRevisionList } from "@/components/learn/interview-revision";
import { questionHref } from "@/lib/routes";

export const metadata: Metadata = { title: "Interview prep" };

export default function InterviewPage() {
  const byTrack = [...new Set(questions.map((q) => q.track))].map((t) => ({ track: getTrack(t)!, qs: questions.filter((q) => q.track === t) }));
  const meta = questions.map((q) => ({ id: q.id, title: q.question, href: questionHref(q), track: q.track }));
  return (
    <div>
      <PageHeader
        title="Interview preparation"
        description="Question banks with spoken-length answers, deep explanations, follow-ups and pitfalls; output-prediction drills; and timed mock interviews that feed your revision queue."
        actions={<ButtonLink href="/interview/mock" variant="primary">Start a mock interview</ButtonLink>}
      />
      <section className="mb-10">
        <SectionTitle>Question banks</SectionTitle>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {byTrack.map(({ track, qs }) => (
            <li key={track.slug}>
              <Link href={`/interview/${track.slug}`} className="block rounded-lg border border-border bg-surface p-4 hover:border-border-strong">
                <span className="font-semibold">{track.title}</span>
                <span className="mt-1 block text-sm text-muted">{qs.length} questions · {qs.filter((q) => q.frequency === "very-high" || q.frequency === "high").length} frequently asked</span>
              </Link>
            </li>
          ))}
          <li>
            <Link href="/interview/output" className="block rounded-lg border border-border bg-surface p-4 hover:border-border-strong">
              <span className="font-semibold">JavaScript output prediction</span>
              <span className="mt-1 block text-sm text-muted">{outputQuestions.length} “what’s the output?” drills (lydiahallie/javascript-questions, MIT)</span>
            </Link>
          </li>
          <li>
            <Link href="/design" className="block rounded-lg border border-border bg-surface p-4 hover:border-border-strong">
              <span className="font-semibold">System design scenarios</span>
              <span className="mt-1 block text-sm text-muted">12 worked designs with model interview walkthroughs</span>
            </Link>
          </li>
        </ul>
      </section>
      <section>
        <SectionTitle>Your revision list</SectionTitle>
        <InterviewRevisionList meta={meta} />
      </section>
    </div>
  );
}
