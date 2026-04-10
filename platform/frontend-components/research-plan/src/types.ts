import type { ReactNode } from 'react';

/** A single task within an expandable step. */
export interface PlanTask {
  /** Unique task identifier. */
  id: string | number;
  /** Task description text. */
  text: string;
}

/** A step in the research plan workflow. */
export interface PlanStep {
  /** Unique step identifier. */
  id: string | number;
  /** Step title displayed next to the icon. */
  title: string;
  /** Icon rendered in the step circle. Pass any ReactNode. */
  icon?: ReactNode;
  /** Whether the step's content can be expanded/collapsed. */
  expandable?: boolean;
  /** Sub-tasks shown when the step has detailed items. */
  tasks?: PlanTask[];
  /** Short description shown for non-expandable steps. */
  description?: string;
}

/** Processing status of the workflow. */
export type PlanStatus = 'idle' | 'processing' | 'complete';

/** Props for the root ResearchPlan component. */
export interface ResearchPlanProps {
  /** Plan title displayed in the header. */
  title: string;
  /** Array of workflow steps. */
  steps: PlanStep[];
  /** Estimated time label shown at the bottom (e.g. "Ready in a few mins"). */
  estimatedTime?: string;
  /** Label shown above the title (e.g. "Research Plan"). */
  label?: string;
  /** Current processing status. Defaults to 'idle'. */
  status?: PlanStatus;
  /** Index of the currently active step (0-based). Only relevant when status is 'processing'. */
  activeStepIndex?: number;
  /** Which step IDs are expanded by default. */
  defaultExpandedSteps?: (string | number)[];
  /** Maximum number of tasks to show when a step is collapsed. Defaults to 2. */
  collapsedTaskLimit?: number;
  /** Called when a step's expanded state is toggled. */
  onToggleStep?: (stepId: string | number, expanded: boolean) => void;
  /** Called when the primary action button is clicked. */
  onStart?: () => void;
  /** Called when the secondary (edit/reset) button is clicked. */
  onEdit?: () => void;
  /** Label for the primary action button in idle state. Defaults to "Start research". */
  startLabel?: string;
  /** Label for the primary action button while processing. Defaults to "Researching...". */
  processingLabel?: string;
  /** Label for the primary action button when complete. Defaults to "Completed". */
  completeLabel?: string;
  /** Label for the secondary button. Defaults to "Edit plan". */
  editLabel?: string;
  /** Completion message shown instead of estimatedTime when done. Defaults to "Research complete!". */
  completeMessage?: string;
  /** Icon shown in the completed check circles. */
  checkIcon?: ReactNode;
  /** Icon shown for the time estimate row. */
  clockIcon?: ReactNode;
  /** Icon shown as the spinner during processing. */
  spinnerIcon?: ReactNode;
  /** Custom render function for task text. Receives the raw text, returns ReactNode. */
  renderTaskText?: (text: string) => ReactNode;
  /** CSS class escape hatch for the outermost card. */
  className?: string;
  /** Additional content rendered inside the card, below the actions. */
  children?: ReactNode;
}
