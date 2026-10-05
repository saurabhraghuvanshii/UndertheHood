import { Fragment } from "react";
import { Inline, Paragraphs } from "./inline";

/**
 * Text with paragraphs and optional ``` fenced code blocks (used for imported
 * explanations and short answers). Safe for both server and client components.
 */
export function RichText({ text, inline, className }: { text: string; inline?: boolean; className?: string }) {
  if (inline) return <Inline text={text} />;
  const parts = text.split(/```(\w*)\n([\s\S]*?)```/g);
  const out = [];
  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i].trim()) out.push(<Paragraphs key={`p${i}`} text={parts[i].trim()} className="[&:not(:first-child)]:mt-3" />);
    if (parts[i + 2] !== undefined) {
      out.push(
        <pre key={`c${i}`} className="my-3 overflow-x-auto rounded-md border border-border bg-code p-3 font-mono text-[12.5px] leading-relaxed">
          {parts[i + 2].replace(/\s+$/, "")}
        </pre>,
      );
    }
  }
  return <div className={`prose-ink ${className ?? ""}`}>{out.map((o, i) => <Fragment key={i}>{o}</Fragment>)}</div>;
}
