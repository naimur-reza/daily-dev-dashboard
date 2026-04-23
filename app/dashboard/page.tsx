import { createClient } from "@/lib/supabase/server";
import { getOpenPRs, getTodayCommitCount } from "@/lib/github";
import { getWeather } from "@/lib/weather";
import { getDailyChallenge } from "@/lib/challenges";
import { getDailyQuote } from "@/lib/quotes";
import { format } from "date-fns";

import StatsRow from "@/components/dashboard/StatsRow";
import TasksWidget from "@/components/dashboard/TasksWidget";
import PomodoroWidget from "@/components/dashboard/PomodoroWidget";
import PRsWidget from "@/components/dashboard/PRsWidget";
import StreakWidget from "@/components/dashboard/StreakWidget";
import ChallengeWidget from "@/components/dashboard/ChallengeWidget";
import WeatherWidget from "@/components/dashboard/WeatherWidget";
import QuoteWidget from "@/components/dashboard/QuoteWidget";
import JournalWidget from "@/components/dashboard/JournalWidget";

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const today = format(new Date(), "yyyy-MM-dd");

  const [
    { data: tasks },
    { data: journal },
    { data: habits },
    { data: pomodoroSessions },
    prs,
    commitCount,
    weather,
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .order("created_at"),
    supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .single(),
    supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", format(new Date(Date.now() - 28 * 86400000), "yyyy-MM-dd"))
      .order("date"),
    supabase
      .from("pomodoro_sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today),
    getOpenPRs(),
    getTodayCommitCount(),
    getWeather(),
  ]);

  const totalFocusMinutes = (pomodoroSessions ?? []).reduce(
    (sum, s) => sum + (s.minutes || 25),
    0,
  );
  const doneTasks = (tasks ?? []).filter((t) => t.done).length;
  const challenge = getDailyChallenge();
  const quote = await getDailyQuote();
  console.log("Daily quote:", quote);
  const currentStreak = calculateStreak(habits ?? []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Good {getGreeting()}, dev 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {format(new Date(), "EEEE, MMMM d")} · {tasks?.length ?? 0} tasks
            today
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-emerald-400 text-sm font-medium">
            {currentStreak} day streak
          </span>
        </div>
      </div>

      {/* Stats */}
      <StatsRow
        commitCount={commitCount}
        focusMinutes={totalFocusMinutes}
        openPRs={prs.length}
        doneTasks={doneTasks}
        totalTasks={tasks?.length ?? 0}
      />

      {/* Tasks + Pomodoro */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TasksWidget tasks={tasks ?? []} userId={user.id} today={today} />
        </div>
        <PomodoroWidget
          sessionCount={(pomodoroSessions ?? []).length}
          userId={user.id}
          today={today}
        />
      </div>

      {/* PRs + Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PRsWidget prs={prs} />
        <StreakWidget habits={habits ?? []} userId={user.id} today={today} />
      </div>

      {/* Challenge + Weather + Quote */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChallengeWidget challenge={challenge} />
        <WeatherWidget weather={weather} />
        <QuoteWidget quote={quote} />
      </div>

      {/* Journal */}
      <JournalWidget entry={journal ?? null} userId={user.id} today={today} />
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function calculateStreak(habits: { date: string; coded: boolean }[]) {
  const coded = habits
    .filter((h) => h.coded)
    .map((h) => h.date)
    .sort()
    .reverse();
  let streak = 0;
  let current = new Date();
  for (const date of coded) {
    const d = format(current, "yyyy-MM-dd");
    if (date === d) {
      streak++;
      current = new Date(current.getTime() - 86400000);
    } else break;
  }
  return streak;
}
