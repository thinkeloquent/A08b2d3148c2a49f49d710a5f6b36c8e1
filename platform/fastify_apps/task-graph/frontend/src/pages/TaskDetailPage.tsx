import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import Select from 'react-select';
import {
  CheckCircle2,
  Loader2,
  SkipForward,
  Ban,
  Clock,
  Settings,
  GitBranch,
  FileText,
  ListTodo,
  Paperclip,
  MessageSquare,
  Trash2,
  ExternalLink } from
'lucide-react';
import { useTask, useCompleteTask, useFailTask, useUpdateTask } from '../hooks/useTasks';
import TaskDependencyGraph from '../components/graph/TaskDependencyGraph';
import ExecutionLogs from '../components/ExecutionLogs';
import {
  useSteps,
  useStepProgress,
  useBatchCreateSteps,
  useStartStep,
  useCompleteStep,
  useSkipStep,
  useBlockStep,
  useUnblockStep,
  useUpdateStep } from
'../hooks/useSteps';
import { useFilesByTask, useCreateFile, useUpdateFile, useDeleteFile } from '../hooks/useFiles';
import { useNotesByTask, useCreateNote, useDeleteNote } from '../hooks/useNotes';
import type { CreateStepInput, Step, StepStatus, TaskFile } from '../types';

type TabType = 'detail' | 'files' | 'notes' | 'logs';

export default function TaskDetailPage() {
  const { taskId } = useParams<{taskId: string;}>();
  const [activeTab, setActiveTab] = useState<TabType>('detail');
  const [newStepContent, setNewStepContent] = useState('');
  const [newStepToken, setNewStepToken] = useState('');
  const [newStepMetadata, setNewStepMetadata] = useState('');
  const [skipStepId, setSkipStepId] = useState<string | null>(null);
  const [skipReason, setSkipReason] = useState('');
  const [skipMetadata, setSkipMetadata] = useState('');
  const [blockStepId, setBlockStepId] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [blockMetadata, setBlockMetadata] = useState('');
  const [editStep, setEditStep] = useState<Step | null>(null);
  const [editStepMetadata, setEditStepMetadata] = useState('');
  const [showFailModal, setShowFailModal] = useState(false);
  const [failError, setFailError] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [attachFileToStep, setAttachFileToStep] = useState<TaskFile | null>(null);

  const { data: taskData, isLoading: taskLoading } = useTask(taskId!);
  const { data: stepsData } = useSteps(taskId!);
  const { data: progressData } = useStepProgress(taskId!);
  const { data: filesData } = useFilesByTask(taskId!);
  const { data: notesData } = useNotesByTask(taskId!);

  const completeTask = useCompleteTask();
  const failTask = useFailTask();
  const updateTask = useUpdateTask();
  const batchCreateSteps = useBatchCreateSteps();
  const createFile = useCreateFile();
  const updateFile = useUpdateFile();
  const deleteFile = useDeleteFile();
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();
  const startStep = useStartStep();
  const completeStep = useCompleteStep();
  const skipStep = useSkipStep();
  const blockStep = useBlockStep();
  const unblockStep = useUnblockStep();
  const updateStep = useUpdateStep();

  const task = taskData?.data;
  const steps = stepsData?.data?.steps || [];
  const progress = progressData?.data;
  const files = filesData?.data || [];
  const notes = notesData?.data || [];

  // Calculate execution statistics
  const executionStats = {
    total: steps.length,
    executed: steps.filter((s) =>
    s.status === 'COMPLETED' ||
    s.status === 'IN_PROGRESS' ||
    s.status === 'SKIPPED' ||
    s.status === 'BLOCKED'
    ).length,
    completed: steps.filter((s) => s.status === 'COMPLETED').length,
    skipped: steps.filter((s) => s.status === 'SKIPPED').length,
    blocked: steps.filter((s) => s.status === 'BLOCKED').length,
    inProgress: steps.filter((s) => s.status === 'IN_PROGRESS').length,
    pending: steps.filter((s) => s.status === 'PENDING').length
  };

  const handleAddStep = async () => {
    if (!taskId || !newStepContent.trim()) return;

    let metadata: Record<string, unknown> | undefined;
    if (newStepMetadata.trim()) {
      try {
        metadata = JSON.parse(newStepMetadata);
      } catch {
        alert('Invalid JSON in metadata field');
        return;
      }
    }

    const stepInput: CreateStepInput = {
      content: newStepContent.trim(),
      order: steps.length,
      token: newStepToken.trim() || undefined,
      metadata
    };

    await batchCreateSteps.mutateAsync({ taskId, steps: [stepInput] });
    setNewStepContent('');
    setNewStepToken('');
    setNewStepMetadata('');
  };

  const handleSkipStep = async () => {
    if (!skipStepId || !skipReason.trim()) return;

    let metadata: Record<string, unknown> | undefined;
    if (skipMetadata.trim()) {
      try {
        metadata = JSON.parse(skipMetadata);
      } catch {
        alert('Invalid JSON in metadata field');
        return;
      }
    }

    await skipStep.mutateAsync({
      stepId: skipStepId,
      taskId: taskId!,
      reason: skipReason,
      metadata
    });
    setSkipStepId(null);
    setSkipReason('');
    setSkipMetadata('');
  };

  const handleBlockStep = async () => {
    if (!blockStepId || !blockReason.trim()) return;

    let metadata: Record<string, unknown> | undefined;
    if (blockMetadata.trim()) {
      try {
        metadata = JSON.parse(blockMetadata);
      } catch {
        alert('Invalid JSON in metadata field');
        return;
      }
    }

    await blockStep.mutateAsync({
      stepId: blockStepId,
      taskId: taskId!,
      reason: blockReason,
      metadata
    });
    setBlockStepId(null);
    setBlockReason('');
    setBlockMetadata('');
  };

  const handleOpenEditStep = (step: Step) => {
    setEditStep(step);
    setEditStepMetadata(step.metadata ? JSON.stringify(step.metadata, null, 2) : '');
  };

  const handleUpdateStep = async () => {
    if (!editStep) return;

    let metadata: Record<string, unknown> | undefined;
    if (editStepMetadata.trim()) {
      try {
        metadata = JSON.parse(editStepMetadata);
      } catch {
        alert('Invalid JSON in metadata field');
        return;
      }
    }

    await updateStep.mutateAsync({
      stepId: editStep.id,
      taskId: taskId!,
      updates: {
        metadata
      }
    });
    setEditStep(null);
    setEditStepMetadata('');
  };

  const getStepIcon = (status: StepStatus) => {
    const iconProps = { size: 24, strokeWidth: 2 };
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 {...iconProps} className="text-green-600" />;
      case 'IN_PROGRESS':
        return <Loader2 {...iconProps} className="text-blue-600 animate-spin" />;
      case 'SKIPPED':
        return <SkipForward {...iconProps} className="text-purple-600" />;
      case 'BLOCKED':
        return <Ban {...iconProps} className="text-red-600" />;
      case 'PENDING':
      default:
        return <Clock {...iconProps} className="text-gray-500" />;
    }
  };

  const getStepColor = (status: StepStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'IN_PROGRESS':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'SKIPPED':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'BLOCKED':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'PENDING':
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const canStartStep = (step: Step): boolean => {
    if (step.status !== 'PENDING') return false;
    // Check if there are any non-completed/non-skipped steps before this one
    const blockingSteps = steps.filter(
      (s) =>
      s.order < step.order &&
      s.status !== 'COMPLETED' &&
      s.status !== 'SKIPPED'
    );
    return blockingSteps.length === 0;
  };

  if (taskLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>);

  }

  if (!task) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Task not found</p>
      </div>);

  }

  const statusClass = `status-${task.status.toLowerCase().replace('_', '-')}`;

  return (
    <div className="px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3" data-test-id="ol-a0af44d3">
          <li>
            <Link to="/" className="text-gray-700 hover:text-gray-900">
              Tasks
            </Link>
          </li>
          <li>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-500">{task.title}</span>
          </li>
        </ol>
      </nav>

      {/* Task header */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
            {task.description &&
            <p className="mt-2 text-gray-600">{task.description}</p>
            }
          </div>
          <div className="flex gap-2">
            <Link
              to={`/tasks/${taskId}/timeline`}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">

              View Timeline
            </Link>
            {(task.status === 'PENDING' || task.status === 'TODO') &&
            <>
                <button
                onClick={() => updateTask.mutate({ id: taskId!, input: { status: 'DONE' } })}
                disabled={updateTask.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50">

                  Complete Task
                </button>
                <button
                onClick={() => setShowFailModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">

                  Fail Task
                </button>
              </>
            }
            {task.status === 'IN_PROGRESS' &&
            <>
                <button
                onClick={() => completeTask.mutate(taskId!)}
                disabled={completeTask.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50">

                  Complete Task
                </button>
                <button
                onClick={() => setShowFailModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">

                  Fail Task
                </button>
              </>
            }
            {task.status === 'BLOCKED' &&
            <button
              onClick={() => updateTask.mutate({ id: taskId!, input: { status: 'PENDING' } })}
              disabled={updateTask.isPending}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700 disabled:opacity-50">

                Unblock Task
              </button>
            }
            {(task.status === 'FAILED' || task.status === 'RETRYING') &&
            <button
              onClick={() => updateTask.mutate({ id: taskId!, input: { status: 'PENDING' } })}
              disabled={updateTask.isPending}
              className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 disabled:opacity-50">

                Retry Task
              </button>
            }
            {task.status === 'DONE' &&
            <button
              onClick={() => updateTask.mutate({ id: taskId!, input: { status: 'PENDING' } })}
              disabled={updateTask.isPending}
              className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 disabled:opacity-50">

                Reopen Task
              </button>
            }
            {task.status === 'SKIPPED' &&
            <button
              onClick={() => updateTask.mutate({ id: taskId!, input: { status: 'PENDING' } })}
              disabled={updateTask.isPending}
              className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50">

                Reactivate Task
              </button>
            }
          </div>
        </div>

        {/* Progress bar */}
        {progress && progress.totalSteps > 0 &&
        <div className="mt-6">
            <div className="flex justify-between items-center text-sm mb-2">
              <div className="flex items-center gap-3">
                <span className="text-gray-900 font-medium">
                  Progress: {progress.completedSteps} / {progress.totalSteps} steps
                </span>
                <span className="text-gray-500">|</span>
                <span className="text-blue-600 font-medium">
                  Executed: {executionStats.executed}/{executionStats.total}
                </span>
                {executionStats.skipped > 0 &&
              <>
                    <span className="text-gray-400">|</span>
                    <span className="text-purple-600">
                      {executionStats.skipped} skipped
                    </span>
                  </>
              }
                {executionStats.blocked > 0 &&
              <>
                    <span className="text-gray-400">|</span>
                    <span className="text-red-600">
                      {executionStats.blocked} blocked
                    </span>
                  </>
              }
              </div>
              <span className="text-gray-700 font-medium">{progress.progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress.progressPercentage}%` }} />

            </div>
          </div>
        }
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('detail')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'detail' ?
            'border-blue-500 text-blue-600' :
            'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
            } data-test-id="button-e63a7625">

            <ListTodo size={18} />
            Detail
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'files' ?
            'border-blue-500 text-blue-600' :
            'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
            } data-test-id="button-a905255b">

            <Paperclip size={18} />
            Files ({files.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'notes' ?
            'border-blue-500 text-blue-600' :
            'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
            } data-test-id="button-c222a390">

            <MessageSquare size={18} />
            Notes ({notes.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'logs' ?
            'border-blue-500 text-blue-600' :
            'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
            } data-test-id="button-12e448b9">

            <FileText size={18} />
            Logs
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'detail' &&
      <>
          {/* Dependencies Graph */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <GitBranch size={20} data-test-id="gitbranch-48c1c718" />
              Dependencies
            </h2>
            <TaskDependencyGraph taskId={taskId!} />
          </div>

          {/* Steps */}
          <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Steps</h2>

        {steps.length > 0 ?
          <ul className="space-y-3 mb-6">
            {steps.map((step) => {
              const isNextAvailable = progress?.nextAvailableStep?.id === step.id;
              return (
                <li
                  key={step.id}
                  className={`flex flex-col gap-2 p-4 border-2 rounded-lg ${getStepColor(step.status)} ${isNextAvailable ? 'ring-2 ring-blue-400' : ''}`}>

                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">{getStepIcon(step.status)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={step.status === 'COMPLETED' ? 'line-through text-gray-500' : 'font-medium'}>
                          {step.content}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/50">
                          {step.status.replace('_', ' ')}
                        </span>
                        {isNextAvailable &&
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500 text-white">
                            NEXT
                          </span>
                        }
                      </div>
                      {step.token &&
                      <p className="text-xs mt-1 text-gray-600 font-mono">
                          Token: {step.token}
                        </p>
                      }
                      {step.metadata && Object.keys(step.metadata).length > 0 &&
                      <p className="text-xs mt-1 text-gray-600 font-mono">
                          Metadata: {JSON.stringify(step.metadata)}
                        </p>
                      }
                      {step.skipReason &&
                      <p className="text-sm mt-1 text-purple-700">
                          Skip reason: {step.skipReason}
                        </p>
                      }
                      {step.blockedReason &&
                      <p className="text-sm mt-1 text-red-700">
                          Blocked: {step.blockedReason}
                        </p>
                      }
                      {/* Files attached to this step */}
                      {files.filter((f) => f.stepId === step.id).length > 0 &&
                      <div className="mt-2 flex flex-wrap gap-2">
                          {files.
                        filter((f) => f.stepId === step.id).
                        map((file) =>
                        <a
                          key={file.id}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">

                                <Paperclip size={12} />
                                {file.fileName}
                              </a>
                        )}
                        </div>
                      }
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEditStep(step)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title="Edit metadata">

                        <Settings size={18} />
                      </button>
                      {step.status === 'PENDING' && canStartStep(step) &&
                      <button
                        onClick={() => startStep.mutate({ stepId: step.id, taskId: taskId! })}
                        disabled={startStep.isPending}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">

                          Start
                        </button>
                      }
                      {step.status === 'IN_PROGRESS' &&
                      <>
                          <button
                          onClick={() => completeStep.mutate({ stepId: step.id, taskId: taskId! })}
                          disabled={completeStep.isPending}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">

                            Complete
                          </button>
                          <button
                          onClick={() => setSkipStepId(step.id)}
                          className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700">

                            Skip
                          </button>
                          <button
                          onClick={() => setBlockStepId(step.id)}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">

                            Block
                          </button>
                        </>
                      }
                      {step.status === 'BLOCKED' &&
                      <button
                        onClick={() => unblockStep.mutate({ stepId: step.id, taskId: taskId! })}
                        disabled={unblockStep.isPending}
                        className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50">

                          Unblock
                        </button>
                      }
                    </div>
                  </div>
                </li>);

            })}
          </ul> :

          <p className="text-gray-500 mb-6">No steps yet. Add steps to track progress.</p>
          }

        {/* Add step form */}
        <div className="space-y-3">
          <div>
            <label htmlFor="stepContent" className="block text-sm font-medium text-gray-700 mb-2">
              Step Content
            </label>
            <textarea
                id="stepContent"
                rows={3}
                value={newStepContent}
                onChange={(e) => setNewStepContent(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter step description" />

          </div>
          <div>
            <label htmlFor="stepToken" className="block text-sm font-medium text-gray-700 mb-2">
              Idempotency Key (Optional)
            </label>
            <input
                id="stepToken"
                type="text"
                value={newStepToken}
                onChange={(e) => setNewStepToken(e.target.value.toUpperCase())}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                placeholder="EXAMPLE123TOKEN"
                pattern="[A-Z0-9]*" />

            <p className="mt-1 text-xs text-gray-500">
              All caps alphanumeric only (A-Z, 0-9). Used to prevent duplicate step creation.
            </p>
          </div>
          <div>
            <label htmlFor="stepMetadata" className="block text-sm font-medium text-gray-700 mb-2">
              Metadata (Optional)
            </label>
            <textarea
                id="stepMetadata"
                rows={3}
                value={newStepMetadata}
                onChange={(e) => setNewStepMetadata(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                placeholder='{"key": "value", "priority": 1}' />

            <p className="mt-1 text-xs text-gray-500">
              JSON object with any custom fields. Example: {`{"priority": 1, "category": "backend"}`}
            </p>
          </div>
          <button
              onClick={handleAddStep}
              disabled={!newStepContent.trim() || batchCreateSteps.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">

            {batchCreateSteps.isPending ? 'Adding...' : 'Add Step'}
          </button>
        </div>
      </div>

          {/* Skip Step Modal */}
      {skipStepId &&
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Skip Step</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="skipReason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for skipping
                </label>
                <textarea
                  id="skipReason"
                  rows={3}
                  value={skipReason}
                  onChange={(e) => setSkipReason(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="Enter reason for skipping this step..." />

              </div>
              <div>
                <label htmlFor="skipMetadata" className="block text-sm font-medium text-gray-700 mb-2">
                  Metadata (Optional)
                </label>
                <textarea
                  id="skipMetadata"
                  rows={2}
                  value={skipMetadata}
                  onChange={(e) => setSkipMetadata(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm font-mono"
                  placeholder='{"skipType": "manual"}' />

                <p className="mt-1 text-xs text-gray-500">
                  JSON object to add/update step metadata
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => {
                  setSkipStepId(null);
                  setSkipReason('');
                  setSkipMetadata('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">

                Cancel
              </button>
              <button
                onClick={handleSkipStep}
                disabled={!skipReason.trim() || skipStep.isPending}
                className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50">

                {skipStep.isPending ? 'Skipping...' : 'Skip Step'}
              </button>
            </div>
          </div>
        </div>
        }

      {/* Block Step Modal */}
      {blockStepId &&
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Block Step</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="blockReason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for blocking
                </label>
                <textarea
                  id="blockReason"
                  rows={3}
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Enter reason for blocking this step..." />

              </div>
              <div>
                <label htmlFor="blockMetadata" className="block text-sm font-medium text-gray-700 mb-2">
                  Metadata (Optional)
                </label>
                <textarea
                  id="blockMetadata"
                  rows={2}
                  value={blockMetadata}
                  onChange={(e) => setBlockMetadata(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm font-mono"
                  placeholder='{"blocker": "external dependency"}' />

                <p className="mt-1 text-xs text-gray-500">
                  JSON object to add/update step metadata
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => {
                  setBlockStepId(null);
                  setBlockReason('');
                  setBlockMetadata('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">

                Cancel
              </button>
              <button
                onClick={handleBlockStep}
                disabled={!blockReason.trim() || blockStep.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50">

                {blockStep.isPending ? 'Blocking...' : 'Block Step'}
              </button>
            </div>
          </div>
        </div>
        }

      {/* Edit Step Modal */}
      {editStep &&
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Step</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Step Content (Read-only)
                </label>
                <div className="block w-full border border-gray-200 rounded-md bg-gray-50 py-2 px-3 text-sm text-gray-600">
                  {editStep.content}
                </div>
              </div>
              {editStep.token &&
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Idempotency Key (Read-only)
                  </label>
                  <div className="block w-full border border-gray-200 rounded-md bg-gray-50 py-2 px-3 text-sm text-gray-600 font-mono">
                    {editStep.token}
                  </div>
                </div>
              }

              {/* Files Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Associate Files
                </label>
                {files.length === 0 ?
                <p className="text-sm text-gray-500">No files available. Add files in the Files tab first.</p> :

                <Select
                  isMulti
                  options={files.map((file) => ({
                    value: file.id,
                    label: file.fileName,
                    isAttachedToOther: file.stepId && file.stepId !== editStep.id
                  }))}
                  value={files.
                  filter((file) => file.stepId === editStep.id).
                  map((file) => ({ value: file.id, label: file.fileName }))}
                  onChange={(selected) => {
                    const selectedIds = new Set((selected || []).map((s) => s.value));
                    // Find files to attach (newly selected)
                    files.forEach((file) => {
                      const wasAttached = file.stepId === editStep.id;
                      const isNowSelected = selectedIds.has(file.id);
                      if (!wasAttached && isNowSelected) {
                        updateFile.mutate({
                          fileId: file.id,
                          stepId: editStep.id,
                          taskId: taskId!
                        });
                      } else if (wasAttached && !isNowSelected) {
                        updateFile.mutate({
                          fileId: file.id,
                          stepId: null,
                          taskId: taskId!
                        });
                      }
                    });
                  }}
                  formatOptionLabel={(option: {value: string;label: string;isAttachedToOther?: boolean;}) =>
                  <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Paperclip size={14} className="text-gray-400" />
                          <span>{option.label}</span>
                        </div>
                        {option.isAttachedToOther &&
                    <span className="text-xs text-orange-600">(on another step)</span>
                    }
                      </div>
                  }
                  placeholder="Select files to attach..."
                  className="text-sm"
                  classNamePrefix="react-select" />

                }
              </div>

              <div>
                <label htmlFor="editStepMetadata" className="block text-sm font-medium text-gray-700 mb-2">
                  Metadata (Editable)
                </label>
                <textarea
                  id="editStepMetadata"
                  rows={4}
                  value={editStepMetadata}
                  onChange={(e) => setEditStepMetadata(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                  placeholder='{"key": "value", "priority": 1}' />

                <p className="mt-1 text-xs text-gray-500">
                  JSON object with any custom fields.
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => {
                  setEditStep(null);
                  setEditStepMetadata('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">

                Close
              </button>
              <button
                onClick={handleUpdateStep}
                disabled={updateStep.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">

                {updateStep.isPending ? 'Saving...' : 'Save Metadata'}
              </button>
            </div>
          </div>
        </div>
        }

      {/* Fail Task Modal */}
      {showFailModal &&
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fail Task</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="failError" className="block text-sm font-medium text-gray-700 mb-2">
                  Error Message
                </label>
                <textarea
                  id="failError"
                  rows={4}
                  value={failError}
                  onChange={(e) => setFailError(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Describe what went wrong..." />

              </div>
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowFailModal(false);
                  setFailError('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">

                Cancel
              </button>
              <button
                onClick={async () => {
                  await failTask.mutateAsync({ taskId: taskId!, error: failError || undefined });
                  setShowFailModal(false);
                  setFailError('');
                }}
                disabled={failTask.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50">

                {failTask.isPending ? 'Failing...' : 'Fail Task'}
              </button>
            </div>
          </div>
        </div>
        }
        </>
      }

      {/* Files Tab */}
      {activeTab === 'files' &&
      <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Paperclip size={20} data-test-id="paperclip-0c70785e" />
            Files
          </h2>

          {/* Add file form */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Add File Reference</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="File name"
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm" />

              <input
              type="text"
              value={newFileUrl}
              onChange={(e) => setNewFileUrl(e.target.value)}
              placeholder="File URL"
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm" />

            </div>
            <button
            onClick={async () => {
              if (!newFileName.trim() || !newFileUrl.trim()) return;
              await createFile.mutateAsync({
                fileName: newFileName.trim(),
                url: newFileUrl.trim(),
                taskId: taskId!
              });
              setNewFileName('');
              setNewFileUrl('');
            }}
            disabled={!newFileName.trim() || !newFileUrl.trim() || createFile.isPending}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">

              {createFile.isPending ? 'Adding...' : 'Add File'}
            </button>
          </div>

          {/* Files list */}
          {files.length === 0 ?
        <p className="text-gray-500 text-center py-8">No files attached</p> :

        <div className="space-y-3">
              {files.map((file) =>
          <div
            key={file.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Paperclip size={16} className="text-gray-400" />
                      <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-800 truncate">

                        {file.fileName}
                      </a>
                      <ExternalLink size={14} className="text-gray-400" />
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {file.stepId ?
                <span className="text-green-600">
                          Attached to step: {steps.find((s) => s.id === file.stepId)?.content?.slice(0, 30) || file.stepId}
                        </span> :

                <span>Not attached to any step</span>
                }
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                onClick={() => setAttachFileToStep(file)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">

                      {file.stepId ? 'Change Step' : 'Attach to Step'}
                    </button>
                    <button
                onClick={() => deleteFile.mutate({ fileId: file.id, taskId: taskId! })}
                disabled={deleteFile.isPending}
                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded">

                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
          )}
            </div>
        }
        </div>
      }

      {/* Attach File to Step Modal */}
      {attachFileToStep &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Attach File to Step
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Select a step to attach <strong>{attachFileToStep.fileName}</strong> to:
            </p>
            <Select
            isClearable
            options={steps.map((step) => ({
              value: step.id,
              label: step.content
            }))}
            value={
            attachFileToStep.stepId ?
            {
              value: attachFileToStep.stepId,
              label: steps.find((s) => s.id === attachFileToStep.stepId)?.content || attachFileToStep.stepId
            } :
            null
            }
            onChange={async (selected) => {
              await updateFile.mutateAsync({
                fileId: attachFileToStep.id,
                stepId: selected?.value || null,
                taskId: taskId!
              });
              setAttachFileToStep(null);
            }}
            placeholder="Select a step (or leave empty for task-level)..."
            className="text-sm"
            classNamePrefix="react-select" />

            <div className="mt-4 flex justify-end">
              <button
              onClick={() => setAttachFileToStep(null)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">

                Cancel
              </button>
            </div>
          </div>
        </div>
      }

      {/* Notes Tab */}
      {activeTab === 'notes' &&
      <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare size={20} data-test-id="messagesquare-286b4a65" />
            Notes
          </h2>

          {/* Add note form */}
          <div className="mb-6">
            <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Add a note..."
            rows={3}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm" />

            <button
            onClick={async () => {
              if (!newNoteContent.trim()) return;
              await createNote.mutateAsync({
                content: newNoteContent.trim(),
                taskId: taskId!
              });
              setNewNoteContent('');
            }}
            disabled={!newNoteContent.trim() || createNote.isPending}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">

              {createNote.isPending ? 'Adding...' : 'Add Note'}
            </button>
          </div>

          {/* Notes list */}
          {notes.length === 0 ?
        <p className="text-gray-500 text-center py-8">No notes yet</p> :

        <div className="space-y-4">
              {notes.map((note) =>
          <div
            key={note.id}
            className="p-4 border rounded-lg">

                  <div className="flex justify-between items-start">
                    <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
                    <button
                onClick={() => deleteNote.mutate({ noteId: note.id, taskId: taskId! })}
                disabled={deleteNote.isPending}
                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded ml-2">

                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                </div>
          )}
            </div>
        }
        </div>
      }

      {/* Logs Tab */}
      {activeTab === 'logs' &&
      <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} data-test-id="filetext-bf6ae1c5" />
            Execution Logs
          </h2>
          <ExecutionLogs taskId={taskId} limit={100} />
        </div>
      }
    </div>);

}