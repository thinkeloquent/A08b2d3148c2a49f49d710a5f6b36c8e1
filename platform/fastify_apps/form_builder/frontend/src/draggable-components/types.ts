import React from 'react';
import { LucideIcon } from 'lucide-react';
import { FieldType, FormElement } from '../types';

// Base input class for consistent styling
export const baseInputClass =
  'mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm';

// Field component type - renders the field content (not the wrapper)
export type FieldComponent = React.FC<{ element: FormElement }>;

// Layout configuration
export interface LayoutConfig {
  defaultW: number;
  defaultH: number;
  minW: number;
  minH: number;
}

// Static export properties for ingesting apps
export interface ExportProperties {
  [key: string]: string | number | boolean | string[] | Record<string, unknown>;
}

// Component definition exported from each component file
export interface ComponentDefinition {
  Component: FieldComponent;
  exportProperties?: ExportProperties;
  // Component metadata
  name?: string;
  fieldType?: FieldType;
  description?: string;
  icon?: LucideIcon;
  layout?: LayoutConfig;
  defaultProps?: Omit<FormElement, 'id' | 'type'>;
}

// Draggable component configuration (built from ComponentDefinition)
export interface DraggableComponentConfig {
  type: string;
  fieldType: FieldType;
  description: string;
  icon: LucideIcon;
  component: FieldComponent;
  layout: LayoutConfig;
  defaultProps: Omit<FormElement, 'id' | 'type'>;
  // Static properties included in export for ingesting apps
  exportProperties?: ExportProperties;
}

// Library component registry - maps fieldType to component definition per library
export type LibraryComponentRegistry = Partial<Record<FieldType, ComponentDefinition>>;
