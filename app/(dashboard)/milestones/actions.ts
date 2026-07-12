"use server";

import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";

export async function createMilestone(projectId: string, formData: FormData) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    const name = formData.get("name") as string;
    if (!name?.trim()) return { error: "Nama milestone wajib diisi" };

    const { count } = await supabase
        .from("milestones")
        .select("id", { count: "exact", head: true })
        .eq("project_id", projectId);

    const { data, error } = await supabase
        .from("milestones")
        .insert({ project_id: projectId, name: name.trim(), position: count ?? 0 })
        .select("id")
        .single();

    if (error) return { error: error.message };

    await logActivity(supabase, {
        userId: user.id,
        entityType: "project",
        entityId: projectId,
        entityName: name.trim(),
        action: "created",
        detail: "milestone",
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true, id: data.id };
}

export async function deleteMilestone(id: string, projectId: string) {
    const supabase = await createClient();

    const { error } = await supabase.from("milestones").delete().eq("id", id);

    if (error) return { error: error.message };

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}