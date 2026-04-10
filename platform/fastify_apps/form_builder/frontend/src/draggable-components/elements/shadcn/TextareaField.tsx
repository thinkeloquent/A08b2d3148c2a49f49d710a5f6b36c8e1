import { ComponentDefinition } from '../../types';
import { cn } from '../../../lib/utils';

const TextareaField: ComponentDefinition = {
  Component: ({ element }) => (
    <textarea
      placeholder={element.placeholder}
      rows={element.rows || 4}
      disabled
      className={cn(
        'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'mt-1 border-slate-200 bg-white'
      )}
    />
  ),
  exportProperties: {
    component: 'Textarea',
    package: '@/components/ui/textarea',
    styling: 'tailwind-merge',
  },
};

export default TextareaField;
