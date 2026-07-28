import Link from "next/link";
import type { ReactNode } from "react";

import { Icon } from "@/components/icons";

/** Kopfbereich mit Zurueck-Knopf und grosser Ueberschrift. */
export function PageHeader({
  back,
  eyebrow,
  title,
  lead,
  action,
}: {
  back?: string;
  eyebrow?: string;
  title: ReactNode;
  lead?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-9">
      <div className="mb-6 flex items-center justify-between gap-3">
        {back ? (
          <Link
            href={back}
            aria-label="Zurück"
            className="nm-raise nm-press grid h-11 w-11 place-items-center rounded-2xl text-ink-soft"
          >
            <Icon.Back className="h-5 w-5" />
          </Link>
        ) : (
          <span />
        )}
        {action}
      </div>

      {eyebrow ? <p className="label-xs">{eyebrow}</p> : null}
      <h1 className="display mt-2 hyphens-auto break-words text-[2.6rem] text-ink">{title}</h1>
      {lead ? <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">{lead}</p> : null}
    </header>
  );
}
