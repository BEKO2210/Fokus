"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ID, Permission, Role } from "node-appwrite";

import { APPWRITE, COLLECTIONS } from "@/lib/appwrite/config";
import { createSessionClient, getUser } from "@/lib/appwrite/server";
import { PROJECT_HEALTH, PROJECT_STATUS } from "@/lib/types";
import type { ProjectHealth, ProjectStatus } from "@/lib/types";

/**
 * `values` trägt die Eingaben zurück ins Formular. React setzt ein
 * `<form action={serverAction}>` nach dem Durchlauf zurück — ohne das hier
 * wären bei jedem Serverfehler alle Felder leer, inklusive achttausend
 * Zeichen Notizen.
 */
export type ActionState =
  | { error?: string; ok?: boolean; values?: Record<string, string> }
  | undefined;

const PROJECT_FIELDS = [
  "name",
  "summary",
  "status",
  "health",
  "deadline",
  "tags",
  "links",
  "place",
  "notes",
] as const;

function keepValues(fd: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of PROJECT_FIELDS) out[key] = String(fd.get(key) ?? "");
  return out;
}

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

function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12)
    .map((s) => s.slice(0, 40));
}

/**
 * Eine Adresse pro Zeile, optional mit Titel davor: "Notizen|https://…".
 * Nur http und https — sonst liessen sich über `javascript:` Skripte einschleusen.
 */
function parseLinks(raw: string | null): string[] {
  if (!raw) return [];
  const out: string[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const [first, ...rest] = trimmed.split("|");
    const href = (rest.length ? rest.join("|") : first).trim();
    const label = rest.length ? first.trim().slice(0, 60) : "";
    let parsed: URL;
    try {
      parsed = new URL(href);
    } catch {
      continue;
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") continue;
    out.push((label ? `${label}|${parsed.toString()}` : parsed.toString()).slice(0, 300));
    if (out.length >= 8) break;
  }
  return out;
}

function parseDeadline(raw: string | null): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function projectPayload(fd: FormData) {
  const status = String(fd.get("status") ?? "active") as ProjectStatus;
  const health = String(fd.get("health") ?? "on_track") as ProjectHealth;

  return {
    name: String(fd.get("name") ?? "").trim().slice(0, 120),
    summary: text(fd, "summary")?.slice(0, 2000) ?? null,
    status: PROJECT_STATUS.includes(status) ? status : "active",
    health: PROJECT_HEALTH.includes(health) ? health : "on_track",
    deadline: parseDeadline(text(fd, "deadline")),
    tags: parseTags(text(fd, "tags")),
    links: parseLinks(text(fd, "links")),
    place: text(fd, "place")?.slice(0, 300) ?? null,
    notes: text(fd, "notes")?.slice(0, 8000) ?? null,
  };
}

export async function createProject(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { databases, user } = await ctx();
  const data = projectPayload(fd);
  if (!data.name) return { error: "Das Projekt braucht einen Namen.", values: keepValues(fd) };

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
    // Rohe Appwrite-Meldungen sind englisch und technisch — nur ins Log damit.
    console.error("[projects] Anlegen fehlgeschlagen", err);
    return {
      error: "Konnte nicht gespeichert werden. Bitte gleich noch einmal versuchen.",
      values: keepValues(fd),
    };
  }

  revalidatePath("/");
  redirect(`/projekt/${id}`);
}

export async function updateProject(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { databases } = await ctx();
  const id = String(fd.get("id") ?? "");
  if (!id) return { error: "Projekt nicht gefunden." };

  const data = projectPayload(fd);
  if (!data.name) return { error: "Das Projekt braucht einen Namen.", values: keepValues(fd) };

  try {
    await databases.updateDocument({
      databaseId: APPWRITE.db,
      collectionId: COLLECTIONS.projects,
      documentId: id,
      data,
    });
  } catch (err) {
    console.error("[projects] Speichern fehlgeschlagen", err);
    return {
      error: "Konnte nicht gespeichert werden. Bitte gleich noch einmal versuchen.",
      values: keepValues(fd),
    };
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
  // In Bloecken, damit auch Projekte mit mehr als 500 Aufgaben leer werden.
  const { Query } = await import("node-appwrite");
  for (;;) {
    const page = await databases.listDocuments({
      databaseId: APPWRITE.db,
      collectionId: COLLECTIONS.tasks,
      queries: [Query.equal("projectId", id), Query.limit(100)],
    });
    if (page.documents.length === 0) break;
    await Promise.all(
      page.documents.map((t) =>
        databases.deleteDocument({
          databaseId: APPWRITE.db,
          collectionId: COLLECTIONS.tasks,
          documentId: t.$id,
        }),
      ),
    );
    if (page.documents.length < 100) break;
  }

  await databases.deleteDocument({
    databaseId: APPWRITE.db,
    collectionId: COLLECTIONS.projects,
    documentId: id,
  });

  revalidatePath("/");
  redirect("/");
}
