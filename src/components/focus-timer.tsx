"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { logFocusSession } from "@/lib/actions/sessions";
import { enqueue, readPending, replacePending } from "@/lib/offline-queue";
import { cn } from "@/lib/cn";
import { plural } from "@/lib/plural";
import { LEVEL_COLOR, formatScore, priorityLevel, priorityScore } from "@/lib/score";
import type { Task } from "@/lib/types";

const PRESETS = [15, 25, 50] as const;

/**
 * Die laufende Sitzung überlebt Navigation und Neuladen.
 *
 * Vorher lag der Zustand nur in useState: ein Tipp auf "Übersicht" und die
 * Sitzung war weg, ohne Warnung und ohne Protokoll. Bei einer App, deren
 * Kernfunktion der Timer ist, ist das der teuerste Vertrauensverlust.
 */
const STORE_KEY = "fokus.timer.v1";

type Persisted = {
  startedAt: string;
  anchor: number | null;
  carried: number;
  minutes: number;
  taskId: string | null;
};

function readStore(): Persisted | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Persisted) : null;
  } catch {
    return null;
  }
}

function writeStore(value: Persisted | null) {
  try {
    if (value) window.localStorage.setItem(STORE_KEY, JSON.stringify(value));
    else window.localStorage.removeItem(STORE_KEY);
  } catch {
    // Privater Modus oder volle Quote — dann eben ohne Wiederherstellung.
  }
}

export type FocusCandidate = {
  task: Task;
  projectId: string;
  projectName: string;
};

function clock(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function FocusTimer({
  candidates,
  emptyReason,
  firstProjectId,
}: {
  candidates: FocusCandidate[];
  /** Warum die Liste leer ist — bestimmt den Hinweistext. */
  emptyReason: "keine-projekte" | "keine-aufgaben";
  firstProjectId: string | null;
}) {
  const [minutes, setMinutes] = useState<number>(25);
  const [selectedId, setSelectedId] = useState<string | null>(candidates[0]?.task.id ?? null);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [note, setNote] = useState<string | null>(null);

  // Zeitmessung ueber Zeitstempel, damit Hintergrund-Tabs nicht driften.
  const startedAtRef = useRef<string | null>(null);
  const anchorRef = useRef<number | null>(null);
  const carriedRef = useRef(0);

  const selected = useMemo(
    () => candidates.find((c) => c.task.id === selectedId) ?? null,
    [candidates, selectedId],
  );

  const persist = useCallback(() => {
    if (!startedAtRef.current) {
      writeStore(null);
      return;
    }
    writeStore({
      startedAt: startedAtRef.current,
      anchor: anchorRef.current,
      carried: carriedRef.current,
      minutes,
      taskId: selectedId,
    });
  }, [minutes, selectedId]);

  /** Gepufferte Sitzungen nachreichen. Was nicht durchgeht, bleibt in der Schlange. */
  const flush = useCallback(async () => {
    const offen = readPending();
    if (offen.length === 0) return;

    const rest: typeof offen = [];
    let uebertragen = 0;
    for (const eintrag of offen) {
      try {
        await logFocusSession(eintrag);
        uebertragen++;
      } catch {
        rest.push(eintrag);
      }
    }
    replacePending(rest);
    if (uebertragen > 0) {
      setNote(
        `${plural(uebertragen, "gespeicherte Sitzung", "gespeicherte Sitzungen")} nachgetragen.`,
      );
    }
  }, []);

  useEffect(() => {
    void flush();
    window.addEventListener("online", flush);
    return () => window.removeEventListener("online", flush);
  }, [flush]);

  // Beim Mounten eine unterbrochene Sitzung fortsetzen.
  useEffect(() => {
    const saved = readStore();
    if (!saved) return;
    startedAtRef.current = saved.startedAt;
    anchorRef.current = saved.anchor;
    carriedRef.current = saved.carried;
    setMinutes(saved.minutes);
    if (saved.taskId) setSelectedId(saved.taskId);
    if (saved.anchor !== null) {
      setRunning(true);
      setNote("Deine Sitzung lief weiter.");
    } else {
      setElapsed(saved.carried);
      setNote("Pausierte Sitzung wiederhergestellt.");
    }
  }, []);

  const target = minutes * 60;
  const remaining = Math.max(0, target - elapsed);
  const progress = target === 0 ? 0 : Math.min(100, (elapsed / target) * 100);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      if (anchorRef.current === null) return;
      setElapsed(carriedRef.current + (Date.now() - anchorRef.current) / 1000);
    };
    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [running]);

  const finish = useCallback(
    async (seconds: number) => {
      const startedAt = startedAtRef.current ?? new Date().toISOString();
      startedAtRef.current = null;
      anchorRef.current = null;
      carriedRef.current = 0;
      writeStore(null);
      setRunning(false);
      setElapsed(0);

      if (seconds < 30) {
        setNote("Unter 30 Sekunden wird nicht protokolliert.");
        return;
      }

      const eintrag = {
        projectId: selected?.projectId ?? null,
        taskId: selected?.task.id ?? null,
        label: selected?.task.title ?? null,
        seconds,
        startedAt,
      };
      const dauer = plural(Math.round(seconds / 60), "Minute", "Minuten");

      try {
        await logFocusSession(eintrag);
        setNote(`${dauer} protokolliert.`);
      } catch {
        // Kein Netz oder Server weg — die Sitzung darf trotzdem nicht verfallen.
        enqueue(eintrag);
        setNote(`${dauer} gespeichert. Wird nachgetragen, sobald du wieder online bist.`);
      }
    },
    [selected],
  );

  // Ziel erreicht: automatisch abschliessen.
  useEffect(() => {
    if (running && remaining === 0) {
      void finish(target);
    }
  }, [running, remaining, target, finish]);

  function start() {
    setNote(null);
    if (!startedAtRef.current) startedAtRef.current = new Date().toISOString();
    anchorRef.current = Date.now();
    setRunning(true);
    persist();
  }

  function pause() {
    if (anchorRef.current !== null) {
      carriedRef.current += (Date.now() - anchorRef.current) / 1000;
      anchorRef.current = null;
    }
    setRunning(false);
    persist();
  }

  function stop() {
    const total =
      carriedRef.current + (anchorRef.current !== null ? (Date.now() - anchorRef.current) / 1000 : 0);
    void finish(total);
  }

  const active = running || elapsed > 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Uhr */}
      <div className="relative mx-auto aspect-square w-full max-w-[19rem]">
        <div
          className="absolute inset-0 nm-raise-lg"
          style={{
            borderRadius: "40% 44% 38% 42% / 42% 38% 44% 40%",
            background: "linear-gradient(150deg, var(--color-base-lift) 0%, var(--color-base-sunk) 70%)",
          }}
        />

        <svg viewBox="0 0 100 100" className="absolute inset-[12%] -rotate-90">
          <defs>
            <linearGradient id="focus-arc" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--color-accent-from)" />
              <stop offset="100%" stopColor="var(--color-accent-to)" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-shade)" strokeWidth="3" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#focus-arc)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 45}
            strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
            style={{ transition: "stroke-dashoffset 600ms linear" }}
          />
        </svg>

        <div
          className="absolute inset-[22%] grid place-items-center rounded-full"
          style={{
            background: "linear-gradient(155deg, #34353b 0%, #232428 100%)",
            boxShadow:
              "10px 12px 26px var(--color-shade), -8px -10px 22px var(--color-glow), inset 1px 1px 2px rgb(255 255 255 / 0.05)",
          }}
        >
          <div className="text-center">
            <div
              className="display tnum text-[3rem] leading-none text-ink"
              role="timer"
              aria-hidden
            >
              {clock(remaining)}
            </div>
            {/* Nur der Zustand wird angesagt, nicht jede Sekunde — sonst
                redet der Screenreader ununterbrochen. */}
            <p role="status" className="mt-1 text-xs text-ink-dim">
              {running
                ? `läuft, noch ${clock(remaining)}`
                : active
                  ? `pausiert bei ${clock(remaining)}`
                  : `${minutes} Minuten`}
            </p>
          </div>
        </div>
      </div>

      {/* Steuerung */}
      <div className="flex items-center justify-center gap-4">
        {running ? (
          <Button size="icon-lg" onClick={pause} aria-label="Pausieren">
            <Icon.Pause className="h-5 w-5" />
          </Button>
        ) : (
          <Button variant="accent" size="icon-lg" onClick={start} aria-label="Fokus starten">
            <Icon.Play className="h-6 w-6" />
          </Button>
        )}
        <Button size="icon-lg" onClick={stop} disabled={!active} aria-label="Beenden und protokollieren">
          <Icon.Stop className="h-5 w-5" />
        </Button>
      </div>

      {note ? (
        <p role="status" className="text-center text-sm text-ink-soft">
          {note}
        </p>
      ) : null}

      {/* Dauer */}
      <div>
        <p className="label-xs mb-2" id="dauer-label">
          Dauer
        </p>
        <div
          className="nm-sink flex gap-1.5 rounded-full p-1.5"
          role="group"
          aria-labelledby="dauer-label"
        >
          {PRESETS.map((m) => (
            <button
              key={m}
              type="button"
              disabled={active}
              aria-pressed={m === minutes}
              onClick={() => setMinutes(m)}
              className={cn(
                "tnum h-11 flex-1 rounded-full text-sm font-semibold transition-all duration-200 disabled:opacity-60",
                m === minutes ? "nm-accent" : "text-ink-dim hover:text-ink",
              )}
            >
              {m} min
            </button>
          ))}
        </div>
        {active ? (
          <p className="mt-2 text-xs text-ink-dim">
            Während einer Sitzung lässt sich die Dauer nicht ändern.
          </p>
        ) : null}
      </div>

      {/* Aufgabenwahl */}
      <div>
        <p className="label-xs mb-3" id="aufgabe-label">
          Woran arbeitest du?
        </p>
        {candidates.length === 0 ? (
          <div className="nm-sink flex flex-col items-center gap-4 rounded-2xl px-5 py-7 text-center">
            <p className="text-sm leading-relaxed text-ink-soft">
              {emptyReason === "keine-aufgaben" ? (
                <>
                  Hier stehen deine <strong className="text-ink">Aufgaben</strong>, nicht die
                  Projekte. Leg in einem Projekt die erste Aufgabe an — dann kannst du sie
                  hier auswählen.
                </>
              ) : (
                <>
                  Noch kein Projekt angelegt. Fang mit einem an, trag eine Aufgabe ein, und
                  such sie dir hier aus.
                </>
              )}
            </p>
            <Link
              href={firstProjectId ? `/projekt/${firstProjectId}` : "/projekt/neu"}
              className="nm-raise nm-press inline-flex h-11 items-center rounded-full px-5 text-sm font-medium text-ink"
            >
              {firstProjectId ? "Aufgabe anlegen" : "Projekt anlegen"}
            </Link>
            <p className="text-xs text-ink-dim">
              Du kannst die Uhr auch ohne Aufgabe laufen lassen.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5" aria-labelledby="aufgabe-label">
            {candidates.slice(0, 6).map((c) => {
              const score = priorityScore(c.task);
              const chosen = c.task.id === selectedId;
              return (
                <li key={c.task.id}>
                  <button
                    type="button"
                    aria-pressed={chosen}
                    onClick={() => setSelectedId(chosen ? null : c.task.id)}
                    className={cn(
                      "nm-press flex w-full items-center gap-3 rounded-2xl p-4 text-left",
                      chosen ? "nm-sink" : "nm-raise-sm",
                    )}
                  >
                    <span
                      className="tnum w-11 shrink-0 text-sm font-bold"
                      style={{ color: LEVEL_COLOR[priorityLevel(score)] }}
                    >
                      {formatScore(score)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-sm font-semibold",
                          chosen ? "text-accent" : "text-ink",
                        )}
                      >
                        {c.task.title}
                      </span>
                      <span className="block truncate text-xs text-ink-dim">{c.projectName}</span>
                    </span>
                    {chosen ? <Icon.Check className="h-4 w-4 shrink-0 text-accent" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
