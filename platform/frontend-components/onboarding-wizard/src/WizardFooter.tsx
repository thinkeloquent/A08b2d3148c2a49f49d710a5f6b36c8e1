import type { WizardFooterProps } from './types';

export function WizardFooter({
  currentStep,
  totalSteps,
  showBack,
  showSkip,
  isFinalStep,
  completeLabel,
  onBack,
  onNext,
  onSkip,
  as: Component = 'button',
  className,
}: WizardFooterProps) {
  const baseClass = [
    'px-6 sm:px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={baseClass}>
      <div className="flex items-center gap-2">
        {showBack && (
          <Component
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Back
          </Component>
        )}
        <span className="text-sm text-gray-400">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {showSkip && (
          <Component
            onClick={onSkip}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Skip
          </Component>
        )}
        <Component
          onClick={onNext}
          disabled={isFinalStep}
          className={[
            'px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200',
            isFinalStep
              ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200'
              : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          ].join(' ')}
        >
          {isFinalStep ? completeLabel : 'Next'}
        </Component>
      </div>
    </div>
  );
}
