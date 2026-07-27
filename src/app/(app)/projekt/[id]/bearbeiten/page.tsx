import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { ProjectForm } from "@/components/project-form";
import { updateProject } from "@/lib/actions/projects";
import { loadProject } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await loadProject(id);
  return { title: data ? `${data.project.name} bearbeiten` : "Projekt bearbeiten" };
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  const data = await loadProject(id);
  if (!data) notFound();

  return (
    <div className="animate-rise">
      <PageHeader back={`/projekt/${id}`} eyebrow="Bearbeiten" title={data.project.name} />
      <ProjectForm action={updateProject} project={data.project} submitLabel="Änderungen speichern" />
    </div>
  );
}
