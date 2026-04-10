import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseDragData,
  createNewElementDragData,
  createExistingElementDragData,
  createMetaDragData,
  isExistingElementDrag,
  isNewElementDrag,
  isMetaDrag,
  DragDataSchema,
  NewElementDragDataSchema,
  ExistingElementDragDataSchema,
  MetaComponentDragDataSchema,
} from './drag-drop';
import { createMockDragEvent } from '../test/setup';

describe('Drag-Drop Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // SCHEMA VALIDATION TESTS
  // ==========================================================================
  describe('Zod Schemas', () => {
    describe('NewElementDragDataSchema', () => {
      it('validates a valid new element drag data', () => {
        const data = { type: 'Text', isMeta: false, isExisting: false };
        const result = NewElementDragDataSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it('validates new element without isExisting field', () => {
        const data = { type: 'Text', isMeta: false };
        const result = NewElementDragDataSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it('rejects if type is empty', () => {
        const data = { type: '', isMeta: false };
        const result = NewElementDragDataSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it('rejects if isMeta is true', () => {
        const data = { type: 'Text', isMeta: true };
        const result = NewElementDragDataSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    describe('ExistingElementDragDataSchema', () => {
      it('validates a valid existing element drag data', () => {
        const data = {
          type: 'Text',
          isMeta: false,
          isExisting: true,
          elementId: 'field-123',
          fromContainerId: null,
        };
        const result = ExistingElementDragDataSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it('validates with a container ID', () => {
        const data = {
          type: 'Text',
          isMeta: false,
          isExisting: true,
          elementId: 'nested-456',
          fromContainerId: 'meta-123',
        };
        const result = ExistingElementDragDataSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it('rejects if elementId is missing', () => {
        const data = {
          type: 'Text',
          isMeta: false,
          isExisting: true,
          fromContainerId: null,
        };
        const result = ExistingElementDragDataSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it('rejects if isExisting is false', () => {
        const data = {
          type: 'Text',
          isMeta: false,
          isExisting: false,
          elementId: 'field-123',
          fromContainerId: null,
        };
        const result = ExistingElementDragDataSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    describe('MetaComponentDragDataSchema', () => {
      it('validates a valid meta-component drag data', () => {
        const data = { type: 'Grouping', isMeta: true };
        const result = MetaComponentDragDataSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it('rejects if isMeta is false', () => {
        const data = { type: 'Grouping', isMeta: false };
        const result = MetaComponentDragDataSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it('rejects if type is empty', () => {
        const data = { type: '', isMeta: true };
        const result = MetaComponentDragDataSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    describe('DragDataSchema (base)', () => {
      it('validates any valid drag data type', () => {
        const newElement = { type: 'Text', isMeta: false };
        const existingElement = { type: 'Text', isMeta: false, isExisting: true, elementId: 'x', fromContainerId: null };
        const metaComponent = { type: 'Grouping', isMeta: true };

        expect(DragDataSchema.safeParse(newElement).success).toBe(true);
        expect(DragDataSchema.safeParse(existingElement).success).toBe(true);
        expect(DragDataSchema.safeParse(metaComponent).success).toBe(true);
      });
    });
  });

  // ==========================================================================
  // DRAG DATA CREATION TESTS
  // ==========================================================================
  describe('Drag Data Creation', () => {
    describe('createNewElementDragData', () => {
      it('creates valid JSON for new element', () => {
        const result = createNewElementDragData('Multiple Selection');
        const parsed = JSON.parse(result);

        expect(parsed).toEqual({
          type: 'Multiple Selection',
          isMeta: false,
          isExisting: false,
        });
      });

      it('handles all component types', () => {
        const types = ['Text', 'Number', 'Checkbox', 'Dropdown', 'Radio Group', 'Date'];

        types.forEach((type) => {
          const result = createNewElementDragData(type);
          const parsed = JSON.parse(result);
          expect(parsed.type).toBe(type);
          expect(parsed.isMeta).toBe(false);
        });
      });
    });

    describe('createExistingElementDragData', () => {
      it('creates valid JSON for element from root canvas', () => {
        const result = createExistingElementDragData('Text', 'field-123', null);
        const parsed = JSON.parse(result);

        expect(parsed).toEqual({
          type: 'Text',
          isMeta: false,
          isExisting: true,
          elementId: 'field-123',
          fromContainerId: null,
        });
      });

      it('creates valid JSON for element from container', () => {
        const result = createExistingElementDragData('Checkbox', 'nested-456', 'meta-789');
        const parsed = JSON.parse(result);

        expect(parsed).toEqual({
          type: 'Checkbox',
          isMeta: false,
          isExisting: true,
          elementId: 'nested-456',
          fromContainerId: 'meta-789',
        });
      });
    });

    describe('createMetaDragData', () => {
      it('creates valid JSON for meta-component', () => {
        const result = createMetaDragData('Grouping');
        const parsed = JSON.parse(result);

        expect(parsed).toEqual({
          type: 'Grouping',
          isMeta: true,
        });
      });

      it('handles Section type', () => {
        const result = createMetaDragData('Section');
        const parsed = JSON.parse(result);

        expect(parsed.type).toBe('Section');
        expect(parsed.isMeta).toBe(true);
      });
    });
  });

  // ==========================================================================
  // TYPE GUARD TESTS
  // ==========================================================================
  describe('Type Guards', () => {
    describe('isExistingElementDrag', () => {
      it('returns true for existing element drag', () => {
        const data = {
          type: 'Text',
          isMeta: false,
          isExisting: true,
          elementId: 'field-123',
          fromContainerId: null,
        };
        expect(isExistingElementDrag(data)).toBe(true);
      });

      it('returns false for new element drag', () => {
        const data = { type: 'Text', isMeta: false, isExisting: false };
        expect(isExistingElementDrag(data)).toBe(false);
      });

      it('returns false for meta drag', () => {
        const data = { type: 'Grouping', isMeta: true };
        expect(isExistingElementDrag(data)).toBe(false);
      });

      it('returns false if elementId is missing', () => {
        const data = { type: 'Text', isMeta: false, isExisting: true };
        expect(isExistingElementDrag(data)).toBe(false);
      });
    });

    describe('isNewElementDrag', () => {
      it('returns true for new element (isExisting: false)', () => {
        const data = { type: 'Text', isMeta: false, isExisting: false };
        expect(isNewElementDrag(data)).toBe(true);
      });

      it('returns true for new element (isExisting undefined)', () => {
        const data = { type: 'Text', isMeta: false };
        expect(isNewElementDrag(data)).toBe(true);
      });

      it('returns false for existing element', () => {
        const data = { type: 'Text', isMeta: false, isExisting: true, elementId: 'x', fromContainerId: null };
        expect(isNewElementDrag(data)).toBe(false);
      });

      it('returns false for meta drag', () => {
        const data = { type: 'Grouping', isMeta: true };
        expect(isNewElementDrag(data)).toBe(false);
      });
    });

    describe('isMetaDrag', () => {
      it('returns true for meta-component drag', () => {
        const data = { type: 'Grouping', isMeta: true };
        expect(isMetaDrag(data)).toBe(true);
      });

      it('returns false for new element drag', () => {
        const data = { type: 'Text', isMeta: false };
        expect(isMetaDrag(data)).toBe(false);
      });

      it('returns false for existing element drag', () => {
        const data = { type: 'Text', isMeta: false, isExisting: true, elementId: 'x', fromContainerId: null };
        expect(isMetaDrag(data)).toBe(false);
      });
    });
  });

  // ==========================================================================
  // PARSE DRAG DATA TESTS
  // ==========================================================================
  describe('parseDragData', () => {
    it('successfully parses new element drag data', () => {
      const dragData = JSON.stringify({ type: 'Text', isMeta: false, isExisting: false });
      const event = createMockDragEvent({ 'text/plain': dragData });

      const result = parseDragData(event);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ type: 'Text', isMeta: false, isExisting: false });
      expect(result.error).toBeNull();
    });

    it('successfully parses existing element drag data', () => {
      const dragData = JSON.stringify({
        type: 'Checkbox',
        isMeta: false,
        isExisting: true,
        elementId: 'field-123',
        fromContainerId: null,
      });
      const event = createMockDragEvent({ 'text/plain': dragData });

      const result = parseDragData(event);

      expect(result.success).toBe(true);
      expect(result.data?.elementId).toBe('field-123');
      expect(result.data?.fromContainerId).toBeNull();
    });

    it('successfully parses meta-component drag data', () => {
      const dragData = JSON.stringify({ type: 'Grouping', isMeta: true });
      const event = createMockDragEvent({ 'text/plain': dragData });

      const result = parseDragData(event);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ type: 'Grouping', isMeta: true });
    });

    it('returns error for empty dataTransfer', () => {
      const event = createMockDragEvent({});

      const result = parseDragData(event);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toContain('No drag data found');
    });

    it('returns error for invalid JSON', () => {
      const event = createMockDragEvent({ 'text/plain': 'not-valid-json' });

      const result = parseDragData(event);

      expect(result.success).toBe(false);
      expect(result.error).toContain('JSON parse error');
    });

    it('returns error for invalid schema', () => {
      const dragData = JSON.stringify({ wrongField: 'value' });
      const event = createMockDragEvent({ 'text/plain': dragData });

      const result = parseDragData(event);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
    });

    it('preserves raw data in result', () => {
      const dragData = JSON.stringify({ type: 'Text', isMeta: false });
      const event = createMockDragEvent({ 'text/plain': dragData });

      const result = parseDragData(event);

      expect(result.rawData).toBe(dragData);
    });
  });

  // ==========================================================================
  // END-TO-END DRAG DATA FLOW TESTS
  // ==========================================================================
  describe('End-to-End Drag Data Flow', () => {
    it('sidebar new element -> canvas drop flow', () => {
      // 1. Create drag data (simulating DraggableFormElement.handleDragStart)
      const dragDataString = createNewElementDragData('Multiple Selection');

      // 2. Parse on drop (simulating Canvas.handleExternalDrop)
      const event = createMockDragEvent({ 'text/plain': dragDataString });
      const parseResult = parseDragData(event);

      // 3. Verify result
      expect(parseResult.success).toBe(true);
      expect(isNewElementDrag(parseResult.data!)).toBe(true);
      expect(isMetaDrag(parseResult.data!)).toBe(false);
      expect(parseResult.data!.type).toBe('Multiple Selection');
    });

    it('sidebar meta-component -> canvas drop flow', () => {
      // 1. Create drag data (simulating DraggableMetaElement)
      const dragDataString = createMetaDragData('Grouping');

      // 2. Parse on drop
      const event = createMockDragEvent({ 'text/plain': dragDataString });
      const parseResult = parseDragData(event);

      // 3. Verify result
      expect(parseResult.success).toBe(true);
      expect(isMetaDrag(parseResult.data!)).toBe(true);
      expect(isNewElementDrag(parseResult.data!)).toBe(false);
      expect(parseResult.data!.type).toBe('Grouping');
    });

    it('canvas element -> container move flow', () => {
      // 1. Create drag data (simulating drag from canvas element)
      const dragDataString = createExistingElementDragData('Text', 'field-123', null);

      // 2. Parse on container drop
      const event = createMockDragEvent({ 'text/plain': dragDataString });
      const parseResult = parseDragData(event);

      // 3. Verify result
      expect(parseResult.success).toBe(true);
      expect(isExistingElementDrag(parseResult.data!)).toBe(true);
      expect(parseResult.data!.elementId).toBe('field-123');
      expect(parseResult.data!.fromContainerId).toBeNull();
    });

    it('container element -> different container move flow', () => {
      // 1. Create drag data (simulating drag from nested element)
      const dragDataString = createExistingElementDragData('Checkbox', 'nested-456', 'meta-container-1');

      // 2. Parse on different container drop
      const event = createMockDragEvent({ 'text/plain': dragDataString });
      const parseResult = parseDragData(event);

      // 3. Verify result
      expect(parseResult.success).toBe(true);
      expect(isExistingElementDrag(parseResult.data!)).toBe(true);
      expect(parseResult.data!.elementId).toBe('nested-456');
      expect(parseResult.data!.fromContainerId).toBe('meta-container-1');
    });

    it('container element -> canvas (root) move flow', () => {
      // Element being moved from container back to canvas root
      const dragDataString = createExistingElementDragData('Radio Group', 'nested-789', 'meta-group-2');

      const event = createMockDragEvent({ 'text/plain': dragDataString });
      const parseResult = parseDragData(event);

      expect(parseResult.success).toBe(true);
      expect(isExistingElementDrag(parseResult.data!)).toBe(true);
      // The toContainerId (null for root) would be determined by the drop handler
      expect(parseResult.data!.fromContainerId).toBe('meta-group-2');
    });
  });

  // ==========================================================================
  // COORDINATE-BASED CONTAINER DETECTION LOGIC TESTS
  // ==========================================================================
  describe('Coordinate-Based Container Detection', () => {
    // These tests validate the logic used in Canvas.handleExternalDrop
    // for detecting if drop coordinates are within a container's bounds

    interface ContainerBounds {
      id: string;
      left: number;
      right: number;
      top: number;
      bottom: number;
    }

    function isWithinContainer(dropX: number, dropY: number, bounds: ContainerBounds): boolean {
      return dropX >= bounds.left && dropX <= bounds.right && dropY >= bounds.top && dropY <= bounds.bottom;
    }

    function findContainerAtCoordinates(
      dropX: number,
      dropY: number,
      containers: ContainerBounds[]
    ): string | null {
      for (const container of containers) {
        if (isWithinContainer(dropX, dropY, container)) {
          return container.id;
        }
      }
      return null;
    }

    it('detects drop within container bounds', () => {
      const container: ContainerBounds = {
        id: 'meta-123',
        left: 100,
        right: 400,
        top: 200,
        bottom: 400,
      };

      // Center of container
      expect(isWithinContainer(250, 300, container)).toBe(true);

      // Top-left corner
      expect(isWithinContainer(100, 200, container)).toBe(true);

      // Bottom-right corner
      expect(isWithinContainer(400, 400, container)).toBe(true);
    });

    it('detects drop outside container bounds', () => {
      const container: ContainerBounds = {
        id: 'meta-123',
        left: 100,
        right: 400,
        top: 200,
        bottom: 400,
      };

      // Above container
      expect(isWithinContainer(250, 150, container)).toBe(false);

      // Below container
      expect(isWithinContainer(250, 450, container)).toBe(false);

      // Left of container
      expect(isWithinContainer(50, 300, container)).toBe(false);

      // Right of container
      expect(isWithinContainer(450, 300, container)).toBe(false);
    });

    it('finds correct container with multiple containers', () => {
      const containers: ContainerBounds[] = [
        { id: 'meta-1', left: 0, right: 200, top: 0, bottom: 200 },
        { id: 'meta-2', left: 250, right: 500, top: 0, bottom: 200 },
        { id: 'meta-3', left: 0, right: 200, top: 250, bottom: 450 },
      ];

      // Drop in meta-1
      expect(findContainerAtCoordinates(100, 100, containers)).toBe('meta-1');

      // Drop in meta-2
      expect(findContainerAtCoordinates(375, 100, containers)).toBe('meta-2');

      // Drop in meta-3
      expect(findContainerAtCoordinates(100, 350, containers)).toBe('meta-3');

      // Drop in empty area (no container)
      expect(findContainerAtCoordinates(350, 350, containers)).toBeNull();
    });

    it('handles overlapping containers (first match wins)', () => {
      const containers: ContainerBounds[] = [
        { id: 'meta-outer', left: 0, right: 400, top: 0, bottom: 400 },
        { id: 'meta-inner', left: 100, right: 300, top: 100, bottom: 300 },
      ];

      // Drop in overlap area - first container wins (outer)
      expect(findContainerAtCoordinates(200, 200, containers)).toBe('meta-outer');

      // To properly handle nesting, we'd need z-index or DOM order
      // This test documents current behavior
    });
  });

  // ==========================================================================
  // EDGE CASES & ERROR HANDLING
  // ==========================================================================
  describe('Edge Cases', () => {
    it('handles component types with spaces', () => {
      const types = ['Multiple Selection', 'Radio Group', 'Single Line Text'];

      types.forEach((type) => {
        const dragData = createNewElementDragData(type);
        const event = createMockDragEvent({ 'text/plain': dragData });
        const result = parseDragData(event);

        expect(result.success).toBe(true);
        expect(result.data?.type).toBe(type);
      });
    });

    it('handles special characters in element IDs', () => {
      const elementId = 'field-123_abc-456';
      const dragData = createExistingElementDragData('Text', elementId, null);
      const event = createMockDragEvent({ 'text/plain': dragData });
      const result = parseDragData(event);

      expect(result.success).toBe(true);
      expect(result.data?.elementId).toBe(elementId);
    });

    it('handles container IDs with timestamps', () => {
      const containerId = 'meta-1764728723153';
      const dragData = createExistingElementDragData('Text', 'nested-123', containerId);
      const event = createMockDragEvent({ 'text/plain': dragData });
      const result = parseDragData(event);

      expect(result.success).toBe(true);
      expect(result.data?.fromContainerId).toBe(containerId);
    });

    it('handles drag data with extra fields (forward compatibility)', () => {
      const dragData = JSON.stringify({
        type: 'Text',
        isMeta: false,
        futureField: 'should be ignored',
        anotherField: 123,
      });
      const event = createMockDragEvent({ 'text/plain': dragData });
      const result = parseDragData(event);

      // Should still parse successfully (Zod strips unknown fields by default)
      expect(result.success).toBe(true);
      expect(result.data?.type).toBe('Text');
    });
  });
});
