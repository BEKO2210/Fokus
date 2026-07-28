/**
 * Warteschlange für Fokussitzungen, die ohne Netz beendet wurden.
 *
 * Die Uhr läuft rein im Browser — sie braucht keine Verbindung. Nur das
 * Protokollieren am Ende geht an den Server, und genau das fiel bisher
 * ersatzlos aus, wenn man in der Bahn saß. Die Sitzung landet jetzt lokal und
 * wird nachgereicht, sobald wieder Netz da ist.
 *
 * Bewusst nur Sitzungen: Projekte und Aufgaben offline zu bearbeiten würde
 * Konfliktauflösung brauchen. Eine abgeschlossene Sitzung ist dagegen ein
 * unveränderlicher Eintrag — sie kann nie mit etwas kollidieren.
 */
const KEY = "fokus.pending-sessions.v1";
const MAX_ENTRIES = 200;

export type PendingSession = {
  projectId: string | null;
  taskId: string | null;
  label: string | null;
  seconds: number;
  startedAt: string;
};

export function readPending(): PendingSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as PendingSession[]) : [];
  } catch {
    return [];
  }
}

function write(entries: PendingSession[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch {
    // Privater Modus oder volle Quote — dann geht die Sitzung eben verloren.
  }
}

export function enqueue(entry: PendingSession) {
  write([...readPending(), entry]);
}

export function clearPending() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* egal */
  }
}

export function replacePending(entries: PendingSession[]) {
  if (entries.length === 0) clearPending();
  else write(entries);
}
