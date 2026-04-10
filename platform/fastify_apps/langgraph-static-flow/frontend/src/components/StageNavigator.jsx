import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { useGraphStore } from '../store/useGraphStore.js';
import { resolveG11n, t } from '../graph/g11n.js';

// ─── Status logic ────────────────────────────────────────────────────────────

const STATUS = {
  pass:    { g11nKey: 'stageStatusPass',    icon: '\u2713', bg: '#ecfdf5', text: '#059669', border: '#a7f3d0', bar: '#10b981' },
  failed:  { g11nKey: 'stageStatusFailed',  icon: '\u2717', bg: '#fef2f2', text: '#dc2626', border: '#fecaca', bar: '#ef4444' },
  skip:    { g11nKey: 'stageStatusSkip',    icon: '\u23ED', bg: '#fffbeb', text: '#d97706', border: '#fde68a', bar: '#f59e0b' },
  pending: { g11nKey: 'stageStatusPending', icon: '\u25CB', bg: '#f8fafc', text: '#6366f1', border: '#c7d2fe', bar: '#a5b4fc' },
  block:   { g11nKey: 'stageStatusBlocked', icon: '\u2014', bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1', bar: '#94a3b8' },
};

function deriveStatus(group, currentStage, activeGroupIndex, idx, allGroups, isPaused) {
  if (group.isFuture) {
    const firstFutureIdx = allGroups.findIndex((g) => g.isFuture);
    return idx === firstFutureIdx ? 'pending' : 'block';
  }
  if (group.isComplete || (currentStage === 'end' && !group.isFuture)) return 'pass';
  if (group.stages.includes('feedback_submitted')) return 'skip';
  if (idx === activeGroupIndex) {
    return isPaused ? 'pending' : 'pass';
  }
  if (group.stages.length > 0 && idx < activeGroupIndex) return 'pass';
  return 'block';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Walk the graph edges from a starting node to produce the expected execution
 * order. At conditional forks, follow the first (truthy) branch. Avoids
 * infinite loops by tracking visited nodes.
 */
function walkEdgeOrder(graphDef, startNodeId) {
  if (!graphDef?.edges) return [];
  const edgesBySource = {};
  for (const e of graphDef.edges) {
    if (!edgesBySource[e.source]) edgesBySource[e.source] = [];
    edgesBySource[e.source].push(e);
  }
  const order = [];
  const visited = new Set();
  let current = startNodeId;
  while (current && current !== '__end__' && !visited.has(current)) {
    if (current !== '__start__') order.push(current);
    visited.add(current);
    const outEdges = edgesBySource[current] ?? [];
    if (outEdges.length === 0) break;
    // Prefer the non-end, non-conditional edge; fall back to first conditional target
    const direct = outEdges.find((e) => !e.data?.condition && e.target !== '__end__');
    if (direct) { current = direct.target; continue; }
    // For conditional edges, pick the one whose conditionResult is not __end__
    const conditional = outEdges.find((e) => e.data?.condition && e.target !== '__end__');
    if (conditional) { current = conditional.target; continue; }
    break;
  }
  return order;
}

function groupIterations(stageHistory, entryPoint, checkpoints, threadId, maxIterations, graphDef) {
  const groups = [];

  // Derive expected execution order from graph edges (topology) instead of
  // the raw node array order, which may not match the actual flow.
  const edgeOrder = walkEdgeOrder(graphDef, entryPoint || '__start__');
  // Fall back to node array if edge walk produces nothing
  const nodeIds = edgeOrder.length > 0
    ? edgeOrder
    : (graphDef?.nodes ?? []).map((n) => n.id).filter((id) => id !== '__start__' && id !== '__end__');

  for (const stage of stageHistory) {
    if (stage === 'end') {
      if (groups.length > 0) groups[groups.length - 1].isComplete = true;
      continue;
    }
    groups.push({
      index: groups.length + 1,
      stages: [stage],
      isComplete: false,
    });
  }

  const threadCheckpoints = checkpoints
    .filter((cp) => cp.threadId === threadId)
    .sort((a, b) => a.timestamp - b.timestamp);

  for (let i = 0; i < groups.length; i++) {
    const cp = threadCheckpoints[i];
    if (cp) groups[i].checkpointId = `${cp.threadId?.slice(-6)}-${cp.timestamp}`;
  }

  const lastExecutedStage = stageHistory.filter((s) => s !== 'end').at(-1);
  const lastNodeIdx = lastExecutedStage ? nodeIds.indexOf(lastExecutedStage) : -1;
  let nextIdx = lastNodeIdx + 1;

  const totalCards = Math.max(nodeIds.length, maxIterations);
  while (groups.length < totalCards) {
    const expectedNodeId = nodeIds.length > 0 && nextIdx < nodeIds.length
      ? nodeIds[nextIdx]
      : null;
    nextIdx++;
    if (!expectedNodeId) break;
    groups.push({
      index: groups.length + 1,
      stages: [expectedNodeId],
      isComplete: false,
      isFuture: true,
    });
  }

  return groups;
}

/** Synthetic stage IDs that aren't graph nodes */
const SYNTHETIC_STAGES = {
  feedback_submitted: { label: 'User Response', category: 'Human-in-the-loop' },
};

// ─── Connector Arrow ──────────────────────────────────────────────────────────

function ConnectorArrow({ status }) {
  const color = status === 'pass' ? '#10b981' : status === 'skip' ? '#f59e0b' : '#cbd5e1';
  return (
    <div className="flex items-center shrink-0 -mx-1">
      <svg width="28" height="16" viewBox="0 0 28 16" fill="none">
        <line x1="0" y1="8" x2="20" y2="8" stroke={color} strokeWidth="2" strokeDasharray={status === 'block' ? '4 3' : 'none'} />
        <polygon points="18,4 26,8 18,12" fill={color} />
      </svg>
    </div>
  );
}

// ─── Step Card ───────────────────────────────────────────────────────────────

function StepCard({ group, status, graphDef, onClick, isActive }) {
  const s = STATUS[status];

  const firstStageId = group.stages?.[0];
  const firstNode = firstStageId && graphDef?.nodes?.find((n) => n.id === firstStageId);
  const synth = firstStageId && SYNTHETIC_STAGES[firstStageId];
  const nodeLabel = firstNode?.data?.label;
  const ctx = { index: group.index };
  const title = nodeLabel || synth?.label || resolveG11n(graphDef, null, 'iterationGroup', 'title', ctx) || `Step ${group.index}`;
  const groupId = group.checkpointId ?? firstStageId ?? resolveG11n(graphDef, null, 'iterationGroup', 'id', ctx);
  const isSynthetic = !!synth;

  // Truncate ID for display
  const shortId = groupId && groupId.length > 16 ? `${groupId.slice(0, 16)}...` : groupId;

  // Synthetic / user-interaction steps — distinct visual treatment
  if (isSynthetic) {
    return (
      <button
        onClick={onClick}
        className={`w-full text-left rounded-xl px-4 py-3 transition-all cursor-pointer hover:shadow-md min-w-[200px] border-2 border-dashed ${
          isActive ? 'scale-[1.03] shadow-md' : ''
        }`}
        style={{
          backgroundColor: isActive ? '#dbeafe' : `${s.bg}90`,
          borderColor: s.border,
        }}
      >
        {/* Step number */}
        <div className="text-lg font-bold text-slate-300 leading-none mb-1">{group.index}.</div>

        {/* Title with person icon */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="text-sm font-semibold text-slate-600">{title}</span>
        </div>

        {/* Status chip */}
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ color: s.text, backgroundColor: `${s.text}14`, border: `1px solid ${s.border}` }}
          >
            <span>{s.icon}</span>
            {t(graphDef, s.g11nKey)}
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={group.isFuture}
      className={`w-full text-left rounded-xl p-4 transition-all min-w-[200px] border ${
        isActive ? 'scale-[1.03] shadow-md' : ''
      } ${
        group.isFuture
          ? 'cursor-default opacity-40'
          : 'cursor-pointer hover:shadow-md'
      }`}
      style={{
        backgroundColor: isActive ? '#dbeafe' : s.bg,
        borderColor: s.border,
      }}
    >
      {/* Step number */}
      <div className="text-lg font-bold text-slate-300 leading-none mb-1">{group.index}.</div>

      {/* Primary title */}
      <div className="text-sm font-semibold text-slate-800 mb-1.5 truncate">{title}</div>

      {/* ID + status chip row */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        {shortId && (
          <span className="text-[11px] font-mono text-slate-500 truncate">
            {shortId}
          </span>
        )}
        <span
          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
          style={{ color: s.text, backgroundColor: `${s.text}14`, border: `1px solid ${s.border}` }}
        >
          <span>{s.icon}</span>
          {t(graphDef, s.g11nKey)}
        </span>
      </div>

      {/* Execution detail as muted footer */}
      {!group.isFuture && (
        <p className="text-[11px] text-slate-500 mt-1">
          {t(graphDef, 'stageStagesExecuted', { count: group.stages.length })}
        </p>
      )}
    </button>
  );
}

// ─── Nav Button ──────────────────────────────────────────────────────────────

function NavButton({ direction, onClick, disabled, label }) {
  const isLeft = direction === 'prev';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full border transition-all ${
        disabled
          ? 'border-slate-100 text-slate-200 cursor-not-allowed'
          : 'border-slate-300 text-slate-600 hover:bg-slate-100 hover:border-slate-400 active:scale-95'
      }`}
      aria-label={label}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        {isLeft
          ? <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          : <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        }
      </svg>
    </button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function StageNavigator() {
  const stageHistory = useGraphStore((s) => s.stageHistory);
  const activeNodeId = useGraphStore((s) => s.activeNodeId);
  const viewStage = useGraphStore((s) => s.viewStage);
  const graphDef = useGraphStore((s) => s.graphDef);
  const checkpoints = useGraphStore((s) => s.checkpoints);
  const threadConfig = useGraphStore((s) => s.threadConfig);
  const currentStage = useGraphStore((s) => s.currentStage);
  const maxIterations = useGraphStore((s) => s.maxIterations);
  const isPaused = useGraphStore((s) => s.isPaused);

  const currentThreadId = threadConfig?.configurable?.thread_id ?? null;
  const entryPoint = graphDef?.config?.entryPoint ?? 'generate';

  const scrollRef = useRef(null);

  const iterationGroups = useMemo(
    () => groupIterations(stageHistory, entryPoint, checkpoints, currentThreadId, maxIterations, graphDef),
    [stageHistory, entryPoint, checkpoints, currentThreadId, maxIterations, graphDef],
  );

  const activeStageIndex = useGraphStore((s) => s.activeStageIndex);

  // Use activeStageIndex to find the correct group when duplicate nodeIds exist
  const activeGroupIndex = useMemo(() => {
    if (activeStageIndex != null) {
      // Find which non-future group corresponds to this stageHistory index
      let histIdx = 0;
      for (let gi = 0; gi < iterationGroups.length; gi++) {
        const g = iterationGroups[gi];
        if (g.isFuture) continue;
        if (histIdx === activeStageIndex) return gi;
        histIdx++;
      }
    }
    // Fallback: match by nodeId (for live execution / pause states)
    return iterationGroups.findIndex((g) =>
      !g.isFuture && (g.stages.includes(activeNodeId) || g.stages.includes(currentStage))
    );
  }, [iterationGroups, activeStageIndex, activeNodeId, currentStage]);

  const statuses = useMemo(
    () => iterationGroups.map((g, idx) => deriveStatus(g, currentStage, activeGroupIndex, idx, iterationGroups, isPaused)),
    [iterationGroups, currentStage, activeGroupIndex, isPaused],
  );

  const handleCardClick = useCallback((group, groupIdx) => {
    if (group.isFuture) return;
    // Map group index to stageHistory index by counting non-future groups
    let histIdx = 0;
    for (let gi = 0; gi < iterationGroups.length; gi++) {
      if (iterationGroups[gi].isFuture) continue;
      if (gi === groupIdx) break;
      histIdx++;
    }
    if (histIdx < stageHistory.length) viewStage(histIdx);
  }, [stageHistory, viewStage, iterationGroups]);

  // Scroll state for enabling/disabling nav buttons
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', updateScrollState); ro.disconnect(); };
  }, [updateScrollState, iterationGroups.length]);

  const scrollBy = useCallback((dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 260, behavior: 'smooth' });
  }, []);

  const total = iterationGroups.length;
  if (total === 0 || !graphDef) return null;

  return (
    <div className="px-6 py-4 bg-white border-b border-slate-200">
      <div className="flex items-center gap-3">
        <NavButton direction="prev" onClick={() => scrollBy(-1)} disabled={!canScrollLeft} label={t(graphDef, 'stageNavPrevious')} />

        {/* Scrollable horizontal timeline */}
        <div
          ref={scrollRef}
          className="flex-1 min-w-0 overflow-x-auto pb-2 -mb-2"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
        >
          <div className="flex items-center gap-0 min-w-max">
            {iterationGroups.map((group, idx) => {
              const status = statuses[idx];
              return (
                <div key={group.index} className="flex items-center">
                  {/* Connector arrow between cards */}
                  {idx > 0 && (
                    <ConnectorArrow status={statuses[idx - 1]} />
                  )}
                  <div className="w-[220px] shrink-0">
                    <StepCard
                      group={group}
                      status={status}
                      graphDef={graphDef}
                      isActive={idx === activeGroupIndex}
                      onClick={() => handleCardClick(group, idx)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <NavButton direction="next" onClick={() => scrollBy(1)} disabled={!canScrollRight} label={t(graphDef, 'stageNavNext')} />
      </div>
    </div>
  );
}
