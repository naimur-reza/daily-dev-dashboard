import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get last 7 days of journal entries
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
  const { data: entries } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", sevenDaysAgo)
    .order("date");

  if (!entries || entries.length === 0) {
    return NextResponse.json({ summary: "No journal entries found for this week." });
  }

  const journalText = entries
    .map((e) => `Date: ${e.date}\nBuilt: ${e.built}\nBlocked: ${e.blocked}\nNext: ${e.next}`)
    .join("\n\n---\n\n");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `You are a developer coach. Here are a developer's standup journal entries from the past week. Write a concise, encouraging weekly summary (3-5 sentences) that highlights key accomplishments, recurring blockers, and what to focus on next week.\n\n${journalText}`,
        },
      ],
    }),
  });

  const data = await res.json();
  const summary = data.content?.[0]?.text ?? "Could not generate summary.";

  return NextResponse.json({ summary });
}
