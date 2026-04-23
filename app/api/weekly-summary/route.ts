import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000)
    .toISOString()
    .split("T")[0];
  const { data: entries } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", sevenDaysAgo)
    .order("date");

  if (!entries || entries.length === 0) {
    return NextResponse.json({
      summary: "No journal entries found for this week.",
    });
  }

  const journalText = entries
    .map(
      (e) =>
        `Date: ${e.date}\nBuilt: ${e.built}\nBlocked: ${e.blocked}\nNext: ${e.next}`,
    )
    .join("\n\n---\n\n");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content:
            "You are a developer coach. Write concise, encouraging summaries.",
        },
        {
          role: "user",
          content: `Here are my standup journal entries from the past week. Write a concise, encouraging weekly summary (3-5 sentences) highlighting key accomplishments, recurring blockers, and what to focus on next week.\n\n${journalText}`,
        },
      ],
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Groq error:", data);
    return NextResponse.json({
      summary: "Could not generate summary. Check your GROQ_API_KEY.",
    });
  }

  const summary =
    data.choices?.[0]?.message?.content ?? "Could not generate summary.";
  return NextResponse.json({ summary });
}
