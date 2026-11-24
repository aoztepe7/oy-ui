"use client";

import { clearConsent, getConsent } from "@/lib/consent";

/** Lets a visitor take back or change the cookie decision (the banner opens again). */
export function CookiePreferencesButton() {
  const reset = () => {
    const wasGranted = getConsent() === "granted";
    if (wasGranted) window.fbq?.("consent", "revoke");
    clearConsent();
    // A loaded script cannot be unloaded.
    if (wasGranted) window.location.reload();
  };
  return (
    <button type="button" onClick={reset} className="font-semibold underline">
      Çerez tercihlerimi değiştir
    </button>
  );
}
