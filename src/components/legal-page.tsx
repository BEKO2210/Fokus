import Link from "next/link";
import type { ReactNode } from "react";

import { Icon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { MailLink } from "@/components/mail-link";

/**
 * Rahmen für Impressum und Datenschutz. Bewusst ohne App-Navigation:
 * Diese Seiten müssen auch ohne Anmeldung erreichbar und lesbar sein.
 */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12">
      <div className="mb-10 flex items-center justify-between gap-4">
        <Link href="/" className="inline-flex items-center gap-3" aria-label="Zur Startseite">
          <Logo className="h-8 w-8" id="legal-mark" />
          <span className="display text-xl text-ink">Fokus</span>
        </Link>
        <Link
          href="/anmelden"
          className="nm-raise nm-press inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm text-ink-soft"
        >
          <Icon.Back className="h-4 w-4" />
          Zurück
        </Link>
      </div>

      <h1 className="display text-[2.6rem] text-ink">{title}</h1>
      <p className="mt-3 text-xs text-ink-dim">Stand: {updated}</p>

      <article
        className="mt-10 flex flex-col gap-6 text-sm leading-relaxed text-ink-soft
          [&_a]:text-accent [&_a]:underline-offset-4 hover:[&_a]:underline
          [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-ink
          [&_h3]:mt-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-ink
          [&_li]:leading-relaxed
          [&_strong]:font-semibold [&_strong]:text-ink
          [&_table]:w-full [&_table]:text-xs
          [&_td]:border-t [&_td]:border-white/5 [&_td]:py-2.5 [&_td]:pr-4 [&_td]:align-top
          [&_th]:pb-2 [&_th]:pr-4 [&_th]:text-left [&_th]:text-ink-dim [&_th]:font-semibold
          [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5"
      >
        {children}
      </article>

      <footer className="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/5 pt-6 text-xs text-ink-dim">
        <Link href="/impressum">Impressum</Link>
        <Link href="/datenschutz">Datenschutz</Link>
        <MailLink user="belkis.aslani" domain="gmail.com">Kontakt</MailLink>
        <Link href="/anmelden">Anmelden</Link>
      </footer>
    </main>
  );
}
