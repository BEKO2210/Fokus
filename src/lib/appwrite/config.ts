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
