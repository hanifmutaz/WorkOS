"use server";

import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { deleteAttachmentsForTasks } from "@/lib/attachments-cleanup";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProject(workspaceId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name = formData.get("name") as string;
  const status = (formData.get("status") as string) || "planning";
  const priority = (formData.get("priority") as string) || "medium";
  const start_date = (formData.get("start_date") as string) || null;
  const end_date = (formData.get("end_date") as string) || null;

  if (!name?.trim()) return { error: "Nama project wajib diisi" };

  const { data, error } = await supabase
    .from("projects")
    .insert({
      workspace_id: workspaceId,
      name: name.trim(),
      status,
      priority,
      start_date,
      end_date,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await logActivity(supabase, {
    userId: user.id,
    entityType: "project",
    entityId: data.id,
    entityName: name.trim(),
    action: "created",
  });

  revalidatePath(`/workspaces/${workspaceId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateProject(id: string, workspaceId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name = formData.get("name") as string;
  const status = formData.get("status") as string;
  const priority = formData.get("priority") as string;
  const start_date = (formData.get("start_date") as string) || null;
  const end_date = (formData.get("end_date") as string) || null;

  if (!name?.trim()) return { error: "Nama project wajib diisi" };

  const { error } = await supabase
    .from("projects")
    .update({ name: name.trim(), status, priority, start_date, end_date })
    .eq("id", id);

  if (error) return { error: error.message };

  await logActivity(supabase, {
    userId: user.id,
    entityType: "project",
    entityId: id,
    entityName: name.trim(),
    action: "updated",
    detail: `status: ${status}`,
  });

  revalidatePath(`/workspaces/${workspaceId}`);
  revalidatePath(`/projects/${id}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteProject(id: string, workspaceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", id)
    .single();

  const { data: tasksInProject } = await supabase
    .from("tasks")
    .select("id")
    .eq("project_id", id);

  await deleteAttachmentsForTasks(supabase, (tasksInProject ?? []).map((t) => t.id));

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) return { error: error.message };

  await logActivity(supabase, {
    userId: user.id,
    entityType: "project",
    entityId: id,
    entityName: project?.name ?? "Project",
    action: "deleted",
  });

  revalidatePath(`/workspaces/${workspaceId}`);
  revalidatePath("/dashboard");
  redirect(`/workspaces/${workspaceId}`);
}