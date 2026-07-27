"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ID, Permission, Role } from "node-appwrite";

import { APPWRITE, COLLECTIONS } from "@/lib/appwrite/config";
import { createSessionClient, getUser } from "@/lib/appwrite/server";

/** Eine beendete Fokussitzung protokollieren. */
export async function logFocusSession(input: {
  projectId: string | null;
  taskId: string | null;
  label: string | null;
  seconds: number;
  startedAt: string;
}) {
  const [client, user] = await Promise.all([createSessionClient(), getUser()]);
  if (!client || !user) redirect("/anmelden");

  const seconds = Math.min(86_400, Math.max(0, Math.round(input.seconds)));
  if (seconds < 30) return { ok: false, reason: "zu kurz" };

  await client.databases.createDocument({
    databaseId: APPWRITE.db,
    collectionId: COLLECTIONS.sessions,
    documentId: ID.unique(),
    data: {
      ownerId: user.id,
      projectId: input.projectId,
      taskId: input.taskId,
      startedAt: input.startedAt,
      seconds,
      label: input.label?.slice(0, 200) ?? null,
    },
    permissions: [
      Permission.read(Role.user(user.id)),
      Permission.update(Role.user(user.id)),
      Permission.delete(Role.user(user.id)),
    ],
  });

  revalidatePath("/fokus");
  revalidatePath("/");
  return { ok: true };
}
