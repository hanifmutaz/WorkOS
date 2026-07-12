import { createClient } from "@/lib/supabase/server";
import { ProjectEditForm } from "@/components/project/project-edit-form";
import { AddTaskButton } from "@/components/task/add-task-button";
import { TaskItem } from "@/components/task/task-item";
import { AddMilestoneButton } from "@/components/milestone/add-milestone-button";
import { MilestoneGroupHeader } from "@/components/milestone/milestone-group-header";
import { aggregateTimeEntries } from "@/lib/time";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, workspace_id, name, status, priority, start_date, end_date")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const { data: milestones } = await supabase
    .from("milestones")
    .select("id, name, position")
    .eq("project_id", id)
    .order("position", { ascending: true });

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, project_id, title, description, status, priority, deadline, milestone_id")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const taskIds = tasks?.map((t) => t.id) ?? [];
  type TimeEntryRow = { id: string; task_id: string; started_at: string; ended_at: string | null };

  const { data: timeEntries } = taskIds.length
    ? await supabase
      .from("time_entries")
      .select("id, task_id, started_at, ended_at")
      .in("task_id", taskIds)
    : { data: [] as TimeEntryRow[] };

  const timeMap = aggregateTimeEntries(timeEntries ?? []);

  type AttachmentRow = {
    id: string;
    task_id: string;
    file_name: string;
    storage_path: string;
    file_size: number | null;
  };

  const { data: attachments } = taskIds.length
    ? await supabase
      .from("attachments")
      .select("id, task_id, file_name, storage_path, file_size")
      .in("task_id", taskIds)
    : { data: [] as AttachmentRow[] };

  const attachmentMap: Record<string, AttachmentRow[]> = {};
  for (const a of attachments ?? []) {
    if (!attachmentMap[a.task_id]) attachmentMap[a.task_id] = [];
    attachmentMap[a.task_id].push(a);
  }

  type TaskRow = {
    id: string;
    project_id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    deadline: string | null;
    milestone_id: string | null;
  };

  function withTiming(t: TaskRow) {
    return {
      ...t,
      baseSeconds: timeMap[t.id]?.baseSeconds ?? 0,
      runningEntryId: timeMap[t.id]?.runningEntryId ?? null,
      runningStartedAt: timeMap[t.id]?.runningStartedAt ?? null,
      attachments: attachmentMap[t.id] ?? [],
    };
  }

  const unassignedTasks = tasks?.filter((t) => !t.milestone_id) ?? [];

  return (
    <div className="p-6 text-white">
      <Link
        href={`/workspaces/${project.workspace_id}`}
        className="mb-4 inline-block text-sm text-muted hover:text-white"
      >
        ← Workspace
      </Link>

      <h1 className="mb-6 text-2xl font-semibold">{project.name}</h1>

      <div className="mb-8 max-w-sm">
        <ProjectEditForm project={project} />
      </div>

      <h2 className="mb-3 text-sm font-medium text-muted">Milestones</h2>
      <div className="mb-6 max-w-sm">
        <AddMilestoneButton projectId={project.id} />
      </div>

      {milestones?.map((m) => {
        const milestoneTasks = tasks?.filter((t) => t.milestone_id === m.id) ?? [];
        const doneCount = milestoneTasks.filter((t) => t.status === "done").length;

        return (
          <div key={m.id} className="mb-6">
            <MilestoneGroupHeader
              id={m.id}
              name={m.name}
              projectId={project.id}
              taskCount={milestoneTasks.length}
              doneCount={doneCount}
            />
            <div className="space-y-2">
              {milestoneTasks.length ? (
                milestoneTasks.map((t) => <TaskItem key={t.id} task={withTiming(t)} />)
              ) : (
                <p className="text-sm text-muted">Belum ada task di milestone ini.</p>
              )}
            </div>
          </div>
        );
      })}

      <h2 className="mb-3 text-sm font-medium text-muted">
        {milestones?.length ? "Tanpa Milestone" : "Tasks"}
      </h2>
      <div className="mb-4 space-y-2">
        {unassignedTasks.length ? (
          unassignedTasks.map((t) => <TaskItem key={t.id} task={withTiming(t)} />)
        ) : (
          <p className="text-sm text-muted">Belum ada task.</p>
        )}
      </div>

      <div className="max-w-sm">
        <AddTaskButton projectId={project.id} milestones={milestones ?? []} />
      </div>
    </div>
  );
}