import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(resolve("supabase/migrations/0001_initial_schema.sql"), "utf8");
const realtimeMigration = readFileSync(resolve("supabase/migrations/20260819073248_enable_realtime_and_task_details.sql"), "utf8");
const tables = ["work_packages","tasks","open_questions","decisions","stakeholders","access_requests","roadmap_items","activity_log"];

describe("database security contract", () => {
  it.each(tables)("enables RLS for %s", (table) => {
    expect(migration).toContain(`alter table public.${table} enable row level security`);
  });

  it("explicitly denies all anonymous table access", () => {
    expect(migration).toContain("revoke all on all tables in schema public from anon");
    expect(migration).not.toMatch(/create policy[^;]+to anon/i);
  });

  it("grants CRUD only through authenticated policies", () => {
    expect(migration).toContain("for select to authenticated");
    expect(migration).toContain("for insert to authenticated");
    expect(migration).toContain("for update to authenticated");
    expect(migration).toContain("for delete to authenticated");
  });
});

describe("realtime and task detail migration", () => {
  it("adds a dedicated task implementation field", () => {
    expect(realtimeMigration).toContain("add column implementation_details text");
  });

  it.each(tables)("adds %s to the Realtime publication", (table) => {
    expect(realtimeMigration).toContain(`'${table}'`);
  });
});
