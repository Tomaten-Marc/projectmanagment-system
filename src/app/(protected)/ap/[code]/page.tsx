import { notFound } from "next/navigation";
import { EntityTable } from "@/components/entity-table";
import { ActivityView } from "@/components/activity-view";
import { Roadmap } from "@/components/roadmap";
import { StatusBadge } from "@/components/status-badge";
import { configs } from "@/lib/entity-config";
import { getProjectData } from "@/lib/data";

export default async function WorkPackagePage({ params }: { params: Promise<{code:string}> }) {
  const { code } = await params; const data = await getProjectData(); const wp = data.workPackages.find((item) => item.code === code.toUpperCase()); if (!wp) notFound();
  const tasks = data.tasks.filter((x)=>x.work_package_id===wp.id); const questions=data.questions.filter((x)=>x.work_package_id===wp.id); const decisions=data.decisions.filter((x)=>x.work_package_id===wp.id); const access=data.access.filter((x)=>x.work_package_id===wp.id); const roadmap=data.roadmap.filter((x)=>x.work_package_id===wp.id); const activity=data.activity.filter((x)=>x.work_package_id===wp.id);
  const names = new Set([...tasks.map((x)=>x.responsible),...access.map((x)=>x.responsible)].filter(Boolean)); const stakeholders=data.stakeholders.filter((x)=>names.has(x.name));
  return <main className="page-content"><div className="ap-hero"><div><div className="ap-code">{wp.code}</div><p className="eyebrow">WORK PACKAGE</p><h1>{wp.title}</h1><p>{wp.description}</p><div className="ap-meta"><StatusBadge value={wp.status} /><span>{wp.scope}</span></div></div><div className="ap-progress"><strong>{wp.progress}%</strong><span>Overall progress</span><div className="progress"><i style={{width:`${wp.progress}%`}} /></div></div></div>
    {wp.code === "AP2" && <div className="hypothesis"><strong>Hypothesis – needs verification</strong><span>ProMaster may be part of the existing SYS-Bench/DASIM/ETL4SYS pipeline. This is not confirmed. MAP remains an unresolved term.</span></div>}
    {wp.code === "AP3" && <div className="hypothesis neutral"><strong>Planning boundary</strong><span>AP3 is already in progress and is intentionally shown without detailed planning until its scope is clarified.</span></div>}
    <div className="ap-summary"><span><strong>{tasks.length}</strong> Tasks</span><span><strong>{tasks.filter(x=>x.blocking&&x.status!=="done").length}</strong> Blockers</span><span><strong>{questions.filter(x=>!["answered","obsolete"].includes(x.status)).length}</strong> Open questions</span><span><strong>{decisions.filter(x=>x.status!=="decided").length}</strong> Open decisions</span></div>
    <EntityTable table="tasks" records={tasks.map(x=>({...x}))} {...configs.tasks} workPackages={data.workPackages} fixedWorkPackageId={wp.id} />
    <EntityTable table="open_questions" records={questions.map(x=>({...x}))} {...configs.open_questions} workPackages={data.workPackages} fixedWorkPackageId={wp.id} />
    <EntityTable table="decisions" records={decisions.map(x=>({...x}))} {...configs.decisions} workPackages={data.workPackages} fixedWorkPackageId={wp.id} />
    <section className="context-section"><div><h2>Stakeholders</h2><p>People currently referenced by this work package.</p></div><div className="stakeholder-grid">{stakeholders.map((x)=><div key={x.id}><strong>{x.name}</strong><span>{x.role}</span><small>{x.organizational_unit ?? "Organization unknown"}</small></div>)}{!stakeholders.length&&<p className="empty">No directly referenced stakeholders.</p>}</div></section>
    <EntityTable table="access_requests" records={access.map(x=>({...x}))} {...configs.access_requests} workPackages={data.workPackages} fixedWorkPackageId={wp.id} />
    <section className="context-section"><div><h2>Roadmap</h2><p>Scheduled delivery windows.</p></div><Roadmap items={roadmap} workPackages={data.workPackages} /></section>
    <section className="context-section"><div><h2>Activity</h2><p>Most recent changes for {wp.code}.</p></div><ActivityView activity={activity.slice(0,10)} workPackages={data.workPackages} /></section>
  </main>;
}