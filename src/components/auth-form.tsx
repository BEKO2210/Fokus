"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Logo } from "@/components/logo";
import { SubmitButton } from "@/components/ui/button";
import { Field, FormError, Input } from "@/components/ui/field";
import type { FormState } from "@/lib/actions/auth";

type Mode = "login" | "register";

export function AuthForm({
  mode,
  action,
}: {
  mode: Mode;
  action: (state: FormState, fd: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, undefined);
  const isRegister = mode === "register";

  return (
    <div className="animate-rise">
      <div className="mb-10">
        <div className="nm-raise mb-7 grid h-16 w-16 place-items-center rounded-[22px]">
          <Logo className="h-9 w-9" id="auth-mark" />
        </div>
        <h1 className="display text-[3.2rem] text-ink">
          {isRegister ? (
            <>
              Konto
              <br />
              anlegen
            </>
          ) : (
            <>
              Willkommen
              <br />
              zurück
            </>
          )}
        </h1>
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
          {isRegister
            ? "Ein Konto, alle deine Projekte. Deine Daten sind nur für dich sichtbar."
            : "Melde dich an, um dein Projekt-Cockpit zu öffnen."}
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        {isRegister ? (
          <Field label="Name" htmlFor="name">
            <Input id="name" name="name" autoComplete="name" required placeholder="Wie heißt du?" />
          </Field>
        ) : null}

        <Field label="E-Mail" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="du@beispiel.de"
          />
        </Field>

        <Field
          label="Passwort"
          htmlFor="password"
          hint={isRegister ? "Mindestens 8 Zeichen." : undefined}
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
            minLength={8}
            placeholder="••••••••"
          />
        </Field>

        <FormError message={state?.error} />

        <SubmitButton size="lg" className="mt-2 w-full" pendingLabel="Einen Moment …">
          {isRegister ? "Konto anlegen" : "Anmelden"}
        </SubmitButton>
      </form>

      <p className="mt-8 text-center text-sm text-ink-soft">
        {isRegister ? "Schon ein Konto? " : "Noch kein Konto? "}
        <Link
          href={isRegister ? "/anmelden" : "/registrieren"}
          className="font-semibold text-accent underline-offset-4 hover:underline"
        >
          {isRegister ? "Anmelden" : "Registrieren"}
        </Link>
      </p>
    </div>
  );
}
