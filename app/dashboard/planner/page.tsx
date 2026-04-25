"use client";

import { useState, useEffect, useCallback } from "react";
import { BrainCircuit, RefreshCw, Bell, BellOff, Sparkles } from "lucide-react";
import ContextForm from "@/components/planner/ContextForm";
import WeeklyCalendar from "@/components/planner/WeeklyCalendar";
import WeeklyStats from "@/components/planner/WeeklyStats";
import type { PlannerContext } from "@/types/planner";
import type { PlanBlock } from "@/types/planner";
import {
  requestNotificationPermission,
  scheduleDailyNotification,
  sendNotification,
} from "@/lib/notifications";
import { getDailyMessage } from "@/lib/planner";
import { format } from "date-fns";

export default function PlannerPage() {
  const [blocks, setBlocks] = useState<PlanBlock[]>([]);
  const [context, setContext] = useState<PlannerContext | null>(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [hasPlan, setHasPlan] = useState(false);

  useEffect(() => {
    fetchPlan();
    if (
      typeof window !== "undefined" &&
      Notification.permission === "granted"
    ) {
      setNotifEnabled(true);
    }
  }, []);

  async function fetchPlan() {
    setFetching(true);
    const res = await fetch("/api/planner");
    const data = await res.json();
    if (data.blocks?.length) {
      setBlocks(data.blocks);
      setHasPlan(true);
    }
    if (data.context) setContext(data.context);
    // if (data.plan?.ai_summary) setSummary(data.plan.ai_summary);
    setFetching(false);

    // Show form if no context yet
    if (!data.context) setShowForm(true);
  }

  async function handleGenerate(ctx: PlannerContext, regenerate = false) {
    setLoading(true);
    setShowForm(false);
    const res = await fetch("/api/planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context: ctx, regenerate }),
    });
    const data = await res.json();
    if (data.blocks) {
      setBlocks(data.blocks);
      setHasPlan(true);
      setSummary(data.summary ?? "");
      setContext(ctx);

      // Send welcome notification
      sendNotification(
        "🗓️ Your week is planned!",
        data.summary ?? "AI has generated your weekly schedule.",
      );

      // Schedule daily 8am notification
      if (notifEnabled) {
        scheduleDailyNotification(8, 0, () => {
          const todayBlocks = data.blocks.filter(
            (b: PlanBlock) => b.date === format(new Date(), "yyyy-MM-dd"),
          );
          return getDailyMessage(todayBlocks, format(new Date(), "EEEE"));
        });
      }
    }
    setLoading(false);
  }

  async function toggleBlock(id: string, done: boolean) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, done } : b)));
    await fetch("/api/planner", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done }),
    });
  }

  async function enableNotifications() {
    const granted = await requestNotificationPermission();
    setNotifEnabled(granted);
    if (granted && blocks.length > 0) {
      const todayBlocks = blocks.filter(
        (b) => b.date === format(new Date(), "yyyy-MM-dd"),
      );
      scheduleDailyNotification(8, 0, () =>
        getDailyMessage(
          todayBlocks as Parameters<typeof getDailyMessage>[0],
          format(new Date(), "EEEE"),
        ),
      );
      sendNotification(
        "✅ Notifications enabled!",
        "You'll get your daily plan at 8am every morning.",
      );
    }
  }

  const todayBlocks = blocks.filter(
    (b) => b.date === format(new Date(), "yyyy-MM-dd"),
  );
  const todayDone = todayBlocks.filter((b) => b.done).length;

  if (fetching) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <BrainCircuit className="w-5 h-5 text-purple-400" />
          <h1 className="text-xl font-semibold text-white">
            AI Weekly Planner
          </h1>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-96 bg-gray-900 rounded-xl animate-pulse" />
          <div className="h-64 bg-gray-900 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-5 h-5 text-purple-400" />
          <div>
            <h1 className="text-xl font-semibold text-white">
              AI Weekly Planner
            </h1>
            <p className="text-sm text-gray-500">
              {hasPlan
                ? `Today: ${todayDone}/${todayBlocks.length} blocks done`
                : "Tell AI your context → get your week planned automatically"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={enableNotifications}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              notifEnabled
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300"
            }`}
          >
            {notifEnabled ? (
              <Bell className="w-3.5 h-3.5" />
            ) : (
              <BellOff className="w-3.5 h-3.5" />
            )}
            {notifEnabled ? "Notifications on" : "Enable notifications"}
          </button>
          {hasPlan && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg text-purple-400 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate
            </button>
          )}
        </div>
      </div>

      {/* AI summary banner */}
      {/* {summary && !showForm && (
        <div className="flex items-start gap-3 bg-purple-500/5 border border-purple-500/15 rounded-xl px-4 py-3">
          <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
          <p className="text-sm text-purple-300 leading-relaxed">{summary}</p>
        </div>
      )} */}

      {/* Context form */}
      {showForm && (
        <div className="space-y-3">
          <ContextForm
            initial={context ?? undefined}
            onGenerate={(ctx) => handleGenerate(ctx, hasPlan)}
            loading={loading}
          />
          {hasPlan && (
            <button
              onClick={() => setShowForm(false)}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              ← Cancel, keep current plan
            </button>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-gray-900 border border-purple-500/20 rounded-xl p-12 text-center">
          <div className="flex justify-center gap-1.5 mb-4">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-purple-300 text-sm font-medium">
            AI is analyzing your context and building your optimal week...
          </p>
          <p className="text-gray-600 text-xs mt-1">
            This takes about 10 seconds
          </p>
        </div>
      )}

      {/* Main content */}
      {!showForm && !loading && hasPlan && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-900 border border-gray-800/60 rounded-xl p-5">
              <WeeklyCalendar blocks={blocks} onToggle={toggleBlock} />
            </div>
          </div>
          <div>
            <WeeklyStats blocks={blocks} />
          </div>
        </div>
      )}

      {/* Empty state */}
      {!showForm && !loading && !hasPlan && (
        <div className="text-center py-16 bg-gray-900 border border-gray-800/60 rounded-xl">
          <BrainCircuit className="w-12 h-12 text-purple-400/30 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No plan yet</h3>
          <p className="text-gray-500 text-sm mb-4">
            Fill in your context above and let AI plan your entire week.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="text-sm px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg text-purple-400 transition-colors"
          >
            Set up my planner →
          </button>
        </div>
      )}
    </div>
  );
}
