import { MapPin } from 'lucide-react';
import { ComponentDefinition } from '../../types';

const GeolocationField: ComponentDefinition = {
  Component: () => (
    <div className="mt-1 flex-1 flex flex-col border border-gray-300 rounded-md overflow-hidden">
      <div className="flex-1 bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <MapPin className="mx-auto h-8 w-8 mb-2" />
          <p className="text-sm">Click to select location</p>
        </div>
      </div>
      <div className="p-2 bg-gray-50 border-t border-gray-300 flex-shrink-0">
        <input
          type="text"
          placeholder="Search location..."
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          disabled
        />
      </div>
    </div>
  ),
  name: 'Geolocation',
  fieldType: 'geolocation',
  description: 'Select a location from a map.',
  icon: MapPin,
  layout: { defaultW: 6, defaultH: 9, minW: 4, minH: 8 },
  defaultProps: {
    label: 'New Geolocation Field',
    required: false,
  },
};

export default GeolocationField;
