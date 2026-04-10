import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStorageAdapter } from '../storage/index.js';
import { useWorkflowStore } from '../store/useWorkflowStore.js';

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</h3>
      <div className="bg-white border border-slate-200 rounded-lg p-4">{children}</div>
    </div>
  );
}

function Field({ label, value, mono }) {
  return (
    <div className="py-1.5">
      <dt className="text-[11px] font-medium text-slate-400">{label}</dt>
      <dd className={`text-sm text-slate-800 mt-0.5 ${mono ? 'font-mono text-xs bg-slate-50 rounded px-2 py-1' : ''}`}>
        {value ?? <span className="text-slate-300 italic">not set</span>}
      </dd>
    </div>
  );
}

function TagList({ items }) {
  if (!items?.length) return <span className="text-slate-300 italic text-sm">none</span>;
  return (
    <div className="flex flex-wrap gap-1.5 mt-0.5">
      {items.map((item) => (
        <span key={item} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
          {item}
        </span>
      ))}
    </div>
  );
}

function NodeCard({ node }) {
  const d = node.data ?? {};
  const style = d.style ?? {};
  return (
    <div
      className="border rounded-lg p-3 text-sm"
      style={{ borderColor: style.borderColor ?? '#e2e8f0', backgroundColor: style.bgColor ?? '#f8fafc' }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-base">{d.icon}</span>
        <span className="font-medium" style={{ color: style.textColor ?? '#334155' }}>{d.label ?? node.id}</span>
        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">{node.id}</span>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        {d.category && <Field label="Category" value={d.category} />}
        {d.nodeType && <Field label="Node Type" value={d.nodeType} />}
        {d.handler && <Field label="Handler" value={d.handler} mono />}
        {d.interruptType && <Field label="Interrupt Type" value={d.interruptType} />}
      </dl>
      {d.handles && (
        <div className="mt-2 flex gap-3 text-[10px] text-slate-400">
          {d.handles.targets?.length > 0 && <span>in: {d.handles.targets.join(', ')}</span>}
          {d.handles.sources?.length > 0 && <span>out: {d.handles.sources.join(', ')}</span>}
        </div>
      )}
    </div>
  );
}

function EdgeRow({ edge }) {
  const d = edge.data ?? {};
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-2 pr-3 font-mono text-[11px] text-slate-500">{edge.id}</td>
      <td className="py-2 pr-3 text-sm text-slate-700">{edge.source}</td>
      <td className="py-2 pr-3 text-sm text-slate-400 text-center">&rarr;</td>
      <td className="py-2 pr-3 text-sm text-slate-700">{edge.target}</td>
      <td className="py-2 pr-3 text-[11px] text-slate-500">{d.label ?? '—'}</td>
      <td className="py-2 text-[11px] font-mono text-slate-400">{d.condition ? `${d.condition} = ${d.conditionResult}` : '—'}</td>
    </tr>
  );
}

function ConditionCard({ name, condition }) {
  return (
    <div className="border border-slate-200 rounded-lg p-3 bg-white">
      <div className="text-sm font-medium text-slate-800 mb-2 font-mono">{name}</div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
        <Field label="Field" value={condition.field} mono />
        <Field label="Operator" value={condition.operator} mono />
        <Field label="Value" value={condition.value} mono />
        <Field label="True Result" value={condition.trueResult} mono />
        <Field label="False Result" value={condition.falseResult} mono />
      </dl>
    </div>
  );
}

export default function WorkflowContract() {
  const navigate = useNavigate();
  const { workflowId } = useParams();
  const workflows = useWorkflowStore((s) => s.workflows);

  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load workflow data from storage
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const storage = getStorageAdapter();
      const data = await storage.get(`workflow_${workflowId}`);
      setWorkflow(data);
      setLoading(false);
    };
    load();
  }, [workflowId]);

  const indexEntry = workflows.find((w) => w.id === workflowId);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading workflow...</p>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-slate-500 mb-3">Workflow not found</p>
          <button onClick={() => navigate('/schemas')} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            Back to schemas
          </button>
        </div>
      </div>
    );
  }

  const config = workflow.config ?? {};
  const conditions = workflow.conditions ?? {};
  const nodes = workflow.nodes ?? [];
  const edges = workflow.edges ?? [];
  const state = workflow.state ?? {};

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-[#f8fafc]">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-slate-200">
        <button
          onClick={() => navigate('/')}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Back to workflows"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-slate-800 truncate">
            {indexEntry?.name ?? workflow.name ?? 'Untitled Workflow'}
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Workflow Contract &mdash; read-only
          </p>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-500 font-mono shrink-0">
          {workflowId}
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-6">

          {/* Overview */}
          <Section title="Overview">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
              <Field label="Name" value={indexEntry?.name ?? workflow.name} />
              <Field label="Description" value={workflow.description} />
              <Field label="Preset" value={indexEntry?.presetId ?? '—'} mono />
              <Field label="Created" value={formatDate(indexEntry?.createdAt)} />
              <Field label="Updated" value={formatDate(indexEntry?.updatedAt ?? workflow._updatedAt)} />
            </dl>
          </Section>

          {/* Config */}
          <Section title="Config">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
              <Field label="Max Iterations" value={config.maxIterations} />
              <Field label="Entry Point" value={config.entryPoint} mono />
              <div>
                <dt className="text-[11px] font-medium text-slate-400">Interrupt Before</dt>
                <dd className="mt-0.5"><TagList items={config.interruptBefore} /></dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium text-slate-400">Interrupt After</dt>
                <dd className="mt-0.5"><TagList items={config.interruptAfter} /></dd>
              </div>
            </dl>
          </Section>

          {/* State */}
          {Object.keys(state).length > 0 && (
            <Section title="State Schema">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
                {Object.entries(state).map(([key, val]) => (
                  <Field key={key} label={key} value={`reducer: ${val.reducer}, default: ${JSON.stringify(val.default)}`} mono />
                ))}
              </dl>
            </Section>
          )}

          {/* Conditions */}
          {Object.keys(conditions).length > 0 && (
            <Section title={`Conditions (${Object.keys(conditions).length})`}>
              <div className="space-y-3">
                {Object.entries(conditions).map(([name, cond]) => (
                  <ConditionCard key={name} name={name} condition={cond} />
                ))}
              </div>
            </Section>
          )}

          {/* Nodes */}
          <Section title={`Nodes (${nodes.length})`}>
            <div className="grid gap-3">
              {nodes.map((node) => (
                <NodeCard key={node.id} node={node} />
              ))}
            </div>
          </Section>

          {/* Edges */}
          <Section title={`Edges (${edges.length})`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    <th className="pb-2 pr-3">ID</th>
                    <th className="pb-2 pr-3">Source</th>
                    <th className="pb-2 pr-3"></th>
                    <th className="pb-2 pr-3">Target</th>
                    <th className="pb-2 pr-3">Label</th>
                    <th className="pb-2">Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {edges.map((edge) => (
                    <EdgeRow key={edge.id} edge={edge} />
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}
