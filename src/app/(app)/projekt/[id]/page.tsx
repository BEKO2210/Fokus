import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Icon } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { DeleteProjectButton, PinButton, QuickSwitches } from "@/components/project-actions";
import { TaskComposer } from "@/components/task-composer";
import { TaskList } from "@/components/task-list";
import { Chip, ProgressRing, SectionTitle } from "@/components/ui/bits";
import { LinkButton } from "@/components/ui/button";
import { loadProject } from "@/lib/data";
import { daysUntil, formatDeadline } from "@/lib/score";
import { parseLink } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await loadProject(id);
  return { title: data?.project.name ?? "Projekt" };
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const data = await loadProject(id);
  if (!data) notFound();

  const { project, tasks } = data;
  const deadline = formatDeadline(project.deadline);
  const days = daysUntil(project.deadline);

  const links = project.links
    .map(parseLink)
    .filter((l): l is NonNullable<typeof l> => l !== null);

  return (
    <div className="animate-rise">
      <PageHeader
        back="/uebersicht"
        eyebrow="Projekt"
        title={project.name}
        action={
          <div className="flex items-center gap-3">
            <PinButton id={project.id} pinned={project.pinned} />
            <LinkButton
              href={`/projekt/${project.id}/bearbeiten`}
              size="icon"
              aria-label="Projekt bearbeiten"
            >
              <Icon.Sliders className="h-5 w-5" />
            </LinkButton>
          </div>
        }
      />

      {project.summary ? (
        <p className="-mt-3 mb-8 max-w-xl text-sm leading-relaxed text-ink-soft">
          {project.summary}
        </p>
      ) : null}

      <section className="mb-9 grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
        <div className="nm-card flex items-center gap-5 p-5">
          <ProgressRing value={project.progress} size={76} stroke={8}>
            <span className="tnum text-base font-bold text-ink">{project.progress}%</span>
          </ProgressRing>
          <div className="min-w-0">
            <p className="tnum text-2xl font-bold text-ink">
              {project.doneCount}
              <span className="text-ink-dim">/{project.taskCount}</span>
            </p>
            <p className="text-xs text-ink-dim">Aufgaben erledigt</p>
            {project.openCount > 0 ? (
              <p className="mt-2 text-xs text-ink-soft">
                Top-Score <span className="tnum font-semibold text-accent">{project.topScore.toFixed(1)}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="nm-card p-5">
          <QuickSwitches id={project.id} status={project.status} health={project.health} />
        </div>
      </section>

      {(deadline || links.length > 0 || project.tags.length > 0) && (
        <section className="mb-6 flex flex-wrap items-center gap-2">
          {deadline ? (
            <Chip tone={days !== null && days < 0 ? "danger" : days !== null && days <= 7 ? "warn" : "muted"}>
              <Icon.Calendar className="h-3.5 w-3.5" />
              {deadline}
            </Chip>
          ) : null}
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer noopener"
              className="nm-raise-sm nm-press inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-ink-soft hover:text-accent"
            >
              <Icon.Link className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{l.label}</span>
            </a>
          ))}
          {project.tags.map((s) => (
            <Chip key={s}>{s}</Chip>
          ))}
        </section>
      )}

      {project.place ? (
        <p className="mb-10 flex items-start gap-2 text-sm text-ink-dim">
          <Icon.Pin className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{project.place}</span>
        </p>
      ) : (
        <div className="mb-10" />
      )}

      <section className="mb-10">
        <SectionTitle
          right={
            project.openCount > 0 ? (
              <Link href="/fokus" className="-my-3 py-3 text-sm font-semibold text-accent">
                Fokus starten
              </Link>
            ) : null
          }
        >
          Aufgaben
        </SectionTitle>
        <div className="mb-6">
          <TaskComposer projectId={project.id} />
        </div>
        <TaskList projectId={project.id} tasks={tasks} />
      </section>

      {project.notes ? (
        <section className="mb-10">
          <SectionTitle>Notizen</SectionTitle>
          <div className="nm-sink whitespace-pre-wrap rounded-[var(--radius-card)] p-5 text-sm leading-relaxed text-ink-soft">
            {project.notes}
          </div>
        </section>
      ) : null}

      <section className="pt-4">
        <DeleteProjectButton id={project.id} name={project.name} />
      </section>
    </div>
  );
}
