import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflowStore } from '../store/useWorkflowStore.js';
import { useGraphStore } from '../store/useGraphStore.js';

function formatDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function PresetCard({ preset, selected, onSelect }) {
  const isSelected = selected === preset.id;
  return (
    <button
      onClick={() => onSelect(preset.id)}
      className={`text-left w-full p-3 rounded-lg border transition-colors group ${
        isSelected
          ? 'border-indigo-400 bg-indigo-50 ring-1 ring-indigo-300'
          : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
      }`}
    >
      <div className={`text-sm font-medium ${isSelected ? 'text-indigo-700' : 'text-slate-800 group-hover:text-indigo-700'}`}>
        {preset.label}
      </div>
      <div className="text-xs text-slate-500 mt-0.5">{preset.description}</div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
          {preset.template.nodes.length} nodes
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
          {preset.template.edges.length} edges
        </span>
        {preset.template.config.interruptBefore?.length > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600">
            feedback loop
          </span>
        )}
      </div>
    </button>
  );
}

function WorkflowListItem({ workflow, isActive, onActivate, onDuplicate, onRename, onDelete, onCreateInstance, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(workflow.name);
  const [showInstanceDialog, setShowInstanceDialog] = useState(false);
  const [instanceName, setInstanceName] = useState('');

  const handleRename = () => {
    if (name.trim() && name !== workflow.name) {
      onRename(workflow.id, name.trim());
    }
    setEditing(false);
  };

  const handleCreateInstance = () => {
    if (!instanceName.trim()) return;
    onCreateInstance(workflow.id, instanceName.trim());
    setShowInstanceDialog(false);
    setInstanceName('');
  };

  return (
    <div
      className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${
        isActive
          ? 'border-indigo-300 bg-indigo-50/60'
          : 'border-slate-200 hover:border-slate-300 bg-white'
      }`}
    >
      {/* Name / edit */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            className="w-full text-sm bg-white border border-slate-200 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        ) : (
          <div
            className="text-sm font-medium text-slate-800 truncate cursor-pointer"
            onDoubleClick={() => setEditing(true)}
            title="Double-click to rename"
          >
            {workflow.name}
            {isActive && (
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600 font-medium">
                active
              </span>
            )}
          </div>
        )}
        <div className="text-[11px] text-slate-400 mt-0.5">
          {formatDate(workflow.updatedAt)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => {
            setInstanceName(`${workflow.name} — Run ${Date.now().toString(36).slice(-4)}`);
            setShowInstanceDialog(true);
          }}
          className="text-[11px] px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors font-medium"
          title="Create a new release from this schema"
        >
          New Release
        </button>
        {!isActive && (
          <button
            onClick={() => onActivate(workflow.id)}
            className="text-[11px] px-2 py-1 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors font-medium"
            title="Preview this schema"
          >
            Preview
          </button>
        )}
        <button
          onClick={() => onEdit(workflow.id)}
          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          title="View Contract"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </button>
        <button
          onClick={() => onDuplicate(workflow.id)}
          className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Duplicate"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5" />
          </svg>
        </button>
        <button
          onClick={() => {
            if (confirm(`Delete "${workflow.name}"?`)) onDelete(workflow.id);
          }}
          className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </div>

      {/* Instance name dialog */}
      {showInstanceDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowInstanceDialog(false)}>
          <div
            className="bg-white rounded-xl shadow-xl border border-slate-200 w-96 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-slate-800 mb-1">New Release</h3>
            <p className="text-xs text-slate-500 mb-3">
              Create a sandbox release from <span className="font-medium text-slate-700">{workflow.name}</span>
            </p>
            <label className="block text-xs font-medium text-slate-600 mb-1">Release Name</label>
            <input
              autoFocus
              type="text"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateInstance()}
              placeholder="e.g. Sprint 42 run"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white placeholder-slate-400"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowInstanceDialog(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateInstance}
                disabled={!instanceName.trim()}
                className="px-4 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Create Release
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkflowManager() {
  const {
    workflows, activeWorkflowId, loading,
    loadWorkflows, createFromPreset, duplicateWorkflow,
    renameWorkflow, deleteWorkflow, setActiveWorkflow, getPresets,
    createInstance,
  } = useWorkflowStore();

  const loadGraphDef = useGraphStore((s) => s.loadGraphDef);
  const reset = useGraphStore((s) => s.reset);
  const navigate = useNavigate();

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [customName, setCustomName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const presets = getPresets();

  const handleSelectPreset = (presetId) => {
    setShowNewDialog(false);
    const name = customName.trim();
    setCustomName('');
    setSelectedPreset(null);
    navigate(`/workflow-template/review/${encodeURIComponent(presetId)}?name=${encodeURIComponent(name)}`);
  };

  const handleDialogClose = () => {
    setShowNewDialog(false);
    setCustomName('');
    setSelectedPreset(null);
  };

  const handleActivate = async (id) => {
    try {
      await setActiveWorkflow(id);
      reset();
      await loadGraphDef({ force: true });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await duplicateWorkflow(id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteWorkflow(id);
      if (activeWorkflowId === id) {
        await loadGraphDef({ force: true });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (id) => {
    navigate(`/workflow-contract/${encodeURIComponent(id)}`);
  };

  const handleCreateInstance = async (workflowId, instanceName) => {
    try {
      const instanceId = await createInstance(workflowId, instanceName);
      reset();
      await loadGraphDef({ force: true });
      navigate(`/instance/${encodeURIComponent(instanceId)}`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-4 h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Schemas</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {workflows.length} schema{workflows.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <button
          onClick={() => setShowNewDialog(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Schema
        </button>
      </div>

      {/* Schema list */}
      {loading ? (
        <div className="text-xs text-slate-400 text-center py-8">Loading...</div>
      ) : workflows.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
          <div className="text-slate-400 text-sm mb-2">No schemas yet</div>
          <p className="text-xs text-slate-400 mb-3">Create one from a spec to get started</p>
          <button
            onClick={() => setShowNewDialog(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Create Schema
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {workflows.map((wf) => (
            <WorkflowListItem
              key={wf.id}
              workflow={wf}
              isActive={wf.id === activeWorkflowId}
              onActivate={handleActivate}
              onDuplicate={handleDuplicate}
              onRename={renameWorkflow}
              onDelete={handleDelete}
              onCreateInstance={handleCreateInstance}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* New schema dialog — name + spec pick only */}
      {showNewDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={handleDialogClose}>
          <div
            className="bg-white rounded-xl shadow-xl border border-slate-200 w-[28rem] max-h-[80vh] overflow-auto p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">New Workflow Schema</h3>
              <button onClick={handleDialogClose} className="text-slate-400 hover:text-slate-600 text-lg leading-none">&times;</button>
            </div>

            {/* Schema name (required) */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter schema name"
                className={`w-full bg-slate-50 text-sm text-slate-700 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white placeholder-slate-400 ${
                  customName.trim() ? 'border-slate-200' : 'border-red-300'
                }`}
              />
              {!customName.trim() && (
                <p className="text-[11px] text-red-500 mt-1">Schema name is required</p>
              )}
            </div>

            {/* Spec selection — clicking navigates to /workflow-template/review */}
            <label className="block text-xs font-medium text-slate-600 mb-2">Choose a Spec</label>
            <div className={`space-y-2 ${!customName.trim() ? 'opacity-50 pointer-events-none' : ''}`}>
              {presets.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  selected={selectedPreset}
                  onSelect={handleSelectPreset}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
