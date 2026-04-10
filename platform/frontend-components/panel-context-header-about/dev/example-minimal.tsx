import { PanelContextHeaderAbout } from '../src';
import type { BenefitItem } from '../src';

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const BENEFITS: BenefitItem[] = [
  { title: 'Automated Scanning', description: 'Continuous vulnerability detection across all repositories.' },
  { title: 'Risk Scoring', description: 'Prioritized severity ratings aligned with CVSS standards.' },
];

export default function ExampleMinimal() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-16">
        <PanelContextHeaderAbout
          icon={<ShieldIcon />}
          title="Vulnerability Scanner"
          description="Monitor and triage security vulnerabilities across your codebase."
          benefits={BENEFITS}
          accentGradient="from-emerald-500 via-teal-500 to-emerald-400"
        />
      </div>
    </div>
  );
}
