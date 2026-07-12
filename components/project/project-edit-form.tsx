"use client";

import { useState, useTransition } from "react";
import { updateProject, deleteProject } from "@/app/(dashboard)/projects/actions";
import { useToast } from "@/components/toast";

const STATUSES = ["planning", "active", "done", "archived"];
const PRIORITIES = ["low", "medium", "high"];

const STATUS_COLOR: Record<string, string> = {
  planning: "text-muted border-border",
  active: "text-primary border-primary",
  done: "text-green-400 border-green-400",
  archived: "text-muted border-border",
};

const PRIORITY_COLOR: Record<string, string> = {
  low: "bg-slate-500/20 text-slate-300",
  medium: "bg-amber-500/20 text-amber-300",
  high: "bg-red-500/20 text-red-300",
};

type Project = {
  id: string;
  workspace_id: string;
  name: string;
  status: string;
  priority: string;
  start_date: string | null;
  end_date: string | null;
};

export function ProjectEditForm({ project }: { project: Project }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [status, setStatus] = useState(project.status);
  const [priority, setPriority] = useState(project.priority);
  const [startDate, setStartDate] = useState(project.start_date ?? "");
  const [endDate, setEndDate] = useState(project.end_date ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { show } = useToast();

  function handleSave() {
    setError(null);
    const formData = new FormData();
    formData.set("name", name);
    formData.set("status", status);
    formData.set("priority", priority);
    formData.set("start_date", startDate);
    formData.set("end_date", endDate);

    startTransition(async () => {
      const res = await updateProject(project.id, project.workspace_id, formData);
      if (res?.error) {
        setError(res.error);
        show(res.error, "error");
        return;
      }
      show("Project disimpan");
      setIsEditing(false);
    });
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    startTransition(async () => {
      await deleteProject(project.id, project.workspace_id);
    });
  }

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{project.name}</span>
          <span className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_COLOR[project.status]}`}>
            {project.status}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-xs ${PRIORITY_COLOR[project.priority]}`}>
            {project.priority}
          </span>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:border-primary hover:text-primary"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary"
      />

      <div className="flex gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Nyimpen..." : "Simpan"}
        </button>
        <button
          onClick={() => {
            setIsEditing(false);
            setName(project.name);
            setStatus(project.status);
            setPriority(project.priority);
            setError(null);
          }}
          className="rounded-lg px-4 py-2 text-sm text-muted hover:text-white"
        >
          Batal
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className={`ml-auto rounded-lg px-4 py-2 text-sm font-medium ${confirmDelete ? "bg-red-500 text-white" : "border border-red-400 text-red-400"
            }`}
        >
          {confirmDelete ? "Yakin hapus?" : "Hapus project"}
        </button>
      </div>
    </div>
  );
}