import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflowStore } from '../store/useWorkflowStore.js';
import { useGraphStore } from '../store/useGraphStore.js';
import { RenderIcon } from '../components/LucideIconPicker.jsx';

const CATEGORIES = ['Control', 'Processing', 'Interaction'];

// ─── Node Row ───────────────────────────────────────────────────────────────
function NodeRow({ node, edges, isEntryPoint, isInterrupt, onEdit, onDelete }) {
  const inCount = edges.filter((e) => e.target === node.id).length;
  const outCount = edges.filter((e) => e.source === node.id).length;

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-100 hover:border-slate-200 transition-colors group">
      {/* Icon + color bar */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
        style={{ backgroundColor: node.data.style?.bgColor, border: `1px solid ${node.data.style?.borderColor}` }}
      >
        <RenderIcon name={node.data.icon} size={20} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-800">{node.data.label}</span>
          {isEntryPoint && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-medium">
              entry
            </span>
          )}
          {isInterrupt && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 font-medium">
              interrupt
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[11px] text-slate-400 font-mono">{node.id}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{node.data.category}</span>
          {node.data.handler && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-mono">{node.data.handler}</span>
          )}
        </div>
      </div>

      {/* Edge counts */}
      <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
        <span title="Incoming edges">{inCount} in</span>
        <span title="Outgoing edges">{outCount} out</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(node.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          title="Edit node"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
          </svg>
        </button>
        <button
          onClick={() => {
            if (confirm(`Delete node "${node.data.label}" (${node.id})?\nConnected edges will also be removed.`)) {
              onDelete(node.id);
            }
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Delete node"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
        active
          ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
          : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-700'
      }`}
    >
      {label}
    </button>
  );
}

// ─── List Page ──────────────────────────────────────────────────────────────
export default function WorkflowNodes() {
  const navigate = useNavigate();
  const activeWorkflow = useWorkflowStore((s) => s.activeWorkflow);
  const activeWorkflowId = useWorkflowStore((s) => s.activeWorkflowId);
  const deleteNode = useWorkflowStore((s) => s.deleteNode);
  const loadWorkflows = useWorkflowStore((s) => s.loadWorkflows);
  const loadGraphDef = useGraphStore((s) => s.loadGraphDef);
  const resetGraph = useGraphStore((s) => s.reset);

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { loadWorkflows(); }, []);

  // Guard: no active workflow
  if (!activeWorkflowId || !activeWorkflow) {
    return (
      <div className="flex flex-col flex-1 bg-white items-center justify-center">
        <p className="text-sm text-slate-500 mb-3">No active workflow selected.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Back to app
        </button>
      </div>
    );
  }

  const nodes = activeWorkflow.nodes ?? [];
  const edges = activeWorkflow.edges ?? [];
  const config = activeWorkflow.config ?? {};

  // Filter & search
  const filteredNodes = nodes.filter((node) => {
    if (filter !== 'all' && node.data.category !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        node.id.toLowerCase().includes(q) ||
        (node.data.label ?? '').toLowerCase().includes(q) ||
        (node.data.handler ?? '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDelete = async (nodeId) => {
    try {
      await deleteNode(nodeId);
      resetGraph();
      await loadGraphDef({ force: true });
    } catch (err) {
      alert(err.message);
    }
  };

  const categoryCount = (cat) => nodes.filter((n) => n.data.category === cat).length;

  return (
    <div className="flex flex-col flex-1 bg-white">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 shrink-0">
        <button
          onClick={() => navigate('/')}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-slate-800">Workflow Nodes</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeWorkflow.name ?? 'Untitled'} &middot; {nodes.length} node{nodes.length !== 1 ? 's' : ''} &middot; {edges.length} edge{edges.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => navigate('/workflow/nodes/new')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Node
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">

          {/* Stats bar */}
          <div className="flex items-center gap-2">
            <FilterPill
              label={`All (${nodes.length})`}
              active={filter === 'all'}
              onClick={() => setFilter('all')}
            />
            {CATEGORIES.map((cat) => (
              <FilterPill
                key={cat}
                label={`${cat} (${categoryCount(cat)})`}
                active={filter === cat}
                onClick={() => setFilter(cat)}
              />
            ))}
            <div className="flex-1" />
            <div className="relative">
              <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search nodes..."
                className="w-48 text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white placeholder-slate-400"
              />
            </div>
          </div>

          {/* Node list */}
          {filteredNodes.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
              <div className="text-slate-400 text-sm">
                {search.trim() || filter !== 'all'
                  ? 'No matching nodes'
                  : 'No nodes in this workflow'}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNodes.map((node) => (
                <NodeRow
                  key={node.id}
                  node={node}
                  edges={edges}
                  isEntryPoint={config.entryPoint === node.id}
                  isInterrupt={(config.interruptBefore ?? []).includes(node.id)}
                  onEdit={(nodeId) => navigate(`/workflow/nodes/${encodeURIComponent(nodeId)}/edit`)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
