import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Icon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { MailLink } from "@/components/mail-link";
import { MomentumDial } from "@/components/momentum-dial";
import { Chip, ProgressRing } from "@/components/ui/bits";
import { getUser } from "@/lib/appwrite/server";

// Die CSP vergibt pro Aufruf eine Nonce; eine zur Bauzeit erzeugte Seite würde
// deshalb nicht hydrieren.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fokus — Viele Projekte. Eine nächste Aufgabe.",
  description:
    "Fokus sortiert alle deine Aufgaben projektübergreifend und sagt dir, welche jetzt zählt. Kostenlos, ohne Werbung, ohne Tracking.",
  robots: { index: true, follow: true },
};

/** Beispielkarte für die Vorschau — bewusst kein Link, damit nichts ins Leere führt. */
function DemoCard({
  name,
  progress,
  done,
  total,
  health,
  next,
  chips,
}: {
  name: string;
  progress: number;
  done: number;
  total: number;
  health: { label: string; color: string };
  next: string;
  chips: string[];
}) {
  return (
    <div className="nm-card p-5">
      <div className="flex items-start gap-4">
        <ProgressRing value={progress} size={54} stroke={6}>
          <span className="tnum text-[0.8rem] font-bold text-ink">{progress}</span>
        </ProgressRing>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[1.05rem] font-bold leading-tight text-ink">{name}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-dim">
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: health.color, boxShadow: `0 0 10px ${health.color}` }}
              />
              {health.label}
            </span>
            <span aria-hidden>·</span>
            <span className="tnum">
              {done}/{total} Aufgaben
            </span>
          </div>
        </div>
      </div>
      <p className="mt-4 flex items-start gap-2 text-sm leading-snug text-ink-soft">
        <Icon.Chevron className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
        <span>{next}</span>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((c) => (
          <Chip key={c}>{c}</Chip>
        ))}
      </div>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="nm-card p-6">
      <div className="nm-sink-sm mb-4 grid h-10 w-10 place-items-center rounded-2xl">
        <span className="tnum text-sm font-bold text-accent">{n}</span>
      </div>
      <h3 className="text-base font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}

export default async function LandingPage() {
  const user = await getUser();
  if (user) redirect("/uebersicht");

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-5 py-10">
        <header className="mb-16 flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-3">
            <Logo className="h-9 w-9" id="landing-mark" />
            <span className="display text-xl text-ink">Fokus</span>
          </span>
          <Link
            href="/anmelden"
            className="nm-raise nm-press inline-flex h-11 items-center rounded-full px-5 text-sm font-medium text-ink"
          >
            Anmelden
          </Link>
        </header>

        {/* Aufhänger */}
        <section className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-center lg:gap-12">
          <div>
            <h1 className="display text-[2.9rem] leading-[0.98] text-ink sm:text-[3.6rem]">
              Viele Projekte.
              <br />
              <span className="text-accent-gradient">Eine nächste Aufgabe.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
              Wenn zwölf Dinge gleichzeitig offen sind, kostet schon die Entscheidung
              Kraft, womit man anfängt. Fokus nimmt dir genau diese Entscheidung ab:
              Es bewertet alle Aufgaben über alle Projekte hinweg und zeigt dir die eine,
              die jetzt zählt.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/registrieren"
                className="nm-accent nm-press inline-flex h-14 items-center justify-center rounded-full px-8 text-base font-semibold"
              >
                Kostenlos starten
              </Link>
              <a
                href="#so-gehts"
                className="inline-flex h-14 items-center justify-center rounded-full px-6 text-sm text-ink-soft hover:text-ink"
              >
                Erst ansehen, wie es funktioniert
              </a>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-ink-dim">
              Kostenlos · keine Werbung · im Konto keine Auswertung · deine Daten jederzeit
              als Datei exportierbar
            </p>
          </div>

          <div className="mt-14 lg:mt-0">
            <MomentumDial
              value="12"
              unit="offen"
              caption="4 aktive Projekte"
              satellites={[
                { icon: <Icon.Flame className="h-4 w-4" />, label: "brauchen Hilfe", value: "1", hot: true },
                { icon: <Icon.Calendar className="h-4 w-4" />, label: "diese Woche fällig", value: "2" },
                { icon: <Icon.Bolt className="h-4 w-4" />, label: "laufen gerade", value: "4" },
                { icon: <Icon.Check className="h-4 w-4" />, label: "heute geschafft", value: "3" },
              ]}
            />
          </div>
        </section>

        {/* Das Herzstück */}
        <section id="so-gehts" className="mt-28 scroll-mt-8">
          <p className="label-xs">Das Herzstück</p>
          <h2 className="display mt-3 text-[2.1rem] text-ink">
            Warum ausgerechnet
            <br />
            diese Aufgabe?
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-ink-soft">
            Für jede Aufgabe schätzt du vier Dinge — grob, aus dem Bauch. Daraus entsteht
            eine Reihenfolge. Nicht die App entscheidet, sondern dein eigenes Urteil,
            nur eben konsequent angewendet statt jedes Mal neu zerdacht.
          </p>

          <div className="nm-card mt-8 p-6">
            <p className="text-sm text-ink-soft">Beispiel aus einem echten Konto:</p>
            <h3 className="mt-3 text-xl font-bold leading-snug text-ink">
              Angebot für die Küche einholen
            </h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              {[
                ["Bringt viel", "5 von 5"],
                ["Eilt", "4 von 5"],
                ["Kostet Kraft", "2 von 5"],
                ["Sicherheit", "90 %"],
              ].map(([k, v]) => (
                <div key={k} className="nm-sink rounded-2xl px-4 py-3">
                  <p className="label-xs">{k}</p>
                  <p className="tnum mt-1 text-sm font-semibold text-ink">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-baseline gap-3 border-t border-white/5 pt-5">
              <span className="tnum display text-4xl text-accent-gradient">9,0</span>
              <span className="text-sm text-ink-soft">
                hoch — und damit heute vor allem anderen dran
              </span>
            </div>
            <p className="mt-4 font-mono text-xs text-ink-dim">
              (5 × 4 × 0,9) ÷ 2 = 9,0
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Step
              n="1"
              title="Projekte eintragen"
              body="Umzug, Bachelorarbeit, das Regal im Flur. Alles, was Platz im Kopf belegt — nicht nur Arbeit."
            />
            <Step
              n="2"
              title="Aufgaben grob schätzen"
              body="Vier Regler pro Aufgabe. Es muss nicht stimmen, es muss nur ehrlich sein."
            />
            <Step
              n="3"
              title="Anfangen"
              body="Fokus zeigt die oberste Aufgabe und eine Uhr dazu. Eine Sache, bis der Wecker klingelt."
            />
          </div>
        </section>

        {/* Übersicht */}
        <section className="mt-28">
          <p className="label-xs">Alles auf einen Blick</p>
          <h2 className="display mt-3 text-[2.1rem] text-ink">Deine Projekte</h2>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-ink-soft">
            Jede Karte zeigt Fortschritt, Zustand und die nächste offene Aufgabe. Was
            wackelt, siehst du sofort — ohne irgendwo hineinzuklicken.
          </p>
          <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
            <DemoCard
              name="Umzug im März"
              progress={62}
              done={8}
              total={13}
              health={{ label: "Alles gut", color: "var(--color-ok)" }}
              next="Nachmieter-Termine bestätigen"
              chips={["Zuhause", "in 24 Tagen"]}
            />
            <DemoCard
              name="Bachelorarbeit"
              progress={25}
              done={3}
              total={12}
              health={{ label: "Wackelt", color: "var(--color-warn)" }}
              next="Kapitel 2 gliedern"
              chips={["Uni", "in 6 Tagen"]}
            />
          </div>
        </section>

        {/* Ehrlichkeit */}
        <section className="mt-28">
          <p className="label-xs">Was du wissen solltest</p>
          <h2 className="display mt-3 text-[2.1rem] text-ink">Ohne Kleingedrucktes</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              [
                "Deine Daten gehören dir",
                "Im angemeldeten Bereich wird nichts mitgeschrieben — keine Werbung, kein Weiterverkauf. Ein Klick lädt alles als Datei herunter, ein zweiter löscht dein Konto vollständig.",
              ],
              [
                "Nur du siehst deine Projekte",
                "Jeder Eintrag ist technisch an dein Konto gebunden. Andere Nutzende kommen nicht heran.",
              ],
              [
                "Ein privat betriebener Dienst",
                "Fokus läuft auf einem eigenen Server, kostenlos und ohne zugesicherte Verfügbarkeit. Lade dir hin und wieder deinen Export herunter.",
              ],
              [
                "Auf dem Handy zu Hause",
                "Zum Startbildschirm hinzufügen, dann verhält sich Fokus wie eine App — die Uhr läuft auch weiter, wenn du zwischendurch woanders hinschaust.",
              ],
            ].map(([title, body]) => (
              <div key={title} className="nm-sink rounded-[var(--radius-card)] p-6">
                <h3 className="text-base font-bold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Abschluss */}
        <section className="mt-28 text-center">
          <h2 className="display text-[2.4rem] leading-tight text-ink">
            Was ist heute
            <br />
            das Wichtigste?
          </h2>
          <Link
            href="/registrieren"
            className="nm-accent nm-press mt-8 inline-flex h-14 items-center justify-center rounded-full px-9 text-base font-semibold"
          >
            Konto anlegen
          </Link>
          <p className="mt-4 text-xs text-ink-dim">Dauert eine Minute. Kostet nichts.</p>
        </section>

        <footer className="mt-24 flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-white/5 pt-8 text-xs text-ink-dim">
          <Link href="/impressum">Impressum</Link>
          <Link href="/datenschutz">Datenschutz</Link>
          <MailLink user="belkis.aslani" domain="gmail.com">
            Kontakt
          </MailLink>
          <Link href="/anmelden">Anmelden</Link>
        </footer>
      </div>
    </main>
  );
}
