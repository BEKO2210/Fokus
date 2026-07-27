"use client";

import { useState } from "react";

import { Icon } from "@/components/icons";
import { TaskForm } from "@/components/task-form";
import { Button } from "@/components/ui/button";
import { createTask } from "@/lib/actions/tasks";

/** Aufklappbares Formular fuer neue Aufgaben. Zugeklappt nur ein Knopf. */
export function TaskComposer({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="accent" className="w-full" onClick={() => setOpen(true)}>
        <Icon.Plus className="h-4 w-4" />
        Aufgabe hinzufügen
      </Button>
    );
  }

  return (
    <div className="nm-card animate-rise p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-base font-bold text-ink">Neue Aufgabe</h3>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Schließen
        </Button>
      </div>
      <TaskForm
        action={createTask}
        projectId={projectId}
        submitLabel="Aufgabe anlegen"
        onDone={() => setOpen(false)}
      />
    </div>
  );
}
