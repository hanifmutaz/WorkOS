"use server";

import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";

export async function recordAttachment(params: {
    taskId: string;
    projectId: string;
    fileName: string;
    storagePath: string;
    fileSize: number;
    mimeType: string;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase.from("attachments").insert({
        task_id: params.taskId,
        user_id: user.id,
        file_name: params.fileName,
        storage_path: params.storagePath,
        file_size: params.fileSize,
        mime_type: params.mimeType,
    });

    if (error) return { error: error.message };

    await logActivity(supabase, {
        userId: user.id,
        entityType: "task",
        entityId: params.taskId,
        entityName: params.fileName,
        action: "created",
        detail: "attachment",
    });

    revalidatePath(`/projects/${params.projectId}`);
    return { success: true };
}

export async function deleteAttachment(id: string, storagePath: string, projectId: string) {
    const supabase = await createClient();

    const { error: storageError } = await supabase.storage
        .from("attachments")
        .remove([storagePath]);

    if (storageError) return { error: storageError.message };

    const { error } = await supabase.from("attachments").delete().eq("id", id);

    if (error) return { error: error.message };

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}

export async function getAttachmentUrl(storagePath: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
        .from("attachments")
        .createSignedUrl(storagePath, 300);

    if (error) return { error: error.message };

    return { url: data.signedUrl };
}