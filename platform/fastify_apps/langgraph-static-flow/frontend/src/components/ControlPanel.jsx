import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { useGraphStore } from '../store/useGraphStore.js';
import { useWorkflowStore } from '../store/useWorkflowStore.js';
import { useRunStore } from '../store/useRunStore.js';
import { listAdapters, setStorageAdapter, getStorageAdapter } from '../storage/index.js';
import { t } from '../graph/g11n.js';

function SettingsModal({ onClose }) {
  const { maxIterations, setMaxIterations, loadCheckpoints } = useGraphStore();
  const graphDef = useGraphStore((s) => s.graphDef);
  const [storageBackend, setStorageBackend] = useState('postgres');
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
        stage: {t(graphDef, 'statusCompleted')}
      </span>
    );
  }

  if (!isRunning && currentStage === 'stopped') {
    return (
      <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
        stage: {t(graphDef, 'statusStopped')}
      </span>
    );
  }

  if (!isRunning && !currentStage) return null;

  if (isPaused) {
    return (
      <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200 font-medium">
        stage: {t(graphDef, 'statusAwaitingFeedback')}
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
      stage: {progressLabel}
    </span>
  );
}

/**
 * Health check indicator — pings the app's KV API to verify postgres connectivity.
 * Shows a colored dot: green = ok, red = down, gray = checking.
 * Click to expand a tooltip with details.
 */
function HealthStatus() {
  const [health, setHealth] = useState({ postgres: null, loading: true });
  const [open, setOpen] = useState(false);

  const check = async () => {
    setHealth((h) => ({ ...h, loading: true }));
    const results = { postgres: null, loading: false };
    const start = performance.now();
    try {
      const res = await fetch('/~/api/langgraph-static-flow/kv?prefix=__healthz__');
      const latency = Math.round(performance.now() - start);
      if (res.ok) {
        results.postgres = { status: 'ok', service: 'postgres', latency_ms: latency };
      } else {
        results.postgres = { status: 'error', service: 'postgres', error: { message: `HTTP ${res.status}` } };
      }
    } catch {
      results.postgres = { status: 'error', service: 'postgres', error: { message: 'fetch failed' } };
    }
    setHealth(results);
  };

  useEffect(() => {
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, []);

  const pgOk = health.postgres?.status === 'ok';
  const allOk = pgOk;
  const allDown = !pgOk && !health.loading;

  let dotColor = 'bg-slate-300'; // loading / unknown
  if (!health.loading) {
    if (allOk) dotColor = 'bg-green-500';
    else if (allDown) dotColor = 'bg-red-500';
    else dotColor = 'bg-amber-500';
  }

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen((v) => !v); if (!open) check(); }}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        title="Service health"
      >
        <span className="relative flex items-center justify-center w-4.5 h-4.5">
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
          <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${dotColor} ring-1 ring-white`} />
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-64 bg-white rounded-xl border border-slate-200 shadow-lg p-3 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-700">Service Health</span>
            <button
              onClick={check}
              className="text-[10px] text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Refresh
            </button>
          </div>

          {/* Postgres */}
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-50">
            <span className={`w-2 h-2 rounded-full shrink-0 ${pgOk ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs font-medium text-slate-700 flex-1">PostgreSQL</span>
            {health.postgres && (
              <span className={`text-[10px] font-mono ${pgOk ? 'text-green-600' : 'text-red-500'}`}>
                {pgOk ? `${health.postgres.latency_ms}ms` : health.postgres.error?.message || 'error'}
              </span>
            )}
          </div>

          {health.loading && (
            <div className="text-[10px] text-slate-400 text-center py-1">Checking...</div>
          )}
        </div>
      )}
    </div>
  );
}

const STATUS_DOTS = {
  running: '#3b82f6', paused: '#f59e0b', completed: '#22c55e',
  stopped: '#94a3b8', failed: '#ef4444',
};

const runSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 32,
    fontSize: '0.8125rem',
    backgroundColor: '#f8fafc',
    borderColor: state.isFocused ? '#6366f1' : '#e2e8f0',
    borderRadius: '0.5rem',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(99,102,241,0.3)' : 'none',
    '&:hover': { borderColor: '#c7d2fe' },
  }),
  menu: (base) => ({ ...base, fontSize: '0.8125rem', borderRadius: '0.5rem', zIndex: 50 }),
  option: (base, state) => ({
    ...base,
    fontSize: '0.8125rem',
    padding: '6px 10px',
    backgroundColor: state.isSelected ? '#eef2ff' : state.isFocused ? '#f8fafc' : 'white',
    color: '#334155',
    '&:active': { backgroundColor: '#e0e7ff' },
  }),
  singleValue: (base) => ({ ...base, fontSize: '0.8125rem', color: '#334155' }),
  placeholder: (base) => ({ ...base, fontSize: '0.8125rem', color: '#94a3b8' }),
  input: (base) => ({ ...base, fontSize: '0.8125rem' }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({ ...base, padding: '4px' }),
};

/** Persistent top app bar — title only, health, settings */
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
          <HealthStatus />
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

/** Release + Run selector bar — shown only on instance/run pages, below the tab bar */
export function ReleaseRunBar() {
  const navigate = useNavigate();
  const isRunning = useGraphStore((s) => s.isRunning);

  const instances = useWorkflowStore((s) => s.instances);
  const activeInstanceId = useWorkflowStore((s) => s.activeInstanceId);

  const workflowRuns = useRunStore((s) => s.workflowRuns);
  const activeWorkflowRunId = useRunStore((s) => s.activeWorkflowRunId);

  // Release options
  const releaseOptions = useMemo(() =>
    instances.map((inst) => ({
      value: inst.id,
      label: inst.name,
      workflowName: inst.workflowName ?? '',
      status: inst.status ?? 'idle',
    })),
    [instances],
  );

  const activeReleaseOption = releaseOptions.find((o) => o.value === activeInstanceId) ?? null;

  const handleReleaseChange = (option) => {
    if (!option || option.value === activeInstanceId) return;
    navigate(`/instance/${encodeURIComponent(option.value)}`);
  };

  const formatReleaseOption = ({ label, workflowName }) => (
    <div className="flex items-center gap-2">
      <span>{label}</span>
      {workflowName && <span className="text-[10px] text-slate-400 ml-auto">{workflowName}</span>}
    </div>
  );

  const filterRelease = (option, input) => {
    if (!input) return true;
    const q = input.toLowerCase();
    return option.label.toLowerCase().includes(q)
      || (option.data.workflowName ?? '').toLowerCase().includes(q);
  };

  // Run options
  const runOptions = useMemo(() =>
    workflowRuns.map((run, idx) => {
      const num = workflowRuns.length - idx;
      const topicSnippet = run.topic ? ` — ${run.topic.slice(0, 50)}` : '';
      return {
        value: run.id,
        label: `Run #${num}${topicSnippet}`,
        status: run.status,
        runNumber: num,
        topic: run.topic ?? '',
      };
    }),
    [workflowRuns],
  );

  const activeRunOption = runOptions.find((o) => o.value === activeWorkflowRunId) ?? null;

  const handleRunChange = (option) => {
    if (!option || !activeInstanceId) return;
    navigate(`/instance/${encodeURIComponent(activeInstanceId)}/${encodeURIComponent(option.value)}`);
  };

  const formatRunOption = ({ status, label }) => (
    <div className="flex items-center gap-2">
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: STATUS_DOTS[status] ?? '#94a3b8' }}
      />
      <span>{label}</span>
    </div>
  );

  const filterRun = (option, input) => {
    if (!input) return true;
    const q = input.toLowerCase();
    return option.label.toLowerCase().includes(q)
      || (option.data.topic ?? '').toLowerCase().includes(q)
      || (option.data.status ?? '').toLowerCase().includes(q);
  };

  return (
    <div className="flex gap-2.5 items-center px-4 py-2 bg-white border-b border-slate-200 shrink-0">
      <div className="flex-1 min-w-[180px]">
        <Select
          value={activeReleaseOption}
          onChange={handleReleaseChange}
          options={releaseOptions}
          isSearchable
          isClearable={false}
          isDisabled={isRunning}
          placeholder="Select a release..."
          filterOption={filterRelease}
          formatOptionLabel={formatReleaseOption}
          styles={runSelectStyles}
          noOptionsMessage={() => 'No releases'}
        />
      </div>

      <div className="flex-1 min-w-[220px]">
        <Select
          value={activeRunOption}
          onChange={handleRunChange}
          options={runOptions}
          isSearchable
          isClearable={false}
          isDisabled={!activeInstanceId || runOptions.length === 0}
          placeholder={runOptions.length === 0 ? 'No runs yet' : 'Select run...'}
          filterOption={filterRun}
          formatOptionLabel={formatRunOption}
          styles={runSelectStyles}
          noOptionsMessage={() => 'No matching runs'}
        />
      </div>
    </div>
  );
}

/**
 * Unified control bar — instance context (name, mode, status) + workflow
 * select + topic input + start/stop/reset + schema view.
 *
 * Optional props from InstanceDetail:
 *   instanceName  — release name shown at the left
 *   onBack        — navigate back to releases
 *   onViewSchema  — open schema modal
 */
export default function ControlPanel({ instanceName, onBack, onViewSchema } = {}) {
  const navigate = useNavigate();
  const isRunning = useGraphStore((s) => s.isRunning);
  const startGraph = useGraphStore((s) => s.startGraph);
  const stopGraph = useGraphStore((s) => s.stopGraph);
  const resetGraph = useGraphStore((s) => s.reset);
  const error = useGraphStore((s) => s.error);
  const graphDef = useGraphStore((s) => s.graphDef);
  const topicInput = useGraphStore((s) => s.topicInput);

  const activeInstanceId = useWorkflowStore((s) => s.activeInstanceId);
  const activeWorkflowId = useWorkflowStore((s) => s.activeWorkflowId);

  const handleStart = async () => {
    await startGraph(topicInput);
    // Navigate to the newly created run
    const wfrunId = useGraphStore.getState().activeWorkflowRunId;
    if (activeInstanceId && wfrunId) {
      navigate(`/instance/${encodeURIComponent(activeInstanceId)}/${encodeURIComponent(wfrunId)}`, { replace: true });
    }
  };

  return (
    <div className="flex flex-col gap-2.5 px-4 py-2.5 bg-white border-b border-slate-200">
      {/* ── Row 1: Instance identity + status + actions ── */}
      <div className="flex items-center gap-2.5">
        {/* Back button (instance context) */}
        {onBack && (
          <button
            onClick={onBack}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
            title="Back to releases"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}

        {/* Instance name */}
        {instanceName && (
          <span className="text-xs font-medium text-slate-600 truncate max-w-[200px]" title={instanceName}>
            {instanceName}
          </span>
        )}

        {/* Execution mode badge */}
        {instanceName && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium shrink-0">
            execution: sandbox
          </span>
        )}

        {/* Execution status */}
        <ExecutionStatus />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Start / Stop + Reset */}
        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={!activeWorkflowId}
            className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {t(graphDef, 'controlsStart') || 'Run'}
          </button>
        ) : (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={stopGraph}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              {t(graphDef, 'controlsStop') || 'Stop'}
            </button>
            <button
              onClick={resetGraph}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              {t(graphDef, 'controlsReset') || 'Reset'}
            </button>
          </div>
        )}

        {/* View Schema */}
        {onViewSchema && (
          <button
            onClick={onViewSchema}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors shrink-0"
            title="View the workflow schema used by this release"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            View Schema
          </button>
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
