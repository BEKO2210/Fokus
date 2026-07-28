import "server-only";

import { cookies } from "next/headers";
import { Account, Client, Databases } from "node-appwrite";

import { APPWRITE, SESSION_COOKIE } from "./config";

function baseClient() {
  return new Client().setEndpoint(APPWRITE.endpoint).setProject(APPWRITE.project);
}

/**
 * Client im Namen des angemeldeten Nutzers. Alle Dokument-Permissions
 * greifen dadurch serverseitig genau wie im Browser.
 */
export async function createSessionClient() {
  const secret = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!secret) return null;

  const client = baseClient().setSession(secret);
  return {
    account: new Account(client),
    databases: new Databases(client),
  };
}

/** Client mit API-Key — nur fuer Registrierung und Login. */
export function createAdminClient() {
  const client = baseClient().setKey(process.env.APPWRITE_API_KEY!);
  return {
    account: new Account(client),
    databases: new Databases(client),
  };
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
};

/** Aktuellen Nutzer laden, oder null wenn keine gueltige Session existiert. */
export async function getUser(): Promise<SessionUser | null> {
  const client = await createSessionClient();
  if (!client) return null;
  try {
    const me = await client.account.get();
    return {
      id: me.$id,
      name: me.name,
      email: me.email,
      emailVerified: Boolean(me.emailVerification),
    };
  } catch {
    return null;
  }
}
