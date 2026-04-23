import type { GitHubPR, GitHubCommit } from "@/types";

const GITHUB_API = "https://api.github.com";
const headers = {
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

export async function getOpenPRs(): Promise<GitHubPR[]> {
  const username = process.env.GITHUB_USERNAME;
  if (!username || !process.env.GITHUB_TOKEN) return [];

  const res = await fetch(
    `${GITHUB_API}/search/issues?q=is:pr+is:open+author:${username}&per_page=10`,
    { headers, next: { revalidate: 300 } }
  );
  if (!res.ok) return [];

  const data = await res.json();
  return (data.items || []).map((pr: GitHubPR) => ({
    ...pr,
    repo_name: pr.repository_url?.split("/").slice(-1)[0] ?? "",
  }));
}

export async function getTodayCommitCount(): Promise<number> {
  const username = process.env.GITHUB_USERNAME;
  if (!username || !process.env.GITHUB_TOKEN) return 0;

  const today = new Date().toISOString().split("T")[0];
  const res = await fetch(
    `${GITHUB_API}/search/commits?q=author:${username}+author-date:${today}&per_page=1`,
    {
      headers: { ...headers, Accept: "application/vnd.github.cloak-preview+json" },
      next: { revalidate: 300 },
    }
  );
  if (!res.ok) return 0;
  const data = await res.json();
  return data.total_count ?? 0;
}

export async function getRecentCommits(): Promise<GitHubCommit[]> {
  const username = process.env.GITHUB_USERNAME;
  if (!username || !process.env.GITHUB_TOKEN) return [];

  const res = await fetch(
    `${GITHUB_API}/search/commits?q=author:${username}&sort=author-date&order=desc&per_page=5`,
    {
      headers: { ...headers, Accept: "application/vnd.github.cloak-preview+json" },
      next: { revalidate: 300 },
    }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.items ?? [];
}
