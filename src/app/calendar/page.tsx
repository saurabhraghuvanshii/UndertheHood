import type { Metadata } from "next";
import { ButtonLink, PageHeader } from "@/components/ui";
import { CalendarView } from "@/components/planner/calendar-view";

export const metadata: Metadata = { title: "Calendar" };

export default function CalendarPage() {
  return (
    <div>
      <PageHeader title="Calendar" description="Every scheduled study session, revision and deadline. Move things around as life happens." actions={<ButtonLink href="/planner/new" variant="primary">New plan</ButtonLink>} />
      <CalendarView />
    </div>
  );
}
