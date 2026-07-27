"use client";

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
  const [state, formAction] = useActionState<ActionState, FormData>(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {project ? <input type="hidden" name="id" value={project.id} /> : null}

      <Field label="Projektname" htmlFor="name">
        <Input
          id="name"
          name="name"
          required
          maxLength={120}
          defaultValue={project?.name}
          placeholder="z. B. Elementa"
        />
      </Field>

      <Field label="Worum geht es?" htmlFor="summary">
        <Textarea
          id="summary"
          name="summary"
          maxLength={2000}
          defaultValue={project?.summary ?? ""}
          placeholder="Ein, zwei Sätze — damit du in drei Monaten noch weißt, was das war."
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={project?.status ?? "active"}>
            {PROJECT_STATUS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Zustand" htmlFor="health">
          <Select id="health" name="health" defaultValue={project?.health ?? "on_track"}>
            {PROJECT_HEALTH.map((h) => (
              <option key={h} value={h}>
                {HEALTH_LABEL[h]}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Deadline" htmlFor="deadline" hint="Optional.">
          <Input id="deadline" name="deadline" type="date" defaultValue={toDateInput(project?.deadline ?? null)} />
        </Field>

        <Field label="Port" htmlFor="port" hint="Lokaler Dev-Port, falls vorhanden.">
          <Input
            id="port"
            name="port"
            type="number"
            min={0}
            max={65535}
            inputMode="numeric"
            defaultValue={project?.port ?? ""}
            placeholder="3016"
          />
        </Field>
      </div>

      <Field label="Stack" htmlFor="stack" hint="Mit Komma trennen, maximal 12 Einträge.">
        <Input
          id="stack"
          name="stack"
          defaultValue={project?.stack.join(", ")}
          placeholder="Next.js, Appwrite, Tailwind"
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Repository" htmlFor="repoUrl">
          <Input id="repoUrl" name="repoUrl" type="url" defaultValue={project?.repoUrl ?? ""} placeholder="https://github.com/…" />
        </Field>
        <Field label="Live-URL" htmlFor="liveUrl">
          <Input id="liveUrl" name="liveUrl" type="url" defaultValue={project?.liveUrl ?? ""} placeholder="https://…" />
        </Field>
      </div>

      <Field label="Lokaler Pfad" htmlFor="localPath">
        <Input id="localPath" name="localPath" defaultValue={project?.localPath ?? ""} placeholder="/home/…/projekt" />
      </Field>

      <Field label="Notizen" htmlFor="notes">
        <Textarea
          id="notes"
          name="notes"
          maxLength={8000}
          defaultValue={project?.notes ?? ""}
          placeholder="Entscheidungen, offene Fragen, Zugänge …"
          className="min-h-40"
        />
      </Field>

      <FormError message={state?.error} />
      {state?.ok ? (
        <p role="status" className="nm-sink-sm rounded-2xl px-4 py-3 text-sm text-ok">
          Gespeichert.
        </p>
      ) : null}

      <SubmitButton size="lg" className="w-full sm:w-auto sm:self-start sm:px-10" pendingLabel="Speichere …">
        <Icon.Check className="h-4 w-4" />
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
