import { useGraphStore } from '../store/useGraphStore.js';
import { t } from '../graph/g11n.js';
import { RenderIcon } from './LucideIconPicker.jsx';

export default function NodeInspector() {
  const inspectedNodeId = useGraphStore((s) => s.inspectedNodeId);
  const setInspectedNodeId = useGraphStore((s) => s.setInspectedNodeId);
  const graphDef = useGraphStore((s) => s.graphDef);
  const iterations = useGraphStore((s) => s.iterations);
  const activeNodeId = useGraphStore((s) => s.activeNodeId);
  const error = useGraphStore((s) => s.error);

  if (!inspectedNodeId || !graphDef) return null;

  const nodeDef = graphDef.nodes.find((n) => n.id === inspectedNodeId);
  if (!nodeDef) return null;

  const { data } = nodeDef;
  const style = data.style ?? {};
  const isActive = inspectedNodeId === activeNodeId;

  // Get iterations for this node
  const nodeIterations = iterations.filter((it) => it.stage === inspectedNodeId);

  // Get connected edges
  const incomingEdges = graphDef.edges.filter((e) => e.target === inspectedNodeId);
  const outgoingEdges = graphDef.edges.filter((e) => e.source === inspectedNodeId);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end" onClick={() => setInspectedNodeId(null)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Drawer */}
      <div
        className="relative w-[440px] max-w-[90vw] h-full bg-white border-l border-slate-200 shadow-xl overflow-y-auto animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center gap-3 px-5 py-4 border-b"
          style={{ backgroundColor: style.bgColor, borderColor: style.borderColor }}
        >
          <RenderIcon name={data.icon} size={24} />
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold" style={{ color: style.textColor }}>
              {data.label ?? inspectedNodeId}
            </h2>
            <span className="text-xs" style={{ color: style.accentColor }}>
              {inspectedNodeId}
            </span>
          </div>
          {isActive && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 font-medium">
              {t(graphDef, 'inspectorActive')}
            </span>
          )}
          <button
            onClick={() => setInspectedNodeId(null)}
            className="p-1.5 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Node Configuration */}
          <Section title={t(graphDef, 'inspectorConfiguration')}>
            <PropRow label={t(graphDef, 'inspectorType')} value={data.nodeType} />
            <PropRow label={t(graphDef, 'inspectorCategory')} value={data.category} />
            {data.handler && <PropRow label={t(graphDef, 'inspectorHandler')} value={data.handler} mono />}
            <PropRow label={t(graphDef, 'inspectorHandlesIn')} value={(data.handles?.targets ?? []).join(', ') || 'none'} />
            <PropRow label={t(graphDef, 'inspectorHandlesOut')} value={(data.handles?.sources ?? []).join(', ') || 'none'} />
          </Section>

          {/* Connections */}
          <Section title={t(graphDef, 'inspectorConnections')}>
            {incomingEdges.length === 0 && outgoingEdges.length === 0 && (
              <p className="text-xs text-slate-400 italic">{t(graphDef, 'inspectorNoConnections')}</p>
            )}
            {incomingEdges.map((e) => (
              <div key={e.id} className="flex items-center gap-2 text-xs text-slate-600">
                <span className="text-slate-400">←</span>
                <span className="font-mono">{e.source}</span>
                {e.data?.label && (
                  <span className="ml-auto text-slate-400 truncate max-w-[160px]">{e.data.label}</span>
                )}
              </div>
            ))}
            {outgoingEdges.map((e) => (
              <div key={e.id} className="flex items-center gap-2 text-xs text-slate-600">
                <span className="text-slate-400">→</span>
                <span className="font-mono">{e.target}</span>
                {e.data?.label && (
                  <span className="ml-auto text-slate-400 truncate max-w-[160px]">{e.data.label}</span>
                )}
              </div>
            ))}
          </Section>

          {/* Style / LLM Config */}
          <Section title={t(graphDef, 'inspectorStyleConfig')}>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(style).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">{key}:</span>
                  {typeof val === 'string' && val.startsWith('#') ? (
                    <span className="flex items-center gap-1">
                      <span
                        className="inline-block w-3 h-3 rounded border border-slate-200"
                        style={{ backgroundColor: val }}
                      />
                      <span className="font-mono text-slate-600">{val}</span>
                    </span>
                  ) : (
                    <span className="font-mono text-slate-600">{val}</span>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* Iteration Output / Payload */}
          {nodeIterations.length > 0 && (
            <Section title={t(graphDef, 'inspectorOutputTitle', { count: nodeIterations.length })}>
              {nodeIterations.map((it, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-200">
                    <span className="text-xs font-medium text-slate-600">
                      {it.iteration != null ? t(graphDef, 'inspectorIterationLabel', { number: it.iteration }) : t(graphDef, 'inspectorEntryLabel', { number: idx + 1 })}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(it.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="p-3 text-xs text-slate-600 font-mono whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto">
                    {it.content}
                  </pre>
                </div>
              ))}
            </Section>
          )}

          {/* Error Log */}
          {error && isActive && (
            <Section title={t(graphDef, 'inspectorError')}>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 font-mono whitespace-pre-wrap">
                {error}
              </div>
            </Section>
          )}

          {/* g11n Overrides */}
          {data.g11n && (
            <Section title={t(graphDef, 'inspectorG11nOverrides')}>
              <pre className="text-xs text-slate-600 font-mono whitespace-pre-wrap bg-slate-50 rounded-lg p-3 border border-slate-200">
                {JSON.stringify(data.g11n, null, 2)}
              </pre>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function PropRow({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <span className={`text-slate-700 ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</span>
    </div>
  );
}
