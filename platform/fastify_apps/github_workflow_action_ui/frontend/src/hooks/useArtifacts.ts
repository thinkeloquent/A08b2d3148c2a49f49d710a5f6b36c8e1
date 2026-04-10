import { useQuery } from "@tanstack/react-query";
import { listArtifacts } from "@/services/api";

export const artifactKeys = {
  all: ["artifacts"] as const,
  list: (owner: string, repo: string, runId: number) =>
    [...artifactKeys.all, owner, repo, runId] as const,
};

export function useArtifacts(
  owner: string,
  repo: string,
  runId: number | null | undefined,
) {
  return useQuery({
    queryKey: artifactKeys.list(owner, repo, runId!),
    queryFn: () => listArtifacts(owner, repo, runId!),
    enabled: !!owner && !!repo && !!runId,
    select: (data) => data.artifacts ?? [],
  });
}
