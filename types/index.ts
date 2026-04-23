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
