"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Save } from "lucide-react";
import type { JournalEntry } from "@/types";

interface Props {
  entry: JournalEntry | null;
  userId: string;
  today: string;
}

export default function JournalWidget({
  entry: initial,
  userId,
  today,
}: Props) {
  const [built, setBuilt] = useState(initial?.built ?? "");
  const [blocked, setBlocked] = useState(initial?.blocked ?? "");
  const [next, setNext] = useState(initial?.next ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  const save = useCallback(async () => {
    setSaving(true);
    await supabase.from("journal_entries").upsert(
      {
        user_id: userId,
        date: today,
        built,
        blocked,
        next,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,date" },
    );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [built, blocked, next, userId, today, supabase]);

  const fields = [
    {
      label: "What did I build today?",
      value: built,
      set: setBuilt,
      placeholder: "e.g. Built the dashboard layout, fixed auth bug...",
    },
    {
      label: "What blocked me?",
      value: blocked,
      set: setBlocked,
      placeholder: "e.g. Supabase RLS policy took a while...",
    },
    {
      label: "What's next?",
      value: next,
      set: setNext,
      placeholder: "e.g. Deploy to Vercel, write API tests...",
    },
  ];

  return (
    <div className="bg-gray-900 border border-gray-800/60 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs lg:text-sm font-medium text-gray-400 uppercase tracking-widest">
            Daily standup journal
          </h2>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 text-[0.625rem] lg:text-xs px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-emerald-400 transition-colors disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {saved ? "Saved!" : saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fields.map(({ label, value, set, placeholder }) => (
          <div key={label}>
            <label className="block text-xs text-gray-500 mb-2">{label}</label>
            <textarea
              value={value}
              onChange={(e) => set(e.target.value)}
              placeholder={placeholder}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
