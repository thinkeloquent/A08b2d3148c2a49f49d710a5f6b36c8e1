import { FileText } from 'lucide-react';
import ExecutionLogs from '../components/ExecutionLogs';

export default function RecentLogsPage() {
  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText size={28} data-test-id="filetext-848591cc" />
          Recent Logs
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          View execution logs across all tasks
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <ExecutionLogs limit={100} showTaskLink={true} />
      </div>
    </div>);

}