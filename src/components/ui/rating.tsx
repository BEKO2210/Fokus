"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";

/** Fuenfstufiger Regler. Aktive Stufe ist eingelassen, nicht farbig ueberladen. */
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

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="label-xs mb-2">{label}</legend>
      <input type="hidden" name={name} value={value} />
      <div className="nm-sink flex gap-1.5 rounded-full p-1.5" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => {
          const active = n === value;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${label}: ${n} von 5`}
              onClick={() => setValue(n)}
              className={cn(
                "tnum h-9 flex-1 rounded-full text-sm font-semibold transition-all duration-200",
                active ? "nm-accent" : "text-ink-dim hover:text-ink",
              )}
            >
              {n}
            </button>
          );
        })}
      </div>
      {hint ? <p className="text-xs text-ink-dim">{hint}</p> : null}
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
        <span className="label-xs">Zuversicht</span>
        <span className="tnum text-sm font-semibold text-accent">{value} %</span>
      </div>
      <input
        type="range"
        name={name}
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        aria-label="Zuversicht in Prozent"
        className="h-6 w-full cursor-pointer appearance-none bg-transparent
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
