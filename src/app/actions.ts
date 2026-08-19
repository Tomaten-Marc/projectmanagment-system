"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { ok: boolean; message: string };
type EditableTable = "tasks" | "open_questions" | "decisions" | "stakeholders" | "access_requests" | "roadmap_items";

const uuid = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
const base = { id: uuid.optional(), work_package_id: uuid.optional() };
const schemas = {
  tasks: z.object({ ...base, task_code: z.string().trim().min(1).max(40), title: z.string().trim().min(1).max(240), description: z.string().max(4000).nullable(), implementation_details: z.string().max(12000).nullable(), status: z.enum(["open","waiting","in_progress","blocked","done"]), priority: z.enum(["low","medium","high","critical"]), blocking: z.boolean(), responsible: z.string().max(200).nullable(), dependency: z.string().max(500).nullable(), due_date: z.string().nullable(), notes: z.string().max(4000).nullable(), sort_order: z.number().int().min(0).max(100000) }),
  open_questions: z.object({ ...base, question_code: z.string().trim().min(1).max(40), question: z.string().trim().min(1).max(2000), status: z.enum(["not_asked","asked","answered","obsolete"]), blocking: z.boolean(), answer: z.string().max(4000).nullable(), next_action: z.string().max(1000).nullable(), notes: z.string().max(4000).nullable() }),
  decisions: z.object({ ...base, decision_code: z.string().trim().min(1).max(40), title: z.string().trim().min(1).max(240), description: z.string().max(4000).nullable(), status: z.enum(["open","pending","decided"]), selected_option: z.string().max(1000).nullable(), dependent_on: z.string().max(1000).nullable(), notes: z.string().max(4000).nullable() }),
  stakeholders: z.object({ id: uuid.optional(), name: z.string().trim().min(1).max(200), organizational_unit: z.string().max(200).nullable(), role: z.string().max(300).nullable(), responsibility: z.string().max(1000).nullable(), notes: z.string().max(4000).nullable() }),
  access_requests: z.object({ ...base, system_name: z.string().trim().min(1).max(240), description: z.string().max(4000).nullable(), status: z.enum(["unknown","required","requested","granted","rejected","not_required"]), responsible: z.string().max(200).nullable(), notes: z.string().max(4000).nullable() }),
  roadmap_items: z.object({ ...base, title: z.string().trim().min(1).max(240), description: z.string().max(4000).nullable(), week_number: z.number().int().min(1).max(53).nullable(), start_date: z.string().nullable(), end_date: z.string().nullable(), status: z.string().trim().min(1).max(80), dependency: z.string().max(500).nullable(), sort_order: z.number().int().min(0).max(100000) }),
} satisfies Record<EditableTable, z.ZodType>;

const text = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
};
const number = (formData: FormData, key: string) => {
  const value = text(formData, key);
  return value === null ? null : Number(value);
};

function formValues(table: EditableTable, formData: FormData) {
  const common = { id: text(formData, "id") ?? undefined, work_package_id: text(formData, "work_package_id") ?? undefined };
  if (table === "tasks") return { ...common, task_code: text(formData,"task_code"), title: text(formData,"title"), description: text(formData,"description"), implementation_details: text(formData,"implementation_details"), status: text(formData,"status"), priority: text(formData,"priority"), blocking: formData.get("blocking") === "on", responsible: text(formData,"responsible"), dependency: text(formData,"dependency"), due_date: text(formData,"due_date"), notes: text(formData,"notes"), sort_order: number(formData,"sort_order") ?? 0 };
  if (table === "open_questions") return { ...common, question_code: text(formData,"question_code"), question: text(formData,"question"), status: text(formData,"status"), blocking: formData.get("blocking") === "on", answer: text(formData,"answer"), next_action: text(formData,"next_action"), notes: text(formData,"notes") };
  if (table === "decisions") return { ...common, decision_code: text(formData,"decision_code"), title: text(formData,"title"), description: text(formData,"description"), status: text(formData,"status"), selected_option: text(formData,"selected_option"), dependent_on: text(formData,"dependent_on"), notes: text(formData,"notes") };
  if (table === "stakeholders") return { id: common.id, name: text(formData,"name"), organizational_unit: text(formData,"organizational_unit"), role: text(formData,"role"), responsibility: text(formData,"responsibility"), notes: text(formData,"notes") };
  if (table === "access_requests") return { ...common, system_name: text(formData,"system_name"), description: text(formData,"description"), status: text(formData,"status"), responsible: text(formData,"responsible"), notes: text(formData,"notes") };
  return { ...common, title: text(formData,"title"), description: text(formData,"description"), week_number: number(formData,"week_number"), start_date: text(formData,"start_date"), end_date: text(formData,"end_date"), status: text(formData,"status"), dependency: text(formData,"dependency"), sort_order: number(formData,"sort_order") ?? 0 };
}

export async function saveEntity(table: EditableTable, _: ActionState, formData: FormData): Promise<ActionState> {
  await verifyUser();
  if (!(table in schemas)) return { ok: false, message: "Invalid request." };
  const parsed = schemas[table].safeParse(formValues(table, formData));
  if (!parsed.success) return { ok: false, message: "Please check the entered values." };
  const { id, ...values } = parsed.data as Record<string, unknown> & { id?: string };
  const supabase = await createClient();
  const result = id
    ? await supabase.from(table).update(values as never).eq("id", id).select("id").single()
    : await supabase.from(table).insert(values).select("id").single();
  if (result.error) return { ok: false, message: "The change could not be saved." };
  const workPackageId = typeof values.work_package_id === "string" ? values.work_package_id : null;
  await supabase.from("activity_log").insert({ event_type: id ? "entity_updated" : "entity_created", work_package_id: workPackageId, entity_type: table, entity_id: result.data.id, summary: `${table.replaceAll("_", " ")} ${id ? "updated" : "created"}`, details: { source: "web form" }, source: "web_app" });
  revalidatePath("/", "layout");
  return { ok: true, message: "Saved." };
}

export async function deleteEntity(table: EditableTable, id: string): Promise<ActionState> {
  await verifyUser();
  const parsedId = uuid.safeParse(id);
  if (!(table in schemas) || !parsedId.success) return { ok: false, message: "Invalid request." };
  const supabase = await createClient();
  const { error } = await supabase.from(table).delete().eq("id", parsedId.data);
  if (error) return { ok: false, message: "The record could not be deleted." };
  await supabase.from("activity_log").insert({ event_type: "entity_deleted", entity_type: table, entity_id: parsedId.data, summary: `${table.replaceAll("_", " ")} deleted`, source: "web_app" });
  revalidatePath("/", "layout");
  return { ok: true, message: "Deleted." };
}
