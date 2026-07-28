import { cn } from "@/lib/cn";
import { weekdayLabel } from "@/lib/time";

export type FocusBar = { key: string; seconds: number };

function minutes(seconds: number) {
  return Math.round(seconds / 60);
}

/**
 * Wochenbalken. Der heutige Balken glueht orange — das ist der einzige
 * Farbakzent im Diagramm, damit "heute" ohne Legende lesbar bleibt.
 */
export function FocusBars({ bars }: { bars: FocusBar[] }) {
  const peak = Math.max(60, ...bars.map((b) => b.seconds));

  return (
    <div className="flex items-end justify-between gap-2 pt-6">
      {bars.map((bar, i) => {
        const isToday = i === bars.length - 1;
        const height = Math.max(8, Math.round((bar.seconds / peak) * 100));
        const mins = minutes(bar.seconds);

        return (
          <div key={bar.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <span
              className={cn(
                "tnum text-[0.7rem] font-semibold",
                isToday ? "text-ink" : "text-ink-dim",
                mins === 0 && "opacity-70",
              )}
            >
              {mins}
            </span>
            <div className="relative h-28 w-full max-w-9">
              <div
                className={cn(
                  "absolute bottom-0 w-full rounded-full transition-[height] duration-700",
                  isToday ? "nm-accent" : "nm-raise-sm",
                )}
                style={{ height: `${height}%` }}
              />
            </div>
            <span className={cn("text-[0.65rem]", isToday ? "text-ink-soft" : "text-ink-dim")}>
              {weekdayLabel(bar.key)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
