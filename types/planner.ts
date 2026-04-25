export interface PlannerContext {
  id?: string;
  user_id?: string;
  job_start: string;
  job_end: string;
  work_days: string[];
  peak_hours: string;
  goals: string[];
  weekly_study_hrs: number;
  weekly_project_hrs: number;
  weekly_leisure_hrs: number;
  learning_focus: string;
  extra_context: string;
}

export interface PlanBlock {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  title: string;
  category: BlockCategory;
  priority: BlockPriority;
  notes: string;
  done: boolean;
}

export type BlockCategory =
  | "study"
  | "project"
  | "job"
  | "leisure"
  | "self"
  | "apply"
  | "dsa"
  | "tutorial";

export type BlockPriority = "critical" | "high" | "medium" | "low";

export interface WeeklyPlan {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  plan: DayPlan[];
  ai_summary: string;
}

export interface DayPlan {
  date: string;
  day: string;
  blocks: RawBlock[];
}

export interface RawBlock {
  start_time: string;
  end_time: string;
  title: string;
  category: BlockCategory;
  priority: BlockPriority;
  notes: string;
}
