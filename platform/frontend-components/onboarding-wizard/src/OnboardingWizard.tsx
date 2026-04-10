import { useState } from 'react';
import type { OnboardingWizardProps, WizardStep, WizardStepContent } from './types';
import { FeatureCard } from './FeatureCard';
import { ProgressDots } from './ProgressDots';
import { WizardFooter } from './WizardFooter';

const DEFAULT_STEPS: WizardStep[] = [
  { id: 1, title: 'Choose Feature' },
  { id: 2, title: 'Customize' },
  { id: 3, title: 'Get Started' },
];

const DEFAULT_STEP_CONTENT: Record<number, WizardStepContent> = {
  1: { main: 'What do you want to try first?', sub: 'Choose one way to get started.' },
  2: { main: 'Customize your setup', sub: 'Personalize your workspace to match your workflow.' },
  3: { main: 'Welcome aboard!', sub: 'Your journey begins now.' },
};

export function OnboardingWizard({
  steps = DEFAULT_STEPS,
  features = [],
  defaultFeature,
  stepContent = DEFAULT_STEP_CONTENT,
  onComplete,
  onHelpClick,
  renderStep,
  completeLabel = 'Launch Workspace',
  helpLinkText = 'Contact support',
  className,
  children,
}: OnboardingWizardProps) {
  const totalSteps = steps.length;
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFeature, setSelectedFeature] = useState(defaultFeature ?? features[0]?.id ?? '');
  const [isAnimating, setIsAnimating] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const isFinalStep = currentStep === totalSteps;

  const handleNext = () => {
    if (isFinalStep) {
      onComplete?.(selectedFeature);
      return;
    }
    setIsAnimating(true);
    setCompletedSteps((prev) => [...prev, currentStep]);
    setTimeout(() => {
      setCurrentStep((s) => s + 1);
      setIsAnimating(false);
    }, 300);
  };

  const handleSkip = () => {
    if (!isFinalStep) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((s) => s + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setIsAnimating(true);
      setCompletedSteps((prev) => prev.filter((s) => s !== currentStep - 1));
      setTimeout(() => {
        setCurrentStep((s) => s - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const titles = stepContent[currentStep] ?? { main: '', sub: '' };

  const renderDefaultStep1 = () => (
    <div className="space-y-3">
      {features.map((feature) => (
        <FeatureCard
          key={feature.id}
          feature={feature}
          isSelected={selectedFeature === feature.id}
          onSelect={setSelectedFeature}
        />
      ))}
    </div>
  );

  const renderDefaultStep2 = () => {
    const selected = features.find((f) => f.id === selectedFeature);
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500 rounded-xl text-white">
              {selected?.icon}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">{selected?.title}</h3>
              <p className="text-sm text-gray-600">Customize your experience</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Workspace Name</label>
              <input
                type="text"
                placeholder="My Workspace"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team Size</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white">
                <option>Just me</option>
                <option>2-5 people</option>
                <option>6-20 people</option>
                <option>20+ people</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDefaultStep3 = () => {
    const selected = features.find((f) => f.id === selectedFeature);
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h3>
        <p className="text-gray-600 mb-6">
          Your workspace is ready. Start creating with {selected?.title ?? 'your selection'}.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Workspace active
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    if (renderStep) return renderStep(currentStep, selectedFeature);
    switch (currentStep) {
      case 1: return renderDefaultStep1();
      case 2: return renderDefaultStep2();
      case 3: return renderDefaultStep3();
      default: return null;
    }
  };

  const rootClass = [
    'min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={rootClass}>
      <div className="w-full max-w-lg">
        <ProgressDots
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          className="mb-8"
        />

        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className={['mb-6 transition-opacity duration-300', isAnimating ? 'opacity-0' : 'opacity-100'].join(' ')}>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {titles.main.split(' ').map((word, i) => (
                  word.toLowerCase() === 'you' ? (
                    <span key={i} className="underline decoration-blue-500 decoration-2 underline-offset-4">{word} </span>
                  ) : (
                    <span key={i}>{word} </span>
                  )
                ))}
              </h1>
              <p className="text-gray-500">{titles.sub}</p>
            </div>

            <div className={['transition-all duration-300', isAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'].join(' ')}>
              {renderStepContent()}
            </div>
          </div>

          <WizardFooter
            currentStep={currentStep}
            totalSteps={totalSteps}
            showBack={currentStep > 1}
            showSkip={!isFinalStep}
            isFinalStep={isFinalStep}
            completeLabel={completeLabel}
            onBack={handleBack}
            onNext={handleNext}
            onSkip={handleSkip}
          />
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Need help?{' '}
          <button onClick={onHelpClick} className="text-blue-500 hover:underline">
            {helpLinkText}
          </button>
        </p>

        {children}
      </div>
    </div>
  );
}
