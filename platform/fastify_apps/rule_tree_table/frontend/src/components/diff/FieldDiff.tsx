import { FieldChange, formatValue, diffStrings } from '@/lib/diff';
import { Minus, Plus, ArrowRight } from 'lucide-react';

interface FieldDiffProps {
  change: FieldChange;
  label?: string;
}

export function FieldDiff({ change, label }: FieldDiffProps) {
  const fieldLabel = label || change.field.replace(/_/g, ' ');

  const getChangeStyles = () => {
    switch (change.type) {
      case 'added':
        return {
          bg: 'bg-emerald-50/80',
          border: 'border-emerald-200',
          icon: <Plus className="w-4 h-4 text-emerald-500" />,
          label: 'text-emerald-700',
        };
      case 'removed':
        return {
          bg: 'bg-red-50/80',
          border: 'border-red-200',
          icon: <Minus className="w-4 h-4 text-red-500" />,
          label: 'text-red-700',
        };
      case 'modified':
        return {
          bg: 'bg-amber-50/80',
          border: 'border-amber-200',
          icon: <ArrowRight className="w-4 h-4 text-amber-500" />,
          label: 'text-amber-700',
        };
      default:
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          icon: null,
          label: 'text-slate-600',
        };
    }
  };

  const styles = getChangeStyles();

  if (change.type === 'unchanged') {
    return null;
  }

  const renderTextDiff = () => {
    if (
      change.type !== 'modified' ||
      typeof change.oldValue !== 'string' ||
      typeof change.newValue !== 'string'
    ) {
      return null;
    }

    const diff = diffStrings(change.oldValue, change.newValue);

    return (
      <div className="mt-2 text-sm font-mono">
        {diff.map((part, index) => (
          <span
            key={index}
            className={
              part.added
                ? 'bg-emerald-200/60 text-emerald-900'
                : part.removed
                  ? 'bg-red-200/60 text-red-900 line-through'
                  : ''
            }
          >
            {part.value}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={`p-3 rounded-xl border ${styles.bg} ${styles.border}`}>
      <div className="flex items-center gap-2 mb-2">
        {styles.icon}
        <span className={`text-sm font-medium capitalize ${styles.label}`}>
          {fieldLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        {change.type !== 'added' && (
          <div>
            <span className="text-xs text-slate-400 block mb-1">Original</span>
            <span className="text-slate-500 line-through">
              {formatValue(change.oldValue)}
            </span>
          </div>
        )}
        {change.type !== 'removed' && (
          <div className={change.type === 'added' ? 'col-span-2' : ''}>
            <span className="text-xs text-slate-400 block mb-1">New</span>
            <span className="text-slate-800 font-medium">
              {formatValue(change.newValue)}
            </span>
          </div>
        )}
      </div>

      {renderTextDiff()}
    </div>
  );
}
