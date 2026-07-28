import "server-only";

const API = "https://api.agentmail.to/v0";

type SendInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

/**
 * Versand über AgentMail. Der Absender ergibt sich aus der Inbox,
 * ein `from`-Feld gibt es bewusst nicht.
 */
export async function sendMail({ to, subject, text, html }: SendInput): Promise<boolean> {
  const key = process.env.AGENTMAIL_API_KEY;
  const inbox = process.env.AGENTMAIL_INBOX;
  if (!key || !inbox) {
    console.error("[mail] AGENTMAIL_API_KEY oder AGENTMAIL_INBOX fehlt");
    return false;
  }

  try {
    const res = await fetch(`${API}/inboxes/${encodeURIComponent(inbox)}/messages/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, subject, text, html }),
      // Der Nutzer wartet auf die Antwort — lieber abbrechen als hängen.
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      console.error("[mail] Versand fehlgeschlagen", res.status, (await res.text()).slice(0, 300));
      return false;
    }
    return true;
  } catch (err) {
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

/**
 * E-Mail zum Zurücksetzen des Passworts. Bewusst schlicht gehalten:
 * Mail-Clients können weder Verläufe noch weiche Schatten zuverlässig.
 */
export function passwordResetMail(name: string, link: string) {
  const safeName = escapeHtml(name || "");
  const safeLink = escapeHtml(link);
  const greeting = safeName ? `Hallo ${safeName},` : "Hallo,";

  const text = [
    greeting,
    "",
    "du hast ein neues Passwort für Fokus angefordert. Über diesen Link vergibst du es:",
    link,
    "",
    "Der Link gilt eine Stunde und funktioniert nur einmal.",
    "Warst du das nicht, kannst du diese Nachricht ignorieren — dein Passwort bleibt unverändert.",
    "",
    "Fokus · fokus.it-handwerk-stuttgart.de",
  ].join("\n");

  const html = `<!doctype html>
<html lang="de">
  <body style="margin:0;padding:32px 16px;background:#2b2c30;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;margin:0 auto;background:#303137;border-radius:20px;">
      <tr>
        <td style="padding:36px 32px;">
          <p style="margin:0 0 28px;font-size:20px;font-weight:700;color:#eceef2;letter-spacing:-0.02em;">Fokus</p>
          <h1 style="margin:0 0 18px;font-size:26px;font-weight:700;color:#eceef2;letter-spacing:-0.02em;">Neues Passwort</h1>
          <p style="margin:0 0 12px;font-size:15px;line-height:1.65;color:#a2a6b0;">${greeting}</p>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.65;color:#a2a6b0;">
            du hast ein neues Passwort für Fokus angefordert. Klick auf den Knopf, um es zu vergeben.
          </p>
          <a href="${safeLink}" style="display:inline-block;padding:15px 30px;border-radius:999px;background:#ef3f14;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
            Passwort neu vergeben
          </a>
          <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#71747d;">
            Der Link gilt eine Stunde und funktioniert nur einmal. Warst du das nicht,
            ignorier diese Nachricht einfach — dein Passwort bleibt unverändert.
          </p>
          <p style="margin:20px 0 0;font-size:12px;line-height:1.6;color:#71747d;word-break:break-all;">
            Falls der Knopf nicht geht: ${safeLink}
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject: "Neues Passwort für Fokus", text, html };
}
