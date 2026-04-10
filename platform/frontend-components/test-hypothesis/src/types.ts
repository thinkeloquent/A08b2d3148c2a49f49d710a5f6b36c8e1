import type { ReactNode } from 'react';

/** A single step in the wizard */
export interface WizardStep {
  /** Unique step identifier (1-based) */
  id: number;
  /** Display title for the step */
  title: string;
  /** Icon rendered beside the step title — accepts any ReactNode */
  icon?: ReactNode;
  /** Short description shown under the title */
  description: string;
}

/** Props for the main TestHypothesis wizard component */
export interface TestHypothesisProps {
  /** Ordered list of wizard steps */
  steps: WizardStep[];
  /** Currently active step id (1-based) */
  currentStep: number;
  /** Called when the user clicks Next */
  onNext?: () => void;
  /** Called when the user clicks Previous */
  onPrevious?: () => void;
  /** Called when the close button is clicked */
  onClose?: () => void;

  /** Render callback for each step's main content area */
  renderStepContent: (stepId: number) => ReactNode;

  /** Modal header title */
  title?: string;
  /** Modal header subtitle */
  subtitle?: string;
  /** Icon displayed in the header badge */
  headerIcon?: ReactNode;

  /** Icon shown in the step indicator when a step is completed */
  completedStepIcon?: ReactNode;

  /** Additional content rendered below the step list in the sidebar */
  sidebarExtra?: ReactNode;

  /** Disable the Next button */
  isNextDisabled?: boolean;
  /** Disable the Previous button (defaults to true when currentStep === 1) */
  isPreviousDisabled?: boolean;

  /** CSS class escape hatch for the outermost overlay */
  className?: string;
}

/** Props for the StepIndicator sub-component */
export interface StepIndicatorProps {
  /** Wizard steps to display */
  steps: WizardStep[];
  /** Current active step id */
  currentStep: number;
  /** Icon for completed steps */
  completedIcon?: ReactNode;
  /** CSS class escape hatch */
  className?: string;
}

/** Props for the StepList sub-component */
export interface StepListProps {
  /** Wizard steps to display */
  steps: WizardStep[];
  /** Current active step id */
  currentStep: number;
  /** CSS class escape hatch */
  className?: string;
}
