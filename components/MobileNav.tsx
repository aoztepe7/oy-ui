"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isActive } from "@/lib/links";
import type { NavItem } from "@/lib/types";
import { SmartLink } from "./SmartLink";

export function MobileNav({ links, cta }: { links: NavItem[]; cta: { text: string; href: string } | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = () => setOpen(false);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (links.length === 0 && !cta) return null;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full text-heading hover:bg-sage-soft in-[.tone-dark]:hover:bg-paper/10"
      >
        <span className="sr-only">{open ? "Menüyü kapat" : "Menüyü aç"}</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h10" />}
        </svg>
      </button>
      {open && (
        <nav id="mobile-menu" aria-label="Mobil menü" className="tone-light absolute inset-x-0 top-full border-b border-line bg-paper shadow-lg">
          <ul className="container-page flex flex-col py-4">
            {links.map((link) => (
              <li key={`${link.href}-${link.label}`}>
                <SmartLink
                  href={link.href}
                  onClick={close}
                  aria-current={isActive(link.href, pathname) ? "page" : undefined}
                  className="block py-3 font-serif text-2xl text-forest aria-[current=page]:text-ochre-deep"
                >
                  {link.label}
                </SmartLink>
              </li>
            ))}
            {cta && (
              <li className="pt-4">
                <SmartLink href={cta.href} onClick={close} className="btn btn-forest w-full">
                  {cta.text}
                </SmartLink>
              </li>
            )}
          </ul>
        </nav>
      )}
    </div>
  );
}
