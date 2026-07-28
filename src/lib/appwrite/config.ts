export const APPWRITE = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  project: process.env.NEXT_PUBLIC_APPWRITE_PROJECT!,
  db: process.env.NEXT_PUBLIC_APPWRITE_DB || "fokus",
} as const;

export const COLLECTIONS = {
  projects: "projects",
  tasks: "tasks",
  sessions: "sessions",
} as const;

/** Name des HttpOnly-Cookies, in dem das Appwrite-Session-Secret liegt. */
export const SESSION_COOKIE = "fokus_session";

/** Wie lange eine Anmeldung hält. Steht so auch in der Datenschutzerklärung. */
export const SESSION_DAYS = 30;

/**
 * Eine einzige Stelle für die Cookie-Eigenschaften.
 *
 * Vorher standen sie doppelt — in `auth.ts` mit 30 Tagen, in `recovery.ts` mit
 * 365. Nach einem Passwort-Reset lief die Sitzung also ein Jahr statt einem
 * Monat, ohne dass es jemandem auffiel.
 */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * SESSION_DAYS,
} as const;
