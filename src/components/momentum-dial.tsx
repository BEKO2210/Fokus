import { cn } from "@/lib/cn";

/**
 * Der Blickfang der Startseite: eine gewoelbte Scheibe, die auf einer
 * weichen Platte liegt. Vier Kennzahlen sitzen als Satelliten am Rand.
 */
export function MomentumDial({
  value,
  unit,
  caption,
  satellites,
}: {
  value: string;
  unit: string;
  caption: string;
  satellites: { icon: React.ReactNode; label: string; value: string; hot?: boolean }[];
}) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[19rem]">
      {/* Platte */}
      <div
        className="absolute inset-0 nm-raise-lg"
        style={{
          borderRadius: "38% 42% 40% 44% / 44% 38% 44% 40%",
          background:
            "linear-gradient(150deg, var(--color-base-lift) 0%, var(--color-base-sunk) 70%)",
        }}
      />

      {/* Satelliten */}
      {satellites.slice(0, 4).map((s, i) => (
        <div
          key={s.label}
          className={cn(
            "absolute z-10 flex flex-col items-center gap-1",
            i === 0 && "left-[14%] top-[13%]",
            i === 1 && "right-[13%] top-[15%]",
            i === 2 && "left-[13%] bottom-[15%]",
            i === 3 && "right-[14%] bottom-[13%]",
          )}
        >
          <div
            className={cn(
              "grid h-10 w-10 place-items-center rounded-2xl",
              s.hot ? "nm-accent" : "nm-raise-sm text-ink-soft",
            )}
            aria-hidden
          >
            {s.icon}
          </div>
          <span className="tnum text-[0.8rem] font-bold text-ink">{s.value}</span>
          {/* Die Beschriftung stand vorher nur in sr-only — sehende Nutzer sahen
              vier nackte Zahlen und konnten das Herzstück nicht lesen. */}
          <span className="max-w-[5.5rem] text-center text-[0.6rem] leading-tight text-ink-dim">
            {s.label}
          </span>
        </div>
      ))}

      {/* Scheibe */}
      <div
        className="absolute inset-[22%] grid place-items-center rounded-full"
        style={{
          background: "linear-gradient(155deg, #34353b 0%, #232428 100%)",
          boxShadow:
            "10px 12px 26px var(--color-shade), -8px -10px 22px var(--color-glow), inset 1px 1px 2px rgb(255 255 255 / 0.05)",
        }}
      >
        <div className="text-center">
          <div className="display tnum text-[3.4rem] leading-none text-ink">{value}</div>
          <div className="mt-1 text-sm font-medium text-ink-dim">{unit}</div>
        </div>
      </div>

      <p className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-ink-dim">
        {caption}
      </p>
    </div>
  );
}
