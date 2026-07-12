"use client";

import { useState, useTransition } from "react";
import { updateWorkspace, deleteWorkspace } from "@/app/(dashboard)/workspaces/actions";
import { useToast } from "@/components/toast";

const ICONS = ["📁", "🏢", "💻", "🧪", "🎓", "💼", "❤️", "📚", "🚀"];
const COLORS = ["#38bdf8", "#f472b6", "#a78bfa", "#facc15", "#4ade80", "#fb7185"];

type Workspace = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export function WorkspaceEditForm({ workspace }: { workspace: Workspace }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(workspace.name);
  const [icon, setIcon] = useState(workspace.icon);
  const [color, setColor] = useState(workspace.color);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const { show } = useToast();

  function handleSave() {
    setError(null);
    const formData = new FormData();
    formData.set("name", name);
    formData.set("icon", icon);
    formData.set("color", color);

    startTransition(async () => {
      const res = await updateWorkspace(workspace.id, formData);
      if (res?.error) {
        setError(res.error);
        show(res.error, "error");
        return;
      }
      show("Workspace disimpan");
      setIsEditing(false);
    });
  }

  function handleConfirmDelete() {
    startTransition(async () => {
      const res = await deleteWorkspace(workspace.id, deleteInput);
      if (res?.error) {
        show(res.error, "error");
        return;
      }
    });
  }

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg text-lg"
            style={{ backgroundColor: `${workspace.color}22` }}
          >
            {workspace.icon}
          </span>
          <span className="text-sm font-medium text-white">{workspace.name}</span>
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

      <div className="flex items-center gap-2">
        {ICONS.map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIcon(i)}
            className={`rounded-lg border px-2 py-1 text-sm ${icon === i ? "border-primary bg-background" : "border-border"
              }`}
          >
            {i}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className={`h-6 w-6 rounded-full border-2 ${color === c ? "border-white" : "border-transparent"
              }`}
            style={{ backgroundColor: c }}
          />
        ))}
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
            setName(workspace.name);
            setIcon(workspace.icon);
            setColor(workspace.color);
            setError(null);
          }}
          className="rounded-lg px-4 py-2 text-sm text-muted hover:text-white"
        >
          Batal
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isPending}
          className="ml-auto rounded-lg border border-red-400 px-4 py-2 text-sm font-medium text-red-400"
        >
          Hapus workspace
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="space-y-2 rounded-lg border border-red-400/40 bg-red-500/5 p-3">
          <p className="text-xs text-red-300">
            Ini bakal hapus SEMUA project, task, attachment, dan histori di dalam workspace
            ini secara permanen. Ketik <span className="font-semibold">{workspace.name}</span> buat
            konfirmasi.
          </p>
          <input
            value={deleteInput}
            onChange={(e) => setDeleteInput(e.target.value)}
            placeholder={workspace.name}
            className="w-full rounded-lg border border-red-400/40 bg-background px-3 py-2 text-sm text-white outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleConfirmDelete}
              disabled={isPending || deleteInput.trim() !== workspace.name}
              className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
            >
              {isPending ? "Menghapus..." : "Hapus permanen"}
            </button>
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteInput("");
              }}
              className="rounded-lg px-3 py-1.5 text-xs text-muted"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}