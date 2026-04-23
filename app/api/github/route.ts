import { NextResponse } from "next/server";
import { getOpenPRs, getTodayCommitCount } from "@/lib/github";

export async function GET() {
  const [prs, commitCount] = await Promise.all([getOpenPRs(), getTodayCommitCount()]);
  return NextResponse.json({ prs, commitCount });
}
