import type { ReactNode, ElementType } from 'react';

/** A single step definition in the wizard */
export interface WizardStep {
  /** Unique step identifier */
  id: number;
  /** Step label shown in progress indicators */
  title: string;
}

/** A selectable feature/option shown in the selection step */
export interface WizardFeature {
  /** Unique feature identifier */
  id: string;
  /** Display title */
  title: string;
  /** Short description */
  description: string;
  /** Icon rendered beside the feature — accepts any ReactNode */
  icon?: ReactNode;
}

/** Content configuration for each wizard step */
export interface WizardStepContent {
  /** Main heading for the step */
  main: string;
  /** Subtitle / supporting text */
  sub: string;
}

/** Props for the main OnboardingWizard component */
export interface OnboardingWizardProps {
  /** Array of step definitions */
  steps?: WizardStep[];
  /** Array of selectable features shown in step 1 */
  features?: WizardFeature[];
  /** Default selected feature id */
  defaultFeature?: string;
  /** Step title/subtitle content keyed by step id */
  stepContent?: Record<number, WizardStepContent>;
  /** Called when the user completes the final step */
  onComplete?: (selectedFeatureId: string) => void;
  /** Called when the user clicks the help/support link */
  onHelpClick?: () => void;
  /** Custom render function for step content — overrides built-in rendering */
  renderStep?: (step: number, selectedFeatureId: string) => ReactNode;
  /** Label for the final action button (default: "Launch Workspace") */
  completeLabel?: string;
  /** Help link text (default: "Contact support") */
  helpLinkText?: string;
  /** CSS class escape hatch */
  className?: string;
  /** Slot for additional content below the wizard card */
  children?: ReactNode;
}

/** Props for the feature selection card */
export interface FeatureCardProps {
  /** The feature to display */
  feature: WizardFeature;
  /** Whether this feature is currently selected */
  isSelected: boolean;
  /** Selection handler */
  onSelect: (id: string) => void;
  /** Check icon ReactNode to show when selected */
  checkIcon?: ReactNode;
  /** CSS class escape hatch */
  className?: string;
}

/** Props for the progress indicator */
export interface ProgressDotsProps {
  /** Total steps */
  steps: WizardStep[];
  /** Current active step id */
  currentStep: number;
  /** Completed step ids */
  completedSteps: number[];
  /** CSS class escape hatch */
  className?: string;
}

/** Props for the wizard navigation footer */
export interface WizardFooterProps {
  /** Current step number */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Whether back button is visible */
  showBack: boolean;
  /** Whether skip button is visible */
  showSkip: boolean;
  /** Whether this is the final step */
  isFinalStep: boolean;
  /** Label for the final-step button */
  completeLabel: string;
  /** Navigation handlers */
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  /** Element type for navigation buttons */
  as?: ElementType;
  /** CSS class escape hatch */
  className?: string;
}
