import type { ReactNode, ElementType } from "react";

/** Possible statuses for a progress step. */
export type StepStatus = "completed" | "in-progress" | "pending" | "failed";

/** A single step in the progress tracker. */
export interface ProgressStep {
  /** Unique identifier for the step. */
  id: string | number;
  /** Display label for the step. */
  label: string;
  /** Description of what this step does. */
  description?: string;
  /** Current status. */
  status: StepStatus;
  /** Duration string (e.g. "2m 14s"), shown when available. */
  duration?: string | null;
}

/** Status theme configuration for each step status. */
export interface StatusTheme {
  /** Tailwind class for the legend dot color. */
  dot: string;
  /** Tailwind class for text color. */
  text: string;
  /** Human-readable label. */
  label: string;
}

/** Icon slot props — each receives the current step status. */
export interface StepIconSlotProps {
  status: StepStatus;
}

/** Props for the main TaskProgressBarTrackerWidget component. */
export interface TaskProgressBarTrackerWidgetProps {
  /** The list of steps to display. */
  steps: ProgressStep[];
  /** Optional title displayed to the left of the completion count. */
  title?: string;
  /** Optional CSS class for the outermost container. */
  className?: string;
  /** Icon rendered next to the "Details" button. Defaults to a built-in list icon. */
  detailsIcon?: ReactNode;
  /** Label text for the details button. Defaults to "Details". */
  detailsLabel?: string;
  /** Called when the details button is clicked. If not provided, the built-in modal opens. */
  onDetailsClick?: () => void;
  /** Render function for the right-side action slot (e.g. a "Task Manager" link). */
  renderAction?: () => ReactNode;
  /** Element type for the action link when using the default action slot. */
  actionAs?: ElementType;
  /** Props passed to the action element (href, onClick, to, etc.). */
  actionProps?: Record<string, unknown>;
  /** Action label text. Defaults to "Task Manager". */
  actionLabel?: string;
  /** Custom status theme map. Merges with defaults. */
  statusTheme?: Partial<Record<StepStatus, Partial<StatusTheme>>>;
  /** Render custom icon for each step status in the modal timeline. */
  renderStepIcon?: (props: StepIconSlotProps) => ReactNode;
  /** Custom content rendered inside the modal footer. Replaces default footer link. */
  modalFooter?: ReactNode;
  /** Title shown in the modal header. Defaults to "Execution Steps". */
  modalTitle?: string;
  /** Children rendered below the progress bar (content area). */
  children?: ReactNode;
}

/** Props for the standalone StepsModal component. */
export interface StepsModalProps {
  /** Steps to render in the timeline. */
  steps: ProgressStep[];
  /** Whether the modal is open. */
  open: boolean;
  /** Called when the modal should close. */
  onClose: () => void;
  /** Optional CSS class for the modal panel. */
  className?: string;
  /** Modal title. Defaults to "Execution Steps". */
  title?: string;
  /** Custom status theme map. */
  statusTheme?: Partial<Record<StepStatus, Partial<StatusTheme>>>;
  /** Render custom icon for each step status. */
  renderStepIcon?: (props: StepIconSlotProps) => ReactNode;
  /** Custom footer content. */
  footer?: ReactNode;
}
