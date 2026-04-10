import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { ComponentDefinition } from '../../types';
import { cn } from '../../../lib/utils';

const CheckboxField: ComponentDefinition = {
  Component: ({ element }) => (
    <div className="mt-2 space-y-2">
      {element.options?.map((opt) => (
        <div key={opt.value} className="flex items-center space-x-2">
          <CheckboxPrimitive.Root
            id={opt.value}
            disabled
            className={cn(
              'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
              'border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900'
            )}
          >
            <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
              <Check className="h-3.5 w-3.5" />
            </CheckboxPrimitive.Indicator>
          </CheckboxPrimitive.Root>
          <label
            htmlFor={opt.value}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {opt.label}
          </label>
        </div>
      ))}
    </div>
  ),
  exportProperties: {
    component: 'Checkbox',
    package: '@/components/ui/checkbox',
    primitive: '@radix-ui/react-checkbox',
    labelComponent: 'Label',
  },
};

export default CheckboxField;
