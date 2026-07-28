import "server-only";

import { headers } from "next/headers";

/**
 * Einfache Zählbremse im Arbeitsspeicher.
 *
 * Nötig, weil Login, Registrierung und Passwort-Reset über den Admin-Client
 * laufen — und Appwrite schaltet seine eigenen Abuse-Limits für Requests mit
 * API-Key ab. Ohne das hier wäre Passwort-Raten unbegrenzt möglich.
 *
 * Bewusst prozesslokal: Fokus läuft als eine Node-Instanz. Kommt je eine zweite
 * dazu, muss der Zähler nach Redis wandern. Ein Neustart setzt die Fenster
 * zurück — als erste Bremse reicht das, die zweite gehört als
 * Cloudflare-Regel vor die Anwendung.
 */
type Window = { count: number; resetAt: number };

const buckets = new Map<string, Window>();
let lastSweep = 0;

/** Abgelaufene Fenster wegräumen, damit die Map nicht unbegrenzt wächst. */
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, win] of buckets) {
    if (win.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

export function hit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true };
  }

  if (existing.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { ok: true };
}

/**
 * IP des Aufrufers. Hinter Cloudflare ist `cf-connecting-ip` die einzige
 * Angabe, die der Client nicht selbst setzen kann — `x-forwarded-for` wäre
 * fälschbar und taugt nur als Notnagel für den lokalen Betrieb.
 */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("cf-connecting-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unbekannt"
  );
}

export function minutes(seconds: number): string {
  if (seconds < 60) return `${seconds} Sekunden`;
  const m = Math.ceil(seconds / 60);
  return m === 1 ? "einer Minute" : `${m} Minuten`;
}
