/**
 * Editor State Types & Constants
 * Maps between rich editor state and the API's JSONB fields
 */

import type { TaxonomyLevel, ComponentStatus, ApiComponent } from "../../types/api";

export type { TaxonomyLevel, ComponentStatus };

/* ── Constants ─────────────────────────────────────────────── */

export const ATOM_LEVELS: TaxonomyLevel[] = ["Atom", "Molecule", "Organism", "Template", "Page"];

export const ATOM_COLORS: Record<TaxonomyLevel, string> = {
  Atom: "#f59e0b",
  Molecule: "#10b981",
  Organism: "#6366f1",
  Template: "#ec4899",
  Page: "#ef4444",
};

export const FIELD_TYPES = ["string", "number", "boolean", "array", "object", "enum", "regex"] as const;

export const LIFECYCLE_EVENTS = [
  "onMount", "onUpdate", "onUnmount", "onStream", "onResolved", "onError",
] as const;

export const TRIGGER_EVENTS = [
  "onClick", "onSubmit", "onSelect", "onToggle", "onFocus", "onChange", "onDragEnd",
] as const;

export const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

export const MOUNT_PREREQS = [
  "none", "resolved-data", "auth-token", "feature-flag", "user-permissions",
] as const;

/* ── Sub-item types ────────────────────────────────────────── */

export interface EditorAlias {
  id: string;
  value: string;
}

export interface EditorFewShot {
  id: string;
  prompt: string;
  payload: string;
}

export interface EditorField {
  id: string;
  key: string;
  type: string;
  required: boolean;
  description: string;
  constraint: string;
}

export interface EditorLifecycle {
  id: string;
  phase: string;
  description: string;
  async: boolean;
  cleanup: string;
}

export interface EditorTrigger {
  id: string;
  event: string;
  interrupt: boolean;
  description: string;
  toolMapping: string;
}

export interface EditorDependency {
  id: string;
  operationId: string;
  method: string;
  endpoint: string;
  authScope: string;
  fallback: string;
}

/* ── Full Editor State ─────────────────────────────────────── */

export interface EditorState {
  // Identity
  name: string;
  atomLevel: TaxonomyLevel;
  status: ComponentStatus;
  createdBy: string;

  // Semantic
  aliases: EditorAlias[];
  semanticDescription: string;
  fewShots: EditorFewShot[];

  // Schema
  fields: EditorField[];
  outputSchema: string;

  // Lifecycle
  lifecycles: EditorLifecycle[];
  streamMutable: boolean;
  mountPrereq: string;

  // Interaction
  triggers: EditorTrigger[];
  ariaRole: string;
  ariaLabel: string;

  // Dependencies
  deps: EditorDependency[];

  // Spatial
  compositionParent: string;
  compositionChildren: string;
  viewport: string;
}

/* ── Factory Functions ─────────────────────────────────────── */

export const makeAlias = (): EditorAlias => ({ id: crypto.randomUUID(), value: "" });
export const makeFewShot = (): EditorFewShot => ({ id: crypto.randomUUID(), prompt: "", payload: "" });
export const makeField = (): EditorField => ({
  id: crypto.randomUUID(), key: "", type: "string", required: false, description: "", constraint: "",
});
export const makeLifecycle = (): EditorLifecycle => ({
  id: crypto.randomUUID(), phase: "onMount", description: "", async: false, cleanup: "",
});
export const makeTrigger = (): EditorTrigger => ({
  id: crypto.randomUUID(), event: "onClick", interrupt: false, description: "", toolMapping: "",
});
export const makeDep = (): EditorDependency => ({
  id: crypto.randomUUID(), operationId: "", method: "GET", endpoint: "", authScope: "", fallback: "",
});

/* ── Default empty state ───────────────────────────────────── */

export const EMPTY_STATE: EditorState = {
  name: "",
  atomLevel: "Atom",
  status: "draft",
  createdBy: "",
  aliases: [],
  semanticDescription: "",
  fewShots: [],
  fields: [],
  outputSchema: "",
  lifecycles: [],
  streamMutable: false,
  mountPrereq: "none",
  triggers: [],
  ariaRole: "",
  ariaLabel: "",
  deps: [],
  compositionParent: "",
  compositionChildren: "",
  viewport: "",
};

/* ── Serialize editor state → API request ──────────────────── */

export function serializeToApi(state: EditorState) {
  return {
    name: state.name,
    description: state.semanticDescription || undefined,
    taxonomy_level: state.atomLevel,
    status: state.status,
    aliases: state.aliases.map((a) => a.value).filter(Boolean),
    directives: state.semanticDescription || undefined,
    few_shot_examples: state.fewShots
      .filter((s) => s.prompt || s.payload)
      .map((s) => ({ prompt: s.prompt, payload: s.payload })),
    input_schema: {
      required: state.fields.filter((f) => f.required).map((f) => f.key).filter(Boolean),
      properties: Object.fromEntries(
        state.fields.filter((f) => f.key).map((f) => [
          f.key,
          {
            type: f.type === "enum" ? "string" : f.type,
            description: f.description || undefined,
            constraint: f.constraint || undefined,
            ...(f.type === "enum" && f.constraint
              ? { enum: f.constraint.split("|").map((s) => s.trim()) }
              : {}),
          },
        ]),
      ),
    },
    output_schema: state.outputSchema ? (() => { try { return JSON.parse(state.outputSchema); } catch { return { raw: state.outputSchema }; } })() : undefined,
    lifecycle_config: {
      mountPrerequisite: state.mountPrereq,
      streamMutable: state.streamMutable,
      phases: state.lifecycles
        .filter((l) => l.description || l.phase)
        .map((l) => ({
          phase: l.phase,
          async: l.async,
          description: l.description,
          cleanup: l.cleanup || undefined,
        })),
    },
    interactions: state.triggers
      .filter((t) => t.event || t.description)
      .map((t) => ({
        event: t.event,
        interrupt: t.interrupt,
        toolMapping: t.toolMapping,
        description: t.description,
      })),
    service_dependencies: state.deps
      .filter((d) => d.operationId || d.endpoint)
      .map((d) => ({
        operationId: d.operationId,
        method: d.method,
        endpoint: d.endpoint,
        authScope: d.authScope || undefined,
        fallback: d.fallback || undefined,
      })),
    composition_rules: {
      compositionParent: state.compositionParent,
      compositionChildren: state.compositionChildren,
      viewport: state.viewport,
      aria: { role: state.ariaRole, label: state.ariaLabel },
    },
    created_by: state.createdBy || undefined,
  };
}

/* ── Deserialize API component → editor state ──────────────── */

export function deserializeFromApi(component: ApiComponent): EditorState {
  const inputSchema = component.inputSchema as Record<string, unknown> | undefined;
  const lifecycleConfig = component.lifecycleConfig as Record<string, unknown> | undefined;
  const compositionRules = component.compositionRules as Record<string, unknown> | undefined;
  const aria = (compositionRules?.aria ?? {}) as Record<string, string>;

  return {
    name: component.name,
    atomLevel: component.taxonomyLevel ?? "Atom",
    status: component.status ?? "draft",
    createdBy: component.createdBy ?? "",
    aliases: (component.aliases ?? []).map((v) => ({ id: crypto.randomUUID(), value: v })),
    semanticDescription: component.directives ?? component.description ?? "",
    fewShots: ((component.fewShotExamples ?? []) as Array<{ prompt?: string; payload?: string }>).map((s) => ({
      id: crypto.randomUUID(),
      prompt: s.prompt ?? "",
      payload: s.payload ?? "",
    })),
    fields: (() => {
      const props = (inputSchema?.properties ?? {}) as Record<string, Record<string, unknown>>;
      const req = (inputSchema?.required ?? []) as string[];
      return Object.entries(props).map(([key, val]) => ({
        id: crypto.randomUUID(),
        key,
        type: (val.enum ? "enum" : (val.type as string)) ?? "string",
        required: req.includes(key),
        description: (val.description as string) ?? "",
        constraint: val.enum ? (val.enum as string[]).join("|") : (val.constraint as string) ?? "",
      }));
    })(),
    outputSchema: component.outputSchema ? JSON.stringify(component.outputSchema, null, 2) : "",
    lifecycles: ((lifecycleConfig?.phases ?? []) as Array<Record<string, unknown>>).map((l) => ({
      id: crypto.randomUUID(),
      phase: (l.phase as string) ?? "onMount",
      description: (l.description as string) ?? "",
      async: (l.async as boolean) ?? false,
      cleanup: (l.cleanup as string) ?? "",
    })),
    streamMutable: (lifecycleConfig?.streamMutable as boolean) ?? false,
    mountPrereq: (lifecycleConfig?.mountPrerequisite as string) ?? "none",
    triggers: ((component.interactions ?? []) as Array<Record<string, unknown>>).map((t) => ({
      id: crypto.randomUUID(),
      event: (t.event as string) ?? "onClick",
      interrupt: (t.interrupt as boolean) ?? false,
      description: (t.description as string) ?? "",
      toolMapping: (t.toolMapping as string) ?? "",
    })),
    ariaRole: aria.role ?? "",
    ariaLabel: aria.label ?? "",
    deps: ((component.serviceDependencies ?? []) as Array<Record<string, unknown>>).map((d) => ({
      id: crypto.randomUUID(),
      operationId: (d.operationId as string) ?? "",
      method: (d.method as string) ?? "GET",
      endpoint: (d.endpoint as string) ?? "",
      authScope: (d.authScope as string) ?? "",
      fallback: (d.fallback as string) ?? "",
    })),
    compositionParent: (compositionRules?.compositionParent as string) ?? "",
    compositionChildren: (compositionRules?.compositionChildren as string) ?? "",
    viewport: (compositionRules?.viewport as string) ?? "",
  };
}

/* ── Tab config ────────────────────────────────────────────── */

export type TabId = "semantic" | "schema" | "lifecycle" | "interactivity" | "dependencies" | "spatial" | "preview";

export const TAB_IDS: TabId[] = ["semantic", "schema", "lifecycle", "interactivity", "dependencies", "spatial", "preview"];

export interface TabConfig {
  id: TabId;
  label: string;
  short: string;
}

export const TABS: TabConfig[] = [
  { id: "semantic", label: "Semantic", short: "01" },
  { id: "schema", label: "Schema", short: "02" },
  { id: "lifecycle", label: "Lifecycle", short: "03" },
  { id: "interactivity", label: "Interaction", short: "04" },
  { id: "dependencies", label: "Dependencies", short: "05" },
  { id: "spatial", label: "Spatial", short: "06" },
  { id: "preview", label: "Preview", short: "07" },
];
