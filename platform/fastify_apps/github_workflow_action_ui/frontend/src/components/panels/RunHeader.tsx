import { RotateCcw, ExternalLink } from "lucide-react";
import type { WorkflowRun } from "@/types";
import { relativeTime } from "@/lib/formatters";
import { getStatusCategory, getBadgeClasses } from "@/lib/status";
import { StatusIcon } from "@/components/common";

interface RunHeaderProps {
  run: WorkflowRun;
  owner: string;
  repo: string;
  onRerun: () => void;
  onRerunFailed: () => void;
  rerunLoading: boolean;
}

export function RunHeader({
  run,
  onRerun,
  onRerunFailed,
  rerunLoading,
}: RunHeaderProps) {
  const category = getStatusCategory(run.conclusion, run.status);
  const badgeClasses = getBadgeClasses(category);

  return (
    <div className="px-6 pt-5 pb-4 border-b border-gray-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <StatusIcon conclusion={run.conclusion} status={run.status} size={24} />
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-gray-900 truncate">
              {run.display_title || run.name}
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-gray-400">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeClasses}`}
              >
                {run.conclusion || run.status}
              </span>
              <span>#{run.run_number}</span>
              <span>{run.event}</span>
              <span>{relativeTime(run.updated_at)} ago</span>
              {run.actor && (
                <span>
                  by{" "}
                  <span className="text-gray-600">{run.actor.login}</span>
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {run.status === "completed" && (
            <button
              onClick={onRerun}
              disabled={rerunLoading}
              className="px-2.5 py-1.5 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
            >
              <RotateCcw size={12} className="inline mr-1" />
              Re-run
            </button>
          )}
          {run.conclusion === "failure" && (
            <button
              onClick={onRerunFailed}
              disabled={rerunLoading}
              className="px-2.5 py-1.5 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
            >
              <RotateCcw size={12} className="inline mr-1" />
              Failed
            </button>
          )}
          {run.html_url && (
            <a
              href={run.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 text-xs text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              <ExternalLink size={12} className="inline mr-1" />
              GitHub
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
