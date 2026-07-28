"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib/cn";

const STEPS = [1, 2, 3, 4, 5] as const;

/**
 * Fünfstufiger Regler nach dem Radiogroup-Muster.
 *
 * Wichtig ist der wandernde Tabindex: nur die gewählte Stufe ist per Tab
 * erreichbar, gewechselt wird mit den Pfeiltasten. Sonst müsste man sich pro
 * Aufgabenformular durch fünfzehn Tabstopps arbeiten, und Screenreader im
 * Formularmodus bekämen auf die Pfeiltasten gar keine Reaktion.
 */
export function Rating({
  name,
  label,
  defaultValue = 3,
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: number;
  hint?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function move(to: number) {
    const next = Math.min(5, Math.max(1, to));
    setValue(next);
    refs.current[next - 1]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        move(value + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        move(value - 1);
        break;
      case "Home":
        event.preventDefault();
        move(1);
        break;
      case "End":
        event.preventDefault();
        move(5);
        break;
    }
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="label-xs mb-2">{label}</legend>
      <input type="hidden" name={name} value={value} />
      <div
        className="nm-raise-sm flex gap-1.5 rounded-full p-1.5"
        role="radiogroup"
        aria-label={hint ? `${label} — ${hint}` : label}
        onKeyDown={onKeyDown}
      >
        {STEPS.map((n) => {
          const active = n === value;
          return (
            <button
              key={n}
              ref={(el) => {
                refs.current[n - 1] = el;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${n} von 5`}
              tabIndex={active ? 0 : -1}
              onClick={() => setValue(n)}
              className={cn(
                "tnum h-11 flex-1 rounded-full text-sm font-semibold transition-all duration-200",
                active ? "nm-accent" : "text-ink-soft hover:text-ink",
              )}
            >
              {n}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-ink-dim">{hint ? `${hint} 1 = kaum, 5 = sehr viel.` : "1 = kaum, 5 = sehr viel."}</p>
    </fieldset>
  );
}

/** Zuversicht in Prozent, als eingelassener Schieberegler. */
export function ConfidenceSlider({
  name,
  defaultValue = 80,
}: {
  name: string;
  defaultValue?: number;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <label className="label-xs" htmlFor={`slider-${name}`}>
          Wie sicher bist du dir?
        </label>
        <span className="tnum text-sm font-semibold text-accent">{value} %</span>
      </div>
      <input
        id={`slider-${name}`}
        type="range"
        name={name}
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="h-11 w-full cursor-pointer appearance-none bg-transparent
          [&::-webkit-slider-runnable-track]:h-3 [&::-webkit-slider-runnable-track]:rounded-full
          [&::-webkit-slider-runnable-track]:shadow-[var(--nm-sink-sm)]
          [&::-webkit-slider-thumb]:mt-[-0.375rem] [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-[linear-gradient(135deg,var(--color-accent-from),var(--color-accent-to))]
          [&::-webkit-slider-thumb]:shadow-[var(--nm-accent-glow)]
          [&::-moz-range-track]:h-3 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[var(--color-base-sunk)]
          [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-[linear-gradient(135deg,var(--color-accent-from),var(--color-accent-to))]"
      />
    </div>
  );
}
