import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-subtle" aria-hidden />}
            {it.href ? <Link href={it.href} className="hover:text-fg hover:underline">{it.label}</Link> : <span aria-current="page" className="text-fg">{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
