import type { ConfigurationWizardProps } from './types';
import { OptionCard } from './OptionCard';
import { PolicySelect } from './PolicySelect';
import { StepIndicator } from './StepIndicator';

export function ConfigurationWizard({
  title,
  subtitle,
  modes,
  selectedModeId,
  onModeChange,
  policyFields,
  policyOptions,
  customPolicies,
  onCustomPolicyChange,
  detailHint,
  currentStep,
  totalSteps,
  onBack,
  onNext,
  backLabel = 'Back',
  nextLabel = 'Next',
  nextIcon,
  showNavigation = true,
  className,
  children,
}: ConfigurationWizardProps) {
  const currentMode = modes.find((m) => m.id === selectedModeId);
  const displayPolicies = currentMode?.isCustom ? customPolicies : currentMode?.policies;

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="text-center mb-6">
          {title && (
            <h1 className="text-2xl font-semibold text-white mb-2 tracking-tight">{title}</h1>
          )}
          {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel — Mode Selection */}
        <div className="flex-1 space-y-2">
          {modes.map((mode) => (
            <OptionCard
              key={mode.id}
              mode={mode}
              isSelected={selectedModeId === mode.id}
              onClick={() => onModeChange(mode.id)}
            />
          ))}
        </div>

        {/* Right Panel — Policy Detail */}
        <div className="lg:w-64 p-4 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl">
          <div className="space-y-3">
            {policyFields.map((field) => (
              <PolicySelect
                key={field.key}
                label={field.label}
                value={displayPolicies?.[field.key] ?? ''}
                onChange={(v) => onCustomPolicyChange(field.key, v)}
                options={policyOptions}
                disabled={!currentMode?.isCustom}
              />
            ))}

            {detailHint && (
              <div className="pt-2 border-t border-gray-700">
                <p className="text-xs text-gray-400 leading-relaxed">{detailHint}</p>
              </div>
            )}

            {currentMode?.statusMessage && (
              <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg">
                <div
                  className={[
                    'w-2 h-2 rounded-full animate-pulse',
                    currentMode.id === 'agent' ? 'bg-green-400' : 'bg-amber-400',
                  ].join(' ')}
                />
                <p className="text-xs text-gray-300">{currentMode.statusMessage}</p>
              </div>
            )}

            {children}
          </div>
        </div>
      </div>

      {/* Navigation */}
      {showNavigation && currentStep != null && totalSteps != null && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={onBack}
            disabled={!onBack}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            {backLabel}
          </button>

          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

          <button
            onClick={onNext}
            disabled={!onNext}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/25 active:scale-95"
          >
            {nextLabel}
            {nextIcon}
          </button>
        </div>
      )}
    </div>
  );
}
