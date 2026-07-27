import type { Task } from "./types";

export type ScoreInput = Pick<Task, "impact" | "urgency" | "effort" | "confidence">;

/**
 * Prioritaet = (Wirkung x Dringlichkeit x Zuversicht) / Aufwand.
 * Wertebereich bei 1..5 und 0..100 %: 0 bis 25.
 */
export function priorityScore(t: ScoreInput): number {
  const effort = Math.max(1, t.effort || 1);
  const raw = (t.impact * t.urgency * (t.confidence / 100)) / effort;
  return Math.round(raw * 10) / 10;
}

export type PriorityLevel = "critical" | "high" | "medium" | "low";

export function priorityLevel(score: number): PriorityLevel {
  if (score >= 12) return "critical";
  if (score >= 6) return "high";
  if (score >= 2.5) return "medium";
  return "low";
}

export const LEVEL_LABEL: Record<PriorityLevel, string> = {
  critical: "Kritisch",
  high: "Hoch",
  medium: "Mittel",
  low: "Niedrig",
};

export const LEVEL_COLOR: Record<PriorityLevel, string> = {
  critical: "var(--color-danger)",
  high: "var(--color-accent)",
  medium: "var(--color-warn)",
  low: "var(--color-ink-dim)",
};

/** Offene Aufgaben nach Score absteigend. Erledigte fliegen raus. */
export function sortByPriority<T extends ScoreInput & { status: string }>(tasks: T[]): T[] {
  return [...tasks]
    .filter((t) => t.status !== "done")
    .sort((a, b) => priorityScore(b) - priorityScore(a));
}

/** Fortschritt eines Projekts in Prozent. */
export function projectProgress(total: number, done: number): number {
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

/** Tage bis zur Deadline. Negativ = ueberfaellig. */
export function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function formatDeadline(iso: string | null): string | null {
  const days = daysUntil(iso);
  if (days === null) return null;
  if (days === 0) return "heute fällig";
  if (days === 1) return "morgen fällig";
  if (days === -1) return "1 Tag überfällig";
  if (days < 0) return `${Math.abs(days)} Tage überfällig`;
  if (days <= 30) return `in ${days} Tagen`;
  return new Date(iso!).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" });
}
