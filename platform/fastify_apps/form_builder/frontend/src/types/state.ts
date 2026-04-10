import { FormPage } from './index';

// Runtime UI state
export interface RuntimeState {
  selectedElementId: string | null;
  isDragging: boolean;
  dragType: string | null;
  dragSource: 'sidebar' | 'canvas' | null;
  hoverElementId: string | null;
  cols: number;
  rowHeight: number;
}

// Activity event types
export type ActivityAction =
  | 'element_added'
  | 'element_deleted'
  | 'element_moved'
  | 'element_resized'
  | 'element_selected'
  | 'element_updated'
  | 'page_added'
  | 'page_deleted'
  | 'page_switched'
  | 'form_imported';

export interface ActivityEvent {
  id: string;
  timestamp: number;
  action: ActivityAction;
  elementId?: string;
  elementType?: string;
  pageId?: string;
  containerId?: string | null;
  fromContainerId?: string | null;
  toContainerId?: string | null;
  pageCount?: number;
  details?: Record<string, unknown>;
}

// Combined app state for visualization
export interface AppState {
  schema: {
    pages: FormPage[];
    currentPageIndex: number;
  };
  runtime: RuntimeState;
  activity: ActivityEvent[];
}
