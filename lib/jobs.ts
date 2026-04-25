import type { Job } from "@/types";

const TARGET_PROFILE = {
  roles: [
    "frontend developer",
    "frontend engineer",
    "react developer",
    "next.js developer",
    "nextjs developer",
    "full stack developer",
    "fullstack developer",
    "software engineer",
    "mern stack developer",
    "backend developer",
    "node.js developer",
    "nodejs developer",
    "web developer",
    "javascript developer",
    "typescript developer",
    "react engineer",
    "full-stack developer",
    "full-stack engineer",
  ],
  skills: [
    "react",
    "nextjs",
    "next.js",
    "nodejs",
    "node.js",
    "javascript",
    "typescript",
    "mern",
    "express",
    "mongodb",
    "tailwind",
    "redux",
    "graphql",
    "rest api",
    "fullstack",
    "full-stack",
  ],
  locations: [
    "remote",
    "dhaka",
    "bangladesh",
    "bd",
    "worldwide",
    "anywhere",
    "global",
  ],
};

function isRelevant(
  title: string,
  tags: string[],
  description: string,
  location: string,
): boolean {
  const text = `${title} ${tags.join(" ")} ${description}`.toLowerCase();
  const loc = location.toLowerCase();

  const roleMatch = TARGET_PROFILE.roles.some((r) => text.includes(r));
  const skillMatch = TARGET_PROFILE.skills.some((s) => text.includes(s));
  const locationMatch =
    TARGET_PROFILE.locations.some((l) => loc.includes(l)) ||
    loc === "" ||
    loc === "worldwide" ||
    loc === "anywhere";

  return (roleMatch || skillMatch) && locationMatch;
}

// ─── SOURCE 1: RemoteOK ───────────────────────────────────────
async function fetchRemoteOK(): Promise<Job[]> {
  try {
    const res = await fetch(
      "https://remoteok.com/api?tag=react,nodejs,nextjs,javascript,typescript,fullstack",
      {
        headers: { "User-Agent": "DevDailyDashboard/1.0" },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.slice(1) || [])
      .map((j: Record<string, unknown>) => ({
        id: `remoteok-${j.id}`,
        title: String(j.position || ""),
        company: String(j.company || ""),
        company_logo: String(j.company_logo || ""),
        location: String(j.location || "Remote"),
        url: String(j.url || `https://remoteok.com/remote-jobs/${j.id}`),
        salary: j.salary_min ? `$${j.salary_min}–$${j.salary_max}` : undefined,
        tags: Array.isArray(j.tags) ? j.tags.map(String) : [],
        description: String(j.description || "")
          .replace(/<[^>]*>/g, "")
          .slice(0, 300),
        source: "RemoteOK",
        date: new Date().toISOString().split("T")[0],
      }))
      .filter((j: Job) =>
        isRelevant(j.title, j.tags, j.description || "", j.location),
      );
  } catch (e) {
    console.error("RemoteOK fetch failed:", e);
    return [];
  }
}

// ─── SOURCE 2: Himalayas ──────────────────────────────────────
async function fetchHimalayas(): Promise<Job[]> {
  try {
    const queries = ["react", "nextjs", "nodejs", "fullstack", "typescript"];
    const results = await Promise.all(
      queries.map((q) =>
        fetch(`https://himalayas.app/jobs/api?q=${q}&limit=15`, {
          next: { revalidate: 3600 },
        })
          .then((r) => r.json())
          .catch(() => ({ jobs: [] })),
      ),
    );

    const seen = new Set<string>();
    const jobs: Job[] = [];

    for (const data of results) {
      for (const j of data.jobs || []) {
        if (seen.has(j.id)) continue;
        seen.add(j.id);
        const tags = j.categories || [];
        const loc = j.locationRestrictions?.join(", ") || "Remote";
        const desc = (j.description || "")
          .replace(/<[^>]*>/g, "")
          .slice(0, 300);
        if (!isRelevant(j.title || "", tags, desc, loc)) continue;
        jobs.push({
          id: `himalayas-${j.id}`,
          title: j.title || "",
          company: j.companyName || "",
          company_logo: j.companyLogo || "",
          location: loc,
          url: j.applicationLink || `https://himalayas.app/jobs/${j.id}`,
          salary: j.salaryRange || undefined,
          tags,
          description: desc,
          source: "Himalayas",
          date: new Date().toISOString().split("T")[0],
        });
      }
    }
    return jobs;
  } catch (e) {
    console.error("Himalayas fetch failed:", e);
    return [];
  }
}

// ─── SOURCE 3: Jobicy ────────────────────────────────────────
async function fetchJobicy(): Promise<Job[]> {
  try {
    const res = await fetch(
      "https://jobicy.com/api/v2/remote-jobs?count=50&tag=javascript,react,nodejs,typescript,fullstack",
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.jobs || [])
      .map((j: Record<string, unknown>) => {
        const tags = Array.isArray(j.jobIndustry)
          ? (j.jobIndustry as string[])
          : typeof j.jobIndustry === "string"
            ? [j.jobIndustry]
            : [];
        const loc = String(j.jobGeo || "Remote");
        const desc = String(j.jobExcerpt || "")
          .replace(/<[^>]*>/g, "")
          .slice(0, 300);
        return {
          id: `jobicy-${j.id}`,
          title: String(j.jobTitle || ""),
          company: String(j.companyName || ""),
          company_logo: String(j.companyLogo || ""),
          location: loc,
          url: String(j.url || ""),
          salary: j.annualSalaryMin
            ? `$${j.annualSalaryMin}–$${j.annualSalaryMax}`
            : undefined,
          tags,
          description: desc,
          source: "Jobicy",
          date: new Date().toISOString().split("T")[0],
        };
      })
      .filter((j: Job) =>
        isRelevant(j.title, j.tags, j.description || "", j.location),
      );
  } catch (e) {
    console.error("Jobicy fetch failed:", e);
    return [];
  }
}

// ─── SOURCE 4: Arbeitnow ─────────────────────────────────────
async function fetchArbeitnow(): Promise<Job[]> {
  try {
    const res = await fetch(
      "https://www.arbeitnow.com/api/job-board-api?page=1",
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || [])
      .map((j: Record<string, unknown>) => {
        const tags = Array.isArray(j.tags) ? (j.tags as string[]) : [];
        const loc = j.remote ? "Remote" : String(j.location || "");
        const desc = String(j.description || "")
          .replace(/<[^>]*>/g, "")
          .slice(0, 300);
        return {
          id: `arbeitnow-${j.slug}`,
          title: String(j.title || ""),
          company: String(j.company_name || ""),
          location: loc,
          url: String(j.url || ""),
          tags,
          description: desc,
          source: "Arbeitnow",
          date: new Date().toISOString().split("T")[0],
        };
      })
      .filter((j: Job) =>
        isRelevant(j.title, j.tags, j.description || "", j.location),
      );
  } catch (e) {
    console.error("Arbeitnow fetch failed:", e);
    return [];
  }
}

// ─── SOURCE 5: FindWork ──────────────────────────────────────
async function fetchFindWork(): Promise<Job[]> {
  const apiKey = process.env.FINDWORK_API_KEY;
  if (!apiKey) return []; // optional — skip if no key

  try {
    const queries = ["react", "nodejs", "nextjs", "typescript", "fullstack"];
    const results = await Promise.all(
      queries.map((q) =>
        fetch(
          `https://findwork.dev/api/jobs/?search=${q}&remote=true&order_by=date`,
          {
            headers: { Authorization: `Token ${apiKey}` },
            next: { revalidate: 3600 },
          },
        )
          .then((r) => r.json())
          .catch(() => ({ results: [] })),
      ),
    );

    const seen = new Set<string>();
    const jobs: Job[] = [];

    for (const data of results) {
      for (const j of data.results || []) {
        if (seen.has(String(j.id))) continue;
        seen.add(String(j.id));
        const tags = Array.isArray(j.keywords) ? j.keywords : [];
        const loc = j.remote ? "Remote" : String(j.location || "");
        const desc = String(j.text || "")
          .replace(/<[^>]*>/g, "")
          .slice(0, 300);
        if (!isRelevant(j.role || "", tags, desc, loc)) continue;
        jobs.push({
          id: `findwork-${j.id}`,
          title: j.role || "",
          company: j.company_name || "",
          location: loc,
          url: j.url || "",
          tags,
          description: desc,
          source: "FindWork",
          date: new Date().toISOString().split("T")[0],
        });
      }
    }
    return jobs;
  } catch (e) {
    console.error("FindWork fetch failed:", e);
    return [];
  }
}

// ─── AI PICKER ───────────────────────────────────────────────
async function pickTopJobsWithAI(jobs: Job[]): Promise<Job[]> {
  if (!process.env.GROQ_API_KEY || jobs.length === 0) return jobs.slice(0, 3);

  const jobList = jobs
    .slice(0, 30)
    .map(
      (j, i) =>
        `${i + 1}. [${j.source}] ${j.title} at ${j.company} (${j.location}) | Skills: ${j.tags.slice(0, 5).join(", ")}`,
    )
    .join("\n");

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content: `You are a job matching assistant for a developer in Dhaka, Bangladesh. 
Target roles: Frontend Developer, React Developer, Next.js Developer, Full Stack Developer, MERN Stack, Node.js Developer, Software Engineer, Backend Developer.
Target skills: React, Next.js, Node.js, TypeScript, JavaScript, MongoDB, Express, Tailwind CSS.
Preferred locations: Remote (worldwide) or Dhaka onsite.
Pick the 3 most relevant jobs. Return ONLY valid JSON, no explanation outside the array.`,
          },
          {
            role: "user",
            content: `Pick top 3 best matching jobs and return a JSON array:\n[{ "index": number (1-based), "reason": "one short sentence why this matches the candidate" }]\n\nJobs:\n${jobList}`,
          },
        ],
      }),
    });

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "[]";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const picks: { index: number; reason: string }[] = JSON.parse(cleaned);

    return picks
      .slice(0, 3)
      .map((p) => ({ ...jobs[p.index - 1], ai_reason: p.reason }))
      .filter(Boolean);
  } catch {
    return jobs.slice(0, 3);
  }
}

// ─── MAIN EXPORT ─────────────────────────────────────────────
export async function getDailyJobDigest(): Promise<Job[]> {
  console.log("Fetching jobs from all sources...");

  const [remoteOK, himalayas, jobicy, arbeitnow, findwork] =
    await Promise.allSettled([
      fetchRemoteOK(),
      fetchHimalayas(),
      fetchJobicy(),
      fetchArbeitnow(),
      fetchFindWork(),
    ]);

  const extract = (r: PromiseSettledResult<Job[]>) =>
    r.status === "fulfilled" ? r.value : [];

  const allJobs = [
    ...extract(remoteOK),
    ...extract(himalayas),
    ...extract(jobicy),
    ...extract(arbeitnow),
    ...extract(findwork),
  ];

  console.log(`Total relevant jobs found: ${allJobs.length}`);

  // Deduplicate by title+company
  const seen = new Set<string>();
  const unique = allJobs.filter((j) => {
    const key = `${j.title.toLowerCase()}-${j.company.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Shuffle for variety
  const shuffled = unique.sort(() => Math.random() - 0.5);

  return pickTopJobsWithAI(shuffled);
}
