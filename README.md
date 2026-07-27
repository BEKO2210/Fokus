# Fokus — Projekt-Cockpit

Alle Projekte auf einen Blick: Status, Fortschritt, Deadlines und die eine Aufgabe,
die als Nächstes zählt. Installierbare PWA, mobile-first, Dark Neumorphism.

Live: https://fokus.it-handwerk-stuttgart.de

## Stack

| Schicht  | Technik                                                       |
| -------- | ------------------------------------------------------------- |
| Frontend | Next.js 16 (App Router, Turbopack), React 19, TypeScript       |
| Styling  | Tailwind CSS v4, neumorphes Token-Set in `src/app/globals.css` |
| Backend  | Appwrite 1.9.5 self-hosted, Projekt `fokus`                    |
| Auth     | Appwrite-SSR — Session-Secret im HttpOnly-Cookie `fokus_session` |
| Betrieb  | systemd-user-Service `fokus.service`, Port 3016, Cloudflare-Tunnel |

Es gibt bewusst **kein** Appwrite-SDK im Browser: alle Aufrufe laufen serverseitig über
`node-appwrite`, gelesen wird in Server Components, geschrieben über Server Actions.
Damit entfallen CORS- und Cross-Site-Cookie-Probleme, und im Browser liegt kein Token.

## Datenmodell

Datenbank `fokus`, drei Collections mit `documentSecurity: true`. Jedes Dokument bekommt
beim Anlegen `read/update/delete` nur für seinen Eigentümer — mehrere Nutzer teilen sich
die Instanz, sehen aber ausschließlich eigene Daten.

- **projects** — name, summary, status, health, deadline, stack[], repoUrl, liveUrl,
  localPath, port, pinned, sortIndex, notes, ownerId
- **tasks** — projectId, title, notes, impact, urgency, effort, confidence, status,
  dueDate, completedAt, ownerId
- **sessions** — Fokussitzungen: projectId, taskId, startedAt, seconds, label, ownerId

## Priorität

```
Score = (Wirkung × Dringlichkeit × Zuversicht) ÷ Aufwand
```

Wirkung, Dringlichkeit und Aufwand jeweils 1–5, Zuversicht 0–100 %. Wertebereich 0–25.
Stufen: ab 12 kritisch, ab 6 hoch, ab 2,5 mittel, darunter niedrig.
Implementierung in `src/lib/score.ts`.

## Entwicklung

```bash
npm install
npm run dev                 # http://localhost:3000
npm run build && npm start
```

`.env.local` (nicht im Repo):

```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://appwrite.it-handwerk-stuttgart.de/v1
NEXT_PUBLIC_APPWRITE_PROJECT=fokus
NEXT_PUBLIC_APPWRITE_DB=fokus
NEXT_PUBLIC_SITE_URL=https://fokus.it-handwerk-stuttgart.de
APPWRITE_API_KEY=…
```

Der API-Key wird nur für Registrierung und Login gebraucht — Appwrite verlangt dafür einen
Admin-Client. Nötige Scopes: `users.*`, `sessions.write`, `databases.*`, `collections.*`,
`attributes.*`, `indexes.*`, `documents.*`.

## Betrieb

```bash
systemctl --user status fokus       # Zustand
systemctl --user restart fokus      # nach einem Build neu starten
journalctl --user -u fokus -f       # Logs
```

## Daten mitnehmen

`Konto → Export herunterladen` liefert eine vollständige JSON-Kopie (`/api/export`).
Derselbe Export lässt sich unter `Konto → Import starten` wieder einspielen; der Import
legt zusätzliche Einträge an und überschreibt nie Vorhandenes.

## Design

Eine einzige Grundfläche (`#2b2c30`). Tiefe entsteht ausschließlich durch das Schattenpaar
`--nm-raise` (Licht oben links, Schatten unten rechts) und dessen Umkehrung `--nm-sink`.
Rahmen gibt es keine. Einziger Farbakzent ist der Orange-Verlauf `#ff9040 → #ef3f14`,
reserviert für die jeweils wichtigste Aktion im Bild.
