import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { BookOpen } from "lucide-react";
import WeeklySummaryButton from "@/components/dashboard/WeeklySummaryButton";

export default async function JournalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: entries } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(30);

  return (
    <div className="p-6 max-w-4xl mx-auto mt-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <h1 className=" lg:text-xl font-semibold text-white">
            Journal history
          </h1>
        </div>
        <WeeklySummaryButton />
      </div>

      {!entries || entries.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <p className="text-lg mb-2">No entries yet.</p>
          <p className="text-sm">
            Fill in your daily standup journal on the dashboard.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-gray-900 border border-gray-800/60 rounded-xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium text-white">
                  {format(new Date(entry.date), "EEEE, MMMM d, yyyy")}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Built", value: entry.built },
                  { label: "Blocked", value: entry.blocked },
                  { label: "Next", value: entry.next },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                      {label}
                    </p>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {value || (
                        <span className="text-gray-600 italic">
                          not filled in
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
