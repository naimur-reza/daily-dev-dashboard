import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const { error } = await supabase.from("away_events").insert({
    user_id: user.id,
    away_at: body.away_at,
    returned_at: body.returned_at,
    duration_seconds: body.duration_seconds,
    pomodoro_was_paused: body.pomodoro_was_paused,
  });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
}
