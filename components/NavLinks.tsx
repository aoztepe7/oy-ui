"use client";

import { usePathname } from "next/navigation";
import { isActive } from "@/lib/links";
import type { NavItem } from "@/lib/types";
import { SmartLink } from "./SmartLink";

/** Desktop header menu; the current page gets a small ochre leaf marker. */
export function NavLinks({ links }: { links: NavItem[] }) {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-1 text-[0.95rem] font-bold">
      {links.map((link) => (
        <li key={`${link.href}-${link.label}`}>
          <SmartLink
            href={link.href}
            aria-current={isActive(link.href, pathname) ? "page" : undefined}
            className="relative rounded-full px-3.5 py-2 text-heading/85 transition-colors hover:bg-forest/[0.06] hover:text-heading aria-[current=page]:text-heading after:absolute after:bottom-0 after:left-1/2 after:h-1.5 after:w-1.5 after:-translate-x-1/2 after:rotate-45 after:rounded-[0_60%_0_60%] after:bg-ochre after:opacity-0 after:transition-opacity aria-[current=page]:after:opacity-100 in-[.tone-dark]:hover:bg-paper/10"
          >
            {link.label}
          </SmartLink>
        </li>
      ))}
    </ul>
  );
}
