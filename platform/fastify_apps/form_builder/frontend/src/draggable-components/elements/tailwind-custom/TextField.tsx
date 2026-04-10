import { CaseSensitive } from 'lucide-react';
import { baseInputClass, ComponentDefinition } from '../../types';

const TextField: ComponentDefinition = {
  Component: ({ element }) => (
    <input
      type="text"
      placeholder={element.placeholder}
      className={baseInputClass}
      disabled
    />
  ),
  name: 'Text',
  fieldType: 'text',
  description: 'Single line text input.',
  icon: CaseSensitive,
  layout: { defaultW: 6, defaultH: 4, minW: 3, minH: 4 },
  defaultProps: {
    label: 'New Text Field',
    placeholder: 'Enter text...',
    required: false,
  },
};

export default TextField;
