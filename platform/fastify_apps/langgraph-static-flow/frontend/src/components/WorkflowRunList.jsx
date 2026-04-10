import { useNavigate, useParams } from 'react-router-dom';
import { useRunStore } from '../store/useRunStore.js';

const STATUS_CONFIG = {
  running:   { dot: 'bg-blue-500',   bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  paused:    { dot: 'bg-amber-500',  bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  completed: { dot: 'bg-green-500',  bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  stopped:   { dot: 'bg-slate-400',  bg: 'bg-slate-50',  text: 'text-slate-600',  border: 'border-slate-200' },
  failed:    { dot: 'bg-red-500',    bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
};

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function formatRelative(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return formatTime(ts);
}

export default function WorkflowRunList() {
  const navigate = useNavigate();
  const { instanceId } = useParams();
  const workflowRuns = useRunStore((s) => s.workflowRuns);
  const activeWorkflowRunId = useRunStore((s) => s.activeWorkflowRunId);
  const setActiveWorkflowRun = useRunStore((s) => s.setActiveWorkflowRun);
  const taskRuns = useRunStore((s) => s.taskRuns);

  if (workflowRuns.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-xs px-4 text-center">
        No workflow runs yet. Click "Run" to start one.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 shrink-0">
        <h2 className="text-sm font-semibold text-slate-700">Workflow Runs</h2>
        <span className="text-xs text-slate-400">{workflowRuns.length} run{workflowRuns.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {workflowRuns.map((run, idx) => {
          const runNumber = workflowRuns.length - idx;
          const isActive = run.id === activeWorkflowRunId;
          const st = STATUS_CONFIG[run.status] ?? STATUS_CONFIG.stopped;
          const activeTaskCount = isActive ? taskRuns.length : null;

          return (
            <button
              key={run.id}
              onClick={() => {
                setActiveWorkflowRun(run.id);
                if (instanceId) navigate(`/instance/${encodeURIComponent(instanceId)}/${encodeURIComponent(run.id)}`);
              }}
              className={`w-full text-left rounded-lg border p-3 transition-all ${
                isActive
                  ? 'border-indigo-400 bg-indigo-50/50 ring-2 ring-indigo-200'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                {/* Status dot */}
                <span className={`w-2 h-2 rounded-full shrink-0 ${st.dot}`} />

                {/* Run number */}
                <span className="text-xs font-semibold text-slate-700">Run #{runNumber}</span>

                {/* Status badge */}
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-medium ${st.bg} ${st.text} ${st.border} border`}>
                  {run.status}
                </span>
              </div>

              {/* Topic snippet */}
              {run.topic && (
                <p className="text-[11px] text-slate-500 mt-1 truncate pl-4">
                  {run.topic.slice(0, 60)}
                </p>
              )}

              {/* Meta row */}
              <div className="flex items-center gap-3 mt-1.5 pl-4">
                <span className="text-[10px] text-slate-400">
                  {formatRelative(run.createdAt)}
                </span>
                {activeTaskCount != null && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                    {activeTaskCount} task{activeTaskCount !== 1 ? 's' : ''}
                  </span>
                )}
                {run.completedAt && (
                  <span className="text-[10px] text-slate-400 ml-auto">
                    {Math.round((run.completedAt - run.createdAt) / 1000)}s
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
