import { GitCommitHorizontal, Clock, GitPullRequest, CheckSquare } from "lucide-react";

interface Props {
  commitCount: number;
  focusMinutes: number;
  openPRs: number;
  doneTasks: number;
  totalTasks: number;
}

export default function StatsRow({ commitCount, focusMinutes, openPRs, doneTasks, totalTasks }: Props) {
  const focusHours = Math.floor(focusMinutes / 60);
  const focusMins = focusMinutes % 60;
  const focusStr = focusHours > 0 ? `${focusHours}h ${focusMins}m` : `${focusMins}m`;

  const stats = [
    {
      label: "Commits today",
      value: commitCount.toString(),
      sub: "via GitHub API",
      icon: GitCommitHorizontal,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Focus time",
      value: focusStr || "0m",
      sub: "Goal: 4h · via Pomodoro",
      icon: Clock,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Open PRs",
      value: openPRs.toString(),
      sub: "via GitHub API",
      icon: GitPullRequest,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "Tasks done",
      value: `${doneTasks} / ${totalTasks}`,
      sub: `${totalTasks - doneTasks} remaining`,
      icon: CheckSquare,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, sub, icon: Icon, color, bg }) => (
        <div key={label} className="bg-gray-900 border border-gray-800/60 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-1.5 rounded-md ${bg}`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-widest">{label}</span>
          </div>
          <div className="text-2xl font-semibold text-white">{value}</div>
          <div className="text-xs text-gray-600 mt-1">{sub}</div>
        </div>
      ))}
    </div>
  );
}
