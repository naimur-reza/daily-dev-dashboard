"use client";

import { useState } from "react";
import type { PlannerContext } from "@/types/planner";
import { Sparkles, Plus, X } from "lucide-react";

const DEFAULT_CONTEXT: PlannerContext = {
  job_start: "10:00",
  job_end: "17:00",
  work_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  peak_hours: "9am-12pm",
  goals: [
    "Get a frontend/fullstack job",
    "Learn React & Next.js deeply",
    "Build pet project",
    "Practice DSA daily",
  ],
  weekly_study_hrs: 10,
  weekly_project_hrs: 6,
  weekly_leisure_hrs: 8,
  learning_focus: "React, Next.js, DSA, Node.js, Pet Project — balanced",
  extra_context:
    "I am a job seeker based in Dhaka, Bangladesh. I work 10am-5pm. I want to study in the morning before work (9am-10am) and after work. Weekends are for deep study and project work. I also want time to relax, play games, and spend time with myself.",
};

const ALL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface Props {
  initial?: Partial<PlannerContext>;
  onGenerate: (ctx: PlannerContext) => void;
  loading: boolean;
}

export default function ContextForm({ initial, onGenerate, loading }: Props) {
  const [ctx, setCtx] = useState<PlannerContext>({
    ...DEFAULT_CONTEXT,
    ...initial,
  });
  const [newGoal, setNewGoal] = useState("");

  function addGoal() {
    if (!newGoal.trim()) return;
    setCtx({ ...ctx, goals: [...ctx.goals, newGoal.trim()] });
    setNewGoal("");
  }

  function removeGoal(i: number) {
    setCtx({ ...ctx, goals: ctx.goals.filter((_, idx) => idx !== i) });
  }

  function toggleDay(day: string) {
    const days = ctx.work_days.includes(day)
      ? ctx.work_days.filter((d) => d !== day)
      : [...ctx.work_days, day];
    setCtx({ ...ctx, work_days: days });
  }

  return (
    <div className="bg-gray-900 border border-gray-800/60 rounded-xl p-6 space-y-6">
      <div>
        <h3 className="text-base font-semibold text-white mb-1">
          Your life context
        </h3>
        <p className="text-xs text-gray-500">
          Fill this once — AI uses it to plan your entire week automatically.
        </p>
      </div>

      {/* Work hours */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2">
            Job start time
          </label>
          <input
            type="time"
            value={ctx.job_start}
            onChange={(e) => setCtx({ ...ctx, job_start: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2">
            Job end time
          </label>
          <input
            type="time"
            value={ctx.job_end}
            onChange={(e) => setCtx({ ...ctx, job_end: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Work days */}
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2">
          Work days
        </label>
        <div className="flex flex-wrap gap-2">
          {ALL_DAYS.map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                ctx.work_days.includes(day)
                  ? "bg-blue-500/20 border border-blue-500/40 text-blue-400"
                  : "bg-gray-800 border border-gray-700 text-gray-500 hover:text-gray-300"
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Peak hours */}
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2">
          Peak productive hours (outside work)
        </label>
        <select
          value={ctx.peak_hours}
          onChange={(e) => setCtx({ ...ctx, peak_hours: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
        >
          <option value="6am-9am">6am – 9am (Early bird)</option>
          <option value="9am-12pm">9am – 12pm (Before work)</option>
          <option value="6pm-9pm">6pm – 9pm (After work)</option>
          <option value="9pm-12am">9pm – 12am (Night owl)</option>
        </select>
      </div>

      {/* Weekly hours allocation */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: "weekly_study_hrs", label: "Study hours/week" },
          { key: "weekly_project_hrs", label: "Project hours/week" },
          { key: "weekly_leisure_hrs", label: "Leisure hours/week" },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2">
              {label}
            </label>
            <input
              type="number"
              min={1}
              max={40}
              value={ctx[key as keyof PlannerContext] as number}
              onChange={(e) =>
                setCtx({ ...ctx, [key]: parseInt(e.target.value) || 0 })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        ))}
      </div>

      {/* Goals */}
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2">
          Your goals
        </label>
        <div className="space-y-2 mb-3">
          {ctx.goals.map((goal, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2"
            >
              <span className="flex-1 text-sm text-gray-300">{goal}</span>
              <button
                onClick={() => removeGoal(i)}
                className="text-gray-600 hover:text-red-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGoal()}
            placeholder="Add a goal e.g. Get a remote job by June"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button
            onClick={addGoal}
            className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-emerald-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Extra context */}
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2">
          Extra context for AI{" "}
          <span className="text-gray-700">(anything else it should know)</span>
        </label>
        <textarea
          value={ctx.extra_context}
          onChange={(e) => setCtx({ ...ctx, extra_context: e.target.value })}
          rows={3}
          placeholder="e.g. I get tired after work. Weekends I want more free time. I'm preparing for interviews in 2 months..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
        />
      </div>

      <button
        onClick={() => onGenerate(ctx)}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-400 font-semibold text-sm transition-colors disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4" />
        {loading
          ? "AI is planning your week..."
          : "Generate my weekly plan with AI"}
      </button>
    </div>
  );
}
