import { Fragment, type ReactNode } from "react";
import type { EditAttrs } from "@/lib/edit";
import { SmartLink } from "./SmartLink";

/**
 * Safe renderer for the CMS markdown subset (docs/API.md): blank line = paragraph, single line break = <br>,
 * `## h` / `### h`, `- item`, `1. item`, **bold**, *italic*, [text](url).
 * Everything is rendered as React text nodes — raw HTML is never interpreted.
 */

type MdBlock =
  | { kind: "p"; lines: string[] }
  | { kind: "h"; depth: 0 | 1; text: string }
  | { kind: "ul" | "ol"; items: string[] };

function parse(source: string): MdBlock[] {
  const blocks: MdBlock[] = [];
  let paragraph: string[] = [];
  // Cast keeps TS from narrowing to `null` (it is reassigned inside the helpers below).
  let list = null as { kind: "ul" | "ol"; items: string[] } | null;

  const endParagraph = () => {
    if (paragraph.length) blocks.push({ kind: "p", lines: paragraph });
    paragraph = [];
  };
  const endList = () => {
    if (list) blocks.push(list);
    list = null;
  };

  for (const raw of source.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      endParagraph();
      endList();
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      endParagraph();
      endList();
      blocks.push({ kind: "h", depth: heading[1].length === 3 ? 1 : 0, text: heading[2] });
      continue;
    }

    const bullet = /^[-*]\s+(.+)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.+)$/.exec(line);
    const item = bullet ?? numbered;
    if (item) {
      const kind = bullet ? "ul" : "ol";
      endParagraph();
      if (list?.kind !== kind) {
        endList();
        list = { kind, items: [] };
      }
      list.items.push(item[1]);
      continue;
    }

    endList();
    paragraph.push(line);
  }
  endParagraph();
  endList();
  return blocks;
}

const INLINE = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|\*([^*\s](?:[^*]*[^*\s])?)\*/g;

function inline(text: string, key: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const k = `${key}.${n++}`;
    if (m[1] !== undefined) nodes.push(<strong key={k}>{inline(m[1], k)}</strong>);
    else if (m[2] !== undefined)
      nodes.push(
        <SmartLink key={k} href={m[3]}>
          {inline(m[2], k)}
        </SmartLink>,
      );
    else nodes.push(<em key={k}>{inline(m[4], k)}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({
  text,
  className = "",
  headingLevel = 2,
  attrs,
}: {
  text: string;
  className?: string;
  /** Level used for `##`; `###` is one below. Use 3 when the block already has an h2 title. */
  headingLevel?: 2 | 3;
  /** Extra data-* attributes on the wrapper (visual editor). */
  attrs?: EditAttrs;
}) {
  const blocks = parse(text);
  if (blocks.length === 0) return null;
  return (
    <div className={`prose-body ${className}`} {...attrs}>
      {blocks.map((block, i) => {
        const key = String(i);
        switch (block.kind) {
          case "h": {
            const Heading = block.depth + headingLevel === 2 ? "h2" : block.depth + headingLevel === 3 ? "h3" : "h4";
            return <Heading key={key}>{inline(block.text, key)}</Heading>;
          }
          case "ul":
          case "ol": {
            const List = block.kind;
            return (
              <List key={key}>
                {block.items.map((item, j) => (
                  <li key={j}>{inline(item, `${key}.${j}`)}</li>
                ))}
              </List>
            );
          }
          default:
            return (
              <p key={key}>
                {block.lines.map((line, j) => (
                  <Fragment key={j}>
                    {j > 0 && <br />}
                    {inline(line, `${key}.${j}`)}
                  </Fragment>
                ))}
              </p>
            );
        }
      })}
    </div>
  );
}
