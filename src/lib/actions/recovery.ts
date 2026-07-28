"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Client, Query, Users } from "node-appwrite";

import { APPWRITE, SESSION_COOKIE } from "@/lib/appwrite/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { passwordResetMail, sendMail } from "@/lib/mail";
import { clientIp, hit } from "@/lib/rate-limit";

export type RecoveryState = { error?: string; sent?: boolean } | undefined;

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
} as const;

/** Eine Stunde, danach ist der Link tot. */
const TOKEN_TTL_SECONDS = 60 * 60;

function adminUsers() {
  const client = new Client()
    .setEndpoint(APPWRITE.endpoint)
    .setProject(APPWRITE.project)
    .setKey(process.env.APPWRITE_API_KEY!);
  return new Users(client);
}

/**
 * Schritt 1 — Link anfordern.
 *
 * Antwortet immer gleich, egal ob die Adresse existiert. Sonst wird das
 * Formular zum Verzeichnis, mit dem sich registrierte Nutzer abfragen lassen.
 */
export async function requestPasswordReset(
  _prev: RecoveryState,
  fd: FormData,
): Promise<RecoveryState> {
  const email = String(fd.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email || !email.includes("@")) {
    return { error: "Bitte eine gültige E-Mail-Adresse angeben." };
  }

  // Ohne diese Bremse liesse sich das Postfach jedes registrierten Nutzers
  // fluten — der Admin-Client umgeht Appwrites eigene Limits.
  const ip = await clientIp();
  for (const gate of [hit(`reset:ip:${ip}`, 10, 60 * 60), hit(`reset:mail:${email}`, 3, 15 * 60)]) {
    if (!gate.ok) {
      // Neutral bleiben: kein Hinweis darauf, ob die Adresse überhaupt existiert.
      return { sent: true };
    }
  }

  try {
    const users = adminUsers();
    const found = await users.list({ queries: [Query.equal("email", email), Query.limit(1)] });
    const user = found.users[0];

    if (user) {
      const token = await users.createToken({
        userId: user.$id,
        length: 48,
        expire: TOKEN_TTL_SECONDS,
      });

      const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3016";
      const link = `${base}/passwort-neu?userId=${encodeURIComponent(token.userId)}&secret=${encodeURIComponent(token.secret)}`;

      const { subject, text, html } = passwordResetMail(user.name, link);
      await sendMail({ to: email, subject, text, html });
    }
  } catch (err) {
    console.error("[recovery] Anforderung fehlgeschlagen", err);
    // Auch im Fehlerfall neutral bleiben.
  }

  return { sent: true };
}

/**
 * Schritt 2 — neues Passwort setzen.
 *
 * Der Token wird durch `createSession` eingelöst und dabei entwertet. Erst wenn
 * das klappt, ist bewiesen, dass die Person Zugriff auf das Postfach hat —
 * danach setzt der Admin-Client das Passwort ohne Kenntnis des alten.
 */
export async function completePasswordReset(
  _prev: RecoveryState,
  fd: FormData,
): Promise<RecoveryState> {
  const userId = String(fd.get("userId") ?? "");
  const secret = String(fd.get("secret") ?? "");
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("passwordConfirm") ?? "");

  if (!userId || !secret) {
    return { error: "Der Link ist unvollständig. Fordere bitte einen neuen an." };
  }
  if (password.length < 8) {
    return { error: "Das Passwort braucht mindestens 8 Zeichen." };
  }
  if (password !== confirm) {
    return { error: "Die beiden Passwörter stimmen nicht überein." };
  }

  try {
    const { account } = createAdminClient();
    const users = adminUsers();

    // Token einlösen — schlägt das fehl, endet der Vorgang hier. Die dabei
    // entstehende Session ist nur der Nachweis, gleich wird sie ohnehin verworfen.
    await account.createSession({ userId, secret });

    const email = (await users.get({ userId })).email;
    await users.updatePassword({ userId, password });

    // Appwrite beendet beim Passwortwechsel sämtliche Sessions. Also frisch
    // anmelden, sonst landet der Nutzer trotz Erfolg wieder auf dem Login.
    const session = await account.createEmailPasswordSession({ email, password });
    (await cookies()).set(SESSION_COOKIE, session.secret, COOKIE_OPTIONS);
  } catch (err) {
    console.error("[recovery] Einlösen fehlgeschlagen", err);
    return {
      error: "Dieser Link ist abgelaufen oder wurde schon benutzt. Fordere bitte einen neuen an.",
    };
  }

  redirect("/");
}
