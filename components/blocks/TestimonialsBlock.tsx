import { BlockHeading, Section, type BlockComponentProps } from "./Section";

/** Quotes. A single quote becomes a large centred statement; several become cards. */
export function TestimonialsBlock({ props: p, style, primary, edit }: BlockComponentProps<"testimonials">) {
  const items = (p.items ?? []).map((item, index) => ({ ...item, index })).filter((item) => item.quote);
  if (items.length === 0) return null;

  if (items.length === 1) {
    const item = items[0];
    return (
      <Section style={style} anchor={p.anchor}>
        <BlockHeading title={p.title} as={primary ? "h1" : "h2"} edit={edit} />
        <figure className="relative mx-auto max-w-5xl text-center">
          <span aria-hidden="true" className="block font-serif text-[9rem] leading-[0.6] text-ochre md:text-[12rem]">
            “
          </span>
          <blockquote
            className="mt-2 whitespace-pre-line font-serif text-[clamp(1.9rem,4.2vw,3.5rem)] italic leading-[1.15] tracking-tight text-heading"
            {...edit.textarea(`items.${item.index}.quote`)}
          >
            {item.quote}
          </blockquote>
          {(item.author || item.role) && (
            <figcaption className="mt-10 inline-flex items-center gap-3 text-sm font-extrabold uppercase tracking-[0.2em] text-eyebrow">
              <span aria-hidden="true" className="h-0.5 w-8 rounded bg-current" />
              {item.author && <span {...edit.text(`items.${item.index}.author`)}>{item.author}</span>}
              {item.role && (
                <span className="font-bold normal-case tracking-normal text-muted" {...edit.text(`items.${item.index}.role`)}>
                  {item.role}
                </span>
              )}
            </figcaption>
          )}
        </figure>
      </Section>
    );
  }

  return (
    <Section style={style} anchor={p.anchor}>
      <BlockHeading title={p.title} as={primary ? "h1" : "h2"} edit={edit} />
      <ul className="reveal-children grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.index} className="flex">
            <figure className="tone-light flex w-full flex-col rounded-card bg-paper p-8 shadow-(--shadow-soft) ring-1 ring-line/60 md:p-10">
              <span aria-hidden="true" className="font-serif text-7xl leading-none text-ochre">
                “
              </span>
              <blockquote
                className="mt-1 whitespace-pre-line font-serif text-xl leading-snug text-forest md:text-2xl"
                {...edit.textarea(`items.${item.index}.quote`)}
              >
                {item.quote}
              </blockquote>
              {(item.author || item.role) && (
                <figcaption className="mt-auto flex items-center gap-3 pt-8">
                  <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-full bg-sage-soft font-serif text-lg text-forest">
                    {(item.author || "•").slice(0, 1)}
                  </span>
                  <span>
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
                  </span>
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
