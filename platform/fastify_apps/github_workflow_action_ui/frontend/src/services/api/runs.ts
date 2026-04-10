import { get, post } from "./client";
import type { RunsListResponse } from "@/types";

export function listRuns(
  owner: string,
  repo: string,
  opts?: { perPage?: number },
): Promise<RunsListResponse> {
  const qs = opts?.perPage ? `?per_page=${opts.perPage}` : "?per_page=30";
  return get<RunsListResponse>(
    `/repos/${owner}/${repo}/actions/runs${qs}`,
  );
}

export function listRunsForWorkflow(
  owner: string,
  repo: string,
  workflowId: number,
  opts?: { perPage?: number },
): Promise<RunsListResponse> {
  const qs = opts?.perPage ? `?per_page=${opts.perPage}` : "?per_page=30";
  return get<RunsListResponse>(
    `/repos/${owner}/${repo}/actions/workflows/${workflowId}/runs${qs}`,
  );
}

export function rerunWorkflow(
  owner: string,
  repo: string,
  runId: number,
): Promise<null> {
  return post<null>(
    `/repos/${owner}/${repo}/actions/runs/${runId}/rerun`,
  );
}

export function rerunFailedJobs(
  owner: string,
  repo: string,
  runId: number,
): Promise<null> {
  return post<null>(
    `/repos/${owner}/${repo}/actions/runs/${runId}/rerun-failed-jobs`,
  );
}

export function cancelRun(
  owner: string,
  repo: string,
  runId: number,
): Promise<null> {
  return post<null>(
    `/repos/${owner}/${repo}/actions/runs/${runId}/cancel`,
  );
}
