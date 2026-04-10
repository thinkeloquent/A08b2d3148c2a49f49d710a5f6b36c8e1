import { useQuery } from "@tanstack/react-query";
import { listWorkflows } from "@/services/api";

export const workflowKeys = {
  all: ["workflows"] as const,
  list: (owner: string, repo: string) =>
    [...workflowKeys.all, owner, repo] as const,
};

export function useWorkflows(owner: string, repo: string) {
  return useQuery({
    queryKey: workflowKeys.list(owner, repo),
    queryFn: () => listWorkflows(owner, repo),
    enabled: !!owner && !!repo,
    select: (data) => data.workflows ?? [],
  });
}
