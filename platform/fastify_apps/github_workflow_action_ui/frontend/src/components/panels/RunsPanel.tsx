import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Clock, X } from "lucide-react";
import type { WorkflowRun } from "@/types";
import { duration } from "@/lib/formatters";
import { Spinner, EmptyState, StatusIcon, SearchInput, ErrorBanner } from "@/components/common";

interface RunsPanelProps {
  runs: WorkflowRun[];
  isLoading: boolean;
  error: Error | null;
  selectedRunId: number | null;
  workflowId: number;
  onRefresh: () => void;
}

export function RunsPanel({
  runs,
  isLoading,
  error,
  selectedRunId,
  workflowId,
  onRefresh,
}: RunsPanelProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const selectedRun = useMemo(
    () => runs.find((r) => r.id === selectedRunId) ?? null,
    [runs, selectedRunId],
  );

  const filtered = useMemo(
    () =>
      runs.filter(
        (r) =>
          (r.display_title || r.name || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          String(r.run_number).includes(search) ||
          String(r.id).includes(search),
      ),
    [runs, search],
  );

  return (
    <div className="w-[280px] shrink-0 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">Actions</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{filtered.length}</span>
            <button
              onClick={onRefresh}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <RefreshCw size={12} />
            </button>
          </div>
        </div>
        <SearchInput value={search} onChange={setSearch} />

        {/* Active run tag */}
        {selectedRun && (
          <div className="flex items-center gap-1 mt-2 bg-gray-100 rounded-lg px-2.5 py-1 text-xs text-gray-600">
            <span className="font-medium">Action ID:</span>
            <span className="text-gray-900 font-mono">
              #{selectedRun.run_number}
            </span>
            <button
              onClick={() => navigate(`/${workflowId}`)}
              className="ml-auto hover:bg-gray-200 rounded p-0.5 transition"
            >
              <X size={12} className="text-gray-500" />
            </button>
          </div>
        )}
      </div>

      <ErrorBanner error={error} />

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && <Spinner />}
        {!isLoading && !error && filtered.length === 0 && (
          <EmptyState text="No runs" />
        )}
        {!isLoading &&
          filtered.map((run) => (
            <button
              key={run.id}
              onClick={() => navigate(`/${workflowId}/${run.id}`)}
              className={`w-full text-left px-4 py-3 border-b border-gray-50 flex items-center gap-2.5 transition-colors hover:bg-gray-50 ${
                selectedRunId === run.id ? "bg-green-50/70" : ""
              }`}
            >
              <StatusIcon
                conclusion={run.conclusion}
                status={run.status}
                size={18}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900 truncate font-medium">
                  {run.display_title || run.name}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  #{run.run_number} · {run.event}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Clock size={12} className="text-gray-400" />
                <span className="text-[11px] text-gray-400">
                  {duration(run.run_started_at, run.updated_at)}
                </span>
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}
