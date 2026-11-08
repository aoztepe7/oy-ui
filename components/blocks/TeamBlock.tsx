import { getTeam } from "@/lib/api";
import { MediaImage } from "../MediaImage";
import { SmartLink } from "../SmartLink";
import { TeamCard } from "../TeamCard";
import { BlockHeading, EmptyNote, Section, type BlockComponentProps } from "./Section";

/** `grid`: full team cards. `compact`: text on the left, round portraits on the right (home teaser). */
export async function TeamBlock({ props: p, style, primary, edit }: BlockComponentProps<"team">) {
  const limit = Number(p.limit) || 0;
  const team = (await getTeam()).slice(0, limit > 0 ? limit : undefined);
  const Heading = primary ? "h1" : "h2";

  if (p.layout === "compact") {
    if (team.length === 0) return null;
    return (
      <Section style={style} anchor={p.anchor}>
        <div className="grid items-center gap-10 md:grid-cols-[1fr_1.2fr]">
          <div>
            {p.title && (
              <Heading className="block-title text-4xl text-heading md:text-5xl" {...edit.text("title")}>
                {p.title}
              </Heading>
            )}
            {p.intro && (
              <p className="block-text mt-4 max-w-md whitespace-pre-line text-lg text-muted" {...edit.textarea("intro")}>
                {p.intro}
              </p>
            )}
            {p.linkText && p.linkHref && (
              <SmartLink href={p.linkHref} className="link mt-6 inline-block" {...edit.text("linkText")}>
                {p.linkText}
              </SmartLink>
            )}
          </div>
          <ul className="flex flex-wrap gap-6">
            {team.map((m) => (
              <li key={m.id} className="w-36">
                <div className="relative aspect-square overflow-hidden rounded-full ring-4 ring-paper">
                  <MediaImage src={m.photoUrl} alt={m.photoUrl ? m.fullName : ""} sizes="9rem" illustration="leaf" />
                </div>
                <p className="mt-3 font-serif text-lg leading-tight text-heading">{m.fullName}</p>
                <p className="text-sm text-muted">{m.title}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    );
  }

  return (
    <Section style={style} anchor={p.anchor}>
      <BlockHeading title={p.title} intro={p.intro} as={Heading} linkText={p.linkText} linkHref={p.linkHref} edit={edit} />
      {team.length > 0 ? (
        <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <li key={member.id}>
              <TeamCard member={member} headingLevel={p.title || primary ? "h3" : "h2"} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyNote>Ekibimizi yakında burada tanıtacağız.</EmptyNote>
      )}
    </Section>
  );
}
