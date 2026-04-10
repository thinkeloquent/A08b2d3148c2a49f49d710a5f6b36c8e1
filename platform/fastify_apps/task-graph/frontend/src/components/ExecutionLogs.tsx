import { Link } from 'react-router-dom';
import { Clock, CheckCircle2, XCircle, Play, SkipForward, AlertTriangle, RefreshCw } from 'lucide-react';
import { useExecutionLogs } from '../hooks/useExecutions';
import type { ExecutionLog, ExecutionEventType } from '../types';

interface ExecutionLogsProps {
  taskId?: string;
  limit?: number;
  showTaskLink?: boolean;
}

const eventTypeConfig: Record<ExecutionEventType, { icon: typeof Clock; color: string; label: string }> = {
  TASK_CREATED: { icon: Play, color: 'text-blue-600 bg-blue-50', label: 'Task Created' },
  TASK_STARTED: { icon: Play, color: 'text-blue-600 bg-blue-50', label: 'Task Started' },
  TASK_COMPLETED: { icon: CheckCircle2, color: 'text-green-600 bg-green-50', label: 'Task Completed' },
  TASK_FAILED: { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Task Failed' },
  TASK_SKIPPED: { icon: SkipForward, color: 'text-purple-600 bg-purple-50', label: 'Task Skipped' },
  TASK_RETRYING: { icon: RefreshCw, color: 'text-orange-600 bg-orange-50', label: 'Task Retrying' },
  STEP_CREATED: { icon: Play, color: 'text-blue-500 bg-blue-50', label: 'Step Created' },
  STEP_STARTED: { icon: Play, color: 'text-blue-500 bg-blue-50', label: 'Step Started' },
  STEP_COMPLETED: { icon: CheckCircle2, color: 'text-green-500 bg-green-50', label: 'Step Completed' },
  STEP_FAILED: { icon: XCircle, color: 'text-red-500 bg-red-50', label: 'Step Failed' },
  STEP_SKIPPED: { icon: SkipForward, color: 'text-purple-500 bg-purple-50', label: 'Step Skipped' },
  CHECKPOINT_CREATED: { icon: Clock, color: 'text-gray-600 bg-gray-50', label: 'Checkpoint Created' },
  CHECKPOINT_RESTORED: { icon: RefreshCw, color: 'text-gray-600 bg-gray-50', label: 'Checkpoint Restored' },
  DEPENDENCY_ADDED: { icon: AlertTriangle, color: 'text-blue-600 bg-blue-50', label: 'Dependency Added' },
  DEPENDENCY_REMOVED: { icon: AlertTriangle, color: 'text-gray-600 bg-gray-50', label: 'Dependency Removed' },
  DEPENDENCY_CYCLE_DETECTED: { icon: AlertTriangle, color: 'text-red-600 bg-red-50', label: 'Dependency Cycle Detected' },
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${diffDay}d ago`;
}

function LogEntry({ log, showTaskLink }: { log: ExecutionLog; showTaskLink: boolean }) {
  const config = eventTypeConfig[log.eventType] || {
    icon: Clock,
    color: 'text-gray-600 bg-gray-50',
    label: log.eventType,
  };
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className={`p-2 rounded-full ${config.color}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900">{config.label}</span>
          {showTaskLink && log.taskId && (
            <Link
              to={`/tasks/${log.taskId}`}
              className="text-blue-600 hover:text-blue-800 text-sm hover:underline truncate max-w-[200px]"
            >
              {(log.eventData?.title as string) || log.taskId}
            </Link>
          )}
        </div>
        {log.eventData && Object.keys(log.eventData).length > 0 && (
          <div className="mt-1 text-sm text-gray-600 space-x-3">
            {'error' in log.eventData && log.eventData.error != null && (
              <span className="text-red-600">Error: {String(log.eventData.error)}</span>
            )}
            {'reason' in log.eventData && log.eventData.reason != null && (
              <span>Reason: {String(log.eventData.reason)}</span>
            )}
            {'duration' in log.eventData && log.eventData.duration != null && (
              <span>Duration: {String(log.eventData.duration)}ms</span>
            )}
            {'retryCount' in log.eventData && log.eventData.retryCount != null && (
              <span>Retry #{String(log.eventData.retryCount)}</span>
            )}
          </div>
        )}
        <div className="mt-1 text-xs text-gray-400 flex items-center gap-2">
          <span title={formatTimestamp(log.timestamp)}>{formatRelativeTime(log.timestamp)}</span>
          {log.correlationId && (
            <span className="font-mono truncate max-w-[120px]" title={log.correlationId}>
              {log.correlationId.slice(0, 8)}...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExecutionLogs({ taskId, limit = 50, showTaskLink = false }: ExecutionLogsProps) {
  const { data: logsData, isLoading, error } = useExecutionLogs({ taskId, limit });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load execution logs</p>
      </div>
    );
  }

  const logs = logsData?.data || [];

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock size={32} className="mx-auto mb-2 opacity-50" />
        <p>No execution logs yet</p>
        <p className="text-sm mt-1">Logs will appear here when tasks are executed</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {logs.map((log) => (
        <LogEntry key={log.id} log={log} showTaskLink={showTaskLink} />
      ))}
    </div>
  );
}
