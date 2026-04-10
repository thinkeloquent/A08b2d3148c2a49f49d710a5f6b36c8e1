import { Hash } from 'lucide-react';
import { baseInputClass, ComponentDefinition } from '../../types';

const NumberField: ComponentDefinition = {
  Component: ({ element }) => (
    <input
      type="number"
      placeholder={element.placeholder}
      min={element.min}
      max={element.max}
      step={element.step}
      className={baseInputClass}
      disabled
    />
  ),
  name: 'Numeric',
  fieldType: 'number',
  description: 'It accepts only numbers.',
  icon: Hash,
  layout: { defaultW: 4, defaultH: 4, minW: 3, minH: 4 },
  defaultProps: {
    label: 'New Number Field',
    placeholder: '0',
    min: 0,
    max: 100,
    step: 1,
    required: false,
  },
};

export default NumberField;
