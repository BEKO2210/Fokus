import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/** Kleines eingelassenes Etikett. */
export function Chip({
  children,
  tone = "muted",
  className,
}: {
  children: ReactNode;
  tone?: "muted" | "accent" | "ok" | "warn" | "danger";
  className?: string;
}) {
  const color = {
    muted: "text-ink-soft",
    accent: "text-accent",
    ok: "text-ok",
    warn: "text-warn",
    danger: "text-danger",
  }[tone];

  return (
    <span
      className={cn(
        "nm-sink-sm inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
        color,
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Gefuellter Statuspunkt. */
export function Dot({ color, pulse = false }: { color: string; pulse?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block h-2 w-2 shrink-0 rounded-full", pulse && "animate-soft-pulse")}
      style={{ background: color, boxShadow: `0 0 10px ${color}` }}
    />
  );
}

/** Fortschrittsring — der Kreis liegt auf der Flaeche, nicht darin. */
export function ProgressRing({
  value,
  size = 56,
  stroke = 6,
  children,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
  label?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - clamped / 100);
  const gradientId = `ring-${size}-${stroke}`;

  return (
    <div
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `${clamped} Prozent`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-accent-from)" />
            <stop offset="100%" stopColor="var(--color-accent-to)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-shade)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 700ms var(--ease-soft)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

/** Leerer Zustand — nie eine nackte Flaeche zeigen. */
export function EmptyState({
  title,
  body,
  action,
  icon,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="nm-sink flex flex-col items-center gap-3 rounded-[var(--radius-card)] px-6 py-12 text-center">
      {icon ? <div className="nm-raise-sm grid h-14 w-14 place-items-center rounded-2xl text-accent">{icon}</div> : null}
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="max-w-xs text-sm leading-relaxed text-ink-soft">{body}</p>
      {action}
    </div>
  );
}

export function SectionTitle({
  children,
  right,
}: {
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="text-lg font-bold tracking-tight text-ink">{children}</h2>
      {right}
    </div>
  );
}
