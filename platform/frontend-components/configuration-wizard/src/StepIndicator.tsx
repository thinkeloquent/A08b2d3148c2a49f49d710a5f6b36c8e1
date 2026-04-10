import type { StepIndicatorProps } from './types';

export function StepIndicator({ currentStep, totalSteps, className }: StepIndicatorProps) {
  return (
    <div className={['flex items-center justify-center gap-1.5', className].filter(Boolean).join(' ')}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={[
            'h-1.5 rounded-full transition-all duration-300',
            i === currentStep
              ? 'bg-blue-500 w-5'
              : i < currentStep
                ? 'bg-gray-500 w-1.5'
                : 'bg-gray-700 w-1.5',
          ].join(' ')}
        />
      ))}
    </div>
  );
}
