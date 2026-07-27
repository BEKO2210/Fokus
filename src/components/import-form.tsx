"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/ui/button";
import { FormError } from "@/components/ui/field";
import { importBackup } from "@/lib/actions/import";
import type { ImportState } from "@/lib/actions/import";

export function ImportForm() {
  const [state, formAction] = useActionState<ImportState, FormData>(importBackup, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input
        type="file"
        name="file"
        accept="application/json,.json"
        required
        aria-label="Export-Datei wählen"
        className="nm-sink w-full rounded-2xl p-3 text-sm text-ink-soft
          file:mr-4 file:rounded-full file:border-0 file:bg-[linear-gradient(135deg,var(--color-accent-from),var(--color-accent-to))]
          file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
      />
      <FormError message={state?.error} />
      {state?.summary ? (
        <p role="status" className="nm-sink-sm rounded-2xl px-4 py-3 text-sm text-ok">
          {state.summary}
        </p>
      ) : null}
      <SubmitButton variant="raised" size="sm" className="self-start" pendingLabel="Importiere …">
        Import starten
      </SubmitButton>
    </form>
  );
}
