"use client";

import { useState, useEffect } from "react";
import {
  Briefcase,
  ExternalLink,
  RefreshCw,
  Plus,
  Sparkles,
} from "lucide-react";
import { Job } from "@/types";

const SOURCE_COLOR: Record<string, string> = {
  RemoteOK: "bg-green-500/10 text-green-400 border-green-500/20",
  Himalayas: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function JobDigestWidget() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    setLoading(true);
    const res = await fetch("/api/jobs");
    const data = await res.json();
    setJobs(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function refresh() {
    setRefreshing(true);
    const res = await fetch("/api/jobs", { method: "POST" });
    const data = await res.json();
    setJobs(Array.isArray(data) ? data : []);
    setRefreshing(false);
  }

  async function addToTracker(job: Job) {
    await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: job.company,
        role: job.title,
        location: job.location,
        url: job.url,
        status: "saved",
        notes: job.ai_reason ? `AI picked: ${job.ai_reason}` : "",
        tags: job.tags?.slice(0, 5),
      }),
    });
    setAddedIds((prev) => new Set([...prev, job.id ?? job.id]));
  }

  return (
    <div className="bg-gray-900 border border-gray-800/60 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest">
            AI Job Digest
          </h2>
          <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
            Today&apos;s top 3
          </span>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
          title="Refresh jobs"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-800/50 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <p className="text-sm mb-2">No jobs found today.</p>
          <button
            onClick={refresh}
            className="text-xs text-amber-400 hover:text-amber-300"
          >
            Try refreshing →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const jobKey = job.id ?? job.id;
            const isAdded = addedIds.has(jobKey);
            return (
              <div
                key={jobKey}
                className="border border-gray-800/60 rounded-lg p-4 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">
                      {job.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {job.company} · {job.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-xs px-2 py-0.5 border rounded-full ${SOURCE_COLOR[job.source] ?? "bg-gray-700 text-gray-400"}`}
                    >
                      {job.source}
                    </span>
                  </div>
                </div>

                {job.ai_reason && (
                  <div className="flex items-start gap-1.5 mb-3 bg-purple-500/5 border border-purple-500/10 rounded-md px-2.5 py-1.5">
                    <Sparkles className="w-3 h-3 text-purple-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-purple-300">{job.ai_reason}</p>
                  </div>
                )}

                {job.tags && job.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {job.tags.slice(0, 5).map((tag: string) => (
                      <span
                        key={tag}
                        className="text-xs px-1.5 py-0.5 bg-gray-800 text-gray-500 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {job.salary && (
                      <span className="text-xs px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">
                        {job.salary}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-emerald-400 transition-colors"
                  >
                    Apply now <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => addToTracker(job)}
                    disabled={isAdded}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-gray-400 transition-colors"
                  >
                    {isAdded ? (
                      "✓ Saved"
                    ) : (
                      <>
                        <Plus className="w-3 h-3" /> Track it
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
