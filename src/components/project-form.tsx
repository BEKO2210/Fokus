"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Icon } from "@/components/icons";
import { SubmitButton } from "@/components/ui/button";
import { Field, FormError, Input, Select, Textarea } from "@/components/ui/field";
import type { ActionState } from "@/lib/actions/projects";
import { PROJECT_HEALTH, PROJECT_STATUS, HEALTH_LABEL, STATUS_LABEL } from "@/lib/types";
import type { Project } from "@/lib/types";

function toDateInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export function ProjectForm({
  action,
  project,
  submitLabel,
}: {
  action: (state: ActionState, fd: FormData) => Promise<ActionState>;
  project?: Project;
  submitLabel: string;
}) {
  const cancelHref = project ? `/projekt/${project.id}` : "/";
  const [state, formAction] = useActionState<ActionState, FormData>(action, undefined);

  // Nach einem Serverfehler die zurückgegebenen Eingaben wieder einsetzen,
  // sonst tippt man alles neu.
  const kept = state?.values;
  const value = (key: string, fallback: string) => kept?.[key] ?? fallback;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {project ? <input type="hidden" name="id" value={project.id} /> : null}

      <Field label="Wie heißt das Projekt?" htmlFor="name">
        <Input
          id="name"
          name="name"
          required
          maxLength={120}
          defaultValue={value("name", project?.name ?? "")}
          placeholder="z. B. Umzug, Bachelorarbeit, Badezimmer"
        />
      </Field>

      <Field label="Worum geht es?" htmlFor="summary">
        <Textarea
          id="summary"
          name="summary"
          maxLength={2000}
          defaultValue={value("summary", project?.summary ?? "")}
          placeholder="Ein, zwei Sätze — damit du in drei Monaten noch weißt, was du dir dabei gedacht hast."
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Wo steht es gerade?" htmlFor="status">
          <Select id="status" name="status" defaultValue={value("status", project?.status ?? "active")}>
            {PROJECT_STATUS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Wie fühlt es sich an?" htmlFor="health">
          <Select id="health" name="health" defaultValue={value("health", project?.health ?? "on_track")}>
            {PROJECT_HEALTH.map((h) => (
              <option key={h} value={h}>
                {HEALTH_LABEL[h]}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Bis wann?" htmlFor="deadline" hint="Wenn es keinen Termin gibt, lass es leer.">
        <Input id="deadline" name="deadline" type="date" defaultValue={value("deadline", toDateInput(project?.deadline ?? null))} />
      </Field>

      <Field
        label="Schlagwörter"
        htmlFor="tags"
        hint="Womit du das Projekt später wiederfindest. Mit Komma trennen."
      >
        <Input
          id="tags"
          name="tags"
          defaultValue={value("tags", project?.tags.join(", ") ?? "")}
          placeholder="Zuhause, dringend, mit Anna"
        />
      </Field>

      <Field
        label="Links"
        htmlFor="links"
        hint="Eine Adresse pro Zeile. Mit Namen davor: Unterlagen|https://…"
      >
        <Textarea
          id="links"
          name="links"
          defaultValue={value("links", project?.links.join("\n") ?? "")}
          placeholder={"Angebot|https://…\nhttps://…"}
          className="min-h-24"
        />
      </Field>

      <Field
        label="Wo liegt das Material?"
        htmlFor="place"
        hint="Ordner, Regal, Werkstatt, Cloud — was dir hilft, es wiederzufinden."
      >
        <Input
          id="place"
          name="place"
          maxLength={300}
          defaultValue={value("place", project?.place ?? "")}
          placeholder="Ordner im Arbeitszimmer, zweites Fach"
        />
      </Field>

      <Field label="Notizen" htmlFor="notes">
        <Textarea
          id="notes"
          name="notes"
          maxLength={8000}
          defaultValue={value("notes", project?.notes ?? "")}
          placeholder="Was du nicht vergessen darfst. Entscheidungen, offene Fragen, Ansprechpartner …"
          className="min-h-40"
        />
      </Field>

      <FormError message={state?.error} />
      {state?.ok ? (
        <p role="status" className="nm-sink-sm rounded-2xl px-4 py-3 text-sm text-ok">
          Gespeichert.
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton size="lg" className="w-full sm:w-auto sm:px-10" pendingLabel="Speichere …">
          <Icon.Check className="h-4 w-4" />
          {submitLabel}
        </SubmitButton>
        <Link
          href={cancelHref}
          className="inline-flex h-12 items-center justify-center rounded-full px-6 text-sm text-ink-soft hover:text-ink"
        >
          Abbrechen
        </Link>
      </div>
    </form>
  );
}
