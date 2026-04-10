import { get } from "./client";
import type { JobsListResponse } from "@/types";

export function listJobs(
  owner: string,
  repo: string,
  runId: number,
): Promise<JobsListResponse> {
  return get<JobsListResponse>(
    `/repos/${owner}/${repo}/actions/runs/${runId}/jobs`,
  );
}
