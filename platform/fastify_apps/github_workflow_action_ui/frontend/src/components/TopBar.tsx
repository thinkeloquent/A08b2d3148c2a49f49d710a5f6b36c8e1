import { useMemo } from "react";
import type { HealthResponse } from "@/types";
import { RepoSelect, type RepoOption } from "@/components/RepoSelect";

export interface ApiRepo {
  id: string;
  name: string;
  description: string;
  githubUrl: string;
  stars: number;
  forks: number;
  language: string;
  maintainer: string;
}

export function parseGithubOwnerName(
  githubUrl: string,
): { owner: string; name: string } | null {
  try {
    const url = new URL(githubUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) return { owner: parts[0], name: parts[1] };
  } catch {
    /* ignore */
  }
  return null;
}

interface TopBarProps {
  apiRepos: ApiRepo[];
  selectedRepoKey: string | null;
  onChangeRepo: (key: string) => void;
  reposLoading?: boolean;
  health: HealthResponse | undefined;
}

export function TopBar({
  apiRepos,
  selectedRepoKey,
  onChangeRepo,
  reposLoading,
  health,
}: TopBarProps) {
  const options: RepoOption[] = useMemo(
    () =>
      apiRepos.map((r) => {
        const parsed = parseGithubOwnerName(r.githubUrl);
        const owner = parsed?.owner ?? r.maintainer ?? "";
        const name = parsed?.name ?? r.name;
        const key = owner ? `${owner}/${name}` : name;
        return {
          value: key,
          owner,
          name,
          description: r.description,
          stars: r.stars,
          forks: r.forks,
        };
      }),
    [apiRepos],
  );

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-5 h-14 flex items-center gap-4">
        {/* Repo selector */}
        <RepoSelect
          options={options}
          value={selectedRepoKey}
          onChange={onChangeRepo}
          loading={reposLoading}
        />

        <div className="ml-auto flex items-center gap-2">
          {health && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span
                className={`w-1.5 h-1.5 rounded-full ${health.status === "ok" ? "bg-green-500" : "bg-red-500"}`}
              />
              API {health.rateLimit?.remaining ?? "?"}/
              {health.rateLimit?.limit ?? "?"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
