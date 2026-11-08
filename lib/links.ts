/**
 * CMS links are site paths (`/programlar`, `/iletisim#form`, `#sss`) or full URLs.
 * Only http(s), mailto, tel and relative hrefs are allowed; anything else (javascript:, data:, …) is dropped.
 */
export function safeHref(href: string | null | undefined): string | null {
  const value = href?.trim();
  if (!value) return null;
  if (value.startsWith("#") || (value.startsWith("/") && !value.startsWith("//"))) return value;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) return value;
  return null;
}

/** Internal site path, handled by next/link. */
export function isInternal(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

export function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

/** Is `href` the current page (or a parent section of it)? */
export function isActive(href: string, pathname: string): boolean {
  if (!isInternal(href)) return false;
  const path = href.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  return path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);
}
