import type { NextConfig } from "next";

/**
 * Sicherheitsheader für alle Antworten.
 *
 * Die CSP ist bewusst eng: Die App lädt keine fremden Skripte, Schriften oder
 * Bilder — alles kommt vom eigenen Server. `unsafe-inline` bleibt bei Styles
 * nötig, weil React Inline-Styles setzt; bei Skripten nicht.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
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
