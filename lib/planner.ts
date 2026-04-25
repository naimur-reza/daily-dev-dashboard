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

// Derive allowed categories dynamically from user context
export function deriveCategories(ctx: PlannerContext): string[] {
  const cats = new Set<string>();

  // Always include job and self-care
  cats.add("job");
  cats.add("self");
  cats.add("leisure");

  const text = [...ctx.goals, ctx.learning_focus, ctx.extra_context]
    .join(" ")
    .toLowerCase();

  if (text.match(/react|next|nextjs|frontend|css|ui|tailwind/))
    cats.add("study");
  if (text.match(/tutorial|watch|video|course|youtube/)) cats.add("tutorial");
  if (text.match(/dsa|algorithm|leetcode|problem solving|data structure/))
    cats.add("dsa");
  if (text.match(/project|build|app|portfolio|pet project|side project/))
    cats.add("project");
  if (text.match(/job|apply|application|interview|cv|resume|career/))
    cats.add("apply");
  if (text.match(/node|backend|api|server|express|mongo|database/))
    cats.add("study");
  if (text.match(/typescript|javascript|mern|fullstack|full.stack/))
    cats.add("study");

  // If no specific study type found but user has learning goals, add generic study
  if (ctx.weekly_study_hrs > 0) cats.add("study");
  if (ctx.weekly_project_hrs > 0) cats.add("project");
  if (ctx.weekly_leisure_hrs > 0) cats.add("leisure");

  return Array.from(cats);
}

export async function generateWeeklyPlan(
  ctx: PlannerContext,
): Promise<{ plan: DayPlan[]; summary: string }> {
  const weekDates = getWeekDates();
  const workDaySet = new Set(ctx.work_days.map((d) => d.toLowerCase()));
  const allowedCategories = deriveCategories(ctx);

  // Compute excluded topics based on what's NOT in the user's allowed categories
  const ALL_TOPICS: Record<string, string[]> = {
    dsa: [
      "DSA",
      "algorithms",
      "LeetCode",
      "data structures",
      "problem solving",
    ],
    tutorial: ["tutorial", "watch video", "YouTube course"],
    project: ["pet project", "side project", "portfolio project"],
    apply: ["job application", "apply to jobs", "job hunt"],
  };
  const excludedTopics: string[] = [];
  for (const [cat, keywords] of Object.entries(ALL_TOPICS)) {
    if (!allowedCategories.includes(cat)) {
      excludedTopics.push(...keywords);
    }
  }

  // Build dynamic rules from context
  const dynamicRules: string[] = [
    `On WORKDAYS: block ${ctx.job_start}–${ctx.job_end} as "Work / Job" (category: job)`,
    `Peak productive hours outside work are ${ctx.peak_hours} — schedule the hardest tasks then`,
    `Weekly time budget: ${ctx.weekly_study_hrs}h studying, ${ctx.weekly_project_hrs}h on project, ${ctx.weekly_leisure_hrs}h leisure`,
    `ONLY use these categories: ${allowedCategories.join(", ")} — do NOT invent other categories`,
    `Every block category MUST be exactly one of: ${allowedCategories.join(" | ")}`,
    excludedTopics.length > 0
      ? `STRICTLY FORBIDDEN — do NOT mention these words anywhere in title or notes: ${excludedTopics.join(", ")}`
      : "",
    `Write block titles and notes ONLY based on user goals: ${ctx.goals.join("; ")}`,
    "Always include meal breaks and realistic transitions between blocks",
    "Never schedule before 7:00 or after 23:00",
    "Make it realistic — not a burnout schedule. Rest is productive too.",
    "Weekends get more flexibility and heavier self/leisure allocation",
  ].filter(Boolean);

  // Only add job application rule if apply is a derived category
  if (allowedCategories.includes("apply")) {
    dynamicRules.push(
      "Include 30min job application blocks on weekdays after work",
    );
  }

  // Only add tutorial rule if tutorial is a derived category
  if (allowedCategories.includes("tutorial")) {
    dynamicRules.push(
      "Tutorial blocks work well in evenings or after work when energy is lower",
    );
  }

  const prompt = `You are an expert productivity coach. Generate a realistic weekly schedule for this person.

PERSON'S CONTEXT:
- Job hours: ${ctx.job_start}–${ctx.job_end} on ${ctx.work_days.join(", ")}
- Peak productive time (outside work): ${ctx.peak_hours}
- Goals: ${ctx.goals.length > 0 ? ctx.goals.join("; ") : "Not specified"}
- Learning focus: ${ctx.learning_focus || "General"}
- Extra context: ${ctx.extra_context || "None"}
- Weekly hours budget: ${ctx.weekly_study_hrs}h study, ${ctx.weekly_project_hrs}h project, ${ctx.weekly_leisure_hrs}h leisure

WEEK:
${weekDates.map((d) => `${d.day} ${d.date} — ${workDaySet.has(d.day.toLowerCase()) ? "WORKDAY" : "DAY OFF"}`).join("\n")}

STRICT RULES (follow exactly):
${dynamicRules.map((r, i) => `${i + 1}. ${r}`).join("\n")}

ALLOWED CATEGORIES (use ONLY these exact strings):
${allowedCategories.map((c) => `"${c}"`).join(", ")}

Return ONLY valid JSON. No markdown. No explanation. No extra text. Structure:
{
  "summary": "2 sentence encouraging summary",
  "plan": [
    {
      "date": "YYYY-MM-DD",
      "day": "Monday",
      "blocks": [
        {
          "start_time": "HH:MM",
          "end_time": "HH:MM",
          "title": "descriptive block title",
          "category": "one of the allowed categories above",
          "priority": "critical|high|medium|low",
          "notes": "one short tip"
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
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content: `You are a strict schedule generator. Return ONLY valid JSON, no markdown, no explanation.
CRITICAL RULE 1: Only use these exact category string values: ${allowedCategories.join(", ")}. Any other value is a violation.
CRITICAL RULE 2: ${excludedTopics.length > 0 ? `Never write these words in any title or notes field: ${excludedTopics.join(", ")}` : "Follow all user goals exactly."} 
CRITICAL RULE 3: Base all content strictly on the user's stated goals. Do not assume or add topics the user did not mention.`,
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

    // Sanitize: strip any blocks with categories not in allowedCategories
    const allowedSet = new Set(allowedCategories);
    const sanitizedPlan: DayPlan[] = (parsed.plan ?? []).map(
      (day: DayPlan) => ({
        ...day,
        blocks: (day.blocks ?? []).filter((b: RawBlock) =>
          allowedSet.has(b.category),
        ),
      }),
    );

    return {
      plan: sanitizedPlan,
      summary: parsed.summary ?? "Your week is planned!",
    };
  } catch {
    return { plan: [], summary: "Could not generate plan. Try again." };
  }
}

export function getDailyMessage(blocks: RawBlock[], day: string): string {
  const priority = blocks.find(
    (b) => b.priority === "critical" || b.priority === "high",
  );
  const first = blocks[0];
  if (!first) return `Good morning! Have a great ${day}.`;
  return `Good morning! Today: start with "${priority?.title ?? first.title}" at ${first.start_time}. You have ${blocks.length} blocks planned. Let's go! 💪`;
}

// Dynamically build CATEGORY_META from allowed categories
const BASE_CATEGORY_META: Record<
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

// Fallback for any unexpected category AI returns
const FALLBACK_META = {
  label: "Task",
  color: "text-gray-400",
  bg: "bg-gray-500/10",
  border: "border-gray-500/30",
  emoji: "📌",
};

export function getCategoryMeta(category: string) {
  return BASE_CATEGORY_META[category] ?? FALLBACK_META;
}

// Only return meta for categories the user actually has
export function getActiveCategoryMeta(ctx: PlannerContext) {
  const allowed = deriveCategories(ctx);
  return Object.fromEntries(
    allowed.map((cat) => [cat, BASE_CATEGORY_META[cat] ?? FALLBACK_META]),
  );
}

export const PRIORITY_META: Record<string, { color: string; dot: string }> = {
  critical: { color: "text-red-400", dot: "bg-red-400" },
  high: { color: "text-amber-400", dot: "bg-amber-400" },
  medium: { color: "text-blue-400", dot: "bg-blue-400" },
  low: { color: "text-gray-500", dot: "bg-gray-500" },
};
