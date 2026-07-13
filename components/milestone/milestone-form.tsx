"use client";

import { useRef, useState, useTransition } from "react";
import { createMilestone } from "@/app/(dashboard)/milestones/actions";
import { useToast } from "@/components/toast";

export function MilestoneForm({
    projectId,
    onDone,
    onCancel,
}: {
    projectId: string;
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
            const res = await createMilestone(projectId, formData);
            if (res?.error) {
                setError(res.error);
                show(res.error, "error");
                return;
            }
            formRef.current?.reset();
            show("Grup dibuat");
            onDone?.();
        });
    }

    return (
        <form ref={formRef} action={handleSubmit} className="flex items-center gap-2">
            <input
                name="name"
                placeholder="Nama grup (mis. Backend, atau UAS Sistem Informasi)"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary"
                required
            />
            <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
            >
                {isPending ? "..." : "Simpan"}
            </button>
            {onCancel && (
                <button type="button" onClick={onCancel} className="text-sm text-muted hover:text-white">
                    Batal
                </button>
            )}
            {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
    );
}