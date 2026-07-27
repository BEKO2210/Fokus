"use client";

import { useState, useTransition } from "react";

import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { deleteProject, setProjectHealth, setProjectStatus, togglePin } from "@/lib/actions/projects";
import { cn } from "@/lib/cn";
import { HEALTH_COLOR, HEALTH_LABEL, PROJECT_HEALTH, PROJECT_STATUS, STATUS_LABEL } from "@/lib/types";
import type { ProjectHealth, ProjectStatus } from "@/lib/types";

export function PinButton({ id, pinned }: { id: string; pinned: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      aria-label={pinned ? "Anheftung lösen" : "Projekt anheften"}
      aria-pressed={pinned}
      disabled={pending}
      onClick={() => start(async () => void (await togglePin(id, !pinned)))}
      className={cn(
        "nm-press grid h-11 w-11 place-items-center rounded-2xl",
        pinned ? "nm-accent" : "nm-raise text-ink-dim hover:text-ink",
        pending && "opacity-60",
      )}
    >
      <Icon.Pin className="h-5 w-5" />
    </button>
  );
}

/** Status und Zustand direkt umschalten, ohne den Umweg ueber das Formular. */
export function QuickSwitches({
  id,
  status,
  health,
}: {
  id: string;
  status: ProjectStatus;
  health: ProjectHealth;
}) {
  const [pending, start] = useTransition();

  return (
    <div className={cn("flex flex-col gap-4", pending && "opacity-60")}>
      <div>
        <p className="label-xs mb-2">Status</p>
        <div className="nm-sink no-scrollbar flex gap-1.5 overflow-x-auto rounded-full p-1.5">
          {PROJECT_STATUS.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={s === status}
              disabled={pending}
              onClick={() => start(async () => void (await setProjectStatus(id, s)))}
              className={cn(
                "h-9 shrink-0 rounded-full px-4 text-xs font-semibold transition-all duration-200",
                s === status ? "nm-accent" : "text-ink-dim hover:text-ink",
              )}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="label-xs mb-2">Zustand</p>
        <div className="nm-sink flex gap-1.5 rounded-full p-1.5">
          {PROJECT_HEALTH.map((h) => (
            <button
              key={h}
              type="button"
              aria-pressed={h === health}
              disabled={pending}
              onClick={() => start(async () => void (await setProjectHealth(id, h)))}
              className={cn(
                "flex h-9 flex-1 items-center justify-center gap-2 rounded-full px-3 text-xs font-semibold transition-all duration-200",
                h === health ? "nm-raise-sm text-ink" : "text-ink-dim hover:text-ink",
              )}
            >
              <span
                aria-hidden
                className="h-2 w-2 rounded-full"
                style={{
                  background: HEALTH_COLOR[h],
                  boxShadow: h === health ? `0 0 10px ${HEALTH_COLOR[h]}` : undefined,
                }}
              />
              {HEALTH_LABEL[h]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DeleteProjectButton({ id, name }: { id: string; name: string }) {
  const [armed, setArmed] = useState(false);
  const [pending, start] = useTransition();

  if (!armed) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setArmed(true)}>
        <Icon.Trash className="h-4 w-4" />
        Projekt löschen
      </Button>
    );
  }

  return (
    <div className="nm-sink flex flex-col gap-3 rounded-2xl p-4">
      <p className="text-sm text-ink-soft">
        <strong className="text-ink">{name}</strong> und alle zugehörigen Aufgaben werden
        endgültig gelöscht. Das lässt sich nicht rückgängig machen.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="raised"
          size="sm"
          className="text-danger"
          disabled={pending}
          onClick={() => start(async () => void (await deleteProject(id)))}
        >
          {pending ? "Lösche …" : "Endgültig löschen"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setArmed(false)} disabled={pending}>
          Abbrechen
        </Button>
      </div>
    </div>
  );
}
