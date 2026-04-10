// Meta-component types - stored separately from visual form elements
// Note: FormElement and LayoutItem are imported dynamically to avoid circular deps

// =============================================================================
// V2 Namespaced Types (F.v001.2 Specification)
// =============================================================================

export type MetaLayoutType =
  | "layout:grouping"
  | "layout:section"
  | "layout:blueprint_meta"
  | "layout:composite";

export type MetaConfigType =
  | "config:static"
  | "config:guardrail"
  | "config:specification";

export type MetaBehaviorType =
  | "behavior:higher-order"
  | "behavior:state"
  | "behavior:flow"
  | "behavior:service";

// Legacy types (backward compatibility)
export type LegacyMetaComponentType = 'grouping' | 'conditional' | 'validation' | 'section';

// Combined type supporting both legacy and V2
export type MetaComponentType =
  | LegacyMetaComponentType
  | MetaLayoutType
  | MetaConfigType
  | MetaBehaviorType;

// Re-declare minimal types needed to avoid circular import
// Full types are in index.ts
export interface ContainerChildElement {
  id: string;
  type: string;
  label: string;
  [key: string]: unknown;
}

export interface ContainerChildLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  static?: boolean;
}

export interface BaseMetaComponent {
  id: string;
  type: MetaComponentType;
  name: string;
  pageId: string;
  locked?: boolean;
}

// Nested grid configuration for container meta-components
export interface NestedGridConfig {
  cols: number;
  rowHeight: number;
  margin: [number, number];
}

// Container meta-components can hold child elements with their own grid
export interface ContainerMetaComponent extends BaseMetaComponent {
  // Toggle between nested grid (independent) and shared grid (reference-only)
  gridMode: 'nested' | 'shared';

  // Nested grid configuration (used when gridMode === 'nested')
  nestedGridConfig: NestedGridConfig;

  // Child elements owned by this container (when gridMode === 'nested')
  childElements: ContainerChildElement[];
  childLayout: ContainerChildLayoutItem[];

  // Legacy: element IDs for shared mode (backward compatibility)
  memberElementIds: string[];
}

export interface GroupingMetaComponent extends ContainerMetaComponent {
  type: 'grouping' | 'layout:grouping';
  label: string;
  visible: boolean;
  // V2 fields (optional for backward compatibility)
  visualStyle?: 'dashed' | 'solid' | 'none';
  constraints?: {
    allowedChildren?: string[];
    maxChildren?: number;
  };
}

export interface SectionMetaComponent extends ContainerMetaComponent {
  type: 'section' | 'layout:section';
  title: string;
  collapsible: boolean;
  order: number;
  // V2 fields (optional for backward compatibility)
  header?: string;
  isCollapsed?: boolean;
  isCollapsible?: boolean;
  constraints?: {
    allowedChildren?: string[];
    maxChildren?: number;
  };
}

// =============================================================================
// V2 Layout Types (Blueprint and Composite)
// =============================================================================

export interface BlueprintSlot {
  id: string;
  name: string;
  required: boolean;
  maxElements: number;
  allowedTypes: string[];
  position: { x: number; y: number; w: number; h: number };
  placeholder?: string;
}

export interface BlueprintMetaComponent extends ContainerMetaComponent {
  type: 'layout:blueprint_meta';
  blueprintId: string;
  slots: BlueprintSlot[];
  slotAssignments: Record<string, string[]>; // slotId -> elementIds
}

export interface CompositeMetaComponent extends BaseMetaComponent {
  type: 'layout:composite';
  compositeId: string;
  blueprintRefs: string[];
  isLocked: boolean;
  dataBindings: Record<string, string>;
}

// =============================================================================
// Behavior Types (V2)
// =============================================================================

// V2 Condition Variable - single condition within a group
export interface ConditionVariable {
  id: string;
  elementId: string;
  operator: 'is' | 'is_not' | 'contains' | 'is_between' | 'isEmpty' | 'isNotEmpty';
  value?: string | number | boolean;
  rangeFrom?: number;
  rangeTo?: number;
}

// V2 Condition Group - group of variables with AND/OR logic
export interface ConditionGroup {
  id: string;
  name: string;
  enabled: boolean;
  variables: ConditionVariable[];
  combineMode: 'and' | 'or';
  actionText: string;
}

export interface ConditionalRule {
  id: string;
  sourceElementId: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty';
  value: string | number | boolean;
  action: 'show' | 'hide' | 'disable' | 'enable' | 'setValue';
  actionValue?: unknown;
  targetElementIds: string[];
}

// Value reference for accessing nested object properties via dot notation
export type RootObjectType = 'window' | 'props' | 'state';

export interface ValueReference {
  rootObject: RootObjectType;
  path: string;  // Dot notation path, e.g., "target.value", "formData.email"
}

export interface FlowControllerSpec {
  conditions: ConditionalRule[];
  defaultAction: 'show' | 'hide' | 'disable';
  combineMode?: 'and' | 'or';
  // V2 value reference (replaces defaultAction dropdown)
  valueRef?: ValueReference;
}

// Non-container meta-components remain reference-based
export interface ConditionalMetaComponent extends BaseMetaComponent {
  type: 'conditional' | 'behavior:flow';
  // V2 format - new condition structure
  sourceElementId?: string;  // Auto-assigned from attached element (read-only in UI)
  conditionGroups?: ConditionGroup[];
  groupCombineMode?: 'and' | 'or' | 'else';
  // Legacy format (backward compatibility)
  condition?: {
    sourceElementId: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'isEmpty';
    value: unknown;
  };
  action?: 'show' | 'hide' | 'enable' | 'disable';
  targetElementIds: string[];
  // V2 flow spec format
  flowSpec?: FlowControllerSpec;
}

export interface StateDefinition {
  id: string;
  name: string;
  stateType: 'initial' | 'normal' | 'final';
  onEnter?: Array<{ type: string; target: string; payload?: unknown }>;
  onExit?: Array<{ type: string; target: string; payload?: unknown }>;
}

export interface StateTransition {
  id: string;
  from: string;
  to: string;
  event: string;
  condition?: string;
}

export interface StateOrchestratorSpec {
  stateMachineId: string;
  states: StateDefinition[];
  transitions: StateTransition[];
  initialState: string;
  currentState?: string;
}

export interface StateMetaComponent extends BaseMetaComponent {
  type: 'behavior:state';
  stateSpec: StateOrchestratorSpec;
  targetElementIds: string[];
}

export interface ServiceBinding {
  id: string;
  serviceId: string;
  operation: string;
  params?: Record<string, unknown>;
  outputMapping: Record<string, string>;
  targetElementIds: string[];
  refreshTrigger?: 'onMount' | 'onFocus' | 'onChange' | 'manual';
}

export interface ServiceOrchestratorSpec {
  bindings: ServiceBinding[];
}

export interface ServiceMetaComponent extends BaseMetaComponent {
  type: 'behavior:service';
  serviceSpec: ServiceOrchestratorSpec;
  targetElementIds: string[];
}

export interface HigherOrderBehaviorSpec {
  behaviorId: string;
  params: Record<string, unknown>;
}

export interface HigherOrderMetaComponent extends BaseMetaComponent {
  type: 'behavior:higher-order';
  behaviorSpec: HigherOrderBehaviorSpec;
  targetElementIds: string[];
}

// =============================================================================
// Config Types (V2)
// =============================================================================

export interface GuardrailRule {
  id: string;
  label: string;
  message: string;
  level: 'error' | 'warning' | 'info';
  ruleExpression: string;
  targetElementIds: string[];
}

export interface ValidationMetaComponent extends BaseMetaComponent {
  type: 'validation' | 'config:guardrail';
  // Legacy format
  rule?: { ruleType: string; config: Record<string, unknown> };
  errorMessage?: string;
  targetElementIds: string[];
  // V2 format
  guardrails?: GuardrailRule[];
}

export interface StaticConfigMetaComponent extends BaseMetaComponent {
  type: 'config:static';
  schemaRef?: string;
  inlineSchema?: object;
  configValues: Record<string, unknown>;
  targetElementIds: string[];
}

export interface TelemetrySpec {
  category?: string;
  specId?: string;
  events?: Array<{
    eventName: string;
    trigger: string;
    properties?: Record<string, string>;
  }>;
}

export interface SpecificationMetaComponent extends BaseMetaComponent {
  type: 'config:specification';
  specId: string;
  specVersion: string;
  telemetry?: TelemetrySpec;
  targetElementIds: string[];
}

// =============================================================================
// Union Type (All Meta-Components)
// =============================================================================

export type MetaComponent =
  // Layout
  | GroupingMetaComponent
  | SectionMetaComponent
  | BlueprintMetaComponent
  | CompositeMetaComponent
  // Behavior
  | ConditionalMetaComponent
  | StateMetaComponent
  | ServiceMetaComponent
  | HigherOrderMetaComponent
  // Config
  | ValidationMetaComponent
  | StaticConfigMetaComponent
  | SpecificationMetaComponent;

// =============================================================================
// Type Guards
// =============================================================================

export function isLayoutMetaComponent(meta: MetaComponent): meta is GroupingMetaComponent | SectionMetaComponent | BlueprintMetaComponent | CompositeMetaComponent {
  return meta.type.startsWith('layout:') || meta.type === 'grouping' || meta.type === 'section';
}

export function isBehaviorMetaComponent(meta: MetaComponent): meta is ConditionalMetaComponent | StateMetaComponent | ServiceMetaComponent | HigherOrderMetaComponent {
  return meta.type.startsWith('behavior:') || meta.type === 'conditional';
}

export function isConfigMetaComponent(meta: MetaComponent): meta is ValidationMetaComponent | StaticConfigMetaComponent | SpecificationMetaComponent {
  return meta.type.startsWith('config:') || meta.type === 'validation';
}

export function isContainerMetaComponent(meta: MetaComponent): meta is GroupingMetaComponent | SectionMetaComponent | BlueprintMetaComponent {
  return meta.type === 'grouping' || meta.type === 'layout:grouping' ||
         meta.type === 'section' || meta.type === 'layout:section' ||
         meta.type === 'layout:blueprint_meta';
}

export interface MetaComponentLayoutItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  static?: boolean;
}

export interface PageMetadata {
  pageId: string;
  metaComponents: MetaComponent[];
  metaLayout: MetaComponentLayoutItem[];
}

export interface FormMetadata {
  version: string;
  pages: Record<string, PageMetadata>;
}
