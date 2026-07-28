"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Icon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { SubmitButton } from "@/components/ui/button";
import { Field, FormError, Input } from "@/components/ui/field";
import { completePasswordReset, requestPasswordReset } from "@/lib/actions/recovery";
import type { RecoveryState } from "@/lib/actions/recovery";

function Head({ title, lead }: { title: React.ReactNode; lead: string }) {
  return (
    <div className="mb-10">
      <div className="nm-raise mb-7 grid h-16 w-16 place-items-center rounded-[22px]">
        <Logo className="h-9 w-9" id="recovery-mark" />
      </div>
      <h1 className="display text-[3rem] text-ink">{title}</h1>
      <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">{lead}</p>
    </div>
  );
}

/** Schritt 1: Adresse eingeben, Link anfordern. */
export function RequestResetForm() {
  const [state, formAction] = useActionState<RecoveryState, FormData>(
    requestPasswordReset,
    undefined,
  );

  if (state?.sent) {
    return (
      <div className="animate-rise">
        <Head
          title={
            <>
              Post ist
              <br />
              unterwegs
            </>
          }
          lead="Wenn es zu dieser Adresse ein Konto gibt, liegt gleich eine E-Mail mit dem Link im Postfach. Er gilt eine Stunde."
        />
        <div className="nm-sink flex items-start gap-3 rounded-[var(--radius-card)] p-5">
          <Icon.Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <p className="text-sm leading-relaxed text-ink-soft">
            Nichts angekommen? Schau in den Spam-Ordner. Danach kannst du es unten
            noch einmal versuchen.
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/passwort-vergessen"
            className="nm-raise nm-press inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-medium text-ink"
          >
            Erneut senden
          </Link>
          <Link href="/anmelden" className="text-center text-sm text-ink-soft hover:text-accent">
            Zurück zur Anmeldung
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-rise">
      <Head
        title={
          <>
            Passwort
            <br />
            vergessen
          </>
        }
        lead="Gib deine E-Mail-Adresse an. Wir schicken dir einen Link, mit dem du ein neues Passwort vergibst."
      />

      <form action={formAction} className="flex flex-col gap-5">
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

        <FormError message={state?.error} />

        <SubmitButton size="lg" className="mt-2 w-full" pendingLabel="Sende …">
          Link anfordern
        </SubmitButton>
      </form>

      <p className="mt-8 text-center text-sm text-ink-soft">
        Doch wieder eingefallen?{" "}
        <Link href="/anmelden" className="font-semibold text-accent underline-offset-4 hover:underline">
          Anmelden
        </Link>
      </p>
    </div>
  );
}

/** Schritt 2: neues Passwort zweimal eingeben. */
export function NewPasswordForm({ userId, secret }: { userId: string; secret: string }) {
  const [state, formAction] = useActionState<RecoveryState, FormData>(
    completePasswordReset,
    undefined,
  );

  return (
    <div className="animate-rise">
      <Head
        title={
          <>
            Neues
            <br />
            Passwort
          </>
        }
        lead="Zweimal eingeben, damit kein Tippfehler durchrutscht. Danach bist du direkt angemeldet."
      />

      <form action={formAction} className="flex flex-col gap-5">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="secret" value={secret} />

        <Field label="Neues Passwort" htmlFor="password" hint="Mindestens 8 Zeichen.">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="••••••••"
          />
        </Field>

        <Field label="Passwort wiederholen" htmlFor="passwordConfirm">
          <Input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="••••••••"
          />
        </Field>

        <FormError message={state?.error} />

        <SubmitButton size="lg" className="mt-2 w-full" pendingLabel="Speichere …">
          Passwort setzen
        </SubmitButton>
      </form>

      <p className="mt-8 text-center text-sm text-ink-soft">
        Link abgelaufen?{" "}
        <Link
          href="/passwort-vergessen"
          className="font-semibold text-accent underline-offset-4 hover:underline"
        >
          Neuen anfordern
        </Link>
      </p>
    </div>
  );
}
