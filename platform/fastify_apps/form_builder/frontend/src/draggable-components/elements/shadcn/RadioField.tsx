import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { ComponentDefinition } from '../../types';
import { cn } from '../../../lib/utils';

const RadioField: ComponentDefinition = {
  Component: ({ element }) => (
    <RadioGroupPrimitive.Root className="mt-2 space-y-2" disabled>
      {element.options?.map((opt) => (
        <div key={opt.value} className="flex items-center space-x-2">
          <RadioGroupPrimitive.Item
            id={opt.value}
            value={opt.value}
            className={cn(
              'aspect-square h-4 w-4 rounded-full border border-primary shadow',
              'focus:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'border-slate-300'
            )}
          >
            <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
              <Circle className="h-2.5 w-2.5 fill-current text-current" />
            </RadioGroupPrimitive.Indicator>
          </RadioGroupPrimitive.Item>
          <label
            htmlFor={opt.value}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {opt.label}
          </label>
        </div>
      ))}
    </RadioGroupPrimitive.Root>
  ),
  exportProperties: {
    component: 'RadioGroup',
    package: '@/components/ui/radio-group',
    primitive: '@radix-ui/react-radio-group',
    subComponents: ['RadioGroupItem'],
  },
};

export default RadioField;
