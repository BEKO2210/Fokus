import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16 text-center">
      <p className="label-xs">Fehler 404</p>
      <h1 className="display mt-3 text-[3rem] text-ink">Nicht gefunden</h1>
      <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-ink-soft">
        Diese Seite gibt es nicht — oder das Projekt wurde gelöscht.
      </p>
      <Link
        href="/"
        className="nm-accent nm-press mx-auto mt-8 inline-flex h-12 items-center rounded-full px-7 text-sm font-semibold"
      >
        Zur Übersicht
      </Link>
    </main>
  );
}
