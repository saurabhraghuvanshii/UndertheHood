import Link from "next/link";
import { Fragment, type ReactNode } from "react";

/**
 * Renders the inline markdown subset used in content:
 * `code`, **bold**, *italic*, [label](href). Internal links ("/…") use next/link.
 */
const TOKEN = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\([^)\s]+\))/g;

export function Inline({ text }: { text: string }) {
  const parts = text.split(TOKEN);
  return (
    <>
      {parts.map((p, i) => {
        if (!p) return null;
        if (p.startsWith("`") && p.endsWith("`") && p.length > 1) return <code key={i}>{p.slice(1, -1)}</code>;
        if (p.startsWith("**") && p.endsWith("**")) return <strong key={i} className="font-semibold text-fg"><Inline text={p.slice(2, -2)} /></strong>;
        if (p.startsWith("*") && p.endsWith("*") && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
        const link = p.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
        if (link) {
          const [, label, href] = link;
          return href.startsWith("/") ? (
            <Link key={i} href={href}>{label}</Link>
          ) : (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer">{label}</a>
          );
        }
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}

/** Paragraphs separated by blank lines; single newlines become line breaks. */
export function Paragraphs({ text, className }: { text: string; className?: string }): ReactNode {
  return text.split(/\n{2,}/).map((para, i) => (
    <p key={i} className={className}>
      {para.split("\n").map((line, j) => (
        <Fragment key={j}>
          {j > 0 && <br />}
          <Inline text={line} />
        </Fragment>
      ))}
    </p>
  ));
}
