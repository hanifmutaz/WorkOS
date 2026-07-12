"use client";

import { useRef, useState, useTransition } from "react";
import { createWorkspace } from "@/app/(dashboard)/workspaces/actions";
import { useToast } from "@/components/toast";

const ICONS = ["📁", "🏢", "💻", "🧪", "🎓", "💼", "❤️", "📚", "🚀"];
const COLORS = ["#38bdf8", "#f472b6", "#a78bfa", "#facc15", "#4ade80", "#fb7185"];

export function WorkspaceForm({ onDone }: { onDone?: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { show } = useToast();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createWorkspace(formData);
      if (res?.error) {
        setError(res.error);
        show(res.error, "error");
        return;
      }
      formRef.current?.reset();
      setIcon(ICONS[0]);
      setColor(COLORS[0]);
      show("Workspace dibuat");
      onDone?.();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <input type="hidden" name="icon" value={icon} />
      <input type="hidden" name="color" value={color} />

      <input
        name="name"
        placeholder="Nama workspace"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary"
        required
      />

      <div className="flex items-center gap-2">
        {ICONS.map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIcon(i)}
            className={`rounded-lg border px-2 py-1 text-sm ${
              icon === i ? "border-primary bg-background" : "border-border"
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
            className={`h-6 w-6 rounded-full border-2 ${
              color === c ? "border-white" : "border-transparent"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Nyimpen..." : "Tambah Workspace"}
      </button>
    </form>
  );
}
