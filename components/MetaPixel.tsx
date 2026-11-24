"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { getConsent, subscribeConsent } from "@/lib/consent";
import { CookieConsent } from "./CookieConsent";

const PIXEL_ID = /^\d{10,20}$/;

/** Meta's standard base code (loads fbevents.js). */
const BASE_CODE = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');`;

/**
 * Meta Pixel for ads on Instagram/Facebook. Loads only after the visitor accepted the cookie banner;
 * until they decide the banner is shown. The server snapshot is `undefined` so nothing flashes while hydrating.
 */
export function MetaPixel({ pixelId }: { pixelId: string }) {
  const consent = useSyncExternalStore(subscribeConsent, getConsent, () => undefined);
  const pathname = usePathname();
  const first = useRef(true);

  // The base code sends the first PageView; later client-side navigations send their own.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [pathname]);

  if (!PIXEL_ID.test(pixelId)) return null;
  if (consent === undefined || consent === "denied") return null;
  if (consent === null) return <CookieConsent />;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`${BASE_CODE}fbq('init', ${JSON.stringify(pixelId)});fbq('track', 'PageView');`}
    </Script>
  );
}
