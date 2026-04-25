"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

export default function WeeklySummaryButton() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function generateSummary() {
    setLoading(true);
    setOpen(true);
    const res = await fetch("/api/weekly-summary", { method: "POST" });
    const data = await res.json();
    setSummary(data.summary);
    setLoading(false);
  }

  return (
    <div className="relative">
      <button
        onClick={generateSummary}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg text-purple-400 text-[0.625rem] lg:text-sm transition-colors disabled:opacity-50"
      >
        <Sparkles className="size-3 lg:size-4" />
        {loading ? "Generating..." : "AI weekly summary"}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-96 bg-gray-900 border border-gray-700 rounded-xl p-4 z-10 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">
              Weekly summary
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-white text-lg leading-none"
            >
              ×
            </button>
          </div>
          {loading ? (
            <div className="flex gap-1 py-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-300 leading-relaxed">{summary}</p>
          )}
        </div>
      )}
    </div>
  );
}
