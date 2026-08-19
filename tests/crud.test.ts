import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath, activityInsert, deleteEq, entity, from } = vi.hoisted(() => {
  const revalidatePath = vi.fn();
  const activityInsert = vi.fn(() => ({ select: vi.fn() }));
  const updateSingle = vi.fn(async () => ({ data: { id: "30000000-0000-0000-0000-000000000001" }, error: null }));
  const insertSingle = vi.fn(async () => ({ data: { id: "30000000-0000-0000-0000-000000000002" }, error: null }));
  const deleteEq = vi.fn(async () => ({ error: null }));
  const entity = {
    update: vi.fn(() => ({ eq: vi.fn(() => ({ select: vi.fn(() => ({ single: updateSingle })) })) })),
    insert: vi.fn(() => ({ select: vi.fn(() => ({ single: insertSingle })) })),
    delete: vi.fn(() => ({ eq: deleteEq })),
  };
  const from = vi.fn((table: string) => table === "activity_log" ? { insert: activityInsert } : entity);
  return { revalidatePath, activityInsert, updateSingle, insertSingle, deleteEq, entity, from };
});

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/auth", () => ({ verifyUser: vi.fn(async () => ({ id: "user" })) }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn(async () => ({ from })) }));

import { deleteEntity, saveEntity } from "@/app/actions";

describe("basic CRUD actions", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("creates a validated task and records activity", async () => {
    const form = taskForm();
    const result = await saveEntity("tasks", { ok:false, message:"" }, form);
    expect(result).toEqual({ ok:true, message:"Saved." });
    expect(entity.insert).toHaveBeenCalled();
    expect(activityInsert).toHaveBeenCalledWith(expect.objectContaining({ event_type:"entity_created", source:"web_app" }));
  });

  it("updates a task when a valid UUID is supplied", async () => {
    const form = taskForm(); form.set("id", "30000000-0000-0000-0000-000000000001");
    const result = await saveEntity("tasks", { ok:false, message:"" }, form);
    expect(result.ok).toBe(true); expect(entity.update).toHaveBeenCalled();
  });

  it("rejects invalid input before accessing the database", async () => {
    const form = taskForm(); form.set("task_code", "");
    const result = await saveEntity("tasks", { ok:false, message:"" }, form);
    expect(result.ok).toBe(false); expect(from).not.toHaveBeenCalled();
  });

  it("deletes by UUID and records activity", async () => {
    const result = await deleteEntity("tasks", "30000000-0000-0000-0000-000000000001");
    expect(result.ok).toBe(true); expect(deleteEq).toHaveBeenCalled();
    expect(activityInsert).toHaveBeenCalledWith(expect.objectContaining({ event_type:"entity_deleted" }));
  });
});

function taskForm() {
  const form = new FormData();
  form.set("work_package_id", "10000000-0000-0000-0000-000000000001"); form.set("task_code", "AP1-T99");
  form.set("title", "Test task"); form.set("status", "open"); form.set("priority", "medium"); form.set("sort_order", "10");
  return form;
}