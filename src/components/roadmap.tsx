import type { RoadmapItem, WorkPackage } from "@/lib/database.types";
import { StatusBadge } from "@/components/status-badge";

const weeks = Array.from({length: 12}, (_, index) => index + 35);

export function Roadmap({ items, workPackages }: { items: RoadmapItem[]; workPackages: WorkPackage[] }) {
  return <section className="gantt"><div className="gantt-head"><div>Roadmap item</div>{weeks.map((week) => <span key={week}>KW{week}</span>)}</div>
    {items.map((item) => { const start = item.start_date ? isoWeek(new Date(`${item.start_date}T00:00:00`)) : item.week_number ?? 35; const end = item.end_date ? isoWeek(new Date(`${item.end_date}T00:00:00`)) : start; const left = Math.max(0,start-35); const width = Math.max(1,Math.min(47,end)-Math.max(35,start)+1); return <div className="gantt-row" key={item.id}><div><strong>{item.title}</strong><small>{workPackages.find((wp) => wp.id === item.work_package_id)?.code} · <StatusBadge value={item.status} /></small></div><div className="gantt-track">{weeks.map((week) => <i key={week} />)}<span style={{gridColumn:`${left+1} / span ${width}`}}>{item.dependency ? "Dependency" : ""}</span></div></div> })}
    {!items.length && <p className="empty">No roadmap items.</p>}
  </section>;
}

function isoWeek(date: Date) { const copy = new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())); const day = copy.getUTCDay() || 7; copy.setUTCDate(copy.getUTCDate()+4-day); const yearStart = new Date(Date.UTC(copy.getUTCFullYear(),0,1)); return Math.ceil((((copy.getTime()-yearStart.getTime())/86400000)+1)/7); }