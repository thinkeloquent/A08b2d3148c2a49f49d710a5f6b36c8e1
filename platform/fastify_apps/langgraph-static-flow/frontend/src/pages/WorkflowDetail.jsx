import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GraphCanvas from '../components/GraphCanvas.jsx';
import NodeInspector from '../components/NodeInspector.jsx';
import { useGraphStore } from '../store/useGraphStore.js';
import { useWorkflowStore } from '../store/useWorkflowStore.js';

export default function WorkflowDetail() {
  const navigate = useNavigate();
  const { workflowId } = useParams();
  const graphDef = useGraphStore((s) => s.graphDef);
  const activeWorkflowId = useWorkflowStore((s) => s.activeWorkflowId);
  const setActiveWorkflow = useWorkflowStore((s) => s.setActiveWorkflow);
  const workflows = useWorkflowStore((s) => s.workflows);
  const instances = useWorkflowStore((s) => s.instances);
  const createInstance = useWorkflowStore((s) => s.createInstance);
  const loadGraphDef = useGraphStore((s) => s.loadGraphDef);
  const resetGraph = useGraphStore((s) => s.reset);

  const [loading, setLoading] = useState(false);
  const [showNewRelease, setShowNewRelease] = useState(false);

  const workflow = workflows.find((wf) => wf.id === workflowId);
  const releaseCount = instances.filter((i) => i.workflowId === workflowId).length;

  // Load the workflow if it's not already active
  useEffect(() => {
    if (workflowId && workflowId !== activeWorkflowId) {
      setLoading(true);
      setActiveWorkflow(workflowId)
        .then(() => {
          resetGraph();
          return loadGraphDef({ force: true });
        })
        .catch((err) => {
          console.error('Failed to load workflow:', err);
          navigate('/');
        })
        .finally(() => setLoading(false));
    }
  }, [workflowId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading schema...</p>
      </div>
    );
  }

  const nodes = graphDef?.nodes ?? [];
  const edges = graphDef?.edges ?? [];
  const config = graphDef?.config ?? {};
  const conditions = graphDef?.conditions ?? {};
  const conditionNames = Object.keys(conditions);

  return (
    <>
      {/* Context bar */}
      <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 border-b border-slate-200 shrink-0">
        <button
          onClick={() => navigate('/schemas')}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Back to schemas"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <span className="text-xs font-medium text-slate-600 truncate max-w-[300px]">
          {workflow?.name ?? 'Workflow Schema'}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium shrink-0">
          schema
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] text-slate-400">
            {releaseCount} release{releaseCount !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setShowNewRelease(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Release
          </button>
        </div>
      </div>

      {/* Main layout: graph preview + sidebar detail */}
      <div className="flex flex-1 overflow-hidden">
        {/* Graph canvas (read-only preview) */}
        <div className="relative flex-1">
          <GraphCanvas />
        </div>

        {/* Schema detail sidebar */}
        <div className="w-80 border-l border-slate-200 bg-[#f8fafc] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 shrink-0">
            <h2 className="text-sm font-semibold text-slate-700">Schema Details</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Config */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Config</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="px-3 py-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400">Entry Point</span>
                  <div className="text-xs font-mono font-medium text-slate-700 mt-0.5">{config.entryPoint ?? '—'}</div>
                </div>
                <div className="px-3 py-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400">Max Iterations</span>
                  <div className="text-xs font-medium text-slate-700 mt-0.5">{config.maxIterations ?? '—'}</div>
                </div>
              </div>
              {(config.interruptBefore?.length > 0 || config.interruptAfter?.length > 0) && (
                <div className="space-y-1">
                  {config.interruptBefore?.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-[10px] text-slate-400 shrink-0">Interrupt before:</span>
                      {config.interruptBefore.map((n) => (
                        <span key={n} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 font-mono">{n}</span>
                      ))}
                    </div>
                  )}
                  {config.interruptAfter?.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-[10px] text-slate-400 shrink-0">Interrupt after:</span>
                      {config.interruptAfter.map((n) => (
                        <span key={n} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 font-mono">{n}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Nodes */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Nodes ({nodes.length})</h3>
              <div className="space-y-1">
                {nodes.map((node) => (
                  <div key={node.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200">
                    <span
                      className="w-6 h-6 rounded flex items-center justify-center text-xs shrink-0"
                      style={{
                        backgroundColor: node.data?.style?.bgColor ?? '#f8fafc',
                        color: node.data?.style?.textColor ?? '#475569',
                        border: `1px solid ${node.data?.style?.borderColor ?? '#e2e8f0'}`,
                      }}
                    >
                      {node.data?.icon ?? '?'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-slate-700">{node.data?.label ?? node.id}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5 font-mono">{node.id}</span>
                    </div>
                    {node.data?.handler && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-mono shrink-0">{node.data.handler}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Edges */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Edges ({edges.length})</h3>
              <div className="space-y-1">
                {edges.map((edge) => (
                  <div key={edge.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs">
                    <span className="font-mono text-slate-600">{edge.source}</span>
                    <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                    <span className="font-mono text-slate-600">{edge.target}</span>
                    {edge.data?.label && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 ml-auto shrink-0">{edge.data.label}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Conditions */}
            {conditionNames.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Conditions ({conditionNames.length})</h3>
                <div className="space-y-1">
                  {conditionNames.map((name) => {
                    const c = conditions[name];
                    return (
                      <div key={name} className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs">
                        <span className="font-mono font-medium text-slate-700">{name}</span>
                        <div className="text-slate-400 mt-0.5">
                          {c.field} {c.operator} {c.value} ? <span className="text-green-600">{c.trueResult}</span> : <span className="text-blue-600">{c.falseResult}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="pt-2 border-t border-slate-200">
              <p className="text-[11px] text-slate-400 mb-2">
                Schemas are read-only definitions. Create a release to run this workflow in a sandbox.
              </p>
              <button
                onClick={() => setShowNewRelease(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New Release
              </button>
            </div>
          </div>
        </div>
      </div>

      <NodeInspector />

      {/* New Release dialog */}
      {showNewRelease && workflow && (
        <NewReleaseDialog
          workflow={workflow}
          onClose={() => setShowNewRelease(false)}
          onConfirm={async (name) => {
            try {
              const id = await createInstance(workflowId, name);
              resetGraph();
              await loadGraphDef({ force: true });
              setShowNewRelease(false);
              navigate(`/instance/${encodeURIComponent(id)}`);
            } catch (err) {
              alert(err.message);
            }
          }}
        />
      )}
    </>
  );
}

function NewReleaseDialog({ workflow, onClose, onConfirm }) {
  const [name, setName] = useState(`${workflow.name} — Run ${Date.now().toString(36).slice(-4)}`);
  const [creating, setCreating] = useState(false);

  const handleConfirm = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await onConfirm(name.trim());
    } catch {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-96 p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">New Release</h3>
        <p className="text-xs text-slate-500 mb-3">
          Create a sandbox release from <span className="font-medium text-slate-700">{workflow.name}</span>
        </p>
        <label className="block text-xs font-medium text-slate-600 mb-1">Release Name</label>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          placeholder="e.g. Sprint 42 run"
          className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white placeholder-slate-400"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={!name.trim() || creating}
            className="px-4 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Release'}
          </button>
        </div>
      </div>
    </div>
  );
}
