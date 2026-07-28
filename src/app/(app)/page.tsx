import Link from "next/link";

import { FocusBars } from "@/components/focus-bars";
import { Icon } from "@/components/icons";
import { MomentumDial } from "@/components/momentum-dial";
import { ProjectCard } from "@/components/project-card";
import { Chip, EmptyState, SectionTitle } from "@/components/ui/bits";
import { LinkButton } from "@/components/ui/button";
import { getUser } from "@/lib/appwrite/server";
import { focusByDay, loadRecentSessions, loadWorkspace } from "@/lib/data";
import { plural } from "@/lib/plural";
import { daysUntil, priorityScore } from "@/lib/score";
import { dayKey, todayKey } from "@/lib/time";

export const dynamic = "force-dynamic";

function greeting(hour: number) {
  if (hour < 5) return "Noch wach";
  if (hour < 11) return "Guten Morgen";
  if (hour < 18) return "Hallo";
  return "Guten Abend";
}

export default async function OverviewPage() {
  const [user, workspace, sessions] = await Promise.all([
    getUser(),
    loadWorkspace(),
    loadRecentSessions(120),
  ]);

  const { projects, tasks } = workspace;
  const live = projects.filter((p) => p.status !== "archived");
  const openTasks = tasks.filter((t) => t.status !== "done");

  const activeCount = projects.filter((p) => p.status === "active").length;
  const troubled = projects.filter((p) => p.health !== "on_track" && p.status !== "archived").length;
  const dueSoon = projects.filter((p) => {
    const d = daysUntil(p.deadline);
    return d !== null && d <= 7 && p.status !== "archived" && p.status !== "shipped";
  }).length;

  const today = todayKey();
  const doneToday = tasks.filter((t) => t.completedAt && dayKey(t.completedAt) === today).length;

  const bars = focusByDay(sessions, 7);
  const focusToday = Math.round((bars.at(-1)?.seconds ?? 0) / 60);

  // Die eine Aufgabe, die als Naechstes zaehlt — projektuebergreifend.
  const ranked = openTasks
    .map((t) => ({ task: t, score: priorityScore(t) }))
    .sort((a, b) => b.score - a.score);
  const next = ranked[0];
  const nextProject = next ? projects.find((p) => p.id === next.task.projectId) : undefined;

  const firstName = user?.name?.split(" ")[0] ?? "";

  return (
    <div className="animate-rise">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="label-xs">{greeting(new Date().getHours())}</p>
          <h1 className="display mt-2 text-[2.6rem] text-ink">{firstName || "Fokus"}</h1>
        </div>
        <Chip tone={focusToday > 0 ? "accent" : "muted"} className="mt-1">
          <Icon.Clock className="h-3.5 w-3.5" />
          {focusToday} min heute
        </Chip>
      </header>

      {projects.length === 0 ? (
        <EmptyState
          icon={<Icon.Grid className="h-6 w-6" />}
          title="Noch nichts drin"
          body="Trag ein, was dir gerade im Kopf herumgeht — Umzug, Steuererklärung, das Regal im Flur. Sobald du Aufgaben dazu anlegst, sagt dir Fokus, womit du anfängst."
          action={
            <LinkButton href="/projekt/neu" variant="accent" className="mt-2">
              Erstes Projekt anlegen
            </LinkButton>
          }
        />
      ) : (
        <>
          <section className="mb-12 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-10">
            <MomentumDial
              value={String(openTasks.length)}
              unit="offen"
              caption={`${plural(activeCount, "aktives Projekt", "aktive Projekte")}`}
              satellites={[
                { icon: <Icon.Flame className="h-4 w-4" />, label: "brauchen Hilfe", value: String(troubled), hot: troubled > 0 },
                { icon: <Icon.Calendar className="h-4 w-4" />, label: "diese Woche fällig", value: String(dueSoon) },
                { icon: <Icon.Bolt className="h-4 w-4" />, label: "laufen gerade", value: String(activeCount) },
                { icon: <Icon.Check className="h-4 w-4" />, label: "heute geschafft", value: String(doneToday) },
              ]}
            />

            <div className="mt-14 lg:mt-0">
              {next && nextProject ? (
                <div className="nm-card p-6">
                  <p className="label-xs">Als Nächstes</p>
                  <h2 className="mt-3 text-xl font-bold leading-snug text-ink">
                    {next.task.title}
                  </h2>
                  <Link
                    href={`/projekt/${nextProject.id}`}
                    className="mt-2 inline-block text-sm text-accent underline-offset-4 hover:underline"
                  >
                    {nextProject.name}
                  </Link>
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <div>
                      <span className="tnum display text-3xl text-accent-gradient">
                        {next.score.toFixed(1)}
                      </span>
                      <span className="ml-2 text-xs text-ink-dim">Score</span>
                    </div>
                    <LinkButton href="/fokus" variant="accent" size="md">
                      <Icon.Play className="h-4 w-4" />
                      Fokus starten
                    </LinkButton>
                  </div>
                </div>
              ) : (
                <div className="nm-sink rounded-[var(--radius-card)] p-6 text-center">
                  <p className="text-sm text-ink-soft">
                    Keine offene Aufgabe. Alles abgeräumt.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="mb-12">
            <SectionTitle
              right={<span className="label-xs">Minuten pro Tag</span>}
            >
              Fokuszeit
            </SectionTitle>
            <div className="nm-card px-5 pb-5">
              <FocusBars bars={bars} />
            </div>
          </section>

          <section>
            <SectionTitle
              right={
                <Link href="/projekt/neu" className="-my-3 py-3 text-sm font-semibold text-accent">
                  Neu
                </Link>
              }
            >
              Projekte
            </SectionTitle>
            {/* minmax(0,1fr) ist nötig: ohne das zieht ein einziger langer
                Projektname die Spalte auf und die ganze Seite scrollt seitwärts. */}
            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
              {live.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>

            {projects.length > live.length ? (
              <p className="mt-6 text-center text-xs text-ink-dim">
                {projects.length - live.length} archiviert
              </p>
            ) : null}
          </section>
        </>
      )}
    </div>
  );
}
