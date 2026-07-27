import Link from "next/link";

import { Icon } from "@/components/icons";
import { Chip, Dot, ProgressRing } from "@/components/ui/bits";
import { cn } from "@/lib/cn";
import { formatDeadline, daysUntil } from "@/lib/score";
import { HEALTH_COLOR, HEALTH_LABEL, STATUS_LABEL } from "@/lib/types";
import type { ProjectWithStats } from "@/lib/types";

export function ProjectCard({ project }: { project: ProjectWithStats }) {
  const deadline = formatDeadline(project.deadline);
  const days = daysUntil(project.deadline);
  const overdue = days !== null && days < 0;
  const dimmed = project.status === "archived" || project.status === "shipped";

  return (
    <Link
      href={`/projekt/${project.id}`}
      className={cn(
        "nm-card nm-press group block p-5 transition-shadow",
        dimmed && "opacity-70 hover:opacity-100",
      )}
    >
      <div className="flex items-start gap-4">
        <ProgressRing value={project.progress} size={54} stroke={6} label={`${project.progress} Prozent erledigt`}>
          <span className="tnum text-[0.8rem] font-bold text-ink">{project.progress}</span>
        </ProgressRing>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-[1.05rem] font-bold leading-tight text-ink">
              {project.name}
            </h3>
            {project.pinned ? (
              <Icon.Pin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            ) : null}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-dim">
            <span className="inline-flex items-center gap-1.5">
              <Dot color={HEALTH_COLOR[project.health]} pulse={project.health === "blocked"} />
              {HEALTH_LABEL[project.health]}
            </span>
            <span aria-hidden>·</span>
            <span>{STATUS_LABEL[project.status]}</span>
            {project.taskCount > 0 ? (
              <>
                <span aria-hidden>·</span>
                <span className="tnum">
                  {project.doneCount}/{project.taskCount}{" "}
                  {project.taskCount === 1 ? "Aufgabe" : "Aufgaben"}
                </span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {project.nextTask ? (
        <p className="mt-4 flex items-start gap-2 text-sm leading-snug text-ink-soft">
          <Icon.Chevron className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
          <span className="line-clamp-2">{project.nextTask.title}</span>
        </p>
      ) : (
        <p className="mt-4 text-sm text-ink-dim">Keine offene Aufgabe.</p>
      )}

      {(deadline || project.stack.length > 0) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {deadline ? (
            <Chip tone={overdue ? "danger" : days !== null && days <= 7 ? "warn" : "muted"}>
              <Icon.Calendar className="h-3.5 w-3.5" />
              {deadline}
            </Chip>
          ) : null}
          {project.stack.slice(0, 3).map((s) => (
            <Chip key={s}>{s}</Chip>
          ))}
          {project.stack.length > 3 ? <Chip>+{project.stack.length - 3}</Chip> : null}
        </div>
      )}
    </Link>
  );
}
