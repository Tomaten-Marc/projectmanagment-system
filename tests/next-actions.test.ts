// @vitest-environment jsdom

import { createElement } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NextActions } from "@/components/next-actions";
import type { Task } from "@/lib/database.types";

const workPackages = [
  { id: "10000000-0000-0000-0000-000000000001", code: "AP1" },
  { id: "10000000-0000-0000-0000-000000000002", code: "AP2" },
  { id: "10000000-0000-0000-0000-000000000003", code: "AP3" },
];

const tasks = [
  task("20000000-0000-0000-0000-000000000001", workPackages[0].id, "AP1-T01", "First AP task"),
  task("20000000-0000-0000-0000-000000000002", workPackages[1].id, "AP2-T01", "Second AP task"),
];

describe("NextActions", () => {
  it("filters actions by AP and links each action to its detail page", () => {
    render(createElement(NextActions, { tasks, workPackages }));

    expect(screen.getByText("First AP task")).toBeTruthy();
    expect(screen.getByText("Second AP task")).toBeTruthy();
    expect(screen.getByRole("link", { name: /First AP task/ }).getAttribute("href")).toBe(`/tasks/${tasks[0].id}`);

    fireEvent.click(screen.getByRole("button", { name: "AP1" }));

    expect(screen.getByText("First AP task")).toBeTruthy();
    expect(screen.queryByText("Second AP task")).toBeNull();
  });
});

function task(id: string, workPackageId: string, taskCode: string, title: string): Task {
  return {
    id,
    work_package_id: workPackageId,
    task_code: taskCode,
    title,
    description: null,
    implementation_details: null,
    status: "open",
    priority: "medium",
    blocking: false,
    responsible: null,
    dependency: null,
    due_date: null,
    started_at: null,
    completed_at: null,
    notes: null,
    sort_order: 0,
    created_at: "2026-08-19T08:00:00.000Z",
    updated_at: "2026-08-19T08:00:00.000Z",
  };
}
