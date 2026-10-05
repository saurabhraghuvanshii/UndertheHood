import Link from "next/link";
import type { Metadata } from "next";
import { VIZ_META, type VizGroup } from "@/components/viz/meta";
import type { VizId } from "@/content/types";
import { Badge, PageHeader, SectionTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Runtime lab" };

const GROUPS: VizGroup[] = ["JavaScript runtime", "Go runtime", "Systems", "Hardware & memory"];

export default function LabPage() {
  const ids = Object.keys(VIZ_META) as VizId[];
  return (
    <div>
      <PageHeader
        title="Runtime lab"
        description="Step through programs and simulations and watch what changes: call stacks, environments, heaps, queues, goroutines, channels, caches and requests. Each one says what it is — a scripted trace of the spec, an interactive model of the mechanism, or real execution."
      />
      <Link href="/lab/playground" className="mb-10 flex flex-wrap items-center gap-3 rounded-lg border border-ok/40 bg-ok-soft px-5 py-4 hover:border-ok">
        <span className="font-semibold">JavaScript playground</span>
        <Badge tone="ok">Real execution</Badge>
        <span className="w-full text-sm text-muted sm:w-auto">Edit and run JavaScript in a sandboxed Web Worker in your own browser.</span>
      </Link>
      {GROUPS.map((g) => (
        <section key={g} className="mb-10">
          <SectionTitle>{g}</SectionTitle>
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {ids.filter((id) => VIZ_META[id].group === g).map((id) => (
              <li key={id}>
                <Link href={`/lab/${id}`} className="flex h-full flex-col rounded-lg border border-border bg-surface p-4 hover:border-border-strong">
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-semibold">{VIZ_META[id].title}</span>
                    <Badge>{VIZ_META[id].kind === "trace" ? "Scripted trace" : "Interactive model"}</Badge>
                  </span>
                  <span className="mt-1.5 text-sm text-muted">{VIZ_META[id].summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
