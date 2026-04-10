import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { ComponentDefinition } from '../../types';

const CheckboxField: ComponentDefinition = {
  Component: ({ element }) => (
    <FormGroup sx={{ mt: 1 }}>
      {element.options?.map((opt) => (
        <FormControlLabel
          key={opt.value}
          control={<Checkbox size="small" disabled />}
          label={opt.label}
        />
      ))}
    </FormGroup>
  ),
  exportProperties: {
    component: 'Checkbox',
    package: '@mui/material',
    wrapperComponent: 'FormGroup',
    labelComponent: 'FormControlLabel',
  },
};

export default CheckboxField;
