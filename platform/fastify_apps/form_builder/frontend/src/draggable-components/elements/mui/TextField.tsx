import MuiTextField from '@mui/material/TextField';
import { ComponentDefinition } from '../../types';

const TextField: ComponentDefinition = {
  Component: ({ element }) => (
    <MuiTextField
      variant="outlined"
      size="small"
      placeholder={element.placeholder}
      label={element.label}
      fullWidth
      disabled
      sx={{ mt: 1 }}
    />
  ),
  exportProperties: {
    component: 'TextField',
    package: '@mui/material',
    variant: 'outlined',
    size: 'small',
  },
};

export default TextField;
