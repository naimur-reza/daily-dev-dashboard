"use client";

import { useState } from "react";
import { format, isToday, parseISO } from "date-fns";
import type { PlanBlock } from "@/types/planner";
import { getCategoryMeta, PRIORITY_META } from "@/lib/planner";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface Props {
  blocks: PlanBlock[];
  onToggle: (id: string, done: boolean) => void;
}

export default function WeeklyCalendar({ blocks, onToggle }: Props) {
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );

  // Group blocks by date
  const byDate: Record<string, PlanBlock[]> = {};
  for (const block of blocks) {
    if (!byDate[block.date]) byDate[block.date] = [];
    byDate[block.date].push(block);
  }

  const dates = Object.keys(byDate).sort();
  const selectedBlocks = byDate[selectedDate] ?? [];

  const doneCount = selectedBlocks.filter((b) => b.done).length;
  const totalCount = selectedBlocks.length;
  const progress =
    totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {dates.map((date) => {
          const dayBlocks = byDate[date] ?? [];
          const dayDone = dayBlocks.filter((b) => b.done).length;
          const isSelected = date === selectedDate;
          const today = isToday(parseISO(date));

          return (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`flex flex-col items-center px-3 py-2.5 rounded-xl border transition-colors shrink-0 min-w-[60px] ${
                isSelected
                  ? "bg-purple-500/10 border-purple-500/40 text-purple-400"
                  : today
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-gray-800/60 border-gray-700/60 text-gray-500 hover:text-gray-300 hover:border-gray-600"
              }`}
            >
              <span className="text-xs font-medium">
                {format(parseISO(date), "EEE")}
              </span>
              <span className="text-lg font-semibold leading-tight">
                {format(parseISO(date), "d")}
              </span>
              {dayBlocks.length > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: Math.min(dayBlocks.length, 5) }).map(
                    (_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-1 rounded-full ${i < dayDone ? "bg-emerald-400" : "bg-gray-600"}`}
                      />
                    ),
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">
            {format(parseISO(selectedDate), "EEEE, MMMM d")}
            {isToday(parseISO(selectedDate)) && (
              <span className="ml-2 text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                Today
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {doneCount}/{totalCount} blocks done
          </p>
        </div>
        {totalCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{progress}%</span>
          </div>
        )}
      </div>

      {/* Time blocks */}
      {selectedBlocks.length === 0 ? (
        <div className="text-center py-12 text-gray-600 text-sm">
          No blocks planned for this day.
        </div>
      ) : (
        <div className="space-y-2">
          {selectedBlocks
            .sort((a, b) => a.start_time.localeCompare(b.start_time))
            .map((block) => {
              const cat = getCategoryMeta(block.category);
              const pri =
                PRIORITY_META[block.priority] ?? PRIORITY_META["medium"];
              return (
                <div
                  key={block.id}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                    block.done
                      ? "opacity-50 border-gray-800 bg-gray-900/40"
                      : `${cat.bg} ${cat.border}`
                  }`}
                >
                  <button
                    onClick={() => onToggle(block.id, !block.done)}
                    className={`mt-0.5 shrink-0 ${cat.color}`}
                  >
                    {block.done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-sm font-medium ${block.done ? "line-through text-gray-600" : "text-white"}`}
                      >
                        {cat.emoji} {block.title}
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${cat.bg} ${cat.color}`}
                      >
                        {cat.label}
                      </span>
                      <span className="flex items-center gap-1">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${pri.dot}`}
                        />
                        <span className={`text-xs ${pri.color}`}>
                          {block.priority}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <Clock className="w-3 h-3" />
                      {block.start_time} – {block.end_time}
                    </div>
                    {block.notes && (
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {block.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
