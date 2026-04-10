import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGraphStore } from '../store/useGraphStore.js';
import { t } from '../graph/g11n.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function checkpointKey(cp) {
  return `checkpoint_${cp.threadId}_${cp.timestamp}`;
}

function groupByThread(checkpoints) {
  const map = new Map();
  for (const cp of checkpoints) {
    const list = map.get(cp.threadId) ?? [];
    list.push(cp);
    map.set(cp.threadId, list);
  }
  // Sort each group by timestamp
  for (const [, list] of map) {
    list.sort((a, b) => a.timestamp - b.timestamp);
  }
  return map;
}

// ─── Duration formatter ─────────────────────────────────────────────────────

function formatDuration(ms) {
  if (ms == null) return null;
  if (ms < 1000) return `${ms}ms`;
  const secs = ms / 1000;
  if (secs < 60) return `${secs.toFixed(1)}s`;
  const mins = Math.floor(secs / 60);
  const remSecs = Math.round(secs % 60);
  return `${mins}m ${remSecs}s`;
}

// ─── Replay Player (full-page replacement) ─────────────────────────────────

function ReplayPlayer({ checkpoint, onClose }) {
  const graphDef = useGraphStore((s) => s.graphDef);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedPrev, setExpandedPrev] = useState(new Set());

  const stages = checkpoint.stageHistory ?? [];
  const iterations = checkpoint.iterations ?? [];
  const total = stages.length;

  // Build iteration-matched list for all stages with duration metrics
  const stageEntries = useMemo(() => {
    const entries = [];
    const stageCounts = {};
    for (let i = 0; i < stages.length; i++) {
      const s = stages[i];
      stageCounts[s] = (stageCounts[s] ?? 0) + 1;
      const occurrence = stageCounts[s];
      let matched = null;
      let count = 0;
      for (const it of iterations) {
        if (it.stage === s) {
          count++;
          if (count === occurrence) { matched = it; break; }
        }
      }
      entries.push({ stage: s, iteration: matched, index: i });
    }
    // Compute duration: time from this stage to the next stage that has a timestamp
    for (let i = 0; i < entries.length; i++) {
      const currTs = entries[i].iteration?.timestamp;
      if (!currTs) { entries[i].durationMs = null; continue; }
      // Find the next entry with a timestamp
      let nextTs = null;
      for (let j = i + 1; j < entries.length; j++) {
        if (entries[j].iteration?.timestamp) {
          nextTs = entries[j].iteration.timestamp;
          break;
        }
      }
      entries[i].durationMs = nextTs && nextTs > currTs ? nextTs - currTs : null;
    }
    // Total duration: first to last timestamp
    const firstTs = entries.find((e) => e.iteration?.timestamp)?.iteration?.timestamp;
    const lastTs = [...entries].reverse().find((e) => e.iteration?.timestamp)?.iteration?.timestamp;
    entries.totalDurationMs = firstTs && lastTs && lastTs > firstTs ? lastTs - firstTs : null;
    return entries;
  }, [stages, iterations]);

  // Auto-play timer
  useEffect(() => {
    if (!playing || stepIndex >= total - 1) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStepIndex((i) => i + 1), 1200);
    return () => clearTimeout(timer);
  }, [playing, stepIndex, total]);

  const handlePrev = useCallback(() => {
    setPlaying(false);
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleNext = useCallback(() => {
    setPlaying(false);
    setStepIndex((i) => Math.min(total - 1, i + 1));
  }, [total]);

  const handlePlayPause = useCallback(() => {
    if (stepIndex >= total - 1) setStepIndex(0);
    setPlaying((p) => !p);
  }, [stepIndex, total]);

  const jumpTo = useCallback((i) => {
    setPlaying(false);
    setStepIndex(i);
    setDropdownOpen(false);
  }, []);

  const togglePrevExpanded = useCallback((i) => {
    setExpandedPrev((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f8fafc] animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            {t(graphDef, 'replayBack')}
          </button>
          <span className="w-px h-4 bg-slate-200" />
          <span className="text-sm font-semibold text-slate-800">{t(graphDef, 'replayHeading')}</span>
          <span className="text-[10px] font-mono text-slate-400">{checkpoint.threadId?.slice(-8)}</span>
          {stageEntries.totalDurationMs != null && (
            <>
              <span className="text-slate-300">&middot;</span>
              <span className="text-[10px] text-slate-400">
                {t(graphDef, 'replayTotalDuration', { duration: formatDuration(stageEntries.totalDurationMs) })}
              </span>
            </>
          )}
          {checkpoint.topic && (
            <>
              <span className="text-slate-300">&middot;</span>
              <span className="text-xs text-slate-500 truncate max-w-[200px]">{checkpoint.topic}</span>
            </>
          )}
        </div>

        {/* Jump-to dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border
              border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            <span className="text-slate-600">
              Step {stepIndex + 1}: {stages[stepIndex]}
            </span>
            <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-64 max-h-72 overflow-y-auto rounded-lg border
                border-slate-200 bg-white shadow-lg">
                {stageEntries.map((entry, i) => (
                  <button
                    key={i}
                    onClick={() => jumpTo(i)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
                      i === stepIndex
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'hover:bg-slate-50 text-slate-600'
                    } ${i > 0 ? 'border-t border-slate-50' : ''}`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      i < stepIndex ? 'bg-indigo-100 text-indigo-600'
                        : i === stepIndex ? 'bg-indigo-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {i + 1}
                    </span>
                    <span className={`font-medium ${
                      entry.stage === 'end' ? 'text-emerald-600' : ''
                    }`}>
                      {entry.stage}
                    </span>
                    {entry.iteration?.iteration != null && (
                      <span className="ml-auto text-[10px] text-slate-400">#{entry.iteration.iteration}</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 py-3 bg-white border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-0.5">
          {stages.map((_, i) => (
            <button
              key={i}
              onClick={() => jumpTo(i)}
              className={`h-1.5 flex-1 rounded-full transition-all cursor-pointer ${
                i < stepIndex ? 'bg-indigo-500'
                  : i === stepIndex ? 'bg-indigo-600 ring-2 ring-indigo-300'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px] text-slate-400">
            {t(graphDef, 'replayStepCounter', { current: stepIndex + 1, total })}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={stepIndex === 0}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-slate-200
                hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>

            <button
              onClick={handlePlayPause}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-indigo-500
                hover:bg-indigo-600 text-white shadow-sm transition-all active:scale-95"
            >
              {playing ? (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={stepIndex >= total - 1}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-slate-200
                hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          <span className="text-[11px] text-slate-400">
            {new Date(checkpoint.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Full flow — all stages up to current step */}
      <div className="flex-1 overflow-y-auto p-5 space-y-2">
        {stageEntries.slice(0, stepIndex + 1).map((entry, i) => {
          const isActive = i === stepIndex;
          const isEnd = entry.stage === 'end';
          const isPrevExpanded = !isActive && expandedPrev.has(i);
          const showContent = isActive || isPrevExpanded;

          return (
            <div
              key={i}
              onClick={!isActive ? () => togglePrevExpanded(i) : undefined}
              className={`rounded-lg border transition-all ${
                isActive
                  ? 'border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200 p-4 shadow-sm'
                  : isPrevExpanded
                    ? 'border-indigo-200 bg-white p-4 shadow-sm cursor-pointer'
                    : isEnd
                      ? 'border-slate-100 bg-emerald-50/40 px-3 py-2'
                      : 'border-slate-100 bg-slate-50/60 px-3 py-2 cursor-pointer hover:border-slate-200 hover:bg-slate-50'
              } ${isActive ? 'animate-fade-in' : ''}`}
            >
              {/* Stage header */}
              <div className="flex items-center gap-2">
                <span className={`rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  isActive ? 'w-6 h-6 bg-indigo-500 text-white'
                    : isPrevExpanded ? 'w-6 h-6 bg-indigo-400 text-white'
                    : isEnd ? 'w-5 h-5 bg-emerald-500 text-white'
                    : 'w-5 h-5 bg-slate-200 text-slate-600'
                }`}>
                  {i + 1}
                </span>
                <span className={`text-xs font-semibold ${
                  isEnd ? 'text-emerald-700' : isActive || isPrevExpanded ? 'text-indigo-700' : 'text-slate-700'
                }`}>
                  {entry.stage}
                </span>
                {entry.iteration?.iteration != null && (
                  <span className="text-[10px] text-slate-400">#{entry.iteration.iteration}</span>
                )}
                <span className="ml-auto flex items-center gap-2">
                  {entry.durationMs != null && (
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      entry.durationMs > 10000
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {formatDuration(entry.durationMs)}
                    </span>
                  )}
                  {entry.iteration?.timestamp && (
                    <span className="text-[10px] text-slate-400">
                      {new Date(entry.iteration.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                  {!isActive && !isEnd && (
                    <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isPrevExpanded ? 'rotate-90' : ''}`}
                      fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  )}
                </span>
              </div>

              {/* Content — expanded for active step or clicked previous steps */}
              {showContent && (
                <div className="mt-2">
                  {entry.iteration?.content ? (
                    <div className="text-xs text-slate-600 whitespace-pre-wrap font-mono leading-relaxed
                      max-h-[300px] overflow-y-auto pl-8">
                      {entry.iteration.content}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic pl-8">
                      {isEnd ? t(graphDef, 'replayWorkflowCompleted') : t(graphDef, 'replayNoContent')}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Remaining stages (dimmed) */}
        {stepIndex < total - 1 && (
          <div className="flex items-center gap-2 px-4 py-2">
            <span className="text-[10px] text-slate-300 uppercase tracking-wide">
              {t(graphDef, 'replayRemainingSteps', { count: total - stepIndex - 1 })}
            </span>
            <span className="flex-1 h-px bg-slate-100" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Session Card ───────────────────────────────────────────────────────────

function SessionCard({ threadId, checkpoints, isCurrent, onReplay }) {
  const graphDef = useGraphStore((s) => s.graphDef);
  const [expanded, setExpanded] = useState(false);
  const last = checkpoints[checkpoints.length - 1];
  const first = checkpoints[0];
  const isComplete = last?.currentStage === 'end';
  const totalStages = last?.stageHistory?.length ?? 0;
  const totalIterations = last?.iterations?.length ?? 0;

  return (
    <div className={`rounded-xl border transition-all ${
      isCurrent
        ? 'border-indigo-200 bg-indigo-50/30'
        : 'border-slate-200 bg-white'
    }`}>
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-4 py-3 flex items-center gap-3"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${
          isCurrent ? 'bg-emerald-500' : isComplete ? 'bg-slate-400' : 'bg-amber-400'
        }`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800 truncate">
              {first?.topic?.slice(0, 40) || t(graphDef, 'sessionUntitled')}
            </span>
            {isCurrent && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium shrink-0">
                {t(graphDef, 'sessionActive')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-mono text-slate-400">{threadId.slice(-8)}</span>
            <span className="text-[10px] text-slate-300">|</span>
            <span className="text-[10px] text-slate-400">
              {new Date(first?.timestamp).toLocaleDateString()} {new Date(first?.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
            isComplete
              ? 'bg-emerald-100 text-emerald-700'
              : isCurrent
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-amber-100 text-amber-700'
          }`}>
            {isComplete ? t(graphDef, 'sessionDone') : isCurrent ? t(graphDef, 'sessionRunning') : last?.currentStage ?? t(graphDef, 'sessionUnknown')}
          </span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
            fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 animate-fade-in">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-center">
              <p className="text-lg font-bold text-slate-800">{checkpoints.length}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t(graphDef, 'sessionCheckpointsLabel')}</p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-center">
              <p className="text-lg font-bold text-slate-800">{totalStages}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t(graphDef, 'sessionStagesLabel')}</p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-center">
              <p className="text-lg font-bold text-slate-800">{totalIterations}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t(graphDef, 'sessionEventsLabel')}</p>
            </div>
          </div>

          {/* Full flow path (from latest checkpoint's stageHistory) */}
          {last?.stageHistory?.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  {t(graphDef, 'sessionFlowLabel')}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); onReplay(last); }}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-indigo-100 text-indigo-600
                    hover:bg-indigo-200 transition-colors"
                >
                  {t(graphDef, 'sessionReplayButton')}
                </button>
              </div>
              {last.stageHistory.map((stage, i) => {
                const isEnd = stage === 'end';
                // Find checkpoint save-points to mark them
                const isSavePoint = checkpoints.some((cp) => {
                  const cpLen = cp.stageHistory?.length ?? 0;
                  return cpLen === i + 1 && cp.stageHistory?.[i] === stage;
                });
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs rounded-lg px-3 py-1.5 border border-slate-100 bg-slate-50"
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                      isEnd ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {i + 1}
                    </span>
                    <span className={`font-medium ${
                      isEnd ? 'text-emerald-600' : 'text-slate-700'
                    }`}>
                      {stage}
                    </span>
                    {isSavePoint && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-400 border border-indigo-100">
                        {t(graphDef, 'sessionCheckpointBadge')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function SessionView() {
  const graphDef = useGraphStore((s) => s.graphDef);
  const checkpoints = useGraphStore((s) => s.checkpoints);
  const loadCheckpoints = useGraphStore((s) => s.loadCheckpoints);
  const threadConfig = useGraphStore((s) => s.threadConfig);

  const [replayCheckpoint, setReplayCheckpoint] = useState(null);

  useEffect(() => { loadCheckpoints(); }, [loadCheckpoints]);

  const currentThreadId = threadConfig?.configurable?.thread_id ?? null;

  const sessionMap = useMemo(() => groupByThread(checkpoints), [checkpoints]);

  // Split into current + previous
  const currentSession = currentThreadId ? (sessionMap.get(currentThreadId) ?? []) : [];
  const previousSessions = useMemo(() => {
    const entries = [];
    for (const [tid, cps] of sessionMap) {
      if (tid !== currentThreadId) entries.push({ threadId: tid, checkpoints: cps });
    }
    // Most recent first
    entries.sort((a, b) => {
      const aT = a.checkpoints[a.checkpoints.length - 1]?.timestamp ?? 0;
      const bT = b.checkpoints[b.checkpoints.length - 1]?.timestamp ?? 0;
      return bT - aT;
    });
    return entries;
  }, [sessionMap, currentThreadId]);

  // When replaying, replace the entire view
  if (replayCheckpoint) {
    return (
      <ReplayPlayer
        checkpoint={replayCheckpoint}
        onClose={() => setReplayCheckpoint(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f8fafc]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-slate-200 shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">{t(graphDef, 'sessionHeading')}</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {t(graphDef, 'sessionStats', { sessions: sessionMap.size, checkpoints: checkpoints.length })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Current session */}
        {currentSession.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                {t(graphDef, 'sessionCurrentSection')}
              </span>
            </div>
            <SessionCard
              threadId={currentThreadId}
              checkpoints={currentSession}
              isCurrent
              onReplay={setReplayCheckpoint}
            />
          </div>
        )}

        {/* Previous sessions */}
        {previousSessions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                {t(graphDef, 'sessionPreviousSection')}
              </span>
              <span className="text-[10px] text-slate-400">({previousSessions.length})</span>
            </div>
            <div className="space-y-2">
              {previousSessions.map(({ threadId, checkpoints: cps }) => (
                <SessionCard
                  key={threadId}
                  threadId={threadId}
                  checkpoints={cps}
                  isCurrent={false}
                  onReplay={setReplayCheckpoint}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {checkpoints.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600">{t(graphDef, 'sessionNoSessions')}</p>
            <p className="text-xs text-slate-400 mt-1">{t(graphDef, 'sessionStartWorkflow')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
