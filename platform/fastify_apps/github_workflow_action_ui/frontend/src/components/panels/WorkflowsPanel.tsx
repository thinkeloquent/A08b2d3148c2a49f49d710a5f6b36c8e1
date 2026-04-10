import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { Workflow } from "@/types";
import { Spinner, EmptyState, SearchInput, ErrorBanner } from "@/components/common";

interface WorkflowsPanelProps {
  workflows: Workflow[];
  isLoading: boolean;
  error: Error | null;
  selectedWorkflowId: number | null;
}

export function WorkflowsPanel({
  workflows,
  isLoading,
  error,
  selectedWorkflowId,
}: WorkflowsPanelProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      workflows.filter(
        (w) =>
          w.name.toLowerCase().includes(search.toLowerCase()) ||
          w.path?.toLowerCase().includes(search.toLowerCase()),
      ),
    [workflows, search],
  );

  return (
    <div className="w-[240px] shrink-0 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">Workflows</h3>
          <span className="text-xs text-gray-400">{filtered.length}</span>
        </div>
        <SearchInput value={search} onChange={setSearch} />
      </div>

      <ErrorBanner error={error} />

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && <Spinner />}
        {!isLoading && !error && filtered.length === 0 && (
          <EmptyState text="No workflows" />
        )}
        {!isLoading &&
          filtered.map((wf) => (
            <button
              key={wf.id}
              onClick={() =>
                navigate(selectedWorkflowId === wf.id ? "/" : `/${wf.id}`)
              }
              className={`w-full text-left px-4 py-3 border-b border-gray-50 flex items-center gap-2.5 transition-colors hover:bg-gray-50 ${
                selectedWorkflowId === wf.id ? "bg-green-50/70" : ""
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${wf.state === "active" ? "bg-green-500" : "bg-gray-300"}`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900 truncate font-medium">
                  {wf.name}
                </p>
                <p className="text-[11px] text-gray-400 truncate">{wf.path}</p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          ))}
      </div>
    </div>
  );
}
