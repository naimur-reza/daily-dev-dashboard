"use client";

import type { PlanBlock } from "@/types/planner";
import { getCategoryMeta } from "@/lib/planner";

export default function WeeklyStats({ blocks }: { blocks: PlanBlock[] }) {
  const done = blocks.filter((b) => b.done).length;
  const total = blocks.length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  // Hours by category
  const hoursByCategory: Record<string, number> = {};
  for (const block of blocks) {
    const [sh, sm] = block.start_time.split(":").map(Number);
    const [eh, em] = block.end_time.split(":").map(Number);
    const hrs = (eh * 60 + em - (sh * 60 + sm)) / 60;
    hoursByCategory[block.category] =
      (hoursByCategory[block.category] ?? 0) + hrs;
  }

  const topCategories = Object.entries(hoursByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalHrs = Object.values(hoursByCategory).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-gray-900 border border-gray-800/60 rounded-xl p-5">
      <h3 className="text-xs lg:text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">
        Week overview
      </h3>

      {/* Completion */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Completion</span>
          <span>
            {done}/{total} blocks
          </span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-right text-xs text-emerald-400 mt-1">
          {progress}%
        </div>
      </div>

      {/* Hours by category */}
      <div>
        <p className="text-xs text-gray-500 mb-3">
          Hours planned: {totalHrs.toFixed(1)}h total
        </p>
        <div className="space-y-2.5">
          {topCategories.map(([cat, hrs]) => {
            const meta = getCategoryMeta(cat);
            const pct = totalHrs > 0 ? (hrs / totalHrs) * 100 : 0;
            return (
              <div key={cat}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={meta.color}>
                    {meta.emoji} {meta.label}
                  </span>
                  <span className="text-gray-500">{hrs.toFixed(1)}h</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${meta.bg.replace("/10", "/60")}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
