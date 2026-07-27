import type { Metadata } from "next";

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
        <SectionTitle>Wie die Priorität entsteht</SectionTitle>
        <div className="nm-sink rounded-[var(--radius-card)] p-5">
          <p className="mb-4 font-mono text-sm text-accent">
            (Wirkung × Dringlichkeit × Zuversicht) ÷ Aufwand
          </p>
          <ul className="flex flex-col gap-2 text-sm leading-relaxed text-ink-soft">
            <li>
              <strong className="text-ink">Wirkung</strong> — wie viel bewegt sich, wenn es fertig ist.
            </li>
            <li>
              <strong className="text-ink">Dringlichkeit</strong> — wie teuer wird Warten.
            </li>
            <li>
              <strong className="text-ink">Aufwand</strong> — teilt den Score, kleine Schritte steigen auf.
            </li>
            <li>
              <strong className="text-ink">Zuversicht</strong> — wie sicher bist du dir bei der Einschätzung.
            </li>
          </ul>
        </div>
      </section>

      <section>
        <form action={logout}>
          <Button type="submit" variant="raised" size="md" className="text-ink-soft">
            <Icon.Logout className="h-4 w-4" />
            Abmelden
          </Button>
        </form>
      </section>
    </div>
  );
}
