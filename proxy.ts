import { NextResponse } from "next/server";
import { panelOrigins } from "./lib/panel";

/**
 * Only the visual editor preview may be framed, and only by the panel.
 * Set per request (not in next.config headers) so PANEL_ORIGINS is read at runtime:
 * one image works in every environment.
 */
export function proxy() {
  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", ["frame-ancestors 'self'", ...panelOrigins()].join(" "));
  return response;
}

export const config = {
  matcher: "/onizleme/:path*",
};
