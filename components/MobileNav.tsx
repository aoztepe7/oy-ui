"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isActive } from "@/lib/links";
import type { NavItem } from "@/lib/types";
import { SmartLink } from "./SmartLink";

/** Full-screen mobile menu with large serif links. */
export function MobileNav({ links, cta }: { links: NavItem[]; cta: { text: string; href: string } | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = () => setOpen(false);

  // Close on Escape; lock page scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  if (links.length === 0 && !cta) return null;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="relative z-50 inline-flex h-11 w-11 items-center justify-center rounded-full text-heading ring-1 ring-current/15 hover:bg-sage-soft in-[.tone-dark]:hover:bg-paper/10"
      >
        <span className="sr-only">{open ? "Menüyü kapat" : "Menüyü aç"}</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h10" />}
        </svg>
      </button>
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobil menü"
          className="tone-light fixed inset-x-0 top-20 bottom-0 z-40 overflow-y-auto bg-sand/97 backdrop-blur-xl animate-rise"
        >
          <ul className="container-page flex flex-col gap-1 py-8">
            {links.map((link, i) => (
              <li key={`${link.href}-${link.label}`} className="animate-rise" style={{ animationDelay: `${60 + i * 45}ms` }}>
                <SmartLink
                  href={link.href}
                  onClick={close}
                  aria-current={isActive(link.href, pathname) ? "page" : undefined}
                  className="flex items-baseline justify-between border-b border-line/70 py-4 font-serif text-[2rem] leading-tight text-forest aria-[current=page]:text-ochre-deep"
                >
                  {link.label}
                  <span aria-hidden="true" className="font-sans text-base text-moss">
                    →
                  </span>
                </SmartLink>
              </li>
            ))}
            {cta && (
              <li className="pt-8">
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
