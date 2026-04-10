import MuiTextField from '@mui/material/TextField';
import { ComponentDefinition } from '../../types';

const TextareaField: ComponentDefinition = {
  Component: ({ element }) => (
    <MuiTextField
      variant="outlined"
      size="small"
      placeholder={element.placeholder}
      label={element.label}
      multiline
      rows={element.rows || 4}
      fullWidth
      disabled
      sx={{ mt: 1 }}
    />
  ),
  exportProperties: {
    component: 'TextField',
    package: '@mui/material',
    variant: 'outlined',
    multiline: true,
  },
};

export default TextareaField;
