import "server-only";

import { redirect } from "next/navigation";
import { Query } from "node-appwrite";

import { APPWRITE, COLLECTIONS } from "./appwrite/config";
import { createSessionClient, getUser } from "./appwrite/server";
import { priorityScore, projectProgress, sortByPriority } from "./score";
import { dayKey, shiftDayKey, todayKey } from "./time";
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
    tags: (d.tags as string[]) ?? [],
    links: (d.links as string[]) ?? [],
    place: (d.place as string) ?? null,
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

/**
 * Datenbank-Zugriff im Namen des Nutzers, plus dessen ID.
 *
 * Die ID wandert in jede Abfrage als `ownerId`-Filter. Appwrites
 * Dokument-Permissions würden fremde Einträge ohnehin ausblenden — aber der
 * Filter nutzt den `by_owner`-Index, spart der Datenbank die Rechtefilterung
 * über alle Zeilen hinweg und ist die zweite Verteidigungslinie, falls an den
 * Permissions je etwas verrutscht.
 */
async function db() {
  const [client, user] = await Promise.all([createSessionClient(), getUser()]);
  // Nicht werfen: bei abgelaufener Session soll der Nutzer auf der Anmeldeseite
  // landen, nicht auf einer Fehlerseite.
  if (!client || !user) redirect("/anmelden");
  return { databases: client.databases, ownerId: user.id };
}

/** Alle Projekte und Aufgaben des Nutzers in einem Rutsch. */
export async function loadWorkspace(): Promise<{
  projects: ProjectWithStats[];
  tasks: Task[];
}> {
  const { databases, ownerId } = await db();

  const [projectRes, taskRes] = await Promise.all([
    databases.listDocuments({
      databaseId: APPWRITE.db,
      collectionId: COLLECTIONS.projects,
      queries: [Query.equal("ownerId", ownerId), Query.limit(200), Query.orderAsc("sortIndex")],
    }),
    databases.listDocuments({
      databaseId: APPWRITE.db,
      collectionId: COLLECTIONS.tasks,
      queries: [Query.equal("ownerId", ownerId), Query.limit(1000), Query.orderDesc("$createdAt")],
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
  const { databases, ownerId } = await db();
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
          Query.equal("ownerId", ownerId),
          Query.equal("projectId", id),
          Query.limit(500),
          Query.orderDesc("$createdAt"),
        ],
      }),
    ]);
    // Doppelter Boden: Appwrite liefert fremde Dokumente ohnehin nicht aus.
    if ((doc as unknown as Doc).ownerId !== ownerId) return null;
    const tasks = (taskRes.documents as unknown as Doc[]).map(toTask);
    return { project: withStats(toProject(doc as unknown as Doc), tasks), tasks };
  } catch {
    return null;
  }
}

export async function loadRecentSessions(limit = 30): Promise<FocusSession[]> {
  const { databases, ownerId } = await db();
  const res = await databases.listDocuments({
    databaseId: APPWRITE.db,
    collectionId: COLLECTIONS.sessions,
    queries: [Query.equal("ownerId", ownerId), Query.limit(limit), Query.orderDesc("startedAt")],
  });
  return (res.documents as unknown as Doc[]).map(toSession);
}

/**
 * Alles laden, ohne Kappungsgrenze — nur für den Export.
 *
 * Die Übersicht darf gern bei 200 Projekten aufhören; eine Sicherungskopie,
 * der still Daten fehlen, wäre dagegen wertlos.
 */
export async function loadEverything(): Promise<{
  projects: Project[];
  tasks: Task[];
  sessions: FocusSession[];
}> {
  const { databases, ownerId } = await db();

  async function all(collectionId: string, order: string): Promise<Doc[]> {
    const out: Doc[] = [];
    let cursor: string | null = null;
    for (;;) {
      const queries = [Query.equal("ownerId", ownerId), Query.limit(100), Query.orderDesc(order)];
      if (cursor) queries.push(Query.cursorAfter(cursor));
      const page = await databases.listDocuments({
        databaseId: APPWRITE.db,
        collectionId,
        queries,
      });
      const docs = page.documents as unknown as Doc[];
      out.push(...docs);
      if (docs.length < 100) break;
      cursor = docs[docs.length - 1].$id;
      // Notbremse gegen Endlosschleifen bei unerwarteten Antworten.
      if (out.length >= 20_000) break;
    }
    return out;
  }

  const [projects, tasks, sessions] = await Promise.all([
    all(COLLECTIONS.projects, "$createdAt"),
    all(COLLECTIONS.tasks, "$createdAt"),
    all(COLLECTIONS.sessions, "startedAt"),
  ]);

  return {
    projects: projects.map(toProject),
    tasks: tasks.map(toTask),
    sessions: sessions.map(toSession),
  };
}

/**
 * Sekunden Fokuszeit pro Kalendertag, aelteste zuerst — fuer das Balkendiagramm.
 * Tagesgrenzen in deutscher Zeit, nicht in der UTC-Serverzeit.
 */
export function focusByDay(sessions: FocusSession[], days = 7) {
  const today = todayKey();
  const buckets = Array.from({ length: days }, (_, i) => ({
    key: shiftDayKey(today, i - (days - 1)),
    seconds: 0,
  }));
  const index = new Map(buckets.map((b) => [b.key, b]));

  for (const s of sessions) {
    const bucket = index.get(dayKey(s.startedAt));
    if (bucket) bucket.seconds += s.seconds;
  }

  return buckets;
}
