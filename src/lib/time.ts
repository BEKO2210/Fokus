/**
 * Alle Tagesgrenzen laufen über Europa/Berlin, nicht über die Serverzeit.
 *
 * Der Dienst läuft in UTC. Ohne diese Umrechnung würde eine Fokussitzung um
 * 00:30 Uhr deutscher Zeit im Diagramm auf den Vortag rutschen und "heute
 * erledigt" ginge um 1 bzw. 2 Uhr nachts auf null. Sommerzeit ist dabei
 * automatisch abgedeckt, weil die Zeitzonendatenbank sie kennt.
 */
export const APP_TIMEZONE = "Europe/Berlin";

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Kalendertag als "JJJJ-MM-TT" in deutscher Zeit. */
export function dayKey(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return dayFormatter.format(date);
}

/** Heutiger Kalendertag in deutscher Zeit. */
export function todayKey(): string {
  return dayKey(new Date());
}

/** Kalendertag um `offset` Tage verschoben, weiterhin in deutscher Zeit. */
export function shiftDayKey(key: string, offset: number): string {
  // Mittags rechnen, damit die Verschiebung nicht an einer Zeitumstellung hängen bleibt.
  const base = new Date(`${key}T12:00:00Z`);
  base.setUTCDate(base.getUTCDate() + offset);
  return base.toISOString().slice(0, 10);
}

/** Ganze Tage zwischen zwei Kalendertagen. Negativ heißt: liegt zurück. */
export function daysBetweenKeys(from: string, to: string): number {
  const a = Date.parse(`${from}T12:00:00Z`);
  const b = Date.parse(`${to}T12:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / 86_400_000);
}

const weekdayFormatter = new Intl.DateTimeFormat("de-DE", {
  timeZone: APP_TIMEZONE,
  weekday: "short",
});

/** "Mo", "Di", … für einen Kalendertag. */
export function weekdayLabel(key: string): string {
  return weekdayFormatter.format(new Date(`${key}T12:00:00Z`)).replace(".", "");
}
