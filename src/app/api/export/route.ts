import { NextResponse } from "next/server";

import { getUser } from "@/lib/appwrite/server";
import { loadEverything } from "@/lib/data";

export const dynamic = "force-dynamic";

/** Vollständiger Datenexport des angemeldeten Nutzers als JSON-Datei. */
export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { projects, tasks, sessions } = await loadEverything();

  const payload = {
    format: "fokus-export",
    version: 2,
    exportedAt: new Date().toISOString(),
    owner: { name: user.name, email: user.email },
    counts: { projects: projects.length, tasks: tasks.length, sessions: sessions.length },
    projects,
    tasks,
    sessions,
  };

  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="fokus-export-${stamp}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
