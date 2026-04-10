import { ComponentDefinition } from '../../types';
import { cn } from '../../../lib/utils';

const TextField: ComponentDefinition = {
  Component: ({ element }) => (
    <input
      type="text"
      placeholder={element.placeholder}
      disabled
      className={cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'mt-1 border-slate-200 bg-white'
      )}
    />
  ),
  exportProperties: {
    component: 'Input',
    package: '@/components/ui/input',
    primitive: '@radix-ui/react-slot',
    styling: 'tailwind-merge',
  },
};

export default TextField;
