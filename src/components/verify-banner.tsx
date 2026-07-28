"use client";

import { useActionState } from "react";

import { Icon } from "@/components/icons";
import { SubmitButton } from "@/components/ui/button";
import { resendVerification } from "@/lib/actions/verify";
import type { VerifyState } from "@/lib/actions/verify";

/** Hinweisband, solange die Adresse nicht bestätigt ist. Blockiert nichts. */
export function VerifyBanner({ email }: { email: string }) {
  const [state, formAction] = useActionState<VerifyState, FormData>(
    resendVerification,
    undefined,
  );

  return (
    <div className="nm-sink mb-8 flex flex-col gap-3 rounded-[var(--radius-card)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <p
        role={state?.error ? "alert" : "status"}
        className="flex items-start gap-3 text-sm leading-relaxed text-ink-soft"
      >
        <Icon.Clock className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
        <span>
          {state?.sent ? (
            <>Neue Bestätigungsmail ist an <strong className="text-ink">{email}</strong> unterwegs.</>
          ) : state?.error ? (
            state.error
          ) : (
            <>
              Bestätige noch kurz <strong className="text-ink">{email}</strong>. Ohne
              Bestätigung können wir dir kein neues Passwort schicken, falls du es
              vergisst.
            </>
          )}
        </span>
      </p>
      {!state?.sent ? (
        <form action={formAction} className="shrink-0">
          <SubmitButton variant="raised" size="sm" pendingLabel="Sende …">
            Erneut senden
          </SubmitButton>
        </form>
      ) : null}
    </div>
  );
}
