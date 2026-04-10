import { useState } from 'react';
import { PanelContextHeaderAbout } from '../src';
import type { BenefitItem, TagItem, StatItem, SelectorOption, CtaConfig, BreadcrumbItem } from '../src';

// ── Inline icons for the demo ──

const ZapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const FileTextIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const LayersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const TargetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

// ── Sample data ──

const BREADCRUMBS: BreadcrumbItem[] = [
  { label: 'Apps', onClick: () => console.log('Apps clicked') },
  { label: 'Document Generation', onClick: () => console.log('Doc Gen clicked') },
  { label: 'Prompt Oneshot' },
];

const BENEFITS: BenefitItem[] = [
  { icon: <ZapIcon />, title: 'Zero-Shot Generation', description: 'Produce structured documents instantly without multi-turn prompting.' },
  { icon: <FileTextIcon />, title: 'Industry Standards', description: 'Pre-built templates aligned with IEEE, ISO, and enterprise doc formats.' },
  { icon: <LayersIcon />, title: 'Composable Sections', description: 'Mix and match template blocks to fit your project scope.' },
  { icon: <SparklesIcon />, title: 'AI-Refined Output', description: 'Each template includes prompt-engineered guardrails for consistent quality.' },
];

const TAGS: TagItem[] = [
  { label: 'PRD Authoring', colorClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  { label: 'API Design Docs', colorClass: 'bg-violet-50 text-violet-700 border-violet-200' },
  { label: 'Test Plans', colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { label: 'Architecture Briefs', colorClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  { label: 'Sprint Retrospectives', colorClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  { label: 'Runbooks & SOPs', colorClass: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
];

const STATS: StatItem[] = [
  { value: 142, label: 'Templates' },
  { value: 12800, label: 'Generated', suffix: '+' },
  { value: 98, label: 'Accuracy', suffix: '%' },
];

const SELECTOR_OPTIONS: SelectorOption[] = [
  { id: 'claude-sonnet', name: 'Claude Sonnet 4', badge: 'Balanced' },
  { id: 'claude-opus', name: 'Claude Opus 4', badge: 'Advanced' },
  { id: 'claude-haiku', name: 'Claude Haiku 4', badge: 'Fast' },
];

const CTA: CtaConfig = {
  icon: <SparklesIcon />,
  title: 'Ready to generate?',
  description: 'Choose a template below and start authoring your document in seconds.',
  buttonLabel: 'Get Started',
  onButtonClick: () => console.log('CTA clicked'),
};

export default function ExampleDefault() {
  const [selectedModel, setSelectedModel] = useState('claude-sonnet');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-16">
        <PanelContextHeaderAbout
          icon={<ZapIcon />}
          title={<><span className="text-blue-600">Prompt</span> Oneshot Template</>}
          statusBadge={<><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Production Ready</>}
          description="Select a document type template to start authoring. Based on industry-standard requirement and design document formats."
          breadcrumbs={BREADCRUMBS}
          selectorOptions={SELECTOR_OPTIONS}
          selectorValue={selectedModel}
          onSelectorChange={setSelectedModel}
          stats={STATS}
          benefits={BENEFITS}
          tags={TAGS}
          cta={CTA}
          sectionLabels={{
            benefits: 'Key Benefits',
            tags: 'Common Use Cases',
            benefitsIcon: <CheckCircleIcon />,
            tagsIcon: <TargetIcon />,
          }}
        />
      </div>
    </div>
  );
}
