import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ActivityView } from "@/components/activity-view";
import { Dashboard } from "@/components/dashboard";
import type { ProjectData } from "@/lib/data";
import type { ActivityLog, WorkPackage } from "@/lib/database.types";

const workPackage: WorkPackage = {
  id: "10000000-0000-0000-0000-000000000001",
  code: "AP1",
  title: "Test package",
  description: null,
  status: "active",
  progress: 0,
  owner: null,
  scope: null,
  source_reference: null,
  created_at: "2026-08-19T08:00:00.000Z",
  updated_at: "2026-08-19T08:00:00.000Z",
};

const activity: ActivityLog = {
  id: "20000000-0000-0000-0000-000000000001",
  created_at: "2026-08-19T08:30:00.000Z",
  event_type: "entity_updated",
  work_package_id: workPackage.id,
  entity_type: "tasks",
  entity_id: null,
  summary: "Task updated",
  details: null,
  source: "codex",
};

describe("activity source display", () => {
  it("does not show a source in the activity log", () => {
    const html = renderToStaticMarkup(createElement(ActivityView, {
      activity: [activity],
      workPackages: [workPackage],
    }));

    expect(html).toContain("Task updated");
    expect(html).not.toContain("codex");
  });

  it("does not show a source in recent activity", () => {
    const data: ProjectData = {
      workPackages: [workPackage],
      tasks: [],
      questions: [],
      decisions: [],
      stakeholders: [],
      access: [],
      roadmap: [],
      activity: [activity],
    };
    const html = renderToStaticMarkup(createElement(Dashboard, { data }));

    expect(html).toContain("Task updated");
    expect(html).not.toContain("codex");
    expect(html).not.toContain(" · ");
  });
});
