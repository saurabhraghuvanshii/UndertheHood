import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { SearchPage } from "@/components/learn/search-page";

export const metadata: Metadata = { title: "Search" };

export default async function Search({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  return (
    <div>
      <PageHeader title="Search" />
      <SearchPage initial={typeof sp.q === "string" ? sp.q : ""} />
    </div>
  );
}
