import { createClient } from "@/lib/supabase/server";
import { WorkspaceForm } from "@/components/workspace/workspace-form";
import { WorkspaceCard } from "@/components/workspace/workspace-card";

export default async function WorkspacesPage() {
  const supabase = await createClient();

  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id, name, icon, color")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 text-white">
      <h1 className="mb-6 text-2xl font-semibold">Workspaces</h1>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {workspaces?.map((w) => (
          <WorkspaceCard key={w.id} workspace={w} />
        ))}
      </div>

      {!workspaces?.length && (
        <p className="mb-6 text-sm text-muted">Belum ada workspace, bikin yang pertama di bawah.</p>
      )}

      <div className="max-w-sm">
        <WorkspaceForm />
      </div>
    </div>
  );
}
