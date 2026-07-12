"use client";

import { CollapsibleAdd } from "@/components/collapsible-add";
import { ProjectForm } from "@/components/project/project-form";

export function AddProjectButton({ workspaceId }: { workspaceId: string }) {
    return (
        <CollapsibleAdd label="+ Tambah Project">
            {(close) => <ProjectForm workspaceId={workspaceId} onDone={close} onCancel={close} />}
        </CollapsibleAdd>
    );
}