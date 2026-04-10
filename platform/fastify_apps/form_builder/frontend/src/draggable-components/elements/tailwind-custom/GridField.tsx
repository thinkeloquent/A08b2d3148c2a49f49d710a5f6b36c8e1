import { Grid } from 'lucide-react';
import { ComponentDefinition } from '../../types';

const GridField: ComponentDefinition = {
  Component: ({ element }) => (
    <div className="mt-2 flex-1 overflow-auto">
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-300 px-3 py-2"></th>
            <th className="border border-gray-300 px-3 py-2 text-sm">Col 1</th>
            <th className="border border-gray-300 px-3 py-2 text-sm">Col 2</th>
            <th className="border border-gray-300 px-3 py-2 text-sm">Col 3</th>
          </tr>
        </thead>
        <tbody>
          {['Row 1', 'Row 2', 'Row 3'].map((row) => (
            <tr key={row}>
              <td className="border border-gray-300 px-3 py-2 text-sm font-medium bg-gray-50">
                {row}
              </td>
              {[1, 2, 3].map((col) => (
                <td key={col} className="border border-gray-300 px-3 py-2 text-center">
                  <input
                    type="radio"
                    name={`${element.id}-${row}`}
                    className="h-4 w-4 text-indigo-600"
                    disabled
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
  name: 'Grid',
  fieldType: 'grid',
  description: 'Select options from a matrix.',
  icon: Grid,
  layout: { defaultW: 12, defaultH: 10, minW: 6, minH: 8 },
  defaultProps: {
    label: 'New Grid Field',
    required: false,
  },
};

export default GridField;
