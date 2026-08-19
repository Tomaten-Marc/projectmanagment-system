export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type WorkPackage = {
  id: string; code: string; title: string; description: string | null; status: string;
  progress: number; owner: string | null; scope: string | null; source_reference: string | null;
  created_at: string; updated_at: string;
};

export type Task = {
  id: string; work_package_id: string; task_code: string; title: string; description: string | null;
  status: "open" | "waiting" | "in_progress" | "blocked" | "done";
  priority: "low" | "medium" | "high" | "critical"; blocking: boolean;
  responsible: string | null; dependency: string | null; due_date: string | null;
  started_at: string | null; completed_at: string | null; notes: string | null;
  sort_order: number; created_at: string; updated_at: string;
};

export type OpenQuestion = {
  id: string; work_package_id: string; question_code: string; question: string;
  stakeholder_id: string | null; blocking: boolean;
  status: "not_asked" | "asked" | "answered" | "obsolete";
  asked_at: string | null; answered_at: string | null; answer: string | null;
  next_action: string | null; notes: string | null; created_at: string; updated_at: string;
};

export type Decision = {
  id: string; work_package_id: string; decision_code: string; title: string;
  description: string | null; options: Json | null; status: "open" | "pending" | "decided";
  selected_option: string | null; dependent_on: string | null; decided_at: string | null;
  notes: string | null; created_at: string; updated_at: string;
};

export type Stakeholder = {
  id: string; name: string; organizational_unit: string | null; role: string | null;
  responsibility: string | null; notes: string | null; created_at: string; updated_at: string;
};

export type AccessRequest = {
  id: string; work_package_id: string; system_name: string; description: string | null;
  status: "unknown" | "required" | "requested" | "granted" | "rejected" | "not_required";
  responsible: string | null; requested_at: string | null; granted_at: string | null;
  notes: string | null; created_at: string; updated_at: string;
};

export type RoadmapItem = {
  id: string; work_package_id: string; title: string; description: string | null;
  week_number: number | null; start_date: string | null; end_date: string | null;
  status: string; dependency: string | null; sort_order: number; created_at: string; updated_at: string;
};

export type ActivityLog = {
  id: string; created_at: string; event_type: string; work_package_id: string | null;
  entity_type: string | null; entity_id: string | null; summary: string; details: Json | null;
  source: "web_app" | "chatgpt" | "codex" | "manual" | "meeting" | "email";
};

type Table<Row> = {
  Row: Row;
  Insert: Partial<Row> & Record<string, unknown>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      work_packages: Table<WorkPackage>;
      tasks: Table<Task>;
      open_questions: Table<OpenQuestion>;
      decisions: Table<Decision>;
      stakeholders: Table<Stakeholder>;
      access_requests: Table<AccessRequest>;
      roadmap_items: Table<RoadmapItem>;
      activity_log: Table<ActivityLog>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};