import { createRoot } from 'react-dom/client';
import './styles.css';
import { DevEnvUrlSwitcher } from '../src';
import type { DevEnvUrlSwitcherLink } from '../src';

const SAMPLE_LINKS: DevEnvUrlSwitcherLink[] = [
  { url: 'https://github.com', name: 'GitHub' },
  { url: 'https://figma.com', name: 'Figma' },
  { url: 'https://linear.app', name: 'Linear' },
  { url: 'https://vercel.com', name: 'Vercel' },
  { url: 'https://notion.so', name: 'Notion' },
  { url: 'https://slack.com', name: 'Slack' },
];

createRoot(document.getElementById('root')!).render(
  <div className="min-h-screen bg-slate-50 flex items-center justify-center font-['DM_Sans']">
    <div className="text-center space-y-2">
      <h1 className="text-lg font-semibold text-slate-700">DevEnvUrlSwitcher</h1>
      <p className="text-sm text-slate-400">Click the floating button in the bottom-right corner</p>
    </div>
    <DevEnvUrlSwitcher links={SAMPLE_LINKS} />
  </div>,
);
