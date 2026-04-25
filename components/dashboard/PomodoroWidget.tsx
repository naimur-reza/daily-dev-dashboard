"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";

interface Props {
  sessionCount: number;
  userId: string;
  today: string;
}

const WORK = 25 * 60;
const BREAK = 5 * 60;

export default function PomodoroWidget({
  sessionCount: initial,
  userId,
  today,
}: Props) {
  const [seconds, setSeconds] = useState(WORK);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(initial);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (!isBreak) logSession();
            setIsBreak((b) => !b);
            return isBreak ? WORK : BREAK;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, isBreak]);

  async function logSession() {
    await supabase
      .from("pomodoro_sessions")
      .insert({ user_id: userId, date: today, minutes: 25 });
    setSessions((s) => s + 1);
  }

  function reset() {
    setRunning(false);
    setIsBreak(false);
    setSeconds(WORK);
  }

  function skip() {
    setRunning(false);
    if (!isBreak) logSession();
    setIsBreak((b) => !b);
    setSeconds(isBreak ? WORK : BREAK);
  }

  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  const progress = isBreak ? 1 - seconds / BREAK : 1 - seconds / WORK;
  const circumference = 2 * Math.PI * 52;

  return (
    <div className="bg-gray-900 border border-gray-800/60 rounded-xl p-5 flex flex-col items-center">
      <h2 className="text-xs lg:text-sm font-medium text-gray-400 uppercase tracking-widest mb-5 self-start">
        Pomodoro
      </h2>

      <div className="relative w-32 h-32 mb-5">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="rgb(31 41 55)"
            strokeWidth="6"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={isBreak ? "rgb(96 165 250)" : "rgb(52 211 153)"}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-mono font-semibold text-white">
            {mins}:{secs}
          </span>
          <span className="text-xs text-gray-500 mt-0.5">
            {isBreak ? "break" : "focus"}
          </span>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        <button
          onClick={reset}
          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => setRunning(!running)}
          className="px-5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm font-medium transition-colors flex items-center gap-2"
        >
          {running ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {running ? "Pause" : "Start"}
        </button>
        <button
          onClick={skip}
          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      <div className="text-center">
        <div className="text-lg font-semibold text-white">{sessions}</div>
        <div className="text-xs text-gray-500">sessions today</div>
      </div>
    </div>
  );
}
