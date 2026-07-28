"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/ui/button";
import { Field, FormError, Input, Select, Textarea } from "@/components/ui/field";
import { ConfidenceSlider, Rating } from "@/components/ui/rating";
import type { TaskActionState } from "@/lib/actions/tasks";
import { TASK_STATUS, TASK_STATUS_LABEL } from "@/lib/types";
import type { Task } from "@/lib/types";

function toDateInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export function TaskForm({
  action,
  projectId,
  task,
  submitLabel,
  onDone,
}: {
  action: (state: TaskActionState, fd: FormData) => Promise<TaskActionState>;
  projectId: string;
  task?: Task;
  submitLabel: string;
  onDone?: () => void;
}) {
  const [state, formAction] = useActionState<TaskActionState, FormData>(
    async (prev, fd) => {
      const result = await action(prev, fd);
      if (result?.ok) onDone?.();
      return result;
    },
    undefined,
  );

  // Eingaben nach einem Serverfehler wieder einsetzen.
  const kept = state?.values;
  const value = (key: string, fallback: string) => kept?.[key] ?? fallback;
  const num = (key: string, fallback: number) => {
    const raw = kept?.[key];
    const parsed = raw ? Number.parseInt(raw, 10) : NaN;
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="projectId" value={projectId} />
      {task ? <input type="hidden" name="id" value={task.id} /> : null}

      <Field label="Aufgabe" htmlFor={`title-${task?.id ?? "neu"}`}>
        <Input
          id={`title-${task?.id ?? "neu"}`}
          name="title"
          required
          maxLength={200}
          defaultValue={value("title", task?.title ?? "")}
          placeholder="Was genau ist zu tun?"
        />
      </Field>

      <div className="nm-sink flex flex-col gap-6 rounded-[var(--radius-card)] p-5">
        <p className="text-xs leading-relaxed text-ink-dim">
          Vier kurze Einschätzungen, danach rechnet Fokus aus, was zuerst dran ist.
          Schätz einfach aus dem Bauch — es muss nicht stimmen, es muss nur helfen.
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          <Rating
            name="impact"
            label="Bringt viel"
            hint="Wie viel ändert sich, wenn es erledigt ist?"
            defaultValue={num("impact", task?.impact ?? 3)}
          />
          <Rating
            name="urgency"
            label="Eilt"
            hint="Wie teuer wird es, wenn du wartest?"
            defaultValue={num("urgency", task?.urgency ?? 3)}
          />
          <Rating
            name="effort"
            label="Kostet Kraft"
            hint="Wie groß ist der Brocken?"
            defaultValue={num("effort", task?.effort ?? 3)}
          />
        </div>
        <ConfidenceSlider name="confidence" defaultValue={num("confidence", task?.confidence ?? 80)} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Spalte" htmlFor={`status-${task?.id ?? "neu"}`}>
          <Select id={`status-${task?.id ?? "neu"}`} name="status" defaultValue={value("status", task?.status ?? "inbox")}>
            {TASK_STATUS.map((s) => (
              <option key={s} value={s}>
                {TASK_STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Fällig am" htmlFor={`due-${task?.id ?? "neu"}`}>
          <Input
            id={`due-${task?.id ?? "neu"}`}
            name="dueDate"
            type="date"
            defaultValue={value("dueDate", toDateInput(task?.dueDate ?? null))}
          />
        </Field>
      </div>

      <Field label="Notiz" htmlFor={`notes-${task?.id ?? "neu"}`}>
        <Textarea
          id={`notes-${task?.id ?? "neu"}`}
          name="notes"
          maxLength={4000}
          defaultValue={value("notes", task?.notes ?? "")}
          placeholder="Kontext, Links, nächster konkreter Schritt …"
        />
      </Field>

      <FormError message={state?.error} />

      <SubmitButton className="w-full sm:w-auto sm:self-start sm:px-10" pendingLabel="Speichere …">
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
