import { useRef, useState, type ChangeEvent } from 'react';
import { Save, Upload, Download, Plus, Minus, CheckCircle, Circle, LayoutGrid } from 'lucide-react';
import { useFlowStore } from '@/stores/flow.store';
import { updateFlow, importFlow, exportFlow } from '@/api/flow.api';
import type { AINode, AIEdge } from '@/types/flow.types';

interface FlowToolbarProps {
  onShowMermaid: (text: string) => void;
}

export function FlowToolbar({ onShowMermaid }: FlowToolbarProps) {
  const flowMeta = useFlowStore((s) => s.flowMeta);
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const viewport = useFlowStore((s) => s.viewport);
  const setFlowMeta = useFlowStore((s) => s.setFlowMeta);
  const loadFlow = useFlowStore((s) => s.loadFlow);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState('native');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSave() {
    if (!flowMeta.id) return;
    setSaving(true);
    setSaveError(null);
    try {
      const aiNodes: AINode[] = nodes.map((n) => ({
        id: n.id,
        type: n.type ?? 'customNode',
        position: n.position,
        data: n.data as AINode['data'],
      }));
      const aiEdges: AIEdge[] = edges.map((e) => ({
        id: e.id,
        source: e.source,
        sourceHandle: e.sourceHandle ?? 'out',
        target: e.target,
        targetHandle: e.targetHandle ?? 'in',
        type: e.type,
      }));
      const updated = await updateFlow(flowMeta.id, {
        name: flowMeta.name,
        description: flowMeta.description,
        sourceFormat: flowMeta.sourceFormat,
        flowData: {
          name: flowMeta.name,
          nodes: aiNodes,
          edges: aiEdges,
          viewport,
        },
      });
      setFlowMeta({ id: updated.id, name: updated.name, isDirty: false });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const result = await importFlow(text, 'native');
      loadFlow(result);
    } catch (err) {
      console.error('Import error', err);
    }
    e.target.value = '';
  }

  async function handleExport() {
    if (!flowMeta.id) return;
    try {
      const result = await exportFlow(flowMeta.id, exportFormat);
      if (exportFormat === 'mermaid' && typeof result === 'string') {
        onShowMermaid(result);
        return;
      }
      const blob = new Blob(
        [typeof result === 'string' ? result : JSON.stringify(result, null, 2)],
        { type: 'application/json' },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${flowMeta.name ?? 'flow'}-${exportFormat}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error', err);
    }
  }

  const zoom = Math.round(viewport.zoom * 100);

  return (
    <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 bg-white z-50 shrink-0 shadow-sm">
      {/* Left — logo + name */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-[10px] font-bold text-white">LG</span>
        </div>
        <input
          value={flowMeta.name}
          onChange={(e) => setFlowMeta({ name: e.target.value, isDirty: true })}
          className="bg-transparent text-sm font-semibold text-slate-800 outline-none border-b border-transparent hover:border-slate-300 focus:border-indigo-400 transition-colors px-1 min-w-0"
          style={{ width: Math.max(120, flowMeta.name.length * 8 + 16) }}
          placeholder="Flow name"
        />

        {/* Save status */}
        <div className="flex items-center gap-1.5">
          {flowMeta.isDirty ? (
            <Circle size={8} className="text-amber-500" />
          ) : (
            <CheckCircle size={8} className="text-emerald-500" />
          )}
          <span className={`text-xs ${flowMeta.isDirty ? 'text-amber-500' : 'text-emerald-500'}`}>
            {flowMeta.isDirty ? 'unsaved' : 'saved'}
          </span>
        </div>
      </div>

      {/* Right — controls */}
      <div className="flex items-center gap-2">
        {/* Node / edge count */}
        <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-xs text-slate-500">
            <span className="font-semibold text-indigo-500">{nodes.length}</span> nodes
          </span>
          <span className="text-xs text-slate-500">
            <span className="font-semibold text-amber-500">{edges.length}</span> edges
          </span>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
          <button
            onClick={() => {
              /* handled by ReactFlow Controls */
            }}
            className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors"
            aria-label="Zoom out"
          >
            <Minus size={12} />
          </button>
          <span className="text-xs text-slate-500 w-10 text-center font-medium">
            {zoom}%
          </span>
          <button
            onClick={() => {
              /* handled by ReactFlow Controls */
            }}
            className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors"
            aria-label="Zoom in"
          >
            <Plus size={12} />
          </button>
        </div>

        {/* Auto-layout */}
        <button
          onClick={() => useFlowStore.getState().autoLayout()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors text-xs font-medium"
          title="Auto-layout nodes"
        >
          <LayoutGrid size={12} />
          <span className="hidden sm:inline">Layout</span>
        </button>

        {/* Import */}
        <button
          onClick={handleImportClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors text-xs font-medium"
          title="Import flow JSON"
        >
          <Upload size={12} />
          <span className="hidden sm:inline">Import</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Export */}
        <div className="flex items-center">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-l-lg px-2.5 py-1.5 text-slate-600 outline-none cursor-pointer border-r-0"
          >
            <option value="native">Native</option>
            <option value="flowise">Flowise</option>
            <option value="langflow">Langflow</option>
            <option value="mermaid">Mermaid</option>
          </select>
          <button
            onClick={handleExport}
            disabled={!flowMeta.id}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-r-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            title="Export flow"
          >
            <Download size={12} />
          </button>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || !flowMeta.id}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors text-xs font-medium shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Save size={12} />
          {saving ? 'Saving...' : 'Save'}
        </button>

        {saveError && (
          <span className="text-xs text-red-500 max-w-32 truncate" title={saveError}>
            {saveError}
          </span>
        )}
      </div>
    </div>
  );
}
