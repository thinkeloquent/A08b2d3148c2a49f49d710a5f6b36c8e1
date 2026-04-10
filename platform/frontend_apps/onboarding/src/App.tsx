import { useState } from 'react';
import {
  PageIcon,
  LiveDocsIcon,
  WhiteboardIcon,
  DatabaseIcon,
  CheckIcon,
} from './components/Icons';

import type { ComponentType } from 'react';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: ComponentType;
}

const features: Feature[] = [
  {
    id: 'pages',
    title: 'Pages',
    description:
      'Publish project updates and refine ideas with flexible pages.',
    icon: PageIcon,
  },
  {
    id: 'live-docs',
    title: 'Live Docs',
    description: 'Collaborate in real-time with your team on shared documents.',
    icon: LiveDocsIcon,
  },
  {
    id: 'whiteboards',
    title: 'Whiteboards',
    description: 'Brainstorm and visualize concepts with infinite canvas.',
    icon: WhiteboardIcon,
  },
  {
    id: 'databases',
    title: 'Databases',
    description: 'Organize and track everything with powerful databases.',
    icon: DatabaseIcon,
  },
];

const steps = [
  { id: 1, title: 'Choose Feature' },
  { id: 2, title: 'Customize' },
  { id: 3, title: 'Get Started' },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFeature, setSelectedFeature] = useState('pages');
  const [isAnimating, setIsAnimating] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleNext = () => {
    if (currentStep < 3) {
      setIsAnimating(true);
      setCompletedSteps([...completedSteps, currentStep]);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleSkip = () => {
    if (currentStep < 3) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setIsAnimating(true);
      setCompletedSteps(completedSteps.filter((s) => s !== currentStep - 1));
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isSelected = selectedFeature === feature.id;
              return (
                <button
                  key={feature.id}
                  onClick={() => setSelectedFeature(feature.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 group hover:shadow-md ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                      }`}
                    >
                      <Icon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3
                          className={`font-semibold text-base ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}
                        >
                          {feature.title}
                        </h3>
                        {isSelected && (
                          <span className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white">
                            <CheckIcon />
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm mt-0.5 ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        );
      case 2: {
        const selected = features.find((f) => f.id === selectedFeature);
        const SelectedIcon = selected?.icon || PageIcon;
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500 rounded-xl text-white">
                  <SelectedIcon />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {selected?.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Customize your experience
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    placeholder="My Workspace"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Size
                  </label>
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
      }
      case 3:
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              You're all set!
            </h3>
            <p className="text-gray-600 mb-6">
              Your workspace is ready. Start creating with{' '}
              {features.find((f) => f.id === selectedFeature)?.title}.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Workspace active
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return {
          main: 'What do you want to try first?',
          sub: 'You can do it all in. Choose one way to get started.',
        };
      case 2:
        return {
          main: 'Customize your setup',
          sub: 'Personalize your workspace to match your workflow.',
        };
      case 3:
        return { main: 'Welcome aboard!', sub: 'Your journey begins now.' };
      default:
        return { main: '', sub: '' };
    }
  };

  const titles = getStepTitle();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`h-2 rounded-full transition-all duration-300 ${
                step.id === currentStep
                  ? 'w-8 bg-blue-500'
                  : step.id < currentStep || completedSteps.includes(step.id)
                    ? 'w-2 bg-blue-400'
                    : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div
              className={`mb-6 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {titles.main.split(' ').map((word, i) =>
                  word === 'you' ? (
                    <span
                      key={i}
                      className="underline decoration-blue-500 decoration-2 underline-offset-4"
                    >
                      {word}{' '}
                    </span>
                  ) : (
                    <span key={i}>{word} </span>
                  ),
                )}
              </h1>
              <p className="text-gray-500">{titles.sub}</p>
            </div>

            {/* Content */}
            <div
              className={`transition-all duration-300 ${isAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}
            >
              {renderStepContent()}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 sm:px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Back
                </button>
              )}
              <span className="text-sm text-gray-400">
                Step {currentStep} of {steps.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {currentStep < 3 && (
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Skip
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={currentStep === 3}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  currentStep === 3
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200'
                    : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {currentStep === 3 ? 'Launch Workspace' : 'Next'}
              </button>
            </div>
          </div>
        </div>

        {/* Help text */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Need help?{' '}
          <button className="text-blue-500 hover:underline">
            Contact support
          </button>
        </p>
      </div>
    </div>
  );
}
