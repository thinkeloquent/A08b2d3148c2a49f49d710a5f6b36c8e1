export const ItemTypes = {
  FORM_ELEMENT: 'formElement',
};

export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'grid'
  | 'date'
  | 'number'
  | 'upload'
  | 'image'
  | 'color'
  | 'geolocation';

export interface SelectOption {
  label: string;
  value: string;
}

// Component library options
export const COMPONENT_LIBRARIES = [
  'tailwind',
  'material-ui',
  'shadcn',
] as const;

export type ComponentLibrary = typeof COMPONENT_LIBRARIES[number];

export interface FormElement {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: SelectOption[];
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  accept?: string;
  multiple?: boolean;
  defaultValue?: string | string[] | number | boolean;
  locked?: boolean;
  // Which container (meta-component) owns this element, null = root
  parentContainerId?: string | null;
  // Component library for rendering
  componentLibrary?: ComponentLibrary;
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW: number;
  minH: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

export interface FormPage {
  id: string;
  title: string;
  description?: string;
  elements: FormElement[];
  layout: LayoutItem[];
}

export interface FormState {
  pages: FormPage[];
  currentPageIndex: number;
  selectedElementId: string | null;
}

// Component configurations (layout, defaults) are now in draggable-components.ts

// Element metadata types
export const ANNOTATION_TYPES = [
  'string',
  'number',
  'boolean',
  'date',
  'email',
  'url',
  'phone',
  'array',
  'object',
  'custom',
] as const;

export type AnnotationType = typeof ANNOTATION_TYPES[number];

export interface ElementReference {
  key: string;
  value: string;
}

export interface AnnotationEntry {
  key: string;
  value: string;
}

export interface ElementMetadata {
  elementId: string;
  annotation: {
    type: AnnotationType;
    customType?: string; // Used when type is 'custom'
    entries: AnnotationEntry[]; // Additional key-value annotations
  };
  comments: string;
  references: ElementReference[];
}

// Bounding rectangle for element positioning (from getBoundingClientRect)
export interface BoundingRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
  x: number;
  y: number;
}

// Element bounds with root and relative positioning
export interface ElementBoundsData {
  // Bounds relative to the root drop zone (canvas)
  root: BoundingRect;
  // Bounds relative to parent meta-component (if element is inside one)
  // null if element is at root level
  relative: BoundingRect | null;
  // IDs of parent meta-components (array for future multi-parent support)
  // Currently only parentContainerIds[0] is used
  parentContainerIds: string[];
}

// Element bounds storage
export interface ElementBounds {
  elementId: string;
  pageId: string;
  bounds: ElementBoundsData;
  updatedAt: string;
}

// Re-export state types
export * from './state';

// Re-export meta-component types
export * from './meta-components';
