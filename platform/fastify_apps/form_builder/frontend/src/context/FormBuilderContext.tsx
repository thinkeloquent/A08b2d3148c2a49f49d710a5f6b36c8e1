import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import {
  FormPage,
  FormElement,
  LayoutItem,
  ActivityEvent,
  ActivityAction,
  FormMetadata,
  MetaComponent,
  MetaComponentLayoutItem,
  PageMetadata,
  ContainerMetaComponent,
  ContainerChildElement,
  ContainerChildLayoutItem,
  GroupingMetaComponent,
  SectionMetaComponent,
  ElementMetadata,
  BoundingRect,
  ElementBounds,
} from '../types';
import { getMetaComponentByMetaType } from '../meta-components';

// Helper to update a container meta-component while preserving its discriminated union type
function updateContainerMeta(
  m: MetaComponent,
  updater: (container: ContainerMetaComponent) => Partial<ContainerMetaComponent>
): MetaComponent {
  if (m.type === 'grouping') {
    const container = m as GroupingMetaComponent;
    return { ...container, ...updater(container) } as GroupingMetaComponent;
  } else if (m.type === 'section') {
    const container = m as SectionMetaComponent;
    return { ...container, ...updater(container) } as SectionMetaComponent;
  }
  return m;
}

// Helper to create default page
function createDefaultPage(pageNumber: number): FormPage {
  return {
    id: `page-${Date.now()}`,
    title: `Page ${pageNumber}`,
    description: '',
    elements: [],
    layout: [],
  };
}

// Context state interface
interface FormBuilderContextValue {
  // Schema state
  pages: FormPage[];
  currentPageIndex: number;
  formVersion: string;

  // UI state
  selectedElementId: string | null;
  cols: number;
  rowHeight: number;

  // Drag state
  isDragging: boolean;
  dragType: string | null;
  dragSource: 'sidebar' | 'canvas' | null;
  hoverElementId: string | null;

  // Activity log
  activityLog: ActivityEvent[];

  // State drawer
  showStateDrawer: boolean;

  // Meta-components state
  metadata: FormMetadata;
  selectedMetaId: string | null;
  showMetaBoundaries: boolean;

  // Computed
  currentPage: FormPage;
  selectedElement: FormElement | null;
  currentPageMetadata: PageMetadata;
  selectedMeta: MetaComponent | null;

  // Actions - Version
  setFormVersion: (version: string) => void;
  incrementVersion: (part: 'major' | 'minor' | 'patch') => void;

  // Actions - Pages
  addPage: () => void;
  deletePage: (index: number) => void;
  setCurrentPageIndex: (index: number) => void;
  updatePageTitle: (index: number, title: string) => void;
  updateCurrentPageTitle: (title: string) => void;
  updateCurrentPageDescription: (description: string) => void;

  // Actions - Elements
  addElement: (element: FormElement, layoutItem: LayoutItem) => void;
  deleteElement: (id: string) => void;
  updateElement: (element: FormElement) => void;
  selectElement: (id: string | null) => void;
  toggleElementLock: (id: string) => void;

  // Actions - Layout
  updateLayout: (layout: LayoutItem[]) => void;

  // Actions - Grid
  setCols: (cols: number) => void;
  setRowHeight: (height: number) => void;

  // Actions - Drag
  setDragStart: (type: string, source: 'sidebar' | 'canvas') => void;
  setDragEnd: () => void;

  // Actions - UI
  toggleStateDrawer: () => void;

  // Actions - Meta-components
  addMetaComponent: (meta: MetaComponent, layout: MetaComponentLayoutItem) => void;
  updateMetaComponent: (meta: MetaComponent) => void;
  deleteMetaComponent: (id: string) => void;
  updateMetaLayout: (layout: MetaComponentLayoutItem[]) => void;
  selectMetaComponent: (id: string | null) => void;
  toggleMetaBoundaries: () => void;
  toggleMetaLock: (id: string) => void;

  // Actions - Container operations (nested drop zones)
  addElementToContainer: (
    containerId: string,
    element: ContainerChildElement,
    layout: ContainerChildLayoutItem
  ) => void;
  moveElementToContainer: (
    elementId: string,
    fromContainerId: string | null,
    toContainerId: string | null
  ) => void;
  updateContainerChildLayout: (containerId: string, layout: ContainerChildLayoutItem[]) => void;
  removeElementFromContainer: (containerId: string, elementId: string) => void;
  toggleContainerGridMode: (containerId: string) => void;
  getContainerMetas: () => ContainerMetaComponent[];
  getAllElementsFlat: () => Array<FormElement | ContainerChildElement>;
  getParentMetaComponents: (elementId: string) => MetaComponent[];

  // Actions - Meta attachment (non-visual metas attached to elements)
  getAttachedMetas: (elementId: string) => MetaComponent[];
  attachMetaToElement: (elementId: string, metaType: string) => void;
  detachMetaFromElement: (elementId: string, metaId: string) => void;

  // Meta overlay editing (full-width editor from Behaviors tab)
  overlayMetaId: string | null;
  overlayMeta: MetaComponent | null;
  openMetaOverlay: (metaId: string) => void;
  closeMetaOverlay: () => void;

  // Import/Export actions
  importForm: (pages: FormPage[], metadata?: FormMetadata, elementMetadata?: Record<string, ElementMetadata>) => void;

  // Element metadata actions
  elementMetadata: Record<string, ElementMetadata>;
  getElementMetadata: (elementId: string) => ElementMetadata | null;
  updateElementMetadata: (elementId: string, metadata: Partial<ElementMetadata>) => void;

  // Element bounds actions
  elementBounds: Record<string, ElementBounds>;
  updateElementBounds: (
    elementId: string,
    pageId: string,
    rootRect: BoundingRect,
    relativeRect: BoundingRect | null,
    parentContainerIds: string[]
  ) => void;
  getElementBounds: (elementId: string) => ElementBounds | null;
  getAllElementBounds: () => Record<string, ElementBounds>;
}

const FormBuilderContext = createContext<FormBuilderContextValue | null>(null);

export function FormBuilderProvider({ children }: { children: ReactNode }) {
  // Schema state
  const [pages, setPages] = useState<FormPage[]>([createDefaultPage(1)]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [formVersion, setFormVersionState] = useState('1.0.0');

  // UI state
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [cols, setCols] = useState(24);
  const [rowHeight, setRowHeight] = useState(15);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<string | null>(null);
  const [dragSource, setDragSource] = useState<'sidebar' | 'canvas' | null>(null);
  const [hoverElementId] = useState<string | null>(null);

  // Activity log
  const [activityLog, setActivityLog] = useState<ActivityEvent[]>([]);

  // State drawer
  const [showStateDrawer, setShowStateDrawer] = useState(false);

  // Meta-components state
  const [metadata, setMetadata] = useState<FormMetadata>({ version: '1.0', pages: {} });
  const [selectedMetaId, setSelectedMetaId] = useState<string | null>(null);
  const [showMetaBoundaries, setShowMetaBoundaries] = useState(true);
  const [overlayMetaId, setOverlayMetaId] = useState<string | null>(null);

  // Element metadata state
  const [elementMetadata, setElementMetadata] = useState<Record<string, ElementMetadata>>({});

  // Element bounds state
  const [elementBounds, setElementBounds] = useState<Record<string, ElementBounds>>({});

  // Computed
  const currentPage = pages[currentPageIndex];

  // Find selected element - check both root elements and container child elements
  const findSelectedElement = (): FormElement | null => {
    if (!selectedElementId) return null;

    // Check root elements first
    const rootElement = currentPage.elements.find((el) => el.id === selectedElementId);
    if (rootElement) return rootElement;

    // Check container meta-components for nested child elements
    const pageMetadata = metadata.pages[currentPage.id];
    if (pageMetadata) {
      for (const meta of pageMetadata.metaComponents) {
        if (meta.type === 'grouping' || meta.type === 'section') {
          const containerMeta = meta as GroupingMetaComponent | SectionMetaComponent;
          const childElement = containerMeta.childElements.find((el) => el.id === selectedElementId);
          if (childElement) {
            // Convert ContainerChildElement to FormElement for the properties panel
            return {
              ...childElement,
              type: childElement.type as FormElement['type'],
            } as FormElement;
          }
        }
      }
    }

    return null;
  };

  const selectedElement = findSelectedElement();

  // Computed - Meta
  const currentPageMetadata: PageMetadata = metadata.pages[currentPage.id] || {
    pageId: currentPage.id,
    metaComponents: [],
    metaLayout: [],
  };
  const selectedMeta = currentPageMetadata.metaComponents.find((m) => m.id === selectedMetaId) || null;
  const overlayMeta = currentPageMetadata.metaComponents.find((m) => m.id === overlayMetaId) || null;

  // Activity logging
  const logActivity = useCallback((action: ActivityAction, details?: Omit<ActivityEvent, 'id' | 'timestamp' | 'action'>) => {
    setActivityLog((prev) => [
      ...prev.slice(-99),
      {
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
        action,
        ...details,
      },
    ]);
  }, []);

  // Version actions
  const setFormVersion = useCallback((version: string) => {
    // Validate SemVer format
    const semverRegex = /^\d+\.\d+\.\d+$/;
    if (semverRegex.test(version)) {
      setFormVersionState(version);
    }
  }, []);

  const incrementVersion = useCallback((part: 'major' | 'minor' | 'patch') => {
    setFormVersionState((prev) => {
      const [major, minor, patch] = prev.split('.').map(Number);
      switch (part) {
        case 'major':
          return `${major + 1}.0.0`;
        case 'minor':
          return `${major}.${minor + 1}.0`;
        case 'patch':
          return `${major}.${minor}.${patch + 1}`;
        default:
          return prev;
      }
    });
  }, []);

  // Helper to update current page
  const updateCurrentPage = useCallback(
    (updater: (page: FormPage) => FormPage) => {
      setPages((prevPages) =>
        prevPages.map((page, index) =>
          index === currentPageIndex ? updater(page) : page
        )
      );
    },
    [currentPageIndex]
  );

  // Actions - Pages
  const addPage = useCallback(() => {
    const newPage = createDefaultPage(pages.length + 1);
    setPages((prev) => [...prev, newPage]);
    setCurrentPageIndex(pages.length);
    setSelectedElementId(null);
    logActivity('page_added', { pageId: newPage.id });
  }, [pages.length, logActivity]);

  const deletePage = useCallback(
    (index: number) => {
      if (pages.length <= 1) return;
      const deletedPage = pages[index];
      setPages((prev) => prev.filter((_, i) => i !== index));
      if (currentPageIndex >= index && currentPageIndex > 0) {
        setCurrentPageIndex(currentPageIndex - 1);
      }
      setSelectedElementId(null);
      logActivity('page_deleted', { pageId: deletedPage.id });
    },
    [pages, currentPageIndex, logActivity]
  );

  const handleSetCurrentPageIndex = useCallback(
    (index: number) => {
      const pageId = pages[index]?.id;
      setCurrentPageIndex(index);
      setSelectedElementId(null);
      logActivity('page_switched', { pageId });
    },
    [pages, logActivity]
  );

  const updatePageTitle = useCallback((index: number, title: string) => {
    setPages((prev) =>
      prev.map((page, i) => (i === index ? { ...page, title } : page))
    );
  }, []);

  const updateCurrentPageTitle = useCallback(
    (title: string) => {
      updateCurrentPage((page) => ({ ...page, title }));
    },
    [updateCurrentPage]
  );

  const updateCurrentPageDescription = useCallback(
    (description: string) => {
      updateCurrentPage((page) => ({ ...page, description }));
    },
    [updateCurrentPage]
  );

  // Actions - Elements
  const addElement = useCallback(
    (element: FormElement, layoutItem: LayoutItem) => {
      updateCurrentPage((page) => ({
        ...page,
        elements: [...page.elements, element],
        layout: [...page.layout, layoutItem],
      }));
      setSelectedElementId(element.id);
      logActivity('element_added', { elementId: element.id, elementType: element.type });
    },
    [updateCurrentPage, logActivity]
  );

  const deleteElement = useCallback(
    (id: string) => {
      const element = currentPage.elements.find((el) => el.id === id);
      updateCurrentPage((page) => ({
        ...page,
        elements: page.elements.filter((el) => el.id !== id),
        layout: page.layout.filter((item) => item.i !== id),
      }));
      if (selectedElementId === id) {
        setSelectedElementId(null);
      }
      logActivity('element_deleted', { elementId: id, elementType: element?.type });
    },
    [updateCurrentPage, selectedElementId, currentPage.elements, logActivity]
  );

  const updateElement = useCallback(
    (updatedElement: FormElement) => {
      // Check if element is in root elements
      const isRootElement = currentPage.elements.some((el) => el.id === updatedElement.id);

      if (isRootElement) {
        updateCurrentPage((page) => ({
          ...page,
          elements: page.elements.map((el) =>
            el.id === updatedElement.id ? updatedElement : el
          ),
        }));
      } else {
        // Element might be in a container - update it there
        setMetadata((prev) => {
          const pm = prev.pages[currentPage.id];
          if (!pm) return prev;
          return {
            ...prev,
            pages: {
              ...prev.pages,
              [currentPage.id]: {
                ...pm,
                metaComponents: pm.metaComponents.map((m) => {
                  if (m.type !== 'grouping' && m.type !== 'section') return m;
                  const container = m as GroupingMetaComponent | SectionMetaComponent;
                  const hasElement = container.childElements.some((el) => el.id === updatedElement.id);
                  if (!hasElement) return m;

                  return updateContainerMeta(m, () => ({
                    childElements: container.childElements.map((el) =>
                      el.id === updatedElement.id
                        ? { ...updatedElement, id: el.id, type: el.type, label: updatedElement.label }
                        : el
                    ),
                  }));
                }),
              },
            },
          };
        });
      }

      logActivity('element_updated', { elementId: updatedElement.id, elementType: updatedElement.type });
    },
    [currentPage.id, currentPage.elements, updateCurrentPage, logActivity]
  );

  const selectElement = useCallback(
    (id: string | null) => {
      setSelectedElementId(id);
      if (id) {
        logActivity('element_selected', { elementId: id });
      }
    },
    [logActivity]
  );

  const toggleElementLock = useCallback(
    (id: string) => {
      updateCurrentPage((page) => {
        const element = page.elements.find((el) => el.id === id);
        const newLocked = !element?.locked;
        return {
          ...page,
          elements: page.elements.map((el) =>
            el.id === id ? { ...el, locked: newLocked } : el
          ),
          layout: page.layout.map((item) =>
            item.i === id ? { ...item, static: newLocked } : item
          ),
        };
      });
    },
    [updateCurrentPage]
  );

  // Actions - Layout
  const updateLayout = useCallback(
    (layout: LayoutItem[]) => {
      updateCurrentPage((page) => ({ ...page, layout }));
    },
    [updateCurrentPage]
  );

  // Actions - Grid
  const handleSetCols = useCallback(
    (newCols: number) => {
      if (cols === newCols) return;
      const oldCols = cols;
      setPages((prevPages) =>
        prevPages.map((page) => ({
          ...page,
          layout: page.layout.map((item) => ({
            ...item,
            x: Math.round((item.x / oldCols) * newCols),
            w: Math.max(1, Math.round((item.w / oldCols) * newCols)),
            minW: Math.max(1, Math.round((item.minW / oldCols) * newCols)),
          })),
        }))
      );
      setCols(newCols);
    },
    [cols]
  );

  // Actions - Drag
  const setDragStart = useCallback((type: string, source: 'sidebar' | 'canvas') => {
    setIsDragging(true);
    setDragType(type);
    setDragSource(source);
  }, []);

  const setDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
    setDragSource(null);
  }, []);

  // Actions - UI
  const toggleStateDrawer = useCallback(() => {
    setShowStateDrawer((prev) => !prev);
  }, []);

  // Actions - Meta-components
  const updatePageMetadata = useCallback(
    (pageId: string, updater: (pm: PageMetadata) => PageMetadata) => {
      setMetadata((prev) => {
        const existing = prev.pages[pageId] || {
          pageId,
          metaComponents: [],
          metaLayout: [],
        };
        return {
          ...prev,
          pages: {
            ...prev.pages,
            [pageId]: updater(existing),
          },
        };
      });
    },
    []
  );

  const addMetaComponent = useCallback(
    (meta: MetaComponent, layout: MetaComponentLayoutItem) => {
      updatePageMetadata(currentPage.id, (pm) => ({
        ...pm,
        metaComponents: [...pm.metaComponents, meta],
        metaLayout: [...pm.metaLayout, layout],
      }));
      setSelectedMetaId(meta.id);
      setSelectedElementId(null);
    },
    [currentPage.id, updatePageMetadata]
  );

  const updateMetaComponent = useCallback(
    (meta: MetaComponent) => {
      updatePageMetadata(currentPage.id, (pm) => ({
        ...pm,
        metaComponents: pm.metaComponents.map((m) => (m.id === meta.id ? meta : m)),
      }));
    },
    [currentPage.id, updatePageMetadata]
  );

  const deleteMetaComponent = useCallback(
    (id: string) => {
      updatePageMetadata(currentPage.id, (pm) => ({
        ...pm,
        metaComponents: pm.metaComponents.filter((m) => m.id !== id),
        metaLayout: pm.metaLayout.filter((l) => l.id !== id),
      }));
      if (selectedMetaId === id) {
        setSelectedMetaId(null);
      }
    },
    [currentPage.id, updatePageMetadata, selectedMetaId]
  );

  const updateMetaLayout = useCallback(
    (layout: MetaComponentLayoutItem[]) => {
      updatePageMetadata(currentPage.id, (pm) => ({
        ...pm,
        metaLayout: layout,
      }));
    },
    [currentPage.id, updatePageMetadata]
  );

  const selectMetaComponent = useCallback(
    (id: string | null) => {
      setSelectedMetaId(id);
      if (id) {
        setSelectedElementId(null);
      }
    },
    []
  );

  const toggleMetaBoundaries = useCallback(() => {
    setShowMetaBoundaries((prev) => !prev);
  }, []);

  const toggleMetaLock = useCallback(
    (id: string) => {
      updatePageMetadata(currentPage.id, (pm) => {
        const meta = pm.metaComponents.find((m) => m.id === id);
        const newLocked = !meta?.locked;
        return {
          ...pm,
          metaComponents: pm.metaComponents.map((m) =>
            m.id === id ? { ...m, locked: newLocked } : m
          ),
          metaLayout: pm.metaLayout.map((item) =>
            item.id === id ? { ...item, static: newLocked } : item
          ),
        };
      });
    },
    [currentPage.id, updatePageMetadata]
  );

  // Helper to check if a meta is a container type
  const isContainerMeta = (meta: MetaComponent): boolean => {
    return meta.type === 'grouping' || meta.type === 'section';
  };

  // Type assertion helper for container metas
  const asContainerMeta = (meta: MetaComponent): ContainerMetaComponent => {
    return meta as unknown as ContainerMetaComponent;
  };

  // Actions - Container operations (nested drop zones)
  const addElementToContainer = useCallback(
    (containerId: string, element: ContainerChildElement, layout: ContainerChildLayoutItem) => {
      updatePageMetadata(currentPage.id, (pm) => ({
        ...pm,
        metaComponents: pm.metaComponents.map((m) => {
          if (m.id !== containerId || !isContainerMeta(m)) return m;
          return updateContainerMeta(m, (container) => ({
            childElements: [...container.childElements, element],
            childLayout: [...container.childLayout, layout],
          }));
        }),
      }));
      logActivity('element_added', { elementId: element.id, elementType: element.type, containerId });
    },
    [currentPage.id, updatePageMetadata, logActivity]
  );

  const moveElementToContainer = useCallback(
    (elementId: string, fromContainerId: string | null, toContainerId: string | null) => {
      // Moving from one container to another, or between root and container
      updatePageMetadata(currentPage.id, (pm) => {
        let element: ContainerChildElement | null = null;
        let layout: ContainerChildLayoutItem | null = null;

        // Remove from source
        let updatedMetas = pm.metaComponents.map((m) => {
          if (!isContainerMeta(m)) return m;
          const container = asContainerMeta(m);
          if (fromContainerId && m.id === fromContainerId) {
            const foundElement = container.childElements.find((el) => el.id === elementId);
            const foundLayout = container.childLayout.find((l) => l.i === elementId);
            if (foundElement) element = foundElement;
            if (foundLayout) layout = foundLayout;
            return updateContainerMeta(m, () => ({
              childElements: container.childElements.filter((el) => el.id !== elementId),
              childLayout: container.childLayout.filter((l) => l.i !== elementId),
            }));
          }
          return m;
        });

        // If moving from root, get element from page elements
        if (!fromContainerId) {
          const pageElement = currentPage.elements.find((el) => el.id === elementId);
          const pageLayout = currentPage.layout.find((l) => l.i === elementId);
          if (pageElement) {
            element = {
              ...pageElement,
              id: pageElement.id,
              type: pageElement.type,
              label: pageElement.label,
            };
          }
          if (pageLayout) {
            layout = {
              i: pageLayout.i,
              x: 0,
              y: 0,
              w: pageLayout.w,
              h: pageLayout.h,
              minW: pageLayout.minW,
              minH: pageLayout.minH,
            };
          }
        }

        // Add to target container
        if (toContainerId && element && layout) {
          const elementToAdd = element;
          const layoutToAdd = layout;
          updatedMetas = updatedMetas.map((m) => {
            if (m.id !== toContainerId || !isContainerMeta(m)) return m;
            const container = asContainerMeta(m);
            return updateContainerMeta(m, () => ({
              childElements: [...container.childElements, elementToAdd],
              childLayout: [...container.childLayout, { ...layoutToAdd, x: 0, y: 0 }],
            }));
          });
        }

        return { ...pm, metaComponents: updatedMetas };
      });

      // If moving from root, also remove from page elements
      if (!fromContainerId && toContainerId) {
        updateCurrentPage((page) => ({
          ...page,
          elements: page.elements.filter((el) => el.id !== elementId),
          layout: page.layout.filter((l) => l.i !== elementId),
        }));
      }

      // If moving to root, add to page elements
      if (fromContainerId && !toContainerId) {
        // Find the element in the container
        const container = currentPageMetadata.metaComponents.find(
          (m) => m.id === fromContainerId && isContainerMeta(m)
        ) as ContainerMetaComponent | undefined;

        if (container) {
          const element = container.childElements.find((el) => el.id === elementId);
          const layout = container.childLayout.find((l) => l.i === elementId);

          if (element && layout) {
            updateCurrentPage((page) => ({
              ...page,
              elements: [...page.elements, {
                id: element.id,
                type: element.type as FormElement['type'],
                label: element.label,
                parentContainerId: null,
              } as FormElement],
              layout: [...page.layout, {
                i: layout.i,
                x: 0,
                y: page.layout.length > 0 ? Math.max(...page.layout.map(l => l.y + l.h)) : 0,
                w: layout.w,
                h: layout.h,
                minW: layout.minW || 2,
                minH: layout.minH || 1,
              }],
            }));
          }
        }
      }

      logActivity('element_moved', { elementId, fromContainerId, toContainerId });
    },
    [currentPage.id, currentPage.elements, currentPage.layout, currentPageMetadata.metaComponents, updatePageMetadata, updateCurrentPage, logActivity]
  );

  const updateContainerChildLayout = useCallback(
    (containerId: string, layout: ContainerChildLayoutItem[]) => {
      updatePageMetadata(currentPage.id, (pm) => ({
        ...pm,
        metaComponents: pm.metaComponents.map((m) => {
          if (m.id !== containerId || !isContainerMeta(m)) return m;
          return updateContainerMeta(m, () => ({ childLayout: layout }));
        }),
      }));
    },
    [currentPage.id, updatePageMetadata]
  );

  const removeElementFromContainer = useCallback(
    (containerId: string, elementId: string) => {
      updatePageMetadata(currentPage.id, (pm) => ({
        ...pm,
        metaComponents: pm.metaComponents.map((m) => {
          if (m.id !== containerId || !isContainerMeta(m)) return m;
          const container = asContainerMeta(m);
          return updateContainerMeta(m, () => ({
            childElements: container.childElements.filter((el) => el.id !== elementId),
            childLayout: container.childLayout.filter((l) => l.i !== elementId),
          }));
        }),
      }));
      logActivity('element_deleted', { elementId, containerId });
    },
    [currentPage.id, updatePageMetadata, logActivity]
  );

  const toggleContainerGridMode = useCallback(
    (containerId: string) => {
      updatePageMetadata(currentPage.id, (pm) => ({
        ...pm,
        metaComponents: pm.metaComponents.map((m) => {
          if (m.id !== containerId || !isContainerMeta(m)) return m;
          const container = asContainerMeta(m);
          return updateContainerMeta(m, () => ({
            gridMode: container.gridMode === 'nested' ? 'shared' : 'nested',
          }));
        }),
      }));
    },
    [currentPage.id, updatePageMetadata]
  );

  const getContainerMetas = useCallback((): ContainerMetaComponent[] => {
    return currentPageMetadata.metaComponents
      .filter(isContainerMeta)
      .map(asContainerMeta);
  }, [currentPageMetadata.metaComponents]);

  const getAllElementsFlat = useCallback((): Array<FormElement | ContainerChildElement> => {
    const rootElements = currentPage.elements;
    const containerElements = currentPageMetadata.metaComponents
      .filter(isContainerMeta)
      .map(asContainerMeta)
      .flatMap((m) => m.childElements);
    return [...rootElements, ...containerElements];
  }, [currentPage.elements, currentPageMetadata.metaComponents]);

  // Get parent meta-components that contain the given element
  const getParentMetaComponents = useCallback((elementId: string): MetaComponent[] => {
    return currentPageMetadata.metaComponents.filter((meta) => {
      if (isContainerMeta(meta)) {
        const container = asContainerMeta(meta);
        return container.childElements.some((el) => el.id === elementId);
      }
      return false;
    });
  }, [currentPageMetadata.metaComponents]);

  // Meta attachment functions - get non-visual metas attached to an element via targetElementIds
  const getAttachedMetas = useCallback((elementId: string): MetaComponent[] => {
    return currentPageMetadata.metaComponents.filter((meta) => {
      // Check if this meta has targetElementIds that include this element
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const metaAny = meta as any;
      if (Array.isArray(metaAny.targetElementIds)) {
        return (metaAny.targetElementIds as string[]).includes(elementId);
      }
      return false;
    });
  }, [currentPageMetadata.metaComponents]);

  const attachMetaToElement = useCallback((elementId: string, metaType: string) => {
    const config = getMetaComponentByMetaType(metaType);
    if (!config) return;

    // Create a new meta-component with this element as a target
    // Spread defaultProps first, then override with our values
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newMeta: any = {
      ...config.defaultProps,
      id: `meta-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: config.defaultProps.name || config.type,
      type: metaType,
      pageId: currentPage.id,
      targetElementIds: [elementId], // Must be after spread to override empty array from defaultProps
    };

    // For conditional metas, set sourceElementId to the attached element
    if (metaType === 'conditional') {
      newMeta.sourceElementId = elementId;
      // Also set legacy condition.sourceElementId for backward compatibility
      if (newMeta.condition) {
        newMeta.condition.sourceElementId = elementId;
      }
    }

    // For flow controller metas, initialize valueRef with defaults
    if (metaType === 'behavior:flow') {
      // targetElementIds[0] is the source element (read-only in UI)
      if (!newMeta.flowSpec) {
        newMeta.flowSpec = {
          conditions: [],
          defaultAction: 'show',
          combineMode: 'and',
          valueRef: { rootObject: 'window', path: '' },
        };
      } else if (!newMeta.flowSpec.valueRef) {
        newMeta.flowSpec.valueRef = { rootObject: 'window', path: '' };
      }
    }

    // Add without layout (non-visual metas don't have canvas position)
    updatePageMetadata(currentPage.id, (pm) => ({
      ...pm,
      metaComponents: [...pm.metaComponents, newMeta as MetaComponent],
    }));

    logActivity('element_added', {
      elementType: metaType,
      elementId: newMeta.id,
      details: { name: newMeta.name },
    });
  }, [currentPage.id, updatePageMetadata, logActivity]);

  const detachMetaFromElement = useCallback((elementId: string, metaId: string) => {
    updatePageMetadata(currentPage.id, (pm) => {
      const meta = pm.metaComponents.find((m) => m.id === metaId);
      if (!meta) return pm;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const metaAny = meta as any;
      if (!Array.isArray(metaAny.targetElementIds)) return pm;

      const targetIds = metaAny.targetElementIds as string[];
      const remainingTargets = targetIds.filter((id) => id !== elementId);

      // If no more targets, remove the meta entirely
      if (remainingTargets.length === 0) {
        return {
          ...pm,
          metaComponents: pm.metaComponents.filter((m) => m.id !== metaId),
          metaLayout: pm.metaLayout.filter((l) => l.id !== metaId),
        };
      }

      // Otherwise, just update the targetElementIds
      return {
        ...pm,
        metaComponents: pm.metaComponents.map((m) => {
          if (m.id !== metaId) return m;
          return { ...m, targetElementIds: remainingTargets } as MetaComponent;
        }),
      };
    });

    logActivity('element_deleted', {
      elementId: metaId,
    });
  }, [currentPage.id, updatePageMetadata, logActivity]);

  // Meta overlay editing functions
  const openMetaOverlay = useCallback((metaId: string) => {
    setOverlayMetaId(metaId);
  }, []);

  const closeMetaOverlay = useCallback(() => {
    setOverlayMetaId(null);
  }, []);

  // Import/Export actions
  const importForm = useCallback(
    (importedPages: FormPage[], importedMetadata?: FormMetadata, importedElementMetadata?: Record<string, ElementMetadata>) => {
      // Replace all pages with imported pages
      setPages(importedPages);
      setCurrentPageIndex(0);
      setSelectedElementId(null);
      setSelectedMetaId(null);

      // Import metadata if provided
      if (importedMetadata) {
        setMetadata(importedMetadata);
      } else {
        // Reset metadata to empty
        setMetadata({ version: '1.0', pages: {} });
      }

      // Import element metadata if provided
      if (importedElementMetadata) {
        setElementMetadata(importedElementMetadata);
      } else {
        setElementMetadata({});
      }

      logActivity('form_imported', { pageCount: importedPages.length });
    },
    [logActivity]
  );

  // Element metadata actions
  const getElementMetadata = useCallback(
    (elementId: string): ElementMetadata | null => {
      return elementMetadata[elementId] || null;
    },
    [elementMetadata]
  );

  const updateElementMetadata = useCallback(
    (elementId: string, updates: Partial<ElementMetadata>) => {
      setElementMetadata((prev) => {
        const existing = prev[elementId] || {
          elementId,
          annotation: { type: 'string' as const, entries: [] },
          comments: '',
          references: [],
        };
        return {
          ...prev,
          [elementId]: { ...existing, ...updates, elementId },
        };
      });
    },
    []
  );

  // Element bounds actions
  const updateElementBounds = useCallback(
    (
      elementId: string,
      pageId: string,
      rootRect: BoundingRect,
      relativeRect: BoundingRect | null,
      parentContainerIds: string[]
    ) => {
      setElementBounds((prev) => ({
        ...prev,
        [elementId]: {
          elementId,
          pageId,
          bounds: {
            root: rootRect,
            relative: relativeRect,
            parentContainerIds,
          },
          updatedAt: new Date().toISOString(),
        },
      }));
    },
    []
  );

  const getElementBounds = useCallback(
    (elementId: string): ElementBounds | null => {
      return elementBounds[elementId] || null;
    },
    [elementBounds]
  );

  const getAllElementBounds = useCallback((): Record<string, ElementBounds> => {
    return elementBounds;
  }, [elementBounds]);

  const value = useMemo<FormBuilderContextValue>(
    () => ({
      // State
      pages,
      currentPageIndex,
      formVersion,
      selectedElementId,
      cols,
      rowHeight,
      isDragging,
      dragType,
      dragSource,
      hoverElementId,
      activityLog,
      showStateDrawer,
      // Meta state
      metadata,
      selectedMetaId,
      showMetaBoundaries,
      // Computed
      currentPage,
      selectedElement,
      currentPageMetadata,
      selectedMeta,
      // Actions - Version
      setFormVersion,
      incrementVersion,
      // Actions
      addPage,
      deletePage,
      setCurrentPageIndex: handleSetCurrentPageIndex,
      updatePageTitle,
      updateCurrentPageTitle,
      updateCurrentPageDescription,
      addElement,
      deleteElement,
      updateElement,
      selectElement,
      toggleElementLock,
      updateLayout,
      setCols: handleSetCols,
      setRowHeight,
      setDragStart,
      setDragEnd,
      toggleStateDrawer,
      // Meta actions
      addMetaComponent,
      updateMetaComponent,
      deleteMetaComponent,
      updateMetaLayout,
      selectMetaComponent,
      toggleMetaBoundaries,
      toggleMetaLock,
      // Container actions
      addElementToContainer,
      moveElementToContainer,
      updateContainerChildLayout,
      removeElementFromContainer,
      toggleContainerGridMode,
      getContainerMetas,
      getAllElementsFlat,
      getParentMetaComponents,
      // Meta attachment
      getAttachedMetas,
      attachMetaToElement,
      detachMetaFromElement,
      // Meta overlay editing
      overlayMetaId,
      overlayMeta,
      openMetaOverlay,
      closeMetaOverlay,
      // Import/Export
      importForm,
      // Element metadata
      elementMetadata,
      getElementMetadata,
      updateElementMetadata,
      // Element bounds
      elementBounds,
      updateElementBounds,
      getElementBounds,
      getAllElementBounds,
    }),
    [
      pages,
      currentPageIndex,
      formVersion,
      selectedElementId,
      cols,
      rowHeight,
      isDragging,
      dragType,
      dragSource,
      hoverElementId,
      activityLog,
      showStateDrawer,
      metadata,
      selectedMetaId,
      showMetaBoundaries,
      currentPage,
      selectedElement,
      currentPageMetadata,
      selectedMeta,
      addPage,
      deletePage,
      setFormVersion,
      incrementVersion,
      handleSetCurrentPageIndex,
      updatePageTitle,
      updateCurrentPageTitle,
      updateCurrentPageDescription,
      addElement,
      deleteElement,
      updateElement,
      selectElement,
      toggleElementLock,
      updateLayout,
      handleSetCols,
      setDragStart,
      setDragEnd,
      toggleStateDrawer,
      addMetaComponent,
      updateMetaComponent,
      deleteMetaComponent,
      updateMetaLayout,
      selectMetaComponent,
      toggleMetaBoundaries,
      toggleMetaLock,
      addElementToContainer,
      moveElementToContainer,
      updateContainerChildLayout,
      removeElementFromContainer,
      toggleContainerGridMode,
      getContainerMetas,
      getAllElementsFlat,
      getParentMetaComponents,
      getAttachedMetas,
      attachMetaToElement,
      detachMetaFromElement,
      overlayMetaId,
      overlayMeta,
      openMetaOverlay,
      closeMetaOverlay,
      importForm,
      elementMetadata,
      getElementMetadata,
      updateElementMetadata,
      elementBounds,
      updateElementBounds,
      getElementBounds,
      getAllElementBounds,
    ]
  );

  return (
    <FormBuilderContext.Provider value={value}>
      {children}
    </FormBuilderContext.Provider>
  );
}

export function useFormBuilder() {
  const context = useContext(FormBuilderContext);
  if (!context) {
    throw new Error('useFormBuilder must be used within a FormBuilderProvider');
  }
  return context;
}
