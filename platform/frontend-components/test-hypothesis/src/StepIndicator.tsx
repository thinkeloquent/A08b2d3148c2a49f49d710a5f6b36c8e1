import type { StepIndicatorProps } from './types';

export function StepIndicator({
  steps,
  currentStep,
  completedIcon,
  className,
}: StepIndicatorProps) {
  return (
    <div
      className={[
        'flex items-center justify-center mb-8',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={[
              'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300',
              currentStep >= step.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-500',
            ].join(' ')}
          >
            {currentStep > step.id ? (
              completedIcon ?? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )
            ) : (
              step.icon ?? (
                <span className="text-sm font-medium">{step.id}</span>
              )
            )}
          </div>
          {index < steps.length - 1 && (
            <div
              className={[
                'w-16 h-0.5 mx-2 transition-all duration-300',
                currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200',
              ].join(' ')}
            />
          )}
        </div>
      ))}
    </div>
  );
}
