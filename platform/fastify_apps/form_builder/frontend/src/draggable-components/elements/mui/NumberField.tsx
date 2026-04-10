import MuiTextField from '@mui/material/TextField';
import { ComponentDefinition } from '../../types';

const NumberField: ComponentDefinition = {
  Component: ({ element }) => (
    <MuiTextField
      type="number"
      variant="outlined"
      size="small"
      placeholder={element.placeholder}
      label={element.label}
      inputProps={{
        min: element.min,
        max: element.max,
        step: element.step,
      }}
      fullWidth
      disabled
      sx={{ mt: 1 }}
    />
  ),
  exportProperties: {
    component: 'TextField',
    package: '@mui/material',
    inputType: 'number',
    variant: 'outlined',
  },
};

export default NumberField;
