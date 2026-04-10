import { useQuery } from "@tanstack/react-query";
import { listJobs } from "@/services/api";

export const jobKeys = {
  all: ["jobs"] as const,
  list: (owner: string, repo: string, runId: number) =>
    [...jobKeys.all, owner, repo, runId] as const,
};

export function useJobs(
  owner: string,
  repo: string,
  runId: number | null | undefined,
) {
  return useQuery({
    queryKey: jobKeys.list(owner, repo, runId!),
    queryFn: () => listJobs(owner, repo, runId!),
    enabled: !!owner && !!repo && !!runId,
    select: (data) => data.jobs ?? [],
  });
}
