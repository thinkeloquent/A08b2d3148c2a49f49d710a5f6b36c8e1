import { AlignLeft } from 'lucide-react';
import { baseInputClass, ComponentDefinition } from '../../types';

const TextareaField: ComponentDefinition = {
  Component: ({ element }) => (
    <textarea
      placeholder={element.placeholder}
      className={`${baseInputClass} flex-1 resize-none`}
      disabled
    />
  ),
  name: 'Textarea',
  fieldType: 'textarea',
  description: 'Multiline text area.',
  icon: AlignLeft,
  layout: { defaultW: 6, defaultH: 6, minW: 3, minH: 5 },
  defaultProps: {
    label: 'New Textarea Field',
    placeholder: 'Enter text...',
    rows: 4,
    required: false,
  },
};

export default TextareaField;
