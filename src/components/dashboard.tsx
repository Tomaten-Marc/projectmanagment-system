import Link from "next/link";
import { ArrowRight, CircleAlert } from "lucide-react";
import type { ProjectData } from "@/lib/data";
import { NextActions } from "@/components/next-actions";
import { StatusBadge } from "@/components/status-badge";

export function Dashboard({ data }: { data: ProjectData }) {
  const done = data.tasks.filter((item) => item.status === "done").length;
  const inProgress = data.tasks.filter((item) => item.status === "in_progress").length;
  const blocked = data.tasks.filter((item) => item.status === "blocked").length;
  const openQuestions = data.questions.filter((item) => !["answered", "obsolete"].includes(item.status));
  const blockers = [...data.tasks.filter((item) => item.blocking && item.status !== "done")].sort((a,b) => ["critical","high","medium","low"].indexOf(a.priority) - ["critical","high","medium","low"].indexOf(b.priority));
  const nextActions = data.tasks.filter((item) => ["open","in_progress"].includes(item.status));
  const waiting = [...new Set(data.tasks.filter((item) => ["waiting","blocked"].includes(item.status)).map((item) => item.responsible).filter(Boolean))];
  const overall = data.workPackages.length ? Math.round(data.workPackages.reduce((sum, item) => sum + item.progress, 0) / data.workPackages.length) : 0;
  const metrics = [
    ["Overall progress", `${overall}%`], ["Tasks total", data.tasks.length], ["Completed", done], ["In progress", inProgress],
    ["Blocked", blocked], ["Open questions", openQuestions.length], ["Blocking questions", openQuestions.filter((q) => q.blocking).length],
    ["Open decisions", data.decisions.filter((d) => d.status !== "decided").length], ["Open access", data.access.filter((a) => !["granted","not_required"].includes(a.status)).length],
  ];
  return <main className="page-content">
    <div className="page-heading"><div><p className="eyebrow">PROJECT OVERVIEW</p><h1>Control Center</h1><p>Current delivery health across all VM Brake Lab work packages.</p></div><span className="as-of">Live from Supabase</span></div>
    <section className="metrics-grid">{metrics.map(([label,value]) => <div className="metric" key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>
    <section className="wp-strip">{data.workPackages.map((wp) => <Link href={`/ap/${wp.code}`} key={wp.id}><div><span>{wp.code}</span><StatusBadge value={wp.status} /></div><strong>{wp.title}</strong><div className="progress"><i style={{width:`${wp.progress}%`}} /></div><small>{wp.progress}% complete <ArrowRight size={14} /></small></Link>)}</section>
    <div className="dashboard-grid">
      <section className="panel"><header><div><CircleAlert size={18} /><h2>Current Blockers</h2></div><span>{blockers.length}</span></header><div className="panel-list">{blockers.slice(0,6).map((item) => <div key={item.id}><span className="code">{item.task_code}</span><div><strong>{item.title}</strong><small>{item.responsible ?? "Owner unknown"}</small></div><StatusBadge value={item.priority} /></div>)}{!blockers.length && <p className="empty">No active blockers.</p>}</div></section>
      <NextActions tasks={nextActions} workPackages={data.workPackages} />
      <section className="panel"><header><div><UsersIcon /><h2>Waiting For</h2></div></header><div className="waiting-list">{waiting.map((name) => <span key={name}>{name}</span>)}{!waiting.length && <p className="empty">Nothing waiting.</p>}</div></section>
      <section className="panel"><header><div><ActivityIcon /><h2>Recent Activity</h2></div><Link href="/activity">View all</Link></header><div className="activity-list">{data.activity.slice(0,6).map((item) => <div key={item.id}><i /><div><strong>{item.summary}</strong><small>{new Intl.DateTimeFormat("de-DE", { dateStyle:"medium", timeStyle:"short" }).format(new Date(item.created_at))}</small></div></div>)}</div></section>
    </div>
  </main>;
}

function UsersIcon(){ return <span className="mini-icon">W</span>; }
function ActivityIcon(){ return <span className="mini-icon">A</span>; }
