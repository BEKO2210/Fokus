import { redirect } from "next/navigation";

import { AppNav } from "@/components/app-nav";
import { getUser } from "@/lib/appwrite/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/anmelden");

  return (
    <>
      <AppNav />
      <main className="flex-1 px-5 pb-32 pt-8 md:pb-12 md:pl-28 md:pr-8">
        <div className="mx-auto w-full max-w-2xl lg:max-w-5xl">{children}</div>
      </main>
    </>
  );
}
