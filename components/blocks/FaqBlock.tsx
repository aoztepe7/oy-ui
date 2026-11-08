import { JsonLd } from "../JsonLd";
import { BlockHeading, Section, type BlockComponentProps } from "./Section";

/** Accessible accordion on native <details>/<summary>, plus FAQPage structured data. */
export function FaqBlock({ props: p, style, primary, edit }: BlockComponentProps<"faq">) {
  // Keep the original index: it is the item's path in the editor (items.2.question).
  const items = (p.items ?? []).map((item, index) => ({ ...item, index })).filter((item) => item.question && item.answer);
  if (items.length === 0) return null;
  return (
    <Section style={style} anchor={p.anchor}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }}
      />
      <div className="mx-auto max-w-3xl">
        <BlockHeading title={p.title} as={primary ? "h1" : "h2"} edit={edit} />
        <div className="space-y-3">
          {items.map((item) => (
            <details key={item.index} className="group tone-light rounded-card bg-paper ring-1 ring-line/70 open:ring-moss/40">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-card px-6 py-5 font-serif text-xl text-forest [&::-webkit-details-marker]:hidden">
                <span {...edit.text(`items.${item.index}.question`)}>{item.question}</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-6 w-6 shrink-0 text-ochre-deep transition-transform group-open:rotate-45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </summary>
              <p className="block-text whitespace-pre-line px-6 pb-6 text-bark" {...edit.textarea(`items.${item.index}.answer`)}>
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
