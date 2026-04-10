import { useState, useEffect } from 'react';
import type { RadialGaugeProps } from './types';

export function RadialGauge({ score, className }: RadialGaugeProps) {
  const [drawn, setDrawn] = useState(0);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const t = setTimeout(() => setDrawn(score), 600);
    return () => clearTimeout(t);
  }, [score]);

  const offset = circumference - (drawn / 100) * circumference;
  const gaugeId = `hc-gaugeGrad-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div className={['relative inline-flex items-center justify-center', className].filter(Boolean).join(' ')}>
      <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="36" cy="36" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="5"
        />
        <circle
          cx="36" cy="36" r={radius}
          fill="none"
          stroke={`url(#${gaugeId})`}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.22,1,0.36,1)' }}
        />
        <defs>
          <linearGradient id={gaugeId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-base font-bold leading-none" style={{ color: '#FBBF24' }}>
          {Math.round(drawn)}
        </span>
      </div>
    </div>
  );
}
