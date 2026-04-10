import { FormElement, ContainerChildElement, FieldType, ComponentLibrary } from '../types';
import { getComponentByFieldType, getLibraryComponent } from '../draggable-components';

// Element type that can be rendered - either a full FormElement or a ContainerChildElement
type RenderableElement = FormElement | ContainerChildElement;

interface FieldRendererProps {
  element: RenderableElement;
  isSelected?: boolean;
  onSelect?: () => void;
}

// Helper to get component library from element
const getComponentLibrary = (element: RenderableElement): ComponentLibrary => {
  if ('componentLibrary' in element) {
    const lib = element.componentLibrary;
    if (lib === 'tailwind' || lib === 'material-ui' || lib === 'shadcn') {
      return lib;
    }
  }
  return 'tailwind';
};

const FieldRenderer = ({ element, isSelected, onSelect }: FieldRendererProps) => {
  const componentConfig = getComponentByFieldType(element.type as FieldType);
  const library = getComponentLibrary(element);
  const fieldType = element.type as FieldType;

  // Get library-specific component, falls back to tailwind automatically
  const FieldComponent = getLibraryComponent(library, fieldType) || componentConfig?.component;

  if (!FieldComponent) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Unknown field type: {fieldType}
      </div>
    );
  }

  // Extract properties with fallbacks for ContainerChildElement
  const label = element.label;
  const required = 'required' in element ? (element.required as boolean) : false;
  const helpText = 'helpText' in element ? (element.helpText as string | undefined) : undefined;

  return (
    <div
      className={`h-full flex flex-col p-3 ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
    >
      <label className="block text-sm font-medium text-gray-700 flex-shrink-0">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex-1 min-h-0 flex flex-col">
        <FieldComponent element={element as FormElement} />
      </div>
      {helpText && (
        <p className="mt-1 text-xs text-gray-500 flex-shrink-0">{helpText}</p>
      )}
    </div>
  );
};

export default FieldRenderer;
