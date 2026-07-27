export const PROJECT_STATUS = ["idea", "active", "paused", "shipped", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUS)[number];

export const PROJECT_HEALTH = ["on_track", "at_risk", "blocked"] as const;
export type ProjectHealth = (typeof PROJECT_HEALTH)[number];

export const TASK_STATUS = ["inbox", "now", "later", "done"] as const;
export type TaskStatus = (typeof TASK_STATUS)[number];

export type Project = {
  id: string;
  name: string;
  summary: string | null;
  status: ProjectStatus;
  health: ProjectHealth;
  accent: string;
  deadline: string | null;
  stack: string[];
  repoUrl: string | null;
  liveUrl: string | null;
  localPath: string | null;
  port: number | null;
  pinned: boolean;
  sortIndex: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  notes: string | null;
  impact: number;
  urgency: number;
  effort: number;
  confidence: number;
  status: TaskStatus;
  dueDate: string | null;
  completedAt: string | null;
  sortIndex: number;
  createdAt: string;
};

export type FocusSession = {
  id: string;
  projectId: string | null;
  taskId: string | null;
  startedAt: string;
  seconds: number;
  label: string | null;
};

/** Projekt samt abgeleiteter Kennzahlen fuer die Uebersicht. */
export type ProjectWithStats = Project & {
  taskCount: number;
  doneCount: number;
  openCount: number;
  progress: number;
  topScore: number;
  nextTask: Task | null;
};

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  idea: "Idee",
  active: "Aktiv",
  paused: "Pausiert",
  shipped: "Live",
  archived: "Archiv",
};

export const HEALTH_LABEL: Record<ProjectHealth, string> = {
  on_track: "Läuft",
  at_risk: "Wackelt",
  blocked: "Blockiert",
};

export const HEALTH_COLOR: Record<ProjectHealth, string> = {
  on_track: "var(--color-ok)",
  at_risk: "var(--color-warn)",
  blocked: "var(--color-danger)",
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  inbox: "Eingang",
  now: "Jetzt",
  later: "Später",
  done: "Erledigt",
};
