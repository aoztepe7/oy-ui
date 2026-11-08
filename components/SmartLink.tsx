import Link from "next/link";
import { isExternal, isInternal, safeHref } from "@/lib/links";

/**
 * Link for CMS-provided hrefs: site paths use next/link, external URLs open in a new tab,
 * mailto/tel/#anchor are plain anchors. Unsafe or empty hrefs render the children as text.
 */
export function SmartLink({
  href,
  className,
  children,
  ...rest
}: { href: string; className?: string; children: React.ReactNode } & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
>) {
  const safe = safeHref(href);
  if (!safe) return <>{children}</>;
  if (isInternal(safe)) {
    return (
      <Link href={safe} className={className} {...rest}>
        {children}
      </Link>
    );
  }
  const external = isExternal(safe) ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <a href={safe} className={className} {...external} {...rest}>
      {children}
    </a>
  );
}
