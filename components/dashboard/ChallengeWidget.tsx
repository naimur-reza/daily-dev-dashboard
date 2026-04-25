import { Code2, ExternalLink } from "lucide-react";
import type { DailyChallenge } from "@/types";

const difficultyColor = {
  Easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Hard: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function ChallengeWidget({
  challenge,
}: {
  challenge: DailyChallenge;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800/60 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Code2 className="w-4 h-4 text-blue-400" />
        <h2 className="text-xs lg:text-sm font-medium text-gray-400 uppercase tracking-widest">
          Daily challenge
        </h2>
      </div>

      <div className="mb-3">
        <h3 className="text-base font-semibold text-white mb-2">
          {challenge.title}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <span
            className={`text-xs px-2 py-0.5 border rounded-full ${difficultyColor[challenge.difficulty]}`}
          >
            {challenge.difficulty}
          </span>
          {challenge.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-gray-800 text-gray-500 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <a
        href={`https://leetcode.com/problems/${challenge.slug}/`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
      >
        Open on LeetCode <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}
