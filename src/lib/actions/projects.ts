"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ID, Permission, Role } from "node-appwrite";

import { APPWRITE, COLLECTIONS } from "@/lib/appwrite/config";
import { createSessionClient, getUser } from "@/lib/appwrite/server";
import { PROJECT_HEALTH, PROJECT_STATUS } from "@/lib/types";
import type { ProjectHealth, ProjectStatus } from "@/lib/types";

export type ActionState = { error?: string; ok?: boolean } | undefined;

async function ctx() {
  const [client, user] = await Promise.all([createSessionClient(), getUser()]);
  if (!client || !user) redirect("/anmelden");
  return { databases: client.databases, user };
}

function ownerPermissions(userId: string) {
  return [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];
}

function text(fd: FormData, key: string): string | null {
  const v = String(fd.get(key) ?? "").trim();
  return v.length ? v : null;
}

function parseStack(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12)
    .map((s) => s.slice(0, 40));
}

function parseDeadline(raw: string | null): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function projectPayload(fd: FormData) {
  const status = String(fd.get("status") ?? "active") as ProjectStatus;
  const health = String(fd.get("health") ?? "on_track") as ProjectHealth;
  const portRaw = text(fd, "port");
  const port = portRaw ? Number.parseInt(portRaw, 10) : null;

  return {
    name: String(fd.get("name") ?? "").trim().slice(0, 120),
    summary: text(fd, "summary")?.slice(0, 2000) ?? null,
    status: PROJECT_STATUS.includes(status) ? status : "active",
    health: PROJECT_HEALTH.includes(health) ? health : "on_track",
    deadline: parseDeadline(text(fd, "deadline")),
    stack: parseStack(text(fd, "stack")),
    repoUrl: text(fd, "repoUrl")?.slice(0, 300) ?? null,
    liveUrl: text(fd, "liveUrl")?.slice(0, 300) ?? null,
    localPath: text(fd, "localPath")?.slice(0, 300) ?? null,
    port: port !== null && Number.isFinite(port) && port >= 0 && port <= 65535 ? port : null,
    notes: text(fd, "notes")?.slice(0, 8000) ?? null,
  };
}

export async function createProject(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { databases, user } = await ctx();
  const data = projectPayload(fd);
  if (!data.name) return { error: "Das Projekt braucht einen Namen." };

  let id: string;
  try {
    const doc = await databases.createDocument({
      databaseId: APPWRITE.db,
      collectionId: COLLECTIONS.projects,
      documentId: ID.unique(),
      data: { ...data, ownerId: user.id, accent: "orange", pinned: false, sortIndex: 0 },
      permissions: ownerPermissions(user.id),
    });
    id = doc.$id;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Speichern fehlgeschlagen." };
  }

  revalidatePath("/");
  redirect(`/projekt/${id}`);
}

export async function updateProject(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { databases } = await ctx();
  const id = String(fd.get("id") ?? "");
  if (!id) return { error: "Projekt nicht gefunden." };

  const data = projectPayload(fd);
  if (!data.name) return { error: "Das Projekt braucht einen Namen." };

  try {
    await databases.updateDocument({
      databaseId: APPWRITE.db,
      collectionId: COLLECTIONS.projects,
      documentId: id,
      data,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Speichern fehlgeschlagen." };
  }

  revalidatePath("/");
  revalidatePath(`/projekt/${id}`);
  return { ok: true };
}

export async function togglePin(id: string, pinned: boolean) {
  const { databases } = await ctx();
  await databases.updateDocument({
    databaseId: APPWRITE.db,
    collectionId: COLLECTIONS.projects,
    documentId: id,
    data: { pinned },
  });
  revalidatePath("/");
  revalidatePath(`/projekt/${id}`);
}

export async function setProjectStatus(id: string, status: ProjectStatus) {
  const { databases } = await ctx();
  if (!PROJECT_STATUS.includes(status)) return;
  await databases.updateDocument({
    databaseId: APPWRITE.db,
    collectionId: COLLECTIONS.projects,
    documentId: id,
    data: { status },
  });
  revalidatePath("/");
  revalidatePath(`/projekt/${id}`);
}

export async function setProjectHealth(id: string, health: ProjectHealth) {
  const { databases } = await ctx();
  if (!PROJECT_HEALTH.includes(health)) return;
  await databases.updateDocument({
    databaseId: APPWRITE.db,
    collectionId: COLLECTIONS.projects,
    documentId: id,
    data: { health },
  });
  revalidatePath("/");
  revalidatePath(`/projekt/${id}`);
}

export async function deleteProject(id: string) {
  const { databases } = await ctx();

  // Aufgaben des Projekts mitloeschen, sonst bleiben Waisen zurueck.
  const { Query } = await import("node-appwrite");
  const tasks = await databases.listDocuments({
    databaseId: APPWRITE.db,
    collectionId: COLLECTIONS.tasks,
    queries: [Query.equal("projectId", id), Query.limit(500)],
  });
  await Promise.all(
    tasks.documents.map((t) =>
      databases.deleteDocument({
        databaseId: APPWRITE.db,
        collectionId: COLLECTIONS.tasks,
        documentId: t.$id,
      }),
    ),
  );

  await databases.deleteDocument({
    databaseId: APPWRITE.db,
    collectionId: COLLECTIONS.projects,
    documentId: id,
  });

  revalidatePath("/");
  redirect("/");
}
