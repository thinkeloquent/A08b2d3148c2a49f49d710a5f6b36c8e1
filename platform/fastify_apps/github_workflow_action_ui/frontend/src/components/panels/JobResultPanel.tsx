import { useMemo } from "react";
import type { WorkflowRun, WorkflowJob, Artifact } from "@/types";
import { ErrorBanner } from "@/components/common";
import { RunHeader } from "./RunHeader";
import { ArtifactsList } from "./ArtifactsList";
import { StatusSummary } from "./StatusSummary";
import { JobsMetadata } from "./JobsMetadata";

interface JobResultPanelProps {
  selectedRun: WorkflowRun;
  owner: string;
  repo: string;
  jobs: WorkflowJob[];
  jobsLoading: boolean;
  jobsError: Error | null;
  artifacts: Artifact[];
  artifactsLoading: boolean;
  onRerun: () => void;
  onRerunFailed: () => void;
  rerunLoading: boolean;
}

export function JobResultPanel({
  selectedRun,
  owner,
  repo,
  jobs,
  jobsLoading,
  jobsError,
  artifacts,
  artifactsLoading,
  onRerun,
  onRerunFailed,
  rerunLoading,
}: JobResultPanelProps) {
  // Auto-expand first failed job, or first job
  const initialExpandedJobId = useMemo(() => {
    if (jobsLoading || jobs.length === 0) return null;
    const failed = jobs.find((j) => j.conclusion === "failure");
    return failed?.id ?? jobs[0]?.id ?? null;
  }, [jobs, jobsLoading]);

  return (
    <div className="flex-1 overflow-y-auto">
      <RunHeader
        run={selectedRun}
        owner={owner}
        repo={repo}
        onRerun={onRerun}
        onRerunFailed={onRerunFailed}
        rerunLoading={rerunLoading}
      />

      <ErrorBanner error={jobsError} />

      <ArtifactsList
        artifacts={artifacts}
        isLoading={artifactsLoading}
        owner={owner}
        repo={repo}
      />

      <StatusSummary jobs={jobs} isLoading={jobsLoading} />

      <JobsMetadata
        run={selectedRun}
        jobs={jobs}
        isLoading={jobsLoading}
        initialExpandedJobId={initialExpandedJobId}
      />
    </div>
  );
}
