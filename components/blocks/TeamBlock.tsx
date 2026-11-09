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
        <div className="grid items-center gap-14 md:grid-cols-[1fr_1.25fr]">
          <div>
            {p.title && (
              <Heading className="block-title text-[clamp(2.3rem,4.6vw,3.9rem)] text-heading" {...edit.text("title")}>
                {p.title}
              </Heading>
            )}
            {p.intro && (
              <p className="block-text mt-5 max-w-md whitespace-pre-line text-lg leading-relaxed text-muted" {...edit.textarea("intro")}>
                {p.intro}
              </p>
            )}
            {p.linkText && p.linkHref && (
              <SmartLink href={p.linkHref} className="link mt-8" {...edit.text("linkText")}>
                {p.linkText}
              </SmartLink>
            )}
          </div>
          <ul className="reveal-children flex flex-wrap justify-center gap-8 md:justify-start">
            {team.map((m, i) => (
              <li key={m.id} className={`group w-44 text-center md:w-52 ${i % 2 ? "md:mt-16" : ""}`}>
                <div className="zoom-img relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[2rem] shadow-(--shadow-lift) ring-[6px] ring-paper">
                  <MediaImage src={m.photoUrl} alt={m.photoUrl ? m.fullName : ""} sizes="13rem" illustration="leaf" />
                </div>
                <p className="mt-5 font-serif text-2xl leading-tight text-heading">{m.fullName}</p>
                <p className="mt-1 text-sm font-bold text-eyebrow">{m.title}</p>
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
