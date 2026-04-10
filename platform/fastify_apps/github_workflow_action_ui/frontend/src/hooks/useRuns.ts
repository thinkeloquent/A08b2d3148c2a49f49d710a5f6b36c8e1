import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listRuns,
  listRunsForWorkflow,
  rerunWorkflow,
  rerunFailedJobs,
} from "@/services/api";

export const runKeys = {
  all: ["runs"] as const,
  list: (owner: string, repo: string, workflowId?: number) =>
    [...runKeys.all, owner, repo, workflowId ?? "all"] as const,
};

export function useRuns(
  owner: string,
  repo: string,
  workflowId?: number | null,
) {
  return useQuery({
    queryKey: runKeys.list(owner, repo, workflowId ?? undefined),
    queryFn: () =>
      workflowId
        ? listRunsForWorkflow(owner, repo, workflowId)
        : listRuns(owner, repo),
    enabled: !!owner && !!repo,
    select: (data) => data.workflow_runs ?? [],
  });
}

export function useRerunWorkflow(owner: string, repo: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (runId: number) => rerunWorkflow(owner, repo, runId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: runKeys.all });
    },
  });
}

export function useRerunFailedJobs(owner: string, repo: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (runId: number) => rerunFailedJobs(owner, repo, runId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: runKeys.all });
    },
  });
}
