"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import type { Task, WorkPackage } from "@/lib/database.types";

export function NextActions({ tasks, workPackages }: {
  tasks: Task[];
  workPackages: Pick<WorkPackage, "id" | "code">[];
}) {
  const [selectedWorkPackage, setSelectedWorkPackage] = useState("all");
  const visibleTasks = tasks
    .filter((task) => selectedWorkPackage === "all" || task.work_package_id === selectedWorkPackage)
    .slice(0, 5);

  return <section className="panel">
    <header>
      <div><Clock3 size={18} /><h2>Next Actions</h2></div>
      <div className="ap-filter" role="group" aria-label="Filter next actions by work package">
        <button className={selectedWorkPackage === "all" ? "active" : ""} onClick={() => setSelectedWorkPackage("all")}>All</button>
        {workPackages.map((workPackage) => <button
          className={selectedWorkPackage === workPackage.id ? "active" : ""}
          key={workPackage.id}
          onClick={() => setSelectedWorkPackage(workPackage.id)}
        >{workPackage.code}</button>)}
      </div>
    </header>
    <div className="panel-list numbered">
      {visibleTasks.map((task, index) => <Link href={`/tasks/${task.id}`} key={task.id}>
        <span>{String(index + 1).padStart(2, "0")}</span>
        <div><strong>{task.title}</strong><small>{task.task_code} · {task.responsible ?? "Unassigned"}</small></div>
      </Link>)}
      {!visibleTasks.length && <p className="empty">No next actions for this work package.</p>}
    </div>
  </section>;
}
