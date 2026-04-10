import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGraphStore } from '../store/useGraphStore.js';
import { resolveG11n, t } from '../graph/g11n.js';

// ─── Constants ───────────────────────────────────────────────────────────────

const CARD_MIN_W = 220;  // px — minimum card width before we drop a column
const CARD_GAP   = 12;   // px — gap between cards

// ─── Status logic ────────────────────────────────────────────────────────────

const STATUS = {
  pass:    { g11nKey: 'stageStatusPass',    bg: '#ecfdf5', text: '#059669', border: '#a7f3d0', bar: '#10b981' },
  failed:  { g11nKey: 'stageStatusFailed',  bg: '#fef2f2', text: '#dc2626', border: '#fecaca', bar: '#ef4444' },
  skip:    { g11nKey: 'stageStatusSkip',    bg: '#fffbeb', text: '#d97706', border: '#fde68a', bar: '#f59e0b' },
  pending: { g11nKey: 'stageStatusPending', bg: '#f8fafc', text: '#6366f1', border: '#c7d2fe', bar: '#a5b4fc' },
  block:   { g11nKey: 'stageStatusBlocked', bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1', bar: '#94a3b8' },
};

function deriveStatus(group, currentStage, activeGroupIndex, idx, allGroups, isPaused) {
  if (group.isFuture) {
    // First future group is "pending", rest are "blocked"
    const firstFutureIdx = allGroups.findIndex((g) => g.isFuture);
    return idx === firstFutureIdx ? 'pending' : 'block';
  }
  if (group.isComplete || (currentStage === 'end' && !group.isFuture)) return 'pass';
  if (group.stages.includes('feedback_submitted')) return 'skip';
  if (idx === activeGroupIndex) {
    // If paused at this stage, show as pending (awaiting input)
    return isPaused ? 'pending' : 'pass';
  }
  if (group.stages.length > 0 && idx < activeGroupIndex) return 'pass';
  return 'block';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function groupIterations(stageHistory, entryPoint, checkpoints, threadId, maxIterations, graphDef) {
  const groups = [];

  // Build the ordered node list (excluding __start__ and __end__)
  const nodeIds = (graphDef?.nodes ?? [])
    .map((n) => n.id)
    .filter((id) => id !== '__start__' && id !== '__end__');

  // One card per executed stage
  for (const stage of stageHistory) {
    if (stage === 'end') {
      // Mark the last group as complete
      if (groups.length > 0) groups[groups.length - 1].isComplete = true;
      continue;
    }
    groups.push({
      index: groups.length + 1,
      stages: [stage],
      isComplete: false,
    });
  }

  // Attach checkpoint IDs
  const threadCheckpoints = checkpoints
    .filter((cp) => cp.threadId === threadId)
    .sort((a, b) => a.timestamp - b.timestamp);

  for (let i = 0; i < groups.length; i++) {
    const cp = threadCheckpoints[i];
    if (cp) groups[i].checkpointId = `${cp.threadId?.slice(-6)}-${cp.timestamp}`;
  }

  // Fill future cards from the node order, continuing after the last executed stage
  const executedCount = groups.length;
  const lastExecutedStage = stageHistory.filter((s) => s !== 'end').at(-1);
  const lastNodeIdx = lastExecutedStage ? nodeIds.indexOf(lastExecutedStage) : -1;
  let nextIdx = lastNodeIdx + 1;

  const totalCards = Math.max(nodeIds.length, maxIterations);
  while (groups.length < totalCards) {
    const expectedNodeId = nodeIds.length > 0
      ? nodeIds[nextIdx % nodeIds.length]
      : null;
    nextIdx++;
    groups.push({
      index: groups.length + 1,
      stages: expectedNodeId ? [expectedNodeId] : [],
      isComplete: false,
      isFuture: true,
    });
  }

  return groups;
}

function getStepDescription(group, graphDef) {
  if (group.isFuture) return t(graphDef, 'stagePendingDesc');
  const labels = [];
  const seen = new Set();
  for (const stageId of group.stages) {
    if (seen.has(stageId)) continue;
    seen.add(stageId);
    const node = graphDef?.nodes?.find((n) => n.id === stageId);
    if (node?.data?.label) labels.push(node.data.label);
  }
  return labels.join(' \u2192 ') || t(graphDef, 'stageProcessingFallback');
}

// ─── Hook: measure container → visible card count ────────────────────────────

function useVisibleCount(containerRef, total) {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.offsetWidth;
      // How many cards fit? Each card needs CARD_MIN_W, gaps between them.
      const fits = Math.max(1, Math.floor((w + CARD_GAP) / (CARD_MIN_W + CARD_GAP)));
      setCount(Math.min(fits, total));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef, total]);

  return count;
}

// ─── Carousel Card ───────────────────────────────────────────────────────────

function CarouselCard({ group, status, graphDef, onClick }) {
  const s = STATUS[status];
  const description = getStepDescription(group, graphDef);

  // Resolve title: prefer first node's label, fall back to g11n or "Iteration N"
  const ctx = { index: group.index };
  const firstStageId = group.stages?.[0];
  const firstNode = firstStageId && graphDef?.nodes?.find((n) => n.id === firstStageId);
  const nodeLabel = firstNode?.data?.label;
  const title = nodeLabel || resolveG11n(graphDef, null, 'iterationGroup', 'title', ctx) || `Iteration ${group.index}`;
  const groupId = firstStageId || resolveG11n(graphDef, null, 'iterationGroup', 'id', ctx);

  return (
    <button
      onClick={onClick}
      disabled={group.isFuture}
      className={`w-full text-left rounded-xl border p-4 transition-all ${
        group.isFuture ? 'cursor-default opacity-50' : 'cursor-pointer hover:shadow-md'
      }`}
      style={{ backgroundColor: s.bg, borderColor: s.border }}
    >
      {/* Top status bar */}
      <div className="h-1 rounded-full mb-3" style={{ backgroundColor: s.bar }} />

      {/* Header row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-bold text-slate-800 shrink-0">
            {title}
          </span>
          {(group.checkpointId || groupId) && (
            <span className="text-[10px] font-mono text-slate-400 truncate">
              {group.checkpointId ?? groupId}
            </span>
          )}
        </div>

        {/* Status badge */}
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2"
          style={{ color: s.text, backgroundColor: `${s.text}12`, border: `1px solid ${s.border}` }}
        >
          {t(graphDef, s.g11nKey)}
        </span>
      </div>

      {/* Description + stage count — only when started */}
      {!group.isFuture && (
        <p className="text-[13px] text-slate-700 leading-relaxed truncate">{description}</p>
      )}

      {/* Stage count */}
      {!group.isFuture && (
        <p className="text-[11px] text-slate-400 mt-1.5">
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

// ─── Page dots ───────────────────────────────────────────────────────────────

function PageDots({ pageCount, currentPage, onPageClick }) {
  if (pageCount <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 mt-3">
      {Array.from({ length: pageCount }, (_, i) => (
        <button
          key={i}
          onClick={() => onPageClick(i)}
          className={`rounded-full transition-all ${
            i === currentPage ? 'w-6 h-2 bg-indigo-500' : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
          }`}
        />
      ))}
    </div>
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

  const currentThreadId = threadConfig?.configurable?.thread_id ?? null;
  const entryPoint = graphDef?.config?.entryPoint ?? 'generate';


  const iterationGroups = useMemo(
    () => groupIterations(stageHistory, entryPoint, checkpoints, currentThreadId, maxIterations, graphDef),
    [stageHistory, entryPoint, checkpoints, currentThreadId, maxIterations, graphDef],
  );

  const activeGroupIndex = iterationGroups.findIndex((g) =>
    !g.isFuture && (g.stages.includes(activeNodeId) || g.stages.includes(currentStage))
  );

  const isPaused = useGraphStore((s) => s.isPaused);

  const statuses = useMemo(
    () => iterationGroups.map((g, idx) => deriveStatus(g, currentStage, activeGroupIndex, idx, iterationGroups, isPaused)),
    [iterationGroups, currentStage, activeGroupIndex, isPaused],
  );

  // Responsive card count
  const trackRef = useRef(null);
  const total = iterationGroups.length;
  const visibleCount = useVisibleCount(trackRef, total);

  // Page-based navigation
  const pageCount = Math.max(1, Math.ceil(total / visibleCount));
  const [page, setPage] = useState(0);

  // Clamp page if visibleCount or total changes
  const safePage = Math.min(page, pageCount - 1);
  const startIdx = safePage * visibleCount;
  const visibleGroups = iterationGroups.slice(startIdx, startIdx + visibleCount);

  const goPrev = useCallback(() => setPage((p) => Math.max(0, p - 1)), []);
  const goNext = useCallback(() => setPage((p) => Math.min(pageCount - 1, p + 1)), [pageCount]);

  const handleCardClick = (group) => {
    if (group.isFuture) return;
    const lastStage = group.stages[group.stages.length - 1];
    const stageIdx = stageHistory.lastIndexOf(lastStage);
    if (stageIdx >= 0) viewStage(stageIdx);
  };

  if (total === 0 || !graphDef) return null;

  return (
    <div className="px-6 py-4 bg-white border-b border-slate-200">
      {/* Carousel */}
      {total > 0 && (
        <div>
          <div className="flex items-center gap-3">
            <NavButton direction="prev" onClick={goPrev} disabled={safePage === 0} label={t(graphDef, 'stageNavPrevious')} />

            {/* Track — measured for responsive fit */}
            <div ref={trackRef} className="flex-1 min-w-0">
              <div className="flex gap-3">
                {visibleGroups.map((group) => (
                  <div key={group.index} className="flex-1 min-w-0">
                    <CarouselCard
                      group={group}
                      status={statuses[startIdx + visibleGroups.indexOf(group)]}
                      graphDef={graphDef}
                      onClick={() => handleCardClick(group)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <NavButton direction="next" onClick={goNext} disabled={safePage >= pageCount - 1} label={t(graphDef, 'stageNavNext')} />
          </div>

          <PageDots pageCount={pageCount} currentPage={safePage} onPageClick={setPage} />
        </div>
      )}
    </div>
  );
}
