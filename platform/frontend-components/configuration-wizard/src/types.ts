import type { ReactNode } from 'react';

/** A single policy field definition */
export interface PolicyField {
  /** Unique key for this policy */
  key: string;
  /** Display label shown above the select */
  label: string;
}

/** A selectable configuration mode */
export interface WizardMode {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Icon rendered beside the mode name */
  icon?: ReactNode;
  /** Short description shown below the name */
  description?: string;
  /** Whether this mode shows a "Recommended" badge */
  recommended?: boolean;
  /** Policy values keyed by PolicyField.key */
  policies: Record<string, string>;
  /** Status message shown in the detail panel */
  statusMessage?: string;
  /** When true, policy selects become editable */
  isCustom?: boolean;
}

/** Props for the main ConfigurationWizard component */
export interface ConfigurationWizardProps {
  /** Title displayed at the top — can include ReactNode for styled fragments */
  title?: ReactNode;
  /** Subtitle text below the title */
  subtitle?: string;
  /** Available configuration modes */
  modes: WizardMode[];
  /** Currently selected mode id */
  selectedModeId: string;
  /** Called when the user selects a mode */
  onModeChange: (modeId: string) => void;
  /** Policy field definitions (determines which selects appear in the detail panel) */
  policyFields: PolicyField[];
  /** Available options for policy selects */
  policyOptions: string[];
  /** Current custom policy values (used when the selected mode has isCustom: true) */
  customPolicies: Record<string, string>;
  /** Called when a custom policy value changes */
  onCustomPolicyChange: (key: string, value: string) => void;
  /** Hint text shown in the detail panel below the selects */
  detailHint?: string;
  /** Current step index (zero-based) */
  currentStep?: number;
  /** Total number of steps */
  totalSteps?: number;
  /** Called when "Back" is clicked */
  onBack?: () => void;
  /** Called when "Next" is clicked */
  onNext?: () => void;
  /** Label for the back button */
  backLabel?: string;
  /** Label for the next button */
  nextLabel?: string;
  /** Icon rendered after the next button label */
  nextIcon?: ReactNode;
  /** Whether to show the step navigation bar */
  showNavigation?: boolean;
  /** CSS class escape hatch */
  className?: string;
  children?: ReactNode;
}

/** Props for the OptionCard sub-component */
export interface OptionCardProps {
  /** The mode data to render */
  mode: WizardMode;
  /** Whether this card is currently selected */
  isSelected: boolean;
  /** Called when the card is clicked */
  onClick: () => void;
  /** Icon shown when selected (defaults to a checkmark) */
  checkIcon?: ReactNode;
  /** CSS class escape hatch */
  className?: string;
}

/** Props for the StepIndicator sub-component */
export interface StepIndicatorProps {
  /** Current step index (zero-based) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** CSS class escape hatch */
  className?: string;
}

/** Props for the PolicySelect sub-component */
export interface PolicySelectProps {
  /** Label displayed above the select */
  label: string;
  /** Current value */
  value: string;
  /** Called when the value changes */
  onChange: (value: string) => void;
  /** Available options */
  options: string[];
  /** Whether the select is disabled */
  disabled?: boolean;
  /** CSS class escape hatch */
  className?: string;
}
