"use client";

import { usePathname } from "next/navigation";
import { isActive } from "@/lib/links";
import type { NavItem } from "@/lib/types";
import { SmartLink } from "./SmartLink";

/** Desktop header menu with the current page marked (aria-current). */
export function NavLinks({ links }: { links: NavItem[] }) {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-7 text-[0.95rem] font-semibold">
      {links.map((link) => (
        <li key={`${link.href}-${link.label}`}>
          <SmartLink
            href={link.href}
            aria-current={isActive(link.href, pathname) ? "page" : undefined}
            className="py-2 hover:text-eyebrow aria-[current=page]:text-eyebrow aria-[current=page]:underline aria-[current=page]:decoration-(--tone-underline) aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8"
          >
            {link.label}
          </SmartLink>
        </li>
      ))}
    </ul>
  );
}
