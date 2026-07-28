import { redirect } from "next/navigation";

import Link from "next/link";

import { AppNav } from "@/components/app-nav";
import { VerifyBanner } from "@/components/verify-banner";
import { getUser } from "@/lib/appwrite/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/anmelden");

  return (
    <>
      {/* Vor der Navigation, damit Tastaturnutzer nicht jedes Mal durch vier
          Navigationslinks müssen, bevor der Inhalt kommt. */}
      <a
        href="#inhalt"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:px-5 focus:py-3 focus:nm-accent focus:text-sm focus:font-semibold"
      >
        Zum Inhalt springen
      </a>
      <AppNav />
      <main id="inhalt" className="flex-1 px-5 pb-32 pt-8 md:pb-12 md:pl-28 md:pr-8">
        <div className="mx-auto w-full max-w-2xl lg:max-w-5xl">
          {user.emailVerified ? null : <VerifyBanner email={user.email} />}
          {children}
          <footer className="mt-20 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/5 pt-6 text-xs text-ink-dim">
            <Link href="/impressum">Impressum</Link>
            <Link href="/datenschutz">Datenschutz</Link>
            <a href="mailto:belkis.aslani@gmail.com">Kontakt</a>
          </footer>
        </div>
      </main>
    </>
  );
}
