import type { Metadata } from "next";

import { DeleteAccount } from "@/components/delete-account";
import { Icon } from "@/components/icons";
import { ImportForm } from "@/components/import-form";
import { PageHeader } from "@/components/page-header";
import { SectionTitle } from "@/components/ui/bits";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth";
import { getUser } from "@/lib/appwrite/server";
import { loadWorkspace } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Konto" };

export default async function SettingsPage() {
  const [user, { projects, tasks }] = await Promise.all([getUser(), loadWorkspace()]);

  return (
    <div className="animate-rise">
      <PageHeader eyebrow="Konto und Daten" title="Einstellungen" />

      <section className="mb-10">
        <div className="nm-card flex items-center gap-4 p-5">
          <div className="nm-accent grid h-14 w-14 shrink-0 place-items-center rounded-[20px]">
            <span className="display text-xl">
              {(user?.name || user?.email || "?").slice(0, 1).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-ink">{user?.name}</p>
            <p className="truncate text-sm text-ink-dim">{user?.email}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="nm-sink rounded-2xl p-4 text-center">
            <p className="tnum text-2xl font-bold text-ink">{projects.length}</p>
            <p className="text-xs text-ink-dim">{projects.length === 1 ? "Projekt" : "Projekte"}</p>
          </div>
          <div className="nm-sink rounded-2xl p-4 text-center">
            <p className="tnum text-2xl font-bold text-ink">{tasks.length}</p>
            <p className="text-xs text-ink-dim">{tasks.length === 1 ? "Aufgabe" : "Aufgaben"}</p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <SectionTitle>Deine Daten</SectionTitle>
        <div className="nm-card flex flex-col gap-6 p-5">
          <div>
            <p className="mb-3 text-sm leading-relaxed text-ink-soft">
              Alles, was du hier anlegst, gehört dir. Lade jederzeit eine vollständige
              Kopie als JSON herunter.
            </p>
            <a
              href="/api/export"
              download
              className="nm-raise nm-press inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium text-ink"
            >
              <Icon.Download className="h-4 w-4" />
              Export herunterladen
            </a>
          </div>

          <div className="border-t border-white/5 pt-6">
            <p className="mb-3 text-sm leading-relaxed text-ink-soft">
              Einen Export wieder einspielen. Bestehende Projekte bleiben unangetastet —
              der Import legt zusätzliche Einträge an.
            </p>
            <ImportForm />
          </div>
        </div>
      </section>

      <section className="mb-10">
        <SectionTitle>Wie Fokus sortiert</SectionTitle>
        <div className="nm-sink rounded-[var(--radius-card)] p-5">
          <p className="mb-4 text-sm leading-relaxed text-ink-soft">
            Für jede Aufgabe schätzt du vier Dinge. Daraus entsteht eine Zahl, und die
            oberste Aufgabe ist die, die als Nächstes dran ist. Du musst dich nicht mehr
            entscheiden — das ist der ganze Trick.
          </p>
          <ul className="flex flex-col gap-2 text-sm leading-relaxed text-ink-soft">
            <li>
              <strong className="text-ink">Bringt viel</strong> — wie viel ändert sich, wenn es
              erledigt ist.
            </li>
            <li>
              <strong className="text-ink">Eilt</strong> — wie teuer wird es, wenn du wartest.
            </li>
            <li>
              <strong className="text-ink">Kostet Kraft</strong> — große Brocken rutschen nach
              unten, kleine Schritte nach oben.
            </li>
            <li>
              <strong className="text-ink">Wie sicher bist du dir</strong> — bei einer vagen Idee
              zählt die Aufgabe weniger als bei einer klaren.
            </li>
          </ul>
          <p className="mt-4 text-xs text-ink-dim">
            Die Rechnung dahinter: (Bringt viel × Eilt × Sicherheit) ÷ Kraft.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <form action={logout}>
          <Button type="submit" variant="raised" size="md" className="text-ink-soft">
            <Icon.Logout className="h-4 w-4" />
            Abmelden
          </Button>
        </form>

        <div className="border-t border-white/5 pt-8">
          <DeleteAccount projectCount={projects.length} />
        </div>
      </section>
    </div>
  );
}
