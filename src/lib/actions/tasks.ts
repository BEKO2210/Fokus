"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ID, Permission, Role } from "node-appwrite";

import { APPWRITE, COLLECTIONS } from "@/lib/appwrite/config";
import { createSessionClient, getUser } from "@/lib/appwrite/server";
import { TASK_STATUS } from "@/lib/types";
import type { TaskStatus } from "@/lib/types";

export type TaskActionState =
  | { error?: string; ok?: boolean; values?: Record<string, string> }
  | undefined;

const TASK_FIELDS = [
  "title",
  "notes",
  "impact",
  "urgency",
  "effort",
  "confidence",
  "status",
  "dueDate",
] as const;

/** Eingaben zurück ins Formular tragen — React leert es sonst bei jedem Fehler. */
function keepValues(fd: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of TASK_FIELDS) out[key] = String(fd.get(key) ?? "");
  return out;
}

async function ctx() {
  const [client, user] = await Promise.all([createSessionClient(), getUser()]);
  if (!client || !user) redirect("/anmelden");
  return { databases: client.databases, user };
}

function clampInt(raw: FormDataEntryValue | null, min: number, max: number, fallback: number) {
  const n = Number.parseInt(String(raw ?? ""), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function taskPayload(fd: FormData) {
  const status = String(fd.get("status") ?? "inbox") as TaskStatus;
  const due = String(fd.get("dueDate") ?? "").trim();
  const dueDate = due ? new Date(due) : null;

  return {
    title: String(fd.get("title") ?? "").trim().slice(0, 200),
    notes: String(fd.get("notes") ?? "").trim().slice(0, 4000) || null,
    impact: clampInt(fd.get("impact"), 1, 5, 3),
    urgency: clampInt(fd.get("urgency"), 1, 5, 3),
    effort: clampInt(fd.get("effort"), 1, 5, 3),
    confidence: clampInt(fd.get("confidence"), 0, 100, 80),
    status: TASK_STATUS.includes(status) ? status : "inbox",
    dueDate: dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate.toISOString() : null,
  };
}

export async function createTask(_prev: TaskActionState, fd: FormData): Promise<TaskActionState> {
  const { databases, user } = await ctx();
  const projectId = String(fd.get("projectId") ?? "");
  const data = taskPayload(fd);

  if (!projectId) return { error: "Kein Projekt gewählt." };
  if (!data.title) return { error: "Die Aufgabe braucht einen Titel.", values: keepValues(fd) };

  try {
    await databases.createDocument({
      databaseId: APPWRITE.db,
      collectionId: COLLECTIONS.tasks,
      documentId: ID.unique(),
      data: { ...data, projectId, ownerId: user.id, sortIndex: 0, completedAt: null },
      permissions: [
        Permission.read(Role.user(user.id)),
        Permission.update(Role.user(user.id)),
        Permission.delete(Role.user(user.id)),
      ],
    });
  } catch (err) {
    console.error("[tasks] Speichern fehlgeschlagen", err);
    return {
      error: "Konnte nicht gespeichert werden. Bitte gleich noch einmal versuchen.",
      values: keepValues(fd),
    };
  }

  revalidatePath("/uebersicht");
  revalidatePath(`/projekt/${projectId}`);
  revalidatePath("/fokus");
  return { ok: true };
}

export async function updateTask(_prev: TaskActionState, fd: FormData): Promise<TaskActionState> {
  const { databases } = await ctx();
  const id = String(fd.get("id") ?? "");
  const projectId = String(fd.get("projectId") ?? "");
  const data = taskPayload(fd);

  if (!id) return { error: "Aufgabe nicht gefunden." };
  if (!data.title) return { error: "Die Aufgabe braucht einen Titel.", values: keepValues(fd) };

  try {
    await databases.updateDocument({
      databaseId: APPWRITE.db,
      collectionId: COLLECTIONS.tasks,
      documentId: id,
      data: {
        ...data,
        completedAt: data.status === "done" ? new Date().toISOString() : null,
      },
    });
  } catch (err) {
    console.error("[tasks] Speichern fehlgeschlagen", err);
    return {
      error: "Konnte nicht gespeichert werden. Bitte gleich noch einmal versuchen.",
      values: keepValues(fd),
    };
  }

  revalidatePath("/uebersicht");
  revalidatePath(`/projekt/${projectId}`);
  revalidatePath("/fokus");
  return { ok: true };
}

export async function setTaskStatus(id: string, projectId: string, status: TaskStatus) {
  const { databases } = await ctx();
  if (!TASK_STATUS.includes(status)) return;

  await databases.updateDocument({
    databaseId: APPWRITE.db,
    collectionId: COLLECTIONS.tasks,
    documentId: id,
    data: {
      status,
      completedAt: status === "done" ? new Date().toISOString() : null,
    },
  });

  revalidatePath("/uebersicht");
  revalidatePath(`/projekt/${projectId}`);
  revalidatePath("/fokus");
}

export async function deleteTask(id: string, projectId: string) {
  const { databases } = await ctx();
  await databases.deleteDocument({
    databaseId: APPWRITE.db,
    collectionId: COLLECTIONS.tasks,
    documentId: id,
  });
  revalidatePath("/uebersicht");
  revalidatePath(`/projekt/${projectId}`);
  revalidatePath("/fokus");
}
