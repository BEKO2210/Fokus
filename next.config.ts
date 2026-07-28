import type { NextConfig } from "next";

/**
 * Sicherheitsheader für alle Antworten.
 *
 * Die Content-Security-Policy steht NICHT hier, sondern in `src/proxy.ts` —
 * sie braucht pro Aufruf eine frische Nonce, damit Next.js seine eigenen
 * Inline-Scripts signieren kann. Eine feste CSP an dieser Stelle hat die
 * Hydration lahmgelegt.
 */
const nextConfig: NextConfig = {
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Fremde Ziele bekommen nur die Herkunft, nie Pfad oder Query — das
          // Reset-Secret aus der Adresszeile bleibt also drin.
          // Kein `no-referrer`: das lässt den Browser `Origin: null` schicken
          // und Next.js lehnt dann jede Server Action als fremd ab.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-DNS-Prefetch-Control", value: "off" },
        ],
      },
    ];
  },
};

export default nextConfig;
