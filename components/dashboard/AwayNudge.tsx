"use client";

import { AwaySession } from "@/hooks/useIdleTracker";

interface Props {
  session: AwaySession;
  onYes: (session: AwaySession) => void;
  onNo: () => void;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export default function AwayNudge({ session, onYes, onNo }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-lg p-4">
      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 mb-1">
        Welcome back 👋
      </p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
        You were away for{" "}
        <span className="font-medium text-zinc-700 dark:text-zinc-200">
          {formatDuration(session.durationSeconds)}
        </span>
        . Was that a break?
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onYes(session)}
          className="flex-1 text-sm py-1.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium hover:opacity-90 transition"
        >
          Yes, log it
        </button>
        <button
          onClick={onNo}
          className="flex-1 text-sm py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
        >
          No, I was coding
        </button>
      </div>
    </div>
  );
}
