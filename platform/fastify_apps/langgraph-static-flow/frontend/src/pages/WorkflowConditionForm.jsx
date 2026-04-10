import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkflowStore } from '../store/useWorkflowStore.js';
import { useGraphStore } from '../store/useGraphStore.js';

const OPERATORS = [
  { value: 'eq', label: 'equals (eq)' },
  { value: 'neq', label: 'not equals (neq)' },
  { value: 'gt', label: 'greater than (gt)' },
  { value: 'gte', label: 'greater or equal (gte)' },
  { value: 'lt', label: 'less than (lt)' },
  { value: 'lte', label: 'less or equal (lte)' },
  { value: 'includes', label: 'includes' },
  { value: 'startsWith', label: 'starts with' },
];

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

export default function WorkflowConditionForm() {
  const navigate = useNavigate();
  const { conditionName } = useParams();
  const isNew = !conditionName;

  const activeWorkflow = useWorkflowStore((s) => s.activeWorkflow);
  const activeWorkflowId = useWorkflowStore((s) => s.activeWorkflowId);
  const addCondition = useWorkflowStore((s) => s.addCondition);
  const updateCondition = useWorkflowStore((s) => s.updateCondition);
  const loadWorkflows = useWorkflowStore((s) => s.loadWorkflows);
  const loadGraphDef = useGraphStore((s) => s.loadGraphDef);
  const resetGraph = useGraphStore((s) => s.reset);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadWorkflows(); }, []);

  // Find existing condition for edit mode
  const decodedName = conditionName ? decodeURIComponent(conditionName) : null;
  const existingCondition = decodedName && activeWorkflow?.conditions?.[decodedName]
    ? activeWorkflow.conditions[decodedName]
    : null;

  const [form, setForm] = useState(() => {
    if (existingCondition) {
      return {
        name: decodedName,
        field: existingCondition.field,
        operator: existingCondition.operator,
        value: existingCondition.value,
        trueResult: existingCondition.trueResult,
        falseResult: existingCondition.falseResult,
      };
    }
    return { name: '', field: '', operator: 'gte', value: '', trueResult: '', falseResult: '' };
  });

  // Re-sync form when existingCondition becomes available after store loads
  useEffect(() => {
    if (existingCondition && !form.name) {
      setForm({
        name: decodedName,
        field: existingCondition.field,
        operator: existingCondition.operator,
        value: existingCondition.value,
        trueResult: existingCondition.trueResult,
        falseResult: existingCondition.falseResult,
      });
    }
  }, [existingCondition]);

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

  // Guard: edit mode but condition not found
  if (!isNew && !existingCondition) {
    return (
      <div className="flex flex-col flex-1 bg-white items-center justify-center">
        <p className="text-sm text-red-600 mb-3">Condition not found: {decodedName}</p>
        <button
          onClick={() => navigate('/workflow/conditions')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Back to Conditions
        </button>
      </div>
    );
  }

  const nodes = activeWorkflow.nodes ?? [];
  const nodeOptions = nodes.map((n) => n.id);

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!form.name.trim()) { setError('Condition name is required'); return; }
    if (/\s/.test(form.name)) { setError('Condition name cannot contain spaces'); return; }
    if (!form.field.trim()) { setError('Field is required'); return; }
    if (!form.value.trim()) { setError('Value is required'); return; }
    if (!form.trueResult.trim()) { setError('True result is required'); return; }
    if (!form.falseResult.trim()) { setError('False result is required'); return; }

    const conditionObj = {
      field: form.field.trim(),
      operator: form.operator,
      value: form.value.trim(),
      trueResult: form.trueResult.trim(),
      falseResult: form.falseResult.trim(),
    };

    setSaving(true);
    try {
      if (isNew) {
        await addCondition(form.name.trim(), conditionObj);
      } else {
        await updateCondition(decodedName, form.name.trim(), conditionObj);
      }
      resetGraph();
      await loadGraphDef({ force: true });
      navigate('/workflow/conditions');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-white">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-200 shrink-0">
        <button
          onClick={() => navigate('/workflow/conditions')}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-sm font-semibold text-slate-800 flex-1">
          {isNew ? 'Add Condition' : `Edit: ${decodedName}`}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/workflow/conditions')}
          className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : isNew ? 'Add Condition' : 'Save Changes'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="flex h-full">

          {/* Left: form */}
          <div className="flex-1 px-8 py-6 overflow-auto">
            {error && (
              <div className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 mb-4">{error}</div>
            )}

            <div className="grid grid-cols-2 gap-x-6 gap-y-5 max-w-4xl">
              <Field label="Condition Name" required hint="camelCase">
                <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. shouldContinue" className="field-input font-mono" autoFocus={isNew} />
              </Field>

              <Field label="Operator" required>
                <select value={form.operator} onChange={(e) => handleChange('operator', e.target.value)} className="field-input">
                  {OPERATORS.map((op) => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Field" required hint="state field to evaluate">
                <input type="text" value={form.field} onChange={(e) => handleChange('field', e.target.value)}
                  placeholder="e.g. iterations" className="field-input font-mono" />
              </Field>

              <Field label="Value" required hint="comparison value">
                <input type="text" value={form.value} onChange={(e) => handleChange('value', e.target.value)}
                  placeholder="e.g. config.maxIterations" className="field-input font-mono" />
              </Field>

              <Field label="True Result" required hint="target node when true">
                <select value={form.trueResult} onChange={(e) => handleChange('trueResult', e.target.value)} className="field-input font-mono">
                  <option value="">Select node...</option>
                  {nodeOptions.map((id) => (
                    <option key={id} value={id}>{id}</option>
                  ))}
                </select>
              </Field>

              <Field label="False Result" required hint="target node when false">
                <select value={form.falseResult} onChange={(e) => handleChange('falseResult', e.target.value)} className="field-input font-mono">
                  <option value="">Select node...</option>
                  {nodeOptions.map((id) => (
                    <option key={id} value={id}>{id}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* Right: preview */}
          <div className="w-64 shrink-0 border-l border-slate-200 bg-slate-50/60 px-5 py-6">
            <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-4">Preview</h3>
            <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
              <div className="text-sm font-mono font-medium text-violet-700">{form.name || 'conditionName'}</div>
              <div className="mt-2 text-[11px] text-slate-500">
                <span className="font-mono">{form.field || 'field'}</span>{' '}
                <span className="text-slate-400">{form.operator}</span>{' '}
                <span className="font-mono">{form.value || 'value'}</span>
              </div>
              <div className="mt-2 space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-green-50 text-green-600 font-mono">true</span>
                  <span className="text-slate-400">&rarr;</span>
                  <span className="font-mono text-slate-700">{form.trueResult || '...'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-500 font-mono">false</span>
                  <span className="text-slate-400">&rarr;</span>
                  <span className="font-mono text-slate-700">{form.falseResult || '...'}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-[11px] text-slate-500">
              <div className="flex justify-between"><span>Field</span><span className="font-mono text-slate-700">{form.field || '—'}</span></div>
              <div className="flex justify-between"><span>Operator</span><span className="font-mono text-slate-700">{form.operator}</span></div>
              <div className="flex justify-between"><span>Value</span><span className="font-mono text-slate-700">{form.value || '—'}</span></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
