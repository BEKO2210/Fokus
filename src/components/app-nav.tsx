"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "/", label: "Übersicht", icon: Icon.Grid },
  { href: "/fokus", label: "Fokus", icon: Icon.Target },
  { href: "/einstellungen", label: "Konto", icon: Icon.Sliders },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Unten auf dem Handy, links am Rand ab Tablet. */
export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Handy */}
      <nav
        aria-label="Hauptnavigation"
        className="safe-b fixed inset-x-0 bottom-0 z-40 md:hidden"
      >
        <div className="mx-4 mb-4 flex items-center justify-around rounded-[26px] nm-raise px-2 py-2 backdrop-blur">
          {ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "nm-press flex h-14 flex-1 flex-col items-center justify-center gap-1 rounded-[20px] text-[0.68rem] font-medium",
                  active ? "nm-sink text-accent" : "text-ink-dim",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/projekt/neu"
            aria-label="Neues Projekt"
            className="nm-accent nm-press ml-1 grid h-14 w-14 shrink-0 place-items-center rounded-[20px]"
          >
            <Icon.Plus className="h-6 w-6" />
          </Link>
        </div>
      </nav>

      {/* Tablet und Desktop */}
      <nav
        aria-label="Hauptnavigation"
        className="fixed left-0 top-0 z-40 hidden h-dvh w-24 flex-col items-center gap-4 py-8 md:flex"
      >
        <Link
          href="/"
          aria-label="Fokus Startseite"
          className="nm-raise nm-press grid h-12 w-12 place-items-center rounded-2xl"
        >
          <Logo className="h-7 w-7" id="nav-mark" />
        </Link>
        <div className="mt-6 flex flex-col gap-3">
          {ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={item.label}
                className={cn(
                  "nm-press grid h-13 w-13 place-items-center rounded-2xl p-3.5",
                  active ? "nm-sink text-accent" : "nm-raise-sm text-ink-dim hover:text-ink",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="sr-only">{item.label}</span>
              </Link>
            );
          })}
        </div>
        <Link
          href="/projekt/neu"
          aria-label="Neues Projekt"
          className="nm-accent nm-press mt-auto grid h-13 w-13 place-items-center rounded-2xl p-3.5"
        >
          <Icon.Plus className="h-5 w-5" />
        </Link>
      </nav>
    </>
  );
}
