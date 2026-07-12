"use server";

import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { deleteAttachmentsForTasks } from "@/lib/attachments-cleanup";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createWorkspace(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name = formData.get("name") as string;
  const icon = (formData.get("icon") as string) || "📁";
  const color = (formData.get("color") as string) || "#38bdf8";

  if (!name?.trim()) return { error: "Nama workspace wajib diisi" };

  const { data, error } = await supabase
    .from("workspaces")
    .insert({ name: name.trim(), icon, color, user_id: user.id })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await logActivity(supabase, {
    userId: user.id,
    entityType: "workspace",
    entityId: data.id,
    entityName: name.trim(),
    action: "created",
  });

  revalidatePath("/workspaces");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateWorkspace(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name = formData.get("name") as string;
  const icon = formData.get("icon") as string;
  const color = formData.get("color") as string;

  if (!name?.trim()) return { error: "Nama workspace wajib diisi" };

  const { error } = await supabase
    .from("workspaces")
    .update({ name: name.trim(), icon, color })
    .eq("id", id);

  if (error) return { error: error.message };

  await logActivity(supabase, {
    userId: user.id,
    entityType: "workspace",
    entityId: id,
    entityName: name.trim(),
    action: "updated",
  });

  revalidatePath("/workspaces");
  revalidatePath(`/workspaces/${id}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteWorkspace(id: string, confirmName: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name")
    .eq("id", id)
    .single();

  if (!workspace) return { error: "Workspace tidak ditemukan" };

  if (confirmName.trim() !== workspace.name) {
    return { error: "Nama yang lu ketik ga cocok" };
  }

  const { data: projectsInWorkspace } = await supabase
    .from("projects")
    .select("id")
    .eq("workspace_id", id);

  const projectIds = (projectsInWorkspace ?? []).map((p) => p.id);

  if (projectIds.length) {
    const { data: tasksInWorkspace } = await supabase
      .from("tasks")
      .select("id")
      .in("project_id", projectIds);

    await deleteAttachmentsForTasks(supabase, (tasksInWorkspace ?? []).map((t) => t.id));
  }

  const { error } = await supabase.from("workspaces").delete().eq("id", id);

  if (error) return { error: error.message };

  await logActivity(supabase, {
    userId: user.id,
    entityType: "workspace",
    entityId: id,
    entityName: workspace.name,
    action: "deleted",
  });

  revalidatePath("/workspaces");
  revalidatePath("/dashboard");
  redirect("/workspaces");
}