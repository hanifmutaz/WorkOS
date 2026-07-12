"use client";

import { useRef, useState, useTransition } from "react";
import { createProject } from "@/app/(dashboard)/projects/actions";
import { useToast } from "@/components/toast";

const STATUSES = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "done", label: "Done" },
  { value: "archived", label: "Archived" },
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function ProjectForm({
  workspaceId,
  onDone,
  onCancel,
}: {
  workspaceId: string;
  onDone?: () => void;
  onCancel?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { show } = useToast();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createProject(workspaceId, formData);
      if (res?.error) {
        setError(res.error);
        show(res.error, "error");
        return;
      }
      formRef.current?.reset();
      show("Project dibuat");
      onDone?.();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <input
        name="name"
        placeholder="Nama project"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary"
        required
      />

      <div className="flex gap-2">
        <select
          name="status"
          defaultValue="planning"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          name="priority"
          defaultValue="medium"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary"
        >
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <input
          type="date"
          name="start_date"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary"
        />
        <input
          type="date"
          name="end_date"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Nyimpen..." : "Tambah Project"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm text-muted hover:text-white"
          >
            Batal
          </button>
        )}
      </div>
    </form>
  );
}