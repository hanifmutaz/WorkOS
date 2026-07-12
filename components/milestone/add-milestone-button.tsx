"use client";

import { CollapsibleAdd } from "@/components/collapsible-add";
import { MilestoneForm } from "@/components/milestone/milestone-form";

export function AddMilestoneButton({ projectId }: { projectId: string }) {
  return (
    <CollapsibleAdd label="+ Tambah Milestone">
      {(close) => <MilestoneForm projectId={projectId} onDone={close} />}
    </CollapsibleAdd>
  );
}