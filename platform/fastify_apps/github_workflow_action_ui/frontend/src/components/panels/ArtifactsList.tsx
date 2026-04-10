import { Download } from "lucide-react";
import type { Artifact } from "@/types";
import { formatBytes } from "@/lib/formatters";
import { getArtifactDownloadUrl } from "@/services/api";
import { Spinner } from "@/components/common";

interface ArtifactsListProps {
  artifacts: Artifact[];
  isLoading: boolean;
  owner: string;
  repo: string;
}

export function ArtifactsList({
  artifacts,
  isLoading,
  owner,
  repo,
}: ArtifactsListProps) {
  return (
    <div className="px-6 pt-5 pb-4 border-b border-gray-100">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        List of Artifacts
        {!isLoading && (
          <span className="ml-1.5 text-xs font-normal text-gray-400">
            ({artifacts.length})
          </span>
        )}
      </h3>
      {isLoading && <Spinner />}
      {!isLoading && artifacts.length === 0 && (
        <p className="text-xs text-gray-400 py-2">No artifacts produced</p>
      )}
      {!isLoading && artifacts.length > 0 && (
        <div className="space-y-1.5">
          {artifacts.map((art) => (
            <div
              key={art.id}
              className={`flex items-center gap-3 rounded-xl border border-gray-100 px-3.5 py-2.5 ${
                art.expired ? "opacity-50" : "hover:border-gray-200"
              } transition`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${art.expired ? "bg-gray-300" : "bg-green-500"}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 truncate">{art.name}</p>
              </div>
              <span className="text-[11px] text-gray-400 shrink-0">
                {formatBytes(art.size_in_bytes)}
              </span>
              {!art.expired && (
                <a
                  href={getArtifactDownloadUrl(owner, repo, art.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-600 hover:text-green-700 font-medium transition shrink-0 flex items-center gap-1"
                >
                  <Download size={12} />
                  Download
                </a>
              )}
              {art.expired && (
                <span className="text-[11px] text-red-400 shrink-0">
                  Expired
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
