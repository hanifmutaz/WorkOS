import { createClient } from "@/lib/supabase/server";
import { WorkspaceEditForm } from "@/components/workspace/workspace-edit-form";
import { ProjectForm } from "@/components/project/project-form";
import { ProjectCard } from "@/components/project/project-card";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name, icon, color")
    .eq("id", id)
    .single();

  if (!workspace) notFound();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status, priority")
    .eq("workspace_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 text-white">
      <Link href="/workspaces" className="mb-4 inline-block text-sm text-muted hover:text-white">
        ← Workspaces
      </Link>

      <h1 className="mb-6 text-2xl font-semibold">
        {workspace.icon} {workspace.name}
      </h1>

      <div className="mb-8 max-w-sm">
        <WorkspaceEditForm workspace={workspace} />
      </div>

      <h2 className="mb-3 text-sm font-medium text-muted">Projects</h2>
      <div className="mb-4 space-y-2">
        {projects?.length ? (
          projects.map((p) => <ProjectCard key={p.id} project={p} />)
        ) : (
          <p className="text-sm text-muted">Belum ada project di workspace ini.</p>
        )}
      </div>

      <div className="max-w-sm">
        <ProjectForm workspaceId={workspace.id} />
      </div>
    </div>
  );
}
