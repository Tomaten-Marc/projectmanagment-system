"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const projectTables = [
  "work_packages",
  "tasks",
  "open_questions",
  "decisions",
  "stakeholders",
  "access_requests",
  "roadmap_items",
  "activity_log",
] as const;

const refreshDelayMs = 150;

export function RealtimeRefresh() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleRefresh = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => router.refresh(), refreshDelayMs);
    };

    let channel = supabase.channel("project-data-refresh");
    for (const table of projectTables) {
      channel = channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        scheduleRefresh,
      );
    }
    channel.subscribe();

    return () => {
      clearTimeout(refreshTimer);
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
