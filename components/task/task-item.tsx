"use client";

import { useState, useTransition } from "react";
import { toggleTaskStatus, deleteTask } from "@/app/(dashboard)/tasks/actions";
import { TaskTimer } from "@/components/task/task-timer";
import { AttachmentPanel } from "@/components/task/attachment-panel";
import { useToast } from "@/components/toast";

type Attachment = {
  id: string;
  file_name: string;
  storage_path: string;
  file_size: number | null;
};

type Task = {
  id: string;
  project_id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  deadline: string | null;
  baseSeconds?: number;
  runningEntryId?: string | null;
  runningStartedAt?: string | null;
  attachments?: Attachment[];
};

const PRIORITY_COLOR: Record<string, string> = {
  low: "bg-slate-500/20 text-slate-300",
  medium: "bg-amber-500/20 text-amber-300",
  high: "bg-red-500/20 text-red-300",
};

export function TaskItem({ task }: { task: Task }) {
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const { show } = useToast();

  function handleStatusChange() {
    startTransition(async () => {
      const res = await toggleTaskStatus(task.id, task.project_id, task.status);
      if (res?.error) show(res.error, "error");
    });
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    startTransition(async () => {
      const res = await deleteTask(task.id, task.project_id);
      if (res?.error) {
        show(res.error, "error");
        return;
      }
      show("Task dihapus");
    });
  }

  const attachmentCount = task.attachments?.length ?? 0;

  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-sm ${task.status === "done" ? "text-muted line-through" : "text-white"}`}
        >
          {task.title}
        </span>

        <div className="flex shrink-0 items-center gap-2">
          {task.attachments !== undefined && (
            <button
              onClick={() => setShowAttachments((v) => !v)}
              className="text-xs text-muted hover:text-primary"
            >
              📎 {attachmentCount}
            </button>
          )}
          {task.deadline && (
            <span className="text-xs text-muted">
              {new Date(task.deadline).toLocaleDateString("id-ID")}
            </span>
          )}
          <span className={`rounded-full px-2 py-0.5 text-xs ${PRIORITY_COLOR[task.priority]}`}>
            {task.priority}
          </span>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className={`text-xs ${confirmDelete ? "text-red-400" : "text-muted hover:text-red-400"}`}
          >
            {confirmDelete ? "yakin?" : "hapus"}
          </button>
        </div>
      </div>

      {task.description && (
        <p className="mt-1 text-xs text-muted">{task.description}</p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <div>
          {task.status === "todo" && (
            <button
              onClick={handleStatusChange}
              disabled={isPending}
              className="rounded-md bg-primary/20 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/30"
            >
              ▶ Mulai
            </button>
          )}
          {task.status === "in_progress" && (
            <button
              onClick={handleStatusChange}
              disabled={isPending}
              className="rounded-md bg-green-500/20 px-2.5 py-1 text-xs font-medium text-green-300 hover:bg-green-500/30"
            >
              ✅ Selesai
            </button>
          )}
          {task.status === "done" && (
            <button
              onClick={handleStatusChange}
              disabled={isPending}
              className="rounded-md px-2.5 py-1 text-xs text-muted hover:text-white"
            >
              ↺ Buka lagi
            </button>
          )}
        </div>

        {task.baseSeconds !== undefined && (
          <TaskTimer
            taskId={task.id}
            projectId={task.project_id}
            baseSeconds={task.baseSeconds}
            runningEntryId={task.runningEntryId ?? null}
            runningStartedAt={task.runningStartedAt ?? null}
          />
        )}
      </div>

      {showAttachments && task.attachments !== undefined && (
        <AttachmentPanel
          taskId={task.id}
          projectId={task.project_id}
          initialAttachments={task.attachments}
        />
      )}
    </div>
  );
}