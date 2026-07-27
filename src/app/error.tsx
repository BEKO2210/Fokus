"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16 text-center">
      <p className="label-xs">Etwas ist schiefgelaufen</p>
      <h1 className="display mt-3 text-[2.6rem] text-ink">Kurz gestolpert</h1>
      <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-ink-soft">
        Die Seite konnte nicht geladen werden. Meist hilft ein zweiter Versuch.
      </p>
      <button
        onClick={reset}
        className="nm-accent nm-press mx-auto mt-8 inline-flex h-12 items-center rounded-full px-7 text-sm font-semibold"
      >
        Nochmal versuchen
      </button>
    </main>
  );
}
