"use server";

import { Client, Users } from "node-appwrite";

import { APPWRITE } from "@/lib/appwrite/config";
import { createAdminClient, getUser } from "@/lib/appwrite/server";
import { sendMail, verifyEmailMail } from "@/lib/mail";
import { clientIp, hit, minutes } from "@/lib/rate-limit";

export type VerifyState = { error?: string; sent?: boolean } | undefined;

/** 24 Stunden — lang genug, dass die Mail auch am nächsten Tag noch taugt. */
const TOKEN_TTL_SECONDS = 60 * 60 * 24;

function adminUsers() {
  const client = new Client()
    .setEndpoint(APPWRITE.endpoint)
    .setProject(APPWRITE.project)
    .setKey(process.env.APPWRITE_API_KEY!);
  return new Users(client);
}

/** Bestätigungslink erzeugen und verschicken. Fehler werden geschluckt. */
export async function sendVerificationMail(
  userId: string,
  email: string,
  name: string,
): Promise<boolean> {
  try {
    const token = await adminUsers().createToken({
      userId,
      length: 48,
      expire: TOKEN_TTL_SECONDS,
    });
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3016";
    const link = `${base}/email-bestaetigen?userId=${encodeURIComponent(token.userId)}&secret=${encodeURIComponent(token.secret)}`;
    const { subject, text, html } = verifyEmailMail(name, link);
    return await sendMail({ to: email, subject, text, html });
  } catch (err) {
    console.error("[verify] Versand fehlgeschlagen", err);
    return false;
  }
}

/** Erneut anfordern, ausgelöst über das Hinweisband in der App. */
export async function resendVerification(_prev: VerifyState, _fd: FormData): Promise<VerifyState> {
  const user = await getUser();
  if (!user) return { error: "Nicht angemeldet." };

  const gate = hit(`verify:${user.id}`, 3, 60 * 60);
  if (!gate.ok) {
    return { error: `Schon unterwegs. Nächster Versuch in ${minutes(gate.retryAfterSeconds)}.` };
  }

  await sendVerificationMail(user.id, user.email, user.name);
  return { sent: true };
}

/**
 * Token einlösen und das Konto als bestätigt markieren.
 *
 * `createSession` prüft und entwertet den Token in einem Schritt — nur wer die
 * Mail bekommen hat, kommt hier durch.
 *
 * Bewusst OHNE `revalidatePath`: diese Funktion läuft beim Aufbau der
 * Bestätigungsseite, und dort ist ein Neuvalidieren in Next.js 16 nicht
 * erlaubt — es wirft und die Seite meldete dann fälschlich "Link abgelaufen",
 * obwohl die Bestätigung längst durch war. Nötig ist es auch nicht: die
 * geschützten Seiten laden den Nutzer bei jedem Aufruf frisch.
 */
export async function confirmEmail(
  userId: string,
  secret: string,
): Promise<{ ok: boolean; reason?: string }> {
  const ip = await clientIp();
  const gate = hit(`confirm:${ip}`, 20, 60 * 60);
  if (!gate.ok) return { ok: false, reason: "zu viele Versuche" };

  const users = adminUsers();

  try {
    const { account } = createAdminClient();
    await account.createSession({ userId, secret });
    await users.updateEmailVerification({ userId, emailVerification: true });
    return { ok: true };
  } catch (err) {
    // Der Token ist einmalig. Ein zweiter Klick, ein Neuladen oder ein
    // Vorabruf durch den Mail-Client verbraucht ihn — dann ist "schon
    // bestätigt" die richtige Antwort, nicht "abgelaufen".
    try {
      if ((await users.get({ userId })).emailVerification) return { ok: true };
    } catch {
      // Nutzer gibt es nicht mehr — dann bleibt es beim Fehler unten.
    }
    console.error("[verify] Bestätigung fehlgeschlagen", err);
    return { ok: false, reason: "abgelaufen" };
  }
}
