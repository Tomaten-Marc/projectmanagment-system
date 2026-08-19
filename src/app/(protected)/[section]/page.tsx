import { notFound } from "next/navigation";
import { EntityTable } from "@/components/entity-table";
import { Roadmap } from "@/components/roadmap";
import { ActivityView } from "@/components/activity-view";
import { configs } from "@/lib/entity-config";
import { getProjectData } from "@/lib/data";

const routes = { tasks:"tasks", "open-questions":"open_questions", decisions:"decisions", stakeholders:"stakeholders", access:"access_requests" } as const;

export default async function SectionPage({ params }: { params: Promise<{section:string}> }) {
  const { section } = await params; const data = await getProjectData();
  if (section === "roadmap") return <Page title="Roadmap" subtitle="Delivery plan from KW35 through KW46 2026."><Roadmap items={data.roadmap} workPackages={data.workPackages} /><EntityTable table="roadmap_items" records={data.roadmap.map((x)=>({...x}))} {...configs.roadmap_items} workPackages={data.workPackages} /></Page>;
  if (section === "activity") return <Page title="Activity Log" subtitle="Immutable chronological project history."><ActivityView activity={data.activity} workPackages={data.workPackages} /></Page>;
  const table = routes[section as keyof typeof routes]; if (!table) notFound();
  const records = table === "open_questions" ? data.questions : table === "access_requests" ? data.access : data[table];
  return <Page title={configs[table].title} subtitle="Search, filter and maintain the current project record."><EntityTable table={table} records={records.map((x)=>({...x}))} {...configs[table]} workPackages={data.workPackages} /></Page>;
}

function Page({title,subtitle,children}:{title:string;subtitle:string;children:React.ReactNode}) { return <main className="page-content"><div className="page-heading"><div><p className="eyebrow">PROJECT REGISTER</p><h1>{title}</h1><p>{subtitle}</p></div></div>{children}</main>; }