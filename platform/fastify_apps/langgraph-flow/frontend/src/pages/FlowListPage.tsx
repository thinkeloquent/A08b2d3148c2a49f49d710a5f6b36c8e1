import { useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Folder, Trash2, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { listFlows, deleteFlow, createFlow } from '@/api/flow.api';
import type { FlowListItem } from '@/types/flow.types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function FlowListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['flows'],
    queryFn: listFlows,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFlow,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['flows'] });
      setDeleteConfirmId(null);
    },
  });

  async function handleNewFlow() {
    setCreating(true);
    try {
      const flow = await createFlow({
        name: 'Untitled Flow',
        description: '',
        sourceFormat: 'native',
      });
      navigate(`/editor/${flow.id}`);
    } catch (err) {
      console.error('Failed to create flow', err);
    } finally {
      setCreating(false);
    }
  }

  function handleOpen(flow: FlowListItem) {
    navigate(`/editor/${flow.id}`);
  }

  function handleDeleteClick(id: string, e: MouseEvent) {
    e.stopPropagation();
    setDeleteConfirmId(id);
  }

  function handleDeleteConfirm(id: string) {
    deleteMutation.mutate(id);
  }

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-800 overflow-auto">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-sm">
            <span className="text-xs font-bold text-white">LG</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-900">LangGraph Flow Editor</h1>
            <p className="text-xs text-slate-400">Visual AI workflow builder</p>
          </div>
        </div>
        <button
          onClick={handleNewFlow}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors text-sm font-medium shadow-sm disabled:opacity-50"
        >
          {creating ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Plus size={14} />
          )}
          New Flow
        </button>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Saved Flows
          </h2>
          {data && (
            <span className="text-xs text-slate-400">
              {data.flows.length} total
            </span>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center gap-3 py-12 justify-center">
            <Loader2 size={16} className="animate-spin text-indigo-500" />
            <span className="text-sm text-slate-400">Loading flows...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle size={14} className="text-red-500 shrink-0" />
            <span className="text-sm text-red-600">
              {error instanceof Error ? error.message : 'Failed to load flows'}
            </span>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && data?.flows.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4">
              <Folder size={24} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600 mb-2">No flows yet</p>
            <p className="text-sm text-slate-400 mb-6">
              Create your first LangGraph flow to get started
            </p>
            <button
              onClick={handleNewFlow}
              disabled={creating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors text-sm font-medium shadow-sm"
            >
              <Plus size={14} />
              Create Flow
            </button>
          </div>
        )}

        {/* Flow grid */}
        {!isLoading && data && data.flows.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.flows.map((flow) => (
              <div
                key={flow.id}
                onClick={() => handleOpen(flow)}
                className="relative group rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all cursor-pointer p-5"
              >
                {/* Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                    <Folder size={16} className="text-indigo-500" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleDeleteClick(flow.id, e)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete flow"
                    >
                      <Trash2 size={13} />
                    </button>
                    <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-indigo-500 transition-colors">
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-sm font-semibold text-slate-800 truncate mb-1">
                  {flow.name}
                </h3>

                {/* Description */}
                {flow.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {flow.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-3 mt-auto">
                  <span className="text-xs text-slate-400">
                    <span className="font-medium text-indigo-500">{flow.nodeCount}</span> nodes
                  </span>
                  <span className="text-xs text-slate-400">
                    <span className="font-medium text-amber-500">{flow.edgeCount}</span> edges
                  </span>
                  <span className="text-xs text-slate-400 ml-auto">
                    {formatDate(flow.updatedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm dialog */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="w-96 rounded-2xl border border-slate-200 bg-white shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-slate-900 mb-2">Delete Flow</h3>
            <p className="text-sm text-slate-500 mb-6">
              This action cannot be undone. The flow and all its versions will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(deleteConfirmId)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
