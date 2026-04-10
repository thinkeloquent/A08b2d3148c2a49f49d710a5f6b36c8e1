import { LayoutItem, GroupingMetaComponent, SectionMetaComponent, ContainerMetaComponent } from '../../types';

interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Check if element's center point is within the bounding box
 */
export function isElementContained(
  element: LayoutItem,
  metaBox: BoundingBox
): boolean {
  const centerX = element.x + element.w / 2;
  const centerY = element.y + element.h / 2;

  return (
    centerX >= metaBox.x &&
    centerX <= metaBox.x + metaBox.w &&
    centerY >= metaBox.y &&
    centerY <= metaBox.y + metaBox.h
  );
}

/**
 * Check if element overlaps with the bounding box
 */
export function isElementOverlapping(
  element: LayoutItem,
  metaBox: BoundingBox
): boolean {
  return !(
    element.x + element.w < metaBox.x ||
    element.x > metaBox.x + metaBox.w ||
    element.y + element.h < metaBox.y ||
    element.y > metaBox.y + metaBox.h
  );
}

/**
 * Get all child element IDs from a container meta-component.
 * In nested mode, returns IDs from childElements array.
 * In shared mode, returns memberElementIds.
 */
export function getContainedElementIds(
  container: ContainerMetaComponent
): string[] {
  if (container.gridMode === 'nested') {
    return container.childElements.map((el) => el.id);
  }
  return container.memberElementIds;
}

/**
 * Check if a container meta-component contains a specific element
 */
export function containerHasElement(
  container: ContainerMetaComponent,
  elementId: string
): boolean {
  if (container.gridMode === 'nested') {
    return container.childElements.some((el) => el.id === elementId);
  }
  return container.memberElementIds.includes(elementId);
}

/**
 * Find which container (if any) owns an element.
 * Returns undefined if element is at root level.
 */
export function findContainerForElement(
  elementId: string,
  containers: ContainerMetaComponent[]
): ContainerMetaComponent | undefined {
  return containers.find((container) => containerHasElement(container, elementId));
}

/**
 * Type guard for container meta-components (Grouping and Section)
 */
export function isContainerMeta(
  meta: { type: string }
): meta is GroupingMetaComponent | SectionMetaComponent {
  return meta.type === 'grouping' || meta.type === 'section';
}

/**
 * Get all elements from a container as ContainerChildElement array
 */
export function getContainerChildren(container: ContainerMetaComponent) {
  return container.childElements;
}

/**
 * Get the child layout from a container
 */
export function getContainerChildLayout(container: ContainerMetaComponent) {
  return container.childLayout;
}

/**
 * Calculate the bounding box for a meta-component based on its layout position
 */
export function getMetaBoundingBox(
  metaLayout: { x: number; y: number; w: number; h: number },
  cols: number,
  rowHeight: number,
  containerWidth: number
): BoundingBox {
  const colWidth = containerWidth / cols;
  return {
    x: metaLayout.x * colWidth,
    y: metaLayout.y * rowHeight,
    w: metaLayout.w * colWidth,
    h: metaLayout.h * rowHeight,
  };
}

/**
 * Find the smallest container that contains a point (for drop target detection)
 */
export function findSmallestContainerAtPoint(
  x: number,
  y: number,
  containers: Array<{
    meta: ContainerMetaComponent;
    bounds: BoundingBox;
  }>
): ContainerMetaComponent | null {
  const containingContainers = containers.filter(({ bounds }) =>
    x >= bounds.x &&
    x <= bounds.x + bounds.w &&
    y >= bounds.y &&
    y <= bounds.y + bounds.h
  );

  if (containingContainers.length === 0) {
    return null;
  }

  // Return the smallest container (most specific)
  return containingContainers.reduce((smallest, current) => {
    const smallestArea = smallest.bounds.w * smallest.bounds.h;
    const currentArea = current.bounds.w * current.bounds.h;
    return currentArea < smallestArea ? current : smallest;
  }).meta;
}
