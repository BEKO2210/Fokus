"use client";

import { useActionState, useState } from "react";

import { Icon } from "@/components/icons";
import { Button, SubmitButton } from "@/components/ui/button";
import { FormError, Input } from "@/components/ui/field";
import { deleteAccount } from "@/lib/actions/account";
import type { AccountState } from "@/lib/actions/account";

export function DeleteAccount({ projectCount }: { projectCount: number }) {
  const [armed, setArmed] = useState(false);
  const [state, formAction] = useActionState<AccountState, FormData>(deleteAccount, undefined);

  if (!armed) {
    return (
      <Button variant="ghost" size="sm" className="text-ink-dim" onClick={() => setArmed(true)}>
        <Icon.Trash className="h-4 w-4" />
        Konto löschen
      </Button>
    );
  }

  return (
    <form action={formAction} className="nm-sink flex flex-col gap-4 rounded-[var(--radius-card)] p-5">
      <p className="text-sm leading-relaxed text-ink-soft">
        Dein Konto und alle Inhalte werden <strong className="text-ink">sofort und
        endgültig</strong> gelöscht — {projectCount === 1 ? "ein Projekt" : `${projectCount} Projekte`} samt
        Aufgaben und Fokuszeiten. Das lässt sich nicht rückgängig machen.
      </p>
      <p className="text-sm text-ink-soft">
        Willst du deine Daten behalten, lade vorher oben den Export herunter.
      </p>

      <label className="label-xs" htmlFor="confirm">
        Tippe LÖSCHEN, um zu bestätigen
      </label>
      <Input
        id="confirm"
        name="confirm"
        required
        autoComplete="off"
        placeholder="LÖSCHEN"
        aria-describedby="confirm-hint"
      />
      <p id="confirm-hint" className="sr-only">
        Nur die genaue Eingabe LÖSCHEN startet die Löschung.
      </p>

      <FormError message={state?.error} />

      <div className="flex flex-wrap gap-3">
        <SubmitButton variant="raised" size="sm" className="text-danger" pendingLabel="Lösche …">
          Konto endgültig löschen
        </SubmitButton>
        <Button variant="ghost" size="sm" type="button" onClick={() => setArmed(false)}>
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
