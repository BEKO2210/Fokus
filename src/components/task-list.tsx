"use client";

import { useState, useTransition } from "react";

import { Icon } from "@/components/icons";
import { ScoreWhy } from "@/components/score-why";
import { TaskForm } from "@/components/task-form";
import { Chip } from "@/components/ui/bits";
import { Button } from "@/components/ui/button";
import { deleteTask, setTaskStatus, updateTask } from "@/lib/actions/tasks";
import { cn } from "@/lib/cn";
import { LEVEL_COLOR, LEVEL_LABEL, formatDeadline, formatScore, priorityLevel, priorityScore } from "@/lib/score";
import { TASK_STATUS_LABEL } from "@/lib/types";
import type { Task, TaskStatus } from "@/lib/types";

const COLUMNS: TaskStatus[] = ["now", "inbox", "later", "done"];

export function TaskList({ projectId, tasks }: { projectId: string; tasks: Task[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const grouped = COLUMNS.map((status) => ({
    status,
    items: tasks
      .filter((t) => t.status === status)
      .sort((a, b) =>
        status === "done"
          ? new Date(b.completedAt ?? b.createdAt).getTime() -
            new Date(a.completedAt ?? a.createdAt).getTime()
          : priorityScore(b) - priorityScore(a),
      ),
  })).filter((g) => g.items.length > 0);

  if (tasks.length === 0) {
    return (
      <div className="nm-sink rounded-[var(--radius-card)] px-6 py-10 text-center">
        <p className="text-sm text-ink-soft">
          Noch keine Aufgabe. Leg oben die erste an — dann rechnet Fokus die Priorität aus.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {grouped.map((group) => (
        <section key={group.status}>
          <div className="mb-3 flex items-baseline gap-2">
            <h3 className="label-xs">{TASK_STATUS_LABEL[group.status]}</h3>
            <span className="tnum text-xs text-ink-dim">{group.items.length}</span>
          </div>
          <ul className="flex flex-col gap-3">
            {group.items.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                projectId={projectId}
                open={openId === task.id}
                onToggleOpen={() => setOpenId(openId === task.id ? null : task.id)}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function TaskRow({
  task,
  projectId,
  open,
  onToggleOpen,
}: {
  task: Task;
  projectId: string;
  open: boolean;
  onToggleOpen: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const score = priorityScore(task);
  const level = priorityLevel(score);
  const done = task.status === "done";
  const due = formatDeadline(task.dueDate);

  return (
    <li className={cn("nm-card overflow-hidden transition-opacity", pending && "opacity-60")}>
      <div className="flex items-start gap-3 p-4">
        <button
          type="button"
          aria-label={done ? "Als offen markieren" : "Als erledigt markieren"}
          aria-pressed={done}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await setTaskStatus(task.id, projectId, done ? "inbox" : "done");
            })
          }
          className={cn(
            "nm-press mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl",
            done ? "nm-accent" : "nm-sink-sm text-ink-dim hover:text-ink",
          )}
        >
          <Icon.Check className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onToggleOpen}
          aria-expanded={open}
          className="min-w-0 flex-1 text-left"
        >
          <p
            className={cn(
              "text-[0.95rem] font-semibold leading-snug",
              done ? "text-ink-dim line-through" : "text-ink",
            )}
          >
            {task.title}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {!done ? (
              <span
                className="tnum inline-flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: LEVEL_COLOR[level] }}
              >
                {formatScore(score)}
                <span className="font-normal text-ink-dim">{LEVEL_LABEL[level]}</span>
              </span>
            ) : null}
            {due ? <Chip tone={task.dueDate && new Date(task.dueDate) < new Date() && !done ? "danger" : "muted"}>{due}</Chip> : null}
            {task.notes ? <span className="text-xs text-ink-dim">Notiz</span> : null}
          </div>
        </button>

        <Icon.Chevron
          className={cn(
            "mt-2 h-4 w-4 shrink-0 text-ink-dim transition-transform duration-300",
            open && "rotate-90",
          )}
        />
      </div>

      {open ? (
        <div className="border-t border-white/5 px-4 pb-5 pt-5">
          {!done ? (
            <div className="mb-5">
              <ScoreWhy task={task} defaultOpen />
            </div>
          ) : null}
          {task.notes ? (
            <p className="nm-sink-sm mb-5 whitespace-pre-wrap rounded-2xl p-4 text-sm leading-relaxed text-ink-soft">
              {task.notes}
            </p>
          ) : null}

          <TaskForm
            action={updateTask}
            projectId={projectId}
            task={task}
            submitLabel="Änderungen speichern"
            onDone={onToggleOpen}
          />

          <div className="mt-6 flex items-center gap-3">
            {confirmDelete ? (
              <>
                <Button
                  variant="raised"
                  size="sm"
                  className="text-danger"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await deleteTask(task.id, projectId);
                    })
                  }
                >
                  <Icon.Trash className="h-4 w-4" />
                  Wirklich löschen
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                  Abbrechen
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
                <Icon.Trash className="h-4 w-4" />
                Aufgabe löschen
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </li>
  );
}
