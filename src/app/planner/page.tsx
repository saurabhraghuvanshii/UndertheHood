import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { TodayDate } from "@/components/planner/today-date";

export const metadata: Metadata = { title: "Daily planner" };

export default async function PlannerPage({ searchParams }: PageProps<"/planner">) {
  const sp = await searchParams;
  const date = typeof sp.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : undefined;
  return (
    <div>
      <PageHeader title="Daily planner" description="Today's objectives, scheduled topics, interview questions, practice and revisions — with completion tracking, rescheduling and a short reflection." />
      <TodayDate date={date} />
    </div>
  );
}
