import { createRoot } from 'react-dom/client';
import './styles.css';
import { FloatingToolbar } from '../src';
import type { FloatingToolbarItem } from '../src';

const SAMPLE_TOOLS: FloatingToolbarItem[] = [
  {
    id: 'analytics',
    label: 'Analytics',
    shortcut: '⌘1',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <rect x="3" y="14" width="3" height="7" rx="1" />
        <rect x="9" y="9" width="3" height="12" rx="1" />
        <rect x="15" y="5" width="3" height="16" rx="1" />
      </svg>
    ),
  },
  {
    id: 'expand',
    label: 'Expand',
    shortcut: '⌘E',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    ),
  },
  {
    id: 'edit',
    label: 'Edit',
    shortcut: '⌘P',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      </svg>
    ),
  },
  {
    id: 'fill',
    label: 'Fill',
    shortcut: '⌘F',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    ),
  },
  {
    id: 'component',
    label: 'Component',
    shortcut: '⌘3',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    ),
  },
  {
    id: 'grid',
    label: 'Grid View',
    shortcut: '⌘G',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'link',
    label: 'Copy Link',
    shortcut: '⌘L',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    id: 'theme',
    label: 'Theme',
    shortcut: '⌘T',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      </svg>
    ),
  },
  {
    id: 'download',
    label: 'Export',
    shortcut: '⌘D',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
];

function App() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-10"
      style={{ background: 'linear-gradient(135deg, #e8ecf4 0%, #dde3ef 50%, #e4e8f2 100%)' }}
    >
      {/* Ambient grid dots */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #b8c0d0 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.35,
        }}
      />

      <div className="relative z-10 text-center">
        <p
          className="text-xs font-semibold tracking-[0.18em] uppercase"
          style={{ color: '#8892a4', fontFamily: "'DM Sans', system-ui, sans-serif", letterSpacing: '0.2em' }}
        >
          Canvas Toolbar
        </p>
      </div>

      <FloatingToolbar
        items={SAMPLE_TOOLS}
        dividerAfterIndices={[1, 3]}
        onActiveChange={(id) => console.log('active:', id)}
      />

      <div className="relative z-10 flex items-center gap-6">
        {['Click to activate', 'Hover for tooltip', 'Dividers group tools'].map((hint, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: i === 0 ? '#4361ee' : i === 1 ? '#7c3aed' : '#06b6d4' }}
            />
            <span className="text-xs" style={{ color: '#8892a4', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
              {hint}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
