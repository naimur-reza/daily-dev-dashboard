import { cookies } from "next/headers";

export async function getDailyQuote() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    const res = await fetch(`${baseUrl}/api/quotes`, {
      method: "POST",
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (!res.ok) throw new Error(`API failed: ${res.status}`);
    if (!res.headers.get("content-type")?.includes("application/json")) {
      throw new Error("Got HTML instead of JSON — likely a redirect to login");
    }

    const data = await res.json();
    return data.summary;
  } catch (err) {
    console.error("getDailyQuote error:", err);
    return { text: "test quote", author: "Test Author", topic: "Test Topic" };
  }
}
