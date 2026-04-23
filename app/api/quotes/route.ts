import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if a quote was generated in the last 4 hours
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();

  const { data: existing } = await supabase
    .from("daily_quotes")
    .select("*")
    .eq("user_id", user.id)
    .gte("generated_at", fourHoursAgo)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Return cached quote if still fresh
  if (existing) {
    return NextResponse.json({
      summary: { text: existing.quote, author: existing.author },
      topic: existing.topic,
      cached: true,
    });
  }

  // Otherwise generate a new one
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const topics = [
    "clean code and best practices",
    "debugging and problem solving",
    "learning new technologies",
    "software architecture",
    "developer productivity",
    "open source contribution",
    "code reviews and collaboration",
    "testing and reliability",
  ];

  const randomTopic = topics[Math.floor(Math.random() * topics.length)];

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content:
            `Return one REAL, well-known developer or tech quote that actually exists.\n` +
            `Use the exact original author's real full name — do NOT invent names like "Anonymous Coder".\n` +
            `If the author is truly unknown, use "Anonymous" only.\n\n` +
            `Examples of the style:\n` +
            `"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Martin Fowler\n` +
            `"First, solve the problem. Then, write the code." — John Johnson\n` +
            `"Simplicity is the soul of efficiency." — Austin Freeman\n\n` +
            `Respond in EXACTLY this format, nothing else:\n` +
            `"quote text" — Real Author Name`,
        },
      ],
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Groq error:", data);
    return NextResponse.json(
      { error: "Could not generate quote. Check your GROQ_API_KEY." },
      { status: 500 },
    );
  }

  const raw: string = data.choices?.[0]?.message?.content?.trim() ?? "";
  const match = raw.match(/^"([\s\S]+?)\.?"\s*[—-]\s*([\s\S]+)$/);

  const summary = match
    ? { text: match[1].trim(), author: match[2].trim() }
    : { text: raw, author: "Unknown" };

  await supabase.from("daily_quotes").insert({
    user_id: user.id,
    quote: summary.text,
    author: summary.author,
    topic: randomTopic,
    generated_at: new Date().toISOString(),
  });

  return NextResponse.json({
    summary,
    topic: randomTopic,
    date: today,
    cached: false,
  });
}
