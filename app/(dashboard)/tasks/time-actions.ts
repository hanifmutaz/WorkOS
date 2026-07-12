"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function startTimer(taskId: string, projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Stop any other running timer for this user first (satu timer aktif dalam satu waktu)
  await supabase
    .from("time_entries")
    .update({ ended_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("ended_at", null);

  const { error } = await supabase.from("time_entries").insert({
    task_id: taskId,
    user_id: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function stopTimer(entryId: string, projectId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("time_entries")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", entryId);

  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
