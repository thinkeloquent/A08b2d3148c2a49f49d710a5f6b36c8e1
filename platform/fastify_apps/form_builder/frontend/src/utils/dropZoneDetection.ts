import { MetaComponent, MetaComponentLayoutItem, ContainerMetaComponent } from '../types';

export interface DropZone {
  type: 'root' | 'container';
  containerId: string | null;
  bounds: DOMRect | null;
}

export interface ContainerBounds {
  meta: ContainerMetaComponent;
  bounds: DOMRect;
}

/**
 * Check if a meta-component is a container type (grouping or section)
 */
export function isContainerMetaComponent(
  meta: MetaComponent
): boolean {
  return meta.type === 'grouping' || meta.type === 'section';
}

/**
 * Cast a meta-component to ContainerMetaComponent
 */
export function asContainerMeta(meta: MetaComponent): ContainerMetaComponent {
  return meta as unknown as ContainerMetaComponent;
}

/**
 * Convert grid units to pixel bounds for a meta-component layout item
 */
export function getMetaPixelBounds(
  metaLayout: MetaComponentLayoutItem,
  cols: number,
  rowHeight: number,
  containerRect: DOMRect,
  margin: [number, number] = [8, 8]
): DOMRect {
  const colWidth = (containerRect.width - margin[0]) / cols;

  const x = containerRect.left + metaLayout.x * colWidth + margin[0];
  const y = containerRect.top + metaLayout.y * rowHeight + margin[1];
  const width = metaLayout.w * colWidth - margin[0];
  const height = metaLayout.h * rowHeight - margin[1];

  return new DOMRect(x, y, width, height);
}

/**
 * Get all container meta-components with their pixel bounds
 */
export function getContainerBounds(
  metaComponents: MetaComponent[],
  metaLayout: MetaComponentLayoutItem[],
  cols: number,
  rowHeight: number,
  containerRect: DOMRect
): ContainerBounds[] {
  const containers: ContainerBounds[] = [];

  for (const meta of metaComponents) {
    if (!isContainerMetaComponent(meta)) continue;

    const layout = metaLayout.find((l) => l.id === meta.id);
    if (!layout) continue;

    const bounds = getMetaPixelBounds(layout, cols, rowHeight, containerRect);
    containers.push({ meta: asContainerMeta(meta), bounds });
  }

  return containers;
}

/**
 * Find the drop target at the given cursor position.
 * Returns the smallest (most specific) container if cursor is within multiple.
 * Returns root drop zone if not within any container.
 */
export function findDropTarget(
  clientX: number,
  clientY: number,
  containers: ContainerBounds[],
  rootBounds: DOMRect
): DropZone {
  // Check if within any container
  const containingContainers = containers.filter(({ bounds }) =>
    clientX >= bounds.left &&
    clientX <= bounds.right &&
    clientY >= bounds.top &&
    clientY <= bounds.bottom
  );

  if (containingContainers.length === 0) {
    // Check if within root canvas bounds
    const isInRoot =
      clientX >= rootBounds.left &&
      clientX <= rootBounds.right &&
      clientY >= rootBounds.top &&
      clientY <= rootBounds.bottom;

    return {
      type: 'root',
      containerId: null,
      bounds: isInRoot ? rootBounds : null,
    };
  }

  // Find smallest container (most specific)
  const smallest = containingContainers.reduce((min, current) => {
    const minArea = min.bounds.width * min.bounds.height;
    const currentArea = current.bounds.width * current.bounds.height;
    return currentArea < minArea ? current : min;
  });

  return {
    type: 'container',
    containerId: smallest.meta.id,
    bounds: smallest.bounds,
  };
}

/**
 * Convert cursor position to grid coordinates within a specific drop zone
 */
export function cursorToGridPosition(
  clientX: number,
  clientY: number,
  zoneBounds: DOMRect,
  cols: number,
  rowHeight: number,
  margin: [number, number] = [8, 8]
): { x: number; y: number } {
  const colWidth = (zoneBounds.width - margin[0]) / cols;

  const relativeX = clientX - zoneBounds.left - margin[0];
  const relativeY = clientY - zoneBounds.top - margin[1];

  const x = Math.max(0, Math.floor(relativeX / colWidth));
  const y = Math.max(0, Math.floor(relativeY / rowHeight));

  return { x, y };
}

/**
 * Check if an element can be dropped at a specific position
 * (not overlapping with existing elements beyond allowed threshold)
 */
export function isValidDropPosition(
  x: number,
  y: number,
  w: number,
  h: number,
  existingLayout: Array<{ i: string; x: number; y: number; w: number; h: number }>,
  excludeId?: string
): boolean {
  const newBounds = { x, y, right: x + w, bottom: y + h };

  for (const item of existingLayout) {
    if (excludeId && item.i === excludeId) continue;

    const itemBounds = {
      x: item.x,
      y: item.y,
      right: item.x + item.w,
      bottom: item.y + item.h,
    };

    // Check for overlap
    const overlaps = !(
      newBounds.right <= itemBounds.x ||
      newBounds.x >= itemBounds.right ||
      newBounds.bottom <= itemBounds.y ||
      newBounds.y >= itemBounds.bottom
    );

    if (overlaps) return false;
  }

  return true;
}

/**
 * Find the first available position in a grid for a new element
 */
export function findAvailablePosition(
  w: number,
  h: number,
  existingLayout: Array<{ i: string; x: number; y: number; w: number; h: number }>,
  cols: number
): { x: number; y: number } {
  let y = 0;

  while (true) {
    for (let x = 0; x <= cols - w; x++) {
      if (isValidDropPosition(x, y, w, h, existingLayout)) {
        return { x, y };
      }
    }
    y++;
    // Safety limit
    if (y > 1000) return { x: 0, y };
  }
}
