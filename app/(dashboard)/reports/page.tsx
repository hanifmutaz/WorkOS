import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/report/stat-card";
import { ExportCSVButton } from "@/components/report/export-csv-button";

export default async function ReportsPage() {
  const supabase = await createClient();

  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id, name");

  const { data: projects } = await supabase
    .from("projects")
    .select("id, workspace_id, name, status");

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, project_id, title, status, priority, deadline");

  const { data: timeEntries } = await supabase
    .from("time_entries")
    .select("task_id, started_at, ended_at");

  const workspaceMap = new Map((workspaces ?? []).map((w) => [w.id, w.name]));
  const projectMap = new Map((projects ?? []).map((p) => [p.id, p]));

  const hoursPerTask = new Map<string, number>();
  let hasRunningTimer = false;
  for (const e of timeEntries ?? []) {
    const endTime = e.ended_at ? new Date(e.ended_at).getTime() : Date.now();
    if (!e.ended_at) hasRunningTimer = true;
    const seconds = (endTime - new Date(e.started_at).getTime()) / 1000;
    hoursPerTask.set(e.task_id, (hoursPerTask.get(e.task_id) ?? 0) + seconds / 3600);
  }

  const totalTasks = tasks?.length ?? 0;
  const doneTasks = tasks?.filter((t) => t.status === "done").length ?? 0;
  const completionRate = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const totalHours = [...hoursPerTask.values()].reduce((a, b) => a + b, 0);
  const activeProjects = projects?.filter((p) => p.status === "active").length ?? 0;

  const exportRows = (tasks ?? []).map((t) => {
    const project = projectMap.get(t.project_id);
    return {
      workspace: project ? workspaceMap.get(project.workspace_id) ?? "-" : "-",
      project: project?.name ?? "-",
      task: t.title,
      status: t.status,
      priority: t.priority,
      deadline: t.deadline,
      hours: hoursPerTask.get(t.id) ?? 0,
    };
  });

  return (
    <div className="p-6 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <ExportCSVButton rows={exportRows} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Project" value={String(projects?.length ?? 0)} />
        <StatCard label="Project Aktif" value={String(activeProjects)} />
        <StatCard label="Completion Rate" value={`${completionRate}%`} />
        <StatCard label="Total Jam Kerja" value={`${totalHours.toFixed(1)}j`} />
      </div>
      {hasRunningTimer && (
        <p className="mt-2 text-xs text-muted">
          🟡 Ada timer yang lagi jalan — angka di atas dihitung sampe saat halaman ini
          dimuat, refresh buat update.
        </p>
      )}

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-muted">Per Workspace</h2>
        <div className="space-y-2">
          {workspaces?.map((w) => {
            const wsProjects = projects?.filter((p) => p.workspace_id === w.id) ?? [];
            const wsProjectIds = new Set(wsProjects.map((p) => p.id));
            const wsTasks = tasks?.filter((t) => wsProjectIds.has(t.project_id)) ?? [];
            const wsDone = wsTasks.filter((t) => t.status === "done").length;

            return (
              <div
                key={w.id}
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
              >
                <span className="text-sm">{w.name}</span>
                <span className="text-xs text-muted">
                  {wsProjects.length} project · {wsTasks.length} task ({wsDone} selesai)
                </span>
              </div>
            );
          })}
          {!workspaces?.length && (
            <p className="text-sm text-muted">Belum ada data.</p>
          )}
        </div>
      </div>
    </div>
  );
}