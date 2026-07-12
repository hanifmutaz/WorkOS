"use client";

import { CollapsibleAdd } from "@/components/collapsible-add";
import { TaskForm } from "@/components/task/task-form";

type Milestone = { id: string; name: string };

export function AddTaskButton({
    projectId,
    milestones,
}: {
    projectId: string;
    milestones: Milestone[];
}) {
    return (
        <CollapsibleAdd label="+ Tambah Task">
            {(close) => (
                <TaskForm projectId={projectId} milestones={milestones} onDone={close} onCancel={close} />
            )}
        </CollapsibleAdd>
    );
}