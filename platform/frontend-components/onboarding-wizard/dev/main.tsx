import { createRoot } from 'react-dom/client';
import './styles.css';
import { OnboardingWizard } from '../src';
import type { WizardFeature } from '../src';

const PageIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const LiveDocsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
  </svg>
);

const WhiteboardIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
  </svg>
);

const DatabaseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const SAMPLE_FEATURES: WizardFeature[] = [
  {
    id: 'pages',
    title: 'Pages',
    description: 'Publish project updates and refine ideas with flexible pages.',
    icon: <PageIcon />,
  },
  {
    id: 'live-docs',
    title: 'Live Docs',
    description: 'Collaborate in real-time with your team on shared documents.',
    icon: <LiveDocsIcon />,
  },
  {
    id: 'whiteboards',
    title: 'Whiteboards',
    description: 'Brainstorm and visualize concepts with infinite canvas.',
    icon: <WhiteboardIcon />,
  },
  {
    id: 'databases',
    title: 'Databases',
    description: 'Organize and track everything with powerful databases.',
    icon: <DatabaseIcon />,
  },
];

createRoot(document.getElementById('root')!).render(
  <OnboardingWizard
    features={SAMPLE_FEATURES}
    defaultFeature="pages"
    onComplete={(featureId) => alert(`Completed with feature: ${featureId}`)}
    onHelpClick={() => alert('Help clicked')}
  />,
);
