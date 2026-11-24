"use client";

import Link from "next/link";
import { setConsent } from "@/lib/consent";

/** Asks for consent to Meta (Facebook/Instagram) cookies. Declining is as easy as accepting (KVKK). */
export function CookieConsent() {
  return (
    <div role="region" aria-label="Çerez tercihleri" className="fixed inset-x-0 bottom-0 z-50 bg-forest-deep text-white shadow-2xl">
      <div className="container-page flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed">
          Reklamlarımızın etkisini ölçmek için, onay verirseniz Meta (Facebook/Instagram) çerezlerini kullanırız. Ayrıntılar:{" "}
          <Link href="/gizlilik" className="underline">
            Gizlilik Politikası
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button type="button" className="btn btn-ghost" onClick={() => setConsent("denied")}>
            Reddet
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setConsent("granted")}>
            Kabul et
          </button>
        </div>
      </div>
    </div>
  );
}
