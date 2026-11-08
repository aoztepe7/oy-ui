import type { FeatureIcon as Icon } from "@/lib/types";

/** Line icons in the style of /public/*.svg; stroke follows the text colour so they work on forest too. */
const PATHS: Record<Icon, React.ReactNode> = {
  leaf: (
    <>
      <path d="M24 98C22 58 46 26 98 20c4 50-24 80-74 78z" />
      <path d="M24 98C46 74 64 56 84 36" />
      <path d="M44 76l-2-18M56 64l-1-17M68 52l1-13M44 76l17 0M56 64l17-1M68 52l13-2" />
    </>
  ),
  tree: (
    <>
      <path d="M60 14L30 58h14L24 86h72L76 58h14z" />
      <path d="M60 86v20M48 106h24" />
      <path d="M60 40v34M60 56l-8-6M60 66l9-7" />
    </>
  ),
  mountain: (
    <>
      <path d="M8 96l38-50 16 20 12-14 38 44z" />
      <path d="M36 60l10 6 8-8 6 8" />
      <circle cx="92" cy="30" r="8" />
      <path d="M8 104h104" />
    </>
  ),
  sun: (
    <>
      <circle cx="60" cy="60" r="20" />
      <path d="M60 16v14M60 90v14M16 60h14M90 60h14M29 29l10 10M81 81l10 10M29 91l10-10M81 39l10-10" />
    </>
  ),
  water: (
    <>
      <path d="M60 14C47 36 36 51 36 66a24 24 0 0 0 48 0c0-15-11-30-24-52z" />
      <path d="M48 70a12 12 0 0 0 12 12" />
      <path d="M14 104c8-5 16-5 23 0s15 5 23 0 15-5 23 0 15 5 23 0" />
    </>
  ),
  fire: (
    <>
      <path d="M60 14c4 18 22 28 22 48a22 22 0 0 1-44 0c0-12 5-19 11-25 0 10 4 15 9 17-3-13 0-26 2-40z" />
      <path d="M26 104l68-16M26 88l68 16" />
    </>
  ),
  compass: (
    <>
      <circle cx="60" cy="60" r="40" />
      <path d="M75 45l-9 21-21 9 9-21z" />
      <path d="M60 12v8M60 100v8M12 60h8M100 60h8" />
    </>
  ),
  heart: <path d="M60 100C30 80 16 63 16 45a21 21 0 0 1 44-9 21 21 0 0 1 44 9c0 18-14 35-44 55z" />,
};

export function FeatureIcon({ icon, className = "" }: { icon: Icon; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {PATHS[icon] ?? PATHS.leaf}
    </svg>
  );
}
