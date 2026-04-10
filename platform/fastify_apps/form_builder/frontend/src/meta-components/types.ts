import React from 'react';
import { LucideIcon } from 'lucide-react';
import { MetaComponentType, MetaComponent, LayoutItem } from '../types';

// Meta-component group for sidebar organization
export type MetaComponentGroup = 'builders' | 'layout' | 'behavior' | 'config';

// Renderer component type - renders meta-component overlay on canvas
export type MetaComponentRenderer = React.FC<{
  meta: MetaComponent;
  isSelected: boolean;
  onSelect: () => void;
  elementLayouts?: LayoutItem[];
}>;

// Editor component type - renders in properties panel
export type MetaComponentEditor = React.FC<{
  meta: MetaComponent;
  onUpdate: (meta: MetaComponent) => void;
  onDelete: () => void;
  availableElements: Array<{ id: string; label: string; type: string }>;
}>;

// Layout configuration for meta-components
export interface MetaLayoutConfig {
  defaultW: number;
  defaultH: number;
  minW: number;
  minH: number;
  resizable: boolean;
}

// Render type - visual components render to DOM, non-visual are attached to elements
export type MetaRenderType = 'visual' | 'non-visual';

// Draggable meta-component configuration
export interface DraggableMetaComponentConfig {
  type: string;
  metaType: MetaComponentType;
  description: string;
  icon: LucideIcon;
  renderer: MetaComponentRenderer;
  editor: MetaComponentEditor;
  layout: MetaLayoutConfig;
  defaultProps: Partial<MetaComponent>;
  // V2 fields
  group: MetaComponentGroup;
  color?: string; // Badge/border color
  isNew?: boolean; // Flag for new V2 components
  renderType: MetaRenderType; // Visual vs non-visual classification
}
