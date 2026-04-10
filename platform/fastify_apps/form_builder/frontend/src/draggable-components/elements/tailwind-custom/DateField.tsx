import { Calendar } from 'lucide-react';
import { baseInputClass, ComponentDefinition } from '../../types';

const DateField: ComponentDefinition = {
  Component: () => (
    <input type="date" className={baseInputClass} disabled />
  ),
  name: 'Date',
  fieldType: 'date',
  description: 'Select date from a datepicker.',
  icon: Calendar,
  layout: { defaultW: 4, defaultH: 4, minW: 3, minH: 4 },
  defaultProps: {
    label: 'New Date Field',
    required: false,
  },
};

export default DateField;
