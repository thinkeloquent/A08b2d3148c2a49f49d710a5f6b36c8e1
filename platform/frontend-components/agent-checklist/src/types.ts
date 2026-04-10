import type { ReactNode } from 'react';

/** A single subtask within a task */
export interface AgentChecklistSubtask {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional code snippet shown as a badge */
  code?: string;
  /** Optional tag text */
  tag?: string;
  /** Tag color variant key (maps to tagVariants) */
  tagVariant?: string;
  /** Whether the subtask is checked */
  checked: boolean;
}

/** A task within a phase, optionally containing subtasks */
export interface AgentChecklistTask {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional code snippet shown as a badge */
  code?: string;
  /** Optional tag text */
  tag?: string;
  /** Tag color variant key */
  tagVariant?: string;
  /** Whether the task is checked (ignored when subtasks are present) */
  checked: boolean;
  /** Optional nested subtasks */
  subtasks?: AgentChecklistSubtask[];
}

/** A phase grouping tasks together */
export interface AgentChecklistPhase {
  /** Unique identifier */
  id: string;
  /** Phase title */
  title: string;
  /** Tasks within the phase */
  tasks: AgentChecklistTask[];
}

/** Tag variant color mapping */
export interface TagVariants {
  [key: string]: string;
}

/** Props for the AgentChecklist component */
export interface AgentChecklistProps {
  /** Initial phase data — the component manages toggle state internally */
  defaultPhases: AgentChecklistPhase[];
  /** Title displayed in the header */
  title?: string;
  /** Optional icon/emoji node rendered before the title */
  titleIcon?: ReactNode;
  /** Description text below the title */
  description?: string;
  /** Called whenever any checkbox state changes, with the full updated phases array */
  onChange?: (phases: AgentChecklistPhase[]) => void;
  /** Whether to show the stats cards above the checklist */
  showStats?: boolean;
  /** Custom tag variant color classes (merged with defaults) */
  tagVariants?: TagVariants;
  /** CSS class escape hatch */
  className?: string;
}

/** Props for the Checkbox sub-component */
export interface CheckboxProps {
  /** Whether the checkbox is checked */
  checked: boolean;
  /** Whether to show indeterminate state */
  indeterminate?: boolean;
  /** Toggle handler */
  onChange: (e: React.MouseEvent) => void;
  /** CSS class escape hatch */
  className?: string;
}

/** Props for the CodeBadge sub-component */
export interface CodeBadgeProps {
  children: ReactNode;
  className?: string;
}

/** Props for the Tag sub-component */
export interface TagProps {
  children: ReactNode;
  /** Variant key from tagVariants map */
  variant?: string;
  /** Custom variant-to-class mapping */
  variants?: TagVariants;
  className?: string;
}

/** Props for the Phase sub-component */
export interface PhaseProps {
  phase: AgentChecklistPhase;
  onToggleTask: (phaseId: string, taskId: string) => void;
  onToggleSubtask: (phaseId: string, taskId: string, subtaskId: string) => void;
  onTogglePhase: (phaseId: string) => void;
  tagVariants?: TagVariants;
  className?: string;
}

/** Props for the TaskItem sub-component */
export interface TaskItemProps {
  task: AgentChecklistTask;
  onToggle: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  tagVariants?: TagVariants;
  className?: string;
}

/** Props for the SubTask sub-component */
export interface SubTaskProps {
  task: AgentChecklistSubtask;
  level?: number;
  onToggle: (subtaskId: string) => void;
  tagVariants?: TagVariants;
  className?: string;
}
