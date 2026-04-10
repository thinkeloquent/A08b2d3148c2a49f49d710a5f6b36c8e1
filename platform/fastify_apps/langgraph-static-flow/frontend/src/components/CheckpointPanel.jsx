import { useEffect, useMemo, useState } from 'react';
import { useGraphStore } from '../store/useGraphStore.js';
import { useRunStore } from '../store/useRunStore.js';
import { t } from '../graph/g11n.js';

function checkpointKey(cp) {
  return `checkpoint_${cp.threadId}_${cp.timestamp}`;
}

function CheckpointRow({ cp, isActive, diffSlot }) {
  const setActiveCheckpoint = useGraphStore((s) => s.setActiveCheckpoint);
  const toggleDiffCheckpoint = useGraphStore((s) => s.toggleDiffCheckpoint);
  const key = checkpointKey(cp);

  return (
    <div
      className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 border shadow-sm cursor-pointer transition-all ${
        isActive
          ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-200'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
      onClick={() => setActiveCheckpoint(key)}
    >
      {isActive && (
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
      )}
      <span className="text-indigo-600 font-mono">{cp.threadId?.slice(-6)}</span>
      <span className="text-slate-300">|</span>
      <span className="text-slate-600 truncate flex-1">{cp.topic?.slice(0, 30)}</span>
      <span className="text-slate-400">{new Date(cp.timestamp).toLocaleTimeString()}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleDiffCheckpoint(key);
        }}
        className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
          diffSlot != null
            ? 'bg-amber-100 text-amber-700 border border-amber-300'
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
        }`}
        title="Select for diff comparison"
      >
        {diffSlot != null ? `${diffSlot}` : 'diff'}
      </button>
    </div>
  );
}

/** Compute a simple diff between two checkpoints */
function computeDiff(cpA, cpB) {
  if (!cpA || !cpB) return null;
  const changes = [];

  if (cpA.currentStage !== cpB.currentStage) {
    changes.push({ field: 'Stage', from: cpA.currentStage, to: cpB.currentStage });
  }

  const iterDiff = (cpB.iterations?.length ?? 0) - (cpA.iterations?.length ?? 0);
  if (iterDiff !== 0) {
    changes.push({ field: 'Iterations', from: cpA.iterations?.length ?? 0, to: cpB.iterations?.length ?? 0 });
  }

  if (iterDiff > 0 && cpB.iterations) {
    const newIters = cpB.iterations.slice(cpA.iterations?.length ?? 0);
    for (const it of newIters) {
      changes.push({ field: `+ ${it.stage}`, from: null, to: it.content?.slice(0, 120) });
    }
  }

  if (cpA.topic !== cpB.topic) {
    changes.push({ field: 'Topic', from: cpA.topic, to: cpB.topic });
  }

  return changes;
}

function DiffView({ checkpoints, diffIds }) {
  const clearDiffCheckpoints = useGraphStore((s) => s.clearDiffCheckpoints);
  const graphDef = useGraphStore((s) => s.graphDef);

  const cpA = checkpoints.find((cp) => checkpointKey(cp) === diffIds[0]);
  const cpB = checkpoints.find((cp) => checkpointKey(cp) === diffIds[1]);

  if (!diffIds[1]) {
    return (
      <div className="mx-3 mb-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
        {t(graphDef, 'checkpointDiffSelectSecond')}
      </div>
    );
  }

  const changes = computeDiff(cpA, cpB);

  return (
    <div className="mx-3 mb-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-amber-800">{t(graphDef, 'checkpointDiffTitle')}</span>
        <button
          onClick={clearDiffCheckpoints}
          className="text-[10px] text-amber-600 hover:text-amber-800"
        >
          {t(graphDef, 'checkpointDiffClear')}
        </button>
      </div>
      {changes.length === 0 ? (
        <p className="text-xs text-amber-600">{t(graphDef, 'checkpointDiffNone')}</p>
      ) : (
        <div className="space-y-1.5">
          {changes.map((c, i) => (
            <div key={i} className="text-xs">
              <span className="font-medium text-amber-800">{c.field}: </span>
              {c.from != null && (
                <span className="text-red-600 line-through mr-1">{String(c.from)}</span>
              )}
              <span className="text-green-700">{String(c.to)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Previous Session Modal ──────────────────────────────────────────────────

function PreviousSessionModal({ threadId, checkpoints, onClose }) {
  const graphDef = useGraphStore((s) => s.graphDef);
  const sessionCheckpoints = checkpoints
    .filter((cp) => cp.threadId === threadId)
    .sort((a, b) => a.timestamp - b.timestamp);

  if (sessionCheckpoints.length === 0) return null;

  const first = sessionCheckpoints[0];
  const last = sessionCheckpoints[sessionCheckpoints.length - 1];
  const isComplete = last.currentStage === 'end';

  // Use the graphDef stored in the most recent checkpoint for this session
  const sessionGraphDef = last.graphDef ?? first.graphDef ?? null;

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* Off-canvas panel — slides in from left */}
      <div
        className="bg-white shadow-2xl border-r border-slate-200 w-[400px] max-w-[90vw] h-full flex flex-col
          animate-slide-in-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">{t(graphDef, 'checkpointPrevSessionTitle')}</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{threadId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100"
          >
            &times;
          </button>
        </div>

        {/* Summary */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 shrink-0">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400">{t(graphDef, 'checkpointTopicLabel')}</span>
              <p className="text-slate-700 font-medium mt-0.5">{first.topic}</p>
            </div>
            <div>
              <span className="text-slate-400">{t(graphDef, 'checkpointStatusLabel')}</span>
              <p className="mt-0.5">
                <span className={`font-medium ${isComplete ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isComplete ? t(graphDef, 'checkpointCompleted') : last.currentStage}
                </span>
              </p>
            </div>
            <div>
              <span className="text-slate-400">{t(graphDef, 'checkpointCheckpointsLabel')}</span>
              <p className="text-slate-700 font-medium mt-0.5">{sessionCheckpoints.length}</p>
            </div>
            <div>
              <span className="text-slate-400">{t(graphDef, 'checkpointDurationLabel')}</span>
              <p className="text-slate-700 font-medium mt-0.5">
                {new Date(first.timestamp).toLocaleTimeString()} &ndash; {new Date(last.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Graph definition used in this session */}
          {sessionGraphDef && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <span className="text-slate-400">{t(graphDef, 'checkpointGraphDefLabel')}</span>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-slate-700 font-medium">{sessionGraphDef.name}</span>
                {sessionGraphDef.config?.maxIterations && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-500">
                    {t(graphDef, 'checkpointMaxIter', { count: sessionGraphDef.config.maxIterations })}
                  </span>
                )}
              </div>
              {sessionGraphDef.nodes && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {sessionGraphDef.nodes
                    .filter((n) => n.data?.handler)
                    .map((n) => (
                      <span
                        key={n.id}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                        style={{
                          backgroundColor: n.data?.style?.bgColor ?? '#f1f5f9',
                          color: n.data?.style?.textColor ?? '#64748b',
                        }}
                      >
                        {n.data?.icon} {n.data?.label}
                      </span>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Checkpoint list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {sessionCheckpoints.map((cp, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-200 bg-white p-3 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">
                  {t(graphDef, 'checkpointNumber', { number: idx + 1 })}
                </span>
                <span className="text-slate-400">
                  {new Date(cp.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">{t(graphDef, 'checkpointStageLabel')}</span>
                <span className={`font-medium ${
                  cp.currentStage === 'end' ? 'text-emerald-600' : 'text-indigo-600'
                }`}>
                  {cp.currentStage}
                </span>
              </div>

              {cp.iterations?.length > 0 && (
                <div className="text-slate-500">
                  {t(graphDef, 'checkpointIterationsRecorded', { count: cp.iterations.length })}
                </div>
              )}

              {/* Stage path */}
              {cp.stageHistory?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {cp.stageHistory.map((stage, si) => (
                    <span
                      key={si}
                      className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px]"
                    >
                      {stage}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Scrim — transparent area to the right, click to close */}
      <div className="flex-1 bg-black/20" />
    </div>
  );
}

// ─── Run Group Row (clickable, shows checkpoints for a workflow run) ─────────

function RunGroupRow({ runId, checkpoints, runMeta, onOpen }) {
  const cps = checkpoints.filter((cp) => cp.workflowRunId === runId);
  const last = cps[cps.length - 1];
  const isComplete = last?.currentStage === 'end';

  const STATUS_DOT = {
    running: 'bg-blue-500', paused: 'bg-amber-500', completed: 'bg-green-500',
    stopped: 'bg-slate-400', failed: 'bg-red-500',
  };

  return (
    <button
      onClick={() => onOpen(runId)}
      className="w-full flex items-center gap-2 text-xs rounded-lg px-3 py-2 border border-slate-200 bg-white
        hover:border-indigo-300 hover:bg-indigo-50/50 shadow-sm cursor-pointer transition-all text-left"
    >
      {runMeta && (
        <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[runMeta.status] ?? 'bg-slate-300'}`} />
      )}
      <span className="text-indigo-600 font-mono shrink-0">{runId.slice(-8)}</span>
      <span className="text-slate-300">|</span>
      <span className="text-slate-600 truncate flex-1">{last?.topic?.slice(0, 30)}</span>
      <span className="text-slate-400 shrink-0">&times;{cps.length}</span>
      {isComplete && (
        <span className="text-emerald-600 font-medium shrink-0">Done</span>
      )}
      <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
      </svg>
    </button>
  );
}

// ─── Previous Session Row (clickable) ────────────────────────────────────────

function PreviousSessionRow({ threadId, checkpoints, onOpen }) {
  const sessionCps = checkpoints.filter((cp) => cp.threadId === threadId);
  const last = sessionCps[sessionCps.length - 1];
  const isComplete = last?.currentStage === 'end';

  return (
    <button
      onClick={() => onOpen(threadId)}
      className="w-full flex items-center gap-2 text-xs rounded-lg px-3 py-2 border border-slate-200 bg-white
        hover:border-indigo-300 hover:bg-indigo-50/50 shadow-sm cursor-pointer transition-all text-left"
    >
      <span className="text-indigo-600 font-mono shrink-0">{threadId.slice(-6)}</span>
      <span className="text-slate-300">|</span>
      <span className="text-slate-600 truncate flex-1">{last?.topic?.slice(0, 30)}</span>
      <span className="text-slate-400 shrink-0">&times;{sessionCps.length}</span>
      {isComplete && (
        <span className="text-emerald-600 font-medium shrink-0">Done</span>
      )}
      <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
      </svg>
    </button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CheckpointPanel() {
  const checkpoints = useGraphStore((s) => s.checkpoints);
  const loadCheckpoints = useGraphStore((s) => s.loadCheckpoints);
  const threadConfig = useGraphStore((s) => s.threadConfig);
  const activeCheckpointId = useGraphStore((s) => s.activeCheckpointId);
  const diffCheckpointIds = useGraphStore((s) => s.diffCheckpointIds);
  const graphDef = useGraphStore((s) => s.graphDef);

  const activeWorkflowRunId = useRunStore((s) => s.activeWorkflowRunId);

  const [searchQuery, setSearchQuery] = useState('');
  const [openSessionId, setOpenSessionId] = useState(null);

  useEffect(() => { loadCheckpoints(); }, [loadCheckpoints]);

  const currentThreadId = threadConfig?.configurable?.thread_id ?? null;

  const filteredCheckpoints = useMemo(() => {
    if (!searchQuery.trim()) return checkpoints;
    const q = searchQuery.toLowerCase();
    return checkpoints.filter(
      (cp) =>
        cp.threadId?.toLowerCase().includes(q) ||
        cp.topic?.toLowerCase().includes(q) ||
        cp.currentStage?.toLowerCase().includes(q)
    );
  }, [checkpoints, searchQuery]);

  const workflowRuns = useRunStore((s) => s.workflowRuns);

  // Group checkpoints: This Run / Other Runs (by workflowRunId) / Legacy (no workflowRunId)
  const { thisRun, otherRunIds, otherRunCheckpoints, legacy } = useMemo(() => {
    const tr = [];
    const otherMap = new Map(); // workflowRunId → checkpoints[]
    const lg = [];

    for (const cp of filteredCheckpoints) {
      if (activeWorkflowRunId && cp.workflowRunId === activeWorkflowRunId) {
        tr.push(cp);
      } else if (cp.workflowRunId) {
        if (!otherMap.has(cp.workflowRunId)) otherMap.set(cp.workflowRunId, []);
        otherMap.get(cp.workflowRunId).push(cp);
      } else {
        lg.push(cp);
      }
    }

    return {
      thisRun: tr,
      otherRunIds: [...otherMap.keys()],
      otherRunCheckpoints: [...otherMap.values()].flat(),
      legacy: lg,
    };
  }, [filteredCheckpoints, activeWorkflowRunId]);

  // For legacy checkpoints, group by threadId
  const legacyThreadIds = useMemo(() => {
    const s = new Set();
    for (const cp of legacy) s.add(cp.threadId);
    return [...s];
  }, [legacy]);

  if (checkpoints.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-xs">
        {t(graphDef, 'checkpointNoCheckpoints')}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 shrink-0">
        <h2 className="text-sm font-semibold text-slate-700">{t(graphDef, 'checkpointTitle')}</h2>
        <span className="text-xs text-slate-400">{t(graphDef, 'checkpointSavedCount', { count: filteredCheckpoints.length })}</span>
      </div>

      {/* Search bar */}
      {checkpoints.length > 3 && (
        <div className="px-3 pt-3 shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(graphDef, 'checkpointSearchPlaceholder')}
            className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-200 bg-white
              focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300
              placeholder:text-slate-400"
          />
        </div>
      )}

      {/* Diff view */}
      {diffCheckpointIds && (
        <div className="pt-3">
          <DiffView checkpoints={checkpoints} diffIds={diffCheckpointIds} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* This Run — checkpoints for the active workflow run */}
        {activeWorkflowRunId && (() => {
          const runIdx = workflowRuns.findIndex((r) => r.id === activeWorkflowRunId);
          const runNumber = runIdx >= 0 ? workflowRuns.length - runIdx : null;
          const runLabel = runNumber != null ? `Run #${runNumber} — current` : 'Current Run';
          return (
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                {runLabel}
              </span>
              <span className="text-[10px] text-slate-400">({thisRun.length})</span>
            </div>
            {thisRun.length > 0 ? (
              <div className="space-y-1">
                {thisRun.map((cp, idx) => {
                  const key = checkpointKey(cp);
                  const diffSlot = diffCheckpointIds
                    ? diffCheckpointIds[0] === key ? 'A' : diffCheckpointIds[1] === key ? 'B' : null
                    : null;
                  return (
                    <CheckpointRow
                      key={`thisrun-${idx}`}
                      cp={cp}
                      isActive={activeCheckpointId === key}
                      diffSlot={diffSlot}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 pl-3.5">{t(graphDef, 'checkpointNoCheckpoints')}</p>
            )}
          </div>
          );
        })()}

        {/* Other Runs — grouped by workflowRunId */}
        {activeWorkflowRunId && otherRunIds.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Other Runs
              </span>
              <span className="text-[10px] text-slate-400">({otherRunIds.length})</span>
            </div>
            <div className="space-y-1">
              {otherRunIds.map((runId) => (
                <RunGroupRow
                  key={runId}
                  runId={runId}
                  checkpoints={otherRunCheckpoints}
                  runMeta={workflowRuns.find((r) => r.id === runId)}
                  onOpen={setOpenSessionId}
                />
              ))}
            </div>
          </div>
        )}

        {/* No active run — fallback to session-based grouping */}
        {!activeWorkflowRunId && (
          <>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  {t(graphDef, 'checkpointCurrentSession')}
                </span>
                <span className="text-[10px] text-slate-400">
                  ({filteredCheckpoints.filter((cp) => currentThreadId && cp.threadId === currentThreadId).length})
                </span>
              </div>
              {filteredCheckpoints.filter((cp) => currentThreadId && cp.threadId === currentThreadId).length > 0 ? (
                <div className="space-y-1">
                  {filteredCheckpoints
                    .filter((cp) => currentThreadId && cp.threadId === currentThreadId)
                    .map((cp, idx) => {
                      const key = checkpointKey(cp);
                      const diffSlot = diffCheckpointIds
                        ? diffCheckpointIds[0] === key ? 'A' : diffCheckpointIds[1] === key ? 'B' : null
                        : null;
                      return (
                        <CheckpointRow
                          key={`cur-${idx}`}
                          cp={cp}
                          isActive={activeCheckpointId === key}
                          diffSlot={diffSlot}
                        />
                      );
                    })}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 pl-3.5">{t(graphDef, 'checkpointNoCheckpoints')}</p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  {t(graphDef, 'checkpointPreviousSessions')}
                </span>
              </div>
              {(() => {
                const prevThreadIds = [...new Set(
                  filteredCheckpoints
                    .filter((cp) => !currentThreadId || cp.threadId !== currentThreadId)
                    .map((cp) => cp.threadId),
                )];
                return prevThreadIds.length > 0 ? (
                  <div className="space-y-1">
                    {prevThreadIds.map((tid) => (
                      <PreviousSessionRow
                        key={tid}
                        threadId={tid}
                        checkpoints={filteredCheckpoints.filter((cp) => cp.threadId !== currentThreadId)}
                        onOpen={setOpenSessionId}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 pl-3.5">{t(graphDef, 'checkpointNoPrevious')}</p>
                );
              })()}
            </div>
          </>
        )}

        {/* Legacy checkpoints (no workflowRunId) — shown when active run is set */}
        {activeWorkflowRunId && legacy.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Legacy
              </span>
              <span className="text-[10px] text-slate-400">({legacy.length})</span>
            </div>
            <div className="space-y-1">
              {legacyThreadIds.map((tid) => (
                <PreviousSessionRow
                  key={tid}
                  threadId={tid}
                  checkpoints={legacy}
                  onOpen={setOpenSessionId}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal for selected previous session */}
      {openSessionId && (
        <PreviousSessionModal
          threadId={openSessionId}
          checkpoints={checkpoints}
          onClose={() => setOpenSessionId(null)}
        />
      )}
    </div>
  );
}
