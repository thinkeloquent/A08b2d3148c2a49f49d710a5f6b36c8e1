import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { TestHypothesis } from '../src';
import type { WizardStep } from '../src';

/* ── Sample icon components (stand-ins for lucide-react in real apps) ── */
const TargetIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);
const BrainIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M12 2a7 7 0 017 7c0 3-2 5-4 6v1a2 2 0 01-2 2h-2a2 2 0 01-2-2v-1c-2-1-4-3-4-6a7 7 0 017-7z" />
  </svg>
);
const CodeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);
const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);
const PlayIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const SparklesIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
  </svg>
);

/* ── Sample steps ── */
const SAMPLE_STEPS: WizardStep[] = [
  { id: 1, title: 'Define Test', icon: <TargetIcon />, description: 'Set goals and target' },
  { id: 2, title: 'AI Hypothesis', icon: <BrainIcon />, description: 'Generate smart hypothesis' },
  { id: 3, title: 'Create Variations', icon: <CodeIcon />, description: 'AI-powered variations' },
  { id: 4, title: 'Configure', icon: <SettingsIcon />, description: 'Set parameters' },
  { id: 5, title: 'Preview & Launch', icon: <PlayIcon />, description: 'Review and deploy' },
];

/* ── Sample step content ── */
function SampleStepContent({ stepId }: { stepId: number }) {
  switch (stepId) {
    case 1:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Define Your Test</h3>
            <p className="text-gray-600">Set goals and target elements for your experiment</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Test Name</label>
                <input type="text" className="w-full p-3 border border-gray-300 rounded-xl" placeholder="e.g., Homepage CTA Optimization" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Element</label>
                <select className="w-full p-3 border border-gray-300 rounded-xl">
                  <option>CTA Button</option>
                  <option>Hero Section</option>
                  <option>Pricing Table</option>
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Success Metric</label>
              {['Conversion Rate', 'Click-Through Rate', 'Engagement Time'].map((m) => (
                <div key={m} className="p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 cursor-pointer">
                  <h4 className="font-medium text-gray-900">{m}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case 2:
      return (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">AI-Generated Hypothesis</h3>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">Generated Hypothesis</h4>
            <p className="text-green-800">Changing the CTA button color from blue to orange will increase conversion rate by 18%.</p>
          </div>
        </div>
      );
    case 3:
      return (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">AI-Generated Variations</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {['Control', 'Variant A', 'Variant B'].map((v) => (
              <div key={v} className="bg-white rounded-2xl border-2 border-gray-200 p-4">
                <div className="aspect-video bg-gray-100 rounded-xl mb-3" />
                <h4 className="font-semibold text-gray-900">{v}</h4>
              </div>
            ))}
          </div>
        </div>
      );
    case 4:
      return (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Test Configuration</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Traffic Allocation</label>
              <input type="range" min="10" max="90" defaultValue={50} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <select className="w-full p-3 border border-gray-300 rounded-xl">
                <option>1 week</option>
                <option>2 weeks</option>
                <option>1 month</option>
              </select>
            </div>
          </div>
        </div>
      );
    case 5:
      return (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Preview & Launch</h3>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">Ready to Launch</h4>
            <p className="text-sm text-green-800">Your A/B test is configured and ready to go.</p>
            <button className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium">
              Launch Test
            </button>
          </div>
        </div>
      );
    default:
      return null;
  }
}

/* ── Sample sidebar extra ── */
function SampleSidebarExtra() {
  return (
    <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200">
      <div className="flex items-center gap-2 mb-3">
        <BrainIcon />
        <h4 className="font-medium text-purple-900">AI Insights</h4>
      </div>
      <div className="space-y-2 text-xs">
        <div>
          <p className="font-medium text-purple-800">Color Psychology</p>
          <p className="text-purple-600">Expected: +18% lift</p>
        </div>
        <div>
          <p className="font-medium text-purple-800">Action-Oriented Copy</p>
          <p className="text-purple-600">Expected: +12% lift</p>
        </div>
      </div>
    </div>
  );
}

/* ── App ── */
function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <button
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
        >
          Open Wizard
        </button>
      </div>
    );
  }

  return (
    <TestHypothesis
      steps={SAMPLE_STEPS}
      currentStep={currentStep}
      onNext={() => setCurrentStep((s) => Math.min(s + 1, SAMPLE_STEPS.length))}
      onPrevious={() => setCurrentStep((s) => Math.max(s - 1, 1))}
      onClose={() => setIsOpen(false)}
      renderStepContent={(stepId) => <SampleStepContent stepId={stepId} />}
      title="Create New A/B Test"
      subtitle="AI-powered experiment creation"
      headerIcon={<SparklesIcon />}
      sidebarExtra={currentStep >= 2 ? <SampleSidebarExtra /> : undefined}
    />
  );
}

createRoot(document.getElementById('root')!).render(<App />);
