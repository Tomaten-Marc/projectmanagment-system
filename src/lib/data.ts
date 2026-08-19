import "server-only";
import { createClient } from "@/lib/supabase/server";
import { verifyUser } from "@/lib/auth";

export async function getProjectData() {
  await verifyUser();
  const supabase = await createClient();
  const [workPackages, tasks, questions, decisions, stakeholders, access, roadmap, activity] = await Promise.all([
    supabase.from("work_packages").select("*").order("code"),
    supabase.from("tasks").select("*").order("sort_order"),
    supabase.from("open_questions").select("*").order("question_code"),
    supabase.from("decisions").select("*").order("decision_code"),
    supabase.from("stakeholders").select("*").order("name"),
    supabase.from("access_requests").select("*").order("system_name"),
    supabase.from("roadmap_items").select("*").order("sort_order"),
    supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(100),
  ]);
  const error = [workPackages, tasks, questions, decisions, stakeholders, access, roadmap, activity].find((result) => result.error)?.error;
  if (error) throw new Error("Project data could not be loaded.");
  return {
    workPackages: workPackages.data ?? [], tasks: tasks.data ?? [], questions: questions.data ?? [],
    decisions: decisions.data ?? [], stakeholders: stakeholders.data ?? [], access: access.data ?? [],
    roadmap: roadmap.data ?? [], activity: activity.data ?? [],
  };
}

export type ProjectData = Awaited<ReturnType<typeof getProjectData>>;