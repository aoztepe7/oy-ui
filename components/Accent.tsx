import { Fragment, type ReactNode } from "react";
import type { EditAttrs } from "@/lib/edit";

/**
 * Titles may mark accent words with asterisks: "Çocukluk *dört duvara* sığmaz" → italic ochre words.
 * While the field is inline-editable (visual editor) the raw text is shown, so editing keeps the asterisks.
 */
export function accent(text: string, attrs?: EditAttrs): ReactNode {
  if (!text.includes("*") || (attrs && Object.keys(attrs).length > 0)) return text;
  return text.split(/\*([^*]+)\*/g).map((part, i) => (i % 2 ? <em key={i}>{part}</em> : <Fragment key={i}>{part}</Fragment>));
}

/** Title without accent markers (alt texts, metadata). */
export function plain(text: string): string {
  return text.replace(/\*/g, "");
}
