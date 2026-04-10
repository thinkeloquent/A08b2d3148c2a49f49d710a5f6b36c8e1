import { useState, useEffect } from 'react';
import { useGraphStore } from '../store/useGraphStore.js';
import { useWorkflowStore } from '../store/useWorkflowStore.js';
import { listAdapters, setStorageAdapter, getStorageAdapter } from '../storage/index.js';
import { t } from '../graph/g11n.js';

function SettingsModal({ onClose }) {
  const { maxIterations, setMaxIterations, loadCheckpoints } = useGraphStore();
  const graphDef = useGraphStore((s) => s.graphDef);
  const [storageBackend, setStorageBackend] = useState('localStorage');
  const [clearing, setClearing] = useState(false);

  const handleStorageChange = (name) => {
    try {
      setStorageAdapter(name);
      setStorageBackend(name);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl border border-slate-200 w-80 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800">{t(graphDef, 'settingsTitle')}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg leading-none">&times;</button>
        </div>

        <div className="space-y-4">
          {/* Storage backend */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">{t(graphDef, 'settingsStorageBackend')}</label>
            <select
              value={storageBackend}
              onChange={(e) => handleStorageChange(e.target.value)}
              className="w-full bg-white text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {listAdapters().map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Clear localStorage */}
          {storageBackend === 'localStorage' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t(graphDef, 'settingsData')}</label>
              <button
                onClick={async () => {
                  setClearing(true);
                  try {
                    const adapter = getStorageAdapter();
                    await adapter.clear();
                    await loadCheckpoints();
                  } finally {
                    setClearing(false);
                  }
                }}
                disabled={clearing}
                className="w-full text-sm font-medium px-3 py-2 rounded-lg border border-red-200 text-red-600
                  hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {clearing ? t(graphDef, 'settingsClearing') : t(graphDef, 'settingsClearStorage')}
              </button>
              <p className="text-[11px] text-slate-400 mt-1">
                {t(graphDef, 'settingsClearDescription')}
              </p>
            </div>
          )}

          {/* Max iterations */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">{t(graphDef, 'settingsMaxIterations')}</label>
            <input
              type="number"
              min={1}
              max={10}
              value={maxIterations}
              onChange={(e) => setMaxIterations(Number(e.target.value))}
              className="w-full bg-white text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ExecutionStatus() {
  const isRunning = useGraphStore((s) => s.isRunning);
  const isPaused = useGraphStore((s) => s.isPaused);
  const currentStage = useGraphStore((s) => s.currentStage);
  const iterations = useGraphStore((s) => s.iterations);
  const maxIterations = useGraphStore((s) => s.maxIterations);
  const graphDef = useGraphStore((s) => s.graphDef);

  if (!isRunning && currentStage === 'end') {
    return (
      <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 font-medium">
        {t(graphDef, 'statusCompleted')}
      </span>
    );
  }

  if (!isRunning && currentStage === 'stopped') {
    return (
      <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
        {t(graphDef, 'statusStopped')}
      </span>
    );
  }

  if (!isRunning && !currentStage) return null;

  if (isPaused) {
    return (
      <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200 font-medium">
        {t(graphDef, 'statusAwaitingFeedback')}
      </span>
    );
  }

  // Count completed iteration cycles (pairs of generate+reflect)
  const iterCount = iterations.filter((it) => it.iteration != null).length;
  const progressLabel = iterCount > 0
    ? t(graphDef, 'statusRunningIteration', { iterCurrent: Math.ceil(iterCount / 2), iterMax: maxIterations })
    : t(graphDef, 'statusRunningStage', { stage: currentStage ?? 'initializing' });

  return (
    <span className="inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
      {progressLabel}
    </span>
  );
}

/** Persistent top app bar — title, execution status, settings */
export function AppBar() {
  const [showSettings, setShowSettings] = useState(false);
  const graphDef = useGraphStore((s) => s.graphDef);

  return (
    <>
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-white border-b border-slate-200 shrink-0">
        <h1 className="text-lg font-semibold text-slate-800 whitespace-nowrap">
          {t(graphDef, 'appTitle')}
        </h1>

        <div className="flex items-center gap-3">
          <ExecutionStatus />

          {/* Settings gear */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title={t(graphDef, 'settingsTitle')}
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
        </div>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}

/** Tab-specific start controls — workflow select, topic input, start/stop/reset, error */
export default function ControlPanel() {
  const isRunning = useGraphStore((s) => s.isRunning);
  const startGraph = useGraphStore((s) => s.startGraph);
  const stopGraph = useGraphStore((s) => s.stopGraph);
  const resetGraph = useGraphStore((s) => s.reset);
  const loadGraphDef = useGraphStore((s) => s.loadGraphDef);
  const error = useGraphStore((s) => s.error);
  const graphDef = useGraphStore((s) => s.graphDef);

  const workflows = useWorkflowStore((s) => s.workflows);
  const activeWorkflowId = useWorkflowStore((s) => s.activeWorkflowId);
  const setActiveWorkflow = useWorkflowStore((s) => s.setActiveWorkflow);

  const [topicInput, setTopicInput] = useState('');
  const defaultTopic = t(graphDef, 'controlsDefaultTopic');

  // Reset topic when workflow or graphDef changes
  useEffect(() => {
    setTopicInput(defaultTopic || '');
  }, [defaultTopic, activeWorkflowId]);

  const handleWorkflowChange = async (e) => {
    const id = e.target.value;
    if (!id) return;
    try {
      await setActiveWorkflow(id);
      resetGraph();
      await loadGraphDef({ force: true });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStart = () => {
    startGraph(topicInput);
  };

  return (
    <div className="flex flex-col gap-3 px-4 py-3 bg-white border-b border-slate-200">
      <div className="flex gap-3 flex-wrap">
        {/* Workflow selector */}
        <select
          value={activeWorkflowId ?? ''}
          onChange={handleWorkflowChange}
          disabled={isRunning}
          className="flex-1 min-w-[200px] bg-slate-50 text-slate-800 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white"
        >
          <option value="" disabled>Select a workflow...</option>
          {workflows.map((wf) => (
            <option key={wf.id} value={wf.id}>{wf.name}</option>
          ))}
        </select>

        {/* Topic input */}
        <input
          type="text"
          placeholder={t(graphDef, 'controlsTopicPlaceholder') || 'Enter topic...'}
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
          disabled={isRunning || !activeWorkflowId}
          className="flex-1 min-w-[200px] bg-slate-50 text-slate-800 border border-slate-200 rounded-lg px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white disabled:opacity-50"
        />

        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={!activeWorkflowId}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t(graphDef, 'controlsStart') || 'Start'}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={stopGraph}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 shadow-sm"
            >
              {t(graphDef, 'controlsStop') || 'Stop'}
            </button>
            <button
              onClick={resetGraph}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 shadow-sm"
            >
              {t(graphDef, 'controlsReset') || 'Reset'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 animate-fade-in">
          {error}
        </div>
      )}
    </div>
  );
}
