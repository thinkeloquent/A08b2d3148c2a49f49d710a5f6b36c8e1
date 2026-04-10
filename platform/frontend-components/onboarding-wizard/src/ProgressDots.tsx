import type { ProgressDotsProps } from './types';

export function ProgressDots({ steps, currentStep, completedSteps, className }: ProgressDotsProps) {
  const baseClass = ['flex justify-center gap-2', className].filter(Boolean).join(' ');

  return (
    <div className={baseClass}>
      {steps.map((step) => (
        <div
          key={step.id}
          className={[
            'h-2 rounded-full transition-all duration-300',
            step.id === currentStep
              ? 'w-8 bg-blue-500'
              : step.id < currentStep || completedSteps.includes(step.id)
              ? 'w-2 bg-blue-400'
              : 'w-2 bg-gray-300',
          ].join(' ')}
        />
      ))}
    </div>
  );
}
