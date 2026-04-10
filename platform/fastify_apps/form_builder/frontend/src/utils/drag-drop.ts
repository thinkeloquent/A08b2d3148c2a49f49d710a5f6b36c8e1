import { z } from 'zod';

// =============================================================================
// DRAG DATA SCHEMAS (Zod Validation)
// =============================================================================

/**
 * Schema for new element drag from sidebar
 */
export const NewElementDragDataSchema = z.object({
  type: z.string().min(1, 'Element type is required'),
  isMeta: z.literal(false),
  isExisting: z.literal(false).optional(),
});

/**
 * Schema for existing element drag from canvas
 */
export const ExistingElementDragDataSchema = z.object({
  type: z.string().min(1, 'Element type is required'),
  isMeta: z.literal(false),
  isExisting: z.literal(true),
  elementId: z.string().min(1, 'Element ID is required'),
  fromContainerId: z.string().nullable(),
});

/**
 * Schema for meta-component drag from sidebar
 */
export const MetaComponentDragDataSchema = z.object({
  type: z.string().min(1, 'Meta type is required'),
  isMeta: z.literal(true),
});

/**
 * Base schema for all drag data - more permissive for validation
 */
export const DragDataSchema = z.object({
  type: z.string(),
  isMeta: z.boolean(),
  isExisting: z.boolean().optional(),
  elementId: z.string().optional(),
  fromContainerId: z.string().nullable().optional(),
});

// Type exports
export type NewElementDragData = z.infer<typeof NewElementDragDataSchema>;
export type ExistingElementDragData = z.infer<typeof ExistingElementDragDataSchema>;
export type MetaComponentDragData = z.infer<typeof MetaComponentDragDataSchema>;
export type DragData = z.infer<typeof DragDataSchema>;

// =============================================================================
// LOGGING UTILITIES
// =============================================================================

const LOG_PREFIX = '[DragDrop]';
const LOG_STYLES = {
  info: 'color: #2196F3; font-weight: bold;',
  success: 'color: #4CAF50; font-weight: bold;',
  warn: 'color: #FF9800; font-weight: bold;',
  error: 'color: #F44336; font-weight: bold;',
  debug: 'color: #9C27B0; font-weight: bold;',
};

export const dragDropLogger = {
  info: (message: string, data?: unknown) => {
    console.log(`%c${LOG_PREFIX} [INFO] ${message}`, LOG_STYLES.info, data ?? '');
  },
  success: (message: string, data?: unknown) => {
    console.log(`%c${LOG_PREFIX} [SUCCESS] ${message}`, LOG_STYLES.success, data ?? '');
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`%c${LOG_PREFIX} [WARN] ${message}`, LOG_STYLES.warn, data ?? '');
  },
  error: (message: string, data?: unknown) => {
    console.error(`%c${LOG_PREFIX} [ERROR] ${message}`, LOG_STYLES.error, data ?? '');
  },
  debug: (message: string, data?: unknown) => {
    console.log(`%c${LOG_PREFIX} [DEBUG] ${message}`, LOG_STYLES.debug, data ?? '');
  },
  group: (label: string) => {
    console.group(`%c${LOG_PREFIX} ${label}`, 'color: #607D8B; font-weight: bold;');
  },
  groupEnd: () => {
    console.groupEnd();
  },
};

// =============================================================================
// DRAG DATA PARSING & VALIDATION
// =============================================================================

export interface ParseDragDataResult {
  success: boolean;
  data: DragData | null;
  error: string | null;
  rawData: string | null;
}

/**
 * Safely parse and validate drag data from a drag event
 */
export function parseDragData(e: React.DragEvent): ParseDragDataResult {
  const rawData = e.dataTransfer?.getData('text/plain');

  dragDropLogger.debug('Parsing drag data', { rawData, hasData: !!rawData });

  if (!rawData) {
    dragDropLogger.warn('No drag data found in dataTransfer');
    return {
      success: false,
      data: null,
      error: 'No drag data found',
      rawData: null,
    };
  }

  try {
    const parsed = JSON.parse(rawData);
    dragDropLogger.debug('JSON parsed successfully', parsed);

    // Validate with Zod
    const validation = DragDataSchema.safeParse(parsed);

    if (!validation.success) {
      const zodError = validation.error;
      // Handle both Zod v3 and v4 error formats
      let errorMessage = 'Validation failed';
      if (zodError.issues && Array.isArray(zodError.issues)) {
        errorMessage = zodError.issues
          .map((issue) => `${String(issue.path?.join?.('.') || '')}: ${issue.message || 'invalid'}`)
          .join(', ');
      }
      dragDropLogger.error('Zod validation failed', { error: zodError, parsed });
      return {
        success: false,
        data: null,
        error: `Validation failed: ${errorMessage}`,
        rawData,
      };
    }

    dragDropLogger.success('Drag data validated successfully', validation.data);
    return {
      success: true,
      data: validation.data,
      error: null,
      rawData,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown parse error';
    dragDropLogger.error('Failed to parse drag data JSON', { error: errorMessage, rawData });
    return {
      success: false,
      data: null,
      error: `JSON parse error: ${errorMessage}`,
      rawData,
    };
  }
}

// =============================================================================
// DRAG DATA CREATION
// =============================================================================

/**
 * Create drag data for a new element from sidebar
 */
export function createNewElementDragData(type: string): string {
  const data: NewElementDragData = {
    type,
    isMeta: false,
    isExisting: false,
  };
  dragDropLogger.info('Creating new element drag data', data);
  return JSON.stringify(data);
}

/**
 * Create drag data for an existing element being moved
 */
export function createExistingElementDragData(
  type: string,
  elementId: string,
  fromContainerId: string | null
): string {
  const data: ExistingElementDragData = {
    type,
    isMeta: false,
    isExisting: true,
    elementId,
    fromContainerId,
  };
  dragDropLogger.info('Creating existing element drag data', data);
  return JSON.stringify(data);
}

/**
 * Create drag data for a meta-component
 */
export function createMetaDragData(type: string): string {
  const data: MetaComponentDragData = {
    type,
    isMeta: true,
  };
  dragDropLogger.info('Creating meta component drag data', data);
  return JSON.stringify(data);
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

export function isExistingElementDrag(data: DragData): data is DragData & { isExisting: true; elementId: string; fromContainerId: string | null } {
  return !data.isMeta && data.isExisting === true && typeof data.elementId === 'string';
}

export function isNewElementDrag(data: DragData): boolean {
  return !data.isMeta && data.isExisting !== true;
}

export function isMetaDrag(data: DragData): boolean {
  return data.isMeta === true;
}

// =============================================================================
// DRAG STATE HELPERS
// =============================================================================

/**
 * Log drag start event details
 */
export function logDragStart(
  source: 'sidebar' | 'canvas' | 'container',
  elementType: string,
  elementId?: string,
  containerId?: string | null
) {
  dragDropLogger.group(`Drag Start - ${source}`);
  dragDropLogger.info('Element type', elementType);
  if (elementId) dragDropLogger.info('Element ID', elementId);
  if (containerId !== undefined) dragDropLogger.info('From container', containerId ?? 'root');
  dragDropLogger.groupEnd();
}

/**
 * Log drag over event
 */
export function logDragOver(target: 'canvas' | 'container', containerId?: string) {
  dragDropLogger.debug(`Drag over ${target}`, containerId ? { containerId } : undefined);
}

/**
 * Log drop event
 */
export function logDrop(
  target: 'canvas' | 'container',
  result: 'success' | 'rejected' | 'error',
  details?: unknown
) {
  if (result === 'success') {
    dragDropLogger.success(`Drop on ${target} successful`, details);
  } else if (result === 'rejected') {
    dragDropLogger.warn(`Drop on ${target} rejected`, details);
  } else {
    dragDropLogger.error(`Drop on ${target} failed`, details);
  }
}

/**
 * Log drag end event
 */
export function logDragEnd(completed: boolean, details?: unknown) {
  if (completed) {
    dragDropLogger.success('Drag operation completed', details);
  } else {
    dragDropLogger.warn('Drag operation cancelled/incomplete', details);
  }
}

// =============================================================================
// STATE VALIDATION & DEBUG LOGGING
// =============================================================================

/**
 * Debug flag - set to true for verbose state logging
 */
export const DEBUG_DRAG_DROP = true;

/**
 * Condensed always-on state confirmation logging
 */
export function logStateConfirmation(
  operation: 'added' | 'removed' | 'moved',
  elementId: string,
  targetInfo: {
    containerId?: string;
    fromContainer?: string | null;
    toContainer?: string | null;
    count?: number;
  }
) {
  const { containerId, fromContainer, toContainer, count } = targetInfo;
  if (operation === 'added') {
    console.log(`%c[State] Element ${elementId} added to container ${containerId} (count: ${count})`, 'color: #4CAF50; font-weight: bold;');
  } else if (operation === 'removed') {
    console.log(`%c[State] Element ${elementId} removed from container ${containerId} (count: ${count})`, 'color: #FF9800; font-weight: bold;');
  } else if (operation === 'moved') {
    console.log(`%c[State] Element ${elementId} moved from ${fromContainer ?? 'root'} to ${toContainer ?? 'root'}`, 'color: #2196F3; font-weight: bold;');
  }
}

/**
 * Verbose debug logging (only when DEBUG_DRAG_DROP is true)
 */
export function logStateDebug(message: string, data: unknown) {
  if (DEBUG_DRAG_DROP) {
    console.log(`%c[State:DEBUG] ${message}`, 'color: #9C27B0;', data);
  }
}

/**
 * Validation assertion with error logging
 * Returns true if element exists in container, false otherwise
 */
export function assertContainerHasElement(
  containerId: string,
  elementId: string,
  childElements: { id: string }[]
): boolean {
  const hasElement = childElements.some((e) => e.id === elementId);
  if (!hasElement) {
    console.error(
      `%c[State:ASSERT FAILED] Container ${containerId} does NOT have element ${elementId}`,
      'color: #F44336; font-weight: bold;',
      {
        containerId,
        elementId,
        actualChildren: childElements.map((e) => e.id),
      }
    );
  } else if (DEBUG_DRAG_DROP) {
    console.log(
      `%c[State:ASSERT OK] Container ${containerId} has element ${elementId}`,
      'color: #4CAF50;'
    );
  }
  return hasElement;
}

/**
 * Log container lookup result for debugging
 */
export function logContainerLookup(
  containerId: string | null,
  metaComponentIds: string[],
  found: boolean
) {
  if (!found) {
    console.error(
      `%c[State:ERROR] Container ${containerId} NOT FOUND in metaComponents`,
      'color: #F44336; font-weight: bold;',
      {
        searchedId: containerId,
        availableIds: metaComponentIds,
        hint: 'metaComponents may be stale - check useCallback dependencies',
      }
    );
  } else if (DEBUG_DRAG_DROP) {
    console.log(
      `%c[State:DEBUG] Container lookup successful`,
      'color: #9C27B0;',
      { containerId, metaComponentsCount: metaComponentIds.length }
    );
  }
}
