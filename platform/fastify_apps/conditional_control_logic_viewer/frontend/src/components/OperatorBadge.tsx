import { memo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { LogicalOperator } from '@/types';

interface OperatorBadgeProps {
  operator: LogicalOperator;
  onChange: (operator: LogicalOperator) => void;
  isNested?: boolean;
}

function OperatorBadgeComponent({ operator, onChange, isNested = false }: OperatorBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          px-3 py-1 rounded-full text-xs font-semibold
          transition-all duration-200 ease-out
          flex items-center gap-1
          ${
            operator === 'AND'
              ? 'bg-sky-100 text-sky-700 border border-sky-200 hover:bg-sky-200'
              : 'bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200'
          }
          ${isNested ? 'shadow-sm' : ''}
        `}
      >
        {operator}
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-30 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden min-w-16">
            <button
              onClick={() => {
                onChange('AND');
                setIsOpen(false);
              }}
              className={`block w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                operator === 'AND' ? 'bg-sky-50 text-sky-700' : ''
              }`}
            >
              AND
            </button>
            <button
              onClick={() => {
                onChange('OR');
                setIsOpen(false);
              }}
              className={`block w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                operator === 'OR' ? 'bg-amber-50 text-amber-700' : ''
              }`}
            >
              OR
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export const OperatorBadge = memo(OperatorBadgeComponent);
