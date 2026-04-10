import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useWorkflowStore } from '../store/useWorkflowStore.js';
import { useGraphStore } from '../store/useGraphStore.js';
import { getPresetById } from '../presets/templates.js';
import { RenderIcon } from '../components/LucideIconPicker.jsx';

export default function WorkflowReview() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const [searchParams] = useSearchParams();
  const customName = searchParams.get('name') || '';

  const createFromPreset = useWorkflowStore((s) => s.createFromPreset);
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

  // Summary overrides
  const [summaryOverrides, setSummaryOverrides] = useState({});
  // Node property overrides: { [nodeType]: { label, category, handler } }
  const [nodeOverrides, setNodeOverrides] = useState({});
  // Auto-generated UUIDs per node (keyed by nodeType)
  const [nodeUuids, setNodeUuids] = useState({});
  // g11n template overrides: { [key]: value }
  const [g11nOverrides, setG11nOverrides] = useState({});

  const preset = getPresetById(templateId);
  if (!preset) {
    return (
      <div className="flex flex-col flex-1 bg-white items-center justify-center">
        <p className="text-sm text-red-600 mb-3">Unknown template: {templateId}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Back to app
        </button>
      </div>
    );
  }

  const tpl = preset.template;
  const workflowName = summaryOverrides.name ?? (customName || preset.label);
  const workflowDescription = summaryOverrides.description ?? tpl.description;
  const maxIterations = summaryOverrides.maxIterations ?? tpl.config.maxIterations;
  const entryPoint = summaryOverrides.entryPoint ?? tpl.config.entryPoint;
  // interruptBefore/interruptAfter are now derived from per-node interruptBehavior

  const handleSummaryChange = (field, value) => {
    setSummaryOverrides((prev) => ({ ...prev, [field]: value }));
  };

  const handleNodeChange = (nodeId, field, value) => {
    setNodeOverrides((prev) => ({
      ...prev,
      [nodeId]: { ...(prev[nodeId] ?? {}), [field]: value },
    }));
  };

  const handleG11nChange = (key, value) => {
    setG11nOverrides((prev) => ({ ...prev, [key]: value }));
  };

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

  // Resolve conditions with overrides applied (all fields)
  const resolvedConditions = Object.fromEntries(
    Object.entries(allConditions).map(([name, cond]) => [
      name,
      {
        ...cond,
        field: conditionOverrides[name]?.field ?? cond.field,
        operator: conditionOverrides[name]?.operator ?? cond.operator,
        value: conditionOverrides[name]?.value ?? cond.value,
        trueResult: conditionOverrides[name]?.trueResult ?? cond.trueResult,
        falseResult: conditionOverrides[name]?.falseResult ?? cond.falseResult,
      },
    ])
  );
  const allNodes = [...tpl.nodes, ...extraNodes];

  // Lazily assign a UUID to each node (keyed by nodeType / node.id)
  const getNodeUuid = (nodeType) => {
    if (nodeUuids[nodeType]) return nodeUuids[nodeType];
    const uuid = crypto.randomUUID();
    setNodeUuids((prev) => ({ ...prev, [nodeType]: uuid }));
    return uuid;
  };

  // Resolve node properties with overrides
  const resolvedNodes = allNodes.map((node) => ({
    ...node,
    uuid: getNodeUuid(node.id),
    data: {
      ...node.data,
      label: nodeOverrides[node.id]?.label ?? node.data.label,
      category: nodeOverrides[node.id]?.category ?? node.data.category,
      handler: nodeOverrides[node.id]?.handler ?? node.data.handler,
      interruptBehavior: nodeOverrides[node.id]?.interruptBehavior ?? node.data.interruptBehavior,
      interruptType: nodeOverrides[node.id]?.interruptType ?? node.data.interruptType,
    },
  }));

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

  // interruptBehavior options for the per-node dropdown
  const INTERRUPT_BEHAVIOR_OPTIONS = [
    { value: 'bypass', label: 'Bypass' },
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' },
    { value: 'both', label: 'Both' },
  ];

  // Resolved g11n templates
  const g11nTemplates = tpl.g11n?.templates ?? {};
  const resolvedG11n = Object.fromEntries(
    Object.entries(g11nTemplates).map(([key, val]) => [
      key,
      g11nOverrides[key] ?? val,
    ])
  );

  // Node IDs for dropdowns (from resolved, non-control nodes for entry point)
  const allNodeIds = resolvedNodes.map((n) => n.id);
  const nonControlNodeIds = resolvedNodes
    .filter((n) => n.data.category !== 'Control')
    .map((n) => n.id);

  const OPERATOR_OPTIONS = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'contains', 'startsWith', 'endsWith'];

  const handleConfirm = async () => {
    setCreating(true);
    try {
      // Build the resolved overrides to persist user's review-page changes
      const overrides = {
        name: workflowName,
        description: workflowDescription,
        config: {
          entryPoint,
          maxIterations,
          // interruptBefore/interruptAfter are derived from per-node interruptBehavior in createFromPreset
        },
        nodes: resolvedNodes,
        edges: resolvedEdges,
        conditions: resolvedConditions,
        g11n: tpl.g11n ? { ...tpl.g11n, templates: resolvedG11n } : undefined,
      };
      await createFromPreset(templateId, workflowName || undefined, overrides);
      resetGraph();
      await loadGraphDef({ force: true });
      navigate('/');
    } catch (err) {
      alert(err.message);
      setCreating(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const inputBase = 'w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
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
        <h1 className="text-lg font-semibold text-slate-800">Workflow Schema</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-6 space-y-6">

          {/* Summary card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">From Spec</span>
              <span className="text-sm text-slate-700">{preset.label}</span>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Name</label>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => handleSummaryChange('name', e.target.value)}
                className={inputBase + ' font-semibold text-slate-800'}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Description</label>
              <textarea
                value={workflowDescription}
                onChange={(e) => handleSummaryChange('description', e.target.value)}
                rows={2}
                className={inputBase + ' text-slate-600 resize-none'}
              />
            </div>
            <div className="border-t border-slate-200 pt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500">Entry point</label>
                <select
                  value={entryPoint}
                  onChange={(e) => handleSummaryChange('entryPoint', e.target.value)}
                  className={inputBase + ' mt-0.5 font-mono text-blue-700 bg-blue-50 border-blue-200 focus:ring-blue-500 focus:border-blue-500'}
                >
                  {nonControlNodeIds.map((id) => {
                    const node = resolvedNodes.find((n) => n.id === id);
                    return <option key={id} value={id}>{node?.data?.label || id}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Max iterations</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={maxIterations}
                  onChange={(e) => handleSummaryChange('maxIterations', parseInt(e.target.value, 10) || 1)}
                  className={inputBase + ' mt-0.5 text-slate-700'}
                />
              </div>
            </div>
          </div>

          {/* Nodes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Nodes ({resolvedNodes.length})</h2>
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
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500">Node Type</th>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500">Label</th>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500">Category</th>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500">Handler</th>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500">Interrupt</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resolvedNodes.map((node) => {
                    const isExtra = extraNodes.some((n) => n.id === node.id);
                    const isControl = node.data.category === 'Control';
                    return (
                      <tr key={node.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-slate-400 text-[10px]" title={node.uuid}>{node.uuid}</td>
                        <td className="px-4 py-2.5 font-mono text-slate-700">{node.id}</td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={node.data.label || ''}
                            onChange={(e) => handleNodeChange(node.id, 'label', e.target.value)}
                            className={inputBase + ' font-medium text-slate-700'}
                            placeholder="Label..."
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={node.data.category || ''}
                            onChange={(e) => handleNodeChange(node.id, 'category', e.target.value)}
                            className={inputBase + ' text-slate-600'}
                            placeholder="Category..."
                          />
                        </td>
                        <td className="px-4 py-2">
                          {isControl ? (
                            <span className="text-slate-400">—</span>
                          ) : (
                            <input
                              type="text"
                              value={node.data.handler || ''}
                              onChange={(e) => handleNodeChange(node.id, 'handler', e.target.value)}
                              className={inputBase + ' font-mono text-slate-600'}
                              placeholder="Handler..."
                            />
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {isControl ? (
                            <span className="text-slate-400">—</span>
                          ) : (
                            <div className="space-y-1">
                              <select
                                value={node.data.interruptBehavior ?? 'bypass'}
                                onChange={(e) => handleNodeChange(node.id, 'interruptBehavior', e.target.value)}
                                className={inputBase + ` font-medium ${
                                  (node.data.interruptBehavior ?? 'bypass') === 'bypass'
                                    ? 'text-slate-400'
                                    : (node.data.interruptBehavior === 'before' ? 'text-amber-700 bg-amber-50 border-amber-200'
                                      : node.data.interruptBehavior === 'after' ? 'text-blue-700 bg-blue-50 border-blue-200'
                                      : 'text-indigo-700 bg-indigo-50 border-indigo-200')
                                }`}
                              >
                                {INTERRUPT_BEHAVIOR_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                              {(node.data.interruptBehavior && node.data.interruptBehavior !== 'bypass') && (
                                <select
                                  value={node.data.interruptType ?? ''}
                                  onChange={(e) => handleNodeChange(node.id, 'interruptType', e.target.value || undefined)}
                                  className={inputBase + ' text-[10px] py-0.5 text-slate-600'}
                                >
                                  <option value="">standard (textarea)</option>
                                  <option value="data_source_input">datasource (CSV / API)</option>
                                  <option value="schema_mapping">mapping (column-to-field)</option>
                                  <option value="presentation">presentation (read-only)</option>
                                  <option value="feedback">feedback (textarea)</option>
                                  <option value="review">review (approve / reject)</option>
                                </select>
                              )}
                            </div>
                          )}
                        </td>
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
                      <th className="text-left px-4 py-2.5 font-medium text-slate-500">Field</th>
                      <th className="text-left px-4 py-2.5 font-medium text-slate-500">Operator</th>
                      <th className="text-left px-4 py-2.5 font-medium text-slate-500">Value</th>
                      <th className="text-left px-4 py-2.5 font-medium text-slate-500">True</th>
                      <th className="text-left px-4 py-2.5 font-medium text-slate-500">False</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(resolvedConditions).map(([name, cond]) => {
                      const isExtra = name in extraConditions;
                      const nodeIds = resolvedNodes.map((n) => n.id);
                      // Ensure current values are always in options even if not in allNodes
                      const nodeOptions = [...new Set([
                        ...nodeIds,
                        ...(cond.trueResult ? [cond.trueResult] : []),
                        ...(cond.falseResult ? [cond.falseResult] : []),
                      ])];
                      return (
                        <tr key={name} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2.5 font-mono font-medium text-slate-700">{name}</td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={cond.field || ''}
                              onChange={(e) => handleConditionChange(name, 'field', e.target.value)}
                              className={inputBase + ' font-mono'}
                              placeholder="field..."
                            />
                          </td>
                          <td className="px-4 py-2">
                            <select
                              value={cond.operator || ''}
                              onChange={(e) => handleConditionChange(name, 'operator', e.target.value)}
                              className={inputBase + ' font-mono'}
                            >
                              {OPERATOR_OPTIONS.map((op) => (
                                <option key={op} value={op}>{op}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={cond.value || ''}
                              onChange={(e) => handleConditionChange(name, 'value', e.target.value)}
                              className={inputBase + ' font-mono'}
                              placeholder="value..."
                            />
                          </td>
                          <td className="px-4 py-2">
                            <select
                              value={cond.trueResult || ''}
                              onChange={(e) => handleConditionChange(name, 'trueResult', e.target.value)}
                              className="w-full text-xs bg-green-50 border border-green-200 text-green-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                              <option value="">Select node...</option>
                              {nodeOptions.map((id) => {
                                const node = resolvedNodes.find((n) => n.id === id);
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
                                const node = resolvedNodes.find((n) => n.id === id);
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
                    const nodeIds = resolvedNodes.map((n) => n.id);
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


          {/* g11n templates — editable key:value table */}
          {tpl.g11n?.templates && (
            <div>
              <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                Template Strings ({Object.keys(g11nTemplates).length})
              </h2>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200">
                      <th className="text-left px-4 py-2.5 font-medium text-slate-500 w-1/4">Key</th>
                      <th className="text-left px-4 py-2.5 font-medium text-slate-500">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(resolvedG11n).map(([key, val]) => (
                      <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-slate-500 align-top whitespace-nowrap">{key}</td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => handleG11nChange(key, e.target.value)}
                            className={inputBase + ' font-mono text-slate-600'}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
            {creating ? 'Saving...' : 'Save Schema'}
          </button>
        </div>
      </div>
    </div>
  );
}
