"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format, subDays } from "date-fns";
import type { HabitLog } from "@/types";
import { Flame } from "lucide-react";

interface Props {
  habits: HabitLog[];
  userId: string;
  today: string;
}

export default function StreakWidget({
  habits: initial,
  userId,
  today,
}: Props) {
  const [habits, setHabits] = useState(initial);
  const supabase = createClient();

  const codedDates = new Set(habits.filter((h) => h.coded).map((h) => h.date));
  const todayLogged = codedDates.has(today);

  async function toggleToday() {
    if (todayLogged) {
      await supabase
        .from("habit_logs")
        .delete()
        .eq("user_id", userId)
        .eq("date", today);
      setHabits(habits.filter((h) => h.date !== today));
    } else {
      const { data } = await supabase
        .from("habit_logs")
        .upsert({ user_id: userId, date: today, coded: true })
        .select()
        .single();
      if (data) setHabits([...habits.filter((h) => h.date !== today), data]);
    }
  }

  const streak = calculateStreak(codedDates);
  const days = Array.from({ length: 28 }, (_, i) =>
    format(subDays(new Date(), 27 - i), "yyyy-MM-dd"),
  );

  return (
    <div className="bg-gray-900 border border-gray-800/60 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs lg:text-sm font-medium text-gray-400 uppercase tracking-widest">
            Coding streak
          </h2>
        </div>
        <button
          onClick={toggleToday}
          className={`text-[0.625rem] lg:text-xs px-3 py-1.5 rounded-full border transition-colors ${
            todayLogged
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-500"
          }`}
        >
          {todayLogged ? "✓ Coded today" : "Mark today"}
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-4">
        {days.map((date) => (
          <div
            key={date}
            title={date}
            className={`h-5 rounded-sm transition-colors ${
              codedDates.has(date)
                ? "bg-emerald-500 opacity-80 hover:opacity-100"
                : "bg-gray-800"
            }`}
          />
        ))}
      </div>

      <div className="flex gap-6">
        <div>
          <div className="text-xl font-semibold text-white">{streak}</div>
          <div className="text-xs text-gray-500">current streak</div>
        </div>
        <div>
          <div className="text-xl font-semibold text-white">
            {codedDates.size}
          </div>
          <div className="text-xs text-gray-500">days this month</div>
        </div>
      </div>
    </div>
  );
}

function calculateStreak(coded: Set<string>) {
  let streak = 0;
  let current = new Date();
  while (true) {
    const d = format(current, "yyyy-MM-dd");
    if (coded.has(d)) {
      streak++;
      current = new Date(current.getTime() - 86400000);
    } else break;
  }
  return streak;
}
