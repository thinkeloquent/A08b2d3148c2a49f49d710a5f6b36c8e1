// Re-export types
export * from './types';

// Import library component modules
import * as tailwindCustom from './elements/tailwind-custom';
import * as mui from './elements/mui';
import * as shadcn from './elements/shadcn';

// Import base export properties
import { baseExportProperties } from './base-export-properties';

import {
  DraggableComponentConfig,
  ComponentDefinition,
  FieldComponent,
  ExportProperties,
  LibraryComponentRegistry,
} from './types';
import { FieldType, ComponentLibrary, FormElement } from '../types';

// Build component registries per library from the component modules
function buildRegistryFromModule(
  module: Record<string, ComponentDefinition>
): LibraryComponentRegistry {
  const registry: LibraryComponentRegistry = {};

  Object.values(module).forEach((componentDef) => {
    if (componentDef.fieldType) {
      registry[componentDef.fieldType] = componentDef;
    }
  });

  return registry;
}

// Library component registries - maps library to field type to component definition
const libraryRegistries: Record<ComponentLibrary, LibraryComponentRegistry> = {
  tailwind: buildRegistryFromModule(tailwindCustom as Record<string, ComponentDefinition>),
  'material-ui': buildRegistryFromModule(mui as Record<string, ComponentDefinition>),
  shadcn: buildRegistryFromModule(shadcn as Record<string, ComponentDefinition>),
};

// Type guard for complete component definitions
function isCompleteDefinition(
  def: ComponentDefinition
): def is ComponentDefinition & {
  name: string;
  fieldType: FieldType;
  icon: typeof def.icon;
  defaultProps: Omit<FormElement, 'id' | 'type'>;
} {
  return !!def.fieldType && !!def.name && !!def.icon && !!def.defaultProps?.label;
}

// Build draggable components configuration from tailwind (default) registry
// This is used for the component palette in the form builder
export const draggableComponents: DraggableComponentConfig[] = Object.values(
  tailwindCustom as Record<string, ComponentDefinition>
)
  .filter(isCompleteDefinition)
  .map((def) => ({
    type: def.name,
    fieldType: def.fieldType,
    description: def.description || '',
    icon: def.icon!,
    component: def.Component,
    layout: def.layout || { defaultW: 6, defaultH: 4, minW: 3, minH: 4 },
    defaultProps: {
      ...def.defaultProps,
      componentLibrary: 'tailwind' as ComponentLibrary,
    },
    exportProperties: {
      ...baseExportProperties[def.fieldType],
      ...def.exportProperties,
    },
  }));

// Get component for a specific library and field type
// Falls back to tailwind if the library doesn't have that field type
export function getLibraryComponent(
  library: ComponentLibrary,
  fieldType: FieldType
): FieldComponent | undefined {
  const libraryRegistry = libraryRegistries[library];
  const componentDef = libraryRegistry?.[fieldType];

  if (componentDef) {
    return componentDef.Component;
  }

  // Fallback to tailwind
  return libraryRegistries.tailwind?.[fieldType]?.Component;
}

// Get export properties for a specific library and field type
// Merges base properties with library-specific overrides
export function getLibraryExportProperties(
  library: ComponentLibrary,
  fieldType: FieldType
): ExportProperties {
  const base = baseExportProperties[fieldType] || {};
  const libraryRegistry = libraryRegistries[library];
  const componentDef = libraryRegistry?.[fieldType];

  return {
    ...base,
    ...(componentDef?.exportProperties || {}),
  };
}

// Helper to get component config by display type (e.g., 'Text', 'Textarea')
export function getComponentByType(type: string): DraggableComponentConfig | undefined {
  return draggableComponents.find((c) => c.type === type);
}

// Helper to get component config by field type (e.g., 'text', 'textarea')
export function getComponentByFieldType(fieldType: FieldType): DraggableComponentConfig | undefined {
  return draggableComponents.find((c) => c.fieldType === fieldType);
}

// Export library registries for external use
export { libraryRegistries };
