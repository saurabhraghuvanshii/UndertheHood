import type { Metadata } from "next";
import Link from "next/link";
import { itemMeta } from "@/content/item-index";
import { PageHeader } from "@/components/ui";
import { RevisionQueue } from "@/components/learn/revision-queue";

export const metadata: Metadata = { title: "Revision queue" };

export default function RevisionPage() {
  return (
    <div>
      <PageHeader
        title="Revision queue"
        description={<>Spaced repetition: each review you grade sets the next one further away (or sooner if you forgot). The intervals start at 1 and 3 days and grow with an ease factor — adjustable in <Link href="/settings" className="underline">Settings</Link>. You can always move or remove an item.</>}
      />
      <RevisionQueue meta={itemMeta()} />
    </div>
  );
}
