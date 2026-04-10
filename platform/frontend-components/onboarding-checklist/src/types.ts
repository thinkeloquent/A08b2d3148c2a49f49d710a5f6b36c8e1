import type { ReactNode } from 'react';

/** A single task item in the checklist */
export interface ChecklistTask {
  /** Unique identifier for the task */
  id: string | number;
  /** Display label for the task */
  label: string;
  /** Whether the task is completed */
  completed: boolean;
}

/** Props for the OnboardingChecklist component */
export interface OnboardingChecklistProps {
  /** Array of tasks to display */
  tasks: ChecklistTask[];
  /** Called when a task's completion state is toggled */
  onToggleTask: (id: string | number) => void;
  /** User's display name shown in the greeting */
  userName: string;
  /** Header title above the progress bar */
  title?: string;
  /** Subtitle text below the greeting */
  subtitle?: string;
  /** Label for the dismiss button */
  dismissLabel?: string;
  /** Called when the dismiss button is clicked */
  onDismiss?: () => void;
  /** Icon shown next to the greeting (defaults to wave emoji) */
  greetingIcon?: ReactNode;
  /** Content shown when all tasks are completed */
  completionMessage?: ReactNode;
  /** Icon rendered inside the check circle when a task is completed */
  checkIcon?: ReactNode;
  /** CSS class escape hatch */
  className?: string;
}

/** Props for the ProgressBar sub-component */
export interface ProgressBarProps {
  /** Number of completed segments */
  completedCount: number;
  /** Total number of segments */
  totalCount: number;
  /** CSS class escape hatch */
  className?: string;
}

/** Props for the TaskItem sub-component */
export interface TaskItemProps {
  /** The task to render */
  task: ChecklistTask;
  /** Called when the task is toggled */
  onToggle: () => void;
  /** Custom check icon */
  checkIcon?: ReactNode;
  /** CSS class escape hatch */
  className?: string;
}
