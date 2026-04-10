import { memo } from 'react';
import type { LogicalOperator } from '@/types';

interface ConnectorLineProps {
  isFirst: boolean;
  isLast: boolean;
  operator: LogicalOperator;
}

function ConnectorLineComponent({ isFirst, isLast, operator }: ConnectorLineProps) {
  const colorClass = operator === 'AND' ? 'bg-sky-200' : 'bg-amber-200';

  return (
    <div className="absolute left-0 top-0 bottom-0 w-16 pointer-events-none">
      {/* Vertical line segment */}
      <div
        className={`absolute w-0.5 ${colorClass}`}
        style={{
          left: '0.5rem',
          top: isFirst ? '50%' : '0',
          bottom: isLast ? '50%' : '0',
        }}
      />
      {/* Horizontal connector - L-shaped, only extends right from vertical line */}
      <div
        className={`absolute top-1/2 h-0.5 -translate-y-1/2 ${colorClass}`}
        style={{
          left: 'calc(0.5rem + 2px)',
          width: 'calc(3.5rem - 2px)',
        }}
      />
    </div>
  );
}

export const ConnectorLine = memo(ConnectorLineComponent);
