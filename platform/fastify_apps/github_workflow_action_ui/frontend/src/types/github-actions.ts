export interface Workflow {
  id: number;
  name: string;
  path: string;
  state: "active" | "disabled_manually" | "disabled_inactivity";
  created_at: string;
  updated_at: string;
}

export interface WorkflowRun {
  id: number;
  name: string;
  display_title: string;
  run_number: number;
  run_attempt: number;
  event: string;
  status: "queued" | "in_progress" | "completed" | "waiting" | "pending";
  conclusion: "success" | "failure" | "cancelled" | "skipped" | null;
  head_branch: string;
  html_url: string;
  run_started_at: string;
  updated_at: string;
  actor: { login: string; avatar_url: string } | null;
}

export interface WorkflowJob {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  started_at: string;
  completed_at: string;
  steps: WorkflowJobStep[];
}

export interface WorkflowJobStep {
  name: string;
  number: number;
  status: string;
  conclusion: string | null;
  started_at: string;
  completed_at: string;
}

export interface Artifact {
  id: number;
  name: string;
  size_in_bytes: number;
  archive_download_url: string;
  expired: boolean;
  expires_at: string;
}

export interface HealthResponse {
  status: "ok" | "error";
  rateLimit?: {
    remaining: number;
    limit: number;
    reset: number;
  };
}

export interface WorkflowsListResponse {
  total_count: number;
  workflows: Workflow[];
}

export interface RunsListResponse {
  total_count: number;
  workflow_runs: WorkflowRun[];
}

export interface JobsListResponse {
  total_count: number;
  jobs: WorkflowJob[];
}

export interface ArtifactsListResponse {
  total_count: number;
  artifacts: Artifact[];
}
