import type { ActivityLog, WorkPackage } from "@/lib/database.types";

export function ActivityView({ activity, workPackages }: { activity: ActivityLog[]; workPackages: WorkPackage[] }) {
  return <section className="timeline">{activity.map((item) => <article key={item.id}><div className="timeline-time"><strong>{new Intl.DateTimeFormat("de-DE",{day:"2-digit",month:"short"}).format(new Date(item.created_at))}</strong><span>{new Intl.DateTimeFormat("de-DE",{hour:"2-digit",minute:"2-digit"}).format(new Date(item.created_at))}</span></div><i /><div><div><span className="code">{workPackages.find((wp) => wp.id === item.work_package_id)?.code ?? "SYS"}</span></div><h2>{item.summary}</h2><p>{item.event_type.replaceAll("_"," ")}</p></div></article>)}{!activity.length && <p className="empty">No activity recorded.</p>}</section>;
}
