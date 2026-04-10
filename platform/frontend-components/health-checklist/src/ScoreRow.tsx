import { useState, useEffect } from 'react';
import { AnimatedBar } from './AnimatedBar';
import type { ScoreRowProps } from './types';

export function ScoreRow({ item, index, isHovered, onHover, className }: ScoreRowProps) {
  const [counted, setCounted] = useState(0);

  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const duration = 1200;
    const target = item.value;
    const delay = index * 150 + 400;

    const timer = setTimeout(() => {
      const tick = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setCounted(Math.round(ease * target));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, delay);

    return () => { clearTimeout(timer); cancelAnimationFrame(frame); };
  }, [item.value, index]);

  return (
    <div
      onMouseEnter={() => onHover(item.id)}
      onMouseLeave={() => onHover(null)}
      className={['group relative rounded-xl p-4 cursor-default', className].filter(Boolean).join(' ')}
      style={{
        background: isHovered ? 'rgba(255,255,255,0.065)' : 'rgba(255,255,255,0.035)',
        border: `1px solid ${isHovered ? item.color + '55' : 'rgba(255,255,255,0.06)'}`,
        transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
        boxShadow: isHovered ? `0 0 24px -4px ${item.glow}` : 'none',
        transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
      }}
    >
      <div
        className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
        style={{
          background: item.color,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          boxShadow: `0 0 8px ${item.color}`,
        }}
      />

      <div className="flex items-start justify-between mb-3 pl-2">
        <div>
          <p className="font-mono text-sm font-bold tracking-wide" style={{ color: '#E2E8F0' }}>
            {item.label}
          </p>
          <p className="font-mono text-xs mt-0.5" style={{ color: '#64748B' }}>
            {item.sub}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <span
            className="font-mono text-lg font-bold tabular-nums"
            style={{
              color: item.color,
              textShadow: isHovered ? `0 0 20px ${item.color}` : 'none',
              transition: 'text-shadow 0.3s ease',
            }}
          >
            {counted}
          </span>
          <span className="font-mono text-sm font-bold" style={{ color: item.color + '99' }}>
            %
          </span>
        </div>
      </div>

      <div className="pl-2">
        <AnimatedBar value={item.value} color={item.color} glow={item.glow} delay={index * 150} />
      </div>
    </div>
  );
}
