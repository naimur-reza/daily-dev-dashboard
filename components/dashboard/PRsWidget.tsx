import { GitPullRequest, ExternalLink } from "lucide-react";
import type { GitHubPR } from "@/types";

function PRBadge({ pr }: { pr: GitHubPR }) {
  if (pr.draft) return <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-400 rounded-full">draft</span>;
  if (pr.state === "open") return <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">review</span>;
  return <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">merged</span>;
}

export default function PRsWidget({ prs }: { prs: GitHubPR[] }) {
  return (
    <div className="bg-gray-900 border border-gray-800/60 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <GitPullRequest className="w-4 h-4 text-purple-400" />
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest">Open pull requests</h2>
      </div>

      {prs.length === 0 ? (
        <p className="text-gray-600 text-sm py-4 text-center">No open PRs. Ship something! 🚀</p>
      ) : (
        <div className="space-y-0.5">
          {prs.slice(0, 6).map((pr) => (
            <a
              key={pr.id}
              href={pr.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-gray-800/40 group transition-colors"
            >
              <PRBadge pr={pr} />
              <span className="flex-1 text-sm text-gray-300 truncate group-hover:text-white transition-colors">
                {pr.title}
              </span>
              <span className="text-xs text-gray-600 shrink-0">{pr.repo_name}</span>
              <ExternalLink className="w-3 h-3 text-gray-700 group-hover:text-gray-400 shrink-0 transition-colors" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
