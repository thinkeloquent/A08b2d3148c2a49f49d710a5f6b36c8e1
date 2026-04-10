import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkflowStore } from '../store/useWorkflowStore.js';
import { useGraphStore } from '../store/useGraphStore.js';
import { PRESET_TEMPLATES } from '../presets/templates.js';
import CreatableSelect from 'react-select/creatable';
import LucideIconPicker, { RenderIcon, selectStyles } from '../components/LucideIconPicker.jsx';

// ─── Derive node types from preset templates ────────────────────────────────
function deriveNodeTypes() {
  const seen = new Map();
  for (const preset of PRESET_TEMPLATES) {
    for (const node of preset.template.nodes) {
      const t = node.data.nodeType;
      if (t && !seen.has(t)) {
        seen.set(t, {
          id: t,
          label: node.data.label,
          handler: node.data.handler || '',
          category: node.data.category,
        });
      }
    }
  }
  return [...seen.values()];
}

const NODE_TYPES = deriveNodeTypes();
const NODE_TYPE_OPTIONS = NODE_TYPES.map((t) => ({
  value: t.id,
  label: `${t.id} — ${t.label}`,
  meta: t,
}));

// ─── Helpers ────────────────────────────────────────────────────────────────

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        {hint && <span className="text-slate-400 font-normal ml-1">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

/** Fallback style if category not found in loaded data */
const FALLBACK_STYLE = {
  bgColor: '#f8fafc', textColor: '#475569',
  borderColor: '#e2e8f0', accentColor: '#6366f1', handleColor: '#6366f1',
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function WorkflowNodeForm() {
  const navigate = useNavigate();
  const { nodeId } = useParams();
  const isNew = !nodeId;

  const activeWorkflow = useWorkflowStore((s) => s.activeWorkflow);
  const activeWorkflowId = useWorkflowStore((s) => s.activeWorkflowId);
  const addNode = useWorkflowStore((s) => s.addNode);
  const updateNode = useWorkflowStore((s) => s.updateNode);
  const loadWorkflows = useWorkflowStore((s) => s.loadWorkflows);
  const loadGraphDef = useGraphStore((s) => s.loadGraphDef);
  const resetGraph = useGraphStore((s) => s.reset);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);

  // Load categories from public/node-category.json
  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'node-category.json')
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {
        // Fallback if file not found
        setCategories([
          { id: 'Control', label: 'Control', style: FALLBACK_STYLE },
          { id: 'Processing', label: 'Processing', style: FALLBACK_STYLE },
          { id: 'Interaction', label: 'Interaction', style: FALLBACK_STYLE },
        ]);
      });
  }, []);

  // Build a style lookup from loaded categories
  const styleByCategory = useMemo(() => {
    const map = {};
    for (const cat of categories) map[cat.id] = cat.style ?? FALLBACK_STYLE;
    return map;
  }, [categories]);

  // Find existing node for edit mode
  const existingNode = !isNew && activeWorkflow
    ? activeWorkflow.nodes.find((n) => n.id === decodeURIComponent(nodeId))
    : null;

  const [form, setForm] = useState(() => {
    if (existingNode) {
      const targets = existingNode.data.handles?.targets ?? [];
      const sources = existingNode.data.handles?.sources ?? [];
      return {
        id: existingNode.id,
        label: existingNode.data.label,
        nodeType: existingNode.data.nodeType,
        category: existingNode.data.category,
        icon: existingNode.data.icon,
        handler: existingNode.data.handler || '',
        hasInput: targets.length > 0,
        hasOutput: sources.length > 0,
        multiInput: targets.length > 1,
        multiOutput: sources.length > 1,
        targets,
        sources,
      };
    }
    return {
      id: '', label: '', nodeType: '', category: 'Processing',
      icon: 'Cog', handler: '',
      hasInput: true, hasOutput: true,
      multiInput: false, multiOutput: false,
      targets: ['input'], sources: ['output'],
    };
  });

  useEffect(() => { loadWorkflows(); }, []);

  // Re-sync form when existingNode becomes available after store loads
  useEffect(() => {
    if (existingNode && !form.id) {
      const targets = existingNode.data.handles?.targets ?? [];
      const sources = existingNode.data.handles?.sources ?? [];
      setForm({
        id: existingNode.id,
        label: existingNode.data.label,
        nodeType: existingNode.data.nodeType,
        category: existingNode.data.category,
        icon: existingNode.data.icon,
        handler: existingNode.data.handler || '',
        hasInput: targets.length > 0,
        hasOutput: sources.length > 0,
        multiInput: targets.length > 1,
        multiOutput: sources.length > 1,
        targets,
        sources,
      });
    }
  }, [existingNode]);

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

  // Guard: edit mode but node not found
  if (!isNew && !existingNode) {
    return (
      <div className="flex flex-col flex-1 bg-white items-center justify-center">
        <p className="text-sm text-red-600 mb-3">Node not found: {decodeURIComponent(nodeId)}</p>
        <button
          onClick={() => navigate('/workflow/nodes')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Back to Nodes
        </button>
      </div>
    );
  }

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setError('');
  };

  // When node type is selected from the preset list, auto-fill related fields
  const handleNodeTypeChange = (value) => {
    setForm((f) => {
      const updated = { ...f, nodeType: value };
      const preset = NODE_TYPES.find((t) => t.id === value);
      if (preset) {
        if (!f.label) updated.label = preset.label;
        if (!f.handler && preset.handler) updated.handler = preset.handler;
        if (preset.category) updated.category = preset.category;
      }
      return updated;
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!form.id.trim()) { setError('Node ID is required'); return; }
    if (!form.label.trim()) { setError('Label is required'); return; }
    if (/\s/.test(form.id)) { setError('Node ID cannot contain spaces'); return; }

    const targets = form.hasInput ? (form.multiInput ? form.targets : ['input']) : [];
    const sources = form.hasOutput ? (form.multiOutput ? form.sources : ['output']) : [];

    const baseData = existingNode?.data ?? {};
    const catStyle = styleByCategory[form.category] ?? FALLBACK_STYLE;
    const nodeObj = {
      id: form.id.trim(),
      type: 'customNode',
      position: existingNode?.position ?? { x: 0, y: 0 },
      data: {
        ...baseData,
        nodeType: form.nodeType.trim() || form.id.trim(),
        category: form.category,
        label: form.label.trim(),
        icon: form.icon || 'Cog',
        handler: form.handler.trim() || undefined,
        inputs: baseData.inputs ?? {},
        handles: { targets, sources },
        style: baseData.category === form.category && baseData.style
          ? { ...catStyle, ...baseData.style }
          : { ...catStyle },
      },
    };

    // Preserve g11n if present
    if (baseData.g11n) nodeObj.data.g11n = baseData.g11n;

    setSaving(true);
    try {
      if (isNew) {
        await addNode(nodeObj);
      } else {
        const updates = { ...nodeObj };
        if (existingNode.id !== nodeObj.id) updates.id = nodeObj.id;
        await updateNode(existingNode.id, updates);
      }
      resetGraph();
      await loadGraphDef({ force: true });
      navigate('/workflow/nodes');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  // Preview card style from loaded categories
  const previewStyle = styleByCategory[form.category] ?? FALLBACK_STYLE;

  return (
    <div className="flex flex-col flex-1 bg-white">
      {/* Top bar with actions */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-200 shrink-0">
        <button
          onClick={() => navigate('/workflow/nodes')}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-sm font-semibold text-slate-800 flex-1">
          {isNew ? 'Add Node' : `Edit: ${existingNode.data.label}`}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/workflow/nodes')}
          className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : isNew ? 'Add Node' : 'Save Changes'}
        </button>
      </div>

      {/* Content — two-column layout using the full page width */}
      <div className="flex-1 overflow-auto">
        <div className="flex h-full">

          {/* Left: form fields spread across the space */}
          <div className="flex-1 px-8 py-6 overflow-auto">
            {error && (
              <div className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 mb-4">{error}</div>
            )}

            <div className="grid grid-cols-2 gap-x-6 gap-y-5 max-w-4xl">
              <Field label="Node ID" required>
                <input type="text" value={form.id} onChange={(e) => handleChange('id', e.target.value)}
                  placeholder="e.g. analyze" className="field-input font-mono" autoFocus={isNew} />
              </Field>
              <Field label="Label" required>
                <input type="text" value={form.label} onChange={(e) => handleChange('label', e.target.value)}
                  placeholder="e.g. Analyze Data" className="field-input" />
              </Field>

              <Field label="Icon">
                <LucideIconPicker value={form.icon} onChange={(iconName) => handleChange('icon', iconName)} />
              </Field>
              <Field label="Category">
                <select value={form.category} onChange={(e) => handleChange('category', e.target.value)} className="field-input">
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Node Type" hint="select or type custom">
                <CreatableSelect
                  value={form.nodeType
                    ? NODE_TYPE_OPTIONS.find((o) => o.value === form.nodeType) ?? { value: form.nodeType, label: form.nodeType }
                    : null}
                  onChange={(opt) => {
                    if (!opt) { handleChange('nodeType', ''); return; }
                    // If selecting a preset, auto-fill related fields
                    if (opt.meta) handleNodeTypeChange(opt.value);
                    else handleChange('nodeType', opt.value);
                  }}
                  options={NODE_TYPE_OPTIONS}
                  styles={selectStyles}
                  placeholder="Search or type a custom type..."
                  isClearable
                  isSearchable
                  formatCreateLabel={(input) => `Custom: "${input}"`}
                  noOptionsMessage={() => 'Type to create a custom node type'}
                />
              </Field>
              <Field label="Handler">
                <input type="text" value={form.handler} onChange={(e) => handleChange('handler', e.target.value)}
                  placeholder="e.g. generationNode (optional)" className="field-input font-mono" />
              </Field>

              <Field label="Input (Target)">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.hasInput}
                      onChange={(e) => {
                        const on = e.target.checked;
                        setForm((f) => ({
                          ...f, hasInput: on,
                          multiInput: on ? f.multiInput : false,
                          targets: on ? (f.targets.length ? f.targets : ['input']) : [],
                        }));
                      }}
                      className="accent-indigo-600 w-3.5 h-3.5" />
                    <span className="text-xs text-slate-700">Has input handle</span>
                  </label>
                  {form.hasInput && (
                    <label className="flex items-center gap-2 cursor-pointer ml-5">
                      <input type="checkbox" checked={form.multiInput}
                        onChange={(e) => {
                          const on = e.target.checked;
                          setForm((f) => ({
                            ...f, multiInput: on,
                            targets: on ? (f.targets.length ? f.targets : ['input']) : ['input'],
                          }));
                        }}
                        className="accent-indigo-600 w-3.5 h-3.5" />
                      <span className="text-xs text-slate-500">Multiple inputs</span>
                    </label>
                  )}
                  {form.hasInput && form.multiInput && (
                    <CreatableSelect
                      isMulti
                      value={form.targets.map((t) => ({ value: t, label: t }))}
                      onChange={(opts) => handleChange('targets', (opts ?? []).map((o) => o.value))}
                      styles={selectStyles}
                      placeholder="Type handle name + Enter..."
                      formatCreateLabel={(input) => `Add "${input}"`}
                      noOptionsMessage={() => 'Type a handle name'}
                      isClearable={false}
                    />
                  )}
                </div>
              </Field>
              <Field label="Output (Source)">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.hasOutput}
                      onChange={(e) => {
                        const on = e.target.checked;
                        setForm((f) => ({
                          ...f, hasOutput: on,
                          multiOutput: on ? f.multiOutput : false,
                          sources: on ? (f.sources.length ? f.sources : ['output']) : [],
                        }));
                      }}
                      className="accent-indigo-600 w-3.5 h-3.5" />
                    <span className="text-xs text-slate-700">Has output handle</span>
                  </label>
                  {form.hasOutput && (
                    <label className="flex items-center gap-2 cursor-pointer ml-5">
                      <input type="checkbox" checked={form.multiOutput}
                        onChange={(e) => {
                          const on = e.target.checked;
                          setForm((f) => ({
                            ...f, multiOutput: on,
                            sources: on ? (f.sources.length ? f.sources : ['output']) : ['output'],
                          }));
                        }}
                        className="accent-indigo-600 w-3.5 h-3.5" />
                      <span className="text-xs text-slate-500">Multiple outputs</span>
                    </label>
                  )}
                  {form.hasOutput && form.multiOutput && (
                    <CreatableSelect
                      isMulti
                      value={form.sources.map((s) => ({ value: s, label: s }))}
                      onChange={(opts) => handleChange('sources', (opts ?? []).map((o) => o.value))}
                      styles={selectStyles}
                      placeholder="Type handle name + Enter..."
                      formatCreateLabel={(input) => `Add "${input}"`}
                      noOptionsMessage={() => 'Type a handle name'}
                      isClearable={false}
                    />
                  )}
                </div>
              </Field>
            </div>
          </div>

          {/* Right: live preview panel */}
          <div className="w-64 shrink-0 border-l border-slate-200 bg-slate-50/60 px-5 py-6">
            <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-4">Preview</h3>
            <div
              className="rounded-xl border px-5 py-3 text-sm font-medium shadow-sm text-center"
              style={{ background: previewStyle.bgColor, borderColor: previewStyle.borderColor, color: previewStyle.textColor }}
            >
              <div className="flex items-center justify-center gap-2">
                <RenderIcon name={form.icon || 'Cog'} size={20} />
                <span>{form.label || 'Node Label'}</span>
              </div>
              <div className="mt-1 text-[11px] font-mono opacity-60">{form.id || 'node_id'}</div>
            </div>
            <div className="mt-4 space-y-2 text-[11px] text-slate-500">
              <div className="flex justify-between"><span>Category</span><span className="text-slate-700">{form.category}</span></div>
              <div className="flex justify-between"><span>Node Type</span><span className="font-mono text-slate-700">{form.nodeType || '(auto)'}</span></div>
              {form.handler && <div className="flex justify-between"><span>Handler</span><span className="font-mono text-blue-600">{form.handler}</span></div>}
              <div className="flex justify-between"><span>Inputs</span><span className="font-mono">{form.hasInput ? form.targets.join(', ') : 'none'}</span></div>
              <div className="flex justify-between"><span>Outputs</span><span className="font-mono">{form.hasOutput ? form.sources.join(', ') : 'none'}</span></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
