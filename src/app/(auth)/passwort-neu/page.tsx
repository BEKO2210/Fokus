import type { Metadata } from "next";
import Link from "next/link";

import { NewPasswordForm } from "@/components/recovery-forms";

export const metadata: Metadata = { title: "Neues Passwort" };

type Props = { searchParams: Promise<{ userId?: string; secret?: string }> };

export default async function NewPasswordPage({ searchParams }: Props) {
  const { userId, secret } = await searchParams;

  if (!userId || !secret) {
    return (
      <div className="animate-rise text-center">
        <p className="label-xs">Link unvollständig</p>
        <h1 className="display mt-3 text-[2.6rem] text-ink">Da fehlt etwas</h1>
        <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-ink-soft">
          Dieser Link enthält keinen gültigen Schlüssel. Meist liegt es daran, dass das
          Mail-Programm ihn umgebrochen hat — fordere am besten einen neuen an.
        </p>
        <Link
          href="/passwort-vergessen"
          className="nm-accent nm-press mx-auto mt-8 inline-flex h-12 items-center rounded-full px-7 text-sm font-semibold"
        >
          Neuen Link anfordern
        </Link>
      </div>
    );
  }

  return <NewPasswordForm userId={userId} secret={secret} />;
}
