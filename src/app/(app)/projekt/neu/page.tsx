import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { ProjectForm } from "@/components/project-form";
import { createProject } from "@/lib/actions/projects";

export const metadata: Metadata = { title: "Neues Projekt" };

export default function NewProjectPage() {
  return (
    <div className="animate-rise">
      <PageHeader
        back="/"
        eyebrow="Anlegen"
        title={
          <>
            Neues
            <br />
            Projekt
          </>
        }
        lead="Nur der Name ist Pflicht. Alles andere kannst du später ergänzen."
      />
      <ProjectForm action={createProject} submitLabel="Projekt anlegen" />
    </div>
  );
}
