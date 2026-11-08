import { notFound } from "next/navigation";

// Unknown multi-segment URLs (e.g. /a/b) 404 inside the (site) layout, so the 404 page keeps the
// site header and footer. Nothing is prerendered; each 404 is cached after its first request.

export function generateStaticParams() {
  return [];
}

export default function UnknownPage() {
  notFound();
}
