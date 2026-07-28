import type { Metadata } from "next";

import { FocusBars } from "@/components/focus-bars";
import { FocusTimer } from "@/components/focus-timer";
import type { FocusCandidate } from "@/components/focus-timer";
import { PageHeader } from "@/components/page-header";
import { SectionTitle } from "@/components/ui/bits";
import { focusByDay, loadRecentSessions, loadWorkspace } from "@/lib/data";
import { priorityScore } from "@/lib/score";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Fokus" };

export default async function FocusPage() {
  const [{ projects, tasks }, sessions] = await Promise.all([
    loadWorkspace(),
    loadRecentSessions(120),
  ]);

  const nameById = new Map(projects.map((p) => [p.id, p.name]));

  const candidates: FocusCandidate[] = tasks
    .filter((t) => t.status !== "done" && nameById.has(t.projectId))
    .sort((a, b) => priorityScore(b) - priorityScore(a))
    .map((task) => ({
      task,
      projectId: task.projectId,
      projectName: nameById.get(task.projectId)!,
    }));

  const bars = focusByDay(sessions, 7);
  const weekMinutes = Math.round(bars.reduce((sum, b) => sum + b.seconds, 0) / 60);

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Eine Sache zur Zeit"
        title="Fokus"
        lead="Wähle die Aufgabe, stell die Dauer ein, und lass alles andere liegen."
      />

      <FocusTimer
        candidates={candidates}
        emptyReason={projects.length === 0 ? "keine-projekte" : "keine-aufgaben"}
        firstProjectId={projects[0]?.id ?? null}
      />

      <section className="mt-14">
        <SectionTitle right={<span className="label-xs">{weekMinutes} min gesamt</span>}>
          Letzte 7 Tage
        </SectionTitle>
        <div className="nm-card px-5 pb-5">
          <FocusBars bars={bars} />
        </div>
      </section>
    </div>
  );
}
