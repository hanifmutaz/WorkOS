"use client";

import { CollapsibleAdd } from "@/components/collapsible-add";
import { WorkspaceForm } from "@/components/workspace/workspace-form";

export function AddWorkspaceButton() {
    return (
        <CollapsibleAdd label="+ Tambah Workspace">
            {(close) => <WorkspaceForm onDone={close} onCancel={close} />}
        </CollapsibleAdd>
    );
}