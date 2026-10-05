import { notFound, redirect } from "next/navigation";
import { getQuestion, questions } from "@/content";
import { questionHref } from "@/lib/routes";

/** Stable short link for a question id (used by planner tasks): /q/js-01 → /interview/javascript/js-01 */
export function generateStaticParams() {
  return questions.map((q) => ({ id: q.id }));
}

export default async function QuestionShortLink({ params }: PageProps<"/q/[id]">) {
  const q = getQuestion((await params).id);
  if (!q) notFound();
  redirect(questionHref(q));
}
