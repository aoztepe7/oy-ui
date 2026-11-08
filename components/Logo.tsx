import Link from "next/link";

/** Site logo; its colour follows the surrounding tone (forest on light, paper on dark surfaces). */
export function Logo({ name }: { name: string }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 text-heading" aria-label={`${name} ana sayfa`}>
      <svg aria-hidden="true" viewBox="0 0 64 64" className="h-9 w-9 shrink-0">
        <path d="M14 50C13 29 25 14 52 11c2 25-12 40-38 39z" fill="var(--color-ochre)" />
        <path d="M14 50c11-12 20-21 30-31" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      </svg>
      <span className="font-serif text-xl font-semibold tracking-tight">{name}</span>
    </Link>
  );
}
