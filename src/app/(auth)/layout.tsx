import Link from "next/link";
import { redirect } from "next/navigation";

import { getUser } from "@/lib/appwrite/server";
import { MailLink } from "@/components/mail-link";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (user) redirect("/");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-12">
      {children}
      <footer className="mt-16 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-ink-dim">
        <Link href="/impressum">Impressum</Link>
        <Link href="/datenschutz">Datenschutz</Link>
        <MailLink user="belkis.aslani" domain="gmail.com">Kontakt</MailLink>
      </footer>
    </main>
  );
}
