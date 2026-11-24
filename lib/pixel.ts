declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export type PixelEvent = "Lead" | "Contact" | "CompleteRegistration";

/** Sends a standard event if the pixel is loaded (consent given); otherwise a no-op. Never pass personal data. */
export function trackPixel(event: PixelEvent, params?: Record<string, string | number>) {
  window.fbq?.("track", event, params);
}
