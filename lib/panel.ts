// Shared by proxy.ts (frame-ancestors header) and the preview page (postMessage origin check); both read it at runtime.
// Keep this file free of imports.

const DEFAULT_PANEL_ORIGINS = "http://localhost:3001,http://localhost:5173";

/** Admin panel origins allowed to embed /onizleme and talk to it: `PANEL_ORIGINS`, comma separated. */
export function panelOrigins(raw: string | undefined = process.env.PANEL_ORIGINS): string[] {
  const origins = new Set<string>();
  for (const value of (raw || DEFAULT_PANEL_ORIGINS).split(",")) {
    try {
      const url = new URL(value.trim());
      if (url.protocol === "http:" || url.protocol === "https:") origins.add(url.origin);
    } catch {
      // ignore malformed entries
    }
  }
  return [...origins];
}
