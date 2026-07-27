/**
 * Die Fokus-Marke: drei konzentrische Ringe, die sich oben rechts oeffnen,
 * mit einem massiven Punkt in der Mitte. Blende und Zielscheibe zugleich —
 * "eine Sache scharf stellen".
 *
 * Bewusst als Inline-SVG: skaliert verlustfrei, laedt keine Datei nach und
 * kann den Verlauf gegen `currentColor` tauschen (Variante "mono").
 */
export function Logo({
  className = "h-8 w-8",
  variant = "gradient",
  /** Unter etwa 40 px zerfaellt der Dreiring — dann die reduzierte Fassung nehmen. */
  compact = false,
  id = "fokus-mark",
}: {
  className?: string;
  variant?: "gradient" | "mono";
  compact?: boolean;
  id?: string;
}) {
  const paint = variant === "mono" ? "currentColor" : `url(#${id}-grad)`;

  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Fokus">
      {variant === "gradient" ? (
        <defs>
          <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff9040" />
            <stop offset="100%" stopColor="#ef3f14" />
          </linearGradient>
        </defs>
      ) : null}

      {compact ? (
        <>
          <g fill="none" stroke={paint} strokeWidth="7.5" strokeLinecap="round">
            <circle cx="32" cy="32" r="25" pathLength="100" strokeDasharray="85 15" transform="rotate(-4 32 32)" />
            <circle cx="32" cy="32" r="13.5" pathLength="100" strokeDasharray="82 18" transform="rotate(6 32 32)" />
          </g>
          <circle cx="32" cy="32" r="4.6" fill={paint} />
        </>
      ) : (
        <>
          {/* Die Ringe oeffnen sich leicht versetzt — das ergibt den diagonalen Schnitt. */}
          <g fill="none" stroke={paint} strokeWidth="4.6" strokeLinecap="round">
            <circle cx="32" cy="32" r="27" pathLength="100" strokeDasharray="87 13" transform="rotate(-4 32 32)" />
            <circle cx="32" cy="32" r="19" pathLength="100" strokeDasharray="85 15" transform="rotate(2 32 32)" />
            <circle cx="32" cy="32" r="11" pathLength="100" strokeDasharray="83 17" transform="rotate(8 32 32)" />
          </g>
          <circle cx="32" cy="32" r="5.4" fill={paint} />
        </>
      )}
    </svg>
  );
}

/** Marke plus Wortmarke, fuer Kopfbereiche und das OG-Bild. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Logo className="h-9 w-9" id="fokus-wordmark" />
      <span className="display text-2xl tracking-tight text-ink">Fokus</span>
    </span>
  );
}
