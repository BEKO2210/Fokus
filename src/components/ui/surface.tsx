import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "@/lib/cn";

type SurfaceProps<T extends ElementType> = {
  as?: T;
  /** raise = herausgehoben, sink = eingelassen, flat = nur Flaeche */
  tone?: "raise" | "raise-sm" | "raise-lg" | "sink" | "sink-sm" | "card";
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

const TONE: Record<NonNullable<SurfaceProps<"div">["tone"]>, string> = {
  raise: "nm-raise",
  "raise-sm": "nm-raise-sm",
  "raise-lg": "nm-raise-lg",
  sink: "nm-sink",
  "sink-sm": "nm-sink-sm",
  card: "nm-card",
};

export function Surface<T extends ElementType = "div">({
  as,
  tone = "card",
  className,
  children,
  ...rest
}: SurfaceProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag className={cn(TONE[tone], tone !== "card" && "rounded-[var(--radius-tile)]", className)} {...rest}>
      {children}
    </Tag>
  );
}
