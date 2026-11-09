import type { TeamMember } from "@/lib/types";
import { MediaImage } from "./MediaImage";

/** Portrait card: name and title sit on the photo; the bio follows below. */
export function TeamCard({ member, headingLevel = "h3" }: { member: TeamMember; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className="group">
      <div className="zoom-img relative aspect-[4/5] overflow-hidden rounded-[2.5rem_2.5rem_2.5rem_0.75rem] bg-sage-soft shadow-(--shadow-soft)">
        <MediaImage
          src={member.photoUrl}
          alt={member.photoUrl ? member.fullName : ""}
          sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 100vw"
          illustration="leaf"
        />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-forest-deep/85 via-forest-deep/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-paper">
          <Heading className="text-[1.9rem] leading-tight">{member.fullName}</Heading>
          <p className="mt-1 text-sm font-extrabold uppercase tracking-[0.14em] text-ochre">{member.title}</p>
        </div>
      </div>
      {member.bio && <p className="mt-5 leading-relaxed text-muted">{member.bio}</p>}
    </article>
  );
}
