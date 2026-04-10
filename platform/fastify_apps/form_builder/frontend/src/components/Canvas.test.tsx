import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  parseDragData,
  createNewElementDragData,
  createExistingElementDragData,
  createMetaDragData,
  isNewElementDrag,
  isMetaDrag,
  isExistingElementDrag,
} from '../utils/drag-drop';
import { createMockDragEvent } from '../test/setup';
import type {
  FormElement,
  LayoutItem,
  MetaComponent,
  MetaComponentLayoutItem,
  ContainerMetaComponent,
  ContainerChildElement,
  ContainerChildLayoutItem,
} from '../types';

// =============================================================================
// CANVAS DROP HANDLER LOGIC TESTS
// =============================================================================
// These tests validate the drop handling logic without rendering the full Canvas
// component, which has complex dependencies (react-grid-layout, etc.)

describe('Canvas Drop Handler Logic', () => {
  // Mock handlers
  let mockOnAddElement: ReturnType<typeof vi.fn>;
  let mockOnAddMetaComponent: ReturnType<typeof vi.fn>;
  let mockOnAddElementToContainer: ReturnType<typeof vi.fn>;
  let mockOnMoveElementToContainer: ReturnType<typeof vi.fn>;
  let mockOnDragEnd: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAddElement = vi.fn();
    mockOnAddMetaComponent = vi.fn();
    mockOnAddElementToContainer = vi.fn();
    mockOnMoveElementToContainer = vi.fn();
    mockOnDragEnd = vi.fn();
  });

  // Helper to simulate Canvas.handleExternalDrop logic
  function simulateCanvasDropHandler(
    dropX: number,
    dropY: number,
    dragDataString: string,
    containers: Array<{ id: string; bounds: DOMRect }>,
    metaComponents: MetaComponent[],
    options: {
      onAddElement: typeof mockOnAddElement;
      onAddMetaComponent: typeof mockOnAddMetaComponent;
      onAddElementToContainer: typeof mockOnAddElementToContainer;
      onMoveElementToContainer: typeof mockOnMoveElementToContainer;
      onDragEnd: typeof mockOnDragEnd;
    }
  ): { handled: boolean; target: 'canvas' | 'container' | null; containerId?: string } {
    const event = createMockDragEvent(
      { 'text/plain': dragDataString },
      { clientX: dropX, clientY: dropY }
    );

    const parseResult = parseDragData(event);
    if (!parseResult.success || !parseResult.data) {
      options.onDragEnd();
      return { handled: false, target: null };
    }

    const data = parseResult.data;

    // Check if drop coordinates are within any container's bounds
    for (const container of containers) {
      const { bounds } = container;
      const isWithinBounds =
        dropX >= bounds.left &&
        dropX <= bounds.right &&
        dropY >= bounds.top &&
        dropY <= bounds.bottom;

      if (isWithinBounds) {
        const containerId = container.id;

        // Don't allow meta-components inside containers
        if (isMetaDrag(data)) {
          options.onDragEnd();
          return { handled: false, target: 'container', containerId };
        }

        // Handle new element drop into container
        if (isNewElementDrag(data)) {
          const containerMeta = metaComponents.find((m) => m.id === containerId);
          if (containerMeta && (containerMeta.type === 'grouping' || containerMeta.type === 'section')) {
            const typedMeta = containerMeta as unknown as ContainerMetaComponent;

            const newElement: ContainerChildElement = {
              id: `nested-${Date.now()}`,
              type: 'text', // simplified
              label: 'Test Element',
            };

            const newLayout: ContainerChildLayoutItem = {
              i: newElement.id,
              x: 0,
              y: 0,
              w: 3,
              h: 4,
              minH: 4,
              minW: 1,
            };

            options.onAddElementToContainer(containerId, newElement, newLayout);
            options.onDragEnd();
            return { handled: true, target: 'container', containerId };
          }
        }

        // Handle existing element move to container
        if (isExistingElementDrag(data)) {
          options.onMoveElementToContainer(
            data.elementId,
            data.fromContainerId ?? null,
            containerId
          );
          options.onDragEnd();
          return { handled: true, target: 'container', containerId };
        }

        options.onDragEnd();
        return { handled: false, target: 'container', containerId };
      }
    }

    // No container match - handle at canvas level
    if (isMetaDrag(data)) {
      const newMeta: MetaComponent = {
        id: `meta-${Date.now()}`,
        type: data.type as 'grouping' | 'section',
        name: 'New Component',
        pageId: 'page-1',
      } as MetaComponent;

      const newLayout: MetaComponentLayoutItem = {
        id: newMeta.id,
        x: 0,
        y: 0,
        w: 6,
        h: 4,
      };

      options.onAddMetaComponent(newMeta, newLayout);
      options.onDragEnd();
      return { handled: true, target: 'canvas' };
    }

    if (isNewElementDrag(data)) {
      const newElement: FormElement = {
        id: `field-${Date.now()}`,
        type: 'text',
        label: 'Test Element',
      };

      const newLayout: LayoutItem = {
        i: newElement.id,
        x: 0,
        y: 0,
        w: 3,
        h: 4,
        minH: 4,
        minW: 1,
      };

      options.onAddElement(newElement, newLayout);
      options.onDragEnd();
      return { handled: true, target: 'canvas' };
    }

    options.onDragEnd();
    return { handled: false, target: null };
  }

  // ==========================================================================
  // NEW ELEMENT DROP TESTS
  // ==========================================================================
  describe('New Element Drop', () => {
    it('adds new element to canvas when dropped outside containers', () => {
      const dragData = createNewElementDragData('Text');
      const containers: Array<{ id: string; bounds: DOMRect }> = [];
      const metaComponents: MetaComponent[] = [];

      const result = simulateCanvasDropHandler(100, 100, dragData, containers, metaComponents, {
        onAddElement: mockOnAddElement,
        onAddMetaComponent: mockOnAddMetaComponent,
        onAddElementToContainer: mockOnAddElementToContainer,
        onMoveElementToContainer: mockOnMoveElementToContainer,
        onDragEnd: mockOnDragEnd,
      });

      expect(result.handled).toBe(true);
      expect(result.target).toBe('canvas');
      expect(mockOnAddElement).toHaveBeenCalledTimes(1);
      expect(mockOnAddElementToContainer).not.toHaveBeenCalled();
      expect(mockOnDragEnd).toHaveBeenCalledTimes(1);
    });

    it('adds new element to container when dropped within container bounds', () => {
      const dragData = createNewElementDragData('Checkbox');
      const containers = [
        {
          id: 'meta-123',
          bounds: { left: 200, right: 500, top: 100, bottom: 400 } as DOMRect,
        },
      ];
      const metaComponents: MetaComponent[] = [
        {
          id: 'meta-123',
          type: 'grouping',
          name: 'Test Group',
          pageId: 'page-1',
          nestedGridConfig: { cols: 6, rowHeight: 30, margin: [8, 8] },
          childElements: [],
          childLayout: [],
        } as unknown as MetaComponent,
      ];

      // Drop at center of container
      const result = simulateCanvasDropHandler(350, 250, dragData, containers, metaComponents, {
        onAddElement: mockOnAddElement,
        onAddMetaComponent: mockOnAddMetaComponent,
        onAddElementToContainer: mockOnAddElementToContainer,
        onMoveElementToContainer: mockOnMoveElementToContainer,
        onDragEnd: mockOnDragEnd,
      });

      expect(result.handled).toBe(true);
      expect(result.target).toBe('container');
      expect(result.containerId).toBe('meta-123');
      expect(mockOnAddElementToContainer).toHaveBeenCalledTimes(1);
      expect(mockOnAddElement).not.toHaveBeenCalled();
    });

    it('correctly routes to canvas when drop coordinates are just outside container', () => {
      const dragData = createNewElementDragData('Number');
      const containers = [
        {
          id: 'meta-123',
          bounds: { left: 200, right: 500, top: 100, bottom: 400 } as DOMRect,
        },
      ];
      const metaComponents: MetaComponent[] = [];

      // Drop just above container
      const result = simulateCanvasDropHandler(350, 99, dragData, containers, metaComponents, {
        onAddElement: mockOnAddElement,
        onAddMetaComponent: mockOnAddMetaComponent,
        onAddElementToContainer: mockOnAddElementToContainer,
        onMoveElementToContainer: mockOnMoveElementToContainer,
        onDragEnd: mockOnDragEnd,
      });

      expect(result.target).toBe('canvas');
      expect(mockOnAddElement).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================================================
  // META-COMPONENT DROP TESTS
  // ==========================================================================
  describe('Meta-Component Drop', () => {
    it('adds meta-component to canvas', () => {
      const dragData = createMetaDragData('Grouping');
      const containers: Array<{ id: string; bounds: DOMRect }> = [];
      const metaComponents: MetaComponent[] = [];

      const result = simulateCanvasDropHandler(100, 100, dragData, containers, metaComponents, {
        onAddElement: mockOnAddElement,
        onAddMetaComponent: mockOnAddMetaComponent,
        onAddElementToContainer: mockOnAddElementToContainer,
        onMoveElementToContainer: mockOnMoveElementToContainer,
        onDragEnd: mockOnDragEnd,
      });

      expect(result.handled).toBe(true);
      expect(result.target).toBe('canvas');
      expect(mockOnAddMetaComponent).toHaveBeenCalledTimes(1);
    });

    it('rejects meta-component drop inside existing container', () => {
      const dragData = createMetaDragData('Section');
      const containers = [
        {
          id: 'meta-123',
          bounds: { left: 200, right: 500, top: 100, bottom: 400 } as DOMRect,
        },
      ];
      const metaComponents: MetaComponent[] = [];

      // Drop inside container bounds
      const result = simulateCanvasDropHandler(350, 250, dragData, containers, metaComponents, {
        onAddElement: mockOnAddElement,
        onAddMetaComponent: mockOnAddMetaComponent,
        onAddElementToContainer: mockOnAddElementToContainer,
        onMoveElementToContainer: mockOnMoveElementToContainer,
        onDragEnd: mockOnDragEnd,
      });

      expect(result.handled).toBe(false);
      expect(result.target).toBe('container');
      expect(mockOnAddMetaComponent).not.toHaveBeenCalled();
      expect(mockOnDragEnd).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================================================
  // EXISTING ELEMENT MOVE TESTS
  // ==========================================================================
  describe('Existing Element Move', () => {
    it('moves element from canvas to container', () => {
      const dragData = createExistingElementDragData('Text', 'field-123', null);
      const containers = [
        {
          id: 'meta-456',
          bounds: { left: 200, right: 500, top: 100, bottom: 400 } as DOMRect,
        },
      ];
      const metaComponents: MetaComponent[] = [];

      const result = simulateCanvasDropHandler(350, 250, dragData, containers, metaComponents, {
        onAddElement: mockOnAddElement,
        onAddMetaComponent: mockOnAddMetaComponent,
        onAddElementToContainer: mockOnAddElementToContainer,
        onMoveElementToContainer: mockOnMoveElementToContainer,
        onDragEnd: mockOnDragEnd,
      });

      expect(result.handled).toBe(true);
      expect(result.target).toBe('container');
      expect(mockOnMoveElementToContainer).toHaveBeenCalledWith('field-123', null, 'meta-456');
    });

    it('moves element from one container to another', () => {
      const dragData = createExistingElementDragData('Checkbox', 'nested-789', 'meta-111');
      const containers = [
        {
          id: 'meta-222',
          bounds: { left: 200, right: 500, top: 100, bottom: 400 } as DOMRect,
        },
      ];
      const metaComponents: MetaComponent[] = [];

      const result = simulateCanvasDropHandler(350, 250, dragData, containers, metaComponents, {
        onAddElement: mockOnAddElement,
        onAddMetaComponent: mockOnAddMetaComponent,
        onAddElementToContainer: mockOnAddElementToContainer,
        onMoveElementToContainer: mockOnMoveElementToContainer,
        onDragEnd: mockOnDragEnd,
      });

      expect(result.handled).toBe(true);
      expect(mockOnMoveElementToContainer).toHaveBeenCalledWith('nested-789', 'meta-111', 'meta-222');
    });
  });

  // ==========================================================================
  // MULTIPLE CONTAINER ROUTING TESTS
  // ==========================================================================
  describe('Multiple Container Routing', () => {
    it('routes to correct container when multiple containers exist', () => {
      const dragData = createNewElementDragData('Text');
      const containers = [
        {
          id: 'meta-top-left',
          bounds: { left: 0, right: 200, top: 0, bottom: 200 } as DOMRect,
        },
        {
          id: 'meta-top-right',
          bounds: { left: 250, right: 500, top: 0, bottom: 200 } as DOMRect,
        },
        {
          id: 'meta-bottom',
          bounds: { left: 0, right: 500, top: 250, bottom: 450 } as DOMRect,
        },
      ];
      const metaComponents: MetaComponent[] = [
        { id: 'meta-top-left', type: 'grouping', name: 'TL', pageId: 'p1' } as MetaComponent,
        { id: 'meta-top-right', type: 'grouping', name: 'TR', pageId: 'p1' } as MetaComponent,
        { id: 'meta-bottom', type: 'grouping', name: 'B', pageId: 'p1' } as MetaComponent,
      ].map((m) => ({
        ...m,
        nestedGridConfig: { cols: 6, rowHeight: 30, margin: [8, 8] },
        childElements: [],
        childLayout: [],
      })) as MetaComponent[];

      // Test drop in top-left container
      let result = simulateCanvasDropHandler(100, 100, dragData, containers, metaComponents, {
        onAddElement: mockOnAddElement,
        onAddMetaComponent: mockOnAddMetaComponent,
        onAddElementToContainer: mockOnAddElementToContainer,
        onMoveElementToContainer: mockOnMoveElementToContainer,
        onDragEnd: mockOnDragEnd,
      });
      expect(result.containerId).toBe('meta-top-left');

      // Reset mocks
      vi.clearAllMocks();

      // Test drop in top-right container
      result = simulateCanvasDropHandler(375, 100, dragData, containers, metaComponents, {
        onAddElement: mockOnAddElement,
        onAddMetaComponent: mockOnAddMetaComponent,
        onAddElementToContainer: mockOnAddElementToContainer,
        onMoveElementToContainer: mockOnMoveElementToContainer,
        onDragEnd: mockOnDragEnd,
      });
      expect(result.containerId).toBe('meta-top-right');

      // Reset mocks
      vi.clearAllMocks();

      // Test drop in bottom container
      result = simulateCanvasDropHandler(250, 350, dragData, containers, metaComponents, {
        onAddElement: mockOnAddElement,
        onAddMetaComponent: mockOnAddMetaComponent,
        onAddElementToContainer: mockOnAddElementToContainer,
        onMoveElementToContainer: mockOnMoveElementToContainer,
        onDragEnd: mockOnDragEnd,
      });
      expect(result.containerId).toBe('meta-bottom');

      // Reset mocks
      vi.clearAllMocks();

      // Test drop in empty area (between containers)
      result = simulateCanvasDropHandler(225, 100, dragData, containers, metaComponents, {
        onAddElement: mockOnAddElement,
        onAddMetaComponent: mockOnAddMetaComponent,
        onAddElementToContainer: mockOnAddElementToContainer,
        onMoveElementToContainer: mockOnMoveElementToContainer,
        onDragEnd: mockOnDragEnd,
      });
      expect(result.target).toBe('canvas');
      expect(mockOnAddElement).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // ERROR HANDLING TESTS
  // ==========================================================================
  describe('Error Handling', () => {
    it('calls onDragEnd even when drop fails', () => {
      const invalidDragData = 'not-valid-json';
      const containers: Array<{ id: string; bounds: DOMRect }> = [];
      const metaComponents: MetaComponent[] = [];

      const result = simulateCanvasDropHandler(100, 100, invalidDragData, containers, metaComponents, {
        onAddElement: mockOnAddElement,
        onAddMetaComponent: mockOnAddMetaComponent,
        onAddElementToContainer: mockOnAddElementToContainer,
        onMoveElementToContainer: mockOnMoveElementToContainer,
        onDragEnd: mockOnDragEnd,
      });

      expect(result.handled).toBe(false);
      expect(mockOnDragEnd).toHaveBeenCalledTimes(1);
    });

    it('handles empty drag data gracefully', () => {
      const emptyDragData = '';
      const event = createMockDragEvent({ 'text/plain': emptyDragData });

      const parseResult = parseDragData(event);
      expect(parseResult.success).toBe(false);
    });
  });
});

// =============================================================================
// NESTED GRID CONTAINER DROP HANDLER LOGIC TESTS
// =============================================================================
describe('NestedGridContainer Drop Handler Logic', () => {
  let mockOnAddChildElement: ReturnType<typeof vi.fn>;
  let mockOnMoveElementToContainer: ReturnType<typeof vi.fn>;
  let mockOnDragEnd: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAddChildElement = vi.fn();
    mockOnMoveElementToContainer = vi.fn();
    mockOnDragEnd = vi.fn();
  });

  // Simulate NestedGridContainer.handleDrop logic
  function simulateContainerDropHandler(
    containerId: string,
    dragDataString: string,
    options: {
      onAddChildElement: typeof mockOnAddChildElement;
      onMoveElementToContainer: typeof mockOnMoveElementToContainer;
      onDragEnd: typeof mockOnDragEnd;
    }
  ): { handled: boolean; action: 'add' | 'move' | 'rejected' | 'error' } {
    const event = createMockDragEvent({ 'text/plain': dragDataString });
    const parseResult = parseDragData(event);

    if (!parseResult.success || !parseResult.data) {
      options.onDragEnd();
      return { handled: false, action: 'error' };
    }

    const data = parseResult.data;

    // Don't allow meta-components inside containers
    if (isMetaDrag(data)) {
      options.onDragEnd();
      return { handled: false, action: 'rejected' };
    }

    // Handle existing element move
    if (isExistingElementDrag(data)) {
      // Don't allow dropping into same container
      if (data.fromContainerId === containerId) {
        options.onDragEnd();
        return { handled: false, action: 'rejected' };
      }

      options.onMoveElementToContainer(data.elementId, data.fromContainerId, containerId);
      options.onDragEnd();
      return { handled: true, action: 'move' };
    }

    // Handle new element
    if (isNewElementDrag(data)) {
      const newElement: ContainerChildElement = {
        id: `nested-${Date.now()}`,
        type: 'text',
        label: 'New Element',
      };

      const newLayout: ContainerChildLayoutItem = {
        i: newElement.id,
        x: 0,
        y: 0,
        w: 3,
        h: 4,
        minH: 4,
        minW: 1,
      };

      options.onAddChildElement(containerId, newElement, newLayout);
      options.onDragEnd();
      return { handled: true, action: 'add' };
    }

    options.onDragEnd();
    return { handled: false, action: 'error' };
  }

  describe('New Element to Container', () => {
    it('adds new element from sidebar to container', () => {
      const dragData = createNewElementDragData('Multiple Selection');

      const result = simulateContainerDropHandler('meta-container-1', dragData, {
        onAddChildElement: mockOnAddChildElement,
        onMoveElementToContainer: mockOnMoveElementToContainer,
        onDragEnd: mockOnDragEnd,
      });

      expect(result.handled).toBe(true);
      expect(result.action).toBe('add');
      expect(mockOnAddChildElement).toHaveBeenCalledTimes(1);
      expect(mockOnAddChildElement).toHaveBeenCalledWith(
        'meta-container-1',
        expect.objectContaining({ type: 'text' }),
        expect.any(Object)
      );
    });
  });

  describe('Existing Element Move', () => {
    it('moves element from canvas root to container', () => {
      const dragData = createExistingElementDragData('Text', 'field-123', null);

      const result = simulateContainerDropHandler('meta-container-1', dragData, {
        onAddChildElement: mockOnAddChildElement,
        onMoveElementToContainer: mockOnMoveElementToContainer,
        onDragEnd: mockOnDragEnd,
      });

      expect(result.handled).toBe(true);
      expect(result.action).toBe('move');
      expect(mockOnMoveElementToContainer).toHaveBeenCalledWith('field-123', null, 'meta-container-1');
    });

    it('moves element from different container', () => {
      const dragData = createExistingElementDragData('Checkbox', 'nested-456', 'meta-source');

      const result = simulateContainerDropHandler('meta-target', dragData, {
        onAddChildElement: mockOnAddChildElement,
        onMoveElementToContainer: mockOnMoveElementToContainer,
        onDragEnd: mockOnDragEnd,
      });

      expect(result.handled).toBe(true);
      expect(mockOnMoveElementToContainer).toHaveBeenCalledWith('nested-456', 'meta-source', 'meta-target');
    });

    it('rejects drop into same container', () => {
      const dragData = createExistingElementDragData('Text', 'nested-789', 'meta-same');

      const result = simulateContainerDropHandler('meta-same', dragData, {
        onAddChildElement: mockOnAddChildElement,
        onMoveElementToContainer: mockOnMoveElementToContainer,
        onDragEnd: mockOnDragEnd,
      });

      expect(result.handled).toBe(false);
      expect(result.action).toBe('rejected');
      expect(mockOnMoveElementToContainer).not.toHaveBeenCalled();
    });
  });

  describe('Meta-Component Rejection', () => {
    it('rejects meta-component drop inside container', () => {
      const dragData = createMetaDragData('Grouping');

      const result = simulateContainerDropHandler('meta-container', dragData, {
        onAddChildElement: mockOnAddChildElement,
        onMoveElementToContainer: mockOnMoveElementToContainer,
        onDragEnd: mockOnDragEnd,
      });

      expect(result.handled).toBe(false);
      expect(result.action).toBe('rejected');
      expect(mockOnAddChildElement).not.toHaveBeenCalled();
    });

    it('rejects Section meta-component inside container', () => {
      const dragData = createMetaDragData('Section');

      const result = simulateContainerDropHandler('meta-container', dragData, {
        onAddChildElement: mockOnAddChildElement,
        onMoveElementToContainer: mockOnMoveElementToContainer,
        onDragEnd: mockOnDragEnd,
      });

      expect(result.handled).toBe(false);
      expect(result.action).toBe('rejected');
    });
  });
});
