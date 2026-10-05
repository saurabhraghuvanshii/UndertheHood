import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { designExercises, getDesignExercise } from "@/content";
import { Blocks } from "@/components/content/blocks";
import { Inline } from "@/components/content/inline";
import { ArchitectureDiagram } from "@/components/content/architecture";
import { Breadcrumbs } from "@/components/learn/breadcrumbs";
import { ReadingLayout } from "@/components/learn/reading-layout";
import { BookmarkButton, ProgressPanel, StudyTimer } from "@/components/learn/progress-ui";
import { NotesPanel } from "@/components/learn/notes-panel";
import { RefLink } from "@/components/learn/ref-link";
import { Reveal } from "@/components/learn/reveal";
import { Badge, LevelBadge } from "@/components/ui";
import { designKey } from "@/lib/progress";

export function generateStaticParams() {
  return designExercises.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/design/[slug]">): Promise<Metadata> {
  const e = getDesignExercise((await params).slug);
  return e ? { title: `Design: ${e.title}`, description: e.summary } : {};
}

const TOC = [
  ["requirements", "Requirements"], ["estimation", "Estimation"], ["api", "API"], ["data-model", "Data model"],
  ["architecture", "Architecture"], ["flows", "Request flows"], ["bottlenecks", "Bottlenecks"], ["failures", "Failure scenarios"],
  ["tradeoffs", "Trade-offs"], ["walkthrough", "Model interview walkthrough"], ["follow-ups", "Follow-ups"],
] as const;

function H({ id, n, children }: { id: string; n: number; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mb-4 mt-12 flex scroll-mt-20 items-baseline gap-3 text-xl font-semibold tracking-tight first:mt-0">
      <span className="font-mono text-sm text-subtle">{n}</span>{children}
    </h2>
  );
}

export default async function DesignExercisePage({ params }: PageProps<"/design/[slug]">) {
  const { slug } = await params;
  const e = getDesignExercise(slug);
  if (!e) notFound();
  const key = designKey(e.slug);

  return (
    <ReadingLayout railLabel="Exercise details" rail={
      <>
          <ProgressPanel itemKey={key} hasQuiz={false} kindLabel="exercise" />
          <nav aria-label="Sections">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Sections</p>
            <ol className="space-y-1 text-sm">{TOC.map(([id, l]) => <li key={id}><a href={`#${id}`} className="text-muted hover:text-fg">{l}</a></li>)}</ol>
          </nav>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Building blocks used</p>
            <ul className="space-y-1.5 text-sm">{e.related.map((r) => <li key={r}><RefLink refId={r} /></li>)}</ul>
          </div>
      </>
    }>
      <StudyTimer itemKey={key} href={`/design/${e.slug}`} title={e.title} />
      <Breadcrumbs items={[{ href: "/design", label: "System design" }, { label: e.title }]} />
      <header className="mb-8 border-b border-border pb-6">
        <div className="mb-3 flex flex-wrap gap-2"><LevelBadge level={e.level} /><Badge>{e.minutes} min</Badge></div>
        <p className="text-sm text-muted">Design exercise</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{e.title}</h1>
        <p className="mt-3 max-w-3xl text-lg text-muted"><Inline text={e.summary} /></p>
        <div className="mt-4"><BookmarkButton itemKey={key} /></div>
      </header>

      <aside className="mb-8 rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm text-muted">
        <strong className="text-fg">Practise first:</strong> set a 45-minute timer and sketch your own design on paper before reading on. Each section below is one step of the interview method.
      </aside>

      <H id="requirements" n={1}>Requirements</H>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-semibold">Functional</h3>
          <Blocks blocks={[{ type: "list", items: e.functional }]} />
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-semibold">Non-functional</h3>
          <Blocks blocks={[{ type: "list", items: e.nonFunctional }]} />
        </div>
      </div>
      {e.assumptions.length > 0 && (
        <div className="mt-4"><h3 className="mb-2 text-sm font-semibold">Assumptions</h3><Blocks blocks={[{ type: "list", items: e.assumptions }]} /></div>
      )}

      <H id="estimation" n={2}>Back-of-the-envelope estimation</H>
      <Blocks blocks={e.estimation} />
      <H id="api" n={3}>API</H>
      <Blocks blocks={e.api} />
      <H id="data-model" n={4}>Data model</H>
      <Blocks blocks={e.dataModel} />
      <H id="architecture" n={5}>High-level architecture</H>
      <ArchitectureDiagram arch={e.architecture} title={e.title} />
      <Blocks blocks={e.architecture.notes} />
      <H id="flows" n={6}>Request flows</H>
      <div className="space-y-4">
        {e.flows.map((f) => (
          <div key={f.title}>
            <h3 className="mb-2 font-semibold">{f.title}</h3>
            <Blocks blocks={[{ type: "list", ordered: true, items: f.steps }]} />
          </div>
        ))}
      </div>
      <H id="bottlenecks" n={7}>Bottlenecks</H>
      <Blocks blocks={[{ type: "list", items: e.bottlenecks }]} />
      <H id="failures" n={8}>Failure scenarios</H>
      <Blocks blocks={[{ type: "table", head: ["Scenario", "Mitigation"], rows: e.failures.map((f) => [f.scenario, f.mitigation]) }]} />
      <H id="tradeoffs" n={9}>Trade-offs</H>
      <Blocks blocks={[{ type: "table", head: ["Decision", "Options", "Choice and why"], rows: e.tradeoffs.map((t) => [t.decision, t.options, t.choice]) }]} />
      <H id="walkthrough" n={10}>Model interview walkthrough</H>
      <Reveal prompt="Try your own 45-minute walkthrough first. Then compare with a strong candidate's." label="Show the model walkthrough">
        <Blocks blocks={[{ type: "steps", steps: e.walkthrough }]} />
      </Reveal>
      <H id="follow-ups" n={11}>Interviewer follow-ups</H>
      <div className="space-y-2">
        {e.followUps.map((f, i) => (
          <details key={i} className="group rounded-lg border border-border bg-surface px-4 py-3">
            <summary className="cursor-pointer list-none font-medium"><span className="mr-2 inline-block text-subtle transition-transform group-open:rotate-90" aria-hidden>›</span><Inline text={f.q} /></summary>
            <div className="prose-ink mt-2 pl-5 text-[15px] leading-relaxed"><Inline text={f.a} /></div>
          </details>
        ))}
      </div>
      <div className="mt-12"><NotesPanel itemKey={key} title="Your design notes" /></div>
    </ReadingLayout>
  );
}
