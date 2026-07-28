"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { cn } from "@/lib/cn";

type Variant = "raised" | "accent" | "ghost" | "sunk";
type Size = "sm" | "md" | "lg" | "icon" | "icon-lg";

const VARIANT: Record<Variant, string> = {
  raised: "nm-raise nm-press text-ink hover:text-white",
  accent: "nm-accent nm-press font-semibold hover:brightness-110",
  ghost: "text-ink-soft hover:text-ink",
  sunk: "nm-sink text-ink-soft",
};

const SIZE: Record<Size, string> = {
  sm: "h-11 px-5 text-sm rounded-full",
  md: "h-12 px-6 text-[0.95rem] rounded-full",
  lg: "h-14 px-8 text-base rounded-full",
  icon: "h-11 w-11 rounded-2xl",
  "icon-lg": "h-14 w-14 rounded-[20px]",
};

const BASE =
  "inline-flex items-center justify-center gap-2 font-medium select-none " +
  "transition-[box-shadow,transform,color,filter] duration-200 " +
  "disabled:opacity-45 disabled:pointer-events-none";

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  children?: ReactNode;
} & ComponentPropsWithoutRef<"button">;

export function Button({
  variant = "raised",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={cn(BASE, VARIANT[variant], SIZE[size], className)} {...rest}>
      {children}
    </button>
  );
}

/** Absende-Knopf, der waehrend der Server-Action selbst ausgraut. */
export function SubmitButton({
  variant = "accent",
  size = "md",
  className,
  children,
  pendingLabel,
  ...rest
}: ButtonProps & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(BASE, VARIANT[variant], SIZE[size], className)}
      {...rest}
    >
      {pending ? (pendingLabel ?? "Moment …") : children}
    </button>
  );
}

type LinkButtonProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: ReactNode;
  prefetch?: boolean;
  "aria-label"?: string;
};

export function LinkButton({
  href,
  variant = "raised",
  size = "md",
  className,
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <Link href={href} className={cn(BASE, VARIANT[variant], SIZE[size], className)} {...rest}>
      {children}
    </Link>
  );
}
