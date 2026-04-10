import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { HealthChecklist } from '../src';
import type { ScoreItem } from '../src';

const SAMPLE_SCORES: ScoreItem[] = [
  {
    id: 'token',
    label: 'Token Adherence',
    sub: 'Bound tokens vs hard-coded values',
    value: 50,
    color: '#7C6AF7',
    glow: 'rgba(124,106,247,0.35)',
  },
  {
    id: 'naming',
    label: 'Naming Quality',
    sub: 'Meaningful names vs generic defaults',
    value: 30,
    color: '#A78BFA',
    glow: 'rgba(167,139,250,0.3)',
  },
  {
    id: 'style',
    label: 'Style Presence',
    sub: 'Whether style properties exist on the node',
    value: 20,
    color: '#C4B5FD',
    glow: 'rgba(196,181,253,0.25)',
  },
];

function App() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0D1117' }}>
        <button
          onClick={() => setDismissed(false)}
          className="font-mono text-sm px-4 py-2 rounded-lg"
          style={{
            background: 'rgba(255,255,255,0.06)',
            color: '#64748B',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          reopen panel
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: '#0D1117' }}
    >
      <HealthChecklist
        scores={SAMPLE_SCORES}
        totalScore={55}
        statusLabel="PARTIAL"
        version="design-health-check v2.4.1"
        onDismiss={() => setDismissed(true)}
        description={
          <p>
            This element{' '}
            <span style={{ color: '#FCD34D' }}>partially</span>{' '}
            follows the design system. Some style properties use{' '}
            <span style={{ color: '#A78BFA' }}>tokens</span>{' '}
            while others are{' '}
            <span style={{ color: '#F87171' }}>hard-coded</span>.
            Review token bindings and naming to improve compliance.
            Design Health Score is between{' '}
            <span style={{ color: '#FCD34D' }}>40</span> and{' '}
            <span style={{ color: '#FCD34D' }}>70</span>.
          </p>
        }
      />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
