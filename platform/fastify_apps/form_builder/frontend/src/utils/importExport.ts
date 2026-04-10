import yaml from 'js-yaml';
import { draggableComponents, getLibraryExportProperties, ExportProperties } from '../draggable-components';
import {
  FormPage,
  FormElement,
  LayoutItem,
  FormMetadata,
  ElementMetadata,
  ComponentLibrary,
  ElementBounds,
  ElementBoundsData,
  BoundingRect,
  MetaComponent,
  ContainerMetaComponent,
} from '../types';

// Serializable form schema for import/export
export interface ExportableFormSchema {
  version: string;
  exportedAt: string;
  pages: ExportablePage[];
  metadata?: ExportableFormMetadata;
}

// Behavior meta-component for export
export interface ExportableBehavior {
  id: string;
  name: string;
  metaType: string;
  element_id: string;  // The source element this behavior is attached to

  // conditional (V2)
  conditionGroups?: unknown[];
  groupCombineMode?: string;

  // behavior:flow
  flowSpec?: unknown;

  // behavior:state
  stateSpec?: unknown;

  // behavior:service
  serviceSpec?: unknown;

  // behavior:higher-order
  behaviorSpec?: unknown;

  // validation (legacy)
  rule?: unknown;
  errorMessage?: string;

  // config:guardrail
  guardrails?: unknown[];

  // config:static
  configValues?: Record<string, unknown>;
  schemaRef?: string;
  inlineSchema?: object;

  // config:specification (Analytics)
  specId?: string;
  specVersion?: string;
  telemetry?: unknown;

  // layout:composite
  compositeId?: string;
  blueprintRefs?: string[];
  dataBindings?: Record<string, string>;
  isLocked?: boolean;
}

// Export-only metadata structure (stripped of element data, no version - uses top-level)
export interface ExportableFormMetadata {
  pages: Record<string, ExportablePageMetadata>;
  // Behavior meta-components (non-visual, attached to elements)
  behaviors: ExportableBehavior[];
  // Element metadata moved here from top-level
  annotation: Record<string, { type: string; customType?: string; entries: Array<{ key: string; value: string }> }>;
  comments: Record<string, string>;
  references: Record<string, Array<{ key: string; value: string }>>;
}

// New layout format for metaLayout
export interface ExportableMetaLayoutItem {
  id: string;
  rgl_grid: [number, number, number, number]; // [x, y, w, h]
  bounds?: BoundingRect;
}

export interface ExportablePageMetadata {
  pageId: string;
  metaComponents: ExportableMetaComponent[];
  metaLayout: ExportableMetaLayoutItem[];
}

// Meta-component without childElements/childLayout (those go to pages.elements/layout)
export type ExportableMetaComponent = Omit<MetaComponent, 'childElements' | 'childLayout' | 'type'> & {
  // Renamed from 'type' to 'metaType' for clarity
  metaType: 'grouping' | 'section' | 'conditional' | 'validation';
  // HTML element type for rendering
  type: string;
  // For containers: only keep element IDs as references
  childElementIds?: string[];
};

export interface ExportablePage {
  id: string;
  title: string;
  description?: string;
  elements: ExportableElement[];
  layout: ExportableLayoutItem[];
}

// Layout item with new RGL grid format
export interface ExportableLayoutItem {
  id: string;                                    // renamed from 'i'
  rgl_grid: [number, number, number, number];    // [x, y, w, h]
  bounds?: BoundingRect;                         // Actual bounding rect from DOM
  static?: boolean;
  // Only for meta-components:
  metaType?: 'grouping' | 'section' | 'conditional' | 'validation';
  type?: string;                                 // HTML element: 'div', 'fieldset'
}

export interface ExportableElement {
  id: string;
  fieldType: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: Array<{ label: string; value: string }>;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  accept?: string;
  multiple?: boolean;
  defaultValue?: unknown;
  locked?: boolean;
  componentLibrary?: ComponentLibrary;
  // Static properties for ingesting apps (merged from component registry + library)
  exportProperties?: ExportProperties;
  // Bounding rectangles (root = relative to canvas, relative = relative to parent container)
  bounds?: ElementBoundsData;
}

// Helper to check if a meta-component is a container type
function isContainerMeta(meta: MetaComponent): boolean {
  return meta.type === 'grouping' || meta.type === 'section';
}

// Helper to get HTML element type for meta-components
function getMetaHtmlType(metaType: string): string {
  switch (metaType) {
    case 'section':
      return 'fieldset';
    case 'grouping':
    case 'conditional':
    case 'validation':
    default:
      return 'div';
  }
}

// Generic element type for both FormElement and ContainerChildElement
interface GenericElement {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: Array<{ label: string; value: string }>;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  accept?: string;
  multiple?: boolean;
  defaultValue?: unknown;
  locked?: boolean;
  componentLibrary?: ComponentLibrary;
  [key: string]: unknown;
}

// Helper to convert element to exportable format
function elementToExportable(
  el: GenericElement,
  elementBounds?: Record<string, ElementBounds>
): ExportableElement {
  const fieldType = el.type;
  return {
    id: el.id,
    fieldType,
    label: el.label,
    placeholder: el.placeholder,
    required: el.required,
    helpText: el.helpText,
    options: el.options,
    rows: el.rows,
    min: el.min,
    max: el.max,
    step: el.step,
    accept: el.accept,
    multiple: el.multiple,
    defaultValue: el.defaultValue,
    locked: el.locked,
    componentLibrary: el.componentLibrary,
    exportProperties: getLibraryExportProperties(
      el.componentLibrary || 'tailwind',
      fieldType as FormElement['type']
    ),
    bounds: elementBounds?.[el.id]?.bounds,
  };
}

// Convert runtime state to exportable format
export function exportFormToSchema(
  pages: FormPage[],
  metadata?: FormMetadata,
  elementMetadata?: Record<string, ElementMetadata>,
  elementBounds?: Record<string, ElementBounds>,
  version: string = '1.0.0'
): ExportableFormSchema {
  return {
    version,
    exportedAt: new Date().toISOString(),
    pages: pages.map((page) => {
      const pageMetadata = metadata?.pages[page.id];
      const metaComponents = pageMetadata?.metaComponents || [];
      const metaLayout = pageMetadata?.metaLayout || [];

      // Collect all elements: root elements + container child elements
      const allElements: ExportableElement[] = [];
      const allLayout: ExportableLayoutItem[] = [];

      // Add root elements
      page.elements.forEach((el) => {
        allElements.push(elementToExportable(el as unknown as GenericElement, elementBounds));
      });

      // Add root element layouts (convert to new format)
      page.layout.forEach((layoutItem) => {
        const exportableLayout: ExportableLayoutItem = {
          id: layoutItem.i,
          rgl_grid: [layoutItem.x, layoutItem.y, layoutItem.w, layoutItem.h],
        };
        // Add bounds from elementBounds (actual DOM bounding rect)
        const elBounds = elementBounds?.[layoutItem.i]?.bounds?.root;
        if (elBounds) {
          exportableLayout.bounds = elBounds;
        }
        if (layoutItem.static) exportableLayout.static = layoutItem.static;
        allLayout.push(exportableLayout);
      });

      // Add container meta-component layouts and their child elements
      metaComponents.forEach((meta) => {
        if (isContainerMeta(meta)) {
          const container = meta as ContainerMetaComponent;

          // Add child elements from container
          container.childElements.forEach((childEl) => {
            allElements.push(elementToExportable(childEl as unknown as GenericElement, elementBounds));
          });

          // Find the meta layout for this container
          const metaLayoutItem = metaLayout.find((ml) => ml.id === meta.id);
          if (metaLayoutItem) {
            // Add meta-component layout with new format
            const exportableLayout: ExportableLayoutItem = {
              id: metaLayoutItem.id,
              rgl_grid: [metaLayoutItem.x, metaLayoutItem.y, metaLayoutItem.w, metaLayoutItem.h],
              metaType: meta.type as ExportableLayoutItem['metaType'],
              type: getMetaHtmlType(meta.type),
            };
            // Add bounds from elementBounds if available for meta-component
            const metaBounds = elementBounds?.[meta.id]?.bounds?.root;
            if (metaBounds) {
              exportableLayout.bounds = metaBounds;
            }
            if (metaLayoutItem.static) exportableLayout.static = metaLayoutItem.static;
            allLayout.push(exportableLayout);
          }
        }
      });

      return {
        id: page.id,
        title: page.title,
        description: page.description,
        elements: allElements,
        layout: allLayout,
      };
    }),
    metadata: metadata ? exportMetadata(metadata, elementMetadata) : undefined,
  };
}

// Helper to check if a meta-component is a behavior type (non-visual, attached to elements)
function isBehaviorMeta(meta: MetaComponent): boolean {
  const behaviorTypes = [
    'conditional', 'validation',
    'behavior:flow', 'behavior:state', 'behavior:service', 'behavior:higher-order',
    'config:guardrail', 'config:static', 'config:specification',
    'layout:composite',
  ];
  return behaviorTypes.includes(meta.type);
}

// Convert metadata to export format (strip element data, keep only references)
function exportMetadata(
  metadata: FormMetadata,
  elementMetadata?: Record<string, ElementMetadata>
): ExportableFormMetadata {
  const exportedPages: Record<string, ExportablePageMetadata> = {};
  const behaviors: ExportableBehavior[] = [];

  for (const [pageId, pageMetadata] of Object.entries(metadata.pages)) {
    // Separate container meta-components from behavior meta-components
    const containerMetas = pageMetadata.metaComponents.filter((meta) => isContainerMeta(meta));
    const behaviorMetas = pageMetadata.metaComponents.filter((meta) => isBehaviorMeta(meta));

    // Convert container meta-components
    const exportedMetaComponents: ExportableMetaComponent[] = containerMetas.map((meta) => {
      const baseExport = {
        id: meta.id,
        name: meta.name,
        pageId: meta.pageId,
        metaType: meta.type as ExportableMetaComponent['metaType'],
        type: getMetaHtmlType(meta.type),
      };

      const container = meta as ContainerMetaComponent;
      // Strip childElements and childLayout, keep only IDs as references
      const { childElements, childLayout, type, ...rest } = container;
      return {
        ...rest,
        ...baseExport,
        childElementIds: childElements.map((el) => el.id),
      } as ExportableMetaComponent;
    });

    // Convert behavior meta-components to behaviors array
    behaviorMetas.forEach((meta) => {
      // Get the source element ID (first targetElementId)
      const targetElementIds = (meta as unknown as { targetElementIds?: string[] }).targetElementIds;
      const elementId = targetElementIds?.[0] ?? '';

      const behavior: ExportableBehavior = {
        id: meta.id,
        name: meta.name,
        metaType: meta.type,
        element_id: elementId,
      };

      // Add type-specific specs based on meta type
      const metaAny = meta as unknown as Record<string, unknown>;

      // conditional (V2)
      if (metaAny.conditionGroups) behavior.conditionGroups = metaAny.conditionGroups as unknown[];
      if (metaAny.groupCombineMode) behavior.groupCombineMode = metaAny.groupCombineMode as string;

      // behavior:flow
      if (metaAny.flowSpec) behavior.flowSpec = metaAny.flowSpec;

      // behavior:state
      if (metaAny.stateSpec) behavior.stateSpec = metaAny.stateSpec;

      // behavior:service
      if (metaAny.serviceSpec) behavior.serviceSpec = metaAny.serviceSpec;

      // behavior:higher-order
      if (metaAny.behaviorSpec) behavior.behaviorSpec = metaAny.behaviorSpec;

      // validation (legacy)
      if (metaAny.rule) behavior.rule = metaAny.rule;
      if (metaAny.errorMessage) behavior.errorMessage = metaAny.errorMessage as string;

      // config:guardrail
      if (metaAny.guardrails) behavior.guardrails = metaAny.guardrails as unknown[];

      // config:static
      if (metaAny.configValues) behavior.configValues = metaAny.configValues as Record<string, unknown>;
      if (metaAny.schemaRef) behavior.schemaRef = metaAny.schemaRef as string;
      if (metaAny.inlineSchema) behavior.inlineSchema = metaAny.inlineSchema as object;

      // config:specification (Analytics)
      if (metaAny.specId) behavior.specId = metaAny.specId as string;
      if (metaAny.specVersion) behavior.specVersion = metaAny.specVersion as string;
      if (metaAny.telemetry) behavior.telemetry = metaAny.telemetry;

      // layout:composite
      if (metaAny.compositeId) behavior.compositeId = metaAny.compositeId as string;
      if (metaAny.blueprintRefs) behavior.blueprintRefs = metaAny.blueprintRefs as string[];
      if (metaAny.dataBindings) behavior.dataBindings = metaAny.dataBindings as Record<string, string>;
      if (metaAny.isLocked !== undefined) behavior.isLocked = metaAny.isLocked as boolean;

      behaviors.push(behavior);
    });

    // Convert metaLayout to new format
    // MetaComponentLayoutItem has: id, x, y, w, h, static
    // bounds will be empty here since we don't have elementBounds in this function
    const exportedMetaLayout: ExportableMetaLayoutItem[] = pageMetadata.metaLayout.map((ml) => {
      const exportedItem: ExportableMetaLayoutItem = {
        id: ml.id,
        rgl_grid: [ml.x, ml.y, ml.w, ml.h],
        // bounds will be populated in exportFormToSchema where we have access to elementBounds
      };
      return exportedItem;
    });

    exportedPages[pageId] = {
      pageId: pageMetadata.pageId,
      metaComponents: exportedMetaComponents,
      metaLayout: exportedMetaLayout,
    };
  }

  // Convert elementMetadata to separate annotation/comments/references maps
  const annotation: Record<string, { type: string; customType?: string; entries: Array<{ key: string; value: string }> }> = {};
  const comments: Record<string, string> = {};
  const references: Record<string, Array<{ key: string; value: string }>> = {};

  if (elementMetadata) {
    for (const [elementId, meta] of Object.entries(elementMetadata)) {
      if (meta.annotation) {
        annotation[elementId] = {
          type: meta.annotation.type,
          customType: meta.annotation.customType,
          entries: meta.annotation.entries || [],
        };
      }
      if (meta.comments) {
        comments[elementId] = meta.comments;
      }
      if (meta.references && meta.references.length > 0) {
        references[elementId] = meta.references;
      }
    }
  }

  return {
    pages: exportedPages,
    behaviors,
    annotation,
    comments,
    references,
  };
}

// Helper to convert layout item from export format to runtime format
// Handles both old format (i, x, y, w, h) and new format (id, rgl_grid, bounds)
// Note: bounds (BoundingRect) is not used for LayoutItem - it's for export reference only
function importLayoutItem(exportedLayout: ExportableLayoutItem | LayoutItem): LayoutItem {
  // Check if it's the new format (has rgl_grid)
  if ('rgl_grid' in exportedLayout && Array.isArray(exportedLayout.rgl_grid)) {
    const [x, y, w, h] = exportedLayout.rgl_grid;
    const layout: LayoutItem = {
      i: exportedLayout.id,
      x,
      y,
      w,
      h,
      minW: 2, // Default RGL constraint
      minH: 2, // Default RGL constraint
    };
    if (exportedLayout.static) layout.static = exportedLayout.static;
    return layout;
  }

  // Old format - already in LayoutItem shape
  const oldLayout = exportedLayout as unknown as LayoutItem;
  return {
    i: oldLayout.i,
    x: oldLayout.x,
    y: oldLayout.y,
    w: oldLayout.w,
    h: oldLayout.h,
    minW: oldLayout.minW ?? 2, // Default minW
    minH: oldLayout.minH ?? 2, // Default minH
    maxW: oldLayout.maxW,
    maxH: oldLayout.maxH,
    static: oldLayout.static,
  };
}

// Convert exportable format back to runtime state
export function importSchemaToForm(
  schema: ExportableFormSchema
): { pages: FormPage[]; metadata?: FormMetadata; elementMetadata?: Record<string, ElementMetadata> } {
  const pages: FormPage[] = schema.pages.map((exportedPage) => {
    const elements: FormElement[] = [];

    for (const el of exportedPage.elements) {
      // Find component config to validate field type
      const componentConfig = draggableComponents.find(
        (c) => c.fieldType === el.fieldType
      );

      if (!componentConfig) {
        console.warn(`Unknown field type: ${el.fieldType}, skipping element ${el.id}`);
        continue;
      }

      const element: FormElement = {
        id: el.id,
        type: el.fieldType as FormElement['type'],
        label: el.label,
      };

      // Only add optional fields if defined
      if (el.placeholder !== undefined) element.placeholder = el.placeholder;
      if (el.required !== undefined) element.required = el.required;
      if (el.helpText !== undefined) element.helpText = el.helpText;
      if (el.options !== undefined) element.options = el.options;
      if (el.rows !== undefined) element.rows = el.rows;
      if (el.min !== undefined) element.min = el.min;
      if (el.max !== undefined) element.max = el.max;
      if (el.step !== undefined) element.step = el.step;
      if (el.accept !== undefined) element.accept = el.accept;
      if (el.multiple !== undefined) element.multiple = el.multiple;
      if (el.defaultValue !== undefined) element.defaultValue = el.defaultValue as FormElement['defaultValue'];
      if (el.locked !== undefined) element.locked = el.locked;
      if (el.componentLibrary !== undefined) element.componentLibrary = el.componentLibrary;

      elements.push(element);
    }

    // Convert layouts (handles both old and new format)
    const convertedLayouts = exportedPage.layout.map(importLayoutItem);

    return {
      id: exportedPage.id,
      title: exportedPage.title,
      description: exportedPage.description,
      elements,
      layout: convertedLayouts.filter((l) =>
        elements.some((el) => el.id === l.i)
      ),
    };
  });

  // Reconstruct elementMetadata from metadata.annotation/comments/references
  let elementMetadata: Record<string, ElementMetadata> | undefined;
  if (schema.metadata) {
    const { annotation, comments, references } = schema.metadata;
    const allElementIds = new Set<string>([
      ...Object.keys(annotation || {}),
      ...Object.keys(comments || {}),
      ...Object.keys(references || {}),
    ]);

    if (allElementIds.size > 0) {
      elementMetadata = {};
      for (const elementId of allElementIds) {
        const ann = annotation?.[elementId];
        elementMetadata[elementId] = {
          elementId,
          annotation: ann
            ? { type: ann.type as ElementMetadata['annotation']['type'], customType: ann.customType, entries: ann.entries }
            : { type: 'string' as const, entries: [] },
          comments: comments?.[elementId] || '',
          references: references?.[elementId] || [],
        };
      }
    }
  }

  // Note: When importing, metadata needs reconstruction if childElementIds are present
  // For now, we cast to FormMetadata - full import reconstruction would need to
  // rebuild childElements from pages.elements based on childElementIds
  return {
    pages,
    metadata: schema.metadata as unknown as FormMetadata | undefined,
    elementMetadata,
  };
}

// Export to YAML string
export function exportToYaml(
  pages: FormPage[],
  metadata?: FormMetadata,
  elementMetadata?: Record<string, ElementMetadata>,
  elementBounds?: Record<string, ElementBounds>,
  version?: string
): string {
  const schema = exportFormToSchema(pages, metadata, elementMetadata, elementBounds, version);
  return yaml.dump(schema, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
  });
}

// Export to JSON string
export function exportToJson(
  pages: FormPage[],
  metadata?: FormMetadata,
  elementMetadata?: Record<string, ElementMetadata>,
  elementBounds?: Record<string, ElementBounds>,
  version?: string
): string {
  const schema = exportFormToSchema(pages, metadata, elementMetadata, elementBounds, version);
  return JSON.stringify(schema, null, 2);
}

// Import from YAML string
export function importFromYaml(
  yamlContent: string
): { pages: FormPage[]; metadata?: FormMetadata; elementMetadata?: Record<string, ElementMetadata> } {
  const schema = yaml.load(yamlContent) as ExportableFormSchema;
  return importSchemaToForm(schema);
}

// Import from JSON string
export function importFromJson(
  jsonContent: string
): { pages: FormPage[]; metadata?: FormMetadata; elementMetadata?: Record<string, ElementMetadata> } {
  const schema = JSON.parse(jsonContent) as ExportableFormSchema;
  return importSchemaToForm(schema);
}

// Detect format from content
export function detectFormat(content: string): 'yaml' | 'json' | 'unknown' {
  const trimmed = content.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'json';
  }
  // YAML typically starts with version: or ---
  if (trimmed.startsWith('version:') || trimmed.startsWith('---')) {
    return 'yaml';
  }
  return 'unknown';
}

// Auto-detect and import
export function importFromContent(
  content: string
): { pages: FormPage[]; metadata?: FormMetadata; elementMetadata?: Record<string, ElementMetadata> } {
  const format = detectFormat(content);
  if (format === 'json') {
    return importFromJson(content);
  }
  // Default to YAML for unknown or yaml
  return importFromYaml(content);
}

// Download helper
export function downloadAsFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
