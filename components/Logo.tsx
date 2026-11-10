import Image from "next/image";
import Link from "next/link";

/** Brand wreath + serif wordmark; the wordmark colour follows the surrounding tone. */
export function Logo({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  const mark = size === "lg" ? "h-20 w-[5.8rem]" : "h-14 w-16";
  return (
    <Link href="/" className="group inline-flex items-center gap-3 text-heading" aria-label={`${name} ana sayfa`}>
      <span className={`relative shrink-0 transition-transform duration-700 ease-(--ease-out-soft) group-hover:rotate-[-8deg] ${mark}`}>
        <Image src="/logo-wreath.png" alt="" fill sizes="96px" className="object-contain" priority />
      </span>
      <span className="font-serif text-[1.35rem] font-semibold leading-none tracking-tight">{name}</span>
    </Link>
  );
}
