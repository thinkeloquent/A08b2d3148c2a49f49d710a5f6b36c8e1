import { useState } from 'react';
import type {
  AgentChecklistProps,
  AgentChecklistPhase,
  CheckboxProps,
  CodeBadgeProps,
  TagProps,
  TagVariants,
  SubTaskProps,
  TaskItemProps,
  PhaseProps,
} from './types';

const DEFAULT_TAG_VARIANTS: TagVariants = {
  default: 'text-gray-400',
  user: 'text-amber-400',
  js: 'text-yellow-400',
  py: 'text-blue-400',
};

/** Animated checkbox with checked/indeterminate states */
export function Checkbox({ checked, indeterminate, onChange, className }: CheckboxProps) {
  return (
    <button
      onClick={onChange}
      className={[
        'w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200',
        checked
          ? 'bg-emerald-500 border-emerald-500'
          : indeterminate
            ? 'bg-emerald-500/50 border-emerald-500'
            : 'border-gray-500 hover:border-gray-400 bg-transparent',
        className,
      ].filter(Boolean).join(' ')}
    >
      {checked && (
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {indeterminate && !checked && (
        <div className="w-2 h-0.5 bg-white rounded" />
      )}
    </button>
  );
}

/** Inline code badge */
export function CodeBadge({ children, className }: CodeBadgeProps) {
  return (
    <code className={['px-2 py-0.5 bg-gray-700/80 text-gray-300 text-sm rounded font-mono', className].filter(Boolean).join(' ')}>
      {children}
    </code>
  );
}

/** Colored tag label */
export function Tag({ children, variant = 'default', variants, className }: TagProps) {
  const merged = { ...DEFAULT_TAG_VARIANTS, ...variants };
  const colorClass = merged[variant] || merged.default;
  return (
    <span className={['text-sm', colorClass, className].filter(Boolean).join(' ')}>
      {children}
    </span>
  );
}

/** A single subtask row */
export function SubTask({ task, level = 0, onToggle, tagVariants, className }: SubTaskProps) {
  const paddingLeft = `${(level + 1) * 24}px`;
  return (
    <div
      className={['flex items-start gap-3 py-1.5 hover:bg-white/5 rounded px-2 transition-colors group', className].filter(Boolean).join(' ')}
      style={{ paddingLeft }}
    >
      <div className="mt-0.5">
        <Checkbox checked={task.checked} onChange={() => onToggle(task.id)} />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-gray-300">
        <span className={task.checked ? 'text-gray-500' : ''}>{task.label}</span>
        {task.code && <CodeBadge>{task.code}</CodeBadge>}
        {task.tag && <Tag variant={task.tagVariant} variants={tagVariants}>{task.tag}</Tag>}
      </div>
    </div>
  );
}

/** A task row with optional nested subtasks */
export function TaskItem({ task, onToggle, onToggleSubtask, tagVariants, className }: TaskItemProps) {
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const allSubtasksChecked = hasSubtasks && task.subtasks!.every(st => st.checked);
  const someSubtasksChecked = hasSubtasks && task.subtasks!.some(st => st.checked) && !allSubtasksChecked;

  return (
    <div className={['mb-1', className].filter(Boolean).join(' ')}>
      <div className="flex items-start gap-3 py-1.5 hover:bg-white/5 rounded px-2 transition-colors group">
        <div className="mt-0.5">
          <Checkbox
            checked={hasSubtasks ? allSubtasksChecked : task.checked}
            indeterminate={someSubtasksChecked}
            onChange={() => onToggle(task.id)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-gray-200">
          <span className={task.checked || allSubtasksChecked ? 'text-gray-500' : ''}>{task.label}</span>
          {task.code && <CodeBadge>{task.code}</CodeBadge>}
          {task.tag && <Tag variant={task.tagVariant} variants={tagVariants}>{task.tag}</Tag>}
        </div>
      </div>
      {hasSubtasks && (
        <div className="ml-2">
          {task.subtasks!.map(subtask => (
            <SubTask
              key={subtask.id}
              task={subtask}
              level={1}
              onToggle={(id) => onToggleSubtask(task.id, id)}
              tagVariants={tagVariants}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** A collapsible phase section with progress bar */
export function Phase({ phase, onToggleTask, onToggleSubtask, onTogglePhase, tagVariants, className }: PhaseProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const allTasksComplete = phase.tasks.every(task => {
    if (task.subtasks && task.subtasks.length > 0) return task.subtasks.every(st => st.checked);
    return task.checked;
  });

  const completedCount = phase.tasks.reduce((acc, task) => {
    if (task.subtasks && task.subtasks.length > 0) return acc + task.subtasks.filter(st => st.checked).length;
    return acc + (task.checked ? 1 : 0);
  }, 0);

  const totalCount = phase.tasks.reduce((acc, task) => {
    if (task.subtasks && task.subtasks.length > 0) return acc + task.subtasks.length;
    return acc + 1;
  }, 0);

  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className={['mb-6', className].filter(Boolean).join(' ')}>
      <div
        className="flex items-center gap-3 mb-3 cursor-pointer group"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Checkbox
          checked={allTasksComplete}
          onChange={(e) => {
            e.stopPropagation();
            onTogglePhase(phase.id);
          }}
        />
        <h2 className="text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors">
          {phase.title}
        </h2>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-gray-500">{completedCount}/{totalCount}</span>
          <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <svg
            className={['w-5 h-5 text-gray-500 transition-transform duration-200', isCollapsed ? '-rotate-90' : ''].filter(Boolean).join(' ')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {!isCollapsed && (
        <div className="ml-2 border-l-2 border-gray-700 pl-4">
          {phase.tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={(id) => onToggleTask(phase.id, id)}
              onToggleSubtask={(taskId, subtaskId) => onToggleSubtask(phase.id, taskId, subtaskId)}
              tagVariants={tagVariants}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Helpers for state management ---

function countTasks(phases: AgentChecklistPhase[]) {
  let total = 0;
  let completed = 0;
  for (const phase of phases) {
    for (const task of phase.tasks) {
      if (task.subtasks && task.subtasks.length > 0) {
        total += task.subtasks.length;
        completed += task.subtasks.filter(st => st.checked).length;
      } else {
        total += 1;
        completed += task.checked ? 1 : 0;
      }
    }
  }
  return { total, completed };
}

/** Main AgentChecklist component — self-contained with internal state management */
export function AgentChecklist({
  defaultPhases,
  title,
  titleIcon,
  description,
  onChange,
  showStats = true,
  tagVariants,
  className,
}: AgentChecklistProps) {
  const [phases, setPhases] = useState<AgentChecklistPhase[]>(defaultPhases);

  const emit = (next: AgentChecklistPhase[]) => {
    setPhases(next);
    onChange?.(next);
  };

  const toggleTask = (phaseId: string, taskId: string) => {
    emit(phases.map(phase => {
      if (phase.id !== phaseId) return phase;
      return {
        ...phase,
        tasks: phase.tasks.map(task => {
          if (task.id !== taskId) return task;
          const newChecked = !task.checked;
          if (task.subtasks) {
            return { ...task, checked: newChecked, subtasks: task.subtasks.map(st => ({ ...st, checked: newChecked })) };
          }
          return { ...task, checked: newChecked };
        }),
      };
    }));
  };

  const toggleSubtask = (phaseId: string, taskId: string, subtaskId: string) => {
    emit(phases.map(phase => {
      if (phase.id !== phaseId) return phase;
      return {
        ...phase,
        tasks: phase.tasks.map(task => {
          if (task.id !== taskId || !task.subtasks) return task;
          return { ...task, subtasks: task.subtasks.map(st => st.id === subtaskId ? { ...st, checked: !st.checked } : st) };
        }),
      };
    }));
  };

  const togglePhase = (phaseId: string) => {
    emit(phases.map(phase => {
      if (phase.id !== phaseId) return phase;
      const allComplete = phase.tasks.every(task => {
        if (task.subtasks && task.subtasks.length > 0) return task.subtasks.every(st => st.checked);
        return task.checked;
      });
      const newChecked = !allComplete;
      return {
        ...phase,
        tasks: phase.tasks.map(task => ({
          ...task,
          checked: newChecked,
          subtasks: task.subtasks?.map(st => ({ ...st, checked: newChecked })),
        })),
      };
    }));
  };

  const { total, completed } = countTasks(phases);
  const overallProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={['min-h-screen bg-gray-900 text-gray-100 p-6 md:p-10', className].filter(Boolean).join(' ')}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        {(title || description) && (
          <div className="mb-8">
            {title && (
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {titleIcon && <>{titleIcon}{' '}</>}{title}
                </h1>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-semibold text-lg">{overallProgress}%</span>
                  <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700 ease-out"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            {description && <p className="text-gray-400">{description}</p>}
          </div>
        )}

        {/* Stats */}
        {showStats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-3xl font-bold text-emerald-400">{completed}</div>
              <div className="text-sm text-gray-400">Completed</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-3xl font-bold text-amber-400">{total - completed}</div>
              <div className="text-sm text-gray-400">Remaining</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-3xl font-bold text-blue-400">{phases.length}</div>
              <div className="text-sm text-gray-400">Phases</div>
            </div>
          </div>
        )}

        {/* Phases */}
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          {phases.map(phase => (
            <Phase
              key={phase.id}
              phase={phase}
              onToggleTask={toggleTask}
              onToggleSubtask={toggleSubtask}
              onTogglePhase={togglePhase}
              tagVariants={tagVariants}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          Click on phase titles to collapse/expand &bull; Click checkboxes to toggle completion
        </div>
      </div>
    </div>
  );
}
