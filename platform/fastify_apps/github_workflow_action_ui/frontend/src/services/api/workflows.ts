import { get } from "./client";
import type { WorkflowsListResponse } from "@/types";

export function listWorkflows(
  owner: string,
  repo: string,
): Promise<WorkflowsListResponse> {
  return get<WorkflowsListResponse>(
    `/repos/${owner}/${repo}/actions/workflows`,
  );
}
