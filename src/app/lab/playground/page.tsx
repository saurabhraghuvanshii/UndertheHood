import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/learn/breadcrumbs";
import { PageHeader } from "@/components/ui";
import { PlaygroundLoader } from "@/components/learn/playground-loader";

export const metadata: Metadata = { title: "JavaScript playground" };

export default function PlaygroundPage() {
  return (
    <div>
      <Breadcrumbs items={[{ href: "/lab", label: "Runtime lab" }, { label: "JavaScript playground" }]} />
      <PageHeader
        title="JavaScript playground"
        description="This really runs your code — in a throwaway Web Worker using your browser's own JavaScript engine. There's no DOM, no network (fetch is disabled) and the worker is stopped after the time limit. Each log line shows when it ran, in ms after start."
      />
      <PlaygroundLoader />
    </div>
  );
}
