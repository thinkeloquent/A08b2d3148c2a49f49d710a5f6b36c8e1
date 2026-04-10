import MuiTextField from '@mui/material/TextField';
import { ComponentDefinition } from '../../types';

const DateField: ComponentDefinition = {
  Component: ({ element }) => (
    <MuiTextField
      type="date"
      variant="outlined"
      size="small"
      label={element.label}
      fullWidth
      disabled
      InputLabelProps={{ shrink: true }}
      sx={{ mt: 1 }}
    />
  ),
  exportProperties: {
    component: 'DatePicker',
    package: '@mui/x-date-pickers',
  },
};

export default DateField;
