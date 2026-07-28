"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppwriteException, ID } from "node-appwrite";

import { SESSION_COOKIE } from "@/lib/appwrite/config";
import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";

export type FormState = { error?: string } | undefined;

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
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
    return { error: "Name, E-Mail und mindestens 8 Zeichen Passwort." };
  }
  if (password !== confirm) {
    return { error: "Die beiden Passwörter stimmen nicht überein." };
  }

  try {
    const { account } = createAdminClient();
    await account.create({ userId: ID.unique(), email, password, name });
    const session = await account.createEmailPasswordSession({ email, password });
    (await cookies()).set(SESSION_COOKIE, session.secret, COOKIE_OPTIONS);
  } catch (err) {
    return { error: readable(err) };
  }

  redirect("/");
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "E-Mail und Passwort angeben." };

  try {
    const { account } = createAdminClient();
    const session = await account.createEmailPasswordSession({ email, password });
    (await cookies()).set(SESSION_COOKIE, session.secret, COOKIE_OPTIONS);
  } catch (err) {
    return { error: readable(err) };
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
