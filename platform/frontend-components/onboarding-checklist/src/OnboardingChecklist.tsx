import { useState } from 'react';
import type {
  OnboardingChecklistProps,
  ProgressBarProps,
  TaskItemProps,
} from './types';

const DefaultCheckIcon = () => (
  <svg
    className="w-4 h-4 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ChevronDownIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    className={['w-4 h-4 text-gray-500 transition-transform duration-200', isOpen ? 'rotate-180' : ''].filter(Boolean).join(' ')}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

export function ProgressBar({ completedCount, totalCount, className }: ProgressBarProps) {
  const segments = Array.from({ length: totalCount }, (_, i) => i < completedCount);

  return (
    <div className={['flex gap-1.5 mt-3', className].filter(Boolean).join(' ')}>
      {segments.map((filled, index) => (
        <div
          key={index}
          className={[
            'h-1.5 flex-1 rounded-full transition-all duration-500',
            filled ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-200',
          ].filter(Boolean).join(' ')}
        />
      ))}
    </div>
  );
}

export function TaskItem({ task, onToggle, checkIcon, className }: TaskItemProps) {
  return (
    <div
      className={[
        'flex items-center justify-between py-4 px-2 -mx-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-50/50',
        className,
      ].filter(Boolean).join(' ')}
      onClick={onToggle}
    >
      <span
        className={[
          'text-base font-medium transition-colors duration-300',
          task.completed
            ? 'text-gray-400 line-through decoration-gray-400'
            : 'text-gray-800',
        ].filter(Boolean).join(' ')}
      >
        {task.label}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className={[
          'w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer',
          task.completed
            ? 'bg-blue-500 shadow-md shadow-blue-200'
            : 'border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50',
        ].filter(Boolean).join(' ')}
      >
        {task.completed && (checkIcon ?? <DefaultCheckIcon />)}
      </button>
    </div>
  );
}

export function OnboardingChecklist({
  tasks,
  onToggleTask,
  userName,
  title = 'Get started',
  subtitle = "Let's get set up for success",
  dismissLabel = 'Dismiss',
  onDismiss,
  greetingIcon,
  completionMessage,
  checkIcon,
  className,
}: OnboardingChecklistProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  return (
    <div className={['w-full max-w-sm', className].filter(Boolean).join(' ')}>
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-t-2xl px-5 py-4 border border-gray-200 border-b-0">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800 tracking-tight">
            {title}
          </h2>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span className="font-medium">{completedCount}/{totalCount}</span>
            <ChevronDownIcon isOpen={dropdownOpen} />
          </button>
        </div>
        <ProgressBar completedCount={completedCount} totalCount={totalCount} />
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-b-2xl shadow-xl shadow-gray-200/50 border border-gray-200 border-t-0 overflow-hidden">
        {/* Greeting */}
        <div className="px-6 pt-6 pb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            Hi {userName} {greetingIcon ?? <span className="inline-block">👋</span>}
          </h3>
          <p className="text-gray-500 text-sm">{subtitle}</p>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-gray-200" />

        {/* Tasks List */}
        <div className="px-6 py-2">
          {tasks.map((task, index) => (
            <div key={task.id}>
              <TaskItem
                task={task}
                onToggle={() => onToggleTask(task.id)}
                checkIcon={checkIcon}
              />
              {index < tasks.length - 1 && (
                <div className="h-px bg-gray-100 mx-2" />
              )}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-gray-200" />

        {/* Dismiss Button */}
        {onDismiss && (
          <div className="p-4">
            <button
              onClick={onDismiss}
              className="w-full py-3 px-4 rounded-xl text-gray-700 font-semibold text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all duration-200 active:scale-95"
            >
              {dismissLabel}
            </button>
          </div>
        )}
      </div>

      {/* Completion Message */}
      {completedCount === totalCount && completionMessage && (
        <div className="mt-4 text-center">{completionMessage}</div>
      )}
    </div>
  );
}
