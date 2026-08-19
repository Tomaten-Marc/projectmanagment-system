import { Dashboard } from "@/components/dashboard";
import { getProjectData } from "@/lib/data";

export default async function HomePage() {
  const data = await getProjectData();
  return <Dashboard data={data} />;
}