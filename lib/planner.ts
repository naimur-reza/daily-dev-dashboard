import type { PlannerContext, DayPlan, RawBlock } from "@/types/planner";
import { format, addDays, startOfWeek } from "date-fns";

export function getWeekDates() {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(monday, i);
    return {
      date: format(date, "yyyy-MM-dd"),
      day: format(date, "EEEE"),
    };
  });
}

export async function generateWeeklyPlan(
  ctx: PlannerContext,
): Promise<{ plan: DayPlan[]; summary: string }> {
  const weekDates = getWeekDates();
  const workDaySet = new Set(ctx.work_days.map((d) => d.toLowerCase()));

  const prompt = `You are an expert productivity coach and life planner. Generate a realistic, balanced weekly schedule for this developer.

PERSON CONTEXT:
- Job: ${ctx.job_start} to ${ctx.job_end} on ${ctx.work_days.join(", ")}
- Peak productive hours (outside work): ${ctx.peak_hours}
- Weekly goals: ${ctx.goals.join(", ") || "Get a job, learn new skills, build projects"}
- Learning focus: ${ctx.learning_focus}
- Hours to allocate per week:
  * Studying/learning: ${ctx.weekly_study_hrs}h
  * Pet project: ${ctx.weekly_project_hrs}h
  * Leisure/gaming/self: ${ctx.weekly_leisure_hrs}h
- Extra context: ${ctx.extra_context || "None"}

WEEK TO PLAN:
${weekDates.map((d) => `${d.day} ${d.date} (${workDaySet.has(d.day.toLowerCase()) ? "WORKDAY" : "OFF"})`).join("\n")}

RULES:
1. On WORKDAYS: block ${ctx.job_start}–${ctx.job_end} as "Work / Job" category "job"
2. Use peak hours (${ctx.peak_hours}) for hardest tasks (DSA, deep study, complex coding)
3. After work (5pm–7pm): lighter tasks (tutorials, review, job applications)
4. Evenings (7pm–9pm): project work or leisure
5. Weekends: heavier study blocks + project time + good leisure
6. Always include breaks, meals, and at least 1h leisure daily
7. Include job application time (30min daily on weekdays)
8. Balance: React/Next.js study, DSA practice, pet project, tutorials, rest
9. Never schedule past 11pm or before 7am
10. Make it REALISTIC — not a superhero schedule

Return ONLY this JSON structure, no explanation:
{
  "summary": "2-3 sentence encouraging summary of this week's plan",
  "plan": [
    {
      "date": "YYYY-MM-DD",
      "day": "Monday",
      "blocks": [
        {
          "start_time": "07:00",
          "end_time": "08:00",
          "title": "Block title",
          "category": "study|project|job|leisure|self|apply|dsa|tutorial",
          "priority": "critical|high|medium|low",
          "notes": "brief tip or context"
        }
      ]
    }
  ]
}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You are a productivity coach. Return only valid JSON, no markdown, no explanation.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      plan: parsed.plan ?? [],
      summary: parsed.summary ?? "Your week is planned!",
    };
  } catch {
    return { plan: [], summary: "Could not generate plan. Try again." };
  }
}

export function getDailyMessage(blocks: RawBlock[], day: string): string {
  const priorities = blocks.filter(
    (b) => b.priority === "critical" || b.priority === "high",
  );
  const first = blocks[0];
  if (!first) return `Good morning! Have a great ${day}.`;
  return `Good morning! Today: start with "${priorities[0]?.title ?? first.title}" at ${first.start_time}. You have ${blocks.length} blocks planned. Let's go! 💪`;
}

export const CATEGORY_META: Record<
  string,
  { label: string; color: string; bg: string; border: string; emoji: string }
> = {
  job: {
    label: "Work",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    emoji: "💼",
  },
  study: {
    label: "Study",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    emoji: "📚",
  },
  dsa: {
    label: "DSA",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    emoji: "🧠",
  },
  tutorial: {
    label: "Tutorial",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    emoji: "🎬",
  },
  project: {
    label: "Pet Project",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    emoji: "🚀",
  },
  apply: {
    label: "Job Apply",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    emoji: "📨",
  },
  leisure: {
    label: "Leisure",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/30",
    emoji: "🎮",
  },
  self: {
    label: "Self Care",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    emoji: "🧘",
  },
};

export const PRIORITY_META: Record<string, { color: string; dot: string }> = {
  critical: { color: "text-red-400", dot: "bg-red-400" },
  high: { color: "text-amber-400", dot: "bg-amber-400" },
  medium: { color: "text-blue-400", dot: "bg-blue-400" },
  low: { color: "text-gray-500", dot: "bg-gray-500" },
};
