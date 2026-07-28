import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Anbieterkennzeichnung für Fokus.",
  robots: { index: true, follow: true },
};

export default function ImpressumPage() {
  return (
    <LegalPage title="Impressum" updated="28. Juli 2026">
      <h2>Anbieter und verantwortlich für den Inhalt</h2>
      <p>
        Belkis Aslani
        <br />
        Vogelsangstr. 32
        <br />
        71691 Freiberg am Neckar
        <br />
        Deutschland
      </p>
      <p>
        E-Mail: <a href="mailto:belkis.aslani@gmail.com">belkis.aslani@gmail.com</a>
      </p>

      <h2>Charakter des Angebots</h2>
      <p>
        Fokus ist ein <strong>privat betriebenes, kostenloses Werkzeug</strong>. Es werden
        keine Waren oder Dienstleistungen verkauft, es gibt keine Werbung, keine
        Affiliate-Links und keine Einnahmen aus dem Betrieb.
      </p>
      <ul>
        <li>
          Eine Umsatzsteuer-Identifikationsnummer nach § 27a UStG besteht nicht und ist
          nicht erforderlich.
        </li>
        <li>Für dieses Angebot besteht keine Gewerbeanmeldung.</li>
        <li>
          Angaben zu Berufsbezeichnung, Kammer oder Aufsichtsbehörde entfallen mangels
          reglementierten Berufs.
        </li>
      </ul>
      <p>
        Weil Fokus auch anderen Personen offensteht, wird die Anbieterkennzeichnung nach
        § 5 DDG hier vollständig gemacht — unabhängig davon, ob die Vorschrift für ein
        unentgeltliches privates Angebot zwingend gilt.
      </p>

      <h2>Kein Anspruch auf Verfügbarkeit</h2>
      <p>
        Fokus läuft auf einem privat betriebenen Server. Es gibt keine zugesicherte
        Verfügbarkeit, keine Reaktionszeiten und keinen Anspruch auf Weiterbetrieb. Wer
        Fokus nutzt, sollte seine Daten regelmäßig über{" "}
        <strong>Konto → Export herunterladen</strong> sichern.
      </p>

      <h2>Haftung für Inhalte</h2>
      <p>
        Für eigene Inhalte gilt die allgemeine Verantwortlichkeit nach den Gesetzen. Für
        Inhalte, die Nutzerinnen und Nutzer selbst anlegen, ist die jeweilige Person
        verantwortlich. Eine Verpflichtung, gespeicherte fremde Informationen zu
        überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
        hinweisen, besteht nach § 7 Abs. 2 DDG nicht. Bei bekannt werdenden
        Rechtsverletzungen werden die betreffenden Inhalte entfernt.
      </p>

      <h2>Haftung für Links</h2>
      <p>
        Nutzerinnen und Nutzer können in ihren Projekten externe Adressen hinterlegen. Auf
        deren Inhalte besteht kein Einfluss; verantwortlich ist ausschließlich der
        jeweilige Anbieter.
      </p>

      <h2>Urheberrecht</h2>
      <p>
        Gestaltung, Texte und Grafiken dieses Angebots unterliegen dem deutschen
        Urheberrecht. Der Quellcode steht unter der im{" "}
        <a href="https://github.com/BEKO2210/Fokus" rel="noreferrer noopener" target="_blank">
          Repository
        </a>{" "}
        angegebenen Lizenz. Inhalte, die Nutzende selbst anlegen, bleiben ihr Eigentum.
      </p>

      <h2>Streitbeilegung</h2>
      <p>
        Zur Teilnahme an einem Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle besteht weder Bereitschaft noch Verpflichtung —
        mangels entgeltlicher Verbraucherverträge entsteht ein solcher Fall hier nicht.
      </p>

      <h2>Rechtlicher Hinweis</h2>
      <p>
        Diese Angaben sind sorgfältig zusammengestellt, ersetzen aber keine
        Rechtsberatung. Siehe auch die <Link href="/datenschutz">Datenschutzerklärung</Link>.
      </p>
    </LegalPage>
  );
}
