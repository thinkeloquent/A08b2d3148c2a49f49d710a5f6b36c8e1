import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ControlPanel, { ReleaseRunBar } from '../components/ControlPanel.jsx';
import GraphCanvas from '../components/GraphCanvas.jsx';
import FeedbackPanel from '../components/FeedbackPanel.jsx';
import IterationTimeline from '../components/IterationTimeline.jsx';
import CheckpointPanel from '../components/CheckpointPanel.jsx';
import WorkflowRunList from '../components/WorkflowRunList.jsx';
import StageNavigator from '../components/StageNavigator.jsx';
import NodeInspector from '../components/NodeInspector.jsx';
import { t } from '../graph/g11n.js';
import { useGraphStore } from '../store/useGraphStore.js';
import { useWorkflowStore } from '../store/useWorkflowStore.js';
import { useRunStore } from '../store/useRunStore.js';

const sidebarTabs = [
  { id: 'runs', label: 'Runs' },
  { id: 'timeline', g11nKey: 'sidebarTimeline' },
  { id: 'checkpoints', g11nKey: 'sidebarCheckpoints' },
];

export default function InstanceDetail() {
  const navigate = useNavigate();
  const { instanceId, runId } = useParams();
  const graphDef = useGraphStore((s) => s.graphDef);
  const activeInstanceId = useWorkflowStore((s) => s.activeInstanceId);
  const setActiveInstance = useWorkflowStore((s) => s.setActiveInstance);
  const instances = useWorkflowStore((s) => s.instances);
  const loadGraphDef = useGraphStore((s) => s.loadGraphDef);
  const resetGraph = useGraphStore((s) => s.reset);

  const activeInstance = useWorkflowStore((s) => s.activeInstance);

  const [activeSidebarTab, setActiveSidebarTab] = useState('runs');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showSchema, setShowSchema] = useState(false);

  // Find the instance name from the index
  const instanceEntry = instances.find((inst) => inst.id === instanceId);

  // Load the instance and its runs, then activate the run from the URL
  useEffect(() => {
    const load = async () => {
      if (instanceId && instanceId !== activeInstanceId) {
        setLoading(true);
        try {
          await setActiveInstance(instanceId);
          resetGraph();
          await useRunStore.getState().loadRunsForInstance(instanceId);
          await loadGraphDef({ force: true });
        } catch (err) {
          console.error('Failed to load instance:', err);
          navigate('/');
          return;
        } finally {
          setLoading(false);
        }
      } else if (instanceId) {
        await useRunStore.getState().loadRunsForInstance(instanceId);
      }

      // After runs are loaded, activate the run from URL or redirect to latest.
      // Skip if graph is live (running/paused with a compiled graph) and already
      // on this run — avoids restoreRunView overwriting live execution state.
      const graphState = useGraphStore.getState();
      const isLiveRun = (graphState.isRunning || graphState.isPaused) && graphState.graph && graphState.activeWorkflowRunId === runId;
      if (runId && !isLiveRun) {
        useRunStore.getState().setActiveWorkflowRun(runId);
      } else if (!runId && instanceId) {
        const runs = useRunStore.getState().workflowRuns;
        if (runs.length > 0) {
          navigate(`/instance/${encodeURIComponent(instanceId)}/${encodeURIComponent(runs[0].id)}`, { replace: true });
        }
      }
    };
    load();
  }, [instanceId, runId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading release...</p>
      </div>
    );
  }

  return (
    <>
      <ReleaseRunBar />
      <ControlPanel
        instanceName={instanceEntry?.name}
        onBack={() => navigate('/release')}
        onViewSchema={() => setShowSchema(true)}
      />
      <StageNavigator />
      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex-1">
          <GraphCanvas />
          <FeedbackPanel />
        </div>

        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-5 h-10 flex items-center justify-center
            bg-slate-100 border border-slate-200 rounded-l-md hover:bg-slate-200 transition-colors"
          style={{ right: sidebarOpen ? '20rem' : 0 }}
          title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          <span className="text-slate-500 text-xs">{sidebarOpen ? '\u203A' : '\u2039'}</span>
        </button>

        {/* Right sidebar */}
        {sidebarOpen && (
          <div className="w-80 border-l border-slate-200 bg-[#f8fafc] flex flex-col overflow-hidden">
            <div className="flex items-center gap-0 bg-slate-50 border-b border-slate-200 shrink-0">
              {sidebarTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSidebarTab(tab.id)}
                  className={`flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                    activeSidebarTab === tab.id
                      ? 'border-indigo-500 text-indigo-700 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tab.label ?? t(graphDef, tab.g11nKey)}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-hidden">
              {activeSidebarTab === 'runs' && <WorkflowRunList />}
              {activeSidebarTab === 'timeline' && <IterationTimeline />}
              {activeSidebarTab === 'checkpoints' && <CheckpointPanel />}
            </div>
          </div>
        )}
      </div>
      <NodeInspector />

      {/* Schema modal */}
      {showSchema && activeInstance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowSchema(false)}>
          <div
            className="bg-white rounded-xl shadow-xl border border-slate-200 w-[56rem] max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Workflow Schema</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {instanceEntry?.name ?? 'Release'} &mdash; snapshot of the schema used by this release
                </p>
              </div>
              <button
                onClick={() => setShowSchema(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 space-y-5">
              {/* Config */}
              <section>
                <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Config</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="px-3 py-2 rounded-lg bg-slate-50">
                    <span className="text-slate-400">Entry Point</span>
                    <div className="font-medium text-slate-700 font-mono mt-0.5">{activeInstance.config?.entryPoint ?? '—'}</div>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-slate-50">
                    <span className="text-slate-400">Max Iterations</span>
                    <div className="font-medium text-slate-700 mt-0.5">{activeInstance.config?.maxIterations ?? '—'}</div>
                  </div>
                  {activeInstance.config?.interruptBefore?.length > 0 && (
                    <div className="px-3 py-2 rounded-lg bg-slate-50 col-span-2">
                      <span className="text-slate-400">Interrupt Before</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {activeInstance.config.interruptBefore.map((n) => (
                          <span key={n} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 font-mono">{n}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeInstance.config?.interruptAfter?.length > 0 && (
                    <div className="px-3 py-2 rounded-lg bg-slate-50 col-span-2">
                      <span className="text-slate-400">Interrupt After</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {activeInstance.config.interruptAfter.map((n) => (
                          <span key={n} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-mono">{n}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Nodes */}
              {activeInstance.nodes?.length > 0 && (
                <section>
                  <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Nodes ({activeInstance.nodes.length})</h3>
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200">
                          <th className="text-left px-4 py-2 font-medium text-slate-500">Node</th>
                          <th className="text-left px-4 py-2 font-medium text-slate-500">ID</th>
                          <th className="text-left px-4 py-2 font-medium text-slate-500">Category</th>
                          <th className="text-left px-4 py-2 font-medium text-slate-500">Handler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeInstance.nodes.map((node) => (
                          <tr key={node.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-5 h-5 rounded flex items-center justify-center text-[10px] shrink-0"
                                  style={{
                                    backgroundColor: node.data?.style?.bgColor ?? '#f8fafc',
                                    color: node.data?.style?.textColor ?? '#475569',
                                    border: `1px solid ${node.data?.style?.borderColor ?? '#e2e8f0'}`,
                                  }}
                                >
                                  {node.data?.icon ?? '?'}
                                </span>
                                <span className="font-medium text-slate-700">{node.data?.label ?? node.id}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2 font-mono text-slate-500">{node.id}</td>
                            <td className="px-4 py-2 text-slate-500">{node.data?.category ?? '—'}</td>
                            <td className="px-4 py-2 font-mono text-slate-500">{node.data?.handler ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Edges */}
              {activeInstance.edges?.length > 0 && (
                <section>
                  <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Edges ({activeInstance.edges.length})</h3>
                  <div className="space-y-1">
                    {activeInstance.edges.map((edge) => (
                      <div key={edge.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 text-xs">
                        <span className="font-mono text-slate-600">{edge.source}</span>
                        <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                        <span className="font-mono text-slate-600">{edge.target}</span>
                        {edge.data?.label && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 ml-auto shrink-0">{edge.data.label}</span>
                        )}
                        {edge.data?.condition && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 font-mono shrink-0">{edge.data.condition}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Conditions */}
              {activeInstance.conditions && Object.keys(activeInstance.conditions).length > 0 && (
                <section>
                  <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Conditions ({Object.keys(activeInstance.conditions).length})</h3>
                  <div className="space-y-1">
                    {Object.entries(activeInstance.conditions).map(([name, cond]) => (
                      <div key={name} className="px-3 py-2 rounded-lg bg-slate-50 text-xs">
                        <span className="font-mono font-medium text-slate-700">{name}</span>
                        <span className="text-slate-400 ml-2">
                          {cond.field} {cond.operator} {cond.value}
                          {' '}&rarr; <span className="text-green-600">{cond.trueResult}</span> / <span className="text-blue-600">{cond.falseResult}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* State */}
              {activeInstance.state && Object.keys(activeInstance.state).length > 0 && (
                <section>
                  <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">State Fields ({Object.keys(activeInstance.state).length})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(activeInstance.state).map(([key, val]) => (
                      <div key={key} className="px-3 py-2 rounded-lg bg-slate-50 text-xs">
                        <span className="font-mono font-medium text-slate-700">{key}</span>
                        <div className="text-slate-400 mt-0.5 font-mono text-[10px]">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
