import { useState, useEffect } from 'react';
import { RadialGauge } from './RadialGauge';
import { ScoreRow } from './ScoreRow';
import type { HealthChecklistProps } from './types';

const ANIM_STYLE_ID = 'health-checklist-panel-keyframes';

function ensurePanelKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(ANIM_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = ANIM_STYLE_ID;
  style.textContent = `
    @keyframes hc-fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes hc-scanline {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100%); }
    }
    @keyframes hc-pulse-ring {
      0% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); }
      100% { box-shadow: 0 0 0 12px rgba(245,158,11,0); }
    }
    @keyframes hc-float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-4px); }
    }
    .hc-panel-enter {
      animation: hc-fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
  `;
  document.head.appendChild(style);
}

export function HealthChecklist({
  scores,
  totalScore,
  statusLabel = 'PARTIAL',
  description,
  version,
  onDismiss,
  className,
}: HealthChecklistProps) {
  const [visible, setVisible] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  useEffect(() => {
    ensurePanelKeyframes();
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={[
        'relative w-full max-w-lg',
        visible ? 'hc-panel-enter' : 'opacity-0',
        className,
      ].filter(Boolean).join(' ')}
      style={{
        background: 'linear-gradient(145deg, #161B27 0%, #111622 60%, #0F1420 100%)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '18px',
        boxShadow: '0 32px 80px -16px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04) inset',
        overflow: 'hidden',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      {/* Top shimmer line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)' }}
      />

      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[18px]" style={{ zIndex: 0 }}>
        <div
          style={{
            position: 'absolute',
            left: 0, right: 0,
            height: '2px',
            background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.03), transparent)',
            animation: 'hc-scanline 8s linear infinite',
          }}
        />
      </div>

      <div className="relative z-10 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="px-3 py-1.5 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, #92400E, #78350F)',
                border: '1px solid rgba(245,158,11,0.3)',
                animation: 'hc-pulse-ring 2s ease-out infinite',
              }}
            >
              <span className="text-xs font-bold tracking-widest" style={{ color: '#FCD34D' }}>
                {statusLabel}
              </span>
            </div>
            <RadialGauge score={totalScore} />
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-md"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
              }}
            >
              <span className="text-xs font-mono tracking-widest" style={{ color: '#475569' }}>ESC</span>
            </button>
          )}
        </div>

        {/* Description */}
        {description && (
          <div
            className="rounded-xl p-4"
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div className="text-sm leading-relaxed" style={{ color: '#94A3B8', lineHeight: '1.75' }}>
              {description}
            </div>
          </div>
        )}

        {/* Scoring breakdown */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-xs tracking-[0.2em] font-semibold" style={{ color: '#334155' }}>
              SCORING BREAKDOWN
            </span>
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <div className="space-y-2">
            {scores.map((item, i) => (
              <ScoreRow
                key={item.id}
                item={item}
                index={i}
                isHovered={hoveredRow === item.id}
                onHover={setHoveredRow}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#F59E0B', animation: 'hc-float 2s ease-in-out infinite' }}
            />
            {version && (
              <span className="text-xs" style={{ color: '#334155' }}>{version}</span>
            )}
          </div>
          <span className="text-xs" style={{ color: '#1E293B' }}>score: {totalScore}/100</span>
        </div>
      </div>
    </div>
  );
}
