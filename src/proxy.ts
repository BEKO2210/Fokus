import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Content-Security-Policy mit Einmal-Kennung pro Aufruf.
 *
 * Vorher stand die CSP fest in next.config.ts mit `script-src 'self'`. Das hat
 * die Inline-Scripts blockiert, in denen Next.js die Hydrations-Daten
 * mitliefert — die Seite sah vollständig aus, aber React ist nie angesprungen.
 * Damit war jede Interaktion tot: Timer, Bewertungsregler, Statuswechsel.
 *
 * Mit einer Nonce im Header versieht Next.js seine eigenen Scripts automatisch
 * mit derselben Kennung. `strict-dynamic` erlaubt diesen Scripts, die
 * zugehörigen Chunks nachzuladen.
 *
 * `style-src` behält bewusst 'unsafe-inline': React setzt Stile als
 * style-Attribut (Fortschrittsringe, Zifferblatt, Statuspunkte), und die deckt
 * keine Nonce ab. Eingeschleuste Stile sind ein weit kleineres Risiko als
 * eingeschleuster Code.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  // Selbst gehostete Statistik (cookielos). Das Script traegt die Nonce, die
  // Messpunkte gehen per fetch an dieselbe Herkunft — beides muss die CSP
  // ausdruecklich erlauben, sonst zaehlt Plausible lautlos nichts.
  const STATS_ORIGIN = "https://stats.it-handwerk-stuttgart.de";

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self' ${STATS_ORIGIN}`,
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  // Das Layout entscheidet daran, ob die Reichweitenmessung mitlaeuft — sie
  // gilt nur fuer die oeffentlichen Seiten, nie fuer das eingeloggte Konto.
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  // Statische Bauartefakte und Bilder brauchen keine Nonce und sollen nicht
  // bei jedem Abruf durch diese Funktion laufen.
  matcher: [
    {
      source: "/((?!_next/static|_next/image|icons|favicon.ico|sw.js|offline.html|og.png).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
