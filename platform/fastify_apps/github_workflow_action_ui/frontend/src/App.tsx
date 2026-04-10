import { useState, useCallback, useEffect } from "react";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { AppShell } from "./layout/AppShell";

import type { WorkflowRun } from "@/types";
import {
  useWorkflows,
  useRuns,
  useJobs,
  useArtifacts,
  useHealth,
  useRerunWorkflow,
  useRerunFailedJobs,
} from "@/hooks";
import { TopBar, type ApiRepo } from "@/components/TopBar";
import { WorkflowsPanel, RunsPanel, JobResultPanel } from "@/components/panels";

function Dashboard() {
  const { workflowId, actionId } = useParams<{
    workflowId: string;
    actionId: string;
  }>();

  // Repos from code-repositories API
  const [apiRepos, setApiRepos] = useState<ApiRepo[]>([]);
  const [reposLoading, setReposLoading] = useState(true);
  const [selectedRepoKey, setSelectedRepoKey] = useState<string | null>(null);

  // Derive owner/repo from selected key
  const [owner, repo] = selectedRepoKey?.split("/") ?? [];

  // Fetch repos on mount
  useEffect(() => {
    async function fetchRepos() {
      try {
        const res = await fetch("/api/code-repositories/repos?limit=100");
        const data = await res.json();
        const repos: ApiRepo[] = data.repositories ?? [];
        setApiRepos(repos);
      } catch {
        // ignore
      } finally {
        setReposLoading(false);
      }
    }
    fetchRepos();
  }, []);

  const handleChangeRepo = useCallback((key: string) => {
    setSelectedRepoKey(key);
  }, []);

  // Data hooks
  const selectedWorkflowId = workflowId ? Number(workflowId) : undefined;
  const selectedActionId = actionId ? Number(actionId) : undefined;

  const workflows = useWorkflows(owner ?? "", repo ?? "");
  const runs = useRuns(owner ?? "", repo ?? "", selectedWorkflowId);
  const jobs = useJobs(owner ?? "", repo ?? "", selectedActionId);
  const artifacts = useArtifacts(owner ?? "", repo ?? "", selectedActionId);
  const health = useHealth();
  const rerunMutation = useRerunWorkflow(owner ?? "", repo ?? "");
  const rerunFailedMutation = useRerunFailedJobs(owner ?? "", repo ?? "");

  // Derive selected objects from URL params
  const selectedWorkflow =
    workflows.data?.find((w) => w.id === selectedWorkflowId) ?? null;
  const selectedRun: WorkflowRun | null =
    runs.data?.find((r) => r.id === selectedActionId) ?? null;

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
      }}
    >
      <TopBar
        apiRepos={apiRepos}
        selectedRepoKey={selectedRepoKey}
        onChangeRepo={handleChangeRepo}
        reposLoading={reposLoading}
        health={health.data}
      />

      {/* 3-column layout */}
      <div>
        <div
          className="bg-white border border-gray-200 overflow-hidden flex"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            height: "calc(100vh - 88px)",
          }}
        >
          <WorkflowsPanel
            workflows={workflows.data ?? []}
            isLoading={workflows.isLoading}
            error={workflows.error}
            selectedWorkflowId={selectedWorkflowId ?? null}
          />

          {selectedWorkflow && (
            <RunsPanel
              runs={runs.data ?? []}
              isLoading={runs.isLoading}
              error={runs.error}
              selectedRunId={selectedActionId ?? null}
              workflowId={selectedWorkflowId!}
              onRefresh={() => runs.refetch()}
            />
          )}

          {selectedRun && (
            <JobResultPanel
              selectedRun={selectedRun}
              owner={owner ?? ""}
              repo={repo ?? ""}
              jobs={jobs.data ?? []}
              jobsLoading={jobs.isLoading}
              jobsError={jobs.error}
              artifacts={artifacts.data ?? []}
              artifactsLoading={artifacts.isLoading}
              onRerun={() => {
                if (selectedRun)
                  rerunMutation.mutate(selectedRun.id);
              }}
              onRerunFailed={() => {
                if (selectedRun)
                  rerunFailedMutation.mutate(selectedRun.id);
              }}
              rerunLoading={
                rerunMutation.isPending || rerunFailedMutation.isPending
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/apps/github-workflow-action-ui">
      <AppShell>
        <Routes>
          <Route path="/:workflowId/:actionId" element={<Dashboard />} />
          <Route path="/:workflowId" element={<Dashboard />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
