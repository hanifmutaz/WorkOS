import type { SupabaseClient } from "@supabase/supabase-js";

type EntityType = "workspace" | "project" | "task";
type Action = "created" | "updated" | "deleted" | "status_changed";

export async function logActivity(
  supabase: SupabaseClient,
  params: {
    userId: string;
    entityType: EntityType;
    entityId: string;
    entityName: string;
    action: Action;
    detail?: string;
  }
) {
  await supabase.from("activity_logs").insert({
    user_id: params.userId,
    entity_type: params.entityType,
    entity_id: params.entityId,
    entity_name: params.entityName,
    action: params.action,
    detail: params.detail ?? null,
  });
}
