import { FeatureIcon } from "../FeatureIcon";
import { BlockHeading, Section, type BlockComponentProps } from "./Section";

const COLUMNS = {
  "2": "md:grid-cols-2",
  "3": "md:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
} as const;

/**
 * Icon cards. Items with a text become tall numbered cards; title-only items (checklists such as
 * "Neden Okulum Yeryüzü?") become compact rows.
 */
export function FeaturesBlock({ props: p, style, primary, edit }: BlockComponentProps<"features">) {
  // Keep the original index for the editor path (items.2.title).
  const items = (p.items ?? []).map((item, index) => ({ ...item, index })).filter((item) => item.title || item.text);
  if (items.length === 0 && !p.title) return null;
  const ItemHeading = p.title || primary ? "h3" : "h2";
  const compact = items.every((item) => !item.text);
  return (
    <Section style={style} anchor={p.anchor}>
      <BlockHeading title={p.title} intro={p.intro} as={primary ? "h1" : "h2"} edit={edit} />
      <ul className={`reveal-children grid gap-5 ${compact ? "gap-4" : "md:gap-6"} ${COLUMNS[p.columns] ?? COLUMNS["3"]}`}>
        {items.map((item, i) =>
          compact ? (
            <li
              key={item.index}
              className="tone-light flex items-center gap-4 rounded-2xl bg-paper/80 px-5 py-4 shadow-(--shadow-soft) ring-1 ring-line/60 transition duration-500 ease-(--ease-out-soft) hover:-translate-y-0.5 hover:bg-paper"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sage-soft text-forest">
                <FeatureIcon icon={item.icon} className="h-6 w-6" />
              </span>
              <ItemHeading className="font-sans text-[1.05rem] font-bold leading-snug tracking-normal text-forest" {...edit.text(`items.${item.index}.title`)}>
                {item.title}
              </ItemHeading>
            </li>
          ) : (
            <li
              key={item.index}
              className="tone-light group relative flex flex-col overflow-hidden rounded-card bg-paper p-8 shadow-(--shadow-soft) ring-1 ring-line/60 transition duration-500 ease-(--ease-out-soft) hover:-translate-y-1.5 hover:shadow-(--shadow-lift) md:p-10"
            >
              <span aria-hidden="true" className="absolute right-7 top-6 font-serif text-5xl text-sage/70 italic">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-sage-soft text-forest transition duration-500 group-hover:rotate-[-6deg] group-hover:bg-ochre group-hover:text-forest-deep">
                <FeatureIcon icon={item.icon} className="h-9 w-9" />
              </span>
              {item.title && (
                <ItemHeading className="mt-8 text-[1.75rem] text-forest" {...edit.text(`items.${item.index}.title`)}>
                  {item.title}
                </ItemHeading>
              )}
              {item.text && (
                <p className="block-text mt-3 whitespace-pre-line leading-relaxed text-bark" {...edit.textarea(`items.${item.index}.text`)}>
                  {item.text}
                </p>
              )}
            </li>
          ),
        )}
      </ul>
    </Section>
  );
}
