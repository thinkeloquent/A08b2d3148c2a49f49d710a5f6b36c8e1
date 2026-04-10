import { useState, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { ResearchPlan } from '../src';
import type { PlanStep, PlanStatus } from '../src';

const WebIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
  </svg>
);

const AnalyzeIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="8" x2="20" y2="8" />
    <line x1="4" y1="14" x2="16" y2="14" />
    <line x1="4" y1="20" x2="12" y2="20" />
  </svg>
);

const ReportIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
    <path d="M11 8v6" />
    <path d="M8 11h6" />
  </svg>
);

const SAMPLE_STEPS: PlanStep[] = [
  {
    id: 1,
    icon: WebIcon,
    title: 'Research Websites',
    expandable: true,
    tasks: [
      { id: 1, text: 'Investigate advanced configuration options for httpx.AsyncClient in Python, focusing on connection pooling limits, http2 enabling, and keepalive_expiry settings to maximize throughput.' },
      { id: 2, text: 'Research the undici library in NodeJS, specifically the Agent and Dispatcher classes, to understand how to tune connections, pipelining, and keepAliveTimeout for high-concurrency environments.' },
      { id: 3, text: 'Analyze DNS caching strategies and connection pre-warming techniques for reducing cold-start latencies in serverless deployments.' },
    ],
  },
  {
    id: 2,
    icon: AnalyzeIcon,
    title: 'Analyze Results',
    expandable: false,
    description: 'Compare performance metrics and identify optimal configurations.',
  },
  {
    id: 3,
    icon: ReportIcon,
    title: 'Create Report',
    expandable: false,
    description: 'Generate comprehensive documentation with benchmarks.',
  },
];

const CODE_WORDS = ['httpx.AsyncClient', 'http2', 'keepalive_expiry', 'undici', 'Agent', 'Dispatcher', 'connections', 'pipelining', 'keepAliveTimeout'];

function highlightCode(text: string) {
  let result = text;
  CODE_WORDS.forEach((word) => {
    result = result.replace(new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), `|||${word}|||`);
  });
  return result.split('|||').map((part, i) =>
    CODE_WORDS.includes(part)
      ? <code key={i} className="px-1.5 py-0.5 bg-zinc-800 text-amber-400 rounded text-xs font-mono">{part}</code>
      : part,
  );
}

function App() {
  const [status, setStatus] = useState<PlanStatus>('idle');
  const [activeStep, setActiveStep] = useState(-1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleStart = useCallback(() => {
    if (status !== 'idle') return;
    setStatus('processing');
    setActiveStep(0);

    let step = 0;
    intervalRef.current = setInterval(() => {
      step++;
      if (step >= SAMPLE_STEPS.length) {
        clearInterval(intervalRef.current!);
        setTimeout(() => {
          setStatus('complete');
        }, 800);
      } else {
        setActiveStep(step);
      }
    }, 1500);
  }, [status]);

  const handleEdit = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStatus('idle');
    setActiveStep(-1);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <ResearchPlan
          title="Latency-Optimized HTTP Client Module"
          steps={SAMPLE_STEPS}
          estimatedTime="Ready in a few mins"
          status={status}
          activeStepIndex={activeStep}
          defaultExpandedSteps={[1]}
          onStart={handleStart}
          onEdit={handleEdit}
          renderTaskText={highlightCode}
        />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
