"use client";

import { useEffect, useState } from "react";

/**
 * Kontaktadresse, die erst im Browser zusammengesetzt wird.
 *
 * Cloudflares Email-Obfuscation schreibt jedes `mailto:` im ausgelieferten HTML
 * in einen `/cdn-cgi/l/email-protection`-Link um und braucht zum Entschlüsseln
 * ein eigenes Script. Das trägt keine Nonce und wird von unserer CSP blockiert —
 * der Link lief dadurch auf eine 404-Seite.
 *
 * Weil die Adresse hier aus zwei Teilen erst nach dem Laden entsteht, findet
 * Cloudflare nichts zum Umschreiben. Nebeneffekt: einfache Adress-Sammler
 * gehen ebenfalls leer aus.
 */
export function MailLink({
  user,
  domain,
  className,
  children,
}: {
  user: string;
  domain: string;
  className?: string;
  /** Sichtbarer Text. Ohne Angabe wird die Adresse selbst gezeigt. */
  children?: React.ReactNode;
}) {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    setAddress(`${user}@${domain}`);
  }, [user, domain]);

  if (!address) {
    // Ohne JavaScript bleibt die Adresse vollständig lesbar — für ein Impressum
    // ist eine Schreibweise wie "name [at] domain" rechtlich zu wackelig.
    // Die Aufteilung auf mehrere Elemente verhindert, dass Cloudflare sie als
    // Adresse erkennt und in einen /cdn-cgi-Link umschreibt.
    return (
      <span className={className}>
        {children ?? (
          <>
            <span>{user}</span>
            <span>@</span>
            <span>{domain}</span>
          </>
        )}
      </span>
    );
  }

  return (
    <a href={`mailto:${address}`} className={className}>
      {children ?? address}
    </a>
  );
}
