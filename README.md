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
| E-Mail   | Brevo (Sendinblue SAS, Frankreich) für Bestätigungs- und Passwort-Links |
| Betrieb  | systemd-user-Service `fokus.service`, Port 3016, Cloudflare-Tunnel |
| Tests    | Playwright gegen eine echte Instanz, `npm test`                     |

Es gibt bewusst **kein** Appwrite-SDK im Browser: alle Aufrufe laufen serverseitig über
`node-appwrite`, gelesen wird in Server Components, geschrieben über Server Actions.
Damit entfallen CORS- und Cross-Site-Cookie-Probleme, und im Browser liegt kein Token.

## Datenmodell

Datenbank `fokus`, drei Collections mit `documentSecurity: true`. Jedes Dokument bekommt
beim Anlegen `read/update/delete` nur für seinen Eigentümer — mehrere Nutzer teilen sich
die Instanz, sehen aber ausschließlich eigene Daten.

- **projects** — name, summary, status, health, deadline, tags[], links[], place,
  pinned, sortIndex, notes, ownerId
- **tasks** — projectId, title, notes, impact, urgency, effort, confidence, status,
  dueDate, completedAt, ownerId
- **sessions** — Fokussitzungen: projectId, taskId, startedAt, seconds, label, ownerId

## Priorität

```
Score = (Wirkung × Dringlichkeit × Zuversicht) ÷ Aufwand
```

In der Oberfläche heißen die vier Faktoren **Bringt viel**, **Eilt**,
**Kostet Kraft** und **Wie sicher bist du dir** — Fokus richtet sich an Menschen
mit vielen Projekten, nicht an Berater. Neben jeder Zahl steht ein „Warum?“, das
die Bewertung in Worte übersetzt.

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

MAIL_PROVIDER=brevo
BREVO_API_KEY=…
MAIL_FROM=belkis.aslani@gmail.com
MAIL_FROM_NAME=Fokus
```

`MAIL_PROVIDER=agentmail` schaltet auf AgentMail um (`AGENTMAIL_API_KEY`,
`AGENTMAIL_INBOX`). Standard ist Brevo: EU-Anbieter mit öffentlichem
Auftragsverarbeitungsvertrag — AgentMail veröffentlicht keinen, was für einen
Dienst mit fremden Nutzerdaten keine tragfähige Grundlage ist.

Der API-Key wird nur für Registrierung, Login und das Zurücksetzen von Passwörtern gebraucht —
Appwrite verlangt dafür einen Admin-Client. Nötige Scopes: `users.*`, `sessions.write`,
`databases.*`, `collections.*`, `attributes.*`, `indexes.*`, `documents.*`.

## Passwort zurücksetzen

Appwrites eingebaute Recovery-Mail setzt SMTP am Projekt voraus. Statt das zu
konfigurieren, verschickt Fokus die Mail selbst:

1. `/passwort-vergessen` → `users.createToken()` erzeugt ein Einmal-Geheimnis (1 Stunde gültig),
   der Link geht per Mail raus. Die Antwort ist immer gleich, damit das Formular nicht
   verrät, welche Adressen registriert sind.
2. `/passwort-neu` → `account.createSession()` löst den Token ein und entwertet ihn. Erst danach
   setzt `users.updatePassword()` das neue Passwort, ohne das alte zu kennen.
3. Appwrite beendet bei jedem Passwortwechsel **alle** Sessions. Deshalb meldet der Server
   direkt danach mit dem neuen Passwort neu an — sonst landet man trotz Erfolg wieder im Login.

## Seiten

| Pfad | Zweck |
| ---- | ----- |
| `/` | öffentliche Startseite, erklärt das Produkt vor der Anmeldung |
| `/uebersicht` | Dashboard (Startpunkt der installierten App) |
| `/fokus` | Timer und Aufgabenwahl |
| `/projekt/[id]` | Projekt mit Aufgabenliste |
| `/einstellungen` | Konto, Export, Import, Löschung |
| `/impressum`, `/datenschutz` | ohne Anmeldung erreichbar |
| `/stil` | Baukasten, nur mit `SHOW_STYLE_GUIDE=1` |

## Tests

```bash
npm test          # startet eine eigene Instanz auf Port 3017 und prüft dagegen
npm run test:live # gegen die Live-Instanz
```

Die Tests laufen gegen ein echtes Appwrite und legen echte Konten an, die sie
danach wieder entfernen. Abgedeckt sind der komplette Weg von der Registrierung
bis zum Export sowie die Sicherheitsannahmen: Konto B darf Projekte von Konto A
weder sehen noch ändern, geschützte Seiten leiten ohne Anmeldung um, der
Passwort-Reset verrät keine Adressen, die Sicherheitsheader stehen, jedes
Inline-Script trägt eine Nonce, alle Seiten hydrieren und nichts läuft auf dem
Handy waagerecht über.

Die Ratenbremse würde einen Testlauf blockieren — das soll sie. Deshalb startet
Playwright eine eigene Instanz mit `FOKUS_RATE_LIMIT_MULTIPLIER`; die
Produktivinstanz kennt die Variable nicht und bleibt streng.

## Offline

Die Uhr läuft vollständig im Browser und übersteht Seitenwechsel und Neuladen.
Wird eine Sitzung ohne Netz beendet, landet sie in `localStorage` und wird
nachgetragen, sobald die Verbindung zurück ist. Projekte und Aufgaben brauchen
weiterhin eine Verbindung — sie offline zu bearbeiten würde
Konfliktauflösung erfordern, während eine abgeschlossene Sitzung ein
unveränderlicher Eintrag ist und nie kollidieren kann.

Der Service Worker cacht bewusst **keine** Seiten und keine Projektdaten, nur
Programmdateien und Symbole. So kann er niemandem veraltete oder fremde Inhalte
zeigen.

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
Rahmen gibt es keine. Einziger Farbakzent ist der Orange-Verlauf `#ff9040 → #f2501c`,
reserviert für die jeweils wichtigste Aktion im Bild. Darauf steht **dunkle**
Schrift: Weiß erreicht auf diesem Orange nur 2,3:1 bis 3,9:1 und verfehlt damit
WCAG AA, dunkle Schrift kommt auf 4,8:1 bis 7,5:1.
