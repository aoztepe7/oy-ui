import { paragraphs } from "@/lib/format";

/** Renders plain text with blank-line separated paragraphs. */
export function Prose({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={`prose-body ${className}`}>
      {paragraphs(text).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
