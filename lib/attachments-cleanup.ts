import type { SupabaseClient } from "@supabase/supabase-js";

export async function deleteAttachmentsForTasks(supabase: SupabaseClient, taskIds: string[]) {
    if (!taskIds.length) return;

    const { data: attachments } = await supabase
        .from("attachments")
        .select("storage_path")
        .in("task_id", taskIds);

    const paths = (attachments ?? []).map((a) => a.storage_path);
    if (paths.length) {
        await supabase.storage.from("attachments").remove(paths);
    }
    // row attachments ke-cascade otomatis pas task-nya dihapus, ga perlu delete manual di sini
}