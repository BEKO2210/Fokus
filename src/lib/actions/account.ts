"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Client, Query, Users } from "node-appwrite";

import { APPWRITE, COLLECTIONS, SESSION_COOKIE } from "@/lib/appwrite/config";
import { createSessionClient, getUser } from "@/lib/appwrite/server";

export type AccountState = { error?: string } | undefined;

function adminUsers() {
  const client = new Client()
    .setEndpoint(APPWRITE.endpoint)
    .setProject(APPWRITE.project)
    .setKey(process.env.APPWRITE_API_KEY!);
  return new Users(client);
}

/**
 * Konto und sämtliche Inhalte löschen — Art. 17 DSGVO.
 *
 * Erst die Dokumente, dann der Nutzer. Andersherum blieben verwaiste Einträge
 * zurück, die niemand mehr lesen oder löschen könnte.
 */
export async function deleteAccount(_prev: AccountState, fd: FormData): Promise<AccountState> {
  const [client, user] = await Promise.all([createSessionClient(), getUser()]);
  if (!client || !user) redirect("/anmelden");

  // Tippfehler-Bremse: die Löschung passiert nur nach bewusster Eingabe.
  if (String(fd.get("confirm") ?? "").trim().toUpperCase() !== "LÖSCHEN") {
    return { error: 'Bitte "LÖSCHEN" eintippen, um das Konto endgültig zu entfernen.' };
  }

  const { databases } = client;

  try {
    for (const collectionId of [COLLECTIONS.tasks, COLLECTIONS.sessions, COLLECTIONS.projects]) {
      // In Blöcken abräumen, damit auch grosse Konten vollständig durchlaufen.
      for (;;) {
        const page = await databases.listDocuments({
          databaseId: APPWRITE.db,
          collectionId,
          queries: [Query.limit(100)],
        });
        if (page.documents.length === 0) break;

        await Promise.all(
          page.documents.map((doc) =>
            databases.deleteDocument({
              databaseId: APPWRITE.db,
              collectionId,
              documentId: doc.$id,
            }),
          ),
        );

        if (page.documents.length < 100) break;
      }
    }

    await adminUsers().delete({ userId: user.id });
  } catch (err) {
    console.error("[account] Löschen fehlgeschlagen", err);
    return {
      error:
        "Das Konto konnte nicht vollständig gelöscht werden. Bitte versuch es später noch einmal oder schreib an belkis.aslani@gmail.com.",
    };
  }

  (await cookies()).delete(SESSION_COOKIE);
  redirect("/anmelden?geloescht=1");
}
