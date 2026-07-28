import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { confirmEmail } from "@/lib/actions/verify";

export const metadata: Metadata = { title: "E-Mail bestätigen", robots: { index: false } };

type Props = { searchParams: Promise<{ userId?: string; secret?: string }> };

export default async function ConfirmEmailPage({ searchParams }: Props) {
  const { userId, secret } = await searchParams;
  const result = userId && secret ? await confirmEmail(userId, secret) : { ok: false as const };

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-12">
      <div className="animate-rise">
        <div className="nm-raise mb-7 grid h-16 w-16 place-items-center rounded-[22px]">
          <Logo className="h-9 w-9" id="confirm-mark" />
        </div>

        {result.ok ? (
          <>
            <h1 className="display text-[3rem] text-ink">
              Adresse
              <br />
              bestätigt
            </h1>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
              Danke. Dein Konto ist vollständig eingerichtet — und wenn du dein Passwort
              mal vergisst, kommst du wieder rein.
            </p>
            <Link
              href="/"
              className="nm-accent nm-press mt-8 inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-semibold"
            >
              <Icon.Check className="h-4 w-4" />
              Weiter zu deinen Projekten
            </Link>
          </>
        ) : (
          <>
            <h1 className="display text-[3rem] text-ink">
              Link
              <br />
              abgelaufen
            </h1>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
              Dieser Bestätigungslink gilt nicht mehr oder wurde schon benutzt. Melde dich
              an — oben in der App kannst du dir mit einem Klick einen neuen schicken
              lassen.
            </p>
            <Link
              href="/anmelden"
              className="nm-raise nm-press mt-8 inline-flex h-12 items-center rounded-full px-7 text-sm font-medium text-ink"
            >
              Zur Anmeldung
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
