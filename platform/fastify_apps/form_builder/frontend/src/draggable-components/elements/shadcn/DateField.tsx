import { ComponentDefinition } from '../../types';
import { cn } from '../../../lib/utils';

const DateField: ComponentDefinition = {
  Component: () => (
    <input
      type="date"
      disabled
      className={cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'mt-1 border-slate-200 bg-white'
      )}
    />
  ),
  exportProperties: {
    component: 'DatePicker',
    package: '@/components/ui/date-picker',
    primitive: '@radix-ui/react-popover',
    dependencies: ['date-fns', 'react-day-picker'],
  },
};

export default DateField;
