import { FeatureIcon } from "../FeatureIcon";
import { BlockHeading, Section, type BlockComponentProps } from "./Section";

const COLUMNS = {
  "2": "md:grid-cols-2 md:gap-16",
  "3": "md:grid-cols-3 md:gap-12",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
} as const;

export function FeaturesBlock({ props: p, style, primary, edit }: BlockComponentProps<"features">) {
  // Keep the original index for the editor path (items.2.title).
  const items = (p.items ?? []).map((item, index) => ({ ...item, index })).filter((item) => item.title || item.text);
  if (items.length === 0 && !p.title) return null;
  const ItemHeading = p.title || primary ? "h3" : "h2";
  return (
    <Section style={style} anchor={p.anchor}>
      <BlockHeading title={p.title} intro={p.intro} as={primary ? "h1" : "h2"} edit={edit} />
      <ul className={`grid gap-10 ${COLUMNS[p.columns] ?? COLUMNS["3"]}`}>
        {items.map((item) => (
          <li key={item.index}>
            <FeatureIcon icon={item.icon} className="h-14 w-14 text-heading" />
            {item.title && (
              <ItemHeading className="mt-5 text-2xl text-heading" {...edit.text(`items.${item.index}.title`)}>
                {item.title}
              </ItemHeading>
            )}
            {item.text && (
              <p className="block-text mt-2 whitespace-pre-line text-muted" {...edit.textarea(`items.${item.index}.text`)}>
                {item.text}
              </p>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}
