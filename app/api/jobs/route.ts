import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getDailyJobDigest } from "@/lib/jobs";
import { format } from "date-fns";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = format(new Date(), "yyyy-MM-dd");

  // Return cached jobs if already fetched today
  const { data: cached } = await supabase
    .from("job_digest")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .order("created_at");

  if (cached && cached.length > 0) {
    return NextResponse.json(cached);
  }

  // Fetch fresh jobs
  const jobs = await getDailyJobDigest();
  if (jobs.length === 0) return NextResponse.json([]);

  // Save to Supabase
  const toInsert = jobs.map((j) => ({
    user_id: user.id,
    date: today,
    job_id: j.id,
    title: j.title,
    company: j.company,
    location: j.location,
    url: j.url,
    salary: j.salary,
    tags: j.tags,
    description: j.description,
    source: j.source,
    ai_reason: j.ai_reason,
  }));

  const { data: saved } = await supabase
    .from("job_digest")
    .upsert(toInsert, { onConflict: "user_id,date,job_id" })
    .select();

  return NextResponse.json(saved ?? jobs);
}

// Force refresh
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = format(new Date(), "yyyy-MM-dd");
  await supabase
    .from("job_digest")
    .delete()
    .eq("user_id", user.id)
    .eq("date", today);

  const jobs = await getDailyJobDigest();
  if (jobs.length === 0) return NextResponse.json([]);

  const toInsert = jobs.map((j) => ({
    user_id: user.id,
    date: today,
    job_id: j.id,
    title: j.title,
    company: j.company,
    location: j.location,
    url: j.url,
    salary: j.salary,
    tags: j.tags,
    description: j.description,
    source: j.source,
    ai_reason: j.ai_reason,
  }));

  const { data: saved } = await supabase
    .from("job_digest")
    .insert(toInsert)
    .select();

  return NextResponse.json(saved ?? jobs);
}
