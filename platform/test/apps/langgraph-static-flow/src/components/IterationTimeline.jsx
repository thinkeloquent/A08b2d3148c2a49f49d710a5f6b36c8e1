import { useState } from 'react';
import { useGraphStore } from '../store/useGraphStore.js';
import { resolveG11n, buildStageContext, t } from '../graph/g11n.js';

export default function IterationTimeline() {
  const iterations = useGraphStore((s) => s.iterations);
  const currentStage = useGraphStore((s) => s.currentStage);
  const graphDef = useGraphStore((s) => s.graphDef);
  const [expanded, setExpanded] = useState(null);

  if (iterations.length === 0 || !graphDef) return null;

  // Root-level g11n helpers (no node override needed for headings)
  const heading = resolveG11n(graphDef, null, 'timeline', 'heading');
  const eventsCount = resolveG11n(graphDef, null, 'timeline', 'eventsCount', { count: iterations.length });

  // Completion label — resolved from __end__ node (allows override)
  const endNodeDef = graphDef.nodes.find((n) => n.id === '__end__');
  const endCtx = buildStageContext(endNodeDef);
  const completeLabel = resolveG11n(graphDef, '__end__', 'timeline', 'completeLabel', endCtx);
  const completeIcon = resolveG11n(graphDef, '__end__', 'timeline', 'completeIcon', endCtx);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-700">{heading}</h2>
        <span className="text-xs text-slate-400">{eventsCount}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {iterations.map((it, idx) => {
          const nodeDef = graphDef.nodes.find((n) => n.id === it.stage);
          const style = nodeDef?.data?.style ?? {};
          const icon = nodeDef?.data?.icon ?? '?';
          const ctx = buildStageContext(nodeDef);
          const itemTitle = resolveG11n(graphDef, it.stage, 'timeline', 'itemTitle', ctx);
          const isExpanded = expanded === idx;

          return (
            <div
              key={idx}
              className="w-full text-left rounded-lg border p-3 transition-all"
              style={{
                backgroundColor: style.bgColor ?? '#f8fafc',
                borderColor: style.borderColor ?? '#e2e8f0',
              }}
            >
              <div className="flex items-center gap-2">
                <span>{icon}</span>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded"
                  style={{ color: style.textColor, backgroundColor: `${style.accentColor}18` }}
                >
                  {itemTitle}
                </span>
                {it.iteration && (
                  <span className="ml-auto text-xs text-slate-400">#{it.iteration}</span>
                )}
                <button
                  onClick={() => setExpanded(isExpanded ? null : idx)}
                  className="ml-auto flex items-center justify-center w-5 h-5 rounded hover:bg-black/5 transition-colors text-slate-400 hover:text-slate-600"
                  aria-label={isExpanded ? t(graphDef, 'timelineCollapse') : t(graphDef, 'timelineExpand')}
                >
                  <svg className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>

              {isExpanded && (
                <div className="mt-2 text-xs text-slate-600 whitespace-pre-wrap max-h-[300px] overflow-y-auto font-mono leading-relaxed animate-fade-in">
                  {it.content}
                </div>
              )}

              {!isExpanded && (
                <p className="mt-1 text-xs text-slate-400 truncate">
                  {it.content?.slice(0, 100)}...
                </p>
              )}
            </div>
          );
        })}

        {currentStage === 'end' && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
            <span className="text-green-700 text-sm font-medium">{completeIcon} {completeLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
