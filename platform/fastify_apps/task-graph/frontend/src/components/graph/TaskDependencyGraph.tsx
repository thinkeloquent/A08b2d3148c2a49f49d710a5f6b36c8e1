import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Plus, X } from 'lucide-react';
import { useDependencyGraph, useCreateDependency, useRemoveDependency } from '../../hooks/useDependencies';
import { useTasks } from '../../hooks/useTasks';
import type { TaskStatus } from '../../types';

interface TaskDependencyGraphProps {
  taskId: string;
}

const getStatusBadgeClass = (status: TaskStatus): string => {
  const classes: Record<TaskStatus, string> = {
    PENDING: 'bg-gray-100 text-gray-700',
    TODO: 'bg-gray-200 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    DONE: 'bg-green-100 text-green-700',
    BLOCKED: 'bg-yellow-100 text-yellow-700',
    SKIPPED: 'bg-purple-100 text-purple-700',
    RETRYING: 'bg-orange-100 text-orange-700',
    FAILED: 'bg-red-100 text-red-700'
  };
  return classes[status] || 'bg-gray-100 text-gray-700';
};

export default function TaskDependencyGraph({ taskId }: TaskDependencyGraphProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [dependencyType, setDependencyType] = useState<'prerequisite' | 'dependent'>('prerequisite');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [allowSkip, setAllowSkip] = useState(false);

  const { data: graphData, isLoading } = useDependencyGraph(taskId);
  const { data: tasksData } = useTasks({ limit: 100 });
  const createDependency = useCreateDependency();
  const removeDependency = useRemoveDependency();

  const graph = graphData?.data;
  const allTasks = tasksData?.data || [];

  // Find prerequisites (tasks this task depends on)
  const prerequisites = graph?.dependencies.
  filter((d) => d.dependentId === taskId).
  map((d) => {
    const task = graph.tasks.find((t) => t.id === d.prerequisiteId);
    return { ...d, task };
  }).
  filter((d) => d.task) || [];

  // Find dependents (tasks that depend on this task)
  const dependents = graph?.dependencies.
  filter((d) => d.prerequisiteId === taskId).
  map((d) => {
    const task = graph.tasks.find((t) => t.id === d.dependentId);
    return { ...d, task };
  }).
  filter((d) => d.task) || [];

  // Get IDs of tasks already in dependencies
  const existingPrerequisiteIds = prerequisites.map((d) => d.prerequisiteId);
  const existingDependentIds = dependents.map((d) => d.dependentId);

  // Filter available tasks for the dropdown (exclude current task and existing dependencies)
  const availableTasks = allTasks.filter((t) => {
    if (t.id === taskId) return false;
    if (dependencyType === 'prerequisite') {
      return !existingPrerequisiteIds.includes(t.id);
    } else {
      return !existingDependentIds.includes(t.id);
    }
  });

  const handleAddDependency = async () => {
    if (!selectedTaskId) return;

    const input = dependencyType === 'prerequisite' ?
    { prerequisiteId: selectedTaskId, dependentId: taskId, allowSkip } :
    { prerequisiteId: taskId, dependentId: selectedTaskId, allowSkip };

    await createDependency.mutateAsync(input);
    setSelectedTaskId('');
    setAllowSkip(false);
    setShowAddForm(false);
  };

  const handleRemoveDependency = async (prerequisiteId: string, dependentId: string) => {
    await removeDependency.mutateAsync({ prerequisiteId, dependentId });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>);

  }

  return (
    <div className="space-y-4">
      {/* Prerequisites */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
          <ArrowLeft size={14} data-test-id="arrowleft-48e2bfe2" />
          Prerequisites ({prerequisites.length})
        </h4>
        {prerequisites.length > 0 ?
        <ul className="space-y-1">
            {prerequisites.map((dep) =>
          <li
            key={dep.prerequisiteId}
            className="flex items-center gap-2 text-sm group">

                <Link
              to={`/tasks/${dep.task!.id}`}
              className="text-blue-600 hover:text-blue-800 hover:underline">

                  {dep.task!.title}
                </Link>
                <span className={`px-1.5 py-0.5 rounded text-xs ${getStatusBadgeClass(dep.task!.status)}`}>
                  {dep.task!.status}
                </span>
                {dep.allowSkip &&
            <span className="text-xs text-gray-400">(skippable)</span>
            }
                <button
              onClick={() => handleRemoveDependency(dep.prerequisiteId, dep.dependentId)}
              disabled={removeDependency.isPending}
              className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all"
              title="Remove dependency">

                  <X size={14} />
                </button>
              </li>
          )}
          </ul> :

        <p className="text-gray-400 text-sm">No prerequisites</p>
        }
      </div>

      {/* Dependents */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
          <ArrowRight size={14} data-test-id="arrowright-8a3666b3" />
          Dependents ({dependents.length})
        </h4>
        {dependents.length > 0 ?
        <ul className="space-y-1">
            {dependents.map((dep) =>
          <li
            key={dep.dependentId}
            className="flex items-center gap-2 text-sm group">

                <Link
              to={`/tasks/${dep.task!.id}`}
              className="text-blue-600 hover:text-blue-800 hover:underline">

                  {dep.task!.title}
                </Link>
                <span className={`px-1.5 py-0.5 rounded text-xs ${getStatusBadgeClass(dep.task!.status)}`}>
                  {dep.task!.status}
                </span>
                {dep.allowSkip &&
            <span className="text-xs text-gray-400">(skippable)</span>
            }
                <button
              onClick={() => handleRemoveDependency(dep.prerequisiteId, dep.dependentId)}
              disabled={removeDependency.isPending}
              className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all"
              title="Remove dependency">

                  <X size={14} />
                </button>
              </li>
          )}
          </ul> :

        <p className="text-gray-400 text-sm">No dependents</p>
        }
      </div>

      {/* Add Dependency Form */}
      {showAddForm ?
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Add Dependency</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Type</label>
              <select
              value={dependencyType}
              onChange={(e) => {
                setDependencyType(e.target.value as 'prerequisite' | 'dependent');
                setSelectedTaskId('');
              }}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500">

                <option value="prerequisite">Add prerequisite (this task depends on...)</option>
                <option value="dependent">Add dependent (... depends on this task)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Task</label>
              <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500">

                <option value="">Select a task...</option>
                {availableTasks.map((t) =>
              <option key={t.id} value={t.id}>
                    {t.title} ({t.status})
                  </option>
              )}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
              type="checkbox"
              id="allowSkip"
              checked={allowSkip}
              onChange={(e) => setAllowSkip(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />

              <label htmlFor="allowSkip" className="text-sm text-gray-600">
                Allow skip (dependency can be skipped)
              </label>
            </div>
            <div className="flex gap-2">
              <button
              onClick={handleAddDependency}
              disabled={!selectedTaskId || createDependency.isPending}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">

                {createDependency.isPending ? 'Adding...' : 'Add'}
              </button>
              <button
              onClick={() => {
                setShowAddForm(false);
                setSelectedTaskId('');
                setAllowSkip(false);
              }}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100">

                Cancel
              </button>
            </div>
          </div>
        </div> :

      <button
        onClick={() => setShowAddForm(true)}
        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">

          <Plus size={16} />
          Add Dependency
        </button>
      }
    </div>);

}