import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import { ComponentDefinition } from '../../types';

const RadioField: ComponentDefinition = {
  Component: ({ element }) => (
    <FormControl sx={{ mt: 1 }} disabled>
      <RadioGroup>
        {element.options?.map((opt) => (
          <FormControlLabel
            key={opt.value}
            value={opt.value}
            control={<Radio size="small" />}
            label={opt.label}
          />
        ))}
      </RadioGroup>
    </FormControl>
  ),
  exportProperties: {
    component: 'Radio',
    package: '@mui/material',
    wrapperComponent: 'RadioGroup',
    labelComponent: 'FormControlLabel',
  },
};

export default RadioField;
