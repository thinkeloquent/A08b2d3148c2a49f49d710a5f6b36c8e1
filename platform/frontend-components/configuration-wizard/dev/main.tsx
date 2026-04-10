import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { ConfigurationWizard } from '../src';
import type { WizardMode, PolicyField } from '../src';

// Sample icons as inline SVGs (consumers would pass their own)
const ShieldIcon = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const CodeReviewIcon = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const RocketIcon = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

const SettingsIcon = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ArrowRightIcon = (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const MODES: WizardMode[] = [
  {
    id: 'secure',
    name: 'Secure Mode',
    icon: ShieldIcon,
    description: 'Maximum oversight on all operations',
    policies: { terminal: 'Always Request', review: 'Always Request', javascript: 'Always Request' },
    statusMessage: 'The agent will always ask for approval.',
  },
  {
    id: 'review',
    name: 'Review-driven development',
    icon: CodeReviewIcon,
    recommended: true,
    description: 'Balanced automation with human oversight',
    policies: { terminal: 'Request Review', review: 'Request Review', javascript: 'Request Review' },
    statusMessage: 'The agent will frequently ask for review.',
  },
  {
    id: 'agent',
    name: 'Agent-driven development',
    icon: RocketIcon,
    description: 'Autonomous execution with minimal interruption',
    policies: { terminal: 'Auto-execute', review: 'On Completion', javascript: 'Auto-execute' },
    statusMessage: 'The agent will run autonomously with periodic checkpoints.',
  },
  {
    id: 'custom',
    name: 'Custom configuration',
    icon: SettingsIcon,
    description: 'Fine-tune every aspect of agent behavior',
    policies: { terminal: 'Request Review', review: 'Request Review', javascript: 'Request Review' },
    statusMessage: 'Configure policies to match your workflow.',
    isCustom: true,
  },
];

const POLICY_FIELDS: PolicyField[] = [
  { key: 'terminal', label: 'Terminal execution policy' },
  { key: 'review', label: 'Review policy' },
  { key: 'javascript', label: 'JavaScript execution policy' },
];

const POLICY_OPTIONS = ['Always Request', 'Request Review', 'Auto-execute (Safe)', 'Auto-execute'];

function App() {
  const [selectedMode, setSelectedMode] = useState('review');
  const [currentStep, setCurrentStep] = useState(3);
  const [customPolicies, setCustomPolicies] = useState<Record<string, string>>({
    terminal: 'Request Review',
    review: 'Request Review',
    javascript: 'Request Review',
  });

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 font-sans">
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <ConfigurationWizard
        className="relative max-w-3xl"
        title={
          <>
            How do you want to use the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Antigravity Agent
            </span>
            ?
          </>
        }
        subtitle="Select one of the options below."
        modes={MODES}
        selectedModeId={selectedMode}
        onModeChange={setSelectedMode}
        policyFields={POLICY_FIELDS}
        policyOptions={POLICY_OPTIONS}
        customPolicies={customPolicies}
        onCustomPolicyChange={(key, value) =>
          setCustomPolicies((prev) => ({ ...prev, [key]: value }))
        }
        detailHint="Browser allowlist begins with localhost, and can be updated through settings."
        currentStep={currentStep}
        totalSteps={7}
        onBack={currentStep > 0 ? () => setCurrentStep((s) => s - 1) : undefined}
        onNext={currentStep < 6 ? () => setCurrentStep((s) => s + 1) : undefined}
        nextIcon={ArrowRightIcon}
      />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
