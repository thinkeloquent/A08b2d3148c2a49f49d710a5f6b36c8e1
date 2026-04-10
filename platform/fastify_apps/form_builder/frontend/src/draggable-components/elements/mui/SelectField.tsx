import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { ComponentDefinition } from '../../types';

const SelectField: ComponentDefinition = {
  Component: ({ element }) => (
    <FormControl fullWidth size="small" sx={{ mt: 1 }} disabled>
      <InputLabel>{element.label}</InputLabel>
      <Select label={element.label} value="">
        <MenuItem value="">
          <em>{element.placeholder || 'Select an option'}</em>
        </MenuItem>
        {element.options?.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  ),
  exportProperties: {
    component: 'Select',
    package: '@mui/material',
    wrapperComponent: 'FormControl',
    labelComponent: 'InputLabel',
  },
};

export default SelectField;
