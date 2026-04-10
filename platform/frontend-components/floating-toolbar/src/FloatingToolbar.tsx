import { useState, useRef } from 'react';
import type { FloatingToolbarProps, FloatingToolbarItem } from './types';

interface TooltipState {
  visible: boolean;
  label: string;
  shortcut: string;
  x: number;
}

const rippleKeyframeId = 'ft-rippleOut';

export function FloatingToolbar({
  items,
  dividerAfterIndices = [],
  activeId: controlledActiveId,
  onActiveChange,
  className,
}: FloatingToolbarProps) {
  const isControlled = controlledActiveId !== undefined;
  const [internalActiveId, setInternalActiveId] = useState<string | null>(null);
  const activeId = isControlled ? controlledActiveId : internalActiveId;

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, label: '', shortcut: '', x: 0 });
  const [ripple, setRipple] = useState<{ id: string | null; key: number }>({ id: null, key: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  const handleClick = (id: string) => {
    const next = id === activeId ? null : id;
    if (!isControlled) setInternalActiveId(next);
    onActiveChange?.(next);
    setRipple({ id, key: ripple.key + 1 });
  };

  const handleMouseEnter = (tool: FloatingToolbarItem, e: React.MouseEvent<HTMLButtonElement>) => {
    setHoveredId(tool.id);
    const rect = e.currentTarget.getBoundingClientRect();
    const toolbarRect = toolbarRef.current?.getBoundingClientRect();
    setTooltip({
      visible: true,
      label: tool.label,
      shortcut: tool.shortcut ?? '',
      x: rect.left - (toolbarRect?.left ?? 0) + rect.width / 2,
    });
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
    setTooltip((t) => ({ ...t, visible: false }));
  };

  return (
    <div className={['relative', className].filter(Boolean).join(' ')} ref={toolbarRef}>
      {/* Tooltip */}
      <div
        className="absolute pointer-events-none transition-all duration-150"
        style={{
          bottom: 'calc(100% + 12px)',
          left: tooltip.x,
          opacity: tooltip.visible ? 1 : 0,
          transitionProperty: 'opacity, transform',
          transform: tooltip.visible
            ? 'translateX(-50%) translateY(0px)'
            : 'translateX(-50%) translateY(4px)',
        }}
      >
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-lg"
          style={{ background: '#1e2433', whiteSpace: 'nowrap' }}
        >
          <span
            className="text-xs font-medium"
            style={{ color: '#e8edf5', fontFamily: "'DM Sans', system-ui, sans-serif" }}
          >
            {tooltip.label}
          </span>
          {tooltip.shortcut && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ background: '#2d3446', color: '#7e8fa8', fontFamily: 'monospace', fontSize: '10px' }}
            >
              {tooltip.shortcut}
            </span>
          )}
        </div>
        {/* Arrow */}
        <div className="absolute left-1/2 -bottom-1.5" style={{ transform: 'translateX(-50%)' }}>
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '7px solid #1e2433',
            }}
          />
        </div>
      </div>

      {/* Main pill container */}
      <div
        className="flex items-center px-3 py-2.5 gap-0.5"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          boxShadow:
            '0 4px 24px rgba(80,100,150,0.10), 0 1px 4px rgba(80,100,150,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
          border: '1px solid rgba(210,218,235,0.8)',
        }}
      >
        {items.map((tool, idx) => {
          const isActive = activeId === tool.id;
          const isHovered = hoveredId === tool.id;

          return (
            <div key={tool.id} className="flex items-center">
              <button
                onClick={() => handleClick(tool.id)}
                onMouseEnter={(e) => handleMouseEnter(tool, e)}
                onMouseLeave={handleMouseLeave}
                className="relative flex items-center justify-center overflow-hidden transition-all duration-150"
                style={{
                  width: '40px',
                  height: '38px',
                  borderRadius: '12px',
                  color: isActive ? '#4361ee' : isHovered ? '#374260' : '#6474a0',
                  background: isActive
                    ? 'rgba(67,97,238,0.10)'
                    : isHovered
                      ? 'rgba(99,120,180,0.07)'
                      : 'transparent',
                  border: isActive ? '1px solid rgba(67,97,238,0.18)' : '1px solid transparent',
                  transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
                  boxShadow: isActive ? '0 2px 8px rgba(67,97,238,0.15)' : 'none',
                }}
              >
                {/* Ripple */}
                {ripple.id === tool.id && (
                  <span
                    key={ripple.key}
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(67,97,238,0.22) 0%, transparent 70%)',
                      animation: `${rippleKeyframeId} 0.45s ease-out forwards`,
                    }}
                  />
                )}
                {tool.icon}

                {/* Active dot indicator */}
                {isActive && (
                  <span
                    className="absolute bottom-[5px] left-1/2"
                    style={{
                      transform: 'translateX(-50%)',
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: '#4361ee',
                      boxShadow: '0 0 6px rgba(67,97,238,0.6)',
                    }}
                  />
                )}
              </button>

              {/* Divider */}
              {dividerAfterIndices.includes(idx) && (
                <div
                  className="mx-1.5"
                  style={{
                    width: '1px',
                    background: 'linear-gradient(to bottom, transparent, #d0d8e8 30%, #d0d8e8 70%, transparent)',
                    height: '22px',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Reflection glow */}
      <div
        className="absolute left-1/2 -z-10"
        style={{
          bottom: '-18px',
          transform: 'translateX(-50%)',
          width: '70%',
          height: '20px',
          background: 'radial-gradient(ellipse at center, rgba(100,120,200,0.18) 0%, transparent 70%)',
          filter: 'blur(6px)',
        }}
      />

      {/* Inject ripple keyframes once */}
      <style>{`
        @keyframes ${rippleKeyframeId} {
          from { opacity: 1; transform: scale(0.5); }
          to   { opacity: 0; transform: scale(2.2); }
        }
      `}</style>
    </div>
  );
}
