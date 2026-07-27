# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Wichtig für dieses Projekt (Next.js 16):

- `cookies()`, `headers()`, `params` und `searchParams` sind **async** — immer `await`.
- `middleware.ts` heißt jetzt `proxy.ts`. Dieses Projekt nutzt keine, Auth wird in den Layouts geprüft.
- Turbopack ist Standard.

## Projektregeln

- Kein Appwrite-Client-SDK im Browser. Lesen über Server Components, Schreiben über Server Actions
  (`src/lib/actions/`). Der Session-Secret liegt im HttpOnly-Cookie `fokus_session`.
- Jedes neue Dokument braucht Owner-Permissions (`Permission.read/update/delete(Role.user(id))`),
  sonst sehen andere Nutzer es nicht — oder alle.
- Optik: nur die Klassen aus `globals.css` (`nm-raise`, `nm-sink`, `nm-card`, `nm-accent`).
  Keine Rahmen, keine neuen Farben. Orange ist der Akzent für genau eine Aktion pro Bild.
- Nach Codeänderungen: `npm run build && systemctl --user restart fokus`.
