import { useQuery } from "@tanstack/react-query";
import { get } from "@/services/api/client";
import { getGitHubHealth } from "@/services/api/client";

interface AppHealth {
  status: string;
  service: string;
  version: string;
  timestamp: string;
}

interface GitHubHealth {
  status: string;
  rateLimit?: {
    remaining: number;
    limit: number;
    reset: number;
  };
}

export function useAppHealth() {
  return useQuery({
    queryKey: ["admin", "app-health"],
    queryFn: () => get<AppHealth>(""),
    staleTime: 30_000,
  });
}

export function useGitHubHealth() {
  return useQuery({
    queryKey: ["admin", "github-health"],
    queryFn: () => getGitHubHealth() as Promise<GitHubHealth>,
    staleTime: 30_000,
    retry: false,
  });
}
