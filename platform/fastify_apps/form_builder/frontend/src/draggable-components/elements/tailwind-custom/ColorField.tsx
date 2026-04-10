import { Palette } from 'lucide-react';
import { baseInputClass, ComponentDefinition } from '../../types';

const ColorField: ComponentDefinition = {
  Component: ({ element }) => (
    <div className="mt-1 flex items-center gap-3">
      <input
        type="color"
        defaultValue={(element.defaultValue as string) || '#000000'}
        className="h-10 w-14 p-1 border border-gray-300 rounded cursor-pointer"
        disabled
      />
      <input
        type="text"
        defaultValue={(element.defaultValue as string) || '#000000'}
        className={`${baseInputClass} w-28`}
        disabled
      />
    </div>
  ),
  name: 'Color',
  fieldType: 'color',
  description: 'Select color from a colorpicker.',
  icon: Palette,
  layout: { defaultW: 4, defaultH: 4, minW: 3, minH: 4 },
  defaultProps: {
    label: 'New Color Field',
    defaultValue: '#000000',
    required: false,
  },
};

export default ColorField;
