import { List } from 'lucide-react';
import { baseInputClass, ComponentDefinition } from '../../types';

const SelectField: ComponentDefinition = {
  Component: ({ element }) => (
    <select className={baseInputClass} disabled>
      <option value="">{element.placeholder || 'Select an option'}</option>
      {element.options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
  name: 'Select from List',
  fieldType: 'select',
  description: 'Select options from a dropdown.',
  icon: List,
  layout: { defaultW: 6, defaultH: 4, minW: 3, minH: 4 },
  defaultProps: {
    label: 'New Select Field',
    placeholder: 'Select an option',
    options: [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' },
    ],
    required: false,
  },
};

export default SelectField;
