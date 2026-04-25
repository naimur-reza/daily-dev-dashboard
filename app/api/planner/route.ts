import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { generateWeeklyPlan, getWeekDates } from "@/lib/planner";
import { format, startOfWeek, endOfWeek } from "date-fns";

// GET — fetch current week plan + context
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const weekStart = format(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
    "yyyy-MM-dd",
  );

  const [{ data: plan }, { data: context }, { data: blocks }] =
    await Promise.all([
      supabase
        .from("weekly_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("week_start", weekStart)
        .single(),
      supabase
        .from("planner_context")
        .select("*")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("plan_blocks")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", weekStart)
        .order("date")
        .order("start_time"),
    ]);

  return NextResponse.json({ plan, context, blocks: blocks ?? [] });
}

// POST — generate new weekly plan
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { context, regenerate } = body;

  const weekStart = format(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
    "yyyy-MM-dd",
  );
  const weekEnd = format(
    endOfWeek(new Date(), { weekStartsOn: 1 }),
    "yyyy-MM-dd",
  );

  // Save/update context
  await supabase
    .from("planner_context")
    .upsert(
      { ...context, user_id: user.id, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );

  // Delete existing plan if regenerating
  if (regenerate) {
    await supabase
      .from("weekly_plans")
      .delete()
      .eq("user_id", user.id)
      .eq("week_start", weekStart);
    await supabase
      .from("plan_blocks")
      .delete()
      .eq("user_id", user.id)
      .gte("date", weekStart);
  }

  // Generate with AI
  const { plan, summary } = await generateWeeklyPlan(context);
  if (!plan.length)
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 },
    );

  // Save weekly plan
  const { data: savedPlan } = await supabase
    .from("weekly_plans")
    .upsert(
      {
        user_id: user.id,
        week_start: weekStart,
        week_end: weekEnd,
        plan,
        ai_summary: summary,
      },
      { onConflict: "user_id,week_start" },
    )
    .select()
    .single();

  // Save individual blocks
  const weekDates = getWeekDates();
  const allBlocks = plan.flatMap((day) =>
    (day.blocks || []).map((block) => ({
      user_id: user.id,
      date: weekDates.find((d) => d.day === day.day)?.date ?? day.date,
      start_time: block.start_time,
      end_time: block.end_time,
      title: block.title,
      category: block.category,
      priority: block.priority,
      notes: block.notes ?? "",
      done: false,
    })),
  );

  if (allBlocks.length > 0) {
    await supabase.from("plan_blocks").insert(allBlocks);
  }

  const { data: blocks } = await supabase
    .from("plan_blocks")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", weekStart)
    .order("date")
    .order("start_time");

  return NextResponse.json({ plan: savedPlan, blocks: blocks ?? [], summary });
}

// PATCH — mark block done/undone
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, done } = await request.json();
  const { data } = await supabase
    .from("plan_blocks")
    .update({ done })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  return NextResponse.json(data);
}
