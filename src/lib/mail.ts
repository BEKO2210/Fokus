import "server-only";

type SendInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

/**
 * Zwei Versandwege, umschaltbar über MAIL_PROVIDER.
 *
 * Standard ist Brevo (Sendinblue SAS, Frankreich): EU-Anbieter mit
 * öffentlichem Auftragsverarbeitungsvertrag. AgentMail funktioniert technisch
 * genauso, veröffentlicht aber weder Datenschutzhinweise noch einen AVV —
 * für einen Dienst mit fremden Nutzerdaten ist das keine tragfähige Grundlage.
 */
type Provider = "brevo" | "agentmail";

function provider(): Provider {
  return process.env.MAIL_PROVIDER === "agentmail" ? "agentmail" : "brevo";
}

async function sendViaBrevo({ to, subject, text, html }: SendInput): Promise<boolean> {
  const key = process.env.BREVO_API_KEY;
  const from = process.env.MAIL_FROM;
  const fromName = process.env.MAIL_FROM_NAME || "Fokus";
  if (!key || !from) {
    console.error("[mail] BREVO_API_KEY oder MAIL_FROM fehlt");
    return false;
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { email: from, name: fromName },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    console.error("[mail] Brevo lehnte ab", res.status, (await res.text()).slice(0, 300));
    return false;
  }
  return true;
}

async function sendViaAgentMail({ to, subject, text, html }: SendInput): Promise<boolean> {
  const key = process.env.AGENTMAIL_API_KEY;
  const inbox = process.env.AGENTMAIL_INBOX;
  if (!key || !inbox) {
    console.error("[mail] AGENTMAIL_API_KEY oder AGENTMAIL_INBOX fehlt");
    return false;
  }

  const res = await fetch(
    `https://api.agentmail.to/v0/inboxes/${encodeURIComponent(inbox)}/messages/send`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, text, html }),
      signal: AbortSignal.timeout(15_000),
    },
  );

  if (!res.ok) {
    console.error("[mail] AgentMail lehnte ab", res.status, (await res.text()).slice(0, 300));
    return false;
  }
  return true;
}

export async function sendMail(input: SendInput): Promise<boolean> {
  try {
    return provider() === "agentmail" ? await sendViaAgentMail(input) : await sendViaBrevo(input);
  } catch (err) {
    // Nie den Grund an den Aufrufer geben — die Oberfläche antwortet bewusst neutral.
    console.error("[mail] Versand fehlgeschlagen", err);
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Gemeinsamer Rahmen. Mail-Clients können weder Verläufe noch weiche Schatten. */
function shell(heading: string, body: string, cta?: { label: string; href: string }) {
  return `<!doctype html>
<html lang="de">
  <body style="margin:0;padding:32px 16px;background:#2b2c30;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;margin:0 auto;background:#303137;border-radius:20px;">
      <tr>
        <td style="padding:36px 32px;">
          <p style="margin:0 0 28px;font-size:20px;font-weight:700;color:#eceef2;letter-spacing:-0.02em;">Fokus</p>
          <h1 style="margin:0 0 18px;font-size:26px;font-weight:700;color:#eceef2;letter-spacing:-0.02em;">${heading}</h1>
          ${body}
          ${
            cta
              ? `<a href="${escapeHtml(cta.href)}" style="display:inline-block;margin-top:8px;padding:15px 30px;border-radius:999px;background:#ef3f14;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">${cta.label}</a>
          <p style="margin:20px 0 0;font-size:12px;line-height:1.6;color:#71747d;word-break:break-all;">Falls der Knopf nicht geht: ${escapeHtml(cta.href)}</p>`
              : ""
          }
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

const P = 'style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#a2a6b0;"';
const SMALL = 'style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#71747d;"';

export function passwordResetMail(name: string, link: string) {
  const greeting = name ? `Hallo ${escapeHtml(name)},` : "Hallo,";

  const text = [
    name ? `Hallo ${name},` : "Hallo,",
    "",
    "du hast ein neues Passwort für Fokus angefordert. Über diesen Link vergibst du es:",
    link,
    "",
    "Der Link gilt eine Stunde und funktioniert nur einmal.",
    "Warst du das nicht, ignorier diese Nachricht — dein Passwort bleibt unverändert.",
    "",
    "Fokus · fokus.it-handwerk-stuttgart.de",
  ].join("\n");

  const html = shell(
    "Neues Passwort",
    `<p ${P}>${greeting}</p>
     <p ${P}>du hast ein neues Passwort für Fokus angefordert. Klick auf den Knopf, um es zu vergeben.</p>`,
    { label: "Passwort neu vergeben", href: link },
  ).replace(
    "</td>",
    `<p ${SMALL}>Der Link gilt eine Stunde und funktioniert nur einmal. Warst du das nicht, ignorier diese Nachricht — dein Passwort bleibt unverändert.</p></td>`,
  );

  return { subject: "Neues Passwort für Fokus", text, html };
}

export function verifyEmailMail(name: string, link: string) {
  const greeting = name ? `Hallo ${escapeHtml(name)},` : "Hallo,";

  const text = [
    name ? `Hallo ${name},` : "Hallo,",
    "",
    "bitte bestätige deine E-Mail-Adresse für Fokus:",
    link,
    "",
    "Der Link gilt 24 Stunden.",
    "Hast du dich nicht registriert, ignorier diese Nachricht — ohne Bestätigung passiert nichts weiter.",
    "",
    "Fokus · fokus.it-handwerk-stuttgart.de",
  ].join("\n");

  const html = shell(
    "E-Mail bestätigen",
    `<p ${P}>${greeting}</p>
     <p ${P}>bitte bestätige kurz, dass diese Adresse dir gehört. Danach ist dein Konto vollständig eingerichtet.</p>`,
    { label: "E-Mail bestätigen", href: link },
  ).replace(
    "</td>",
    `<p ${SMALL}>Der Link gilt 24 Stunden. Hast du dich nicht registriert, ignorier diese Nachricht — ohne Bestätigung passiert nichts weiter.</p></td>`,
  );

  return { subject: "Bestätige deine E-Mail-Adresse für Fokus", text, html };
}
