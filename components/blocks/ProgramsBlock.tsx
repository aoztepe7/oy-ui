import { getPrograms } from "@/lib/api";
import type { ProgramSummary, ProgramType, ProgramTypeFilter } from "@/lib/types";
import { ProgramCard } from "../ProgramCard";
import { ProgramFilters } from "../ProgramFilters";
import { ProgramGrid } from "../ProgramGrid";
import { ProgramSlider } from "../ProgramSlider";
import { BlockHeading, EmptyNote, Section, type BlockComponentProps } from "./Section";

const ALL_TYPES: ProgramType[] = ["WeeklyClass", "Camp", "Event", "Workshop"];
const EVENT_TYPES: ProgramType[] = ["Camp", "Event", "Workshop"];

function typesOf(filter: ProgramTypeFilter): ProgramType[] {
  if (filter === "all") return ALL_TYPES;
  if (filter === "events") return EVENT_TYPES;
  return ALL_TYPES.includes(filter) ? [filter] : ALL_TYPES;
}

/**
 * Filter by type, then by start date; apply the limit. With `featuredFirst`, the showcase (vitrin) programs come
 * first in their set order and are shown whatever their type — featuring a program in the panel is an explicit
 * choice that must not be hidden by the block's type filter (e.g. a weekly class in the "events" home slider).
 */
export function selectPrograms(
  programs: ProgramSummary[],
  opts: { types: ProgramType[]; featuredFirst: boolean; limit: number },
): ProgramSummary[] {
  const byDate = [...programs].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const ofType = byDate.filter((p) => opts.types.includes(p.type));
  const ordered = opts.featuredFirst
    ? [
        ...byDate.filter((p) => p.featuredOrder != null).sort((a, b) => a.featuredOrder! - b.featuredOrder!),
        ...ofType.filter((p) => p.featuredOrder == null),
      ]
    : ofType;
  const limit = Number(opts.limit) || 0;
  return limit > 0 ? ordered.slice(0, limit) : ordered;
}

export async function ProgramsBlock({ props: p, style, primary, edit }: BlockComponentProps<"programs">) {
  const types = typesOf(p.programType);
  const programs = selectPrograms(await getPrograms(), { types, featuredFirst: p.featuredFirst, limit: p.limit });
  const cardHeading = p.title || primary ? "h3" : "h2";
  const label = p.title || "Programlar";
  const cards = programs.map((program) => <ProgramCard key={program.id} program={program} headingLevel={cardHeading} />);

  let list: React.ReactNode;
  if (programs.length === 0) list = <EmptyNote>{p.emptyText || "Yeni programlarımız çok yakında burada olacak."}</EmptyNote>;
  else if (p.showFilters)
    list = (
      <ProgramFilters
        items={programs.map(({ type, ageMin, ageMax }) => ({ type, ageMin, ageMax }))}
        types={ALL_TYPES.filter((t) => types.includes(t) || programs.some((x) => x.type === t))}
        layout={p.layout}
        label={label}
      >
        {cards}
      </ProgramFilters>
    );
  else if (p.layout === "slider") list = <ProgramSlider label={label}>{cards}</ProgramSlider>;
  else list = <ProgramGrid>{cards}</ProgramGrid>;

  return (
    <Section style={style} anchor={p.anchor}>
      <BlockHeading title={p.title} intro={p.intro} as={primary ? "h1" : "h2"} linkText={p.linkText} linkHref={p.linkHref} edit={edit} />
      {list}
    </Section>
  );
}
