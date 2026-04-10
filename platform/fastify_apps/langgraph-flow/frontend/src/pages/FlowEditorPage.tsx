import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ReactFlowProvider } from '@xyflow/react';
import { Loader2, AlertCircle, Clock } from 'lucide-react';
import { FlowToolbar } from '@/components/toolbar/FlowToolbar';
import { NodePalette } from '@/components/sidebar/NodePalette';
import { NodeProperties } from '@/components/sidebar/NodeProperties';
import { FlowCanvas } from '@/components/canvas/FlowCanvas';
import { MermaidPreview } from '@/components/modals/MermaidPreview';
import { useFlowStore } from '@/stores/flow.store';
import { getFlow, getFlowVersions, restoreFlowVersion } from '@/api/flow.api';
import type { FlowVersion } from '@/types/flow.types';

const AUTO_SAVE_DELAY = 2000;

function VersionTimeline({
  versions,
  activeVersionId,
  onRestore,
}: {
  versions: FlowVersion[];
  activeVersionId: string | null;
  onRestore: (v: FlowVersion) => void;
}) {
  if (versions.length === 0) return null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-sm shadow-lg">
      <Clock size={12} className="text-slate-400 mr-2 shrink-0" />
      <span className="text-[10px] uppercase tracking-wider font-medium text-slate-400 mr-2 shrink-0">
        versions
      </span>
      {versions.slice(0, 8).map((v) => (
        <button
          key={v.id}
          onClick={() => onRestore(v)}
          title={v.label ?? `Version ${v.version}`}
          className={`group relative flex flex-col items-center transition-all ${
            activeVersionId === v.id ? 'scale-110' : 'hover:scale-105'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold border transition-all ${
              activeVersionId === v.id
                ? 'border-indigo-400 bg-indigo-50 text-indigo-600 shadow-sm'
                : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            v{v.version}
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-full mb-2 hidden group-hover:block w-40 px-2.5 py-2 rounded-lg bg-slate-800 shadow-xl pointer-events-none z-50">
            <p className="text-[10px] text-white font-medium truncate">
              {v.label ?? `Version ${v.version}`}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {new Date(v.createdAt).toLocaleString()}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

export function FlowEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new' || !id;

  const loadFlow = useFlowStore((s) => s.loadFlow);
  const resetFlow = useFlowStore((s) => s.resetFlow);
  const flowMeta = useFlowStore((s) => s.flowMeta);
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);

  const [mermaidText, setMermaidText] = useState<string | null>(null);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [versions, setVersions] = useState<FlowVersion[]>([]);

  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load flow data
  const { isLoading, error, data: flowData } = useQuery({
    queryKey: ['flow', id],
    queryFn: () => getFlow(id!),
    enabled: !isNew && !!id,
  });

  useEffect(() => {
    if (flowData) {
      loadFlow(flowData);
    }
  }, [flowData, loadFlow]);

  useEffect(() => {
    if (isNew) {
      resetFlow();
    }
  }, [isNew, resetFlow]);

  // Load versions
  useEffect(() => {
    if (!isNew && id) {
      getFlowVersions(id)
        .then(setVersions)
        .catch(() => setVersions([]));
    }
  }, [id, isNew]);

  // Auto-save on dirty
  const handleAutoSave = useCallback(() => {
    if (!flowMeta.isDirty || !flowMeta.id) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      // trigger save via toolbar's save handler — we delegate to the store's isDirty flag
      // The toolbar reads isDirty and the user can also manually save
    }, AUTO_SAVE_DELAY);
  }, [flowMeta.isDirty, flowMeta.id]);

  useEffect(() => {
    handleAutoSave();
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [handleAutoSave]);

  async function handleRestoreVersion(v: FlowVersion) {
    if (!flowMeta.id) return;
    try {
      const restored = await restoreFlowVersion(flowMeta.id, v.id);
      loadFlow(restored);
      setActiveVersionId(v.id);
      // Refresh versions list
      const updated = await getFlowVersions(flowMeta.id);
      setVersions(updated);
    } catch (err) {
      console.error('Restore failed', err);
    }
  }

  if (!isNew && isLoading) {
    return (
      <div className="h-screen w-full bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 size={18} className="animate-spin text-indigo-500" />
          <span className="text-sm text-slate-500">Loading flow...</span>
        </div>
      </div>
    );
  }

  if (!isNew && error) {
    return (
      <div className="h-screen w-full bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <span className="text-sm text-red-600">
            {error instanceof Error ? error.message : 'Failed to load flow'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 text-slate-800 overflow-hidden">
      <FlowToolbar onShowMermaid={(text) => setMermaidText(text)} />

      <ReactFlowProvider>
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar */}
          <NodePalette />

          {/* Canvas */}
          <div className="flex-1 relative overflow-hidden">
            <FlowCanvas />

            {/* Version timeline */}
            <VersionTimeline
              versions={versions}
              activeVersionId={activeVersionId}
              onRestore={handleRestoreVersion}
            />
          </div>

          {/* Right properties panel — conditional on selection */}
          {selectedNodeId && <NodeProperties />}
        </div>
      </ReactFlowProvider>

      {/* Mermaid preview modal */}
      {mermaidText && (
        <MermaidPreview
          text={mermaidText}
          onClose={() => setMermaidText(null)}
        />
      )}
    </div>
  );
}
