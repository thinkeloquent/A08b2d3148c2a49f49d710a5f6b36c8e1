import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDown } from 'lucide-react';
import { ComponentDefinition } from '../../types';
import { cn } from '../../../lib/utils';

const SelectField: ComponentDefinition = {
  Component: ({ element }) => (
    <SelectPrimitive.Root disabled>
      <SelectPrimitive.Trigger
        className={cn(
          'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm',
          'ring-offset-background placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-1 focus:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'mt-1 border-slate-200 bg-white'
        )}
      >
        <SelectPrimitive.Value placeholder={element.placeholder || 'Select an option'} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(
            'relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
            'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            'bg-white border-slate-200'
          )}
          position="popper"
          sideOffset={4}
        >
          <SelectPrimitive.Viewport className="p-1">
            {element.options?.map((opt) => (
              <SelectPrimitive.Item
                key={opt.value}
                value={opt.value}
                className={cn(
                  'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none',
                  'focus:bg-accent focus:text-accent-foreground',
                  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                  'hover:bg-slate-100'
                )}
              >
                <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  ),
  exportProperties: {
    component: 'Select',
    package: '@/components/ui/select',
    primitive: '@radix-ui/react-select',
    subComponents: ['SelectTrigger', 'SelectContent', 'SelectItem', 'SelectValue'],
  },
};

export default SelectField;
