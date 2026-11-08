import type { TeamMember } from "@/lib/types";
import { MediaImage } from "./MediaImage";

export function TeamCard({ member, headingLevel = "h3" }: { member: TeamMember; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem_2rem_2rem_0.5rem] bg-sage-soft">
        <MediaImage
          src={member.photoUrl}
          alt={member.photoUrl ? member.fullName : ""}
          sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 100vw"
          illustration="leaf"
        />
      </div>
      <Heading className="mt-5 text-2xl text-heading">{member.fullName}</Heading>
      <p className="font-semibold text-accent">{member.title}</p>
      {member.bio && <p className="mt-3 text-muted">{member.bio}</p>}
    </article>
  );
}
