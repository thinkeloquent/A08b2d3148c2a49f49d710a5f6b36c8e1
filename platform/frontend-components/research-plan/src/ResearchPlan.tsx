import { useState, useCallback } from 'react';
import type { ResearchPlanProps, PlanStep } from './types';

const defaultCheckIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const defaultClockIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

const defaultSpinnerIcon = (
  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

const smallSpinnerIcon = (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

const chevronIcon = (expanded: boolean) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    className={['transition-transform duration-300', expanded ? 'rotate-180' : 'rotate-0'].join(' ')}
  >
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

export function ResearchPlan({
  title,
  steps,
  estimatedTime,
  label = 'Research Plan',
  status = 'idle',
  activeStepIndex = -1,
  defaultExpandedSteps,
  collapsedTaskLimit = 2,
  onToggleStep,
  onStart,
  onEdit,
  startLabel = 'Start research',
  processingLabel = 'Researching...',
  completeLabel = 'Completed',
  editLabel = 'Edit plan',
  completeMessage = 'Research complete!',
  checkIcon,
  clockIcon,
  spinnerIcon,
  renderTaskText,
  className,
  children,
}: ResearchPlanProps) {
  const check = checkIcon ?? defaultCheckIcon;
  const clock = clockIcon ?? defaultClockIcon;
  const spinner = spinnerIcon ?? defaultSpinnerIcon;

  const isProcessing = status === 'processing';
  const isComplete = status === 'complete';

  const [expandedSteps, setExpandedSteps] = useState<Record<string | number, boolean>>(() => {
    const initial: Record<string | number, boolean> = {};
    if (defaultExpandedSteps) {
      for (const id of defaultExpandedSteps) {
        initial[id] = true;
      }
    }
    return initial;
  });

  const toggleStep = useCallback(
    (stepId: string | number) => {
      setExpandedSteps((prev) => {
        const next = !prev[stepId];
        onToggleStep?.(stepId, next);
        return { ...prev, [stepId]: next };
      });
    },
    [onToggleStep],
  );

  const renderStep = (step: PlanStep, index: number) => {
    const isActive = activeStepIndex === index;
    const isStepCompleted = activeStepIndex > index || isComplete;
    const isExpanded = !!expandedSteps[step.id];
    const isLast = index === steps.length - 1;

    return (
      <div key={step.id} className="relative group">
        {/* Connector Line */}
        {!isLast && (
          <div
            className="absolute left-5 top-10 w-0.5 transition-all duration-500"
            style={{
              height: 'calc(100% + 8px)',
              background: isStepCompleted
                ? 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)'
                : 'rgba(75, 85, 99, 0.4)',
            }}
          />
        )}

        <div className="flex items-start gap-4">
          {/* Step Icon */}
          <div
            className={[
              'relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ease-out',
              isStepCompleted
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                : isActive
                  ? 'bg-zinc-800 text-blue-400 ring-2 ring-blue-500/50 ring-offset-2 ring-offset-zinc-900'
                  : 'bg-zinc-800/50 text-zinc-500 group-hover:bg-zinc-800 group-hover:text-zinc-400',
            ].join(' ')}
          >
            {isStepCompleted ? check : isProcessing && isActive ? spinner : step.icon}
          </div>

          {/* Content */}
          <div className="flex-1 pt-1.5">
            <div
              className={[
                'flex items-center gap-2',
                step.expandable ? 'cursor-pointer hover:text-blue-400' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => step.expandable && toggleStep(step.id)}
            >
              <h3
                className={[
                  'font-semibold text-sm tracking-tight transition-colors duration-200',
                  isStepCompleted
                    ? 'text-blue-400'
                    : isActive
                      ? 'text-zinc-100'
                      : 'text-zinc-300',
                ].join(' ')}
              >
                {step.title}
              </h3>
              {step.expandable && (
                <span className="text-zinc-500">{chevronIcon(isExpanded)}</span>
              )}
            </div>

            {/* Expandable Content */}
            <div
              className="overflow-hidden transition-all duration-300 ease-out"
              style={{
                maxHeight: isExpanded
                  ? '600px'
                  : step.tasks
                    ? '140px'
                    : '60px',
              }}
            >
              {step.tasks ? (
                <div className="mt-3 space-y-3">
                  {step.tasks
                    .slice(0, isExpanded ? undefined : collapsedTaskLimit)
                    .map((task) => (
                      <div
                        key={task.id}
                        className="flex gap-3 text-xs leading-relaxed text-zinc-400"
                      >
                        <span className="text-zinc-600 font-mono flex-shrink-0">
                          ({task.id})
                        </span>
                        <p>
                          {renderTaskText ? renderTaskText(task.text) : task.text}
                        </p>
                      </div>
                    ))}

                  {step.tasks.length > collapsedTaskLimit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStep(step.id);
                      }}
                      className="mt-2 text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
                    >
                      {isExpanded ? 'Show less' : 'More'}
                    </button>
                  )}
                </div>
              ) : step.description ? (
                <p className="mt-2 text-xs text-zinc-500">{step.description}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const progress =
    steps.length > 0 ? ((activeStepIndex + 1) / steps.length) * 100 : 0;

  return (
    <div
      className={[
        'relative bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            {label}
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight italic">
          {title}
        </h1>
      </header>

      {/* Steps */}
      <div className="space-y-6 mb-8">
        {steps.map(renderStep)}

        {/* Time Estimate / Completion */}
        {(estimatedTime || isComplete) && (
          <div className="flex items-center gap-4 pt-2">
            <div
              className={[
                'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                isComplete
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-zinc-800/50 text-zinc-500',
              ].join(' ')}
            >
              {isComplete ? check : clock}
            </div>
            <span
              className={[
                'text-sm',
                isComplete ? 'text-emerald-400 font-medium' : 'text-zinc-400',
              ].join(' ')}
            >
              {isComplete ? completeMessage : estimatedTime}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      {(onStart || onEdit) && (
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/50">
          {onEdit && (
            <button
              onClick={onEdit}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-full text-sm font-medium bg-transparent border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 hover:text-zinc-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editLabel}
            </button>
          )}
          {onStart && (
            <button
              onClick={onStart}
              disabled={isProcessing || isComplete}
              className={[
                'px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ease-out flex items-center gap-2',
                isComplete
                  ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                  : isProcessing
                    ? 'bg-blue-500/20 text-blue-400 cursor-wait'
                    : 'bg-blue-500 text-white hover:bg-blue-400 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95',
              ].join(' ')}
            >
              {isProcessing && smallSpinnerIcon}
              {isComplete
                ? completeLabel
                : isProcessing
                  ? processingLabel
                  : startLabel}
            </button>
          )}
        </div>
      )}

      {children}

      {/* Progress Bar */}
      {(isProcessing || isComplete) && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800 rounded-b-2xl overflow-hidden">
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: isComplete ? '100%' : `${progress}%`,
              background: isComplete
                ? 'linear-gradient(90deg, #10b981, #34d399)'
                : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
            }}
          />
        </div>
      )}
    </div>
  );
}
