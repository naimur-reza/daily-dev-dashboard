export interface Task {
  id: string;
  user_id: string;
  title: string;
  done: boolean;
  tag?: string;
  created_at: string;
  date: string; // YYYY-MM-DD
}

export interface JournalEntry {
  id: string;
  user_id: string;
  date: string;
  built: string;
  blocked: string;
  next: string;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  user_id: string;
  date: string;
  coded: boolean;
  created_at: string;
}

export interface PomodoroSession {
  id: string;
  user_id: string;
  date: string;
  minutes: number;
  created_at: string;
}

export interface GitHubPR {
  id: number;
  title: string;
  html_url: string;
  state: string;
  draft: boolean;
  repository_url: string;
  created_at: string;
  repo_name?: string;
}

export interface GitHubCommit {
  sha: string;
  commit: { message: string; author: { date: string } };
  html_url: string;
}

export interface WeatherData {
  temp: number;
  description: string;
  city: string;
  humidity: number;
  icon: string;
}

export interface DailyChallenge {
  id: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  slug: string;
  tags: string[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  company_logo?: string;
  location: string;
  url: string;
  salary?: string;
  tags: string[];
  description?: string;
  source: string;
  date: string;
  ai_reason?: string;
}

export interface JobApplication {
  id: string;
  user_id: string;
  company: string;
  role: string;
  location?: string;
  url?: string;
  salary?: string;
  status: "saved" | "applied" | "interview" | "offer" | "rejected" | "ghosted";
  applied_date: string;
  notes: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export type ApplicationStatus =
  | "saved"
  | "applied"
  | "interview"
  | "offer"
  | "rejected"
  | "ghosted";
