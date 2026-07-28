import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/legal-page";
import { MailLink } from "@/components/mail-link";

// Muss dynamisch rendern: die CSP vergibt pro Aufruf eine neue Nonce, und die
// kann eine zur Bauzeit erzeugte Seite nicht kennen — ihre Scripts wuerden
// blockiert und die Seite bliebe unhydriert.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Welche Daten Fokus verarbeitet, auf welcher Rechtsgrundlage und wie lange.",
  robots: { index: true, follow: true },
};

export default function DatenschutzPage() {
  return (
    <LegalPage title="Datenschutz" updated="28. Juli 2026">
      <h2>Verantwortlicher</h2>
      <p>
        Belkis Aslani, Vogelsangstr. 32, 71691 Freiberg am Neckar, Deutschland. E-Mail{" "}
        <MailLink user="belkis.aslani" domain="gmail.com" />. Anschrift
        siehe <Link href="/impressum">Impressum</Link>. Ein Datenschutzbeauftragter ist
        nicht bestellt; die Voraussetzungen des § 38 BDSG liegen nicht vor.
      </p>

      <h2>Grundsatz</h2>
      <p>
        Fokus kommt ohne Werbenetzwerke und ohne Nutzerprofile aus. Es werden keine Daten
        verkauft oder für Werbung ausgewertet. Schriften werden vom eigenen Server geladen,
        es gibt keine Verbindung zu Google Fonts oder ähnlichen Diensten. Im angemeldeten
        Bereich läuft keinerlei Auswertung mit. Ein Einwilligungsbanner entfällt, weil
        ausschließlich technisch notwendige Speichervorgänge stattfinden
        (§ 25 Abs. 2 Nr. 2 TDDDG) — auch die unten beschriebene Reichweitenmessung legt
        weder Cookies an noch liest sie etwas aus dem Gerät.
      </p>

      <h2>Reichweitenmessung</h2>
      <p>
        Auf den öffentlichen Seiten (Startseite, Anmelden, Registrieren, Impressum,
        Datenschutz) zählt <strong>Plausible Analytics</strong> die Aufrufe. Die Software
        läuft auf demselben privaten Server wie Fokus, es fließen keine Daten an Dritte
        ab. Erhoben werden ausschließlich Seitenaufruf, verweisende Seite, grober
        Gerätetyp und Land — ohne Cookies, ohne Kennung über mehrere Besuche hinweg und
        ohne dass daraus eine Person erkennbar wird. Die IP-Adresse wird nicht
        gespeichert, sondern nur kurzzeitig zu einem nicht rückrechenbaren Tageswert
        verarbeitet. Rechtsgrundlage ist das berechtigte Interesse an einer schlichten
        Besucherzählung (Art. 6 Abs. 1 lit. f DSGVO).
      </p>
      <p>
        Sobald Sie angemeldet sind, wird nichts mehr gemessen: Übersicht, Projekte,
        Aufgaben und Fokussitzungen tauchen in keiner Statistik auf.
      </p>

      <h2>Nutzerkonto</h2>
      <p>
        Für die Nutzung ist ein Konto nötig. Verarbeitet werden <strong>Name</strong>,{" "}
        <strong>E-Mail-Adresse</strong> und das <strong>Passwort</strong>. Das Passwort
        wird nie im Klartext gespeichert, sondern ausschließlich als kryptografischer
        Hash.
      </p>
      <ul>
        <li>
          <strong>Zweck:</strong> Bereitstellung des Kontos, Anmeldung, Zuordnung der
          Inhalte, Zurücksetzen des Passworts.
        </li>
        <li>
          <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO — Erfüllung des
          unentgeltlichen Nutzungsverhältnisses.
        </li>
        <li>
          <strong>Dauer:</strong> bis zur Löschung des Kontos durch die Nutzerin oder den
          Nutzer.
        </li>
      </ul>

      <h2>Selbst angelegte Inhalte</h2>
      <p>
        Projekte, Aufgaben, Notizen, Termine und Fokussitzungen werden so gespeichert, wie
        sie eingegeben wurden. Sie sind <strong>ausschließlich dem eigenen Konto
        zugeordnet</strong>; andere Nutzende haben technisch keinen Zugriff darauf. Der
        Betreiber hat als Serveradministrator technisch Zugriff auf die Datenbank, sieht
        die Inhalte aber nicht ein, außer es ist zur Störungsbeseitigung unvermeidbar.
      </p>
      <ul>
        <li>
          <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO.
        </li>
        <li>
          <strong>Dauer:</strong> bis zur Löschung des jeweiligen Eintrags oder des
          gesamten Kontos.
        </li>
      </ul>
      <p>
        Bitte keine besonderen Kategorien personenbezogener Daten nach Art. 9 DSGVO
        (Gesundheit, Weltanschauung, Herkunft und Ähnliches) und keine Zugangsdaten in
        Notizfelder eintragen.
      </p>

      <h2>Wo die Daten liegen</h2>
      <p>
        Anwendung und Datenbank laufen auf einem <strong>selbst betriebenen Server in
        Deutschland</strong>. Als Datenbank dient eine selbst gehostete
        Appwrite-Installation. Es findet keine Auftragsverarbeitung durch einen
        Datenbank- oder Hosting-Anbieter statt.
      </p>

      <h2>Auslieferung über Cloudflare</h2>
      <p>
        Der Zugriff läuft über einen Cloudflare Tunnel (Cloudflare, Inc., 101 Townsend St,
        San Francisco, CA 94107, USA).
      </p>
      <ul>
        <li>
          <strong>Verarbeitete Daten:</strong> IP-Adresse, Datum und Uhrzeit, aufgerufene
          Adresse, übertragene Datenmenge, Referrer, Browser- und Betriebssystemkennung.
        </li>
        <li>
          <strong>Zweck:</strong> technische Auslieferung, Abwehr von Überlastungs- und
          Missbrauchsangriffen.
        </li>
        <li>
          <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO — berechtigtes
          Interesse am sicheren und störungsfreien Betrieb.
        </li>
        <li>
          <strong>Auftragsverarbeitung:</strong> Vertrag nach Art. 28 DSGVO als Bestandteil
          der Cloudflare-Geschäftsbedingungen.
        </li>
        <li>
          <strong>Drittland:</strong> Eine Verarbeitung in den USA ist möglich. Cloudflare
          stützt sich auf Standardvertragsklauseln nach Art. 46 Abs. 2 lit. c DSGVO und ist
          unter dem EU-US Data Privacy Framework zertifiziert.
        </li>
        <li>
          <strong>Verschlüsselung:</strong> Cloudflare beendet die TLS-Verschlüsselung und
          kann den Inhalt des Datenverkehrs technisch einsehen.
        </li>
      </ul>

      <h2>E-Mail-Versand</h2>
      <p>
        Fokus verschickt nur zwei Arten von Nachrichten: die Bestätigung der
        E-Mail-Adresse und den Link zum Zurücksetzen des Passworts. Einen Newsletter gibt
        es nicht.
      </p>
      <ul>
        <li>
          <strong>Dienstleister:</strong> Brevo (Sendinblue SAS, 106 boulevard Haussmann,
          75008 Paris, Frankreich) als Auftragsverarbeiter nach Art. 28 DSGVO.
        </li>
        <li>
          <strong>Übermittelte Daten:</strong> E-Mail-Adresse, Name, Inhalt der Nachricht.
        </li>
        <li>
          <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO.
        </li>
        <li>
          <strong>Ort der Verarbeitung:</strong> Europäische Union.
        </li>
      </ul>

      <h2>Server-Protokolle</h2>
      <p>
        Der eigene Server protokolliert Zugriffe und Fehler zur Störungssuche. Die
        Einträge werden spätestens nach <strong>sieben Tagen</strong> gelöscht.
        Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.
      </p>

      <h2>Speicherung im Browser</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Art</th>
            <th>Zweck</th>
            <th>Dauer</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>fokus_session</code>
            </td>
            <td>Cookie</td>
            <td>hält die Anmeldung, technisch notwendig</td>
            <td>30 Tage</td>
          </tr>
          <tr>
            <td>
              <code>fokus.timer.v1</code>
            </td>
            <td>Local Storage</td>
            <td>laufende Fokussitzung, damit sie einen Seitenwechsel übersteht</td>
            <td>bis zum Ende der Sitzung</td>
          </tr>
          <tr>
            <td>
              <code>fokus.pending-sessions.v1</code>
            </td>
            <td>Local Storage</td>
            <td>ohne Netz beendete Sitzungen, bis sie übertragen sind</td>
            <td>bis zur Übertragung</td>
          </tr>
        </tbody>
      </table>
      <p>
        Das Cookie ist <code>HttpOnly</code> und <code>Secure</code> gesetzt und damit für
        JavaScript nicht lesbar. Die beiden Local-Storage-Einträge bleiben ausschließlich
        auf deinem Gerät und werden an niemanden außer den eigenen Server übertragen.
        Zusätzlich legt der Service Worker Programmdateien und Symbole im Browser-Cache ab,
        damit die App offline eine Hinweisseite zeigen kann — Projektdaten werden dabei{" "}
        <strong>nicht</strong> zwischengespeichert.
      </p>

      <h2>Deine Rechte</h2>
      <ul>
        <li>
          <strong>Auskunft (Art. 15):</strong> Eine vollständige Kopie aller Daten gibt es
          jederzeit selbst unter <strong>Konto → Export herunterladen</strong> als
          JSON-Datei.
        </li>
        <li>
          <strong>Berichtigung (Art. 16):</strong> Alle Inhalte lassen sich in der App
          direkt ändern.
        </li>
        <li>
          <strong>Löschung (Art. 17):</strong> Unter <strong>Konto → Konto löschen</strong>{" "}
          werden das Konto und sämtliche zugehörigen Daten sofort und unwiderruflich
          entfernt.
        </li>
        <li>
          <strong>Einschränkung (Art. 18)</strong>, <strong>Datenübertragbarkeit (Art. 20)</strong>{" "}
          und <strong>Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen
          (Art. 21)</strong> — eine formlose Nachricht an die oben genannte Adresse genügt.
        </li>
      </ul>
      <p>
        Unabhängig davon besteht ein Beschwerderecht bei einer Aufsichtsbehörde. Zuständig
        ist in der Regel der Landesbeauftragte für den Datenschutz und die
        Informationsfreiheit Baden-Württemberg.
      </p>

      <h2>Datensicherheit und Grenzen</h2>
      <p>
        Die Übertragung ist durchgehend mit TLS verschlüsselt. Passwörter liegen nur als
        Hash vor, Inhalte sind pro Konto getrennt. Ehrlich gesagt sei aber dazu: Fokus
        läuft auf privater Infrastruktur ohne zugesicherte Verfügbarkeit. Wer wichtige
        Daten darin hält, sollte den Export regelmäßig nutzen.
      </p>

      <h2>Änderungen</h2>
      <p>
        Kommen Funktionen hinzu, die weitere Daten verarbeiten, wird dieser Text vorher
        angepasst. Diese Erklärung beschreibt den tatsächlichen technischen Aufbau und
        ersetzt keine Rechtsberatung.
      </p>
    </LegalPage>
  );
}
