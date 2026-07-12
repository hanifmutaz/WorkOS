"use client";

import { useState, useTransition } from "react";
import { deleteMilestone } from "@/app/(dashboard)/milestones/actions";
import { useToast } from "@/components/toast";

export function MilestoneGroupHeader({
    id,
    name,
    projectId,
    taskCount,
    doneCount,
}: {
    id: string;
    name: string;
    projectId: string;
    taskCount: number;
    doneCount: number;
}) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { show } = useToast();

    function handleDelete() {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }
        startTransition(async () => {
            const res = await deleteMilestone(id, projectId);
            if (res?.error) {
                show(res.error, "error");
                return;
            }
            show("Milestone dihapus (task di dalamnya pindah ke Tanpa Milestone)");
        });
    }

    return (
        <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">
                {name}{" "}
                <span className="font-normal text-muted">
                    ({doneCount}/{taskCount})
                </span>
            </h3>
            <button
                onClick={handleDelete}
                disabled={isPending}
                className={`text-xs ${confirmDelete ? "text-red-400" : "text-muted hover:text-red-400"}`}
            >
                {confirmDelete ? "yakin?" : "hapus milestone"}
            </button>
        </div>
    );
}