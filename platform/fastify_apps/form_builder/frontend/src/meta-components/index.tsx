import {
  Box,
  GitBranch,
  ShieldCheck,
  Layout,
  Layers,
  Workflow,
  CircleDot,
  Database,
  Wand2,
  ShieldAlert,
  Settings,
  FileText,
} from 'lucide-react';
import { DraggableMetaComponentConfig } from './types';
import {
  GroupingRenderer,
  ConditionalRenderer,
  ValidationRenderer,
  SectionRenderer,
  CompositeRenderer,
  FlowControllerRenderer,
  StateOrchestratorRenderer,
  ServiceOrchestratorRenderer,
  HigherOrderRenderer,
  GuardrailRenderer,
  StaticConfigRenderer,
  SpecificationRenderer,
} from './renderers';
import {
  GroupingEditor,
  ConditionalEditor,
  ValidationEditor,
  SectionEditor,
  CompositeEditor,
  FlowControllerEditor,
  StateOrchestratorEditor,
  ServiceOrchestratorEditor,
  HigherOrderEditor,
  GuardrailEditor,
  StaticConfigEditor,
  SpecificationEditor,
} from './editors';

export const metaComponents: DraggableMetaComponentConfig[] = [
  // Layout Group - Visual container components
  {
    type: 'Grouping',
    metaType: 'grouping',
    description: 'Group elements with dashed outline',
    icon: Box,
    renderer: GroupingRenderer,
    editor: GroupingEditor,
    layout: { defaultW: 6, defaultH: 6, minW: 2, minH: 2, resizable: true },
    defaultProps: {
      name: 'New Group',
      label: 'Group',
      visible: true,
      gridMode: 'nested',
      nestedGridConfig: { cols: 12, rowHeight: 30, margin: [8, 8] },
      childElements: [],
      childLayout: [],
      memberElementIds: [],
    },
    group: 'layout',
    renderType: 'visual',
  },
  // Behavior Group - Legacy (non-visual, attached to elements)
  {
    type: 'Conditional Logic',
    metaType: 'conditional',
    description: 'Show/hide elements based on conditions',
    icon: GitBranch,
    renderer: ConditionalRenderer,
    editor: ConditionalEditor,
    layout: { defaultW: 4, defaultH: 2, minW: 2, minH: 2, resizable: false },
    defaultProps: {
      name: 'New Condition',
      // V2 format - new condition structure
      sourceElementId: '',
      conditionGroups: [],  // Empty by default, groups created with UUID when adding
      groupCombineMode: 'and',
      targetElementIds: [],
    },
    group: 'behavior',
    renderType: 'non-visual',
  },
  // Config Group - Legacy (non-visual, attached to elements)
  {
    type: 'Validation Rules',
    metaType: 'validation',
    description: 'Add cross-field validation',
    icon: ShieldCheck,
    renderer: ValidationRenderer,
    editor: ValidationEditor,
    layout: { defaultW: 4, defaultH: 2, minW: 2, minH: 2, resizable: false },
    defaultProps: {
      name: 'New Validation',
      rule: {
        ruleType: 'required',
        config: {},
      },
      errorMessage: 'Validation failed',
      targetElementIds: [],
    },
    group: 'config',
    renderType: 'non-visual',
  },
  // Section - Visual container component
  {
    type: 'Section',
    metaType: 'section',
    description: 'Create collapsible sections',
    icon: Layout,
    renderer: SectionRenderer,
    editor: SectionEditor,
    layout: { defaultW: 12, defaultH: 8, minW: 4, minH: 4, resizable: true },
    defaultProps: {
      name: 'New Section',
      title: 'Section',
      collapsible: true,
      gridMode: 'nested',
      nestedGridConfig: { cols: 12, rowHeight: 30, margin: [8, 8] },
      childElements: [],
      childLayout: [],
      memberElementIds: [],
      order: 0,
    },
    group: 'layout',
    renderType: 'visual',
  },
  // V2 Builders - Non-visual (attached to elements/containers)
  {
    type: 'Composite',
    metaType: 'layout:composite',
    description: 'Combine multiple blueprints with data bindings',
    icon: Layers,
    renderer: CompositeRenderer,
    editor: CompositeEditor,
    layout: { defaultW: 10, defaultH: 8, minW: 6, minH: 4, resizable: true },
    defaultProps: {
      name: 'New Composite',
      compositeId: '',
      blueprintRefs: [],
      isLocked: false,
      dataBindings: {},
    },
    group: 'builders',
    color: '#7c3aed',
    isNew: true,
    renderType: 'non-visual',
  },
  // V2 Behavior Meta-Components (non-visual, attached to elements)
  {
    type: 'Flow Controller',
    metaType: 'behavior:flow',
    description: 'Advanced conditional logic with multiple conditions',
    icon: Workflow,
    renderer: FlowControllerRenderer,
    editor: FlowControllerEditor,
    layout: { defaultW: 5, defaultH: 3, minW: 3, minH: 2, resizable: true },
    defaultProps: {
      name: 'New Flow',
      targetElementIds: [],
      flowSpec: {
        conditions: [],
        defaultAction: 'show',
        combineMode: 'and',
        // V2: Value reference for dot notation access
        valueRef: {
          rootObject: 'window',
          path: '',
        },
      },
    },
    group: 'behavior',
    color: '#3b82f6',
    isNew: true,
    renderType: 'non-visual',
  },
  {
    type: 'State Flow',
    metaType: 'behavior:state',
    description: 'State machine for complex form flows',
    icon: CircleDot,
    renderer: StateOrchestratorRenderer,
    editor: StateOrchestratorEditor,
    layout: { defaultW: 6, defaultH: 4, minW: 4, minH: 3, resizable: true },
    defaultProps: {
      name: 'New State Machine',
      targetElementIds: [],
      stateSpec: {
        stateMachineId: '',
        states: [],
        transitions: [],
        initialState: '',
      },
    },
    group: 'behavior',
    color: '#6366f1',
    isNew: true,
    renderType: 'non-visual',
  },
  {
    type: 'Service Orchestrator',
    metaType: 'behavior:service',
    description: 'Connect to external services and APIs',
    icon: Database,
    renderer: ServiceOrchestratorRenderer,
    editor: ServiceOrchestratorEditor,
    layout: { defaultW: 5, defaultH: 3, minW: 3, minH: 2, resizable: true },
    defaultProps: {
      name: 'New Service',
      targetElementIds: [],
      serviceSpec: {
        bindings: [],
      },
    },
    group: 'behavior',
    color: '#0ea5e9',
    isNew: true,
    renderType: 'non-visual',
  },
  {
    type: 'Higher-Order',
    metaType: 'behavior:higher-order',
    description: 'Apply behaviors like debounce, throttle, cache',
    icon: Wand2,
    renderer: HigherOrderRenderer,
    editor: HigherOrderEditor,
    layout: { defaultW: 4, defaultH: 3, minW: 3, minH: 2, resizable: true },
    defaultProps: {
      name: 'New Behavior',
      targetElementIds: [],
      behaviorSpec: {
        behaviorId: '',
        params: {},
      },
    },
    group: 'behavior',
    color: '#2563eb',
    isNew: true,
    renderType: 'non-visual',
  },
  // V2 Config Meta-Components (non-visual, attached to elements)
  {
    type: 'Guardrail',
    metaType: 'config:guardrail',
    description: 'Advanced validation rules with error/warning levels',
    icon: ShieldAlert,
    renderer: GuardrailRenderer,
    editor: GuardrailEditor,
    layout: { defaultW: 5, defaultH: 3, minW: 3, minH: 2, resizable: true },
    defaultProps: {
      name: 'New Guardrail',
      targetElementIds: [],
      guardrails: [],
    },
    group: 'config',
    color: '#10b981',
    isNew: true,
    renderType: 'non-visual',
  },
  {
    type: 'Static Config',
    metaType: 'config:static',
    description: 'Static configuration values with schema validation',
    icon: Settings,
    renderer: StaticConfigRenderer,
    editor: StaticConfigEditor,
    layout: { defaultW: 5, defaultH: 3, minW: 3, minH: 2, resizable: true },
    defaultProps: {
      name: 'New Config',
      targetElementIds: [],
      configValues: {},
    },
    group: 'config',
    color: '#14b8a6',
    isNew: true,
    renderType: 'non-visual',
  },
  {
    type: 'Analytics',
    metaType: 'config:specification',
    description: 'Analytics tracking with telemetry events',
    icon: FileText,
    renderer: SpecificationRenderer,
    editor: SpecificationEditor,
    layout: { defaultW: 5, defaultH: 4, minW: 3, minH: 3, resizable: true },
    defaultProps: {
      name: 'New Analytics',
      specId: '',
      specVersion: '1.0.0',
      targetElementIds: [],
      telemetry: {
        events: [],
      },
    },
    group: 'config',
    color: '#059669',
    isNew: true,
    renderType: 'non-visual',
  },
];

// Helper to get only visual meta-components (for canvas drop)
export function getVisualMetaComponents(): DraggableMetaComponentConfig[] {
  return metaComponents.filter((c) => c.renderType === 'visual');
}

// Helper to get non-visual meta-components (for attachment panel)
export function getNonVisualMetaComponents(): DraggableMetaComponentConfig[] {
  return metaComponents.filter((c) => c.renderType === 'non-visual');
}

export function getMetaComponentByType(type: string): DraggableMetaComponentConfig | undefined {
  return metaComponents.find((c) => c.type === type);
}

export function getMetaComponentByMetaType(metaType: string): DraggableMetaComponentConfig | undefined {
  return metaComponents.find((c) => c.metaType === metaType);
}
