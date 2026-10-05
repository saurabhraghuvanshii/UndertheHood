import type { Metadata } from "next";
import { itemMeta } from "@/content/item-index";
import { PageHeader } from "@/components/ui";
import { NotesPage } from "@/components/learn/notes-page";

export const metadata: Metadata = { title: "Notes & bookmarks" };

export default async function Notes({ searchParams }: PageProps<"/notes">) {
  const sp = await searchParams;
  return (
    <div>
      <PageHeader title="Notes & bookmarks" description="Your notes, personal interview answers and code snippets, linked to the lessons and questions they belong to. Stored in this browser — export them from Settings." />
      <NotesPage meta={itemMeta()} focus={typeof sp.note === "string" ? sp.note : undefined} />
    </div>
  );
}
