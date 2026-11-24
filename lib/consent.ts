/** Cookie consent for ad tracking, kept in the visitor's browser only. */
export type Consent = "granted" | "denied";

export const CONSENT_KEY = "oy-cookie-consent";
const CHANGE_EVENT = "oy-consent-change";

/** The stored decision; null when the visitor has not decided yet (or on the server). */
export function getConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: Consent) {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Storage blocked: the decision only lasts until the event below is handled.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function clearConsent() {
  try {
    window.localStorage.removeItem(CONSENT_KEY);
  } catch {
    // Nothing stored.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** For `useSyncExternalStore`. */
export function subscribeConsent(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}
