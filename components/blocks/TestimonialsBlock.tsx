import { BlockHeading, Section, type BlockComponentProps } from "./Section";

export function TestimonialsBlock({ props: p, style, primary, edit }: BlockComponentProps<"testimonials">) {
  const items = (p.items ?? []).map((item, index) => ({ ...item, index })).filter((item) => item.quote);
  if (items.length === 0) return null;
  return (
    <Section style={style} anchor={p.anchor}>
      <BlockHeading title={p.title} as={primary ? "h1" : "h2"} edit={edit} />
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.index} className="flex">
            <figure className="tone-light flex w-full flex-col rounded-card bg-paper p-7 ring-1 ring-line/70 md:p-8">
              <span aria-hidden="true" className="font-serif text-6xl leading-none text-ochre">
                “
              </span>
              <blockquote
                className="mt-1 whitespace-pre-line font-serif text-xl leading-snug text-forest"
                {...edit.textarea(`items.${item.index}.quote`)}
              >
                {item.quote}
              </blockquote>
              {(item.author || item.role) && (
                <figcaption className="mt-auto pt-6">
                  {item.author && (
                    <span className="block font-bold text-ink" {...edit.text(`items.${item.index}.author`)}>
                      {item.author}
                    </span>
                  )}
                  {item.role && (
                    <span className="block text-sm text-bark" {...edit.text(`items.${item.index}.role`)}>
                      {item.role}
                    </span>
                  )}
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
