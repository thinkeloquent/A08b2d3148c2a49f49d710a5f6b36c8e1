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
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: <Plus className="w-4 h-4 text-green-600" />,
          label: 'text-green-700',
        };
      case 'removed':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: <Minus className="w-4 h-4 text-red-600" />,
          label: 'text-red-700',
        };
      case 'modified':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: <ArrowRight className="w-4 h-4 text-yellow-600" />,
          label: 'text-yellow-700',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: null,
          label: 'text-gray-600',
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
                ? 'bg-green-200 text-green-900'
                : part.removed
                  ? 'bg-red-200 text-red-900 line-through'
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
    <div className={`p-3 rounded-lg border ${styles.bg} ${styles.border}`}>
      <div className="flex items-center gap-2 mb-2">
        {styles.icon}
        <span className={`text-sm font-medium capitalize ${styles.label}`}>
          {fieldLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        {change.type !== 'added' && (
          <div>
            <span className="text-xs text-gray-500 block mb-1">Original</span>
            <span className="text-gray-700 line-through">
              {formatValue(change.oldValue)}
            </span>
          </div>
        )}
        {change.type !== 'removed' && (
          <div className={change.type === 'added' ? 'col-span-2' : ''}>
            <span className="text-xs text-gray-500 block mb-1">New</span>
            <span className="text-gray-900 font-medium">
              {formatValue(change.newValue)}
            </span>
          </div>
        )}
      </div>

      {renderTextDiff()}
    </div>
  );
}
