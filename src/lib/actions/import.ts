"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ID, Permission, Role } from "node-appwrite";

import { APPWRITE, COLLECTIONS } from "@/lib/appwrite/config";
import { createSessionClient, getUser } from "@/lib/appwrite/server";
import { plural } from "@/lib/plural";
import { PROJECT_HEALTH, PROJECT_STATUS, TASK_STATUS } from "@/lib/types";
import type { ProjectHealth, ProjectStatus, TaskStatus } from "@/lib/types";

export type ImportState = { error?: string; summary?: string } | undefined;

const MAX_PROJECTS = 200;
const MAX_TASKS = 2000;

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length ? trimmed.slice(0, max) : null;
}

function int(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === "number" ? v : Number.parseInt(String(v ?? ""), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function isoOrNull(v: unknown): string | null {
  if (typeof v !== "string" || !v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Import aus einer zuvor exportierten JSON-Datei. Legt immer neue Dokumente
 * an — vorhandene Daten werden nie ueberschrieben oder geloescht.
 */
export async function importBackup(_prev: ImportState, fd: FormData): Promise<ImportState> {
  const [client, user] = await Promise.all([createSessionClient(), getUser()]);
  if (!client || !user) redirect("/anmelden");

  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Keine Datei gewählt." };
  }
  if (file.size > 8 * 1024 * 1024) {
    return { error: "Die Datei ist größer als 8 MB." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    return { error: "Die Datei ist kein gültiges JSON." };
  }

  const root = parsed as Record<string, unknown>;
  if (root?.format !== "fokus-export") {
    return { error: "Das ist kein Fokus-Export." };
  }

  const rawProjects = Array.isArray(root.projects) ? root.projects.slice(0, MAX_PROJECTS) : [];
  const rawTasks = Array.isArray(root.tasks) ? root.tasks.slice(0, MAX_TASKS) : [];

  if (rawProjects.length === 0) return { error: "Der Export enthält keine Projekte." };

  const perms = [
    Permission.read(Role.user(user.id)),
    Permission.update(Role.user(user.id)),
    Permission.delete(Role.user(user.id)),
  ];
  const { databases } = client;

  // Alte auf neue Projekt-IDs abbilden, damit Aufgaben zugeordnet bleiben.
  const idMap = new Map<string, string>();
  let projectCount = 0;
  let taskCount = 0;
  let skipped = 0;

  for (const raw of rawProjects as Record<string, unknown>[]) {
    const name = str(raw.name, 120);
    if (!name) continue;

    const status = String(raw.status ?? "active") as ProjectStatus;
    const health = String(raw.health ?? "on_track") as ProjectHealth;
    const tags = Array.isArray(raw.tags)
      ? (raw.tags as unknown[])
          .map((s) => str(s, 40))
          .filter((s): s is string => Boolean(s))
          .slice(0, 12)
      : [];

    // Nur http und https übernehmen — sonst liesse sich über einen präparierten
    // Export eine `javascript:`-Adresse einschleusen, die später angeklickt wird.
    const links = Array.isArray(raw.links)
      ? (raw.links as unknown[])
          .map((s) => str(s, 300))
          .filter((s): s is string => {
            if (!s) return false;
            const href = s.includes("|") ? s.slice(s.indexOf("|") + 1) : s;
            try {
              const u = new URL(href);
              return u.protocol === "http:" || u.protocol === "https:";
            } catch {
              return false;
            }
          })
          .slice(0, 8)
      : [];

    try {
      const doc = await databases.createDocument({
        databaseId: APPWRITE.db,
        collectionId: COLLECTIONS.projects,
        documentId: ID.unique(),
        data: {
          name,
          summary: str(raw.summary, 2000),
          status: PROJECT_STATUS.includes(status) ? status : "active",
          health: PROJECT_HEALTH.includes(health) ? health : "on_track",
          accent: "orange",
          deadline: isoOrNull(raw.deadline),
          tags,
          links,
          place: str(raw.place, 300),
          pinned: Boolean(raw.pinned),
          sortIndex: int(raw.sortIndex, -99999, 99999, 0),
          notes: str(raw.notes, 8000),
          ownerId: user.id,
        },
        permissions: perms,
      });
      const oldId = typeof raw.id === "string" ? raw.id : null;
      if (oldId) idMap.set(oldId, doc.$id);
      projectCount++;
    } catch {
      // Einzelnes Projekt ueberspringen, Rest weiter importieren.
      skipped++;
    }
  }

  for (const raw of rawTasks as Record<string, unknown>[]) {
    const title = str(raw.title, 200);
    const oldProjectId = typeof raw.projectId === "string" ? raw.projectId : null;
    const projectId = oldProjectId ? idMap.get(oldProjectId) : undefined;
    if (!title || !projectId) continue;

    const status = String(raw.status ?? "inbox") as TaskStatus;
    try {
      await databases.createDocument({
        databaseId: APPWRITE.db,
        collectionId: COLLECTIONS.tasks,
        documentId: ID.unique(),
        data: {
          projectId,
          title,
          notes: str(raw.notes, 4000),
          impact: int(raw.impact, 1, 5, 3),
          urgency: int(raw.urgency, 1, 5, 3),
          effort: int(raw.effort, 1, 5, 3),
          confidence: int(raw.confidence, 0, 100, 80),
          status: TASK_STATUS.includes(status) ? status : "inbox",
          dueDate: isoOrNull(raw.dueDate),
          completedAt: isoOrNull(raw.completedAt),
          sortIndex: int(raw.sortIndex, -99999, 99999, 0),
          ownerId: user.id,
        },
        permissions: perms,
      });
      taskCount++;
    } catch {
      // Einzelne Aufgabe ueberspringen.
      skipped++;
    }
  }

  revalidatePath("/");
  revalidatePath("/einstellungen");

  const kernaussage = `${plural(projectCount, "Projekt", "Projekte")} und ${plural(taskCount, "Aufgabe", "Aufgaben")} importiert.`;
  // Stilles Verschlucken wäre bei einer Wiederherstellung gefährlich.
  const hinweis = skipped > 0 ? ` ${plural(skipped, "Eintrag", "Einträge")} konnten nicht angelegt werden.` : "";

  return { summary: kernaussage + hinweis };
}
