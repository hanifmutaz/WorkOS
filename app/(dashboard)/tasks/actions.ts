"use server";

import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { deleteAttachmentsForTasks } from "@/lib/attachments-cleanup";
import { revalidatePath } from "next/cache";

export async function createTask(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const priority = (formData.get("priority") as string) || "medium";
  const deadline = (formData.get("deadline") as string) || null;
  const milestone_id = (formData.get("milestone_id") as string) || null;

  if (!title?.trim()) return { error: "Judul task wajib diisi" };

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      project_id: projectId,
      title: title.trim(),
      description,
      priority,
      deadline,
      milestone_id,
      status: "todo",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await logActivity(supabase, {
    userId: user.id,
    entityType: "task",
    entityId: data.id,
    entityName: title.trim(),
    action: "created",
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateTask(id: string, projectId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const status = formData.get("status") as string;
  const priority = formData.get("priority") as string;
  const deadline = (formData.get("deadline") as string) || null;

  if (!title?.trim()) return { error: "Judul task wajib diisi" };

  const { error } = await supabase
    .from("tasks")
    .update({ title: title.trim(), description, status, priority, deadline })
    .eq("id", id);

  if (error) return { error: error.message };

  await logActivity(supabase, {
    userId: user.id,
    entityType: "task",
    entityId: id,
    entityName: title.trim(),
    action: "updated",
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleTaskStatus(id: string, projectId: string, currentStatus: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const next =
    currentStatus === "todo" ? "in_progress" : currentStatus === "in_progress" ? "done" : "todo";

  const { data: task, error } = await supabase
    .from("tasks")
    .update({ status: next })
    .eq("id", id)
    .select("title")
    .single();

  if (error) return { error: error.message };

  await logActivity(supabase, {
    userId: user.id,
    entityType: "task",
    entityId: id,
    entityName: task?.title ?? "Task",
    action: "status_changed",
    detail: `${currentStatus} → ${next}`,
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTask(id: string, projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: task } = await supabase.from("tasks").select("title").eq("id", id).single();

  await deleteAttachmentsForTasks(supabase, [id]);

  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) return { error: error.message };

  await logActivity(supabase, {
    userId: user.id,
    entityType: "task",
    entityId: id,
    entityName: task?.title ?? "Task",
    action: "deleted",
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return { success: true };
}