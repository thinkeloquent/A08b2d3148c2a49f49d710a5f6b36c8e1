import { Handle, Position } from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';
import { useGraphStore } from '../store/useGraphStore.js';
import { resolveG11n, buildStageContext } from '../graph/g11n.js';
import { RenderIcon } from '../components/LucideIconPicker.jsx';

const baseClasses =
  'rounded-xl border px-5 py-3 text-sm font-medium shadow-sm transition-all duration-300 min-w-[200px] text-center select-none';

/**
 * Single data-driven node component — renders any node from graph.json.
 *
 * All visual properties (label, icon, colors, handles) come from
 * the node's `data` object in the JSON definition.
 * All display text is resolved via g11n (node override → root default).
 */
export function CustomNode({ id, data }) {
  const activeNodeId = useGraphStore((s) => s.activeNodeId);
  const isPaused = useGraphStore((s) => s.isPaused);
  const isRunning = useGraphStore((s) => s.isRunning);
  const currentStage = useGraphStore((s) => s.currentStage);
  const graphDef = useGraphStore((s) => s.graphDef);
  const setInspectedNodeId = useGraphStore((s) => s.setInspectedNodeId);
  const stageHistory = useGraphStore((s) => s.stageHistory);
  const iterationCount = useGraphStore(
    useShallow((s) => s.iterations.filter((i) => i.stage === id).length),
  );

  const style = data.style ?? {};
  const handles = data.handles ?? {};

  // Determine active state — special cases for interactive/terminal nodes
  const isInteractive = data.category === 'Interaction';
  const isTerminal = data.nodeType === 'end';
  const isActive = isInteractive
    ? isPaused && activeNodeId === id
    : isTerminal
      ? currentStage === 'end'
      : activeNodeId === id;

  const _isStreaming = useGraphStore((s) => s._isStreaming);

  // Determine if this node has been visited (completed) or is pending.
  // Suppress visited checkmarks while streaming (intermediate states have
  // stale activeNodeId) and when the node is the current pause target.
  const isVisited = stageHistory.includes(id)
    && !isActive
    && !(isPaused && currentStage === id)
    && !_isStreaming;
  const isPending = isRunning && !isActive && !isVisited;

  // Resolve colors — use active variants when available and active
  const bgColor = isActive ? (style.activeBgColor ?? style.bgColor) : style.bgColor;
  const textColor = isActive ? (style.activeTextColor ?? style.textColor) : style.textColor;
  const borderColor = isActive ? (style.activeBorderColor ?? style.accentColor) : style.borderColor;

  // g11n — resolve node-level text with template context
  const nodeDef = graphDef?.nodes?.find((n) => n.id === id);
  const ctx = buildStageContext(nodeDef, { iterationCount });
  const iterationLabel = graphDef ? resolveG11n(graphDef, id, 'node', 'iterationLabel', ctx) : '';
  const waitingLabel = graphDef ? resolveG11n(graphDef, id, 'node', 'waitingLabel', ctx) : '';

  // Active processing (not paused, not terminal — actually doing work)
  const isProcessing = isActive && isRunning && !isPaused && !isTerminal;

  const handleClick = (e) => {
    e.stopPropagation();
    setInspectedNodeId(id);
  };

  return (
    <div
      onClick={handleClick}
      className={`${baseClasses} cursor-pointer hover:shadow-md ${
        isActive
          ? 'animate-pulse-glow scale-105 shadow-md ring-2'
          : isPending
            ? 'opacity-40 grayscale-[30%]'
            : isVisited
              ? 'opacity-90'
              : 'opacity-70'
      }`}
      style={{
        background: bgColor,
        borderColor,
        color: textColor,
        '--tw-ring-color': isActive ? `${style.accentColor}44` : undefined,
        boxShadow: isActive
          ? `0 0 20px ${style.accentColor}22, 0 1px 3px rgba(0,0,0,0.08)`
          : undefined,
      }}
    >
      {/* Target handles */}
      {(handles.targets ?? []).map((handleId) => (
        <Handle
          key={`target-${handleId}`}
          id={`${id}-${handleId}`}
          type="target"
          position={Position.Top}
          style={{ background: style.handleColor }}
        />
      ))}

      {/* Label + spinner */}
      <div className="flex items-center justify-center gap-2">
        {isProcessing ? (
          <span className="node-spinner" style={{ borderTopColor: style.accentColor }} />
        ) : (
          <RenderIcon name={data.icon} size={20} />
        )}
        <span>{data.label ?? id}</span>
      </div>

      {/* Contextual status badges — text from g11n */}
      {data.nodeType === 'generate' && iterationCount > 0 && (
        <div className="mt-1 text-xs" style={{ color: style.accentColor }}>
          {iterationLabel}
        </div>
      )}
      {isInteractive && isPaused && activeNodeId === id && (
        <div className="mt-1 text-xs animate-pulse" style={{ color: style.accentColor }}>
          {waitingLabel}
        </div>
      )}

      {/* Visited checkmark */}
      {isVisited && !isActive && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] shadow-sm">
          ✓
        </div>
      )}

      {/* Source handles */}
      {(handles.sources ?? []).map((handleId) => (
        <Handle
          key={`source-${handleId}`}
          id={`${id}-${handleId}`}
          type="source"
          position={Position.Bottom}
          style={{ background: style.handleColor }}
        />
      ))}
    </div>
  );
}

export const nodeTypes = {
  customNode: CustomNode,
};
