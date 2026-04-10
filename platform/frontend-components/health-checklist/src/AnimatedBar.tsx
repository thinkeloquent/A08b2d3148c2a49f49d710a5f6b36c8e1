import { useState, useEffect } from 'react';
import type { AnimatedBarProps } from './types';

const STYLE_ID = 'health-checklist-keyframes';

function ensureKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes hc-shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `;
  document.head.appendChild(style);
}

export function AnimatedBar({ value, color, glow, delay = 0, className }: AnimatedBarProps) {
  const [width, setWidth] = useState(0);
  const [glowing, setGlowing] = useState(false);

  useEffect(() => {
    ensureKeyframes();
    const t1 = setTimeout(() => setWidth(value), delay + 300);
    const t2 = setTimeout(() => setGlowing(true), delay + 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [value, delay]);

  return (
    <div
      className={['relative w-full h-1 rounded-full overflow-visible', className].filter(Boolean).join(' ')}
      style={{ background: 'rgba(255,255,255,0.07)' }}
    >
      <div
        className="absolute top-0 left-0 h-full rounded-full"
        style={{
          width: `${width}%`,
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          boxShadow: glowing ? `0 0 12px 2px ${glow}` : 'none',
          transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.6s ease',
        }}
      />
      <div
        className="absolute top-0 left-0 h-full rounded-full pointer-events-none"
        style={{
          width: `${width}%`,
          background: 'linear-gradient(90deg, transparent 60%, rgba(255,255,255,0.25) 80%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: glowing ? 'hc-shimmer 2.5s infinite' : 'none',
          transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)',
        }}
      />
    </div>
  );
}
