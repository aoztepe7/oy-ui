import Image from "next/image";
import { Contours } from "./Contours";

type Illustration = "leaf" | "tree" | "mountain";

/**
 * Fills its (relatively positioned) parent with the image, or with a drawn
 * nature placeholder when the CMS left the image empty.
 */
export function MediaImage({
  src,
  alt,
  sizes,
  illustration = "tree",
  priority = false,
  className = "",
}: {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  illustration?: Illustration;
  priority?: boolean;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <div
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      className={`absolute inset-0 overflow-hidden bg-gradient-to-br from-sage-soft via-sage/60 to-sage ${className}`}
    >
      <Contours className="absolute inset-0 h-full w-full text-moss/40" rings={7} seed={illustration.length} />
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny local decorative SVG */}
      <img
        src={`/${illustration}.svg`}
        alt=""
        width={120}
        height={120}
        className="absolute left-1/2 top-1/2 w-1/4 max-w-32 min-w-16 -translate-x-1/2 -translate-y-1/2 opacity-80"
      />
    </div>
  );
}
