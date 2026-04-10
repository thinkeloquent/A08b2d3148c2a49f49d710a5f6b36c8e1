import { CheckSquare } from 'lucide-react';
import { ComponentDefinition } from '../../types';

const CheckboxField: ComponentDefinition = {
  Component: ({ element }) => (
    <div className="mt-2 space-y-2">
      {element.options?.map((opt) => (
        <label key={opt.value} className="flex items-center gap-2">
          <input
            type="checkbox"
            value={opt.value}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            disabled
          />
          <span className="text-sm text-gray-700">{opt.label}</span>
        </label>
      ))}
    </div>
  ),
  name: 'Multiple Selection',
  fieldType: 'checkbox',
  description: 'Select multiple options (checkbox).',
  icon: CheckSquare,
  layout: { defaultW: 6, defaultH: 6, minW: 3, minH: 5 },
  defaultProps: {
    label: 'New Checkbox Field',
    options: [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' },
    ],
    required: false,
  },
};

export default CheckboxField;
