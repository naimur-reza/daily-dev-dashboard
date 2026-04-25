"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, CheckCircle2, Circle, Trash2 } from "lucide-react";
import type { Task } from "@/types";
import { useRouter } from "next/navigation";

interface Props {
  tasks: Task[];
  userId: string;
  today: string;
}

export default function TasksWidget({ tasks: initial, userId, today }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initial);
  const [newTask, setNewTask] = useState("");
  const supabase = createClient();
  const router = useRouter();

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;
    const { data } = await supabase
      .from("tasks")
      .insert({
        title: newTask.trim(),
        user_id: userId,
        date: today,
        done: false,
      })
      .select()
      .single();
    if (data) setTasks([...tasks, data]);
    setNewTask("");
    router.refresh();
  }

  async function toggleTask(task: Task) {
    const { data } = await supabase
      .from("tasks")
      .update({ done: !task.done })
      .eq("id", task.id)
      .select()
      .single();
    if (data) setTasks(tasks.map((t) => (t.id === task.id ? data : t)));
    router.refresh();
  }

  async function deleteTask(id: string) {
    await supabase.from("tasks").delete().eq("id", id);
    setTasks(tasks.filter((t) => t.id !== id));
    router.refresh();
  }

  return (
    <div className="bg-gray-900 border border-gray-800/60 rounded-xl p-5">
      <h2 className="text-xs lg:text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">
        Today&apos;s tasks
      </h2>

      <div className="space-y-1 mb-4 min-h-[120px]">
        {tasks.length === 0 && (
          <p className="text-gray-600 text-sm py-4 text-center">
            No tasks yet. Add one below.
          </p>
        )}
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-800/40 group transition-colors"
          >
            <button
              onClick={() => toggleTask(task)}
              className="shrink-0 text-gray-500 hover:text-emerald-400 transition-colors"
            >
              {task.done ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </button>
            <span
              className={`flex-1 text-sm ${task.done ? "line-through text-gray-600" : "text-gray-200"}`}
            >
              {task.title}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={addTask} className="flex gap-2">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a task..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
        />
        <button
          type="submit"
          className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-emerald-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
