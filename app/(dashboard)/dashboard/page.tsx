import { createClient } from "@/lib/supabase/server";
import { TaskItem } from "@/components/task/task-item";
import { ActivityFeed } from "@/components/activity-feed";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id, name, icon, color");

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, project_id, title, deadline, priority, status")
    .neq("status", "done")
    .order("deadline", { ascending: true })
    .limit(5);

  const { data: activityLogs } = await supabase
    .from("activity_logs")
    .select("id, entity_type, entity_name, action, detail, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div className="p-4 text-white sm:p-6">
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-medium text-muted">Workspaces</h2>
        <div className="flex flex-wrap gap-3">
          {workspaces?.length ? (
            workspaces.map((w) => (
              <div
                key={w.id}
                className="rounded-lg border border-border bg-surface px-4 py-3"
              >
                <span className="mr-2">{w.icon}</span>
                <span className="text-sm">{w.name}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">Belum ada workspace. Bikin dulu bre.</p>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-medium text-muted">Deadline terdekat</h2>
        <div className="space-y-2">
          {tasks?.length ? (
            tasks.map((t) => <TaskItem key={t.id} task={t} />)
          ) : (
            <p className="text-sm text-muted">Belum ada task.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted">Aktivitas terakhir</h2>
        <ActivityFeed logs={activityLogs ?? []} />
      </div>
    </div>
  );
}