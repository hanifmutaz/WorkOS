"use client";

import { useRef, useState, useTransition } from "react";
import { createTask } from "@/app/(dashboard)/tasks/actions";
import { useToast } from "@/components/toast";

const PRIORITIES = ["low", "medium", "high"];

type Milestone = { id: string; name: string };

export function TaskForm({
  projectId,
  milestones = [],
}: {
  projectId: string;
  milestones?: Milestone[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { show } = useToast();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createTask(projectId, formData);
      if (res?.error) {
        setError(res.error);
        show(res.error, "error");
        return;
      }
      formRef.current?.reset();
      show("Task dibuat");
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <input
        name="title"
        placeholder="Judul task"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary"
        required
      />
      <textarea
        name="description"
        placeholder="Deskripsi (opsional)"
        rows={2}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary"
      />

      {milestones.length > 0 && (
        <select
          name="milestone_id"
          defaultValue=""
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary"
        >
          <option value="">Tanpa milestone</option>
          {milestones.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      )}

      <div className="flex gap-2">
        <select
          name="priority"
          defaultValue="medium"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <input
          type="datetime-local"
          name="deadline"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Nyimpen..." : "Tambah Task"}
      </button>
    </form>
  );
}