import { tracks } from "@/content";
import { lessonRows } from "@/content/summaries";
import { itemMeta } from "@/content/item-index";
import { site } from "@/config/site";
import { Dashboard } from "@/components/learn/dashboard";

export default function Home() {
  return (
    <div>
      <header className="mb-8">
        <p className="text-sm text-muted">{site.name}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">What is happening — and why?</h1>
        <p className="mt-2 max-w-2xl text-muted">{site.tagline}</p>
      </header>
      <Dashboard rows={lessonRows()} meta={itemMeta()} tracks={tracks.map((t) => ({ slug: t.slug, title: t.title }))} />
    </div>
  );
}
