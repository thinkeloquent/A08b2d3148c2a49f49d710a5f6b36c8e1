import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflowStore } from '../store/useWorkflowStore.js';
import { useGraphStore } from '../store/useGraphStore.js';
import { getPresetById } from '../presets/templates.js';
import { RenderIcon } from '../components/LucideIconPicker.jsx';

export default function WorkflowReview() {
  const navigate = useNavigate();
  const pendingWorkflow = useWorkflowStore((s) => s.pendingWorkflow);
  const createFromPreset = useWorkflowStore((s) => s.createFromPreset);
  const clearPendingWorkflow = useWorkflowStore((s) => s.clearPendingWorkflow);
  const loadGraphDef = useGraphStore((s) => s.loadGraphDef);
  const resetGraph = useGraphStore((s) => s.reset);

  const activeWorkflow = useWorkflowStore((s) => s.activeWorkflow);

  const [creating, setCreating] = useState(false);
  const [extraNodes, setExtraNodes] = useState([]);
  const [showNodePicker, setShowNodePicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [edgeOverrides, setEdgeOverrides] = useState({});
  const [extraConditions, setExtraConditions] = useState({});
  const [conditionOverrides, setConditionOverrides] = useState({});
  const [showConditionPicker, setShowConditionPicker] = useState(false);
  const [conditionPickerSearch, setConditionPickerSearch] = useState('');

  // Guard: no pending workflow → redirect back
  if (!pendingWorkflow) {
    return (
      <div className="flex flex-col h-screen w-screen bg-white items-center justify-center">
        <p className="text-sm text-slate-500 mb-3">No workflow to review.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Back to app
        </button>
      </div>
    );
  }

  const preset = getPresetById(pendingWorkflow.presetId);
  if (!preset) {
    return (
      <div className="flex flex-col h-screen w-screen bg-white items-center justify-center">
        <p className="text-sm text-red-600 mb-3">Unknown template: {pendingWorkflow.presetId}</p>
        <button
          onClick={() => { clearPendingWorkflow(); navigate('/'); }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Back to app
        </button>
      </div>
    );
  }

  const tpl = preset.template;
  const workflowName = pendingWorkflow.customName || preset.label;
  // Merge conditions from template + extra picked + active workflow
  const allConditions = {
    ...(tpl.conditions ?? {}),
    ...extraConditions,
  };
  const conditionNames = Object.keys(allConditions);

  // Available conditions from active workflow not already in the list
  const activeConditions = activeWorkflow?.conditions ?? {};
  const availableConditions = Object.entries(activeConditions).filter(
    ([name]) => !allConditions[name]
  );
  const filteredAvailableConditions = conditionPickerSearch.trim()
    ? availableConditions.filter(([name]) => name.toLowerCase().includes(conditionPickerSearch.toLowerCase()))
    : availableConditions;

  const handlePickCondition = (name, cond) => {
    setExtraConditions((prev) => ({ ...prev, [name]: cond }));
  };

  const handleRemoveExtraCondition = (name) => {
    setExtraConditions((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleConditionChange = (name, field, value) => {
    setConditionOverrides((prev) => ({
      ...prev,
      [name]: { ...(prev[name] ?? {}), [field]: value },
    }));
  };

  // Resolve conditions with overrides applied
  const resolvedConditions = Object.fromEntries(
    Object.entries(allConditions).map(([name, cond]) => [
      name,
      {
        ...cond,
        trueResult: conditionOverrides[name]?.trueResult ?? cond.trueResult,
        falseResult: conditionOverrides[name]?.falseResult ?? cond.falseResult,
      },
    ])
  );
  const allNodes = [...tpl.nodes, ...extraNodes];

  // Available nodes from the active workflow that aren't already in the list
  const availableNodes = (activeWorkflow?.nodes ?? []).filter(
    (n) => !allNodes.some((existing) => existing.id === n.id)
  );
  const filteredAvailable = pickerSearch.trim()
    ? availableNodes.filter((n) => {
        const q = pickerSearch.toLowerCase();
        return n.id.toLowerCase().includes(q) || (n.data.label ?? '').toLowerCase().includes(q);
      })
    : availableNodes;

  const handlePickNode = (node) => {
    setExtraNodes((prev) => [...prev, node]);
  };

  const handleRemoveExtra = (nodeId) => {
    setExtraNodes((prev) => prev.filter((n) => n.id !== nodeId));
  };

  const handleEdgeChange = (edgeId, field, value) => {
    setEdgeOverrides((prev) => ({
      ...prev,
      [edgeId]: { ...(prev[edgeId] ?? {}), [field]: value },
    }));
  };

  const resolvedEdges = tpl.edges.map((edge) => ({
    ...edge,
    source: edgeOverrides[edge.id]?.source ?? edge.source,
    target: edgeOverrides[edge.id]?.target ?? edge.target,
  }));

  const handleConfirm = async () => {
    setCreating(true);
    try {
      await createFromPreset(pendingWorkflow.presetId, pendingWorkflow.customName || undefined);
      clearPendingWorkflow();
      resetGraph();
      await loadGraphDef({ force: true });
      navigate('/');
    } catch (err) {
      alert(err.message);
      setCreating(false);
    }
  };

  const handleBack = () => {
    clearPendingWorkflow();
    navigate('/');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-white">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 shrink-0">
        <button
          onClick={handleBack}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-slate-800">Review Workflow</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-6 space-y-6">

          {/* Summary card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Name</span>
              <span className="text-sm font-semibold text-slate-800">{workflowName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Template</span>
              <span className="text-sm text-slate-700">{preset.label}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Description</span>
              <span className="text-sm text-slate-600">{tpl.description}</span>
            </div>
            <div className="border-t border-slate-200 pt-3 grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs font-medium text-slate-500">Entry point</span>
                <div className="mt-0.5">
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono">{tpl.config.entryPoint}</span>
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500">Max iterations</span>
                <div className="mt-0.5 text-sm text-slate-700">{tpl.config.maxIterations}</div>
              </div>
              {tpl.config.interruptBefore?.length > 0 && (
                <div className="col-span-2">
                  <span className="text-xs font-medium text-slate-500">Interrupt before</span>
                  <div className="flex gap-1.5 mt-1">
                    {tpl.config.interruptBefore.map((n) => (
                      <span key={n} className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-mono">{n}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nodes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Nodes ({allNodes.length})</h2>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowNodePicker(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Node
                </button>
                <button
                  onClick={() => navigate('/workflow/nodes/new')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Create Node
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500">Node ID</th>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500">Category</th>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500">Handler</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allNodes.map((node) => {
                    const isExtra = extraNodes.some((n) => n.id === node.id);
                    return (
                      <tr key={node.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-slate-700">{node.id}</td>
                        <td className="px-4 py-2.5 text-slate-600">{node.data.category}</td>
                        <td className="px-4 py-2.5 font-mono text-slate-600">{node.data.handler || '—'}</td>
                        <td className="px-2 py-2.5">
                          {isExtra && (
                            <button
                              onClick={() => handleRemoveExtra(node.id)}
                              className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Remove"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Node picker from active workflow */}
            {showNodePicker && (
              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-medium text-slate-500 uppercase">Select from active workflow</span>
                  <button
                    onClick={() => { setShowNodePicker(false); setPickerSearch(''); }}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {!activeWorkflow ? (
                  <p className="text-xs text-slate-400 py-2">No active workflow. Create a workflow first.</p>
                ) : availableNodes.length === 0 && !pickerSearch.trim() ? (
                  <p className="text-xs text-slate-400 py-2">All nodes from the active workflow are already added.</p>
                ) : (
                  <>
                    <input
                      type="text"
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      placeholder="Search nodes..."
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400"
                    />
                    <div className="max-h-40 overflow-auto space-y-1">
                      {filteredAvailable.length === 0 ? (
                        <p className="text-xs text-slate-400 py-1">No matching nodes</p>
                      ) : (
                        filteredAvailable.map((node) => (
                          <button
                            key={node.id}
                            onClick={() => handlePickNode(node)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-white hover:border-indigo-200 border border-transparent transition-colors"
                          >
                            <span className="text-xs font-mono text-slate-700 flex-1">{node.id}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{node.data.category}</span>
                            {node.data.handler && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-mono">{node.data.handler}</span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Conditions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Conditions ({conditionNames.length})</h2>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowConditionPicker(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Condition
                </button>
                <button
                  onClick={() => navigate('/workflow/conditions/new')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Create Condition
                </button>
              </div>
            </div>
            {conditionNames.length > 0 && (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200">
                      <th className="text-left px-4 py-2.5 font-medium text-slate-500">Name</th>
                      <th className="text-left px-4 py-2.5 font-medium text-slate-500">Rule</th>
                      <th className="text-left px-4 py-2.5 font-medium text-slate-500">True</th>
                      <th className="text-left px-4 py-2.5 font-medium text-slate-500">False</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(resolvedConditions).map(([name, cond]) => {
                      const isExtra = name in extraConditions;
                      const nodeIds = allNodes.map((n) => n.id);
                      // Ensure current values are always in options even if not in allNodes
                      const nodeOptions = [...new Set([
                        ...nodeIds,
                        ...(cond.trueResult ? [cond.trueResult] : []),
                        ...(cond.falseResult ? [cond.falseResult] : []),
                      ])];
                      return (
                        <tr key={name} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2.5 font-mono font-medium text-slate-700">{name}</td>
                          <td className="px-4 py-2.5 text-slate-500">
                            <span className="font-mono">{cond.field}</span>{' '}
                            <span className="text-slate-400">{cond.operator}</span>{' '}
                            <span className="font-mono">{cond.value}</span>
                          </td>
                          <td className="px-4 py-2">
                            <select
                              value={cond.trueResult || ''}
                              onChange={(e) => handleConditionChange(name, 'trueResult', e.target.value)}
                              className="w-full text-xs bg-green-50 border border-green-200 text-green-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                              <option value="">Select node...</option>
                              {nodeOptions.map((id) => {
                                const node = allNodes.find((n) => n.id === id);
                                return <option key={id} value={id}>{node?.data?.label || id}</option>;
                              })}
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <select
                              value={cond.falseResult || ''}
                              onChange={(e) => handleConditionChange(name, 'falseResult', e.target.value)}
                              className="w-full text-xs bg-red-50 border border-red-200 text-red-600 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            >
                              <option value="">Select node...</option>
                              {nodeOptions.map((id) => {
                                const node = allNodes.find((n) => n.id === id);
                                return <option key={id} value={id}>{node?.data?.label || id}</option>;
                              })}
                            </select>
                          </td>
                          <td className="px-2 py-2.5">
                            {isExtra && (
                              <button
                                onClick={() => handleRemoveExtraCondition(name)}
                                className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Remove"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Condition picker from active workflow */}
            {showConditionPicker && (
              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-medium text-slate-500 uppercase">Select from active workflow</span>
                  <button
                    onClick={() => { setShowConditionPicker(false); setConditionPickerSearch(''); }}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {!activeWorkflow ? (
                  <p className="text-xs text-slate-400 py-2">No active workflow. Create a workflow first.</p>
                ) : availableConditions.length === 0 && !conditionPickerSearch.trim() ? (
                  <p className="text-xs text-slate-400 py-2">All conditions from the active workflow are already added.</p>
                ) : (
                  <>
                    <input
                      type="text"
                      value={conditionPickerSearch}
                      onChange={(e) => setConditionPickerSearch(e.target.value)}
                      placeholder="Search conditions..."
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400"
                    />
                    <div className="max-h-40 overflow-auto space-y-1">
                      {filteredAvailableConditions.length === 0 ? (
                        <p className="text-xs text-slate-400 py-1">No matching conditions</p>
                      ) : (
                        filteredAvailableConditions.map(([name, cond]) => (
                          <button
                            key={name}
                            onClick={() => handlePickCondition(name, cond)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-white hover:border-indigo-200 border border-transparent transition-colors"
                          >
                            <span className="text-xs font-mono text-slate-700 flex-1">{name}</span>
                            <span className="text-[10px] text-slate-400">
                              {cond.field} {cond.operator} {cond.value}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Edges */}
          <div>
            <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Edges ({resolvedEdges.length})</h2>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500">Source</th>
                    <th className="text-center px-2 py-2.5 font-medium text-slate-400 w-8">Transition</th>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500">Target</th>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500">Condition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resolvedEdges.map((edge) => {
                    const nodeIds = allNodes.map((n) => n.id);
                    const sourceOptions = nodeIds.filter((id) => id !== edge.target);
                    const targetOptions = nodeIds.filter((id) => id !== edge.source);
                    return (
                      <tr key={edge.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2">
                          <select
                            value={edge.source}
                            onChange={(e) => handleEdgeChange(edge.id, 'source', e.target.value)}
                            className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            {sourceOptions.map((id) => (
                              <option key={id} value={id}>{id}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <svg className="w-4 h-4 text-slate-400 mx-auto" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                          </svg>
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={edge.target}
                            onChange={(e) => handleEdgeChange(edge.id, 'target', e.target.value)}
                            className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            {targetOptions.map((id) => (
                              <option key={id} value={id}>{id}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={edgeOverrides[edge.id]?.condition ?? edge.data?.condition ?? ''}
                            onChange={(e) => handleEdgeChange(edge.id, 'condition', e.target.value)}
                            className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">— none —</option>
                            {conditionNames.map((name) => (
                              <option key={name} value={name}>{name}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>


          {/* g11n templates preview */}
          {tpl.g11n?.templates && (
            <div>
              <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                Templates ({Object.keys(tpl.g11n.templates).length})
              </h2>
              <div className="rounded-lg border border-slate-100 bg-white overflow-hidden">
                <div className="max-h-48 overflow-auto p-3">
                  <pre className="text-[11px] text-slate-600 font-mono whitespace-pre-wrap">
                    {JSON.stringify(tpl.g11n.templates, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={creating}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : 'Create Workflow'}
          </button>
        </div>
      </div>
    </div>
  );
}
