"use client";

import { useState, useTransition } from "react";
import { updateProject, deleteProject } from "@/app/(dashboard)/projects/actions";
import { useToast } from "@/components/toast";

const STATUSES = ["planning", "active", "done", "archived"];
const PRIORITIES = ["low", "medium", "high"];

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
          onClick={handleDelete}
          disabled={isPending}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            confirmDelete ? "bg-red-500 text-white" : "border border-red-400 text-red-400"
          }`}
        >
          {confirmDelete ? "Yakin hapus?" : "Hapus project"}
        </button>
      </div>
    </div>
  );
}
