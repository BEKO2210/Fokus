import { redirect } from "next/navigation";

import { getUser } from "@/lib/appwrite/server";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (user) redirect("/");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-12">
      {children}
    </main>
  );
}
