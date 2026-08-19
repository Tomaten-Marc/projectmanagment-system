import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { getProjectData } from "@/lib/data";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getProjectData();
  const task = data.tasks.find((item) => item.id === id);
  if (!task) notFound();
  const workPackage = data.workPackages.find((item) => item.id === task.work_package_id);

  return <main className="page-content task-detail">
    <Link className="back-link" href="/"><ArrowLeft size={15} />Back to dashboard</Link>
    <header className="task-detail-hero">
      <div>
        <p className="eyebrow">{workPackage?.code ?? "UNKNOWN AP"} · {task.task_code}</p>
        <h1>{task.title}</h1>
        <p>{task.description ?? "No task description has been added yet."}</p>
      </div>
      <div className="task-statuses"><StatusBadge value={task.status} /><StatusBadge value={task.priority} /></div>
    </header>
    <section className="task-detail-grid">
      <article className="implementation-card">
        <p className="eyebrow">IMPLEMENTATION</p>
        <h2>How this step is implemented</h2>
        <p className="implementation-copy">{task.implementation_details ?? "No implementation details have been documented yet. Add them from the Tasks editor."}</p>
      </article>
      <aside className="task-facts">
        <h2>Task details</h2>
        <dl>
          <div><dt>Work package</dt><dd>{workPackage?.code ?? "—"}</dd></div>
          <div><dt>Responsible</dt><dd>{task.responsible ?? "Unassigned"}</dd></div>
          <div><dt>Due date</dt><dd>{task.due_date ? new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(new Date(task.due_date)) : "—"}</dd></div>
          <div><dt>Dependency</dt><dd>{task.dependency ?? "None"}</dd></div>
          <div><dt>Blocking</dt><dd>{task.blocking ? "Yes" : "No"}</dd></div>
        </dl>
      </aside>
    </section>
    {task.notes && <section className="task-notes"><h2>Notes</h2><p>{task.notes}</p></section>}
  </main>;
}
