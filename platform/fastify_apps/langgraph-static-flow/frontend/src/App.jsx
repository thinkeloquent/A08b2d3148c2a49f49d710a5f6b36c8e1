import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SessionView from './components/SessionView.jsx';
import WorkflowManager from './components/WorkflowManager.jsx';
import { useWorkflowStore } from './store/useWorkflowStore.js';
import { useGraphStore } from './store/useGraphStore.js';
import { PRESET_TEMPLATES } from './presets/templates.js';

const pathToTabId = {
  '/': 'dashboard', '/deployments': 'deployments', '/release': 'release',
  '/schemas': 'schemas', '/session': 'session', '/specs': 'specs',
};

function formatDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatRelative(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(ts);
}

/**
 * Simple fuzzy match — checks if all characters of the query
 * appear in order (case-insensitive) within the target string.
 */
function fuzzyMatch(target, query) {
  if (!query) return true;
  const t = target.toLowerCase();
  const q = query.toLowerCase();
  let ti = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const idx = t.indexOf(q[qi], ti);
    if (idx < 0) return false;
    ti = idx + 1;
  }
  return true;
}

const STATUS_STYLES = {
  idle:      { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  running:   { bg: 'bg-blue-100',  text: 'text-blue-700',  dot: 'bg-blue-500' },
  paused:    { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  completed: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
};

// ─── Inline instance name dialog ────────────────────────────────────────────
function NewInstanceDialog({ workflow, onClose, onConfirm }) {
  const [name, setName] = useState(`${workflow.name} — Run ${Date.now().toString(36).slice(-4)}`);
  const handleConfirm = () => { if (name.trim()) onConfirm(workflow.id, name.trim()); };
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
          <button onClick={handleConfirm} disabled={!name.trim()} className="px-4 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50">Create Release</button>
        </div>
      </div>
    </div>
  );
}

// ─── Rename instance dialog ─────────────────────────────────────────────────
function RenameInstanceDialog({ initial, onClose, onConfirm }) {
  const [name, setName] = useState(initial.name);
  const handleConfirm = () => { if (name.trim() && name.trim() !== initial.name) onConfirm(name.trim()); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-96 p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Rename Release</h3>
        <p className="text-xs text-slate-500 mb-3">Enter a new name for this release.</p>
        <label className="block text-xs font-medium text-slate-600 mb-1">Release Name</label>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white placeholder-slate-400"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleConfirm} disabled={!name.trim() || name.trim() === initial.name} className="px-4 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50">Rename</button>
        </div>
      </div>
    </div>
  );
}

// ─── Instance detail dialog ─────────────────────────────────────────────────
function InstanceDetailDialog({ instance, onClose, onOpen }) {
  const st = STATUS_STYLES[instance.status] ?? STATUS_STYLES.idle;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-[28rem] p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Release Details</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Name</dt>
            <dd className="font-medium text-slate-800 text-right truncate max-w-[60%]">{instance.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Workflow</dt>
            <dd className="font-medium text-slate-800 text-right truncate max-w-[60%]">{instance.workflowName ?? '—'}</dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-slate-500">Status</dt>
            <dd>
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${st.bg} ${st.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                {instance.status}
              </span>
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Created</dt>
            <dd className="text-slate-700">{formatDate(instance.createdAt)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Updated</dt>
            <dd className="text-slate-700">{formatDate(instance.updatedAt)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">ID</dt>
            <dd className="font-mono text-xs text-slate-500 truncate max-w-[60%]">{instance.id}</dd>
          </div>
        </dl>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
          <button onClick={onClose} className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Close</button>
          <button onClick={onOpen} className="px-4 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">Open Release</button>
        </div>
      </div>
    </div>
  );
}

// ─── Rename schema dialog ───────────────────────────────────────────────────
function RenameSchemaDialog({ initial, onClose, onConfirm }) {
  const [name, setName] = useState(initial.name);
  const handleConfirm = () => { if (name.trim() && name.trim() !== initial.name) onConfirm(name.trim()); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-96 p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Rename Schema</h3>
        <p className="text-xs text-slate-500 mb-3">Enter a new name for this workflow schema.</p>
        <label className="block text-xs font-medium text-slate-600 mb-1">Schema Name</label>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white placeholder-slate-400"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleConfirm} disabled={!name.trim() || name.trim() === initial.name} className="px-4 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50">Rename</button>
        </div>
      </div>
    </div>
  );
}

// ─── Schema detail dialog ───────────────────────────────────────────────────
function SchemaDetailDialog({ workflow, releaseCount, onClose, onOpen }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-[28rem] p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Schema Details</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Name</dt>
            <dd className="font-medium text-slate-800 text-right truncate max-w-[60%]">{workflow.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Releases</dt>
            <dd className="font-medium text-slate-800">{releaseCount}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Created</dt>
            <dd className="text-slate-700">{formatDate(workflow.createdAt)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Updated</dt>
            <dd className="text-slate-700">{formatDate(workflow.updatedAt)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">ID</dt>
            <dd className="font-mono text-xs text-slate-500 truncate max-w-[60%]">{workflow.id}</dd>
          </div>
        </dl>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
          <button onClick={onClose} className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Close</button>
          <button onClick={onOpen} className="px-4 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">Open Schemas</button>
        </div>
      </div>
    </div>
  );
}

// ─── Release (Sandbox) tab — shows schemas and releases ─────────────────────
function PreviewWorkflowTab() {
  const navigate = useNavigate();
  const workflows = useWorkflowStore((s) => s.workflows);
  const instances = useWorkflowStore((s) => s.instances);
  const activeInstanceId = useWorkflowStore((s) => s.activeInstanceId);
  const createInstance = useWorkflowStore((s) => s.createInstance);
  const loading = useWorkflowStore((s) => s.loading);

  const loadGraphDef = useGraphStore((s) => s.loadGraphDef);
  const reset = useGraphStore((s) => s.reset);

  const renameInstance = useWorkflowStore((s) => s.renameInstance);
  const deleteInstance = useWorkflowStore((s) => s.deleteInstance);
  const renameWorkflow = useWorkflowStore((s) => s.renameWorkflow);
  const deleteWorkflow = useWorkflowStore((s) => s.deleteWorkflow);

  const [instanceDialog, setInstanceDialog] = useState(null); // workflow entry or null
  const [schemaSearch, setSchemaSearch] = useState('');
  const [releaseSearch, setReleaseSearch] = useState('');
  const [renameDialog, setRenameDialog] = useState(null); // { id, name } or null
  const [detailDialog, setDetailDialog] = useState(null); // instance entry or null
  const [schemaRenameDialog, setSchemaRenameDialog] = useState(null); // { id, name } or null
  const [schemaDetailDialog, setSchemaDetailDialog] = useState(null); // workflow entry or null

  const handleDeleteInstance = async (inst) => {
    if (!window.confirm(`Delete release "${inst.name}"? This cannot be undone.`)) return;
    await deleteInstance(inst.id);
  };

  const handleDeleteWorkflow = async (wf) => {
    const releaseCount = instances.filter((i) => i.workflowId === wf.id).length;
    const extra = releaseCount > 0 ? ` It has ${releaseCount} release${releaseCount !== 1 ? 's' : ''}.` : '';
    if (!window.confirm(`Delete schema "${wf.name}"?${extra} This cannot be undone.`)) return;
    await deleteWorkflow(wf.id);
  };

  const filteredWorkflows = useMemo(
    () => [...workflows]
      .filter((wf) => fuzzyMatch(wf.name, schemaSearch))
      .sort((a, b) => b.updatedAt - a.updatedAt),
    [workflows, schemaSearch],
  );
  const filteredInstances = useMemo(
    () => [...instances]
      .filter((inst) => fuzzyMatch(inst.name, releaseSearch) || fuzzyMatch(inst.workflowName ?? '', releaseSearch))
      .sort((a, b) => b.updatedAt - a.updatedAt),
    [instances, releaseSearch],
  );

  const handleCreateInstance = async (workflowId, instanceName) => {
    try {
      const id = await createInstance(workflowId, instanceName);
      reset();
      await loadGraphDef({ force: true });
      setInstanceDialog(null);
      navigate(`/instance/${encodeURIComponent(id)}`);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="text-xs text-slate-400 text-center py-12">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* ─── Section 1: Workflow Schemas ───────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Workflow Schemas</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {workflows.length} workflow schema{workflows.length !== 1 ? 's' : ''} &mdash; select one to create a new release
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={schemaSearch}
            onChange={(e) => setSchemaSearch(e.target.value)}
            placeholder="Search workflow schemas..."
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white placeholder-slate-400"
          />
          {schemaSearch && (
            <button onClick={() => setSchemaSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {workflows.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
            <div className="text-slate-400 text-sm mb-2">No workflow schemas yet</div>
            <p className="text-xs text-slate-400">
              Go to the <span className="font-medium text-slate-500">Workflow Schemas</span> tab to create one from a spec.
            </p>
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
            <div className="text-slate-400 text-sm">No workflow schemas matching &ldquo;{schemaSearch}&rdquo;</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredWorkflows.map((wf) => {
              const releaseCount = instances.filter((i) => i.workflowId === wf.id).length;
              return (
                <div
                  key={wf.id}
                  className="flex flex-col p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm transition-all group"
                >
                  {/* Icon + name + actions */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500">
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{wf.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Updated {formatRelative(wf.updatedAt)}
                      </div>
                    </div>

                    {/* Action icons */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {/* Info */}
                      <button
                        title="Schema details"
                        onClick={() => setSchemaDetailDialog(wf)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                        </svg>
                      </button>
                      {/* Edit / Rename */}
                      <button
                        title="Rename schema"
                        onClick={() => setSchemaRenameDialog({ id: wf.id, name: wf.name })}
                        className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </button>
                      {/* Delete */}
                      <button
                        title="Delete schema"
                        onClick={() => handleDeleteWorkflow(wf)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                      {releaseCount} release{releaseCount !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => setInstanceDialog(wf)}
                    className="mt-auto inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    New Release
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── Divider ──────────────────────────────────────────────── */}
      <hr className="border-slate-200" />

      {/* ─── Section 2: Workflow Releases ───────────────────────────── */}
      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-slate-800">Workflow Releases</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {instances.length} workflow release{instances.length !== 1 ? 's' : ''} &mdash; click to open in sandbox
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={releaseSearch}
            onChange={(e) => setReleaseSearch(e.target.value)}
            placeholder="Search workflow releases..."
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white placeholder-slate-400"
          />
          {releaseSearch && (
            <button onClick={() => setReleaseSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {instances.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
            <div className="text-slate-400 text-sm mb-2">No workflow releases yet</div>
            <p className="text-xs text-slate-400">
              Click <span className="font-medium text-green-600">New Release</span> on a schema above to create one.
            </p>
          </div>
        ) : filteredInstances.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
            <div className="text-slate-400 text-sm">No workflow releases matching &ldquo;{releaseSearch}&rdquo;</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredInstances.map((inst) => {
              const isActive = inst.id === activeInstanceId;
              const st = STATUS_STYLES[inst.status] ?? STATUS_STYLES.idle;
              return (
                <div
                  key={inst.id}
                  onClick={() => navigate(`/instance/${encodeURIComponent(inst.id)}`)}
                  className={`text-left flex flex-col p-4 rounded-xl border transition-all group cursor-pointer ${
                    isActive
                      ? 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 hover:shadow-sm'
                      : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                  }`}
                >
                  {/* Icon + name + actions */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500'
                    }`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{inst.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        from <span className="font-medium text-slate-500">{inst.workflowName}</span>
                      </div>
                    </div>

                    {/* Action icons */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {/* Info */}
                      <button
                        title="Release details"
                        onClick={(e) => { e.stopPropagation(); setDetailDialog(inst); }}
                        className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                        </svg>
                      </button>
                      {/* Edit / Rename */}
                      <button
                        title="Rename release"
                        onClick={(e) => { e.stopPropagation(); setRenameDialog({ id: inst.id, name: inst.name }); }}
                        className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </button>
                      {/* Delete */}
                      <button
                        title="Delete release"
                        onClick={(e) => { e.stopPropagation(); handleDeleteInstance(inst); }}
                        className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {isActive && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600 font-medium">
                        active
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${st.bg} ${st.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {inst.status}
                    </span>
                  </div>

                  {/* Timestamp */}
                  <div className="text-[11px] text-slate-400 mt-auto">
                    {formatRelative(inst.createdAt)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Instance creation dialog */}
      {instanceDialog && (
        <NewInstanceDialog
          workflow={instanceDialog}
          onClose={() => setInstanceDialog(null)}
          onConfirm={handleCreateInstance}
        />
      )}

      {/* Rename dialog */}
      {renameDialog && (
        <RenameInstanceDialog
          initial={renameDialog}
          onClose={() => setRenameDialog(null)}
          onConfirm={async (newName) => {
            await renameInstance(renameDialog.id, newName);
            setRenameDialog(null);
          }}
        />
      )}

      {/* Detail / info dialog */}
      {detailDialog && (
        <InstanceDetailDialog
          instance={detailDialog}
          onClose={() => setDetailDialog(null)}
          onOpen={() => {
            setDetailDialog(null);
            navigate(`/instance/${encodeURIComponent(detailDialog.id)}`);
          }}
        />
      )}

      {/* Schema rename dialog */}
      {schemaRenameDialog && (
        <RenameSchemaDialog
          initial={schemaRenameDialog}
          onClose={() => setSchemaRenameDialog(null)}
          onConfirm={async (newName) => {
            await renameWorkflow(schemaRenameDialog.id, newName);
            setSchemaRenameDialog(null);
          }}
        />
      )}

      {/* Schema detail dialog */}
      {schemaDetailDialog && (
        <SchemaDetailDialog
          workflow={schemaDetailDialog}
          releaseCount={instances.filter((i) => i.workflowId === schemaDetailDialog.id).length}
          onClose={() => setSchemaDetailDialog(null)}
          onOpen={() => {
            setSchemaDetailDialog(null);
            navigate(`/schemas`);
          }}
        />
      )}
    </div>
  );
}


// ─── Workflow Deployments — placeholder ───────────────────────────────────────
function WorkflowDeploymentsPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.732-3.558" />
        </svg>
      </div>
      <h2 className="text-sm font-semibold text-slate-700 mb-1">Workflow Deployments</h2>
      <p className="text-xs text-slate-400 max-w-sm">
        Deploy workflow releases to live environments. This feature is coming soon.
      </p>
    </div>
  );
}

// ─── Workflow Spec — lists all spec/template definitions ─────────────────────
function WorkflowSpecTab() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-base font-semibold text-slate-800">Workflow Specs</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {PRESET_TEMPLATES.length} spec{PRESET_TEMPLATES.length !== 1 ? 's' : ''} defined in templates.js
        </p>
      </div>

      <div className="space-y-2">
        {PRESET_TEMPLATES.map((preset) => {
          const t = preset.template;
          const isExpanded = expandedId === preset.id;
          const nodeCount = t.nodes?.length ?? 0;
          const edgeCount = t.edges?.length ?? 0;
          const conditionKeys = Object.keys(t.conditions ?? {});
          const interruptBefore = t.config?.interruptBefore ?? [];
          const interruptAfter = t.config?.interruptAfter ?? [];

          return (
            <div key={preset.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              {/* Header row */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : preset.id)}
                className="w-full text-left flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-violet-100 text-violet-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800">{preset.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{preset.description}</div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{nodeCount} nodes</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{edgeCount} edges</span>
                    {conditionKeys.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600">{conditionKeys.length} condition{conditionKeys.length !== 1 ? 's' : ''}</span>
                    )}
                    {interruptBefore.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">interrupt-before: {interruptBefore.length}</span>
                    )}
                    {interruptAfter.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-600">interrupt-after: {interruptAfter.length}</span>
                    )}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-mono">{preset.id}</span>
                  </div>
                </div>
                <svg className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-slate-100 space-y-4">
                  {/* Config */}
                  <div className="pt-4">
                    <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Config</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      <div className="px-3 py-2 rounded-lg bg-slate-50">
                        <span className="text-slate-400">Entry Point</span>
                        <div className="font-medium text-slate-700 font-mono mt-0.5">{t.config?.entryPoint ?? '—'}</div>
                      </div>
                      <div className="px-3 py-2 rounded-lg bg-slate-50">
                        <span className="text-slate-400">Max Iterations</span>
                        <div className="font-medium text-slate-700 mt-0.5">{t.config?.maxIterations ?? '—'}</div>
                      </div>
                      <div className="px-3 py-2 rounded-lg bg-slate-50">
                        <span className="text-slate-400">State Fields</span>
                        <div className="font-medium text-slate-700 font-mono mt-0.5">{Object.keys(t.state ?? {}).join(', ') || '—'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Nodes */}
                  <div>
                    <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Nodes</h4>
                    <div className="space-y-1">
                      {(t.nodes ?? []).map((node) => (
                        <div key={node.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50">
                          <span
                            className="w-6 h-6 rounded flex items-center justify-center text-xs shrink-0"
                            style={{ backgroundColor: node.data?.style?.bgColor ?? '#f8fafc', color: node.data?.style?.textColor ?? '#475569', border: `1px solid ${node.data?.style?.borderColor ?? '#e2e8f0'}` }}
                          >
                            {node.data?.icon ?? '?'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium text-slate-700">{node.data?.label ?? node.id}</span>
                            <span className="text-[10px] text-slate-400 ml-2 font-mono">{node.id}</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500">{node.data?.category ?? '—'}</span>
                          {node.data?.handler && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-mono">{node.data.handler}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Edges */}
                  <div>
                    <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Edges</h4>
                    <div className="space-y-1">
                      {(t.edges ?? []).map((edge) => (
                        <div key={edge.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 text-xs">
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
                  {conditionKeys.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Conditions</h4>
                      <div className="space-y-1">
                        {conditionKeys.map((key) => {
                          const c = t.conditions[key];
                          return (
                            <div key={key} className="px-3 py-2 rounded-lg bg-slate-50 text-xs">
                              <span className="font-mono font-medium text-slate-700">{key}</span>
                              <span className="text-slate-400 ml-2">
                                {c.field} {c.operator} {c.value} ? <span className="text-green-600">{c.trueResult}</span> : <span className="text-blue-600">{c.falseResult}</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Action */}
                  <div className="pt-2">
                    <button
                      onClick={() => navigate(`/workflow-template/review/${preset.id}?name=${encodeURIComponent(preset.label)}`)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                      Review &amp; Create Schema
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Dashboard — overview with recent items from all sections ────────────────
function DashboardView() {
  const navigate = useNavigate();
  const workflows = useWorkflowStore((s) => s.workflows);
  const instances = useWorkflowStore((s) => s.instances);
  const createInstance = useWorkflowStore((s) => s.createInstance);
  const loading = useWorkflowStore((s) => s.loading);
  const checkpoints = useGraphStore((s) => s.checkpoints);
  const loadCheckpoints = useGraphStore((s) => s.loadCheckpoints);
  const loadGraphDef = useGraphStore((s) => s.loadGraphDef);
  const reset = useGraphStore((s) => s.reset);

  const [releaseDialog, setReleaseDialog] = useState(null); // workflow entry or null

  useEffect(() => { loadCheckpoints(); }, [loadCheckpoints]);

  const recentWorkflows = useMemo(
    () => [...workflows].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5),
    [workflows],
  );
  const recentInstances = useMemo(
    () => [...instances].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5),
    [instances],
  );

  const handleCreateRelease = async (workflowId, releaseName) => {
    try {
      const id = await createInstance(workflowId, releaseName);
      reset();
      await loadGraphDef({ force: true });
      setReleaseDialog(null);
      navigate(`/instance/${encodeURIComponent(id)}`);
    } catch (err) {
      alert(err.message);
    }
  };

  // Group checkpoints by threadId to count sessions
  const sessionCount = useMemo(() => {
    const threads = new Set();
    for (const cp of checkpoints) threads.add(cp.threadId);
    return threads.size;
  }, [checkpoints]);

  if (loading) {
    return <div className="text-xs text-slate-400 text-center py-12">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* ─── Summary cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Schemas', count: workflows.length, path: '/schemas', countCls: 'text-indigo-600', hoverCls: 'hover:border-indigo-300' },
          { label: 'Releases', count: instances.length, path: '/release', countCls: 'text-green-600', hoverCls: 'hover:border-green-300' },
          { label: 'Sessions', count: sessionCount, path: '/session', countCls: 'text-amber-600', hoverCls: 'hover:border-amber-300' },
        ].map((card) => (
          <button
            key={card.label}
            onClick={() => navigate(card.path)}
            className={`text-left p-4 rounded-xl border border-slate-200 bg-white ${card.hoverCls} hover:shadow-sm transition-all group`}
          >
            <div className={`text-2xl font-bold ${card.countCls}`}>{card.count}</div>
            <div className="text-xs text-slate-500 mt-1 group-hover:text-slate-700">{card.label}</div>
          </button>
        ))}
      </div>

      {/* ─── Recent Workflows ───────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-800">Recent Schemas</h2>
          <button onClick={() => navigate('/schemas')} className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium">
            View all &rarr;
          </button>
        </div>
        {recentWorkflows.length === 0 ? (
          <div className="text-xs text-slate-400 py-4 text-center border border-dashed border-slate-200 rounded-lg">
            No schemas yet &mdash; create one from a template
          </div>
        ) : (
          <div className="space-y-1">
            {recentWorkflows.map((wf) => (
              <div
                key={wf.id}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-slate-800 truncate block">{wf.name}</span>
                  <span className="text-[11px] text-slate-400">Updated {formatRelative(wf.updatedAt)}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => navigate(`/workflow-contract/${encodeURIComponent(wf.id)}`)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="Edit Contract"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setReleaseDialog(wf)}
                    className="text-[11px] px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors font-medium"
                    title="Create a new release from this schema"
                  >
                    New Release
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Recent Releases ────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-800">Recent Releases</h2>
          <button onClick={() => navigate('/release')} className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium">
            View all &rarr;
          </button>
        </div>
        {recentInstances.length === 0 ? (
          <div className="text-xs text-slate-400 py-4 text-center border border-dashed border-slate-200 rounded-lg">
            No releases yet
          </div>
        ) : (
          <div className="space-y-1">
            {recentInstances.map((inst) => {
              const st = STATUS_STYLES[inst.status] ?? STATUS_STYLES.idle;
              return (
                <button
                  key={inst.id}
                  onClick={() => navigate(`/instance/${encodeURIComponent(inst.id)}`)}
                  className="w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-green-100 text-green-500">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-800 truncate">{inst.name}</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${st.bg} ${st.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {inst.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      from <span className="font-medium text-slate-500">{inst.workflowName}</span>
                      {' '}&middot; {formatRelative(inst.createdAt)}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── Sessions summary ───────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-800">Sessions</h2>
          <button onClick={() => navigate('/session')} className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium">
            View all &rarr;
          </button>
        </div>
        <button
          onClick={() => navigate('/session')}
          className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 bg-white hover:border-amber-300 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-amber-100 text-amber-500">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-800">
                {sessionCount} session{sessionCount !== 1 ? 's' : ''} &middot; {checkpoints.length} checkpoint{checkpoints.length !== 1 ? 's' : ''}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">View session history and replay executions</div>
            </div>
            <svg className="w-4 h-4 text-slate-300 group-hover:text-amber-400 shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </button>
      </section>

      {/* Release creation dialog */}
      {releaseDialog && (
        <NewInstanceDialog
          workflow={releaseDialog}
          onClose={() => setReleaseDialog(null)}
          onConfirm={handleCreateRelease}
        />
      )}
    </div>
  );
}


export default function App() {
  const location = useLocation();
  const activeTab = pathToTabId[location.pathname] ?? 'dashboard';

  return (
    <>
      {activeTab === 'dashboard' && (
        <div className="flex-1 overflow-auto">
          <DashboardView />
        </div>
      )}
      {activeTab === 'deployments' && (
        <div className="flex-1 overflow-auto">
          <WorkflowDeploymentsPlaceholder />
        </div>
      )}
      {activeTab === 'release' && (
        <div className="flex-1 overflow-auto">
          <PreviewWorkflowTab />
        </div>
      )}
      {activeTab === 'schemas' && (
        <div className="flex-1 overflow-hidden">
          <WorkflowManager />
        </div>
      )}
      {activeTab === 'session' && (
        <div className="flex-1 overflow-hidden">
          <SessionView />
        </div>
      )}
      {activeTab === 'specs' && (
        <div className="flex-1 overflow-auto">
          <WorkflowSpecTab />
        </div>
      )}
    </>
  );
}
