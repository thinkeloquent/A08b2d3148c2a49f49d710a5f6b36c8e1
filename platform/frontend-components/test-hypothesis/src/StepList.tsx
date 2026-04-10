import type { StepListProps } from './types';

export function StepList({ steps, currentStep, className }: StepListProps) {
  return (
    <div
      className={['space-y-3', className].filter(Boolean).join(' ')}
    >
      {steps.map((step) => (
        <div
          key={step.id}
          className={[
            'p-4 rounded-xl transition-all',
            currentStep === step.id
              ? 'bg-blue-50 border border-blue-200'
              : currentStep > step.id
                ? 'bg-green-50 border border-green-200'
                : 'bg-white border border-gray-200',
          ].join(' ')}
        >
          <div className="flex items-center gap-3">
            <div
              className={[
                'w-5 h-5 flex items-center justify-center',
                currentStep === step.id
                  ? 'text-blue-600'
                  : currentStep > step.id
                    ? 'text-green-600'
                    : 'text-gray-400',
              ].join(' ')}
            >
              {step.icon ?? (
                <span className="text-xs font-medium">{step.id}</span>
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{step.title}</h3>
              <p className="text-xs text-gray-600">{step.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
