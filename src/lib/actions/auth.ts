"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppwriteException, ID } from "node-appwrite";

import { SESSION_COOKIE } from "@/lib/appwrite/config";
import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";
import { sendVerificationMail } from "@/lib/actions/verify";
import { clientIp, hit, minutes } from "@/lib/rate-limit";

export type FormState =
  | { error?: string; values?: { name?: string; email?: string } }
  | undefined;

/** Name und Adresse zurückgeben — sonst tippt man sie bei jedem Fehlversuch neu. */
function keep(name: string, email: string) {
  return { name, email };
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
} as const;

function readable(err: unknown): string {
  if (err instanceof AppwriteException) {
    switch (err.type) {
      case "user_already_exists":
        return "Diese E-Mail ist schon registriert.";
      case "user_invalid_credentials":
        return "E-Mail oder Passwort stimmt nicht.";
      case "password_personal_data":
        return "Das Passwort darf nicht deine E-Mail enthalten.";
      case "general_argument_invalid":
        return "Eingabe unvollständig oder ungültig.";
      case "user_password_mismatch":
        return "Die Passwörter stimmen nicht überein.";
      default:
        return err.message;
    }
  }
  return "Unerwarteter Fehler. Bitte nochmal versuchen.";
}

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("passwordConfirm") ?? "");

  if (!name || !email || password.length < 8) {
    return { error: "Name, E-Mail und mindestens 8 Zeichen Passwort.", values: keep(name, email) };
  }
  if (password !== confirm) {
    return { error: "Die beiden Passwörter stimmen nicht überein.", values: keep(name, email) };
  }

  const ip = await clientIp();
  const gate = hit(`register:${ip}`, 5, 60 * 60);
  if (!gate.ok) {
    return {
      error: `Zu viele Registrierungen von hier. Versuch es in ${minutes(gate.retryAfterSeconds)} noch einmal.`,
      values: keep(name, email),
    };
  }

  let userId: string;
  try {
    const { account } = createAdminClient();
    const created = await account.create({ userId: ID.unique(), email, password, name });
    userId = created.$id;
    const session = await account.createEmailPasswordSession({ email, password });
    (await cookies()).set(SESSION_COOKIE, session.secret, COOKIE_OPTIONS);
  } catch (err) {
    return { error: readable(err), values: keep(name, email) };
  }

  // Fehlschlag beim Versand darf die Registrierung nicht kippen — die Adresse
  // lässt sich später über das Hinweisband erneut bestätigen.
  await sendVerificationMail(userId, email, name);

  redirect("/");
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "E-Mail und Passwort angeben.", values: keep("", email) };

  // Zwei Bremsen: eine gegen Streuangriffe von einer Adresse, eine gegen
  // gezieltes Raten auf ein bestimmtes Konto von wechselnden Adressen.
  const ip = await clientIp();
  for (const gate of [
    hit(`login:ip:${ip}`, 20, 15 * 60),
    hit(`login:mail:${email.toLowerCase()}`, 10, 15 * 60),
  ]) {
    if (!gate.ok) {
      return {
        error: `Zu viele Versuche. Warte ${minutes(gate.retryAfterSeconds)}, dann geht es weiter.`,
        values: keep("", email),
      };
    }
  }

  try {
    const { account } = createAdminClient();
    const session = await account.createEmailPasswordSession({ email, password });
    (await cookies()).set(SESSION_COOKIE, session.secret, COOKIE_OPTIONS);
  } catch (err) {
    return { error: readable(err), values: keep("", email) };
  }

  redirect("/");
}

export async function logout() {
  try {
    const client = await createSessionClient();
    await client?.account.deleteSession({ sessionId: "current" });
  } catch {
    // Session war serverseitig schon weg — Cookie trotzdem loeschen.
  }
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/anmelden");
}
