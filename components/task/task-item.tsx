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

const STATUS_ICON: Record<string, string> = {
  todo: "⚪",
  in_progress: "🟡",
  done: "✅",
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

  function handleToggle() {
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
      <div className="flex items-center justify-between">
        <button
          onClick={handleToggle}
          disabled={isPending}
          className="flex items-center gap-2 text-left"
        >
          <span>{STATUS_ICON[task.status]}</span>
          <span
            className={`text-sm ${task.status === "done" ? "text-muted line-through" : "text-white"}`}
          >
            {task.title}
          </span>
        </button>

        <div className="flex items-center gap-2">
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
        <p className="mt-1 pl-6 text-xs text-muted">{task.description}</p>
      )}

      {task.baseSeconds !== undefined && (
        <div className="mt-2 flex justify-end">
          <TaskTimer
            taskId={task.id}
            projectId={task.project_id}
            baseSeconds={task.baseSeconds}
            runningEntryId={task.runningEntryId ?? null}
            runningStartedAt={task.runningStartedAt ?? null}
          />
        </div>
      )}

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