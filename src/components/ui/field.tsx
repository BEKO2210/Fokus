import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/cn";

const CONTROL =
  "w-full nm-sink rounded-2xl px-4 text-ink placeholder:text-ink-dim/80 " +
  "outline-none transition-shadow duration-200 " +
  "focus:shadow-[inset_2px_2px_6px_var(--color-shade),inset_-2px_-2px_6px_var(--color-glow),0_0_0_1.5px_var(--color-accent)]";

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="label-xs">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-ink-dim">{hint}</p> : null}
    </div>
  );
}

export function Input({ className, ...rest }: ComponentPropsWithoutRef<"input">) {
  return <input className={cn(CONTROL, "h-12", className)} {...rest} />;
}

export function Textarea({ className, ...rest }: ComponentPropsWithoutRef<"textarea">) {
  return <textarea className={cn(CONTROL, "min-h-28 resize-y py-3 leading-relaxed", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: ComponentPropsWithoutRef<"select">) {
  return (
    <div className="relative">
      <select className={cn(CONTROL, "h-12 appearance-none pr-11", className)} {...rest}>
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim"
      >
        <path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/** Fehlermeldung einer Server-Action. */
export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="nm-sink-sm rounded-2xl px-4 py-3 text-sm text-danger"
    >
      {message}
    </p>
  );
}
