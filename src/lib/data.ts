import "server-only";

import { Query } from "node-appwrite";

import { APPWRITE, COLLECTIONS } from "./appwrite/config";
import { createSessionClient } from "./appwrite/server";
import { priorityScore, projectProgress, sortByPriority } from "./score";
import type {
  FocusSession,
  Project,
  ProjectStatus,
  ProjectWithStats,
  Task,
} from "./types";

type Doc = Record<string, unknown> & {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
};

function toProject(d: Doc): Project {
  return {
    id: d.$id,
    name: (d.name as string) ?? "",
    summary: (d.summary as string) ?? null,
    status: ((d.status as ProjectStatus) ?? "active") as ProjectStatus,
    health: (d.health as Project["health"]) ?? "on_track",
    accent: (d.accent as string) ?? "orange",
    deadline: (d.deadline as string) ?? null,
    stack: (d.stack as string[]) ?? [],
    repoUrl: (d.repoUrl as string) ?? null,
    liveUrl: (d.liveUrl as string) ?? null,
    localPath: (d.localPath as string) ?? null,
    port: (d.port as number) ?? null,
    pinned: Boolean(d.pinned),
    sortIndex: (d.sortIndex as number) ?? 0,
    notes: (d.notes as string) ?? null,
    createdAt: d.$createdAt,
    updatedAt: d.$updatedAt,
  };
}

function toTask(d: Doc): Task {
  return {
    id: d.$id,
    projectId: (d.projectId as string) ?? "",
    title: (d.title as string) ?? "",
    notes: (d.notes as string) ?? null,
    impact: (d.impact as number) ?? 3,
    urgency: (d.urgency as number) ?? 3,
    effort: (d.effort as number) ?? 3,
    confidence: (d.confidence as number) ?? 80,
    status: (d.status as Task["status"]) ?? "inbox",
    dueDate: (d.dueDate as string) ?? null,
    completedAt: (d.completedAt as string) ?? null,
    sortIndex: (d.sortIndex as number) ?? 0,
    createdAt: d.$createdAt,
  };
}

function toSession(d: Doc): FocusSession {
  return {
    id: d.$id,
    projectId: (d.projectId as string) ?? null,
    taskId: (d.taskId as string) ?? null,
    startedAt: (d.startedAt as string) ?? d.$createdAt,
    seconds: (d.seconds as number) ?? 0,
    label: (d.label as string) ?? null,
  };
}

async function db() {
  const client = await createSessionClient();
  if (!client) throw new Error("Keine Session");
  return client.databases;
}

/** Alle Projekte und Aufgaben des Nutzers in einem Rutsch. */
export async function loadWorkspace(): Promise<{
  projects: ProjectWithStats[];
  tasks: Task[];
}> {
  const databases = await db();

  const [projectRes, taskRes] = await Promise.all([
    databases.listDocuments({
      databaseId: APPWRITE.db,
      collectionId: COLLECTIONS.projects,
      queries: [Query.limit(200), Query.orderAsc("sortIndex")],
    }),
    databases.listDocuments({
      databaseId: APPWRITE.db,
      collectionId: COLLECTIONS.tasks,
      queries: [Query.limit(1000), Query.orderDesc("$createdAt")],
    }),
  ]);

  const tasks = (taskRes.documents as unknown as Doc[]).map(toTask);
  const byProject = new Map<string, Task[]>();
  for (const t of tasks) {
    const list = byProject.get(t.projectId) ?? [];
    list.push(t);
    byProject.set(t.projectId, list);
  }

  const projects = (projectRes.documents as unknown as Doc[])
    .map(toProject)
    .map((p) => withStats(p, byProject.get(p.id) ?? []))
    .sort(orderProjects);

  return { projects, tasks };
}

export function withStats(project: Project, tasks: Task[]): ProjectWithStats {
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const open = sortByPriority(tasks);
  return {
    ...project,
    taskCount: tasks.length,
    doneCount,
    openCount: open.length,
    progress: projectProgress(tasks.length, doneCount),
    topScore: open.length ? priorityScore(open[0]) : 0,
    nextTask: open[0] ?? null,
  };
}

/** Angepinnt zuerst, dann aktive vor ruhenden, dann nach Score. */
function orderProjects(a: ProjectWithStats, b: ProjectWithStats): number {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  const rank: Record<ProjectStatus, number> = {
    active: 0,
    idea: 1,
    paused: 2,
    shipped: 3,
    archived: 4,
  };
  if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
  if (b.topScore !== a.topScore) return b.topScore - a.topScore;
  return a.name.localeCompare(b.name, "de");
}

export async function loadProject(
  id: string,
): Promise<{ project: ProjectWithStats; tasks: Task[] } | null> {
  const databases = await db();
  try {
    const [doc, taskRes] = await Promise.all([
      databases.getDocument({
        databaseId: APPWRITE.db,
        collectionId: COLLECTIONS.projects,
        documentId: id,
      }),
      databases.listDocuments({
        databaseId: APPWRITE.db,
        collectionId: COLLECTIONS.tasks,
        queries: [
          Query.equal("projectId", id),
          Query.limit(500),
          Query.orderDesc("$createdAt"),
        ],
      }),
    ]);
    const tasks = (taskRes.documents as unknown as Doc[]).map(toTask);
    return { project: withStats(toProject(doc as unknown as Doc), tasks), tasks };
  } catch {
    return null;
  }
}

export async function loadRecentSessions(limit = 30): Promise<FocusSession[]> {
  const databases = await db();
  const res = await databases.listDocuments({
    databaseId: APPWRITE.db,
    collectionId: COLLECTIONS.sessions,
    queries: [Query.limit(limit), Query.orderDesc("startedAt")],
  });
  return (res.documents as unknown as Doc[]).map(toSession);
}

/** Sekunden Fokuszeit pro Tag, aelteste zuerst — fuer das Balkendiagramm. */
export function focusByDay(sessions: FocusSession[], days = 7) {
  const buckets: { day: Date; seconds: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    buckets.push({ day, seconds: 0 });
  }

  for (const s of sessions) {
    const started = new Date(s.startedAt);
    started.setHours(0, 0, 0, 0);
    const hit = buckets.find((b) => b.day.getTime() === started.getTime());
    if (hit) hit.seconds += s.seconds;
  }

  return buckets;
}
