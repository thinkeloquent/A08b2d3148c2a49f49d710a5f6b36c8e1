import type { TestHypothesisProps } from './types';
import { StepIndicator } from './StepIndicator';
import { StepList } from './StepList';

/**
 * A multi-step wizard modal for configuring and launching experiments.
 *
 * Renders a full-screen modal overlay with:
 * - Header with icon, title, subtitle, and close button
 * - Left sidebar with step indicator, step list, and optional extra content
 * - Main content area driven by `renderStepContent`
 * - Footer with Previous / step counter / Next navigation
 */
export function TestHypothesis({
  steps,
  currentStep,
  onNext,
  onPrevious,
  onClose,
  renderStepContent,
  title = 'Create New Test',
  subtitle,
  headerIcon,
  completedStepIcon,
  sidebarExtra,
  isNextDisabled,
  isPreviousDisabled,
  className,
}: TestHypothesisProps) {
  const isFirstStep = currentStep <= (steps[0]?.id ?? 1);
  const isLastStep = currentStep >= (steps[steps.length - 1]?.id ?? steps.length);
  const prevDisabled = isPreviousDisabled ?? isFirstStep;
  const nextDisabled = isNextDisabled ?? isLastStep;

  return (
    <div
      className={[
        'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {headerIcon && (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                {headerIcon}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              {subtitle && (
                <p className="text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="flex h-[calc(95vh-120px)]">
          {/* Left Sidebar */}
          <div className="w-80 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto shrink-0">
            <StepIndicator
              steps={steps}
              currentStep={currentStep}
              completedIcon={completedStepIcon}
            />
            <StepList steps={steps} currentStep={currentStep} />
            {sidebarExtra && <div className="mt-8">{sidebarExtra}</div>}
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            {renderStepContent(currentStep)}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onPrevious}
            disabled={prevDisabled}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Step {currentStep} of {steps.length}
          </span>

          <button
            onClick={onNext}
            disabled={nextDisabled}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
