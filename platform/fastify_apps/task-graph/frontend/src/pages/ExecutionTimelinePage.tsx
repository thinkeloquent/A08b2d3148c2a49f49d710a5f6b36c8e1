import { useParams, Link } from 'react-router-dom';
import { useExecutionTimeline } from '../hooks/useExecutions';
import { useTask } from '../hooks/useTasks';

export default function ExecutionTimelinePage() {
  const { taskId } = useParams<{taskId: string;}>();
  const { data: taskData } = useTask(taskId!);
  const { data: timelineData, isLoading } = useExecutionTimeline(taskId!);

  const task = taskData?.data;
  const timeline = timelineData?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>);

  }

  return (
    <div className="px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3" data-test-id="ol-58eb1768">
          <li>
            <Link to="/" className="text-gray-700 hover:text-gray-900">
              Tasks
            </Link>
          </li>
          <li>
            <span className="mx-2 text-gray-400">/</span>
            <Link to={`/tasks/${taskId}`} className="text-gray-700 hover:text-gray-900">
              {task?.title || 'Task'}
            </Link>
          </li>
          <li>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-500">Timeline</span>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Execution Timeline</h1>
        {timeline &&
        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
            <div>
              <span className="text-gray-500">Total Events:</span>
              <span className="ml-2 font-medium">{timeline.totalEvents}</span>
            </div>
            {timeline.startedAt &&
          <div>
                <span className="text-gray-500">Started:</span>
                <span className="ml-2 font-medium">
                  {new Date(timeline.startedAt).toLocaleString()}
                </span>
              </div>
          }
            {timeline.duration &&
          <div>
                <span className="text-gray-500">Duration:</span>
                <span className="ml-2 font-medium">{(timeline.duration / 1000).toFixed(2)}s</span>
              </div>
          }
          </div>
        }
      </div>

      {/* Timeline events */}
      <div className="bg-white shadow rounded-lg p-6">
        {timeline && timeline.events.length > 0 ?
        <div className="space-y-4">
            {timeline.events.map((event) =>
          <div
            key={event.id}
            className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">

                <div className="flex-shrink-0 w-24 text-xs text-gray-500">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {event.eventType}
                    </span>
                    <span className="text-xs text-gray-500">{event.entity}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-900">{event.summary}</p>
                  {Object.keys(event.details).length > 0 &&
              <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-auto">
                      {JSON.stringify(event.details, null, 2)}
                    </pre>
              }
                </div>
              </div>
          )}
          </div> :

        <div className="text-center py-12">
            <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor" data-test-id="svg-ed15a0fc">

              <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />

            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No execution events</h3>
            <p className="mt-1 text-sm text-gray-500">
              Events will appear here once the task execution starts.
            </p>
          </div>
        }
      </div>
    </div>);

}